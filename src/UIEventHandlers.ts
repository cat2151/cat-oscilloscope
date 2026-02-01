import { Oscilloscope } from './Oscilloscope';
import { DOMElementManager } from './DOMElementManager';
import { DisplayUpdater } from './DisplayUpdater';
import { dbToAmplitude } from './utils';

/**
 * UIEventHandlers - Responsible for setting up and handling UI events
 * 
 * This class follows the Single Responsibility Principle by having one clear purpose:
 * setting up and managing all UI event handlers.
 */
export class UIEventHandlers {
  private oscilloscope: Oscilloscope;
  private dom: DOMElementManager;
  private displayUpdater: DisplayUpdater;

  constructor(
    oscilloscope: Oscilloscope,
    dom: DOMElementManager,
    displayUpdater: DisplayUpdater
  ) {
    this.oscilloscope = oscilloscope;
    this.dom = dom;
    this.displayUpdater = displayUpdater;
  }

  /**
   * Set up all UI event handlers
   */
  setupEventHandlers(): void {
    this.setupCheckboxHandlers();
    this.setupSliderHandlers();
    this.setupSelectHandlers();
    this.setupButtonHandlers();
    this.setupFileInputHandler();
  }

  /**
   * Initialize UI state to match oscilloscope configuration
   */
  initializeUIState(): void {
    // Synchronize checkbox state with oscilloscope
    this.oscilloscope.setAutoGain(this.dom.autoGainCheckbox.checked);
    this.oscilloscope.setNoiseGate(this.dom.noiseGateCheckbox.checked);
    this.oscilloscope.setFFTDisplay(this.dom.fftDisplayCheckbox.checked);
    this.oscilloscope.setHarmonicAnalysisEnabled(this.dom.harmonicAnalysisCheckbox.checked);
    this.oscilloscope.setPauseDrawing(this.dom.pauseDrawingCheckbox.checked);
    this.oscilloscope.setPhaseMarkerRangeEnabled(this.dom.phaseMarkerRangeCheckbox.checked);

    // Synchronize noise gate threshold
    const initialThreshold = this.sliderValueToThreshold(this.dom.noiseGateThreshold.value);
    this.oscilloscope.setNoiseGateThreshold(initialThreshold.amplitude);
    this.dom.thresholdValue.textContent = this.formatThresholdDisplay(initialThreshold.db, initialThreshold.amplitude);

    // Synchronize zero-cross mode
    const initialZeroCrossMode = this.dom.zeroCrossMode.value;
    const validModes = ['standard', 'peak-backtrack-history', 'bidirectional-nearest', 'gradient-based', 'adaptive-step', 'hysteresis', 'closest-to-zero'];
    if (validModes.includes(initialZeroCrossMode)) {
      this.oscilloscope.setZeroCrossMode(initialZeroCrossMode as any);
    }

    // Set initial focus to start button (allows starting with space key)
    this.dom.startButton.focus();
  }

  /**
   * Set up checkbox event handlers
   */
  private setupCheckboxHandlers(): void {
    // Auto gain checkbox
    this.dom.autoGainCheckbox.addEventListener('change', () => {
      this.oscilloscope.setAutoGain(this.dom.autoGainCheckbox.checked);
    });

    // Noise gate checkbox
    this.dom.noiseGateCheckbox.addEventListener('change', () => {
      this.oscilloscope.setNoiseGate(this.dom.noiseGateCheckbox.checked);
    });

    // FFT display checkbox
    this.dom.fftDisplayCheckbox.addEventListener('change', () => {
      this.oscilloscope.setFFTDisplay(this.dom.fftDisplayCheckbox.checked);
    });

    // Harmonic analysis checkbox
    this.dom.harmonicAnalysisCheckbox.addEventListener('change', () => {
      this.oscilloscope.setHarmonicAnalysisEnabled(this.dom.harmonicAnalysisCheckbox.checked);
    });

    // Pause drawing checkbox
    this.dom.pauseDrawingCheckbox.addEventListener('change', () => {
      this.oscilloscope.setPauseDrawing(this.dom.pauseDrawingCheckbox.checked);
    });

    // Phase marker range checkbox
    this.dom.phaseMarkerRangeCheckbox.addEventListener('change', () => {
      this.oscilloscope.setPhaseMarkerRangeEnabled(this.dom.phaseMarkerRangeCheckbox.checked);
    });
  }

  /**
   * Set up slider event handlers
   */
  private setupSliderHandlers(): void {
    // Noise gate threshold slider
    this.dom.noiseGateThreshold.addEventListener('input', () => {
      const threshold = this.sliderValueToThreshold(this.dom.noiseGateThreshold.value);
      this.oscilloscope.setNoiseGateThreshold(threshold.amplitude);
      this.dom.thresholdValue.textContent = this.formatThresholdDisplay(threshold.db, threshold.amplitude);
    });
  }

