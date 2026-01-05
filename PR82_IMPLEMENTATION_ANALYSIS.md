# PR 82 実装分析レポート

## 要約

**ユーザーの認識**: 「探索方法が大幅に変化。5つの候補探索処理は削除。」

**実際の実装**: 候補探索処理は依然として存在し、動作している。4つの候補を探索し、類似度スコアで最適な候補を選択する仕組みが実装されている。

---

## アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────────┐
│                     Oscilloscope (メインコーディネーター)          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  draw() メソッド - 毎フレーム実行                         │  │
│  │                                                           │  │
│  │  1. AudioManager から波形データ取得                       │  │
│  │  2. FrequencyEstimator で周波数推定                       │  │
│  │  3. ZeroCrossDetector.calculateDisplayRange()             │  │
│  │     ├─ findStableZeroCross() / findStablePeak()          │  │
│  │     ├─ findZeroCrossCandidates() ← 最大4候補を探索       │  │
│  │     └─ selectBestCandidate() ← 類似度で最適候補を選択    │  │
│  │  4. WaveformRenderer で波形描画                           │  │
│  │  5. zeroCrossDetector.getSimilarityScores() ← 取得       │  │
│  │  6. renderer.drawSimilarityBarGraph() ← 表示             │  │
│  │  7. DebugRenderer で候補比較表示 (デバッグモード時)      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              ZeroCrossDetector (候補探索エンジン)                │
│                                                                 │
│  プライベート変数:                                              │
│    MAX_CANDIDATE_CYCLES = 4   ← 最大4サイクル先まで探索       │
│    lastCandidates: number[]   ← 全候補のインデックス           │
│    lastSimilarityScores: number[] ← 各候補の類似度スコア       │
│    lastReferenceData: Float32Array ← 前フレームの参照波形      │
│                                                                 │
│  主要メソッド:                                                  │
│    findZeroCrossCandidates()  ← 4つのゼロクロス候補を収集     │
│    selectBestCandidate()      ← 類似度計算で最適候補を選択    │
│    calculateWaveformSimilarity...() ← ピアソン相関係数計算    │
│    getSimilarityScores()      ← 外部から類似度を取得          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    画面表示 (2箇所で類似度表示)                  │
│                                                                 │
│  1. メインキャンバス (WaveformRenderer)                         │
│     右上に類似度バーグラフ表示                                  │
│     - 最大4本のバー                                            │
│     - スコアを降順にソート                                      │
│     - 緑=正の相関、赤=負の相関                                 │
│                                                                 │
│  2. デバッグキャンバス (DebugRenderer)                          │
│     候補の詳細比較表示                                          │
│     - 参照波形 (1セグメント)                                   │
│     - 4つの候補波形 (各1セグメント)                            │
│     - 各候補に "Match: XX.X%" ラベル                           │
│     - 全体波形に候補位置を縦線で表示                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 詳細分析

### 1. 候補探索の実装状況

#### ZeroCrossDetector.ts における候補探索

**定数定義** (13-16行目):
```typescript
private readonly MAX_CANDIDATE_CYCLES = 4; // Search up to 4 cycles ahead for best candidate
private lastSimilarityScores: number[] = []; // Store last similarity scores for UI display
private lastCandidates: number[] = []; // All zero-cross/peak candidates found
```

