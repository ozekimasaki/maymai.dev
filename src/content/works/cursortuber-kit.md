---
title: CursorTuberKit
category: Streaming Avatar ─ AI VTuber
description: Cursor・VOICEVOX・ライブコメント連携で動く、ブラウザベースのストリーミングアバターキット。
technologies:
  - TypeScript
  - React
  - Cursor SDK
  - VOICEVOX
  - GSAP
updated: "2026.05.23"
thumbnail: /works/cursortuber-kit.webp
repoUrl: https://github.com/ozekimasaki/CursorTuberKit
order: 2
---

## 概要

CursorTuberKit は、Cursor 駆動の VTuber / PNGTuber ワークフロー向けブラウザファーストのアバターキットです。AI 返答を字幕表示し、VOICEVOX で音声合成、YouTube / Twitch / Kick のライブコメントに自動応答できます。

## できること

- SVG アバターモード（`maid_cat` / `catlin_v2`）と MotionPNGTuber モードの切り替え
- VOICEVOX 音声合成と再生駆動のリップシンク
- ライブコメント取り込みとシリアライズされた自動応答キュー
- ステージ背景の画像・ループ動画への差し替え
- クロマキー・位置・スケールの調整

## 技術的なポイント

- `@cursor/sdk` による Cursor 専用ランタイム統合
- `src/lib/audioPlayback.ts` が SVG ビゼームと MotionPNGTuber の音声解析を共通駆動
- `vendor/MotionPNGTuber_Player` をサブモジュールで追跡し、上流実装との整合を維持
- 設定は `config/defaults.json` とローカル上書き用 `config/local.json` に分離
