# Issue #269 診断実装: フレーム処理時間の詳細計測

## 概要
PR 267を取り込んだ後もdemo-libraryの1フレーム処理時間が400ms以上かかっている問題を診断するため、詳細なタイミング計測ログを追加しました。

**重要な変更（PR #270 レビューコメントに基づく）:**
- デフォルトでは詳細ログは無効（パフォーマンス影響を回避）
- `setDetailedTimingLogs(true)` で有効化可能
- 無効時でも、処理時間が16.67ms（60fps目標）を超えた場合は自動的にログ出力

## 目的
- build漏れ、deploy漏れかどうかの切り分け
- フレーム処理内の各処理ステップの時間を個別に計測
- 実際のボトルネックを特定
- 通常時はログ出力を抑制してパフォーマンス影響を最小化

## 実装内容

### 1. Oscilloscope.ts の変更

**追加した機能:**
- 詳細タイミングログのON/OFFフラグ（デフォルト: OFF）
- 閾値ベースの自動ログ出力（処理時間が16.67msを超えた場合）

`render()` メソッドに以下のタイミング計測を追加:

```typescript
private render(): void {
  // ...
  const t0 = performance.now();
  
  // データ処理フェーズ
  const renderData = this.dataProcessor.processFrame(this.renderer.getFFTDisplayEnabled(), this.enableDetailedTimingLogs);
  const t1 = performance.now();
  
  if (renderData) {
    // 描画フェーズ
    this.renderFrame(renderData);
    const t2 = performance.now();
    
    // ログ出力（有効化されているか、または性能が閾値を超えた場合のみ）
    const totalTime = t2 - t0;
    if (this.enableDetailedTimingLogs || totalTime > this.TARGET_FRAME_TIME) {
      console.log(`[Frame Timing] Total: ${totalTime.toFixed(2)}ms | Data Processing: ${dataProcessingTime.toFixed(2)}ms | Rendering: ${renderingTime.toFixed(2)}ms`);
    }
  }
  // ...
}
```

**新しいAPI:**
```typescript
// 詳細ログを有効化
oscilloscope.setDetailedTimingLogs(true);

// 詳細ログの状態を取得
const enabled = oscilloscope.getDetailedTimingLogsEnabled();
```

**出力形式:**
```
[Frame Timing] Total: XXms | Data Processing: XXms | Rendering: XXms
```

### 2. WaveformDataProcessor.ts の変更

**追加した機能:**
- 詳細タイミングログのON/OFFフラグ（デフォルト: OFF）
- 閾値ベースの自動ログ出力（処理時間が16.67msを超えた場合）
- タイミング計測の精度向上（getMetadataステップを分離）

`processFrame()` メソッドに詳細なタイミング計測を追加:

```typescript
processFrame(fftDisplayEnabled: boolean): WaveformRenderData | null {
  const t0 = performance.now();
  
  // 初期化とWASMプロセッサ取得
  const t1 = performance.now();
  
  // AudioManagerから時間領域データ取得
  const dataArray = this.audioManager.getTimeDomainData();
  const t2 = performance.now();
  
  // 周波数データ取得
  let frequencyData = needsFrequencyData ? this.audioManager.getFrequencyData() : null;
  const t3 = performance.now();
  
  // WASM FFT計算（必要な場合）
  if (needsFrequencyData && !frequencyData && dataArray) {
    const computedFreqData = wasmProcessor.computeFrequencyData(dataArray, fftSize);
    // ...
  }
  const t4 = performance.now();
  
  // 設定同期
  this.syncConfigToWasm();
  const t5 = performance.now();
  
  // WASMプロセッサのprocessFrame呼び出し
  const wasmResult = wasmProcessor.processFrame(...);
  const t6 = performance.now();
  
  // WASM結果からTypeScript型への変換
  const renderData: WaveformRenderData = { ... };
  const t8 = performance.now();
  
  // 後処理（位相オフセット履歴更新など）
  this.updatePhaseOffsetHistory(renderData);
  // ...
  const t9 = performance.now();
  
  // ログ出力
  console.log(`[WaveformDataProcessor] init:${timings.init}ms | getTimeDomain:${timings.getTimeDomain}ms | getFreq:${timings.getFreqData}ms | computeFFT:${timings.computeFFT}ms | syncCfg:${timings.syncConfig}ms | WASM:${timings.wasmProcess}ms | convert:${timings.convertResult}ms | post:${timings.postProcess}ms | total:${timings.total}ms`);
  
  return renderData;
}
```

