import { AudioManager } from './AudioManager';
import { GainController } from './GainController';
import { FrequencyEstimator } from './FrequencyEstimator';
import { WaveformRenderer } from './WaveformRenderer';
import { ZeroCrossDetector } from './ZeroCrossDetector';
import { WaveformSearcher } from './WaveformSearcher';
import { ComparisonPanelRenderer } from './ComparisonPanelRenderer';

/**
 * Oscilloscope class - Main coordinator for the oscilloscope functionality
 * Delegates responsibilities to specialized modules:
 * - AudioManager: Web Audio API integration
 * - GainController: Auto-gain and noise gate
 * - FrequencyEstimator: Frequency detection algorithms
 * - WaveformRenderer: Canvas rendering
 * - ZeroCrossDetector: Zero-crossing detection and display range calculation
 * - WaveformSearcher: Waveform similarity search
 * - ComparisonPanelRenderer: Comparison panel rendering
 */
export class Oscilloscope {
  private audioManager: AudioManager;
  private gainController: GainController;
  private frequencyEstimator: FrequencyEstimator;
  private renderer: WaveformRenderer;
  private zeroCrossDetector: ZeroCrossDetector;
  private waveformSearcher: WaveformSearcher;
  private comparisonRenderer: ComparisonPanelRenderer;
  private animationId: number | null = null;
  private isRunning = false;
  private isPaused = false;

  /**
   * Create a new Oscilloscope instance
   * @param canvas - Main oscilloscope display canvas (recommended: 800x400px)
   * @param previousWaveformCanvas - Canvas for displaying previous frame's waveform (recommended: 250x150px)
   * @param currentWaveformCanvas - Canvas for displaying current frame's waveform with similarity score (recommended: 250x150px)
   * @param frameBufferCanvas - Canvas for displaying full frame buffer with position markers (recommended: 250x150px)
   */
  constructor(
    canvas: HTMLCanvasElement,
    previousWaveformCanvas: HTMLCanvasElement,
    currentWaveformCanvas: HTMLCanvasElement,
    frameBufferCanvas: HTMLCanvasElement
  ) {
    this.audioManager = new AudioManager();
    this.gainController = new GainController();
    this.frequencyEstimator = new FrequencyEstimator();
    this.renderer = new WaveformRenderer(canvas);
    this.zeroCrossDetector = new ZeroCrossDetector();
    this.waveformSearcher = new WaveformSearcher();
    this.comparisonRenderer = new ComparisonPanelRenderer(
      previousWaveformCanvas,
      currentWaveformCanvas,
      frameBufferCanvas
    );
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
    this.waveformSearcher.reset();
    this.comparisonRenderer.clear();
  }

  /**
   * Calculate cycle length from estimated frequency and sample rate
   */
  private calculateCycleLength(frequency: number, sampleRate: number): number {
    if (frequency > 0 && sampleRate > 0) {
      return sampleRate / frequency;
    }
    return 0;
  }

  /**
   * Store waveform for next frame's similarity comparison
   */
  private storeWaveformForNextFrame(data: Float32Array, startIndex: number, cycleLength: number): void {
    if (cycleLength > 0) {
      const waveformLength = Math.floor(cycleLength);
      const endIndex = Math.min(startIndex + waveformLength, data.length);
      this.waveformSearcher.storeWaveform(data, startIndex, endIndex);
    }
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

      // Calculate cycle length from estimated frequency
      const cycleLength = this.calculateCycleLength(estimatedFrequency, sampleRate);

      // Try to find similar waveform if we have a previous waveform and valid cycle length
      let displayStartIndex = 0;
      let displayEndIndex = dataArray.length;
      let useZeroCrossDetection = true;
      
      if (this.waveformSearcher.hasPreviousWaveform() && cycleLength > 0) {
        const searchResult = this.waveformSearcher.searchSimilarWaveform(dataArray, cycleLength);
        if (searchResult) {
          // Use similarity search result
          const waveformLength = Math.floor(cycleLength);
          displayStartIndex = searchResult.startIndex;
          displayEndIndex = Math.min(displayStartIndex + waveformLength, dataArray.length);
          useZeroCrossDetection = false;
        }
      }
      
      // Fallback to zero-cross detection if similarity search not available
      if (useZeroCrossDetection) {
        const displayRange = this.zeroCrossDetector.calculateDisplayRange(
          dataArray,
          estimatedFrequency,
          sampleRate
        );
        
        if (displayRange) {
          displayStartIndex = displayRange.startIndex;
          displayEndIndex = displayRange.endIndex;
          
          // Calculate auto gain before drawing
          this.gainController.calculateAutoGain(dataArray, displayStartIndex, displayEndIndex);
          const gain = this.gainController.getCurrentGain();
          
          this.renderer.drawWaveform(dataArray, displayStartIndex, displayEndIndex, gain);
          this.renderer.drawZeroCrossLine(displayRange.firstZeroCross, displayStartIndex, displayEndIndex);
          if (displayRange.secondZeroCross !== undefined) {
            this.renderer.drawZeroCrossLine(displayRange.secondZeroCross, displayStartIndex, displayEndIndex);
          }
          
          // Store waveform for next frame's comparison
          this.storeWaveformForNextFrame(dataArray, displayStartIndex, cycleLength);
        } else {
          // No zero-cross found, draw entire buffer
          this.gainController.calculateAutoGain(dataArray, 0, dataArray.length);
          const gain = this.gainController.getCurrentGain();
          this.renderer.drawWaveform(dataArray, 0, dataArray.length, gain);
          
          // Store waveform for next frame's comparison even when zero-cross fails
          this.storeWaveformForNextFrame(dataArray, 0, cycleLength);
        }
      } else {
        // Using similarity search result
        // Calculate auto gain before drawing
        this.gainController.calculateAutoGain(dataArray, displayStartIndex, displayEndIndex);
        const gain = this.gainController.getCurrentGain();
        
        this.renderer.drawWaveform(dataArray, displayStartIndex, displayEndIndex, gain);
        
        // Store waveform for next frame's comparison
        this.storeWaveformForNextFrame(dataArray, displayStartIndex, cycleLength);
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

      // Update comparison panels
      const previousWaveform = this.waveformSearcher.getPreviousWaveform();
      const similarity = this.waveformSearcher.getLastSimilarity();
      this.comparisonRenderer.updatePanels(
        previousWaveform,
        dataArray,
        displayStartIndex,
        displayEndIndex,
        dataArray,
        similarity
      );
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
  
  getSimilarityScore(): number {
    return this.waveformSearcher.getLastSimilarity();
  }
  
  isSimilaritySearchActive(): boolean {
    return this.waveformSearcher.hasPreviousWaveform();
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
