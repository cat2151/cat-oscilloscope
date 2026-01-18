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
    /** Start position of the selected segment within the frame buffer */
    displayStartIndex: number;
    /** End position of the selected segment within the frame buffer (exclusive) */
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
    /** Strength of peak at 1/2 of estimated frequency as a percentage of estimated frequency peak */
    halfFreqPeakStrengthPercent?: number;
    /** Harmonics strength for candidate1 (estimated frequency) - magnitudes for 1x, 2x, 3x, 4x, 5x */
    candidate1Harmonics?: number[];
    /** Harmonics strength for candidate2 (1/2 of estimated frequency) - magnitudes for 1x, 2x, 3x, 4x, 5x */
    candidate2Harmonics?: number[];
    /** Weighted harmonic score for candidate1 (higher weight on lower harmonics) */
    candidate1WeightedScore?: number;
    /** Weighted harmonic score for candidate2 (higher weight on lower harmonics) */
    candidate2WeightedScore?: number;
    /** Reason why candidate1 was selected over candidate2 */
    selectionReason?: string;
    /** 8 divisions (1/2 cycle each): 7 similarity values comparing consecutive segments */
    cycleSimilarities8div?: number[];
    /** 4 divisions (1 cycle each): 3 similarity values comparing consecutive segments */
    cycleSimilarities4div?: number[];
    /** 2 divisions (2 cycles each): 1 similarity value comparing consecutive segments */
    cycleSimilarities2div?: number[];
    /** Phase 0 position relative to segment start (for debugging oscillation) */
    phaseZeroSegmentRelative?: number;
    /** History value used for phase tracking (segment-relative offset, for debugging) */
    phaseZeroHistory?: number;
    /** 1% tolerance in samples (for debugging) */
    phaseZeroTolerance?: number;
    /** Current zero-cross detection mode name (for debugging) */
    zeroCrossModeName?: string;
}
