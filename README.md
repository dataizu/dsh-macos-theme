# DSH macOS Theme

给 [DeepSeek Harness](https://www.deepseek.com) Web GUI 用的 **macOS 风格主题 + 水中鲸鱼动态背景**。
适用于本地运行的 DeepSeek Harness Web 界面(默认 `http://127.0.0.1:3080`)。

## ✨ 效果一览

- **苹果风皮肤**:macOS 配色体系(明/暗双主题)、克制圆角、发丝边框、柔和阴影、毛玻璃菜单
- **Finder 式选中**:侧边栏会话选中行为实心蓝底白字
- **鲸鱼发送按钮**:官方鲸鱼剪影,空闲静态;**运行时头顶喷水 + 蓝色呼吸光环**
- **水母发光输入框**:运行中整圈呼吸光晕 + 流光环绕边框;发送瞬间白色闪光
- **磨砂对话区**:对话文字区 88% 半透明 + 20px 毛玻璃,背景动画柔化不干扰阅读
- **水中鲸鱼背景**:极淡水色渐变(底部透明)+ 上升气泡(水面爆开)+ 点阵鲸鱼巡游(S 形行进波、尾部大摆、受惊吐泡)
- **设置面板统一化**:28px macOS 下拉按钮、磨砂弹窗、蓝色选中态、主题立方体
- **轨迹视图**:彩色方框类型徽章、蓝色选中行
- 低开销:DPR 1.25、24fps 节流、窗口失焦/页面隐藏自动暂停、按钮动画按需绘制

## 📁 文件清单

| 文件 | 作用 |
| --- | --- |
| `index.html` | 页面入口:挂载两个 CSS + 水中鲸鱼背景脚本 + 发送按钮点阵鲸鱼脚本 |
| `apple-style.css` | macOS 皮肤全套(配色令牌、分区样式、水母发光、磨砂对话区) |
| `whale-icon.css` | 发送按钮鲸鱼图标与喷水动画 |
| `whale-path.txt` | DeepSeek 官方鲸鱼 SVG path(点阵采样的数据源) |
| `template.html` | index.html 模板(鲸鱼 path 用 `__WHALE_PATH__` 占位) |
| `reference/hero-whale.svg` | 官方 hero 鲸鱼 SVG 参考 |

## 🚀 安装方法

1. 找到 DeepSeek Harness 的 Web 前端目录,通常形如:

   ```
   <你的 DSH 部署目录>/node_modules/@deepseek-ai/dsh-web-frontend/dist/
   ```

2. 把本仓库的 `index.html`、`apple-style.css`、`whale-icon.css` 复制进该 `dist` 目录(覆盖)。
   - 如果你自己的 `dist/index.html` 有其他定制,也可以手动在其 `<head>` 中加两行:
     ```html
     <link rel="stylesheet" href="/whale-icon.css" />
     <link rel="stylesheet" href="/apple-style.css" />
     ```
     并把本仓库 `index.html` 底部 `<body>` 中的背景 `<script>...</script>` 块复制过去。

3. 刷新页面(`Ctrl+Shift+R` 硬刷新)即可生效。

> ⚠️ **升级 DSH 会覆盖 `dist` 目录**,升级后需要重新执行上述复制。
> 若修改过 CSS 后看不到效果,可在 `<link>` 后追加版本查询(如 `?v=2`)强制刷新缓存。

## 🎚️ 常见调参点

| 想调什么 | 在哪里 |
| --- | --- |
| 发送按钮喷水位置/大小 | `whale-icon.css` 中 `::before`(水柱)与 `::after`(水滴)的 `left/top/width/height` |
| 输入框发光强弱/流速 | `apple-style.css` 中 `dsh-jelly-breathe` / `dsh-jelly-flow` 关键帧 |
| 对话区毛玻璃透明度/模糊 | `apple-style.css` 中 `body .Md3f7G_scroll` |
| 背景气泡数量/大小/速度 | `index.html` 背景脚本中 `BUB_CAP`、`newBubble` 参数 |
| 鲸鱼游速/摆幅/受惊 | `index.html` 背景脚本中 `updateWhale` 与 `whaleWave` 相关参数 |
| 性能档位(DPR/帧率) | `index.html` 中 `DPR = Math.min(..., 1.25)` 与 `ts - lastT < 41` |

## 📄 许可与声明

- 样式与脚本代码:**MIT License**(见 `LICENSE`)。
- **DeepSeek 鲸鱼图形为 DeepSeek 官方资产**,版权归 DeepSeek 所有;本仓库仅用于个人主题美化,请勿商用。

---

English / 简体中文双语说明,欢迎 PR 与 Issue。
