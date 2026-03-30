---
name: create-design-system-rules
description: Generates custom design system rules for the user's codebase. Use when user says "create design system rules", "generate rules for my project", "set up design rules", "customize design system guidelines", or wants to establish project-specific conventions for Figma-to-code workflows. Requires Figma MCP server connection.
metadata:
  mcp-server: figma, figma-desktop
---

# Create Design System Rules

## Overview

This skill helps you generate custom design system rules tailored to your project's specific needs. These rules guide Claude to produce consistent, high-quality code when implementing Figma designs, ensuring that your team's conventions, component patterns, and architectural decisions are followed automatically.

## What Are Design System Rules?

Design system rules are project-level instructions that encode the "unwritten knowledge" of your codebase - the kind of expertise that experienced developers know and would pass on to new team members:

- Which layout primitives and components to use
- Where component files should be located
- How components should be named and structured
- What should never be hardcoded
- How to handle design tokens and styling
- Project-specific architectural patterns

Once defined, these rules dramatically reduce repetitive prompting and ensure consistent output across all Figma implementation tasks.

## Prerequisites

- Figma MCP server must be connected and accessible
- Access to the project codebase for analysis
- Understanding of your team's component conventions (or willingness to establish them)

## When to Use This Skill

Use this skill when:

- Starting a new project that will use Figma designs
- Onboarding Claude to an existing project with established patterns
- Standardizing Figma-to-code workflows across your team
- Updating or refining existing design system conventions
- Users explicitly request: "create design system rules", "set up Figma guidelines", "customize rules for my project"

## Required Workflow

**Follow these steps in order. Do not skip steps.**

### Step 1: Run the Create Design System Rules Tool

Call the Figma MCP server's `create_design_system_rules` tool to get the foundational prompt and template.

**Parameters:**

- `clientLanguages`: Comma-separated list of languages used in the project (e.g., "typescript,javascript", "python", "javascript")
- `clientFrameworks`: Framework being used (e.g., "react", "vue", "svelte", "angular", "unknown")

This tool returns guidance and a template for creating design system rules.

Structure your design system rules following the template format provided in the tool's response.

### Step 2: Analyze the Codebase

Before finalizing rules, analyze the project to understand existing patterns:

**このプロジェクトの構成（Gulp + Pug + SCSS + Browserify）:**

**Pugテンプレート構成:**

- ページファイル: `src/index.pug`（ビルド対象）
- レイアウト: `src/_layout.pug`（共通レイアウト）
- パーツ: `src/_partials/`（`_`プレフィックス付き、コンパイル対象外）
- インクルード: `src/assets/include/`（開発用パーツ）

**スタイリング:**

- SCSS（Dart Sass）を使用、BEM風命名規則
- エントリー: `src/assets/css/main.scss`
- パーシャル: `src/assets/css/_partials/`（`_variables.scss`, `_mixin.scss`等）
- CSS変数（`:root`）でカラー、フォント、z-index、トランジション時間を管理
- レスポンシブ: `@include mq(pc)` / `@include mq(sp)` mixin

**JavaScript:**

- ES6モジュール → Browserify + Babelでバンドル
- エントリー: `src/assets/js/app.js` → `dist/assets/js/main.js`
- コンポーネント: `src/assets/js/components/`

**画像:**

- `src/assets/images/` に配置
- 命名規則: `img_`, `icon_`, `logo_` プレフィックス
- レスポンシブ: `_pc`/`_sp` サフィックス

### Step 3: Generate Project-Specific Rules

Based on your codebase analysis, create a comprehensive set of rules. Include:

#### General Component Rules

```markdown
- IMPORTANT: 既存のPugパーツ（`src/_partials/`）を優先的に再利用する
- 新規Pugパーツは `src/_partials/` に `_`プレフィックス付きで配置
- SCSSファイルは `src/assets/css/` に配置し、`main.scss`でインポート
- JSコンポーネントは `src/assets/js/components/` に配置し、`app.js`でインポート
- 画像は `src/assets/images/` に命名規則に従って配置
```

#### Styling Rules

```markdown
- SCSSでBEM風命名規則（`.block__element--modifier`）を使用
- CSS変数は `_variables.scss` の `:root` で定義
- IMPORTANT: カラーは必ずCSS変数（`--color-*`）を使用し、ハードコードしない
- margin/padding/font-sizeなどの数値はベタ書き（過度な変数化を避ける）
- レスポンシブは `@include mq(pc)` / `@include mq(sp)` mixinを使用
```

