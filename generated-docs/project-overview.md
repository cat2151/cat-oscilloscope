Last updated: 2026-01-05

# Project Overview

## プロジェクト概要
- ブラウザ上で動作する、リアルタイム音声波形を視覚化するオシロスコープ風のWebアプリケーションです。
- マイク入力やWAVファイルから音声をキャプチャし、ゼロクロス検出とオートゲイン機能により安定した波形表示を提供します。
- TypeScript、Web Audio API、HTML Canvasを主要技術として使用し、高精度な音声分析と描画を実現しています。

## 技術スタック
- フロントエンド: HTML Canvas (2Dグラフィックスを描画するためのHTML要素。オシロスコープの波形とグリッドのレンダリングに使用。)、Web Audio API (ブラウザで音声のキャプチャ、処理、再生を行うためのAPI。このプロジェクトではマイクからの音声入力とリアルタイム分析に使用。)
- 音楽・オーディオ: Web Audio API (音声のキャプチャ、分析、処理)
- 開発ツール: Vite (高速な開発サーバーとビルドツール。モダンなWebプロジェクトの効率的な開発とビルドを支援。)、vite-plugin-dts (TypeScriptの型定義ファイルを生成するためのViteプラグイン。ライブラリとしての利用時に型情報を提供するために使用。)、cross-env (環境変数をクロスプラットフォームで設定するためのツール。)
- テスト: Vitest (高速な単体テストフレームワーク。JavaScript/TypeScriptプロジェクトのテスト作成と実行に使用。)、@vitest/ui (VitestのテストUI。テスト結果をブラウザで視覚的に確認するために使用。)、happy-dom (DOM操作の高速なエミュレーションを提供するライブラリ。テスト環境でのDOM操作のシミュレーションに使用。)
- ビルドツール: Vite (プロジェクトのビルドと最適化)
- 言語機能: TypeScript (型安全なJavaScript。大規模なアプリケーション開発においてコードの品質と保守性を高めるために使用。)
- 開発標準: TypeScript (型安全によるコード品質と保守性の向上)

## ファイル階層ツリー
```
📄 .gitignore
📖 IMPLEMENTATION_SUMMARY.md
📖 LIBRARY_USAGE.md
📄 LICENSE
📖 README.ja.md
📖 README.md
📖 TESTING.md
📄 _config.yml
🌐 example-library-usage.html
📁 generated-docs/
🌐 index.html
📁 issue-notes/
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
📊 package-lock.json
📊 package.json
📁 src/
  📘 AudioManager.ts
  📘 DebugRenderer.ts
  📘 FrequencyEstimator.ts
  📘 GainController.ts
  📘 Oscilloscope.ts
  📘 WaveformRenderer.ts
  📘 ZeroCrossDetector.ts
  📁 __tests__/
    📘 algorithms.test.ts
    📘 dom-integration.test.ts
    📘 library-exports.test.ts
    📘 oscilloscope.test.ts
    📘 utils.test.ts
  📘 index.ts
  📘 main.ts
  📘 utils.ts
📊 tsconfig.json
📊 tsconfig.lib.json
📘 vite.config.ts
```

