/**
 * OffsetOverlayRenderer - Responsible for drawing phase marker offset overlay graphs
 * Displays frame-to-frame delta of phase markers on current waveform canvas
 * Fixed for issue #254: Now shows deltas instead of absolute positions to avoid spikes
 */
export class OffsetOverlayRenderer {
  /**
   * Draw phase marker offset overlay graphs on current waveform canvas
   * Displays two line graphs showing the frame-to-frame delta of phase markers
   * @param ctx - Canvas 2D rendering context
   * @param width - Canvas width
   * @param height - Canvas height
   * @param phaseZeroOffsetHistory - Array of frame-to-frame delta percentages for phase zero (start red line)
   * @param phaseTwoPiOffsetHistory - Array of frame-to-frame delta percentages for phase 2π (end red line)
   */
  drawOffsetOverlayGraphs(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    phaseZeroOffsetHistory: number[] = [],
    phaseTwoPiOffsetHistory: number[] = []
  ): void {
    if (phaseZeroOffsetHistory.length === 0 && phaseTwoPiOffsetHistory.length === 0) {
      return;
    }

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
    ctx.fillText('Δ Offset %', plotX + 2, plotY + 9);

    // Calculate plot area inside border
    const innerPadding = 2;
    const innerPlotX = plotX + innerPadding;
    const innerPlotY = plotY + 12;
    const innerPlotWidth = plotWidth - innerPadding * 2;
    const innerPlotHeight = plotHeight - 12 - innerPadding;

    // Determine Y-axis range: -5% to +5% (expecting ±1% per frame)
    // Expanded range to accommodate occasional larger deltas during mode switches
    const minPercent = -5;
    const maxPercent = 5;
    const zeroLine = innerPlotY + innerPlotHeight / 2; // Middle of plot

    // Draw zero reference line
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(innerPlotX, zeroLine);
    ctx.lineTo(innerPlotX + innerPlotWidth, zeroLine);
    ctx.stroke();

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

        // Map percentage to Y coordinate (inverted: positive = top, negative = bottom)
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
      // Show + or - sign explicitly
      const sign = currentZeroOffset >= 0 ? '+' : '';
      ctx.fillText(`S:${sign}${currentZeroOffset.toFixed(1)}%`, plotX + 2, plotY + plotHeight - 11);
    }

    if (phaseTwoPiOffsetHistory.length > 0) {
      const currentTwoPiOffset = phaseTwoPiOffsetHistory[phaseTwoPiOffsetHistory.length - 1];
      ctx.fillStyle = '#ff8800';
      const sign = currentTwoPiOffset >= 0 ? '+' : '';
      ctx.fillText(`E:${sign}${currentTwoPiOffset.toFixed(1)}%`, plotX + 2, plotY + plotHeight - 2);
    }

    ctx.restore();
  }
}
