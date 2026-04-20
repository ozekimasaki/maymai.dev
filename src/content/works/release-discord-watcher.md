---
title: release-discord-watcher
category: Cloudflare Worker ─ Discord Automation
description: GitHub の Release / Commit 更新を監視し、Workers AI で要約しながら Discord へ通知する Cloudflare Worker。
technologies:
  - TypeScript
  - Cloudflare Workers
  - Workers AI
  - Discord
updated: "2026.04.19"
thumbnail: https://opengraph.githubassets.com/1/ozekimasaki/release-discord-watcher
repoUrl: https://github.com/ozekimasaki/release-discord-watcher
order: 1
---

## 概要

複数の GitHub リポジトリをまとめて監視し、新しい Release や Commit を検知したら Discord に届けるための Worker です。リポジトリごとに監視モードを切り替えられるので、ライブラリのリリース追跡にも、日々のコミット監視にも使えます。

## できること

- 1つの Worker で複数リポジトリをまとめて監視
- `release` / `commit` / `both` をリポジトリ単位で設定
- Workers AI を使った日本語要約と翻訳
- Discord Webhook と Bot DM の両方に対応

## 技術的なポイント

- 最後に見た Release ID と Commit SHA を Cloudflare KV に保存し、差分だけを通知
- AI 要約に失敗した場合も、コミット一覧をもとに通知を継続できる構成
- `/health` と手動実行用の `/run` を用意し、運用とデバッグをしやすくしています
