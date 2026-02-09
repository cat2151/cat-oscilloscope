/**
 * ComparisonPanelRenderer handles rendering of the comparison panels
 * Acts as a coordinator that delegates to specialized renderers:
 * - WaveformPanelRenderer: Drawing waveforms with auto-scaling
 * - SimilarityPlotRenderer: Drawing similarity history plots
 * - PositionMarkerRenderer: Drawing position markers on buffer canvas
 * - OffsetOverlayRenderer: Drawing phase marker offset overlay graphs
 */
export declare class ComparisonPanelRenderer {
    private previousCanvas;
    private currentCanvas;
    private similarityCanvas;
    private bufferCanvas;
    private previousCtx;
    private currentCtx;
    private similarityCtx;
    private bufferCtx;
    private waveformRenderer;
    private similarityPlotRenderer;
    private positionMarkerRenderer;
    private offsetOverlayRenderer;
    constructor(previousCanvas: HTMLCanvasElement, currentCanvas: HTMLCanvasElement, similarityCanvas: HTMLCanvasElement, bufferCanvas: HTMLCanvasElement);
    /**
     * Clear all comparison canvases
     */
    private clearAllCanvases;
    /**
     * Update all comparison panels
     * @param previousWaveform - Previous frame's waveform data (null if no previous frame exists)
     * @param currentWaveform - Full buffer containing current frame's audio data
     * @param currentStart - Start index of the extracted waveform within currentWaveform
     * @param currentEnd - End index of the extracted waveform within currentWaveform (exclusive)
     * @param fullBuffer - Complete frame buffer to display (typically same as currentWaveform)
     * @param similarity - Correlation coefficient between current and previous waveform (-1 to +1)
     * @param similarityHistory - Array of similarity values over time for history plot
     * @param phaseZeroOffsetHistory - Array of relative offset percentages for phase zero marker (issue #236)
     * @param phaseTwoPiOffsetHistory - Array of relative offset percentages for phase 2π marker (issue #236)
     * @param phaseZeroIndex - Sample index for phase 0 (red line) in the full buffer (issue #279)
     * @param phaseTwoPiIndex - Sample index for phase 2π (red line) in the full buffer (issue #279)
     * @param phaseMinusQuarterPiIndex - Sample index for phase -π/4 (orange line) in the full buffer (issue #279)
     * @param phaseTwoPiPlusQuarterPiIndex - Sample index for phase 2π+π/4 (orange line) in the full buffer (issue #279)
     * @param zeroCrossCandidates - Zero-cross candidates within the displayed current waveform
     * @param highlightedZeroCrossCandidate - Candidate preceding the interval with the max positive peak (blinks)
     */
    updatePanels(previousWaveform: Float32Array | null, currentWaveform: Float32Array, currentStart: number, currentEnd: number, fullBuffer: Float32Array, similarity: number, similarityHistory?: number[], phaseZeroOffsetHistory?: number[], phaseTwoPiOffsetHistory?: number[], phaseZeroIndex?: number, phaseTwoPiIndex?: number, phaseMinusQuarterPiIndex?: number, phaseTwoPiPlusQuarterPiIndex?: number, zeroCrossCandidates?: number[], highlightedZeroCrossCandidate?: number): void;
    /**
     * Clear all panels (e.g., when stopped)
     */
    clear(): void;
}
