---
title: vite-plugin-glob-input
category: Vite Plugin ─ Build Tooling
description: fast-glob パターンから build.rollupOptions.input を組み立てる Vite プラグイン。
technologies:
  - TypeScript
  - Vite
  - fast-glob
  - Vitest
updated: "2026.03.13"
thumbnail: https://opengraph.githubassets.com/1/ozekimasaki/vite-plugin-glob-input
repoUrl: https://github.com/ozekimasaki/vite-plugin-glob-input
order: 4
---

## 概要

マルチページ構成の Vite プロジェクトで、`build.rollupOptions.input` を手で列挙しなくて済むようにするプラグインです。glob パターンからエントリを収集し、使いやすい alias 名も自動で生成します。

## できること

- glob パターンから複数エントリを自動収集
- `index.html` やルート直下ファイルにわかりやすい alias を付与
- alias の区切り文字やプレフィックスをカスタマイズ
- Vite 6 / 7 / 8 に対応

## 技術的なポイント

- `fast-glob` を使って大きめの入力集合でも軽快に探索
- alias 生成ロジックをオプション化し、MPA ごとの命名差分に対応
- Rolldown ベースの Vite 8 も含めた互換性を意識しています
