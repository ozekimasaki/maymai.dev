/** @jsxImportSource @ox-content/vite-plugin */
import { raw, usePageProps, type JSXNode, type ThemeProps } from '@ox-content/vite-plugin';
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

export function WorkDetailLayout({ children }: ThemeProps): JSXNode {
  const page = usePageProps();
  const pageUrl = canonicalUrl(page);
  const slug = pageSlug(page);
  const thumbnail = asString(page.frontmatter.thumbnail);
  const updated = asString(page.frontmatter.updated);
  const isoDate = isoFromDotDate(updated);
  const technologies = asStringArray(page.frontmatter.technologies);
  const repoUrl = asString(page.frontmatter.repoUrl);
  const description = asString(page.frontmatter.description, page.description ?? '');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: page.title,
    description,
    url: pageUrl,
    image: absoluteAssetUrl(thumbnail),
    codeRepository: repoUrl,
    dateModified: isoDate,
    author: {
      '@type': 'Person',
      name: 'Masaki Ozeki',
      url: SITE_URL,
    },
    keywords: technologies.join(', '),
  };

  return (
    <SiteShell
      title={`${page.title} | Products | Maymai.dev`}
      description={description}
      canonical={pageUrl}
      ogType="article"
      ogImage={thumbnail}
      modifiedTime={isoDate}
      jsonLd={jsonLd}
    >
      <article class="WorkDetail">
        <div class="WorkDetail__inner l-inner">
          <div class="WorkDetail__header u-anime">
            <p class="WorkDetail__category">{asString(page.frontmatter.category)}</p>
            <h1 class="WorkDetail__title">{page.title}</h1>
            <p class="WorkDetail__description">{description}</p>
          </div>

          <div class="WorkDetail__meta u-anime" style="--delay: .1s;">
            <div class="WorkDetail__metaItem">
              <dt class="WorkDetail__metaKey">updated:</dt>
              <dd class="WorkDetail__metaValue">{updated}</dd>
            </div>
            <div class="WorkDetail__metaItem">
              <dt class="WorkDetail__metaKey">technologies:</dt>
              <dd class="WorkDetail__metaValue">{technologies.join(' / ')}</dd>
            </div>
            <div class="WorkDetail__metaItem">
              <dt class="WorkDetail__metaKey">repository:</dt>
              <dd class="WorkDetail__metaValue">
                <a href={repoUrl} target="_blank" rel="noopener nofollow">{repoUrl}</a>
              </dd>
            </div>
          </div>

          <div class="WorkDetail__thumbnail u-anime" style="--delay: .2s;">
            <img src={thumbnail} alt={page.title} width="1182" height="680" />
          </div>

          <div class="WorkDetail__body u-anime" style="--delay: .15s;">
            {children ?? raw(page.html)}
          </div>

          <div class="WorkDetail__actions u-anime" style="--delay: .2s;">
            <a href={repoUrl} class="WorkDetail__repoLink" target="_blank" rel="noopener nofollow">
              View on GitHub
            </a>
            <ShareButtons url={pageUrl} title={page.title} />
            <LikeButton type="works" slug={slug} />
          </div>

          <div class="WorkDetail__back">
            <a href="/works/" class="WorkDetail__backLink">&larr; Products 一覧にもどる</a>
          </div>
        </div>
      </article>
    </SiteShell>
  );
}
