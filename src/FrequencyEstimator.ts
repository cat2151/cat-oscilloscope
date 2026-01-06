/**
 * FrequencyEstimator handles frequency detection using various algorithms
 * Responsible for:
 * - Zero-crossing detection
 * - Autocorrelation analysis
 * - FFT-based frequency estimation
 * - STFT (Short-Time Fourier Transform) with variable buffer sizes
 * - CQT (Constant-Q Transform) with variable buffer sizes
 * - Frequency smoothing and temporal stability
 */
export class FrequencyEstimator {
  private frequencyEstimationMethod: 'zero-crossing' | 'autocorrelation' | 'fft' | 'stft' | 'cqt' = 'autocorrelation';
  private estimatedFrequency = 0;
  private readonly MIN_FREQUENCY_HZ = 20; // Minimum detectable frequency (Hz) - lower limit for STFT/CQT with extended buffers
  private readonly MAX_FREQUENCY_HZ = 5000; // Maximum detectable frequency (Hz) - allows viewing harmonics up to 5th for 880Hz
  private readonly FFT_MAGNITUDE_THRESHOLD = 10; // Minimum FFT magnitude to consider as valid signal
  private readonly FREQUENCY_HISTORY_SIZE = 7; // Number of recent frequency estimates to keep for smoothing
  private frequencyHistory: number[] = []; // Circular buffer of recent frequency estimates
  private readonly FREQUENCY_GROUPING_TOLERANCE = 0.05; // 5% tolerance for grouping similar frequencies in mode filter
  private bufferSizeMultiplier: 1 | 4 | 16 = 1; // Buffer size multiplier for extended FFT

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
   * Estimate frequency using STFT (Short-Time Fourier Transform) method
   * Uses overlapping windows to improve frequency resolution for low frequencies
   * 
   * Note: This implementation uses a naive DFT for educational purposes.
   * For production use with large buffer sizes, consider using an FFT library like fft.js
   * for O(n log n) performance instead of O(n²).
   */
  private estimateFrequencySTFT(data: Float32Array, sampleRate: number, isSignalAboveNoiseGate: boolean): number {
    // Check noise gate
    if (!isSignalAboveNoiseGate) {
      return 0;
    }
    
    // Window size depends on buffer multiplier for better low-frequency resolution
    // Ensure minimum window size of 512 samples to maintain reasonable frequency resolution
    const MIN_WINDOW_SIZE = 512;
    const desiredWindowSize = 2048 * this.bufferSizeMultiplier;
    const windowSize = Math.max(MIN_WINDOW_SIZE, Math.min(data.length, desiredWindowSize));
    
    // If data is too short, skip STFT analysis
    if (data.length < MIN_WINDOW_SIZE) {
      return 0;
    }
    
    const hopSize = Math.floor(windowSize / 2); // 50% overlap
    
    // Apply Hann window to reduce spectral leakage
    const hannWindow = this.createHannWindow(windowSize);
    
    // Process multiple windows and average the results
    const numWindows = Math.floor((data.length - windowSize) / hopSize) + 1;
    const frequencyCandidates: number[] = [];
    
    for (let w = 0; w < numWindows && w < 4; w++) { // Limit to 4 windows for performance
      const startIndex = w * hopSize;
      const endIndex = startIndex + windowSize;
      
      if (endIndex > data.length) break;
      
      // Extract windowed segment
      const segment = new Float32Array(windowSize);
      for (let i = 0; i < windowSize; i++) {
        segment[i] = data[startIndex + i] * hannWindow[i];
      }
      
      // Compute peak frequency using DFT (O(n²) complexity)
      // Note: For production with large buffers, use an FFT library for better performance
      const frequency = this.computePeakFrequencyFromDFT(segment, sampleRate, windowSize);
      
      if (frequency > 0) {
        frequencyCandidates.push(frequency);
      }
    }
    
    // Return median frequency to reduce outliers
    if (frequencyCandidates.length === 0) return 0;
    
    frequencyCandidates.sort((a, b) => a - b);
    const medianIndex = Math.floor(frequencyCandidates.length / 2);
    return frequencyCandidates[medianIndex];
  }

  /**
   * Estimate frequency using CQT (Constant-Q Transform) method
   * Provides better frequency resolution at low frequencies
   * 
   * Note: Uses Goertzel algorithm for single-frequency DFT, which is more efficient
   * than full DFT when computing only a subset of frequency bins.
   */
  private estimateFrequencyCQT(data: Float32Array, sampleRate: number, isSignalAboveNoiseGate: boolean): number {
    // Check noise gate
    if (!isSignalAboveNoiseGate) {
      return 0;
    }
    
    // CQT parameters: logarithmically spaced frequency bins
    const binsPerOctave = 12; // 12 bins per octave (one per semitone)
    const minFreq = this.MIN_FREQUENCY_HZ;
    const maxFreq = this.MAX_FREQUENCY_HZ;
    
    // Calculate number of bins
    const numOctaves = Math.log2(maxFreq / minFreq);
    const numBins = Math.floor(numOctaves * binsPerOctave);
    
    // Quality factor Q - determines filter bandwidth
    const Q = 1 / (Math.pow(2, 1 / binsPerOctave) - 1);
    
    // Compute CQT bins
    let maxMagnitude = 0;
    let peakFrequency = 0;
    
    for (let k = 0; k < numBins; k++) {
      // Calculate center frequency for this bin
      const centerFreq = minFreq * Math.pow(2, k / binsPerOctave);
      
      // Window length for this frequency
      const idealWindowLength = Math.floor(Q * sampleRate / centerFreq);
      
      // Adjust window length to available data, but skip if too short
      // Minimum 2 cycles required for meaningful frequency detection
      const minWindowLength = Math.floor(2 * sampleRate / centerFreq);
      if (data.length < minWindowLength) {
        continue; // Skip this frequency bin - insufficient data
      }
      
      const windowLength = Math.min(idealWindowLength, data.length);
      
      // Compute magnitude at this frequency using Goertzel algorithm
      const magnitude = this.goertzelMagnitude(data, centerFreq, sampleRate, windowLength);
      
      if (magnitude > maxMagnitude) {
        maxMagnitude = magnitude;
        peakFrequency = centerFreq;
      }
    }
    
    // Apply threshold
    const threshold = this.FFT_MAGNITUDE_THRESHOLD / 255.0; // Normalize to [0,1] range
    if (maxMagnitude < threshold) return 0;
    
    return peakFrequency;
  }

