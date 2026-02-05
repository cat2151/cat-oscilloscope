/**
 * SimilarityPlotRenderer - Responsible for drawing similarity history plots
 * Displays time-series changes in similarity to detect instantaneous drops
 */
export declare class SimilarityPlotRenderer {
    /**
     * Draw similarity history plot on similarity canvas
     * 類似度の時系列変化を表示し、瞬間的な類似度低下を検出しやすくする
     *
     * @param ctx - Canvas 2D rendering context
     * @param width - Canvas width
     * @param height - Canvas height
     * @param similarityHistory - Array of correlation coefficients (-1.0 to 1.0).
     *                            Values are ordered chronologically from oldest to newest.
     */
    drawSimilarityPlot(ctx: CanvasRenderingContext2D, width: number, height: number, similarityHistory: number[]): void;
    /**
     * Draw similarity score text on a canvas
     */
    drawSimilarityText(ctx: CanvasRenderingContext2D, width: number, similarity: number): void;
}
