import { OverlayLayout, resolveValue } from '../OverlayLayout';

/**
 * FFTOverlayRenderer handles FFT spectrum overlay rendering
 * Responsible for:
 * - Drawing FFT spectrum bars
 * - Drawing fundamental frequency marker
 */
export class FFTOverlayRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvasWidth: number;
  private canvasHeight: number;
  private readonly FFT_OVERLAY_HEIGHT_RATIO = 0.9; // Spectrum bar height ratio within overlay (90%)
  private readonly FFT_MIN_BAR_WIDTH = 1; // Minimum bar width in pixels

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
   * Draw FFT spectrum overlay (position and size configurable via layout)
   */
  drawFFTOverlay(
    frequencyData: Uint8Array,
    estimatedFrequency: number,
    sampleRate: number,
    fftSize: number,
    maxFrequency: number,
    layout?: OverlayLayout
  ): void {
    const binFrequency = sampleRate / fftSize;

    // Calculate overlay dimensions using layout config
    const defaultOverlayWidth = Math.floor(this.canvasWidth * 0.35);
    const defaultOverlayHeight = Math.floor(this.canvasHeight * 0.35);
    const defaultOverlayX = 10;
    const defaultOverlayY = this.canvasHeight - defaultOverlayHeight - 10;

    const { x: overlayX, y: overlayY, width: overlayWidth, height: overlayHeight } = this.calculateOverlayDimensions(
      layout,
      defaultOverlayX,
      defaultOverlayY,
      defaultOverlayWidth,
      defaultOverlayHeight
    );

    // Draw semi-transparent background
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(overlayX, overlayY, overlayWidth, overlayHeight);

    // Draw border
    this.ctx.strokeStyle = '#00aaff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(overlayX, overlayY, overlayWidth, overlayHeight);

    // Draw spectrum bars (only up to maxFrequency)
    const maxBin = Math.min(
      frequencyData.length,
      Math.ceil(maxFrequency / binFrequency)
    );
    const barWidth = overlayWidth / maxBin;

    this.ctx.fillStyle = '#00aaff';
    for (let i = 0; i < maxBin; i++) {
      const magnitude = frequencyData[i];
      const barHeight = (magnitude / 255) * overlayHeight * this.FFT_OVERLAY_HEIGHT_RATIO;
      const x = overlayX + i * barWidth;
      const y = overlayY + overlayHeight - barHeight;

      this.ctx.fillRect(x, y, Math.max(barWidth - 1, this.FFT_MIN_BAR_WIDTH), barHeight);
    }

    // Draw fundamental frequency marker
    if (estimatedFrequency > 0 && estimatedFrequency <= maxFrequency) {
      const frequencyBin = estimatedFrequency / binFrequency;
      const markerX = overlayX + frequencyBin * barWidth;

      this.ctx.strokeStyle = '#ff00ff';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(markerX, overlayY);
      this.ctx.lineTo(markerX, overlayY + overlayHeight);
      this.ctx.stroke();

      // Draw frequency label
      this.ctx.fillStyle = '#ff00ff';
      this.ctx.font = 'bold 12px Arial';
      const label = `${estimatedFrequency.toFixed(1)} Hz`;
      const textWidth = this.ctx.measureText(label).width;
      
      // Position label to avoid going off canvas
      let labelX = markerX + 3;
      if (labelX + textWidth > overlayX + overlayWidth - 5) {
        labelX = markerX - textWidth - 3;
      }
      
      this.ctx.fillText(label, labelX, overlayY + 15);
    }

    this.ctx.restore();
  }

  /**
   * Helper method to calculate overlay dimensions based on layout config
   */
  private calculateOverlayDimensions(
    layout: OverlayLayout | undefined,
    defaultX: number,
    defaultY: number,
    defaultWidth: number,
    defaultHeight: number
  ): { x: number; y: number; width: number; height: number } {
    if (!layout) {
      return { x: defaultX, y: defaultY, width: defaultWidth, height: defaultHeight };
    }

    let x = defaultX;
    let y = defaultY;
    let width = defaultWidth;
    let height = defaultHeight;

    // Resolve X position
    if (layout.position.x !== undefined) {
      if (typeof layout.position.x === 'string' && layout.position.x.startsWith('right-')) {
        const offset = parseInt(layout.position.x.substring(6), 10);
        const resolvedWidth = typeof layout.size.width === 'string' && layout.size.width.endsWith('%')
          ? resolveValue(layout.size.width, this.canvasWidth)
          : (typeof layout.size.width === 'number' ? layout.size.width : defaultWidth);
        x = this.canvasWidth - resolvedWidth - offset;
      } else {
        x = resolveValue(layout.position.x, this.canvasWidth);
      }
    }

    // Resolve Y position
    if (layout.position.y !== undefined) {
      y = resolveValue(layout.position.y, this.canvasHeight);
    }

    // Resolve width
    if (layout.size.width !== undefined && layout.size.width !== 'auto') {
      width = resolveValue(layout.size.width, this.canvasWidth);
    }

    // Resolve height
    if (layout.size.height !== undefined && layout.size.height !== 'auto') {
      height = resolveValue(layout.size.height, this.canvasHeight);
    }

    return { x, y, width, height };
  }
}
