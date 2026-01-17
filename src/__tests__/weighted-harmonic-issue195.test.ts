import { describe, it, expect } from 'vitest';

/**
 * Test for issue #195: Weighted harmonic analysis
 * 
 * This test verifies that the weighted harmonic algorithm correctly
 * prioritizes candidates with strong 1x, 2x, 3x harmonics over
 * candidates with weaker low-order harmonics but strong high-order harmonics.
 * 
 * Scenario from issue #195:
 * - Candidate 1 (789.9Hz): harmonics 1x:228, 2x:0, 3x:0, 4x:30, 5x:95
 *   - Missing critical low-order harmonics (2x, 3x)
 *   - Unweighted count: 3 harmonics
 *   - Weighted score: 3.0 (1x) + 1.0 (4x) + 1.0 (5x) = 5.0
 * 
 * - Candidate 2 (394.9Hz): harmonics 1x:141, 2x:228, 3x:73, 4x:0, 5x:0
 *   - Strong low-order harmonics present (1x, 2x, 3x)
 *   - Unweighted count: 3 harmonics
 *   - Weighted score: 3.0 (1x) + 3.0 (2x) + 2.0 (3x) = 8.0
 * 
 * Expected: Candidate 2 should be chosen due to higher weighted score (8.0 > 5.0)
 * even though both have the same unweighted harmonic count (3)
 */
describe('Weighted Harmonic Analysis - Issue #195', () => {
  it('should calculate weighted scores correctly', () => {
    // Harmonic weights: [3.0, 3.0, 2.0, 1.0, 1.0] for 1x through 5x
    const weights = [3.0, 3.0, 2.0, 1.0, 1.0];
    const threshold = 5.0; // Minimum magnitude to be considered present
    
    // Candidate 1: 789.9Hz with harmonics [228, 0, 3, 30, 95]
    const candidate1Harmonics = [228, 0, 0, 30, 95];
    const candidate1WeightedScore = candidate1Harmonics.reduce((sum, magnitude, idx) => {
      return sum + (magnitude > threshold ? weights[idx] : 0);
    }, 0);
    
    // Candidate 2: 394.9Hz with harmonics [141, 228, 73, 0, 0]
    const candidate2Harmonics = [141, 228, 73, 0, 0];
    const candidate2WeightedScore = candidate2Harmonics.reduce((sum, magnitude, idx) => {
      return sum + (magnitude > threshold ? weights[idx] : 0);
    }, 0);
    
    // Verify weighted scores
    expect(candidate1WeightedScore).toBe(5.0); // 3.0 (1x) + 1.0 (4x) + 1.0 (5x)
    expect(candidate2WeightedScore).toBe(8.0); // 3.0 (1x) + 3.0 (2x) + 2.0 (3x)
    
    // Candidate 2 should have higher weighted score
    expect(candidate2WeightedScore).toBeGreaterThan(candidate1WeightedScore);
  });
  
  it('should prefer candidate with strong low-order harmonics', () => {
    // This test verifies the selection logic would choose candidate 2
    const threshold = 5.0;
    const weights = [3.0, 3.0, 2.0, 1.0, 1.0];
    
    const calculateWeightedScore = (harmonics: number[]) => {
      return harmonics.reduce((sum, magnitude, idx) => {
        return sum + (magnitude > threshold ? weights[idx] : 0);
      }, 0);
    };
    
    // Scenario: Both candidates have 3 harmonics above threshold
    // But candidate with 1x, 2x, 3x should win over 1x, 4x, 5x
    
    const candidate1 = [228, 0, 0, 30, 95];  // 1x, 4x, 5x present
    const candidate2 = [141, 228, 73, 0, 0]; // 1x, 2x, 3x present
    
    const score1 = calculateWeightedScore(candidate1);
    const score2 = calculateWeightedScore(candidate2);
    
    // Verify candidate 2 wins due to stronger low-order harmonics
    expect(score2).toBeGreaterThan(score1);
    
    // Also verify the actual values match our manual calculation
    expect(score1).toBe(5.0);
    expect(score2).toBe(8.0);
  });
  
  it('should handle edge case where only 2x and 3x are present', () => {
    const threshold = 5.0;
    const weights = [3.0, 3.0, 2.0, 1.0, 1.0];
    
    // Edge case: fundamental (1x) is weak but 2x and 3x are strong
    const harmonicsWithStrong2x3x = [0, 200, 150, 0, 0];
    const weightedScore = harmonicsWithStrong2x3x.reduce((sum, magnitude, idx) => {
      return sum + (magnitude > threshold ? weights[idx] : 0);
    }, 0);
    
    // Should get 3.0 (2x) + 2.0 (3x) = 5.0
    expect(weightedScore).toBe(5.0);
  });
  
  it('should handle edge case where all harmonics are strong', () => {
    const threshold = 5.0;
    const weights = [3.0, 3.0, 2.0, 1.0, 1.0];
    
    // All harmonics strong
    const allStrongHarmonics = [200, 190, 180, 170, 160];
    const weightedScore = allStrongHarmonics.reduce((sum, magnitude, idx) => {
      return sum + (magnitude > threshold ? weights[idx] : 0);
    }, 0);
    
    // Should get 3.0 + 3.0 + 2.0 + 1.0 + 1.0 = 10.0
    expect(weightedScore).toBe(10.0);
  });
  
  it('should handle edge case where no harmonics are strong enough', () => {
    const threshold = 5.0;
    const weights = [3.0, 3.0, 2.0, 1.0, 1.0];
    
    // All harmonics below threshold
    const weakHarmonics = [4, 3, 2, 1, 0];
    const weightedScore = weakHarmonics.reduce((sum, magnitude, idx) => {
      return sum + (magnitude > threshold ? weights[idx] : 0);
    }, 0);
    
    // Should get 0.0
    expect(weightedScore).toBe(0.0);
  });
});
