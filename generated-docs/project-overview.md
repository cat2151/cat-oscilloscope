Last updated: 2026-02-06

# Project Overview

## プロジェクト概要
- ブラウザ上でリアルタイムに音波を視覚化するオシロスコープ風のWebアプリケーションです。
- 高速なRust/WebAssemblyによるデータ処理と、マイク入力・ファイル再生に対応した音源分析機能を持ちます。
- 複数周波数推定アルゴリズムや波形比較、ピアノ鍵盤表示など多彩な視覚化機能を提供します。

## 技術スタック
- フロントエンド: **TypeScript** (型安全なJavaScriptでアプリケーションロジック、設定管理、レンダリングを担当)、**Web Audio API** (マイクからの音声キャプチャ、WAVファイルの再生、音声データのリアルタイム分析)、**HTML Canvas** (波形、スペクトラム、鍵盤などの2Dグラフィック描画)
- 音楽・オーディオ: **Web Audio API** (音声ストリーム処理)、**5つの周波数推定方式** (Zero-Crossing, Autocorrelation, FFT, STFT, CQTをサポートし、多様な音源の周波数分析に対応)
- 開発ツール: **Vite** (高速な開発サーバーとバンドラー)、**npm/yarn** (JavaScript/TypeScriptパッケージ管理)、**wasm-pack** (RustコードをWebAssemblyにコンパイルするためのツール)
- テスト: **Vitest** (高速な単体テストフレームワーク)、**@vitest/ui** (テスト実行結果をGUIで表示)、**happy-dom** (DOM環境をエミュレートし、ブラウザAPIに依存するコンポーネントのテストを可能にする)
- ビルドツール: **Vite** (本番用ビルドの最適化、バンドル処理)、**vite-plugin-dts** (TypeScriptの型定義ファイル `.d.ts` を自動生成)
- 言語機能: **TypeScript** (JavaScriptに静的型チェックを導入し、開発の信頼性と保守性を向上)、**Rust** (主要なデータ処理アルゴリズムを実装し、高いパフォーマンスと型安全性を実現)
- 自動化・CI/CD: **GitHub Actions** (日次でソースファイルの行数をチェックし、大規模なファイルを自動で検出しissueを起票する仕組み)
- 開発標準: (特筆すべき開発標準ツールは明示されていませんが、TypeScriptとRustの型システムがコード品質を担保しています)

