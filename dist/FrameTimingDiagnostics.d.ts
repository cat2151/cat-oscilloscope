/**
 * Frame timing diagnostics module
 * Tracks and logs frame processing times and FPS metrics
 */
export declare class FrameTimingDiagnostics {
    private lastFrameTime;
    private frameProcessingTimes;
    private frameCount;
    private readonly MAX_FRAME_TIMES;
    private readonly TARGET_FRAME_TIME;
    private readonly FPS_LOG_INTERVAL_FRAMES;
    private enableDetailedTimingLogs;
    /**
     * Set whether detailed timing logs are enabled
     * @param enabled - true to enable detailed timing logs, false to use threshold-based logging
     */
    setDetailedTimingLogs(enabled: boolean): void;
    /**
     * Get whether detailed timing logs are enabled
     * @returns true if detailed timing logs are enabled
     */
    getDetailedTimingLogsEnabled(): boolean;
    /**
     * Record frame processing time and log diagnostics if needed
     * @param startTime - Frame start timestamp
     * @param endTime - Frame end timestamp
     */
    recordFrameTime(startTime: number, endTime: number): void;
    /**
     * Log detailed timing breakdown if enabled or if performance is poor
     * @param dataProcessingTime - Time spent in data processing phase
     * @param renderingTime - Time spent in rendering phase
     */
    logDetailedTiming(dataProcessingTime: number, renderingTime: number): void;
    /**
     * Reset timing diagnostics
     */
    reset(): void;
}
