import { describe, it, expect, beforeEach } from 'vitest';
import { WaveformDataProcessor } from '../WaveformDataProcessor';
import { AudioManager } from '../AudioManager';
import { GainController } from '../GainController';
import { FrequencyEstimator } from '../FrequencyEstimator';
import { ZeroCrossDetector } from '../ZeroCrossDetector';
import { WaveformSearcher } from '../WaveformSearcher';

/**
 * WaveformDataProcessor Tests
 * 
 * Note: WaveformDataProcessor uses Rust WASM for all data processing.
 * Tests that require WASM functionality are skipped in the test environment
 * since WASM cannot be loaded (requires browser environment with script loading).
 * 
 * The WASM module itself is tested with wasm-bindgen-test in the Rust code.
 * These tests focus on TypeScript integration and configuration.
 */

describe('WaveformDataProcessor', () => {
  let processor: WaveformDataProcessor;
  let audioManager: AudioManager;
  let gainController: GainController;
  let frequencyEstimator: FrequencyEstimator;
  let zeroCrossDetector: ZeroCrossDetector;
  let waveformSearcher: WaveformSearcher;

  beforeEach(() => {
    audioManager = new AudioManager();
    gainController = new GainController();
    frequencyEstimator = new FrequencyEstimator();
    zeroCrossDetector = new ZeroCrossDetector();
    waveformSearcher = new WaveformSearcher();

    processor = new WaveformDataProcessor(
      audioManager,
      gainController,
      frequencyEstimator,
      zeroCrossDetector,
      waveformSearcher
    );
  });

  describe('initialization', () => {
    it('should create processor with all required dependencies', () => {
      expect(processor).toBeDefined();
      expect(processor).toBeInstanceOf(WaveformDataProcessor);
    });
  });

  describe('processFrame (without WASM initialization)', () => {
    it('should return null when WASM is not initialized', () => {
      // WASM cannot be initialized in test environment, so processFrame returns null
      const result = processor.processFrame(false);
      expect(result).toBeNull();
    });
  });

  describe('reset', () => {
    it('should have reset method', () => {
      // Should not throw even without WASM initialization
      expect(() => processor.reset()).not.toThrow();
    });
  });
});