## ファイル階層ツリー
```
📄 .gitignore
📖 ARCHITECTURE.md
📖 LIBRARY_USAGE.md
📄 LICENSE
📖 README.ja.md
📖 README.md
📖 REFACTORING_ISSUE_251.md
📖 REFACTORING_SUMMARY.md
📄 _config.yml
🌐 demo-simple.html
📜 demo-simple.js
📁 dist/
  📘 AudioManager.d.ts
  📄 AudioManager.d.ts.map
  📘 BasePathResolver.d.ts
  📄 BasePathResolver.d.ts.map
  📘 BufferSource.d.ts
  📄 BufferSource.d.ts.map
  📘 ComparisonPanelRenderer.d.ts
  📄 ComparisonPanelRenderer.d.ts.map
  📘 CycleSimilarityRenderer.d.ts
  📄 CycleSimilarityRenderer.d.ts.map
  📘 DOMElementManager.d.ts
  📄 DOMElementManager.d.ts.map
  📘 DisplayUpdater.d.ts
  📄 DisplayUpdater.d.ts.map
  📘 FrameBufferHistory.d.ts
  📄 FrameBufferHistory.d.ts.map
  📘 FrequencyEstimator.d.ts
  📄 FrequencyEstimator.d.ts.map
  📘 GainController.d.ts
  📄 GainController.d.ts.map
  📘 Oscilloscope.d.ts
  📄 Oscilloscope.d.ts.map
  📘 OverlayLayout.d.ts
  📄 OverlayLayout.d.ts.map
  📘 PianoKeyboardRenderer.d.ts
  📄 PianoKeyboardRenderer.d.ts.map
  📘 UIEventHandlers.d.ts
  📄 UIEventHandlers.d.ts.map
  📘 WasmModuleLoader.d.ts
  📄 WasmModuleLoader.d.ts.map
  📘 WaveformDataProcessor.d.ts
  📄 WaveformDataProcessor.d.ts.map
  📘 WaveformRenderData.d.ts
  📄 WaveformRenderData.d.ts.map
  📘 WaveformRenderer.d.ts
  📄 WaveformRenderer.d.ts.map
  📘 WaveformSearcher.d.ts
  📄 WaveformSearcher.d.ts.map
  📘 ZeroCrossDetector.d.ts
  📄 ZeroCrossDetector.d.ts.map
  📁 assets/
    📜 demo-DsYptmO3.js
    📄 demo-DsYptmO3.js.map
    📜 main-DUIA4vI1.js
    📄 main-DUIA4vI1.js.map
    📜 modulepreload-polyfill-B5Qt9EMX.js
    📄 modulepreload-polyfill-B5Qt9EMX.js.map
  📄 cat-oscilloscope.cjs
  📄 cat-oscilloscope.cjs.map
  📄 cat-oscilloscope.mjs
  📄 cat-oscilloscope.mjs.map
  📁 comparison-renderers/
    📘 OffsetOverlayRenderer.d.ts
    📄 OffsetOverlayRenderer.d.ts.map
    📘 PositionMarkerRenderer.d.ts
    📄 PositionMarkerRenderer.d.ts.map
    📘 SimilarityPlotRenderer.d.ts
    📄 SimilarityPlotRenderer.d.ts.map
    📘 WaveformPanelRenderer.d.ts
    📄 WaveformPanelRenderer.d.ts.map
    📘 index.d.ts
    📄 index.d.ts.map
  🌐 demo-simple.html
  📘 index.d.ts
  📄 index.d.ts.map
  🌐 index.html
  📁 renderers/
    📘 BaseOverlayRenderer.d.ts
    📄 BaseOverlayRenderer.d.ts.map
    📘 FFTOverlayRenderer.d.ts
    📄 FFTOverlayRenderer.d.ts.map
    📘 FrequencyPlotRenderer.d.ts
    📄 FrequencyPlotRenderer.d.ts.map
    📘 GridRenderer.d.ts
    📄 GridRenderer.d.ts.map
    📘 HarmonicAnalysisRenderer.d.ts
    📄 HarmonicAnalysisRenderer.d.ts.map
    📘 PhaseMarkerRenderer.d.ts
    📄 PhaseMarkerRenderer.d.ts.map
    📘 WaveformLineRenderer.d.ts
    📄 WaveformLineRenderer.d.ts.map
    📘 index.d.ts
    📄 index.d.ts.map
  📘 utils.d.ts
  📄 utils.d.ts.map
  📁 wasm/
    📊 package.json
    📘 signal_processor_wasm.d.ts
    📜 signal_processor_wasm.js
    📄 signal_processor_wasm_bg.wasm
    📘 signal_processor_wasm_bg.wasm.d.ts
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
  📖 153.md
  📖 155.md
  📖 158.md
  📖 160.md
  📖 162.md
  📖 163.md
  📖 165.md
  📖 167.md
  📖 169.md
  📖 171.md
  📖 173.md
  📖 175.md
  📖 177-analysis.md
  📖 177.md
  📖 179-analysis-v2.md
  📖 179-analysis-v3.md
  📖 179-analysis.md
  📖 179.md
  📖 181-implementation.md
  📖 181.md
  📖 183.md
  📖 185.md
  📖 187.md
  📖 189.md
  📖 191.md
  📖 193.md
  📖 195.md
  📖 197.md
  📖 199.md
  📖 201.md
  📖 203.md
  📖 205.md
  📖 207.md
  📖 209.md
  📖 210.md
  📖 212.md
  📖 214.md
  📖 216.md
  📖 217.md
  📖 220-fix-summary.md
  📖 220.md
  📖 222.md
  📖 224.md
  📖 226.md
  📖 228.md
  📖 230.md
  📖 232.md
  📖 234.md
  📖 236.md
  📖 238.md
  📖 241.md
  📖 243.md
  📖 245.md
  📖 247.md
  📖 249.md
  📖 251.md
  📖 252.md
  📖 253.md
  📖 254.md
  📖 255.md
  📖 257.md
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
    📘 signal_processor_wasm.d.ts
    📜 signal_processor_wasm.js
    📄 signal_processor_wasm_bg.wasm
    📘 signal_processor_wasm_bg.wasm.d.ts
📁 scripts/
  📜 screenshot-local.js
📁 signal-processor-wasm/
  📄 Cargo.toml
  📁 src/
    📄 bpf.rs
    📁 frequency_estimation/
      📄 autocorrelation.rs
      📄 cqt.rs
      📄 dsp_utils.rs
      📄 fft.rs
      📄 harmonic_analysis.rs
      📄 mod.rs
      📄 smoothing.rs
      📄 stft.rs
      📄 zero_crossing.rs
    📄 gain_controller.rs
    📄 lib.rs
    📄 waveform_searcher.rs
    📄 zero_cross_detector.rs
📁 src/
  📘 AudioManager.ts
  📘 BasePathResolver.ts
  📘 BufferSource.ts
  📘 ComparisonPanelRenderer.ts
  📘 CycleSimilarityRenderer.ts
  📘 DOMElementManager.ts
  📘 DisplayUpdater.ts
  📘 FrameBufferHistory.ts
  📘 FrequencyEstimator.ts
  📘 GainController.ts
  📘 Oscilloscope.ts
  📘 OverlayLayout.ts
  📘 PianoKeyboardRenderer.ts
  📘 UIEventHandlers.ts
  📘 WasmModuleLoader.ts
  📘 WaveformDataProcessor.ts
  📘 WaveformRenderData.ts
  📘 WaveformRenderer.ts
  📘 WaveformSearcher.ts
  📘 ZeroCrossDetector.ts
  📁 __tests__/
    📘 BufferSource.test.ts
    📘 algorithms.test.ts
    📘 comparison-panel-renderer.test.ts
    📘 cycle-similarity-display.test.ts
    📘 cycle-similarity.test.ts
    📘 dom-integration.test.ts
    📘 library-exports.test.ts
    📘 normalized-harmonics-issue197.test.ts
    📘 oscilloscope.test.ts
    📘 overlay-layout.test.ts
    📘 piano-keyboard-renderer.test.ts
    📘 startFromBuffer.test.ts
    📘 utils.test.ts
    📘 waveform-data-processor.test.ts
    📘 waveform-renderer.test.ts
    📘 waveform-searcher.test.ts
    📘 weighted-harmonic-issue195.test.ts
  📁 comparison-renderers/
    📘 OffsetOverlayRenderer.ts
    📘 PositionMarkerRenderer.ts
    📘 SimilarityPlotRenderer.ts
    📘 WaveformPanelRenderer.ts
    📘 index.ts
  📘 index.ts
  📘 main.ts
  📁 renderers/
    📘 BaseOverlayRenderer.ts
    📘 FFTOverlayRenderer.ts
    📘 FrequencyPlotRenderer.ts
    📘 GridRenderer.ts
    📘 HarmonicAnalysisRenderer.ts
    📘 PhaseMarkerRenderer.ts
    📘 WaveformLineRenderer.ts
    📘 index.ts
  📘 utils.ts
📁 test-pages/
  🌐 test-canvas-dimension-warning.html
  📄 wavlpf-broken-layout.png
📖 test-segment-relative.md
📊 tsconfig.json
📊 tsconfig.lib.json
📘 vite.config.ts
```

