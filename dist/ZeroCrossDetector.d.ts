/**
 * ZeroCrossDetector - Configuration holder for zero-cross/peak detection
 *
 * This class only holds configuration state. All actual zero-crossing and peak
 * detection algorithms are implemented in Rust WASM (wasm-processor module).
 *
 * Responsible for:
 * - Storing peak mode configuration (legacy compatibility)
 */
export declare class ZeroCrossDetector {
    private usePeakMode;
    /**
     * Set whether to use peak mode instead of zero-crossing mode
     */
    setUsePeakMode(enabled: boolean): void;
    /**
     * Get whether peak mode is enabled
     */
    getUsePeakMode(): boolean;
    /**
     * Reset state (e.g., when stopping)
     */
    reset(): void;
}
