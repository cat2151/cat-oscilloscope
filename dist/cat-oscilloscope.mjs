var H = Object.defineProperty;
var k = (g, t, e) => t in g ? H(g, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : g[t] = e;
var a = (g, t, e) => k(g, typeof t != "symbol" ? t + "" : t, e);
function z(g) {
  return Math.pow(10, g / 20);
}
function O(g) {
  return g <= 0 ? -1 / 0 : 20 * Math.log10(g);
}
function I(g) {
  if (g <= 0 || !isFinite(g))
    return null;
  const e = 440 * Math.pow(2, -4.75), i = 12 * Math.log2(g / e), r = Math.round(i), o = Math.round((i - r) * 100), h = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"], n = Math.floor(r / 12);
  return {
    noteName: `${h[(r % 12 + 12) % 12]}${n}`,
    cents: o
  };
}
const G = -48;
function D(g) {
  const t = g.numberOfChannels, e = g.sampleRate, i = g.length, r = [];
  let o = 0;
  for (let c = 0; c < t; c++) {
    const u = g.getChannelData(c);
    r.push(u);
    for (let l = 0; l < i; l++) {
      const d = Math.abs(u[l]);
      d > o && (o = d);
    }
  }
  if (o === 0)
    return g;
  const h = o * Math.pow(10, G / 20);
  let n = i;
  for (let c = 0; c < i; c++) {
    let u = !0;
    for (let l = 0; l < t; l++)
      if (Math.abs(r[l][c]) > h) {
        u = !1;
        break;
      }
    if (!u) {
      n = c;
      break;
    }
  }
  if (n >= i)
    return g;
  let s = i - 1;
  for (let c = i - 1; c >= n; c--) {
    let u = !0;
    for (let l = 0; l < t; l++)
      if (Math.abs(r[l][c]) > h) {
        u = !1;
        break;
      }
    if (!u) {
      s = c;
      break;
    }
  }
  if (n === 0 && s === i - 1)
    return g;
  const m = s - n + 1, f = new AudioBuffer({
    numberOfChannels: t,
    length: m,
    sampleRate: e
  });
  for (let c = 0; c < t; c++) {
    const u = r[c], l = f.getChannelData(c);
    for (let d = 0; d < m; d++)
      l[d] = u[n + d];
  }
  return f;
}
class N {
  constructor() {
    a(this, "audioContext", null);
    a(this, "analyser", null);
    a(this, "mediaStream", null);
    a(this, "audioBufferSource", null);
    a(this, "bufferSource", null);
    a(this, "dataArray", null);
    a(this, "frequencyData", null);
    a(this, "frameBufferHistory", []);
    // History of frame buffers for extended FFT
    a(this, "MAX_FRAME_HISTORY", 16);
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
    const e = this.frameBufferHistory.slice(-t), i = e.reduce((h, n) => h + n.length, 0), r = new Float32Array(i);
    let o = 0;
    for (const h of e)
      r.set(h, o), o += h.length;
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
    a(this, "autoGainEnabled", !0);
    a(this, "currentGain", 1);
    a(this, "noiseGateEnabled", !0);
    a(this, "noiseGateThreshold", z(-60));
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
    a(this, "frequencyEstimationMethod", "fft");
    a(this, "estimatedFrequency", 0);
    a(this, "MIN_FREQUENCY_HZ", 20);
    // Minimum detectable frequency (Hz)
    a(this, "MAX_FREQUENCY_HZ", 5e3);
    // Maximum detectable frequency (Hz)
    a(this, "bufferSizeMultiplier", 16);
    // Buffer size multiplier for extended FFT
    a(this, "frequencyPlotHistory", []);
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
function F(g, t) {
  if (typeof g == "string" && g.endsWith("%")) {
    const e = parseFloat(g);
    return isNaN(e) ? (console.warn(`Invalid percentage value: ${g}, using 0`), 0) : e < 0 ? (console.warn(`Negative percentage value: ${g}, clamping to 0`), 0) : Math.floor(t * (e / 100));
  }
  if (typeof g == "string") {
    const e = parseInt(g, 10);
    return isNaN(e) ? (console.warn(`Invalid numeric string: ${g}, using 0`), 0) : Math.max(0, e);
  }
  return typeof g == "number" ? isNaN(g) ? (console.warn(`Invalid number value: ${g}, using 0`), 0) : Math.max(0, Math.floor(g)) : 0;
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
class $ {
  // 周波数範囲のパディング比率 (10%)
  constructor(t, e) {
    a(this, "canvas");
    a(this, "ctx");
    a(this, "fftDisplayEnabled", !0);
    a(this, "debugOverlaysEnabled", !0);
    // Control debug overlays (harmonic analysis, frequency plot)
    a(this, "overlaysLayout");
    // Layout configuration for overlays
    a(this, "FFT_OVERLAY_HEIGHT_RATIO", 0.9);
    // Spectrum bar height ratio within overlay (90%)
    a(this, "FFT_MIN_BAR_WIDTH", 1);
    // Minimum bar width in pixels
    a(this, "FREQ_PLOT_MIN_RANGE_PADDING_HZ", 50);
    // 周波数範囲の最小パディング (Hz)
    a(this, "FREQ_PLOT_RANGE_PADDING_RATIO", 0.1);
    this.canvas = t;
    const i = t.getContext("2d");
    if (!i)
      throw new Error("Could not get 2D context");
    this.ctx = i, this.overlaysLayout = e || K, t.width === 300 && t.height === 150 && console.warn(
      'Canvas element is using default dimensions (300x150). Set explicit width and height attributes on the canvas element to match desired resolution. Example: <canvas id="oscilloscope" width="1800" height="1000"></canvas>'
    );
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
    for (let h = 0; h <= r; h++) {
      const n = this.canvas.height / r * h;
      this.ctx.moveTo(0, n), this.ctx.lineTo(this.canvas.width, n);
    }
    const o = 10;
    for (let h = 0; h <= o; h++) {
      const n = this.canvas.width / o * h;
      this.ctx.moveTo(n, 0), this.ctx.lineTo(n, this.canvas.height);
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
    const r = e / t * 1e3, o = 10, h = r / o;
    for (let f = 0; f <= o; f++) {
      const c = this.canvas.width / o * f, u = h * f;
      let l;
      u >= 1e3 ? l = `${(u / 1e3).toFixed(2)}s` : u >= 1 ? l = `${u.toFixed(1)}ms` : l = `${(u * 1e3).toFixed(0)}μs`;
      const d = this.ctx.measureText(l).width, w = Math.max(2, Math.min(c - d / 2, this.canvas.width - d - 2));
      this.ctx.fillText(l, w, this.canvas.height - 3);
    }
    const n = 5, m = 1 / (n / 2 * i);
    for (let f = 0; f <= n; f++) {
      const c = this.canvas.height / n * f, l = (n / 2 - f) * m;
      let d;
      if (l === 0)
        d = "0dB*";
      else {
        const w = O(Math.abs(l)), y = l > 0 ? "+" : "-", x = Math.abs(w);
        x >= 100 ? d = `${y}${x.toFixed(0)}dB` : d = `${y}${x.toFixed(1)}dB`;
      }
      this.ctx.fillText(d, 3, c + 10);
    }
    this.ctx.restore();
  }
  /**
   * Draw waveform
   */
  drawWaveform(t, e, i, r) {
    const o = i - e;
    if (o <= 0) return;
    this.ctx.strokeStyle = "#00ff00", this.ctx.lineWidth = 2, this.ctx.beginPath();
    const h = this.canvas.width / o, n = this.canvas.height / 2, m = this.canvas.height / 2 * r;
    for (let f = 0; f < o; f++) {
      const c = e + f, u = t[c], l = n - u * m, d = Math.min(this.canvas.height, Math.max(0, l)), w = f * h;
      f === 0 ? this.ctx.moveTo(w, d) : this.ctx.lineTo(w, d);
    }
    this.ctx.stroke();
  }
  /**
   * Draw FFT spectrum overlay (position and size configurable via overlaysLayout)
   */
  drawFFTOverlay(t, e, i, r, o) {
    if (!this.fftDisplayEnabled)
      return;
    const h = i / r, n = Math.floor(this.canvas.width * 0.35), s = Math.floor(this.canvas.height * 0.35), m = 10, f = this.canvas.height - s - 10, { x: c, y: u, width: l, height: d } = this.calculateOverlayDimensions(
      this.overlaysLayout.fftOverlay,
      m,
      f,
      n,
      s
    );
    this.ctx.save(), this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)", this.ctx.fillRect(c, u, l, d), this.ctx.strokeStyle = "#00aaff", this.ctx.lineWidth = 2, this.ctx.strokeRect(c, u, l, d);
    const w = Math.min(
      t.length,
      Math.ceil(o / h)
    ), y = l / w;
    this.ctx.fillStyle = "#00aaff";
    for (let x = 0; x < w; x++) {
      const T = t[x] / 255 * d * this.FFT_OVERLAY_HEIGHT_RATIO, E = c + x * y, C = u + d - T;
      this.ctx.fillRect(E, C, Math.max(y - 1, this.FFT_MIN_BAR_WIDTH), T);
    }
    if (e > 0 && e <= o) {
      const x = e / h, p = c + x * y;
      this.ctx.strokeStyle = "#ff00ff", this.ctx.lineWidth = 2, this.ctx.beginPath(), this.ctx.moveTo(p, u), this.ctx.lineTo(p, u + d), this.ctx.stroke(), this.ctx.fillStyle = "#ff00ff", this.ctx.font = "bold 12px Arial";
      const T = `${e.toFixed(1)} Hz`, E = this.ctx.measureText(T).width;
      let C = p + 3;
      C + E > c + l - 5 && (C = p - E - 3), this.ctx.fillText(T, C, u + 15);
    }
    this.ctx.restore();
  }
  /**
   * Draw harmonic analysis information overlay
   * Displays debugging information about frequency estimation when FFT method is used
   * Position and size configurable via overlaysLayout
   */
  drawHarmonicAnalysis(t, e, i, r, o, h, n) {
    if (!this.debugOverlaysEnabled || !this.fftDisplayEnabled || t === void 0 && !e && !i && !h)
      return;
    const s = 16, f = (1 + // Title
    (t !== void 0 ? 1 : 0) + (e ? 1 : 0) + (i ? 1 : 0) + (h ? 2 : 0)) * s + 10, { x: c, y: u, width: l, height: d } = this.calculateOverlayDimensions(
      this.overlaysLayout.harmonicAnalysis,
      10,
      10,
      500,
      f
    );
    let w = u;
    if (this.ctx.save(), this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)", this.ctx.fillRect(c, u, l, d), this.ctx.strokeStyle = "#ffaa00", this.ctx.lineWidth = 2, this.ctx.strokeRect(c, u, l, d), this.ctx.fillStyle = "#ffaa00", this.ctx.font = "bold 12px monospace", w += 15, this.ctx.fillText("倍音分析 (Harmonic Analysis)", c + 5, w), t !== void 0 && n) {
      w += s, this.ctx.fillStyle = "#00ff00", this.ctx.font = "11px monospace";
      const y = n / 2;
      this.ctx.fillText(
        `1/2周波数 (${y.toFixed(1)}Hz) のpeak強度: ${t.toFixed(1)}%`,
        c + 5,
        w
      );
    }
    if (e && n) {
      w += s, this.ctx.fillStyle = "#ff00ff", this.ctx.font = "11px monospace";
      const y = e.map((p, T) => `${T + 1}x:${p.toFixed(2)}`).join(" "), x = r !== void 0 ? ` (重み付け: ${r.toFixed(1)})` : "";
      this.ctx.fillText(
        `候補1 (${n.toFixed(1)}Hz) 倍音: ${y}${x}`,
        c + 5,
        w
      );
    }
    if (i && n) {
      w += s, this.ctx.fillStyle = "#00aaff", this.ctx.font = "11px monospace";
      const y = n / 2, x = i.map((T, E) => `${E + 1}x:${T.toFixed(2)}`).join(" "), p = o !== void 0 ? ` (重み付け: ${o.toFixed(1)})` : "";
      this.ctx.fillText(
        `候補2 (${y.toFixed(1)}Hz) 倍音: ${x}${p}`,
        c + 5,
        w
      );
    }
    if (h) {
      w += s, this.ctx.fillStyle = "#aaaaaa", this.ctx.font = "10px monospace";
      const y = l - 10, x = h.split(" ");
      let p = "";
      for (const T of x) {
        const E = p + (p ? " " : "") + T;
        this.ctx.measureText(E).width > y && p ? (this.ctx.fillText(p, c + 5, w), w += s, p = T) : p = E;
      }
      p && this.ctx.fillText(p, c + 5, w);
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
    const { x: r, y: o, width: h, height: n } = this.calculateOverlayDimensions(
      this.overlaysLayout.frequencyPlot,
      this.canvas.width - 280 - 10,
      10,
      280,
      120
    );
    this.ctx.save(), this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)", this.ctx.fillRect(r, o, h, n), this.ctx.strokeStyle = "#ffaa00", this.ctx.lineWidth = 2, this.ctx.strokeRect(r, o, h, n), this.ctx.fillStyle = "#ffaa00", this.ctx.font = "bold 12px Arial", this.ctx.fillText(`周波数推移 (${t.length}frame)`, r + 5, o + 15);
    const s = r + 35, m = o + 25, f = h - 45, c = n - 45, u = t.filter((v) => v > 0);
    if (u.length === 0) {
      this.ctx.restore();
      return;
    }
    const l = Math.min(...u), d = Math.max(...u), w = (d - l) * this.FREQ_PLOT_RANGE_PADDING_RATIO || this.FREQ_PLOT_MIN_RANGE_PADDING_HZ, y = Math.max(e, l - w), x = Math.min(i, d + w);
    this.ctx.strokeStyle = "#333333", this.ctx.lineWidth = 1, this.ctx.beginPath();
    for (let v = 0; v <= 4; v++) {
      const S = m + c / 4 * v;
      this.ctx.moveTo(s, S), this.ctx.lineTo(s + f, S);
    }
    for (let v = 0; v <= 4; v++) {
      const S = s + f / 4 * v;
      this.ctx.moveTo(S, m), this.ctx.lineTo(S, m + c);
    }
    this.ctx.stroke(), this.ctx.fillStyle = "#aaaaaa", this.ctx.font = "10px monospace", this.ctx.textAlign = "right", this.ctx.textBaseline = "middle";
    for (let v = 0; v <= 4; v++) {
      const S = x - (x - y) * (v / 4), b = m + c / 4 * v, A = S >= 1e3 ? `${(S / 1e3).toFixed(1)}k` : `${S.toFixed(0)}`;
      this.ctx.fillText(A, s - 5, b);
    }
    this.ctx.fillStyle = "#88ccff", this.ctx.font = "9px monospace", this.ctx.textAlign = "right", this.ctx.textBaseline = "middle";
    for (let v = 0; v <= 4; v++) {
      const S = x - (x - y) * (v / 4), b = m + c / 4 * v, A = I(S);
      if (A) {
        const L = A.cents >= 0 ? "+" : "";
        this.ctx.fillText(`${L}${A.cents}¢`, s + f - 5, b);
      }
    }
    this.ctx.strokeStyle = "#00ff00", this.ctx.lineWidth = 2, this.ctx.beginPath();
    const p = f / Math.max(t.length - 1, 1), T = Math.max(1, Math.floor(t.length / 4)), E = (v) => {
      const b = (Math.max(y, Math.min(x, v)) - y) / (x - y);
      return m + c - b * c;
    };
    let C = !1;
    for (let v = 0; v < t.length; v++) {
      const S = t[v], b = s + v * p;
      if (S === 0) {
        C = !1;
        continue;
      }
      const A = E(S);
      C ? this.ctx.lineTo(b, A) : (this.ctx.moveTo(b, A), C = !0);
    }
    this.ctx.stroke(), this.ctx.font = "9px monospace", this.ctx.textAlign = "center", this.ctx.textBaseline = "top";
    for (let v = 0; v < t.length; v++) {
      const S = t[v], b = s + v * p;
      if (S !== 0) {
        const P = E(S);
        this.ctx.fillStyle = "#00ff00", this.ctx.beginPath(), this.ctx.arc(b, P, 2, 0, Math.PI * 2), this.ctx.fill();
      }
      const A = v === t.length - 1;
      if (v % T === 0 || A) {
        this.ctx.fillStyle = "#aaaaaa";
        const P = v - t.length + 1;
        this.ctx.fillText(`${P}`, b, m + c + 2);
      }
    }
    const M = t[t.length - 1];
    if (M > 0) {
      const v = I(M);
      this.ctx.fillStyle = "#00ff00", this.ctx.font = "bold 11px Arial", this.ctx.textAlign = "left", this.ctx.textBaseline = "bottom";
      let S = `${M.toFixed(1)} Hz`;
      if (v) {
        const b = v.cents >= 0 ? "+" : "";
        S += ` (${v.noteName} ${b}${v.cents}¢)`;
      }
      this.ctx.fillText(S, s + 2, m + c - 2);
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
   * @param debugInfo - Optional debug information for phase tracking
   */
  drawPhaseMarkers(t, e, i, r, o, h, n) {
    if (o === void 0 || h === void 0)
      return;
    const s = h - o;
    if (s <= 0)
      return;
    this.ctx.save();
    const m = (f, c, u) => {
      const l = f - o;
      if (l < 0 || l >= s)
        return;
      const d = l / s * this.canvas.width;
      this.ctx.strokeStyle = c, this.ctx.lineWidth = u, this.ctx.beginPath(), this.ctx.moveTo(d, 0), this.ctx.lineTo(d, this.canvas.height), this.ctx.stroke();
    };
    if (i !== void 0 && m(i, "#ff8800", 2), r !== void 0 && m(r, "#ff8800", 2), t !== void 0 && (m(t, "#ff0000", 2), this.debugOverlaysEnabled && (n == null ? void 0 : n.phaseZeroSegmentRelative) !== void 0)) {
      const c = (t - o) / s * this.canvas.width, u = 20;
      this.ctx.save(), this.ctx.fillStyle = "#ff0000", this.ctx.font = "12px monospace", this.ctx.textAlign = "left";
      const l = n.phaseZeroSegmentRelative, d = n.phaseZeroHistory ?? "?", w = n.phaseZeroTolerance ?? "?";
      [
        `Mode: ${n.zeroCrossModeName ?? "Unknown"}`,
        `Seg Rel: ${l}`,
        `History: ${d}`,
        `Tolerance: ±${w}`,
        `Range: ${typeof d == "number" && typeof w == "number" ? `${d - w}~${d + w}` : "?"}`
      ].forEach((p, T) => {
        this.ctx.fillText(p, c + 5, u + T * 14);
      }), this.ctx.restore();
    }
    e !== void 0 && m(e, "#ff0000", 2), this.ctx.restore();
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
  calculateOverlayDimensions(t, e, i, r, o) {
    if (!t)
      return { x: e, y: i, width: r, height: o };
    let h = e, n = i, s = r, m = o;
    if (t.position.x !== void 0)
      if (typeof t.position.x == "string" && t.position.x.startsWith("right-")) {
        const f = parseInt(t.position.x.substring(6), 10), c = typeof t.size.width == "string" && t.size.width.endsWith("%") ? F(t.size.width, this.canvas.width) : typeof t.size.width == "number" ? t.size.width : r;
        h = this.canvas.width - c - f;
      } else
        h = F(t.position.x, this.canvas.width);
    return t.position.y !== void 0 && (n = F(t.position.y, this.canvas.height)), t.size.width !== void 0 && t.size.width !== "auto" && (s = F(t.size.width, this.canvas.width)), t.size.height !== void 0 && t.size.height !== "auto" && (m = F(t.size.height, this.canvas.height)), { x: h, y: n, width: s, height: m };
  }
}
class Y {
  constructor() {
    a(this, "usePeakMode", !1);
    a(this, "zeroCrossMode", "hysteresis");
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
   * Set zero-cross detection mode
   * @param mode - Zero-cross detection algorithm to use
   */
  setZeroCrossMode(t) {
    this.zeroCrossMode = t;
  }
  /**
   * Get current zero-cross detection mode
   */
  getZeroCrossMode() {
    return this.zeroCrossMode;
  }
  /**
   * Reset state (e.g., when stopping)
   */
  reset() {
  }
}
class U {
  constructor() {
    a(this, "previousWaveform", null);
    a(this, "lastSimilarity", 0);
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
class Z {
  // Default scaling factor when peak is too small
  constructor(t, e, i, r) {
    a(this, "previousCanvas");
    a(this, "currentCanvas");
    a(this, "similarityCanvas");
    a(this, "bufferCanvas");
    a(this, "previousCtx");
    a(this, "currentCtx");
    a(this, "similarityCtx");
    a(this, "bufferCtx");
    // Auto-scaling constants
    a(this, "TARGET_FILL_RATIO", 0.9);
    // Target 90% of distance from center to edge (canvas half-height) for auto-scaled waveforms
    a(this, "MIN_PEAK_THRESHOLD", 1e-3);
    // Minimum peak to trigger auto-scaling (below this uses default)
    a(this, "DEFAULT_AMPLITUDE_RATIO", 0.4);
    this.previousCanvas = t, this.currentCanvas = e, this.similarityCanvas = i, this.bufferCanvas = r;
    const o = t.getContext("2d"), h = e.getContext("2d"), n = i.getContext("2d"), s = r.getContext("2d");
    if (!o || !h || !n || !s)
      throw new Error("Could not get 2D context for comparison canvases");
    this.previousCtx = o, this.currentCtx = h, this.similarityCtx = n, this.bufferCtx = s, this.clearAllCanvases();
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
    const o = Math.max(0, e), h = Math.min(t.length, i);
    for (let n = o; n < h; n++) {
      const s = Math.abs(t[n]);
      s > r && (r = s);
    }
    return r;
  }
  /**
   * Draw a waveform on a canvas with auto-scaling
   * Waveforms are automatically scaled so that peaks reach 90% of the distance
   * from the vertical center line to the top/bottom edge (i.e. 90% of half the height).
   * For example, if peak amplitude is 0.01, it will be scaled 90x relative to that center-to-edge range.
   */
  drawWaveform(t, e, i, r, o, h, n) {
    const s = h - o;
    if (s <= 0) return;
    const m = this.findPeakAmplitude(r, o, h);
    t.strokeStyle = n, t.lineWidth = 1.5, t.beginPath();
    const f = e / s, c = i / 2;
    let u;
    if (m > this.MIN_PEAK_THRESHOLD) {
      const l = this.TARGET_FILL_RATIO / m;
      u = i / 2 * l;
    } else
      u = i * this.DEFAULT_AMPLITUDE_RATIO;
    for (let l = 0; l < s; l++) {
      const d = o + l;
      if (d >= r.length) break;
      const w = r[d], y = c - w * u, x = Math.min(i, Math.max(0, y)), p = l * f;
      l === 0 ? t.moveTo(p, x) : t.lineTo(p, x);
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
    const o = 40, h = 25, n = i - 50, s = r - 35, m = -1, f = 1;
    e.strokeStyle = "#333333", e.lineWidth = 1, e.beginPath();
    for (let l = 0; l <= 4; l++) {
      const d = h + s / 4 * l;
      e.moveTo(o, d), e.lineTo(o + n, d);
    }
    for (let l = 0; l <= 4; l++) {
      const d = o + n / 4 * l;
      e.moveTo(d, h), e.lineTo(d, h + s);
    }
    e.stroke(), e.fillStyle = "#aaaaaa", e.font = "10px monospace", e.textAlign = "right", e.textBaseline = "middle";
    for (let l = 0; l <= 4; l++) {
      const d = f - (f - m) * (l / 4), w = h + s / 4 * l, y = d.toFixed(2);
      e.fillText(y, o - 5, w);
    }
    e.strokeStyle = "#00aaff", e.lineWidth = 2, e.beginPath();
    const c = n / Math.max(t.length - 1, 1);
    for (let l = 0; l < t.length; l++) {
      const d = t[l], w = o + l * c, x = (Math.max(m, Math.min(f, d)) - m) / (f - m), p = h + s - x * s;
      l === 0 ? e.moveTo(w, p) : e.lineTo(w, p);
    }
    e.stroke();
    const u = t[t.length - 1];
    e.fillStyle = "#00aaff", e.font = "bold 11px Arial", e.textAlign = "left", e.textBaseline = "bottom", e.fillText(`${u.toFixed(3)}`, o + 2, h + s - 2), e.restore();
  }
  /**
   * Draw vertical position markers
   */
  drawPositionMarkers(t, e, i, r, o, h) {
    if (h <= 0) return;
    const n = r / h * e, s = o / h * e;
    t.strokeStyle = "#ff0000", t.lineWidth = 2, t.beginPath(), t.moveTo(n, 0), t.lineTo(n, i), t.stroke(), t.beginPath(), t.moveTo(s, 0), t.lineTo(s, i), t.stroke(), t.fillStyle = "#ff0000", t.font = "10px Arial", t.fillText("S", n + 2, 12), t.fillText("E", s + 2, 12);
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
  updatePanels(t, e, i, r, o, h, n = []) {
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
    ), t && this.drawSimilarityText(h), n.length > 0 && this.drawSimilarityPlot(n), this.drawCenterLine(this.bufferCtx, this.bufferCanvas.width, this.bufferCanvas.height), this.drawWaveform(
      this.bufferCtx,
      this.bufferCanvas.width,
      this.bufferCanvas.height,
      o,
      0,
      o.length,
      "#888888"
    ), this.drawPositionMarkers(
      this.bufferCtx,
      this.bufferCanvas.width,
      this.bufferCanvas.height,
      i,
      r,
      o.length
    );
  }
  /**
   * Clear all panels (e.g., when stopped)
   */
  clear() {
    this.clearAllCanvases();
  }
}
class X {
  constructor(t, e, i) {
    a(this, "canvas8div");
    a(this, "canvas4div");
    a(this, "canvas2div");
    a(this, "ctx8div");
    a(this, "ctx4div");
    a(this, "ctx2div");
    this.canvas8div = t, this.canvas4div = e, this.canvas2div = i;
    const r = t.getContext("2d"), o = e.getContext("2d"), h = i.getContext("2d");
    if (!r || !o || !h)
      throw new Error("Could not get 2D context for cycle similarity canvases");
    this.ctx8div = r, this.ctx4div = o, this.ctx2div = h, this.clearAllCanvases();
  }
  /**
   * Clear all canvases
   */
  clearAllCanvases() {
    this.clearCanvas(this.ctx8div, this.canvas8div.width, this.canvas8div.height), this.clearCanvas(this.ctx4div, this.canvas4div.width, this.canvas4div.height), this.clearCanvas(this.ctx2div, this.canvas2div.width, this.canvas2div.height);
  }
  /**
   * Clear a single canvas
   */
  clearCanvas(t, e, i) {
    t.fillStyle = "#000000", t.fillRect(0, 0, e, i);
  }
  /**
   * Draw a similarity graph on a canvas
   * @param ctx Canvas context
   * @param width Canvas width
   * @param height Canvas height
   * @param similarities Array of similarity values (-1 to 1)
   * @param title Title text for the graph
   * @param segmentLabel Label for what each segment represents (e.g., "1/2 cycle")
   */
  drawSimilarityGraph(t, e, i, r, o, h) {
    if (t.save(), t.fillStyle = "#000000", t.fillRect(0, 0, e, i), t.strokeStyle = "#ff8800", t.lineWidth = 2, t.strokeRect(0, 0, e, i), t.fillStyle = "#ff8800", t.font = "bold 12px Arial", t.fillText(o, 5, 15), !r || r.length === 0) {
      t.fillStyle = "#666666", t.font = "11px Arial", t.fillText("データなし (No data)", e / 2 - 50, i / 2), t.restore();
      return;
    }
    const n = 35, s = 25, m = e - 45, f = i - 35, c = -1, u = 1;
    t.strokeStyle = "#333333", t.lineWidth = 1, t.beginPath();
    for (let y = 0; y <= 4; y++) {
      const x = s + f / 4 * y;
      t.moveTo(n, x), t.lineTo(n + m, x);
    }
    for (let y = 0; y <= r.length; y++) {
      const x = n + m / r.length * y;
      t.moveTo(x, s), t.lineTo(x, s + f);
    }
    t.stroke(), t.fillStyle = "#aaaaaa", t.font = "10px monospace", t.textAlign = "right", t.textBaseline = "middle";
    for (let y = 0; y <= 4; y++) {
      const x = u - (u - c) * (y / 4), p = s + f / 4 * y, T = x.toFixed(1);
      t.fillText(T, n - 5, p);
    }
    const l = m / r.length, d = l * 0.15;
    for (let y = 0; y < r.length; y++) {
      const x = r[y], p = Math.max(c, Math.min(u, x)), T = (p - c) / (u - c), E = s + f - T * f, C = s + f - (0 - c) / (u - c) * f, M = n + y * l + d, v = l - d * 2;
      x >= 0.9 ? t.fillStyle = "#00ff00" : x >= 0.7 ? t.fillStyle = "#88ff00" : x >= 0.5 ? t.fillStyle = "#ffaa00" : x >= 0 ? t.fillStyle = "#ff6600" : t.fillStyle = "#ff0000", E < C ? t.fillRect(M, E, v, C - E) : t.fillRect(M, C, v, E - C), t.fillStyle = "#ffffff", t.font = "9px monospace", t.textAlign = "center", p >= 0 ? (t.textBaseline = "bottom", t.fillText(x.toFixed(2), M + v / 2, E - 2)) : (t.textBaseline = "top", t.fillText(x.toFixed(2), M + v / 2, E + 2));
    }
    const w = s + f - (0 - c) / (u - c) * f;
    t.strokeStyle = "#666666", t.lineWidth = 1, t.beginPath(), t.moveTo(n, w), t.lineTo(n + m, w), t.stroke(), t.fillStyle = "#aaaaaa", t.font = "9px Arial", t.textAlign = "center", t.textBaseline = "top";
    for (let y = 0; y < r.length; y++) {
      const x = n + (y + 0.5) * l;
      t.fillText(`${y + 1}-${y + 2}`, x, s + f + 2);
    }
    t.fillStyle = "#aaaaaa", t.font = "10px Arial", t.textAlign = "center", t.fillText(h, n + m / 2, i - 3), t.restore();
  }
  /**
   * Update all cycle similarity graphs
   * @param similarities8div 8 divisions (1/2 cycle each): 7 similarity values
   * @param similarities4div 4 divisions (1 cycle each): 3 similarity values
   * @param similarities2div 2 divisions (2 cycles each): 1 similarity value
   */
  updateGraphs(t, e, i) {
    this.drawSimilarityGraph(
      this.ctx8div,
      this.canvas8div.width,
      this.canvas8div.height,
      t || [],
      "8分割 (1/2周期)",
      "連続する1/2周期間の類似度"
    ), this.drawSimilarityGraph(
      this.ctx4div,
      this.canvas4div.width,
      this.canvas4div.height,
      e || [],
      "4分割 (1周期)",
      "連続する1周期間の類似度"
    ), this.drawSimilarityGraph(
      this.ctx2div,
      this.canvas2div.width,
      this.canvas2div.height,
      i || [],
      "2分割 (2周期)",
      "連続する2周期間の類似度"
    );
  }
  /**
   * Clear all graphs
   */
  clear() {
    this.clearAllCanvases();
  }
}
const _ = class _ {
  constructor() {
    a(this, "cachedBasePath", null);
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
  getBasePath() {
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
      const r = window.location.pathname.split("/").filter((o) => o.length > 0);
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
          const o = new URL(i, window.location.href).pathname;
          for (const h of _.ASSET_PATTERNS) {
            const n = o.indexOf(h);
            if (n >= 0)
              return n === 0 ? "/" : o.substring(0, n) + "/";
          }
        } catch (r) {
          (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && console.debug("Failed to parse script URL:", i, r);
          continue;
        }
    }
    return "";
  }
};
// Asset directory patterns used for base path detection
a(_, "ASSET_PATTERNS", ["/assets/", "/js/", "/dist/"]);
let R = _;
class Q {
  constructor() {
    a(this, "wasmProcessor", null);
    a(this, "isInitialized", !1);
    a(this, "LOAD_TIMEOUT_MS", 1e4);
  }
  /**
   * Load WASM module dynamically
   * @param basePath - Base path for loading WASM files
   * @returns Promise that resolves when WASM is loaded and initialized
   */
  async loadWasmModule(t) {
    if (!(this.isInitialized && this.wasmProcessor)) {
      if (typeof window > "u" || window.location.protocol === "file:")
        throw new Error("WASM module not available in test/non-browser environment");
      return new Promise((e, i) => {
        if (window.wasmProcessor && window.wasmProcessor.WasmDataProcessor) {
          this.wasmProcessor = new window.wasmProcessor.WasmDataProcessor(), this.isInitialized = !0, e();
          return;
        }
        const r = setTimeout(() => {
          n(), i(new Error(`WASM module loading timed out after ${this.LOAD_TIMEOUT_MS / 1e3} seconds`));
        }, this.LOAD_TIMEOUT_MS), o = `${t}wasm/wasm_processor.js`, h = document.createElement("script");
        h.type = "module", h.textContent = `
        import init, { WasmDataProcessor } from '${o}';
        await init();
        window.wasmProcessor = { WasmDataProcessor };
        window.dispatchEvent(new Event('wasmLoaded'));
      `;
        const n = () => {
          clearTimeout(r), window.removeEventListener("wasmLoaded", s);
        }, s = () => {
          n(), window.wasmProcessor && window.wasmProcessor.WasmDataProcessor ? (this.wasmProcessor = new window.wasmProcessor.WasmDataProcessor(), this.isInitialized = !0, e()) : i(new Error("WASM module loaded but WasmDataProcessor not found"));
        };
        window.addEventListener("wasmLoaded", s), h.onerror = () => {
          n(), i(new Error("Failed to load WASM module script"));
        }, document.head.appendChild(h);
      });
    }
  }
  /**
   * Get the loaded WASM processor instance
   */
  getProcessor() {
    return this.wasmProcessor;
  }
  /**
   * Check if WASM module is initialized
   */
  isReady() {
    return this.isInitialized && this.wasmProcessor !== null;
  }
}
class V {
  constructor(t, e, i, r, o) {
    a(this, "audioManager");
    a(this, "gainController");
    a(this, "frequencyEstimator");
    a(this, "waveformSearcher");
    a(this, "zeroCrossDetector");
    a(this, "basePathResolver");
    a(this, "wasmLoader");
    this.audioManager = t, this.gainController = e, this.frequencyEstimator = i, this.waveformSearcher = r, this.zeroCrossDetector = o, this.basePathResolver = new R(), this.wasmLoader = new Q();
  }
  /**
   * Initialize the WASM module
   * Must be called before processFrame
   */
  async initialize() {
    if (!this.wasmLoader.isReady())
      try {
        const t = this.basePathResolver.getBasePath();
        await this.wasmLoader.loadWasmModule(t), this.syncConfigToWasm();
      } catch (t) {
        throw console.error("Failed to initialize WASM module:", t), t;
      }
  }
  /**
   * Sync TypeScript configuration to WASM processor
   */
  syncConfigToWasm() {
    const t = this.wasmLoader.getProcessor();
    t && (t.setAutoGain(this.gainController.getAutoGainEnabled()), t.setNoiseGate(this.gainController.getNoiseGateEnabled()), t.setNoiseGateThreshold(this.gainController.getNoiseGateThreshold()), t.setFrequencyEstimationMethod(this.frequencyEstimator.getFrequencyEstimationMethod()), t.setBufferSizeMultiplier(this.frequencyEstimator.getBufferSizeMultiplier()), t.setZeroCrossMode(this.zeroCrossDetector.getZeroCrossMode()));
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
    const e = this.wasmLoader.getProcessor();
    if (!this.wasmLoader.isReady() || !e)
      return console.warn("WASM processor not initialized"), null;
    if (!this.audioManager.isReady())
      return null;
    const i = this.audioManager.getTimeDomainData();
    if (!i)
      return null;
    const r = this.audioManager.getSampleRate(), o = this.audioManager.getFFTSize(), n = this.frequencyEstimator.getFrequencyEstimationMethod() === "fft" || t ? this.audioManager.getFrequencyData() : null;
    this.syncConfigToWasm();
    const s = e.processFrame(
      i,
      n,
      r,
      o,
      t
    );
    if (!s)
      return null;
    const m = {
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
      selectionReason: s.selectionReason,
      cycleSimilarities8div: s.cycleSimilarities8div ? Array.from(s.cycleSimilarities8div) : void 0,
      cycleSimilarities4div: s.cycleSimilarities4div ? Array.from(s.cycleSimilarities4div) : void 0,
      cycleSimilarities2div: s.cycleSimilarities2div ? Array.from(s.cycleSimilarities2div) : void 0
    };
    return this.syncResultsFromWasm(m), m;
  }
  /**
   * Reset the WASM processor state
   */
  reset() {
    const t = this.wasmLoader.getProcessor();
    t && t.reset();
  }
}
class J {
  // Log FPS every 60 frames (approx. 1 second at 60fps)
  /**
   * Create a new Oscilloscope instance
   * @param canvas - Main oscilloscope display canvas (recommended: 800x350px)
   * @param previousWaveformCanvas - Canvas for displaying previous frame's waveform (recommended: 250x120px)
   * @param currentWaveformCanvas - Canvas for displaying current frame's waveform (recommended: 250x120px)
   * @param similarityPlotCanvas - Canvas for displaying similarity history plot (recommended: 250x120px)
   * @param frameBufferCanvas - Canvas for displaying full frame buffer with position markers (recommended: 800x120px)
   * @param cycleSimilarity8divCanvas - Optional canvas for 8-division cycle similarity graph (recommended: 250x150px)
   * @param cycleSimilarity4divCanvas - Optional canvas for 4-division cycle similarity graph (recommended: 250x150px)
   * @param cycleSimilarity2divCanvas - Optional canvas for 2-division cycle similarity graph (recommended: 250x150px)
   * @param overlaysLayout - Optional layout configuration for debug overlays (FFT, harmonic analysis, frequency plot)
   */
  constructor(t, e, i, r, o, h, n, s, m) {
    a(this, "audioManager");
    a(this, "gainController");
    a(this, "frequencyEstimator");
    a(this, "renderer");
    a(this, "zeroCrossDetector");
    a(this, "waveformSearcher");
    a(this, "comparisonRenderer");
    a(this, "cycleSimilarityRenderer", null);
    a(this, "dataProcessor");
    a(this, "animationId", null);
    a(this, "isRunning", !1);
    a(this, "isPaused", !1);
    // Frame processing diagnostics
    a(this, "lastFrameTime", 0);
    a(this, "frameProcessingTimes", []);
    a(this, "MAX_FRAME_TIMES", 100);
    a(this, "TARGET_FRAME_TIME", 16.67);
    // 60fps target
    a(this, "FPS_LOG_INTERVAL_FRAMES", 60);
    this.audioManager = new N(), this.gainController = new q(), this.frequencyEstimator = new B(), this.renderer = new $(t, m), this.zeroCrossDetector = new Y(), this.waveformSearcher = new U(), this.comparisonRenderer = new Z(
      e,
      i,
      r,
      o
    ), h && n && s && (this.cycleSimilarityRenderer = new X(
      h,
      n,
      s
    )), this.dataProcessor = new V(
      this.audioManager,
      this.gainController,
      this.frequencyEstimator,
      this.waveformSearcher,
      this.zeroCrossDetector
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
    this.isRunning = !1, this.animationId !== null && (cancelAnimationFrame(this.animationId), this.animationId = null), await this.audioManager.stop(), this.frequencyEstimator.clearHistory(), this.zeroCrossDetector.reset(), this.waveformSearcher.reset(), this.comparisonRenderer.clear(), this.cycleSimilarityRenderer && this.cycleSimilarityRenderer.clear(), this.dataProcessor.reset();
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
      const o = 1e3 / (t - this.lastFrameTime);
      if (this.frameProcessingTimes.length === this.FPS_LOG_INTERVAL_FRAMES) {
        const h = this.frameProcessingTimes.reduce((n, s) => n + s, 0) / this.frameProcessingTimes.length;
        console.log(`FPS: ${o.toFixed(1)}, Avg frame time: ${h.toFixed(2)}ms`);
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
      t.displayEndIndex,
      {
        phaseZeroSegmentRelative: t.phaseZeroSegmentRelative,
        phaseZeroHistory: t.phaseZeroHistory,
        phaseZeroTolerance: t.phaseZeroTolerance,
        zeroCrossModeName: t.zeroCrossModeName
      }
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
    ), this.cycleSimilarityRenderer && this.cycleSimilarityRenderer.updateGraphs(
      t.cycleSimilarities8div,
      t.cycleSimilarities4div,
      t.cycleSimilarities2div
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
  setZeroCrossMode(t) {
    this.zeroCrossDetector.setZeroCrossMode(t);
  }
  getZeroCrossMode() {
    return this.zeroCrossDetector.getZeroCrossMode();
  }
  setPauseDrawing(t) {
    this.isPaused = t;
  }
  getPauseDrawing() {
    return this.isPaused;
  }
}
class tt {
  constructor(t) {
    a(this, "canvas");
    a(this, "ctx");
    // 周波数範囲 (50Hz～2000Hz)
    a(this, "MIN_FREQ", 50);
    a(this, "MAX_FREQ", 2e3);
    // ピアノ鍵盤の定数
    a(this, "WHITE_KEY_WIDTH", 20);
    a(this, "WHITE_KEY_HEIGHT", 60);
    a(this, "BLACK_KEY_WIDTH", 12);
    a(this, "BLACK_KEY_HEIGHT", 38);
    // 色定義
    a(this, "WHITE_KEY_COLOR", "#ffffff");
    a(this, "BLACK_KEY_COLOR", "#000000");
    a(this, "WHITE_KEY_HIGHLIGHT", "#00ff00");
    a(this, "BLACK_KEY_HIGHLIGHT", "#00cc00");
    a(this, "KEY_BORDER", "#333333");
    // 音名パターン定数（配列アロケーションを避けるため）
    // 白鍵: C(0), D(2), E(4), F(5), G(7), A(9), B(11)
    a(this, "WHITE_KEY_NOTES", [0, 2, 4, 5, 7, 9, 11]);
    // 黒鍵: C#(1), D#(3), F#(6), G#(8), A#(10)
    a(this, "BLACK_KEY_NOTES", [1, 3, 6, 8, 10]);
    // キャッシュされた鍵盤範囲（コンストラクタで一度だけ計算）
    a(this, "keyboardRange");
    // センタリング用のオフセット（コンストラクタで一度だけ計算）
    a(this, "xOffset");
    // 白鍵の総数（コンストラクタで一度だけ計算）
    a(this, "whiteKeyCount");
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
    const e = I(t);
    if (!e)
      return { note: -1, octave: -1, noteInOctave: -1 };
    const i = e.noteName.match(/^([A-G]#?)(\d+)$/);
    if (!i)
      return { note: -1, octave: -1, noteInOctave: -1 };
    const r = i[1], o = parseInt(i[2], 10), n = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].indexOf(r);
    return { note: o * 12 + n, octave: o, noteInOctave: n };
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
    for (let s = e.startNote; s <= e.endNote; s++) {
      const m = (s % 12 + 12) % 12;
      if (this.WHITE_KEY_NOTES.includes(m)) {
        const f = this.xOffset + r * this.WHITE_KEY_WIDTH, c = i && i.note === s;
        this.ctx.fillStyle = c ? this.WHITE_KEY_HIGHLIGHT : this.WHITE_KEY_COLOR, this.ctx.fillRect(f, 0, this.WHITE_KEY_WIDTH, this.WHITE_KEY_HEIGHT), this.ctx.strokeStyle = this.KEY_BORDER, this.ctx.lineWidth = 1, this.ctx.strokeRect(f, 0, this.WHITE_KEY_WIDTH, this.WHITE_KEY_HEIGHT), r++;
      }
    }
    r = 0;
    for (let s = e.startNote; s <= e.endNote; s++) {
      const m = (s % 12 + 12) % 12;
      if (this.WHITE_KEY_NOTES.includes(m) && r++, this.BLACK_KEY_NOTES.includes(m)) {
        const f = this.xOffset + r * this.WHITE_KEY_WIDTH - this.BLACK_KEY_WIDTH / 2, c = i && i.note === s;
        this.ctx.fillStyle = c ? this.BLACK_KEY_HIGHLIGHT : this.BLACK_KEY_COLOR, this.ctx.fillRect(f, 0, this.BLACK_KEY_WIDTH, this.BLACK_KEY_HEIGHT), this.ctx.strokeStyle = this.KEY_BORDER, this.ctx.lineWidth = 1, this.ctx.strokeRect(f, 0, this.BLACK_KEY_WIDTH, this.BLACK_KEY_HEIGHT);
      }
    }
    this.ctx.fillStyle = "#888888", this.ctx.font = "10px monospace", this.ctx.fillText(`${this.MIN_FREQ}Hz`, this.xOffset + 5, this.WHITE_KEY_HEIGHT - 5);
    const o = `${this.MAX_FREQ}Hz`, h = this.ctx.measureText(o).width, n = this.xOffset + this.whiteKeyCount * this.WHITE_KEY_WIDTH;
    this.ctx.fillText(o, n - h - 5, this.WHITE_KEY_HEIGHT - 5);
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
    a(this, "buffer");
    a(this, "sampleRate");
    a(this, "position", 0);
    a(this, "chunkSize", 4096);
    // Default FFT size
    a(this, "isLooping", !1);
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
      const i = this.chunkSize - e.length, r = Math.min(i, this.buffer.length), o = new Float32Array(this.chunkSize);
      return o.set(e, 0), o.set(this.buffer.slice(0, r), e.length), this.position = r, o;
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
  N as AudioManager,
  W as BufferSource,
  Z as ComparisonPanelRenderer,
  X as CycleSimilarityRenderer,
  K as DEFAULT_OVERLAYS_LAYOUT,
  B as FrequencyEstimator,
  q as GainController,
  J as Oscilloscope,
  tt as PianoKeyboardRenderer,
  V as WaveformDataProcessor,
  $ as WaveformRenderer,
  U as WaveformSearcher,
  Y as ZeroCrossDetector,
  O as amplitudeToDb,
  z as dbToAmplitude,
  F as resolveValue,
  D as trimSilence
};
//# sourceMappingURL=cat-oscilloscope.mjs.map
