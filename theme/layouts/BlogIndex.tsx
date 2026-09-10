/** @jsxImportSource @ox-content/vite-plugin */
import { each, when, usePageProps, useSiteConfig, type JSXNode, type ThemeProps } from '@ox-content/vite-plugin';
import { SiteShell } from '../components/SiteShell.tsx';
import { asString, canonicalUrl, getBlogPages, isoFromDotDate, pagePath, SITE_URL } from '../lib/site.ts';

export function BlogIndexLayout(_props: ThemeProps): JSXNode {
  const page = usePageProps();
  const site = useSiteConfig();
  const posts = getBlogPages(site.pages);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Blog',
    description: 'ブログ記事の一覧です。',
    url: `${SITE_URL}/blog/`,
    isPartOf: { '@type': 'WebSite', name: 'Maymai.dev', url: SITE_URL },
  };

  return (
    <SiteShell
      title={page.title || 'Blog | Maymai.dev'}
      description={page.description || 'ブログ記事の一覧です。'}
      canonical={canonicalUrl(page)}
      jsonLd={jsonLd}
    >
      <section id="blog" class="BlogPage">
        <div class="BlogPage__inner l-inner">
          <div class="BlogPage__header u-anime">
            <h1 class="BlogPage__heading">Blog</h1>
            <span class="BlogPage__label">// Blog.all()</span>
          </div>

          <ul class="BlogPage__list">
            {each(posts, (post, i) => {
              const date = asString(post.frontmatter.date);
              const description = asString(post.frontmatter.description);
              return (
                <li class="BlogPage__item u-anime" style={`--delay: ${i * .06}s;`}>
                  <a href={pagePath(post)} class="BlogPage__link">
                    <div class="BlogPage__thumb">
                      <img
                        src={asString(post.frontmatter.thumbnail, '/og-image.png')}
                        alt={post.title}
                        width="1200"
                        height="630"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div class="BlogPage__content">
                      <time class="BlogPage__date" datetime={isoFromDotDate(date)}>{date}</time>
                      <span class="BlogPage__title">{post.title}</span>
                      {when(Boolean(description), <p class="BlogPage__excerpt">{description}</p>)}
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </SiteShell>
  );
}
