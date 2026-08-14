# DSH macOS Theme

给 [DeepSeek Harness](https://www.deepseek.com) Web GUI 用的 **macOS 风格主题 + 水中鲸鱼动态背景**。
适用于本地运行的 DeepSeek Harness Web 界面。

## ✨ 效果一览

- **水中鲸鱼背景**:极淡水色渐变(底部透明)+ 上升气泡(水面爆开)+ 点阵鲸鱼巡游(S 形行进波、尾部大摆、受惊吐泡)
- **鲸鱼发送按钮**:官方鲸鱼剪影,空闲静态;运行时头顶喷水 + 蓝色呼吸光环(选择器已做跨版本兼容)
- **苹果风皮肤**:macOS 配色(明/暗双主题)、克制圆角、毛玻璃菜单、Finder 式选中、水母发光输入框、磨砂对话区、设置面板统一化、轨迹彩色方框徽章
- 低开销:DPR 1.25、24fps、失焦/隐藏自动暂停、按钮动画按需绘制

## ⚠️ 版本兼容性(必读)

本主题分两部分,兼容性不同:

| 部分 | 跨 DSH 版本兼容性 |
| --- | --- |
| **背景动画 + 发送按钮鲸鱼**(index.html 脚本、whale-icon.css) | ✅ **任意版本可用**——只依赖稳定 DOM 特征(`data-composer-card` 属性、`_primary` 类后缀、canvas) |
| **皮肤样式 apple-style.css**(侧边栏/设置/轨迹等) | ⚠️ **依赖编译类名**——不同 DSH 版本的 CSS 类名哈希不同,可能部分或全部不生效 |

如果某部分皮肤没生效:在该页面按 F12 → 用选择器检查目标元素的实际类名(形如 `xYz123_row`),把 `apple-style.css` 中对应的哈希前缀替换成你版本里的前缀即可(类名后缀如 `_row` 是稳定的)。

## 🚀 安装方法

### 方法 A:补丁式安装(推荐,任意 DSH 版本)

1. 找到 DSH 的 Web 前端目录,通常形如:
   ```
   <你的 DSH 部署目录>/node_modules/@deepseek-ai/dsh-web-frontend/dist/
   ```
2. 复制 `apple-style.css`、`whale-icon.css` 到该 `dist` 目录。
3. 打开该目录下的 `index.html`(目标机器自己的,不要用本仓库的覆盖!),做两处修改:
   - 在 `<head>` 里加两行:
     ```html
     <link rel="stylesheet" href="/whale-icon.css" />
     <link rel="stylesheet" href="/apple-style.css" />
     ```
   - 把 `install/background-snippet.html` 里的整个 `<script>...</script>` 块复制到 `</body>` 之前。
4. 硬刷新(`Ctrl+Shift+R`)。

### 方法 B:整页覆盖(仅限与开发版本相同的 DSH 构建)

把 `same-version/index.html` 与两个 CSS 一起覆盖到 `dist`。
> 不同版本的 DSH 前端资源文件名不同,直接覆盖会导致界面无法加载——所以默认请不要用这个方法。

## 📁 文件清单

| 文件 | 作用 |
| --- | --- |
| `apple-style.css` | macOS 皮肤全套(配色、分区样式、水母发光、磨砂对话区) |
| `whale-icon.css` | 发送按钮鲸鱼图标与喷水动画(跨版本) |
| `install/background-snippet.html` | 背景动画脚本补丁(跨版本,拼进自己的 index.html) |
| `same-version/index.html` | 完整页面(仅同版本构建可用) |
| `whale-path.txt` | DeepSeek 官方鲸鱼 SVG path(点阵采样数据源) |
| `template.html` | index.html 模板(鲸鱼 path 用 `__WHALE_PATH__` 占位) |
| `reference/hero-whale.svg` | 官方 hero 鲸鱼 SVG 参考 |

## 🎚️ 常见调参点

| 想调什么 | 在哪里 |
| --- | --- |
| 发送按钮喷水位置/大小 | `whale-icon.css` 中 `::before`(水柱)与 `::after`(水滴)的 `left/top/width/height` |
| 输入框发光强弱/流速 | `apple-style.css` 中 `dsh-jelly-breathe` / `dsh-jelly-flow` 关键帧 |
| 对话区毛玻璃透明度/模糊 | `apple-style.css` 中 `body .Md3f7G_scroll` |
| 背景气泡数量/大小/速度 | `install/background-snippet.html` 脚本中 `BUB_CAP`、`newBubble` |
| 鲸鱼游速/摆幅/受惊 | 同脚本中 `updateWhale` 与 `whaleWave` 相关参数 |
| 性能档位(DPR/帧率) | 同脚本中 `DPR = Math.min(..., 1.25)` 与 `ts - lastT < 41` |

## 📄 许可与声明

- 样式与脚本代码:**MIT License**(见 `LICENSE`)。
- **DeepSeek 鲸鱼图形为 DeepSeek 官方资产**,版权归 DeepSeek 所有;本仓库仅用于个人主题美化,请勿商用。

---

English / 简体中文双语说明,欢迎 PR 与 Issue。
