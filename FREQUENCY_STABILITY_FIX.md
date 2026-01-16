# 周波数推定の安定性向上: 1倍と2倍の高速往復を防止

## 問題の概要

FFTによる周波数推定において、基本周波数（1倍）と第2高調波（2倍）のピークが近い強度を持つ場合、推定周波数が両者の間を高速に往復する問題が発生していました。

### 具体的な症状
- 基本周波数100Hzの信号に対して、推定値が100Hzと200Hzの間を激しく変動
- 既存のハーモニック検出と履歴ベースのスムージング機能が効果を発揮していない
- 表示が不安定で、ユーザー体験が低下

## 根本原因の特定

`wasm-processor/src/frequency_estimator.rs`の`estimate_frequency_fft`メソッド（lines 165-189）において、履歴ベースの安定化ロジックに以下の致命的なバグが存在：

### バグ1: 誤った条件分岐
```rust
// 旧コード (lines 177-178)
if candidate_diff < Self::FREQ_HISTORY_ACCEPTABLE_THRESHOLD && 
   strongest_diff > candidate_diff * Self::FREQ_HISTORY_PREFERENCE_FACTOR {
    return candidate;
}
```

この条件は「強いピークが履歴からより遠い場合に基本周波数を返す」という逆の動作をしていました。

**例**: 履歴=200Hz、候補=100Hz（基本）、強=200Hz（高調波）の場合
- candidate_diff = 0.5 (50%差)
- strongest_diff = 0.0 (完全一致)
- 条件: 0.5 < 0.5 AND 0.0 > 0.75 → FALSE
- 結果: strongest（200Hz）を返す... しかし次の瞬間
  
履歴=100Hzになると、逆の判定が起きて往復を繰り返す。

### バグ2: 不十分なパラメータ設定
- `FREQUENCY_HISTORY_SIZE: 7` → 短期的な変動に弱い
- `FREQUENCY_GROUPING_TOLERANCE: 0.05` (5%) → 1倍と2倍の区別に不十分
- `FREQ_HISTORY_ACCEPTABLE_THRESHOLD: 0.5` → 閾値が曖昧で判定が不安定

## 実装した解決策

### 1. 履歴ベースの安定化ロジックの完全書き直し

**新しいアプローチ**: 4つのケースに分けた明確な優先順位

```rust
// Case 1: 強いピークが履歴に非常に近い（15%以内）→ それを維持
if strongest_diff < Self::FREQ_HISTORY_CLOSE_THRESHOLD {
    return strongest_peak_freq;
}

// Case 2: 候補が履歴に非常に近い（15%以内）→ それを選択
if candidate_diff < Self::FREQ_HISTORY_CLOSE_THRESHOLD {
    return candidate;
}

// Case 3: 両方が履歴から遠い → 候補が2倍以上近い場合のみ切り替え
if strongest_diff > Self::FREQ_HISTORY_STRONGLY_PREFER_THRESHOLD &&
   candidate_diff < strongest_diff / Self::FREQ_HISTORY_PREFERENCE_RATIO {
    return candidate;
}

// Case 4: デフォルト → 強いピークを維持（現在の周波数を保つ）
return strongest_peak_freq;
```

**設計思想**: 
- **安定性を最優先**: 頻繁な切り替えを避け、現在の周波数を維持
- **明確な閾値**: 「近い」の定義を15%に統一
- **保守的な切り替え**: 新しい周波数に切り替えるには2倍の差が必要

### 2. パラメータの最適化

| パラメータ | 旧値 | 新値 | 理由 |
|-----------|------|------|------|
| `FREQUENCY_HISTORY_SIZE` | 7 | 10 | より長期的な安定性を確保 |
| `FREQUENCY_GROUPING_TOLERANCE` | 0.05 (5%) | 0.08 (8%) | 1倍と2倍の微妙な変動を吸収 |
| `FREQ_HISTORY_CLOSE_THRESHOLD` | 0.2 (20%) | 0.15 (15%) | より厳密な「近い」の定義 |
| `FREQ_HISTORY_PREFERENCE_RATIO` | 1.5 | 2.0 | 切り替えにより大きな差を要求 |
| `HARMONIC_RELATIVE_THRESHOLD` | 0.3 (30%) | 0.4 (40%) | より確実な基本周波数検出 |

### 3. 包括的なテストの追加

7つの単体テストを追加し、安定性ロジックの正確性を検証：

1. **test_frequency_stability_keeps_history_when_close**
   - 履歴に近い周波数を正しく維持することを確認

2. **test_frequency_stability_resists_switching_to_harmonic**
   - 基本周波数で安定している場合、高調波への切り替えを抑制

3. **test_frequency_stability_switches_when_justified**
   - 正当な理由がある場合のみ周波数を切り替え

4. **test_harmonic_detection_requires_sufficient_harmonics**
   - 弱い高調波や不十分な高調波では基本周波数を検出しない

5. **test_harmonic_detection_with_strong_series**
   - 強い高調波系列を正しく検出

6. **test_frequency_smoothing_with_mode_filter**
   - モードフィルタが外れ値を除外し、多数派の周波数を返す

7. **test_history_size_limit**
   - 履歴サイズが正しく制限されることを確認

すべてのテストが合格: **7 passed; 0 failed**

## 期待される効果

### 1. 安定した周波数推定
- 1倍と2倍のピークが近い場合でも、安定した推定値を維持
- 高速な往復が発生しない

### 2. より正確な基本周波数検出
- ハーモニック検出の閾値を40%に引き上げ、誤検出を削減
- より確実に基本周波数（1倍）を検出

### 3. 長期的な安定性
- 履歴サイズを10に増加し、一時的なノイズに強い
- スムージングの許容範囲を8%に拡大し、微妙な変動を吸収

## 実装ファイル

- **主要な変更**: `wasm-processor/src/frequency_estimator.rs`
  - Lines 13-27: パラメータ定数の更新
  - Lines 165-199: 履歴ベースの安定化ロジックの完全書き直し
  - Lines 594-738: 7つの新しい単体テスト

## 検証方法

### ローカル環境
```bash
# Rustテストの実行
cd wasm-processor
cargo test

# WASMビルド
cd ..
npm run build:wasm

# アプリケーション全体のビルド
npm run build

# 動作確認
npm run dev
```

### 動作確認のポイント
1. 基本周波数（例: 100Hz）の音を入力
2. FFT表示を有効化
3. 推定周波数が安定して1倍（100Hz）を表示することを確認
4. 2倍（200Hz）との高速な往復が発生しないことを確認

## 今後の改善案

1. **適応的な閾値**: 信号のSNR比に応じて閾値を動的に調整
2. **HPS（Harmonic Product Spectrum）の導入**: より堅牢な基本周波数検出
3. **機械学習ベースの周波数推定**: より高度な分類アルゴリズムの検討

## 参考資料

- Issue: [#167 まだ推定周波数が1倍と2倍との間を高速に往復することがある](https://github.com/cat2151/cat-oscilloscope/issues/167)
- Related: [#64 自己相関判定に使う周期の選択機能](https://github.com/cat2151/cat-oscilloscope/issues/64)
