Last updated: 2026-02-10

# Project Overview

## プロジェクト概要
- `cat-oscilloscope`は、ブラウザ上でリアルタイムに音波形を視覚化するオシロスコープ風のアプリケーションです。
- マイク入力やオーディオファイルから音源を取得し、様々なアルゴリズムを用いて周波数や波形の特性を分析・表示します。
- 高速なデータ処理にはRust/WebAssemblyを活用し、高精度な音響解析と視覚的なフィードバックをウェブ環境で提供します。

## 技術スタック
- フロントエンド:
    - **TypeScript**: 型安全なJavaScriptで、アプリケーションのロジック、設定管理、レンダリングを担当します。
    - **HTML Canvas**: 2DグラフィックスAPIを使用して、音波形、FFTスペクトラム、各種オーバーレイなどを描画します。
    - **Web Audio API**: ブラウザでマイク入力からの音声キャプチャ、オーディオファイルの再生、およびリアルタイムな音声分析（FFTなど）を行います。
- 音楽・オーディオ:
    - **5つの周波数推定方式**: Zero-Crossing（ゼロクロス法）、Autocorrelation（自己相関法）、FFT（高速フーリエ変換）、STFT（短時間フーリエ変換）、CQT（定Q変換）をサポートし、多様な音源に対して高精度な周波数検出を可能にします。
    - **バッファサイズマルチプライヤー**: 過去のフレームバッファを拡張して使用することで、特に低周波の検出精度を向上させます。
- 開発ツール:
    - **Node.js**: JavaScript実行環境であり、npmなどのパッケージマネージャーの基盤となります。
    - **npm/yarn**: プロジェクトの依存関係管理とスクリプト実行に使用されます。
    - **Vite**: 高速な開発サーバーとビルドツールで、モダンなウェブ開発を効率化します。
    - **Rust toolchain (rustc, cargo)**: Rust言語で書かれたWebAssemblyモジュールをコンパイルするために使用されます。
    - **wasm-pack**: RustコードをWebAssemblyにビルドし、JavaScriptから利用可能な形式にパッケージングするためのツールです。
- テスト:
    - **Vitest**: 高速なユニットテストフレームワークで、各種コンポーネントやアルゴリズムの動作検証に使用されます。
    - **@vitest/ui**: Vitestのテスト結果をブラウザUIで確認できるツールです。
    - **happy-dom**: DOM操作を含むテストを高速に実行するための軽量なDOMエミュレーションライブラリです。
- ビルドツール:
    - **Vite**: フロントエンド資産のバンドルと最適化を行います。
    - **Rust toolchain (rustc, cargo)**: WebAssemblyモジュールのコンパイルを担当します。
- 言語機能:
    - **Rust/WebAssembly**: パフォーマンスが要求されるデータ処理アルゴリズム（波形検索、周波数推定など）はRustで実装され、WebAssemblyとしてブラウザで高速に実行されます。これにより、型安全で信頼性の高い処理が実現されています。
    - **TypeScript**: コードの保守性と可読性を高めるため、厳格な型付けを導入しています。
- 自動化・CI/CD:
    - **GitHub Actions**: コード品質の自動チェック（例: 大容量ファイル検出）などのワークフローを自動実行し、開発プロセスを支援します。
