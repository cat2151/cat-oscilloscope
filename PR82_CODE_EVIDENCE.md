# PR 82 実装の証拠コード

このドキュメントは、候補探索処理が依然として実装されている証拠となるコードスニペットを示します。

## 1. 候補数の定義

**ファイル**: `src/ZeroCrossDetector.ts` 13行目

```typescript
private readonly MAX_CANDIDATE_CYCLES = 4; // Search up to 4 cycles ahead for best candidate
```

**証拠**: 最大4つの候補を探索する設定が存在

---

## 2. 候補探索メソッドの実装

**ファイル**: `src/ZeroCrossDetector.ts` 173-192行目

```typescript
/**
 * Find all zero-cross candidates after startIndex, up to maxCycles ahead
 */
private findZeroCrossCandidates(
  data: Float32Array,
  startIndex: number,
  maxCycles: number
): number[] {
  const candidates: number[] = [];
  let currentIndex = startIndex;
  
  for (let cycle = 0; cycle < maxCycles; cycle++) {
    const nextZeroCross = this.findNextZeroCross(data, currentIndex);
    if (nextZeroCross === -1) {
      break;
    }
    candidates.push(nextZeroCross);
    currentIndex = nextZeroCross;
  }
  
  return candidates;
}
```

**証拠**: 複数候補を収集するメソッドが実装されている

---

## 3. 類似度計算メソッドの実装

**ファイル**: `src/ZeroCrossDetector.ts` 123-169行目

```typescript
/**
 * Calculate waveform similarity score between two different buffers
 * Returns a correlation coefficient between -1 and 1 (higher is more similar)
 */
private calculateWaveformSimilarityBetweenBuffers(
  buffer1: Float32Array,
  startIndex1: number,
  buffer2: Float32Array,
  startIndex2: number,
  compareLength: number
): number {
  // ... 実装の詳細は省略 ...
  
  // Pearson correlation coefficient
  const numerator = maxLength * sumProduct - sum1 * sum2;
  const denominator = Math.sqrt(
    (maxLength * sum1Sq - sum1 * sum1) * (maxLength * sum2Sq - sum2 * sum2)
  );
  
  if (denominator === 0) {
    return 0;
  }
  
  return numerator / denominator;
}
```

**証拠**: ピアソン相関係数による類似度計算が実装されている

---

## 4. 最適候補選択メソッドの実装

**ファイル**: `src/ZeroCrossDetector.ts` 207-269行目

```typescript
/**
 * Select the best zero-cross candidate based on waveform pattern matching
 * Compares each candidate segment in the current buffer against the reference waveform from the previous frame
 */
private selectBestCandidate(
  data: Float32Array,
  candidates: number[],
  cycleLength: number
): number {
  // ... 検証処理 ...
  
  // Compare each candidate segment in current buffer with the reference waveform
  let bestCandidate = candidates[0];
  let bestScore = -Infinity;
  
  const compareLength = Math.floor(cycleLength * 1.5); // Compare 1.5 cycles
  
  // For debugging: store all similarity scores
  const similarityScores: number[] = [];
  
  for (let i = 0; i < candidates.length; i++) {
    const currentCandidate = candidates[i];
    
    // Calculate similarity between the candidate segment in current buffer and reference waveform
    const similarity = this.calculateWaveformSimilarityBetweenBuffers(
      this.lastReferenceData,
      0,
      data,
      currentCandidate,
      compareLength
    );
    
    similarityScores.push(similarity);
    
    if (similarity > bestScore) {
      bestScore = similarity;
      bestCandidate = currentCandidate;
    }
  }
  
  // Store similarity scores for UI display
  this.lastSimilarityScores = similarityScores;
  
  return bestCandidate;
}
```

**証拠**: 
- 各候補の類似度を計算
- 最高スコアの候補を選択
- スコアを保存（UI表示用）

---

## 5. 候補探索の実際の使用箇所

**ファイル**: `src/ZeroCrossDetector.ts` 454-472行目

```typescript
// If we found a zero-crossing near expected position
if (nearExpectedCandidate !== -1) {
  // Find candidates up to 4 cycles ahead
  const candidates = this.findZeroCrossCandidates(
    data,
    nearExpectedCandidate,
    this.MAX_CANDIDATE_CYCLES  // ← 4候補を探索
  );
  
  // Include the first candidate
  candidates.unshift(nearExpectedCandidate);
  
  // Store candidates for debug visualization
  this.lastCandidates = [...candidates];
  
  // Select the best candidate based on waveform pattern matching
  const selectedCandidate = this.selectBestCandidate(  // ← 類似度で選択
    data,
    candidates,
    estimatedCycleLength
  );
  
  if (selectedCandidate !== -1) {
    this.previousZeroCrossIndex = selectedCandidate;
    return selectedCandidate;
  }
}
```

**証拠**: 
- `findZeroCrossCandidates()` が実際に呼ばれている
- `selectBestCandidate()` が実際に呼ばれている
- 毎フレーム実行される `findStableZeroCross()` 内で使用

---

## 6. メイン画面での類似度表示

**ファイル**: `src/Oscilloscope.ts` 160-162行目

