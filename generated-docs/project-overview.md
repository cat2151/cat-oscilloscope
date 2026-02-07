Last updated: 2026-02-08

# Project Overview

## プロジェクト概要
- `cat-oscilloscope`は、ブラウザ上で動作する高機能なリアルタイム波形ビジュアライザーです。
- マイク入力やオーディオファイルから音の波形をキャプチャし、5種類のアルゴリズムで周波数を高精度に推定・表示します。
- Rust/WebAssemblyによる高速な信号処理とTypeScriptによる柔軟なUIレンダリングを組み合わせた現代的なウェブアプリケーションです。

## 技術スタック
- フロントエンド: 
  - **TypeScript**: 型安全なJavaScriptで、アプリケーションの設定管理やUIのレンダリングを効率的に行います。
  - **HTML Canvas**: 2DグラフィックスAPIで、リアルタイムの音の波形、周波数スペクトラム、その他の視覚情報を描画するために使用されます。
  - **Web Audio API**: ブラウザでオーディオを処理するためのAPIで、マイク入力からの音声キャプチャ、オーディオファイルの解析、音量調整など、オーディオ関連のコア機能を提供します。
- 音楽・オーディオ: 
  - **Web Audio API**: 音声データのリアルタイム処理、周波数分析、音量調整、オーディオバッファ管理など、音響解析の中心的な役割を担います。
- 開発ツール: 
  - **Vite**: 高速な開発サーバーとモダンなバンドラーを提供し、開発体験を大幅に向上させます。
  - **Node.js**: JavaScriptランタイムとして、開発サーバーの実行やビルドスクリプトの実行に必要です。
  - **npm / yarn**: プロジェクトの依存関係を管理し、必要なライブラリやツールをインストールします。
- テスト: 
  - **Vitest**: 高速なユニットテストフレームワークで、JavaScript/TypeScriptコードの正確性と信頼性を検証します。
  - **Happy DOM**: Vitest環境でブラウザのDOM（Document Object Model）操作をシミュレートするために使用されます。
- ビルドツール: 
  - **Vite**: プロダクションビルドを最適化し、軽量で高性能なJavaScriptバンドルを生成します。
  - **wasm-pack**: Rustで書かれた信号処理アルゴリズムをWebAssemblyモジュールにコンパイルするために使用されます。
  - **vite-plugin-dts**: TypeScriptの型定義ファイル（`.d.ts`）を自動生成し、ライブラリの型安全な利用をサポートします。
- 言語機能: 
  - **TypeScript**: 静的型付けにより、大規模なコードベースの保守性と信頼性を高め、開発時のエラーを早期に検出します。
  - **Rust / WebAssembly**: パフォーマンスが要求される信号処理や複雑な数値計算アルゴリズムを、高速かつ型安全に実行するために使用されます。これにより、ブラウザ上でのリアルタイム処理性能が向上しています。

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
    📜 Oscilloscope-Bzx1rOH_.js
    📄 Oscilloscope-Bzx1rOH_.js.map
    📜 demo-nVUfoJ2K.js
    📄 demo-nVUfoJ2K.js.map
    📜 main-C_f3mX6S.js
    📄 main-C_f3mX6S.js.map
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
  📖 254-diagnostic-plan.md
  📖 254.md
  📖 255.md
  📖 257.md
  📖 265.md
  📖 267.md
  📖 269-diagnostic-implementation.md
  📖 269-sample-output.md
  📖 269.md
  📖 273.md
  📖 275.md
  📖 277.md
  📖 279.md
  📖 281.md
  📖 283.md
  📖 285.md
  📖 286.md
  📖 288.md
  📖 289.md
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
    📄 dft.rs
    📁 frequency_estimation/
      📄 dsp_utils.rs
      📄 fft.rs
      📄 harmonic_analysis.rs
      📄 mod.rs
      📁 non_default_methods/
        📄 autocorrelation.rs
        📄 cqt.rs
        📄 mod.rs
        📄 stft.rs
        📄 zero_crossing.rs
      📄 smoothing.rs
      📄 tests.rs
    📄 gain_controller.rs
    📄 lib.rs
    📄 waveform_render_data.rs
    📄 waveform_searcher.rs
    📁 zero_cross_detector/
      📄 default_mode.rs
      📄 mod.rs
      📄 non_default_modes.rs
      📄 types.rs
      📄 utils.rs
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
    📘 performance-issue267.test.ts
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
  🌐 test-startFromBuffer-error.html
  📄 wavlpf-broken-layout.png
