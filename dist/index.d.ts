/**
 * cat-oscilloscope - Browser-based oscilloscope-like waveform visualizer
 * Library entry point for importing as a module
 */
export { Oscilloscope } from './Oscilloscope';
export { AudioManager } from './AudioManager';
export { GainController } from './GainController';
export { FrequencyEstimator } from './FrequencyEstimator';
export { WaveformRenderer } from './WaveformRenderer';
export { ZeroCrossDetector } from './ZeroCrossDetector';
export { WaveformSearcher } from './WaveformSearcher';
export { ComparisonPanelRenderer } from './ComparisonPanelRenderer';
export { CycleSimilarityRenderer } from './CycleSimilarityRenderer';
export { PianoKeyboardRenderer } from './PianoKeyboardRenderer';
export { BufferSource } from './BufferSource';
export { WaveformDataProcessor } from './WaveformDataProcessor';
export type { WaveformRenderData } from './WaveformRenderData';
export type { OverlayPosition, OverlaySize, OverlayLayout, OverlaysLayoutConfig } from './OverlayLayout';
export { DEFAULT_OVERLAYS_LAYOUT, resolveValue } from './OverlayLayout';
export { dbToAmplitude, amplitudeToDb, trimSilence } from './utils';
//# sourceMappingURL=index.d.ts.map