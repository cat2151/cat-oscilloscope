import { BufferSource } from './BufferSource';
/**
 * Oscilloscope class - Main coordinator for the oscilloscope functionality
 * Delegates responsibilities to specialized modules:
 * - AudioManager: Web Audio API integration
 * - GainController: Auto-gain and noise gate configuration
 * - FrequencyEstimator: Frequency detection configuration
 * - WaveformRenderer: Canvas rendering
 * - ZeroCrossDetector: Zero-crossing detection configuration
 * - WaveformSearcher: Waveform similarity search state
 * - ComparisonPanelRenderer: Comparison panel rendering
 * - WaveformDataProcessor: Data generation and processing (Rust WASM implementation)
 */
export declare class Oscilloscope {
    private audioManager;
    private gainController;
    private frequencyEstimator;
    private renderer;
    private zeroCrossDetector;
    private waveformSearcher;
    private comparisonRenderer;
    private dataProcessor;
    private animationId;
    private isRunning;
    private isPaused;
    /**
     * Create a new Oscilloscope instance
     * @param canvas - Main oscilloscope display canvas (recommended: 800x350px)
     * @param previousWaveformCanvas - Canvas for displaying previous frame's waveform (recommended: 250x120px)
     * @param currentWaveformCanvas - Canvas for displaying current frame's waveform (recommended: 250x120px)
     * @param similarityPlotCanvas - Canvas for displaying similarity history plot (recommended: 250x120px)
     * @param frameBufferCanvas - Canvas for displaying full frame buffer with position markers (recommended: 800x120px)
     */
    constructor(canvas: HTMLCanvasElement, previousWaveformCanvas: HTMLCanvasElement, currentWaveformCanvas: HTMLCanvasElement, similarityPlotCanvas: HTMLCanvasElement, frameBufferCanvas: HTMLCanvasElement);
    start(): Promise<void>;
    startFromFile(file: File): Promise<void>;
    /**
     * Start visualization from a static buffer without audio playback
     * Useful for visualizing pre-recorded audio data or processing results
     * @param bufferSource - BufferSource instance containing audio data
     */
    startFromBuffer(bufferSource: BufferSource): Promise<void>;
    stop(): Promise<void>;
    private render;
    /**
     * Render a single frame using pre-processed data
     * This method contains only rendering logic - no data processing
     */
    private renderFrame;
    getIsRunning(): boolean;
    setAutoGain(enabled: boolean): void;
    getAutoGainEnabled(): boolean;
    setNoiseGate(enabled: boolean): void;
    getNoiseGateEnabled(): boolean;
    setNoiseGateThreshold(threshold: number): void;
    getNoiseGateThreshold(): number;
    setFrequencyEstimationMethod(method: 'zero-crossing' | 'autocorrelation' | 'fft' | 'stft' | 'cqt'): void;
    getFrequencyEstimationMethod(): string;
    setBufferSizeMultiplier(multiplier: 1 | 4 | 16): void;
    getBufferSizeMultiplier(): 1 | 4 | 16;
    getEstimatedFrequency(): number;
    setFFTDisplay(enabled: boolean): void;
    getFFTDisplayEnabled(): boolean;
    getCurrentGain(): number;
    getSimilarityScore(): number;
    isSimilaritySearchActive(): boolean;
    setUsePeakMode(enabled: boolean): void;
    getUsePeakMode(): boolean;
    setAlignmentMode(mode: 'zero-cross' | 'peak' | 'phase'): void;
    getAlignmentMode(): 'zero-cross' | 'peak' | 'phase';
    setPauseDrawing(paused: boolean): void;
    getPauseDrawing(): boolean;
}
