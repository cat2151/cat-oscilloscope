Last updated: 2026-02-13

# Project Overview

## プロジェクト概要
- ブラウザで動作する、オシロスコープ風のリアルタイム波形ビジュアライザーです。
- Rust/WebAssemblyによる高速な音声データ処理と、多様な周波数推定アルゴリズムを特徴とします。
- マイク入力やWAVファイルからの音声を視覚化し、npmライブラリとしても利用可能です。

## 技術スタック
- フロントエンド: HTML Canvas (2D波形レンダリング), TypeScript (設定管理とレンダリング), Web Audio API (音声のキャプチャと分析)
- 音楽・オーディオ: Web Audio API (音声のキャプチャと分析), Rust/WebAssembly (周波数推定、ゼロクロス検出などのデータ処理アルゴリズム)
- 開発ツール: Vite (高速なビルドツールと開発サーバー), Node.js/npm/yarn (開発環境、パッケージ管理), wasm-pack (RustからWASMをビルド)
- テスト: Vitest (テストフレームワーク), @vitest/ui (テストUI), happy-dom (DOMエミュレーション)
- ビルドツール: Vite (高速なビルドと開発サーバー), vite-plugin-dts (TypeScript型定義ファイルの生成)
- 言語機能: TypeScript (型安全なJavaScript), Rust (メモリ安全で高性能なシステムプログラミング言語)
- 自動化・CI/CD: GitHub Actions (コード品質チェックの自動化)
- 開発標準: ESLint (コード品質、構文チェック), Prettier (コードフォーマット)

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
- **`.gitignore`**: Gitがバージョン管理の対象外とするファイルやディレクトリを指定するファイル。
- **`ARCHITECTURE.md`**: プロジェクトのアーキテクチャに関する設計ドキュメント。
- **`LIBRARY_USAGE.md`**: このプロジェクトをライブラリとして使用する方法について記述したドキュメント。
- **`LICENSE`**: プロジェクトのライセンス情報（MITライセンス）を記載したファイル。
- **`README.ja.md`**: プロジェクトの概要、機能、使い方などを日本語で説明するメインのドキュメント。
- **`README.md`**: プロジェクトの概要、機能、使い方などを英語で説明するメインのドキュメント。
- **`REFACTORING_ISSUE_251.md`**: 特定のリファクタリング課題（Issue #251）に関する詳細を記述したドキュメント。
- **`REFACTORING_SUMMARY.md`**: リファクタリングの要約をまとめたドキュメント。
- **`_config.yml`**: GitHub Pagesなどのサイト生成ツールで使用される設定ファイル。
- **`demo-simple.html`**: ライブラリの簡易利用例を示すHTMLファイル。
- **`demo-simple.js`**: `demo-simple.html`で動作するJavaScriptコード。ライブラリの利用方法を示します。
- **`dist/` ディレクトリ**: プロジェクトのビルド成果物が格納されるディレクトリ。
    - **`*.d.ts` ファイル**: TypeScriptの型定義ファイル。対応するJavaScriptモジュールの型情報を提供します。
    - **`*.d.ts.map` ファイル**: 型定義ファイルのソースマップ。デバッグに使用されます。
    - **`*.js`, `*.mjs`, `*.cjs` ファイル**: ビルド後のJavaScriptコード。モジュールバンドルや難読化されたものが含まれます。
    - **`*.js.map` ファイル**: JavaScriptファイルのソースマップ。元のTypeScriptコードとのマッピング情報を含みます。
    - **`dist/assets/` ディレクトリ**: バンドルされたJavaScriptやその他のアセットが格納されます。
        - **`Oscilloscope-BiPi-aIi.js`**: `Oscilloscope`クラスのバンドル済みJavaScriptコード（難読化されている可能性あり）。
        - **`demo-9JbpkLFd.js`**: 簡易デモ用のバンドル済みJavaScriptコード（難読化されている可能性あり）。
        - **`main-pCt8i_lw.js`**: メインアプリケーションのバンドル済みJavaScriptコード（難読化されている可能性あり）。
    - **`dist/comparison-renderers/` ディレクトリ**: 比較パネルのレンダラー関連の型定義ファイル。
    - **`dist/renderers/` ディレクトリ**: 一般的なレンダラー関連の型定義ファイル。
    - **`dist/wasm/` ディレクトリ**: ビルド済みのWebAssemblyモジュールと関連ファイル。
        - **`signal_processor_wasm.d.ts`**: WebAssemblyモジュールのTypeScript型定義ファイル。
        - **`signal_processor_wasm.js`**: WebAssemblyモジュールをロードし、JavaScriptから利用するためのグルーコード。
        - **`signal_processor_wasm_bg.wasm`**: コンパイルされたWebAssemblyバイナリ。主要なデータ処理アルゴリズムがここに実装されています。
        - **`signal_processor_wasm_bg.wasm.d.ts`**: WebAssemblyモジュール内部の型定義。
- **`example-library-usage.html`**: ライブラリの利用例を示す別のHTMLファイル。
- **`generated-docs/` ディレクトリ**: 自動生成されたドキュメントが格納される可能性のあるディレクトリ。
- **`issue-notes/` ディレクトリ**: 開発中の様々な課題（Issue）に関するメモや調査結果をまとめたドキュメント群。
- **`package-lock.json`**: npmが管理する依存関係の正確なバージョンを記録するファイル。
- **`package.json`**: プロジェクトのメタデータ（名前、バージョン、説明など）と依存関係、スクリプトなどを定義するファイル。
- **`public/` ディレクトリ**: 公開される静的ファイルが配置されるディレクトリ。
    - **`public/wasm/` ディレクトリ**: ビルド済みのWebAssemblyモジュールと関連ファイル。`dist/wasm/` と同じ内容で、本番環境で直接利用される。
- **`scripts/` ディレクトリ**: 開発やテストに役立つスクリプト群。
    - **`screenshot-local.js`**: ローカル環境でスクリーンショットを撮影するためのPlaywrightスクリプト。
- **`signal-processor-wasm/` ディレクトリ**: Rustで記述されたWebAssemblyモジュールのソースコード。
    - **`Cargo.toml`**: Rustプロジェクトの設定ファイル。依存関係やビルド設定を記述します。
    - **`src/bpf.rs`**: バンドパスフィルター関連のRustコード。
    - **`src/candidate_selection.rs`**: 周波数推定における候補選択ロジックのRustコード。
    - **`src/dft.rs`**: 離散フーリエ変換 (DFT) 関連のRustコード。
    - **`src/frequency_estimation/` ディレクトリ**: 周波数推定アルゴリズムのRust実装。
        - **`dsp_utils.rs`**: デジタル信号処理 (DSP) のユーティリティ関数。
        - **`fft.rs`**: 高速フーリエ変換 (FFT) の実装。
        - **`harmonic_analysis.rs`**: 倍音分析のRustコード。
        - **`mod.rs`**: モジュール宣言ファイル。
        - **`non_default_methods/` ディレクトリ**: デフォルト以外の周波数推定アルゴリズム。
            - **`autocorrelation.rs`**: 自己相関法のRust実装。
            - **`cqt.rs`**: 定Q変換 (CQT) のRust実装。
            - **`stft.rs`**: 短時間フーリエ変換 (STFT) のRust実装。
            - **`zero_crossing.rs`**: ゼロクロス法のRust実装。
        - **`smoothing.rs`**: データスムージングのRustコード。
        - **`tests.rs`**: 周波数推定アルゴリズムのテストコード。
    - **`src/gain_controller.rs`**: ゲイン制御ロジックのRustコード。
    - **`src/lib.rs`**: Rustクレートのメインライブラリファイル。WebAssemblyのエントリーポイント。
    - **`src/phase_markers.rs`**: 位相マーカー関連のRustコード。
    - **`src/waveform_render_data.rs`**: 波形レンダリングデータの構造体定義。
    - **`src/waveform_searcher.rs`**: 波形探索アルゴリズムのRustコード。
    - **`src/zero_cross_detector/` ディレクトリ**: ゼロクロス検出アルゴリズムのRust実装。
        - **`default_mode.rs`**: デフォルトのゼロクロス検出モード。
        - **`mod.rs`**: モジュール宣言ファイル。
        - **`non_default_modes.rs`**: デフォルト以外のゼロクロス検出モード。
        - **`phase_zero.rs`**: 位相ゼロ点の検出ロジック。
        - **`types.rs`**: ゼロクロス検出関連の型定義。
        - **`utils.rs`**: ゼロクロス検出のユーティリティ関数。
- **`src/` ディレクトリ**: TypeScriptで記述されたフロントエンドアプリケーションのソースコード。
    - **`AudioManager.ts`**: Web Audio APIを介してオーディオ入力を管理し、データを処理するクラス。
    - **`BasePathResolver.ts`**: アプリケーションのベースパスを解決するためのユーティリティクラス。
    - **`BufferSource.ts`**: 外部の音声バッファを処理するためのクラス。
    - **`ComparisonPanelRenderer.ts`**: 波形比較パネルの描画を管理するクラス。
    - **`CycleSimilarityRenderer.ts`**: 波形類似度パネルの描画を管理するクラス。
    - **`DOMElementManager.ts`**: DOM要素の取得と管理を行うクラス。
    - **`DisplayUpdater.ts`**: 頻度表示やゲイン表示などのUI更新を管理するクラス。
    - **`FrameBufferHistory.ts`**: 過去のフレームバッファを管理し、拡張バッファ機能を提供するクラス。
    - **`FrameTimingDiagnostics.ts`**: フレーム処理のタイミング診断を記録・出力するクラス。
    - **`FrequencyEstimator.ts`**: 周波数推定に関する設定と結果を管理するクラス。
    - **`GainController.ts`**: 波形の自動ゲイン調整を制御するクラス。
    - **`Oscilloscope.ts`**: アプリケーションの中心となるオシロスコープのメインロジックを実装したクラス。
    - **`OverlayLayout.ts`**: オーバーレイ表示のレイアウトとサイズ計算を管理するクラス。
    - **`PianoKeyboardRenderer.ts`**: 検出された周波数をピアノ鍵盤上に表示するレンダラークラス。
    - **`RenderCoordinator.ts`**: 各種レンダラーを協調させて描画を調整するクラス。
    - **`UIEventHandlers.ts`**: ユーザーインターフェース（UI）からのイベントを処理するクラス。
    - **`WasmModuleLoader.ts`**: WebAssemblyモジュールをロードし、初期化を管理するクラス。
    - **`WaveformDataProcessor.ts`**: オーディオデータの前処理、WebAssemblyモジュールとの連携、結果の取得を行うクラス。
    - **`WaveformRenderData.ts`**: レンダリングに必要な波形データやメタデータを保持するデータ構造の定義。
    - **`WaveformRenderer.ts`**: メインの波形描画を担当するクラス。
    - **`WaveformSearcher.ts`**: 波形内での周期探索を管理するクラス。
    - **`ZeroCrossDetector.ts`**: ゼロクロス検出に関する設定と結果を管理するクラス。
    - **`src/__tests__/` ディレクトリ**: Vitestによる単体テストコード群。
    - **`src/comparison-renderers/` ディレクトリ**: 比較パネル内のサブレンダラーのTypeScriptソースコード。
    - **`src/index.ts`**: ライブラリのエントリーポイント。
    - **`src/main.ts`**: アプリケーションのメインエントリーポイント。
    - **`src/renderers/` ディレクトリ**: オーバーレイなどの描画を担当するサブレンダラーのTypeScriptソースコード。
    - **`src/utils.ts`**: 数学的な変換やユーティリティ関数を提供するファイル。
