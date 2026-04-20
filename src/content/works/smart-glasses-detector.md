---
title: smart-glasses-detector
category: Android App ─ BLE Utility
description: 近くのスマートグラス候補を Bluetooth Low Energy で検出し、通知と履歴で確認できる Android アプリ。
technologies:
  - Kotlin
  - Android
  - Bluetooth LE
  - Notifications
updated: "2026.03.29"
thumbnail: https://opengraph.githubassets.com/1/ozekimasaki/smart-glasses-detector
repoUrl: https://github.com/ozekimasaki/smart-glasses-detector
order: 6
---

## 概要

周囲の BLE 広告データからスマートグラス候補を検出し、ユーザーに即座に知らせる Android アプリです。検出履歴や診断ログの共有にも対応し、日常利用と調査の両方を意識して設計しています。

## できること

- BLE 広告データを使ったスマートグラス候補の検出
- 通知・バイブレーション・音による即時アラート
- 端末内への履歴保存
- JSON 形式の診断ログ共有

## 技術的なポイント

- Android バージョンごとの Bluetooth 権限差分を踏まえた実装
- Android 12 以上では、設定次第でユーザー開始中の探索をバックグラウンド継続
- 取得データを通常利用時に自動送信しない、端末内完結寄りのプライバシー設計です
