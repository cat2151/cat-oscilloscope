/**
 * WaveformRenderData - Complete data structure for waveform rendering
 *
 * This interface represents all the information needed to render a waveform frame.
 * It separates data generation logic from rendering logic, making it possible
 * to implement the data generation part in other languages (e.g., Rust WASM).
 */
export interface WaveformRenderData {
    /** Complete waveform data buffer */
    waveformData: Float32Array;
    /** Start index of the region to display */
    displayStartIndex: number;
    /** End index of the region to display (exclusive) */
    displayEndIndex: number;
    /** Auto-gain multiplier for waveform amplitude */
    gain: number;
    /** Estimated fundamental frequency in Hz */
    estimatedFrequency: number;
    /** プロット用の推定周波数の履歴 */
    frequencyPlotHistory: number[];
    /** Sample rate in Hz */
    sampleRate: number;
    /** FFT size used for analysis */
    fftSize: number;
    /** FFT frequency data for spectrum display */
    frequencyData?: Uint8Array;
    /** Whether signal is above noise gate threshold (affects FFT display) */
    isSignalAboveNoiseGate: boolean;
    /** Maximum frequency for FFT display */
    maxFrequency: number;
    /** Previous frame's waveform for comparison (null if not available) */
    previousWaveform: Float32Array | null;
    /** Similarity score between current and previous waveform (-1 to +1) */
    similarity: number;
    /** Similarity history for plotting (correlation coefficient values from -1 to +1) */
    similarityPlotHistory: number[];
    /** Whether similarity search was used for alignment */
    usedSimilaritySearch: boolean;
    /** Phase 0: where fundamental frequency sine crosses from negative to positive (after skipping first cycle) */
    phaseZeroIndex?: number;
    /** Phase 2π: one cycle after phase 0 */
    phaseTwoPiIndex?: number;
    /** Phase -π/4: 1/8 cycle before phase 0 */
    phaseMinusQuarterPiIndex?: number;
    /** Phase 2π+π/4: 1/8 cycle after phase 2π */
    phaseTwoPiPlusQuarterPiIndex?: number;
}
