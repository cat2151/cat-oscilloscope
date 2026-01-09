Last updated: 2026-01-10

# Development Status

## 現在のIssues
- [Issue #121](../issue-notes/121.md) と [Issue #120](../issue-notes/120.md) は、Rust WASM版で周波数推移グラフの履歴が毎フレームクリアされ、結果として折れ線グラフが表示されないという密接に関連するバグを報告しています。
- [Issue #119](../issue-notes/119.md) は、Rust WASM版の安定稼働後、TypeScriptとWASMで重複する機能をWASMに一本化し、メンテナンスコストを削減する方針を定めています。
- [Issue #77](../issue-notes/77.md) は、波形の一時停止時に波形表示が破綻するという、特にマウス操作時に頻発する表示バグについて言及しています。

## 次の一手候補
1.  [Issue #121](../issue-notes/121.md) および [Issue #120](../issue-notes/120.md) の解決: WASM周波数プロット履歴クリアバグとグラフ表示不具合の修正
    -   最初の小さな一歩: `src/WasmDataProcessor.ts` 内の `wasmProcessor.processFrame` の呼び出しと、Rust側の `wasm-processor/src/frequency_estimator.rs` にて周波数プロット履歴が適切に保持・更新されているかを確認する。
    -   Agent実行プロンプト:
        ```
        対象ファイル: `src/WasmDataProcessor.ts`, `wasm-processor/src/lib.rs`, `wasm-processor/src/frequency_estimator.rs`

        実行内容: `src/WasmDataProcessor.ts` の `processFrame` メソッドにおいて、`wasmResult.frequencyPlotHistory` が毎フレーム初期化されていないか、または正しく履歴が保持・更新されているかをRust側の実装と合わせて分析してください。特に、Rust側の `wasm-processor/src/frequency_estimator.rs` で履歴がクリアされるロジックがないか確認してください。

        確認事項: `WaveformRenderData` 構造体と `WasmProcessorInstance` インターフェースにおける `frequencyPlotHistory` の型定義と、Rust側の対応する構造体・メソッドでの履歴管理ロジックを確認してください。関連する最近のコミット (5337359など) を参照し、変更意図を理解してください。

        期待する出力: `src/WasmDataProcessor.ts` と `wasm-processor/src/frequency_estimator.rs` における `frequencyPlotHistory` のクリアまたは不正な更新ロジックを特定し、修正案をmarkdown形式で提案してください。
        ```

2.  [Issue #119](../issue-notes/119.md) に向けたWASMモジュールの安定化とTypeScript側の重複機能特定
    -   最初の小さな一歩: 現在TypeScriptとRust WASMの両方に存在すると思われる周波数推定、ゲイン制御、ゼロクロス検出、波形探索の機能について、TypeScript側の実装とRust側の実装を比較し、重複している機能を特定する。
    -   Agent実行プロンプト:
        ```
        対象ファイル: `src/FrequencyEstimator.ts`, `src/GainController.ts`, `src/ZeroCrossDetector.ts`, `src/WaveformSearcher.ts`, `wasm-processor/src/frequency_estimator.rs`, `wasm-processor/src/gain_controller.rs`, `wasm-processor/src/zero_cross_detector.rs`, `wasm-processor/src/waveform_searcher.rs`

        実行内容: 上記TypeScriptファイルとRustファイルの機能を比較し、現在重複して実装されている機能のリストをmarkdown形式で出力してください。各機能について、Rust版への一本化の難易度や必要な作業の概要も簡潔にまとめてください。

        確認事項: WASM版がTypeScript版の機能を完全に代替可能であるか、また、TypeScript版にしかない、またはWASM版に移行する際に考慮すべき特殊なロジックがないかを確認してください。

        期待する出力: TypeScriptとRust WASMで重複している機能のリスト、それぞれの機能における現状の依存関係、およびRust WASMへの一本化を進める上での考慮事項をmarkdown形式で出力してください。
        ```

3.  [Issue #77](../issue-notes/77.md) の波形表示破綻バグの初期調査
    -   最初の小さな一歩: `src/WaveformRenderer.ts` および関連する波形データ処理 (`src/WaveformDataProcessor.ts` や `src/WasmDataProcessor.ts`) の一時停止時のデータ処理ロジックを確認し、波形データがどのように取得・処理され、描画されているかを理解する。
    -   Agent実行プロンプト:
        ```
        対象ファイル: `src/WaveformRenderer.ts`, `src/WaveformDataProcessor.ts`, `src/WasmDataProcessor.ts`, `src/WaveformRenderData.ts`

        実行内容: `Issue #77` に記述されている「一時停止した瞬間の波形破綻」の原因となる可能性のある、一時停止時の波形データ処理や描画ロジックの不整合を分析してください。特に、`WaveformRenderData` の `displayStartIndex` や `displayEndIndex` が一時停止時に適切に設定されているか、またはデータが不適切に再利用されていないかを確認してください。

        確認事項: `AudioManager` からのデータ取得 (`getTimeDomainData()`) が一時停止時に停止しているか、または以前のデータが適切に保持・利用されているかを確認してください。キーボードとマウスでの挙動の違いが示唆するイベントハンドリングの差異も考慮に入れてください。

        期待する出力: `Issue #77` の波形破綻の原因となりうる仮説と、その検証のための次のステップをmarkdown形式で出力してください。
        ```

---
Generated at: 2026-01-10 07:09:14 JST
