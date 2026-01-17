# Issue #179 再分析: マイク入力時の類似度0スパイク問題

## 前提条件の更新

**重要な観察結果**: 周波数推定グラフは安定している
- これにより、仮説1「周波数推定の不安定性」は除外される
- 問題はリアルタイムデータ取得に関連する可能性が高い

## 問題の概要

マイクで人の声を入力すると、類似度0のスパイクが1秒に10回前後発生する。
WAVファイルで単純波形を入力した場合は問題ない。

## マイクとWAVファイルの違い

### マイク入力の特性
1. **リアルタイム処理**: `requestAnimationFrame`ループ（最大60fps）でデータを取得
2. **非決定論的データ**: Web Audio APIのAnalyserNodeから毎フレーム新しいデータを取得
3. **タイミング制約**: フレームレートが60fps未満になるとデータ取得のタイミングがずれる
4. **バッファ更新**: AudioContextが内部で管理するバッファが非同期で更新される

### WAVファイル入力の特性
1. **決定論的データ**: 同じバッファがループ再生される
2. **安定したタイミング**: AudioBufferSourceNodeが一定のタイミングでデータを提供
3. **予測可能**: 波形は完全に再現可能

## 新しい仮説（優先度順）

### 仮説A: フレームドロップによるデータ不整合（最有力）

**内容:**
`requestAnimationFrame`が60fps未満で実行される場合、AudioContextのバッファ更新とフレーム処理のタイミングがずれ、以下の問題が発生する：
- 同じバッファデータを複数回読み取る可能性
- バッファの一部をスキップする可能性
- 前回フレームと今回フレームで取得するデータが連続しない

**根拠:**
- `Oscilloscope.ts:152` で `requestAnimationFrame` を使用
- `AudioManager.ts:203` で毎フレーム `analyser.getFloatTimeDomainData()` を呼び出し
- AnalyserNodeは内部バッファを持ち、読み取りタイミングに依存する
- 1秒に10回のスパイク ≈ 100msごと = フレーム処理の遅延やドロップの頻度と一致する可能性

**検証方法:**
1. フレーム処理時間を測定（`performance.now()`を使用）
2. 60fps未満のフレームレートを検出
3. データ取得のタイミングとバッファ更新のタイミングを比較
4. 類似度が0になるタイミングでフレーム処理時間を確認

**修正案:**
1. **タイムスタンプベースのデータ検証**: 
   - AudioContextの`currentTime`を使用してデータの連続性を確認
   - 非連続なデータを検出した場合、類似度計算をスキップせず、前回の値を維持
2. **ScriptProcessorNode / AudioWorkletの使用検討**:
   - より正確なタイミング制御のため、AudioWorkletを使用
   - ただし、これは大きな実装変更を伴う
3. **フレームドロップ時の類似度計算の継続**:
   - データが不完全でも、利用可能な範囲で類似度を計算
   - 類似度を0にする代わりに、前回の類似度を維持

### 仮説B: バッファサイズ不足（中程度の可能性）

**内容:**
`analyser.fftSize = 4096` は約85ms分のデータ（48kHz時）。低周波の人声（100Hz〜150Hz）の場合、4サイクル分が不足する可能性がある。

**根拠:**
- `AudioManager.ts:34` でFFTサイズは4096に固定
- `waveform_searcher.rs:94-97` で `current_frame.len() < waveform_length` の場合に類似度が0
- 100Hzの音声の4サイクル = 40ms（問題なし）
- ただし、バッファサイズマルチプライヤーが正しく適用されていない可能性

**検証方法:**
1. バッファサイズマルチプライヤーの設定を確認
2. `AudioManager.getExtendedTimeDomainData()` が正しく呼ばれているか確認
3. 類似度が0になるときのバッファ長とwaveform_lengthを比較

**修正案:**
1. バッファサイズマルチプライヤーがWASM側で正しく使用されていることを確認
2. 不足を検出した場合、類似度を0にせず前回の値を保持

### 仮説C: AnalyserNodeのデータ読み取りタイミング問題

**内容:**
`getFloatTimeDomainData()` を呼び出すタイミングによって、AudioContextの内部バッファの異なる部分を読み取る可能性がある。

**根拠:**
- Web Audio APIの仕様では、AnalyserNodeは最新のオーディオデータを保持
- `smoothingTimeConstant = 0` により平滑化なし（`AudioManager.ts:35`）
- 連続する2つの `getFloatTimeDomainData()` 呼び出しで、重複しないデータが返される保証はない

