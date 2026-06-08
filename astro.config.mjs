// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://maymai.dev',
  experimental: {
    rustCompiler: true,
  },
  adapter: cloudflare({
    imageService: 'compile',
  }),
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/api/'),
    }),
  ],
});
