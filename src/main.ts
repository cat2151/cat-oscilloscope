class Oscilloscope {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Float32Array | null = null;
  private frequencyData: Uint8Array | null = null;
  private animationId: number | null = null;
  private isRunning = false;
  private mediaStream: MediaStream | null = null;
  private autoGainEnabled = true;
  private currentGain = 1.0;
  private targetGain = 1.0;
  private peakDecay = 0.95; // Decay factor for peak tracking between frames (0.95 = 5% decay per frame)
  private previousPeak = 0;
  private readonly minPeakThreshold = 0.01; // Minimum peak to avoid division by very small numbers
  private readonly TARGET_AMPLITUDE_RATIO = 0.8; // Target 80% of canvas height to avoid clipping
  private readonly MIN_GAIN = 0.5; // Minimum gain to prevent excessive attenuation
  private readonly MAX_GAIN = 20.0; // Maximum gain to prevent excessive amplification
  private readonly GAIN_SMOOTHING_FACTOR = 0.1; // Interpolation speed for smooth gain transitions
  private readonly MAX_SAMPLES_TO_CHECK = 512; // Maximum samples to check for peak detection (performance optimization)
  private readonly CLIPPING_SAFETY_FACTOR = 0.95; // Safety margin for immediate gain reduction when clipping (95% of max)
  private noiseGateEnabled = true;
  private noiseGateThreshold = 0.01; // Default threshold (1% of max amplitude)
  private frequencyEstimationMethod: 'zero-crossing' | 'autocorrelation' | 'fft' = 'autocorrelation';
  private estimatedFrequency = 0;
  private readonly MIN_FREQUENCY_HZ = 50; // Minimum detectable frequency (Hz)
  private readonly MAX_FREQUENCY_HZ = 1000; // Maximum detectable frequency (Hz)
  private readonly FFT_MAGNITUDE_THRESHOLD = 10; // Minimum FFT magnitude to consider as valid signal
  private readonly FFT_OVERLAY_HEIGHT_RATIO = 0.9; // Spectrum bar height ratio within overlay (90%)
  private readonly FFT_MIN_BAR_WIDTH = 1; // Minimum bar width in pixels
  private fftDisplayEnabled = true;
  private readonly FREQUENCY_HISTORY_SIZE = 7; // Number of recent frequency estimates to keep for smoothing
  private frequencyHistory: number[] = []; // Circular buffer of recent frequency estimates
  private readonly FREQUENCY_GROUPING_TOLERANCE = 0.05; // 5% tolerance for grouping similar frequencies in mode filter
  // Zero-crossing temporal stability
  private previousZeroCrossIndex: number | null = null; // Previous frame's zero-crossing position
  private readonly ZERO_CROSS_SEARCH_TOLERANCE_CYCLES = 0.5; // Search within ±0.5 cycles of expected position

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context');
    }
    this.ctx = context;
  }

  async start(): Promise<void> {
    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Set up Web Audio API
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // Create analyser node with high resolution
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 4096; // Higher resolution for better waveform
      this.analyser.smoothingTimeConstant = 0; // No smoothing for accurate waveform
      
      // Connect nodes
      source.connect(this.analyser);
      
      // Create data array for time domain data
      const bufferLength = this.analyser.fftSize;
      this.dataArray = new Float32Array(bufferLength);
      
      // Create frequency data array for FFT
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      
      this.isRunning = true;
      this.render();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      try {
        await this.audioContext.close();
      } catch (error) {
        console.error('Error closing AudioContext:', error);
      }
      this.audioContext = null;
    }
    this.analyser = null;
    this.dataArray = null;
    this.frequencyData = null;
    this.frequencyHistory = []; // Clear frequency history on stop
    this.previousZeroCrossIndex = null; // Reset zero-crossing tracking on stop
  }

  /**
   * Estimate frequency using zero-crossing method
   * Counts zero-crossings in the buffer and calculates frequency
   * Note: A complete sine wave cycle crosses zero twice: once going up (negative-to-positive)
   *       and once going down (positive-to-negative). By counting only one direction,
   *       we get one count per complete cycle.
   */
  private estimateFrequencyZeroCrossing(data: Float32Array): number {
    if (!this.audioContext) return 0;
    
    const sampleRate = this.audioContext.sampleRate;
    let zeroCrossCount = 0;
    
    // Count zero-crossings (negative to positive only)
    // Use strict inequality to avoid counting multiple times when signal is at zero
    for (let i = 0; i < data.length - 1; i++) {
      if (data[i] < 0 && data[i + 1] > 0) {
        zeroCrossCount++;
      }
    }
    
    // Each cycle has one zero-crossing (negative to positive)
    // Frequency = (number of cycles) / (time duration)
    const duration = data.length / sampleRate;
    const frequency = zeroCrossCount / duration;
    
    // Apply frequency range filtering for consistency with other methods
    return (frequency >= this.MIN_FREQUENCY_HZ && frequency <= this.MAX_FREQUENCY_HZ) ? frequency : 0;
  }

  /**
   * Estimate frequency using autocorrelation method
   * Finds the period by correlating the signal with itself
   */
  private estimateFrequencyAutocorrelation(data: Float32Array): number {
    if (!this.audioContext) return 0;
    
    const sampleRate = this.audioContext.sampleRate;
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
  private estimateFrequencyFFT(data: Float32Array): number {
    if (!this.audioContext || !this.analyser || !this.frequencyData) return 0;
    
    // Check noise gate using the time-domain data (even though FFT uses frequency domain)
    // This ensures consistent behavior across all frequency estimation methods
    if (!this.isSignalAboveNoiseGate(data)) {
      return 0;
    }
    
    const sampleRate = this.audioContext.sampleRate;
    // @ts-ignore - Web Audio API type definitions issue
    this.analyser.getByteFrequencyData(this.frequencyData);
    
    // Calculate bin range for our frequency limits
    const binFrequency = sampleRate / this.analyser.fftSize;
    const minBin = Math.max(1, Math.floor(this.MIN_FREQUENCY_HZ / binFrequency));
    const maxBin = Math.min(this.frequencyData.length, Math.ceil(this.MAX_FREQUENCY_HZ / binFrequency));
    
    // Find the bin with maximum magnitude within the frequency range
    let maxMagnitude = 0;
    let peakBin = 0;
    
    for (let i = minBin; i < maxBin; i++) {
      if (this.frequencyData[i] > maxMagnitude) {
        maxMagnitude = this.frequencyData[i];
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
   * This prevents rapid oscillation between harmonics (e.g., fundamental vs 2x harmonic)
   * when their magnitudes are similar.
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
    // Group similar frequencies together (within tolerance)
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
   */
  private estimateFrequency(data: Float32Array): number {
    let rawFrequency: number;
    switch (this.frequencyEstimationMethod) {
      case 'zero-crossing':
        rawFrequency = this.estimateFrequencyZeroCrossing(data);
        break;
      case 'autocorrelation':
        rawFrequency = this.estimateFrequencyAutocorrelation(data);
        break;
      case 'fft':
        rawFrequency = this.estimateFrequencyFFT(data);
        break;
      default:
        rawFrequency = 0;
    }
    
    // Apply temporal smoothing to prevent oscillation between harmonics
    return this.smoothFrequencyEstimate(rawFrequency);
  }

  /**
   * Find zero-cross point where signal crosses from negative to positive
   */
  private findZeroCross(data: Float32Array, startIndex: number = 0): number {
    for (let i = startIndex; i < data.length - 1; i++) {
      // Look for transition from negative (or zero) to positive
      if (data[i] <= 0 && data[i + 1] > 0) {
        return i;
      }
    }
    return -1; // No zero-cross found
  }

  /**
   * Find the next zero-cross point after the given index
   */
  private findNextZeroCross(data: Float32Array, startIndex: number): number {
    // Start searching from the next sample to find the next cycle
    const searchStart = startIndex + 1;
    if (searchStart >= data.length) {
      return -1;
    }
    return this.findZeroCross(data, searchStart);
  }

  /**
   * Find a stable zero-crossing position with temporal continuity
   * This prevents rapid switching between different waveform patterns
   */
  private findStableZeroCross(data: Float32Array, estimatedCycleLength: number): number {
    // If we have a previous zero-crossing position and frequency estimate
    if (this.previousZeroCrossIndex !== null && estimatedCycleLength > 0) {
      if (!this.audioContext) {
        // No audio context, reset and fall back to full search
        this.previousZeroCrossIndex = null;
      } else {
        // Calculate expected position relative to the start of the current buffer.
        // Each call to getFloatTimeDomainData returns a snapshot, so we only use
        // the previous index as a hint within the current buffer's bounds.
        let expectedIndex = this.previousZeroCrossIndex;
        
        // If the previous index is out of range for the current buffer, reset.
        if (expectedIndex < 0 || expectedIndex >= data.length) {
          this.previousZeroCrossIndex = null;
        } else {
          // Define search range around expected position
          const searchTolerance = estimatedCycleLength * this.ZERO_CROSS_SEARCH_TOLERANCE_CYCLES;
          const searchStart = Math.max(0, Math.floor(expectedIndex - searchTolerance));
          const searchEnd = Math.min(data.length - 1, Math.ceil(expectedIndex + searchTolerance));
          
          // Search for zero-crossing nearest to expected position
          let bestZeroCross = -1;
          let bestDistance = Infinity;
          
          // Ensure we don't access out of bounds when checking data[i + 1]
          for (let i = searchStart; i < searchEnd && i < data.length - 1; i++) {
            if (data[i] <= 0 && data[i + 1] > 0) {
              const distance = Math.abs(i - expectedIndex);
              if (distance < bestDistance) {
                bestDistance = distance;
                bestZeroCross = i;
              }
            }
          }
          
          // If we found a zero-crossing near expected position, use it
          if (bestZeroCross !== -1) {
            this.previousZeroCrossIndex = bestZeroCross;
            return bestZeroCross;
          }
        }
      }
    }
    
    // No previous position or search failed - find first zero-crossing
    const zeroCross = this.findZeroCross(data, 0);
    if (zeroCross !== -1) {
      this.previousZeroCrossIndex = zeroCross;
    }
    return zeroCross;
  }

  private render(): void {
    if (!this.isRunning || !this.analyser || !this.dataArray) {
      return;
    }

    // Get waveform data
    // @ts-ignore - Web Audio API type definitions issue: Float32Array constructor creates ArrayBufferLike
    // but getFloatTimeDomainData expects ArrayBuffer. This works at runtime.
    this.analyser.getFloatTimeDomainData(this.dataArray);

    // Apply noise gate to input signal (modifies dataArray in place)
    this.applyNoiseGate(this.dataArray);

    // Estimate frequency (now works on gated signal)
    this.estimatedFrequency = this.estimateFrequency(this.dataArray);

    // Get frequency data for FFT display
    // When using FFT-based frequency estimation, estimateFrequencyFFT() is responsible
    // for filling this.frequencyData to avoid redundant analyser.getByteFrequencyData() calls.
    if (this.frequencyData && this.frequencyEstimationMethod !== 'fft') {
      // @ts-ignore - Web Audio API type definitions issue
      this.analyser.getByteFrequencyData(this.frequencyData);
    }

    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    this.drawGrid();

    // Calculate display range and draw waveform with zero-cross indicators
    const displayRange = this.calculateDisplayRange(this.dataArray);
    if (displayRange) {
      this.drawWaveform(this.dataArray, displayRange.startIndex, displayRange.endIndex);
      this.drawZeroCrossLine(displayRange.firstZeroCross, displayRange.startIndex, displayRange.endIndex);
      if (displayRange.secondZeroCross !== undefined) {
        this.drawZeroCrossLine(displayRange.secondZeroCross, displayRange.startIndex, displayRange.endIndex);
      }
    } else {
      // No zero-cross found, draw entire buffer
      this.drawWaveform(this.dataArray, 0, this.dataArray.length);
    }

    // Draw FFT spectrum overlay if enabled
    if (this.fftDisplayEnabled) {
      this.drawFFTOverlay();
    }

    // Continue rendering
    this.animationId = requestAnimationFrame(() => this.render());
  }

  /**
   * Calculate the optimal display range for the waveform with zero-cross padding
   */
  private calculateDisplayRange(data: Float32Array): {
    startIndex: number;
    endIndex: number;
    firstZeroCross: number;
    secondZeroCross?: number;
  } | null {
    // Find the first zero-cross point to estimate cycle length
    const estimationZeroCross = this.findZeroCross(data, 0);
    
    if (estimationZeroCross === -1) {
      return null; // No zero-cross found
    }

    // Find the next zero-cross to determine cycle length
    const nextZeroCross = this.findNextZeroCross(data, estimationZeroCross);
    
    let cycleLength: number;
    if (nextZeroCross === -1) {
      // Only one zero-cross found, estimate from frequency if available
      if (this.estimatedFrequency > 0 && this.audioContext) {
        cycleLength = Math.floor(this.audioContext.sampleRate / this.estimatedFrequency);
      } else {
        // No frequency info, display from found zero-cross to end
        return {
          startIndex: estimationZeroCross,
          endIndex: data.length,
          firstZeroCross: estimationZeroCross,
        };
      }
    } else {
      cycleLength = nextZeroCross - estimationZeroCross;
    }

    // Use stable zero-crossing detection to prevent rapid pattern switching
    const firstZeroCross = this.findStableZeroCross(data, cycleLength);
    
    if (firstZeroCross === -1) {
      return null; // No stable zero-cross found
    }
    
    const secondZeroCross = this.findNextZeroCross(data, firstZeroCross);

    // Calculate phase padding
    const rawPhasePadding = Math.floor(cycleLength / 16); // π/8 of one cycle (2π / 16 = π/8)
    const maxPhasePadding = Math.floor(data.length / 2);
    const phasePadding = Math.min(rawPhasePadding, maxPhasePadding);
    
    if (secondZeroCross === -1) {
      // Only one suitable zero-cross found, display from there to end
      return {
        startIndex: Math.max(0, firstZeroCross - phasePadding),
        endIndex: data.length,
        firstZeroCross: firstZeroCross,
      };
    }

    // Display from phase -π/8 to phase 2π+π/8
    const startIndex = Math.max(0, firstZeroCross - phasePadding);
    const endIndex = Math.min(data.length, secondZeroCross + phasePadding);
    
    return {
      startIndex,
      endIndex,
      firstZeroCross,
      secondZeroCross,
    };
  }

  private drawGrid(): void {
    this.ctx.strokeStyle = '#222222';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();

    // Horizontal lines
    const horizontalLines = 5;
    for (let i = 0; i <= horizontalLines; i++) {
      const y = (this.canvas.height / horizontalLines) * i;
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
    }

    // Vertical lines
    const verticalLines = 10;
    for (let i = 0; i <= verticalLines; i++) {
      const x = (this.canvas.width / verticalLines) * i;
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
    }

    this.ctx.stroke();

    // Center line (zero line)
    this.ctx.strokeStyle = '#444444';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.canvas.height / 2);
    this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
    this.ctx.stroke();
  }

  /**
   * Check if signal passes the noise gate threshold
   * Returns true if noise gate is disabled or signal RMS is above threshold
   */
  private isSignalAboveNoiseGate(data: Float32Array): boolean {
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
  private applyNoiseGate(data: Float32Array): void {
    if (!this.isSignalAboveNoiseGate(data)) {
      data.fill(0);
    }
  }

  /**
   * Calculate optimal gain based on waveform peak
   */
  private calculateAutoGain(data: Float32Array, startIndex: number, endIndex: number): void {
    if (!this.autoGainEnabled) {
      this.targetGain = 1.0;
      return;
    }

    // Find the peak amplitude in the displayed range
    // To keep this efficient even with large ranges, sample with a stride
    // so that we inspect at most a fixed number of points per frame.
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
    // Only decay when the current peak is significantly lower (rising signals update immediately)
    if (peak >= this.previousPeak) {
      // Signal is rising or sustained - update immediately without decay
      this.previousPeak = peak;
    } else {
      // Signal is falling - apply decay to smooth the transition
      this.previousPeak = Math.max(peak, this.previousPeak * this.peakDecay);
      // Use the decayed previous peak as the effective peak for gain calculation
      peak = this.previousPeak;
    }

    // Calculate target gain (aim for TARGET_AMPLITUDE_RATIO of canvas height to avoid clipping)
    if (peak > this.minPeakThreshold) {
      this.targetGain = this.TARGET_AMPLITUDE_RATIO / peak;
      // Clamp gain to reasonable range
      this.targetGain = Math.min(Math.max(this.targetGain, this.MIN_GAIN), this.MAX_GAIN);
    }

    // Check if current gain would cause clipping (waveform exceeding display boundaries)
    // The drawing code multiplies peak values by (canvas.height/2 * currentGain)
    // Clipping occurs when this product exceeds canvas.height/2, i.e., when peak * currentGain > 1.0
    const wouldClip = peak > this.minPeakThreshold && (peak * this.currentGain) > 1.0;

    if (wouldClip) {
      // Immediately reduce gain to fit within display range
      // Calculate ideal gain with safety factor
      const idealGain = this.CLIPPING_SAFETY_FACTOR / peak;
      // Apply clamping to both current and target for consistency
      this.currentGain = Math.min(Math.max(idealGain, this.MIN_GAIN), this.MAX_GAIN);
      this.targetGain = this.currentGain;
    } else {
      // Smooth gain adjustment (interpolate towards target) only when not clipping
      this.currentGain += (this.targetGain - this.currentGain) * this.GAIN_SMOOTHING_FACTOR;
    }
  }

  private drawWaveform(data: Float32Array, startIndex: number, endIndex: number): void {
    const dataLength = endIndex - startIndex;
    if (dataLength <= 0) return;

    // Calculate auto gain before drawing
    this.calculateAutoGain(data, startIndex, endIndex);

    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    const sliceWidth = this.canvas.width / dataLength;
    const centerY = this.canvas.height / 2;
    const baseAmplitude = this.canvas.height / 2;
    const amplitude = baseAmplitude * this.currentGain;

    for (let i = 0; i < dataLength; i++) {
      const dataIndex = startIndex + i;
      const value = data[dataIndex];
      const rawY = centerY - (value * amplitude);
      const y = Math.min(this.canvas.height, Math.max(0, rawY));
      const x = i * sliceWidth;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    this.ctx.stroke();
  }

  /**
   * Draw a vertical line at the zero-cross point
   */
  private drawZeroCrossLine(zeroCrossIndex: number, startIndex: number, endIndex: number): void {
    const dataLength = endIndex - startIndex;
    if (dataLength <= 0) return;

    // Check if zero-cross point is within the displayed range
    if (zeroCrossIndex < startIndex || zeroCrossIndex >= endIndex) {
      return;
    }

    // Calculate the x position of the zero-cross point in canvas coordinates
    const relativeIndex = zeroCrossIndex - startIndex;
    const sliceWidth = this.canvas.width / dataLength;
    const x = relativeIndex * sliceWidth;

    // Draw a vertical line in red to mark the zero-cross point
    // Save and restore canvas state to avoid side effects
    this.ctx.save();
    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x, 0);
    this.ctx.lineTo(x, this.canvas.height);
    this.ctx.stroke();
    this.ctx.restore();
  }

  /**
   * Draw FFT spectrum overlay in bottom-left corner of canvas
   */
  private drawFFTOverlay(): void {
    if (!this.frequencyData || !this.audioContext || !this.analyser) {
      return;
    }

    const sampleRate = this.audioContext.sampleRate;
    const binFrequency = sampleRate / this.analyser.fftSize;

    // Overlay dimensions (bottom-left corner, approximately 1/3 of canvas)
    const overlayWidth = Math.floor(this.canvas.width * 0.35);
    const overlayHeight = Math.floor(this.canvas.height * 0.35);
    const overlayX = 10; // 10px from left edge
    const overlayY = this.canvas.height - overlayHeight - 10; // 10px from bottom edge

    // Draw semi-transparent background
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(overlayX, overlayY, overlayWidth, overlayHeight);

    // Draw border
    this.ctx.strokeStyle = '#00aaff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(overlayX, overlayY, overlayWidth, overlayHeight);

    // Draw spectrum bars (only up to MAX_FREQUENCY_HZ)
    const maxBin = Math.min(
      this.frequencyData.length,
      Math.ceil(this.MAX_FREQUENCY_HZ / binFrequency)
    );
    const barWidth = overlayWidth / maxBin;

    this.ctx.fillStyle = '#00aaff';
    for (let i = 0; i < maxBin; i++) {
      const magnitude = this.frequencyData[i];
      const barHeight = (magnitude / 255) * overlayHeight * this.FFT_OVERLAY_HEIGHT_RATIO;
      const x = overlayX + i * barWidth;
      const y = overlayY + overlayHeight - barHeight;

      this.ctx.fillRect(x, y, Math.max(barWidth - 1, this.FFT_MIN_BAR_WIDTH), barHeight);
    }

    // Draw fundamental frequency marker
    // Only draw if frequency is within displayable range to avoid marker outside overlay bounds
    if (this.estimatedFrequency > 0 && this.estimatedFrequency <= this.MAX_FREQUENCY_HZ) {
      const frequencyBin = this.estimatedFrequency / binFrequency;
      const markerX = overlayX + frequencyBin * barWidth;

      this.ctx.strokeStyle = '#ff00ff';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(markerX, overlayY);
      this.ctx.lineTo(markerX, overlayY + overlayHeight);
      this.ctx.stroke();

      // Draw frequency label
      this.ctx.fillStyle = '#ff00ff';
      this.ctx.font = 'bold 12px Arial';
      const label = `${this.estimatedFrequency.toFixed(1)} Hz`;
      const textWidth = this.ctx.measureText(label).width;
      
      // Position label to avoid going off canvas
      let labelX = markerX + 3;
      if (labelX + textWidth > overlayX + overlayWidth - 5) {
        labelX = markerX - textWidth - 3;
      }
      
      this.ctx.fillText(label, labelX, overlayY + 15);
    }

    this.ctx.restore();
  }

  getIsRunning(): boolean {
    return this.isRunning;
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

  setFrequencyEstimationMethod(method: 'zero-crossing' | 'autocorrelation' | 'fft'): void {
    this.frequencyEstimationMethod = method;
    // Clear frequency history when changing methods to avoid mixing estimates from different algorithms
    this.frequencyHistory = [];
  }

  getFrequencyEstimationMethod(): string {
    return this.frequencyEstimationMethod;
  }

  getEstimatedFrequency(): number {
    return this.estimatedFrequency;
  }

  setFFTDisplay(enabled: boolean): void {
    this.fftDisplayEnabled = enabled;
  }

  getFFTDisplayEnabled(): boolean {
    return this.fftDisplayEnabled;
  }

  getCurrentGain(): number {
    return this.currentGain;
  }
}

// Main application logic
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const startButton = document.getElementById('startButton') as HTMLButtonElement;
const autoGainCheckbox = document.getElementById('autoGainCheckbox') as HTMLInputElement;
const noiseGateCheckbox = document.getElementById('noiseGateCheckbox') as HTMLInputElement;
const fftDisplayCheckbox = document.getElementById('fftDisplayCheckbox') as HTMLInputElement;
const noiseGateThreshold = document.getElementById('noiseGateThreshold') as HTMLInputElement;
const thresholdValue = document.getElementById('thresholdValue') as HTMLSpanElement;
const statusElement = document.getElementById('status') as HTMLSpanElement;
const frequencyMethod = document.getElementById('frequencyMethod') as HTMLSelectElement;
const frequencyValue = document.getElementById('frequencyValue') as HTMLSpanElement;
const gainValue = document.getElementById('gainValue') as HTMLSpanElement;

// Validate all required DOM elements
const requiredElements = [
  { element: canvas, name: 'canvas' },
  { element: startButton, name: 'startButton' },
  { element: autoGainCheckbox, name: 'autoGainCheckbox' },
  { element: noiseGateCheckbox, name: 'noiseGateCheckbox' },
  { element: fftDisplayCheckbox, name: 'fftDisplayCheckbox' },
  { element: noiseGateThreshold, name: 'noiseGateThreshold' },
  { element: thresholdValue, name: 'thresholdValue' },
  { element: statusElement, name: 'status' },
  { element: frequencyMethod, name: 'frequencyMethod' },
  { element: frequencyValue, name: 'frequencyValue' },
  { element: gainValue, name: 'gainValue' },
];

for (const { element, name } of requiredElements) {
  if (!element) {
    throw new Error(`Required DOM element not found: ${name}`);
  }
}

// Helper function to convert slider value (0-100) to threshold (0.00-1.00)
function sliderValueToThreshold(sliderValue: string): number {
  const value = parseFloat(sliderValue);
  
  if (Number.isNaN(value)) {
    throw new Error(`Invalid slider value for noise gate threshold: "${sliderValue}"`);
  }
  
  return value / 100;
}

const oscilloscope = new Oscilloscope(canvas);

// Synchronize checkbox state with oscilloscope's autoGainEnabled
oscilloscope.setAutoGain(autoGainCheckbox.checked);

// Synchronize noise gate controls
oscilloscope.setNoiseGate(noiseGateCheckbox.checked);
oscilloscope.setNoiseGateThreshold(sliderValueToThreshold(noiseGateThreshold.value));
thresholdValue.textContent = sliderValueToThreshold(noiseGateThreshold.value).toFixed(2);

// Synchronize FFT display control
oscilloscope.setFFTDisplay(fftDisplayCheckbox.checked);

// Auto gain checkbox handler
autoGainCheckbox.addEventListener('change', () => {
  oscilloscope.setAutoGain(autoGainCheckbox.checked);
});

// Noise gate checkbox handler
noiseGateCheckbox.addEventListener('change', () => {
  oscilloscope.setNoiseGate(noiseGateCheckbox.checked);
});

// FFT display checkbox handler
fftDisplayCheckbox.addEventListener('change', () => {
  oscilloscope.setFFTDisplay(fftDisplayCheckbox.checked);
});

// Noise gate threshold slider handler
noiseGateThreshold.addEventListener('input', () => {
  const threshold = sliderValueToThreshold(noiseGateThreshold.value);
  oscilloscope.setNoiseGateThreshold(threshold);
  thresholdValue.textContent = threshold.toFixed(2);
});

// Frequency estimation method selector handler
frequencyMethod.addEventListener('change', () => {
  const method = frequencyMethod.value as 'zero-crossing' | 'autocorrelation' | 'fft';
  oscilloscope.setFrequencyEstimationMethod(method);
});

// Update frequency display periodically
let frequencyUpdateInterval: number | null = null;

function startFrequencyDisplay(): void {
  if (frequencyUpdateInterval === null) {
    frequencyUpdateInterval = window.setInterval(() => {
      const frequency = oscilloscope.getEstimatedFrequency();
      if (frequency > 0) {
        frequencyValue.textContent = `${frequency.toFixed(1)} Hz`;
      } else {
        frequencyValue.textContent = '--- Hz';
      }
      
      // Update gain display
      const gain = oscilloscope.getCurrentGain();
      gainValue.textContent = `${gain.toFixed(2)}x`;
    }, 100); // Update every 100ms (10 Hz)
  }
}

function stopFrequencyDisplay(): void {
  if (frequencyUpdateInterval !== null) {
    clearInterval(frequencyUpdateInterval);
    frequencyUpdateInterval = null;
    frequencyValue.textContent = '--- Hz';
    gainValue.textContent = '---x';
  }
}

startButton.addEventListener('click', async () => {
  if (!oscilloscope.getIsRunning()) {
    try {
      startButton.disabled = true;
      statusElement.textContent = 'Requesting microphone access...';
      
      await oscilloscope.start();
      
      startButton.textContent = 'Stop';
      startButton.disabled = false;
      statusElement.textContent = 'Running - Microphone active';
      startFrequencyDisplay();
    } catch (error) {
      console.error('Failed to start oscilloscope:', error);
      statusElement.textContent = 'Error: Could not access microphone';
      startButton.disabled = false;
    }
  } else {
    try {
      stopFrequencyDisplay();
      await oscilloscope.stop();
      startButton.textContent = 'Start';
      statusElement.textContent = 'Stopped';
    } catch (error) {
      console.error('Failed to stop oscilloscope:', error);
      statusElement.textContent = 'Stopped (with errors)';
      startButton.textContent = 'Start';
    }
  }
});
