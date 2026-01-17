# Issue #177: LIBRARY_USAGE.md と README.ja.md の比較分析

## 分析日時
2026-01-17

## 分析の目的
PR #176で改善されたLIBRARY_USAGE.md（USAGEドキュメント）の内容が、README.ja.mdのライブラリ使用方法セクションに適切に反映されているかを確認する。

## LIBRARY_USAGE.mdの主要な内容

### 1. インストール方法
- CDN経由（推奨）
- npm直接インストール
- GitHubから直接インストール
- ローカルリンク（開発時）

### 2. ⚠️ 重要: WASMファイルのセットアップ
**最も重要なポイント**: npmやGitHubからインストールする場合、WASMファイルを手動でセットアップする必要がある。

セットアップ方法:
- postinstallスクリプト（推奨）
- Viteプラグイン
- 手動コピー

この手順を省略すると「Failed to load WASM module script」エラーが発生する。

### 3. 基本的な使い方
- マイク入力
- オーディオファイル読み込み
- 静的バッファからの可視化（BufferSource）

### 4. BufferSource機能の詳細
- Float32Arrayからの使用
- AudioBufferからの使用（fromAudioBuffer()）
- wavlpfとの統合例
- オーディオ再生なしでのデータ可視化

### 5. 設定オプション
- オートゲイン
- ノイズゲート
- 周波数推定方法
- FFTスペクトラム表示

## README.ja.mdの現状

### 「📚 ライブラリとしての使用」セクション（35-54行）

現在の内容:
```typescript
cat-oscilloscopeは、あなた自身のプロジェクトでnpmライブラリとして使用できます。
詳細な手順は [LIBRARY_USAGE.md](./LIBRARY_USAGE.md) をご覧ください。

[基本的なコード例]
- マイク入力の例
- BufferSourceの基本例

**BufferSource機能**: wavlpfなどの音声処理ライブラリとの統合に最適な、
静的バッファからの可視化機能を提供します。
```

## 問題点と改善提案

### ❌ 重大な問題: WASMセットアップの注意事項が欠落

**問題**: 
README.ja.mdには、ライブラリとして使用する際に必要なWASMファイルのセットアップについての言及がない。

**影響**:
- ユーザーがnpmやGitHubから`cat-oscilloscope`をインストールしても、WASMファイルのセットアップを行わないと動作しない
- 「Failed to load WASM module script」エラーが発生する
- LIBRARY_USAGE.mdを読まないと原因が分からない

**改善提案**:
README.ja.mdの「📚 ライブラリとしての使用」セクションに、重要な注意事項として以下を追加すべき：

```markdown
⚠️ **重要**: npmやGitHubからインストールする場合、WASMファイルの手動セットアップが必要です。
詳細な手順は [LIBRARY_USAGE.md](./LIBRARY_USAGE.md) の「WASMファイルのセットアップ」セクションをご覧ください。
```

### ✅ 適切に反映されている点

1. **LIBRARY_USAGE.mdへのリンク**: 詳細情報への適切な誘導
2. **BufferSource機能の説明**: 基本的な使用例と説明
3. **コード例**: マイク入力とBufferSourceの基本的な使い方
4. **wavlpfとの統合**: 重要な使用例の言及

## 結論

### 現状評価
- README.ja.mdは概要レベルの情報を提供し、詳細はLIBRARY_USAGE.mdに誘導する設計
- 基本的なコード例は適切
- **しかし、WASMセットアップという重要な前提条件が欠落している**

### 推奨される対応
1. ✅ **即座に対応すべき**: WASMセットアップの注意事項を追加
2. この注意事項は、ユーザーが最初に遭遇する可能性が高い問題を回避するために必須

### その他の発見
- README.md（英語版）の49行目にタイポ: `new new Float32Array` → 修正済み
- README.ja.mdは正しいコードを記載していた
