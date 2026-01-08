Last updated: 2026-01-09

# Development Status

## 現在のIssues
- 一時停止時に波形表示が破綻する [Issue #77](../issue-notes/77.md) の根本原因調査が喫緊の課題です。
- `wavlpf`からのライブラリ利用検討 [Issue #70](../issue-notes/70.md) と、波形探索周期のプルダウンメニュー追加 [Issue #64](../issue-notes/64.md) が機能改善として進行中です。
- UIの表示文言調整 [Issue #28](../issue-notes/28.md) や、周波数情報のA4+0cent表示 [Issue #25](../issue-notes/25.md)、ピアノ鍵盤風表示 [Issue #26](../issue-notes/26.md) といった改善が予定されています。

## 次の一手候補
1.  一時停止時の波形破綻 [Issue #77](../issue-notes/77.md) のデバッグログ追加
    -   最初の小さな一歩: 一時停止操作を行った際の、波形データ取得、処理、描画ロジックの各段階で詳細なデバッグログを出力するようにコードを追加する。
    -   Agent実行プロンプ:
        ```
        対象ファイル: `src/Oscilloscope.ts`, `src/WaveformDataProcessor.ts`, `src/WaveformRenderer.ts`

        実行内容: 一時停止時の波形表示が破綻する [Issue #77](../issue-notes/77.md) の原因を特定するため、以下のファイルにデバッグログを追加してください。`src/Oscilloscope.ts`で一時停止がトリガーされた時刻、`src/WaveformDataProcessor.ts`で処理されるRawデータ、`src/WaveformRenderer.ts`で描画される最終的なデータを、一時停止前後のタイムスタンプと共にコンソールに出力するように実装してください。特に、キーボードとマウス操作で挙動が異なる可能性を考慮し、どの操作で一時停止されたかもログに含めてください。

        確認事項: 既存の描画やデータ処理ロジックに影響を与えないこと。デバッグログは開発モードでのみ有効化されるように、条件分岐を設けることを検討してください。ログ出力が多すぎないか、パフォーマンスに影響がないかを確認してください。

        期待する出力: デバッグログが追加された`src/Oscilloscope.ts`, `src/WaveformDataProcessor.ts`, `src/WaveformRenderer.ts`の修正コード。
        ```

2.  波形探索周期プルダウンメニュー [Issue #64](../issue-notes/64.md) のUIプレースホルダー追加
    -   最初の小さな一歩: `index.html`に、自己相関判定に使う周期の倍率（1倍、2倍、3倍、4倍）を選択するプルダウンメニュー（`<select>`要素）を追加し、`src/main.ts`でそのDOM要素への参照を取得する。
    -   Agent実行プロンプト:
        ```
        対象ファイル: `index.html`, `src/main.ts`

        実行内容: [Issue #64](../issue-notes/64.md) に対応するため、`index.html`内の適切な位置（例: 既存のコントロール要素の近く）に、自己相関判定に使う周期の倍率を選択する`<select>`要素といくつかの`<option>`要素（1倍, 2倍, 3倍, 4倍）をプレースホルダーとして追加してください。その際、各`<option>`には適切な`value`属性（例: `1`, `2`, `3`, `4`）を設定してください。また、`src/main.ts`に新しいプルダウンメニューのDOM要素を取得し、デフォルト値（例: 1倍）を設定するコードを追加してください。

        確認事項: 既存のUIレイアウトを大幅に崩さないこと。追加するDOM要素に一意のIDを付与すること。`src/main.ts`でのDOM要素取得はページロード完了後に行われるようにすること。

        期待する出力: 新しいプルダウンメニューが追加された`index.html`の修正コードと、そのDOM要素の取得および初期設定が追加された`src/main.ts`の修正コード。
        ```

3.  周波数A4+0cent表示 [Issue #25](../issue-notes/25.md) とピアノ鍵盤風表示 [Issue #26](../issue-notes/26.md) の初期設計
    -   最初の小さな一歩: 現在の周波数表示箇所 (`src/ComparisonPanelRenderer.ts`) を分析し、A4+0cent形式の表示やピアノ鍵盤風の画像をどこに、どのように配置するのが最適か、そしてそれに必要なデータ変換ロジック（周波数からノート名、セント値、鍵盤画像へのマッピング）の実現可能性を検討する。
    -   Agent実行プロンプト:
        ```
        対象ファイル: `src/ComparisonPanelRenderer.ts`, `index.html`, `src/FrequencyEstimator.ts`

        実行内容: [Issue #25](../issue-notes/25.md) (A4+0cent表示) と [Issue #26](../issue-notes/26.md) (ピアノ鍵盤風表示) の実装に向けて、以下の観点から初期設計案をMarkdown形式で生成してください。
        1. 現在の周波数表示 (`src/ComparisonPanelRenderer.ts`, `index.html`) の隣接または代替として、A4+0cent形式の表示をどこに配置するか。
        2. 画面下部にピアノ鍵盤風の画像をどのように統合するか（例: CSS背景、SVG埋め込み、Canvas描画）。
        3. 周波数データ (`src/FrequencyEstimator.ts`が生成する周波数) から、A4+0cent表示に必要なノート名とセント値、および鍵盤の光らせる状態を計算するためのロジックの概要。
        4. これらのUI要素が既存のパフォーマンスやユーザビリティに与える影響。

        確認事項: 既存のUI要素との視覚的な競合を避けること。パフォーマンスオーバーヘッドを最小限に抑える設計を優先すること。将来的な拡張性を考慮した提案であること。

        期待する出力: 新しいUI要素の配置案、必要なデータ変換ロジックの概要、および影響を受けるファイルとその変更点の概説を含む、詳細なMarkdown形式の設計ドキュメント。
        ```

---
Generated at: 2026-01-09 07:09:28 JST
