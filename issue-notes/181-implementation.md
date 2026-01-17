# Issue #181 実装完了: 問題隠蔽処理の修正と診断ログ機能

## 概要

PR #180で特定された問題隠蔽処理を修正し、類似度スパイクの原因を調査するための診断ログ出力機能を実装しました。

## 実装内容

### 1. WASM側の診断ログ機能（Rust）

#### waveform_searcher.rs
類似度が0になる4つの原因を明示的にログ出力：

1. **cycle_length無効時**
   - ログ: `"Similarity=0: Invalid cycle_length (value)"`
   - 原因: 周波数推定失敗またはサンプルレート異常

2. **バッファサイズ不足時**
   - ログ: `"Similarity=0: Buffer too short (current=X, required=Y)"`
   - 原因: AnalyserNodeのバッファ更新とrequestAnimationFrameのタイミングずれ
   - **これがマイク入力時の1秒10回スパイクの最有力原因**

3. **前回波形との長さ不一致時**
   - ログ: `"Similarity=0: Waveform length mismatch (prev=X, current=Y)"`
   - 原因: 周波数変化による波形サイクル長の変動

4. **類似度検索未実行時**
   - ログ: `"Similarity=0: Search not performed"`
   - 原因: 前回波形なしまたはcycle_length無効

#### gain_controller.rs
ノイズゲート適用時のログ出力：

- ログ: `"Noise gate: Signal below threshold, filling with 0.0"`
- 原因: 信号振幅がノイズゲート閾値以下

#### lib.rs
空データ検出時のログ出力：

- ログ: `"No data: Waveform data is empty"`
- 原因: AudioContextからのデータ取得失敗

#### Cargo.toml
web-sys依存関係の追加：

```toml
web-sys = { version = "0.3", features = ["console"] }
```

### 2. TypeScript側のフレーム処理診断機能

#### Oscilloscope.ts
フレーム処理時間の測定とパフォーマンス監視：

1. **フレーム処理時間の測定**
   - `performance.now()` を使用して各フレームの処理時間を記録
   - 直近100フレーム分の処理時間を保持

2. **60fps目標の監視**
   - 16.67ms（60fps）を超えた場合に警告ログを出力
   - ログ: `"Frame processing time: Xms (target: <16.67ms)"`

3. **定期的なFPS/平均処理時間のレポート**
   - 60フレームごと（約1秒ごと）にFPSと平均処理時間を出力
   - ログ: `"FPS: X.X, Avg frame time: X.XXms"`

```typescript
// 診断用プロパティ
private lastFrameTime = 0;
private frameProcessingTimes: number[] = [];
private readonly MAX_FRAME_TIMES = 100;
private readonly TARGET_FRAME_TIME = 16.67; // 60fps target
private readonly FRAMES_PER_LOG_INTERVAL = 60;
```

## Fail Fast原則の適用

PR #180で指摘された「問題隠蔽」を以下のように解消：

### Before（問題隠蔽）
```rust
// ログ出力なしで類似度0を記録
if current_frame.len() < waveform_length {
    self.update_similarity_history(0.0);
    return None;
}
```

### After（Fail Fast）
```rust
// 原因を明示的にログ出力
if current_frame.len() < waveform_length {
    web_sys::console::log_1(
        &format!("Similarity=0: Buffer too short (current={}, required={})", 
                 current_frame.len(), waveform_length).into()
    );
    self.update_similarity_history(0.0);
    return None;
}
```

## 期待される効果

1. **問題の可視化**
   - 類似度0スパイクの正確な原因をリアルタイムで把握可能
   - 問題が隠蔽されず、開発者がすぐに気づける

2. **デバッグの効率化**
   - ブラウザのコンソールで直接原因を確認できる
   - 再現手順の確立が容易

3. **パフォーマンスの可視化**
   - フレーム処理時間の監視でボトルネックを特定
   - 60fps目標の達成状況を常時把握

## テスト結果

- **既存テスト**: 197/204 passed（7つのWASMタイムアウトは既存の問題）
- **ビルド**: 成功
- **TypeScript型チェック**: 成功
- **セキュリティチェック**: アラート0件（CodeQL）

## コードレビューフィードバック対応

1. **ログメッセージの英語化**
   - 理由: 国際的な開発環境のため
   - 変更: 日本語 → 英語

2. **FPSログ条件の修正**
   - 問題: 100フレーム到達時のみログ出力（1回のみ）
   - 修正: 60フレームごとに定期的にログ出力（約1秒ごと）

3. **マジックナンバーの定数化**
   - 60 → `FRAMES_PER_LOG_INTERVAL`（定数）
   - 保守性と可読性の向上

4. **ログメッセージの簡潔化**
   - 冗長な説明を削除し、一貫性を向上

## 次のステップ（Issue #179の根本修正に向けて）

PR #180の推奨アクションに従い、以下の3フェーズで対応：

### フェーズ1: 診断ログ追加（✅ 完了）
- 類似度が0になる正確な理由をログ出力
- フレーム処理時間の測定
- バッファ不足の頻度を測定

### フェーズ2: Fail Fast原則の徹底（次の課題）
- バッファサイズ不足時、類似度を0ではなく-1.0（データ不足マーカー）に設定
- エラー状態を明示的に区別

### フェーズ3: 根本修正（将来の課題）
- データ連続性の検証（AudioContext.currentTime使用）
- AudioWorkletへの移行検討
- 相関係数計算の最適化

## 関連資料

- PR #180: 調査完了（問題隠蔽実装の特定）
- Issue #179: マイク入力時の類似度0スパイク問題
- `issue-notes/179-analysis-v3.md`: Fail Fast視点からの詳細分析
