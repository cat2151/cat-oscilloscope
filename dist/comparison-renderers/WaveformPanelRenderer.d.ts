/**
 * WaveformPanelRenderer - Responsible for drawing waveforms on comparison panels
 * Handles auto-scaling and center line drawing
 */
export declare class WaveformPanelRenderer {
    private readonly TARGET_FILL_RATIO;
    private readonly MIN_PEAK_THRESHOLD;
    private readonly DEFAULT_AMPLITUDE_RATIO;
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
    drawWaveform(ctx: CanvasRenderingContext2D, width: number, height: number, data: Float32Array, startIndex: number, endIndex: number, color: string): void;
    /**
     * Draw center line on canvas
     */
    drawCenterLine(ctx: CanvasRenderingContext2D, width: number, height: number): void;
    /**
     * Clear a canvas
     */
    clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number): void;
    /**
     * Draw phase marker vertical lines
     * Red lines for phaseZero and phaseTwoPi, orange lines for phaseMinusQuarterPi and phaseTwoPiPlusQuarterPi
     * @param ctx - Canvas context
     * @param width - Canvas width
     * @param height - Canvas height
     * @param displayStartIndex - Start index of the displayed region in the full buffer
     * @param displayEndIndex - End index (exclusive) of the displayed region in the full buffer
     * @param phaseZeroIndex - Sample index for phase 0 in the full buffer (red line)
     * @param phaseTwoPiIndex - Sample index for phase 2π in the full buffer (red line)
     * @param phaseMinusQuarterPiIndex - Sample index for phase -π/4 in the full buffer (orange line)
     * @param phaseTwoPiPlusQuarterPiIndex - Sample index for phase 2π+π/4 in the full buffer (orange line)
     */
    drawPhaseMarkers(ctx: CanvasRenderingContext2D, width: number, height: number, displayStartIndex: number, displayEndIndex: number, phaseZeroIndex?: number, phaseTwoPiIndex?: number, phaseMinusQuarterPiIndex?: number, phaseTwoPiPlusQuarterPiIndex?: number): void;
}
