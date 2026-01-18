/**
 * DOMElementManager - Responsible for DOM element retrieval and validation
 * 
 * This class follows the Single Responsibility Principle by having one clear purpose:
 * retrieving and validating all DOM elements needed by the application.
 */
export class DOMElementManager {
  // Canvas elements
  readonly canvas: HTMLCanvasElement;
  readonly previousWaveformCanvas: HTMLCanvasElement;
  readonly currentWaveformCanvas: HTMLCanvasElement;
  readonly similarityPlotCanvas: HTMLCanvasElement;
  readonly frameBufferCanvas: HTMLCanvasElement;
  readonly cycleSimilarity8divCanvas: HTMLCanvasElement;
  readonly cycleSimilarity4divCanvas: HTMLCanvasElement;
  readonly cycleSimilarity2divCanvas: HTMLCanvasElement;
  readonly pianoKeyboardCanvas: HTMLCanvasElement;

  // Button elements
  readonly startButton: HTMLButtonElement;
  readonly loadFileButton: HTMLButtonElement;

  // Input elements
  readonly fileInput: HTMLInputElement;
  readonly autoGainCheckbox: HTMLInputElement;
  readonly noiseGateCheckbox: HTMLInputElement;
  readonly fftDisplayCheckbox: HTMLInputElement;
  readonly pauseDrawingCheckbox: HTMLInputElement;
  readonly noiseGateThreshold: HTMLInputElement;

  // Select elements
  readonly frequencyMethod: HTMLSelectElement;
  readonly bufferSizeMultiplier: HTMLSelectElement;
  readonly zeroCrossMode: HTMLSelectElement;

  // Display elements
  readonly thresholdValue: HTMLSpanElement;
  readonly statusElement: HTMLSpanElement;
  readonly frequencyValue: HTMLSpanElement;
  readonly noteValue: HTMLSpanElement;
  readonly gainValue: HTMLSpanElement;
  readonly similarityValue: HTMLSpanElement;

  constructor() {
    // Retrieve canvas elements
    this.canvas = this.getElement('canvas') as HTMLCanvasElement;
    this.previousWaveformCanvas = this.getElement('previousWaveformCanvas') as HTMLCanvasElement;
    this.currentWaveformCanvas = this.getElement('currentWaveformCanvas') as HTMLCanvasElement;
    this.similarityPlotCanvas = this.getElement('similarityPlotCanvas') as HTMLCanvasElement;
    this.frameBufferCanvas = this.getElement('frameBufferCanvas') as HTMLCanvasElement;
    this.cycleSimilarity8divCanvas = this.getElement('cycleSimilarity8divCanvas') as HTMLCanvasElement;
    this.cycleSimilarity4divCanvas = this.getElement('cycleSimilarity4divCanvas') as HTMLCanvasElement;
    this.cycleSimilarity2divCanvas = this.getElement('cycleSimilarity2divCanvas') as HTMLCanvasElement;
    this.pianoKeyboardCanvas = this.getElement('pianoKeyboardCanvas') as HTMLCanvasElement;

    // Retrieve button elements
    this.startButton = this.getElement('startButton') as HTMLButtonElement;
    this.loadFileButton = this.getElement('loadFileButton') as HTMLButtonElement;

    // Retrieve input elements
    this.fileInput = this.getElement('fileInput') as HTMLInputElement;
    this.autoGainCheckbox = this.getElement('autoGainCheckbox') as HTMLInputElement;
    this.noiseGateCheckbox = this.getElement('noiseGateCheckbox') as HTMLInputElement;
    this.fftDisplayCheckbox = this.getElement('fftDisplayCheckbox') as HTMLInputElement;
    this.pauseDrawingCheckbox = this.getElement('pauseDrawingCheckbox') as HTMLInputElement;
    this.noiseGateThreshold = this.getElement('noiseGateThreshold') as HTMLInputElement;

    // Retrieve select elements
    this.frequencyMethod = this.getElement('frequencyMethod') as HTMLSelectElement;
    this.bufferSizeMultiplier = this.getElement('bufferSizeMultiplier') as HTMLSelectElement;
    this.zeroCrossMode = this.getElement('zeroCrossMode') as HTMLSelectElement;

    // Retrieve display elements
    this.thresholdValue = this.getElement('thresholdValue') as HTMLSpanElement;
    this.statusElement = this.getElement('status') as HTMLSpanElement;
    this.frequencyValue = this.getElement('frequencyValue') as HTMLSpanElement;
    this.noteValue = this.getElement('noteValue') as HTMLSpanElement;
    this.gainValue = this.getElement('gainValue') as HTMLSpanElement;
    this.similarityValue = this.getElement('similarityValue') as HTMLSpanElement;

    // Validate all elements
    this.validateElements();
  }

  /**
   * Get an element by ID and throw if not found
   */
  private getElement(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Required DOM element not found: ${id}`);
    }
    return element;
  }

  /**
   * Validate that all elements are present
   * This method exists for additional type safety and explicit validation
   */
  private validateElements(): void {
    const elements = [
      { element: this.canvas, name: 'canvas' },
      { element: this.previousWaveformCanvas, name: 'previousWaveformCanvas' },
      { element: this.currentWaveformCanvas, name: 'currentWaveformCanvas' },
      { element: this.similarityPlotCanvas, name: 'similarityPlotCanvas' },
      { element: this.frameBufferCanvas, name: 'frameBufferCanvas' },
      { element: this.cycleSimilarity8divCanvas, name: 'cycleSimilarity8divCanvas' },
      { element: this.cycleSimilarity4divCanvas, name: 'cycleSimilarity4divCanvas' },
      { element: this.cycleSimilarity2divCanvas, name: 'cycleSimilarity2divCanvas' },
      { element: this.pianoKeyboardCanvas, name: 'pianoKeyboardCanvas' },
      { element: this.startButton, name: 'startButton' },
      { element: this.loadFileButton, name: 'loadFileButton' },
      { element: this.fileInput, name: 'fileInput' },
      { element: this.autoGainCheckbox, name: 'autoGainCheckbox' },
      { element: this.noiseGateCheckbox, name: 'noiseGateCheckbox' },
      { element: this.fftDisplayCheckbox, name: 'fftDisplayCheckbox' },
      { element: this.pauseDrawingCheckbox, name: 'pauseDrawingCheckbox' },
      { element: this.noiseGateThreshold, name: 'noiseGateThreshold' },
      { element: this.thresholdValue, name: 'thresholdValue' },
      { element: this.statusElement, name: 'status' },
      { element: this.frequencyMethod, name: 'frequencyMethod' },
      { element: this.bufferSizeMultiplier, name: 'bufferSizeMultiplier' },
      { element: this.zeroCrossMode, name: 'zeroCrossMode' },
      { element: this.frequencyValue, name: 'frequencyValue' },
      { element: this.noteValue, name: 'noteValue' },
      { element: this.gainValue, name: 'gainValue' },
      { element: this.similarityValue, name: 'similarityValue' },
    ];

    for (const { element, name } of elements) {
      if (!element) {
        throw new Error(`Required DOM element not found: ${name}`);
      }
    }
  }
}
