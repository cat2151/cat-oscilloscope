# Issue #254 診断計画

## 目的
Offset %オーバーレイに表示されるスパイク（例：1フレームで40%の変化）の根本原因を特定する。

**仕様：** 位相マーカーのオフセットは1フレームあたり1%以内の変化に収まるべき。

## 問題の再定義
**重要な認識：** 元のOffset %グラフが40%スパイクを表示していた場合、それは**誤った可視化ではなく、実際に起きている現象を正しく表示していた**可能性がある。

## 用語の説明

- **4周期データ**: 表示ウィンドウ（displayStartIndex〜displayEndIndex）内に表示される約4周期分の波形データ
- **start offset**: 位相0マーカー（赤い縦線の開始位置）が4周期データ内のどこにあるか（0-100%）
- **end offset**: 位相2πマーカー（赤い縦線の終了位置）が4周期データ内のどこにあるか（0-100%）
- **sampleIndex**: サンプルバッファ内での実際のインデックス位置（参考情報）
- **markerMovement**: 前フレームからのサンプル単位での移動量
- **offsetChange**: 前フレームからのオフセット%の変化量（仕様では1%以内）

## 調査すべき3つの可能性

### 1. 位相マーカー自体がスパイク移動している
**症状：** `phaseZeroIndex`（赤い縦線のサンプル位置）が1フレームで大きく変化
**診断ログで確認：** 
- `phaseZero.markerMovement`: 大きな値（例：数百サンプル以上）
- `displayWindowChange`: 小さな変化または変化なし

**原因の可能性：**
- WASM側の位相検出アルゴリズムの問題
- 波形の急激な変化（ノイズ、音の切り替わり）
- 自己相関/FFTなどの周波数推定の誤検出

### 2. 表示ウィンドウがスパイク変化している
**症状：** `displayStartIndex/displayEndIndex`が1フレームで大きく変化
**診断ログで確認：**
- `displayWindowChange.startDelta`: 大きな値
- `displayWindowChange.endDelta`: 大きな値
- `phaseZero.markerMovement`: 小さな変化または変化なし

**原因の可能性：**
- `phaseMarkerRangeEnabled`のON/OFF切り替え（Oscilloscope.ts:225-232）
- WASM側が返す`displayStartIndex/displayEndIndex`の急激な変化

### 3. 両方が同時に変化している
**症状：** 位相マーカーと表示ウィンドウの両方が大きく変化
**診断ログで確認：**
- `phaseZero.markerMovement`: 大きな値
- `displayWindowChange`: 大きな変化

## 診断ログの読み方

スパイク検出時（オフセット変化が1%を超えたとき）、コンソールに以下の形式でログが出力されます：

```javascript
[Offset Spike Detected - Issue #254] {
  displayWindow: {
    start: 10000,      // 表示ウィンドウ開始位置（サンプル）
    end: 14096,        // 表示ウィンドウ終了位置（サンプル）
    length: 4096,      // 表示ウィンドウの長さ（4周期分）
  },
  displayWindowChange: {
    startDelta: 50,    // 前フレームからの開始位置の変化
    endDelta: 50,      // 前フレームからの終了位置の変化
    lengthChange: 0,   // 長さの変化
  },
  phaseZero: {
    sampleIndex: 11500,           // 位相マーカーのサンプル位置（参考情報）
    startOffsetPercent: 36.6,     // 4周期データ内でのstart offset（0-100%）
    markerMovement: 45,           // 前フレームからの移動量（サンプル数）
    offsetChange: 8.3,            // start offsetの変化量（仕様では1%以内）
    SPIKE_DETECTED: true
  },
  phaseTwoPi: {
    sampleIndex: 12524,           // 位相マーカーのサンプル位置（参考情報）
    endOffsetPercent: 61.6,       // 4周期データ内でのend offset（0-100%）
    markerMovement: 43,           // 前フレームからの移動量（サンプル数）
    offsetChange: 7.8,            // end offsetの変化量（仕様では1%以内）
    SPIKE_DETECTED: true
  }
}
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
