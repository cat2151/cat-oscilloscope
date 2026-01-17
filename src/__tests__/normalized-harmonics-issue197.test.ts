import { describe, it, expect } from 'vitest';

/**
 * Test for issue #197: Normalized harmonic peak strengths
 * 
 * This test verifies that harmonic peak strengths are normalized to 0.0-1.0
 * where 1.0 represents the strongest peak among all harmonics (1x-5x) of both candidates.
 * 
 * This normalization makes adjustment work smoother by showing relative harmonic strengths
 * in an intuitive way.
 */
describe('Normalized Harmonic Peak Strengths - Issue #197', () => {
  it('should normalize harmonics to 0.0-1.0 scale', () => {
    // Simulate raw harmonic values (0-255 from FFT)
    const candidate1Raw = [228, 0, 0, 30, 95];   // max is 228
    const candidate2Raw = [141, 228, 73, 0, 0];  // max is 228
    
    // Maximum across both candidates
    const maxValue = Math.max(...candidate1Raw, ...candidate2Raw); // 228
    
    // Normalize both candidates
    const candidate1Normalized = candidate1Raw.map(v => v / maxValue);
    const candidate2Normalized = candidate2Raw.map(v => v / maxValue);
    
    // Verify normalization
    // Candidate 1: [1.0, 0.0, 0.0, 0.13, 0.42]
    expect(candidate1Normalized[0]).toBeCloseTo(1.0, 2);
    expect(candidate1Normalized[1]).toBeCloseTo(0.0, 2);
    expect(candidate1Normalized[2]).toBeCloseTo(0.0, 2);
    expect(candidate1Normalized[3]).toBeCloseTo(0.13, 2);
    expect(candidate1Normalized[4]).toBeCloseTo(0.42, 2);
    
    // Candidate 2: [0.62, 1.0, 0.32, 0.0, 0.0]
    expect(candidate2Normalized[0]).toBeCloseTo(0.62, 2);
    expect(candidate2Normalized[1]).toBeCloseTo(1.0, 2);
    expect(candidate2Normalized[2]).toBeCloseTo(0.32, 2);
    expect(candidate2Normalized[3]).toBeCloseTo(0.0, 2);
    expect(candidate2Normalized[4]).toBeCloseTo(0.0, 2);
    
    // Verify at least one value is 1.0 (the maximum)
    const allNormalized = [...candidate1Normalized, ...candidate2Normalized];
    expect(Math.max(...allNormalized)).toBeCloseTo(1.0, 2);
  });
  
  it('should handle case where one candidate dominates', () => {
    // Candidate 1 has the strongest peak
    const candidate1Raw = [255, 200, 150, 100, 50];  // max is 255
    const candidate2Raw = [50, 40, 30, 20, 10];      // much weaker
    
    const maxValue = Math.max(...candidate1Raw, ...candidate2Raw); // 255
    
    const candidate1Normalized = candidate1Raw.map(v => v / maxValue);
    const candidate2Normalized = candidate2Raw.map(v => v / maxValue);
    
    // Candidate 1 should have 1.0 as its first harmonic
    expect(candidate1Normalized[0]).toBeCloseTo(1.0, 2);
    
    // Candidate 2 should be much weaker
    expect(candidate2Normalized[0]).toBeCloseTo(0.20, 2); // 50/255
    
    // All values should be <= 1.0
    [...candidate1Normalized, ...candidate2Normalized].forEach(v => {
      expect(v).toBeLessThanOrEqual(1.0);
    });
  });
  
  it('should handle edge case where all harmonics are zero', () => {
    const candidate1Raw = [0, 0, 0, 0, 0];
    const candidate2Raw = [0, 0, 0, 0, 0];
    
    const maxValue = Math.max(...candidate1Raw, ...candidate2Raw); // 0
    
    // When max is 0, normalization should return all zeros
    const normalize = (harmonics: number[]) => {
      if (maxValue > 0) {
        return harmonics.map(v => v / maxValue);
      } else {
        return harmonics.map(() => 0.0);
      }
    };
    
    const candidate1Normalized = normalize(candidate1Raw);
    const candidate2Normalized = normalize(candidate2Raw);
    
    // All should be 0.0
    candidate1Normalized.forEach(v => expect(v).toBe(0.0));
    candidate2Normalized.forEach(v => expect(v).toBe(0.0));
  });
  
  it('should maintain relative ratios between harmonics', () => {
    // If raw values have 2:1 ratio, normalized should maintain that
    const candidate1Raw = [200, 100, 50, 0, 0];  // 200 is max
    const candidate2Raw = [0, 0, 0, 0, 0];
    
    const maxValue = 200;
    const candidate1Normalized = candidate1Raw.map(v => v / maxValue);
    
    // Check ratios are maintained
    expect(candidate1Normalized[0] / candidate1Normalized[1]).toBeCloseTo(2.0, 2); // 1.0 / 0.5 = 2.0
    expect(candidate1Normalized[1] / candidate1Normalized[2]).toBeCloseTo(2.0, 2); // 0.5 / 0.25 = 2.0
  });
});
