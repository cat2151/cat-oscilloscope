/**
 * Constants for waveform storage and search
 */

/** Store 4 cycles worth of waveform data */
export const CYCLES_TO_STORE = 4;

/** Search within 4 cycles range */
export const CYCLES_TO_SEARCH = 4;

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
export class WaveformSearcher {
  private previousWaveform: Float32Array | null = null;
  private lastSimilarity: number = 0;

  /**
   * Get the last calculated similarity score
   */
  getLastSimilarity(): number {
    return this.lastSimilarity;
  }

  /**
   * Reset state (e.g., when stopping)
   */
  reset(): void {
    this.previousWaveform = null;
    this.lastSimilarity = 0;
  }

  /**
   * Check if previous waveform exists
   */
  hasPreviousWaveform(): boolean {
    return this.previousWaveform !== null;
  }

  /**
   * Get the previous waveform (for debugging/visualization)
   */
  getPreviousWaveform(): Float32Array | null {
    return this.previousWaveform;
  }
}
