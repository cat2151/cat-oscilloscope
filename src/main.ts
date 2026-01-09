import { Oscilloscope } from './Oscilloscope';
import { dbToAmplitude, frequencyToNote } from './utils';
import { PianoKeyboardRenderer } from './PianoKeyboardRenderer';

// Main application logic
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const previousWaveformCanvas = document.getElementById('previousWaveformCanvas') as HTMLCanvasElement;
const currentWaveformCanvas = document.getElementById('currentWaveformCanvas') as HTMLCanvasElement;
const frameBufferCanvas = document.getElementById('frameBufferCanvas') as HTMLCanvasElement;
const pianoKeyboardCanvas = document.getElementById('pianoKeyboardCanvas') as HTMLCanvasElement;
const startButton = document.getElementById('startButton') as HTMLButtonElement;
const loadFileButton = document.getElementById('loadFileButton') as HTMLButtonElement;
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const autoGainCheckbox = document.getElementById('autoGainCheckbox') as HTMLInputElement;
const noiseGateCheckbox = document.getElementById('noiseGateCheckbox') as HTMLInputElement;
const fftDisplayCheckbox = document.getElementById('fftDisplayCheckbox') as HTMLInputElement;
const usePeakModeCheckbox = document.getElementById('usePeakModeCheckbox') as HTMLInputElement;
const pauseDrawingCheckbox = document.getElementById('pauseDrawingCheckbox') as HTMLInputElement;
const useWasmCheckbox = document.getElementById('useWasmCheckbox') as HTMLInputElement;
const noiseGateThreshold = document.getElementById('noiseGateThreshold') as HTMLInputElement;
const thresholdValue = document.getElementById('thresholdValue') as HTMLSpanElement;
const statusElement = document.getElementById('status') as HTMLSpanElement;
const frequencyMethod = document.getElementById('frequencyMethod') as HTMLSelectElement;
const bufferSizeMultiplier = document.getElementById('bufferSizeMultiplier') as HTMLSelectElement;
const frequencyValue = document.getElementById('frequencyValue') as HTMLSpanElement;
const noteValue = document.getElementById('noteValue') as HTMLSpanElement;
const gainValue = document.getElementById('gainValue') as HTMLSpanElement;
const similarityValue = document.getElementById('similarityValue') as HTMLSpanElement;

// Validate all required DOM elements
const requiredElements = [
  { element: canvas, name: 'canvas' },
  { element: previousWaveformCanvas, name: 'previousWaveformCanvas' },
  { element: currentWaveformCanvas, name: 'currentWaveformCanvas' },
  { element: frameBufferCanvas, name: 'frameBufferCanvas' },
  { element: pianoKeyboardCanvas, name: 'pianoKeyboardCanvas' },
  { element: startButton, name: 'startButton' },
  { element: loadFileButton, name: 'loadFileButton' },
  { element: fileInput, name: 'fileInput' },
  { element: autoGainCheckbox, name: 'autoGainCheckbox' },
  { element: noiseGateCheckbox, name: 'noiseGateCheckbox' },
  { element: fftDisplayCheckbox, name: 'fftDisplayCheckbox' },
  { element: usePeakModeCheckbox, name: 'usePeakModeCheckbox' },
  { element: pauseDrawingCheckbox, name: 'pauseDrawingCheckbox' },
  { element: useWasmCheckbox, name: 'useWasmCheckbox' },
  { element: noiseGateThreshold, name: 'noiseGateThreshold' },
  { element: thresholdValue, name: 'thresholdValue' },
  { element: statusElement, name: 'status' },
  { element: frequencyMethod, name: 'frequencyMethod' },
  { element: bufferSizeMultiplier, name: 'bufferSizeMultiplier' },
  { element: frequencyValue, name: 'frequencyValue' },
  { element: noteValue, name: 'noteValue' },
  { element: gainValue, name: 'gainValue' },
  { element: similarityValue, name: 'similarityValue' },
];

for (const { element, name } of requiredElements) {
  if (!element) {
    throw new Error(`Required DOM element not found: ${name}`);
  }
}

// Helper function to convert slider value (-60 to 0) to threshold amplitude (0.001-1.00)
// Returns both dB and amplitude to avoid redundant parsing
function sliderValueToThreshold(sliderValue: string): { db: number; amplitude: number } {
  const db = parseFloat(sliderValue);
  
  if (Number.isNaN(db)) {
    throw new Error(`Invalid slider value for noise gate threshold: "${sliderValue}"`);
  }
  
  return { db, amplitude: dbToAmplitude(db) };
}

