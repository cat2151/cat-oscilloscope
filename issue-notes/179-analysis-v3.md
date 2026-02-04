# Issue #179 再々分析: Fail Fast視点からの問題隠蔽の可能性調査

## 前提条件

1. **周波数推定グラフは安定している** - 周波数推定の不安定性は除外
2. **マイク入力時に類似度0のスパイクが1秒に10回前後発生**
3. **WAVファイル入力では問題なし** - 決定論的データでは発生しない
4. **以前、類似度0を隠蔽する実装があった** - 「直前の高い類似度の表示のままとする」という問題隠蔽実装が存在していた

## 分析の観点: Fail Fast vs. 問題隠蔽

コーディングエージェントは頻繁に問題を隠蔽する実装をしてしまう傾向がある。
以下の観点で実装を調査：

1. **フレームバッファ欠落時に問題を隠蔽していないか？**
2. **1/60秒以内に処理が終わらなかった場合に問題を隠蔽していないか？**
3. **データが不完全な場合に、fail fastせず正常に処理したように見せかけていないか？**

## 発見された問題隠蔽の実装

### 1. 類似度が0になる条件の隠蔽（最重要）

**場所**: `signal-processor-wasm/src/waveform_searcher.rs`

#### 問題点1: cycle_lengthが0以下の場合（86-89行）
```rust
if cycle_length <= 0.0 {
    self.update_similarity_history(0.0);
    return None;
}
```

**隠蔽されている問題**:
- 周波数推定が失敗した（`estimated_frequency <= 0.0`）
- サンプルレートが0以下（通常はありえない）
- **ログ出力なし** - なぜ0になったのか追跡不可能

#### 問題点2: バッファサイズ不足の場合（94-97行）
```rust
if current_frame.len() < waveform_length {
    self.update_similarity_history(0.0);
    return None;
}
```

**隠蔽されている問題**:
- フレームバッファが不足している
- `requestAnimationFrame`でデータを取得したタイミングでAnalyserNodeのバッファが不完全だった可能性
- **マイク入力時の1秒に10回のスパイクの最有力候補**
- **ログ出力なし** - バッファ不足が発生したことがわからない

#### 問題点3: 前回波形との長さ不一致（99-102行）
```rust
if prev_waveform.len() != waveform_length {
    self.update_similarity_history(0.0);
    return None;
}
```

**隠蔽されている問題**:
- 前回フレームと今回フレームで周波数が大きく変化した
- または前回のバッファ保存が不完全だった
- **ログ出力なし** - 不一致が発生したことがわからない

#### 問題点4: record_no_search()の隠蔽（169-171行）
```rust
pub fn record_no_search(&mut self) {
    self.update_similarity_history(0.0);
}
```

**隠蔽されている問題**:
- 検索を実行しなかった理由（`cycle_length <= 0.0`または`!has_previous_waveform()`）が記録されない
- **呼び出し元**: `lib.rs:211-212` - `has_previous_waveform()`がtrueだが`cycle_length <= 0.0`の場合

### 2. ノイズゲートによるデータ消失の隠蔽

**場所**: `signal-processor-wasm/src/gain_controller.rs:112-116`

```rust
pub fn apply_noise_gate(&mut self, data: &mut [f32]) {
    if !self.is_signal_above_noise_gate(data) {
        data.fill(0.0);
    }
}
```

**隠蔽されている問題**:
- 信号がノイズゲート閾値以下になった
- バッファ全体が0で上書きされる
- **その後の処理で「データが存在する」として処理が続行される**
- 人の声の音量変動（子音と母音の間）でこれが発生する可能性
- **ログ出力なし**

### 3. 空データの黙認

**場所**: `signal-processor-wasm/src/lib.rs:154-156`

```rust
if waveform_data.is_empty() {
    return None;
}
```

**隠蔽されている問題**:
- AudioContextからデータが取得できなかった
- **ログ出力なし** - データ取得失敗が追跡不可能

### 4. フレーム処理時間の未測定

**場所**: `src/Oscilloscope.ts:133-153`

