Last updated: 2026-01-06

# Development Status

## 現在のIssues
- 波形表示エリアの下に、前回の波形、類似度、現在のフレームバッファ全体を示す比較パネルの追加 ([Issue #96](../issue-notes/96.md), [Issue #97](../issue-notes/97.md)) が進行中です。
- 描画処理のRust WASM化 ([Issue #92](../issue-notes/92.md)) に向け、処理の2分割リファクタリング ([Issue #90](../issue-notes/90.md)) と、各処理の所要時間計測 ([Issue #91](../issue-notes/91.md)) を計画しています。
- 一時停止時の波形破綻 ([Issue #77](../issue-notes/77.md)) や類似波形表示の不整合 ([Issue #79](../issue-notes/79.md)) など、波形表示に関する重要なバグ修正がオープンしています。

## 次の一手候補
1. 新しい波形比較パネルの実装完了 ([Issue #96](../issue-notes/96.md), [Issue #97](../issue-notes/97.md))
   - 最初の小さな一歩: `src/ComparisonPanelRenderer.ts`を新規作成し、3つの比較パネル（前回の波形、類似度、フレームバッファ位置）の基本的な描画フレームワークとCanvas要素の管理ロジックを実装する。
   - Agent実行プロンプ:
     ```
     対象ファイル: src/ComparisonPanelRenderer.ts (新規), src/Oscilloscope.ts, index.html

     実行内容:
     1. `src/ComparisonPanelRenderer.ts`を新規作成し、以下の機能を実装してください。
        - 3つのCanvas要素を管理し、それぞれに「前回の波形」「今回の波形と類似度」「現在のフレームバッファ全体と位置」を描画するメソッド。
        - 描画に必要なデータを外部から受け取れるように設計してください。
     2. `src/Oscilloscope.ts`に`ComparisonPanelRenderer`のインスタンスを生成・保持し、毎フレームの描画ループ内で適切なデータを渡して比較パネルを更新するロジックを追加してください。
     3. `index.html`に、3つの比較パネルを表示するための適切なDOM要素（例: `div`や`canvas`）を追加し、CSSで横並びに配置されるように調整してください。

     確認事項:
     - 既存の`WaveformRenderer`との描画処理の競合がないことを確認してください。
     - 比較パネルがメインの波形の下に正しく配置され、横並びに表示されることを確認してください。
     - パネルごとのデータの受け渡しと描画が、それぞれの目的に合致しているか確認してください。

     期待する出力:
     `src/ComparisonPanelRenderer.ts`の新規ファイル内容、`src/Oscilloscope.ts`と`index.html`への変更差分 (patch) をMarkdown形式で出力してください。
     ```

2. 描画処理の分割とパフォーマンス計測の準備 ([Issue #90](../issue-notes/90.md), [Issue #91](../issue-notes/91.md))
   - 最初の小さな一歩: 「描画の元情報を生成する処理」（例: 波形データの前処理、ゼロクロス検出、類似度計算）を`src/Oscilloscope.ts`から抽出し、新しい`src/WaveformProcessor.ts`クラスとして定義する。
   - Agent実行プロンプト:
     ```
     対象ファイル: src/Oscilloscope.ts, src/WaveformSearcher.ts, src/ZeroCrossDetector.ts, src/WaveformProcessor.ts (新規)

     実行内容:
     1. `src/WaveformProcessor.ts`を新規作成し、以下のロジックを`src/Oscilloscope.ts`および関連ファイルから移動または再構築してください。
        - オーディオバッファからの波形データの取得と前処理。
        - ゼロクロス検出 (`ZeroCrossDetector`の利用)。
        - 類似波形探索 (`WaveformSearcher`の利用)。
        - これらの処理結果（描画に必要な座標データ、類似度、周期など）をまとめたオブジェクトを返すインターフェースを定義してください。
     2. `src/Oscilloscope.ts`を修正し、`WaveformProcessor`のインスタンスを利用して描画元情報を取得するように変更してください。
     3. 既存の`WaveformRenderer.ts`が、`WaveformProcessor`から返されるデータを受け取って描画できるようにインターフェースを調整してください。

     確認事項:
     - リファクタリング後も、現在の波形表示、ゼロクロス検出、類似波形探索機能がすべて正常に動作することを確認してください。
     - `WaveformProcessor`と`WaveformRenderer`間のデータの受け渡しが明確かつ効率的であること、将来的なRust WASMへの置き換えを考慮した設計になっているかを確認してください。

     期待する出力:
     `src/WaveformProcessor.ts`の新規ファイル内容、および`src/Oscilloscope.ts`、`src/WaveformSearcher.ts`、`src/ZeroCrossDetector.ts`、`src/WaveformRenderer.ts`への変更差分 (patch) をMarkdown形式で出力してください。
     ```

3. 波形表示の一時停止時の不整合の原因特定 ([Issue #77](../issue-notes/77.md))
   - 最初の小さな一歩: 一時停止がトリガーされた際に、その時点のオーディオバッファの生データ、計算された描画範囲（開始・終了インデックス）、およびゼロクロス検出の結果をコンソールにログ出力するデバッグ機能を実装する。
   - Agent実行プロンプト:
     ```
     対象ファイル: src/Oscilloscope.ts, src/main.ts

     実行内容:
     1. `src/Oscilloscope.ts`の`pause`メソッドが呼び出された際、または一時停止状態に入った直後に、以下の情報をコンソールにログ出力するデバッグコードを追加してください。
        - 現在のオーディオバッファの全データ（またはその一部）。
        - 現在の描画開始・終了インデックス。
        - ゼロクロス検出によって決定された周期や位相情報。
        - その他の描画に影響を与える可能性のある内部状態変数。
     2. `src/main.ts`または関連するイベントハンドラで、一時停止がキーボードとマウスのどちらでトリガーされたかを示す情報もログに含めるようにしてください。

     確認事項:
     - デバッグログが一時停止時のみ出力され、通常の動作中にパフォーマンスを著しく低下させないことを確認してください。
     - ログの内容が、一時停止前後の波形データの状態や計算結果の差異を比較・分析するのに十分な情報を含んでいることを確認してください。
     - ログ出力されたデータに機密情報が含まれないことを確認してください。

     期待する出力:
     デバッグログ機能を追加するための`src/Oscilloscope.ts`と`src/main.ts`への変更差分 (patch) と、コンソールに出力されるログの例をMarkdown形式で記述してください。
     ```

---
Generated at: 2026-01-06 07:09:28 JST
