import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DOMElementManager } from '../DOMElementManager';
import { UIEventHandlers } from '../UIEventHandlers';
import { Oscilloscope } from '../Oscilloscope';
import { DisplayUpdater } from '../DisplayUpdater';
import { PianoKeyboardRenderer } from '../PianoKeyboardRenderer';

describe('Cycle Similarity Display Toggle', () => {
  let cycleSimilarityPanel: HTMLDivElement;
  let cycleSimilarityDisplayCheckbox: HTMLInputElement;
  let dom: DOMElementManager;

  beforeEach(() => {
    // Setup DOM elements with all required elements
    document.body.innerHTML = `
      <canvas id="canvas" width="800" height="350"></canvas>
      <canvas id="previousWaveformCanvas" width="250" height="120"></canvas>
      <canvas id="currentWaveformCanvas" width="250" height="120"></canvas>
      <canvas id="similarityPlotCanvas" width="250" height="120"></canvas>
      <canvas id="frameBufferCanvas" width="800" height="120"></canvas>
      <canvas id="pianoKeyboardCanvas" width="800" height="60"></canvas>
      
      <div id="cycleSimilarityPanel" style="display: none;">
        <div class="canvasContainer">
          <span class="canvasLabel">8分割 (1/2周期ごとの類似度)</span>
          <canvas id="cycleSimilarity8divCanvas" width="250" height="150"></canvas>
        </div>
        <div class="canvasContainer">
          <span class="canvasLabel">4分割 (1周期ごとの類似度)</span>
          <canvas id="cycleSimilarity4divCanvas" width="250" height="150"></canvas>
        </div>
        <div class="canvasContainer">
          <span class="canvasLabel">2分割 (2周期ごとの類似度)</span>
          <canvas id="cycleSimilarity2divCanvas" width="250" height="150"></canvas>
        </div>
      </div>
      
      <div id="controls">
        <button id="startButton">Start</button>
        <button id="loadFileButton">Load WAV File</button>
        <input type="file" id="fileInput" accept="audio/wav">
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
          <input type="checkbox" id="harmonicAnalysisCheckbox">
          <span>倍音分析</span>
        </label>
        <label>
          <input type="checkbox" id="pauseDrawingCheckbox">
          <span>描画の一時停止</span>
        </label>
        <label>
          <input type="checkbox" id="phaseMarkerRangeCheckbox" checked>
          <span>位相マーカー範囲のみ表示</span>
        </label>
        <label>
          <input type="checkbox" id="cycleSimilarityDisplayCheckbox">
          <span>周期類似度表示</span>
        </label>
        <label>
          <span>Threshold:</span>
          <input type="range" id="noiseGateThreshold" min="-60" max="0" value="-60" step="1">
          <span id="thresholdValue">-60 dB (0.001)</span>
        </label>
        <span id="status">Click Start to begin</span>
      </div>
      
      <div id="frequencyDisplay">
        <label>
          <span>Frequency Estimation:</span>
          <select id="frequencyMethod">
            <option value="zero-crossing">Zero-Crossing</option>
            <option value="autocorrelation">Autocorrelation</option>
            <option value="fft" selected>FFT</option>
          </select>
        </label>
        <label>
          <span>Buffer Size:</span>
          <select id="bufferSizeMultiplier">
            <option value="1">1x</option>
            <option value="4">4x</option>
            <option value="16" selected>16x</option>
          </select>
        </label>
        <label>
          <span>Phase 0 Detection:</span>
          <select id="zeroCrossMode">
            <option value="hysteresis" selected>Hysteresis</option>
          </select>
        </label>
        <div>
          <span>Frequency:</span>
          <span id="frequencyValue">--- Hz</span>
        </div>
        <div>
          <span>Note:</span>
          <span id="noteValue">---</span>
        </div>
        <div>
          <span>Auto Gain:</span>
          <span id="gainValue">---x</span>
        </div>
        <div>
          <span>Similarity:</span>
          <span id="similarityValue">---</span>
        </div>
      </div>
    `;

    // Get DOM element references
    cycleSimilarityPanel = document.getElementById('cycleSimilarityPanel') as HTMLDivElement;
    cycleSimilarityDisplayCheckbox = document.getElementById('cycleSimilarityDisplayCheckbox') as HTMLInputElement;

    // Mock canvas context
    const mockContext = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(() => ({ width: 100 })),
      save: vi.fn(),
      restore: vi.fn(),
      setLineDash: vi.fn(),
    };

    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      (canvas as HTMLCanvasElement).getContext = vi.fn(() => mockContext) as any;
    });

    // Initialize DOMElementManager
    dom = new DOMElementManager();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have cycle similarity display checkbox unchecked by default', () => {
      expect(cycleSimilarityDisplayCheckbox.checked).toBe(false);
    });

    it('should have cycle similarity panel hidden by default', () => {
      expect(cycleSimilarityPanel.style.display).toBe('none');
    });

    it('should initialize panel display state to match checkbox state', () => {
      // Mock oscilloscope and dependencies
      const oscilloscope = new Oscilloscope(
        dom.canvas,
        dom.previousWaveformCanvas,
        dom.currentWaveformCanvas,
        dom.similarityPlotCanvas,
        dom.frameBufferCanvas,
        dom.cycleSimilarity8divCanvas,
        dom.cycleSimilarity4divCanvas,
        dom.cycleSimilarity2divCanvas
      );
      
      const pianoKeyboardRenderer = new PianoKeyboardRenderer(dom.pianoKeyboardCanvas);
      const displayUpdater = new DisplayUpdater(
        oscilloscope,
        pianoKeyboardRenderer,
        dom.frequencyValue,
        dom.noteValue,
        dom.gainValue,
        dom.similarityValue
      );
      
      const eventHandlers = new UIEventHandlers(oscilloscope, dom, displayUpdater);
      eventHandlers.initializeUIState();

      // Verify that panel is hidden since checkbox is unchecked
      expect(cycleSimilarityPanel.style.display).toBe('none');
    });
  });

  describe('Toggle Functionality', () => {
    it('should show panel when checkbox is checked via event handler', () => {
      // Setup event handlers
      const oscilloscope = new Oscilloscope(
        dom.canvas,
        dom.previousWaveformCanvas,
        dom.currentWaveformCanvas,
        dom.similarityPlotCanvas,
        dom.frameBufferCanvas,
        dom.cycleSimilarity8divCanvas,
        dom.cycleSimilarity4divCanvas,
        dom.cycleSimilarity2divCanvas
      );
      
      const pianoKeyboardRenderer = new PianoKeyboardRenderer(dom.pianoKeyboardCanvas);
      const displayUpdater = new DisplayUpdater(
        oscilloscope,
        pianoKeyboardRenderer,
        dom.frequencyValue,
        dom.noteValue,
        dom.gainValue,
        dom.similarityValue
      );
      
      const eventHandlers = new UIEventHandlers(oscilloscope, dom, displayUpdater);
      eventHandlers.setupEventHandlers();

      // Initially hidden
      expect(cycleSimilarityPanel.style.display).toBe('none');
      
      // Check the checkbox and trigger change event
      cycleSimilarityDisplayCheckbox.checked = true;
      cycleSimilarityDisplayCheckbox.dispatchEvent(new Event('change'));
      
      // Panel should now be visible through event handler
      expect(cycleSimilarityPanel.style.display).toBe('flex');
    });

    it('should hide panel when checkbox is unchecked via event handler', () => {
      // Setup event handlers
      const oscilloscope = new Oscilloscope(
        dom.canvas,
        dom.previousWaveformCanvas,
        dom.currentWaveformCanvas,
        dom.similarityPlotCanvas,
        dom.frameBufferCanvas,
        dom.cycleSimilarity8divCanvas,
        dom.cycleSimilarity4divCanvas,
        dom.cycleSimilarity2divCanvas
      );
      
      const pianoKeyboardRenderer = new PianoKeyboardRenderer(dom.pianoKeyboardCanvas);
      const displayUpdater = new DisplayUpdater(
        oscilloscope,
        pianoKeyboardRenderer,
        dom.frequencyValue,
        dom.noteValue,
        dom.gainValue,
        dom.similarityValue
      );
      
      const eventHandlers = new UIEventHandlers(oscilloscope, dom, displayUpdater);
      eventHandlers.setupEventHandlers();

      // First, show the panel
      cycleSimilarityDisplayCheckbox.checked = true;
      cycleSimilarityDisplayCheckbox.dispatchEvent(new Event('change'));
      expect(cycleSimilarityPanel.style.display).toBe('flex');
      
      // Then hide it by unchecking
      cycleSimilarityDisplayCheckbox.checked = false;
      cycleSimilarityDisplayCheckbox.dispatchEvent(new Event('change'));
      
      // Panel should now be hidden through event handler
      expect(cycleSimilarityPanel.style.display).toBe('none');
    });

    it('should properly integrate with UIEventHandlers', () => {
      // Mock oscilloscope and dependencies
      const oscilloscope = new Oscilloscope(
        dom.canvas,
        dom.previousWaveformCanvas,
        dom.currentWaveformCanvas,
        dom.similarityPlotCanvas,
        dom.frameBufferCanvas,
        dom.cycleSimilarity8divCanvas,
        dom.cycleSimilarity4divCanvas,
        dom.cycleSimilarity2divCanvas
      );
      
      const pianoKeyboardRenderer = new PianoKeyboardRenderer(dom.pianoKeyboardCanvas);
      const displayUpdater = new DisplayUpdater(
        oscilloscope,
        pianoKeyboardRenderer,
        dom.frequencyValue,
        dom.noteValue,
        dom.gainValue,
        dom.similarityValue
      );
      
      const eventHandlers = new UIEventHandlers(oscilloscope, dom, displayUpdater);
      eventHandlers.setupEventHandlers();

      // Initially hidden
      expect(cycleSimilarityPanel.style.display).toBe('none');

      // Check the checkbox and trigger change event
      cycleSimilarityDisplayCheckbox.checked = true;
      cycleSimilarityDisplayCheckbox.dispatchEvent(new Event('change'));

      // Panel should now be visible
      expect(cycleSimilarityPanel.style.display).toBe('flex');

      // Uncheck the checkbox and trigger change event
      cycleSimilarityDisplayCheckbox.checked = false;
      cycleSimilarityDisplayCheckbox.dispatchEvent(new Event('change'));

      // Panel should now be hidden
      expect(cycleSimilarityPanel.style.display).toBe('none');
    });
  });

  describe('DOMElementManager Integration', () => {
    it('should retrieve cycle similarity panel element', () => {
      expect(dom.cycleSimilarityPanel).toBeTruthy();
      expect(dom.cycleSimilarityPanel).toBe(cycleSimilarityPanel);
    });

    it('should retrieve cycle similarity display checkbox element', () => {
      expect(dom.cycleSimilarityDisplayCheckbox).toBeTruthy();
      expect(dom.cycleSimilarityDisplayCheckbox).toBe(cycleSimilarityDisplayCheckbox);
    });

    it('should validate all cycle similarity related elements', () => {
      expect(dom.cycleSimilarityPanel).toBeInstanceOf(HTMLDivElement);
      expect(dom.cycleSimilarityDisplayCheckbox).toBeInstanceOf(HTMLInputElement);
      expect(dom.cycleSimilarityDisplayCheckbox.type).toBe('checkbox');
    });
  });
});
