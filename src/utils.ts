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

/**
 * Trim silence from the beginning and end of an AudioBuffer
 * @param audioBuffer - The audio buffer to trim
 * @param threshold - Amplitude threshold for silence detection (default: 0.01, i.e., -40dB)
 * @returns A new AudioBuffer with silence trimmed, or the original if no trimming is needed
 */
export function trimSilence(audioBuffer: AudioBuffer, threshold: number = 0.01): AudioBuffer {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;
  
  // Find the start index (first non-silent sample across all channels)
  let startIndex = length; // Initialize to length to detect if no non-silent sample found
  for (let i = 0; i < length; i++) {
    let isSilent = true;
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const data = audioBuffer.getChannelData(channel);
      if (Math.abs(data[i]) > threshold) {
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
      const data = audioBuffer.getChannelData(channel);
      if (Math.abs(data[i]) > threshold) {
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
    const sourceData = audioBuffer.getChannelData(channel);
    const destData = trimmedBuffer.getChannelData(channel);
    for (let i = 0; i < trimmedLength; i++) {
      destData[i] = sourceData[startIndex + i];
    }
  }
  
  return trimmedBuffer;
}