## ファイル詳細説明
- **example-library-usage.html**: `cat-oscilloscope`ライブラリをプロジェクト内でどのように使用するかを示すHTMLファイル。ライブラリの組み込みと初期化の具体的な例を提供します。
- **index.html**: アプリケーションのエントリーポイントとなるHTMLファイル。ユーザーインターフェースを定義し、主要なJavaScript（`main.ts`）をロードします。オシロスコープの描画キャンバスやUIコントロール要素を含みます。
- **src/AudioManager.ts**: マイクやファイルからの音声入力を管理するモジュール。Web Audio APIを使用して、音声ストリームの開始、停止、および分析ノードへの接続を制御します。
- **src/DebugRenderer.ts**: デバッグ目的で、オシロスコープの内部状態や特定のデータを描画するためのモジュール。開発時に波形や検出結果の検証に役立ちます。
- **src/FrequencyEstimator.ts**: 入力音声の周波数を推定するためのアルゴリズムを提供するモジュール。FFT（高速フーリエ変換）などを用いて、音のピッチを分析します。
- **src/GainController.ts**: 波形の振幅を自動調整（オートゲイン）するロジックを管理するモジュール。表示される波形がキャンバスの高さに最適に収まるように振幅を制御します。
- **src/Oscilloscope.ts**: オシロスコープの主要なロジックとコンポーネントを統合するコアモジュール。`AudioManager`、`GainController`、`WaveformRenderer`などを連携させ、オシロスコープ全体の動作を制御します。ライブラリとしてエクスポートされる主要クラスでもあります。
- **src/WaveformRenderer.ts**: オシロスコープの波形をHTML Canvas上に描画するモジュール。波形データを受け取り、グリッド線や波形の色、描画スタイルを管理して視覚化します。
- **src/ZeroCrossDetector.ts**: 音声波形のゼロクロスポイント（ゼロ線を横切る点）を検出するアルゴリズムを提供するモジュール。安定した波形表示のために、波形の開始点を特定する役割を担います。
- **src/__tests__/algorithms.test.ts**: `ZeroCrossDetector`や`FrequencyEstimator`など、主要なアルゴリズムの単体テストを定義するファイル。様々な音声波形パターンに対してアルゴリズムが正しく動作するかを検証します。
- **src/__tests__/dom-integration.test.ts**: DOM操作やWeb Audio APIとの統合に関するテストを定義するファイル。実際のブラウザ環境に近い状況でのコンポーネントの動作を検証します。
- **src/__tests__/library-exports.test.ts**: `cat-oscilloscope`ライブラリのエクスポートが正しく行われているかを検証するファイル。npmパッケージとして利用される際のインターフェースの整合性を保証します。
- **src/__tests__/oscilloscope.test.ts**: `Oscilloscope`クラス全体の動作や主要な機能に関する単体テストを定義するファイル。モックされた環境でオシロスコープの挙動を検証します。
- **src/__tests__/utils.test.ts**: `src/utils.ts`で定義されているユーティリティ関数の単体テストを定義するファイル。補助関数の正確性を検証します。
- **src/index.ts**: プロジェクトの主要なエクスポートポイントとなるファイル。`Oscilloscope`クラスなどを外部に公開し、ライブラリとして利用可能にします。
- **src/main.ts**: アプリケーションのエントリーポイントとなるスクリプト。`index.html`からロードされ、`Oscilloscope`のインスタンス化、UIイベントハンドリング、設定管理など、実際のアプリケーションの動作を定義します。
- **src/utils.ts**: プロジェクト全体で利用される汎用的なユーティリティ関数（例: `dbToAmplitude`, `trimSilence`など）をまとめたファイル。
- **tsconfig.json**: TypeScriptコンパイラの設定ファイル。プロジェクトのTypeScriptコードをどのようにコンパイルするかを定義します。
- **tsconfig.lib.json**: ライブラリとしてビルドする際のTypeScriptコンパイラ設定ファイル。`dts`ファイルの出力など、ライブラリ固有の設定を定義します。
- **vite.config.ts**: Viteのビルド設定ファイル。開発サーバーの起動、本番ビルドの最適化、プラグインの利用などを設定します。

## 関数詳細説明
- **`start`** (src/AudioManager.ts, src/Oscilloscope.ts):
  - 役割: マイクからの音声入力を開始し、リアルタイムでの音声処理をアクティブにする。
  - 機能: Web Audio APIの`getUserMedia`を介してマイクアクセスを要求し、成功した場合に音声ストリームを`AudioContext`に接続します。
  - 引数: なし
  - 戻り値: `Promise<void>` (音声入力が正常に開始されたら解決)
- **`startFromFile`** (src/AudioManager.ts, src/Oscilloscope.ts):
  - 役割: 指定された音声ファイルからの入力を開始し、その波形を処理する。
  - 機能: 音声ファイルを読み込み、`AudioBufferSourceNode`を通じて`AudioContext`に接続します。マイク入力の代わりにファイルベースの波形表示を可能にします。
  - 引数: `file: File` (処理対象の音声ファイルオブジェクト)
  - 戻り値: `Promise<void>` (ファイルからの音声入力が正常に開始されたら解決)
- **`stop`** (src/AudioManager.ts, src/Oscilloscope.ts):
  - 役割: 現在アクティブな音声入力を停止する。
  - 機能: マイクストリームまたはファイル再生を終了し、関連するWeb Audio APIリソースを解放します。
  - 引数: なし
  - 戻り値: `void`
- **`constructor`** (src/DebugRenderer.ts, src/WaveformRenderer.ts, src/Oscilloscope.ts, src/__tests__/utils.test.ts):
  - 役割: クラスのインスタンスを初期化する。
  - 機能: 各クラスが必要とする初期設定を受け取り、内部状態を設定します。
  - 引数: (各クラスによる)
  - 戻り値: なし
