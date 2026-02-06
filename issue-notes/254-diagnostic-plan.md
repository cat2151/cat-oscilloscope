# Issue #254 診断計画

## 目的
Offset %オーバーレイに表示されるスパイク（例：1フレームで40%の変化）の根本原因を特定する。

**仕様：** 4周期座標系において、位相マーカーのオフセットは1フレームあたり1%以内の変化に収まるべき。

## 重要：座標系の理解

このissueで重要なのは**4周期座標系**におけるオフセット変化です：

### 4周期座標系（問題の焦点）
- **定義**: 表示される4周期分の波形データ内での相対位置（0-100%）
- **仕様**: オフセットは1フレームで1%以内に収まるべき
- **測定値**: `startOffsetPercent`, `endOffsetPercent`, `offsetChange`
- **NG判定**: `offsetChange > 1%` の場合は仕様違反

### 全フレーム座標系（診断には不要）
- **定義**: サンプルバッファ全体における絶対位置
- **特性**: フレーム間で大きく移動するのは当然（通常の動作）
- **注意**: この座標系での変化は今回の調査対象外

## 診断ログの読み方

仕様違反検出時（4周期座標系でオフセット変化が1%を超えたとき）、コンソールに以下が出力されます：

```javascript
[1% Spec Violation Detected - Issue #254] {
  fourCycleWindow: {
    lengthSamples: 4096,    // 4周期ウィンドウの長さ
  },
  phaseZero: {
    startOffsetPercent: 36.6,       // 現在：4周期内でのstart offset（0-100%）
    previousOffsetPercent: 28.3,    // 前フレ：4周期内でのstart offset（0-100%）
    offsetChange: 8.3,              // 変化量（仕様：1%以内）
    SPEC_VIOLATION: true            // 仕様違反フラグ
  },
  phaseTwoPi: {
    endOffsetPercent: 61.6,         // 現在：4周期内でのend offset（0-100%）
    previousOffsetPercent: 53.8,    // 前フレ：4周期内でのend offset（0-100%）
    offsetChange: 7.8,              // 変化量（仕様：1%以内）
    SPEC_VIOLATION: true            // 仕様違反フラグ
  }
}
→ Offset within 4-cycle window moved by more than 1% in one frame
```

### ログの読み取り方

**正常な場合：**
- `offsetChange` ≤ 1.0%
- ログ出力なし

**仕様違反の場合：**
- `offsetChange` > 1.0%
- `SPEC_VIOLATION: true`
- ログが出力される

**原因分析：**
1. `offsetChange`の値を確認
2. 例：8.3% → 4周期座標系内で8.3%もジャンプ（本来1%以内であるべき）
3. これは位相検出アルゴリズムまたは表示範囲決定ロジックの問題を示す

## 次のステップ
```

### 判定基準

**ケース1: 位相マーカーがスパイク**
- `markerMovement` > 200サンプル（約4ms @ 48kHz）
- `displayWindowChange.startDelta` < 100サンプル
→ **原因：位相検出の問題**

**ケース2: 表示ウィンドウがスパイク**
- `displayWindowChange.startDelta` > 500サンプル
- `markerMovement` < 100サンプル
→ **原因：表示範囲の切り替え**

**ケース3: 両方がスパイク**
- `markerMovement` > 200サンプル
- `displayWindowChange.startDelta` > 500サンプル
→ **原因：波形検出の大幅な変化**

## 次のステップ

1. ✅ 診断ログを実装
2. ⏳ アプリを実行してスパイクを再現
3. ⏳ コンソールログを分析
4. ⏳ 特定された原因に基づいて修正実施：
   - ケース1の場合：WASM側の位相検出アルゴリズムを修正
   - ケース2の場合：表示ウィンドウの変化を平滑化、またはオーバーレイの表示方法を変更
   - ケース3の場合：両方のアプローチを組み合わせて対応

## 期待される結果

この診断により、「何が」スパイクを引き起こしているかが明確になり、適切な修正箇所を特定できる。
