import { frequencyToNote } from './utils';

/**
 * PianoKeyboardRenderer handles rendering of piano keyboard visualization
 * Displays a piano keyboard for the frequency range 50Hz - 2000Hz
 * Highlights the key corresponding to the fundamental frequency
 */
export class PianoKeyboardRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  // 周波数範囲 (50Hz～2000Hz)
  private readonly MIN_FREQ = 50;
  private readonly MAX_FREQ = 2000;
  
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
  
  // 音名パターン定数（配列アロケーションを避けるため）
  // 白鍵: C(0), D(2), E(4), F(5), G(7), A(9), B(11)
  private readonly WHITE_KEY_NOTES = [0, 2, 4, 5, 7, 9, 11];
  // 黒鍵: C#(1), D#(3), F#(6), G#(8), A#(10)
  private readonly BLACK_KEY_NOTES = [1, 3, 6, 8, 10];
  
  // キャッシュされた鍵盤範囲（コンストラクタで一度だけ計算）
  private readonly keyboardRange: { startNote: number; endNote: number };
  
  // センタリング用のオフセット（コンストラクタで一度だけ計算）
  private readonly xOffset: number;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context for piano keyboard');
    }
    this.ctx = context;
    
    // 鍵盤範囲を一度だけ計算してキャッシュ
    this.keyboardRange = this.calculateKeyboardRange();
    
    // センタリング用のオフセットを計算
    this.xOffset = this.calculateCenteringOffset();
  }
  
  /**
   * 周波数から音名情報を取得
   * utils.tsのfrequencyToNote関数を使用し、内部形式に変換
   */
  private frequencyToNoteInfo(frequency: number): { note: number; octave: number; noteInOctave: number } {
    const noteInfo = frequencyToNote(frequency);
    
    if (!noteInfo) {
      return { note: -1, octave: -1, noteInOctave: -1 };
    }
    
    // noteName (e.g., "A4", "C#3") から音名とオクターブを抽出
    const matches = noteInfo.noteName.match(/^([A-G]#?)(\d+)$/);
    if (!matches) {
      return { note: -1, octave: -1, noteInOctave: -1 };
    }
    
    const noteName = matches[1];
    const octave = parseInt(matches[2], 10);
    
    // 音名から noteInOctave (0-11) を計算
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteInOctave = noteNames.indexOf(noteName);
    
    // noteIndex を計算 (C0 = 0)
    const note = octave * 12 + noteInOctave;
    
    return { note, octave, noteInOctave };
  }
  
  /**
   * 表示する鍵盤の範囲を計算
   * MIN_FREQからMAX_FREQまでの範囲をカバーする
   */
  private calculateKeyboardRange(): { startNote: number; endNote: number } {
    const startNoteInfo = this.frequencyToNoteInfo(this.MIN_FREQ);
    const endNoteInfo = this.frequencyToNoteInfo(this.MAX_FREQ);
    
    return {
      startNote: startNoteInfo.note,
      endNote: endNoteInfo.note
    };
  }
  
  /**
   * 鍵盤をセンタリングするためのX座標オフセットを計算
   */
  private calculateCenteringOffset(): number {
    const range = this.keyboardRange;
    
    // 白鍵の数をカウント
    let whiteKeyCount = 0;
    for (let note = range.startNote; note <= range.endNote; note++) {
      const noteInOctave = ((note % 12) + 12) % 12;
      if (this.WHITE_KEY_NOTES.includes(noteInOctave)) {
        whiteKeyCount++;
      }
    }
    
    // 鍵盤全体の幅
    const totalKeyboardWidth = whiteKeyCount * this.WHITE_KEY_WIDTH;
    
    // センタリング用のオフセット
    return (this.canvas.width - totalKeyboardWidth) / 2;
  }
  
  /**
   * ピアノ鍵盤を描画
   * @param highlightFrequency - ハイライトする周波数 (0の場合はハイライトなし)
   */
  render(highlightFrequency: number): void {
    // キャンバスをクリア
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    const range = this.keyboardRange;
    
    // ハイライトする音名を計算
    const highlightNoteInfo = highlightFrequency > 0 ? this.frequencyToNoteInfo(highlightFrequency) : null;
    
    // 白鍵を描画
    let whiteKeyIndex = 0;
    for (let note = range.startNote; note <= range.endNote; note++) {
      const noteInOctave = ((note % 12) + 12) % 12;
      
      // 白鍵の場合
      if (this.WHITE_KEY_NOTES.includes(noteInOctave)) {
        const x = this.xOffset + whiteKeyIndex * this.WHITE_KEY_WIDTH;
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
      if (this.WHITE_KEY_NOTES.includes(noteInOctave)) {
        whiteKeyIndex++;
      }
      
      // 黒鍵の場合
      if (this.BLACK_KEY_NOTES.includes(noteInOctave)) {
        // 黒鍵は直前の白鍵の右端に配置
        const x = this.xOffset + whiteKeyIndex * this.WHITE_KEY_WIDTH - this.BLACK_KEY_WIDTH / 2;
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
    this.ctx.fillText(`${this.MIN_FREQ}Hz`, this.xOffset + 5, this.WHITE_KEY_HEIGHT - 5);
    
    // 右端の周波数表示の位置を計算
    const text = `${this.MAX_FREQ}Hz`;
    const textWidth = this.ctx.measureText(text).width;
    // 白鍵の数を計算（再利用のため）
    let totalWhiteKeys = 0;
    for (let note = range.startNote; note <= range.endNote; note++) {
      const noteInOctave = ((note % 12) + 12) % 12;
      if (this.WHITE_KEY_NOTES.includes(noteInOctave)) {
        totalWhiteKeys++;
      }
    }
    const rightEdge = this.xOffset + totalWhiteKeys * this.WHITE_KEY_WIDTH;
    this.ctx.fillText(text, rightEdge - textWidth - 5, this.WHITE_KEY_HEIGHT - 5);
  }
  
  /**
   * キャンバスをクリア
   */
  clear(): void {
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
