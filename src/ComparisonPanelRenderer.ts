/**
 * ComparisonPanelRenderer handles rendering of the comparison panels
 * Responsible for:
 * - Drawing previous waveform
 * - Drawing current waveform with similarity score
 * - Drawing full frame buffer with position indicators
 */
export class ComparisonPanelRenderer {
  private previousCanvas: HTMLCanvasElement;
  private currentCanvas: HTMLCanvasElement;
  private bufferCanvas: HTMLCanvasElement;
  private previousCtx: CanvasRenderingContext2D;
  private currentCtx: CanvasRenderingContext2D;
  private bufferCtx: CanvasRenderingContext2D;
  
  // Auto-scaling constants
  private readonly TARGET_FILL_RATIO = 0.9;    // Target 90% of distance from center to edge (canvas half-height) for auto-scaled waveforms
  private readonly MIN_PEAK_THRESHOLD = 0.001; // Minimum peak to trigger auto-scaling (below this uses default)
  private readonly DEFAULT_AMPLITUDE_RATIO = 0.4; // Default scaling factor when peak is too small
  
  // Similarity bar graph constants
  private readonly BAR_GRAPH_WIDTH = 100;  // Width of the bar graph area
  private readonly BAR_GRAPH_PADDING = 5;  // Padding around bars
  private readonly BAR_WIDTH = 3;          // Width of each bar
  private readonly MAX_BARS = 30;          // Maximum number of bars to display

  constructor(
    previousCanvas: HTMLCanvasElement,
    currentCanvas: HTMLCanvasElement,
    bufferCanvas: HTMLCanvasElement
  ) {
    this.previousCanvas = previousCanvas;
    this.currentCanvas = currentCanvas;
    this.bufferCanvas = bufferCanvas;

    const prevCtx = previousCanvas.getContext('2d');
    const currCtx = currentCanvas.getContext('2d');
    const buffCtx = bufferCanvas.getContext('2d');

    if (!prevCtx || !currCtx || !buffCtx) {
      throw new Error('Could not get 2D context for comparison canvases');
    }

    this.previousCtx = prevCtx;
    this.currentCtx = currCtx;
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
   * Draw similarity bar graph on the right side of a canvas
   * @param ctx - Canvas rendering context
   * @param width - Canvas width
   * @param height - Canvas height
   * @param similarityHistory - Array of similarity values (-1.0 to 1.0)
   */
  private drawSimilarityBars(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    similarityHistory: number[]
  ): void {
    if (!similarityHistory || similarityHistory.length === 0) {
      return;
    }

    // Calculate bar graph area
    const graphX = width - this.BAR_GRAPH_WIDTH;
    const graphY = this.BAR_GRAPH_PADDING;
    const graphWidth = this.BAR_GRAPH_WIDTH - this.BAR_GRAPH_PADDING;
    const graphHeight = height - 2 * this.BAR_GRAPH_PADDING;

    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(graphX, graphY, graphWidth, graphHeight);

    // Draw border
    ctx.strokeStyle = '#00aaff';
    ctx.lineWidth = 1;
    ctx.strokeRect(graphX, graphY, graphWidth, graphHeight);

    // Get the most recent bars (up to MAX_BARS)
    const startIdx = Math.max(0, similarityHistory.length - this.MAX_BARS);
    const barsToShow = similarityHistory.slice(startIdx);
    
    // Safety check: ensure we have bars to show
    if (barsToShow.length === 0) {
      return;
    }
    
    // Calculate bar spacing
    const availableWidth = graphWidth - 2 * this.BAR_GRAPH_PADDING;
    const barSpacing = availableWidth / barsToShow.length;
    const barX0 = graphX + this.BAR_GRAPH_PADDING;

    // Draw center line (similarity = 0)
    const centerY = graphY + graphHeight / 2;
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(graphX, centerY);
    ctx.lineTo(graphX + graphWidth, centerY);
    ctx.stroke();

    // Draw bars
    // Note: Bars extend from bottom (graphY + graphHeight) upward
    // This "higher is better" visualization works well for similarity values
    // which are typically positive (0 to 1.0) when waveforms match.
    // For the full -1 to +1 range, bars grow from 0 height (at -1.0) to full height (at +1.0).
    const displayMin = -1.0;
    const displayMax = 1.0;
    
    barsToShow.forEach((similarity, idx) => {
      // Clamp similarity value
      const clampedSimilarity = Math.max(displayMin, Math.min(displayMax, similarity));
      
      // Map similarity to bar height (-1 to 1 -> full height range)
      const normalizedSimilarity = (clampedSimilarity - displayMin) / (displayMax - displayMin);
      const barHeight = normalizedSimilarity * graphHeight;
      
      // Bar position
      const barX = barX0 + idx * barSpacing;
      const barY = graphY + graphHeight - barHeight;
      
      // Color based on similarity value (blue gradient)
      const intensity = Math.floor(normalizedSimilarity * 255);
      ctx.fillStyle = `rgb(0, ${Math.floor(intensity * 0.66)}, ${intensity})`;
      
      // Draw bar
      ctx.fillRect(barX, barY, Math.max(1, this.BAR_WIDTH), barHeight);
    });

    // Draw current value text at bottom
    const currentSimilarity = similarityHistory[similarityHistory.length - 1];
    ctx.fillStyle = '#00aaff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(
      currentSimilarity.toFixed(2),
      graphX + graphWidth / 2,
      graphY + graphHeight - 2
    );
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
   * Update all comparison panels
   * @param previousWaveform - Previous frame's waveform data (null if no previous frame exists)
   * @param currentWaveform - Full buffer containing current frame's audio data
   * @param currentStart - Start index of the extracted waveform within currentWaveform
   * @param currentEnd - End index of the extracted waveform within currentWaveform (exclusive)
   * @param fullBuffer - Complete frame buffer to display (typically same as currentWaveform)
   * @param similarity - Correlation coefficient between current and previous waveform (-1 to +1)
   * @param similarityHistory - Array of similarity values over time for bar graph display
   */
  updatePanels(
    previousWaveform: Float32Array | null,
    currentWaveform: Float32Array,
    currentStart: number,
    currentEnd: number,
    fullBuffer: Float32Array,
    similarity: number,
    similarityHistory: number[] = []
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
      // Draw similarity bar graph on the right side of previous waveform
      if (similarityHistory.length > 0) {
        this.drawSimilarityBars(
          this.previousCtx,
          this.previousCanvas.width,
          this.previousCanvas.height,
          similarityHistory
        );
      }
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
    // Draw similarity bar graph on the right side of current waveform
    if (similarityHistory.length > 0) {
      this.drawSimilarityBars(
        this.currentCtx,
        this.currentCanvas.width,
        this.currentCanvas.height,
        similarityHistory
      );
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