📖 test-segment-relative.md
📊 tsconfig.json
📊 tsconfig.lib.json
📘 vite.config.ts
```

## ファイル詳細説明
- **README.ja.md / README.md**: プロジェクトの概要、機能、使用方法、技術スタックなどを説明する主要なドキュメント。日本語版と英語版があります。
- **LIBRARY_USAGE.md**: `cat-oscilloscope`をnpmライブラリとして他のプロジェクトで利用する際の詳細な手順と注意事項が記載されたドキュメントです。
- **ARCHITECTURE.md**: プロジェクトの全体的なアーキテクチャや設計思想について説明するドキュメントです。
- **demo-simple.html / demo-simple.js**: `cat-oscilloscope`ライブラリの簡易的な利用例を示すデモページとそのスクリプトです。CDN経由での利用方法も紹介しています。
- **index.html**: メインアプリケーションのウェブページです。様々なUI要素と波形描画用のキャンバスが含まれています。
- **src/main.ts**: アプリケーションのエントリーポイントです。主要なコンポーネントを初期化し、UIとの連携を設定します。
- **src/Oscilloscope.ts**: オシロスコープ機能の中核を担うクラスです。音声入力の管理、データ処理の調整、およびレンダリングプロセスを制御します。
- **src/AudioManager.ts**: Web Audio APIを利用して、マイク入力やオーディオファイルからの音声データを管理します。
- **src/BufferSource.ts**: 静的バッファからの音声データ供給を管理するクラスです。オーディオを再生せずに波形を可視化する際に利用されます。
- **src/WasmModuleLoader.ts**: Rustで実装されたWebAssemblyモジュールを動的にロードし、JavaScript側から信号処理機能を利用できるようにします。
- **src/WaveformDataProcessor.ts**: WASMモジュールと連携し、生の音声データに対してゼロクロス検出、周波数推定、ゲイン調整などの各種信号処理を実行します。
- **src/WaveformRenderer.ts**: HTML Canvasに波形を描画する役割を担います。グリッド、波形ライン、FFTスペクトラムなどのオーバーレイ表示を調整します。
- **src/GainController.ts**: 波形の振幅を自動的に調整するオートゲイン機能を提供し、視覚的な安定性を保ちます。
- **src/FrequencyEstimator.ts**: FFT、STFT、CQT、Zero-Crossing、Autocorrelationといった、5つの異なる周波数推定アルゴリズムを管理します。
- **src/PianoKeyboardRenderer.ts**: 検出された周波数をピアノの鍵盤上に視覚的に表示し、音程を直感的に把握できるようにします。
- **src/UIEventHandlers.ts**: UI要素（ボタン、スライダー、チェックボックスなど）からのユーザーインタラクションを処理し、アプリケーションの状態を更新します。
- **src/DOMElementManager.ts**: アプリケーションが必要とするDOM要素の取得と管理を行い、UIコンポーネントとの連携を容易にします。
- **src/OverlayLayout.ts**: FFTスペクトラムや倍音分析などのオーバーレイ表示のレイアウトとサイズ調整を管理し、複数の情報表示を整理します。
- **src/FrameBufferHistory.ts**: 過去の音声フレームデータを保持し、低周波の検出精度を向上させるための拡張バッファ機能を提供します。
- **src/ComparisonPanelRenderer.ts**: 現在の波形と前回の波形の類似度を比較表示するパネルのレンダリングを管理します。
- **src/CycleSimilarityRenderer.ts**: 波形比較パネルにおいて、波形の類似度を示すプロットやテキスト表示を処理します。
- **src/utils.ts**: アプリケーション全体で利用される共通のユーティリティ関数（デシベル値と振幅の変換、周波数から音符への変換など）を提供します。
- **signal-processor-wasm/src/**: Rustで実装された信号処理アルゴリズムのソースコード群です。WebAssemblyにコンパイルされ、JavaScriptから高速に利用されます。
- **public/wasm/**: ビルド済みのWebAssemblyモジュールとその関連ファイル（JavaScriptローダー、型定義など）が配置されるディレクトリです。
- **dist/**: Viteによってビルドされたプロダクション用のJavaScriptバンドル、CSS、HTMLファイルなどが出力されるディレクトリです。

## 関数詳細説明
- `Oscilloscope`クラス (src/Oscilloscope.ts):
  - `constructor(canvas: HTMLCanvasElement)`: オシロスコープのインスタンスを初期化し、描画に使用するHTMLキャンバス要素を設定します。
  - `start(): Promise<void>`: マイク入力からの音声処理と波形可視化を開始します。
  - `startFromFile(file: File): Promise<void>`: 指定されたオーディオファイル（WAVなど）からの音声処理と波形可視化を開始します。
  - `startFromBuffer(bufferSource: BufferSource): Promise<void>`: `BufferSource`オブジェクトから提供される音声バッファデータを用いて、波形可視化を開始します。
  - `stop(): void`: 現在実行中の音声処理と波形可視化を停止します。
  - `setAutoGain(enabled: boolean): void`: 自動ゲイン（音量自動調整）機能の有効/無効を切り替えます。
    - 引数: `enabled` (boolean) - 自動ゲインを有効にするか無効にするか。
  - `setNoiseGate(enabled: boolean): void`: ノイズゲート機能（一定以下の音量をカット）の有効/無効を切り替えます。
    - 引数: `enabled` (boolean) - ノイズゲートを有効にするか無効にするか。
  - `setFrequencyEstimationMethod(method: string): void`: 周波数推定アルゴリズム（例: "FFT", "STFT", "CQT"など）を設定します。
    - 引数: `method` (string) - 使用する周波数推定方法の名称。
  - `setBufferSizeMultiplier(multiplier: number): void`: 低周波検出精度を向上させるための、過去フレームバッファの乗数を設定します（例: 1, 4, 16）。
    - 引数: `multiplier` (number) - バッファサイズの乗数。
  - `setDebugOverlaysEnabled(enabled: boolean): void`: デバッグ用オーバーレイ（FFTスペクトラム、倍音分析など）の表示/非表示を切り替えます。
    - 引数: `enabled` (boolean) - デバッグオーバーレイを表示するかどうか。
  - `setOverlaysLayout(layout: OverlayLayoutConfig): void`: オーバーレイ（FFTスペクトラムなど）の表示レイアウトをカスタマイズします。
    - 引数: `layout` (OverlayLayoutConfig) - オーバーレイのレイアウト設定オブジェクト。
- `AudioManager`クラス (src/AudioManager.ts):
  - `start(sampleRate: number): Promise<void>`: Web Audio APIのコンテキストを初期化し、マイク入力からの音声ストリームを開始します。
    - 引数: `sampleRate` (number) - サンプルレート。
  - `stop(): void`: 現在のオーディオ処理を停止し、関連するリソースを解放します。
- `BufferSource`クラス (src/BufferSource.ts):
  - `constructor(audioData: Float32Array, sampleRate: number, options?: BufferSourceOptions)`: 音声データ、サンプルレート、およびオプション（例: ループ再生）を指定してインスタンスを初期化します。
    - 引数: `audioData` (Float32Array) - 音声データ。 `sampleRate` (number) - サンプルレート。 `options` (BufferSourceOptions, オプション) - ループ再生などの設定。
  - `getNextChunk(chunkSize: number): Float32Array`: 指定されたサイズの次の音声データチャンクを返します。
    - 引数: `chunkSize` (number) - 取得するチャンクのサイズ。
    - 戻り値: `Float32Array` - 音声データチャンク。
- `WasmModuleLoader`クラス (src/WasmModuleLoader.ts):
  - `loadWasmModule(wasmPath: string): Promise<typeof import("../public/wasm/signal_processor_wasm")>`: 指定されたパスからWebAssemblyモジュールを非同期でロードし、利用可能な状態にします。
    - 引数: `wasmPath` (string) - WASMファイルのパス。
    - 戻り値: `Promise<typeof import(...)>` - ロードされたWASMモジュール。
- `WaveformDataProcessor`クラス (src/WaveformDataProcessor.ts):
  - `initialize(sampleRate: number, bufferSizeMultiplier: number, fftSize: number, initialGain: number, noiseGateThreshold: number): void`: WebAssemblyモジュールと同期し、信号処理のための各種パラメータ（サンプルレート、FFTサイズなど）を初期化します。
    - 引数: 各種初期化パラメータ。
  - `processFrame(inputData: Float32Array): void`: 入力された音声データフレームをWebAssemblyモジュールに渡し、信号処理（周波数推定、ゲイン計算など）を実行させます。
    - 引数: `inputData` (Float32Array) - 処理する音声データ。
  - `getEstimatedFrequency(): number`: WebAssemblyモジュールから推定された現在の基本周波数（Hz）を取得します。
    - 戻り値: `number` - 推定された周波数。
- `UIEventHandlers`クラス (src/UIEventHandlers.ts):
  - `handleStartStopButton(): void`: アプリケーションの「開始/停止」ボタンがクリックされた際のイベントを処理し、オシロスコープの起動または停止を制御します。
  - `handleFileInput(event: Event): Promise<void>`: オーディオファイル入力（`<input type="file">`）の変更イベントを処理し、選択されたファイルを読み込んで可視化を開始します。
    - 引数: `event` (Event) - ファイル入力イベント。
- ユーティリティ関数 (src/utils.ts):
  - `dbToAmplitude(db: number): number`: デシベル値を振幅値に変換します。
    - 引数: `db` (number) - デシベル値。
    - 戻り値: `number` - 振幅値。
  - `amplitudeToDb(amplitude: number): number`: 振幅値をデシベル値に変換します。
    - 引数: `amplitude` (number) - 振幅値。
    - 戻り値: `number` - デシベル値。
  - `frequencyToNote(frequency: number): NoteInfo | null`: 周波数を対応する音符情報（ノート名、オクターブ、セント値）に変換します。
    - 引数: `frequency` (number) - 周波数（Hz）。
    - 戻り値: `NoteInfo | null` - 音符情報、または変換できない場合は`null`。

## 関数呼び出し階層ツリー
```
- initSync (dist/wasm/signal_processor_wasm.d.ts)
  - t ()
    - if (demo-simple.js)
      - startUpdates (demo-simple.js)
      - stopUpdates ()
      - generateWaveform ()
      - startOscilloscope ()
      - switch ()
      - d ()
      - n ()
      - startFromBuffer ()
      - stop ()
      - getCurrentGain ()
      - getEstimatedFrequency ()
      - setDebugOverlaysEnabled ()
      - catch (demo-simple.js)
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
      - getNextChunk ()
      - getLength ()
      - setChunkSize ()
      - trimSilence ()
      - createMediaStreamSource ()
      - createAnalyser ()
      - getTracks ()
      - getBasePath ()
      - getBasePathFromScripts ()
      - f ()
      - get ()
      - clearHistory ()
      - setFrequencyEstimationMethod ()
      - getFrequencyEstimationMethod ()
      - setBufferSizeMultiplier ()
      - getBufferSizeMultiplier ()
      - getMinFrequency ()
      - getMaxFrequency ()
      - getFrequencyPlotHistory ()
      - resolveValue (dist/OverlayLayout.d.ts)
      - N ()
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
      - fromAudioBuffer ()
      - seek ()
      - getPosition ()
      - getChunkSize ()
      - setLooping ()
      - isLoop ()
      - isAtEnd ()
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
      - createSilentMockAudioContext (src/__tests__/oscilloscope.test.ts)
      - getFFTOverlayDimensions ()
      - findFFTOverlayBorderCall ()
      - getAudioTracks ()
      - getVideoTracks ()
      - fn ()
      - render ()
      - function ()
      - createMockAudioContext (src/__tests__/startFromBuffer.test.ts)
      - drawOffsetOverlayGraphs ()
      - drawOffsetLine (src/comparison-renderers/OffsetOverlayRenderer.ts)
      - drawPhaseMarkers ()
      - drawPositionMarkers ()
      - drawLine (src/comparison-renderers/PositionMarkerRenderer.ts)
      - drawSimilarityPlot ()
      - drawSimilarityText ()
      - drawWaveform ()
      - findPeakAmplitude ()
      - drawCenterLine ()
      - clearCanvas ()
      - calculateOverlayDimensions ()
      - drawFFTOverlay ()
      - drawFrequencyPlot ()
      - frequencyToNote ()
      - drawHarmonicAnalysis ()
      - amplitudeToDb ()
    - for (demo-simple.js)
      - defineProperty (src/__tests__/comparison-panel-renderer.test.ts)
      - clampPhaseMarkers ()
      - makeRenderData (src/__tests__/waveform-data-processor.test.ts)
      - callClamp ()
      - clearAndDrawGrid ()
      - setHarmonicAnalysisEnabled ()
    - i ()
    - z ()
      - constructor (undefined)
    - q ()
    - B ()
    - O ()
    - u ()
- __wbg_get_imports (dist/wasm/signal_processor_wasm.js)
- while (src/AudioManager.ts)
- handleLoad (src/WasmModuleLoader.ts)
- createAudioBuffer (src/__tests__/utils.test.ts)
- calculateWeightedScore (src/__tests__/weighted-harmonic-issue195.test.ts)
- drawVerticalLine (src/renderers/PhaseMarkerRenderer.ts)

---
Generated at: 2026-02-08 07:11:29 JST
