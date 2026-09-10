# AGENTS.md

このファイルは、`portfolio_maymai` における実装ルールです。
`.cursor/rules/*.mdc` の内容を Vite + ox-content 前提で一元化しています。

## 優先順位

1. System / Developer / User 指示
2. この `AGENTS.md`

競合時は上位指示を優先します。

## 0. 適用スコープ

- 対象タスク: コーディング支援、リファクタリング、デバッグ、開発関連ドキュメント作成
- 対象技術: Vite / ox-content / Lightning CSS / TypeScript / Cloudflare Workers

## 0-1. プロジェクト概要とセットアップ

`portfolio_maymai`（[https://maymai.dev](https://maymai.dev)）は Vite + ox-content の SSG で静的 HTML を出力し、Cloudflare Workers 上で配信する。`/api/likes` だけ Worker 上の KV を使う。

### 技術スタック

- Vite / ox-content / TypeScript / Lightning CSS（素の CSS）
- 画像処理: `sharp`、カルーセル: `@splidejs/splide`
- サイトマップ: ox-content の sitemap 出力（`/api/` は静的ページに含まれない）
- 見た目の確認は `npm run build` のあと `npm run preview`。`vite` 開発サーバーは ox-content 標準のドキュメント UI になる

### 主なエントリポイント / ディレクトリ

- `content/`: ルーティング起点。`layout` と `permalink` を付ける Markdown / MDX
- `theme/layouts/` / `theme/components/`: ox-content の静的 JSX テーマ
- `workers/likes.ts`: いいね API。本番は Cloudflare KV（`LIKES_KV`）、開発・preview 時は Vite プラグインのインメモリ Map
- `src/client.ts`: クライアント CSS / JS のエントリ
- `scripts/generate-assets.mjs`: OG 画像・アイコン・Works サムネイル・ギャラリー画像を生成するアセット生成のエントリポイント（`dev` / `build` / `preview` の前に必ず実行される）
- `wrangler.jsonc`: Cloudflare Workers 設定（`LIKES_KV` バインディング、`./dist` の静的アセットなど）

### セットアップ

- Node.js は `>=24`（`package.json` の `engines`）
- 依存インストール: `npm install`

## 1. ファイル基本仕様（`file-encoding.mdc`）

- 文字コード: UTF-8（BOMなし）
- 改行コード: LF
- インデント: 2スペース
- ファイル末尾: 改行あり

### 言語仕様

- HTML: HTML5
- CSS: CSS3（Lightning CSS。ネスト / `@custom-media` / `@layer`）
- JavaScript: ES Modules
- TypeScript: 共有スクリプトとテーマで優先採用
- テーマ UI: ox-content の静的 JSX（`.tsx`、`jsxImportSource: @ox-content/vite-plugin`）

## 2. Vite / ox-content ワークフロー（`vite-workflow.mdc`）

### 開発コマンド

```bash
# 依存インストール
npm install

# 開発サーバー（http://localhost:5173）
npm run dev

# 本番ビルド（出力先: ./dist）
npm run build

# ビルド済み成果物の確認（http://localhost:4173）
npm run preview

# Cloudflare へデプロイ
npm run deploy

# ギャラリー画像生成（プリセット指定版もあり）
npm run generate:gallery
```

- `dev` / `build` / `preview` / `deploy` は実行前に `scripts/generate-assets.mjs` を走らせる。
- **テスト / lint**: 専用のテストランナーや ESLint / Prettier は導入されていない。品質確認は `npm run build` と手動の Chrome DevTools 検証（§9）で行う。新たにツールを追加する場合はユーザーに確認する。

### 基本構成

```text
プロジェクトルート/
├── content/              # Markdown / MDX（ルーティングと frontmatter）
├── theme/                # ox-content JSX テーマ（layouts / components）
├── public/               # そのまま配信するアセット
├── src/
│   ├── client.ts         # クライアント CSS / JS のエントリ
│   ├── scripts/          # 共有ブラウザスクリプト
│   ├── styles/           # Lightning CSS で処理する素の CSS
│   └── lib/              # 共有ロジック（likes API など）
├── workers/likes.ts      # /api/likes と静的 HTML 配信
├── vite.config.ts
├── wrangler.jsonc
├── package.json
└── tsconfig.json
```

### 運用ルール

1. 公開ページは `content/` の Markdown / MDX が起点。`layout` と `permalink` を付ける
2. ページ共通 UI は `theme/layouts/` と `theme/components/` に分離する
3. 自作の CSS / JS は原則 `src/` 配下に置く
4. `public/` は favicon、OGP、そのまま配信したい画像のみ置く
5. 対話 UI はバニラ JS（`js-` クラス）を維持し、React / Vue 島は追加しない
6. CSS は Dart Sass を使わず、Lightning CSS + 素の CSS で書く
7. 見た目の確認は `npm run build` のあと `npm run preview` を使う。`vite` 開発サーバーは ox-content 標準のドキュメント UI になる（カスタム JSX テーマは SSG ビルド時に適用される）

## 3. 命名規則

### 3-1. ox-content 構成・命名（`ox-content-structure.mdc`）

- テーマレイアウト: PascalCase の `.tsx`
  - 例: `Home.tsx`, `WorkDetail.tsx`
- テーマコンポーネント: PascalCase
  - 例: `Header.tsx`, `HeroSection.tsx`, `SiteShell.tsx`
- コンテンツ: ルートに対応する kebab-case
  - 例: `content/index.mdx`, `content/blog/first-post.md`
- コンテンツスラッグ: kebab-case

### 3-2. CSS 命名（`scss-naming.mdc`）

- 共有スタイル: `src/styles/`
- エントリーファイル: `main.css`
- パーシャル: `_` プレフィックスの `.css`
  - 例: `tokens.css`, `_header.css`
- コンポーネント固有スタイルは `src/styles/components/` に BEM のまま集約する
- BEM 命名:
  - Block: PascalCase
  - Element: camelCase
  - Modifier: kebab-case

### 3-3. スクリプト命名（`script-naming.mdc`）

- 共有ブラウザスクリプト: kebab-case の `.ts` を優先
  - 例: `scroll-header.ts`, `form-validation.ts`
- ユーティリティの export: camelCase
- 定数: UPPER_SNAKE_CASE
- クラス: PascalCase
- テーマ UI: PascalCase の `.tsx`

### 3-4. 画像命名（`images-naming.mdc`）

- プレフィックス:
  - `img_`（一般画像）
  - `icon_`（アイコン）
  - `logo_`（ロゴ）
- サフィックス:
  - `_pc`
  - `_sp`
- 命名形式: snake_case

## 4. HTML / テーマ マークアップ規約（`html-markup-rules.mdc`）

- 内部リンクと `public/` 配下の参照はルート相対パス
- `section`, `article`, `nav`, `aside` を適切に使用する
- **すべての `section` 要素には `id` 属性を付与する**
- `id` の値はブロッククラス名の kebab-case 版にそろえる
- **`section` 内に見出しがない場合は `div` を使用する**
- すべての `nav` に `aria-label` を付与する
- `h1` はページ内 1 つ
- 見出しはアウトライン順に使う

### 画像ルール

- 公開画像は `public/` からルート相対パスで参照する
- `alt` は必須（装飾画像は `alt=""`）
- `<img>` には `width` / `height` を必須
- SVG を `<img>` で使う場合は `role="img"` を付与
- ファーストビュー外は `loading="lazy"` を基本とする

### リンクルール

- `target="_blank"` には必ず `rel="noopener nofollow"` を設定
- 自社サイトを含め例外なし
- 公開 URL は末尾スラッシュを維持する（`/` `/works/` `/works/:slug/` など）

### script / style ルール

- サイト共通 CSS / JS は `src/client.ts` から読み、レイアウトで `/assets/client.css` と `/assets/client.js` をリンクする
- `public/` 配下の CSS / JS は最適化されない前提で使う
- ox-content テーマは静的 JSX。属性は `class` を使う

### フォームルール

- 年齢入力に `type="tel"` を使わない
- `type="number"` より `type="text" + inputmode="numeric"` を優先

## 5. CSS コーディング規約（`css-coding-standards.mdc`）

- クラスセレクタ中心
- ID セレクタ禁止
- セレクタ深さは最大 3 階層目安
- `!important` は原則禁止
- `transition: all` 禁止
- `:hover` は `@media (any-hover: hover)` 内で扱う
- インタラクティブ要素には `:focus-visible` を実装する
- `//` コメント禁止（Lightning CSS は `/* */` のみ）
- `@keyframes` はセレクタ内にネストせずトップレベルへ出す
- `&--modifier` は使わない（`--` がカスタムプロパティとして解釈される）

## 6. CSS コメント規約（`scss-comments.mdc`）

- 大きな論理ブロックは以下フォーマットで区切る

```css
/* ===========================================
   セクション名
   =========================================== */
```

- インラインコメントは補足が必要な場合のみ
- 自明な説明コメントは書かない

## 7. スクリプト規約（`script-coding-standards.mdc`）

- ES Modules を使用
- `var` 禁止（`const` / `let`）
- 共有ロジックは TypeScript 優先
- テーマ JSX はビルド時の Node 描画。ブラウザ API は `src/scripts/` または `src/client.ts` 経由でのみ使う
- DOM 操作対象は `js-` プレフィックスクラスで分離する
- 対話 UI はバニラ JS を維持し、不要な hydrate を追加しない

## 8. ボタン実装パターン（`button-patterns.mdc`）

- グラデーション背景は `::before + opacity` で切り替える
- ホバー時テキスト装飾解除を明示する
- `focus-visible` を必須にする
- SP では `max-width` と `width: 100%` で崩れないようにする

## 9. Chrome DevTools 検証（`chrome-devtools-verification.mdc` + `debug-resolution.mdc`）

フロント変更（`*.tsx`, `*.css`, `*.js`, `*.ts`）時は、可能な範囲で Chrome DevTools で検証する。

### 検証手順

1. `npm run preview` の起動 URL を開く（デフォルトは `http://localhost:4173`）
2. PC: `1920x1080`
3. SP: `390x844`
4. スクリーンショット確認
5. コンソール `error/warn` 確認
6. SP確認後は PC 解像度へ戻して最終確認

### 変更内容別チェック

- レイアウト変更: PC / SP 両方
- スタイル変更: 該当セクション確認
- スクリプト変更: コンソール + 動作確認
- アニメーション変更: 必要に応じて複数回確認

## 10. Figma MCP 後片付け（`figma-mcp-cleanup.mdc`）

- `dirForAssetWrites` でダウンロードしたアセットは実装完了時に使用有無を確認
- 未使用のハッシュ名ファイルは削除
- リネーム後に元ファイルが残る場合は削除

## 11. 品質チェックリスト（`ox-content-quality-checklist.mdc`）

- `h1` はページ内 1 つのみ
- 画像は `alt` 必須、必要に応じて `width` / `height` を付与
- 公開画像は `public/` のルート相対パスを使う
- `format-detection` を含める
- OGP 必須項目をそろえる
- `nav` に `aria-label`
- `section` に `id`
- `section` 内に見出しがない場合は `div`
- `target="_blank"` は `rel="noopener nofollow"`
- 公開 URL は末尾スラッシュを維持する
- レイアウト側で読み込み済みの CSS / JS を各ページで重複 import しない

## 12. レイアウトテンプレートルール（`ox-content-layout-template.mdc`）

`theme/components/SiteShell.tsx` / `MpShell.tsx` 固有のルール:

- デフォルト props はプロジェクト固有の値を設定し、プレースホルダーを残さない
- `meta` の属性名は小文字
- 共通メタ・共通 CSS / JS・Web フォント読み込みはシェルに集約
- 使用していない外部ライブラリは削除
- 必須メタ情報はレイアウト基盤で欠けないようにする

## 13. 補足運用

- ルールは実装基準として扱う
- ルール変更時は `AGENTS.md` と `.cursor/rules/*.mdc` を同期する
- Node.js は 24 以上
