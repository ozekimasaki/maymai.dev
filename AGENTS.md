# AGENTS.md

このファイルは、`portfolio_maymai` における Codex CLI 用の実装ルールです。  
`.cursor/rules/*.mdc` の内容を Astro 前提で一元化しています。

## 優先順位

1. System / Developer / User 指示
2. この `AGENTS.md`

競合時は上位指示を優先します。

## 0. 適用スコープ

- 対象タスク: コーディング支援、リファクタリング、デバッグ、開発関連ドキュメント作成
- 対象技術: Astro / SCSS / TypeScript or JavaScript / Vite ワークフロー

## 1. ファイル基本仕様（`file-encoding.mdc`）

- 文字コード: UTF-8（BOMなし）
- 改行コード: LF
- インデント: 2スペース
- ファイル末尾: 改行あり

### 言語仕様

- HTML: HTML5
- CSS: CSS3 / SCSS
- JavaScript: ES Modules
- TypeScript: 共有スクリプトでは優先採用
- Astro コンポーネント: `.astro`

## 2. Astro ワークフロー（`astro-workflow.mdc`）

### 開発コマンド

```bash
# 開発サーバー
npm run dev

# 本番ビルド
npm run build

# ビルド済み成果物の確認
npm run preview

# 型・テンプレート検証
npx astro check
```

### 基本構成

```text
プロジェクトルート/
├── public/                 # そのまま配信するアセット
├── src/
│   ├── assets/             # Astro に最適化させる画像等
│   ├── components/         # 再利用コンポーネント
│   ├── layouts/            # 共通レイアウト
│   ├── pages/              # ルーティング対象（必須）
│   ├── scripts/            # 共有クライアントスクリプト
│   └── styles/             # 共有スタイル
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

### 運用ルール

1. `src/pages/` は必須ディレクトリとして扱う
2. ページ共通 UI は `src/layouts/` と `src/components/` に分離する
3. 自作の CSS / JS は原則 `src/` 配下に置く
4. `public/` は最適化不要のファイルのみ置く
5. 画像最適化が必要な画像は `src/assets/` から import して使う
6. デフォルトは静的 HTML を優先し、対話性が必要な箇所だけ `client:*` で hydrate する
7. 日常の確認は `npm run dev` を使い、`npm run preview` はビルド結果確認時のみ使う

## 3. 命名規則

### 3-1. Astro 構成・命名（`astro-component-structure.mdc`）

- レイアウト: PascalCase + `Layout.astro`
  - 例: `BaseLayout.astro`, `DefaultLayout.astro`
- コンポーネント: PascalCase
  - 例: `Header.astro`, `HeroSection.astro`, `ContactForm.astro`
- ページ: ルートに対応する kebab-case
  - 例: `index.astro`, `about.astro`, `contact/index.astro`, `blog/[slug].astro`
- コンテンツスラッグ: kebab-case
  - 例: `first-post.md`, `company-news.mdx`

### 3-2. SCSS 命名（`scss-naming.mdc`）

- 共有スタイル: `src/styles/`
- エントリーファイル: `global.scss` または用途が明確な名前
- パーシャル: `_` プレフィックス
  - 例: `_variables.scss`, `_mixin.scss`, `_header.scss`
- コンポーネント固有スタイルは `.astro` 内の `<style lang="scss">` を優先
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
- UI フレームワークコンポーネント: PascalCase の `.tsx` / `.jsx`

### 3-4. 画像命名（`images-naming.mdc`）

- プレフィックス:
  - `img_`（一般画像）
  - `icon_`（アイコン）
  - `logo_`（ロゴ）
- サフィックス:
  - `_pc`
  - `_sp`
- 命名形式: snake_case

## 4. HTML / Astro マークアップ規約（`html-markup-rules.mdc`）

- 内部リンクと `public/` 配下の参照はルート相対パス
- `section`, `article`, `nav`, `aside` を適切に使用
- **すべての `section` 要素には `id` 属性を付与する**
- `id` の値はブロッククラス名の kebab-case 版にそろえる
- **`section` 内に見出しがない場合は `div` を使用する**
- すべての `nav` に `aria-label` を付与する
- `h1` はページ内 1 つ
- 見出しはアウトライン順に使う

### 画像ルール

- ローカル画像は `astro:assets` の `<Image />` / `<Picture />` を優先
- `alt` は必須（装飾画像は `alt=""`）
- `public/` 画像や素の `<img>` を使う場合も `width` / `height` を必須
- SVG を `<img>` で使う場合は `role="img"` を付与
- ファーストビュー外は `loading="lazy"` を基本とする

### リンクルール

- `target="_blank"` には必ず `rel="noopener nofollow"` を設定
- 自社サイトを含め例外なし

### script / style ルール

- `.astro` 内の自作 `<script>` は Astro のバンドル対象として扱う
- **`is:inline` はサードパーティの生スニペットや素通しが必要な場合のみ使用する**
- サイト共通 CSS / JS の読み込みはレイアウトに集約する
- `public/` 配下の CSS / JS は最適化されない前提で使う
- グローバルスタイルは `src/styles/` から import し、`<style is:global>` は必要最小限にする

### フォームルール

- 年齢入力に `type="tel"` を使わない
- `type="number"` より `type="text" + inputmode="numeric"` を優先

## 5. CSS コーディング規約（`css-coding-standards.mdc`）

- グローバル CSS / SCSS ではクラスセレクタ中心
- `.astro` の scoped style 内では低詳細度の要素セレクタも許容
- ID セレクタ禁止
- セレクタ深さは最大 3 階層目安
- `!important` は原則禁止
- `transition: all` 禁止
- `:hover` は `@media (any-hover: hover)` 内で扱う
- インタラクティブ要素には `:focus-visible` を実装する

## 6. SCSS コメント規約（`scss-comments.mdc`）

- 大きな論理ブロックは以下フォーマットで区切る

```scss
// ===========================================
// セクション名
// ===========================================
```

- インラインコメントは補足が必要な場合のみ
- 自明な説明コメントは書かない

## 7. スクリプト規約（`script-coding-standards.mdc`）

- ES Modules を使用
- `var` 禁止（`const` / `let`）
- 共有ロジックは TypeScript 優先
- Astro フロントマターはサーバー側で実行される前提で扱う
- `window`, `document`, `localStorage` などブラウザ API は `.astro` の `<script>` または client component 内でのみ使う
- DOM 操作対象は `js-` プレフィックスクラスで分離する
- インタラクティブ UI は必要な場所だけ `client:load`, `client:idle`, `client:visible` を使い分ける

## 8. ボタン実装パターン（`button-patterns.mdc`）

- グラデーション背景は `::before + opacity` で切り替える
- ホバー時テキスト装飾解除を明示する
- `focus-visible` を必須にする
- SP では `max-width` と `width: 100%` で崩れないようにする

## 9. Chrome DevTools 検証（`chrome-devtools-verification.mdc` + `debug-resolution.mdc`）

フロント変更（`*.astro`, `*.scss`, `*.css`, `*.js`, `*.ts`）時は、可能な範囲で Chrome DevTools で検証する。

### 検証手順

1. `npm run dev` の起動 URL を開く（デフォルトは `http://localhost:4321`）
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

