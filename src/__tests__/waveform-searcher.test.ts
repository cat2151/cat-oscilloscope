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
      // Store a pattern
      const pattern = new Float32Array([0.1, 0.5, 0.9, 0.5, 0.1]);
      searcher.storeWaveform(pattern, 0, 5);

      // Current frame starts with the same pattern
      const currentFrame = new Float32Array([0.1, 0.5, 0.9, 0.5, 0.1, 0.0, 0.0, 0.0]);
      const result = searcher.searchSimilarWaveform(currentFrame, 5);

      expect(result).not.toBeNull();
      expect(result?.startIndex).toBe(0);
      expect(result?.similarity).toBeCloseTo(1.0, 2);
    });

    it('should find exact match at offset position', () => {
      // Store a pattern
      const pattern = new Float32Array([0.5, 0.9, 0.5]);
      searcher.storeWaveform(pattern, 0, 3);

      // Current frame has the pattern at offset 2
      const currentFrame = new Float32Array([0.0, 0.0, 0.5, 0.9, 0.5, 0.0]);
      const result = searcher.searchSimilarWaveform(currentFrame, 3);

      expect(result).not.toBeNull();
      expect(result?.startIndex).toBe(2);
      expect(result?.similarity).toBeCloseTo(1.0, 2);
    });

    it('should find best match among multiple candidates', () => {
      // Store a specific pattern
      const pattern = new Float32Array([0.0, 0.5, 1.0, 0.5, 0.0]);
      searcher.storeWaveform(pattern, 0, 5);

      // Current frame has better match at position 3
      const currentFrame = new Float32Array([
        0.0, 0.1, 0.2, // weak match at 0
        0.0, 0.5, 1.0, 0.5, 0.0, // exact match at 3
        0.0, 0.0
      ]);
      const result = searcher.searchSimilarWaveform(currentFrame, 5);

      expect(result).not.toBeNull();
      expect(result?.startIndex).toBe(3);
      expect(result?.similarity).toBeGreaterThan(0.9);
    });

    it('should handle inverted waveform (negative correlation)', () => {
      // Store a pattern
      const pattern = new Float32Array([1.0, 0.5, 0.0, -0.5, -1.0]);
      searcher.storeWaveform(pattern, 0, 5);

      // Current frame has inverted pattern at start (only one clear candidate)
      const currentFrame = new Float32Array([-1.0, -0.5, 0.0, 0.5, 1.0]);
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
      // Store constant pattern
      const pattern = new Float32Array([0.5, 0.5, 0.5, 0.5]);
      searcher.storeWaveform(pattern, 0, 4);

      // Current frame also constant
      const currentFrame = new Float32Array([0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);
      const result = searcher.searchSimilarWaveform(currentFrame, 4);

      // Constant signals have undefined correlation (0 in our implementation)
      expect(result).not.toBeNull();
      expect(result?.similarity).toBe(0);
    });
  });

  describe('reset', () => {
    it('should clear stored waveform and similarity', () => {
      const data = new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5]);
      searcher.storeWaveform(data, 0, 5);
      
      const currentFrame = new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5, 0.0]);
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
    it('should search within one cycle length', () => {
      // Create a repeating pattern
      const pattern = new Float32Array([0.0, 1.0, 0.0, -1.0]);
      searcher.storeWaveform(pattern, 0, 4);

      // Current frame with pattern shifted by 2 samples
      const currentFrame = new Float32Array([
        0.5, 0.5,  // offset
        0.0, 1.0, 0.0, -1.0,  // exact match at index 2
        0.0, 0.0, 0.0, 0.0
      ]);
      
      const result = searcher.searchSimilarWaveform(currentFrame, 4);
      
      expect(result).not.toBeNull();
      expect(result?.startIndex).toBe(2);
      expect(result?.similarity).toBeGreaterThan(0.9);
    });
  });
});
