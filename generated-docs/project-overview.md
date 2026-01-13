Last updated: 2026-01-14

# Project Overview

## プロジェクト概要
- ブラウザで動作する、マイク入力やWAVファイルを分析する高機能なリアルタイム波形ビジュアライザーです。
- ゼロクロス、FFT、STFT、CQTなど5種類の周波数推定アルゴリズムと3つのアライメントモードを搭載しています。
- データ処理の大部分をRust/WebAssemblyで実装し、高速かつ安定したパフォーマンスを提供します。

## 技術スタック
- フロントエンド: 
    -   **TypeScript**: 型安全なJavaScriptで、アプリケーションのロジック、UI操作、レンダリングフローを記述するために使用されています。
    -   **HTML Canvas**: 波形、FFTスペクトラム、ピアノ鍵盤、比較パネルといった2Dグラフィックを描画するための主要な技術です。
    -   **Web Audio API**: マイクからのリアルタイム音声入力、オーディオファイルのデコードと再生、音声データの分析（サンプルレートの取得など）に利用されます。
- 音楽・オーディオ: 
    -   **Web Audio API**: 音声データの取得と管理に使用。
    -   **Rust/WebAssembly (WASM)**: 波形探索、周波数推定（ゼロクロス、自己相関、FFT、STFT、CQT）、ゼロクロス検出、ゲイン制御など、パフォーマンスが要求される主要なデータ処理ロジックがRustで実装され、WebAssemblyとしてブラウザで高速に実行されます。
    -   **多様な周波数推定アルゴリズム**: Zero-Crossing、Autocorrelation、FFT、STFT、CQTの5種類をサポートし、様々な波形や目的（特に低周波検出）に対応します。
- 開発ツール: 
    -   **Node.js**: JavaScriptランタイム環境。開発サーバーの実行やビルドスクリプトの実行に必要です。
    -   **npm**: プロジェクトの依存関係管理とスクリプト実行に使用されるパッケージマネージャーです。
    -   **Rust toolchain (rustc, cargo)**: Rustソースコードのコンパイルおよびパッケージ管理に使用されるツールセットです。
    -   **wasm-pack**: RustコードをWebAssemblyにコンパイルし、JavaScriptから利用可能な形式でパッケージングするためのツールです。
- テスト: 
    -   **Vitest**: 高速なユニットテストフレームワーク。アプリケーションの各種ロジックやコンポーネントのテストに使用されます。
    -   **@vitest/ui**: Vitestのテスト結果をブラウザ上で視覚的に確認できるユーザーインターフェースを提供します。
    -   **happy-dom**: テスト環境でDOM（Document Object Model）をエミュレートし、ブラウザ環境に依存するコードのテストを可能にします。
- ビルドツール: 
    -   **Vite**: 超高速な開発サーバーとバンドラー。開発時の即時リロードや本番ビルドの最適化に利用されます。
    -   **vite-plugin-dts**: TypeScriptの型定義ファイル（.d.ts）を自動生成するためのViteプラグインです。
- 言語機能: 
    -   **TypeScript**: 静的型付けにより、大規模なプロジェクトでのコードの信頼性と保守性を高めます。
    -   **Rust**: メモリ安全性と高いパフォーマンスを特徴とし、WebAssembly経由でブラウザの計算負荷の高い処理を効率的に行います。
- 自動化・CI/CD: 
    -   **npm scripts**: `npm run dev`（開発サーバー起動）、`npm run build`（本番ビルド）、`npm test`（テスト実行）などのコマンドを通じて、開発ワークフローの様々なタスクを自動化します。
