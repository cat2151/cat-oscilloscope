/**
 * DebugRenderer handles debug visualization for phase estimation debugging
 * Responsible for:
 * - Drawing the full search buffer waveform
 * - Drawing vertical lines for all zero-cross/peak candidates
 * - Drawing the reference waveform (previous frame's 0-2π) on the left side
 */
export class DebugRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private debugDisplayEnabled = false;
  
  // Layout constants
  private readonly REFERENCE_WIDTH_RATIO = 0.2 * (2/3); // Reference waveform occupies 2/3 of original 20% (≈13.3%)
  private readonly CANDIDATES_WIDTH_RATIO = 0.2 * (2/3); // 4 candidates occupy same width as reference (≈13.3%)
  private readonly MAX_CANDIDATES_TO_DISPLAY = 4; // Display first 4 candidates
  private readonly DEBUG_AMPLITUDE_NORMALIZE = 0.85; // Normalize debug waveforms to 85% amplitude
  
  // Candidate visualization constants
  private readonly CANDIDATE_COLORS = ['#ff0000', '#ff00ff', '#ff8800', '#ffff00'];
  private readonly MAX_VISIBLE_LABELS = 10; // Limit candidate labels to prevent overlap

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context for debug canvas');
    }
    this.ctx = context;
  }

  /**
   * Set debug display enabled/disabled
   */
  setDebugDisplay(enabled: boolean): void {
    this.debugDisplayEnabled = enabled;
    // Show or hide the canvas
    this.canvas.style.display = enabled ? 'block' : 'none';
  }

  /**
   * Get debug display enabled status
   */
  getDebugDisplayEnabled(): boolean {
    return this.debugDisplayEnabled;
  }

  /**
   * Clear debug canvas and draw grid
   */
  private clearAndDrawGrid(): void {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    this.ctx.strokeStyle = '#222222';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();

    // Horizontal lines
    const horizontalLines = 4;
    for (let i = 0; i <= horizontalLines; i++) {
      const y = (this.canvas.height / horizontalLines) * i;
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
    }

    // Vertical lines
    const verticalLines = 10;
    for (let i = 0; i <= verticalLines; i++) {
      const x = (this.canvas.width / verticalLines) * i;
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
    }

    this.ctx.stroke();

    // Center line (zero line)
    this.ctx.strokeStyle = '#444444';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.canvas.height / 2);
    this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
    this.ctx.stroke();
  }

  /**
   * Generic method to draw a waveform segment
   * @param data Waveform data
   * @param startX Starting X position on canvas
   * @param width Width of the waveform area
   * @param color Stroke color
   * @param lineWidth Line width
   * @param normalizeAmplitude Whether to normalize amplitude to 85% for better visibility
   */
  private drawWaveformSegment(
    data: Float32Array,
    startX: number,
    width: number,
    color: string,
    lineWidth: number = 1,
    normalizeAmplitude: boolean = true
  ): void {
    if (data.length === 0) {
      return;
    }

    const sliceWidth = width / data.length;
    const centerY = this.canvas.height / 2;
    const baseAmplitude = this.canvas.height / 2;

    // Find max absolute value for normalization
    let maxAbsValue = 0;
    if (normalizeAmplitude) {
      for (let i = 0; i < data.length; i++) {
        const absValue = Math.abs(data[i]);
        if (absValue > maxAbsValue) {
          maxAbsValue = absValue;
        }
      }
    }

    // Calculate amplitude with normalization
    let amplitude: number;
    if (normalizeAmplitude && maxAbsValue > 0) {
      // Normalize to 85% of canvas height
      const normalizationFactor = this.DEBUG_AMPLITUDE_NORMALIZE / maxAbsValue;
      amplitude = baseAmplitude * normalizationFactor;
    } else {
      amplitude = baseAmplitude;
    }

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();

    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      const rawY = centerY - (value * amplitude);
      const y = Math.min(this.canvas.height, Math.max(0, rawY));
      const x = startX + (i * sliceWidth);

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    this.ctx.stroke();
  }

  /**
   * Draw reference waveform on the left side
   */
  private drawReferenceWaveform(referenceData: Float32Array): void {
    if (referenceData.length === 0) {
      return;
    }

    const referenceWidth = Math.floor(this.canvas.width * this.REFERENCE_WIDTH_RATIO);
    
    // Draw reference waveform in cyan
    this.drawWaveformSegment(referenceData, 0, referenceWidth, '#00ffff');

    // Draw separator line
    this.ctx.strokeStyle = '#ffff00';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(referenceWidth, 0);
    this.ctx.lineTo(referenceWidth, this.canvas.height);
    this.ctx.stroke();

    // Add label
    this.ctx.fillStyle = '#ffff00';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.fillText('Reference (0-2π)', 5, 15);
  }

  /**
   * Draw search buffer waveform
   * @param searchBuffer Search buffer data
   * @param startX Starting X position for search buffer
   * @param width Width available for search buffer
   */
  private drawSearchBuffer(searchBuffer: Float32Array, startX: number, width: number): void {
    if (searchBuffer.length === 0) {
      return;
    }
    
    // Draw search buffer waveform in green
    this.drawWaveformSegment(searchBuffer, startX, width, '#00ff00', 1, true);

    // Add label
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.fillText('Search Buffer (Full Frame)', startX + 5, 15);
  }

  /**
   * Draw candidate waveforms in separate sections
   * @param candidates Array of candidate indices in searchBuffer
   * @param searchBuffer Full search buffer data
   * @param referenceData Reference waveform for cycle length estimation
   * @param startX Starting X position for candidate sections
   * @param totalWidth Total width available for all candidates
   */
  private drawCandidateSegments(
    candidates: number[],
    searchBuffer: Float32Array,
    referenceData: Float32Array,
    startX: number,
    totalWidth: number
  ): void {
    if (candidates.length === 0 || searchBuffer.length === 0) {
      return;
    }

    // Limit to first 4 candidates
    const displayCandidates = candidates.slice(0, this.MAX_CANDIDATES_TO_DISPLAY);
    const candidateWidth = totalWidth / this.MAX_CANDIDATES_TO_DISPLAY;

    // Estimate cycle length from reference data
    const cycleLength = referenceData.length;

    // Draw each candidate waveform
    displayCandidates.forEach((candidateIndex, i) => {
      // Validate candidate index
      if (candidateIndex < 0 || candidateIndex >= searchBuffer.length) {
        return;
      }

      // Extract waveform segment around candidate with same length as reference
      const segmentStart = Math.max(0, candidateIndex - Math.floor(cycleLength * 0.1));
      const segmentEnd = Math.min(searchBuffer.length, segmentStart + cycleLength);
      const segmentData = searchBuffer.slice(segmentStart, segmentEnd);

      // Draw waveform in this candidate's section
      const sectionStartX = startX + (i * candidateWidth);
      const color = this.CANDIDATE_COLORS[i % this.CANDIDATE_COLORS.length];
      
      this.drawWaveformSegment(segmentData, sectionStartX, candidateWidth, color, 1.5, true);

      // Draw separator line between candidates
      if (i < displayCandidates.length - 1) {
        this.ctx.strokeStyle = '#444444';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(sectionStartX + candidateWidth, 0);
        this.ctx.lineTo(sectionStartX + candidateWidth, this.canvas.height);
        this.ctx.stroke();
      }

      // Draw label
      this.ctx.fillStyle = color;
      this.ctx.font = 'bold 10px Arial';
      this.ctx.fillText(`Candidate #${i}`, sectionStartX + 5, 15);
    });

    // Draw final separator after all candidates
    this.ctx.strokeStyle = '#ffff00';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    const separatorX = startX + totalWidth;
    this.ctx.moveTo(separatorX, 0);
    this.ctx.lineTo(separatorX, this.canvas.height);
    this.ctx.stroke();
  }

  /**
   * Draw vertical lines for all candidates on the search buffer
   * @param candidates Array of candidate indices
   * @param searchBuffer Search buffer data
   * @param startX Starting X position of search buffer area
   * @param width Width of search buffer area
   */
  private drawCandidateLines(candidates: number[], searchBuffer: Float32Array, startX: number, width: number): void {
    if (candidates.length === 0 || searchBuffer.length === 0) {
      return;
    }

    const sliceWidth = width / searchBuffer.length;

    // Draw vertical lines for each candidate
    candidates.forEach((candidateIndex, i) => {
      // Validate candidate index is within bounds
      if (candidateIndex < 0 || candidateIndex >= searchBuffer.length) {
        return;
      }
      
      const x = startX + (candidateIndex * sliceWidth);

      // Alternate colors for visibility
      this.ctx.strokeStyle = this.CANDIDATE_COLORS[i % this.CANDIDATE_COLORS.length];
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();

      // Draw candidate number label (limit to prevent overlap)
      if (i < this.MAX_VISIBLE_LABELS) {
        this.ctx.fillStyle = this.ctx.strokeStyle;
        this.ctx.font = 'bold 10px Arial';
        this.ctx.fillText(`#${i}`, x + 2, 30 + (i * 12));
      }
    });

    // Add legend
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.fillText(`Candidates: ${candidates.length}`, startX + 5, this.canvas.height - 10);
  }

  /**
   * Render debug visualization
   * @param searchBuffer Full search buffer (current frame's waveform data)
   * @param candidates All zero-cross/peak candidates found
   * @param referenceData Previous frame's 0-2π reference waveform
   */
  renderDebug(
    searchBuffer: Float32Array | null,
    candidates: number[],
    referenceData: Float32Array | null
  ): void {
    if (!this.debugDisplayEnabled) {
      return;
    }

    // Clear and prepare canvas
    this.clearAndDrawGrid();

    // Calculate layout widths
    const referenceWidth = Math.floor(this.canvas.width * this.REFERENCE_WIDTH_RATIO);
    const candidatesWidth = Math.floor(this.canvas.width * this.CANDIDATES_WIDTH_RATIO);
    const searchBufferStartX = referenceWidth + candidatesWidth;
    const searchBufferWidth = this.canvas.width - searchBufferStartX;

    // Draw reference waveform on the left
    if (referenceData && referenceData.length > 0) {
      this.drawReferenceWaveform(referenceData);
    }

    // Draw candidate segments next to reference
    if (searchBuffer && searchBuffer.length > 0 && referenceData && referenceData.length > 0 && candidates.length > 0) {
      this.drawCandidateSegments(candidates, searchBuffer, referenceData, referenceWidth, candidatesWidth);
    }

    // Draw search buffer waveform on the right
    if (searchBuffer && searchBuffer.length > 0) {
      this.drawSearchBuffer(searchBuffer, searchBufferStartX, searchBufferWidth);
      
      // Draw candidate lines on search buffer
      this.drawCandidateLines(candidates, searchBuffer, searchBufferStartX, searchBufferWidth);
    }
  }
}
