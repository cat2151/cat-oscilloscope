Last updated: 2026-01-18

# Project Overview

## プロジェクト概要
- Webブラウザ上で動作する、リアルタイムのオシロスコープ風波形ビジュアライザーです。
- マイク入力やWAVファイルから音声をキャプチャし、多彩な周波数推定アルゴリズムで解析します。
- Rust/WebAssemblyで実装された高速なデータ処理と、HTML Canvasによるリッチな視覚化が特徴です。

## 技術スタック
使用している技術をカテゴリ別に整理して説明します。

-   **フロントエンド**:
    -   **HTML Canvas**: 2DグラフィックAPIを利用して、波形やスペクトラムなどの視覚的な要素をレンダリングします。
    -   **TypeScript**: 型安全なJavaScriptであり、アプリケーションのロジック、設定管理、およびレンダリング処理の実装に使用されています。
    -   **Web Audio API**: ブラウザ上でオーディオ入力を取得（マイク、ファイル）し、リアルタイムで分析するためのインターフェースを提供します。
-   **音楽・オーディオ**:
    -   **Rust/WebAssembly**: ゼロクロス、自己相関、FFT、STFT、CQTなど、5つの高度な周波数推定アルゴリズムがRustで実装され、WebAssemblyを通じてブラウザで高速に実行されます。
-   **開発ツール**:
    -   **Node.js (v16以上)**: 開発環境の実行基盤です。
    -   **npm**: プロジェクトのパッケージ管理とスクリプト実行に使用されます。
    -   **Vite**: 高速な開発サーバーとビルドツールとして、開発体験を向上させます。
    -   **wasm-pack**: Rustで書かれたコードをWebAssemblyモジュールにコンパイルするために使用されます。
-   **テスト**:
    -   **Vitest**: JavaScript/TypeScriptコードの単体テストおよび統合テストフレームワークです。
    -   **@vitest/ui**: Vitestのテスト結果をブラウザUIで確認するためのツールです。
    -   **happy-dom**: DOM環境をエミュレートし、ブラウザAPIに依存するコンポーネントのテストを可能にします。
-   **ビルドツール**:
    -   **Vite**: アプリケーション全体を本番環境向けにバンドル・最適化します。
    -   **vite-plugin-dts**: TypeScriptの型定義ファイル（`.d.ts`）を自動生成し、ライブラリとしての利用を容易にします。
-   **言語機能**:
    -   **Rust**: 高度なオーディオデータ処理アルゴリズムを、高速かつ型安全に実装するために用いられます。
    -   **TypeScript**: アプリケーションの複雑な構造を型安全に保ち、開発の堅牢性を高めます。
