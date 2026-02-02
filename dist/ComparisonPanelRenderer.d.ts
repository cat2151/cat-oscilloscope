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
     * Update all comparison panels
     * @param previousWaveform - Previous frame's waveform data (null if no previous frame exists)
     * @param currentWaveform - Current frame's 4-cycle waveform for comparison display (null if no previous frame exists)
     * @param fullBuffer - Complete frame buffer to display
     * @param displayStart - Start index of the display segment within fullBuffer
     * @param displayEnd - End index of the display segment within fullBuffer (exclusive)
     * @param similarity - Correlation coefficient between current and previous waveform (-1 to +1)
     * @param similarityHistory - Array of similarity values over time for history plot
     */
    updatePanels(previousWaveform: Float32Array | null, currentWaveform: Float32Array | null, fullBuffer: Float32Array, displayStart: number, displayEnd: number, similarity: number, similarityHistory?: number[]): void;
    /**
     * Clear all panels (e.g., when stopped)
     */
    clear(): void;
}
