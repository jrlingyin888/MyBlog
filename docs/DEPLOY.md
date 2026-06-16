# 发布与部署

## 写一篇新文章
1. 在 `src/content/posts/` 新建 `<英文短横线命名>.md`（文件名即 URL slug）。
2. 填写 frontmatter：`title`、`date`、`category`（技术/随笔/笔记）、可选 `tags`/`excerpt`/`draft`。
3. 正文用 Markdown。代码块可加文件名：` ```ts title="src/foo.ts" `。
4. 本地预览：`npm run dev`。
5. 提交并推送：`git add . && git commit -m "post: ..." && git push`。
6. Vercel 自动构建并上线（约 1 分钟）。

## 草稿
`draft: true` 的文章不会出现在首页、分类、标签、归档或 RSS 中。

## 本地校验
- `npm test`  —— 逻辑单测
- `npm run check` —— 类型检查
- `npm run build` —— 生产构建

## 首次部署到 Vercel
1. 把仓库推到 GitHub（私有或公开均可）。
2. 在 Vercel 控制台 **Add New → Project → Import** 该仓库；框架会自动识别为 **Astro**（构建命令 `astro build`，输出目录 `dist`），无需额外配置或适配器。点击 **Deploy**。
3. 部署成功后，复制生产域名（如 `https://manyidian-blog.vercel.app`），把 `astro.config.mjs` 里的 `site` 占位 URL 改成它——这样 canonical、Open Graph、RSS、sitemap 的绝对链接才正确。提交并推送即可触发重新部署。
