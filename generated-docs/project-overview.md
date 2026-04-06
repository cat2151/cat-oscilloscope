Last updated: 2026-04-07

# Project Overview

## プロジェクト概要
- ブラウザ上で動作する高機能なオシロスコープ風の波形ビジュアライザーです。
- マイク入力やオーディオファイルからリアルタイムで音声を分析し、波形、周波数スペクトラム、ピアノ鍵盤表示などを提供します。
- Rust/WebAssemblyによる高速なデータ処理と、多様な周波数推定アルゴリズム（FFT, STFT, CQTなど）が特徴です。

## 技術スタック
- フロントエンド: **TypeScript** (型安全なJavaScriptでアプリケーションのロジックとレンダリングを担当), **HTML Canvas** (2DグラフィックAPIで波形やスペクトラムの描画に使用), **Web Audio API** (ブラウザ内で音声のキャプチャ、処理、分析を行うためのAPI)
- 音楽・オーディオ: **Web Audio API** (マイク入力やオーディオファイルの読み込み、音声バッファの管理に使用)
- 開発ツール: **Vite** (高速な開発サーバーとビルドツール), **Node.js** / **npm** (プロジェクトの実行環境およびパッケージ管理)
- テスト: **Vitest** (JavaScript/TypeScriptコードのテストフレームワーク), **@vitest/ui** (Vitestのテスト結果をブラウザで視覚的に表示するUI)
- ビルドツール: **Vite** (本番用ビルドの生成), **vite-plugin-dts** (TypeScriptの型定義ファイル生成), **wasm-pack** (RustコードをWebAssemblyにビルドし、JavaScriptから利用可能にするツール)
- 言語機能: **Rust** (高性能な信号処理アルゴリズムが実装されているWebAssemblyモジュールの開発言語), **TypeScript** (型定義とモダンなJavaScript開発をサポート)
- 自動化・CI/CD: **GitHub Actions** (コードベースの品質維持のため、大きなファイルの自動検出などのCI/CDワークフローを提供)
- 開発標準: **コード品質の自動チェック** (日次で大きなファイルを検出し、リファクタリングを促す仕組み)

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
  📘 FrameTimingDiagnostics.d.ts
  📄 FrameTimingDiagnostics.d.ts.map
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
  📘 RenderCoordinator.d.ts
  📄 RenderCoordinator.d.ts.map
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
    📜 Oscilloscope-BiPi-aIi.js
    📄 Oscilloscope-BiPi-aIi.js.map
    📜 demo-9JbpkLFd.js
    📄 demo-9JbpkLFd.js.map
    📜 main-pCt8i_lw.js
    📄 main-pCt8i_lw.js.map
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
  📖 294.md
  📖 296.md
  📖 299.md
  📖 301.md
  📖 305.md
  📖 307.md
  📖 311.md
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
    📄 candidate_selection.rs
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
    📄 phase_markers.rs
    📄 waveform_render_data.rs
    📄 waveform_searcher.rs
    📁 zero_cross_detector/
      📄 default_mode.rs
      📄 mod.rs
      📄 non_default_modes.rs
      📄 phase_zero.rs
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
  📘 FrameTimingDiagnostics.ts
  📘 FrequencyEstimator.ts
  📘 GainController.ts
  📘 Oscilloscope.ts
  📘 OverlayLayout.ts
  📘 PianoKeyboardRenderer.ts
  📘 RenderCoordinator.ts
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
    📘 phase-marker-constraint-issue296.test.ts
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
- **ARCHITECTURE.md**: プロジェクトのアーキテクチャ設計に関するドキュメント。
- **LIBRARY_USAGE.md**: npmライブラリとしてプロジェクトを利用するための詳細な手順を説明するドキュメント。
- **LICENSE**: プロジェクトのライセンス情報（MITライセンス）。
- **README.ja.md / README.md**: プロジェクトの概要、機能、使い方などを説明する多言語対応のメインドキュメント。
- **REFACTORING_ISSUE_251.md / REFACTORING_SUMMARY.md**: 特定のリファクタリング作業に関する詳細や概要をまとめたドキュメント。
- **_config.yml**: GitHub Pagesなどの設定ファイル。
- **demo-simple.html**: `cat-oscilloscope`ライブラリの簡易デモを表示するためのHTMLファイル。
- **demo-simple.js**: 簡易デモの動作ロジックを実装するJavaScriptファイル。
- **dist/**: ビルドされたアプリケーションやライブラリの出力ディレクトリ。
    - **dist/*.d.ts**: TypeScriptの型定義ファイル。対応するJavaScriptモジュールの型情報を提供。
    - **dist/assets/*.js**: ViteによってバンドルされたJavaScriptアセット。
    - **dist/*.js / *.mjs / *.cjs**: ビルドされたJavaScriptモジュール（ESM/CJS形式）。
    - **dist/wasm/**: ビルド済みのWebAssemblyモジュールとそれに関連するJavaScriptバインディング。
- **example-library-usage.html**: ライブラリのより詳細な利用例を示すHTMLファイル。
- **index.html**: アプリケーションのメインページとなるHTMLファイル。
- **package.json**: プロジェクトのメタデータ、依存関係、スクリプト定義を含むファイル。
- **public/wasm/**: ビルド済みのWebAssemblyモジュールを配置するディレクトリ。
- **scripts/screenshot-local.js**: ローカル環境でスクリーンショットを撮影するためのスクリプト。
- **signal-processor-wasm/**: Rustで書かれたWebAssemblyモジュールのソースコードを格納するディレクトリ。
    - **signal-processor-wasm/Cargo.toml**: Rustプロジェクトの設定ファイル。
    - **signal-processor-wasm/src/lib.rs**: Rust WebAssemblyモジュールのエントリポイント。
    - **signal-processor-wasm/src/frequency_estimation/**: 周波数推定アルゴリズム群のRust実装。FFT, STFT, CQTなどが含まれる。
    - **signal-processor-wasm/src/zero_cross_detector/**: ゼロクロス検出アルゴリズム群のRust実装。
    - **signal-processor-wasm/src/*.rs**: バンドパスフィルター(BPF)、候補選択、DFT、ゲイン制御、位相マーカー、波形レンダリングデータ、波形検索など、様々な信号処理ロジックのRust実装。
- **src/**: TypeScriptのソースコードを格納するディレクトリ。
    - **src/AudioManager.ts**: Web Audio APIを介したマイク入力やオーディオファイルからのデータ取得、バッファリングを管理。
    - **src/BasePathResolver.ts**: WebAssemblyモジュールなどの外部リソースへのパスを解決するユーティリティ。
    - **src/BufferSource.ts**: 静的オーディオバッファからのデータ供給を管理し、ループ再生などの機能を提供。
    - **src/ComparisonPanelRenderer.ts**: 以前の波形と現在の波形の比較パネルの描画を管理。
    - **src/CycleSimilarityRenderer.ts**: 波形のサイクル類似度を表示するパネルの描画を管理。
    - **src/DOMElementManager.ts**: アプリケーションが使用するHTML DOM要素へのアクセスと管理を提供。
    - **src/DisplayUpdater.ts**: 画面上の周波数表示、ゲイン表示、類似度表示などのUI要素を更新。
    - **src/FrameBufferHistory.ts**: 拡張バッファ機能のために、過去のオーディオフレームデータを履歴として保持。
    - **src/FrameTimingDiagnostics.ts**: 各フレームの処理時間やレンダリングタイミングに関する診断情報を記録・管理。
    - **src/FrequencyEstimator.ts**: WebAssemblyモジュールに周波数推定方式を設定し、推定結果を取得するインターフェースを提供。
    - **src/GainController.ts**: 入力されるオーディオ信号の振幅を自動調整（オートゲイン）するロジックを管理。
    - **src/Oscilloscope.ts**: オシロスコープアプリケーションのメインクラス。オーディオ入力、データ処理、レンダリングの全体的な調整と状態管理を行う。
    - **src/OverlayLayout.ts**: FFTスペクトラムや倍音分析などのオーバーレイ表示のレイアウト定義と計算ロジック。
    - **src/PianoKeyboardRenderer.ts**: 検出された周波数をピアノの鍵盤上に視覚的に表示するレンダリングロジック。
    - **src/RenderCoordinator.ts**: 波形描画、比較パネル、類似度表示など、複数のレンダリングコンポーネントの協調を管理。
    - **src/UIEventHandlers.ts**: ユーザーインターフェース（ボタン、スライダー、チェックボックスなど）からのイベントを処理し、アプリケーションの動作に反映。
    - **src/WasmModuleLoader.ts**: WebAssemblyモジュールの読み込み、初期化、およびクリーンアップを管理。
    - **src/WaveformDataProcessor.ts**: AudioManagerから受け取ったオーディオデータをWebAssemblyモジュールに渡し、処理結果を受け取る役割。ノイズゲートや自動ゲイン処理も統合。
    - **src/WaveformRenderData.ts**: WebAssemblyモジュールから返される、波形描画に必要な様々なデータ（周波数、ゲイン、位相マーカーなど）を保持するデータ構造。
    - **src/WaveformRenderer.ts**: メインキャンバスに波形、グリッド、FFTスペクトラム、倍音分析などの視覚要素を描画。
    - **src/WaveformSearcher.ts**: 安定した波形表示のために、オーディオバッファ内で表示に適した波形サイクルを探索。
    - **src/ZeroCrossDetector.ts**: 波形がゼロ点と交差する位置を検出し、安定した波形描画の基準を提供する。
    - **src/index.ts**: `cat-oscilloscope`ライブラリの公開エントリーポイント。
    - **src/main.ts**: アプリケーション全体の初期化と、主要なUIコンポーネントとロジックの連携を設定。
    - **src/utils.ts**: デシベルと振幅の変換、周波数から音名への変換、無音部分のトリミングなど、汎用的なユーティリティ関数を提供。
    - **src/comparison-renderers/**: 波形比較パネルを構成する個別のレンダラー群（オフセットオーバーレイ、ポジションマーカー、類似度プロット、波形パネル）。
    - **src/renderers/**: メインの波形キャンバス上の様々なオーバーレイを描画するレンダラー群（ベース、FFT、周波数プロット、グリッド、倍音分析、位相マーカー、波形ライン）。
- **test-segment-relative.md**: 特定のテストセグメントに関する相対的な情報やメモ。
- **vite.config.ts**: Viteのビルド設定ファイル。

## 関数詳細説明
- **Oscilloscope.constructor(canvas: HTMLCanvasElement)**: オシロスコープのインスタンスを初期化します。描画対象のHTMLキャンバス要素を受け取り、内部コンポーネントを設定します。
- **Oscilloscope.start()**: マイク入力からのオーディオストリームの処理と波形可視化を開始します。
- **Oscilloscope.startFromFile(file: File)**: 指定されたオーディオファイル（WAV）を読み込み、そのオーディオデータの処理と波形可視化を開始します。
- **Oscilloscope.startFromBuffer(bufferSource: BufferSource)**: `BufferSource`から提供される静的なオーディオデータバッファの処理と波形可視化を開始します。
- **Oscilloscope.stop()**: 現在のオーディオ入力の処理と波形の描画を停止し、関連するリソースを解放します。
- **Oscilloscope.setAutoGain(enabled: boolean)**: 自動ゲイン機能の有効/無効を切り替えます。
- **Oscilloscope.setNoiseGate(enabled: boolean)**: ノイズゲート機能の有効/無効を切り替えます。
- **Oscilloscope.setFrequencyEstimationMethod(method: string)**: 周波数推定に使用するアルゴリズム（例: FFT, STFT, CQT）を設定します。
- **Oscilloscope.setBufferSizeMultiplier(multiplier: number)**: 低周波数検出精度を高めるためのバッファサイズ乗数を設定します（例: 1x, 4x, 16x）。
- **Oscilloscope.setDebugOverlaysEnabled(enabled: boolean)**: FFTスペクトラムや倍音分析などのデバッグ用オーバーレイ表示の有効/無効を切り替えます。
- **Oscilloscope.setOverlaysLayout(layout: OverlayLayoutConfig)**: オーバーレイ表示のレイアウトをカスタマイズします。
- **Oscilloscope.setPauseDrawing(paused: boolean)**: 波形描画の一時停止/再開を切り替えます。
- **Oscilloscope.getEstimatedFrequency(): number**: 現在推定されている周波数をHz単位で返します。
- **Oscilloscope.getCurrentGain(): number**: 現在適用されているゲイン値を返します。
- **Oscilloscope.getSimilarityScore(): number**: 前回と今回の波形の類似度スコアを返します。
- **AudioManager.start()**: Web Audio APIを初期化し、マイクからのオーディオストリーム取得を開始します。
- **AudioManager.startFromFile(file: File)**: 指定されたオーディオファイルから `AudioBufferSourceNode` を作成し、再生を開始します。
- **AudioManager.startFromBuffer(bufferSource: BufferSource)**: 外部の `BufferSource` からオーディオデータを取得して処理を開始します。
- **AudioManager.stop()**: すべてのアクティブなオーディオ処理と入力を停止し、リソースをクリーンアップします。
- **BufferSource.constructor(audioData: Float32Array, sampleRate: number, options?: BufferSourceOptions)**: 静的オーディオバッファを初期化します。オーディオデータ、サンプルレート、ループなどのオプションを受け取ります。
- **BufferSource.getNextChunk(size: number): Float32Array**: 次の指定されたサイズのオーディオデータチャンクを返します。
- **BufferSource.seek(position: number)**: バッファ内の指定された位置（サンプル単位）に再生ヘッドを移動します。
- **BufferSource.reset()**: 再生位置をバッファの先頭にリセットします。
- **WasmModuleLoader.loadWasmModule(): Promise<void>**: WebAssemblyモジュールを非同期で読み込み、初期化します。
- **WasmModuleLoader.cleanup()**: ロードされたWebAssemblyモジュールに関連するリソースを解放します。
- **WaveformDataProcessor.initialize(sampleRate: number, fftSize: number)**: WebAssemblyモジュールを初期化し、指定されたサンプルレートとFFTサイズでオーディオデータ処理の準備を行います。
- **WaveformDataProcessor.processFrame(audioData: Float32Array)**: 1フレーム分のオーディオデータをWebAssemblyモジュールに渡し、ゼロクロス検出、周波数推定、倍音分析などの信号処理を実行し、結果を返します。
- **signal_processor_wasm.js (WASMモジュール内の関数)**:
    - **processFrame(audioData: Float32Array)**: Rustで実装された、オーディオデータに対する一連のコア信号処理（ゼロクロス検出、周波数推定、倍音解析、ゲイン調整など）を実行します。
    - **setAutoGain(enabled: boolean)**: WebAssembly内部で管理される自動ゲインロジックを有効/無効にします。
    - **setFrequencyEstimationMethod(method: string)**: WebAssembly内部で使用される周波数推定アルゴリズムを設定します。
    - **computeFrequencyData(buffer: Float32Array)**: 与えられたバッファから周波数スペクトルデータを計算します（FFTなど）。
    - **reset()**: WebAssemblyモジュールの内部状態（履歴バッファなど）をリセットします。
- **utils.dbToAmplitude(db: number): number**: デシベル値を振幅値に変換します。
- **utils.amplitudeToDb(amplitude: number): number**: 振幅値をデシベル値に変換します。
- **utils.frequencyToNote(frequency: number): { note: string, octave: number, cents: number }**: 周波数をピアノの音名、オクターブ、セント値に変換します。
- **utils.trimSilence(audioData: Float32Array, threshold: number): Float32Array**: オーディオデータの先頭と末尾の無音部分を、指定された閾値に基づいてトリミングします。

## 関数呼び出し階層ツリー
```
- initSync (dist/wasm/signal_processor_wasm.d.ts)
  - t (dist/assets/Oscilloscope-BiPi-aIi.js)
    - if (demo-simple.js)
      - getCanvasById (demo-simple.js)
      - startUpdates ()
      - stopUpdates ()
      - generateWaveform ()
      - startOscilloscope ()
      - switch ()
      - n ()
      - startFromBuffer ()
      - stop ()
      - getCurrentGain ()
      - getEstimatedFrequency ()
      - setDebugOverlaysEnabled ()
      - d ()
      - catch (demo-simple.js)
      - c (dist/assets/demo-9JbpkLFd.js)
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
      - f ()
      - getBasePath ()
      - getBasePathFromScripts ()
      - get ()
      - setDetailedTimingLogs ()
      - getDetailedTimingLogsEnabled ()
      - recordFrameTime ()
      - logDetailedTiming ()
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
      - x ()
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
      - getHarmonicAnalysisEnabled ()
      - getDebugOverlaysEnabled ()
      - setOverlaysLayout ()
      - getOverlaysLayout ()
      - setUsePeakMode ()
      - getUsePeakMode ()
      - setZeroCrossMode ()
      - getZeroCrossMode ()
      - updatePanels ()
      - getIsRunning ()
      - getSimilarityScore ()
      - isSimilaritySearchActive ()
      - setPauseDrawing ()
      - getPauseDrawing ()
      - setPhaseMarkerRangeEnabled ()
      - getPhaseMarkerRangeEnabled ()
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
      - drawZeroCrossCandidates ()
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
      - updateRendererDimensions ()
      - setFFTDisplay ()
      - setHarmonicAnalysisEnabled ()
    - i ()
    - z ()
    - D ()
    - B ()
    - O ()
    - u ()
    - constructor (undefined)
- __wbg_get_imports (dist/wasm/signal_processor_wasm.js)
- while (src/AudioManager.ts)
- handleLoad (src/WasmModuleLoader.ts)
- createAudioBuffer (src/__tests__/utils.test.ts)
- calculateWeightedScore (src/__tests__/weighted-harmonic-issue195.test.ts)
- drawVerticalLine (src/renderers/PhaseMarkerRenderer.ts)

---
Generated at: 2026-04-07 07:17:16 JST