#### Figma MCP Integration Rules

```markdown
## Figma MCP Integration Rules

These rules define how to translate Figma inputs into code for this project and must be followed for every Figma-driven change.

### Required Flow (do not skip)

1. Run get_design_context first to fetch the structured representation for the exact node(s)
2. If the response is too large or truncated, run get_metadata to get the high-level node map, then re-fetch only the required node(s) with get_design_context
3. Run get_screenshot for a visual reference of the node variant being implemented
4. Only after you have both get_design_context and get_screenshot, download any assets needed and start implementation
5. Translate the output (usually React + Tailwind) into Pug + SCSS + vanilla JS
6. Validate against Figma for 1:1 look and behavior before marking complete

### Implementation Rules

- Treat the Figma MCP output (React + Tailwind) as a **design specification only**, not as final code
- HTMLはPugテンプレートに変換（ドット記法でクラス、インデントベース）
- TailwindユーティリティクラスはSCSS（BEM風命名規則）に変換
- 既存のPugパーツ（`src/_partials/`）を再利用し、重複を避ける
- CSS変数（`--color-*`, `--font-*`）を一貫して使用
- レスポンシブは `@include mq(pc)` / `@include mq(sp)` で対応
- 1:1のビジュアル忠実度を目指す
- BrowserSync（localhost:8000）で最終確認
```

#### Asset Handling Rules

```markdown
## Asset Handling

- The Figma MCP server provides an assets endpoint which can serve image and SVG assets
- IMPORTANT: If the Figma MCP server returns a localhost source for an image or SVG, use that source directly
- IMPORTANT: DO NOT import/add new icon packages - all assets should be in the Figma payload
- IMPORTANT: DO NOT use or create placeholders if a localhost source is provided
- Store downloaded assets in `src/assets/images/` with命名規則に従ったリネーム
- 画像プレフィックス: `img_`（一般画像）, `icon_`（アイコン）, `logo_`（ロゴ）
- レスポンシブ画像: `_pc`/`_sp` サフィックスで区別
- IMPORTANT: Figma MCPでダウンロードしたハッシュ名ファイルは実装完了後に必ず削除
```

#### Project-Specific Conventions

```markdown
## Project-Specific Conventions

- ビルドシステム: Gulp 5（`npm run dev` / `npm run build`）
- HTMLテンプレート: Pug（`_`プレフィックスはコンパイル対象外）
- CSS: SCSS（Dart Sass）、BEM風命名規則
- JS: ES6モジュール → Browserify + Babel でバンドル
- ローカルサーバー: BrowserSync（localhost:8000）
- 本番ビルド: CSS圧縮、JS圧縮、console.log削除
```

### Step 4: Save Rules to CLAUDE.md

Guide the user to save the generated rules to the `CLAUDE.md` file in their project root:

```markdown
# MCP Servers

## Figma MCP Server Rules

[Paste generated rules here]
```

After saving, the rules will be automatically loaded by Claude Code and applied to all Figma implementation tasks.

### Step 5: Validate and Iterate

After creating rules:

1. Test with a simple Figma component implementation
2. Verify Claude follows the rules correctly
3. Refine any rules that aren't working as expected
4. Share with team members for feedback
5. Update rules as the project evolves

## Rule Categories and Examples

### Essential Rules (Always Include)

**ファイル配置:**

```markdown
- Pugパーツは `src/_partials/` に `_`プレフィックス付きで配置（例: `_header.pug`）
- SCSSは `src/assets/css/` に配置、パーシャルは `_partials/` 内に `_`プレフィックス付き
- JSコンポーネントは `src/assets/js/components/` に配置
- 画像は `src/assets/images/` に命名規則に従って配置
```

**デザイントークン:**

```markdown
- カラーはCSS変数として `_variables.scss` の `:root` で定義（`--color-*`）
- IMPORTANT: カラーをハードコードしない - 必ず `var(--color-*)` を使用
- フォントはCSS変数（`--font-base`, `--font-mono`）で管理
- ブレークポイントはSCSS変数 `$breakpoint: 750px` で管理
```

**スタイリング:**

```markdown
- SCSSでBEM風命名規則（`.block__element--modifier`）を使用
- `@use` でパーシャルをインポート（`@import`は非推奨）
- レスポンシブは `@include mix.mq(pc)` / `@include mix.mq(sp)` を使用
```

### Recommended Rules (Highly Valuable)

**Pugパターン:**

