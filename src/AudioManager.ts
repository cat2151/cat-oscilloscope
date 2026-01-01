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
      
      // Create analyser node with high resolution
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 4096; // Higher resolution for better waveform
      this.analyser.smoothingTimeConstant = 0; // No smoothing for accurate waveform
      
      // Connect nodes
      source.connect(this.analyser);
      
      // Create data array for time domain data
      const bufferLength = this.analyser.fftSize;
      this.dataArray = new Float32Array(bufferLength);
      
      // Create frequency data array for FFT
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
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
      
      // Set up Web Audio API
      this.audioContext = new AudioContext();
      
      // Decode audio data
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // Create analyser node with high resolution
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 4096; // Higher resolution for better waveform
      this.analyser.smoothingTimeConstant = 0; // No smoothing for accurate waveform
      
      // Create buffer source for looping playback
      this.audioBufferSource = this.audioContext.createBufferSource();
      this.audioBufferSource.buffer = audioBuffer;
      this.audioBufferSource.loop = true;
      
      // Connect nodes: source -> analyser -> destination
      this.audioBufferSource.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
      // Start playback
      this.audioBufferSource.start(0);
      
      // Create data array for time domain data
      const bufferLength = this.analyser.fftSize;
      this.dataArray = new Float32Array(bufferLength);
      
      // Create frequency data array for FFT
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
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
        this.audioBufferSource.disconnect();
      } catch (error) {
        // Ignore error if already stopped, but still try to disconnect
        try {
          this.audioBufferSource.disconnect();
        } catch (disconnectError) {
          // Ignore disconnect errors
        }
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
  }

  /**
   * Get time-domain data (waveform)
   */
  getTimeDomainData(): Float32Array | null {
    if (!this.analyser || !this.dataArray) {
      return null;
    }
    // @ts-ignore - Web Audio API type definitions issue
    this.analyser.getFloatTimeDomainData(this.dataArray);
    return this.dataArray;
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
