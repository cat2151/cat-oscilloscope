import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PianoKeyboardRenderer } from '../PianoKeyboardRenderer';

describe('PianoKeyboardRenderer', () => {
  let canvas: HTMLCanvasElement;
  let renderer: PianoKeyboardRenderer;
  let mockContext: any;

  beforeEach(() => {
    // Create mock canvas element
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 80;

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
    };

    canvas.getContext = vi.fn(() => mockContext) as any;
    document.body.appendChild(canvas);
  });

  afterEach(() => {
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    vi.clearAllMocks();
  });

  it('should create a renderer instance', () => {
    renderer = new PianoKeyboardRenderer(canvas);
    expect(renderer).toBeDefined();
  });

  it('should render without throwing errors', () => {
    renderer = new PianoKeyboardRenderer(canvas);
    expect(() => renderer.render(0)).not.toThrow();
  });

  it('should render with a frequency value', () => {
    renderer = new PianoKeyboardRenderer(canvas);
    expect(() => renderer.render(440)).not.toThrow();
  });

  it('should render frequencies within range (50Hz - 1000Hz)', () => {
    renderer = new PianoKeyboardRenderer(canvas);
    expect(() => renderer.render(50)).not.toThrow();
    expect(() => renderer.render(500)).not.toThrow();
    expect(() => renderer.render(1000)).not.toThrow();
  });

  it('should handle frequencies outside range gracefully', () => {
    renderer = new PianoKeyboardRenderer(canvas);
    expect(() => renderer.render(20)).not.toThrow();
    expect(() => renderer.render(2000)).not.toThrow();
  });

  it('should handle zero frequency', () => {
    renderer = new PianoKeyboardRenderer(canvas);
    expect(() => renderer.render(0)).not.toThrow();
  });

  it('should handle negative frequency', () => {
    renderer = new PianoKeyboardRenderer(canvas);
    expect(() => renderer.render(-100)).not.toThrow();
  });

  it('should clear the canvas', () => {
    renderer = new PianoKeyboardRenderer(canvas);
    renderer.render(440);
    expect(() => renderer.clear()).not.toThrow();
  });

  it('should throw error if canvas context is not available', () => {
    // Mock canvas without 2D context
    const mockCanvas = {
      getContext: () => null
    } as unknown as HTMLCanvasElement;

    expect(() => new PianoKeyboardRenderer(mockCanvas)).toThrow('Could not get 2D context for piano keyboard');
  });

  it('should render different frequencies sequentially', () => {
    renderer = new PianoKeyboardRenderer(canvas);
    // A4 (440 Hz)
    expect(() => renderer.render(440)).not.toThrow();
    
    // C4 (261.63 Hz)
    expect(() => renderer.render(261.63)).not.toThrow();
    
    // G3 (196 Hz)
    expect(() => renderer.render(196)).not.toThrow();
    
    // A5 (880 Hz)
    expect(() => renderer.render(880)).not.toThrow();
  });
});
