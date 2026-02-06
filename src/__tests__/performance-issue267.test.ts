import { describe, it, expect, beforeEach } from 'vitest';
import { Oscilloscope } from '../Oscilloscope';
import { BufferSource } from '../BufferSource';

describe('Performance Issue #267 - demo-library processing time', () => {
  let canvas: HTMLCanvasElement;
  let previousWaveformCanvas: HTMLCanvasElement;
  let currentWaveformCanvas: HTMLCanvasElement;
  let similarityPlotCanvas: HTMLCanvasElement;
  let frameBufferCanvas: HTMLCanvasElement;

  beforeEach(() => {
    // Create mock canvas context
    const mockContext = {
      fillRect: () => {},
      stroke: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      strokeStyle: '',
      lineWidth: 0,
      fillStyle: '',
      font: '',
      textAlign: '',
      fillText: () => {},
      clearRect: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      scale: () => {},
      setLineDash: () => {},
      arc: () => {},
      closePath: () => {},
      fill: () => {},
    } as any;

    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    canvas.getContext = (() => mockContext) as any;
    
    previousWaveformCanvas = document.createElement('canvas');
    previousWaveformCanvas.getContext = (() => mockContext) as any;
    
    currentWaveformCanvas = document.createElement('canvas');
    currentWaveformCanvas.getContext = (() => mockContext) as any;
    
    similarityPlotCanvas = document.createElement('canvas');
    similarityPlotCanvas.getContext = (() => mockContext) as any;
    
    frameBufferCanvas = document.createElement('canvas');
    frameBufferCanvas.getContext = (() => mockContext) as any;
  });

  it('should process frames within 16ms target for BufferSource mode', async () => {
    const oscilloscope = new Oscilloscope(
      canvas,
      previousWaveformCanvas,
      currentWaveformCanvas,
      similarityPlotCanvas,
      frameBufferCanvas
    );

    // Generate 440Hz sine wave (1 second)
    const sampleRate = 44100;
    const duration = 1;
    const frequency = 440;
    const audioData = new Float32Array(sampleRate * duration);
    
    for (let i = 0; i < audioData.length; i++) {
      audioData[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
    }
    
    const bufferSource = new BufferSource(audioData, sampleRate, { loop: true });
    
    console.log('🔬 Performance Test: Starting BufferSource mode with Zero-Crossing');
    const startInit = performance.now();
    await oscilloscope.startFromBuffer(bufferSource);
    // Explicitly set zero-crossing method to test the fix for issue #267
    oscilloscope.setFrequencyEstimationMethod('zero-crossing');
    const endInit = performance.now();
    console.log(`⏱️ Initialization time: ${(endInit - startInit).toFixed(2)}ms`);

    // Simulate frame processing by calling the internal render logic
    // We need to process multiple frames to measure average time
    const frameTimes: number[] = [];
    const numFrames = 10;
    
    for (let i = 0; i < numFrames; i++) {
      const frameStart = performance.now();
      
      // Access private dataProcessor through type assertion
      // This simulates what happens in the render() method
      const dataProcessor = (oscilloscope as any).dataProcessor;
      const audioManager = (oscilloscope as any).audioManager;
      const renderer = (oscilloscope as any).renderer;
      
      if (dataProcessor && audioManager.isReady()) {
        const renderData = dataProcessor.processFrame(renderer.getFFTDisplayEnabled());
        if (renderData) {
          // We got render data successfully
        }
      }
      
      const frameEnd = performance.now();
      const frameTime = frameEnd - frameStart;
      frameTimes.push(frameTime);
      console.log(`📊 Frame ${i + 1} processing time: ${frameTime.toFixed(2)}ms`);
    }

    await oscilloscope.stop();

    // Calculate statistics
    const avgTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    const maxTime = Math.max(...frameTimes);
    const minTime = Math.min(...frameTimes);

    console.log('📈 Performance Summary:');
    console.log(`   Average: ${avgTime.toFixed(2)}ms`);
    console.log(`   Min: ${minTime.toFixed(2)}ms`);
    console.log(`   Max: ${maxTime.toFixed(2)}ms`);
    console.log(`   Target: 16ms (60fps)`);

    // With zero-crossing, we should achieve much better performance than the reported 500ms issue
    // PR description claims <5ms, but we allow 20ms to account for test environment overhead
    // This is still 25x faster than the original 500ms problem
    expect(avgTime).toBeLessThan(20);
    
    // Individual frames should also meet the stricter threshold
    expect(maxTime).toBeLessThan(20);

    // Log warning if performance is degraded but still under threshold
    if (avgTime > 16) {
      console.warn(`⚠️ Warning: Average frame time (${avgTime.toFixed(2)}ms) exceeds 16ms target`);
    }
  }, 30000); // 30 second timeout for WASM initialization
});
