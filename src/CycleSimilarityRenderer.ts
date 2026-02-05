/**
 * CycleSimilarityRenderer handles rendering of cycle similarity graphs
 * Displays similarity between consecutive segments for:
 * - 8 divisions (1/2 cycle each)
 * - 4 divisions (1 cycle each)
 * - 2 divisions (2 cycles each)
 */
export class CycleSimilarityRenderer {
  private static readonly HISTORY_SIZE = 100;
  private static readonly SEGMENT_COLORS = ['#00ff00', '#88ff00', '#ffaa00', '#ff6600', '#ff0000', '#ff00ff', '#00ffff'];

  private canvas8div: HTMLCanvasElement;
  private canvas4div: HTMLCanvasElement;
  private canvas2div: HTMLCanvasElement;
  private ctx8div: CanvasRenderingContext2D;
  private ctx4div: CanvasRenderingContext2D;
  private ctx2div: CanvasRenderingContext2D;

  // History buffers for 100 frames
  private history8div: number[][] = [];
  private history4div: number[][] = [];
  private history2div: number[][] = [];

  constructor(
    canvas8div: HTMLCanvasElement,
    canvas4div: HTMLCanvasElement,
    canvas2div: HTMLCanvasElement
  ) {
    this.canvas8div = canvas8div;
    this.canvas4div = canvas4div;
    this.canvas2div = canvas2div;

    const ctx8 = canvas8div.getContext('2d');
    const ctx4 = canvas4div.getContext('2d');
    const ctx2 = canvas2div.getContext('2d');

    if (!ctx8 || !ctx4 || !ctx2) {
      throw new Error('Could not get 2D context for cycle similarity canvases');
    }

    this.ctx8div = ctx8;
    this.ctx4div = ctx4;
    this.ctx2div = ctx2;

    this.clearAllCanvases();
  }

  /**
   * Clear all canvases
   */
  private clearAllCanvases(): void {
    this.clearCanvas(this.ctx8div, this.canvas8div.width, this.canvas8div.height);
    this.clearCanvas(this.ctx4div, this.canvas4div.width, this.canvas4div.height);
    this.clearCanvas(this.ctx2div, this.canvas2div.width, this.canvas2div.height);
  }

  /**
   * Clear a single canvas
   */
  private clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Draw a similarity line graph on a canvas showing history for each segment
   * @param ctx Canvas context
   * @param width Canvas width
   * @param height Canvas height
   * @param history History of similarity arrays (each array contains similarities for all segments)
   * @param title Title text for the graph
   * @param segmentLabel Label for what each segment represents (e.g., "1/2 cycle")
   */
  private drawSimilarityGraph(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    history: number[][],
    title: string,
    segmentLabel: string
  ): void {
    ctx.save();

    // Clear and draw background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Draw border
    ctx.strokeStyle = '#ff8800';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#ff8800';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(title, 5, 15);

    // Check if we have data
    if (!history || history.length === 0 || !history[0] || history[0].length === 0) {
      ctx.fillStyle = '#666666';
      ctx.font = '11px Arial';
      ctx.fillText('データなし (No data)', width / 2 - 50, height / 2);
      ctx.restore();
      return;
    }

    // Calculate plot area
    const plotX = 35;
    const plotY = 25;
    const plotWidth = width - 45;
    const plotHeight = height - 35;

    // Similarity range is -1.0 to 1.0
    const displayMin = -1.0;
    const displayMax = 1.0;

    // Draw grid lines
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.beginPath();

    // Horizontal grid lines (similarity axis)
    for (let i = 0; i <= 4; i++) {
      const y = plotY + (plotHeight / 4) * i;
      ctx.moveTo(plotX, y);
      ctx.lineTo(plotX + plotWidth, y);
    }

    // Vertical grid lines (every 25 frames)
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
      const label = similarity.toFixed(1);
      ctx.fillText(label, plotX - 5, y);
    }

    // Draw zero line (at y = 0)
    const zeroY = plotY + plotHeight - (0 - displayMin) / (displayMax - displayMin) * plotHeight;
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(plotX, zeroY);
    ctx.lineTo(plotX + plotWidth, zeroY);
    ctx.stroke();

    // Number of segments (from first frame)
    const numSegments = history[0].length;

