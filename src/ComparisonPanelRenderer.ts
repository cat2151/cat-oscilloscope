import {
  WaveformPanelRenderer,
  SimilarityPlotRenderer,
  PositionMarkerRenderer,
  OffsetOverlayRenderer,
} from './comparison-renderers';

/**
 * ComparisonPanelRenderer handles rendering of the comparison panels
 * Acts as a coordinator that delegates to specialized renderers:
 * - WaveformPanelRenderer: Drawing waveforms with auto-scaling
 * - SimilarityPlotRenderer: Drawing similarity history plots
 * - PositionMarkerRenderer: Drawing position markers on buffer canvas
 * - OffsetOverlayRenderer: Drawing phase marker offset overlay graphs
 */
export class ComparisonPanelRenderer {
  private previousCanvas: HTMLCanvasElement;
  private currentCanvas: HTMLCanvasElement;
  private similarityCanvas: HTMLCanvasElement;
  private bufferCanvas: HTMLCanvasElement;
  private previousCtx: CanvasRenderingContext2D;
  private currentCtx: CanvasRenderingContext2D;
  private similarityCtx: CanvasRenderingContext2D;
  private bufferCtx: CanvasRenderingContext2D;
  
  // Specialized renderers
  private waveformRenderer: WaveformPanelRenderer;
  private similarityPlotRenderer: SimilarityPlotRenderer;
  private positionMarkerRenderer: PositionMarkerRenderer;
  private offsetOverlayRenderer: OffsetOverlayRenderer;

  constructor(
    previousCanvas: HTMLCanvasElement,
    currentCanvas: HTMLCanvasElement,
    similarityCanvas: HTMLCanvasElement,
    bufferCanvas: HTMLCanvasElement
  ) {
    this.previousCanvas = previousCanvas;
    this.currentCanvas = currentCanvas;
    this.similarityCanvas = similarityCanvas;
    this.bufferCanvas = bufferCanvas;

    const prevCtx = previousCanvas.getContext('2d');
    const currCtx = currentCanvas.getContext('2d');
    const simCtx = similarityCanvas.getContext('2d');
    const buffCtx = bufferCanvas.getContext('2d');

    if (!prevCtx || !currCtx || !simCtx || !buffCtx) {
      throw new Error('Could not get 2D context for comparison canvases');
    }

    this.previousCtx = prevCtx;
    this.currentCtx = currCtx;
    this.similarityCtx = simCtx;
    this.bufferCtx = buffCtx;

    // Initialize specialized renderers
    this.waveformRenderer = new WaveformPanelRenderer();
    this.similarityPlotRenderer = new SimilarityPlotRenderer();
    this.positionMarkerRenderer = new PositionMarkerRenderer();
    this.offsetOverlayRenderer = new OffsetOverlayRenderer();

    // Initialize all canvases
    this.clearAllCanvases();
  }

  /**
   * Clear all comparison canvases
   */
  private clearAllCanvases(): void {
    this.waveformRenderer.clearCanvas(this.previousCtx, this.previousCanvas.width, this.previousCanvas.height);
    this.waveformRenderer.clearCanvas(this.currentCtx, this.currentCanvas.width, this.currentCanvas.height);
    this.waveformRenderer.clearCanvas(this.similarityCtx, this.similarityCanvas.width, this.similarityCanvas.height);
    this.waveformRenderer.clearCanvas(this.bufferCtx, this.bufferCanvas.width, this.bufferCanvas.height);
  }

