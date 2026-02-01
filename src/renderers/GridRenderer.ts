import { amplitudeToDb } from '../utils';

/**
 * GridRenderer handles grid and measurement label rendering
 * Responsible for:
 * - Grid line rendering
 * - Time axis labels
 * - Amplitude axis labels (in dB format)
 */
export class GridRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    this.ctx = ctx;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  /**
   * Update canvas dimensions (call when canvas size changes)
   */
  updateDimensions(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  /**
   * Draw grid lines with measurement labels
   * @param sampleRate - Audio sample rate in Hz (optional)
   * @param displaySamples - Number of samples displayed on screen (optional)
   * @param gain - Current gain multiplier (optional)
   */
  drawGrid(sampleRate?: number, displaySamples?: number, gain?: number): void {
    this.ctx.strokeStyle = '#222222';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();

    // Horizontal lines (amplitude divisions)
    const horizontalLines = 5;
    for (let i = 0; i <= horizontalLines; i++) {
      const y = (this.canvasHeight / horizontalLines) * i;
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvasWidth, y);
    }

    // Vertical lines (time divisions)
    const verticalLines = 10;
    for (let i = 0; i <= verticalLines; i++) {
      const x = (this.canvasWidth / verticalLines) * i;
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvasHeight);
    }

    this.ctx.stroke();

    // Center line (zero line)
    this.ctx.strokeStyle = '#444444';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.canvasHeight / 2);
    this.ctx.lineTo(this.canvasWidth, this.canvasHeight / 2);
    this.ctx.stroke();

    // Draw measurement labels if data is available and valid
    if (sampleRate && sampleRate > 0 && displaySamples && displaySamples > 0 && gain !== undefined && gain > 0) {
      this.drawGridLabels(sampleRate, displaySamples, gain);
    }
  }

  /**
   * Draw grid measurement labels
   * @param sampleRate - Audio sample rate in Hz
   * @param displaySamples - Number of samples displayed on screen
   * @param gain - Current gain multiplier
   */
  private drawGridLabels(sampleRate: number, displaySamples: number, gain: number): void {
    this.ctx.save();
    this.ctx.font = '11px monospace';
    this.ctx.fillStyle = '#666666';

    // Calculate time per division (vertical grid spacing)
    const displayTimeMs = (displaySamples / sampleRate) * 1000; // Total display time in ms
    const verticalLines = 10;
    const timePerDivision = displayTimeMs / verticalLines;

    // Draw time labels at the bottom of the canvas
    for (let i = 0; i <= verticalLines; i++) {
      const x = (this.canvasWidth / verticalLines) * i;
      const timeMs = timePerDivision * i;
      
      let label: string;
      if (timeMs >= 1000) {
        label = `${(timeMs / 1000).toFixed(2)}s`;
      } else if (timeMs >= 1) {
        label = `${timeMs.toFixed(1)}ms`;
      } else {
        label = `${(timeMs * 1000).toFixed(0)}μs`;
      }
      
      // Draw label at bottom, slightly offset to avoid overlap
      const textWidth = this.ctx.measureText(label).width;
      const labelX = Math.max(2, Math.min(x - textWidth / 2, this.canvasWidth - textWidth - 2));
      this.ctx.fillText(label, labelX, this.canvasHeight - 3);
    }

    // Calculate amplitude per division (horizontal grid spacing)
    // The canvas height represents ±1.0 raw amplitude scaled by gain
    // Each division from center represents: (canvasHeight/2) / (horizontalLines/2) pixels
    const horizontalLines = 5;
    const divisionsFromCenter = horizontalLines / 2; // 2.5 divisions from center to edge
    const amplitudePerDivision = 1.0 / (divisionsFromCenter * gain); // Raw amplitude per division

    // Draw amplitude labels on the left side (in dB format)
    for (let i = 0; i <= horizontalLines; i++) {
      const y = (this.canvasHeight / horizontalLines) * i;
      // Calculate amplitude: center is 0, top is positive, bottom is negative
      const divisionsFromCenterLine = (horizontalLines / 2) - i;
      const amplitude = divisionsFromCenterLine * amplitudePerDivision;
      
      let label: string;
      if (amplitude === 0) {
        // Center line is -Infinity dB in theory, but we show it as a reference
        label = '0dB*';
      } else {
        const db = amplitudeToDb(Math.abs(amplitude));
        // The sign indicates waveform polarity (top=positive, bottom=negative)
        // The dB magnitude is calculated from absolute amplitude
        const sign = amplitude > 0 ? '+' : '-';
        const absDb = Math.abs(db);
        if (absDb >= 100) {
          label = `${sign}${absDb.toFixed(0)}dB`;
        } else {
          label = `${sign}${absDb.toFixed(1)}dB`;
        }
      }
      
      // Draw label on left side with padding
      this.ctx.fillText(label, 3, y + 10);
    }

    this.ctx.restore();
  }
}
