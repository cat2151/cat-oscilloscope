Last updated: 2026-01-16

# Project Overview

## プロジェクト概要
- ブラウザ上で動作する高機能なオシロスコープ風波形ビジュアライザーです。
- マイク入力や音声ファイルからリアルタイムで音声を解析し、多様な周波数推定と安定した波形表示を提供します。
- 主要なデータ処理は高速・型安全なRust/WASMで実装され、npmライブラリとしても利用可能です。

## 技術スタック
- フロントエンド: **TypeScript** (型安全なJavaScriptでアプリケーションロジックを記述), **Web Audio API** (マイク入力や音声ファイルのキャプチャ、リアルタイム処理に使用), **HTML Canvas** (波形や関連データを2Dグラフィックでレンダリング)
- 音楽・オーディオ: **Web Audio API** (音源の処理と分析の基盤を提供)
- 開発ツール: **Node.js/npm** (パッケージ管理と開発スクリプト実行), **Vite** (高速な開発サーバーとビルドツール), **Rust toolchain (rustc, cargo)** (WASMモジュールのコンパイルに必要), **wasm-pack** (RustコードをWebAssemblyにビルドするためのツール)
- テスト: **Vitest** (高速なJavaScriptテストフレームワーク), **@vitest/ui** (Vitestのテスト結果をブラウザで表示するUI), **happy-dom** (DOM環境をシミュレートし、ブラウザAPIに依存するコンポーネントのテストを可能にする)
- ビルドツール: **Vite** (開発と本番環境向けの高速なビルド), **vite-plugin-dts** (TypeScriptの型定義ファイルを自動生成), **wasm-pack** (RustからWebAssemblyへのコンパイルとJavaScriptバインディングの生成)
- 言語: **TypeScript** (フロントエンドおよびライブラリの型安全な開発), **Rust** (データ処理アルゴリズムの実装により、高性能と信頼性を実現)
- 自動化・CI/CD: **npmスクリプト** (ビルド、テスト、WASMコンパイルなどの開発ワークフローを自動化)
- 開発標準: **TypeScript** (厳格な型チェックにより、コードの品質と保守性を向上)

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
📖 RELEASE.md
📖 TESTING.md
📄 _config.yml
📁 dist/
  📘 AudioManager.d.ts
  📄 AudioManager.d.ts.map
  📘 BufferSource.d.ts
  📄 BufferSource.d.ts.map
  📘 ComparisonPanelRenderer.d.ts
  📄 ComparisonPanelRenderer.d.ts.map
  📘 FrequencyEstimator.d.ts
  📄 FrequencyEstimator.d.ts.map
  📘 GainController.d.ts
  📄 GainController.d.ts.map
  📘 Oscilloscope.d.ts
  📄 Oscilloscope.d.ts.map
  📘 PianoKeyboardRenderer.d.ts
  📄 PianoKeyboardRenderer.d.ts.map
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
  📖 158.md
  📖 160.md
  📖 162.md
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
-   **`.gitignore`**: Gitでバージョン管理しないファイルやディレクトリを指定します。
-   **`CONSOLIDATION_SUMMARY.md`**, **`IMPLEMENTATION_NOTES_117.md`**, **`IMPLEMENTATION_SUMMARY.md`**, **`REFACTORING_SUMMARY.md`**, **`RELEASE.md`**, **`TESTING.md`**: プロジェクトの開発履歴、実装メモ、リファクタリング、リリースノート、テストに関するドキュメントファイルです。
-   **`LIBRARY_USAGE.md`**: このプロジェクトをnpmライブラリとして他のプロジェクトで使用する方法について説明したドキュメントです。
-   **`LICENSE`**: プロジェクトのライセンス情報（MITライセンス）が記載されています。
-   **`README.ja.md`**, **`README.md`**: プロジェクトの概要、機能、使い方などを説明する多言語（日本語・英語）のメインドキュメントです。
-   **`_config.yml`**: Jekyllなどの静的サイトジェネレーターの設定ファイル（GitHub Pages用）。
-   **`dist/`**: ビルドされた成果物が出力されるディレクトリです。
    -   **`*.d.ts`ファイル群**: TypeScriptの型定義ファイルで、JavaScriptコードの型情報を記述しています。
    -   **`cat-oscilloscope.cjs`**, **`cat-oscilloscope.mjs`**: ライブラリ本体のJavaScriptコードで、CommonJS形式とESM (ECMAScript Modules) 形式の両方を提供します。
    -   **`dist/wasm/`**: ビルド済みのWebAssemblyモジュールとその関連ファイルが含まれます。
        -   **`wasm_processor.d.ts`**, **`wasm_processor.js`**, **`wasm_processor_bg.wasm`**: Rustで書かれたデータ処理アルゴリズムがWebAssemblyにコンパイルされたものです。`wasm_processor.js`はJavaScriptからWASMモジュールを利用するためのラッパー、`.d.ts`は型定義、`.wasm`は実際のバイナリコードです。