- 開発標準:
    - **`.github/check-large-files.toml`**: ソースコードのファイルサイズに関する品質基準を定義し、大規模なファイルが作成されることを早期に検出し、リファクタリングを促します。

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
-   **`.gitignore`**: Gitによるバージョン管理から除外するファイルやディレクトリを指定する設定ファイルです。
-   **`ARCHITECTURE.md`**: プロジェクト全体のアーキテクチャに関する設計思想や構造を説明するドキュメントです。
-   **`LIBRARY_USAGE.md`**: `cat-oscilloscope`をnpmライブラリとして他のプロジェクトで利用する方法について詳細に説明するドキュメントです。
-   **`LICENSE`**: プロジェクトがMITライセンスであることを示すライセンス情報ファイルです。
-   **`README.ja.md`**: プロジェクトの日本語版の概要、機能、使用方法などを記述した主要ドキュメントです。
-   **`README.md`**: プロジェクトの英語版の概要、機能、使用方法などを記述した主要ドキュメントです。
-   **`REFACTORING_ISSUE_251.md` / `REFACTORING_SUMMARY.md`**: 特定のリファクタリング作業（Issue #251）の詳細や、リファクタリング全体の要約を記録した内部ドキュメントです。
-   **`_config.yml`**: GitHub Pagesなどの静的サイトホスティングサービスで使用される設定ファイルです。
-   **`demo-simple.html`**: `cat-oscilloscope`ライブラリをCDN経由で利用する際の、最小限の実装例を示すHTMLデモページです。
-   **`demo-simple.js`**: `demo-simple.html`で動作するJavaScriptコードで、ライブラリの簡易利用デモのロジックを実装しています。
-   **`dist/` ディレクトリ**:
    -   本番環境向けにビルドされたアプリケーションの出力ディレクトリです。
    -   **`.d.ts` ファイル群**: TypeScriptの型定義ファイル群で、対応するTypeScriptソースコード（`src/`以下）のクラス、インターフェース、関数の型情報を提供します。これにより、JavaScriptプロジェクトからライブラリを利用する際に型安全な開発が可能です。
    -   **`dist/assets/`**: Viteによってバンドル・最適化されたJavaScriptファイル（`Oscilloscope-BiPi-aIi.js`, `demo-9JbpkLFd.js`, `main-pCt8i_lw.js`）やソースマップが格納されます。これらはブラウザで実行されるコードの本体です。
    -   **`cat-oscilloscope.cjs` / `cat-oscilloscope.mjs`**: npmライブラリとして提供されるESM（ECMAScript Modules）およびCJS（CommonJS）形式のバンドル済みJavaScriptファイルです。
    -   **`dist/comparison-renderers/`**: 波形比較パネルの各要素（オフセット、位置マーカー、類似度プロット、波形パネル）を描画するためのレンダラーの型定義ファイル群です。
    -   **`dist/renderers/`**: メインの波形表示や各種オーバーレイ（FFT、周波数プロット、ハーモニック分析、グリッド、フェーズマーカー、波形ライン）を描画するためのレンダラーの型定義ファイル群です。
    -   **`dist/wasm/`**: ビルド済みのWebAssemblyモジュールと、それをJavaScriptから利用するためのラッパーファイルが格納されます。
        -   **`signal_processor_wasm.js`**: WebAssemblyモジュールをロードし、JavaScriptとWASM間のインターフェースを提供するJavaScriptラッパーです。
        -   **`signal_processor_wasm_bg.wasm`**: Rustで実装された高速なデータ処理アルゴリズムを含むWebAssemblyバイナリファイルです。
-   **`example-library-usage.html`**: `cat-oscilloscope`をライブラリとして組み込む詳細な使用例を示すHTMLページです。
-   **`generated-docs/`**: ドキュメンテーションツールによって自動生成されたドキュメントが配置されるディレクトリです。
-   **`issue-notes/`**: 開発中に発生した個々のIssueに関する詳細な調査メモや分析、解決策などを記録したドキュメント群です。
-   **`package-lock.json`**: `package.json`に定義された依存関係の正確なバージョンとツリー構造を記録し、ビルドの再現性を保証するファイルです。
-   **`package.json`**: プロジェクトのメタデータ（名前、バージョン、説明など）、スクリプト、開発時および実行時の依存関係を定義する設定ファイルです。
-   **`public/` ディレクトリ**:
    -   ビルドプロセスによって処理されずにそのまま提供される静的ファイル（HTML、画像、WASMファイルなど）が格納されます。
    -   **`public/wasm/`**: 事前ビルド済みのWebAssemblyモジュールと関連ファイルが格納されており、アプリケーションがWASMをロードする際に利用されます。
