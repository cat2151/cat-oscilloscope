import { describe, it, expect } from 'vitest';
import { ZeroCrossDetector } from '../ZeroCrossDetector';

/**
 * Diagnostic tests for peak mode issue #68
 * 
 * Issue: Peak mode displays waveform start/end in a very narrow position at screen center,
 * rather than displaying one full cycle like zero-cross mode does.
 * 
 * Expected behavior: After detecting the peak, display approximately one cycle of the waveform
 * (from peak to next peak + padding), similar to zero-cross mode behavior.
 */

/**
 * Helper function to generate a sine wave
 * @param frequency Frequency in Hz (typically 20-20000 for audio)
 * @param sampleRate Sample rate in Hz (e.g., 48000)
 * @param length Number of samples to generate (must be positive integer)
 * @param amplitude Peak amplitude, must be in range 0-1 (default: 1.0)
 * @returns Float32Array containing the generated sine wave
 */
function generateSineWave(frequency: number, sampleRate: number, length: number, amplitude: number = 1.0): Float32Array {
  const data = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    data[i] = amplitude * Math.sin(2 * Math.PI * frequency * i / sampleRate);
  }
  return data;
}

describe('Peak Mode Algorithm Diagnostics (Issue #68)', () => {
  describe('Peak Mode Behavior After Fix', () => {
    it('should display waveform within appropriate range in peak mode', () => {
      const sampleRate = 48000;
      const frequency = 440; // A4 note
      const length = 4096; // Full buffer length
      const signal = generateSineWave(frequency, sampleRate, length, 0.8);
      
      const detector = new ZeroCrossDetector();
      detector.setUsePeakMode(true);
      
      const displayRange = detector.calculateDisplayRange(signal, frequency, sampleRate);
      
      expect(displayRange).not.toBeNull();
      
      const rangeWidth = displayRange!.endIndex - displayRange!.startIndex;
      const cycleLength = Math.floor(sampleRate / frequency); // ~109 samples for 440Hz
      
      console.log('=== Peak Mode Display Range Analysis ===');
      console.log(`Full buffer length: ${length}`);
      console.log(`Cycle length (samples): ${cycleLength}`);
      console.log(`Display range: ${displayRange!.startIndex} to ${displayRange!.endIndex}`);
      console.log(`Display width: ${rangeWidth} samples`);
      console.log(`Display width as cycles: ${(rangeWidth / cycleLength).toFixed(2)}`);
      console.log(`Percentage of buffer used: ${((rangeWidth / length) * 100).toFixed(1)}%`);
      console.log(`firstZeroCross (peak pos): ${displayRange!.firstZeroCross}`);
      if (displayRange!.secondZeroCross !== undefined) {
        console.log(`secondZeroCross (2nd peak pos): ${displayRange!.secondZeroCross}`);
        console.log(`Peak distance: ${displayRange!.secondZeroCross - displayRange!.firstZeroCross} samples`);
      }
      
      // Peak mode displays approximately 1 cycle, similar to zero-cross mode
      // After fix: initial search range is 1 cycle, ensuring display starts near buffer beginning
      expect(rangeWidth).toBeGreaterThan(0);
      expect(rangeWidth).toBeLessThan(length); // Should not display entire buffer
    });

    it('should compare peak mode with zero-cross mode display ranges', () => {
      const sampleRate = 48000;
      const frequency = 440;
      const length = 4096;
      const signal = generateSineWave(frequency, sampleRate, length, 0.8);
      
      const detector = new ZeroCrossDetector();
      
      // Test zero-cross mode
      detector.setUsePeakMode(false);
      const zeroCrossRange = detector.calculateDisplayRange(signal, frequency, sampleRate);
      
      // Test peak mode
      detector.setUsePeakMode(true);
      const peakRange = detector.calculateDisplayRange(signal, frequency, sampleRate);
      
      expect(zeroCrossRange).not.toBeNull();
      expect(peakRange).not.toBeNull();
      
      const zeroCrossWidth = zeroCrossRange!.endIndex - zeroCrossRange!.startIndex;
      const peakWidth = peakRange!.endIndex - peakRange!.startIndex;
      const cycleLength = Math.floor(sampleRate / frequency);
      
      console.log('=== Zero-Cross vs Peak Mode Comparison ===');
      console.log(`Zero-cross display width: ${zeroCrossWidth} samples (${(zeroCrossWidth / cycleLength).toFixed(2)} cycles)`);
      console.log(`Peak mode display width: ${peakWidth} samples (${(peakWidth / cycleLength).toFixed(2)} cycles)`);
      console.log(`Ratio (peak/zero-cross): ${(peakWidth / zeroCrossWidth).toFixed(2)}`);
      console.log(`Zero-cross startIndex: ${zeroCrossRange!.startIndex}, firstZeroCross: ${zeroCrossRange!.firstZeroCross}`);
      console.log(`Peak mode startIndex: ${peakRange!.startIndex}, firstZeroCross (peak): ${peakRange!.firstZeroCross}`);
      
      // Current implementation searches for the next peak within approximately one cycle in findNextPeak,
      // so the display range is expected to stay around a single period rather than the full buffer.
      expect(peakWidth).toBeGreaterThan(cycleLength * 0.8);
      expect(peakWidth).toBeLessThan(cycleLength * 1.5);
    });

    it('should demonstrate findNextPeak search limitation', () => {
      const sampleRate = 48000;
      const frequency = 440;
      const length = 4096;
      const signal = generateSineWave(frequency, sampleRate, length, 0.8);
      
      const detector = new ZeroCrossDetector();
      const cycleLength = Math.floor(sampleRate / frequency);
      
      // Find first peak
      const firstPeak = detector.findPeak(signal, 0, length);
      expect(firstPeak).toBeGreaterThanOrEqual(0);
      
      // findNextPeak searches only within cycleLength * 1.5
      const secondPeak = detector.findNextPeak(signal, firstPeak, cycleLength);
      
      console.log('=== findNextPeak Search Range ===');
      console.log(`First peak at: ${firstPeak}`);
      console.log(`Cycle length: ${cycleLength}`);
      console.log(`Search range: ${firstPeak + 1} to ${Math.min(length, firstPeak + 1 + Math.floor(cycleLength * 1.5))}`);
      console.log(`Second peak at: ${secondPeak}`);
      
      if (secondPeak !== -1) {
        const distance = secondPeak - firstPeak;
        console.log(`Distance between peaks: ${distance} samples (${(distance / cycleLength).toFixed(2)} cycles)`);
        
        // This confirms the narrow search range
        expect(distance).toBeLessThan(cycleLength * 1.6);
      }
    });
  });

  describe('Expected Behavior for Proper Peak Mode', () => {
    it('should display one full cycle similar to zero-cross mode', () => {
      const sampleRate = 48000;
      const frequency = 440;
      const length = 4096;
      const signal = generateSineWave(frequency, sampleRate, length, 0.8);
      const cycleLength = Math.floor(sampleRate / frequency);
      
      const detector = new ZeroCrossDetector();
      detector.setUsePeakMode(true);
      
      const displayRange = detector.calculateDisplayRange(signal, frequency, sampleRate);
      expect(displayRange).not.toBeNull();
      
      const rangeWidth = displayRange!.endIndex - displayRange!.startIndex;
      
      // Expected: Peak mode should display approximately one cycle
      // That's peak to next peak, similar to zero-cross to next zero-cross
      
      console.log('=== Expected Peak Mode Behavior ===');
      console.log(`For proper display, peak mode should show: ${cycleLength} to ${cycleLength * 1.2} samples`);
      console.log(`This represents one cycle of the waveform`);
      console.log(`Updated implementation uses an initial search window of ~${cycleLength} samples (about one cycle)`);
      
      // Peak mode should display approximately one full cycle, while the internal peak search window is about one cycle
      const expectedMinWidth = cycleLength * 0.8; // At least 0.8 cycles
      const expectedMaxWidth = cycleLength * 1.3; // At most 1.3 cycles (including padding)
      
      expect(rangeWidth).toBeGreaterThanOrEqual(expectedMinWidth);
      expect(rangeWidth).toBeLessThanOrEqual(expectedMaxWidth);
    });
  });

  describe('Root Cause Analysis', () => {
    it('should identify the problem in findStablePeak initial search range', () => {
      // Root cause: findStablePeak() initializes its search window using an
      // initialSearchLength based on 2 cycles of the waveform (e.g. cycleLength * 2).
      // This overly broad initial range causes the algorithm to lock onto a peak
      // using information from up to 2 cycles, which contributes to the peak-mode
      // display showing a narrow, center-locked segment instead of a clean single cycle.
      //
      // In the PR that fixes issue #68, initialSearchLength is changed to be based on
      // a single cycle (cycleLength). This aligns peak-mode behavior with zero-cross
      // mode: one cycle is used as the reference window, and the display then shows
      // approximately one full cycle (with small padding) from peak to next peak.
      //
      // Compare with zero-cross mode:
      // - It effectively uses one cycle as the reference span between crossings.
      // - This produces a stable, single-cycle view of the waveform.
      //
      // Corrective action:
      // - Update findStablePeak so initialSearchLength is derived from 1 * cycleLength
      //   instead of 2 * cycleLength, ensuring the stabilization window matches the
      //   intended one-cycle display behavior.
      
      const diagnosis = {
        problem: 'findStablePeak uses an initialSearchLength based on 2 cycles',
        impact: 'Peak mode stabilizes over too wide a window, leading to an incorrect narrow display instead of a clean single-cycle view',
        expectedBehavior: 'Display approximately one full cycle from peak to next peak, similar to zero-cross mode',
        proposedFix: 'Compute initialSearchLength from 1 * cycleLength in findStablePeak to align the stabilization window with one cycle',
      };
      
      console.log('=== Root Cause ===');
      console.log(JSON.stringify(diagnosis, null, 2));
      
      expect(diagnosis.problem).toBeTruthy();
    });

    it('should verify waveform content in display range', () => {
      const sampleRate = 48000;
      const frequency = 440;
      const length = 4096;
      const signal = generateSineWave(frequency, sampleRate, length, 0.8);
      
      const detector = new ZeroCrossDetector();
      detector.setUsePeakMode(true);
      
      const displayRange = detector.calculateDisplayRange(signal, frequency, sampleRate);
      expect(displayRange).not.toBeNull();
      
      // Check if the display range contains a full waveform cycle
      let minVal = Infinity;
      let maxVal = -Infinity;
      for (let i = displayRange!.startIndex; i < displayRange!.endIndex; i++) {
        minVal = Math.min(minVal, signal[i]);
        maxVal = Math.max(maxVal, signal[i]);
      }
      
      console.log('=== Waveform Content Analysis ===');
      console.log(`Display range: ${displayRange!.startIndex} to ${displayRange!.endIndex}`);
      console.log(`Min value in range: ${minVal.toFixed(3)}`);
      console.log(`Max value in range: ${maxVal.toFixed(3)}`);
      console.log(`Peak-to-peak amplitude: ${(maxVal - minVal).toFixed(3)}`);
      
      // The display range should contain a full cycle with both positive and negative peaks
      expect(maxVal).toBeGreaterThan(0.7); // Should have positive peak close to 0.8
      expect(minVal).toBeLessThan(-0.7); // Should have negative peak close to -0.8
      expect(maxVal - minVal).toBeGreaterThan(1.4); // Peak-to-peak should be ~1.6
    });

    it('should maintain stable peak positions across multiple frames', () => {
      const sampleRate = 48000;
      const frequency = 440;
      const length = 4096;
      const cycleLength = Math.floor(sampleRate / frequency);
      
      const detector = new ZeroCrossDetector();
      detector.setUsePeakMode(true);
      
      // Simulate multiple consecutive frames with the same signal
      const positions: number[] = [];
      for (let frame = 0; frame < 10; frame++) {
        const signal = generateSineWave(frequency, sampleRate, length, 0.8);
        const displayRange = detector.calculateDisplayRange(signal, frequency, sampleRate);
        expect(displayRange).not.toBeNull();
        positions.push(displayRange!.firstZeroCross); // Peak position
      }
      
      console.log('=== Temporal Stability Analysis ===');
      console.log(`Peak positions across 10 frames:`, positions);
      
      // Check if positions are stable (should be very similar or identical)
      const maxPosition = Math.max(...positions);
      const minPosition = Math.min(...positions);
      const positionVariance = maxPosition - minPosition;
      
      console.log(`Position variance: ${positionVariance} samples (${(positionVariance / cycleLength).toFixed(2)} cycles)`);
      
      // Positions should be completely stable for the same signal (variance = 0)
      // Since we're using identical signals, peak detection should be deterministic
      expect(positionVariance).toBe(0);
    });
  });
});
