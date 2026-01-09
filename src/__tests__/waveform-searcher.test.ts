import { describe, it, expect, beforeEach } from 'vitest';
import { WaveformSearcher, CYCLES_TO_STORE, CYCLES_TO_SEARCH } from '../WaveformSearcher';

describe('WaveformSearcher', () => {
  let searcher: WaveformSearcher;

  beforeEach(() => {
    searcher = new WaveformSearcher();
  });

  describe('initial state', () => {
    it('should have no previous waveform initially', () => {
      expect(searcher.hasPreviousWaveform()).toBe(false);
      expect(searcher.getPreviousWaveform()).toBeNull();
    });

    it('should have zero similarity initially', () => {
      expect(searcher.getLastSimilarity()).toBe(0);
    });
  });

  describe('reset', () => {
    it('should clear stored waveform and similarity', () => {
      searcher.reset();
      expect(searcher.hasPreviousWaveform()).toBe(false);
      expect(searcher.getLastSimilarity()).toBe(0);
    });
  });

  describe('constants', () => {
    it('should export CYCLES_TO_STORE constant', () => {
      expect(CYCLES_TO_STORE).toBe(4);
    });

    it('should export CYCLES_TO_SEARCH constant', () => {
      expect(CYCLES_TO_SEARCH).toBe(4);
    });
  });
});
