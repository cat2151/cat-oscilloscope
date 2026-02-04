/**
 * PhaseMarkerRenderer handles phase marker rendering
 * Responsible for:
 * - Drawing phase markers on the waveform
 * - Drawing debug information for phase tracking
 */
export declare class PhaseMarkerRenderer {
    private ctx;
    private canvasWidth;
    private canvasHeight;
    private debugOverlaysEnabled;
    constructor(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, debugOverlaysEnabled?: boolean);
    /**
     * Update canvas dimensions (call when canvas size changes)
     */
    updateDimensions(width: number, height: number): void;
    /**
     * Set debug overlays enabled state
     */
    setDebugOverlaysEnabled(enabled: boolean): void;
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
}
//# sourceMappingURL=PhaseMarkerRenderer.d.ts.map