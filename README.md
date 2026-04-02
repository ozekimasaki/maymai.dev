# Maymai.dev

EmDash をデータ層 / CMS として組み込んだ、Cloudflare 向けのポートフォリオサイトです。  
既存の `Maymai.dev` の UI とルーティングを維持しつつ、`works` / `blog` のコンテンツ管理を EmDash に移行し、メニュー / taxonomy / コメントも EmDash 標準機能に寄せています。

## Stack

- Astro
- EmDash
- Cloudflare Workers
- Cloudflare D1
- Cloudflare R2
- Cloudflare KV（likes API）
- TypeScript / SCSS

## Setup

```sh
npm install
npm run bootstrap
pnpm dev
```

EmDash の管理画面は `/_emdash/admin` です。
ローカル開発では `data.db` と `./.emdash/uploads` を使い、本番ビルドでは Cloudflare D1 / R2 を使います。

## Scripts

| Command | Action |
| :-- | :-- |
| `pnpm dev` | ローカル SQLite / local storage で開発サーバーを起動 |
| `npm run bootstrap` | EmDash の初期化と seed 投入 |
| `npm run seed` | `seed/seed.json` を再投入 |
| `npm run typecheck` | Astro / TypeScript のチェック |
| `npm run build` | 本番ビルド |
| `npm run preview` | ビルド結果をローカル確認 |
| `npm run deploy` | Cloudflare へデプロイ |

## Content

- EmDash seed: `seed/seed.json`
- 作品一覧: `/works`
- ブログ一覧: `/blog`
- タグアーカイブ: `/tag/[slug]`
- カテゴリアーカイブ: `/category/[slug]`

## EmDash features

- Header navigation: EmDash menu `primary`
- Blog tags: EmDash taxonomy `tag`
- Works categories: EmDash taxonomy `category`
- Blog comments: EmDash built-in comments UI

## Cloudflare bindings

`wrangler.jsonc` では以下を使用します。

- `DB`: D1 database
- `MEDIA`: R2 bucket
- `LIKES_KV`: KV namespace

`DB.database_id` はローカル用のプレースホルダーなので、実デプロイ前に実際の D1 ID に置き換えてください。