-   **`docs/PHASE_ALIGNMENT.md`**: 位相同期（Phase Alignment）モードの詳細な説明が記載されたドキュメントです。
-   **`example-library-usage.html`**: `cat-oscilloscope`ライブラリをHTMLページで利用する具体例を示すファイルです。
-   **`index.html`**: アプリケーションのデモ版を実行するためのメインHTMLファイルです。
-   **`issue-notes/`**: 開発中に記録された様々な課題や検討事項に関するノートが格納されているディレクトリです。
-   **`package-lock.json`**, **`package.json`**: プロジェクトの依存関係、スクリプト、メタデータなどを定義するファイルです。
-   **`public/`**: 静的ファイルが配置されるディレクトリで、ビルド済みのWASMモジュールなども含まれます。
-   **`src/`**: アプリケーションのソースコードが格納されているディレクトリです。
    -   **`AudioManager.ts`**: Web Audio APIを使用して、マイクやオーディオファイルからの音声入力を管理するクラスです。
    -   **`BufferSource.ts`**: 静的なオーディオバッファ（音声データ）を管理し、ループ再生などの機能を提供するクラスです。
    -   **`ComparisonPanelRenderer.ts`**: 現在の波形と過去の波形の類似度を視覚的に表示するパネルの描画を担当するクラスです。
    -   **`FrequencyEstimator.ts`**: Zero-Crossing、Autocorrelation、FFT、STFT、CQTなど、様々な周波数推定アルゴリズムを管理し、WASMモジュールを介して実行するクラスです。
    -   **`GainController.ts`**: 波形の振幅を自動調整する自動ゲイン制御ロジックを管理するクラスです。
    -   **`Oscilloscope.ts`**: アプリケーションの中心となるクラスで、各種コンポーネント（音声入力、データ処理、レンダリング）を統合し、オシロスコープ機能全体を制御します。
    -   **`PianoKeyboardRenderer.ts`**: 検出された周波数をピアノの鍵盤上に表示する描画を担当するクラスです。
    -   **`WaveformDataProcessor.ts`**: 音声データの前処理、WASMモジュールとの連携、処理された波形データの状態管理を行うクラスです。
    -   **`WaveformRenderData.ts`**: 波形をCanvasに描画するために必要なデータを構造化して保持するクラスです。
    -   **`WaveformRenderer.ts`**: HTML Canvasに実際の波形を描画する処理を担当するクラスです。
    -   **`WaveformSearcher.ts`**: 波形の表示開始点やアライメントポイントを探索するロジックを管理するクラスです。
    -   **`ZeroCrossDetector.ts`**: 波形のゼロクロス点（信号がゼロを横切る点）を検出するロジックを管理するクラスです。
    -   **`__tests__/`**: Vitestによる単体テストコードが格納されています。
    -   **`index.ts`**: ライブラリのエントリーポイントとなるファイルです。
    -   **`main.ts`**: デモアプリケーションのUI要素（スライダー、ボタンなど）と`Oscilloscope`クラスを連携させ、イベント処理を行うメインスクリプトです。
    -   **`utils.ts`**: デシベルと振幅の変換、周波数と音符の変換、無音区間のトリミングなど、汎用的なユーティリティ関数を集めたファイルです。
-   **`tsconfig.json`**, **`tsconfig.lib.json`**: TypeScriptコンパイラの設定ファイルで、プロジェクトとライブラリそれぞれのコンパイル設定を定義します。
-   **`vite.config.ts`**: Viteビルドツールの設定ファイルで、ビルドオプションやプラグインなどを定義します。
-   **`wasm-processor/`**: Rustで実装されたデータ処理ロジックのソースコードが格納されているディレクトリです。
    -   **`Cargo.toml`**: Rustプロジェクトの依存関係やメタデータを定義するファイルです。
    -   **`src/`**: Rustのソースファイルが格納されています。
        -   **`frequency_estimator.rs`**: 周波数推定アルゴリズムのRust実装です。
        -   **`gain_controller.rs`**: ゲイン制御アルゴリズムのRust実装です。
        -   **`lib.rs`**: Rustクレートのエントリーポイントであり、WASMモジュールとしてエクスポートされる関数を定義します。
        -   **`phase_detector.rs`**: 位相検出アルゴリズムのRust実装です。
        -   **`waveform_searcher.rs`**: 波形探索アルゴリズムのRust実装です。
        -   **`zero_cross_detector.rs`**: ゼロクロス検出アルゴリズムのRust実装です。

