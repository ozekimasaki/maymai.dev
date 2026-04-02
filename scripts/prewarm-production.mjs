import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const DEFAULT_BASE_URL = 'https://maymai.dev';
const DEFAULT_SEED_ROUTES = ['/', '/blog/', '/works/'];
const ROUTE_CONCURRENCY = 3;
const ASSET_CONCURRENCY = 8;
const REQUEST_TIMEOUT_MS = 20000;
const REQUEST_RETRIES = 3;
const RETRY_DELAY_MS = 750;
const USER_AGENT = 'portfolio-maymai-prewarm/1.0';
const HTML_ACCEPT = 'text/html,application/xhtml+xml';
const ASSET_ACCEPT = '*/*';
const PUBLIC_ASSET_PATH = /^\/(?:_astro|favicon\.ico|favicon\.svg|apple-touch-icon\.png|site\.webmanifest|sitemap.*\.xml|robots\.txt)(?:\/|$)/i;
const FILE_EXTENSION_PATH = /\.[a-z0-9]+$/i;
const PUBLIC_ROUTE_BLOCKLIST = /^\/(?:_emdash|api)(?:\/|$)/i;
const PRIORITY_ROUTES = new Set(['/', '/blog/', '/works/']);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeBaseUrl(value) {
  return new URL(value).href.replace(/\/+$/, '');
}

function normalizePathname(pathname) {
  if (!pathname || pathname === '/') {
    return '/';
  }

  return pathname.endsWith('/') || FILE_EXTENSION_PATH.test(pathname)
    ? pathname
    : `${pathname}/`;
}

function isIgnoredHref(value) {
  return (
    value.startsWith('#')
    || value.startsWith('data:')
    || value.startsWith('mailto:')
    || value.startsWith('javascript:')
    || value.startsWith('tel:')
  );
}

function isPublicRoutePath(pathname) {
  if (!pathname || PUBLIC_ROUTE_BLOCKLIST.test(pathname)) {
    return false;
  }

  if (PUBLIC_ASSET_PATH.test(pathname) || FILE_EXTENSION_PATH.test(pathname)) {
    return false;
  }

  return true;
}

function isWarmableAssetPath(pathname) {
  if (!pathname || PUBLIC_ROUTE_BLOCKLIST.test(pathname)) {
    return false;
  }

  return PUBLIC_ASSET_PATH.test(pathname) || FILE_EXTENSION_PATH.test(pathname);
}

function routePriority(route) {
  if (route === '/') {
    return 0;
  }
  if (PRIORITY_ROUTES.has(route)) {
    return 1;
  }
  if (route.startsWith('/tag/') || route.startsWith('/category/')) {
    return 2;
  }
  if (route.startsWith('/blog/') || route.startsWith('/works/')) {
    return 3;
  }

  return 4;
}

function sortRoutes(routes) {
  return [...new Set(routes)].sort((left, right) => {
    const leftPriority = routePriority(left);
    const rightPriority = routePriority(right);

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    const leftDepth = left.split('/').filter(Boolean).length;
    const rightDepth = right.split('/').filter(Boolean).length;
    if (leftDepth !== rightDepth) {
      return leftDepth - rightDepth;
    }

    if (left.length !== right.length) {
      return left.length - right.length;
    }

    return left.localeCompare(right);
  });
}

function parseLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1].trim());
}

async function readOptionalFile(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  return readFile(filePath, 'utf8');
}

async function loadSitemapUrls() {
  const distClientDir = path.join(process.cwd(), 'dist', 'client');
  const indexPath = path.join(distClientDir, 'sitemap-index.xml');
  const directSitemapPath = path.join(distClientDir, 'sitemap-0.xml');
  const indexXml = await readOptionalFile(indexPath);

  if (!indexXml) {
    const directXml = await readOptionalFile(directSitemapPath);
    return directXml ? parseLocs(directXml) : [];
  }

  const sitemapUrls = [];
  for (const sitemapLoc of parseLocs(indexXml)) {
    const sitemapFile = path.join(distClientDir, path.basename(new URL(sitemapLoc).pathname));
    const sitemapXml = await readOptionalFile(sitemapFile);
    if (!sitemapXml) {
      continue;
    }
    sitemapUrls.push(...parseLocs(sitemapXml));
  }

  return sitemapUrls;
}

