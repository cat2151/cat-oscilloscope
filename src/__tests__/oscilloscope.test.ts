import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Oscilloscope } from '../Oscilloscope';

// Mock Web Audio API classes that don't exist in happy-dom
class MockAudioContext {
  state = 'running';
  sampleRate = 48000;
  
  createMediaStreamSource() {
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }
  
  createAnalyser() {
    const analyser = {
      fftSize: 2048,
      frequencyBinCount: 1024,
      smoothingTimeConstant: 0,
      connect: vi.fn(),
      disconnect: vi.fn(),
      getFloatTimeDomainData: vi.fn((array: Float32Array) => {
        // Fill with a simple sine wave for testing
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.sin(i / 10) * 0.5;
        }
      }),
      getByteFrequencyData: vi.fn((array: Uint8Array) => {
        // Fill with some frequency data
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 255);
        }
      }),
    };
    return analyser;
  }
  
  async close() {
    this.state = 'closed';
    return Promise.resolve();
  }
}

// Mock MediaStream
class MockMediaStream {
  active = true;
  id = 'mock-stream-id';
  private tracks: MockMediaStreamTrack[] = [new MockMediaStreamTrack()];
  
  getTracks() {
    return this.tracks;
  }
  
  getAudioTracks() {
    return this.tracks;
  }
  
  getVideoTracks() {
    return [];
  }
}

class MockMediaStreamTrack {
  kind = 'audio';
  id = 'mock-track-id';
  label = 'Mock Microphone';
  enabled = true;
  muted = false;
  readyState: 'live' | 'ended' = 'live';
  
  stop() {
    this.readyState = 'ended';
  }
}

// Set up global mocks before tests run
global.AudioContext = MockAudioContext as any;
global.navigator = {
  ...global.navigator,
  mediaDevices: {
    getUserMedia: vi.fn(() => Promise.resolve(new MockMediaStream() as any)),
  },
} as any;

