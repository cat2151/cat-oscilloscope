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
   * Draw a waveform on a canvas
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

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    const sliceWidth = width / dataLength;
    const centerY = height / 2;
    const amplitude = height / 2;

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
   */
  updatePanels(
    previousWaveform: Float32Array | null,
    currentWaveform: Float32Array,
    currentStart: number,
    currentEnd: number,
    fullBuffer: Float32Array,
    similarity: number
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
