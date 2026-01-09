Last updated: 2026-01-10

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
- src/WasmDataProcessor.ts
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
- src/__tests__/wasm-data-processor.test.ts
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
## [Issue #121](../issue-notes/121.md): Fix WASM frequency plot history being cleared every frame
The issue reported that the frequency transition graph line chart doesn't display when using Rust WASM. Investigation revealed an actual bug where the frequency history was being cleared every frame.

## Root Cause

The bug was in `WasmDataProcessor.ts`. The `syncConfigToWasm()` method was being cal...
ラベル: 
--- issue-notes/121.md の内容 ---

```markdown

```

## [Issue #120](../issue-notes/120.md): Rust WASM時、周波数推移グラフの折れ線グラフが表示されない（あるいは上か下に張り付いているのかもしれないが見た目では判断できなかった）
[issue-notes/120.md](https://github.com/cat2151/cat-oscilloscope/blob/main/issue-notes/120.md)

...
ラベル: 
--- issue-notes/120.md の内容 ---

```markdown
# issue Rust WASM時、周波数推移グラフの折れ線グラフが表示されない（あるいは上か下に張り付いているのかもしれないが見た目では判断できなかった） #120
[issues #120](https://github.com/cat2151/cat-oscilloscope/issues/120)



```

## [Issue #119](../issue-notes/119.md): （Rust WASM版が一通り動いたのを確認したら）Rust WASMとTypeScript両方にある機能は、Rust WASMに一本化し、多重メンテによるトラブルを防止する
[issue-notes/119.md](https://github.com/cat2151/cat-oscilloscope/blob/main/issue-notes/119.md)

...
ラベル: 
--- issue-notes/119.md の内容 ---

```markdown
# issue （Rust WASM版が一通り動いたのを確認したら）Rust WASMとTypeScript両方にある機能は、Rust WASMに一本化し、多重メンテによるトラブルを防止する #119
[issues #119](https://github.com/cat2151/cat-oscilloscope/issues/119)



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
### .github/actions-tmp/issue-notes/19.md
```md
{% raw %}
# issue project-summary の development-status 生成時、issue-notes/ 配下のmdファイルの内容を参照させる #19
[issues #19](https://github.com/cat2151/github-actions/issues/19)

# 何が困るの？
- issue解決に向けての次の一手の内容が実態に即していないことが多い。

# 対策案
- issue-notes/ 配下のmdファイルの内容を参照させる

# 備考
- さらにmd内に書かれているfileも、project内をcjsに検索させて添付させると、よりGeminiの生成品質が向上する可能性がある。
    - [issues #20](https://github.com/cat2151/github-actions/issues/20)
- さらにproject overviewでGeminiがまとめたmdも、Geminiに与えると、よりGeminiの生成品質が向上する可能性がある。
    - [issues #21](https://github.com/cat2151/github-actions/issues/21)
- さらに、Geminiに与えたpromptをfileにしてcommit pushしておくと、デバッグに役立つ可能性がある。
    - [issues #22](https://github.com/cat2151/github-actions/issues/22)

# close条件
- issues #22 がcloseされること。
- commitされたpromptを確認し、issue-notes/ 配下のmdファイルがpromptに添付されていること、が確認できること。

# 状況
- 課題、実装したがtestができていない
- 対策、issues #22 が実装されれば、testができる
- 対策、issues #22 のcloseを待つ

# 状況
- issues #22 がcloseされた
- testできるようになった
- commitされたpromptを確認した。issue-notes/ 配下のmdファイルがpromptに添付されていること、が確認できた

# closeする

{% endraw %}
```

### .github/actions-tmp/issue-notes/20.md
```md
{% raw %}
# issue project-summary の development-status 生成時、issue-notes/ 配下のmdにファイル名が書いてあれば、そのファイル内容もpromptに添付、を試す #20
[issues #20](https://github.com/cat2151/github-actions/issues/20)

# 何が困るの？
- Geminiに次の一手を生成させるとき、cjsの内容も添付したほうが、生成品質が改善できる可能性がある。

# 案
## outputのimage
- promptが言及するfilename、について、そのfileの内容もすべてpromptに含める。
    - 軸は、projectのfilename一覧である。
        - 一覧それぞれのfilenameについて、promptで言及されているものをfile内容埋め込み、とする。
- 方向性
    - シンプルで明確なルール、曖昧さのないルールで、メンテを楽にすることを優先する
    - 余分なファイルが出てしまうが割り切ってOKとし、欠落リスクを減らせることを優先する
- 備考
    - 曖昧でメンテが必要な「documentからのfilename抽出」をやめ、
        - かわりに、逆に、「今のprojectにあるfileすべてのうち、promptで言及されているもの」を軸とする
## 実現方法の案
- project全体について、filenameと、filepath配列（複数ありうる）、のmapを取得する。そういう関数Aをまず実装する。
    - filepathは、agentが扱えるよう、github上のworkの絶対pathではなく、projectRootからの相対パス表記とする。
- そして、そのfilenameにmatchするfilepath配列について、filepathとファイル内容を記したmarkdown文字列を返却、という関数Bを実装する。
- さらに、Geminiにわたすpromptについて、前述の関数Aのfilenameそれぞれについて、prompt内を検索し、filenameが存在する場合は、そのfilenameについて、関数Bを用いてmarkdown文字列を取得する。そうして得られたmarkdown文字列群を返却する、という関数Cを実装する。
- さらに、promptの末尾に書いてあるプレースホルダー「`${file_contents}`」を、関数Cの結果で置き換える、という関数Dを実装する。
- 実際には、Geminiにわたすpromptのプレースホルダー展開は、2回にわたる必要がある。1回目でissues-note内容をpromptに埋め込む。2回目でそのpromptに対して関数Dを適用する。
## 備忘
- 上記は、agentにplanさせてレビューし、context不足と感じたら上記をメンテ、というサイクルで書いた。

# どうする？
- 上記をagentに投げる。documentやtestについてのplanもしてくるかもしれないがそこは時間の都合で省略して実施させるつもり。
- 投げた、実装させた、レビューして人力リファクタリングした
- testする

# 結果
- バグ
    - この20.mdにあるプレースホルダーが置換されてしまっている
    - issue-notesで言及されていないfileまで添付されてしまっている
- 分析
    - この20.mdにあるプレースホルダーが置換されてしまっている
        - 原因
            - 20.mdにあるプレースホルダーまで置換対象としてしまっていたため。
            - prompt全体のプレースホルダーを置換対象としてしまっていたため。
            - issue-notesを埋め込んだあとでの、プレースホルダー処理だったので、
                - 20.md が置換対象となってしまったため。
        - 対策案
            - プレースホルダーはすべて、「行頭と行末で囲まれている」ときだけ置換対象とする。
                - つまり文中やcode中のプレースホルダーは置換対象外とする。
            - さらに、2つ以上プレースホルダーが出たら想定外なので早期エラー終了させ、検知させる。
    - issue-notesで言及されていないfileまで添付されてしまっている
        - 原因
            - promptに、既にprojectの全file listが書き込まれたあとなので、
                - issue-noteで言及されていなくても、
                - promptの全file listを対象に検索してしまっている
        - 対策案の候補
            - プレースホルダー置換の順番を変更し、全file listは最後に置換する
            - file添付の対象を変更し、promptでなく、issue-notesとする
                - これが範囲が絞られているので安全である、と考える
        - 備忘
            - 全fileの対象は、リモートリポジトリ側のfileなので、secretsの心配はないし、実際に検索して確認済み

# どうする？
- agent半分、人力が半分（agentがハルシネーションでソース破壊したので、関数切り分けしたり、リファクタリングしたり）。
- で実装した。
- testする

# 結果
- test green

# closeとする

{% endraw %}
```

### .github/actions-tmp/issue-notes/21.md
```md
{% raw %}
# issue project-summary の development-status 生成時、project-overviewが生成済みのproject-overview.mdもpromptに添付、を試す #21
[issues #21](https://github.com/cat2151/github-actions/issues/21)

# 何が困るの？
- project-overview.mdがpromptに添付されていたほうが、Geminiの生成品質が改善できる可能性がある。
    - メリットは、ファイル一覧、関数一覧、をGeminiにわたせること

# 検討事項
- 課題、その一覧に付記されている「ファイルや関数の要約」は、Geminiが「ファイル名や関数名を元に生成しただけ」で、「ファイル内容や関数内容を参照せずに生成した」可能性が高い
    - 対策、project-overview.mdに依存しない。
        - 方法、新規関数をagentに実装させる
            - 新規関数で、ファイル一覧と関数一覧を生成する
        - 根拠、そのほうが、シンプルに目的を達成できる可能性が高そう。
        - 根拠、project-overview.mdだと、不具合として.github 配下のymlがlistに含まれておらず、ymlに関するissue、に関する生成、をするとき不具合の可能性がありそう。そういった、別機能の不具合に影響されがち。
- 課題、早期に実施したほうが毎日好影響が出る可能性がある
    - 対策、上記検討事項の対処は後回しにして、先に実装してみる
    - agentに投げる
- 課題、ProjectSummaryCoordinator をみたところ、並列処理されている
    - なので、project-overview.mdを参照したいときに、まだ生成されていない、という可能性が高い
    - 対策、前述の、新規関数で、ファイル一覧と関数一覧を生成させる

# agentに投げるための整理
- 編集対象ファイル
    - prompt
        - .github_automation/project_summary/prompts/development-status-prompt.md
        - 編集内容
            - projectのファイル一覧を埋め込む用の、プレースホルダーを追加する
    - source
        - .github_automation/project_summary/scripts/development/DevelopmentStatusGenerator.cjs
        - 編集内容
            - projectのファイル一覧を生成する関数、を実装し、
            - それを前述のプレースホルダーに埋め込む

# agentに投げて実装させた

# test結果
- 以下が不要
    - .git/
    - node_modules/

# どうする？
- agentに上記を変更させた
- testする

# 結果
- test greenとなった

# まとめ
- issueのtitleからは仕様変更した。
    - projectのfile一覧をpromptに含める、とした。
    - そのほうがpromptとして、よい生成結果が期待できる、と判断した。
- test greenとなった

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

### issue-notes/119.md
```md
{% raw %}
# issue （Rust WASM版が一通り動いたのを確認したら）Rust WASMとTypeScript両方にある機能は、Rust WASMに一本化し、多重メンテによるトラブルを防止する #119
[issues #119](https://github.com/cat2151/cat-oscilloscope/issues/119)



{% endraw %}
```

### issue-notes/120.md
```md
{% raw %}
# issue Rust WASM時、周波数推移グラフの折れ線グラフが表示されない（あるいは上か下に張り付いているのかもしれないが見た目では判断できなかった） #120
[issues #120](https://github.com/cat2151/cat-oscilloscope/issues/120)



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

### src/WasmDataProcessor.ts
```ts
{% raw %}
import { WaveformRenderData } from './WaveformRenderData';
import { AudioManager } from './AudioManager';
import { GainController } from './GainController';
import { FrequencyEstimator } from './FrequencyEstimator';
import { ZeroCrossDetector } from './ZeroCrossDetector';
import { WaveformSearcher } from './WaveformSearcher';

// Type definition for WASM processor instance
interface WasmProcessorInstance {
  setAutoGain(enabled: boolean): void;
  setNoiseGate(enabled: boolean): void;
  setNoiseGateThreshold(threshold: number): void;
  setFrequencyEstimationMethod(method: string): void;
  setBufferSizeMultiplier(multiplier: number): void;
  setUsePeakMode(enabled: boolean): void;
  reset(): void;
  processFrame(
    waveformData: Float32Array,
    frequencyData: Uint8Array | null,
    sampleRate: number,
    fftSize: number,
    fftDisplayEnabled: boolean
  ): any;
}

/**
 * WasmDataProcessor - Wrapper for the WASM implementation of WaveformDataProcessor
 * 
 * This class provides the same interface as WaveformDataProcessor but uses
 * the Rust/WASM implementation for data processing. It maintains TypeScript
 * instances only for configuration and state that needs to be accessed from JS.
 */
export class WasmDataProcessor {
  // Asset directory patterns used for base path detection
  private static readonly ASSET_PATTERNS = ['/assets/', '/js/', '/dist/'] as const;
  
  private audioManager: AudioManager;
  private gainController: GainController;
  private frequencyEstimator: FrequencyEstimator;
  private zeroCrossDetector: ZeroCrossDetector;
  private waveformSearcher: WaveformSearcher;

  private wasmProcessor: WasmProcessorInstance | null = null;
  private isInitialized = false;
  private cachedBasePath: string | null = null;

  constructor(
    audioManager: AudioManager,
    gainController: GainController,
    frequencyEstimator: FrequencyEstimator,
    zeroCrossDetector: ZeroCrossDetector,
    waveformSearcher: WaveformSearcher
  ) {
    this.audioManager = audioManager;
    this.gainController = gainController;
    this.frequencyEstimator = frequencyEstimator;
    this.zeroCrossDetector = zeroCrossDetector;
    this.waveformSearcher = waveformSearcher;
  }
  
  /**
   * Initialize the WASM module
   * Must be called before processFrame
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    
    // Check if we're in a test or non-browser-like environment
    if (typeof window === 'undefined' || window.location.protocol === 'file:') {
      throw new Error('WASM module not available in test/non-browser environment');
    }
    
    try {
      // Load WASM module using script tag injection (works around Vite restrictions)
      await this.loadWasmModule();
      this.isInitialized = true;
      
      // Sync initial configuration to WASM
      this.syncConfigToWasm();
    } catch (error) {
      console.error('Failed to initialize WASM module:', error);
      throw error;
    }
  }
  
  /**
   * Load WASM module dynamically
   */
  private async loadWasmModule(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      // @ts-ignore
      if (window.wasmProcessor && window.wasmProcessor.WasmDataProcessor) {
        // @ts-ignore
        this.wasmProcessor = new window.wasmProcessor.WasmDataProcessor();
        resolve();
        return;
      }
      
      // Set up timeout to prevent hanging
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('WASM module loading timed out after 10 seconds'));
      }, 10000);
      
      // Determine the base path for WASM files
      const basePath = this.determineBasePath();
      const wasmPath = `${basePath}wasm/wasm_processor.js`;
      
      const script = document.createElement('script');
      script.type = 'module';
      script.textContent = `
        import init, { WasmDataProcessor } from '${wasmPath}';
        await init();
        window.wasmProcessor = { WasmDataProcessor };
        window.dispatchEvent(new Event('wasmLoaded'));
      `;
      
      const cleanup = () => {
        clearTimeout(timeout);
        window.removeEventListener('wasmLoaded', handleLoad);
      };
      
      const handleLoad = () => {
        cleanup();
        // @ts-ignore
        if (window.wasmProcessor && window.wasmProcessor.WasmDataProcessor) {
          // @ts-ignore
          this.wasmProcessor = new window.wasmProcessor.WasmDataProcessor();
          resolve();
        } else {
          reject(new Error('WASM module loaded but WasmDataProcessor not found'));
        }
      };
      
      window.addEventListener('wasmLoaded', handleLoad);
      
      script.onerror = () => {
        cleanup();
        reject(new Error('Failed to load WASM module script'));
      };
      
      document.head.appendChild(script);
    });
  }
  
  /**
   * Determine the base path for the application
   * This method implements a fallback hierarchy:
   * 1. Check for <base> tag href attribute
   * 2. Extract from existing script tags
   * 3. Default to '/'
   * The path is normalized to always end with '/'
   */
  private determineBasePath(): string {
    // Return cached value if available
    if (this.cachedBasePath !== null) {
      return this.cachedBasePath;
    }
    
    // Try <base> tag first
    let basePath = document.querySelector('base')?.getAttribute('href');

    // If we got a value from <base>, normalize absolute URLs to pathname only
    if (basePath) {
      try {
        const url = new URL(basePath, window.location.href);
        basePath = url.pathname;
      } catch {
        // If parsing fails, keep the original value (likely already a relative path)
      }
    }
    
    // Fall back to script tag analysis
    if (!basePath) {
      basePath = this.getBasePathFromScripts();
    }
    
    // Default to root
    if (!basePath) {
      basePath = '/';
    }
    
    // Normalize: ensure trailing slash
    if (!basePath.endsWith('/')) {
      basePath += '/';
    }
    
    // Cache the result
    this.cachedBasePath = basePath;
    return basePath;
  }
  
  /**
   * Extract base path from existing script tags
   * This method attempts to infer the base path by looking for script tags with src attributes
   * that might indicate the deployment path. Falls back to empty string if no clear pattern is found.
   */
  private getBasePathFromScripts(): string {
    const scripts = document.querySelectorAll('script[src]');
    for (const script of scripts) {
      const src = script.getAttribute('src');
      if (src) {
        try {
          // Try to parse as URL to handle both absolute and relative paths
          const url = new URL(src, window.location.href);
          const pathname = url.pathname;
          
          // Look for common asset directory patterns
          for (const pattern of WasmDataProcessor.ASSET_PATTERNS) {
            const index = pathname.indexOf(pattern);
            if (index >= 0) {
              // Extract everything before the asset directory
              // For '/assets/file.js', index=0, return '/' (root directory)
              // For '/cat-oscilloscope/assets/file.js', index=17, return '/cat-oscilloscope/'
              return index === 0 ? '/' : pathname.substring(0, index) + '/';
            }
          }
        } catch (error: unknown) {
          // URL parsing failed - skip this script and try next one
          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.debug('Failed to parse script URL:', src, error);
          }
          continue;
        }
      }
    }
    return '';
  }
  
  /**
   * Sync TypeScript configuration to WASM processor
   */
  private syncConfigToWasm(): void {
    if (!this.wasmProcessor) return;
    
    this.wasmProcessor.setAutoGain(this.gainController.getAutoGainEnabled());
    this.wasmProcessor.setNoiseGate(this.gainController.getNoiseGateEnabled());
    this.wasmProcessor.setNoiseGateThreshold(this.gainController.getNoiseGateThreshold());
    this.wasmProcessor.setFrequencyEstimationMethod(this.frequencyEstimator.getFrequencyEstimationMethod());
    this.wasmProcessor.setBufferSizeMultiplier(this.frequencyEstimator.getBufferSizeMultiplier());
    this.wasmProcessor.setUsePeakMode(this.zeroCrossDetector.getUsePeakMode());
  }
  
  /**
   * Sync WASM results back to TypeScript objects
   * 
   * Note: This method accesses private members using type assertions.
   * This is a temporary solution to maintain compatibility with existing code
   * that uses getters like getEstimatedFrequency(), getCurrentGain(), etc.
   * 
   * TODO: Consider adding public setter methods to these classes or
   * redesigning the synchronization interface for better type safety.
   */
  private syncResultsFromWasm(renderData: WaveformRenderData): void {
    // Update frequency estimator's estimated frequency
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.frequencyEstimator as any).estimatedFrequency = renderData.estimatedFrequency;
    
    // Update gain controller's current gain
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.gainController as any).currentGain = renderData.gain;
    
    // Update waveform searcher's state
    if (renderData.previousWaveform) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.waveformSearcher as any).previousWaveform = renderData.previousWaveform;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.waveformSearcher as any).lastSimilarity = renderData.similarity;
  }

  /**
   * Process current frame and generate complete render data using WASM
   */
  processFrame(fftDisplayEnabled: boolean): WaveformRenderData | null {
    if (!this.isInitialized || !this.wasmProcessor) {
      console.warn('WASM processor not initialized');
      return null;
    }
    
    // Check if audio is ready
    if (!this.audioManager.isReady()) {
      return null;
    }

    // Get waveform data
    const dataArray = this.audioManager.getTimeDomainData();
    if (!dataArray) {
      return null;
    }
    
    const sampleRate = this.audioManager.getSampleRate();
    const fftSize = this.audioManager.getFFTSize();
    
    // Get frequency data if needed
    const needsFrequencyData = this.frequencyEstimator.getFrequencyEstimationMethod() === 'fft' || fftDisplayEnabled;
    const frequencyData = needsFrequencyData ? this.audioManager.getFrequencyData() : null;
    
    // Sync configuration before processing
    this.syncConfigToWasm();
    
    // Call WASM processor
    const wasmResult = this.wasmProcessor.processFrame(
      dataArray,
      frequencyData,
      sampleRate,
      fftSize,
      fftDisplayEnabled
    );
    
    if (!wasmResult) {
      return null;
    }
    
    // Convert WASM result to TypeScript WaveformRenderData
    const renderData: WaveformRenderData = {
      waveformData: new Float32Array(wasmResult.waveform_data),
      displayStartIndex: wasmResult.displayStartIndex,
      displayEndIndex: wasmResult.displayEndIndex,
      gain: wasmResult.gain,
      estimatedFrequency: wasmResult.estimatedFrequency,
      frequencyPlotHistory: wasmResult.frequencyPlotHistory ? Array.from(wasmResult.frequencyPlotHistory) : [],
      sampleRate: wasmResult.sampleRate,
      fftSize: wasmResult.fftSize,
      firstAlignmentPoint: wasmResult.firstAlignmentPoint,
      secondAlignmentPoint: wasmResult.secondAlignmentPoint,
      frequencyData: wasmResult.frequencyData ? new Uint8Array(wasmResult.frequencyData) : undefined,
      isSignalAboveNoiseGate: wasmResult.isSignalAboveNoiseGate,
      maxFrequency: wasmResult.maxFrequency,
      previousWaveform: wasmResult.previousWaveform ? new Float32Array(wasmResult.previousWaveform) : null,
      similarity: wasmResult.similarity,
      usedSimilaritySearch: wasmResult.usedSimilaritySearch,
    };
    
    // Sync results back to TypeScript objects so getters work correctly
    this.syncResultsFromWasm(renderData);
    
    return renderData;
  }
  
  /**
   * Reset the WASM processor state
   */
  reset(): void {
    if (this.wasmProcessor) {
      this.wasmProcessor.reset();
    }
  }
}

