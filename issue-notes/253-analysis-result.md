# issue #253 分析結果: 簡易デモの挙動調査

## 問題の要約

Issue #253で指摘された「簡易デモ（BufferSourceモード）の挙動に違和感がある。設計不備の可能性」について調査を実施しました。

## 調査結果

### 結論

**設計不備はありません。BufferSourceモードは、マイク/ファイル入力モードと完全に同等の機能をサポートしています。**

ただし、コードコメントとドキュメントに誤解を招く記述があり、これが「違和感」の原因でした。

### アーキテクチャの理解

#### 2つの入力モードの比較

| 側面 | マイク/ファイルモード | BufferSourceモード |
|------|---------------------|-------------------|
| **AudioContext** | ✅ 作成される | ❌ nullに設定 |
| **AnalyserNode** | ✅ 作成される | ❌ 作成されない |
| **FFTソース** | AnalyserNode（ハードウェア） | WASM計算（ソフトウェア） |
| **音声再生** | ✅ 可能 | ❌ 不可（可視化のみ） |

#### データフロー

**マイク/ファイルモード:**
```
入力 → AudioContext → AnalyserNode → FFTデータ取得 → 描画
                                   ↓
                              時間領域データ取得
```

**BufferSourceモード:**
```
Float32Array → AudioManager → 時間領域データ → WaveformDataProcessor
                                                      ↓
                                              WASM FFT計算
                                                      ↓
                                                    描画
```

### 機能サポート状況

**すべての機能が両モードで動作します:**

- ✅ 周波数推定（Zero-Crossing, Autocorrelation, FFT, STFT, CQT）
- ✅ FFTスペクトラムオーバーレイ表示
- ✅ 倍音分析
- ✅ 自動ゲインとノイズゲート
- ✅ 波形類似度検出
- ✅ 位相マーカーと周期可視化

**唯一の違い:**
- マイク/ファイルモード: 音声再生あり
- BufferSourceモード: 音声再生なし（可視化のみ）

### 誤解を招いていた記述

#### 1. AudioManager.ts の誤解を招くコメント

**修正前:**
```typescript
// Buffer mode: FFT is not currently supported
// Note: FFT could be implemented in the future...
```

**修正後:**
```typescript
// BufferSource mode: Return null here
// FFT will be computed on-demand by WaveformDataProcessor using WASM
// (see WaveformDataProcessor.processFrame lines 149-154)
```

#### 2. LIBRARY_USAGE.md の誤った記述

**修正前:**
```markdown
**注意**: BufferSourceモードではFFTオーバーレイ表示は利用できません。
```

**修正後:**
```markdown
**重要**: BufferSourceモードは、マイク/ファイル入力モードと
**完全に同等の機能**をサポートしています
```

### アーキテクチャの正当性

この設計は、適切なレイヤー分離に基づいています：

1. **AudioManager**: オーディオソース管理に専念
   - マイク/ファイル: Web Audio APIを使用
   - BufferSource: 直接データを提供

2. **WaveformDataProcessor**: データ処理を担当
   - マイク/ファイル: AnalyserNodeから取得したFFTを使用
   - BufferSource: WASMでFFTを計算

これは**Single Responsibility Principle（単一責任の原則）**に従った設計であり、DRY違反ではありません。

### 実施した修正

1. **src/AudioManager.ts**: 誤解を招くコメントを修正、アーキテクチャを説明
2. **src/BufferSource.ts**: 機能完全性を明示するコメントを追加
3. **src/WaveformDataProcessor.ts**: BufferSourceモードでのFFT計算の重要性を説明
4. **LIBRARY_USAGE.md**: 誤った記述を修正、機能完全性を明示
5. **demo-simple.html**: BufferSourceモードの機能サポート状況を説明

## まとめ

- ✅ 設計は適切（レイヤー分離されたアーキテクチャ）
- ✅ 機能は完全にサポート（両モードで同等）
- ❌ コメントとドキュメントが不正確（修正済み）

**Issue #253で指摘された「違和感」の原因は、コードコメントとドキュメントの不正確な記述でした。実際のアーキテクチャと実装には問題はありません。**
