import { OverlayLayout } from '../OverlayLayout';
/**
 * BaseOverlayRenderer provides common functionality for overlay renderers
 * Handles overlay dimension calculations based on layout configuration
 */
export declare abstract class BaseOverlayRenderer {
    protected ctx: CanvasRenderingContext2D;
    protected canvasWidth: number;
    protected canvasHeight: number;
    constructor(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number);
    /**
     * Update canvas dimensions (call when canvas size changes)
     */
    updateDimensions(width: number, height: number): void;
    /**
     * Helper method to calculate overlay dimensions based on layout config
     */
    protected calculateOverlayDimensions(layout: OverlayLayout | undefined, defaultX: number, defaultY: number, defaultWidth: number, defaultHeight: number): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}