{% endraw %}
```

## 最近の変更（過去7日間）
### コミット履歴:
5f961d0 Add issue note for #120 [auto]
4221604 Add issue note for #119 [auto]
eeede2b Merge pull request #118 from cat2151/copilot/move-feature-to-rust-wasm
53beefe Address PR review comments: add error logging for invalid buffer size and improve WASM init error messages
01e219b Add implementation documentation for issue #117
d16c4f1 Add validation for buffer size multiplier in WASM FrequencyEstimator
5337359 Add missing features to Rust WASM: frequency plot history, STFT, CQT, buffer size multiplier
1309f2c Initial plan
e5aba85 Merge pull request #116 from cat2151/copilot/fix-gray-grid-frequency-issue
1e4dc90 Fix frequency plot grid alignment - ensure grid drawn after data validation

### 変更されたファイル:
IMPLEMENTATION_NOTES_117.md
index.html
issue-notes/115.md
issue-notes/117.md
issue-notes/119.md
issue-notes/120.md
public/wasm/wasm_processor.d.ts
public/wasm/wasm_processor.js
public/wasm/wasm_processor_bg.wasm
public/wasm/wasm_processor_bg.wasm.d.ts
src/PianoKeyboardRenderer.ts
src/WasmDataProcessor.ts
src/WaveformRenderer.ts
src/__tests__/library-exports.test.ts
src/__tests__/piano-keyboard-renderer.test.ts
src/__tests__/waveform-renderer.test.ts
src/index.ts
src/main.ts
wasm-processor/src/frequency_estimator.rs
wasm-processor/src/lib.rs


---
Generated at: 2026-01-10 07:08:51 JST
