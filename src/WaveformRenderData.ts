/**
 * WaveformRenderData - Complete data structure for waveform rendering
 * 
 * This interface represents all the information needed to render a waveform frame.
 * It separates data generation logic from rendering logic, making it possible
 * to implement the data generation part in other languages (e.g., Rust WASM).
 */
export interface WaveformRenderData {
  // Waveform data
  /** Complete waveform data buffer */
  waveformData: Float32Array;
  
  /** Start index of the region to display */
  displayStartIndex: number;
  
  /** End index of the region to display (exclusive) */
  displayEndIndex: number;
  
  /** Auto-gain multiplier for waveform amplitude */
  gain: number;
  
  // Frequency information
  /** Estimated fundamental frequency in Hz */
  estimatedFrequency: number;
  
  /** Sample rate in Hz */
  sampleRate: number;
  
  /** FFT size used for analysis */
  fftSize: number;
  
  // Zero-cross / alignment information
  /** First zero-cross or peak alignment point (may be undefined if not found) */
  firstAlignmentPoint?: number;
  
  /** Second zero-cross or peak alignment point (may be undefined if not found) */
  secondAlignmentPoint?: number;
  
  // FFT spectrum data (optional, only if FFT display is enabled)
  /** FFT frequency data for spectrum display */
  frequencyData?: Uint8Array;
  
  /** Whether signal is above noise gate threshold (affects FFT display) */
  isSignalAboveNoiseGate: boolean;
  
  /** Maximum frequency for FFT display */
  maxFrequency: number;
  
  // Waveform search information
  /** Previous frame's waveform for comparison (null if not available) */
  previousWaveform: Float32Array | null;
  
  /** Similarity score between current and previous waveform (-1 to +1) */
  similarity: number;
  
  /** Whether similarity search was used for alignment */
  usedSimilaritySearch: boolean;
}
