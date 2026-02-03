/**
 * ComparisonPanelRenderer handles rendering of the comparison panels
 * Responsible for:
 * - Drawing previous waveform
 * - Drawing current waveform with similarity score
 * - Drawing similarity history plot
 * - Drawing full frame buffer with position indicators
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
    private readonly TARGET_FILL_RATIO;
    private readonly MIN_PEAK_THRESHOLD;
    private readonly DEFAULT_AMPLITUDE_RATIO;
    constructor(previousCanvas: HTMLCanvasElement, currentCanvas: HTMLCanvasElement, similarityCanvas: HTMLCanvasElement, bufferCanvas: HTMLCanvasElement);
    /**
     * Clear all comparison canvases
     */
    private clearAllCanvases;
    /**
     * Clear a single canvas
     */
    private clearCanvas;
    /**
     * Calculate peak amplitude in a given range of data
     * Used for auto-scaling waveforms to fill the vertical space
     */
    private findPeakAmplitude;
    /**
     * Draw a waveform on a canvas with auto-scaling
     * Waveforms are automatically scaled so that peaks reach 90% of the distance
     * from the vertical center line to the top/bottom edge (i.e. 90% of half the height).
     * For example, if peak amplitude is 0.01, it will be scaled 90x relative to that center-to-edge range.
     */
    private drawWaveform;
    /**
     * Draw center line on canvas
     */
    private drawCenterLine;
    /**
     * Draw similarity score text
     */
    private drawSimilarityText;
    /**
     * Draw similarity history plot on similarity canvas
     * 類似度の時系列変化を表示し、瞬間的な類似度低下を検出しやすくする
     *
     * @param similarityHistory Array of correlation coefficients (-1.0 to 1.0).
     *                          Values are ordered chronologically from oldest to newest.
     */
    private drawSimilarityPlot;
    /**
     * Draw vertical position markers
     */
    private drawPositionMarkers;
    /**
     * Draw phase marker offset overlay graphs on current waveform canvas
     * Displays two line graphs showing the relative offset progression of phase markers
     * @param phaseZeroOffsetHistory - Array of relative offset percentages for phase zero (start red line)
     * @param phaseTwoPiOffsetHistory - Array of relative offset percentages for phase 2π (end red line)
     */
    private drawOffsetOverlayGraphs;
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
     */
    updatePanels(previousWaveform: Float32Array | null, currentWaveform: Float32Array, currentStart: number, currentEnd: number, fullBuffer: Float32Array, similarity: number, similarityHistory?: number[], phaseZeroOffsetHistory?: number[], phaseTwoPiOffsetHistory?: number[]): void;
    /**
     * Clear all panels (e.g., when stopped)
     */
    clear(): void;
}
