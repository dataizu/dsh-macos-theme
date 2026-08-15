// dsh-vision — permanent vision router (host face).
//
// Loaded as the row `dsh-vision` from the web profile's user patch layer
// (profiles/web/cordis.patch.yml). Host face: intercepts every model request
// through the llm/stream waterfall — when the request carries image blocks and
// the target model is not the selected vision model, images are recognized by
// the vision model and replaced with 【图片内容】text blocks (cached by
// attachment id). Also exposes /vision/models and /vision/setmodel HTTP routes
// for the browser face.

const name = "dsh-vision";
const inject = ["settings"];

const DEFAULT_PROMPT = "如果图中有文字,请完整提取图中所有文字(保持原有顺序和换行);如果图中没有文字或文字很少,请用两三句话简要描述图片内容。直接输出结果,不要加任何前缀或说明。";

// 自注册 `vision` 设置命名空间(仅当尚未注册;与 vision-settings 行共存时自动跳过)。
// 手写 schemastery 兼容对象:可调用用于 resolve,toJSON 用于 describe。
const visionSchema = Object.assign(
  (value) => ({
    provider: typeof (value && value.provider) === "string" ? value.provider : "",
    model: typeof (value && value.model) === "string" ? value.model : "",
  }),
  {
    toJSON: () => ({
      type: "object",
      properties: {
        provider: { type: "string" },
        model: { type: "string" },
      },
    }),
  },
);

