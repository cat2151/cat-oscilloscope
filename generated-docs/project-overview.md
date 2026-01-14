Last updated: 2026-01-15

# Project Overview

## プロジェクト概要
-   ブラウザ上で動作する高機能なオシロスコープ風波形ビジュアライザーです。
-   Rust/WASMにより高速なデータ処理を実現し、マイク入力やWAVファイルから音声をリアルタイムで可視化します。
-   多様な周波数推定アルゴリズムやアライメントモード、ピアノ鍵盤表示などの豊富な機能を備え、オーディオ分析を支援します。

## 技術スタック
cat-oscilloscopeプロジェクトで利用されている主要な技術スタックをカテゴリ別に整理して説明します。

-   **フロントエンド**:
    -   **TypeScript**: 型安全なJavaScriptのスーパーセットであり、大規模なアプリケーション開発におけるコードの信頼性と保守性を高めます。
    -   **Web Audio API**: ブラウザでオーディオを処理・生成するためのJavaScript API。マイク入力の取得、オーディオファイルのデコード、リアルタイムの音声分析などに利用されます。
    -   **HTML Canvas**: JavaScriptを使用して2Dグラフィックスを描画するためのHTML要素。波形の描画やFFTスペクトラム、ピアノ鍵盤の表示など、すべての視覚化を担当します。
-   **音楽・オーディオ**:
    -   **Web Audio API**: (フロントエンドと重複しますが、音声処理の中心であるため再掲) 音声のキャプチャ、リアルタイム分析、バッファ管理など、オーディオ関連のコア機能を提供します。
    -   **Rust/WASM (WebAssembly)**: 複雑な波形データ処理アルゴリズム（周波数推定、ゼロクロス検出、位相アライメントなど）は、Rustで実装され、WebAssemblyとしてブラウザで高速に実行されます。これにより、高性能なリアルタイム処理が実現されます。
-   **開発ツール**:
    -   **Vite**: 高速な開発サーバーとバンドルツール。JavaScript/TypeScriptプロジェクトのセットアップと開発体験を大幅に向上させます。
    -   **Node.js**: JavaScriptランタイム環境。開発サーバーの実行、ビルドスクリプト、パッケージ管理など、開発ワークフローの基盤となります。
    -   **npm**: Node.jsのパッケージマネージャー。プロジェクトの依存関係の管理とインストールに使用されます。
    -   **wasm-pack**: RustコードをWebAssemblyにコンパイルし、Webフレンドリーな形式でパッケージ化するためのツール。
-   **テスト**:
    -   **Vitest**: Viteをベースとした高速なユニットテストフレームワーク。JavaScript/TypeScriptコードのテストを実行します。
    -   **Happy DOM**: Vitestのテスト環境として使用され、ブラウザ環境をシミュレートしてDOM操作を含むコンポーネントのテストを可能にします。
-   **ビルドツール**:
    -   **Vite**: (開発ツールと重複しますが、ビルドプロセスを担当するため再掲) 本番環境向けの最適化されたJavaScript/TypeScriptバンドルを生成します。
    -   **wasm-pack**: (開発ツールと重複しますが、WASMのビルドプロセスを担当するため再掲) RustコードからWASMバイナリとそれに対応するJavaScriptグルーコードを生成します。
-   **言語機能**:
    -   **TypeScript**: (フロントエンドと重複しますが、言語仕様として再掲) 型安全性を提供し、大規模なコードベースのメンテナンス性と品質を向上させます。
    -   **Rust**: メモリ安全性と高いパフォーマンスを特徴とするシステムプログラミング言語。データ処理アルゴリズムの実装に用いられ、WASMとしてWeb上で実行されます。
-   **自動化・CI/CD**:
    -   **cross-env**: 環境変数をクロスプラットフォームで設定するためのユーティリティ。開発スクリプトやCI/CDパイプラインでの環境設定を簡素化します。
    -   **vite-plugin-dts**: ViteプラグインとしてTypeScriptの型定義ファイルを自動生成します。これにより、ライブラリとして提供する際の型定義の管理が自動化され、開発者の利便性が向上します。
-   **開発標準**:
    -   **ESM/CJS**: JavaScriptのモジュールシステム（ECMAScript Modules / CommonJS）。ライブラリとして提供される際に両方のモジュール形式をサポートし、幅広いプロジェクトで利用可能にします。
    -   **TypeScript**: (言語機能と重複しますが、コード品質標準として再掲) 厳格な型チェックにより、コードの信頼性と統一性を保ちます。

