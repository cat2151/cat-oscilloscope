Last updated: 2026-02-07

# Project Overview

## プロジェクト概要
- Webブラウザ上で動作する、リアルタイムの音波形ビジュアライザー（オシロスコープ）です。
- マイク入力やオーディオファイルから音声を分析し、多様な周波数推定アルゴリズムで波形や音高を視覚化します。
- Rust/WebAssemblyによる高速なデータ処理と、直感的なUIで音の分析を支援します。

## 技術スタック
- フロントエンド: **TypeScript** (型安全なJavaScriptでUIロジックとレンダリングを実装), **HTML Canvas** (2DグラフィックAPIで波形やオーバーレイを描画)
- 音楽・オーディオ: **Web Audio API** (ブラウザでマイクからの音声入力やオーディオファイルの再生、リアルタイム分析を実行)
- 開発ツール: **Vite** (高速な開発サーバーとバンドラー), **wasm-pack** (RustコードをWebAssemblyにビルドするツール)
- テスト: **Vitest** (JavaScript/TypeScriptコードの単体テストフレームワーク), **happy-dom** (DOM環境をシミュレートするライブラリ)
- ビルドツール: **Vite** (アプリケーションのバンドルと最適化), **vite-plugin-dts** (TypeScriptの型定義ファイルを生成), **wasm-pack** (Rust/WASMモジュールのビルド)
- 言語機能: **Rust** (パフォーマンスが要求されるデータ処理アルゴリズムをWebAssembly向けに実装), **TypeScript** (JavaScriptに静的型付けを提供し、大規模開発の堅牢性を向上)
- 自動化・CI/CD: **GitHub Actions** (日次バッチによるコード品質チェックなど、継続的インテグレーション/デプロイメントを自動化)
- 開発標準: **コード品質の自動チェック** (大規模ファイルの検出など、プロジェクト全体のコード品質を維持する仕組み)

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
  📖 254-diagnostic-plan.md
  📖 254.md
  📖 255.md
  📖 257.md
  📖 265.md
  📖 267.md
  📖 269.md
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
      📄 tests.rs
      📄 zero_crossing.rs
    📄 gain_controller.rs
    📄 lib.rs
    📄 waveform_render_data.rs
    📄 waveform_searcher.rs
    📁 zero_cross_detector/
      📄 detection_modes.rs
      📄 mod.rs
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
  📄 wavlpf-broken-layout.png
