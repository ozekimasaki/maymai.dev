---
title: React Server Componentsと「見えない速さ」
date: "2026.02.28"
description: React Server Components がもたらすパフォーマンス改善は、ユーザーには「見えない速さ」として体験されます。
tags:
  - React
  - パフォーマンス
---

## 「速い」とは何か

Webパフォーマンスの改善は、数値で測れるものだけではありません。ユーザーが「速い」と感じるかどうかは、体感的な要素に大きく左右されます。

React Server Components（RSC）は、この「体感速度」を劇的に改善する技術です。

## Server Components の本質

RSC の真の価値は、クライアントに送信する JavaScript の量を削減できることにあります。

サーバーサイドでレンダリングされたコンポーネントは、HTML として送信されるため、クライアントでの hydration コストがゼロになります。

## 実装のベストプラクティス

- **データフェッチはサーバーで** — API 呼び出しを Server Component 内に閉じ込める
- **Client Component は最小限に** — インタラクティブな部分だけを切り出す
- **Suspense で段階的に表示** — ユーザーに待ち時間を感じさせない
