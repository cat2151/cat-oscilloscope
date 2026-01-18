/**
 * Constants for waveform storage and search
 */
/** Store 4 cycles worth of waveform data */
export declare const CYCLES_TO_STORE = 4;
/** Search within 4 cycles range */
export declare const CYCLES_TO_SEARCH = 4;
/**
 * WaveformSearcher - Configuration and state holder for waveform similarity search
 *
 * This class only holds state. All actual waveform similarity search
 * algorithms are implemented in Rust WASM (wasm-processor module).
 *
 * Responsible for:
 * - Holding previous waveform data (updated by WASM processor)
 * - Holding last similarity score (updated by WASM processor)
 */
export declare class WaveformSearcher {
    private previousWaveform;
    private lastSimilarity;
    /**
     * Get the last calculated similarity score
     */
    getLastSimilarity(): number;
    /**
     * Reset state (e.g., when stopping)
     */
    reset(): void;
    /**
     * Check if previous waveform exists
     */
    hasPreviousWaveform(): boolean;
    /**
     * Get the previous waveform (for debugging/visualization)
     */
    getPreviousWaveform(): Float32Array | null;
}
