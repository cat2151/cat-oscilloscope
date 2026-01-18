/**
 * CycleSimilarityRenderer handles rendering of cycle similarity graphs
 * Displays similarity between consecutive segments for:
 * - 8 divisions (1/2 cycle each)
 * - 4 divisions (1 cycle each)
 * - 2 divisions (2 cycles each)
 */
export class CycleSimilarityRenderer {
  private canvas8div: HTMLCanvasElement;
  private canvas4div: HTMLCanvasElement;
  private canvas2div: HTMLCanvasElement;
  private ctx8div: CanvasRenderingContext2D;
  private ctx4div: CanvasRenderingContext2D;
  private ctx2div: CanvasRenderingContext2D;

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
   * Draw a similarity graph on a canvas
   * @param ctx Canvas context
   * @param width Canvas width
   * @param height Canvas height
   * @param similarities Array of similarity values (-1 to 1)
   * @param title Title text for the graph
   * @param segmentLabel Label for what each segment represents (e.g., "1/2 cycle")
   */
  private drawSimilarityGraph(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    similarities: number[],
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
    if (!similarities || similarities.length === 0) {
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

    // Vertical grid lines
    for (let i = 0; i <= similarities.length; i++) {
      const x = plotX + (plotWidth / similarities.length) * i;
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

    // Draw similarity bars
    const barWidth = plotWidth / similarities.length;
    const barPadding = barWidth * 0.15;

    for (let i = 0; i < similarities.length; i++) {
      const similarity = similarities[i];

      // Clamp similarity to display range
      const clampedSimilarity = Math.max(displayMin, Math.min(displayMax, similarity));

      // Calculate bar position and height relative to zero line
      const normalizedSimilarity = (clampedSimilarity - displayMin) / (displayMax - displayMin);
      const valueY = plotY + plotHeight - (normalizedSimilarity * plotHeight);
      const zeroY = plotY + plotHeight - (0 - displayMin) / (displayMax - displayMin) * plotHeight;

      const x = plotX + i * barWidth + barPadding;
      const w = barWidth - barPadding * 2;

      // Color based on similarity value
      if (similarity >= 0.9) {
        ctx.fillStyle = '#00ff00'; // High similarity - green
      } else if (similarity >= 0.7) {
        ctx.fillStyle = '#88ff00'; // Good similarity - yellow-green
      } else if (similarity >= 0.5) {
        ctx.fillStyle = '#ffaa00'; // Medium similarity - orange
      } else if (similarity >= 0) {
        ctx.fillStyle = '#ff6600'; // Low similarity - red-orange
      } else {
        ctx.fillStyle = '#ff0000'; // Negative correlation - red
      }

      // Draw bar from zero line to value
      // fillRect expects positive width/height, so we always pass the top-left corner and positive dimensions
      if (valueY < zeroY) {
        // Positive values: bar goes from valueY (top) to zeroY (bottom)
        ctx.fillRect(x, valueY, w, zeroY - valueY);
      } else {
        // Negative values: bar goes from zeroY (top) to valueY (bottom)
        ctx.fillRect(x, zeroY, w, valueY - zeroY);
      }

      // Draw value text above/below bar depending on sign
      ctx.fillStyle = '#ffffff';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      if (clampedSimilarity >= 0) {
        ctx.textBaseline = 'bottom';
        ctx.fillText(similarity.toFixed(2), x + w / 2, valueY - 2);
      } else {
        ctx.textBaseline = 'top';
        ctx.fillText(similarity.toFixed(2), x + w / 2, valueY + 2);
      }
    }

    // Draw zero line (at y = 0)
    const zeroY = plotY + plotHeight - (0 - displayMin) / (displayMax - displayMin) * plotHeight;
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(plotX, zeroY);
    ctx.lineTo(plotX + plotWidth, zeroY);
    ctx.stroke();

    // Draw X-axis labels (segment indices)
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '9px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let i = 0; i < similarities.length; i++) {
      const x = plotX + (i + 0.5) * barWidth;
      ctx.fillText(`${i + 1}-${i + 2}`, x, plotY + plotHeight + 2);
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
    // 8 divisions graph
    this.drawSimilarityGraph(
      this.ctx8div,
      this.canvas8div.width,
      this.canvas8div.height,
      similarities8div || [],
      '8分割 (1/2周期)',
      '連続する1/2周期間の類似度'
    );

    // 4 divisions graph
    this.drawSimilarityGraph(
      this.ctx4div,
      this.canvas4div.width,
      this.canvas4div.height,
      similarities4div || [],
      '4分割 (1周期)',
      '連続する1周期間の類似度'
    );

    // 2 divisions graph
    this.drawSimilarityGraph(
      this.ctx2div,
      this.canvas2div.width,
      this.canvas2div.height,
      similarities2div || [],
      '2分割 (2周期)',
      '連続する2周期間の類似度'
    );
  }

  /**
   * Clear all graphs
   */
  clear(): void {
    this.clearAllCanvases();
  }
}
