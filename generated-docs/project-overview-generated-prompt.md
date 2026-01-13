Last updated: 2026-01-14


# プロジェクト概要生成プロンプト（来訪者向け）

## 生成するもの：
- projectを3行で要約する
- プロジェクトで使用されている技術スタックをカテゴリ別に整理して説明する
- プロジェクト全体のファイル階層ツリー（ディレクトリ構造を図解）
- プロジェクト全体のファイルそれぞれの説明
- プロジェクト全体の関数それぞれの説明
- プロジェクト全体の関数の呼び出し階層ツリー

## 生成しないもの：
- Issues情報（開発者向け情報のため）
- 次の一手候補（開発者向け情報のため）
- ハルシネーションしそうなもの（例、存在しない機能や計画を勝手に妄想する等）

## 出力フォーマット：
以下のMarkdown形式で出力してください：

```markdown
# Project Overview

## プロジェクト概要
[以下の形式で3行でプロジェクトを要約]
- [1行目の説明]
- [2行目の説明]
- [3行目の説明]

## 技術スタック
[使用している技術をカテゴリ別に整理して説明]
- フロントエンド: [フロントエンド技術とその説明]
- 音楽・オーディオ: [音楽・オーディオ関連技術とその説明]
- 開発ツール: [開発支援ツールとその説明]
- テスト: [テスト関連技術とその説明]
- ビルドツール: [ビルド・パース関連技術とその説明]
- 言語機能: [言語仕様・機能とその説明]
- 自動化・CI/CD: [自動化・継続的統合関連技術とその説明]
- 開発標準: [コード品質・統一ルール関連技術とその説明]

## ファイル階層ツリー
```
[プロジェクトのディレクトリ構造をツリー形式で表現]
```

## ファイル詳細説明
[各ファイルの役割と機能を詳細に説明]

## 関数詳細説明
[各関数の役割、引数、戻り値、機能を詳細に説明]

## 関数呼び出し階層ツリー
```
[関数間の呼び出し関係をツリー形式で表現]
```
```


以下のプロジェクト情報を参考にして要約を生成してください：

## プロジェクト情報
名前: cat-oscilloscope
説明: # cat-oscilloscope

ブラウザで動く、オシロスコープ風の波形ビジュアライザー

## 🌐 ライブデモ

