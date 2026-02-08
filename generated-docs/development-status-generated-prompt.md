Last updated: 2026-02-09

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
- .github/actions-tmp/issue-notes/31.md
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
- dist/assets/Oscilloscope-0AkMdwqr.js
- dist/assets/Oscilloscope-0AkMdwqr.js.map
- dist/assets/demo-B8LH4eBp.js
- dist/assets/demo-B8LH4eBp.js.map
- dist/assets/main-DNW0ajie.js
- dist/assets/main-DNW0ajie.js.map
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
- signal-processor-wasm/src/waveform_render_data.rs
- signal-processor-wasm/src/waveform_searcher.rs
- signal-processor-wasm/src/zero_cross_detector/default_mode.rs
- signal-processor-wasm/src/zero_cross_detector/mod.rs
- signal-processor-wasm/src/zero_cross_detector/non_default_modes.rs
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
## [Issue #303](../issue-notes/303.md): 大きなファイルの検出: 1個のファイルが500行を超えています
以下のファイルが500行を超えています。リファクタリングを検討してください。

## 検出されたファイル

| ファイル | 行数 | 超過行数 |
|---------|------|----------|
| `signal-processor-wasm/src/zero_cross_detector/mod.rs` | 536 | +36 |

## 推奨事項

1. ファイルを機能ごとに分割する
2. 共通ロジックを別モジュールに抽出する
3. クラスやインターフェースを適切なサイズに保つ

---
*このissueは自動生成されました*...
ラベル: refactoring, code-quality, automated
--- issue-notes/303.md の内容 ---

```markdown

```

## ドキュメントで言及されているファイルの内容
### .github/actions-tmp/issue-notes/3.md
```md
{% raw %}
# issue GitHub Actions「issue note生成」を共通ワークフロー化する #3
[issues #3](https://github.com/cat2151/github-actions/issues/3)

- 前提
  - userは、translateのworkflowを共通ワークフロー化し、動くようにしたので、共通ワークフロー化の知識がある
  - よって、今回は、promptでplanさせ、そのplanをuserがレビューし、planの改善を指示できるので、ハルシネーションのリスクを下げることができる

- prompt
```
あなたはGitHub Actionsと共通ワークフローのスペシャリストです。
このymlはまだ共通ワークフロー化されず、
呼び出し元からコピーされたままの状態です。
このymlファイル名のまま、
中身を共通ワークフロー化してください。
呼び出し元ymlは別途書きますので気にしないでください。
まずplanしてください
```

- plan 生成結果
```
共通ワークフロー化のためのplanは以下の通りです。

1. 目的
現在の issue-note.yml を「共通ワークフロー」として再設計し、他リポジトリや他ワークフローから workflow_call で呼び出せるようにする。
2. 主な変更点
on: トリガーを workflow_call に変更（直接イベントで起動しない）。
必要な入力（inputs）やシークレット（secrets）を workflow_call セクションで定義。
github.event.issue などのイベント依存部分を、inputs経由で受け取る形に修正。
既存の処理（issueノート生成、コミット、issue body更新）はそのまま活かすが、パラメータ化する。
3. 具体的な修正内容
on: issues: → on: workflow_call: に変更。
inputs で必要な値（例: issue_title, issue_number, issue_body, issue_url など）を受け取る。
スクリプト内の ${{ github.event.issue.xxx }} を ${{ inputs.xxx }} に置換。
github-script ステップも同様にinputsを参照。
必要に応じて secrets も workflow_call で受け取れるようにする。
4. ファイル名・配置
ファイル名はそのまま issue-note.yml。
配置場所は workflows でOK（共通ワークフローとしてもこの場所で良い）。
5. 呼び出し元への影響
呼び出し元ワークフローで uses: <repo>/.github/workflows/issue-note.yml@main のように参照し、inputsを渡す形になる。
このplanで進めます。次に、実際の共通ワークフロー化のためのyml修正案を作成しますか？
```

- userがplanレビューし、OKを出した
- agentに生成結果ymlをレビューさせた、OKとなった
  - userはこのレビューは認知負荷が高いのでskipとする（単純な細かい間違い探し作業になるので、それはagentに任せた）
-  エラー。呼び出し元ymlのエラーがあり修正。共通ワークフローのエラー指摘があり、共通ワークフロー側の修正が必要となった
```
原因の分析：

呼び出し元（tonejs-mml-to-jsonのissue-note.yml）は、reusable workflow（cat2151/github-actions/.github/workflows/issue-note.yml@main）をusesで呼び出し、inputsをwithで渡しています。
共通ワークフロー（reusable workflow）は inputs を workflow_call で受け取り、各ステップで ${{ inputs.xxx }} で参照しています。
しかし、エラーが発生したのは actions/github-script@v7 の script 内です。
エラーの本質的な原因：

