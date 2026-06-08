---
title: obs-motion-pngtuber-player
category: OBS Plugin ─ Streaming Avatar
description: MotionPNGTuber 形式の口パクアバターを OBS ソースとして使える Windows 64-bit 向け OBS プラグイン。
technologies:
  - C++
  - CMake
  - OBS Studio
  - Python
updated: "2026.04.04"
thumbnail: /works/obs-motion-pngtuber-player.webp
repoUrl: https://github.com/ozekimasaki/obs-motion-pngtuber-player
order: 3
---

## 概要

`MotionPngTuberPlayer` は、OBS 内で MotionPNGTuber 形式のアバターをそのまま使える Windows 64-bit 向けプラグインです。ループ動画・口画像フォルダ・リップシンクトラックを組み合わせ、OBS の音声ソースに同期した口パクを実現します。

## できること

- OBS ソースとして MotionPNGTuber アバターを追加
- ループ動画・口画像・トラックファイルの 3 点セットで動作
- 関連ファイルの自動検出とパス補完
- `.json` / `.npz` 形式のリップシンクトラックに対応
- OBS 標準フィルターとの併用

## 技術的なポイント

- DLL のみのリリースパッケージで、エンドユーザーに Python 環境は不要
- NumPy 生成の `.npz` トラックも直接読み込み（deflate 圧縮・big-endian 配列などに対応）
- CMake ベースのビルドと `package-release.ps1` による配布物生成
- 日本語 README（`README.JA.MD`）も同梱
