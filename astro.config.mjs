// @ts-check
import { defineConfig, sessionDrivers } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { d1, r2 } from '@emdash-cms/cloudflare';
import emdash, { local } from 'emdash/astro';
import { sqlite } from 'emdash/db';

const isBuild = process.argv.includes('build');

export default defineConfig({
  site: 'https://maymai.dev',
  output: 'server',
  adapter: isBuild ? cloudflare() : undefined,
  session: isBuild
    ? undefined
    : {
        driver: sessionDrivers.fs(),
      },
  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },
  integrations: [
    react(),
    emdash({
      database: isBuild ? d1({ binding: 'DB', session: 'auto' }) : sqlite({ url: 'file:./data.db' }),
      storage: isBuild
        ? r2({ binding: 'MEDIA' })
        : local({ directory: './.emdash/uploads', baseUrl: '/_emdash/api/media/file' }),
    }),
    sitemap({
      filter: (page) => !page.includes('/api/') && !page.includes('/_emdash/'),
    }),
  ],
  devToolbar: { enabled: false },
});