## 関数詳細説明
-   **`dbToAmplitude(db: number): number`** (src/utils.ts): デシベル値を振幅（音量）に変換します。
    -   引数: `db` (number) - デシベル値。
    -   戻り値: `number` - 変換された振幅値。
-   **`amplitudeToDb(amplitude: number): number`** (src/utils.ts): 振幅値（音量）をデシベルに変換します。
    -   引数: `amplitude` (number) - 振幅値。
    -   戻り値: `number` - 変換されたデシベル値。
-   **`frequencyToNote(frequency: number): string`** (src/utils.ts): 周波数を音楽の音符名（例: "A4"）に変換します。
    -   引数: `frequency` (number) - 周波数（Hz）。
    -   戻り値: `string` - 対応する音符名。
-   **`trimSilence(audioBuffer: AudioBuffer, thresholdDb: number): AudioBuffer`** (src/utils.ts): 音声バッファの先頭と末尾の無音部分を指定されたデシベル閾値に基づいて削除します。
    -   引数: `audioBuffer` (AudioBuffer) - 処理する音声バッファ。`thresholdDb` (number) - 無音と判断するデシベル閾値。
    -   戻り値: `AudioBuffer` - 無音部分がトリミングされた新しい音声バッファ。
-   **`AudioManager.start(): Promise<void>`** (src/AudioManager.ts): マイクからの音声入力を開始します。
    -   引数: なし。
    -   戻り値: `Promise<void>` - 非同期処理の完了を通知。
-   **`AudioManager.startFromFile(file: File): Promise<void>`** (src/AudioManager.ts): 指定された音声ファイル（WAV）からの再生を開始します。
    -   引数: `file` (File) - 再生する音声ファイル。
    -   戻り値: `Promise<void>` - 非同期処理の完了を通知。
-   **`AudioManager.startFromBuffer(bufferSource: BufferSource): Promise<void>`** (src/AudioManager.ts): 既に準備されたBufferSourceオブジェクトから音声データの処理を開始します。
    -   引数: `bufferSource` (BufferSource) - 再生する音声データのBufferSource。
    -   戻り値: `Promise<void>` - 非同期処理の完了を通知。
-   **`AudioManager.stop(): void`** (src/AudioManager.ts): 現在の音声入力を停止します。
    -   引数: なし。
    -   戻り値: `void`。
-   **`BufferSource.constructor(audioData: Float32Array, sampleRate: number, options?: { loop?: boolean }): void`** (src/BufferSource.ts): 静的オーディオバッファを初期化します。
    -   引数: `audioData` (Float32Array) - 生の音声データ。`sampleRate` (number) - サンプルレート。`options` (object, optional) - ループ再生などのオプション。
    -   戻り値: `void`。
-   **`Oscilloscope.constructor(canvas: HTMLCanvasElement): void`** (src/Oscilloscope.ts): オシロスコープのインスタンスを初期化し、描画対象のCanvas要素を設定します。
    -   引数: `canvas` (HTMLCanvasElement) - 波形を描画するHTML Canvas要素。
    -   戻り値: `void`。
-   **`Oscilloscope.start(): Promise<void>`** (src/Oscilloscope.ts): マイク入力を利用してオシロスコープの描画を開始します。
    -   引数: なし。
    -   戻り値: `Promise<void>` - 非同期処理の完了を通知。
-   **`Oscilloscope.startFromFile(file: File): Promise<void>`** (src/Oscilloscope.ts): 指定された音声ファイルを読み込み、それを利用してオシロスコープの描画を開始します。
    -   引数: `file` (File) - 処理する音声ファイル。
    -   戻り値: `Promise<void>` - 非同期処理の完了を通知。
-   **`Oscilloscope.startFromBuffer(bufferSource: BufferSource): Promise<void>`** (src/Oscilloscope.ts): 既存のBufferSourceから音声データを受け取り、オシロスコープの描画を開始します。
    -   引数: `bufferSource` (BufferSource) - 処理する音声データのBufferSource。
    -   戻り値: `Promise<void>` - 非同期処理の完了を通知。
-   **`Oscilloscope.stop(): void`** (src/Oscilloscope.ts): オシロスコープの描画と音声処理を停止します。
    -   引数: なし。
    -   戻り値: `void`。
-   **`WaveformDataProcessor.initialize(): Promise<void>`** (src/WaveformDataProcessor.ts): WASMモジュールをロードし、データ処理プロセッサを初期化します。
    -   引数: なし。
    -   戻り値: `Promise<void>` - 初期化の完了を通知。
-   **`WaveformDataProcessor.cleanup(): void`** (src/WaveformDataProcessor.ts): WASMモジュールのリソースを解放します。
    -   引数: なし。
    -   戻り値: `void`。
