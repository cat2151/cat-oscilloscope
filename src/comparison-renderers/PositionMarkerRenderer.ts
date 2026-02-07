/**
 * PositionMarkerRenderer - Responsible for drawing position markers
 * Displays start and end positions on the buffer canvas
 */
export class PositionMarkerRenderer {
  /**
   * Draw vertical position markers
   */
  drawPositionMarkers(
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
   * Draw phase marker vertical lines on the buffer canvas
   * Red lines for phaseZero and phaseTwoPi, orange lines for phaseMinusQuarterPi and phaseTwoPiPlusQuarterPi
   */
  drawPhaseMarkers(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    totalLength: number,
    phaseZeroIndex?: number,
    phaseTwoPiIndex?: number,
    phaseMinusQuarterPiIndex?: number,
    phaseTwoPiPlusQuarterPiIndex?: number
  ): void {
    if (totalLength <= 0) return;

    const drawLine = (index: number, color: string) => {
      const x = (index / totalLength) * width;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    };

    // Draw orange lines first (so red lines appear on top)
    if (phaseMinusQuarterPiIndex !== undefined) {
      drawLine(phaseMinusQuarterPiIndex, '#ff8800');
    }
    if (phaseTwoPiPlusQuarterPiIndex !== undefined) {
      drawLine(phaseTwoPiPlusQuarterPiIndex, '#ff8800');
    }

    // Draw red lines
    if (phaseZeroIndex !== undefined) {
      drawLine(phaseZeroIndex, '#ff0000');
    }
    if (phaseTwoPiIndex !== undefined) {
      drawLine(phaseTwoPiIndex, '#ff0000');
    }
  }
}
