Last updated: 2026-01-05

# Development Status

## 現在のIssues
- 現在、波形表示の安定性 ([Issue #82], [Issue #80], [Issue #78], [Issue #79], [Issue #77]) と低周波での周波数推定精度 ([Issue #81]) に関する複数の課題がオープンしています。
- 特に、候補波形の選定アルゴリズムの不正確さ、デバッグ表示の不整合、一時停止時の波形破綻などが主要な問題です。
- これらの根本原因を特定し、より安定したアルゴリズムへの改善と、ユーザーが周期を選択できる機能 ([Issue #64]) の追加が求められています。

## 次の一手候補
1. 波形候補の選定アルゴリズムの根本的な見直し ([Issue #82], [Issue #80], [Issue #78])
   - 最初の小さな一歩: `src/Oscilloscope.ts` 内の `selectBestCandidate` メソッドを分析し、[Issue #82] で指摘されている「referenceIndexが現在のフレームバッファを指している」問題とその周辺ロジックが、[Issue #80] の「end位置の算出」や [Issue #78] の「search buffer上の候補startの不安定さ」にどのように影響しているかを特定する。
   - Agent実行プロンプト:
     ```
     対象ファイル: src/Oscilloscope.ts, src/WaveformRenderer.ts, src/DebugRenderer.ts

     実行内容: src/Oscilloscope.ts の `selectBestCandidate` メソッドと、そのメソッドが利用するバッファやインデックスの扱いに焦点を当て、[Issue #82](../issue-notes/82.md), [Issue #80](../issue-notes/80.md), [Issue #78](../issue-notes/78.md) の問題がどのように発生しているかを分析してください。特に、`referenceIndex`がどのように使われ、それが波形候補の`start`と`end`の決定にどう影響するかを詳細に調査し、現在のアルゴリズムの問題点を具体的に特定してください。

     確認事項: 
     - `selectBestCandidate`が呼び出される際の入力データ（`searchBuffer`, `referenceWaveform`, `frequency`, `sampleRate`など）の想定される状態。
     - `referenceIndex`と`candidate.start`, `candidate.end`の関係性。
     - 波形が上下反転するケースが、このアルゴリズムに起因する可能性がないか。

     期待する出力: markdown形式で、`selectBestCandidate`の既存アルゴリズムが各Issue ([Issue #82](../issue-notes/82.md), [Issue #80](../issue-notes/80.md), [Issue #78](../issue-notes/78.md)) の問題を引き起こしている具体的なメカニズムを説明し、改善の方向性について初期提案を含めてください。
     ```

2. 低周波における周波数推定の改善アプローチの検討と実装 ([Issue #81])
   - 最初の小さな一歩: `src/FrequencyEstimator.ts` の現状のFFTベースの周波数推定ロジックを確認し、短時間フレームバッファでの低周波推定の限界を、理論的および実装上の観点から文書化する。そして、過去フレームバッファの利用方法（1, 4, 16倍のサイズ）やSTFT/CQTなどの代替手法の実現可能性について、初期的な調査と技術的なトレードオフをまとめる。
   - Agent実行プロンプト:
     ```
     対象ファイル: src/FrequencyEstimator.ts

     実行内容: src/FrequencyEstimator.ts 内の周波数推定ロジック（特にFFT関連部分）を分析し、現在の1/60秒フレームバッファ長での低周波推定の失敗メカニズムを特定してください。[Issue #81](../issue-notes/81.md) で提案されている「過去フレームバッファ利用 (1, 4, 16倍)」および「STFTやCQTの導入」について、それぞれの実現可能性、必要な変更、および技術的な課題を調査し、比較分析してください。

     確認事項: 
     - 現在のFFT実装における窓関数やパディングの有無。
     - `sampleRate`とフレームバッファ長から算出される周波数分解能。
     - STFTやCQTの導入が既存のアーキテクチャに与える影響。
     - 複数フレームバッファを結合してFFTする場合のデータ管理方法。

     期待する出力: markdown形式で、現在の周波数推定の問題点 ([Issue #81](../issue-notes/81.md)) を技術的に説明し、提案されている各改善策 (過去フレームバッファ利用、STFT、CQT) のメリット・デメリット、実装の複雑さ、および実現へのロードマップ（最初のステップを含む）を比較して出力してください。
     ```

3. デバッグ表示の不整合と一時停止時の波形破綻の修正 ([Issue #79], [Issue #77])
   - 最初の小さな一歩: `src/DebugRenderer.ts` と `src/Oscilloscope.ts` の間のデータフロー、特に波形データが `Oscilloscope` から `DebugRenderer` に渡されるタイミングと形式を調査する。一時停止 (pause) ロジックがどのように波形バッファに影響を与えているかを特定し、[Issue #77] の「一時停止時の波形破綻」と [Issue #79] の「デバッグ表示の上下反転」がデータ取得/描画のどの段階で発生しているかを仮説立てる。
   - Agent実行プロンプト:
     ```
     対象ファイル: src/DebugRenderer.ts, src/Oscilloscope.ts, src/WaveformRenderer.ts

     実行内容: src/Oscilloscope.ts における波形データの処理、src/DebugRenderer.ts におけるデバッグ表示の描画、および一時停止機能の実装 (もしあれば) を分析してください。特に、[Issue #79](../issue-notes/79.md) の「デバッグ表示の候補の上下反転と表示不整合」と [Issue #77](../issue-notes/77.md) の「一時停止時の波形破綻」が、波形データのコピー、同期、または描画処理のどの段階で発生している可能性があるかを特定し、具体的な原因の仮説を立ててください。

     確認事項: 
     - `DebugRenderer` が参照する波形データが、`Oscilloscope` のメイン処理のどの時点のデータであるか。
     - 波形データをコピーして使用しているか、参照渡ししているか。
     - 一時停止ロジックが波形データの更新をどのように停止または一時停止しているか。
     - 波形描画時の座標変換や正規化の処理。

     期待する出力: markdown形式で、[Issue #79](../issue-notes/79.md) と [Issue #77](../issue-notes/77.md) の問題を引き起こしている可能性のあるデータフローまたは描画ロジックの具体的な箇所を指摘し、それぞれの問題に対する最も可能性の高い原因の仮説を複数提示してください。

---
Generated at: 2026-01-05 07:08:48 JST
