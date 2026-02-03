/**
 * ComparisonPanelRenderer handles rendering of the comparison panels
 * Responsible for:
 * - Drawing previous waveform
 * - Drawing current waveform with similarity score
 * - Drawing similarity history plot
 * - Drawing full frame buffer with position indicators
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
  
  // Auto-scaling constants
  private readonly TARGET_FILL_RATIO = 0.9;    // Target 90% of distance from center to edge (canvas half-height) for auto-scaled waveforms
  private readonly MIN_PEAK_THRESHOLD = 0.001; // Minimum peak to trigger auto-scaling (below this uses default)
  private readonly DEFAULT_AMPLITUDE_RATIO = 0.4; // Default scaling factor when peak is too small

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

    // Initialize all canvases
    this.clearAllCanvases();
  }

  /**
   * Clear all comparison canvases
   */
  private clearAllCanvases(): void {
    this.clearCanvas(this.previousCtx, this.previousCanvas.width, this.previousCanvas.height);
    this.clearCanvas(this.currentCtx, this.currentCanvas.width, this.currentCanvas.height);
    this.clearCanvas(this.similarityCtx, this.similarityCanvas.width, this.similarityCanvas.height);
    this.clearCanvas(this.bufferCtx, this.bufferCanvas.width, this.bufferCanvas.height);
  }

  /**
   * Clear a single canvas
   */
  private clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Calculate peak amplitude in a given range of data
   * Used for auto-scaling waveforms to fill the vertical space
   */
  private findPeakAmplitude(
    data: Float32Array,
    startIndex: number,
    endIndex: number
  ): number {
    let peak = 0;
    const clampedStart = Math.max(0, startIndex);
    const clampedEnd = Math.min(data.length, endIndex);

    for (let i = clampedStart; i < clampedEnd; i++) {
      const value = Math.abs(data[i]);
      if (value > peak) {
        peak = value;
      }
    }

    return peak;
  }

  /**
   * Draw a waveform on a canvas with auto-scaling
   * Waveforms are automatically scaled so that peaks reach 90% of the distance
   * from the vertical center line to the top/bottom edge (i.e. 90% of half the height).
   * For example, if peak amplitude is 0.01, it will be scaled 90x relative to that center-to-edge range.
   */
  private drawWaveform(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    data: Float32Array,
    startIndex: number,
    endIndex: number,
    color: string
  ): void {
    const dataLength = endIndex - startIndex;
    if (dataLength <= 0) return;

    // Find peak amplitude for auto-scaling
    const peak = this.findPeakAmplitude(data, startIndex, endIndex);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    const sliceWidth = width / dataLength;
    const centerY = height / 2;
    
    // Auto-scale so peaks reach 90% of distance from center to edge (90% of half-height)
    // If peak is 0 or very small (< MIN_PEAK_THRESHOLD), use default scaling to avoid division by zero
    let amplitude: number;
    
    if (peak > this.MIN_PEAK_THRESHOLD) {
      // Calculate scaling factor so peak reaches TARGET_FILL_RATIO of the distance from center to edge
      const scalingFactor = this.TARGET_FILL_RATIO / peak;
      amplitude = (height / 2) * scalingFactor;
    } else {
      // For very small or zero signals, use default scaling
      amplitude = height * this.DEFAULT_AMPLITUDE_RATIO;
    }

    for (let i = 0; i < dataLength; i++) {
      const dataIndex = startIndex + i;
      if (dataIndex >= data.length) break;
      
      const value = data[dataIndex];
      const rawY = centerY - (value * amplitude);
      const y = Math.min(height, Math.max(0, rawY));
      const x = i * sliceWidth;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  }

  /**
   * Draw center line on canvas
   */
  private drawCenterLine(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  }

  /**
   * Draw similarity score text
   */
  private drawSimilarityText(similarity: number): void {
    this.currentCtx.fillStyle = '#00aaff';
    this.currentCtx.font = 'bold 14px Arial';
    const text = `Similarity: ${similarity.toFixed(3)}`;
    const textWidth = this.currentCtx.measureText(text).width;
    const x = (this.currentCanvas.width - textWidth) / 2;
    this.currentCtx.fillText(text, x, 20);
  }

  /**
   * Draw similarity history plot on similarity canvas
   * 類似度の時系列変化を表示し、瞬間的な類似度低下を検出しやすくする
   * 
   * @param similarityHistory Array of correlation coefficients (-1.0 to 1.0).
   *                          Values are ordered chronologically from oldest to newest.
   */
  private drawSimilarityPlot(similarityHistory: number[]): void {
    if (!similarityHistory || similarityHistory.length === 0) {
      return;
    }

    const ctx = this.similarityCtx;
    const width = this.similarityCanvas.width;
    const height = this.similarityCanvas.height;

    // Clear and draw background
    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Draw border
    ctx.strokeStyle = '#00aaff';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#00aaff';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('類似度推移 (Similarity)', 5, 15);

    // Calculate plot area (reserve space for title and axis labels)
    const plotX = 40;
    const plotY = 25;
    const plotWidth = width - 50;
    const plotHeight = height - 35;

    // Similarity range is -1.0 to 1.0 (correlation coefficient range)
    const displayMin = -1.0;
    const displayMax = 1.0;

    // Draw grid lines
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    // Horizontal grid lines (corresponding to similarity axis)
    for (let i = 0; i <= 4; i++) {
      const y = plotY + (plotHeight / 4) * i;
      ctx.moveTo(plotX, y);
      ctx.lineTo(plotX + plotWidth, y);
    }
    
    // Vertical grid lines
    for (let i = 0; i <= 4; i++) {
      const x = plotX + (plotWidth / 4) * i;
      ctx.moveTo(x, plotY);
      ctx.lineTo(x, plotY + plotHeight);
    }
    
    ctx.stroke();

    // Draw Y-axis labels (similarity values)
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i <= 4; i++) {
      const similarity = displayMax - (displayMax - displayMin) * (i / 4);
      const y = plotY + (plotHeight / 4) * i;
      const label = similarity.toFixed(2);
      ctx.fillText(label, plotX - 5, y);
    }

    // Draw similarity plot line
    ctx.strokeStyle = '#00aaff';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const xStep = plotWidth / Math.max(similarityHistory.length - 1, 1);
    
    for (let i = 0; i < similarityHistory.length; i++) {
      const similarity = similarityHistory[i];
      const x = plotX + i * xStep;
      
      // Clamp similarity to display range
      const clampedSimilarity = Math.max(displayMin, Math.min(displayMax, similarity));
      
      // Map similarity to Y coordinate (inverted: high similarity = top)
      const normalizedSimilarity = (clampedSimilarity - displayMin) / (displayMax - displayMin);
      const y = plotY + plotHeight - (normalizedSimilarity * plotHeight);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();

    // Draw current similarity value (inside plot area at bottom left)
    const currentSimilarity = similarityHistory[similarityHistory.length - 1];
    ctx.fillStyle = '#00aaff';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${currentSimilarity.toFixed(3)}`, plotX + 2, plotY + plotHeight - 2);

    ctx.restore();
  }

  /**
   * Draw vertical position markers
   */
  private drawPositionMarkers(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    startIndex: number,
    endIndex: number,
    totalLength: number
  ): void {
    if (totalLength <= 0) return;

    // Calculate x positions for start and end markers
    const startX = (startIndex / totalLength) * width;
    const endX = (endIndex / totalLength) * width;

    // Draw start marker (red line)
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, 0);
    ctx.lineTo(startX, height);
    ctx.stroke();

    // Draw end marker (red line)
    ctx.beginPath();
    ctx.moveTo(endX, 0);
    ctx.lineTo(endX, height);
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = '#ff0000';
    ctx.font = '10px Arial';
    ctx.fillText('S', startX + 2, 12);
    ctx.fillText('E', endX + 2, 12);
  }

  /**
   * Draw phase marker offset overlay graphs on current waveform canvas
   * Displays two line graphs showing the relative offset progression of phase markers
   * @param phaseZeroOffsetHistory - Array of relative offset percentages for phase zero (start red line)
   * @param phaseTwoPiOffsetHistory - Array of relative offset percentages for phase 2π (end red line)
   */
  private drawOffsetOverlayGraphs(
    phaseZeroOffsetHistory: number[] = [],
    phaseTwoPiOffsetHistory: number[] = []
  ): void {
    if (phaseZeroOffsetHistory.length === 0 && phaseTwoPiOffsetHistory.length === 0) {
      return;
    }

    const ctx = this.currentCtx;
    const width = this.currentCanvas.width;
    const height = this.currentCanvas.height;

    ctx.save();

    // Define plot area - position at top right corner
    const plotWidth = Math.min(120, width * 0.4);
    const plotHeight = Math.min(60, height * 0.4);
    const plotX = width - plotWidth - 5;
    const plotY = 5;

    // Draw semi-transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(plotX, plotY, plotWidth, plotHeight);

    // Draw border
    ctx.strokeStyle = '#00aaff';
    ctx.lineWidth = 1;
    ctx.strokeRect(plotX, plotY, plotWidth, plotHeight);

    // Title
    ctx.fillStyle = '#00aaff';
    ctx.font = '9px Arial';
    ctx.fillText('Offset %', plotX + 2, plotY + 9);

    // Calculate plot area inside border
    const innerPadding = 2;
    const innerPlotX = plotX + innerPadding;
    const innerPlotY = plotY + 12;
    const innerPlotWidth = plotWidth - innerPadding * 2;
    const innerPlotHeight = plotHeight - 12 - innerPadding;

    // Determine Y-axis range (0-100%)
    const minPercent = 0;
    const maxPercent = 100;

    // Helper function to draw offset line
    const drawOffsetLine = (offsetHistory: number[], color: string) => {
      if (offsetHistory.length < 2) return;

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      const xStep = innerPlotWidth / Math.max(offsetHistory.length - 1, 1);

      for (let i = 0; i < offsetHistory.length; i++) {
        const percent = offsetHistory[i];
        const x = innerPlotX + i * xStep;

        // Clamp to display range
        const clampedPercent = Math.max(minPercent, Math.min(maxPercent, percent));

        // Map percentage to Y coordinate (inverted: high percentage = top)
        const normalizedPercent = (clampedPercent - minPercent) / (maxPercent - minPercent);
        const y = innerPlotY + innerPlotHeight - (normalizedPercent * innerPlotHeight);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    };

    // Draw phase zero offset line (red)
    drawOffsetLine(phaseZeroOffsetHistory, '#ff0000');

    // Draw phase 2π offset line (orange)
    drawOffsetLine(phaseTwoPiOffsetHistory, '#ff8800');

    // Draw current values
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';

    if (phaseZeroOffsetHistory.length > 0) {
      const currentZeroOffset = phaseZeroOffsetHistory[phaseZeroOffsetHistory.length - 1];
      ctx.fillStyle = '#ff0000';
      ctx.fillText(`S:${currentZeroOffset.toFixed(1)}%`, plotX + 2, plotY + plotHeight - 11);
    }

    if (phaseTwoPiOffsetHistory.length > 0) {
      const currentTwoPiOffset = phaseTwoPiOffsetHistory[phaseTwoPiOffsetHistory.length - 1];
      ctx.fillStyle = '#ff8800';
      ctx.fillText(`E:${currentTwoPiOffset.toFixed(1)}%`, plotX + 2, plotY + plotHeight - 2);
    }

    ctx.restore();
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
    phaseTwoPiOffsetHistory: number[] = []
  ): void {
    // Clear all canvases
    this.clearAllCanvases();

    // Draw previous waveform
    if (previousWaveform) {
      this.drawCenterLine(this.previousCtx, this.previousCanvas.width, this.previousCanvas.height);
      this.drawWaveform(
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
    this.drawCenterLine(this.currentCtx, this.currentCanvas.width, this.currentCanvas.height);
    const currentLength = currentEnd - currentStart;
    if (currentLength > 0) {
      this.drawWaveform(
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
      this.drawSimilarityText(similarity);
    }
    
    // Draw offset overlay graphs on current waveform (issue #236)
    this.drawOffsetOverlayGraphs(phaseZeroOffsetHistory, phaseTwoPiOffsetHistory);

    // Draw similarity plot
    if (similarityHistory.length > 0) {
      this.drawSimilarityPlot(similarityHistory);
    }

    // Draw full frame buffer with position markers
    this.drawCenterLine(this.bufferCtx, this.bufferCanvas.width, this.bufferCanvas.height);
    this.drawWaveform(
      this.bufferCtx,
      this.bufferCanvas.width,
      this.bufferCanvas.height,
      fullBuffer,
      0,
      fullBuffer.length,
      '#888888'
    );
    this.drawPositionMarkers(
      this.bufferCtx,
      this.bufferCanvas.width,
      this.bufferCanvas.height,
      currentStart,
      currentEnd,
      fullBuffer.length
    );
  }

  /**
   * Clear all panels (e.g., when stopped)
   */
  clear(): void {
    this.clearAllCanvases();
  }
}
