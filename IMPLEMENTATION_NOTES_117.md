# Issue #117: Rust WASM使用時に一部の機能（周波数推移など）が失われている問題の修正

## 概要
このissueでは、Rust WASM実装を使用する際にTypeScript実装にあった以下の機能が失われていた問題を修正し、WASMをデフォルトで有効にしました。

## 修正された機能

### 1. 周波数推移プロット (Frequency Plot History)
**問題**: WASM使用時、右上の周波数推移グラフが表示されない

**修正内容**:
- Rust側: `FrequencyEstimator`に`frequency_plot_history: Vec<f32>`を追加
- 最大100個の周波数推定値を保持（`FREQUENCY_PLOT_HISTORY_SIZE = 100`）
- `WaveformRenderData`構造体に`frequencyPlotHistory`フィールドを追加
- JavaScript側からアクセス可能なgetterを実装

### 2. STFT (Short-Time Fourier Transform) 周波数推定
**問題**: WASM使用時、STFTメソッドが利用できない

**修正内容**:
- `estimate_frequency_stft`メソッドを実装
- Hann窓関数を使用したオーバーラップウィンドウ処理（50% overlap）
- DFT計算による周波数ピーク検出
- buffer_size_multiplierによる窓サイズの調整
- 中央値フィルタリングでノイズを削減

**技術詳細**:
```rust
// 窓サイズはbuffer_size_multiplierに依存
let desired_window_size = 2048 * self.buffer_size_multiplier as usize;
let window_size = MIN_WINDOW_SIZE.max(desired_window_size.min(data.len()));
```

### 3. CQT (Constant-Q Transform) 周波数推定
**問題**: WASM使用時、CQTメソッドが利用できない

**修正内容**:
- `estimate_frequency_cqt`メソッドを実装
- 対数スケールの周波数ビン（12 bins per octave = 半音ごと）
- Goertzelアルゴリズムによる効率的な単一周波数DFT
- 低周波数域での高い周波数分解能

**技術詳細**:
```rust
// Quality factor Q - フィルタ帯域幅を決定
let q = 1.0 / (2.0f32.powf(1.0 / BINS_PER_OCTAVE as f32) - 1.0);

// 中心周波数を対数スケールで計算
let center_freq = min_freq * 2.0f32.powf(k as f32 / BINS_PER_OCTAVE as f32);
```

### 4. Buffer Size Multiplier サポート
**問題**: WASM使用時、拡張バッファサイズ設定が機能しない

**修正内容**:
- `FrequencyEstimator`に`buffer_size_multiplier: u32`フィールドを追加
- デフォルト値: 16（最高の低周波検出精度）
- `setBufferSizeMultiplier`メソッドを実装
- 入力値の検証（1, 4, 16のみ受け入れ）
- STFT/CQTで動的にウィンドウサイズを調整

### 5. MIN_FREQUENCY_HZ の調整
**変更内容**: 50Hz → 20Hz
**理由**: TypeScript実装と一致させ、STFT/CQTでの低周波検出を可能にする

## TypeScript側の変更

### WasmDataProcessor.ts
1. `WasmProcessorInstance`インターフェースに`setBufferSizeMultiplier`を追加
2. `syncConfigToWasm`でbuffer_size_multiplierを同期
3. `processFrame`で`frequencyPlotHistory`をWASM結果から取得

```typescript
// WASM結果から直接取得
frequencyPlotHistory: wasmResult.frequencyPlotHistory ? 
  Array.from(wasmResult.frequencyPlotHistory) : []
```

### index.html
- `useWasmCheckbox`に`checked`属性を追加（デフォルトで有効）

### main.ts
- ページロード時のWASM自動初期化処理を追加
- エラー時は自動的にチェックを外してTypeScript処理にフォールバック

## テスト結果
- ✅ 全212テスト合格
- ✅ WASMビルド成功（警告のみ、エラーなし）
- ✅ TypeScriptビルド成功
- ✅ 既存機能への影響なし

## 互換性
- ✅ 既存のTypeScript実装との完全な互換性を維持
- ✅ WASMが利用できない環境では自動的にTypeScript実装にフォールバック
- ✅ APIインターフェースの変更なし

## パフォーマンスへの影響
1. **周波数推移プロット**: 軽微（配列コピーのオーバーヘッドのみ）
2. **STFT**: O(n²)の複雑度だが、最大4ウィンドウに制限しているため実用的
3. **CQT**: Goertzelアルゴリズムにより効率的（フルFFTより高速）

## 今後の改善案
1. STFT/CQTにFFTライブラリを使用してO(n log n)に改善
2. frequencyPlotHistoryの差分更新による転送コスト削減
3. Goertzelアルゴリズムのウィンドウ長検証強化

## 関連ファイル
- `wasm-processor/src/frequency_estimator.rs` - Rust実装
- `wasm-processor/src/lib.rs` - WASM binding
- `src/WasmDataProcessor.ts` - TypeScript wrapper
- `index.html` - UI設定
- `src/main.ts` - 初期化処理
