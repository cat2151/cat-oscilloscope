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

**WASM実装**: `signal-processor-wasm/src/` (Rust) - すべてのデータ処理アルゴリズム  
**ビルド済み**: `public/wasm/` - 事前ビルド済みWASM

## 開発コマンド

```bash
npm install         # 依存関係インストール
npm run dev         # 開発サーバー (localhost:3000)
npm run build       # 本番ビルド（WASM失敗時は事前ビルド版を使用）
npm run build:lib   # ライブラリビルド
npm test            # テスト (Vitest)
```

## コード規約
- TypeScript `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`

## ドキュメント編集の注意

### README編集について
- README.mdへ追記せず、README.ja.mdのみに追記すること

## dist ディレクトリのコミット方針

### 運用方針
- distディレクトリはコミット対象とする
- .gitignoreでdistを除外しないこと
- agentがPRを作成する際は、`npm run build:lib` を実行してdistを生成すること
- distが更新されていない場合は、再ビルドして必ずコミットすること

## エラー対応issueのテスト方針

- エラー対応issueにおいては、エラー修正前にヘッドレスブラウザで再現テストし、再現しないなら失敗を報告せよ
- エラー対応issueにおいては、エラー修正後にヘッドレスブラウザで再現テストし、まだエラーがあるなら失敗を報告せよ

## 赤い縦線（位相0マーカー）の移動アルゴリズム設計方針

### 重要な設計決定：1%移動制約を優先、ゼロクロス正確性より視覚的安定性を重視

**背景課題:**
- ゼロクロス候補はフレーム間で激しくジャンプすることが頻繁にある（ノイズ等の影響）
- 赤い縦線が候補に追従してジャンプすると視覚的体験が悪い（NG）

**設計方針:**
- 赤い縦線は「ゼロクロス候補がない位置」でも許容する
- **1%移動制約を最優先**し、滑らかな移動を実現
- 「最寄りのゼロクロス候補に向かって段階的に移動する」という動作
- 「常に正確なゼロクロス位置にいる」ことは要求しない

**実装:**
- `signal-processor-wasm/src/zero_cross_detector/mod.rs`の`find_phase_zero_in_segment()`
- 内部履歴（`absolute_phase_offset`）は連続値で保持
- 返り値は`new_rel`を直接返す（ゼロクロス候補へのスナップはしない）
- 詳細な設計根拠はコード内コメント（mod.rs:296-309）参照

**禁止事項:**
- 返り値を「最寄りのゼロクロス候補にスナップ」する実装は避けること
- これを行うと1%制約の意味がなくなり、視覚的なジャンプが発生する

# プルリクエストとレビュー
- プルリクエストは日本語で記述してください
- レビューは日本語で記述してください

