import { WaveformRenderData } from './WaveformRenderData';
import { AudioManager } from './AudioManager';
import { GainController } from './GainController';
import { FrequencyEstimator } from './FrequencyEstimator';
import { WaveformSearcher } from './WaveformSearcher';
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
export declare class WaveformDataProcessor {
    private static readonly ASSET_PATTERNS;
    private audioManager;
    private gainController;
    private frequencyEstimator;
    private waveformSearcher;
    private wasmProcessor;
    private isInitialized;
    private cachedBasePath;
    constructor(audioManager: AudioManager, gainController: GainController, frequencyEstimator: FrequencyEstimator, waveformSearcher: WaveformSearcher);
    /**
     * Initialize the WASM module
     * Must be called before processFrame
     */
    initialize(): Promise<void>;
    /**
     * Load WASM module dynamically
     */
    private loadWasmModule;
    /**
     * Determine the base path for the application
     * This method implements a fallback hierarchy:
     * 1. Check for <base> tag href attribute
     * 2. Extract from existing script tags
     * 3. Check if running in Vite dev mode (import.meta.env.DEV)
     * 4. Default to '/'
     * The path is normalized to always end with '/'
     */
    private determineBasePath;
    /**
     * Extract base path from existing script tags
     * This method attempts to infer the base path by looking for script tags with src attributes
     * that might indicate the deployment path. Falls back to empty string if no clear pattern is found.
     */
    private getBasePathFromScripts;
    /**
     * Sync TypeScript configuration to WASM processor
     */
    private syncConfigToWasm;
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
    private syncResultsFromWasm;
    /**
     * Process current frame and generate complete render data using WASM
     */
    processFrame(fftDisplayEnabled: boolean): WaveformRenderData | null;
    /**
     * Reset the WASM processor state
     */
    reset(): void;
}