// Helper function to format threshold display
function formatThresholdDisplay(db: number, amplitude: number): string {
  return `${db.toFixed(0)} dB (${amplitude.toFixed(3)})`;
}

const oscilloscope = new Oscilloscope(canvas, previousWaveformCanvas, currentWaveformCanvas, frameBufferCanvas);
const pianoKeyboardRenderer = new PianoKeyboardRenderer(pianoKeyboardCanvas);

// 初期状態で空の鍵盤を描画
pianoKeyboardRenderer.render(0);

// Synchronize checkbox state with oscilloscope's autoGainEnabled
oscilloscope.setAutoGain(autoGainCheckbox.checked);

// Synchronize noise gate controls
oscilloscope.setNoiseGate(noiseGateCheckbox.checked);
const initialThreshold = sliderValueToThreshold(noiseGateThreshold.value);
oscilloscope.setNoiseGateThreshold(initialThreshold.amplitude);
thresholdValue.textContent = formatThresholdDisplay(initialThreshold.db, initialThreshold.amplitude);

// Synchronize FFT display control
oscilloscope.setFFTDisplay(fftDisplayCheckbox.checked);

// Synchronize peak mode control
oscilloscope.setUsePeakMode(usePeakModeCheckbox.checked);

// Synchronize pause drawing control
oscilloscope.setPauseDrawing(pauseDrawingCheckbox.checked);

// Initialize WASM if checkbox is checked by default
if (useWasmCheckbox.checked) {
  (async () => {
    try {
      statusElement.textContent = 'Loading WASM...';
      await oscilloscope.setUseWasm(true);
      statusElement.textContent = 'WASM processor active';
    } catch (error) {
      console.error('Failed to initialize WASM on startup:', error);
      
      // Provide detailed error message based on error type
      let errorMessage = 'Error: Could not initialize WASM processor';
      if (error instanceof Error) {
        if (error.message.includes('not available')) {
          errorMessage = 'Error: WASM not supported in this environment';
        } else if (error.message.includes('timed out')) {
          errorMessage = 'Error: WASM loading timed out';
        } else if (error.message.includes('Failed to load')) {
          errorMessage = 'Error: Failed to load WASM module - check network connection';
        } else {
          errorMessage = `Error: WASM initialization failed - ${error.message}`;
        }
      }
      
      statusElement.textContent = errorMessage;
      useWasmCheckbox.checked = false;
    }
  })();
}

// Auto gain checkbox handler
autoGainCheckbox.addEventListener('change', () => {
  oscilloscope.setAutoGain(autoGainCheckbox.checked);
});

// Noise gate checkbox handler
noiseGateCheckbox.addEventListener('change', () => {
  oscilloscope.setNoiseGate(noiseGateCheckbox.checked);
});

// FFT display checkbox handler
fftDisplayCheckbox.addEventListener('change', () => {
  oscilloscope.setFFTDisplay(fftDisplayCheckbox.checked);
});

// Peak mode checkbox handler
usePeakModeCheckbox.addEventListener('change', () => {
  oscilloscope.setUsePeakMode(usePeakModeCheckbox.checked);
});

// Pause drawing checkbox handler
pauseDrawingCheckbox.addEventListener('change', () => {
  oscilloscope.setPauseDrawing(pauseDrawingCheckbox.checked);
});

// WASM checkbox handler
useWasmCheckbox.addEventListener('change', async () => {
  const shouldUseWasm = useWasmCheckbox.checked;
  try {
    useWasmCheckbox.disabled = true;
    statusElement.textContent = shouldUseWasm ? 'Loading WASM...' : 'Disabling WASM...';
    
    await oscilloscope.setUseWasm(shouldUseWasm);
    
    statusElement.textContent = shouldUseWasm 
      ? 'WASM processor active' 
      : (oscilloscope.getIsRunning() ? 'Running - TypeScript processor' : 'Stopped');
  } catch (error) {
    console.error('Failed to toggle WASM:', error);
    statusElement.textContent = 'Error: Could not initialize WASM processor';
    useWasmCheckbox.checked = false;
  } finally {
    useWasmCheckbox.disabled = false;
  }
});

// Noise gate threshold slider handler
noiseGateThreshold.addEventListener('input', () => {
  const threshold = sliderValueToThreshold(noiseGateThreshold.value);
  oscilloscope.setNoiseGateThreshold(threshold.amplitude);
  thresholdValue.textContent = formatThresholdDisplay(threshold.db, threshold.amplitude);
});

// Frequency estimation method selector handler
frequencyMethod.addEventListener('change', () => {
  const method = frequencyMethod.value as 'zero-crossing' | 'autocorrelation' | 'fft' | 'stft' | 'cqt';
  oscilloscope.setFrequencyEstimationMethod(method);
});

