/**
 * ZeroCrossDetector - Configuration holder for zero-cross/peak/phase detection
 *
 * This class only holds configuration state. All actual zero-crossing, peak,
 * and phase detection algorithms are implemented in Rust WASM (wasm-processor module).
 *
 * Responsible for:
 * - Storing alignment mode (zero-cross, peak, or phase)
 */
export type AlignmentMode = 'zero-cross' | 'peak' | 'phase';
export declare class ZeroCrossDetector {
    private alignmentMode;
    /**
     * Set alignment mode for waveform synchronization
     * - 'zero-cross': Align on negative-to-positive zero crossings
     * - 'peak': Align on peak (maximum absolute amplitude) points
     * - 'phase': Align based on fundamental frequency phase (best for waveforms with subharmonics)
     */
    setAlignmentMode(mode: AlignmentMode): void;
    /**
     * Get current alignment mode
     */
    getAlignmentMode(): AlignmentMode;
    /**
     * Set whether to use peak mode instead of zero-crossing mode (legacy compatibility)
     * @deprecated Use setAlignmentMode instead
     */
    setUsePeakMode(enabled: boolean): void;
    /**
     * Get whether peak mode is enabled (legacy compatibility)
     * @deprecated Use getAlignmentMode instead
     */
    getUsePeakMode(): boolean;
    /**
     * Reset state (e.g., when stopping)
     */
    reset(): void;
}
