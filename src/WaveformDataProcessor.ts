import { WaveformRenderData } from './WaveformRenderData';
import { AudioManager } from './AudioManager';
import { GainController } from './GainController';
import { FrequencyEstimator } from './FrequencyEstimator';
import { WaveformSearcher } from './WaveformSearcher';
import { ZeroCrossDetector } from './ZeroCrossDetector';
import { BasePathResolver } from './BasePathResolver';
import { WasmModuleLoader } from './WasmModuleLoader';

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
export class WaveformDataProcessor {
  private audioManager: AudioManager;
  private gainController: GainController;
  private frequencyEstimator: FrequencyEstimator;
  private waveformSearcher: WaveformSearcher;
  private zeroCrossDetector: ZeroCrossDetector;
  private basePathResolver: BasePathResolver;
  private wasmLoader: WasmModuleLoader;
  
  // Phase marker offset history for overlay graphs (issue #236)
  private phaseZeroOffsetHistory: number[] = [];
  private phaseTwoPiOffsetHistory: number[] = [];
  private readonly MAX_OFFSET_HISTORY = 100; // Keep last 100 frames of offset data
  
  // Diagnostic tracking for issue #254 analysis
  private previousPhaseZeroIndex: number | undefined = undefined;
  private previousPhaseTwoPiIndex: number | undefined = undefined;
  private previousDisplayStartIndex: number | undefined = undefined;
  private previousDisplayEndIndex: number | undefined = undefined;

  constructor(
    audioManager: AudioManager,
    gainController: GainController,
    frequencyEstimator: FrequencyEstimator,
    waveformSearcher: WaveformSearcher,
    zeroCrossDetector: ZeroCrossDetector
  ) {
    this.audioManager = audioManager;
    this.gainController = gainController;
    this.frequencyEstimator = frequencyEstimator;
    this.waveformSearcher = waveformSearcher;
    this.zeroCrossDetector = zeroCrossDetector;
    this.basePathResolver = new BasePathResolver();
    this.wasmLoader = new WasmModuleLoader();
  }
  
  /**
   * Initialize the WASM module
   * Must be called before processFrame
   */
  async initialize(): Promise<void> {
    if (this.wasmLoader.isReady()) {
      return;
    }
    
    try {
      // Determine base path and load WASM module
      const basePath = this.basePathResolver.getBasePath();
      await this.wasmLoader.loadWasmModule(basePath);
      
      // Sync initial configuration to WASM
      this.syncConfigToWasm();
    } catch (error) {
      console.error('Failed to initialize WASM module:', error);
      throw error;
    }
  }
  
