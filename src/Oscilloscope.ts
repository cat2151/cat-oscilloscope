import { AudioManager } from './AudioManager';
import { GainController } from './GainController';
import { FrequencyEstimator } from './FrequencyEstimator';
import { WaveformRenderer } from './WaveformRenderer';
import { ZeroCrossDetector } from './ZeroCrossDetector';
import { WaveformSearcher } from './WaveformSearcher';
import { ComparisonPanelRenderer } from './ComparisonPanelRenderer';
import { CycleSimilarityRenderer } from './CycleSimilarityRenderer';
import { WaveformDataProcessor } from './WaveformDataProcessor';
import { WaveformRenderData } from './WaveformRenderData';
import { BufferSource } from './BufferSource';
import { OverlaysLayoutConfig } from './OverlayLayout';

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
 * - CycleSimilarityRenderer: Cycle similarity graph rendering
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
  private cycleSimilarityRenderer: CycleSimilarityRenderer | null = null;
  private dataProcessor: WaveformDataProcessor;
  private animationId: number | null = null;
  private isRunning = false;
  private isPaused = false;
  private phaseMarkerRangeEnabled = true; // Default: on

  // Frame processing diagnostics
  private lastFrameTime = 0;
  private frameProcessingTimes: number[] = [];
  private readonly MAX_FRAME_TIMES = 100;
  private readonly TARGET_FRAME_TIME = 16.67; // 60fps target
  private readonly FPS_LOG_INTERVAL_FRAMES = 60; // Log FPS every 60 frames (approx. 1 second at 60fps)
  private enableDetailedTimingLogs = false; // Default: disabled to avoid performance impact

  /**
   * Create a new Oscilloscope instance
   * @param canvas - Main oscilloscope display canvas (recommended: 800x350px)
   * @param previousWaveformCanvas - Canvas for displaying previous frame's waveform (recommended: 250x120px)
   * @param currentWaveformCanvas - Canvas for displaying current frame's waveform (recommended: 250x120px)
   * @param similarityPlotCanvas - Canvas for displaying similarity history plot (recommended: 250x120px)
   * @param frameBufferCanvas - Canvas for displaying full frame buffer with position markers (recommended: 800x120px)
   * @param cycleSimilarity8divCanvas - Optional canvas for 8-division cycle similarity graph (recommended: 250x150px)
   * @param cycleSimilarity4divCanvas - Optional canvas for 4-division cycle similarity graph (recommended: 250x150px)
   * @param cycleSimilarity2divCanvas - Optional canvas for 2-division cycle similarity graph (recommended: 250x150px)
   * @param overlaysLayout - Optional layout configuration for debug overlays (FFT, harmonic analysis, frequency plot)
   */
  constructor(
    canvas: HTMLCanvasElement,
    previousWaveformCanvas: HTMLCanvasElement,
    currentWaveformCanvas: HTMLCanvasElement,
    similarityPlotCanvas: HTMLCanvasElement,
    frameBufferCanvas: HTMLCanvasElement,
    cycleSimilarity8divCanvas?: HTMLCanvasElement,
    cycleSimilarity4divCanvas?: HTMLCanvasElement,
    cycleSimilarity2divCanvas?: HTMLCanvasElement,
    overlaysLayout?: OverlaysLayoutConfig
  ) {
    this.audioManager = new AudioManager();
    this.gainController = new GainController();
    this.frequencyEstimator = new FrequencyEstimator();
    this.renderer = new WaveformRenderer(canvas, overlaysLayout);
    this.zeroCrossDetector = new ZeroCrossDetector();
    this.waveformSearcher = new WaveformSearcher();
    this.comparisonRenderer = new ComparisonPanelRenderer(
      previousWaveformCanvas,
      currentWaveformCanvas,
      similarityPlotCanvas,
      frameBufferCanvas
    );
    
    // Initialize cycle similarity renderer if canvases are provided
    if (cycleSimilarity8divCanvas && cycleSimilarity4divCanvas && cycleSimilarity2divCanvas) {
      this.cycleSimilarityRenderer = new CycleSimilarityRenderer(
        cycleSimilarity8divCanvas,
        cycleSimilarity4divCanvas,
        cycleSimilarity2divCanvas
      );
    }
    
    this.dataProcessor = new WaveformDataProcessor(
      this.audioManager,
      this.gainController,
      this.frequencyEstimator,
      this.waveformSearcher,
      this.zeroCrossDetector
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
    if (this.cycleSimilarityRenderer) {
      this.cycleSimilarityRenderer.clear();
    }
    this.dataProcessor.reset();
  }

  private render(): void {
    if (!this.isRunning) {
      return;
    }

    const startTime = performance.now();

    // If paused, skip processing and drawing but continue the animation loop
    if (!this.isPaused) {
      // Detailed timing measurements for issue #269 diagnosis
      const t0 = performance.now();
      
      // === DATA GENERATION PHASE ===
      // Process frame and generate all data needed for rendering using WASM processor
      const renderData = this.dataProcessor.processFrame(this.renderer.getFFTDisplayEnabled(), this.enableDetailedTimingLogs);
      const t1 = performance.now();
      
      if (renderData) {
        // === RENDERING PHASE ===
        // All rendering logic uses only the generated data
        this.renderFrame(renderData);
        const t2 = performance.now();
        
        // Log detailed timing breakdown only if enabled or performance is poor
        const dataProcessingTime = t1 - t0;
        const renderingTime = t2 - t1;
        const totalTime = t2 - t0;
        
        // Log if explicitly enabled or if performance exceeds target (diagnostic threshold)
        if (this.enableDetailedTimingLogs || totalTime > this.TARGET_FRAME_TIME) {
          console.log(`[Frame Timing] Total: ${totalTime.toFixed(2)}ms | Data Processing: ${dataProcessingTime.toFixed(2)}ms | Rendering: ${renderingTime.toFixed(2)}ms`);
        }
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
    // Determine display range based on phase marker range mode
    let displayStartIndex = renderData.displayStartIndex;
    let displayEndIndex = renderData.displayEndIndex;
    
    if (this.phaseMarkerRangeEnabled && 
        renderData.phaseMinusQuarterPiIndex !== undefined && 
        renderData.phaseTwoPiPlusQuarterPiIndex !== undefined &&
        renderData.phaseMinusQuarterPiIndex <= renderData.phaseTwoPiPlusQuarterPiIndex) {
      // Use phase marker range (orange to orange)
      displayStartIndex = renderData.phaseMinusQuarterPiIndex;
      displayEndIndex = renderData.phaseTwoPiPlusQuarterPiIndex;
    }
    
    // Clear canvas and draw grid with measurement labels
    const displaySamples = displayEndIndex - displayStartIndex;
    this.renderer.clearAndDrawGrid(
      renderData.sampleRate,
      displaySamples,
      renderData.gain
    );

    // Draw waveform with calculated gain
    this.renderer.drawWaveform(
      renderData.waveformData,
      displayStartIndex,
      displayEndIndex,
      renderData.gain
    );

    // Draw phase markers
    this.renderer.drawPhaseMarkers(
      renderData.phaseZeroIndex,
      renderData.phaseTwoPiIndex,
      renderData.phaseMinusQuarterPiIndex,
      renderData.phaseTwoPiPlusQuarterPiIndex,
      displayStartIndex,
      displayEndIndex,
      {
        phaseZeroSegmentRelative: renderData.phaseZeroSegmentRelative,
        phaseZeroHistory: renderData.phaseZeroHistory,
        phaseZeroTolerance: renderData.phaseZeroTolerance,
        zeroCrossModeName: renderData.zeroCrossModeName,
      }
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
        renderData.candidate1WeightedScore,
        renderData.candidate2WeightedScore,
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
    // Use original 4-cycle range from WASM (renderData.displayStartIndex/displayEndIndex)
    // instead of the phase-marker-narrowed range (displayStartIndex/displayEndIndex)
    this.comparisonRenderer.updatePanels(
      renderData.previousWaveform,
      renderData.waveformData,
      renderData.displayStartIndex,
      renderData.displayEndIndex,
      renderData.waveformData,
      renderData.similarity,
      renderData.similarityPlotHistory,
      renderData.phaseZeroOffsetHistory,
      renderData.phaseTwoPiOffsetHistory,
      renderData.phaseZeroIndex,
      renderData.phaseTwoPiIndex,
      renderData.phaseMinusQuarterPiIndex,
      renderData.phaseTwoPiPlusQuarterPiIndex
    );
    
    // Update cycle similarity graphs if renderer is available
    if (this.cycleSimilarityRenderer) {
      this.cycleSimilarityRenderer.updateGraphs(
        renderData.cycleSimilarities8div,
        renderData.cycleSimilarities4div,
        renderData.cycleSimilarities2div
      );
    }
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

  /**
   * Enable or disable harmonic analysis overlay
   * When disabled, the yellow-bordered harmonic analysis panel in the top-left corner is hidden
   * @param enabled - true to show harmonic analysis overlay, false to hide it
   */
  setHarmonicAnalysisEnabled(enabled: boolean): void {
    this.renderer.setHarmonicAnalysisEnabled(enabled);
  }

  /**
   * Get the current state of harmonic analysis overlay
   * @returns true if harmonic analysis overlay is enabled, false otherwise
   */
  getHarmonicAnalysisEnabled(): boolean {
    return this.renderer.getHarmonicAnalysisEnabled();
  }

  /**
   * Enable or disable debug overlays (harmonic analysis, frequency plot)
   * Debug overlays show detailed debugging information with yellow borders (#ffaa00)
   * including harmonic analysis and frequency history plot
   * 
   * When using cat-oscilloscope as a library, it's recommended to disable these
   * overlays for a cleaner, more professional appearance
   * 
   * @param enabled - true to show debug overlays (default for standalone app),
   *                  false to hide them (recommended for library usage)
   */
  setDebugOverlaysEnabled(enabled: boolean): void {
    this.renderer.setDebugOverlaysEnabled(enabled);
  }

  /**
   * Get the current state of debug overlays
   * @returns true if debug overlays are enabled, false otherwise
   */
  getDebugOverlaysEnabled(): boolean {
    return this.renderer.getDebugOverlaysEnabled();
  }

  /**
   * Set the layout configuration for overlays
   * Allows external applications to control the position and size of debug overlays
   * @param layout - Layout configuration for overlays (FFT, harmonic analysis, frequency plot)
   */
  setOverlaysLayout(layout: OverlaysLayoutConfig): void {
    this.renderer.setOverlaysLayout(layout);
  }

  /**
   * Get the current overlays layout configuration
   * @returns Current overlays layout configuration
   */
  getOverlaysLayout(): OverlaysLayoutConfig {
    return this.renderer.getOverlaysLayout();
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
  
  setZeroCrossMode(mode: 'standard' | 'peak-backtrack-history' | 'bidirectional-nearest' | 'gradient-based' | 'adaptive-step' | 'hysteresis' | 'closest-to-zero'): void {
    this.zeroCrossDetector.setZeroCrossMode(mode);
  }

  getZeroCrossMode(): 'standard' | 'peak-backtrack-history' | 'bidirectional-nearest' | 'gradient-based' | 'adaptive-step' | 'hysteresis' | 'closest-to-zero' {
    return this.zeroCrossDetector.getZeroCrossMode();
  }
  
  setPauseDrawing(paused: boolean): void {
    this.isPaused = paused;
  }

  /**
   * Enable or disable detailed timing logs for performance diagnostics
   * When enabled, logs detailed breakdown of frame processing time
   * When disabled (default), only logs when performance exceeds target threshold
   * @param enabled - true to enable detailed timing logs, false to use threshold-based logging
   */
  setDetailedTimingLogs(enabled: boolean): void {
    this.enableDetailedTimingLogs = enabled;
    // Also pass to data processor
    this.dataProcessor.setDetailedTimingLogs(enabled);
  }

  /**
   * Get whether detailed timing logs are enabled
   * @returns true if detailed timing logs are enabled
   */
  getDetailedTimingLogsEnabled(): boolean {
    return this.enableDetailedTimingLogs;
  }

  getPauseDrawing(): boolean {
    return this.isPaused;
  }

  /**
   * Enable or disable phase marker range display mode
   * When enabled (default), displays only the range between orange-red-red-orange markers
   * When disabled, displays the full waveform segment
   * @param enabled - true to display only phase marker range, false to display full segment
   */
  setPhaseMarkerRangeEnabled(enabled: boolean): void {
    this.phaseMarkerRangeEnabled = enabled;
  }

  /**
   * Get the current state of phase marker range display mode
   * @returns true if phase marker range display is enabled, false otherwise
   */
  getPhaseMarkerRangeEnabled(): boolean {
    return this.phaseMarkerRangeEnabled;
  }
}
