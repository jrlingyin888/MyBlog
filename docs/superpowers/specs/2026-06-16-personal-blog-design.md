# 「慢一点」个人博客 · 设计文档

- 日期：2026-06-16
- 状态：已确认，待编写实现计划
- 项目目录：`/Users/jerrypop/Documents/JR/MyBlog`

---

## 1. 定位与目标

「慢一点」是一个**纯个人记录与分享**的博客。它是作者（Jerry）自己的地盘：想写就写，公开可分享，轻量好维护，不堆砌运营和复杂功能。

**身份**
- 主名：慢一点
- 标语：慢慢写，慢慢想 · by Jerry

**目标**
- 用 Markdown 舒服地写技术文章、生活随笔、零碎笔记
- 公开可访问、可被别人看到与订阅
- 完全属于自己的视觉风格（温暖杂志风）
- 写作与发布流程极简：写 `.md` → `git push` → 自动上线
- 长期低维护成本

**非目标（明确不做）**
- 不做面向流量/SEO 的重度运营机制
- 第一版不做：深色模式、评论、站内搜索（保留为未来增量）
- 不做后台 CMS / 数据库 / 用户系统

---

## 2. 技术架构

- **框架**：Astro（静态站点生成）
- **内容**：Astro Content Collections，文章为本地 `.md` 文件
- **构建产物**：纯静态 HTML/CSS，极少量 JS（仅导航等必要交互）
- **样式**：原生 CSS（CSS 变量管理主题色），不引入重型 UI 框架
- **代码高亮**：Astro 内置 Shiki，自定义一套「温暖深色」主题
- **托管/部署**：Vercel，连接 git 仓库后 `git push` 自动部署；后续可绑定自定义域名
- **包管理**：npm

**发布工作流**
1. 在 `src/content/posts/` 新建 `.md` 文件并写作
2. `git commit` + `git push`
3. Vercel 检测到 push，自动构建并上线

---

## 3. 内容模型

文章存放于 `src/content/posts/*.md`，通过 Content Collections 的 schema 校验 frontmatter。

```yaml
---
title:    "文章标题"          # 必填
date:     2026-06-14          # 必填，发布日期
category: "技术"             # 必填，单选：技术 | 随笔 | 笔记
tags:     ["astro", "mcp"]   # 可选，多个标签
excerpt:  "一句摘要"          # 可选；缺省时自动截取正文开头
draft:    false              # 可选，默认 false；true 则不发布
---

正文用 Markdown 编写……
```

**Schema 约束（`src/content/config.ts`）**
- `title`: string，必填
- `date`: date，必填
- `category`: enum `['技术', '随笔', '笔记']`，必填
- `tags`: string[]，可选，默认 `[]`
- `excerpt`: string，可选
- `draft`: boolean，可选，默认 `false`

**约定**
- slug 取自文件名（如 `write-an-mcp-server.md` → `/posts/write-an-mcp-server`），建议用英文短横线命名以获得干净 URL
- `draft: true` 的文章在构建时被排除
- 列表页按 `date` 倒序排列

---

## 4. 页面结构与路由

| 页面 | 路径 | 内容 |
|---|---|---|
| 首页 | `/` | 卡片网格，最新文章（混合全部分类），每张带分类彩签、日期、摘要 |
| 文章页 | `/posts/[slug]` | 衬线正文 + 温暖深色代码块；顶部含标题、日期、分类、标签 |
| 分类页 | `/category/[category]` | 某分类（技术/随笔/笔记）下的全部文章列表 |
| 标签页 | `/tags/[tag]` | 含某标签的全部文章；入口为文章内的标签 |
| 关于 | `/about` | 简单自我介绍（第一版放占位内容，后续丰富） |
| 归档 | `/archive` | 按年份分组列出全部文章 |
| RSS | `/rss.xml` | 订阅源，含全部已发布文章 |
| 404 | `/404` | 友好的未找到页 |

**导航栏**：`慢一点`（点击回首页） · 技术 · 随笔 · 笔记 · 关于

**页脚**：版权 / RSS 链接 / 归档链接 / （可选）GitHub 等社交链接

---

## 5. 视觉设计系统

**整体气质**：温暖杂志风，米色纸感，衬线为主，阅读优先，有人情味。

### 配色（CSS 变量）

