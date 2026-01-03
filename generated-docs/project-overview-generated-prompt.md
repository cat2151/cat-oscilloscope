Last updated: 2026-01-04


# プロジェクト概要生成プロンプト（来訪者向け）

## 生成するもの：
- projectを3行で要約する
- プロジェクトで使用されている技術スタックをカテゴリ別に整理して説明する
- プロジェクト全体のファイル階層ツリー（ディレクトリ構造を図解）
- プロジェクト全体のファイルそれぞれの説明
- プロジェクト全体の関数それぞれの説明
- プロジェクト全体の関数の呼び出し階層ツリー

## 生成しないもの：
- Issues情報（開発者向け情報のため）
- 次の一手候補（開発者向け情報のため）
- ハルシネーションしそうなもの（例、存在しない機能や計画を勝手に妄想する等）

## 出力フォーマット：
以下のMarkdown形式で出力してください：

```markdown
# Project Overview

## プロジェクト概要
[以下の形式で3行でプロジェクトを要約]
- [1行目の説明]
- [2行目の説明]
- [3行目の説明]

## 技術スタック
[使用している技術をカテゴリ別に整理して説明]
- フロントエンド: [フロントエンド技術とその説明]
- 音楽・オーディオ: [音楽・オーディオ関連技術とその説明]
- 開発ツール: [開発支援ツールとその説明]
- テスト: [テスト関連技術とその説明]
- ビルドツール: [ビルド・パース関連技術とその説明]
- 言語機能: [言語仕様・機能とその説明]
- 自動化・CI/CD: [自動化・継続的統合関連技術とその説明]
- 開発標準: [コード品質・統一ルール関連技術とその説明]

## ファイル階層ツリー
```
[プロジェクトのディレクトリ構造をツリー形式で表現]
```

## ファイル詳細説明
[各ファイルの役割と機能を詳細に説明]

## 関数詳細説明
[各関数の役割、引数、戻り値、機能を詳細に説明]

## 関数呼び出し階層ツリー
```
[関数間の呼び出し関係をツリー形式で表現]
```
```


以下のプロジェクト情報を参考にして要約を生成してください：

## プロジェクト情報
名前: cat-oscilloscope
説明: # cat-oscilloscope

ブラウザで動く、オシロスコープ風の波形ビジュアライザー

## 🌐 ライブデモ

