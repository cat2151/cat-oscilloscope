import { describe, it, expect, beforeEach } from 'vitest';
import { WaveformSearcher } from '../WaveformSearcher';

describe('WaveformSearcher', () => {
  let searcher: WaveformSearcher;

  beforeEach(() => {
    searcher = new WaveformSearcher();
  });

  describe('initial state', () => {
    it('should have no previous waveform initially', () => {
      expect(searcher.hasPreviousWaveform()).toBe(false);
    });

    it('should have zero similarity initially', () => {
      expect(searcher.getLastSimilarity()).toBe(0);
    });
  });

  describe('storeWaveform', () => {
    it('should store a waveform segment', () => {
      const data = new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5]);
      searcher.storeWaveform(data, 1, 4);
      expect(searcher.hasPreviousWaveform()).toBe(true);
    });

    it('should not store invalid waveform (negative length)', () => {
      const data = new Float32Array([0.1, 0.2, 0.3]);
      searcher.storeWaveform(data, 2, 1);
      expect(searcher.hasPreviousWaveform()).toBe(false);
    });

    it('should not store invalid waveform (out of bounds)', () => {
      const data = new Float32Array([0.1, 0.2, 0.3]);
      searcher.storeWaveform(data, 0, 10);
      expect(searcher.hasPreviousWaveform()).toBe(false);
    });
  });

  describe('searchSimilarWaveform', () => {
    it('should return null when no previous waveform', () => {
      const currentFrame = new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5]);
      const result = searcher.searchSimilarWaveform(currentFrame, 2);
      expect(result).toBeNull();
    });

    it('should find exact match at start', () => {
      // Store a pattern (4 cycles worth, each cycle is 5 samples = 20 samples total)
      const singleCycle = [0.1, 0.5, 0.9, 0.5, 0.1];
      const pattern = new Float32Array([
        ...singleCycle, ...singleCycle, ...singleCycle, ...singleCycle
      ]); // 20 samples
      searcher.storeWaveform(pattern, 0, 20);

      // Current frame starts with the same pattern
      const currentFrame = new Float32Array([
        ...singleCycle, ...singleCycle, ...singleCycle, ...singleCycle,
        0.0, 0.0, 0.0, 0.0
      ]);
      const result = searcher.searchSimilarWaveform(currentFrame, 5); // cycleLength = 5

      expect(result).not.toBeNull();
      expect(result?.startIndex).toBe(0);
      expect(result?.similarity).toBeCloseTo(1.0, 2);
    });

    it('should find exact match at offset position', () => {
      // Store a pattern (4 cycles worth, each cycle is 3 samples = 12 samples total)
      const singleCycle = [0.5, 0.9, 0.5];
      const pattern = new Float32Array([
        ...singleCycle, ...singleCycle, ...singleCycle, ...singleCycle
      ]); // 12 samples
      searcher.storeWaveform(pattern, 0, 12);

      // Current frame has the pattern at offset 2
      const currentFrame = new Float32Array([
        0.0, 0.0, // offset
        ...singleCycle, ...singleCycle, ...singleCycle, ...singleCycle,
        0.0
      ]);
      const result = searcher.searchSimilarWaveform(currentFrame, 3); // cycleLength = 3

      expect(result).not.toBeNull();
      expect(result?.startIndex).toBe(2);
      expect(result?.similarity).toBeCloseTo(1.0, 2);
    });

    it('should find best match among multiple candidates', () => {
      // Store a specific pattern (4 cycles worth, each cycle is 5 samples = 20 samples total)
      const singleCycle = [0.0, 0.5, 1.0, 0.5, 0.0];
      const pattern = new Float32Array([
        ...singleCycle, ...singleCycle, ...singleCycle, ...singleCycle
      ]); // 20 samples
      searcher.storeWaveform(pattern, 0, 20);

      // Current frame has better match at position 3
      const currentFrame = new Float32Array([
        0.0, 0.1, 0.2, // weak match at 0
        ...singleCycle, ...singleCycle, ...singleCycle, ...singleCycle, // exact match at 3
        0.0, 0.0
      ]);
      const result = searcher.searchSimilarWaveform(currentFrame, 5);

      expect(result).not.toBeNull();
      expect(result?.startIndex).toBe(3);
      expect(result?.similarity).toBeGreaterThan(0.9);
    });

    it('should handle inverted waveform (negative correlation)', () => {
      // Store a pattern (4 cycles worth, each cycle is 5 samples = 20 samples total)
      const singleCycle = [1.0, 0.5, 0.0, -0.5, -1.0];
      const pattern = new Float32Array([
        ...singleCycle, ...singleCycle, ...singleCycle, ...singleCycle
      ]); // 20 samples
      searcher.storeWaveform(pattern, 0, 20);

      // Current frame has inverted pattern at start (only one clear candidate)
      const invertedCycle = [-1.0, -0.5, 0.0, 0.5, 1.0];
      const currentFrame = new Float32Array([
        ...invertedCycle, ...invertedCycle, ...invertedCycle, ...invertedCycle
      ]);
      const result = searcher.searchSimilarWaveform(currentFrame, 5);

      expect(result).not.toBeNull();
      expect(result?.similarity).toBeLessThan(0); // Negative correlation
      expect(result?.similarity).toBeCloseTo(-1.0, 1);
    });

    it('should return null when cycle length is invalid', () => {
      const pattern = new Float32Array([0.1, 0.2, 0.3]);
      searcher.storeWaveform(pattern, 0, 3);

      const currentFrame = new Float32Array([0.1, 0.2, 0.3, 0.4]);
      const result = searcher.searchSimilarWaveform(currentFrame, 0);
      expect(result).toBeNull();
    });

    it('should return null when current frame is too short', () => {
      const pattern = new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5]);
      searcher.storeWaveform(pattern, 0, 5);

      const currentFrame = new Float32Array([0.1, 0.2]);
      const result = searcher.searchSimilarWaveform(currentFrame, 5);
      expect(result).toBeNull();
    });

    it('should handle constant waveform', () => {
      // Store constant pattern (4 cycles worth, each cycle is 4 samples = 16 samples total)
      const singleCycle = [0.5, 0.5, 0.5, 0.5];
      const pattern = new Float32Array([
        ...singleCycle, ...singleCycle, ...singleCycle, ...singleCycle
      ]); // 16 samples
      searcher.storeWaveform(pattern, 0, 16);

      // Current frame also constant
      const currentFrame = new Float32Array([
        0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
        0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
        0.5, 0.5
      ]);
      const result = searcher.searchSimilarWaveform(currentFrame, 4);

      // Constant signals have undefined correlation (0 in our implementation)
      expect(result).not.toBeNull();
      expect(result?.similarity).toBe(0);
    });
  });

  describe('reset', () => {
    it('should clear stored waveform and similarity', () => {
      // Store pattern (4 cycles worth, each cycle is 5 samples = 20 samples total)
      const singleCycle = [0.1, 0.2, 0.3, 0.4, 0.5];
      const data = new Float32Array([
        ...singleCycle, ...singleCycle, ...singleCycle, ...singleCycle
      ]); // 20 samples
      searcher.storeWaveform(data, 0, 20);
      
      const currentFrame = new Float32Array([
        ...singleCycle, ...singleCycle, ...singleCycle, ...singleCycle,
        0.0
      ]);
      searcher.searchSimilarWaveform(currentFrame, 5);
      
      expect(searcher.hasPreviousWaveform()).toBe(true);
      expect(searcher.getLastSimilarity()).not.toBe(0);

      searcher.reset();

      expect(searcher.hasPreviousWaveform()).toBe(false);
      expect(searcher.getLastSimilarity()).toBe(0);
    });
  });

  describe('similarity score range', () => {
    it('should always return similarity between -1 and 1', () => {
      // Create various test patterns
      const patterns = [
        new Float32Array([0.0, 0.5, 1.0, 0.5, 0.0]),
        new Float32Array([1.0, -1.0, 1.0, -1.0]),
        new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5]),
      ];

      for (const pattern of patterns) {
        searcher.reset();
        searcher.storeWaveform(pattern, 0, pattern.length);
        
        const currentFrame = new Float32Array(pattern.length * 2);
        for (let i = 0; i < currentFrame.length; i++) {
          currentFrame[i] = Math.sin(i / 2);
        }
        
        const result = searcher.searchSimilarWaveform(currentFrame, pattern.length);
        
        if (result) {
          expect(result.similarity).toBeGreaterThanOrEqual(-1);
          expect(result.similarity).toBeLessThanOrEqual(1);
        }
      }
    });
  });

  describe('sliding window search', () => {
    it('should search within 4 cycles range', () => {
      // Create a repeating pattern (4 cycles worth, each cycle is 4 samples = 16 samples total)
      const singleCycle = [0.0, 1.0, 0.0, -1.0];
      const pattern = new Float32Array([
        ...singleCycle, ...singleCycle, ...singleCycle, ...singleCycle
      ]); // 16 samples
      searcher.storeWaveform(pattern, 0, 16);

      // Current frame with pattern shifted by 2 samples (within 4 cycles = 16 samples search range)
      const currentFrame = new Float32Array([
        0.5, 0.5,  // offset (2 samples)
        ...singleCycle, ...singleCycle, ...singleCycle, ...singleCycle,  // exact match at index 2
        0.0, 0.0, 0.0, 0.0
      ]);
      
      const result = searcher.searchSimilarWaveform(currentFrame, 4); // cycleLength = 4
      
      expect(result).not.toBeNull();
      expect(result?.startIndex).toBe(2);
      expect(result?.similarity).toBeGreaterThan(0.9);
    });
  });

  describe('4-cycle storage and search', () => {
    it('should store and search 4 cycles worth of data', () => {
      // Single cycle: sine-like pattern with 8 samples per cycle
      const singleCycle = [0.0, 0.707, 1.0, 0.707, 0.0, -0.707, -1.0, -0.707];
      
      // Store 4 cycles worth (32 samples)
      const fourCycles = new Float32Array([
        ...singleCycle, ...singleCycle, ...singleCycle, ...singleCycle
      ]);
      searcher.storeWaveform(fourCycles, 0, 32);
      
      expect(searcher.hasPreviousWaveform()).toBe(true);
      
      // Current frame with same pattern offset by 5 samples (within 4-cycle search range = 32 samples)
      const offset = 5;
      const currentFrame = new Float32Array(40);
      for (let i = 0; i < 32; i++) {
        currentFrame[i + offset] = fourCycles[i];
      }
      
      const result = searcher.searchSimilarWaveform(currentFrame, 8); // cycleLength = 8
      
      expect(result).not.toBeNull();
      expect(result?.startIndex).toBe(offset);
      expect(result?.similarity).toBeGreaterThan(0.99); // Should be very close to 1.0
    });

    it('should find pattern within extended 4-cycle search range', () => {
      // Test that search range is 4 cycles, not 1 cycle
      const singleCycle = [1.0, 0.5, 0.0, -0.5, -1.0];
      const fourCycles = new Float32Array([
        ...singleCycle, ...singleCycle, ...singleCycle, ...singleCycle
      ]); // 20 samples
      searcher.storeWaveform(fourCycles, 0, 20);
      
      // Pattern shifted by 15 samples (3 cycles), which is within 4-cycle search range
      const currentFrame = new Float32Array(40);
      for (let i = 0; i < 20; i++) {
        currentFrame[i + 15] = fourCycles[i];
      }
      
      const result = searcher.searchSimilarWaveform(currentFrame, 5); // cycleLength = 5
      
      expect(result).not.toBeNull();
      expect(result?.startIndex).toBe(15);
      expect(result?.similarity).toBeGreaterThan(0.99);
    });
  });
});
