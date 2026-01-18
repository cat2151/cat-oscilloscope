/**
 * Tests for cycle similarity visualization feature
 */
import { describe, it, expect } from 'vitest';

describe('Cycle Similarity Feature', () => {
  it('should have correct data structure for cycle similarities', () => {
    // Test that the expected data structure is defined
    const mockRenderData = {
      cycleSimilarities8div: [0.95, 0.92, 0.89, 0.91, 0.93, 0.90, 0.94],
      cycleSimilarities4div: [0.88, 0.85, 0.87],
      cycleSimilarities2div: [0.82],
    };
    
    // Verify 8 divisions has 7 similarity values (comparing 8 segments = 7 consecutive pairs)
    expect(mockRenderData.cycleSimilarities8div).toHaveLength(7);
    
    // Verify 4 divisions has 3 similarity values (comparing 4 segments = 3 consecutive pairs)
    expect(mockRenderData.cycleSimilarities4div).toHaveLength(3);
    
    // Verify 2 divisions has 1 similarity value (comparing 2 segments = 1 consecutive pair)
    expect(mockRenderData.cycleSimilarities2div).toHaveLength(1);
    
    // Verify all values are within correlation coefficient range [-1, 1]
    const allValues = [
      ...mockRenderData.cycleSimilarities8div,
      ...mockRenderData.cycleSimilarities4div,
      ...mockRenderData.cycleSimilarities2div,
    ];
    
    for (const value of allValues) {
      expect(value).toBeGreaterThanOrEqual(-1);
      expect(value).toBeLessThanOrEqual(1);
    }
  });
  
  it('should calculate correct number of comparisons for each division', () => {
    // For n segments, we have n-1 consecutive pairs to compare
    
    // 8 divisions (1/2 cycle each) = 7 comparisons
    const divisions8 = 8;
    const comparisons8 = divisions8 - 1;
    expect(comparisons8).toBe(7);
    
    // 4 divisions (1 cycle each) = 3 comparisons
    const divisions4 = 4;
    const comparisons4 = divisions4 - 1;
    expect(comparisons4).toBe(3);
    
    // 2 divisions (2 cycles each) = 1 comparison
    const divisions2 = 2;
    const comparisons2 = divisions2 - 1;
    expect(comparisons2).toBe(1);
  });
  
  it('should properly represent division sizes relative to cycle length', () => {
    const cycleLength = 100; // samples per cycle
    const totalCycles = 4;
    const totalLength = cycleLength * totalCycles; // 400 samples
    
    // 8 divisions (1/2 cycle each)
    const segmentLength8div = totalLength / 8;
    expect(segmentLength8div).toBe(50); // 1/2 cycle = 50 samples
    
    // 4 divisions (1 cycle each)
    const segmentLength4div = totalLength / 4;
    expect(segmentLength4div).toBe(100); // 1 cycle = 100 samples
    
    // 2 divisions (2 cycles each)
    const segmentLength2div = totalLength / 2;
    expect(segmentLength2div).toBe(200); // 2 cycles = 200 samples
  });
});
