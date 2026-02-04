Last updated: 2026-02-05

# Project Overview

## プロジェクト概要
- ブラウザ上で動作する、リアルタイムの音波形ビジュアライザーです。
- Rust/WebAssemblyを用いて高速なデータ処理を実現し、様々な周波数推定方式に対応しています。
- マイク入力、オーディオファイル、プログラムからのバッファに対応し、npmライブラリとしても利用可能です。

## 技術スタック
- フロントエンド: **TypeScript** (JavaScriptに型安全性をもたらし、大規模なアプリケーション開発を支援します。設定管理とレンダリングロジックに使用されます。), **HTML Canvas** (2Dグラフィックスの描画に使用され、波形やスペクトラム、鍵盤などのビジュアル要素をレンダリングします。), **Web Audio API** (マイクからのリアルタイム音声入力、オーディオファイルの再生・分析など、ブラウザ上での高度な音声処理を可能にします。)
- 音楽・オーディオ: **Web Audio API** (マイクやファイルからの音源取得、音声データの加工・分析に活用されます。)
- 開発ツール: **Vite** (非常に高速な開発サーバーとバンドル機能を提供し、モダンなWeb開発の効率を向上させます。), **npm / yarn** (JavaScriptプロジェクトのパッケージ管理ツールで、依存ライブラリのインストールやスクリプトの実行に利用されます。)
- テスト: **Vitest** (高速な単体テストフレームワークで、各種コンポーネントやアルゴリズムの動作検証に使用されます。), **happy-dom** (Vitestと連携し、Node.js環境でブラウザのDOMをシミュレートすることで、DOM操作を含むテストを可能にします。), **@vitest/ui** (テスト結果を視覚的に表示するユーザーインターフェースを提供し、テストの実行状況やカバレッジを分かりやすく確認できます。)
- ビルドツール: **Vite** (開発サーバーとしての役割に加え、本番向けにコードをバンドル・最適化します。), **wasm-pack** (RustのコードをWebAssemblyにコンパイルし、JavaScriptから利用可能な形式にパッケージ化するためのツールです。), **vite-plugin-dts** (TypeScriptの型定義ファイル（.d.ts）を自動生成し、ライブラリの型安全な利用をサポートします。)
- 言語機能: **Rust/WebAssembly** (コアとなるデータ処理アルゴリズムを実装するために使用されます。高いパフォーマンスとメモリ安全性を持ち、ブラウザ上での複雑な計算を高速に実行します。), **TypeScript** (アプリケーションの主要なロジックを記述し、開発効率とコードの品質を向上させます。)
- 自動化・CI/CD: (特定のツールや設定に関する情報が提供されていません。)
- 開発標準: **TypeScript** (厳格な型チェックにより、コードの品質と保守性を高める役割を果たします。)

