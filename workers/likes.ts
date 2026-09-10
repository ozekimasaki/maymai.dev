import { handleLikesRequest, isLikesPath } from '../src/lib/likes.ts';
import type { Env } from '../src/worker-configuration';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (isLikesPath(url.pathname)) {
      return handleLikesRequest(request, env.LIKES_KV);
    }

    return env.ASSETS.fetch(request);
  },
};