**出力形式:**
```
[WaveformDataProcessor] init:XXms | getTimeDomain:XXms | getMeta:XXms | getFreq:XXms | computeFFT:XXms | syncCfg:XXms | WASM:XXms | convert:XXms | post:XXms | total:XXms
```

**各計測項目の説明:**
- `init`: WASM processor取得と準備（t1 - t0）
- `getTimeDomain`: 時間領域データ取得（t2 - t1）
- `getMeta`: サンプルレート・FFTサイズ取得（t3 - t2）※PR #270で分離
- `getFreq`: 周波数データ取得（t4 - t3）
- `computeFFT`: WASM FFT計算（t5 - t4）
- `syncCfg`: 設定同期（t6 - t5）
- `WASM`: WASMプロセッサ処理（t7 - t6）
- `convert`: 結果変換（t9 - t8）
- `post`: 後処理（t10 - t9）
- `total`: 全体時間（t10 - t0）

**ログ制御:**
- デフォルト: 無効（パフォーマンス影響を回避）
- 有効化: `setDetailedTimingLogs(true)` を呼び出す
- 自動ログ: 処理時間が16.67ms（60fps目標）を超えた場合は自動的に出力
- `WASM`: WASMプロセッサ処理（t6 - t5）
- `convert`: 結果変換（t8 - t7）
- `post`: 後処理（t9 - t8）
- `total`: 全体時間（t9 - t0）

## 使用方法

### 1. ライブラリとして使用する場合

```bash
# ビルド
npm run build:lib

# example-library-usage.html を開く
npm run dev
# ブラウザで http://localhost:3000/example-library-usage.html にアクセス
```

**詳細ログを有効化する方法:**

1. **UIから有効化:**
   - ページ上の「Detailed Timing Logs (診断用)」チェックボックスをONにする

2. **コードから有効化:**
   ```javascript
   oscilloscope.setDetailedTimingLogs(true);
   ```

**デフォルトの動作（チェックボックスOFF）:**
- 通常時はログ出力なし（パフォーマンス影響を回避）
- フレーム処理時間が16.67ms（60fps目標）を超えた場合のみ自動的にログ出力

ブラウザのコンソールを開き、「Detailed Timing Logs」をONにしてから「Demo: Sine Wave (BufferSource)」ボタンをクリックすると、以下のようなログが出力されます:

```
[WaveformDataProcessor] init:0.12ms | getTimeDomain:0.34ms | getMeta:0.08ms | getFreq:0.23ms | computeFFT:0.00ms | syncCfg:0.15ms | WASM:2.45ms | convert:0.67ms | post:0.34ms | total:4.38ms
[Frame Timing] Total: 4.82ms | Data Processing: 4.38ms | Rendering: 0.44ms
```

### 2. テストで確認する場合

```bash
# performance-issue267.test.ts を実行
npx vitest run performance-issue267.test.ts
```

※ 注意: 現在のテスト環境ではWASMが読み込めないため、テストは失敗しますが、コンソールログで計測結果を確認できます。

## 診断手順

1. **ログが出力されるか確認**
   - 詳細ログを有効化すると新しいログフォーマットが出力される
   - ログフォーマットが変わっていれば、build漏れ・deploy漏れではないことが確認できる
   
2. **ボトルネックの特定**
   - `WASM`: 2-5msが正常、400ms以上なら異常
   - `getTimeDomain`/`getFreq`: 通常1ms以下
   - `computeFFT`: BufferSourceモードでFFTが必要な場合のみ実行される
   
3. **期待される結果**
   - 正常時: 全体で16ms以下（60fps）
   - PR 267後の異常: 全体で400ms以上
   - ログで各ステップの時間がわかるので、どこが遅いか特定できる

## 期待される効果

この詳細ログにより:
1. ログが変化すれば、build漏れ・deploy漏れではないことが確認できる
2. どの処理ステップが遅いのか特定できる（WASM、FFT計算、データ取得など）
3. 実際の性能ボトルネックを特定し、適切な対策を立てられる

## 参考

- Issue: [#269](https://github.com/cat2151/cat-oscilloscope/issues/269)
- 関連PR: [#267](https://github.com/cat2151/cat-oscilloscope/pull/267) - BufferSourceの性能改善
