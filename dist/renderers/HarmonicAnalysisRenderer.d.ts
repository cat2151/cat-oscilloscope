import { OverlayLayout } from '../OverlayLayout';
import { BaseOverlayRenderer } from './BaseOverlayRenderer';
/**
 * HarmonicAnalysisRenderer handles harmonic analysis overlay rendering
 * Responsible for:
 * - Displaying debugging information about frequency estimation
 */
export declare class HarmonicAnalysisRenderer extends BaseOverlayRenderer {
    /**
     * Draw harmonic analysis information overlay
     * Displays debugging information about frequency estimation when FFT method is used
     * Position and size configurable via layout
     */
    drawHarmonicAnalysis(halfFreqPeakStrengthPercent?: number, candidate1Harmonics?: number[], candidate2Harmonics?: number[], candidate1WeightedScore?: number, candidate2WeightedScore?: number, selectionReason?: string, estimatedFrequency?: number, layout?: OverlayLayout): void;
}
