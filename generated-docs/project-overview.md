Last updated: 2026-01-17

# Project Overview

## プロジェクト概要
-   ブラウザ上で動作する、リアルタイムのオシロスコープ風波形ビジュアライザーです。
-   マイク入力やWAVファイルの音声をRust/WASMで高速処理し、波形や周波数を視覚化します。
-   多様な周波数推定アルゴリズム、拡張バッファ、ピアノ鍵盤表示などの機能を提供し、詳細な音響分析を可能にします。

## 技術スタック
使用している技術をカテゴリ別に整理して説明
-   フロントエンド: TypeScript（型安全なJavaScript開発）、HTML Canvas（2D波形レンダリング）、Web Audio API（音声のキャプチャと分析）
-   音楽・オーディオ: Web Audio API（リアルタイム音声処理）、Rust/WASM（高速なデータ処理アルゴリズム実装）
-   開発ツール: Vite（高速なビルドツールと開発サーバー）、Node.js/npm（JavaScriptランタイムおよびパッケージ管理）、wasm-pack（RustをWASMにビルドするツール）
-   テスト: Vitest（高速なJavaScriptテストフレームワーク）、@vitest/ui（VitestのテストUI）、happy-dom（DOM環境シミュレーション）
-   ビルドツール: Vite（統合された開発・ビルド環境）、vite-plugin-dts（TypeScript型定義ファイルの生成）、cross-env（クロスプラットフォーム環境変数設定）
-   言語機能: TypeScript（型安全性とモダンなJavaScript機能）、Rust（高性能で型安全なシステムプログラミング言語、WASM生成に使用）、ESM/CJS（JavaScriptモジュール形式のサポート）
-   自動化・CI/CD: npmスクリプトによるビルドおよびテストの自動化機能を提供。
-   開発標準: TypeScript（コードの品質向上と統一）、Rustの厳格な型システム（データ処理の信頼性向上）。

## ファイル階層ツリー
```
📄 .gitignore
📖 CONSOLIDATION_SUMMARY.md
📖 FREQUENCY_STABILITY_FIX.md
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
  📁 assets/
    📜 index-C-C2iXJO.js
    📄 index-C-C2iXJO.js.map
  📄 cat-oscilloscope.cjs
  📄 cat-oscilloscope.cjs.map
  📄 cat-oscilloscope.mjs
  📄 cat-oscilloscope.mjs.map
  📘 index.d.ts
  📄 index.d.ts.map
  🌐 index.html
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
    📄 waveform_searcher.rs
    📄 zero_cross_detector.rs
```

## ファイル詳細説明
-   **`src/Oscilloscope.ts`**: メインのオシロスコープアプリケーションクラス。音声入力の開始/停止、各種レンダラーやデータプロセッサーの統合管理、全体の設定管理を行います。
-   **`src/AudioManager.ts`**: Web Audio APIを管理し、マイク入力やWAVファイルからの音声データを取得し、リアルタイム処理のためのAudioContextを制御します。
-   **`src/BufferSource.ts`**: 静的オーディオバッファからの音声再生を管理するクラス。ループ再生や速度制御などの機能を提供します。
-   **`src/WaveformDataProcessor.ts`**: Rust/WASMモジュールと連携し、生の音声データから波形データ、周波数データ、推定周波数などを生成する主要なデータ処理ロジックを管理します。
-   **`src/WaveformRenderer.ts`**: HTML Canvas要素に音声波形、FFTスペクトラム、グリッド線などの視覚要素を描画する役割を担います。
-   **`src/ComparisonPanelRenderer.ts`**: 前回と現在の波形の類似度や、その変化を視覚的に表示するパネルの描画を担当します。
-   **`src/PianoKeyboardRenderer.ts`**: 検出された周波数をピアノの鍵盤上に視覚的に表示し、どの音に対応するかを分かりやすく示します。
-   **`src/FrequencyEstimator.ts`**: 周波数推定アルゴリズムの種類（Zero-Crossing, Autocorrelation, FFT, STFT, CQT）を管理し、WASMモジュールに適切な設定を伝達します。
-   **`src/GainController.ts`**: 自動ゲイン調整機能を提供し、入力音声の振幅を一定レベルに保つように調整します。
-   **`src/ZeroCrossDetector.ts`**: 波形がゼロ点を通過するポイントを検出するためのロジックを抽象化します。
-   **`src/WaveformRenderData.ts`**: 描画に必要な波形データやメタデータを保持するデータ構造を定義します。
-   **`src/WaveformSearcher.ts`**: 波形の特徴点（ゼロクロスポイントなど）を効率的に探索するためのロジックを管理します。
-   **`src/utils.ts`**: デシベルと振幅の変換、周波数と音符の変換、無音部分のトリミングなど、プロジェクト全体で利用される汎用的なユーティリティ関数を提供します。
-   **`wasm-processor/src/lib.rs`**: プロジェクトの主要なデータ処理アルゴリズムがRustで実装され、WebAssembly（WASM）としてコンパイルされるエントリポイントファイルです。周波数推定、ゼロクロス検出、自己相関、ゲイン制御などの高性能な処理が含まれます。
-   **`public/wasm/`**: 事前ビルドされたWebAssemblyモジュール（`wasm_processor.js`, `wasm_processor_bg.wasm`など）が配置されるディレクトリです。WebアプリケーションはここからWASMファイルをロードします。
-   **`src/__tests__/`**: Vitestフレームワークを使用した各種テストファイルが格納されています。各コンポーネントやデータ処理アルゴリズムの単体テスト、DOM統合テストなどが含まれます。
-   **`dist/`**: ビルド成果物（JavaScriptモジュール、型定義ファイル、WASM関連ファイル、HTMLなど）が格納されるディレクトリです。アプリケーションの配布可能なバージョンが含まれます。
-   **`index.html`**: アプリケーションのエントリポイントとなるHTMLファイルです。UI要素を定義し、JavaScriptモジュールをロードします。