| 用途 | 变量 | 色值 |
|---|---|---|
| 页面背景 | `--bg` | `#faf5ec` |
| 卡片/内容块背景 | `--surface` | `#fffdf8` |
| 主文字（墨色） | `--ink` | `#3a322a` |
| 正文文字 | `--text` | `#4a4036` |
| 次要文字 | `--muted` | `#8a7d6a` |
| 更浅辅助文字/日期 | `--faint` | `#b09a78` |
| 强调色（锈橙） | `--accent` | `#b5542f` |
| 分隔线 | `--border` | `#e6dcc8` |

**分类彩签配色**
- 技术：底 `#f4e4d4` / 字 `#b5542f`（锈橙）
- 随笔：底 `#e8ead6` / 字 `#6b7a3a`（橄榄绿）
- 笔记：底 `#dfe6ec` / 字 `#3a5e7a`（蓝灰）

### 字体
- 标题与正文：衬线 —— `Georgia, 'Songti SC', 'Noto Serif SC', serif`
- 代码与等宽点缀：`ui-monospace, 'SF Mono', Menlo, monospace`
- 标语等可用斜体衬线

### 关键组件
- **页头**：左侧「慢一点」大字衬线 + 斜体标语「慢慢写，慢慢想 · by Jerry」；右侧导航；下方一道暖色分隔线
- **首页文章卡**：圆角（约 14px）、`--surface` 背景、`--border` 细边；内容为「分类彩签 + 日期」「衬线标题」「两行摘要」；多列网格（桌面两列，手机单列）
- **文章正文**：衬线、行高约 1.85、舒适阅读宽度（约 680px）；行内代码用暖色小高亮 `底 #f0e6d6 / 字 #b5542f`
- **代码块**：见第 6 节

### 响应式
- 桌面：卡片两列；移动端：单列、导航收起为简洁排布
- 阅读宽度受限，保证长文舒适

---

## 6. 代码块规格（温暖深色）

- 容器背景：`#2b2521`（espresso），圆角 12px，柔和阴影
- 顶部条：三个 mac 窗口圆点（红 `#e06c5a` / 黄 `#e0b25a` / 绿 `#8aa86a`）+ 文件名（`#7d6f5e`，等宽）
- 语法高亮（自定义 Shiki 主题，暖色系）：
  - 普通文本：`#e8e0d4`
  - 关键字：`#d98a6a`（暖橙）
  - 字符串：`#a3b18a`（柔绿）
  - 注释：`#7d6f5e`（暖灰）
- 等宽字体，行高约 1.85，内边距约 16–18px

---

## 7. 第一版功能范围

**包含**
- ✅ 文章发布（Markdown + frontmatter）
- ✅ 首页卡片列表、文章页、分类页、标签页、关于页、归档页
- ✅ RSS 订阅（`/rss.xml`）
- ✅ 响应式（移动端友好）
- ✅ 站点基础 SEO（title/description/Open Graph 等 meta）

**未来增量（明确推迟，不影响当前架构）**
- ⏳ 深色模式切换（需另设计一套深色配色）
- ⏳ 评论（Giscus / GitHub Discussions）
- ⏳ 站内搜索（文章变多后再加）
- ⏳ 自定义域名绑定

---

## 8. 项目结构（预期）

```
MyBlog/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── public/                 # 静态资源（favicon、图片等）
├── src/
│   ├── content/
│   │   ├── config.ts       # Content Collections schema
│   │   └── posts/          # 文章 .md 文件
│   ├── components/         # Header, Footer, PostCard, CategoryBadge, BaseHead...
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── PostLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── archive.astro
│   │   ├── posts/[slug].astro
│   │   ├── category/[category].astro
│   │   ├── tags/[tag].astro
│   │   └── rss.xml.ts
│   └── styles/
│       └── global.css      # CSS 变量 + 全局样式
└── docs/superpowers/specs/ # 设计文档
```

---

## 9. 验收标准

- 在 `src/content/posts/` 放入示例文章后，本地 `npm run dev` 能正确渲染首页卡片、文章页、分类页、标签页、归档页、关于页
- 代码块呈现为规定的「温暖深色」样式与语法配色
- `/rss.xml` 输出合法、包含已发布文章
- `draft: true` 文章不出现在任何列表与 RSS
- 移动端布局正常（卡片单列、导航不溢出）
- 整体视觉符合温暖杂志风样板
- 推送到 Vercel 后能成功构建并访问

---

## 10. 待办 / 开放问题（不阻塞实现）

- 关于页正文内容（先放占位，后续由作者补充）
- 是否绑定自定义域名（部署后再定）
- favicon / 站点图标设计（可后补）
