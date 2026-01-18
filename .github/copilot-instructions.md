# Cat Oscilloscope - Copilot Instructions

## プロジェクト概要

ブラウザベースのオシロスコープ波形ビジュアライザー。Web Audio APIでマイク入力またはオーディオファイルをキャプチャし、Canvas 2Dで波形をリアルタイム描画する。

## アーキテクチャ

- **モジュラー設計**: `Oscilloscope`クラスがコーディネーターとして各専門モジュールに処理を委譲
- **Rust/WASM実装**: すべてのデータ処理アルゴリズムはRust/WASMで実装され、TypeScript側は設定保持とレンダリングのみを担当
- **Web Audio API パイプライン**: `MediaStream`/`AudioBuffer` → `AudioContext` → `AnalyserNode` → WASM処理 → Canvas描画

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

- TypeScript `strict: true` - 厳密な型チェック有効
- `noUnusedLocals/noUnusedParameters: true` - 未使用変数・引数はエラー

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
