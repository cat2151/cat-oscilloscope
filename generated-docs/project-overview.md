Last updated: 2026-01-10

# Project Overview

## プロジェクト概要
- ブラウザ上でマイク入力や音声ファイルからリアルタイムに波形を可視化するオシロスコープです。
- 複数の周波数推定アルゴリズムとバッファ調整機能により、様々な波形や低周波の分析に対応します。
- 高速なRust/WASM実装も選択可能で、安定した波形表示と詳細な音声分析を提供します。

## 技術スタック
使用している技術をカテゴリ別に整理して説明
- フロントエンド: HTML Canvas (2Dグラフィックスによる波形レンダリング)
- 音楽・オーディオ: Web Audio API (ブラウザでのリアルタイム音声入力、処理、分析)
- 開発ツール: Vite (高速な開発サーバーとビルドツール)、Node.js (JavaScriptランタイム環境)、npm (パッケージ管理)、cross-env (環境変数設定のクロスプラットフォーム対応)
- テスト: Vitest (高速なユニットテストフレームワーク)、@vitest/ui (Vitestのテスト結果を視覚的に表示するUI)、Happy DOM (VitestでDOM環境をエミュレートするライブラリ)
- ビルドツール: Vite (JavaScript/TypeScriptアプリケーションのバンドルと最適化)、wasm-pack (RustコードをWebAssemblyにコンパイルするツール)、vite-plugin-dts (TypeScriptの型定義ファイルを自動生成するViteプラグイン)
- 言語機能: TypeScript (型安全なJavaScriptプログラミング)、Rust (WebAssemblyによる高性能データ処理用システムプログラミング言語)
- 自動化・CI/CD: (特筆すべきCI/CDツールは明示されていませんが、npmスクリプトによるビルドプロセスの自動化が行われています)
- 開発標準: (TypeScriptの採用により、コードの型安全性と保守性が向上しています)

