Last updated: 2026-01-08

# Project Overview

## プロジェクト概要
- ブラウザ上で動作する、リアルタイムのオシロスコープ風波形ビジュアライザーです。
- マイク入力やWAVファイルから音声を取り込み、ゼロクロス法、自己相関、FFTなど5つのアルゴリズムで周波数推定を行います。
- 安定した波形表示と、高速なデータ処理のためのRust/WASM実装も特徴です。

## 技術スタック
- フロントエンド: **TypeScript** (型安全なJavaScriptによるアプリケーション開発), **HTML Canvas** (2D波形レンダリング), **Web Audio API** (マイクからの音声キャプチャ、WAVファイル処理、リアルタイム音声分析)
- 音楽・オーディオ: **Web Audio API** (音声処理の中核となるブラウザ標準API)
- 開発ツール: **Node.js** (アプリケーションの実行環境、依存関係管理), **npm / yarn** (パッケージ管理), **Vite** (高速な開発サーバーとビルドツール), **Rust toolchain** (WASMモジュールの開発), **wasm-pack** (RustコードをWebAssemblyにコンパイルするツール), **cross-env** (クロスプラットフォームな環境変数設定)
- テスト: **Vitest** (高速な単体・統合テストフレームワーク), **@vitest/ui** (VitestのテストUI), **happy-dom** (VitestでDOM環境をシミュレートするためのツール)
- ビルドツール: **Vite** (本番用ビルドと開発サーバー), **vite-plugin-dts** (TypeScriptの型定義ファイルを生成)
- 言語機能: **TypeScript** (JavaScriptに静的型付けを追加し、大規模開発の堅牢性を向上)
- 自動化・CI/CD: (特になし)
- 開発標準: (特になし)

## ファイル階層ツリー
```
📄 .gitignore
📖 IMPLEMENTATION_SUMMARY.md
📖 LIBRARY_USAGE.md
📄 LICENSE
📖 README.ja.md
📖 README.md
📖 REFACTORING_SUMMARY.md
📖 TESTING.md
📄 _config.yml
🌐 example-library-usage.html
📁 generated-docs/
🌐 index.html
📁 issue-notes/
  📖 101.md
  📖 102.md
  📖 105.md
  📖 107.md
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
  📘 WasmDataProcessor.ts
  📘 WaveformDataProcessor.ts
  📘 WaveformRenderData.ts
  📘 WaveformRenderer.ts
  📘 WaveformSearcher.ts
  📘 ZeroCrossDetector.ts
  📁 __tests__/
    📘 algorithms.test.ts
    📘 comparison-panel-renderer.test.ts
    📘 dom-integration.test.ts
    📘 library-exports.test.ts
    📘 oscilloscope.test.ts
    📘 utils.test.ts
    📘 waveform-data-processor.test.ts
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
    📄 waveform_searcher.rs
    📄 zero_cross_detector.rs
```