function apply(ctx) {
  const llm = ctx.get("llm");
  if (!llm) return;

  try {
    ctx.settings.register("vision", visionSchema, {
      base: { provider: "", model: "" },
    });
  } catch (e) {
    // 已由其他行(如 vision-settings.mjs)注册,跳过。
  }

  let visionSelection = { provider: "", model: "" };
  let visionDefaultPicked = false;
  const imageTextCache = {};
  let inVisionCall = false;

  function mainProvider() {
    try {
      const svc = ctx.get("agentDefaultModel");
      if (svc && typeof svc.currentSelection === "function") {
        const sel = svc.currentSelection();
        if (sel && typeof sel.provider === "string" && sel.provider) return sel.provider;
      }
    } catch (e) {}
    try {
      const settings = ctx.get("settings");
      if (settings && typeof settings.get === "function") {
        const v = settings.get("agent-default-model");
        if (v && typeof v.provider === "string" && v.provider) return v.provider;
      }
    } catch (e) {}
    return "";
  }

  function loadSavedSelection() {
    try {
      const settings = ctx.get("settings");
      if (settings && typeof settings.get === "function") {
        const v = settings.get("vision");
        if (v && typeof v.provider === "string" && v.provider && typeof v.model === "string" && v.model) {
          visionSelection = { provider: v.provider, model: v.model };
          visionDefaultPicked = true;
        }
      }
    } catch (e) {}
  }
  loadSavedSelection();

  async function pickDefaultVision() {
    if (visionDefaultPicked) return;
    visionDefaultPicked = true;
    const mp = mainProvider();
    try {
      const providers = await llm.listProviders();
      for (const p of providers) {
        if (p.id === mp) continue;
        let models = [];
        try { models = await llm.listModels(p.id); } catch (e) { models = []; }
        const v = models.filter((m) => m.inputModalities && m.inputModalities.indexOf("image") >= 0)[0];
        if (v) { visionSelection = { provider: p.id, model: v.id }; return; }
      }
    } catch (e) {}
  }

  function stripThinking(text) {
    let s = String(text);
    s = s.replace(/<think>[\s\S]*?<\/think>/g, "");
    s = s.replace(/^\s*<think>[\s\S]*$/, "");
    s = s.replace(/\s*<\/think>/g, "");
    return s.trim();
  }

  async function recognizeRef(ref) {
    const message = {
      id: "vision-msg-" + Date.now(),
      role: "user",
      content: [
        { type: "text", text: DEFAULT_PROMPT },
        { type: "image", attachment: ref },
      ],
      source: { kind: "plugin", plugin: "dsh-vision" },
    };
    let text = "";
    let finError = "";
    inVisionCall = true;
    try {
      for await (const chunk of llm.stream({ provider: visionSelection.provider, model: visionSelection.model, messages: [message], maxTokens: 1024 })) {
        if (chunk && chunk.type === "text-delta") text += chunk.text;
        if (chunk && chunk.type === "finish" && chunk.reason && chunk.reason.kind === "error") {
          finError = (chunk.reason.failure && chunk.reason.failure.message) || "模型调用失败";
        }
      }
    } finally {
      inVisionCall = false;
    }
    const cleaned = stripThinking(text);
    return cleaned || ("(图片识别失败: " + (finError || "无输出") + ")");
  }

  ctx.on("llm/stream", function (options, next) {
    if (inVisionCall) return next();
    return (async function* () {
      const messages = options.messages;
      let hasImages = false;
      if (messages) {
        for (let mi = 0; mi < messages.length; mi++) {
          const m = messages[mi];
          if (m && m.content) {
            for (let i = 0; i < m.content.length; i++) {
              const b = m.content[i];
              if (b && b.type === "image") { hasImages = true; break; }
            }
          }
          if (hasImages) break;
        }
      }
      if (!hasImages) { for await (const c of next()) yield c; return; }
      await pickDefaultVision();
      const targetIsVision = visionSelection.provider !== "" && options.provider === visionSelection.provider && options.model === visionSelection.model;
      if (targetIsVision) { for await (const c of next()) yield c; return; }
      if (!visionSelection.provider || !visionSelection.model) { for await (const c of next()) yield c; return; }
      const rebuilt = [];
      for (let mi = 0; mi < messages.length; mi++) {
        const m = messages[mi];
        if (!m.content) { rebuilt.push(m); continue; }
        let has = false;
        for (let i = 0; i < m.content.length; i++) {
          const b = m.content[i];
          if (b && b.type === "image" && b.attachment && b.attachment.attachmentId) { has = true; break; }
        }
        if (!has) { rebuilt.push(m); continue; }
        const newContent = [];
        for (let i = 0; i < m.content.length; i++) {
          const b = m.content[i];
          if (b && b.type === "image" && b.attachment && b.attachment.attachmentId) {
            const aid = String(b.attachment.attachmentId);
            if (!(aid in imageTextCache)) imageTextCache[aid] = recognizeRef(b.attachment);
            const text = await imageTextCache[aid];
            newContent.push({ type: "text", text: "【图片内容】\n" + text });
          } else {
            newContent.push(b);
          }
        }
        rebuilt.push({ ...m, content: newContent });
      }
      const newOptions = { ...options, messages: rebuilt };
      for await (const c of llm.stream(newOptions)) yield c;
    })();
  });

  const webServer = ctx.get("webServer");
  if (webServer) {
    ctx.effect(() => webServer.register({
      kind: "exact",
      path: "/vision/models",
      handler: async (_req, res) => {
        try {
          const mp = mainProvider();
          const providers = [];
          const list = await llm.listProviders();
          for (const p of list) {
            if (p.id === mp) continue;
            let models = [];
            try { models = await llm.listModels(p.id); } catch (e) { models = []; }
            providers.push({
              id: String(p.id),
              name: String(p.name || p.id),
              models: models.map((m) => ({
                id: String(m.id),
                name: String(m.name || m.id),
                vision: !!(m.inputModalities && m.inputModalities.indexOf("image") >= 0),
              })),
            });
          }
          res.setHeader("content-type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ providers, mainProvider: mp, current: { provider: visionSelection.provider, model: visionSelection.model } }));
        } catch (e) {
          res.statusCode = 500;
          res.setHeader("content-type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ error: String((e && e.message) || e) }));
        }
      },
    }));
    ctx.effect(() => webServer.register({
      kind: "exact",
      path: "/vision/setmodel",
      handler: async (req, res) => {
        try {
          let body = "";
          for await (const chunk of req) body += chunk;
          const args = body ? JSON.parse(body) : {};
          const key = String((args && args.key) || "");
          const parts = key.split("|");
          if (parts.length === 2) {
            visionSelection = { provider: parts[0], model: parts[1] };
            try {
              const settings = ctx.get("settings");
              if (settings && typeof settings.update === "function") {
                await settings.update("vision", { provider: parts[0], model: parts[1] });
              }
            } catch (e) {}
            res.setHeader("content-type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ ok: true }));
          } else {
            res.statusCode = 400;
            res.setHeader("content-type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ ok: false, error: "invalid key" }));
          }
        } catch (e) {
          res.statusCode = 400;
          res.setHeader("content-type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ ok: false, error: String((e && e.message) || e) }));
        }
      },
    }));
  }
}

export { apply, inject, name };
