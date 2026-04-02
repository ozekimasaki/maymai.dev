import {
  getEmDashCollection,
  getEmDashEntry,
  getEntryTerms,
  getMenu,
  getSiteSettings,
  getTaxonomyTerms,
} from 'emdash';
import {
  canFallbackProfileEntry,
  resolveSameAs,
  resolveSiteName,
  resolveSiteProfile,
  resolveSiteUrl,
  resolveSocialLinks,
  resolveTagline,
  resolveTitleSeparator,
  type SiteProfileData,
  type SiteSettingsLike,
  type SocialLink,
} from './site-config';

const PUBLIC_CACHE_PREFIX = 'site-cache:v2';
const PUBLIC_CACHE_TTL_SECONDS = 300;
const memoryCache = new Map<string, { expiresAt: number; value: unknown }>();
const inFlightCache = new Map<string, Promise<unknown>>();

export interface NavItem {
  label: string;
  target?: string | null;
  url: string;
}

export interface SiteShellData {
  navItems: NavItem[];
  profile: SiteProfileData;
  sameAs: string[];
  siteName: string;
  siteSettings: SiteSettingsLike;
  siteUrl: string;
  socialLinks: SocialLink[];
  tagline: string;
  titleSeparator: string;
}

export interface BlogListItem {
  date: string;
  description?: string;
  id: string;
  title: string;
}

export interface WorkListItem {
  categoryLabel?: string;
  description: string;
  id: string;
  thumbnail: string;
  title: string;
}

type EntryTerm = Awaited<ReturnType<typeof getEntryTerms>>[number];
type TaxonomyTerm = Awaited<ReturnType<typeof getTaxonomyTerms>>[number];
type CacheNamespace = {
  get: (key: string) => Promise<string | null>;
  put: (
    key: string,
    value: string,
    options?: {
      expirationTtl?: number;
    },
  ) => Promise<void>;
};

function buildCacheKey(key: string): string {
  return `${PUBLIC_CACHE_PREFIX}:${key}`;
}

function readMemoryCache<T>(key: string): T | undefined {
  const cached = memoryCache.get(key);
  if (!cached) {
    return undefined;
  }

  if (cached.expiresAt <= Date.now()) {
    memoryCache.delete(key);
    return undefined;
  }

  return cached.value as T;
}

function writeMemoryCache<T>(key: string, value: T, expiresAt: number): void {
  memoryCache.set(key, { expiresAt, value });

  if (memoryCache.size <= 128) {
    return;
  }

  for (const [cacheKey, cached] of memoryCache) {
    if (cached.expiresAt <= Date.now()) {
      memoryCache.delete(cacheKey);
    }
  }
}

async function getSharedKv(): Promise<CacheNamespace | null> {
  if (import.meta.env.DEV) {
    return null;
  }

  const { env } = await import('cloudflare:workers');
  return env.LIKES_KV;
}

async function getCachedJson<T>(key: string, loadValue: () => Promise<T>): Promise<T> {
  const cacheKey = buildCacheKey(key);
  const cachedInMemory = readMemoryCache<T>(cacheKey);

  if (cachedInMemory !== undefined) {
    return cachedInMemory;
  }

  const kv = await getSharedKv();

  if (kv) {
    try {
      const cachedRaw = await kv.get(cacheKey);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw) as { expiresAt: number; value: T };
        if (cached.expiresAt > Date.now()) {
          writeMemoryCache(cacheKey, cached.value, cached.expiresAt);
          return cached.value;
        }
      }
    } catch (error) {
      console.warn(`Failed to read public cache key "${cacheKey}".`, error);
    }
  }

  const refreshedInMemory = readMemoryCache<T>(cacheKey);
  if (refreshedInMemory !== undefined) {
    return refreshedInMemory;
  }

  const inFlight = inFlightCache.get(cacheKey);
  if (inFlight) {
    return inFlight as Promise<T>;
  }

  const loadPromise = (async () => {
    const value = await loadValue();
    const expiresAt = Date.now() + (PUBLIC_CACHE_TTL_SECONDS * 1000);
    writeMemoryCache(cacheKey, value, expiresAt);

    if (kv) {
      try {
        await kv.put(
          cacheKey,
          JSON.stringify({ expiresAt, value }),
          { expirationTtl: PUBLIC_CACHE_TTL_SECONDS },
        );
      } catch (error) {
        console.warn(`Failed to write public cache key "${cacheKey}".`, error);
      }
    }

    return value;
  })();

  inFlightCache.set(cacheKey, loadPromise);

  try {
    return await loadPromise;
  } finally {
    inFlightCache.delete(cacheKey);
  }
}

