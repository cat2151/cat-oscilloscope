# cat-oscilloscope ライブラリ使用方法

cat-oscilloscopeをnpmライブラリとして他のプロジェクトから利用する方法を説明します。

## 🎯 クイックスタート

**動くサンプルをすぐに見たい方は**: [簡易デモページ](https://cat2151.github.io/cat-oscilloscope/demo-simple.html) をご覧ください。CDN経由でライブラリを使用する最小限の実装例が掲載されています。

## インストール

### CDN経由での利用（推奨）

ビルドツール不要で、HTMLファイルから直接利用できます：

```html
<script type="module">
  import { Oscilloscope } from 'https://cdn.jsdelivr.net/gh/cat2151/cat-oscilloscope@v0.0.1/dist/cat-oscilloscope.mjs';
  
  const canvas = document.getElementById('oscilloscope');
  const oscilloscope = new Oscilloscope(canvas);
  await oscilloscope.start();
</script>
```

### npmから直接インストール（npmパッケージとして公開後）

```bash
npm install cat-oscilloscope
```

### GitHubリポジトリから直接インストール

```bash
npm install git+https://github.com/cat2151/cat-oscilloscope.git
```

### ローカルでのリンク（開発時）

```bash
# cat-oscilloscopeディレクトリで
npm run build:lib
npm link

# 使用するプロジェクトのディレクトリで
npm link cat-oscilloscope
```

## ⚠️ 重要: WASMファイルのセットアップ

cat-oscilloscopeは高速な波形処理のため、Rust/WASMを使用しています。**npmやGitHubからインストールする場合、WASMファイルを手動でセットアップする必要があります。**

### WASMファイルが必要な理由

cat-oscilloscopeは、初期化時に`{basePath}/wasm/wasm_processor.js`からWASMモジュールを動的に読み込みます。このファイルがブラウザからアクセスできる場所に配置されていないと、以下のようなエラーが発生します：

```
Failed to update oscilloscope
Failed to load WASM module script
```

### セットアップ方法

WASMファイルは`node_modules/cat-oscilloscope/dist/wasm/`に含まれていますが、ブラウザからアクセスできる公開ディレクトリにコピーする必要があります。

#### 方法1: postinstallスクリプトを使用（推奨）

`package.json`に以下を追加：

```json
{
  "scripts": {
    "postinstall": "node scripts/setup-cat-oscilloscope-wasm.js"
  }
}
```

`scripts/setup-cat-oscilloscope-wasm.js`を作成：

```javascript
const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'node_modules', 'cat-oscilloscope', 'dist', 'wasm');
const destDir = path.join(__dirname, '..', 'public', 'wasm'); // Vite/Reactの場合

// 必要なファイルリスト
const files = [
  'wasm_processor.js',
  'wasm_processor_bg.wasm',
  'wasm_processor.d.ts',
  'wasm_processor_bg.wasm.d.ts',
  'package.json'
];

// 必須ファイルの存在確認
console.log('Checking cat-oscilloscope WASM files...');
for (const file of files) {
  const src = path.join(sourceDir, file);
  if (!fs.existsSync(src)) {
    console.error(`❌ Required file not found: ${file}`);
    console.error(`   Expected at: ${src}`);
    process.exit(1);
  }
}

// コピー先ディレクトリ作成
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// ファイルをコピー
try {
  for (const file of files) {
    const src = path.join(sourceDir, file);
    const dest = path.join(destDir, file);
    fs.copyFileSync(src, dest);
  }
  console.log('✓ cat-oscilloscope WASM files copied to public/wasm/');
} catch (error) {
  console.error('❌ Failed to copy cat-oscilloscope WASM files:', error.message);
  process.exit(1);
}
```

**注意**: `destDir`はプロジェクトの構造に合わせて変更してください：
- Vite/React: `public/wasm`
- Next.js: `public/wasm`
- webpack: `static/wasm`または設定に応じて変更

#### 方法2: Viteプラグインを使用

`vite.config.ts`に以下を追加：

```typescript
import { defineConfig } from 'vite';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export default defineConfig({
  plugins: [{
    name: 'copy-cat-oscilloscope-wasm',
    buildStart() {
      const sourceDir = join(__dirname, 'node_modules', 'cat-oscilloscope', 'dist', 'wasm');
      const destDir = join(__dirname, 'public', 'wasm');
      
      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
      }
      
      const files = [
        'wasm_processor.js',
        'wasm_processor_bg.wasm',
        'wasm_processor.d.ts',
        'wasm_processor_bg.wasm.d.ts',
        'package.json'
      ];
      
      files.forEach(file => {
        copyFileSync(
          join(sourceDir, file),
          join(destDir, file)
        );
      });
      
      console.log('✓ cat-oscilloscope WASM files copied');
    }
  }]
});
```

#### 方法3: 手動コピー

開発時に一度だけ実行：

```bash
# Linux/Mac
mkdir -p public/wasm
cp node_modules/cat-oscilloscope/dist/wasm/* public/wasm/

# Windows (PowerShell)
New-Item -ItemType Directory -Force -Path public\wasm
Copy-Item node_modules\cat-oscilloscope\dist\wasm\* public\wasm\
```

### .gitignoreの設定

WASMファイルは自動生成されるため、gitから除外することを推奨します：

```gitignore
# cat-oscilloscope WASM files (auto-generated by postinstall)
public/wasm/
```

### トラブルシューティング

#### エラー: "Failed to load WASM module script"

WASMファイルが正しく配置されていません。以下を確認してください：

1. `public/wasm/wasm_processor.js`が存在するか
2. ブラウザの開発者ツールのNetworkタブで、`/wasm/wasm_processor.js`へのリクエストが404エラーになっていないか
3. ビルドツールの設定で`public`ディレクトリが正しく配信されているか

#### CDN経由での使用の場合

CDN経由（jsdelivr等）で使用する場合、WASMファイルも同じCDNから自動的に読み込まれるため、手動セットアップは不要です。

## 基本的な使い方

### TypeScript/ES Modules

```typescript
import { Oscilloscope } from 'cat-oscilloscope';

// Canvas要素を取得
const canvas = document.getElementById('oscilloscope') as HTMLCanvasElement;

// Oscilloscopeインスタンスを作成
const oscilloscope = new Oscilloscope(canvas);

// マイク入力を開始
async function startMicrophone() {
  try {
    await oscilloscope.start();
    console.log('Oscilloscope started');
  } catch (error) {
    console.error('Failed to access microphone:', error);
  }
}

// オーディオファイルを読み込み
async function loadAudioFile(file: File) {
  try {
    await oscilloscope.startFromFile(file);
    console.log('Audio file loaded');
  } catch (error) {
    console.error('Failed to load audio file:', error);
  }
}

// 静的バッファから可視化（オーディオ再生なし）
async function visualizeBuffer(audioData: Float32Array, sampleRate: number) {
  try {
    const bufferSource = new BufferSource(audioData, sampleRate, { loop: true });
    await oscilloscope.startFromBuffer(bufferSource);
    console.log('Buffer visualization started');
  } catch (error) {
    console.error('Failed to start from buffer:', error);
  }
}

// AudioBufferから可視化
async function visualizeAudioBuffer(audioBuffer: AudioBuffer) {
  try {
    const bufferSource = BufferSource.fromAudioBuffer(audioBuffer, { loop: true });
    await oscilloscope.startFromBuffer(bufferSource);
    console.log('AudioBuffer visualization started');
  } catch (error) {
    console.error('Failed to start from AudioBuffer:', error);
  }
}

// 停止
async function stop() {
  await oscilloscope.stop();
}
```

### CommonJS

```javascript
const { Oscilloscope } = require('cat-oscilloscope');

const canvas = document.getElementById('oscilloscope');
const oscilloscope = new Oscilloscope(canvas);

// 以下、使い方は同じ
```

## 設定オプション

### オートゲイン

```typescript
// オートゲインを有効化（デフォルト: 有効）
oscilloscope.setAutoGain(true);

// オートゲインの状態を取得
const isAutoGainEnabled = oscilloscope.getAutoGainEnabled();

// 現在のゲイン値を取得
const currentGain = oscilloscope.getCurrentGain();
```

### ノイズゲート

```typescript
// ノイズゲートを有効化
oscilloscope.setNoiseGate(true);

// ノイズゲートの閾値を設定（振幅値: 0.001-1.00）
oscilloscope.setNoiseGateThreshold(0.01);

// dB値から振幅値に変換（ユーティリティ関数）
import { dbToAmplitude } from 'cat-oscilloscope';
const threshold = dbToAmplitude(-40); // -40dB
oscilloscope.setNoiseGateThreshold(threshold);
```

### 周波数推定方法

```typescript
// 周波数推定方法を設定
// 'zero-crossing' | 'autocorrelation' | 'fft'
oscilloscope.setFrequencyEstimationMethod('autocorrelation');

// 推定された周波数を取得（Hz）
const frequency = oscilloscope.getEstimatedFrequency();
```

### FFTスペクトラム表示

```typescript
// FFTオーバーレイ表示を有効化
oscilloscope.setFFTDisplay(true);

// FFT表示の状態を取得
const isFFTEnabled = oscilloscope.getFFTDisplayEnabled();
```

### デバッグオーバーレイ表示の制御

cat-oscilloscopeは、詳細情報を表示するオーバーレイ（黄色の枠線で囲まれた情報パネル）を提供しています：

- **FFTスペクトラム**: 周波数スペクトラム表示（青枠）
- **倍音分析（Harmonic Analysis）**: FFT推定時の倍音情報（黄色枠）
- **周波数推移プロット**: 推定周波数の履歴グラフ（黄色枠）

これらのオーバーレイは必要に応じて有効/無効を切り替えられます。

```typescript
// デバッグオーバーレイを非表示にする
oscilloscope.setDebugOverlaysEnabled(false);

// デバッグオーバーレイを表示する（デフォルト）
oscilloscope.setDebugOverlaysEnabled(true);

// 現在の状態を取得
const isDebugEnabled = oscilloscope.getDebugOverlaysEnabled();
```

### オーバーレイのレイアウトカスタマイズ

#### デフォルトレイアウトについて（重要）

**cat-oscilloscopeは、どのようなキャンバスサイズでも適切に動作するデフォルトレイアウトを内蔵しています。**

デフォルトレイアウトでは：
- **FFTスペクトラム**: 左下に画面の35%×35%で配置
- **倍音分析**: 左上に500px幅で配置
- **周波数推移プロット**: 右上に280×120pxで配置

これらのデフォルト設定は、800×400pxの標準サイズだけでなく、1800×1000pxなどの大きなキャンバスでも正しく機能します。**ほとんどのユースケースでは、カスタムレイアウト設定は不要です。**

```typescript
// デフォルトレイアウトを使用する場合（推奨）
const oscilloscope = new Oscilloscope(
  canvas,
  previousWaveformCanvas,
  currentWaveformCanvas,
  similarityPlotCanvas,
  frameBufferCanvas
  // overlaysLayoutパラメータは省略 - デフォルトが使用されます
);
```

#### カスタムレイアウトの設定（必要な場合のみ）

特別な要件がある場合のみ、オーバーレイの位置とサイズをカスタマイズできます：

```typescript
import { Oscilloscope, OverlaysLayoutConfig } from 'cat-oscilloscope';

const canvas = document.getElementById('oscilloscope') as HTMLCanvasElement;

// カスタムレイアウト設定
const customLayout: OverlaysLayoutConfig = {
  // FFTスペクトラム（デフォルト: 左下）
  fftOverlay: {
    position: { x: 10, y: '65%' },     // ピクセルまたはパーセント指定
    size: { width: '35%', height: '35%' }
  },
  // 倍音分析（デフォルト: 左上）
  harmonicAnalysis: {
    position: { x: 10, y: 10 },
    size: { width: 500, height: 'auto' }  // 'auto'で内容に応じた高さ
  },
  // 周波数推移プロット（デフォルト: 右上）
  frequencyPlot: {
    position: { x: 'right-10', y: 10 },  // 'right-X'で右端からの距離
    size: { width: 280, height: 120 }
  }
};

// コンストラクタでレイアウトを指定
const oscilloscope = new Oscilloscope(
  canvas,
  previousWaveformCanvas,
  currentWaveformCanvas,
  similarityPlotCanvas,
  frameBufferCanvas,
  customLayout  // オプション: カスタムレイアウト
);

// または実行時に変更
oscilloscope.setOverlaysLayout({
  frequencyPlot: {
    position: { x: 10, y: 10 },  // 左上に移動
    size: { width: 300, height: 150 }
  }
});

await oscilloscope.start();
```

**レイアウト設定のポイント：**
- `position.x`, `position.y`: 数値（ピクセル）または文字列（パーセント `'10%'`）
- `position.x`: `'right-10'` 形式で右端からの距離を指定可能
- `size.width`, `size.height`: 数値（ピクセル）、パーセント文字列、または `'auto'`
- 部分的な設定のみでもOK（未指定の項目はデフォルト値を使用）

## レイアウト設計ガイドライン

### ⚠️ 重要: Canvas要素のwidth/height属性の設定

**Canvas要素には必ず`width`および`height`属性を設定してください。** CSSでサイズを指定するだけでは不十分です。

```html
<!-- ❌ 間違い: CSS のみでサイズ指定 -->
<canvas id="oscilloscope" style="width: 1800px; height: 1000px;"></canvas>

<!-- ✅ 正しい: width/height 属性を設定 -->
<canvas id="oscilloscope" width="1800" height="1000"></canvas>
```

**理由:**
- Canvas要素は内部解像度（`canvas.width`/`canvas.height`）と表示サイズ（CSS）が別々に管理されます
- 属性未設定の場合、内部解像度はデフォルトの**300x150px**になります
- CSSで引き伸ばされた結果、オーバーレイの配置が崩れ、オレンジ色の周波数推移フレームが画面全体に広がるなどの問題が発生します

cat-oscilloscopeは、canvas要素がデフォルト解像度（300x150）の場合、コンソールに警告を出力します。

### 推奨キャンバスサイズ

cat-oscilloscopeは、以下のキャンバスサイズで最適化されています：

- **メインキャンバス**: `800x400px` または `800x350px`
  - 波形とグリッド表示に最適なアスペクト比
  - デバッグオーバーレイを無効にすれば、より小さなサイズでも使用可能
- **大型キャンバス**: `1800x1000px`などの大きなサイズも正しく動作します
  - デフォルトのオーバーレイレイアウトが自動的に適応します

### 表示要素の制御

ライブラリとして使用する際、以下の要素を制御できます：

| 要素 | 制御API | デフォルト | ライブラリ使用時 |
|------|---------|----------|------------------|
| オートゲイン | `setAutoGain(boolean)` | `true` | 用途に応じて |
| ノイズゲート | `setNoiseGate(boolean)` | `false` | 用途に応じて |
| FFTスペクトラム | `setFFTDisplay(boolean)` | `true` | 用途に応じて |
| デバッグオーバーレイ | `setDebugOverlaysEnabled(boolean)` | `true` | 用途に応じて |
| オーバーレイレイアウト | `setOverlaysLayout(OverlaysLayoutConfig)` | デフォルトレイアウト | カスタマイズ可能 |

**オーバーレイのレイアウトカスタマイズ（v0.0.2以降）:**
- FFTスペクトラム、倍音分析、周波数推移プロットの位置とサイズを個別に設定可能
- ピクセル値、パーセント値、または`'auto'`で指定
- 外部アプリケーションでの独自レイアウト実現に対応

### レイアウト統合時の注意点

1. **デバッグオーバーレイの制御**: `setDebugOverlaysEnabled()`で表示を切り替えるか、`setOverlaysLayout()`でカスタムレイアウトを設定
2. **キャンバスサイズの考慮**: 推奨サイズ（800x400px）から大きく外れる場合、パーセント指定を活用
3. **CSS でのスタイリング**: キャンバス要素には`border`や`box-shadow`などのCSSを自由に適用できます
4. **動的レイアウト**: `setOverlaysLayout()`で実行時にレイアウトを変更可能

```html
<canvas id="oscilloscope" width="800" height="400" style="border: 2px solid #00ff00;"></canvas>
```

## 高度な使い方

### BufferSourceを使用した静的バッファの可視化

`BufferSource`を使用すると、オーディオ再生なしで任意のオーディオデータを可視化できます。これは、wavlpfのような音声処理プロジェクトや、リアルタイム処理結果の可視化に便利です。

```typescript
import { Oscilloscope, BufferSource } from 'cat-oscilloscope';

// Canvas要素を取得
const canvas = document.getElementById('oscilloscope') as HTMLCanvasElement;
const oscilloscope = new Oscilloscope(canvas);

// Float32Arrayから直接可視化
const audioData = new Float32Array(44100); // 1秒分のデータ
for (let i = 0; i < audioData.length; i++) {
  audioData[i] = Math.sin(2 * Math.PI * 440 * i / 44100); // 440Hz サイン波
}

const bufferSource = new BufferSource(audioData, 44100, {
  loop: true,  // ループ再生
  chunkSize: 4096  // FFTサイズ
});

await oscilloscope.startFromBuffer(bufferSource);

// AudioBufferからの可視化
const audioBuffer = await decodeAudioData(arrayBuffer);
const bufferSource2 = BufferSource.fromAudioBuffer(audioBuffer, {
  loop: false,  // ループなし
  channel: 0    // 左チャンネル
});

await oscilloscope.startFromBuffer(bufferSource2);
```

**BufferSourceの特徴:**
- オーディオ再生なしでデータを可視化
- 任意のFloat32Arrayを入力として受け付け
- ループ再生のオン/オフ切り替え可能
- シークやリセット機能をサポート
- wavlpfなどの音声処理ライブラリとの統合に最適

**注意**: BufferSourceモードではFFTオーバーレイ表示は利用できません。周波数推定はWASMプロセッサを通じて引き続き機能します。

**wavlpfプロジェクトでの使用例:**
```typescript
import { Oscilloscope, BufferSource } from 'cat-oscilloscope';
import { applyLowPassFilter } from 'wavlpf';

// フィルタ処理後の音声データを可視化
const filteredData = applyLowPassFilter(originalData, sampleRate, cutoffFreq);
const bufferSource = new BufferSource(filteredData, sampleRate, { loop: true });

const canvas = document.getElementById('oscilloscope') as HTMLCanvasElement;
const oscilloscope = new Oscilloscope(canvas);
await oscilloscope.startFromBuffer(bufferSource);
```

#### BufferSourceでの周波数推定の使い方

BufferSourceモードでも、WASM実装の周波数推定は正常に動作します。推定された周波数は通常通り`getEstimatedFrequency()`メソッドで取得できます。

```typescript
import { Oscilloscope, BufferSource } from 'cat-oscilloscope';

// 440Hz サイン波を生成
const sampleRate = 44100;
const frequency = 440;
const audioData = new Float32Array(sampleRate); // 1秒分
for (let i = 0; i < audioData.length; i++) {
  audioData[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
}

const canvas = document.getElementById('oscilloscope') as HTMLCanvasElement;
// 最小限の構成: 必須のcanvasパラメータのみ
const hiddenCanvas = document.createElement('canvas');
const oscilloscope = new Oscilloscope(canvas, hiddenCanvas, hiddenCanvas, hiddenCanvas, hiddenCanvas);

// BufferSourceから可視化を開始
const bufferSource = new BufferSource(audioData, sampleRate, { loop: true });
await oscilloscope.startFromBuffer(bufferSource);

// 周波数推定メソッドを設定（オプション）
oscilloscope.setFrequencyEstimationMethod('autocorrelation'); // または 'zero-crossing', 'fft', 'stft', 'cqt'

// 推定された周波数を取得
setInterval(() => {
  const estimatedFreq = oscilloscope.getEstimatedFrequency();
  console.log(`推定周波数: ${estimatedFreq.toFixed(1)} Hz`);
}, 100);
```

**周波数推定の注意点:**

1. **初期化の遅延**: WASMモジュールの初期化に時間がかかる場合があります。最初のフレームでは周波数が0または不正確な値になることがあります。

2. **推定方式の選択**: 
   - `'zero-crossing'`: 高速だが単純な波形に限定
   - `'autocorrelation'`: バランスが良く、ほとんどの場合に適している（推奨）
   - `'fft'`: 高周波に強いが、低周波では精度が落ちる
   - `'stft'`: 低周波の検出に優れている
   - `'cqt'`: 音楽分析に最適

3. **サンプルレートの重要性**: BufferSourceを作成する際は、正しいサンプルレートを指定してください。間違ったサンプルレートは周波数推定を失敗させます。

4. **データ品質**: ノイズが多いデータや振幅が極端に小さいデータでは、周波数推定が失敗する可能性があります。必要に応じて`setAutoGain(true)`を使用してください。

5. **FFTオーバーレイの制限**: BufferSourceモードでは、FFTスペクトラムオーバーレイは表示されません（技術的制約）。ただし、周波数推定自体は正常に機能します。

**wavlpfなどのライブラリとの統合時のヒント:**

```typescript
// 処理後のデータを可視化する場合の推奨設定
oscilloscope.setAutoGain(true);  // 振幅の自動調整を有効化
oscilloscope.setNoiseGate(false);  // フィルタ処理済みデータの場合は無効化を推奨
oscilloscope.setFrequencyEstimationMethod('autocorrelation');  // 汎用的な推定方式
oscilloscope.setDebugOverlaysEnabled(false);  // シンプルな表示にする

// 推定周波数の取得（リアルタイム更新）
const updateFrequency = () => {
  const freq = oscilloscope.getEstimatedFrequency();
  if (freq > 0) {
    console.log(`推定周波数: ${freq.toFixed(1)} Hz`);
  }
  requestAnimationFrame(updateFrequency);
};
updateFrequency();
```


### 個別のモジュールを使用

各モジュールを直接インポートして、カスタマイズした実装を作成できます。

```typescript
import {
  AudioManager,
  GainController,
  FrequencyEstimator,
  WaveformRenderer,
  ZeroCrossDetector,
  trimSilence
} from 'cat-oscilloscope';

// AudioManagerの個別使用
const audioManager = new AudioManager();
await audioManager.start();
const timeDomainData = audioManager.getTimeDomainData();

// WaveformRendererの個別使用
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
const renderer = new WaveformRenderer(canvas);
renderer.clearAndDrawGrid();
renderer.drawWaveform(timeDomainData, 0, timeDomainData.length, 1.0);
```

### AudioBuffer処理

```typescript
import { trimSilence } from 'cat-oscilloscope';

// オーディオファイルを読み込んで無音部分を除去
async function processAudioFile(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  // 先頭と末尾の無音をトリム
  const trimmedBuffer = trimSilence(audioBuffer);
  
  return trimmedBuffer;
}
```

## HTML例

### CDN経由での使用例

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>cat-oscilloscope CDN Example</title>
</head>
<body>
  <canvas id="oscilloscope" width="800" height="400"></canvas>
  <button id="startBtn">Start</button>
  <button id="stopBtn">Stop</button>
  
  <script type="module">
    import { Oscilloscope } from 'https://cdn.jsdelivr.net/gh/cat2151/cat-oscilloscope@v0.0.1/dist/cat-oscilloscope.mjs';
    
    const canvas = document.getElementById('oscilloscope');
    const oscilloscope = new Oscilloscope(canvas);
    
    document.getElementById('startBtn').addEventListener('click', async () => {
      await oscilloscope.start();
    });
    
    document.getElementById('stopBtn').addEventListener('click', async () => {
      await oscilloscope.stop();
    });
  </script>
</body>
</html>
```

### npm経由での使用例

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>cat-oscilloscope Example</title>
</head>
<body>
  <canvas id="oscilloscope" width="800" height="400"></canvas>
  <button id="startBtn">Start</button>
  <button id="stopBtn">Stop</button>
  
  <script type="module">
    import { Oscilloscope } from 'cat-oscilloscope';
    
    const canvas = document.getElementById('oscilloscope');
    const oscilloscope = new Oscilloscope(canvas);
    
    document.getElementById('startBtn').addEventListener('click', async () => {
      await oscilloscope.start();
    });
    
    document.getElementById('stopBtn').addEventListener('click', async () => {
      await oscilloscope.stop();
    });
  </script>
</body>
</html>
```

## TypeScript型定義

cat-oscilloscopeはTypeScriptで書かれており、完全な型定義を含んでいます。TypeScriptプロジェクトでは自動的に型補完とチェックが利用できます。

```typescript
import { Oscilloscope } from 'cat-oscilloscope';

// 型が自動的に推論される
const oscilloscope: Oscilloscope = new Oscilloscope(canvas);
```

## ブラウザ要件

- Web Audio API サポート（Chrome, Firefox, Safari, Edge）
- マイクアクセスにはHTTPSまたはlocalhostが必要
- HTML5 Canvas サポート

## ライセンス

MIT License
