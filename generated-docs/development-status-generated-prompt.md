Last updated: 2026-02-10

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
## [Issue #315](../issue-notes/315.md): 大きなファイルの検出: 1個のファイルが500行を超えています
以下のファイルが500行を超えています。リファクタリングを検討してください。

## 検出されたファイル

| ファイル | 行数 | 超過行数 |
|---------|------|----------|
| `signal-processor-wasm/src/lib.rs` | 560 | +60 |

## 推奨事項

1. ファイルを機能ごとに分割する
2. 共通ロジックを別モジュールに抽出する
3. クラスやインターフェースを適切なサイズに保つ

---
*このissueは自動生成されました*...
ラベル: refactoring, code-quality, automated
--- issue-notes/315.md の内容 ---

```markdown

```

## ドキュメントで言及されているファイルの内容
### .github/actions-tmp/issue-notes/15.md
```md
{% raw %}
# issue project_summary scripts cjs を分解し、できるだけ1ファイル200行未満にし、agentによるメンテをしやすくする #15
[issues #15](https://github.com/cat2151/github-actions/issues/15)

# 状況
- agentに、最初の小さな一歩のAgent実行プロンプトを実行させた
- 結果、以下を得た：
    - project_summary_cjs_analysis.md
- どうする？
    - 次の一手をagentに生成させてみる（翌日の日次バッチで自動生成させる）
- 結果
    - 生成させたpromptをレビューした
    - promptを修正した
    - agentに投げた
    - 結果、GitUtils.cjsを切り出しできた
    - それをリファクタリングミスがないかチェックさせた
    - agentによるチェック結果は合格だった
- どうする？
    - 次の一手をagentに生成させてみる（翌日の日次バッチで自動生成させる）
- 結果
    - 生成させたpromptをレビューした
        - promptの対象ファイルから project_summary_cjs_analysis.md が漏れていることがわかったので修正した
    - promptを修正した
    - agentに投げた
    - 結果、FileSystemUtils.cjsを切り出しできた
    - それをリファクタリングミスがないかチェックさせた
    - agentによるチェック結果は合格だった
- どうする？
    - 次の一手をagentに生成させてみる（翌日の日次バッチで自動生成させる）
- 結果
    - 生成させたpromptをレビューした
    - 今回は低品質、NG、と判断した
    - 判断基準は、project_summary_cjs_analysis.md と乖離してしまっている点。今回はハルシネーションを含んだplanである、と判断した
    - 人力でpromptを書き、planさせ、plan結果をレビューし、agentに投げた
    - 結果、CodeAnalyzer.cjsとProjectAnalyzer.cjsを切り出しできた
- どうする？
    - 次の一手をagentに生成させてみる（翌日の日次バッチで自動生成させる）
    - 備考、課題、Geminiに生成させているdocumentは2つある。かなり位置づけが違うものである。
        - projectのソースファイル分析。
        - projectのissues分析。
        - この2つについて、class, cjs, yml まで分割をするかを、あとで検討する。
        - おそらく、class分割どまりとし、ソースファイル分析結果をissues分析の参考資料としてGeminiのcontextに与える改善をする、がよい、と想定しておく。
- 課題、エラーで落ちた。昨日は落ちてない。
    - 原因、昨日のagentのリファクタリング時に、ハルシネーションで、
        - codeが破壊されていた
        - run メソッドが削除されていた
        - 一つ前のrevisionにはrun メソッドがあった
        - ほかにもcode破壊があったのかは不明、調査省略、明日の日次バッチをtestと調査として利用するつもり
- どうする？
    - 単純に一つ前のrevisionからrun メソッドを復活させ、明日の日次バッチをtestと調査として利用する
- 再発防止策は？
    - ノーアイデア。昨日それなりにagentにチェックをさせたはずだが根本的な大きなミスが発生していた。
    - 構文チェックは通っていたが、問題を検知できなかった。
    - チェックが機能していない、あるいは機能として不足している。
    - 分析。変更量が大きかったぶんミスのリスクが増えていた。
    - 対策案。もっと小さく一歩ずつ変更させる。
    - 対策案。リファクタリング時、いきなりメソッド削除をさせない。
        - まず全cjsの全メソッドのlistをさせる。
        - のち、削除対象の重複メソッドのlistをさせる。
        - そして削除planをさせる。
        - のち、削除させる。
        - さらに削除後のメソッドlistをさせる。
        - そして削除しすぎていないかを削除前後のlist比較でチェックさせる。
        - これでrunまで削除してしまうのを防止できるかもしれない。
        - これは人力からみると、おかしな話である。人力なら1つずつ移動をするだけであり、ミスのしようがない。
        - LLMの典型的なハルシネーション問題の一つである、と認識する
- 結果は？
    - test green
    - run メソッドの人力復活は成功した
    - 日次バッチで生成した次の一手のpromptを投げた
    - リファクタリング成功した。ProjectSummaryGenerator を切り出した
- どうする？
    - 次の一手をagentに生成させてみる（agentに投げるpromptを、翌日の日次バッチで自動生成させる）
- 結果
    - 先に、2つのdocument生成を、1つずつ生成できるよう疎結合にリファクタリング、をしたほうがよさそう
    - agentにそれを投げた
    - 成功した、と判断する
    - 課題、`BaseSummaryGenerator.cjs` は、baseの機能と、`ProjectOverviewGenerator.cjs`専用の機能とが混ざっている。
        - baseに集約すべきは、`ProjectSummaryCoordinator.cjs`と`ProjectOverviewGenerator.cjs`とが必ずどちらも使う機能、である、と考える。
        - 対策、明日以降それをagentに投げる
    - `project_summary_cjs_analysis.md` は削除とする。役目が完了した、と判断する。リファクタリング前のソース構造の分析documentであり、今は存在しているとわかりづらくなる。シンプル優先のため削除とする。
- どうする？
    - 次の一手をagentに生成させてみる（agentに投げるpromptを、翌日の日次バッチで自動生成させる）
- 結果
    - test green
    - `BaseSummaryGenerator.cjs` を切り出したのは成功した、と判断する
    - `BaseSummaryGenerator.cjs` を2分割するため、agentにplanさせた
    - レビューした
    - agentに2分割させた
    - レビューした。OKと判断する
- どうする？
    - 次の一手をagentに生成させてみる（agentに投げるpromptを、翌日の日次バッチで自動生成させる）
- 結果
    - test green
    - `BaseSummaryGenerator.cjs` を2分割は成功した、と判断する
    - issue track機能構造をリファクタリングし、以下にする
        - development status generator : baseを継承する
        - issue tracker : 汎用関数群
    - agentに実施させた
    - レビューした。OKと判断する
- どうする？
    - 次の一手をagentに生成させてみる（agentに投げるpromptを、翌日の日次バッチで自動生成させる）
- 結果
    - test green
    - DevelopmentStatusGeneratorとissue trackerのリファクタリングは成功した、と判断する
    - ProjectOverview生成機能のリファクタリングをする
    - agentに実施させた
    - レビューした。OKと判断する
- どうする？
    - 次の一手をagentに生成させてみる（agentに投げるpromptを、翌日の日次バッチで自動生成させる）
- 結果
    - test green
    - ProjectOverview生成機能のリファクタリングは成功した、と判断する
    - 課題、overviewと、developmentStatusとが混在し、dirが読みづらい。
    - 対策、shared/、overview/、development/、の3つのdirに切り分ける
    - agentに分析、planさせ、レビューし、planさせ、実施させた
    - レビューした。OKと判断する
- どうする？
    - 次の一手をagentに生成させてみる（agentに投げるpromptを、翌日の日次バッチで自動生成させる）
- 結果
    - test green
    - shared/、overview/、development/、の3つのdirに切り分けるリファクタリングは成功した、と判断する
    - agentに、agentがメンテしやすいか？の観点からレビューさせた
    - 詳細は割愛
        - `> 最優先で取り組むべきは 設定管理の一元化 と エラーハンドリングの統一 です。これにより、Agentにとって予測可能で理解しやすいコードベースになります。`
        - それは別issueで、設定変更をマストでやるので、OKと判断する
- これでagentによるメンテは十分しやすくなった、と判断する
- closeとする

{% endraw %}
```