-   **`scripts/screenshot-local.js`**: 開発環境で動作するアプリケーションのスクリーンショットを自動で取得するためのNode.jsスクリプトです。
-   **`signal-processor-wasm/` ディレクトリ**:
    -   Rust言語で実装された、シグナル処理（波形探索、周波数推定など）を行うWebAssemblyモジュールのソースコードを格納しています。
    -   **`Cargo.toml`**: Rustプロジェクトのビルド設定や依存関係を定義するファイルです。
    -   **`src/`**: Rustのソースコードのルートディレクトリです。
        -   **`bpf.rs`, `dft.rs`**: バンドパスフィルタや離散フーリエ変換などの信号処理ユーティリティを実装しています。
        -   **`frequency_estimation/`**: FFT、STFT、CQT、Zero-Crossing、Autocorrelationなどの様々な周波数推定アルゴリズムを実装するモジュール群です。
        -   **`gain_controller.rs`**: オーディオ信号のゲイン（音量）を調整するロジックのRust実装です。
        -   **`lib.rs`**: Rustクレートのエントリポイントであり、WebAssemblyとして公開される主要な関数や構造体を定義します。
        -   **`waveform_render_data.rs`**: 波形描画に必要なデータ構造をRust側で定義し、JavaScript側と共有します。
        -   **`waveform_searcher.rs`**: 波形内の特定のパターンや特徴（ピーク、周期など）を高速に探索するアルゴリズムを実装しています。
        -   **`zero_cross_detector/`**: 音波形のゼロクロスポイントを検出するアルゴリズムのRust実装です。
-   **`src/` ディレクトリ**:
    -   TypeScriptで書かれたアプリケーションの主要なソースコードを格納しています。
    -   **`AudioManager.ts`**: Web Audio APIを介してマイク入力、オーディオファイル、静的バッファからの音声データの取得と管理を行います。
    -   **`BasePathResolver.ts`**: WASMファイルなどのリソースのパスを解決し、アプリケーションが正しくロードできるようにするユーティリティです。
    -   **`BufferSource.ts`**: 静的なオーディオデータバッファを管理し、ループ再生やチャンク単位でのデータ提供機能を提供します。
    -   **`ComparisonPanelRenderer.ts`**: 現在の波形と以前の波形を比較するパネル全体の描画と更新を管理します。
    -   **`CycleSimilarityRenderer.ts`**: 波形の類似度を視覚的に表示するグラフやテキストの描画を担当します。
    -   **`DOMElementManager.ts`**: アプリケーションが必要とするHTML DOM要素を効率的に取得・管理し、UI操作との連携を簡素化します。
    -   **`DisplayUpdater.ts`**: オシロスコープ、ピアノ鍵盤、その他のUI表示要素の更新ロジックを調整するクラスです。
    -   **`FrameBufferHistory.ts`**: 過去のオーディオフレームデータを保持し、バッファサイズマルチプライヤー機能の実現に寄与します。
    -   **`FrameTimingDiagnostics.ts`**: 各フレームの処理時間などを記録し、パフォーマンスの問題特定に役立つ診断情報を提供します。
    -   **`FrequencyEstimator.ts`**: WASMモジュールと連携し、様々な周波数推定アルゴリズムの設定と結果の取得をカプセル化します。
    -   **`GainController.ts`**: 音波形の振幅を自動的に調整するオートゲイン機能や、ノイズゲート機能のロジックを管理します。
    -   **`Oscilloscope.ts`**: `cat-oscilloscope`アプリケーションのメインクラスであり、オーディオ管理、データ処理、レンダリング、UIイベント処理など、全体の統合と状態管理を行います。
    -   **`OverlayLayout.ts`**: FFTスペクトラムや倍音分析などの各種オーバーレイ表示のレイアウト計算と位置決めを行います。
    -   **`PianoKeyboardRenderer.ts`**: 検出された周波数をピアノ鍵盤上に視覚的に表示するレンダリングを管理します。
    -   **`RenderCoordinator.ts`**: メインの波形レンダラーや比較パネルレンダラー、類似度レンダラーなど、複数のレンダラーの描画順序と更新を調整します。
    -   **`UIEventHandlers.ts`**: ボタンクリック、スライダー操作、ファイル入力などのユーザーインターフェースイベントを捕捉し、アプリケーションの動作に反映させるロジックを実装します。
    -   **`WasmModuleLoader.ts`**: WebAssemblyモジュールの非同期ロード、初期化、および関連リソースのクリーンアップを担当します。
    -   **`WaveformDataProcessor.ts`**: オーディオデータの前処理、WASMモジュールへのデータ受け渡し、WASMからの結果取得、およびレンダリングに必要なデータの準備を行います。
    -   **`WaveformRenderData.ts`**: 波形表示のために必要なすべてのデータ（時間領域波形、周波数スペクトラム、ゼロクロス点など）を保持するデータ構造を定義します。
    -   **`WaveformRenderer.ts`**: メインのキャンバス上に音波形、グリッド、各種オーバーレイを描画する主要なレンダリングクラスです。
    -   **`WaveformSearcher.ts`**: 波形内の特定のパターン（例：安定した周期）を検出するロジックをカプセル化します。
    -   **`ZeroCrossDetector.ts`**: 音波形がゼロラインを横切る点（ゼロクロス）を検出するロジックをカプセル化します。
    -   **`__tests__/`**: Vitestフレームワークを使用した各種ユニットテストおよび統合テストのファイル群です。
    -   **`comparison-renderers/`**: 比較パネル内の各要素を描画するサブレンダラー（`OffsetOverlayRenderer.ts`, `PositionMarkerRenderer.ts`, `SimilarityPlotRenderer.ts`, `WaveformPanelRenderer.ts`）の実装を格納します。
    -   **`index.ts`**: `cat-oscilloscope`ライブラリのエントリポイントファイルです。
    -   **`main.ts`**: アプリケーションのメインエントリポイントであり、UIの初期化と主要なコンポーネントの連携を設定します。
    -   **`renderers/`**: メイン波形描画領域の各種オーバーレイを描画するサブレンダラー（`FFTOverlayRenderer.ts`, `FrequencyPlotRenderer.ts`, `GridRenderer.ts`, `HarmonicAnalysisRenderer.ts`, `PhaseMarkerRenderer.ts`, `WaveformLineRenderer.ts`）の実装を格納します。
    -   **`utils.ts`**: デシベルと振幅の変換、周波数からノート名への変換、無音部分のトリミングなど、アプリケーション全体で利用される汎用的なユーティリティ関数を提供します。
