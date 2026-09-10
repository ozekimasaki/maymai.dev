import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { oxContent } from '@ox-content/vite-plugin';
import { theme } from './theme/index.ts';
import { likesDevPlugin } from './vite-likes-plugin.ts';
import { normalizeHtmlPaths } from './scripts/normalize-html-paths.mjs';

export default defineConfig({
  publicDir: 'public',
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      drafts: {
        customMedia: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssMinify: 'lightningcss',
    rollupOptions: {
      input: resolve('src/client.ts'),
      output: {
        entryFileNames: 'assets/client.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          const names = assetInfo.names ?? (assetInfo.name ? [assetInfo.name] : []);
          if (names.some((name) => name.endsWith('.css'))) {
            return 'assets/client.css';
          }
          return 'assets/[name][extname]';
        },
      },
    },
  },
  plugins: [
    likesDevPlugin(),
    ...oxContent({
      srcDir: 'content',
      outDir: 'dist',
      docs: false,
      search: false,
      ogViewer: false,
      embeds: false,
      highlight: false,
      linkTargetBlank: false,
      permalinks: true,
      publishState: true,
      siteMaps: {
        robots: true,
        llms: false,
      },
      collections: {
        works: 'works/*.md',
        blog: 'blog/*.md',
        mpNews: 'mayproject/news/*.md',
      },
      ssg: {
        enabled: true,
        render: theme,
        siteName: 'Maymai.dev',
        siteUrl: 'https://maymai.dev',
        lang: 'ja',
        clean: false,
        notFound: true,
      },
    }),
    {
      name: 'normalize-html-paths',
      apply: 'build',
      enforce: 'post',
      async closeBundle() {
        await normalizeHtmlPaths(resolve('dist'));
      },
    },
  ],
});
