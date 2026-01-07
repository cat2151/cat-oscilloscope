Last updated: 2026-01-08

# Development Status

## 現在のIssues
- [Issue #106](../issue-notes/106.md) と [Issue #105](../issue-notes/105.md) は、WASMモジュールのロードパスがViteのベースパス設定を考慮しておらず、GitHub Pages環境でエラーとなる問題を修正する必要があります。
- [Issue #107](../issue-notes/107.md) は、フレームバッファ、前回波形、今回波形の3つの振幅表示が小さすぎるため、それぞれの波形をキャンバスの縦幅いっぱいに拡大表示する改善が求められています。
- [Issue #77](../issue-notes/77.md) は、一時停止した瞬間の波形が破綻することがあり、特にマウス操作で発生しやすいという不安定性の問題の調査と修正が必要です。

## 次の一手候補
1. WASMモジュールのロードパスを修正し、GitHub Pagesでのエラーを解消する [Issue #106](../issue-notes/106.md)
   - 最初の小さな一歩: `src/WasmDataProcessor.ts` 内のWASMモジュールロード処理において、ハードコードされているパスをViteのベースパス設定に対応するよう変更する。
   - Agent実行プロンプ:
     ```
     対象ファイル: `src/WasmDataProcessor.ts`, `public/wasm/wasm_processor.js`

     実行内容: `src/WasmDataProcessor.ts` の `loadWasmModule` メソッド内でハードコードされているWASMモジュールのパス `/wasm/wasm_processor.js` を、Viteのベースパス設定（例: `import.meta.env.BASE_URL`）を考慮して動的に解決するように修正してください。具体的には、`script.textContent` 内のパスを修正し、`public/wasm/wasm_processor.js` がどのようにバンドルされるか考慮して適切なパス解決方法を適用してください。

     確認事項:
     - 開発環境 (`npm run dev`) でWASMモジュールが正しくロードされること。
     - プロダクションビルド (`npm run build`) 後、GitHub Pagesなどのサブディレクトリにデプロイされた環境でWASMモジュールが正しくロードされ、機能すること。
     - `public/wasm/wasm_processor.js` のビルド生成方法とViteの`base`設定との整合性を確認してください。

     期待する出力: `src/WasmDataProcessor.ts` の修正案をMarkdown形式で提示してください。可能であれば、修正後のファイル内容全体を提示してください。
     ```

2. 振幅が小さい波形を縦いっぱいに拡大表示する [Issue #107](../issue-notes/107.md)
   - 最初の小さな一歩: `src/ComparisonPanelRenderer.ts` で描画される各波形（フレームバッファ、前回波形、今回波形）について、データ内の最大絶対値を見つけ、それを基準にキャンバスの縦幅の80%〜90%になるようにスケーリングするロジックを実装する。
   - Agent実行プロンプト:
     ```
     対象ファイル: `src/ComparisonPanelRenderer.ts`, `src/WaveformRenderer.ts`

     実行内容: [Issue #107](../issue-notes/107.md) に基づき、`src/ComparisonPanelRenderer.ts` および必要であれば共通描画処理を行う `src/WaveformRenderer.ts` において、現在表示されている3つの波形（フレームバッファ、前回波形、今回波形）の振幅が小さすぎる場合、それぞれの波形データ内で最大の絶対値を見つけ、それを基準にキャンバスの縦幅いっぱいに拡大表示するロジックを実装してください。具体的には、ピーク振幅を検出し、そのピークがキャンバスの表示範囲の約80%になるようにゲインを調整してください。

     確認事項:
     - 振幅が小さい場合に正しく拡大表示されること。
     - 振幅が大きい場合に波形がクリッピングされないよう適切に調整されること。
     - 3つの波形がそれぞれ独立して、かつ適切にスケーリングされること。
     - 以前のコミット `ae6990e` で行われた「波形を80%に正規化」の変更との整合性を確認すること。

     期待する出力: `src/ComparisonPanelRenderer.ts` と `src/WaveformRenderer.ts` の修正案をMarkdown形式で提示してください。修正後のファイル内容全体を含めてください。
     ```

3. 一時停止時の波形破綻の原因を特定するためのデバッグログを追加する [Issue #77](../issue-notes/77.md)
   - 最初の小さな一歩: 一時停止がトリガーされる前後で、`src/main.ts`や`src/WaveformDataProcessor.ts`/`src/WasmDataProcessor.ts`の主要なデータ処理ポイントに、波形データや表示インデックスなどの状態をログ出力する処理を追加する。
   - Agent実行プロンプト:
     ```
     対象ファイル: `src/main.ts`, `src/WaveformDataProcessor.ts`, `src/WasmDataProcessor.ts`, `src/WaveformRenderer.ts`

     実行内容: [Issue #77](../issue-notes/77.md) に記載されている「一時停止した瞬間の波形が破綻する」問題の原因を特定するため、以下のデバッグロギングを追加してください。
     1. 一時停止がトリガーされる前後で、`src/main.ts`または関連するイベントハンドラにデバッグログを追加し、トリガーイベント（キーボード/マウス）とタイムスタンプを記録。
     2. `src/WaveformDataProcessor.ts` または `src/WasmDataProcessor.ts` の `processFrame` メソッド内で、一時停止の前後で `waveformData`, `displayStartIndex`, `displayEndIndex`, `estimatedFrequency`, `gain`, `similarity` などの主要なレンダリングパラメータの値をログ出力。
     3. `src/WaveformRenderer.ts` の描画関数で、実際に描画に使われる `waveformData` の範囲と値、キャンバスサイズなどをログ出力。
     デバッグログは、特に「キーボードよりマウスのほうが破綻しやすい」という現象を分析できるように、入力方法を区別して記録してください。

     確認事項:
     - 追加されたデバッグログが、アプリケーションのパフォーマンスに大きな影響を与えないこと。
     - ログ出力が一時停止前後の状態変化を追跡できる十分な情報を提供すること。
     - 本番環境へのデプロイ前に、デバッグログを容易に削除または無効化できる仕組みがあること。

     期待する出力: デバッグログ追加後のコードスニペットと、ログを追加したファイルの詳細な説明をMarkdown形式で提示してください。
     ```

---
Generated at: 2026-01-08 07:09:00 JST