## ファイル階層ツリー
```
📄 .gitignore
📖 ARCHITECTURE.md
📖 LIBRARY_USAGE.md
📄 LICENSE
📖 README.ja.md
📖 README.md
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
  📘 index.d.ts
  📄 index.d.ts.map
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
    📄 frequency_estimator.rs
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

-   **README.md / README.ja.md**: プロジェクトの概要、機能、技術スタック、使用方法などを説明する主要なドキュメントファイルです。日本語版と英語版があります。
-   **ARCHITECTURE.md**: プロジェクトのアーキテクチャや設計思想について記述されたドキュメントです。
-   **LIBRARY_USAGE.md**: 本プロジェクトをnpmライブラリとして他のプロジェクトで利用する方法について詳細に説明したドキュメントです。
-   **LICENSE**: プロジェクトのライセンス情報（MITライセンス）が記載されています。
-   **_config.yml**: GitHub Pagesなどの設定ファイルです。
-   **demo-simple.html / demo-simple.js**: ライブラリのシンプルな利用例を示すデモページとそのスクリプトです。CDN経由での利用方法が紹介されています。
-   **index.html**: アプリケーションのメインとなるHTMLファイルです。UI要素やキャンバスが配置されています。
-   **public/wasm/**: ビルド済みのWebAssembly（WASM）関連ファイルが格納されています。
    -   **signal_processor_wasm.js**: WASMモジュールをロードし、JavaScriptからRustの関数を呼び出すためのグルースクリプトです。
    -   **signal_processor_wasm_bg.wasm**: Rustで書かれたデータ処理アルゴリズムのWebAssemblyバイナリファイル本体です。高速な計算処理を担います。
    -   **signal_processor_wasm.d.ts / signal_processor_wasm_bg.wasm.d.ts**: WASMモジュール用のTypeScript型定義ファイルです。
-   **src/**: TypeScriptのソースコードが格納されている主要なディレクトリです。
    -   **Oscilloscope.ts**: オシロスコープの中核となるクラス定義ファイルです。音声入力の管理、データ処理、レンダリングの全体的な制御を行います。
    -   **AudioManager.ts**: Web Audio API を用いて、マイク入力やオーディオファイルからの音声データ取得を管理するクラスです。
    -   **BufferSource.ts**: 静的オーディオバッファを管理し、ループ再生などのオプションを提供するクラスです。
    -   **WasmModuleLoader.ts**: WebAssemblyモジュールを非同期でロードし、初期化するためのユーティリティクラスです。
    -   **WaveformDataProcessor.ts**: WASMモジュールと連携し、生の音声データから波形表示に必要なデータを加工・準備するクラスです。
    -   **WaveformRenderer.ts**: HTML Canvasに波形を描画する役割を担うクラスです。
    -   **PianoKeyboardRenderer.ts**: 検出された周波数をピアノ鍵盤上に視覚的に表示するクラスです。
    -   **UIEventHandlers.ts**: UI要素（ボタン、スライダーなど）のイベントを処理し、アプリケーションの状態を更新するクラスです。
    -   **GainController.ts**: 音声信号のゲイン（増幅率）を自動調整するロジックを管理するクラスです。
    -   **FrequencyEstimator.ts**: WASMモジュールが提供する周波数推定方式（FFT, STFT, CQTなど）を管理するクラスです。
    -   **utils.ts**: プロジェクト全体で利用される汎用的なヘルパー関数（周波数から音符への変換など）を提供します。
    -   **src/__tests__/**: 各コンポーネントのテストコードが格納されています。
    -   **src/renderers/**: 波形以外の様々なオーバーレイ（FFTスペクトラム、グリッド、倍音分析など）を描画するクラス群です。
    -   **src/comparison-renderers/**: 波形比較パネルに関連するレンダリングを行うクラス群です。
-   **signal-processor-wasm/src/**: Rustで書かれたWebAssemblyモジュールのソースコードディレクトリです。
    -   **lib.rs**: Rustクレートのエントリポイントで、JavaScriptから呼び出されるWASM関数の定義を含みます。
    -   **frequency_estimator.rs**: 周波数推定アルゴリズム（ゼロクロス、自己相関、FFT、STFT、CQTなど）の実装です。
    -   **zero_cross_detector.rs**: 波形のゼロクロス点を検出するアルゴリズムの実装です。
    -   **gain_controller.rs**: WASM内部でゲイン調整ロジックを処理します。
-   **dist/**: ビルドされたJavaScriptファイル、TypeScript型定義ファイル、WASMファイルなどが格納される出力ディレクトリです。本番環境でデプロイされるファイル群です。
-   **package.json / package-lock.json**: プロジェクトのメタデータ、依存関係、スクリプトなどが定義されているファイルです。
-   **vite.config.ts**: Viteビルドツールの設定ファイルです。

## 関数詳細説明

-   **Oscilloscope.constructor(canvasElement: HTMLCanvasElement)**
    -   **役割**: オシロスコープのインスタンスを初期化します。
    -   **引数**: `canvasElement` (波形を描画するHTML Canvas要素)。
    -   **戻り値**: なし。
    -   **機能**: 必要な内部コンポーネント（AudioManager, Rendererなど）を設定し、描画準備を行います。

-   **Oscilloscope.start(options?: StartOptions)**
    -   **役割**: マイク入力からのリアルタイム波形可視化を開始します。
    -   **引数**: `options` (オプション。例: マイク入力設定)。
    -   **戻り値**: `Promise<void>`。
    -   **機能**: Web Audio APIを通じてマイク入力を取得し、その音声をリアルタイムで分析・描画する処理を開始します。

-   **Oscilloscope.startFromBuffer(bufferSource: BufferSource)**
    -   **役割**: 提供された静的オーディオバッファからの波形可視化を開始します。
    -   **引数**: `bufferSource` (音声データとそのプロパティを持つ`BufferSource`インスタンス)。
    -   **戻り値**: `Promise<void>`。
    -   **機能**: WAVファイルなどから読み込まれた音声データを解析し、波形として表示します（音声再生なし）。

-   **Oscilloscope.stop()**
    -   **役割**: 現在の音声処理と描画を停止します。
    -   **引数**: なし。
    -   **戻り値**: `void`。
    -   **機能**: マイク入力やオーディオファイルの処理を停止し、画面の更新を止めます。

-   **AudioManager.start()**
    -   **役割**: マイク入力からの音声ストリームの取得を開始します。
    -   **引数**: なし。
    -   **戻り値**: `Promise<void>`。
    -   **機能**: Web Audio APIの `getUserMedia` を使用してマイクアクセスを要求し、音声データを `AudioBufferSourceNode` に接続します。

-   **AudioManager.startFromFile(file: File)**
    -   **役割**: 指定されたオーディオファイル（WAVなど）の再生と音声データ取得を開始します。
    -   **引数**: `file` (入力となるオーディオファイル)。
    -   **戻り値**: `Promise<void>`。
    -   **機能**: ファイルをデコードし、その音声データを `AudioBufferSourceNode` でループ再生しながら取得します。

-   **WasmModuleLoader.loadWasmModule(wasmPath: string)**
    -   **役割**: WebAssemblyモジュールを非同期でロードし、初期化します。
    -   **引数**: `wasmPath` (WebAssemblyバイナリファイルへのパス)。
    -   **戻り値**: `Promise<void>`。
    -   **機能**: WASMファイルを読み込み、JavaScriptからWASM関数を呼び出せるように準備します。

-   **signal_processor_wasm.processFrame(waveform_data: Float32Array)**
    -   **役割**: WASM側で音声フレームの主要なデータ処理（周波数推定、ゼロクロス検出、ゲイン調整など）を実行します。
    -   **引数**: `waveform_data` (処理対象となる生の音声データ)。
    -   **戻り値**: 処理結果を含むオブジェクト。
    -   **機能**: 高速なRustアルゴリズムを用いて、入力された音声データから表示に必要な分析結果（周波数、ゼロクロス点など）を生成します。

-   **signal_processor_wasm.computeFrequencyData(method: number, buffer_size_multiplier: number)**
    -   **役割**: 指定された周波数推定方法とバッファサイズ乗数に基づいて、周波数データを計算します。
    -   **引数**: `method` (周波数推定アルゴリズムのID), `buffer_size_multiplier` (バッファサイズの倍率)。
    -   **戻り値**: `Float32Array` (周波数スペクトラムデータ)。
    -   **機能**: FFT, STFT, CQTなどのアルゴリズムをRustで実行し、音声の周波数成分を解析します。

-   **UIEventHandlers.handleStartStopButton()**
    -   **役割**: UI上の開始/停止ボタンのクリックイベントを処理します。
    -   **引数**: なし。
    -   **戻り値**: `void`。
    -   **機能**: オシロスコープの開始または停止を切り替え、UIの状態を更新します。

-   **utils.frequencyToNote(frequency: number)**
    -   **役割**: 周波数を音名とオクターブの文字列に変換します。
    -   **引数**: `frequency` (変換対象の周波数)。
    -   **戻り値**: `string` (例: "A4", "C#5")。
    -   **機能**: 検出された周波数を、ピアノ鍵盤表示などで使用する人間の理解しやすい音名に変換します。

## 関数呼び出し階層ツリー
```
- if (demo-simple.js)
  - startUpdates (demo-simple.js)
    - stopUpdates ()
      - generateWaveform ()
      - startOscilloscope ()
      - switch ()
      - startFromBuffer ()
      - stop ()
  - catch (demo-simple.js)
    - takeScreenshot (scripts/screenshot-local.js)
      - close ()
    - trimSilence ()
      - dbToAmplitude (dist/utils.d.ts)
      - amplitudeToDb ()
      - frequencyToNote ()
    - reset ()
    - start ()
      - startFromFile ()
      - createMediaStreamSource ()
      - createAnalyser ()
      - getTracks ()
  - constructor (undefined)
  - setBufferSizeMultiplier ()
  - setFrequencyEstimationMethod ()
  - resolveValue (dist/OverlayLayout.d.ts)
  - computeFrequencyData ()
  - processFrame ()
  - setAutoGain ()
  - setNoiseGate ()
  - setNoiseGateThreshold ()
  - setUsePeakMode ()
  - setZeroCrossMode ()
  - cleanup (src/WasmModuleLoader.ts)
    - loadWasmModule ()
  - normalize (src/__tests__/normalized-harmonics-issue197.test.ts)
  - createSilentMockAudioContext (src/__tests__/oscilloscope.test.ts)
    - getFFTOverlayDimensions ()
      - findFFTOverlayBorderCall ()
      - getAudioTracks ()
      - getVideoTracks ()
  - drawOffsetLine (src/comparison-renderers/OffsetOverlayRenderer.ts)
- for (demo-simple.js)
- __wbg_get_imports (dist/wasm/signal_processor_wasm.js)
  - initSync (dist/wasm/signal_processor_wasm.d.ts)
    - free ()
  - __wbg_init ()
  - getArrayF32FromWasm0 ()
  - getArrayU8FromWasm0 ()
  - getFloat32ArrayMemory0 ()
  - getStringFromWasm0 ()
  - getUint8ArrayMemory0 ()
  - isLikeNone ()
  - passArray8ToWasm0 ()
  - passArrayF32ToWasm0 ()
  - passStringToWasm0 ()
  - decodeText ()
  - __wbg_finalize_init ()
  - __wbg_load ()
  - expectedResponseType ()
  - __destroy_into_raw ()
- handleLoad (src/WasmModuleLoader.ts)
- createAudioBuffer (src/__tests__/utils.test.ts)
- calculateWeightedScore (src/__tests__/weighted-harmonic-issue195.test.ts)
- drawVerticalLine (src/renderers/PhaseMarkerRenderer.ts)
```

---
Generated at: 2026-02-05 07:11:45 JST
