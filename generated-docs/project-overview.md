Last updated: 2026-01-12

# Project Overview

## プロジェクト概要
- ブラウザ上で動作する、リアルタイムなオシロスコープ風の波形ビジュアライザーです。
- マイク入力やWAVファイルから音声を分析し、ゼロクロス検出や多様な周波数推定アルゴリズムで波形を安定表示します。
- 主要なデータ処理はRust/WASMで高速に実行され、低周波の検出精度を向上させるバッファ拡張機能も提供します。

## 技術スタック
- フロントエンド:
    - **TypeScript**: 型安全なJavaScriptで、アプリケーションロジックとレンダリングを担当します。
    - **HTML Canvas**: 2DグラフィックスAPIで、リアルタイムの波形表示をレンダリングします。
    - **Web Audio API**: ブラウザでマイクからの音声キャプチャや音声ファイル解析、およびリアルタイムな音声処理を可能にします。
- 音楽・オーディオ:
    - **Web Audio API**: マイクからの音声キャプチャや音声ファイル解析、およびリアルタイムな音声処理を可能にします。
    - **Rust/WASM**: 高速なデータ処理が求められる周波数推定、ゼロクロス検出、波形類似探索などの主要な音声分析アルゴリズムを実装しています。
- 開発ツール:
    - **Node.js**: JavaScriptランタイムで、開発環境の構築やnpmパッケージの管理に使用されます。
    - **npm**: Node.jsのパッケージマネージャーで、依存関係の管理とスクリプト実行に使用されます。
    - **Vite**: 高速な開発サーバーとビルドツールで、モダンなWebアプリケーション開発を効率化します。
    - **wasm-pack**: RustコードをWebAssemblyにコンパイルし、JavaScriptから利用可能にするためのツールです。
- テスト:
    - **Vitest**: 高速なJavaScriptテストフレームワークで、各種コンポーネントやアルゴリズムの単体テスト、統合テストを実行します。
    - **@vitest/ui**: VitestのグラフィカルなテストUIを提供し、テスト結果の視覚的な確認を容易にします。
    - **happy-dom**: DOM環境をシミュレートし、ブラウザAPIに依存するコンポーネントのテストを可能にします。
- ビルドツール:
    - **Vite**: 高速なモジュールバンドラーで、本番環境向けの最適化されたビルドを生成します。
    - **vite-plugin-dts**: TypeScriptの型定義ファイル（.d.ts）を自動生成し、ライブラリとしての利用を容易にします。
    - **wasm-pack**: RustコードをWASMにビルドする際に使用されます。
- 言語機能:
    - **TypeScript**: JavaScriptに静的型付けを追加し、大規模なアプリケーション開発における堅牢性と保守性を高めます。
    - **Rust**: 高速性、安全性、並行性を特徴とするシステムプログラミング言語で、WebAssemblyモジュールの実装に使用されます。
- 自動化・CI/CD:
    - **cross-env**: 環境変数をクロスプラットフォームで設定するためのユーティリティで、ビルドやテストスクリプトで利用されます。
    - **GitHub Pages**: 自動デプロイとホスティングに利用され、ライブデモを公開しています。
- 開発標準:
    - **tsconfig.json**: TypeScriptコンパイラの設定ファイルで、プロジェクト全体の型チェック規則やコンパイルオプションを定義します。
    - **.gitignore**: Gitでバージョン管理しないファイルやディレクトリを指定します。

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
    📄 waveform_searcher.rs
    📄 zero_cross_detector.rs