## 11. Astro 品質チェックリスト（`astro-quality-checklist.mdc`）

- `h1` はページ内 1 つのみ
- 画像は `alt` 必須、必要に応じて `width` / `height` を付与
- ローカル画像は可能な限り `astro:assets` を使う
- `format-detection` を含める
- OGP 必須項目をそろえる
- `nav` に `aria-label`
- `section` に `id`
- `section` 内に見出しがない場合は `div`
- `target="_blank"` は `rel="noopener nofollow"`
- `client:*` は最小限
- `is:inline` は本当に必要な場合のみ
- レイアウト側で読み込み済みの CSS / JS を各ページで重複 import しない

## 12. レイアウトテンプレートルール（`astro-layout-template.mdc`）

`src/layouts/BaseLayout.astro` または `src/layouts/**/*.astro` 固有のルール:

- デフォルト props はプロジェクト固有の値を設定し、プレースホルダーを残さない
- `meta` の属性名は小文字
- 共通メタ・共通 CSS / JS・Web フォント読み込みはレイアウトに集約
- ページ固有の追加 head 要素は named slot などで明示的に差し込む
- 使用していない外部ライブラリは削除
- 必須メタ情報はレイアウト基盤で欠けないようにする

## 13. 補足運用

- ルールは実装基準として扱う
- ルール変更時は `AGENTS.md` と `.cursor/rules/*.mdc` を同期する
