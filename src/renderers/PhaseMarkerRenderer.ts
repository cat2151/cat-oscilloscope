/**
 * PhaseMarkerRenderer handles phase marker rendering
 * Responsible for:
 * - Drawing phase markers on the waveform
 * - Drawing debug information for phase tracking
 */
export class PhaseMarkerRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvasWidth: number;
  private canvasHeight: number;
  private debugOverlaysEnabled: boolean;

  constructor(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, debugOverlaysEnabled = true) {
    this.ctx = ctx;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.debugOverlaysEnabled = debugOverlaysEnabled;
  }

  /**
   * Update canvas dimensions (call when canvas size changes)
   */
  updateDimensions(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  /**
   * Set debug overlays enabled state
   */
  setDebugOverlaysEnabled(enabled: boolean): void {
    this.debugOverlaysEnabled = enabled;
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
    if (displayStartIndex === undefined || displayEndIndex === undefined) {
      return;
    }

    const displayLength = displayEndIndex - displayStartIndex;
    if (displayLength <= 0) {
      return;
    }

    this.ctx.save();

    // Helper function to draw a vertical line at a given sample index
    const drawVerticalLine = (sampleIndex: number, color: string, lineWidth: number) => {
      // Convert sample index to canvas x coordinate
      const relativeIndex = sampleIndex - displayStartIndex;
      if (relativeIndex < 0 || relativeIndex >= displayLength) {
        return; // Index is outside the displayed region
      }

      const x = (relativeIndex / displayLength) * this.canvasWidth;

      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = lineWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvasHeight);
      this.ctx.stroke();
    };

    // Draw orange lines first (so red lines appear on top)
    if (phaseMinusQuarterPiIndex !== undefined) {
      drawVerticalLine(phaseMinusQuarterPiIndex, '#ff8800', 2);
    }

    if (phaseTwoPiPlusQuarterPiIndex !== undefined) {
      drawVerticalLine(phaseTwoPiPlusQuarterPiIndex, '#ff8800', 2);
    }

    // Draw red lines
    if (phaseZeroIndex !== undefined) {
      drawVerticalLine(phaseZeroIndex, '#ff0000', 2);
      
      // Add debug information if available (issue #220)
      if (this.debugOverlaysEnabled && debugInfo?.phaseZeroSegmentRelative !== undefined) {
        const relativeIndex = phaseZeroIndex - displayStartIndex;
        const x = (relativeIndex / displayLength) * this.canvasWidth;
        const y = 20; // Position near top
        
        this.ctx.save();
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        
        const segRel = debugInfo.phaseZeroSegmentRelative;
        const history = debugInfo.phaseZeroHistory ?? '?';
        const tolerance = debugInfo.phaseZeroTolerance ?? '?';
        const mode = debugInfo.zeroCrossModeName ?? 'Unknown';
        
        const debugText = [
          `Mode: ${mode}`,
          `Seg Rel: ${segRel}`,
          `History: ${history}`,
          `Tolerance: ±${tolerance}`,
          `Range: ${typeof history === 'number' && typeof tolerance === 'number' 
            ? `${history - tolerance}~${history + tolerance}` : '?'}`
        ];
        
        debugText.forEach((text, i) => {
          this.ctx.fillText(text, x + 5, y + i * 14);
        });
        
        this.ctx.restore();
      }
    }

    if (phaseTwoPiIndex !== undefined) {
      drawVerticalLine(phaseTwoPiIndex, '#ff0000', 2);
    }

    this.ctx.restore();
  }
}