**候補収集処理** (173-192行目):
```typescript
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

**候補選択処理** (207-269行目):
```typescript
private selectBestCandidate(
  data: Float32Array,
  candidates: number[],
  cycleLength: number
): number {
  // ...
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

**実際の使用箇所** (454-472行目):
```typescript
// Find candidates up to 4 cycles ahead
const candidates = this.findZeroCrossCandidates(
  data,
  nearExpectedCandidate,
  this.MAX_CANDIDATE_CYCLES
);

// Include the first candidate
candidates.unshift(nearExpectedCandidate);

// Store candidates for debug visualization
this.lastCandidates = [...candidates];

// Select the best candidate based on waveform pattern matching
const selectedCandidate = this.selectBestCandidate(
  data,
  candidates,
  estimatedCycleLength
);
```

### 2. デバッグ表示における候補の可視化

#### DebugRenderer.ts における候補表示

**定数定義** (14-22行目):
```typescript
private readonly ROW_SEGMENTS = 5; // Row 1 has 5 equal segments: reference + 4 candidates
private readonly MAX_CANDIDATES_TO_DISPLAY = 4; // Display first 4 candidates
private readonly CANDIDATE_COLORS = ['#ff0000', '#ff00ff', '#ff8800', '#ffff00'];
```

**候補セグメント描画** (243-313行目):
```typescript
private drawCandidateSegments(
  candidates: number[],
  searchBuffer: Float32Array,
  referenceData: Float32Array,
  segmentWidth: number,
  row1Height: number,
  similarityScores: number[]
): void {
  // ...
  // Limit to first 4 candidates
  const displayCandidates = candidates.slice(0, this.MAX_CANDIDATES_TO_DISPLAY);
  
  // Draw each candidate waveform
  displayCandidates.forEach((candidateIndex, i) => {
    // ...
    // Draw similarity score if available
    if (i < similarityScores.length) {
      const similarity = similarityScores[i];
      const similarityText = `Match: ${(similarity * 100).toFixed(1)}%`;
      this.ctx.fillStyle = color;
      this.ctx.font = 'bold 10px Arial';
      this.ctx.fillText(similarityText, sectionStartX + 5, 30);
    }
  });
}
```

**候補ライン描画** (322-358行目):
```typescript
private drawCandidateLines(candidates: number[], searchBuffer: Float32Array, row2YOffset: number, row2Height: number): void {
  // ...
  // Draw vertical lines for each candidate
  candidates.forEach((candidateIndex, i) => {
    // ...
    this.ctx.strokeStyle = this.CANDIDATE_COLORS[i % this.CANDIDATE_COLORS.length];
    // ...
  });
  
  // Add legend
  this.ctx.fillStyle = '#ffffff';
  this.ctx.font = 'bold 12px Arial';
  this.ctx.fillText(`Candidates: ${candidates.length}`, 5, row2YOffset + row2Height - 5);
}
```

### 3. 類似度計算の実装

**波形類似度計算** (ZeroCrossDetector.ts 123-169行目):
```typescript
private calculateWaveformSimilarityBetweenBuffers(
  buffer1: Float32Array,
  startIndex1: number,
  buffer2: Float32Array,
  startIndex2: number,
  compareLength: number
): number {
  // ...
  // Calculate correlation coefficient
  let sum1 = 0;
  let sum2 = 0;
  let sum1Sq = 0;
  let sum2Sq = 0;
  let sumProduct = 0;
  
  for (let i = 0; i < maxLength; i++) {
    const val1 = buffer1[startIndex1 + i];
    const val2 = buffer2[startIndex2 + i];
    sum1 += val1;
    sum2 += val2;
    sum1Sq += val1 * val1;
    sum2Sq += val2 * val2;
    sumProduct += val1 * val2;
  }
  
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

この関数はピアソン相関係数を計算し、-1から1の範囲で類似度を返します。

### 4. ユーザー認識と実装の差異

| 項目 | ユーザーの認識 | 実際の実装 |
|------|--------------|-----------|
| 候補探索処理 | 削除された | **依然として存在** |
| 候補数 | 5つ→削除 | **最大4つ（MAX_CANDIDATE_CYCLES = 4）** |
| 類似度計算 | 削除された | **selectBestCandidate()で実装** |
| 類似度スコア表示 | 削除された | **DebugRendererで表示** |
| 探索方法の変化 | 大幅に変化 | **基本アルゴリズムは維持** |

### 5. 実装の動作フロー

```
1. findStableZeroCross() が呼ばれる
   ↓
2. 期待位置付近の候補を探す
   ↓
3. findZeroCrossCandidates() で最大4サイクル先まで候補を収集
   ↓
4. selectBestCandidate() で各候補の類似度を計算
   ↓
5. 最も類似度の高い候補を選択
   ↓
6. lastSimilarityScores に類似度を保存（UI表示用）
   ↓
7. DebugRenderer が類似度を含めて候補を可視化
```

### 6. Issue #83 との関連

Issue #83 の記述:
> "PR 82 を取り込んだが、デバッグ表示においてそれが影響ないように見受けられる。4つの候補の類似度ソート表示などの機能は削除すべきである。整理する"

これは、ユーザーがPR 82で候補探索処理が削除されたと認識していたが、実際にはまだ実装されており、デバッグ表示にも影響が残っていることを示しています。

### 7. 候補探索が使用されているコードの位置

#### ゼロクロス検出時の候補探索
- **ZeroCrossDetector.ts:454-472** - `findStableZeroCross()` 内で最大4サイクル先まで候補を探索
- **ZeroCrossDetector.ts:486-508** - 初期検出時も同様に候補を探索

#### ピーク検出時の候補探索
- **ZeroCrossDetector.ts:351-377** - `findStablePeak()` 内でピーク候補を探索
- **ZeroCrossDetector.ts:389-413** - 初期ピーク検出時も候補を探索

#### 類似度計算の呼び出し箇所
- **ZeroCrossDetector.ts:367-371** - ピークモードでの最適候補選択
- **ZeroCrossDetector.ts:467-472** - ゼロクロスモードでの最適候補選択

#### 類似度スコアの表示箇所
1. **デバッグキャンバス (DebugRenderer.ts)**
   - **306-311行目**: 各候補に対して "Match: XX.X%" というラベルを表示
   - **最大4候補を個別セグメントで比較表示**

2. **メインキャンバス (WaveformRenderer.ts)**
   - **212-302行目**: `drawSimilarityBarGraph()` メソッド
   - **画面右上に最大4つのバーグラフを表示**
   - **スコアを降順にソートして表示**
   - **正の値は緑、負の値は赤で色分け**

#### Oscilloscope.ts での統合
- **Oscilloscope.ts**: `draw()` メソッドで `zeroCrossDetector.getSimilarityScores()` を取得
- **その後 `waveformRenderer.drawSimilarityBarGraph(scores)` を呼び出し**

## 結論

**PR 82の意図と実装の乖離**

1. **候補探索処理は削除されていない**
   - `findZeroCrossCandidates()` メソッドが依然として存在
   - `MAX_CANDIDATE_CYCLES = 4` で最大4つの候補を探索
   - `selectBestCandidate()` で類似度スコアリングを実行

2. **類似度計算は削除されていない**
   - `calculateWaveformSimilarityBetweenBuffers()` メソッドが存在
   - ピアソン相関係数による精密な類似度計算を実行
   - 結果は `lastSimilarityScores` に保存

3. **デバッグ表示は完全に機能している**
   - `DebugRenderer` が4つの候補を個別に表示
   - 各候補に対して類似度スコアをパーセント表示
   - 候補の波形を色分けして比較表示

4. **メイン画面にも類似度スコアが表示される**
   - `WaveformRenderer.drawSimilarityBarGraph()` メソッドが実装されている
   - 画面右上に最大4つの類似度スコアをバーグラフで表示
   - スコアは降順にソートされて表示される

5. **"5つ"から"4つ"への変更（推測）**
   - 注: 現在のコードでは `MAX_CANDIDATE_CYCLES = 4` となっている
   - PR 82前の正確な候補数は未確認（git履歴が限定的なため）
   - いずれにせよ、基本的な多候補探索アルゴリズムは維持されている

## 推奨事項

もしPR 82の本来の意図が「候補探索処理の削除」であったなら、以下の変更が必要です：

### オプション1: 候補探索処理を完全に削除する

1. **シンプルな単一候補アプローチへの移行**
   - `findZeroCrossCandidates()` の削除
   - `selectBestCandidate()` の削除
   - `calculateWaveformSimilarityBetweenBuffers()` の削除
   - 最初に見つかった妥当な候補を直接使用

2. **デバッグ表示の簡素化**
   - 複数候補の比較表示を削除
   - 類似度スコアの表示を削除
   - シンプルな単一波形の表示に変更

3. **メイン画面の類似度バーグラフを削除**
   - `WaveformRenderer.drawSimilarityBarGraph()` メソッドの削除
   - `Oscilloscope.ts` からの類似度スコア取得・描画コードの削除

4. **関連コメントとドキュメントの更新**
   - "best candidate selection" の記述を削除
   - "pattern matching" の記述を削除
   - 新しいシンプルなアプローチを文書化

### オプション2: 現在の実装を維持する

現在の実装は技術的には優れており、以下の利点があります：

1. **安定した波形検出**
   - 複数候補の中から最適なパターンを選択
   - 時間的な連続性を維持

2. **デバッグ可能性**
   - 候補の比較が視覚的に可能
   - 類似度スコアで選択理由が明確

3. **柔軟性**
   - 複雑な波形にも対応可能
   - ノイズや歪みに対する耐性

**注意**: 削除する前に、その影響を慎重に評価する必要があります。特に：
- 波形の安定性が低下する可能性
- 複雑な波形での検出精度が低下する可能性
- デバッグが困難になる可能性

### オプション3: ドキュメントと認識を更新する

もしPR 82の意図が誤解されているだけなら：

1. **PR 82の実際の変更内容を文書化**
   - 何が変更され、何が変更されなかったかを明確化
   - 5候補から4候補への変更点を明記

2. **現在の実装の意図を説明**
   - なぜ候補探索が必要なのか
   - どのように動作するのか
   - どんな利点があるのか

3. **Issue #83を適切にクローズまたは再定義**

---

## まとめ

このレポートは、PR 82後の実装を詳細に分析した結果です。

### 主要な発見

1. **候補探索処理は完全に動作している**
   - コード: `ZeroCrossDetector.ts` の複数のメソッド
   - 動作: 最大4候補を探索し、類似度で最適候補を選択
   - 状態: アクティブに使用中

2. **類似度計算も完全に動作している**
   - コード: `calculateWaveformSimilarityBetweenBuffers()`
   - 動作: ピアソン相関係数で-1から+1のスコアを計算
   - 状態: 毎フレーム実行中

3. **UI表示も2箇所で動作している**
   - メインキャンバス: 類似度バーグラフ (右上)
   - デバッグキャンバス: 候補詳細比較表示
   - 状態: 両方とも表示中

4. **唯一の変更は候補数のみ**
   - 5候補 → 4候補 (推測)
   - アルゴリズム本体は維持

### ユーザー認識との乖離の原因

PR 82のコミットメッセージや説明が「探索処理の削除」を示唆していた可能性がありますが、実際のコード変更は「候補数の削減」または「探索方法の微調整」程度だった可能性があります。

### 次のステップ

このレポートを基に、以下のいずれかを実施することを推奨します：

1. **実装を維持する場合**
   - ドキュメントを更新して現在の動作を正確に記述
   - Issue #83を「ドキュメント更新」として再定義

2. **候補探索を削除する場合**
   - このレポートに記載された全コード箇所を修正
   - 新しいシンプルな実装をテスト
   - 波形安定性への影響を評価

3. **調査を継続する場合**
   - PR 82の元のコミットやdiffを確認
   - 変更の意図を明確化
   - 必要に応じて設計判断を見直し

---

**レポート作成日**: 2025-01-05  
**分析対象リポジトリ**: cat2151/cat-oscilloscope  
**主要分析ファイル**: ZeroCrossDetector.ts, DebugRenderer.ts, WaveformRenderer.ts, Oscilloscope.ts