```typescript
private render(): void {
    if (!this.isRunning) {
        return;
    }

    if (!this.isPaused) {
        const renderData = this.dataProcessor.processFrame(this.renderer.getFFTDisplayEnabled());
        // ... 描画処理
    }

    this.animationId = requestAnimationFrame(() => this.render());
}
```

**隠蔽されている問題**:
- フレーム処理が16.67ms（60fps）を超えているかどうか不明
- フレームドロップが発生しているかどうか不明
- **測定コードなし** - パフォーマンス問題が追跡不可能

### 5. AudioContextのタイミング情報の未使用

**場所**: `src/AudioManager.ts:203`（推定）

```typescript
// getTimeDomainData()の実装でcurrentTimeを使用していない
analyser.getFloatTimeDomainData(dataArray);
```

**隠蔽されている問題**:
- 連続する2フレームのデータの連続性が保証されない
- AudioContextの`currentTime`を使用すればタイミングのずれを検出できる
- **検証コードなし** - データの連続性が保証されていない

## 類似度0スパイクの真の原因（高確率仮説）

### 仮説: リアルタイムデータ取得時のバッファ不足の隠蔽

**メカニズム**:

1. **マイク入力の非決定論的な動作**:
   - `requestAnimationFrame`が呼ばれる（最大60fps、実際は環境依存）
   - `AudioManager.getTimeDomainData()`が`analyser.getFloatTimeDomainData()`を呼ぶ
   - AnalyserNodeの内部バッファは非同期で更新される（AudioContextのレンダリングスレッド）
   - **バッファ更新とデータ取得のタイミングがずれる可能性がある**

2. **バッファサイズ不足の発生**:
   - 周波数推定により`cycle_length`が計算される（例: 100Hzの声で480サンプル）
   - 4サイクル分の`waveform_length`が計算される（例: 1920サンプル）
   - **しかし`current_frame.len()`がこれより短い場合がある**（例: 1500サンプル）
   - `waveform_searcher.rs:94-97`の条件に該当
   - **類似度が0に設定され、ログなしで隠蔽される**

3. **1秒に10回の頻度**:
   - 60fpsで動作している場合、6フレームに1回 = 約16.67%の確率
   - これは以下のいずれかが原因：
     - AnalyserNodeのバッファ更新タイミングとのずれ
     - フレーム処理が16.67msを超える場合の遅延
     - ブラウザタブが非アクティブになった際のフレームレート低下

4. **WAVファイルで発生しない理由**:
   - AudioBufferSourceNodeは決定論的
   - バッファは完全にメモリに存在
   - タイミングのずれが発生しない

### 証拠の収集方法

以下のログを追加して検証：

1. **バッファサイズ不足の検出**:
```rust
// signal-processor-wasm/src/waveform_searcher.rs:94-97
if current_frame.len() < waveform_length {
    web_sys::console::log_1(&format!(
        "BUFFER TOO SHORT: current_frame.len()={}, waveform_length={}, cycle_length={}",
        current_frame.len(), waveform_length, cycle_length
    ).into());
    self.update_similarity_history(0.0);
    return None;
}
```

2. **周波数推定失敗の検出**:
```rust
// signal-processor-wasm/src/waveform_searcher.rs:86-89
if cycle_length <= 0.0 {
    web_sys::console::log_1(&format!(
        "INVALID CYCLE LENGTH: cycle_length={}", cycle_length
    ).into());
    self.update_similarity_history(0.0);
    return None;
}
```

3. **フレーム処理時間の測定**:
```typescript
// src/Oscilloscope.ts
private lastFrameTime = 0;
private frameProcessingTimes: number[] = [];

private render(): void {
    const startTime = performance.now();
    
    // ... 既存の処理 ...
    
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    this.frameProcessingTimes.push(processingTime);
    if (this.frameProcessingTimes.length > 100) this.frameProcessingTimes.shift();
    
    if (processingTime > 16.67) {
        console.warn(`Frame processing took ${processingTime.toFixed(2)}ms (>16.67ms)`);
    }
}
```

4. **ノイズゲート適用の検出**:
```rust
// signal-processor-wasm/src/gain_controller.rs:112-116
pub fn apply_noise_gate(&mut self, data: &mut [f32]) {
    if !self.is_signal_above_noise_gate(data) {
        web_sys::console::log_1(&"NOISE GATE: Signal below threshold, filling with 0.0".into());
        data.fill(0.0);
    }
}
```

