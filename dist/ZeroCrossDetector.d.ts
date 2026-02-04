/**
 * ZeroCrossDetector - Configuration holder for zero-cross/peak detection
 *
 * This class only holds configuration state. All actual zero-crossing and peak
 * detection algorithms are implemented in Rust WASM (signal-processor-wasm module).
 *
 * Responsible for:
 * - Storing peak mode configuration (legacy compatibility)
 * - Storing zero-cross detection mode configuration
 */
export declare class ZeroCrossDetector {
    private usePeakMode;
    private zeroCrossMode;
    /**
     * Set whether to use peak mode instead of zero-crossing mode
     */
    setUsePeakMode(enabled: boolean): void;
    /**
     * Get whether peak mode is enabled
     */
    getUsePeakMode(): boolean;
    /**
     * Set zero-cross detection mode
     * @param mode - Zero-cross detection algorithm to use
     */
    setZeroCrossMode(mode: 'standard' | 'peak-backtrack-history' | 'bidirectional-nearest' | 'gradient-based' | 'adaptive-step' | 'hysteresis' | 'closest-to-zero'): void;
    /**
     * Get current zero-cross detection mode
     */
    getZeroCrossMode(): 'standard' | 'peak-backtrack-history' | 'bidirectional-nearest' | 'gradient-based' | 'adaptive-step' | 'hysteresis' | 'closest-to-zero';
    /**
     * Reset state (e.g., when stopping)
     */
    reset(): void;
}
//# sourceMappingURL=ZeroCrossDetector.d.ts.map