Last updated: 2026-01-09

# Project Overview

## プロジェクト概要
- マイク入力や音声ファイルに対応した、ブラウザ上で動作する高機能なオシロスコープ風波形ビジュアライザーです。
- ゼロクロス検出や多様な周波数推定アルゴリズムにより、音の波形や周波数をリアルタイムで安定して可視化します。
- JavaScript（TypeScript）と高速なRust/WASM実装を切り替え可能で、低周波解析の精度向上オプションも提供します。

## 技術スタック
- フロントエンド: **TypeScript**: 型安全なJavaScriptで大規模開発を支援し、コードの品質と保守性を向上させます。**HTML Canvas**: 2Dグラフィック描画に使用され、リアルタイムで音の波形を視覚的にレンダリングします。**Web Audio API**: ブラウザでの音声入力（マイク）や音声ファイルの処理、解析を可能にする中核技術です。
- 音楽・オーディオ: **Web Audio API**: マイク入力や音声ファイルのデータフローを制御し、波形データや周波数データのリアルタイム処理を行います。
- 開発ツール: **Node.js**: JavaScript実行環境として、開発サーバーの起動やビルドスクリプトの実行に利用されます。**npm/yarn**: プロジェクトの依存関係を管理し、パッケージのインストールやスクリプトの実行をサポートします。**Vite**: 高速な開発サーバーとビルドツールであり、迅速な開発体験を提供します。
- テスト: **Vitest**: 高速なユニットテストフレームワークで、コードの品質と信頼性を確保するためのテストを実行します。**@vitest/ui**: Vitestのテスト結果をグラフィカルなユーザーインターフェースで表示し、テストのデバッグを容易にします。**Happy DOM**: DOM環境をシミュレートし、ブラウザに依存しないJavaScriptコードのテストを可能にします。
- ビルドツール: **Vite**: フロントエンド資産（HTML, CSS, JavaScript）を最適化し、本番環境向けにバンドルします。**Rust toolchain**: Rustコードのコンパイルに必要なツール群。**wasm-pack**: Rustで書かれたコードをWebAssembly（WASM）形式に変換します。**vite-plugin-dts**: TypeScriptの型定義ファイル（.d.ts）を自動生成し、ライブラリとしての利用を容易にします。
- 言語機能: **TypeScript**: 静的型付けを導入することで、開発時のエラーを減らし、コードの可読性と保守性を高めます。**Rust**: 高性能なデータ処理ロジックを記述するために使用され、WebAssemblyとしてブラウザで実行することで高い処理速度を実現します。
- 自動化・CI/CD: **Vite**: ビルドプロセスを自動化し、開発からデプロイまでのワークフローを効率化するための基盤として機能します。
- 開発標準: 特定の開発標準ツールは明記されていませんが、TypeScriptの採用によりコードの品質と一貫性を維持しています。

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
  📖 110.md
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
    📘 wasm-data-processor.test.ts
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
    📄 waveform_searcher.rs
    📄 zero_cross_detector.rs
