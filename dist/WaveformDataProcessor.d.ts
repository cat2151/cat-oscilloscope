import { WaveformRenderData } from './WaveformRenderData';
import { AudioManager } from './AudioManager';
import { GainController } from './GainController';
import { FrequencyEstimator } from './FrequencyEstimator';
import { WaveformSearcher } from './WaveformSearcher';
import { ZeroCrossDetector } from './ZeroCrossDetector';
/**
 * WaveformDataProcessor - Coordinates waveform data processing using Rust WASM implementation
 *
 * This class has been refactored to follow the Single Responsibility Principle.
 * Its sole responsibility is now coordinating between JavaScript configuration
 * and the Rust/WASM processor for data processing.
 *
 * Responsibilities delegated to specialized classes:
 * - BasePathResolver: Determines the base path for loading WASM files
 * - WasmModuleLoader: Handles WASM module loading and initialization
 *
 * All actual data processing algorithms (frequency estimation, gain control,
 * zero-cross detection, waveform search) are implemented in Rust WASM.
 */
export declare class WaveformDataProcessor {
    private audioManager;
    private gainController;
    private frequencyEstimator;
    private waveformSearcher;
    private zeroCrossDetector;
    private basePathResolver;
    private wasmLoader;
    private phaseZeroOffsetHistory;
    private phaseTwoPiOffsetHistory;
    private readonly MAX_OFFSET_HISTORY;
    private previousPhaseZeroIndex;
    private previousPhaseTwoPiIndex;
    private previousDisplayStartIndex;
    private previousDisplayEndIndex;
    constructor(audioManager: AudioManager, gainController: GainController, frequencyEstimator: FrequencyEstimator, waveformSearcher: WaveformSearcher, zeroCrossDetector: ZeroCrossDetector);
    /**
     * Initialize the WASM module
     * Must be called before processFrame
     */
    initialize(): Promise<void>;
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
     * Calculate relative offset percentages for phase markers and update history
     * Issue #254: Added diagnostic logging to identify source of offset spikes
     * @param renderData - Render data containing phase indices
     */
    private updatePhaseOffsetHistory;
    /**
     * Reset the WASM processor state
     */
    reset(): void;
}
//# sourceMappingURL=WaveformDataProcessor.d.ts.map