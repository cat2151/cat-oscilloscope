Last updated: 2026-02-04

# Project Overview

## プロジェクト概要
- ブラウザ上で動作する、高機能なオシロスコープ風の波形ビジュアライザーです。
- Rust/WebAssemblyによる高速なデータ処理と、5つの周波数推定方式を提供します。
- マイク入力やWAVファイル再生に対応し、npmライブラリとしても利用可能です。

## 技術スタック
- フロントエンド: HTML Canvas (2D波形レンダリング), Web Audio API (音声のキャプチャと分析)
- 音楽・オーディオ: Web Audio API (音声のキャプチャと分析), Rust/WebAssembly (高速で型安全なデータ処理アルゴリズム、周波数推定、ゼロクロス検出など)
- 開発ツール: Vite (高速なビルドツールと開発サーバー), npm/yarn (パッケージ管理), wasm-pack (RustコードをWebAssemblyにビルド), Node.js (開発環境の実行)
- テスト: Vitest (高速なユニットテストフレームワーク), @vitest/ui (VitestのテストUI), happy-dom (DOM環境のエミュレーション)
- ビルドツール: Vite (高速なビルドツールと開発サーバー), vite-plugin-dts (TypeScriptの型定義ファイルを生成)
- 言語機能: TypeScript (型安全なJavaScript、設定管理とレンダリング), Rust (高速で型安全なデータ処理アルゴリズムの実装)
- 自動化・CI/CD: (特になし)
- 開発標準: (特になし)

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
    📜 index-R-ZInwxZ.js
    📄 index-R-ZInwxZ.js.map
  📄 cat-oscilloscope.cjs
  📄 cat-oscilloscope.cjs.map
  📄 cat-oscilloscope.mjs
  📄 cat-oscilloscope.mjs.map
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
    📘 wasm_processor.d.ts
    📜 wasm_processor.js
    📄 wasm_processor_bg.wasm
    📘 wasm_processor_bg.wasm.d.ts
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
📁 scripts/
  📜 screenshot-local.js
📁 src/
  📘 AudioManager.ts
  📘 BasePathResolver.ts
  📘 BufferSource.ts
  📘 ComparisonPanelRenderer.ts
  📘 CycleSimilarityRenderer.ts
  📘 DOMElementManager.ts
  📘 DisplayUpdater.ts
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
📁 wasm-processor/
  📄 Cargo.toml
  📁 src/
    📄 bpf.rs
    📄 frequency_estimator.rs
    📄 gain_controller.rs
    📄 lib.rs
    📄 waveform_searcher.rs
    📄 zero_cross_detector.rs
