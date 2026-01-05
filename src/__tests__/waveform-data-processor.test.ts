import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WaveformDataProcessor } from '../WaveformDataProcessor';
import { AudioManager } from '../AudioManager';
import { GainController } from '../GainController';
import { FrequencyEstimator } from '../FrequencyEstimator';
import { ZeroCrossDetector } from '../ZeroCrossDetector';
import { WaveformSearcher } from '../WaveformSearcher';

describe('WaveformDataProcessor', () => {
  let processor: WaveformDataProcessor;
  let audioManager: AudioManager;
  let gainController: GainController;
  let frequencyEstimator: FrequencyEstimator;
  let zeroCrossDetector: ZeroCrossDetector;
  let waveformSearcher: WaveformSearcher;

  beforeEach(() => {
    audioManager = new AudioManager();
    gainController = new GainController();
    frequencyEstimator = new FrequencyEstimator();
    zeroCrossDetector = new ZeroCrossDetector();
    waveformSearcher = new WaveformSearcher();

    processor = new WaveformDataProcessor(
      audioManager,
      gainController,
      frequencyEstimator,
      zeroCrossDetector,
      waveformSearcher
    );
  });

  describe('initialization', () => {
    it('should create processor with all required dependencies', () => {
      expect(processor).toBeDefined();
      expect(processor).toBeInstanceOf(WaveformDataProcessor);
    });
  });

  describe('processFrame', () => {
    it('should return null when audio manager is not ready', () => {
      const result = processor.processFrame(false);
      expect(result).toBeNull();
    });

    it('should return WaveformRenderData structure when audio is available', () => {
      // Mock the audio manager to return data
      vi.spyOn(audioManager, 'isReady').mockReturnValue(true);
      vi.spyOn(audioManager, 'getTimeDomainData').mockReturnValue(
        new Float32Array(Array.from({ length: 4096 }, (_, i) => Math.sin(i / 10) * 0.5))
      );
      vi.spyOn(audioManager, 'getSampleRate').mockReturnValue(48000);
      vi.spyOn(audioManager, 'getFFTSize').mockReturnValue(4096);
      vi.spyOn(audioManager, 'getFrequencyData').mockReturnValue(
        new Uint8Array(Array.from({ length: 2048 }, (_, i) => i % 256))
      );

      const result = processor.processFrame(false);

      expect(result).not.toBeNull();
      if (result) {
        // Verify all required fields are present
        expect(result).toHaveProperty('waveformData');
        expect(result).toHaveProperty('displayStartIndex');
        expect(result).toHaveProperty('displayEndIndex');
        expect(result).toHaveProperty('gain');
        expect(result).toHaveProperty('estimatedFrequency');
        expect(result).toHaveProperty('sampleRate');
        expect(result).toHaveProperty('fftSize');
        expect(result).toHaveProperty('isSignalAboveNoiseGate');
        expect(result).toHaveProperty('maxFrequency');
        expect(result).toHaveProperty('previousWaveform');
        expect(result).toHaveProperty('similarity');
        expect(result).toHaveProperty('usedSimilaritySearch');

        // Verify types
        expect(result.waveformData).toBeInstanceOf(Float32Array);
        expect(typeof result.displayStartIndex).toBe('number');
        expect(typeof result.displayEndIndex).toBe('number');
        expect(typeof result.gain).toBe('number');
        expect(typeof result.estimatedFrequency).toBe('number');
        expect(typeof result.sampleRate).toBe('number');
        expect(typeof result.fftSize).toBe('number');
        expect(typeof result.isSignalAboveNoiseGate).toBe('boolean');
        expect(typeof result.maxFrequency).toBe('number');
        expect(typeof result.similarity).toBe('number');
        expect(typeof result.usedSimilaritySearch).toBe('boolean');

        // Verify reasonable values
        expect(result.displayStartIndex).toBeGreaterThanOrEqual(0);
        expect(result.displayEndIndex).toBeLessThanOrEqual(result.waveformData.length);
        expect(result.displayStartIndex).toBeLessThan(result.displayEndIndex);
      }
    });

    it('should include frequency data when FFT display is enabled', () => {
      vi.spyOn(audioManager, 'isReady').mockReturnValue(true);
      vi.spyOn(audioManager, 'getTimeDomainData').mockReturnValue(
        new Float32Array(4096).fill(0.5)
      );
      vi.spyOn(audioManager, 'getSampleRate').mockReturnValue(48000);
      vi.spyOn(audioManager, 'getFFTSize').mockReturnValue(4096);
      const mockFreqData = new Uint8Array(2048).fill(128);
      vi.spyOn(audioManager, 'getFrequencyData').mockReturnValue(mockFreqData);

      const result = processor.processFrame(true);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.frequencyData).toBeDefined();
        expect(result.frequencyData).toBeInstanceOf(Uint8Array);
      }
    });

    it('should not include frequency data when FFT display disabled and not using FFT method', () => {
      vi.spyOn(audioManager, 'isReady').mockReturnValue(true);
      vi.spyOn(audioManager, 'getTimeDomainData').mockReturnValue(
        new Float32Array(4096).fill(0.5)
      );
      vi.spyOn(audioManager, 'getSampleRate').mockReturnValue(48000);
      vi.spyOn(audioManager, 'getFFTSize').mockReturnValue(4096);
      vi.spyOn(audioManager, 'getFrequencyData').mockReturnValue(null);
      
      frequencyEstimator.setFrequencyEstimationMethod('zero-crossing');

      const result = processor.processFrame(false);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.frequencyData).toBeUndefined();
      }
    });

    it('should set usedSimilaritySearch to false on first frame', () => {
      vi.spyOn(audioManager, 'isReady').mockReturnValue(true);
      vi.spyOn(audioManager, 'getTimeDomainData').mockReturnValue(
        new Float32Array(4096).fill(0.5)
      );
      vi.spyOn(audioManager, 'getSampleRate').mockReturnValue(48000);
      vi.spyOn(audioManager, 'getFFTSize').mockReturnValue(4096);

      // Reset the searcher to ensure fresh state
      waveformSearcher.reset();

      const result = processor.processFrame(false);

      expect(result).not.toBeNull();
      if (result) {
        // First frame always stores waveform for next frame, so previousWaveform will be set
        // but similarity search won't be used because there was no previous waveform to compare against
        expect(result.usedSimilaritySearch).toBe(false);
      }
    });

    it('should store waveform and have previousWaveform on second frame', () => {
      vi.spyOn(audioManager, 'isReady').mockReturnValue(true);
      const mockData = new Float32Array(4096).fill(0.5);
      vi.spyOn(audioManager, 'getTimeDomainData').mockReturnValue(mockData);
      vi.spyOn(audioManager, 'getSampleRate').mockReturnValue(48000);
      vi.spyOn(audioManager, 'getFFTSize').mockReturnValue(4096);

      // Reset to ensure fresh state
      waveformSearcher.reset();

      // First frame stores waveform but has no previous to compare
      const result1 = processor.processFrame(false);
      expect(result1).not.toBeNull();
      if (result1) {
        expect(result1.usedSimilaritySearch).toBe(false);
      }

      // Second frame should have previous waveform available
      const result2 = processor.processFrame(false);
      expect(result2).not.toBeNull();
      if (result2) {
        expect(result2.previousWaveform).not.toBeNull();
        expect(result2.previousWaveform).toBeInstanceOf(Float32Array);
        // Should now try similarity search (though it may not succeed with flat data)
      }
    });

    it('should return null when time domain data is not available', () => {
      vi.spyOn(audioManager, 'isReady').mockReturnValue(true);
      vi.spyOn(audioManager, 'getTimeDomainData').mockReturnValue(null);

      const result = processor.processFrame(false);

      expect(result).toBeNull();
    });
  });
});
