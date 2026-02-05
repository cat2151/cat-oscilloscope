# Issue #254 診断計画

## 目的
Offset %オーバーレイに表示されるスパイク（例：1フレームで40%の変化）の根本原因を特定する。

## 問題の再定義
**重要な認識：** 元のOffset %グラフが40%スパイクを表示していた場合、それは**誤った可視化ではなく、実際に起きている現象を正しく表示していた**可能性がある。

## 調査すべき3つの可能性

### 1. 位相マーカー自体がスパイク移動している
**症状：** `phaseZeroIndex`（赤い縦線のサンプル位置）が1フレームで大きく変化
**診断ログで確認：** 
- `phaseZero.markerDelta`: 大きな値（例：数千サンプル以上）
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
- `phaseZero.markerDelta`: 小さな変化または変化なし

**原因の可能性：**
- `phaseMarkerRangeEnabled`のON/OFF切り替え（Oscilloscope.ts:225-232）
- WASM側が返す`displayStartIndex/displayEndIndex`の急激な変化

### 3. 両方が同時に変化している
**症状：** 位相マーカーと表示ウィンドウの両方が大きく変化
**診断ログで確認：**
- `phaseZero.markerDelta`: 大きな値
- `displayWindowChange`: 大きな変化

## 診断ログの読み方

スパイク検出時、コンソールに以下の形式でログが出力されます：

```javascript
[Offset Spike Detected - Issue #254] {
  displayWindow: {
    start: 10000,      // 表示ウィンドウ開始位置
    end: 14096,        // 表示ウィンドウ終了位置
    length: 4096,      // 表示ウィンドウの長さ
  },
  displayWindowChange: {
    startDelta: 50,    // 前フレームからの開始位置の変化
    endDelta: 50,      // 前フレームからの終了位置の変化
    lengthChange: 0,   // 長さの変化
  },
  phaseZero: {
    absoluteIndex: 11500,        // 位相マーカーの絶対位置
    offsetPercent: 36.6,         // 表示ウィンドウ内での相対位置%
    markerDelta: 45,             // 前フレームからの移動量（サンプル数）
    markerDeltaPercent: 1.1,     // 移動量を%で表示
    percentChange: 8.3,          // オフセット%の変化量
    SPIKE_DETECTED: true
  }
}
```

### 判定基準

**ケース1: 位相マーカーがスパイク**
- `markerDelta` > 200サンプル（約4ms @ 48kHz）
- `displayWindowChange.startDelta` < 100サンプル
→ **原因：位相検出の問題**

**ケース2: 表示ウィンドウがスパイク**
- `displayWindowChange.startDelta` > 500サンプル
- `markerDelta` < 100サンプル
→ **原因：表示範囲の切り替え**

**ケース3: 両方がスパイク**
- `markerDelta` > 200サンプル
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
