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
export declare class FrequencyEstimator {
    private frequencyEstimationMethod;
    private estimatedFrequency;
    private readonly MIN_FREQUENCY_HZ;
    private readonly MAX_FREQUENCY_HZ;
    private bufferSizeMultiplier;
    private frequencyPlotHistory;
    /**
     * Clear frequency history (e.g., when stopping)
     */
    clearHistory(): void;
    setFrequencyEstimationMethod(method: 'zero-crossing' | 'autocorrelation' | 'fft' | 'stft' | 'cqt'): void;
    getFrequencyEstimationMethod(): string;
    setBufferSizeMultiplier(multiplier: 1 | 4 | 16): void;
    getBufferSizeMultiplier(): 1 | 4 | 16;
    getEstimatedFrequency(): number;
    getMinFrequency(): number;
    getMaxFrequency(): number;
    getFrequencyPlotHistory(): number[];
}
