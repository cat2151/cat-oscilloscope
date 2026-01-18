import { BufferSource } from './BufferSource';
import { OverlaysLayoutConfig } from './OverlayLayout';
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
    private lastFrameTime;
    private frameProcessingTimes;
    private readonly MAX_FRAME_TIMES;
    private readonly TARGET_FRAME_TIME;
    private readonly FPS_LOG_INTERVAL_FRAMES;
    /**
     * Create a new Oscilloscope instance
     * @param canvas - Main oscilloscope display canvas (recommended: 800x350px)
     * @param previousWaveformCanvas - Canvas for displaying previous frame's waveform (recommended: 250x120px)
     * @param currentWaveformCanvas - Canvas for displaying current frame's waveform (recommended: 250x120px)
     * @param similarityPlotCanvas - Canvas for displaying similarity history plot (recommended: 250x120px)
     * @param frameBufferCanvas - Canvas for displaying full frame buffer with position markers (recommended: 800x120px)
     * @param overlaysLayout - Optional layout configuration for debug overlays (FFT, harmonic analysis, frequency plot)
     */
    constructor(canvas: HTMLCanvasElement, previousWaveformCanvas: HTMLCanvasElement, currentWaveformCanvas: HTMLCanvasElement, similarityPlotCanvas: HTMLCanvasElement, frameBufferCanvas: HTMLCanvasElement, overlaysLayout?: OverlaysLayoutConfig);
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
    /**
     * Enable or disable debug overlays (harmonic analysis, frequency plot)
     * Debug overlays show detailed debugging information with yellow borders (#ffaa00)
     * including harmonic analysis and frequency history plot
     *
     * When using cat-oscilloscope as a library, it's recommended to disable these
     * overlays for a cleaner, more professional appearance
     *
     * @param enabled - true to show debug overlays (default for standalone app),
     *                  false to hide them (recommended for library usage)
     */
    setDebugOverlaysEnabled(enabled: boolean): void;
    /**
     * Get the current state of debug overlays
     * @returns true if debug overlays are enabled, false otherwise
     */
    getDebugOverlaysEnabled(): boolean;
    /**
     * Set the layout configuration for overlays
     * Allows external applications to control the position and size of debug overlays
     * @param layout - Layout configuration for overlays (FFT, harmonic analysis, frequency plot)
     */
    setOverlaysLayout(layout: OverlaysLayoutConfig): void;
    /**
     * Get the current overlays layout configuration
     * @returns Current overlays layout configuration
     */
    getOverlaysLayout(): OverlaysLayoutConfig;
    getCurrentGain(): number;
    getSimilarityScore(): number;
    isSimilaritySearchActive(): boolean;
    setUsePeakMode(enabled: boolean): void;
    getUsePeakMode(): boolean;
    setZeroCrossMode(mode: 'standard' | 'peak-backtrack-history' | 'bidirectional-nearest' | 'gradient-based' | 'adaptive-step' | 'hysteresis' | 'closest-to-zero'): void;
    getZeroCrossMode(): 'standard' | 'peak-backtrack-history' | 'bidirectional-nearest' | 'gradient-based' | 'adaptive-step' | 'hysteresis' | 'closest-to-zero';
    setPauseDrawing(paused: boolean): void;
    getPauseDrawing(): boolean;
}
