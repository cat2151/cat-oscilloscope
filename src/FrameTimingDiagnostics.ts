/**
 * Frame timing diagnostics module
 * Tracks and logs frame processing times and FPS metrics
 */
export class FrameTimingDiagnostics {
  private lastFrameTime = 0;
  private frameProcessingTimes: number[] = [];
  private readonly MAX_FRAME_TIMES = 100;
  private readonly TARGET_FRAME_TIME = 16.67; // 60fps target
  private readonly FPS_LOG_INTERVAL_FRAMES = 60; // Log FPS every 60 frames (approx. 1 second at 60fps)
  private enableDetailedTimingLogs = false; // Default: disabled to avoid performance impact

  /**
   * Set whether detailed timing logs are enabled
   * @param enabled - true to enable detailed timing logs, false to use threshold-based logging
   */
  setDetailedTimingLogs(enabled: boolean): void {
    this.enableDetailedTimingLogs = enabled;
  }

  /**
   * Get whether detailed timing logs are enabled
   * @returns true if detailed timing logs are enabled
   */
  getDetailedTimingLogsEnabled(): boolean {
    return this.enableDetailedTimingLogs;
  }

  /**
   * Record frame processing time and log diagnostics if needed
   * @param startTime - Frame start timestamp
   * @param endTime - Frame end timestamp
   */
  recordFrameTime(startTime: number, endTime: number): void {
    const processingTime = endTime - startTime;
    this.frameProcessingTimes.push(processingTime);
    if (this.frameProcessingTimes.length > this.MAX_FRAME_TIMES) {
      this.frameProcessingTimes.shift();
    }

    // Warn if frame processing exceeds target (60fps)
    if (processingTime > this.TARGET_FRAME_TIME) {
      console.warn(`Frame processing time: ${processingTime.toFixed(2)}ms (target: <${this.TARGET_FRAME_TIME}ms)`);
    }

    // Calculate and log FPS periodically (every FPS_LOG_INTERVAL_FRAMES frames)
    if (this.lastFrameTime > 0) {
      const frameInterval = startTime - this.lastFrameTime;
      const currentFps = 1000 / frameInterval;

      if (this.frameProcessingTimes.length === this.FPS_LOG_INTERVAL_FRAMES) {
        const avgProcessingTime = this.frameProcessingTimes.reduce((a, b) => a + b, 0) / this.frameProcessingTimes.length;
        console.log(`FPS: ${currentFps.toFixed(1)}, Avg frame time: ${avgProcessingTime.toFixed(2)}ms`);
      }
    }
    this.lastFrameTime = startTime;
  }

  /**
   * Log detailed timing breakdown if enabled or if performance is poor
   * @param dataProcessingTime - Time spent in data processing phase
   * @param renderingTime - Time spent in rendering phase
   */
  logDetailedTiming(dataProcessingTime: number, renderingTime: number): void {
    const totalTime = dataProcessingTime + renderingTime;

    // Log if explicitly enabled or if performance exceeds target (diagnostic threshold)
    if (this.enableDetailedTimingLogs || totalTime > this.TARGET_FRAME_TIME) {
      console.log(`[Frame Timing] Total: ${totalTime.toFixed(2)}ms | Data Processing: ${dataProcessingTime.toFixed(2)}ms | Rendering: ${renderingTime.toFixed(2)}ms`);
    }
  }

  /**
   * Reset timing diagnostics
   */
  reset(): void {
    this.lastFrameTime = 0;
    this.frameProcessingTimes = [];
  }
}