async function resolveBaseUrls(additionalBaseUrls = []) {
  const sitemapLocs = await loadSitemapUrls();
  const derivedBaseUrls = sitemapLocs.length > 0
    ? [new URL(sitemapLocs[0]).origin]
    : [DEFAULT_BASE_URL];
  const cliBaseUrls = process.argv.slice(2).filter((value) => /^https?:\/\//i.test(value));
  const envBaseUrls = (process.env.PREWARM_URLS ?? '')
    .split(/[,\s]+/)
    .map((value) => value.trim())
    .filter(Boolean);

  return [...new Set([
    ...derivedBaseUrls,
    ...envBaseUrls,
    ...additionalBaseUrls,
    ...cliBaseUrls,
  ].map(normalizeBaseUrl))];
}

async function loadSeedRoutes() {
  const sitemapLocs = await loadSitemapUrls();
  const routes = sitemapLocs
    .map((loc) => normalizePathname(new URL(loc).pathname))
    .filter(isPublicRoutePath);

  return sortRoutes(routes.length > 0 ? routes : DEFAULT_SEED_ROUTES);
}

function extractSrcsetAssets(value, pageUrl) {
  const assets = new Set();

  for (const candidate of value.split(',')) {
    const [rawUrl] = candidate.trim().split(/\s+/, 1);
    if (!rawUrl || isIgnoredHref(rawUrl)) {
      continue;
    }

    try {
      const url = new URL(rawUrl, pageUrl);
      if (url.origin !== pageUrl.origin) {
        continue;
      }

      if (isWarmableAssetPath(url.pathname)) {
        assets.add(`${url.pathname}${url.search}`);
      }
    } catch {
      continue;
    }
  }

  return assets;
}

function extractDiscoveries(html, pageUrl) {
  const routes = new Set();
  const assets = new Set();
  const attributePattern = /\b(?:href|src)=["']([^"'#]+)["']/gi;
  const srcsetPattern = /\bsrcset=["']([^"']+)["']/gi;

  for (const match of html.matchAll(attributePattern)) {
    const rawValue = match[1].trim();
    if (!rawValue || isIgnoredHref(rawValue)) {
      continue;
    }

    try {
      const url = new URL(rawValue, pageUrl);
      if (url.origin !== pageUrl.origin) {
        continue;
      }
      if (url.search || url.hash) {
        if (isWarmableAssetPath(url.pathname)) {
          assets.add(`${url.pathname}${url.search}`);
        }
        continue;
      }

      const normalizedPath = normalizePathname(url.pathname);
      if (isPublicRoutePath(normalizedPath)) {
        routes.add(normalizedPath);
        continue;
      }
      if (isWarmableAssetPath(normalizedPath)) {
        assets.add(normalizedPath);
      }
    } catch {
      continue;
    }
  }

  for (const match of html.matchAll(srcsetPattern)) {
    for (const asset of extractSrcsetAssets(match[1], pageUrl)) {
      assets.add(asset);
    }
  }

  return {
    assets: [...assets].sort(),
    routes: sortRoutes([...routes]),
  };
}

async function fetchResource(url, headers, label, responseMode = 'text') {
  let lastError = null;

  for (let attempt = 1; attempt <= REQUEST_RETRIES; attempt += 1) {
    const startedAt = performance.now();

    try {
      const response = await fetch(url, {
        headers,
        redirect: 'follow',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      const body = responseMode === 'text'
        ? await response.text()
        : await response.arrayBuffer();
      const durationMs = Math.round(performance.now() - startedAt);

      if (!response.ok) {
        throw new Error(`${label} ${url} returned ${response.status}`);
      }

      return {
        body,
        durationMs,
        finalUrl: response.url,
        status: response.status,
      };
    } catch (error) {
      lastError = error;

      if (attempt < REQUEST_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function fetchTextRoute(baseUrl, route, label) {
  const url = new URL(route, baseUrl);
  const response = await fetchResource(url.href, {
    Accept: HTML_ACCEPT,
    'User-Agent': USER_AGENT,
  }, label, 'text');

  return {
    ...response,
    route: normalizePathname(new URL(response.finalUrl).pathname),
  };
}

async function fetchAsset(baseUrl, assetPath) {
  const url = new URL(assetPath, baseUrl);
  const response = await fetchResource(url.href, {
    Accept: ASSET_ACCEPT,
    'User-Agent': USER_AGENT,
  }, 'asset', 'buffer');

  return {
    durationMs: response.durationMs,
    path: `${new URL(response.finalUrl).pathname}${new URL(response.finalUrl).search}`,
    status: response.status,
  };
}

async function mapWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  async function runWorker() {
    while (cursor < items.length) {
      const currentIndex = cursor;
      cursor += 1;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => runWorker()));
  return results;
}

function summarizeTimings(results) {
  if (results.length === 0) {
    return 'n=0';
  }

  const timings = results.map((result) => result.durationMs).sort((left, right) => left - right);
  const average = Math.round(timings.reduce((sum, timing) => sum + timing, 0) / timings.length);
  const p95 = timings[Math.min(timings.length - 1, Math.floor(timings.length * 0.95))];
  const max = timings[timings.length - 1];

  return `n=${timings.length}, avg=${average}ms, p95=${p95}ms, max=${max}ms`;
}

async function crawlRoutes(baseUrl, seedRoutes) {
  const routeQueue = [...seedRoutes];
  const seenRoutes = new Set(routeQueue);
  const discoveredAssets = new Set();
  const crawlResults = [];

  for (let cursor = 0; cursor < routeQueue.length; cursor += ROUTE_CONCURRENCY) {
    const batch = routeQueue.slice(cursor, cursor + ROUTE_CONCURRENCY);
    const batchResults = await mapWithConcurrency(batch, ROUTE_CONCURRENCY, async (route) => {
      const result = await fetchTextRoute(baseUrl, route, 'discover');
      const pageUrl = new URL(result.finalUrl);
      const discoveries = extractDiscoveries(result.body, pageUrl);

      for (const discoveredRoute of discoveries.routes) {
        if (!seenRoutes.has(discoveredRoute)) {
          seenRoutes.add(discoveredRoute);
          routeQueue.push(discoveredRoute);
        }
      }

      for (const assetPath of discoveries.assets) {
        discoveredAssets.add(assetPath);
      }

      console.log(`[prewarm] discover ${route} -> ${result.route} ${result.durationMs}ms`);

      return {
        durationMs: result.durationMs,
        route: result.route,
        status: result.status,
      };
    });

    crawlResults.push(...batchResults);
  }

  return {
    assets: [...discoveredAssets].sort((left, right) => left.localeCompare(right)),
    results: crawlResults,
    routes: sortRoutes([...seenRoutes]),
  };
}

async function warmAssets(baseUrl, assets) {
  if (assets.length === 0) {
    return [];
  }

  return mapWithConcurrency(assets, ASSET_CONCURRENCY, async (assetPath) => {
    const result = await fetchAsset(baseUrl, assetPath);
    console.log(`[prewarm] asset ${result.path} ${result.durationMs}ms`);
    return result;
  });
}

async function confirmRoutes(baseUrl, routes, label) {
  return mapWithConcurrency(routes, ROUTE_CONCURRENCY, async (route) => {
    const result = await fetchTextRoute(baseUrl, route, label);
    console.log(`[prewarm] confirm ${route} ${result.durationMs}ms`);
    return {
      durationMs: result.durationMs,
      route: result.route,
      status: result.status,
    };
  });
}

export async function runPrewarm({ additionalBaseUrls = [] } = {}) {
  const baseUrls = await resolveBaseUrls(additionalBaseUrls);
  const seedRoutes = await loadSeedRoutes();

  console.log(`[prewarm] seed routes: ${seedRoutes.join(', ')}`);

  for (const baseUrl of baseUrls) {
    console.log(`[prewarm] starting ${baseUrl}`);
    const crawled = await crawlRoutes(baseUrl, seedRoutes);
    const confirmed = await confirmRoutes(baseUrl, crawled.routes, 'confirm');
    const assets = await warmAssets(baseUrl, crawled.assets);
    const priorityRoutes = crawled.routes.filter((route) => PRIORITY_ROUTES.has(route));
    const priorityConfirmed = await confirmRoutes(baseUrl, priorityRoutes, 'priority-confirm');

    console.log(`[prewarm] ${baseUrl} routes discovered: ${crawled.routes.length}`);
    console.log(`[prewarm] ${baseUrl} assets discovered: ${crawled.assets.length}`);
    console.log(`[prewarm] ${baseUrl} discover timings: ${summarizeTimings(crawled.results)}`);
    console.log(`[prewarm] ${baseUrl} confirm timings: ${summarizeTimings(confirmed)}`);
    console.log(`[prewarm] ${baseUrl} asset timings: ${summarizeTimings(assets)}`);
    console.log(`[prewarm] ${baseUrl} priority timings: ${summarizeTimings(priorityConfirmed)}`);
  }
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  runPrewarm().catch((error) => {
    console.error('[prewarm] failed');
    console.error(error);
    process.exitCode = 1;
  });
}
