interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  LIKES_KV: KVNamespace;
}

declare module 'cloudflare:workers' {
  export const env: Env;
}
