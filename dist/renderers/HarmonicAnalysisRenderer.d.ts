import { OverlayLayout } from '../OverlayLayout';
/**
 * HarmonicAnalysisRenderer handles harmonic analysis overlay rendering
 * Responsible for:
 * - Displaying debugging information about frequency estimation
 */
export declare class HarmonicAnalysisRenderer {
    private ctx;
    private canvasWidth;
    private canvasHeight;
    constructor(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number);
    /**
     * Update canvas dimensions (call when canvas size changes)
     */
    updateDimensions(width: number, height: number): void;
    /**
     * Draw harmonic analysis information overlay
     * Displays debugging information about frequency estimation when FFT method is used
     * Position and size configurable via layout
     */
    drawHarmonicAnalysis(halfFreqPeakStrengthPercent?: number, candidate1Harmonics?: number[], candidate2Harmonics?: number[], candidate1WeightedScore?: number, candidate2WeightedScore?: number, selectionReason?: string, estimatedFrequency?: number, layout?: OverlayLayout): void;
    /**
     * Helper method to calculate overlay dimensions based on layout config
     */
    private calculateOverlayDimensions;
}
