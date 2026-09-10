# Maymai.dev

ポートフォリオサイト。Vite + ox-content の SSG で静的 HTML を出力し、Cloudflare Workers で配信します。`/api/likes` だけ Worker 上の KV を使います。

## 必要環境

- Node.js 24 以上

## コマンド

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
npm run deploy   # build のあと wrangler deploy
```

## 構成

- `content/` … Markdown / MDX
- `theme/` … ox-content の静的 JSX テーマ
- `src/styles/` … Lightning CSS（素の CSS）
- `src/scripts/` … バニラ JS
- `workers/likes.ts` … likes API と静的アセット配信
