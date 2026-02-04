/**
 * FrameBufferHistory - Manages history of frame buffers for extended FFT
 * Responsible for:
 * - Storing past frame buffers
 * - Providing concatenated buffers with specified multiplier
 * - Efficient buffer reuse to avoid allocations in updateHistory
 */
export class FrameBufferHistory {
  private frameBufferHistory: Float32Array[] = [];
  private readonly MAX_FRAME_HISTORY = 16; // Support up to 16x buffer size
  private extendedBufferCache: Map<number, Float32Array> = new Map(); // Cache for reused extended buffers

  /**
   * Update frame buffer history with the current frame
   * Reuses existing buffers to avoid allocating a new Float32Array every frame
   */
  updateHistory(currentBuffer: Float32Array): void {
    let buffer: Float32Array;

    if (this.frameBufferHistory.length < this.MAX_FRAME_HISTORY) {
      // Warm-up phase: allocate new buffers until we reach MAX_FRAME_HISTORY
      buffer = new Float32Array(currentBuffer.length);
    } else {
      // Steady state: reuse the oldest buffer
      buffer = this.frameBufferHistory.shift() as Float32Array;
      // If FFT size (and thus buffer length) has changed, reallocate
      if (buffer.length !== currentBuffer.length) {
        buffer = new Float32Array(currentBuffer.length);
      }
    }

    // Copy current data into the buffer
    buffer.set(currentBuffer);

    // Add updated buffer as most recent
    this.frameBufferHistory.push(buffer);
  }

  /**
   * Get extended time-domain data by concatenating past frame buffers
   * Reuses cached buffers to avoid allocation on every call
   * @param multiplier - Buffer size multiplier (1, 4, or 16)
   * @param currentBuffer - Current frame buffer for 1x multiplier
   * @returns Combined buffer or null if insufficient history
   */
  getExtendedBuffer(multiplier: 1 | 4 | 16, currentBuffer: Float32Array | null): Float32Array | null {
    if (multiplier === 1) {
      // Return current buffer for 1x
      return currentBuffer;
    }

    if (!currentBuffer || this.frameBufferHistory.length < multiplier) {
      return null; // Not enough history yet
    }

    // Get the most recent 'multiplier' buffers
    const recentBuffers = this.frameBufferHistory.slice(-multiplier);

    // Calculate total length
    const totalLength = recentBuffers.reduce((sum, buf) => sum + buf.length, 0);
    
    // Get or create cached buffer
    let extendedBuffer = this.extendedBufferCache.get(multiplier);
    if (!extendedBuffer || extendedBuffer.length !== totalLength) {
      // Allocate new buffer only if size changed or doesn't exist
      extendedBuffer = new Float32Array(totalLength);
      this.extendedBufferCache.set(multiplier, extendedBuffer);
    }

    // Concatenate buffers into the cached buffer
    let offset = 0;
    for (const buffer of recentBuffers) {
      extendedBuffer.set(buffer, offset);
      offset += buffer.length;
    }

    return extendedBuffer;
  }

  /**
   * Clear frame buffer history
   */
  clear(): void {
    this.frameBufferHistory = [];
    this.extendedBufferCache.clear();
  }
}
