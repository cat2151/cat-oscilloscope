// Type definition for WASM processor instance
export interface WasmProcessorInstance {
  setAutoGain(enabled: boolean): void;
  setNoiseGate(enabled: boolean): void;
  setNoiseGateThreshold(threshold: number): void;
  setFrequencyEstimationMethod(method: string): void;
  setBufferSizeMultiplier(multiplier: number): void;
  setUsePeakMode(enabled: boolean): void;
  setZeroCrossMode(mode: string): void;
  reset(): void;
  computeFrequencyData(
    timeDomainData: Float32Array,
    fftSize: number
  ): Uint8Array | undefined;
  processFrame(
    waveformData: Float32Array,
    frequencyData: Uint8Array | null,
    sampleRate: number,
    fftSize: number,
    fftDisplayEnabled: boolean
  ): any;
}

/**
 * WasmModuleLoader - Responsible for loading and initializing WASM modules
 * 
 * This class follows the Single Responsibility Principle by having one clear purpose:
 * dynamically loading the WASM processor module and managing its lifecycle.
 */
export class WasmModuleLoader {
  private wasmProcessor: WasmProcessorInstance | null = null;
  private isInitialized = false;
  private readonly LOAD_TIMEOUT_MS = 10000;

  /**
   * Load WASM module dynamically
   * @param basePath - Base path for loading WASM files
   * @returns Promise that resolves when WASM is loaded and initialized
   */
  async loadWasmModule(basePath: string): Promise<void> {
    if (this.isInitialized && this.wasmProcessor) {
      return; // Already loaded
    }

    // Check if we're in a test or non-browser-like environment
    if (typeof window === 'undefined' || window.location.protocol === 'file:') {
      throw new Error('WASM module not available in test/non-browser environment');
    }

    return new Promise((resolve, reject) => {
      // Check if already loaded
      // @ts-ignore
      if (window.wasmProcessor && window.wasmProcessor.WasmDataProcessor) {
        // @ts-ignore
        this.wasmProcessor = new window.wasmProcessor.WasmDataProcessor();
        this.isInitialized = true;
        resolve();
        return;
      }
      
      // Set up timeout to prevent hanging
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error(`WASM module loading timed out after ${this.LOAD_TIMEOUT_MS / 1000} seconds`));
      }, this.LOAD_TIMEOUT_MS);
      
      const wasmPath = `${basePath}wasm/signal_processor_wasm.js`;
      
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
          this.isInitialized = true;
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
   * Get the loaded WASM processor instance
   */
  getProcessor(): WasmProcessorInstance | null {
    return this.wasmProcessor;
  }

  /**
   * Check if WASM module is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.wasmProcessor !== null;
  }
}
