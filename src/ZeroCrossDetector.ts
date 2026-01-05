/**
 * ZeroCrossDetector handles zero-crossing detection and display range calculation
 * Responsible for:
 * - Finding zero-crossing points in waveform
 * - Finding peak points in waveform (alternative to zero-crossing for high frequencies)
 * - Calculating optimal display ranges
 * - Maintaining temporal stability in zero-cross/peak detection
 */
export class ZeroCrossDetector {
  private previousZeroCrossIndex: number | null = null; // Previous frame's zero-crossing position
  private previousPeakIndex: number | null = null; // Previous frame's peak position
  private readonly ZERO_CROSS_SEARCH_TOLERANCE_CYCLES = 0.5; // Search within ±0.5 cycles of expected position
  private usePeakMode: boolean = false; // Use peak detection instead of zero-crossing

  /**
   * Set whether to use peak mode instead of zero-crossing mode
   */
  setUsePeakMode(enabled: boolean): void {
    this.usePeakMode = enabled;
  }

  /**
   * Get whether peak mode is enabled
   */
  getUsePeakMode(): boolean {
    return this.usePeakMode;
  }

  /**
   * Find peak point (maximum absolute amplitude) in the waveform
   * @param data Waveform data
   * @param startIndex Starting index for search
   * @param endIndex Ending index for search (exclusive)
   * @returns Index of peak point, or -1 if not found
   */
  findPeak(data: Float32Array, startIndex: number = 0, endIndex?: number): number {
    const end = endIndex ?? data.length;
    if (startIndex >= end || startIndex < 0) {
      return -1;
    }

    let peakIndex = startIndex;
    let peakValue = Math.abs(data[startIndex]);

    for (let i = startIndex + 1; i < end; i++) {
      const absValue = Math.abs(data[i]);
      if (absValue > peakValue) {
        peakValue = absValue;
        peakIndex = i;
      }
    }

    return peakIndex;
  }

