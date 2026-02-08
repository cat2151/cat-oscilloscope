import { WaveformRenderer } from './WaveformRenderer';
import { ComparisonPanelRenderer } from './ComparisonPanelRenderer';
import { CycleSimilarityRenderer } from './CycleSimilarityRenderer';
import { FrequencyEstimator } from './FrequencyEstimator';
import { WaveformRenderData } from './WaveformRenderData';
/**
 * Render coordinator module
 * Coordinates the rendering of waveform data across multiple renderers
 */
export declare class RenderCoordinator {
    private renderer;
    private comparisonRenderer;
    private cycleSimilarityRenderer;
    private frequencyEstimator;
    constructor(renderer: WaveformRenderer, comparisonRenderer: ComparisonPanelRenderer, cycleSimilarityRenderer: CycleSimilarityRenderer | null, frequencyEstimator: FrequencyEstimator);
    /**
     * Render a single frame using pre-processed data
     * This method contains only rendering logic - no data processing
     * @param renderData - Pre-processed waveform render data
     * @param phaseMarkerRangeEnabled - Whether to display only phase marker range
     */
    renderFrame(renderData: WaveformRenderData, phaseMarkerRangeEnabled: boolean): void;
}