  /**
   * Sync TypeScript configuration to WASM processor
   */
  private syncConfigToWasm(): void {
    const wasmProcessor = this.wasmLoader.getProcessor();
    if (!wasmProcessor) return;
    
    wasmProcessor.setAutoGain(this.gainController.getAutoGainEnabled());
    wasmProcessor.setNoiseGate(this.gainController.getNoiseGateEnabled());
    wasmProcessor.setNoiseGateThreshold(this.gainController.getNoiseGateThreshold());
    wasmProcessor.setFrequencyEstimationMethod(this.frequencyEstimator.getFrequencyEstimationMethod());
    wasmProcessor.setBufferSizeMultiplier(this.frequencyEstimator.getBufferSizeMultiplier());
    wasmProcessor.setZeroCrossMode(this.zeroCrossDetector.getZeroCrossMode());
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
    const wasmProcessor = this.wasmLoader.getProcessor();
    if (!this.wasmLoader.isReady() || !wasmProcessor) {
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
    let frequencyData = needsFrequencyData ? this.audioManager.getFrequencyData() : null;
    
    // If frequency data is needed but not available (e.g., BufferSource mode),
    // compute it from time-domain data using WASM
    if (needsFrequencyData && !frequencyData && dataArray) {
      const computedFreqData = wasmProcessor.computeFrequencyData(dataArray, fftSize);
      if (computedFreqData) {
        frequencyData = new Uint8Array(computedFreqData);
      }
    }
    
    // Sync configuration before processing
    this.syncConfigToWasm();
    
    // Call WASM processor
    const wasmResult = wasmProcessor.processFrame(
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
      frequencyData: wasmResult.frequencyData ? new Uint8Array(wasmResult.frequencyData) : undefined,
      isSignalAboveNoiseGate: wasmResult.isSignalAboveNoiseGate,
      maxFrequency: wasmResult.maxFrequency,
      previousWaveform: wasmResult.previousWaveform ? new Float32Array(wasmResult.previousWaveform) : null,
      similarity: wasmResult.similarity,
      similarityPlotHistory: wasmResult.similarityPlotHistory ? Array.from(wasmResult.similarityPlotHistory) : [],
      usedSimilaritySearch: wasmResult.usedSimilaritySearch,
      phaseZeroIndex: wasmResult.phaseZeroIndex,
      phaseTwoPiIndex: wasmResult.phaseTwoPiIndex,
      phaseMinusQuarterPiIndex: wasmResult.phaseMinusQuarterPiIndex,
      phaseTwoPiPlusQuarterPiIndex: wasmResult.phaseTwoPiPlusQuarterPiIndex,
      halfFreqPeakStrengthPercent: wasmResult.halfFreqPeakStrengthPercent,
      candidate1Harmonics: wasmResult.candidate1Harmonics ? Array.from(wasmResult.candidate1Harmonics) : undefined,
      candidate2Harmonics: wasmResult.candidate2Harmonics ? Array.from(wasmResult.candidate2Harmonics) : undefined,
      selectionReason: wasmResult.selectionReason,
      cycleSimilarities8div: wasmResult.cycleSimilarities8div ? Array.from(wasmResult.cycleSimilarities8div) : undefined,
      cycleSimilarities4div: wasmResult.cycleSimilarities4div ? Array.from(wasmResult.cycleSimilarities4div) : undefined,
      cycleSimilarities2div: wasmResult.cycleSimilarities2div ? Array.from(wasmResult.cycleSimilarities2div) : undefined,
    };
    
    // Calculate and update phase marker offset history (issue #236)
    this.updatePhaseOffsetHistory(renderData);
    
    // Add offset history to render data
    renderData.phaseZeroOffsetHistory = [...this.phaseZeroOffsetHistory];
    renderData.phaseTwoPiOffsetHistory = [...this.phaseTwoPiOffsetHistory];
    
    // Sync results back to TypeScript objects so getters work correctly
    this.syncResultsFromWasm(renderData);
    
    return renderData;
  }
  
  /**
   * Calculate relative offset percentages for phase markers and update history
   * Issue #254: Added diagnostic logging to identify source of offset spikes
   * @param renderData - Render data containing phase indices
   */
  private updatePhaseOffsetHistory(renderData: WaveformRenderData): void {
    // Check if we have valid display indices
    if (renderData.displayStartIndex === undefined || 
        renderData.displayEndIndex === undefined) {
      return;
    }
    
    const displayLength = renderData.displayEndIndex - renderData.displayStartIndex;
    if (displayLength <= 0) {
      return;
    }
    
    // Diagnostic tracking for issue #254
    let shouldLog = false;
    const diagnosticInfo: any = {
      frame: Date.now(),
      displayWindow: {
        start: renderData.displayStartIndex,
        end: renderData.displayEndIndex,
        length: displayLength,
      },
    };
    
    // Track display window changes
    if (this.previousDisplayStartIndex !== undefined && this.previousDisplayEndIndex !== undefined) {
      const displayStartDelta = renderData.displayStartIndex - this.previousDisplayStartIndex;
      const displayEndDelta = renderData.displayEndIndex - this.previousDisplayEndIndex;
      const displayLengthChange = displayLength - (this.previousDisplayEndIndex - this.previousDisplayStartIndex);
      
      diagnosticInfo.displayWindowChange = {
        startDelta: displayStartDelta,
        endDelta: displayEndDelta,
        lengthChange: displayLengthChange,
      };
    }
    
    // Update phase zero offset history if available
    if (renderData.phaseZeroIndex !== undefined) {
      // Calculate relative offset as percentage (0-100) within the display window
      // This represents where the "start" marker (phase 0) is positioned in the 4-cycle display
      const phaseZeroRelative = renderData.phaseZeroIndex - renderData.displayStartIndex;
      const phaseZeroPercent = (phaseZeroRelative / displayLength) * 100;
      
      // Diagnostic tracking
      diagnosticInfo.phaseZero = {
        sampleIndex: renderData.phaseZeroIndex,
        startOffsetPercent: phaseZeroPercent,  // Position within 4-cycle display window (0-100%)
      };
      
      if (this.previousPhaseZeroIndex !== undefined) {
        const markerMovement = renderData.phaseZeroIndex - this.previousPhaseZeroIndex;
        diagnosticInfo.phaseZero.markerMovement = markerMovement;  // Sample movement between frames
        
        // Detect spikes: if offset percent changes by >1% between frames (spec says 1% per frame max)
        const previousPercent = this.phaseZeroOffsetHistory[this.phaseZeroOffsetHistory.length - 1];
        if (previousPercent !== undefined) {
          const percentChange = Math.abs(phaseZeroPercent - previousPercent);
          diagnosticInfo.phaseZero.offsetChange = percentChange;
          
          if (percentChange > 1.0) {
            shouldLog = true;
            diagnosticInfo.phaseZero.SPIKE_DETECTED = true;
          }
        }
      }
      
      this.phaseZeroOffsetHistory.push(phaseZeroPercent);
      if (this.phaseZeroOffsetHistory.length > this.MAX_OFFSET_HISTORY) {
        this.phaseZeroOffsetHistory.shift();
      }
      
      this.previousPhaseZeroIndex = renderData.phaseZeroIndex;
    }
    
    // Update phase 2π offset history if available
    if (renderData.phaseTwoPiIndex !== undefined) {
      // Calculate relative offset as percentage (0-100) within the display window
      // This represents where the "end" marker (phase 2π) is positioned in the 4-cycle display
      const phaseTwoPiRelative = renderData.phaseTwoPiIndex - renderData.displayStartIndex;
      const phaseTwoPiPercent = (phaseTwoPiRelative / displayLength) * 100;
      
      // Diagnostic tracking
      diagnosticInfo.phaseTwoPi = {
        sampleIndex: renderData.phaseTwoPiIndex,
        endOffsetPercent: phaseTwoPiPercent,  // Position within 4-cycle display window (0-100%)
      };
      
      if (this.previousPhaseTwoPiIndex !== undefined) {
        const markerMovement = renderData.phaseTwoPiIndex - this.previousPhaseTwoPiIndex;
        diagnosticInfo.phaseTwoPi.markerMovement = markerMovement;  // Sample movement between frames
        
        // Detect spikes: if offset percent changes by >1% between frames (spec says 1% per frame max)
        const previousPercent = this.phaseTwoPiOffsetHistory[this.phaseTwoPiOffsetHistory.length - 1];
        if (previousPercent !== undefined) {
          const percentChange = Math.abs(phaseTwoPiPercent - previousPercent);
          diagnosticInfo.phaseTwoPi.offsetChange = percentChange;
          
          if (percentChange > 1.0) {
            shouldLog = true;
            diagnosticInfo.phaseTwoPi.SPIKE_DETECTED = true;
          }
        }
      }
      
      this.phaseTwoPiOffsetHistory.push(phaseTwoPiPercent);
      if (this.phaseTwoPiOffsetHistory.length > this.MAX_OFFSET_HISTORY) {
        this.phaseTwoPiOffsetHistory.shift();
      }
      
      this.previousPhaseTwoPiIndex = renderData.phaseTwoPiIndex;
    }
    
    // Store display window state for next frame
    this.previousDisplayStartIndex = renderData.displayStartIndex;
    this.previousDisplayEndIndex = renderData.displayEndIndex;
    
    // Log if spike detected
    if (shouldLog) {
      console.warn('[Offset Spike Detected - Issue #254]', diagnosticInfo);
    }
  }
  
  /**
   * Reset the WASM processor state
   */
  reset(): void {
    const wasmProcessor = this.wasmLoader.getProcessor();
    if (wasmProcessor) {
      wasmProcessor.reset();
    }
    // Clear phase offset history (issue #236, #254)
    this.phaseZeroOffsetHistory = [];
    this.phaseTwoPiOffsetHistory = [];
    // Clear diagnostic tracking (issue #254)
    this.previousPhaseZeroIndex = undefined;
    this.previousPhaseTwoPiIndex = undefined;
    this.previousDisplayStartIndex = undefined;
    this.previousDisplayEndIndex = undefined;
  }
}