actions/github-script の script: で ${{ inputs.issue_number }} のような式を直接 JavaScript テンプレートリテラル内で使っていますが、これはサポートされていません。
script: の中は JavaScript であり、YAMLの ${{ ... }} は展開されません（または意図通りに展開されません）。
そのため、inputs 変数は script 内の JavaScript で未定義となり、ReferenceError になります。
正しい書き方：

actions/github-script の script: でワークフローの inputs を使いたい場合は、with: で input を environment 変数や script の引数として渡し、JavaScript で process.env から取得するか、github-script の input 機能を使う必要があります。
例（修正版）：

このように、inputs の値を env で渡し、script 内では process.env で参照してください。

まとめ：

actions/github-script の script 内で ${{ inputs.xxx }} を直接使うと ReferenceError になる
env: で値を渡し、process.env で参照するのが正しい
修正が必要です。修正版のワークフローが必要な場合はお知らせください。
```

- test green
- closeとする

{% endraw %}
```

### signal-processor-wasm/src/frequency_estimation/mod.rs
```rs
{% raw %}
/// FrequencyEstimator module - Coordinates various frequency estimation methods
/// Follows the Single Responsibility Principle by delegating to specialized modules
///
/// Rust internal default method: autocorrelation (see non_default_methods/)
/// UI default is FFT (fft.rs + harmonic_analysis.rs) and will overwrite this internal default via configuration.
/// Non-default methods: see non_default_methods/ (may be deprecated in the future)

pub(crate) mod dsp_utils;
mod fft;
mod harmonic_analysis;
mod non_default_methods;
mod smoothing;

#[cfg(test)]
mod tests;

/// FrequencyEstimator handles frequency detection using various algorithms
pub struct FrequencyEstimator {
    frequency_estimation_method: String,
    estimated_frequency: f32,
    frequency_history: Vec<f32>,
    frequency_plot_history: Vec<f32>,
    buffer_size_multiplier: u32,
    
    // Harmonic analysis data for debugging (populated during FFT estimation)
    half_freq_peak_strength_percent: Option<f32>,
    candidate1_harmonics: Option<Vec<f32>>,
    candidate2_harmonics: Option<Vec<f32>>,
    candidate1_weighted_score: Option<f32>,
    candidate2_weighted_score: Option<f32>,
    selection_reason: Option<String>,
}

impl FrequencyEstimator {
    const MIN_FREQUENCY_HZ: f32 = 20.0;
    const MAX_FREQUENCY_HZ: f32 = 5000.0;
    const FFT_MAGNITUDE_THRESHOLD: u8 = 10;
    const FREQUENCY_PLOT_HISTORY_SIZE: usize = 100;
    
    pub fn new() -> Self {
        FrequencyEstimator {
            frequency_estimation_method: "autocorrelation".to_string(),
            estimated_frequency: 0.0,
            frequency_history: Vec::new(),
            frequency_plot_history: Vec::new(),
            buffer_size_multiplier: 16,
            half_freq_peak_strength_percent: None,
            candidate1_harmonics: None,
            candidate2_harmonics: None,
            candidate1_weighted_score: None,
            candidate2_weighted_score: None,
            selection_reason: None,
        }
    }
    
    /// Estimate frequency using the configured method
    pub fn estimate_frequency(
        &mut self,
        data: &[f32],
        frequency_data: Option<&[u8]>,
        sample_rate: f32,
        fft_size: usize,
        is_signal_above_noise_gate: bool,
    ) -> f32 {
        let raw_frequency = match self.frequency_estimation_method.as_str() {
            "zero-crossing" => non_default_methods::zero_crossing::estimate_frequency_zero_crossing(
                data,
                sample_rate,
                Self::MIN_FREQUENCY_HZ,
                Self::MAX_FREQUENCY_HZ,
            ),
            "fft" => {
                if let Some(freq_data) = frequency_data {
                    let result = fft::estimate_frequency_fft(
                        freq_data,
                        sample_rate,
                        fft_size,
                        is_signal_above_noise_gate,
                        &self.frequency_history,
                    );
                    
                    // Store FFT debug information
                    self.half_freq_peak_strength_percent = result.half_freq_peak_strength_percent;
                    self.candidate1_harmonics = result.candidate1_harmonics;
                    self.candidate2_harmonics = result.candidate2_harmonics;
                    self.candidate1_weighted_score = result.candidate1_weighted_score;
                    self.candidate2_weighted_score = result.candidate2_weighted_score;
                    self.selection_reason = result.selection_reason;
                    
                    result.frequency
                } else {
                    0.0
                }
            }
            "stft" => non_default_methods::stft::estimate_frequency_stft(
                data,
                sample_rate,
                is_signal_above_noise_gate,
                self.buffer_size_multiplier,
                Self::MIN_FREQUENCY_HZ,
                Self::MAX_FREQUENCY_HZ,
                Self::FFT_MAGNITUDE_THRESHOLD,
            ),
            "cqt" => non_default_methods::cqt::estimate_frequency_cqt(
                data,
                sample_rate,
                is_signal_above_noise_gate,
                Self::MIN_FREQUENCY_HZ,
                Self::MAX_FREQUENCY_HZ,
                Self::FFT_MAGNITUDE_THRESHOLD,
            ),
            _ => non_default_methods::autocorrelation::estimate_frequency_autocorrelation(
                data,
                sample_rate,
                Self::MIN_FREQUENCY_HZ,
                Self::MAX_FREQUENCY_HZ,
            ), // default: autocorrelation
        };
        
        // Apply frequency smoothing
        self.estimated_frequency = smoothing::smooth_frequency(raw_frequency, &mut self.frequency_history);
        
        // Add to plot history
        self.frequency_plot_history.push(self.estimated_frequency);
        if self.frequency_plot_history.len() > Self::FREQUENCY_PLOT_HISTORY_SIZE {
            self.frequency_plot_history.remove(0);
        }
        
        self.estimated_frequency
    }
    
    // Getters and setters
    pub fn get_frequency_estimation_method(&self) -> &str {
        &self.frequency_estimation_method
    }
    
    pub fn set_frequency_estimation_method(&mut self, method: &str) {
        if self.frequency_estimation_method != method {
            self.frequency_estimation_method = method.to_string();
            // Clear only frequency histories when method changes
            // (preserving harmonic analysis data which may still be useful)
            self.frequency_history.clear();
            self.frequency_plot_history.clear();
        }
    }
    
    pub fn get_max_frequency(&self) -> f32 {
        Self::MAX_FREQUENCY_HZ
    }
    
    pub fn get_min_frequency(&self) -> f32 {
        Self::MIN_FREQUENCY_HZ
    }
    
    pub fn get_frequency_plot_history(&self) -> Vec<f32> {
        self.frequency_plot_history.clone()
    }
    
    pub fn set_buffer_size_multiplier(&mut self, multiplier: u32) {
        // Validate multiplier is one of the allowed values (1, 4, or 16)
        // If invalid, keep the current value and log an error
        if multiplier == 1 || multiplier == 4 || multiplier == 16 {
            self.buffer_size_multiplier = multiplier;
        } else {
            #[cfg(target_arch = "wasm32")]
            {
                use wasm_bindgen::prelude::*;
                #[wasm_bindgen]
                extern "C" {
                    #[wasm_bindgen(js_namespace = console)]
                    fn error(s: &str);
                }
                error(&format!(
                    "Invalid buffer size multiplier {} received; keeping current value {}. Valid values are 1, 4, or 16.",
                    multiplier,
                    self.buffer_size_multiplier
                ));
            }
            #[cfg(not(target_arch = "wasm32"))]
            {
                eprintln!(
                    "Invalid buffer size multiplier {} received; keeping current value {}. Valid values are 1, 4, or 16.",
                    multiplier,
                    self.buffer_size_multiplier
                );
            }
        }
    }
    
    pub fn get_buffer_size_multiplier(&self) -> u32 {
        self.buffer_size_multiplier
    }
    
    pub fn get_half_freq_peak_strength_percent(&self) -> Option<f32> {
        self.half_freq_peak_strength_percent
    }
    
    pub fn get_candidate1_harmonics(&self) -> Option<Vec<f32>> {
        self.candidate1_harmonics.clone()
    }
    
    pub fn get_candidate2_harmonics(&self) -> Option<Vec<f32>> {
        self.candidate2_harmonics.clone()
    }
    
    pub fn get_candidate1_weighted_score(&self) -> Option<f32> {
        self.candidate1_weighted_score
    }
    
    pub fn get_candidate2_weighted_score(&self) -> Option<f32> {
        self.candidate2_weighted_score
    }
    
    pub fn get_selection_reason(&self) -> Option<String> {
        self.selection_reason.clone()
    }
    
    pub fn clear_history(&mut self) {
        self.frequency_history.clear();
        self.frequency_plot_history.clear();
        self.estimated_frequency = 0.0;
        // Clear harmonic analysis data as well
        self.half_freq_peak_strength_percent = None;
        self.candidate1_harmonics = None;
        self.candidate2_harmonics = None;
        self.candidate1_weighted_score = None;
        self.candidate2_weighted_score = None;
        self.selection_reason = None;
    }
}

{% endraw %}
```

