Last updated: 2026-01-11

# Project Overview

## プロジェクト概要
- ブラウザ上でマイク入力や音声ファイルから、リアルタイムで波形を可視化するオシロスコープ風アプリケーションです。
- 高速なRust/WASMによる音声処理とWeb Audio APIを活用し、多様な周波数推定アルゴリズムを提供します。
- 音声の波形表示を安定させ、低周波の検出精度を向上させる機能を備えた、開発者も利用できるライブラリです。

## 技術スタック
- フロントエンド: TypeScript (型安全なJavaScriptによるアプリケーションロジック開発), HTML Canvas (波形やグリッド、ピアノ鍵盤の2Dグラフィック描画), Web Audio API (マイク入力や音声ファイルのキャプチャ・分析)。
- 音楽・オーディオ: Web Audio API (リアルタイム音声処理、分析ノードの制御), Rust/WASM (高性能な音声データ処理アルゴリズムの実装)。
- 開発ツール: Vite (高速な開発サーバーとビルドツール), Node.js (JavaScriptランタイム), npm/yarn (パッケージ管理)。
- テスト: Vitest (高速な単体・統合テストフレームワーク), @vitest/ui (テスト実行結果のUI表示), happy-dom (DOM環境をシミュレートするテストユーティリティ)。
- ビルドツール: Vite (アプリケーション全体のビルド), wasm-pack (RustコードをWebAssemblyにビルドするツール), vite-plugin-dts (TypeScript定義ファイルを生成するViteプラグイン)。
- 言語機能: TypeScript (型推論、インターフェースによるコードの堅牢性向上), Rust (メモリ安全性、並行処理、パフォーマンスを追求したデータ処理実装)。
- 自動化・CI/CD: npmスクリプト (`build:wasm`, `build`, `test`など) を活用したビルドおよびテストプロセスの自動化。
- 開発標準: tsconfig.json (TypeScriptコンパイラ設定によるコード品質の統一), tsconfig.lib.json (ライブラリビルド用のTypeScript設定)。

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
- `CONSOLIDATION_SUMMARY.md`, `IMPLEMENTATION_NOTES_117.md`, `IMPLEMENTATION_SUMMARY.md`, `REFACTORING_SUMMARY.md`: プロジェクトの統合、特定の実装、全体の実装概要、およびリファクタリングに関する開発者向けのメモや要約ドキュメントです。
- `LIBRARY_USAGE.md`: `cat-oscilloscope` をnpmライブラリとして既存のプロジェクトで利用する方法を詳細に説明するドキュメントです。
- `README.ja.md`, `README.md`: プロジェクトの概要、主要機能、ライブデモ、技術スタック、利用方法などを説明する主要なドキュメント（日本語版と英語版）。
- `TESTING.md`: プロジェクトのテストの実行方法やテスト戦略に関する詳細な情報を提供するドキュメントです。
- `example-library-usage.html`: `cat-oscilloscope` をライブラリとしてウェブページに組み込む際の具体的なHTMLとJavaScriptの使用例を示します。
- `index.html`: WebアプリケーションのメインとなるHTMLファイルで、ユーザーインターフェースの構造と初期スクリプトの読み込みを定義します。
- `issue-notes/`: 開発中に発生した特定の問題点、バグ、機能に関する議論や調査結果を記録したMarkdownファイルの集合です。
- `package-lock.json`: プロジェクトの依存関係ツリーの正確なバージョンを記録し、ビルドの再現性を保証します。
- `package.json`: プロジェクトのメタデータ（名前、バージョン）、依存関係、開発スクリプトなどを定義するファイルです。
- `public/wasm/wasm_processor.d.ts`: Rustで記述されたWebAssemblyモジュール `wasm_processor` のTypeScript型定義ファイルを提供し、JavaScriptからの型安全な呼び出しを可能にします。
- `public/wasm/wasm_processor.js`: `wasm_processor.wasm` WebAssemblyバイナリをブラウザでロードし、JavaScriptからアクセスするためのグルーコード（接着コード）です。
- `public/wasm/wasm_processor_bg.wasm`: RustでコンパイルされたWebAssemblyバイナリで、音声データ処理（周波数推定、ゼロクロス検出など）の高性能なアルゴリズムが実装されています。
- `public/wasm/wasm_processor_bg.wasm.d.ts`: `wasm_processor_bg.wasm` モジュールの低レベルなWebAssemblyのTypeScript型定義ファイルです。
- `src/AudioManager.ts`: Web Audio APIを管理し、マイクからのリアルタイム音声入力や、WAVファイルからの音声データを取得・バッファリングする役割を担います。
- `src/ComparisonPanelRenderer.ts`: 複数の周波数推定アルゴリズムの結果などを比較して視覚的に表示するための描画ロジックを管理します。
- `src/FrequencyEstimator.ts`: ゼロクロス法、自己相関法、FFT、STFT、CQTなど、サポートされている周波数推定アルゴリズムの選択と、WASMモジュールを介した実行を制御するインターフェースを提供します。
- `src/GainController.ts`: 入力音声の振幅を自動的に調整し、キャンバス全体に波形が最適に表示されるようにするオートゲイン機能のロジックを実装します。
- `src/Oscilloscope.ts`: アプリケーション全体の主要なコントローラークラスです。音声データの処理、Canvasへのレンダリング、UI要素との連携を統合し、オシロスコープの動作を管理します。
- `src/PianoKeyboardRenderer.ts`: オシロスコープの波形表示の下部に、ピアノの鍵盤を模した表示を描画し、推定された周波数に対応する鍵盤をハイライトするロジックを実装します。
- `src/WaveformDataProcessor.ts`: WASMモジュールとの橋渡しを行い、生の音声データをWASMで処理させた後、レンダリングに適した形式のデータに変換・準備する役割を担います。
- `src/WaveformRenderData.ts`: 波形レンダリングに必要な情報（例：実際の波形データ、表示範囲、推定周波数、ゲインなど）をカプセル化するためのデータ構造を定義します。
- `src/WaveformRenderer.ts`: HTML Canvas要素に、取得した波形データ、グリッド、FFTオーバーレイ、テキスト情報などを描画する具体的なロジックを実装します。
- `src/WaveformSearcher.ts`: 安定した波形表示を実現するために、前フレームとの類似度を計算し、最適な波形表示の開始点を探索する処理をWASMモジュールを介して実行するインターフェースです。
- `src/ZeroCrossDetector.ts`: 波形がゼロを横切るポイントを検出するアルゴリズムを、WASMモジュールを介して実行するインターフェースです。安定した波形表示の基準点を提供します。
- `src/__tests__/`: プロジェクトの様々なモジュールや機能に対する単体テスト、統合テストコードを格納するディレクトリです。例えば、`algorithms.test.ts` (各種アルゴリズムのテスト), `dom-integration.test.ts` (DOMとの連携テスト), `oscilloscope.test.ts` (オシロスコープ全体のテスト) などが含まれます。
- `src/index.ts`: `cat-oscilloscope` をnpmライブラリとして公開する際のエントリポイントファイルです。主に `Oscilloscope` クラスを外部にエクスポートします。
- `src/main.ts`: Webアプリケーションのメインスクリプトで、DOM要素の取得、UIイベントリスナーの設定、`Oscilloscope` クラスの初期化と制御を行い、アプリケーションの起動ロジックを管理します。
- `src/utils.ts`: デシベル値から振幅への変換、周波数から音楽のノート名への変換、音声データの無音部分のトリミングなど、プロジェクト全体で汎用的に利用されるユーティリティ関数群を含みます。
- `tsconfig.json`: TypeScriptコンパイラの設定ファイルで、プロジェクト全体のTypeScriptコードのコンパイルオプションや挙動を定義します。
- `tsconfig.lib.json`: `cat-oscilloscope` をライブラリとしてビルドする際のTypeScriptコンパイラ設定ファイルです。
- `vite.config.ts`: Viteビルドツールの設定ファイルで、バンドル、トランスパイル、開発サーバーの挙動、プラグインの利用などを定義します。
- `wasm-processor/Cargo.toml`: Rustプロジェクトの依存関係、バージョン情報、ビルド設定などを定義するマニフェストファイルです。
- `wasm-processor/src/frequency_estimator.rs`: Zero-Crossing、Autocorrelation、FFT、STFT、CQTなど、様々な周波数推定アルゴリズムのRustによる高速な実装を含みます。
- `wasm-processor/src/gain_controller.rs`: オートゲイン機能の中核となるロジックをRustで実装し、最適な表示振幅を計算します。
- `wasm-processor/src/lib.rs`: Rust/WASMモジュールのルートファイルで、JavaScriptから呼び出される公開関数（Foreign Procedure Interface）を定義し、内部のRustロジックをWebAssemblyとしてエクスポートします。
- `wasm-processor/src/waveform_searcher.rs`: 安定した波形表示のために、波形データを比較し最適な表示開始点を特定するアルゴリズムをRustで実装します。
- `wasm-processor/src/zero_cross_detector.rs`: 波形がゼロを横切る点を高精度で検出するアルゴリズムをRustで実装し、安定した波形表示の基準点を提供します。

