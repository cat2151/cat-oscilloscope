Last updated: 2026-01-03

# Project Overview

## プロジェクト概要
- このプロジェクトは、ブラウザ上で動作するオシロスコープ風のリアルタイム波形ビジュアライザーです。
- マイクからの音声入力を取得し、ゼロクロス検出とオートゲイン機能により安定した波形表示を実現します。
- Web Audio APIとHTML Canvasを活用し、クラシックなデザインで音声を視覚的に楽しむことができます。

## 技術スタック
- フロントエンド: HTML Canvas: 2DグラフィックスAPIで、リアルタイムな波形レンダリングに使用されます。
- 音楽・オーディオ: Web Audio API: 音声の入力、処理、分析、出力を行うためのブラウザベースのAPIです。マイク入力のキャプチャと波形分析に利用されます。
- 開発ツール:
    - Vite: 高速な開発サーバーとモダンなフロントエンドのビルドを可能にするツールです。
    - Node.js: JavaScriptのランタイム環境で、開発ツールの実行基盤となります。
    - npm/yarn: JavaScriptプロジェクトのパッケージ管理ツールです。
- テスト:
    - Vitest: 高速なユニットテストフレームワークで、アプリケーションのロジックやコンポーネントのテストに使用されます。
    - @vitest/ui: Vitestのテスト結果をブラウザで視覚的に確認するためのUIです。
    - happy-dom: DOM環境をNode.jsでシミュレートするためのツールで、DOM操作を含むテストの実行を可能にします。
- ビルドツール: Vite: (開発ツールとしても機能しますが、) プロジェクトを本番環境向けに最適化してビルドするために使用されます。
- 言語機能: TypeScript: JavaScriptに静的型付けを追加したプログラミング言語で、大規模なアプリケーション開発におけるコードの品質と保守性を向上させます。

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
- **index.html**: このアプリケーションのエントリポイントとなるHTMLファイルです。ユーザーインターフェースの基盤を定義し、JavaScriptのエントリポイントを読み込みます。
- **src/AudioManager.ts**: Web Audio APIを利用して、マイクからの音声入力やファイルからの音声データを管理します。音声ストリームの開始・停止、分析ノードへの接続を制御します。
- **src/FrequencyEstimator.ts**: 入力された音声データから周波数を推定するアルゴリズム（例: FFT）を実装しています。音の高さに関する情報を提供します。
- **src/GainController.ts**: 波形の振幅を自動的に調整（オートゲイン）するロジックを管理します。これにより、波形がキャンバスの表示領域に最適にフィットするように調整されます。
- **src/Oscilloscope.ts**: オシロスコープアプリケーションの主要なロジックを統合するクラスです。`AudioManager`、`GainController`、`FrequencyEstimator`、`WaveformRenderer`を連携させ、音声処理から描画までの一連の動作を統括します。
- **src/WaveformRenderer.ts**: HTML Canvasを使用して、処理された波形データを視覚的に描画します。グリッドの描画、波形の色や太さの管理、リアルタイムでの描画更新を担当します。
- **src/ZeroCrossDetector.ts**: 波形がゼロ点（マイナスからプラス、またはその逆）を通過するポイントを検出するアルゴリズムを実装しています。これにより、波形を安定して表示し、スクロールしない視覚化を実現します。
- **src/__tests__/algorithms.test.ts**: 主要なアルゴリズム（例: ゼロクロス検出、周波数推定）の正確性を検証するためのテストスイートです。
- **src/__tests__/dom-integration.test.ts**: アプリケーションがブラウザのDOM（Document Object Model）とどのように連携するか、またUI要素が正しく動作するかを検証するテストです。
- **src/__tests__/oscilloscope.test.ts**: `Oscilloscope`クラス全体の振る舞いと、その構成要素が連携して期待通りに機能するかを検証する統合テストスイートです。
- **src/__tests__/utils.test.ts**: `src/utils.ts`に定義されている汎用ユーティリティ関数の単体テストです。
- **src/main.ts**: アプリケーションの初期設定、主要なイベントリスナーの登録、そして`Oscilloscope`インスタンスの生成と制御を行うエントリポイントファイルです。UI要素とアプリケーションロジックの連携を担当します。
- **src/utils.ts**: アプリケーション全体で再利用される汎用的なヘルパー関数（例: デシベル値と振幅の変換、無音部分のトリミングなど）を提供します。
- **vite.config.ts**: Viteビルドツールと開発サーバーの設定ファイルです。ビルドオプション、プラグイン、開発サーバーの振る舞いなどが定義されます。
- **.gitignore**: Gitがバージョン管理の対象としないファイルやディレクトリを指定します。
- **LICENSE**: プロジェクトの配布条件を定めるMITライセンス情報が記載されています。
- **README.ja.md**: プロジェクトの日本語による説明ドキュメントです。
- **README.md**: プロジェクトの英語による説明ドキュメントです。
- **TESTING.md**: プロジェクトのテスト方法、テスト戦略、およびテスト関連の詳細情報が記述されています。
- **_config.yml**: GitHub Pagesなどの静的サイトジェネレータの設定ファイルです。
- **generated-docs/**: 自動生成されたドキュメントやレポートを格納するためのディレクトリです。
- **issue-notes/57.md**: 特定の課題（Issue #57）に関するメモや詳細情報が記述されています。
- **package-lock.json**: `package.json`にリストされた依存関係の厳密なバージョンとその依存ツリーを記録します。
- **package.json**: プロジェクトのメタデータ、スクリプト、および開発・実行時の依存関係が定義されています。
- **tsconfig.json**: TypeScriptコンパイラの設定ファイルで、TypeScriptのコンパイルオプションが指定されています。

## 関数詳細説明
- **`start()` (src/AudioManager.ts)**: マイクからの音声入力ストリームを開始し、Web Audio APIを通じて音声分析グラフに接続します。
- **`startFromFile()` (src/AudioManager.ts)**: (プロジェクト情報には記載なし) ファイルから音声データを読み込み、その処理を開始します。
- **`stop()` (src/AudioManager.ts)**: 現在アクティブな音声ストリームのキャプチャを停止し、関連するWeb Audio APIリソースを解放します。
- **`sliderValueToThreshold()` (src/main.ts)**: UIのスライダーで設定された値に基づいて、波形分析（例: ゼロクロス検出）に使用される閾値を計算します。
- **`formatThresholdDisplay()` (src/main.ts)**: 計算された閾値を、ユーザーインターフェースで表示するために適切な形式に整形します。
- **`startFrequencyDisplay()` (src/main.ts)**: 周波数表示の更新処理を開始します。
- **`stopFrequencyDisplay()` (src/main.ts)**: 周波数表示の更新処理を停止します。
- **`dbToAmplitude()` (src/utils.ts)**: デシベル（dB）単位の値を、線形スケールの振幅値に変換するユーティリティ関数です。
- **`trimSilence()` (src/utils.ts)**: 音声データバッファの先頭および末尾にある無音部分を検出し、削除することで有効な音声データのみを残します。

## 関数呼び出し階層ツリー
```
- start (src/AudioManager.ts)
  - startFromFile ()
    - stop ()
    - trimSilence (src/utils.ts)
- dbToAmplitude (src/utils.ts)
- sliderValueToThreshold (src/main.ts)
  - formatThresholdDisplay ()
  - startFrequencyDisplay ()
  - stopFrequencyDisplay ()

---
Generated at: 2026-01-03 07:09:13 JST
