import { describe, it, expect, beforeEach } from 'vitest';
import { ZeroCrossDetector, type AlignmentMode } from '../ZeroCrossDetector';

describe('ZeroCrossDetector - Alignment Mode', () => {
  let detector: ZeroCrossDetector;

  beforeEach(() => {
    detector = new ZeroCrossDetector();
  });

  describe('setAlignmentMode / getAlignmentMode', () => {
    it('should default to phase mode', () => {
      expect(detector.getAlignmentMode()).toBe('phase');
    });

    it('should set and get zero-cross mode', () => {
      detector.setAlignmentMode('zero-cross');
      expect(detector.getAlignmentMode()).toBe('zero-cross');
    });

    it('should set and get peak mode', () => {
      detector.setAlignmentMode('peak');
      expect(detector.getAlignmentMode()).toBe('peak');
    });

    it('should set and get phase mode', () => {
      detector.setAlignmentMode('phase');
      expect(detector.getAlignmentMode()).toBe('phase');
    });

    it('should support all three alignment modes', () => {
      const modes: AlignmentMode[] = ['zero-cross', 'peak', 'phase'];
      
      modes.forEach(mode => {
        detector.setAlignmentMode(mode);
        expect(detector.getAlignmentMode()).toBe(mode);
      });
    });
  });

  describe('setUsePeakMode / getUsePeakMode (legacy compatibility)', () => {
    it('should set peak mode when setUsePeakMode(true)', () => {
      detector.setUsePeakMode(true);
      expect(detector.getAlignmentMode()).toBe('peak');
      expect(detector.getUsePeakMode()).toBe(true);
    });

    it('should set zero-cross mode when setUsePeakMode(false)', () => {
      detector.setUsePeakMode(false);
      expect(detector.getAlignmentMode()).toBe('zero-cross');
      expect(detector.getUsePeakMode()).toBe(false);
    });

    it('should report peak mode correctly after setting via setAlignmentMode', () => {
      detector.setAlignmentMode('peak');
      expect(detector.getUsePeakMode()).toBe(true);
    });

    it('should report non-peak mode correctly when in phase mode', () => {
      detector.setAlignmentMode('phase');
      expect(detector.getUsePeakMode()).toBe(false);
    });
  });

  describe('reset', () => {
    it('should not crash when called', () => {
      detector.setAlignmentMode('phase');
      expect(() => detector.reset()).not.toThrow();
    });

    it('should maintain alignment mode after reset', () => {
      detector.setAlignmentMode('phase');
      detector.reset();
      // Alignment mode is configuration, not state, so it should persist
      expect(detector.getAlignmentMode()).toBe('phase');
    });
  });

  describe('mode transitions', () => {
    it('should smoothly transition between all modes', () => {
      // Test transitions between all mode combinations
      const modes: AlignmentMode[] = ['zero-cross', 'peak', 'phase'];
      
      for (const fromMode of modes) {
        for (const toMode of modes) {
          detector.setAlignmentMode(fromMode);
          detector.setAlignmentMode(toMode);
          expect(detector.getAlignmentMode()).toBe(toMode);
        }
      }
    });
  });
});
