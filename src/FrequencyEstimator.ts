/**
 * FrequencyEstimator handles frequency detection using various algorithms
 * Responsible for:
 * - Zero-crossing detection
 * - Autocorrelation analysis
 * - FFT-based frequency estimation
 * - Frequency smoothing and temporal stability
 */
export class FrequencyEstimator {
  private frequencyEstimationMethod: 'zero-crossing' | 'autocorrelation' | 'fft' = 'autocorrelation';
  private estimatedFrequency = 0;
  private readonly MIN_FREQUENCY_HZ = 50; // Minimum detectable frequency (Hz)
  private readonly MAX_FREQUENCY_HZ = 1000; // Maximum detectable frequency (Hz)
  private readonly FFT_MAGNITUDE_THRESHOLD = 10; // Minimum FFT magnitude to consider as valid signal
  private readonly FREQUENCY_HISTORY_SIZE = 7; // Number of recent frequency estimates to keep for smoothing
  private frequencyHistory: number[] = []; // Circular buffer of recent frequency estimates
  private readonly FREQUENCY_GROUPING_TOLERANCE = 0.05; // 5% tolerance for grouping similar frequencies in mode filter

  /**
   * Estimate frequency using zero-crossing method
   * Counts zero-crossings in the buffer and calculates frequency
   */
  private estimateFrequencyZeroCrossing(data: Float32Array, sampleRate: number): number {
    let zeroCrossCount = 0;
    
    // Count zero-crossings (negative to positive only)
    for (let i = 0; i < data.length - 1; i++) {
      if (data[i] < 0 && data[i + 1] > 0) {
        zeroCrossCount++;
      }
    }
    
    // Each cycle has one zero-crossing (negative to positive)
    const duration = data.length / sampleRate;
    const frequency = zeroCrossCount / duration;
    
    // Apply frequency range filtering
    return (frequency >= this.MIN_FREQUENCY_HZ && frequency <= this.MAX_FREQUENCY_HZ) ? frequency : 0;
  }

  /**
   * Estimate frequency using autocorrelation method
   * Finds the period by correlating the signal with itself
   */
  private estimateFrequencyAutocorrelation(data: Float32Array, sampleRate: number): number {
    const minPeriod = Math.floor(sampleRate / this.MAX_FREQUENCY_HZ);
    const maxPeriod = Math.floor(sampleRate / this.MIN_FREQUENCY_HZ);
    
    // Precompute total signal energy (lag-0 autocorrelation)
    let totalEnergy = 0;
    for (let i = 0; i < data.length; i++) {
      const v = data[i];
      totalEnergy += v * v;
    }
    if (totalEnergy === 0) {
      return 0;
    }
    
    let bestCorrelation = 0;
    let bestPeriod = 0;
    
    // Calculate autocorrelation for different lags
    for (let lag = minPeriod; lag < Math.min(maxPeriod, data.length / 2); lag++) {
      let correlation = 0;
      
      for (let i = 0; i < data.length - lag; i++) {
        correlation += data[i] * data[i + lag];
      }
      
      // Normalize by total energy to get correlation coefficient
      const normalizedCorrelation = correlation / totalEnergy;
      
      if (normalizedCorrelation > bestCorrelation) {
        bestCorrelation = normalizedCorrelation;
        bestPeriod = lag;
      }
    }
    
    if (bestPeriod === 0) return 0;
    return sampleRate / bestPeriod;
  }

  /**
   * Estimate frequency using FFT method
   * Finds the peak in the frequency spectrum
   */
  private estimateFrequencyFFT(frequencyData: Uint8Array, sampleRate: number, fftSize: number, isSignalAboveNoiseGate: boolean): number {
    // Check noise gate - caller determines if signal passes noise gate
    if (!isSignalAboveNoiseGate) {
      return 0;
    }
    
    // Calculate bin range for our frequency limits
    const binFrequency = sampleRate / fftSize;
    const minBin = Math.max(1, Math.floor(this.MIN_FREQUENCY_HZ / binFrequency));
    const maxBin = Math.min(frequencyData.length, Math.ceil(this.MAX_FREQUENCY_HZ / binFrequency));
    
    // Find the bin with maximum magnitude within the frequency range
    let maxMagnitude = 0;
    let peakBin = 0;
    
    for (let i = minBin; i < maxBin; i++) {
      if (frequencyData[i] > maxMagnitude) {
        maxMagnitude = frequencyData[i];
        peakBin = i;
      }
    }
    
    // Threshold to avoid noise (Uint8Array range is 0-255)
    if (maxMagnitude < this.FFT_MAGNITUDE_THRESHOLD) return 0;
    
    // Convert bin to frequency
    return peakBin * binFrequency;
  }

