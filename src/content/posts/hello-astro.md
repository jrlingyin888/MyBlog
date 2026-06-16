---
title: "用 Astro 搭一个慢博客"
date: 2026-06-14
category: "技术"
tags: ["astro", "blog"]
excerpt: "记录一次用 Astro 从零搭建静态博客的过程，以及为什么选它。"
---

我想要一个**写起来舒服、维护起来省心**的博客。Astro 的内容集合刚好合适。

下面是内容集合的 schema：

```ts title="src/content.config.ts"
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
});
```

就这么简单。
