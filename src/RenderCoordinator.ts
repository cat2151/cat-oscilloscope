import { WaveformRenderer } from './WaveformRenderer';
import { ComparisonPanelRenderer } from './ComparisonPanelRenderer';
import { CycleSimilarityRenderer } from './CycleSimilarityRenderer';
import { FrequencyEstimator } from './FrequencyEstimator';
import { WaveformRenderData } from './WaveformRenderData';

/**
 * Render coordinator module
 * Coordinates the rendering of waveform data across multiple renderers
 */
export class RenderCoordinator {
  constructor(
    private renderer: WaveformRenderer,
    private comparisonRenderer: ComparisonPanelRenderer,
    private cycleSimilarityRenderer: CycleSimilarityRenderer | null,
    private frequencyEstimator: FrequencyEstimator
  ) {}

  /**
   * Render a single frame using pre-processed data
   * This method contains only rendering logic - no data processing
   * @param renderData - Pre-processed waveform render data
   * @param phaseMarkerRangeEnabled - Whether to display only phase marker range
   */
  renderFrame(renderData: WaveformRenderData, phaseMarkerRangeEnabled: boolean): void {
    // Determine display range based on phase marker range mode
    let displayStartIndex = renderData.displayStartIndex;
    let displayEndIndex = renderData.displayEndIndex;

    if (phaseMarkerRangeEnabled &&
        renderData.phaseMinusQuarterPiIndex !== undefined &&
        renderData.phaseTwoPiPlusQuarterPiIndex !== undefined &&
        renderData.phaseMinusQuarterPiIndex <= renderData.phaseTwoPiPlusQuarterPiIndex) {
      // Use phase marker range (orange to orange)
      displayStartIndex = renderData.phaseMinusQuarterPiIndex;
      displayEndIndex = renderData.phaseTwoPiPlusQuarterPiIndex;
    }

    // Clear canvas and draw grid with measurement labels
    const displaySamples = displayEndIndex - displayStartIndex;
    this.renderer.clearAndDrawGrid(
      renderData.sampleRate,
      displaySamples,
      renderData.gain
    );

    // Draw waveform with calculated gain
    this.renderer.drawWaveform(
      renderData.waveformData,
      displayStartIndex,
      displayEndIndex,
      renderData.gain
    );

    // Draw phase markers
    this.renderer.drawPhaseMarkers(
      renderData.phaseZeroIndex,
      renderData.phaseTwoPiIndex,
      renderData.phaseMinusQuarterPiIndex,
      renderData.phaseTwoPiPlusQuarterPiIndex,
      displayStartIndex,
      displayEndIndex,
      {
        phaseZeroSegmentRelative: renderData.phaseZeroSegmentRelative,
        phaseZeroHistory: renderData.phaseZeroHistory,
        phaseZeroTolerance: renderData.phaseZeroTolerance,
        zeroCrossModeName: renderData.zeroCrossModeName,
      }
    );

    // Draw FFT spectrum overlay if enabled and signal is above noise gate
    if (renderData.frequencyData && this.renderer.getFFTDisplayEnabled() && renderData.isSignalAboveNoiseGate) {
      this.renderer.drawFFTOverlay(
        renderData.frequencyData,
        renderData.estimatedFrequency,
        renderData.sampleRate,
        renderData.fftSize,
        renderData.maxFrequency
      );

      // Draw harmonic analysis overlay (only when FFT method is used and data is available)
      this.renderer.drawHarmonicAnalysis(
        renderData.halfFreqPeakStrengthPercent,
        renderData.candidate1Harmonics,
        renderData.candidate2Harmonics,
        renderData.candidate1WeightedScore,
        renderData.candidate2WeightedScore,
        renderData.selectionReason,
        renderData.estimatedFrequency
      );
    }

    // 右上に周波数プロットを描画
    this.renderer.drawFrequencyPlot(
      renderData.frequencyPlotHistory,
      this.frequencyEstimator.getMinFrequency(),
      this.frequencyEstimator.getMaxFrequency()
    );

    // Update comparison panels with similarity history
    // Use original 4-cycle range from WASM (renderData.displayStartIndex/displayEndIndex)
    // instead of the phase-marker-narrowed range (displayStartIndex/displayEndIndex)
    this.comparisonRenderer.updatePanels(
      renderData.previousWaveform,
      renderData.waveformData,
      renderData.displayStartIndex,
      renderData.displayEndIndex,
      renderData.waveformData,
      renderData.similarity,
      renderData.similarityPlotHistory,
      renderData.phaseZeroOffsetHistory,
      renderData.phaseTwoPiOffsetHistory,
      renderData.phaseZeroIndex,
      renderData.phaseTwoPiIndex,
      renderData.phaseMinusQuarterPiIndex,
      renderData.phaseTwoPiPlusQuarterPiIndex,
      renderData.zeroCrossCandidates ?? [],
      renderData.highlightedZeroCrossCandidate
    );

    // Update cycle similarity graphs if renderer is available
    if (this.cycleSimilarityRenderer) {
      this.cycleSimilarityRenderer.updateGraphs(
        renderData.cycleSimilarities8div,
        renderData.cycleSimilarities4div,
        renderData.cycleSimilarities2div
      );
    }
  }
}
