/**
 * CycleSimilarityRenderer handles rendering of cycle similarity graphs
 * Displays similarity between consecutive segments for:
 * - 8 divisions (1/2 cycle each)
 * - 4 divisions (1 cycle each)
 * - 2 divisions (2 cycles each)
 */
export declare class CycleSimilarityRenderer {
    private static readonly HISTORY_SIZE;
    private static readonly SEGMENT_COLORS;
    private canvas8div;
    private canvas4div;
    private canvas2div;
    private ctx8div;
    private ctx4div;
    private ctx2div;
    private history8div;
    private history4div;
    private history2div;
    constructor(canvas8div: HTMLCanvasElement, canvas4div: HTMLCanvasElement, canvas2div: HTMLCanvasElement);
    /**
     * Clear all canvases
     */
    private clearAllCanvases;
    /**
     * Clear a single canvas
     */
    private clearCanvas;
    /**
     * Draw a similarity line graph on a canvas showing history for each segment
     * @param ctx Canvas context
     * @param width Canvas width
     * @param height Canvas height
     * @param history History of similarity arrays (each array contains similarities for all segments)
     * @param title Title text for the graph
     * @param segmentLabel Label for what each segment represents (e.g., "1/2 cycle")
     */
    private drawSimilarityGraph;
    /**
     * Update all cycle similarity graphs
     * @param similarities8div 8 divisions (1/2 cycle each): 7 similarity values
     * @param similarities4div 4 divisions (1 cycle each): 3 similarity values
     * @param similarities2div 2 divisions (2 cycles each): 1 similarity value
     */
    updateGraphs(similarities8div?: number[], similarities4div?: number[], similarities2div?: number[]): void;
    /**
     * Clear all graphs
     */
    clear(): void;
}
//# sourceMappingURL=CycleSimilarityRenderer.d.ts.map