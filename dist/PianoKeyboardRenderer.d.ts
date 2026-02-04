/**
 * PianoKeyboardRenderer handles rendering of piano keyboard visualization
 * Displays a piano keyboard for the frequency range 50Hz - 2000Hz
 * Highlights the key corresponding to the fundamental frequency
 */
export declare class PianoKeyboardRenderer {
    private canvas;
    private ctx;
    private readonly MIN_FREQ;
    private readonly MAX_FREQ;
    private readonly WHITE_KEY_WIDTH;
    private readonly WHITE_KEY_HEIGHT;
    private readonly BLACK_KEY_WIDTH;
    private readonly BLACK_KEY_HEIGHT;
    private readonly WHITE_KEY_COLOR;
    private readonly BLACK_KEY_COLOR;
    private readonly WHITE_KEY_HIGHLIGHT;
    private readonly BLACK_KEY_HIGHLIGHT;
    private readonly KEY_BORDER;
    private readonly WHITE_KEY_NOTES;
    private readonly BLACK_KEY_NOTES;
    private readonly keyboardRange;
    private readonly xOffset;
    private readonly whiteKeyCount;
    constructor(canvas: HTMLCanvasElement);
    /**
     * 周波数から音名情報を取得
     * utils.tsのfrequencyToNote関数を使用し、内部形式に変換
     */
    private frequencyToNoteInfo;
    /**
     * 表示する鍵盤の範囲を計算
     * MIN_FREQからMAX_FREQまでの範囲をカバーする
     */
    private calculateKeyboardRange;
    /**
     * 白鍵の数をカウント
     */
    private countWhiteKeys;
    /**
     * 鍵盤をセンタリングするためのX座標オフセットを計算
     */
    private calculateCenteringOffset;
    /**
     * ピアノ鍵盤を描画
     * @param highlightFrequency - ハイライトする周波数 (0の場合はハイライトなし)
     */
    render(highlightFrequency: number): void;
    /**
     * キャンバスをクリア
     */
    clear(): void;
}
//# sourceMappingURL=PianoKeyboardRenderer.d.ts.map