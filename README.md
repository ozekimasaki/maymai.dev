# Maymai.dev

フロントエンドエンジニア **Masaki Ozeki（Maymai）** のポートフォリオサイト（[https://maymai.dev](https://maymai.dev)）のソースコードです。Vite + ox-content の SSG で静的 HTML を出力し、Cloudflare Workers 上で配信しています。`/api/likes` だけ Worker 上の KV を使います。

## 概要

- 静的中心のサイトに、Cloudflare Workers 上で動作する一部のサーバー機能（いいね API）を組み合わせています。
- トップページ（自己紹介・スキル・制作実績・ブログ）に加えて、オリジナル企画「桜草メイプロジェクト」の特設ページ群（`/mayproject/`）を含みます。
- 制作実績（Works）とブログはリポジトリ内の Markdown をコンテンツソースとして管理しています。

## 主な機能

- **トップページ**（`/`）: Hero / About / Skills / Works / Blog / Contact の各セクション。
- **Works**（`/works/`, `/works/:slug/`）: `content/works/*.md` を元にした制作実績一覧・詳細ページ。
- **Blog**（`/blog/`, `/blog/:slug/`）: `content/blog/*.md` を元にしたブログ一覧・詳細ページ。
- **桜草メイプロジェクト**（`/mayproject/`）: 企画紹介・ニュース（`/mayproject/news/`）・ガイドライン（`/mayproject/guidelines/`）を持つ特設ページ。
- **いいね API**（`/api/likes`）: Cloudflare KV（`LIKES_KV`）にカウントを保存する `GET` / `POST` エンドポイント。`type`（`blog` / `works`）と `slug` で対象を指定します。開発時はインメモリのストアにフォールバックします。
- **アセット自動生成**: OG 画像・ファビコン・PWA アイコン・Works サムネイル・ギャラリー画像を `sharp` で生成します（`scripts/generate-assets.mjs`）。
- **SEO / 配信**: ox-content によるサイトマップ生成、各ページの OGP・JSON-LD 構造化データ、`robots.txt` / `site.webmanifest` を同梱。

## 必要環境

- **Node.js**: `>=24`（`package.json` の `engines` で指定）
- **npm**: Node.js 同梱のもの
- **Cloudflare アカウント**: デプロイおよび `LIKES_KV` KV ネームスペースの利用時に必要（Wrangler で設定）

## インストール

```bash
npm install
```

## 使い方

各コマンドは実行前に `scripts/generate-assets.mjs` を走らせてアセットを生成します。見た目の確認は `npm run build` のあと `npm run preview`（デフォルト `http://localhost:4173`）を使ってください。`vite` 開発サーバーは ox-content 標準のドキュメント UI になります。

```bash
# 開発サーバー（http://localhost:5173）
npm run dev

# 本番ビルド（出力先: ./dist）
npm run build

# ビルド結果のプレビュー（http://localhost:4173）
npm run preview
```

Cloudflare Workers へデプロイします（ビルド後に `wrangler deploy` を実行）。事前に Wrangler の認証と `wrangler.jsonc` の KV ネームスペース設定が必要です。

```bash
npm run deploy
```

## 開発コマンド

| コマンド | 内容 |
| :-- | :-- |
| `npm run dev` | アセット生成後に開発サーバーを起動（`http://localhost:5173`） |
| `npm run build` | アセット生成後に本番ビルドを `./dist` へ出力 |
| `npm run preview` | アセット生成後にビルド結果をローカルでプレビュー（`http://localhost:4173`） |
| `npm run deploy` | アセット生成 → ビルド → `wrangler deploy` |
| `npm run generate:gallery` | ギャラリー画像を生成（デフォルトプリセット `webp-light`） |
| `npm run generate:gallery:webp` | ギャラリー画像を WebP（`webp-light`）で生成 |
| `npm run generate:gallery:avif` | ギャラリー画像を AVIF（`avif-light`）で生成 |
| `npm run generate:gallery:quality` | ギャラリー画像を高品質 AVIF（`avif-quality`）で生成 |

## 構成

```text
maymai.dev/
├── content/                    # Markdown / MDX（ルーティングと frontmatter）
├── theme/                      # ox-content の静的 JSX テーマ
├── public/                     # そのまま配信する静的アセット（favicon, og-image, gallery など）
├── scripts/
│   ├── generate-assets.mjs         # OG 画像 / アイコン / ギャラリー生成のエントリポイント
│   └── generate-works-thumbnails.mjs  # Works サムネイル（GitHub OGP）生成
├── src/
│   ├── client.ts               # クライアント CSS / JS のエントリ
│   ├── lib/                    # 共有ロジック（likes API など）
│   ├── scripts/                # 共有クライアントスクリプト（.ts）
│   ├── styles/                 # Lightning CSS（素の CSS）
│   └── worker-configuration.d.ts  # Cloudflare Workers の型定義（Env）
├── workers/likes.ts            # /api/likes と静的アセット配信
├── Gallery/                    # ギャラリー生成の元画像
├── vite.config.ts              # Vite + ox-content 設定
├── wrangler.jsonc              # Cloudflare Workers 設定（KV バインディングなど）
├── tsconfig.json
└── package.json
```

主要な技術スタックは Vite / ox-content / Lightning CSS / TypeScript です。画像処理に `sharp`、カルーセルに `@splidejs/splide`、デプロイに Cloudflare Workers + Wrangler を利用しています。

コーディング規約や作業ルールは [`AGENTS.md`](./AGENTS.md) および `.cursor/rules/*.mdc` を参照してください。

## ライセンス

本リポジトリは非公開（`private`）のポートフォリオプロジェクトで、ライセンスファイルは同梱していません。
