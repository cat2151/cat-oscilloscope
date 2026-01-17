var L = Object.defineProperty;
var k = (f, t, e) => t in f ? L(f, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : f[t] = e;
var n = (f, t, e) => k(f, typeof t != "symbol" ? t + "" : t, e);
function O(f) {
  return Math.pow(10, f / 20);
}
function G(f) {
  return f <= 0 ? -1 / 0 : 20 * Math.log10(f);
}
function P(f) {
  if (f <= 0 || !isFinite(f))
    return null;
  const e = 440 * Math.pow(2, -4.75), i = 12 * Math.log2(f / e), r = Math.round(i), a = Math.round((i - r) * 100), o = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"], s = Math.floor(r / 12);
  return {
    noteName: `${o[(r % 12 + 12) % 12]}${s}`,
    cents: a
  };
}
const N = -48;
function D(f) {
  const t = f.numberOfChannels, e = f.sampleRate, i = f.length, r = [];
  let a = 0;
  for (let c = 0; c < t; c++) {
    const d = f.getChannelData(c);
    r.push(d);
    for (let l = 0; l < i; l++) {
      const m = Math.abs(d[l]);
      m > a && (a = m);
    }
  }
  if (a === 0)
    return f;
  const o = a * Math.pow(10, N / 20);
  let s = i;
  for (let c = 0; c < i; c++) {
    let d = !0;
    for (let l = 0; l < t; l++)
      if (Math.abs(r[l][c]) > o) {
        d = !1;
        break;
      }
    if (!d) {
      s = c;
      break;
    }
  }
  if (s >= i)
    return f;
  let h = i - 1;
  for (let c = i - 1; c >= s; c--) {
    let d = !0;
    for (let l = 0; l < t; l++)
      if (Math.abs(r[l][c]) > o) {
        d = !1;
        break;
      }
    if (!d) {
      h = c;
      break;
    }
  }
  if (s === 0 && h === i - 1)
    return f;
  const y = h - s + 1, u = new AudioBuffer({
    numberOfChannels: t,
    length: y,
    sampleRate: e
  });
  for (let c = 0; c < t; c++) {
    const d = r[c], l = u.getChannelData(c);
    for (let m = 0; m < y; m++)
      l[m] = d[s + m];
  }
  return u;
}
class z {
  constructor() {
    n(this, "audioContext", null);
    n(this, "analyser", null);
    n(this, "mediaStream", null);
    n(this, "audioBufferSource", null);
    n(this, "bufferSource", null);
    n(this, "dataArray", null);
    n(this, "frequencyData", null);
    n(this, "frameBufferHistory", []);
    // History of frame buffers for extended FFT
    n(this, "MAX_FRAME_HISTORY", 16);
  }
  // Support up to 16x buffer size
  /**
   * Initialize analyser node and data arrays
   */
  initializeAnalyser() {
    if (!this.audioContext)
      throw new Error("AudioContext must be initialized before creating analyser");
    this.analyser = this.audioContext.createAnalyser(), this.analyser.fftSize = 4096, this.analyser.smoothingTimeConstant = 0;
    const t = this.analyser.fftSize;
    this.dataArray = new Float32Array(t), this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
  }
  /**
   * Start audio capture and analysis
   */
  async start() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: !0 }), this.audioContext = new AudioContext();
      const t = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.initializeAnalyser(), t.connect(this.analyser);
    } catch (t) {
      throw console.error("Error accessing microphone:", t), t;
    }
  }
  /**
   * Start audio playback from file
   */
  async startFromFile(t) {
    try {
      const e = await t.arrayBuffer();
      this.audioContext && this.audioContext.state !== "closed" && await this.audioContext.close(), this.audioContext = new AudioContext();
      let i = await this.audioContext.decodeAudioData(e);
      i = D(i), this.initializeAnalyser(), this.audioBufferSource = this.audioContext.createBufferSource(), this.audioBufferSource.buffer = i, this.audioBufferSource.loop = !0, this.audioBufferSource.connect(this.analyser), this.analyser.connect(this.audioContext.destination), this.audioBufferSource.start(0);
    } catch (e) {
      throw console.error("Error loading audio file:", e), e;
    }
  }
  /**
   * Start visualization from a static buffer without audio playback
   * Useful for visualizing pre-recorded audio data or processing results
   * @param bufferSource - BufferSource instance containing audio data
   */
  async startFromBuffer(t) {
    try {
      this.audioContext && this.audioContext.state !== "closed" && await this.audioContext.close(), this.audioContext = null, this.bufferSource = t, this.bufferSource.setChunkSize(4096), this.dataArray = new Float32Array(4096), this.frequencyData = new Uint8Array(2048);
    } catch (e) {
      throw console.error("Error starting from buffer:", e), e;
    }
  }
  /**
   * Stop audio capture and clean up resources
   */
  async stop() {
    if (this.audioBufferSource) {
      try {
        this.audioBufferSource.stop();
      } catch {
      }
      try {
        this.audioBufferSource.disconnect();
      } catch {
      }
      this.audioBufferSource = null;
    }
    if (this.mediaStream && (this.mediaStream.getTracks().forEach((t) => t.stop()), this.mediaStream = null), this.bufferSource && (this.bufferSource.reset(), this.bufferSource = null), this.audioContext) {
      try {
        await this.audioContext.close();
      } catch (t) {
        console.error("Error closing AudioContext:", t);
      }
      this.audioContext = null;
    }
    this.analyser = null, this.dataArray = null, this.frequencyData = null, this.clearFrameBufferHistory();
  }
  /**
   * Get time-domain data (waveform)
   * Also updates the frame buffer history for extended FFT
   */
  getTimeDomainData() {
    if (this.bufferSource && this.dataArray) {
      const t = this.bufferSource.getNextChunk();
      return t ? (this.dataArray.set(t), this.updateFrameBufferHistory(this.dataArray), this.dataArray) : null;
    }
    return !this.analyser || !this.dataArray ? null : (this.analyser.getFloatTimeDomainData(this.dataArray), this.updateFrameBufferHistory(this.dataArray), this.dataArray);
  }
  /**
   * Update frame buffer history with the current frame
   * Reuses existing buffers to avoid allocating a new Float32Array every frame
   */
  updateFrameBufferHistory(t) {
    let e;
    this.frameBufferHistory.length < this.MAX_FRAME_HISTORY ? e = new Float32Array(t.length) : (e = this.frameBufferHistory.shift(), e.length !== t.length && (e = new Float32Array(t.length))), e.set(t), this.frameBufferHistory.push(e);
  }
  /**
   * Get extended time-domain data by concatenating past frame buffers
   * @param multiplier - Buffer size multiplier (1, 4, or 16)
   * @returns Combined buffer or null if insufficient history
   */
  getExtendedTimeDomainData(t) {
    if (t === 1)
      return this.dataArray;
    if (!this.dataArray || this.frameBufferHistory.length < t)
      return null;
    const e = this.frameBufferHistory.slice(-t), i = e.reduce((o, s) => o + s.length, 0), r = new Float32Array(i);
    let a = 0;
    for (const o of e)
      r.set(o, a), a += o.length;
    return r;
  }
  /**
   * Clear frame buffer history
   */
  clearFrameBufferHistory() {
    this.frameBufferHistory = [];
  }
  /**
   * Get frequency-domain data (FFT)
   * In buffer mode, FFT is computed from time-domain data
   */
  getFrequencyData() {
    return this.bufferSource && this.dataArray && this.frequencyData || !this.analyser || !this.frequencyData ? null : (this.analyser.getByteFrequencyData(this.frequencyData), this.frequencyData);
  }
  /**
   * Get sample rate
   */
  getSampleRate() {
    var t;
    return this.bufferSource ? this.bufferSource.getSampleRate() : ((t = this.audioContext) == null ? void 0 : t.sampleRate) || 0;
  }
  /**
   * Get FFT size
   */
  getFFTSize() {
    var t;
    return this.bufferSource ? 4096 : ((t = this.analyser) == null ? void 0 : t.fftSize) || 0;
  }
  /**
   * Get frequency bin count
   */
  getFrequencyBinCount() {
    var t;
    return this.bufferSource ? 2048 : ((t = this.analyser) == null ? void 0 : t.frequencyBinCount) || 0;
  }
  /**
   * Check if audio system is ready
   */
  isReady() {
    return this.bufferSource ? this.dataArray !== null : this.audioContext !== null && this.analyser !== null;
  }
}
class q {
  constructor() {
    n(this, "autoGainEnabled", !0);
    n(this, "currentGain", 1);
    n(this, "noiseGateEnabled", !0);
    n(this, "noiseGateThreshold", O(-60));
  }
  // Default threshold (-60dB)
  setAutoGain(t) {
    this.autoGainEnabled = t;
  }
  getAutoGainEnabled() {
    return this.autoGainEnabled;
  }
  setNoiseGate(t) {
    this.noiseGateEnabled = t;
  }
  getNoiseGateEnabled() {
    return this.noiseGateEnabled;
  }
  setNoiseGateThreshold(t) {
    this.noiseGateThreshold = Math.min(Math.max(t, 0), 1);
  }
  getNoiseGateThreshold() {
    return this.noiseGateThreshold;
  }
  getCurrentGain() {
    return this.currentGain;
  }
}
class B {
  constructor() {
    n(this, "frequencyEstimationMethod", "fft");
    n(this, "estimatedFrequency", 0);
    n(this, "MIN_FREQUENCY_HZ", 20);
    // Minimum detectable frequency (Hz)
    n(this, "MAX_FREQUENCY_HZ", 5e3);
    // Maximum detectable frequency (Hz)
    n(this, "bufferSizeMultiplier", 16);
    // Buffer size multiplier for extended FFT
    n(this, "frequencyPlotHistory", []);
  }
  // プロット用の推定周波数の履歴
  /**
   * Clear frequency history (e.g., when stopping)
   */
  clearHistory() {
    this.frequencyPlotHistory = [], this.estimatedFrequency = 0;
  }
  // Getters and setters
  setFrequencyEstimationMethod(t) {
    this.frequencyEstimationMethod !== t && (this.frequencyEstimationMethod = t, this.frequencyPlotHistory = []);
  }
  getFrequencyEstimationMethod() {
    return this.frequencyEstimationMethod;
  }
  setBufferSizeMultiplier(t) {
    this.bufferSizeMultiplier = t;
  }
  getBufferSizeMultiplier() {
    return this.bufferSizeMultiplier;
  }
  getEstimatedFrequency() {
    return this.estimatedFrequency;
  }
  getMinFrequency() {
    return this.MIN_FREQUENCY_HZ;
  }
  getMaxFrequency() {
    return this.MAX_FREQUENCY_HZ;
  }
  getFrequencyPlotHistory() {
    return this.frequencyPlotHistory;
  }
}
function A(f, t) {
  if (typeof f == "string" && f.endsWith("%")) {
    const e = parseFloat(f);
    return isNaN(e) ? (console.warn(`Invalid percentage value: ${f}, using 0`), 0) : e < 0 ? (console.warn(`Negative percentage value: ${f}, clamping to 0`), 0) : Math.floor(t * (e / 100));
  }
  if (typeof f == "string") {
    const e = parseInt(f, 10);
    return isNaN(e) ? (console.warn(`Invalid numeric string: ${f}, using 0`), 0) : Math.max(0, e);
  }
  return typeof f == "number" ? isNaN(f) ? (console.warn(`Invalid number value: ${f}, using 0`), 0) : Math.max(0, Math.floor(f)) : 0;
}
const K = {
  fftOverlay: {
    position: { x: 10, y: "65%" },
    size: { width: "35%", height: "35%" }
  },
  harmonicAnalysis: {
    position: { x: 10, y: 10 },
    size: { width: 500, height: "auto" }
  },
  frequencyPlot: {
    position: { x: "right-10", y: 10 },
    size: { width: 280, height: 120 }
  }
};
class Y {
  // 周波数範囲のパディング比率 (10%)
  constructor(t, e) {
    n(this, "canvas");
    n(this, "ctx");
    n(this, "fftDisplayEnabled", !0);
    n(this, "debugOverlaysEnabled", !0);
    // Control debug overlays (harmonic analysis, frequency plot)
    n(this, "overlaysLayout");
    // Layout configuration for overlays
    n(this, "FFT_OVERLAY_HEIGHT_RATIO", 0.9);
    // Spectrum bar height ratio within overlay (90%)
    n(this, "FFT_MIN_BAR_WIDTH", 1);
    // Minimum bar width in pixels
    n(this, "FREQ_PLOT_MIN_RANGE_PADDING_HZ", 50);
    // 周波数範囲の最小パディング (Hz)
    n(this, "FREQ_PLOT_RANGE_PADDING_RATIO", 0.1);
    this.canvas = t;
    const i = t.getContext("2d");
    if (!i)
      throw new Error("Could not get 2D context");
    this.ctx = i, this.overlaysLayout = e || K;
  }
  /**
   * Clear canvas and draw grid with measurement labels
   * @param sampleRate - Audio sample rate in Hz (optional)
   * @param displaySamples - Number of samples displayed on screen (optional)
   * @param gain - Current gain multiplier (optional)
   */
  clearAndDrawGrid(t, e, i) {
    this.ctx.fillStyle = "#000000", this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height), this.drawGrid(t, e, i);
  }
  /**
   * Draw grid lines with measurement labels
   * @param sampleRate - Audio sample rate in Hz (optional)
   * @param displaySamples - Number of samples displayed on screen (optional)
   * @param gain - Current gain multiplier (optional)
   */
  drawGrid(t, e, i) {
    this.ctx.strokeStyle = "#222222", this.ctx.lineWidth = 1, this.ctx.beginPath();
    const r = 5;
    for (let o = 0; o <= r; o++) {
      const s = this.canvas.height / r * o;
      this.ctx.moveTo(0, s), this.ctx.lineTo(this.canvas.width, s);
    }
    const a = 10;
    for (let o = 0; o <= a; o++) {
      const s = this.canvas.width / a * o;
      this.ctx.moveTo(s, 0), this.ctx.lineTo(s, this.canvas.height);
    }
    this.ctx.stroke(), this.ctx.strokeStyle = "#444444", this.ctx.lineWidth = 1, this.ctx.beginPath(), this.ctx.moveTo(0, this.canvas.height / 2), this.ctx.lineTo(this.canvas.width, this.canvas.height / 2), this.ctx.stroke(), t && t > 0 && e && e > 0 && i !== void 0 && i > 0 && this.drawGridLabels(t, e, i);
  }
  /**
   * Draw grid measurement labels
   * @param sampleRate - Audio sample rate in Hz
   * @param displaySamples - Number of samples displayed on screen
   * @param gain - Current gain multiplier
   */
  drawGridLabels(t, e, i) {
    this.ctx.save(), this.ctx.font = "11px monospace", this.ctx.fillStyle = "#666666";
    const r = e / t * 1e3, a = 10, o = r / a;
    for (let u = 0; u <= a; u++) {
      const c = this.canvas.width / a * u, d = o * u;
      let l;
      d >= 1e3 ? l = `${(d / 1e3).toFixed(2)}s` : d >= 1 ? l = `${d.toFixed(1)}ms` : l = `${(d * 1e3).toFixed(0)}μs`;
      const m = this.ctx.measureText(l).width, g = Math.max(2, Math.min(c - m / 2, this.canvas.width - m - 2));
      this.ctx.fillText(l, g, this.canvas.height - 3);
    }
    const s = 5, y = 1 / (s / 2 * i);
    for (let u = 0; u <= s; u++) {
      const c = this.canvas.height / s * u, l = (s / 2 - u) * y;
      let m;
      if (l === 0)
        m = "0dB*";
      else {
        const g = G(Math.abs(l)), E = l > 0 ? "+" : "-", w = Math.abs(g);
        w >= 100 ? m = `${E}${w.toFixed(0)}dB` : m = `${E}${w.toFixed(1)}dB`;
      }
      this.ctx.fillText(m, 3, c + 10);
    }
    this.ctx.restore();
  }
  /**
   * Draw waveform
   */
  drawWaveform(t, e, i, r) {
    const a = i - e;
    if (a <= 0) return;
    this.ctx.strokeStyle = "#00ff00", this.ctx.lineWidth = 2, this.ctx.beginPath();
    const o = this.canvas.width / a, s = this.canvas.height / 2, y = this.canvas.height / 2 * r;
    for (let u = 0; u < a; u++) {
      const c = e + u, d = t[c], l = s - d * y, m = Math.min(this.canvas.height, Math.max(0, l)), g = u * o;
      u === 0 ? this.ctx.moveTo(g, m) : this.ctx.lineTo(g, m);
    }
    this.ctx.stroke();
  }
  /**
   * Draw FFT spectrum overlay (position and size configurable via overlaysLayout)
   */
  drawFFTOverlay(t, e, i, r, a) {
    if (!this.fftDisplayEnabled)
      return;
    const o = i / r, s = Math.floor(this.canvas.width * 0.35), h = Math.floor(this.canvas.height * 0.35), y = 10, u = this.canvas.height - h - 10, { x: c, y: d, width: l, height: m } = this.calculateOverlayDimensions(
      this.overlaysLayout.fftOverlay,
      y,
      u,
      s,
      h
    );
    this.ctx.save(), this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)", this.ctx.fillRect(c, d, l, m), this.ctx.strokeStyle = "#00aaff", this.ctx.lineWidth = 2, this.ctx.strokeRect(c, d, l, m);
    const g = Math.min(
      t.length,
      Math.ceil(a / o)
    ), E = l / g;
    this.ctx.fillStyle = "#00aaff";
    for (let w = 0; w < g; w++) {
      const T = t[w] / 255 * m * this.FFT_OVERLAY_HEIGHT_RATIO, C = c + w * E, b = d + m - T;
      this.ctx.fillRect(C, b, Math.max(E - 1, this.FFT_MIN_BAR_WIDTH), T);
    }
    if (e > 0 && e <= a) {
      const w = e / o, v = c + w * E;
      this.ctx.strokeStyle = "#ff00ff", this.ctx.lineWidth = 2, this.ctx.beginPath(), this.ctx.moveTo(v, d), this.ctx.lineTo(v, d + m), this.ctx.stroke(), this.ctx.fillStyle = "#ff00ff", this.ctx.font = "bold 12px Arial";
      const T = `${e.toFixed(1)} Hz`, C = this.ctx.measureText(T).width;
      let b = v + 3;
      b + C > c + l - 5 && (b = v - C - 3), this.ctx.fillText(T, b, d + 15);
    }
    this.ctx.restore();
  }
  /**
   * Draw harmonic analysis information overlay
   * Displays debugging information about frequency estimation when FFT method is used
   * Position and size configurable via overlaysLayout
   */
  drawHarmonicAnalysis(t, e, i, r, a, o, s) {
    if (!this.debugOverlaysEnabled || !this.fftDisplayEnabled || t === void 0 && !e && !i && !o)
      return;
    const h = 16, u = (1 + // Title
    (t !== void 0 ? 1 : 0) + (e ? 1 : 0) + (i ? 1 : 0) + (o ? 2 : 0)) * h + 10, { x: c, y: d, width: l, height: m } = this.calculateOverlayDimensions(
      this.overlaysLayout.harmonicAnalysis,
      10,
      10,
      500,
      u
    );
    let g = d;
    if (this.ctx.save(), this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)", this.ctx.fillRect(c, d, l, m), this.ctx.strokeStyle = "#ffaa00", this.ctx.lineWidth = 2, this.ctx.strokeRect(c, d, l, m), this.ctx.fillStyle = "#ffaa00", this.ctx.font = "bold 12px monospace", g += 15, this.ctx.fillText("倍音分析 (Harmonic Analysis)", c + 5, g), t !== void 0 && s) {
      g += h, this.ctx.fillStyle = "#00ff00", this.ctx.font = "11px monospace";
      const E = s / 2;
      this.ctx.fillText(
        `1/2周波数 (${E.toFixed(1)}Hz) のpeak強度: ${t.toFixed(1)}%`,
        c + 5,
        g
      );
    }
    if (e && s) {
      g += h, this.ctx.fillStyle = "#ff00ff", this.ctx.font = "11px monospace";
      const E = e.map((v, T) => `${T + 1}x:${v.toFixed(2)}`).join(" "), w = r !== void 0 ? ` (重み付け: ${r.toFixed(1)})` : "";
      this.ctx.fillText(
        `候補1 (${s.toFixed(1)}Hz) 倍音: ${E}${w}`,
        c + 5,
        g
      );
    }
    if (i && s) {
      g += h, this.ctx.fillStyle = "#00aaff", this.ctx.font = "11px monospace";
      const E = s / 2, w = i.map((T, C) => `${C + 1}x:${T.toFixed(2)}`).join(" "), v = a !== void 0 ? ` (重み付け: ${a.toFixed(1)})` : "";
      this.ctx.fillText(
        `候補2 (${E.toFixed(1)}Hz) 倍音: ${w}${v}`,
        c + 5,
        g
      );
    }
    if (o) {
      g += h, this.ctx.fillStyle = "#aaaaaa", this.ctx.font = "10px monospace";
      const E = l - 10, w = o.split(" ");
      let v = "";
      for (const T of w) {
        const C = v + (v ? " " : "") + T;
        this.ctx.measureText(C).width > E && v ? (this.ctx.fillText(v, c + 5, g), g += h, v = T) : v = C;
      }
      v && this.ctx.fillText(v, c + 5, g);
    }
    this.ctx.restore();
  }
  /**
   * Draw frequency plot overlay
   * Position and size configurable via overlaysLayout
   * Displays frequency history to detect frequency spikes
   * One data point is added per frame
   */
  drawFrequencyPlot(t, e, i) {
    if (!this.debugOverlaysEnabled || !t || t.length === 0)
      return;
    const { x: r, y: a, width: o, height: s } = this.calculateOverlayDimensions(
      this.overlaysLayout.frequencyPlot,
      this.canvas.width - 280 - 10,
      10,
      280,
      120
    );
    this.ctx.save(), this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)", this.ctx.fillRect(r, a, o, s), this.ctx.strokeStyle = "#ffaa00", this.ctx.lineWidth = 2, this.ctx.strokeRect(r, a, o, s), this.ctx.fillStyle = "#ffaa00", this.ctx.font = "bold 12px Arial", this.ctx.fillText(`周波数推移 (${t.length}frame)`, r + 5, a + 15);
    const h = r + 35, y = a + 25, u = o - 45, c = s - 45, d = t.filter((x) => x > 0);
    if (d.length === 0) {
      this.ctx.restore();
      return;
    }
    const l = Math.min(...d), m = Math.max(...d), g = (m - l) * this.FREQ_PLOT_RANGE_PADDING_RATIO || this.FREQ_PLOT_MIN_RANGE_PADDING_HZ, E = Math.max(e, l - g), w = Math.min(i, m + g);
    this.ctx.strokeStyle = "#333333", this.ctx.lineWidth = 1, this.ctx.beginPath();
    for (let x = 0; x <= 4; x++) {
      const p = y + c / 4 * x;
      this.ctx.moveTo(h, p), this.ctx.lineTo(h + u, p);
    }
    for (let x = 0; x <= 4; x++) {
      const p = h + u / 4 * x;
      this.ctx.moveTo(p, y), this.ctx.lineTo(p, y + c);
    }
    this.ctx.stroke(), this.ctx.fillStyle = "#aaaaaa", this.ctx.font = "10px monospace", this.ctx.textAlign = "right", this.ctx.textBaseline = "middle";
    for (let x = 0; x <= 4; x++) {
      const p = w - (w - E) * (x / 4), S = y + c / 4 * x, F = p >= 1e3 ? `${(p / 1e3).toFixed(1)}k` : `${p.toFixed(0)}`;
      this.ctx.fillText(F, h - 5, S);
    }
    this.ctx.fillStyle = "#88ccff", this.ctx.font = "9px monospace", this.ctx.textAlign = "right", this.ctx.textBaseline = "middle";
    for (let x = 0; x <= 4; x++) {
      const p = w - (w - E) * (x / 4), S = y + c / 4 * x, F = P(p);
      if (F) {
        const H = F.cents >= 0 ? "+" : "";
        this.ctx.fillText(`${H}${F.cents}¢`, h + u - 5, S);
      }
    }
    this.ctx.strokeStyle = "#00ff00", this.ctx.lineWidth = 2, this.ctx.beginPath();
    const v = u / Math.max(t.length - 1, 1), T = Math.max(1, Math.floor(t.length / 4)), C = (x) => {
      const S = (Math.max(E, Math.min(w, x)) - E) / (w - E);
      return y + c - S * c;
    };
    let b = !1;
    for (let x = 0; x < t.length; x++) {
      const p = t[x], S = h + x * v;
      if (p === 0) {
        b = !1;
        continue;
      }
      const F = C(p);
      b ? this.ctx.lineTo(S, F) : (this.ctx.moveTo(S, F), b = !0);
    }
    this.ctx.stroke(), this.ctx.font = "9px monospace", this.ctx.textAlign = "center", this.ctx.textBaseline = "top";
    for (let x = 0; x < t.length; x++) {
      const p = t[x], S = h + x * v;
      if (p !== 0) {
        const I = C(p);
        this.ctx.fillStyle = "#00ff00", this.ctx.beginPath(), this.ctx.arc(S, I, 2, 0, Math.PI * 2), this.ctx.fill();
      }
      const F = x === t.length - 1;
      if (x % T === 0 || F) {
        this.ctx.fillStyle = "#aaaaaa";
        const I = x - t.length + 1;
        this.ctx.fillText(`${I}`, S, y + c + 2);
      }
    }
    const _ = t[t.length - 1];
    if (_ > 0) {
      const x = P(_);
      this.ctx.fillStyle = "#00ff00", this.ctx.font = "bold 11px Arial", this.ctx.textAlign = "left", this.ctx.textBaseline = "bottom";
      let p = `${_.toFixed(1)} Hz`;
      if (x) {
        const S = x.cents >= 0 ? "+" : "";
        p += ` (${x.noteName} ${S}${x.cents}¢)`;
      }
      this.ctx.fillText(p, h + 2, y + c - 2);
    }
    this.ctx.restore();
  }
  /**
   * Draw phase markers on the waveform
   * @param phaseZeroIndex - Sample index for phase 0 (red line)
   * @param phaseTwoPiIndex - Sample index for phase 2π (red line)
   * @param phaseMinusQuarterPiIndex - Sample index for phase -π/4 (orange line)
   * @param phaseTwoPiPlusQuarterPiIndex - Sample index for phase 2π+π/4 (orange line)
   * @param displayStartIndex - Start index of the displayed region
   * @param displayEndIndex - End index of the displayed region
   */
  drawPhaseMarkers(t, e, i, r, a, o) {
    if (a === void 0 || o === void 0)
      return;
    const s = o - a;
    if (s <= 0)
      return;
    this.ctx.save();
    const h = (y, u, c) => {
      const d = y - a;
      if (d < 0 || d >= s)
        return;
      const l = d / s * this.canvas.width;
      this.ctx.strokeStyle = u, this.ctx.lineWidth = c, this.ctx.beginPath(), this.ctx.moveTo(l, 0), this.ctx.lineTo(l, this.canvas.height), this.ctx.stroke();
    };
    i !== void 0 && h(i, "#ff8800", 2), r !== void 0 && h(r, "#ff8800", 2), t !== void 0 && h(t, "#ff0000", 2), e !== void 0 && h(e, "#ff0000", 2), this.ctx.restore();
  }
  // Getters and setters
  setFFTDisplay(t) {
    this.fftDisplayEnabled = t;
  }
  getFFTDisplayEnabled() {
    return this.fftDisplayEnabled;
  }
  /**
   * Enable or disable debug overlays (harmonic analysis, frequency plot)
   * When disabled, yellow-bordered debug information panels are hidden
   * Recommended: Set to false when using as a library for cleaner display
   * @param enabled - true to show debug overlays, false to hide them
   */
  setDebugOverlaysEnabled(t) {
    this.debugOverlaysEnabled = t;
  }
  /**
   * Get the current state of debug overlays
   * @returns true if debug overlays are enabled, false otherwise
   */
  getDebugOverlaysEnabled() {
    return this.debugOverlaysEnabled;
  }
  /**
   * Set the layout configuration for overlays
   * Allows external applications to control the position and size of debug overlays
   * @param layout - Layout configuration for overlays
   */
  setOverlaysLayout(t) {
    this.overlaysLayout = { ...this.overlaysLayout, ...t };
  }
  /**
   * Get the current overlays layout configuration
   * @returns Current overlays layout configuration
   */
  getOverlaysLayout() {
    return this.overlaysLayout;
  }
  /**
   * Helper method to calculate overlay dimensions based on layout config
   */
  calculateOverlayDimensions(t, e, i, r, a) {
    if (!t)
      return { x: e, y: i, width: r, height: a };
    let o = e, s = i, h = r, y = a;
    if (t.position.x !== void 0)
      if (typeof t.position.x == "string" && t.position.x.startsWith("right-")) {
        const u = parseInt(t.position.x.substring(6), 10), c = typeof t.size.width == "string" && t.size.width.endsWith("%") ? A(t.size.width, this.canvas.width) : typeof t.size.width == "number" ? t.size.width : r;
        o = this.canvas.width - c - u;
      } else
        o = A(t.position.x, this.canvas.width);
    return t.position.y !== void 0 && (s = A(t.position.y, this.canvas.height)), t.size.width !== void 0 && t.size.width !== "auto" && (h = A(t.size.width, this.canvas.width)), t.size.height !== void 0 && t.size.height !== "auto" && (y = A(t.size.height, this.canvas.height)), { x: o, y: s, width: h, height: y };
  }
}
class $ {
  constructor() {
    n(this, "usePeakMode", !1);
  }
  /**
   * Set whether to use peak mode instead of zero-crossing mode
   */
  setUsePeakMode(t) {
    this.usePeakMode = t;
  }
  /**
   * Get whether peak mode is enabled
   */
  getUsePeakMode() {
    return this.usePeakMode;
  }
  /**
   * Reset state (e.g., when stopping)
   */
  reset() {
  }
}
class U {
  constructor() {
    n(this, "previousWaveform", null);
    n(this, "lastSimilarity", 0);
  }
  /**
   * Get the last calculated similarity score
   */
  getLastSimilarity() {
    return this.lastSimilarity;
  }
  /**
   * Reset state (e.g., when stopping)
   */
  reset() {
    this.previousWaveform = null, this.lastSimilarity = 0;
  }
  /**
   * Check if previous waveform exists
   */
  hasPreviousWaveform() {
    return this.previousWaveform !== null;
  }
  /**
   * Get the previous waveform (for debugging/visualization)
   */
  getPreviousWaveform() {
    return this.previousWaveform;
  }
}
class X {
  // Default scaling factor when peak is too small
  constructor(t, e, i, r) {
    n(this, "previousCanvas");
    n(this, "currentCanvas");
    n(this, "similarityCanvas");
    n(this, "bufferCanvas");
    n(this, "previousCtx");
    n(this, "currentCtx");
    n(this, "similarityCtx");
    n(this, "bufferCtx");
    // Auto-scaling constants
    n(this, "TARGET_FILL_RATIO", 0.9);
    // Target 90% of distance from center to edge (canvas half-height) for auto-scaled waveforms
    n(this, "MIN_PEAK_THRESHOLD", 1e-3);
    // Minimum peak to trigger auto-scaling (below this uses default)
    n(this, "DEFAULT_AMPLITUDE_RATIO", 0.4);
    this.previousCanvas = t, this.currentCanvas = e, this.similarityCanvas = i, this.bufferCanvas = r;
    const a = t.getContext("2d"), o = e.getContext("2d"), s = i.getContext("2d"), h = r.getContext("2d");
    if (!a || !o || !s || !h)
      throw new Error("Could not get 2D context for comparison canvases");
    this.previousCtx = a, this.currentCtx = o, this.similarityCtx = s, this.bufferCtx = h, this.clearAllCanvases();
  }
  /**
   * Clear all comparison canvases
   */
  clearAllCanvases() {
    this.clearCanvas(this.previousCtx, this.previousCanvas.width, this.previousCanvas.height), this.clearCanvas(this.currentCtx, this.currentCanvas.width, this.currentCanvas.height), this.clearCanvas(this.similarityCtx, this.similarityCanvas.width, this.similarityCanvas.height), this.clearCanvas(this.bufferCtx, this.bufferCanvas.width, this.bufferCanvas.height);
  }
  /**
   * Clear a single canvas
   */
  clearCanvas(t, e, i) {
    t.fillStyle = "#000000", t.fillRect(0, 0, e, i);
  }
  /**
   * Calculate peak amplitude in a given range of data
   * Used for auto-scaling waveforms to fill the vertical space
   */
  findPeakAmplitude(t, e, i) {
    let r = 0;
    const a = Math.max(0, e), o = Math.min(t.length, i);
    for (let s = a; s < o; s++) {
      const h = Math.abs(t[s]);
      h > r && (r = h);
    }
    return r;
  }
  /**
   * Draw a waveform on a canvas with auto-scaling
   * Waveforms are automatically scaled so that peaks reach 90% of the distance
   * from the vertical center line to the top/bottom edge (i.e. 90% of half the height).
   * For example, if peak amplitude is 0.01, it will be scaled 90x relative to that center-to-edge range.
   */
  drawWaveform(t, e, i, r, a, o, s) {
    const h = o - a;
    if (h <= 0) return;
    const y = this.findPeakAmplitude(r, a, o);
    t.strokeStyle = s, t.lineWidth = 1.5, t.beginPath();
    const u = e / h, c = i / 2;
    let d;
    if (y > this.MIN_PEAK_THRESHOLD) {
      const l = this.TARGET_FILL_RATIO / y;
      d = i / 2 * l;
    } else
      d = i * this.DEFAULT_AMPLITUDE_RATIO;
    for (let l = 0; l < h; l++) {
      const m = a + l;
      if (m >= r.length) break;
      const g = r[m], E = c - g * d, w = Math.min(i, Math.max(0, E)), v = l * u;
      l === 0 ? t.moveTo(v, w) : t.lineTo(v, w);
    }
    t.stroke();
  }
  /**
   * Draw center line on canvas
   */
  drawCenterLine(t, e, i) {
    t.strokeStyle = "#444444", t.lineWidth = 1, t.beginPath(), t.moveTo(0, i / 2), t.lineTo(e, i / 2), t.stroke();
  }
  /**
   * Draw similarity score text
   */
  drawSimilarityText(t) {
    this.currentCtx.fillStyle = "#00aaff", this.currentCtx.font = "bold 14px Arial";
    const e = `Similarity: ${t.toFixed(3)}`, i = this.currentCtx.measureText(e).width, r = (this.currentCanvas.width - i) / 2;
    this.currentCtx.fillText(e, r, 20);
  }
  /**
   * Draw similarity history plot on similarity canvas
   * 類似度の時系列変化を表示し、瞬間的な類似度低下を検出しやすくする
   * 
   * @param similarityHistory Array of correlation coefficients (-1.0 to 1.0).
   *                          Values are ordered chronologically from oldest to newest.
   */
  drawSimilarityPlot(t) {
    if (!t || t.length === 0)
      return;
    const e = this.similarityCtx, i = this.similarityCanvas.width, r = this.similarityCanvas.height;
    e.save(), e.fillStyle = "#000000", e.fillRect(0, 0, i, r), e.strokeStyle = "#00aaff", e.lineWidth = 2, e.strokeRect(0, 0, i, r), e.fillStyle = "#00aaff", e.font = "bold 12px Arial", e.fillText("類似度推移 (Similarity)", 5, 15);
    const a = 40, o = 25, s = i - 50, h = r - 35, y = -1, u = 1;
    e.strokeStyle = "#333333", e.lineWidth = 1, e.beginPath();
    for (let l = 0; l <= 4; l++) {
      const m = o + h / 4 * l;
      e.moveTo(a, m), e.lineTo(a + s, m);
    }
    for (let l = 0; l <= 4; l++) {
      const m = a + s / 4 * l;
      e.moveTo(m, o), e.lineTo(m, o + h);
    }
    e.stroke(), e.fillStyle = "#aaaaaa", e.font = "10px monospace", e.textAlign = "right", e.textBaseline = "middle";
    for (let l = 0; l <= 4; l++) {
      const m = u - (u - y) * (l / 4), g = o + h / 4 * l, E = m.toFixed(2);
      e.fillText(E, a - 5, g);
    }
    e.strokeStyle = "#00aaff", e.lineWidth = 2, e.beginPath();
    const c = s / Math.max(t.length - 1, 1);
    for (let l = 0; l < t.length; l++) {
      const m = t[l], g = a + l * c, w = (Math.max(y, Math.min(u, m)) - y) / (u - y), v = o + h - w * h;
      l === 0 ? e.moveTo(g, v) : e.lineTo(g, v);
    }
    e.stroke();
    const d = t[t.length - 1];
    e.fillStyle = "#00aaff", e.font = "bold 11px Arial", e.textAlign = "left", e.textBaseline = "bottom", e.fillText(`${d.toFixed(3)}`, a + 2, o + h - 2), e.restore();
  }
  /**
   * Draw vertical position markers
   */
  drawPositionMarkers(t, e, i, r, a, o) {
    if (o <= 0) return;
    const s = r / o * e, h = a / o * e;
    t.strokeStyle = "#ff0000", t.lineWidth = 2, t.beginPath(), t.moveTo(s, 0), t.lineTo(s, i), t.stroke(), t.beginPath(), t.moveTo(h, 0), t.lineTo(h, i), t.stroke(), t.fillStyle = "#ff0000", t.font = "10px Arial", t.fillText("S", s + 2, 12), t.fillText("E", h + 2, 12);
  }
  /**
   * Update all comparison panels
   * @param previousWaveform - Previous frame's waveform data (null if no previous frame exists)
   * @param currentWaveform - Full buffer containing current frame's audio data
   * @param currentStart - Start index of the extracted waveform within currentWaveform
   * @param currentEnd - End index of the extracted waveform within currentWaveform (exclusive)
   * @param fullBuffer - Complete frame buffer to display (typically same as currentWaveform)
   * @param similarity - Correlation coefficient between current and previous waveform (-1 to +1)
   * @param similarityHistory - Array of similarity values over time for history plot
   */
  updatePanels(t, e, i, r, a, o, s = []) {
    this.clearAllCanvases(), t && (this.drawCenterLine(this.previousCtx, this.previousCanvas.width, this.previousCanvas.height), this.drawWaveform(
      this.previousCtx,
      this.previousCanvas.width,
      this.previousCanvas.height,
      t,
      0,
      t.length,
      "#ffaa00"
    )), this.drawCenterLine(this.currentCtx, this.currentCanvas.width, this.currentCanvas.height), r - i > 0 && this.drawWaveform(
      this.currentCtx,
      this.currentCanvas.width,
      this.currentCanvas.height,
      e,
      i,
      r,
      "#00ff00"
    ), t && this.drawSimilarityText(o), s.length > 0 && this.drawSimilarityPlot(s), this.drawCenterLine(this.bufferCtx, this.bufferCanvas.width, this.bufferCanvas.height), this.drawWaveform(
      this.bufferCtx,
      this.bufferCanvas.width,
      this.bufferCanvas.height,
      a,
      0,
      a.length,
      "#888888"
    ), this.drawPositionMarkers(
      this.bufferCtx,
      this.bufferCanvas.width,
      this.bufferCanvas.height,
      i,
      r,
      a.length
    );
  }
  /**
   * Clear all panels (e.g., when stopped)
   */
  clear() {
    this.clearAllCanvases();
  }
}
const M = class M {
  constructor(t, e, i, r) {
    n(this, "audioManager");
    n(this, "gainController");
    n(this, "frequencyEstimator");
    n(this, "waveformSearcher");
    n(this, "wasmProcessor", null);
    n(this, "isInitialized", !1);
    n(this, "cachedBasePath", null);
    this.audioManager = t, this.gainController = e, this.frequencyEstimator = i, this.waveformSearcher = r;
  }
  /**
   * Initialize the WASM module
   * Must be called before processFrame
   */
  async initialize() {
    if (!this.isInitialized) {
      if (typeof window > "u" || window.location.protocol === "file:")
        throw new Error("WASM module not available in test/non-browser environment");
      try {
        await this.loadWasmModule(), this.isInitialized = !0, this.syncConfigToWasm();
      } catch (t) {
        throw console.error("Failed to initialize WASM module:", t), t;
      }
    }
  }
  /**
   * Load WASM module dynamically
   */
  async loadWasmModule() {
    return new Promise((t, e) => {
      if (window.wasmProcessor && window.wasmProcessor.WasmDataProcessor) {
        this.wasmProcessor = new window.wasmProcessor.WasmDataProcessor(), t();
        return;
      }
      const i = setTimeout(() => {
        s(), e(new Error("WASM module loading timed out after 10 seconds"));
      }, 1e4), a = `${this.determineBasePath()}wasm/wasm_processor.js`, o = document.createElement("script");
      o.type = "module", o.textContent = `
        import init, { WasmDataProcessor } from '${a}';
        await init();
        window.wasmProcessor = { WasmDataProcessor };
        window.dispatchEvent(new Event('wasmLoaded'));
      `;
      const s = () => {
        clearTimeout(i), window.removeEventListener("wasmLoaded", h);
      }, h = () => {
        s(), window.wasmProcessor && window.wasmProcessor.WasmDataProcessor ? (this.wasmProcessor = new window.wasmProcessor.WasmDataProcessor(), t()) : e(new Error("WASM module loaded but WasmDataProcessor not found"));
      };
      window.addEventListener("wasmLoaded", h), o.onerror = () => {
        s(), e(new Error("Failed to load WASM module script"));
      }, document.head.appendChild(o);
    });
  }
  /**
   * Determine the base path for the application
   * This method implements a fallback hierarchy:
   * 1. Check for <base> tag href attribute
   * 2. Extract from existing script tags
   * 3. Check if running in Vite dev mode (import.meta.env.DEV)
   * 4. Default to '/'
   * The path is normalized to always end with '/'
   */
  determineBasePath() {
    var e;
    if (this.cachedBasePath !== null)
      return this.cachedBasePath;
    let t = (e = document.querySelector("base")) == null ? void 0 : e.getAttribute("href");
    if (t)
      try {
        t = new URL(t, window.location.href).pathname;
      } catch {
      }
    if (t || (t = this.getBasePathFromScripts()), !t && window.location.pathname && window.location.pathname !== "/") {
      const r = window.location.pathname.split("/").filter((a) => a.length > 0);
      r.length > 0 && (t = `/${r[0]}/`);
    }
    return t || (t = "/"), t.endsWith("/") || (t += "/"), this.cachedBasePath = t, t;
  }
  /**
   * Extract base path from existing script tags
   * This method attempts to infer the base path by looking for script tags with src attributes
   * that might indicate the deployment path. Falls back to empty string if no clear pattern is found.
   */
  getBasePathFromScripts() {
    const t = document.querySelectorAll("script[src]");
    for (const e of t) {
      const i = e.getAttribute("src");
      if (i)
        try {
          const a = new URL(i, window.location.href).pathname;
          for (const o of M.ASSET_PATTERNS) {
            const s = a.indexOf(o);
            if (s >= 0)
              return s === 0 ? "/" : a.substring(0, s) + "/";
          }
        } catch (r) {
          (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && console.debug("Failed to parse script URL:", i, r);
          continue;
        }
    }
    return "";
  }
  /**
   * Sync TypeScript configuration to WASM processor
   */
  syncConfigToWasm() {
    this.wasmProcessor && (this.wasmProcessor.setAutoGain(this.gainController.getAutoGainEnabled()), this.wasmProcessor.setNoiseGate(this.gainController.getNoiseGateEnabled()), this.wasmProcessor.setNoiseGateThreshold(this.gainController.getNoiseGateThreshold()), this.wasmProcessor.setFrequencyEstimationMethod(this.frequencyEstimator.getFrequencyEstimationMethod()), this.wasmProcessor.setBufferSizeMultiplier(this.frequencyEstimator.getBufferSizeMultiplier()));
  }
  /**
   * Sync WASM results back to TypeScript objects
   * 
   * Note: This method accesses private members using type assertions.
   * This is a temporary solution to maintain compatibility with existing code
   * that uses getters like getEstimatedFrequency(), getCurrentGain(), etc.
   * 
   * TODO: Consider adding public setter methods to these classes or
   * redesigning the synchronization interface for better type safety.
   */
  syncResultsFromWasm(t) {
    this.frequencyEstimator.estimatedFrequency = t.estimatedFrequency, this.gainController.currentGain = t.gain, t.previousWaveform && (this.waveformSearcher.previousWaveform = t.previousWaveform), this.waveformSearcher.lastSimilarity = t.similarity;
  }
  /**
   * Process current frame and generate complete render data using WASM
   */
  processFrame(t) {
    if (!this.isInitialized || !this.wasmProcessor)
      return console.warn("WASM processor not initialized"), null;
    if (!this.audioManager.isReady())
      return null;
    const e = this.audioManager.getTimeDomainData();
    if (!e)
      return null;
    const i = this.audioManager.getSampleRate(), r = this.audioManager.getFFTSize(), o = this.frequencyEstimator.getFrequencyEstimationMethod() === "fft" || t ? this.audioManager.getFrequencyData() : null;
    this.syncConfigToWasm();
    const s = this.wasmProcessor.processFrame(
      e,
      o,
      i,
      r,
      t
    );
    if (!s)
      return null;
    const h = {
      waveformData: new Float32Array(s.waveform_data),
      displayStartIndex: s.displayStartIndex,
      displayEndIndex: s.displayEndIndex,
      gain: s.gain,
      estimatedFrequency: s.estimatedFrequency,
      frequencyPlotHistory: s.frequencyPlotHistory ? Array.from(s.frequencyPlotHistory) : [],
      sampleRate: s.sampleRate,
      fftSize: s.fftSize,
      frequencyData: s.frequencyData ? new Uint8Array(s.frequencyData) : void 0,
      isSignalAboveNoiseGate: s.isSignalAboveNoiseGate,
      maxFrequency: s.maxFrequency,
      previousWaveform: s.previousWaveform ? new Float32Array(s.previousWaveform) : null,
      similarity: s.similarity,
      similarityPlotHistory: s.similarityPlotHistory ? Array.from(s.similarityPlotHistory) : [],
      usedSimilaritySearch: s.usedSimilaritySearch,
      phaseZeroIndex: s.phaseZeroIndex,
      phaseTwoPiIndex: s.phaseTwoPiIndex,
      phaseMinusQuarterPiIndex: s.phaseMinusQuarterPiIndex,
      phaseTwoPiPlusQuarterPiIndex: s.phaseTwoPiPlusQuarterPiIndex,
      halfFreqPeakStrengthPercent: s.halfFreqPeakStrengthPercent,
      candidate1Harmonics: s.candidate1Harmonics ? Array.from(s.candidate1Harmonics) : void 0,
      candidate2Harmonics: s.candidate2Harmonics ? Array.from(s.candidate2Harmonics) : void 0,
      selectionReason: s.selectionReason
    };
    return this.syncResultsFromWasm(h), h;
  }
  /**
   * Reset the WASM processor state
   */
  reset() {
    this.wasmProcessor && this.wasmProcessor.reset();
  }
};
// Asset directory patterns used for base path detection
n(M, "ASSET_PATTERNS", ["/assets/", "/js/", "/dist/"]);
let R = M;
class Z {
  // Log FPS every 60 frames (approx. 1 second at 60fps)
  /**
   * Create a new Oscilloscope instance
   * @param canvas - Main oscilloscope display canvas (recommended: 800x350px)
   * @param previousWaveformCanvas - Canvas for displaying previous frame's waveform (recommended: 250x120px)
   * @param currentWaveformCanvas - Canvas for displaying current frame's waveform (recommended: 250x120px)
   * @param similarityPlotCanvas - Canvas for displaying similarity history plot (recommended: 250x120px)
   * @param frameBufferCanvas - Canvas for displaying full frame buffer with position markers (recommended: 800x120px)
   * @param overlaysLayout - Optional layout configuration for debug overlays (FFT, harmonic analysis, frequency plot)
   */
  constructor(t, e, i, r, a, o) {
    n(this, "audioManager");
    n(this, "gainController");
    n(this, "frequencyEstimator");
    n(this, "renderer");
    n(this, "zeroCrossDetector");
    n(this, "waveformSearcher");
    n(this, "comparisonRenderer");
    n(this, "dataProcessor");
    n(this, "animationId", null);
    n(this, "isRunning", !1);
    n(this, "isPaused", !1);
    // Frame processing diagnostics
    n(this, "lastFrameTime", 0);
    n(this, "frameProcessingTimes", []);
    n(this, "MAX_FRAME_TIMES", 100);
    n(this, "TARGET_FRAME_TIME", 16.67);
    // 60fps target
    n(this, "FPS_LOG_INTERVAL_FRAMES", 60);
    this.audioManager = new z(), this.gainController = new q(), this.frequencyEstimator = new B(), this.renderer = new Y(t, o), this.zeroCrossDetector = new $(), this.waveformSearcher = new U(), this.comparisonRenderer = new X(
      e,
      i,
      r,
      a
    ), this.dataProcessor = new R(
      this.audioManager,
      this.gainController,
      this.frequencyEstimator,
      this.waveformSearcher
    );
  }
  async start() {
    try {
      await this.dataProcessor.initialize(), await this.audioManager.start(), this.isRunning = !0, this.render();
    } catch (t) {
      throw console.error("Error starting oscilloscope:", t), t;
    }
  }
  async startFromFile(t) {
    try {
      await this.dataProcessor.initialize(), await this.audioManager.startFromFile(t), this.isRunning = !0, this.render();
    } catch (e) {
      throw console.error("Error loading audio file:", e), e;
    }
  }
  /**
   * Start visualization from a static buffer without audio playback
   * Useful for visualizing pre-recorded audio data or processing results
   * @param bufferSource - BufferSource instance containing audio data
   */
  async startFromBuffer(t) {
    try {
      await this.dataProcessor.initialize(), await this.audioManager.startFromBuffer(t), this.isRunning = !0, this.render();
    } catch (e) {
      throw console.error("Error starting from buffer:", e), e;
    }
  }
  async stop() {
    this.isRunning = !1, this.animationId !== null && (cancelAnimationFrame(this.animationId), this.animationId = null), await this.audioManager.stop(), this.frequencyEstimator.clearHistory(), this.zeroCrossDetector.reset(), this.waveformSearcher.reset(), this.comparisonRenderer.clear(), this.dataProcessor.reset();
  }
  render() {
    if (!this.isRunning)
      return;
    const t = performance.now();
    if (!this.isPaused) {
      const r = this.dataProcessor.processFrame(this.renderer.getFFTDisplayEnabled());
      r && this.renderFrame(r);
    }
    const i = performance.now() - t;
    if (this.frameProcessingTimes.push(i), this.frameProcessingTimes.length > this.MAX_FRAME_TIMES && this.frameProcessingTimes.shift(), i > this.TARGET_FRAME_TIME && console.warn(`Frame processing time: ${i.toFixed(2)}ms (target: <${this.TARGET_FRAME_TIME}ms)`), this.lastFrameTime > 0) {
      const a = 1e3 / (t - this.lastFrameTime);
      if (this.frameProcessingTimes.length === this.FPS_LOG_INTERVAL_FRAMES) {
        const o = this.frameProcessingTimes.reduce((s, h) => s + h, 0) / this.frameProcessingTimes.length;
        console.log(`FPS: ${a.toFixed(1)}, Avg frame time: ${o.toFixed(2)}ms`);
      }
    }
    this.lastFrameTime = t, this.animationId = requestAnimationFrame(() => this.render());
  }
  /**
   * Render a single frame using pre-processed data
   * This method contains only rendering logic - no data processing
   */
  renderFrame(t) {
    const e = t.displayEndIndex - t.displayStartIndex;
    this.renderer.clearAndDrawGrid(
      t.sampleRate,
      e,
      t.gain
    ), this.renderer.drawWaveform(
      t.waveformData,
      t.displayStartIndex,
      t.displayEndIndex,
      t.gain
    ), this.renderer.drawPhaseMarkers(
      t.phaseZeroIndex,
      t.phaseTwoPiIndex,
      t.phaseMinusQuarterPiIndex,
      t.phaseTwoPiPlusQuarterPiIndex,
      t.displayStartIndex,
      t.displayEndIndex
    ), t.frequencyData && this.renderer.getFFTDisplayEnabled() && t.isSignalAboveNoiseGate && (this.renderer.drawFFTOverlay(
      t.frequencyData,
      t.estimatedFrequency,
      t.sampleRate,
      t.fftSize,
      t.maxFrequency
    ), this.renderer.drawHarmonicAnalysis(
      t.halfFreqPeakStrengthPercent,
      t.candidate1Harmonics,
      t.candidate2Harmonics,
      t.candidate1WeightedScore,
      t.candidate2WeightedScore,
      t.selectionReason,
      t.estimatedFrequency
    )), this.renderer.drawFrequencyPlot(
      t.frequencyPlotHistory,
      this.frequencyEstimator.getMinFrequency(),
      this.frequencyEstimator.getMaxFrequency()
    ), this.comparisonRenderer.updatePanels(
      t.previousWaveform,
      t.waveformData,
      t.displayStartIndex,
      t.displayEndIndex,
      t.waveformData,
      t.similarity,
      t.similarityPlotHistory
    );
  }
  // Getters and setters - delegate to appropriate modules
  getIsRunning() {
    return this.isRunning;
  }
  setAutoGain(t) {
    this.gainController.setAutoGain(t);
  }
  getAutoGainEnabled() {
    return this.gainController.getAutoGainEnabled();
  }
  setNoiseGate(t) {
    this.gainController.setNoiseGate(t);
  }
  getNoiseGateEnabled() {
    return this.gainController.getNoiseGateEnabled();
  }
  setNoiseGateThreshold(t) {
    this.gainController.setNoiseGateThreshold(t);
  }
  getNoiseGateThreshold() {
    return this.gainController.getNoiseGateThreshold();
  }
  setFrequencyEstimationMethod(t) {
    this.frequencyEstimator.setFrequencyEstimationMethod(t);
  }
  getFrequencyEstimationMethod() {
    return this.frequencyEstimator.getFrequencyEstimationMethod();
  }
  setBufferSizeMultiplier(t) {
    this.frequencyEstimator.setBufferSizeMultiplier(t);
  }
  getBufferSizeMultiplier() {
    return this.frequencyEstimator.getBufferSizeMultiplier();
  }
  getEstimatedFrequency() {
    return this.frequencyEstimator.getEstimatedFrequency();
  }
  setFFTDisplay(t) {
    this.renderer.setFFTDisplay(t);
  }
  getFFTDisplayEnabled() {
    return this.renderer.getFFTDisplayEnabled();
  }
  /**
   * Enable or disable debug overlays (harmonic analysis, frequency plot)
   * Debug overlays show detailed debugging information with yellow borders (#ffaa00)
   * including harmonic analysis and frequency history plot
   * 
   * When using cat-oscilloscope as a library, it's recommended to disable these
   * overlays for a cleaner, more professional appearance
   * 
   * @param enabled - true to show debug overlays (default for standalone app),
   *                  false to hide them (recommended for library usage)
   */
  setDebugOverlaysEnabled(t) {
    this.renderer.setDebugOverlaysEnabled(t);
  }
  /**
   * Get the current state of debug overlays
   * @returns true if debug overlays are enabled, false otherwise
   */
  getDebugOverlaysEnabled() {
    return this.renderer.getDebugOverlaysEnabled();
  }
  /**
   * Set the layout configuration for overlays
   * Allows external applications to control the position and size of debug overlays
   * @param layout - Layout configuration for overlays (FFT, harmonic analysis, frequency plot)
   */
  setOverlaysLayout(t) {
    this.renderer.setOverlaysLayout(t);
  }
  /**
   * Get the current overlays layout configuration
   * @returns Current overlays layout configuration
   */
  getOverlaysLayout() {
    return this.renderer.getOverlaysLayout();
  }
  getCurrentGain() {
    return this.gainController.getCurrentGain();
  }
  getSimilarityScore() {
    return this.waveformSearcher.getLastSimilarity();
  }
  isSimilaritySearchActive() {
    return this.waveformSearcher.hasPreviousWaveform();
  }
  setUsePeakMode(t) {
    this.zeroCrossDetector.setUsePeakMode(t);
  }
  getUsePeakMode() {
    return this.zeroCrossDetector.getUsePeakMode();
  }
  setPauseDrawing(t) {
    this.isPaused = t;
  }
  getPauseDrawing() {
    return this.isPaused;
  }
}
class V {
  constructor(t) {
    n(this, "canvas");
    n(this, "ctx");
    // 周波数範囲 (50Hz～2000Hz)
    n(this, "MIN_FREQ", 50);
    n(this, "MAX_FREQ", 2e3);
    // ピアノ鍵盤の定数
    n(this, "WHITE_KEY_WIDTH", 20);
    n(this, "WHITE_KEY_HEIGHT", 60);
    n(this, "BLACK_KEY_WIDTH", 12);
    n(this, "BLACK_KEY_HEIGHT", 38);
    // 色定義
    n(this, "WHITE_KEY_COLOR", "#ffffff");
    n(this, "BLACK_KEY_COLOR", "#000000");
    n(this, "WHITE_KEY_HIGHLIGHT", "#00ff00");
    n(this, "BLACK_KEY_HIGHLIGHT", "#00cc00");
    n(this, "KEY_BORDER", "#333333");
    // 音名パターン定数（配列アロケーションを避けるため）
    // 白鍵: C(0), D(2), E(4), F(5), G(7), A(9), B(11)
    n(this, "WHITE_KEY_NOTES", [0, 2, 4, 5, 7, 9, 11]);
    // 黒鍵: C#(1), D#(3), F#(6), G#(8), A#(10)
    n(this, "BLACK_KEY_NOTES", [1, 3, 6, 8, 10]);
    // キャッシュされた鍵盤範囲（コンストラクタで一度だけ計算）
    n(this, "keyboardRange");
    // センタリング用のオフセット（コンストラクタで一度だけ計算）
    n(this, "xOffset");
    // 白鍵の総数（コンストラクタで一度だけ計算）
    n(this, "whiteKeyCount");
    this.canvas = t;
    const e = t.getContext("2d");
    if (!e)
      throw new Error("Could not get 2D context for piano keyboard");
    this.ctx = e, this.keyboardRange = this.calculateKeyboardRange(), this.whiteKeyCount = this.countWhiteKeys(), this.xOffset = this.calculateCenteringOffset();
  }
  /**
   * 周波数から音名情報を取得
   * utils.tsのfrequencyToNote関数を使用し、内部形式に変換
   */
  frequencyToNoteInfo(t) {
    const e = P(t);
    if (!e)
      return { note: -1, octave: -1, noteInOctave: -1 };
    const i = e.noteName.match(/^([A-G]#?)(\d+)$/);
    if (!i)
      return { note: -1, octave: -1, noteInOctave: -1 };
    const r = i[1], a = parseInt(i[2], 10), s = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].indexOf(r);
    return { note: a * 12 + s, octave: a, noteInOctave: s };
  }
  /**
   * 表示する鍵盤の範囲を計算
   * MIN_FREQからMAX_FREQまでの範囲をカバーする
   */
  calculateKeyboardRange() {
    const t = this.frequencyToNoteInfo(this.MIN_FREQ), e = this.frequencyToNoteInfo(this.MAX_FREQ);
    return {
      startNote: t.note,
      endNote: e.note
    };
  }
  /**
   * 白鍵の数をカウント
   */
  countWhiteKeys() {
    const t = this.keyboardRange;
    let e = 0;
    for (let i = t.startNote; i <= t.endNote; i++) {
      const r = (i % 12 + 12) % 12;
      this.WHITE_KEY_NOTES.includes(r) && e++;
    }
    return e;
  }
  /**
   * 鍵盤をセンタリングするためのX座標オフセットを計算
   */
  calculateCenteringOffset() {
    const t = this.whiteKeyCount * this.WHITE_KEY_WIDTH;
    return (this.canvas.width - t) / 2;
  }
  /**
   * ピアノ鍵盤を描画
   * @param highlightFrequency - ハイライトする周波数 (0の場合はハイライトなし)
   */
  render(t) {
    this.ctx.fillStyle = "#1a1a1a", this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    const e = this.keyboardRange, i = t > 0 ? this.frequencyToNoteInfo(t) : null;
    let r = 0;
    for (let h = e.startNote; h <= e.endNote; h++) {
      const y = (h % 12 + 12) % 12;
      if (this.WHITE_KEY_NOTES.includes(y)) {
        const u = this.xOffset + r * this.WHITE_KEY_WIDTH, c = i && i.note === h;
        this.ctx.fillStyle = c ? this.WHITE_KEY_HIGHLIGHT : this.WHITE_KEY_COLOR, this.ctx.fillRect(u, 0, this.WHITE_KEY_WIDTH, this.WHITE_KEY_HEIGHT), this.ctx.strokeStyle = this.KEY_BORDER, this.ctx.lineWidth = 1, this.ctx.strokeRect(u, 0, this.WHITE_KEY_WIDTH, this.WHITE_KEY_HEIGHT), r++;
      }
    }
    r = 0;
    for (let h = e.startNote; h <= e.endNote; h++) {
      const y = (h % 12 + 12) % 12;
      if (this.WHITE_KEY_NOTES.includes(y) && r++, this.BLACK_KEY_NOTES.includes(y)) {
        const u = this.xOffset + r * this.WHITE_KEY_WIDTH - this.BLACK_KEY_WIDTH / 2, c = i && i.note === h;
        this.ctx.fillStyle = c ? this.BLACK_KEY_HIGHLIGHT : this.BLACK_KEY_COLOR, this.ctx.fillRect(u, 0, this.BLACK_KEY_WIDTH, this.BLACK_KEY_HEIGHT), this.ctx.strokeStyle = this.KEY_BORDER, this.ctx.lineWidth = 1, this.ctx.strokeRect(u, 0, this.BLACK_KEY_WIDTH, this.BLACK_KEY_HEIGHT);
      }
    }
    this.ctx.fillStyle = "#888888", this.ctx.font = "10px monospace", this.ctx.fillText(`${this.MIN_FREQ}Hz`, this.xOffset + 5, this.WHITE_KEY_HEIGHT - 5);
    const a = `${this.MAX_FREQ}Hz`, o = this.ctx.measureText(a).width, s = this.xOffset + this.whiteKeyCount * this.WHITE_KEY_WIDTH;
    this.ctx.fillText(a, s - o - 5, this.WHITE_KEY_HEIGHT - 5);
  }
  /**
   * キャンバスをクリア
   */
  clear() {
    this.ctx.fillStyle = "#1a1a1a", this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
class W {
  /**
   * Create a BufferSource from Float32Array
   * @param buffer - Audio data as Float32Array (values typically in range -1.0 to 1.0)
   * @param sampleRate - Sample rate in Hz (e.g., 44100, 48000)
   * @param options - Optional configuration
   */
  constructor(t, e, i) {
    n(this, "buffer");
    n(this, "sampleRate");
    n(this, "position", 0);
    n(this, "chunkSize", 4096);
    // Default FFT size
    n(this, "isLooping", !1);
    if (e <= 0 || !isFinite(e))
      throw new Error("Sample rate must be a positive finite number");
    if (this.buffer = t, this.sampleRate = e, (i == null ? void 0 : i.chunkSize) !== void 0) {
      if (i.chunkSize <= 0 || !isFinite(i.chunkSize) || !Number.isInteger(i.chunkSize))
        throw new Error("Chunk size must be a positive integer");
      this.chunkSize = i.chunkSize;
    }
    (i == null ? void 0 : i.loop) !== void 0 && (this.isLooping = i.loop);
  }
  /**
   * Create a BufferSource from AudioBuffer
   * @param audioBuffer - Web Audio API AudioBuffer
   * @param options - Optional configuration
   */
  static fromAudioBuffer(t, e) {
    const i = (e == null ? void 0 : e.channel) ?? 0;
    if (i < 0 || i >= t.numberOfChannels)
      throw new Error(
        `Invalid channel index ${i}. AudioBuffer has ${t.numberOfChannels} channel(s).`
      );
    const r = t.getChannelData(i);
    return new W(r, t.sampleRate, {
      chunkSize: e == null ? void 0 : e.chunkSize,
      loop: e == null ? void 0 : e.loop
    });
  }
  /**
   * Get the next chunk of audio data
   * @returns Float32Array chunk or null if end is reached and not looping
   */
  getNextChunk() {
    if (this.buffer.length === 0)
      return null;
    if (this.position >= this.buffer.length)
      if (this.isLooping)
        this.position = 0;
      else
        return null;
    const t = Math.min(this.position + this.chunkSize, this.buffer.length), e = this.buffer.slice(this.position, t);
    if (e.length < this.chunkSize && this.isLooping) {
      const i = this.chunkSize - e.length, r = Math.min(i, this.buffer.length), a = new Float32Array(this.chunkSize);
      return a.set(e, 0), a.set(this.buffer.slice(0, r), e.length), this.position = r, a;
    }
    if (this.position = t, e.length < this.chunkSize) {
      const i = new Float32Array(this.chunkSize);
      return i.set(e, 0), i;
    }
    return e;
  }
  /**
   * Reset playback position to the beginning
   */
  reset() {
    this.position = 0;
  }
  /**
   * Seek to a specific position in the buffer
   * @param positionInSamples - Position in samples
   */
  seek(t) {
    this.position = Math.max(0, Math.min(t, this.buffer.length));
  }
  /**
   * Get current position in samples
   */
  getPosition() {
    return this.position;
  }
  /**
   * Get total buffer length in samples
   */
  getLength() {
    return this.buffer.length;
  }
  /**
   * Get sample rate
   */
  getSampleRate() {
    return this.sampleRate;
  }
  /**
   * Set chunk size
   */
  setChunkSize(t) {
    if (t <= 0 || !isFinite(t) || !Number.isInteger(t))
      throw new Error("Chunk size must be a positive integer");
    this.chunkSize = t;
  }
  /**
   * Get chunk size
   */
  getChunkSize() {
    return this.chunkSize;
  }
  /**
   * Set looping mode
   */
  setLooping(t) {
    this.isLooping = t;
  }
  /**
   * Get looping mode
   */
  isLoop() {
    return this.isLooping;
  }
  /**
   * Check if end of buffer is reached
   */
  isAtEnd() {
    return this.position >= this.buffer.length && !this.isLooping;
  }
}
export {
  z as AudioManager,
  W as BufferSource,
  X as ComparisonPanelRenderer,
  K as DEFAULT_OVERLAYS_LAYOUT,
  B as FrequencyEstimator,
  q as GainController,
  Z as Oscilloscope,
  V as PianoKeyboardRenderer,
  R as WaveformDataProcessor,
  Y as WaveformRenderer,
  U as WaveformSearcher,
  $ as ZeroCrossDetector,
  G as amplitudeToDb,
  O as dbToAmplitude,
  A as resolveValue,
  D as trimSilence
};
//# sourceMappingURL=cat-oscilloscope.mjs.map
