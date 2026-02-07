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

  // Previous frame percent positions for 1% clamping enforcement (issue #275)
  private prevPhaseZeroPercent: number | undefined = undefined;
  private prevPhaseTwoPiPercent: number | undefined = undefined;
  private prevPhaseMinusQuarterPiPercent: number | undefined = undefined;
  private prevPhaseTwoPiPlusQuarterPiPercent: number | undefined = undefined;

  // Performance diagnostics for issue #269
  private enableDetailedTimingLogs = false; // Default: disabled to avoid performance impact
  private readonly TIMING_LOG_THRESHOLD_MS = 16.67; // Log when processing exceeds 60fps target

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
   * @param fftDisplayEnabled - Whether FFT display is enabled
   * @param enableDetailedLogs - Whether to enable detailed timing logs (optional, defaults to instance setting)
   */
  processFrame(fftDisplayEnabled: boolean, enableDetailedLogs?: boolean): WaveformRenderData | null {
    // Issue #269: Add detailed timing measurements for performance diagnosis
    const t0 = performance.now();
    
    const wasmProcessor = this.wasmLoader.getProcessor();
    if (!this.wasmLoader.isReady() || !wasmProcessor) {
      console.warn('WASM processor not initialized');
      return null;
    }
    
    // Check if audio is ready
    if (!this.audioManager.isReady()) {
      return null;
    }

    const t1 = performance.now();
    // Get waveform data
    const dataArray = this.audioManager.getTimeDomainData();
    if (!dataArray) {
      return null;
    }
    const t2 = performance.now();
    
    // Get sample rate and FFT size
    const sampleRate = this.audioManager.getSampleRate();
    const fftSize = this.audioManager.getFFTSize();
    const t3 = performance.now();
    
    // Get frequency data if needed
    const needsFrequencyData = this.frequencyEstimator.getFrequencyEstimationMethod() === 'fft' || fftDisplayEnabled;
    let frequencyData = needsFrequencyData ? this.audioManager.getFrequencyData() : null;
    const t4 = performance.now();
    
    // If frequency data is needed but not available (e.g., BufferSource mode),
    // compute it from time-domain data using WASM
    if (needsFrequencyData && !frequencyData && dataArray) {
      const computedFreqData = wasmProcessor.computeFrequencyData(dataArray, fftSize);
      if (computedFreqData) {
        frequencyData = new Uint8Array(computedFreqData);
      }
    }
    const t5 = performance.now();
    
    // Sync configuration before processing
    this.syncConfigToWasm();
    const t6 = performance.now();
    
    // Call WASM processor
    const wasmResult = wasmProcessor.processFrame(
      dataArray,
      frequencyData,
      sampleRate,
      fftSize,
      fftDisplayEnabled
    );
    const t7 = performance.now();
    
    if (!wasmResult) {
      return null;
    }
    
    // Convert WASM result to TypeScript WaveformRenderData
    const t8 = performance.now();
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
    const t9 = performance.now();
    
    // Clamp phase markers to enforce 1% per frame movement spec (issue #275)
    this.clampPhaseMarkers(renderData);

    // Calculate and update phase marker offset history (issue #236)
    this.updatePhaseOffsetHistory(renderData);
    
    // Add offset history to render data
    renderData.phaseZeroOffsetHistory = [...this.phaseZeroOffsetHistory];
    renderData.phaseTwoPiOffsetHistory = [...this.phaseTwoPiOffsetHistory];
    
    // Sync results back to TypeScript objects so getters work correctly
    this.syncResultsFromWasm(renderData);
    const t10 = performance.now();
    
    // Log detailed timing breakdown (issue #269)
    // Only log if explicitly enabled or if processing time exceeds threshold
    const shouldLog = enableDetailedLogs !== undefined ? enableDetailedLogs : this.enableDetailedTimingLogs;
    const totalTime = t10 - t0;
    
    if (shouldLog || totalTime > this.TIMING_LOG_THRESHOLD_MS) {
      const timings = {
        init: (t1 - t0).toFixed(2),
        getTimeDomain: (t2 - t1).toFixed(2),
        getMetadata: (t3 - t2).toFixed(2),
        getFreqData: (t4 - t3).toFixed(2),
        computeFFT: (t5 - t4).toFixed(2),
        syncConfig: (t6 - t5).toFixed(2),
        wasmProcess: (t7 - t6).toFixed(2),
        convertResult: (t9 - t8).toFixed(2),
        postProcess: (t10 - t9).toFixed(2),
        total: totalTime.toFixed(2)
      };
      console.log(`[WaveformDataProcessor] init:${timings.init}ms | getTimeDomain:${timings.getTimeDomain}ms | getMeta:${timings.getMetadata}ms | getFreq:${timings.getFreqData}ms | computeFFT:${timings.computeFFT}ms | syncCfg:${timings.syncConfig}ms | WASM:${timings.wasmProcess}ms | convert:${timings.convertResult}ms | post:${timings.postProcess}ms | total:${timings.total}ms`);
    }
    
    return renderData;
  }
  
  /**
   * Enable or disable detailed timing logs for performance diagnostics
   * @param enabled - true to enable detailed timing logs, false to use threshold-based logging
   */
  setDetailedTimingLogs(enabled: boolean): void {
    this.enableDetailedTimingLogs = enabled;
  }
  
  /**
   * Clamp phase marker positions to enforce 1% per frame movement spec (issue #275)
   * Each marker can move at most 1% of ONE CYCLE per frame (not 1% of the 4-cycle window).
   * Positions are tracked as percentages of the display window for consistency.
   * @param renderData - Render data containing phase indices (mutated in place)
   */
  private clampPhaseMarkers(renderData: WaveformRenderData): void {
    if (renderData.displayStartIndex === undefined ||
        renderData.displayEndIndex === undefined) {
      return;
    }

    const displayLength = renderData.displayEndIndex - renderData.displayStartIndex;
    if (displayLength <= 0) {
      return;
    }

    // The display window contains CYCLES_TO_DISPLAY (4) cycles.
    // The spec says: max movement = 1% of ONE cycle per frame.
    // In display-window-percent terms: 1% of one cycle = 1% * (1/4) of display = 0.25%
    const CYCLES_TO_DISPLAY = 4;
    const MAX_CHANGE_PERCENT = 100.0 / CYCLES_TO_DISPLAY * 0.01; // 0.25% of display window = 1% of one cycle

    // Helper: clamp a single marker and return updated percent
    const clampMarker = (
      index: number | undefined,
      prevPercent: number | undefined
    ): { index: number | undefined; percent: number | undefined } => {
      if (index === undefined) {
        return { index: undefined, percent: undefined };
      }
      const currentPercent = ((index - renderData.displayStartIndex) / displayLength) * 100;
      if (prevPercent === undefined) {
        return { index, percent: currentPercent };
      }
      const change = currentPercent - prevPercent;
      if (Math.abs(change) <= MAX_CHANGE_PERCENT) {
        return { index, percent: currentPercent };
      }
      const clampedPercent = prevPercent + Math.sign(change) * MAX_CHANGE_PERCENT;
      const rawIndex = renderData.displayStartIndex + (clampedPercent / 100) * displayLength;
      let clampedIndex: number;
      if (change > 0) {
        // Moving forward: floor so we do not exceed the bound
        clampedIndex = Math.floor(rawIndex);
      } else if (change < 0) {
        // Moving backward: ceil so we do not exceed the bound
        clampedIndex = Math.ceil(rawIndex);
      } else {
        clampedIndex = Math.round(rawIndex);
      }
      const actualPercent =
        ((clampedIndex - renderData.displayStartIndex) / displayLength) * 100;
      return { index: clampedIndex, percent: actualPercent };
    };

    // Clamp all 4 phase markers independently
    const r0 = clampMarker(renderData.phaseZeroIndex, this.prevPhaseZeroPercent);
    renderData.phaseZeroIndex = r0.index;
    this.prevPhaseZeroPercent = r0.percent;

    const r2pi = clampMarker(renderData.phaseTwoPiIndex, this.prevPhaseTwoPiPercent);
    renderData.phaseTwoPiIndex = r2pi.index;
    this.prevPhaseTwoPiPercent = r2pi.percent;

    const rMinus = clampMarker(renderData.phaseMinusQuarterPiIndex, this.prevPhaseMinusQuarterPiPercent);
    renderData.phaseMinusQuarterPiIndex = rMinus.index;
    this.prevPhaseMinusQuarterPiPercent = rMinus.percent;

    const rPlus = clampMarker(renderData.phaseTwoPiPlusQuarterPiIndex, this.prevPhaseTwoPiPlusQuarterPiPercent);
    renderData.phaseTwoPiPlusQuarterPiIndex = rPlus.index;
    this.prevPhaseTwoPiPlusQuarterPiPercent = rPlus.percent;
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
    
    // Spec: max 1% of ONE cycle per frame. Display = 4 cycles, so threshold = 0.25% of display.
    const CYCLES_TO_DISPLAY = 4;
    const VIOLATION_THRESHOLD_PERCENT = 100.0 / CYCLES_TO_DISPLAY * 0.01; // 0.25% of display = 1% of one cycle
    
    // Diagnostic tracking for issue #254
    // Focus: Verify that offsets within 4-cycle window stay within 1% of one cycle per frame
    let shouldLog = false;
    const diagnosticInfo: any = {
      frame: Date.now(),
      fourCycleWindow: {
        lengthSamples: displayLength,  // Length of 4-cycle display window
      },
    };
    
    // Update phase zero offset history if available
    if (renderData.phaseZeroIndex !== undefined) {
      // Calculate relative offset as percentage (0-100) within the 4-cycle window
      // This is the KEY metric: position of "start" marker within 4-cycle coordinate system
      const phaseZeroRelative = renderData.phaseZeroIndex - renderData.displayStartIndex;
      const phaseZeroPercent = (phaseZeroRelative / displayLength) * 100;
      
      // Diagnostic tracking - ONLY 4-cycle coordinate system metrics
      diagnosticInfo.phaseZero = {
        startOffsetPercent: phaseZeroPercent,  // Position within 4-cycle window (0-100%)
      };
      
      if (this.previousPhaseZeroIndex !== undefined) {
        // Detect spikes: 1% of one cycle = 0.25% of display window
        const previousPercent = this.phaseZeroOffsetHistory[this.phaseZeroOffsetHistory.length - 1];
        if (previousPercent !== undefined) {
          const percentChange = Math.abs(phaseZeroPercent - previousPercent);
          diagnosticInfo.phaseZero.offsetChange = percentChange;
          diagnosticInfo.phaseZero.previousOffsetPercent = previousPercent;
          
          if (percentChange > VIOLATION_THRESHOLD_PERCENT) {
            shouldLog = true;
            diagnosticInfo.phaseZero.SPEC_VIOLATION = true;  // Exceeds 1% of one cycle per frame
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
      // Calculate relative offset as percentage (0-100) within the 4-cycle window
      // This is the KEY metric: position of "end" marker within 4-cycle coordinate system
      const phaseTwoPiRelative = renderData.phaseTwoPiIndex - renderData.displayStartIndex;
      const phaseTwoPiPercent = (phaseTwoPiRelative / displayLength) * 100;
      
      // Diagnostic tracking - ONLY 4-cycle coordinate system metrics
      diagnosticInfo.phaseTwoPi = {
        endOffsetPercent: phaseTwoPiPercent,  // Position within 4-cycle window (0-100%)
      };
      
      if (this.previousPhaseTwoPiIndex !== undefined) {
        // Detect spikes: 1% of one cycle = 0.25% of display window
        const previousPercent = this.phaseTwoPiOffsetHistory[this.phaseTwoPiOffsetHistory.length - 1];
        if (previousPercent !== undefined) {
          const percentChange = Math.abs(phaseTwoPiPercent - previousPercent);
          diagnosticInfo.phaseTwoPi.offsetChange = percentChange;
          diagnosticInfo.phaseTwoPi.previousOffsetPercent = previousPercent;
          
          if (percentChange > VIOLATION_THRESHOLD_PERCENT) {
            shouldLog = true;
            diagnosticInfo.phaseTwoPi.SPEC_VIOLATION = true;  // Exceeds 1% of one cycle per frame
          }
        }
      }
      
      this.phaseTwoPiOffsetHistory.push(phaseTwoPiPercent);
      if (this.phaseTwoPiOffsetHistory.length > this.MAX_OFFSET_HISTORY) {
        this.phaseTwoPiOffsetHistory.shift();
      }
      
      this.previousPhaseTwoPiIndex = renderData.phaseTwoPiIndex;
    }
    
    // Log if spec violation detected
    if (shouldLog) {
      console.warn('[1% Spec Violation Detected - Issue #254]', diagnosticInfo);
      console.warn('→ Phase marker moved by more than 1% of one cycle in one frame');
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
    // Clear clamping state (issue #275)
    this.prevPhaseZeroPercent = undefined;
    this.prevPhaseTwoPiPercent = undefined;
    this.prevPhaseMinusQuarterPiPercent = undefined;
    this.prevPhaseTwoPiPlusQuarterPiPercent = undefined;
  }
}