- 開発標準: 
    -   **TypeScript**: 型チェックにより、コードの品質と一貫性を保証します。

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
    📘 algorithms.test.ts
    📘 alignment-mode.test.ts
    📘 comparison-panel-renderer.test.ts
    📘 dom-integration.test.ts
    📘 library-exports.test.ts
    📘 oscilloscope.test.ts
    📘 piano-keyboard-renderer.test.ts
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
-   `.gitignore`: Gitがバージョン管理から無視するファイルやディレクトリを指定します。
-   `CONSOLIDATION_SUMMARY.md`: プロジェクトの機能やモジュール統合に関するサマリードキュメントです。
-   `IMPLEMENTATION_NOTES_117.md`: 特定の機能実装（おそらくIssue #117関連）に関する詳細なメモです。
-   `IMPLEMENTATION_SUMMARY.md`: プロジェクト全体の重要な実装ポイントをまとめたドキュメントです。
-   `LIBRARY_USAGE.md`: `cat-oscilloscope` をnpmライブラリとして他のプロジェクトで使用するための手順とコード例を説明します。
-   `LICENSE`: プロジェクトのライセンス情報（MITライセンス）を記述したファイルです。
-   `README.ja.md`: プロジェクトの日本語版説明書です。
-   `README.md`: プロジェクトの主要な説明書（英語版）です。
-   `REFACTORING_SUMMARY.md`: コードのリファクタリング履歴や内容に関するサマリーです。
-   `TESTING.md`: プロジェクトのテスト実行方法、テスト戦略、カバレッジレポートの生成方法などを説明します。
-   `_config.yml`: GitHub Pagesなどの静的サイト生成ツールで使用される設定ファイルです。
-   `docs/PHASE_ALIGNMENT.md`: 位相同期モード（Phase Alignment Mode）に関する詳細な技術説明ドキュメントです。
-   `example-library-usage.html`: ライブラリとして `cat-oscilloscope` を使用する簡単なHTMLの例を示します。
-   `generated-docs/`: プロジェクトから自動生成されたドキュメントが格納されるディレクトリです。
-   `index.html`: アプリケーションのエントリポイントとなるHTMLファイルで、ユーザーインターフェースの構造を定義します。
-   `issue-notes/`: 各開発課題（Issue）に関する詳細なメモや議論が格納されるディレクトリです。
    -   `101.md` など: 個々のIssue番号に対応する詳細なノートファイルです。
-   `package-lock.json`: npmが管理するパッケージの依存関係ツリーと正確なバージョンを記録し、ビルドの再現性を保証します。
-   `package.json`: プロジェクトのメタデータ（名前、バージョン、スクリプト、依存関係）を定義するファイルです。
-   `public/`: ウェブサーバーから直接アクセス可能な静的アセットを配置するディレクトリです。
    -   `public/wasm/`: WebAssemblyモジュールとそれに関連するファイルが格納されます。
        -   `wasm_processor.d.ts`: Rustで実装されたWASMモジュールが公開するAPIのTypeScript型定義ファイルです。
        -   `wasm_processor.js`: WASMモジュールをWebブラウザでロードし、JavaScriptからRust関数を呼び出すためのラッパーJSファイルです。
        -   `wasm_processor_bg.wasm`: RustコードをWebAssemblyにコンパイルしたバイナリファイル。実際の音声データ処理ロジックを含みます。
        -   `wasm_processor_bg.wasm.d.ts`: `wasm_processor_bg.wasm` の型定義ファイルです。
