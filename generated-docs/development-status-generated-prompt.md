Last updated: 2026-02-06

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
- .github/CHECK_LARGE_FILES.md
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
- .github/check-large-files.toml
- .github/copilot-instructions.md
- .github/scripts/check_large_files.py
- .github/workflows/call-daily-project-summary.yml
- .github/workflows/call-issue-note.yml
- .github/workflows/call-translate-readme.yml
- .github/workflows/check-large-files.yml
- .github/workflows/deploy.yml
- .gitignore
- ARCHITECTURE.md
- LIBRARY_USAGE.md
- LICENSE
- README.ja.md
- README.md
- REFACTORING_ISSUE_251.md
- REFACTORING_SUMMARY.md
- _config.yml
- demo-simple.html
- demo-simple.js
- dist/AudioManager.d.ts
- dist/AudioManager.d.ts.map
- dist/BasePathResolver.d.ts
- dist/BasePathResolver.d.ts.map
- dist/BufferSource.d.ts
- dist/BufferSource.d.ts.map
- dist/ComparisonPanelRenderer.d.ts
- dist/ComparisonPanelRenderer.d.ts.map
- dist/CycleSimilarityRenderer.d.ts
- dist/CycleSimilarityRenderer.d.ts.map
- dist/DOMElementManager.d.ts
- dist/DOMElementManager.d.ts.map
- dist/DisplayUpdater.d.ts
- dist/DisplayUpdater.d.ts.map
- dist/FrameBufferHistory.d.ts
- dist/FrameBufferHistory.d.ts.map
- dist/FrequencyEstimator.d.ts
- dist/FrequencyEstimator.d.ts.map
- dist/GainController.d.ts
- dist/GainController.d.ts.map
- dist/Oscilloscope.d.ts
- dist/Oscilloscope.d.ts.map
- dist/OverlayLayout.d.ts
- dist/OverlayLayout.d.ts.map
- dist/PianoKeyboardRenderer.d.ts
- dist/PianoKeyboardRenderer.d.ts.map
- dist/UIEventHandlers.d.ts
- dist/UIEventHandlers.d.ts.map
- dist/WasmModuleLoader.d.ts
- dist/WasmModuleLoader.d.ts.map
- dist/WaveformDataProcessor.d.ts
- dist/WaveformDataProcessor.d.ts.map
- dist/WaveformRenderData.d.ts
- dist/WaveformRenderData.d.ts.map
- dist/WaveformRenderer.d.ts
- dist/WaveformRenderer.d.ts.map
- dist/WaveformSearcher.d.ts
- dist/WaveformSearcher.d.ts.map
- dist/ZeroCrossDetector.d.ts
- dist/ZeroCrossDetector.d.ts.map
- dist/assets/demo-DsYptmO3.js
- dist/assets/demo-DsYptmO3.js.map
- dist/assets/main-DUIA4vI1.js
- dist/assets/main-DUIA4vI1.js.map
- dist/assets/modulepreload-polyfill-B5Qt9EMX.js
- dist/assets/modulepreload-polyfill-B5Qt9EMX.js.map
- dist/cat-oscilloscope.cjs
- dist/cat-oscilloscope.cjs.map
- dist/cat-oscilloscope.mjs
- dist/cat-oscilloscope.mjs.map
- dist/comparison-renderers/OffsetOverlayRenderer.d.ts
- dist/comparison-renderers/OffsetOverlayRenderer.d.ts.map
- dist/comparison-renderers/PositionMarkerRenderer.d.ts
- dist/comparison-renderers/PositionMarkerRenderer.d.ts.map
- dist/comparison-renderers/SimilarityPlotRenderer.d.ts
- dist/comparison-renderers/SimilarityPlotRenderer.d.ts.map
- dist/comparison-renderers/WaveformPanelRenderer.d.ts
- dist/comparison-renderers/WaveformPanelRenderer.d.ts.map
- dist/comparison-renderers/index.d.ts
- dist/comparison-renderers/index.d.ts.map
- dist/demo-simple.html
- dist/index.d.ts
- dist/index.d.ts.map
- dist/index.html
- dist/renderers/BaseOverlayRenderer.d.ts
- dist/renderers/BaseOverlayRenderer.d.ts.map
- dist/renderers/FFTOverlayRenderer.d.ts
- dist/renderers/FFTOverlayRenderer.d.ts.map
- dist/renderers/FrequencyPlotRenderer.d.ts
- dist/renderers/FrequencyPlotRenderer.d.ts.map
- dist/renderers/GridRenderer.d.ts
- dist/renderers/GridRenderer.d.ts.map
- dist/renderers/HarmonicAnalysisRenderer.d.ts
- dist/renderers/HarmonicAnalysisRenderer.d.ts.map
- dist/renderers/PhaseMarkerRenderer.d.ts
- dist/renderers/PhaseMarkerRenderer.d.ts.map
- dist/renderers/WaveformLineRenderer.d.ts
- dist/renderers/WaveformLineRenderer.d.ts.map
- dist/renderers/index.d.ts
- dist/renderers/index.d.ts.map
- dist/utils.d.ts
- dist/utils.d.ts.map
- dist/wasm/package.json
- dist/wasm/signal_processor_wasm.d.ts
- dist/wasm/signal_processor_wasm.js
- dist/wasm/signal_processor_wasm_bg.wasm
- dist/wasm/signal_processor_wasm_bg.wasm.d.ts
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
- issue-notes/137.md
- issue-notes/138.md
- issue-notes/139.md
- issue-notes/140.md
- issue-notes/145.md
- issue-notes/147.md
- issue-notes/149.md
- issue-notes/151.md
- issue-notes/153.md
- issue-notes/155.md
- issue-notes/158.md
- issue-notes/160.md
- issue-notes/162.md
- issue-notes/163.md
- issue-notes/165.md
- issue-notes/167.md
- issue-notes/169.md
- issue-notes/171.md
- issue-notes/173.md
- issue-notes/175.md
- issue-notes/177-analysis.md
- issue-notes/177.md
- issue-notes/179-analysis-v2.md
- issue-notes/179-analysis-v3.md
- issue-notes/179-analysis.md
- issue-notes/179.md
- issue-notes/181-implementation.md
- issue-notes/181.md
- issue-notes/183.md
- issue-notes/185.md
- issue-notes/187.md
- issue-notes/189.md
- issue-notes/191.md
- issue-notes/193.md
- issue-notes/195.md
- issue-notes/197.md
- issue-notes/199.md
- issue-notes/201.md
- issue-notes/203.md
- issue-notes/205.md
- issue-notes/207.md
- issue-notes/209.md
- issue-notes/210.md
- issue-notes/212.md
- issue-notes/214.md
- issue-notes/216.md
- issue-notes/217.md
- issue-notes/220-fix-summary.md
- issue-notes/220.md
- issue-notes/222.md
- issue-notes/224.md
- issue-notes/226.md
- issue-notes/228.md
- issue-notes/230.md
- issue-notes/232.md
- issue-notes/234.md
- issue-notes/236.md
- issue-notes/238.md
- issue-notes/241.md
- issue-notes/243.md
- issue-notes/245.md
- issue-notes/247.md
- issue-notes/249.md
- issue-notes/251.md
- issue-notes/252.md
- issue-notes/253.md
- issue-notes/254.md
- issue-notes/255.md
- issue-notes/257.md
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
- public/wasm/signal_processor_wasm.d.ts
- public/wasm/signal_processor_wasm.js
- public/wasm/signal_processor_wasm_bg.wasm
- public/wasm/signal_processor_wasm_bg.wasm.d.ts
- scripts/screenshot-local.js
- signal-processor-wasm/Cargo.toml
- signal-processor-wasm/src/bpf.rs
- signal-processor-wasm/src/frequency_estimation/autocorrelation.rs
- signal-processor-wasm/src/frequency_estimation/cqt.rs
- signal-processor-wasm/src/frequency_estimation/dsp_utils.rs
- signal-processor-wasm/src/frequency_estimation/fft.rs
- signal-processor-wasm/src/frequency_estimation/harmonic_analysis.rs
- signal-processor-wasm/src/frequency_estimation/mod.rs
- signal-processor-wasm/src/frequency_estimation/smoothing.rs
- signal-processor-wasm/src/frequency_estimation/stft.rs
- signal-processor-wasm/src/frequency_estimation/zero_crossing.rs
- signal-processor-wasm/src/gain_controller.rs
- signal-processor-wasm/src/lib.rs
- signal-processor-wasm/src/waveform_searcher.rs
- signal-processor-wasm/src/zero_cross_detector.rs
- src/AudioManager.ts
- src/BasePathResolver.ts
- src/BufferSource.ts
- src/ComparisonPanelRenderer.ts
- src/CycleSimilarityRenderer.ts
- src/DOMElementManager.ts
- src/DisplayUpdater.ts
- src/FrameBufferHistory.ts
- src/FrequencyEstimator.ts
- src/GainController.ts
- src/Oscilloscope.ts
- src/OverlayLayout.ts
- src/PianoKeyboardRenderer.ts
- src/UIEventHandlers.ts
- src/WasmModuleLoader.ts
- src/WaveformDataProcessor.ts
- src/WaveformRenderData.ts
- src/WaveformRenderer.ts
- src/WaveformSearcher.ts
- src/ZeroCrossDetector.ts
- src/__tests__/BufferSource.test.ts
- src/__tests__/algorithms.test.ts
- src/__tests__/comparison-panel-renderer.test.ts
- src/__tests__/cycle-similarity-display.test.ts
- src/__tests__/cycle-similarity.test.ts
- src/__tests__/dom-integration.test.ts
- src/__tests__/library-exports.test.ts
- src/__tests__/normalized-harmonics-issue197.test.ts
- src/__tests__/oscilloscope.test.ts
- src/__tests__/overlay-layout.test.ts
- src/__tests__/piano-keyboard-renderer.test.ts
- src/__tests__/startFromBuffer.test.ts
- src/__tests__/utils.test.ts
- src/__tests__/waveform-data-processor.test.ts
- src/__tests__/waveform-renderer.test.ts
- src/__tests__/waveform-searcher.test.ts
- src/__tests__/weighted-harmonic-issue195.test.ts
- src/comparison-renderers/OffsetOverlayRenderer.ts
- src/comparison-renderers/PositionMarkerRenderer.ts
- src/comparison-renderers/SimilarityPlotRenderer.ts
- src/comparison-renderers/WaveformPanelRenderer.ts
- src/comparison-renderers/index.ts
- src/index.ts
- src/main.ts
- src/renderers/BaseOverlayRenderer.ts
- src/renderers/FFTOverlayRenderer.ts
- src/renderers/FrequencyPlotRenderer.ts
- src/renderers/GridRenderer.ts
- src/renderers/HarmonicAnalysisRenderer.ts
- src/renderers/PhaseMarkerRenderer.ts
- src/renderers/WaveformLineRenderer.ts
- src/renderers/index.ts
- src/utils.ts
- test-pages/test-canvas-dimension-warning.html
- test-pages/wavlpf-broken-layout.png
- test-segment-relative.md
- tsconfig.json
- tsconfig.lib.json
- vite.config.ts

