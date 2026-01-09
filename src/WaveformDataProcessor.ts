import { WaveformRenderData } from './WaveformRenderData';
import { AudioManager } from './AudioManager';
import { GainController } from './GainController';
import { FrequencyEstimator } from './FrequencyEstimator';
import { ZeroCrossDetector } from './ZeroCrossDetector';
import { WaveformSearcher } from './WaveformSearcher';

// Type definition for WASM processor instance
interface WasmProcessorInstance {
  setAutoGain(enabled: boolean): void;
  setNoiseGate(enabled: boolean): void;
  setNoiseGateThreshold(threshold: number): void;
  setFrequencyEstimationMethod(method: string): void;
  setBufferSizeMultiplier(multiplier: number): void;
  setUsePeakMode(enabled: boolean): void;
  reset(): void;
  processFrame(
    waveformData: Float32Array,
    frequencyData: Uint8Array | null,
    sampleRate: number,
    fftSize: number,
    fftDisplayEnabled: boolean
  ): any;
}

/**
 * WaveformDataProcessor - Processes waveform data using Rust WASM implementation
 * 
 * This class coordinates between JavaScript configuration and the Rust/WASM 
 * implementation for data processing. It maintains TypeScript instances only 
 * for configuration and state that needs to be accessed from JS.
 * 
 * All actual data processing algorithms (frequency estimation, gain control,
 * zero-cross detection, waveform search) are implemented in Rust WASM.
 */
export class WaveformDataProcessor {
  // Asset directory patterns used for base path detection
  private static readonly ASSET_PATTERNS = ['/assets/', '/js/', '/dist/'] as const;
  
  private audioManager: AudioManager;
  private gainController: GainController;
  private frequencyEstimator: FrequencyEstimator;
  private zeroCrossDetector: ZeroCrossDetector;
  private waveformSearcher: WaveformSearcher;

  private wasmProcessor: WasmProcessorInstance | null = null;
  private isInitialized = false;
  private cachedBasePath: string | null = null;

  constructor(
    audioManager: AudioManager,
    gainController: GainController,
    frequencyEstimator: FrequencyEstimator,
    zeroCrossDetector: ZeroCrossDetector,
    waveformSearcher: WaveformSearcher
  ) {
    this.audioManager = audioManager;
    this.gainController = gainController;
    this.frequencyEstimator = frequencyEstimator;
    this.zeroCrossDetector = zeroCrossDetector;
    this.waveformSearcher = waveformSearcher;
  }
  
