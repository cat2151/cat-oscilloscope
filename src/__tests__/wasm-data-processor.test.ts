import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WasmDataProcessor } from '../WasmDataProcessor';
import { AudioManager } from '../AudioManager';
import { GainController } from '../GainController';
import { FrequencyEstimator } from '../FrequencyEstimator';
import { ZeroCrossDetector } from '../ZeroCrossDetector';
import { WaveformSearcher } from '../WaveformSearcher';

// Mock the AudioManager and related classes
vi.mock('../AudioManager');
vi.mock('../GainController');
vi.mock('../FrequencyEstimator');
vi.mock('../FrequencyEstimator');
vi.mock('../ZeroCrossDetector');
vi.mock('../WaveformSearcher');

describe('WasmDataProcessor - Base Path Detection', () => {
  let wasmProcessor: WasmDataProcessor;
  let audioManager: AudioManager;
  let gainController: GainController;
  let frequencyEstimator: FrequencyEstimator;
  let zeroCrossDetector: ZeroCrossDetector;
  let waveformSearcher: WaveformSearcher;

  beforeEach(() => {
    // Clear document
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    
    // Create mock instances
    audioManager = new AudioManager();
    gainController = new GainController();
    frequencyEstimator = new FrequencyEstimator();
    zeroCrossDetector = new ZeroCrossDetector();
    waveformSearcher = new WaveformSearcher();
    
    // Create WasmDataProcessor instance
    wasmProcessor = new WasmDataProcessor(
      audioManager,
      gainController,
      frequencyEstimator,
      zeroCrossDetector,
      waveformSearcher
    );
  });

  afterEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  describe('determineBasePath', () => {
    it('should return "/" when no <base> tag and no script tags exist', async () => {
      // Access private method for testing via type assertion
      const basePath = (wasmProcessor as any).determineBasePath();
      expect(basePath).toBe('/');
    });

    it('should extract base path from <base> tag href attribute', () => {
      const baseElement = document.createElement('base');
      baseElement.setAttribute('href', '/cat-oscilloscope/');
      document.head.appendChild(baseElement);

      const basePath = (wasmProcessor as any).determineBasePath();
      expect(basePath).toBe('/cat-oscilloscope/');
    });

    it('should normalize base path without trailing slash', () => {
      const baseElement = document.createElement('base');
      baseElement.setAttribute('href', '/cat-oscilloscope');
      document.head.appendChild(baseElement);

      const basePath = (wasmProcessor as any).determineBasePath();
      expect(basePath).toBe('/cat-oscilloscope/');
    });

    it('should handle absolute URL in <base> tag and extract pathname', () => {
      const baseElement = document.createElement('base');
      baseElement.setAttribute('href', 'https://example.com/cat-oscilloscope/');
      document.head.appendChild(baseElement);

      const basePath = (wasmProcessor as any).determineBasePath();
      expect(basePath).toBe('/cat-oscilloscope/');
    });

    it('should handle absolute URL without trailing slash in <base> tag', () => {
      const baseElement = document.createElement('base');
      baseElement.setAttribute('href', 'https://example.com/cat-oscilloscope');
      document.head.appendChild(baseElement);

      const basePath = (wasmProcessor as any).determineBasePath();
      expect(basePath).toBe('/cat-oscilloscope/');
    });

    it('should fall back to script tag analysis when <base> tag is missing', () => {
      const scriptElement = document.createElement('script');
      scriptElement.setAttribute('src', '/cat-oscilloscope/assets/index.js');
      document.head.appendChild(scriptElement);

      const basePath = (wasmProcessor as any).determineBasePath();
      expect(basePath).toBe('/cat-oscilloscope/');
    });

    it('should cache the base path for subsequent calls', () => {
      const baseElement = document.createElement('base');
      baseElement.setAttribute('href', '/cat-oscilloscope/');
      document.head.appendChild(baseElement);

      const basePath1 = (wasmProcessor as any).determineBasePath();
      
      // Remove the base element
      document.head.innerHTML = '';
      
      // Should still return cached value
      const basePath2 = (wasmProcessor as any).determineBasePath();
      expect(basePath1).toBe('/cat-oscilloscope/');
      expect(basePath2).toBe('/cat-oscilloscope/');
    });
  });

  describe('getBasePathFromScripts', () => {
    it('should return empty string when no script tags exist', () => {
      const basePath = (wasmProcessor as any).getBasePathFromScripts();
      expect(basePath).toBe('');
    });

    it('should extract base path from /assets/ pattern', () => {
      const scriptElement = document.createElement('script');
      scriptElement.setAttribute('src', '/cat-oscilloscope/assets/index.js');
      document.head.appendChild(scriptElement);

      const basePath = (wasmProcessor as any).getBasePathFromScripts();
      expect(basePath).toBe('/cat-oscilloscope/');
    });

    it('should extract base path from /js/ pattern', () => {
      const scriptElement = document.createElement('script');
      scriptElement.setAttribute('src', '/my-app/js/main.js');
      document.head.appendChild(scriptElement);

      const basePath = (wasmProcessor as any).getBasePathFromScripts();
      expect(basePath).toBe('/my-app/');
    });

    it('should extract base path from /dist/ pattern', () => {
      const scriptElement = document.createElement('script');
      scriptElement.setAttribute('src', '/project/dist/bundle.js');
      document.head.appendChild(scriptElement);

      const basePath = (wasmProcessor as any).getBasePathFromScripts();
      expect(basePath).toBe('/project/');
    });

    it('should return "/" when asset directory is at root', () => {
      const scriptElement = document.createElement('script');
      scriptElement.setAttribute('src', '/assets/index.js');
      document.head.appendChild(scriptElement);

      const basePath = (wasmProcessor as any).getBasePathFromScripts();
      expect(basePath).toBe('/');
    });

    it('should handle multiple script tags and use the first match', () => {
      const script1 = document.createElement('script');
      script1.setAttribute('src', '/app1/assets/index.js');
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.setAttribute('src', '/app2/assets/other.js');
      document.head.appendChild(script2);

      const basePath = (wasmProcessor as any).getBasePathFromScripts();
      expect(basePath).toBe('/app1/');
    });

    it('should skip scripts without src attribute', () => {
      const inlineScript = document.createElement('script');
      inlineScript.textContent = 'console.log("test");';
      document.head.appendChild(inlineScript);

      const scriptWithSrc = document.createElement('script');
      scriptWithSrc.setAttribute('src', '/cat-oscilloscope/assets/index.js');
      document.head.appendChild(scriptWithSrc);

      const basePath = (wasmProcessor as any).getBasePathFromScripts();
      expect(basePath).toBe('/cat-oscilloscope/');
    });

    it('should handle absolute URLs in script src', () => {
      const scriptElement = document.createElement('script');
      scriptElement.setAttribute('src', 'https://example.com/cat-oscilloscope/assets/index.js');
      document.head.appendChild(scriptElement);

      const basePath = (wasmProcessor as any).getBasePathFromScripts();
      expect(basePath).toBe('/cat-oscilloscope/');
    });

    it('should return empty string when no asset patterns are found', () => {
      const scriptElement = document.createElement('script');
      scriptElement.setAttribute('src', '/scripts/main.js');
      document.head.appendChild(scriptElement);

      const basePath = (wasmProcessor as any).getBasePathFromScripts();
      expect(basePath).toBe('');
    });

    it('should handle malformed URLs gracefully', () => {
      const scriptElement = document.createElement('script');
      scriptElement.setAttribute('src', '://invalid-url');
      document.head.appendChild(scriptElement);

      // Should not throw and return empty string
      expect(() => {
        const basePath = (wasmProcessor as any).getBasePathFromScripts();
        expect(basePath).toBe('');
      }).not.toThrow();
    });
  });

  describe('Integration with WASM loading', () => {
    it('should check for browser environment before initialization', () => {
      // In test environment with happy-dom, window exists
      // The actual WASM loading would fail, but we're testing the base path logic
      expect(typeof window).not.toBe('undefined');
      expect(window.location.protocol).not.toBe('file:');
    });
  });
});
