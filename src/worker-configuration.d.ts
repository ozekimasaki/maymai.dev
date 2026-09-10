export type Env = {
  LIKES_KV: {
    get: (key: string) => Promise<string | null>;
    put: (key: string, value: string) => Promise<void>;
  };
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
};