- **`if`** (複数のファイルで共通):
  - 役割: 条件分岐ロジックを実装する。
  - 機能: 特定の条件が真である場合にコードのブロックを実行し、偽である場合はスキップまたは別のブロックを実行します。データの検証、エラー処理、異なる状態に応じた処理などで利用されます。
  - 引数: 条件式
  - 戻り値: なし (制御フローを管理)
- **`catch`** (src/AudioManager.ts, src/Oscilloscope.ts, src/main.ts):
  - 役割: `try`ブロック内で発生した例外（エラー）を捕捉し、処理する。
  - 機能: マイクアクセス失敗やファイル読み込みエラーなど、非同期操作中に発生する可能性のある問題を安全にハンドリングし、アプリケーションがクラッシュするのを防ぎます。
  - 引数: `error: any` (捕捉されたエラーオブジェクト)
  - 戻り値: なし (エラー処理ロジックを実行)
- **`for`** (複数のファイルで共通):
  - 役割: 繰り返し処理を実行する。
  - 機能: 配列のイテレーション、波形データの処理、サンプルの計算など、繰り返し構造を必要とするあらゆる操作に使用されます。
  - 引数: (ループの初期化、条件、増分)
  - 戻り値: なし (繰り返し処理を実行)
- **`switch`** (src/FrequencyEstimator.ts):
  - 役割: 複数の条件に基づいて異なるコードブロックを実行する。
  - 機能: 周波数推定アルゴリズムの異なるタイプ（例: FFT、ゼロクロス）を切り替える場合など、複数の選択肢の中から一つを実行する際に使用されます。
  - 引数: 評価する式
  - 戻り値: なし (制御フローを管理)
- **`generateSineWave`** (src/__tests__/algorithms.test.ts):
  - 役割: テストのためにサイン波の音声データを生成する。
  - 機能: 指定された周波数、振幅、期間でサイン波をシミュレートし、テストデータとして利用可能な数値配列を返します。
  - 引数: `frequency: number`, `amplitude: number`, `sampleRate: number`, `duration: number`
  - 戻り値: `number[]` (サイン波データ)
- **`generateNoise`** (src/__tests__/algorithms.test.ts):
  - 役割: テストのためにランダムノイズの音声データを生成する。
  - 機能: 指定された振幅と長さでランダムなノイズデータを生成し、テストデータとして利用可能な数値配列を返します。
  - 引数: `amplitude: number`, `sampleRate: number`, `duration: number`
  - 戻り値: `number[]` (ノイズデータ)
- **`generateSquareWave`** (src/__tests__/algorithms.test.ts):
  - 役割: テストのために矩形波の音声データを生成する。
  - 機能: 指定された周波数、振幅、期間で矩形波をシミュレートし、テストデータとして利用可能な数値配列を返します。
  - 引数: `frequency: number`, `amplitude: number`, `sampleRate: number`, `duration: number`
  - 戻り値: `number[]` (矩形波データ)
- **`countZeroCrossings`** (src/__tests__/algorithms.test.ts):
  - 役割: 波形データ内のゼロクロスポイントの数を数える。
  - 機能: テストデータに対して`ZeroCrossDetector`の正確性を検証するために、手動でゼロクロス数を計算します。
  - 引数: `data: number[]` (波形データ)
  - 戻り値: `number` (ゼロクロス数)
- **`createMediaStreamSource`** (src/__tests__/algorithms.test.ts, src/__tests__/dom-integration.test.ts, src/__tests__/oscilloscope.test.ts):
  - 役割: テスト用の`MediaStreamAudioSourceNode`のモックを作成する。
  - 機能: `Web Audio API`の`MediaStreamSource`をシミュレートし、テスト中に実際のマイクアクセスなしで音声入力を模倣できるようにします。
  - 引数: `audioContext: AudioContext`, `stream: MediaStream`
  - 戻り値: `MediaStreamAudioSourceNode` (モックオブジェクト)
- **`createAnalyser`** (src/__tests__/algorithms.test.ts, src/__tests__/dom-integration.test.ts, src/__tests__/oscilloscope.test.ts):
  - 役割: テスト用の`AnalyserNode`のモックを作成する。
  - 機能: `Web Audio API`の`AnalyserNode`をシミュレートし、テスト中に音声分析処理を模倣できるようにします。
  - 引数: `audioContext: AudioContext`
  - 戻り値: `AnalyserNode` (モックオブジェクト)