-   **開発標準**:
    -   **TypeScript**: 強力な型チェック機能により、開発段階でのエラーを早期に発見し、コード品質とメンテナンス性を向上させます。

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
  📘 OverlayLayout.d.ts
  📄 OverlayLayout.d.ts.map
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
    📜 index-DpqZQlW6.js
    📄 index-DpqZQlW6.js.map
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
  📖 169.md
  📖 171.md
  📖 173.md
  📖 175.md
  📖 177-analysis.md
  📖 177.md
  📖 179-analysis-v2.md
  📖 179-analysis-v3.md
  📖 179-analysis.md
  📖 179.md
  📖 181-implementation.md
  📖 181.md
  📖 183.md
  📖 185.md
  📖 187.md
  📖 189.md
  📖 191.md
  📖 193.md
  📖 195.md
  📖 197.md
  📖 199.md
  📖 201.md
  📖 203.md
  📖 205.md
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
  📘 OverlayLayout.ts
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
    📘 normalized-harmonics-issue197.test.ts
    📘 oscilloscope.test.ts
    📘 overlay-layout.test.ts
    📘 piano-keyboard-renderer.test.ts
    📘 startFromBuffer.test.ts
    📘 utils.test.ts
    📘 waveform-data-processor.test.ts
    📘 waveform-renderer.test.ts
    📘 waveform-searcher.test.ts
    📘 weighted-harmonic-issue195.test.ts
  📘 index.ts
  📘 main.ts
  📘 utils.ts
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
-   `.gitignore`: Gitによるバージョン管理から除外するファイルやディレクトリを指定する設定ファイルです。
-   `LIBRARY_USAGE.md`: このプロジェクトをnpmライブラリとして他のプロジェクトで使用するための詳細な手順と注意事項を説明するドキュメントです。
-   `LICENSE`: プロジェクトの配布条件を定めるMITライセンス情報が記載されています。
-   `README.ja.md`, `README.md`: プロジェクトの概要、機能、使用方法などを記述した、それぞれ日本語版と英語版の紹介ドキュメントです。
-   `_config.yml`: GitHub Pagesなどの静的サイトジェネレータで使用される設定ファイルです。
-   `dist/`: ビルド（コンパイル・バンドル）された成果物が格納されるディレクトリです。
    -   `dist/*.d.ts`: TypeScriptの型定義ファイル群で、JavaScriptコードに型情報を提供し、開発時のコード補完や型チェックを可能にします。
    -   `dist/assets/index-DpqZQlW6.js`: アプリケーションのメインJavaScriptバンドルファイルです。
    -   `dist/cat-oscilloscope.cjs`, `dist/cat-oscilloscope.mjs`: このプロジェクトをライブラリとして利用する際の、CommonJSおよびESモジュール形式の出力ファイルです。
    -   `dist/index.html`: ビルドされたアプリケーションのエントリポイントとなるHTMLファイルです。
    -   `dist/wasm/`: WebAssemblyモジュールのビルド成果物が含まれます。
        -   `wasm_processor.d.ts`, `wasm_processor.js`, `wasm_processor_bg.wasm`: Rustで書かれたデータ処理ロジックがWebAssemblyとしてコンパイルされたもので、JavaScriptから呼び出され、高速な計算を行います。
-   `example-library-usage.html`: `cat-oscilloscope`ライブラリを実際に使用する方法を示すHTMLサンプルです。
-   `generated-docs/`: プロジェクトから自動生成されたドキュメントが格納される場合があります。
-   `index.html`: 開発時やライブデモで使用される、アプリケーションのメインHTMLファイルです。
-   `issue-notes/`: 開発中に発生した課題やその調査内容に関するメモが多数格納されているディレクトリです。
-   `package-lock.json`, `package.json`: Node.jsプロジェクトの依存関係、スクリプト、メタデータを定義するファイルです。
-   `public/`: 静的ファイル（画像、WebAssemblyモジュールなど）が配置されるディレクトリで、そのままウェブサーバーで提供されます。
    -   `public/wasm/`: 事前ビルドされたWebAssemblyモジュールが格納されており、アプリケーションにロードされます。
-   `src/`: プロジェクトのTypeScriptソースコードが格納されるディレクトリです。
    -   `src/AudioManager.ts`: Web Audio APIを介してマイク入力やWAVファイルからのオーディオデータ取得を管理し、オーディオコンテキストを制御します。
    -   `src/BufferSource.ts`: 静的オーディオバッファからのデータ供給を管理し、ループ再生などの機能を提供します。
    -   `src/ComparisonPanelRenderer.ts`: 現在の波形と過去の波形の類似度や比較グラフを描画する役割を担います。
    -   `src/FrequencyEstimator.ts`: ゼロクロス、自己相関、FFT、STFT、CQTなど、様々な周波数推定アルゴリズムの選択と管理を行います。
    -   `src/GainController.ts`: 波形の振幅を自動調整するオートゲイン機能を提供します。
    -   `src/Oscilloscope.ts`: アプリケーションの主要なロジックを統括するクラスで、オーディオ処理、描画、UI連携など全体のフローを管理します。
    -   `src/OverlayLayout.ts`: FFTスペクトラムや倍音分析などのオーバーレイ表示のレイアウトとサイズ計算を管理します。
    -   `src/PianoKeyboardRenderer.ts`: 検出された周波数をピアノ鍵盤上に視覚的に表示し、対応するキーをハイライトします。
    -   `src/WaveformDataProcessor.ts`: Rust/WASMモジュールとの連携層として機能し、オーディオデータの処理と周波数推定を実行します。
    -   `src/WaveformRenderData.ts`: 波形描画に必要なデータ（波形配列、推定周波数など）を保持するデータ構造を定義します。
    -   `src/WaveformRenderer.ts`: HTML Canvasに波形本体、グリッド、各種オーバーレイ（FFTスペクトラム、周波数プロットなど）を描画する役割を担います。
    -   `src/WaveformSearcher.ts`: 波形データから特定のパターン（ゼロクロス点など）を探索するロジックを提供します。
    -   `src/ZeroCrossDetector.ts`: 波形がゼロ軸を横切る点を効率的に検出するアルゴリズムを実装します。
    -   `src/__tests__/`: 各モジュールの単体テストや統合テストのコード群です。
    -   `src/index.ts`: このプロジェクトがnpmライブラリとして公開される際のエントリポイントです。
    -   `src/main.ts`: アプリケーションの起動時に実行されるスクリプトで、UI要素と`Oscilloscope`インスタンスを連携させ、イベントハンドラを設定します。
    -   `src/utils.ts`: 周波数からノート情報への変換、デシベルと振幅の相互変換、無音部分のトリミングなど、汎用的なユーティリティ関数を提供します。