## ファイル詳細説明
- **`demo-simple.html`**: ライブラリとしての`cat-oscilloscope`の利用方法を示すための、最小限の機能を備えたデモ用HTMLファイルです。
- **`demo-simple.js`**: `demo-simple.html`で動作するJavaScriptコードで、`cat-oscilloscope`ライブラリをCDN経由でロードし、基本的な波形可視化機能を開始・停止するロジックを含みます。
- **`src/AudioManager.ts`**: Web Audio APIを介してマイク入力、WAVファイル、または静的バッファからの音声データを管理し、オシロスコープに供給する役割を担います。
- **`src/BasePathResolver.ts`**: アプリケーションのリソース（特にWASMファイル）のベースパスを動的に解決するためのユーティリティクラスです。
- **`src/BufferSource.ts`**: Web Audio APIの`AudioBufferSourceNode`に相当する静的音声バッファを管理し、ループ再生などのオプションを提供します。
- **`src/ComparisonPanelRenderer.ts`**: 過去の波形と現在の波形の類似度や差異を視覚的に表示するパネルの描画ロジックを管理します。
- **`src/CycleSimilarityRenderer.ts`**: 波形サイクル間の類似度を計算し、その結果をCanvas上に描画する処理を担当します。
- **`src/DOMElementManager.ts`**: アプリケーションのUIを構成するHTML要素（ボタン、スライダー、表示領域など）へのアクセスと状態管理を一元的に行います。
- **`src/DisplayUpdater.ts`**: オシロスコープのCanvas以外のUI要素（周波数表示、ゲイン値、類似度スコアなど）を更新する役割を持ちます。
- **`src/FrameBufferHistory.ts`**: 過去のオーディオフレームデータを保持し、特に低周波検出のために拡張バッファ（バッファサイズマルチプライヤー）機能で利用される履歴管理を行います。
- **`src/FrequencyEstimator.ts`**: Rust/WASMモジュールを呼び出し、Zero-Crossing、Autocorrelation、FFT、STFT、CQTなど、複数の周波数推定アルゴリズムの結果を提供します。
- **`src/GainController.ts`**: 入力音声の振幅に基づいて、表示される波形のゲインを自動的に調整するロジックを実装しています。
- **`src/Oscilloscope.ts`**: `cat-oscilloscope`ライブラリのコアクラスであり、音声入力の開始/停止、データ処理、レンダリング、UIイベントハンドリングなど、オシロスコープ全体の統括的な機能を提供します。
- **`src/OverlayLayout.ts`**: FFTスペクトラム、倍音分析、周波数推移プロットなどのオーバーレイ表示のレイアウトと、各オーバーレイのCanvas上の描画領域を解決します。
- **`src/PianoKeyboardRenderer.ts`**: 検出された周波数に対応するピアノの鍵盤をCanvas上に視覚的に表示する機能を提供します。
- **`src/UIEventHandlers.ts`**: アプリケーションのユーザーインターフェース（ボタン、スライダー、ファイル入力など）からのイベントを捕捉し、`Oscilloscope`インスタンスの適切なメソッドを呼び出して機能を実行します。
- **`src/WasmModuleLoader.ts`**: Rustで実装されたWebAssemblyモジュールを非同期でロードし、JavaScript環境で利用可能にするためのラッパーです。
- **`src/WaveformDataProcessor.ts`**: `AudioManager`から取得したオーディオデータを前処理し、`WasmModuleLoader`を介してRust/WASMモジュールに渡し、その処理結果を受け取る役割を担います。
- **`src/WaveformRenderData.ts`**: オシロスコープのCanvasに波形やオーバーレイを描画するために必要なすべてのデータ（生波形データ、周波数データ、描画設定など）をカプセル化するデータ構造を定義します。
- **`src/WaveformRenderer.ts`**: HTML Canvas上に波形、グリッド、FFTスペクトラム、倍音分析、周波数推移など、すべての視覚要素を描画する低レベルのレンダリングロジックを管理します。
- **`src/WaveformSearcher.ts`**: 波形データの中からゼロクロスポイントやピークなどの特定のパターンを効率的に検索するためのアルゴリズムを提供します。
- **`src/ZeroCrossDetector.ts`**: 音波のゼロクロスポイント（波形がゼロを横切る点）を検出し、波形サイクルの特定や周波数推定の基礎データとして利用します。
- **`src/utils.ts`**: dB値と振幅値の相互変換、周波数を音符名に変換、無音部分のトリムなど、アプリケーション全体で利用される汎用的なユーティリティ関数を提供します。
- **`signal-processor-wasm/src/lib.rs`**: Rustで書かれたWebAssemblyモジュールのエントリポイント。主要なデータ処理アルゴリズム（周波数推定、ゼロクロス検出など）がここに実装され、JavaScriptから呼び出し可能な形式で公開されます。
- **`signal-processor-wasm/src/frequency_estimation/mod.rs`**: 自己相関、FFT、STFT、CQT、ゼロクロス法など、異なる周波数推定アルゴリズムを組織するRustモジュールです。
- **`public/wasm/signal_processor_wasm.js`**: `wasm-pack`によって生成されたWASMローダーのJavaScriptファイルで、WebAssemblyバイナリをウェブブラウザにロードするためのグルーコードを含みます。
- **`public/wasm/signal_processor_wasm_bg.wasm`**: コンパイルされたRustコードから生成されたWebAssemblyバイナリファイル。高速なオーディオデータ処理のコアロジックを格納しています。

