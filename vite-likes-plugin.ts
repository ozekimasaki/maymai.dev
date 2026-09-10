import type { Plugin } from 'vite';
import { handleLikesRequest, isLikesPath, type LikesKv } from './src/lib/likes.ts';

const devLikesStore = new Map<string, string>();

const devLikesKv: LikesKv = {
  get: async (key) => devLikesStore.get(key) ?? null,
  put: async (key, value) => {
    devLikesStore.set(key, value);
  },
};

async function readNodeBody(req: import('node:http').IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export function likesDevPlugin(): Plugin {
  return {
    name: 'likes-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? '';
        const pathname = url.split('?')[0] ?? '';
        if (!isLikesPath(pathname)) {
          next();
          return;
        }

        const origin = `http://${req.headers.host ?? 'localhost'}`;
        const method = req.method ?? 'GET';
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers)) {
          if (typeof value === 'string') headers.set(key, value);
        }

        const body = method === 'POST' || method === 'PUT' || method === 'PATCH'
          ? await readNodeBody(req)
          : undefined;

        const request = new Request(new URL(url, origin), { method, headers, body });
        const response = await handleLikesRequest(request, devLikesKv);
        res.statusCode = response.status;
        response.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });
        res.end(await response.text());
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? '';
        const pathname = url.split('?')[0] ?? '';
        if (!isLikesPath(pathname)) {
          next();
          return;
        }

        const origin = `http://${req.headers.host ?? 'localhost'}`;
        const method = req.method ?? 'GET';
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers)) {
          if (typeof value === 'string') headers.set(key, value);
        }

        const body = method === 'POST' || method === 'PUT' || method === 'PATCH'
          ? await readNodeBody(req)
          : undefined;

        const request = new Request(new URL(url, origin), { method, headers, body });
        const response = await handleLikesRequest(request, devLikesKv);
        res.statusCode = response.status;
        response.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });
        res.end(await response.text());
      });
    },
  };
}
