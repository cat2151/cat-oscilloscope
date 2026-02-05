/**
 * WaveformLineRenderer handles waveform line drawing
 * Responsible for:
 * - Drawing the main waveform signal as a line
 */
export declare class WaveformLineRenderer {
    private ctx;
    private canvasWidth;
    private canvasHeight;
    constructor(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number);
    /**
     * Update canvas dimensions (call when canvas size changes)
     */
    updateDimensions(width: number, height: number): void;
    /**
     * Draw waveform
     */
    drawWaveform(data: Float32Array, startIndex: number, endIndex: number, gain: number): void;
}