-   `tsconfig.json`, `tsconfig.lib.json`: TypeScriptコンパイラの設定ファイルです。
-   `vite.config.ts`: Viteビルドツールの設定ファイルで、ビルドオプションやプラグインが設定されています。
-   `wasm-processor/`: Rustで書かれたWebAssemblyモジュールのソースコードが格納されているディレクトリです。
    -   `wasm-processor/Cargo.toml`: Rustプロジェクトの設定ファイルで、依存関係やビルド設定を記述します。
    -   `wasm-processor/src/`: Rustソースコードです。
        -   `bpf.rs`: バンドパスフィルターに関連するロジックを実装します。
        -   `frequency_estimator.rs`: 様々な周波数推定アルゴリズム（FFT, CQTなど）の具体的な実装を提供します。
        -   `gain_controller.rs`: ゲイン（音量）を制御するロジックを実装します。
        -   `lib.rs`: Rustクレートのエントリポイントで、JavaScriptから呼び出されるWebAssembly関数のインターフェースを定義します。
        -   `waveform_searcher.rs`: 生のオーディオ波形データから特定のパターンを探索するロジックを実装します。
        -   `zero_cross_detector.rs`: 波形がゼロクロスする点を検出するロジックを実装します。

## 関数詳細説明
ここでは、プロジェクトの主要な役割を果たす関数について説明します。

