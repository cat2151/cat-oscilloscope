// CDN経由でライブラリをインポート
// NOTE:
//   このデモでは最新版を手軽に試せるよう、jsDelivr の `@main` を利用しています。
//   本番環境で利用する場合は、CDN キャッシュの不整合を避けるため、必ずバージョンタグ
//   もしくはコミットハッシュを指定してください（例）:
//   import { Oscilloscope, BufferSource } from
//     'https://cdn.jsdelivr.net/gh/cat2151/cat-oscilloscope@v1.0.0/dist/cat-oscilloscope.mjs';
//
// ローカル開発時は、次の行のコメントを外して、上記CDNのimportをコメントアウトしてください:
import { Oscilloscope, BufferSource } from '/src/index.ts';
// import { Oscilloscope, BufferSource } from 'https://cdn.jsdelivr.net/gh/cat2151/cat-oscilloscope@main/dist/cat-oscilloscope.mjs';

// Canvas要素とUI要素を取得
const canvas = document.getElementById('oscilloscope');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusElement = document.getElementById('status');
const frequencyElement = document.getElementById('frequency');
const gainElement = document.getElementById('gain');
const waveformRadios = document.querySelectorAll('input[name="waveform"]');

// Oscilloscopeインスタンスを作成（簡易版なので比較パネル用のcanvasは隠しcanvasを使用）
const hiddenCanvas = document.createElement('canvas');
hiddenCanvas.width = 250;
hiddenCanvas.height = 120;

const oscilloscope = new Oscilloscope(
  canvas,
  hiddenCanvas,  // previousWaveformCanvas
  hiddenCanvas,  // currentWaveformCanvas
  hiddenCanvas,  // similarityPlotCanvas
  hiddenCanvas   // frameBufferCanvas
);

// デバッグオーバーレイを無効化（シンプルな表示にするため）
oscilloscope.setDebugOverlaysEnabled(false);

// 周波数とゲイン表示の更新
let updateInterval = null;

function startUpdates() {
  updateInterval = setInterval(() => {
    const freq = oscilloscope.getEstimatedFrequency();
    frequencyElement.textContent = freq > 0 ? `${freq.toFixed(1)} Hz` : '--- Hz';
    
    const gain = oscilloscope.getCurrentGain();
    gainElement.textContent = `${gain.toFixed(2)}x`;
  }, 100);
}

function stopUpdates() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
  frequencyElement.textContent = '--- Hz';
  gainElement.textContent = '---x';
}

// 波形データを生成する関数
function generateWaveform(type, sampleRate = 44100, duration = 1) {
  const audioData = new Float32Array(sampleRate * duration);
  const len = audioData.length;
  
  switch(type) {
    case '440':
      // 440Hz サイン波
      for (let i = 0; i < len; i++) {
        audioData[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate);
      }
      break;
    case '880':
      // 880Hz サイン波
      for (let i = 0; i < len; i++) {
        audioData[i] = Math.sin(2 * Math.PI * 880 * i / sampleRate);
      }
      break;
    case '220':
      // 220Hz サイン波
      for (let i = 0; i < len; i++) {
        audioData[i] = Math.sin(2 * Math.PI * 220 * i / sampleRate);
      }
      break;
    case 'complex':
      // 複合波形（440Hz + 880Hz）
      for (let i = 0; i < len; i++) {
        audioData[i] = 0.5 * Math.sin(2 * Math.PI * 440 * i / sampleRate) +
                      0.3 * Math.sin(2 * Math.PI * 880 * i / sampleRate);
      }
      break;
  }
  
  return audioData;
}

// 開始処理を実行する関数
async function startOscilloscope() {
  try {
    startBtn.disabled = true;
    statusElement.textContent = '初期化中...';
    
    // 選択された波形タイプを取得
    const selectedElement = document.querySelector('input[name="waveform"]:checked');
    if (!selectedElement) {
      throw new Error('波形が選択されていません');
    }
    const selectedWaveform = selectedElement.value;
    
    // 波形データを生成
    const sampleRate = 44100;
    const audioData = generateWaveform(selectedWaveform, sampleRate, 1);
    
    // BufferSourceを作成してループ再生
    const bufferSource = new BufferSource(audioData, sampleRate, { loop: true });
    
    // 可視化を開始
    await oscilloscope.startFromBuffer(bufferSource);
    
    statusElement.textContent = '実行中';
    stopBtn.disabled = false;
    startUpdates();
    
    // ラジオボタンを無効化（実行中は変更不可）
    waveformRadios.forEach(radio => radio.disabled = true);
  } catch (error) {
    console.error('Failed to start oscilloscope:', error);
    statusElement.textContent = 'エラー';
    startBtn.disabled = false;
  }
}

// 開始ボタン
startBtn.addEventListener('click', startOscilloscope);

// 停止ボタン
stopBtn.addEventListener('click', async () => {
  try {
    await oscilloscope.stop();
    
    statusElement.textContent = '停止';
    startBtn.disabled = false;
    stopBtn.disabled = true;
    stopUpdates();
    
    // ラジオボタンを有効化
    waveformRadios.forEach(radio => radio.disabled = false);
  } catch (error) {
    console.error('Failed to stop oscilloscope:', error);
  }
});

// ページロード時に自動的に440Hzで開始（デバッグ用）
// DOMContentLoadedイベントが既に発火している可能性を考慮
if (document.readyState === 'loading') {
  // まだDOMがロード中の場合はイベントリスナーを設定
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Auto-starting oscilloscope with 440Hz...');
    startOscilloscope();
  });
} else {
  // DOMが既にロード済みの場合は即座に実行
  console.log('Auto-starting oscilloscope with 440Hz...');
  startOscilloscope();
}