  /**
   * Initialize the WASM module
   * Must be called before processFrame
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    
    // Check if we're in a test or non-browser-like environment
    if (typeof window === 'undefined' || window.location.protocol === 'file:') {
      throw new Error('WASM module not available in test/non-browser environment');
    }
    
    try {
      // Load WASM module using script tag injection (works around Vite restrictions)
      await this.loadWasmModule();
      this.isInitialized = true;
      
      // Sync initial configuration to WASM
      this.syncConfigToWasm();
    } catch (error) {
      console.error('Failed to initialize WASM module:', error);
      throw error;
    }
  }
  
  /**
   * Load WASM module dynamically
   */
  private async loadWasmModule(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      // @ts-ignore
      if (window.wasmProcessor && window.wasmProcessor.WasmDataProcessor) {
        // @ts-ignore
        this.wasmProcessor = new window.wasmProcessor.WasmDataProcessor();
        resolve();
        return;
      }
      
      // Set up timeout to prevent hanging
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('WASM module loading timed out after 10 seconds'));
      }, 10000);
      
      // Determine the base path for WASM files
      const basePath = this.determineBasePath();
      const wasmPath = `${basePath}wasm/wasm_processor.js`;
      
      const script = document.createElement('script');
      script.type = 'module';
      script.textContent = `
        import init, { WasmDataProcessor } from '${wasmPath}';
        await init();
        window.wasmProcessor = { WasmDataProcessor };
        window.dispatchEvent(new Event('wasmLoaded'));
      `;
      
      const cleanup = () => {
        clearTimeout(timeout);
        window.removeEventListener('wasmLoaded', handleLoad);
      };
      
      const handleLoad = () => {
        cleanup();
        // @ts-ignore
        if (window.wasmProcessor && window.wasmProcessor.WasmDataProcessor) {
          // @ts-ignore
          this.wasmProcessor = new window.wasmProcessor.WasmDataProcessor();
          resolve();
        } else {
          reject(new Error('WASM module loaded but WasmDataProcessor not found'));
        }
      };
      
      window.addEventListener('wasmLoaded', handleLoad);
      
      script.onerror = () => {
        cleanup();
        reject(new Error('Failed to load WASM module script'));
      };
      
      document.head.appendChild(script);
    });
  }
  
  /**
   * Determine the base path for the application
   * This method implements a fallback hierarchy:
   * 1. Check for <base> tag href attribute
   * 2. Extract from existing script tags
   * 3. Default to '/'
   * The path is normalized to always end with '/'
   */
  private determineBasePath(): string {
    // Return cached value if available
    if (this.cachedBasePath !== null) {
      return this.cachedBasePath;
    }
    
    // Try <base> tag first
    let basePath = document.querySelector('base')?.getAttribute('href');

    // If we got a value from <base>, normalize absolute URLs to pathname only
    if (basePath) {
      try {
        const url = new URL(basePath, window.location.href);
        basePath = url.pathname;
      } catch {
        // If parsing fails, keep the original value (likely already a relative path)
      }
    }
    
    // Fall back to script tag analysis
    if (!basePath) {
      basePath = this.getBasePathFromScripts();
    }
    
    // Default to root
    if (!basePath) {
      basePath = '/';
    }
    
    // Normalize: ensure trailing slash
    if (!basePath.endsWith('/')) {
      basePath += '/';
    }
    
    // Cache the result
    this.cachedBasePath = basePath;
    return basePath;
  }
  
  /**
   * Extract base path from existing script tags
   * This method attempts to infer the base path by looking for script tags with src attributes
   * that might indicate the deployment path. Falls back to empty string if no clear pattern is found.
   */
  private getBasePathFromScripts(): string {
    const scripts = document.querySelectorAll('script[src]');
    for (const script of scripts) {
      const src = script.getAttribute('src');
      if (src) {
        try {
          // Try to parse as URL to handle both absolute and relative paths
          const url = new URL(src, window.location.href);
          const pathname = url.pathname;
          
          // Look for common asset directory patterns
          for (const pattern of WaveformDataProcessor.ASSET_PATTERNS) {
            const index = pathname.indexOf(pattern);
            if (index >= 0) {
              // Extract everything before the asset directory
              // For '/assets/file.js', index=0, return '/' (root directory)
              // For '/cat-oscilloscope/assets/file.js', index=17, return '/cat-oscilloscope/'
              return index === 0 ? '/' : pathname.substring(0, index) + '/';
            }
          }
        } catch (error: unknown) {
          // URL parsing failed - skip this script and try next one
          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.debug('Failed to parse script URL:', src, error);
          }
          continue;
        }
      }
    }
    return '';
  }
  
  /**
   * Sync TypeScript configuration to WASM processor
   */
  private syncConfigToWasm(): void {
    if (!this.wasmProcessor) return;
    
    this.wasmProcessor.setAutoGain(this.gainController.getAutoGainEnabled());
    this.wasmProcessor.setNoiseGate(this.gainController.getNoiseGateEnabled());
    this.wasmProcessor.setNoiseGateThreshold(this.gainController.getNoiseGateThreshold());
    this.wasmProcessor.setFrequencyEstimationMethod(this.frequencyEstimator.getFrequencyEstimationMethod());
    this.wasmProcessor.setBufferSizeMultiplier(this.frequencyEstimator.getBufferSizeMultiplier());
    this.wasmProcessor.setUsePeakMode(this.zeroCrossDetector.getUsePeakMode());
  }
  
  /**
   * Sync WASM results back to TypeScript objects
   * 
   * Note: This method accesses private members using type assertions.
   * This is a temporary solution to maintain compatibility with existing code
   * that uses getters like getEstimatedFrequency(), getCurrentGain(), etc.
   * 
   * TODO: Consider adding public setter methods to these classes or
   * redesigning the synchronization interface for better type safety.
   */
  private syncResultsFromWasm(renderData: WaveformRenderData): void {
    // Update frequency estimator's estimated frequency
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.frequencyEstimator as any).estimatedFrequency = renderData.estimatedFrequency;
    
    // Update gain controller's current gain
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.gainController as any).currentGain = renderData.gain;
    
    // Update waveform searcher's state
    if (renderData.previousWaveform) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.waveformSearcher as any).previousWaveform = renderData.previousWaveform;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.waveformSearcher as any).lastSimilarity = renderData.similarity;
  }

  /**
   * Process current frame and generate complete render data using WASM
   */
  processFrame(fftDisplayEnabled: boolean): WaveformRenderData | null {
    if (!this.isInitialized || !this.wasmProcessor) {
      console.warn('WASM processor not initialized');
      return null;
    }
    
    // Check if audio is ready
    if (!this.audioManager.isReady()) {
      return null;
    }

    // Get waveform data
    const dataArray = this.audioManager.getTimeDomainData();
    if (!dataArray) {
      return null;
    }
    
    const sampleRate = this.audioManager.getSampleRate();
    const fftSize = this.audioManager.getFFTSize();
    
    // Get frequency data if needed
    const needsFrequencyData = this.frequencyEstimator.getFrequencyEstimationMethod() === 'fft' || fftDisplayEnabled;
    const frequencyData = needsFrequencyData ? this.audioManager.getFrequencyData() : null;
    
    // Sync configuration before processing
    this.syncConfigToWasm();
    
    // Call WASM processor
    const wasmResult = this.wasmProcessor.processFrame(
      dataArray,
      frequencyData,
      sampleRate,
      fftSize,
      fftDisplayEnabled
    );
    
    if (!wasmResult) {
      return null;
    }
    
    // Convert WASM result to TypeScript WaveformRenderData
    const renderData: WaveformRenderData = {
      waveformData: new Float32Array(wasmResult.waveform_data),
      displayStartIndex: wasmResult.displayStartIndex,
      displayEndIndex: wasmResult.displayEndIndex,
      gain: wasmResult.gain,
      estimatedFrequency: wasmResult.estimatedFrequency,
      frequencyPlotHistory: wasmResult.frequencyPlotHistory ? Array.from(wasmResult.frequencyPlotHistory) : [],
      sampleRate: wasmResult.sampleRate,
      fftSize: wasmResult.fftSize,
      firstAlignmentPoint: wasmResult.firstAlignmentPoint,
      secondAlignmentPoint: wasmResult.secondAlignmentPoint,
      frequencyData: wasmResult.frequencyData ? new Uint8Array(wasmResult.frequencyData) : undefined,
      isSignalAboveNoiseGate: wasmResult.isSignalAboveNoiseGate,
      maxFrequency: wasmResult.maxFrequency,
      previousWaveform: wasmResult.previousWaveform ? new Float32Array(wasmResult.previousWaveform) : null,
      similarity: wasmResult.similarity,
      usedSimilaritySearch: wasmResult.usedSimilaritySearch,
    };
    
    // Sync results back to TypeScript objects so getters work correctly
    this.syncResultsFromWasm(renderData);
    
    return renderData;
  }
  
  /**
   * Reset the WASM processor state
   */
  reset(): void {
    if (this.wasmProcessor) {
      this.wasmProcessor.reset();
    }
  }
}