```

## ファイル詳細説明
- **.gitignore**: Gitのバージョン管理から除外するファイルやディレクトリを指定する設定ファイル。
- **ARCHITECTURE.md**: プロジェクトのアーキテクチャに関する設計思想や構造を説明するドキュメント。
- **LIBRARY_USAGE.md**: 本プロジェクトをnpmライブラリとして他のプロジェクトで使用するための詳細な手順を説明するドキュメント。
- **LICENSE**: プロジェクトの利用条件を定義するライセンスファイル（MITライセンス）。
- **README.ja.md**: プロジェクトの日本語版の概要、機能、セットアップ方法、使い方などを記載したドキュメント。
- **README.md**: プロジェクトの英語版の概要、機能、セットアップ方法、使い方などを記載したドキュメント。
- **REFACTORING_SUMMARY.md**: プロジェクトのリファクタリングに関する主要な変更点や経緯をまとめたドキュメント。
- **_config.yml**: GitHub Pagesなどの静的サイトジェネレーター（Jekyllなど）の設定ファイル。
- **dist/**: プロジェクトのビルド成果物（JavaScript、TypeScript型定義、WebAssembly、HTMLなど）が格納されるディレクトリ。
    - **dist/AudioManager.d.ts**: 音声管理モジュール `AudioManager` の型定義ファイル。
    - **dist/BasePathResolver.d.ts**: アプリケーションのベースパスを解決する `BasePathResolver` モジュールの型定義ファイル。
    - **dist/BufferSource.d.ts**: オーディオバッファからの入力ソースを扱う `BufferSource` クラスの型定義ファイル。
    - **dist/ComparisonPanelRenderer.d.ts**: 波形比較パネルの描画を担う `ComparisonPanelRenderer` クラスの型定義ファイル。
    - **dist/CycleSimilarityRenderer.d.ts**: 波形サイクル間の類似度を計算し描画する `CycleSimilarityRenderer` クラスの型定義ファイル。
    - **dist/DOMElementManager.d.ts**: アプリケーションのDOM要素を管理する `DOMElementManager` クラスの型定義ファイル。
    - **dist/DisplayUpdater.d.ts**: UIの表示更新を行う `DisplayUpdater` クラスの型定義ファイル。
    - **dist/FrequencyEstimator.d.ts**: 周波数推定アルゴリズムを扱う `FrequencyEstimator` クラスの型定義ファイル。
    - **dist/GainController.d.ts**: 自動ゲイン調整やノイズゲートを制御する `GainController` クラスの型定義ファイル。
    - **dist/Oscilloscope.d.ts**: オシロスコープの主要な機能と設定をカプセル化する `Oscilloscope` クラスの型定義ファイル。
    - **dist/OverlayLayout.d.ts**: FFTスペクトラムなどのオーバーレイ表示のレイアウトを定義する型定義ファイル。
    - **dist/PianoKeyboardRenderer.d.ts**: 検出された周波数をピアノ鍵盤で表示する `PianoKeyboardRenderer` クラスの型定義ファイル。
    - **dist/UIEventHandlers.d.ts**: ユーザーインターフェースのイベントハンドリングを行う `UIEventHandlers` クラスの型定義ファイル。
    - **dist/WasmModuleLoader.d.ts**: WebAssemblyモジュールのロードと初期化を管理する `WasmModuleLoader` クラスの型定義ファイル。
    - **dist/WaveformDataProcessor.d.ts**: 生の音声データを処理し、表示可能な波形データに変換する `WaveformDataProcessor` クラスの型定義ファイル。
    - **dist/WaveformRenderData.d.ts**: 波形レンダリングに必要なデータを構造化する型定義ファイル。
    - **dist/WaveformRenderer.d.ts**: メインの波形とオーバーレイの描画を担う `WaveformRenderer` クラスの型定義ファイル。
    - **dist/WaveformSearcher.d.ts**: 波形周期内の特徴点（ゼロクロスなど）を検索する `WaveformSearcher` クラスの型定義ファイル。
    - **dist/ZeroCrossDetector.d.ts**: 波形のゼロクロス点を検出するアルゴリズムを実装する `ZeroCrossDetector` クラスの型定義ファイル。
    - **dist/assets/index-R-ZInwxZ.js**: ViteによってビルドされたアプリケーションのメインJavaScriptバンドルファイル（minify済）。
    - **dist/cat-oscilloscope.cjs**: CommonJS形式でエクスポートされたライブラリ本体。Node.js環境などで利用される。
    - **dist/cat-oscilloscope.mjs**: ESモジュール形式でエクスポートされたライブラリ本体。モダンなブラウザ環境などで利用される。
    - **dist/index.d.ts**: ライブラリのエントリポイントとなる主要な型定義ファイル。
    - **dist/index.html**: ビルド後のアプリケーションのメインHTMLファイル。
    - **dist/renderers/**: 各種オーバーレイやグリッドのレンダリング関連の型定義が格納されたサブディレクトリ。
        - **dist/renderers/BaseOverlayRenderer.d.ts**: 各種オーバーレイレンダラーの共通基底クラスの型定義。
        - **dist/renderers/FFTOverlayRenderer.d.ts**: FFTスペクトラム表示オーバーレイのレンダラーの型定義。
        - **dist/renderers/FrequencyPlotRenderer.d.ts**: 周波数推移プロットオーバーレイのレンダラーの型定義。
        - **dist/renderers/GridRenderer.d.ts**: グラフのグリッド描画のレンダラーの型定義。
        - **dist/renderers/HarmonicAnalysisRenderer.d.ts**: 倍音分析オーバーレイのレンダラーの型定義。
        - **dist/renderers/PhaseMarkerRenderer.d.ts**: 位相マーカーのレンダラーの型定義。
        - **dist/renderers/WaveformLineRenderer.d.ts**: 波形ライン自体の描画を担うレンダラーの型定義。
        - **dist/renderers/index.d.ts**: レンダラーモジュール群のエントリポイント型定義。
    - **dist/utils.d.ts**: 共通で利用されるユーティリティ関数の型定義ファイル。
    - **dist/wasm/**: WebAssemblyモジュールとそれに関連するファイルが格納されるディレクトリ。
        - **dist/wasm/package.json**: WASMモジュール用のパッケージ情報。
        - **dist/wasm/wasm_processor.d.ts**: WebAssemblyプロセッサモジュールの型定義ファイル。
        - **dist/wasm/wasm_processor.js**: WebAssemblyモジュールをブラウザでロードし、JavaScriptから利用するためのグルーコード。
        - **dist/wasm/wasm_processor_bg.wasm**: Rustで書かれた主要なデータ処理アルゴリズムをWebAssemblyにコンパイルしたバイナリファイル。
        - **dist/wasm/wasm_processor_bg.wasm.d.ts**: WASMバイナリの型定義ファイル。
- **example-library-usage.html**: `cat-oscilloscope` をnpmライブラリとして利用する際の具体的なコード例を示すHTMLファイル。
- **generated-docs/**: 何らかのツールによって生成されたドキュメントが格納されるディレクトリ。
- **index.html**: アプリケーションのメインとなるHTMLファイル（開発用またはソース）。
- **issue-notes/**: 開発中に発生した課題やその調査・解決策に関するメモを格納するディレクトリ。
- **package-lock.json**: npmパッケージの依存関係ツリーの正確なバージョンとハッシュを記録するファイル。
- **package.json**: プロジェクトのメタデータ、スクリプト、開発および実行時依存関係を定義するファイル。
- **public/**: Webサーバーで静的に配信されるファイル（例: WASMファイル）を格納するディレクトリ。
    - **public/wasm/**: 公開用に配置されたWebAssembly関連ファイル。`dist/wasm` と内容は同じ。
- **scripts/**: プロジェクト固有のスクリプト（例: スクリーンショットツール）が格納されるディレクトリ。
    - **scripts/screenshot-local.js**: ローカル環境でアプリケーションのスクリーンショットを自動で撮影するためのスクリプト。
- **src/**: プロジェクトの主要なTypeScriptソースコードが格納されるディレクトリ。
    - **src/AudioManager.ts**: Web Audio APIを利用してマイク入力やオーディオファイルからの音声を管理するクラス。
    - **src/BasePathResolver.ts**: アプリケーションの実行ベースパスを動的に解決するヘルパークラス。
    - **src/BufferSource.ts**: オーディオバッファを管理し、ループ再生などの機能を提供するクラス。
    - **src/ComparisonPanelRenderer.ts**: リアルタイムで波形類似度を表示する比較パネルの描画ロジックを実装。
    - **src/CycleSimilarityRenderer.ts**: 波形サイクルの類似度を計算し、その結果を視覚化するクラス。
    - **src/DOMElementManager.ts**: アプリケーションのHTML要素への参照を管理し、UI操作を簡素化する。
    - **src/DisplayUpdater.ts**: アプリケーションの各種UI表示（周波数、ゲイン、類似度など）を更新するロジックを管理。
    - **src/FrequencyEstimator.ts**: Zero-Crossing、Autocorrelation、FFT、STFT、CQTなど複数の周波数推定アルゴリズムを扱うクラス。
    - **src/GainController.ts**: 波形の振幅を自動調整するオートゲインや、閾値以下の信号をカットするノイズゲートを制御。
    - **src/Oscilloscope.ts**: アプリケーションの中核となるクラスで、音声入力、データ処理、レンダリング、UI連携を統合。
    - **src/OverlayLayout.ts**: FFTスペクトラムや倍音分析などのオーバーレイ表示のレイアウトを計算・管理。
    - **src/PianoKeyboardRenderer.ts**: 検出された周波数をピアノ鍵盤上に視覚的に表示する。
    - **src/UIEventHandlers.ts**: アプリケーションのUI要素（ボタン、スライダー、ファイル入力など）からのイベントを処理し、`Oscilloscope` クラスと連携。
    - **src/WasmModuleLoader.ts**: RustでビルドされたWebAssemblyモジュールをロードし、JavaScriptから利用するためのインターフェースを提供。
    - **src/WaveformDataProcessor.ts**: 音声データを前処理し、WebAssemblyモジュールと連携して周波数推定や波形検出を実行。
    - **src/WaveformRenderData.ts**: WaveformRendererが描画に必要とするすべてのデータ（波形、FFT、履歴など）を保持するデータ構造。
    - **src/WaveformRenderer.ts**: HTML Canvasに主要な波形、グリッド、オーバーレイを描画する役割を担う。
    - **src/WaveformSearcher.ts**: 波形データから特定のサイクルや特徴点を効率的に検索する。
    - **src/ZeroCrossDetector.ts**: 波形のゼロクロス点（信号がゼロを横切る点）を検出するロジックを実装。
    - **src/__tests__/**: ユニットテストコードが格納されたディレクトリ。
    - **src/index.ts**: ライブラリとしてエクスポートされる際のメインエントリポイント。
    - **src/main.ts**: アプリケーションの初期化と起動ロジックを含むメインスクリプト。
    - **src/renderers/**: 個別の描画コンポーネントを管理するサブディレクトリ。
        - **src/renderers/BaseOverlayRenderer.ts**: すべてのオーバーレイレンダラーの抽象基底クラス。
        - **src/renderers/FFTOverlayRenderer.ts**: FFTスペクトラム（周波数スペクトル）を描画する。
        - **src/renderers/FrequencyPlotRenderer.ts**: 周波数の時間的変化をプロットする。
        - **src/renderers/GridRenderer.ts**: オシロスコープの背景グリッド線を描画する。
        - **src/renderers/HarmonicAnalysisRenderer.ts**: 倍音分析の結果を視覚的に表示する。
        - **src/renderers/PhaseMarkerRenderer.ts**: 波形上の特定の位相点にマーカーを描画する。
        - **src/renderers/WaveformLineRenderer.ts**: 実際の波形ラインを描画する。
        - **src/renderers/index.ts**: レンダラーモジュール群のエクスポートポイント。
    - **src/utils.ts**: デシベル変換、周波数から音符への変換、無音トリミングなど、汎用的なユーティリティ関数をまとめたファイル。
- **test-pages/**: 開発中の特定の機能やレイアウトをテストするためのHTMLページやアセット。
    - **test-pages/test-canvas-dimension-warning.html**: キャンバスの寸法警告機能をテストするためのHTMLページ。
    - **test-pages/wavlpf-broken-layout.png**: wavlpfライブラリとの連携におけるレイアウト問題を検証するための画像。
- **test-segment-relative.md**: テストに関する特定のセグメントや考慮事項について記述されたメモ。
- **tsconfig.json**: TypeScriptコンパイラのプロジェクト全体の設定ファイル。
- **tsconfig.lib.json**: TypeScriptコンパイラのライブラリビルド用の設定ファイル。
- **vite.config.ts**: Viteビルドツールの設定ファイルで、プラグインやビルドオプションを定義。
- **wasm-processor/**: Rustで書かれたWebAssemblyモジュールのソースコードディレクトリ。
    - **wasm-processor/Cargo.toml**: Rustプロジェクト（クレート）の設定ファイル。
    - **wasm-processor/src/**: Rustのソースコードファイル群。
        - **wasm-processor/src/bpf.rs**: バンドパスフィルター（BPF）関連のロジック。
        - **wasm-processor/src/frequency_estimator.rs**: Rust実装の周波数推定アルゴリズム。
        - **wasm-processor/src/gain_controller.rs**: Rust実装のゲイン制御ロジック。
        - **wasm-processor/src/lib.rs**: Rustクレートのメインライブラリファイルで、JavaScriptとWebAssembly間のインターフェースを定義。
        - **wasm-processor/src/waveform_searcher.rs**: Rust実装の波形検索アルゴリズム。
        - **wasm-processor/src/zero_cross_detector.rs**: Rust実装のゼロクロス検出アルゴリズム。

## 関数詳細説明
- **initSync(module_or_path, maybe_memory)** (dist/wasm/wasm_processor.d.ts):
    - 役割: WebAssemblyモジュールを同期的に初期化する。
    - 引数: `module_or_path`: WebAssemblyモジュールまたはそのパス、`maybe_memory`: (オプション) WebAssemblyのメモリ。
    - 戻り値: なし
    - 機能: WASMモジュールのロードと初期化を行い、JavaScriptからWASMの機能を利用可能にする。
- **__wbg_get_imports()** (dist/wasm/wasm_processor.js):
    - 役割: WebAssemblyモジュールが必要とするインポートオブジェクトを取得する内部関数。
    - 引数: なし
    - 戻り値: インポートオブジェクト
    - 機能: WASMモジュールがJavaScript環境から利用する関数やグローバル変数を提供するための準備を行う。
- **drawOffsetLine(ctx, x, y1, y2, color, width)** (src/ComparisonPanelRenderer.ts):
    - 役割: 比較パネルにオフセット線を描画する。
    - 引数: `ctx`: CanvasRenderingContext2D、`x`: 線のX座標、`y1`: 線の開始Y座標、`y2`: 線の終了Y座標、`color`: 線の色、`width`: 線の太さ。
    - 戻り値: なし
    - 機能: 波形比較パネルにおいて、特定のオフセット位置を示すための補助線を描画する。
- **handleLoad(wasmPath)** (src/WasmModuleLoader.ts):
    - 役割: WebAssemblyモジュールのロード処理を管理するイベントハンドラ。
    - 引数: `wasmPath`: WebAssemblyファイルのパス。
    - 戻り値: なし
    - 機能: WASMモジュールの非同期ロードを処理し、ロード完了後に適切なコールバックを実行する。
- **createAudioBuffer(channels, length, sampleRate)** (src/__tests__/utils.test.ts):
    - 役割: テスト用途でダミーのAudioBufferを作成する。
    - 引数: `channels`: チャンネル数、`length`: サンプル数、`sampleRate`: サンプルレート。
    - 戻り値: AudioBufferオブジェクト
    - 機能: Web Audio APIのAudioBufferをシミュレートし、音声データ処理のテストに使用する。
- **calculateWeightedScore(harmonics, weights)** (src/__tests__/weighted-harmonic-issue195.test.ts):
    - 役割: 倍音の重み付けスコアを計算する。
    - 引数: `harmonics`: 倍音データの配列、`weights`: 各倍音に適用する重み。
    - 戻り値: 重み付けされたスコア
    - 機能: 倍音分析において、特定の倍音に対する重要度を考慮したスコアを算出する。
- **drawVerticalLine(ctx, x, y1, y2, color, lineWidth)** (src/renderers/PhaseMarkerRenderer.ts):
    - 役割: 位相マーカーとして垂直線を描画する。
    - 引数: `ctx`: CanvasRenderingContext2D、`x`: 線のX座標、`y1`: 線の開始Y座標、`y2`: 線の終了Y座標、`color`: 線の色、`lineWidth`: 線の太さ。
    - 戻り値: なし
    - 機能: 波形上の特定の位相を示すために、垂直方向のマーカー線を描画する。
- **t()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: アプリケーションの主要なロジックを起動し、コンポーネントを初期化・連携させる役割を持つ（minifyされたエントリポイントの一部と推測）。
    - 引数: なし
    - 戻り値: なし
    - 機能: アプリケーションの初期設定とメインループの開始を担う。
- **initializeAnalyser()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: Web Audio APIのAnalyserNodeを初期化する。
    - 引数: なし
    - 戻り値: なし
    - 機能: 音声データの周波数解析や時間領域データ取得に必要なAnalyserNodeを設定する。
- **start()** (dist/assets/index-R-ZInwxZ.js, src/AudioManager.ts, src/Oscilloscope.ts):
    - 役割: アプリケーションの音声処理とレンダリングを開始する。
    - 引数: なし
    - 戻り値: Promise<void>
    - 機能: マイク入力または指定されたバッファからの音声処理を開始し、オシロスコープの描画ループを起動する。
- **startFromFile(file)** (dist/assets/index-R-ZInwxZ.js, src/AudioManager.ts, src/Oscilloscope.ts):
    - 役割: 指定された音声ファイル（WAVなど）から処理とレンダリングを開始する。
    - 引数: `file`: Fileオブジェクト（音声ファイル）。
    - 戻り値: Promise<void>
    - 機能: ユーザーが選択した音声ファイルを読み込み、そのデータをオシロスコープで可視化する。
- **startFromBuffer(bufferSource)** (dist/assets/index-R-ZInwxZ.js, src/AudioManager.ts, src/Oscilloscope.ts):
    - 役割: 提供されたBufferSourceから処理とレンダリングを開始する。
    - 引数: `bufferSource`: BufferSourceオブジェクト（音声バッファ）。
    - 戻り値: Promise<void>
    - 機能: 静的なオーディオバッファ（例：wavlpfライブラリからのデータ）を直接可視化する。
- **stop()** (dist/assets/index-R-ZInwxZ.js, src/AudioManager.ts, src/Oscilloscope.ts):
    - 役割: 現在の音声処理とレンダリングを停止する。
    - 引数: なし
    - 戻り値: なし
    - 機能: マイク入力やファイル再生を停止し、描画ループを終了させる。
- **getTimeDomainData(analyser)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: AnalyserNodeから時間領域データ（波形データ）を取得する。
    - 引数: `analyser`: AnalyserNode。
    - 戻り値: Float32Array（時間領域データ）
    - 機能: 現在の音声フレームの生波形データを取得する。
- **updateFrameBufferHistory(data)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 過去のフレームバッファ履歴を更新する。
    - 引数: `data`: Float32Array（現在のフレームデータ）。
    - 戻り値: なし
    - 機能: 低周波検出精度の向上のため、過去の波形データを蓄積する。
- **getExtendedTimeDomainData(bufferSizeMultiplier)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: バッファサイズ乗数に基づいて拡張された時間領域データを取得する。
    - 引数: `bufferSizeMultiplier`: バッファサイズの乗数（1x, 4x, 16xなど）。
    - 戻り値: Float32Array（拡張時間領域データ）
    - 機能: 過去のフレーム履歴と現在のフレームを組み合わせて、より長い時間軸の波形データを生成する。
- **clearFrameBufferHistory()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: フレームバッファ履歴をクリアする。
    - 引数: なし
    - 戻り値: なし
    - 機能: バッファサイズ変更時などに、過去のフレーム履歴をリセットする。
- **getFrequencyData(analyser)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: AnalyserNodeから周波数領域データ（FFTスペクトラム）を取得する。
    - 引数: `analyser`: AnalyserNode。
    - 戻り値: Uint8Array（周波数スペクトラムデータ）
    - 機能: 現在の音声フレームの周波数成分データを取得する。
- **getSampleRate()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 現在のオーディオコンテキストのサンプルレートを取得する。
    - 引数: なし
    - 戻り値: number（サンプルレート）
    - 機能: 音声処理の基準となるサンプルレートを提供する。
- **getFFTSize()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: AnalyserNodeのFFTサイズを取得する。
    - 引数: なし
    - 戻り値: number（FFTサイズ）
    - 機能: 周波数解析に使用される窓関数のサイズを提供する。
- **getFrequencyBinCount()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 周波数ビン（FFTスペクトラムの要素数）のカウントを取得する。
    - 引数: なし
    - 戻り値: number（周波数ビン数）
    - 機能: FFT結果のデータポイント数を提供する。
- **isReady()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: アプリケーションが音声処理とレンダリングを開始する準備ができているかを確認する。
    - 引数: なし
    - 戻り値: boolean
    - 機能: Web Audio APIの初期化やWASMモジュールのロードが完了しているかなどの状態をチェックする。
- **setAutoGain(enabled)** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: 自動ゲイン調整の有効/無効を設定する。
    - 引数: `enabled`: boolean（有効にするか否か）。
    - 戻り値: なし
    - 機能: 波形の振幅を自動的に調整するかどうかを制御する。
- **getAutoGainEnabled()** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: 自動ゲイン調整が現在有効になっているかを取得する。
    - 引数: なし
    - 戻り値: boolean
    - 機能: 自動ゲイン調整の現在の状態を返す。
- **setNoiseGate(enabled)** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: ノイズゲートの有効/無効を設定する。
    - 引数: `enabled`: boolean（有効にするか否か）。
    - 戻り値: なし
    - 機能: 特定の閾値以下の信号をカットするかどうかを制御し、ノイズを低減する。
- **getNoiseGateEnabled()** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: ノイズゲートが現在有効になっているかを取得する。
    - 引数: なし
    - 戻り値: boolean
    - 機能: ノイズゲートの現在の状態を返す。
- **setNoiseGateThreshold(threshold)** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: ノイズゲートの閾値を設定する。
    - 引数: `threshold`: number（閾値、dB値）。
    - 戻り値: なし
    - 機能: 信号がこの閾値以下の場合はノイズとして扱われるように設定する。
- **getNoiseGateThreshold()** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: ノイズゲートの現在の閾値を取得する。
    - 引数: なし
    - 戻り値: number（閾値、dB値）
    - 機能: ノイズゲートの現在の閾値設定を返す。
- **getCurrentGain()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 現在のゲイン値を取得する。
    - 引数: なし
    - 戻り値: number
    - 機能: 自動ゲインによって適用されている現在の増幅率を返す。
- **clearHistory()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 波形や周波数推定の履歴データをクリアする。
    - 引数: なし
    - 戻り値: なし
    - 機能: アプリケーションの状態をリセットし、過去のデータを消去する。
- **setFrequencyEstimationMethod(method)** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: 周波数推定方法を設定する。
    - 引数: `method`: string（"Zero-Crossing", "Autocorrelation", "FFT", "STFT", "CQT"）。
    - 戻り値: なし
    - 機能: どの周波数推定アルゴリズムを使用するかを切り替える。
- **getFrequencyEstimationMethod()** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: 現在設定されている周波数推定方法を取得する。
    - 引数: なし
    - 戻り値: string
    - 機能: 現在使用中の周波数推定アルゴリズムの名前を返す。
- **setBufferSizeMultiplier(multiplier)** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: バッファサイズ乗数を設定する。
    - 引数: `multiplier`: number（1, 4, 16など）。
    - 戻り値: なし
    - 機能: 低周波検出精度向上のため、使用するバッファの長さを変更する。
- **getBufferSizeMultiplier()** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: 現在設定されているバッファサイズ乗数を取得する。
    - 引数: なし
    - 戻り値: number
    - 機能: 現在のバッファサイズ乗数を返す。
- **getEstimatedFrequency()** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: 現在推定されている周波数を取得する。
    - 引数: なし
    - 戻り値: number
    - 機能: 現在の音声フレームから検出された基本周波数を返す。
- **getMinFrequency()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 現在のバッファサイズ設定で検出可能な最低周波数を取得する。
    - 引数: なし
    - 戻り値: number
    - 機能: バッファサイズに基づいた検出可能な周波数範囲の下限を返す。
- **getMaxFrequency()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 現在のバッファサイズ設定で検出可能な最高周波数を取得する。
    - 引数: なし
    - 戻り値: number
    - 機能: バッファサイズに基づいた検出可能な周波数範囲の上限を返す。
- **getFrequencyPlotHistory()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 周波数プロットの履歴データを取得する。
    - 引数: なし
    - 戻り値: number[]
    - 機能: 時間経過による周波数の変化をグラフ表示するための履歴データを提供する。
- **updateDimensions()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: キャンバスやUI要素の寸法を更新する。
    - 引数: なし
    - 戻り値: なし
    - 機能: ブラウザのリサイズなどに応じて、描画領域のサイズを調整する。
- **calculateOverlayDimensions(layout)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: オーバーレイ表示のレイアウトと寸法を計算する。
    - 引数: `layout`: OverlayLayoutオブジェクト（オーバーレイの配置設定）。
    - 戻り値: オブジェクト（各オーバーレイの寸法情報）
    - 機能: メイン波形とFFTスペクトラムなどのオーバーレイが重ならないように、それぞれの描画領域を計算する。
- **drawGrid(ctx, width, height, sampleRate, fftSize)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: オシロスコープの背景グリッドを描画する。
    - 引数: `ctx`: CanvasRenderingContext2D、`width`: キャンバス幅、`height`: キャンバス高さ、`sampleRate`: サンプルレート、`fftSize`: FFTサイズ。
    - 戻り値: なし
    - 機能: 時間軸と周波数軸の目盛りを含むグリッドをキャンバスに描画する。
- **drawGridLabels(ctx, width, height, sampleRate, fftSize)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: グリッドのラベル（時間や周波数の値）を描画する。
    - 引数: `ctx`: CanvasRenderingContext2D、`width`: キャンバス幅、`height`: キャンバス高さ、`sampleRate`: サンプルレート、`fftSize`: FFTサイズ。
    - 戻り値: なし
    - 機能: グリッド線に対応する数値や単位をキャンバスに表示する。
- **drawWaveform(ctx, data, width, height, gain, noiseGateEnabled, noiseGateThreshold)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 波形データをキャンバスに描画する。
    - 引数: `ctx`: CanvasRenderingContext2D、`data`: Float32Array（波形データ）、`width`: キャンバス幅、`height`: キャンバス高さ、`gain`: ゲイン値、`noiseGateEnabled`: ノイズゲート有効フラグ、`noiseGateThreshold`: ノイズゲート閾値。
    - 戻り値: なし
    - 機能: 時間領域の音声データを線グラフとして可視化する。
- **drawFFTOverlay(ctx, data, width, height, config)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: FFTスペクトラムオーバーレイを描画する。
    - 引数: `ctx`: CanvasRenderingContext2D、`data`: Uint8Array（周波数スペクトラムデータ）、`width`: キャンバス幅、`height`: キャンバス高さ、`config`: FFT表示設定。
    - 戻り値: なし
    - 機能: 音声の周波数成分を棒グラフまたは線グラフで表示する。
- **drawHarmonicAnalysis(ctx, harmonics, width, height, config)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 倍音分析の結果をオーバーレイとして描画する。
    - 引数: `ctx`: CanvasRenderingContext2D、`harmonics`: 倍音データ、`width`: キャンバス幅、`height`: キャンバス高さ、`config`: 倍音分析表示設定。
    - 戻り値: なし
    - 機能: 検出された基音と倍音の関係を視覚的に表示する。
- **drawFrequencyPlot(ctx, history, width, height, config)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 周波数推移プロットをオーバーレイとして描画する。
    - 引数: `ctx`: CanvasRenderingContext2D、`history`: 過去の周波数履歴データ、`width`: キャンバス幅、`height`: キャンバス高さ、`config`: プロット表示設定。
    - 戻り値: なし
    - 機能: 時間の経過に伴う周波数の変化を折れ線グラフで表示する。
- **setDebugOverlaysEnabled(enabled)** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: デバッグ用オーバーレイ表示の有効/無効を設定する。
    - 引数: `enabled`: boolean。
    - 戻り値: なし
    - 機能: FFTスペクトラム、倍音分析、周波数推移プロットなどのデバッグ情報を表示するかどうかを制御する。
- **drawPhaseMarkers(ctx, phaseData, width, height)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 波形上の位相マーカーを描画する。
    - 引数: `ctx`: CanvasRenderingContext2D、`phaseData`: 位相データ、`width`: キャンバス幅、`height`: キャンバス高さ。
    - 戻り値: なし
    - 機能: ゼロクロス点や特定の位相における波形上の位置を視覚的にマークする。
- **clearAndDrawGrid()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: キャンバスをクリアし、グリッドを再描画する。
    - 引数: なし
    - 戻り値: なし
    - 機能: 描画更新時にキャンバスをリフレッシュし、常にグリッドを表示する。
- **updateRendererDimensions(width, height)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: レンダラーの寸法を更新する。
    - 引数: `width`: 新しい幅、`height`: 新しい高さ。
    - 戻り値: なし
    - 機能: 描画領域のサイズ変更時に、レンダラー内部の寸法設定を更新する。
- **setFFTDisplay(enabled)** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: FFTスペクトラム表示の有効/無効を設定する。
    - 引数: `enabled`: boolean。
    - 戻り値: なし
    - 機能: 周波数スペクトラムの視覚化をオン/オフする。
- **getFFTDisplayEnabled()** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: FFTスペクトラム表示が有効になっているかを取得する。
    - 引数: なし
    - 戻り値: boolean
    - 機能: FFT表示の現在の状態を返す。
- **setHarmonicAnalysisEnabled(enabled)** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: 倍音分析表示の有効/無効を設定する。
    - 引数: `enabled`: boolean。
    - 戻り値: なし
    - 機能: 倍音分析の結果を視覚化するかどうかを制御する。
- **getHarmonicAnalysisEnabled()** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: 倍音分析表示が有効になっているかを取得する。
    - 引数: なし
    - 戻り値: boolean
    - 機能: 倍音分析表示の現在の状態を返す。
- **getDebugOverlaysEnabled()** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: デバッグ用オーバーレイ表示が現在有効になっているかを取得する。
    - 引数: なし
    - 戻り値: boolean
    - 機能: デバッグオーバーレイの現在の状態を返す。
- **setOverlaysLayout(layout)** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: オーバーレイのレイアウトを設定する。
    - 引数: `layout`: OverlayLayout型（レイアウト設定）。
    - 戻り値: なし
    - 機能: オーバーレイ（FFT、倍音分析など）の表示位置やサイズをカスタマイズする。
- **getOverlaysLayout()** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: 現在設定されているオーバーレイのレイアウトを取得する。
    - 引数: なし
    - 戻り値: OverlayLayout型
    - 機能: 現在のオーバーレイレイアウト設定を返す。
- **setUsePeakMode(enabled)** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: ピークモードの使用を有効/無効にする。
    - 引数: `enabled`: boolean。
    - 戻り値: なし
    - 機能: 波形のピーク検出をベースに表示を安定させるモードを切り替える。
- **getUsePeakMode()** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: ピークモードが有効になっているかを取得する。
    - 引数: なし
    - 戻り値: boolean
    - 機能: ピークモードの現在の状態を返す。
- **setZeroCrossMode(enabled)** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: ゼロクロスモードの使用を有効/無効にする。
    - 引数: `enabled`: boolean。
    - 戻り値: なし
    - 機能: ゼロクロス検出をベースに波形表示を安定させるモードを切り替える。
- **getZeroCrossMode()** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: ゼロクロスモードが有効になっているかを取得する。
    - 引数: なし
    - 戻り値: boolean
    - 機能: ゼロクロスモードの現在の状態を返す。
- **reset()** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: アプリケーションの状態を初期化（リセット）する。
    - 引数: なし
    - 戻り値: なし
    - 機能: すべてのバッファ、履歴、設定をデフォルト状態に戻す。
- **getLastSimilarity()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 最新の波形類似度スコアを取得する。
    - 引数: なし
    - 戻り値: number
    - 機能: 前回と今回の波形の類似度を数値で返す。
- **hasPreviousWaveform()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 以前の波形データが存在するかを確認する。
    - 引数: なし
    - 戻り値: boolean
    - 機能: 波形比較のために、前回の波形がキャプチャされているかを確認する。
- **getPreviousWaveform()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 以前の波形データを取得する。
    - 引数: なし
    - 戻り値: Float32Array
    - 機能: 波形比較パネルなどで使用するため、前回の波形データを返す。
- **clearAllCanvases()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: すべてのキャンバスの内容をクリアする。
    - 引数: なし
    - 戻り値: なし
    - 機能: 描画内容をリセットするために、アプリケーション内のすべてのHTML Canvas要素を消去する。
- **clearCanvas(canvas)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 指定されたキャンバスの内容をクリアする。
    - 引数: `canvas`: HTMLCanvasElement。
    - 戻り値: なし
    - 機能: 個別のHTML Canvas要素をクリアする。
- **findPeakAmplitude(data)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 波形データ内のピーク振幅を検出する。
    - 引数: `data`: Float32Array（波形データ）。
    - 戻り値: number（ピーク振幅）
    - 機能: 波形データの最大振幅を特定し、ゲイン調整などに利用する。
- **drawCenterLine(ctx, width, height, color)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: キャンバスの中央に線を描画する。
    - 引数: `ctx`: CanvasRenderingContext2D、`width`: キャンバス幅、`height`: キャンバス高さ、`color`: 線の色。
    - 戻り値: なし
    - 機能: 波形の基準となる中央のゼロラインを視覚化する。
- **drawSimilarityText(ctx, similarity, x, y, alignment)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 波形類似度を示すテキストを描画する。
    - 引数: `ctx`: CanvasRenderingContext2D、`similarity`: 類似度スコア、`x`: テキストのX座標、`y`: テキストのY座標、`alignment`: テキストの配置。
    - 戻り値: なし
    - 機能: 比較パネルに現在の波形類似度を数値として表示する。
- **drawSimilarityPlot(ctx, history, x, y, width, height, color)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 波形類似度の履歴プロットを描画する。
    - 引数: `ctx`: CanvasRenderingContext2D、`history`: 類似度履歴データ、`x`: プロットのX座標、`y`: プロットのY座標、`width`: プロット幅、`height`: プロット高さ、`color`: プロットの色。
    - 戻り値: なし
    - 機能: 時間経過による類似度の変化を線グラフで表示する。
- **drawPositionMarkers(ctx, markers, width, height, color)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 特定の位置を示すマーカーを描画する。
    - 引数: `ctx`: CanvasRenderingContext2D、`markers`: マーカーの座標配列、`width`: キャンバス幅、`height`: キャンバス高さ、`color`: マーカーの色。
    - 戻り値: なし
    - 機能: 波形上の重要なポイント（例：ゼロクロス点、ピーク）をマークする。
- **drawOffsetOverlayGraphs(ctx, overlayData, width, height, colors)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: オフセットオーバーレイグラフを描画する。
    - 引数: `ctx`: CanvasRenderingContext2D、`overlayData`: オーバーレイデータ、`width`: キャンバス幅、`height`: キャンバス高さ、`colors`: グラフの色。
    - 戻り値: なし
    - 機能: 特定のオフセットを持つ波形データを補助的なグラフとして描画する。
- **updatePanels()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: UIパネルの表示内容を更新する。
    - 引数: なし
    - 戻り値: なし
    - 機能: 周波数表示、ゲイン表示、類似度パネルなどを最新のデータに基づいて更新する。
- **clear()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: （おそらく特定の描画領域を）クリアする。
    - 引数: なし
    - 戻り値: なし
    - 機能: 描画前に古い内容を消去する。
- **drawSimilarityGraph(ctx, similarityScores, x, y, width, height)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 類似度グラフを描画する。
    - 引数: `ctx`: CanvasRenderingContext2D、`similarityScores`: 類似度スコアの配列、`x`: グラフのX座標、`y`: グラフのY座標、`width`: グラフ幅、`height`: グラフ高さ。
    - 戻り値: なし
    - 機能: 波形類似度の履歴を視覚的なグラフとして表示する。
- **updateGraphs(similarityScores)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: グラフの表示を更新する。
    - 引数: `similarityScores`: 類似度スコアの配列。
    - 戻り値: なし
    - 機能: 類似度グラフなどの表示データを更新する。
- **getBasePath()** (dist/assets/index-R-ZInwxZ.js, src/BasePathResolver.ts):
    - 役割: アプリケーションのベースパスを取得する。
    - 引数: なし
    - 戻り値: string
    - 機能: WASMファイルなどのリソースをロードするための基準パスを特定する。
- **getBasePathFromScripts()** (dist/assets/index-R-ZInwxZ.js, src/BasePathResolver.ts):
    - 役割: 現在実行中のスクリプトからベースパスを推測して取得する。
    - 引数: なし
    - 戻り値: string
    - 機能: scriptタグのsrc属性などを解析し、アプリケーションのルートパスを特定する。
- **loadWasmModule(wasmPath)** (dist/assets/index-R-ZInwxZ.js, src/WasmModuleLoader.ts):
    - 役割: WebAssemblyモジュールをロードし、初期化する。
    - 引数: `wasmPath`: WebAssemblyファイルのパス。
    - 戻り値: Promise<WasmProcessor>
    - 機能: 指定されたパスからWASMモジュールを非同期でロードし、JavaScriptからアクセス可能なWasmProcessorインスタンスを返す。
- **getProcessor()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: ロードされたWasmProcessorインスタンスを取得する。
    - 引数: なし
    - 戻り値: WasmProcessor
    - 機能: Rust/WASMで実装されたデータ処理ロジックにアクセスするためのインターフェースを提供する。
- **initialize()** (dist/assets/index-R-ZInwxZ.js, src/WaveformDataProcessor.ts):
    - 役割: データプロセッサを初期化する。
    - 引数: なし
    - 戻り値: なし
    - 機能: WASMプロセッサの準備や内部状態のリセットを行う。
- **syncConfigToWasm()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: JavaScript側の設定をWebAssemblyモジュールに同期する。
    - 引数: なし
    - 戻り値: なし
    - 機能: 周波数推定方法、バッファサイズ乗数、ゲイン設定などのUIからの変更をWASM側のロジックに反映させる。
- **syncResultsFromWasm()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: WebAssemblyモジュールから処理結果をJavaScript側に同期する。
    - 引数: なし
    - 戻り値: なし
    - 機能: 推定周波数、類似度スコア、FFTデータなどWASMで計算された結果をJavaScript側で取得し、UI更新などに利用する。
- **processFrame(timeDomainData, frequencyData, sampleRate, fftSize, bufferSizeMultiplier)** (dist/assets/index-R-ZInwxZ.js, dist/wasm/wasm_processor.js):
    - 役割: 単一の音声フレームを処理し、周波数推定や波形分析を行う。
    - 引数: `timeDomainData`: Float32Array（時間領域データ）、`frequencyData`: Uint8Array（周波数データ）、`sampleRate`: サンプルレート、`fftSize`: FFTサイズ、`bufferSizeMultiplier`: バッファサイズ乗数。
    - 戻り値: なし
    - 機能: WASM内で主要な音声処理アルゴリズムを実行する。
- **updatePhaseOffsetHistory()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 位相オフセット履歴を更新する。
    - 引数: なし
    - 戻り値: なし
    - 機能: 位相マーカー表示などに利用する波形の位相履歴を記録する。
- **render()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: アプリケーション全体の描画処理をトリガーする。
    - 引数: なし
    - 戻り値: なし
    - 機能: requestAnimationFrameループ内で呼び出され、毎フレームの描画を実行する。
- **renderFrame()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 単一フレームの描画ロジックを実行する。
    - 引数: なし
    - 戻り値: なし
    - 機能: 波形、グリッド、オーバーレイ、UI要素など、1フレームに必要なすべての描画処理を行う。
- **getIsRunning()** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: オシロスコープが現在動作中であるかを取得する。
    - 引数: なし
    - 戻り値: boolean
    - 機能: 音声入力がアクティブで、描画ループが実行中であるかを確認する。
- **getSimilarityScore()** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: 現在の波形類似度スコアを取得する。
    - 引数: なし
    - 戻り値: number
    - 機能: WaveformDataProcessorが計算した波形間の類似度を返す。
- **isSimilaritySearchActive()** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: 波形類似度検索機能がアクティブであるかを取得する。
    - 引数: なし
    - 戻り値: boolean
    - 機能: 波形比較パネルが表示され、類似度計算が行われているかを確認する。
- **setPauseDrawing(paused)** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: 描画の一時停止/再開を設定する。
    - 引数: `paused`: boolean（一時停止するか否か）。
    - 戻り値: なし
    - 機能: ユーザー操作により描画ループを一時停止または再開する。
- **getPauseDrawing()** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: 描画が一時停止中であるかを取得する。
    - 引数: なし
    - 戻り値: boolean
    - 機能: 描画ループの現在のポーズ状態を返す。
- **setPhaseMarkerRangeEnabled(enabled)** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: 位相マーカーの範囲表示の有効/無効を設定する。
    - 引数: `enabled`: boolean。
    - 戻り値: なし
    - 機能: 波形上の特定の位相範囲を示すマーカーの表示を制御する。
- **getPhaseMarkerRangeEnabled()** (dist/assets/index-R-ZInwxZ.js, src/Oscilloscope.ts):
    - 役割: 位相マーカーの範囲表示が有効になっているかを取得する。
    - 引数: なし
    - 戻り値: boolean
    - 機能: 位相マーカー範囲表示の現在の状態を返す。
- **frequencyToNoteInfo(frequency)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 周波数から音符情報を計算する。
    - 引数: `frequency`: number（周波数）。
    - 戻り値: オブジェクト（音名、オクターブ、セント値など）
    - 機能: 検出された周波数を音楽的な音符に変換し、ピアノ鍵盤表示などに利用する。
- **calculateKeyboardRange(minFreq, maxFreq)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 検出可能な周波数範囲に基づいてピアノ鍵盤の表示範囲を計算する。
    - 引数: `minFreq`: 最小周波数、`maxFreq`: 最大周波数。
    - 戻り値: オブジェクト（開始音符、終了音符など）
    - 機能: ピアノ鍵盤UIがどの音域を表示すべきかを決定する。
- **countWhiteKeys(startNote, endNote)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 指定された音符範囲内の白鍵の数を数える。
    - 引数: `startNote`: 開始音符、`endNote`: 終了音符。
    - 戻り値: number
    - 機能: ピアノ鍵盤UIの描画レイアウト計算に使用する。
- **calculateCenteringOffset(containerWidth, keyboardWidth)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: ピアノ鍵盤を中央に配置するためのオフセットを計算する。
    - 引数: `containerWidth`: コンテナの幅、`keyboardWidth`: 鍵盤の幅。
    - 戻り値: number
    - 機能: ピアノ鍵盤の水平方向の配置を調整する。
- **getElement(selector)** (dist/assets/index-R-ZInwxZ.js, src/DOMElementManager.ts):
    - 役割: 指定されたCSSセレクタに一致するDOM要素を取得する。
    - 引数: `selector`: string（CSSセレクタ）。
    - 戻り値: HTMLElement | null
    - 機能: UI要素への参照を安全に取得する。
- **validateElements(elements)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: 取得したDOM要素が有効であるかを確認する。
    - 引数: `elements`: HTMLElement[]。
    - 戻り値: boolean
    - 機能: 必要なUI要素がすべてDOM上に存在するかをチェックし、エラーを防ぐ。
- **update()** (dist/assets/index-R-ZInwxZ.js, src/DisplayUpdater.ts):
    - 役割: UIの表示を更新する。
    - 引数: なし
    - 戻り値: なし
    - 機能: 周波数、ゲイン、類似度などの情報を画面に反映させる。
- **updateFrequencyDisplay(frequency)** (dist/assets/index-R-ZInwxZ.js, src/DisplayUpdater.ts):
    - 役割: 周波数表示を更新する。
    - 引数: `frequency`: number（検出された周波数）。
    - 戻り値: なし
    - 機能: 検出された周波数をUIのテキスト要素に表示する。
- **updateGainDisplay(gain)** (dist/assets/index-R-ZInwxZ.js, src/DisplayUpdater.ts):
    - 役割: ゲイン表示を更新する。
    - 引数: `gain`: number（現在のゲイン値）。
    - 戻り値: なし
    - 機能: 現在のゲイン値をUIのテキスト要素に表示する。
- **updateSimilarityDisplay(similarity)** (dist/assets/index-R-ZInwxZ.js, src/DisplayUpdater.ts):
    - 役割: 類似度表示を更新する。
    - 引数: `similarity`: number（波形類似度スコア）。
    - 戻り値: なし
    - 機能: 波形比較パネルに類似度スコアを表示する。
- **clearDisplays()** (dist/assets/index-R-ZInwxZ.js, src/DisplayUpdater.ts):
    - 役割: すべての表示要素をクリアする。
    - 引数: なし
    - 戻り値: なし
    - 機能: 周波数、ゲイン、類似度などの表示をリセットする。
- **setupEventHandlers()** (dist/assets/index-R-ZInwxZ.js, src/UIEventHandlers.ts):
    - 役割: UIのイベントハンドラを設定する。
    - 引数: なし
    - 戻り値: なし
    - 機能: ボタンクリック、スライダー変更、ファイル入力などのイベントリスナーを登録する。
- **initializeUIState()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: UIの初期状態を設定する。
    - 引数: なし
    - 戻り値: なし
    - 機能: アプリケーション起動時に、各UI要素のデフォルト値や表示状態を設定する。
- **setupCheckboxHandlers()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: チェックボックスのイベントハンドラを設定する。
    - 引数: なし
    - 戻り値: なし
    - 機能: 自動ゲイン、ノイズゲート、デバッグオーバーレイなどのチェックボックスの変更を処理する。
- **setupSliderHandlers()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: スライダーのイベントハンドラを設定する。
    - 引数: なし
    - 戻り値: なし
    - 機能: ノイズゲート閾値、バッファサイズ乗数などのスライダーの変更を処理する。
- **setupSelectHandlers()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: セレクトボックスのイベントハンドラを設定する。
    - 引数: なし
    - 戻り値: なし
    - 機能: 周波数推定方法などのセレクトボックスの変更を処理する。
- **setupButtonHandlers()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: ボタンのイベントハンドラを設定する。
    - 引数: なし
    - 戻り値: なし
    - 機能: 開始/停止、一時停止、リセットなどのボタンクリックを処理する。
- **setupFileInputHandler()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: ファイル入力要素のイベントハンドラを設定する。
    - 引数: なし
    - 戻り値: なし
    - 機能: WAVファイルなどのオーディオファイルが選択された際の処理を行う。
- **handleStartStopButton()** (dist/assets/index-R-ZInwxZ.js, src/UIEventHandlers.ts):
    - 役割: 開始/停止ボタンのクリックを処理する。
    - 引数: なし
    - 戻り値: Promise<void>
    - 機能: オシロスコープの開始または停止を切り替える。
- **handleFileInput(event)** (dist/assets/index-R-ZInwxZ.js, src/UIEventHandlers.ts):
    - 役割: ファイル入力イベントを処理し、選択されたオーディオファイルをロードする。
    - 引数: `event`: Eventオブジェクト（ファイル入力イベント）。
    - 戻り値: Promise<void>
    - 機能: ユーザーが選択したWAVファイルを読み込み、可視化処理を開始する。
- **sliderValueToThreshold(value)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: スライダーの値をノイズゲート閾値（dB）に変換する。
    - 引数: `value`: number（スライダーの生の数値）。
    - 戻り値: number（dB値）
    - 機能: UIのスライダー入力値を内部ロジックで利用可能なdB値に変換する。
- **formatThresholdDisplay(threshold)** (dist/assets/index-R-ZInwxZ.js):
    - 役割: ノイズゲート閾値（dB）を整形して表示する。
    - 引数: `threshold`: number（dB値）。
    - 戻り値: string
    - 機能: dB値を読みやすい形式の文字列としてUIに表示する。
- **updateCycleSimilarityPanelDisplay()** (dist/assets/index-R-ZInwxZ.js):
    - 役割: サイクル類似度パネルの表示を更新する。
    - 引数: なし
    - 戻り値: なし
    - 機能: 比較パネルにサイクル類似度関連の情報を表示する。
- **dbToAmplitude(db)** (dist/utils.d.ts, src/utils.ts):
    - 役割: デシベル(dB)値を振幅値に変換する。
    - 引数: `db`: number（デシベル値）。
    - 戻り値: number（振幅値）
    - 機能: 音量レベルを線形スケールの振幅に変換する。
- **amplitudeToDb(amplitude)** (dist/utils.d.ts, src/utils.ts):
    - 役割: 振幅値をデシベル(dB)値に変換する。
    - 引数: `amplitude`: number（振幅値）。
    - 戻り値: number（デシベル値）
    - 機能: 線形スケールの振幅を対数スケールの音量レベルに変換する。
- **frequencyToNote(frequency)** (dist/utils.d.ts, src/utils.ts):
    - 役割: 周波数を音楽的な音符情報に変換する。
    - 引数: `frequency`: number（周波数）。
    - 戻り値: オブジェクト（`note`: 音名, `octave`: オクターブ, `cents`: セント値）
    - 機能: 検出された周波数に対応する最も近い音名、オクターブ、セント単位でのずれを計算する。
- **trimSilence(buffer, threshold, minLength)** (dist/utils.d.ts, src/utils.ts):
    - 役割: 音声バッファの先頭と末尾の無音部分をトリミングする。
    - 引数: `buffer`: Float32Array（音声データ）、`threshold`: number（無音と判断する振幅閾値）、`minLength`: number（残す最小の長さ）。
    - 戻り値: Float32Array（トリミング後の音声データ）
    - 機能: 無音部分を削除し、実際の音声データのみを抽出する。
- **cleanup()** (src/WasmModuleLoader.ts):
    - 役割: WebAssemblyモジュールのリソースをクリーンアップする。
    - 引数: なし
    - 戻り値: なし
    - 機能: WASMモジュールのインスタンスを解放し、メモリリークを防ぐ。
- **createMediaStreamSource()** (src/__tests__/dom-integration.test.ts, src/__tests__/oscilloscope.test.ts):
    - 役割: テスト用のダミーMediaStreamSourceNodeを作成する。
    - 引数: なし
    - 戻り値: MediaStreamAudioSourceNode
    - 機能: Web Audio APIのMediaStreamAudioSourceNodeをシミュレートし、マイク入力などのテストに使用する。
- **createAnalyser()** (src/__tests__/dom-integration.test.ts, src/__tests__/oscilloscope.test.ts):
    - 役割: テスト用のダミーAnalyserNodeを作成する。
    - 引数: なし
    - 戻り値: AnalyserNode
    - 機能: Web Audio APIのAnalyserNodeをシミュレートし、音声解析のテストに使用する。
- **close()** (src/__tests__/dom-integration.test.ts, src/__tests__/oscilloscope.test.ts):
    - 役割: テスト用のMediaStreamをクローズする。
    - 引数: なし
    - 戻り値: なし
    - 機能: テスト完了後にMediaStreamのリソースを解放する。
- **getTracks()** (src/__tests__/dom-integration.test.ts, src/__tests__/oscilloscope.test.ts):
    - 役割: テスト用のMediaStreamからトラックリストを取得する。
    - 引数: なし
    - 戻り値: MediaStreamTrack[]
    - 機能: MediaStreamの内部にあるオーディオ/ビデオトラックをシミュレートする。
- **normalize(arr)** (src/__tests__/normalized-harmonics-issue197.test.ts):
    - 役割: 配列の値を正規化する。
    - 引数: `arr`: number[]（数値の配列）。
    - 戻り値: number[]（正規化された配列）
    - 機能: データセットの最大値に基づいて、すべての値を0から1の範囲にスケーリングする。
- **createSilentMockAudioContext()** (src/__tests__/oscilloscope.test.ts):
    - 役割: テスト用のサイレントなMock AudioContextを作成する。
    - 引数: なし
    - 戻り値: AudioContext
    - 機能: 音声処理が実際に行われない状態で、AudioContextの機能をテストする。
- **getFFTOverlayDimensions()** (src/__tests__/oscilloscope.test.ts):
    - 役割: FFTオーバーレイの寸法を計算し取得する。
    - 引数: なし
    - 戻り値: オブジェクト（寸法情報）
    - 機能: FFTオーバーレイの描画領域サイズを決定するためのテストヘルパー。
- **findFFTOverlayBorderCall()** (src/__tests__/oscilloscope.test.ts):
    - 役割: FFTオーバーレイの境界線描画コールを検索する。
    - 引数: なし
    - 戻り値: オブジェクト（描画コール情報）
    - 機能: テストにおいて、FFTオーバーレイが適切に描画されているかを確認するために利用する。
- **getAudioTracks()** (src/__tests__/oscilloscope.test.ts):
    - 役割: テスト用のMediaStreamからオーディオトラックを取得する。
    - 引数: なし
    - 戻り値: MediaStreamTrack[]
    - 機能: MediaStreamのオーディオトラックをシミュレートする。
- **getVideoTracks()** (src/__tests__/oscilloscope.test.ts):
    - 役割: テスト用のMediaStreamからビデオトラックを取得する。
    - 引数: なし
    - 戻り値: MediaStreamTrack[]
    - 機能: MediaStreamのビデオトラックをシミュレートする。
- **stop()** (src/__tests__/oscilloscope.test.ts):
    - 役割: テスト用のMediaStreamTrackを停止する。
    - 引数: なし
    - 戻り値: なし
    - 機能: テスト完了後にMediaStreamTrackのリソースを解放する。
- **takeScreenshot(page, path)** (scripts/screenshot-local.js):
    - 役割: Playwrightを使用してWebページのスクリーンショットを撮影する。
    - 引数: `page`: PlaywrightのPageオブジェクト、`path`: スクリーンショットの保存パス。
    - 戻り値: Promise<void>
    - 機能: アプリケーションのUI状態を画像として保存し、視覚的なテストやドキュメント作成に利用する。
- **resolveValue(value, containerSize)** (dist/OverlayLayout.d.ts, src/OverlayLayout.ts):
    - 役割: レイアウト定義の値を絶対ピクセル値に解決する。
    - 引数: `value`: string | number（レイアウト値、例: "50%", 100）、`containerSize`: number（コンテナのサイズ）。
    - 戻り値: number（解決されたピクセル値）
    - 機能: CSS風のパーセンテージ指定などを実際のピクセル値に変換し、描画レイアウト計算に利用する。

## 関数呼び出し階層ツリー
```
- initSync (dist/wasm/wasm_processor.d.ts)
  - t (dist/assets/index-R-ZInwxZ.js)
    - i ()
    - L ()
    - K ()
    - k ()
    - Y ()
    - R ()
    - d ()
    - r ()
    - initializeAnalyser ()
    - start ()
    - startFromFile ()
    - startFromBuffer ()
    - stop ()
    - getTimeDomainData ()
    - updateFrameBufferHistory ()
    - getExtendedTimeDomainData ()
    - clearFrameBufferHistory ()
    - getFrequencyData ()
    - getSampleRate ()
    - getFFTSize ()
    - getFrequencyBinCount ()
    - isReady ()
    - setAutoGain ()
    - getAutoGainEnabled ()
    - setNoiseGate ()
    - getNoiseGateEnabled ()
    - setNoiseGateThreshold ()
    - getNoiseGateThreshold ()
    - getCurrentGain ()
    - clearHistory ()
    - setFrequencyEstimationMethod ()
    - getFrequencyEstimationMethod ()
    - setBufferSizeMultiplier ()
    - getBufferSizeMultiplier ()
    - getEstimatedFrequency ()
    - getMinFrequency ()
    - getMaxFrequency ()
    - getFrequencyPlotHistory ()
    - updateDimensions ()
    - calculateOverlayDimensions ()
    - drawGrid ()
    - drawGridLabels ()
    - drawWaveform ()
    - drawFFTOverlay ()
    - drawHarmonicAnalysis ()
    - drawFrequencyPlot ()
    - setDebugOverlaysEnabled ()
    - drawPhaseMarkers ()
    - clearAndDrawGrid ()
    - updateRendererDimensions ()
    - setFFTDisplay ()
    - getFFTDisplayEnabled ()
    - setHarmonicAnalysisEnabled ()
    - getHarmonicAnalysisEnabled ()
    - getDebugOverlaysEnabled ()
    - setOverlaysLayout ()
    - getOverlaysLayout ()
    - setUsePeakMode ()
    - getUsePeakMode ()
    - setZeroCrossMode ()
    - getZeroCrossMode ()
    - reset ()
    - getLastSimilarity ()
    - hasPreviousWaveform ()
    - getPreviousWaveform ()
    - clearAllCanvases ()
    - clearCanvas ()
    - findPeakAmplitude ()
    - drawCenterLine ()
    - drawSimilarityText ()
    - drawSimilarityPlot ()
    - drawPositionMarkers ()
    - drawOffsetOverlayGraphs ()
    - updatePanels ()
    - clear ()
    - drawSimilarityGraph ()
    - updateGraphs ()
    - getBasePath ()
    - getBasePathFromScripts ()
    - loadWasmModule ()
    - getProcessor ()
    - initialize ()
    - syncConfigToWasm ()
    - syncResultsFromWasm ()
    - processFrame ()
    - updatePhaseOffsetHistory ()
    - render ()
    - renderFrame ()
    - getIsRunning ()
    - getSimilarityScore ()
    - isSimilaritySearchActive ()
    - setPauseDrawing ()
    - getPauseDrawing ()
    - setPhaseMarkerRangeEnabled ()
    - getPhaseMarkerRangeEnabled ()
    - frequencyToNoteInfo ()
    - calculateKeyboardRange ()
    - countWhiteKeys ()
    - calculateCenteringOffset ()
    - getElement ()
    - validateElements ()
    - update ()
    - updateFrequencyDisplay ()
    - updateGainDisplay ()
    - updateSimilarityDisplay ()
    - clearDisplays ()
    - setupEventHandlers ()
    - initializeUIState ()
    - setupCheckboxHandlers ()
    - setupSliderHandlers ()
    - setupSelectHandlers ()
    - setupButtonHandlers ()
    - setupFileInputHandler ()
    - handleStartStopButton ()
    - handleFileInput ()
    - sliderValueToThreshold ()
    - formatThresholdDisplay ()
    - updateCycleSimilarityPanelDisplay ()