  /**
   * Update all comparison panels
   * @param previousWaveform - Previous frame's waveform data (null if no previous frame exists)
   * @param currentWaveform - Full buffer containing current frame's audio data
   * @param currentStart - Start index of the extracted waveform within currentWaveform
   * @param currentEnd - End index of the extracted waveform within currentWaveform (exclusive)
   * @param fullBuffer - Complete frame buffer to display (typically same as currentWaveform)
   * @param similarity - Correlation coefficient between current and previous waveform (-1 to +1)
   * @param similarityHistory - Array of similarity values over time for history plot
   * @param phaseZeroOffsetHistory - Array of relative offset percentages for phase zero marker (issue #236)
   * @param phaseTwoPiOffsetHistory - Array of relative offset percentages for phase 2π marker (issue #236)
   * @param phaseZeroIndex - Sample index for phase 0 (red line) in the full buffer (issue #279)
   * @param phaseTwoPiIndex - Sample index for phase 2π (red line) in the full buffer (issue #279)
   * @param phaseMinusQuarterPiIndex - Sample index for phase -π/4 (orange line) in the full buffer (issue #279)
   * @param phaseTwoPiPlusQuarterPiIndex - Sample index for phase 2π+π/4 (orange line) in the full buffer (issue #279)
   */
  updatePanels(
    previousWaveform: Float32Array | null,
    currentWaveform: Float32Array,
    currentStart: number,
    currentEnd: number,
    fullBuffer: Float32Array,
    similarity: number,
    similarityHistory: number[] = [],
    phaseZeroOffsetHistory: number[] = [],
    phaseTwoPiOffsetHistory: number[] = [],
    phaseZeroIndex?: number,
    phaseTwoPiIndex?: number,
    phaseMinusQuarterPiIndex?: number,
    phaseTwoPiPlusQuarterPiIndex?: number
  ): void {
    // Clear all canvases
    this.clearAllCanvases();

    // Draw previous waveform
    if (previousWaveform) {
      this.waveformRenderer.drawCenterLine(this.previousCtx, this.previousCanvas.width, this.previousCanvas.height);
      this.waveformRenderer.drawWaveform(
        this.previousCtx,
        this.previousCanvas.width,
        this.previousCanvas.height,
        previousWaveform,
        0,
        previousWaveform.length,
        '#ffaa00'
      );
    }

    // Draw current waveform with similarity score
    this.waveformRenderer.drawCenterLine(this.currentCtx, this.currentCanvas.width, this.currentCanvas.height);

    // Draw previous waveform on current canvas first (as background, in dimmer color)
    if (previousWaveform) {
      this.waveformRenderer.drawWaveform(
        this.currentCtx,
        this.currentCanvas.width,
        this.currentCanvas.height,
        previousWaveform,
        0,
        previousWaveform.length,
        '#666600' // Dimmer yellow-green color for previous waveform
      );
    }

    // Draw current waveform on top
    const currentLength = currentEnd - currentStart;
    if (currentLength > 0) {
      this.waveformRenderer.drawWaveform(
        this.currentCtx,
        this.currentCanvas.width,
        this.currentCanvas.height,
        currentWaveform,
        currentStart,
        currentEnd,
        '#00ff00'
      );
    }
    if (previousWaveform) {
      this.similarityPlotRenderer.drawSimilarityText(this.currentCtx, this.currentCanvas.width, similarity);
    }

    // Draw phase markers on current waveform (issue #279, #286)
    this.waveformRenderer.drawPhaseMarkers(
      this.currentCtx,
      this.currentCanvas.width,
      this.currentCanvas.height,
      currentStart,
      currentEnd,
      phaseZeroIndex,
      phaseTwoPiIndex,
      phaseMinusQuarterPiIndex,
      phaseTwoPiPlusQuarterPiIndex
    );

    // Draw offset overlay graphs on current waveform (issue #236)
    this.offsetOverlayRenderer.drawOffsetOverlayGraphs(
      this.currentCtx,
      this.currentCanvas.width,
      this.currentCanvas.height,
      phaseZeroOffsetHistory,
      phaseTwoPiOffsetHistory
    );

    // Draw similarity plot
    if (similarityHistory.length > 0) {
      this.similarityPlotRenderer.drawSimilarityPlot(
        this.similarityCtx,
        this.similarityCanvas.width,
        this.similarityCanvas.height,
        similarityHistory
      );
    }

    // Draw full frame buffer with position markers
    this.waveformRenderer.drawCenterLine(this.bufferCtx, this.bufferCanvas.width, this.bufferCanvas.height);
    this.waveformRenderer.drawWaveform(
      this.bufferCtx,
      this.bufferCanvas.width,
      this.bufferCanvas.height,
      fullBuffer,
      0,
      fullBuffer.length,
      '#888888'
    );
    this.positionMarkerRenderer.drawPositionMarkers(
      this.bufferCtx,
      this.bufferCanvas.width,
      this.bufferCanvas.height,
      currentStart,
      currentEnd,
      fullBuffer.length
    );
    this.positionMarkerRenderer.drawPhaseMarkers(
      this.bufferCtx,
      this.bufferCanvas.width,
      this.bufferCanvas.height,
      fullBuffer.length,
      phaseZeroIndex,
      phaseTwoPiIndex,
      phaseMinusQuarterPiIndex,
      phaseTwoPiPlusQuarterPiIndex
    );
  }

  /**
   * Clear all panels (e.g., when stopped)
   */
  clear(): void {
    this.clearAllCanvases();
  }
}