- **`close`** (src/__tests__/algorithms.test.ts, src/__tests__/dom-integration.test.ts, src/__tests__/oscilloscope.test.ts):
  - 役割: `MediaStream`や`AudioContext`を閉じる操作をモックする。
  - 機能: テストのクリーンアップフェーズでリソースが適切に解放されることをシミュレートします。
  - 引数: なし
  - 戻り値: `Promise<void>`
- **`getTracks`** (src/__tests__/algorithms.test.ts, src/__tests__/dom-integration.test.ts, src/__tests__/oscilloscope.test.ts):
  - 役割: `MediaStream`からトラックを取得する操作をモックする。
  - 機能: テスト中に`MediaStream`の音声トラックやビデオトラックをシミュレートし、関連するロジックの動作を確認します。
  - 引数: なし
  - 戻り値: `MediaStreamTrack[]` (モックされたトラックの配列)
- **`createSilentMockAudioContext`** (src/__tests__/oscilloscope.test.ts):
  - 役割: テスト用のサイレントな`AudioContext`のモックを作成する。
  - 機能: 実際の音声出力なしに`AudioContext`の機能を提供し、音声処理ロジックのテストを隔離された環境で行えるようにします。
  - 引数: なし
  - 戻り値: `AudioContext` (モックオブジェクト)
- **`getFFTOverlayDimensions`** (src/__tests__/oscilloscope.test.ts):
  - 役割: FFTオーバーレイの寸法を取得する。
  - 機能: オシロスコープの描画に関する特定の計算や描画範囲をテストするために使用される可能性があります。
  - 引数: なし
  - 戻り値: (寸法に関する情報)
- **`findFFTOverlayBorderCall`** (src/__tests__/oscilloscope.test.ts):
  - 役割: FFTオーバーレイのボーダー描画呼び出しを特定する。
  - 機能: 特定の描画ロジックが期待通りに呼び出されているかをテストするために使用される可能性があります。
  - 引数: なし
  - 戻り値: (描画呼び出しに関する情報)
- **`getAudioTracks`** (src/__tests__/oscilloscope.test.ts):
  - 役割: `MediaStream`から音声トラックをモックして取得する。
  - 機能: `MediaStream`の音声トラック関連の処理をテストするために使用されます。
  - 引数: なし
  - 戻り値: `MediaStreamTrack[]` (モックされた音声トラックの配列)
- **`getVideoTracks`** (src/__tests__/oscilloscope.test.ts):
  - 役割: `MediaStream`からビデオトラックをモックして取得する。
  - 機能: `MediaStream`のビデオトラック関連の処理をテストするために使用されます。
  - 引数: なし
  - 戻り値: `MediaStreamTrack[]` (モックされたビデオトラックの配列)
- **`stop`** (src/__tests__/oscilloscope.test.ts):
  - 役割: テスト用の`MediaStreamTrack`の停止操作をモックする。
  - 機能: `MediaStreamTrack`が正しく停止されることをシミュレートします。
  - 引数: なし
  - 戻り値: `void`
- **`defineProperty`** (src/__tests__/oscilloscope.test.ts):
  - 役割: オブジェクトに新しいプロパティを定義するか、既存のプロパティを変更する。
  - 機能: テストにおいて、特定のオブジェクトの振る舞いを変更するためにプロパティの定義をモックする際に使用されます。
  - 引数: `obj: object`, `prop: PropertyKey`, `descriptor: PropertyDescriptor`
  - 戻り値: `object`
- **`function`** (src/__tests__/oscilloscope.test.ts):
  - 役割: 無名関数またはヘルパー関数として使用される。
  - 機能: 特定のテストシナリオでインラインで定義される補助的なロジックを実行します。
  - 引数: (特定のコンテキストによる)
  - 戻り値: (特定のコンテキストによる)
- **`sliderValueToThreshold`** (src/main.ts):
  - 役割: UIスライダーの値をゼロクロス検出の閾値に変換する。
  - 機能: ユーザーがスライダーで設定した値を、ゼロクロス検出アルゴリズムが使用する適切な閾値範囲にマッピングします。
  - 引数: `sliderValue: number`
  - 戻り値: `number` (変換された閾値)
- **`formatThresholdDisplay`** (src/main.ts):
  - 役割: 閾値の値をユーザーフレンドリーな形式で表示用にフォーマットする。
  - 機能: 数値の閾値を文字列に変換し、UIに表示する準備をします。
  - 引数: `threshold: number`
  - 戻り値: `string` (フォーマットされた閾値表示)