-   **`wasm_processor.processFrame(waveform_data_ptr: number, len: number, is_first_frame: boolean, prev_waveform_ptr: number, prev_len: number): WaveformRenderData`** (public/wasm/wasm_processor.js): WASMモジュール内で、入力された波形データフレームを処理し、描画に必要な情報を計算します。
    -   引数: `waveform_data_ptr` (number) - 現在の波形データへのポインタ。`len` (number) - データ長。`is_first_frame` (boolean) - 初回フレームか。`prev_waveform_ptr` (number) - 前回の波形データへのポインタ。`prev_len` (number) - 前回のデータ長。
    -   戻り値: `WaveformRenderData` - 描画用のデータオブジェクト。
-   **`wasm_processor.setAutoGain(enable: boolean): void`** (public/wasm/wasm_processor.js): 自動ゲイン機能を有効/無効にします。
    -   引数: `enable` (boolean) - 有効にするかどうかのフラグ。
    -   戻り値: `void`。
-   **`wasm_processor.setNoiseGate(enable: boolean): void`** (public/wasm/wasm_processor.js): ノイズゲート機能を有効/無効にします。
    -   引数: `enable` (boolean) - 有効にするかどうかのフラグ。
    -   戻り値: `void`。
-   **`wasm_processor.setAlignmentMode(mode: number): void`** (public/wasm/wasm_processor.js): 波形のアライメントモードを設定します (Phase, Zero-Cross, Peak)。
    -   引数: `mode` (number) - 設定するアライメントモードのID。
    -   戻り値: `void`。
-   **`wasm_processor.setBufferSizeMultiplier(multiplier: number): void`** (public/wasm/wasm_processor.js): 低周波検出精度向上のためのバッファサイズ乗数を設定します。
    -   引数: `multiplier` (number) - バッファサイズの乗数 (例: 1, 4, 16)。
    -   戻り値: `void`。
-   **`wasm_processor.setFrequencyEstimationMethod(method: number): void`** (public/wasm/wasm_processor.js): 周波数推定方法を設定します (Zero-Crossing, Autocorrelation, FFT, STFT, CQT)。
    -   引数: `method` (number) - 設定する周波数推定方法のID。
    -   戻り値: `void`。
-   **`wasm_processor.reset(): void`** (public/wasm/wasm_processor.js): WASMモジュールの内部状態（例: ゲイン履歴、バッファ）をリセットします。
    -   引数: なし。
    -   戻り値: `void`。
-   **`main.sliderValueToThreshold(value: string): number`** (src/main.ts): UIスライダーの値をノイズゲートのデシベル閾値に変換します。
    -   引数: `value` (string) - スライダーの現在値。
    -   戻り値: `number` - 変換されたデシベル閾値。
-   **`main.formatThresholdDisplay(thresholdDb: number): string`** (src/main.ts): デシベル閾値を表示用の文字列にフォーマットします。
    -   引数: `thresholdDb` (number) - デシベル閾値。
    -   戻り値: `string` - フォーマットされた文字列。

## 関数呼び出し階層ツリー
```
- Oscilloscope.start()
  - AudioManager.start()
    - Oscilloscope.startFromFile()
      - AudioManager.startFromFile()
        - AudioManager.startFromBuffer()
          - BufferSource.constructor()
    - trimSilence()
      - dbToAmplitude()
      - amplitudeToDb()
      - frequencyToNote()
    - wasm_processor.reset()
    - WaveformDataProcessor.initialize()
      - wasm_processor.initSync()
        - wasm_processor.free()
        - wasm_processor.processFrame()
        - wasm_processor.setAutoGain()
        - wasm_processor.setNoiseGate()
        - wasm_processor.setUsePeakMode()
        - wasm_processor.setAlignmentMode()
        - wasm_processor.setNoiseGateThreshold()
        - wasm_processor.setBufferSizeMultiplier()
        - wasm_processor.setFrequencyEstimationMethod()
        - wasm_processor.constructor()
    - wasm_processor.__wbg_init()
    - wasm_processor.processFrame() (WASM内部関数)
    - wasm_processor.setAutoGain()
    - wasm_processor.setNoiseGate()
    - wasm_processor.setAlignmentMode()
    - wasm_processor.setNoiseGateThreshold()
    - wasm_processor.setBufferSizeMultiplier()
    - wasm_processor.setFrequencyEstimationMethod()
    - Oscilloscope.stop()
      - WaveformDataProcessor.cleanup()

- main.sliderValueToThreshold()
  - main.formatThresholdDisplay()
    - main.startFrequencyDisplay()
    - main.stopFrequencyDisplay()

---
Generated at: 2026-01-16 07:09:48 JST
