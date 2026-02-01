import { OverlayLayout } from '../OverlayLayout';
import { BaseOverlayRenderer } from './BaseOverlayRenderer';

/**
 * HarmonicAnalysisRenderer handles harmonic analysis overlay rendering
 * Responsible for:
 * - Displaying debugging information about frequency estimation
 */
export class HarmonicAnalysisRenderer extends BaseOverlayRenderer {

  /**
   * Draw harmonic analysis information overlay
   * Displays debugging information about frequency estimation when FFT method is used
   * Position and size configurable via layout
   */
  drawHarmonicAnalysis(
    halfFreqPeakStrengthPercent?: number,
    candidate1Harmonics?: number[],
    candidate2Harmonics?: number[],
    candidate1WeightedScore?: number,
    candidate2WeightedScore?: number,
    selectionReason?: string,
    estimatedFrequency?: number,
    layout?: OverlayLayout
  ): void {
    // Only display if we have data to show
    if (halfFreqPeakStrengthPercent === undefined && !candidate1Harmonics && !candidate2Harmonics && !selectionReason) {
      return;
    }
    
    // Calculate overlay dimensions using layout config
    const lineHeight = 16;
    const numLines = 1 + // Title
                     (halfFreqPeakStrengthPercent !== undefined ? 1 : 0) +
                     (candidate1Harmonics ? 1 : 0) +
                     (candidate2Harmonics ? 1 : 0) +
                     (selectionReason ? 2 : 0); // Selection reason might wrap
    const defaultOverlayHeight = numLines * lineHeight + 10;

    const { x: overlayX, y: overlayY, width: overlayWidth, height: overlayHeight } = this.calculateOverlayDimensions(
      layout,
      10,
      10,
      500,
      defaultOverlayHeight
    );

    let currentY = overlayY;
    
    this.ctx.save();
    
    // Semi-transparent background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(overlayX, overlayY, overlayWidth, overlayHeight);
    
    // Border
    this.ctx.strokeStyle = '#ffaa00';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(overlayX, overlayY, overlayWidth, overlayHeight);
    
    // Title
    this.ctx.fillStyle = '#ffaa00';
    this.ctx.font = 'bold 12px monospace';
    currentY += 15;
    this.ctx.fillText('倍音分析 (Harmonic Analysis)', overlayX + 5, currentY);
    
    // Half frequency peak strength
    if (halfFreqPeakStrengthPercent !== undefined && estimatedFrequency) {
      currentY += lineHeight;
      this.ctx.fillStyle = '#00ff00';
      this.ctx.font = '11px monospace';
      const halfFreq = estimatedFrequency / 2.0;
      this.ctx.fillText(
        `1/2周波数 (${halfFreq.toFixed(1)}Hz) のpeak強度: ${halfFreqPeakStrengthPercent.toFixed(1)}%`,
        overlayX + 5,
        currentY
      );
    }
    
    // Candidate 1 harmonics
    if (candidate1Harmonics && estimatedFrequency) {
      currentY += lineHeight;
      this.ctx.fillStyle = '#ff00ff';
      this.ctx.font = '11px monospace';
      const harmonicsStr = candidate1Harmonics.map((v, i) => `${i+1}x:${v.toFixed(2)}`).join(' ');
      const weightedStr = candidate1WeightedScore !== undefined ? ` (重み付け: ${candidate1WeightedScore.toFixed(1)})` : '';
      this.ctx.fillText(
        `候補1 (${estimatedFrequency.toFixed(1)}Hz) 倍音: ${harmonicsStr}${weightedStr}`,
        overlayX + 5,
        currentY
      );
    }
    
    // Candidate 2 harmonics
    if (candidate2Harmonics && estimatedFrequency) {
      currentY += lineHeight;
      this.ctx.fillStyle = '#00aaff';
      this.ctx.font = '11px monospace';
      const halfFreq = estimatedFrequency / 2.0;
      const harmonicsStr = candidate2Harmonics.map((v, i) => `${i+1}x:${v.toFixed(2)}`).join(' ');
      const weightedStr = candidate2WeightedScore !== undefined ? ` (重み付け: ${candidate2WeightedScore.toFixed(1)})` : '';
      this.ctx.fillText(
        `候補2 (${halfFreq.toFixed(1)}Hz) 倍音: ${harmonicsStr}${weightedStr}`,
        overlayX + 5,
        currentY
      );
    }
    
    // Selection reason
    if (selectionReason) {
      currentY += lineHeight;
      this.ctx.fillStyle = '#aaaaaa';
      this.ctx.font = '10px monospace';
      // Wrap text if too long
      const maxWidth = overlayWidth - 10;
      const words = selectionReason.split(' ');
      let line = '';
      
      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const metrics = this.ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && line) {
          this.ctx.fillText(line, overlayX + 5, currentY);
          currentY += lineHeight;
          line = word;
        } else {
          line = testLine;
        }
      }
      
      if (line) {
        this.ctx.fillText(line, overlayX + 5, currentY);
      }
    }
    
    this.ctx.restore();
  }
}
