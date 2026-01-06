import { AudioManager } from './AudioManager';
import { GainController } from './GainController';
import { FrequencyEstimator } from './FrequencyEstimator';
import { WaveformRenderer } from './WaveformRenderer';
import { ZeroCrossDetector } from './ZeroCrossDetector';
import { WaveformSearcher } from './WaveformSearcher';
import { ComparisonPanelRenderer } from './ComparisonPanelRenderer';
import { WaveformDataProcessor } from './WaveformDataProcessor';
import { WasmDataProcessor } from './WasmDataProcessor';
import { WaveformRenderData } from './WaveformRenderData';

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
 * - WaveformDataProcessor: Data generation and processing (separated from rendering)
 * - WasmDataProcessor: WASM implementation of data processing (can be toggled)
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
  private wasmDataProcessor: WasmDataProcessor | null = null;
  private useWasm = false;
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
    this.dataProcessor = new WaveformDataProcessor(
      this.audioManager,
      this.gainController,
      this.frequencyEstimator,
      this.zeroCrossDetector,
      this.waveformSearcher
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
    if (this.wasmDataProcessor) {
      this.wasmDataProcessor.reset();
    }
  }

  private render(): void {
    if (!this.isRunning) {
      return;
    }

    // If paused, skip processing and drawing but continue the animation loop
    if (!this.isPaused) {
      // === DATA GENERATION PHASE ===
      // Process frame and generate all data needed for rendering
      // Use WASM processor if enabled, otherwise use TypeScript processor
      const processor = (this.useWasm && this.wasmDataProcessor) 
        ? this.wasmDataProcessor 
        : this.dataProcessor;
      
      const renderData = processor.processFrame(this.renderer.getFFTDisplayEnabled());
      
      if (renderData) {
        // === RENDERING PHASE ===
        // All rendering logic uses only the generated data
        this.renderFrame(renderData);
      }
    }

    // Continue rendering
    this.animationId = requestAnimationFrame(() => this.render());
  }

  /**
   * Render a single frame using pre-processed data
   * This method contains only rendering logic - no data processing
   */
  private renderFrame(renderData: WaveformRenderData): void {
    // Clear canvas and draw grid
    this.renderer.clearAndDrawGrid();

    // Draw waveform with calculated gain
    this.renderer.drawWaveform(
      renderData.waveformData,
      renderData.displayStartIndex,
      renderData.displayEndIndex,
      renderData.gain
    );

    // Draw alignment markers if available and not using similarity search
    if (!renderData.usedSimilaritySearch) {
      if (renderData.firstAlignmentPoint !== undefined) {
        this.renderer.drawZeroCrossLine(
          renderData.firstAlignmentPoint,
          renderData.displayStartIndex,
          renderData.displayEndIndex
        );
      }
      if (renderData.secondAlignmentPoint !== undefined) {
        this.renderer.drawZeroCrossLine(
          renderData.secondAlignmentPoint,
          renderData.displayStartIndex,
          renderData.displayEndIndex
        );
      }
    }

    // Draw FFT spectrum overlay if enabled and signal is above noise gate
    if (renderData.frequencyData && this.renderer.getFFTDisplayEnabled() && renderData.isSignalAboveNoiseGate) {
      this.renderer.drawFFTOverlay(
        renderData.frequencyData,
        renderData.estimatedFrequency,
        renderData.sampleRate,
        renderData.fftSize,
        renderData.maxFrequency
      );
    }

    // Update comparison panels
    this.comparisonRenderer.updatePanels(
      renderData.previousWaveform,
      renderData.waveformData,
      renderData.displayStartIndex,
      renderData.displayEndIndex,
      renderData.waveformData,
      renderData.similarity
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
  
  /**
   * Enable or disable WASM processing
   * @param enabled - Whether to use WASM implementation
   * @returns Promise that resolves when WASM is ready (if enabling)
   */
  async setUseWasm(enabled: boolean): Promise<void> {
    if (enabled && !this.wasmDataProcessor) {
      // Initialize WASM processor on first use
      this.wasmDataProcessor = new WasmDataProcessor(
        this.audioManager,
        this.gainController,
        this.frequencyEstimator,
        this.zeroCrossDetector,
        this.waveformSearcher
      );
      try {
        await this.wasmDataProcessor.initialize();
        this.useWasm = true;
      } catch (error) {
        console.error('Failed to initialize WASM processor:', error);
        this.wasmDataProcessor = null;
        this.useWasm = false;
        throw error;
      }
    } else if (enabled && this.wasmDataProcessor) {
      // WASM processor already initialized
      this.useWasm = true;
    } else {
      // Disable WASM
      this.useWasm = false;
    }
  }
  
  /**
   * Check if WASM processing is enabled
   */
  getUseWasm(): boolean {
    return this.useWasm;
  }
  
  /**
   * Check if WASM is available and initialized
   */
  isWasmAvailable(): boolean {
    return this.wasmDataProcessor !== null;
  }
}
