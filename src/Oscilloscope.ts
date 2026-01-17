import { AudioManager } from './AudioManager';
import { GainController } from './GainController';
import { FrequencyEstimator } from './FrequencyEstimator';
import { WaveformRenderer } from './WaveformRenderer';
import { ZeroCrossDetector } from './ZeroCrossDetector';
import { WaveformSearcher } from './WaveformSearcher';
import { ComparisonPanelRenderer } from './ComparisonPanelRenderer';
import { WaveformDataProcessor } from './WaveformDataProcessor';
import { WaveformRenderData } from './WaveformRenderData';
import { BufferSource } from './BufferSource';

/**
 * Oscilloscope class - Main coordinator for the oscilloscope functionality
 * Delegates responsibilities to specialized modules:
 * - AudioManager: Web Audio API integration
 * - GainController: Auto-gain and noise gate configuration
 * - FrequencyEstimator: Frequency detection configuration
 * - WaveformRenderer: Canvas rendering
 * - ZeroCrossDetector: Zero-crossing detection configuration
 * - WaveformSearcher: Waveform similarity search state
 * - ComparisonPanelRenderer: Comparison panel rendering
 * - WaveformDataProcessor: Data generation and processing (Rust WASM implementation)
 */
export class Oscilloscope {
  private audioManager: AudioManager;
  private gainController: GainController;
  private frequencyEstimator: FrequencyEstimator;
  private renderer: WaveformRenderer;
  private zeroCrossDetector: ZeroCrossDetector;
  private waveformSearcher: WaveformSearcher;
  private comparisonRenderer: ComparisonPanelRenderer;
  private dataProcessor: WaveformDataProcessor;
  private animationId: number | null = null;
  private isRunning = false;
  private isPaused = false;

  // Frame processing diagnostics
  private lastFrameTime = 0;
  private frameProcessingTimes: number[] = [];
  private readonly MAX_FRAME_TIMES = 100;
  private readonly TARGET_FRAME_TIME = 16.67; // 60fps target
  private readonly FPS_LOG_INTERVAL_FRAMES = 60; // Log FPS every 60 frames (approx. 1 second at 60fps)

