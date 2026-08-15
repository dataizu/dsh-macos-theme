window.__ModuleLoader__.load({
  id: "dsh-vision",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    var react = require("react");

    const CSS = ".dsh-vision-root{min-width:0;position:relative}" +
      ".dsh-vision-trigger{min-width:0;max-width:220px;height:28px;color:var(--dsw-alias-label-secondary,#545458);cursor:pointer;background:transparent;border:none;border-radius:24px;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:13px;font-weight:500;line-height:20px;display:flex;font-family:inherit}" +
      ".dsh-vision-trigger:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,0.05))}" +
      ".dsh-vision-label{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}" +
      ".dsh-vision-chevron{color:var(--dsw-alias-label-caption,#A9A9B0);flex:none;font-size:11px}" +
      ".dsh-vision-menu{z-index:20;border:1px solid var(--dsw-alias-border-inverted,rgba(0,0,0,0.1));background:var(--dsw-specific-menu,#FFFFFF);width:min(260px,100vw - 32px);max-height:min(340px,100vh - 96px);box-shadow:var(--dsw-shadow-lv3,0 12px 36px rgba(0,0,0,0.18));color:var(--dsw-alias-label-primary,#1D1D1F);border-radius:12px;flex-direction:column;padding:4px;display:flex;position:absolute;bottom:calc(100% + 8px);right:0;overflow:auto}" +
      ".dsh-vision-group-title{color:var(--dsw-alias-label-tertiary,#A9A9B0);font-size:11px;padding:6px 8px 2px}" +
      ".dsh-vision-option{border-radius:8px;cursor:pointer;justify-content:space-between;align-items:center;gap:8px;padding:6px 8px;display:flex}" +
      ".dsh-vision-option:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,0.05))}" +
      ".dsh-vision-option-copy{min-width:0;flex:1}" +
      ".dsh-vision-model-name{font-size:13px;line-height:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      ".dsh-vision-model-desc{color:var(--dsw-alias-label-tertiary,#A9A9B0);font-size:11px;line-height:16px}" +
      ".dsh-vision-selected{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,0.05))}" +
      ".dsh-vision-selected .dsh-vision-model-name{color:var(--dsw-alias-state-business-primary,#0A60FF)}" +
      ".dsh-vision-check{color:var(--dsw-alias-state-business-primary,#0A60FF);flex:none;font-size:13px}" +
      ".dsh-vision-empty{color:var(--dsw-alias-label-tertiary,#A9A9B0);padding:10px;font-size:13px;line-height:20px}" +
      ".dsh-vision-menu-note{padding:8px;color:var(--dsw-alias-label-tertiary,#A9A9B0);font-size:11.5px;border-top:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.08));margin-top:4px}" +
      ".dsh-vision-select{flex:none;height:26px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.12));background:var(--dsw-alias-bg-layer-1,#FFFFFF);font-size:12.5px;color:inherit;padding:0 6px;max-width:180px}" +
      ".dsh-vision-s-select{max-width:none;width:100%;height:30px}" +
      ".dsh-vision-row{display:flex;gap:8px}" +
      ".dsh-vision-btn{flex:1;height:32px;border-radius:10px;border:none;cursor:pointer;font-size:13px;font-family:inherit}" +
      ".dsh-vision-btn-primary{background:#0A60FF;color:#FFFFFF}" +
      ".dsh-vision-btn-ghost{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,0.05));color:inherit}" +
      ".dsh-vision-settings{display:flex;flex-direction:column;gap:12px;max-width:560px;font-size:14px;color:var(--dsw-alias-label-primary,#1D1D1F)}" +
      ".dsh-vision-s-title{font-size:17px;font-weight:600}" +
      ".dsh-vision-s-desc{color:var(--dsw-alias-label-secondary,#545458);font-size:13px;line-height:1.6}" +
      ".dsh-vision-saved{font-size:13px;color:var(--dsw-alias-state-success-primary,#34C759);align-self:center}";

    function apply(ctx) {
      const slots = ctx.get("slots");
      if (slots === undefined) return;

      const store = { menuOpen: false, modelKey: "", providers: [], loaded: false, saved: false, mainProvider: "" };
      const listeners = [];
      const emit = () => { for (let i = 0; i < listeners.length; i++) { try { listeners[i](); } catch (e) {} } };
      const set = (patch) => { Object.assign(store, patch); emit(); };

      function useStore() {
        const [, force] = react.useState(0);
        react.useEffect(() => {
          const l = () => force((n) => n + 1);
          listeners.push(l);
          return () => { const i = listeners.indexOf(l); if (i >= 0) listeners.splice(i, 1); };
        }, []);
        return store;
      }

      function sendSelection(key) {
        const k = key || store.modelKey;
        if (!k) return;
        try {
          fetch("/vision/setmodel", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ key: k }),
          }).catch(() => {});
        } catch (e) {}
      }

      async function loadModels() {
        if (store.loaded) return;
        try {
          const res = await fetch("/vision/models").then((r) => r.json());
          const providers = (res && res.providers) || [];
          const mainProvider = String((res && res.mainProvider) || "");
          const flat = [];
          for (let i = 0; i < providers.length; i++) {
            const p = providers[i];
            for (let j = 0; j < p.models.length; j++) {
              flat.push({ key: p.id + "|" + p.models[j].id, label: p.name + " · " + p.models[j].name, vision: !!p.models[j].vision, provider: p.id, model: p.models[j].id });
            }
          }
          const cur = res && res.current;
          if (!store.modelKey && cur && cur.provider && cur.model) {
            store.modelKey = cur.provider + "|" + cur.model;
          }
          if (!store.modelKey) {
            const candidates = flat.filter((m) => m.vision && m.provider !== mainProvider);
            const pick = candidates[0] || flat.filter((m) => m.vision)[0];
            if (pick) store.modelKey = pick.key;
          }
          set({ providers: flat, loaded: true, mainProvider: mainProvider });
          sendSelection();
        } catch (e) {
          set({ loaded: true });
        }
      }

      function modelShort(key) {
        const parts = String(key || "").split("|");
        return parts.length === 2 ? parts[1] : (key || "");
      }

      function VisionTrigger() {
        const st = useStore();
        react.useEffect(() => { loadModels(); }, []);
        return react.createElement("div", { className: "dsh-vision-root" },
          react.createElement("button", {
            type: "button",
            className: "dsh-vision-trigger",
            title: st.modelKey ? ("识图模型:" + st.modelKey + "。发送图片时自动交给它识别,对话里图片照常显示") : "选择识图模型;发送图片时自动识别",
            onMouseDown: (e) => e.stopPropagation(),
            onClick: () => set({ menuOpen: !st.menuOpen }),
          },
            react.createElement("span", { className: "dsh-vision-label" }, st.modelKey ? "识图 · " + modelShort(st.modelKey) : "识图"),
            react.createElement("span", { className: "dsh-vision-chevron" }, st.menuOpen ? "▴" : "▾")
          ),
          st.menuOpen ? react.createElement(VisionMenu) : null
        );
      }

      function VisionMenu() {
        const st = useStore();
        const visionModels = st.providers.filter((m) => m.vision);
        const byProv = {};
        for (let i = 0; i < visionModels.length; i++) {
          const m = visionModels[i];
          if (!byProv[m.provider]) byProv[m.provider] = [];
          byProv[m.provider].push(m);
        }
        const keys = Object.keys(byProv);
        return react.createElement("div", {
          className: "dsh-vision-menu",
          onMouseDown: (e) => e.stopPropagation(),
        },
          keys.map((k) => react.createElement("div", { key: k, className: "dsh-vision-group" },
            react.createElement("div", { className: "dsh-vision-group-title" }, k),
            byProv[k].map((m) => react.createElement("div", {
              key: m.key,
              className: "dsh-vision-option" + (st.modelKey === m.key ? " dsh-vision-selected" : ""),
              onClick: () => { set({ modelKey: m.key, menuOpen: false }); sendSelection(m.key); },
            },
              react.createElement("div", { className: "dsh-vision-option-copy" },
                react.createElement("div", { className: "dsh-vision-model-name" }, m.label),
                react.createElement("div", { className: "dsh-vision-model-desc" }, "支持图片输入")
              ),
              st.modelKey === m.key ? react.createElement("span", { className: "dsh-vision-check" }, "✓") : null
            ))
          )),
          visionModels.length === 0 ? react.createElement("div", { className: "dsh-vision-empty" }, "没有可用模型:请先在 DSH 模型设置里配置支持图片的模型") : null,
          react.createElement("div", { className: "dsh-vision-menu-note" }, "选好后照常发图片:粘贴/拖进输入框 → 发送,识别在后台自动完成。")
        );
      }

      function VisionSettings(props) {
        const st = useStore();
        react.useEffect(() => { loadModels(); }, []);
        const visionModels = st.providers.filter((m) => m.vision);
        const byProv = {};
        for (let i = 0; i < visionModels.length; i++) {
          const m = visionModels[i];
          if (!byProv[m.provider]) byProv[m.provider] = [];
          byProv[m.provider].push(m);
        }
        const keys = Object.keys(byProv);
        return react.createElement("div", { className: "dsh-vision-settings" },
          react.createElement("div", { className: "dsh-vision-s-title" }, "识图模型"),
          react.createElement("div", { className: "dsh-vision-s-desc" }, "发送图片时,自动用这里的模型识别图片内容并转成文字交给当前对话模型;对话里图片消息照常显示,不影响正常聊天。选择会自动保存,重启后仍然有效。"),
          react.createElement("select", {
            className: "dsh-vision-select dsh-vision-s-select",
            value: st.modelKey,
            onChange: (e) => {
              const k = e.target.value;
              set({ modelKey: k, saved: false });
              sendSelection(k);
            },
          },
            react.createElement("option", { value: "" }, visionModels.length ? "选择识图模型…" : "无可用模型"),
            keys.map((k) => react.createElement("optgroup", { key: k, label: k },
              byProv[k].map((m) => react.createElement("option", { key: m.key, value: m.key }, m.label))
            ))
          ),
          react.createElement("div", { className: "dsh-vision-row", style: { marginTop: 10 } },
            react.createElement("button", { type: "button", className: "dsh-vision-btn dsh-vision-btn-primary", style: { flex: "none", padding: "0 16px" }, onClick: () => set({ saved: true }) }, "保存"),
            st.saved ? react.createElement("span", { className: "dsh-vision-saved" }, "已记录(运行期间有效)✓") : null,
            props && props.close ? react.createElement("button", { type: "button", className: "dsh-vision-btn dsh-vision-btn-ghost", style: { flex: "none", padding: "0 16px" }, onClick: () => props.close() }, "完成") : null
          )
        );
      }

      // 样式注入(随插件卸载清理)
      if (typeof document !== "undefined" && document.head) {
        ctx.effect(() => {
          const el = document.createElement("style");
          el.setAttribute("data-dsh-vision", "1");
          el.textContent = CSS;
          document.head.appendChild(el);
          return () => { if (el.parentNode) el.parentNode.removeChild(el); };
        });
      }

      slots.inject("conversation.input.right", () => slots.register(
        { name: "conversation.input.right", id: "vision-trigger", order: 0, label: "识图" },
        () => react.createElement(VisionTrigger),
      ));
      slots.inject("settings.section", () => slots.register(
        { name: "settings.section", id: "vision-settings", order: 12, label: "识图" },
        (props) => react.createElement(VisionSettings, props),
      ));
    }

    exports.apply = apply;
    return module.exports;
  }
});