```markdown
- Pugパーツはmixinで再利用可能にする
- BEM修飾子はPugのクラス連結で表現（`.block.block--modifier`）
- `br.pc-only` / `br.sp-only` でレスポンシブ改行
```

**インポート規則:**

```markdown
- SCSSは `@use "パス" as 名前空間;` 形式でインポート
- JSは `import` 文で相対パスを使用（Browserifyでバンドル）
- Pugは `include` でパーツを読み込む
```

**コード品質:**

```markdown
- JSの関数にはJSDocコメントを付ける
- SCSSのセクション区切りコメントを使用
- margin/padding/font-sizeはベタ書き（過度な変数化を避ける）
```

### Optional Rules (Project-Specific)

**アクセシビリティ:**

```markdown
- imgタグには必ずalt属性を付ける
- カラーコントラストはWCAG AA基準を満たす
- キーボード操作可能なインタラクションにする
```

**パフォーマンス:**

```markdown
- 画像はWebP形式を優先使用
- PC/SP用に画像を分ける（`_pc`/`_sp`サフィックス）
- アイコンはSVGファイルを使用（アイコンフォント不使用）
```

**画像管理:**

```markdown
- 画像プレフィックス: `img_`（一般）、`icon_`（アイコン）、`logo_`（ロゴ）
- レスポンシブ画像: `_pc`/`_sp` サフィックスで区別
- Figma MCPでダウンロードしたハッシュ名ファイルは実装完了後に削除
```

## Examples

### Example 1: Gulp + Pug + SCSS Project（このプロジェクト）

User says: "Create design system rules for my project"

**Actions:**

1. Run `create_design_system_rules(clientLanguages="javascript", clientFrameworks="unknown")`
2. Analyze codebase structure
3. Generate rules:

```markdown
# Figma MCP Integration Rules

## File Organization

- Pugパーツ: `src/_partials/`（`_`プレフィックス付き）
- SCSS: `src/assets/css/`（`main.scss`がエントリー）
- JS: `src/assets/js/`（`app.js`がエントリー）
- 画像: `src/assets/images/`

## Figma Implementation Flow

1. Run get_design_context for the node
2. Run get_screenshot for visual reference
3. FigmaカラーをCSS変数（`--color-*`）にマッピング
4. 既存のPugパーツ（`src/_partials/`）を再利用
5. BrowserSync（localhost:8000）で確認

## Styling Rules

- IMPORTANT: SCSSでBEM風命名規則を使用
- カラーはCSS変数（`:root`の`--color-*`）で管理
- レスポンシブは `@include mq(pc)` / `@include mq(sp)` を使用
- margin/padding/font-sizeはベタ書き

## Asset Rules

- IMPORTANT: Use localhost sources from Figma MCP server directly
- 画像は `src/assets/images/` に命名規則に従って保存
- ハッシュ名ファイルは実装完了後に削除
```

4. Save to project rules
5. Test with a simple section implementation

**Result:** Gulp + Pug + SCSS構成に最適化されたルールが適用される。

### Example 2: Vue + Custom CSS Project

User says: "Set up Figma rules for my Vue app"

**Actions:**

1. Run `create_design_system_rules(clientLanguages="typescript,javascript", clientFrameworks="vue")`
2. Discover that project uses CSS modules and a custom design token system
3. Generate rules:

```markdown
# Figma MCP Integration Rules

## Component Organization

- Components are in `src/components/`
- Composables are in `src/composables/`
- Vue SFC structure: <script setup>, <template>, <style scoped>

## Design Tokens

- IMPORTANT: All colors defined in `src/styles/tokens.css` as CSS variables
- Use `var(--color-primary)`, `var(--color-secondary)`, etc.
- Spacing: `var(--space-xs)` through `var(--space-xl)`
- Typography: `var(--text-sm)` through `var(--text-2xl)`

## Figma Implementation Flow

1. Run get_design_context and get_screenshot
2. Translate React output to Vue 3 Composition API
3. Map Figma colors to CSS variables in `src/styles/tokens.css`
4. Use CSS Modules for component styles
5. Check for existing components in `src/components/` before creating new ones

## Styling Rules

- Use CSS Modules (`.module.css` files)
- IMPORTANT: Reference design tokens, never hardcode values
- Scoped styles with CSS modules
```

4. Save to `CLAUDE.md` in project root
5. Validate with a card component

**Result:** Claude now correctly translates Figma designs to Vue components using the project's design token system.

### Example 3: Design System Team

User says: "Generate rules for our design system library"

**Actions:**

