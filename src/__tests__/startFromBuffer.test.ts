import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AudioManager } from '../AudioManager';
import { Oscilloscope } from '../Oscilloscope';
import { BufferSource } from '../BufferSource';

describe('startFromBuffer integration', () => {
  describe('AudioManager.startFromBuffer', () => {
    let audioManager: AudioManager;

    beforeEach(() => {
      audioManager = new AudioManager();
    });

    it('should initialize correctly with BufferSource', async () => {
      const buffer = new Float32Array(44100);
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = Math.sin(2 * Math.PI * 440 * i / 44100);
      }
      const bufferSource = new BufferSource(buffer, 44100);

      await audioManager.startFromBuffer(bufferSource);

      expect(audioManager.isReady()).toBe(true);
      expect(audioManager.getSampleRate()).toBe(44100);
      expect(audioManager.getFFTSize()).toBe(4096);
    });

    it('should provide time-domain data from BufferSource', async () => {
      const buffer = new Float32Array(44100);
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = Math.sin(2 * Math.PI * 440 * i / 44100);
      }
      const bufferSource = new BufferSource(buffer, 44100);

      await audioManager.startFromBuffer(bufferSource);

      const data = audioManager.getTimeDomainData();
      expect(data).not.toBeNull();
      expect(data!.length).toBe(4096);
      // The first chunk should have actual sine wave data
      // Sum all absolute values to check for non-zero data
      const sum = Array.from(data!).reduce((acc, val) => acc + Math.abs(val), 0);
      expect(sum).toBeGreaterThan(0);
    });

    it('should close existing AudioContext before starting', async () => {
      // Create a mock AudioContext
      const mockAudioContext = {
        state: 'running',
        close: vi.fn().mockResolvedValue(undefined),
        sampleRate: 48000
      };
      (audioManager as any).audioContext = mockAudioContext;

      const buffer = new Float32Array([0.1, 0.2, 0.3]);
      const bufferSource = new BufferSource(buffer, 44100);

      await audioManager.startFromBuffer(bufferSource);

      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it('should not create AudioContext in buffer mode', async () => {
      const buffer = new Float32Array([0.1, 0.2, 0.3]);
      const bufferSource = new BufferSource(buffer, 44100);

      await audioManager.startFromBuffer(bufferSource);

      // In buffer mode, audioContext should be null
      expect((audioManager as any).audioContext).toBeNull();
    });

    it('should set chunk size to 4096', async () => {
      const buffer = new Float32Array([0.1, 0.2, 0.3]);
      const bufferSource = new BufferSource(buffer, 44100, { chunkSize: 2048 });

      expect(bufferSource.getChunkSize()).toBe(2048);

      await audioManager.startFromBuffer(bufferSource);

      // Should be updated to 4096
      expect(bufferSource.getChunkSize()).toBe(4096);
    });

    it('should clean up BufferSource on stop', async () => {
      const buffer = new Float32Array([0.1, 0.2, 0.3]);
      const bufferSource = new BufferSource(buffer, 44100);
      bufferSource.getNextChunk(); // Advance position

      await audioManager.startFromBuffer(bufferSource);
      expect(bufferSource.getPosition()).toBeGreaterThan(0);

      await audioManager.stop();

      // BufferSource should be reset and set to null
      expect((audioManager as any).bufferSource).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      // Create a BufferSource that will fail validation
      const buffer = new Float32Array([0.1, 0.2, 0.3]);
      const bufferSource = new BufferSource(buffer, 44100);
      
      // Mock setChunkSize to throw an error
      vi.spyOn(bufferSource, 'setChunkSize').mockImplementation(() => {
        throw new Error('Test error');
      });

      await expect(audioManager.startFromBuffer(bufferSource)).rejects.toThrow('Test error');
    });
  });

  describe('Oscilloscope.startFromBuffer', () => {
    // Note: Oscilloscope tests are limited due to WASM initialization timeout in test environment
    // The key functionality is tested via AudioManager tests above

    it('should have startFromBuffer method', () => {
      const canvas = document.createElement('canvas');
      const previousWaveformCanvas = document.createElement('canvas');
      const currentWaveformCanvas = document.createElement('canvas');
      const similarityPlotCanvas = document.createElement('canvas');
      const frameBufferCanvas = document.createElement('canvas');

      const mockContext = {
        fillRect: vi.fn(),
        stroke: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        strokeStyle: '',
        lineWidth: 0,
        fillStyle: '',
        font: '',
        textAlign: '',
        fillText: vi.fn(),
        clearRect: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        setLineDash: vi.fn(),
        arc: vi.fn(),
        closePath: vi.fn(),
        fill: vi.fn()
      };
      
      canvas.getContext = (() => mockContext) as any;
      previousWaveformCanvas.getContext = (() => mockContext) as any;
      currentWaveformCanvas.getContext = (() => mockContext) as any;
      similarityPlotCanvas.getContext = (() => mockContext) as any;
      frameBufferCanvas.getContext = (() => mockContext) as any;

      const oscilloscope = new Oscilloscope(
        canvas,
        previousWaveformCanvas,
        currentWaveformCanvas,
        similarityPlotCanvas,
        frameBufferCanvas
      );

      expect(typeof oscilloscope.startFromBuffer).toBe('function');
    });
  });
});