-   `src/`: アプリケーションの主要なTypeScriptソースコードが格納されるディレクトリです。
    -   `AudioManager.ts`: Web Audio APIを利用して、マイク入力やオーディオファイルからの音声データを取得・管理するクラスです。
    -   `ComparisonPanelRenderer.ts`: 波形比較パネルの描画ロジックを管理するクラスです。前後の波形の類似度などを表示します。
    -   `FrequencyEstimator.ts`: 複数（5種類）の周波数推定アルゴリズムの設定と選択を管理するクラスです。
    -   `GainController.ts`: 波形の振幅を自動調整するオートゲイン機能のロジックを実装しています。
    -   `Oscilloscope.ts`: オシロスコープの中核となるクラス。音声データの取得、処理、レンダリング、UIとの連携を統括します。
    -   `PianoKeyboardRenderer.ts`: 検出された周波数をピアノの鍵盤上に表示する描画ロジックを管理するクラスです。
    -   `WaveformDataProcessor.ts`: WASMモジュールとの連携を担い、音声データの前処理、周波数推定、波形検出などの主要なデータ処理を実行します。
    -   `WaveformRenderData.ts`: 波形を描画するために必要なデータを保持するデータ構造を定義します。
    -   `WaveformRenderer.ts`: HTML Canvas要素に音声波形やFFTスペクトラムを描画するロジックを管理するクラスです。
    -   `WaveformSearcher.ts`: 波形のアライメント（同期点検出）に関するロジックを管理するクラスです。
    -   `ZeroCrossDetector.ts`: 波形がゼロ点を横切るポイントを検出するゼロクロス検出アルゴリズムの実装です。
    -   `src/__tests__/`: 各モジュールのユニットテストや統合テストが格納されるディレクトリです。
        -   `algorithms.test.ts` など: 各機能のテストコードです。
    -   `index.ts`: ライブラリとしてエクスポートされる際の主要なエントリポイントです。
    -   `main.ts`: アプリケーションのメインエントリポイント。UI要素の初期化、イベントハンドリング、 `Oscilloscope` クラスの制御を行います。
    -   `utils.ts`: デシベル変換、周波数からノートへの変換、無音部分のトリミングなど、プロジェクト全体で共通利用されるユーティリティ関数群です。
-   `tsconfig.json`: TypeScriptコンパイラのプロジェクト設定ファイル（アプリケーションビルド用）です。
-   `tsconfig.lib.json`: TypeScriptコンパイラのライブラリビルド用の設定ファイルです。
-   `vite.config.ts`: Viteのビルド設定ファイル。バンドルや開発サーバーの挙動を定義します。
-   `wasm-processor/`: Rustで記述されたWebAssemblyモジュールのソースコードを格納するディレクトリです。
    -   `Cargo.toml`: Rustプロジェクトの依存関係、メタデータ、ビルド設定を定義するファイルです。
    -   `wasm-processor/src/`: Rustソースコードが格納されます。
        -   `frequency_estimator.rs`: 周波数推定アルゴリズムのRust実装です。
        -   `gain_controller.rs`: ゲイン制御ロジックのRust実装です。
        -   `lib.rs`: WebAssemblyモジュールのメインライブラリファイル。他のRustモジュールを統合し、JavaScriptから呼び出されるAPIを公開します。
        -   `phase_detector.rs`: 位相検出ロジックのRust実装です。
        -   `waveform_searcher.rs`: 波形探索（アライメント）ロジックのRust実装です。
        -   `zero_cross_detector.rs`: ゼロクロス検出ロジックのRust実装です。

## 関数詳細説明
-   **public/wasm/wasm_processor.d.ts**:
    -   `initSync(module: WebAssembly.Module | BufferSource, maybe_memory?: WebAssembly.Memory)`: WebAssemblyモジュールを同期的に初期化し、JavaScriptからRust関数を呼び出せるように準備します。
    -   `__wbg_init(input: RequestInfo | URL | Response | BufferSource, maybe_memory?: WebAssembly.Memory)`: WebAssemblyモジュールを非同期に初期化するための関数で、主にブラウザ環境で使用されます。
