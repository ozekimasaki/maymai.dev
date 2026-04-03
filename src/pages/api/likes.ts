export const prerender = false;

import type { APIRoute } from 'astro';

const ALLOWED_TYPES = ['blog', 'works'] as const;
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
const devLikesStore = new Map<string, string>();

type LikesKv = {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string) => Promise<void>;
};

function buildKey(type: string, slug: string): string {
  return `likes:${type}:${slug}`;
}

function jsonResponse(data: object, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getLikesKv(): Promise<LikesKv> {
  if (import.meta.env.DEV) {
    return {
      get: async (key) => devLikesStore.get(key) ?? null,
      put: async (key, value) => {
        devLikesStore.set(key, value);
      },
    };
  }

  const { env } = await import('cloudflare:workers');
  return env.LIKES_KV;
}

export const GET: APIRoute = async ({ url }) => {
  const type = url.searchParams.get('type');
  const slug = url.searchParams.get('slug');

  if (!type || !slug) {
    return jsonResponse({ error: 'type and slug are required' }, 400);
  }
  if (!ALLOWED_TYPES.includes(type as typeof ALLOWED_TYPES[number])) {
    return jsonResponse({ error: 'invalid type' }, 400);
  }
  if (!SLUG_PATTERN.test(slug)) {
    return jsonResponse({ error: 'invalid slug' }, 400);
  }

  const key = buildKey(type, slug);
  const likesKv = await getLikesKv();
  const value = await likesKv.get(key);
  const count = value ? parseInt(value, 10) : 0;

  return jsonResponse({ count });
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return jsonResponse({ error: 'invalid body' }, 400);
  }

  const { type, slug } = body as { type?: string; slug?: string };

  if (!type || !slug) {
    return jsonResponse({ error: 'type and slug are required' }, 400);
  }
  if (!ALLOWED_TYPES.includes(type as typeof ALLOWED_TYPES[number])) {
    return jsonResponse({ error: 'invalid type' }, 400);
  }
  if (!SLUG_PATTERN.test(slug)) {
    return jsonResponse({ error: 'invalid slug' }, 400);
  }

  const key = buildKey(type, slug);
  const likesKv = await getLikesKv();
  const current = await likesKv.get(key);
  const count = (current ? parseInt(current, 10) : 0) + 1;
  await likesKv.put(key, String(count));

  return jsonResponse({ count });
};
