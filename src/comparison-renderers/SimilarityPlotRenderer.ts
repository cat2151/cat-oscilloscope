/**
 * SimilarityPlotRenderer - Responsible for drawing similarity history plots
 * Displays time-series changes in similarity to detect instantaneous drops
 */
export class SimilarityPlotRenderer {
  /**
   * Draw similarity history plot on similarity canvas
   * 類似度の時系列変化を表示し、瞬間的な類似度低下を検出しやすくする
   * 
   * @param ctx - Canvas 2D rendering context
   * @param width - Canvas width
   * @param height - Canvas height
   * @param similarityHistory - Array of correlation coefficients (-1.0 to 1.0).
   *                            Values are ordered chronologically from oldest to newest.
   */
  drawSimilarityPlot(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    similarityHistory: number[]
  ): void {
    if (!similarityHistory || similarityHistory.length === 0) {
      return;
    }

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
   * Draw similarity score text on a canvas
   */
  drawSimilarityText(
    ctx: CanvasRenderingContext2D,
    width: number,
    similarity: number
  ): void {
    ctx.fillStyle = '#00aaff';
    ctx.font = 'bold 14px Arial';
    const text = `Similarity: ${similarity.toFixed(3)}`;
    const textWidth = ctx.measureText(text).width;
    const x = (width - textWidth) / 2;
    ctx.fillText(text, x, 20);
  }
}
