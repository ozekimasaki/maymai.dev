import { defineMiddleware } from 'astro:middleware';

const HTML_CACHE_CONTROL = 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400';
const HTML_CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_HTML_CACHE_ENTRIES = 64;
const PUBLIC_ASSET_PATH = /^\/(?:_astro|favicon\.ico|favicon\.svg|apple-touch-icon\.png|site\.webmanifest|sitemap.*\.xml|robots\.txt)(?:\/|$)/i;
const FILE_EXTENSION_PATH = /\.[a-z0-9]+$/i;

interface CachedHtmlResponse {
  body: string;
  expiresAt: number;
  headers: Array<[string, string]>;
  status: number;
}

const htmlResponseCache = new Map<string, CachedHtmlResponse>();

function isCacheableHtmlRequest(request: Request): boolean {
  if (request.method !== 'GET') {
    return false;
  }

  const url = new URL(request.url);
  if (url.pathname.startsWith('/_emdash') || url.pathname.startsWith('/api/')) {
    return false;
  }
  if (PUBLIC_ASSET_PATH.test(url.pathname) || FILE_EXTENSION_PATH.test(url.pathname)) {
    return false;
  }
  if (url.searchParams.size > 0) {
    return false;
  }

  const accept = request.headers.get('accept') ?? '';
  if (!accept.includes('text/html')) {
    return false;
  }

  const cacheControl = request.headers.get('cache-control') ?? '';
  if (cacheControl.includes('no-cache')) {
    return false;
  }

  return !request.headers.has('cookie');
}

function shouldStoreHtmlResponse(response: Response): boolean {
  if (response.status !== 200 || response.headers.has('set-cookie')) {
    return false;
  }

  const contentType = response.headers.get('content-type') ?? '';
  return contentType.includes('text/html');
}

function createCacheKey(request: Request): Request {
  const url = new URL(request.url);
  url.search = '';
  url.hash = '';
  return new Request(url.toString(), { method: 'GET' });
}

function readCachedHtml(cacheKey: string): Response | null {
  const cached = htmlResponseCache.get(cacheKey);
  if (!cached) {
    return null;
  }
  if (cached.expiresAt <= Date.now()) {
    htmlResponseCache.delete(cacheKey);
    return null;
  }

  return new Response(cached.body, {
    status: cached.status,
    headers: new Headers(cached.headers),
  });
}

async function storeCachedHtml(cacheKey: string, response: Response): Promise<Response> {
  const body = await response.text();
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', HTML_CACHE_CONTROL);

  htmlResponseCache.set(cacheKey, {
    body,
    expiresAt: Date.now() + HTML_CACHE_TTL_MS,
    headers: [...headers.entries()],
    status: response.status,
  });

  if (htmlResponseCache.size > MAX_HTML_CACHE_ENTRIES) {
    const oldestKey = htmlResponseCache.keys().next().value;
    if (oldestKey) {
      htmlResponseCache.delete(oldestKey);
    }
  }

  return new Response(body, {
    status: response.status,
    headers,
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (!isCacheableHtmlRequest(context.request)) {
    return next();
  }

  const cacheKey = createCacheKey(context.request).url;
  const cachedResponse = readCachedHtml(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await next();
  if (!shouldStoreHtmlResponse(response)) {
    return response;
  }

  return storeCachedHtml(cacheKey, response);
});
