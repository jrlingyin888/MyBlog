# 发布与部署

## 写一篇新文章
1. 在 `src/content/posts/` 新建 `<英文短横线命名>.md`（文件名即 URL slug）。
2. 填写 frontmatter：`title`、`date`、`category`（技术/随笔/笔记）、可选 `tags`/`excerpt`/`draft`。
3. 正文用 Markdown。代码块可加文件名：` ```ts title="src/foo.ts" `。
4. 本地预览：`npm run dev`。
5. 提交并推送：`git add . && git commit -m "post: ..." && git push`。
6. Vercel 自动构建并上线（约 1 分钟）。

## 在文章里放图片和 SVG
正文支持三种方式（均已验证可用，Astro 的 `.md` 默认原样渲染 HTML，无需 `rehype-raw` 等插件）：

```markdown
图片：       ![描述](/images/photo.jpg)      ← 图片文件放在 public/images/（自建该目录）
网图：       ![描述](https://example.com/x.png)
内联 SVG：   直接把 <svg>…</svg> 粘进正文      ← 适合图标、示意图，可无损缩放
SVG 当图片： ![描述](/images/diagram.svg)
```

- 图片样式（最大宽度 100%、圆角）已在 `src/styles/global.css` 的 `.post-body img` 写好，自动适配。
- 摘要规则：未填 `excerpt` 时自动从正文生成，并会**自动剥离内联 SVG / HTML / 代码块**，不会把源码漏进首页卡片、网页描述或 RSS。想自定义摘要时，填 `excerpt:` 优先生效。

## 草稿
`draft: true` 的文章不会出现在首页、分类、标签、归档或 RSS 中。

## 本地校验
- `npm test`  —— 逻辑单测
- `npm run check` —— 类型检查
- `npm run build` —— 生产构建

## 推送到 GitHub（重要：用 HTTPS，不要用 SSH）
本机有代理（fake-IP，把 github.com 映射到 `198.18.x`）会**封掉 SSH 的 22 端口**，所以 `git@github.com` 的 SSH 推送会失败：
`Connection closed by 198.18.0.9 port 22 / Could not read from remote repository`。

HTTPS（443）走代理是通的。一次性配置好即可：
```bash
git remote set-url origin https://github.com/jrlingyin888/MyBlog.git
gh auth login          # 选 GitHub.com → HTTPS → Login with a web browser（已登录为 jrlingyin888）
git push               # 之后 gh 提供凭据，无需再输密码
```
> 备选：若坚持用 SSH，可在 `~/.ssh/config` 配置走 443 端口绕过封锁
> （`Host github.com / HostName ssh.github.com / Port 443`）。

## 首次部署到 Vercel
1. 把仓库推到 GitHub（私有或公开均可，见上一节）。
2. 在 Vercel 控制台 **Add New → Project → Import** 该仓库；框架自动识别为 **Astro**（构建命令 `astro build`，输出目录 `dist`），无需额外配置或适配器。点击 **Deploy**。
3. 部署成功后，把 `astro.config.mjs` 里的 `site` 改成你的生产域名（见下一节），提交推送即触发重新部署——这样 canonical、Open Graph、RSS、sitemap 的绝对链接才正确。

## 修改网站地址
当前线上地址以 `astro.config.mjs` 的 `site` 为准。要换成更好记的地址：

- **免费 `*.vercel.app` 子域名**（两种入口任选）：
  - 改项目名：Vercel 项目 → **Settings → General → Project Name**，改成如 `manyidian` 后 Save（“OpenID Connect” 那条警告对纯静态站无影响，可忽略）。
  - 加域名：项目顶部 **Domains** 标签（不在 Settings 里）→ **Add Existing** → 输入 `manyidian.vercel.app` → 添加并设为 Production。**不要点红色 Remove**（会删掉当前线上域名）。
- **自定义域名**（付费）：自己买域名 → Domains → **Add Existing** → 按提示在域名商配 DNS，Vercel 自动签发 HTTPS。
- 换好后：把新域名写进 `astro.config.mjs` 的 `site`，`commit` + `push`。

> 注意：旧的随机域名（如 `my-blog-two-tau-21.vercel.app`）不会因改名而消失，它会继续指向项目；可在 Domains 里删除或保留。

## 网站图标 favicon
图标文件是 `public/favicon.svg`，直接改它再推送即可更新。浏览器对 favicon 缓存很顽固，部署后用 `Cmd+Shift+R` 强刷，或开无痕窗口/重开标签页才看得到新图标。
