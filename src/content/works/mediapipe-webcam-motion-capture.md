---
title: mediapipe-webcam-motion-capture
category: Web App ─ Motion Capture
description: MediaPipe だけで WebcamMotionCapture 相当のモーションキャプチャをブラウザで実現する Web アプリ。
technologies:
  - TypeScript
  - MediaPipe
  - Three.js
  - VRM
  - Cloudflare Workers
updated: "2026.05.30"
thumbnail: /works/mediapipe-webcam-motion-capture.webp
repoUrl: https://github.com/ozekimasaki/mediapipe-webcam-motion-capture
order: 1
---

## 概要

Web カメラと MediaPipe だけで、ボディ・フェイス・ハンドのトラッキングを行うブラウザ向けモーションキャプチャアプリです。VRM プレビュー、JSON 出力、WebSocket ストリーミング、VMC Protocol OSC ブリッジまで一通り揃えています。

## できること

- ワイヤーフレームプレビューとカメラデバイス選択
- Pose 品質（Lite / Full / Heavy）の切り替え
- ローカル VRM モデルのプレビューと表情ブレンドシェイプ
- モーション JSON の記録・コピー・ダウンロード
- WebSocket 経由でのリアルタイム配信（約 30fps）
- VMC Protocol OSC ブリッジによる外部アプリ連携

## 技術的なポイント

- Cloudflare Workers 上にデプロイ可能（[ライブデモ](https://mediapipe-webcam-motion-capture.maigo999.workers.dev)）
- `mediapipe-motion.v1` スキーマでアバター向け JSON を出力
- 指の curl 値から Unity `HumanBodyBones` 名にマッピングして OSC 送信
- `npm run verify` でブリッジと OSC 出力を自動検証
