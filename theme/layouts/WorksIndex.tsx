/** @jsxImportSource @ox-content/vite-plugin */
import { each, usePageProps, useSiteConfig, type JSXNode, type ThemeProps } from '@ox-content/vite-plugin';
import { SiteShell } from '../components/SiteShell.tsx';
import { asString, canonicalUrl, getWorkPages, pagePath, SITE_URL } from '../lib/site.ts';

export function WorksIndexLayout(_props: ThemeProps): JSXNode {
  const page = usePageProps();
  const site = useSiteConfig();
  const works = getWorkPages(site.pages);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Products',
    description: 'GitHub で公開している個人開発プロダクト一覧です。',
    url: `${SITE_URL}/works/`,
    isPartOf: { '@type': 'WebSite', name: 'Maymai.dev', url: SITE_URL },
  };

  return (
    <SiteShell
      title={page.title || 'Products | Maymai.dev'}
      description={page.description || 'GitHub で公開している個人開発プロダクト一覧です。'}
      canonical={canonicalUrl(page)}
      jsonLd={jsonLd}
    >
      <section id="works" class="WorksPage">
        <div class="WorksPage__inner l-inner">
          <div class="WorksPage__header u-anime">
            <h1 class="WorksPage__heading">Products</h1>
            <span class="WorksPage__label">// Products.all()</span>
          </div>

          <div class="WorksPage__grid">
            {each(works, (work, i) => (
              <a href={pagePath(work)} class="WorksPage__card u-anime" style={`--delay: ${i * .1}s;`}>
                <div class="WorksPage__cardImage">
                  <img
                    src={asString(work.frontmatter.thumbnail)}
                    alt={work.title}
                    width="580"
                    height="360"
                    loading="lazy"
                  />
                </div>
                <div class="WorksPage__cardInfo">
                  <h2 class="WorksPage__cardTitle">{work.title}</h2>
                  <p class="WorksPage__cardCategory">{asString(work.frontmatter.category)}</p>
                  <p class="WorksPage__cardDescription">{asString(work.frontmatter.description)}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