-   **public/wasm/wasm_processor.js** (WASMラッパーを通じてRust関数が公開):
    -   `processFrame(processor_ptr: number, input_buffer_ptr: number, input_buffer_len: number)`: WASMモジュール内で音声データの一フレームを処理する中核関数。周波数推定や波形解析を実行します。
    -   `setAutoGain(processor_ptr: number, enabled: boolean)`: WASM側でオートゲイン機能の有効/無効を切り替えます。
    -   `setNoiseGate(processor_ptr: number, enabled: boolean)`: WASM側でノイズゲート機能の有効/無効を切り替えます。
    -   `setUsePeakMode(processor_ptr: number, enabled: boolean)`: WASM側でピーク検出モードの有効/無効を切り替えます。
    -   `setAlignmentMode(processor_ptr: number, mode: number)`: WASM側で波形のアライメントモード（ゼロクロス、ピーク、位相）を設定します。
    -   `setNoiseGateThreshold(processor_ptr: number, threshold: number)`: WASM側でノイズゲートの閾値を設定します。
    -   `setBufferSizeMultiplier(processor_ptr: number, multiplier: number)`: WASM側でバッファサイズ乗数を設定し、低周波検出精度に影響を与えます。
    -   `setFrequencyEstimationMethod(processor_ptr: number, method: number)`: WASM側で周波数推定アルゴリズム（Zero-Crossing, Autocorrelation, FFT, STFT, CQT）を設定します。
    -   `reset(processor_ptr: number)`: WASMプロセッサの状態をリセットします。
    -   `similarity(processor_ptr: number)`: 現在の波形と以前の波形の類似度を計算して返します。
    -   `sampleRate(processor_ptr: number)`: WASMモジュールが処理している音声のサンプルレートを取得します。
    -   `estimatedFrequency(processor_ptr: number)`: WASM側で推定された基本周波数を取得します。
-   **src/AudioManager.ts**:
    -   `start(audioContext: AudioContext, useMic: boolean)`: 音声入力のストリームを開始します。引数 `useMic` が `true` ならマイクから、そうでなければサイレントなテスト入力を使用します。
    -   `startFromFile(audioContext: AudioContext, file: File)`: 指定されたオーディオファイルから音声データの処理を開始します。
    -   `stop()`: 現在アクティブな音声ストリームやソースノードを停止し、リソースを解放します。
-   **src/ComparisonPanelRenderer.ts**:
    -   `constructor(canvas: HTMLCanvasElement)`: 波形比較パネルの描画を管理するインスタンスを初期化します。Canvas要素を受け取ります。
-   **src/FrequencyEstimator.ts**:
    -   (明示された関数はありませんが、WASMモジュールへの周波数推定方法の設定をラップするロジックを提供します。)
-   **src/GainController.ts**:
    -   (明示された関数はありませんが、オートゲインの目標ゲイン計算やスムージングなどのロジックを提供します。)
-   **src/Oscilloscope.ts**:
    -   `constructor(canvas: HTMLCanvasElement)`: オシロスコープアプリケーションの中核インスタンスを初期化します。描画対象のCanvas要素や、関連する各種マネージャー（AudioManager, WaveformDataProcessorなど）をセットアップします。
    -   `start()`: オシロスコープの描画ループと音声処理を開始します。
    -   `startFromFile(file: File)`: 指定されたオーディオファイルからオシロスコープの描画と音声処理を開始します。
    -   `stop()`: オシロスコープの描画と音声処理を停止します。
-   **src/PianoKeyboardRenderer.ts**:
    -   `constructor(canvas: HTMLCanvasElement)`: ピアノ鍵盤の描画を管理するインスタンスを初期化します。
    -   `render(detectedFrequency: number)`: 検出された周波数に基づいて、Canvas上のピアノ鍵盤に音符を表示・更新します。
-   **src/WaveformDataProcessor.ts**:
    -   `cleanup()`: WASMモジュールによって確保されたリソースを解放し、クリーンアップします。
    -   `handleLoad(audioBuffer: AudioBuffer)`: ロードされたオーディオバッファを処理し、WASMモジュールにデータを提供します。
    -   `constructor(sampleRate: number)`: `WaveformDataProcessor` のインスタンスを初期化し、WASMモジュールの準備を行います。
    -   `initialize()`: WASMモジュールの初期化処理を実行します。
    -   `loadWasmModule()`: WebAssemblyモジュールを動的にロードします。
-   **src/WaveformRenderData.ts**:
    -   (明示された関数はありませんが、波形描画に必要なデータを保持する構造を定義します。)