    // Draw line for each segment
    for (let segIdx = 0; segIdx < numSegments; segIdx++) {
      const color = CycleSimilarityRenderer.SEGMENT_COLORS[segIdx % CycleSimilarityRenderer.SEGMENT_COLORS.length];
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      // Calculate X step: if only 1 frame, point is at plotX; if multiple frames, spread across width
      const xStep = history.length > 1 ? plotWidth / (history.length - 1) : 0;

      let hasValidPoint = false;
      for (let frameIdx = 0; frameIdx < history.length; frameIdx++) {
        const frame = history[frameIdx];
        if (frame && frame.length > segIdx) {
          const similarity = frame[segIdx];
          const x = plotX + frameIdx * xStep;

          // Clamp similarity to display range
          const clampedSimilarity = Math.max(displayMin, Math.min(displayMax, similarity));

          // Map similarity to Y coordinate (inverted: high similarity = top)
          const normalizedSimilarity = (clampedSimilarity - displayMin) / (displayMax - displayMin);
          const y = plotY + plotHeight - (normalizedSimilarity * plotHeight);

          if (!hasValidPoint) {
            ctx.moveTo(x, y);
            hasValidPoint = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }

      ctx.stroke();
    }

    // Draw current values for each segment (legend)
    const lastFrame = history[history.length - 1];
    if (lastFrame && lastFrame.length > 0) {
      ctx.font = '9px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      for (let segIdx = 0; segIdx < lastFrame.length; segIdx++) {
        const color = CycleSimilarityRenderer.SEGMENT_COLORS[segIdx % CycleSimilarityRenderer.SEGMENT_COLORS.length];
        const similarity = lastFrame[segIdx];
        
        // Draw colored box for legend
        const legendY = plotY + segIdx * 12;
        ctx.fillStyle = color;
        ctx.fillRect(plotX + plotWidth - 60, legendY, 8, 8);
        
        // Draw segment label and value
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${segIdx + 1}-${segIdx + 2}: ${similarity.toFixed(2)}`, plotX + plotWidth - 48, legendY);
      }
    }

    // Draw segment label
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(segmentLabel, plotX + plotWidth / 2, height - 3);

    ctx.restore();
  }

  /**
   * Update all cycle similarity graphs
   * @param similarities8div 8 divisions (1/2 cycle each): 7 similarity values
   * @param similarities4div 4 divisions (1 cycle each): 3 similarity values
   * @param similarities2div 2 divisions (2 cycles each): 1 similarity value
   */
  updateGraphs(
    similarities8div?: number[],
    similarities4div?: number[],
    similarities2div?: number[]
  ): void {
    // Update history buffers
    if (similarities8div && similarities8div.length > 0) {
      this.history8div.push(similarities8div);
      if (this.history8div.length > CycleSimilarityRenderer.HISTORY_SIZE) {
        this.history8div.shift(); // Remove oldest frame
      }
    }

    if (similarities4div && similarities4div.length > 0) {
      this.history4div.push(similarities4div);
      if (this.history4div.length > CycleSimilarityRenderer.HISTORY_SIZE) {
        this.history4div.shift();
      }
    }

    if (similarities2div && similarities2div.length > 0) {
      this.history2div.push(similarities2div);
      if (this.history2div.length > CycleSimilarityRenderer.HISTORY_SIZE) {
        this.history2div.shift();
      }
    }

    // 8 divisions graph
    this.drawSimilarityGraph(
      this.ctx8div,
      this.canvas8div.width,
      this.canvas8div.height,
      this.history8div,
      '8分割 (1/2周期)',
      '連続する1/2周期間の類似度'
    );

    // 4 divisions graph
    this.drawSimilarityGraph(
      this.ctx4div,
      this.canvas4div.width,
      this.canvas4div.height,
      this.history4div,
      '4分割 (1周期)',
      '連続する1周期間の類似度'
    );

    // 2 divisions graph
    this.drawSimilarityGraph(
      this.ctx2div,
      this.canvas2div.width,
      this.canvas2div.height,
      this.history2div,
      '2分割 (2周期)',
      '連続する2周期間の類似度'
    );
  }

  /**
   * Clear all graphs
   */
  clear(): void {
    this.history8div = [];
    this.history4div = [];
    this.history2div = [];
    this.clearAllCanvases();
  }
}
