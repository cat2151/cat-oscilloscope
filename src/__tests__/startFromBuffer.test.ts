import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AudioManager } from '../AudioManager';
import { Oscilloscope } from '../Oscilloscope';
import { BufferSource } from '../BufferSource';

// Mock AudioContext and related Web Audio API objects for happy-dom environment
function createMockAudioContext(sampleRate = 44100) {
  const mockAnalyser = {
    fftSize: 4096,
    frequencyBinCount: 2048,
    smoothingTimeConstant: 0,
    getFloatTimeDomainData: vi.fn((arr: Float32Array) => {
      // Fill with sine wave data for testing
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate);
      }
    }),
    getByteFrequencyData: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  };

  const mockBufferSource = {
    buffer: null as any,
    loop: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };

  const mockAudioContext = {
    sampleRate,
    state: 'running' as string,
    createAnalyser: vi.fn(() => mockAnalyser),
    createBuffer: vi.fn((channels: number, length: number, sr: number) => {
      const channelData = new Float32Array(length);
      return {
        length,
        sampleRate: sr,
        numberOfChannels: channels,
        getChannelData: vi.fn(() => channelData),
      };
    }),
    createBufferSource: vi.fn(() => mockBufferSource),
    destination: {},
    close: vi.fn().mockResolvedValue(undefined),
  };

  return { mockAudioContext, mockAnalyser, mockBufferSource };
}

describe('startFromBuffer integration', () => {
  let originalAudioContext: any;

  beforeEach(() => {
    originalAudioContext = (globalThis as any).AudioContext;
    // Must use function (not arrow) so it can be used as a constructor with `new`
    // Fresh mock is created per test via createMockAudioContext() in beforeEach
    const { mockAudioContext } = createMockAudioContext();
    (globalThis as any).AudioContext = vi.fn(function(this: any) {
      Object.assign(this, { ...mockAudioContext });
      return this;
    });
  });

  afterEach(() => {
    if (originalAudioContext !== undefined) {
      (globalThis as any).AudioContext = originalAudioContext;
    } else {
      delete (globalThis as any).AudioContext;
    }
  });

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
    });

    it('should close existing AudioContext before starting', async () => {
      // Create a mock AudioContext that's already "running"
      const existingMock = {
        state: 'running',
        close: vi.fn().mockResolvedValue(undefined),
        sampleRate: 48000
      };
      (audioManager as any).audioContext = existingMock;

      const buffer = new Float32Array([0.1, 0.2, 0.3]);
      const bufferSource = new BufferSource(buffer, 44100);

      await audioManager.startFromBuffer(bufferSource);

      expect(existingMock.close).toHaveBeenCalled();
    });

    it('should create AudioContext in buffer mode (uses Web Audio API architecture)', async () => {
      const buffer = new Float32Array([0.1, 0.2, 0.3]);
      const bufferSource = new BufferSource(buffer, 44100);

      await audioManager.startFromBuffer(bufferSource);

      // In current architecture, buffer mode uses AudioContext + AnalyserNode
      expect((audioManager as any).audioContext).not.toBeNull();
      expect((globalThis as any).AudioContext).toHaveBeenCalled();
    });

    it('should set chunk size to 4096', async () => {
      const buffer = new Float32Array([0.1, 0.2, 0.3]);
      const bufferSource = new BufferSource(buffer, 44100, { chunkSize: 2048 });

      expect(bufferSource.getChunkSize()).toBe(2048);

      await audioManager.startFromBuffer(bufferSource);

      // Should be updated to 4096
      expect(bufferSource.getChunkSize()).toBe(4096);
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

    it('should not throw RangeError with loop:true and non-aligned buffer length (regression: #277)', async () => {
      // 44100 samples with chunkSize=4096: last chunk has 3140 samples, triggers looping wrap-around
      const buffer = new Float32Array(44100);
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = Math.sin(2 * Math.PI * 440 * i / 44100);
      }
      const bufferSource = new BufferSource(buffer, 44100, { loop: true });

      // This should NOT throw RangeError: offset is out of bounds
      await expect(audioManager.startFromBuffer(bufferSource)).resolves.toBeUndefined();
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
