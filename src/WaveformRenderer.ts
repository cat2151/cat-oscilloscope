import { OverlaysLayoutConfig, DEFAULT_OVERLAYS_LAYOUT } from './OverlayLayout';
import {
  GridRenderer,
  WaveformLineRenderer,
  FFTOverlayRenderer,
  HarmonicAnalysisRenderer,
  FrequencyPlotRenderer,
  PhaseMarkerRenderer,
} from './renderers';

/**
 * WaveformRenderer coordinates all canvas drawing operations
 * Acts as a facade that delegates to specialized renderer classes
 * Responsible for:
 * - Coordinating multiple renderer components
 * - Managing canvas state
 * - Providing a unified API for rendering
 */
export class WaveformRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private fftDisplayEnabled = true;
  private harmonicAnalysisEnabled = false; // Control harmonic analysis overlay independently
  private debugOverlaysEnabled = true; // Control debug overlays (harmonic analysis, frequency plot)
  private overlaysLayout: OverlaysLayoutConfig; // Layout configuration for overlays

  // Specialized renderers
  private gridRenderer: GridRenderer;
  private waveformLineRenderer: WaveformLineRenderer;
  private fftOverlayRenderer: FFTOverlayRenderer;
  private harmonicAnalysisRenderer: HarmonicAnalysisRenderer;
  private frequencyPlotRenderer: FrequencyPlotRenderer;
  private phaseMarkerRenderer: PhaseMarkerRenderer;

  constructor(canvas: HTMLCanvasElement, overlaysLayout?: OverlaysLayoutConfig) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context');
    }
    this.ctx = context;
    this.overlaysLayout = overlaysLayout || DEFAULT_OVERLAYS_LAYOUT;
    
    // Initialize specialized renderers
    this.gridRenderer = new GridRenderer(this.ctx, canvas.width, canvas.height);
    this.waveformLineRenderer = new WaveformLineRenderer(this.ctx, canvas.width, canvas.height);
    this.fftOverlayRenderer = new FFTOverlayRenderer(this.ctx, canvas.width, canvas.height);
    this.harmonicAnalysisRenderer = new HarmonicAnalysisRenderer(this.ctx, canvas.width, canvas.height);
    this.frequencyPlotRenderer = new FrequencyPlotRenderer(this.ctx, canvas.width, canvas.height);
    this.phaseMarkerRenderer = new PhaseMarkerRenderer(this.ctx, canvas.width, canvas.height, this.debugOverlaysEnabled);
    
    // Warn if canvas is using default dimensions (300x150)
    // This causes layout issues when CSS dimensions differ from canvas resolution
    if (canvas.width === 300 && canvas.height === 150) {
      console.warn(
        'Canvas element is using default dimensions (300x150). ' +
        'Set explicit width and height attributes on the canvas element to match desired resolution. ' +
        'Example: <canvas id="oscilloscope" width="1800" height="1000"></canvas>'
      );
    }
  }

  /**
   * Clear canvas and draw grid with measurement labels
   * @param sampleRate - Audio sample rate in Hz (optional)
   * @param displaySamples - Number of samples displayed on screen (optional)
   * @param gain - Current gain multiplier (optional)
   */
  clearAndDrawGrid(sampleRate?: number, displaySamples?: number, gain?: number): void {
    // Update renderer dimensions if canvas size changed
    this.updateRendererDimensions();
    
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid with labels using GridRenderer
    this.gridRenderer.drawGrid(sampleRate, displaySamples, gain);
  }

  /**
   * Update all renderer dimensions (call when canvas size changes)
   */
  private updateRendererDimensions(): void {
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    this.gridRenderer.updateDimensions(width, height);
    this.waveformLineRenderer.updateDimensions(width, height);
    this.fftOverlayRenderer.updateDimensions(width, height);
    this.harmonicAnalysisRenderer.updateDimensions(width, height);
    this.frequencyPlotRenderer.updateDimensions(width, height);
    this.phaseMarkerRenderer.updateDimensions(width, height);
  }

  /**
   * Draw waveform
   */
  drawWaveform(data: Float32Array, startIndex: number, endIndex: number, gain: number): void {
    this.updateRendererDimensions();
    this.waveformLineRenderer.drawWaveform(data, startIndex, endIndex, gain);
  }

  /**
   * Draw FFT spectrum overlay (position and size configurable via overlaysLayout)
   */
  drawFFTOverlay(frequencyData: Uint8Array, estimatedFrequency: number, sampleRate: number, fftSize: number, maxFrequency: number): void {
    if (!this.fftDisplayEnabled) {
      return;
    }

    this.updateRendererDimensions();
    this.fftOverlayRenderer.drawFFTOverlay(
      frequencyData,
      estimatedFrequency,
      sampleRate,
      fftSize,
      maxFrequency,
      this.overlaysLayout.fftOverlay
    );
  }

  /**
   * Draw harmonic analysis information overlay
   * Displays debugging information about frequency estimation when FFT method is used
   * Position and size configurable via overlaysLayout
   */
  drawHarmonicAnalysis(
    halfFreqPeakStrengthPercent?: number,
    candidate1Harmonics?: number[],
    candidate2Harmonics?: number[],
    candidate1WeightedScore?: number,
    candidate2WeightedScore?: number,
    selectionReason?: string,
    estimatedFrequency?: number
  ): void {
    // Skip if harmonic analysis display is disabled
    if (!this.harmonicAnalysisEnabled) {
      return;
    }
    
    // Skip if debug overlays are disabled
    if (!this.debugOverlaysEnabled) {
      return;
    }
    
    if (!this.fftDisplayEnabled) {
      return;
    }

    this.updateRendererDimensions();
    this.harmonicAnalysisRenderer.drawHarmonicAnalysis(
      halfFreqPeakStrengthPercent,
      candidate1Harmonics,
      candidate2Harmonics,
      candidate1WeightedScore,
      candidate2WeightedScore,
      selectionReason,
      estimatedFrequency,
      this.overlaysLayout.harmonicAnalysis
    );
  }

  /**
   * Draw frequency plot overlay
   * Position and size configurable via overlaysLayout
   * Displays frequency history to detect frequency spikes
   * One data point is added per frame
   */
  drawFrequencyPlot(frequencyHistory: number[], minFrequency: number, maxFrequency: number): void {
    // Skip if debug overlays are disabled
    if (!this.debugOverlaysEnabled) {
      return;
    }

    this.updateRendererDimensions();
    this.frequencyPlotRenderer.drawFrequencyPlot(
      frequencyHistory,
      minFrequency,
      maxFrequency,
      this.overlaysLayout.frequencyPlot
    );
  }

  /**
   * Draw phase markers on the waveform
   * @param phaseZeroIndex - Sample index for phase 0 (red line)
   * @param phaseTwoPiIndex - Sample index for phase 2π (red line)
   * @param phaseMinusQuarterPiIndex - Sample index for phase -π/4 (orange line)
   * @param phaseTwoPiPlusQuarterPiIndex - Sample index for phase 2π+π/4 (orange line)
   * @param displayStartIndex - Start index of the displayed region
   * @param displayEndIndex - End index of the displayed region
   * @param debugInfo - Optional debug information for phase tracking
   */
  drawPhaseMarkers(
    phaseZeroIndex?: number,
    phaseTwoPiIndex?: number,
    phaseMinusQuarterPiIndex?: number,
    phaseTwoPiPlusQuarterPiIndex?: number,
    displayStartIndex?: number,
    displayEndIndex?: number,
    debugInfo?: {
      phaseZeroSegmentRelative?: number;
      phaseZeroHistory?: number;
      phaseZeroTolerance?: number;
      zeroCrossModeName?: string;
    }
  ): void {
    this.updateRendererDimensions();
    this.phaseMarkerRenderer.drawPhaseMarkers(
      phaseZeroIndex,
      phaseTwoPiIndex,
      phaseMinusQuarterPiIndex,
      phaseTwoPiPlusQuarterPiIndex,
      displayStartIndex,
      displayEndIndex,
      debugInfo
    );
  }


  // Getters and setters
  setFFTDisplay(enabled: boolean): void {
    this.fftDisplayEnabled = enabled;
  }

  getFFTDisplayEnabled(): boolean {
    return this.fftDisplayEnabled;
  }

  /**
   * Enable or disable harmonic analysis overlay
   * When disabled, the yellow-bordered harmonic analysis panel is hidden
   * @param enabled - true to show harmonic analysis overlay, false to hide it
   */
  setHarmonicAnalysisEnabled(enabled: boolean): void {
    this.harmonicAnalysisEnabled = enabled;
  }

  /**
   * Get the current state of harmonic analysis overlay
   * @returns true if harmonic analysis overlay is enabled, false otherwise
   */
  getHarmonicAnalysisEnabled(): boolean {
    return this.harmonicAnalysisEnabled;
  }

  /**
   * Enable or disable debug overlays (harmonic analysis, frequency plot)
   * When disabled, yellow-bordered debug information panels are hidden
   * Recommended: Set to false when using as a library for cleaner display
   * @param enabled - true to show debug overlays, false to hide them
   */
  setDebugOverlaysEnabled(enabled: boolean): void {
    this.debugOverlaysEnabled = enabled;
    this.phaseMarkerRenderer.setDebugOverlaysEnabled(enabled);
  }

  /**
   * Get the current state of debug overlays
   * @returns true if debug overlays are enabled, false otherwise
   */
  getDebugOverlaysEnabled(): boolean {
    return this.debugOverlaysEnabled;
  }

  /**
   * Set the layout configuration for overlays
   * Allows external applications to control the position and size of debug overlays
   * @param layout - Layout configuration for overlays
   */
  setOverlaysLayout(layout: OverlaysLayoutConfig): void {
    this.overlaysLayout = { ...this.overlaysLayout, ...layout };
  }

  /**
   * Get the current overlays layout configuration
   * @returns Current overlays layout configuration
   */
  getOverlaysLayout(): OverlaysLayoutConfig {
    return this.overlaysLayout;
  }
}
