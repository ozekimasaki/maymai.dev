/** @jsxImportSource @ox-content/vite-plugin */
import { raw, when, type JSXNode } from '@ox-content/vite-plugin';
import { MpHeader } from './MpHeader.tsx';
import { MpFooter } from './MpFooter.tsx';
import {
  MAYPROJECT_DESCRIPTION,
  MAYPROJECT_TITLE,
  SITE_NAME,
  SITE_URL,
  SPECULATION_RULES_JSON,
  type JsonLd,
  clientScriptSrc,
  clientStylesheetHref,
  isProdBuild,
} from '../lib/site.ts';

type MpShellProps = {
  title?: string;
  description?: string;
  canonical: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: 'website' | 'article';
  publishedTime?: string;
  jsonLd?: JsonLd | JsonLd[];
  shareOgWithProject?: boolean;
  currentPath?: string;
  preloadHero?: boolean;
  children?: JSXNode;
};

export function MpShell({
  title = MAYPROJECT_TITLE,
  description = MAYPROJECT_DESCRIPTION,
  canonical,
  ogImage = '/mayproject/og-image.png',
  ogTitle,
  ogDescription,
  ogType = 'website',
  publishedTime,
  jsonLd,
  shareOgWithProject = false,
  currentPath = '/mayproject/',
  preloadHero = false,
  children,
}: MpShellProps): JSXNode {
  const resolvedOgTitle = ogTitle ?? (shareOgWithProject ? MAYPROJECT_TITLE : title);
  const resolvedOgDescription = ogDescription ?? (shareOgWithProject ? MAYPROJECT_DESCRIPTION : description);
  const absoluteOgImage = ogImage.startsWith('http')
    ? ogImage
    : new URL(ogImage, SITE_URL).href;
  const jsonLdArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="format-detection" content="telephone=no" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta name="robots" content="index, follow" />
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#fff6f0" />

        <meta property="og:title" content={resolvedOgTitle} />
        <meta property="og:description" content={resolvedOgDescription} />
        <meta property="og:type" content={ogType} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={absoluteOgImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="ja_JP" />
        {when(Boolean(publishedTime), <meta property="article:published_time" content={publishedTime} />)}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@mei_999_" />
        <meta name="twitter:title" content={resolvedOgTitle} />
        <meta name="twitter:description" content={resolvedOgDescription} />
        <meta name="twitter:image" content={absoluteOgImage} />

        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="stylesheet" href="/fonts/zen-maru-gothic/fonts.css" />
        {when(preloadHero, <link rel="preload" as="image" href="/mayproject/img_mv_bg.avif" type="image/avif" media="(min-width: 768px)" fetchpriority="high" />)}
        {when(preloadHero, <link rel="preload" as="image" href="/mayproject/img_mv_bg_sp.avif" type="image/avif" media="(max-width: 767px)" fetchpriority="high" />)}
        {when(isProdBuild(), <link rel="stylesheet" href={clientStylesheetHref('mp')} />)}
        {when(!isProdBuild(), <script type="module" src="/@vite/client"></script>)}
        {raw(`<script type="speculationrules">${SPECULATION_RULES_JSON}</script>`)}
        {raw(jsonLdArray.map((ld) => `<script type="application/ld+json">${JSON.stringify(ld)}</script>`).join(''))}
      </head>
      <body class="MpBody">
        <MpHeader currentPath={currentPath} />
        <main>{children}</main>
        <MpFooter currentPath={currentPath} />

        <button
          class="MpPageTop"
          id="js-page-top"
          type="button"
          aria-label="ページの先頭へ戻る"
        >
          <svg class="MpPageTop__icon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M10 4L3 12h5v4h4v-4h5L10 4z" fill="currentColor" />
          </svg>
          <span class="MpPageTop__label">TOP</span>
        </button>
        <script type="module" src={clientScriptSrc('mp')}></script>
      </body>
    </html>
  );
}