-   **`test-pages/`**: 特定のテストシナリオを検証するためのシンプルなHTMLページ群です。
-   **`test-segment-relative.md`**: テストセグメントに関する特定のメモや分析を記述したドキュメントです。
-   **`tsconfig.json` / `tsconfig.lib.json`**: TypeScriptコンパイラの設定ファイルで、プロジェクトのコンパイルオプション（ターゲットECMAScriptバージョン、モジュール解決方法など）を定義します。
-   **`vite.config.ts`**: Viteビルドツール（設定）ファイルで、プロジェクトのビルド、開発サーバー、プラグインなどの構成を定義します。

## 関数詳細説明
-   **`initSync` (dist/wasm/signal_processor_wasm.d.ts 他)**
    -   役割: WebAssemblyモジュールを同期的に初期化し、実行可能な状態にします。
    -   引数: 通常、WASMバイナリデータまたはそのパス。
    -   戻り値: 初期化されたWASMモジュールインスタンス。
-   **`getCanvasById` (demo-simple.js)**
    -   役割: 指定されたIDを持つHTML Canvas要素をDOMから取得します。
    -   引数: `id` (string) - 取得するCanvas要素のID。
    -   戻り値: `HTMLCanvasElement`または`null`。
-   **`startUpdates` (demo-simple.js)**
    -   役割: デモアプリケーションの描画およびデータ更新ループを開始します。
    -   引数: なし。
    -   戻り値: なし。
-   **`stopUpdates` (demo-simple.js)**
    -   役割: デモアプリケーションの描画およびデータ更新ループを停止します。
    -   引数: なし。
    -   戻り値: なし。
