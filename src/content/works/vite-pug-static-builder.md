---
title: vite-pug-static-builder
category: Vite Plugin ─ Static Site Builder
description: 複数の Pug ファイルを Vite ベースで静的 HTML に変換する、高速な static site builder プラグイン。
technologies:
  - TypeScript
  - Vite
  - Pug
  - Vitest
updated: "2026.03.14"
thumbnail: https://opengraph.githubassets.com/1/ozekimasaki/vite-pug-static-builder
repoUrl: https://github.com/ozekimasaki/vite-pug-static-builder
order: 3
---

## 概要

複数の Pug ファイルを静的 HTML として出力したいときに使う、Vite ベースのビルダーです。Vite の開発体験を活かしつつ、Pug のテンプレート構成をそのまま静的サイト制作に持ち込めるようにしています。

## できること

- ディレクトリ構成に沿って Pug を複数ページの HTML として出力
- build / serve で別々の `locals` や Pug オプションを設定
- HMR を使ったテンプレート開発
- Vite 6 / 7 / 8 を横断して利用

## 技術的なポイント

- Pug の `basedir` やローカル変数を開発・本番で切り替えられる API 設計
- 静的サイト用途で必要な ignore pattern や reload 制御を用意
- 複数バージョンの Vite 互換性を維持しやすいよう、テストスクリプトも整理しています
