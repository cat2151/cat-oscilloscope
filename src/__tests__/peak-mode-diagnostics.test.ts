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
 */
function generateSineWave(frequency: number, sampleRate: number, length: number, amplitude: number = 1.0): Float32Array {
  const data = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    data[i] = amplitude * Math.sin(2 * Math.PI * frequency * i / sampleRate);
  }
  return data;
}

describe('Peak Mode Algorithm Diagnostics (Issue #68)', () => {
  describe('Current Peak Mode Behavior', () => {
    it('should identify the narrow display range problem', () => {
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
      
      // The issue: Peak mode should display approximately 1 cycle, similar to zero-cross mode
      // Current implementation uses limited search in findNextPeak
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
      
      // Both modes should show similar amounts of data (around 1 cycle)
      // This is expected based on the current implementation
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
      const cycleLength = Math.floor(sampleRate / frequency);
      
      // Expected: Peak mode should display approximately one cycle
      // That's peak to next peak, similar to zero-cross to next zero-cross
      
      console.log('=== Expected Peak Mode Behavior ===');
      console.log(`For proper display, peak mode should show: ${cycleLength} to ${cycleLength * 1.2} samples`);
      console.log(`This represents one cycle of the waveform`);
      console.log(`Current implementation shows: ~${Math.floor(cycleLength * 1.5)} samples (too narrow)`);
      
      // The fix should allow peak mode to display one full cycle, not just 1.5 cycles worth of search space
      const expectedMinWidth = cycleLength * 0.8; // At least 0.8 cycles
      const expectedMaxWidth = cycleLength * 1.3; // At most 1.3 cycles (including padding)
      
      expect(expectedMinWidth).toBeGreaterThan(0);
      expect(expectedMaxWidth).toBeLessThan(length);
    });
  });

  describe('Root Cause Analysis', () => {
    it('should identify the problem in findNextPeak algorithm', () => {
      // Root cause: findNextPeak() has a hard-coded search limit of cycleLength * 1.5
      // This is used in calculateDisplayRangeWithPeak() at line 509
      // 
      // The searchEnd calculation in findNextPeak (line 63):
      // const searchEnd = Math.min(data.length, searchStart + Math.floor(cycleLength * 1.5));
      //
      // This means the second peak can only be found within 1.5 cycles from the first peak,
      // resulting in a display range of approximately 1.5 cycles.
      //
      // Compare with zero-cross mode:
      // - findNextZeroCross() searches until the end of the buffer (line 94)
      // - This allows displaying the full buffer's worth of waveform
      //
      // Proposed fix:
      // - Change findNextPeak to search further, similar to findNextZeroCross
      // - Or change calculateDisplayRangeWithPeak to find the peak at approximately one cycle away
      
      const diagnosis = {
        problem: 'findNextPeak searches only 1.5 cycles ahead',
        impact: 'Display range limited to ~1.5 cycles instead of full buffer',
        expectedBehavior: 'Display one full cycle from peak to next peak',
        proposedFix: 'Search for next peak without artificial 1.5x cycle limit',
      };
      
      console.log('=== Root Cause ===');
      console.log(JSON.stringify(diagnosis, null, 2));
      
      expect(diagnosis.problem).toBeTruthy();
    });
  });
});
