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
// displayLength defaults to 4000 (= 4 cycles of 1000 samples each)
// So 1% of one cycle = 10 samples = 0.25% of display window
function makeRenderData(overrides: Partial<WaveformRenderData> = {}): WaveformRenderData {
  return {
    waveformData: new Float32Array(8000),
    displayStartIndex: 0,
    displayEndIndex: 4000,
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

    // Display = 4000 samples = 4 cycles of 1000 samples
    // 1% of one cycle = 10 samples = 0.25% of display window

    it('should not clamp on the first frame (no previous data)', () => {
      const data = makeRenderData({ phaseZeroIndex: 2000, phaseTwoPiIndex: 3000 });
      callClamp(processor, data);
      expect(data.phaseZeroIndex).toBe(2000);
      expect(data.phaseTwoPiIndex).toBe(3000);
    });

    it('should not clamp when change is within 1% of one cycle', () => {
      // Frame 1: index 2000 (50% of display)
      const data1 = makeRenderData({ phaseZeroIndex: 2000 });
      callClamp(processor, data1);

      // Frame 2: move by 5 samples (0.5% of one cycle) - within 1%
      const data2 = makeRenderData({ phaseZeroIndex: 2005 });
      callClamp(processor, data2);
      expect(data2.phaseZeroIndex).toBe(2005);
    });

    it('should clamp when change exceeds 1% of one cycle', () => {
      // Frame 1: index 2000 (50% of display)
      const data1 = makeRenderData({ phaseZeroIndex: 2000 });
      callClamp(processor, data1);

      // Frame 2: try to jump by 100 samples (10% of one cycle) - exceeds 1%
      const data2 = makeRenderData({ phaseZeroIndex: 2100 });
      callClamp(processor, data2);
      // Should be clamped to ~0.25% of 4000 ≈ 10 samples forward
      // Due to floor rounding for safety: may be 2009 or 2010
      expect(data2.phaseZeroIndex!).toBeGreaterThanOrEqual(2009);
      expect(data2.phaseZeroIndex!).toBeLessThanOrEqual(2010);
      // Verify movement ≤ 1% of one cycle (10 samples)
      expect(data2.phaseZeroIndex! - 2000).toBeLessThanOrEqual(10);
    });

    it('should clamp negative jumps to -1% of one cycle', () => {
      // Frame 1: index 2000
      const data1 = makeRenderData({ phaseZeroIndex: 2000 });
      callClamp(processor, data1);

      // Frame 2: try to jump backward by 100 samples
      const data2 = makeRenderData({ phaseZeroIndex: 1900 });
      callClamp(processor, data2);
      // Should be clamped: 10 samples backward → index 1990
      expect(data2.phaseZeroIndex).toBe(1990);
    });

    it('should clamp markers and derive phaseTwoPiIndex from phaseZeroIndex', () => {
      // Frame 1: establish baselines
      const data1 = makeRenderData({
        phaseZeroIndex: 800,
        phaseTwoPiIndex: 1600,
        phaseMinusQuarterPiIndex: 600,
        phaseTwoPiPlusQuarterPiIndex: 1800,
      });
      callClamp(processor, data1);

      // Frame 2: all try to jump by large amounts (>1% of one cycle = >10 samples)
      const data2 = makeRenderData({
        phaseZeroIndex: 1000,   // +200 samples
        phaseTwoPiIndex: 1800,  // +200 samples
        phaseMinusQuarterPiIndex: 400,   // -200 samples
        phaseTwoPiPlusQuarterPiIndex: 2000, // +200 samples
      });
      callClamp(processor, data2);

      // phaseZeroIndex is clamped to 1% of one cycle, and phaseTwoPiIndex follows exactly one cycle after it
      expect(data2.phaseZeroIndex).toBe(810);
      expect(data2.phaseTwoPiIndex).toBe(1810);
      // Other markers remain independently clamped
      expect(data2.phaseMinusQuarterPiIndex).toBe(590);
      expect(data2.phaseTwoPiPlusQuarterPiIndex).toBe(1810);
    });

    it('should gradually converge to target over multiple frames', () => {
      // Frame 1: start at index 2000
      const data1 = makeRenderData({ phaseZeroIndex: 2000 });
      callClamp(processor, data1);

      // Frames 2-4: target stays at 2100, should converge ~10 samples/frame
      let prevIndex = 2000;
      for (let i = 0; i < 3; i++) {
        const data = makeRenderData({ phaseZeroIndex: 2100 });
        callClamp(processor, data);
        // Each frame moves forward by ≤10 samples (1% of one cycle)
        expect(data.phaseZeroIndex!).toBeGreaterThan(prevIndex);
        expect(data.phaseZeroIndex! - prevIndex).toBeLessThanOrEqual(10);
        prevIndex = data.phaseZeroIndex!;
      }
    });

    it('should handle undefined markers gracefully', () => {
      const data1 = makeRenderData({ phaseZeroIndex: 2000, phaseTwoPiIndex: undefined });
      callClamp(processor, data1);
      expect(data1.phaseZeroIndex).toBe(2000);
      // Even if phaseTwoPiIndex is missing, it should derive from phaseZeroIndex (+1 cycle)
      expect(data1.phaseTwoPiIndex).toBe(3000);
    });

    it('should reset clamping state on reset()', () => {
      // Frame 1: establish baseline
      const data1 = makeRenderData({ phaseZeroIndex: 2000 });
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

    it('should use floor/ceil rounding to never exceed 1% of one cycle bound', () => {
      // Use displayLength=3000 (4 cycles of 750 each). 1% of 750 = 7.5 samples
      // 0.25% of 3000 = 7.5 samples → floor for forward
      const data1 = makeRenderData({
        displayStartIndex: 0,
        displayEndIndex: 3000,
        phaseZeroIndex: 1500, // 50% of display
      });
      callClamp(processor, data1);

      const data2 = makeRenderData({
        displayStartIndex: 0,
        displayEndIndex: 3000,
        phaseZeroIndex: 2000, // large forward jump
      });
      callClamp(processor, data2);
      // 0.25% of 3000 = 7.5 → 1500 + 7.5 = 1507.5 → floor = 1507
      expect(data2.phaseZeroIndex).toBe(1507);
      // Verify actual movement ≤ 1% of one cycle (7.5 samples)
      expect(data2.phaseZeroIndex! - 1500).toBeLessThanOrEqual(7.5);
    });

    it('should use ceil rounding for negative direction to stay within -1% of one cycle', () => {
      // displayLength=3000, 1% of one cycle = 7.5 samples
      const data1 = makeRenderData({
        displayStartIndex: 0,
        displayEndIndex: 3000,
        phaseZeroIndex: 1500, // 50% of display
      });
      callClamp(processor, data1);

      const data2 = makeRenderData({
        displayStartIndex: 0,
        displayEndIndex: 3000,
        phaseZeroIndex: 1000, // large backward jump
      });
      callClamp(processor, data2);
      // 0.25% of 3000 = 7.5 → 1500 - 7.5 = 1492.5 → ceil = 1493
      expect(data2.phaseZeroIndex).toBe(1493);
      // Verify actual movement ≤ 1% of one cycle (7.5 samples)
      expect(1500 - data2.phaseZeroIndex!).toBeLessThanOrEqual(7.5);
    });
  });
});
