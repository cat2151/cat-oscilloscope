export interface WasmProcessorInstance {
    setAutoGain(enabled: boolean): void;
    setNoiseGate(enabled: boolean): void;
    setNoiseGateThreshold(threshold: number): void;
    setFrequencyEstimationMethod(method: string): void;
    setBufferSizeMultiplier(multiplier: number): void;
    setUsePeakMode(enabled: boolean): void;
    setZeroCrossMode(mode: string): void;
    reset(): void;
    computeFrequencyData(timeDomainData: Float32Array, fftSize: number): Uint8Array | undefined;
    processFrame(waveformData: Float32Array, frequencyData: Uint8Array | null, sampleRate: number, fftSize: number, fftDisplayEnabled: boolean): any;
}
/**
 * WasmModuleLoader - Responsible for loading and initializing WASM modules
 *
 * This class follows the Single Responsibility Principle by having one clear purpose:
 * dynamically loading the WASM processor module and managing its lifecycle.
 */
export declare class WasmModuleLoader {
    private wasmProcessor;
    private isInitialized;
    private readonly LOAD_TIMEOUT_MS;
    /**
     * Load WASM module dynamically
     * @param basePath - Base path for loading WASM files
     * @returns Promise that resolves when WASM is loaded and initialized
     */
    loadWasmModule(basePath: string): Promise<void>;
    /**
     * Get the loaded WASM processor instance
     */
    getProcessor(): WasmProcessorInstance | null;
    /**
     * Check if WASM module is initialized
     */
    isReady(): boolean;
}
