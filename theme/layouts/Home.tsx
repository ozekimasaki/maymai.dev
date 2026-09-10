/** @jsxImportSource @ox-content/vite-plugin */
import { usePageProps, type JSXNode, type ThemeProps } from '@ox-content/vite-plugin';
import { SiteShell } from '../components/SiteShell.tsx';
import { HeroSection } from '../components/HeroSection.tsx';
import { AboutSection } from '../components/AboutSection.tsx';
import { SkillsSection } from '../components/SkillsSection.tsx';
import { WorksSection } from '../components/WorksSection.tsx';
import { BlogSection } from '../components/BlogSection.tsx';
import { ContactSection } from '../components/ContactSection.tsx';
import { SITE_URL, canonicalUrl } from '../lib/site.ts';

export function HomeLayout(_props: ThemeProps): JSXNode {
  const page = usePageProps();
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Maymai.dev',
      url: SITE_URL,
      description: 'AIの力をかりながら、しずかで心地よいデジタル体験をつくっています。',
      inLanguage: 'ja',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Masaki Ozeki',
      alternateName: 'Maymai',
      url: SITE_URL,
      jobTitle: 'Frontend Engineer',
      description: 'AIの力をかりながら、しずかで心地よいデジタル体験をつくるフロントエンドエンジニア。',
      sameAs: [
        'https://x.com/mei_999_',
        'https://github.com/ozekimasaki',
      ],
      knowsAbout: [
        'TypeScript', 'JavaScript', 'Astro', 'React', 'SCSS',
        'Cloudflare Workers', 'Vite', 'AI-assisted development',
      ],
    },
  ];

  return (
    <SiteShell
      title={page.title || 'Maymai.dev | Frontend Engineer'}
      description={page.description}
      canonical={canonicalUrl(page)}
      jsonLd={jsonLd}
    >
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <WorksSection />
      <BlogSection />
      <ContactSection />
    </SiteShell>
  );
}
