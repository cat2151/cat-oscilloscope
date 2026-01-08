import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComparisonPanelRenderer } from '../ComparisonPanelRenderer';

describe('ComparisonPanelRenderer', () => {
  let previousCanvas: HTMLCanvasElement;
  let currentCanvas: HTMLCanvasElement;
  let bufferCanvas: HTMLCanvasElement;
  let renderer: ComparisonPanelRenderer;

  beforeEach(() => {
    // Create mock canvas elements
    previousCanvas = document.createElement('canvas');
    previousCanvas.width = 250;
    previousCanvas.height = 150;

    currentCanvas = document.createElement('canvas');
    currentCanvas.width = 250;
    currentCanvas.height = 150;

    bufferCanvas = document.createElement('canvas');
    bufferCanvas.width = 250;
    bufferCanvas.height = 150;

    // Create mock contexts
    const prevMockContext = {
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

    const currMockContext = {
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

    const buffMockContext = {
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

    previousCanvas.getContext = vi.fn(() => prevMockContext) as any;
    currentCanvas.getContext = vi.fn(() => currMockContext) as any;
    bufferCanvas.getContext = vi.fn(() => buffMockContext) as any;

    document.body.appendChild(previousCanvas);
    document.body.appendChild(currentCanvas);
    document.body.appendChild(bufferCanvas);
  });

  afterEach(() => {
    if (previousCanvas.parentNode) previousCanvas.parentNode.removeChild(previousCanvas);
    if (currentCanvas.parentNode) currentCanvas.parentNode.removeChild(currentCanvas);
    if (bufferCanvas.parentNode) bufferCanvas.parentNode.removeChild(bufferCanvas);
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create a renderer with valid canvases', () => {
      renderer = new ComparisonPanelRenderer(previousCanvas, currentCanvas, bufferCanvas);
      expect(renderer).toBeDefined();
    });

    it('should throw error when canvas context is not available', () => {
      const mockCanvas = {
        getContext: () => null,
      } as any;

      expect(() => new ComparisonPanelRenderer(mockCanvas, currentCanvas, bufferCanvas))
        .toThrow('Could not get 2D context for comparison canvases');
    });

    it('should initialize all canvases with black background', () => {
      renderer = new ComparisonPanelRenderer(previousCanvas, currentCanvas, bufferCanvas);
      
      const prevCtx = previousCanvas.getContext('2d') as any;
      const currCtx = currentCanvas.getContext('2d') as any;
      const buffCtx = bufferCanvas.getContext('2d') as any;

      // Each canvas should be cleared (fillRect called)
      expect(prevCtx.fillRect).toHaveBeenCalled();
      expect(currCtx.fillRect).toHaveBeenCalled();
      expect(buffCtx.fillRect).toHaveBeenCalled();
    });
  });

  describe('updatePanels', () => {
    beforeEach(() => {
      renderer = new ComparisonPanelRenderer(previousCanvas, currentCanvas, bufferCanvas);
    });

    it('should update all panels with valid data', () => {
      const previousWaveform = new Float32Array(100).fill(0.5);
      const currentWaveform = new Float32Array(200).fill(0.3);
      const fullBuffer = new Float32Array(200).fill(0.3);
      const similarity = 0.95;

      renderer.updatePanels(previousWaveform, currentWaveform, 0, 100, fullBuffer, similarity);

      // Verify that drawing operations were called on all contexts
      const prevCtx = previousCanvas.getContext('2d') as any;
      const currCtx = currentCanvas.getContext('2d') as any;
      const buffCtx = bufferCanvas.getContext('2d') as any;

      expect(prevCtx.stroke).toHaveBeenCalled();
      expect(currCtx.stroke).toHaveBeenCalled();
      expect(buffCtx.stroke).toHaveBeenCalled();
    });

    it('should handle null previous waveform', () => {
      const currentWaveform = new Float32Array(200).fill(0.3);
      const fullBuffer = new Float32Array(200).fill(0.3);
      const similarity = 0;

      renderer.updatePanels(null, currentWaveform, 0, 100, fullBuffer, similarity);

      // Should still work without errors
      const currCtx = currentCanvas.getContext('2d') as any;
      expect(currCtx.fillRect).toHaveBeenCalled();
    });

    it('should draw similarity text when previous waveform exists', () => {
      const previousWaveform = new Float32Array(100).fill(0.5);
      const currentWaveform = new Float32Array(200).fill(0.3);
      const fullBuffer = new Float32Array(200).fill(0.3);
      const similarity = 0.87;

      renderer.updatePanels(previousWaveform, currentWaveform, 0, 100, fullBuffer, similarity);

      const currCtx = currentCanvas.getContext('2d') as any;
      expect(currCtx.fillText).toHaveBeenCalled();
      
      // Check if similarity text was drawn
      const fillTextCalls = currCtx.fillText.mock.calls;
      const similarityTextCall = fillTextCalls.find((call: any) => 
        call[0].includes('Similarity')
      );
      expect(similarityTextCall).toBeDefined();
    });

    it('should draw position markers on buffer canvas', () => {
      const previousWaveform = new Float32Array(100).fill(0.5);
      const currentWaveform = new Float32Array(200).fill(0.3);
      const fullBuffer = new Float32Array(200).fill(0.3);
      const similarity = 0.9;
      const startIndex = 50;
      const endIndex = 150;

      renderer.updatePanels(previousWaveform, currentWaveform, startIndex, endIndex, fullBuffer, similarity);

      const buffCtx = bufferCanvas.getContext('2d') as any;
      
      // Position markers are drawn as lines
      expect(buffCtx.moveTo).toHaveBeenCalled();
      expect(buffCtx.lineTo).toHaveBeenCalled();
      
      // Labels 'S' and 'E' should be drawn
      const fillTextCalls = buffCtx.fillText.mock.calls;
      const hasStartLabel = fillTextCalls.some((call: any) => call[0] === 'S');
      const hasEndLabel = fillTextCalls.some((call: any) => call[0] === 'E');
      
      expect(hasStartLabel).toBe(true);
      expect(hasEndLabel).toBe(true);
    });
  });

  describe('clear', () => {
    beforeEach(() => {
      renderer = new ComparisonPanelRenderer(previousCanvas, currentCanvas, bufferCanvas);
    });

    it('should clear all canvases', () => {
      const prevCtx = previousCanvas.getContext('2d') as any;
      const currCtx = currentCanvas.getContext('2d') as any;
      const buffCtx = bufferCanvas.getContext('2d') as any;

      // Clear the mocks
      prevCtx.fillRect.mockClear();
      currCtx.fillRect.mockClear();
      buffCtx.fillRect.mockClear();

      renderer.clear();

      // All canvases should be cleared
      expect(prevCtx.fillRect).toHaveBeenCalled();
      expect(currCtx.fillRect).toHaveBeenCalled();
      expect(buffCtx.fillRect).toHaveBeenCalled();
    });
  });

  describe('Auto-scaling', () => {
    beforeEach(() => {
      renderer = new ComparisonPanelRenderer(previousCanvas, currentCanvas, bufferCanvas);
    });

    it('should auto-scale small amplitude waveforms to fill vertical space', () => {
      // Create a waveform with small amplitude (0.01 peak)
      const smallWaveform = new Float32Array(100);
      for (let i = 0; i < smallWaveform.length; i++) {
        smallWaveform[i] = 0.01 * Math.sin((i / smallWaveform.length) * Math.PI * 2);
      }
      const fullBuffer = new Float32Array(100).fill(0);

      renderer.updatePanels(null, smallWaveform, 0, 100, fullBuffer, 0);

      const currCtx = currentCanvas.getContext('2d') as any;
      
      // Verify that drawing operations were called
      expect(currCtx.lineTo).toHaveBeenCalled();
      
      // The waveform should be drawn (lineTo called multiple times)
      expect(currCtx.lineTo.mock.calls.length).toBeGreaterThan(10);
    });

    it('should handle zero amplitude waveforms without errors', () => {
      // Create a waveform with zero amplitude
      const zeroWaveform = new Float32Array(100).fill(0);
      const fullBuffer = new Float32Array(100).fill(0);

      // Should not throw
      expect(() => {
        renderer.updatePanels(null, zeroWaveform, 0, 100, fullBuffer, 0);
      }).not.toThrow();
    });

    it('should handle very small amplitude waveforms (below threshold)', () => {
      // Create a waveform with very small amplitude (0.0001, below MIN_PEAK_THRESHOLD)
      const tinyWaveform = new Float32Array(100);
      for (let i = 0; i < tinyWaveform.length; i++) {
        tinyWaveform[i] = 0.0001 * Math.sin((i / tinyWaveform.length) * Math.PI * 2);
      }
      const fullBuffer = new Float32Array(100).fill(0);

      // Should not throw and should use default scaling
      expect(() => {
        renderer.updatePanels(null, tinyWaveform, 0, 100, fullBuffer, 0);
      }).not.toThrow();

      const currCtx = currentCanvas.getContext('2d') as any;
      expect(currCtx.lineTo).toHaveBeenCalled();
    });

    it('should auto-scale previous waveform independently', () => {
      // Create waveforms with different amplitudes
      const previousWaveform = new Float32Array(100);
      const currentWaveform = new Float32Array(200);
      
      for (let i = 0; i < previousWaveform.length; i++) {
        previousWaveform[i] = 0.05 * Math.sin((i / previousWaveform.length) * Math.PI * 2);
      }
      for (let i = 0; i < currentWaveform.length; i++) {
        currentWaveform[i] = 0.02 * Math.sin((i / currentWaveform.length) * Math.PI * 2);
      }
      const fullBuffer = new Float32Array(200).fill(0);

      renderer.updatePanels(previousWaveform, currentWaveform, 0, 100, fullBuffer, 0.85);

      const prevCtx = previousCanvas.getContext('2d') as any;
      const currCtx = currentCanvas.getContext('2d') as any;

      // Both should be drawn with their own scaling
      expect(prevCtx.lineTo).toHaveBeenCalled();
      expect(currCtx.lineTo).toHaveBeenCalled();
    });

    it('should auto-scale frame buffer waveform independently', () => {
      // Create a full buffer with different amplitude
      const currentWaveform = new Float32Array(200);
      const fullBuffer = new Float32Array(200);
      
      for (let i = 0; i < currentWaveform.length; i++) {
        currentWaveform[i] = 0.01 * Math.sin((i / currentWaveform.length) * Math.PI * 2);
      }
      for (let i = 0; i < fullBuffer.length; i++) {
        fullBuffer[i] = 0.03 * Math.sin((i / fullBuffer.length) * Math.PI * 2);
      }

      renderer.updatePanels(null, currentWaveform, 0, 100, fullBuffer, 0);

      const buffCtx = bufferCanvas.getContext('2d') as any;

      // Frame buffer should be drawn with its own scaling
      expect(buffCtx.lineTo).toHaveBeenCalled();
    });
  });
});