### signal-processor-wasm/src/lib.rs
```rs
{% raw %}
use wasm_bindgen::prelude::*;

mod frequency_estimation;
mod zero_cross_detector;
mod waveform_searcher;
mod gain_controller;
mod bpf;
mod waveform_render_data;
mod dft;

use frequency_estimation::FrequencyEstimator;
use zero_cross_detector::ZeroCrossDetector;
use waveform_searcher::{WaveformSearcher, CYCLES_TO_STORE};
use gain_controller::GainController;

pub use waveform_render_data::WaveformRenderData;

/// WasmDataProcessor - WASM implementation of WaveformDataProcessor
#[wasm_bindgen]
pub struct WasmDataProcessor {
    gain_controller: GainController,
    frequency_estimator: FrequencyEstimator,
    zero_cross_detector: ZeroCrossDetector,
    waveform_searcher: WaveformSearcher,
}

#[wasm_bindgen]
impl WasmDataProcessor {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        WasmDataProcessor {
            gain_controller: GainController::new(),
            frequency_estimator: FrequencyEstimator::new(),
            zero_cross_detector: ZeroCrossDetector::new(),
            waveform_searcher: WaveformSearcher::new(),
        }
    }
    
    /// Process a frame and return WaveformRenderData
    #[wasm_bindgen(js_name = processFrame)]
    pub fn process_frame(
        &mut self,
        waveform_data: &[f32],
        frequency_data: Option<Vec<u8>>,
        sample_rate: f32,
        fft_size: usize,
        fft_display_enabled: bool,
    ) -> Option<WaveformRenderData> {
        if waveform_data.is_empty() {
            web_sys::console::log_1(&"No data: Waveform data is empty".into());
            return None;
        }
        
        // Convert to mutable Vec for noise gate processing
        let mut data = waveform_data.to_vec();
        
        // Apply noise gate
        self.gain_controller.apply_noise_gate(&mut data);
        
        // Check if signal passed noise gate
        let is_signal_above_noise_gate = self.gain_controller.is_signal_above_noise_gate(&data);
        
        // Determine if we need frequency data
        let needs_frequency_data = 
            self.frequency_estimator.get_frequency_estimation_method() == "fft" || fft_display_enabled;
        let freq_data = if needs_frequency_data {
            frequency_data
        } else {
            None
        };
        
        // Estimate frequency
        let estimated_frequency = self.frequency_estimator.estimate_frequency(
            &data,
            freq_data.as_deref(),
            sample_rate,
            fft_size,
            is_signal_above_noise_gate,
        );
        
        // Calculate cycle length
        let cycle_length = if estimated_frequency > 0.0 && sample_rate > 0.0 {
            sample_rate / estimated_frequency
        } else {
            0.0
        };
        
        // Try to find similar waveform
        // COORDINATE SPACE: frame buffer positions
        let mut selected_segment_buffer_position = 0;
        let mut selected_segment_buffer_end = data.len();
        let mut used_similarity_search = false;
        
        if self.waveform_searcher.has_previous_waveform() && cycle_length > 0.0 {
            if let Some(search_result) = self.waveform_searcher.search_similar_waveform(&data, cycle_length) {
                // Display N cycles worth (where N is CYCLES_TO_STORE)
                let waveform_length = (cycle_length * CYCLES_TO_STORE as f32).floor() as usize;
                selected_segment_buffer_position = search_result.start_index;
                selected_segment_buffer_end = (selected_segment_buffer_position + waveform_length).min(data.len());
                used_similarity_search = true;
            }
            // Note: Similarity history is always updated inside search_similar_waveform(),
            // even when it returns None (validation failures or low similarity)
        } else {
            // Cannot perform similarity search (no previous waveform or invalid cycle length)
            // Record this in history to keep the graph updating
            if self.waveform_searcher.has_previous_waveform() {
                self.waveform_searcher.record_no_search();
            }
        }
        
        // Fallback to zero-cross alignment if similarity search not used
        if !used_similarity_search {
            // Use zero-cross alignment
            if let Some(display_range) = self.zero_cross_detector.calculate_display_range(
                &data,
                estimated_frequency,
                sample_rate,
            ) {
                selected_segment_buffer_position = display_range.start_index;
                selected_segment_buffer_end = display_range.end_index;
            } else {
                // Zero-cross detection failed, calculate 4 cycles from start based on frequency estimation
                selected_segment_buffer_position = 0;
                if cycle_length > 0.0 {
                    let waveform_length = (cycle_length * CYCLES_TO_STORE as f32).floor() as usize;
                    selected_segment_buffer_end = waveform_length.min(data.len());
                } else {
                    // No frequency estimation available, use entire buffer as last resort
                    selected_segment_buffer_end = data.len();
                }
            }
        }
        
        // Calculate auto gain
        self.gain_controller.calculate_auto_gain(&data, selected_segment_buffer_position, selected_segment_buffer_end);
        let gain = self.gain_controller.get_current_gain();
        
        // Store waveform for next frame (N cycles worth, where N is CYCLES_TO_STORE)
        if cycle_length > 0.0 {
            let waveform_length = (cycle_length * CYCLES_TO_STORE as f32).floor() as usize;
            let end_index = (selected_segment_buffer_position + waveform_length).min(data.len());
            self.waveform_searcher.store_waveform(&data, selected_segment_buffer_position, end_index);
        }
        
        // Get waveform search data
        let previous_waveform = self.waveform_searcher.get_previous_waveform();
        let similarity = self.waveform_searcher.get_last_similarity();
        let similarity_plot_history = self.waveform_searcher.get_similarity_history();
        
        // Calculate phase marker positions and collect debug information
        // The display shows 4 cycles, we skip the first cycle and find phase markers in the middle region
        let (phase_zero_index, phase_two_pi_index, phase_minus_quarter_pi_index, phase_two_pi_plus_quarter_pi_index,
             phase_zero_segment_relative, phase_zero_history, phase_zero_tolerance) = 
            if cycle_length > 0.0 && selected_segment_buffer_position < selected_segment_buffer_end {
                self.calculate_phase_markers_with_debug(&data, selected_segment_buffer_position, cycle_length, estimated_frequency, sample_rate)
            } else {
                (None, None, None, None, None, None, None)
            };
        
        // Get zero-cross mode name for debugging
        let zero_cross_mode_name = Some(self.zero_cross_detector.get_zero_cross_mode_name());
        
        // Calculate cycle similarities for the current waveform
        let (cycle_similarities_8div, cycle_similarities_4div, cycle_similarities_2div) = 
            if cycle_length > 0.0 && selected_segment_buffer_position < selected_segment_buffer_end {
                self.waveform_searcher.calculate_cycle_similarities(
                    &data[selected_segment_buffer_position..selected_segment_buffer_end],
                    cycle_length
                )
            } else {
                (Vec::new(), Vec::new(), Vec::new())
            };

        // Collect zero-cross candidates within the displayed segment and determine highlighted candidate
        let zero_cross_candidates = self.collect_zero_cross_candidates(
            &data,
            selected_segment_buffer_position,
            selected_segment_buffer_end,
        );
        let highlighted_zero_cross_candidate = self.select_candidate_with_max_positive_peak(
            &data,
            selected_segment_buffer_position,
            selected_segment_buffer_end,
            &zero_cross_candidates,
        );
        
        Some(WaveformRenderData {
            waveform_data: data,
            selected_segment_buffer_position,
            selected_segment_buffer_end,
            gain,
            estimated_frequency,
            frequency_plot_history: self.frequency_estimator.get_frequency_plot_history(),
            sample_rate,
            fft_size,
            frequency_data: freq_data,
            is_signal_above_noise_gate,
            max_frequency: self.frequency_estimator.get_max_frequency(),
            previous_waveform,
            similarity,
            similarity_plot_history,
            used_similarity_search,
            phase_zero_index,
            phase_two_pi_index,
            phase_minus_quarter_pi_index,
            phase_two_pi_plus_quarter_pi_index,
            zero_cross_candidates,
            highlighted_zero_cross_candidate,
            half_freq_peak_strength_percent: self.frequency_estimator.get_half_freq_peak_strength_percent(),
            candidate1_harmonics: self.frequency_estimator.get_candidate1_harmonics(),
            candidate2_harmonics: self.frequency_estimator.get_candidate2_harmonics(),
            candidate1_weighted_score: self.frequency_estimator.get_candidate1_weighted_score(),
            candidate2_weighted_score: self.frequency_estimator.get_candidate2_weighted_score(),
            selection_reason: self.frequency_estimator.get_selection_reason(),
            cycle_similarities_8div,
            cycle_similarities_4div,
            cycle_similarities_2div,
            phase_zero_segment_relative,
            phase_zero_history,
            phase_zero_tolerance,
            zero_cross_mode_name,
        })
    }
    
    // Configuration methods
    #[wasm_bindgen(js_name = setAutoGain)]
    pub fn set_auto_gain(&mut self, enabled: bool) {
        self.gain_controller.set_auto_gain(enabled);
    }
    
    #[wasm_bindgen(js_name = setNoiseGate)]
    pub fn set_noise_gate(&mut self, enabled: bool) {
        self.gain_controller.set_noise_gate(enabled);
    }
    
    #[wasm_bindgen(js_name = setNoiseGateThreshold)]
    pub fn set_noise_gate_threshold(&mut self, threshold: f32) {
        self.gain_controller.set_noise_gate_threshold(threshold);
    }
    
    #[wasm_bindgen(js_name = setFrequencyEstimationMethod)]
    pub fn set_frequency_estimation_method(&mut self, method: &str) {
        self.frequency_estimator.set_frequency_estimation_method(method);
    }
    
    #[wasm_bindgen(js_name = setBufferSizeMultiplier)]
    pub fn set_buffer_size_multiplier(&mut self, multiplier: u32) {
        self.frequency_estimator.set_buffer_size_multiplier(multiplier);
    }
    
    #[wasm_bindgen(js_name = setUsePeakMode)]
    pub fn set_use_peak_mode(&mut self, enabled: bool) {
        self.zero_cross_detector.set_use_peak_mode(enabled);
    }
    
    #[wasm_bindgen(js_name = setZeroCrossMode)]
    pub fn set_zero_cross_mode(&mut self, mode: &str) {
        use zero_cross_detector::ZeroCrossMode;
        
        let zero_cross_mode = match mode {
            "standard" => ZeroCrossMode::Standard,
            "peak-backtrack-history" => ZeroCrossMode::PeakBacktrackWithHistory,
            "bidirectional-nearest" => ZeroCrossMode::BidirectionalNearest,
            "gradient-based" => ZeroCrossMode::GradientBased,
            "adaptive-step" => ZeroCrossMode::AdaptiveStep,
            "hysteresis" => ZeroCrossMode::Hysteresis,
            "closest-to-zero" => ZeroCrossMode::ClosestToZero,
            _ => {
                web_sys::console::warn_1(&format!("Unknown zero-cross mode: {}, using default (hysteresis)", mode).into());
                ZeroCrossMode::Hysteresis
            }
        };
        
        self.zero_cross_detector.set_zero_cross_mode(zero_cross_mode);
    }
    
    #[wasm_bindgen(js_name = reset)]
    pub fn reset(&mut self) {
        self.frequency_estimator.clear_history();
        self.zero_cross_detector.reset();
        self.waveform_searcher.reset();
    }
    
    /// Calculate phase marker positions for the waveform
    /// Returns (phase_0, phase_2pi, phase_-pi/4, phase_2pi+pi/4) as sample indices
    /// 
    /// Uses zero_cross_detector to find phase 0 position within the displayed 4-cycle segment,
    /// respecting the dropdown selection (Hysteresis, Peak+History with 1% constraint, etc.)
    fn calculate_phase_markers(
        &mut self,
        data: &[f32],
        segment_buffer_position: usize,
        cycle_length: f32,
        estimated_frequency: f32,
        sample_rate: f32,
    ) -> (Option<usize>, Option<usize>, Option<usize>, Option<usize>) {
        let (phase_zero, phase_2pi, phase_minus_quarter_pi, phase_2pi_plus_quarter_pi, _, _, _) = 
            self.calculate_phase_markers_with_debug(data, segment_buffer_position, cycle_length, estimated_frequency, sample_rate);
        (phase_zero, phase_2pi, phase_minus_quarter_pi, phase_2pi_plus_quarter_pi)
    }
    
    /// Calculate phase marker positions with debug information
    /// Returns (phase_0, phase_2pi, phase_-pi/4, phase_2pi+pi/4, segment_relative, history, tolerance)
    fn calculate_phase_markers_with_debug(
        &mut self,
        data: &[f32],
        segment_buffer_position: usize,
        cycle_length: f32,
        estimated_frequency: f32,
        sample_rate: f32,
    ) -> (Option<usize>, Option<usize>, Option<usize>, Option<usize>, Option<usize>, Option<usize>, Option<usize>) {
        // If we don't have a valid cycle length, can't calculate phase
        if cycle_length <= 0.0 || !cycle_length.is_finite() {
            return (None, None, None, None, None, None, None);
        }
        
        // Extract the 4-cycle segment for zero-cross detection
        let segment_length = (cycle_length * CYCLES_TO_STORE as f32).floor() as usize;
        let segment_end = (segment_buffer_position + segment_length).min(data.len());
        
        if segment_buffer_position >= segment_end {
            return (None, None, None, None, None, None, None);
        }
        
        let segment = &data[segment_buffer_position..segment_end];
        
        // Capture history before calling find_phase_zero_in_segment
        let history_before = self.zero_cross_detector.get_absolute_phase_offset();
        
        // Calculate 1% tolerance for debugging
        let tolerance = ((cycle_length * 0.01) as usize).max(1);
        
        // Use zero_cross_detector to find phase 0 within the segment
        // This respects the dropdown selection (Hysteresis, Peak+History 1%, etc.)
        // The new method maintains history in absolute coordinates to handle segment position changes
        let phase_zero_segment_relative = match self.zero_cross_detector.find_phase_zero_in_segment(
            segment,
            segment_buffer_position,
            cycle_length,
        ) {
            Some(idx) => idx,
            None => return (None, None, None, None, None, history_before, Some(tolerance)),
        };
        
        // Convert to frame buffer position (absolute index in full data buffer)
        let phase_zero = segment_buffer_position + phase_zero_segment_relative;

        // Phase 2π is one cycle after phase 0
        let phase_2pi_idx = phase_zero + cycle_length as usize;
        
        // Phase -π/4 is 1/8 cycle before phase 0 (π/4 = 1/8 of 2π)
        let eighth_cycle = (cycle_length / 8.0) as usize;
        
        // Check if phase_zero is large enough to subtract eighth_cycle
        let phase_minus_quarter_pi = if phase_zero >= eighth_cycle {
            Some(phase_zero - eighth_cycle)
        } else {
            None
        };
        
        // Phase 2π+π/4 is 1/8 cycle after phase 2π (π/4 = 1/8 of 2π)
        let phase_2pi_plus_quarter_pi_idx = phase_2pi_idx + eighth_cycle;
        
        // Ensure indices are within the data bounds
        let phase_2pi = if phase_2pi_idx < data.len() {
            Some(phase_2pi_idx)
        } else {
            None
        };
        
        let phase_2pi_plus_quarter_pi = if phase_2pi_plus_quarter_pi_idx < data.len() {
            Some(phase_2pi_plus_quarter_pi_idx)
        } else {
            None
        };
        
        (
            Some(phase_zero),
            phase_2pi,
            phase_minus_quarter_pi,
            phase_2pi_plus_quarter_pi,
            Some(phase_zero_segment_relative),
            history_before,
            Some(tolerance),
        )
    }
    
    /// Collect zero-cross candidates (negative-to-positive crossings) within the displayed segment
    fn collect_zero_cross_candidates(
        &self,
        data: &[f32],
        segment_start: usize,
        segment_end: usize,
    ) -> Vec<usize> {
        if segment_start >= segment_end || segment_start >= data.len() {
            return Vec::new();
        }

        let clamped_end = segment_end.min(data.len());
        let segment = &data[segment_start..clamped_end];
        if segment.len() < 2 {
            return Vec::new();
        }

        let mut candidates = Vec::new();
        let mut search_pos = 0usize;

        while search_pos + 1 < segment.len() {
            let mut found: Option<usize> = None;
            for i in search_pos..segment.len() - 1 {
                if segment[i] <= 0.0 && segment[i + 1] > 0.0 {
                    found = Some(i);
                    break;
                }
            }

            if let Some(rel_idx) = found {
                candidates.push(segment_start + rel_idx);
                let next_search = rel_idx + 1;
                if next_search + 1 >= segment.len() {
                    break;
                }
                search_pos = next_search;
            } else {
                break;
            }
        }

        candidates
    }

    /// Select the zero-cross candidate whose interval to the next candidate contains the maximum positive peak
    fn select_candidate_with_max_positive_peak(
        &self,
        data: &[f32],
        segment_start: usize,
        segment_end: usize,
        candidates: &[usize],
    ) -> Option<usize> {
        if candidates.is_empty() || segment_start >= segment_end || segment_start >= data.len() {
            return None;
        }

        let clamped_end = segment_end.min(data.len());
        let segment = &data[segment_start..clamped_end];
        if segment.is_empty() {
            return None;
        }

        let mut best_candidate: Option<usize> = None;
        let mut best_peak = f32::MIN;

        for (i, &candidate_abs) in candidates.iter().enumerate() {
            if candidate_abs < segment_start || candidate_abs >= clamped_end {
                continue;
            }

            let next_abs = match candidates.get(i + 1).copied() {
                Some(next) if next > candidate_abs && next <= clamped_end => next,
                _ => continue,
            };

            let rel_start = candidate_abs - segment_start;
            let rel_end = next_abs - segment_start;

            if rel_start >= rel_end {
                continue;
            }

            let mut local_peak: Option<f32> = None;
            for &value in &segment[rel_start..rel_end] {
                if value > 0.0 {
                    local_peak = Some(local_peak.map_or(value, |p| p.max(value)));
                }
            }

            if let Some(peak) = local_peak {
                if peak > best_peak {
                    best_peak = peak;
                    best_candidate = Some(candidate_abs);
                }
            }
        }

        best_candidate
    }
    
    /// Find the peak (maximum positive amplitude) in the specified range
    /// Returns None if no peak with positive amplitude (> 0.0) is found in the range
    fn find_peak_in_range(
        &self,
        data: &[f32],
        start_index: usize,
        end_index: usize,
    ) -> Option<usize> {
        // Validate indices
        if start_index >= data.len() || end_index <= start_index {
            return None;
        }
        
        let end = end_index.min(data.len());
        
        let mut peak_index = start_index;
        let mut peak_value = data[start_index];
        
        for i in start_index + 1..end {
            if data[i] > peak_value {
                peak_value = data[i];
                peak_index = i;
            }
        }
        
        // Ensure the peak is positive
        if peak_value > 0.0 {
            Some(peak_index)
        } else {
            None
        }
    }
    
    /// Find zero crossing by looking backward from peak
    /// Zero crossing is defined as: before going back >= 0, after going back < 0
    /// Returns the "before going back" position
    fn find_zero_crossing_backward_from_peak(
        &self,
        data: &[f32],
        peak_index: usize,
    ) -> Option<usize> {
        // Need at least one sample before peak to look backward
        if peak_index == 0 {
            return None;
        }
        
        // Look backward from peak
        // We start from peak_index - 1 and go backward to index 1
        // (index 0 cannot be a zero crossing because there's no sample before it)
        for i in (1..peak_index).rev() {
            // Check if this is a zero crossing point
            // data[i] >= 0.0 (before going back)
            // data[i-1] < 0.0 (after going back one step)
            if data[i] >= 0.0 && data[i - 1] < 0.0 {
                return Some(i);  // Return the "before going back" position
            }
        }
        
        None
    }
    
    /// Compute frequency-domain data from time-domain data for BufferSource mode using DFT
    /// Returns frequency magnitude data as Uint8Array (0-255 range) compatible with Web Audio API's AnalyserNode
    #[wasm_bindgen(js_name = computeFrequencyData)]
    pub fn compute_frequency_data(
        &self,
        time_domain_data: &[f32],
        fft_size: usize,
    ) -> Option<Vec<u8>> {
        dft::compute_frequency_data(time_domain_data, fft_size)
    }
}

{% endraw %}
```

