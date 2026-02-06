Last updated: 2026-02-07

# Development Status

## 現在のIssues
- [Issue #271](../issue-notes/271.md) は`signal-processor-wasm/src/lib.rs`が500行を超過しており、リファクタリングが推奨されています。
- [Issue #270](../issue-notes/270.md) は [Issue #269](../issue-notes/269.md) のパフォーマンス診断のために`Oscilloscope.ts`と`WaveformDataProcessor.ts`にフレームタイミング計測を追加しました。
- [Issue #269](../issue-notes/269.md) はPR 267適用後も`demo-library`のフレーム処理が400ms以上かかり、パフォーマンス回帰の懸念が報告されています。

## 次の一手候補
1.  [Issue #269](../issue-notes/269.md) demo-libraryのパフォーマンスボトルネックの詳細分析
    -   最初の小さな一歩: [Issue #270](../issue-notes/270.md) で追加された`Oscilloscope.ts`内のフレーム処理時間ログを精査し、`WaveformDataProcessor.processFrame`内部のどの処理が時間を要しているか特定する。
    -   Agent実行プロンプト:
        ```
        対象ファイル: `src/Oscilloscope.ts`, `src/WaveformDataProcessor.ts`, `signal-processor-wasm/src/lib.rs`

        実行内容: `src/Oscilloscope.ts`の`render`メソッド内にある`processingTime`および`frameProcessingTimes`のログ出力箇所と、`src/WaveformDataProcessor.ts`の`processFrame`メソッド、さらに`signal-processor-wasm/src/lib.rs`の`process_frame`関数について、時間の大部分を消費している可能性のあるコードブロックや関数呼び出しを特定するために、それぞれの処理ステップに詳細なタイムスタンプログを追加する計画を立ててください。特にWASM境界を越える呼び出しとその戻り値の処理に注目してください。

        確認事項: ログ出力の追加が既存の機能に影響を与えないこと。また、ログは開発時にのみ有効にし、リリースビルドでは無効化できるような仕組みを考慮してください。

        期待する出力: タイムスタンプログを追加する具体的なコード挿入位置と、そのログから得られるであろう情報（例: WASM呼び出しにXms、FFT計算にYmsなど）をmarkdown形式で記述してください。
        ```

2.  [Issue #271](../issue-notes/271.md) `signal-processor-wasm/src/lib.rs` のリファクタリングの検討
    -   最初の小さな一歩: `signal-processor-wasm/src/lib.rs`の`process_frame`関数内の主要な処理ブロック（例: `apply_noise_gate`, `estimate_frequency`, `search_similar_waveform`, `calculate_display_range`, `calculate_auto_gain`, `store_waveform`, `calculate_phase_markers_with_debug`, `calculate_cycle_similarities`）を特定し、それぞれの責任と依存関係を分析する。
    -   Agent実行プロンプト:
        ```
        対象ファイル: `signal-processor-wasm/src/lib.rs`

        実行内容: `signal-processor-wasm/src/lib.rs`の`process_frame`関数について、以下の観点から分析し、リファクタリングの機会を評価してください：
        1) 各処理ブロック（ノイズゲート、周波数推定、ゼロクロス検出、波形検索、ゲイン計算など）の開始と終了を識別し、それぞれの機能的な責任を記述してください。
        2) これらのブロック間のデータフローと依存関係をマッピングしてください。
        3) 責任が過剰な、またはロジックが密結合している可能性のあるブロックを特定し、新しい関数またはモジュールに分割する可能性を検討してください。

        確認事項: 分析はコードの振る舞いを変更しない範囲で行い、既存のテストケースへの影響を考慮してください。

        期待する出力: `process_frame`関数の主要な処理ブロックのリスト、各ブロックの責任と依存関係の概要、および潜在的なリファクタリングポイントをmarkdown形式で提示してください。
        ```

3.  [Issue #254](../issue-notes/254.md) フェーズマーカーの1%仕様違反に関する診断ログの分析
    -   最初の小さな一歩: `src/WaveformDataProcessor.ts`の`updatePhaseOffsetHistory`メソッドで出力される`[1% Spec Violation Detected - Issue #254]`のログメッセージの出現頻度と、ログに含まれる`diagnosticInfo`の内容を詳しく調査し、特に`phaseZero.offsetChange`や`phaseTwoPi.offsetChange`の値がどのように変化しているかを確認する。
    -   Agent実行プロンプト:
        ```
        対象ファイル: `src/WaveformDataProcessor.ts`, `signal-processor-wasm/src/lib.rs`

        実行内容: `src/WaveformDataProcessor.ts`内の`updatePhaseOffsetHistory`メソッドにおける`[1% Spec Violation Detected - Issue #254]`ログ出力について、以下の点を分析してください：
        1) ログがどのような条件で出力されるか（特に`percentChange > 1.0`のトリガー）。
        2) `diagnosticInfo`に含まれる`phaseZero.startOffsetPercent`, `phaseZero.offsetChange`, `phaseTwoPi.endOffsetPercent`, `phaseTwoPi.offsetChange`などの値が、ログ出力時にどのような範囲で、どのように変化しているか。
        3) これらのログが示唆するフェーズマーカーの不安定性が、WASM側の`signal-processor-wasm/src/lib.rs`の`calculate_phase_markers_with_debug`関数内のどのロジック（特に`zero_cross_detector.find_phase_zero_in_segment`や`history`の扱い）に起因している可能性があるか、仮説を立ててください。

        確認事項: この分析は既存のコードを変更するものではないため、現在の実装に基づいたログの意図と、それが示唆する問題を正確に理解することに焦点を当ててください。

        期待する出力: ログ出力のトリガー条件、`diagnosticInfo`の主要な値のパターン、およびフェーズマーカーの不安定性に関するWASM側の潜在的な原因の仮説をmarkdown形式で説明してください。

---
Generated at: 2026-02-07 07:09:40 JST
