/**
 * GainController handles automatic gain control and noise gate
 * Responsible for:
 * - Auto-gain calculation and smoothing
 * - Noise gate threshold checking
 * - Signal amplitude management
 */
export class GainController {
  private autoGainEnabled = true;
  private currentGain = 1.0;
  private targetGain = 1.0;
  private peakDecay = 0.95; // Decay factor for peak tracking between frames (0.95 = 5% decay per frame)
  private previousPeak = 0;
  private readonly minPeakThreshold = 0.01; // Minimum peak to avoid division by very small numbers
  private readonly TARGET_AMPLITUDE_RATIO = 0.8; // Target 80% of canvas height to avoid clipping
  private readonly MIN_GAIN = 0.5; // Minimum gain to prevent excessive attenuation
  private readonly MAX_GAIN = 99.0; // Maximum gain to prevent excessive amplification
  private readonly GAIN_SMOOTHING_FACTOR = 0.1; // Interpolation speed for smooth gain transitions
  private readonly MAX_SAMPLES_TO_CHECK = 512; // Maximum samples to check for peak detection (performance optimization)
  private readonly CLIPPING_SAFETY_FACTOR = 0.95; // Safety margin for immediate gain reduction when clipping (95% of max)
  
  private noiseGateEnabled = true;
  private noiseGateThreshold = 0.00398; // Default threshold (-48dB, approximately 0.4% of max amplitude)

  /**
   * Calculate optimal gain based on waveform peak
   */
  calculateAutoGain(data: Float32Array, startIndex: number, endIndex: number): void {
    if (!this.autoGainEnabled) {
      this.targetGain = 1.0;
      return;
    }

    // Find the peak amplitude in the displayed range
    let peak = 0;
    const clampedStart = Math.max(0, startIndex);
    const clampedEnd = Math.min(data.length, endIndex);
    const rangeLength = Math.max(0, clampedEnd - clampedStart);

    if (rangeLength > 0) {
      const stride = Math.max(1, Math.floor(rangeLength / this.MAX_SAMPLES_TO_CHECK));

      for (let i = clampedStart; i < clampedEnd; i += stride) {
        const value = Math.abs(data[i]);
        if (value > peak) {
          peak = value;
        }
      }
    }

    // Update peak tracking with decay for smooth transitions
    if (peak >= this.previousPeak) {
      // Signal is rising or sustained - update immediately without decay
      this.previousPeak = peak;
    } else {
      // Signal is falling - apply decay to smooth the transition
      this.previousPeak = Math.max(peak, this.previousPeak * this.peakDecay);
      peak = this.previousPeak;
    }

    // Calculate target gain (aim for TARGET_AMPLITUDE_RATIO of canvas height to avoid clipping)
    if (peak > this.minPeakThreshold) {
      this.targetGain = this.TARGET_AMPLITUDE_RATIO / peak;
      // Clamp gain to reasonable range
      this.targetGain = Math.min(Math.max(this.targetGain, this.MIN_GAIN), this.MAX_GAIN);
    }

    // Check if current gain would cause clipping
    const wouldClip = peak > this.minPeakThreshold && (peak * this.currentGain) > 1.0;

    if (wouldClip) {
      // Immediately reduce gain to fit within display range
      const idealGain = this.CLIPPING_SAFETY_FACTOR / peak;
      this.currentGain = Math.min(Math.max(idealGain, this.MIN_GAIN), this.MAX_GAIN);
      this.targetGain = this.currentGain;
    } else {
      // Smooth gain adjustment (interpolate towards target) only when not clipping
      this.currentGain += (this.targetGain - this.currentGain) * this.GAIN_SMOOTHING_FACTOR;
    }
  }

  /**
   * Check if signal passes the noise gate threshold
   * Returns true if noise gate is disabled or signal RMS is above threshold
   */
  isSignalAboveNoiseGate(data: Float32Array): boolean {
    if (!this.noiseGateEnabled) {
      return true; // If noise gate is disabled, always pass
    }

    // Calculate RMS (Root Mean Square) of the entire buffer for noise gate detection
    let sumSquares = 0;
    const sampleCount = Math.min(data.length, this.MAX_SAMPLES_TO_CHECK);
    const stride = Math.max(1, Math.floor(data.length / sampleCount));
    let samplesProcessed = 0;
    
    // Sample at most `sampleCount` points from the buffer
    for (let i = 0; i < data.length && samplesProcessed < sampleCount; i += stride) {
      sumSquares += data[i] * data[i];
      samplesProcessed++;
    }
    
    // If no samples were processed (e.g., empty buffer), treat as below gate
    if (samplesProcessed === 0) {
      return false;
    }
    
    const rms = Math.sqrt(sumSquares / samplesProcessed);
    
    // Check if RMS is above threshold
    return rms >= this.noiseGateThreshold;
  }

  /**
   * Apply noise gate to the signal data
   * If the signal RMS is below the threshold, zero out all samples
   * This modifies the data array in place
   */
  applyNoiseGate(data: Float32Array): void {
    if (!this.isSignalAboveNoiseGate(data)) {
      data.fill(0);
    }
  }

  // Getters and setters
  getCurrentGain(): number {
    return this.currentGain;
  }

  setAutoGain(enabled: boolean): void {
    this.autoGainEnabled = enabled;
    if (!enabled) {
      // Reset gain to 1.0 when disabled
      this.currentGain = 1.0;
      this.targetGain = 1.0;
      this.previousPeak = 0;
    }
  }

  getAutoGainEnabled(): boolean {
    return this.autoGainEnabled;
  }

  setNoiseGate(enabled: boolean): void {
    this.noiseGateEnabled = enabled;
  }

  getNoiseGateEnabled(): boolean {
    return this.noiseGateEnabled;
  }

  setNoiseGateThreshold(threshold: number): void {
    // Clamp threshold between 0 and 1
    this.noiseGateThreshold = Math.min(Math.max(threshold, 0), 1);
  }

  getNoiseGateThreshold(): number {
    return this.noiseGateThreshold;
  }
}
