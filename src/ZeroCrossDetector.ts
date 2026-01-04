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
  private readonly MAX_CANDIDATE_CYCLES = 4; // Search up to 4 cycles ahead for best candidate
  private lastSimilarityScores: number[] = []; // Store last similarity scores for UI display
  private usePeakMode: boolean = false; // Use peak detection instead of zero-crossing
  private debugDataEnabled: boolean = false; // Enable debug data collection to reduce memory overhead
  
  // Debug information for visualization
  private lastCandidates: number[] = []; // All zero-cross/peak candidates found
  private lastReferenceData: Float32Array | null = null; // Reference waveform (previous frame's 0-2π)
  private lastReferenceStartIndex: number = 0; // Start index of reference waveform in previous buffer
  private lastSearchBuffer: Float32Array | null = null; // Full search buffer for current frame

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
   * Set whether to enable debug data collection
   * When enabled, stores search buffer and reference data for visualization (increases memory usage)
   */
  setDebugDataEnabled(enabled: boolean): void {
    this.debugDataEnabled = enabled;
  }

  /**
   * Get whether debug data collection is enabled
   */
  getDebugDataEnabled(): boolean {
    return this.debugDataEnabled;
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
   * Calculate waveform similarity score between two regions
   * Returns a correlation coefficient between -1 and 1 (higher is more similar)
   */
  private calculateWaveformSimilarity(
    data: Float32Array,
    index1: number,
    index2: number,
    compareLength: number
  ): number {
    // Ensure we don't go out of bounds
    const maxLength = Math.min(
      compareLength,
      data.length - index1,
      data.length - index2
    );
    
    if (maxLength <= 0) {
      return -1;
    }

    // Calculate correlation coefficient
    let sum1 = 0;
    let sum2 = 0;
    let sum1Sq = 0;
    let sum2Sq = 0;
    let sumProduct = 0;
    
    for (let i = 0; i < maxLength; i++) {
      const val1 = data[index1 + i];
      const val2 = data[index2 + i];
      sum1 += val1;
      sum2 += val2;
      sum1Sq += val1 * val1;
      sum2Sq += val2 * val2;
      sumProduct += val1 * val2;
    }
    
    // Pearson correlation coefficient
    const numerator = maxLength * sumProduct - sum1 * sum2;
    const denominator = Math.sqrt(
      (maxLength * sum1Sq - sum1 * sum1) * (maxLength * sum2Sq - sum2 * sum2)
    );
    
    if (denominator === 0) {
      return 0;
    }
    
    return numerator / denominator;
  }

  /**
   * Find all zero-cross candidates after startIndex, up to maxCycles ahead
   */
  private findZeroCrossCandidates(
    data: Float32Array,
    startIndex: number,
    maxCycles: number
  ): number[] {
    const candidates: number[] = [];
    let currentIndex = startIndex;
    
    for (let cycle = 0; cycle < maxCycles; cycle++) {
      const nextZeroCross = this.findNextZeroCross(data, currentIndex);
      if (nextZeroCross === -1) {
        break;
      }
      candidates.push(nextZeroCross);
      currentIndex = nextZeroCross;
    }
    
    return candidates;
  }

  /**
   * Select the best zero-cross candidate based on waveform pattern matching
   * Compares each candidate against the reference position (previous display value)
   */
  private selectBestCandidate(
    data: Float32Array,
    candidates: number[],
    cycleLength: number,
    referenceIndex: number | null
  ): number {
    if (candidates.length === 0) {
      return -1;
    }
    
    if (candidates.length === 1) {
      return candidates[0];
    }
    
    // Validate cycleLength to avoid division by zero or invalid comparison lengths
    if (cycleLength <= 0) {
      return candidates[0];
    }
    
    // If no reference position, return first candidate
    if (referenceIndex === null || referenceIndex < 0) {
      return candidates[0];
    }
    
    // Compare each candidate with the reference position (previous display value)
    let bestCandidate = candidates[0];
    let bestScore = -Infinity;
    
    const compareLength = Math.floor(cycleLength * 1.5); // Compare 1.5 cycles
    
    // For debugging: store all similarity scores
    const similarityScores: number[] = [];
    
    for (let i = 0; i < candidates.length; i++) {
      const currentCandidate = candidates[i];
      
      // Calculate similarity between this candidate and the reference position
      const similarity = this.calculateWaveformSimilarity(
        data,
        referenceIndex,
        currentCandidate,
        compareLength
      );
      
      similarityScores.push(similarity);
      
      if (similarity > bestScore) {
        bestScore = similarity;
        bestCandidate = currentCandidate;
      }
    }
    
    // Store similarity scores for UI display
    this.lastSimilarityScores = similarityScores;
    
    return bestCandidate;
  }
  
  /**
   * Get the last computed similarity scores for UI display
   */
  getSimilarityScores(): number[] {
    return this.lastSimilarityScores;
  }

  /**
   * Get all candidates found in the last calculation for debug visualization
   */
  getLastCandidates(): number[] {
    return this.lastCandidates;
  }

  /**
   * Get reference waveform data (previous frame's 0-2π) for debug visualization
   * @returns Object containing the reference waveform data and its start index in the original buffer.
   *          The startIndex indicates where in the previous frame's buffer the reference segment began,
   *          which can be useful for advanced debugging scenarios where absolute positioning is needed.
   */
  getLastReferenceData(): { data: Float32Array | null; startIndex: number } {
    return {
      data: this.lastReferenceData,
      startIndex: this.lastReferenceStartIndex
    };
  }

  /**
   * Get the full search buffer for debug visualization
   */
  getLastSearchBuffer(): Float32Array | null {
    return this.lastSearchBuffer;
  }

  /**
   * Find all peak candidates after startIndex, up to maxCycles ahead
   */
  private findPeakCandidates(
    data: Float32Array,
    startIndex: number,
    cycleLength: number,
    maxCycles: number
  ): number[] {
    const candidates: number[] = [];
    let currentIndex = startIndex;
    
    for (let cycle = 0; cycle < maxCycles; cycle++) {
      const nextPeak = this.findNextPeak(data, currentIndex, cycleLength);
      if (nextPeak === -1) {
        break;
      }
      candidates.push(nextPeak);
      currentIndex = nextPeak;
    }
    
    return candidates;
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
        const nearExpectedCandidate = this.findPeak(data, searchStart, searchEnd);
        
        // If we found a peak near expected position
        if (nearExpectedCandidate !== -1) {
          // Find candidates up to 4 cycles ahead
          const candidates = this.findPeakCandidates(
            data,
            nearExpectedCandidate,
            estimatedCycleLength,
            this.MAX_CANDIDATE_CYCLES
          );
          
          // Include the first candidate
          candidates.unshift(nearExpectedCandidate);
          
          // Store candidates for debug visualization
          this.lastCandidates = [...candidates];
          
          // Select the best candidate based on waveform pattern matching
          const selectedCandidate = this.selectBestCandidate(
            data,
            candidates,
            estimatedCycleLength,
            expectedIndex
          );
          
          if (selectedCandidate !== -1) {
            this.previousPeakIndex = selectedCandidate;
            return selectedCandidate;
          }
        }
      }
    }
    
    // No previous position or search failed - find first peak in initial portion
    const initialSearchLength = estimatedCycleLength > 0 
      ? Math.min(data.length, Math.floor(estimatedCycleLength * 2))
      : Math.min(data.length, 1000);
      
    const peak = this.findPeak(data, 0, initialSearchLength);
    if (peak !== -1) {
      // Also apply multi-cycle search for initial detection
      if (estimatedCycleLength > 0) {
        const candidates = this.findPeakCandidates(
          data,
          peak,
          estimatedCycleLength,
          this.MAX_CANDIDATE_CYCLES
        );
        candidates.unshift(peak);
        
        // Store candidates for debug visualization
        this.lastCandidates = [...candidates];
        
        // For initial detection, no reference position exists
        const selectedCandidate = this.selectBestCandidate(
          data,
          candidates,
          estimatedCycleLength,
          null
        );
        
        if (selectedCandidate !== -1) {
          this.previousPeakIndex = selectedCandidate;
          return selectedCandidate;
        }
      }
      
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
        let nearExpectedCandidate = -1;
        let bestDistance = Infinity;
        
        // Ensure we don't access out of bounds when checking data[i + 1]
        for (let i = searchStart; i < searchEnd && i < data.length - 1; i++) {
          if (data[i] <= 0 && data[i + 1] > 0) {
            const distance = Math.abs(i - expectedIndex);
            if (distance < bestDistance) {
              bestDistance = distance;
              nearExpectedCandidate = i;
            }
          }
        }
        
        // If we found a zero-crossing near expected position
        if (nearExpectedCandidate !== -1) {
          // Find candidates up to 4 cycles ahead
          const candidates = this.findZeroCrossCandidates(
            data,
            nearExpectedCandidate,
            this.MAX_CANDIDATE_CYCLES
          );
          
          // Include the first candidate
          candidates.unshift(nearExpectedCandidate);
          
          // Store candidates for debug visualization
          this.lastCandidates = [...candidates];
          
          // Select the best candidate based on waveform pattern matching
          // Compare against the previous display value (expectedIndex)
          const selectedCandidate = this.selectBestCandidate(
            data,
            candidates,
            estimatedCycleLength,
            expectedIndex
          );
          
          if (selectedCandidate !== -1) {
            this.previousZeroCrossIndex = selectedCandidate;
            return selectedCandidate;
          }
        }
      }
    }
    
    // No previous position or search failed - find first zero-crossing
    const zeroCross = this.findZeroCross(data, 0);
    if (zeroCross !== -1) {
      // Also apply multi-cycle search for initial detection
      if (estimatedCycleLength > 0) {
        const candidates = this.findZeroCrossCandidates(
          data,
          zeroCross,
          this.MAX_CANDIDATE_CYCLES
        );
        candidates.unshift(zeroCross);
        
        // Store candidates for debug visualization
        this.lastCandidates = [...candidates];
        
        // For initial detection, no reference position exists
        const selectedCandidate = this.selectBestCandidate(
          data,
          candidates,
          estimatedCycleLength,
          null
        );
        
        if (selectedCandidate !== -1) {
          this.previousZeroCrossIndex = selectedCandidate;
          return selectedCandidate;
        }
      }
      
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
    // Store search buffer for debug visualization (only when debug is enabled)
    // Note: We copy the data because the Web Audio API reuses the buffer on each frame
    if (this.debugDataEnabled) {
      this.lastSearchBuffer = new Float32Array(data);
    }
    
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
      
      // Store reference data for next frame (only when debug is enabled)
      if (this.debugDataEnabled) {
        this.lastReferenceData = data.slice(startIndex, endIndex);
        this.lastReferenceStartIndex = startIndex;
      }
      
      return {
        startIndex,
        endIndex,
        firstZeroCross: firstPeak, // Use peak position in place of zeroCross for API compatibility
      };
    }

    // Display from peak -π/8 to next peak +π/8
    const startIndex = Math.max(0, firstPeak - phasePadding);
    const endIndex = Math.min(data.length, secondPeak + phasePadding);
    
    // Store reference data for next frame (only when debug is enabled)
    if (this.debugDataEnabled) {
      this.lastReferenceData = data.slice(startIndex, endIndex);
      this.lastReferenceStartIndex = startIndex;
    }
    
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
    // Store search buffer for debug visualization (only when debug is enabled)
    // Note: We copy the data because the Web Audio API reuses the buffer on each frame
    if (this.debugDataEnabled) {
      this.lastSearchBuffer = new Float32Array(data);
    }
    
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
        
        // Store reference data for next frame (only when debug is enabled)
        if (this.debugDataEnabled) {
          this.lastReferenceData = data.slice(startIndex, endIndex);
          this.lastReferenceStartIndex = startIndex;
        }
        
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
      
      // Store reference data for next frame (only when debug is enabled)
      if (this.debugDataEnabled) {
        this.lastReferenceData = data.slice(startIndex, endIndex);
        this.lastReferenceStartIndex = startIndex;
      }
      
      return {
        startIndex,
        endIndex,
        firstZeroCross: firstZeroCross,
      };
    }

    // Display from phase -π/8 to phase 2π+π/8
    const startIndex = Math.max(0, firstZeroCross - phasePadding);
    const endIndex = Math.min(data.length, secondZeroCross + phasePadding);
    
    // Store reference data for next frame (only when debug is enabled)
    if (this.debugDataEnabled) {
      this.lastReferenceData = data.slice(startIndex, endIndex);
      this.lastReferenceStartIndex = startIndex;
    }
    
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
    this.lastCandidates = [];
    this.lastReferenceData = null;
    this.lastReferenceStartIndex = 0;
    this.lastSearchBuffer = null;
    this.lastSimilarityScores = [];
  }
}
