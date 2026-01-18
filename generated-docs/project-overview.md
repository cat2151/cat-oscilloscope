Last updated: 2026-01-19

# Project Overview

## プロジェクト概要
- ブラウザ上で動作するオシロスコープ風の波形ビジュアライザーです。
- Rust/WebAssemblyで高速なオーディオデータ処理を行い、5種類の周波数推定方式をサポートします。
- マイク入力やオーディオファイルからのリアルタイム波形解析・可視化、およびnpmライブラリとしての利用が可能です。

## 技術スタック
- フロントエンド: **TypeScript** (型安全なJavaScriptによるアプリケーションロジックとUI管理), **HTML Canvas** (波形やオーバーレイの2Dグラフィック描画), **Web Audio API** (マイク入力やオーディオファイルの音声ストリーム処理)
- 音楽・オーディオ: **Web Audio API** (ブラウザ上での音声データのキャプチャ、処理、分析の基盤を提供)
- 開発ツール: **Vite** (高速な開発サーバーとビルドツール), **Node.js** (JavaScriptランタイム環境), **npm/yarn** (パッケージ管理)
- テスト: **Vitest** (高速な単体テストフレームワーク), **happy-dom** (DOM環境をシミュレートするテストユーティリティ)
- ビルドツール: **Vite** (プロジェクトのビルドとバンドル), **wasm-pack** (RustコードをWebAssemblyにコンパイルするツール), **vite-plugin-dts** (TypeScriptの型定義ファイルを生成するViteプラグイン)
- 言語機能: **Rust** (高性能なオーディオデータ処理アルゴリズムの実装), **TypeScript** (JavaScriptに型安全性をもたらす言語)
- 自動化・CI/CD: **npm scripts** (ビルド、テスト、開発サーバー起動など、各種タスクを自動化)
- 開発標準: **TypeScript** (コードの型安全性を保証し、一貫した開発体験を提供)

