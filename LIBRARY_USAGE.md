# cat-oscilloscope ライブラリ使用方法

cat-oscilloscopeをnpmライブラリとして他のプロジェクトから利用する方法を説明します。

## インストール

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
