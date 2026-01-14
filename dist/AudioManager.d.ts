import { BufferSource } from './BufferSource';
/**
 * AudioManager handles Web Audio API integration
 * Responsible for:
 * - AudioContext lifecycle management
 * - MediaStream management
 * - AnalyserNode configuration
 * - Audio data retrieval
 * - BufferSource support for static buffer visualization
 */
export declare class AudioManager {
    private audioContext;
    private analyser;
    private mediaStream;
    private audioBufferSource;
    private bufferSource;
    private dataArray;
    private frequencyData;
    private frameBufferHistory;
    private readonly MAX_FRAME_HISTORY;
    /**
     * Initialize analyser node and data arrays
     */
    private initializeAnalyser;
    /**
     * Start audio capture and analysis
     */
    start(): Promise<void>;
    /**
     * Start audio playback from file
     */
    startFromFile(file: File): Promise<void>;
    /**
     * Start visualization from a static buffer without audio playback
     * Useful for visualizing pre-recorded audio data or processing results
     * @param bufferSource - BufferSource instance containing audio data
     */
    startFromBuffer(bufferSource: BufferSource): Promise<void>;
    /**
     * Stop audio capture and clean up resources
     */
    stop(): Promise<void>;
    /**
     * Get time-domain data (waveform)
     * Also updates the frame buffer history for extended FFT
     */
    getTimeDomainData(): Float32Array | null;
    /**
     * Update frame buffer history with the current frame
     * Reuses existing buffers to avoid allocating a new Float32Array every frame
     */
    private updateFrameBufferHistory;
    /**
     * Get extended time-domain data by concatenating past frame buffers
     * @param multiplier - Buffer size multiplier (1, 4, or 16)
     * @returns Combined buffer or null if insufficient history
     */
    getExtendedTimeDomainData(multiplier: 1 | 4 | 16): Float32Array | null;
    /**
     * Clear frame buffer history
     */
    clearFrameBufferHistory(): void;
    /**
     * Get frequency-domain data (FFT)
     * In buffer mode, FFT is computed from time-domain data
     */
    getFrequencyData(): Uint8Array | null;
    /**
     * Get sample rate
     */
    getSampleRate(): number;
    /**
     * Get FFT size
     */
    getFFTSize(): number;
    /**
     * Get frequency bin count
     */
    getFrequencyBinCount(): number;
    /**
     * Check if audio system is ready
     */
    isReady(): boolean;
}