```

## ファイル詳細説明
- `example-library-usage.html`: `cat-oscilloscope`ライブラリをプロジェクトに組み込む方法を示すサンプルHTMLファイルです。
- `index.html`: アプリケーションのメインエントリポイントとなるHTMLファイルで、UI要素やスクリプトの読み込みを定義します。
- `public/wasm/wasm_processor.d.ts`: Rust/WASMモジュールのTypeScript型定義ファイルで、WASMから公開される関数の型情報を提供します。
- `public/wasm/wasm_processor.js`: コンパイルされたWASMモジュールをJavaScriptからロード・利用するためのグルーコード（JavaScriptラッパー）です。
- `public/wasm/wasm_processor_bg.wasm.d.ts`: WASMモジュール自体の型定義ファイルの一部です。
- `src/AudioManager.ts`: Web Audio APIを利用して、マイク入力や音声ファイルからのオーディオデータ取得と管理を行うモジュールです。
- `src/ComparisonPanelRenderer.ts`: 異なる周波数推定アルゴリズムの結果などを比較表示するためのUIレンダリングを担当するモジュールです。
- `src/FrequencyEstimator.ts`: 各種周波数推定アルゴリズムを管理し、推定結果を提供するモジュールです。実際の実装はWASM側のロジックを呼び出します。
- `src/GainController.ts`: オシロスコープの波形振幅を自動調整（オートゲイン）するためのロジックを管理するモジュールです。
- `src/Oscilloscope.ts`: オシロスコープアプリケーションの主要なロジックをカプセル化し、音声入力の開始/停止、レンダリングの調整を行う中心モジュールです。
- `src/PianoKeyboardRenderer.ts`: 推定された周波数に対応するピアノ鍵盤の表示をレンダリングするモジュールです。
- `src/WaveformDataProcessor.ts`: 取得した音声データをWASMモジュールに渡し、波形探索、周波数推定などの主要なデータ処理をオーケストレーションするモジュールです。
- `src/WaveformRenderData.ts`: 波形レンダリングに必要なデータを保持するデータ構造を定義します。
- `src/WaveformRenderer.ts`: Canvas APIを使用して、音声波形、グリッド、FFTオーバーレイなどの視覚要素をレンダリングするモジュールです。
- `src/WaveformSearcher.ts`: 波形の安定表示のために、ゼロクロス点や類似波形を探索するロジックを管理するモジュールです。実際の実装はWASM側のロジックを呼び出します。
- `src/ZeroCrossDetector.ts`: 音声波形のゼロクロス点を検出するロジックを管理するモジュールです。実際の実装はWASM側のロジックを呼び出します。
- `src/__tests__/`: 各モジュールの単体テスト、UI統合テスト、ユーティリティテストなどが含まれるディレクトリです。
- `src/index.ts`: ライブラリとしてのエントリポイントで、`Oscilloscope`クラスを公開します。
- `src/main.ts`: アプリケーションのメインロジックを記述するファイルで、UIイベントのハンドリングや`Oscilloscope`インスタンスの初期化を行います。
- `src/utils.ts`: 各種ヘルパー関数（例: dBから振幅への変換、周波数から音符への変換、無音トリミング）を提供するユーティリティモジュールです。
- `vite.config.ts`: Viteのビルド設定ファイルで、開発サーバーや本番ビルドの挙動を定義します。
- `wasm-processor/Cargo.toml`: Rustプロジェクトの設定ファイルで、依存関係やビルド設定を定義します。
- `wasm-processor/src/frequency_estimator.rs`: 周波数推定アルゴリズムのRust実装が含まれます。
- `wasm-processor/src/gain_controller.rs`: オートゲイン機能のRust実装が含まれます。
- `wasm-processor/src/lib.rs`: Rust/WASMモジュールのエントリポイントで、他のRustモジュールを統合し、JavaScriptに公開する関数を定義します。
- `wasm-processor/src/waveform_searcher.rs`: 波形類似探索アルゴリズムのRust実装が含まれます。
- `wasm-processor/src/zero_cross_detector.rs`: ゼロクロス検出アルゴリズムのRust実装が含まれます。

## 関数詳細説明
- `initSync` (public/wasm/wasm_processor.d.ts, public/wasm/wasm_processor.js):
    - 役割: WebAssemblyモジュールを同期的に初期化します。
    - 引数: `moduleOrPath` (WebAssembly.ModuleオブジェクトまたはWASMファイルのパス)
    - 戻り値: なし
    - 機能: WASMモジュールがJavaScript環境で利用可能になるようにセットアップします。
- `__wbg_init` (public/wasm/wasm_processor.d.ts, public/wasm/wasm_processor.js):
    - 役割: WebAssemblyモジュールの非同期初期化を処理します。
    - 引数: `input` (WASMモジュールへのパスまたはPromise)
    - 戻り値: Promise<WebAssembly.Instance>
    - 機能: WASMモジュールの読み込みとインスタンス化を行い、初期化が完了したインスタンスを返します。
- `start` (src/AudioManager.ts, src/Oscilloscope.ts):
    - 役割: マイク入力からの音声処理を開始します。
    - 引数: なし
    - 戻り値: Promise<void>
    - 機能: ユーザーのマイクへのアクセスを要求し、Web Audio APIを介して音声データのキャプチャを開始します。`Oscilloscope.ts`では、`AudioManager`を介して音声入力を開始し、データ処理とレンダリングのループを起動します。
- `startFromFile` (src/AudioManager.ts, src/Oscilloscope.ts):
    - 役割: 指定された音声ファイルからの音声処理を開始します。
    - 引数: `file` (Fileオブジェクト)
    - 戻り値: Promise<void>
    - 機能: 提供された音声ファイルをデコードし、そのデータを使用して波形ビジュアライゼーションを開始します。`Oscilloscope.ts`では、`AudioManager`を介してファイルからの音声入力を開始し、データ処理とレンダリングループを起動します。
- `stop` (src/AudioManager.ts, src/Oscilloscope.ts):
    - 役割: 現在実行中の音声処理を停止します。
    - 引数: なし
    - 戻り値: なし
    - 機能: マイク入力やファイルからの音声ストリームを停止し、関連するWeb Audio APIノードを解放します。`Oscilloscope.ts`では、音声入力とレンダリングのループを停止します。
- `cleanup` (src/WaveformDataProcessor.ts):
    - 役割: `WaveformDataProcessor`が保持するリソースを解放します。
    - 引数: なし
    - 戻り値: なし
    - 機能: WASMインスタンスや関連するデータバッファなどのクリーンアップを実行します。
- `handleLoad` (src/WaveformDataProcessor.ts):
    - 役割: WASMモジュールのロード成功時の処理を行います。
    - 引数: `wasmModule` (ロードされたWASMモジュールインスタンス)
    - 戻り値: なし
    - 機能: WASMモジュールがロードされた後に、内部状態を初期化し、WASM関数への参照を設定します。
- `initialize` (src/WaveformDataProcessor.ts):
    - 役割: `WaveformDataProcessor`を初期化します。
    - 引数: `sampleRate`, `fftSize`, `bufferSizeMultiplier`, `frequencyEstimationMethod`, `usePeakMode`, `noiseGateThreshold`
    - 戻り値: Promise<void>
    - 機能: オーディオコンテキストのサンプルレートやFFTサイズ、WASM処理の設定など、データプロセッサの初期設定を行います。
- `loadWasmModule` (src/WaveformDataProcessor.ts):
    - 役割: WebAssemblyモジュールをロードします。
    - 引数: なし
    - 戻り値: Promise<void>
    - 機能: WASMモジュールファイルを非同期で読み込み、初期化します。
- `sliderValueToThreshold` (src/main.ts):
    - 役割: UIスライダーの値に基づいて、ノイズゲートのしきい値を計算します。
    - 引数: `sliderValue` (数値)
    - 戻り値: `number` (計算されたしきい値)
    - 機能: UIから入力されたスライダー値を、アプリケーションで使用される適切なノイズゲートしきい値に変換します。
- `formatThresholdDisplay` (src/main.ts):
    - 役割: ノイズゲートのしきい値表示を整形します。
    - 引数: `threshold` (数値)
    - 戻り値: `string` (整形された表示文字列)
    - 機能: 数値のしきい値をユーザーインターフェースに表示しやすい文字列形式に変換します。
- `startFrequencyDisplay` (src/main.ts):
    - 役割: 周波数表示の更新を開始します。
    - 引数: なし
    - 戻り値: なし
    - 機能: 推定された周波数をUIに表示するループを開始します。
- `stopFrequencyDisplay` (src/main.ts):
    - 役割: 周波数表示の更新を停止します。
    - 引数: なし
    - 戻り値: なし
    - 機能: 周波数表示の更新ループを停止します。
- `dbToAmplitude` (src/utils.ts):
    - 役割: デシベル(dB)値を振幅に変換します。
    - 引数: `db` (デシベル値)
    - 戻り値: `number` (変換された振幅値)
    - 機能: オーディオのデシベル値を線形な振幅値に変換します。
- `frequencyToNote` (src/utils.ts):
    - 役割: 周波数値を最も近い音符名とそのセント偏差に変換します。
    - 引数: `frequency` (周波数値)
    - 戻り値: `{ note: string, cents: number }` (音符名とセント偏差を含むオブジェクト)
    - 機能: 周波数を音楽的な音符にマッピングし、チューニングの精度を示すセント値も提供します。
- `trimSilence` (src/utils.ts):
    - 役割: オーディオデータから先頭と末尾の無音部分をトリミングします。
    - 引数: `buffer` (AudioBuffer), `threshold` (無音と判断するしきい値)
    - 戻り値: `AudioBuffer` (トリミングされたAudioBuffer)
    - 機能: 指定されたしきい値以下の振幅が続く部分を無音と判断し、音声データの開始点と終了点を調整します。
- `processFrame` (public/wasm/wasm_processor.js):
    - 役割: WASM側で1フレーム分のオーディオデータを処理し、波形情報や周波数推定結果などを更新します。
    - 引数: `input_data_ptr`, `input_data_len`, `sample_rate`, `auto_gain_enabled`, `current_gain_val`, `noise_gate_enabled`, `noise_gate_threshold_val`, `buffer_size_multiplier`, `frequency_estimation_method`, `use_peak_mode`
    - 戻り値: `WasmProcessor` (更新されたWASMプロセッサインスタンス)
    - 機能: 生のオーディオデータを取得し、ゼロクロス検出、周波数推定、波形類似探索などのアルゴリズムを適用し、結果を内部状態に保持します。
- `setAutoGain` (public/wasm/wasm_processor.js):
    - 役割: オートゲイン機能の有効/無効を設定します。
    - 引数: `enabled` (boolean)
    - 戻り値: なし
    - 機能: 波形の振幅自動調整を制御します。
- `setNoiseGate` (public/wasm/wasm_processor.js):
    - 役割: ノイズゲート機能の有効/無効を設定します。
    - 引数: `enabled` (boolean)
    - 戻り値: なし
    - 機能: 特定のしきい値以下の音声を無視するように制御します。
- `setUsePeakMode` (public/wasm/wasm_processor.js):
    - 役割: ゲイン制御におけるピークモードの使用を設定します。
    - 引数: `use_peak_mode` (boolean)
    - 戻り値: なし
    - 機能: ゲインの計算方法を、RMSではなくピーク値に基づいて行うかどうかを切り替えます。
- `setNoiseGateThreshold` (public/wasm/wasm_processor.js):
    - 役割: ノイズゲートのしきい値を設定します。
    - 引数: `threshold` (number)
    - 戻り値: なし
    - 機能: ノイズと判断する音量レベルを設定します。
- `setBufferSizeMultiplier` (public/wasm/wasm_processor.js):
    - 役割: バッファサイズ乗数を設定し、低周波検出の精度を調整します。
    - 引数: `multiplier` (number)
    - 戻り値: なし
    - 機能: 過去のフレームバッファを利用して、処理するオーディオデータの量を増やし、低周波数の検出精度を向上させます。
- `setFrequencyEstimationMethod` (public/wasm/wasm_processor.js):
    - 役割: 使用する周波数推定アルゴリズムを設定します。
    - 引数: `method` (number, 0-4のインデックス)
    - 戻り値: なし
    - 機能: Zero-Crossing, Autocorrelation, FFT, STFT, CQTの中から周波数推定に使用するアルゴリズムを選択します。

## 関数呼び出し階層ツリー
```
- initSync (public/wasm/wasm_processor.d.ts)
  - free ()
  - processFrame ()
  - setAutoGain ()
  - setNoiseGate ()
  - setUsePeakMode ()
  - setNoiseGateThreshold ()
  - setBufferSizeMultiplier ()
  - setFrequencyEstimationMethod ()
