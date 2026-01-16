# 類似度推移グラフが止まる問題の修正

## Issue #173
**タイトル**: 類似度推移グラフが止まってしまうことがある。原因を分析する。userは止まるべきではない認識なので認識の相違があるか分析する

## 問題の詳細

### 症状
類似度推移グラフ(Similarity Plot)が特定の状況で更新を停止し、グラフが止まってしまう。

### 原因の分析

#### 1. 類似度履歴の更新メカニズム
類似度履歴は`wasm-processor/src/waveform_searcher.rs`の`search_similar_waveform()`メソッド内で更新されます:

```rust
// line 118-121
self.similarity_history.push_back(best_similarity);
if self.similarity_history.len() > SIMILARITY_HISTORY_SIZE {
    self.similarity_history.pop_front();
}
```

#### 2. 問題の根本原因
`lib.rs`の`process_frame()`では、以下の条件でのみ`search_similar_waveform()`が呼ばれます:

```rust
// lib.rs line 197
if self.waveform_searcher.has_previous_waveform() && cycle_length > 0.0 {
    if let Some(search_result) = self.waveform_searcher.search_similar_waveform(&data, cycle_length) {
        // 類似度履歴が更新される
    }
}
```

**問題**: `cycle_length <= 0.0`の場合、`search_similar_waveform()`が呼ばれないため、類似度履歴が更新されません。

#### 3. cycle_length が 0 になるケース
`cycle_length`は周波数推定から計算されます:

```rust
// lib.rs line 186-190
let cycle_length = if estimated_frequency > 0.0 && sample_rate > 0.0 {
    sample_rate / estimated_frequency
} else {
    0.0
};
```

以下の場合に`cycle_length = 0.0`になります:
- 周波数推定が失敗(`estimated_frequency = 0.0`)
- ノイズゲートで信号がカットされる
- 信号が検出できない
- 周波数が不安定

### ユーザー期待と実装のギャップ
- **ユーザーの期待**: 類似度グラフは常に更新され続ける
- **実装の動作**: 周波数検出が成功した場合のみ更新される
- **結果**: 周波数検出が失敗するとグラフが止まる

## 修正内容

### 1. `record_no_search()`メソッドの追加
`wasm-processor/src/waveform_searcher.rs`に新しいメソッドを追加:

```rust
/// Record that similarity search was not performed for this frame
/// Updates history with 0.0 to indicate no similarity data is available
pub fn record_no_search(&mut self) {
    self.last_similarity = 0.0;
    self.similarity_history.push_back(0.0);
    if self.similarity_history.len() > SIMILARITY_HISTORY_SIZE {
        self.similarity_history.pop_front();
    }
}
```

### 2. lib.rsの修正
類似度検索が実行できない場合でも履歴を更新:

```rust
// wasm-processor/src/lib.rs line 208-214
} else {
    // Cannot perform similarity search (no previous waveform or invalid cycle length)
    // Record this in history to keep the graph updating
    if self.waveform_searcher.has_previous_waveform() {
        self.waveform_searcher.record_no_search();
    }
}
```

## 修正の効果

### Before (修正前)
```
周波数検出成功 → 類似度履歴更新 → グラフ更新
周波数検出失敗 → 類似度履歴更新なし → グラフ停止 ❌
```

### After (修正後)
```
周波数検出成功 → 類似度履歴更新(計算値) → グラフ更新
周波数検出失敗 → 類似度履歴更新(0.0) → グラフ更新 ✅
```

## ユーザーにとっての改善
1. **グラフが常に更新される**: 周波数検出の成否に関わらず、グラフは動き続ける
2. **視覚的フィードバック**: 類似度が0になることで「現在は比較できていない」ことを理解できる
3. **より直感的**: グラフが止まらないため、アプリケーションがフリーズしたと勘違いしない

## テスト結果
- 全197個のテストがパス(WASM初期化タイムアウトを除く)
- waveform-searcher.test.ts: すべてパス
- 既存の動作に影響なし

## まとめ
この修正により、類似度推移グラフは常に更新され続けるようになり、ユーザーの期待する動作に合致します。周波数検出が失敗した場合は類似度0として記録されるため、「比較できない状態」が視覚的に分かりやすくなります。