## 関数詳細説明
- **`Oscilloscope.start()`**:
    - **役割**: オシロスコープのリアルタイム音声処理と描画を開始。
    - **引数**: なし。
    - **戻り値**: `Promise<void>`。非同期処理の完了を待つ。
    - **機能**: マイク入力の取得を開始し、Web Audio APIを通じて音声データを処理・可視化するループを起動します。
- **`Oscilloscope.startFromFile(file: File)`**:
    - **役割**: 指定されたオーディオファイル（WAV）の再生と可視化を開始。
    - **引数**: `file`: `File`オブジェクト。再生するオーディオファイル。
    - **戻り値**: `Promise<void>`。
    - **機能**: ファイルを読み込み、音声データをWeb Audio APIを通じて処理・可視化します。
- **`Oscilloscope.startFromBuffer(bufferSource: BufferSource)`**:
    - **役割**: 事前ロードされた音声バッファからの可視化を開始。
    - **引数**: `bufferSource`: `BufferSource`インスタンス。再生する音声データを含む。
    - **戻り値**: `Promise<void>`。
    - **機能**: 提供された音声バッファをループ再生し、その波形を可視化します。
- **`Oscilloscope.stop()`**:
    - **役割**: 現在実行中のオシロスコープの処理と描画を停止。
    - **引数**: なし。
    - **戻り値**: `void`。
    - **機能**: マイク入力やファイル再生を停止し、関連するWeb Audio APIリソースを解放します。
