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
    // Mock getContext for happy-dom
    canvas.getContext = (() => ({
      fillRect: () => {},
      stroke: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
    })) as any;
    
    const oscilloscope = new Oscilloscope(canvas);
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
  });
});
