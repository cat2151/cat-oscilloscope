import { OverlayLayout, resolveValue } from '../OverlayLayout';

/**
 * BaseOverlayRenderer provides common functionality for overlay renderers
 * Handles overlay dimension calculations based on layout configuration
 */
export abstract class BaseOverlayRenderer {
  protected ctx: CanvasRenderingContext2D;
  protected canvasWidth: number;
  protected canvasHeight: number;

  constructor(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    this.ctx = ctx;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  /**
   * Update canvas dimensions (call when canvas size changes)
   */
  updateDimensions(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  /**
   * Helper method to calculate overlay dimensions based on layout config
   */
  protected calculateOverlayDimensions(
    layout: OverlayLayout | undefined,
    defaultX: number,
    defaultY: number,
    defaultWidth: number,
    defaultHeight: number
  ): { x: number; y: number; width: number; height: number } {
    if (!layout) {
      return { x: defaultX, y: defaultY, width: defaultWidth, height: defaultHeight };
    }

    let x = defaultX;
    let y = defaultY;
    let width = defaultWidth;
    let height = defaultHeight;

    // Resolve X position
    if (layout.position.x !== undefined) {
      if (typeof layout.position.x === 'string' && layout.position.x.startsWith('right-')) {
        const offset = parseInt(layout.position.x.substring(6), 10);
        const resolvedWidth = typeof layout.size.width === 'string' && layout.size.width.endsWith('%')
          ? resolveValue(layout.size.width, this.canvasWidth)
          : (typeof layout.size.width === 'number' ? layout.size.width : defaultWidth);
        x = this.canvasWidth - resolvedWidth - offset;
      } else {
        x = resolveValue(layout.position.x, this.canvasWidth);
      }
    }

    // Resolve Y position
    if (layout.position.y !== undefined) {
      y = resolveValue(layout.position.y, this.canvasHeight);
    }

    // Resolve width
    if (layout.size.width !== undefined && layout.size.width !== 'auto') {
      width = resolveValue(layout.size.width, this.canvasWidth);
    }

    // Resolve height
    if (layout.size.height !== undefined && layout.size.height !== 'auto') {
      height = resolveValue(layout.size.height, this.canvasHeight);
    }

    return { x, y, width, height };
  }
}