**検証方法:**
1. 連続する2フレームのデータのオーバーラップを確認
2. データの変化率を測定

**修正案:**
1. データの連続性を検証し、不連続な場合は類似度計算をスキップ
2. AudioWorkletを使用してより正確なデータ取得

### 仮説D: WASM処理時間による遅延

**内容:**
WASMでの処理が重く、フレーム処理が16.67ms（60fps）を超える場合、次のフレームでデータが古くなる。

**根拠:**
- `WaveformDataProcessor.processFrame()` がWASMを呼び出し（`WaveformDataProcessor.ts:316`）
- 相関係数計算は計算量が多い（`waveform_searcher.rs:36-67`）
- 1秒に10回のスパイクは、処理負荷が高い瞬間と一致する可能性

**検証方法:**
1. WASM処理時間を測定
2. 類似度が0になるタイミングで処理時間を確認
3. パフォーマンスプロファイリング

**修正案:**
1. 相関係数計算の最適化
2. Web Workerでの非同期処理（大きな実装変更）
3. 処理が遅い場合、類似度計算を一時的にスキップし前回の値を維持

### 仮説E: ノイズゲートによる信号カット

**内容:**
人の声の音量が変動し、ノイズゲート閾値を下回る瞬間がある。ノイズゲートが有効な場合、信号が0で埋められ、類似度計算が失敗する。

**根拠:**
- `gain_controller.rs:112-116` で、ノイズゲート閾値を下回ると `data.fill(0.0)` される
- デフォルト閾値は `-48dB` (0.003981072)
- 人の声は音量の変動が大きい（特に子音と母音の間）

**検証方法:**
1. ノイズゲートを無効化した場合の動作を確認
2. 類似度が0になるタイミングで `is_signal_above_noise_gate` の値を確認

**修正案:**
1. ノイズゲート適用後も前回の波形情報を保持し、信号が復帰したときにスムーズに類似度計算を再開
2. 信号が閾値以下の場合、類似度を0にせず前フレームの値を維持

## 推奨される対応順序

### フェーズ1: 診断・ログ追加（優先度: 最高）

1. **フレームレート測定**
   ```typescript
   // Oscilloscope.tsのrender()メソッドに追加
   private lastFrameTime = 0;
   private frameCount = 0;
   private fpsLog: number[] = [];
   
   private render(): void {
     const now = performance.now();
     if (this.lastFrameTime > 0) {
       const fps = 1000 / (now - this.lastFrameTime);
       this.fpsLog.push(fps);
       if (this.fpsLog.length > 100) this.fpsLog.shift();
     }
     this.lastFrameTime = now;
     // ... 既存の処理
   }
   ```

2. **類似度が0になる条件のログ出力**
   ```rust
   // waveform_searcher.rsのsearch_similar_waveform()に追加
   if cycle_length <= 0.0 {
       eprintln!("Similarity=0: cycle_length <= 0 ({})", cycle_length);
       self.update_similarity_history(0.0);
       return None;
   }
   if current_frame.len() < waveform_length {
       eprintln!("Similarity=0: buffer too short ({} < {})", 
                 current_frame.len(), waveform_length);
       // ...
   }
   ```

3. **AudioContextのcurrentTimeとバッファ取得のタイミング記録**

### フェーズ2: 暫定修正（優先度: 高）

1. **類似度が0の場合、前回の値を維持**
   ```rust
   // waveform_searcher.rsに修正を追加
   fn update_similarity_history(&mut self, similarity: f32) {
       // 類似度が0で、前回の値が有効な場合は前回の値を維持
       if similarity == 0.0 && self.last_similarity > 0.0 {
           self.similarity_history.push_back(self.last_similarity);
       } else {
           self.last_similarity = similarity;
           self.similarity_history.push_back(similarity);
       }
       // ...
   }
   ```

2. **フレームドロップ検出と警告**

### フェーズ3: 根本的な修正（優先度: 中）

1. AudioWorkletの検討（大規模な変更）
2. 相関係数計算の最適化
3. データ連続性の検証と補正

## 実装上の注意点

- すべてのデータ処理アルゴリズムはRust/WASMで実装されているため、修正はRust側で行う
- TypeScript側は設定の保持とレンダリングのみを担当
- デバッグログはconsole.log()ではなくeprintln!()を使用（WASM）
- WASMのビルドには `npm run build:wasm` を使用（wasm-packが必要）
