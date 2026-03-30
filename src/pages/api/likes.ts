export const prerender = false;

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

const ALLOWED_TYPES = ['blog', 'works'] as const;
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

function buildKey(type: string, slug: string): string {
  return `likes:${type}:${slug}`;
}

function jsonResponse(data: object, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
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
  const value = await env.LIKES_KV.get(key);
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
  const current = await env.LIKES_KV.get(key);
  const count = (current ? parseInt(current, 10) : 0) + 1;
  await env.LIKES_KV.put(key, String(count));

  return jsonResponse({ count });
};
