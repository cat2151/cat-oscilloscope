/**
 * ZeroCrossDetector - Configuration holder for zero-cross/peak detection
 * 
 * This class only holds configuration state. All actual zero-crossing and peak
 * detection algorithms are implemented in Rust WASM (wasm-processor module).
 * 
 * Responsible for:
 * - Storing peak mode enabled/disabled state
 */
export class ZeroCrossDetector {
  private usePeakMode: boolean = false; // Use peak detection instead of zero-crossing

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
   * Reset state (e.g., when stopping)
   */
  reset(): void {
    // State is maintained in WASM, but this method is kept for API compatibility
  }
}
