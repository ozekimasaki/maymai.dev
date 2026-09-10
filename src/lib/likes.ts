const ALLOWED_TYPES = ['blog', 'works'] as const;
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

export type LikesKv = {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string) => Promise<void>;
};

function jsonResponse(data: object, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function buildKey(type: string, slug: string): string {
  return `likes:${type}:${slug}`;
}

function isAllowedType(type: string): type is (typeof ALLOWED_TYPES)[number] {
  return ALLOWED_TYPES.includes(type as (typeof ALLOWED_TYPES)[number]);
}

export async function handleLikesRequest(request: Request, likesKv: LikesKv): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === 'GET') {
    const type = url.searchParams.get('type');
    const slug = url.searchParams.get('slug');

    if (!type || !slug) {
      return jsonResponse({ error: 'type and slug are required' }, 400);
    }
    if (!isAllowedType(type)) {
      return jsonResponse({ error: 'invalid type' }, 400);
    }
    if (!SLUG_PATTERN.test(slug)) {
      return jsonResponse({ error: 'invalid slug' }, 400);
    }

    const value = await likesKv.get(buildKey(type, slug));
    const count = value ? parseInt(value, 10) : 0;
    return jsonResponse({ count });
  }

  if (request.method === 'POST') {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return jsonResponse({ error: 'invalid body' }, 400);
    }

    const { type, slug } = body as { type?: string; slug?: string };

    if (!type || !slug) {
      return jsonResponse({ error: 'type and slug are required' }, 400);
    }
    if (!isAllowedType(type)) {
      return jsonResponse({ error: 'invalid type' }, 400);
    }
    if (!SLUG_PATTERN.test(slug)) {
      return jsonResponse({ error: 'invalid slug' }, 400);
    }

    const key = buildKey(type, slug);
    const current = await likesKv.get(key);
    const count = (current ? parseInt(current, 10) : 0) + 1;
    await likesKv.put(key, String(count));
    return jsonResponse({ count });
  }

  return jsonResponse({ error: 'method not allowed' }, 405);
}

export function isLikesPath(pathname: string): boolean {
  return pathname === '/api/likes' || pathname === '/api/likes/';
}