- __wbg_get_imports (dist/wasm/wasm_processor.js)
- drawOffsetLine (src/ComparisonPanelRenderer.ts)
- handleLoad (src/WasmModuleLoader.ts)
- createAudioBuffer (src/__tests__/utils.test.ts)
- calculateWeightedScore (src/__tests__/weighted-harmonic-issue195.test.ts)
- drawVerticalLine (src/renderers/PhaseMarkerRenderer.ts)
- dbToAmplitude (dist/utils.d.ts)
- amplitudeToDb (dist/utils.d.ts)
- frequencyToNote (dist/utils.d.ts)
- trimSilence (dist/utils.d.ts)
- cleanup (src/WasmModuleLoader.ts)
- createMediaStreamSource (src/__tests__/dom-integration.test.ts)
- createAnalyser (src/__tests__/dom-integration.test.ts)
- close (src/__tests__/dom-integration.test.ts)
- getTracks (src/__tests__/dom-integration.test.ts)
- normalize (src/__tests__/normalized-harmonics-issue197.test.ts)
- createSilentMockAudioContext (src/__tests__/oscilloscope.test.ts)
- getFFTOverlayDimensions (src/__tests__/oscilloscope.test.ts)
- findFFTOverlayBorderCall (src/__tests__/oscilloscope.test.ts)
- getAudioTracks (src/__tests__/oscilloscope.test.ts)
- getVideoTracks (src/__tests__/oscilloscope.test.ts)
- stop (src/__tests__/oscilloscope.test.ts)
- takeScreenshot (scripts/screenshot-local.js)
- resolveValue (dist/OverlayLayout.d.ts)

---
Generated at: 2026-02-04 07:16:09 JST
