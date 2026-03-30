# Chrome DevTools MCP ツール詳細リファレンス

## ナビゲーション

### new_page

新規ページを開く。

```javascript
new_page({
  url: "https://example.com",  // 必須
  timeout: 30000               // オプション（ms）
})
```

### navigate_page

現在のページをナビゲート。

```javascript
// URL移動
navigate_page({ type: "url", url: "https://example.com" })

// 戻る/進む/リロード
navigate_page({ type: "back" })
navigate_page({ type: "forward" })
navigate_page({ type: "reload", ignoreCache: true })
```

### list_pages

開いているページ一覧を取得。引数なし。

### select_page

操作対象ページを選択。

```javascript
select_page({ index: 0 })  // 0から始まるインデックス
```

### close_page

現在選択中のページを閉じる。引数なし。

### wait_for

指定テキストの出現を待機。

```javascript
wait_for({
  text: "ログイン完了",  // 必須
  timeout: 5000          // オプション（ms）
})
```

---

## 入力操作

### click

要素をクリック。

```javascript
click({
  uid: "element-uid",  // 必須: take_snapshotで取得
  dblClick: false      // オプション: ダブルクリック
})
```

### fill

テキスト入力またはselect選択。

```javascript
fill({
  uid: "input-uid",     // 必須
  value: "入力テキスト"  // 必須
})
```

### fill_form

複数フィールドを一括入力。

```javascript
fill_form({
  elements: [
    { uid: "name-input", value: "山田太郎" },
    { uid: "email-input", value: "test@example.com" }
  ]
})
```

### hover

要素にホバー。

```javascript
hover({ uid: "menu-item" })
```

### press_key

キーボード入力。

```javascript
press_key({ key: "Enter" })
press_key({ key: "Tab" })
press_key({ key: "Escape" })
```

### drag

ドラッグ操作。

```javascript
drag({
  sourceUid: "draggable-item",
  targetUid: "drop-zone"
})
```

### upload_file

ファイルアップロード。

```javascript
upload_file({
  uid: "file-input",
  filePath: "/path/to/file.pdf"
})
```

### handle_dialog

ダイアログ（alert/confirm/prompt）を処理。

```javascript
handle_dialog({
  action: "accept",      // "accept" または "dismiss"
  promptText: "入力値"   // promptダイアログ用
})
```

---

## デバッグ

### take_snapshot

ページ構造のテキストスナップショット取得。要素のuid取得に使用。

```javascript
take_snapshot({
  verbose: false,            // オプション: 詳細情報を含める
  filePath: "snapshot.txt"   // オプション: ファイル保存
})
```

### take_screenshot

スクリーンショット撮影。

```javascript
take_screenshot({
  format: "png",             // "png" | "jpeg" | "webp"
  quality: 80,               // jpeg/webp用（0-100）
  fullPage: true,            // フルページ撮影
  uid: "element-uid",        // 特定要素のみ撮影
  filePath: "screenshot.png" // ファイル保存
})
```

### list_console_messages

コンソールメッセージ一覧取得。

```javascript
list_console_messages({
  types: ["error", "warn"],  // フィルタ
  pageSize: 50,              // 取得件数
  pageIdx: 0                 // ページ番号
})
```

**typeオプション**: `log`, `debug`, `info`, `error`, `warn`, `dir`, `table`, `trace`

### get_console_message

特定のコンソールメッセージ詳細取得。

```javascript
get_console_message({ id: "message-id" })
```

### evaluate_script

JavaScript実行。

```javascript
// 戻り値あり
evaluate_script({
  function: "() => { return document.title; }"
})

// 要素を引数として渡す
evaluate_script({
  function: "(el) => { return el.innerText; }",
  args: [{ uid: "element-uid" }]
})

// async関数
evaluate_script({
  function: "async () => { return await fetch('/api/data').then(r => r.json()); }"
})
```

---

## パフォーマンス

### performance_start_trace

トレース記録開始。

```javascript
performance_start_trace({
  reload: true,              // 必須: ページリロードするか
  autoStop: true,            // 必須: 自動停止するか
  filePath: "trace.json.gz"  // オプション: トレースデータ保存
})
```

### performance_stop_trace

トレース記録停止。`autoStop: false`の場合に使用。

```javascript
performance_stop_trace({
  filePath: "trace.json.gz"  // オプション
})
```

### performance_analyze_insight

トレースデータからパフォーマンス分析結果を取得。

```javascript
performance_analyze_insight({ insightId: "insight-id" })
```

---

## エミュレーション

### resize_page

ビューポートサイズ変更。

```javascript
resize_page({
  width: 1920,   // 必須
  height: 1080   // 必須
})
```

**標準サイズ**:
- PC: `1920 x 1080`
- Tablet: `768 x 1024`
- SP (iPhone): `390 x 844`

### emulate

環境エミュレーション。

```javascript
emulate({
  // ネットワーク制限
  networkConditions: "Slow 3G",
  // "No emulation" | "Offline" | "Slow 3G" | "Fast 3G" | "Slow 4G" | "Fast 4G"

  // CPU制限（1-20、大きいほど遅い）
  cpuThrottlingRate: 4,

  // 位置情報
  geolocation: { latitude: 35.6762, longitude: 139.6503 }
  // null で解除
})
```

---

## ネットワーク

### list_network_requests

ネットワークリクエスト一覧取得。

```javascript
list_network_requests({
  pageSize: 100,
  pageIdx: 0,
  resourceTypes: ["fetch", "xhr"],  // フィルタ
  statusCodes: [404, 500]           // ステータスコードフィルタ
})
```

### get_network_request

特定リクエストの詳細取得。

```javascript
get_network_request({ id: "request-id" })
```