### signal-processor-wasm/src/frequency_estimation/non_default_methods/mod.rs
```rs
{% raw %}
/// Non-default frequency estimation methods
/// These methods are activated when the user changes the Frequency Estimation dropdown
/// from the default (FFT). They may be deprecated in the future.
///
/// Default method: FFT (see ../fft.rs)
/// Non-default methods (this module):
///   - zero-crossing: Simple zero-crossing counting
///   - autocorrelation: Time-domain autocorrelation
///   - stft: Short-Time Fourier Transform
///   - cqt: Constant-Q Transform

pub mod zero_crossing;
pub mod autocorrelation;
pub mod stft;
pub mod cqt;

{% endraw %}
```

### signal-processor-wasm/src/zero_cross_detector/mod.rs
```rs
{% raw %}
/// ZeroCrossDetector module - Handles zero-crossing detection and phase 0 positioning
///
/// Default (Standard) mode: Hysteresis, core implementation lives in this module
///   - main logic in `find_stable_zero_cross` and the Standard branch of `find_phase_zero_in_segment`
/// Non-default modes: implemented in non_default_modes.rs (these modes may be deprecated in the future)

mod types;
mod utils;
mod default_mode;
mod non_default_modes;

pub use types::{DisplayRange, ZeroCrossMode};

use utils::*;
use default_mode::*;
use non_default_modes::*;

/// ZeroCrossDetector handles zero-crossing detection and display range calculation
pub struct ZeroCrossDetector {
    previous_zero_cross_index: Option<usize>,
    previous_peak_index: Option<usize>,
    use_peak_mode: bool,
    zero_cross_mode: ZeroCrossMode,
    // COORDINATE SPACE: segment-relative (0..segment.len())
    // History for segment-relative position tracking (for PeakBacktrackWithHistory and other modes)
    // Stores the offset within the 4-cycle segment, NOT frame buffer absolute position
    // This ensures the 1% constraint works correctly even when segment position changes each frame
    segment_phase_offset: Option<usize>,
    // COORDINATE SPACE: absolute (frame buffer position)
    // History for absolute position tracking (used by find_phase_zero_in_segment)
    // Stores the absolute position in the full buffer to track across segment position changes
    absolute_phase_offset: Option<usize>,
}

impl ZeroCrossDetector {
    const ZERO_CROSS_SEARCH_TOLERANCE_CYCLES: f32 = 0.5;
    /// Tolerance for history-based search (1/100 of one cycle = 1%)
    const HISTORY_SEARCH_TOLERANCE_RATIO: f32 = 0.01;
    /// Hysteresis threshold ratio (distance threshold for mode switching)
    const HYSTERESIS_THRESHOLD_RATIO: f32 = 2.0;
    /// Maximum search range multiplier for finding zero-crosses
    const MAX_SEARCH_RANGE_MULTIPLIER: f32 = 5.0;
    /// Number of cycles to display (must match CYCLES_TO_STORE in waveform_searcher)
    const CYCLES_TO_DISPLAY: usize = 4;
    /// Peak search range multiplier for initial detection
    const PEAK_SEARCH_MULTIPLIER: f32 = 1.5;
    /// Extended tolerance ratio for Standard mode (3% of cycle length)
    const STANDARD_MODE_EXTENDED_TOLERANCE_RATIO: f32 = 0.03;
    /// Extended tolerance multiplier for other modes (3x normal tolerance)
    const EXTENDED_TOLERANCE_MULTIPLIER: usize = 3;
    
    pub fn new() -> Self {
        ZeroCrossDetector {
            previous_zero_cross_index: None,
            previous_peak_index: None,
            use_peak_mode: false,
            zero_cross_mode: ZeroCrossMode::Hysteresis,
            segment_phase_offset: None,
            absolute_phase_offset: None,
        }
    }
    
    /// Set whether to use peak mode instead of zero-crossing mode
    pub fn set_use_peak_mode(&mut self, enabled: bool) {
        self.use_peak_mode = enabled;
    }
    
    /// Set zero-cross detection mode
    pub fn set_zero_cross_mode(&mut self, mode: ZeroCrossMode) {
        self.zero_cross_mode = mode;
        // Clear history when mode changes
        self.segment_phase_offset = None;
        self.absolute_phase_offset = None;
    }
    
    /// Get current zero-cross detection mode
    pub fn get_zero_cross_mode(&self) -> ZeroCrossMode {
        self.zero_cross_mode
    }
    
    /// Get current zero-cross detection mode as string (for debugging)
    pub fn get_zero_cross_mode_name(&self) -> String {
        match self.zero_cross_mode {
            ZeroCrossMode::Standard => "Standard".to_string(),
            ZeroCrossMode::PeakBacktrackWithHistory => "Peak+History (1% stable)".to_string(),
            ZeroCrossMode::BidirectionalNearest => "Bidirectional Nearest".to_string(),
            ZeroCrossMode::GradientBased => "Gradient Based".to_string(),
            ZeroCrossMode::AdaptiveStep => "Adaptive Step".to_string(),
            ZeroCrossMode::Hysteresis => "Hysteresis".to_string(),
            ZeroCrossMode::ClosestToZero => "Closest to Zero".to_string(),
        }
    }
    
    /// Get current history value for debugging
    /// Returns segment-relative offset (0..segment.len())
    pub fn get_segment_phase_offset(&self) -> Option<usize> {
        self.segment_phase_offset
    }
    
    /// Get current absolute phase offset for debugging
    /// Returns absolute position in the full buffer
    pub fn get_absolute_phase_offset(&self) -> Option<usize> {
        self.absolute_phase_offset
    }
    
    /// Reset detector state
    pub fn reset(&mut self) {
        self.previous_zero_cross_index = None;
        self.previous_peak_index = None;
        self.segment_phase_offset = None;
        self.absolute_phase_offset = None;
    }
    
    /// Find a stable peak position with temporal continuity
    fn find_stable_peak(&mut self, data: &[f32], estimated_cycle_length: f32) -> Option<usize> {
        if let Some(prev_peak) = self.previous_peak_index {
            if estimated_cycle_length > 0.0 {
                let tolerance = (estimated_cycle_length * Self::ZERO_CROSS_SEARCH_TOLERANCE_CYCLES) as usize;
                let search_start = prev_peak.saturating_sub(tolerance);
                let search_end = (prev_peak + tolerance).min(data.len());
                
                if search_start < data.len() && search_start < search_end {
                    if let Some(peak) = find_peak(data, search_start, Some(search_end)) {
                        self.previous_peak_index = Some(peak);
                        return Some(peak);
                    }
                }
            }
        }
        
        // Fallback: find first peak
        if let Some(peak) = find_peak(data, 0, None) {
            self.previous_peak_index = Some(peak);
            Some(peak)
        } else {
            None
        }
    }
    
    /// Find a stable zero-cross position with temporal continuity
    fn find_stable_zero_cross(&mut self, data: &[f32], estimated_cycle_length: f32) -> Option<usize> {
        if let Some(prev_zero) = self.previous_zero_cross_index {
            if estimated_cycle_length > 0.0 {
                let tolerance = (estimated_cycle_length * Self::ZERO_CROSS_SEARCH_TOLERANCE_CYCLES) as usize;
                let search_start = prev_zero.saturating_sub(tolerance);
                
                if search_start < data.len() {
                    if let Some(zero_cross) = find_zero_cross(data, search_start) {
                        let distance = if zero_cross >= prev_zero {
                            zero_cross - prev_zero
                        } else {
                            prev_zero - zero_cross
                        };
                        
                        if distance <= tolerance {
                            self.previous_zero_cross_index = Some(zero_cross);
                            return Some(zero_cross);
                        }
                    }
                }
            }
        }
        
        // Fallback: find first zero-cross
        if let Some(zero_cross) = find_zero_cross(data, 0) {
            self.previous_zero_cross_index = Some(zero_cross);
            Some(zero_cross)
        } else {
            None
        }
    }
    
    /// Find phase zero position within a segment, maintaining history in absolute coordinates
    /// This method is designed for Process B (phase marker positioning) where the segment
    /// position can change between frames due to similarity search.
    /// 
    /// # Arguments
    /// * `segment` - The 4-cycle segment slice
    /// * `segment_start_abs` - Absolute position of the segment start in the full buffer
    /// * `estimated_cycle_length` - Length of one cycle in samples
    /// 
    /// # Returns
    /// The segment-relative index of phase 0, or None if not found
    /// 
    /// # Coordinate Spaces
    /// - Input `segment`: relative (0..segment.len())
    /// - Input `segment_start_abs`: absolute (full buffer position)
    /// - Internal history: absolute (full buffer position)
    /// - Return value: relative (0..segment.len())
    pub fn find_phase_zero_in_segment(
        &mut self,
        segment: &[f32],
        segment_start_abs: usize,
        estimated_cycle_length: f32,
    ) -> Option<usize> {
        // If we don't have history or invalid cycle length, perform initial detection
        if self.absolute_phase_offset.is_none() || estimated_cycle_length < f32::EPSILON {
            // Initial detection based on current mode
            let zero_cross_rel = match self.zero_cross_mode {
                ZeroCrossMode::Standard => {
                    find_zero_cross(segment, 0)
                }
                ZeroCrossMode::PeakBacktrackWithHistory => {
                    // Find peak and backtrack
                    let search_end = if estimated_cycle_length > 0.0 {
                        (estimated_cycle_length * Self::PEAK_SEARCH_MULTIPLIER) as usize
                    } else {
                        segment.len() / 2
                    };

                    if let Some(peak_idx) = find_peak(segment, 0, Some(search_end.min(segment.len()))) {
                        find_zero_crossing_backward(segment, peak_idx)
                    } else {
                        find_zero_cross(segment, 0)
                    }
                }
                _ => {
                    // For other modes, use standard zero-cross detection
                    find_zero_cross(segment, 0)
                }
            }?;

            // Issue #296: Constrain initial position to the central 2 cycles of the 4-cycle segment.
            // The segment contains 4 cycles [0, 1, 2, 3] (0-based), each of length `cycle_length_usize`.
            // The "central 2 cycles" are cycles 1 and 2, corresponding to the half-open index range [L, 3L).
            // We use an inclusive lower bound and an exclusive upper bound: [min_allowed, max_allowed_exclusive).
            let mut constrained_rel = zero_cross_rel;
            if estimated_cycle_length > f32::EPSILON {
                let cycle_length_usize = estimated_cycle_length as usize;
                let min_allowed = cycle_length_usize; // Inclusive start of cycle 1
                let max_allowed_exclusive = cycle_length_usize * 3; // Exclusive end (start of cycle 3)

                // Clamp to segment bounds to handle short segments at buffer end
                let min_allowed = min_allowed.min(segment.len().saturating_sub(1));
                let max_allowed_exclusive = max_allowed_exclusive.min(segment.len());

                // Ensure min <= max
                if min_allowed < max_allowed_exclusive {
                    // If initial detection is outside the allowed range, search within the central 2 cycles
                    if constrained_rel < min_allowed || constrained_rel >= max_allowed_exclusive {
                        // Search for zero-cross starting from cycle 1
                        if let Some(zero_in_center) = find_zero_cross(segment, min_allowed) {
                            if zero_in_center < max_allowed_exclusive {
                                constrained_rel = zero_in_center;
                            }
                        }
                    }
                }
            }

            // Convert to absolute and store
            let zero_cross_abs = segment_start_abs + constrained_rel;
            self.absolute_phase_offset = Some(zero_cross_abs);
            return Some(constrained_rel);
        }
        
        // We have history - use new algorithm (Issue #289)
        // Extract all zero-cross candidates from 4-cycle buffer, then move toward nearest candidate
        let history_abs = self.absolute_phase_offset.unwrap();

        // Convert absolute history to segment-relative
        // Check if history is within the current segment
        if history_abs < segment_start_abs || history_abs >= segment_start_abs + segment.len() {
            // History is outside current segment - perform fresh detection
            let zero_cross_rel = find_zero_cross(segment, 0)?;

            // Issue #296: Constrain fresh detection to the central 2 cycles of the 4-cycle segment.
            // Range: [cycle_length, cycle_length*3) - cycles 1 and 2 only
            let mut constrained_rel = zero_cross_rel;
            if estimated_cycle_length > f32::EPSILON {
                let cycle_length_usize = estimated_cycle_length as usize;
                let min_allowed = cycle_length_usize; // Inclusive start of cycle 1
                let max_allowed_exclusive = cycle_length_usize * 3; // Exclusive end (start of cycle 3)

                // Clamp to segment bounds to handle short segments at buffer end
                let min_allowed = min_allowed.min(segment.len().saturating_sub(1));
                let max_allowed_exclusive = max_allowed_exclusive.min(segment.len());

                // Ensure min <= max
                if min_allowed < max_allowed_exclusive {
                    // If detection is outside the allowed range, search within the central 2 cycles
                    if constrained_rel < min_allowed || constrained_rel >= max_allowed_exclusive {
                        // Search for zero-cross starting from cycle 1
                        if let Some(zero_in_center) = find_zero_cross(segment, min_allowed) {
                            if zero_in_center < max_allowed_exclusive {
                                constrained_rel = zero_in_center;
                            }
                        }
                    }
                }
            }

            let zero_cross_abs = segment_start_abs + constrained_rel;
            self.absolute_phase_offset = Some(zero_cross_abs);
            return Some(constrained_rel);
        }

        let history_rel = history_abs - segment_start_abs;

        // Calculate 1% tolerance for movement constraint
        let tolerance = ((estimated_cycle_length * Self::HISTORY_SEARCH_TOLERANCE_RATIO) as usize).max(1);

        // Issue #296: Calculate allowed range for the central 2 cycles of the 4-cycle segment.
        // The segment contains 4 cycles [0, 1, 2, 3] (0-based), each of length `cycle_length_usize`.
        // The "central 2 cycles" are cycles 1 and 2, corresponding to the half-open index range [L, 3L).
        let cycle_length_usize = estimated_cycle_length as usize;
        let min_allowed = cycle_length_usize; // Inclusive start of cycle 1
        let max_allowed_exclusive = cycle_length_usize * 3; // Exclusive end (start of cycle 3)

        // Clamp to segment bounds to handle short segments at buffer end
        let min_allowed = min_allowed.min(segment.len().saturating_sub(1));
        let max_allowed_exclusive = max_allowed_exclusive.min(segment.len());

        // If segment is too short for the constraint, just return history as-is
        if min_allowed >= max_allowed_exclusive {
            return Some(history_rel.min(segment.len().saturating_sub(1)));
        }

        // Find the nearest zero-cross candidate in a single pass (avoiding Vec allocation)
        // Only search within the central 2 cycles to prevent markers from disappearing at edges
        let mut nearest_candidate: Option<usize> = None;
        let mut min_distance = usize::MAX;

        // Search range includes positions that can be valid: [min_allowed, max_allowed_exclusive)
        // Need to check segment[i] and segment[i+1], so stop before last element
        let search_start = min_allowed;
        let search_end = (max_allowed_exclusive.saturating_sub(1)).min(segment.len().saturating_sub(1));

        for i in search_start..=search_end {
            if i + 1 < segment.len() && segment[i] <= 0.0 && segment[i + 1] > 0.0 {
                let distance = if i >= history_rel {
                    i - history_rel
                } else {
                    history_rel - i
                };

                if distance < min_distance {
                    min_distance = distance;
                    nearest_candidate = Some(i);
                }
            }
        }

        // If no candidates exist, don't move (keep history, but clamp to allowed range)
        let nearest = match nearest_candidate {
            Some(n) => n,
            None => {
                // Issue #296: Clamp history_rel to allowed range before returning
                // Ensure result is within [0, segment.len()) and [min_allowed, max_allowed_exclusive)
                let mut clamped = history_rel;
                if clamped < min_allowed {
                    clamped = min_allowed;
                } else if clamped >= max_allowed_exclusive {
                    clamped = max_allowed_exclusive.saturating_sub(1);
                }
                // Final bounds check
                clamped = clamped.min(segment.len().saturating_sub(1));
                let new_abs = segment_start_abs + clamped;
                self.absolute_phase_offset = Some(new_abs);
                return Some(clamped);
            }
        };

        // Determine direction to move toward the nearest candidate
        if nearest == history_rel {
            // Already at a zero-cross, no movement needed
            // Issue #296: But still clamp to allowed range
            let mut clamped = history_rel;
            if clamped < min_allowed {
                clamped = min_allowed;
            } else if clamped >= max_allowed_exclusive {
                clamped = max_allowed_exclusive.saturating_sub(1);
            }
            // Final bounds check
            clamped = clamped.min(segment.len().saturating_sub(1));
            let new_abs = segment_start_abs + clamped;
            self.absolute_phase_offset = Some(new_abs);
            return Some(clamped);
        }

        // Calculate the new position, constrained to move at most 1% per frame
        let mut new_rel = if nearest > history_rel {
            // Move right (toward future)
            let distance = nearest - history_rel;
            let step = distance.min(tolerance);
            history_rel + step
        } else {
            // Move left (toward past)
            let distance = history_rel - nearest;
            let step = distance.min(tolerance);
            history_rel.saturating_sub(step)
        };

        // Issue #296: Clamp new_rel to the allowed range (central 2 cycles)
        if new_rel < min_allowed {
            new_rel = min_allowed;
        } else if new_rel >= max_allowed_exclusive {
            new_rel = max_allowed_exclusive.saturating_sub(1);
        }
        // Final bounds check
        new_rel = new_rel.min(segment.len().saturating_sub(1));

        // Update history with new absolute position (continuous)
        let new_abs = segment_start_abs + new_rel;
        self.absolute_phase_offset = Some(new_abs);

        // Return the gradually moved position directly (NOT snapped to zero-cross)
        //
        // DESIGN DECISION: Prioritize smooth 1% movement over exact zero-cross position
        //
        // Rationale:
        // - Zero-cross candidates can jump wildly between frames (due to noise, etc.)
        // - If we snap to the nearest zero-cross, the red line will jump visually
        // - Jumpy movement provides poor visual experience for users
        // - Therefore, we accept that the marker may not be at an exact zero-cross
        // - The 1% gradual movement constraint is prioritized for smooth visual experience
        //
        // This means the red line position represents "moving toward the nearest zero-cross"
        // rather than "exactly at a zero-cross", which is acceptable for visual stability.
        Some(new_rel)
    }
    
    /// Calculate display range based on zero-crossing or peak detection
    pub fn calculate_display_range(
        &mut self,
        data: &[f32],
        estimated_frequency: f32,
        sample_rate: f32,
    ) -> Option<DisplayRange> {
        let estimated_cycle_length = if estimated_frequency > 0.0 && sample_rate > 0.0 {
            sample_rate / estimated_frequency
        } else {
            0.0
        };
        
        if self.use_peak_mode {
            // Peak mode
            let first_peak = self.find_stable_peak(data, estimated_cycle_length)?;
            let second_peak = if estimated_cycle_length > 0.0 {
                find_next_peak(data, first_peak, estimated_cycle_length)
            } else {
                None
            };
            
            // Display CYCLES_TO_DISPLAY (4) cycles worth of waveform
            let end_index = if estimated_cycle_length > 0.0 {
                let waveform_length = (estimated_cycle_length * Self::CYCLES_TO_DISPLAY as f32).floor() as usize;
                (first_peak + waveform_length).min(data.len())
            } else {
                data.len()
            };
            
            Some(DisplayRange {
                start_index: first_peak,
                end_index,
                first_zero_cross: first_peak, // Alignment point (peak in peak mode)
                second_zero_cross: second_peak, // Second alignment point (peak in peak mode)
            })
        } else {
            // Zero-crossing mode - choose method based on zero_cross_mode
            let first_zero = match self.zero_cross_mode {
                ZeroCrossMode::Standard => {
                    self.find_stable_zero_cross(data, estimated_cycle_length)?
                }
                ZeroCrossMode::PeakBacktrackWithHistory => {
                    find_zero_cross_peak_backtrack_with_history(
                        data,
                        estimated_cycle_length,
                        &mut self.segment_phase_offset,
                        Self::HISTORY_SEARCH_TOLERANCE_RATIO,
                    )?
                }
                ZeroCrossMode::BidirectionalNearest => {
                    find_zero_cross_bidirectional_nearest(
                        data,
                        estimated_cycle_length,
                        &mut self.segment_phase_offset,
                        Self::HISTORY_SEARCH_TOLERANCE_RATIO,
                        Self::MAX_SEARCH_RANGE_MULTIPLIER,
                    )?
                }
                ZeroCrossMode::GradientBased => {
                    find_zero_cross_gradient_based(
                        data,
                        estimated_cycle_length,
                        &mut self.segment_phase_offset,
                        Self::HISTORY_SEARCH_TOLERANCE_RATIO,
                    )?
                }
                ZeroCrossMode::AdaptiveStep => {
                    find_zero_cross_adaptive_step(
                        data,
                        estimated_cycle_length,
                        &mut self.segment_phase_offset,
                        Self::HISTORY_SEARCH_TOLERANCE_RATIO,
                    )?
                }
                ZeroCrossMode::Hysteresis => {
                    find_zero_cross_hysteresis(
                        data,
                        estimated_cycle_length,
                        &mut self.segment_phase_offset,
                        Self::HISTORY_SEARCH_TOLERANCE_RATIO,
                        Self::HYSTERESIS_THRESHOLD_RATIO,
                        Self::MAX_SEARCH_RANGE_MULTIPLIER,
                    )?
                }
                ZeroCrossMode::ClosestToZero => {
                    find_zero_cross_closest_to_zero(
                        data,
                        estimated_cycle_length,
                        &mut self.segment_phase_offset,
                        Self::HISTORY_SEARCH_TOLERANCE_RATIO,
                    )?
                }
            };
            
            let second_zero = find_next_zero_cross(data, first_zero);
            
            // Display CYCLES_TO_DISPLAY (4) cycles worth of waveform
            let end_index = if estimated_cycle_length > 0.0 {
                let waveform_length = (estimated_cycle_length * Self::CYCLES_TO_DISPLAY as f32).floor() as usize;
                (first_zero + waveform_length).min(data.len())
            } else {
                data.len()
            };
            
            Some(DisplayRange {
                start_index: first_zero,
                end_index,
                first_zero_cross: first_zero,
                second_zero_cross: second_zero,
            })
        }
    }
}

{% endraw %}
```

