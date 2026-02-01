import { OverlaysLayoutConfig } from './OverlayLayout';
/**
 * WaveformRenderer coordinates all canvas drawing operations
 * Acts as a facade that delegates to specialized renderer classes
 * Responsible for:
 * - Coordinating multiple renderer components
 * - Managing canvas state
 * - Providing a unified API for rendering
 */
export declare class WaveformRenderer {
    private canvas;
    private ctx;
    private fftDisplayEnabled;
    private harmonicAnalysisEnabled;
    private debugOverlaysEnabled;
    private overlaysLayout;
    private gridRenderer;
    private waveformLineRenderer;
    private fftOverlayRenderer;
    private harmonicAnalysisRenderer;
    private frequencyPlotRenderer;
    private phaseMarkerRenderer;
    constructor(canvas: HTMLCanvasElement, overlaysLayout?: OverlaysLayoutConfig);
    /**
     * Clear canvas and draw grid with measurement labels
     * @param sampleRate - Audio sample rate in Hz (optional)
     * @param displaySamples - Number of samples displayed on screen (optional)
     * @param gain - Current gain multiplier (optional)
     */
    clearAndDrawGrid(sampleRate?: number, displaySamples?: number, gain?: number): void;
    /**
     * Update all renderer dimensions (call when canvas size changes)
     */
    private updateRendererDimensions;
    /**
     * Draw waveform
     */
    drawWaveform(data: Float32Array, startIndex: number, endIndex: number, gain: number): void;
    /**
     * Draw FFT spectrum overlay (position and size configurable via overlaysLayout)
     */
    drawFFTOverlay(frequencyData: Uint8Array, estimatedFrequency: number, sampleRate: number, fftSize: number, maxFrequency: number): void;
    /**
     * Draw harmonic analysis information overlay
     * Displays debugging information about frequency estimation when FFT method is used
     * Position and size configurable via overlaysLayout
     */
    drawHarmonicAnalysis(halfFreqPeakStrengthPercent?: number, candidate1Harmonics?: number[], candidate2Harmonics?: number[], candidate1WeightedScore?: number, candidate2WeightedScore?: number, selectionReason?: string, estimatedFrequency?: number): void;
    /**
     * Draw frequency plot overlay
     * Position and size configurable via overlaysLayout
     * Displays frequency history to detect frequency spikes
     * One data point is added per frame
     */
    drawFrequencyPlot(frequencyHistory: number[], minFrequency: number, maxFrequency: number): void;
    /**
     * Draw phase markers on the waveform
     * @param phaseZeroIndex - Sample index for phase 0 (red line)
     * @param phaseTwoPiIndex - Sample index for phase 2π (red line)
     * @param phaseMinusQuarterPiIndex - Sample index for phase -π/4 (orange line)
     * @param phaseTwoPiPlusQuarterPiIndex - Sample index for phase 2π+π/4 (orange line)
     * @param displayStartIndex - Start index of the displayed region
     * @param displayEndIndex - End index of the displayed region
     * @param debugInfo - Optional debug information for phase tracking
     */
    drawPhaseMarkers(phaseZeroIndex?: number, phaseTwoPiIndex?: number, phaseMinusQuarterPiIndex?: number, phaseTwoPiPlusQuarterPiIndex?: number, displayStartIndex?: number, displayEndIndex?: number, debugInfo?: {
        phaseZeroSegmentRelative?: number;
        phaseZeroHistory?: number;
        phaseZeroTolerance?: number;
        zeroCrossModeName?: string;
    }): void;
    setFFTDisplay(enabled: boolean): void;
    getFFTDisplayEnabled(): boolean;
    /**
     * Enable or disable harmonic analysis overlay
     * When disabled, the yellow-bordered harmonic analysis panel is hidden
     * @param enabled - true to show harmonic analysis overlay, false to hide it
     */
    setHarmonicAnalysisEnabled(enabled: boolean): void;
    /**
     * Get the current state of harmonic analysis overlay
     * @returns true if harmonic analysis overlay is enabled, false otherwise
     */
    getHarmonicAnalysisEnabled(): boolean;
    /**
     * Enable or disable debug overlays (harmonic analysis, frequency plot)
     * When disabled, yellow-bordered debug information panels are hidden
     * Recommended: Set to false when using as a library for cleaner display
     * @param enabled - true to show debug overlays, false to hide them
     */
    setDebugOverlaysEnabled(enabled: boolean): void;
    /**
     * Get the current state of debug overlays
     * @returns true if debug overlays are enabled, false otherwise
     */
    getDebugOverlaysEnabled(): boolean;
    /**
     * Set the layout configuration for overlays
     * Allows external applications to control the position and size of debug overlays
     * @param layout - Layout configuration for overlays
     */
    setOverlaysLayout(layout: OverlaysLayoutConfig): void;
    /**
     * Get the current overlays layout configuration
     * @returns Current overlays layout configuration
     */
    getOverlaysLayout(): OverlaysLayoutConfig;
}