  /**
   * Create a new Oscilloscope instance
   * @param canvas - Main oscilloscope display canvas (recommended: 800x350px)
   * @param previousWaveformCanvas - Canvas for displaying previous frame's waveform (recommended: 250x120px)
   * @param currentWaveformCanvas - Canvas for displaying current frame's waveform (recommended: 250x120px)
   * @param similarityPlotCanvas - Canvas for displaying similarity history plot (recommended: 250x120px)
   * @param frameBufferCanvas - Canvas for displaying full frame buffer with position markers (recommended: 800x120px)
   */
  constructor(
    canvas: HTMLCanvasElement,
    previousWaveformCanvas: HTMLCanvasElement,
    currentWaveformCanvas: HTMLCanvasElement,
    similarityPlotCanvas: HTMLCanvasElement,
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
      similarityPlotCanvas,
      frameBufferCanvas
    );
    this.dataProcessor = new WaveformDataProcessor(
      this.audioManager,
      this.gainController,
      this.frequencyEstimator,
      this.waveformSearcher
    );
  }

  async start(): Promise<void> {
    try {
      // Initialize WASM processor if not already initialized
      await this.dataProcessor.initialize();
      
      await this.audioManager.start();
      this.isRunning = true;
      this.render();
    } catch (error) {
      console.error('Error starting oscilloscope:', error);
      throw error;
    }
  }

  async startFromFile(file: File): Promise<void> {
    try {
      // Initialize WASM processor if not already initialized
      await this.dataProcessor.initialize();
      
      await this.audioManager.startFromFile(file);
      this.isRunning = true;
      this.render();
    } catch (error) {
      console.error('Error loading audio file:', error);
      throw error;
    }
  }

  /**
   * Start visualization from a static buffer without audio playback
   * Useful for visualizing pre-recorded audio data or processing results
   * @param bufferSource - BufferSource instance containing audio data
   */
  async startFromBuffer(bufferSource: BufferSource): Promise<void> {
    try {
      // Initialize WASM processor if not already initialized
      await this.dataProcessor.initialize();
      
      await this.audioManager.startFromBuffer(bufferSource);
      this.isRunning = true;
      this.render();
    } catch (error) {
      console.error('Error starting from buffer:', error);
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
    this.dataProcessor.reset();
  }

  private render(): void {
    if (!this.isRunning) {
      return;
    }

    const startTime = performance.now();

    // If paused, skip processing and drawing but continue the animation loop
    if (!this.isPaused) {
      // === DATA GENERATION PHASE ===
      // Process frame and generate all data needed for rendering using WASM processor
      const renderData = this.dataProcessor.processFrame(this.renderer.getFFTDisplayEnabled());
      
      if (renderData) {
        // === RENDERING PHASE ===
        // All rendering logic uses only the generated data
        this.renderFrame(renderData);
      }
    }

    // Measure frame processing time
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    this.frameProcessingTimes.push(processingTime);
    if (this.frameProcessingTimes.length > this.MAX_FRAME_TIMES) {
      this.frameProcessingTimes.shift();
    }

    // Warn if frame processing exceeds target (60fps)
    if (processingTime > this.TARGET_FRAME_TIME) {
      console.warn(`Frame processing time: ${processingTime.toFixed(2)}ms (target: <${this.TARGET_FRAME_TIME}ms)`);
    }

    // Calculate and log FPS periodically (every FPS_LOG_INTERVAL_FRAMES frames)
    if (this.lastFrameTime > 0) {
      const frameInterval = startTime - this.lastFrameTime;
      const currentFps = 1000 / frameInterval;
      
      if (this.frameProcessingTimes.length === this.FPS_LOG_INTERVAL_FRAMES) {
        const avgProcessingTime = this.frameProcessingTimes.reduce((a, b) => a + b, 0) / this.frameProcessingTimes.length;
        console.log(`FPS: ${currentFps.toFixed(1)}, Avg frame time: ${avgProcessingTime.toFixed(2)}ms`);
      }
    }
    this.lastFrameTime = startTime;

    // Continue rendering
    this.animationId = requestAnimationFrame(() => this.render());
  }

  /**
   * Render a single frame using pre-processed data
   * This method contains only rendering logic - no data processing
   */
  private renderFrame(renderData: WaveformRenderData): void {
    // Clear canvas and draw grid with measurement labels
    const displaySamples = renderData.displayEndIndex - renderData.displayStartIndex;
    this.renderer.clearAndDrawGrid(
      renderData.sampleRate,
      displaySamples,
      renderData.gain
    );

    // Draw waveform with calculated gain
    this.renderer.drawWaveform(
      renderData.waveformData,
      renderData.displayStartIndex,
      renderData.displayEndIndex,
      renderData.gain
    );

    // Draw phase markers
    this.renderer.drawPhaseMarkers(
      renderData.phaseZeroIndex,
      renderData.phaseTwoPiIndex,
      renderData.phaseMinusQuarterPiIndex,
      renderData.phaseTwoPiPlusQuarterPiIndex,
      renderData.displayStartIndex,
      renderData.displayEndIndex
    );

    // Draw FFT spectrum overlay if enabled and signal is above noise gate
    if (renderData.frequencyData && this.renderer.getFFTDisplayEnabled() && renderData.isSignalAboveNoiseGate) {
      this.renderer.drawFFTOverlay(
        renderData.frequencyData,
        renderData.estimatedFrequency,
        renderData.sampleRate,
        renderData.fftSize,
        renderData.maxFrequency
      );
      
      // Draw harmonic analysis overlay (only when FFT method is used and data is available)
      this.renderer.drawHarmonicAnalysis(
        renderData.halfFreqPeakStrengthPercent,
        renderData.candidate1Harmonics,
        renderData.candidate2Harmonics,
        renderData.selectionReason,
        renderData.estimatedFrequency
      );
    }

    // 右上に周波数プロットを描画
    this.renderer.drawFrequencyPlot(
      renderData.frequencyPlotHistory,
      this.frequencyEstimator.getMinFrequency(),
      this.frequencyEstimator.getMaxFrequency()
    );

    // Update comparison panels with similarity history
    this.comparisonRenderer.updatePanels(
      renderData.previousWaveform,
      renderData.waveformData,
      renderData.displayStartIndex,
      renderData.displayEndIndex,
      renderData.waveformData,
      renderData.similarity,
      renderData.similarityPlotHistory
    );
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

  setFrequencyEstimationMethod(method: 'zero-crossing' | 'autocorrelation' | 'fft' | 'stft' | 'cqt'): void {
    this.frequencyEstimator.setFrequencyEstimationMethod(method);
  }

  getFrequencyEstimationMethod(): string {
    return this.frequencyEstimator.getFrequencyEstimationMethod();
  }

  setBufferSizeMultiplier(multiplier: 1 | 4 | 16): void {
    this.frequencyEstimator.setBufferSizeMultiplier(multiplier);
  }

  getBufferSizeMultiplier(): 1 | 4 | 16 {
    return this.frequencyEstimator.getBufferSizeMultiplier();
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
