import { OverlayLayout } from '../OverlayLayout';
import { BaseOverlayRenderer } from './BaseOverlayRenderer';
/**
 * FrequencyPlotRenderer handles frequency plot overlay rendering
 * Responsible for:
 * - Displaying frequency history plot
 * - Detecting frequency spikes
 */
export declare class FrequencyPlotRenderer extends BaseOverlayRenderer {
    private readonly FREQ_PLOT_MIN_RANGE_PADDING_HZ;
    private readonly FREQ_PLOT_RANGE_PADDING_RATIO;
    /**
     * Draw frequency plot overlay
     * Position and size configurable via layout
     * Displays frequency history to detect frequency spikes
     * One data point is added per frame
     */
    drawFrequencyPlot(frequencyHistory: number[], minFrequency: number, maxFrequency: number, layout?: OverlayLayout): void;
}
//# sourceMappingURL=FrequencyPlotRenderer.d.ts.map