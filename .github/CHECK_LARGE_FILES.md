# 大きなファイル検出システム

## 概要

このシステムは、ソースコードファイルの行数を定期的にチェックし、設定された閾値を超えるファイルを検出してGitHub issueを自動的に作成します。

### スキャン方式

**ブラックリスト方式**を採用しています:
- すべてのファイルを対象とし、除外パターンでフィルタリング
- 新しい言語やファイルタイプを追加しても自動的にスキャン対象となる
- ファイル漏れのリスクを最小化

この方式は小規模リポジトリで日次実行する場合に適しています。

## 構成

### 1. 設定ファイル (`.github/check-large-files.toml`)

TOML形式で以下の設定が可能です：

```toml
[settings]
# 行数の閾値
max_lines = 500

# issue作成時のラベル
issue_labels = ["refactoring", "code-quality", "automated"]

# issueのタイトルテンプレート
issue_title = "大きなファイルの検出: {count}個のファイルが{max_lines}行を超えています"

[scan]
# スキャン対象のファイルパターン（glob形式）
# ブラックリスト方式: すべてのファイルを対象とし、除外パターンでフィルタリング
include_patterns = [
    "**/*",
]

# 除外するパターン（ディレクトリと拡張子）
exclude_patterns = [
    # ビルド成果物・依存関係のディレクトリ
    "**/node_modules/**",
    "**/dist/**",
    "dist/**",
    "**/build/**",
    "**/pkg/**",
    "**/public/wasm/**",
    "**/.git/**",
    "**/target/**",
    
    # テストファイル
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.test.js",
    "**/*.test.jsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "**/*.spec.js",
    "**/*.spec.jsx",
    
    # ドキュメント・設定ファイル
    "**/*.md",
    "**/*.json",
    "**/*.yml",
    "**/*.yaml",
    "**/*.toml",
    "**/*.lock",
    "**/*.html",
    "**/*.css",
    
    # ビルド成果物
    "**/*.d.ts",
    "**/*.d.ts.map",
    "**/*.js.map",
    "**/*.mjs",
    "**/*.wasm",
    
    # その他の非ソースファイル
    "**/*.png",
    "**/*.jpg",
    "**/*.jpeg",
    "**/*.gif",
    "**/*.svg",
    "**/*.ico",
    "**/.gitignore",
    "**/LICENSE",
]

# 除外する特定のファイル
exclude_files = [
    # "src/legacy/OldFile.ts",
]
```

### 2. Pythonスクリプト (`.github/scripts/check_large_files.py`)

ファイルスキャンと行数チェックを行うスクリプトです。主な機能：

- TOMLファイルから設定を読み込み
- globパターンでファイルをスキャン
- 各ファイルの行数をカウント
- 閾値を超えるファイルを検出
- GitHub Actions用の出力ファイルを生成

### 3. GitHub Actions ワークフロー (`.github/workflows/check-large-files.yml`)

日次で自動実行されるワークフローです：

- **実行タイミング**: 日本時間 毎日09:00（UTC 00:00）
- **手動実行**: GitHub Actionsの画面から手動実行も可能
- **issue管理**: 
  - 既存の類似issueがあれば、コメントで更新情報を追加
  - なければ新規issueを作成

## 使用方法

### 手動実行

1. GitHubリポジトリの「Actions」タブを開く
2. 「Check Large Files」ワークフローを選択
3. 「Run workflow」ボタンをクリック

### 設定のカスタマイズ

`.github/check-large-files.toml`を編集して：

1. **閾値の変更**: `max_lines`の値を変更
2. **対象ファイルの追加**: `include_patterns`にパターンを追加
3. **除外パターンの追加**: `exclude_patterns`に除外したいパターンを追加
4. **特定ファイルの除外**: `exclude_files`にファイルパスを追加

## ローカルでのテスト

```bash
# スクリプトを直接実行
cd /path/to/repository
export OUTPUT_DIR=/tmp/check-large-files-output
python3 .github/scripts/check_large_files.py

# 結果を確認
cat $OUTPUT_DIR/summary.json
cat $OUTPUT_DIR/issue_body.txt
```

## トラブルシューティング

### ワークフローが実行されない

- リポジトリの設定でGitHub Actionsが有効になっているか確認
- ワークフローファイルの構文エラーがないか確認

### issueが作成されない

- `GITHUB_TOKEN`の権限設定を確認
- ワークフローの実行ログで詳細を確認

### 期待したファイルが検出されない

- `.github/check-large-files.toml`の`include_patterns`を確認
- `exclude_patterns`や`exclude_files`で除外されていないか確認
- ローカルでスクリプトを実行してテスト

## 仕組みの詳細

1. **スケジュール実行**: GitHub ActionsのCRONトリガーで日次実行
2. **ファイルスキャン**: Pythonスクリプトがglobパターンでファイルを検索
3. **行数チェック**: 各ファイルの行数をカウントし、閾値と比較
4. **結果の整形**: 検出結果をMarkdownテーブル形式で整形
5. **issue作成/更新**: 
   - 既存のissueを検索
   - あればコメントで更新、なければ新規作成

## 参考

このシステムは以下の技術を使用しています：

- [GitHub Actions](https://docs.github.com/ja/actions)
- [Python tomllib](https://docs.python.org/3/library/tomllib.html) (Python 3.11+)
- [GitHub REST API](https://docs.github.com/ja/rest)