## ファイル階層ツリー
```
📄 .gitignore
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
    📘 piano-keyboard-renderer.test.ts
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
-   **.gitignore**: Gitのバージョン管理から除外すべきファイルやディレクトリを指定する設定ファイルです。
-   **IMPLEMENTATION_NOTES_117.md**: 特定の実装に関する詳細なメモや考察が記述されたドキュメントです。
-   **IMPLEMENTATION_SUMMARY.md**: プロジェクトの主要な実装内容に関する概要がまとめられたドキュメントです。
-   **LIBRARY_USAGE.md**: `cat-oscilloscope`をnpmライブラリとして他のプロジェクトで使用する際の手順やコード例を説明するドキュメントです。
-   **LICENSE**: プロジェクトのライセンス情報（MITライセンス）が記述されたファイルです。
-   **README.ja.md**: プロジェクトの主要な説明書（日本語版）です。プロジェクトの概要、機能、使い方などが説明されています。
-   **README.md**: プロジェクトの主要な説明書（英語版）です。
-   **REFACTORING_SUMMARY.md**: リファクタリングに関する変更点や目的がまとめられたドキュメントです。
-   **TESTING.md**: テストの実行方法やテスト戦略に関する詳細が記述されたドキュメントです。
-   **_config.yml**: GitHub Pagesをホスティングするために使用されるJekyllの設定ファイルです。
-   **example-library-usage.html**: `cat-oscilloscope`ライブラリを実際にウェブページでどのように使用するかを示すHTMLコード例です。
-   **index.html**: オシロスコープアプリケーションのエントリーポイントとなるHTMLファイルです。UI要素、スタイル、スクリプトの読み込みを定義します。
-   **issue-notes/**: 開発中に発生した特定の課題や問題に関するメモを格納するディレクトリです。各ファイルは個別の課題に対応しています。
-   **package-lock.json**: `package.json`に記載された依存関係の正確なバージョンと依存ツリーを記録し、ビルドの再現性を保証します。
-   **package.json**: プロジェクトのメタデータ、開発・実行時の依存関係、スクリプトコマンド（ビルド、テスト、開発サーバー起動など）を定義するファイルです。
-   **public/wasm/**: Rustで記述されたWebAssembly (WASM) モジュールのビルド済みファイル群を格納するディレクトリです。
    -   **wasm_processor.d.ts**: WASMモジュール（`wasm_processor.js`）のTypeScript型定義ファイルです。JavaScriptからWASM機能を型安全に呼び出すために使用されます。
    -   **wasm_processor.js**: RustでビルドされたWASMモジュールをJavaScriptから利用するためのグルーコード（接着コード）です。WASMとのインターフェースを提供します。
    -   **wasm_processor_bg.wasm**: 実際に高性能なデータ処理を行うWebAssemblyバイナリファイルです。
    -   **wasm_processor_bg.wasm.d.ts**: WebAssemblyバイナリそのものに対するTypeScript型定義ファイルです。
-   **src/**: プロジェクトの主要なTypeScriptソースコードを格納するディレクトリです。
    -   **AudioManager.ts**: マイク入力や音声ファイルからのオーディオデータ取得と管理を担当します。Web Audio APIを利用してリアルタイムで音声をキャプチャします。
    -   **ComparisonPanelRenderer.ts**: 異なる周波数推定アルゴリズムの結果を並べて比較表示するためのパネルのレンダリングを制御します。
    -   **FrequencyEstimator.ts**: ゼロクロス、自己相関、FFT、STFT、CQTなど、複数のアルゴリズムを用いてオーディオデータから周波数を推定するロジックを実装します。
    -   **GainController.ts**: 波形の振幅を自動的に調整するオートゲイン機能を管理し、キャンバスの高さを最適に活用して表示します。
    -   **Oscilloscope.ts**: オシロスコープアプリケーション全体の主要なロジックを統合する中心的なクラスです。オーディオ処理の開始・停止、WASM実装への切り替えなどを制御します。
    -   **PianoKeyboardRenderer.ts**: 検出された周波数を視覚的にピアノの鍵盤上にマークして表示するレンダリング処理を制御します。
    -   **WasmDataProcessor.ts**: Rust/WASMモジュールとの連携を管理し、WASMによる高性能なデータ処理（波形検索、周波数推定など）を実行するためのインターフェースを提供します。
    -   **WaveformDataProcessor.ts**: TypeScriptで実装された波形データの処理ロジック（波形検索、ゼロクロス検出、周波数推定など）を統合します。
    -   **WaveformRenderData.ts**: オシロスコープのレンダリングに必要な波形データ、周波数情報、表示インデックスなどをまとめたデータ構造を定義するインターフェースまたはクラスです。
    -   **WaveformRenderer.ts**: HTML Canvas上にリアルタイムで波形、グリッド、周波数情報などの視覚要素を描画する処理を実装します。
    -   **WaveformSearcher.ts**: 前のフレームとの波形データの類似性を計算し、安定した波形表示のためのアライメントポイント（表示開始点）を決定するロジックを提供します。
    -   **ZeroCrossDetector.ts**: オーディオデータストリーム内で波形がゼロ点（負から正）を横切るポイントを検出し、安定した波形表示のための基準点を提供します。
    -   **src/__tests__/**: プロジェクトのテストファイルを格納するディレクトリです。各ファイルは特定のコンポーネントや機能のユニットテスト、統合テストを含みます。
    -   **index.ts**: `cat-oscilloscope`プロジェクトをnpmライブラリとして公開する際のエントリーポイントです。主に`Oscilloscope`クラスをエクスポートします。
    -   **main.ts**: アプリケーションのメインエントリーポイントであり、UIの初期化、イベントハンドリング、`Oscilloscope`インスタンスの管理などを担当します。
    -   **utils.ts**: プロジェクト全体で利用される汎用的なヘルパー関数や定数を定義します。例えば、デシベルから振幅への変換、周波数から音符への変換などです。
-   **tsconfig.json**: TypeScriptコンパイラの基本的な設定ファイルです（アプリケーションのビルド用）。
-   **tsconfig.lib.json**: TypeScriptコンパイラの、ライブラリとしてビルドする際の設定ファイルです。
-   **vite.config.ts**: Viteビルドツールと開発サーバーの設定ファイルです。ビルド時の挙動やプラグイン（例: 型定義生成、WASM読み込み）などを定義します。
-   **wasm-processor/**: Rustで実装されたWebAssembly (WASM) モジュールのソースコードを格納するディレクトリです。
    -   **Cargo.toml**: Rustプロジェクトの依存関係とメタデータ（パッケージ名、バージョンなど）を定義するファイルです。
    -   **src/**: Rustのソースコードを格納します。
        -   **frequency_estimator.rs**: Rustで実装された周波数推定ロジックです。
        -   **gain_controller.rs**: Rustで実装されたゲイン制御ロジックです。
        -   **lib.rs**: Rustライブラリのエントリーポイントであり、JavaScriptとのインターフェースとなる関数が定義されています。
        -   **waveform_searcher.rs**: Rustで実装された波形検索ロジックです。
        -   **zero_cross_detector.rs**: Rustで実装されたゼロクロス検出ロジックです。

## 関数詳細説明
-   **public/wasm/wasm_processor.d.ts**:
    -   `initSync()`: WASMモジュールを同期的に初期化します。ブラウザ環境でWASMがロードされる際に呼び出され、WASMランタイムを設定します。
    -   `__wbg_init()`: WASMモジュールを初期化するための内部関数です。
-   **public/wasm/wasm_processor.js**: (WASMグルーコード内の関数であり、WASMバイナリ内の機能をJavaScriptから呼び出すためのラッパーやヘルパーです)
    -   `getArrayF32FromWasm0()`: WASMメモリから`Float32Array`形式のデータを取り出すためのヘルパー関数。
    -   `getArrayU8FromWasm0()`: WASMメモリから`Uint8Array`形式のデータを取り出すためのヘルパー関数。
    -   `getFloat32ArrayMemory0()`: WASMメモリへの`Float32Array`としての参照を取得します。
    -   `getStringFromWasm0()`: WASMメモリからJavaScriptの文字列を取得します。
    -   `getUint8ArrayMemory0()`: WASMメモリへの`Uint8Array`としての参照を取得します。
    -   `isLikeNone()`: 値が`null`または`undefined`に似ているか判定します。
    -   `passArray8ToWasm0()`: JavaScriptの`Uint8Array`をWASMに渡すためのヘルパー関数。
    -   `passArrayF32ToWasm0()`: JavaScriptの`Float32Array`をWASMに渡すためのヘルパー関数。
    -   `passStringToWasm0()`: JavaScriptの文字列をWASMに渡すためのヘルパー関数。
    -   `decodeText()`: テキストデコード処理を実行します。
    -   `__wbg_load()`: (内部関数) WASMモジュールのロードに関連する処理を実行します。
    -   `__wbg_get_imports()`: (内部関数) WASMモジュールのインポートを取得します。
    -   `__wbg_finalize_init()`: (内部関数) WASM初期化の最終処理を実行します。
    -   `initSync()`: WASMモジュールを同期的に初期化します（`wasm_processor.d.ts`と同じ）。
    -   `__wbg_init()`: WASMモジュールを初期化します（`wasm_processor.d.ts`と同じ）。
    -   `__destroy_into_raw()`: WASMによって確保されたオブジェクトを破棄し、メモリを解放します。
    -   `free()`: WASMオブジェクトのメモリを解放します。
    -   `processFrame(audioData: Float32Array, ...settings)`: 入力されたオーディオフレームデータを処理し、波形レンダリングに必要なデータを生成します。
        -   引数: `audioData` (オーディオデータ配列), 各種設定パラメータ
        -   戻り値: `WaveformRenderData`構造体
    -   `setAutoGain(enabled: boolean)`: オートゲイン機能の有効/無効を設定します。
        -   引数: `enabled` (boolean)
        -   戻り値: なし
    -   `setNoiseGate(enabled: boolean)`: ノイズゲート機能の有効/無効を設定します。
        -   引数: `enabled` (boolean)
        -   戻り値: なし
    -   `setUsePeakMode(enabled: boolean)`: ピークモードの使用を設定します。
        -   引数: `enabled` (boolean)
        -   戻り値: なし
    -   `setNoiseGateThreshold(threshold: number)`: ノイズゲートの閾値（デシベル値など）を設定します。
        -   引数: `threshold` (number)
        -   戻り値: なし
    -   `setBufferSizeMultiplier(multiplier: number)`: データ処理に使用するバッファサイズ乗数を設定し、低周波検出の精度に影響を与えます。
        -   引数: `multiplier` (number, 例: 1, 4, 16)
        -   戻り値: なし
    -   `setFrequencyEstimationMethod(method: string)`: 周波数推定アルゴリズムを設定します（例: "Zero-Crossing", "Autocorrelation", "FFT"など）。
        -   引数: `method` (string)
        -   戻り値: なし
    -   `constructor()`: WASMプロセッサオブジェクトのコンストラクタです。
    -   `reset()`: WASMプロセッサの内部状態をリセットします。
    -   `similarity(waveform1: Float32Array, waveform2: Float32Array)`: 2つの波形データ間の類似度を計算します。
        -   引数: `waveform1`, `waveform2` (Float32Array)
        -   戻り値: 類似度 (number)
    -   `sampleRate`: 現在のサンプリングレートを取得/設定します。
    -   `maxFrequency`: 検出可能な最大周波数を取得/設定します。
    -   `waveform_data`: 処理された波形データを取得/設定します。
    -   `frequencyData`: 周波数スペクトルデータを取得/設定します。
    -   `displayEndIndex`: 波形表示の終了インデックスを取得/設定します。
    -   `previousWaveform`: 前フレームの波形データを取得/設定します。
    -   `displayStartIndex`: 波形表示の開始インデックスを取得/設定します。
    -   `estimatedFrequency`: 推定された基本周波数を取得/設定します。
    -   `firstAlignmentPoint`: 最初の波形アライメントポイントを取得/設定します。
    -   `frequencyPlotHistory`: 周波数プロットの履歴データを取得/設定します。
    -   `secondAlignmentPoint`: 2番目の波形アライメントポイントを取得/設定します。
    -   `usedSimilaritySearch`: 類似度検索が使用されたかどうかを示すフラグを取得/設定します。
    -   `isSignalAboveNoiseGate`: 信号がノイズゲート閾値を超えているかを示すフラグを取得/設定します。
    -   `gain`: 現在のゲイン値を取得/設定します。
    -   `fftSize`: FFT処理に使用されるサイズを取得/設定します。
-   **src/AudioManager.ts**:
    -   `start(audioContext: AudioContext, gainController: GainController, callback: (data: Float32Array) => void)`: マイク入力からのオーディオキャプチャを開始します。
        -   引数: `AudioContext`インスタンス、`GainController`インスタンス、オーディオデータを受信するコールバック関数。
        -   戻り値: `Promise<void>`
        -   機能: ユーザーのマイクアクセスを要求し、リアルタイムでオーディオデータを取得して指定されたコールバック関数に渡します。
    -   `startFromFile(filePath: string, audioContext: AudioContext, gainController: GainController, callback: (data: Float32Array) => void)`: 指定されたWAVファイルからオーディオ再生とキャプチャを開始します。
        -   引数: ファイルパス、`AudioContext`インスタンス、`GainController`インスタンス、オーディオデータを受信するコールバック関数。
        -   戻り値: `Promise<void>`
        -   機能: ファイルを読み込み、再生しながらオーディオデータを抽出し、コールバック関数に渡します。
    -   `stop()`: 現在のオーディオキャプチャを停止し、関連するリソースを解放します。
        -   引数: なし
        -   戻り値: なし
        -   機能: オーディオストリーム、オーディオノード、トラックを停止し、イベントリスナーを解除します。
-   **src/ComparisonPanelRenderer.ts**:
    -   `constructor(canvas: HTMLCanvasElement, ...options)`: 比較パネルのレンダラーを初期化します。
        -   引数: 描画対象のキャンバス要素、初期設定オブジェクト。
        -   戻り値: なし
        -   機能: 2つの異なる波形表示とそれぞれの周波数推定結果を比較表示するためのコンテキストを準備します。
-   **src/FrequencyEstimator.ts**:
    -   (このファイルは、周波数推定アルゴリズムのロジックをカプセル化するクラスまたはモジュールであり、抽出された`switch`文や`for`/`if`は内部的な実装詳細です。直接エクスポートされる関数名は分析結果から特定できませんが、ファイル全体の機能は以下の通りです)
    -   機能: Zero-Crossing、Autocorrelation、FFT、STFT、CQTなど、複数の周波数推定アルゴリズムを提供し、入力オーディオデータから基底周波数を計算します。
-   **src/GainController.ts**:
    -   (このファイルは、オートゲイン機能のロジックをカプセル化するクラスまたはモジュールであり、抽出された`for`/`if`は内部的な実装詳細です。直接エクスポートされる関数名は分析結果から特定できませんが、ファイル全体の機能は以下の通りです)
    -   機能: 入力オーディオデータのピークレベルを追跡し、表示される波形の振幅がキャンバスの高さに最適に収まるように自動的にゲインを調整します。
-   **src/Oscilloscope.ts**:
    -   `constructor(canvas: HTMLCanvasElement, ...options)`: オシロスコープアプリケーション全体を初期化します。
        -   引数: 描画対象のHTMLCanvasElement、オプション設定。
        -   戻り値: なし
        -   機能: 描画キャンバス、`AudioManager`、`GainController`、データ処理コンポーネント（TypeScript版またはWASM版）、およびレンダリングコンポーネントをセットアップします。
    -   `start(filePath?: string)`: オシロスコープのリアルタイム表示と音声処理を開始します。
        -   引数: オプションで音声ファイルのパス。指定しない場合はマイク入力を使用します。
        -   戻り値: `Promise<void>`
        -   機能: `AudioManager`を介して音声入力を開始し、`requestAnimationFrame`ループ内で定期的に波形データ処理とレンダリングを実行します。
    -   `startFromFile(filePath: string)`: 指定された音声ファイルからオシロスコープの表示を開始します。
        -   引数: 音声ファイルのパス。
        -   戻り値: `Promise<void>`
        -   機能: `AudioManager.startFromFile`を呼び出し、ファイルからの音声データを処理・表示するループを開始します。
    -   `stop()`: オシロスコープの表示と音声処理を停止します。
        -   引数: なし
        -   戻り値: なし
        -   機能: `AudioManager`を停止し、アニメーションループをキャンセルしてリソースを解放します。
    -   `setUseWasm(useWasm: boolean)`: データ処理にRust/WASM実装を使用するかどうかを設定します。
        -   引数: `useWasm` (boolean, `true`でWASMを使用)
        -   戻り値: なし
        -   機能: データ処理ロジックをTypeScript版(`WaveformDataProcessor`)とRust/WASM版(`WasmDataProcessor`)の間で切り替えます。
-   **src/PianoKeyboardRenderer.ts**:
    -   `constructor(canvas: HTMLCanvasElement)`: ピアノ鍵盤レンダラーを初期化します。
        -   引数: 描画対象のキャンバス要素。
        -   戻り値: なし
        -   機能: 検出された周波数を視覚的にピアノの鍵盤上にマークして表示するための描画コンテキストを準備します。
-   **src/WasmDataProcessor.ts**:
    -   `cleanup()`: WASM関連のリソース（WASMモジュールのメモリなど）を解放します。
        -   引数: なし
        -   戻り値: なし
        -   機能: WASMインスタンスが破棄される際に呼び出され、メモリリークを防ぎます。
    -   `handleLoad(wasmModule: WebAssembly.Instance)`: WASMモジュールがロードされた後の初期化処理を実行します。
        -   引数: ロードされたWASMモジュールインスタンス。
        -   戻り値: なし
        -   機能: WASMモジュールを初期化し、JavaScript側から呼び出せるように設定します。
    -   `constructor(audioContext: AudioContext, gainController: GainController, params: object)`: WASMデータプロセッサを初期化します。
        -   引数: `AudioContext`インスタンス、`GainController`インスタンス、設定パラメータ。
        -   戻り値: なし
        -   機能: WASMモジュールが利用可能な場合に、そのインスタンスを管理し、データ処理のための準備をします。
    -   `initialize()`: WASMモジュールのロードと初期化を実行します。
        -   引数: なし
        -   戻り値: `Promise<void>`
        -   機能: `loadWasmModule`を呼び出し、WASMモジュールのロードとインスタンス化を非同期で管理します。
    -   `loadWasmModule()`: WASMモジュールを動的にロードします。
        -   引数: なし
        -   戻り値: `Promise<WebAssembly.Instance>`
        -   機能: `public/wasm/wasm_processor_bg.wasm`をフェッチし、WebAssemblyとしてインスタンス化します。
-   **src/WaveformDataProcessor.ts**:
    -   `constructor(audioContext: AudioContext, gainController: GainController, params: object)`: 波形データプロセッサを初期化します。
        -   引数: `AudioContext`インスタンス、`GainController`インスタンス、設定パラメータ。
        -   戻り値: なし
        -   機能: TypeScriptで実装された波形検索、ゼロクロス検出、周波数推定、ゲイン制御などのデータ処理ロジックを統合します。
-   **src/WaveformRenderData.ts**:
    -   (このファイルは、オシロスコープのレンダリングに必要なデータを定義するインターフェース/型であり、直接の関数は含まれません)
    -   機能: オシロスコープのレンダリングに必要な波形データ、周波数情報、表示インデックスなどをまとめたデータ構造を定義します。
-   **src/WaveformRenderer.ts**:
    -   `constructor(canvas: HTMLCanvasElement, ...options)`: 波形レンダラーを初期化します。
        -   引数: 描画対象のキャンバス要素、オプション設定。
        -   戻り値: なし
        -   機能: HTML Canvas上にリアルタイムで波形、グリッド、周波数推定結果などを描画するためのコンテキストと設定を準備します。
-   **src/WaveformSearcher.ts**:
    -   (このファイルは、波形検索のロジックをカプセル化するクラスまたはモジュールであり、抽出された`if`/`for`は内部的な実装詳細です。直接エクスポートされる関数名は分析結果から特定できませんが、ファイル全体の機能は以下の通りです)
    -   機能: 前のフレームとの波形データの類似性を計算し、安定した波形表示のためのアライメントポイント（表示開始点）を決定します。
-   **src/ZeroCrossDetector.ts**:
    -   (このファイルは、ゼロクロス検出のロジックをカプセル化するクラスまたはモジュールであり、抽出された`if`/`for`は内部的な実装詳細です。直接エクスポートされる関数名は分析結果から特定できませんが、ファイル全体の機能は以下の通りです)
    -   機能: オーディオデータストリーム内で波形がゼロ点（負から正）を横切るポイントを検出し、オシロスコープの安定した表示の基準点を提供します。
-   **src/__tests__/**: (テストファイル内の関数は、アプリケーションの直接的な機能ではなく、テストを補助するためのヘルパー関数です)
    -   `generateSineWave(frequency: number, sampleRate: number, duration: number)`: テスト用に指定された周波数、サンプリングレート、期間の正弦波データを生成します。
    -   `generateNoise(sampleCount: number)`: テスト用に指定されたサンプル数のノイズデータを生成します。
    -   `generateSquareWave(frequency: number, sampleRate: number, duration: number)`: テスト用に指定された矩形波データを生成します。
    -   `countZeroCrossings(data: Float32Array)`: 入力されたオーディオデータのゼロクロス数をカウントします。
    -   `createMediaStreamSource()`: テスト用にモックの`MediaStreamSourceNode`を作成します。
    -   `createAnalyser()`: テスト用にモックの`AnalyserNode`を作成します。
    -   `close()`: モックの`AudioContext`などのテストリソースを閉じます。
    -   `getTracks()`: モックの`MediaStream`からトラックを取得します。
    -   `createSilentMockAudioContext()`: テスト用の、音を生成しないモック`AudioContext`を作成します。
    -   `getFFTOverlayDimensions()`: FFTオーバーレイの寸法を取得します。
    -   `findFFTOverlayBorderCall()`: FFTオーバーレイの境界線描画呼び出しを検索します。
    -   `getAudioTracks()`: モックの`MediaStream`からオーディオトラックを取得します。
    -   `getVideoTracks()`: モックの`MediaStream`からビデオトラックを取得します。
    -   `stop()`: モックのトラックなどを停止します。
    -   `createAudioBuffer(channels: number, length: number, sampleRate: number)`: テスト用の`AudioBuffer`を作成します。
-   **src/index.ts**:
    -   (このファイルは、主に`Oscilloscope`クラスをエクスポートするライブラリのエントリーポイントであり、直接の関数は含まれません)
    -   機能: `cat-oscilloscope`をnpmライブラリとして使用する際、外部から`Oscilloscope`クラスをインポートできるように公開します。
-   **src/main.ts**:
    -   `sliderValueToThreshold(value: number)`: UIスライダーの数値をデシベル閾値に変換します。
        -   引数: `value` (number, スライダーの値)
        -   戻り値: デシベル値 (number)
        -   機能: ノイズゲートのスライダー値を、データ処理ロジックで利用可能なデシベル値に変換します。
    -   `formatThresholdDisplay(thresholdDb: number)`: 閾値の表示形式を整形します。
        -   引数: `thresholdDb` (number, デシベル値)
        -   戻り値: フォーマットされた文字列 (string)
        -   機能: ノイズゲートの閾値をユーザーにとって分かりやすい文字列形式に変換して表示します。
    -   `startFrequencyDisplay(oscilloscope: Oscilloscope)`: 周波数表示を開始し、関連するUIを更新します。
        -   引数: `Oscilloscope`インスタンス
        -   戻り値: なし
        -   機能: オシロスコープの周波数表示をアクティブにし、関連するUI要素の状態を変更します。
    -   `stopFrequencyDisplay()`: 周波数表示を停止し、関連するUIをリセットします。
        -   引数: なし
        -   戻り値: なし
        -   機能: オシロスコープの周波数表示を非アクティブにし、UI要素を初期状態に戻します。
-   **src/utils.ts**:
    -   `dbToAmplitude(db: number)`: デシベル値を線形な振幅値に変換します。
        -   引数: `db` (number, デシベル値)
        -   戻り値: 振幅値 (number)
        -   機能: デシベルスケールで表現された音量レベルを、オーディオ処理で利用可能なリニアな振幅値に変換します。
    -   `frequencyToNote(frequency: number)`: 周波数（Hz）を最も近い音楽的な音符名に変換します。
        -   引数: `frequency` (number, Hz)
        -   戻り値: 音符名（例: "A4"）とオクターブ情報を含むオブジェクト (object)
        -   機能: 検出された周波数を音楽的な音符（例: "C4", "G#5"）とそのオクターブにマッピングします。
    -   `trimSilence(buffer: Float32Array, threshold: number)`: オーディオデータの先頭と末尾の無音部分をトリムします。
        -   引数: `buffer` (Float32Array, 音声データ), `threshold` (number, 無音と判断する閾値)
        -   戻り値: トリミングされた音声データ (Float32Array)
        -   機能: 指定された閾値以下の振幅を持つ、オーディオバッファの開始と終了の無音部分を削除します。
-   **vite.config.ts**:
    -   (このファイルはViteのビルド設定オブジェクトをエクスポートするものであり、直接の関数は含まれません)
    -   機能: Viteビルドツールと開発サーバーの挙動を設定します。TypeScriptの型定義生成、WASMモジュールの読み込み設定、パスエイリアスなどを含みます。

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
    - constructor ()
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
    - frequencyToNote ()
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
Generated at: 2026-01-10 07:10:08 JST
