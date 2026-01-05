import { Oscilloscope } from './Oscilloscope';
import { dbToAmplitude } from './utils';

// Main application logic
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const startButton = document.getElementById('startButton') as HTMLButtonElement;
const loadFileButton = document.getElementById('loadFileButton') as HTMLButtonElement;
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const autoGainCheckbox = document.getElementById('autoGainCheckbox') as HTMLInputElement;
const noiseGateCheckbox = document.getElementById('noiseGateCheckbox') as HTMLInputElement;
const fftDisplayCheckbox = document.getElementById('fftDisplayCheckbox') as HTMLInputElement;
const usePeakModeCheckbox = document.getElementById('usePeakModeCheckbox') as HTMLInputElement;
const pauseDrawingCheckbox = document.getElementById('pauseDrawingCheckbox') as HTMLInputElement;
const noiseGateThreshold = document.getElementById('noiseGateThreshold') as HTMLInputElement;
const thresholdValue = document.getElementById('thresholdValue') as HTMLSpanElement;
const statusElement = document.getElementById('status') as HTMLSpanElement;
const frequencyMethod = document.getElementById('frequencyMethod') as HTMLSelectElement;
const frequencyValue = document.getElementById('frequencyValue') as HTMLSpanElement;
const gainValue = document.getElementById('gainValue') as HTMLSpanElement;
const similarityValue = document.getElementById('similarityValue') as HTMLSpanElement;

// Validate all required DOM elements
const requiredElements = [
  { element: canvas, name: 'canvas' },
  { element: startButton, name: 'startButton' },
  { element: loadFileButton, name: 'loadFileButton' },
  { element: fileInput, name: 'fileInput' },
  { element: autoGainCheckbox, name: 'autoGainCheckbox' },
  { element: noiseGateCheckbox, name: 'noiseGateCheckbox' },
  { element: fftDisplayCheckbox, name: 'fftDisplayCheckbox' },
  { element: usePeakModeCheckbox, name: 'usePeakModeCheckbox' },
  { element: pauseDrawingCheckbox, name: 'pauseDrawingCheckbox' },
  { element: noiseGateThreshold, name: 'noiseGateThreshold' },
  { element: thresholdValue, name: 'thresholdValue' },
  { element: statusElement, name: 'status' },
  { element: frequencyMethod, name: 'frequencyMethod' },
  { element: frequencyValue, name: 'frequencyValue' },
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

const oscilloscope = new Oscilloscope(canvas);

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

// Noise gate threshold slider handler
noiseGateThreshold.addEventListener('input', () => {
  const threshold = sliderValueToThreshold(noiseGateThreshold.value);
  oscilloscope.setNoiseGateThreshold(threshold.amplitude);
  thresholdValue.textContent = formatThresholdDisplay(threshold.db, threshold.amplitude);
});

// Frequency estimation method selector handler
frequencyMethod.addEventListener('change', () => {
  const method = frequencyMethod.value as 'zero-crossing' | 'autocorrelation' | 'fft';
  oscilloscope.setFrequencyEstimationMethod(method);
});

// Update frequency display periodically
let frequencyUpdateInterval: number | null = null;

function startFrequencyDisplay(): void {
  if (frequencyUpdateInterval === null) {
    frequencyUpdateInterval = window.setInterval(() => {
      const frequency = oscilloscope.getEstimatedFrequency();
      if (frequency > 0) {
        frequencyValue.textContent = `${frequency.toFixed(1)} Hz`;
      } else {
        frequencyValue.textContent = '--- Hz';
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
    gainValue.textContent = '---x';
    similarityValue.textContent = '---';
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