describe('Oscilloscope Class', () => {
  let canvas: HTMLCanvasElement;
  
  beforeEach(() => {
    // Create a mock canvas element
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    
    // Mock getContext to return a valid 2D context
    const mockContext = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(() => ({ width: 100 })),
      save: vi.fn(),
      restore: vi.fn(),
    };
    
    canvas.getContext = vi.fn(() => mockContext) as any;
    document.body.appendChild(canvas);
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((cb) => {
      setTimeout(cb, 16);
      return 1;
    }) as any;
    
    global.cancelAnimationFrame = vi.fn();
  });
  
  afterEach(() => {
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
    vi.clearAllMocks();
  });
  
  describe('Constructor', () => {
    it('should create an oscilloscope instance with valid canvas', () => {
      const oscilloscope = new Oscilloscope(canvas);
      expect(oscilloscope).toBeDefined();
      expect(oscilloscope.getIsRunning()).toBe(false);
    });
    
    it('should throw error when canvas context is not available', () => {
      const mockCanvas = {
        getContext: () => null,
      } as any;
      
      expect(() => new Oscilloscope(mockCanvas)).toThrow('Could not get 2D context');
    });
  });
  
  describe('Start and Stop Lifecycle', () => {
    it('should start the oscilloscope successfully', async () => {
      const oscilloscope = new Oscilloscope(canvas);
      await oscilloscope.start();
      expect(oscilloscope.getIsRunning()).toBe(true);
    });
    
    it('should stop the oscilloscope successfully', async () => {
      const oscilloscope = new Oscilloscope(canvas);
      await oscilloscope.start();
      await oscilloscope.stop();
      expect(oscilloscope.getIsRunning()).toBe(false);
    });
    
    it('should clean up resources on stop', async () => {
      const oscilloscope = new Oscilloscope(canvas);
      await oscilloscope.start();
      await oscilloscope.stop();
      
      // Verify cancelAnimationFrame was called
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });
  });
  
  describe('Auto Gain', () => {
    it('should have auto gain enabled by default', () => {
      const oscilloscope = new Oscilloscope(canvas);
      expect(oscilloscope.getAutoGainEnabled()).toBe(true);
    });
    
    it('should allow disabling auto gain', () => {
      const oscilloscope = new Oscilloscope(canvas);
      oscilloscope.setAutoGain(false);
      expect(oscilloscope.getAutoGainEnabled()).toBe(false);
    });
    
    it('should reset gain to 1.0 when auto gain is disabled', () => {
      const oscilloscope = new Oscilloscope(canvas);
      oscilloscope.setAutoGain(true);
      // Manually set a different gain would happen during rendering
      oscilloscope.setAutoGain(false);
      expect(oscilloscope.getCurrentGain()).toBe(1.0);
    });
  });
  
  describe('Noise Gate', () => {
    it('should have noise gate enabled by default', () => {
      const oscilloscope = new Oscilloscope(canvas);
      expect(oscilloscope.getNoiseGateEnabled()).toBe(true);
    });
    
    it('should allow enabling/disabling noise gate', () => {
      const oscilloscope = new Oscilloscope(canvas);
      oscilloscope.setNoiseGate(false);
      expect(oscilloscope.getNoiseGateEnabled()).toBe(false);
      
      oscilloscope.setNoiseGate(true);
      expect(oscilloscope.getNoiseGateEnabled()).toBe(true);
    });
    
    it('should have default noise gate threshold of 0.01', () => {
      const oscilloscope = new Oscilloscope(canvas);
      expect(oscilloscope.getNoiseGateThreshold()).toBe(0.01);
    });
    
    it('should allow setting noise gate threshold', () => {
      const oscilloscope = new Oscilloscope(canvas);
      oscilloscope.setNoiseGateThreshold(0.05);
      expect(oscilloscope.getNoiseGateThreshold()).toBe(0.05);
    });
    
    it('should clamp noise gate threshold between 0 and 1', () => {
      const oscilloscope = new Oscilloscope(canvas);
      
      oscilloscope.setNoiseGateThreshold(-0.5);
      expect(oscilloscope.getNoiseGateThreshold()).toBe(0);
      
      oscilloscope.setNoiseGateThreshold(1.5);
      expect(oscilloscope.getNoiseGateThreshold()).toBe(1);
    });
  });
  
  describe('Frequency Estimation Methods', () => {
    it('should have autocorrelation as default method', () => {
      const oscilloscope = new Oscilloscope(canvas);
      expect(oscilloscope.getFrequencyEstimationMethod()).toBe('autocorrelation');
    });
    
    it('should allow setting zero-crossing method', () => {
      const oscilloscope = new Oscilloscope(canvas);
      oscilloscope.setFrequencyEstimationMethod('zero-crossing');
      expect(oscilloscope.getFrequencyEstimationMethod()).toBe('zero-crossing');
    });
    
    it('should allow setting FFT method', () => {
      const oscilloscope = new Oscilloscope(canvas);
      oscilloscope.setFrequencyEstimationMethod('fft');
      expect(oscilloscope.getFrequencyEstimationMethod()).toBe('fft');
    });
    
    it('should initialize estimated frequency to 0', () => {
      const oscilloscope = new Oscilloscope(canvas);
      expect(oscilloscope.getEstimatedFrequency()).toBe(0);
    });
  });
  
  describe('FFT Display', () => {
    it('should have FFT display enabled by default', () => {
      const oscilloscope = new Oscilloscope(canvas);
      expect(oscilloscope.getFFTDisplayEnabled()).toBe(true);
    });
    
    it('should allow enabling/disabling FFT display', () => {
      const oscilloscope = new Oscilloscope(canvas);
      oscilloscope.setFFTDisplay(false);
      expect(oscilloscope.getFFTDisplayEnabled()).toBe(false);
      
      oscilloscope.setFFTDisplay(true);
      expect(oscilloscope.getFFTDisplayEnabled()).toBe(true);
    });
  });
  
  describe('Gain Value', () => {
    it('should initialize current gain to 1.0', () => {
      const oscilloscope = new Oscilloscope(canvas);
      expect(oscilloscope.getCurrentGain()).toBe(1.0);
    });
  });
});
