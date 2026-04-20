---
title: vite-plugin-image-sizes
category: Vite Plugin ─ Web Performance
description: HTML 内の img / source に width・height を自動付与し、CLS を抑える Vite プラグイン。
technologies:
  - TypeScript
  - Vite
  - Sharp
  - HTML
updated: "2026.03.15"
thumbnail: https://opengraph.githubassets.com/1/ozekimasaki/vite-plugin-image-sizes
repoUrl: https://github.com/ozekimasaki/vite-plugin-image-sizes
order: 2
---

## 概要

ビルド時と開発時の両方で HTML を処理し、`<img>` と `<source>` に `width` / `height` を埋め込む Vite プラグインです。画像サイズをマークアップに反映して、Cumulative Layout Shift を減らすことを目的にしています。

## できること

- `img` と `source` の画像サイズを自動取得して属性を付与
- `loading="lazy"` の自動追加オプション
- Vite の `serve` と `build` の両方に対応
- `publicDir: false` やクエリ付き URL も考慮したパス解決

## 技術的なポイント

- 開発時は `transformIndexHtml`、本番ビルドでは `closeBundle` で最終 HTML を書き換え
- 画像メタデータ取得には `sharp` を使い、高速に寸法を解決
- 同一画像の重複処理を減らすため、セッション内キャッシュを持たせています