-   **`Oscilloscope` クラスの関数 (src/Oscilloscope.ts)**
    -   `constructor(canvas: HTMLCanvasElement)`:
        -   **役割**: オシロスコープのインスタンスを初期化し、描画に使用するHTML Canvas要素を設定します。
        -   **引数**: `canvas` (HTMLCanvasElement) - 波形を描画するキャンバス要素。
        -   **戻り値**: なし
    -   `start()`:
        -   **役割**: マイク入力を開始し、リアルタイムでの波形可視化と分析を開始します。
        -   **引数**: なし
        -   **戻り値**: `Promise<void>`
    -   `startFromFile(file: File)`:
        -   **役割**: 指定されたオーディオファイル（例: WAV）を読み込み、再生しながら波形可視化と分析を開始します。
        -   **引数**: `file` (File) - 再生するオーディオファイル。
        -   **戻り値**: `Promise<void>`
    -   `startFromBuffer(bufferSource: BufferSource)`:
        -   **役割**: 既存の静的オーディオバッファ (`BufferSource`インスタンス) から波形可視化と分析を開始します。
        -   **引数**: `bufferSource` (BufferSource) - オーディオデータを供給するバッファソース。
        -   **戻り値**: `Promise<void>`
    -   `stop()`:
        -   **役割**: 現在進行中のオーディオ入力/再生と波形描画処理を停止します。
        -   **引数**: なし
        -   **戻り値**: `void`
    -   `setFrequencyEstimationMethod(method: FrequencyEstimationMethod)`:
        -   **役割**: 使用する周波数推定アルゴリズム（例: FFT, CQT）を設定します。
        -   **引数**: `method` (FrequencyEstimationMethod) - 選択する推定方式。
        -   **戻り値**: `void`
    -   `getEstimatedFrequency()`:
        -   **役割**: 現在推定されている主周波数を取得します。
        -   **引数**: なし
        -   **戻り値**: `number | null` - 推定周波数（Hz）、または推定できない場合は`null`。
    -   `setAutoGain(enabled: boolean)`:
        -   **役割**: 波形の振幅を自動調整するオートゲイン機能の有効/無効を切り替えます。
        -   **引数**: `enabled` (boolean) - オートゲインを有効にするか無効にするか。
        -   **戻り値**: `void`
    -   `setNoiseGate(enabled: boolean)`:
        -   **役割**: 特定の閾値以下の信号を除去するノイズゲート機能の有効/無効を切り替えます。
        -   **引数**: `enabled` (boolean) - ノイズゲートを有効にするか無効にするか。
        -   **戻り値**: `void`
    -   `setBufferSizeMultiplier(multiplier: BufferSizeMultiplier)`:
        -   **役割**: 低周波検出精度を向上させるための、内部バッファサイズの乗数を設定します。
        -   **引数**: `multiplier` (BufferSizeMultiplier) - バッファサイズの倍率 (1x, 4x, 16x)。
        -   **戻り値**: `void`
    -   `setDebugOverlaysEnabled(enabled: boolean)`:
        -   **役割**: FFTスペクトラムや倍音分析など、デバッグ用のオーバーレイ表示の有効/無効を切り替えます。
        -   **引数**: `enabled` (boolean) - オーバーレイ表示を有効にするか無効にするか。
        -   **戻り値**: `void`
    -   `setOverlaysLayout(layout: OverlayLayoutConfig)`:
        -   **役割**: 表示されるオーバーレイ（FFTスペクトラム、周波数プロットなど）のレイアウトをカスタマイズします。
        -   **引数**: `layout` (OverlayLayoutConfig) - レイアウト設定オブジェクト。
        -   **戻り値**: `void`
    -   `setPauseDrawing(paused: boolean)`:
        -   **役割**: 波形の描画を一時停止または再開します。オーディオ処理自体は継続されます。
        -   **引数**: `paused` (boolean) - 描画を一時停止するかどうか。
        -   **戻り値**: `void`
    -   `getSimilarityScore()`:
        -   **役割**: 現在の波形と前回の波形の類似度スコアを取得します。
        -   **引数**: なし
        -   **戻り値**: `number` - 類似度スコア。

-   **`AudioManager` クラスの関数 (src/AudioManager.ts)**
    -   `start()`:
        -   **役割**: マイクからのオーディオ入力を開始します。
        -   **引数**: なし
        -   **戻り値**: `Promise<void>`
    -   `startFromFile(file: File)`:
        -   **役割**: WAVファイルからのオーディオ再生を開始します。
        -   **引数**: `file` (File) - 再生するWAVファイルオブジェクト。
        -   **戻り値**: `Promise<void>`
    -   `startFromBuffer(bufferSource: BufferSource)`:
        -   **役割**: 既存の`BufferSource`からオーディオ再生を開始します。
        -   **引数**: `bufferSource` (BufferSource) - オーディオデータを供給するインスタンス。
        -   **戻り値**: `Promise<void>`
    -   `stop()`:
        -   **役割**: 現在のオーディオ入力/再生を停止します。
        -   **引数**: なし
        -   **戻り値**: `void`

-   **`WaveformDataProcessor` クラスの関数 (src/WaveformDataProcessor.ts)**
    -   `initialize()`:
        -   **役割**: WebAssemblyモジュールを初期化し、データ処理の準備を整えます。
        -   **引数**: なし
        -   **戻り値**: `Promise<void>`
    -   `loadWasmModule()`:
        -   **役割**: WebAssemblyモジュールをロードします。通常は`initialize`内部で呼び出されます。
        -   **引数**: なし
        -   **戻り値**: `Promise<void>`
    -   `processFrame(audioData: Float32Array)`:
        -   **役割**: オーディオフレームデータをWebAssemblyモジュールに渡し、周波数推定、ゲイン制御、波形検索などの計算を実行させます。
        -   **引数**: `audioData` (Float32Array) - 処理対象のオーディオデータ。
        -   **戻り値**: `WaveformRenderData` - 描画に必要なデータを含むオブジェクト。
    -   `reset()`:
        -   **役割**: WebAssemblyモジュールの内部状態（履歴バッファなど）をリセットします。
        -   **引数**: なし
        -   **戻り値**: `void`

