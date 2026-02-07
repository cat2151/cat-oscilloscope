Last updated: 2026-02-08

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
- dist/assets/Oscilloscope-Bzx1rOH_.js
- dist/assets/Oscilloscope-Bzx1rOH_.js.map
- dist/assets/demo-nVUfoJ2K.js
- dist/assets/demo-nVUfoJ2K.js.map
- dist/assets/main-C_f3mX6S.js
- dist/assets/main-C_f3mX6S.js.map
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
- test-pages/test-startFromBuffer-error.html
- test-pages/wavlpf-broken-layout.png
- test-segment-relative.md
- tsconfig.json
- tsconfig.lib.json
- vite.config.ts

## 現在のオープンIssues
## [Issue #291](../issue-notes/291.md): 大きなファイルの検出: 1個のファイルが500行を超えています
以下のファイルが500行を超えています。リファクタリングを検討してください。

## 検出されたファイル

| ファイル | 行数 | 超過行数 |
|---------|------|----------|
| `src/Oscilloscope.ts` | 527 | +27 |

## 推奨事項

1. ファイルを機能ごとに分割する
2. 共通ロジックを別モジュールに抽出する
3. クラスやインターフェースを適切なサイズに保つ

---
*このissueは自動生成されました*...
ラベル: refactoring, code-quality, automated
--- issue-notes/291.md の内容 ---

```markdown

```

## [Issue #290](../issue-notes/290.md): Issue #289: 赤い縦線の移動アルゴリズムを修正 - 4周期バッファから候補抽出し最寄り候補へ段階的移動
## 概要

赤い縦線（位相0マーカー）の移動方向決定アルゴリズムを修正。従来のモード別探索から、4周期バッファ全体から候補を抽出し、現在位置から最寄り候補へ向かって段階的に移動する統一アルゴリズムへ変更。

## 実装内容

### 新規追加: 候補抽出関数
`signal-processor-wasm/src/zero_cross_detector/utils.rs`
- `find_all_zero_crosses()`: セグメント内の全ゼロクロス点を抽出

### アルゴリズム変更
`signal-processor-wasm/src/zero_cross_detector/mod....
ラベル: 
--- issue-notes/290.md の内容 ---

```markdown

