import type { BasePageProps } from '@ox-content/vite-plugin';

export const SITE_URL = 'https://maymai.dev';
export const SITE_NAME = 'Maymai.dev';
export const DEFAULT_DESCRIPTION = 'AIの力をかりながら、しずかで心地よいデジタル体験をつくっています。';
export const DEFAULT_TITLE = 'Maymai.dev | Frontend Engineer';
export const MAYPROJECT_TITLE = '桜草メイプロジェクト | Maymai.dev';
export const MAYPROJECT_DESCRIPTION = 'ロンドン郊外の古い屋敷で紡がれる、静かで温かい日々の物語。暮らしは、手をかけたぶんだけやさしくなる。';

export type JsonLd = Record<string, unknown>;

export type WorkFrontmatter = {
  category: string;
  description: string;
  technologies: string[];
  updated: string;
  thumbnail: string;
  repoUrl: string;
  order?: number;
};

export type BlogFrontmatter = {
  date: string;
  thumbnail?: string;
  description: string;
  tags?: string[];
};

export type NewsFrontmatter = {
  date: string;
  category: 'INFO' | 'EVENT' | 'UPDATE';
  draft?: boolean;
};

export const NEWS_CATEGORY_COLORS: Record<NewsFrontmatter['category'], string> = {
  INFO: '#e8732a',
  EVENT: '#3b82f6',
  UPDATE: '#10b981',
};

export function withTrailingSlash(path: string): string {
  if (path === '' || path === '/') return '/';
  return path.endsWith('/') ? path : `${path}/`;
}

export function stripHtmlExt(path: string): string {
  return path.replace(/\.html$/i, '');
}

export function pagePath(page: Pick<BasePageProps, 'url' | 'frontmatter'>): string {
  const permalink = asString(page.frontmatter.permalink);
  if (permalink === '/404' || permalink === '404') return '/404';
  if (permalink) return withTrailingSlash(permalink);

  let raw = stripHtmlExt(String(page.url ?? ''));
  raw = raw.replace(/\/index$/i, '');
  if (!raw || raw === '/' || raw === 'index') return '/';
  const prefixed = raw.startsWith('/') ? raw : `/${raw}`;
  return withTrailingSlash(prefixed);
}

export function canonicalUrl(page: Pick<BasePageProps, 'url' | 'frontmatter'>): string {
  return new URL(pagePath(page), SITE_URL).href;
}

export function absoluteAssetUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return new URL(path, SITE_URL).href;
}

export function pageSlug(page: Pick<BasePageProps, 'url' | 'path' | 'frontmatter'>): string {
  const fromUrl = pagePath(page).replace(/\/+$/, '');
  const segment = fromUrl.split('/').filter(Boolean).pop();
  if (segment && segment !== 'index' && segment !== '404') return segment;
  const fromPath = page.path.replace(/\\/g, '/').replace(/\.(mdx?|markdown)$/i, '');
  return fromPath.split('/').filter(Boolean).pop() ?? '';
}

export function isLayout(page: Pick<BasePageProps, 'layout'>, layout: string): boolean {
  return page.layout === layout;
}

export function getPagesByLayout(pages: BasePageProps[], layout: string): BasePageProps[] {
  return pages.filter((page) => page.layout === layout);
}

export function getWorkPages(pages: BasePageProps[]): BasePageProps[] {
  return getPagesByLayout(pages, 'work').sort((a, b) => {
    const left = Number(a.frontmatter.order ?? 99);
    const right = Number(b.frontmatter.order ?? 99);
    return left - right;
  });
}

export function getBlogPages(pages: BasePageProps[]): BasePageProps[] {
  return getPagesByLayout(pages, 'blog').sort((a, b) => {
    const left = String(a.frontmatter.date ?? '').replace(/\./g, '-');
    const right = String(b.frontmatter.date ?? '').replace(/\./g, '-');
    return new Date(right).getTime() - new Date(left).getTime();
  });
}

export function getNewsPages(pages: BasePageProps[]): BasePageProps[] {
  return getPagesByLayout(pages, 'mayproject-news').sort((a, b) => {
    const left = String(a.frontmatter.date ?? '').replace(/\./g, '-');
    const right = String(b.frontmatter.date ?? '').replace(/\./g, '-');
    return new Date(right).getTime() - new Date(left).getTime();
  });
}

export function isoFromDotDate(value: string): string {
  return value.replace(/\./g, '-');
}

export function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

export type ClientBundle = 'site' | 'mp';

export function isProdBuild(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function clientScriptSrc(bundle: ClientBundle): string {
  return isProdBuild() ? `/assets/${bundle}.js` : `/src/${bundle}-client.ts`;
}

export function clientStylesheetHref(bundle: ClientBundle): string {
  return `/assets/${bundle}.css`;
}

export const SPECULATION_RULES_JSON = JSON.stringify({
  prerender: [
    {
      where: {
        and: [
          { href_matches: '/*' },
          { not: { href_matches: '/api/*' } },
          { not: { selector_matches: '[target=_blank]' } },
        ],
      },
      eagerness: 'moderate',
    },
  ],
});
