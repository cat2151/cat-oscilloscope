/**
 * GridRenderer handles grid and measurement label rendering
 * Responsible for:
 * - Grid line rendering
 * - Time axis labels
 * - Amplitude axis labels (in dB format)
 */
export declare class GridRenderer {
    private ctx;
    private canvasWidth;
    private canvasHeight;
    constructor(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number);
    /**
     * Update canvas dimensions (call when canvas size changes)
     */
    updateDimensions(width: number, height: number): void;
    /**
     * Draw grid lines with measurement labels
     * @param sampleRate - Audio sample rate in Hz (optional)
     * @param displaySamples - Number of samples displayed on screen (optional)
     * @param gain - Current gain multiplier (optional)
     */
    drawGrid(sampleRate?: number, displaySamples?: number, gain?: number): void;
    /**
     * Draw grid measurement labels
     * @param sampleRate - Audio sample rate in Hz
     * @param displaySamples - Number of samples displayed on screen
     * @param gain - Current gain multiplier
     */
    private drawGridLabels;
}
