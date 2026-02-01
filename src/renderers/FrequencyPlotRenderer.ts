import { frequencyToNote } from '../utils';
import { OverlayLayout, resolveValue } from '../OverlayLayout';

/**
 * FrequencyPlotRenderer handles frequency plot overlay rendering
 * Responsible for:
 * - Displaying frequency history plot
 * - Detecting frequency spikes
 */
export class FrequencyPlotRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvasWidth: number;
  private canvasHeight: number;
  private readonly FREQ_PLOT_MIN_RANGE_PADDING_HZ = 50; // 周波数範囲の最小パディング (Hz)
  private readonly FREQ_PLOT_RANGE_PADDING_RATIO = 0.1; // 周波数範囲のパディング比率 (10%)

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
   * Draw frequency plot overlay
   * Position and size configurable via layout
   * Displays frequency history to detect frequency spikes
   * One data point is added per frame
   */
  drawFrequencyPlot(
    frequencyHistory: number[],
    minFrequency: number,
    maxFrequency: number,
    layout?: OverlayLayout
  ): void {
    if (!frequencyHistory || frequencyHistory.length === 0) {
      return;
    }

    // Calculate overlay dimensions using layout config
    const { x: overlayX, y: overlayY, width: overlayWidth, height: overlayHeight } = this.calculateOverlayDimensions(
      layout,
      this.canvasWidth - 280 - 10,
      10,
      280,
      120
    );

    // Draw semi-transparent background
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(overlayX, overlayY, overlayWidth, overlayHeight);

    // Draw border
    this.ctx.strokeStyle = '#ffaa00';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(overlayX, overlayY, overlayWidth, overlayHeight);

    // タイトルを描画（フレーム数を含む）
    this.ctx.fillStyle = '#ffaa00';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.fillText(`周波数推移 (${frequencyHistory.length}frame)`, overlayX + 5, overlayY + 15);

    // プロット領域を計算（タイトルと軸ラベルのためのスペースを確保）
    const plotX = overlayX + 35;
    const plotY = overlayY + 25;
    const plotWidth = overlayWidth - 45;
    const plotHeight = overlayHeight - 45; // X軸ラベル用にスペースを増やす

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
