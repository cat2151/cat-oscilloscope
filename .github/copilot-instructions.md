# Cat Oscilloscope - Copilot Instructions

## プロジェクト概要

ブラウザベースのオシロスコープ波形ビジュアライザー。Web Audio APIでマイク入力またはオーディオファイルをキャプチャし、Canvas 2Dで波形をリアルタイム描画する。

## アーキテクチャ

- **モジュラー設計**: `Oscilloscope`クラスがコーディネーター、各専門モジュールに処理を委譲
- **Rust/WASM**: データ処理（ゼロクロス検出、周波数推定[Zero-Crossing/Autocorrelation/FFT/STFT/CQT]、自動ゲイン、ノイズゲート、波形類似度、バッファ拡張[1x/4x/16x]）
- **TypeScript**: 設定管理とCanvas描画のみ
- **パイプライン**: `MediaStream`/`AudioBuffer` → `AudioContext` → `AnalyserNode` → WASM → Canvas

## 主要ファイル（src/）

| カテゴリ | ファイル | 役割 |
|---------|---------|------|
| **コア** | `Oscilloscope.ts` | メインコーディネーター |
| | `main.ts` | エントリーポイント、UIイベント |
| **オーディオ** | `AudioManager.ts` | Web Audio API、マイク・ファイル入力 |
| | `BufferSource.ts` | 静的バッファ可視化（再生なし） |
| **WASM連携** | `WaveformDataProcessor.ts` | WASM処理コーディネーター |
| | `WasmModuleLoader.ts` | WASMロード管理 |
| | `BasePathResolver.ts` | WASMパス解決 |
| **設定保持** | `GainController.ts` | 自動ゲイン・ノイズゲート設定 |
| | `FrequencyEstimator.ts` | 周波数推定方式設定 |
| | `ZeroCrossDetector.ts` | ゼロクロス設定 |
| | `WaveformSearcher.ts` | 波形類似度探索設定 |
| **描画** | `WaveformRenderer.ts` | Canvas描画、グリッド・波形・FFT |
| | `ComparisonPanelRenderer.ts` | 波形比較パネル |
| | `PianoKeyboardRenderer.ts` | ピアノ鍵盤表示 |
| | `CycleSimilarityRenderer.ts` | 類似度表示 |
| **UI** | `UIEventHandlers.ts` | UIイベントハンドリング |
| | `DOMElementManager.ts` | DOM要素管理 |
| | `DisplayUpdater.ts` | 表示更新 |
| **型定義** | `WaveformRenderData.ts` | 波形データ型 |
| | `OverlayLayout.ts` | オーバーレイレイアウト型 |
| **その他** | `utils.ts` | ユーティリティ（dB変換、無音トリミング） |
| | `index.ts` | ライブラリエクスポート |

**WASM実装**: `wasm-processor/src/` (Rust) - すべてのデータ処理アルゴリズム  
**ビルド済み**: `public/wasm/` - 事前ビルド済みWASM

## 開発コマンド

```bash
npm install         # 依存関係インストール
npm run dev         # 開発サーバー (localhost:3000)
npm run build       # 本番ビルド（WASMも含む）
npm run build:lib   # ライブラリビルド
npm test            # テスト (Vitest)
```

## コード規約

- TypeScript `strict: true`, `noUnusedLocals/Parameters: true`
- FFTサイズ `4096`, スムージング `0`, キャンバス `800x400`px

## ドキュメント編集の注意

### README編集について
- **README.mdへ追記せず、README.ja.mdのみに追記すること**
- 理由: README.mdはGitHub Actionsで自動生成されるため
- README.ja.mdがmainブランチにpushされると、GitHub Actionsが自動的にREADME.mdを英訳して生成する
- ワークフロー: `.github/workflows/call-translate-readme.yml`

## dist ディレクトリのコミット方針

### 背景
wavlpfリポジトリ（[issues #66](https://github.com/cat2151/wavlpf/issues/66)）で、distディレクトリがコミットされていなかったため、ライブラリとして利用できないという致命的な問題が発生しました。

### 運用方針
- **distディレクトリは必ずコミット対象とする**
- npm登録やprepareスクリプトに依存せず、リポジトリから直接利用可能にする
- agentがPRを作成する際は、以下を実施すること：
  1. `npm run build:lib` を実行してdistを生成
  2. distディレクトリをコミットに含める
  3. distの内容をPRレビュー対象とする
- CIワークフローでもdistの整合性を検証する

### 実装時の注意
- .gitignoreでdistを除外しないこと
- PRのレビュー時は、ソースコード変更とdist出力の整合性を確認すること
- distが更新されていない場合は、再ビルドして必ずコミットすること

# プルリクエストとレビュー
- プルリクエストは日本語で記述してください
- レビューは日本語で記述してください
