Last updated: 2026-01-05

# 開発状況生成プロンプト（開発者向け）

## 生成するもの：
- 現在openされているissuesを3行で要約する
- 次の一手の候補を3つlistする
- 次の一手の候補3つそれぞれについて、極力小さく分解して、その最初の小さな一歩を書く

## 生成しないもの：
- 「今日のissue目標」などuserに提案するもの
  - ハルシネーションの温床なので生成しない
- ハルシネーションしそうなものは生成しない（例、無価値なtaskや新issueを勝手に妄想してそれをuserに提案する等）
- プロジェクト構造情報（来訪者向け情報のため、別ファイルで管理）

## 「Agent実行プロンプト」生成ガイドライン：
「Agent実行プロンプト」作成時は以下の要素を必ず含めてください：

### 必須要素
1. **対象ファイル**: 分析/編集する具体的なファイルパス
2. **実行内容**: 具体的な分析や変更内容（「分析してください」ではなく「XXXファイルのYYY機能を分析し、ZZZの観点でmarkdown形式で出力してください」）
3. **確認事項**: 変更前に確認すべき依存関係や制約
4. **期待する出力**: markdown形式での結果や、具体的なファイル変更

### Agent実行プロンプト例

**良い例（上記「必須要素」4項目を含む具体的なプロンプト形式）**:
```
対象ファイル: `.github/workflows/translate-readme.yml`と`.github/workflows/call-translate-readme.yml`

実行内容: 対象ファイルについて、外部プロジェクトから利用する際に必要な設定項目を洗い出し、以下の観点から分析してください：
1) 必須入力パラメータ（target-branch等）
2) 必須シークレット（GEMINI_API_KEY）
3) ファイル配置の前提条件（README.ja.mdの存在）
4) 外部プロジェクトでの利用時に必要な追加設定

確認事項: 作業前に既存のworkflowファイルとの依存関係、および他のREADME関連ファイルとの整合性を確認してください。

期待する出力: 外部プロジェクトがこの`call-translate-readme.yml`を導入する際の手順書をmarkdown形式で生成してください。具体的には：必須パラメータの設定方法、シークレットの登録手順、前提条件の確認項目を含めてください。
```

**避けるべき例**:
- callgraphについて調べてください
- ワークフローを分析してください
- issue-noteの処理フローを確認してください

## 出力フォーマット：
以下のMarkdown形式で出力してください：

```markdown
# Development Status

## 現在のIssues
[以下の形式で3行でオープン中のissuesを要約。issue番号を必ず書く]
- [1行目の説明]
- [2行目の説明]
- [3行目の説明]

## 次の一手候補
1. [候補1のタイトル。issue番号を必ず書く]
   - 最初の小さな一歩: [具体的で実行可能な最初のアクション]
   - Agent実行プロンプト:
     ```
     対象ファイル: [分析/編集する具体的なファイルパス]

     実行内容: [具体的な分析や変更内容を記述]

     確認事項: [変更前に確認すべき依存関係や制約]

     期待する出力: [markdown形式での結果や、具体的なファイル変更の説明]
     ```

2. [候補2のタイトル。issue番号を必ず書く]
   - 最初の小さな一歩: [具体的で実行可能な最初のアクション]
   - Agent実行プロンプト:
     ```
     対象ファイル: [分析/編集する具体的なファイルパス]

     実行内容: [具体的な分析や変更内容を記述]

     確認事項: [変更前に確認すべき依存関係や制約]

     期待する出力: [markdown形式での結果や、具体的なファイル変更の説明]
     ```

3. [候補3のタイトル。issue番号を必ず書く]
   - 最初の小さな一歩: [具体的で実行可能な最初のアクション]
   - Agent実行プロンプト:
     ```
     対象ファイル: [分析/編集する具体的なファイルパス]

     実行内容: [具体的な分析や変更内容を記述]

     確認事項: [変更前に確認すべき依存関係や制約]

     期待する出力: [markdown形式での結果や、具体的なファイル変更の説明]
     ```
```


