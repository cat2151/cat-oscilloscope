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
  private readonly FREQ_PLOT_WIDTH = 280; // Width of frequency plot area
  private readonly FREQ_PLOT_HEIGHT = 120; // Height of frequency plot area
  private readonly FREQ_PLOT_PADDING = 10; // Padding from edge
  private readonly FREQ_PLOT_MIN_RANGE_PADDING_HZ = 50; // Minimum padding for frequency range (Hz)
  private readonly FREQ_PLOT_RANGE_PADDING_RATIO = 0.1; // Percentage padding for frequency range (10%)

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context');
    }
    this.ctx = context;
  }

  /**
   * Clear canvas and draw grid with measurement labels
   * @param sampleRate - Audio sample rate in Hz (optional)
   * @param displaySamples - Number of samples displayed on screen (optional)
   * @param gain - Current gain multiplier (optional)
   */
  clearAndDrawGrid(sampleRate?: number, displaySamples?: number, gain?: number): void {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid with labels if measurement data is available
    this.drawGrid(sampleRate, displaySamples, gain);
  }

  /**
   * Draw grid lines with measurement labels
   * @param sampleRate - Audio sample rate in Hz (optional)
   * @param displaySamples - Number of samples displayed on screen (optional)
   * @param gain - Current gain multiplier (optional)
   */
  private drawGrid(sampleRate?: number, displaySamples?: number, gain?: number): void {
    this.ctx.strokeStyle = '#222222';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();

    // Horizontal lines (amplitude divisions)
    const horizontalLines = 5;
    for (let i = 0; i <= horizontalLines; i++) {
      const y = (this.canvas.height / horizontalLines) * i;
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
    }

    // Vertical lines (time divisions)
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
      const x = (this.canvas.width / verticalLines) * i;
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
      const labelX = Math.max(2, Math.min(x - textWidth / 2, this.canvas.width - textWidth - 2));
      this.ctx.fillText(label, labelX, this.canvas.height - 3);
    }

    // Calculate amplitude per division (horizontal grid spacing)
    // The canvas height represents ±1.0 raw amplitude scaled by gain
    // Each division from center represents: (canvasHeight/2) / (horizontalLines/2) pixels
    const horizontalLines = 5;
    const divisionsFromCenter = horizontalLines / 2; // 2.5 divisions from center to edge
    const amplitudePerDivision = 1.0 / (divisionsFromCenter * gain); // Raw amplitude per division

    // Draw amplitude labels on the left side
    for (let i = 0; i <= horizontalLines; i++) {
      const y = (this.canvas.height / horizontalLines) * i;
      // Calculate amplitude: center is 0, top is positive, bottom is negative
      const divisionsFromCenterLine = (horizontalLines / 2) - i;
      const amplitude = divisionsFromCenterLine * amplitudePerDivision;
      
      let label: string;
      if (amplitude === 0) {
        label = '0.000';
      } else if (Math.abs(amplitude) >= 1) {
        label = amplitude.toFixed(2);
      } else if (Math.abs(amplitude) >= 0.01) {
        label = amplitude.toFixed(3);
      } else {
        label = amplitude.toExponential(1);
      }
      
      // Draw label on left side with padding
      this.ctx.fillText(label, 3, y + 10);
    }

    this.ctx.restore();
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

  /**
   * Draw frequency plot in top-right corner
   * Shows the history of estimated frequencies to help users detect spikes
   */
  drawFrequencyPlot(frequencyHistory: number[], minFrequency: number, maxFrequency: number): void {
    if (!frequencyHistory || frequencyHistory.length === 0) {
      return;
    }

    const overlayX = this.canvas.width - this.FREQ_PLOT_WIDTH - this.FREQ_PLOT_PADDING;
    const overlayY = this.FREQ_PLOT_PADDING;

    // Draw semi-transparent background
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(overlayX, overlayY, this.FREQ_PLOT_WIDTH, this.FREQ_PLOT_HEIGHT);

    // Draw border
    this.ctx.strokeStyle = '#ffaa00';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(overlayX, overlayY, this.FREQ_PLOT_WIDTH, this.FREQ_PLOT_HEIGHT);

    // Draw title
    this.ctx.fillStyle = '#ffaa00';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.fillText('周波数推移 (Frequency)', overlayX + 5, overlayY + 15);

    // Calculate plot area (leave space for title and axis labels)
    const plotX = overlayX + 35;
    const plotY = overlayY + 25;
    const plotWidth = this.FREQ_PLOT_WIDTH - 45;
    const plotHeight = this.FREQ_PLOT_HEIGHT - 35;

    // Draw grid lines
    this.ctx.strokeStyle = '#333333';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = plotY + (plotHeight / 4) * i;
      this.ctx.moveTo(plotX, y);
      this.ctx.lineTo(plotX + plotWidth, y);
    }
    
    // Vertical grid lines
    for (let i = 0; i <= 4; i++) {
      const x = plotX + (plotWidth / 4) * i;
      this.ctx.moveTo(x, plotY);
      this.ctx.lineTo(x, plotY + plotHeight);
    }
    
    this.ctx.stroke();

    // Find frequency range in the data (excluding zeros)
    const validFrequencies = frequencyHistory.filter(f => f > 0);
    if (validFrequencies.length === 0) {
      this.ctx.restore();
      return;
    }

    const dataMin = Math.min(...validFrequencies);
    const dataMax = Math.max(...validFrequencies);
    
    // Use data range with some padding, constrained by min/max frequency limits
    const rangePadding = (dataMax - dataMin) * this.FREQ_PLOT_RANGE_PADDING_RATIO || this.FREQ_PLOT_MIN_RANGE_PADDING_HZ;
    const displayMin = Math.max(minFrequency, dataMin - rangePadding);
    const displayMax = Math.min(maxFrequency, dataMax + rangePadding);

    // Draw Y-axis labels (frequency values)
    this.ctx.fillStyle = '#aaaaaa';
    this.ctx.font = '10px monospace';
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';
    
    for (let i = 0; i <= 4; i++) {
      const freq = displayMax - (displayMax - displayMin) * (i / 4);
      const y = plotY + (plotHeight / 4) * i;
      const label = freq >= 1000 ? `${(freq / 1000).toFixed(1)}k` : `${freq.toFixed(0)}`;
      this.ctx.fillText(label, plotX - 5, y);
    }

    // Draw the frequency plot line
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    const xStep = plotWidth / Math.max(frequencyHistory.length - 1, 1);
    
    for (let i = 0; i < frequencyHistory.length; i++) {
      const freq = frequencyHistory[i];
      const x = plotX + i * xStep;
      
      // Skip zero values (no signal) by not drawing
      if (freq === 0) {
        continue;
      }
      
      // Clamp frequency to display range
      const clampedFreq = Math.max(displayMin, Math.min(displayMax, freq));
      
      // Map frequency to y coordinate (inverted: high freq = top)
      const normalizedFreq = (clampedFreq - displayMin) / (displayMax - displayMin);
      const y = plotY + plotHeight - (normalizedFreq * plotHeight);
      
      if (i === 0 || frequencyHistory[i - 1] === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    
    this.ctx.stroke();

    // Draw current frequency value
    const currentFreq = frequencyHistory[frequencyHistory.length - 1];
    if (currentFreq > 0) {
      this.ctx.fillStyle = '#00ff00';
      this.ctx.font = 'bold 11px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'top';
      this.ctx.fillText(`${currentFreq.toFixed(1)} Hz`, plotX + 2, plotY + plotHeight + 5);
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
