# Cat Oscilloscope - Copilot Instructions

## プロジェクト概要

ブラウザベースのオシロスコープ波形ビジュアライザー。Web Audio APIでマイク入力またはオーディオファイルをキャプチャし、Canvas 2Dで波形をリアルタイム描画する。

## アーキテクチャ

- **モジュラー設計**: `Oscilloscope`クラスがコーディネーターとして各専門モジュールに処理を委譲
- **Web Audio API パイプライン**: `MediaStream`/`AudioBuffer` → `AudioContext` → `AnalyserNode` → Canvas描画
- **ゼロクロス検出**: 波形がマイナス→プラスに交差するポイントを検出し、安定した表示を実現
- **周波数推定**: ゼロクロス法、自己相関法、FFT法の3種類をサポート
- **自動ゲイン制御**: 波形が適切な振幅で表示されるよう自動調整
- **ノイズゲート**: 設定閾値以下の信号をカット

## 開発コマンド

```bash
npm install      # 依存関係インストール
npm run dev      # 開発サーバー起動 (localhost:3000)
npm run build    # tsc && vite build で本番ビルド
npm run preview  # ビルド結果のプレビュー
npm test         # テスト実行 (Vitest)
```

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
| `src/GainController.ts` | 自動ゲイン制御、ノイズゲート処理 |
| `src/FrequencyEstimator.ts` | 周波数推定（ゼロクロス法/自己相関法/FFT法）、周波数スムージング |
| `src/WaveformRenderer.ts` | Canvas描画、グリッド・波形・FFTスペクトラム表示 |
| `src/ZeroCrossDetector.ts` | ゼロクロス検出、表示範囲計算、時間的安定性維持 |
| `src/utils.ts` | ユーティリティ関数（dB変換、無音トリミング等） |
| `src/__tests__/` | テストファイル（Vitest） |
| `index.html` | UI・スタイル・Canvas要素（インラインCSS） |
| `vite.config.ts` | 開発サーバーポート設定のみ |

## 機能拡張時の注意

- マイクアクセスにはHTTPSまたはlocalhost必須
- `stop()`で全リソース（MediaStream, AudioContext）を確実に解放すること
- `requestAnimationFrame`ループは`isRunning`フラグで制御
- オーディオファイル読み込み時は`trimSilence()`で前後の無音を除去してループ再生の隙間を防ぐ
