/**
 * ZeroCrossDetector handles zero-crossing detection and display range calculation
 * Responsible for:
 * - Finding zero-crossing points in waveform
 * - Calculating optimal display ranges
 * - Maintaining temporal stability in zero-cross detection
 */
export class ZeroCrossDetector {
  private previousZeroCrossIndex: number | null = null; // Previous frame's zero-crossing position
  private readonly ZERO_CROSS_SEARCH_TOLERANCE_CYCLES = 0.5; // Search within ±0.5 cycles of expected position

  /**
   * Find zero-cross point where signal crosses from negative to positive
   */
  findZeroCross(data: Float32Array, startIndex: number = 0): number {
    for (let i = startIndex; i < data.length - 1; i++) {
      // Look for transition from negative (or zero) to positive
      if (data[i] <= 0 && data[i + 1] > 0) {
        return i;
      }
    }
    return -1; // No zero-cross found
  }

  /**
   * Find the next zero-cross point after the given index
   */
  findNextZeroCross(data: Float32Array, startIndex: number): number {
    // Start searching from the next sample to find the next cycle
    const searchStart = startIndex + 1;
    if (searchStart >= data.length) {
      return -1;
    }
    return this.findZeroCross(data, searchStart);
  }

  /**
   * Find a stable zero-crossing position with temporal continuity
   * This prevents rapid switching between different waveform patterns
   */
  findStableZeroCross(data: Float32Array, estimatedCycleLength: number): number {
    // If we have a previous zero-crossing position and frequency estimate
    if (this.previousZeroCrossIndex !== null && estimatedCycleLength > 0) {
      let expectedIndex = this.previousZeroCrossIndex;
      
      // If the previous index is out of range for the current buffer, reset
      if (expectedIndex < 0 || expectedIndex >= data.length) {
        this.previousZeroCrossIndex = null;
      } else {
        // Define search range around expected position
        const searchTolerance = estimatedCycleLength * this.ZERO_CROSS_SEARCH_TOLERANCE_CYCLES;
        const searchStart = Math.max(0, Math.floor(expectedIndex - searchTolerance));
        const searchEnd = Math.min(data.length - 1, Math.ceil(expectedIndex + searchTolerance));
        
        // Search for zero-crossing nearest to expected position
        let bestZeroCross = -1;
        let bestDistance = Infinity;
        
        // Ensure we don't access out of bounds when checking data[i + 1]
        for (let i = searchStart; i < searchEnd && i < data.length - 1; i++) {
          if (data[i] <= 0 && data[i + 1] > 0) {
            const distance = Math.abs(i - expectedIndex);
            if (distance < bestDistance) {
              bestDistance = distance;
              bestZeroCross = i;
            }
          }
        }
        
        // If we found a zero-crossing near expected position, use it
        if (bestZeroCross !== -1) {
          this.previousZeroCrossIndex = bestZeroCross;
          return bestZeroCross;
        }
      }
    }
    
    // No previous position or search failed - find first zero-crossing
    const zeroCross = this.findZeroCross(data, 0);
    if (zeroCross !== -1) {
      this.previousZeroCrossIndex = zeroCross;
    }
    return zeroCross;
  }

  /**
   * Calculate the optimal display range for the waveform with zero-cross padding
   */
  calculateDisplayRange(data: Float32Array, estimatedFrequency: number, sampleRate: number): {
    startIndex: number;
    endIndex: number;
    firstZeroCross: number;
    secondZeroCross?: number;
  } | null {
    // Find the first zero-cross point to estimate cycle length
    const estimationZeroCross = this.findZeroCross(data, 0);
    
    if (estimationZeroCross === -1) {
      return null; // No zero-cross found
    }

    // Find the next zero-cross to determine cycle length
    const nextZeroCross = this.findNextZeroCross(data, estimationZeroCross);
    
    let cycleLength: number;
    if (nextZeroCross === -1) {
      // Only one zero-cross found, estimate from frequency if available
      if (estimatedFrequency > 0 && sampleRate > 0) {
        cycleLength = Math.floor(sampleRate / estimatedFrequency);
      } else {
        // No frequency info, display from found zero-cross to end
        return {
          startIndex: estimationZeroCross,
          endIndex: data.length,
          firstZeroCross: estimationZeroCross,
        };
      }
    } else {
      cycleLength = nextZeroCross - estimationZeroCross;
    }

    // Use stable zero-crossing detection to prevent rapid pattern switching
    const firstZeroCross = this.findStableZeroCross(data, cycleLength);
    
    if (firstZeroCross === -1) {
      return null; // No stable zero-cross found
    }
    
    const secondZeroCross = this.findNextZeroCross(data, firstZeroCross);

    // Calculate phase padding
    const rawPhasePadding = Math.floor(cycleLength / 16); // π/8 of one cycle (2π / 16 = π/8)
    const maxPhasePadding = Math.floor(data.length / 2);
    const phasePadding = Math.min(rawPhasePadding, maxPhasePadding);
    
    if (secondZeroCross === -1) {
      // Only one suitable zero-cross found, display from there to end
      return {
        startIndex: Math.max(0, firstZeroCross - phasePadding),
        endIndex: data.length,
        firstZeroCross: firstZeroCross,
      };
    }

    // Display from phase -π/8 to phase 2π+π/8
    const startIndex = Math.max(0, firstZeroCross - phasePadding);
    const endIndex = Math.min(data.length, secondZeroCross + phasePadding);
    
    return {
      startIndex,
      endIndex,
      firstZeroCross,
      secondZeroCross,
    };
  }

  /**
   * Reset zero-cross tracking (e.g., when stopping)
   */
  reset(): void {
    this.previousZeroCrossIndex = null;
  }
}
