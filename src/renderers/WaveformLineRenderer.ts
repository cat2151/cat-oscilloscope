/**
 * WaveformLineRenderer handles waveform line drawing
 * Responsible for:
 * - Drawing the main waveform signal as a line
 */
export class WaveformLineRenderer {
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
   * Draw waveform
   */
  drawWaveform(data: Float32Array, startIndex: number, endIndex: number, gain: number): void {
    const dataLength = endIndex - startIndex;
    if (dataLength <= 0) return;

    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    const sliceWidth = this.canvasWidth / dataLength;
    const centerY = this.canvasHeight / 2;
    const baseAmplitude = this.canvasHeight / 2;
    const amplitude = baseAmplitude * gain;

    for (let i = 0; i < dataLength; i++) {
      const dataIndex = startIndex + i;
      const value = data[dataIndex];
      const rawY = centerY - (value * amplitude);
      const y = Math.min(this.canvasHeight, Math.max(0, rawY));
      const x = i * sliceWidth;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    this.ctx.stroke();
  }
}
