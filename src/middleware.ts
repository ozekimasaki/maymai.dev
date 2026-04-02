import { defineMiddleware } from 'astro:middleware';

const HTML_CACHE_CONTROL = 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400';
const PUBLIC_ASSET_PATH = /^\/(?:_astro|favicon\.ico|favicon\.svg|apple-touch-icon\.png|site\.webmanifest|sitemap.*\.xml|robots\.txt)(?:\/|$)/i;
const FILE_EXTENSION_PATH = /\.[a-z0-9]+$/i;

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

function getEdgeCache(): Cache | undefined {
  return (globalThis.caches as CacheStorage & { default?: Cache } | undefined)?.default;
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (!isCacheableHtmlRequest(context.request)) {
    return next();
  }

  const edgeCache = getEdgeCache();
  if (!edgeCache) {
    const response = await next();
    if (shouldStoreHtmlResponse(response)) {
      response.headers.set('Cache-Control', HTML_CACHE_CONTROL);
    }
    return response;
  }

  const cacheKey = createCacheKey(context.request);
  const cachedResponse = await edgeCache.match(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await next();
  if (!shouldStoreHtmlResponse(response)) {
    return response;
  }

  const responseToCache = new Response(response.body, response);
  responseToCache.headers.set('Cache-Control', HTML_CACHE_CONTROL);
  await edgeCache.put(cacheKey, responseToCache.clone());
  return responseToCache;
});
