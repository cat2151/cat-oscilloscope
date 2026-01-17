/**
 * Layout configuration for overlay panels
 * Allows external applications to control the position and size of debug overlays
 */

/**
 * Position configuration for an overlay
 */
export interface OverlayPosition {
  /** X coordinate (in pixels or percentage string like '10%') */
  x: number | string;
  /** Y coordinate (in pixels or percentage string like '10%') */
  y: number | string;
}

/**
 * Size configuration for an overlay
 */
export interface OverlaySize {
  /** Width (in pixels or percentage string like '35%') */
  width: number | string;
  /** Height (in pixels or percentage string like '35%') */
  height: number | string;
}

/**
 * Complete layout configuration for an overlay
 */
export interface OverlayLayout {
  position: OverlayPosition;
  size: OverlaySize;
}

/**
 * Layout configuration for all overlays
 */
export interface OverlaysLayoutConfig {
  /** FFT spectrum overlay (bottom-left by default) */
  fftOverlay?: OverlayLayout;
  /** Harmonic analysis overlay (top-left by default) */
  harmonicAnalysis?: OverlayLayout;
  /** Frequency plot overlay (top-right by default) */
  frequencyPlot?: OverlayLayout;
}

/**
 * Helper function to resolve position/size value
 * Converts percentage strings to actual pixel values based on canvas dimensions
 * @param value - Value to resolve (number or string)
 * @param canvasSize - Canvas dimension (width or height) in pixels
 * @returns Resolved pixel value
 */
export function resolveValue(value: number | string, canvasSize: number): number {
  if (typeof value === 'string' && value.endsWith('%')) {
    const percentage = parseFloat(value);
    // Validate percentage value
    if (isNaN(percentage)) {
      console.warn(`Invalid percentage value: ${value}, using 0`);
      return 0;
    }
    if (percentage < 0) {
      console.warn(`Negative percentage value: ${value}, clamping to 0`);
      return 0;
    }
    return Math.floor(canvasSize * (percentage / 100));
  }
  
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      console.warn(`Invalid numeric string: ${value}, using 0`);
      return 0;
    }
    return Math.max(0, parsed); // Clamp negative values to 0
  }
  
  if (typeof value === 'number') {
    if (isNaN(value)) {
      console.warn(`Invalid number value: ${value}, using 0`);
      return 0;
    }
    return Math.max(0, Math.floor(value)); // Clamp negative values to 0
  }
  
  return 0;
}

/**
 * Default layout configuration
 */
export const DEFAULT_OVERLAYS_LAYOUT: OverlaysLayoutConfig = {
  fftOverlay: {
    position: { x: 10, y: '65%' },
    size: { width: '35%', height: '35%' }
  },
  harmonicAnalysis: {
    position: { x: 10, y: 10 },
    size: { width: 500, height: 'auto' }
  },
  frequencyPlot: {
    position: { x: 'right-10', y: 10 },
    size: { width: 280, height: 120 }
  }
};
