/**
 * FrequencyEstimator - Configuration holder for frequency estimation
 * 
 * This class only holds configuration state. All actual frequency estimation
 * algorithms are implemented in Rust WASM (signal-processor-wasm module).
 * 
 * Responsible for:
 * - Storing frequency estimation method configuration
 * - Storing buffer size multiplier setting
 * - Holding estimated frequency value (updated by WASM processor)
 * - Holding frequency plot history (updated by WASM processor)
 */
export class FrequencyEstimator {
  private frequencyEstimationMethod: 'zero-crossing' | 'autocorrelation' | 'fft' | 'stft' | 'cqt' = 'fft';
  private estimatedFrequency = 0;
  private readonly MIN_FREQUENCY_HZ = 20; // Minimum detectable frequency (Hz)
  private readonly MAX_FREQUENCY_HZ = 5000; // Maximum detectable frequency (Hz)
  private bufferSizeMultiplier: 1 | 4 | 16 = 16; // Buffer size multiplier for extended FFT
  private frequencyPlotHistory: number[] = []; // プロット用の推定周波数の履歴

  /**
   * Clear frequency history (e.g., when stopping)
   */
  clearHistory(): void {
    this.frequencyPlotHistory = [];
    this.estimatedFrequency = 0;
  }

  // Getters and setters
  setFrequencyEstimationMethod(method: 'zero-crossing' | 'autocorrelation' | 'fft' | 'stft' | 'cqt'): void {
    // Only clear frequency history if the method actually changes
    if (this.frequencyEstimationMethod !== method) {
      this.frequencyEstimationMethod = method;
      // Clear frequency history when changing methods
      this.frequencyPlotHistory = [];
    }
  }

  getFrequencyEstimationMethod(): string {
    return this.frequencyEstimationMethod;
  }

  setBufferSizeMultiplier(multiplier: 1 | 4 | 16): void {
    this.bufferSizeMultiplier = multiplier;
  }

  getBufferSizeMultiplier(): 1 | 4 | 16 {
    return this.bufferSizeMultiplier;
  }

  getEstimatedFrequency(): number {
    return this.estimatedFrequency;
  }

  getMinFrequency(): number {
    return this.MIN_FREQUENCY_HZ;
  }

  getMaxFrequency(): number {
    return this.MAX_FREQUENCY_HZ;
  }
  
  getFrequencyPlotHistory(): number[] {
    return this.frequencyPlotHistory;
  }
}