## 関数詳細説明
-   **`Oscilloscope.constructor(canvas: HTMLCanvasElement)`**:
    -   役割: `Oscilloscope`インスタンスを初期化し、指定されたCanvas要素に描画するための準備を行います。
    -   引数: `canvas` (HTMLCanvasElement) - 波形を描画するCanvas要素。
    -   機能: `AudioManager`、`WaveformDataProcessor`、各種レンダラーを初期化し、イベントリスナーを設定します。
-   **`Oscilloscope.start()`**:
    -   役割: マイク入力からの音声処理と波形表示を開始します。
    -   引数: なし
    -   機能: Web Audio APIを通じてマイクにアクセスし、リアルタイムでの音声データ取得と可視化を開始します。
-   **`Oscilloscope.startFromFile(file: File)`**:
    -   役割: WAVファイルからの音声処理と波形表示を開始します。
    -   引数: `file` (File) - 処理対象のWAVファイルオブジェクト。
    -   機能: 指定されたWAVファイルを読み込み、そのオーディオデータに基づいて波形と周波数の可視化を開始します。
-   **`Oscilloscope.startFromBuffer(bufferSource: BufferSource)`**:
    -   役割: 静的オーディオバッファからの音声処理と波形表示を開始します。
    -   引数: `bufferSource` (BufferSource) - 静的オーディオデータと再生設定を含むオブジェクト。
    -   機能: Web Audio APIを使用せず、提供されたオーディオバッファから直接データを取得し、可視化します。
-   **`Oscilloscope.stop()`**:
    -   役割: 現在の音声処理と波形表示を停止します。
    -   引数: なし
    -   機能: マイク入力やファイルからの音声ストリームを閉じ、レンダリングループを停止します。
-   **`AudioManager.start()`**:
    -   役割: Web Audio APIを初期化し、マイクからのオーディオストリームを開始します。
    -   引数: なし
    -   機能: `AudioContext`を作成し、`MediaStreamSourceNode`を接続してリアルタイムでマイクデータを取得します。
-   **`WaveformDataProcessor.initialize()`**:
    -   役割: WASMモジュールをロードし、データ処理の初期設定を行います。
    -   引数: なし
    -   機能: `public/wasm/`からWebAssemblyファイルを読み込み、JavaScriptからRust関数を呼び出せるように準備します。
-   **`WaveformDataProcessor.processFrame()`**:
    -   役割: 一フレーム分の音声データをWASMに渡し、処理結果を受け取ります。
    -   引数: なし
    -   機能: Web Audio APIから取得したタイムドメインデータをWASMモジュールに渡し、推定周波数、波形データ、FFTスペクトラムなどの計算を実行させ、その結果を取得します。
-   **`wasm_processor.processFrame(data_ptr: number, data_len: number)` (WASM)**:
    -   役割: 生の音声データ（Rust側でポインタと長さを指定）を受け取り、各種音響分析を行います。
    -   引数: `data_ptr` (number) - 音声データが格納されたメモリのポインタ、`data_len` (number) - 音声データの長さ。
    -   機能: ゼロクロス検出、自己相関、FFT、STFT、CQTなどのアルゴリズムを用いて周波数推定を行い、波形表示に必要なデータを生成します。
