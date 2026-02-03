import { Oscilloscope } from './Oscilloscope';
import { DOMElementManager } from './DOMElementManager';
import { DisplayUpdater } from './DisplayUpdater';
/**
 * UIEventHandlers - Responsible for setting up and handling UI events
 *
 * This class follows the Single Responsibility Principle by having one clear purpose:
 * setting up and managing all UI event handlers.
 */
export declare class UIEventHandlers {
    private oscilloscope;
    private dom;
    private displayUpdater;
    constructor(oscilloscope: Oscilloscope, dom: DOMElementManager, displayUpdater: DisplayUpdater);
    /**
     * Set up all UI event handlers
     */
    setupEventHandlers(): void;
    /**
     * Initialize UI state to match oscilloscope configuration
     */
    initializeUIState(): void;
    /**
     * Set up checkbox event handlers
     */
    private setupCheckboxHandlers;
    /**
     * Set up slider event handlers
     */
    private setupSliderHandlers;
    /**
     * Set up select element event handlers
     */
    private setupSelectHandlers;
    /**
     * Set up button event handlers
     */
    private setupButtonHandlers;
    /**
     * Set up file input event handler
     */
    private setupFileInputHandler;
    /**
     * Handle start/stop button click
     */
    private handleStartStopButton;
    /**
     * Handle file input change
     */
    private handleFileInput;
    /**
     * Convert slider value (-60 to 0) to threshold amplitude (0.001-1.00)
     * Returns both dB and amplitude to avoid redundant parsing
     */
    private sliderValueToThreshold;
    /**
     * Format threshold display text
     */
    private formatThresholdDisplay;
    /**
     * Update cycle similarity panel display
     */
    private updateCycleSimilarityPanelDisplay;
}