-   **`WaveformRenderer` クラスの関数 (src/WaveformRenderer.ts)**
    -   `drawWaveform(renderData: WaveformRenderData, gain: number)`:
        -   **役割**: 提供されたデータとゲイン情報に基づき、メインの波形をキャンバスに描画します。
        -   **引数**: `renderData` (WaveformRenderData), `gain` (number)
        -   **戻り値**: `void`
    -   `drawFFTOverlay(fftData: Float32Array, sampleRate: number)`:
        -   **役割**: FFT（高速フーリエ変換）結果を周波数スペクトラムとしてオーバーレイ描画します。
        -   **引数**: `fftData` (Float32Array), `sampleRate` (number)
        -   **戻り値**: `void`
    -   `drawHarmonicAnalysis(...)`:
        -   **役割**: 倍音分析の結果を視覚的にオーバーレイ描画します。
        -   **引数**: 複数の数値引数（省略）
        -   **戻り値**: `void`
    -   `drawFrequencyPlot(history: number[])`:
        -   **役割**: 過去の周波数推定値の履歴をプロットとして描画します。
        -   **引数**: `history` (number[])
        -   **戻り値**: `void`
    -   `clearAllCanvases()`:
        -   **役割**: すべての描画キャンバスの内容をクリアします。
        -   **引数**: なし
        -   **戻り値**: `void`

-   **`PianoKeyboardRenderer` クラスの関数 (src/PianoKeyboardRenderer.ts)**
    -   `drawKeyboard(frequency: number)`:
        -   **役割**: 検出された周波数に基づいてピアノ鍵盤を描画し、対応するキーをハイライト表示します。
        -   **引数**: `frequency` (number) - 検出された周波数。
        -   **戻り値**: `void`

-   **`ComparisonPanelRenderer` クラスの関数 (src/ComparisonPanelRenderer.ts)**
    -   `updatePanels(similarityScore: number, currentWaveform: Float32Array, previousWaveform: Float32Array)`:
        -   **役割**: 波形比較パネルを更新し、類似度スコア、現在の波形、前回の波形を表示します。
        -   **引数**: `similarityScore` (number), `currentWaveform` (Float32Array), `previousWaveform` (Float32Array)
        -   **戻り値**: `void`

-   **`utils.ts` の関数 (src/utils.ts)**
    -   `dbToAmplitude(db: number)`:
        -   **役割**: デシベル (dB) 値をリニアな振幅値に変換します。
        -   **引数**: `db` (number)
        -   **戻り値**: `number`
    -   `amplitudeToDb(amplitude: number)`:
        -   **役割**: リニアな振幅値をデシベル (dB) 値に変換します。
        -   **引数**: `amplitude` (number)
        -   **戻り値**: `number`
    -   `frequencyToNote(frequency: number)`:
        -   **役割**: 周波数を音楽のノート（音名、オクターブ、セント）に変換します。
        -   **引数**: `frequency` (number)
        -   **戻り値**: `NoteInfo` (オブジェクト: `{ note: string, octave: number, cents: number }`)
    -   `trimSilence(buffer: Float32Array, threshold: number)`:
        -   **役割**: オーディオバッファの先頭と末尾にある、指定された閾値以下の無音部分をトリム（切り詰め）します。
        -   **引数**: `buffer` (Float32Array), `threshold` (number)
        -   **戻り値**: `Float32Array`

