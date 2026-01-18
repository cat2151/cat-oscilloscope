import { Oscilloscope } from './Oscilloscope';
import { PianoKeyboardRenderer } from './PianoKeyboardRenderer';
import { DOMElementManager } from './DOMElementManager';
import { DisplayUpdater } from './DisplayUpdater';
import { UIEventHandlers } from './UIEventHandlers';

/**
 * Main application entry point
 * 
 * This module has been refactored to follow the Single Responsibility Principle (SRP).
 * Responsibilities are now clearly separated into specialized classes:
 * - DOMElementManager: DOM element retrieval and validation
 * - DisplayUpdater: Periodic display updates (frequency, note, gain, similarity)
 * - UIEventHandlers: UI event handling and state synchronization
 * 
 * This refactoring reduces complexity and makes the codebase easier for AI agents
 * to understand, thereby reducing hallucinations (incorrect assumptions).
 */

// Retrieve and validate all DOM elements
const dom = new DOMElementManager();

// Initialize oscilloscope with canvas elements
const oscilloscope = new Oscilloscope(
  dom.canvas,
  dom.previousWaveformCanvas,
  dom.currentWaveformCanvas,
  dom.similarityPlotCanvas,
  dom.frameBufferCanvas,
  dom.cycleSimilarity8divCanvas,
  dom.cycleSimilarity4divCanvas,
  dom.cycleSimilarity2divCanvas
);

// Initialize piano keyboard renderer
const pianoKeyboardRenderer = new PianoKeyboardRenderer(dom.pianoKeyboardCanvas);
pianoKeyboardRenderer.render(0); // Render empty keyboard initially

// Initialize display updater
const displayUpdater = new DisplayUpdater(
  oscilloscope,
  pianoKeyboardRenderer,
  dom.frequencyValue,
  dom.noteValue,
  dom.gainValue,
  dom.similarityValue
);

// Initialize UI event handlers
const eventHandlers = new UIEventHandlers(oscilloscope, dom, displayUpdater);
eventHandlers.initializeUIState();
eventHandlers.setupEventHandlers();
