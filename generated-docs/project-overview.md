Last updated: 2026-02-09

# Project Overview

## プロジェクト概要
- ブラウザ上で動作する、リアルタイムのオシロスコープ風波形ビジュアライザーです。
- マイク入力やWAVファイルから音声を可視化し、5種類のアルゴリズムで周波数を推定します。
- 高速なRust/WebAssemblyで音声処理を行い、JavaScript/TypeScriptでUIとレンダリングを担当します。

## 技術スタック
- フロントエンド:
    -   **TypeScript**: 型安全なJavaScriptで、UIロジック、設定管理、およびレンダリングの調整を担当します。
    -   **HTML Canvas**: オシロスコープの波形、FFTスペクトラム、ピアノ鍵盤、比較パネルなど、すべての視覚要素の2Dレンダリングに利用されます。
- 音楽・オーディオ:
    -   **Web Audio API**: ブラウザにおけるマイク入力のキャプチャ、WAVファイルの再生、およびリアルタイムでの音声分析（サンプルデータ取得など）に不可欠なAPIです。
- 開発ツール:
    -   **Node.js/npm**: JavaScriptの実行環境であり、プロジェクトの依存関係管理とスクリプト実行に使用されます。
    -   **wasm-pack**: Rustで書かれたコードをWebAssemblyにコンパイルし、JavaScriptから容易に利用できるようにするためのツールです。
- テスト:
    -   **Vitest**: 高速なユニットテストフレームワークで、コードの品質と信頼性を保証するために使用されます。
    -   **Happy DOM**: テスト環境でブラウザのDOM構造をシミュレートし、DOM操作を含むコンポーネントのテストを可能にします。
- ビルドツール:
    -   **Vite**: 高速な開発サーバーを提供し、本番環境向けのコードビルド（バンドル、最適化）を行う現代的なビルドツールです。
- 言語機能:
    -   **Rust/WebAssembly**: パフォーマンスが要求される主要なデータ処理アルゴリズム（例: 波形探索、周波数推定、ゼロクロス検出）を実装するために使用され、高速かつ型安全な処理を実現します。
    -   **TypeScript**: コードに静的型付けを導入することで、大規模なプロジェクトにおけるコードの可読性、保守性、信頼性を向上させます。
- 自動化・CI/CD:
    -   **GitHub Actions**: コード品質の自動チェック（例: 特定の行数を超えるファイルの検出）など、継続的インテグレーションおよびデリバリーの自動化ワークフローに使用されます。
- 開発標準:
    -   (特定のツール名はなし): GitHub Actionsを用いた日次バッチ処理により、ソースファイルのサイズを監視し、早期のリファクタリングを促すことでコード品質を維持しています。