-   **WASM (`wasm_processor.js` / `wasm_processor_bg.wasm`) の主要な関数**
    -   `initSync(module: WebAssembly.Module | Response)`:
        -   **役割**: WebAssemblyモジュールを同期的に初期化し、JavaScriptからRustの関数を呼び出せるように準備します。
        -   **引数**: `module` (WebAssembly.Module | Response) - ロードするWASMモジュールまたはそのレスポンス。
        -   **戻り値**: `void`
    -   `processFrame(waveform_data: Float32Array, sample_rate: number, ...)`:
        -   **役割**: JavaScriptから呼び出され、オーディオデータを処理し、周波数推定、ゲイン制御、波形検索などの複雑な計算をRust側で高速に実行します。
        -   **引数**: `waveform_data` (Float32Array) - 処理するオーディオ波形データ、その他多数の引数（省略）。
        -   **戻り値**: 計算結果を含むオブジェクト。
    -   `reset()`:
        -   **役割**: WebAssemblyモジュール内部の履歴バッファや状態を初期化します。
        -   **引数**: なし
        -   **戻り値**: `void`
    -   `setAutoGain(enabled: boolean)`:
        -   **役割**: WebAssembly側でオートゲイン機能の有効/無効を設定します。
        -   **引数**: `enabled` (boolean)
        -   **戻り値**: `void`

## 関数呼び出し階層ツリー
```
- main.ts (アプリケーションのエントリポイント)
  - Oscilloscope のインスタンス生成
  - UIイベントハンドラの登録 (例: 開始/停止ボタン、設定変更)
    - startFrequencyDisplay()
    - stopFrequencyDisplay()
    - Oscilloscope.start()
    - Oscilloscope.startFromFile()
    - Oscilloscope.startFromBuffer()
    - Oscilloscope.stop()
    - Oscilloscope.setFrequencyEstimationMethod()
    - Oscilloscope.setBufferSizeMultiplier()
    - Oscilloscope.setAutoGain()
    - Oscilloscope.setNoiseGate()
    - Oscilloscope.setNoiseGateThreshold()

- Oscilloscope.start() (マイク入力開始の主要な流れ)
  - AudioManager.start()
  - WaveformDataProcessor.initialize()
    - WaveformDataProcessor.loadWasmModule()
      - wasm_processor.initSync() (WebAssemblyモジュールの初期化)
  - WaveformRenderer.clearAllCanvases()
  - (内部で requestAnimationFrame を利用し、定期的に Oscilloscope.renderFrame() を呼び出す)

- Oscilloscope.startFromFile(file: File) (ファイル再生開始の主要な流れ)
  - AudioManager.startFromFile(file)
  - WaveformDataProcessor.initialize()
  - WaveformRenderer.clearAllCanvases()
  - (内部で requestAnimationFrame を利用し、定期的に Oscilloscope.renderFrame() を呼び出す)

- Oscilloscope.startFromBuffer(bufferSource: BufferSource) (バッファ再生開始の主要な流れ)
  - AudioManager.startFromBuffer(bufferSource)
  - WaveformDataProcessor.initialize()
  - WaveformRenderer.clearAllCanvases()
  - (内部で requestAnimationFrame を利用し、定期的に Oscilloscope.renderFrame() を呼び出す)

- Oscilloscope.renderFrame() (毎フレームの描画・処理更新)
  - AudioManager.getTimeDomainData() (または AudioManager.getExtendedTimeDomainData())
  - WaveformDataProcessor.processFrame()
    - wasm_processor.processFrame() (Rust/WASMでデータ処理を実行)
  - WaveformRenderer.drawWaveform()
  - WaveformRenderer.drawFFTOverlay()
  - WaveformRenderer.drawHarmonicAnalysis()
  - WaveformRenderer.drawFrequencyPlot()
  - PianoKeyboardRenderer.drawKeyboard()
    - utils.frequencyToNote()
  - ComparisonPanelRenderer.updatePanels()

- Oscilloscope.stop() (停止処理)
  - AudioManager.stop()
  - WaveformDataProcessor.cleanup() (WASM関連リソースの解放など)

- Oscilloscope.setFrequencyEstimationMethod(method)
  - wasm_processor.setFrequencyEstimationMethod(method)

- Oscilloscope.setBufferSizeMultiplier(multiplier)
  - wasm_processor.setBufferSizeMultiplier(multiplier)

- Oscilloscope.setAutoGain(enabled)
  - wasm_processor.setAutoGain(enabled)

- Oscilloscope.setNoiseGate(enabled)
  - wasm_processor.setNoiseGate(enabled)

- Oscilloscope.setNoiseGateThreshold(threshold)
  - wasm_processor.setNoiseGateThreshold(threshold)

---
Generated at: 2026-01-18 07:09:13 JST
