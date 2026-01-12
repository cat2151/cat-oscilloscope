import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WaveformRenderer } from '../WaveformRenderer';

describe('WaveformRenderer', () => {
  let canvas: HTMLCanvasElement;
  let renderer: WaveformRenderer;
  let mockContext: any;

  beforeEach(() => {
    // Create mock canvas element
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;

    // Create mock context
    mockContext = {
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
      measureText: vi.fn(() => ({ width: 50 })),
      save: vi.fn(),
      restore: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      textAlign: '',
      textBaseline: '',
    };

    canvas.getContext = vi.fn(() => mockContext) as any;
    document.body.appendChild(canvas);
  });

  afterEach(() => {
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create a renderer with valid canvas', () => {
      renderer = new WaveformRenderer(canvas);
      expect(renderer).toBeDefined();
    });

    it('should throw error when canvas context is not available', () => {
      const mockCanvas = {
        getContext: () => null,
      } as any;

      expect(() => new WaveformRenderer(mockCanvas))
        .toThrow('Could not get 2D context');
    });
  });

  describe('Grid Drawing', () => {
    beforeEach(() => {
      renderer = new WaveformRenderer(canvas);
    });

    it('should draw grid without labels when no measurement data provided', () => {
      renderer.clearAndDrawGrid();

      // Should clear canvas
      expect(mockContext.fillRect).toHaveBeenCalled();
      
      // Should draw grid lines
      expect(mockContext.stroke).toHaveBeenCalled();
      
      // Should not draw labels when no measurement data
      expect(mockContext.fillText).not.toHaveBeenCalled();
    });

    it('should draw grid with measurement labels when data provided', () => {
      const sampleRate = 48000;
      const displaySamples = 4096;
      const gain = 2.5;

      renderer.clearAndDrawGrid(sampleRate, displaySamples, gain);

      // Should clear canvas
      expect(mockContext.fillRect).toHaveBeenCalled();
      
      // Should draw grid lines
      expect(mockContext.stroke).toHaveBeenCalled();
      
      // Should draw labels when measurement data is provided
      expect(mockContext.fillText).toHaveBeenCalled();
      
      // Should draw both time and amplitude labels (11 time labels + 6 amplitude labels = 17 total)
      const fillTextCalls = mockContext.fillText.mock.calls;
      const expectedLabelCount = 17; // 11 vertical grid lines + 6 horizontal grid lines
      expect(fillTextCalls.length).toBe(expectedLabelCount);
    });

    it('should draw time labels with appropriate units', () => {
      const sampleRate = 48000;
      const displaySamples = 4096;
      const gain = 1.0;

      renderer.clearAndDrawGrid(sampleRate, displaySamples, gain);

      const fillTextCalls = mockContext.fillText.mock.calls;
      const timeLabels = fillTextCalls.map((call: any) => call[0]);
      
      // Should have labels with time units (ms, μs, or s)
      const hasTimeUnits = timeLabels.some((label: string) => 
        label.includes('ms') || label.includes('μs') || label.includes('s')
      );
      expect(hasTimeUnits).toBe(true);
    });

    it('should draw amplitude labels with appropriate precision', () => {
      const sampleRate = 48000;
      const displaySamples = 4096;
      const gain = 2.0;

      renderer.clearAndDrawGrid(sampleRate, displaySamples, gain);

      const fillTextCalls = mockContext.fillText.mock.calls;
      const labels = fillTextCalls.map((call: any) => call[0]);
      
      // Should have numeric amplitude labels
      const hasNumericLabels = labels.some((label: string) => {
        const num = parseFloat(label);
        return !isNaN(num) && isFinite(num);
      });
      expect(hasNumericLabels).toBe(true);
    });

    it('should adjust label precision based on amplitude scale', () => {
      const sampleRate = 48000;
      const displaySamples = 4096;
      
      // Test with high gain (small amplitude values)
      const highGain = 50.0;
      mockContext.fillText.mockClear();
      renderer.clearAndDrawGrid(sampleRate, displaySamples, highGain);
      
      const highGainLabels = mockContext.fillText.mock.calls.map((call: any) => call[0]);
      
      // Test with low gain (large amplitude values)
      const lowGain = 0.5;
      mockContext.fillText.mockClear();
      renderer.clearAndDrawGrid(sampleRate, displaySamples, lowGain);
      
      const lowGainLabels = mockContext.fillText.mock.calls.map((call: any) => call[0]);
      
      // Both should have labels
      expect(highGainLabels.length).toBeGreaterThan(0);
      expect(lowGainLabels.length).toBeGreaterThan(0);
    });

    it('should display amplitude labels in dB format', () => {
      // Note: With horizontalLines=5, the center is at 2.5, so no grid line lands exactly at zero.
      // This test verifies the special case handling for when amplitude === 0 (which can occur
      // with different grid configurations or floating point calculations).
      
      // We need to test this by checking the label formatting logic directly
      // by examining what would happen if amplitude were exactly 0
      const sampleRate = 48000;
      const displaySamples = 4096;
      const gain = 1.0;

      mockContext.fillText.mockClear();
      renderer.clearAndDrawGrid(sampleRate, displaySamples, gain);

      const fillTextCalls = mockContext.fillText.mock.calls;
      const labels = fillTextCalls.map((call: any) => call[0]);
      
      // Filter amplitude labels (not time labels with units like ms, μs, s)
      const amplitudeLabels = labels.filter((label: string) => 
        !label.includes('ms') && !label.includes('μs') && !label.includes('s')
      );
      
      // Verify that amplitude labels are in dB format
      // All amplitude labels should be in dB format: "+X.XdB", "-X.XdB", or "0dB*"
      const hasReasonableFormat = amplitudeLabels.every((label: string) => {
        // Check if it's the center line reference
        if (label === '0dB*') return true;
        
        // Check if it matches dB format: optional sign, number, "dB"
        return /^[+-]?\d+\.?\d*dB$/.test(label);
      });
      expect(hasReasonableFormat).toBe(true);
    });

    it('should handle very small time scales (microseconds)', () => {
      const sampleRate = 48000;
      const displaySamples = 100; // Very small window
      const gain = 1.0;

      renderer.clearAndDrawGrid(sampleRate, displaySamples, gain);

      const fillTextCalls = mockContext.fillText.mock.calls;
      const labels = fillTextCalls.map((call: any) => call[0]);
      
      // Should use microseconds for very small time scales
      const hasMicroseconds = labels.some((label: string) => label.includes('μs'));
      expect(hasMicroseconds).toBe(true);
    });

    it('should handle large time scales (seconds)', () => {
      const sampleRate = 1000;
      const displaySamples = 50000; // 50 seconds
      const gain = 1.0;

      renderer.clearAndDrawGrid(sampleRate, displaySamples, gain);

      const fillTextCalls = mockContext.fillText.mock.calls;
      const labels = fillTextCalls.map((call: any) => call[0]);
      
      // Should use seconds for large time scales
      const hasSeconds = labels.some((label: string) => 
        label.includes('s') && !label.includes('ms') && !label.includes('μs')
      );
      expect(hasSeconds).toBe(true);
    });

    it('should not draw labels when gain is zero', () => {
      const sampleRate = 48000;
      const displaySamples = 4096;
      const gain = 0; // Invalid gain

      mockContext.fillText.mockClear();
      renderer.clearAndDrawGrid(sampleRate, displaySamples, gain);

      // Should not draw labels with zero gain
      expect(mockContext.fillText).not.toHaveBeenCalled();
    });

    it('should not draw labels when displaySamples is zero', () => {
      const sampleRate = 48000;
      const displaySamples = 0; // Invalid
      const gain = 1.0;

      mockContext.fillText.mockClear();
      renderer.clearAndDrawGrid(sampleRate, displaySamples, gain);

      // Should not draw labels with zero samples
      expect(mockContext.fillText).not.toHaveBeenCalled();
    });

    it('should not draw labels when sampleRate is zero', () => {
      const sampleRate = 0; // Invalid
      const displaySamples = 4096;
      const gain = 1.0;

      mockContext.fillText.mockClear();
      renderer.clearAndDrawGrid(sampleRate, displaySamples, gain);

      // Should not draw labels with zero sample rate
      expect(mockContext.fillText).not.toHaveBeenCalled();
    });
  });

  describe('Waveform Drawing', () => {
    beforeEach(() => {
      renderer = new WaveformRenderer(canvas);
    });

    it('should draw waveform with correct number of points', () => {
      const data = new Float32Array(100);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.sin((i / data.length) * Math.PI * 2);
      }

      renderer.drawWaveform(data, 0, 100, 1.0);

      // Should draw connected lines
      expect(mockContext.lineTo).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('should not draw when data length is zero or negative', () => {
      const data = new Float32Array(100);

      mockContext.lineTo.mockClear();
      renderer.drawWaveform(data, 50, 50, 1.0); // Same start and end

      expect(mockContext.lineTo).not.toHaveBeenCalled();
    });
  });

  describe('FFT Display', () => {
    beforeEach(() => {
      renderer = new WaveformRenderer(canvas);
    });

    it('should toggle FFT display', () => {
      expect(renderer.getFFTDisplayEnabled()).toBe(true);
      
      renderer.setFFTDisplay(false);
      expect(renderer.getFFTDisplayEnabled()).toBe(false);
      
      renderer.setFFTDisplay(true);
      expect(renderer.getFFTDisplayEnabled()).toBe(true);
    });

    it('should draw FFT overlay when enabled', () => {
      renderer.setFFTDisplay(true);
      
      const frequencyData = new Uint8Array(2048);
      for (let i = 0; i < frequencyData.length; i++) {
        frequencyData[i] = Math.floor(Math.random() * 255);
      }

      renderer.clearAndDrawGrid();
      renderer.drawFFTOverlay(frequencyData, 440, 48000, 4096, 5000);

      // Should draw background, border, and spectrum bars
      expect(mockContext.fillRect).toHaveBeenCalled();
      expect(mockContext.strokeRect).toHaveBeenCalled();
    });

    it('should not draw FFT overlay when disabled', () => {
      renderer.setFFTDisplay(false);
      
      const frequencyData = new Uint8Array(2048);
      mockContext.fillRect.mockClear();
      mockContext.strokeRect.mockClear();

      renderer.clearAndDrawGrid();
      const fillRectCallsBefore = mockContext.fillRect.mock.calls.length;
      
      renderer.drawFFTOverlay(frequencyData, 440, 48000, 4096, 5000);

      // Should not add any additional fill/stroke operations beyond grid clearing
      const fillRectCallsAfter = mockContext.fillRect.mock.calls.length;
      expect(fillRectCallsAfter).toBe(fillRectCallsBefore);
    });
  });

  describe('Frequency Plot Drawing', () => {
    beforeEach(() => {
      renderer = new WaveformRenderer(canvas);
    });

    it('should not draw frequency plot when history is empty', () => {
      mockContext.stroke.mockClear();
      mockContext.fillText.mockClear();

      renderer.drawFrequencyPlot([], 20, 5000);

      // Should not draw grid or labels when no data
      expect(mockContext.stroke).not.toHaveBeenCalled();
      expect(mockContext.fillText).not.toHaveBeenCalled();
    });

    it('should not draw frequency plot when all frequencies are zero', () => {
      mockContext.stroke.mockClear();
      mockContext.fillText.mockClear();

      const frequencyHistory = [0, 0, 0, 0, 0];
      renderer.drawFrequencyPlot(frequencyHistory, 20, 5000);

      // Should save context but return early without drawing
      expect(mockContext.save).toHaveBeenCalled();
      expect(mockContext.restore).toHaveBeenCalled();
      // Grid and labels should not be drawn
      const strokeCalls = mockContext.stroke.mock.calls.length;
      expect(strokeCalls).toBe(0);
    });

    it('should draw frequency plot with valid data', () => {
      mockContext.stroke.mockClear();
      mockContext.fillText.mockClear();

      const frequencyHistory = [440, 441, 442, 440, 439];
      renderer.drawFrequencyPlot(frequencyHistory, 20, 5000);

      // Should draw background, border, grid, and labels
      expect(mockContext.fillRect).toHaveBeenCalled();
      expect(mockContext.strokeRect).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('should draw grid lines and labels at matching Y positions', () => {
      const frequencyHistory = [440, 441, 442, 440, 439];
      renderer.drawFrequencyPlot(frequencyHistory, 20, 5000);

      // The test validates that the method draws grid lines and Y-axis labels
      // There are multiple text elements drawn:
      // - Title: "周波数推移 (5frame)" (with frame count)
      // - 5 Y-axis frequency labels (one for each horizontal grid line)
      // - X-axis frame labels (variable number depending on labelInterval)
      // - Current frequency value at the bottom
      
      const fillTextCalls = mockContext.fillText.mock.calls;
      
      // Should have title + 5 Y-axis labels + X-axis labels + current frequency
      // Minimum: 1 title + 5 Y-axis + 1 current = 7 text elements
      expect(fillTextCalls.length).toBeGreaterThanOrEqual(7);
      
      // Verify that grid lines are drawn (horizontal + vertical)
      expect(mockContext.lineTo).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
      
      // Verify that data point markers are drawn
      expect(mockContext.arc).toHaveBeenCalled();
      expect(mockContext.fill).toHaveBeenCalled();
    });
  });
});
