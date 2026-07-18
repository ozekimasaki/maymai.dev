# Maymai.dev

フロントエンドエンジニア **Masaki Ozeki（Maymai）** のポートフォリオサイト（[https://maymai.dev](https://maymai.dev)）のソースコードです。Astro で構築し、Cloudflare Workers 上で配信しています。

## 概要

- Astro による静的中心のサイトに、Cloudflare Workers 上で動作する一部のサーバー機能（いいね API）を組み合わせています。
- トップページ（自己紹介・スキル・制作実績・ブログ）に加えて、オリジナル企画「桜草メイプロジェクト」の特設ページ群（`/mayproject`）を含みます。
- 制作実績（Works）とブログはリポジトリ内の Markdown をコンテンツソースとして管理しています。

## 主な機能

- **トップページ**（`/`）: Hero / About / Skills / Works / Blog / Contact の各セクション。
- **Works**（`/works`, `/works/[slug]`): `src/content/works/*.md` を元にした制作実績一覧・詳細ページ。
- **Blog**（`/blog`, `/blog/[slug]`): `src/content/blog/*.md` を元にしたブログ一覧・詳細ページ。
- **桜草メイプロジェクト**（`/mayproject`）: 企画紹介・ニュース（`/mayproject/news`）・ガイドライン（`/mayproject/guidelines`）を持つ特設ページ。
- **いいね API**（`/api/likes`）: Cloudflare KV（`LIKES_KV`）にカウントを保存する `GET` / `POST` エンドポイント。`type`（`blog` / `works`）と `slug` で対象を指定します。開発時はインメモリのストアにフォールバックします。
- **アセット自動生成**: OG 画像・ファビコン・PWA アイコン・Works サムネイル・ギャラリー画像を `sharp` で生成します（`scripts/generate-assets.mjs`）。
- **SEO / 配信**: `@astrojs/sitemap` によるサイトマップ生成（`/api/` は除外）、各ページの OGP・JSON-LD 構造化データ、`robots.txt` / `site.webmanifest` を同梱。

## 要件

- **Node.js**: `>=22.12.0`（`package.json` の `engines` で指定）
- **npm**: Node.js 同梱のもの
- **Cloudflare アカウント**: デプロイおよび `LIKES_KV` KV ネームスペースの利用時に必要（Wrangler で設定）

## インストール

```bash
npm install
```

## 使い方

開発サーバーを起動します（`http://localhost:4321`）。各コマンドは実行前に `scripts/generate-assets.mjs` を走らせてアセットを生成します。

```bash
# 開発サーバー
npm run dev

# 本番ビルド（出力先: ./dist）
npm run build

# ビルド結果のプレビュー
npm run preview
```

Cloudflare Workers へデプロイします（ビルド後に `wrangler deploy` を実行）。事前に Wrangler の認証と `wrangler.jsonc` の KV ネームスペース設定が必要です。

```bash
npm run deploy
```

## 開発コマンド

| コマンド | 内容 |
| :-- | :-- |
| `npm run dev` | アセット生成後に開発サーバーを起動（`http://localhost:4321`） |
| `npm run build` | アセット生成後に本番ビルドを `./dist` へ出力 |
| `npm run preview` | アセット生成後にビルド結果をローカルでプレビュー |
| `npm run deploy` | アセット生成 → ビルド → `wrangler deploy` |
| `npm run generate:gallery` | ギャラリー画像を生成（デフォルトプリセット `webp-light`） |
| `npm run generate:gallery:webp` | ギャラリー画像を WebP（`webp-light`）で生成 |
| `npm run generate:gallery:avif` | ギャラリー画像を AVIF（`avif-light`）で生成 |
| `npm run generate:gallery:quality` | ギャラリー画像を高品質 AVIF（`avif-quality`）で生成 |
| `npm run astro` | Astro CLI を実行（例: `npm run astro -- --help`） |
| `npx astro check` | 型・テンプレートの検証 |

## 構成

```text
maymai.dev/
├── public/                     # そのまま配信する静的アセット（favicon, og-image, gallery など）
├── scripts/
│   ├── generate-assets.mjs         # OG 画像 / アイコン / ギャラリー生成のエントリポイント
│   └── generate-works-thumbnails.mjs  # Works サムネイル（GitHub OGP）生成
├── src/
│   ├── assets/                 # Astro に最適化させる画像
│   ├── components/             # 再利用コンポーネント（sections/, mayproject/ を含む）
│   ├── content/                # Markdown コンテンツ（works/, blog/）
│   ├── data/                   # データ定義と生成物（generated/mp-gallery-manifest.json など）
│   ├── layouts/                # BaseLayout.astro / MayprojectLayout.astro
│   ├── pages/                  # ルーティング対象（api/likes.ts を含む）
│   ├── scripts/                # 共有クライアントスクリプト（.ts）
│   ├── styles/                 # 共有スタイル（global.scss, foundation/）
│   ├── content.config.ts       # コンテンツコレクション定義（works / blog）
│   └── worker-configuration.d.ts  # Cloudflare Workers の型定義（Env）
├── Gallery/                    # ギャラリー生成の元画像
├── astro.config.mjs            # Astro 設定（Cloudflare アダプタ / sitemap）
├── wrangler.jsonc              # Cloudflare Workers 設定（KV バインディングなど）
├── tsconfig.json               # TypeScript 設定（astro/tsconfigs/strict を継承）
└── package.json
```

主要な技術スタックは Astro 6 / TypeScript / SCSS（Sass）です。画像処理に `sharp`、カルーセルに `@splidejs/splide` と `swiper`、デプロイに Cloudflare（`@astrojs/cloudflare` + Wrangler）を利用しています。

コーディング規約や作業ルールは [`AGENTS.md`](./AGENTS.md) および `.cursor/rules/*.mdc` を参照してください。

## ライセンス

本リポジトリは非公開（`private`）のポートフォリオプロジェクトで、ライセンスファイルは同梱していません。
