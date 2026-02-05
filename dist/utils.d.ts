/**
 * Utility functions for threshold conversions and audio processing
 */
/**
 * Convert dB value to amplitude (linear)
 * @param db - Decibel value (typically -60 to 0)
 * @returns Amplitude value (typically 0.001 to 1.0)
 */
export declare function dbToAmplitude(db: number): number;
/**
 * Convert amplitude (linear) to dB value
 * @param amplitude - Amplitude value (typically 0.001 to infinity)
 * @returns Decibel value
 */
export declare function amplitudeToDb(amplitude: number): number;
/**
 * Convert frequency to musical note name and cent deviation
 * @param frequency - Frequency in Hz
 * @returns Object with note name (e.g., "A4") and cent deviation (e.g., 0), or null if frequency is invalid
 */
export declare function frequencyToNote(frequency: number): {
    noteName: string;
    cents: number;
} | null;
/**
 * Trim silence from the beginning and end of an AudioBuffer
 * The threshold is calculated as -48dB relative to the peak amplitude of the entire buffer
 * @param audioBuffer - The audio buffer to trim
 * @returns A new AudioBuffer with silence trimmed, or the original if no trimming is needed
 */
export declare function trimSilence(audioBuffer: AudioBuffer): AudioBuffer;