  /**
   * Find the next peak after the given index within approximately one cycle
   */
  findNextPeak(data: Float32Array, startIndex: number, cycleLength: number): number {
    const searchStart = startIndex + 1;
    const searchEnd = Math.min(data.length, searchStart + Math.floor(cycleLength * 1.5));
    
    if (searchStart >= data.length) {
      return -1;
    }
    
    return this.findPeak(data, searchStart, searchEnd);
  }

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
   * Find a stable peak position with temporal continuity
   * This prevents rapid switching between different waveform patterns
   */
  findStablePeak(data: Float32Array, estimatedCycleLength: number): number {
    // If we have a previous peak position and cycle estimate
    if (this.previousPeakIndex !== null && estimatedCycleLength > 0) {
      let expectedIndex = this.previousPeakIndex;
      
      // If the previous index is out of range for the current buffer, reset
      if (expectedIndex < 0 || expectedIndex >= data.length) {
        this.previousPeakIndex = null;
      } else {
        // Define search range around expected position
        const searchTolerance = estimatedCycleLength * this.ZERO_CROSS_SEARCH_TOLERANCE_CYCLES;
        const searchStart = Math.max(0, Math.floor(expectedIndex - searchTolerance));
        const searchEnd = Math.min(data.length, Math.ceil(expectedIndex + searchTolerance));
        
        // Find peak nearest to expected position
        const nearExpectedPeak = this.findPeak(data, searchStart, searchEnd);
        
        // If we found a peak near expected position
        if (nearExpectedPeak !== -1) {
          this.previousPeakIndex = nearExpectedPeak;
          return nearExpectedPeak;
        }
      }
    }
    
    // No previous position or search failed - find first peak in initial portion
    const initialSearchLength = estimatedCycleLength > 0 
      ? Math.min(data.length, Math.floor(estimatedCycleLength * 2))
      : Math.min(data.length, 1000);
      
    const peak = this.findPeak(data, 0, initialSearchLength);
    if (peak !== -1) {
      this.previousPeakIndex = peak;
    }
    return peak;
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
        let nearExpectedZeroCross = -1;
        let bestDistance = Infinity;
        
        // Ensure we don't access out of bounds when checking data[i + 1]
        for (let i = searchStart; i < searchEnd && i < data.length - 1; i++) {
          if (data[i] <= 0 && data[i + 1] > 0) {
            const distance = Math.abs(i - expectedIndex);
            if (distance < bestDistance) {
              bestDistance = distance;
              nearExpectedZeroCross = i;
            }
          }
        }
        
        // If we found a zero-crossing near expected position
        if (nearExpectedZeroCross !== -1) {
          this.previousZeroCrossIndex = nearExpectedZeroCross;
          return nearExpectedZeroCross;
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
   * Calculate the optimal display range for the waveform
   * Uses either zero-cross or peak detection based on usePeakMode setting
   * 
   * @param data Waveform data
   * @param estimatedFrequency Estimated frequency in Hz
   * @param sampleRate Sample rate in Hz
   * @returns Display range information, or null if no alignment point found
   * 
   * @remarks
   * **Important**: The returned property names `firstZeroCross` and `secondZeroCross` are maintained
   * for API compatibility, but they represent different alignment points depending on the mode:
   * - When `usePeakMode` is `false`: Contains actual zero-crossing positions (negative to positive)
   * - When `usePeakMode` is `true`: Contains peak positions (maximum absolute amplitude points)
   * 
   * These properties should be interpreted as "first alignment point" and "second alignment point"
   * rather than strictly as zero-crossings.
   */
  calculateDisplayRange(data: Float32Array, estimatedFrequency: number, sampleRate: number): {
    startIndex: number;
    endIndex: number;
    firstZeroCross: number;
    secondZeroCross?: number;
  } | null {
    if (this.usePeakMode) {
      return this.calculateDisplayRangeWithPeak(data, estimatedFrequency, sampleRate);
    } else {
      return this.calculateDisplayRangeWithZeroCross(data, estimatedFrequency, sampleRate);
    }
  }

  /**
   * Calculate the optimal display range for the waveform using peak detection
   * 
   * @param data Waveform data
   * @param estimatedFrequency Estimated frequency in Hz
   * @param sampleRate Sample rate in Hz
   * @returns Display range information with peak positions stored in `firstZeroCross`/`secondZeroCross`
   * 
   * @remarks
   * This method uses peak detection (maximum absolute amplitude) instead of zero-crossing detection.
   * The returned properties `firstZeroCross` and `secondZeroCross` actually contain peak positions
   * for API compatibility with the zero-cross detection method.
   */
  private calculateDisplayRangeWithPeak(data: Float32Array, estimatedFrequency: number, sampleRate: number): {
    startIndex: number;
    endIndex: number;
    firstZeroCross: number;
    secondZeroCross?: number;
  } | null {
    // Estimate cycle length from frequency
    let cycleLength: number;
    if (estimatedFrequency > 0 && sampleRate > 0) {
      cycleLength = Math.floor(sampleRate / estimatedFrequency);
    } else {
      // No frequency info, use a default search window
      cycleLength = Math.floor(data.length / 4);
    }

    // Use stable peak detection
    const firstPeak = this.findStablePeak(data, cycleLength);
    
    if (firstPeak === -1) {
      return null; // No peak found
    }
    
    const secondPeak = this.findNextPeak(data, firstPeak, cycleLength);

    // Calculate phase padding
    const rawPhasePadding = Math.floor(cycleLength / 16); // π/8 of one cycle (2π / 16 = π/8)
    const maxPhasePadding = Math.floor(data.length / 2);
    const phasePadding = Math.min(rawPhasePadding, maxPhasePadding);
    
    if (secondPeak === -1) {
      // Only one peak found, display from there to end
      const startIndex = Math.max(0, firstPeak - phasePadding);
      const endIndex = data.length;
      
      return {
        startIndex,
        endIndex,
        firstZeroCross: firstPeak, // Use peak position in place of zeroCross for API compatibility
      };
    }

    // Display from peak -π/8 to next peak +π/8
    const startIndex = Math.max(0, firstPeak - phasePadding);
    const endIndex = Math.min(data.length, secondPeak + phasePadding);
    
    return {
      startIndex,
      endIndex,
      firstZeroCross: firstPeak, // Use peak position in place of zeroCross for API compatibility
      secondZeroCross: secondPeak,
    };
  }

  /**
   * Calculate the optimal display range for the waveform with zero-cross padding
   */
  private calculateDisplayRangeWithZeroCross(data: Float32Array, estimatedFrequency: number, sampleRate: number): {
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
        const startIndex = estimationZeroCross;
        const endIndex = data.length;
        
        return {
          startIndex,
          endIndex,
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
      const startIndex = Math.max(0, firstZeroCross - phasePadding);
      const endIndex = data.length;
      
      return {
        startIndex,
        endIndex,
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
   * Reset zero-cross and peak tracking (e.g., when stopping)
   */
  reset(): void {
    this.previousZeroCrossIndex = null;
    this.previousPeakIndex = null;
  }
}
