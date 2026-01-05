Last updated: 2026-01-06

# Project Overview

## プロジェクト概要
- ブラウザ上で動作する、リアルタイム音声波形ビジュアライザー「cat-oscilloscope」です。
- マイク入力やWAVファイルから音源を取得し、安定したオシロスコープ風の表示を提供します。
- ゼロクロス検出やオートゲインなどの機能で、直感的で視覚的に魅力的な体験を実現します。

## 技術スタック
- フロントエンド: **HTML Canvas** (2D波形レンダリングに使用し、波形やグリッド、FFTオーバーレイを描画します。)
- 音楽・オーディオ: **Web Audio API** (マイクからの音声キャプチャ、WAVファイルからの読み込み、およびリアルタイムの音声分析と処理に使用されます。)
- 開発ツール: **Vite** (高速な開発サーバーと効率的なモジュールバンドラーとして機能し、開発体験を向上させます。)、**cross-env** (様々なプラットフォームで環境変数を設定するために使用されます。)
- テスト: **Vitest** (プロジェクトの単体テスト、統合テスト、コンポーネントテストを実行するための高速なテストフレームワークです。)、**@vitest/ui** (Vitestのテスト結果をブラウザで視覚的に確認できるユーザーインターフェースを提供します。)、**happy-dom** (DOM環境を高速にシミュレートし、ブラウザAPIに依存するテストをNode.js環境で実行可能にします。)
- ビルドツール: **Vite** (本番環境向けに最適化されたアプリケーションのビルドプロセスを管理します。)、**vite-plugin-dts** (TypeScriptの型定義ファイル（.d.ts）を自動生成し、ライブラリとしての利用を容易にします。)
- 言語機能: **TypeScript** (JavaScriptに静的型付けをもたらし、大規模アプリケーションの開発におけるコードの信頼性、可読性、保守性を高めます。)
- 自動化・CI/CD: (直接的なCI/CDツールは記述されていませんが、npmスクリプトによるビルド・テストの自動化により、開発プロセスが効率化されています。)
- 開発標準: **TypeScript** (厳格な型チェックによりコードの品質を向上させ、開発チーム内でのコードの一貫性と標準化を促進します。)

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
📁 src/
  📘 AudioManager.ts
  📘 FrequencyEstimator.ts
  📘 GainController.ts
  📘 Oscilloscope.ts
  📘 WaveformRenderer.ts
  📘 WaveformSearcher.ts
  📘 ZeroCrossDetector.ts
  📁 __tests__/
    📘 algorithms.test.ts
    📘 dom-integration.test.ts
    📘 library-exports.test.ts
    📘 oscilloscope.test.ts
    📘 utils.test.ts
    📘 waveform-searcher.test.ts
  📘 index.ts
  📘 main.ts
  📘 utils.ts