1. Run `create_design_system_rules(clientLanguages="typescript", clientFrameworks="react")`
2. Analyze the monorepo structure with design system package
3. Generate comprehensive rules:

```markdown
# Design System Rules

## Repository Structure

- Design system components: `packages/design-system/src/components/`
- Documentation: `packages/docs/`
- Design tokens: `packages/tokens/src/`

## Component Development

- IMPORTANT: All components must be in `packages/design-system/src/components/`
- Component file structure: `ComponentName/index.tsx`, `ComponentName.stories.tsx`, `ComponentName.test.tsx`
- Export all components from `packages/design-system/src/index.ts`

## Design Tokens

- Colors: `packages/tokens/src/colors.ts`
- Typography: `packages/tokens/src/typography.ts`
- Spacing: `packages/tokens/src/spacing.ts`
- IMPORTANT: Never hardcode values - import from tokens package

## Documentation Requirements

- Add Storybook story for every component
- Include JSDoc with @example
- Document all props with descriptions
- Add accessibility notes

## Figma Integration

1. Get design context and screenshot from Figma
2. Map Figma tokens to design system tokens
3. Create or extend component in design system package
4. Add Storybook stories showing all variants
5. Validate against Figma screenshot
6. Update documentation
```

4. Save to `CLAUDE.md` and share with team
5. Add to team documentation

**Result:** Entire team follows consistent patterns when adding components from Figma to the design system.

## Best Practices

### Start Simple, Iterate

Don't try to capture every rule upfront. Start with the most important conventions and add rules as you encounter inconsistencies.

### Be Specific

Instead of: "Use the design system"
Write: "ヘッダーは `src/_partials/_header.pug` のパーツを `include` で読み込み、SCSSは `src/assets/css/_header.scss` に記述する"

### Make Rules Actionable

Each rule should tell Claude exactly what to do, not just what to avoid.

Good: "カラーは `_variables.scss` の `:root` でCSS変数として定義 - `var(--color-*)` で参照する"
Bad: "カラーをハードコードしない"

### Use IMPORTANT for Critical Rules

Prefix rules that must never be violated with "IMPORTANT:" to ensure Claude prioritizes them.

```markdown
- IMPORTANT: Never expose API keys in client-side code
- IMPORTANT: Always sanitize user input before rendering
```

### Document the Why

When rules seem arbitrary, explain the reasoning:

```markdown
- SCSSのパーシャルは `@use` でインポートする（Dart Sassの推奨に準拠、`@import`は将来削除予定）
- 画像は `src/assets/images/` に命名規則に従って配置する（copyタスクで `dist/` に自動コピーされる）
```

## Common Issues and Solutions

### Issue: Claude isn't following the rules

**Cause:** Rules may be too vague or not properly loaded into the IDE/MCP client.
**Solution:**

- Make rules more specific and actionable
- Verify rules are saved in the correct configuration file
- Restart your IDE or MCP client to reload rules
- Add "IMPORTANT:" prefix to critical rules

### Issue: Rules conflict with each other

**Cause:** Contradictory or overlapping rules.
**Solution:**

- Review all rules for conflicts
- Establish a clear priority hierarchy
- Remove redundant rules
- Consolidate related rules into single, clear statements

### Issue: Too many rules make Claude slow

**Cause:** Excessive rules increase context size and processing time.
**Solution:**

- Focus on the 20% of rules that solve 80% of consistency issues
- Remove overly specific rules that rarely apply
- Combine related rules
- Use progressive disclosure (basic rules first, advanced rules in linked files)

### Issue: Rules become outdated as project evolves

**Cause:** Codebase changes but rules don't.
**Solution:**

- Schedule periodic rule reviews (monthly or quarterly)
- Update rules when architectural decisions change
- Version control your rule files
- Document rule changes in commit messages

## Understanding Design System Rules

Design system rules transform how Claude works with your Figma designs:

**Before rules:**

- Claude makes assumptions about component structure
- Inconsistent styling approaches across implementations
- Hardcoded values that don't match design tokens
- Components created in random locations
- Repetitive explanations of project conventions

**After rules:**

- Claude automatically follows your conventions
- Consistent component structure and styling
- Proper use of design tokens from the start
- Components organized correctly
- Zero repetitive prompting

The time invested in creating good rules pays off exponentially across every Figma implementation task.

## Additional Resources

- [Figma MCP Server Documentation](https://developers.figma.com/docs/figma-mcp-server/)
- [Figma Variables and Design Tokens](https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma)