## ファイル階層ツリー
```
📄 .gitignore
📖 ARCHITECTURE.md
📖 LIBRARY_USAGE.md
📄 LICENSE
📖 README.ja.md
📖 README.md
📖 REFACTORING_ISSUE_251.md
📖 REFACTORING_SUMMARY.md
📄 _config.yml
🌐 demo-simple.html
📜 demo-simple.js
📁 dist/
  📘 AudioManager.d.ts
  📘 BasePathResolver.d.ts
  📘 BufferSource.d.ts
  📘 ComparisonPanelRenderer.d.ts
  📘 CycleSimilarityRenderer.d.ts
  📘 DOMElementManager.d.ts
  📘 DisplayUpdater.d.ts
  📘 FrameBufferHistory.d.ts
  📘 FrameTimingDiagnostics.d.ts
  📘 FrequencyEstimator.d.ts
  📘 GainController.d.ts
  📘 Oscilloscope.d.ts
  📘 OverlayLayout.d.ts
  📘 PianoKeyboardRenderer.d.ts
  📘 RenderCoordinator.d.ts
  📘 UIEventHandlers.d.ts
  📘 WasmModuleLoader.d.ts
  📘 WaveformDataProcessor.d.ts
  📘 WaveformRenderData.d.ts
  📘 WaveformRenderer.d.ts
  📘 WaveformSearcher.d.ts
  📘 ZeroCrossDetector.d.ts
  📁 assets/
    📜 Oscilloscope-0AkMdwqr.js
    📜 demo-B8LH4eBp.js
    📜 main-DNW0ajie.js
  📄 cat-oscilloscope.cjs
  📄 cat-oscilloscope.mjs
  📁 comparison-renderers/
    📘 OffsetOverlayRenderer.d.ts
    📘 PositionMarkerRenderer.d.ts
    📘 SimilarityPlotRenderer.d.ts
    📘 WaveformPanelRenderer.d.ts
    📘 index.d.ts
  🌐 demo-simple.html
  📘 index.d.ts
  🌐 index.html
  📁 renderers/
    📘 BaseOverlayRenderer.d.ts
    📘 FFTOverlayRenderer.d.ts
    📘 FrequencyPlotRenderer.d.ts
    📘 GridRenderer.d.ts
    📘 HarmonicAnalysisRenderer.d.ts
    📘 PhaseMarkerRenderer.d.ts
    📘 WaveformLineRenderer.d.ts
    📘 index.d.ts
  📘 utils.d.ts
  📁 wasm/
    📊 package.json
    📘 signal_processor_wasm.d.ts
    📜 signal_processor_wasm.js
    📄 signal_processor_wasm_bg.wasm
    📘 signal_processor_wasm_bg.wasm.d.ts
🌐 example-library-usage.html
📁 generated-docs/
🌐 index.html
📊 package-lock.json
📊 package.json
📁 public/
  📁 wasm/
    📊 package.json
    📘 signal_processor_wasm.d.ts
    📜 signal_processor_wasm.js
    📄 signal_processor_wasm_bg.wasm
    📘 signal_processor_wasm_bg.wasm.d.ts
📁 scripts/
  📜 screenshot-local.js
📁 signal-processor-wasm/
  📄 Cargo.toml
  📁 src/
    📄 bpf.rs
    📄 dft.rs
    📁 frequency_estimation/
      📄 dsp_utils.rs
      📄 fft.rs
      📄 harmonic_analysis.rs
      📄 mod.rs
      📁 non_default_methods/
        📄 autocorrelation.rs
        📄 cqt.rs
        📄 mod.rs
        📄 stft.rs
        📄 zero_crossing.rs
      📄 smoothing.rs
      📄 tests.rs
    📄 gain_controller.rs
    📄 lib.rs
    📄 waveform_render_data.rs
    📄 waveform_searcher.rs
    📁 zero_cross_detector/
      📄 default_mode.rs
      📄 mod.rs
      📄 non_default_modes.rs
      📄 types.rs
      📄 utils.rs
📁 src/
  📘 AudioManager.ts
  📘 BasePathResolver.ts
  📘 BufferSource.ts
  📘 ComparisonPanelRenderer.ts
  📘 CycleSimilarityRenderer.ts
  📘 DOMElementManager.ts
  📘 DisplayUpdater.ts
  📘 FrameBufferHistory.ts
  📘 FrameTimingDiagnostics.ts
  📘 FrequencyEstimator.ts
  📘 GainController.ts
  📘 Oscilloscope.ts
  📘 OverlayLayout.ts
  📘 PianoKeyboardRenderer.ts
  📘 RenderCoordinator.ts
  📘 UIEventHandlers.ts
  📘 WasmModuleLoader.ts
  📘 WaveformDataProcessor.ts
  📘 WaveformRenderData.ts
  📘 WaveformRenderer.ts
  📘 WaveformSearcher.ts
  📘 ZeroCrossDetector.ts
  📁 __tests__/
    📘 BufferSource.test.ts
    📘 algorithms.test.ts
    📘 comparison-panel-renderer.test.ts
    📘 cycle-similarity-display.test.ts
    📘 cycle-similarity.test.ts
    📘 dom-integration.test.ts
    📘 library-exports.test.ts
    📘 normalized-harmonics-issue197.test.ts
    📘 oscilloscope.test.ts
    📘 overlay-layout.test.ts
    📘 performance-issue267.test.ts
    📘 phase-marker-constraint-issue296.test.ts
    📘 piano-keyboard-renderer.test.ts
    📘 startFromBuffer.test.ts
    📘 utils.test.ts
    📘 waveform-data-processor.test.ts
    📘 waveform-renderer.test.ts
    📘 waveform-searcher.test.ts
    📘 weighted-harmonic-issue195.test.ts
  📁 comparison-renderers/
    📘 OffsetOverlayRenderer.ts
    📘 PositionMarkerRenderer.ts
    📘 SimilarityPlotRenderer.ts
    📘 WaveformPanelRenderer.ts
    📘 index.ts
  📘 index.ts
  📘 main.ts
  📁 renderers/
    📘 BaseOverlayRenderer.ts
    📘 FFTOverlayRenderer.ts
    📘 FrequencyPlotRenderer.ts
    📘 GridRenderer.ts
    📘 HarmonicAnalysisRenderer.ts
    📘 PhaseMarkerRenderer.ts
    📘 WaveformLineRenderer.ts
    📘 index.ts
  📘 utils.ts
📁 test-pages/
  🌐 test-canvas-dimension-warning.html
  🌐 test-startFromBuffer-error.html
  📄 wavlpf-broken-layout.png
📖 test-segment-relative.md
📊 tsconfig.json
📊 tsconfig.lib.json
📘 vite.config.ts
```

