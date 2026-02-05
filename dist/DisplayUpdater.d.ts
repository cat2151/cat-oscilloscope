import { Oscilloscope } from './Oscilloscope';
import { PianoKeyboardRenderer } from './PianoKeyboardRenderer';
/**
 * DisplayUpdater - Responsible for updating display elements
 *
 * This class follows the Single Responsibility Principle by having one clear purpose:
 * updating the UI display elements (frequency, note, gain, similarity) periodically.
 */
export declare class DisplayUpdater {
    private oscilloscope;
    private pianoKeyboardRenderer;
    private frequencyValue;
    private noteValue;
    private gainValue;
    private similarityValue;
    private updateInterval;
    private readonly UPDATE_INTERVAL_MS;
    constructor(oscilloscope: Oscilloscope, pianoKeyboardRenderer: PianoKeyboardRenderer, frequencyValue: HTMLSpanElement, noteValue: HTMLSpanElement, gainValue: HTMLSpanElement, similarityValue: HTMLSpanElement);
    /**
     * Start periodic display updates
     */
    start(): void;
    /**
     * Stop periodic display updates and clear displays
     */
    stop(): void;
    /**
     * Update all display elements
     */
    private update;
    /**
     * Update frequency and note displays
     */
    private updateFrequencyDisplay;
    /**
     * Update gain display
     */
    private updateGainDisplay;
    /**
     * Update similarity display
     */
    private updateSimilarityDisplay;
    /**
     * Clear all displays
     */
    private clearDisplays;
}
//# sourceMappingURL=DisplayUpdater.d.ts.map