📖 test-segment-relative.md
📊 tsconfig.json
📊 tsconfig.lib.json
📘 vite.config.ts
```

## ファイル詳細説明
- **`.gitignore`**: Gitでバージョン管理しないファイルやディレクトリを指定します。
- **`ARCHITECTURE.md`**: プロジェクトの全体的なアーキテクチャや設計思想を説明するドキュメントです。
- **`LIBRARY_USAGE.md`**: このプロジェクトをライブラリとして他のプロジェクトで利用する方法について説明するドキュメントです。
- **`LICENSE`**: プロジェクトのライセンス情報（MITライセンス）を記述したファイルです。
- **`README.ja.md` / `README.md`**: プロジェクトの概要、機能、使い方などを記述した多言語（日本語/英語）の導入ドキュメントです。
- **`REFACTORING_ISSUE_251.md` / `REFACTORING_SUMMARY.md`**: 特定のリファクタリング（Issue #251）に関する詳細や、リファクタリングの全体的なサマリーを記述したドキュメントです。
- **`_config.yml`**: Jekyllなどの静的サイトジェネレータでGitHub Pagesの設定を定義するファイルです。
- **`demo-simple.html`**: ライブラリのシンプルな利用例を示すHTMLデモページです。
- **`demo-simple.js`**: `demo-simple.html`の動作を制御するJavaScriptコードで、ライブラリのインスタンス化や基本的な操作を示します。
- **`dist/`**: プロジェクトがビルドされた成果物が格納されるディレクトリです。
    - **`.d.ts`ファイル群**: TypeScriptの型定義ファイルで、ビルドされたJavaScriptモジュールの型情報を提供します。
    - **`.js`ファイル群**: ビルドされたJavaScriptコードです。
    - **`assets/`**: ビルドされたJavaScriptバンドルやその他のアセットが格納されます。
    - **`cat-oscilloscope.cjs` / `cat-oscilloscope.mjs`**: npmライブラリとして配布されるCommonJS/ES Modules形式のビルド成果物です。
    - **`comparison-renderers/`**: 波形比較パネルに関連するレンダラーの型定義とビルド成果物が含まれます。
    - **`renderers/`**: 主要な波形表示やオーバーレイ描画に関連するレンダラーの型定義とビルド成果物が含まれます。
    - **`wasm/`**: ビルド済みのWebAssemblyモジュールとその関連ファイルが格納されます。
- **`example-library-usage.html`**: ライブラリの具体的な使用例を示すHTMLページです。
- **`generated-docs/`**: 自動生成されたドキュメントが配置されるディレクトリです。
- **`issue-notes/`**: 開発中のIssueに関連するメモが格納されたディレクトリです。
- **`package-lock.json` / `package.json`**: プロジェクトの依存関係とスクリプトを定義するNode.jsの構成ファイルです。
- **`public/`**: 静的ファイルや事前ビルドされたWebAssemblyモジュールを配置するディレクトリです。
    - **`wasm/`**: アプリケーション本体で使用されるビルド済みのWebAssemblyモジュールとその型定義ファイル、WASMバイナリが含まれます。
- **`scripts/screenshot-local.js`**: ローカル環境でスクリーンショットを撮影するためのスクリプトです。
- **`signal-processor-wasm/`**: Rustで実装されたデータ処理ロジックのソースコードが格納されるディレクトリです。
    - **`Cargo.toml`**: Rustプロジェクトの依存関係や設定を定義するファイルです。
    - **`src/`**: Rustソースコードのルートディレクトリです。
        - **`bpf.rs`**: バンドパスフィルター関連のRustコード。
        - **`frequency_estimation/`**: 各種周波数推定アルゴリズム（Zero-Crossing, Autocorrelation, FFT, STFT, CQT）のRust実装が格納されます。
        - **`gain_controller.rs`**: 自動ゲイン制御のRust実装。
        - **`lib.rs`**: Rustクレートのメインライブラリファイルで、WASMバインディングを定義します。
        - **`waveform_render_data.rs`**: 波形描画データ構造のRust実装。
        - **`waveform_searcher.rs`**: 波形探索アルゴリズムのRust実装。
        - **`zero_cross_detector/`**: ゼロクロス検出アルゴリズムのRust実装が格納されます。
- **`src/`**: TypeScriptで実装されたフロントエンドロジックのソースコードが格納されるディレクトリです。
    - **`AudioManager.ts`**: Web Audio APIを管理し、マイク入力やファイルからのオーディオデータ処理を制御します。
    - **`BasePathResolver.ts`**: アプリケーションのベースパスを解決するためのユーティリティです。
    - **`BufferSource.ts`**: 静的バッファからオーディオデータを供給するためのクラスです。
    - **`ComparisonPanelRenderer.ts`**: 波形比較パネルの描画を管理するクラスです。
    - **`CycleSimilarityRenderer.ts`**: 波形サイクルの類似度を描画するクラスです。
    - **`DOMElementManager.ts`**: アプリケーションで使用されるDOM要素の管理とアクセスを提供します。
    - **`DisplayUpdater.ts`**: 頻度表示やゲイン表示、ピアノ鍵盤表示など、UI要素の更新を管理します。
    - **`FrameBufferHistory.ts`**: 過去のフレームバッファを履歴として保持し、拡張バッファ機能を提供します。
    - **`FrequencyEstimator.ts`**: さまざまな周波数推定アルゴリズムを管理し、WASMモジュールと連携します。
    - **`GainController.ts`**: 自動ゲイン調整やノイズゲートなどの音量制御ロジックを実装します。
    - **`Oscilloscope.ts`**: オシロスコープアプリケーション全体の主要な制御クラスです。オーディオ処理、レンダリング、WASM連携を統合します。
    - **`OverlayLayout.ts`**: オーバーレイ表示のレイアウトと位置計算を管理します。
    - **`PianoKeyboardRenderer.ts`**: 検出された周波数をピアノ鍵盤上に視覚的に表示するクラスです。
    - **`UIEventHandlers.ts`**: ユーザーインターフェース（ボタン、スライダー、チェックボックスなど）からのイベントを処理します。
    - **`WasmModuleLoader.ts`**: WebAssemblyモジュールのロードと初期化を管理します。
    - **`WaveformDataProcessor.ts`**: オーディオデータの前処理、WASMモジュールへのデータ渡し、結果の取得を管理します。
    - **`WaveformRenderData.ts`**: 波形描画に必要なデータを保持するデータ構造です。
    - **`WaveformRenderer.ts`**: メインの波形キャンバスと各種オーバーレイの描画を管理します。
    - **`WaveformSearcher.ts`**: 波形中のゼロクロスポイントやピークを検出するためのロジックを提供します。
    - **`ZeroCrossDetector.ts`**: ゼロクロス検出のモードと設定を管理します。
    - **`__tests__/`**: Vitestによるテストコードが格納されるディレクトリです。
    - **`comparison-renderers/`**: 波形比較パネル内の個別のレンダラー（オフセット、位置マーカー、類似度プロットなど）のTypeScript実装です。
    - **`index.ts`**: ライブラリのエントリーポイントで、公開APIをエクスポートします。
    - **`main.ts`**: アプリケーションのメインエントリーポイントで、初期化とUI設定を行います。
    - **`renderers/`**: 波形表示や各種オーバーレイ（FFT、周波数プロット、ハーモニック分析など）のTypeScript実装です。
    - **`utils.ts`**: 共通のユーティリティ関数（デシベル変換、周波数からノートへの変換など）を提供します。
- **`test-pages/`**: 特定のテストシナリオ用のHTMLページが格納されるディレクトリです。
- **`test-segment-relative.md`**: 特定のテストケースに関する詳細を記述したドキュメントです。
- **`tsconfig.json` / `tsconfig.lib.json`**: TypeScriptコンパイラの設定ファイルです。
- **`vite.config.ts`**: Viteビルドツールの設定ファイルです。

## 関数詳細説明
- **`startUpdates()` (demo-simple.js)**: デモページの表示更新を開始します。主にUI要素と波形表示の更新ループを制御します。
- **`stopUpdates()` (demo-simple.js)**: デモページの表示更新を停止します。
- **`generateWaveform()` (demo-simple.js)**: テスト目的などで静的な波形データを生成します。
- **`startOscilloscope()` (demo-simple.js)**: オシロスコープのオーディオ処理と描画を開始します。
- **`if`, `switch`, `for`, `catch`**: これらのキーワードはJavaScript/TypeScriptの制御フロー構文であり、特定の関数名ではありません。ファイル詳細分析では、これらの構文を含むブロックが関数としてカウントされている可能性があります。
- **`v`, `b`, `w`, `f` (dist/assets/demo-DsYptmO3.js)**: ビルド後のデモスクリプト内の短縮された関数名で、デモUIの初期化やイベント処理など、特定の内部ロジックを担当します。
- **`B`, `Y`, `H`, `Z`, `k`, `d`, `r` (dist/assets/main-DUIA4vI1.js)**: アプリケーションのメインバンドル内の短縮された関数名で、多くの場合はソースコードのクラスメソッドやヘルパー関数がViteによって最適化されたものです。具体的な役割はコンテキストにより異なりますが、UI更新、オーディオ処理の呼び出し、描画処理などが含まれます。
- **`constructor` (複数ファイル)**: 各クラスのインスタンスが作成される際に実行される初期化関数です。
- **`updateHistory()` (dist/assets/main-DUIA4vI1.js)**: フレームバッファの履歴を更新します。
- **`getExtendedBuffer()` (dist/assets/main-DUIA4vI1.js)**: 拡張された（過去のフレームを含む）オーディオバッファを取得します。
- **`clear()` (dist/assets/main-DUIA4vI1.js)**: 特定のデータや状態をクリアします。
- **`initializeAnalyser()` (dist/assets/main-DUIA4vI1.js)**: Web Audio APIのAnalyserNodeを初期化します。
- **`start()` (src/AudioManager.ts, src/Oscilloscope.ts, dist/assets/main-DUIA4vI1.js)**: オーディオ処理を開始し、マイク入力からのデータ取得を開始します。
    - 引数: なし
    - 戻り値: Promise<void>
- **`startFromFile()` (src/AudioManager.ts, src/Oscilloscope.ts, dist/assets/main-DUIA4vI1.js)**: 指定されたファイルパスからオーディオをロードし、処理を開始します。
    - 引数: `filePath: string` (オーディオファイルのパス)
    - 戻り値: Promise<void>
- **`startFromBuffer()` (src/AudioManager.ts, src/Oscilloscope.ts, dist/assets/main-DUIA4vI1.js)**: 静的オーディオバッファから処理を開始します。
    - 引数: `bufferSource: BufferSource` (オーディオデータを含むBufferSourceインスタンス)
    - 戻り値: Promise<void>
- **`stop()` (src/AudioManager.ts, src/Oscilloscope.ts, dist/assets/main-DUIA4vI1.js)**: オーディオ処理を停止し、リソースを解放します。
    - 引数: なし
    - 戻り値: Promise<void>
- **`getTimeDomainData()` (dist/assets/main-DUIA4vI1.js)**: 時間領域のオーディオデータを取得します。
- **`getExtendedTimeDomainData()` (dist/assets/main-DUIA4vI1.js)**: 拡張された時間領域のオーディオデータを取得します。
- **`getFrequencyData()` (dist/assets/main-DUIA4vI1.js)**: 周波数領域のオーディオデータを取得します。
- **`getSampleRate()` (dist/assets/main-DUIA4vI1.js)**: 現在のオーディオサンプリングレートを取得します。
- **`getFFTSize()` (dist/assets/main-DUIA4vI1.js)**: FFTサイズを取得します。
- **`getFrequencyBinCount()` (dist/assets/main-DUIA4vI1.js)**: 周波数ビンの数を取得します。
- **`isReady()` (dist/assets/main-DUIA4vI1.js)**: オーディオ処理が開始可能かどうかの状態を返します。
- **`setAutoGain()` (dist/assets/main-DUIA4vI1.js, public/wasm/signal_processor_wasm.js)**: 自動ゲイン機能を有効/無効にします。
    - 引数: `enabled: boolean`
    - 戻り値: void
- **`getAutoGainEnabled()` (dist/assets/main-DUIA4vI1.js)**: 自動ゲインが有効かどうかを返します。
- **`setNoiseGate()` (dist/assets/main-DUIA4vI1.js, public/wasm/signal_processor_wasm.js)**: ノイズゲート機能を有効/無効にします。
    - 引数: `enabled: boolean`
    - 戻り値: void
- **`getNoiseGateEnabled()` (dist/assets/main-DUIA4vI1.js)**: ノイズゲートが有効かどうかを返します。
- **`setNoiseGateThreshold()` (dist/assets/main-DUIA4vI1.js, public/wasm/signal_processor_wasm.js)**: ノイズゲートの閾値を設定します。
    - 引数: `threshold: number`
    - 戻り値: void
- **`getNoiseGateThreshold()` (dist/assets/main-DUIA4vI1.js)**: ノイズゲートの閾値を取得します。
- **`getCurrentGain()` (dist/assets/main-DUIA4vI1.js)**: 現在適用されているゲイン値を取得します。
- **`clearHistory()` (dist/assets/main-DUIA4vI1.js)**: バッファ履歴をクリアします。
- **`setFrequencyEstimationMethod()` (dist/assets/main-DUIA4vI1.js, public/wasm/signal_processor_wasm.js)**: 周波数推定方法を設定します（Zero-Crossing, Autocorrelation, FFT, STFT, CQT）。
    - 引数: `method: FrequencyEstimationMethod` (列挙型)
    - 戻り値: void
- **`getFrequencyEstimationMethod()` (dist/assets/main-DUIA4vI1.js)**: 現在の周波数推定方法を取得します。
- **`setBufferSizeMultiplier()` (dist/assets/main-DUIA4vI1.js, public/wasm/signal_processor_wasm.js)**: バッファサイズ乗数を設定し、低周波検出精度を調整します。
    - 引数: `multiplier: BufferSizeMultiplier` (列挙型)
    - 戻り値: void
- **`getBufferSizeMultiplier()` (dist/assets/main-DUIA4vI1.js)**: 現在のバッファサイズ乗数を取得します。
- **`getEstimatedFrequency()` (dist/assets/main-DUIA4vI1.js)**: 現在推定されている周波数を取得します。
- **`getMinFrequency()` (dist/assets/main-DUIA4vI1.js)**: 検出可能な最低周波数を取得します。
- **`getMaxFrequency()` (dist/assets/main-DUIA4vI1.js)**: 検出可能な最高周波数を取得します。
- **`getFrequencyPlotHistory()` (dist/assets/main-DUIA4vI1.js)**: 周波数プロットの履歴データを取得します。
- **`updateDimensions()` (dist/assets/main-DUIA4vI1.js)**: キャンバスやUI要素の寸法を更新します。
- **`calculateOverlayDimensions()` (dist/assets/main-DUIA4vI1.js)**: オーバーレイ描画領域の寸法を計算します。
- **`drawGrid()` (dist/assets/main-DUIA4vI1.js)**: キャンバスにグリッド線を描画します。
- **`drawGridLabels()` (dist/assets/main-DUIA4vI1.js)**: グリッドの軸ラベルを描画します。
- **`drawWaveform()` (dist/assets/main-DUIA4vI1.js)**: メインの波形を描画します。
- **`drawFFTOverlay()` (dist/assets/main-DUIA4vI1.js)**: FFTスペクトラムのオーバーレイを描画します。
- **`drawHarmonicAnalysis()` (dist/assets/main-DUIA4vI1.js)**: 倍音分析の結果をオーバーレイとして描画します。
- **`drawFrequencyPlot()` (dist/assets/main-DUIA4vI1.js)**: 周波数推移のプロットを描画します。
- **`setDebugOverlaysEnabled()` (dist/assets/main-DUIA4vI1.js)**: デバッグ用オーバーレイの表示/非表示を切り替えます。
    - 引数: `enabled: boolean`
    - 戻り値: void
- **`drawPhaseMarkers()` (dist/assets/main-DUIA4vI1.js)**: 位相マーカーを描画します。
- **`clearAndDrawGrid()` (dist/assets/main-DUIA4vI1.js)**: キャンバスをクリアし、グリッドを再描画します。
- **`updateRendererDimensions()` (dist/assets/main-DUIA4vI1.js)**: 各レンダラーの描画寸法を更新します。
- **`setFFTDisplay()` (dist/assets/main-DUIA4vI1.js)**: FFT表示の有効/無効を切り替えます。
    - 引数: `enabled: boolean`
    - 戻り値: void
- **`getFFTDisplayEnabled()` (dist/assets/main-DUIA4vI1.js)**: FFT表示が有効かどうかを返します。
- **`setHarmonicAnalysisEnabled()` (dist/assets/main-DUIA4vI1.js)**: 倍音分析表示の有効/無効を切り替えます。
    - 引数: `enabled: boolean`
    - 戻り値: void
- **`getHarmonicAnalysisEnabled()` (dist/assets/main-DUIA4vI1.js)**: 倍音分析表示が有効かどうかを返します。
- **`getDebugOverlaysEnabled()` (dist/assets/main-DUIA4vI1.js)**: デバッグオーバーレイが有効かどうかを返します。
- **`setOverlaysLayout()` (dist/assets/main-DUIA4vI1.js)**: オーバーレイのレイアウトを設定します。
    - 引数: `layout: OverlayLayout`
    - 戻り値: void
- **`getOverlaysLayout()` (dist/assets/main-DUIA4vI1.js)**: 現在のオーバーレイレイアウトを取得します。
- **`setUsePeakMode()` (dist/assets/main-DUIA4vI1.js, public/wasm/signal_processor_wasm.js)**: ピーク検出モードの使用を設定します。
    - 引数: `enabled: boolean`
    - 戻り値: void
- **`getUsePeakMode()` (dist/assets/main-DUIA4vI1.js)**: ピーク検出モードが有効かどうかを返します。
- **`setZeroCrossMode()` (dist/assets/main-DUIA4vI1.js, public/wasm/signal_processor_wasm.js)**: ゼロクロス検出モードを設定します。
    - 引数: `mode: ZeroCrossMode`
    - 戻り値: void
- **`getZeroCrossMode()` (dist/assets/main-DUIA4vI1.js)**: 現在のゼロクロス検出モードを取得します。
- **`reset()` (dist/assets/main-DUIA4vI1.js, public/wasm/signal_processor_wasm.js)**: オシロスコープの状態をリセットします。
    - 引数: なし
    - 戻り値: void
- **`getLastSimilarity()` (dist/assets/main-DUIA4vI1.js)**: 最後に計算された波形類似度を取得します。
- **`hasPreviousWaveform()` (dist/assets/main-DUIA4vI1.js)**: 以前の波形データが存在するかどうかを返します。
- **`getPreviousWaveform()` (dist/assets/main-DUIA4vI1.js)**: 以前の波形データを取得します。
- **`findPeakAmplitude()` (dist/assets/main-DUIA4vI1.js)**: 波形データのピーク振幅を検出します。
- **`drawCenterLine()` (dist/assets/main-DUIA4vI1.js)**: キャンバスの中央線を描画します。
- **`clearCanvas()` (dist/assets/main-DUIA4vI1.js)**: キャンバスの内容をクリアします。
- **`drawSimilarityPlot()` (dist/assets/main-DUIA4vI1.js)**: 波形類似度プロットを描画します。
- **`drawSimilarityText()` (dist/assets/main-DUIA4vI1.js)**: 波形類似度をテキストで表示します。
- **`drawPositionMarkers()` (dist/assets/main-DUIA4vI1.js)**: 波形上の位置マーカーを描画します。
- **`drawOffsetOverlayGraphs()` (dist/assets/main-DUIA4vI1.js)**: オフセットオーバーレイグラフを描画します。
- **`clearAllCanvases()` (dist/assets/main-DUIA4vI1.js)**: 全てのキャンバスをクリアします。
- **`updatePanels()` (dist/assets/main-DUIA4vI1.js)**: 複数の表示パネル（例：比較パネル）を更新します。
- **`drawSimilarityGraph()` (dist/assets/main-DUIA4vI1.js)**: 類似度グラフを描画します。
- **`updateGraphs()` (dist/assets/main-DUIA4vI1.js)**: 複数のグラフ表示を更新します。
- **`getBasePath()` (dist/assets/main-DUIA4vI1.js)**: アプリケーションのベースパスを取得します。
- **`getBasePathFromScripts()` (dist/assets/main-DUIA4vI1.js)**: スクリプトタグからベースパスを推測します。
- **`loadWasmModule()` (src/WasmModuleLoader.ts, dist/assets/main-DUIA4vI1.js)**: WebAssemblyモジュールをロードし、初期化します。
    - 引数: `wasmPath: string` (WASMファイルのパス)
    - 戻り値: Promise<void>
- **`getProcessor()` (dist/assets/main-DUIA4vI1.js)**: WASMデータプロセッサのインスタンスを取得します。
- **`initialize()` (src/WaveformDataProcessor.ts, dist/assets/main-DUIA4vI1.js)**: データプロセッサを初期化します。
- **`syncConfigToWasm()` (dist/assets/main-DUIA4vI1.js)**: 現在の設定をWASMモジュールに同期させます。
- **`syncResultsFromWasm()` (dist/assets/main-DUIA4vI1.js)**: WASMモジュールから処理結果を取得し、同期させます。
- **`processFrame()` (dist/assets/main-DUIA4vI1.js, public/wasm/signal_processor_wasm.js)**: 単一のオーディオフレームを処理します。
    - 引数: `buffer: Float32Array` (オーディオデータ)
    - 戻り値: void (WASM側はデータ構造を更新)
- **`updatePhaseOffsetHistory()` (dist/assets/main-DUIA4vI1.js)**: 位相オフセット履歴を更新します。
- **`render()` (dist/assets/main-DUIA4vI1.js)**: 描画ループ内でフレームをレンダリングします。
- **`renderFrame()` (dist/assets/main-DUIA4vI1.js)**: 単一のフレームを描画します。
- **`getIsRunning()` (dist/assets/main-DUIA4vI1.js)**: オシロスコープが現在実行中かどうかを返します。
- **`getSimilarityScore()` (dist/assets/main-DUIA4vI1.js)**: 現在の波形類似度スコアを取得します。
- **`isSimilaritySearchActive()` (dist/assets/main-DUIA4vI1.js)**: 類似度検索がアクティブかどうかを返します。
- **`setPauseDrawing()` (dist/assets/main-DUIA4vI1.js)**: 描画の一時停止を設定します。
    - 引数: `paused: boolean`
    - 戻り値: void
- **`getPauseDrawing()` (dist/assets/main-DUIA4vI1.js)**: 描画が一時停止しているかどうかを返します。
- **`setPhaseMarkerRangeEnabled()` (dist/assets/main-DUIA4vI1.js)**: 位相マーカー範囲表示の有効/無効を切り替えます。
    - 引数: `enabled: boolean`
    - 戻り値: void
- **`getPhaseMarkerRangeEnabled()` (dist/assets/main-DUIA4vI1.js)**: 位相マーカー範囲表示が有効かどうかを返します。
- **`frequencyToNoteInfo()` (dist/assets/main-DUIA4vI1.js)**: 周波数を音符情報に変換します。
- **`calculateKeyboardRange()` (dist/assets/main-DUIA4vI1.js)**: ピアノ鍵盤の表示範囲を計算します。
- **`countWhiteKeys()` (dist/assets/main-DUIA4vI1.js)**: 白鍵の数をカウントします。
- **`calculateCenteringOffset()` (dist/assets/main-DUIA4vI1.js)**: 表示のセンタリングオフセットを計算します。
- **`getElement()` (dist/assets/main-DUIA4vI1.js)**: 指定されたIDのDOM要素を取得します。
- **`validateElements()` (dist/assets/main-DUIA4vI1.js)**: 必要なDOM要素が全て存在するか検証します。
- **`update()` (dist/assets/main-DUIA4vI1.js)**: 各種UIディスプレイを更新します。
- **`updateFrequencyDisplay()` (dist/assets/main-DUIA4vI1.js)**: 周波数表示を更新します。
- **`updateGainDisplay()` (dist/assets/main-DUIA4vI1.js)**: ゲイン表示を更新します。
- **`updateSimilarityDisplay()` (dist/assets/main-DUIA4vI1.js)**: 類似度表示を更新します。
- **`clearDisplays()` (dist/assets/main-DUIA4vI1.js)**: 全てのUIディスプレイをクリアします。
- **`setupEventHandlers()` (dist/assets/main-DUIA4vI1.js)**: UIイベントハンドラを設定します。
- **`initializeUIState()` (dist/assets/main-DUIA4vI1.js)**: UIの初期状態を設定します。
- **`setupCheckboxHandlers()` (dist/assets/main-DUIA4vI1.js)**: チェックボックスのイベントハンドラを設定します。
- **`setupSliderHandlers()` (dist/assets/main-DUIA4vI1.js)**: スライダーのイベントハンドラを設定します。
- **`setupSelectHandlers()` (dist/assets/main-DUIA4vI1.js)**: ドロップダウン選択のイベントハンドラを設定します。
- **`setupButtonHandlers()` (dist/assets/main-DUIA4vI1.js)**: ボタンのイベントハンドラを設定します。
- **`setupFileInputHandler()` (dist/assets/main-DUIA4vI1.js)**: ファイル入力要素のイベントハンドラを設定します。
- **`handleStartStopButton()` (src/UIEventHandlers.ts, dist/assets/main-DUIA4vI1.js)**: 開始/停止ボタンのクリックイベントを処理します。
    - 引数: なし
    - 戻り値: Promise<void>
- **`handleFileInput()` (src/UIEventHandlers.ts, dist/assets/main-DUIA4vI1.js)**: ファイル入力イベントを処理し、選択されたオーディオファイルをロードします。
    - 引数: `event: Event` (ファイル入力イベント)
    - 戻り値: Promise<void>
- **`sliderValueToThreshold()` (dist/assets/main-DUIA4vI1.js)**: スライダーの値をノイズゲートの閾値に変換します。
- **`formatThresholdDisplay()` (dist/assets/main-DUIA4vI1.js)**: 閾値の表示形式を整形します。
- **`updateCycleSimilarityPanelDisplay()` (dist/assets/main-DUIA4vI1.js)**: サイクル類似度パネルの表示を更新します。
- **`initSync()` (dist/wasm/signal_processor_wasm.d.ts, public/wasm/signal_processor_wasm.js)**: WebAssemblyモジュールを同期的に初期化します。
    - 引数: `bytes: WebAssembly.Module | BufferSource | Response | string`
    - 戻り値: `InitOutput` (初期化されたWASMモジュールオブジェクト)
- **`__wbg_init()` (dist/wasm/signal_processor_wasm.d.ts, public/wasm/signal_processor_wasm.js)**: WASMモジュールの初期化関数（内部用）。
- **`__wbg_get_imports()` (public/wasm/signal_processor_wasm.js)**: WASMモジュールがインポートするJavaScript関数を取得する（内部用）。
- **`while()` (src/AudioManager.ts)**: オーディオループ内で継続的な処理を行うためのループ。
- **`cleanup()` (src/WasmModuleLoader.ts)**: WASMモジュールのリソースをクリーンアップします。
    - 引数: なし
    - 戻り値: void
- **`handleLoad()` (src/WasmModuleLoader.ts)**: WASMファイルのロード完了を処理します。
- **`createAudioBuffer()` (src/__tests__/utils.test.ts)**: テスト用にAudioBufferオブジェクトを作成するユーティリティ関数。
- **`calculateWeightedScore()` (src/__tests__/weighted-harmonic-issue195.test.ts)**: 加重スコアを計算する関数（テスト関連）。
- **`drawOffsetLine()` (src/comparison-renderers/OffsetOverlayRenderer.ts)**: オフセット線を描画します。
- **`drawVerticalLine()` (src/renderers/PhaseMarkerRenderer.ts)**: 垂直線を描画します。
- **`dbToAmplitude()` (src/utils.ts, dist/utils.d.ts)**: デシベル値を振幅に変換します。
    - 引数: `db: number`
    - 戻り値: `number` (振幅)
- **`amplitudeToDb()` (src/utils.ts, dist/utils.d.ts)**: 振幅をデシベル値に変換します。
    - 引数: `amplitude: number`
    - 戻り値: `number` (デシベル)
- **`frequencyToNote()` (src/utils.ts, dist/utils.d.ts)**: 周波数値を音楽的な音符名に変換します。
    - 引数: `frequency: number`
    - 戻り値: `{ note: string; octave: number; cent: number; }` (音符名、オクターブ、セント値)
- **`trimSilence()` (src/utils.ts)**: オーディオバッファの先頭と末尾の無音部分をトリミングします。
    - 引数: `buffer: Float32Array`, `threshold: number`
    - 戻り値: `Float32Array` (トリミング後のバッファ)

## 関数呼び出し階層ツリー
```
- B (dist/assets/main-DUIA4vI1.js)
  - if (demo-simple.js)
    - startUpdates (demo-simple.js)
      - stopUpdates (demo-simple.js)
      - generateWaveform (demo-simple.js)
      - startOscilloscope (demo-simple.js)
      - switch (demo-simple.js)
      - d (dist/assets/main-DUIA4vI1.js)
      - r (dist/assets/main-DUIA4vI1.js)
      - startFromBuffer (src/Oscilloscope.ts)
      - stop (src/Oscilloscope.ts)
      - getCurrentGain (dist/assets/main-DUIA4vI1.js)
      - getEstimatedFrequency (dist/assets/main-DUIA4vI1.js)
      - setDebugOverlaysEnabled (dist/assets/main-DUIA4vI1.js)
      - s (dist/assets/modulepreload-polyfill-B5Qt9EMX.js)
    - catch (demo-simple.js)
      - for (demo-simple.js)
      - v (dist/assets/demo-DsYptmO3.js)
      - b (dist/assets/demo-DsYptmO3.js)
      - w (dist/assets/demo-DsYptmO3.js)
      - f (dist/assets/demo-DsYptmO3.js)
      - k (dist/assets/main-DUIA4vI1.js)
      - takeScreenshot (scripts/screenshot-local.js)
      - close (src/__tests__/dom-integration.test.ts)
      - updateHistory (dist/assets/main-DUIA4vI1.js)
      - getExtendedBuffer (dist/assets/main-DUIA4vI1.js)
      - clear (dist/assets/main-DUIA4vI1.js)
      - initializeAnalyser (dist/assets/main-DUIA4vI1.js)
      - start (src/Oscilloscope.ts)
      - startFromFile (src/Oscilloscope.ts)
      - getTimeDomainData (dist/assets/main-DUIA4vI1.js)
      - getExtendedTimeDomainData (dist/assets/main-DUIA4vI1.js)
      - getFrequencyData (dist/assets/main-DUIA4vI1.js)
      - getSampleRate (dist/assets/main-DUIA4vI1.js)
      - getFFTSize (dist/assets/main-DUIA4vI1.js)
      - getFrequencyBinCount (dist/assets/main-DUIA4vI1.js)
      - isReady (dist/assets/main-DUIA4vI1.js)
      - reset (src/Oscilloscope.ts)
      - trimSilence (src/utils.ts)
      - createMediaStreamSource (src/__tests__/dom-integration.test.ts)
      - createAnalyser (src/__tests__/dom-integration.test.ts)
      - getTracks (src/__tests__/dom-integration.test.ts)
      - getBasePath (dist/assets/main-DUIA4vI1.js)
      - getBasePathFromScripts (dist/assets/main-DUIA4vI1.js)
    - clearHistory (dist/assets/main-DUIA4vI1.js)
    - setFrequencyEstimationMethod (dist/assets/main-DUIA4vI1.js)
    - getFrequencyEstimationMethod (dist/assets/main-DUIA4vI1.js)
    - setBufferSizeMultiplier (dist/assets/main-DUIA4vI1.js)
    - getBufferSizeMultiplier (dist/assets/main-DUIA4vI1.js)
    - getMinFrequency (dist/assets/main-DUIA4vI1.js)
    - getMaxFrequency (dist/assets/main-DUIA4vI1.js)
    - getFrequencyPlotHistory (dist/assets/main-DUIA4vI1.js)
    - resolveValue (dist/OverlayLayout.d.ts)
    - setAutoGain (dist/assets/main-DUIA4vI1.js)
    - setNoiseGate (dist/assets/main-DUIA4vI1.js)
    - setNoiseGateThreshold (dist/assets/main-DUIA4vI1.js)
    - setUsePeakMode (dist/assets/main-DUIA4vI1.js)
    - setZeroCrossMode (dist/assets/main-DUIA4vI1.js)
    - loadWasmModule (src/WasmModuleLoader.ts)
      - getProcessor (dist/assets/main-DUIA4vI1.js)
      - processFrame (public/wasm/signal_processor_wasm.js)
      - computeFrequencyData (public/wasm/signal_processor_wasm.js)
      - cleanup (src/WasmModuleLoader.ts)
    - normalize (src/__tests__/normalized-harmonics-issue197.test.ts)
    - getAutoGainEnabled (dist/assets/main-DUIA4vI1.js)
    - getNoiseGateEnabled (dist/assets/main-DUIA4vI1.js)
    - getNoiseGateThreshold (dist/assets/main-DUIA4vI1.js)
    - setFFTDisplay (dist/assets/main-DUIA4vI1.js)
    - getFFTDisplayEnabled (dist/assets/main-DUIA4vI1.js)
    - getDebugOverlaysEnabled (dist/assets/main-DUIA4vI1.js)
    - updatePanels (dist/assets/main-DUIA4vI1.js)
    - getIsRunning (dist/assets/main-DUIA4vI1.js)
    - getSimilarityScore (dist/assets/main-DUIA4vI1.js)
    - isSimilaritySearchActive (dist/assets/main-DUIA4vI1.js)
    - setPauseDrawing (dist/assets/main-DUIA4vI1.js)
    - getPauseDrawing (dist/assets/main-DUIA4vI1.js)
    - dbToAmplitude (src/utils.ts)
      - amplitudeToDb (src/utils.ts)
      - frequencyToNote (src/utils.ts)
    - createSilentMockAudioContext (src/__tests__/oscilloscope.test.ts)
      - getFFTOverlayDimensions (src/__tests__/oscilloscope.test.ts)
      - findFFTOverlayBorderCall (src/__tests__/oscilloscope.test.ts)
      - getAudioTracks (src/__tests__/oscilloscope.test.ts)
      - getVideoTracks (src/__tests__/oscilloscope.test.ts)
    - render (dist/assets/main-DUIA4vI1.js)
    - drawOffsetOverlayGraphs (dist/assets/main-DUIA4vI1.js)
    - drawOffsetLine (src/comparison-renderers/OffsetOverlayRenderer.ts)
    - drawSimilarityPlot (dist/assets/main-DUIA4vI1.js)
    - drawSimilarityText (dist/assets/main-DUIA4vI1.js)
    - drawWaveform (dist/assets/main-DUIA4vI1.js)
    - findPeakAmplitude (dist/assets/main-DUIA4vI1.js)
    - drawCenterLine (dist/assets/main-DUIA4vI1.js)
    - clearCanvas (dist/assets/main-DUIA4vI1.js)
    - calculateOverlayDimensions (dist/assets/main-DUIA4vI1.js)
    - drawFFTOverlay (dist/assets/main-DUIA4vI1.js)
    - Y (dist/assets/main-DUIA4vI1.js)
    - drawFrequencyPlot (dist/assets/main-DUIA4vI1.js)
    - drawHarmonicAnalysis (dist/assets/main-DUIA4vI1.js)
  - H (dist/assets/main-DUIA4vI1.js)
  - Z (dist/assets/main-DUIA4vI1.js)
  - constructor (dist/assets/main-DUIA4vI1.js)
- initSync (public/wasm/signal_processor_wasm.js)
- __wbg_get_imports (public/wasm/signal_processor_wasm.js)
- while (src/AudioManager.ts)
- handleLoad (src/WasmModuleLoader.ts)
- createAudioBuffer (src/__tests__/utils.test.ts)
- calculateWeightedScore (src/__tests__/weighted-harmonic-issue195.test.ts)
- drawVerticalLine (src/renderers/PhaseMarkerRenderer.ts)

---
Generated at: 2026-02-07 07:10:30 JST
