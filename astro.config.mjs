import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import warmTheme from './src/styles/shiki-warm.json' with { type: 'json' };

/** Adds [data-warm-code] to every code block and [data-filename] when the
 *  fence has a `title="..."` meta, e.g. ```ts title="src/foo.ts" */
function warmCodeTransformer() {
  return {
    name: 'warm-code',
    pre(node) {
      node.properties['data-warm-code'] = '';
      const raw = this.options?.meta?.__raw ?? '';
      const match = raw.match(/title="([^"]+)"/);
      if (match) node.properties['data-filename'] = match[1];
    },
  };
}

// Production URL (Vercel). Update here if the domain changes.
export default defineConfig({
  site: 'https://manyidian.vercel.app',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: warmTheme,
      wrap: false,
      transformers: [warmCodeTransformer()],
    },
  },
});