## 関数詳細説明
- `getArrayF32FromWasm0(ptr, len)`: WASMメモリから指定されたポインタと長さに基づいて `Float32Array` を取得します。
- `getArrayU8FromWasm0(ptr, len)`: WASMメモリから指定されたポインタと長さに基づいて `Uint8Array` を取得します。
- `getFloat32ArrayMemory0()`: WASMメモリ内の `Float32Array` ビューを取得します。
- `getStringFromWasm0(ptr, len)`: WASMメモリから指定されたポインタと長さでUTF-8文字列を取得します。
- `getUint8ArrayMemory0()`: WASMメモリ内の `Uint8Array` ビューを取得します。
- `isLikeNone(value)`: 指定された値がJavaScriptの `null` または `undefined` に類似しているかをチェックします。
- `passArray8ToWasm0(arg0, malloc)`: JavaScriptの `Uint8Array` をWASMメモリにコピーします。
- `passArrayF32ToWasm0(arg0, malloc)`: JavaScriptの `Float32Array` をWASMメモリにコピーします。
- `passStringToWasm0(arg0, malloc)`: JavaScriptの文字列をUTF-8エンコーディングでWASMメモリにコピーします。
- `decodeText(decoder, arg0, arg1)`: WASMメモリから取得したバイト列を指定されたデコーダで文字列にデコードします。
- `__wbg_load(module, imports)`: WebAssemblyモジュールを内部的にロードするためのヘルパー関数です。
- `__wbg_get_imports()`: WebAssemblyモジュールのインポートを取得するための内部ヘルパー関数です。
- `__wbg_finalize_init(wasm)`: WebAssembly初期化プロセスの最終ステップを実行します。
- `initSync(module)`: WebAssemblyモジュールを同期的に初期化し、JavaScriptからWASM機能を直接利用可能にします。
- `__wbg_init(input, maybe_memory)`: WebAssemblyモジュールを非同期に初期化します。
- `__destroy_into_raw()`: WASMオブジェクトに関連する内部メモリを解放します。
- `free()`: WASMオブジェクトのメモリを解放します。
- `processFrame(input, sampleRate, displayBufferSize, waveformRenderDataPtr, frequencyPlotDataPtr, similarityPlotDataPtr)`: 入力された音声フレームデータをWASMで処理し、波形、周波数、類似度に関するデータを計算してJavaScriptに返します。
- `setAutoGain(enabled)`: オートゲイン機能を有効または無効に設定します。
- `setNoiseGate(enabled)`: ノイズゲート機能を有効または無効に設定します。
- `setUsePeakMode(enabled)`: ピークモードを使用するかどうかを設定します。
- `setNoiseGateThreshold(threshold)`: ノイズゲートの閾値（デシベル値）を設定します。
- `setBufferSizeMultiplier(multiplier)`: 波形バッファのサイズ乗数を設定し、低周波検出精度に影響を与えます。
- `setFrequencyEstimationMethod(method)`: 周波数推定アルゴリズム（Zero-Crossing, Autocorrelation, FFT, STFT, CQT）を設定します。
- `constructor(canvas)`: 各クラス（例: `Oscilloscope`, `WaveformRenderer`）のインスタンスを生成し、初期状態を設定します。
- `reset()`: WASMモジュールの内部処理状態をリセットし、新しいデータの処理準備をします。
- `similarity(a, b)`: 二つの波形データの間の類似度を計算します（Rust/WASMで実装）。
- `start()`: オシロスコープの音声処理と波形レンダリングのループを開始します。マイク入力の取得やアニメーションフレームのスケジューリングが含まれます。
- `startFromFile(file)`: 指定された音声ファイルから音声入力の処理を開始します。
- `stop()`: オシロスコープの音声処理とレンダリングを停止し、リソースを解放します。
- `cleanup()`: `WaveformDataProcessor` で使用されているリソース（例: WASMメモリ）を解放します。
- `handleLoad(event)`: WAVファイルがブラウザに読み込まれた際のイベントを処理し、音声データのデコードと処理を開始します。
- `initialize(audioContext, wasmModule)`: `WaveformDataProcessor` の内部状態を初期化し、Web Audio ContextとWASMモジュールを設定します。
- `loadWasmModule()`: `WaveformDataProcessor` が必要に応じてWebAssemblyモジュールを動的にロードします。
- `sliderValueToThreshold(value)`: UIのスライダーの値をデシベル単位の閾値に変換します。
- `formatThresholdDisplay(threshold)`: デシベル閾値をユーザーフレンドリーな表示形式にフォーマットします。
- `startFrequencyDisplay()`: 周波数表示の更新を開始するための処理をトリガーします。
- `stopFrequencyDisplay()`: 周波数表示の更新を停止します。
- `dbToAmplitude(db)`: デシベル値（db）を線形な振幅値に変換します。
- `frequencyToNote(frequency)`: 特定の周波数（Hz）を音楽のノート名（例: "A4", "C#5"）に変換します。
- `trimSilence(buffer, threshold)`: 音声バッファの先頭と末尾から、指定された閾値以下の無音部分をトリミングします。
- `createSilentMockAudioContext()`: テスト目的で、実際の音声出力を行わないモックのAudioContextを作成します。
- `getFFTOverlayDimensions()`: FFTオーバーレイの描画に関する寸法情報を取得します（主にテスト用）。
- `findFFTOverlayBorderCall()`: FFTオーバーレイの境界線描画コールを特定します（主にテスト用）。
- `createMediaStreamSource(context, stream)`: `MediaStream` (例: マイク入力) から `MediaStreamAudioSourceNode` を作成し、AudioContextに接続可能にします。
- `createAnalyser(context)`: `AnalyserNode` を作成し、音声データの時間領域（波形）および周波数領域（スペクトラム）のデータを分析できるようにします。
- `close()`: `AudioContext` や `MediaStreamTrack` などのリソースを閉じ、解放します。
- `getTracks()`: `MediaStream` に含まれるすべての `MediaStreamTrack` のリストを返します。
- `getAudioTracks()`: `MediaStream` に含まれるオーディオトラックのリストを返します。
- `getVideoTracks()`: `MediaStream` に含まれるビデオトラックのリストを返します。
- `sampleRate`: WASMモジュールが現在使用しているサンプリングレート。
- `maxFrequency`: WASMモジュールが検出できる最大周波数。
- `waveform_data`: WASMモジュールが生成した現在の波形データ。
- `frequencyData`: WASMモジュールが生成した現在の周波数スペクトラムデータ。
- `displayEndIndex`: 波形表示の終了インデックス。
- `previousWaveform`: 前のフレームで処理された波形データ。
- `displayStartIndex`: 波形表示の開始インデックス。
- `estimatedFrequency`: WASMモジュールによって推定された現在の基本周波数。
- `firstAlignmentPoint`: 波形アライメントのための最初のゼロクロスポイント。
- `secondAlignmentPoint`: 波形アライメントのための2番目のゼロクロスポイント。
- `frequencyPlotHistory`: 周波数プロットの過去の履歴データ。
- `usedSimilaritySearch`: 類似度探索が現在のフレームで使用されたかどうかのフラグ。
- `similarityPlotHistory`: 類似度プロットの過去の履歴データ。
- `isSignalAboveNoiseGate`: 現在の信号レベルがノイズゲートの閾値を超えているかどうかのフラグ。
- `gain`: 現在適用されているゲイン（増幅率）。
- `fftSize`: FFT（高速フーリエ変換）計算に使用されるサンプル数。

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
    - setBufferSizeMultiplier ()
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
  - startFromFile ()
    - stop ()
    - createMediaStreamSource () (src/__tests__/dom-integration.test.ts)
    - createAnalyser () (src/__tests__/dom-integration.test.ts)
    - close () (src/__tests__/dom-integration.test.ts)
    - getTracks () (src/__tests__/dom-integration.test.ts)
    - trimSilence () (src/utils.ts)
- createSilentMockAudioContext (src/__tests__/oscilloscope.test.ts)
  - getFFTOverlayDimensions ()
    - findFFTOverlayBorderCall ()
    - getAudioTracks () (src/__tests__/oscilloscope.test.ts)
    - getVideoTracks () (src/__tests__/oscilloscope.test.ts)
    - dbToAmplitude () (src/utils.ts)
- sliderValueToThreshold (src/main.ts)
  - formatThresholdDisplay ()
    - startFrequencyDisplay ()
    - stopFrequencyDisplay ()
    - frequencyToNote () (src/utils.ts)
- cleanup (src/WaveformDataProcessor.ts)
- createAudioBuffer (src/__tests__/utils.test.ts)

---
Generated at: 2026-01-11 07:09:18 JST
