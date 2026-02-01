/**
 * DOMElementManager - Responsible for DOM element retrieval and validation
 *
 * This class follows the Single Responsibility Principle by having one clear purpose:
 * retrieving and validating all DOM elements needed by the application.
 */
export declare class DOMElementManager {
    readonly canvas: HTMLCanvasElement;
    readonly previousWaveformCanvas: HTMLCanvasElement;
    readonly currentWaveformCanvas: HTMLCanvasElement;
    readonly similarityPlotCanvas: HTMLCanvasElement;
    readonly frameBufferCanvas: HTMLCanvasElement;
    readonly cycleSimilarity8divCanvas: HTMLCanvasElement;
    readonly cycleSimilarity4divCanvas: HTMLCanvasElement;
    readonly cycleSimilarity2divCanvas: HTMLCanvasElement;
    readonly pianoKeyboardCanvas: HTMLCanvasElement;
    readonly startButton: HTMLButtonElement;
    readonly loadFileButton: HTMLButtonElement;
    readonly fileInput: HTMLInputElement;
    readonly autoGainCheckbox: HTMLInputElement;
    readonly noiseGateCheckbox: HTMLInputElement;
    readonly fftDisplayCheckbox: HTMLInputElement;
    readonly harmonicAnalysisCheckbox: HTMLInputElement;
    readonly pauseDrawingCheckbox: HTMLInputElement;
    readonly noiseGateThreshold: HTMLInputElement;
    readonly frequencyMethod: HTMLSelectElement;
    readonly bufferSizeMultiplier: HTMLSelectElement;
    readonly zeroCrossMode: HTMLSelectElement;
    readonly thresholdValue: HTMLSpanElement;
    readonly statusElement: HTMLSpanElement;
    readonly frequencyValue: HTMLSpanElement;
    readonly noteValue: HTMLSpanElement;
    readonly gainValue: HTMLSpanElement;
    readonly similarityValue: HTMLSpanElement;
    constructor();
    /**
     * Get an element by ID and throw if not found
     */
    private getElement;
    /**
     * Validate that all elements are present
     * This method exists for additional type safety and explicit validation
     */
    private validateElements;
}
