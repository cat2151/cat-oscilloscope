import { describe, it, expect } from 'vitest';
import { FrequencyEstimator } from '../FrequencyEstimator';
import { GainController } from '../GainController';
import { ZeroCrossDetector } from '../ZeroCrossDetector';
import { WaveformSearcher } from '../WaveformSearcher';
import { dbToAmplitude } from '../utils';

/**
 * Configuration and API tests
 * 
 * Note: Algorithm implementation tests have been removed since all algorithms
 * are now implemented in Rust WASM (wasm-processor module). The Rust implementation
 * has its own test suite using wasm-bindgen-test.
 * 
 * These tests focus on configuration management and API surface.
 */

describe('Configuration and API Tests', () => {
  describe('FrequencyEstimator Configuration', () => {
    let estimator: FrequencyEstimator;

    beforeEach(() => {
      estimator = new FrequencyEstimator();
    });

    it('should define valid frequency range constants', () => {
      expect(estimator.getMinFrequency()).toBe(20);
      expect(estimator.getMaxFrequency()).toBe(5000);
    });

    it('should allow switching between all frequency estimation methods', () => {
      const methods: ('zero-crossing' | 'autocorrelation' | 'fft' | 'stft' | 'cqt')[] = [
        'zero-crossing',
        'autocorrelation',
        'fft',
        'stft',
        'cqt'
      ];

      methods.forEach(method => {
        estimator.setFrequencyEstimationMethod(method);
        expect(estimator.getFrequencyEstimationMethod()).toBe(method);
      });
    });

    it('should have fft as default', () => {
      expect(estimator.getFrequencyEstimationMethod()).toBe('fft');
    });

    it('should allow setting buffer size multiplier to 1x, 4x, and 16x', () => {
      const multipliers: (1 | 4 | 16)[] = [1, 4, 16];
      
      multipliers.forEach(mult => {
        estimator.setBufferSizeMultiplier(mult);
        expect(estimator.getBufferSizeMultiplier()).toBe(mult);
      });
    });

    it('should have 16x as default buffer size multiplier', () => {
      expect(estimator.getBufferSizeMultiplier()).toBe(16);
    });

    it('should clear frequency history', () => {
      estimator.clearHistory();
      expect(estimator.getEstimatedFrequency()).toBe(0);
      expect(estimator.getFrequencyPlotHistory()).toEqual([]);
    });

    it('should return empty frequency plot history initially', () => {
      expect(estimator.getFrequencyPlotHistory()).toEqual([]);
    });
  });

  describe('GainController Configuration', () => {
    let controller: GainController;

    beforeEach(() => {
      controller = new GainController();
    });

    it('should toggle auto gain on and off', () => {
      controller.setAutoGain(false);
      expect(controller.getAutoGainEnabled()).toBe(false);
      
      controller.setAutoGain(true);
      expect(controller.getAutoGainEnabled()).toBe(true);
    });

    it('should have auto gain enabled by default', () => {
      expect(controller.getAutoGainEnabled()).toBe(true);
    });

    it('should toggle noise gate on and off', () => {
      controller.setNoiseGate(false);
      expect(controller.getNoiseGateEnabled()).toBe(false);
      
      controller.setNoiseGate(true);
      expect(controller.getNoiseGateEnabled()).toBe(true);
    });

    it('should have noise gate enabled by default', () => {
      expect(controller.getNoiseGateEnabled()).toBe(true);
    });

    it('should set noise gate threshold', () => {
      const threshold = dbToAmplitude(-48);
      controller.setNoiseGateThreshold(threshold);
      expect(controller.getNoiseGateThreshold()).toBe(threshold);
    });

    it('should clamp threshold at boundaries', () => {
      controller.setNoiseGateThreshold(-0.1);
      expect(controller.getNoiseGateThreshold()).toBe(0);
      
      controller.setNoiseGateThreshold(1.5);
      expect(controller.getNoiseGateThreshold()).toBe(1);
    });

    it('should return current gain', () => {
      // Default gain should be 1.0
      expect(controller.getCurrentGain()).toBe(1.0);
    });
  });

  describe('ZeroCrossDetector Configuration', () => {
    let detector: ZeroCrossDetector;

    beforeEach(() => {
      detector = new ZeroCrossDetector();
    });

    it('should toggle peak mode on and off', () => {
      detector.setUsePeakMode(true);
      expect(detector.getUsePeakMode()).toBe(true);
      
      detector.setUsePeakMode(false);
      expect(detector.getUsePeakMode()).toBe(false);
    });

    it('should have peak mode disabled by default', () => {
      expect(detector.getUsePeakMode()).toBe(false);
    });

    it('should have reset method for API compatibility', () => {
      // Should not throw
      expect(() => detector.reset()).not.toThrow();
    });
  });

  describe('WaveformSearcher Configuration', () => {
    let searcher: WaveformSearcher;

    beforeEach(() => {
      searcher = new WaveformSearcher();
    });

    it('should have no previous waveform initially', () => {
      expect(searcher.hasPreviousWaveform()).toBe(false);
      expect(searcher.getPreviousWaveform()).toBeNull();
    });

    it('should have zero similarity initially', () => {
      expect(searcher.getLastSimilarity()).toBe(0);
    });

    it('should reset state', () => {
      searcher.reset();
      expect(searcher.hasPreviousWaveform()).toBe(false);
      expect(searcher.getLastSimilarity()).toBe(0);
    });
  });
});
