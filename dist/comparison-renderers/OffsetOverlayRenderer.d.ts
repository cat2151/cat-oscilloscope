/**
 * OffsetOverlayRenderer - Responsible for drawing phase marker offset overlay graphs
 * Displays relative offset progression of phase markers on current waveform canvas
 */
export declare class OffsetOverlayRenderer {
    /**
     * Draw phase marker offset overlay graphs on current waveform canvas
     * Displays two line graphs showing the relative offset progression of phase markers
     * @param ctx - Canvas 2D rendering context
     * @param width - Canvas width
     * @param height - Canvas height
     * @param phaseZeroOffsetHistory - Array of relative offset percentages for phase zero (start red line)
     * @param phaseTwoPiOffsetHistory - Array of relative offset percentages for phase 2π (end red line)
     */
    drawOffsetOverlayGraphs(ctx: CanvasRenderingContext2D, width: number, height: number, phaseZeroOffsetHistory?: number[], phaseTwoPiOffsetHistory?: number[]): void;
}
//# sourceMappingURL=OffsetOverlayRenderer.d.ts.map