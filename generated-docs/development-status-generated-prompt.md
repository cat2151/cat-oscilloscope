Last updated: 2026-02-07

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
- issue-notes/254-diagnostic-plan.md
- issue-notes/254.md
- issue-notes/255.md
- issue-notes/257.md
- issue-notes/265.md
- issue-notes/267.md
- issue-notes/269.md
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
- signal-processor-wasm/src/frequency_estimation/tests.rs
- signal-processor-wasm/src/frequency_estimation/zero_crossing.rs
- signal-processor-wasm/src/gain_controller.rs
- signal-processor-wasm/src/lib.rs
- signal-processor-wasm/src/waveform_render_data.rs
- signal-processor-wasm/src/waveform_searcher.rs
- signal-processor-wasm/src/zero_cross_detector/detection_modes.rs
- signal-processor-wasm/src/zero_cross_detector/mod.rs
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
- src/__tests__/performance-issue267.test.ts
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
## [Issue #271](../issue-notes/271.md): 大きなファイルの検出: 1個のファイルが500行を超えています
以下のファイルが500行を超えています。リファクタリングを検討してください。

## 検出されたファイル

| ファイル | 行数 | 超過行数 |
|---------|------|----------|
| `signal-processor-wasm/src/lib.rs` | 502 | +2 |

## 推奨事項

1. ファイルを機能ごとに分割する
2. 共通ロジックを別モジュールに抽出する
3. クラスやインターフェースを適切なサイズに保つ

---
*このissueは自動生成されました*...
ラベル: refactoring, code-quality, automated
--- issue-notes/271.md の内容 ---

```markdown

```

## [Issue #270](../issue-notes/270.md): Add opt-in frame timing instrumentation for #269 performance diagnosis
Issue #269 reports 400ms+ frame times in demo-library after PR #267. Need to determine if this is a build/deploy issue or actual performance regression.

## Changes

**Instrumentation added:**
- `Oscilloscope.ts`: Split frame timing into data processing vs rendering
- `WaveformDataProcessor.ts`: 9-s...
ラベル: 
--- issue-notes/270.md の内容 ---

```markdown

```

