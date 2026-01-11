Last updated: 2026-01-12

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
- CONSOLIDATION_SUMMARY.md
- IMPLEMENTATION_NOTES_117.md
- IMPLEMENTATION_SUMMARY.md
- LIBRARY_USAGE.md
- LICENSE
- README.ja.md
- README.md
- REFACTORING_SUMMARY.md
- TESTING.md
- _config.yml
- example-library-usage.html
- generated-docs/project-overview-generated-prompt.md
- index.html
- issue-notes/101.md
- issue-notes/102.md
- issue-notes/105.md
- issue-notes/107.md
- issue-notes/110.md
- issue-notes/115.md
- issue-notes/117.md
- issue-notes/119.md
- issue-notes/120.md
- issue-notes/123.md
- issue-notes/125.md
- issue-notes/127.md
- issue-notes/129.md
- issue-notes/130.md
- issue-notes/132.md
- issue-notes/133.md
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
- issue-notes/83.md
- issue-notes/85.md
- issue-notes/86.md
- issue-notes/88.md
- issue-notes/90.md
- issue-notes/91.md
- issue-notes/92.md
- issue-notes/93.md
- issue-notes/96.md
- package-lock.json
- package.json
- public/wasm/package.json
- public/wasm/wasm_processor.d.ts
- public/wasm/wasm_processor.js
- public/wasm/wasm_processor_bg.wasm
- public/wasm/wasm_processor_bg.wasm.d.ts
- src/AudioManager.ts
- src/ComparisonPanelRenderer.ts
- src/FrequencyEstimator.ts
- src/GainController.ts
- src/Oscilloscope.ts
- src/PianoKeyboardRenderer.ts
- src/WaveformDataProcessor.ts
- src/WaveformRenderData.ts
- src/WaveformRenderer.ts
- src/WaveformSearcher.ts
- src/ZeroCrossDetector.ts
- src/__tests__/algorithms.test.ts
- src/__tests__/comparison-panel-renderer.test.ts
- src/__tests__/dom-integration.test.ts
- src/__tests__/library-exports.test.ts
- src/__tests__/oscilloscope.test.ts
- src/__tests__/piano-keyboard-renderer.test.ts
- src/__tests__/utils.test.ts
- src/__tests__/waveform-data-processor.test.ts
- src/__tests__/waveform-renderer.test.ts
- src/__tests__/waveform-searcher.test.ts
- src/index.ts
- src/main.ts
- src/utils.ts
- tsconfig.json
- tsconfig.lib.json
- vite.config.ts
- wasm-processor/Cargo.toml
- wasm-processor/src/frequency_estimator.rs
- wasm-processor/src/gain_controller.rs
- wasm-processor/src/lib.rs
- wasm-processor/src/waveform_searcher.rs
- wasm-processor/src/zero_cross_detector.rs

## 現在のオープンIssues
## [Issue #129](../issue-notes/129.md): ライブラリ化の前に一度、全体を通してメイン用途における致命的なバグがないかの動作確認をする
[issue-notes/129.md](https://github.com/cat2151/cat-oscilloscope/blob/main/issue-notes/129.md)

...
ラベル: 
--- issue-notes/129.md の内容 ---

```markdown
# issue ライブラリ化の前に一度、全体を通してメイン用途における致命的なバグがないかの動作確認をする #129
[issues #129](https://github.com/cat2151/cat-oscilloscope/issues/129)



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

## ドキュメントで言及されているファイルの内容
### .github/actions-tmp/issue-notes/29.md
```md
{% raw %}
# issue project-overviewで、Nuked-OPMを使ったプロジェクトが、ハルシネーションでTone.jsと表示されてしまっている #29
[issues #29](https://github.com/cat2151/github-actions/issues/29)

# 分析
- 技術スタック欄について、
    - agentが実装した、
        - 今までの実装そのものに問題がある
- 問題
    - ハードコーディングされた「Tone.js」
    - などの文字列を使って、
    - 「検出」をしている
    - メンテ必須になるし、新たな音楽ライブラリに対応できない（今回の問題はこれ）
- 考え方
    - 根本的に「技術スタック説明に、ハードコーディングされたlistベースの検出を入れようとした」のが間違い
    - デメリットが大きすぎて、逆効果になっている

# 対策
- 技術スタック欄について、「検出」機能を削除する
    - LLMには、「README、ソースのtree、ソースの呼び出し階層tree」がわたる
        - LLMは、それを元に、LLMの知識による技術スタック説明を生成する

# close条件
- 当該プロジェクトの、project-overviewの生成結果において、ハルシネーションの「Tone.js」が出力されないこと
- ついでに
    - READMEの文字数制限を撤廃した。
        - より高精度な生成を可能にするため。Geminiなので入力データ量に余裕があるので。
        - 結果、READMEが全量出力され、体感で生成品質が向上したこと
    - promptをcommit pushするようにした。
        - より高精度な生成のため。本件のような場合の調査を効率化するため。
        - 結果、promptが出力されること

# test green

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

### issue-notes/129.md
```md
{% raw %}
# issue ライブラリ化の前に一度、全体を通してメイン用途における致命的なバグがないかの動作確認をする #129
[issues #129](https://github.com/cat2151/cat-oscilloscope/issues/129)



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

## 最近の変更（過去7日間）
### コミット履歴:
cbd76dd Merge pull request #135 from cat2151/copilot/analyze-oscilloscope-waveform-issue
0625287 Fix: Display 4 cycles consistently in zero-cross detection mode
5be5f7a Initial plan
2ddfd2e Update project summaries (overview & development status) [auto]
2128160 Merge pull request #134 from cat2151/copilot/update-bar-graph-position
fc36824 Fix: Move similarity plot to third canvas in comparison panel (line chart format)
a319f6e Add safety check to prevent division by zero in bar spacing calculation
c867ee0 Update tests and add documentation for similarity bar visualization
b8bceec Fix bar height calculation in similarity bar graph
97e7718 Move similarity bar graph to comparison panel canvases

### 変更されたファイル:
generated-docs/development-status-generated-prompt.md
generated-docs/development-status.md
generated-docs/project-overview-generated-prompt.md
generated-docs/project-overview.md
index.html
issue-notes/130.md
issue-notes/132.md
issue-notes/133.md
public/wasm/wasm_processor_bg.wasm
src/ComparisonPanelRenderer.ts
src/GainController.ts
src/Oscilloscope.ts
src/WaveformRenderer.ts
src/__tests__/comparison-panel-renderer.test.ts
src/__tests__/dom-integration.test.ts
src/__tests__/oscilloscope.test.ts
src/main.ts
wasm-processor/src/zero_cross_detector.rs


---
Generated at: 2026-01-12 07:08:13 JST
