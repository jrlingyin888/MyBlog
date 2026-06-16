import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// TODO(deploy): replace with the real Vercel/production URL after first deploy.
export default defineConfig({
  site: 'https://manyidian.vercel.app',
  integrations: [sitemap()],
});