  /**
   * Create Hann window for STFT
   */
  private createHannWindow(size: number): Float32Array {
    const window = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (size - 1)));
    }
    return window;
  }

  /**
   * Compute peak frequency from DFT of a windowed segment
   * Simplified implementation for demonstration purposes
   * 
   * Performance Note: This naive DFT implementation has O(n²) complexity.
   * It computes only the frequency bins of interest (MIN_FREQUENCY_HZ to MAX_FREQUENCY_HZ)
   * to reduce computation, but it's still slower than FFT for large buffer sizes.
   * 
   * For production use with extended buffers (4x, 16x), consider:
   * - Using an FFT library (fft.js, kiss-fft, etc.) for O(n log n) performance
   * - Using Web Audio API's AnalyserNode for hardware-accelerated FFT
   * - Pre-computing and caching results for repeated analysis
   * 
   * @param data - Windowed signal segment
   * @param sampleRate - Audio sample rate
   * @param fftSize - Size of the DFT (typically equal to data.length)
   * @returns Peak frequency in Hz, or 0 if below threshold
   */
  private computePeakFrequencyFromDFT(data: Float32Array, sampleRate: number, fftSize: number): number {
    const binFrequency = sampleRate / fftSize;
    const minBin = Math.max(1, Math.floor(this.MIN_FREQUENCY_HZ / binFrequency));
    const maxBin = Math.min(Math.floor(fftSize / 2), Math.ceil(this.MAX_FREQUENCY_HZ / binFrequency));
    
    let maxMagnitude = 0;
    let peakBin = 0;
    
    // Compute magnitude spectrum for frequency range of interest
    // Note: O(n × k) complexity where n = data.length, k = number of frequency bins
    for (let k = minBin; k < maxBin; k++) {
      let real = 0;
      let imag = 0;
      const omega = 2 * Math.PI * k / fftSize;
      
      // Compute DFT bin
      for (let n = 0; n < data.length; n++) {
        const angle = omega * n;
        real += data[n] * Math.cos(angle);
        imag -= data[n] * Math.sin(angle);
      }
      
      const magnitude = Math.sqrt(real * real + imag * imag);
      
      if (magnitude > maxMagnitude) {
        maxMagnitude = magnitude;
        peakBin = k;
      }
    }
    
    // Threshold scales with buffer length since DFT magnitude increases with more samples
    // This maintains consistent sensitivity across different buffer sizes
    const normalizedThreshold = this.FFT_MAGNITUDE_THRESHOLD * data.length / 255.0;
    if (maxMagnitude < normalizedThreshold) return 0;
    
    return peakBin * binFrequency;
  }

  /**
   * Goertzel algorithm for efficient single-frequency DFT
   * Used in CQT to detect magnitude at specific frequency
   */
  private goertzelMagnitude(data: Float32Array, targetFreq: number, sampleRate: number, windowLength: number): number {
    const k = Math.floor(0.5 + (windowLength * targetFreq) / sampleRate);
    const omega = (2 * Math.PI * k) / windowLength;
    const coeff = 2 * Math.cos(omega);
    
    let s_prev = 0;
    let s_prev2 = 0;
    
    const actualLength = Math.min(windowLength, data.length);
    
    for (let i = 0; i < actualLength; i++) {
      const s = data[i] + coeff * s_prev - s_prev2;
      s_prev2 = s_prev;
      s_prev = s;
    }
    
    // Compute magnitude
    const real = s_prev - s_prev2 * Math.cos(omega);
    const imag = s_prev2 * Math.sin(omega);
    
    return Math.sqrt(real * real + imag * imag) / actualLength;
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
   * @param data - Time-domain data buffer (may be extended for STFT/CQT)
   * @param frequencyData - Frequency-domain data from analyser (for FFT method)
   * @param sampleRate - Audio sample rate
   * @param fftSize - FFT size
   * @param isSignalAboveNoiseGate - Result of noise gate check
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
      case 'stft':
        rawFrequency = this.estimateFrequencySTFT(data, sampleRate, isSignalAboveNoiseGate);
        break;
      case 'cqt':
        rawFrequency = this.estimateFrequencyCQT(data, sampleRate, isSignalAboveNoiseGate);
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
  setFrequencyEstimationMethod(method: 'zero-crossing' | 'autocorrelation' | 'fft' | 'stft' | 'cqt'): void {
    this.frequencyEstimationMethod = method;
    // Clear frequency history when changing methods
    this.frequencyHistory = [];
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
}