// Buffer size multiplier selector handler
bufferSizeMultiplier.addEventListener('change', () => {
  const value = parseInt(bufferSizeMultiplier.value, 10);
  if (value === 1 || value === 4 || value === 16) {
    oscilloscope.setBufferSizeMultiplier(value);
  } else {
    console.error('Invalid buffer size multiplier:', value);
    // Reset to default
    bufferSizeMultiplier.value = '1';
    oscilloscope.setBufferSizeMultiplier(1);
  }
});

// Update frequency display periodically
let frequencyUpdateInterval: number | null = null;

function startFrequencyDisplay(): void {
  if (frequencyUpdateInterval === null) {
    frequencyUpdateInterval = window.setInterval(() => {
      const frequency = oscilloscope.getEstimatedFrequency();
      if (frequency > 0) {
        frequencyValue.textContent = `${frequency.toFixed(1)} Hz`;
        
        // Update note display
        const noteInfo = frequencyToNote(frequency);
        if (noteInfo) {
          const centsSign = noteInfo.cents >= 0 ? '+' : '';
          noteValue.textContent = `${noteInfo.noteName}${centsSign}${noteInfo.cents}cent`;
        } else {
          noteValue.textContent = '---';
        }
        
        // Update piano keyboard
        pianoKeyboardRenderer.render(frequency);
      } else {
        frequencyValue.textContent = '--- Hz';
        noteValue.textContent = '---';
        pianoKeyboardRenderer.render(0);
      }
      
      // Update gain display
      const gain = oscilloscope.getCurrentGain();
      gainValue.textContent = `${gain.toFixed(2)}x`;
      
      // Update similarity display - show value if similarity search is active
      if (oscilloscope.isSimilaritySearchActive()) {
        const similarity = oscilloscope.getSimilarityScore();
        similarityValue.textContent = similarity.toFixed(3);
      } else {
        similarityValue.textContent = '---';
      }
    }, 100); // Update every 100ms (10 Hz)
  }
}

function stopFrequencyDisplay(): void {
  if (frequencyUpdateInterval !== null) {
    clearInterval(frequencyUpdateInterval);
    frequencyUpdateInterval = null;
    frequencyValue.textContent = '--- Hz';
    noteValue.textContent = '---';
    gainValue.textContent = '---x';
    similarityValue.textContent = '---';
    pianoKeyboardRenderer.clear();
  }
}

startButton.addEventListener('click', async () => {
  if (!oscilloscope.getIsRunning()) {
    try {
      startButton.disabled = true;
      loadFileButton.disabled = true;
      statusElement.textContent = 'Requesting microphone access...';
      
      await oscilloscope.start();
      
      startButton.textContent = 'Stop';
      startButton.disabled = false;
      statusElement.textContent = 'Running - Microphone active';
      startFrequencyDisplay();
    } catch (error) {
      console.error('Failed to start oscilloscope:', error);
      statusElement.textContent = 'Error: Could not access microphone';
      startButton.disabled = false;
      loadFileButton.disabled = false;
    }
  } else {
    try {
      stopFrequencyDisplay();
      await oscilloscope.stop();
      startButton.textContent = 'Start';
      loadFileButton.disabled = false;
      statusElement.textContent = 'Stopped';
    } catch (error) {
      console.error('Failed to stop oscilloscope:', error);
      statusElement.textContent = 'Stopped (with errors)';
      startButton.textContent = 'Start';
      loadFileButton.disabled = false;
    }
  }
});

// Load file button handler
loadFileButton.addEventListener('click', () => {
  fileInput.click();
});

// File input handler
fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  if (!file) {
    return;
  }
  
  // Stop if already running
  if (oscilloscope.getIsRunning()) {
    stopFrequencyDisplay();
    await oscilloscope.stop();
  }
  
  try {
    startButton.disabled = true;
    loadFileButton.disabled = true;
    statusElement.textContent = `Loading file: ${file.name}...`;
    
    await oscilloscope.startFromFile(file);
    
    startButton.textContent = 'Stop';
    startButton.disabled = false;
    statusElement.textContent = `Playing: ${file.name} (loop)`;
    startFrequencyDisplay();
  } catch (error) {
    console.error('Failed to load audio file:', error);
    statusElement.textContent = 'Error: Could not load audio file';
    startButton.textContent = 'Start';
    startButton.disabled = false;
    loadFileButton.disabled = false;
  }
  
  // Clear file input to allow loading the same file again
  fileInput.value = '';
});
