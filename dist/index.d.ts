/**
 * cat-oscilloscope - Browser-based oscilloscope-like waveform visualizer
 * Library entry point for importing as a module
 */
export { Oscilloscope } from './Oscilloscope';
export type { AlignmentMode } from './ZeroCrossDetector';
export { AudioManager } from './AudioManager';
export { GainController } from './GainController';
export { FrequencyEstimator } from './FrequencyEstimator';
export { WaveformRenderer } from './WaveformRenderer';
export { ZeroCrossDetector } from './ZeroCrossDetector';
export { WaveformSearcher } from './WaveformSearcher';
export { ComparisonPanelRenderer } from './ComparisonPanelRenderer';
export { PianoKeyboardRenderer } from './PianoKeyboardRenderer';
export { BufferSource } from './BufferSource';
export { WaveformDataProcessor } from './WaveformDataProcessor';
export type { WaveformRenderData } from './WaveformRenderData';
export { dbToAmplitude, amplitudeToDb, trimSilence } from './utils';
