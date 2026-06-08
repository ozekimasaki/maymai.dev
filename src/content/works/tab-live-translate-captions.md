---
title: tab-live-translate-captions
category: Chrome Extension ─ Live Captions
description: Chrome タブ音声を Deepgram / Grok で文字起こしし、Cloud Translation / Gemini で翻訳字幕を重ねる MV3 拡張。
technologies:
  - JavaScript
  - Chrome Extension MV3
  - Deepgram
  - Gemini
  - Cloud Translation
updated: "2026.04.20"
thumbnail: /works/tab-live-translate-captions.webp
repoUrl: https://github.com/ozekimasaki/tab-live-translate-captions
order: 4
---

## 概要

現在の Chrome タブの音声を取得し、リアルタイムで翻訳字幕をページ上にオーバーレイ表示する Manifest V3 拡張です。英語・中国語・日本語の音声を、日本語または英語へ翻訳できます。

## できること

- アクティブタブ音声のキャプチャと字幕化
- STT プロバイダの選択（Deepgram `nova-3` / Grok xAI）
- 翻訳プロバイダの選択（Cloud Translation / Gemini）
- 字幕バーのドラッグ移動と背景透過率の調整
- 低遅延 / 標準 / 自然の字幕区切りモード
- popup からの runtime log 確認・コピー・クリア

## 技術的なポイント

- offscreen document で AudioWorklet による 16kHz mono PCM 変換
- Deepgram の interim transcript を使った speculative translation で初速を改善
- API キーは `chrome.storage.local` に保存し、サーバー中継なし
- セッションは常に 1 つに制限し、タブ切り替え時の競合を防止
