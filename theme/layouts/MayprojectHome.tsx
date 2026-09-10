/** @jsxImportSource @ox-content/vite-plugin */
import { usePageProps, type JSXNode, type ThemeProps } from '@ox-content/vite-plugin';
import { MpShell } from '../components/MpShell.tsx';
import { MpMvSection } from '../components/MpMvSection.tsx';
import { MpNewsSection } from '../components/MpNewsSection.tsx';
import { MpAboutSection } from '../components/MpAboutSection.tsx';
import { MpGallerySection } from '../components/MpGallerySection.tsx';
import { MpCharacterSection } from '../components/MpCharacterSection.tsx';
import { MpReferenceSection } from '../components/MpReferenceSection.tsx';
import { MpContactSection } from '../components/MpContactSection.tsx';
import { MAYPROJECT_DESCRIPTION, SITE_URL, canonicalUrl, pagePath } from '../lib/site.ts';

export function MayprojectHomeLayout(_props: ThemeProps): JSXNode {
  const page = usePageProps();
  const pageUrl = canonicalUrl(page);
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: '桜草メイプロジェクト',
      url: pageUrl,
      description: MAYPROJECT_DESCRIPTION,
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
        { '@type': 'ListItem', position: 2, name: '桜草メイプロジェクト', item: pageUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: '桜草メイプロジェクト',
      url: pageUrl,
      description: MAYPROJECT_DESCRIPTION,
      genre: 'キャラクターIP',
      inLanguage: 'ja',
      author: {
        '@type': 'Person',
        name: 'Maymai',
        url: SITE_URL,
      },
      character: [
        { '@type': 'Person', name: '桜草メイ' },
        { '@type': 'Person', name: 'エレナ・グレース・アッシュフォード' },
        { '@type': 'Person', name: 'アイリス・ウェインライト' },
      ],
    },
  ];

  return (
    <MpShell
      title={page.title || '桜草メイプロジェクト | Maymai.dev'}
      description={page.description || MAYPROJECT_DESCRIPTION}
      canonical={pageUrl}
      jsonLd={jsonLd}
      currentPath={pagePath(page)}
      preloadHero={true}
    >
      <MpMvSection />
      <div class="MpSections">
        <MpNewsSection />
        <MpAboutSection />
        <MpGallerySection />
        <MpCharacterSection />
        <MpReferenceSection />
        <MpContactSection />
      </div>
    </MpShell>
  );
}
