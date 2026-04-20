---
title: find-after-pill
category: Civic Tech ─ Search Portal
description: 緊急避妊薬を扱う薬局を、現在地・都道府県・キーワード・地図から探しやすくした検索ポータル。
technologies:
  - React
  - Vite
  - TypeScript
  - Cloudflare Workers
  - Tailwind CSS
  - Leaflet
updated: "2026.03.30"
thumbnail: https://opengraph.githubassets.com/1/ozekimasaki/find-after-pill
repoUrl: https://github.com/ozekimasaki/find-after-pill
order: 5
---

## 概要

厚生労働省が公開している緊急避妊薬販売薬局データを、必要な人が迷わず探せる形に整理したポータルサイトです。位置検索・都道府県フィルター・フリーワード検索を組み合わせて、情報への到達しやすさを優先しています。

## できること

- GPS を使った現在地ベースの検索
- 都道府県やフリーワードによる絞り込み
- Leaflet + OpenStreetMap での地図表示
- GitHub Actions 経由の定期データ更新

## 技術的なポイント

- フロントは React + Vite、バックエンドは Cloudflare Workers で構成
- 変換済みデータを Cloudflare KV に保存し、API から軽く返せるようにしています
- 日次更新は GitHub Actions と self-hosted runner を組み合わせ、運用コストを抑えています
