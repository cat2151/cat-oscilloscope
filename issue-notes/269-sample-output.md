# Issue #269 診断ログのサンプル出力

## 概要
このドキュメントは、issue #269の診断実装によって出力されるログのサンプルを示します。

## ログ形式

### 1. WaveformDataProcessor の詳細ログ
フレームごとに以下の形式でログが出力されます:

```
[WaveformDataProcessor] init:0.12ms | getTimeDomain:0.34ms | getFreq:0.23ms | computeFFT:0.00ms | syncCfg:0.15ms | WASM:2.45ms | convert:0.67ms | post:0.34ms | total:4.30ms
```

#### 各項目の説明:
- `init`: WASM processor取得と準備
- `getTimeDomain`: 時間領域データ取得（AudioManager）
- `getFreq`: 周波数データ取得（AudioManager）
- `computeFFT`: WASM FFT計算（BufferSourceモードで必要時のみ）
- `syncCfg`: TypeScript設定をWASMに同期
- `WASM`: WASMプロセッサのprocessFrame呼び出し（**最重要**）
- `convert`: WASM結果からTypeScript型への変換
- `post`: 後処理（位相オフセット履歴更新など）
- `total`: processFrame全体の時間

### 2. Oscilloscope の要約ログ
各フレームの処理と描画の時間を要約:

```
[Frame Timing] Total: 4.82ms | Data Processing: 4.30ms | Rendering: 0.52ms
```

#### 各項目の説明:
- `Total`: フレーム全体の処理時間
- `Data Processing`: WaveformDataProcessor.processFrame の時間
- `Rendering`: Canvas描画の時間

---

## 正常時の出力例

### example-library-usage.html で BufferSource モード（440Hz サイン波）

```
[WaveformDataProcessor] init:0.08ms | getTimeDomain:0.31ms | getFreq:0.00ms | computeFFT:0.00ms | syncCfg:0.12ms | WASM:2.12ms | convert:0.58ms | post:0.28ms | total:3.49ms
[Frame Timing] Total: 4.01ms | Data Processing: 3.49ms | Rendering: 0.52ms

[WaveformDataProcessor] init:0.06ms | getTimeDomain:0.28ms | getFreq:0.00ms | computeFFT:0.00ms | syncCfg:0.10ms | WASM:2.34ms | convert:0.61ms | post:0.31ms | total:3.70ms
[Frame Timing] Total: 4.18ms | Data Processing: 3.70ms | Rendering: 0.48ms

[WaveformDataProcessor] init:0.07ms | getTimeDomain:0.30ms | getFreq:0.00ms | computeFFT:0.00ms | syncCfg:0.11ms | WASM:2.21ms | convert:0.59ms | post:0.29ms | total:3.57ms
[Frame Timing] Total: 4.05ms | Data Processing: 3.57ms | Rendering: 0.48ms
```

**観察:**
- 全体で4ms前後 ✅ （60fps = 16ms以下なので正常）
- WASM処理が2ms前後 ✅ （正常範囲）
- 描画が0.5ms前後 ✅ （正常範囲）

---

## 異常時の出力例（想定）

### Issue #269 で報告されている問題が発生している場合:

```
[WaveformDataProcessor] init:0.08ms | getTimeDomain:0.32ms | getFreq:0.21ms | computeFFT:0.00ms | syncCfg:0.13ms | WASM:412.45ms | convert:0.67ms | post:0.35ms | total:414.21ms
[Frame Timing] Total: 414.82ms | Data Processing: 414.21ms | Rendering: 0.61ms

[WaveformDataProcessor] init:0.07ms | getTimeDomain:0.29ms | getFreq:0.23ms | computeFFT:0.00ms | syncCfg:0.12ms | WASM:408.12ms | convert:0.63ms | post:0.32ms | total:409.78ms
[Frame Timing] Total: 410.34ms | Data Processing: 409.78ms | Rendering: 0.56ms
```

**観察:**
- 全体で400ms以上 ❌ （60fps目標の16msを大きく超える）
- WASM処理が400ms以上 ❌ （**明らかな異常**）
- 描画は正常（0.5ms前後） ✅
- その他の処理も正常（数msまで） ✅

**診断結果:**
- ボトルネックは明らかにWASM処理
- getTimeDomain, getFreq, 描画などは正常
- **WASM processFrame 内部の処理に問題あり**

---

## FFT表示有効時の出力例

### FFT Display をONにした場合:

```
[WaveformDataProcessor] init:0.09ms | getTimeDomain:0.33ms | getFreq:0.42ms | computeFFT:1.23ms | syncCfg:0.14ms | WASM:3.12ms | convert:0.71ms | post:0.38ms | total:6.42ms
[Frame Timing] Total: 7.15ms | Data Processing: 6.42ms | Rendering: 0.73ms
```

**観察:**
- `getFreq` と `computeFFT` に時間がかかる（FFT計算のため）
- それでも全体で7ms程度 ✅ （60fps目標内）
- FFT表示によるオーバーヘッドは約2-3ms

---

## 診断の手順

### Step 1: ログの変化確認
新しいログフォーマットが出力されることを確認:
- `[WaveformDataProcessor]` で始まるログがあるか？
- `[Frame Timing]` で始まるログがあるか？

**もしログが出力されたら:**
→ build漏れ、deploy漏れではない ✅

### Step 2: ボトルネックの特定
各項目の時間を確認:
- `WASM` の時間が異常に長い（100ms以上）？
- `getTimeDomain` や `getFreq` の時間が異常に長い？
- `Rendering` の時間が異常に長い？

### Step 3: 対策の決定
特定されたボトルネックに応じた対策:
- **WASM処理が遅い** → Rust実装の最適化、アルゴリズム改善
- **データ取得が遅い** → AudioManager、AnalyserNodeの設定確認
- **描画が遅い** → Canvas描画の最適化

---

## 既存のログとの比較

### 既存のログ（PR #267以前）
```
Frame processing time: 412.34ms (target: <16.67ms)
FPS: 2.4, Avg frame time: 409.23ms
```

**問題点:**
- 全体の時間しかわからない
- どこがボトルネックか不明
- build漏れかどうか判定できない

### 新しいログ（このPR後）
```
[WaveformDataProcessor] init:0.08ms | getTimeDomain:0.32ms | getFreq:0.21ms | computeFFT:0.00ms | syncCfg:0.13ms | WASM:412.45ms | convert:0.67ms | post:0.35ms | total:414.21ms
[Frame Timing] Total: 414.82ms | Data Processing: 414.21ms | Rendering: 0.61ms
Frame processing time: 414.82ms (target: <16.67ms)
```

**改善点:**
- 各処理ステップの時間が明確 ✅
- ボトルネックが特定可能（WASM: 412.45ms） ✅
- ログが変化すれば build漏れではないと判定可能 ✅

---

## まとめ

この診断実装により:
1. **切り分け可能**: ログの変化でbuild/deploy問題を排除
2. **特定可能**: 8つの処理ステップで具体的なボトルネックを特定
3. **対策可能**: 特定されたボトルネックに対して適切な対策を実施

次のステップ:
1. このPRをマージ
2. 実際にログを確認
3. 特定されたボトルネックに対応

---

## 参考
- Issue: [#269](https://github.com/cat2151/cat-oscilloscope/issues/269)
- 実装詳細: `issue-notes/269-diagnostic-implementation.md`
