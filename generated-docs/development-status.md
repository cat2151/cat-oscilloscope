Last updated: 2026-02-08

# Development Status

## 現在のIssues
- `src/Oscilloscope.ts` が500行を超過しており、機能分割によるリファクタリングが推奨されています ([Issue #291](../issue-notes/291.md))。
- 赤い縦線（位相0マーカー）の移動アルゴリズムを、4周期バッファから最寄り候補へ段階的に移動するよう修正中です ([Issue #289](../issue-notes/289.md), [Issue #290](../issue-notes/290.md))。
- 検証目的で「今回の波形」エリアに前回の波形も一時的に描画する機能追加を検討しています ([Issue #288](../issue-notes/288.md))。

## 次の一手候補
1.  `src/Oscilloscope.ts` のリファクタリングと機能分割の計画 ([Issue #291](../issue-notes/291.md))
    -   最初の小さな一歩: `src/Oscilloscope.ts` のクラス構造とメソッド、特にレンダリング関連のロジックが他のクラスとどのように連携しているかを分析し、大まかな機能分割案を検討する。
    -   Agent実行プロンプ:
        ```
        対象ファイル: `src/Oscilloscope.ts`, `src/WaveformRenderer.ts`, `src/ComparisonPanelRenderer.ts`, `src/CycleSimilarityRenderer.ts`

        実行内容: `src/Oscilloscope.ts` のクラス構造とメソッドを分析し、特にレンダリングに関連するロジック（`renderFrame` メソッド内部の処理や、`renderer`、`comparisonRenderer`、`cycleSimilarityRenderer` の利用部分）がどのように他のクラスと連携しているかを洗い出してください。そして、このファイルが肥大化している原因と、具体的な分割候補（例えば、レンダリング管理を担う新しいオーケストレーションクラスの導入や、既存のレンダリングクラスへの責任委譲）をmarkdown形式で提案してください。

        確認事項: `Oscilloscope.ts` が持つ他のモジュール（AudioManager, GainController, FrequencyEstimatorなど）との依存関係、およびレンダリング関連の責任範囲について確認し、既存機能の破壊がないように注意してください。

        期待する出力: `src/Oscilloscope.ts` のリファクタリング案をmarkdown形式で出力してください。具体的には、どのメソッド群をどの新しい（または既存の）クラスに移動するか、その際のクラス間の新しい連携方法について記述してください。
        ```

2.  赤い縦線（位相0マーカー）の移動アルゴリズムに`find_all_zero_crosses`を実装 ([Issue #289](../issue-notes/289.md), [Issue #290](../issue-notes/290.md))
    -   最初の小さな一歩: `signal-processor-wasm/src/zero_cross_detector/utils.rs` に、指定セグメント内の全てのゼロクロス点を抽出する `find_all_zero_crosses` 関数を新規実装する。
    -   Agent実行プロンプト:
        ```
        対象ファイル: `signal-processor-wasm/src/zero_cross_detector/mod.rs`, `signal-processor-wasm/src/zero_cross_detector/utils.rs`, `src/ZeroCrossDetector.ts`

        実行内容: `signal-processor-wasm/src/zero_cross_detector/utils.rs` に `find_all_zero_crosses` 関数を新規追加し、`data: &[f32]`, `start_index: usize`, `end_index: usize` を受け取り、指定されたセグメント内の全てのゼロクロス点（`data[i] <= 0.0 && data[i + 1] > 0.0` となる `i` のインデックス）を `Vec<usize>` として返すRustコードを実装してください。その後、`signal-processor-wasm/src/zero_cross_detector/mod.rs` 内の関連するロジック（特に位相0マーカーの移動方向決定部分）を、この新しい関数を利用するように修正し、現在位置から最寄り候補へ向かって段階的に移動するアルゴリズムを組み込んでください。候補がない場合は移動しないロジックも追加します。

        確認事項: 既存のゼロクロス検出モード（standard, peak-backtrack-historyなど）への影響がないこと、および新しいアルゴリズムがパフォーマンスに与える影響を考慮してください。`initialize_history` 関数との整合性も確認してください。

        期待する出力: 変更されたRustコードスニペットと、変更の論理的根拠をmarkdown形式で出力してください。特に、`find_all_zero_crosses`関数の実装と、それを利用するように変更された位相0マーカー移動ロジックについて詳しく説明してください。
        ```

3.  「今回の波形」エリアに検証用に前回の波形を描画する一時的な機能追加 ([Issue #288](../issue-notes/288.md))
    -   最初の小さな一歩: `src/ComparisonPanelRenderer.ts` および `src/comparison-renderers/WaveformPanelRenderer.ts` を開き、現在の波形を描画している箇所を特定し、前回の波形を描画するために必要なデータ受け渡しと描画ロジックの変更点を洗い出す。
    -   Agent実行プロンプト:
        ```
        対象ファイル: `src/Oscilloscope.ts`, `src/ComparisonPanelRenderer.ts`, `src/comparison-renderers/WaveformPanelRenderer.ts`, `src/__tests__/comparison-panel-renderer.test.ts`

        実行内容: `src/ComparisonPanelRenderer.ts` の `updatePanels` メソッドを修正し、前回の波形データも受け取れるように引数を追加してください。次に、`src/comparison-renderers/WaveformPanelRenderer.ts` に、現在の波形に加え、指定されたオフセットやスタイル（例: 異なる色や半透明）で前回の波形を描画する一時的な描画ロジックを追加してください。この描画は検証用であり、現在の波形と区別がつくようにします。最後に、この変更が期待通りに動作するかを確認するための単純なテストケースを `src/__tests__/comparison-panel-renderer.test.ts` に追加してください。

        確認事項: 既存の「今回の波形」パネルの表示に影響を与えないこと。追加される描画は検証用であるため、将来的に容易に削除できるようコメント等で明示すること。パフォーマンスへの影響も最小限に抑えることを確認してください。

        期待する出力: 変更されたTypeScriptコードスニペットと、追加されたテストコード、および変更の意図をmarkdown形式で出力してください。描画ロジックにおける色やスタイルの選択についても言及してください。
        ```

---
Generated at: 2026-02-08 07:10:54 JST
