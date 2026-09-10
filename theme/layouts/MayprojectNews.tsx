/** @jsxImportSource @ox-content/vite-plugin */
import { raw, usePageProps, type JSXNode, type ThemeProps } from '@ox-content/vite-plugin';
import { MpShell } from '../components/MpShell.tsx';
import {
  asString,
  canonicalUrl,
  isoFromDotDate,
  NEWS_CATEGORY_COLORS,
  pagePath,
  SITE_URL,
} from '../lib/site.ts';

export function MayprojectNewsLayout({ children }: ThemeProps): JSXNode {
  const page = usePageProps();
  const pageUrl = canonicalUrl(page);
  const date = asString(page.frontmatter.date);
  const isoDate = isoFromDotDate(date);
  const category = asString(page.frontmatter.category, 'INFO') as keyof typeof NEWS_CATEGORY_COLORS;
  const color = NEWS_CATEGORY_COLORS[category] ?? NEWS_CATEGORY_COLORS.INFO;
  const bodyHtml = page.html;
  const firstParagraph = asString(page.description, bodyHtml.replace(/<[^>]+>/g, ' ').trim().slice(0, 120));

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: page.title,
      datePublished: isoDate,
      url: pageUrl,
      description: firstParagraph,
      inLanguage: 'ja',
      author: {
        '@type': 'Person',
        name: 'Maymai',
        url: SITE_URL,
      },
      publisher: {
        '@type': 'Organization',
        name: '桜草メイプロジェクト',
        url: `${SITE_URL}/mayproject/`,
      },
      isPartOf: {
        '@type': 'WebSite',
        name: 'Maymai.dev',
        url: SITE_URL,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: '桜草メイプロジェクト', item: `${SITE_URL}/mayproject/` },
        { '@type': 'ListItem', position: 3, name: 'お知らせ', item: `${SITE_URL}/mayproject/news/` },
        { '@type': 'ListItem', position: 4, name: page.title, item: pageUrl },
      ],
    },
  ];

  return (
    <MpShell
      title={`${page.title} — 桜草メイプロジェクト | Maymai.dev`}
      description={firstParagraph}
      canonical={pageUrl}
      ogType="article"
      publishedTime={isoDate}
      jsonLd={jsonLd}
      currentPath={pagePath(page)}
    >
      <article class="MpNewsDetail">
        <div class="MpNewsDetail__inner">
          <div class="MpNewsDetail__meta">
            <time class="MpNewsDetail__date" datetime={isoDate}>{date}</time>
            <span class="MpNewsDetail__badge" style={`background-color: ${color}`}>
              {category}
            </span>
          </div>

          <h1 class="MpNewsDetail__heading">{page.title}</h1>

          <div class="MpNewsDetail__body">
            {children ?? raw(bodyHtml)}
          </div>

          <div class="MpNewsDetail__nav">
            <a href="/mayproject/news/" class="MpNewsDetail__navLink">&larr; お知らせ一覧に戻る</a>
            <a href="/mayproject/" class="MpNewsDetail__navLink">&larr; トップに戻る</a>
          </div>
        </div>
      </article>
    </MpShell>
  );
}
