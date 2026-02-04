/**
 * FrameBufferHistory - Manages history of frame buffers for extended FFT
 * Responsible for:
 * - Storing past frame buffers
 * - Providing concatenated buffers with specified multiplier
 * - Efficient buffer reuse to avoid allocations
 */
export declare class FrameBufferHistory {
    private frameBufferHistory;
    private readonly MAX_FRAME_HISTORY;
    /**
     * Update frame buffer history with the current frame
     * Reuses existing buffers to avoid allocating a new Float32Array every frame
     */
    updateHistory(currentBuffer: Float32Array): void;
    /**
     * Get extended time-domain data by concatenating past frame buffers
     * @param multiplier - Buffer size multiplier (1, 4, or 16)
     * @param currentBuffer - Current frame buffer for 1x multiplier
     * @returns Combined buffer or null if insufficient history
     */
    getExtendedBuffer(multiplier: 1 | 4 | 16, currentBuffer: Float32Array | null): Float32Array | null;
    /**
     * Clear frame buffer history
     */
    clear(): void;
}
//# sourceMappingURL=FrameBufferHistory.d.ts.map