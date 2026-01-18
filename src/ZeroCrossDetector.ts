/**
 * ZeroCrossDetector - Configuration holder for zero-cross/peak detection
 * 
 * This class only holds configuration state. All actual zero-crossing and peak
 * detection algorithms are implemented in Rust WASM (wasm-processor module).
 * 
 * Responsible for:
 * - Storing peak mode configuration (legacy compatibility)
 * - Storing zero-cross detection mode configuration
 */
export class ZeroCrossDetector {
  private usePeakMode: boolean = false;
  private zeroCrossMode: 'standard' | 'peak-backtrack-history' = 'peak-backtrack-history';

  /**
   * Set whether to use peak mode instead of zero-crossing mode
   */
  setUsePeakMode(enabled: boolean): void {
    this.usePeakMode = enabled;
  }

  /**
   * Get whether peak mode is enabled
   */
  getUsePeakMode(): boolean {
    return this.usePeakMode;
  }

  /**
   * Set zero-cross detection mode
   * @param mode - 'standard' for 0.5-cycle tolerance, 'peak-backtrack-history' for 1% tolerance with history
   */
  setZeroCrossMode(mode: 'standard' | 'peak-backtrack-history'): void {
    this.zeroCrossMode = mode;
  }

  /**
   * Get current zero-cross detection mode
   */
  getZeroCrossMode(): 'standard' | 'peak-backtrack-history' {
    return this.zeroCrossMode;
  }

  /**
   * Reset state (e.g., when stopping)
   */
  reset(): void {
    // State is maintained in WASM, but this method is kept for API compatibility
  }
}
