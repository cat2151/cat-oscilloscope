import { amplitudeToDb, frequencyToNote } from './utils';

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
  private readonly FREQ_PLOT_WIDTH = 280; // 周波数プロット領域の幅
  private readonly FREQ_PLOT_HEIGHT = 120; // 周波数プロット領域の高さ
  private readonly FREQ_PLOT_PADDING = 10; // エッジからのパディング
  private readonly FREQ_PLOT_MIN_RANGE_PADDING_HZ = 50; // 周波数範囲の最小パディング (Hz)
  private readonly FREQ_PLOT_RANGE_PADDING_RATIO = 0.1; // 周波数範囲のパディング比率 (10%)

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

    // Draw amplitude labels on the left side (in dB format)
    for (let i = 0; i <= horizontalLines; i++) {
      const y = (this.canvas.height / horizontalLines) * i;
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
   * 右上に周波数プロットを描画
   * 周波数スパイクを検出しやすくするために、推定周波数の履歴を表示
   * 1フレームごとに1つのデータポイントが追加される
   */
  drawFrequencyPlot(frequencyHistory: number[], minFrequency: number, maxFrequency: number): void {
    if (!frequencyHistory || frequencyHistory.length === 0) {
      return;
    }

    const overlayX = this.canvas.width - this.FREQ_PLOT_WIDTH - this.FREQ_PLOT_PADDING;
    const overlayY = this.FREQ_PLOT_PADDING;

    // 半透明背景を描画
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(overlayX, overlayY, this.FREQ_PLOT_WIDTH, this.FREQ_PLOT_HEIGHT);

    // 枠線を描画
    this.ctx.strokeStyle = '#ffaa00';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(overlayX, overlayY, this.FREQ_PLOT_WIDTH, this.FREQ_PLOT_HEIGHT);

    // タイトルを描画（フレーム数を含む）
    this.ctx.fillStyle = '#ffaa00';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.fillText(`周波数推移 (${frequencyHistory.length}frame)`, overlayX + 5, overlayY + 15);

    // プロット領域を計算（タイトルと軸ラベルのためのスペースを確保）
    const plotX = overlayX + 35;
    const plotY = overlayY + 25;
    const plotWidth = this.FREQ_PLOT_WIDTH - 45;
    const plotHeight = this.FREQ_PLOT_HEIGHT - 45; // X軸ラベル用にスペースを増やす

    // データ内の周波数範囲を検出（ゼロ値を除外）
    const validFrequencies = frequencyHistory.filter(f => f > 0);
    if (validFrequencies.length === 0) {
      this.ctx.restore();
      return;
    }

    const dataMin = Math.min(...validFrequencies);
    const dataMax = Math.max(...validFrequencies);
    
    // データ範囲にパディングを追加し、最小/最大周波数制限で制約
    const rangePadding = (dataMax - dataMin) * this.FREQ_PLOT_RANGE_PADDING_RATIO || this.FREQ_PLOT_MIN_RANGE_PADDING_HZ;
    const displayMin = Math.max(minFrequency, dataMin - rangePadding);
    const displayMax = Math.min(maxFrequency, dataMax + rangePadding);

    // グリッド線を描画（実データ範囲に基づく）
    this.ctx.strokeStyle = '#333333';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    
    // 水平グリッド線（周波数軸に対応）
    for (let i = 0; i <= 4; i++) {
      const y = plotY + (plotHeight / 4) * i;
      this.ctx.moveTo(plotX, y);
      this.ctx.lineTo(plotX + plotWidth, y);
    }
    
    // 垂直グリッド線
    for (let i = 0; i <= 4; i++) {
      const x = plotX + (plotWidth / 4) * i;
      this.ctx.moveTo(x, plotY);
      this.ctx.lineTo(x, plotY + plotHeight);
    }
    
    this.ctx.stroke();

    // Y軸ラベルを描画（周波数値 - 左側）
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

    // 右Y軸ラベルを描画（cent単位 - 各周波数の最寄り音符からの偏差）
    this.ctx.fillStyle = '#88ccff';
    this.ctx.font = '9px monospace';
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';
    
    for (let i = 0; i <= 4; i++) {
      const freq = displayMax - (displayMax - displayMin) * (i / 4);
      const y = plotY + (plotHeight / 4) * i;
      const noteInfo = frequencyToNote(freq);
      if (noteInfo) {
        const centsSign = noteInfo.cents >= 0 ? '+' : '';
        this.ctx.fillText(`${centsSign}${noteInfo.cents}¢`, plotX + plotWidth - 5, y);
      }
    }

    // 周波数プロットの線を描画
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    const xStep = plotWidth / Math.max(frequencyHistory.length - 1, 1);
    
    // X軸ラベルのフォント設定を事前に準備
    const labelInterval = Math.max(1, Math.floor(frequencyHistory.length / 4));
    
    // Helper function: 周波数値をY座標に変換
    const frequencyToY = (freq: number): number => {
      const clampedFreq = Math.max(displayMin, Math.min(displayMax, freq));
      const normalizedFreq = (clampedFreq - displayMin) / (displayMax - displayMin);
      return plotY + plotHeight - (normalizedFreq * plotHeight);
    };
    
    // 線を描画（状態管理が必要なため独立ループ）
    let hasValidPoint = false;
    for (let i = 0; i < frequencyHistory.length; i++) {
      const freq = frequencyHistory[i];
      const x = plotX + i * xStep;
      
      // ゼロ値（無信号）はスキップして描画しない
      if (freq === 0) {
        hasValidPoint = false;
        continue;
      }
      
      const y = frequencyToY(freq);
      
      // 線の描画
      if (!hasValidPoint) {
        this.ctx.moveTo(x, y);
        hasValidPoint = true;
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    
    this.ctx.stroke();
    
    // データポイントマーカーとX軸ラベルを描画（統合ループ）
    this.ctx.font = '9px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    
    for (let i = 0; i < frequencyHistory.length; i++) {
      const freq = frequencyHistory[i];
      const x = plotX + i * xStep;
      
      // データポイントマーカーを描画（周波数値が0でない場合）
      if (freq !== 0) {
        const y = frequencyToY(freq);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      // X軸ラベルを描画（labelIntervalごと、または最新フレーム）
      const isLatestFrame = i === frequencyHistory.length - 1;
      const shouldDrawLabel = (i % labelInterval === 0) || isLatestFrame;
      
      if (shouldDrawLabel) {
        this.ctx.fillStyle = '#aaaaaa';
        // 最新のフレームからの相対位置を表示（例：-50, -25, 0）
        const frameOffset = i - frequencyHistory.length + 1;
        this.ctx.fillText(`${frameOffset}`, x, plotY + plotHeight + 2);
      }
    }

    // 現在の周波数値とcent偏差を描画 (inside plot area at bottom)
    const currentFreq = frequencyHistory[frequencyHistory.length - 1];
    if (currentFreq > 0) {
      const noteInfo = frequencyToNote(currentFreq);
      this.ctx.fillStyle = '#00ff00';
      this.ctx.font = 'bold 11px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'bottom';
      
      let displayText = `${currentFreq.toFixed(1)} Hz`;
      if (noteInfo) {
        const centsSign = noteInfo.cents >= 0 ? '+' : '';
        displayText += ` (${noteInfo.noteName} ${centsSign}${noteInfo.cents}¢)`;
      }
      this.ctx.fillText(displayText, plotX + 2, plotY + plotHeight - 2);
    }

    this.ctx.restore();
  }

  /**
   * Draw phase markers on the waveform
   * @param phaseZeroIndex - Sample index for phase 0 (red line)
   * @param phaseTwoPiIndex - Sample index for phase 2π (red line)
   * @param phaseMinusQuarterPiIndex - Sample index for phase -π/4 (orange line)
   * @param phaseTwoPiPlusQuarterPiIndex - Sample index for phase 2π+π/4 (orange line)
   * @param displayStartIndex - Start index of the displayed region
   * @param displayEndIndex - End index of the displayed region
   */
  drawPhaseMarkers(
    phaseZeroIndex?: number,
    phaseTwoPiIndex?: number,
    phaseMinusQuarterPiIndex?: number,
    phaseTwoPiPlusQuarterPiIndex?: number,
    displayStartIndex?: number,
    displayEndIndex?: number
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
      if (relativeIndex < 0 || relativeIndex > displayLength) {
        return; // Index is outside the displayed region
      }

      const x = (relativeIndex / displayLength) * this.canvas.width;

      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = lineWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
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
    }

    if (phaseTwoPiIndex !== undefined) {
      drawVerticalLine(phaseTwoPiIndex, '#ff0000', 2);
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
