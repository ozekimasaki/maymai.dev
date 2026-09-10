/** @jsxImportSource @ox-content/vite-plugin */
import { raw, when, type JSXNode } from '@ox-content/vite-plugin';
import { Header } from './Header.tsx';
import { Footer } from './Footer.tsx';
import { Loading } from './Loading.tsx';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_URL,
  type JsonLd,
  clientScriptSrc,
  isProdBuild,
} from '../lib/site.ts';

type SiteShellProps = {
  title?: string;
  description?: string;
  canonical: string;
  ogType?: string;
  ogImage?: string;
  publishedTime?: string;
  modifiedTime?: string;
  jsonLd?: JsonLd | JsonLd[];
  children?: JSXNode;
};

export function SiteShell({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogType = 'website',
  ogImage = '/og-image.png',
  publishedTime,
  modifiedTime,
  jsonLd,
  children,
}: SiteShellProps): JSXNode {
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
        <meta name="theme-color" content="#fcfaf5" />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content={ogType} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={absoluteOgImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="ja_JP" />
        {when(Boolean(publishedTime), <meta property="article:published_time" content={publishedTime} />)}
        {when(Boolean(modifiedTime), <meta property="article:modified_time" content={modifiedTime} />)}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@mei_999_" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={absoluteOgImage} />

        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        {when(isProdBuild(), <link rel="stylesheet" href="/assets/client.css" />)}
        {when(!isProdBuild(), <script type="module" src="/@vite/client"></script>)}
        {raw(jsonLdArray.map((ld) => `<script type="application/ld+json">${JSON.stringify(ld)}</script>`).join(''))}
      </head>
      <body>
        <Loading />
        <Header />
        <main>{children}</main>
        <Footer />
        <script type="module" src={clientScriptSrc()}></script>
      </body>
    </html>
  );
}
