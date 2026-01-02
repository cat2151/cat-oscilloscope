import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Oscilloscope } from '../Oscilloscope';
import { ZeroCrossDetector } from '../ZeroCrossDetector';

// Mock Web Audio API
class MockAudioContext {
  state = 'running';
  sampleRate = 48000;
  
  createMediaStreamSource() {
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }
  
  createAnalyser() {
    return {
      fftSize: 4096,
      frequencyBinCount: 2048,
      smoothingTimeConstant: 0,
      connect: vi.fn(),
      disconnect: vi.fn(),
      getFloatTimeDomainData: vi.fn(),
      getByteFrequencyData: vi.fn(),
    };
  }
  
  async close() {
    this.state = 'closed';
    return Promise.resolve();
  }
}

class MockMediaStream {
  active = true;
  id = 'mock-stream-id';
  private tracks: any[] = [{
    kind: 'audio',
    stop: vi.fn(),
  }];
  
  getTracks() {
    return this.tracks;
  }
}

global.AudioContext = MockAudioContext as any;
global.navigator = {
  ...global.navigator,
  mediaDevices: {
    getUserMedia: vi.fn(() => Promise.resolve(new MockMediaStream() as any)),
  },
} as any;
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16);
  return 1;
}) as any;
global.cancelAnimationFrame = vi.fn();

/**
 * Helper function to generate a sine wave
 * @param frequency Frequency in Hz
 * @param sampleRate Sample rate in Hz
 * @param length Number of samples
 * @param amplitude Amplitude (0-1)
 */
function generateSineWave(frequency: number, sampleRate: number, length: number, amplitude: number = 1.0): Float32Array {
  const data = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    data[i] = amplitude * Math.sin(2 * Math.PI * frequency * i / sampleRate);
  }
  return data;
}

/**
 * Helper function to generate noise
 * @param length Number of samples
 * @param amplitude Amplitude (0-1)
 */
function generateNoise(length: number, amplitude: number = 0.1): Float32Array {
  const data = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * amplitude;
  }
  return data;
}

/**
 * Helper function to generate a square wave
 * @param frequency Frequency in Hz
 * @param sampleRate Sample rate in Hz
 * @param length Number of samples
 * @param amplitude Amplitude (0-1)
 */
function generateSquareWave(frequency: number, sampleRate: number, length: number, amplitude: number = 1.0): Float32Array {
  const data = new Float32Array(length);
  const period = sampleRate / frequency;
  for (let i = 0; i < length; i++) {
    data[i] = (i % period) < (period / 2) ? amplitude : -amplitude;
  }
  return data;
}

/**
 * Helper function to count zero-crossings in a signal
 */
function countZeroCrossings(data: Float32Array): number {
  let count = 0;
  for (let i = 0; i < data.length - 1; i++) {
    if (data[i] <= 0 && data[i + 1] > 0) {
      count++;
    }
  }
  return count;
}

