/**
 * PositionMarkerRenderer - Responsible for drawing position markers
 * Displays start and end positions on the buffer canvas
 */
export declare class PositionMarkerRenderer {
    /**
     * Draw vertical position markers
     */
    drawPositionMarkers(ctx: CanvasRenderingContext2D, width: number, height: number, startIndex: number, endIndex: number, totalLength: number): void;
}
