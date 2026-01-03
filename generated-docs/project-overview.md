Last updated: 2026-01-04

# Project Overview

## プロジェクト概要
- ブラウザ上でマイク入力をリアルタイムに波形として視覚化する、オシロスコープ風アプリケーションです。
- 音声のゼロクロス検出とオートゲイン機能により、安定したクリアな波形表示を実現します。
- 直感的でクラシックなデザインで、音の波形を簡単に観察・分析できるツールです。

## 技術スタック
- フロントエンド: HTML Canvas (2DグラフィックAPIで波形描画を担当), Web Audio API (ブラウザ上でマイクからの音声入力とリアルタイム処理を行う主要API)
- 音楽・オーディオ: Web Audio API (音声データのキャプチャ、分析、周波数推定に不可欠)
- 開発ツール: Vite (高速な開発サーバーとビルドシステムを提供)
- テスト: Vitest (JavaScript/TypeScriptの高速なテストフレームワーク), Happy DOM (ブラウザ環境をエミュレートし、DOM関連のテストを可能にする)
- ビルドツール: Vite (本番環境向けの最適化されたコード生成をサポート)
- 言語機能: TypeScript (静的型付けによりコードの堅牢性と保守性を向上させる)
- 開発標準: (TypeScriptの採用により、コードの型安全性が確保され、プロジェクト全体の品質とメンテナンス性が向上しています。)

## ファイル階層ツリー
```
📄 .gitignore
📄 LICENSE
📖 README.ja.md
📖 README.md
📖 TESTING.md
📄 _config.yml
📁 generated-docs/
🌐 index.html
📁 issue-notes/
  📖 57.md
  📖 59.md
📊 package-lock.json
📊 package.json
📁 src/
  📘 AudioManager.ts
  📘 FrequencyEstimator.ts
  📘 GainController.ts
  📘 Oscilloscope.ts
  📘 WaveformRenderer.ts
  📘 ZeroCrossDetector.ts
  📁 __tests__/
    📘 algorithms.test.ts
    📘 dom-integration.test.ts
    📘 oscilloscope.test.ts
    📘 utils.test.ts
  📘 main.ts
  📘 utils.ts
📊 tsconfig.json
📘 vite.config.ts
```

## ファイル詳細説明
-   **index.html**: アプリケーションのエントリーポイントとなるHTMLファイルです。基本的なページ構造とJavaScriptの読み込みを定義しています。
-   **LICENSE**: プロジェクトのライセンス情報（MITライセンス）が記述されています。
-   **README.ja.md / README.md**: プロジェクトの概要、機能、セットアップ方法、技術スタックなどが説明されたドキュメントファイルです。
-   **TESTING.md**: テストに関する詳細情報が記述されたドキュメントファイルです。
-   **package.json**: プロジェクトのメタデータ（名前、バージョンなど）および依存関係、スクリプトが定義されています。
-   **package-lock.json**: `package.json`に基づく依存関係の厳密なバージョンを記録し、ビルドの一貫性を保証します。
-   **tsconfig.json**: TypeScriptコンパイラの設定ファイルです。コンパイルオプションなどを定義しています。
-   **vite.config.ts**: Viteビルドツールの設定ファイルです。開発サーバーの挙動やビルドプロセスを定義します。
-   **src/main.ts**: アプリケーションのメインエントリポイント。UIの初期化、イベントハンドリング、主要コンポーネントの連携を管理します。
-   **src/utils.ts**: アプリケーション全体で再利用される汎用的なユーティリティ関数群（例: dB-振幅変換、無音部分のトリムなど）を提供します。
-   **src/AudioManager.ts**: Web Audio APIを使用してマイクからの音声入力を開始・停止し、音声ストリームを管理する役割を担います。
-   **src/FrequencyEstimator.ts**: 入力された音声データから主要な周波数を推定するアルゴリズムを実装しています。
-   **src/GainController.ts**: 音声波形の振幅を自動的に調整（オートゲイン）し、キャンバス上での最適な表示を実現するロジックを制御します。
-   **src/Oscilloscope.ts**: オシロスコープの核となるクラスで、AudioManager、GainController、FrequencyEstimator、WaveformRendererなどのコンポーネントを統合し、全体の動作を統括します。
-   **src/WaveformRenderer.ts**: HTML Canvas要素に波形、グリッド、FFTオーバーレイなどの視覚的な要素を描画する処理を担当します。
-   **src/ZeroCrossDetector.ts**: 音声波形がゼロラインを通過する点（ゼロクロスポイント）を検出し、波形表示の安定化に不可欠なアルゴリズムを提供します。
-   **src/__tests__/algorithms.test.ts**: ゼロクロス検出や波形生成など、プロジェクトの中核となるアルゴリズムの動作を検証する単体テストファイルです。
-   **src/__tests__/dom-integration.test.ts**: アプリケーションのDOM操作やブラウザ環境との連携が正しく行われるかを検証する統合テストファイルです。
-   **src/__tests__/oscilloscope.test.ts**: オシロスコープ全体の機能や、各コンポーネント間の連携を広範囲にテストするファイルです。
-   **src/__tests__/utils.test.ts**: `src/utils.ts`に含まれる汎用ユーティリティ関数の動作を検証する単体テストファイルです。

