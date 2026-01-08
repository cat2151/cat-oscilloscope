/**
 * PianoKeyboardRenderer handles rendering of piano keyboard visualization
 * Displays a piano keyboard for the frequency range 50Hz - 1000Hz
 * Highlights the key corresponding to the fundamental frequency
 */
export class PianoKeyboardRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  // 周波数範囲 (50Hz～1000Hz)
  private readonly MIN_FREQ = 50;
  private readonly MAX_FREQ = 1000;
  
  // ピアノ鍵盤の定数
  private readonly WHITE_KEY_WIDTH = 20;
  private readonly WHITE_KEY_HEIGHT = 80;
  private readonly BLACK_KEY_WIDTH = 12;
  private readonly BLACK_KEY_HEIGHT = 50;
  
  // 色定義
  private readonly WHITE_KEY_COLOR = '#ffffff';
  private readonly BLACK_KEY_COLOR = '#000000';
  private readonly WHITE_KEY_HIGHLIGHT = '#00ff00';
  private readonly BLACK_KEY_HIGHLIGHT = '#00cc00';
  private readonly KEY_BORDER = '#333333';
  
  // 1オクターブ内の音名パターン（白鍵と黒鍵の配置）
  // C, C#, D, D#, E, F, F#, G, G#, A, A#, B
  // 白鍵: C, D, E, F, G, A, B (7つ)
  // 黒鍵: C#, D#, F#, G#, A# (5つ、EとBの後ろにはない)
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context for piano keyboard');
    }
    this.ctx = context;
  }
  
  /**
   * 周波数から音名とオクターブを計算
   * A4 (440Hz) を基準とする
   */
  private frequencyToNote(frequency: number): { note: number; octave: number; noteInOctave: number } {
    if (frequency <= 0 || !isFinite(frequency)) {
      return { note: -1, octave: -1, noteInOctave: -1 };
    }
    
    const A4 = 440;
    const C0 = A4 * Math.pow(2, -4.75);
    
    // C0からの半音数
    const halfSteps = 12 * Math.log2(frequency / C0);
    const noteIndex = Math.round(halfSteps);
    
    const octave = Math.floor(noteIndex / 12);
    const noteInOctave = ((noteIndex % 12) + 12) % 12; // 0-11: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
    
    return { note: noteIndex, octave, noteInOctave };
  }
  
  /**
   * 表示する鍵盤の範囲を決定
   * MIN_FREQからMAX_FREQまでの範囲をカバーする
   */
  private getKeyboardRange(): { startNote: number; endNote: number; startOctave: number; endOctave: number } {
    const startNoteInfo = this.frequencyToNote(this.MIN_FREQ);
    const endNoteInfo = this.frequencyToNote(this.MAX_FREQ);
    
    return {
      startNote: startNoteInfo.note,
      endNote: endNoteInfo.note,
      startOctave: startNoteInfo.octave,
      endOctave: endNoteInfo.octave
    };
  }
  
  /**
   * ピアノ鍵盤を描画
   * @param highlightFrequency - ハイライトする周波数 (0の場合はハイライトなし)
   */
  render(highlightFrequency: number): void {
    // キャンバスをクリア
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    const range = this.getKeyboardRange();
    
    // ハイライトする音名を計算
    const highlightNoteInfo = highlightFrequency > 0 ? this.frequencyToNote(highlightFrequency) : null;
    
    // 白鍵を描画
    let whiteKeyIndex = 0;
    for (let note = range.startNote; note <= range.endNote; note++) {
      const noteInOctave = ((note % 12) + 12) % 12;
      
      // 白鍵の場合
      if ([0, 2, 4, 5, 7, 9, 11].includes(noteInOctave)) {
        const x = whiteKeyIndex * this.WHITE_KEY_WIDTH;
        const isHighlighted = highlightNoteInfo && highlightNoteInfo.note === note;
        
        this.ctx.fillStyle = isHighlighted ? this.WHITE_KEY_HIGHLIGHT : this.WHITE_KEY_COLOR;
        this.ctx.fillRect(x, 0, this.WHITE_KEY_WIDTH, this.WHITE_KEY_HEIGHT);
        
        this.ctx.strokeStyle = this.KEY_BORDER;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, 0, this.WHITE_KEY_WIDTH, this.WHITE_KEY_HEIGHT);
        
        whiteKeyIndex++;
      }
    }
    
    // 黒鍵を描画（白鍵の上に重ねて描画）
    whiteKeyIndex = 0;
    for (let note = range.startNote; note <= range.endNote; note++) {
      const noteInOctave = ((note % 12) + 12) % 12;
      
      // 白鍵の位置をカウント
      if ([0, 2, 4, 5, 7, 9, 11].includes(noteInOctave)) {
        whiteKeyIndex++;
      }
      
      // 黒鍵の場合
      if ([1, 3, 6, 8, 10].includes(noteInOctave)) {
        // 黒鍵は直前の白鍵の右端に配置
        const x = whiteKeyIndex * this.WHITE_KEY_WIDTH - this.BLACK_KEY_WIDTH / 2;
        const isHighlighted = highlightNoteInfo && highlightNoteInfo.note === note;
        
        this.ctx.fillStyle = isHighlighted ? this.BLACK_KEY_HIGHLIGHT : this.BLACK_KEY_COLOR;
        this.ctx.fillRect(x, 0, this.BLACK_KEY_WIDTH, this.BLACK_KEY_HEIGHT);
        
        this.ctx.strokeStyle = this.KEY_BORDER;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, 0, this.BLACK_KEY_WIDTH, this.BLACK_KEY_HEIGHT);
      }
    }
    
    // 周波数範囲を表示
    this.ctx.fillStyle = '#888888';
    this.ctx.font = '10px monospace';
    this.ctx.fillText(`${this.MIN_FREQ}Hz`, 5, this.WHITE_KEY_HEIGHT - 5);
    this.ctx.fillText(`${this.MAX_FREQ}Hz`, this.canvas.width - 50, this.WHITE_KEY_HEIGHT - 5);
  }
  
  /**
   * キャンバスをクリア
   */
  clear(): void {
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
