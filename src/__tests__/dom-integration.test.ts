import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { dbToAmplitude } from '../utils';

// Mock Web Audio API and MediaStream before importing main
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
    return {
      fftSize: 4096,
      frequencyBinCount: 2048,
      smoothingTimeConstant: 0,
      connect: vi.fn(),
      disconnect: vi.fn(),
      getFloatTimeDomainData: vi.fn((array: Float32Array) => {
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
  }
  
  async close() {
    this.state = 'closed';
    return Promise.resolve();
  }
}

class MockMediaStream {
  active = true;
  id = 'mock-stream-id';
  private tracks: any[] = [{
    kind: 'audio',
    id: 'mock-track-id',
    label: 'Mock Microphone',
    enabled: true,
    muted: false,
    readyState: 'live' as const,
    stop: vi.fn(),
  }];
  
  getTracks() {
    return this.tracks;
  }
}

// Set up mocks
global.AudioContext = MockAudioContext as any;
global.navigator = {
  ...global.navigator,
  mediaDevices: {
    getUserMedia: vi.fn(() => Promise.resolve(new MockMediaStream() as any)),
  },
} as any;

describe('DOM Integration Tests', () => {
  let canvas: HTMLCanvasElement;
  let startButton: HTMLButtonElement;
  let autoGainCheckbox: HTMLInputElement;
  let noiseGateCheckbox: HTMLInputElement;
  let fftDisplayCheckbox: HTMLInputElement;
  let usePeakModeCheckbox: HTMLInputElement;
  let noiseGateThreshold: HTMLInputElement;
  let thresholdValue: HTMLSpanElement;
  let statusElement: HTMLSpanElement;
  let frequencyMethod: HTMLSelectElement;
  let frequencyValue: HTMLSpanElement;
  let gainValue: HTMLSpanElement;

  beforeEach(() => {
    // Setup DOM elements as they appear in index.html
    document.body.innerHTML = `
      <canvas id="canvas" width="800" height="400"></canvas>
      <div id="controls">
        <button id="startButton">Start</button>
        <label>
          <input type="checkbox" id="autoGainCheckbox" checked>
          <span>Auto Gain</span>
        </label>
        <label>
          <input type="checkbox" id="noiseGateCheckbox" checked>
          <span>Noise Gate</span>
        </label>
        <label>
          <input type="checkbox" id="fftDisplayCheckbox" checked>
          <span>FFT Display</span>
        </label>
        <label>
          <input type="checkbox" id="usePeakModeCheckbox">
          <span>Peak Mode</span>
        </label>
        <label>
          <span>Threshold:</span>
          <input type="range" id="noiseGateThreshold" min="-60" max="0" value="-48" step="1">
          <span id="thresholdValue">-48 dB (0.004)</span>
        </label>
        <span id="status">Click Start to begin</span>
      </div>
      <div id="frequencyDisplay">
        <label>
          <span>Frequency Estimation:</span>
          <select id="frequencyMethod">
            <option value="zero-crossing">Zero-Crossing</option>
            <option value="autocorrelation" selected>Autocorrelation</option>
            <option value="fft">FFT</option>
          </select>
        </label>
        <div>
          <span>Frequency:</span>
          <span id="frequencyValue">--- Hz</span>
        </div>
        <div>
          <span>Auto Gain:</span>
          <span id="gainValue">---x</span>
        </div>
      </div>
    `;

    // Get DOM element references
    canvas = document.getElementById('canvas') as HTMLCanvasElement;
    startButton = document.getElementById('startButton') as HTMLButtonElement;
    autoGainCheckbox = document.getElementById('autoGainCheckbox') as HTMLInputElement;
    noiseGateCheckbox = document.getElementById('noiseGateCheckbox') as HTMLInputElement;
    fftDisplayCheckbox = document.getElementById('fftDisplayCheckbox') as HTMLInputElement;
    usePeakModeCheckbox = document.getElementById('usePeakModeCheckbox') as HTMLInputElement;
    noiseGateThreshold = document.getElementById('noiseGateThreshold') as HTMLInputElement;
    thresholdValue = document.getElementById('thresholdValue') as HTMLSpanElement;
    statusElement = document.getElementById('status') as HTMLSpanElement;
    frequencyMethod = document.getElementById('frequencyMethod') as HTMLSelectElement;
    frequencyValue = document.getElementById('frequencyValue') as HTMLSpanElement;
    gainValue = document.getElementById('gainValue') as HTMLSpanElement;

    // Mock canvas context
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

    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((cb) => {
      setTimeout(cb, 16);
      return 1;
    }) as any;
    
    global.cancelAnimationFrame = vi.fn();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  describe('DOM Element Validation', () => {
    it('should find all required DOM elements', () => {
      expect(canvas).toBeTruthy();
      expect(startButton).toBeTruthy();
      expect(autoGainCheckbox).toBeTruthy();
      expect(noiseGateCheckbox).toBeTruthy();
      expect(fftDisplayCheckbox).toBeTruthy();
      expect(usePeakModeCheckbox).toBeTruthy();
      expect(noiseGateThreshold).toBeTruthy();
      expect(thresholdValue).toBeTruthy();
      expect(statusElement).toBeTruthy();
      expect(frequencyMethod).toBeTruthy();
      expect(frequencyValue).toBeTruthy();
      expect(gainValue).toBeTruthy();
    });

    it('should have correct initial checkbox states', () => {
      expect(autoGainCheckbox.checked).toBe(true);
      expect(noiseGateCheckbox.checked).toBe(true);
      expect(fftDisplayCheckbox.checked).toBe(true);
      expect(usePeakModeCheckbox.checked).toBe(false);
    });

    it('should have correct initial threshold value', () => {
      expect(noiseGateThreshold.value).toBe('-48');
      expect(thresholdValue.textContent).toBe('-48 dB (0.004)');
    });

    it('should have autocorrelation selected by default', () => {
      expect(frequencyMethod.value).toBe('autocorrelation');
    });
  });

  describe('Slider Value Conversion', () => {
    it('should convert slider value -60 to threshold ~0.001', () => {
      const sliderValue = '-60';
      const db = parseFloat(sliderValue);
      const threshold = dbToAmplitude(db);
      expect(threshold).toBeCloseTo(0.001, 4);
    });

    it('should convert slider value -40 to threshold ~0.01', () => {
      const sliderValue = '-40';
      const db = parseFloat(sliderValue);
      const threshold = dbToAmplitude(db);
      expect(threshold).toBeCloseTo(0.01, 4);
    });

    it('should convert slider value -20 to threshold ~0.1', () => {
      const sliderValue = '-20';
      const db = parseFloat(sliderValue);
      const threshold = dbToAmplitude(db);
      expect(threshold).toBeCloseTo(0.1, 4);
    });

    it('should convert slider value 0 to threshold 1.0', () => {
      const sliderValue = '0';
      const db = parseFloat(sliderValue);
      const threshold = dbToAmplitude(db);
      expect(threshold).toBeCloseTo(1.0, 4);
    });

    it('should handle invalid slider values', () => {
      const sliderValue = 'invalid';
      const db = parseFloat(sliderValue);
      expect(Number.isNaN(db)).toBe(true);
    });
  });

  describe('Canvas Properties', () => {
    it('should have correct canvas dimensions', () => {
      expect(canvas.width).toBe(800);
      expect(canvas.height).toBe(400);
    });

    it('should be able to get 2D context', () => {
      const ctx = canvas.getContext('2d');
      expect(ctx).toBeTruthy();
    });
  });

  describe('Button States', () => {
    it('should have Start button with correct initial text', () => {
      expect(startButton.textContent).toBe('Start');
      expect(startButton.disabled).toBe(false);
    });

    it('should have correct initial status text', () => {
      expect(statusElement.textContent).toBe('Click Start to begin');
    });
  });

  describe('Frequency Display Elements', () => {
    it('should have all frequency method options', () => {
      const options = Array.from(frequencyMethod.options).map(opt => opt.value);
      expect(options).toContain('zero-crossing');
      expect(options).toContain('autocorrelation');
      expect(options).toContain('fft');
    });

    it('should have placeholder frequency value', () => {
      expect(frequencyValue.textContent).toBe('--- Hz');
    });

    it('should have placeholder gain value', () => {
      expect(gainValue.textContent).toBe('---x');
    });
  });
});
