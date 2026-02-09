Last updated: 2026-02-10

# Development Status

## 現在のIssues
- [Issue #315](../issue-notes/315.md) は、`signal-processor-wasm/src/lib.rs` が560行と大規模であることを指摘し、リファクタリングを推奨しています。
- このファイルには、メインの`WasmDataProcessor`の実装に加え、ゼロクロス検出に関連する複数のヘルパー関数が直接定義されています。
- リファクタリングの主要な目標は、コードを機能ごとに分割し、各ファイルを200行未満に近づけることで、Agentによるメンテナンスを容易にすることです。

## 次の一手候補
1. [Issue #315](../issue-notes/315.md) `signal-processor-wasm/src/lib.rs` からフェーズマーカー計算関連メソッドを `zero_cross_detector/phase_zero.rs` へ移動
   - 最初の小さな一歩: `signal-processor-wasm/src/lib.rs` に定義されている`calculate_phase_markers`および`calculate_phase_markers_with_debug`メソッドを`signal-processor-wasm/src/zero_cross_detector/phase_zero.rs`に移動させ、移動後に発生するコンパイルエラーを修正します。
   - Agent実行プロンプト:
     ```
     対象ファイル:
     - `signal-processor-wasm/src/lib.rs`
     - `signal-processor-wasm/src/zero_cross_detector/phase_zero.rs`
     - `signal-processor-wasm/src/zero_cross_detector/mod.rs`

     実行内容:
     `signal-processor-wasm/src/lib.rs`から`calculate_phase_markers`および`calculate_phase_markers_with_debug`メソッドを切り出し、`signal-processor-wasm/src/zero_cross_detector/phase_zero.rs`に移動してください。
     - 移動したメソッドは`ZeroCrossDetector`構造体のメソッドとして`phase_zero.rs`内に実装してください。
     - `lib.rs`内の該当メソッドの呼び出し箇所を修正し、`self.zero_cross_detector.calculate_phase_markers(...)`のように変更してください。
     - 必要に応じて、`phase_zero.rs`および`lib.rs`に`use`宣言を追加・修正してください。
     - `zero_cross_detector/mod.rs`を更新し、`phase_zero.rs`から移動した関数がエクスポートされるようにしてください。

     確認事項:
     - メソッド移動後、プロジェクト全体がコンパイルエラーなくビルドできることを確認してください。
     - 移動したメソッドの機能的な振る舞いが変わっていないことをテストコードやデモ実行で確認してください。
     - `lib.rs`の行数が削減されていることを確認してください。

     期待する出力:
     変更内容の概要と、`signal-processor-wasm/src/lib.rs`、`signal-processor-wasm/src/zero_cross_detector/phase_zero.rs`、`signal-processor-wasm/src/zero_cross_detector/mod.rs`の変更箇所をを示すdiff形式で出力してください。
     ```

2. [Issue #315](../issue-notes/315.md) `signal-processor-wasm/src/lib.rs` からゼロクロス候補収集関連メソッドを `zero_cross_detector/default_mode.rs` へ移動
   - 最初の小さな一歩: `signal-processor-wasm/src/lib.rs` に定義されている`collect_zero_cross_candidates`および`select_candidate_with_max_positive_peak`メソッドを`signal-processor-wasm/src/zero_cross_detector/default_mode.rs`に移動させ、移動後に発生するコンパイルエラーを修正します。
   - Agent実行プロンプト:
     ```
     対象ファイル:
     - `signal-processor-wasm/src/lib.rs`
     - `signal-processor-wasm/src/zero_cross_detector/default_mode.rs`
     - `signal-processor-wasm/src/zero_cross_detector/mod.rs`

     実行内容:
     `signal-processor-wasm/src/lib.rs`から`collect_zero_cross_candidates`および`select_candidate_with_max_positive_peak`メソッドを切り出し、`signal-processor-wasm/src/zero_cross_detector/default_mode.rs`に移動してください。
     - 移動したメソッドは`ZeroCrossDetector`構造体のメソッドとして`default_mode.rs`内に実装してください。
     - `lib.rs`内の該当メソッドの呼び出し箇所を修正し、`self.zero_cross_detector.collect_zero_cross_candidates(...)`のように変更してください。
     - 必要に応じて、`default_mode.rs`および`lib.rs`に`use`宣言を追加・修正してください。
     - `zero_cross_detector/mod.rs`を更新し、`default_mode.rs`から移動した関数がエクスポートされるようにしてください。

     確認事項:
     - メソッド移動後、プロジェクト全体がコンパイルエラーなくビルドできることを確認してください。
     - 移動したメソッドの機能的な振る舞いが変わっていないことをテストコードやデモ実行で確認してください。
     - `lib.rs`の行数が削減されていることを確認してください。

     期待する出力:
     変更内容の概要と、`signal-processor-wasm/src/lib.rs`、`signal-processor-wasm/src/zero_cross_detector/default_mode.rs`、`signal-processor-wasm/src/zero_cross_detector/mod.rs`の変更箇所をを示すdiff形式で出力してください。
     ```

3. [Issue #315](../issue-notes/315.md) `signal-processor-wasm/src/lib.rs` からピーク検出・ゼロクロス後方探索関連メソッドを `zero_cross_detector/utils.rs` へ移動
   - 最初の小さな一歩: `signal-processor-wasm/src/lib.rs` に定義されている`find_peak_in_range`および`find_zero_crossing_backward_from_peak`メソッドを`signal-processor-wasm/src/zero_cross_detector/utils.rs`に移動させ、移動後に発生するコンパイルエラーを修正します。
   - Agent実行プロンプト:
     ```
     対象ファイル:
     - `signal-processor-wasm/src/lib.rs`
     - `signal-processor-wasm/src/zero_cross_detector/utils.rs`
     - `signal-processor-wasm/src/zero_cross_detector/mod.rs`

     実行内容:
     `signal-processor-wasm/src/lib.rs`から`find_peak_in_range`および`find_zero_crossing_backward_from_peak`メソッドを切り出し、`signal-processor-wasm/src/zero_cross_detector/utils.rs`に移動してください。
     - 移動したメソッドは`ZeroCrossDetector`構造体のメソッドとして`utils.rs`内に実装してください。
     - `lib.rs`内の該当メソッドの呼び出し箇所を修正し、`self.zero_cross_detector.find_peak_in_range(...)`のように変更してください。
     - 必要に応じて、`utils.rs`および`lib.rs`に`use`宣言を追加・修正してください。
     - `zero_cross_detector/mod.rs`を更新し、`utils.rs`から移動した関数がエクスポートされるようにしてください。

     確認事項:
     - メソッド移動後、プロジェクト全体がコンパイルエラーなくビルドできることを確認してください。
     - 移動したメソッドの機能的な振る舞いが変わっていないことをテストコードやデモ実行で確認してください。
     - `lib.rs`の行数が削減されていることを確認してください。

     期待する出力:
     変更内容の概要と、`signal-processor-wasm/src/lib.rs`、`signal-processor-wasm/src/zero_cross_detector/utils.rs`、`signal-processor-wasm/src/zero_cross_detector/mod.rs`の変更箇所をを示すdiff形式で出力してください。

---
Generated at: 2026-02-10 07:18:05 JST
