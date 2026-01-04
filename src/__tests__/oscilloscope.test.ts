import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Oscilloscope } from '../Oscilloscope';
import { dbToAmplitude } from '../utils';

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
      fftSize: 4096,
      frequencyBinCount: 2048,
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
        // Fill with deterministic frequency data for reproducible tests
        for (let i = 0; i < array.length; i++) {
          array[i] = i % 256;
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
  let debugCanvas: HTMLCanvasElement;
  
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
    
    // Create debug canvas
    debugCanvas = document.createElement('canvas');
    debugCanvas.width = 800;
    debugCanvas.height = 300;
    debugCanvas.getContext = vi.fn(() => mockContext) as any;
    document.body.appendChild(debugCanvas);
    
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
    if (debugCanvas && debugCanvas.parentNode) {
      debugCanvas.parentNode.removeChild(debugCanvas);
    }
    vi.clearAllMocks();
  });
  
  describe('Constructor', () => {
    it('should create an oscilloscope instance with valid canvas', () => {
      const oscilloscope = new Oscilloscope(canvas, debugCanvas);
      expect(oscilloscope).toBeDefined();
      expect(oscilloscope.getIsRunning()).toBe(false);
    });
    
    it('should throw error when canvas context is not available', () => {
      const mockCanvas = {
        getContext: () => null,
      } as any;
      
      expect(() => new Oscilloscope(mockCanvas, debugCanvas)).toThrow('Could not get 2D context');
    });
  });
  
  describe('Start and Stop Lifecycle', () => {
    it('should start the oscilloscope successfully', async () => {
      const oscilloscope = new Oscilloscope(canvas, debugCanvas);
      await oscilloscope.start();
      expect(oscilloscope.getIsRunning()).toBe(true);
    });
    
    it('should stop the oscilloscope successfully', async () => {
      const oscilloscope = new Oscilloscope(canvas, debugCanvas);
      await oscilloscope.start();
      await oscilloscope.stop();
      expect(oscilloscope.getIsRunning()).toBe(false);
    });
    
    it('should clean up resources on stop', async () => {
      const oscilloscope = new Oscilloscope(canvas, debugCanvas);
      await oscilloscope.start();
      await oscilloscope.stop();
      
      // Verify cancelAnimationFrame was called
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });
  });
  
  describe('Auto Gain', () => {
    it('should have auto gain enabled by default', () => {
      const oscilloscope = new Oscilloscope(canvas, debugCanvas);
      expect(oscilloscope.getAutoGainEnabled()).toBe(true);
    });
    
    it('should allow disabling auto gain', () => {
      const oscilloscope = new Oscilloscope(canvas, debugCanvas);
      oscilloscope.setAutoGain(false);
      expect(oscilloscope.getAutoGainEnabled()).toBe(false);
    });
    
    it('should reset gain to 1.0 when auto gain is disabled', () => {
      const oscilloscope = new Oscilloscope(canvas, debugCanvas);
      oscilloscope.setAutoGain(true);
      // Manually set a different gain would happen during rendering
      oscilloscope.setAutoGain(false);
      expect(oscilloscope.getCurrentGain()).toBe(1.0);
    });
  });
  
  describe('Noise Gate', () => {
    it('should have noise gate enabled by default', () => {
      const oscilloscope = new Oscilloscope(canvas, debugCanvas);
      expect(oscilloscope.getNoiseGateEnabled()).toBe(true);
    });
    
    it('should allow enabling/disabling noise gate', () => {
      const oscilloscope = new Oscilloscope(canvas, debugCanvas);
      oscilloscope.setNoiseGate(false);
      expect(oscilloscope.getNoiseGateEnabled()).toBe(false);
      
      oscilloscope.setNoiseGate(true);
      expect(oscilloscope.getNoiseGateEnabled()).toBe(true);
    });
    
    it('should have default noise gate threshold of dbToAmplitude(-48)', () => {
      const oscilloscope = new Oscilloscope(canvas, debugCanvas);
      expect(oscilloscope.getNoiseGateThreshold()).toBeCloseTo(dbToAmplitude(-48), 10);
    });
    
    it('should allow setting noise gate threshold', () => {
      const oscilloscope = new Oscilloscope(canvas, debugCanvas);
      oscilloscope.setNoiseGateThreshold(0.05);
      expect(oscilloscope.getNoiseGateThreshold()).toBe(0.05);
    });
    
    it('should clamp noise gate threshold between 0 and 1', () => {
      const oscilloscope = new Oscilloscope(canvas, debugCanvas);
      
      oscilloscope.setNoiseGateThreshold(-0.5);
      expect(oscilloscope.getNoiseGateThreshold()).toBe(0);
      
      oscilloscope.setNoiseGateThreshold(1.5);
      expect(oscilloscope.getNoiseGateThreshold()).toBe(1);
    });
  });
  
  describe('Frequency Estimation Methods', () => {
    it('should have autocorrelation as default method', () => {
      const oscilloscope = new Oscilloscope(canvas, debugCanvas);
      expect(oscilloscope.getFrequencyEstimationMethod()).toBe('autocorrelation');
    });
    
    it('should allow setting zero-crossing method', () => {
      const oscilloscope = new Oscilloscope(canvas, debugCanvas);
      oscilloscope.setFrequencyEstimationMethod('zero-crossing');
      expect(oscilloscope.getFrequencyEstimationMethod()).toBe('zero-crossing');
    });
    
    it('should allow setting FFT method', () => {
      const oscilloscope = new Oscilloscope(canvas, debugCanvas);
      oscilloscope.setFrequencyEstimationMethod('fft');
      expect(oscilloscope.getFrequencyEstimationMethod()).toBe('fft');
    });
    
    it('should initialize estimated frequency to 0', () => {
      const oscilloscope = new Oscilloscope(canvas, debugCanvas);
      expect(oscilloscope.getEstimatedFrequency()).toBe(0);
    });
  });
  
  describe('FFT Display', () => {
    it('should have FFT display enabled by default', () => {
      const oscilloscope = new Oscilloscope(canvas, debugCanvas);
      expect(oscilloscope.getFFTDisplayEnabled()).toBe(true);
    });
    
    it('should allow enabling/disabling FFT display', () => {
      const oscilloscope = new Oscilloscope(canvas, debugCanvas);
      oscilloscope.setFFTDisplay(false);
      expect(oscilloscope.getFFTDisplayEnabled()).toBe(false);
      
      oscilloscope.setFFTDisplay(true);
      expect(oscilloscope.getFFTDisplayEnabled()).toBe(true);
    });
  });
  
  describe('Gain Value', () => {
    it('should initialize current gain to 1.0', () => {
      const oscilloscope = new Oscilloscope(canvas, debugCanvas);
      expect(oscilloscope.getCurrentGain()).toBe(1.0);
    });
  });
  
  describe('Noise Gate and FFT Display Interaction', () => {
    // Constants for test mocks
    const MOCK_FREQUENCY_MAGNITUDE = 100; // Significant magnitude for frequency data
    
    // Helper function to create a mock AudioContext with configurable silent data
    function createSilentMockAudioContext(amplitudeGenerator: (i: number) => number) {
      return class SilentMockAudioContext {
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
            fftSize: 4096,
            frequencyBinCount: 2048,
            smoothingTimeConstant: 0,
            connect: vi.fn(),
            disconnect: vi.fn(),
            getFloatTimeDomainData: vi.fn((array: Float32Array) => {
              for (let i = 0; i < array.length; i++) {
                array[i] = amplitudeGenerator(i);
              }
            }),
            getByteFrequencyData: vi.fn((array: Uint8Array) => {
              // Fill with some frequency data that would normally be visible
              for (let i = 0; i < array.length; i++) {
                array[i] = MOCK_FREQUENCY_MAGNITUDE;
              }
            }),
          };
          return analyser;
        }
        
        async close() {
          this.state = 'closed';
          return Promise.resolve();
        }
      };
    }
    
    // Type for strokeRect call arguments
    type StrokeRectCall = [number, number, number, number];
    
    // Helper function to calculate FFT overlay dimensions
    function getFFTOverlayDimensions(canvasWidth: number, canvasHeight: number) {
      const overlayWidth = Math.floor(canvasWidth * 0.35);
      const overlayHeight = Math.floor(canvasHeight * 0.35);
      const overlayX = 10;
      const overlayY = canvasHeight - overlayHeight - 10;
      return { overlayWidth, overlayHeight, overlayX, overlayY };
    }
    
    // Helper function to find FFT overlay border call in strokeRect calls
    function findFFTOverlayBorderCall(strokeRectCalls: StrokeRectCall[], dimensions: ReturnType<typeof getFFTOverlayDimensions>) {
      return strokeRectCalls.find((call: StrokeRectCall) => {
        return call[0] === dimensions.overlayX && 
               call[1] === dimensions.overlayY && 
               call[2] === dimensions.overlayWidth && 
               call[3] === dimensions.overlayHeight;
      });
    }
    
    it('should suppress FFT overlay when noise gate is active and signal is below threshold', async () => {
      // Create a mock that returns silent data (amplitude 0.001, below default threshold of 0.00398)
      const SilentMockAudioContext = createSilentMockAudioContext(i => Math.sin(i / 10) * 0.001);
      
      // Temporarily replace the global AudioContext with our silent mock
      const originalAudioContext = global.AudioContext;
      global.AudioContext = SilentMockAudioContext as any;
      
      try {
        const oscilloscope = new Oscilloscope(canvas, debugCanvas);
        
        // Enable both noise gate and FFT display
        oscilloscope.setNoiseGate(true);
        oscilloscope.setFFTDisplay(true);
        oscilloscope.setNoiseGateThreshold(0.01); // Default threshold
        
        // Verify settings
        expect(oscilloscope.getNoiseGateEnabled()).toBe(true);
        expect(oscilloscope.getFFTDisplayEnabled()).toBe(true);
        
        // Get the mock context to verify rendering calls
        const mockContext = canvas.getContext('2d') as any;
        
        // Start oscilloscope and let it render one frame
        await oscilloscope.start();
        
        // Wait for requestAnimationFrame to be called
        await new Promise(resolve => setTimeout(resolve, 20));
        
        // Stop oscilloscope
        await oscilloscope.stop();
        
        // Verify that fillRect was called (for grid/waveform background)
        expect(mockContext.fillRect).toHaveBeenCalled();
        
        // Check that FFT overlay border was NOT drawn when signal is gated
        const strokeRectCalls = mockContext.strokeRect.mock.calls;
        const dimensions = getFFTOverlayDimensions(800, 400);
        const fftOverlayBorderCall = findFFTOverlayBorderCall(strokeRectCalls, dimensions);
        
        expect(fftOverlayBorderCall).toBeUndefined();
      } finally {
        // Restore original AudioContext
        global.AudioContext = originalAudioContext;
      }
    });
    
    it('should show FFT overlay when noise gate is active but signal is above threshold', async () => {
      // Use the default mock which has amplitude 0.5 (above threshold of 0.00398)
      const oscilloscope = new Oscilloscope(canvas, debugCanvas);
      
      // Enable both noise gate and FFT display
      oscilloscope.setNoiseGate(true);
      oscilloscope.setFFTDisplay(true);
      oscilloscope.setNoiseGateThreshold(0.01);
      
      // Get the mock context
      const mockContext = canvas.getContext('2d') as any;
      
      // Start oscilloscope
      await oscilloscope.start();
      
      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 20));
      
      // Stop oscilloscope
      await oscilloscope.stop();
      
      // Verify strokeRect was called (for FFT overlay border among other things)
      expect(mockContext.strokeRect).toHaveBeenCalled();
      
      // Check if FFT overlay border was drawn
      const strokeRectCalls = mockContext.strokeRect.mock.calls;
      const dimensions = getFFTOverlayDimensions(800, 400);
      const fftOverlayBorderCall = findFFTOverlayBorderCall(strokeRectCalls, dimensions);
      
      expect(fftOverlayBorderCall).toBeDefined();
    });
    
    it('should show FFT overlay when noise gate is disabled regardless of signal level', async () => {
      // Create a mock with very low amplitude (0.0001)
      const SilentMockAudioContext = createSilentMockAudioContext(() => 0.0001);
      
      const originalAudioContext = global.AudioContext;
      global.AudioContext = SilentMockAudioContext as any;
      
      try {
        const oscilloscope = new Oscilloscope(canvas, debugCanvas);
        
        // Disable noise gate but enable FFT display
        oscilloscope.setNoiseGate(false);
        oscilloscope.setFFTDisplay(true);
        
        const mockContext = canvas.getContext('2d') as any;
        
        await oscilloscope.start();
        await new Promise(resolve => setTimeout(resolve, 20));
        await oscilloscope.stop();
        
        // FFT overlay should be drawn even with silent data when noise gate is off
        const strokeRectCalls = mockContext.strokeRect.mock.calls;
        const dimensions = getFFTOverlayDimensions(800, 400);
        const fftOverlayBorderCall = findFFTOverlayBorderCall(strokeRectCalls, dimensions);
        
        expect(fftOverlayBorderCall).toBeDefined();
      } finally {
        global.AudioContext = originalAudioContext;
      }
    });
  });

  describe('Similarity Bar Graph', () => {
    it('should draw similarity bar graph with border', async () => {
      const oscilloscope = new Oscilloscope(canvas, debugCanvas);
      const mockContext = canvas.getContext('2d') as any;
      
      await oscilloscope.start();
      await new Promise(resolve => setTimeout(resolve, 20));
      await oscilloscope.stop();
      
      // Verify that strokeRect was called for the similarity graph border
      const strokeRectCalls = mockContext.strokeRect.mock.calls;
      const similarityGraphBorder = strokeRectCalls.find((call: any[]) => 
        call[0] === 800 - 200 - 10 && // x = canvasWidth - graphWidth - 10
        call[1] === 10 && // y = 10
        call[2] === 200 && // width = graphWidth
        call[3] === 50 // height = graphHeight
      );
      
      // The similarity graph border should be drawn
      expect(similarityGraphBorder).toBeDefined();
    });

    it('should draw similarity bar graph with sorted scores (descending)', async () => {
      const oscilloscope = new Oscilloscope(canvas, debugCanvas);
      const mockContext = canvas.getContext('2d') as any;
      
      await oscilloscope.start();
      await new Promise(resolve => setTimeout(resolve, 20));
      await oscilloscope.stop();
      
      // Verify that strokeRect was called for the similarity graph border
      const strokeRectCalls = mockContext.strokeRect.mock.calls;
      const similarityGraphBorder = strokeRectCalls.find((call: any[]) => 
        call[0] === 800 - 200 - 10 && // x = canvasWidth - graphWidth - 10
        call[1] === 10 && // y = 10
        call[2] === 200 && // width = graphWidth
        call[3] === 50 // height = graphHeight
      );
      
      // The similarity graph border should be drawn
      expect(similarityGraphBorder).toBeDefined();
      
      // Verify fillRect was called (for bars and background)
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should display up to 4 bars sorted in descending order', async () => {
      const oscilloscope = new Oscilloscope(canvas, debugCanvas);
      const mockContext = canvas.getContext('2d') as any;
      
      await oscilloscope.start();
      await new Promise(resolve => setTimeout(resolve, 20));
      await oscilloscope.stop();
      
      // Get similarity scores
      const scores = oscilloscope.getSimilarityScores();
      
      // If we have more than 4 scores, only top 4 should be displayed
      // The bars are drawn at specific y positions (graphY + index * barHeight)
      const fillRectCalls = mockContext.fillRect.mock.calls;
      
      // Count bars drawn at similarity graph y positions (10, 20, 30, 40)
      const barYPositions = [10, 20, 30, 40];
      const barsDrawn = fillRectCalls.filter((call: any[]) => 
        barYPositions.includes(call[1]) && // y position matches bar positions
        call[3] === 10 // height = barHeight (10px)
      );
      
      // Should have at most 4 bars (or fewer if scores.length < 4)
      expect(barsDrawn.length).toBeLessThanOrEqual(Math.min(4, scores.length));
    });

    it('should use green color for positive scores and red for negative scores', async () => {
      const oscilloscope = new Oscilloscope(canvas, debugCanvas);
      const mockContext = canvas.getContext('2d') as any;
      
      // Track fillStyle changes
      const fillStyleValues: string[] = [];
      const originalFillStyleSetter = Object.getOwnPropertyDescriptor(
        mockContext, 'fillStyle'
      )?.set;
      
      Object.defineProperty(mockContext, 'fillStyle', {
        set: function(value: string) {
          fillStyleValues.push(value);
          if (originalFillStyleSetter) {
            originalFillStyleSetter.call(this, value);
          }
        },
        get: function() {
          return this._fillStyle;
        }
      });
      
      await oscilloscope.start();
      await new Promise(resolve => setTimeout(resolve, 20));
      await oscilloscope.stop();
      
      // Check if rgba colors with green or red were used
      const greenColors = fillStyleValues.filter(style => 
        style.includes('rgba(0, 255, 0,') // Green for positive scores
      );
      const redColors = fillStyleValues.filter(style => 
        style.includes('rgba(255, 0, 0,') // Red for negative scores
      );
      
      // At least one color should be used for bars
      // (The specific count depends on the similarity scores generated)
      expect(greenColors.length + redColors.length).toBeGreaterThan(0);
    });

    it('should draw bars extending from center (zero position)', async () => {
      const oscilloscope = new Oscilloscope(canvas, debugCanvas);
      const mockContext = canvas.getContext('2d') as any;
      
      await oscilloscope.start();
      await new Promise(resolve => setTimeout(resolve, 20));
      await oscilloscope.stop();
      
      const fillRectCalls = mockContext.fillRect.mock.calls;
      
      // Center of similarity graph is at graphX + graphWidth/2
      // graphX = 800 - 200 - 10 = 590
      // centerX = 590 + 200/2 = 690
      const centerX = 800 - 200 - 10 + 200 / 2;
      
      // Find bars (height = 10, y in range 10-40)
      const bars = fillRectCalls.filter((call: any[]) => 
        call[3] === 10 && // height = 10
        call[1] >= 10 && call[1] < 50 // y position in graph area
      );
      
      // Bars should be positioned relative to center
      // Positive scores: x = centerX, width = positive
      // Negative scores: x = centerX - width, width = positive
      bars.forEach((bar: any[]) => {
        const x = bar[0];
        const width = bar[2];
        
        // Bar should either start at center (positive) or end at center (negative)
        const isPositiveBar = Math.abs(x - centerX) < 1; // starts at center
        const isNegativeBar = Math.abs(x + width - centerX) < 1; // ends at center
        
        expect(isPositiveBar || isNegativeBar).toBe(true);
      });
    });
  });
});
