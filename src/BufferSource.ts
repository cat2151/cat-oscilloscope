/**
 * BufferSource provides audio data from a static buffer (Float32Array or AudioBuffer)
 * without requiring audio playback through the Web Audio API.
 * 
 * This is useful for:
 * - Visualizing pre-recorded audio data
 * - Processing results from audio analysis libraries
 * - Creating oscilloscope visualizations without audio playback
 * - Integration with audio processing libraries (e.g., wavlpf)
 * 
 * Feature Parity:
 * BufferSource mode supports ALL oscilloscope features that microphone/file modes support:
 * - ✅ Frequency estimation (Zero-Crossing, Autocorrelation, FFT, STFT, CQT)
 * - ✅ FFT spectrum display overlay
 * - ✅ Harmonic analysis
 * - ✅ Auto-gain and noise gate
 * - ✅ Waveform similarity detection
 * - ✅ Phase markers and cycle visualization
 * 
 * The difference is only in implementation:
 * - Microphone/file: Uses Web Audio API's AnalyserNode (hardware-accelerated FFT)
 * - BufferSource: Computes FFT in WASM when needed (pure software implementation)
 * 
 * Both approaches produce identical visualization results.
 */
export class BufferSource {
  private buffer: Float32Array;
  private sampleRate: number;
  private position: number = 0;
  private chunkSize: number = 4096; // Default FFT size
  private isLooping: boolean = false;

  /**
   * Create a BufferSource from Float32Array
   * @param buffer - Audio data as Float32Array (values typically in range -1.0 to 1.0)
   * @param sampleRate - Sample rate in Hz (e.g., 44100, 48000)
   * @param options - Optional configuration
   */
  constructor(
    buffer: Float32Array,
    sampleRate: number,
    options?: {
      chunkSize?: number;
      loop?: boolean;
    }
  ) {
    // Validate sample rate
    if (sampleRate <= 0 || !isFinite(sampleRate)) {
      throw new Error('Sample rate must be a positive finite number');
    }
    
    this.buffer = buffer;
    this.sampleRate = sampleRate;
    
    if (options?.chunkSize !== undefined) {
      // Validate chunk size
      if (options.chunkSize <= 0 || !isFinite(options.chunkSize) || !Number.isInteger(options.chunkSize)) {
        throw new Error('Chunk size must be a positive integer');
      }
      this.chunkSize = options.chunkSize;
    }
    
    if (options?.loop !== undefined) {
      this.isLooping = options.loop;
    }
  }

  /**
   * Create a BufferSource from AudioBuffer
   * @param audioBuffer - Web Audio API AudioBuffer
   * @param options - Optional configuration
   */
  static fromAudioBuffer(
    audioBuffer: AudioBuffer,
    options?: {
      chunkSize?: number;
      loop?: boolean;
      channel?: number;
    }
  ): BufferSource {
    const channelIndex = options?.channel ?? 0;
    
    // Validate channel index
    if (channelIndex < 0 || channelIndex >= audioBuffer.numberOfChannels) {
      throw new Error(
        `Invalid channel index ${channelIndex}. AudioBuffer has ${audioBuffer.numberOfChannels} channel(s).`
      );
    }
    
    const channelData = audioBuffer.getChannelData(channelIndex);
    
    return new BufferSource(channelData, audioBuffer.sampleRate, {
      chunkSize: options?.chunkSize,
      loop: options?.loop
    });
  }

  /**
   * Get the next chunk of audio data
   * @returns Float32Array chunk or null if end is reached and not looping
   */
  getNextChunk(): Float32Array | null {
    // Handle empty buffer case - return null even in loop mode to prevent infinite loop
    if (this.buffer.length === 0) {
      return null;
    }
    
    if (this.position >= this.buffer.length) {
      if (this.isLooping) {
        this.position = 0;
      } else {
        return null;
      }
    }

    const endPosition = Math.min(this.position + this.chunkSize, this.buffer.length);
    const chunk = this.buffer.slice(this.position, endPosition);
    
    // If chunk is smaller than chunkSize and we're looping, wrap around
    if (chunk.length < this.chunkSize && this.isLooping) {
      const remaining = this.chunkSize - chunk.length;
      // Ensure we don't try to read more than buffer length when wrapping
      const wrapAmount = Math.min(remaining, this.buffer.length);
      const wrappedChunk = new Float32Array(this.chunkSize);
      wrappedChunk.set(chunk, 0);
      wrappedChunk.set(this.buffer.slice(0, wrapAmount), chunk.length);
      this.position = wrapAmount;
      return wrappedChunk;
    }
    
    this.position = endPosition;
    
    // If chunk is smaller than expected and we're not looping, pad with zeros
    if (chunk.length < this.chunkSize) {
      const paddedChunk = new Float32Array(this.chunkSize);
      paddedChunk.set(chunk, 0);
      return paddedChunk;
    }
    
    return chunk;
  }

  /**
   * Reset playback position to the beginning
   */
  reset(): void {
    this.position = 0;
  }

  /**
   * Seek to a specific position in the buffer
   * @param positionInSamples - Position in samples
   */
  seek(positionInSamples: number): void {
    this.position = Math.max(0, Math.min(positionInSamples, this.buffer.length));
  }

  /**
   * Get current position in samples
   */
  getPosition(): number {
    return this.position;
  }

  /**
   * Get total buffer length in samples
   */
  getLength(): number {
    return this.buffer.length;
  }

  /**
   * Get sample rate
   */
  getSampleRate(): number {
    return this.sampleRate;
  }

  /**
   * Set chunk size
   */
  setChunkSize(size: number): void {
    // Validate chunk size
    if (size <= 0 || !isFinite(size) || !Number.isInteger(size)) {
      throw new Error('Chunk size must be a positive integer');
    }
    this.chunkSize = size;
  }

  /**
   * Get chunk size
   */
  getChunkSize(): number {
    return this.chunkSize;
  }

  /**
   * Set looping mode
   */
  setLooping(loop: boolean): void {
    this.isLooping = loop;
  }

  /**
   * Get looping mode
   */
  isLoop(): boolean {
    return this.isLooping;
  }

  /**
   * Check if end of buffer is reached
   */
  isAtEnd(): boolean {
    return this.position >= this.buffer.length && !this.isLooping;
  }
}