**[https://cat2151.github.io/cat-oscilloscope/](https://cat2151.github.io/cat-oscilloscope/)**

上記のURLでアプリケーションを試すことができます。マイクへのアクセス許可が必要です。

※このドキュメントは仮のため大部分がLLMによって生成されました。今後修正していきます

## メモ

- 周波数推定
  - FFTが正確なときと、FFT以外が正確なとき、それぞれがあります。
  - デフォルトをFFTにするかは検討中です。
  - より改善された周波数推定の検討については後回しです。他の多数の優先タスクを優先します。

## 機能

- 🎤 **マイク入力** - マイクからの音声をリアルタイムでキャプチャ
- 🎯 **ゼロクロス検出** - 音声がマイナスからプラスに交差するポイントを自動検出
- 📊 **安定した表示** - ゼロクロスポイントに基づいて波形表示を整列し、安定した表示を実現
- 🔊 **オートゲイン** - 波形の振幅を自動調整し、キャンバスの高さを最適に活用
- ⚡ **リアルタイムレンダリング** - 波形の可視化を継続的に更新
- 🎨 **クラシックなデザイン** - 黒背景にグリーンの波形とグリッドオーバーレイ
- 🛡️ **エラーハンドリング** - マイクのアクセス許可の問題を適切に処理

## はじめに

### 必要条件

- Node.js（v16以上を推奨）
- npm または yarn

### インストール

```bash
npm install
```

### 開発

開発サーバーを起動：

```bash
npm run dev
```

ブラウザで `http://localhost:3000/` を開いてください。

### ビルド

本番用にビルド：

```bash
npm run build
```

ビルドされたファイルは `dist` ディレクトリに出力されます。

### 本番ビルドのプレビュー

```bash
npm run preview
```

### テスト

テストを実行：

```bash
npm test
```

カバレッジレポートを生成：

```bash
npm run test:coverage
```

テストUIを起動：

```bash
npm run test:ui
```

詳細は [TESTING.md](TESTING.md) を参照してください。

## 仕組み

### ゼロクロス検出アルゴリズム

このオシロスコープは、以下のようなゼロクロス検出アルゴリズムを実装しています：

1. 音声バッファをスキャンし、波形がマイナス（またはゼロ）からプラスに交差するポイントを検出
2. 最初のゼロクロスポイントを特定
3. 次のゼロクロスポイントを見つけて、1つの完全な波形サイクルを決定
4. ゼロクロスポイントの前後にわずかなパディングを付けて波形を表示

これにより、安定した非スクロール表示が実現されます。

### 技術的詳細

- **FFTサイズ**: 高解像度のため4096サンプル
- **スムージング**: 正確な波形表現のため無効（0）
- **表示パディング**: ゼロクロスポイントの前後に20サンプル
- **オートゲイン**: 
  - キャンバスの高さの80%を目標に自動調整
  - ピーク追跡による滑らかな遷移（減衰率: 0.95）
  - ゲイン範囲: 0.5倍〜99倍
  - 補間係数: 0.1（段階的な調整）
  - UIチェックボックスで有効/無効を切り替え可能（デフォルト: 有効）
- **キャンバス解像度**: 800x400ピクセル
- **リフレッシュレート**: ブラウザのrequestAnimationFrameに同期（約60 FPS）

## 技術スタック

- **TypeScript** - 型安全なJavaScript
- **Vite** - 高速なビルドツールと開発サーバー
- **Web Audio API** - 音声のキャプチャと分析
- **HTML Canvas** - 2D波形レンダリング

## ブラウザ要件

このアプリケーションには以下が必要です：
- Web Audio APIをサポートするモダンブラウザ（Chrome、Firefox、Safari、Edge）
- ユーザーによるマイクのアクセス許可
- HTTPSまたはlocalhost（マイクアクセスに必要）

## ライセンス

MITライセンス - 詳細は [LICENSE](LICENSE) ファイルを参照してください

*Big Brother is listening to you. Now the cat does.* 🐱


依存関係:
{
  "dependencies": {},
  "devDependencies": {
    "@vitest/ui": "^4.0.16",
    "happy-dom": "^20.0.11",
    "typescript": "^5.3.3",
    "vite": "^6.0.0",
    "vitest": "^4.0.16"
  }
}

## ファイル階層ツリー
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

## ファイル詳細分析
**index.html** (171行, 5272バイト)
  - 関数: なし
  - インポート: なし

**src/AudioManager.ts** (191行, 5353バイト)
  - 関数: if, catch, start, startFromFile, stop
  - インポート: ./utils

**src/FrequencyEstimator.ts** (233行, 7853バイト)
  - 関数: for, if, switch
  - インポート: なし

**src/GainController.ts** (163行, 5628バイト)
  - 関数: if, for
  - インポート: ./utils

**src/Oscilloscope.ts** (202行, 6555バイト)
  - 関数: constructor, catch, if, start, startFromFile, stop
  - インポート: ./AudioManager, ./GainController, ./FrequencyEstimator

**src/WaveformRenderer.ts** (314行, 10046バイト)
  - 関数: constructor, if, for
  - インポート: なし

**src/ZeroCrossDetector.ts** (353行, 11117バイト)
  - 関数: for, if
  - インポート: なし

**src/__tests__/algorithms.test.ts** (462行, 15725バイト)
  - 関数: generateSineWave, generateNoise, generateSquareWave, countZeroCrossings, createMediaStreamSource, createAnalyser, close, getTracks, for, if
  - インポート: vitest, ../Oscilloscope, ../ZeroCrossDetector

**src/__tests__/dom-integration.test.ts** (281行, 8859バイト)
  - 関数: createMediaStreamSource, createAnalyser, for, close, getTracks
  - インポート: vitest, ../utils

**src/__tests__/oscilloscope.test.ts** (605行, 21336バイト)
  - 関数: createSilentMockAudioContext, getFFTOverlayDimensions, findFFTOverlayBorderCall, createMediaStreamSource, createAnalyser, for, close, getTracks, getAudioTracks, getVideoTracks, stop, if, defineProperty, function
  - インポート: vitest, ../Oscilloscope, ../utils

**src/__tests__/utils.test.ts** (245行, 8143バイト)
  - 関数: createAudioBuffer, constructor, for, if
  - インポート: vitest, ../utils

**src/main.ts** (205行, 7458バイト)
  - 関数: sliderValueToThreshold, formatThresholdDisplay, startFrequencyDisplay, stopFrequencyDisplay, for, if, catch
  - インポート: ./Oscilloscope, ./utils

**src/utils.ts** (116行, 3499バイト)
  - 関数: dbToAmplitude, trimSilence, for, if
  - インポート: なし

**vite.config.ts** (17行, 283バイト)
  - 関数: なし
  - インポート: vite

## 関数呼び出し階層
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
      - defineProperty ()
      - function ()
  - sliderValueToThreshold (src/main.ts)
    - formatThresholdDisplay ()
      - startFrequencyDisplay ()
      - stopFrequencyDisplay ()
- catch (src/AudioManager.ts)
- for (src/FrequencyEstimator.ts)
- switch (src/FrequencyEstimator.ts)
- createAudioBuffer (src/__tests__/utils.test.ts)


## プロジェクト構造（ファイル一覧）
README.ja.md
README.md
TESTING.md
index.html
issue-notes/57.md
issue-notes/59.md
package-lock.json
package.json
src/AudioManager.ts
src/FrequencyEstimator.ts
src/GainController.ts
src/Oscilloscope.ts
src/WaveformRenderer.ts
src/ZeroCrossDetector.ts
src/__tests__/algorithms.test.ts
src/__tests__/dom-integration.test.ts
src/__tests__/oscilloscope.test.ts
src/__tests__/utils.test.ts
src/main.ts
src/utils.ts
tsconfig.json
vite.config.ts

上記の情報を基に、プロンプトで指定された形式でプロジェクト概要を生成してください。
特に以下の点を重視してください：
- 技術スタックは各カテゴリごとに整理して説明
- ファイル階層ツリーは提供された構造をそのまま使用
- ファイルの説明は各ファイルの実際の内容と機能に基づく
- 関数の説明は実際に検出された関数の役割に基づく
- 関数呼び出し階層は実際の呼び出し関係に基づく


---
Generated at: 2026-01-04 07:08:12 JST
