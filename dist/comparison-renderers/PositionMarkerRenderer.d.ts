/**
 * PositionMarkerRenderer - Responsible for drawing position markers
 * Displays start and end positions on the buffer canvas
 */
export declare class PositionMarkerRenderer {
    /**
     * Draw vertical position markers
     */
    drawPositionMarkers(ctx: CanvasRenderingContext2D, width: number, height: number, startIndex: number, endIndex: number, totalLength: number): void;
    /**
     * Draw phase marker vertical lines on the buffer canvas
     * Red lines for phaseZero and phaseTwoPi, orange lines for phaseMinusQuarterPi and phaseTwoPiPlusQuarterPi
     */
    drawPhaseMarkers(ctx: CanvasRenderingContext2D, width: number, height: number, totalLength: number, phaseZeroIndex?: number, phaseTwoPiIndex?: number, phaseMinusQuarterPiIndex?: number, phaseTwoPiPlusQuarterPiIndex?: number): void;
}
