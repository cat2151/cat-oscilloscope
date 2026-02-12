Last updated: 2026-02-13

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
- .github/actions-tmp/.github/workflows/check-large-files.yml
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
- .github/actions-tmp/.github_automation/check-large-files/README.md
- .github/actions-tmp/.github_automation/check-large-files/check-large-files.toml.example
- .github/actions-tmp/.github_automation/check-large-files/scripts/check_large_files.py
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
- .github/actions-tmp/issue-notes/35.md
- .github/actions-tmp/issue-notes/38.md
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
- .github/workflows/call-check-large-files.yml
- .github/workflows/call-daily-project-summary.yml
- .github/workflows/call-issue-note.yml
- .github/workflows/call-translate-readme.yml
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
- dist/FrameTimingDiagnostics.d.ts
- dist/FrameTimingDiagnostics.d.ts.map
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
- dist/RenderCoordinator.d.ts
- dist/RenderCoordinator.d.ts.map
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
- dist/assets/Oscilloscope-BiPi-aIi.js
- dist/assets/Oscilloscope-BiPi-aIi.js.map
- dist/assets/demo-9JbpkLFd.js
- dist/assets/demo-9JbpkLFd.js.map
- dist/assets/main-pCt8i_lw.js
- dist/assets/main-pCt8i_lw.js.map
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
- issue-notes/254-diagnostic-plan.md
- issue-notes/254.md
- issue-notes/255.md
- issue-notes/257.md
- issue-notes/265.md
- issue-notes/267.md
- issue-notes/269-diagnostic-implementation.md
- issue-notes/269-sample-output.md
- issue-notes/269.md
- issue-notes/273.md
- issue-notes/275.md
- issue-notes/277.md
- issue-notes/279.md
- issue-notes/281.md
- issue-notes/283.md
- issue-notes/285.md
- issue-notes/286.md
- issue-notes/288.md
- issue-notes/289.md
- issue-notes/294.md
- issue-notes/296.md
- issue-notes/299.md
- issue-notes/301.md
- issue-notes/305.md
- issue-notes/307.md
- issue-notes/311.md
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
- signal-processor-wasm/src/candidate_selection.rs
- signal-processor-wasm/src/dft.rs
- signal-processor-wasm/src/frequency_estimation/dsp_utils.rs
- signal-processor-wasm/src/frequency_estimation/fft.rs
- signal-processor-wasm/src/frequency_estimation/harmonic_analysis.rs
- signal-processor-wasm/src/frequency_estimation/mod.rs
- signal-processor-wasm/src/frequency_estimation/non_default_methods/autocorrelation.rs
- signal-processor-wasm/src/frequency_estimation/non_default_methods/cqt.rs
- signal-processor-wasm/src/frequency_estimation/non_default_methods/mod.rs
- signal-processor-wasm/src/frequency_estimation/non_default_methods/stft.rs
- signal-processor-wasm/src/frequency_estimation/non_default_methods/zero_crossing.rs
- signal-processor-wasm/src/frequency_estimation/smoothing.rs
- signal-processor-wasm/src/frequency_estimation/tests.rs
- signal-processor-wasm/src/gain_controller.rs
- signal-processor-wasm/src/lib.rs
- signal-processor-wasm/src/phase_markers.rs
- signal-processor-wasm/src/waveform_render_data.rs
- signal-processor-wasm/src/waveform_searcher.rs
- signal-processor-wasm/src/zero_cross_detector/default_mode.rs
- signal-processor-wasm/src/zero_cross_detector/mod.rs
- signal-processor-wasm/src/zero_cross_detector/non_default_modes.rs
- signal-processor-wasm/src/zero_cross_detector/phase_zero.rs
- signal-processor-wasm/src/zero_cross_detector/types.rs
- signal-processor-wasm/src/zero_cross_detector/utils.rs
- src/AudioManager.ts
- src/BasePathResolver.ts
- src/BufferSource.ts
- src/ComparisonPanelRenderer.ts
- src/CycleSimilarityRenderer.ts
- src/DOMElementManager.ts
- src/DisplayUpdater.ts
- src/FrameBufferHistory.ts
- src/FrameTimingDiagnostics.ts
- src/FrequencyEstimator.ts
- src/GainController.ts
- src/Oscilloscope.ts
- src/OverlayLayout.ts
- src/PianoKeyboardRenderer.ts
- src/RenderCoordinator.ts
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
- src/__tests__/performance-issue267.test.ts
- src/__tests__/phase-marker-constraint-issue296.test.ts
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
- test-pages/test-startFromBuffer-error.html
- test-pages/wavlpf-broken-layout.png
- test-segment-relative.md
- tsconfig.json
- tsconfig.lib.json
- vite.config.ts

