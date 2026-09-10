/** @jsxImportSource @ox-content/vite-plugin */
import { usePageProps, type JSXNode, type ThemeProps } from '@ox-content/vite-plugin';
import { MpShell } from '../components/MpShell.tsx';
import { MpGuidelines } from '../components/MpGuidelines.tsx';
import { SITE_URL, canonicalUrl, pagePath } from '../lib/site.ts';

export function MayprojectGuidelinesLayout(_props: ThemeProps): JSXNode {
  const page = usePageProps();
  const pageUrl = canonicalUrl(page);
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: '桜草メイプロジェクト', item: `${SITE_URL}/mayproject/` },
        { '@type': 'ListItem', position: 3, name: '二次創作ガイドライン', item: pageUrl },
      ],
    },
  ];

  return (
    <MpShell
      title={page.title || '二次創作ガイドライン — 桜草メイプロジェクト | Maymai.dev'}
      description={page.description || '桜草メイプロジェクトの二次創作ガイドラインです。キャラクターを使った創作活動のルールをご確認ください。'}
      canonical={pageUrl}
      jsonLd={jsonLd}
      shareOgWithProject
      currentPath={pagePath(page)}
    >
      <MpGuidelines />
    </MpShell>
  );
}