```

## [Issue #289](../issue-notes/289.md): 赤い縦線の移動方向決定アルゴリズムを修正する。4周期バッファから候補を抽出したのち、現在位置から最寄り候補へ向かう方向へ移動。候補なしなら移動なし
[issue-notes/289.md](https://github.com/cat2151/cat-oscilloscope/blob/main/issue-notes/289.md)

...
ラベル: 
--- issue-notes/289.md の内容 ---

```markdown
# issue 赤い縦線の移動方向決定アルゴリズムを修正する。4周期バッファから候補を抽出したのち、現在位置から最寄り候補へ向かう方向へ移動。候補なしなら移動なし #289
[issues #289](https://github.com/cat2151/cat-oscilloscope/issues/289)



```

## [Issue #288](../issue-notes/288.md): 「今回の波形」エリアに、検証用に前回の波形も描画してみる。検証用の一時的な措置である
[issue-notes/288.md](https://github.com/cat2151/cat-oscilloscope/blob/main/issue-notes/288.md)

...
ラベル: 
--- issue-notes/288.md の内容 ---

```markdown
# issue 「今回の波形」エリアに、検証用に前回の波形も描画してみる。検証用の一時的な措置である #288
[issues #288](https://github.com/cat2151/cat-oscilloscope/issues/288)



```

## [Issue #285](../issue-notes/285.md): console.logに出ているphase debugがまったく意味がわからない上に、historyがnoneと表示されており、バグ検知しているのかdebug logミスなのかわからない。削除する
[issue-notes/285.md](https://github.com/cat2151/cat-oscilloscope/blob/main/issue-notes/285.md)

...
ラベル: 
--- issue-notes/285.md の内容 ---

```markdown
# issue console.logに出ているphase debugがまったく意味がわからない上に、historyがnoneと表示されており、バグ検知しているのかdebug logミスなのかわからない。削除する #285
[issues #285](https://github.com/cat2151/cat-oscilloscope/issues/285)



```

## ドキュメントで言及されているファイルの内容
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

### issue-notes/285.md
```md
{% raw %}
# issue console.logに出ているphase debugがまったく意味がわからない上に、historyがnoneと表示されており、バグ検知しているのかdebug logミスなのかわからない。削除する #285
[issues #285](https://github.com/cat2151/cat-oscilloscope/issues/285)



{% endraw %}
```

### issue-notes/288.md
```md
{% raw %}
# issue 「今回の波形」エリアに、検証用に前回の波形も描画してみる。検証用の一時的な措置である #288
[issues #288](https://github.com/cat2151/cat-oscilloscope/issues/288)



{% endraw %}
```

### issue-notes/289.md
```md
{% raw %}
# issue 赤い縦線の移動方向決定アルゴリズムを修正する。4周期バッファから候補を抽出したのち、現在位置から最寄り候補へ向かう方向へ移動。候補なしなら移動なし #289
[issues #289](https://github.com/cat2151/cat-oscilloscope/issues/289)



{% endraw %}
```

### issue-notes/85.md
```md
{% raw %}
# issue debug表示はデフォルトでonにし、チェックボックス名称も、debugという名前を入れないようにする。普通に使う機能の位置付けとする #85
[issues #85](https://github.com/cat2151/cat-oscilloscope/issues/85)



{% endraw %}
```

### issue-notes/88.md
```md
{% raw %}
# issue 類似波形探索において、5つの候補を用意する方法は、debug表示で調査した結果、効果がないことがわかった。根本的に探索実装をしなおす。まず5つの候補機能をすべて削除する大規模修正を行う #88
[issues #88](https://github.com/cat2151/cat-oscilloscope/issues/88)



{% endraw %}
```

### issue-notes/90.md
```md
{% raw %}
# issue リファクタリング。類似波形探索処理など「描画の元情報を生成する処理」と、「描画処理」を大きく2分割する。今後、前者のRust WASM版を作るための準備用。 #90
[issues #90](https://github.com/cat2151/cat-oscilloscope/issues/90)



{% endraw %}
```

### issue-notes/91.md
```md
{% raw %}
# issue 「描画の元情報を作る処理」の所要時間、「描画処理」の所要時間、をそれぞれms表示する #91
[issues #91](https://github.com/cat2151/cat-oscilloscope/issues/91)



{% endraw %}
```

### signal-processor-wasm/src/zero_cross_detector/utils.rs
```rs
{% raw %}
/// Utility functions for zero-cross detection

/// Find peak point (maximum absolute amplitude) in the waveform
pub fn find_peak(data: &[f32], start_index: usize, end_index: Option<usize>) -> Option<usize> {
    let end = end_index.unwrap_or(data.len());
    if start_index >= end || start_index >= data.len() {
        return None;
    }
    
    let mut peak_index = start_index;
    let mut peak_value = data[start_index].abs();
    
    for i in start_index + 1..end {
        let abs_value = data[i].abs();
        if abs_value > peak_value {
            peak_value = abs_value;
            peak_index = i;
        }
    }
    
    Some(peak_index)
}

/// Find the next peak after the given index
pub fn find_next_peak(data: &[f32], start_index: usize, cycle_length: f32) -> Option<usize> {
    let search_start = start_index + 1;
    let search_end = (search_start + (cycle_length * 1.5) as usize).min(data.len());
    
    if search_start >= data.len() {
        return None;
    }
    
    find_peak(data, search_start, Some(search_end))
}

/// Find zero-cross point where signal crosses from negative to positive
pub fn find_zero_cross(data: &[f32], start_index: usize) -> Option<usize> {
    for i in start_index..data.len() - 1 {
        if data[i] <= 0.0 && data[i + 1] > 0.0 {
            return Some(i);
        }
    }
    None
}

/// Find the next zero-cross point after the given index
pub fn find_next_zero_cross(data: &[f32], start_index: usize) -> Option<usize> {
    let search_start = start_index + 1;
    if search_start >= data.len() {
        return None;
    }
    find_zero_cross(data, search_start)
}

/// Find zero-crossing by looking backward from a given position
/// Returns the index where the zero-crossing occurs (data[i] <= 0.0 && data[i+1] > 0.0)
pub fn find_zero_crossing_backward(data: &[f32], start_index: usize) -> Option<usize> {
    if start_index == 0 || start_index >= data.len() {
        return None;
    }
    
    // Look backward from start_index
    // Since we validated start_index < data.len() above, and we iterate from 1 to start_index,
    // all indices are guaranteed to be within bounds
    for i in (1..=start_index).rev() {
        if data[i - 1] <= 0.0 && data[i] > 0.0 {
            return Some(i - 1);
        }
    }
    
    None
}

/// Helper function to initialize history (used by all new algorithms)
pub fn initialize_history(data: &[f32], estimated_cycle_length: f32) -> Option<usize> {
    // COORDINATE SPACE: segment-relative
    let search_end = if estimated_cycle_length > 0.0 {
        (estimated_cycle_length * 1.5) as usize
    } else {
        data.len() / 2
    };
    
    if let Some(peak_idx) = find_peak(data, 0, Some(search_end.min(data.len()))) {
        if let Some(zero_cross_idx) = find_zero_crossing_backward(data, peak_idx) {
            return Some(zero_cross_idx);
        }
    }
    
    // Fallback: find first zero-cross
    find_zero_cross(data, 0)
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
  private enableDetailedTimingLogs = false; // Default: disabled to avoid performance impact

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
      // Detailed timing measurements for issue #269 diagnosis
      const t0 = performance.now();
      
      // === DATA GENERATION PHASE ===
      // Process frame and generate all data needed for rendering using WASM processor
      const renderData = this.dataProcessor.processFrame(this.renderer.getFFTDisplayEnabled(), this.enableDetailedTimingLogs);
      const t1 = performance.now();
      
      if (renderData) {
        // === RENDERING PHASE ===
        // All rendering logic uses only the generated data
        this.renderFrame(renderData);
        const t2 = performance.now();
        
        // Log detailed timing breakdown only if enabled or performance is poor
        const dataProcessingTime = t1 - t0;
        const renderingTime = t2 - t1;
        const totalTime = t2 - t0;
        
        // Log if explicitly enabled or if performance exceeds target (diagnostic threshold)
        if (this.enableDetailedTimingLogs || totalTime > this.TARGET_FRAME_TIME) {
          console.log(`[Frame Timing] Total: ${totalTime.toFixed(2)}ms | Data Processing: ${dataProcessingTime.toFixed(2)}ms | Rendering: ${renderingTime.toFixed(2)}ms`);
        }
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
      renderData.phaseTwoPiOffsetHistory,
      renderData.phaseZeroIndex,
      renderData.phaseTwoPiIndex,
      renderData.phaseMinusQuarterPiIndex,
      renderData.phaseTwoPiPlusQuarterPiIndex
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

  /**
   * Enable or disable detailed timing logs for performance diagnostics
   * When enabled, logs detailed breakdown of frame processing time
   * When disabled (default), only logs when performance exceeds target threshold
   * @param enabled - true to enable detailed timing logs, false to use threshold-based logging
   */
  setDetailedTimingLogs(enabled: boolean): void {
    this.enableDetailedTimingLogs = enabled;
    // Also pass to data processor
    this.dataProcessor.setDetailedTimingLogs(enabled);
  }

  /**
   * Get whether detailed timing logs are enabled
   * @returns true if detailed timing logs are enabled
   */
  getDetailedTimingLogsEnabled(): boolean {
    return this.enableDetailedTimingLogs;
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

## 最近の変更（過去7日間）
### コミット履歴:
cf9e875 Merge pull request #287 from cat2151/claude/add-vertical-lines-to-waveform
7845e9d Add issue note for #289 [auto]
7d5314e Address PR feedback: clarify JSDoc and add phase marker tests
cd1f9ea Add issue note for #288 [auto]
4b66974 Add phase marker vertical lines to current waveform panel
2fc4501 Initial plan
7c61c08 Add issue note for #286 [auto]
6c9eeb1 Add issue note for #285 [auto]
2d25b72 Add issue note for #283 [auto]
20f4fbd Merge pull request #282 from cat2151/copilot/fix-issue-277-resolution

### 変更されたファイル:
.github/copilot-instructions.md
demo-simple.html
demo-simple.js
dist/ComparisonPanelRenderer.d.ts.map
dist/assets/Oscilloscope-Bzx1rOH_.js
dist/assets/Oscilloscope-Bzx1rOH_.js.map
dist/assets/demo-DsYptmO3.js
dist/assets/demo-DsYptmO3.js.map
dist/assets/demo-nVUfoJ2K.js
dist/assets/demo-nVUfoJ2K.js.map
dist/assets/main-C_f3mX6S.js
dist/assets/main-C_f3mX6S.js.map
dist/assets/main-DREbocQK.js
dist/assets/main-DREbocQK.js.map
dist/assets/modulepreload-polyfill-B5Qt9EMX.js
dist/assets/modulepreload-polyfill-B5Qt9EMX.js.map
dist/cat-oscilloscope.cjs
dist/cat-oscilloscope.cjs.map
dist/cat-oscilloscope.mjs
dist/cat-oscilloscope.mjs.map
dist/comparison-renderers/WaveformPanelRenderer.d.ts
dist/comparison-renderers/WaveformPanelRenderer.d.ts.map
dist/demo-simple.html
dist/index.html
issue-notes/283.md
issue-notes/285.md
issue-notes/286.md
issue-notes/288.md
issue-notes/289.md
src/ComparisonPanelRenderer.ts
src/__tests__/comparison-panel-renderer.test.ts
src/__tests__/startFromBuffer.test.ts
src/comparison-renderers/WaveformPanelRenderer.ts
test-pages/test-startFromBuffer-error.html
vite.config.ts


---
Generated at: 2026-02-08 07:10:33 JST
