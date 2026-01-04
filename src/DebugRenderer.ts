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
  
  // Layout constants - 2-row layout
  private readonly ROW1_HEIGHT_RATIO = 0.45; // Row 1 (reference + candidates) occupies 45% of canvas height
  private readonly ROW_SEGMENTS = 5; // Row 1 has 5 equal segments: reference + 4 candidates
  private readonly MAX_CANDIDATES_TO_DISPLAY = 4; // Display first 4 candidates
  private readonly DEBUG_AMPLITUDE_NORMALIZE = 0.85; // Normalize debug waveforms to 85% amplitude
  private readonly CANDIDATE_SEGMENT_PADDING_RATIO = 0.5; // Center candidate in segment (extract from -50% to +50% of cycle length)
  
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
   * Clear debug canvas and draw grid for both rows
   */
  private clearAndDrawGrid(): void {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Calculate row heights
    const row1Height = Math.floor(this.canvas.height * this.ROW1_HEIGHT_RATIO);
    const row2YOffset = row1Height;
    const row2Height = this.canvas.height - row1Height;

    // Draw grid for row 1
    this.ctx.strokeStyle = '#222222';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();

    // Horizontal lines for row 1
    const horizontalLines1 = 2;
    for (let i = 0; i <= horizontalLines1; i++) {
      const y = (row1Height / horizontalLines1) * i;
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
    }

    // Vertical lines for row 1 (5 segments)
    for (let i = 0; i <= this.ROW_SEGMENTS; i++) {
      const x = (this.canvas.width / this.ROW_SEGMENTS) * i;
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, row1Height);
    }

    this.ctx.stroke();

    // Draw grid for row 2
    this.ctx.strokeStyle = '#222222';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();

    // Horizontal lines for row 2
    const horizontalLines2 = 2;
    for (let i = 0; i <= horizontalLines2; i++) {
      const y = row2YOffset + (row2Height / horizontalLines2) * i;
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
    }

    // Vertical lines for row 2
    const verticalLines = 10;
    for (let i = 0; i <= verticalLines; i++) {
      const x = (this.canvas.width / verticalLines) * i;
      this.ctx.moveTo(x, row2YOffset);
      this.ctx.lineTo(x, row2YOffset + row2Height);
    }

    this.ctx.stroke();

    // Center line (zero line) for row 1
    this.ctx.strokeStyle = '#444444';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, row1Height / 2);
    this.ctx.lineTo(this.canvas.width, row1Height / 2);
    this.ctx.stroke();

    // Center line (zero line) for row 2
    this.ctx.strokeStyle = '#444444';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, row2YOffset + row2Height / 2);
    this.ctx.lineTo(this.canvas.width, row2YOffset + row2Height / 2);
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
   * @param height Height of the drawing area (defaults to canvas height)
   * @param yOffset Y offset from top of canvas (defaults to 0)
   */
  private drawWaveformSegment(
    data: Float32Array,
    startX: number,
    width: number,
    color: string,
    lineWidth: number = 1,
    normalizeAmplitude: boolean = true,
    height?: number,
    yOffset: number = 0
  ): void {
    if (data.length === 0) {
      return;
    }

    const sliceWidth = width / data.length;
    const effectiveHeight = height ?? this.canvas.height;
    const centerY = yOffset + effectiveHeight / 2;
    const baseAmplitude = effectiveHeight / 2;

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
      // Normalize waveform so its maximum amplitude reaches 85% of half canvas height (baseAmplitude)
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
      const y = Math.min(yOffset + effectiveHeight, Math.max(yOffset, rawY));
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
   * Draw reference waveform in the first segment of row 1
   * @param referenceData Reference waveform data
   * @param segmentWidth Width of one segment in row 1
   * @param row1Height Height of row 1
   */
  private drawReferenceWaveform(referenceData: Float32Array, segmentWidth: number, row1Height: number): void {
    if (referenceData.length === 0) {
      return;
    }
    
    // Draw reference waveform in cyan with amplitude normalization
    this.drawWaveformSegment(referenceData, 0, segmentWidth, '#00ffff', 1, true, row1Height, 0);

    // Draw separator line
    this.ctx.strokeStyle = '#444444';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(segmentWidth, 0);
    this.ctx.lineTo(segmentWidth, row1Height);
    this.ctx.stroke();

    // Add label
    this.ctx.fillStyle = '#00ffff';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.fillText('Reference (0-2π)', 5, 15);
  }

  /**
   * Draw search buffer waveform in row 2
   * @param searchBuffer Search buffer data
   * @param row2YOffset Y offset where row 2 starts
   * @param row2Height Height of row 2
   */
  private drawSearchBuffer(searchBuffer: Float32Array, row2YOffset: number, row2Height: number): void {
    if (searchBuffer.length === 0) {
      return;
    }
    
    // Draw search buffer waveform in green
    this.drawWaveformSegment(searchBuffer, 0, this.canvas.width, '#00ff00', 1, true, row2Height, row2YOffset);

    // Add label
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.fillText('Search Buffer (Full Frame)', 5, row2YOffset + 15);
  }

  /**
   * Draw candidate waveforms in separate segments of row 1
   * @param candidates Array of candidate indices in searchBuffer
   * @param searchBuffer Full search buffer data
   * @param referenceData Reference waveform for cycle length estimation
   * @param segmentWidth Width of one segment in row 1
   * @param row1Height Height of row 1
   * @param similarityScores Similarity scores for each candidate
   */
  private drawCandidateSegments(
    candidates: number[],
    searchBuffer: Float32Array,
    referenceData: Float32Array,
    segmentWidth: number,
    row1Height: number,
    similarityScores: number[]
  ): void {
    if (candidates.length === 0 || searchBuffer.length === 0) {
      return;
    }

    // Limit to first 4 candidates
    const displayCandidates = candidates.slice(0, this.MAX_CANDIDATES_TO_DISPLAY);

    // Estimate cycle length from reference data
    const cycleLength = referenceData.length;

    // Draw each candidate waveform
    displayCandidates.forEach((candidateIndex, i) => {
      // Validate candidate index
      if (candidateIndex < 0 || candidateIndex >= searchBuffer.length) {
        return;
      }

      // Extract waveform segment centered on candidate with same length as reference
      const segmentStart = Math.max(0, candidateIndex - Math.floor(cycleLength * this.CANDIDATE_SEGMENT_PADDING_RATIO));
      const segmentEnd = Math.min(searchBuffer.length, segmentStart + cycleLength);
      const segmentData = searchBuffer.slice(segmentStart, segmentEnd);

      // Calculate X position (segment 1-4, segment 0 is for reference)
      const sectionStartX = (i + 1) * segmentWidth;
      const color = this.CANDIDATE_COLORS[i % this.CANDIDATE_COLORS.length];
      
      this.drawWaveformSegment(segmentData, sectionStartX, segmentWidth, color, 1.5, true, row1Height, 0);

      // Draw separator line between candidates
      if (i < displayCandidates.length - 1) {
        this.ctx.strokeStyle = '#444444';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        const separatorX = sectionStartX + segmentWidth;
        this.ctx.moveTo(separatorX, 0);
        this.ctx.lineTo(separatorX, row1Height);
        this.ctx.stroke();
      }

      // Draw label with candidate number
      this.ctx.fillStyle = color;
      this.ctx.font = 'bold 10px Arial';
      this.ctx.fillText(`Candidate #${i}`, sectionStartX + 5, 15);

      // Draw similarity score if available
      if (i < similarityScores.length) {
        const similarity = similarityScores[i];
        const similarityText = `Match: ${(similarity * 100).toFixed(1)}%`;
        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 10px Arial';
        this.ctx.fillText(similarityText, sectionStartX + 5, 30);
      }
    });
  }

  /**
   * Draw vertical lines for all candidates on the search buffer in row 2
   * @param candidates Array of candidate indices
   * @param searchBuffer Search buffer data
   * @param row2YOffset Y offset where row 2 starts
   * @param row2Height Height of row 2
   */
  private drawCandidateLines(candidates: number[], searchBuffer: Float32Array, row2YOffset: number, row2Height: number): void {
    if (candidates.length === 0 || searchBuffer.length === 0) {
      return;
    }

    const sliceWidth = this.canvas.width / searchBuffer.length;

    // Draw vertical lines for each candidate
    candidates.forEach((candidateIndex, i) => {
      // Validate candidate index is within bounds
      if (candidateIndex < 0 || candidateIndex >= searchBuffer.length) {
        return;
      }
      
      const x = candidateIndex * sliceWidth;

      // Alternate colors for visibility
      this.ctx.strokeStyle = this.CANDIDATE_COLORS[i % this.CANDIDATE_COLORS.length];
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x, row2YOffset);
      this.ctx.lineTo(x, row2YOffset + row2Height);
      this.ctx.stroke();

      // Draw candidate number label (limit to prevent overlap)
      if (i < this.MAX_VISIBLE_LABELS) {
        this.ctx.fillStyle = this.ctx.strokeStyle;
        this.ctx.font = 'bold 10px Arial';
        this.ctx.fillText(`#${i}`, x + 2, row2YOffset + 15 + (i * 12));
      }
    });

    // Add legend
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.fillText(`Candidates: ${candidates.length}`, 5, row2YOffset + row2Height - 5);
  }

  /**
   * Render debug visualization with 2-row layout
   * @param searchBuffer Full search buffer (current frame's waveform data)
   * @param candidates All zero-cross/peak candidates found
   * @param referenceData Previous frame's 0-2π reference waveform
   * @param similarityScores Similarity scores for each candidate
   */
  renderDebug(
    searchBuffer: Float32Array | null,
    candidates: number[],
    referenceData: Float32Array | null,
    similarityScores: number[]
  ): void {
    if (!this.debugDisplayEnabled) {
      return;
    }

    // Clear and prepare canvas
    this.clearAndDrawGrid();

    // Calculate layout dimensions
    const row1Height = Math.floor(this.canvas.height * this.ROW1_HEIGHT_RATIO);
    const row2YOffset = row1Height;
    const row2Height = this.canvas.height - row1Height;
    const segmentWidth = this.canvas.width / this.ROW_SEGMENTS;

    // Row 1: Draw reference waveform and candidate segments
    if (referenceData && referenceData.length > 0) {
      this.drawReferenceWaveform(referenceData, segmentWidth, row1Height);

      // Draw candidate segments if available
      if (searchBuffer && searchBuffer.length > 0 && candidates.length > 0) {
        this.drawCandidateSegments(candidates, searchBuffer, referenceData, segmentWidth, row1Height, similarityScores);
      }
    }

    // Row 2: Draw search buffer waveform
    if (searchBuffer && searchBuffer.length > 0) {
      this.drawSearchBuffer(searchBuffer, row2YOffset, row2Height);
      
      // Draw candidate lines on search buffer
      this.drawCandidateLines(candidates, searchBuffer, row2YOffset, row2Height);
    }
  }
}