## 最近の変更（過去7日間）
### コミット履歴:
610ec53 Merge pull request #302 from cat2151/codex/fix-end-location-issue
2070ae7 chore: update comments and tests per review
8971571 fix: align phase end marker to start cycle
3e018ab chore: record plan for phase marker fix
b43381c Initial plan
8c35f12 Add issue note for #301 [auto]
c56fc62 Add issue note for #299 [auto]
c95ad0e Merge pull request #298 from cat2151/claude/remove-debug-log-message
8b650fd returnタプルの5番目の要素を修正: segment_relative時にNoneを返すよう修正 (issue #285)
25e53ef デバッグ用console.logを削除: Phase Debug messageを削除 (issue #285)

### 変更されたファイル:
.github/CHECK_LARGE_FILES.md
.github/workflows/call-check-large-files.yml
.github/workflows/check-large-files.yml
README.ja.md
README.md
dist/ComparisonPanelRenderer.d.ts.map
dist/WaveformDataProcessor.d.ts
dist/WaveformDataProcessor.d.ts.map
dist/assets/Oscilloscope-0AkMdwqr.js
dist/assets/Oscilloscope-0AkMdwqr.js.map
dist/assets/Oscilloscope-Bzx1rOH_.js
dist/assets/Oscilloscope-Bzx1rOH_.js.map
dist/assets/demo-B8LH4eBp.js
dist/assets/demo-B8LH4eBp.js.map
dist/assets/main-DNW0ajie.js
dist/assets/main-DNW0ajie.js.map
dist/cat-oscilloscope.cjs
dist/cat-oscilloscope.cjs.map
dist/cat-oscilloscope.mjs
dist/cat-oscilloscope.mjs.map
dist/demo-simple.html
dist/index.html
dist/wasm/signal_processor_wasm.d.ts
dist/wasm/signal_processor_wasm.js
dist/wasm/signal_processor_wasm_bg.wasm
dist/wasm/signal_processor_wasm_bg.wasm.d.ts
generated-docs/development-status-generated-prompt.md
generated-docs/project-overview-generated-prompt.md
issue-notes/299.md
issue-notes/301.md
public/wasm/signal_processor_wasm.d.ts
public/wasm/signal_processor_wasm.js
public/wasm/signal_processor_wasm_bg.wasm
public/wasm/signal_processor_wasm_bg.wasm.d.ts
signal-processor-wasm/src/lib.rs
signal-processor-wasm/src/zero_cross_detector/mod.rs
src/WaveformDataProcessor.ts
src/__tests__/phase-marker-constraint-issue296.test.ts
src/__tests__/waveform-data-processor.test.ts


---
Generated at: 2026-02-09 07:11:10 JST