-   **`wasm_processor.setAutoGain(enabled: boolean)` (WASM)**:
    -   役割: 自動ゲイン機能を有効または無効にします。
    -   引数: `enabled` (boolean) - 自動ゲインを有効にするかどうかのフラグ。
    -   機能: 入力信号のレベルに応じて、自動的にゲインを調整するロジックを制御します。
-   **`WaveformRenderer.drawWaveform(renderData: WaveformRenderData)`**:
    -   役割: Canvasに音声波形を描画します。
    -   引数: `renderData` (WaveformRenderData) - 描画に必要な波形データと設定情報。
    -   機能: 取得した波形データを基に、振幅と時間の関係を視覚化します。
-   **`WaveformRenderer.drawFFTOverlay(renderData: WaveformRenderData)`**:
    -   役割: Canvasに周波数スペクトラムをオーバーレイとして描画します。
    -   引数: `renderData` (WaveformRenderData) - 描画に必要なFFTデータと設定情報。
    -   機能: 音声の周波数成分を視覚化し、どの周波数帯が強いかを示します。
-   **`utils.dbToAmplitude(db: number)`**:
    -   役割: デシベル値から振幅値に変換します。
    -   引数: `db` (number) - デシベル値。
    -   戻り値: 振幅値 (number)。
    -   機能: 音量の尺度であるデシベルを、波形の物理的な振幅スケールに変換します。
-   **`utils.frequencyToNote(frequency: number)`**:
    -   役割: 周波数から最も近い音楽の音符情報（ノート名、オクターブ、セント値）を取得します。
    -   引数: `frequency` (number) - 周波数（Hz）。
    -   戻り値: 音符情報オブジェクト (`{ noteName: string, octave: number, cents: number }`など)。
    -   機能: 検出された周波数を音楽的な文脈で理解できるよう変換します。

## 関数呼び出し階層ツリー
```
- initSync (dist/wasm/wasm_processor.d.ts)
  - e (dist/assets/index-C-C2iXJO.js)
    - s ()
    - Z ()
    - ht ()
    - R ()
    - ft ()
    - nt ()
    - at ()
    - rt ()
    - ot ()
    - i ()
    - function ()
    - for ()
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
      - reset ()
      - trimSilence ()
      - createMediaStreamSource ()
      - createAnalyser ()
      - close ()
      - getTracks ()
      - updatePanels ()
      - clear ()
      - dbToAmplitude (dist/utils.d.ts)
      - setAutoGain ()
      - getAutoGainEnabled ()
      - setNoiseGate ()
      - getNoiseGateEnabled ()
      - setNoiseGateThreshold ()
      - getNoiseGateThreshold ()
      - getCurrentGain ()
      - setFrequencyEstimationMethod ()
      - getFrequencyEstimationMethod ()
      - getEstimatedFrequency ()
      - setFFTDisplay ()
      - getFFTDisplayEnabled ()
      - getIsRunning ()
      - getSimilarityScore ()
      - isSimilaritySearchActive ()
      - setPauseDrawing ()
      - getPauseDrawing ()
      - createSilentMockAudioContext (src/__tests__/oscilloscope.test.ts)
      - getFFTOverlayDimensions ()
      - findFFTOverlayBorderCall ()
      - getAudioTracks ()
      - getVideoTracks ()
      - clearAndDrawGrid ()
      - drawWaveform ()
      - drawFFTOverlay ()
      - drawFrequencyPlot ()
      - setBufferSizeMultiplier ()
      - render ()
      - frequencyToNote ()
      - sliderValueToThreshold (src/main.ts)
      - formatThresholdDisplay ()
      - startFrequencyDisplay ()
      - stopFrequencyDisplay ()
      - amplitudeToDb ()
    - if ()
      - clearHistory ()
      - getBufferSizeMultiplier ()
      - getMinFrequency ()
      - getMaxFrequency ()
      - getFrequencyPlotHistory ()
    - constructor (undefined)
- getArrayF32FromWasm0 (dist/wasm/wasm_processor.js)
- catch (src/AudioManager.ts)
- cleanup (src/WaveformDataProcessor.ts)
- createAudioBuffer (src/__tests__/utils.test.ts)

---
Generated at: 2026-01-17 07:09:31 JST