📊 tsconfig.json
📊 tsconfig.lib.json
📘 vite.config.ts
```

## ファイル詳細説明
- **IMPLEMENTATION_SUMMARY.md**: プロジェクトの実装に関する主要な要約や設計思想をまとめたドキュメントです。
- **LIBRARY_USAGE.md**: 本プロジェクトをnpmライブラリとして他のプロジェクトで使用する際の手順とコード例を説明するドキュメントです。
- **LICENSE**: プロジェクトのライセンス情報（MITライセンス）を記述したファイルです。
- **README.ja.md / README.md**: プロジェクトの概要、機能、使い方、開発方法など、基本的な情報を説明する主要なドキュメント（日本語版と英語版）です。
- **TESTING.md**: プロジェクトのテスト方法、テストの種類、カバレッジレポートの生成方法など、テストに関する詳細を説明するドキュメントです。
- **example-library-usage.html**: `cat-oscilloscope`をnpmライブラリとして使用する具体的な例を示すHTMLファイルです。
- **index.html**: ブラウザでアプリケーションを動かすためのメインのHTMLファイルです。キャンバス要素やUI部品、JavaScriptのエントリポイントを読み込みます。
- **issue-notes/**: 開発中に発生した特定の課題や検討事項に関するメモが保存されているディレクトリです。
- **package.json**: プロジェクトのメタ情報（名前、バージョン）、依存関係、開発依存関係、およびnpmスクリプトを定義するファイルです。
- **package-lock.json**: `package.json`に基づいてインストールされた依存関係の正確なバージョンとツリー構造を記録し、ビルドの再現性を保証します。
- **src/AudioManager.ts**: マイク入力または指定されたWAVファイルからの音声データを管理し、Web Audio APIを介してオーディオ処理グラフを構築する役割を担います。
- **src/FrequencyEstimator.ts**: 入力された音声データの周波数を推定するためのアルゴリズム（例: FFT）を実装しています。
- **src/GainController.ts**: 波形の振幅を自動的に調整（オートゲイン）し、キャンバスの表示領域を最適に利用して波形が適切に見えるように制御します。
- **src/Oscilloscope.ts**: オシロスコープの中核となるロジックをカプセル化したメインクラスです。音声入力の開始、停止、処理、レンダリングフロー全体を統合します。
- **src/WaveformRenderer.ts**: HTML Canvas要素に対して、音声波形、グリッド、FFTオーバーレイなどを描画する具体的な処理を実装しています。
- **src/WaveformSearcher.ts**: 音声波形データの中から、特定のパターンやポイント（例：ゼロクロス点、ピーク）を効率的に検索する機能を提供します。
- **src/ZeroCrossDetector.ts**: 音声波形がゼロラインをマイナスからプラスへ、またはその逆に横切るポイント（ゼロクロス点）を検出するアルゴリズムを実装し、安定した波形表示の基準を提供します。
- **src/__tests__/**: プロジェクトの各モジュールやアルゴリズムの単体テスト、DOM統合テストなどが含まれるディレクトリです。コードの品質と信頼性を保証します。
- **src/index.ts**: ライブラリとしての公開エントリポイントであり、外部から`Oscilloscope`クラスをインポートできるようにします。
- **src/main.ts**: Webアプリケーションのエントリポイントです。UI要素の初期化、イベントハンドリング、`Oscilloscope`インスタンスの生成と連携など、アプリケーションの起動ロジックを管理します。
- **src/utils.ts**: プロジェクト全体で共通して使用される汎用的なユーティリティ関数（例：dB値から振幅値への変換、無音部分のトリミングなど）をまとめています。
- **tsconfig.json**: TypeScriptコンパイラの設定ファイルで、プロジェクト全体でTypeScriptのコンパイルルールを定義します。
- **tsconfig.lib.json**: ライブラリビルド用のTypeScriptコンパイラ設定ファイルで、`vite-plugin-dts`が参照します。
- **vite.config.ts**: Viteビルドツールの設定ファイルで、開発サーバーの挙動や本番ビルドの最適化オプションなどを定義します。

## 関数詳細説明
- **if (src/AudioManager.ts)**: 条件分岐を処理し、特定の条件下でコードブロックを実行します。
- **catch (src/AudioManager.ts)**: tryブロック内で発生したエラーを捕捉し、適切なエラーハンドリングロジックを実行します。
- **start (src/AudioManager.ts)**: マイクからの音声入力を開始し、オーディオ処理グラフを設定します。
- **startFromFile (src/AudioManager.ts)**: 指定されたファイル（例: WAV）からの音声入力を開始し、オーディオ処理グラフを設定します。
- **stop (src/AudioManager.ts)**: 現在のアクティブな音声入力を停止し、関連するオーディオリソースを解放します。
- **for (src/FrequencyEstimator.ts)**: 繰り返し処理を実行し、音声データ分析などのループを制御します。
- **if (src/FrequencyEstimator.ts)**: 条件分岐を処理し、周波数推定アルゴリズム内の特定のロジックを実行します。
- **switch (src/FrequencyEstimator.ts)**: 複数のケースに基づいた条件分岐を処理し、異なる周波数推定方法を切り替えます。
- **if (src/GainController.ts)**: 条件分岐を処理し、ゲイン調整ロジック内の特定の条件下で振幅を調整します。
- **for (src/GainController.ts)**: 繰り返し処理を実行し、オートゲイン調整アルゴリズム内の計算を制御します。
- **constructor (src/Oscilloscope.ts)**: `Oscilloscope`クラスのインスタンスを初期化します。Canvas要素を受け取り、内部コンポーネント（AudioManager, GainControllerなど）を設定します。
- **start (src/Oscilloscope.ts)**: オシロスコープの波形表示と音声処理を開始します。マイクアクセス許可の取得などを含みます。
- **startFromFile (src/Oscilloscope.ts)**: ファイルからの音声入力に基づいてオシロスコープの表示を開始します。
- **stop (src/Oscilloscope.ts)**: オシロスコープの全ての音声処理とレンダリングを停止します。
- **constructor (src/WaveformRenderer.ts)**: `WaveformRenderer`クラスのインスタンスを初期化します。Canvasレンダリングコンテキストを受け取り、描画設定を行います。
- **if (src/WaveformRenderer.ts)**: 条件分岐を処理し、波形、グリッド、FFTオーバーレイなどの描画ロジックを制御します。
- **for (src/WaveformRenderer.ts)**: 繰り返し処理を実行し、波形データの各ポイントをCanvasに描画するループを制御します。
- **if (src/WaveformSearcher.ts)**: 条件分岐を処理し、波形データ内での特定パターンの検索ロジックを制御します。
- **for (src/WaveformSearcher.ts)**: 繰り返し処理を実行し、波形データ全体を走査してパターンを検索するループを制御します。
- **if (src/ZeroCrossDetector.ts)**: 条件分岐を処理し、ゼロクロス検出アルゴリズム内の特定のロジックを実行します。
- **for (src/ZeroCrossDetector.ts)**: 繰り返し処理を実行し、音声バッファ全体を走査してゼロクロス点を検出するループを制御します。
- **generateSineWave (src/__tests__/algorithms.test.ts)**: テスト目的で、指定された周波数、振幅、サンプリングレートに基づいてサイン波形データを生成します。
- **generateNoise (src/__tests__/algorithms.test.ts)**: テスト目的で、ランダムなノイズ波形データを生成します。
- **generateSquareWave (src/__tests__/algorithms.test.ts)**: テスト目的で、指定された周波数、振幅、サンプリングレートに基づいて矩形波形データを生成します。
- **countZeroCrossings (src/__tests__/algorithms.test.ts)**: テスト目的で、与えられた波形データ内のゼロクロス点の数をカウントします。
- **createMediaStreamSource (src/__tests__/algorithms.test.ts)**: テスト用のMediaStreamSourceNodeをモック（または生成）し、オーディオ処理グラフの入力をシミュレートします。
- **createAnalyser (src/__tests__/algorithms.test.ts)**: テスト用のAnalyserNodeをモック（または生成）し、周波数や時間領域データを取得する機能をシミュレートします。
- **close (src/__tests__/algorithms.test.ts)**: テストコンテキストやリソースをクリーンアップします。
- **getTracks (src/__tests__/algorithms.test.ts)**: MediaStreamからトラック情報を取得します。
- **createMediaStreamSource (src/__tests__/dom-integration.test.ts)**: DOM統合テスト用にMediaStreamSourceNodeを生成します。
- **createAnalyser (src/__tests__/dom-integration.test.ts)**: DOM統合テスト用にAnalyserNodeを生成します。
- **for (src/__tests__/dom-integration.test.ts)**: DOM操作やテストデータの準備における繰り返し処理を制御します。
- **close (src/__tests__/dom-integration.test.ts)**: DOM統合テスト後のリソースをクリーンアップします。
- **getTracks (src/__tests__/dom-integration.test.ts)**: DOM統合テストのMediaStreamからトラック情報を取得します。
- **createSilentMockAudioContext (src/__tests__/oscilloscope.test.ts)**: オシロスコープのテスト用に、音声処理が行われないモックのAudioContextを作成します。
- **getFFTOverlayDimensions (src/__tests__/oscilloscope.test.ts)**: FFTオーバーレイの描画に関する寸法を取得するヘルパー関数です。
- **findFFTOverlayBorderCall (src/__tests__/oscilloscope.test.ts)**: FFTオーバーレイの境界線描画コールをテストユーティリティから検索します。
- **createMediaStreamSource (src/__tests__/oscilloscope.test.ts)**: オシロスコープテスト用にMediaStreamSourceNodeを生成します。
- **createAnalyser (src/__tests__/oscilloscope.test.ts)**: オシロスコープテスト用にAnalyserNodeを生成します。
- **for (src/__tests__/oscilloscope.test.ts)**: オシロスコープテスト内の繰り返し処理を制御します。
- **close (src/__tests__/oscilloscope.test.ts)**: オシロスコープテスト後のリソースをクリーンアップします。
- **getTracks (src/__tests__/oscilloscope.test.ts)**: オシロスコープテストのMediaStreamからトラック情報を取得します。
- **getAudioTracks (src/__tests__/oscilloscope.test.ts)**: MediaStreamからオーディオトラックをフィルタリングして取得します。
- **getVideoTracks (src/__tests__/oscilloscope.test.ts)**: MediaStreamからビデオトラックをフィルタリングして取得します。
- **stop (src/__tests__/oscilloscope.test.ts)**: MediaStreamや関連するリソースを停止します。
- **if (src/__tests__/oscilloscope.test.ts)**: オシロスコープテスト内の条件分岐を制御します。
- **createAudioBuffer (src/__tests__/utils.test.ts)**: テスト目的で、指定されたプロパティを持つAudioBufferオブジェクトを生成します。
- **constructor (src/__tests__/utils.test.ts)**: テストヘルパークラスやモックオブジェクトの初期化を行います。
- **for (src/__tests__/utils.test.ts)**: ユーティリティ関数のテストにおける繰り返し処理を制御します。
- **if (src/__tests__/utils.test.ts)**: ユーティリティ関数のテストにおける条件分岐を制御します。
- **for (src/__tests__/waveform-searcher.test.ts)**: WaveformSearcherのテストにおける繰り返し処理を制御します。
- **if (src/__tests__/waveform-searcher.test.ts)**: WaveformSearcherのテストにおける条件分岐を制御します。
- **sliderValueToThreshold (src/main.ts)**: UIのスライダーから得られた値を、波形検出のための適切な閾値に変換します。
- **formatThresholdDisplay (src/main.ts)**: 閾値の表示形式を整形し、ユーザーフレンドリーな文字列を生成します。
- **startFrequencyDisplay (src/main.ts)**: アプリケーションのUI上で周波数表示の更新を開始します。
- **stopFrequencyDisplay (src/main.ts)**: アプリケーションのUI上で周波数表示の更新を停止します。
- **for (src/main.ts)**: アプリケーションの起動ロジックやUIイベント処理における繰り返し処理を制御します。
- **if (src/main.ts)**: アプリケーションの起動ロジックやUIイベント処理における条件分岐を制御します。
- **catch (src/main.ts)**: アプリケーションの起動中やマイクアクセス時などに発生するエラーを捕捉し、処理します。
- **dbToAmplitude (src/utils.ts)**: デシベル値（dB）を線形振幅値に変換するユーティリティ関数です。
- **trimSilence (src/utils.ts)**: 音声バッファの先頭と末尾から無音部分を検出し、トリミングしてデータサイズを最適化するユーティリティ関数です。
- **for (src/utils.ts)**: ユーティリティ関数内の繰り返し処理を制御します。
- **if (src/utils.ts)**: ユーティリティ関数内の条件分岐を制御します。

## 関数呼び出し階層ツリー
```
- if (src/AudioManager.ts)
  - start ()
    - startFromFile ()
      - stop ()
      - createMediaStreamSource ()
      - createAnalyser ()
      - close ()
      - getTracks ()
      - trimSilence ()
  - dbToAmplitude ()
  - constructor (undefined)
  - generateSineWave (src/__tests__/algorithms.test.ts)
    - generateNoise ()
      - generateSquareWave ()
      - countZeroCrossings ()
  - createSilentMockAudioContext (src/__tests__/oscilloscope.test.ts)
    - getFFTOverlayDimensions ()
      - findFFTOverlayBorderCall ()
      - getAudioTracks ()
      - getVideoTracks ()
  - sliderValueToThreshold (src/main.ts)
    - formatThresholdDisplay ()
      - startFrequencyDisplay ()
      - stopFrequencyDisplay ()
- catch (src/AudioManager.ts)
- for (src/FrequencyEstimator.ts)
- switch (src/FrequencyEstimator.ts)
- createAudioBuffer (src/__tests__/utils.test.ts)

---
Generated at: 2026-01-06 07:09:31 JST
