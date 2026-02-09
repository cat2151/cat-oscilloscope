/**
 * WaveformPanelRenderer - Responsible for drawing waveforms on comparison panels
 * Handles auto-scaling and center line drawing
 */
export class WaveformPanelRenderer {
  // Auto-scaling constants
  private readonly TARGET_FILL_RATIO = 0.9;    // Target 90% of distance from center to edge (canvas half-height) for auto-scaled waveforms
  private readonly MIN_PEAK_THRESHOLD = 0.001; // Minimum peak to trigger auto-scaling (below this uses default)
  private readonly DEFAULT_AMPLITUDE_RATIO = 0.4; // Default scaling factor when peak is too small

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
  drawWaveform(
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
  drawCenterLine(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  }

  /**
   * Draw zero-cross candidates as circles on the center line
   */
  drawZeroCrossCandidates(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    candidates: number[],
    displayStartIndex: number,
    displayEndIndex: number,
    highlightedCandidate?: number,
    targetCandidate?: number
  ): void {
    const displayLength = displayEndIndex - displayStartIndex;
    if (candidates.length === 0 || displayLength <= 0) {
      return;
    }

    const centerY = height / 2;
    const radius = 4;
    const now = performance.now();

    ctx.save();
    for (const candidate of candidates) {
      const relativeIndex = candidate - displayStartIndex;
      if (relativeIndex < 0 || relativeIndex >= displayLength) {
        continue;
      }

      const x = (relativeIndex / displayLength) * width;
      const isHighlighted = highlightedCandidate !== undefined && candidate === highlightedCandidate;
      const blinkOn = isHighlighted && Math.floor(now / 400) % 2 === 0;
      const color = isHighlighted ? (blinkOn ? '#ffff00' : '#0066ff') : '#ffff00';

      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.arc(x, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    if (targetCandidate !== undefined) {
      const relativeIndex = targetCandidate - displayStartIndex;
      if (relativeIndex >= 0 && relativeIndex < displayLength) {
        const x = (relativeIndex / displayLength) * width;
        ctx.beginPath();
        ctx.fillStyle = '#ff0000';
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.arc(x, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  /**
   * Clear a canvas
   */
  clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Draw phase marker vertical lines
   * Red lines for phaseZero and phaseTwoPi, orange lines for phaseMinusQuarterPi and phaseTwoPiPlusQuarterPi
   * @param ctx - Canvas context
   * @param width - Canvas width
   * @param height - Canvas height
   * @param displayStartIndex - Start index of the displayed region in the full buffer
   * @param displayEndIndex - End index (exclusive) of the displayed region in the full buffer
   * @param phaseZeroIndex - Sample index for phase 0 in the full buffer (red line)
   * @param phaseTwoPiIndex - Sample index for phase 2π in the full buffer (red line)
   * @param phaseMinusQuarterPiIndex - Sample index for phase -π/4 in the full buffer (orange line)
   * @param phaseTwoPiPlusQuarterPiIndex - Sample index for phase 2π+π/4 in the full buffer (orange line)
   */
  drawPhaseMarkers(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    displayStartIndex: number,
    displayEndIndex: number,
    phaseZeroIndex?: number,
    phaseTwoPiIndex?: number,
    phaseMinusQuarterPiIndex?: number,
    phaseTwoPiPlusQuarterPiIndex?: number
  ): void {
    const displayLength = displayEndIndex - displayStartIndex;
    if (displayLength <= 0) return;

    const drawLine = (index: number, color: string, lineWidth: number) => {
      // Convert sample index to canvas x coordinate relative to displayed region
      const relativeIndex = index - displayStartIndex;
      if (relativeIndex < 0 || relativeIndex >= displayLength) {
        return; // Index is outside the displayed region
      }

      const x = (relativeIndex / displayLength) * width;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    };

    // Draw orange lines first (so red lines appear on top)
    if (phaseMinusQuarterPiIndex !== undefined) {
      drawLine(phaseMinusQuarterPiIndex, '#ff8800', 2);
    }
    if (phaseTwoPiPlusQuarterPiIndex !== undefined) {
      drawLine(phaseTwoPiPlusQuarterPiIndex, '#ff8800', 2);
    }

    // Draw red lines
    if (phaseZeroIndex !== undefined) {
      drawLine(phaseZeroIndex, '#ff0000', 2);
    }
    if (phaseTwoPiIndex !== undefined) {
      drawLine(phaseTwoPiIndex, '#ff0000', 2);
    }
  }
}