# 開発状況情報
- 以下の開発状況情報を参考にしてください。
- Issue番号を記載する際は、必ず [Issue #番号](../issue-notes/番号.md) の形式でMarkdownリンクとして記載してください。

## プロジェクトのファイル一覧
- .github/actions-tmp/.github/workflows/call-callgraph.yml
- .github/actions-tmp/.github/workflows/call-daily-project-summary.yml
- .github/actions-tmp/.github/workflows/call-issue-note.yml
- .github/actions-tmp/.github/workflows/call-rust-windows-check.yml
- .github/actions-tmp/.github/workflows/call-translate-readme.yml
- .github/actions-tmp/.github/workflows/callgraph.yml
- .github/actions-tmp/.github/workflows/check-recent-human-commit.yml
- .github/actions-tmp/.github/workflows/daily-project-summary.yml
- .github/actions-tmp/.github/workflows/issue-note.yml
- .github/actions-tmp/.github/workflows/rust-windows-check.yml
- .github/actions-tmp/.github/workflows/translate-readme.yml
- .github/actions-tmp/.github_automation/callgraph/codeql-queries/callgraph.ql
- .github/actions-tmp/.github_automation/callgraph/codeql-queries/codeql-pack.lock.yml
- .github/actions-tmp/.github_automation/callgraph/codeql-queries/qlpack.yml
- .github/actions-tmp/.github_automation/callgraph/config/example.json
- .github/actions-tmp/.github_automation/callgraph/docs/callgraph.md
- .github/actions-tmp/.github_automation/callgraph/presets/callgraph.js
- .github/actions-tmp/.github_automation/callgraph/presets/style.css
- .github/actions-tmp/.github_automation/callgraph/scripts/analyze-codeql.cjs
- .github/actions-tmp/.github_automation/callgraph/scripts/callgraph-utils.cjs
- .github/actions-tmp/.github_automation/callgraph/scripts/check-codeql-exists.cjs
- .github/actions-tmp/.github_automation/callgraph/scripts/check-node-version.cjs
- .github/actions-tmp/.github_automation/callgraph/scripts/common-utils.cjs
- .github/actions-tmp/.github_automation/callgraph/scripts/copy-commit-results.cjs
- .github/actions-tmp/.github_automation/callgraph/scripts/extract-sarif-info.cjs
- .github/actions-tmp/.github_automation/callgraph/scripts/find-process-results.cjs
- .github/actions-tmp/.github_automation/callgraph/scripts/generate-html-graph.cjs
- .github/actions-tmp/.github_automation/callgraph/scripts/generateHTML.cjs
- .github/actions-tmp/.github_automation/check_recent_human_commit/scripts/check-recent-human-commit.cjs
- .github/actions-tmp/.github_automation/project_summary/docs/daily-summary-setup.md
- .github/actions-tmp/.github_automation/project_summary/prompts/development-status-prompt.md
- .github/actions-tmp/.github_automation/project_summary/prompts/project-overview-prompt.md
- .github/actions-tmp/.github_automation/project_summary/scripts/ProjectSummaryCoordinator.cjs
- .github/actions-tmp/.github_automation/project_summary/scripts/development/DevelopmentStatusGenerator.cjs
- .github/actions-tmp/.github_automation/project_summary/scripts/development/GitUtils.cjs
- .github/actions-tmp/.github_automation/project_summary/scripts/development/IssueTracker.cjs
- .github/actions-tmp/.github_automation/project_summary/scripts/generate-project-summary.cjs
- .github/actions-tmp/.github_automation/project_summary/scripts/overview/CodeAnalyzer.cjs
- .github/actions-tmp/.github_automation/project_summary/scripts/overview/ProjectAnalysisOrchestrator.cjs
- .github/actions-tmp/.github_automation/project_summary/scripts/overview/ProjectDataCollector.cjs
- .github/actions-tmp/.github_automation/project_summary/scripts/overview/ProjectDataFormatter.cjs
- .github/actions-tmp/.github_automation/project_summary/scripts/overview/ProjectOverviewGenerator.cjs
- .github/actions-tmp/.github_automation/project_summary/scripts/shared/BaseGenerator.cjs
- .github/actions-tmp/.github_automation/project_summary/scripts/shared/FileSystemUtils.cjs
- .github/actions-tmp/.github_automation/project_summary/scripts/shared/ProjectFileUtils.cjs
- .github/actions-tmp/.github_automation/translate/docs/TRANSLATION_SETUP.md
- .github/actions-tmp/.github_automation/translate/scripts/translate-readme.cjs
- .github/actions-tmp/.gitignore
- .github/actions-tmp/.vscode/settings.json
- .github/actions-tmp/LICENSE
- .github/actions-tmp/README.ja.md
- .github/actions-tmp/README.md
- .github/actions-tmp/_config.yml
- .github/actions-tmp/generated-docs/callgraph.html
- .github/actions-tmp/generated-docs/callgraph.js
- .github/actions-tmp/generated-docs/development-status-generated-prompt.md
- .github/actions-tmp/generated-docs/development-status.md
- .github/actions-tmp/generated-docs/project-overview-generated-prompt.md
- .github/actions-tmp/generated-docs/project-overview.md
- .github/actions-tmp/generated-docs/style.css
- .github/actions-tmp/googled947dc864c270e07.html
- .github/actions-tmp/issue-notes/10.md
- .github/actions-tmp/issue-notes/11.md
- .github/actions-tmp/issue-notes/12.md
- .github/actions-tmp/issue-notes/13.md
- .github/actions-tmp/issue-notes/14.md
- .github/actions-tmp/issue-notes/15.md
- .github/actions-tmp/issue-notes/16.md
- .github/actions-tmp/issue-notes/17.md
- .github/actions-tmp/issue-notes/18.md
- .github/actions-tmp/issue-notes/19.md
- .github/actions-tmp/issue-notes/2.md
- .github/actions-tmp/issue-notes/20.md
- .github/actions-tmp/issue-notes/21.md
- .github/actions-tmp/issue-notes/22.md
- .github/actions-tmp/issue-notes/23.md
- .github/actions-tmp/issue-notes/24.md
- .github/actions-tmp/issue-notes/25.md
- .github/actions-tmp/issue-notes/26.md
- .github/actions-tmp/issue-notes/27.md
- .github/actions-tmp/issue-notes/28.md
- .github/actions-tmp/issue-notes/29.md
- .github/actions-tmp/issue-notes/3.md
- .github/actions-tmp/issue-notes/30.md
- .github/actions-tmp/issue-notes/4.md
- .github/actions-tmp/issue-notes/7.md
- .github/actions-tmp/issue-notes/8.md
- .github/actions-tmp/issue-notes/9.md
- .github/actions-tmp/package-lock.json
- .github/actions-tmp/package.json
- .github/actions-tmp/src/main.js
- .github/copilot-instructions.md
- .github/workflows/call-daily-project-summary.yml
- .github/workflows/call-issue-note.yml
- .github/workflows/call-translate-readme.yml
- .github/workflows/deploy.yml
- .gitignore
- IMPLEMENTATION_SUMMARY.md
- LIBRARY_USAGE.md
- LICENSE
- README.ja.md
- README.md
- TESTING.md
- _config.yml
- example-library-usage.html
- generated-docs/project-overview-generated-prompt.md
- index.html
- issue-notes/57.md
- issue-notes/59.md
- issue-notes/62.md
- issue-notes/64.md
- issue-notes/65.md
- issue-notes/66.md
- issue-notes/67.md
- issue-notes/68.md
- issue-notes/70.md
- issue-notes/73.md
- issue-notes/75.md
- issue-notes/77.md
- issue-notes/78.md
- issue-notes/79.md
- issue-notes/80.md
- issue-notes/81.md
- package-lock.json
- package.json
- src/AudioManager.ts
- src/DebugRenderer.ts
- src/FrequencyEstimator.ts
- src/GainController.ts
- src/Oscilloscope.ts
- src/WaveformRenderer.ts
- src/ZeroCrossDetector.ts
- src/__tests__/algorithms.test.ts
- src/__tests__/dom-integration.test.ts
- src/__tests__/library-exports.test.ts
- src/__tests__/oscilloscope.test.ts
- src/__tests__/utils.test.ts
- src/index.ts
- src/main.ts
- src/utils.ts
- tsconfig.json
- tsconfig.lib.json
- vite.config.ts

## 現在のオープンIssues
## [Issue #82](../issue-notes/82.md): Fix candidate search algorithm to compare reference waveform from previous frame
The `selectBestCandidate` method was incorrectly comparing positions within the same buffer (current frame), using `referenceIndex` as if it pointed to valid data in the current frame's buffer. This caused unstable candidate positions in the debug display, cycling between positions as the index grad...
ラベル: 
--- issue-notes/82.md の内容 ---

```markdown

```

## [Issue #81](../issue-notes/81.md): 周波数推定を今の1/60秒のframe buffer長でFFTすると、低周波において失敗しやすい。まず過去frame buferを利用した1,4,16倍のサイズを選べるようにする。さらにFFT以外に可変窓長STFTやCQTも選べるようにする
[issue-notes/81.md](https://github.com/cat2151/cat-oscilloscope/blob/main/issue-notes/81.md)

...
ラベル: 
--- issue-notes/81.md の内容 ---

```markdown
# issue 周波数推定を今の1/60秒のframe buffer長でFFTすると、低周波において失敗しやすい。まず過去frame buferを利用した1,4,16倍のサイズを選べるようにする。さらにFFT以外に可変窓長STFTやCQTも選べるようにする #81
[issues #81](https://github.com/cat2151/cat-oscilloscope/issues/81)



```

## [Issue #80](../issue-notes/80.md): 候補のend位置の算出方法がおかしい。-から+へのゼロクロスが2回ある波形において、長時間の波形と短時間の波形が両方候補に出ており推定周波数と矛盾。そうではなくendはstartプラス推定周波数ぶんの長さの位置にすべき
[issue-notes/80.md](https://github.com/cat2151/cat-oscilloscope/blob/main/issue-notes/80.md)

...
ラベル: 
--- issue-notes/80.md の内容 ---

```markdown
# issue 候補の算出方法がおかしい。常にゼロクロス単位で候補を算出しているため、-から+へのゼロクロスが2回ある波形において、長時間の波形と短時間の波形が両方候補に出ている。そうではなく常にstartがゼロクロスでendは推定周波数ぶんの長さの位置、から候補を出すべき #80
[issues #80](https://github.com/cat2151/cat-oscilloscope/issues/80)



```

## [Issue #79](../issue-notes/79.md): debug表示の候補それぞれ、類似度が80%overなのに上下反転し、そのときフレームバッファ側の候補は上下反転せず正常なことがある、つまり表示不整合がある
[issue-notes/79.md](https://github.com/cat2151/cat-oscilloscope/blob/main/issue-notes/79.md)

...
ラベル: 
--- issue-notes/79.md の内容 ---

```markdown
# issue debug表示の候補それぞれの類似度が、80%overなのに上下反転していることがあることがあり、そのときフレームバッファ側は上下反転していないことがある、つまり表示不整合がある #79
[issues #79](https://github.com/cat2151/cat-oscilloscope/issues/79)



```

## [Issue #78](../issue-notes/78.md): debug表示しているとsearch buffer上での候補startの場所が、だんだん後ろになりまた先頭に戻る、を繰り返しておりおかしい。正しくはsearch bufferの先頭から「前回波形と類似度が最高になるstart」を「endまでの長さは推定周波数ぶん」としstartを1サンプルずつ推定周波数ぶんの範囲を移動して探索すべき
[issue-notes/78.md](https://github.com/cat2151/cat-oscilloscope/blob/main/issue-notes/78.md)

...
ラベル: 
--- issue-notes/78.md の内容 ---

```markdown
# issue debug表示しているとsearch buffer上での候補の場所が、だんだん後ろになりまた先頭に戻る、を繰り返している。原因とアルゴリズムの妥当性を分析する #78
[issues #78](https://github.com/cat2151/cat-oscilloscope/issues/78)



```

## [Issue #77](../issue-notes/77.md): 一時停止していないときの見た目は正常なのに、一時停止した瞬間の波形が破綻していることが半数以上ある。そしてキーボードよりマウスのほうが破綻しやすい
[issue-notes/77.md](https://github.com/cat2151/cat-oscilloscope/blob/main/issue-notes/77.md)

...
ラベル: 
--- issue-notes/77.md の内容 ---

```markdown
# issue 一時停止していないときの見た目は正常なのに、一時停止した瞬間の波形が破綻していることが半数以上ある #77
[issues #77](https://github.com/cat2151/cat-oscilloscope/issues/77)



```

## [Issue #70](../issue-notes/70.md): wavlpfリポジトリの PR 23 を参考に、wavlpfからライブラリとして利用できるようにするための方法を検討する
[issue-notes/70.md](https://github.com/cat2151/cat-oscilloscope/blob/main/issue-notes/70.md)

...
ラベル: 
--- issue-notes/70.md の内容 ---

```markdown
# issue wavlpfリポジトリの PR 23 を参考に、wavlpfからライブラリとして利用できるようにするための方法を検討する #70
[issues #70](https://github.com/cat2151/cat-oscilloscope/issues/70)



```

## [Issue #64](../issue-notes/64.md): 位相を揃えて表示する用、類似度の高い波形を探索するときの波形周期を、「周波数から算出した周期」の1倍、2倍、3倍、4倍からプルダウンメニューで選べるようにする
[issue-notes/64.md](https://github.com/cat2151/cat-oscilloscope/blob/main/issue-notes/64.md)

...
ラベル: 
--- issue-notes/64.md の内容 ---

```markdown
# issue 自己相関判定に使う周期を、「周波数から算出した周期」の1倍、2倍、3倍、4倍からプルダウンメニューで選べるようにする #64
[issues #64](https://github.com/cat2151/cat-oscilloscope/issues/64)



```

## [Issue #31](../issue-notes/31.md): 灰色のグリッド表示が計測値と関連しておらず、userが混乱する

ラベル: good first issue
--- issue-notes/31.md の内容 ---

```markdown

```

## [Issue #28](../issue-notes/28.md): 表示文言から「Cat Oscilloscope」と「This oscilloscope visualizes audio from your microphone with zero-cross detection for stable waveform display.」をトルツメする

ラベル: good first issue
--- issue-notes/28.md の内容 ---

```markdown

```

## ドキュメントで言及されているファイルの内容
### .github/actions-tmp/issue-notes/2.md
```md
{% raw %}
# issue GitHub Actions「関数コールグラフhtmlビジュアライズ生成」を共通ワークフロー化する #2
[issues #2](https://github.com/cat2151/github-actions/issues/2)


# prompt
```
あなたはGitHub Actionsと共通ワークフローのスペシャリストです。
このymlファイルを、以下の2つのファイルに分割してください。
1. 共通ワークフロー       cat2151/github-actions/.github/workflows/callgraph_enhanced.yml
2. 呼び出し元ワークフロー cat2151/github-actions/.github/workflows/call-callgraph_enhanced.yml
まずplanしてください
```

# 結果
- indent
    - linter？がindentのエラーを出しているがyml内容は見た感じOK
    - テキストエディタとagentの相性問題と判断する
    - 別のテキストエディタでsaveしなおし、テキストエディタをreload
    - indentのエラーは解消した
- LLMレビュー
    - agent以外の複数のLLMにレビューさせる
    - prompt
```
あなたはGitHub Actionsと共通ワークフローのスペシャリストです。
以下の2つのファイルをレビューしてください。最優先で、エラーが発生するかどうかだけレビューしてください。エラー以外の改善事項のチェックをするかわりに、エラー発生有無チェックに最大限注力してください。

--- 共通ワークフロー

# GitHub Actions Reusable Workflow for Call Graph Generation
name: Generate Call Graph

# TODO Windowsネイティブでのtestをしていた名残が残っているので、今後整理していく。今はWSL act でtestしており、Windowsネイティブ環境依存問題が解決した
#  ChatGPTにレビューさせるとそこそこ有用そうな提案が得られたので、今後それをやる予定
#  agentに自己チェックさせる手も、セカンドオピニオンとして選択肢に入れておく

on:
  workflow_call:

jobs:
  check-commits:
    runs-on: ubuntu-latest
    outputs:
      should-run: ${{ steps.check.outputs.should-run }}
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 50 # 過去のコミットを取得

      - name: Check for user commits in last 24 hours
        id: check
        run: |
          node .github/scripts/callgraph_enhanced/check-commits.cjs

  generate-callgraph:
    needs: check-commits
    if: needs.check-commits.outputs.should-run == 'true'
    runs-on: ubuntu-latest
    permissions:
      contents: write
      security-events: write
      actions: read

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set Git identity
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

      - name: Remove old CodeQL packages cache
        run: rm -rf ~/.codeql/packages

      - name: Check Node.js version
        run: |
          node .github/scripts/callgraph_enhanced/check-node-version.cjs

      - name: Install CodeQL CLI
        run: |
          wget https://github.com/github/codeql-cli-binaries/releases/download/v2.22.1/codeql-linux64.zip
          unzip codeql-linux64.zip
          sudo mv codeql /opt/codeql
          echo "/opt/codeql" >> $GITHUB_PATH

      - name: Install CodeQL query packs
        run: |
          /opt/codeql/codeql pack install .github/codeql-queries

      - name: Check CodeQL exists
        run: |
          node .github/scripts/callgraph_enhanced/check-codeql-exists.cjs

      - name: Verify CodeQL Configuration
        run: |
          node .github/scripts/callgraph_enhanced/analyze-codeql.cjs verify-config

      - name: Remove existing CodeQL DB (if any)
        run: |
          rm -rf codeql-db

      - name: Perform CodeQL Analysis
        run: |
          node .github/scripts/callgraph_enhanced/analyze-codeql.cjs analyze

      - name: Check CodeQL Analysis Results
        run: |
          node .github/scripts/callgraph_enhanced/analyze-codeql.cjs check-results

      - name: Debug CodeQL execution
        run: |
          node .github/scripts/callgraph_enhanced/analyze-codeql.cjs debug

      - name: Wait for CodeQL results
        run: |
          node -e "setTimeout(()=>{}, 10000)"

      - name: Find and process CodeQL results
        run: |
          node .github/scripts/callgraph_enhanced/find-process-results.cjs

      - name: Generate HTML graph
        run: |
          node .github/scripts/callgraph_enhanced/generate-html-graph.cjs

      - name: Copy files to generated-docs and commit results
        run: |
          node .github/scripts/callgraph_enhanced/copy-commit-results.cjs

--- 呼び出し元
# 呼び出し元ワークフロー: call-callgraph_enhanced.yml
name: Call Call Graph Enhanced

on:
  schedule:
    # 毎日午前5時(JST) = UTC 20:00前日
    - cron: '0 20 * * *'
  workflow_dispatch:

jobs:
  call-callgraph-enhanced:
    # uses: cat2151/github-actions/.github/workflows/callgraph_enhanced.yml
    uses: ./.github/workflows/callgraph_enhanced.yml # ローカルでのテスト用
```

# レビュー結果OKと判断する
- レビュー結果を人力でレビューした形になった

# test
- #4 同様にローカル WSL + act でtestする
- エラー。userのtest設計ミス。
  - scriptの挙動 : src/ がある前提
  - 今回の共通ワークフローのリポジトリ : src/ がない
  - 今回testで実現したいこと
    - 仮のソースでよいので、関数コールグラフを生成させる
  - 対策
    - src/ にダミーを配置する
- test green
  - ただしcommit pushはしてないので、html内容が0件NG、といったケースの検知はできない
  - もしそうなったら別issueとしよう

# test green

# commit用に、yml 呼び出し元 uses をlocal用から本番用に書き換える

# closeとする
- もしhtml内容が0件NG、などになったら、別issueとするつもり

{% endraw %}
```

### .github/actions-tmp/issue-notes/28.md
```md
{% raw %}
# issue 直近24時間でuser commitがあるかどうか、のチェックを、workflowのjobs先頭に新規jobを追加して実施し、本体jobの先頭にneedsを書く #28
[issues #28](https://github.com/cat2151/github-actions/issues/28)

# これまでの課題は？
- これまでは各workflow内の終盤のscriptにバラバラに実装されていたので、
    - ムダにcheckout等、各種処理が走っていた

# 対策案は？
- 直近24時間でuser commitがあるかどうか、
    - のチェックを、
        - workflowのjobs先頭に新規jobを追加して実施し、
            - 本体jobの先頭にneedsを書く
- この対策で、各workflow先頭にこれを書くだけでよくなり、エコになる想定

# ChatGPTに生成させた
## 呼び出し元のサンプル
- 実際には、共通workflowのjobsの先頭付近を、このサンプルを参考に書き換えるイメージ
```
jobs:
  check_recent_human_commit:
    uses: ./.github/workflows/check-recent-human-commit.yml

  build:
    needs: check_recent_human_commit
    if: needs.check_recent_human_commit.outputs.has_recent_human_commit == 'true'
    runs-on: ubuntu-latest
    steps:
      - name: Run build
        run: echo "Building because there is a recent human commit!"
```
## 共通ワークフロー側の案
- シンプルにmailのみを条件とし、mailも1種類のみに明示する
```
name: "Check recent human commit"

on:
  workflow_call:

jobs:
  check-recent-human-commit:
    runs-on: ubuntu-latest
    outputs:
      has_recent_human_commit: ${{ steps.check.outputs.has_recent_human_commit }}
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Check recent human commit
        id: check
        run: |
          set -e

          HAS_HUMAN=false

          while IFS=$'\x01' read -r HASH NAME EMAIL SUBJECT; do
            SUBJECT="${SUBJECT%$'\x02'}"

            if [[ ! "$EMAIL" =~ ^41898282\+github-actions\[bot\]@users\.noreply\.github\.com$ ]]; then
              echo "HUMAN: Commit $HASH | Author: $NAME <$EMAIL> | Message: $SUBJECT"
              HAS_HUMAN=true
              break
            else
              echo "BOT: Commit $HASH | Author: $NAME <$EMAIL> | Message: $SUBJECT"
            fi
          done <<< "$(git log --since="24 hours ago" --pretty=format:'%H%x01%an%x01%ae%x01%s%x02')"

          if [ "$HAS_HUMAN" = true ]; then
            echo "Found recent human commit."
            echo "has_recent_human_commit=true" >> $GITHUB_OUTPUT
          else
            echo "No human commits in last 24h."
            echo "has_recent_human_commit=false" >> $GITHUB_OUTPUT
```
## 備忘
- 上記はChatGPTに生成させ、それをレビューさせて改善させる、のサイクルで生成した。
    - 一発で生成はできなかった
    - ChatGPTが自分で生成したものに対して自己レビューでミスや改善点が多発していた
        - ブレも発生し、二転三転気味でもあり、
            - ハルシネーションに近い低品質状態だと感じた
                - これは経験則からの感覚的なもの
    - 生成の品質が低い、ということ
        - LLMはまだ学習不足、github-actions workflow yml の学習不足である、と解釈する
        - shell scriptの生成品質も低いかも。
            - もともとshell scriptで複雑なlogicを書くとtest costが高い、なぜなら読みづらいから。
                - なのでロジックをcjs側に切り出したほうが全体最適の観点からよりよい、と考える

# どうする？
- shell scriptはやめて、cjsでlogicを担当させる。
  - 現状のshell scriptを改めて見直すと、これはcjs側にしたほうがよい、と感覚的に、経験則で、わかる。
- logicをcjs側に切り出す。実際、既存でgitの24hチェックをcjs側でやっている実績がある。そこのロジックを参考にする。
- 今のmdの仕様をもとに、ymlとcjsを生成させる。
- 生成させた。ChatGPTに投げた
- 人力でいくつか変更したり、ChatGPTに投げて修正させるサイクルを回したりした
- testする

# バグ
- 結果、バグがあったのでagentにlogを投げ、修正させ、人力修正し、agentにセルフレビューさせ、のサイクルを回した
- testする
- 結果、callgraphで、エラーなくhumanを検知したが、callgraphが呼ばれない、というバグが発生
- ひとまずagentの提案したcodeを切り分けのため試す、バグ状況は変わらない想定
- 結果、バグ状況は変わらず
- 対策、trueのlogをagentに投げて、callgraphが呼ばれないことを伝え、可視化を実装させた
- testする
- 結果、バグ状況は変わらず
- 対策、logをagentに投げて、callgraphが呼ばれないことを伝え、さらに可視化を実装させた
- testする
- 結果、バグ状況は変わらず
- 対策、logをagentに投げて、callgraphが呼ばれないことを伝え、さらに可視化を実装させた
- testする
- 結果、バグ状況は変わらず
- 対策、logをagentに投げて、callgraphが呼ばれないことを伝えた
- ここで、根本的にymlのworkflow記述が間違っていることが判明
  - agentが最初にcode生成したときから根本的なバグが仕込まれていたということ。
    - agentの学習不足。github-actionsのworkflowの学習不足。
- そこをagentに修正させ、test greenとなった

# closeとする

{% endraw %}
```

### .github/actions-tmp/issue-notes/4.md
```md
{% raw %}
# issue GitHub Actions「project概要生成」を共通ワークフロー化する #4
[issues #4](https://github.com/cat2151/github-actions/issues/4)

# prompt
```
あなたはGitHub Actionsと共通ワークフローのスペシャリストです。
このymlファイルを、以下の2つのファイルに分割してください。
1. 共通ワークフロー       cat2151/github-actions/.github/workflows/daily-project-summary.yml
2. 呼び出し元ワークフロー cat2151/github-actions/.github/workflows/call-daily-project-summary.yml
まずplanしてください
```

# 結果、あちこちハルシネーションのあるymlが生成された
- agentの挙動があからさまにハルシネーション
    - インデントが修正できない、「失敗した」という
    - 構文誤りを認識できない
- 人力で修正した

# このagentによるセルフレビューが信頼できないため、別のLLMによるセカンドオピニオンを試す
```
あなたはGitHub Actionsと共通ワークフローのスペシャリストです。
以下の2つのファイルをレビューしてください。最優先で、エラーが発生するかどうかだけレビューてください。エラー以外の改善事項のチェックをするかわりに、エラー発生有無チェックに最大限注力してください。

--- 呼び出し元

name: Call Daily Project Summary

on:
  schedule:
    # 日本時間 07:00 (UTC 22:00 前日)
    - cron: '0 22 * * *'
  workflow_dispatch:

jobs:
  call-daily-project-summary:
    uses: cat2151/github-actions/.github/workflows/daily-project-summary.yml
    secrets:
      GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}

--- 共通ワークフロー
name: Daily Project Summary
on:
  workflow_call:

jobs:
  generate-summary:
    runs-on: ubuntu-latest

    permissions:
      contents: write
      issues: read
      pull-requests: read

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          fetch-depth: 0  # 履歴を取得するため

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          # 一時的なディレクトリで依存関係をインストール
          mkdir -p /tmp/summary-deps
          cd /tmp/summary-deps
          npm init -y
          npm install @google/generative-ai @octokit/rest
          # generated-docsディレクトリを作成
          mkdir -p $GITHUB_WORKSPACE/generated-docs

      - name: Generate project summary
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_REPOSITORY: ${{ github.repository }}
          NODE_PATH: /tmp/summary-deps/node_modules
        run: |
          node .github/scripts/generate-project-summary.cjs

      - name: Check for generated summaries
        id: check_summaries
        run: |
          if [ -f "generated-docs/project-overview.md" ] && [ -f "generated-docs/development-status.md" ]; then
            echo "summaries_generated=true" >> $GITHUB_OUTPUT
          else
            echo "summaries_generated=false" >> $GITHUB_OUTPUT
          fi

      - name: Commit and push summaries
        if: steps.check_summaries.outputs.summaries_generated == 'true'
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          # package.jsonの変更のみリセット（generated-docsは保持）
          git restore package.json 2>/dev/null || true
          # サマリーファイルのみを追加
          git add generated-docs/project-overview.md
          git add generated-docs/development-status.md
          git commit -m "Update project summaries (overview & development status)"
          git push

      - name: Summary generation result
        run: |
          if [ "${{ steps.check_summaries.outputs.summaries_generated }}" == "true" ]; then
            echo "✅ Project summaries updated successfully"
            echo "📊 Generated: project-overview.md & development-status.md"
          else
            echo "ℹ️ No summaries generated (likely no user commits in the last 24 hours)"
          fi
```

# 上記promptで、2つのLLMにレビューさせ、合格した

# 細部を、先行する2つのymlを参照に手直しした

# ローカルtestをしてからcommitできるとよい。方法を検討する
- ローカルtestのメリット
    - 素早く修正のサイクルをまわせる
    - ムダにgit historyを汚さない
        - これまでの事例：「実装したつもり」「エラー。修正したつもり」「エラー。修正したつもり」...（以降エラー多数）
- 方法
    - ※検討、WSL + act を環境構築済みである。test可能であると判断する
    - 呼び出し元のURLをコメントアウトし、相対パス記述にする
    - ※備考、テスト成功すると結果がcommit pushされる。それでよしとする
- 結果
    - OK
    - secretsを簡略化できるか試した、できなかった、現状のsecrets記述が今わかっている範囲でベストと判断する
    - OK

# test green

# commit用に、yml 呼び出し元 uses をlocal用から本番用に書き換える

# closeとする

{% endraw %}
```

### .github/actions-tmp/issue-notes/7.md
```md
{% raw %}
# issue issue note生成できるかのtest用 #7
[issues #7](https://github.com/cat2151/github-actions/issues/7)

- 生成できた
- closeとする

{% endraw %}
```

### .github/actions-tmp/issue-notes/8.md
```md
{% raw %}
# issue 関数コールグラフhtmlビジュアライズ生成の対象ソースファイルを、呼び出し元ymlで指定できるようにする #8
[issues #8](https://github.com/cat2151/github-actions/issues/8)

# これまでの課題
- 以下が決め打ちになっていた
```
  const allowedFiles = [
    'src/main.js',
    'src/mml2json.js',
    'src/play.js'
  ];
```

# 対策
- 呼び出し元ymlで指定できるようにする

# agent
- agentにやらせることができれば楽なので、初手agentを試した
- 失敗
    - ハルシネーションしてscriptを大量破壊した
- 分析
    - 修正対象scriptはagentが生成したもの
    - 低品質な生成結果でありソースが巨大
    - ハルシネーションで破壊されやすいソース
    - AIの生成したソースは、必ずしもAIフレンドリーではない

# 人力リファクタリング
- 低品質コードを、最低限agentが扱えて、ハルシネーションによる大量破壊を防止できる内容、にする
- 手短にやる
    - そもそもビジュアライズは、agentに雑に指示してやらせたもので、
    - 今後別のビジュアライザを選ぶ可能性も高い
    - 今ここで手間をかけすぎてコンコルド効果（サンクコストバイアス）を増やすのは、project群をトータルで俯瞰して見たとき、損
- 対象
    - allowedFiles のあるソース
        - callgraph-utils.cjs
            - たかだか300行未満のソースである
            - この程度でハルシネーションされるのは予想外
            - やむなし、リファクタリングでソース分割を進める

# agentに修正させる
## prompt
```
allowedFilesを引数で受け取るようにしたいです。
ないならエラー。
最終的に呼び出し元すべてに波及して修正したいです。

呼び出し元をたどってエントリポイントも見つけて、
エントリポイントにおいては、
引数で受け取ったjsonファイル名 allowedFiles.js から
jsonファイル allowedFiles.jsonの内容をreadして
変数 allowedFilesに格納、
後続処理に引き渡す、としたいです。

まずplanしてください。
planにおいては、修正対象のソースファイル名と関数名を、呼び出し元を遡ってすべて特定し、listしてください。
```

# 修正が順調にできた
- コマンドライン引数から受け取る作りになっていなかったので、そこだけ指示して修正させた
- yml側は人力で修正した

# 他のリポジトリから呼び出した場合にバグらないよう修正する
- 気付いた
    - 共通ワークフローとして他のリポジトリから使った場合はバグるはず。
        - ymlから、共通ワークフロー側リポジトリのcheckoutが漏れているので。
- 他のyml同様に修正する
- あわせて全体にymlをリファクタリングし、修正しやすくし、今後のyml読み書きの学びにしやすくする

# local WSL + act : test green

# closeとする
- もし生成されたhtmlがNGの場合は、別issueとするつもり

{% endraw %}
```

### .github/actions-tmp/issue-notes/9.md
```md
{% raw %}
# issue 関数コールグラフhtmlビジュアライズが0件なので、原因を可視化する #9
[issues #9](https://github.com/cat2151/github-actions/issues/9)

# agentに修正させたり、人力で修正したりした
- agentがハルシネーションし、いろいろ根の深いバグにつながる、エラー隠蔽などを仕込んでいたため、検知が遅れた
- 詳しくはcommit logを参照のこと
- WSL + actの環境を少し変更、act起動時のコマンドライン引数を変更し、generated-docsをmountする（ほかはデフォルト挙動であるcpだけにする）ことで、デバッグ情報をコンテナ外に出力できるようにし、デバッグを効率化した

# test green

# closeとする

{% endraw %}
```

### issue-notes/64.md
```md
{% raw %}
# issue 自己相関判定に使う周期を、「周波数から算出した周期」の1倍、2倍、3倍、4倍からプルダウンメニューで選べるようにする #64
[issues #64](https://github.com/cat2151/cat-oscilloscope/issues/64)



{% endraw %}
```

### issue-notes/70.md
```md
{% raw %}
# issue wavlpfリポジトリの PR 23 を参考に、wavlpfからライブラリとして利用できるようにするための方法を検討する #70
[issues #70](https://github.com/cat2151/cat-oscilloscope/issues/70)



{% endraw %}
```

### issue-notes/77.md
```md
{% raw %}
# issue 一時停止していないときの見た目は正常なのに、一時停止した瞬間の波形が破綻していることが半数以上ある #77
[issues #77](https://github.com/cat2151/cat-oscilloscope/issues/77)



{% endraw %}
```

### issue-notes/78.md
```md
{% raw %}
# issue debug表示しているとsearch buffer上での候補の場所が、だんだん後ろになりまた先頭に戻る、を繰り返している。原因とアルゴリズムの妥当性を分析する #78
[issues #78](https://github.com/cat2151/cat-oscilloscope/issues/78)



{% endraw %}
```

### issue-notes/79.md
```md
{% raw %}
# issue debug表示の候補それぞれの類似度が、80%overなのに上下反転していることがあることがあり、そのときフレームバッファ側は上下反転していないことがある、つまり表示不整合がある #79
[issues #79](https://github.com/cat2151/cat-oscilloscope/issues/79)



{% endraw %}
```

### issue-notes/80.md
```md
{% raw %}
# issue 候補の算出方法がおかしい。常にゼロクロス単位で候補を算出しているため、-から+へのゼロクロスが2回ある波形において、長時間の波形と短時間の波形が両方候補に出ている。そうではなく常にstartがゼロクロスでendは推定周波数ぶんの長さの位置、から候補を出すべき #80
[issues #80](https://github.com/cat2151/cat-oscilloscope/issues/80)



{% endraw %}
```

### issue-notes/81.md
```md
{% raw %}
# issue 周波数推定を今の1/60秒のframe buffer長でFFTすると、低周波において失敗しやすい。まず過去frame buferを利用した1,4,16倍のサイズを選べるようにする。さらにFFT以外に可変窓長STFTやCQTも選べるようにする #81
[issues #81](https://github.com/cat2151/cat-oscilloscope/issues/81)



{% endraw %}
```

## 最近の変更（過去7日間）
### コミット履歴:
d6dae94 Add issue note for #81 [auto]
373db8c Add issue note for #80 [auto]
0de0611 Add issue note for #79 [auto]
80a257f Add issue note for #78 [auto]
1e3185a Add issue note for #77 [auto]
386ea15 Merge pull request #76 from cat2151/copilot/adjust-waveform-layout
a3e4f2a Implement 2-row debug waveform layout with similarity scores
bb032a0 Initial plan
8ec2104 Add issue note for #75 [auto]
ef5630f Merge pull request #74 from cat2151/copilot/normalize-debug-waveform-amplitude

### 変更されたファイル:
issue-notes/75.md
issue-notes/77.md
issue-notes/78.md
issue-notes/79.md
issue-notes/80.md
issue-notes/81.md
src/DebugRenderer.ts
src/Oscilloscope.ts


---
Generated at: 2026-01-05 07:08:28 JST