- **`Oscilloscope.setFrequencyEstimationMethod(method: string)`**:
    - **役割**: 周波数推定アルゴリズムを設定。
    - **引数**: `method`: 選択する周波数推定方式の文字列（例: 'FFT', 'STFT', 'CQT'）。
    - **戻り値**: `void`。
    - **機能**: リアルタイムで周波数推定に利用するアルゴリズムを切り替えます。
- **`Oscilloscope.setBufferSizeMultiplier(multiplier: number)`**:
    - **役割**: 低周波検出精度向上のためのバッファサイズ乗数を設定。
    - **引数**: `multiplier`: バッファサイズの乗数（1, 4, 16など）。
    - **戻り値**: `void`。
    - **機能**: 履歴フレームバッファの長さを調整し、特に低周波域での検出精度を向上させます。
- **`Oscilloscope.getEstimatedFrequency()`**:
    - **役割**: 現在推定されている周波数を取得。
    - **引数**: なし。
    - **戻り値**: `number`。推定された周波数（Hz）。
    - **機能**: WASMモジュールから最新の周波数推定結果を問い合わせて返します。
- **`AudioManager.start()`**:
    - **役割**: マイク入力の取得を開始。
    - **引数**: なし。
    - **戻り値**: `Promise<AudioNode>`。Web Audio APIの処理グラフに接続されたAudioNode。
    - **機能**: ユーザーのマイクにアクセスし、音声ストリームをWeb Audio APIの処理グラフに接続します。
- **`AudioManager.startFromFile(file: File)`**:
    - **役割**: WAVファイルからの再生を開始。
    - **引数**: `file`: `File`オブジェクト。
    - **戻り値**: `Promise<AudioNode>`。Web Audio APIの処理グラフに接続されたAudioNode。
    - **機能**: ファイルをデコードし、AudioBufferSourceNodeを作成して再生を開始します。
- **`WasmModuleLoader.loadWasmModule()`**:
    - **役割**: RustでビルドされたWebAssemblyモジュールをロード。
    - **引数**: なし。
    - **戻り値**: `Promise<any>`。ロードされたWASMモジュールインスタンス。
    - **機能**: 指定されたパスからWASMバイナリとそれに関連するJSローダーを非同期で読み込み、初期化します。
- **`signal_processor_wasm.processFrame(wasmConfig: object)`**:
    - **役割**: WASMモジュール内で単一のオーディオフレームを処理。
    - **引数**: `wasmConfig`: 設定とデータを含むオブジェクト。
    - **戻り値**: `object`。処理結果を含むオブジェクト。
    - **機能**: タイムドメインデータ、周波数推定、ゼロクロス検出、ゲイン調整など、すべてのコアデータ処理を実行します。
- **`WaveformRenderer.drawWaveform(data: WaveformRenderData)`**:
    - **役割**: メインの波形をCanvasに描画。
    - **引数**: `data`: `WaveformRenderData`インスタンス。描画に必要な波形データと設定。
    - **戻り値**: `void`。
    - **機能**: 提供されたデータに基づいて、オシロスコープの画面に音波の視覚的な表現を描画します。
- **`PianoKeyboardRenderer.draw(frequency: number)`**:
    - **役割**: 検出された周波数をピアノ鍵盤上に表示。
    - **引数**: `frequency`: `number`。検出された周波数（Hz）。
    - **戻り値**: `void`。
    - **機能**: 検出周波数に対応する鍵盤をハイライトし、視覚的なフィードバックを提供します。
- **`UIEventHandlers.handleStartStopButton()`**:
    - **役割**: UIの開始/停止ボタンのクリックイベントを処理。
    - **引数**: なし。
    - **戻り値**: `Promise<void>`。
    - **機能**: オシロスコープの起動/停止ロジックをトリガーし、UIの状態を更新します。
