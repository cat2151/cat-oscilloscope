import { describe, it, expect } from 'vitest';
import { resolveValue, DEFAULT_OVERLAYS_LAYOUT, OverlayLayout } from '../OverlayLayout';

describe('OverlayLayout', () => {
  describe('resolveValue', () => {
    it('should resolve pixel values', () => {
      expect(resolveValue(100, 800)).toBe(100);
      expect(resolveValue(50, 400)).toBe(50);
    });

    it('should resolve percentage strings', () => {
      expect(resolveValue('50%', 800)).toBe(400);
      expect(resolveValue('25%', 400)).toBe(100);
      expect(resolveValue('10%', 1000)).toBe(100);
    });

    it('should resolve numeric strings', () => {
      expect(resolveValue('100', 800)).toBe(100);
      expect(resolveValue('50', 400)).toBe(50);
    });

    it('should handle edge cases', () => {
      expect(resolveValue('0%', 800)).toBe(0);
      expect(resolveValue('100%', 800)).toBe(800);
      expect(resolveValue(0, 800)).toBe(0);
    });
  });

  describe('DEFAULT_OVERLAYS_LAYOUT', () => {
    it('should have fftOverlay configuration', () => {
      expect(DEFAULT_OVERLAYS_LAYOUT.fftOverlay).toBeDefined();
      expect(DEFAULT_OVERLAYS_LAYOUT.fftOverlay?.position).toBeDefined();
      expect(DEFAULT_OVERLAYS_LAYOUT.fftOverlay?.size).toBeDefined();
    });

    it('should have harmonicAnalysis configuration', () => {
      expect(DEFAULT_OVERLAYS_LAYOUT.harmonicAnalysis).toBeDefined();
      expect(DEFAULT_OVERLAYS_LAYOUT.harmonicAnalysis?.position).toBeDefined();
      expect(DEFAULT_OVERLAYS_LAYOUT.harmonicAnalysis?.size).toBeDefined();
    });

    it('should have frequencyPlot configuration', () => {
      expect(DEFAULT_OVERLAYS_LAYOUT.frequencyPlot).toBeDefined();
      expect(DEFAULT_OVERLAYS_LAYOUT.frequencyPlot?.position).toBeDefined();
      expect(DEFAULT_OVERLAYS_LAYOUT.frequencyPlot?.size).toBeDefined();
    });

    it('should use percentage for FFT overlay positioning', () => {
      const fftOverlay = DEFAULT_OVERLAYS_LAYOUT.fftOverlay as OverlayLayout;
      expect(typeof fftOverlay.position.y).toBe('string');
      expect(fftOverlay.position.y).toContain('%');
    });

    it('should use right-aligned positioning for frequency plot', () => {
      const freqPlot = DEFAULT_OVERLAYS_LAYOUT.frequencyPlot as OverlayLayout;
      expect(typeof freqPlot.position.x).toBe('string');
      expect(freqPlot.position.x).toContain('right-');
    });
  });
});
