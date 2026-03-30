---
name: chrome-devtools
description: Chrome DevTools MCPを使用してブラウザの操作、デバッグ、パフォーマンス分析を行う。ブラウザ確認、スクリーンショット、コンソールエラー確認、パフォーマンステスト、レスポンシブ確認時に使用。
---

# Chrome DevTools MCP

## 概要

Chrome DevTools MCPは、Chromeブラウザを制御・検査するためのツール群を提供する。ページのナビゲーション、要素操作、スクリーンショット、パフォーマンス分析などが可能。

## プロジェクト固有ルール

### 解像度設定

**必須**: デバッグ時はフルHD解像度（1920x1080）で確認する。

```javascript
// PC表示確認時（デフォルト）
resize_page({ width: 1920, height: 1080 })

// SP確認時
resize_page({ width: 390, height: 844 })

// SP確認後は必ずPCに戻す
resize_page({ width: 1920, height: 1080 })
```

## ツール一覧

### ナビゲーション

| ツール | 用途 |
|--------|------|
| `new_page` | 新規ページを開く |
| `navigate_page` | URL移動/戻る/進む/リロード |
| `list_pages` | 開いているページ一覧 |
| `select_page` | ページを選択 |
| `close_page` | ページを閉じる |
| `wait_for` | テキスト出現を待機 |

### 入力操作

| ツール | 用途 |
|--------|------|
| `click` | 要素をクリック |
| `fill` | テキスト入力/select選択 |
| `fill_form` | フォーム一括入力 |
| `hover` | ホバー |
| `press_key` | キー押下 |
| `drag` | ドラッグ操作 |

### デバッグ

| ツール | 用途 |
|--------|------|
| `take_snapshot` | ページ構造のテキストスナップショット（**推奨**） |
| `take_screenshot` | スクリーンショット撮影 |
| `list_console_messages` | コンソールメッセージ一覧 |
| `evaluate_script` | JavaScript実行 |

### パフォーマンス

| ツール | 用途 |
|--------|------|
| `performance_start_trace` | トレース記録開始 |
| `performance_stop_trace` | トレース記録停止 |
| `performance_analyze_insight` | パフォーマンス分析 |

### エミュレーション

| ツール | 用途 |
|--------|------|
| `resize_page` | ビューポートサイズ変更 |
| `emulate` | ネットワーク/CPU/位置情報エミュレート |

## 基本ワークフロー

### ページ確認

```
1. new_page({ url: "http://localhost:8000" })
2. resize_page({ width: 1920, height: 1080 })
3. take_snapshot() または take_screenshot()
```

**注意**: BrowserSyncのポートは `tasks/_config_dev.mjs` で設定（デフォルト: 8000）。`npm run dev` でGulpを起動後にアクセス可能。

### エラー確認

```
1. navigate_page({ type: "url", url: "..." })
2. list_console_messages({ types: ["error", "warn"] })
```

### レスポンシブ確認

```
1. resize_page({ width: 1920, height: 1080 })  // PC
2. take_screenshot()
3. resize_page({ width: 390, height: 844 })    // SP
4. take_screenshot()
5. resize_page({ width: 1920, height: 1080 })  // 最終はPCに戻す
```

### パフォーマンス計測

```
1. navigate_page({ type: "url", url: "..." })
2. performance_start_trace({ reload: true, autoStop: true })
3. performance_analyze_insight() で結果確認
```

## 重要なポイント

### take_snapshot vs take_screenshot

- **take_snapshot**: ページ構造をテキストで取得。要素のuid取得に必要。**優先使用**
- **take_screenshot**: 視覚的な確認が必要な場合のみ使用

### 要素操作の流れ

1. `take_snapshot()` でページ構造とuid取得
2. 操作対象のuidを特定
3. `click({ uid: "..." })` や `fill({ uid: "...", value: "..." })` で操作

### エミュレーションオプション

```javascript
// ネットワーク制限
emulate({ networkConditions: "Slow 3G" })

// CPU制限（1-20、大きいほど遅い）
emulate({ cpuThrottlingRate: 4 })

// 位置情報
emulate({ geolocation: { latitude: 35.6762, longitude: 139.6503 } })
```

## 詳細リファレンス

ツールの詳細パラメータは [tools-reference.md](tools-reference.md) を参照。
