/**
 * Utility functions for threshold conversions and audio processing
 */

/**
 * Convert dB value to amplitude (linear)
 * @param db - Decibel value (typically -60 to 0)
 * @returns Amplitude value (typically 0.001 to 1.0)
 */
export function dbToAmplitude(db: number): number {
  return Math.pow(10, db / 20);
}

/**
 * Convert frequency to musical note name and cent deviation
 * @param frequency - Frequency in Hz
 * @returns Object with note name (e.g., "A4") and cent deviation (e.g., 0), or null if frequency is invalid
 */
export function frequencyToNote(frequency: number): { noteName: string; cents: number } | null {
  if (frequency <= 0 || !isFinite(frequency)) {
    return null;
  }

  // A4 = 440 Hz is our reference
  const A4 = 440;
  const C0 = A4 * Math.pow(2, -4.75); // C0 frequency

  // Calculate the number of half steps from C0
  const halfSteps = 12 * Math.log2(frequency / C0);
  
  // Round to nearest half step to get the note
  const noteIndex = Math.round(halfSteps);
  
  // Calculate cent deviation from the nearest note (-50 to +50)
  const cents = Math.round((halfSteps - noteIndex) * 100);
  
  // Note names in chromatic scale
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Calculate octave and note name
  const octave = Math.floor(noteIndex / 12);
  const note = noteNames[noteIndex % 12];
  
  return {
    noteName: `${note}${octave}`,
    cents: cents
  };
}

/**
 * Silence threshold in dB relative to peak amplitude
 * Samples below this level relative to the peak are considered silence
 */
const SILENCE_THRESHOLD_DB = -48;

/**
 * Trim silence from the beginning and end of an AudioBuffer
 * The threshold is calculated as -48dB relative to the peak amplitude of the entire buffer
 * @param audioBuffer - The audio buffer to trim
 * @returns A new AudioBuffer with silence trimmed, or the original if no trimming is needed
 */
export function trimSilence(audioBuffer: AudioBuffer): AudioBuffer {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;
  
  // Cache channel data for reuse and calculate peak amplitude
  const channelDataCache: Float32Array[] = [];
  let peakAmplitude = 0;
  
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const data = audioBuffer.getChannelData(channel);
    channelDataCache.push(data);
    
    for (let i = 0; i < length; i++) {
      const amplitude = Math.abs(data[i]);
      if (amplitude > peakAmplitude) {
        peakAmplitude = amplitude;
      }
    }
  }
  
  // If the entire buffer is silent (peak is zero), return the original
  if (peakAmplitude === 0) {
    return audioBuffer;
  }
  
  // Calculate threshold as SILENCE_THRESHOLD_DB relative to peak amplitude
  const threshold = peakAmplitude * Math.pow(10, SILENCE_THRESHOLD_DB / 20);
  
  // Find the start index (first non-silent sample across all channels)
  let startIndex = length; // Initialize to length to detect if no non-silent sample found
  for (let i = 0; i < length; i++) {
    let isSilent = true;
    for (let channel = 0; channel < numberOfChannels; channel++) {
      if (Math.abs(channelDataCache[channel][i]) > threshold) {
        isSilent = false;
        break;
      }
    }
    if (!isSilent) {
      startIndex = i;
      break;
    }
  }
  
  // If entire buffer is silent, return the original
  if (startIndex >= length) {
    return audioBuffer;
  }
  
  // Find the end index (last non-silent sample across all channels)
  let endIndex = length - 1;
  for (let i = length - 1; i >= startIndex; i--) {
    let isSilent = true;
    for (let channel = 0; channel < numberOfChannels; channel++) {
      if (Math.abs(channelDataCache[channel][i]) > threshold) {
        isSilent = false;
        break;
      }
    }
    if (!isSilent) {
      endIndex = i;
      break;
    }
  }
  
  // If no trimming is needed, return the original
  if (startIndex === 0 && endIndex === length - 1) {
    return audioBuffer;
  }
  
  // Create a new buffer with the trimmed length
  const trimmedLength = endIndex - startIndex + 1;
  const trimmedBuffer = new AudioBuffer({
    numberOfChannels: numberOfChannels,
    length: trimmedLength,
    sampleRate: sampleRate
  });
  
  // Copy the non-silent samples to the new buffer
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const sourceData = channelDataCache[channel];
    const destData = trimmedBuffer.getChannelData(channel);
    for (let i = 0; i < trimmedLength; i++) {
      destData[i] = sourceData[startIndex + i];
    }
  }
  
  return trimmedBuffer;
}