-   **`startOscilloscope` (demo-simple.js)**
    -   役割: デモ環境でオシロスコープのオーディオ処理と描画を開始する高レベルな関数です。
    -   引数: なし。
    -   戻り値: `Promise<void>`。
-   **`constructor` (多くのクラス)**
    -   役割: 各クラスの新しいインスタンスが作成される際に呼び出され、インスタンスの初期状態を設定します。
    -   引数: クラスによって異なる初期化パラメータ。
    -   戻り値: なし（インスタンス自体を生成します）。
-   **`start` (src/AudioManager.ts, src/Oscilloscope.ts 他)**
    -   役割: マイク入力からのオーディオ処理を開始します。
    -   引数: なし。
    -   戻り値: `Promise<void>`（非同期処理のため）。
-   **`startFromFile` (src/AudioManager.ts, src/Oscilloscope.ts)**
    -   役割: 指定されたオーディオファイルから音声データを読み込み、その処理を開始します。
    -   引数: `file` (FileまたはURLを表すstring) - 処理するオーディオファイル。
    -   戻り値: `Promise<void>`。
-   **`startFromBuffer` (src/AudioManager.ts, src/Oscilloscope.ts)**
    -   役割: 事前に用意されたオーディオデータバッファ（`BufferSource`インスタンス）から処理を開始します。
    -   引数: `bufferSource` (BufferSource) - 処理するオーディオデータ。
    -   戻り値: `Promise<void>`。
-   **`stop` (src/AudioManager.ts, src/Oscilloscope.ts 他)**
    -   役割: 進行中のオーディオ処理と描画を停止し、関連リソースを解放します。
    -   引数: なし。
    -   戻り値: なし。
-   **`getTimeDomainData` (dist/assets/Oscilloscope-BiPi-aIi.js)**
    -   役割: 現在のオーディオフレームの時間領域波形データ（波形の形状）を取得します。
    -   引数: なし。
    -   戻り値: `Float32Array` (波形データ)。
-   **`getFrequencyData` (dist/assets/Oscilloscope-BiPi-aIi.js)**
    -   役割: 現在のオーディオフレームの周波数領域データ（FFTスペクトラム）を取得します。
    -   引数: なし。
    -   戻り値: `Float32Array`または`Uint8Array` (周波数スペクトラムデータ)。
-   **`getEstimatedFrequency` (dist/assets/Oscilloscope-BiPi-aIi.js)**
    -   役割: 現在フレームで推定された基本周波数（ピッチ）を取得します。
    -   引数: なし。
    -   戻り値: `number` (周波数、Hz)。
-   **`setFrequencyEstimationMethod` (dist/assets/Oscilloscope-BiPi-aIi.js, dist/wasm/signal_processor_wasm.js)**
    -   役割: 周波数推定に使用するアルゴリズム（例: FFT, CQT, Zero-Crossingなど）を設定します。
    -   引数: `methodName` (string) - アルゴリズムの名前。
    -   戻り値: なし。
-   **`setBufferSizeMultiplier` (dist/assets/Oscilloscope-BiPi-aIi.js, dist/wasm/signal_processor_wasm.js)**
    -   役割: 低周波検出精度向上のためのバッファサイズ乗数（例: 1, 4, 16）を設定します。
    -   引数: `multiplier` (number) - バッファの拡張倍率。
    -   戻り値: なし。
-   **`setAutoGain` (dist/assets/Oscilloscope-BiPi-aIi.js, dist/wasm/signal_processor_wasm.js)**
    -   役割: 波形表示の自動ゲイン（音量自動調整）機能を有効または無効にします。
    -   引数: `enabled` (boolean) - 有効にするかどうかのフラグ。
    -   戻り値: なし。
-   **`setNoiseGate` (dist/assets/Oscilloscope-BiPi-aIi.js, dist/wasm/signal_processor_wasm.js)**
    -   役割: ノイズゲート機能を有効または無効にし、閾値以下の微弱な信号をカットします。
    -   引数: `enabled` (boolean) - 有効にするかどうかのフラグ。
    -   戻り値: なし。
