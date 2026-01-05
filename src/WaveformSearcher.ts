/**
 * WaveformSearcher handles waveform similarity search
 * Responsible for:
 * - Storing previous frame's waveform
 * - Searching for similar waveforms in current frame
 * - Calculating similarity scores (correlation coefficient -1 to +1)
 * - Finding optimal waveform position by sliding search
 */
export class WaveformSearcher {
  private previousWaveform: Float32Array | null = null;
  private lastSimilarity: number = 0;

  /**
   * Calculate similarity (correlation coefficient) between two waveforms
   * @param waveform1 First waveform
   * @param waveform2 Second waveform (must be same length as waveform1)
   * @returns Correlation coefficient from -1 to +1, or 0 if invalid
   */
  private calculateSimilarity(waveform1: Float32Array, waveform2: Float32Array): number {
    if (waveform1.length !== waveform2.length || waveform1.length === 0) {
      return 0;
    }

    const n = waveform1.length;
    
    // Calculate means
    let mean1 = 0;
    let mean2 = 0;
    for (let i = 0; i < n; i++) {
      mean1 += waveform1[i];
      mean2 += waveform2[i];
    }
    mean1 /= n;
    mean2 /= n;

    // Calculate correlation coefficient
    let numerator = 0;
    let sumSq1 = 0;
    let sumSq2 = 0;
    
    for (let i = 0; i < n; i++) {
      const diff1 = waveform1[i] - mean1;
      const diff2 = waveform2[i] - mean2;
      numerator += diff1 * diff2;
      sumSq1 += diff1 * diff1;
      sumSq2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(sumSq1 * sumSq2);
    
    if (denominator === 0) {
      return 0;
    }

    return numerator / denominator;
  }

  /**
   * Search for the most similar waveform in current frame by sliding search
   * @param currentFrame Current frame data
   * @param cycleLength Estimated cycle length in samples
   * @returns Object containing best match start index and similarity score, or null if no previous waveform
   */
  searchSimilarWaveform(currentFrame: Float32Array, cycleLength: number): {
    startIndex: number;
    similarity: number;
  } | null {
    // If no previous waveform, store current and return null
    if (this.previousWaveform === null || cycleLength <= 0) {
      return null;
    }

    const waveformLength = Math.floor(cycleLength);
    
    // Ensure we have enough data for at least one comparison
    if (currentFrame.length < waveformLength) {
      return null;
    }

    // Ensure previous waveform matches the expected length
    if (this.previousWaveform.length !== waveformLength) {
      return null;
    }

    let bestSimilarity = -2; // Lower than minimum possible value (-1)
    let bestStartIndex = 0;

    // Slide search: compare each position in current frame
    // Search range: from 0 to (cycleLength - 1) samples (total cycleLength positions)
    const searchEndIndex = Math.min(currentFrame.length - waveformLength, waveformLength - 1);
    
    for (let startIndex = 0; startIndex <= searchEndIndex; startIndex++) {
      // Extract candidate waveform
      const candidate = currentFrame.slice(startIndex, startIndex + waveformLength);
      
      // Calculate similarity
      const similarity = this.calculateSimilarity(this.previousWaveform, candidate);
      
      // Update best match
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestStartIndex = startIndex;
      }
    }

    this.lastSimilarity = bestSimilarity;
    
    return {
      startIndex: bestStartIndex,
      similarity: bestSimilarity,
    };
  }

  /**
   * Store waveform for next frame's comparison
   * @param data Source data array
   * @param startIndex Start index of waveform to store
   * @param endIndex End index of waveform to store (exclusive)
   */
  storeWaveform(data: Float32Array, startIndex: number, endIndex: number): void {
    const length = endIndex - startIndex;
    if (length <= 0 || startIndex < 0 || endIndex > data.length) {
      return;
    }

    // Create a copy of the waveform segment
    this.previousWaveform = data.slice(startIndex, endIndex);
  }

  /**
   * Get the last calculated similarity score
   * @returns Similarity score from -1 to +1, or 0 if not yet calculated
   */
  getLastSimilarity(): number {
    return this.lastSimilarity;
  }

  /**
   * Reset stored waveform (e.g., when stopping)
   */
  reset(): void {
    this.previousWaveform = null;
    this.lastSimilarity = 0;
  }

  /**
   * Check if a previous waveform is stored
   */
  hasPreviousWaveform(): boolean {
    return this.previousWaveform !== null;
  }

  /**
   * Get a copy of the previous waveform
   * @returns Copy of previous waveform or null if not available
   */
  getPreviousWaveform(): Float32Array | null {
    if (this.previousWaveform === null) {
      return null;
    }
    // Return a copy to prevent external modification
    return new Float32Array(this.previousWaveform);
  }
}
