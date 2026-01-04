/**
 * DebugRenderer handles debug visualization for phase estimation debugging
 * Responsible for:
 * - Drawing the full search buffer waveform
 * - Drawing vertical lines for all zero-cross/peak candidates
 * - Drawing the reference waveform (previous frame's 0-2π) on the left side
 */
export class DebugRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private debugDisplayEnabled = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context for debug canvas');
    }
    this.ctx = context;
  }

  /**
   * Set debug display enabled/disabled
   */
  setDebugDisplay(enabled: boolean): void {
    this.debugDisplayEnabled = enabled;
    // Show or hide the canvas
    this.canvas.style.display = enabled ? 'block' : 'none';
  }

  /**
   * Get debug display enabled status
   */
  getDebugDisplayEnabled(): boolean {
    return this.debugDisplayEnabled;
  }

  /**
   * Clear debug canvas and draw grid
   */
  private clearAndDrawGrid(): void {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    this.ctx.strokeStyle = '#222222';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();

    // Horizontal lines
    const horizontalLines = 4;
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
   * Draw reference waveform on the left side
   */
  private drawReferenceWaveform(referenceData: Float32Array): void {
    if (referenceData.length === 0) {
      return;
    }

    // Reference waveform occupies 20% of canvas width
    const referenceWidth = Math.floor(this.canvas.width * 0.2);
    const sliceWidth = referenceWidth / referenceData.length;
    const centerY = this.canvas.height / 2;
    const amplitude = this.canvas.height / 2;

    // Draw reference waveform in cyan
    this.ctx.strokeStyle = '#00ffff';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();

    for (let i = 0; i < referenceData.length; i++) {
      const value = referenceData[i];
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

    // Draw separator line
    this.ctx.strokeStyle = '#ffff00';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(referenceWidth, 0);
    this.ctx.lineTo(referenceWidth, this.canvas.height);
    this.ctx.stroke();

    // Add label
    this.ctx.fillStyle = '#ffff00';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.fillText('Reference (0-2π)', 5, 15);
  }

  /**
   * Draw search buffer waveform
   */
  private drawSearchBuffer(searchBuffer: Float32Array, referenceWidth: number): void {
    if (searchBuffer.length === 0) {
      return;
    }

    // Search buffer occupies remaining 80% of canvas width
    const searchWidth = this.canvas.width - referenceWidth;
    const sliceWidth = searchWidth / searchBuffer.length;
    const centerY = this.canvas.height / 2;
    const amplitude = this.canvas.height / 2;

    // Draw search buffer waveform in green
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();

    for (let i = 0; i < searchBuffer.length; i++) {
      const value = searchBuffer[i];
      const rawY = centerY - (value * amplitude);
      const y = Math.min(this.canvas.height, Math.max(0, rawY));
      const x = referenceWidth + (i * sliceWidth);

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    this.ctx.stroke();

    // Add label
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.fillText('Search Buffer', referenceWidth + 5, 15);
  }

  /**
   * Draw vertical lines for all candidates
   */
  private drawCandidateLines(candidates: number[], searchBuffer: Float32Array, referenceWidth: number): void {
    if (candidates.length === 0 || searchBuffer.length === 0) {
      return;
    }

    const searchWidth = this.canvas.width - referenceWidth;
    const sliceWidth = searchWidth / searchBuffer.length;

    // Draw vertical lines for each candidate
    candidates.forEach((candidateIndex, i) => {
      const x = referenceWidth + (candidateIndex * sliceWidth);

      // Alternate colors for visibility
      const colors = ['#ff0000', '#ff00ff', '#ff8800', '#ffff00'];
      this.ctx.strokeStyle = colors[i % colors.length];
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();

      // Draw candidate number label
      this.ctx.fillStyle = this.ctx.strokeStyle;
      this.ctx.font = 'bold 10px Arial';
      this.ctx.fillText(`#${i}`, x + 2, 30 + (i * 12));
    });

    // Add legend
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.fillText(`Candidates: ${candidates.length}`, referenceWidth + 5, this.canvas.height - 10);
  }

  /**
   * Render debug visualization
   * @param searchBuffer Full search buffer (current frame's waveform data)
   * @param candidates All zero-cross/peak candidates found
   * @param referenceData Previous frame's 0-2π reference waveform
   */
  renderDebug(
    searchBuffer: Float32Array | null,
    candidates: number[],
    referenceData: Float32Array | null
  ): void {
    if (!this.debugDisplayEnabled) {
      return;
    }

    // Clear and prepare canvas
    this.clearAndDrawGrid();

    // Calculate reference width (20% of canvas)
    const referenceWidth = Math.floor(this.canvas.width * 0.2);

    // Draw reference waveform on the left
    if (referenceData && referenceData.length > 0) {
      this.drawReferenceWaveform(referenceData);
    }

    // Draw search buffer waveform
    if (searchBuffer && searchBuffer.length > 0) {
      this.drawSearchBuffer(searchBuffer, referenceWidth);
      
      // Draw candidate lines
      this.drawCandidateLines(candidates, searchBuffer, referenceWidth);
    }
  }
}