  /**
   * Smooth frequency estimate using mode (most frequent value) with tolerance
   * This prevents rapid oscillation between harmonics
   */
  private smoothFrequencyEstimate(rawFrequency: number): number {
    // If no valid frequency detected, clear history and return 0
    if (rawFrequency === 0) {
      this.frequencyHistory = [];
      return 0;
    }

    // Add new frequency to history
    this.frequencyHistory.push(rawFrequency);
    
    // Keep only the most recent estimates (circular buffer behavior)
    if (this.frequencyHistory.length > this.FREQUENCY_HISTORY_SIZE) {
      this.frequencyHistory.shift();
    }

    // If we don't have enough history yet, return the raw frequency
    if (this.frequencyHistory.length < 3) {
      return rawFrequency;
    }

    // Find mode (most frequent value) within a tolerance
    const frequencyGroups: { center: number; count: number; sum: number }[] = [];

    for (const freq of this.frequencyHistory) {
      let foundGroup = false;
      for (const group of frequencyGroups) {
        const relDiff = Math.abs(freq - group.center) / group.center;
        if (relDiff <= this.FREQUENCY_GROUPING_TOLERANCE) {
          group.count++;
          group.sum += freq;
          group.center = group.sum / group.count; // Update center to average
          foundGroup = true;
          break;
        }
      }
      if (!foundGroup) {
        frequencyGroups.push({ center: freq, count: 1, sum: freq });
      }
    }

    // Find the group with the highest count
    let maxCount = 0;
    let modeFrequency = rawFrequency;
    for (const group of frequencyGroups) {
      if (group.count > maxCount) {
        maxCount = group.count;
        modeFrequency = group.center;
      }
    }

    return modeFrequency;
  }

  /**
   * Estimate frequency based on selected method
   * @param isSignalAboveNoiseGate - Result of noise gate check, used for FFT method
   */
  estimateFrequency(data: Float32Array, frequencyData: Uint8Array | null, sampleRate: number, fftSize: number, isSignalAboveNoiseGate: boolean): number {
    let rawFrequency: number;
    switch (this.frequencyEstimationMethod) {
      case 'zero-crossing':
        rawFrequency = this.estimateFrequencyZeroCrossing(data, sampleRate);
        break;
      case 'autocorrelation':
        rawFrequency = this.estimateFrequencyAutocorrelation(data, sampleRate);
        break;
      case 'fft':
        if (!frequencyData) {
          rawFrequency = 0;
        } else {
          rawFrequency = this.estimateFrequencyFFT(frequencyData, sampleRate, fftSize, isSignalAboveNoiseGate);
        }
        break;
      default:
        rawFrequency = 0;
    }
    
    // Apply temporal smoothing to prevent oscillation between harmonics
    this.estimatedFrequency = this.smoothFrequencyEstimate(rawFrequency);
    return this.estimatedFrequency;
  }

  /**
   * Clear frequency history (e.g., when stopping)
   */
  clearHistory(): void {
    this.frequencyHistory = [];
    this.estimatedFrequency = 0;
  }

  // Getters and setters
  setFrequencyEstimationMethod(method: 'zero-crossing' | 'autocorrelation' | 'fft'): void {
    this.frequencyEstimationMethod = method;
    // Clear frequency history when changing methods
    this.frequencyHistory = [];
  }

  getFrequencyEstimationMethod(): string {
    return this.frequencyEstimationMethod;
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
}
