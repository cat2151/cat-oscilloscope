import { AudioManager } from './AudioManager';
import { GainController } from './GainController';
import { FrequencyEstimator } from './FrequencyEstimator';
import { ZeroCrossDetector } from './ZeroCrossDetector';
import { WaveformSearcher, CYCLES_TO_STORE } from './WaveformSearcher';
import { WaveformRenderData } from './WaveformRenderData';

/**
 * WaveformDataProcessor - Handles all data generation and processing logic
 * 
 * This class is responsible for:
 * - Acquiring audio data from AudioManager
 * - Applying noise gate and gain control
 * - Frequency estimation
 * - Zero-cross detection and waveform alignment
 * - Waveform similarity search
 * - Preparing structured data for rendering
 * 
 * This class contains NO rendering logic - it only processes data and returns
 * a WaveformRenderData structure that contains all information needed for rendering.
 */
export class WaveformDataProcessor {
  private audioManager: AudioManager;
  private gainController: GainController;
  private frequencyEstimator: FrequencyEstimator;
  private zeroCrossDetector: ZeroCrossDetector;
  private waveformSearcher: WaveformSearcher;

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
   * Calculate cycle length from estimated frequency and sample rate
   */
  private calculateCycleLength(frequency: number, sampleRate: number): number {
    if (frequency > 0 && sampleRate > 0) {
      return sampleRate / frequency;
    }
    return 0;
  }

  /**
   * Store waveform for next frame's similarity comparison (4 cycles worth)
   */
  private storeWaveformForNextFrame(data: Float32Array, startIndex: number, cycleLength: number): void {
    if (cycleLength > 0) {
      // Store N cycles worth of waveform data (where N is CYCLES_TO_STORE)
      const waveformLength = Math.floor(cycleLength * CYCLES_TO_STORE);
      const endIndex = Math.min(startIndex + waveformLength, data.length);
      this.waveformSearcher.storeWaveform(data, startIndex, endIndex);
    }
  }

  /**
   * Process current frame and generate complete render data
   * 
   * @param fftDisplayEnabled - Whether FFT display is enabled (determines if frequency data is fetched)
   * @returns WaveformRenderData structure with all information for rendering, or null if no data available
   */
  processFrame(fftDisplayEnabled: boolean): WaveformRenderData | null {
    // Check if audio is ready
    if (!this.audioManager.isReady()) {
      return null;
    }

    // Get waveform data
    const dataArray = this.audioManager.getTimeDomainData();
    if (!dataArray) {
      return null;
    }

    // Apply noise gate to input signal (modifies dataArray in place)
    this.gainController.applyNoiseGate(dataArray);

    // Check if signal passed noise gate for FFT frequency estimation
    const isSignalAboveNoiseGate = this.gainController.isSignalAboveNoiseGate(dataArray);

    const sampleRate = this.audioManager.getSampleRate();
    const fftSize = this.audioManager.getFFTSize();

    // Get extended buffer for STFT/CQT methods if needed
    const bufferMultiplier = this.frequencyEstimator.getBufferSizeMultiplier();
    const extendedDataArray = (bufferMultiplier > 1) 
      ? this.audioManager.getExtendedTimeDomainData(bufferMultiplier) 
      : dataArray;
    
    // Use extended buffer if available, otherwise fall back to current buffer
    const dataForFrequencyEstimation = extendedDataArray || dataArray;

    // Only fetch frequency data if needed (FFT method OR FFT display enabled)
    const needsFrequencyData = this.frequencyEstimator.getFrequencyEstimationMethod() === 'fft' || fftDisplayEnabled;
    const frequencyData = needsFrequencyData ? this.audioManager.getFrequencyData() : null;

    // Estimate frequency (now works on gated signal, using extended buffer for STFT/CQT)
    const estimatedFrequency = this.frequencyEstimator.estimateFrequency(
      dataForFrequencyEstimation,
      frequencyData,
      sampleRate,
      fftSize,
      isSignalAboveNoiseGate
    );

    // Calculate cycle length from estimated frequency
    const cycleLength = this.calculateCycleLength(estimatedFrequency, sampleRate);

    // Try to find similar waveform if we have a previous waveform and valid cycle length
    let displayStartIndex = 0;
    let displayEndIndex = dataArray.length;
    let firstAlignmentPoint: number | undefined = undefined;
    let secondAlignmentPoint: number | undefined = undefined;
    let usedSimilaritySearch = false;
    
    if (this.waveformSearcher.hasPreviousWaveform() && cycleLength > 0) {
      const searchResult = this.waveformSearcher.searchSimilarWaveform(dataArray, cycleLength);
      if (searchResult) {
        // Use similarity search result - display N cycles worth (where N is CYCLES_TO_STORE)
        const waveformLength = Math.floor(cycleLength * CYCLES_TO_STORE);
        displayStartIndex = searchResult.startIndex;
        displayEndIndex = Math.min(displayStartIndex + waveformLength, dataArray.length);
        usedSimilaritySearch = true;
      }
    }
    
    // Fallback to zero-cross detection if similarity search not available
    if (!usedSimilaritySearch) {
      const displayRange = this.zeroCrossDetector.calculateDisplayRange(
        dataArray,
        estimatedFrequency,
        sampleRate
      );
      
      if (displayRange) {
        displayStartIndex = displayRange.startIndex;
        displayEndIndex = displayRange.endIndex;
        firstAlignmentPoint = displayRange.firstZeroCross;
        secondAlignmentPoint = displayRange.secondZeroCross;
      } else {
        // No zero-cross found, use entire buffer
        displayStartIndex = 0;
        displayEndIndex = dataArray.length;
      }
    }

    // Calculate auto gain for the display range
    this.gainController.calculateAutoGain(dataArray, displayStartIndex, displayEndIndex);
    const gain = this.gainController.getCurrentGain();

    // Store waveform for next frame's comparison
    this.storeWaveformForNextFrame(dataArray, displayStartIndex, cycleLength);

    // Get waveform search data
    const previousWaveform = this.waveformSearcher.getPreviousWaveform();
    const similarity = this.waveformSearcher.getLastSimilarity();

    // Return complete render data structure
    return {
      waveformData: dataArray,
      displayStartIndex,
      displayEndIndex,
      gain,
      estimatedFrequency,
      frequencyPlotHistory: this.frequencyEstimator.getFrequencyPlotHistory(),
      sampleRate,
      fftSize,
      firstAlignmentPoint,
      secondAlignmentPoint,
      frequencyData: frequencyData ?? undefined,
      isSignalAboveNoiseGate,
      maxFrequency: this.frequencyEstimator.getMaxFrequency(),
      previousWaveform,
      similarity,
      usedSimilaritySearch,
    };
  }
}