## 最近の変更（過去7日間）
### コミット履歴:
1aa394f Merge pull request #314 from cat2151/codex/fix-zero-cross-indicator-visibility
7fecca5 perf: inline zero-cross filtering in render loop
4ab5c0f fix: constrain zero-cross markers
be1b6eb Initial plan
d3b212f Merge pull request #312 from cat2151/codex/fix-phase-marker-end-offset
38c8637 fix: clarify orange end derivation and tests
b4accbf chore: refresh build artifacts
7953519 fix: derive phase marker end from start offset
5afc459 Add issue note for #311 [auto]
dafd448 Initial plan

### 変更されたファイル:
demo-simple.html
demo-simple.js
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
issue-notes/307.md
issue-notes/311.md
public/wasm/signal_processor_wasm.d.ts
public/wasm/signal_processor_wasm.js
public/wasm/signal_processor_wasm_bg.wasm
public/wasm/signal_processor_wasm_bg.wasm.d.ts
signal-processor-wasm/src/lib.rs
signal-processor-wasm/src/waveform_render_data.rs
signal-processor-wasm/src/zero_cross_detector/phase_zero.rs
src/ComparisonPanelRenderer.ts
src/RenderCoordinator.ts
src/WaveformDataProcessor.ts
src/WaveformRenderData.ts
src/__tests__/comparison-panel-renderer.test.ts
src/__tests__/waveform-data-processor.test.ts
src/comparison-renderers/WaveformPanelRenderer.ts


---
Generated at: 2026-02-10 07:17:43 JST
