import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { oxContent } from '@ox-content/vite-plugin';
import { theme } from './theme/index.ts';
import { likesDevPlugin } from './vite-likes-plugin.ts';
import { applyClientAssets } from './scripts/apply-client-assets.mjs';
import { normalizeHtmlPaths } from './scripts/normalize-html-paths.mjs';

const lightningTargets = {
  chrome: 123 << 16,
  firefox: 123 << 16,
  safari: 18 << 16,
};

export default defineConfig({
  publicDir: 'public',
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      drafts: {
        customMedia: true,
      },
      targets: lightningTargets,
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssMinify: 'lightningcss',
    cssCodeSplit: true,
    manifest: true,
    reportCompressedSize: false,
    modulePreload: {
      polyfill: false,
    },
    target: ['chrome123', 'firefox123', 'safari18'],
    cssTarget: ['chrome123', 'firefox123', 'safari18'],
    rolldownOptions: {
      input: {
        site: resolve('src/site-client.ts'),
        mp: resolve('src/mp-client.ts'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
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
        const outDir = resolve('dist');
        await applyClientAssets(outDir);
        await normalizeHtmlPaths(outDir);
      },
    },
  ],
});
