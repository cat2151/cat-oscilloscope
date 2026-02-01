import { OverlayLayout } from '../OverlayLayout';
/**
 * FrequencyPlotRenderer handles frequency plot overlay rendering
 * Responsible for:
 * - Displaying frequency history plot
 * - Detecting frequency spikes
 */
export declare class FrequencyPlotRenderer {
    private ctx;
    private canvasWidth;
    private canvasHeight;
    private readonly FREQ_PLOT_MIN_RANGE_PADDING_HZ;
    private readonly FREQ_PLOT_RANGE_PADDING_RATIO;
    constructor(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number);
    /**
     * Update canvas dimensions (call when canvas size changes)
     */
    updateDimensions(width: number, height: number): void;
    /**
     * Draw frequency plot overlay
     * Position and size configurable via layout
     * Displays frequency history to detect frequency spikes
     * One data point is added per frame
     */
    drawFrequencyPlot(frequencyHistory: number[], minFrequency: number, maxFrequency: number, layout?: OverlayLayout): void;
    /**
     * Helper method to calculate overlay dimensions based on layout config
     */
    private calculateOverlayDimensions;
}