## ファイル詳細説明
-   **README.md / README.ja.md**: プロジェクトの概要、機能、ライブデモ、使用方法、技術スタック、開発手順などを記述したメインのドキュメント（英語/日本語）。
-   **LIBRARY_USAGE.md**: npmライブラリとして`cat-oscilloscope`を他のプロジェクトで使用するための詳細な手順を説明するドキュメント。
-   **ARCHITECTURE.md**: プロジェクトのアーキテクチャや設計思想を説明するドキュメント。
-   **LICENSE**: プロジェクトのライセンス情報（MITライセンス）を記載したファイル。
-   **demo-simple.html**: ライブラリの基本的な利用方法を示す簡易デモのHTMLページ。
-   **demo-simple.js**: `demo-simple.html`で`cat-oscilloscope`ライブラリを使用するためのJavaScriptロジック。
-   **src/AudioManager.ts**: Web Audio APIを介してマイク入力やオーディオファイル（WAV）の読み込み、および`BufferSource`からのオーディオデータ供給を管理するクラス。
-   **src/BasePathResolver.ts**: WebAssemblyモジュールなどのアセットのベースパスを動的に解決するためのユーティリティクラス。
-   **src/BufferSource.ts**: 静的な`Float32Array`データや`AudioBuffer`をオシロスコープに供給可能な形式に変換・管理するクラス。ループ再生などのオプションもサポート。
-   **src/ComparisonPanelRenderer.ts**: 波形比較パネル（現在と前回の波形類似度表示など）の描画ロジックを管理するクラス。
-   **src/CycleSimilarityRenderer.ts**: 波形サイクルの類似度を視覚的に表示するパネルの描画を担うクラス。
-   **src/DOMElementManager.ts**: アプリケーションが必要とするDOM要素（キャンバス、ボタン、スライダーなど）を効率的に取得・管理するクラス。
-   **src/DisplayUpdater.ts**: 検出された周波数、ゲイン値、波形類似度など、様々なUI表示要素の更新ロジックを管理するクラス。
-   **src/FrameBufferHistory.ts**: 低周波検出精度向上のための拡張バッファ機能に必要な、過去のオーディオフレームデータを保持・管理するクラス。
-   **src/FrameTimingDiagnostics.ts**: アプリケーションの各フレーム処理にかかる時間を記録し、パフォーマンス診断情報を提供するクラス。
-   **src/FrequencyEstimator.ts**: WASMモジュールと連携し、Zero-Crossing、Autocorrelation、FFT、STFT、CQTなど複数の周波数推定アルゴリズムの選択と結果取得を管理するクラス。
-   **src/GainController.ts**: 波形の振幅を自動的に調整（オートゲイン）するロジックを実装し、視認性を向上させるクラス。
-   **src/Oscilloscope.ts**: アプリケーションの中核となるクラスで、オーディオ処理、WebAssembly連携、レンダリング、UIイベント処理などを統合し、オシロスコープ全体の動作を制御します。
-   **src/OverlayLayout.ts**: FFTスペクトラムや倍音分析などのオーバーレイ表示のレイアウト定義と、その値解決ロジックを管理するクラス。
-   **src/PianoKeyboardRenderer.ts**: 検出された基本周波数をリアルタイムでピアノ鍵盤上に視覚的に表示するクラス。
-   **src/RenderCoordinator.ts**: `WaveformRenderer`や`ComparisonPanelRenderer`など複数のレンダラーを協調させ、描画ループを管理するクラス。
-   **src/UIEventHandlers.ts**: アプリケーションのUI要素（開始/停止ボタン、ファイル入力、スライダー、チェックボックスなど）からのユーザーイベントを処理し、`Oscilloscope`クラスのメソッドを呼び出します。
-   **src/WasmModuleLoader.ts**: WebAssemblyモジュールのロード、初期化、およびクリーンアップを管理し、JavaScript側からWASM機能を透過的に利用できるようにします。
-   **src/WaveformDataProcessor.ts**: JavaScriptとWebAssemblyモジュール間のデータ連携を調整し、オーディオデータの処理（前処理、周波数推定など）を実行するクラス。
-   **src/WaveformRenderData.ts**: 波形レンダリングに必要なすべてのデータ（生波形、ゼロクロスポイント、周波数データ、ゲインなど）をカプセル化するデータ構造。
-   **src/WaveformRenderer.ts**: メインのCanvas要素上にオーディオ波形、グリッド、および各種オーバーレイを描画するクラス。
-   **src/WaveformSearcher.ts**: オーディオデータバッファ内で、表示に適した波形サイクル（ゼロクロスポイントなど）を探索するロジックを抽象化するクラス。
-   **src/ZeroCrossDetector.ts**: オーディオ波形のゼロクロスポイントを検出するためのロジックをカプセル化するクラス。
-   **src/utils.ts**: デシベルと振幅の変換、周波数からノート名への変換、無音部分のトリミングなど、汎用的なユーティリティ関数を提供します。
-   **signal-processor-wasm/**: Rustで実装されたWebAssemblyモジュールのソースコードを格納するディレクトリ。周波数推定、ゼロクロス検出などの高性能な数値計算アルゴリズムが含まれます。
    -   `Cargo.toml`: Rustプロジェクトの依存関係やビルド設定を定義するファイル。
    -   `src/lib.rs`: Rustモジュールのエントリポイント。WebAssemblyとして公開される関数が定義されます。
    -   `src/frequency_estimation/`: 各種周波数推定アルゴリズム（FFT, STFT, CQTなど）の実装が含まれるサブディレクトリ。
    -   `src/zero_cross_detector/`: ゼロクロス検出アルゴリズムの実装が含まれるサブディレクトリ。
-   **public/wasm/**: 事前ビルドされたWebAssemblyファイルとそのJavaScriptグルーコードが配置されるディレクトリ。
    -   `signal_processor_wasm.js`: WebAssemblyバイナリをロードし、JavaScript環境で利用可能にするためのグルーコード。
    -   `signal_processor_wasm_bg.wasm`: RustコードからコンパイルされたWebAssemblyバイナリファイル。

## 関数詳細説明
-   `Oscilloscope.constructor(canvas: HTMLCanvasElement)`:
    -   役割: `Oscilloscope`クラスの新しいインスタンスを初期化します。
    -   引数: `canvas` (HTMLCanvasElement) - 波形描画に使用するCanvas要素。
    -   戻り値: なし
-   `Oscilloscope.start()`:
    -   役割: マイク入力からのリアルタイム音声可視化を開始します。Web Audio API、WASMモジュール、レンダリングループを初期化し、オーディオ処理と描画を開始します。
    -   引数: なし
    -   戻り値: `Promise<void>`
-   `Oscilloscope.startFromFile(file: File)`:
    -   役割: 指定されたWAVオーディオファイルをロードし、その音声の可視化を開始します。
    -   引数: `file` (File) - 可視化するWAVオーディオファイル。
    -   戻り値: `Promise<void>`
-   `Oscilloscope.startFromBuffer(bufferSource: BufferSource)`:
    -   役割: 事前に準備された`BufferSource`からのオーディオデータを用いて可視化を開始します。
    -   引数: `bufferSource` (BufferSource) - 可視化するオーディオデータを供給するオブジェクト。
    -   戻り値: `Promise<void>`
-   `Oscilloscope.stop()`:
    -   役割: 現在進行中の音声処理と描画を停止し、関連するリソースを解放します。
    -   引数: なし
    -   戻り値: なし
-   `Oscilloscope.setFrequencyEstimationMethod(method: string)`:
    -   役割: 波形から周波数を推定するアルゴリズムを設定します（例: "FFT", "STFT", "CQT"）。
    -   引数: `method` (string) - 使用する周波数推定方法の識別子。
    -   戻り値: なし
-   `Oscilloscope.setBufferSizeMultiplier(multiplier: number)`:
    -   役割: 低周波の検出精度を向上させるため、処理に用いるバッファサイズの乗数を設定します（例: 1, 4, 16）。
    -   引数: `multiplier` (number) - バッファサイズの乗数。
    -   戻り値: なし
-   `Oscilloscope.getEstimatedFrequency()`:
    -   役割: 現在推定されている基本周波数（Hz）を取得します。
    -   引数: なし
    -   戻り値: `number | null` - 推定された周波数、または推定されていない場合は`null`。
-   `Oscilloscope.setAutoGain(enabled: boolean)`:
    -   役割: 波形の振幅を自動的に調整する機能（オートゲイン）の有効/無効を切り替えます。
    -   引数: `enabled` (boolean) - オートゲインを有効にするか無効にするか。
    -   戻り値: なし
-   `Oscilloscope.setNoiseGate(enabled: boolean)`:
    -   役割: ノイズゲート機能の有効/無効を切り替えます。ノイズゲートは、設定した閾値以下の信号をカットします。
    -   引数: `enabled` (boolean) - ノイズゲートを有効にするか無効にするか。
    -   戻り値: なし
-   `Oscilloscope.setNoiseGateThreshold(threshold: number)`:
    -   役割: ノイズゲートの閾値を設定します。この値以下の振幅はノイズとして扱われます。
    -   引数: `threshold` (number) - ノイズゲートの閾値。
    -   戻り値: なし
-   `Oscilloscope.setDebugOverlaysEnabled(enabled: boolean)`:
    -   役割: FFTスペクトラム、倍音分析、周波数推移プロットなどのデバッグ用オーバーレイの表示/非表示を切り替えます。
    -   引数: `enabled` (boolean) - オーバーレイ表示を有効にするか無効にするか。
    -   戻り値: なし
-   `Oscilloscope.setOverlaysLayout(layout: OverlayLayoutConfig)`:
    -   役割: 各オーバーレイの画面上のレイアウトをカスタマイズします。
    -   引数: `layout` (OverlayLayoutConfig) - オーバーレイのレイアウト設定オブジェクト。
    -   戻り値: なし
-   `Oscilloscope.setPauseDrawing(paused: boolean)`:
    -   役割: 波形やオーバーレイの描画を一時停止または再開します。オーディオ処理自体は続行されます。
    -   引数: `paused` (boolean) - 描画を一時停止するかどうか。
    -   戻り値: なし
-   `AudioManager.start()`:
    -   役割: マイクからの音声入力を開始し、`AudioContext`と`AnalyserNode`を初期化します。
    -   引数: なし
    -   戻り値: `Promise<void>`
-   `AudioManager.startFromFile(file: File)`:
    -   役割: 指定されたオーディオファイル（WAV）をデコードして再生し、`AnalyserNode`に接続します。
    -   引数: `file` (File) - 再生するファイル。
    -   戻り値: `Promise<void>`
-   `AudioManager.startFromBuffer(bufferSource: BufferSource)`:
    -   役割: `BufferSource`オブジェクトから提供される音声データを再生し、分析に利用します。
    -   引数: `bufferSource` (BufferSource) - 音声データを供給するソース。
    -   戻り値: `Promise<void>`
-   `AudioManager.stop()`:
    -   役割: アクティブなオーディオ入力/再生を停止し、`AudioContext`を閉じます。
    -   引数: なし
    -   戻り値: なし
-   `WasmModuleLoader.loadWasmModule()`:
    -   役割: WebAssemblyモジュールを非同期でロードし、初期化します。モジュールのBasePath解決も行います。
    -   引数: なし
    -   戻り値: `Promise<void>`
-   `WaveformDataProcessor.processFrame(audioData: Float32Array)`:
    -   役割: JavaScriptから渡された音声フレームデータをWebAssemblyモジュールに送り、周波数推定や波形探索などの処理を実行させます。
    -   引数: `audioData` (Float32Array) - 処理する音声データ。
    -   戻り値: `WaveformRenderData` - レンダリングに必要な処理結果データ。
-   `RenderCoordinator.renderFrame()`:
    -   役割: アニメーションフレームごとに呼び出され、`WaveformRenderer`や`ComparisonPanelRenderer`など、すべての登録されたレンダラーに描画を指示します。
    -   引数: なし
    -   戻り値: なし
-   `UIEventHandlers.handleStartStopButton()`:
    -   役割: UI上の開始/停止ボタンがクリックされたときに、`Oscilloscope`の`start()`または`stop()`メソッドを呼び出します。
    -   引数: なし
    -   戻り値: `Promise<void>`
-   `utils.dbToAmplitude(db: number)`:
    -   役割: デシベル(dB)値をリニアな振幅値に変換します。
    -   引数: `db` (number) - デシベル値。
    -   戻り値: `number` - 変換された振幅値。
-   `utils.amplitudeToDb(amplitude: number)`:
    -   役割: リニアな振幅値をデシベル(dB)値に変換します。
    -   引数: `amplitude` (number) - 振幅値。
    -   戻り値: `number` - 変換されたデシベル値。
-   `utils.frequencyToNote(frequency: number)`:
    -   役割: 周波数(Hz)を最も近い音階名とオクターブ（例: "A4"）に変換します。
    -   引数: `frequency` (number) - 周波数。
    -   戻り値: `string | null` - 音階名、または変換できない場合は`null`。

## 関数呼び出し階層ツリー
```
- Oscilloscope.start()
    - AudioManager.start()
    - WasmModuleLoader.loadWasmModule()
        - BasePathResolver.getBasePath()
    - WaveformDataProcessor.initialize()
    - RenderCoordinator.startRenderLoop()
        - RenderCoordinator.renderFrame()
            - WaveformDataProcessor.processFrame()
            - WaveformRenderer.drawWaveform()
                - WaveformLineRenderer.drawWaveformLine()
                - GridRenderer.drawGrid()
                - FFTOverlayRenderer.drawFFTOverlay()
                - HarmonicAnalysisRenderer.drawHarmonicAnalysis()
                - FrequencyPlotRenderer.drawFrequencyPlot()
                - PhaseMarkerRenderer.drawPhaseMarkers()
            - ComparisonPanelRenderer.draw()
                - ComparisonPanelRenderer.drawSimilarityPlot()
                - ComparisonPanelRenderer.drawOffsetOverlayGraphs()
                - ComparisonPanelRenderer.drawPositionMarkers()
            - CycleSimilarityRenderer.draw()
            - PianoKeyboardRenderer.draw()
- Oscilloscope.startFromFile(file: File)
    - AudioManager.startFromFile(file)
    - WasmModuleLoader.loadWasmModule()
    - WaveformDataProcessor.initialize()
    - RenderCoordinator.startRenderLoop()
- Oscilloscope.startFromBuffer(bufferSource: BufferSource)
    - AudioManager.startFromBuffer(bufferSource)
    - WasmModuleLoader.loadWasmModule()
    - WaveformDataProcessor.initialize()
    - RenderCoordinator.startRenderLoop()
- Oscilloscope.stop()
    - AudioManager.stop()
    - RenderCoordinator.stopRenderLoop()
- UIEventHandlers.handleStartStopButton()
    - Oscilloscope.start()
    - Oscilloscope.stop()
- UIEventHandlers.handleFileInput(event: Event)
    - Oscilloscope.startFromFile(file)
- Oscilloscope.setFrequencyEstimationMethod(method: string)
    - WaveformDataProcessor.setFrequencyEstimationMethod(method)
- Oscilloscope.setBufferSizeMultiplier(multiplier: number)
    - WaveformDataProcessor.setBufferSizeMultiplier(multiplier)
- Oscilloscope.setAutoGain(enabled: boolean)
    - GainController.setAutoGain(enabled)
- Oscilloscope.setNoiseGate(enabled: boolean)
    - WaveformDataProcessor.setNoiseGate(enabled)
- Oscilloscope.setNoiseGateThreshold(threshold: number)
    - WaveformDataProcessor.setNoiseGateThreshold(threshold)
- Oscilloscope.setDebugOverlaysEnabled(enabled: boolean)
    - RenderCoordinator.setDebugOverlaysEnabled(enabled)
- Oscilloscope.setOverlaysLayout(layout: OverlayLayoutConfig)
    - RenderCoordinator.setOverlaysLayout(layout)
- Oscilloscope.setPauseDrawing(paused: boolean)
    - RenderCoordinator.setPauseDrawing(paused)
- utils.dbToAmplitude(db: number)
- utils.amplitudeToDb(amplitude: number)
- utils.frequencyToNote(frequency: number)
- utils.trimSilence(audioBuffer: AudioBuffer, threshold: number)

---
Generated at: 2026-02-09 07:11:57 JST
