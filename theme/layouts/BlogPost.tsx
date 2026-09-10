/** @jsxImportSource @ox-content/vite-plugin */
import { each, raw, when, usePageProps, type JSXNode, type ThemeProps } from '@ox-content/vite-plugin';
import { SiteShell } from '../components/SiteShell.tsx';
import { ShareButtons } from '../components/ShareButtons.tsx';
import { LikeButton } from '../components/LikeButton.tsx';
import {
  asString,
  asStringArray,
  absoluteAssetUrl,
  canonicalUrl,
  isoFromDotDate,
  pageSlug,
  SITE_URL,
} from '../lib/site.ts';

export function BlogPostLayout({ children }: ThemeProps): JSXNode {
  const page = usePageProps();
  const pageUrl = canonicalUrl(page);
  const slug = pageSlug(page);
  const date = asString(page.frontmatter.date);
  const isoDate = isoFromDotDate(date);
  const tags = asStringArray(page.frontmatter.tags);
  const description = asString(page.frontmatter.description, page.description ?? '');
  const thumbnail = asString(page.frontmatter.thumbnail, '/og-image.png');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: page.title,
    description,
    url: pageUrl,
    image: absoluteAssetUrl(thumbnail),
    datePublished: isoDate,
    author: {
      '@type': 'Person',
      name: 'Masaki Ozeki',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Person',
      name: 'Masaki Ozeki',
      url: SITE_URL,
    },
    inLanguage: 'ja',
    ...(tags.length > 0 ? { keywords: tags.join(', ') } : {}),
  };

  return (
    <SiteShell
      title={`${page.title} | Blog | Maymai.dev`}
      description={description}
      canonical={pageUrl}
      ogType="article"
      ogImage={thumbnail}
      publishedTime={isoDate}
      jsonLd={jsonLd}
    >
      <article class="BlogPost">
        <div class="BlogPost__inner l-inner">
          <div class="BlogPost__header u-anime">
            <time class="BlogPost__date" datetime={isoDate}>
              {date}
            </time>
            <h1 class="BlogPost__title">{page.title}</h1>
            {when(tags.length > 0, (
              <ul class="BlogPost__tags">
                {each(tags, (tag) => (
                  <li class="BlogPost__tag">{tag}</li>
                ))}
              </ul>
            ))}
          </div>

          <div class="BlogPost__thumbnail u-anime" style="--delay: .08s;">
            <img src={thumbnail} alt={page.title} width="1200" height="630" decoding="async" />
          </div>

          <div class="BlogPost__body u-anime" style="--delay: .1s;">
            {children ?? raw(page.html)}
          </div>

          <div class="BlogPost__actions u-anime" style="--delay: .15s;">
            <ShareButtons url={pageUrl} title={page.title} />
            <LikeButton type="blog" slug={slug} />
          </div>

          <div class="BlogPost__back">
            <a href="/blog/" class="BlogPost__backLink">&larr; Blog 一覧にもどる</a>
          </div>
        </div>
      </article>
    </SiteShell>
  );
}