## 現在のオープンIssues
## [Issue #254](../issue-notes/254.md): 「今回の波形」にオーバーレイ表示しているOffset %が、とても1フレ1%とは思えない例えば1フレ40%に見えるスパイクを描画することがある
[issue-notes/254.md](https://github.com/cat2151/cat-oscilloscope/blob/main/issue-notes/254.md)

...
ラベル: good first issue
--- issue-notes/254.md の内容 ---

```markdown
# issue 今回の波形にオーバーレイ表示しているOffset %が、とても1フレ1%とは思えないスパイクを描画することがある。仕様では1フレ1%以内のはずなので、スパイクの原因を調査する #254
[issues #254](https://github.com/cat2151/cat-oscilloscope/issues/254)

# 詳細
- 仕様では1フレ1%以内のはずなので、スパイクの原因を調査すること
- もし「こういうときは1%になりません」ということがあれば、PRコメントに報告、README.ja.mdに明記、をすること
  - その場合は「移動できない」に倒したほうがいいくらいの考え
    - そこでoffset %が大きく移動してしまう（スパイクになる）のがNG

```

## ドキュメントで言及されているファイルの内容
### .github/actions-tmp/README.ja.md
```md
{% raw %}
# GitHub Actions 共通ワークフロー集

このリポジトリは、**複数プロジェクトで使い回せるGitHub Actions共通ワークフロー集**です

<p align="left">
  <a href="README.ja.md"><img src="https://img.shields.io/badge/🇯🇵-Japanese-red.svg" alt="Japanese"></a>
  <a href="README.md"><img src="https://img.shields.io/badge/🇺🇸-English-blue.svg" alt="English"></a>
</p>

# 3行で説明
- 🚀 プロジェクトごとのGitHub Actions管理をもっと楽に
- 🔗 共通化されたワークフローで、どのプロジェクトからも呼ぶだけでOK
- ✅ メンテは一括、プロジェクト開発に集中できます

## Quick Links
| 項目 | リンク |
|------|--------|
| 📖 プロジェクト概要 | [generated-docs/project-overview.md](generated-docs/project-overview.md) |
| 📖 コールグラフ | [generated-docs/callgraph.html](https://cat2151.github.io/github-actions/generated-docs/callgraph.html) |
| 📊 開発状況 | [generated-docs/development-status.md](generated-docs/development-status.md) |

# notes
- まだ共通化の作業中です
- まだワークフロー内容を改善中です

※README.md は README.ja.md を元にGeminiの翻訳でGitHub Actionsで自動生成しています

{% endraw %}
```

### README.ja.md
```md
{% raw %}
# cat-oscilloscope

<p align="left">
  <a href="README.ja.md"><img src="https://img.shields.io/badge/🇯🇵-Japanese-red.svg" alt="Japanese"></a>
  <a href="README.md"><img src="https://img.shields.io/badge/🇺🇸-English-blue.svg" alt="English"></a>
  <a href="https://deepwiki.com/cat2151/cat-oscilloscope"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki"></a>
  <a href="https://cat2151.github.io/cat-oscilloscope/"><img src="https://img.shields.io/badge/🌐-Live_Demo-green.svg" alt="Live Demo"></a>
</p>

ブラウザで動く、オシロスコープ風の波形ビジュアライザー

## 状況
- このドキュメントはまだAI生成の文章があり読みづらいです。今後文章を人間の手で読みやすく改善する予定です

## 🌐 ライブデモ

**フルバージョン**: [https://cat2151.github.io/cat-oscilloscope/](https://cat2151.github.io/cat-oscilloscope/)  
**簡易デモ（ライブラリ利用例）**: [https://cat2151.github.io/cat-oscilloscope/demo-simple.html](https://cat2151.github.io/cat-oscilloscope/demo-simple.html)

上記のURLでアプリケーションを試すことができます。フルバージョンではマイクへのアクセス許可が必要です。簡易デモはBufferSourceを使った最小限の実装例で、CDN経由でのライブラリ利用方法を示しています。

## 実装状況

### ✅ 完了済みの主要実装

- **Rust/WASM統合**: すべてのデータ処理アルゴリズムがRust/WASMで実装され、高速で型安全な処理を実現
- **ライブラリ対応**: npmライブラリとして他のプロジェクトから利用可能（ESM/CJS両対応、完全な型定義サポート）
- **5つの周波数推定方式**: Zero-Crossing、Autocorrelation、FFT、STFT、CQTをサポート
- **バッファサイズマルチプライヤー**: 低周波検出精度を向上させる拡張バッファ機能（1x/4x/16x）
- **波形比較パネル**: 前回と今回の波形の類似度をリアルタイム表示
- **ピアノ鍵盤表示**: 検出した周波数を視覚的に表示

### 現在の安定性

- ✅ 大きなバグは解決済み
- ✅ WAVファイルからのオーディオ再生時は高い実用性
- ⚠️ マイク入力は環境音の影響を受けるため、静かな環境での使用を推奨

## 📚 ライブラリとしての使用

cat-oscilloscopeは、あなた自身のプロジェクトでnpmライブラリとして使用できます。詳細な手順は [LIBRARY_USAGE.md](./LIBRARY_USAGE.md) をご覧ください。

⚠️ **重要**: npmやGitHubからインストールする場合、WASMファイルの手動セットアップが必要です。詳細は [LIBRARY_USAGE.md](./LIBRARY_USAGE.md) の「WASMファイルのセットアップ」セクションをご覧ください。

```typescript
import { Oscilloscope, BufferSource } from 'cat-oscilloscope';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const oscilloscope = new Oscilloscope(canvas);

// マイク入力から可視化
await oscilloscope.start();

// 静的バッファから可視化（オーディオ再生なし）
const audioData = new Float32Array(44100); // 1秒分のデータ
const bufferSource = new BufferSource(audioData, 44100, { loop: true });
await oscilloscope.startFromBuffer(bufferSource);
```

**BufferSource機能**: wavlpfなどの音声処理ライブラリとの統合に最適な、静的バッファからの可視化機能を提供します。

**表示制御**: オーバーレイ（FFTスペクトラム、倍音分析、周波数推移プロット）の表示/非表示は`setDebugOverlaysEnabled()`で制御できます。また、`setOverlaysLayout()`でレイアウトをカスタマイズできます。詳細は [LIBRARY_USAGE.md](./LIBRARY_USAGE.md) の「デバッグオーバーレイ表示の制御」と「オーバーレイのレイアウトカスタマイズ」をご覧ください。


## 機能

### 周波数推定

cat-oscilloscopeは、5つの周波数推定アルゴリズムをサポートしています：

1. **Zero-Crossing（ゼロクロス法）**: シンプルで高速。単純な波形に適しています。
2. **Autocorrelation（自己相関法）**: 複雑な波形に対してバランスの良い精度。
3. **FFT（高速フーリエ変換）**: デフォルト。周波数スペクトラム解析。高周波に強い。
4. **STFT（短時間フーリエ変換）**: 可変窓長により、低周波の検出精度が向上。
5. **CQT（定Q変換）**: 低周波域で高い周波数分解能を持つ。音楽分析に適しています。

### バッファサイズマルチプライヤー

低周波の検出精度を向上させるため、過去のフレームバッファを利用した拡張バッファをサポート：

- **1x (Standard)**: 標準バッファサイズ（約1/60秒）
- **4x (Better Low Freq)**: 4倍の拡張バッファで低周波の検出精度向上
- **16x (Best Low Freq)**: 16倍の拡張バッファで最高の低周波検出精度

**使用例**: 20-50Hzの低周波を検出する場合、STFT または CQT を選択し、Buffer Size を 16x に設定すると最適です。

**重要な注意事項:**
- バッファサイズを変更すると、履歴が蓄積されるまで（最大16フレーム）、新しいバッファサイズが有効になりません
- 大きなバッファサイズ（16x）では、初回の周波数検出に約0.3秒かかります

### 検出可能な周波数範囲

バッファサイズによって、検出可能な最低周波数が異なります：

- **1x (4096サンプル @ 48kHz)**: 約80Hz以上（標準使用）
- **4x (16384サンプル)**: 約30Hz以上（低周波向上）
- **16x (65536サンプル)**: 約20Hz以上（最良の低周波検出）

## メモ

- 周波数推定
  - FFTが正確なときと、FFT以外が正確なとき、それぞれがあります。
  - STFTとCQTは特に低周波（20-100Hz）の検出に優れています。
  - バッファサイズマルチプライヤーを大きくすると、低周波の精度が向上しますが、レスポンスが若干遅くなります。
  - **パフォーマンス**: 16xバッファサイズでは、STFT/CQTの計算に時間がかかる場合があります（教育目的の実装のため）。

## データ処理の実装について

すべてのデータ処理（波形探索、周波数推定、ゼロクロス検出など）は**Rust/WASMで実装**されています。

- **高速な処理性能**: Rustの最適化により効率的な実行
- **型安全で信頼性の高い実装**: Rustの厳格な型システムによる安全性
- **単一実装**: アルゴリズムはWASMのみで実装され、TypeScriptとの二重管理を解消
- **TypeScriptの役割**: 設定管理とレンダリングのみを担当

### WASM実装のビルド

WASM実装は `signal-processor-wasm` ディレクトリにあります。

```bash
# WASM実装のビルド（wasm-packが必要）
npm run build:wasm

# アプリ全体のビルド（WASMも含む）
npm run build
```

**必要なツール**:
- Rust toolchain (rustc, cargo)
- wasm-pack (`cargo install wasm-pack`)

**注意**: 通常の使用では、事前ビルド済みのWASMファイルが `public/wasm/` に含まれているため、Rustツールチェーンは不要です。

## 主な機能

- 🎤 **マイク入力** - マイクからの音声をリアルタイムでキャプチャ
- 📂 **オーディオファイル** - WAVファイルのループ再生に対応
- 📊 **周波数推定** - ゼロクロス、自己相関、FFT、STFT、CQTの5つの方式
- 🎹 **ピアノ鍵盤表示** - 検出した周波数を鍵盤上に表示
- 🎚️ **自動ゲイン** - 波形の振幅を自動調整
- 🔇 **ノイズゲート** - 閾値以下の信号をカット
- 📈 **FFTスペクトラム** - 周波数スペクトラムをオーバーレイ表示
- 🔍 **波形比較パネル** - 前回と今回の波形の類似度を表示
- ⏸️ **描画の一時停止** - 波形を静止して観察可能

## はじめに

### 必要条件

- Node.js（v16以上を推奨）
- npm または yarn

### インストール

```bash
npm install
```

### 開発

開発サーバーを起動：

```bash
npm run dev
```

ブラウザで `http://localhost:3000/` を開いてください。

### ビルド

本番用にビルド：

```bash
npm run build
```

ビルドされたファイルは `dist` ディレクトリに出力されます。

### 本番ビルドのプレビュー

```bash
npm run preview
```

### テスト

テストを実行：

```bash
npm test
```

カバレッジレポートを生成：

```bash
npm run test:coverage
```

テストUIを起動：

```bash
npm run test:ui
```

## 仕組み

### ゼロクロス検出アルゴリズム

このオシロスコープは、以下のようなゼロクロス検出アルゴリズムを実装しています：

1. 音声バッファをスキャンし、波形がマイナス（またはゼロ）からプラスに交差するポイントを検出
2. 最初のゼロクロスポイントを特定
3. 次のゼロクロスポイントを見つけて、1つの完全な波形サイクルを決定
4. ゼロクロスポイントの前後にわずかなパディングを付けて波形を表示

これにより、安定した非スクロール表示が実現されます。

### 技術的詳細

- **FFTサイズ**: 高解像度のため4096サンプル
- **スムージング**: 正確な波形表現のため無効（0）
- **表示パディング**: ゼロクロスポイントの前後に20サンプル
- **オートゲイン**: 
  - キャンバスの高さの80%を目標に自動調整
  - ピーク追跡による滑らかな遷移（減衰率: 0.95）
  - ゲイン範囲: 0.5倍〜99倍
  - 補間係数: 0.1（段階的な調整）
  - UIチェックボックスで有効/無効を切り替え可能（デフォルト: 有効）
- **キャンバス解像度**: 800x400ピクセル
- **リフレッシュレート**: ブラウザのrequestAnimationFrameに同期（約60 FPS）

## 技術スタック

- **Rust/WebAssembly** - 高速で型安全なデータ処理アルゴリズム
- **TypeScript** - 型安全なJavaScript（設定管理とレンダリング）
- **Vite** - 高速なビルドツールと開発サーバー
- **Web Audio API** - 音声のキャプチャと分析
- **HTML Canvas** - 2D波形レンダリング

## ブラウザ要件

このアプリケーションには以下が必要です：
- Web Audio APIをサポートするモダンブラウザ（Chrome、Firefox、Safari、Edge）
- ユーザーによるマイクのアクセス許可
- HTTPSまたはlocalhost（マイクアクセスに必要）

## マイク入力時の制約

マイクからの入力を使用する場合、以下の制約があります：

### 環境音の影響

マイクは周囲のすべての音を拾うため、以下のような環境音が波形に影響を与えます：

- **マウスクリック音**: マウスをクリックする際の機械的な音が波形に現れます。特に一時停止ボタンをマウスでクリックした瞬間、波形が乱れて見えることがあります。
- **キーボード打鍵音**: キーボードのタイプ音も波形に影響します。ただし、静音性の高いキーボードを使用している場合は、影響が少なくなります。
- **その他の環境音**: 話し声、室内の空調音、外部からの騒音なども波形に現れます。

### 実用上のヒント

- **一時停止の方法**: マウスクリックの代わりに、静音性の高いキーボードのスペースキーを使用することで、一時停止時の波形への影響を最小限に抑えることができます。
- **音源の選択**: マイク入力は環境音の影響を受けやすいため、ノイズのない波形を観察したい場合は、WAVファイルなどのオーディオファイルを使用することをお勧めします。
- **測定環境**: できるだけ静かな環境で使用することで、より正確な波形を観察できます。

これらはアプリケーションの制限ではなく、マイクというデバイスの特性によるものです。

## 開発・保守

### コード品質の自動チェック

このプロジェクトでは、コード品質を維持するために以下の自動チェックが実行されます：

- **大きなファイルの検出**: 日次バッチでソースファイルの行数をチェックし、500行を超えるファイルがあればissueを自動起票します
  - 設定ファイル: `.github/check-large-files.toml`
  - 実行スクリプト: `.github/scripts/check_large_files.py`
  - ワークフロー: `.github/workflows/check-large-files.yml`
  - 日本時間 毎日09:00に自動実行 (手動実行も可能)

この仕組みにより、ファイルが大きくなりすぎる前に早期発見し、適切なタイミングでリファクタリングを検討できます。

## ライセンス

MITライセンス - 詳細は [LICENSE](LICENSE) ファイルを参照してください

*Big Brother is listening to you. Now it’s the cat.* 🐱

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

### issue-notes/254.md
```md
{% raw %}
# issue 今回の波形にオーバーレイ表示しているOffset %が、とても1フレ1%とは思えないスパイクを描画することがある。仕様では1フレ1%以内のはずなので、スパイクの原因を調査する #254
[issues #254](https://github.com/cat2151/cat-oscilloscope/issues/254)

# 詳細
- 仕様では1フレ1%以内のはずなので、スパイクの原因を調査すること
- もし「こういうときは1%になりません」ということがあれば、PRコメントに報告、README.ja.mdに明記、をすること
  - その場合は「移動できない」に倒したほうがいいくらいの考え
    - そこでoffset %が大きく移動してしまう（スパイクになる）のがNG

{% endraw %}
```

## 最近の変更（過去7日間）
### コミット履歴:
29764f2 Merge pull request #261 from cat2151/copilot/move-demo-link-to-footer
4faffa4 Rebuild dist files after whitespace fix
12bf077 Remove trailing space after pipe character in footer
927c60b Rebuild dist files after index.html changes
e2989c5 Move demo link to footer with subtle styling
1c085a7 Initial plan
5ba6a94 Merge pull request #259 from cat2151/copilot/update-graph-from-bar-to-line
a3c43a0 Fix legend overlap: add semi-transparent background and reduce spacing
94ac74e Improve documentation and comments for clarity
d6e30ff Address code review feedback: extract constants and improve clarity

### 変更されたファイル:
.github/CHECK_LARGE_FILES.md
.github/check-large-files.toml
.github/scripts/check_large_files.py
.github/workflows/check-large-files.yml
README.ja.md
README.md
REFACTORING_ISSUE_251.md
dist/CycleSimilarityRenderer.d.ts
dist/CycleSimilarityRenderer.d.ts.map
dist/assets/demo-DsYptmO3.js
dist/assets/demo-DsYptmO3.js.map
dist/assets/main-DUIA4vI1.js
dist/assets/main-DUIA4vI1.js.map
dist/assets/modulepreload-polyfill-B5Qt9EMX.js
dist/assets/modulepreload-polyfill-B5Qt9EMX.js.map
dist/cat-oscilloscope.cjs
dist/cat-oscilloscope.cjs.map
dist/cat-oscilloscope.mjs
dist/cat-oscilloscope.mjs.map
dist/demo-simple.html
dist/index.html
generated-docs/development-status-generated-prompt.md
generated-docs/development-status.md
generated-docs/project-overview-generated-prompt.md
generated-docs/project-overview.md
index.html
issue-notes/257.md
package-lock.json
signal-processor-wasm/src/frequency_estimation/autocorrelation.rs
signal-processor-wasm/src/frequency_estimation/cqt.rs
signal-processor-wasm/src/frequency_estimation/dsp_utils.rs
signal-processor-wasm/src/frequency_estimation/fft.rs
signal-processor-wasm/src/frequency_estimation/harmonic_analysis.rs
signal-processor-wasm/src/frequency_estimation/mod.rs
signal-processor-wasm/src/frequency_estimation/smoothing.rs
signal-processor-wasm/src/frequency_estimation/stft.rs
signal-processor-wasm/src/frequency_estimation/zero_crossing.rs
signal-processor-wasm/src/frequency_estimator.rs
signal-processor-wasm/src/lib.rs
src/CycleSimilarityRenderer.ts


---
Generated at: 2026-02-06 07:12:18 JST
