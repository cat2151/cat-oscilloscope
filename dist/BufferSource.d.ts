/**
 * BufferSource provides audio data from a static buffer (Float32Array or AudioBuffer)
 * without requiring audio playback through the Web Audio API.
 * This is useful for visualizing pre-recorded audio data or processing results.
 */
export declare class BufferSource {
    private buffer;
    private sampleRate;
    private position;
    private chunkSize;
    private isLooping;
    /**
     * Create a BufferSource from Float32Array
     * @param buffer - Audio data as Float32Array (values typically in range -1.0 to 1.0)
     * @param sampleRate - Sample rate in Hz (e.g., 44100, 48000)
     * @param options - Optional configuration
     */
    constructor(buffer: Float32Array, sampleRate: number, options?: {
        chunkSize?: number;
        loop?: boolean;
    });
    /**
     * Create a BufferSource from AudioBuffer
     * @param audioBuffer - Web Audio API AudioBuffer
     * @param options - Optional configuration
     */
    static fromAudioBuffer(audioBuffer: AudioBuffer, options?: {
        chunkSize?: number;
        loop?: boolean;
        channel?: number;
    }): BufferSource;
    /**
     * Get the next chunk of audio data
     * @returns Float32Array chunk or null if end is reached and not looping
     */
    getNextChunk(): Float32Array | null;
    /**
     * Reset playback position to the beginning
     */
    reset(): void;
    /**
     * Seek to a specific position in the buffer
     * @param positionInSamples - Position in samples
     */
    seek(positionInSamples: number): void;
    /**
     * Get current position in samples
     */
    getPosition(): number;
    /**
     * Get total buffer length in samples
     */
    getLength(): number;
    /**
     * Get sample rate
     */
    getSampleRate(): number;
    /**
     * Set chunk size
     */
    setChunkSize(size: number): void;
    /**
     * Get chunk size
     */
    getChunkSize(): number;
    /**
     * Set looping mode
     */
    setLooping(loop: boolean): void;
    /**
     * Get looping mode
     */
    isLoop(): boolean;
    /**
     * Check if end of buffer is reached
     */
    isAtEnd(): boolean;
}
//# sourceMappingURL=BufferSource.d.ts.map