  /**
   * Set up select element event handlers
   */
  private setupSelectHandlers(): void {
    // Frequency estimation method selector
    this.dom.frequencyMethod.addEventListener('change', () => {
      const method = this.dom.frequencyMethod.value as 'zero-crossing' | 'autocorrelation' | 'fft' | 'stft' | 'cqt';
      this.oscilloscope.setFrequencyEstimationMethod(method);
    });

    // Buffer size multiplier selector
    this.dom.bufferSizeMultiplier.addEventListener('change', () => {
      const value = parseInt(this.dom.bufferSizeMultiplier.value, 10);
      if (value === 1 || value === 4 || value === 16) {
        this.oscilloscope.setBufferSizeMultiplier(value);
      } else {
        console.error('Invalid buffer size multiplier:', value);
        // Reset to default
        this.dom.bufferSizeMultiplier.value = '1';
        this.oscilloscope.setBufferSizeMultiplier(1);
      }
    });

    // Zero-cross mode selector
    this.dom.zeroCrossMode.addEventListener('change', () => {
      const mode = this.dom.zeroCrossMode.value;
      const validModes = ['standard', 'peak-backtrack-history', 'bidirectional-nearest', 'gradient-based', 'adaptive-step', 'hysteresis', 'closest-to-zero'];
      if (validModes.includes(mode)) {
        this.oscilloscope.setZeroCrossMode(mode as any);
      } else {
        console.error('Invalid zero-cross mode:', mode);
        // Reset to default
        this.dom.zeroCrossMode.value = 'hysteresis';
        this.oscilloscope.setZeroCrossMode('hysteresis');
      }
    });
  }

  /**
   * Set up button event handlers
   */
  private setupButtonHandlers(): void {
    // Start button
    this.dom.startButton.addEventListener('click', async () => {
      await this.handleStartStopButton();
    });

    // Load file button
    this.dom.loadFileButton.addEventListener('click', () => {
      this.dom.fileInput.click();
    });
  }

  /**
   * Set up file input event handler
   */
  private setupFileInputHandler(): void {
    this.dom.fileInput.addEventListener('change', async () => {
      await this.handleFileInput();
    });
  }

  /**
   * Handle start/stop button click
   */
  private async handleStartStopButton(): Promise<void> {
    if (!this.oscilloscope.getIsRunning()) {
      try {
        this.dom.startButton.disabled = true;
        this.dom.loadFileButton.disabled = true;
        this.dom.statusElement.textContent = 'Requesting microphone access...';
        
        await this.oscilloscope.start();
        
        this.dom.startButton.textContent = 'Stop';
        this.dom.startButton.disabled = false;
        this.dom.statusElement.textContent = 'Running - Microphone active';
        this.displayUpdater.start();
      } catch (error) {
        console.error('Failed to start oscilloscope:', error);
        this.dom.statusElement.textContent = 'Error: Could not access microphone';
        this.dom.startButton.disabled = false;
        this.dom.loadFileButton.disabled = false;
      }
    } else {
      try {
        this.displayUpdater.stop();
        await this.oscilloscope.stop();
        this.dom.startButton.textContent = 'Start';
        this.dom.loadFileButton.disabled = false;
        this.dom.statusElement.textContent = 'Stopped';
      } catch (error) {
        console.error('Failed to stop oscilloscope:', error);
        this.dom.statusElement.textContent = 'Stopped (with errors)';
        this.dom.startButton.textContent = 'Start';
        this.dom.loadFileButton.disabled = false;
      }
    }
  }

  /**
   * Handle file input change
   */
  private async handleFileInput(): Promise<void> {
    const file = this.dom.fileInput.files?.[0];
    if (!file) {
      return;
    }
    
    // Stop if already running
    if (this.oscilloscope.getIsRunning()) {
      this.displayUpdater.stop();
      await this.oscilloscope.stop();
    }
    
    try {
      this.dom.startButton.disabled = true;
      this.dom.loadFileButton.disabled = true;
      this.dom.statusElement.textContent = `Loading file: ${file.name}...`;
      
      await this.oscilloscope.startFromFile(file);
      
      this.dom.startButton.textContent = 'Stop';
      this.dom.startButton.disabled = false;
      this.dom.statusElement.textContent = `Playing: ${file.name} (loop)`;
      this.displayUpdater.start();
    } catch (error) {
      console.error('Failed to load audio file:', error);
      this.dom.statusElement.textContent = 'Error: Could not load audio file';
      this.dom.startButton.textContent = 'Start';
      this.dom.startButton.disabled = false;
      this.dom.loadFileButton.disabled = false;
    }
    
    // Clear file input to allow loading the same file again
    this.dom.fileInput.value = '';
  }

  /**
   * Convert slider value (-60 to 0) to threshold amplitude (0.001-1.00)
   * Returns both dB and amplitude to avoid redundant parsing
   */
  private sliderValueToThreshold(sliderValue: string): { db: number; amplitude: number } {
    const db = parseFloat(sliderValue);
    
    if (Number.isNaN(db)) {
      throw new Error(`Invalid slider value for noise gate threshold: "${sliderValue}"`);
    }
    
    return { db, amplitude: dbToAmplitude(db) };
  }

  /**
   * Format threshold display text
   */
  private formatThresholdDisplay(db: number, amplitude: number): string {
    return `${db.toFixed(0)} dB (${amplitude.toFixed(3)})`;
  }
}
