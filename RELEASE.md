# リリース手順

このドキュメントは、cat-oscilloscope の v0.0.1 リリースを作成する手順を説明します。

## 前提条件

- package.json のバージョンが 0.0.1 に設定されていること
- dist ディレクトリが最新の状態でコミットされていること
- すべての変更がmainブランチにマージされていること

## リリース作成手順

### 方法1: GitHub Web UI を使用

1. GitHubリポジトリページ（https://github.com/cat2151/cat-oscilloscope）を開く
2. 右側の "Releases" セクションをクリック
3. "Create a new release" ボタンをクリック
4. 以下の情報を入力：
   - **Tag version**: `v0.0.1`
   - **Target**: `main` ブランチ
   - **Release title**: `v0.0.1`
   - **Description**: 
     ```
     First release
     ```
   - **Set as a pre-release**: チェックを入れる（初期リリースのため）
5. "Publish release" ボタンをクリック

### 方法2: GitHub CLI (gh) を使用

```bash
# リポジトリのルートディレクトリで実行
gh release create v0.0.1 \
  --title "v0.0.1" \
  --notes "First release" \
  --prerelease
```

## リリース後の確認

### 1. リリースの確認

GitHubのReleasesページで v0.0.1 が表示されることを確認：
https://github.com/cat2151/cat-oscilloscope/releases

### 2. CDN経由でのアクセス確認

リリース後、以下のCDNから配布ファイルにアクセスできるようになります：

#### jsDelivr

```html
<!-- ES Module -->
<script type="module">
  import { Oscilloscope } from 'https://cdn.jsdelivr.net/gh/cat2151/cat-oscilloscope@v0.0.1/dist/cat-oscilloscope.mjs';
</script>
```

確認URL:
- https://cdn.jsdelivr.net/gh/cat2151/cat-oscilloscope@v0.0.1/dist/cat-oscilloscope.mjs
- https://cdn.jsdelivr.net/gh/cat2151/cat-oscilloscope@v0.0.1/dist/cat-oscilloscope.cjs
- https://cdn.jsdelivr.net/gh/cat2151/cat-oscilloscope@v0.0.1/dist/index.d.ts

**注意**: このプロジェクトはnpmに公開しない方針のため、jsDelivrを使用してください。

## 使用例

### CDN経由での基本的な使用

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>cat-oscilloscope CDN Example</title>
</head>
<body>
  <canvas id="oscilloscope" width="800" height="400"></canvas>
  <button id="startBtn">Start</button>
  <button id="stopBtn">Stop</button>
  
  <script type="module">
    import { Oscilloscope } from 'https://cdn.jsdelivr.net/gh/cat2151/cat-oscilloscope@v0.0.1/dist/cat-oscilloscope.mjs';
    
    const canvas = document.getElementById('oscilloscope');
    const oscilloscope = new Oscilloscope(canvas);
    
    document.getElementById('startBtn').addEventListener('click', async () => {
      await oscilloscope.start();
    });
    
    document.getElementById('stopBtn').addEventListener('click', async () => {
      await oscilloscope.stop();
    });
  </script>
</body>
</html>
```

## トラブルシューティング

### CDNでファイルが見つからない場合

1. GitHubのリリースページでv0.0.1が正しく作成されているか確認
2. distディレクトリがリポジトリにコミットされているか確認
3. CDNのキャッシュが更新されるまで数分待つ

### バージョン固定の理由

このプロジェクトでは v0.0.1 を固定バージョンとして使用します。理由：

1. **dist commit 方式の採用**: distディレクトリをリポジトリにコミットする方式を採用しているため、ビルド済みファイルがGitHub上で直接利用可能
2. **CDN経由での配布**: jsDelivrなどのCDNを通じて、ライブラリ利用者が簡単にアクセスできる
3. **シンプルな配布**: npmに公開しなくても、GitHubリリース + CDNで十分な配布が可能

## 参考

- [chord2mml v0.0.1](https://github.com/cat2151/chord2mml/releases/tag/v0.0.1)
- [mml2abc v0.0.1](https://github.com/cat2151/mml2abc/releases/tag/v0.0.1)
- [easyabcjs6 v0.0.1](https://github.com/cat2151/easyabcjs6/releases/tag/v0.0.1)