## ファイル詳細説明
- **example-library-usage.html**: `cat-oscilloscope` ライブラリをHTMLページでどのように使用するかを示すサンプルファイルです。
- **index.html**: アプリケーションのメインエントリポイントとなるHTMLファイルで、UI要素やスクリプトの読み込みを定義しています。
- **public/wasm/wasm_processor.d.ts**: WebAssemblyモジュール `wasm_processor.js` のTypeScript型定義ファイルです。
- **public/wasm/wasm_processor.js**: Rustで実装されたデータ処理ロジックをWebAssemblyとしてコンパイルしたJavaScriptラッパーファイルです。ブラウザからWASM機能を利用するためのインターフェースを提供します。
- **public/wasm/wasm_processor_bg.wasm.d.ts**: WASMバイナリの型定義ファイルです。
- **src/AudioManager.ts**: マイクからの音声入力やファイルからの音声読み込みを管理し、Web Audio APIを介して音声データを処理します。
- **src/ComparisonPanelRenderer.ts**: 複数の波形表示や周波数推定結果を比較表示するUI要素のレンダリングを担当します。
- **src/FrequencyEstimator.ts**: ゼロクロス法、自己相関、FFT、STFT、CQTなど、複数の周波数推定アルゴリズムを実装しています。
- **src/GainController.ts**: 波形の振幅を自動調整するオートゲイン機能を提供し、表示の安定化を図ります。
- **src/Oscilloscope.ts**: オシロスコープアプリケーションのメインクラスで、音声処理、波形描画、UI制御などを統合します。
- **src/WasmDataProcessor.ts**: Rust/WASMで実装されたデータ処理ロジックをTypeScriptから利用するためのラッパーおよび初期化処理を行います。
- **src/WaveformDataProcessor.ts**: 音声データから波形データを生成し、周波数推定に必要な前処理を行います。
- **src/WaveformRenderData.ts**: 波形描画に必要なデータ構造を定義するインターフェースやクラスを含みます。
- **src/WaveformRenderer.ts**: HTML Canvas要素に実際の波形を描画する処理を担当します。
- **src/WaveformSearcher.ts**: 波形の類似度を計算し、安定した波形表示のための基準点を探索します。
- **src/ZeroCrossDetector.ts**: 波形がゼロ点を通過するポイントを検出するアルゴリズムを実装し、安定した表示に利用します。
- **src/__tests__/**: プロジェクトの各モジュールおよび機能に対するテストコードが格納されています。
  - `algorithms.test.ts`: 周波数推定アルゴリズムやゼロクロス検出のテスト。
  - `comparison-panel-renderer.test.ts`: 比較パネルレンダリングのテスト。
  - `dom-integration.test.ts`: DOM操作とコンポーネントの統合テスト。
  - `library-exports.test.ts`: ライブラリとしてエクスポートされるAPIのテスト。
  - `oscilloscope.test.ts`: `Oscilloscope` クラスの主要機能テスト。
  - `utils.test.ts`: 共通ユーティリティ関数のテスト。
  - `waveform-data-processor.test.ts`: `WaveformDataProcessor` のテスト。
  - `waveform-searcher.test.ts`: `WaveformSearcher` のテスト。
- **src/index.ts**: `cat-oscilloscope` ライブラリとして外部に公開される主要なエクスポートを定義するファイルです。
- **src/main.ts**: Webアプリケーションの初期化、UI要素のイベントハンドリング、および `Oscilloscope` クラスのインスタンス化と制御を行うメインスクリプトです。
- **src/utils.ts**: アプリケーション全体で再利用される汎用的なユーティリティ関数を提供します。
- **vite.config.ts**: Viteビルドツールの設定ファイルで、開発サーバーや本番ビルドの挙動を定義します。
- **wasm-processor/**: Rust言語でWebAssemblyモジュールを実装するためのソースコードディレクトリです。
  - `Cargo.toml`: Rustプロジェクトの設定ファイル。
  - `src/frequency_estimator.rs`: Rust版の周波数推定ロジック。
  - `src/gain_controller.rs`: Rust版のゲイン制御ロジック。
  - `src/lib.rs`: WASMモジュールのエントリポイントとなるRustライブラリファイル。
  - `src/waveform_searcher.rs`: Rust版の波形探索ロジック。
  - `src/zero_cross_detector.rs`: Rust版のゼロクロス検出ロジック。

## 関数詳細説明
- **initSync(wasm_bytes)** (public/wasm/wasm_processor.d.ts, public/wasm/wasm_processor.js): WebAssemblyモジュールを同期的に初期化します。`wasm_bytes`はWASMバイナリデータです。
- **__wbg_init()** (public/wasm/wasm_processor.js): WASMモジュールの内部的な初期化処理を行います。
- **getArrayF32FromWasm0()**, **getArrayU8FromWasm0()**, **getFloat32ArrayMemory0()**, **getStringFromWasm0()**, **getUint8ArrayMemory0()** (public/wasm/wasm_processor.js): WASMメモリとJavaScript間のデータ変換（Float32Array, Uint8Array, 文字列など）を扱う内部ヘルパー関数です。
- **isLikeNone()**, **passArray8ToWasm0()**, **passArrayF32ToWasm0()**, **passStringToWasm0()** (public/wasm/wasm_processor.js): WASMとJavaScript間のデータ受け渡しに関連する内部ヘルパー関数です。
- **decodeText()** (public/wasm/wasm_processor.js): テキストデータをデコードします。
- **__wbg_load()**, **__wbg_get_imports()**, **__wbg_finalize_init()** (public/wasm/wasm_processor.js): WASMモジュールのロードと初期化フェーズにおける内部的な処理を担います。
- **__destroy_into_raw()** (public/wasm/wasm_processor.js): WASMによって割り当てられたリソースを解放するための内部関数です。
- **free()** (public/wasm/wasm_processor.js): WASMオブジェクトによって使用されているメモリを解放します。
- **processFrame(audioDataPtr, sampleRate, bufferSize, ...)** (public/wasm/wasm_processor.js): WASM側で音声フレームのデータ処理（周波数推定、ゼロクロス検出など）を実行します。
- **setAutoGain(enable)** (public/wasm/wasm_processor.js): WASM側でオートゲイン機能の有効/無効を設定します。
- **setNoiseGate(enable)** (public/wasm/wasm_processor.js): WASM側でノイズゲート機能の有効/無効を設定します。
- **setUsePeakMode(enable)** (public/wasm/wasm_processor.js): WASM側でピークモードの使用を設定します。
- **setNoiseGateThreshold(threshold)** (public/wasm/wasm_processor.js): WASM側でノイズゲートの閾値を設定します。
- **setFrequencyEstimationMethod(method)** (public/wasm/wasm_processor.js): WASM側で周波数推定アルゴリズムを設定します。
- **constructor(canvas)** (src/Oscilloscope.ts): `Oscilloscope` クラスのインスタンスを初期化し、HTML Canvas要素を設定します。
- **start()** (src/AudioManager.ts / src/Oscilloscope.ts): 音声ストリームの処理を開始します。`AudioManager`ではマイク入力、`Oscilloscope`では全体の処理を開始します。
- **startFromFile(file)** (src/AudioManager.ts / src/Oscilloscope.ts): ファイルからの音声入力処理を開始します。
- **stop()** (src/AudioManager.ts / src/Oscilloscope.ts): 現在の音声ストリーム処理を停止します。
- **setUseWasm(useWasm)** (src/Oscilloscope.ts): WASM実装を使用するかどうかを切り替えます。
- **cleanup()** (src/WasmDataProcessor.ts): WASMデータプロセッサが使用しているリソースをクリーンアップします。
- **handleLoad()** (src/WasmDataProcessor.ts): WASMモジュールがロードされた後の処理を行います。
- **initialize()** (src/WasmDataProcessor.ts): WASMデータプロセッサを初期化します。
- **loadWasmModule()** (src/WasmDataProcessor.ts): WASMモジュールを動的にロードします。
- **sliderValueToThreshold(value)** (src/main.ts): UIスライダーの値をデシベル閾値に変換します。
- **formatThresholdDisplay(threshold)** (src/main.ts): デシベル閾値を表示用の文字列にフォーマットします。
- **startFrequencyDisplay()** (src/main.ts): 周波数表示を開始します。
- **stopFrequencyDisplay()** (src/main.ts): 周波数表示を停止します。
- **dbToAmplitude(db)** (src/utils.ts): デシベル値を振幅値に変換します。
- **trimSilence(audioBuffer, threshold)** (src/utils.ts): 音声バッファから無音部分をトリムします。
- **generateSineWave(frequency, sampleRate, duration, amplitude)** (src/__tests__/algorithms.test.ts): 指定されたパラメータでサイン波を生成します。
- **generateNoise(sampleRate, duration)** (src/__tests__/algorithms.test.ts): 指定されたパラメータでノイズ波形を生成します。
- **generateSquareWave(frequency, sampleRate, duration, amplitude)** (src/__tests__/algorithms.test.ts): 指定されたパラメータで矩形波を生成します。
- **countZeroCrossings(buffer)** (src/__tests__/algorithms.test.ts): バッファ内のゼロクロス数をカウントします。
- **createMediaStreamSource(audioContext)** (src/__tests__/algorithms.test.ts, src/__tests__/dom-integration.test.ts, src/__tests__/oscilloscope.test.ts): テスト用にモックの `MediaStreamSource` を作成します。
- **createAnalyser(audioContext)** (src/__tests__/algorithms.test.ts, src/__tests__/dom-integration.test.ts, src/__tests__/oscilloscope.test.ts): テスト用にモックの `AnalyserNode` を作成します。
- **close()** (src/__tests__/algorithms.test.ts, src/__tests__/dom-integration.test.ts, src/__tests__/oscilloscope.test.ts): テスト用のAudioContextやストリームを閉じます。
- **getTracks()** (src/__tests__/algorithms.test.ts, src/__tests__/dom-integration.test.ts, src/__tests__/oscilloscope.test.ts): メディアストリームからトラックを取得します。
- **createSilentMockAudioContext()** (src/__tests__/oscilloscope.test.ts): 音声処理を行わないモックの `AudioContext` を作成します。
- **getFFTOverlayDimensions()** (src/__tests__/oscilloscope.test.ts): FFTオーバーレイの寸法を取得します。
- **findFFTOverlayBorderCall()** (src/__tests__/oscilloscope.test.ts): FFTオーバーレイの境界描画呼び出しを検出します。
- **getAudioTracks()**, **getVideoTracks()** (src/__tests__/oscilloscope.test.ts): メディアストリームからそれぞれ音声トラック、映像トラックを取得します。
- **createAudioBuffer()** (src/__tests__/utils.test.ts): テスト用の `AudioBuffer` を作成します。

## 関数呼び出し階層ツリー
```
- getArrayF32FromWasm0 (public/wasm/wasm_processor.js)
  - initSync (public/wasm/wasm_processor.d.ts)
    - free ()
    - processFrame ()
    - setAutoGain ()
    - setNoiseGate ()
    - setUsePeakMode ()
    - setNoiseGateThreshold ()
    - setFrequencyEstimationMethod ()
    - constructor (undefined)
  - __wbg_init ()
  - getArrayU8FromWasm0 ()
  - getFloat32ArrayMemory0 ()
  - getStringFromWasm0 ()
  - getUint8ArrayMemory0 ()
  - isLikeNone ()
  - passArray8ToWasm0 ()
  - passArrayF32ToWasm0 ()
  - passStringToWasm0 ()
  - decodeText ()
  - __wbg_load ()
  - __wbg_get_imports ()
  - __wbg_finalize_init ()
  - __destroy_into_raw ()
- start (src/AudioManager.ts)
  - startFromFile (src/AudioManager.ts)
    - stop (src/AudioManager.ts)
    - createMediaStreamSource (src/__tests__/algorithms.test.ts)
    - createAnalyser (src/__tests__/algorithms.test.ts)
    - close (src/__tests__/algorithms.test.ts)
    - getTracks (src/__tests__/algorithms.test.ts)
    - trimSilence (src/utils.ts)
- isSignalAboveNoiseGate (public/wasm/wasm_processor.js)
- dbToAmplitude (src/utils.ts)
- reset (public/wasm/wasm_processor.js)
- generateSineWave (src/__tests__/algorithms.test.ts)
  - generateNoise (src/__tests__/algorithms.test.ts)
    - generateSquareWave (src/__tests__/algorithms.test.ts)
    - countZeroCrossings (src/__tests__/algorithms.test.ts)
- createSilentMockAudioContext (src/__tests__/oscilloscope.test.ts)
  - getFFTOverlayDimensions (src/__tests__/oscilloscope.test.ts)
    - findFFTOverlayBorderCall (src/__tests__/oscilloscope.test.ts)
    - getAudioTracks (src/__tests__/oscilloscope.test.ts)
    - getVideoTracks (src/__tests__/oscilloscope.test.ts)
- setUseWasm (src/Oscilloscope.ts)
- sliderValueToThreshold (src/main.ts)
  - formatThresholdDisplay (src/main.ts)
    - startFrequencyDisplay (src/main.ts)
    - stopFrequencyDisplay (src/main.ts)
- cleanup (src/WasmDataProcessor.ts)
- createAudioBuffer (src/__tests__/utils.test.ts)

---
Generated at: 2026-01-08 07:09:20 JST
