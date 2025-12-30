class Oscilloscope {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Float32Array | null = null;
  private animationId: number | null = null;
  private isRunning = false;
  private mediaStream: MediaStream | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context');
    }
    this.ctx = context;
  }

  async start(): Promise<void> {
    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Set up Web Audio API
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // Create analyser node with high resolution
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 4096; // Higher resolution for better waveform
      this.analyser.smoothingTimeConstant = 0; // No smoothing for accurate waveform
      
      // Connect nodes
      source.connect(this.analyser);
      
      // Create data array for time domain data
      const bufferLength = this.analyser.fftSize;
      this.dataArray = new Float32Array(bufferLength);
      
      this.isRunning = true;
      this.render();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      try {
        await this.audioContext.close();
      } catch (error) {
        console.error('Error closing AudioContext:', error);
      }
      this.audioContext = null;
    }
    this.analyser = null;
    this.dataArray = null;
  }

  /**
   * Find zero-cross point where signal crosses from negative to positive
   */
  private findZeroCross(data: Float32Array, startIndex: number = 0): number {
    for (let i = startIndex; i < data.length - 1; i++) {
      // Look for transition from negative (or zero) to positive
      if (data[i] <= 0 && data[i + 1] > 0) {
        return i;
      }
    }
    return -1; // No zero-cross found
  }

  /**
   * Find the next zero-cross point after the given index
   */
  private findNextZeroCross(data: Float32Array, startIndex: number): number {
    // Start searching from the next sample to find the next cycle
    const searchStart = startIndex + 1;
    if (searchStart >= data.length) {
      return -1;
    }
    return this.findZeroCross(data, searchStart);
  }

  private render(): void {
    if (!this.isRunning || !this.analyser || !this.dataArray) {
      return;
    }

    // Get waveform data
    // @ts-ignore - Web Audio API type definitions issue: Float32Array constructor creates ArrayBufferLike
    // but getFloatTimeDomainData expects ArrayBuffer. This works at runtime.
    this.analyser.getFloatTimeDomainData(this.dataArray);

    // Find the first zero-cross point
    const firstZeroCross = this.findZeroCross(this.dataArray, 0);
    
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    this.drawGrid();

    if (firstZeroCross === -1) {
      // No zero-cross found, draw from beginning
      this.drawWaveform(this.dataArray, 0, this.dataArray.length);
    } else {
      // Find the next zero-cross to determine the range to display
      const secondZeroCross = this.findNextZeroCross(this.dataArray, firstZeroCross);
      
      if (secondZeroCross === -1) {
        // Only one zero-cross found, display from there
        this.drawWaveform(this.dataArray, firstZeroCross, this.dataArray.length);
        // Draw zero-cross line at the first zero-cross point
        this.drawZeroCrossLine(firstZeroCross, firstZeroCross, this.dataArray.length);
      } else {
        // Calculate display range with some padding before and after zero-crosses
        const beforePadding = 20; // samples before first zero-cross
        const afterPadding = 20;  // samples after second zero-cross
        
        const startIndex = Math.max(0, firstZeroCross - beforePadding);
        const endIndex = Math.min(this.dataArray.length, secondZeroCross + afterPadding);
        
        this.drawWaveform(this.dataArray, startIndex, endIndex);
        // Draw zero-cross line at the first zero-cross point
        this.drawZeroCrossLine(firstZeroCross, startIndex, endIndex);
      }
    }

    // Continue rendering
    this.animationId = requestAnimationFrame(() => this.render());
  }

  private drawGrid(): void {
    this.ctx.strokeStyle = '#222222';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();

    // Horizontal lines
    const horizontalLines = 5;
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

  private drawWaveform(data: Float32Array, startIndex: number, endIndex: number): void {
    const dataLength = endIndex - startIndex;
    if (dataLength <= 0) return;

    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    const sliceWidth = this.canvas.width / dataLength;
    const centerY = this.canvas.height / 2;
    const amplitude = this.canvas.height / 2;

    for (let i = 0; i < dataLength; i++) {
      const dataIndex = startIndex + i;
      const value = data[dataIndex];
      const rawY = centerY - (value * amplitude);
      const y = Math.min(this.canvas.height, Math.max(0, rawY));
      const x = i * sliceWidth;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    this.ctx.stroke();
  }

  /**
   * Draw a vertical line at the zero-cross point
   */
  private drawZeroCrossLine(zeroCrossIndex: number, startIndex: number, endIndex: number): void {
    const dataLength = endIndex - startIndex;
    if (dataLength <= 0) return;

    // Check if zero-cross point is within the displayed range
    if (zeroCrossIndex < startIndex || zeroCrossIndex >= endIndex) {
      return;
    }

    // Calculate the x position of the zero-cross point in canvas coordinates
    const relativeIndex = zeroCrossIndex - startIndex;
    const sliceWidth = this.canvas.width / dataLength;
    const x = relativeIndex * sliceWidth;

    // Draw a vertical line in red to mark the zero-cross point
    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x, 0);
    this.ctx.lineTo(x, this.canvas.height);
    this.ctx.stroke();
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }
}

// Main application logic
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const startButton = document.getElementById('startButton') as HTMLButtonElement;
const statusElement = document.getElementById('status') as HTMLSpanElement;

if (!canvas || !startButton || !statusElement) {
  throw new Error('Required DOM elements not found');
}

const oscilloscope = new Oscilloscope(canvas);

startButton.addEventListener('click', async () => {
  if (!oscilloscope.getIsRunning()) {
    try {
      startButton.disabled = true;
      statusElement.textContent = 'Requesting microphone access...';
      
      await oscilloscope.start();
      
      startButton.textContent = 'Stop';
      startButton.disabled = false;
      statusElement.textContent = 'Running - Microphone active';
    } catch (error) {
      console.error('Failed to start oscilloscope:', error);
      statusElement.textContent = 'Error: Could not access microphone';
      startButton.disabled = false;
    }
  } else {
    try {
      await oscilloscope.stop();
      startButton.textContent = 'Start';
      statusElement.textContent = 'Stopped';
    } catch (error) {
      console.error('Failed to stop oscilloscope:', error);
      statusElement.textContent = 'Stopped (with errors)';
      startButton.textContent = 'Start';
    }
  }
});
