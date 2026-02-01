import { OverlayLayout } from '../OverlayLayout';
/**
 * FFTOverlayRenderer handles FFT spectrum overlay rendering
 * Responsible for:
 * - Drawing FFT spectrum bars
 * - Drawing fundamental frequency marker
 */
export declare class FFTOverlayRenderer {
    private ctx;
    private canvasWidth;
    private canvasHeight;
    private readonly FFT_OVERLAY_HEIGHT_RATIO;
    private readonly FFT_MIN_BAR_WIDTH;
    constructor(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number);
    /**
     * Update canvas dimensions (call when canvas size changes)
     */
    updateDimensions(width: number, height: number): void;
    /**
     * Draw FFT spectrum overlay (position and size configurable via layout)
     */
    drawFFTOverlay(frequencyData: Uint8Array, estimatedFrequency: number, sampleRate: number, fftSize: number, maxFrequency: number, layout?: OverlayLayout): void;
    /**
     * Helper method to calculate overlay dimensions based on layout config
     */
    private calculateOverlayDimensions;
}
