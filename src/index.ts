/**
 * cat-oscilloscope - Browser-based oscilloscope-like waveform visualizer
 * Library entry point for importing as a module
 */

// Main Oscilloscope class - primary export
export { Oscilloscope } from './Oscilloscope';

// Core modules - for advanced usage
export { AudioManager } from './AudioManager';
export { GainController } from './GainController';
export { FrequencyEstimator } from './FrequencyEstimator';
export { WaveformRenderer } from './WaveformRenderer';
export { ZeroCrossDetector } from './ZeroCrossDetector';
export { WaveformSearcher } from './WaveformSearcher';
export { ComparisonPanelRenderer } from './ComparisonPanelRenderer';
export { PianoKeyboardRenderer } from './PianoKeyboardRenderer';

// BufferSource - for static buffer visualization
export { BufferSource } from './BufferSource';

// Data processing and types - for Rust WASM integration
export { WaveformDataProcessor } from './WaveformDataProcessor';
export type { WaveformRenderData } from './WaveformRenderData';

// Utility functions
export { dbToAmplitude, amplitudeToDb, trimSilence } from './utils';
