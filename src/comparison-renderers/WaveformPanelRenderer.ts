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
   * Clear a canvas
   */
  clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
  }
}