- **`utils.frequencyToNote(frequency: number)`**:
    - **役割**: 周波数を最も近い音符名に変換。
    - **引数**: `frequency`: `number`。対象の周波数（Hz）。
    - **戻り値**: `string`。音符名（例: "A4"）。
    - **機能**: 音楽理論に基づき、与えられた周波数がどの音符に相当するかを計算します。

## 関数呼び出し階層ツリー
```
- B (dist/assets/main-DUIA4vI1.js)
  - if (demo-simple.js)
    - startUpdates (demo-simple.js)
      - stopUpdates ()
      - generateWaveform ()
      - startOscilloscope ()
      - switch ()
      - d ()
      - r ()
      - startFromBuffer ()
      - stop ()
      - getCurrentGain ()
      - getEstimatedFrequency ()
      - setDebugOverlaysEnabled ()
      - s ()
    - catch (demo-simple.js)
      - for (demo-simple.js)
      - v (dist/assets/demo-DsYptmO3.js)
      - b ()
      - w ()
      - f ()
      - k ()
      - takeScreenshot (scripts/screenshot-local.js)
      - close ()
      - updateHistory ()
      - getExtendedBuffer ()
      - clear ()
      - initializeAnalyser ()
      - start ()
      - startFromFile ()
      - getTimeDomainData ()
      - getExtendedTimeDomainData ()
      - getFrequencyData ()
      - getSampleRate ()
      - getFFTSize ()
      - getFrequencyBinCount ()
      - isReady ()
      - reset ()
      - trimSilence ()
      - createMediaStreamSource ()
      - createAnalyser ()
      - getTracks ()
      - getBasePath ()
      - getBasePathFromScripts ()
    - clearHistory ()
    - setFrequencyEstimationMethod ()
    - getFrequencyEstimationMethod ()
    - setBufferSizeMultiplier ()
    - getBufferSizeMultiplier ()
    - getMinFrequency ()
    - getMaxFrequency ()
    - getFrequencyPlotHistory ()
    - resolveValue (dist/OverlayLayout.d.ts)
    - setAutoGain ()
    - setNoiseGate ()
    - setNoiseGateThreshold ()
    - setUsePeakMode ()
    - setZeroCrossMode ()
    - loadWasmModule ()
      - getProcessor ()
      - processFrame ()
      - computeFrequencyData ()
      - cleanup (src/WasmModuleLoader.ts)
    - normalize (src/__tests__/normalized-harmonics-issue197.test.ts)
    - getAutoGainEnabled ()
    - getNoiseGateEnabled ()
    - getNoiseGateThreshold ()
    - setFFTDisplay ()
    - getFFTDisplayEnabled ()
    - getDebugOverlaysEnabled ()
    - updatePanels ()
    - getIsRunning ()
    - getSimilarityScore ()
    - isSimilaritySearchActive ()
    - setPauseDrawing ()
    - getPauseDrawing ()
    - dbToAmplitude (dist/utils.d.ts)
      - amplitudeToDb ()
      - frequencyToNote ()
    - createSilentMockAudioContext (src/__tests__/oscilloscope.test.ts)
      - getFFTOverlayDimensions ()
      - findFFTOverlayBorderCall ()
      - getAudioTracks ()
      - getVideoTracks ()
    - drawOffsetOverlayGraphs ()
    - drawOffsetLine (src/comparison-renderers/OffsetOverlayRenderer.ts)
    - drawSimilarityPlot ()
    - drawSimilarityText ()
    - drawWaveform ()
    - findPeakAmplitude ()
    - drawCenterLine ()
    - clearCanvas ()
    - calculateOverlayDimensions ()
    - drawFFTOverlay ()
    - Y ()
    - drawFrequencyPlot ()
    - drawHarmonicAnalysis ()
  - H ()
  - Z ()
  - constructor (undefined)
- initSync (dist/wasm/signal_processor_wasm.d.ts)
- __wbg_get_imports (dist/wasm/signal_processor_wasm.js)
- handleLoad (src/WasmModuleLoader.ts)
- createAudioBuffer (src/__tests__/utils.test.ts)
- calculateWeightedScore (src/__tests__/weighted-harmonic-issue195.test.ts)
- drawVerticalLine (src/renderers/PhaseMarkerRenderer.ts)

---
Generated at: 2026-02-06 07:13:05 JST
