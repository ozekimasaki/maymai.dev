// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://maymai.dev',
  // Preserve Astro 6 whitespace behavior between inline elements.
  compressHTML: true,
  // Project does not use Astro.session; avoid auto-injected SESSION KV.
  session: false,
  adapter: cloudflare({
    imageService: 'compile',
  }),
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/api/'),
    }),
  ],
});