## 関数詳細説明
-   `start()` (src/AudioManager.ts): マイクからの音声入力と、Web Audio APIを使ったリアルタイム処理を開始します。
-   `startFromFile()` (src/AudioManager.ts, src/Oscilloscope.ts): (プロジェクト情報には詳細がありませんが、ファイルからの音声入力処理を開始する機能を示唆しています。)
-   `stop()` (src/AudioManager.ts, src/Oscilloscope.ts): 現在の音声入力処理を停止し、関連するリソースを解放します。
-   `constructor` (src/Oscilloscope.ts, src/WaveformRenderer.ts): 各クラスのインスタンスを初期化し、必要な設定やコンポーネントのセットアップを行います。
-   `generateSineWave()` (src/__tests__/algorithms.test.ts): テスト目的で、正弦波の音声データを生成します。
-   `generateNoise()` (src/__tests__/algorithms.test.ts): テスト目的で、ノイズ音声データを生成します。
-   `generateSquareWave()` (src/__tests__/algorithms.test.ts): テスト目的で、矩形波の音声データを生成します。
-   `countZeroCrossings()` (src/__tests__/algorithms.test.ts): 与えられた波形データ中のゼロクロス数をカウントします。
-   `createMediaStreamSource()` (src/__tests__/algorithms.test.ts, src/__tests__/dom-integration.test.ts, src/__tests__/oscilloscope.test.ts): テスト用にMediaStreamSourceノードのモックを作成します。
-   `createAnalyser()` (src/__tests__/algorithms.test.ts, src/__tests__/dom-integration.test.ts, src/__tests__/oscilloscope.test.ts): テスト用にAnalyserNodeのモックを作成します。
-   `close()` (src/__tests__/algorithms.test.ts, src/__tests__/dom-integration.test.ts, src/__tests__/oscilloscope.test.ts): テスト用にMediaStreamやAudioContextのクローズ処理をシミュレートします。
-   `getTracks()` (src/__tests__/algorithms.test.ts, src/__tests__/dom-integration.test.ts, src/__tests__/oscilloscope.test.ts): テスト用にMediaStreamTrackのリストを返します。
-   `createSilentMockAudioContext()` (src/__tests__/oscilloscope.test.ts): テスト用にサイレントなモックのAudioContextを作成します。
-   `getFFTOverlayDimensions()` (src/__tests__/oscilloscope.test.ts): FFTオーバーレイの描画に関する寸法情報を取得します。
-   `findFFTOverlayBorderCall()` (src/__tests__/oscilloscope.test.ts): FFTオーバーレイの描画境界を見つけるためのテストユーティリティです。
-   `getAudioTracks()` (src/__tests__/oscilloscope.test.ts): テスト用に音声トラックのリストを返します。
-   `getVideoTracks()` (src/__tests__/oscilloscope.test.ts): テスト用にビデオトラックのリストを返します。
-   `stop()` (src/__tests__/oscilloscope.test.ts): テスト用にストリームの停止をシミュレートします。
-   `sliderValueToThreshold()` (src/main.ts): UIのスライダー値に基づいて、ゼロクロス検出の閾値を計算します。
-   `formatThresholdDisplay()` (src/main.ts): 閾値の表示を整形します。
-   `startFrequencyDisplay()` (src/main.ts): 周波数表示の更新を開始します。
-   `stopFrequencyDisplay()` (src/main.ts): 周波数表示の更新を停止します。
-   `createAudioBuffer()` (src/__tests__/utils.test.ts): テスト用にAudioBufferを作成します。
-   `dbToAmplitude()` (src/utils.ts): デシベル値を振幅値に変換するユーティリティ関数です。
-   `trimSilence()` (src/utils.ts): 音声データの先頭と末尾の無音部分をトリムするユーティリティ関数です。

## 関数呼び出し階層ツリー
```
- start (src/AudioManager.ts)
  - startFromFile ()
    - stop ()
    - createMediaStreamSource ()
    - createAnalyser ()
    - close ()
    - getTracks ()
    - trimSilence (src/utils.ts)
- dbToAmplitude (src/utils.ts)
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
- createAudioBuffer (src/__tests__/utils.test.ts)

---
Generated at: 2026-01-04 07:08:43 JST
