/**
 * Utility functions for threshold conversions
 */

/**
 * Convert dB value to amplitude (linear)
 * @param db - Decibel value (typically -60 to 0)
 * @returns Amplitude value (typically 0.001 to 1.0)
 */
export function dbToAmplitude(db: number): number {
  return Math.pow(10, db / 20);
}