## ファイル階層ツリー
```
📄 .gitignore
📖 LIBRARY_USAGE.md
📄 LICENSE
📖 README.ja.md
📖 README.md
📄 _config.yml
📁 dist/
  📘 AudioManager.d.ts
  📘 BasePathResolver.d.ts
  📘 BufferSource.d.ts
  📘 ComparisonPanelRenderer.d.ts
  📘 CycleSimilarityRenderer.d.ts
  📘 DOMElementManager.d.ts
  📘 DisplayUpdater.d.ts
  📘 FrequencyEstimator.d.ts
  📘 GainController.d.ts
  📘 Oscilloscope.d.ts
  📘 OverlayLayout.d.ts
  📘 PianoKeyboardRenderer.d.ts
  📘 UIEventHandlers.d.ts
  📘 WasmModuleLoader.d.ts
  📘 WaveformDataProcessor.d.ts
  📘 WaveformRenderData.d.ts
  📘 WaveformRenderer.d.ts
  📘 WaveformSearcher.d.ts
  📘 ZeroCrossDetector.d.ts
  📁 assets/
    📜 index-BSIPHox7.js
  📄 cat-oscilloscope.cjs
  📄 cat-oscilloscope.mjs
  📘 index.d.ts
  🌐 index.html
  📘 utils.d.ts
  📁 wasm/
    📊 package.json
    📘 wasm_processor.d.ts
    📜 wasm_processor.js
    📄 wasm_processor_bg.wasm
    📘 wasm_processor_bg.wasm.d.ts
🌐 example-library-usage.html
📁 generated-docs/
🌐 index.html
📊 package-lock.json
📊 package.json
📁 public/
  📁 wasm/ # アプリケーション実行時にロードされるWASMファイル
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
  📘 index.ts
  📘 main.ts
  📘 utils.ts
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
- **`.gitignore`**: Gitによるバージョン管理から除外するファイルやディレクトリを指定します。
- **`LIBRARY_USAGE.md`**: プロジェクトをnpmライブラリとして利用する際の詳細な手順とAPIドキュメントです。
- **`LICENSE`**: プロジェクトのライセンス情報（MITライセンス）を記載しています。
- **`README.ja.md` / `README.md`**: プロジェクトの概要、機能、セットアップ方法などを記述した日本語版および英語版のメインドキュメントです。
- **`_config.yml`**: GitHub PagesのJekyll設定ファイルです。
- **`dist/` (ディレクトリ)**: プロジェクトのビルド成果物が格納されるディレクトリです。
    - **`dist/*.d.ts`**: TypeScriptの型定義ファイル群で、JavaScriptコードの型情報を記述しています。対応する `src/` 以下のファイルと同じ役割を持ち、ライブラリ利用時に型補完を提供します。
    - **`dist/assets/index-BSIPHox7.js`**: アプリケーションの主要なロジックとUIコンポーネントをバンドルしたJavaScriptファイルです。
    - **`dist/cat-oscilloscope.cjs` / `dist/cat-oscilloscope.mjs`**: npmライブラリとして利用するためのCommonJSおよびES Module形式のバンドルファイルです。
    - **`dist/index.html`**: ビルドされたアプリケーションのエントリポイントとなるHTMLファイルです。
    - **`dist/utils.d.ts`**: 共通ユーティリティ関数の型定義ファイルです。
    - **`dist/wasm/` (ディレクトリ)**: ビルド済みのWebAssemblyモジュールとそのJavaScriptラッパー、型定義ファイルを格納しています。
        - **`dist/wasm/wasm_processor.d.ts` / `dist/wasm/wasm_processor_bg.wasm.d.ts`**: WebAssemblyモジュールの型定義ファイルです。
        - **`dist/wasm/wasm_processor.js`**: WebAssemblyモジュールをロードし、JavaScriptから利用するためのラッパーコードです。
        - **`dist/wasm/wasm_processor_bg.wasm`**: Rustで書かれたデータ処理ロジックがコンパイルされたバイナリ形式のWebAssemblyモジュールです。
- **`example-library-usage.html`**: npmライブラリとしての `cat-oscilloscope` の使用例を示すHTMLファイルです。
- **`generated-docs/` (ディレクトリ)**: ドキュメント生成ツールによって作成されるHTMLドキュメントが格納されます。
- **`package-lock.json` / `package.json`**: プロジェクトのメタデータ、依存関係、スクリプトなどを定義するnpm（またはYarn）の設定ファイルです。
- **`public/` (ディレクトリ)**: 静的アセットを配置するディレクトリで、Webアプリケーションとして公開されます。
    - **`public/wasm/` (ディレクトリ)**: アプリケーションがブラウザから直接ロードするビルド済みのWebAssemblyモジュールを格納しています。`dist/wasm/` と内容はほぼ同一です。
- **`scripts/screenshot-local.js`**: ローカル環境でスクリーンショットを撮影するためのスクリプトです。
- **`src/` (ディレクトリ)**: プロジェクトのソースコードが格納される主要なディレクトリです。
    - **`src/AudioManager.ts`**: Web Audio APIを介したマイク入力やオーディオファイルからの音声ストリーム管理を担当します。
    - **`src/BasePathResolver.ts`**: アプリケーションがWASMファイルなどのリソースをロードするためのベースパスを解決します。
    - **`src/BufferSource.ts`**: 静的なオーディオバッファからの音声データ供給を管理するクラスです。
    - **`src/ComparisonPanelRenderer.ts`**: 波形比較パネルの描画ロジックを管理します。
    - **`src/CycleSimilarityRenderer.ts`**: 波形サイクルの類似度を計算し、描画するロジックを管理します。
    - **`src/DOMElementManager.ts`**: アプリケーションのUI要素（DOM要素）を管理し、アクセスを容易にします。
    - **`src/DisplayUpdater.ts`**: UI上の各種表示（周波数、ゲイン、類似度など）の更新を担当します。
    - **`src/FrequencyEstimator.ts`**: 周波数推定アルゴリズムの選択と設定を管理します。
    - **`src/GainController.ts`**: 波形の自動ゲイン調整ロジックを管理します。
    - **`src/Oscilloscope.ts`**: オシロスコープアプリケーション全体の中心となるクラスで、オーディオ処理、レンダリング、UI連携を統括します。
    - **`src/OverlayLayout.ts`**: FFTスペクトラムや倍音分析などのオーバーレイ表示のレイアウトと寸法を計算します。
    - **`src/PianoKeyboardRenderer.ts`**: 検出された周波数をピアノ鍵盤上に表示する描画ロジックを管理します。
    - **`src/UIEventHandlers.ts`**: ユーザーインターフェースからのイベント（ボタンクリック、スライダー操作など）を処理します。
    - **`src/WasmModuleLoader.ts`**: WebAssemblyモジュールを非同期でロードし、初期化する役割を担います。
    - **`src/WaveformDataProcessor.ts`**: オーディオデータの前処理、WebAssemblyモジュールへのデータ渡し、結果の受け取りを調整します。
    - **`src/WaveformRenderData.ts`**: 波形描画に必要なデータを保持・管理するクラスです。
    - **`src/WaveformRenderer.ts`**: HTML Canvasに実際の波形、グリッド、オーバーレイを描画するロジックを管理します。
    - **`src/WaveformSearcher.ts`**: 波形の中から周期を特定するための探索ロジックを提供します。
    - **`src/ZeroCrossDetector.ts`**: 波形のゼロクロスポイントを検出するロジックを提供します。
    - **`src/index.ts`**: ライブラリのエントリポイントです。
    - **`src/main.ts`**: Webアプリケーションのエントリポイントで、`Oscilloscope` インスタンスを初期化し、UIをセットアップします。
    - **`src/utils.ts`**: dB変換、周波数からノートへの変換など、プロジェクト全体で共通的に利用されるユーティリティ関数を提供します。
- **`test-segment-relative.md`**: テスト関連のメモファイルです。
- **`tsconfig.json` / `tsconfig.lib.json`**: TypeScriptのコンパイラ設定ファイルで、プロジェクトとライブラリそれぞれのビルド設定を定義します。
- **`vite.config.ts`**: Viteビルドツールの設定ファイルです。
- **`wasm-processor/` (ディレクトリ)**: Rustで実装されたWebAssemblyモジュールのソースコードが格納されています。
    - **`wasm-processor/Cargo.toml`**: Rustプロジェクトの依存関係やメタデータを定義するファイルです。
    - **`wasm-processor/src/` (ディレクトリ)**: Rustのソースコードです。
        - **`wasm-processor/src/bpf.rs`**: バンドパスフィルター関連のロジックが含まれる可能性があります。
        - **`wasm-processor/src/frequency_estimator.rs`**: 各種周波数推定アルゴリズム（Zero-Crossing, Autocorrelation, FFT, STFT, CQT）の実装です。
        - **`wasm-processor/src/gain_controller.rs`**: 自動ゲイン制御の計算ロジックです。
        - **`wasm-processor/src/lib.rs`**: Rustクレートのメインライブラリファイルで、WASMモジュールのエントリポイントやJavaScriptとのインターフェースを定義します。
        - **`wasm-processor/src/waveform_searcher.rs`**: 波形のゼロクロス点や周期を効率的に探索するロジックです。
        - **`wasm-processor/src/zero_cross_detector.rs`**: ゼロクロス検出アルゴリズムの実装です。

## 関数詳細説明
来訪者向けに、主要な機能を提供する関数に絞り、その役割を説明します。WASM内部の低レベル関数やバンドル後の短縮名は省略しています。

- **`Oscilloscope` クラスの主要メソッド**:
    - **`constructor(canvas: HTMLCanvasElement)`**: オシロスコープのインスタンスを初期化し、描画キャンバスを設定します。
    - **`start()`**: マイク入力からオーディオ処理を開始し、波形可視化をスタートします。
    - **`startFromBuffer(bufferSource: BufferSource)`**: 指定されたオーディオバッファからオーディオ処理を開始し、波形可視化をスタートします。
    - **`stop()`**: 現在のオーディオ処理と波形可視化を停止します。
    - **`setFrequencyEstimationMethod(method: string)`**: 周波数推定に使用するアルゴリズム（Zero-Crossing, Autocorrelation, FFT, STFT, CQT）を設定します。
    - **`setBufferSizeMultiplier(multiplier: number)`**: 低周波検出精度向上のためのバッファサイズ乗数を設定します（1x, 4x, 16x）。
    - **`setAutoGain(enabled: boolean)`**: 波形の自動ゲイン調整の有効/無効を切り替えます。
    - **`setNoiseGate(enabled: boolean)`**: ノイズゲート機能の有効/無効を切り替えます。
    - **`setNoiseGateThreshold(threshold: number)`**: ノイズゲートの閾値を設定します。
    - **`setDebugOverlaysEnabled(enabled: boolean)`**: FFTスペクトラム、倍音分析などのデバッグオーバーレイ表示の有効/無効を切り替えます。
    - **`setOverlaysLayout(layout: OverlayLayoutConfig)`**: オーバーレイの表示レイアウトをカスタマイズします。
    - **`setPauseDrawing(paused: boolean)`**: 波形描画の一時停止/再開を切り替えます。
- **`AudioManager` クラスの主要メソッド**:
    - **`start()`**: Web Audio APIを通じてマイク入力を開始します。
    - **`startFromFile(file: File)`**: WAVファイルなどのオーディオファイルをロードし、再生・処理を開始します。
    - **`startFromBuffer(bufferSource: BufferSource)`**: 静的オーディオバッファからの処理を開始します。
    - **`stop()`**: オーディオストリームの処理を停止します。
- **`WaveformRenderer` クラスの主要メソッド**:
    - **`drawWaveform(renderData: WaveformRenderData)`**: 取得した音声データに基づき、メインの波形を描画します。
    - **`drawFFTOverlay(renderData: WaveformRenderData)`**: FFTスペクトラムをオーバーレイとして描画します。
    - **`drawHarmonicAnalysis(renderData: WaveformRenderData)`**: 倍音分析の結果をオーバーレイとして描画します。
    - **`drawFrequencyPlot(renderData: WaveformRenderData)`**: 周波数推移のグラフをオーバーレイとして描画します。
- **`PianoKeyboardRenderer` クラスの主要メソッド**:
    - **`draw(frequency: number)`**: 検出された周波数をピアノ鍵盤上にハイライトして表示します。
- **WASMモジュール（`wasm_processor`）の主要関数（JavaScriptから呼び出されるもの）**:
    - **`initSync()`**: WebAssemblyモジュールを同期的に初期化します。
    - **`processFrame(audioData: Float32Array)`**: 生のオーディオデータフレームをRust/WebAssemblyに渡し、主要なデータ処理（周波数推定、ゲイン調整など）を実行させます。
    - **`reset()`**: WASMモジュールの内部状態（バッファ履歴など）をリセットします。
    - **`getEstimatedFrequency()`**: WASMで計算された推定周波数を取得します。
    - **`getFrequencyData()`**: WASMで計算されたFFT周波数スペクトラムデータを取得します。
    - **`getSimilarity()`**: WASMで計算された波形類似度を取得します。
- **`src/utils.ts` の主要関数**:
    - **`dbToAmplitude(db: number)`**: デシベル値を振幅値に変換します。
    - **`amplitudeToDb(amplitude: number)`**: 振幅値をデシベル値に変換します。
    - **`frequencyToNote(frequency: number)`**: 周波数値を対応する音楽のノート情報（例: C4）に変換します。

## 関数呼び出し階層ツリー
```
- Oscilloscope.start() (マイク入力からのアプリケーション開始)
  - AudioManager.start() (マイクからのオーディオ入力を開始)
  - WasmModuleLoader.loadWasmModule() (WASMモジュールをロード)
  - WasmModuleLoader.getProcessor().initSync() (WASMモジュールを初期化)
  - Oscilloscope.renderFrame() (アニメーションループ内で繰り返し呼び出されるメイン描画関数)
    - AudioManager.getTimeDomainData() (Web Audio APIから生データを取得)
    - Oscilloscope.updateFrameBufferHistory() (過去の波形データを更新)
    - WaveformDataProcessor.processFrame() (オーディオデータの前処理とWASMへの連携)
      - WasmModuleLoader.getProcessor().processFrame() (WASMで高速データ処理を実行)
        - wasm-processor/src/lib.rs (WASM内部のコアロジック)
        - wasm-processor/src/frequency_estimator.rs (周波数推定アルゴリズムの実行)
        - wasm-processor/src/waveform_searcher.rs (波形周期の探索)
        - wasm-processor/src/zero_cross_detector.rs (ゼロクロス点の検出)
        - wasm-processor/src/gain_controller.rs (自動ゲイン計算)
    - WaveformRenderer.clearAllCanvases() (描画キャンバスをクリア)
    - WaveformRenderer.drawGrid() (グリッドを描画)
    - WaveformRenderer.drawWaveform() (主要な波形を描画)
    - WaveformRenderer.drawFFTOverlay() (FFTスペクトラムをオーバーレイとして描画)
    - WaveformRenderer.drawHarmonicAnalysis() (倍音分析をオーバーレイとして描画)
    - WaveformRenderer.drawFrequencyPlot() (周波数推移グラフをオーバーレイとして描画)
    - ComparisonPanelRenderer.updatePanels() (波形比較パネルを更新)
    - CycleSimilarityRenderer.updateGraphs() (サイクル類似度グラフを更新)
    - PianoKeyboardRenderer.draw() (検出周波数に基づいてピアノ鍵盤を描画)
    - DisplayUpdater.update() (UI上の数値を更新)

- Oscilloscope.startFromBuffer(bufferSource) (静的バッファからのアプリケーション開始)
  - AudioManager.startFromBuffer(bufferSource) (指定バッファからのオーディオ入力を開始)
  - WasmModuleLoader.loadWasmModule() (WASMモジュールをロード)
  - WasmModuleLoader.getProcessor().initSync() (WASMモジュールを初期化)
  - Oscilloscope.renderFrame() (上記と同様の描画パス)

- UIEventHandlers.handleStartStopButton() (UIの開始/停止ボタン操作)
  - Oscilloscope.getIsRunning() (現在の実行状態を確認)
  - Oscilloscope.start() OR Oscilloscope.stop() (状態に応じて開始または停止を呼び出し)

- UIEventHandlers.handleFileInput(file) (UIのファイル入力操作)
  - AudioManager.startFromFile(file) (選択されたファイルからオーディオ再生・処理を開始)

---
Generated at: 2026-01-19 07:09:10 JST
