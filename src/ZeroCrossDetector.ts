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

export class ZeroCrossDetector {
  private alignmentMode: AlignmentMode = 'phase';

  /**
   * Set alignment mode for waveform synchronization
   * - 'zero-cross': Align on negative-to-positive zero crossings
   * - 'peak': Align on peak (maximum absolute amplitude) points
   * - 'phase': Align based on fundamental frequency phase (best for waveforms with subharmonics)
   */
  setAlignmentMode(mode: AlignmentMode): void {
    this.alignmentMode = mode;
  }

  /**
   * Get current alignment mode
   */
  getAlignmentMode(): AlignmentMode {
    return this.alignmentMode;
  }

  /**
   * Set whether to use peak mode instead of zero-crossing mode (legacy compatibility)
   * @deprecated Use setAlignmentMode instead
   */
  setUsePeakMode(enabled: boolean): void {
    this.alignmentMode = enabled ? 'peak' : 'zero-cross';
  }

  /**
   * Get whether peak mode is enabled (legacy compatibility)
   * @deprecated Use getAlignmentMode instead
   */
  getUsePeakMode(): boolean {
    return this.alignmentMode === 'peak';
  }

  /**
   * Reset state (e.g., when stopping)
   */
  reset(): void {
    // State is maintained in WASM, but this method is kept for API compatibility
  }
}
