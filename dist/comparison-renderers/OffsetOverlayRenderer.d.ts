/**
 * OffsetOverlayRenderer - Responsible for drawing phase marker offset overlay graphs
 * Displays frame-to-frame delta of phase markers on current waveform canvas
 * Fixed for issue #254: Now shows deltas instead of absolute positions to avoid spikes
 */
export declare class OffsetOverlayRenderer {
    /**
     * Draw phase marker offset overlay graphs on current waveform canvas
     * Displays two line graphs showing the frame-to-frame delta of phase markers
     * @param ctx - Canvas 2D rendering context
     * @param width - Canvas width
     * @param height - Canvas height
     * @param phaseZeroOffsetHistory - Array of frame-to-frame delta percentages for phase zero (start red line)
     * @param phaseTwoPiOffsetHistory - Array of frame-to-frame delta percentages for phase 2π (end red line)
     */
    drawOffsetOverlayGraphs(ctx: CanvasRenderingContext2D, width: number, height: number, phaseZeroOffsetHistory?: number[], phaseTwoPiOffsetHistory?: number[]): void;
}
