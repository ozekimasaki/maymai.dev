/** @jsxImportSource @ox-content/vite-plugin */
import { each, usePageProps, useSiteConfig, type JSXNode, type ThemeProps } from '@ox-content/vite-plugin';
import { MpShell } from '../components/MpShell.tsx';
import {
  asString,
  canonicalUrl,
  getNewsPages,
  isoFromDotDate,
  NEWS_CATEGORY_COLORS,
  pagePath,
  SITE_URL,
} from '../lib/site.ts';

export function MayprojectNewsIndexLayout(_props: ThemeProps): JSXNode {
  const page = usePageProps();
  const site = useSiteConfig();
  const items = getNewsPages(site.pages);
  const pageUrl = canonicalUrl(page);
  const pageDescription = page.description || '桜草メイプロジェクトのお知らせ一覧です。キャラクター情報、イベント、更新情報をお届けします。';
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'お知らせ一覧',
      description: pageDescription,
      url: pageUrl,
      inLanguage: 'ja',
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
        { '@type': 'ListItem', position: 3, name: 'お知らせ', item: pageUrl },
      ],
    },
  ];

  return (
    <MpShell
      title={page.title || 'お知らせ一覧 — 桜草メイプロジェクト | Maymai.dev'}
      description={pageDescription}
      canonical={pageUrl}
      jsonLd={jsonLd}
      currentPath={pagePath(page)}
    >
      <div class="MpNewsPage">
        <div class="MpNewsPage__inner">
          <div class="MpNewsPage__header">
            <div class="MpNewsPage__titleBg">NEWS</div>
            <div class="MpNewsPage__titleWrap">
              <span class="MpNewsPage__titleBar"></span>
              <div class="MpNewsPage__titleGroup">
                <span class="MpNewsPage__titleEn">NEWS</span>
                <h1 class="MpNewsPage__titleJa">お知らせ</h1>
              </div>
            </div>
          </div>

          <ul class="MpNewsPage__list">
            {each(items, (item) => {
              const date = asString(item.frontmatter.date);
              const category = asString(item.frontmatter.category, 'INFO') as keyof typeof NEWS_CATEGORY_COLORS;
              const color = NEWS_CATEGORY_COLORS[category] ?? NEWS_CATEGORY_COLORS.INFO;
              return (
                <li class="MpNewsPage__item">
                  <a href={pagePath(item)} class="MpNewsPage__link">
                    <time class="MpNewsPage__date" datetime={isoFromDotDate(date)}>{date}</time>
                    <span class="MpNewsPage__badge" style={`background-color: ${color}`}>
                      {category}
                    </span>
                    <span class="MpNewsPage__title">{item.title}</span>
                    <span class="MpNewsPage__arrow">&rarr;</span>
                  </a>
                </li>
              );
            })}
          </ul>

          <div class="MpNewsPage__back">
            <a href="/mayproject/" class="MpNewsPage__backLink">&larr; トップに戻る</a>
          </div>
        </div>
      </div>
    </MpShell>
  );
}