-   **`drawWaveform` (dist/assets/Oscilloscope-BiPi-aIi.js, src/comparison-renderers/WaveformPanelRenderer.ts)**
    -   役割: キャンバスに時間領域の音波形を描画します。
    -   引数: `data` (Float32Array) - 波形データ、`gain` (number) - 描画ゲイン、`color` (string) - 波形の色など。
    -   戻り値: なし。
-   **`drawFFTOverlay` (dist/assets/Oscilloscope-BiPi-aIi.js)**
    -   役割: 周波数スペクトラム（FFT）を波形上にオーバーレイとして描画します。
    -   引数: なし。
    -   戻り値: なし。
-   **`drawHarmonicAnalysis` (dist/assets/Oscilloscope-BiPi-aIi.js)**
    -   役割: 音の倍音構成分析結果をオーバーレイとして描画します。
    -   引数: なし。
    -   戻り値: なし。
-   **`drawFrequencyPlot` (dist/assets/Oscilloscope-BiPi-aIi.js)**
    -   役割: 時間経過に伴う周波数変化の履歴をプロットとして描画します。
    -   引数: なし。
    -   戻り値: なし。
-   **`dbToAmplitude` (src/utils.ts)**
    -   役割: デシベル(dB)値を線形振幅値に変換します。
    -   引数: `db` (number) - デシベル値。
    -   戻り値: `number` (振幅値)。
-   **`amplitudeToDb` (src/utils.ts)**
    -   役割: 線形振幅値をデシベル(dB)値に変換します。
    -   引数: `amplitude` (number) - 振幅値。
    -   戻り値: `number` (デシベル値)。
-   **`frequencyToNote` (src/utils.ts)**
    -   役割: 周波数値から最も近い音楽のノート名とセント値を計算します。
    -   引数: `frequency` (number) - 周波数（Hz）。
    -   戻り値: `object` (ノート名、オクターブ、セント値などを含む)。
-   **`trimSilence` (src/utils.ts)**
    -   役割: オーディオデータバッファの先頭と末尾にある無音部分を検出・除去します。
    -   引数: `audioData` (Float32Array) - オーディオデータ、`threshold` (number) - 無音と判断する閾値。
    -   戻り値: `Float32Array` (トリミング後のデータ)。
-   **`loadWasmModule` (src/WasmModuleLoader.ts)**
    -   役割: WebAssemblyモジュールを非同期でロードし、初期化します。
    -   引数: `wasmPath` (string) - WASMファイルのパス。
    -   戻り値: `Promise<void>`。
-   **`processFrame` (dist/wasm/signal_processor_wasm.js)**
    -   役割: WebAssembly内部で1フレーム分のオーディオデータを処理し、必要なシグナル処理（周波数推定、ゼロクロス検出など）を実行します。
    -   引数: `audioData` (Float32Array) - 処理するオーディオデータ。
    -   戻り値: なし（内部状態を更新）。
-   **`render` (src/PianoKeyboardRenderer.ts, dist/assets/main-pCt8i_lw.js 他)**
    -   役割: 特定のキャンバスまたはUI要素に、ピアノ鍵盤やその他のグラフィックを描画します。
    -   引数: `ctx` (CanvasRenderingContext2D) - 描画コンテキスト、`frequencyData` (Array) - 描画データなど。
    -   戻り値: なし。
-   **`handleStartStopButton` (src/UIEventHandlers.ts)**
    -   役割: UIの開始/停止ボタンがクリックされた際のイベントを処理し、オシロスコープの動作を開始または停止します。
    -   引数: なし。
    -   戻り値: `Promise<void>`。
-   **`handleFileInput` (src/UIEventHandlers.ts)**
    -   役割: ファイル入力要素を通じてオーディオファイルが選択された際のイベントを処理し、ファイルをロードしてオシロスコープでの表示を開始します。
    -   引数: `event` (Event) - ファイル入力イベント。
    -   戻り値: `Promise<void>`。

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
Generated at: 2026-02-10 07:19:23 JST
