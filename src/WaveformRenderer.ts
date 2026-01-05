/**
 * WaveformRenderer handles all canvas drawing operations
 * Responsible for:
 * - Grid rendering
 * - Waveform visualization
 * - Zero-cross line indicators
 * - FFT spectrum overlay
 * - Canvas coordinate calculations
 */
export class WaveformRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private fftDisplayEnabled = true;
  private readonly FFT_OVERLAY_HEIGHT_RATIO = 0.9; // Spectrum bar height ratio within overlay (90%)
  private readonly FFT_MIN_BAR_WIDTH = 1; // Minimum bar width in pixels

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context');
    }
    this.ctx = context;
  }

  /**
   * Clear canvas and draw grid
   */
  clearAndDrawGrid(): void {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    this.drawGrid();
  }

  /**
   * Draw grid lines
   */
  private drawGrid(): void {
    this.ctx.strokeStyle = '#222222';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();

    // Horizontal lines
    const horizontalLines = 5;
    for (let i = 0; i <= horizontalLines; i++) {
      const y = (this.canvas.height / horizontalLines) * i;
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
    }

    // Vertical lines
    const verticalLines = 10;
    for (let i = 0; i <= verticalLines; i++) {
      const x = (this.canvas.width / verticalLines) * i;
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
    }

    this.ctx.stroke();

    // Center line (zero line)
    this.ctx.strokeStyle = '#444444';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.canvas.height / 2);
    this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
    this.ctx.stroke();
  }

  /**
   * Draw waveform
   */
  drawWaveform(data: Float32Array, startIndex: number, endIndex: number, gain: number): void {
    const dataLength = endIndex - startIndex;
    if (dataLength <= 0) return;

    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    const sliceWidth = this.canvas.width / dataLength;
    const centerY = this.canvas.height / 2;
    const baseAmplitude = this.canvas.height / 2;
    const amplitude = baseAmplitude * gain;

    for (let i = 0; i < dataLength; i++) {
      const dataIndex = startIndex + i;
      const value = data[dataIndex];
      const rawY = centerY - (value * amplitude);
      const y = Math.min(this.canvas.height, Math.max(0, rawY));
      const x = i * sliceWidth;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    this.ctx.stroke();
  }

  /**
   * Draw a vertical line at the zero-cross point
   */
  drawZeroCrossLine(zeroCrossIndex: number, startIndex: number, endIndex: number): void {
    const dataLength = endIndex - startIndex;
    if (dataLength <= 0) return;

    // Check if zero-cross point is within the displayed range
    if (zeroCrossIndex < startIndex || zeroCrossIndex >= endIndex) {
      return;
    }

    // Calculate the x position of the zero-cross point in canvas coordinates
    const relativeIndex = zeroCrossIndex - startIndex;
    const sliceWidth = this.canvas.width / dataLength;
    const x = relativeIndex * sliceWidth;

    // Draw a vertical line in red to mark the zero-cross point
    this.ctx.save();
    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x, 0);
    this.ctx.lineTo(x, this.canvas.height);
    this.ctx.stroke();
    this.ctx.restore();
  }

  /**
   * Draw FFT spectrum overlay in bottom-left corner of canvas
   */
  drawFFTOverlay(frequencyData: Uint8Array, estimatedFrequency: number, sampleRate: number, fftSize: number, maxFrequency: number): void {
    if (!this.fftDisplayEnabled) {
      return;
    }

    const binFrequency = sampleRate / fftSize;

    // Overlay dimensions (bottom-left corner, approximately 1/3 of canvas)
    const overlayWidth = Math.floor(this.canvas.width * 0.35);
    const overlayHeight = Math.floor(this.canvas.height * 0.35);
    const overlayX = 10; // 10px from left edge
    const overlayY = this.canvas.height - overlayHeight - 10; // 10px from bottom edge

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



  // Getters and setters
  setFFTDisplay(enabled: boolean): void {
    this.fftDisplayEnabled = enabled;
  }

  getFFTDisplayEnabled(): boolean {
    return this.fftDisplayEnabled;
  }
}
