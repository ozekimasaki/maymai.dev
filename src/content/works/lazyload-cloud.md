---
title: lazyload-cloud
category: CLI Tool ─ Code Context
description: TypeScript / JavaScript / Python を索引化し、AI エージェント向けにコンパクトなコード文脈を返す Node CLI。
technologies:
  - TypeScript
  - Node.js
  - Cloudflare Workers
  - D1
  - R2
updated: "2026.05.02"
thumbnail: /works/lazyload-cloud.webp
repoUrl: https://github.com/ozekimasaki/lazyload-cloud
order: 5
---

## 概要

`lazyload-cloud` は、ローカルプロジェクトからコンパクトなコード文脈を構築・照会する Node CLI です。シンボル検索、参照追跡、アーキテクチャ概要の取得を、ローカル・Worker・D1/R2 直接の 3 モードで使えます。

## できること

- TS / JS / Python ソースのローカル索引化（`.lazyload/index.json`）
- `json` / `compact` / `markdown` 形式でのクエリ出力
- シンボル・関数・クラス・参照・呼び出し・型の追跡
- ファイル監視による自動再索引
- Agent Skills のスキャフォールド（`init` コマンド）
- Cloudflare Worker / D1 / R2 へのリモート同期

## 技術的なポイント

- `skills/` に 3 つの Agent Skill を同梱し、`gh skill install` でも導入可能
- 認証情報は `~/.config/lazyload-cloud/auth.json` に `0600` 権限で保存
- 設定解決の優先順位を CLI フラグ → env → auth → project config → defaults で明確化
- `doctor` コマンドでセットアップ問題を診断
