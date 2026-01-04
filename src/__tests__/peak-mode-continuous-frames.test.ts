import { describe, it, expect } from 'vitest';
import { ZeroCrossDetector } from '../ZeroCrossDetector';

/**
 * Tests for continuous frame behavior in peak mode
 * 
 * This test suite investigates how peak mode behaves across multiple consecutive frames
 * with different buffer data, simulating real Web Audio API behavior where each frame
 * gets a new snapshot of the audio stream.
 */

/**
 * Helper function to generate a sine wave with a phase offset
 * @param frequency Frequency in Hz
 * @param sampleRate Sample rate in Hz
 * @param length Number of samples to generate
 * @param amplitude Peak amplitude (0-1)
 * @param phaseOffset Phase offset in radians
 */
function generateSineWaveWithPhase(
  frequency: number,
  sampleRate: number,
  length: number,
  amplitude: number = 1.0,
  phaseOffset: number = 0
): Float32Array {
  const data = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    data[i] = amplitude * Math.sin(2 * Math.PI * frequency * i / sampleRate + phaseOffset);
  }
  return data;
}

describe('Peak Mode Continuous Frame Behavior', () => {
  describe('Temporal Tracking Across Different Buffers', () => {
    it('should track peaks across frames with phase-shifted data', () => {
      const sampleRate = 48000;
      const frequency = 440;
      const length = 4096;
      const cycleLength = Math.floor(sampleRate / frequency);
      
      const detector = new ZeroCrossDetector();
      detector.setUsePeakMode(true);
      
      // Simulate 10 frames, each with a small phase shift (simulating continuous audio stream)
      const phaseShiftPerFrame = (2 * Math.PI * frequency * 100) / sampleRate; // 100 samples worth of phase
      const peakPositions: number[] = [];
      
      for (let frame = 0; frame < 10; frame++) {
        const phaseOffset = frame * phaseShiftPerFrame;
        const signal = generateSineWaveWithPhase(frequency, sampleRate, length, 0.8, phaseOffset);
        const displayRange = detector.calculateDisplayRange(signal, frequency, sampleRate);
        
        expect(displayRange).not.toBeNull();
        peakPositions.push(displayRange!.firstZeroCross);
        
        console.log(`Frame ${frame}: peak at ${displayRange!.firstZeroCross}, phase offset: ${phaseOffset.toFixed(3)}`);
      }
      
      // Analyze peak position variance
      const maxPosition = Math.max(...peakPositions);
      const minPosition = Math.min(...peakPositions);
      const variance = maxPosition - minPosition;
      
      console.log('=== Peak Positions Across Phase-Shifted Frames ===');
      console.log(`Peak positions:`, peakPositions);
      console.log(`Position variance: ${variance} samples (${(variance / cycleLength).toFixed(2)} cycles)`);
      
      // With phase shifts, peak positions should vary as the signal shifts
      // This tests whether the algorithm adapts to changing peak positions
      expect(variance).toBeGreaterThan(0); // Peaks should shift with phase
    });

    it('should verify frequency estimation is actually used in findNextPeak', () => {
      const sampleRate = 48000;
      const frequency = 440;
      const length = 4096;
      const signal = generateSineWaveWithPhase(frequency, sampleRate, length, 0.8);
      
      const detector = new ZeroCrossDetector();
      detector.setUsePeakMode(true);
      
      const displayRange = detector.calculateDisplayRange(signal, frequency, sampleRate);
      expect(displayRange).not.toBeNull();
      
      const cycleLength = Math.floor(sampleRate / frequency); // ~109 samples
      const firstPeak = displayRange!.firstZeroCross;
      const secondPeak = displayRange!.secondZeroCross;
      
      if (secondPeak !== undefined) {
        const peakDistance = secondPeak - firstPeak;
        
        console.log('=== Frequency Estimation Usage ===');
        console.log(`Estimated cycle length: ${cycleLength} samples`);
        console.log(`First peak: ${firstPeak}`);
        console.log(`Second peak: ${secondPeak}`);
        console.log(`Distance between peaks: ${peakDistance} samples`);
        console.log(`Ratio (actual/estimated): ${(peakDistance / cycleLength).toFixed(2)}`);
        
        // The distance should be close to one cycle length (estimated from frequency)
        // If findNextPeak is just finding "any next peak" without using frequency,
        // the distance could be arbitrary. But if it uses frequency correctly,
        // it should be within 1.5 cycles (the search range of findNextPeak)
        expect(peakDistance).toBeGreaterThan(cycleLength * 0.8);
        expect(peakDistance).toBeLessThan(cycleLength * 1.5);
        
        // More importantly, it should be CLOSE to one cycle (not just any peak)
        expect(Math.abs(peakDistance - cycleLength)).toBeLessThan(cycleLength * 0.2);
      }
    });

    it('should test with incorrect frequency estimation', () => {
      const sampleRate = 48000;
      const actualFrequency = 440;
      const wrongFrequency = 880; // Double the actual frequency (one octave higher)
      const length = 4096;
      const signal = generateSineWaveWithPhase(actualFrequency, sampleRate, length, 0.8);
      
      const detector = new ZeroCrossDetector();
      detector.setUsePeakMode(true);
      
      // Pass wrong frequency to see what happens
      const displayRange = detector.calculateDisplayRange(signal, wrongFrequency, sampleRate);
      expect(displayRange).not.toBeNull();
      
      const actualCycleLength = Math.floor(sampleRate / actualFrequency); // ~109 samples
      const estimatedCycleLength = Math.floor(sampleRate / wrongFrequency); // ~54 samples
      const firstPeak = displayRange!.firstZeroCross;
      const secondPeak = displayRange!.secondZeroCross;
      
      console.log('=== Wrong Frequency Estimation Test ===');
      console.log(`Actual frequency: ${actualFrequency} Hz (cycle: ${actualCycleLength} samples)`);
      console.log(`Estimated frequency: ${wrongFrequency} Hz (cycle: ${estimatedCycleLength} samples)`);
      
      if (secondPeak !== undefined) {
        const peakDistance = secondPeak - firstPeak;
        console.log(`Distance between peaks: ${peakDistance} samples`);
        console.log(`Expected with wrong estimate: ~${estimatedCycleLength} samples`);
        console.log(`Actual cycle length: ${actualCycleLength} samples`);
        
        // This will reveal whether the algorithm blindly follows the wrong frequency
        // or adapts based on the actual waveform
        // If it's close to estimatedCycleLength, it's blindly following wrong frequency
        // If it's close to actualCycleLength, it's adapting to actual waveform
      }
    });
  });

  describe('Pattern Matching Behavior', () => {
    it('should analyze selectBestCandidate effectiveness', () => {
      const sampleRate = 48000;
      const frequency = 440;
      const length = 4096;
      
      // Create a signal with harmonics to test pattern matching
      const signal = new Float32Array(length);
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        signal[i] = 
          0.5 * Math.sin(2 * Math.PI * frequency * t) +        // Fundamental
          0.3 * Math.sin(2 * Math.PI * frequency * 2 * t) +   // 2nd harmonic
          0.2 * Math.sin(2 * Math.PI * frequency * 3 * t);    // 3rd harmonic
      }
      
      const detector = new ZeroCrossDetector();
      detector.setUsePeakMode(true);
      
      const displayRange = detector.calculateDisplayRange(signal, frequency, sampleRate);
      expect(displayRange).not.toBeNull();
      
      // Get similarity scores to understand pattern matching
      const similarityScores = detector.getSimilarityScores();
      
      console.log('=== Pattern Matching with Harmonics ===');
      console.log(`Similarity scores:`, similarityScores);
      console.log(`Best score: ${Math.max(...similarityScores).toFixed(3)}`);
      
      if (similarityScores.length > 0) {
        // If pattern matching works well, the best score should be high
        const bestScore = Math.max(...similarityScores);
        expect(bestScore).toBeGreaterThan(0.5); // Should have decent correlation
      }
    });
  });
});
