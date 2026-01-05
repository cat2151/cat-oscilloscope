import { AudioManager } from './AudioManager';
import { GainController } from './GainController';
import { FrequencyEstimator } from './FrequencyEstimator';
import { WaveformRenderer } from './WaveformRenderer';
import { ZeroCrossDetector } from './ZeroCrossDetector';

/**
 * Oscilloscope class - Main coordinator for the oscilloscope functionality
 * Delegates responsibilities to specialized modules:
 * - AudioManager: Web Audio API integration
 * - GainController: Auto-gain and noise gate
 * - FrequencyEstimator: Frequency detection algorithms
 * - WaveformRenderer: Canvas rendering
 * - ZeroCrossDetector: Zero-crossing detection and display range calculation
 */
export class Oscilloscope {
  private audioManager: AudioManager;
  private gainController: GainController;
  private frequencyEstimator: FrequencyEstimator;
  private renderer: WaveformRenderer;
  private zeroCrossDetector: ZeroCrossDetector;
  private animationId: number | null = null;
  private isRunning = false;
  private isPaused = false;

  constructor(canvas: HTMLCanvasElement) {
    this.audioManager = new AudioManager();
    this.gainController = new GainController();
    this.frequencyEstimator = new FrequencyEstimator();
    this.renderer = new WaveformRenderer(canvas);
    this.zeroCrossDetector = new ZeroCrossDetector();
  }

  async start(): Promise<void> {
    try {
      await this.audioManager.start();
      this.isRunning = true;
      this.render();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  async startFromFile(file: File): Promise<void> {
    try {
      await this.audioManager.startFromFile(file);
      this.isRunning = true;
      this.render();
    } catch (error) {
      console.error('Error loading audio file:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    await this.audioManager.stop();
    this.frequencyEstimator.clearHistory();
    this.zeroCrossDetector.reset();
  }

  private render(): void {
    if (!this.isRunning || !this.audioManager.isReady()) {
      return;
    }

    // If paused, skip drawing but continue the animation loop
    if (!this.isPaused) {
      // Get waveform data
      const dataArray = this.audioManager.getTimeDomainData();
      if (!dataArray) {
        // Continue animation loop even if no data available
        this.animationId = requestAnimationFrame(() => this.render());
        return;
      }

      // Apply noise gate to input signal (modifies dataArray in place)
      this.gainController.applyNoiseGate(dataArray);

      // Check if signal passed noise gate for FFT frequency estimation
      const isSignalAboveNoiseGate = this.gainController.isSignalAboveNoiseGate(dataArray);

      const sampleRate = this.audioManager.getSampleRate();
      const fftSize = this.audioManager.getFFTSize();

      // Only fetch frequency data if needed (FFT method OR FFT display enabled)
      const needsFrequencyData = this.frequencyEstimator.getFrequencyEstimationMethod() === 'fft' || this.renderer.getFFTDisplayEnabled();
      const frequencyData = needsFrequencyData ? this.audioManager.getFrequencyData() : null;

      // Estimate frequency (now works on gated signal)
      const estimatedFrequency = this.frequencyEstimator.estimateFrequency(
        dataArray,
        frequencyData,
        sampleRate,
        fftSize,
        isSignalAboveNoiseGate
      );

      // Clear canvas and draw grid
      this.renderer.clearAndDrawGrid();

      // Calculate display range and draw waveform with zero-cross indicators
      const displayRange = this.zeroCrossDetector.calculateDisplayRange(
        dataArray,
        estimatedFrequency,
        sampleRate
      );
      
      if (displayRange) {
        // Calculate auto gain before drawing
        this.gainController.calculateAutoGain(dataArray, displayRange.startIndex, displayRange.endIndex);
        const gain = this.gainController.getCurrentGain();
        
        this.renderer.drawWaveform(dataArray, displayRange.startIndex, displayRange.endIndex, gain);
        this.renderer.drawZeroCrossLine(displayRange.firstZeroCross, displayRange.startIndex, displayRange.endIndex);
        if (displayRange.secondZeroCross !== undefined) {
          this.renderer.drawZeroCrossLine(displayRange.secondZeroCross, displayRange.startIndex, displayRange.endIndex);
        }
      } else {
        // No zero-cross found, draw entire buffer
        this.gainController.calculateAutoGain(dataArray, 0, dataArray.length);
        const gain = this.gainController.getCurrentGain();
        this.renderer.drawWaveform(dataArray, 0, dataArray.length, gain);
      }

      // Draw FFT spectrum overlay if enabled and signal is above noise gate
      if (frequencyData && this.renderer.getFFTDisplayEnabled() && isSignalAboveNoiseGate) {
        this.renderer.drawFFTOverlay(
          frequencyData,
          estimatedFrequency,
          sampleRate,
          fftSize,
          this.frequencyEstimator.getMaxFrequency()
        );
      }
    }

    // Continue rendering
    this.animationId = requestAnimationFrame(() => this.render());
  }

  // Getters and setters - delegate to appropriate modules
  getIsRunning(): boolean {
    return this.isRunning;
  }

  setAutoGain(enabled: boolean): void {
    this.gainController.setAutoGain(enabled);
  }

  getAutoGainEnabled(): boolean {
    return this.gainController.getAutoGainEnabled();
  }

  setNoiseGate(enabled: boolean): void {
    this.gainController.setNoiseGate(enabled);
  }

  getNoiseGateEnabled(): boolean {
    return this.gainController.getNoiseGateEnabled();
  }

  setNoiseGateThreshold(threshold: number): void {
    this.gainController.setNoiseGateThreshold(threshold);
  }

  getNoiseGateThreshold(): number {
    return this.gainController.getNoiseGateThreshold();
  }

  setFrequencyEstimationMethod(method: 'zero-crossing' | 'autocorrelation' | 'fft'): void {
    this.frequencyEstimator.setFrequencyEstimationMethod(method);
  }

  getFrequencyEstimationMethod(): string {
    return this.frequencyEstimator.getFrequencyEstimationMethod();
  }

  getEstimatedFrequency(): number {
    return this.frequencyEstimator.getEstimatedFrequency();
  }

  setFFTDisplay(enabled: boolean): void {
    this.renderer.setFFTDisplay(enabled);
  }

  getFFTDisplayEnabled(): boolean {
    return this.renderer.getFFTDisplayEnabled();
  }

  getCurrentGain(): number {
    return this.gainController.getCurrentGain();
  }
  
  setUsePeakMode(enabled: boolean): void {
    this.zeroCrossDetector.setUsePeakMode(enabled);
  }

  getUsePeakMode(): boolean {
    return this.zeroCrossDetector.getUsePeakMode();
  }
  
  setPauseDrawing(paused: boolean): void {
    this.isPaused = paused;
  }

  getPauseDrawing(): boolean {
    return this.isPaused;
  }
}
