import { trimSilence } from './utils';

/**
 * AudioManager handles Web Audio API integration
 * Responsible for:
 * - AudioContext lifecycle management
 * - MediaStream management
 * - AnalyserNode configuration
 * - Audio data retrieval
 */
export class AudioManager {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private audioBufferSource: AudioBufferSourceNode | null = null;
  private dataArray: Float32Array | null = null;
  private frequencyData: Uint8Array | null = null;
  private frameBufferHistory: Float32Array[] = []; // History of frame buffers for extended FFT
  private readonly MAX_FRAME_HISTORY = 16; // Support up to 16x buffer size

  /**
   * Initialize analyser node and data arrays
   */
  private initializeAnalyser(): void {
    if (!this.audioContext) {
      throw new Error('AudioContext must be initialized before creating analyser');
    }

    // Create analyser node with high resolution
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 4096; // Higher resolution for better waveform
    this.analyser.smoothingTimeConstant = 0; // No smoothing for accurate waveform
    
    // Create data array for time domain data
    const bufferLength = this.analyser.fftSize;
    this.dataArray = new Float32Array(bufferLength);
    
    // Create frequency data array for FFT
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
  }

  /**
   * Start audio capture and analysis
   */
  async start(): Promise<void> {
    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Set up Web Audio API
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // Initialize analyser and data arrays
      this.initializeAnalyser();
      
      // Connect nodes
      source.connect(this.analyser!);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  /**
   * Start audio playback from file
   */
  async startFromFile(file: File): Promise<void> {
    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Close existing AudioContext if present to avoid resource leak
      if (this.audioContext && this.audioContext.state !== 'closed') {
        await this.audioContext.close();
      }

      // Set up Web Audio API
      this.audioContext = new AudioContext();
      
      // Decode audio data
      let audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // Trim silence from the beginning and end to avoid gaps in loop playback
      audioBuffer = trimSilence(audioBuffer);
      
      // Initialize analyser and data arrays
      this.initializeAnalyser();
      
      // Create buffer source for looping playback
      this.audioBufferSource = this.audioContext.createBufferSource();
      this.audioBufferSource.buffer = audioBuffer;
      this.audioBufferSource.loop = true;
      
      // Connect nodes: source -> analyser -> destination
      this.audioBufferSource.connect(this.analyser!);
      this.analyser!.connect(this.audioContext.destination);
      
      // Start playback
      this.audioBufferSource.start(0);
    } catch (error) {
      console.error('Error loading audio file:', error);
      throw error;
    }
  }

  /**
   * Stop audio capture and clean up resources
   */
  async stop(): Promise<void> {
    if (this.audioBufferSource) {
      try {
        this.audioBufferSource.stop();
      } catch (error) {
        // Ignore error if already stopped or in invalid state
      }
      try {
        this.audioBufferSource.disconnect();
      } catch (error) {
        // Ignore disconnect errors
      }
      this.audioBufferSource = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      try {
        await this.audioContext.close();
      } catch (error) {
        console.error('Error closing AudioContext:', error);
      }
      this.audioContext = null;
    }
    this.analyser = null;
    this.dataArray = null;
    this.frequencyData = null;
    this.clearFrameBufferHistory();
  }

  /**
   * Get time-domain data (waveform)
   * Also updates the frame buffer history for extended FFT
   */
  getTimeDomainData(): Float32Array | null {
    if (!this.analyser || !this.dataArray) {
      return null;
    }
    // @ts-ignore - Web Audio API type definitions issue
    this.analyser.getFloatTimeDomainData(this.dataArray);
    
    // Store a copy of the current frame buffer for history
    this.updateFrameBufferHistory(this.dataArray);
    
    return this.dataArray;
  }
  
  /**
   * Update frame buffer history with the current frame
   * Reuses existing buffers to avoid allocating a new Float32Array every frame
   */
  private updateFrameBufferHistory(currentBuffer: Float32Array): void {
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
   * @param multiplier - Buffer size multiplier (1, 4, or 16)
   * @returns Combined buffer or null if insufficient history
   */
  getExtendedTimeDomainData(multiplier: 1 | 4 | 16): Float32Array | null {
    if (multiplier === 1) {
      // Return current buffer for 1x
      return this.dataArray;
    }
    
    if (!this.dataArray || this.frameBufferHistory.length < multiplier) {
      return null; // Not enough history yet
    }
    
    // Get the most recent 'multiplier' buffers
    const recentBuffers = this.frameBufferHistory.slice(-multiplier);
    
    // Concatenate buffers
    const totalLength = recentBuffers.reduce((sum, buf) => sum + buf.length, 0);
    const extendedBuffer = new Float32Array(totalLength);
    
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
  clearFrameBufferHistory(): void {
    this.frameBufferHistory = [];
  }

  /**
   * Get frequency-domain data (FFT)
   */
  getFrequencyData(): Uint8Array | null {
    if (!this.analyser || !this.frequencyData) {
      return null;
    }
    // @ts-ignore - Web Audio API type definitions issue
    this.analyser.getByteFrequencyData(this.frequencyData);
    return this.frequencyData;
  }

  /**
   * Get sample rate
   */
  getSampleRate(): number {
    return this.audioContext?.sampleRate || 0;
  }

  /**
   * Get FFT size
   */
  getFFTSize(): number {
    return this.analyser?.fftSize || 0;
  }

  /**
   * Get frequency bin count
   */
  getFrequencyBinCount(): number {
    return this.analyser?.frequencyBinCount || 0;
  }

  /**
   * Check if audio system is ready
   */
  isReady(): boolean {
    return this.audioContext !== null && this.analyser !== null;
  }
}