## 推奨される修正（Fail Fast原則に基づく）

### フェーズ1: 診断ログの追加（最優先）

問題を隠蔽せず、明示的にログ出力する。

**変更ファイル**:
- `signal-processor-wasm/src/waveform_searcher.rs`
- `signal-processor-wasm/src/gain_controller.rs`
- `signal-processor-wasm/src/lib.rs`
- `src/Oscilloscope.ts`

**目的**:
1. 類似度が0になる正確な理由を特定
2. フレーム処理時間を測定
3. バッファ不足の頻度を測定

### フェーズ2: 問題の根本修正

診断結果に基づいて、以下のいずれかを実装：

#### オプション1: バッファサイズ不足時のfail fast（推奨）
```rust
// signal-processor-wasm/src/waveform_searcher.rs
if current_frame.len() < waveform_length {
    web_sys::console::error_1(&format!(
        "CRITICAL: Buffer too short. current={}, required={}. Cannot perform similarity search.",
        current_frame.len(), waveform_length
    ).into());
    // 類似度を0にせず、前回の値を維持するか、Noneを返す
    // ただし、similarity_historyには明示的なマーカー（例: -1.0）を記録
    self.update_similarity_history(-1.0); // -1.0 = "データ不足"を示す特別な値
    return None;
}
```

#### オプション2: データ連続性の検証
```typescript
// src/AudioManager.ts
getTimeDomainData(): Float32Array | null {
    const currentTime = this.audioContext!.currentTime;
    this.analyser!.getFloatTimeDomainData(this.dataArray);
    
    // 前回取得時刻との差分を検証
    if (this.lastDataFetchTime !== null) {
        const expectedInterval = this.fftSize / this.audioContext!.sampleRate;
        const actualInterval = currentTime - this.lastDataFetchTime;
        if (Math.abs(actualInterval - expectedInterval) > 0.001) {
            console.warn(`Data discontinuity: expected ${expectedInterval}s, actual ${actualInterval}s`);
        }
    }
    this.lastDataFetchTime = currentTime;
    
    return this.dataArray;
}
```

#### オプション3: AudioWorkletへの移行（大規模変更）

より正確なタイミング制御のため、AudioWorkletを使用する。
ただし、これは大きな実装変更を伴う。

### フェーズ3: UI改善

診断情報をユーザーに表示：
- フレームレートインジケーター
- バッファ健全性インジケーター
- 類似度が0になった理由の表示（「データ不足」「周波数推定失敗」など）

## 結論

**最も可能性が高い原因**: 
リアルタイムマイク入力時に、`requestAnimationFrame`のタイミングとAnalyserNodeのバッファ更新タイミングがずれ、`current_frame.len() < waveform_length`の条件に該当するケースが1秒に10回程度発生している。この失敗が`waveform_searcher.rs`で類似度0として記録されているが、**ログ出力がないため問題が隠蔽されている**。

**推奨アクション**:
1. **即座に実施**: 診断ログを追加して、類似度が0になる正確な理由を特定
2. **診断結果を元に**: バッファサイズ不足が原因であれば、fail fastを徹底し、問題を隠蔽しない実装に修正
3. **長期的**: データ連続性の検証とAudioWorkletへの移行を検討

## 追加の疑問点

### データ取得APIの動作理解の不足

`AnalyserNode.getFloatTimeDomainData()`の動作について、以下が不明確：

1. **バッファのスナップショット性質**:
   - 呼び出すたびに異なるデータが返されるのか？
   - 同じオーディオフレームを複数回読み取ることは可能か？

2. **AudioContextとの同期**:
   - AudioContextのレンダリングスレッドとの同期はどう保証されるのか？
   - `requestAnimationFrame`の60fpsとAudioContextの内部レンダリング（通常128サンプル単位）の関係は？

これらの不明点も、マイク入力時の非決定論的な動作の原因かもしれない。

## 参考資料

- Web Audio API仕様: https://www.w3.org/TR/webaudio/
- MDN - AnalyserNode: https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
- MDN - AudioWorklet: https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet
