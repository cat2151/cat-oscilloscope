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
  private noiseGateEnabled = false;
  private noiseGateThreshold = 0.01; // Default threshold (1% of max amplitude)
  private frequencyEstimationMethod: 'zero-crossing' | 'autocorrelation' | 'fft' = 'zero-crossing';
  private estimatedFrequency = 0;
  private readonly MIN_FREQUENCY_HZ = 50; // Minimum detectable frequency (Hz)
  private readonly MAX_FREQUENCY_HZ = 1000; // Maximum detectable frequency (Hz)
  private readonly FFT_MAGNITUDE_THRESHOLD = 10; // Minimum FFT magnitude to consider as valid signal

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
   * Estimate frequency based on selected method
   */
  private estimateFrequency(data: Float32Array): number {
    switch (this.frequencyEstimationMethod) {
      case 'zero-crossing':
        return this.estimateFrequencyZeroCrossing(data);
      case 'autocorrelation':
        return this.estimateFrequencyAutocorrelation(data);
      case 'fft':
        return this.estimateFrequencyFFT(data);
      default:
        return 0;
    }
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
    
    if (nextZeroCross === -1) {
      // Only one zero-cross found, display from there to end
      return {
        startIndex: estimationZeroCross,
        endIndex: data.length,
        firstZeroCross: estimationZeroCross,
      };
    }

    // Calculate cycle length and required padding
    const cycleLength = nextZeroCross - estimationZeroCross;
    const rawPhasePadding = Math.floor(cycleLength / 16); // π/8 of one cycle (2π / 16 = π/8)
    // Sanity check: don't allow padding to exceed half the buffer size
    const maxPhasePadding = Math.floor(data.length / 2);
    const phasePadding = Math.min(rawPhasePadding, maxPhasePadding);
    
    // Find a zero-cross point that has enough space before it for padding
    // Start searching from phasePadding + 1 to ensure we have room for -π/8 phase
    const searchStart = Math.min(phasePadding + 1, data.length - 1);
    let firstZeroCross = this.findZeroCross(data, searchStart);
    if (firstZeroCross === -1) {
      // Fallback: use estimation zero-cross if it has enough padding
      if (estimationZeroCross >= phasePadding) {
        firstZeroCross = estimationZeroCross;
      } else if (nextZeroCross >= phasePadding) {
        // If estimation doesn't have enough padding, try next zero-cross
        firstZeroCross = nextZeroCross;
      } else {
        // Last resort: use estimation and clamp startIndex to 0
        firstZeroCross = estimationZeroCross;
      }
    }
    
    const secondZeroCross = this.findNextZeroCross(data, firstZeroCross);
    if (secondZeroCross === -1) {
      // Only one suitable zero-cross found, display from there to end
      return {
        startIndex: Math.max(0, firstZeroCross - phasePadding),
        endIndex: data.length,
        firstZeroCross: firstZeroCross,
      };
    }

    // Display from phase -π/8 to phase 2π+π/8
    // Use Math.max to handle edge cases where firstZeroCross might still be < phasePadding
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

    // Apply decay to smooth out rapid changes
    // Use max so peaks can increase immediately but decay slowly
    peak = Math.max(peak, this.previousPeak * this.peakDecay);
    this.previousPeak = peak;

    // Calculate target gain (aim for TARGET_AMPLITUDE_RATIO of canvas height to avoid clipping)
    if (peak > this.minPeakThreshold) {
      this.targetGain = this.TARGET_AMPLITUDE_RATIO / peak;
      // Clamp gain to reasonable range
      this.targetGain = Math.min(Math.max(this.targetGain, this.MIN_GAIN), this.MAX_GAIN);
    }

    // Smooth gain adjustment (interpolate towards target)
    this.currentGain += (this.targetGain - this.currentGain) * this.GAIN_SMOOTHING_FACTOR;
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
  }

  getFrequencyEstimationMethod(): string {
    return this.frequencyEstimationMethod;
  }

  getEstimatedFrequency(): number {
    return this.estimatedFrequency;
  }
}

// Main application logic
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const startButton = document.getElementById('startButton') as HTMLButtonElement;
const autoGainCheckbox = document.getElementById('autoGainCheckbox') as HTMLInputElement;
const noiseGateCheckbox = document.getElementById('noiseGateCheckbox') as HTMLInputElement;
const noiseGateThreshold = document.getElementById('noiseGateThreshold') as HTMLInputElement;
const thresholdValue = document.getElementById('thresholdValue') as HTMLSpanElement;
const statusElement = document.getElementById('status') as HTMLSpanElement;
const frequencyMethod = document.getElementById('frequencyMethod') as HTMLSelectElement;
const frequencyValue = document.getElementById('frequencyValue') as HTMLSpanElement;

// Validate all required DOM elements
const requiredElements = [
  { element: canvas, name: 'canvas' },
  { element: startButton, name: 'startButton' },
  { element: autoGainCheckbox, name: 'autoGainCheckbox' },
  { element: noiseGateCheckbox, name: 'noiseGateCheckbox' },
  { element: noiseGateThreshold, name: 'noiseGateThreshold' },
  { element: thresholdValue, name: 'thresholdValue' },
  { element: statusElement, name: 'status' },
  { element: frequencyMethod, name: 'frequencyMethod' },
  { element: frequencyValue, name: 'frequencyValue' },
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

// Auto gain checkbox handler
autoGainCheckbox.addEventListener('change', () => {
  oscilloscope.setAutoGain(autoGainCheckbox.checked);
});

// Noise gate checkbox handler
noiseGateCheckbox.addEventListener('change', () => {
  oscilloscope.setNoiseGate(noiseGateCheckbox.checked);
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
    }, 100); // Update every 100ms (10 Hz)
  }
}

function stopFrequencyDisplay(): void {
  if (frequencyUpdateInterval !== null) {
    clearInterval(frequencyUpdateInterval);
    frequencyUpdateInterval = null;
    frequencyValue.textContent = '--- Hz';
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
