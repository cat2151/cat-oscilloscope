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