## [Issue #269](../issue-notes/269.md): PR 267を取り込んだが、demo-libraryの1frameごとの処理が相変わらず異常に遅くて1frameに400ms以上かかっている
[issue-notes/269.md](https://github.com/cat2151/cat-oscilloscope/blob/main/issue-notes/269.md)

...
ラベル: 
--- issue-notes/269.md の内容 ---

```markdown
# issue PR 267を取り込んだが、demo-libraryの1frameごとの処理が相変わらず異常に遅くて1frameに400ms以上かかっている #269
[issues #269](https://github.com/cat2151/cat-oscilloscope/issues/269)



```

## ドキュメントで言及されているファイルの内容
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

### issue-notes/269.md
```md
{% raw %}
# issue PR 267を取り込んだが、demo-libraryの1frameごとの処理が相変わらず異常に遅くて1frameに400ms以上かかっている #269
[issues #269](https://github.com/cat2151/cat-oscilloscope/issues/269)



{% endraw %}
```

### issue-notes/70.md
```md
{% raw %}
# issue wavlpfリポジトリの PR 23 を参考に、wavlpfからライブラリとして利用できるようにするための方法を検討する #70
[issues #70](https://github.com/cat2151/cat-oscilloscope/issues/70)



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
            None => return (None, None, None, None, history_before, history_before, Some(tolerance)),
        };
        
        // Convert to frame buffer position (absolute index in full data buffer)
        let phase_zero = segment_buffer_position + phase_zero_segment_relative;
        
        // Log debug information
        web_sys::console::log_1(&format!(
            "Phase Debug: segment_relative={}, history={:?}, tolerance={}, absolute_position={}, segment_buffer_position={}",
            phase_zero_segment_relative, history_before, tolerance, phase_zero, segment_buffer_position
        ).into());
        
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
    
    /// Compute FFT frequency data from time-domain data for BufferSource mode
    /// Returns frequency magnitude data as Uint8Array (0-255 range) compatible with Web Audio API's AnalyserNode
    #[wasm_bindgen(js_name = computeFrequencyData)]
    pub fn compute_frequency_data(
        &self,
        time_domain_data: &[f32],
        fft_size: usize,
    ) -> Option<Vec<u8>> {
        // Validate input
        if time_domain_data.is_empty() || fft_size == 0 || fft_size > time_domain_data.len() {
            return None;
        }
        
        // Ensure fft_size is a power of 2 (standard for FFT)
        if !fft_size.is_power_of_two() {
            web_sys::console::warn_1(&format!("FFT size {} is not a power of 2, results may be inaccurate", fft_size).into());
        }
        
        // Use the first fft_size samples
        let data = &time_domain_data[0..fft_size];
        
        // Apply Hann window to reduce spectral leakage
        let mut windowed_data = vec![0.0f32; fft_size];
        for i in 0..fft_size {
            let window_value = 0.5 * (1.0 - ((2.0 * std::f32::consts::PI * i as f32) / (fft_size as f32 - 1.0)).cos());
            windowed_data[i] = data[i] * window_value;
        }
        
        // Compute DFT (we only need the first half for real input)
        let num_bins = fft_size / 2;
        let mut magnitudes = vec![0.0f32; num_bins];
        
        for k in 0..num_bins {
            let mut real = 0.0f32;
            let mut imag = 0.0f32;
            let omega = 2.0 * std::f32::consts::PI * k as f32 / fft_size as f32;
            
            // Compute DFT bin
            for n in 0..fft_size {
                let angle = omega * n as f32;
                real += windowed_data[n] * angle.cos();
                imag -= windowed_data[n] * angle.sin();
            }
            
            magnitudes[k] = (real * real + imag * imag).sqrt();
        }
        
        // Normalize and convert to 0-255 range (matching Web Audio API's AnalyserNode behavior)
        // Find max magnitude for normalization
        let max_magnitude = magnitudes.iter().fold(0.0f32, |max, &val| max.max(val));
        
        let mut frequency_data = vec![0u8; num_bins];
        if max_magnitude > 0.0 {
            for i in 0..num_bins {
                // Normalize to 0-1 range, then scale to 0-255
                let normalized = magnitudes[i] / max_magnitude;
                frequency_data[i] = (normalized * 255.0).min(255.0) as u8;
            }
        }
        
        Some(frequency_data)
    }
}

{% endraw %}
```

### src/Oscilloscope.ts
```ts
{% raw %}
import { AudioManager } from './AudioManager';
import { GainController } from './GainController';
import { FrequencyEstimator } from './FrequencyEstimator';
import { WaveformRenderer } from './WaveformRenderer';
import { ZeroCrossDetector } from './ZeroCrossDetector';
import { WaveformSearcher } from './WaveformSearcher';
import { ComparisonPanelRenderer } from './ComparisonPanelRenderer';
import { CycleSimilarityRenderer } from './CycleSimilarityRenderer';
import { WaveformDataProcessor } from './WaveformDataProcessor';
import { WaveformRenderData } from './WaveformRenderData';
import { BufferSource } from './BufferSource';
import { OverlaysLayoutConfig } from './OverlayLayout';

/**
 * Oscilloscope class - Main coordinator for the oscilloscope functionality
 * Delegates responsibilities to specialized modules:
 * - AudioManager: Web Audio API integration
 * - GainController: Auto-gain and noise gate configuration
 * - FrequencyEstimator: Frequency detection configuration
 * - WaveformRenderer: Canvas rendering
 * - ZeroCrossDetector: Zero-crossing detection configuration
 * - WaveformSearcher: Waveform similarity search state
 * - ComparisonPanelRenderer: Comparison panel rendering
 * - CycleSimilarityRenderer: Cycle similarity graph rendering
 * - WaveformDataProcessor: Data generation and processing (Rust WASM implementation)
 */
export class Oscilloscope {
  private audioManager: AudioManager;
  private gainController: GainController;
  private frequencyEstimator: FrequencyEstimator;
  private renderer: WaveformRenderer;
  private zeroCrossDetector: ZeroCrossDetector;
  private waveformSearcher: WaveformSearcher;
  private comparisonRenderer: ComparisonPanelRenderer;
  private cycleSimilarityRenderer: CycleSimilarityRenderer | null = null;
  private dataProcessor: WaveformDataProcessor;
  private animationId: number | null = null;
  private isRunning = false;
  private isPaused = false;
  private phaseMarkerRangeEnabled = true; // Default: on

  // Frame processing diagnostics
  private lastFrameTime = 0;
  private frameProcessingTimes: number[] = [];
  private readonly MAX_FRAME_TIMES = 100;
  private readonly TARGET_FRAME_TIME = 16.67; // 60fps target
  private readonly FPS_LOG_INTERVAL_FRAMES = 60; // Log FPS every 60 frames (approx. 1 second at 60fps)

  /**
   * Create a new Oscilloscope instance
   * @param canvas - Main oscilloscope display canvas (recommended: 800x350px)
   * @param previousWaveformCanvas - Canvas for displaying previous frame's waveform (recommended: 250x120px)
   * @param currentWaveformCanvas - Canvas for displaying current frame's waveform (recommended: 250x120px)
   * @param similarityPlotCanvas - Canvas for displaying similarity history plot (recommended: 250x120px)
   * @param frameBufferCanvas - Canvas for displaying full frame buffer with position markers (recommended: 800x120px)
   * @param cycleSimilarity8divCanvas - Optional canvas for 8-division cycle similarity graph (recommended: 250x150px)
   * @param cycleSimilarity4divCanvas - Optional canvas for 4-division cycle similarity graph (recommended: 250x150px)
   * @param cycleSimilarity2divCanvas - Optional canvas for 2-division cycle similarity graph (recommended: 250x150px)
   * @param overlaysLayout - Optional layout configuration for debug overlays (FFT, harmonic analysis, frequency plot)
   */
  constructor(
    canvas: HTMLCanvasElement,
    previousWaveformCanvas: HTMLCanvasElement,
    currentWaveformCanvas: HTMLCanvasElement,
    similarityPlotCanvas: HTMLCanvasElement,
    frameBufferCanvas: HTMLCanvasElement,
    cycleSimilarity8divCanvas?: HTMLCanvasElement,
    cycleSimilarity4divCanvas?: HTMLCanvasElement,
    cycleSimilarity2divCanvas?: HTMLCanvasElement,
    overlaysLayout?: OverlaysLayoutConfig
  ) {
    this.audioManager = new AudioManager();
    this.gainController = new GainController();
    this.frequencyEstimator = new FrequencyEstimator();
    this.renderer = new WaveformRenderer(canvas, overlaysLayout);
    this.zeroCrossDetector = new ZeroCrossDetector();
    this.waveformSearcher = new WaveformSearcher();
    this.comparisonRenderer = new ComparisonPanelRenderer(
      previousWaveformCanvas,
      currentWaveformCanvas,
      similarityPlotCanvas,
      frameBufferCanvas
    );
    
    // Initialize cycle similarity renderer if canvases are provided
    if (cycleSimilarity8divCanvas && cycleSimilarity4divCanvas && cycleSimilarity2divCanvas) {
      this.cycleSimilarityRenderer = new CycleSimilarityRenderer(
        cycleSimilarity8divCanvas,
        cycleSimilarity4divCanvas,
        cycleSimilarity2divCanvas
      );
    }
    
    this.dataProcessor = new WaveformDataProcessor(
      this.audioManager,
      this.gainController,
      this.frequencyEstimator,
      this.waveformSearcher,
      this.zeroCrossDetector
    );
  }

  async start(): Promise<void> {
    try {
      // Initialize WASM processor if not already initialized
      await this.dataProcessor.initialize();
      
      await this.audioManager.start();
      this.isRunning = true;
      this.render();
    } catch (error) {
      console.error('Error starting oscilloscope:', error);
      throw error;
    }
  }

  async startFromFile(file: File): Promise<void> {
    try {
      // Initialize WASM processor if not already initialized
      await this.dataProcessor.initialize();
      
      await this.audioManager.startFromFile(file);
      this.isRunning = true;
      this.render();
    } catch (error) {
      console.error('Error loading audio file:', error);
      throw error;
    }
  }

  /**
   * Start visualization from a static buffer without audio playback
   * Useful for visualizing pre-recorded audio data or processing results
   * @param bufferSource - BufferSource instance containing audio data
   */
  async startFromBuffer(bufferSource: BufferSource): Promise<void> {
    try {
      // Initialize WASM processor if not already initialized
      await this.dataProcessor.initialize();
      
      await this.audioManager.startFromBuffer(bufferSource);
      this.isRunning = true;
      this.render();
    } catch (error) {
      console.error('Error starting from buffer:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    await this.audioManager.stop();
    this.frequencyEstimator.clearHistory();
    this.zeroCrossDetector.reset();
    this.waveformSearcher.reset();
    this.comparisonRenderer.clear();
    if (this.cycleSimilarityRenderer) {
      this.cycleSimilarityRenderer.clear();
    }
    this.dataProcessor.reset();
  }

  private render(): void {
    if (!this.isRunning) {
      return;
    }

    const startTime = performance.now();

    // If paused, skip processing and drawing but continue the animation loop
    if (!this.isPaused) {
      // === DATA GENERATION PHASE ===
      // Process frame and generate all data needed for rendering using WASM processor
      const renderData = this.dataProcessor.processFrame(this.renderer.getFFTDisplayEnabled());
      
      if (renderData) {
        // === RENDERING PHASE ===
        // All rendering logic uses only the generated data
        this.renderFrame(renderData);
      }
    }

    // Measure frame processing time
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    this.frameProcessingTimes.push(processingTime);
    if (this.frameProcessingTimes.length > this.MAX_FRAME_TIMES) {
      this.frameProcessingTimes.shift();
    }

    // Warn if frame processing exceeds target (60fps)
    if (processingTime > this.TARGET_FRAME_TIME) {
      console.warn(`Frame processing time: ${processingTime.toFixed(2)}ms (target: <${this.TARGET_FRAME_TIME}ms)`);
    }

    // Calculate and log FPS periodically (every FPS_LOG_INTERVAL_FRAMES frames)
    if (this.lastFrameTime > 0) {
      const frameInterval = startTime - this.lastFrameTime;
      const currentFps = 1000 / frameInterval;
      
      if (this.frameProcessingTimes.length === this.FPS_LOG_INTERVAL_FRAMES) {
        const avgProcessingTime = this.frameProcessingTimes.reduce((a, b) => a + b, 0) / this.frameProcessingTimes.length;
        console.log(`FPS: ${currentFps.toFixed(1)}, Avg frame time: ${avgProcessingTime.toFixed(2)}ms`);
      }
    }
    this.lastFrameTime = startTime;

    // Continue rendering
    this.animationId = requestAnimationFrame(() => this.render());
  }

  /**
   * Render a single frame using pre-processed data
   * This method contains only rendering logic - no data processing
   */
  private renderFrame(renderData: WaveformRenderData): void {
    // Determine display range based on phase marker range mode
    let displayStartIndex = renderData.displayStartIndex;
    let displayEndIndex = renderData.displayEndIndex;
    
    if (this.phaseMarkerRangeEnabled && 
        renderData.phaseMinusQuarterPiIndex !== undefined && 
        renderData.phaseTwoPiPlusQuarterPiIndex !== undefined &&
        renderData.phaseMinusQuarterPiIndex <= renderData.phaseTwoPiPlusQuarterPiIndex) {
      // Use phase marker range (orange to orange)
      displayStartIndex = renderData.phaseMinusQuarterPiIndex;
      displayEndIndex = renderData.phaseTwoPiPlusQuarterPiIndex;
    }
    
    // Clear canvas and draw grid with measurement labels
    const displaySamples = displayEndIndex - displayStartIndex;
    this.renderer.clearAndDrawGrid(
      renderData.sampleRate,
      displaySamples,
      renderData.gain
    );

    // Draw waveform with calculated gain
    this.renderer.drawWaveform(
      renderData.waveformData,
      displayStartIndex,
      displayEndIndex,
      renderData.gain
    );

    // Draw phase markers
    this.renderer.drawPhaseMarkers(
      renderData.phaseZeroIndex,
      renderData.phaseTwoPiIndex,
      renderData.phaseMinusQuarterPiIndex,
      renderData.phaseTwoPiPlusQuarterPiIndex,
      displayStartIndex,
      displayEndIndex,
      {
        phaseZeroSegmentRelative: renderData.phaseZeroSegmentRelative,
        phaseZeroHistory: renderData.phaseZeroHistory,
        phaseZeroTolerance: renderData.phaseZeroTolerance,
        zeroCrossModeName: renderData.zeroCrossModeName,
      }
    );

    // Draw FFT spectrum overlay if enabled and signal is above noise gate
    if (renderData.frequencyData && this.renderer.getFFTDisplayEnabled() && renderData.isSignalAboveNoiseGate) {
      this.renderer.drawFFTOverlay(
        renderData.frequencyData,
        renderData.estimatedFrequency,
        renderData.sampleRate,
        renderData.fftSize,
        renderData.maxFrequency
      );
      
      // Draw harmonic analysis overlay (only when FFT method is used and data is available)
      this.renderer.drawHarmonicAnalysis(
        renderData.halfFreqPeakStrengthPercent,
        renderData.candidate1Harmonics,
        renderData.candidate2Harmonics,
        renderData.candidate1WeightedScore,
        renderData.candidate2WeightedScore,
        renderData.selectionReason,
        renderData.estimatedFrequency
      );
    }

    // 右上に周波数プロットを描画
    this.renderer.drawFrequencyPlot(
      renderData.frequencyPlotHistory,
      this.frequencyEstimator.getMinFrequency(),
      this.frequencyEstimator.getMaxFrequency()
    );

    // Update comparison panels with similarity history
    // Use original 4-cycle range from WASM (renderData.displayStartIndex/displayEndIndex)
    // instead of the phase-marker-narrowed range (displayStartIndex/displayEndIndex)
    this.comparisonRenderer.updatePanels(
      renderData.previousWaveform,
      renderData.waveformData,
      renderData.displayStartIndex,
      renderData.displayEndIndex,
      renderData.waveformData,
      renderData.similarity,
      renderData.similarityPlotHistory,
      renderData.phaseZeroOffsetHistory,
      renderData.phaseTwoPiOffsetHistory
    );
    
    // Update cycle similarity graphs if renderer is available
    if (this.cycleSimilarityRenderer) {
      this.cycleSimilarityRenderer.updateGraphs(
        renderData.cycleSimilarities8div,
        renderData.cycleSimilarities4div,
        renderData.cycleSimilarities2div
      );
    }
  }

  // Getters and setters - delegate to appropriate modules
  getIsRunning(): boolean {
    return this.isRunning;
  }

  setAutoGain(enabled: boolean): void {
    this.gainController.setAutoGain(enabled);
  }

  getAutoGainEnabled(): boolean {
    return this.gainController.getAutoGainEnabled();
  }

  setNoiseGate(enabled: boolean): void {
    this.gainController.setNoiseGate(enabled);
  }

  getNoiseGateEnabled(): boolean {
    return this.gainController.getNoiseGateEnabled();
  }

  setNoiseGateThreshold(threshold: number): void {
    this.gainController.setNoiseGateThreshold(threshold);
  }

  getNoiseGateThreshold(): number {
    return this.gainController.getNoiseGateThreshold();
  }

  setFrequencyEstimationMethod(method: 'zero-crossing' | 'autocorrelation' | 'fft' | 'stft' | 'cqt'): void {
    this.frequencyEstimator.setFrequencyEstimationMethod(method);
  }

  getFrequencyEstimationMethod(): string {
    return this.frequencyEstimator.getFrequencyEstimationMethod();
  }

  setBufferSizeMultiplier(multiplier: 1 | 4 | 16): void {
    this.frequencyEstimator.setBufferSizeMultiplier(multiplier);
  }

  getBufferSizeMultiplier(): 1 | 4 | 16 {
    return this.frequencyEstimator.getBufferSizeMultiplier();
  }

  getEstimatedFrequency(): number {
    return this.frequencyEstimator.getEstimatedFrequency();
  }

  setFFTDisplay(enabled: boolean): void {
    this.renderer.setFFTDisplay(enabled);
  }

  getFFTDisplayEnabled(): boolean {
    return this.renderer.getFFTDisplayEnabled();
  }

  /**
   * Enable or disable harmonic analysis overlay
   * When disabled, the yellow-bordered harmonic analysis panel in the top-left corner is hidden
   * @param enabled - true to show harmonic analysis overlay, false to hide it
   */
  setHarmonicAnalysisEnabled(enabled: boolean): void {
    this.renderer.setHarmonicAnalysisEnabled(enabled);
  }

  /**
   * Get the current state of harmonic analysis overlay
   * @returns true if harmonic analysis overlay is enabled, false otherwise
   */
  getHarmonicAnalysisEnabled(): boolean {
    return this.renderer.getHarmonicAnalysisEnabled();
  }

  /**
   * Enable or disable debug overlays (harmonic analysis, frequency plot)
   * Debug overlays show detailed debugging information with yellow borders (#ffaa00)
   * including harmonic analysis and frequency history plot
   * 
   * When using cat-oscilloscope as a library, it's recommended to disable these
   * overlays for a cleaner, more professional appearance
   * 
   * @param enabled - true to show debug overlays (default for standalone app),
   *                  false to hide them (recommended for library usage)
   */
  setDebugOverlaysEnabled(enabled: boolean): void {
    this.renderer.setDebugOverlaysEnabled(enabled);
  }

  /**
   * Get the current state of debug overlays
   * @returns true if debug overlays are enabled, false otherwise
   */
  getDebugOverlaysEnabled(): boolean {
    return this.renderer.getDebugOverlaysEnabled();
  }

  /**
   * Set the layout configuration for overlays
   * Allows external applications to control the position and size of debug overlays
   * @param layout - Layout configuration for overlays (FFT, harmonic analysis, frequency plot)
   */
  setOverlaysLayout(layout: OverlaysLayoutConfig): void {
    this.renderer.setOverlaysLayout(layout);
  }

  /**
   * Get the current overlays layout configuration
   * @returns Current overlays layout configuration
   */
  getOverlaysLayout(): OverlaysLayoutConfig {
    return this.renderer.getOverlaysLayout();
  }

  getCurrentGain(): number {
    return this.gainController.getCurrentGain();
  }
  
  getSimilarityScore(): number {
    return this.waveformSearcher.getLastSimilarity();
  }
  
  isSimilaritySearchActive(): boolean {
    return this.waveformSearcher.hasPreviousWaveform();
  }
  
  setUsePeakMode(enabled: boolean): void {
    this.zeroCrossDetector.setUsePeakMode(enabled);
  }

  getUsePeakMode(): boolean {
    return this.zeroCrossDetector.getUsePeakMode();
  }
  
  setZeroCrossMode(mode: 'standard' | 'peak-backtrack-history' | 'bidirectional-nearest' | 'gradient-based' | 'adaptive-step' | 'hysteresis' | 'closest-to-zero'): void {
    this.zeroCrossDetector.setZeroCrossMode(mode);
  }

  getZeroCrossMode(): 'standard' | 'peak-backtrack-history' | 'bidirectional-nearest' | 'gradient-based' | 'adaptive-step' | 'hysteresis' | 'closest-to-zero' {
    return this.zeroCrossDetector.getZeroCrossMode();
  }
  
  setPauseDrawing(paused: boolean): void {
    this.isPaused = paused;
  }

  getPauseDrawing(): boolean {
    return this.isPaused;
  }

  /**
   * Enable or disable phase marker range display mode
   * When enabled (default), displays only the range between orange-red-red-orange markers
   * When disabled, displays the full waveform segment
   * @param enabled - true to display only phase marker range, false to display full segment
   */
  setPhaseMarkerRangeEnabled(enabled: boolean): void {
    this.phaseMarkerRangeEnabled = enabled;
  }

  /**
   * Get the current state of phase marker range display mode
   * @returns true if phase marker range display is enabled, false otherwise
   */
  getPhaseMarkerRangeEnabled(): boolean {
    return this.phaseMarkerRangeEnabled;
  }
}

{% endraw %}
```

### src/WaveformDataProcessor.ts
```ts
{% raw %}
import { WaveformRenderData } from './WaveformRenderData';
import { AudioManager } from './AudioManager';
import { GainController } from './GainController';
import { FrequencyEstimator } from './FrequencyEstimator';
import { WaveformSearcher } from './WaveformSearcher';
import { ZeroCrossDetector } from './ZeroCrossDetector';
import { BasePathResolver } from './BasePathResolver';
import { WasmModuleLoader } from './WasmModuleLoader';

/**
 * WaveformDataProcessor - Coordinates waveform data processing using Rust WASM implementation
 * 
 * This class has been refactored to follow the Single Responsibility Principle.
 * Its sole responsibility is now coordinating between JavaScript configuration
 * and the Rust/WASM processor for data processing.
 * 
 * Responsibilities delegated to specialized classes:
 * - BasePathResolver: Determines the base path for loading WASM files
 * - WasmModuleLoader: Handles WASM module loading and initialization
 * 
 * All actual data processing algorithms (frequency estimation, gain control,
 * zero-cross detection, waveform search) are implemented in Rust WASM.
 */
export class WaveformDataProcessor {
  private audioManager: AudioManager;
  private gainController: GainController;
  private frequencyEstimator: FrequencyEstimator;
  private waveformSearcher: WaveformSearcher;
  private zeroCrossDetector: ZeroCrossDetector;
  private basePathResolver: BasePathResolver;
  private wasmLoader: WasmModuleLoader;
  
  // Phase marker offset history for overlay graphs (issue #236)
  private phaseZeroOffsetHistory: number[] = [];
  private phaseTwoPiOffsetHistory: number[] = [];
  private readonly MAX_OFFSET_HISTORY = 100; // Keep last 100 frames of offset data
  
  // Diagnostic tracking for issue #254 analysis
  private previousPhaseZeroIndex: number | undefined = undefined;
  private previousPhaseTwoPiIndex: number | undefined = undefined;

  constructor(
    audioManager: AudioManager,
    gainController: GainController,
    frequencyEstimator: FrequencyEstimator,
    waveformSearcher: WaveformSearcher,
    zeroCrossDetector: ZeroCrossDetector
  ) {
    this.audioManager = audioManager;
    this.gainController = gainController;
    this.frequencyEstimator = frequencyEstimator;
    this.waveformSearcher = waveformSearcher;
    this.zeroCrossDetector = zeroCrossDetector;
    this.basePathResolver = new BasePathResolver();
    this.wasmLoader = new WasmModuleLoader();
  }
  
  /**
   * Initialize the WASM module
   * Must be called before processFrame
   */
  async initialize(): Promise<void> {
    if (this.wasmLoader.isReady()) {
      return;
    }
    
    try {
      // Determine base path and load WASM module
      const basePath = this.basePathResolver.getBasePath();
      await this.wasmLoader.loadWasmModule(basePath);
      
      // Sync initial configuration to WASM
      this.syncConfigToWasm();
    } catch (error) {
      console.error('Failed to initialize WASM module:', error);
      throw error;
    }
  }
  
  /**
   * Sync TypeScript configuration to WASM processor
   */
  private syncConfigToWasm(): void {
    const wasmProcessor = this.wasmLoader.getProcessor();
    if (!wasmProcessor) return;
    
    wasmProcessor.setAutoGain(this.gainController.getAutoGainEnabled());
    wasmProcessor.setNoiseGate(this.gainController.getNoiseGateEnabled());
    wasmProcessor.setNoiseGateThreshold(this.gainController.getNoiseGateThreshold());
    wasmProcessor.setFrequencyEstimationMethod(this.frequencyEstimator.getFrequencyEstimationMethod());
    wasmProcessor.setBufferSizeMultiplier(this.frequencyEstimator.getBufferSizeMultiplier());
    wasmProcessor.setZeroCrossMode(this.zeroCrossDetector.getZeroCrossMode());
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
    const wasmProcessor = this.wasmLoader.getProcessor();
    if (!this.wasmLoader.isReady() || !wasmProcessor) {
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
    let frequencyData = needsFrequencyData ? this.audioManager.getFrequencyData() : null;
    
    // If frequency data is needed but not available (e.g., BufferSource mode),
    // compute it from time-domain data using WASM
    if (needsFrequencyData && !frequencyData && dataArray) {
      const computedFreqData = wasmProcessor.computeFrequencyData(dataArray, fftSize);
      if (computedFreqData) {
        frequencyData = new Uint8Array(computedFreqData);
      }
    }
    
    // Sync configuration before processing
    this.syncConfigToWasm();
    
    // Call WASM processor
    const wasmResult = wasmProcessor.processFrame(
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
      frequencyData: wasmResult.frequencyData ? new Uint8Array(wasmResult.frequencyData) : undefined,
      isSignalAboveNoiseGate: wasmResult.isSignalAboveNoiseGate,
      maxFrequency: wasmResult.maxFrequency,
      previousWaveform: wasmResult.previousWaveform ? new Float32Array(wasmResult.previousWaveform) : null,
      similarity: wasmResult.similarity,
      similarityPlotHistory: wasmResult.similarityPlotHistory ? Array.from(wasmResult.similarityPlotHistory) : [],
      usedSimilaritySearch: wasmResult.usedSimilaritySearch,
      phaseZeroIndex: wasmResult.phaseZeroIndex,
      phaseTwoPiIndex: wasmResult.phaseTwoPiIndex,
      phaseMinusQuarterPiIndex: wasmResult.phaseMinusQuarterPiIndex,
      phaseTwoPiPlusQuarterPiIndex: wasmResult.phaseTwoPiPlusQuarterPiIndex,
      halfFreqPeakStrengthPercent: wasmResult.halfFreqPeakStrengthPercent,
      candidate1Harmonics: wasmResult.candidate1Harmonics ? Array.from(wasmResult.candidate1Harmonics) : undefined,
      candidate2Harmonics: wasmResult.candidate2Harmonics ? Array.from(wasmResult.candidate2Harmonics) : undefined,
      selectionReason: wasmResult.selectionReason,
      cycleSimilarities8div: wasmResult.cycleSimilarities8div ? Array.from(wasmResult.cycleSimilarities8div) : undefined,
      cycleSimilarities4div: wasmResult.cycleSimilarities4div ? Array.from(wasmResult.cycleSimilarities4div) : undefined,
      cycleSimilarities2div: wasmResult.cycleSimilarities2div ? Array.from(wasmResult.cycleSimilarities2div) : undefined,
    };
    
    // Calculate and update phase marker offset history (issue #236)
    this.updatePhaseOffsetHistory(renderData);
    
    // Add offset history to render data
    renderData.phaseZeroOffsetHistory = [...this.phaseZeroOffsetHistory];
    renderData.phaseTwoPiOffsetHistory = [...this.phaseTwoPiOffsetHistory];
    
    // Sync results back to TypeScript objects so getters work correctly
    this.syncResultsFromWasm(renderData);
    
    return renderData;
  }
  
  /**
   * Calculate relative offset percentages for phase markers and update history
   * Issue #254: Added diagnostic logging to identify source of offset spikes
   * @param renderData - Render data containing phase indices
   */
  private updatePhaseOffsetHistory(renderData: WaveformRenderData): void {
    // Check if we have valid display indices
    if (renderData.displayStartIndex === undefined || 
        renderData.displayEndIndex === undefined) {
      return;
    }
    
    const displayLength = renderData.displayEndIndex - renderData.displayStartIndex;
    if (displayLength <= 0) {
      return;
    }
    
    // Diagnostic tracking for issue #254
    // Focus: Verify that offsets within 4-cycle window stay within 1% per frame (spec requirement)
    let shouldLog = false;
    const diagnosticInfo: any = {
      frame: Date.now(),
      fourCycleWindow: {
        lengthSamples: displayLength,  // Length of 4-cycle display window
      },
    };
    
    // Update phase zero offset history if available
    if (renderData.phaseZeroIndex !== undefined) {
      // Calculate relative offset as percentage (0-100) within the 4-cycle window
      // This is the KEY metric: position of "start" marker within 4-cycle coordinate system
      const phaseZeroRelative = renderData.phaseZeroIndex - renderData.displayStartIndex;
      const phaseZeroPercent = (phaseZeroRelative / displayLength) * 100;
      
      // Diagnostic tracking - ONLY 4-cycle coordinate system metrics
      diagnosticInfo.phaseZero = {
        startOffsetPercent: phaseZeroPercent,  // Position within 4-cycle window (0-100%)
      };
      
      if (this.previousPhaseZeroIndex !== undefined) {
        // Detect spikes: if offset percent changes by >1% between frames (spec says 1% per frame max)
        // This is the CORE check: does the offset within 4-cycle window move by more than 1%?
        const previousPercent = this.phaseZeroOffsetHistory[this.phaseZeroOffsetHistory.length - 1];
        if (previousPercent !== undefined) {
          const percentChange = Math.abs(phaseZeroPercent - previousPercent);
          diagnosticInfo.phaseZero.offsetChange = percentChange;
          diagnosticInfo.phaseZero.previousOffsetPercent = previousPercent;
          
          if (percentChange > 1.0) {
            shouldLog = true;
            diagnosticInfo.phaseZero.SPEC_VIOLATION = true;  // This violates the 1% per frame spec
          }
        }
      }
      
      this.phaseZeroOffsetHistory.push(phaseZeroPercent);
      if (this.phaseZeroOffsetHistory.length > this.MAX_OFFSET_HISTORY) {
        this.phaseZeroOffsetHistory.shift();
      }
      
      this.previousPhaseZeroIndex = renderData.phaseZeroIndex;
    }
    
    // Update phase 2π offset history if available
    if (renderData.phaseTwoPiIndex !== undefined) {
      // Calculate relative offset as percentage (0-100) within the 4-cycle window
      // This is the KEY metric: position of "end" marker within 4-cycle coordinate system
      const phaseTwoPiRelative = renderData.phaseTwoPiIndex - renderData.displayStartIndex;
      const phaseTwoPiPercent = (phaseTwoPiRelative / displayLength) * 100;
      
      // Diagnostic tracking - ONLY 4-cycle coordinate system metrics
      diagnosticInfo.phaseTwoPi = {
        endOffsetPercent: phaseTwoPiPercent,  // Position within 4-cycle window (0-100%)
      };
      
      if (this.previousPhaseTwoPiIndex !== undefined) {
        // Detect spikes: if offset percent changes by >1% between frames (spec says 1% per frame max)
        // This is the CORE check: does the offset within 4-cycle window move by more than 1%?
        const previousPercent = this.phaseTwoPiOffsetHistory[this.phaseTwoPiOffsetHistory.length - 1];
        if (previousPercent !== undefined) {
          const percentChange = Math.abs(phaseTwoPiPercent - previousPercent);
          diagnosticInfo.phaseTwoPi.offsetChange = percentChange;
          diagnosticInfo.phaseTwoPi.previousOffsetPercent = previousPercent;
          
          if (percentChange > 1.0) {
            shouldLog = true;
            diagnosticInfo.phaseTwoPi.SPEC_VIOLATION = true;  // This violates the 1% per frame spec
          }
        }
      }
      
      this.phaseTwoPiOffsetHistory.push(phaseTwoPiPercent);
      if (this.phaseTwoPiOffsetHistory.length > this.MAX_OFFSET_HISTORY) {
        this.phaseTwoPiOffsetHistory.shift();
      }
      
      this.previousPhaseTwoPiIndex = renderData.phaseTwoPiIndex;
    }
    
    // Log if spec violation detected
    if (shouldLog) {
      console.warn('[1% Spec Violation Detected - Issue #254]', diagnosticInfo);
      console.warn('→ Offset within 4-cycle window moved by more than 1% in one frame');
    }
  }
  
  /**
   * Reset the WASM processor state
   */
  reset(): void {
    const wasmProcessor = this.wasmLoader.getProcessor();
    if (wasmProcessor) {
      wasmProcessor.reset();
    }
    // Clear phase offset history (issue #236, #254)
    this.phaseZeroOffsetHistory = [];
    this.phaseTwoPiOffsetHistory = [];
    // Clear diagnostic tracking (issue #254)
    this.previousPhaseZeroIndex = undefined;
    this.previousPhaseTwoPiIndex = undefined;
  }
}

{% endraw %}
```

## 最近の変更（過去7日間）
### コミット履歴:
0f3b465 Add issue note for #269 [auto]
04a2069 Merge pull request #268 from cat2151/copilot/fix-demo-library-performance
9fdb560 Clean up code review feedback: simplify BufferSource handling and improve comments
05a3f57 Fix #267: Refactor startFromBuffer to use AnalyserNode (same architecture as startFromFile)
a5388c0 Fix test: Set frequency estimation method before initializing oscilloscope
7a56dfb Address PR feedback: Set zero-crossing as TypeScript default and improve test assertions
feab6ef Fix issue #267: Change demo-library default to zero-crossing for optimal BufferSource performance
8ad6f18 Add performance diagnostics for issue #267 - identified slow computeFrequencyData in BufferSource mode
554c830 Initial investigation of issue #267 - performance bottleneck in demo-library
590bb8e Initial plan

### 変更されたファイル:
.github/workflows/check-large-files.yml
dist/AudioManager.d.ts
dist/AudioManager.d.ts.map
dist/BasePathResolver.d.ts
dist/BufferSource.d.ts
dist/ComparisonPanelRenderer.d.ts
dist/CycleSimilarityRenderer.d.ts
dist/DOMElementManager.d.ts
dist/DisplayUpdater.d.ts
dist/FrameBufferHistory.d.ts
dist/FrequencyEstimator.d.ts
dist/FrequencyEstimator.d.ts.map
dist/GainController.d.ts
dist/Oscilloscope.d.ts
dist/OverlayLayout.d.ts
dist/PianoKeyboardRenderer.d.ts
dist/UIEventHandlers.d.ts
dist/WasmModuleLoader.d.ts
dist/WaveformDataProcessor.d.ts
dist/WaveformDataProcessor.d.ts.map
dist/WaveformRenderData.d.ts
dist/WaveformRenderer.d.ts
dist/WaveformSearcher.d.ts
dist/ZeroCrossDetector.d.ts
dist/cat-oscilloscope.cjs
dist/cat-oscilloscope.cjs.map
dist/cat-oscilloscope.mjs
dist/cat-oscilloscope.mjs.map
dist/comparison-renderers/OffsetOverlayRenderer.d.ts
dist/comparison-renderers/PositionMarkerRenderer.d.ts
dist/comparison-renderers/SimilarityPlotRenderer.d.ts
dist/comparison-renderers/WaveformPanelRenderer.d.ts
dist/comparison-renderers/index.d.ts
dist/index.d.ts
dist/renderers/BaseOverlayRenderer.d.ts
dist/renderers/FFTOverlayRenderer.d.ts
dist/renderers/FrequencyPlotRenderer.d.ts
dist/renderers/GridRenderer.d.ts
dist/renderers/HarmonicAnalysisRenderer.d.ts
dist/renderers/PhaseMarkerRenderer.d.ts
dist/renderers/WaveformLineRenderer.d.ts
dist/renderers/index.d.ts
dist/utils.d.ts
example-library-usage.html
issue-notes/265.md
issue-notes/267.md
issue-notes/269.md
signal-processor-wasm/src/frequency_estimation/mod.rs
signal-processor-wasm/src/frequency_estimation/tests.rs
signal-processor-wasm/src/lib.rs
signal-processor-wasm/src/waveform_render_data.rs
signal-processor-wasm/src/zero_cross_detector.rs
signal-processor-wasm/src/zero_cross_detector/detection_modes.rs
signal-processor-wasm/src/zero_cross_detector/mod.rs
signal-processor-wasm/src/zero_cross_detector/types.rs
signal-processor-wasm/src/zero_cross_detector/utils.rs
src/AudioManager.ts
src/FrequencyEstimator.ts
src/__tests__/performance-issue267.test.ts


---
Generated at: 2026-02-07 07:09:20 JST