**[https://cat2151.github.io/cat-oscilloscope/](https://cat2151.github.io/cat-oscilloscope/)**

上記のURLでアプリケーションを試すことができます。マイクへのアクセス許可が必要です。

※このドキュメントは仮のため大部分がLLMによって生成されました。今後修正していきます

## 状況
- 大きなバグは一通り取った状態です。
- 細かい不具合はあります。
- micからの音の場合、位相が揃ったり揃わなかったりが不安定で、実用度が低いです。
- WAVファイルからのチップチューンのモノラルの単純波形の場合、実用度が高いです。
- ライブラリとしてどれくらい楽に使えるかは、これから検証予定です。

## 📚 ライブラリとしての使用

cat-oscilloscopeは、あなた自身のプロジェクトでnpmライブラリとして使用できます。詳細な手順は [LIBRARY_USAGE.md](./LIBRARY_USAGE.md) をご覧ください。

```typescript
import { Oscilloscope } from 'cat-oscilloscope';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const oscilloscope = new Oscilloscope(canvas);
await oscilloscope.start();
```

## 機能

### 周波数推定

cat-oscilloscopeは、5つの周波数推定アルゴリズムをサポートしています：

1. **Zero-Crossing（ゼロクロス法）**: シンプルで高速。単純な波形に適しています。
2. **Autocorrelation（自己相関法）**: デフォルト。複雑な波形に対してバランスの良い精度。
3. **FFT（高速フーリエ変換）**: 周波数スペクトラム解析。高周波に強い。
4. **STFT（短時間フーリエ変換）**: 可変窓長により、低周波の検出精度が向上。
5. **CQT（定Q変換）**: 低周波域で高い周波数分解能を持つ。音楽分析に適しています。

### バッファサイズマルチプライヤー

低周波の検出精度を向上させるため、過去のフレームバッファを利用した拡張バッファをサポート：

- **1x (Standard)**: 標準バッファサイズ（約1/60秒）
- **4x (Better Low Freq)**: 4倍の拡張バッファで低周波の検出精度向上
- **16x (Best Low Freq)**: 16倍の拡張バッファで最高の低周波検出精度

**使用例**: 20-50Hzの低周波を検出する場合、STFT または CQT を選択し、Buffer Size を 16x に設定すると最適です。

**重要な注意事項:**
- バッファサイズを変更すると、履歴が蓄積されるまで（最大16フレーム）、新しいバッファサイズが有効になりません
- 大きなバッファサイズ（16x）では、初回の周波数検出に約0.3秒かかります

### 検出可能な周波数範囲

バッファサイズによって、検出可能な最低周波数が異なります：

- **1x (4096サンプル @ 48kHz)**: 約80Hz以上（標準使用）
- **4x (16384サンプル)**: 約30Hz以上（低周波向上）
- **16x (65536サンプル)**: 約20Hz以上（最良の低周波検出）

## メモ

- 周波数推定
  - FFTが正確なときと、FFT以外が正確なとき、それぞれがあります。
  - STFTとCQTは特に低周波（20-100Hz）の検出に優れています。
  - バッファサイズマルチプライヤーを大きくすると、低周波の精度が向上しますが、レスポンスが若干遅くなります。
  - **パフォーマンス**: 16xバッファサイズでは、STFT/CQTの計算に時間がかかる場合があります（教育目的の実装のため）。

## データ処理の実装について

すべてのデータ処理（波形探索、周波数推定、ゼロクロス検出など）は**Rust/WASMで実装**されています。

- 高速な処理性能
- 型安全で信頼性の高い実装
- TypeScriptは設定管理とレンダリングのみを担当

### WASM実装のビルド

WASM実装は `wasm-processor` ディレクトリにあります。

```bash
# WASM実装のビルド（wasm-packが必要）
npm run build:wasm

# アプリ全体のビルド（WASMも含む）
npm run build
```

**必要なツール**:
- Rust toolchain (rustc, cargo)
- wasm-pack (`cargo install wasm-pack`)

## 機能

- 🎤 **マイク入力** - マイクからの音声をリアルタイムでキャプチャ
- 📂 **オーディオファイル** - WAVファイルのループ再生に対応
- 📊 **周波数推定** - ゼロクロス、自己相関、FFT、STFT、CQTの5つの方式
- 🎹 **ピアノ鍵盤表示** - 検出した周波数を鍵盤上に表示
- 🎚️ **自動ゲイン** - 波形の振幅を自動調整
- 🔇 **ノイズゲート** - 閾値以下の信号をカット
- 🎯 **3つのアライメントモード**
  - **Zero-Cross**: ゼロクロス点で同期（デフォルト）
  - **Peak**: ピーク点で同期（高周波向け）
  - **Phase**: 位相同期（サブハーモニクス向け、Issue #139対応）
- 📈 **FFTスペクトラム** - 周波数スペクトラムをオーバーレイ表示
- 🔍 **波形比較パネル** - 前回と今回の波形の類似度を表示
- ⏸️ **描画の一時停止** - 波形を静止して観察可能

### アライメントモードについて

**Phase Alignment Mode（位相同期モード）** は、1/4倍音などのサブハーモニクスを含む波形の位相ブレを解決するために追加されました。

- **Zero-Cross（ゼロクロス）**: 最も軽量。単純な波形に適しています
- **Peak（ピーク）**: 高周波やノイズの多い環境で安定
- **Phase（位相同期）**: DFTベースの位相検出により、サブハーモニクスを含む複雑な波形でも安定した表示が可能

詳細は [docs/PHASE_ALIGNMENT.md](./docs/PHASE_ALIGNMENT.md) を参照してください。

## はじめに

### 必要条件

- Node.js（v16以上を推奨）
- npm または yarn

### インストール

```bash
npm install
```

### 開発

開発サーバーを起動：

```bash
npm run dev
```

ブラウザで `http://localhost:3000/` を開いてください。

### ビルド

本番用にビルド：

```bash
npm run build
```

ビルドされたファイルは `dist` ディレクトリに出力されます。

### 本番ビルドのプレビュー

```bash
npm run preview
```

### テスト

テストを実行：

```bash
npm test
```

カバレッジレポートを生成：

```bash
npm run test:coverage
```

テストUIを起動：

```bash
npm run test:ui
```

詳細は [TESTING.md](TESTING.md) を参照してください。

## 仕組み

### ゼロクロス検出アルゴリズム

このオシロスコープは、以下のようなゼロクロス検出アルゴリズムを実装しています：

1. 音声バッファをスキャンし、波形がマイナス（またはゼロ）からプラスに交差するポイントを検出
2. 最初のゼロクロスポイントを特定
3. 次のゼロクロスポイントを見つけて、1つの完全な波形サイクルを決定
4. ゼロクロスポイントの前後にわずかなパディングを付けて波形を表示

これにより、安定した非スクロール表示が実現されます。

### 技術的詳細

- **FFTサイズ**: 高解像度のため4096サンプル
- **スムージング**: 正確な波形表現のため無効（0）
- **表示パディング**: ゼロクロスポイントの前後に20サンプル
- **オートゲイン**: 
  - キャンバスの高さの80%を目標に自動調整
  - ピーク追跡による滑らかな遷移（減衰率: 0.95）
  - ゲイン範囲: 0.5倍〜99倍
  - 補間係数: 0.1（段階的な調整）
  - UIチェックボックスで有効/無効を切り替え可能（デフォルト: 有効）
- **キャンバス解像度**: 800x400ピクセル
- **リフレッシュレート**: ブラウザのrequestAnimationFrameに同期（約60 FPS）

## 技術スタック

- **TypeScript** - 型安全なJavaScript
- **Vite** - 高速なビルドツールと開発サーバー
- **Web Audio API** - 音声のキャプチャと分析
- **HTML Canvas** - 2D波形レンダリング

## ブラウザ要件

このアプリケーションには以下が必要です：
- Web Audio APIをサポートするモダンブラウザ（Chrome、Firefox、Safari、Edge）
- ユーザーによるマイクのアクセス許可
- HTTPSまたはlocalhost（マイクアクセスに必要）

## マイク入力時の制約

マイクからの入力を使用する場合、以下の制約があります：

### 環境音の影響

マイクは周囲のすべての音を拾うため、以下のような環境音が波形に影響を与えます：

- **マウスクリック音**: マウスをクリックする際の機械的な音が波形に現れます。特に一時停止ボタンをマウスでクリックした瞬間、波形が乱れて見えることがあります。
- **キーボード打鍵音**: キーボードのタイプ音も波形に影響します。ただし、静音性の高いキーボードを使用している場合は、影響が少なくなります。
- **その他の環境音**: 話し声、室内の空調音、外部からの騒音なども波形に現れます。

### 実用上のヒント

- **一時停止の方法**: マウスクリックの代わりに、静音性の高いキーボードのスペースキーを使用することで、一時停止時の波形への影響を最小限に抑えることができます。
- **音源の選択**: マイク入力は環境音の影響を受けやすいため、ノイズのない波形を観察したい場合は、WAVファイルなどのオーディオファイルを使用することをお勧めします。
- **測定環境**: できるだけ静かな環境で使用することで、より正確な波形を観察できます。

これらはアプリケーションの制限ではなく、マイクというデバイスの特性によるものです。

## ライセンス

MITライセンス - 詳細は [LICENSE](LICENSE) ファイルを参照してください

*Big Brother is listening to you. Now it’s the cat.* 🐱


依存関係:
{
  "dependencies": {},
  "devDependencies": {
    "@vitest/ui": "^4.0.16",
    "cross-env": "^10.1.0",
    "happy-dom": "^20.0.11",
    "typescript": "^5.3.3",
    "vite": "^6.0.0",
    "vite-plugin-dts": "^4.5.4",
    "vitest": "^4.0.16"
  }
}

## ファイル階層ツリー
📄 .gitignore
📖 CONSOLIDATION_SUMMARY.md
📖 IMPLEMENTATION_NOTES_117.md
📖 IMPLEMENTATION_SUMMARY.md
📖 LIBRARY_USAGE.md
📄 LICENSE
📖 README.ja.md
📖 README.md
📖 REFACTORING_SUMMARY.md
📖 TESTING.md
📄 _config.yml
📁 docs/
  📖 PHASE_ALIGNMENT.md
🌐 example-library-usage.html
📁 generated-docs/
🌐 index.html
📁 issue-notes/
  📖 101.md
  📖 102.md
  📖 105.md
  📖 107.md
  📖 110.md
  📖 115.md
  📖 117.md
  📖 119.md
  📖 120.md
  📖 123.md
  📖 125.md
  📖 127.md
  📖 129.md
  📖 130.md
  📖 132.md
  📖 133.md
  📖 137.md
  📖 138.md
  📖 139.md
  📖 140.md
  📖 145.md
  📖 147.md
  📖 149.md
  📖 151.md
  📖 57.md
  📖 59.md
  📖 62.md
  📖 64.md
  📖 65.md
  📖 66.md
  📖 67.md
  📖 68.md
  📖 70.md
  📖 73.md
  📖 75.md
  📖 77.md
  📖 78.md
  📖 79.md
  📖 80.md
  📖 81.md
  📖 83.md
  📖 85.md
  📖 86.md
  📖 88.md
  📖 90.md
  📖 91.md
  📖 92.md
  📖 93.md
  📖 96.md
📊 package-lock.json
📊 package.json
📁 public/
  📁 wasm/
    📊 package.json
    📘 wasm_processor.d.ts
    📜 wasm_processor.js
    📄 wasm_processor_bg.wasm
    📘 wasm_processor_bg.wasm.d.ts
📁 src/
  📘 AudioManager.ts
  📘 ComparisonPanelRenderer.ts
  📘 FrequencyEstimator.ts
  📘 GainController.ts
  📘 Oscilloscope.ts
  📘 PianoKeyboardRenderer.ts
  📘 WaveformDataProcessor.ts
  📘 WaveformRenderData.ts
  📘 WaveformRenderer.ts
  📘 WaveformSearcher.ts
  📘 ZeroCrossDetector.ts
  📁 __tests__/
    📘 algorithms.test.ts
    📘 alignment-mode.test.ts
    📘 comparison-panel-renderer.test.ts
    📘 dom-integration.test.ts
    📘 library-exports.test.ts
    📘 oscilloscope.test.ts
    📘 piano-keyboard-renderer.test.ts
    📘 utils.test.ts
    📘 waveform-data-processor.test.ts
    📘 waveform-renderer.test.ts
    📘 waveform-searcher.test.ts
  📘 index.ts
  📘 main.ts
  📘 utils.ts
📊 tsconfig.json
📊 tsconfig.lib.json
📘 vite.config.ts
📁 wasm-processor/
  📄 Cargo.toml
  📁 src/
    📄 frequency_estimator.rs
    📄 gain_controller.rs
    📄 lib.rs
    📄 phase_detector.rs
    📄 waveform_searcher.rs
    📄 zero_cross_detector.rs

## ファイル詳細分析
**example-library-usage.html** (292行, 8351バイト)
  - 関数: なし
  - インポート: なし

**index.html** (320行, 10291バイト)
  - 関数: なし
  - インポート: なし

**public/wasm/wasm_processor.d.ts** (106行, 5079バイト)
  - 関数: initSync, __wbg_init
  - インポート: なし

**public/wasm/wasm_processor.js** (488行, 15371バイト)
  - 関数: getArrayF32FromWasm0, getArrayU8FromWasm0, getFloat32ArrayMemory0, getStringFromWasm0, getUint8ArrayMemory0, isLikeNone, passArray8ToWasm0, passArrayF32ToWasm0, passStringToWasm0, decodeText, __wbg_load, __wbg_get_imports, __wbg_finalize_init, initSync, __wbg_init, if, for, function, __destroy_into_raw, free, processFrame, setAutoGain, setNoiseGate, setUsePeakMode, setAlignmentMode, setNoiseGateThreshold, setBufferSizeMultiplier, setFrequencyEstimationMethod, constructor, reset, __wrap, similarity, sampleRate, maxFrequency, waveform_data, frequencyData, displayEndIndex, previousWaveform, displayStartIndex, estimatedFrequency, firstAlignmentPoint, frequencyPlotHistory, secondAlignmentPoint, usedSimilaritySearch, similarityPlotHistory, isSignalAboveNoiseGate, gain, fftSize, catch
  - インポート: なし

**public/wasm/wasm_processor_bg.wasm.d.ts** (38行, 2692バイト)
  - 関数: なし
  - インポート: なし

**src/AudioManager.ts** (263行, 7787バイト)
  - 関数: if, catch, for, start, startFromFile, stop
  - インポート: ./utils

**src/ComparisonPanelRenderer.ts** (416行, 12826バイト)
  - 関数: constructor, if, for
  - インポート: なし

**src/FrequencyEstimator.ts** (67行, 2126バイト)
  - 関数: if
  - インポート: なし

**src/GainController.ts** (51行, 1301バイト)
  - 関数: なし
  - インポート: ./utils

**src/Oscilloscope.ts** (298行, 9510バイト)
  - 関数: constructor, catch, if, start, startFromFile, stop
  - インポート: ./AudioManager, ./GainController, ./FrequencyEstimator

**src/PianoKeyboardRenderer.ts** (212行, 6623バイト)
  - 関数: constructor, if, for
  - インポート: ./utils

**src/WaveformDataProcessor.ts** (370行, 13290バイト)
  - 関数: cleanup, handleLoad, constructor, if, catch, for, initialize, loadWasmModule
  - インポート: ./WaveformRenderData, ./AudioManager, ./GainController

**src/WaveformRenderData.ts** (65行, 2046バイト)
  - 関数: なし
  - インポート: なし

**src/WaveformRenderer.ts** (502行, 17038バイト)
  - 関数: constructor, if, for
  - インポート: ./utils

**src/WaveformSearcher.ts** (54行, 1276バイト)
  - 関数: なし
  - インポート: なし

**src/ZeroCrossDetector.ts** (55行, 1585バイト)
  - 関数: なし
  - インポート: なし

**src/__tests__/algorithms.test.ts** (173行, 5364バイト)
  - 関数: なし
  - インポート: vitest, ../FrequencyEstimator, ../GainController

**src/__tests__/alignment-mode.test.ts** (94行, 3090バイト)
  - 関数: for
  - インポート: vitest, ../ZeroCrossDetector

**src/__tests__/comparison-panel-renderer.test.ts** (360行, 12904バイト)
  - 関数: for
  - インポート: vitest, ../ComparisonPanelRenderer

**src/__tests__/dom-integration.test.ts** (289行, 9226バイト)
  - 関数: createMediaStreamSource, createAnalyser, for, close, getTracks
  - インポート: vitest, ../utils

**src/__tests__/library-exports.test.ts** (150行, 5170バイト)
  - 関数: なし
  - インポート: vitest

**src/__tests__/oscilloscope.test.ts** (560行, 21792バイト)
  - 関数: createSilentMockAudioContext, getFFTOverlayDimensions, findFFTOverlayBorderCall, createMediaStreamSource, createAnalyser, for, close, getTracks, getAudioTracks, getVideoTracks, stop, if
  - インポート: vitest, ../Oscilloscope, ../utils

**src/__tests__/piano-keyboard-renderer.test.ts** (163行, 5266バイト)
  - 関数: なし
  - インポート: vitest, ../PianoKeyboardRenderer

**src/__tests__/utils.test.ts** (367行, 12152バイト)
  - 関数: createAudioBuffer, constructor, for, if
  - インポート: vitest, ../utils

**src/__tests__/waveform-data-processor.test.ts** (66行, 2278バイト)
  - 関数: なし
  - インポート: vitest, ../WaveformDataProcessor, ../AudioManager

**src/__tests__/waveform-renderer.test.ts** (413行, 14451バイト)
  - 関数: for
  - インポート: vitest, ../WaveformRenderer

**src/__tests__/waveform-searcher.test.ts** (40行, 1126バイト)
  - 関数: なし
  - インポート: vitest, ../WaveformSearcher

**src/index.ts** (26行, 1055バイト)
  - 関数: なし
  - インポート: なし

**src/main.ts** (285行, 11349バイト)
  - 関数: sliderValueToThreshold, formatThresholdDisplay, startFrequencyDisplay, stopFrequencyDisplay, for, if, catch
  - インポート: ./Oscilloscope, ./ZeroCrossDetector, ./utils

**src/utils.ts** (167行, 5136バイト)
  - 関数: dbToAmplitude, amplitudeToDb, frequencyToNote, trimSilence, if, for
  - インポート: なし

**vite.config.ts** (54行, 1525バイト)
  - 関数: なし
  - インポート: vite, path, vite-plugin-dts

## 関数呼び出し階層
- getArrayF32FromWasm0 (public/wasm/wasm_processor.js)
  - initSync (public/wasm/wasm_processor.d.ts)
    - free ()
    - processFrame ()
    - setAutoGain ()
    - setNoiseGate ()
    - setUsePeakMode ()
    - setAlignmentMode ()
    - setNoiseGateThreshold ()
    - setBufferSizeMultiplier ()
    - setFrequencyEstimationMethod ()
    - constructor (undefined)
  - __wbg_init ()
  - getArrayU8FromWasm0 ()
  - getFloat32ArrayMemory0 ()
  - getStringFromWasm0 ()
  - getUint8ArrayMemory0 ()
  - isLikeNone ()
  - passArray8ToWasm0 ()
  - passArrayF32ToWasm0 ()
  - passStringToWasm0 ()
  - decodeText ()
  - __wbg_load ()
  - __wbg_get_imports ()
  - __wbg_finalize_init ()
  - function ()
  - __destroy_into_raw ()
- if (src/AudioManager.ts)
  - start ()
    - startFromFile ()
      - stop ()
      - createMediaStreamSource ()
      - createAnalyser ()
      - close ()
      - getTracks ()
      - trimSilence ()
  - createSilentMockAudioContext (src/__tests__/oscilloscope.test.ts)
    - getFFTOverlayDimensions ()
      - findFFTOverlayBorderCall ()
      - getAudioTracks ()
      - getVideoTracks ()
      - dbToAmplitude ()
  - sliderValueToThreshold (src/main.ts)
    - formatThresholdDisplay ()
      - startFrequencyDisplay ()
      - stopFrequencyDisplay ()
      - frequencyToNote ()
  - amplitudeToDb ()
- catch (src/AudioManager.ts)
- for (src/AudioManager.ts)
  - reset ()
- cleanup (src/WaveformDataProcessor.ts)
- createAudioBuffer (src/__tests__/utils.test.ts)


## プロジェクト構造（ファイル一覧）
CONSOLIDATION_SUMMARY.md
IMPLEMENTATION_NOTES_117.md
IMPLEMENTATION_SUMMARY.md
LIBRARY_USAGE.md
README.ja.md
README.md
REFACTORING_SUMMARY.md
TESTING.md
docs/PHASE_ALIGNMENT.md
example-library-usage.html
index.html
issue-notes/101.md
issue-notes/102.md
issue-notes/105.md
issue-notes/107.md
issue-notes/110.md
issue-notes/115.md
issue-notes/117.md
issue-notes/119.md
issue-notes/120.md
issue-notes/123.md
issue-notes/125.md
issue-notes/127.md
issue-notes/129.md
issue-notes/130.md
issue-notes/132.md
issue-notes/133.md
issue-notes/137.md
issue-notes/138.md
issue-notes/139.md
package-lock.json

上記の情報を基に、プロンプトで指定された形式でプロジェクト概要を生成してください。
特に以下の点を重視してください：
- 技術スタックは各カテゴリごとに整理して説明
- ファイル階層ツリーは提供された構造をそのまま使用
- ファイルの説明は各ファイルの実際の内容と機能に基づく
- 関数の説明は実際に検出された関数の役割に基づく
- 関数呼び出し階層は実際の呼び出し関係に基づく


---
Generated at: 2026-01-14 07:09:11 JST