- **`test-pages/` ディレクトリ**: 特定のテストシナリオのためのHTMLページ。
- **`test-segment-relative.md`**: 特定のテストセグメントに関する相対情報のドキュメント。
- **`tsconfig.json`**: TypeScriptコンパイラの設定ファイル。
- **`tsconfig.lib.json`**: ライブラリビルド用のTypeScriptコンパイラ設定ファイル。
- **`vite.config.ts`**: Viteビルドツールと開発サーバーの設定ファイル。

## 関数詳細説明
※ `if`, `for`, `catch`, `switch` はJavaScriptの制御フロー構文であり、特定の機能を持つ関数ではありませんが、提供されたリストに含まれるため、その役割を記述します。難読化された関数名については、プロジェクト情報から推測される役割を記述します。

- **`initSync (dist/wasm/signal_processor_wasm.d.ts)`**:
    - 役割: WebAssemblyモジュールを同期的に初期化する関数。
    - 引数: `WebAssembly.Module` または `Uint8Array`
    - 戻り値: `void`
    - 機能: 指定されたWebAssemblyモジュールまたはバイナリデータを使用して、JavaScript環境でWASMインスタンスをセットアップします。
- **`t (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: ビルド後のコードにおける主要な関数の一つで、おそらく描画更新やフレーム処理を開始・調整する役割を持つ。
    - 引数: 不明 (難読化されているため)
    - 戻り値: 不明 (難読化されているため)
    - 機能: アプリケーションのメインループの一部として、音声処理、描画、UI更新などの一連の操作を調整します。
- **`i (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: ビルド後のコードにおける関数で、描画コンテキストや状態の初期化、または特定の描画処理の一部を担う。
    - 引数: 不明 (難読化されているため)
    - 戻り値: 不明 (難読化されているため)
    - 機能: オシロスコープのCanvas描画に必要な設定や準備を行います。
- **`z (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: ビルド後のコードにおける関数で、特定のデータ処理や状態更新を行う。
    - 引数: 不明 (難読化されているため)
    - 戻り値: 不明 (難読化されているため)
    - 機能: おそらくWebAssemblyモジュールからの結果をTypeScript側で処理したり、レンダリングデータに変換したりする役割を持ちます。
- **`N (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: ビルド後のコードにおける関数で、数値計算や変換処理を行う。
    - 引数: 不明 (難読化されているため)
    - 戻り値: 不明 (難読化されているため)
    - 機能: 周波数から音符への変換や、ゲイン計算など、数値データを扱う処理に関連する可能性があります。
- **`D (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: ビルド後のコードにおける関数で、UI要素の管理や更新に関連する。
    - 引数: 不明 (難読化されているため)
    - 戻り値: 不明 (難読化されているため)
    - 機能: HTML要素の表示/非表示の切り替え、テキスト内容の更新など、DOM操作を行います。
- **`B (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: ビルド後のコードにおける関数で、イベントハンドリングやユーザー入力の処理を行う。
    - 引数: 不明 (難読化されているため)
    - 戻り値: 不明 (難読化されているため)
    - 機能: ボタンクリックやスライダーの変更など、ユーザーの操作に応じてアプリケーションの状態を更新します。
- **`O (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: ビルド後のコードにおける関数で、オーディオデータの取得や処理を制御する。
    - 引数: 不明 (難読化されているため)
    - 戻り値: 不明 (難読化されているため)
    - 機能: マイク入力やファイルからのオーディオストリームの開始・停止、データのバッファリングなどを行います。
- **`f (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: ビルド後のコードにおける関数で、特定の描画オーバーレイや補助表示の更新を担当する。
    - 引数: 不明 (難読化されているため)
    - 戻り値: 不明 (難読化されているため)
    - 機能: FFTスペクトラムや周波数推移プロットなど、波形以外の情報をCanvasに描画します。
- **`u (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: ビルド後のコードにおける関数で、ユーティリティ的な処理や補助的な計算を行う。
    - 引数: 不明 (難読化されているため)
    - 戻り値: 不明 (難読化されているため)
    - 機能: 例えば、デシベルと振幅の変換など、汎用的に利用される処理を提供します。
- **`x (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: ビルド後のコードにおける関数で、レンダリングに関連する座標計算やデータ変換を行う。
    - 引数: 不明 (難読化されているため)
    - 戻り値: 不明 (難読化されているため)
    - 機能: Canvas上の特定の描画位置を計算したり、データ範囲をスケール変換したりします。
- **`n (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: ビルド後のコードにおける関数で、特定の状態を更新または設定する。
    - 引数: 不明 (難読化されているため)
    - 戻り値: 不明 (難読化されているため)
    - 機能: アプリケーションの設定（例: ゲイン、ノイズゲート）を変更する際に呼び出されます。
- **`function (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: ビルド後のコードにおける匿名関数または関数式。特定のコンテキストで定義され、実行される。
    - 引数: 不明 (匿名関数であるため、コンテキストによる)
    - 戻り値: 不明 (匿名関数であるため、コンテキストによる)
    - 機能: コードの特定のブロックを実行するための一時的な関数として利用されます。
- **`for (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: JavaScriptの繰り返し制御構文。配列やコレクションの要素を順に処理したり、特定の回数処理を繰り返したりします。
    - 引数: なし (構文の一部)
    - 戻り値: なし (構文の一部)
    - 機能: データバッファのイテレーション、描画ループ、履歴データの管理など、反復処理を行うために使用されます。
- **`if (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: JavaScriptの条件分岐制御構文。特定の条件が真である場合にコードブロックを実行します。
    - 引数: なし (構文の一部)
    - 戻り値: なし (構文の一部)
    - 機能: アプリケーションの状態に応じて異なる処理を実行したり、エラー条件をチェックしたりするために使用されます。
- **`constructor (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: クラスの新しいインスタンスが作成されるときに自動的に呼び出される特殊な関数。インスタンスの初期化を行います。
    - 引数: 不明 (クラスの定義による)
    - 戻り値: なし (常にインスタンス自身を返す)
    - 機能: オシロスコープ、レンダラー、データプロセッサなどの各クラスのインスタンスが生成される際に、初期設定や依存関係の注入を行います。
- **`updateHistory (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 履歴バッファを更新する関数。
    - 引数: 不明
    - 戻り値: 不明
    - 機能: `FrameBufferHistory`クラスが管理する過去のフレームデータを更新し、低周波検出のための拡張バッファを提供します。
- **`getExtendedBuffer (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 拡張されたオーディオバッファを取得する関数。
    - 引数: 不明
    - 戻り値: 不明 (拡張されたFloat32Arrayなどのオーディオデータ)
    - 機能: `FrameBufferHistory`から、現在のフレームと過去のフレームを結合した拡張バッファを取得し、低周波の分析精度を高めます。
- **`clear (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 描画Canvasをクリアしたり、特定のデータを初期化する関数。
    - 引数: 不明
    - 戻り値: 不明
    - 機能: 新しい描画フレームの前にCanvasをクリアしたり、履歴データをリセットしたりするために使用されます。
- **`initializeAnalyser (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: Web Audio APIのAnalyserNodeを初期化する関数。
    - 引数: 不明
    - 戻り値: 不明
    - 機能: オーディオストリームから時間領域データや周波数領域データを取得するためのAnalyserNodeを設定します。
- **`start (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: アプリケーションまたは特定のオーディオ処理の開始をトリガーする関数。
    - 引数: 不明
    - 戻り値: Promise<void>
    - 機能: マイク入力からのリアルタイム処理や、オーディオファイルの再生を開始します。
- **`catch (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: JavaScriptのtry...catch構文の一部。tryブロック内で発生した例外（エラー）を捕捉し、処理します。
    - 引数: 不明 (通常はErrorオブジェクト)
    - 戻り値: なし (構文の一部)
    - 機能: エラーハンドリングを行い、アプリケーションのクラッシュを防ぎ、ユーザーにエラーメッセージを表示したり、ログに記録したりします。
- **`startFromFile (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: WAVファイルなどのオーディオファイルからの再生と処理を開始する関数。
    - 引数: `File` (オーディオファイルオブジェクト)
    - 戻り値: Promise<void>
    - 機能: 指定されたオーディオファイルをデコードし、BufferSourceとして処理を開始します。
- **`startFromBuffer (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 既にロードされたオーディオバッファからの再生と処理を開始する関数。
    - 引数: `BufferSource` (オーディオバッファオブジェクト)
    - 戻り値: Promise<void>
    - 機能: `BufferSource`オブジェクトから提供されるデータを用いて、可視化を開始します。
- **`stop (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: オーディオ処理と描画を停止する関数。
    - 引数: なし
    - 戻り値: `void`
    - 機能: マイク入力やファイルの再生を停止し、関連するWeb Audio APIリソースを解放します。
- **`getTimeDomainData (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: Web Audio APIのAnalyserNodeから時間領域データを取得する関数。
    - 引数: `Float32Array` (データを格納する配列)
    - 戻り値: `void`
    - 機能: 現在のオーディオフレームの時間領域波形データを取得します。
- **`getExtendedTimeDomainData (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 拡張バッファを含む時間領域データを取得する関数。
    - 引数: `Float32Array` (データを格納する配列)
    - 戻り値: `void`
    - 機能: `getExtendedBuffer`で取得した拡張バッファに基づいて、時間領域データを返します。
- **`getFrequencyData (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: Web Audio APIのAnalyserNodeから周波数データ（FFT）を取得する関数。
    - 引数: `Uint8Array` (データを格納する配列)
    - 戻り値: `void`
    - 機能: 現在のオーディオフレームの周波数スペクトラムデータを取得します。
- **`getSampleRate (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 現在のオーディオコンテキストのサンプルレートを取得する関数。
    - 引数: なし
    - 戻り値: `number` (サンプルレート、Hz単位)
    - 機能: オーディオ処理の基盤となるサンプリング周波数を提供します。
- **`getFFTSize (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: FFTのバッファサイズを取得する関数。
    - 引数: なし
    - 戻り値: `number`
    - 機能: FFT計算に使用されるサンプル数を返します。
- **`getFrequencyBinCount (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 周波数ビン（FFTの結果配列の要素数）の数を取得する関数。
    - 引数: なし
    - 戻り値: `number`
    - 機能: `getFFTSize`の半分に等しく、FFTスペクトラムのデータの数を表します。
- **`isReady (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: アプリケーションまたはオーディオ処理が準備完了状態にあるかを確認する関数。
    - 引数: なし
    - 戻り値: `boolean`
    - 機能: 必要なリソースがロードされ、初期化が完了しているかどうかの状態を提供します。
- **`setAutoGain (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 自動ゲイン機能を有効または無効にする関数。
    - 引数: `boolean` (有効にする場合は`true`、無効にする場合は`false`)
    - 戻り値: `void`
    - 機能: 波形の振幅を自動調整する機能を制御します。
- **`getAutoGainEnabled (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 自動ゲイン機能が現在有効であるかを取得する関数。
    - 引数: なし
    - 戻り値: `boolean`
    - 機能: 自動ゲイン機能の現在の状態を返します。
- **`setNoiseGate (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: ノイズゲート機能を有効または無効にする関数。
    - 引数: `boolean` (有効にする場合は`true`、無効にする場合は`false`)
    - 戻り値: `void`
    - 機能: 閾値以下の信号をカットする機能を制御します。
- **`getNoiseGateEnabled (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: ノイズゲート機能が現在有効であるかを取得する関数。
    - 引数: なし
    - 戻り値: `boolean`
    - 機能: ノイズゲート機能の現在の状態を返します。
- **`setNoiseGateThreshold (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: ノイズゲートの閾値を設定する関数。
    - 引数: `number` (デシベル単位の閾値)
    - 戻り値: `void`
    - 機能: ノイズとみなされる信号のレベルを設定します。
- **`getNoiseGateThreshold (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 現在のノイズゲート閾値を取得する関数。
    - 引数: なし
    - 戻り値: `number` (デシベル単位の閾値)
    - 機能: ノイズゲートの現在の閾値レベルを返します。
- **`getCurrentGain (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 現在適用されているゲイン値を取得する関数。
    - 引数: なし
    - 戻り値: `number`
    - 機能: 自動ゲインまたは手動設定によって適用されている現在の増幅率を返します。
- **`clearHistory (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 履歴バッファをクリアする関数。
    - 引数: なし
    - 戻り値: `void`
    - 機能: 過去のフレームバッファをリセットし、`Buffer Size Multiplier` を変更した際などに呼び出されます。
- **`setFrequencyEstimationMethod (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 周波数推定アルゴリズムを設定する関数。
    - 引数: `string` (推定方式の名称、例: "FFT", "Autocorrelation")
    - 戻り値: `void`
    - 機能: Zero-Crossing、Autocorrelation、FFT、STFT、CQTなど、5つの方式から選択して設定します。
- **`getFrequencyEstimationMethod (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 現在設定されている周波数推定アルゴリズムを取得する関数。
    - 引数: なし
    - 戻り値: `string`
    - 機能: 現在使用中の周波数推定方式の名称を返します。
- **`setBufferSizeMultiplier (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: バッファサイズマルチプライヤーを設定する関数。
    - 引数: `number` (1, 4, 16のいずれか)
    - 戻り値: `void`
    - 機能: 低周波の検出精度を向上させるため、過去のフレームバッファを利用した拡張バッファの倍率を設定します。
- **`getBufferSizeMultiplier (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 現在設定されているバッファサイズマルチプライヤーを取得する関数。
    - 引数: なし
    - 戻り値: `number`
    - 機能: 現在使用中のバッファサイズ拡張倍率を返します。
- **`getEstimatedFrequency (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 推定された現在の周波数を取得する関数。
    - 引数: なし
    - 戻り値: `number` (周波数、Hz単位)
    - 機能: 現在のオーディオ入力から計算された基本周波数を返します。
- **`getMinFrequency (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 検出可能な最低周波数を取得する関数。
    - 引数: なし
    - 戻り値: `number` (Hz単位)
    - 機能: 現在のバッファサイズ設定に基づいて、検出可能な最低周波数を示します。
- **`getMaxFrequency (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 検出可能な最高周波数を取得する関数。
    - 引数: なし
    - 戻り値: `number` (Hz単位)
    - 機能: 現在の設定で検出可能な最高周波数を示します。
- **`getFrequencyPlotHistory (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 周波数推移プロット用の履歴データを取得する関数。
    - 引数: なし
    - 戻り値: `Array<number>`
    - 機能: 過去の周波数推定結果の履歴を返します。
- **`updateDimensions (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 描画コンポーネントの寸法を更新する関数。
    - 引数: `number` (幅), `number` (高さ)
    - 戻り値: `void`
    - 機能: Canvasサイズやウィンドウサイズが変更された際に、レンダリングの計算に必要な寸法を再設定します。
- **`calculateOverlayDimensions (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: オーバーレイ表示の描画寸法を計算する関数。
    - 引数: 不明
    - 戻り値: 不明 (オーバーレイの幅、高さ、位置など)
    - 機能: FFTスペクトラムや倍音分析などのオーバーレイがメイン波形に重ならないように、適切な描画領域を計算します。
- **`drawGrid (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: Canvasにグリッド線を描画する関数。
    - 引数: 不明
    - 戻り値: `void`
    - 機能: 波形が見やすいように、Canvas上に水平・垂直のグリッド線を描きます。
- **`drawGridLabels (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: グリッド線に対応するラベル（時間軸、振幅軸など）を描画する関数。
    - 引数: 不明
    - 戻り値: `void`
    - 機能: グリッド線に沿って、数値や単位などの目盛りを描画し、波形データの読み取りを助けます。
- **`drawWaveform (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: オーディオ波形データをCanvasに描画する関数。
    - 引数: 不明 (波形データ、ゲイン、オフセットなど)
    - 戻り値: `void`
    - 機能: 時間領域のオーディオデータを視覚的な波形としてCanvasにレンダリングします。
- **`drawFFTOverlay (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: FFTスペクトラムをオーバーレイとして描画する関数。
    - 引数: 不明 (FFTデータ、描画領域など)
    - 戻り値: `void`
    - 機能: 周波数領域のデータ（FFT）をグラフとして波形の上に重ねて表示します。
- **`drawHarmonicAnalysis (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 倍音分析の結果をオーバーレイとして描画する関数。
    - 引数: 不明 (倍音データ、基本周波数など)
    - 戻り値: `void`
    - 機能: 検出された基本周波数とその倍音を視覚的に表示します。
- **`drawFrequencyPlot (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 過去の周波数推移をプロットするオーバーレイを描画する関数。
    - 引数: 不明 (周波数履歴データ、描画領域など)
    - 戻り値: `void`
    - 機能: 時間経過に伴う周波数の変化をグラフとして表示します。
- **`setDebugOverlaysEnabled (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: デバッグ用オーバーレイ表示を有効または無効にする関数。
    - 引数: `boolean` (有効にする場合は`true`、無効にする場合は`false`)
    - 戻り値: `void`
    - 機能: FFTスペクトラム、倍音分析、周波数推移プロットなどのデバッグ用情報を表示するかどうかを制御します。
- **`drawPhaseMarkers (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 波形の位相マーカーを描画する関数。
    - 引数: 不明 (マーカーの位置、描画コンテキストなど)
    - 戻り値: `void`
    - 機能: ゼロクロスポイントや特定の位相点を示す線や記号を波形上に描画します。
- **`clearAndDrawGrid (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: Canvasをクリアし、グリッドを再描画する関数。
    - 引数: 不明
    - 戻り値: `void`
    - 機能: 新しいフレームを描画する前に、Canvasを初期化して基本的な背景グリッドを再描画します。
- **`updateRendererDimensions (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 全てのレンダラーの描画寸法を更新する関数。
    - 引数: 不明 (新しい幅、高さなど)
    - 戻り値: `void`
    - 機能: ウィンドウのリサイズやレイアウト変更に応じて、各レンダラーが適切なサイズで描画できるよう設定を更新します。
- **`setFFTDisplay (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: FFTスペクトラム表示を有効または無効にする関数。
    - 引数: `boolean` (有効にする場合は`true`、無効にする場合は`false`)
    - 戻り値: `void`
    - 機能: FFTスペクトラムオーバーレイの表示を切り替えます。
- **`getFFTDisplayEnabled (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: FFTスペクトラム表示が現在有効であるかを取得する関数。
    - 引数: なし
    - 戻り値: `boolean`
    - 機能: FFTスペクトラムオーバーレイの現在の表示状態を返します。
- **`setHarmonicAnalysisEnabled (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 倍音分析表示を有効または無効にする関数。
    - 引数: `boolean` (有効にする場合は`true`、無効にする場合は`false`)
    - 戻り値: `void`
    - 機能: 倍音分析オーバーレイの表示を切り替えます。
- **`getHarmonicAnalysisEnabled (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 倍音分析表示が現在有効であるかを取得する関数。
    - 引数: なし
    - 戻り値: `boolean`
    - 機能: 倍音分析オーバーレイの現在の表示状態を返します。
- **`getDebugOverlaysEnabled (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: デバッグ用オーバーレイ表示が現在有効であるかを取得する関数。
    - 引数: なし
    - 戻り値: `boolean`
    - 機能: すべてのデバッグオーバーレイの現在の表示状態を返します。
- **`setOverlaysLayout (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: オーバーレイのレイアウトを設定する関数。
    - 引数: `OverlayLayout` (レイアウト設定オブジェクト)
    - 戻り値: `void`
    - 機能: オーバーレイの表示位置やサイズなどのレイアウトをカスタマイズします。
- **`getOverlaysLayout (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 現在設定されているオーバーレイのレイアウトを取得する関数。
    - 引数: なし
    - 戻り値: `OverlayLayout`
    - 機能: 現在使用中のオーバーレイレイアウト設定を返します。
- **`setUsePeakMode (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: ピーク検出モードを有効または無効にする関数。
    - 引数: `boolean`
    - 戻り値: `void`
    - 機能: 波形検出におけるピーク強調モードを切り替えます。
- **`getUsePeakMode (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: ピーク検出モードが現在有効であるかを取得する関数。
    - 引数: なし
    - 戻り値: `boolean`
    - 機能: ピーク強調モードの現在の状態を返します。
- **`setZeroCrossMode (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: ゼロクロス検出モードを設定する関数。
    - 引数: `string` (ゼロクロスモードの名称)
    - 戻り値: `void`
    - 機能: ゼロクロス検出のアルゴリズムや振る舞いを変更します。
- **`getZeroCrossMode (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 現在設定されているゼロクロス検出モードを取得する関数。
    - 引数: なし
    - 戻り値: `string`
    - 機能: ゼロクロス検出モードの現在の設定を返します。
- **`reset (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: アプリケーションの状態やデータをリセットする関数。
    - 引数: なし
    - 戻り値: `void`
    - 機能: 全てのオーディオ処理、描画状態、履歴データを初期状態に戻します。
- **`getLastSimilarity (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 前回の波形との類似度スコアを取得する関数。
    - 引数: なし
    - 戻り値: `number` (類似度スコア)
    - 機能: 現在の波形と前回の波形の比較結果から得られた類似度を返します。
- **`hasPreviousWaveform (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 比較可能な前回の波形データが存在するかを確認する関数。
    - 引数: なし
    - 戻り値: `boolean`
    - 機能: 波形比較パネルが表示可能であるかどうかの状態を提供します。
- **`getPreviousWaveform (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 前回の波形データを取得する関数。
    - 引数: なし
    - 戻り値: `Float32Array` (波形データ)
    - 機能: 波形比較パネルで表示するために、前回の波形データを返します。
- **`findPeakAmplitude (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 波形データ内の最大振幅（ピーク）を検出する関数。
    - 引数: 不明 (波形データ)
    - 戻り値: `number` (ピーク振幅)
    - 機能: オートゲイン機能や描画スケールの決定のために、波形の最大値を特定します。
- **`drawCenterLine (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: Canvasの中心線を描画する関数。
    - 引数: 不明
    - 戻り値: `void`
    - 機能: 波形のゼロレベルを示す水平線をCanvasの中心に描きます。
- **`drawZeroCrossCandidates (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: ゼロクロス検出の候補点を示すマーカーを描画する関数。
    - 引数: 不明 (候補点の配列)
    - 戻り値: `void`
    - 機能: ゼロクロス検出アルゴリズムが特定した波形のゼロ交差候補を視覚的に表示します。
- **`clearCanvas (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 指定されたCanvasを完全にクリアする関数。
    - 引数: `CanvasRenderingContext2D`
    - 戻り値: `void`
    - 機能: 新しい描画フレームの前にCanvasの全内容を消去します。
- **`drawSimilarityPlot (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 波形類似度プロットを描画する関数。
    - 引数: 不明 (類似度履歴データ)
    - 戻り値: `void`
    - 機能: 過去の波形類似度スコアの推移をグラフとして表示します。
- **`drawSimilarityText (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 波形類似度スコアをテキストとして表示する関数。
    - 引数: 不明 (類似度スコア)
    - 戻り値: `void`
    - 機能: 数値で表示される現在の波形類似度をCanvas上にテキストで描画します。
- **`drawPositionMarkers (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 現在の波形と前回の波形の位置マーカーを描画する関数。
    - 引数: 不明
    - 戻り値: `void`
    - 機能: 波形比較パネルにおいて、波形の開始・終了点を示すマーカーを描画します。
- **`drawOffsetOverlayGraphs (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: オフセットオーバーレイグラフを描画する関数。
    - 引数: 不明
    - 戻り値: `void`
    - 機能: 波形の位相オフセットの推移を示すグラフをCanvasに描画します。
- **`clearAllCanvases (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: アプリケーション内の全てのCanvasをクリアする関数。
    - 引数: なし
    - 戻り値: `void`
    - 機能: 複数のCanvas要素が存在する場合に、それらすべてを同時に初期状態にリセットします。
- **`updatePanels (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 比較パネルやその他のUIパネルの表示内容を更新する関数。
    - 引数: 不明
    - 戻り値: `void`
    - 機能: 現在の波形データや類似度スコアに基づいて、UIパネルの情報を最新の状態に更新します。
- **`drawSimilarityGraph (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 波形類似度グラフを描画する関数。
    - 引数: 不明
    - 戻り値: `void`
    - 機能: 波形間の類似度を時間軸でプロットしたグラフを表示します。
- **`updateGraphs (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 複数のグラフ表示を同時に更新する関数。
    - 引数: 不明
    - 戻り値: `void`
    - 機能: 周波数プロット、類似度プロットなど、複数の動的グラフを最新のデータで更新します。
- **`getBasePath (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: アプリケーションのベースパスを取得する関数。
    - 引数: なし
    - 戻り値: `string` (ベースパスのURL)
    - 機能: スクリプトやWASMファイルのロードに使用される、アプリケーションのルートURLを決定します。
- **`getBasePathFromScripts (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 現在実行中のスクリプトのパスからベースパスを推測する関数。
    - 引数: なし
    - 戻り値: `string` (推測されたベースパスのURL)
    - 機能: ドキュメント内に埋め込まれたスクリプトタグの`src`属性を解析し、相対パスの解決に役立てます。
- **`loadWasmModule (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: WebAssemblyモジュールを非同期にロードする関数。
    - 引数: `string` (WASMファイルのパス)
    - 戻り値: Promise<void>
    - 機能: 指定されたパスからWebAssemblyバイナリをダウンロードし、WASMランタイムにロードして初期化します。
- **`getProcessor (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: WebAssemblyベースのデータプロセッサインスタンスを取得する関数。
    - 引数: なし
    - 戻り値: `SignalProcessorWasm` (WASMモジュールが提供するプロセッサオブジェクト)
    - 機能: WASMモジュールが提供する音声データ処理ロジックにアクセスするためのインターフェースを返します。
- **`initialize (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: アプリケーションの主要なコンポーネントを初期化する関数。
    - 引数: 不明
    - 戻り値: Promise<void>
    - 機能: Web Audio APIの初期化、WASMモジュールのロード、レンダラーのセットアップなど、アプリケーション起動に必要な一連の処理を実行します。
- **`syncConfigToWasm (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: TypeScript側の設定をWebAssemblyモジュールに同期する関数。
    - 引数: 不明
    - 戻り値: `void`
    - 機能: ゲイン設定、周波数推定方式、バッファサイズなどのUIからの設定値をWASMプロセッサに伝達します。
- **`syncResultsFromWasm (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: WebAssemblyモジュールからの処理結果をTypeScript側に同期する関数。
    - 引数: 不明
    - 戻り値: `void`
    - 機能: WASMプロセッサで計算された周波数、ゲイン、波形データなどの結果をTypeScript側のレンダリングやUI表示のために取得します。
- **`processFrame (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 一つのオーディオフレームを処理する関数。
    - 引数: `Float32Array` (時間領域データ)
    - 戻り値: `WaveformRenderData` (レンダリング用データ)
    - 機能: 入力されたオーディオフレームに対して、周波数推定、ゼロクロス検出、ゲイン調整などのすべてのデータ処理を実行します。
- **`setDetailedTimingLogs (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 詳細なタイミングログ機能を有効または無効にする関数。
    - 引数: `boolean`
    - 戻り値: `void`
    - 機能: 各フレーム処理にかかる時間を詳細に記録・出力するかどうかを制御し、パフォーマンス分析に役立てます。
- **`clampPhaseMarkers (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 位相マーカーの位置を制約範囲内に調整する関数。
    - 引数: 不明
    - 戻り値: `void`
    - 機能: 描画される位相マーカーが、波形の特定の範囲（例: 4周期座標系）に収まるように位置を調整します。
- **`updatePhaseOffsetHistory (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 位相オフセットの履歴を更新する関数。
    - 引数: `number` (現在の位相オフセット)
    - 戻り値: `void`
    - 機能: オフセットオーバーレイグラフで表示するための位相オフセットの過去のデータを記録します。
- **`getDetailedTimingLogsEnabled (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 詳細なタイミングログ機能が有効であるかを取得する関数。
    - 引数: なし
    - 戻り値: `boolean`
    - 機能: 詳細タイミングログの現在の有効状態を返します。
- **`recordFrameTime (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 現在のフレームの処理時間を記録する関数。
    - 引数: `string` (記録するイベントの名称)
    - 戻り値: `void`
    - 機能: `FrameTimingDiagnostics`によって、特定の処理ステップの開始時刻や終了時刻を記録します。
- **`logDetailedTiming (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 記録された詳細なタイミングログをコンソールに出力する関数。
    - 引数: なし
    - 戻り値: `void`
    - 機能: 記録された各処理ステップの経過時間やパフォーマンスデータを開発者コンソールに表示します。
- **`renderFrame (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: オシロスコープの単一フレームを描画する関数。
    - 引数: 不明 (レンダリングデータ)
    - 戻り値: `void`
    - 機能: 音声データプロセッサからの結果を受け取り、Canvasに波形やオーバーレイを描画します。
- **`render (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 描画ループを起動し、継続的にフレームをレンダリングする関数。
    - 引数: 不明
    - 戻り値: `void`
    - 機能: `requestAnimationFrame` を利用して、ブラウザのリフレッシュレートに同期して描画を更新し続けます。
- **`getIsRunning (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: オシロスコープが現在動作中（オーディオ処理と描画が実行中）であるかを取得する関数。
    - 引数: なし
    - 戻り値: `boolean`
    - 機能: アプリケーションの実行状態（開始中/停止中）を返します。
- **`getSimilarityScore (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 現在の波形類似度スコアを取得する関数。
    - 引数: なし
    - 戻り値: `number`
    - 機能: `WaveformDataProcessor` から取得された最新の波形類似度スコアを返します。
- **`isSimilaritySearchActive (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 波形類似度検索が現在アクティブであるかを確認する関数。
    - 引数: なし
    - 戻り値: `boolean`
    - 機能: 波形比較パネルが表示され、類似度検索が実行されているかどうかの状態を返します。
- **`setPauseDrawing (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 描画の一時停止機能を有効または無効にする関数。
    - 引数: `boolean`
    - 戻り値: `void`
    - 機能: 波形を静止させて観察できるように、Canvasへの描画を一時的に停止します。
- **`getPauseDrawing (dist/assets/Oscilloscope-BiPi-aIi.ts)`**:
    - 役割: 描画の一時停止機能が現在有効であるかを取得する関数。
    - 引数: なし
    - 戻り値: `boolean`
    - 機能: 描画の一時停止モードの現在の状態を返します。
- **`setPhaseMarkerRangeEnabled (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 位相マーカーの範囲表示を有効または無効にする関数。
    - 引数: `boolean`
    - 戻り値: `void`
    - 機能: 位相マーカーによって示される特定の範囲を可視化するかどうかを制御します。
- **`getPhaseMarkerRangeEnabled (dist/assets/Oscilloscope-BiPi-aIi.js)`**:
    - 役割: 位相マーカーの範囲表示が現在有効であるかを取得する関数。
    - 引数: なし
    - 戻り値: `boolean`
    - 機能: 位相マーカー範囲表示の現在の状態を返します。
- **`dbToAmplitude (dist/utils.d.ts)`**:
    - 役割: デシベル値を振幅値に変換する関数。
    - 引数: `number` (デシベル値)
    - 戻り値: `number` (振幅値)
    - 機能: 音量レベルの表現形式を変換します。
- **`createSilentMockAudioContext (src/__tests__/oscilloscope.test.ts)`**:
    - 役割: テストのためにサイレントなモックAudioContextを作成する関数。
    - 引数: なし
    - 戻り値: `AudioContext` (モックされたAudioContext)
    - 機能: 実際のWeb Audio APIを使用せずに、テスト環境でAudioContextの振る舞いをシミュレートします。
- **`getFFTOverlayDimensions (src/__tests__/oscilloscope.test.ts)`**:
    - 役割: FFTオーバーレイの描画寸法を取得するテスト用ヘルパー関数。
    - 引数: なし
    - 戻り値: `object` (幅、高さ、位置などを含むオブジェクト)
    - 機能: テストにおいてFFTオーバーレイが適切に配置されているかを検証するために使用されます。
- **`findFFTOverlayBorderCall (src/__tests__/oscilloscope.test.ts)`**:
    - 役割: FFTオーバーレイの境界線描画呼び出しをテストから見つける関数。
    - 引数: `Mock` (モックオブジェクト)
    - 戻り値: `object` (描画呼び出しの引数)
    - 機能: テストにおいてCanvasの描画コンテキストがどのようにFFTオーバーレイの境界線を描画しているかを検査します。
- **`getAudioTracks (src/__tests__/oscilloscope.test.ts)`**:
    - 役割: メディアストリームからオーディオトラックを取得するテスト用関数。
    - 引数: なし
    - 戻り値: `Array<MediaStreamTrack>`
    - 機能: テスト環境でMediaStreamのオーディオ部分をシミュレートし、テスト対象のコンポーネントが正しくトラックを処理できるかを検証します。
- **`getVideoTracks (src/__tests__/oscilloscope.test.ts)`**:
    - 役割: メディアストリームからビデオトラックを取得するテスト用関数。
    - 引数: なし
    - 戻り値: `Array<MediaStreamTrack>`
    - 機能: テスト環境でMediaStreamのビデオ部分をシミュレートし、オーディオ処理とは関係ないビデオトラックが適切に無視されるかを検証します。
- **`fn (src/__tests__/oscilloscope.test.ts)`**:
    - 役割: Vitestのモック関数。テスト中に特定の関数呼び出しを監視したり、振る舞いを制御したりするために使用されます。
    - 引数: 不明 (モックされる関数の定義による)
    - 戻り値: 不明 (モックされる関数の定義による)
    - 機能: 依存関係を持つコンポーネントのテストにおいて、その依存関係を分離し、テスト対象の振る舞いを予測可能にします。
- **`function (dist/assets/demo-9JbpkLFd.js)`**:
    - 役割: ビルド後の簡易デモコードにおける匿名関数または関数式。
    - 引数: 不明
    - 戻り値: 不明
    - 機能: 簡易デモのオーディオバッファ処理やGUIインタラクションの一部を実装します。
- **`createMockAudioContext (src/__tests__/startFromBuffer.test.ts)`**:
    - 役割: `startFromBuffer`機能のテスト用にモックのAudioContextを作成する関数。
    - 引数: なし
    - 戻り値: `AudioContext` (モックされたAudioContext)
    - 機能: 実際のWeb Audio APIを使用せず、静的バッファからの処理をテストするための環境を提供します。
- **`drawOffsetOverlayGraphs (src/comparison-renderers/OffsetOverlayRenderer.ts)`**:
    - 役割: オフセットオーバーレイのグラフを描画する関数。
    - 引数: `CanvasRenderingContext2D`, `WaveformRenderData`, `boolean` (診断フラグ)
    - 戻り値: `void`
    - 機能: 位相オフセットの履歴や現在のオフセット値をグラフ形式でCanvasに表示します。
- **`drawOffsetLine (src/comparison-renderers/OffsetOverlayRenderer.ts)`**:
    - 役割: オフセットオーバーレイグラフ内の個別のオフセットライン（start/end offset）を描画する関数。
    - 引数: `CanvasRenderingContext2D`, `number` (オフセット値), `string` (色), `string` (ラベル)
    - 戻り値: `void`
    - 機能: 指定されたオフセット値に基づいて、グラフ上に線を描画し、ラベルを付与します。
- **`drawPositionMarkers (src/comparison-renderers/PositionMarkerRenderer.ts)`**:
    - 役割: 波形パネル上の開始/終了位置マーカーを描画する関数。
    - 引数: `CanvasRenderingContext2D`, `number` (幅), `number` (高さ), `WaveformRenderData`
    - 戻り値: `void`
    - 機能: 現在の波形と前回の波形の比較において、それぞれの波形がどこからどこまで表示されているかを示す垂直線を描きます。
- **`drawPhaseMarkers (src/renderers/PhaseMarkerRenderer.ts)`**:
    - 役割: メイン波形上に位相マーカーを描画する関数。
    - 引数: `CanvasRenderingContext2D`, `WaveformRenderData`, `boolean` (範囲表示フラグ), `boolean` (詳細ログフラグ)
    - 戻り値: `void`
    - 機能: ゼロクロスポイント、位相0、2πなどの重要な位相位置を示す垂直線や範囲をCanvasに表示します。
- **`drawLine (src/comparison-renderers/PositionMarkerRenderer.ts)`**:
    - 役割: 位置マーカーとして垂直線を描画するヘルパー関数。
    - 引数: `CanvasRenderingContext2D`, `number` (x座標), `number` (y1), `number` (y2), `string` (色)
    - 戻り値: `void`
    - 機能: 指定された座標と色でCanvas上に垂直線を描画します。
- **`drawSimilarityPlot (src/comparison-renderers/SimilarityPlotRenderer.ts)`**:
    - 役割: 類似度プロットをCanvasに描画する関数。
    - 引数: `CanvasRenderingContext2D`, `Array<number>` (類似度履歴), `number` (幅), `number` (高さ)
    - 戻り値: `void`
    - 機能: `WaveformDataProcessor` から得られた波形類似度の履歴を折れ線グラフとして表示します。
- **`drawSimilarityText (src/comparison-renderers/SimilarityPlotRenderer.ts)`**:
    - 役割: 類似度スコアのテキスト表示をCanvasに描画する関数。
    - 引数: `CanvasRenderingContext2D`, `number` (類似度), `number` (x座標), `number` (y座標)
    - 戻り値: `void`
    - 機能: 現在の波形類似度をCanvas上の指定位置にテキストとして表示します。
- **`drawWaveform (src/comparison-renderers/WaveformPanelRenderer.ts)`**:
    - 役割: 波形パネル内に波形データを描画する関数。
    - 引数: `CanvasRenderingContext2D`, `Float32Array` (波形データ), `number` (幅), `number` (高さ), `string` (色), `number` (ゲイン)
    - 戻り値: `void`
    - 機能: 現在の波形や前回の波形を、それぞれのパネルのCanvasに描画します。
- **`findPeakAmplitude (src/comparison-renderers/WaveformPanelRenderer.ts)`**:
    - 役割: 与えられた波形データ内の最大振幅を検索する関数。
    - 引数: `Float32Array` (波形データ)
    - 戻り値: `number` (最大振幅)
    - 機能: パネル内の波形のスケーリングのために、波形のピーク値を特定します。
- **`drawCenterLine (src/comparison-renderers/WaveformPanelRenderer.ts)`**:
    - 役割: 波形パネルの中心線を描画する関数。
    - 引数: `CanvasRenderingContext2D`, `number` (幅), `number` (高さ)
    - 戻り値: `void`
    - 機能: パネル内で波形のゼロレベルを示す水平線を描きます。
- **`drawZeroCrossCandidates (src/comparison-renderers/WaveformPanelRenderer.ts)`**:
    - 役割: 波形パネル内にゼロクロス候補点を描画する関数。
    - 引数: `CanvasRenderingContext2D`, `Array<number>` (ゼロクロス候補), `number` (高さ), `string` (色)
    - 戻り値: `void`
    - 機能: ゼロクロス検出によって特定された候補点を視覚的にマークします。
- **`clearCanvas (src/comparison-renderers/WaveformPanelRenderer.ts)`**:
    - 役割: 指定されたコンテキストのCanvasをクリアする関数。
    - 引数: `CanvasRenderingContext2D`
    - 戻り値: `void`
    - 機能: 新しい描画を行う前に、パネルのCanvasを消去します。
- **`calculateOverlayDimensions (src/renderers/BaseOverlayRenderer.ts)`**:
    - 役割: ベースオーバーレイレンダラーの描画寸法を計算する関数。
    - 引数: `number` (メイン幅), `number` (メイン高さ), `OverlayLayout`
    - 戻り値: `object` (x, y, width, height)
    - 機能: メインCanvasのサイズとレイアウト設定に基づいて、オーバーレイの描画位置とサイズを決定します。
- **`drawFFTOverlay (src/renderers/FFTOverlayRenderer.ts)`**:
    - 役割: FFTスペクトラムをCanvasに描画する関数。
    - 引数: `CanvasRenderingContext2D`, `WaveformRenderData`
    - 戻り値: `void`
    - 機能: WebAssemblyモジュールから取得した周波数スペクトラムデータを棒グラフや線グラフとして描画します。
- **`drawFrequencyPlot (src/renderers/FrequencyPlotRenderer.ts)`**:
    - 役割: 周波数推移の履歴プロットをCanvasに描画する関数。
    - 引数: `CanvasRenderingContext2D`, `WaveformRenderData`
    - 戻り値: `void`
    - 機能: 時間経過とともに検出された周波数の変化を折れ線グラフで表示し、安定性や変化を視覚化します。
- **`frequencyToNote (src/utils.ts)`**:
    - 役割: 周波数を最も近い音符とそのセント値に変換する関数。
    - 引数: `number` (周波数), `number` (基準A4周波数, デフォルト440Hz)
    - 戻り値: `NoteInfo` (音符名、オクターブ、セント値などを含むオブジェクト)
    - 機能: 検出された周波数を音楽的な表現に変換し、ピアノ鍵盤表示などで利用されます。
- **`drawHarmonicAnalysis (src/renderers/HarmonicAnalysisRenderer.ts)`**:
    - 役割: 倍音分析の結果をCanvasに描画する関数。
    - 引数: `CanvasRenderingContext2D`, `WaveformRenderData`
    - 戻り値: `void`
    - 機能: 検出された基本周波数とその整数倍の周波数における信号強度を視覚的に表示し、音の倍音構造を示します。
- **`amplitudeToDb (src/utils.ts)`**:
    - 役割: 振幅値をデシベル値に変換する関数。
    - 引数: `number` (振幅値)
    - 戻り値: `number` (デシベル値)
    - 機能: 信号強度を対数スケールで表現し、ノイズゲートの設定などに利用されます。
- **`getCanvasById (demo-simple.js)`**:
    - 役割: IDからCanvas要素を取得するヘルパー関数。
    - 引数: `string` (CanvasのID)
    - 戻り値: `HTMLCanvasElement`
    - 機能: 指定されたIDを持つHTMLCanvasElementをDOMから取得します。
- **`startUpdates (demo-simple.js)`**:
    - 役割: デモの更新ループを開始する関数。
    - 引数: `Oscilloscope` (オシロスコープインスタンス), `DisplayUpdater`
    - 戻り値: `void`
    - 機能: オシロスコープとディスプレイの更新を継続的に実行するための`requestAnimationFrame`ループを開始します。
- **`stopUpdates (demo-simple.js)`**:
    - 役割: デモの更新ループを停止する関数。
    - 引数: なし
    - 戻り値: `void`
    - 機能: `requestAnimationFrame`ループを停止し、デモの自動更新を停止します。
- **`generateWaveform (demo-simple.js)`**:
    - 役割: テスト用のシンプルな波形データを生成する関数。
    - 引数: `string` (波形タイプ, 例: "sine", "square"), `number` (周波数), `number` (サンプルレート), `number` (期間)
    - 戻り値: `Float32Array` (生成された波形データ)
    - 機能: さまざまなタイプの音波をプログラム的に生成し、BufferSourceとして使用できるようにします。
- **`startOscilloscope (demo-simple.js)`**:
    - 役割: デモにおけるオシロスコープの動作を開始する高レベル関数。
    - 引数: `Oscilloscope` (オシロスコープインスタンス), `string` (ソースタイプ, 例: "mic", "file", "buffer")
    - 戻り値: Promise<void>
    - 機能: 選択されたオーディオソース（マイク、ファイル、静的バッファ）に応じてオシロスコープを初期化し、開始します。
- **`switch (demo-simple.js)`**:
    - 役割: JavaScriptの多分岐条件制御構文。
    - 引数: なし (構文の一部)
    - 戻り値: なし (構文の一部)
    - 機能: 複数の可能なケースに基づいて異なるコードブロックを実行するために使用されます。
- **`for (demo-simple.js)`**:
    - 役割: JavaScriptの繰り返し制御構文。
    - 引数: なし (構文の一部)
    - 戻り値: なし (構文の一部)
    - 機能: 波形データの生成や配列の処理など、反復的なタスクを実行するために使用されます。
- **`catch (demo-simple.js)`**:
    - 役割: JavaScriptのtry...catch構文の一部。
    - 引数: `Error` (エラーオブジェクト)
    - 戻り値: なし (構文の一部)
    - 機能: デモの起動中や操作中に発生したエラーを捕捉し、ユーザーに通知したり、ログに記録したりします。
- **`c (dist/assets/demo-9JbpkLFd.js)`**:
    - 役割: ビルド後の簡易デモコードにおける関数。おそらくバッファソースからのオーディオデータ取得に関連する。
    - 引数: 不明
    - 戻り値: 不明
    - 機能: `BufferSource`オブジェクトのチャンクデータ処理や状態管理の一部を実装します。
- **`I (dist/assets/demo-9JbpkLFd.js)`**:
    - 役割: ビルド後の簡易デモコードにおける関数。おそらくオーディオバッファの初期化やリセットに関連する。
    - 引数: 不明
    - 戻り値: 不明
    - 機能: `BufferSource`の内部状態をリセットしたり、新しいオーディオバッファで初期化したりします。
- **`x (dist/assets/demo-9JbpkLFd.js)`**:
    - 役割: ビルド後の簡易デモコードにおける関数。おそらくオーディオデータのシーク機能に関連する。
    - 引数: 不明
    - 戻り値: 不明
    - 機能: `BufferSource`内の現在の再生位置を変更する機能を提供します。
- **`M (dist/assets/demo-9JbpkLFd.js)`**:
    - 役割: ビルド後の簡易デモコードにおける関数。おそらくオーディオバッファの長さやプロパティの取得に関連する。
    - 引数: 不明
    - 戻り値: 不明
    - 機能: `BufferSource`の総データ長やサンプルレートなどのメタ情報を返します。
- **`d (dist/assets/demo-9JbpkLFd.js)`**:
    - 役割: ビルド後の簡易デモコードにおける関数。おそらくオーディオチャンクサイズの管理に関連する。
    - 引数: 不明
    - 戻り値: 不明
    - 機能: `BufferSource`が一度に提供するオーディオデータの量を設定または取得します。
- **`constructor (dist/assets/demo-9JbpkLFd.js)`**:
    - 役割: ビルド後の簡易デモコードにおけるクラスのコンストラクタ。
    - 引数: 不明
    - 戻り値: なし
    - 機能: `BufferSource`クラスのインスタンスが生成される際の初期化を行います。
- **`fromAudioBuffer (dist/assets/demo-9JbpkLFd.js)`**:
    - 役割: `AudioBuffer`から`BufferSource`インスタンスを作成する静的ファクトリ関数。
    - 引数: `AudioBuffer`
    - 戻り値: `BufferSource`
    - 機能: Web Audio APIの`AudioBuffer`オブジェクトを`BufferSource`形式に変換して利用可能にします。
- **`getNextChunk (dist/assets/demo-9JbpkLFd.js)`**:
    - 役割: `BufferSource`から次のオーディオデータチャンクを取得する関数。
    - 引数: なし
    - 戻り値: `Float32Array` (次のデータチャンク)
    - 機能: ループ再生や連続的なデータ供給のために、オーディオデータを小分けにして提供します。
- **`reset (dist/assets/demo-9JbpkLFd.js)`**:
    - 役割: `BufferSource`の再生位置を初期化する関数。
    - 引数: なし
    - 戻り値: `void`
    - 機能: `BufferSource`の読み出しポインタを先頭に戻します。
- **`seek (dist/assets/demo-9JbpkLFd.js)`**:
    - 役割: `BufferSource`の再生位置を特定のオフセットに設定する関数。
    - 引数: `number` (オフセットサンプル数)
    - 戻り値: `void`
    - 機能: オーディオバッファ内の任意の時点から再生を開始できるようにします。
- **`getPosition (dist/assets/demo-9JbpkLFd.js)`**:
    - 役割: `BufferSource`の現在の再生位置を取得する関数。
    - 引数: なし
    - 戻り値: `number` (現在のサンプルオフセット)
    - 機能: `BufferSource`が現在どの位置のデータを読み出しているかを返します。
- **`getLength (dist/assets/demo-9JbpkLFd.js)`**:
    - 役割: `BufferSource`の総サンプル長を取得する関数。
    - 引数: なし
    - 戻り値: `number` (総サンプル数)
    - 機能: `BufferSource`が保持するオーディオデータの総長を返します。
- **`getSampleRate (dist/assets/demo-9JbpkLFd.js)`**:
    - 役割: `BufferSource`のサンプルレートを取得する関数。
    - 引数: なし
    - 戻り値: `number` (サンプルレート)
    - 機能: `BufferSource`のオーディオデータが生成されたサンプルレートを返します。
- **`setChunkSize (dist/assets/demo-9JbpkLFd.js)`**:
    - 役割: `BufferSource`が一度に提供するデータチャンクのサイズを設定する関数。
    - 引数: `number` (チャンクサイズ)
    - 戻り値: `void`
    - 機能: データ処理の効率に応じて、データの分割単位を変更します。
- **`getChunkSize (dist/assets/demo-9JbpkLFd.js)`**:
    - 役割: `BufferSource`の現在のデータチャンクサイズを取得する関数。
    - 引数: なし
    - 戻り値: `number` (チャンクサイズ)
    - 機能: 現在設定されているデータチャンクのサイズを返します。
- **`setLooping (dist/assets/demo-9JbpkLFd.js)`**:
    - 役割: `BufferSource`のループ再生を有効または無効にする関数。
    - 引数: `boolean`
    - 戻り値: `void`
    - 機能: データが終了した際に最初から再生を繰り返すかどうかを制御します。
- **`isLoop (dist/assets/demo-9JbpkLFd.js)`**:
    - 役割: `BufferSource`が現在ループ再生モードであるかを確認する関数。
    - 引数: なし
    - 戻り値: `boolean`
    - 機能: ループ再生機能の現在の状態を返します。
- **`isAtEnd (dist/assets/demo-9JbpkLFd.js)`**:
    - 役割: `BufferSource`がデータの終わりに達したかを確認する関数。
    - 引数: なし
    - 戻り値: `boolean`
    - 機能: `BufferSource`から取得できるデータがもう残っていないかを返します。
- **`switch (dist/assets/demo-9JbpkLFd.js)`**:
    - 役割: JavaScriptの多分岐条件制御構文。
    - 引数: なし (構文の一部)
    - 戻り値: なし (構文の一部)
    - 機能: データ処理の異なるモードや条件に応じて、異なる処理経路を選択するために使用されます。
- **`catch (dist/assets/demo-9JbpkLFd.js)`**:
    - 役割: JavaScriptのtry...catch構文の一部。
    - 引数: `Error` (エラーオブジェクト)
    - 戻り値: なし (構文の一部)
    - 機能: `BufferSource`の操作中に発生したエラーを捕捉し、適切に処理します。
- **`constructor (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: ビルド後のメインアプリケーションコードにおけるクラスのコンストラクタ。
    - 引数: 不明
    - 戻り値: なし
    - 機能: `DOMElementManager`や`DisplayUpdater`などのクラスがインスタンス化される際の初期化を行います。
- **`frequencyToNoteInfo (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: 周波数を音符情報に変換する関数。
    - 引数: 不明 (周波数)
    - 戻り値: 不明 (音符名、オクターブ、セント値などの情報)
    - 機能: 検出された周波数をピアノ鍵盤に表示するために、音楽的な情報に変換します。
- **`calculateKeyboardRange (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: ピアノ鍵盤の表示範囲を計算する関数。
    - 引数: 不明 (最低・最高周波数)
    - 戻り値: 不明 (表示すべき最低・最高音符、鍵盤数など)
    - 機能: 検出可能な周波数範囲に基づいて、ピアノ鍵盤のどの範囲を表示すべきかを決定します。
- **`countWhiteKeys (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: ピアノ鍵盤の表示範囲内の白鍵の数を数える関数。
    - 引数: 不明 (最低・最高音符)
    - 戻り値: 不明 (白鍵の数)
    - 機能: ピアノ鍵盤の描画レイアウトを決定するために、白鍵の数をカウントします。
- **`for (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: JavaScriptの繰り返し制御構文。
    - 引数: なし (構文の一部)
    - 戻り値: なし (構文の一部)
    - 機能: ピアノ鍵盤の描画、UI要素のループ処理など、反復的なタスクに使用されます。
- **`calculateCenteringOffset (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: ピアノ鍵盤を中央に配置するためのオフセットを計算する関数。
    - 引数: 不明 (鍵盤の幅、表示領域の幅)
    - 戻り値: 不明 (オフセット値)
    - 機能: ピアノ鍵盤がCanvas内で適切に中央揃えになるように描画位置を調整します。
- **`render (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: ピアノ鍵盤を描画する関数。
    - 引数: 不明 (Canvasコンテキスト、音符情報など)
    - 戻り値: `void`
    - 機能: 検出された周波数に基づいて、ピアノ鍵盤とその上の検出された音符を視覚的に表示します。
- **`clear (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: ピアノ鍵盤表示用のCanvasをクリアする関数。
    - 引数: 不明 (Canvasコンテキスト)
    - 戻り値: `void`
    - 機能: 新しい鍵盤表示の前にCanvasを初期化します。
- **`getElement (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: IDからDOM要素を取得するヘルパー関数。
    - 引数: `string` (要素のID)
    - 戻り値: `HTMLElement`
    - 機能: UIイベントハンドラや表示更新のために、HTML要素をDOMから取得します。
- **`validateElements (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: 必要なDOM要素がすべて存在するかを検証する関数。
    - 引数: 不明 (要素の配列)
    - 戻り値: `void` (要素が見つからない場合はエラーをスロー)
    - 機能: アプリケーションの起動時に、必要なUI要素がHTMLに正しく定義されているかを確認します。
- **`start (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: メインアプリケーションの実行を開始する関数。
    - 引数: なし
    - 戻り値: Promise<void>
    - 機能: オシロスコープの起動、UIイベントハンドラの設定、ディスプレイの更新を開始します。
- **`stop (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: メインアプリケーションの実行を停止する関数。
    - 引数: なし
    - 戻り値: `void`
    - 機能: オシロスコープの停止、UI要素のリセット、ディスプレイのクリアを行います。
- **`update (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: アプリケーションのUIディスプレイを更新する関数。
    - 引数: 不明 (オシロスコープインスタンス)
    - 戻り値: `void`
    - 機能: 周波数、ゲイン、類似度などの情報をUIに表示し、ピアノ鍵盤を更新します。
- **`updateFrequencyDisplay (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: 周波数表示UIを更新する関数。
    - 引数: 不明 (検出された周波数)
    - 戻り値: `void`
    - 機能: 検出された周波数値をHTML要素に表示します。
- **`if (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: JavaScriptの条件分岐制御構文。
    - 引数: なし (構文の一部)
    - 戻り値: なし (構文の一部)
    - 機能: 検出された周波数が有効か、ゲインが有効かなど、表示を更新する条件をチェックするために使用されます。
- **`updateGainDisplay (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: ゲイン表示UIを更新する関数。
    - 引数: 不明 (現在のゲイン値)
    - 戻り値: `void`
    - 機能: 現在のゲイン値をHTML要素に表示します。
- **`updateSimilarityDisplay (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: 波形類似度表示UIを更新する関数。
    - 引数: 不明 (類似度スコア)
    - 戻り値: `void`
    - 機能: 現在の波形類似度スコアをHTML要素に表示します。
- **`clearDisplays (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: 全てのUIディスプレイをクリアする関数。
    - 引数: なし
    - 戻り値: `void`
    - 機能: アプリケーション停止時などに、周波数、ゲイン、類似度などの表示を初期状態に戻します。
- **`setupEventHandlers (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: UIイベントハンドラを設定する関数。
    - 引数: 不明 (オシロスコープインスタンス, DOM要素マネージャー, ディスプレイアップデーター)
    - 戻り値: `void`
    - 機能: ボタン、スライダー、チェックボックスなどのUI要素にリスナーを登録し、ユーザー操作に応じた処理を有効にします。
- **`initializeUIState (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: UIの初期状態を設定する関数。
    - 引数: 不明 (DOM要素マネージャー)
    - 戻り値: `void`
    - 機能: アプリケーション起動時に、各UI要素の初期値や状態を設定します。
- **`setupCheckboxHandlers (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: チェックボックスのイベントハンドラを設定する関数。
    - 引数: 不明 (オシロスコープインスタンス, DOM要素マネージャー)
    - 戻り値: `void`
    - 機能: 自動ゲイン、ノイズゲート、オーバーレイ表示などのチェックボックスの変更イベントを処理します。
- **`setupSliderHandlers (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: スライダーのイベントハンドラを設定する関数。
    - 引数: 不明 (オシロスコープインスタンス, DOM要素マネージャー)
    - 戻り値: `void`
    - 機能: ノイズゲート閾値などのスライダーの変更イベントを処理します。
- **`setupSelectHandlers (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: セレクトボックスのイベントハンドラを設定する関数。
    - 引数: 不明 (オシロスコープインスタンス, DOM要素マネージャー)
    - 戻り値: `void`
    - 機能: 周波数推定方式やバッファサイズマルチプライヤーなどのセレクトボックスの変更イベントを処理します。
- **`setupButtonHandlers (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: ボタンのイベントハンドラを設定する関数。
    - 引数: 不明 (オシロスコープインスタンス, DOM要素マネージャー, ディスプレイアップデーター)
    - 戻り値: `void`
    - 機能: 開始/停止、リセットなどのボタンクリックイベントを処理します。
- **`setupFileInputHandler (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: ファイル入力フィールドのイベントハンドラを設定する関数。
    - 引数: 不明 (オシロスコープインスタンス, DOM要素マネージャー)
    - 戻り値: `void`
    - 機能: WAVファイルなどのオーディオファイルが選択された際のイベントを処理します。
- **`handleStartStopButton (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: 開始/停止ボタンのクリックイベントを処理する関数。
    - 引数: 不明 (オシロスコープインスタンス, DOM要素マネージャー, ディスプレイアップデーター)
    - 戻り値: Promise<void>
    - 機能: アプリケーションの開始状態と停止状態を切り替え、それに応じたUI更新を行います。
- **`catch (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: JavaScriptのtry...catch構文の一部。
    - 引数: `Error` (エラーオブジェクト)
    - 戻り値: なし (構文の一部)
    - 機能: UI操作中に発生したエラーを捕捉し、ユーザーにフィードバックを提供します。
- **`handleFileInput (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: ファイル入力フィールドからのファイル選択イベントを処理する関数。
    - 引数: `Event` (ファイル入力イベント), `Oscilloscope`
    - 戻り値: Promise<void>
    - 機能: 選択されたオーディオファイルを読み込み、オシロスコープでの処理を開始します。
- **`sliderValueToThreshold (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: スライダーの数値からノイズゲートの閾値に変換する関数。
    - 引数: `number` (スライダーの値)
    - 戻り値: `number` (デシベル単位の閾値)
    - 機能: UI上のスライダーの値を、内部処理で使用するデシベル単位の閾値にマッピングします。
- **`formatThresholdDisplay (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: ノイズゲートの閾値を表示用にフォーマットする関数。
    - 引数: `number` (デシベル単位の閾値)
    - 戻り値: `string` (フォーマットされた文字列)
    - 機能: 閾値の数値を、単位（dB）付きのユーザーフレンドリーな文字列に変換します。
- **`updateCycleSimilarityPanelDisplay (dist/assets/main-pCt8i_lw.js)`**:
    - 役割: 波形類似度パネルの表示を更新する関数。
    - 引数: 不明 (オシロスコープインスタンス, DOM要素マネージャー)
    - 戻り値: `void`
    - 機能: 類似度スコア、プロット、波形比較などを描画するパネルの表示を最新の状態に更新します。
- **`dbToAmplitude (dist/utils.d.ts)`**:
    - 役割: デシベル値を振幅値に変換する関数。
    - 引数: `number` (db)
    - 戻り値: `number`
    - 機能: 音量レベルの表現形式を変換します。
- **`amplitudeToDb (dist/utils.d.ts)`**:
    - 役割: 振幅値をデシベル値に変換する関数。
    - 引数: `number` (amplitude)
    - 戻り値: `number`
    - 機能: 信号強度を対数スケールで表現します。
- **`frequencyToNote (dist/utils.d.ts)`**:
    - 役割: 周波数を音符情報に変換する関数。
    - 引数: `number` (frequency), `number` (a4Frequency)
    - 戻り値: `NoteInfo`
    - 機能: 検出された周波数を音楽的な表現に変換します。
- **`trimSilence (dist/utils.d.ts)`**:
    - 役割: オーディオデータの先頭と末尾の無音部分をトリムする関数。
    - 引数: `Float32Array` (audioData), `number` (threshold)
    - 戻り値: `Float32Array`
    - 機能: 不要な無音部分を除去し、波形解析の効率を高めます。
- **`__wbg_get_imports (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyモジュールのJavaScriptインポートを取得する内部関数。
    - 引数: なし
    - 戻り値: `object`
    - 機能: WASMモジュールがJavaScript環境から呼び出す関数（例: `console.log`）を提供します。
- **`getArrayF32FromWasm0 (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyメモリからFloat32Arrayデータを取得する内部ヘルパー関数。
    - 引数: `number` (ポインタ), `number` (長さ)
    - 戻り値: `Float32Array`
    - 機能: WASM側で処理された浮動小数点数配列データをJavaScript側で利用可能な形式に変換します。
- **`getArrayU32FromWasm0 (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyメモリからUint32Arrayデータを取得する内部ヘルパー関数。
    - 引数: `number` (ポインタ), `number` (長さ)
    - 戻り値: `Uint32Array`
    - 機能: WASM側で処理された符号なし32ビット整数配列データをJavaScript側で利用可能な形式に変換します。
- **`getArrayU8FromWasm0 (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyメモリからUint8Arrayデータを取得する内部ヘルパー関数。
    - 引数: `number` (ポインタ), `number` (長さ)
    - 戻り値: `Uint8Array`
    - 機能: WASM側で処理された符号なし8ビット整数配列データをJavaScript側で利用可能な形式に変換します。
- **`getFloat32ArrayMemory0 (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyメモリ内のFloat32Arrayバッファへの参照を取得する内部ヘルパー関数。
    - 引数: なし
    - 戻り値: `Float32Array`
    - 機能: WASMインスタンスの共有メモリバッファをFloat32ArrayとしてJavaScriptから直接操作できるようにします。
- **`getStringFromWasm0 (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyメモリから文字列データを取得する内部ヘルパー関数。
    - 引数: `number` (ポインタ), `number` (長さ)
    - 戻り値: `string`
    - 機能: WASM側でエンコードされた文字列をJavaScriptのUTF-8文字列にデコードします。
- **`getUint32ArrayMemory0 (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyメモリ内のUint32Arrayバッファへの参照を取得する内部ヘルパー関数。
    - 引数: なし
    - 戻り値: `Uint32Array`
    - 機能: WASMインスタンスの共有メモリバッファをUint32ArrayとしてJavaScriptから直接操作できるようにします。
- **`getUint8ArrayMemory0 (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyメモリ内のUint8Arrayバッファへの参照を取得する内部ヘルパー関数。
    - 引数: なし
    - 戻り値: `Uint8Array`
    - 機能: WASMインスタンスの共有メモリバッファをUint8ArrayとしてJavaScriptから直接操作できるようにします。
- **`isLikeNone (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: 値がnullまたはundefinedに似ているか（None）をチェックする内部ヘルパー関数。
    - 引数: `any` (値)
    - 戻り値: `boolean`
    - 機能: オプション値の存在チェックに使用されます。
- **`passArray8ToWasm0 (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: JavaScriptのUint8ArrayをWebAssemblyメモリにコピーする内部ヘルパー関数。
    - 引数: `Uint8Array` (データ)
    - 戻り値: `number` (WASMメモリ内のポインタ)
    - 機能: JavaScriptからWASMへバイナリデータを効率的に渡します。
- **`passArrayF32ToWasm0 (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: JavaScriptのFloat32ArrayをWebAssemblyメモリにコピーする内部ヘルパー関数。
    - 引数: `Float32Array` (データ)
    - 戻り値: `number` (WASMメモリ内のポインタ)
    - 機能: JavaScriptからWASMへ浮動小数点数配列データを効率的に渡します。
- **`passStringToWasm0 (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: JavaScriptの文字列をWebAssemblyメモリにコピーする内部ヘルパー関数。
    - 引数: `string` (文字列)
    - 戻り値: `number` (WASMメモリ内のポインタ)
    - 機能: JavaScriptからWASMへ文字列データを効率的に渡します。
- **`decodeText (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: バイト配列をテキスト文字列にデコードする内部ヘルパー関数。
    - 引数: `Uint8Array` (バイトデータ)
    - 戻り値: `string`
    - 機能: WASMから返されたバイトデータを人間が読める文字列に変換します。
- **`__wbg_finalize_init (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyモジュールの最終的な初期化ステップを実行する内部関数。
    - 引数: `WebAssembly.Instance`, `WebAssembly.Module`
    - 戻り値: `void`
    - 機能: WASMインスタンスの初期化が完了した後、最終的なセットアップタスクを行います。
- **`__wbg_load (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyモジュールをロードする内部関数。
    - 引数: `string` (WASMファイルのURL)
    - 戻り値: Promise<object>
    - 機能: 指定されたURLからWASMファイルを非同期に取得し、`WebAssembly.instantiateStreaming`などを利用してインスタンス化します。
- **`expectedResponseType (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: 期待されるHTTPレスポンスタイプを取得する内部ヘルパー関数。
    - 引数: `string` (URL)
    - 戻り値: `string`
    - 機能: WASMファイルのMIMEタイプを判断し、`fetch`リクエストの`responseType`を設定します。
- **`initSync (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyモジュールを同期的に初期化する関数（実装）。
    - 引数: `WebAssembly.Module` または `Uint8Array`
    - 戻り値: `void`
    - 機能: `dist/wasm/signal_processor_wasm.d.ts` で定義された`initSync`の実装で、同期的にWASMをロードし、JavaScriptから利用可能な状態にします。
- **`__wbg_init (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyモジュールを非同期に初期化する関数（実装）。
    - 引数: `string` (WASMファイルのURL) または `Promise<WebAssembly.Module>`
    - 戻り値: Promise<void>
    - 機能: `public/wasm/signal_processor_wasm.d.ts`で定義された`__wbg_init`の実装で、WASMファイルを非同期でロードし、初期化します。
- **`__destroy_into_raw (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WASMオブジェクトをRawポインタに変換し、Rust側で解放できるようにする内部関数。
    - 引数: `number` (WASMオブジェクトポインタ)
    - 戻り値: `number` (Rawポインタ)
    - 機能: Rustの所有権システムと連携し、不要になったWASMオブジェクトのメモリを安全に解放します。
- **`free (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WASMオブジェクトに関連するメモリを解放する関数。
    - 引数: `number` (WASMオブジェクトポインタ)
    - 戻り値: `void`
    - 機能: WASMヒープからオブジェクトを削除し、メモリリークを防ぎます。
- **`computeFrequencyData (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: 周波数データを計算する関数。
    - 引数: `Float32Array` (時間領域データ), `number` (サンプルレート), `string` (推定方式), `number` (バッファサイズ乗数)
    - 戻り値: `Float32Array` (周波数スペクトラム)
    - 機能: Rust側で実装されたFFT、STFT、CQTなどのアルゴリズムを用いて、与えられた時間領域データから周波数スペクトラムを計算します。
- **`if (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: JavaScriptの条件分岐制御構文。
    - 引数: なし (構文の一部)
    - 戻り値: なし (構文の一部)
    - 機能: WASMモジュールが適切にロードされているか、入力データが有効かなどの条件チェックに使用されます。
- **`constructor (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WASMモジュールによってエクスポートされたクラスのコンストラクタ。
    - 引数: 不明 (WASMモジュールによって定義される)
    - 戻り値: なし
    - 機能: `SignalProcessorWasm`などのWASMクラスのインスタンスが生成される際の初期化を行います。
- **`processFrame (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: 単一のオーディオフレームをWebAssemblyで処理する関数。
    - 引数: `Float32Array` (オーディオデータ)
    - 戻り値: `object` (処理結果を含むオブジェクト)
    - 機能: 入力されたオーディオフレームに対して、周波数推定、ゼロクロス検出、ゲイン調整、類似度計算など、WebAssembly側の全てのデータ処理を実行します。
- **`reset (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyプロセッサの状態をリセットする関数。
    - 引数: なし
    - 戻り値: `void`
    - 機能: 内部バッファや履歴データをクリアし、プロセッサを初期状態に戻します。
- **`setAutoGain (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssembly側の自動ゲイン機能を有効または無効にする関数。
    - 引数: `boolean`
    - 戻り値: `void`
    - 機能: Rustで実装された自動ゲインアルゴリズムの動作を制御します。
- **`setBufferSizeMultiplier (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssembly側のバッファサイズ乗数を設定する関数。
    - 引数: `number`
    - 戻り値: `void`
    - 機能: Rust側の周波数推定アルゴリズムが使用する拡張バッファの倍率を制御します。
- **`setFrequencyEstimationMethod (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssembly側の周波数推定方法を設定する関数。
    - 引数: `string` (推定方式)
    - 戻り値: `void`
    - 機能: Rustで実装された5つの周波数推定アルゴリズムのいずれかを選択して設定します。
- **`setNoiseGate (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssembly側のノイズゲート機能を有効または無効にする関数。
    - 引数: `boolean`
    - 戻り値: `void`
    - 機能: Rustで実装されたノイズゲートアルゴリズムの動作を制御します。
- **`setNoiseGateThreshold (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssembly側のノイズゲート閾値を設定する関数。
    - 引数: `number`
    - 戻り値: `void`
    - 機能: Rust側のノイズゲートアルゴリズムが使用する閾値を設定します。
- **`setUsePeakMode (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssembly側のピーク検出モードを有効または無効にする関数。
    - 引数: `boolean`
    - 戻り値: `void`
    - 機能: Rust側の波形探索や周波数推定において、ピーク強調モードの動作を制御します。
- **`setZeroCrossMode (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssembly側のゼロクロス検出モードを設定する関数。
    - 引数: `string` (ゼロクロスモード)
    - 戻り値: `void`
    - 機能: Rustで実装されたゼロクロス検出アルゴリズムの動作を制御します。
- **`__wrap (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyのエクスポートされた関数をJavaScript側でラップする内部ヘルパー関数。
    - 引数: `number` (WASM関数へのインデックス), `number` (JavaScript側から呼び出される関数の期待引数数)
    - 戻り値: `Function` (ラップされたJavaScript関数)
    - 機能: WASMからエクスポートされた生の関数ポインタを、JavaScriptから扱いやすい関数として提供します。
- **`candidate1Harmonics (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが計算した第1候補の倍音情報を取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `Float32Array`
    - 機能: 周波数推定アルゴリズムの内部で比較された倍音候補の一つに関する情報を提供します。
- **`candidate1WeightedScore (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが計算した第1候補の加重スコアを取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `number`
    - 機能: 周波数推定の候補選定におけるスコアの一つを提供します。
- **`candidate2Harmonics (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが計算した第2候補の倍音情報を取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `Float32Array`
    - 機能: 周波数推定アルゴリズムの内部で比較された倍音候補の一つに関する情報を提供します。
- **`candidate2WeightedScore (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが計算した第2候補の加重スコアを取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `number`
    - 機能: 周波数推定の候補選定におけるスコアの一つを提供します。
- **`cycleSimilarities2div (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが計算した2分割周期の類似度を取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `Float32Array`
    - 機能: 波形比較パネルにおける類似度計算の詳細データの一つを提供します。
- **`cycleSimilarities4div (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが計算した4分割周期の類似度を取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `Float32Array`
    - 機能: 波形比較パネルにおける類似度計算の詳細データの一つを提供します。
- **`cycleSimilarities8div (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが計算した8分割周期の類似度を取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `Float32Array`
    - 機能: 波形比較パネルにおける類似度計算の詳細データの一つを提供します。
- **`displayEndIndex (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが計算した表示波形の終了インデックスを取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `number`
    - 機能: Canvasに描画される波形データの終了位置を示します。
- **`displayStartIndex (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが計算した表示波形の開始インデックスを取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `number`
    - 機能: Canvasに描画される波形データの開始位置を示します。
- **`estimatedFrequency (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが推定した基本周波数を取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `number` (Hz)
    - 機能: 周波数推定アルゴリズムの結果として得られた周波数値を返します。
- **`fftSize (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが使用するFFTサイズを取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `number`
    - 機能: FFT計算の基となるバッファサイズを示します。
- **`frequencyData (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが計算した周波数スペクトラムデータを取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `Float32Array`
    - 機能: FFTオーバーレイなどの描画に使用される周波数領域データを提供します。
- **`frequencyPlotHistory (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが管理する周波数推移の履歴データを取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `Float32Array`
    - 機能: 周波数推移プロットの描画に使用される過去の周波数データを提供します。
- **`gain (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが適用している現在のゲイン値を取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `number`
    - 機能: 自動ゲイン機能によって調整された現在の振幅増幅率を返します。
- **`halfFreqPeakStrengthPercent (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが計算した半周波数ピーク強度パーセンテージを取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `number`
    - 機能: 周波数推定の補助情報として、半分の周波数帯域におけるピークの強度を示します。
- **`highlightedZeroCrossCandidate (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyがハイライトしているゼロクロス候補のインデックスを取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `number`
    - 機能: デバッグ目的で、現在選択されているゼロクロス候補の位置を示します。
- **`isSignalAboveNoiseGate (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: 信号がノイズゲート閾値を超えているかを取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `boolean`
    - 機能: ノイズゲート機能が現在アクティブな信号を処理しているかどうかの状態を示します。
- **`maxFrequency (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが検出可能な最高周波数を取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `number` (Hz)
    - 機能: 現在のバッファサイズ設定に基づく検出可能最高周波数を示します。
- **`phaseMinusQuarterPiIndex (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: 位相 -π/4 の波形インデックスを取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `number`
    - 機能: 位相マーカーの描画に使用される特定の位相位置を示します。
- **`phaseTwoPiIndex (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: 位相 2π（1周期の終わり）の波形インデックスを取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `number`
    - 機能: 位相マーカーの描画に使用される特定の位相位置を示します。
- **`phaseTwoPiPlusQuarterPiIndex (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: 位相 2π + π/4 の波形インデックスを取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `number`
    - 機能: 位相マーカーの描画に使用される特定の位相位置を示します。
- **`phaseZeroHistory (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが管理する位相ゼロ点の履歴データを取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `Float32Array`
    - 機能: 位相オフセットオーバーレイの描画に使用される履歴データを提供します。
- **`phaseZeroIndex (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが検出した現在の位相ゼロ点（開始点）の波形インデックスを取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `number`
    - 機能: ゼロクロス検出アルゴリズムによって特定された波形の開始位置を示します。
- **`phaseZeroSegmentRelative (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: 位相ゼロ点がセグメント内で相対的にどこにあるかを取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `number` (0-100%)
    - 機能: 「オフセット%オーバーレイ」で表示される、4周期座標系内での位相0マーカーの相対位置を示します。
- **`phaseZeroTolerance (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: 位相ゼロ点検出の許容誤差を取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `number`
    - 機能: ゼロクロス検出の精度に関する設定値を示します。
- **`previousWaveform (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが保持する前回の波形データを取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `Float32Array`
    - 機能: 波形比較パネルで現在フレームと比較するために、前回のオーディオ波形データを提供します。
- **`sampleRate (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが使用するサンプルレートを取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `number` (Hz)
    - 機能: WASMモジュールが処理しているオーディオデータのサンプリング周波数を示します。
- **`selectionReason (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが周波数推定候補を選択した理由を取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `string`
    - 機能: 複数の周波数推定候補の中から、どの基準で最終的な推定値が選ばれたかを示すデバッグ情報を提供します。
- **`similarity (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが計算した現在の波形類似度を取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `number`
    - 機能: 現在の波形と前回の波形の間の類似度スコアを返します。
- **`similarityPlotHistory (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが管理する波形類似度プロットの履歴データを取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `Float32Array`
    - 機能: 類似度プロットの描画に使用される過去の類似度スコアデータを提供します。
- **`usedSimilaritySearch (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが類似度検索を実行したかを取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `boolean`
    - 機能: 波形比較パネルがアクティブで、類似度計算が行われているかどうかの状態を示します。
- **`waveform_data (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが保持する現在の波形データを取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `Float32Array`
    - 機能: Canvasに描画される生の時間領域オーディオデータを提供します。
- **`zeroCrossCandidates (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが検出したゼロクロス候補の配列を取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `Float32Array`
    - 機能: ゼロクロス検出アルゴリズムによって特定された、波形のゼロ交差点の候補位置のリストを提供します。
- **`zeroCrossModeName (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: WebAssemblyが使用しているゼロクロス検出モードの名称を取得するプロパティ。
    - 引数: なし (プロパティ)
    - 戻り値: `string`
    - 機能: 現在設定されているゼロクロス検出モードの名前を返します。
- **`for (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: JavaScriptの繰り返し制御構文。
    - 引数: なし (構文の一部)
    - 戻り値: なし (構文の一部)
    - 機能: WASMモジュールのロード処理、データバッファのコピー、結果の取得など、反復的なタスクに使用されます。
- **`catch (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: JavaScriptのtry...catch構文の一部。
    - 引数: `Error` (エラーオブジェクト)
    - 戻り値: なし (構文の一部)
    - 機能: WASMモジュールのロードや実行中に発生したエラーを捕捉し、適切に処理します。
- **`switch (dist/wasm/signal_processor_wasm.js)`**:
    - 役割: JavaScriptの多分岐条件制御構文。
    - 引数: なし (構文の一部)
    - 戻り値: なし (構文の一部)
    - 機能: 異なる周波数推定方式やゼロクロス検出モードに応じて、WASM側の異なるロジックパスを選択するために使用されます。
- **`takeScreenshot (scripts/screenshot-local.js)`**:
    - 役割: 指定されたURLのウェブページからスクリーンショットを撮影する関数。
    - 引数: `string` (URL), `string` (出力パス)
    - 戻り値: Promise<void>
    - 機能: Playwrightライブラリを使用して、指定されたウェブページをヘッドレスブラウザで開き、スクリーンショットを保存します。
- **`if (scripts/screenshot-local.js)`**:
    - 役割: JavaScriptの条件分岐制御構文。
    - 引数: なし (構文の一部)
    - 戻り値: なし (構文の一部)
    - 機能: スクリーンショットの出力パスが存在するかどうか、ブラウザの起動オプションなどをチェックするために使用されます。
- **`close (scripts/screenshot-local.js)`**:
    - 役割: Playwrightブラウザインスタンスを閉じる関数。
    - 引数: なし
    - 戻り値: Promise<void>
    - 機能: スクリーンショット撮影後にブラウザリソースを解放します。
- **`while (src/AudioManager.ts)`**:
    - 役割: JavaScriptの繰り返し制御構文。条件が真である限り、コードブロックを繰り返し実行します。
    - 引数: なし (構文の一部)
    - 戻り値: なし (構文の一部)
    - 機能: オーディオバッファからのデータチャンクの読み出しなど、データストリーム処理に使用されます。
- **`handleLoad (src/WasmModuleLoader.ts)`**:
    - 役割: WebAssemblyモジュールのロードが完了した際のコールバック関数。
    - 引数: `WebAssembly.Result` (WASMインスタンスとモジュール)
    - 戻り値: `void`
    - 機能: WASMのロードが成功した後に、WASMインスタンスを初期化し、利用可能にします。
- **`createAudioBuffer (src/__tests__/utils.test.ts)`**:
    - 役割: テスト用の`AudioBuffer`オブジェクトを作成するヘルパー関数。
    - 引数: `number` (サンプルレート), `number` (チャンネル数), `number` (長さ), `Array<Float32Array>` (チャネルデータ)
    - 戻り値: `AudioBuffer`
    - 機能: 実際のオーディオファイルなしで`AudioBuffer`を生成し、Web Audio API関連のテストを容易にします。
- **`calculateWeightedScore (src/__tests__/weighted-harmonic-issue195.test.ts)`**:
    - 役割: 加重倍音スコアを計算するテスト用関数。
    - 引数: `Array<number>` (倍音の振幅), `number` (基本周波数), `number` (サンプルレート)
    - 戻り値: `number` (加重スコア)
    - 機能: 周波数推定の精度向上を目的とした倍音分析アルゴリズムの一部をテストします。
- **`drawVerticalLine (src/renderers/PhaseMarkerRenderer.ts)`**:
    - 役割: 指定されたCanvasコンテキスト上に垂直線を描画するヘルパー関数。
    - 引数: `CanvasRenderingContext2D`, `number` (x座標), `number` (高さ), `string` (色), `number` (幅)
    - 戻り値: `void`
    - 機能: 位相マーカーなどの描画で利用され、視覚的な補助線を提供します。

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
Generated at: 2026-02-13 07:16:14 JST
