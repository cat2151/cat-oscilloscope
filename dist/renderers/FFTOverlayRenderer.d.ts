import { OverlayLayout } from '../OverlayLayout';
import { BaseOverlayRenderer } from './BaseOverlayRenderer';
/**
 * FFTOverlayRenderer handles FFT spectrum overlay rendering
 * Responsible for:
 * - Drawing FFT spectrum bars
 * - Drawing fundamental frequency marker
 */
export declare class FFTOverlayRenderer extends BaseOverlayRenderer {
    private readonly FFT_OVERLAY_HEIGHT_RATIO;
    private readonly FFT_MIN_BAR_WIDTH;
    /**
     * Draw FFT spectrum overlay (position and size configurable via layout)
     */
    drawFFTOverlay(frequencyData: Uint8Array, estimatedFrequency: number, sampleRate: number, fftSize: number, maxFrequency: number, layout?: OverlayLayout): void;
}