## 現在のオープンIssues
オープン中のIssueはありません

## ドキュメントで言及されているファイルの内容


## 最近の変更（過去7日間）
### コミット履歴:
2d6a27e Merge pull request #316 from cat2151/codex/fix-5794738-1125020184-93229a32-d720-4ba7-9c3e-993a516b9c90
e4732f4 fix: silence unused warnings in wasm helpers
3ad9c83 refactor: split wasm helpers into modules
94dcb2d Initial plan
7768520 Update project summaries (overview & development status) [auto]
1aa394f Merge pull request #314 from cat2151/codex/fix-zero-cross-indicator-visibility
7fecca5 perf: inline zero-cross filtering in render loop
4ab5c0f fix: constrain zero-cross markers
be1b6eb Initial plan
d3b212f Merge pull request #312 from cat2151/codex/fix-phase-marker-end-offset

### 変更されたファイル:
dist/ComparisonPanelRenderer.d.ts
dist/ComparisonPanelRenderer.d.ts.map
dist/RenderCoordinator.d.ts.map
dist/WaveformDataProcessor.d.ts
dist/WaveformDataProcessor.d.ts.map
dist/WaveformRenderData.d.ts
dist/WaveformRenderData.d.ts.map
dist/assets/Oscilloscope-0AkMdwqr.js
dist/assets/Oscilloscope-0AkMdwqr.js.map
dist/assets/Oscilloscope-BiPi-aIi.js
dist/assets/Oscilloscope-BiPi-aIi.js.map
dist/assets/demo-9JbpkLFd.js
dist/assets/demo-9JbpkLFd.js.map
dist/assets/demo-B8LH4eBp.js
dist/assets/demo-B8LH4eBp.js.map
dist/assets/main-pCt8i_lw.js
dist/assets/main-pCt8i_lw.js.map
dist/cat-oscilloscope.cjs
dist/cat-oscilloscope.cjs.map
dist/cat-oscilloscope.mjs
dist/cat-oscilloscope.mjs.map
dist/comparison-renderers/WaveformPanelRenderer.d.ts
dist/comparison-renderers/WaveformPanelRenderer.d.ts.map
dist/demo-simple.html
dist/index.html
dist/wasm/signal_processor_wasm.d.ts
dist/wasm/signal_processor_wasm.js
dist/wasm/signal_processor_wasm_bg.wasm
dist/wasm/signal_processor_wasm_bg.wasm.d.ts
generated-docs/development-status-generated-prompt.md
generated-docs/development-status.md
generated-docs/project-overview-generated-prompt.md
generated-docs/project-overview.md
issue-notes/311.md
public/wasm/signal_processor_wasm.d.ts
public/wasm/signal_processor_wasm.js
public/wasm/signal_processor_wasm_bg.wasm
public/wasm/signal_processor_wasm_bg.wasm.d.ts
signal-processor-wasm/src/candidate_selection.rs
signal-processor-wasm/src/lib.rs
signal-processor-wasm/src/phase_markers.rs
signal-processor-wasm/src/waveform_render_data.rs
src/ComparisonPanelRenderer.ts
src/RenderCoordinator.ts
src/WaveformDataProcessor.ts
src/WaveformRenderData.ts
src/__tests__/comparison-panel-renderer.test.ts
src/__tests__/waveform-data-processor.test.ts
src/comparison-renderers/WaveformPanelRenderer.ts


---
Generated at: 2026-02-13 07:13:47 JST
