/**
 * WaveformRenderer handles all canvas drawing operations
 * Responsible for:
 * - Grid rendering
 * - Waveform visualization
 * - Zero-cross line indicators
 * - FFT spectrum overlay
 * - Canvas coordinate calculations
 */
export declare class WaveformRenderer {
    private canvas;
    private ctx;
    private fftDisplayEnabled;
    private readonly FFT_OVERLAY_HEIGHT_RATIO;
    private readonly FFT_MIN_BAR_WIDTH;
    private readonly FREQ_PLOT_WIDTH;
    private readonly FREQ_PLOT_HEIGHT;
    private readonly FREQ_PLOT_PADDING;
    private readonly FREQ_PLOT_MIN_RANGE_PADDING_HZ;
    private readonly FREQ_PLOT_RANGE_PADDING_RATIO;
    constructor(canvas: HTMLCanvasElement);
    /**
     * Clear canvas and draw grid with measurement labels
     * @param sampleRate - Audio sample rate in Hz (optional)
     * @param displaySamples - Number of samples displayed on screen (optional)
     * @param gain - Current gain multiplier (optional)
     */
    clearAndDrawGrid(sampleRate?: number, displaySamples?: number, gain?: number): void;
    /**
     * Draw grid lines with measurement labels
     * @param sampleRate - Audio sample rate in Hz (optional)
     * @param displaySamples - Number of samples displayed on screen (optional)
     * @param gain - Current gain multiplier (optional)
     */
    private drawGrid;
    /**
     * Draw grid measurement labels
     * @param sampleRate - Audio sample rate in Hz
     * @param displaySamples - Number of samples displayed on screen
     * @param gain - Current gain multiplier
     */
    private drawGridLabels;
    /**
     * Draw waveform
     */
    drawWaveform(data: Float32Array, startIndex: number, endIndex: number, gain: number): void;
    /**
     * Draw a vertical line at the zero-cross point
     */
    drawZeroCrossLine(zeroCrossIndex: number, startIndex: number, endIndex: number): void;
    /**
     * Draw FFT spectrum overlay in bottom-left corner of canvas
     */
    drawFFTOverlay(frequencyData: Uint8Array, estimatedFrequency: number, sampleRate: number, fftSize: number, maxFrequency: number): void;
    /**
     * 右上に周波数プロットを描画
     * 周波数スパイクを検出しやすくするために、推定周波数の履歴を表示
     * 1フレームごとに1つのデータポイントが追加される
     */
    drawFrequencyPlot(frequencyHistory: number[], minFrequency: number, maxFrequency: number): void;
    setFFTDisplay(enabled: boolean): void;
    getFFTDisplayEnabled(): boolean;
}
