import { Oscilloscope } from './Oscilloscope';
import { PianoKeyboardRenderer } from './PianoKeyboardRenderer';
import { frequencyToNote } from './utils';

/**
 * DisplayUpdater - Responsible for updating display elements
 * 
 * This class follows the Single Responsibility Principle by having one clear purpose:
 * updating the UI display elements (frequency, note, gain, similarity) periodically.
 */
export class DisplayUpdater {
  private oscilloscope: Oscilloscope;
  private pianoKeyboardRenderer: PianoKeyboardRenderer;
  private frequencyValue: HTMLSpanElement;
  private noteValue: HTMLSpanElement;
  private gainValue: HTMLSpanElement;
  private similarityValue: HTMLSpanElement;
  private updateInterval: number | null = null;
  private readonly UPDATE_INTERVAL_MS = 100; // Update every 100ms (10 Hz)

  constructor(
    oscilloscope: Oscilloscope,
    pianoKeyboardRenderer: PianoKeyboardRenderer,
    frequencyValue: HTMLSpanElement,
    noteValue: HTMLSpanElement,
    gainValue: HTMLSpanElement,
    similarityValue: HTMLSpanElement
  ) {
    this.oscilloscope = oscilloscope;
    this.pianoKeyboardRenderer = pianoKeyboardRenderer;
    this.frequencyValue = frequencyValue;
    this.noteValue = noteValue;
    this.gainValue = gainValue;
    this.similarityValue = similarityValue;
  }

  /**
   * Start periodic display updates
   */
  start(): void {
    if (this.updateInterval === null) {
      this.updateInterval = window.setInterval(() => {
        this.update();
      }, this.UPDATE_INTERVAL_MS);
    }
  }

  /**
   * Stop periodic display updates and clear displays
   */
  stop(): void {
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      this.clearDisplays();
    }
  }

  /**
   * Update all display elements
   */
  private update(): void {
    this.updateFrequencyDisplay();
    this.updateGainDisplay();
    this.updateSimilarityDisplay();
  }

  /**
   * Update frequency and note displays
   */
  private updateFrequencyDisplay(): void {
    const frequency = this.oscilloscope.getEstimatedFrequency();
    if (frequency > 0) {
      this.frequencyValue.textContent = `${frequency.toFixed(1)} Hz`;
      
      // Update note display
      const noteInfo = frequencyToNote(frequency);
      if (noteInfo) {
        const centsSign = noteInfo.cents >= 0 ? '+' : '';
        this.noteValue.textContent = `${noteInfo.noteName}${centsSign}${noteInfo.cents}cent`;
      } else {
        this.noteValue.textContent = '---';
      }
      
      // Update piano keyboard
      this.pianoKeyboardRenderer.render(frequency);
    } else {
      this.frequencyValue.textContent = '--- Hz';
      this.noteValue.textContent = '---';
      this.pianoKeyboardRenderer.render(0);
    }
  }

  /**
   * Update gain display
   */
  private updateGainDisplay(): void {
    const gain = this.oscilloscope.getCurrentGain();
    this.gainValue.textContent = `${gain.toFixed(2)}x`;
  }

  /**
   * Update similarity display
   */
  private updateSimilarityDisplay(): void {
    if (this.oscilloscope.isSimilaritySearchActive()) {
      const similarity = this.oscilloscope.getSimilarityScore();
      this.similarityValue.textContent = similarity.toFixed(3);
    } else {
      this.similarityValue.textContent = '---';
    }
  }

  /**
   * Clear all displays
   */
  private clearDisplays(): void {
    this.frequencyValue.textContent = '--- Hz';
    this.noteValue.textContent = '---';
    this.gainValue.textContent = '---x';
    this.similarityValue.textContent = '---';
    this.pianoKeyboardRenderer.clear();
  }
}