```

## ファイル詳細説明
- **IMPLEMENTATION_SUMMARY.md**: プロジェクトの実装に関する概要や設計思想をまとめたドキュメントです。
- **LIBRARY_USAGE.md**: 本プロジェクトをnpmライブラリとして他のプロジェクトで使用する際の手順やコード例を説明したドキュメントです。
- **LICENSE**: プロジェクトのライセンス情報（MITライセンス）が記載されています。
- **README.ja.md**: プロジェクトの概要、機能、使用方法などが日本語で書かれたメインドキュメントです。
- **README.md**: プロジェクトの概要、機能、使用方法などが英語で書かれたメインドキュメントです。
- **REFACTORING_SUMMARY.md**: リファクタリングの経緯や内容についてまとめたドキュメントです。
- **TESTING.md**: プロジェクトのテスト方法、テストスイートの構成、テストコマンドなどが説明されています。
- **_config.yml**: GitHub Pagesなどの設定ファイルです。
- **example-library-usage.html**: ライブラリとしての使用例を示すためのHTMLファイルです。
- **generated-docs/**: ドキュメント生成ツールによって自動生成されたファイルが格納されるディレクトリです。
- **index.html**: アプリケーションのエントリーポイントとなるHTMLファイルで、ユーザーインターフェースの骨格を定義しています。
- **issue-notes/**: 過去の課題や不具合追跡用のメモファイル群を格納するディレクトリです。プロジェクトの特定の改善点やバグについて記録されています。
- **package-lock.json**: `package.json`で定義された依存関係の正確なバージョンと依存ツリーを記録し、ビルドの再現性を保証します。
- **package.json**: プロジェクトのメタデータ（名前、バージョン、スクリプト、依存関係など）を定義するファイルです。
- **public/wasm/wasm_processor.d.ts**: WebAssemblyモジュール（`wasm_processor.js`）のTypeScript型定義ファイルです。
- **public/wasm/wasm_processor.js**: Rustで書かれたWebAssemblyモジュールをJavaScriptから利用するためのラッパーコードです。
- **public/wasm/wasm_processor_bg.wasm**: Rustでコンパイルされたバイナリ形式のWebAssemblyモジュール本体です。
- **public/wasm/wasm_processor_bg.wasm.d.ts**: `wasm_processor_bg.wasm`に関する低レベルなTypeScript型定義ファイルです。
- **src/AudioManager.ts**: マイク入力や音声ファイルの読み込み、Web Audio APIを使った音声データのキャプチャと処理を管理します。
- **src/ComparisonPanelRenderer.ts**: 波形比較パネルの描画ロジックを実装し、複数の波形を同時に表示するための描画を行います。
- **src/FrequencyEstimator.ts**: ゼロクロス法、自己相関法、FFT、STFT、CQTなど、複数の周波数推定アルゴリズムを実装しています。
- **src/GainController.ts**: 波形の振幅を自動的に調整（オートゲイン）し、表示領域に最適化された見やすい波形を提供します。
- **src/Oscilloscope.ts**: オシロスコープ機能全体の中心となるクラスで、各種モジュール（音声管理、データ処理、レンダリングなど）を統合し、アプリケーションのライフサイクルを管理します。
- **src/WasmDataProcessor.ts**: Rust/WebAssemblyで実装されたデータ処理ロジックとTypeScriptアプリケーション間の橋渡しを行います。
- **src/WaveformDataProcessor.ts**: TypeScriptで実装された波形データの処理ロジック（波形整形、サンプリングなど）を担います。
- **src/WaveformRenderData.ts**: オシロスコープが波形を描画するために必要なデータ構造を定義します。
- **src/WaveformRenderer.ts**: HTML Canvasに波形データ、グリッド、周波数情報などを描画するためのロジックを実装します。
- **src/WaveformSearcher.ts**: 安定した波形表示を実現するために、過去のフレームとの類似度を計算し、波形を整列させるロジックを提供します。
- **src/ZeroCrossDetector.ts**: 波形がゼロを横切るポイント（ゼロクロス）を検出するためのアルゴリズムを実装し、安定した波形表示の基準とします。
- **src/__tests__/**: 各コンポーネントや機能のユニットテスト、統合テストを格納するディレクトリです。
- **src/index.ts**: プロジェクトがnpmライブラリとして使用される際のエントリーポイントとなるファイルです。
- **src/main.ts**: アプリケーションの主要なロジック、UI要素との連携、イベントハンドリングなどを管理するメインスクリプトです。
- **src/utils.ts**: プロジェクト内で汎用的に使用されるユーティリティ関数（例: dB値と振幅値の変換、無音部分のトリミング）を定義します。
- **tsconfig.json**: TypeScriptコンパイラの設定ファイルで、プロジェクトのコンパイルオプションを定義します。
- **tsconfig.lib.json**: ライブラリとしてのビルド時に使用されるTypeScriptコンパイラの追加設定ファイルです。
- **vite.config.ts**: Viteビルドツールの設定ファイルで、プラグイン、ビルドオプションなどを定義します。
- **wasm-processor/Cargo.toml**: Rust/WebAssemblyモジュールの依存関係とプロジェクト設定を定義するファイルです。
- **wasm-processor/src/frequency_estimator.rs**: Rustで実装された周波数推定アルゴリズムのソースコードです。
- **wasm-processor/src/gain_controller.rs**: Rustで実装された自動ゲイン制御ロジックのソースコードです。
- **wasm-processor/src/lib.rs**: Rust/WebAssemblyモジュールのエントリポイントとなるファイルで、WASMから呼び出される主要な関数を定義します。
- **wasm-processor/src/waveform_searcher.rs**: Rustで実装された波形類似探索ロジックのソースコードです。
- **wasm-processor/src/zero_cross_detector.rs**: Rustで実装されたゼロクロス検出アルゴリズムのソースコードです。

## 関数詳細説明
- **cleanup()** (src/WasmDataProcessor.ts): WASM関連のリソースを解放し、クリーンアップ処理を行います。
- **constructor(canvas: HTMLCanvasElement)** (src/Oscilloscope.ts): `Oscilloscope`インスタンスを初期化し、指定されたHTML Canvas要素と連携させて波形描画の準備をします。
- **constructor()** (src/ComparisonPanelRenderer.ts): `ComparisonPanelRenderer`インスタンスを初期化し、比較パネルの描画に必要な設定を行います。
- **constructor()** (src/WaveformDataProcessor.ts): `WaveformDataProcessor`インスタンスを初期化し、TypeScriptによる波形データ処理の準備をします。
- **constructor()** (src/WaveformRenderer.ts): `WaveformRenderer`インスタンスを初期化し、Canvasへの波形描画処理の準備をします。
- **dbToAmplitude(db: number)** (src/utils.ts): デシベル値を振幅値に変換します。
    - 引数: `db` (number) - デシベル値。
    - 戻り値: `number` - 変換された振幅値。
- **formatThresholdDisplay(threshold: number)** (src/main.ts): ノイズゲート閾値を表示に適した形式の文字列にフォーマットします。
    - 引数: `threshold` (number) - ノイズゲートの閾値。
    - 戻り値: `string` - フォーマットされた表示文字列。
- **generateNoise(duration: number, sampleRate: number)** (src/__tests__/algorithms.test.ts): 指定された期間とサンプルレートでホワイトノイズの音声データを生成します。
    - 引数: `duration` (number) - 生成するノイズの秒数、`sampleRate` (number) - サンプルレート。
    - 戻り値: `Float32Array` - 生成されたノイズデータ。
- **generateSineWave(frequency: number, sampleRate: number, duration: number)** (src/__tests__/algorithms.test.ts): 指定された周波数、サンプルレート、期間でサイン波の音声データを生成します。
    - 引数: `frequency` (number) - サイン波の周波数、`sampleRate` (number) - サンプルレート、`duration` (number) - 生成するサイン波の秒数。
    - 戻り値: `Float32Array` - 生成されたサイン波データ。
- **generateSquareWave(frequency: number, sampleRate: number, duration: number)** (src/__tests__/algorithms.test.ts): 指定された周波数、サンプルレート、期間で矩形波の音声データを生成します。
    - 引数: `frequency` (number) - 矩形波の周波数、`sampleRate` (number) - サンプルレート、`duration` (number) - 生成する矩形波の秒数。
    - 戻り値: `Float32Array` - 生成された矩形波データ。
- **handleLoad(url: string)** (src/WasmDataProcessor.ts): 指定されたURLからWebAssemblyモジュールをロードします。
    - 引数: `url` (string) - WASMモジュールのURL。
    - 戻り値: `Promise<void>`。
- **initialize()** (src/WasmDataProcessor.ts): WebAssemblyモジュールの初期化処理を行います。
    - 戻り値: `Promise<void>`。
- **loadWasmModule(wasmPath: string)** (src/WasmDataProcessor.ts): 指定されたパスからWebAssemblyモジュールを動的にロードします。
    - 引数: `wasmPath` (string) - WASMファイルのパス。
    - 戻り値: `Promise<void>`。
- **setUseWasm(useWasm: boolean)** (src/Oscilloscope.ts): データ処理にWebAssemblyを使用するか、TypeScript実装を使用するかを切り替えます。
    - 引数: `useWasm` (boolean) - trueの場合WASMを使用、falseの場合TypeScriptを使用。
- **sliderValueToThreshold(value: number)** (src/main.ts): UIスライダーの値をノイズゲートの閾値（dB値）に変換します。
    - 引数: `value` (number) - スライダーの現在値。
    - 戻り値: `number` - 変換された閾値（dB）。
- **start()** (src/AudioManager.ts): マイクからの音声入力ストリームを開始し、オーディオ処理を開始します。
    - 戻り値: `Promise<void>`。
- **start()** (src/Oscilloscope.ts): オシロスコープのリアルタイム描画と音声処理を開始します。
    - 戻り値: `Promise<void>`。
- **startFromFile(file: File)** (src/AudioManager.ts): 指定された音声ファイル（WAVなど）からの音声入力を開始します。
    - 引数: `file` (File) - 処理する音声ファイルオブジェクト。
    - 戻り値: `Promise<void>`。
- **startFromFile(file: File)** (src/Oscilloscope.ts): 指定されたファイルからの音声入力に基づいてオシロスコープの描画を開始します。
    - 引数: `file` (File) - 処理する音声ファイルオブジェクト。
    - 戻り値: `Promise<void>`。
- **startFrequencyDisplay(data: WaveformRenderData)** (src/main.ts): UI上の周波数表示の更新を開始し、リアルタイムで周波数データを表示します。
    - 引数: `data` (WaveformRenderData) - 波形レンダリングデータオブジェクト。
- **stop()** (src/AudioManager.ts): 現在のアクティブな音声入力ストリームを停止し、関連するオーディオリソースを解放します。
- **stop()** (src/Oscilloscope.ts): オシロスコープのリアルタイム処理と描画を停止し、リソースを解放します。
- **stopFrequencyDisplay()** (src/main.ts): UI上の周波数表示の更新を停止します。
- **trimSilence(buffer: Float32Array, threshold: number)** (src/utils.ts): 音声バッファの先頭と末尾にある無音部分を、指定された閾値に基づいてトリミングします。
    - 引数: `buffer` (Float32Array) - 処理する音声データバッファ、`threshold` (number) - 無音と判断する振幅の閾値。
    - 戻り値: `Float32Array` - トリミングされた音声データバッファ。
- **WASMモジュール内部関数群** (public/wasm/wasm_processor.js, public/wasm/wasm_processor.d.ts): `getArrayF32FromWasm0`, `initSync`, `__wbg_init`, `processFrame`, `setAutoGain`など、WebAssemblyモジュール内でデータ処理、初期化、ゲイン制御、ノイズゲート設定、周波数推定方法の変更などを行う低レベル関数群です。これらはJavaScriptラッパーを通じて間接的に利用されます。

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
  - function ()
  - __destroy_into_raw ()
- if (src/AudioManager.ts)
  - start ()
    - startFromFile ()
      - stop ()
      - createMediaStreamSource ()
      - createAnalyser ()
      - close ()
      - getTracks ()
      - trimSilence ()
  - isSignalAboveNoiseGate ()
  - dbToAmplitude ()
  - reset ()
  - generateSineWave (src/__tests__/algorithms.test.ts)
    - generateNoise ()
      - generateSquareWave ()
      - countZeroCrossings ()
  - createSilentMockAudioContext (src/__tests__/oscilloscope.test.ts)
    - getFFTOverlayDimensions ()
      - findFFTOverlayBorderCall ()
      - getAudioTracks ()
      - getVideoTracks ()
  - setUseWasm ()
  - sliderValueToThreshold (src/main.ts)
    - formatThresholdDisplay ()
      - startFrequencyDisplay ()
      - stopFrequencyDisplay ()
- catch (src/AudioManager.ts)
- for (src/AudioManager.ts)
- switch (src/FrequencyEstimator.ts)
- cleanup (src/WasmDataProcessor.ts)
- createAudioBuffer (src/__tests__/utils.test.ts)

---
Generated at: 2026-01-09 07:09:47 JST
