# 類似度推移グラフが止まる問題の修正

## Issue #173
**タイトル**: 類似度推移グラフが止まってしまうことがある。原因を分析する。userは止まるべきではない認識なので認識の相違があるか分析する

## 問題の詳細

### 症状
類似度推移グラフ(Similarity Plot)が特定の状況で更新を停止し、グラフが止まってしまう。

### 原因の分析

#### 1. 類似度履歴の更新メカニズム
類似度履歴は`wasm-processor/src/waveform_searcher.rs`の`search_similar_waveform()`メソッド内で更新されます。

#### 2. 問題の根本原因（2つの問題を発見）

**問題A: 関数が呼ばれない**
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

**問題B: 早期returnで履歴が更新されない**
`search_similar_waveform()`には複数の早期returnがあり、これらが実行されると履歴更新コード（line 118-121）に到達しません:

```rust
// waveform_searcher.rs
pub fn search_similar_waveform(&mut self, ...) -> Option<SearchResult> {
    let prev_waveform = self.previous_waveform.as_ref()?; // 早期return 1
    
    if cycle_length <= 0.0 {
        return None; // 早期return 2
    }
    
    if current_frame.len() < waveform_length {
        return None; // 早期return 3
    }
    
    if prev_waveform.len() != waveform_length {
        return None; // 早期return 4
    }
    
    // ... 計算処理 ...
    
    // ここで履歴を更新（早期returnではここに到達しない）
    self.similarity_history.push_back(best_similarity);
}
```

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
- **実装の動作**: 周波数検出が成功し、かつバリデーションを通過した場合のみ更新される
- **結果**: 周波数検出失敗またはバリデーション失敗でグラフが止まる

## 修正内容

### 1. `update_similarity_history()`プライベートヘルパーメソッドの追加
`wasm-processor/src/waveform_searcher.rs`に類似度履歴更新ロジックを抽出:

```rust
/// Update similarity history with a new value
fn update_similarity_history(&mut self, similarity: f32) {
    self.last_similarity = similarity;
    self.similarity_history.push_back(similarity);
    if self.similarity_history.len() > SIMILARITY_HISTORY_SIZE {
        self.similarity_history.pop_front();
    }
}
```

**効果**: コード重複を削減（DRY原則）

### 2. `search_similar_waveform()`の早期returnで履歴を更新
各バリデーション失敗時にも履歴を更新:

```rust
pub fn search_similar_waveform(&mut self, ...) -> Option<SearchResult> {
    let prev_waveform = self.previous_waveform.as_ref()?;
    
    if cycle_length <= 0.0 {
        self.update_similarity_history(0.0); // 追加
        return None;
    }
    
    if current_frame.len() < waveform_length {
        self.update_similarity_history(0.0); // 追加
        return None;
    }
    
    if prev_waveform.len() != waveform_length {
        self.update_similarity_history(0.0); // 追加
        return None;
    }
    
    // ... 計算処理 ...
    
    // 成功時も同じヘルパーを使用
    self.update_similarity_history(best_similarity);
}
```

**効果**: バリデーション失敗時でも履歴が更新される

### 3. `record_no_search()`の実装
ヘルパーメソッドを使用してシンプルに:

```rust
/// Record that similarity search was not performed for this frame
/// Updates history with 0.0 to indicate no similarity data is available
pub fn record_no_search(&mut self) {
    self.update_similarity_history(0.0);
}
```

### 4. lib.rsの修正
類似度検索が実行できない場合でも履歴を更新:

```rust
if self.waveform_searcher.has_previous_waveform() && cycle_length > 0.0 {
    if let Some(search_result) = self.waveform_searcher.search_similar_waveform(&data, cycle_length) {
        // 類似度検索成功 - 履歴は search_similar_waveform 内で更新済み
        used_similarity_search = true;
    }
    // 履歴は search_similar_waveform 内で常に更新される（バリデーション失敗時も）
} else {
    // 類似度検索が実行できない場合でも履歴を更新
    if self.waveform_searcher.has_previous_waveform() {
        self.waveform_searcher.record_no_search();
    }
}
```

## 修正の効果

### Before (修正前)
```
周波数検出成功 → 類似度履歴更新 → グラフ更新 ✓
周波数検出失敗 → 類似度履歴更新なし → グラフ停止 ❌
バリデーション失敗 → 類似度履歴更新なし → グラフ停止 ❌
```

### After (修正後)
```
周波数検出成功 → 類似度履歴更新(計算値) → グラフ更新 ✅
周波数検出失敗 → 類似度履歴更新(0.0) → グラフ更新 ✅
バリデーション失敗 → 類似度履歴更新(0.0) → グラフ更新 ✅
```

## コード品質の改善
1. **DRY原則の適用**: 類似度履歴更新ロジックを`update_similarity_history()`に抽出
2. **完全性の確保**: すべてのコードパスで類似度履歴が確実に更新される
3. **コメントの改善**: 実装意図を明確化

## ユーザーにとっての改善
1. **グラフが常に更新される**: 周波数検出やバリデーションの成否に関わらず、グラフは動き続ける
2. **視覚的フィードバック**: 類似度が0になることで「現在は比較できていない」ことを理解できる
3. **より直感的**: グラフが止まらないため、アプリケーションがフリーズしたと勘違いしない

## テスト結果
- 全197個のテストがパス(WASM初期化タイムアウトを除く)
- waveform-searcher.test.ts: すべてパス
- 既存の動作に影響なし

## コードレビュー結果
- 初回レビュー: 2つの改善提案
  1. コードの重複削減（DRY原則）
  2. 早期returnでの履歴更新漏れの修正
- 2回目レビュー: 問題なし（すべて対応済み）

## まとめ
この修正により、類似度推移グラフは常に更新され続けるようになり、ユーザーの期待する動作に合致します。周波数検出やバリデーションが失敗した場合は類似度0として記録されるため、「比較できない状態」が視覚的に分かりやすくなります。また、コードの品質も向上し、保守性が改善されました。

