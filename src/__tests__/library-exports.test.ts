/**
 * Simple library import test
 * This test verifies that the library exports can be imported correctly
 */
import { describe, it, expect } from 'vitest';
import {
  Oscilloscope,
  AudioManager,
  GainController,
  FrequencyEstimator,
  WaveformRenderer,
  ZeroCrossDetector,
  WaveformSearcher,
  ComparisonPanelRenderer,
  PianoKeyboardRenderer,
  WaveformDataProcessor,
  dbToAmplitude,
  trimSilence
} from '../index';

describe('Library exports', () => {
  it('should export Oscilloscope class', () => {
    expect(Oscilloscope).toBeDefined();
    expect(typeof Oscilloscope).toBe('function');
  });

  it('should export AudioManager class', () => {
    expect(AudioManager).toBeDefined();
    expect(typeof AudioManager).toBe('function');
  });

  it('should export GainController class', () => {
    expect(GainController).toBeDefined();
    expect(typeof GainController).toBe('function');
  });

  it('should export FrequencyEstimator class', () => {
    expect(FrequencyEstimator).toBeDefined();
    expect(typeof FrequencyEstimator).toBe('function');
  });

  it('should export WaveformRenderer class', () => {
    expect(WaveformRenderer).toBeDefined();
    expect(typeof WaveformRenderer).toBe('function');
  });

  it('should export ZeroCrossDetector class', () => {
    expect(ZeroCrossDetector).toBeDefined();
    expect(typeof ZeroCrossDetector).toBe('function');
  });

  it('should export WaveformSearcher class', () => {
    expect(WaveformSearcher).toBeDefined();
    expect(typeof WaveformSearcher).toBe('function');
  });

  it('should export ComparisonPanelRenderer class', () => {
    expect(ComparisonPanelRenderer).toBeDefined();
    expect(typeof ComparisonPanelRenderer).toBe('function');
  });

  it('should export PianoKeyboardRenderer class', () => {
    expect(PianoKeyboardRenderer).toBeDefined();
    expect(typeof PianoKeyboardRenderer).toBe('function');
  });

  it('should export WaveformDataProcessor class (new for Rust WASM)', () => {
    expect(WaveformDataProcessor).toBeDefined();
    expect(typeof WaveformDataProcessor).toBe('function');
  });

  it('should export dbToAmplitude utility function', () => {
    expect(dbToAmplitude).toBeDefined();
    expect(typeof dbToAmplitude).toBe('function');
    
    // Test the function works
    expect(dbToAmplitude(0)).toBe(1);
    expect(dbToAmplitude(-20)).toBeCloseTo(0.1, 5);
  });

  it('should export trimSilence utility function', () => {
    expect(trimSilence).toBeDefined();
    expect(typeof trimSilence).toBe('function');
  });

  it('should be able to instantiate Oscilloscope', () => {
    const canvas = document.createElement('canvas');
    const previousWaveformCanvas = document.createElement('canvas');
    const currentWaveformCanvas = document.createElement('canvas');
    const similarityPlotCanvas = document.createElement('canvas');
    const frameBufferCanvas = document.createElement('canvas');
    
    // Mock getContext for happy-dom
    const mockContext = {
      fillRect: () => {},
      stroke: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
    };
    canvas.getContext = (() => mockContext) as any;
    previousWaveformCanvas.getContext = (() => mockContext) as any;
    currentWaveformCanvas.getContext = (() => mockContext) as any;
    similarityPlotCanvas.getContext = (() => mockContext) as any;
    frameBufferCanvas.getContext = (() => mockContext) as any;
    
    const oscilloscope = new Oscilloscope(canvas, previousWaveformCanvas, currentWaveformCanvas, similarityPlotCanvas, frameBufferCanvas);
    expect(oscilloscope).toBeInstanceOf(Oscilloscope);
  });

  it('should be able to instantiate individual modules', () => {
    const canvas = document.createElement('canvas');
    // Mock getContext for happy-dom
    canvas.getContext = (() => ({
      fillRect: () => {},
      stroke: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
    })) as any;
    
    expect(new AudioManager()).toBeInstanceOf(AudioManager);
    expect(new GainController()).toBeInstanceOf(GainController);
    expect(new FrequencyEstimator()).toBeInstanceOf(FrequencyEstimator);
    expect(new WaveformRenderer(canvas)).toBeInstanceOf(WaveformRenderer);
    expect(new ZeroCrossDetector()).toBeInstanceOf(ZeroCrossDetector);
    expect(new WaveformSearcher()).toBeInstanceOf(WaveformSearcher);
    expect(new ComparisonPanelRenderer(canvas, canvas, canvas, canvas)).toBeInstanceOf(ComparisonPanelRenderer);
    expect(new PianoKeyboardRenderer(canvas)).toBeInstanceOf(PianoKeyboardRenderer);
  });

  it('should be able to instantiate WaveformDataProcessor', () => {
    const audioManager = new AudioManager();
    const gainController = new GainController();
    const frequencyEstimator = new FrequencyEstimator();
    const zeroCrossDetector = new ZeroCrossDetector();
    const waveformSearcher = new WaveformSearcher();
    
    const processor = new WaveformDataProcessor(
      audioManager,
      gainController,
      frequencyEstimator,
      zeroCrossDetector,
      waveformSearcher
    );
    
    expect(processor).toBeInstanceOf(WaveformDataProcessor);
  });
});