```typescript
// Draw similarity scores bar graph
const similarityScores = this.zeroCrossDetector.getSimilarityScores();
this.renderer.drawSimilarityBarGraph(similarityScores);
```

**証拠**: 類似度スコアを取得してメイン画面に描画

---

## 7. 類似度バーグラフ描画メソッド

**ファイル**: `src/WaveformRenderer.ts` 212-302行目

```typescript
/**
 * Draw similarity scores as horizontal bar graph
 * Display area: 50px height, with ruler markers at -1, 0, +1
 * Each bar: 10px height, sorted by similarity score (descending)
 */
drawSimilarityBarGraph(similarityScores: number[]): void {
  if (similarityScores.length === 0) {
    return;
  }

  // Bar graph dimensions (top-right corner)
  const graphHeight = 50;
  const graphWidth = 200;
  const graphX = this.canvas.width - graphWidth - 10;
  const graphY = 10;
  const barHeight = 10;
  const maxBars = 4;  // ← 最大4本のバー

  // Sort scores in descending order
  const sortedScores = [...similarityScores].sort((a, b) => b - a);
  const displayScores = sortedScores.slice(0, maxBars);  // ← 上位4つを表示

  // ... 描画処理 ...
  
  // Draw bars
  displayScores.forEach((score, index) => {
    const barY = graphY + index * barHeight;
    // ... バー描画 ...
    
    // Draw score label
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 9px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(score.toFixed(3), graphX + 5, barY + barHeight - 2);
  });
  
  this.ctx.restore();
}
```

**証拠**: 
- 最大4つの類似度スコアをバーグラフで表示
- スコアを降順にソート
- 画面右上に描画

---

## 8. デバッグ画面での候補表示

**ファイル**: `src/DebugRenderer.ts` 16-17行目

```typescript
private readonly ROW_SEGMENTS = 5; // Row 1 has 5 equal segments: reference + 4 candidates
private readonly MAX_CANDIDATES_TO_DISPLAY = 4; // Display first 4 candidates
```

**証拠**: デバッグ画面でも4候補を表示する設定

---

**ファイル**: `src/DebugRenderer.ts` 251-313行目

```typescript
private drawCandidateSegments(
  candidates: number[],
  searchBuffer: Float32Array,
  referenceData: Float32Array,
  segmentWidth: number,
  row1Height: number,
  similarityScores: number[]
): void {
  if (candidates.length === 0 || searchBuffer.length === 0) {
    return;
  }

  // Limit to first 4 candidates
  const displayCandidates = candidates.slice(0, this.MAX_CANDIDATES_TO_DISPLAY);

  // ... 候補ごとに波形を描画 ...
  
  displayCandidates.forEach((candidateIndex, i) => {
    // ... 波形描画 ...
    
    // Draw similarity score if available
    if (i < similarityScores.length) {
      const similarity = similarityScores[i];
      const similarityText = `Match: ${(similarity * 100).toFixed(1)}%`;  // ← スコア表示
      this.ctx.fillStyle = color;
      this.ctx.font = 'bold 10px Arial';
      this.ctx.fillText(similarityText, sectionStartX + 5, 30);
    }
  });
}
```

**証拠**: 
- 最大4候補を個別セグメントで表示
- 各候補に "Match: XX.X%" ラベルを表示
- 類似度スコアを視覚化

---

## 9. デバッグ画面のレンダリング呼び出し

**ファイル**: `src/Oscilloscope.ts` 165-170行目

```typescript
// Draw debug visualization (only when enabled)
if (this.debugRenderer.getDebugDisplayEnabled()) {
  const searchBuffer = this.zeroCrossDetector.getLastSearchBuffer();
  const candidates = this.zeroCrossDetector.getLastCandidates();
  const referenceInfo = this.zeroCrossDetector.getLastReferenceData();
  this.debugRenderer.renderDebug(searchBuffer, candidates, referenceInfo.data, similarityScores);
}
```

**証拠**: デバッグモード時に候補と類似度スコアを渡して描画

---

## 結論

上記のコードスニペットは、以下を明確に証明しています：

1. ✅ **候補探索処理が実装されている**
   - `findZeroCrossCandidates()` メソッドが存在し、使用されている
   - 最大4候補を探索する設定（`MAX_CANDIDATE_CYCLES = 4`）

2. ✅ **類似度計算が実装されている**
   - `calculateWaveformSimilarityBetweenBuffers()` でピアソン相関係数を計算
   - `selectBestCandidate()` で各候補を評価

3. ✅ **類似度スコアが保存されている**
   - `lastSimilarityScores` 配列に保存
   - `getSimilarityScores()` で外部から取得可能

4. ✅ **UI表示が2箇所で実装されている**
   - メイン画面: `drawSimilarityBarGraph()` でバーグラフ表示
   - デバッグ画面: `drawCandidateSegments()` で詳細比較表示

5. ✅ **毎フレーム動作している**
   - `Oscilloscope.draw()` から呼び出される
   - `findStableZeroCross()` 内で実行される

これらの証拠から、**PR 82後も候補探索処理は完全に動作している**ことが確認できます。
