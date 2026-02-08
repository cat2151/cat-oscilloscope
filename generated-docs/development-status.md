Last updated: 2026-02-09

# Development Status

## 現在のIssues
- `[Issue #303](../issue-notes/303.md)`は、`signal-processor-wasm/src/zero_cross_detector/mod.rs`ファイルが536行で、推奨されるコード行数を超過していると指摘しています。
- ファイルを機能ごとに分割し、共通ロジックを別モジュールに抽出すること、またクラスやインターフェースを適切なサイズに保つことがリファクタリングの推奨事項です。
- このIssueは自動生成されたもので、コード品質の向上とモジュール性改善を目的としています。

## 次の一手候補
1. `find_phase_zero_in_segment` の初期検出ロジックを `default_mode.rs` へ移動 ([Issue #303](../issue-notes/303.md))
   - 最初の小さな一歩: `ZeroCrossDetector::find_phase_zero_in_segment` メソッド内の「初期検出」部分の計算ロジック（`self.absolute_phase_offset` の更新を除く）を分析し、`default_mode.rs` 内に `calculate_initial_phase_zero_segment_relative` という新しい関数として抽出する。
   - Agent実行プロンプ:
     ```
     対象ファイル: `signal-processor-wasm/src/zero_cross_detector/mod.rs`, `signal-processor-wasm/src/zero_cross_detector/default_mode.rs`, `signal-processor-wasm/src/zero_cross_detector/utils.rs`

     実行内容:
     1. `signal-processor-wasm/src/zero_cross_detector/mod.rs` 内の `ZeroCrossDetector::find_phase_zero_in_segment` メソッドを分析してください。
     2. このメソッドの冒頭にある「初期検出 (Initial detection based on current mode)」の部分（`if self.absolute_phase_offset.is_none() || estimated_cycle_length < f32::EPSILON { ... }` ブロックの内部のうち、`let zero_cross_rel = ...;` から `return Some(constrained_rel);` までの計算ロジック）を、`signal-processor-wasm/src/zero_cross_detector/default_mode.rs` に `pub(crate) fn calculate_initial_phase_zero_segment_relative(segment: &[f32], estimated_cycle_length: f32, zero_cross_mode: ZeroCrossMode, min_allowed: usize, max_allowed_exclusive: usize) -> Option<usize>` という新しい関数として抽出してください。
     3. 抽出した関数は、`segment`, `estimated_cycle_length`, `zero_cross_mode` および `#296` の制約に使用される `min_allowed`, `max_allowed_exclusive` を引数として受け取り、セグメント相対のゼロクロス位置 `Option<usize>` を返すようにしてください。`ZeroCrossDetector` の状態 (`self.absolute_phase_offset`) の更新は元の `mod.rs` 側のメソッドに残してください。
     4. 抽出後、`mod.rs` の元の場所で新しい関数を呼び出すように修正し、その戻り値を使って `self.absolute_phase_offset` を更新するようにしてください。
     5. `default_mode.rs` に移動するロジックが `utils.rs` の関数を使用している場合、`default_mode.rs` からそれらの関数が呼び出せるように、`utils.rs` の関数が `pub(crate)` であることを確認してください。
     6. `min_allowed` と `max_allowed_exclusive` の計算ロジックは、まだ`find_phase_zero_in_segment`の最初の`if`ブロックに存在するので、まずはその計算結果を引数として渡す形にしてください。

     確認事項:
     - 抽出されたロジックが元のメソッドと同じ結果を返すことを確認する。
     - 既存のテストが壊れないことを確認する。
     - `mod.rs` から `default_mode.rs` の新しい関数への呼び出しが正しく行われることを確認する。
     - 抽出により`mod.rs`の行数が減少し、`default_mode.rs`の行数が増加するが、全体としての可読性と責務分離が向上することを確認する。

     期待する出力:
     1. `signal-processor-wasm/src/zero_cross_detector/mod.rs` の修正差分をMarkdown形式で出力。
     2. `signal-processor-wasm/src/zero_cross_detector/default_mode.rs` の新規追加/修正差分をMarkdown形式で出力。
     3. `signal-processor-wasm/src/zero_cross_detector/utils.rs` で必要となる可視性変更があればその差分をMarkdown形式で出力。
     4. リファクタリングの概要と、変更によって達成されるコード品質の改善点に関する簡潔な説明。
     ```

2. `ZeroCrossDetector` 内の定数定義の整理 ([Issue #303](../issue-notes/303.md))
   - 最初の小さな一歩: `ZeroCrossDetector` 構造体の `impl` ブロック内に定義されている多数の定数を分析し、関連性に基づいて論理的なグループに分類し、コメント付きで整理する。
   - Agent実行プロンプ:
     ```
     対象ファイル: `signal-processor-wasm/src/zero_cross_detector/mod.rs`

     実行内容:
     1. `signal-processor-wasm/src/zero_cross_detector/mod.rs` 内の `impl ZeroCrossDetector` ブロックに定義されている定数 (`ZERO_CROSS_SEARCH_TOLERANCE_CYCLES` など) を分析してください。
     2. これらの定数を、その使われ方や関連性に基づいて、論理的なグループに分割し、`impl` ブロック内にコメント付きで整理してください。
     3. 例えば、"Search Parameters", "Display Parameters", "Hysteresis Parameters" などに分類できます。
     4. 単にグループ分けするだけでなく、可能であれば、複数のメソッドで共有されるパラメータをまとめるなど、将来的な設定構造体への移行を考慮した整理を行ってください。

     確認事項:
     - 定数の値が変更されていないことを確認する。
     - 定数への参照がすべて正しく解決されることを確認する。
     - コードの可読性が向上し、関連する定数が探しやすくなることを確認する。

     期待する出力:
     1. `signal-processor-wasm/src/zero_cross_detector/mod.rs` の修正差分をMarkdown形式で出力。
     2. 定数整理の rationale (理由) に関する簡潔な説明。
     ```

3. `find_stable_peak` および `find_stable_zero_cross` の `default_mode.rs` への移動 ([Issue #303](../issue-notes/303.md))
   - 最初の小さな一歩: `ZeroCrossDetector::find_stable_peak` メソッドを `default_mode.rs` に移動し、`ZeroCrossDetector` の状態（`previous_peak_index`）を引数として受け取るようにシグネチャを変更する。
   - Agent実行プロンプ:
     ```
     対象ファイル: `signal-processor-wasm/src/zero_cross_detector/mod.rs`, `signal-processor-wasm/src/zero_cross_detector/default_mode.rs`, `signal-processor-wasm/src/zero_cross_detector/utils.rs`

     実行内容:
     1. `signal-processor-wasm/src/zero_cross_detector/mod.rs` 内の `ZeroCrossDetector::find_stable_peak` メソッドを分析してください。
     2. このメソッドを `signal-processor-wasm/src/zero_cross_detector/default_mode.rs` に移動し、`pub(crate) fn find_stable_peak_with_history(data: &[f32], estimated_cycle_length: f32, previous_peak_index: &mut Option<usize>) -> Option<usize>` という新しい関数として実装してください。
     3. 移動した関数は、`data`, `estimated_cycle_length` に加えて、`previous_peak_index: &mut Option<usize>` を引数として受け取り、内部でこのミュータブルな状態を更新するようにシグネチャを変更してください。
     4. `mod.rs` の元の場所で新しい関数を呼び出すように修正してください。
     5. これらの関数が `utils.rs` の関数 (`find_peak`, `find_next_peak` など) を使用している場合、`default_mode.rs` からそれらの関数が呼び出せるように、`utils.rs` の関数が `pub(crate)` であることを確認してください。

     確認事項:
     - 移動されたロジックが元のメソッドと同じ結果を返すことを確認する。
     - 既存のテストが壊れないことを確認する。
     - `mod.rs` から `default_mode.rs` の新しい関数への呼び出しが正しく行われることを確認する。
     - `mod.rs` の行数が減少し、`default_mode.rs` の行数が増加するが、全体としての可読性と責務分離が向上することを確認する。

     期待する出力:
     1. `signal-processor-wasm/src/zero_cross_detector/mod.rs` の修正差分をMarkdown形式で出力。
     2. `signal-processor-wasm/src/zero_cross_detector/default_mode.rs` の新規追加/修正差分をMarkdown形式で出力。
     3. `signal-processor-wasm/src/zero_cross_detector/utils.rs` で必要となる可視性変更があればその差分をMarkdown形式で出力。
     4. リファクタリングの概要と、変更によって達成されるコード品質の改善点に関する簡潔な説明。

---
Generated at: 2026-02-09 07:11:46 JST