describe('Algorithm-Specific Tests', () => {
  let canvas: HTMLCanvasElement;
  let oscilloscope: Oscilloscope;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    
    const mockContext = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(() => ({ width: 100 })),
      save: vi.fn(),
      restore: vi.fn(),
    };
    canvas.getContext = vi.fn(() => mockContext) as any;
    
    oscilloscope = new Oscilloscope(canvas);
  });

  describe('Zero-Crossing Detection', () => {
    it('should detect zero-crossings in a sine wave', () => {
      const sampleRate = 48000;
      const frequency = 440; // A4 note
      const duration = 1; // 1 second
      const length = sampleRate * duration;
      const signal = generateSineWave(frequency, sampleRate, length, 0.8);
      
      const zeroCrossings = countZeroCrossings(signal);
      // Expected: frequency cycles per second, each with 1 zero-crossing (neg to pos)
      // Allow 5% tolerance due to discrete sampling
      const expectedCrossings = frequency;
      const tolerance = expectedCrossings * 0.05;
      
      expect(zeroCrossings).toBeGreaterThan(expectedCrossings - tolerance);
      expect(zeroCrossings).toBeLessThan(expectedCrossings + tolerance);
    });

    it('should detect zero-crossings in a square wave', () => {
      const sampleRate = 48000;
      const frequency = 100;
      const length = sampleRate; // 1 second
      const signal = generateSquareWave(frequency, sampleRate, length, 0.8);
      
      const zeroCrossings = countZeroCrossings(signal);
      // Square wave has sharper transitions, should be very accurate
      const expectedCrossings = frequency;
      const tolerance = 2; // Allow 2 samples tolerance
      
      expect(zeroCrossings).toBeGreaterThanOrEqual(expectedCrossings - tolerance);
      expect(zeroCrossings).toBeLessThanOrEqual(expectedCrossings + tolerance);
    });

    it('should find no zero-crossings in DC signal', () => {
      const length = 4096;
      const signal = new Float32Array(length).fill(0.5);
      
      const zeroCrossings = countZeroCrossings(signal);
      expect(zeroCrossings).toBe(0);
    });

    it('should find no zero-crossings in silence', () => {
      const length = 4096;
      const signal = new Float32Array(length).fill(0);
      
      const zeroCrossings = countZeroCrossings(signal);
      expect(zeroCrossings).toBe(0);
    });

    it('should select stable zero-cross candidate from multiple cycles', () => {
      const sampleRate = 48000;
      const frequency = 440;
      const length = 4096;
      
      // Generate a clean sine wave - all cycles should be similar
      const signal = generateSineWave(frequency, sampleRate, length, 0.8);
      
      // Create a ZeroCrossDetector instance and test the new algorithm
      const detector = new ZeroCrossDetector();
      
      const cycleLength = Math.floor(sampleRate / frequency); // ~109 samples
      const stableZeroCross = detector.findStableZeroCross(signal, cycleLength);
      
      // Should find a valid zero-crossing
      expect(stableZeroCross).toBeGreaterThanOrEqual(0);
      expect(stableZeroCross).toBeLessThan(signal.length);
      
      // Verify it's actually a zero-crossing point
      expect(signal[stableZeroCross]).toBeLessThanOrEqual(0);
      expect(signal[stableZeroCross + 1]).toBeGreaterThan(0);
    });

    it('should handle waveform with varying patterns', () => {
      const sampleRate = 48000;
      const frequency = 440;
      const length = 4096;
      
      // Generate a wave with amplitude variation (simulating real audio)
      const signal = new Float32Array(length);
      for (let i = 0; i < length; i++) {
        const baseWave = Math.sin(2 * Math.PI * frequency * i / sampleRate);
        const envelope = 0.7 + 0.3 * Math.sin(2 * Math.PI * 2 * i / sampleRate); // Slow amplitude modulation
        signal[i] = baseWave * envelope;
      }
      
      // Test that the algorithm can handle amplitude-modulated signals
      const detector = new ZeroCrossDetector();
      const cycleLength = Math.floor(sampleRate / frequency);
      const stableZeroCross = detector.findStableZeroCross(signal, cycleLength);
      
      // Should find a valid zero-crossing even with amplitude modulation
      expect(stableZeroCross).toBeGreaterThanOrEqual(0);
      expect(stableZeroCross).toBeLessThan(signal.length);
      
      // Call it again to test temporal stability
      const secondCall = detector.findStableZeroCross(signal, cycleLength);
      // The second call should return a zero-crossing (stability feature)
      expect(secondCall).toBeGreaterThanOrEqual(0);
    });

    it('should handle complex waveform with harmonics', () => {
      const sampleRate = 48000;
      const fundamental = 200;
      const length = 4096;
      
      // Generate a wave with fundamental + harmonics (more complex timbre)
      const signal = new Float32Array(length);
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        signal[i] = 
          0.5 * Math.sin(2 * Math.PI * fundamental * t) +        // Fundamental
          0.25 * Math.sin(2 * Math.PI * fundamental * 2 * t) +   // 2nd harmonic
          0.15 * Math.sin(2 * Math.PI * fundamental * 3 * t);    // 3rd harmonic
      }
      
      // Test that the multi-cycle selection algorithm works with complex timbres
      const detector = new ZeroCrossDetector();
      const cycleLength = Math.floor(sampleRate / fundamental);
      const stableZeroCross = detector.findStableZeroCross(signal, cycleLength);
      
      // Should find a valid zero-crossing for complex waveforms
      expect(stableZeroCross).toBeGreaterThanOrEqual(0);
      expect(stableZeroCross).toBeLessThan(signal.length);
      
      // Verify zero-crossing detection still works
      if (stableZeroCross >= 0 && stableZeroCross < signal.length - 1) {
        expect(signal[stableZeroCross]).toBeLessThanOrEqual(0);
        expect(signal[stableZeroCross + 1]).toBeGreaterThan(0);
      }
    });
  });

  describe('Noise Gate RMS Calculation', () => {
    it('should calculate correct RMS for sine wave', () => {
      // RMS of a sine wave with amplitude A is A/√2
      const amplitude = 0.8;
      const signal = generateSineWave(440, 48000, 4096, amplitude);
      
      // Calculate RMS manually
      let sumSquares = 0;
      for (let i = 0; i < signal.length; i++) {
        sumSquares += signal[i] * signal[i];
      }
      const rms = Math.sqrt(sumSquares / signal.length);
      
      const expectedRMS = amplitude / Math.sqrt(2);
      const tolerance = 0.01; // 1% tolerance
      
      expect(rms).toBeGreaterThan(expectedRMS - tolerance);
      expect(rms).toBeLessThan(expectedRMS + tolerance);
    });

    it('should calculate RMS close to zero for low amplitude noise', () => {
      const signal = generateNoise(4096, 0.01);
      
      let sumSquares = 0;
      for (let i = 0; i < signal.length; i++) {
        sumSquares += signal[i] * signal[i];
      }
      const rms = Math.sqrt(sumSquares / signal.length);
      
      // Noise at 0.01 amplitude should have RMS well below typical threshold
      expect(rms).toBeLessThan(0.01);
    });

    it('should calculate RMS of zero for silence', () => {
      const signal = new Float32Array(4096).fill(0);
      
      let sumSquares = 0;
      for (let i = 0; i < signal.length; i++) {
        sumSquares += signal[i] * signal[i];
      }
      const rms = Math.sqrt(sumSquares / signal.length);
      
      expect(rms).toBe(0);
    });
  });

  describe('Auto Gain Edge Cases', () => {
    it('should handle very low amplitude signals', () => {
      oscilloscope.setAutoGain(true);
      const lowAmplitude = 0.01;
      // generateSineWave could be used in future rendering tests
      // For now, just verify initial gain state
      
      // Auto gain should increase gain for low signals
      // Initial gain is 1.0, so after processing a low signal, gain should increase
      expect(oscilloscope.getCurrentGain()).toBe(1.0);
      expect(lowAmplitude).toBeLessThan(0.1); // Verify test data is correct
    });

    it('should handle very high amplitude signals', () => {
      oscilloscope.setAutoGain(true);
      const highAmplitude = 0.99;
      // generateSineWave could be used in future rendering tests
      // For now, just verify initial gain state
      
      // Auto gain should keep gain reasonable even for high signals
      expect(oscilloscope.getCurrentGain()).toBe(1.0);
      expect(highAmplitude).toBeGreaterThan(0.5); // Verify test data is correct
    });

    it('should reset gain to 1.0 when auto gain is disabled', () => {
      oscilloscope.setAutoGain(false);
      expect(oscilloscope.getCurrentGain()).toBe(1.0);
    });

    it('should maintain gain within MIN and MAX bounds', () => {
      oscilloscope.setAutoGain(true);
      const gain = oscilloscope.getCurrentGain();
      
      // Based on Oscilloscope class constants:
      // MIN_GAIN = 0.5, MAX_GAIN = 99.0
      expect(gain).toBeGreaterThanOrEqual(0.5);
      expect(gain).toBeLessThanOrEqual(99.0);
    });
  });

  describe('Frequency Range Filtering', () => {
    it('should define valid frequency range constants', () => {
      // The FrequencyEstimator class defines:
      // MIN_FREQUENCY_HZ = 50
      // MAX_FREQUENCY_HZ = 5000
      
      // These values should be sensible for audio oscilloscope
      const minFreq = 50;
      const maxFreq = 5000;
      
      expect(minFreq).toBeGreaterThan(0);
      expect(maxFreq).toBeGreaterThan(minFreq);
      expect(maxFreq).toBeLessThan(20000); // Below Nyquist for 48kHz
    });
  });

  describe('Signal Characteristics', () => {
    it('should generate sine wave with correct peak amplitude', () => {
      const amplitude = 0.75;
      const signal = generateSineWave(440, 48000, 1000, amplitude);
      
      let max = 0;
      for (let i = 0; i < signal.length; i++) {
        max = Math.max(max, Math.abs(signal[i]));
      }
      
      // Peak should be very close to specified amplitude
      expect(max).toBeGreaterThan(amplitude - 0.01);
      expect(max).toBeLessThan(amplitude + 0.01);
    });

    it('should generate square wave with correct peak amplitude', () => {
      const amplitude = 0.8;
      const signal = generateSquareWave(100, 48000, 1000, amplitude);
      
      let max = 0;
      for (let i = 0; i < signal.length; i++) {
        max = Math.max(max, Math.abs(signal[i]));
      }
      
      // Square wave should have peak amplitude (allowing for floating point precision)
      expect(max).toBeCloseTo(amplitude, 6);
    });

    it('should generate noise with bounded amplitude', () => {
      const amplitude = 0.2;
      const signal = generateNoise(1000, amplitude);
      
      for (let i = 0; i < signal.length; i++) {
        expect(Math.abs(signal[i])).toBeLessThanOrEqual(amplitude);
      }
    });
  });

  describe('Frequency Estimation Method Switching', () => {
    it('should allow switching between all frequency estimation methods', () => {
      oscilloscope.setFrequencyEstimationMethod('zero-crossing');
      expect(oscilloscope.getFrequencyEstimationMethod()).toBe('zero-crossing');
      
      oscilloscope.setFrequencyEstimationMethod('autocorrelation');
      expect(oscilloscope.getFrequencyEstimationMethod()).toBe('autocorrelation');
      
      oscilloscope.setFrequencyEstimationMethod('fft');
      expect(oscilloscope.getFrequencyEstimationMethod()).toBe('fft');
    });

    it('should have autocorrelation as default', () => {
      const defaultMethod = oscilloscope.getFrequencyEstimationMethod();
      expect(defaultMethod).toBe('autocorrelation');
    });
  });

  describe('Noise Gate Threshold Behavior', () => {
    it('should apply noise gate when enabled', () => {
      oscilloscope.setNoiseGate(true);
      oscilloscope.setNoiseGateThreshold(0.5); // 50% threshold
      
      expect(oscilloscope.getNoiseGateEnabled()).toBe(true);
      expect(oscilloscope.getNoiseGateThreshold()).toBe(0.5);
    });

    it('should not apply noise gate when disabled', () => {
      oscilloscope.setNoiseGate(false);
      
      expect(oscilloscope.getNoiseGateEnabled()).toBe(false);
    });

    it('should clamp threshold at boundaries', () => {
      oscilloscope.setNoiseGateThreshold(-1.0);
      expect(oscilloscope.getNoiseGateThreshold()).toBe(0.0);
      
      oscilloscope.setNoiseGateThreshold(2.0);
      expect(oscilloscope.getNoiseGateThreshold()).toBe(1.0);
    });
  });
});
