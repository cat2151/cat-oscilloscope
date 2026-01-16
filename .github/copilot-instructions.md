# Cat Oscilloscope - Copilot Instructions

## プロジェクト概要

ブラウザベースのオシロスコープ波形ビジュアライザー。Web Audio APIでマイク入力またはオーディオファイルをキャプチャし、Canvas 2Dで波形をリアルタイム描画する。

## アーキテクチャ

- **モジュラー設計**: `Oscilloscope`クラスがコーディネーターとして各専門モジュールに処理を委譲
- **Rust/WASM実装**: すべてのデータ処理アルゴリズムはRust/WASMで実装され、TypeScript側は設定保持とレンダリングのみを担当
- **Web Audio API パイプライン**: `MediaStream`/`AudioBuffer` → `AudioContext` → `AnalyserNode` → WASM処理 → Canvas描画
- **ゼロクロス検出**: 波形がマイナス→プラスに交差するポイントを検出し、安定した表示を実現（WASM実装）
- **周波数推定**: Zero-Crossing、Autocorrelation、FFT、STFT、CQTの5種類をサポート（WASM実装）
- **自動ゲイン制御**: 波形が適切な振幅で表示されるよう自動調整（WASM実装）
- **ノイズゲート**: 設定閾値以下の信号をカット（WASM実装）
- **波形類似度検出**: 前回波形との類似度をリアルタイム計算（WASM実装）
- **バッファサイズマルチプライヤー**: 低周波検出精度向上のための拡張バッファ（1x/4x/16x）

## 開発コマンド

```bash
npm install      # 依存関係インストール
npm run dev      # 開発サーバー起動 (localhost:3000)
npm run build    # 本番ビルド（WASMも含む）
npm run build:wasm  # WASM実装のみビルド（wasm-packが必要）
npm run build:lib   # ライブラリ用ビルド
npm run preview  # ビルド結果のプレビュー
npm test         # テスト実行 (Vitest)
```

**注意**: 通常の使用では、事前ビルド済みのWASMファイルが `public/wasm/` に含まれているため、Rustツールチェーンは不要です。WASM実装を変更する場合のみ、Rust toolchain と wasm-pack が必要になります。

## コード規約

### TypeScript設定
- `strict: true` - 厳密な型チェック有効
- `noUnusedLocals/noUnusedParameters: true` - 未使用変数・引数はエラー
- ES2020ターゲット、ESNext モジュール

### 描画パラメータ（変更時の注意点）
- FFTサイズ: `4096` - 高解像度波形用
- スムージング: `0` - 正確な波形表現
- キャンバス: `800x400`px固定

## ファイル構成

| ファイル | 役割 |
|---------|------|
| `src/main.ts` | アプリケーションエントリーポイント、DOM要素取得、イベントハンドリング |
| `src/Oscilloscope.ts` | メインコーディネーター、各モジュールの統合と描画ループ管理 |
| `src/AudioManager.ts` | Web Audio API統合、AudioContext/AnalyserNode管理、マイク・ファイル入力 |
| `src/BufferSource.ts` | 静的バッファからの音声データ提供（再生なしの可視化用） |
| `src/WaveformDataProcessor.ts` | Rust/WASMプロセッサーとTypeScript設定の連携、フレーム処理コーディネーター |
| `src/GainController.ts` | 自動ゲイン制御・ノイズゲート設定の保持（処理はWASM） |
| `src/FrequencyEstimator.ts` | 周波数推定設定の保持（処理はWASM、5つの方式：Zero-Crossing/Autocorrelation/FFT/STFT/CQT） |
| `src/ZeroCrossDetector.ts` | ゼロクロス検出設定の保持（処理はWASM） |
| `src/WaveformSearcher.ts` | 波形類似度探索の状態保持（処理はWASM） |
| `src/WaveformRenderer.ts` | Canvas描画、グリッド・波形・FFTスペクトラム表示 |
| `src/ComparisonPanelRenderer.ts` | 波形比較パネルの描画（前回波形、現在波形、類似度履歴、フルバッファ） |
| `src/PianoKeyboardRenderer.ts` | ピアノ鍵盤表示、周波数に対応する鍵盤のハイライト |
| `src/WaveformRenderData.ts` | 波形レンダリング用データ構造の型定義 |
| `src/index.ts` | ライブラリエクスポート定義 |
| `src/utils.ts` | ユーティリティ関数（dB変換、無音トリミング等） |
| `src/__tests__/` | テストファイル（Vitest） |
| `wasm-processor/` | Rust/WASM実装（全データ処理アルゴリズム） |
| `public/wasm/` | ビルド済みWASMファイル |
| `index.html` | UI・スタイル・Canvas要素（インラインCSS） |
| `vite.config.ts` | 開発サーバーポート設定のみ |

## 機能拡張時の注意

- マイクアクセスにはHTTPSまたはlocalhost必須
- `stop()`で全リソース（MediaStream, AudioContext）を確実に解放すること
- `requestAnimationFrame`ループは`isRunning`フラグで制御
- オーディオファイル読み込み時は`trimSilence()`で前後の無音を除去してループ再生の隙間を防ぐ

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