- __wbg_init (public/wasm/wasm_processor.d.ts)
- getArrayF32FromWasm0 (public/wasm/wasm_processor.js)
- getArrayU8FromWasm0 (public/wasm/wasm_processor.js)
- getFloat32ArrayMemory0 (public/wasm/wasm_processor.js)
- getStringFromWasm0 (public/wasm/wasm_processor.js)
- getUint8ArrayMemory0 (public/wasm/wasm_processor.js)
- isLikeNone (public/wasm/wasm_processor.js)
- passArray8ToWasm0 (public/wasm/wasm_processor.js)
- passArrayF32ToWasm0 (public/wasm/wasm_processor.js)
- passStringToWasm0 (public/wasm/wasm_processor.js)
- decodeText (public/wasm/wasm_processor.js)
- start (src/AudioManager.ts)
  - startFromFile (src/AudioManager.ts)
    - stop (src/AudioManager.ts)
    - createMediaStreamSource (src/__tests__/dom-integration.test.ts)
    - createAnalyser (src/__tests__/dom-integration.test.ts)
    - close (src/__tests__/dom-integration.test.ts)
    - getTracks (src/__tests__/dom-integration.test.ts)
    - trimSilence (src/utils.ts)
- createSilentMockAudioContext (src/__tests__/oscilloscope.test.ts)
  - getFFTOverlayDimensions (src/__tests__/oscilloscope.test.ts)
    - findFFTOverlayBorderCall (src/__tests__/oscilloscope.test.ts)
    - getAudioTracks (src/__tests__/oscilloscope.test.ts)
    - getVideoTracks (src/__tests__/oscilloscope.test.ts)
    - dbToAmplitude (src/utils.ts)
- sliderValueToThreshold (src/main.ts)
  - formatThresholdDisplay (src/main.ts)
    - startFrequencyDisplay (src/main.ts)
    - stopFrequencyDisplay (src/main.ts)
    - frequencyToNote (src/utils.ts)
- cleanup (src/WaveformDataProcessor.ts)
- createAudioBuffer (src/__tests__/utils.test.ts)

---
Generated at: 2026-01-12 07:09:00 JST
