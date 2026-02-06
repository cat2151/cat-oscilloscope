Last updated: 2026-02-07


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

<p align="left">
  <a href="README.ja.md"><img src="https://img.shields.io/badge/🇯🇵-Japanese-red.svg" alt="Japanese"></a>
  <a href="README.md"><img src="https://img.shields.io/badge/🇺🇸-English-blue.svg" alt="English"></a>
  <a href="https://deepwiki.com/cat2151/cat-oscilloscope"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki"></a>
  <a href="https://cat2151.github.io/cat-oscilloscope/"><img src="https://img.shields.io/badge/🌐-Live_Demo-green.svg" alt="Live Demo"></a>
</p>

ブラウザで動く、オシロスコープ風の波形ビジュアライザー

## 状況
- このドキュメントはまだAI生成の文章があり読みづらいです。今後文章を人間の手で読みやすく改善する予定です

## 🌐 ライブデモ

**フルバージョン**: [https://cat2151.github.io/cat-oscilloscope/](https://cat2151.github.io/cat-oscilloscope/)  
**簡易デモ（ライブラリ利用例）**: [https://cat2151.github.io/cat-oscilloscope/demo-simple.html](https://cat2151.github.io/cat-oscilloscope/demo-simple.html)

上記のURLでアプリケーションを試すことができます。フルバージョンではマイクへのアクセス許可が必要です。簡易デモはBufferSourceを使った最小限の実装例で、CDN経由でのライブラリ利用方法を示しています。

## 実装状況

### ✅ 完了済みの主要実装

- **Rust/WASM統合**: すべてのデータ処理アルゴリズムがRust/WASMで実装され、高速で型安全な処理を実現
- **ライブラリ対応**: npmライブラリとして他のプロジェクトから利用可能（ESM/CJS両対応、完全な型定義サポート）
- **5つの周波数推定方式**: Zero-Crossing、Autocorrelation、FFT、STFT、CQTをサポート
- **バッファサイズマルチプライヤー**: 低周波検出精度を向上させる拡張バッファ機能（1x/4x/16x）
- **波形比較パネル**: 前回と今回の波形の類似度をリアルタイム表示
- **ピアノ鍵盤表示**: 検出した周波数を視覚的に表示

### 現在の安定性

- ✅ 大きなバグは解決済み
- ✅ WAVファイルからのオーディオ再生時は高い実用性
- ⚠️ マイク入力は環境音の影響を受けるため、静かな環境での使用を推奨

## 📚 ライブラリとしての使用

cat-oscilloscopeは、あなた自身のプロジェクトでnpmライブラリとして使用できます。詳細な手順は [LIBRARY_USAGE.md](./LIBRARY_USAGE.md) をご覧ください。

⚠️ **重要**: npmやGitHubからインストールする場合、WASMファイルの手動セットアップが必要です。詳細は [LIBRARY_USAGE.md](./LIBRARY_USAGE.md) の「WASMファイルのセットアップ」セクションをご覧ください。

```typescript
import { Oscilloscope, BufferSource } from 'cat-oscilloscope';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const oscilloscope = new Oscilloscope(canvas);

// マイク入力から可視化
await oscilloscope.start();

// 静的バッファから可視化（オーディオ再生なし）
const audioData = new Float32Array(44100); // 1秒分のデータ
const bufferSource = new BufferSource(audioData, 44100, { loop: true });
await oscilloscope.startFromBuffer(bufferSource);
```

**BufferSource機能**: wavlpfなどの音声処理ライブラリとの統合に最適な、静的バッファからの可視化機能を提供します。

**表示制御**: オーバーレイ（FFTスペクトラム、倍音分析、周波数推移プロット）の表示/非表示は`setDebugOverlaysEnabled()`で制御できます。また、`setOverlaysLayout()`でレイアウトをカスタマイズできます。詳細は [LIBRARY_USAGE.md](./LIBRARY_USAGE.md) の「デバッグオーバーレイ表示の制御」と「オーバーレイのレイアウトカスタマイズ」をご覧ください。


## 機能

### 周波数推定

cat-oscilloscopeは、5つの周波数推定アルゴリズムをサポートしています：

1. **Zero-Crossing（ゼロクロス法）**: シンプルで高速。単純な波形に適しています。
2. **Autocorrelation（自己相関法）**: 複雑な波形に対してバランスの良い精度。
3. **FFT（高速フーリエ変換）**: デフォルト。周波数スペクトラム解析。高周波に強い。
4. **STFT（短時間フーリエ変換）**: 可変窓長により、低周波の検出精度が向上。
5. **CQT（定Q変換）**: 低周波域で高い周波数分解能を持つ。音楽分析に適しています。

### バッファサイズマルチプライヤー

低周波の検出精度を向上させるため、過去のフレームバッファを利用した拡張バッファをサポート：

- **1x (Standard)**: 標準バッファサイズ（約1/60秒）
- **4x (Better Low Freq)**: 4倍の拡張バッファで低周波の検出精度向上
- **16x (Best Low Freq)**: 16倍の拡張バッファで最高の低周波検出精度

**使用例**: 20-50Hzの低周波を検出する場合、STFT または CQT を選択し、Buffer Size を 16x に設定すると最適です。

**重要な注意事項:**
- バッファサイズを変更すると、履歴が蓄積されるまで（最大16フレーム）、新しいバッファサイズが有効になりません
- 大きなバッファサイズ（16x）では、初回の周波数検出に約0.3秒かかります

### 検出可能な周波数範囲

バッファサイズによって、検出可能な最低周波数が異なります：

- **1x (4096サンプル @ 48kHz)**: 約80Hz以上（標準使用）
- **4x (16384サンプル)**: 約30Hz以上（低周波向上）
- **16x (65536サンプル)**: 約20Hz以上（最良の低周波検出）

## メモ

- 周波数推定
  - FFTが正確なときと、FFT以外が正確なとき、それぞれがあります。
  - STFTとCQTは特に低周波（20-100Hz）の検出に優れています。
  - バッファサイズマルチプライヤーを大きくすると、低周波の精度が向上しますが、レスポンスが若干遅くなります。
  - **パフォーマンス**: 16xバッファサイズでは、STFT/CQTの計算に時間がかかる場合があります（教育目的の実装のため）。

- オフセット%オーバーレイ（Offset %）- Issue #254調査中
  - 「今回の波形」パネルの右上に表示される、位相マーカーの4周期座標系内での位置を示すグラフ
  - **重要：座標系の理解**
    - **4周期座標系**: 表示される4周期分の波形内での相対位置（0-100%）← これが重要
    - **全フレーム座標系**: サンプルバッファ全体での絶対位置 ← 今回の調査対象外
  - **用語説明**:
    - **start offset**: 位相0マーカー（開始位置）が4周期座標系内のどこにあるか（0-100%）
    - **end offset**: 位相2πマーカー（終了位置）が4周期座標系内のどこにあるか（0-100%）
    - **offsetChange**: 前フレームからのオフセット変化量（仕様：1%以内）
  - **表示内容**: 
    - 赤線（S）: start offset（4周期座標系での位相0の位置、0-100%）
    - オレンジ線（E）: end offset（4周期座標系での位相2πの位置、0-100%）
  - **仕様違反検出**: 
    - 4周期座標系において、フレーム間で1%を超える変化を検出すると警告を出力
    - 診断情報には以下が含まれます：
      - start/end offsetの現在値と前フレーム値（4周期座標系内での位置%）
      - offsetChange（変化量、仕様では1%以内）
      - SPEC_VIOLATION フラグ
  - **目的**: 4周期座標系において、オフセットが仕様（1%以内）を遵守しているか検証

## データ処理の実装について

すべてのデータ処理（波形探索、周波数推定、ゼロクロス検出など）は**Rust/WASMで実装**されています。

- **高速な処理性能**: Rustの最適化により効率的な実行
- **型安全で信頼性の高い実装**: Rustの厳格な型システムによる安全性
- **単一実装**: アルゴリズムはWASMのみで実装され、TypeScriptとの二重管理を解消
- **TypeScriptの役割**: 設定管理とレンダリングのみを担当

### WASM実装のビルド

WASM実装は `signal-processor-wasm` ディレクトリにあります。

```bash
# WASM実装のビルド（wasm-packが必要）
npm run build:wasm

# アプリ全体のビルド（WASMも含む）
npm run build
```

**必要なツール**:
- Rust toolchain (rustc, cargo)
- wasm-pack (`cargo install wasm-pack`)

**注意**: 通常の使用では、事前ビルド済みのWASMファイルが `public/wasm/` に含まれているため、Rustツールチェーンは不要です。

## 主な機能

- 🎤 **マイク入力** - マイクからの音声をリアルタイムでキャプチャ
- 📂 **オーディオファイル** - WAVファイルのループ再生に対応
- 📊 **周波数推定** - ゼロクロス、自己相関、FFT、STFT、CQTの5つの方式
- 🎹 **ピアノ鍵盤表示** - 検出した周波数を鍵盤上に表示
- 🎚️ **自動ゲイン** - 波形の振幅を自動調整
- 🔇 **ノイズゲート** - 閾値以下の信号をカット
- 📈 **FFTスペクトラム** - 周波数スペクトラムをオーバーレイ表示
- 🔍 **波形比較パネル** - 前回と今回の波形の類似度を表示
- ⏸️ **描画の一時停止** - 波形を静止して観察可能

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

- **Rust/WebAssembly** - 高速で型安全なデータ処理アルゴリズム
- **TypeScript** - 型安全なJavaScript（設定管理とレンダリング）
- **Vite** - 高速なビルドツールと開発サーバー
- **Web Audio API** - 音声のキャプチャと分析
- **HTML Canvas** - 2D波形レンダリング

## ブラウザ要件

このアプリケーションには以下が必要です：
- Web Audio APIをサポートするモダンブラウザ（Chrome、Firefox、Safari、Edge）
- ユーザーによるマイクのアクセス許可
- HTTPSまたはlocalhost（マイクアクセスに必要）

## マイク入力時の制約

マイクからの入力を使用する場合、以下の制約があります：

### 環境音の影響

マイクは周囲のすべての音を拾うため、以下のような環境音が波形に影響を与えます：

- **マウスクリック音**: マウスをクリックする際の機械的な音が波形に現れます。特に一時停止ボタンをマウスでクリックした瞬間、波形が乱れて見えることがあります。
- **キーボード打鍵音**: キーボードのタイプ音も波形に影響します。ただし、静音性の高いキーボードを使用している場合は、影響が少なくなります。
- **その他の環境音**: 話し声、室内の空調音、外部からの騒音なども波形に現れます。

### 実用上のヒント

- **一時停止の方法**: マウスクリックの代わりに、静音性の高いキーボードのスペースキーを使用することで、一時停止時の波形への影響を最小限に抑えることができます。
- **音源の選択**: マイク入力は環境音の影響を受けやすいため、ノイズのない波形を観察したい場合は、WAVファイルなどのオーディオファイルを使用することをお勧めします。
- **測定環境**: できるだけ静かな環境で使用することで、より正確な波形を観察できます。

これらはアプリケーションの制限ではなく、マイクというデバイスの特性によるものです。

## 開発・保守

### コード品質の自動チェック

このプロジェクトでは、コード品質を維持するために以下の自動チェックが実行されます：

- **大きなファイルの検出**: 日次バッチでソースファイルの行数をチェックし、500行を超えるファイルがあればissueを自動起票します
  - 設定ファイル: `.github/check-large-files.toml`
  - 実行スクリプト: `.github/scripts/check_large_files.py`
  - ワークフロー: `.github/workflows/check-large-files.yml`
  - 日本時間 毎日09:00に自動実行 (手動実行も可能)

この仕組みにより、ファイルが大きくなりすぎる前に早期発見し、適切なタイミングでリファクタリングを検討できます。

## ライセンス

MITライセンス - 詳細は [LICENSE](LICENSE) ファイルを参照してください

*Big Brother is listening to you. Now it’s the cat.* 🐱


依存関係:
{
  "dependencies": {},
  "devDependencies": {
    "@vitest/ui": "^4.0.16",
    "cross-env": "^10.1.0",
    "happy-dom": "^20.0.11",
    "typescript": "^5.3.3",
    "vite": "^6.0.0",
    "vite-plugin-dts": "^4.5.4",
    "vitest": "^4.0.16"
  }
}

## ファイル階層ツリー
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
  📄 AudioManager.d.ts.map
  📘 BasePathResolver.d.ts
  📄 BasePathResolver.d.ts.map
  📘 BufferSource.d.ts
  📄 BufferSource.d.ts.map
  📘 ComparisonPanelRenderer.d.ts
  📄 ComparisonPanelRenderer.d.ts.map
  📘 CycleSimilarityRenderer.d.ts
  📄 CycleSimilarityRenderer.d.ts.map
  📘 DOMElementManager.d.ts
  📄 DOMElementManager.d.ts.map
  📘 DisplayUpdater.d.ts
  📄 DisplayUpdater.d.ts.map
  📘 FrameBufferHistory.d.ts
  📄 FrameBufferHistory.d.ts.map
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
  📘 UIEventHandlers.d.ts
  📄 UIEventHandlers.d.ts.map
  📘 WasmModuleLoader.d.ts
  📄 WasmModuleLoader.d.ts.map
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
    📜 demo-DsYptmO3.js
    📄 demo-DsYptmO3.js.map
    📜 main-DUIA4vI1.js
    📄 main-DUIA4vI1.js.map
    📜 modulepreload-polyfill-B5Qt9EMX.js
    📄 modulepreload-polyfill-B5Qt9EMX.js.map
  📄 cat-oscilloscope.cjs
  📄 cat-oscilloscope.cjs.map
  📄 cat-oscilloscope.mjs
  📄 cat-oscilloscope.mjs.map
  📁 comparison-renderers/
    📘 OffsetOverlayRenderer.d.ts
    📄 OffsetOverlayRenderer.d.ts.map
    📘 PositionMarkerRenderer.d.ts
    📄 PositionMarkerRenderer.d.ts.map
    📘 SimilarityPlotRenderer.d.ts
    📄 SimilarityPlotRenderer.d.ts.map
    📘 WaveformPanelRenderer.d.ts
    📄 WaveformPanelRenderer.d.ts.map
    📘 index.d.ts
    📄 index.d.ts.map
  🌐 demo-simple.html
  📘 index.d.ts
  📄 index.d.ts.map
  🌐 index.html
  📁 renderers/
    📘 BaseOverlayRenderer.d.ts
    📄 BaseOverlayRenderer.d.ts.map
    📘 FFTOverlayRenderer.d.ts
    📄 FFTOverlayRenderer.d.ts.map
    📘 FrequencyPlotRenderer.d.ts
    📄 FrequencyPlotRenderer.d.ts.map
    📘 GridRenderer.d.ts
    📄 GridRenderer.d.ts.map
    📘 HarmonicAnalysisRenderer.d.ts
    📄 HarmonicAnalysisRenderer.d.ts.map
    📘 PhaseMarkerRenderer.d.ts
    📄 PhaseMarkerRenderer.d.ts.map
    📘 WaveformLineRenderer.d.ts
    📄 WaveformLineRenderer.d.ts.map
    📘 index.d.ts
    📄 index.d.ts.map
  📘 utils.d.ts
  📄 utils.d.ts.map
  📁 wasm/
    📊 package.json
    📘 signal_processor_wasm.d.ts
    📜 signal_processor_wasm.js
    📄 signal_processor_wasm_bg.wasm
    📘 signal_processor_wasm_bg.wasm.d.ts
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
  📖 207.md
  📖 209.md
  📖 210.md
  📖 212.md
  📖 214.md
  📖 216.md
  📖 217.md
  📖 220-fix-summary.md
  📖 220.md
  📖 222.md
  📖 224.md
  📖 226.md
  📖 228.md
  📖 230.md
  📖 232.md
  📖 234.md
  📖 236.md
  📖 238.md
  📖 241.md
  📖 243.md
  📖 245.md
  📖 247.md
  📖 249.md
  📖 251.md
  📖 252.md
  📖 253.md
  📖 254-diagnostic-plan.md
  📖 254.md
  📖 255.md
  📖 257.md
  📖 265.md
  📖 267.md
  📖 269.md
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
    📁 frequency_estimation/
      📄 autocorrelation.rs
      📄 cqt.rs
      📄 dsp_utils.rs
      📄 fft.rs
      📄 harmonic_analysis.rs
      📄 mod.rs
      📄 smoothing.rs
      📄 stft.rs
      📄 tests.rs
      📄 zero_crossing.rs
    📄 gain_controller.rs
    📄 lib.rs
    📄 waveform_render_data.rs
    📄 waveform_searcher.rs
    📁 zero_cross_detector/
      📄 detection_modes.rs
      📄 mod.rs
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
  📄 wavlpf-broken-layout.png
📖 test-segment-relative.md
📊 tsconfig.json
📊 tsconfig.lib.json
📘 vite.config.ts

## ファイル詳細分析
**demo-simple.html** (269行, 7138バイト)
  - 関数: なし
  - インポート: なし

**demo-simple.js** (165行, 4880バイト)
  - 関数: startUpdates, stopUpdates, generateWaveform, startOscilloscope, if, switch, for, catch
  - インポート: /src/index.ts, https://cdn.jsdelivr.net/gh/cat2151/cat-oscilloscope@main/dist/cat-oscilloscope.mjs

**dist/AudioManager.d.ts** (75行, 2146バイト)
  - 関数: なし
  - インポート: ./BufferSource

**dist/BasePathResolver.d.ts** (27行, 1073バイト)
  - 関数: なし
  - インポート: なし

**dist/BufferSource.d.ts** (79行, 2128バイト)
  - 関数: なし
  - インポート: なし

**dist/ComparisonPanelRenderer.d.ts** (45行, 2336バイト)
  - 関数: なし
  - インポート: なし

**dist/CycleSimilarityRenderer.d.ts** (51行, 1765バイト)
  - 関数: なし
  - インポート: なし

**dist/DOMElementManager.d.ts** (49行, 2088バイト)
  - 関数: なし
  - インポート: なし

**dist/DisplayUpdater.d.ts** (48行, 1402バイト)
  - 関数: なし
  - インポート: ./Oscilloscope, ./PianoKeyboardRenderer

**dist/FrameBufferHistory.d.ts** (30行, 1143バイト)
  - 関数: なし
  - インポート: なし

**dist/FrequencyEstimator.d.ts** (33行, 1239バイト)
  - 関数: なし
  - インポート: なし

**dist/GainController.d.ts** (26行, 868バイト)
  - 関数: なし
  - インポート: なし

**dist/Oscilloscope.d.ts** (138行, 6978バイト)
  - 関数: なし
  - インポート: ./BufferSource, ./OverlayLayout

**dist/OverlayLayout.d.ts** (53行, 1668バイト)
  - 関数: resolveValue
  - インポート: なし

**dist/PianoKeyboardRenderer.d.ts** (54行, 1493バイト)
  - 関数: なし
  - インポート: なし

**dist/UIEventHandlers.d.ts** (65行, 1777バイト)
  - 関数: なし
  - インポート: ./Oscilloscope, ./DOMElementManager, ./DisplayUpdater

**dist/WasmModuleLoader.d.ts** (38行, 1458バイト)
  - 関数: なし
  - インポート: なし

**dist/WaveformDataProcessor.d.ts** (70行, 2857バイト)
  - 関数: なし
  - インポート: ./WaveformRenderData, ./AudioManager, ./GainController

**dist/WaveformRenderData.d.ts** (78行, 3948バイト)
  - 関数: なし
  - インポート: なし

**dist/WaveformRenderer.d.ts** (109行, 4944バイト)
  - 関数: なし
  - インポート: ./OverlayLayout

**dist/WaveformSearcher.d.ts** (38行, 1102バイト)
  - 関数: なし
  - インポート: なし

**dist/ZeroCrossDetector.d.ts** (36行, 1275バイト)
  - 関数: なし
  - インポート: なし

**dist/assets/demo-DsYptmO3.js** (3行, 2138バイト)
  - 関数: v, b, w, f, switch, catch
  - インポート: なし

**dist/assets/main-DUIA4vI1.js** (8行, 59006バイト)
  - 関数: B, Y, H, Z, k, d, r, for, if, constructor, updateHistory, getExtendedBuffer, clear, initializeAnalyser, start, catch, startFromFile, startFromBuffer, stop, getTimeDomainData, getExtendedTimeDomainData, getFrequencyData, getSampleRate, getFFTSize, getFrequencyBinCount, isReady, setAutoGain, getAutoGainEnabled, setNoiseGate, getNoiseGateEnabled, setNoiseGateThreshold, getNoiseGateThreshold, getCurrentGain, clearHistory, setFrequencyEstimationMethod, getFrequencyEstimationMethod, setBufferSizeMultiplier, getBufferSizeMultiplier, getEstimatedFrequency, getMinFrequency, getMaxFrequency, getFrequencyPlotHistory, updateDimensions, calculateOverlayDimensions, drawGrid, drawGridLabels, drawWaveform, drawFFTOverlay, drawHarmonicAnalysis, drawFrequencyPlot, setDebugOverlaysEnabled, drawPhaseMarkers, clearAndDrawGrid, updateRendererDimensions, setFFTDisplay, getFFTDisplayEnabled, setHarmonicAnalysisEnabled, getHarmonicAnalysisEnabled, getDebugOverlaysEnabled, setOverlaysLayout, getOverlaysLayout, setUsePeakMode, getUsePeakMode, setZeroCrossMode, getZeroCrossMode, reset, getLastSimilarity, hasPreviousWaveform, getPreviousWaveform, findPeakAmplitude, drawCenterLine, clearCanvas, drawSimilarityPlot, drawSimilarityText, drawPositionMarkers, drawOffsetOverlayGraphs, clearAllCanvases, updatePanels, drawSimilarityGraph, updateGraphs, getBasePath, getBasePathFromScripts, loadWasmModule, getProcessor, initialize, syncConfigToWasm, syncResultsFromWasm, processFrame, updatePhaseOffsetHistory, render, renderFrame, getIsRunning, getSimilarityScore, isSimilaritySearchActive, setPauseDrawing, getPauseDrawing, setPhaseMarkerRangeEnabled, getPhaseMarkerRangeEnabled, frequencyToNoteInfo, calculateKeyboardRange, countWhiteKeys, calculateCenteringOffset, getElement, validateElements, update, updateFrequencyDisplay, updateGainDisplay, updateSimilarityDisplay, clearDisplays, setupEventHandlers, initializeUIState, setupCheckboxHandlers, setupSliderHandlers, setupSelectHandlers, setupButtonHandlers, setupFileInputHandler, handleStartStopButton, handleFileInput, sliderValueToThreshold, formatThresholdDisplay, updateCycleSimilarityPanelDisplay
  - インポート: ${o}

**dist/assets/modulepreload-polyfill-B5Qt9EMX.js** (3行, 771バイト)
  - 関数: s, i, function
  - インポート: なし

**dist/comparison-renderers/OffsetOverlayRenderer.d.ts** (17行, 905バイト)
  - 関数: なし
  - インポート: なし

**dist/comparison-renderers/PositionMarkerRenderer.d.ts** (11行, 388バイト)
  - 関数: なし
  - インポート: なし

**dist/comparison-renderers/SimilarityPlotRenderer.d.ts** (22行, 903バイト)
  - 関数: なし
  - インポート: なし

**dist/comparison-renderers/WaveformPanelRenderer.d.ts** (30行, 1252バイト)
  - 関数: なし
  - インポート: なし

**dist/comparison-renderers/index.d.ts** (5行, 264バイト)
  - 関数: なし
  - インポート: なし

**dist/demo-simple.html** (270行, 7283バイト)
  - 関数: なし
  - インポート: なし

**dist/index.d.ts** (23行, 1324バイト)
  - 関数: なし
  - インポート: なし

**dist/index.html** (405行, 13360バイト)
  - 関数: なし
  - インポート: なし

**dist/renderers/BaseOverlayRenderer.d.ts** (25行, 949バイト)
  - 関数: なし
  - インポート: ../OverlayLayout

**dist/renderers/FFTOverlayRenderer.d.ts** (17行, 689バイト)
  - 関数: なし
  - インポート: ../OverlayLayout, ./BaseOverlayRenderer

**dist/renderers/FrequencyPlotRenderer.d.ts** (20行, 783バイト)
  - 関数: なし
  - インポート: ../OverlayLayout, ./BaseOverlayRenderer

**dist/renderers/GridRenderer.d.ts** (32行, 1101バイト)
  - 関数: なし
  - インポート: なし

**dist/renderers/HarmonicAnalysisRenderer.d.ts** (16行, 839バイト)
  - 関数: なし
  - インポート: ../OverlayLayout, ./BaseOverlayRenderer

**dist/renderers/PhaseMarkerRenderer.d.ts** (38行, 1646バイト)
  - 関数: なし
  - インポート: なし

**dist/renderers/WaveformLineRenderer.d.ts** (20行, 607バイト)
  - 関数: なし
  - インポート: なし

**dist/renderers/index.d.ts** (8行, 427バイト)
  - 関数: なし
  - インポート: なし

**dist/utils.d.ts** (32行, 1206バイト)
  - 関数: dbToAmplitude, amplitudeToDb, frequencyToNote, trimSilence
  - インポート: なし

**dist/wasm/signal_processor_wasm.d.ts** (149行, 7930バイト)
  - 関数: initSync, __wbg_init
  - インポート: なし

**dist/wasm/signal_processor_wasm.js** (651行, 20982バイト)
  - 関数: __wbg_get_imports, getArrayF32FromWasm0, getArrayU8FromWasm0, getFloat32ArrayMemory0, getStringFromWasm0, getUint8ArrayMemory0, isLikeNone, passArray8ToWasm0, passArrayF32ToWasm0, passStringToWasm0, decodeText, __wbg_finalize_init, __wbg_load, expectedResponseType, initSync, __wbg_init, __destroy_into_raw, free, computeFrequencyData, if, constructor, processFrame, reset, setAutoGain, setBufferSizeMultiplier, setFrequencyEstimationMethod, setNoiseGate, setNoiseGateThreshold, setUsePeakMode, setZeroCrossMode, __wrap, candidate1Harmonics, candidate1WeightedScore, candidate2Harmonics, candidate2WeightedScore, cycleSimilarities2div, cycleSimilarities4div, cycleSimilarities8div, displayEndIndex, displayStartIndex, estimatedFrequency, fftSize, frequencyData, frequencyPlotHistory, gain, halfFreqPeakStrengthPercent, isSignalAboveNoiseGate, maxFrequency, phaseMinusQuarterPiIndex, phaseTwoPiIndex, phaseTwoPiPlusQuarterPiIndex, phaseZeroHistory, phaseZeroIndex, phaseZeroSegmentRelative, phaseZeroTolerance, previousWaveform, sampleRate, selectionReason, similarity, similarityPlotHistory, usedSimilaritySearch, waveform_data, zeroCrossModeName, function, for, catch, switch
  - インポート: なし

**dist/wasm/signal_processor_wasm_bg.wasm.d.ts** (54行, 4042バイト)
  - 関数: なし
  - インポート: なし

**example-library-usage.html** (371行, 11734バイト)
  - 関数: なし
  - インポート: なし

**index.html** (404行, 13211バイト)
  - 関数: なし
  - インポート: なし

**public/wasm/signal_processor_wasm.d.ts** (149行, 7930バイト)
  - 関数: initSync, __wbg_init
  - インポート: なし

**public/wasm/signal_processor_wasm.js** (651行, 20982バイト)
  - 関数: __wbg_get_imports, getArrayF32FromWasm0, getArrayU8FromWasm0, getFloat32ArrayMemory0, getStringFromWasm0, getUint8ArrayMemory0, isLikeNone, passArray8ToWasm0, passArrayF32ToWasm0, passStringToWasm0, decodeText, __wbg_finalize_init, __wbg_load, expectedResponseType, initSync, __wbg_init, __destroy_into_raw, free, computeFrequencyData, if, constructor, processFrame, reset, setAutoGain, setBufferSizeMultiplier, setFrequencyEstimationMethod, setNoiseGate, setNoiseGateThreshold, setUsePeakMode, setZeroCrossMode, __wrap, candidate1Harmonics, candidate1WeightedScore, candidate2Harmonics, candidate2WeightedScore, cycleSimilarities2div, cycleSimilarities4div, cycleSimilarities8div, displayEndIndex, displayStartIndex, estimatedFrequency, fftSize, frequencyData, frequencyPlotHistory, gain, halfFreqPeakStrengthPercent, isSignalAboveNoiseGate, maxFrequency, phaseMinusQuarterPiIndex, phaseTwoPiIndex, phaseTwoPiPlusQuarterPiIndex, phaseZeroHistory, phaseZeroIndex, phaseZeroSegmentRelative, phaseZeroTolerance, previousWaveform, sampleRate, selectionReason, similarity, similarityPlotHistory, usedSimilaritySearch, waveform_data, zeroCrossModeName, function, for, catch, switch
  - インポート: なし

**public/wasm/signal_processor_wasm_bg.wasm.d.ts** (54行, 4042バイト)
  - 関数: なし
  - インポート: なし

**scripts/screenshot-local.js** (160行, 4621バイト)
  - 関数: takeScreenshot, catch, if
  - インポート: playwright, playwright, fs

**src/AudioManager.ts** (281行, 9000バイト)
  - 関数: if, catch, while, start, startFromFile, startFromBuffer, stop
  - インポート: ./utils, ./BufferSource, ./FrameBufferHistory

**src/BasePathResolver.ts** (109行, 3990バイト)
  - 関数: if, for, catch
  - インポート: なし

**src/BufferSource.ts** (198行, 5177バイト)
  - 関数: constructor, if
  - インポート: なし

**src/ComparisonPanelRenderer.ts** (182行, 6494バイト)
  - 関数: constructor, if
  - インポート: なし

**src/CycleSimilarityRenderer.ts** (321行, 9944バイト)
  - 関数: constructor, if, for
  - インポート: なし

**src/DOMElementManager.ts** (149行, 7480バイト)
  - 関数: constructor, if, for
  - インポート: なし

**src/DisplayUpdater.ts** (125行, 3607バイト)
  - 関数: constructor, if
  - インポート: ./Oscilloscope, ./PianoKeyboardRenderer, ./utils

**src/FrameBufferHistory.ts** (88行, 3067バイト)
  - 関数: if, for
  - インポート: なし

**src/FrequencyEstimator.ts** (68行, 2204バイト)
  - 関数: if
  - インポート: なし

**src/GainController.ts** (51行, 1308バイト)
  - 関数: なし
  - インポート: ./utils

**src/Oscilloscope.ts** (488行, 17513バイト)
  - 関数: constructor, if, catch, start, startFromFile, startFromBuffer, stop
  - インポート: ./AudioManager, ./GainController, ./FrequencyEstimator

**src/OverlayLayout.ts** (105行, 2862バイト)
  - 関数: resolveValue, if
  - インポート: なし

**src/PianoKeyboardRenderer.ts** (212行, 6623バイト)
  - 関数: constructor, if, for
  - インポート: ./utils

**src/UIEventHandlers.ts** (287行, 10136バイト)
  - 関数: constructor, if, catch, handleStartStopButton, handleFileInput
  - インポート: ./Oscilloscope, ./DOMElementManager, ./DisplayUpdater

**src/WasmModuleLoader.ts** (121行, 3799バイト)
  - 関数: cleanup, handleLoad, if, loadWasmModule
  - インポート: ${wasmPath}

**src/WaveformDataProcessor.ts** (341行, 14406バイト)
  - 関数: constructor, catch, if, initialize
  - インポート: ./WaveformRenderData, ./AudioManager, ./GainController

**src/WaveformRenderData.ts** (123行, 4641バイト)
  - 関数: なし
  - インポート: なし

**src/WaveformRenderer.ts** (284行, 9679バイト)
  - 関数: constructor, if
  - インポート: ./OverlayLayout

**src/WaveformSearcher.ts** (54行, 1283バイト)
  - 関数: なし
  - インポート: なし

**src/ZeroCrossDetector.ts** (51行, 1627バイト)
  - 関数: なし
  - インポート: なし

**src/__tests__/BufferSource.test.ts** (337行, 11874バイト)
  - 関数: for
  - インポート: vitest, ../BufferSource

**src/__tests__/algorithms.test.ts** (173行, 5371バイト)
  - 関数: なし
  - インポート: vitest, ../FrequencyEstimator, ../GainController

**src/__tests__/comparison-panel-renderer.test.ts** (360行, 12904バイト)
  - 関数: for
  - インポート: vitest, ../ComparisonPanelRenderer

**src/__tests__/cycle-similarity-display.test.ts** (339行, 11973バイト)
  - 関数: なし
  - インポート: vitest, ../DOMElementManager, ../UIEventHandlers

**src/__tests__/cycle-similarity.test.ts** (74行, 2693バイト)
  - 関数: for
  - インポート: vitest

**src/__tests__/dom-integration.test.ts** (289行, 9226バイト)
  - 関数: createMediaStreamSource, createAnalyser, for, close, getTracks
  - インポート: vitest, ../utils

**src/__tests__/library-exports.test.ts** (162行, 5563バイト)
  - 関数: なし
  - インポート: vitest

**src/__tests__/normalized-harmonics-issue197.test.ts** (102行, 4124バイト)
  - 関数: normalize, if
  - インポート: vitest

**src/__tests__/oscilloscope.test.ts** (625行, 25172バイト)
  - 関数: createSilentMockAudioContext, getFFTOverlayDimensions, findFFTOverlayBorderCall, createMediaStreamSource, createAnalyser, for, close, getTracks, getAudioTracks, getVideoTracks, stop, if
  - インポート: vitest, ../Oscilloscope, ../utils

**src/__tests__/overlay-layout.test.ts** (81行, 3038バイト)
  - 関数: なし
  - インポート: vitest, ../OverlayLayout

**src/__tests__/performance-issue267.test.ts** (135行, 4799バイト)
  - 関数: for, if
  - インポート: vitest, ../Oscilloscope, ../BufferSource

**src/__tests__/piano-keyboard-renderer.test.ts** (163行, 5266バイト)
  - 関数: なし
  - インポート: vitest, ../PianoKeyboardRenderer

**src/__tests__/startFromBuffer.test.ts** (165行, 5764バイト)
  - 関数: for
  - インポート: vitest, ../AudioManager, ../Oscilloscope

**src/__tests__/utils.test.ts** (367行, 12152バイト)
  - 関数: createAudioBuffer, constructor, for, if
  - インポート: vitest, ../utils

**src/__tests__/waveform-data-processor.test.ts** (66行, 2278バイト)
  - 関数: なし
  - インポート: vitest, ../WaveformDataProcessor, ../AudioManager

**src/__tests__/waveform-renderer.test.ts** (495行, 17148バイト)
  - 関数: for
  - インポート: vitest, ../WaveformRenderer

**src/__tests__/waveform-searcher.test.ts** (40行, 1126バイト)
  - 関数: なし
  - インポート: vitest, ../WaveformSearcher

**src/__tests__/weighted-harmonic-issue195.test.ts** (120行, 4789バイト)
  - 関数: calculateWeightedScore
  - インポート: vitest

**src/comparison-renderers/OffsetOverlayRenderer.ts** (115行, 3842バイト)
  - 関数: drawOffsetLine, if, for
  - インポート: なし

**src/comparison-renderers/PositionMarkerRenderer.ts** (44行, 1077バイト)
  - 関数: なし
  - インポート: なし

**src/comparison-renderers/SimilarityPlotRenderer.ts** (139行, 4111バイト)
  - 関数: if, for
  - インポート: なし

**src/comparison-renderers/WaveformPanelRenderer.ts** (114行, 3522バイト)
  - 関数: for, if
  - インポート: なし

**src/comparison-renderers/index.ts** (5行, 264バイト)
  - 関数: なし
  - インポート: なし

**src/index.ts** (49行, 1724バイト)
  - 関数: なし
  - インポート: なし

**src/main.ts** (53行, 1811バイト)
  - 関数: なし
  - インポート: ./Oscilloscope, ./PianoKeyboardRenderer, ./DOMElementManager

**src/renderers/BaseOverlayRenderer.ts** (77行, 2404バイト)
  - 関数: constructor, if
  - インポート: ../OverlayLayout

**src/renderers/FFTOverlayRenderer.ts** (98行, 3314バイト)
  - 関数: for, if
  - インポート: ../OverlayLayout, ./BaseOverlayRenderer

**src/renderers/FrequencyPlotRenderer.ts** (219行, 7015バイト)
  - 関数: if, for
  - インポート: ../utils, ../OverlayLayout, ./BaseOverlayRenderer

**src/renderers/GridRenderer.ts** (146行, 5189バイト)
  - 関数: constructor, for, if
  - インポート: ../utils

**src/renderers/HarmonicAnalysisRenderer.ts** (140行, 4723バイト)
  - 関数: if, for
  - インポート: ../OverlayLayout, ./BaseOverlayRenderer

**src/renderers/PhaseMarkerRenderer.ts** (141行, 4646バイト)
  - 関数: drawVerticalLine, constructor, if
  - インポート: なし

**src/renderers/WaveformLineRenderer.ts** (58行, 1558バイト)
  - 関数: constructor, for, if
  - インポート: なし

**src/renderers/index.ts** (8行, 427バイト)
  - 関数: なし
  - インポート: なし

**src/utils.ts** (167行, 5136バイト)
  - 関数: dbToAmplitude, amplitudeToDb, frequencyToNote, trimSilence, if, for
  - インポート: なし

**test-pages/test-canvas-dimension-warning.html** (164行, 5691バイト)
  - 関数: なし
  - インポート: なし

**vite.config.ts** (60行, 1678バイト)
  - 関数: なし
  - インポート: vite, path, vite-plugin-dts

## 関数呼び出し階層
- B (dist/assets/main-DUIA4vI1.js)
  - if (demo-simple.js)
    - startUpdates (demo-simple.js)
      - stopUpdates ()
      - generateWaveform ()
      - startOscilloscope ()
      - switch ()
      - d ()
      - r ()
      - startFromBuffer ()
      - stop ()
      - getCurrentGain ()
      - getEstimatedFrequency ()
      - setDebugOverlaysEnabled ()
      - s ()
    - catch (demo-simple.js)
      - for (demo-simple.js)
      - v (dist/assets/demo-DsYptmO3.js)
      - b ()
      - w ()
      - f ()
      - k ()
      - takeScreenshot (scripts/screenshot-local.js)
      - close ()
      - updateHistory ()
      - getExtendedBuffer ()
      - clear ()
      - initializeAnalyser ()
      - start ()
      - startFromFile ()
      - getTimeDomainData ()
      - getExtendedTimeDomainData ()
      - getFrequencyData ()
      - getSampleRate ()
      - getFFTSize ()
      - getFrequencyBinCount ()
      - isReady ()
      - reset ()
      - trimSilence ()
      - createMediaStreamSource ()
      - createAnalyser ()
      - getTracks ()
      - getBasePath ()
      - getBasePathFromScripts ()
    - clearHistory ()
    - setFrequencyEstimationMethod ()
    - getFrequencyEstimationMethod ()
    - setBufferSizeMultiplier ()
    - getBufferSizeMultiplier ()
    - getMinFrequency ()
    - getMaxFrequency ()
    - getFrequencyPlotHistory ()
    - resolveValue (dist/OverlayLayout.d.ts)
    - setAutoGain ()
    - setNoiseGate ()
    - setNoiseGateThreshold ()
    - setUsePeakMode ()
    - setZeroCrossMode ()
    - loadWasmModule ()
      - getProcessor ()
      - processFrame ()
      - computeFrequencyData ()
      - cleanup (src/WasmModuleLoader.ts)
    - normalize (src/__tests__/normalized-harmonics-issue197.test.ts)
    - getAutoGainEnabled ()
    - getNoiseGateEnabled ()
    - getNoiseGateThreshold ()
    - setFFTDisplay ()
    - getFFTDisplayEnabled ()
    - getDebugOverlaysEnabled ()
    - updatePanels ()
    - getIsRunning ()
    - getSimilarityScore ()
    - isSimilaritySearchActive ()
    - setPauseDrawing ()
    - getPauseDrawing ()
    - dbToAmplitude (dist/utils.d.ts)
      - amplitudeToDb ()
      - frequencyToNote ()
    - createSilentMockAudioContext (src/__tests__/oscilloscope.test.ts)
      - getFFTOverlayDimensions ()
      - findFFTOverlayBorderCall ()
      - getAudioTracks ()
      - getVideoTracks ()
    - render ()
    - drawOffsetOverlayGraphs ()
    - drawOffsetLine (src/comparison-renderers/OffsetOverlayRenderer.ts)
    - drawSimilarityPlot ()
    - drawSimilarityText ()
    - drawWaveform ()
    - findPeakAmplitude ()
    - drawCenterLine ()
    - clearCanvas ()
    - calculateOverlayDimensions ()
    - drawFFTOverlay ()
    - Y ()
    - drawFrequencyPlot ()
    - drawHarmonicAnalysis ()
  - H ()
  - Z ()
  - constructor (undefined)
- initSync (dist/wasm/signal_processor_wasm.d.ts)
- __wbg_get_imports (dist/wasm/signal_processor_wasm.js)
- while (src/AudioManager.ts)
- handleLoad (src/WasmModuleLoader.ts)
- createAudioBuffer (src/__tests__/utils.test.ts)
- calculateWeightedScore (src/__tests__/weighted-harmonic-issue195.test.ts)
- drawVerticalLine (src/renderers/PhaseMarkerRenderer.ts)


## プロジェクト構造（ファイル一覧）
ARCHITECTURE.md
LIBRARY_USAGE.md
README.ja.md
README.md
REFACTORING_ISSUE_251.md
REFACTORING_SUMMARY.md
demo-simple.html
demo-simple.js
dist/AudioManager.d.ts
dist/BasePathResolver.d.ts
dist/BufferSource.d.ts
dist/ComparisonPanelRenderer.d.ts
dist/CycleSimilarityRenderer.d.ts
dist/DOMElementManager.d.ts
dist/DisplayUpdater.d.ts
dist/FrameBufferHistory.d.ts
dist/FrequencyEstimator.d.ts
dist/GainController.d.ts
dist/Oscilloscope.d.ts
dist/OverlayLayout.d.ts
dist/PianoKeyboardRenderer.d.ts
dist/UIEventHandlers.d.ts
dist/WasmModuleLoader.d.ts
dist/WaveformDataProcessor.d.ts
dist/WaveformRenderData.d.ts
dist/WaveformRenderer.d.ts
dist/WaveformSearcher.d.ts
dist/ZeroCrossDetector.d.ts
dist/assets/demo-DsYptmO3.js
dist/assets/main-DUIA4vI1.js
dist/comparison-renderers/OffsetOverlayRenderer.d.ts
dist/demo-simple.html
example-library-usage.html

上記の情報を基に、プロンプトで指定された形式でプロジェクト概要を生成してください。
特に以下の点を重視してください：
- 技術スタックは各カテゴリごとに整理して説明
- ファイル階層ツリーは提供された構造をそのまま使用
- ファイルの説明は各ファイルの実際の内容と機能に基づく
- 関数の説明は実際に検出された関数の役割に基づく
- 関数呼び出し階層は実際の呼び出し関係に基づく


---
Generated at: 2026-02-07 07:09:20 JST