-   **src/WaveformRenderer.ts**:
    -   `constructor(canvas: HTMLCanvasElement)`: 波形描画を管理するインスタンスを初期化します。
    -   `draw(data: WaveformRenderData, options: { gain: number, alignmentPoints: number[] })`: 提供された波形データとオプション（ゲイン、同期点など）に基づき、Canvasに波形を描画します。
-   **src/WaveformSearcher.ts**:
    -   (明示された関数はありませんが、波形のアライメント（同期点検出）ロジックを管理します。)
-   **src/ZeroCrossDetector.ts**:
    -   (明示された関数はありませんが、波形データ内のゼロクロスポイントを検出するアルゴリズムを実装します。)
-   **src/main.ts**:
    -   `sliderValueToThreshold(value: number)`: UIのスライダーの値を、ノイズゲート機能で利用される閾値に変換します。
    -   `formatThresholdDisplay(threshold: number)`: ノイズゲートの閾値表示を整形します。
    -   `startFrequencyDisplay(frequency: number)`: 検出された周波数をUI上に表示し、ピアノ鍵盤の表示を更新します。
    -   `stopFrequencyDisplay()`: 周波数表示を停止し、UIを初期状態に戻します。
-   **src/utils.ts**:
    -   `dbToAmplitude(db: number)`: デシベル値を線形振幅値に変換します。
    -   `amplitudeToDb(amplitude: number)`: 線形振幅値をデシベル値に変換します。
    -   `frequencyToNote(frequency: number)`: 周波数（Hz）を音楽のノート（例: "A4"）に変換します。
    -   `trimSilence(audioBuffer: AudioBuffer)`: オーディオバッファの先頭と末尾にある無音部分を検出し、トリミングします。

## 関数呼び出し階層ツリー
```
- initSync (public/wasm/wasm_processor.d.ts)
  - processFrame (public/wasm/wasm_processor.js)
  - setAutoGain (public/wasm/wasm_processor.js)
  - setNoiseGate (public/wasm/wasm_processor.js)
  - setUsePeakMode (public/wasm/wasm_processor.js)
  - setAlignmentMode (public/wasm/wasm_processor.js)
  - setNoiseGateThreshold (public/wasm/wasm_processor.js)
  - setBufferSizeMultiplier (public/wasm/wasm_processor.js)
  - setFrequencyEstimationMethod (public/wasm/wasm_processor.js)
  - reset (public/wasm/wasm_processor.js)
  - constructor (public/wasm/wasm_processor.js) # WASM内部オブジェクトのコンストラクタ
- __wbg_init (public/wasm/wasm_processor.js)
- start (src/AudioManager.ts)
  - startFromFile (src/AudioManager.ts)
  - stop (src/AudioManager.ts)
  - trimSilence (src/utils.ts)
- sliderValueToThreshold (src/main.ts)
  - formatThresholdDisplay (src/main.ts)
    - startFrequencyDisplay (src/main.ts)
    - stopFrequencyDisplay (src/main.ts)
    - frequencyToNote (src/utils.ts)
- dbToAmplitude (src/utils.ts)
- amplitudeToDb (src/utils.ts)
- cleanup (src/WaveformDataProcessor.ts)
- createAudioBuffer (src/__tests__/utils.test.ts) # テストユーティリティ関数
- createSilentMockAudioContext (src/__tests__/oscilloscope.test.ts) # テストユーティリティ関数
  - getFFTOverlayDimensions (src/__tests__/oscilloscope.test.ts) # テストユーティリティ関数
    - findFFTOverlayBorderCall (src/__tests__/oscilloscope.test.ts) # テストユーティリティ関数
    - getAudioTracks (src/__tests__/oscilloscope.test.ts) # テストユーティリティ関数
    - getVideoTracks (src/__tests__/oscilloscope.test.ts) # テストユーティリティ関数

---
Generated at: 2026-01-14 07:10:06 JST