- **`startFrequencyDisplay`** (src/main.ts):
  - 役割: 周波数表示の更新を開始する。
  - 機能: `FrequencyEstimator`からの結果をUIにリアルタイムで表示するための更新ループを開始します。
  - 引数: `frequencyEstimator: FrequencyEstimator`, `displayElement: HTMLElement`
  - 戻り値: `void`
- **`stopFrequencyDisplay`** (src/main.ts):
  - 役割: 周波数表示の更新を停止する。
  - 機能: `startFrequencyDisplay`で開始された更新ループを終了します。
  - 引数: なし
  - 戻り値: `void`
- **`dbToAmplitude`** (src/utils.ts):
  - 役割: デシベル(dB)値を振幅スケールに変換する。
  - 機能: 音量レベルを示すデシベル値を、波形描画などに適した線形振幅値に変換します。
  - 引数: `db: number`
  - 戻り値: `number` (変換された振幅値)
- **`trimSilence`** (src/utils.ts):
  - 役割: 音声データの先頭と末尾の無音部分をトリムする。
  - 機能: 音声バッファから無音部分を検出し、実際の音声データのみを抽出して返すことで、分析や表示の効率を高めます。
  - 引数: `audioBuffer: AudioBuffer`
  - 戻り値: `AudioBuffer` (トリムされた音声バッファ)
- **`createAudioBuffer`** (src/__tests__/utils.test.ts):
  - 役割: テスト用の`AudioBuffer`オブジェクトを作成する。
  - 機能: `Web Audio API`の`AudioBuffer`をモックし、音声データ処理関数のテストに使用します。
  - 引数: `context: AudioContext`, `numberOfChannels: number`, `length: number`, `sampleRate: number`
  - 戻り値: `AudioBuffer` (モックオブジェクト)

## 関数呼び出し階層ツリー
```
- main.ts
  - (Oscilloscopeインスタンスの生成と利用)
  - sliderValueToThreshold() (src/main.ts)
    - formatThresholdDisplay() (src/main.ts)
      - startFrequencyDisplay() (src/main.ts)
      - stopFrequencyDisplay() (src/main.ts)

- Oscilloscope.ts
  - constructor() (src/Oscilloscope.ts)
  - start() (src/Oscilloscope.ts)
    - catch() (src/Oscilloscope.ts)
    - AudioManager.start() (src/AudioManager.ts)
  - startFromFile() (src/Oscilloscope.ts)
    - catch() (src/Oscilloscope.ts)
    - AudioManager.startFromFile() (src/AudioManager.ts)
  - stop() (src/Oscilloscope.ts)

- AudioManager.ts
  - if (src/AudioManager.ts)
    - start() (src/AudioManager.ts)
    - startFromFile() (src/AudioManager.ts)
      - trimSilence() (src/utils.ts)
    - stop() (src/AudioManager.ts)
  - catch (src/AudioManager.ts)

- FrequencyEstimator.ts
  - for (src/FrequencyEstimator.ts)
  - if (src/FrequencyEstimator.ts)
  - switch (src/FrequencyEstimator.ts)

- GainController.ts
  - if (src/GainController.ts)
  - for (src/GainController.ts)

- utils.ts
  - dbToAmplitude() (src/utils.ts)
  - trimSilence() (src/utils.ts)
    - for (src/utils.ts)
    - if (src/utils.ts)

- テストユーティリティ関数 (src/__tests__内のファイル)
  - generateSineWave(src/__tests__/algorithms.test.ts)
    - generateNoise() (src/__tests__/algorithms.test.ts)
      - generateSquareWave() (src/__tests__/algorithms.test.ts)
      - countZeroCrossings() (src/__tests__/algorithms.test.ts)
  - createMediaStreamSource(src/__tests__/algorithms.test.ts)
  - createAnalyser(src/__tests__/algorithms.test.ts)
  - close(src/__tests__/algorithms.test.ts)
  - getTracks(src/__tests__/algorithms.test.ts)
  - createSilentMockAudioContext(src/__tests__/oscilloscope.test.ts)
    - getFFTOverlayDimensions() (src/__tests__/oscilloscope.test.ts)
      - findFFTOverlayBorderCall() (src/__tests__/oscilloscope.test.ts)
      - getAudioTracks() (src/__tests__/oscilloscope.test.ts)
      - getVideoTracks() (src/__tests__/oscilloscope.test.ts)
      - defineProperty() (src/__tests__/oscilloscope.test.ts)
      - function() (src/__tests__/oscilloscope.test.ts)
  - createAudioBuffer(src/__tests__/utils.test.ts)

---
Generated at: 2026-01-05 07:09:24 JST