function sortBlogPostsByDate<T extends { data: { date: string } }>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) =>
      new Date(b.data.date.replace(/\./g, '-')).getTime() -
      new Date(a.data.date.replace(/\./g, '-')).getTime(),
  );
}

function sortWorksByOrder<T extends { data: { order?: number } }>(works: T[]): T[] {
  return [...works].sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
}

export async function getPublicSiteShellData(): Promise<SiteShellData> {
  return getCachedJson('site-shell', async () => {
    const [settings, primaryMenu, { entry: profileEntry, error: profileError }] = await Promise.all([
      getSiteSettings(),
      getMenu('primary'),
      getEmDashEntry('profile', 'default'),
    ]);

    if (profileError && !canFallbackProfileEntry(profileError)) {
      throw profileError;
    }

    return {
      navItems: primaryMenu?.items ?? [],
      profile: resolveSiteProfile(profileEntry?.data),
      sameAs: resolveSameAs(settings),
      siteName: resolveSiteName(settings),
      siteSettings: settings,
      siteUrl: resolveSiteUrl(settings),
      socialLinks: resolveSocialLinks(settings),
      tagline: resolveTagline(settings),
      titleSeparator: resolveTitleSeparator(settings),
    };
  });
}

export async function getCachedBlogIndexPosts(): Promise<BlogListItem[]> {
  return getCachedJson('blog-index', async () => {
    const { entries: allPosts } = await getEmDashCollection('blog');

    return sortBlogPostsByDate(allPosts).map((post) => ({
      date: post.data.date,
      description: post.data.description,
      id: post.id,
      title: post.data.title,
    }));
  });
}

export async function getCachedHomePosts(): Promise<BlogListItem[]> {
  const posts = await getCachedBlogIndexPosts();
  return posts.slice(0, 3);
}

export async function getCachedWorksIndexCards(): Promise<WorkListItem[]> {
  return getCachedJson('works-index', async () => {
    const { entries: allWorks } = await getEmDashCollection('works');
    const sortedWorks = sortWorksByOrder(allWorks);

    return Promise.all(
      sortedWorks.map(async (work) => ({
        categoryLabel: (await getEntryTerms('works', work.data.id, 'category'))[0]?.label,
        description: work.data.description,
        id: work.id,
        thumbnail: work.data.thumbnail,
        title: work.data.title,
      })),
    );
  });
}

export async function getCachedHomeWorks(): Promise<WorkListItem[]> {
  const works = await getCachedWorksIndexCards();
  return works.slice(0, 4);
}

export async function getCachedPostsByTag(slug: string): Promise<BlogListItem[]> {
  return getCachedJson(`blog-tag:${slug}`, async () => {
    const { entries: allPosts } = await getEmDashCollection('blog', {
      where: { tag: slug },
    });

    return sortBlogPostsByDate(allPosts).map((post) => ({
      date: post.data.date,
      description: post.data.description,
      id: post.id,
      title: post.data.title,
    }));
  });
}

export async function getCachedWorksByCategory(slug: string): Promise<WorkListItem[]> {
  return getCachedJson(`works-category:${slug}`, async () => {
    const { entries: allWorks } = await getEmDashCollection('works', {
      where: { category: slug },
    });

    return sortWorksByOrder(allWorks).map((work) => ({
      description: work.data.description,
      id: work.id,
      thumbnail: work.data.thumbnail,
      title: work.data.title,
    }));
  });
}

export async function getCachedTaxonomyTerms(taxonomy: 'tag' | 'category'): Promise<TaxonomyTerm[]> {
  return getCachedJson(`taxonomy:${taxonomy}`, () => getTaxonomyTerms(taxonomy));
}

export async function getCachedEntryTerms(
  collection: 'blog' | 'works',
  entryId: string,
  taxonomy: 'tag' | 'category',
): Promise<EntryTerm[]> {
  return getCachedJson(
    `entry-terms:${collection}:${taxonomy}:${entryId}`,
    () => getEntryTerms(collection, entryId, taxonomy),
  );
}
