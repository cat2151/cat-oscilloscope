import { describe, it, expect, beforeEach } from 'vitest';
import { WaveformDataProcessor } from '../WaveformDataProcessor';
import { AudioManager } from '../AudioManager';
import { GainController } from '../GainController';
import { FrequencyEstimator } from '../FrequencyEstimator';
import { ZeroCrossDetector } from '../ZeroCrossDetector';
import { WaveformSearcher } from '../WaveformSearcher';
import { WaveformRenderData } from '../WaveformRenderData';

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

// Helper to create minimal render data for clamping tests
function makeRenderData(overrides: Partial<WaveformRenderData> = {}): WaveformRenderData {
  return {
    waveformData: new Float32Array(2000),
    displayStartIndex: 0,
    displayEndIndex: 1000,
    gain: 1,
    estimatedFrequency: 440,
    frequencyPlotHistory: [],
    sampleRate: 44100,
    fftSize: 2048,
    isSignalAboveNoiseGate: true,
    maxFrequency: 22050,
    previousWaveform: null,
    similarity: 0,
    similarityPlotHistory: [],
    usedSimilaritySearch: false,
    ...overrides,
  };
}

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

  describe('clampPhaseMarkers (issue #275)', () => {
    // Access private method via type assertion for testing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callClamp = (proc: any, data: WaveformRenderData) => proc.clampPhaseMarkers(data);

    it('should not clamp on the first frame (no previous data)', () => {
      const data = makeRenderData({ phaseZeroIndex: 500, phaseTwoPiIndex: 750 });
      callClamp(processor, data);
      expect(data.phaseZeroIndex).toBe(500);
      expect(data.phaseTwoPiIndex).toBe(750);
    });

    it('should not clamp when change is within 1%', () => {
      // Frame 1: establish baseline at 50% (index 500 of 1000)
      const data1 = makeRenderData({ phaseZeroIndex: 500 });
      callClamp(processor, data1);

      // Frame 2: move to 50.5% (index 505) - within 1%
      const data2 = makeRenderData({ phaseZeroIndex: 505 });
      callClamp(processor, data2);
      expect(data2.phaseZeroIndex).toBe(505);
    });

    it('should clamp when change exceeds 1%', () => {
      // Frame 1: establish baseline at 50% (index 500 of 1000)
      const data1 = makeRenderData({ phaseZeroIndex: 500 });
      callClamp(processor, data1);

      // Frame 2: try to jump to 60% (index 600) - exceeds 1%
      const data2 = makeRenderData({ phaseZeroIndex: 600 });
      callClamp(processor, data2);
      // Should be clamped to 51% = index 510
      expect(data2.phaseZeroIndex).toBe(510);
    });

    it('should clamp negative jumps to -1%', () => {
      // Frame 1: establish baseline at 50%
      const data1 = makeRenderData({ phaseZeroIndex: 500 });
      callClamp(processor, data1);

      // Frame 2: try to jump to 40% (index 400) - exceeds 1%
      const data2 = makeRenderData({ phaseZeroIndex: 400 });
      callClamp(processor, data2);
      // Should be clamped to 49% = index 490
      expect(data2.phaseZeroIndex).toBe(490);
    });

    it('should clamp all four markers independently', () => {
      // Frame 1: establish baselines
      const data1 = makeRenderData({
        phaseZeroIndex: 200,
        phaseTwoPiIndex: 400,
        phaseMinusQuarterPiIndex: 150,
        phaseTwoPiPlusQuarterPiIndex: 450,
      });
      callClamp(processor, data1);

      // Frame 2: all try to jump by >1%
      const data2 = makeRenderData({
        phaseZeroIndex: 350,  // 20% → 35% (+15%)
        phaseTwoPiIndex: 550, // 40% → 55% (+15%)
        phaseMinusQuarterPiIndex: 0,   // 15% → 0% (-15%)
        phaseTwoPiPlusQuarterPiIndex: 600, // 45% → 60% (+15%)
      });
      callClamp(processor, data2);

      // Each should be clamped to ±1% from previous
      expect(data2.phaseZeroIndex).toBe(210);     // 20% + 1% = 21%
      expect(data2.phaseTwoPiIndex).toBe(410);     // 40% + 1% = 41%
      expect(data2.phaseMinusQuarterPiIndex).toBe(140);  // 15% - 1% = 14%
      expect(data2.phaseTwoPiPlusQuarterPiIndex).toBe(460); // 45% + 1% = 46%
    });

    it('should gradually converge to target over multiple frames', () => {
      // Frame 1: start at 50%
      const data1 = makeRenderData({ phaseZeroIndex: 500 });
      callClamp(processor, data1);

      // Frames 2-4: target stays at 55%, but should converge 1% per frame
      for (let i = 0; i < 3; i++) {
        const data = makeRenderData({ phaseZeroIndex: 550 });
        callClamp(processor, data);
        // After frame i+2: should be at (51 + i)% = 510+i*10
        expect(data.phaseZeroIndex).toBe(510 + i * 10);
      }
    });

    it('should handle undefined markers gracefully', () => {
      const data1 = makeRenderData({ phaseZeroIndex: 500, phaseTwoPiIndex: undefined });
      callClamp(processor, data1);
      expect(data1.phaseZeroIndex).toBe(500);
      expect(data1.phaseTwoPiIndex).toBeUndefined();
    });

    it('should reset clamping state on reset()', () => {
      // Frame 1: establish baseline
      const data1 = makeRenderData({ phaseZeroIndex: 500 });
      callClamp(processor, data1);

      // Reset
      processor.reset();

      // Frame after reset: should not clamp (no previous state)
      const data2 = makeRenderData({ phaseZeroIndex: 100 });
      callClamp(processor, data2);
      expect(data2.phaseZeroIndex).toBe(100); // No clamping - fresh start
    });

    it('should skip clamping when displayLength is zero', () => {
      const data = makeRenderData({
        displayStartIndex: 100,
        displayEndIndex: 100,
        phaseZeroIndex: 100,
      });
      callClamp(processor, data);
      expect(data.phaseZeroIndex).toBe(100);
    });
  });
});