## ファイル階層ツリー
```
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
  📖 153.md
  📖 155.md
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
  📘 BufferSource.ts
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
    📘 BufferSource.test.ts
    📘 algorithms.test.ts
    📘 alignment-mode.test.ts
    📘 comparison-panel-renderer.test.ts
    📘 dom-integration.test.ts
    📘 library-exports.test.ts
    📘 oscilloscope.test.ts
    📘 piano-keyboard-renderer.test.ts
    📘 startFromBuffer.test.ts
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
```

## ファイル詳細説明
-   **CONSOLIDATION_SUMMARY.md**: プロジェクトの機能統合に関する概要ドキュメント。
-   **IMPLEMENTATION_NOTES_117.md**: 特定の実装に関する詳細なメモ。
-   **IMPLEMENTATION_SUMMARY.md**: プロジェクト全体の実装概要をまとめたドキュメント。
-   **LIBRARY_USAGE.md**: `cat-oscilloscope`をnpmライブラリとして他のプロジェクトで使用する方法を説明するドキュメント。
-   **LICENSE**: プロジェクトのライセンス情報（MITライセンス）を記載したファイル。
-   **README.ja.md**: プロジェクトの日本語版概要説明ファイル。
-   **README.md**: プロジェクトの英語版概要説明ファイル。
-   **REFACTORING_SUMMARY.md**: コードのリファクタリングに関する概要ドキュメント。
-   **TESTING.md**: プロジェクトのテスト方法とテスト戦略に関する詳細ドキュメント。
-   **_config.yml**: GitHub Pagesなどの設定ファイル。
-   **docs/PHASE_ALIGNMENT.md**: Phase Alignment Modeに関する詳細な技術ドキュメント。
-   **example-library-usage.html**: `cat-oscilloscope`ライブラリをHTMLページでどのように使用するかを示す具体的なサンプルファイル。
-   **generated-docs/**: 自動生成されたドキュメントを格納するディレクトリ。
-   **index.html**: アプリケーションのメインエントリポイントとなるHTMLファイル。ユーザーインターフェースの骨格と、JavaScriptアプリケーションの読み込みを定義します。
-   **issue-notes/**: 各種issueに関する詳細なメモや解決策が記録されたドキュメント群。
-   **package-lock.json**: `package.json`で定義された依存関係の正確なバージョンを記録し、ビルドの再現性を保証するファイル。
-   **package.json**: プロジェクトのメタデータ（名前、バージョン、依存関係、スクリプトなど）を定義するファイル。
-   **public/wasm/package.json**: WASMモジュール用のパッケージ情報ファイル。
-   **public/wasm/wasm_processor.d.ts**: Rustで記述されたWASMモジュールのTypeScript型定義ファイル。TypeScriptコードからWASM関数を型安全に呼び出すために使用されます。
-   **public/wasm/wasm_processor.js**: RustでビルドされたWASMモジュールをWebブラウザで読み込み、実行するためのJavaScriptグルーコード。WASMバイナリとJavaScript間のインターフェースを提供します。
-   **public/wasm/wasm_processor_bg.wasm**: Rustコードからコンパイルされたバイナリ形式のWebAssemblyモジュール本体。主要なデータ処理アルゴリズムを含みます。
-   **public/wasm/wasm_processor_bg.wasm.d.ts**: WASMバイナリの内部的な型定義。通常、直接使用されることはありません。
-   **src/AudioManager.ts**: 音声入力（マイク、ファイル、バッファ）の管理とWeb Audio APIの操作を担当します。音声データの取得と処理パイプラインへの供給を行います。
-   **src/BufferSource.ts**: 静的オーディオバッファを管理し、ループ再生などの機能を提供するクラス。`wavlpf`などの外部オーディオ処理ライブラリとの連携に最適化されています。
-   **src/ComparisonPanelRenderer.ts**: 波形比較パネルの描画を担当するクラス。前回と今回の波形の類似度を視覚的にリアルタイム表示します。
-   **src/FrequencyEstimator.ts**: 周波数推定アルゴリズムの種類を定義する列挙型や関連ロジックを含むファイル。複数の周波数推定方式を切り替えるためのインターフェースを提供します。
-   **src/GainController.ts**: 波形の自動ゲイン調整ロジックを管理するクラス。表示される波形の振幅を適切に保ち、見やすく調整します。
-   **src/Oscilloscope.ts**: オシロスコープアプリケーション全体の主要な制御クラス。AudioManager、Renderer、データプロセッサーなど各種コンポーネントを統合し、アプリケーションのライフサイクル（開始、停止、設定変更）を管理します。
-   **src/PianoKeyboardRenderer.ts**: 検出された周波数をピアノ鍵盤上に表示する描画ロジックを実装するクラス。音高を視覚的に理解しやすくします。
-   **src/WaveformDataProcessor.ts**: WASMモジュールとの連携を含む、主要な波形データ処理ロジックを担当するクラス。音声バッファから表示用の波形データを生成し、WASM関数を呼び出して分析を実行します。
-   **src/WaveformRenderData.ts**: レンダリングに必要な波形データ構造を定義するインターフェースや型定義を含むファイル。
-   **src/WaveformRenderer.ts**: HTML Canvas要素に波形データを描画するクラス。ズーム、スクロール、FFTスペクトラムのオーバーレイなど、様々な波形描画機能を担当します。
-   **src/WaveformSearcher.ts**: 波形内で特定のパターンや特徴点（例：ゼロクロス点）を探索するためのロジックを定義するファイル。主にWASMモジュール内で利用されます。
-   **src/ZeroCrossDetector.ts**: 波形の安定した表示のためにゼロクロス点を特定するロジックを定義するファイル。
-   **src/__tests__/**: プロジェクトのテストファイル群を格納するディレクトリ。各コンポーネントやアルゴリズムの単体テスト、統合テストが含まれます。
-   **src/index.ts**: `cat-oscilloscope`をnpmライブラリとして公開する際のエントリポイント。`Oscilloscope`や`BufferSource`クラスなどを外部にエクスポートします。
-   **src/main.ts**: アプリケーションの初期化とUIイベントハンドリングを定義するメインスクリプト。HTML要素とアプリケーションロジックを連結し、ユーザーインタラクションを処理します。
-   **src/utils.ts**: プロジェクト全体で利用される汎用的なユーティリティ関数（例：dB変換、周波数から音符への変換、波形トリミングなど）をまとめたファイル。
-   **tsconfig.json**: TypeScriptコンパイラのプロジェクト設定ファイル。
-   **tsconfig.lib.json**: ライブラリとしてビルドする際のTypeScriptコンパイラ設定ファイル。
-   **vite.config.ts**: Viteビルドツールの設定ファイル。プロジェクトのビルド方法、プラグイン、エイリアスなどを定義します。
-   **wasm-processor/Cargo.toml**: Rustプロジェクトの依存関係とメタデータを定義するファイル。
-   **wasm-processor/src/frequency_estimator.rs**: Rustで実装された周波数推定アルゴリズムのロジック。
-   **wasm-processor/src/gain_controller.rs**: Rustで実装されたゲイン制御ロジック。
-   **wasm-processor/src/lib.rs**: Rust WASMモジュールのメインライブラリファイル。JavaScriptから呼び出されるWASM関数のエントリポイントを定義します。
-   **wasm-processor/src/phase_detector.rs**: Rustで実装された位相検出ロジック。Phase Alignment Modeの核心部分を担います。
-   **wasm-processor/src/waveform_searcher.rs**: Rustで実装された波形探索アルゴリズム。
-   **wasm-processor/src/zero_cross_detector.rs**: Rustで実装されたゼロクロス検出アルゴリズム。

## 関数詳細説明
-   **getArrayF32FromWasm0 (public/wasm/wasm_processor.js)**
    -   役割: WASMメモリからFloat32Arrayを効率的に取得するための内部ヘルパー関数。
    -   引数: WASMメモリ内のデータ開始ポインタとバイト数。
    -   戻り値: Float32Array。
    -   機能: WASMモジュールで処理された数値データをJavaScript側で利用可能な形式に変換します。
-   **initSync (public/wasm/wasm_processor.js)**
    -   役割: WASMモジュールを同期的に初期化する関数。
    -   引数: WASMモジュールのソース（通常はバイナリデータ）。
    -   戻り値: 初期化されたWASMインスタンス。
    -   機能: アプリケーション起動時にWASMコードをロードし、JavaScriptから呼び出し可能な状態に設定します。
-   **__wbg_init (public/wasm/wasm_processor.js)**
    -   役割: WASMバインディングの内部的な初期化処理を実行する関数。
    -   引数: WASMモジュールのソース。
    -   戻り値: Promise (非同期) または WASMインスタンス (同期)。
    -   機能: WASMのランタイム環境をセットアップし、JavaScriptとWASM間の通信メカニズムを確立します。
-   **start (src/AudioManager.ts, src/Oscilloscope.ts)**
    -   役割: オシロスコープのリアルタイム音声入力処理と描画を開始する。
    -   引数: なし (Oscilloscope.start)、またはWeb Audio ContextのMediaStreamSourceノード (AudioManager.start)。
    -   戻り値: Promise<void>。
    -   機能: マイクからの音声ストリームをWeb Audio APIを通じて取得し、分析・描画パイプラインに接続します。
-   **startFromFile (src/AudioManager.ts, src/Oscilloscope.ts)**
    -   役割: 指定されたWAVファイルからの音声処理と描画を開始する。
    -   引数: ファイルのURLまたはBlobオブジェクト。
    -   戻り値: Promise<void>。
    -   機能: オーディオファイルを読み込み、その音声データを分析・描画パイプラインに供給します。
-   **startFromBuffer (src/AudioManager.ts, src/Oscilloscope.ts)**
    -   役割: 既存のオーディオバッファ（Float32Array）からの音声処理と描画を開始する。
    -   引数: BufferSourceインスタンス。
    -   戻り値: Promise<void>。
    -   機能: 静的な音声データをループ再生しながらリアルタイム処理・描画を行います。外部オーディオ処理ライブラリとの連携に利用されます。
-   **stop (src/AudioManager.ts, src/Oscilloscope.ts)**
    -   役割: 現在の音声入力と描画を停止する。
    -   引数: なし。
    -   戻り値: void。
    -   機能: Web Audio APIのリソースを解放し、メインの描画・処理ループを停止してアプリケーションを一時停止または終了します。
-   **constructor (src/BufferSource.ts, src/ComparisonPanelRenderer.ts, src/Oscilloscope.ts, src/PianoKeyboardRenderer.ts, src/WaveformDataProcessor.ts, src/WaveformRenderer.ts)**
    -   役割: 各クラスのインスタンスを初期化する。
    -   機能: クラスの種類に応じて、必要な設定、Canvasコンテキスト、または他の依存コンポーネンスを受け取り、オブジェクトの初期状態を設定します。
-   **reset (public/wasm/wasm_processor.js)**
    -   役割: WASMモジュールの内部状態（例: 履歴バッファ）をリセットする。
    -   引数: なし。
    -   戻り値: void。
    -   機能: 新しい音声ストリームを開始する際などに、過去のデータによる影響をクリアし、クリーンな状態から処理を開始できるようにします。
-   **processFrame (public/wasm/wasm_processor.js)**
    -   役割: WASM側で単一のオーディオフレームを処理する主要な関数。
    -   引数: 生のオーディオデータ（Float32Array）、サンプルレート、各種設定（周波数推定方法、バッファサイズ、アライメントモードなど）。
    -   戻り値: 処理結果（推定周波数、表示用波形データ、類似度など）を含むオブジェクト。
    -   機能: 周波数推定、波形アライメント、ゲイン制御、ノイズゲート処理など、主要なデータ処理アルゴリズムを実行し、表示に必要なデータを生成します。
-   **setAutoGain, setNoiseGate, setUsePeakMode, setAlignmentMode, setNoiseGateThreshold, setBufferSizeMultiplier, setFrequencyEstimationMethod (public/wasm/wasm_processor.js)**
    -   役割: WASMモジュール内の各種設定パラメータをJavaScriptから変更するための関数群。
    -   引数: 各設定に対応するブール値、数値、または列挙型の値。
    -   戻り値: void。
    -   機能: ユーザーインターフェースからの操作に基づいて、オシロスコープの動作設定（自動ゲインの有無、ノイズゲート閾値、アライメントモード、周波数推定方法など）をリアルタイムに変更します。
-   **similarity (public/wasm/wasm_processor.js)**
    -   役割: 2つの波形の類似度を計算するWASM内部関数。
    -   引数: 波形データ。
    -   戻り値: 類似度を示す数値。
    -   機能: 波形比較パネルで、現在の波形と前回の波形の類似度を計算するために利用されます。
-   **dbToAmplitude (src/utils.ts)**
    -   役割: デシベル値（音量レベル）をリニアな振幅値に変換する。
    -   引数: デシベル値。
    -   戻り値: 振幅値（0から1の範囲）。
    -   機能: UIの表示や内部計算で音量レベルをデシベルと振幅の間で変換する際に使用します。
-   **amplitudeToDb (src/utils.ts)**
    -   役割: リニアな振幅値をデシベル値（音量レベル）に変換する。
    -   引数: 振幅値。
    -   戻り値: デシベル値。
    -   機能: UIの表示や内部計算で音量レベルをデシベルと振幅の間で変換する際に使用します。
-   **frequencyToNote (src/utils.ts)**
    -   役割: 周波数値に最も近い音符名（例: "A4", "C#5"）を判定する。
    -   引数: 周波数値（Hz）。
    -   戻り値: 音符名を表す文字列。
    -   機能: ピアノ鍵盤表示で検出された周波数を視覚的に音符として表示するために使用されます。
-   **trimSilence (src/utils.ts)**
    -   役割: 音声データの先頭と末尾にある無音部分を検出し、その部分を削除してデータを短縮する。
    -   引数: Float32Arrayの音声データ、無音と判断する閾値。
    -   戻り値: トリミングされたFloat32Array。
    -   機能: WAVファイルなどの処理において、不要な無音部分を除去し、処理対象データを最適化するために使用します。
-   **sliderValueToThreshold (src/main.ts)**
    -   役割: UIのスライダーで設定された値を、ノイズゲートの閾値として使用されるデシベル値に変換する。
    -   引数: スライダーの数値（0-100など）。
    -   戻り値: デシベル値。
    -   機能: ユーザーがUIを通じてノイズゲートの感度を調整できるようにします。
-   **formatThresholdDisplay (src/main.ts)**
    -   役割: ノイズゲートの閾値をユーザーにわかりやすい表示形式（例: "-60 dB"）にフォーマットする。
    -   引数: 閾値（デシベル値）。
    -   戻り値: フォーマットされた文字列。
    -   機能: UIにノイズゲートの現在の設定値を明確に表示するために使用します。
-   **startFrequencyDisplay (src/main.ts)**
    -   役割: UI上の検出周波数表示の更新を開始する。
    -   引数: なし。
    -   戻り値: void。
    -   機能: アプリケーション実行中にリアルタイムで検出周波数情報をユーザーインターフェースに表示します。
-   **stopFrequencyDisplay (src/main.ts)**
    -   役割: UI上の検出周波数表示の更新を停止する。
    -   引数: なし。
    -   戻り値: void。
    -   機能: アプリケーションが停止された際に、周波数情報のUI更新を停止します。
-   **cleanup (src/WaveformDataProcessor.ts)**
    -   役割: WASMモジュールおよび関連リソースを適切に解放する。
    -   引数: なし。
    -   戻り値: void。
    -   機能: アプリケーション終了時やリセット時に、メモリリークを防ぎ、システムリソースをクリーンアップします。

## 関数呼び出し階層ツリー
```
- Oscilloscope.constructor()
  - AudioManager.constructor()
  - WaveformDataProcessor.constructor()
  - WaveformRenderer.constructor()
  - ComparisonPanelRenderer.constructor()
  - PianoKeyboardRenderer.constructor()

- Oscilloscope.start()
  - AudioManager.start()
  - WaveformDataProcessor.initialize()
    - WaveformDataProcessor.loadWasmModule()
      - public/wasm/wasm_processor.js: initSync()
        - public/wasm/wasm_processor.js: __wbg_init()
        - (WASMモジュール内部で各種設定関数が呼び出される: setAutoGain, setNoiseGateThreshold, etc.)
  - (メインループ: requestAnimationFrameにより駆動)
    - WaveformDataProcessor.handleLoad()
      - public/wasm/wasm_processor.js: processFrame()
        - public/wasm/wasm_processor.js: getArrayF32FromWasm0()
        - public/wasm/wasm_processor.js: passArrayF32ToWasm0()
        - public/wasm/wasm_processor.js: similarity()
        - (Rust実装の周波数推定、アライメント、ゲイン制御アルゴリズムが内部的に実行される)
    - WaveformRenderer.render()
      - src/utils.ts: dbToAmplitude()
    - ComparisonPanelRenderer.render()
    - PianoKeyboardRenderer.render()
      - src/utils.ts: frequencyToNote()
    - src/main.ts: startFrequencyDisplay() (UI更新)
      - src/main.ts: sliderValueToThreshold()
      - src/main.ts: formatThresholdDisplay()
      - src/utils.ts: amplitudeToDb()
    - (Oscilloscope.stop() が呼ばれるまで繰り返し)

- Oscilloscope.startFromFile()
  - AudioManager.startFromFile()
    - src/utils.ts: trimSilence()
    - (ファイル読み込み・デコード処理)
  - (以降は Oscilloscope.start() のメインループと同様)

- Oscilloscope.startFromBuffer()
  - AudioManager.startFromBuffer()
    - BufferSource.constructor() (BufferSourceインスタンスが利用される)
  - (以降は Oscilloscope.start() のメインループと同様)

- Oscilloscope.stop()
  - AudioManager.stop()
  - WaveformDataProcessor.cleanup()

---
Generated at: 2026-01-15 07:10:20 JST
