var z = Object.defineProperty;
var D = (y, t, e) => t in y ? z(y, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : y[t] = e;
var s = (y, t, e) => D(y, typeof t != "symbol" ? t + "" : t, e);
function G(y) {
  return Math.pow(10, y / 20);
}
function N(y) {
  return y <= 0 ? -1 / 0 : 20 * Math.log10(y);
}
function H(y) {
  if (y <= 0 || !isFinite(y))
    return null;
  const e = 440 * Math.pow(2, -4.75), i = 12 * Math.log2(y / e), r = Math.round(i), o = Math.round((i - r) * 100), h = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"], a = Math.floor(r / 12);
  return {
    noteName: `${h[(r % 12 + 12) % 12]}${a}`,
    cents: o
  };
}
const q = -48;
function B(y) {
  const t = y.numberOfChannels, e = y.sampleRate, i = y.length, r = [];
  let o = 0;
  for (let d = 0; d < t; d++) {
    const g = y.getChannelData(d);
    r.push(g);
    for (let l = 0; l < i; l++) {
      const u = Math.abs(g[l]);
      u > o && (o = u);
    }
  }
  if (o === 0)
    return y;
  const h = o * Math.pow(10, q / 20);
  let a = i;
  for (let d = 0; d < i; d++) {
    let g = !0;
    for (let l = 0; l < t; l++)
      if (Math.abs(r[l][d]) > h) {
        g = !1;
        break;
      }
    if (!g) {
      a = d;
      break;
    }
  }
  if (a >= i)
    return y;
  let n = i - 1;
  for (let d = i - 1; d >= a; d--) {
    let g = !0;
    for (let l = 0; l < t; l++)
      if (Math.abs(r[l][d]) > h) {
        g = !1;
        break;
      }
    if (!g) {
      n = d;
      break;
    }
  }
  if (a === 0 && n === i - 1)
    return y;
  const f = n - a + 1, c = new AudioBuffer({
    numberOfChannels: t,
    length: f,
    sampleRate: e
  });
  for (let d = 0; d < t; d++) {
    const g = r[d], l = c.getChannelData(d);
    for (let u = 0; u < f; u++)
      l[u] = g[a + u];
  }
  return c;
}
class Y {
  constructor() {
    s(this, "audioContext", null);
    s(this, "analyser", null);
    s(this, "mediaStream", null);
    s(this, "audioBufferSource", null);
    s(this, "bufferSource", null);
    s(this, "dataArray", null);
    s(this, "frequencyData", null);
    s(this, "frameBufferHistory", []);
    // History of frame buffers for extended FFT
    s(this, "MAX_FRAME_HISTORY", 16);
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
      i = B(i), this.initializeAnalyser(), this.audioBufferSource = this.audioContext.createBufferSource(), this.audioBufferSource.buffer = i, this.audioBufferSource.loop = !0, this.audioBufferSource.connect(this.analyser), this.analyser.connect(this.audioContext.destination), this.audioBufferSource.start(0);
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
    const e = this.frameBufferHistory.slice(-t), i = e.reduce((h, a) => h + a.length, 0), r = new Float32Array(i);
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
class $ {
  constructor() {
    s(this, "autoGainEnabled", !0);
    s(this, "currentGain", 1);
    s(this, "noiseGateEnabled", !0);
    s(this, "noiseGateThreshold", G(-60));
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
class K {
  constructor() {
    s(this, "frequencyEstimationMethod", "fft");
    s(this, "estimatedFrequency", 0);
    s(this, "MIN_FREQUENCY_HZ", 20);
    // Minimum detectable frequency (Hz)
    s(this, "MAX_FREQUENCY_HZ", 5e3);
    // Maximum detectable frequency (Hz)
    s(this, "bufferSizeMultiplier", 16);
    // Buffer size multiplier for extended FFT
    s(this, "frequencyPlotHistory", []);
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
function F(y, t) {
  if (typeof y == "string" && y.endsWith("%")) {
    const e = parseFloat(y);
    return isNaN(e) ? (console.warn(`Invalid percentage value: ${y}, using 0`), 0) : e < 0 ? (console.warn(`Negative percentage value: ${y}, clamping to 0`), 0) : Math.floor(t * (e / 100));
  }
  if (typeof y == "string") {
    const e = parseInt(y, 10);
    return isNaN(e) ? (console.warn(`Invalid numeric string: ${y}, using 0`), 0) : Math.max(0, e);
  }
  return typeof y == "number" ? isNaN(y) ? (console.warn(`Invalid number value: ${y}, using 0`), 0) : Math.max(0, Math.floor(y)) : 0;
}
const Z = {
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
class O {
  constructor(t, e, i) {
    s(this, "ctx");
    s(this, "canvasWidth");
    s(this, "canvasHeight");
    this.ctx = t, this.canvasWidth = e, this.canvasHeight = i;
  }
  /**
   * Update canvas dimensions (call when canvas size changes)
   */
  updateDimensions(t, e) {
    this.canvasWidth = t, this.canvasHeight = e;
  }
  /**
   * Helper method to calculate overlay dimensions based on layout config
   */
  calculateOverlayDimensions(t, e, i, r, o) {
    if (!t)
      return { x: e, y: i, width: r, height: o };
    let h = e, a = i, n = r, f = o;
    if (t.position.x !== void 0)
      if (typeof t.position.x == "string" && t.position.x.startsWith("right-")) {
        const c = parseInt(t.position.x.substring(6), 10), d = t.size.width !== void 0 && t.size.width !== "auto" ? F(t.size.width, this.canvasWidth) : r;
        h = this.canvasWidth - d - c;
      } else
        h = F(t.position.x, this.canvasWidth);
    return t.position.y !== void 0 && (a = F(t.position.y, this.canvasHeight)), t.size.width !== void 0 && t.size.width !== "auto" && (n = F(t.size.width, this.canvasWidth)), t.size.height !== void 0 && t.size.height !== "auto" && (f = F(t.size.height, this.canvasHeight)), { x: h, y: a, width: n, height: f };
  }
}
class U {
  constructor(t, e, i) {
    s(this, "ctx");
    s(this, "canvasWidth");
    s(this, "canvasHeight");
    this.ctx = t, this.canvasWidth = e, this.canvasHeight = i;
  }
  /**
   * Update canvas dimensions (call when canvas size changes)
   */
  updateDimensions(t, e) {
    this.canvasWidth = t, this.canvasHeight = e;
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
      const a = this.canvasHeight / r * h;
      this.ctx.moveTo(0, a), this.ctx.lineTo(this.canvasWidth, a);
    }
    const o = 10;
    for (let h = 0; h <= o; h++) {
      const a = this.canvasWidth / o * h;
      this.ctx.moveTo(a, 0), this.ctx.lineTo(a, this.canvasHeight);
    }
    this.ctx.stroke(), this.ctx.strokeStyle = "#444444", this.ctx.lineWidth = 1, this.ctx.beginPath(), this.ctx.moveTo(0, this.canvasHeight / 2), this.ctx.lineTo(this.canvasWidth, this.canvasHeight / 2), this.ctx.stroke(), t && t > 0 && e && e > 0 && i !== void 0 && i > 0 && this.drawGridLabels(t, e, i);
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
    for (let c = 0; c <= o; c++) {
      const d = this.canvasWidth / o * c, g = h * c;
      let l;
      g >= 1e3 ? l = `${(g / 1e3).toFixed(2)}s` : g >= 1 ? l = `${g.toFixed(1)}ms` : l = `${(g * 1e3).toFixed(0)}μs`;
      const u = this.ctx.measureText(l).width, w = Math.max(2, Math.min(d - u / 2, this.canvasWidth - u - 2));
      this.ctx.fillText(l, w, this.canvasHeight - 3);
    }
    const a = 5, f = 1 / (a / 2 * i);
    for (let c = 0; c <= a; c++) {
      const d = this.canvasHeight / a * c, l = (a / 2 - c) * f;
      let u;
      if (l === 0)
        u = "0dB*";
      else {
        const w = N(Math.abs(l)), m = l > 0 ? "+" : "-", x = Math.abs(w);
        x >= 100 ? u = `${m}${x.toFixed(0)}dB` : u = `${m}${x.toFixed(1)}dB`;
      }
      this.ctx.fillText(u, 3, d + 10);
    }
    this.ctx.restore();
  }
}
class X {
  constructor(t, e, i) {
    s(this, "ctx");
    s(this, "canvasWidth");
    s(this, "canvasHeight");
    this.ctx = t, this.canvasWidth = e, this.canvasHeight = i;
  }
  /**
   * Update canvas dimensions (call when canvas size changes)
   */
  updateDimensions(t, e) {
    this.canvasWidth = t, this.canvasHeight = e;
  }
  /**
   * Draw waveform
   */
  drawWaveform(t, e, i, r) {
    const o = i - e;
    if (o <= 0) return;
    this.ctx.strokeStyle = "#00ff00", this.ctx.lineWidth = 2, this.ctx.beginPath();
    const h = this.canvasWidth / o, a = this.canvasHeight / 2, f = this.canvasHeight / 2 * r;
    for (let c = 0; c < o; c++) {
      const d = e + c, g = t[d], l = a - g * f, u = Math.min(this.canvasHeight, Math.max(0, l)), w = c * h;
      c === 0 ? this.ctx.moveTo(w, u) : this.ctx.lineTo(w, u);
    }
    this.ctx.stroke();
  }
}
class Q extends O {
  constructor() {
    super(...arguments);
    s(this, "FFT_OVERLAY_HEIGHT_RATIO", 0.9);
    // Spectrum bar height ratio within overlay (90%)
    s(this, "FFT_MIN_BAR_WIDTH", 1);
  }
  // Minimum bar width in pixels
  /**
   * Draw FFT spectrum overlay (position and size configurable via layout)
   */
  drawFFTOverlay(e, i, r, o, h, a) {
    const n = r / o, f = Math.floor(this.canvasWidth * 0.35), c = Math.floor(this.canvasHeight * 0.35), d = 10, g = this.canvasHeight - c - 10, { x: l, y: u, width: w, height: m } = this.calculateOverlayDimensions(
      a,
      d,
      g,
      f,
      c
    );
    this.ctx.save(), this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)", this.ctx.fillRect(l, u, w, m), this.ctx.strokeStyle = "#00aaff", this.ctx.lineWidth = 2, this.ctx.strokeRect(l, u, w, m);
    const x = Math.min(
      e.length,
      Math.ceil(h / n)
    ), p = w / x;
    this.ctx.fillStyle = "#00aaff";
    for (let T = 0; T < x; T++) {
      const b = e[T] / 255 * m * this.FFT_OVERLAY_HEIGHT_RATIO, A = l + T * p, C = u + m - b;
      this.ctx.fillRect(A, C, Math.max(p - 1, this.FFT_MIN_BAR_WIDTH), b);
    }
    if (i > 0 && i <= h) {
      const T = i / n, S = l + T * p;
      this.ctx.strokeStyle = "#ff00ff", this.ctx.lineWidth = 2, this.ctx.beginPath(), this.ctx.moveTo(S, u), this.ctx.lineTo(S, u + m), this.ctx.stroke(), this.ctx.fillStyle = "#ff00ff", this.ctx.font = "bold 12px Arial";
      const b = `${i.toFixed(1)} Hz`, A = this.ctx.measureText(b).width;
      let C = S + 3;
      C + A > l + w - 5 && (C = S - A - 3), this.ctx.fillText(b, C, u + 15);
    }
    this.ctx.restore();
  }
}
class V extends O {
  /**
   * Draw harmonic analysis information overlay
   * Displays debugging information about frequency estimation when FFT method is used
   * Position and size configurable via layout
   */
  drawHarmonicAnalysis(t, e, i, r, o, h, a, n) {
    if (t === void 0 && !e && !i && !h)
      return;
    const f = 16, d = (1 + // Title
    (t !== void 0 ? 1 : 0) + (e ? 1 : 0) + (i ? 1 : 0) + (h ? 2 : 0)) * f + 10, { x: g, y: l, width: u, height: w } = this.calculateOverlayDimensions(
      n,
      10,
      10,
      500,
      d
    );
    let m = l;
    if (this.ctx.save(), this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)", this.ctx.fillRect(g, l, u, w), this.ctx.strokeStyle = "#ffaa00", this.ctx.lineWidth = 2, this.ctx.strokeRect(g, l, u, w), this.ctx.fillStyle = "#ffaa00", this.ctx.font = "bold 12px monospace", m += 15, this.ctx.fillText("倍音分析 (Harmonic Analysis)", g + 5, m), t !== void 0 && a) {
      m += f, this.ctx.fillStyle = "#00ff00", this.ctx.font = "11px monospace";
      const x = a / 2;
      this.ctx.fillText(
        `1/2周波数 (${x.toFixed(1)}Hz) のpeak強度: ${t.toFixed(1)}%`,
        g + 5,
        m
      );
    }
    if (e && a) {
      m += f, this.ctx.fillStyle = "#ff00ff", this.ctx.font = "11px monospace";
      const x = e.map((T, S) => `${S + 1}x:${T.toFixed(2)}`).join(" "), p = r !== void 0 ? ` (重み付け: ${r.toFixed(1)})` : "";
      this.ctx.fillText(
        `候補1 (${a.toFixed(1)}Hz) 倍音: ${x}${p}`,
        g + 5,
        m
      );
    }
    if (i && a) {
      m += f, this.ctx.fillStyle = "#00aaff", this.ctx.font = "11px monospace";
      const x = a / 2, p = i.map((S, b) => `${b + 1}x:${S.toFixed(2)}`).join(" "), T = o !== void 0 ? ` (重み付け: ${o.toFixed(1)})` : "";
      this.ctx.fillText(
        `候補2 (${x.toFixed(1)}Hz) 倍音: ${p}${T}`,
        g + 5,
        m
      );
    }
    if (h) {
      m += f, this.ctx.fillStyle = "#aaaaaa", this.ctx.font = "10px monospace";
      const x = u - 10, p = h.split(" ");
      let T = "";
      for (const S of p) {
        const b = T + (T ? " " : "") + S;
        this.ctx.measureText(b).width > x && T ? (this.ctx.fillText(T, g + 5, m), m += f, T = S) : T = b;
      }
      T && this.ctx.fillText(T, g + 5, m);
    }
    this.ctx.restore();
  }
}
class j extends O {
  constructor() {
    super(...arguments);
    s(this, "FREQ_PLOT_MIN_RANGE_PADDING_HZ", 50);
    // 周波数範囲の最小パディング (Hz)
    s(this, "FREQ_PLOT_RANGE_PADDING_RATIO", 0.1);
  }
  // 周波数範囲のパディング比率 (10%)
  /**
   * Draw frequency plot overlay
   * Position and size configurable via layout
   * Displays frequency history to detect frequency spikes
   * One data point is added per frame
   */
  drawFrequencyPlot(e, i, r, o) {
    if (!e || e.length === 0)
      return;
    const { x: h, y: a, width: n, height: f } = this.calculateOverlayDimensions(
      o,
      this.canvasWidth - 280 - 10,
      10,
      280,
      120
    );
    this.ctx.save(), this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)", this.ctx.fillRect(h, a, n, f), this.ctx.strokeStyle = "#ffaa00", this.ctx.lineWidth = 2, this.ctx.strokeRect(h, a, n, f), this.ctx.fillStyle = "#ffaa00", this.ctx.font = "bold 12px Arial", this.ctx.fillText(`周波数推移 (${e.length}frame)`, h + 5, a + 15);
    const c = h + 35, d = a + 25, g = n - 45, l = f - 45, u = e.filter((v) => v > 0);
    if (u.length === 0) {
      this.ctx.restore();
      return;
    }
    const w = Math.min(...u), m = Math.max(...u), x = (m - w) * this.FREQ_PLOT_RANGE_PADDING_RATIO || this.FREQ_PLOT_MIN_RANGE_PADDING_HZ, p = Math.max(i, w - x), T = Math.min(r, m + x);
    this.ctx.strokeStyle = "#333333", this.ctx.lineWidth = 1, this.ctx.beginPath();
    for (let v = 0; v <= 4; v++) {
      const E = d + l / 4 * v;
      this.ctx.moveTo(c, E), this.ctx.lineTo(c + g, E);
    }
    for (let v = 0; v <= 4; v++) {
      const E = c + g / 4 * v;
      this.ctx.moveTo(E, d), this.ctx.lineTo(E, d + l);
    }
    this.ctx.stroke(), this.ctx.fillStyle = "#aaaaaa", this.ctx.font = "10px monospace", this.ctx.textAlign = "right", this.ctx.textBaseline = "middle";
    for (let v = 0; v <= 4; v++) {
      const E = T - (T - p) * (v / 4), M = d + l / 4 * v, P = E >= 1e3 ? `${(E / 1e3).toFixed(1)}k` : `${E.toFixed(0)}`;
      this.ctx.fillText(P, c - 5, M);
    }
    this.ctx.fillStyle = "#88ccff", this.ctx.font = "9px monospace", this.ctx.textAlign = "right", this.ctx.textBaseline = "middle";
    for (let v = 0; v <= 4; v++) {
      const E = T - (T - p) * (v / 4), M = d + l / 4 * v, P = H(E);
      if (P) {
        const L = P.cents >= 0 ? "+" : "";
        this.ctx.fillText(`${L}${P.cents}¢`, c + g - 5, M);
      }
    }
    this.ctx.strokeStyle = "#00ff00", this.ctx.lineWidth = 2, this.ctx.beginPath();
    const S = g / Math.max(e.length - 1, 1), b = Math.max(1, Math.floor(e.length / 4)), A = (v) => {
      const M = (Math.max(p, Math.min(T, v)) - p) / (T - p);
      return d + l - M * l;
    };
    let C = !1;
    for (let v = 0; v < e.length; v++) {
      const E = e[v], M = c + v * S;
      if (E === 0) {
        C = !1;
        continue;
      }
      const P = A(E);
      C ? this.ctx.lineTo(M, P) : (this.ctx.moveTo(M, P), C = !0);
    }
    this.ctx.stroke(), this.ctx.font = "9px monospace", this.ctx.textAlign = "center", this.ctx.textBaseline = "top";
    for (let v = 0; v < e.length; v++) {
      const E = e[v], M = c + v * S;
      if (E !== 0) {
        const _ = A(E);
        this.ctx.fillStyle = "#00ff00", this.ctx.beginPath(), this.ctx.arc(M, _, 2, 0, Math.PI * 2), this.ctx.fill();
      }
      const P = v === e.length - 1;
      if (v % b === 0 || P) {
        this.ctx.fillStyle = "#aaaaaa";
        const _ = v - e.length + 1;
        this.ctx.fillText(`${_}`, M, d + l + 2);
      }
    }
    const R = e[e.length - 1];
    if (R > 0) {
      const v = H(R);
      this.ctx.fillStyle = "#00ff00", this.ctx.font = "bold 11px Arial", this.ctx.textAlign = "left", this.ctx.textBaseline = "bottom";
      let E = `${R.toFixed(1)} Hz`;
      if (v) {
        const M = v.cents >= 0 ? "+" : "";
        E += ` (${v.noteName} ${M}${v.cents}¢)`;
      }
      this.ctx.fillText(E, c + 2, d + l - 2);
    }
    this.ctx.restore();
  }
}
class J {
  constructor(t, e, i, r = !0) {
    s(this, "ctx");
    s(this, "canvasWidth");
    s(this, "canvasHeight");
    s(this, "debugOverlaysEnabled");
    this.ctx = t, this.canvasWidth = e, this.canvasHeight = i, this.debugOverlaysEnabled = r;
  }
  /**
   * Update canvas dimensions (call when canvas size changes)
   */
  updateDimensions(t, e) {
    this.canvasWidth = t, this.canvasHeight = e;
  }
  /**
   * Set debug overlays enabled state
   */
  setDebugOverlaysEnabled(t) {
    this.debugOverlaysEnabled = t;
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
  drawPhaseMarkers(t, e, i, r, o, h, a) {
    if (o === void 0 || h === void 0)
      return;
    const n = h - o;
    if (n <= 0)
      return;
    this.ctx.save();
    const f = (c, d, g) => {
      const l = c - o;
      if (l < 0 || l >= n)
        return;
      const u = l / n * this.canvasWidth;
      this.ctx.strokeStyle = d, this.ctx.lineWidth = g, this.ctx.beginPath(), this.ctx.moveTo(u, 0), this.ctx.lineTo(u, this.canvasHeight), this.ctx.stroke();
    };
    if (i !== void 0 && f(i, "#ff8800", 2), r !== void 0 && f(r, "#ff8800", 2), t !== void 0 && (f(t, "#ff0000", 2), this.debugOverlaysEnabled && (a == null ? void 0 : a.phaseZeroSegmentRelative) !== void 0)) {
      const d = (t - o) / n * this.canvasWidth, g = 20;
      this.ctx.save(), this.ctx.fillStyle = "#ff0000", this.ctx.font = "12px monospace", this.ctx.textAlign = "left";
      const l = a.phaseZeroSegmentRelative, u = a.phaseZeroHistory ?? "?", w = a.phaseZeroTolerance ?? "?";
      [
        `Mode: ${a.zeroCrossModeName ?? "Unknown"}`,
        `Seg Rel: ${l}`,
        `History: ${u}`,
        `Tolerance: ±${w}`,
        `Range: ${typeof u == "number" && typeof w == "number" ? `${u - w}~${u + w}` : "?"}`
      ].forEach((p, T) => {
        this.ctx.fillText(p, d + 5, g + T * 14);
      }), this.ctx.restore();
    }
    e !== void 0 && f(e, "#ff0000", 2), this.ctx.restore();
  }
}
class tt {
  constructor(t, e) {
    s(this, "canvas");
    s(this, "ctx");
    s(this, "fftDisplayEnabled", !0);
    s(this, "harmonicAnalysisEnabled", !1);
    // Control harmonic analysis overlay independently
    s(this, "debugOverlaysEnabled", !0);
    // Control debug overlays (harmonic analysis, frequency plot)
    s(this, "overlaysLayout");
    // Layout configuration for overlays
    // Specialized renderers
    s(this, "gridRenderer");
    s(this, "waveformLineRenderer");
    s(this, "fftOverlayRenderer");
    s(this, "harmonicAnalysisRenderer");
    s(this, "frequencyPlotRenderer");
    s(this, "phaseMarkerRenderer");
    this.canvas = t;
    const i = t.getContext("2d");
    if (!i)
      throw new Error("Could not get 2D context");
    this.ctx = i, this.overlaysLayout = e || Z, this.gridRenderer = new U(this.ctx, t.width, t.height), this.waveformLineRenderer = new X(this.ctx, t.width, t.height), this.fftOverlayRenderer = new Q(this.ctx, t.width, t.height), this.harmonicAnalysisRenderer = new V(this.ctx, t.width, t.height), this.frequencyPlotRenderer = new j(this.ctx, t.width, t.height), this.phaseMarkerRenderer = new J(this.ctx, t.width, t.height, this.debugOverlaysEnabled), t.width === 300 && t.height === 150 && console.warn(
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
    this.updateRendererDimensions(), this.ctx.fillStyle = "#000000", this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height), this.gridRenderer.drawGrid(t, e, i);
  }
  /**
   * Update all renderer dimensions (call when canvas size changes)
   */
  updateRendererDimensions() {
    const t = this.canvas.width, e = this.canvas.height;
    this.gridRenderer.updateDimensions(t, e), this.waveformLineRenderer.updateDimensions(t, e), this.fftOverlayRenderer.updateDimensions(t, e), this.harmonicAnalysisRenderer.updateDimensions(t, e), this.frequencyPlotRenderer.updateDimensions(t, e), this.phaseMarkerRenderer.updateDimensions(t, e);
  }
  /**
   * Draw waveform
   */
  drawWaveform(t, e, i, r) {
    this.updateRendererDimensions(), this.waveformLineRenderer.drawWaveform(t, e, i, r);
  }
  /**
   * Draw FFT spectrum overlay (position and size configurable via overlaysLayout)
   */
  drawFFTOverlay(t, e, i, r, o) {
    this.fftDisplayEnabled && (this.updateRendererDimensions(), this.fftOverlayRenderer.drawFFTOverlay(
      t,
      e,
      i,
      r,
      o,
      this.overlaysLayout.fftOverlay
    ));
  }
  /**
   * Draw harmonic analysis information overlay
   * Displays debugging information about frequency estimation when FFT method is used
   * Position and size configurable via overlaysLayout
   */
  drawHarmonicAnalysis(t, e, i, r, o, h, a) {
    this.harmonicAnalysisEnabled && this.debugOverlaysEnabled && this.fftDisplayEnabled && (this.updateRendererDimensions(), this.harmonicAnalysisRenderer.drawHarmonicAnalysis(
      t,
      e,
      i,
      r,
      o,
      h,
      a,
      this.overlaysLayout.harmonicAnalysis
    ));
  }
  /**
   * Draw frequency plot overlay
   * Position and size configurable via overlaysLayout
   * Displays frequency history to detect frequency spikes
   * One data point is added per frame
   */
  drawFrequencyPlot(t, e, i) {
    this.debugOverlaysEnabled && (this.updateRendererDimensions(), this.frequencyPlotRenderer.drawFrequencyPlot(
      t,
      e,
      i,
      this.overlaysLayout.frequencyPlot
    ));
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
  drawPhaseMarkers(t, e, i, r, o, h, a) {
    this.updateRendererDimensions(), this.phaseMarkerRenderer.drawPhaseMarkers(
      t,
      e,
      i,
      r,
      o,
      h,
      a
    );
  }
  // Getters and setters
  setFFTDisplay(t) {
    this.fftDisplayEnabled = t;
  }
  getFFTDisplayEnabled() {
    return this.fftDisplayEnabled;
  }
  /**
   * Enable or disable harmonic analysis overlay
   * When disabled, the yellow-bordered harmonic analysis panel is hidden
   * @param enabled - true to show harmonic analysis overlay, false to hide it
   */
  setHarmonicAnalysisEnabled(t) {
    this.harmonicAnalysisEnabled = t;
  }
  /**
   * Get the current state of harmonic analysis overlay
   * @returns true if harmonic analysis overlay is enabled, false otherwise
   */
  getHarmonicAnalysisEnabled() {
    return this.harmonicAnalysisEnabled;
  }
  /**
   * Enable or disable debug overlays (harmonic analysis, frequency plot)
   * When disabled, yellow-bordered debug information panels are hidden
   * Recommended: Set to false when using as a library for cleaner display
   * @param enabled - true to show debug overlays, false to hide them
   */
  setDebugOverlaysEnabled(t) {
    this.debugOverlaysEnabled = t, this.phaseMarkerRenderer.setDebugOverlaysEnabled(t);
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
}
class et {
  constructor() {
    s(this, "usePeakMode", !1);
    s(this, "zeroCrossMode", "hysteresis");
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
class it {
  constructor() {
    s(this, "previousWaveform", null);
    s(this, "lastSimilarity", 0);
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
class st {
  // Default scaling factor when peak is too small
  constructor(t, e, i, r) {
    s(this, "previousCanvas");
    s(this, "currentCanvas");
    s(this, "similarityCanvas");
    s(this, "bufferCanvas");
    s(this, "previousCtx");
    s(this, "currentCtx");
    s(this, "similarityCtx");
    s(this, "bufferCtx");
    // Auto-scaling constants
    s(this, "TARGET_FILL_RATIO", 0.9);
    // Target 90% of distance from center to edge (canvas half-height) for auto-scaled waveforms
    s(this, "MIN_PEAK_THRESHOLD", 1e-3);
    // Minimum peak to trigger auto-scaling (below this uses default)
    s(this, "DEFAULT_AMPLITUDE_RATIO", 0.4);
    this.previousCanvas = t, this.currentCanvas = e, this.similarityCanvas = i, this.bufferCanvas = r;
    const o = t.getContext("2d"), h = e.getContext("2d"), a = i.getContext("2d"), n = r.getContext("2d");
    if (!o || !h || !a || !n)
      throw new Error("Could not get 2D context for comparison canvases");
    this.previousCtx = o, this.currentCtx = h, this.similarityCtx = a, this.bufferCtx = n, this.clearAllCanvases();
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
    for (let a = o; a < h; a++) {
      const n = Math.abs(t[a]);
      n > r && (r = n);
    }
    return r;
  }
  /**
   * Draw a waveform on a canvas with auto-scaling
   * Waveforms are automatically scaled so that peaks reach 90% of the distance
   * from the vertical center line to the top/bottom edge (i.e. 90% of half the height).
   * For example, if peak amplitude is 0.01, it will be scaled 90x relative to that center-to-edge range.
   */
  drawWaveform(t, e, i, r, o, h, a) {
    const n = h - o;
    if (n <= 0) return;
    const f = this.findPeakAmplitude(r, o, h);
    t.strokeStyle = a, t.lineWidth = 1.5, t.beginPath();
    const c = e / n, d = i / 2;
    let g;
    if (f > this.MIN_PEAK_THRESHOLD) {
      const l = this.TARGET_FILL_RATIO / f;
      g = i / 2 * l;
    } else
      g = i * this.DEFAULT_AMPLITUDE_RATIO;
    for (let l = 0; l < n; l++) {
      const u = o + l;
      if (u >= r.length) break;
      const w = r[u], m = d - w * g, x = Math.min(i, Math.max(0, m)), p = l * c;
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
    const o = 40, h = 25, a = i - 50, n = r - 35, f = -1, c = 1;
    e.strokeStyle = "#333333", e.lineWidth = 1, e.beginPath();
    for (let l = 0; l <= 4; l++) {
      const u = h + n / 4 * l;
      e.moveTo(o, u), e.lineTo(o + a, u);
    }
    for (let l = 0; l <= 4; l++) {
      const u = o + a / 4 * l;
      e.moveTo(u, h), e.lineTo(u, h + n);
    }
    e.stroke(), e.fillStyle = "#aaaaaa", e.font = "10px monospace", e.textAlign = "right", e.textBaseline = "middle";
    for (let l = 0; l <= 4; l++) {
      const u = c - (c - f) * (l / 4), w = h + n / 4 * l, m = u.toFixed(2);
      e.fillText(m, o - 5, w);
    }
    e.strokeStyle = "#00aaff", e.lineWidth = 2, e.beginPath();
    const d = a / Math.max(t.length - 1, 1);
    for (let l = 0; l < t.length; l++) {
      const u = t[l], w = o + l * d, x = (Math.max(f, Math.min(c, u)) - f) / (c - f), p = h + n - x * n;
      l === 0 ? e.moveTo(w, p) : e.lineTo(w, p);
    }
    e.stroke();
    const g = t[t.length - 1];
    e.fillStyle = "#00aaff", e.font = "bold 11px Arial", e.textAlign = "left", e.textBaseline = "bottom", e.fillText(`${g.toFixed(3)}`, o + 2, h + n - 2), e.restore();
  }
  /**
   * Draw vertical position markers
   */
  drawPositionMarkers(t, e, i, r, o, h) {
    if (h <= 0) return;
    const a = r / h * e, n = o / h * e;
    t.strokeStyle = "#ff0000", t.lineWidth = 2, t.beginPath(), t.moveTo(a, 0), t.lineTo(a, i), t.stroke(), t.beginPath(), t.moveTo(n, 0), t.lineTo(n, i), t.stroke(), t.fillStyle = "#ff0000", t.font = "10px Arial", t.fillText("S", a + 2, 12), t.fillText("E", n + 2, 12);
  }
  /**
   * Draw phase marker offset overlay graphs on current waveform canvas
   * Displays two line graphs showing the relative offset progression of phase markers
   * @param phaseZeroOffsetHistory - Array of relative offset percentages for phase zero (start red line)
   * @param phaseTwoPiOffsetHistory - Array of relative offset percentages for phase 2π (end red line)
   */
  drawOffsetOverlayGraphs(t = [], e = []) {
    if (t.length === 0 && e.length === 0)
      return;
    const i = this.currentCtx, r = this.currentCanvas.width, o = this.currentCanvas.height;
    i.save();
    const h = Math.min(120, r * 0.4), a = Math.min(60, o * 0.4), n = r - h - 5, f = 5;
    i.fillStyle = "rgba(0, 0, 0, 0.7)", i.fillRect(n, f, h, a), i.strokeStyle = "#00aaff", i.lineWidth = 1, i.strokeRect(n, f, h, a), i.fillStyle = "#00aaff", i.font = "9px Arial", i.fillText("Offset %", n + 2, f + 9);
    const c = 2, d = n + c, g = f + 12, l = h - c * 2, u = a - 12 - c, w = 0, m = 100, x = (p, T) => {
      if (p.length < 2) return;
      i.strokeStyle = T, i.lineWidth = 1.5, i.beginPath();
      const S = l / Math.max(p.length - 1, 1);
      for (let b = 0; b < p.length; b++) {
        const A = p[b], C = d + b * S, v = (Math.max(w, Math.min(m, A)) - w) / (m - w), E = g + u - v * u;
        b === 0 ? i.moveTo(C, E) : i.lineTo(C, E);
      }
      i.stroke();
    };
    if (x(t, "#ff0000"), x(e, "#ff8800"), i.font = "8px monospace", i.textAlign = "left", t.length > 0) {
      const p = t[t.length - 1];
      i.fillStyle = "#ff0000", i.fillText(`S:${p.toFixed(1)}%`, n + 2, f + a - 11);
    }
    if (e.length > 0) {
      const p = e[e.length - 1];
      i.fillStyle = "#ff8800", i.fillText(`E:${p.toFixed(1)}%`, n + 2, f + a - 2);
    }
    i.restore();
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
   * @param phaseZeroOffsetHistory - Array of relative offset percentages for phase zero marker (issue #236)
   * @param phaseTwoPiOffsetHistory - Array of relative offset percentages for phase 2π marker (issue #236)
   */
  updatePanels(t, e, i, r, o, h, a = [], n = [], f = []) {
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
    ), t && this.drawSimilarityText(h), this.drawOffsetOverlayGraphs(n, f), a.length > 0 && this.drawSimilarityPlot(a), this.drawCenterLine(this.bufferCtx, this.bufferCanvas.width, this.bufferCanvas.height), this.drawWaveform(
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
class rt {
  constructor(t, e, i) {
    s(this, "canvas8div");
    s(this, "canvas4div");
    s(this, "canvas2div");
    s(this, "ctx8div");
    s(this, "ctx4div");
    s(this, "ctx2div");
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
    const a = 35, n = 25, f = e - 45, c = i - 35, d = -1, g = 1;
    t.strokeStyle = "#333333", t.lineWidth = 1, t.beginPath();
    for (let m = 0; m <= 4; m++) {
      const x = n + c / 4 * m;
      t.moveTo(a, x), t.lineTo(a + f, x);
    }
    for (let m = 0; m <= r.length; m++) {
      const x = a + f / r.length * m;
      t.moveTo(x, n), t.lineTo(x, n + c);
    }
    t.stroke(), t.fillStyle = "#aaaaaa", t.font = "10px monospace", t.textAlign = "right", t.textBaseline = "middle";
    for (let m = 0; m <= 4; m++) {
      const x = g - (g - d) * (m / 4), p = n + c / 4 * m, T = x.toFixed(1);
      t.fillText(T, a - 5, p);
    }
    const l = f / r.length, u = l * 0.15;
    for (let m = 0; m < r.length; m++) {
      const x = r[m], p = Math.max(d, Math.min(g, x)), T = (p - d) / (g - d), S = n + c - T * c, b = n + c - (0 - d) / (g - d) * c, A = a + m * l + u, C = l - u * 2;
      x >= 0.9 ? t.fillStyle = "#00ff00" : x >= 0.7 ? t.fillStyle = "#88ff00" : x >= 0.5 ? t.fillStyle = "#ffaa00" : x >= 0 ? t.fillStyle = "#ff6600" : t.fillStyle = "#ff0000", S < b ? t.fillRect(A, S, C, b - S) : t.fillRect(A, b, C, S - b), t.fillStyle = "#ffffff", t.font = "9px monospace", t.textAlign = "center", p >= 0 ? (t.textBaseline = "bottom", t.fillText(x.toFixed(2), A + C / 2, S - 2)) : (t.textBaseline = "top", t.fillText(x.toFixed(2), A + C / 2, S + 2));
    }
    const w = n + c - (0 - d) / (g - d) * c;
    t.strokeStyle = "#666666", t.lineWidth = 1, t.beginPath(), t.moveTo(a, w), t.lineTo(a + f, w), t.stroke(), t.fillStyle = "#aaaaaa", t.font = "9px Arial", t.textAlign = "center", t.textBaseline = "top";
    for (let m = 0; m < r.length; m++) {
      const x = a + (m + 0.5) * l;
      t.fillText(`${m + 1}-${m + 2}`, x, n + c + 2);
    }
    t.fillStyle = "#aaaaaa", t.font = "10px Arial", t.textAlign = "center", t.fillText(h, a + f / 2, i - 3), t.restore();
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
const I = class I {
  constructor() {
    s(this, "cachedBasePath", null);
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
          for (const h of I.ASSET_PATTERNS) {
            const a = o.indexOf(h);
            if (a >= 0)
              return a === 0 ? "/" : o.substring(0, a) + "/";
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
s(I, "ASSET_PATTERNS", ["/assets/", "/js/", "/dist/"]);
let W = I;
class nt {
  constructor() {
    s(this, "wasmProcessor", null);
    s(this, "isInitialized", !1);
    s(this, "LOAD_TIMEOUT_MS", 1e4);
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
          a(), i(new Error(`WASM module loading timed out after ${this.LOAD_TIMEOUT_MS / 1e3} seconds`));
        }, this.LOAD_TIMEOUT_MS), o = `${t}wasm/wasm_processor.js`, h = document.createElement("script");
        h.type = "module", h.textContent = `
        import init, { WasmDataProcessor } from '${o}';
        await init();
        window.wasmProcessor = { WasmDataProcessor };
        window.dispatchEvent(new Event('wasmLoaded'));
      `;
        const a = () => {
          clearTimeout(r), window.removeEventListener("wasmLoaded", n);
        }, n = () => {
          a(), window.wasmProcessor && window.wasmProcessor.WasmDataProcessor ? (this.wasmProcessor = new window.wasmProcessor.WasmDataProcessor(), this.isInitialized = !0, e()) : i(new Error("WASM module loaded but WasmDataProcessor not found"));
        };
        window.addEventListener("wasmLoaded", n), h.onerror = () => {
          a(), i(new Error("Failed to load WASM module script"));
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
class at {
  // Keep last 100 frames of offset data
  constructor(t, e, i, r, o) {
    s(this, "audioManager");
    s(this, "gainController");
    s(this, "frequencyEstimator");
    s(this, "waveformSearcher");
    s(this, "zeroCrossDetector");
    s(this, "basePathResolver");
    s(this, "wasmLoader");
    // Phase marker offset history for overlay graphs (issue #236)
    s(this, "phaseZeroOffsetHistory", []);
    s(this, "phaseTwoPiOffsetHistory", []);
    s(this, "MAX_OFFSET_HISTORY", 100);
    this.audioManager = t, this.gainController = e, this.frequencyEstimator = i, this.waveformSearcher = r, this.zeroCrossDetector = o, this.basePathResolver = new W(), this.wasmLoader = new nt();
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
    const r = this.audioManager.getSampleRate(), o = this.audioManager.getFFTSize(), a = this.frequencyEstimator.getFrequencyEstimationMethod() === "fft" || t ? this.audioManager.getFrequencyData() : null;
    this.syncConfigToWasm();
    const n = e.processFrame(
      i,
      a,
      r,
      o,
      t
    );
    if (!n)
      return null;
    const f = {
      waveformData: new Float32Array(n.waveform_data),
      displayStartIndex: n.displayStartIndex,
      displayEndIndex: n.displayEndIndex,
      gain: n.gain,
      estimatedFrequency: n.estimatedFrequency,
      frequencyPlotHistory: n.frequencyPlotHistory ? Array.from(n.frequencyPlotHistory) : [],
      sampleRate: n.sampleRate,
      fftSize: n.fftSize,
      frequencyData: n.frequencyData ? new Uint8Array(n.frequencyData) : void 0,
      isSignalAboveNoiseGate: n.isSignalAboveNoiseGate,
      maxFrequency: n.maxFrequency,
      previousWaveform: n.previousWaveform ? new Float32Array(n.previousWaveform) : null,
      similarity: n.similarity,
      similarityPlotHistory: n.similarityPlotHistory ? Array.from(n.similarityPlotHistory) : [],
      usedSimilaritySearch: n.usedSimilaritySearch,
      phaseZeroIndex: n.phaseZeroIndex,
      phaseTwoPiIndex: n.phaseTwoPiIndex,
      phaseMinusQuarterPiIndex: n.phaseMinusQuarterPiIndex,
      phaseTwoPiPlusQuarterPiIndex: n.phaseTwoPiPlusQuarterPiIndex,
      halfFreqPeakStrengthPercent: n.halfFreqPeakStrengthPercent,
      candidate1Harmonics: n.candidate1Harmonics ? Array.from(n.candidate1Harmonics) : void 0,
      candidate2Harmonics: n.candidate2Harmonics ? Array.from(n.candidate2Harmonics) : void 0,
      selectionReason: n.selectionReason,
      cycleSimilarities8div: n.cycleSimilarities8div ? Array.from(n.cycleSimilarities8div) : void 0,
      cycleSimilarities4div: n.cycleSimilarities4div ? Array.from(n.cycleSimilarities4div) : void 0,
      cycleSimilarities2div: n.cycleSimilarities2div ? Array.from(n.cycleSimilarities2div) : void 0
    };
    return this.updatePhaseOffsetHistory(f), f.phaseZeroOffsetHistory = [...this.phaseZeroOffsetHistory], f.phaseTwoPiOffsetHistory = [...this.phaseTwoPiOffsetHistory], this.syncResultsFromWasm(f), f;
  }
  /**
   * Calculate relative offset percentages for phase markers and update history
   * @param renderData - Render data containing phase indices
   */
  updatePhaseOffsetHistory(t) {
    if (t.displayStartIndex === void 0 || t.displayEndIndex === void 0)
      return;
    const e = t.displayEndIndex - t.displayStartIndex;
    if (!(e <= 0)) {
      if (t.phaseZeroIndex !== void 0) {
        const r = (t.phaseZeroIndex - t.displayStartIndex) / e * 100;
        this.phaseZeroOffsetHistory.push(r), this.phaseZeroOffsetHistory.length > this.MAX_OFFSET_HISTORY && this.phaseZeroOffsetHistory.shift();
      }
      if (t.phaseTwoPiIndex !== void 0) {
        const r = (t.phaseTwoPiIndex - t.displayStartIndex) / e * 100;
        this.phaseTwoPiOffsetHistory.push(r), this.phaseTwoPiOffsetHistory.length > this.MAX_OFFSET_HISTORY && this.phaseTwoPiOffsetHistory.shift();
      }
    }
  }
  /**
   * Reset the WASM processor state
   */
  reset() {
    const t = this.wasmLoader.getProcessor();
    t && t.reset(), this.phaseZeroOffsetHistory = [], this.phaseTwoPiOffsetHistory = [];
  }
}
class ht {
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
  constructor(t, e, i, r, o, h, a, n, f) {
    s(this, "audioManager");
    s(this, "gainController");
    s(this, "frequencyEstimator");
    s(this, "renderer");
    s(this, "zeroCrossDetector");
    s(this, "waveformSearcher");
    s(this, "comparisonRenderer");
    s(this, "cycleSimilarityRenderer", null);
    s(this, "dataProcessor");
    s(this, "animationId", null);
    s(this, "isRunning", !1);
    s(this, "isPaused", !1);
    s(this, "phaseMarkerRangeEnabled", !0);
    // Default: on
    // Frame processing diagnostics
    s(this, "lastFrameTime", 0);
    s(this, "frameProcessingTimes", []);
    s(this, "MAX_FRAME_TIMES", 100);
    s(this, "TARGET_FRAME_TIME", 16.67);
    // 60fps target
    s(this, "FPS_LOG_INTERVAL_FRAMES", 60);
    this.audioManager = new Y(), this.gainController = new $(), this.frequencyEstimator = new K(), this.renderer = new tt(t, f), this.zeroCrossDetector = new et(), this.waveformSearcher = new it(), this.comparisonRenderer = new st(
      e,
      i,
      r,
      o
    ), h && a && n && (this.cycleSimilarityRenderer = new rt(
      h,
      a,
      n
    )), this.dataProcessor = new at(
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
        const h = this.frameProcessingTimes.reduce((a, n) => a + n, 0) / this.frameProcessingTimes.length;
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
    let e = t.displayStartIndex, i = t.displayEndIndex;
    this.phaseMarkerRangeEnabled && t.phaseMinusQuarterPiIndex !== void 0 && t.phaseTwoPiPlusQuarterPiIndex !== void 0 && t.phaseMinusQuarterPiIndex <= t.phaseTwoPiPlusQuarterPiIndex && (e = t.phaseMinusQuarterPiIndex, i = t.phaseTwoPiPlusQuarterPiIndex);
    const r = i - e;
    this.renderer.clearAndDrawGrid(
      t.sampleRate,
      r,
      t.gain
    ), this.renderer.drawWaveform(
      t.waveformData,
      e,
      i,
      t.gain
    ), this.renderer.drawPhaseMarkers(
      t.phaseZeroIndex,
      t.phaseTwoPiIndex,
      t.phaseMinusQuarterPiIndex,
      t.phaseTwoPiPlusQuarterPiIndex,
      e,
      i,
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
      t.similarityPlotHistory,
      t.phaseZeroOffsetHistory,
      t.phaseTwoPiOffsetHistory
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
   * Enable or disable harmonic analysis overlay
   * When disabled, the yellow-bordered harmonic analysis panel in the top-left corner is hidden
   * @param enabled - true to show harmonic analysis overlay, false to hide it
   */
  setHarmonicAnalysisEnabled(t) {
    this.renderer.setHarmonicAnalysisEnabled(t);
  }
  /**
   * Get the current state of harmonic analysis overlay
   * @returns true if harmonic analysis overlay is enabled, false otherwise
   */
  getHarmonicAnalysisEnabled() {
    return this.renderer.getHarmonicAnalysisEnabled();
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
  /**
   * Enable or disable phase marker range display mode
   * When enabled (default), displays only the range between orange-red-red-orange markers
   * When disabled, displays the full waveform segment
   * @param enabled - true to display only phase marker range, false to display full segment
   */
  setPhaseMarkerRangeEnabled(t) {
    this.phaseMarkerRangeEnabled = t;
  }
  /**
   * Get the current state of phase marker range display mode
   * @returns true if phase marker range display is enabled, false otherwise
   */
  getPhaseMarkerRangeEnabled() {
    return this.phaseMarkerRangeEnabled;
  }
}
class lt {
  constructor(t) {
    s(this, "canvas");
    s(this, "ctx");
    // 周波数範囲 (50Hz～2000Hz)
    s(this, "MIN_FREQ", 50);
    s(this, "MAX_FREQ", 2e3);
    // ピアノ鍵盤の定数
    s(this, "WHITE_KEY_WIDTH", 20);
    s(this, "WHITE_KEY_HEIGHT", 60);
    s(this, "BLACK_KEY_WIDTH", 12);
    s(this, "BLACK_KEY_HEIGHT", 38);
    // 色定義
    s(this, "WHITE_KEY_COLOR", "#ffffff");
    s(this, "BLACK_KEY_COLOR", "#000000");
    s(this, "WHITE_KEY_HIGHLIGHT", "#00ff00");
    s(this, "BLACK_KEY_HIGHLIGHT", "#00cc00");
    s(this, "KEY_BORDER", "#333333");
    // 音名パターン定数（配列アロケーションを避けるため）
    // 白鍵: C(0), D(2), E(4), F(5), G(7), A(9), B(11)
    s(this, "WHITE_KEY_NOTES", [0, 2, 4, 5, 7, 9, 11]);
    // 黒鍵: C#(1), D#(3), F#(6), G#(8), A#(10)
    s(this, "BLACK_KEY_NOTES", [1, 3, 6, 8, 10]);
    // キャッシュされた鍵盤範囲（コンストラクタで一度だけ計算）
    s(this, "keyboardRange");
    // センタリング用のオフセット（コンストラクタで一度だけ計算）
    s(this, "xOffset");
    // 白鍵の総数（コンストラクタで一度だけ計算）
    s(this, "whiteKeyCount");
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
    const e = H(t);
    if (!e)
      return { note: -1, octave: -1, noteInOctave: -1 };
    const i = e.noteName.match(/^([A-G]#?)(\d+)$/);
    if (!i)
      return { note: -1, octave: -1, noteInOctave: -1 };
    const r = i[1], o = parseInt(i[2], 10), a = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].indexOf(r);
    return { note: o * 12 + a, octave: o, noteInOctave: a };
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
    for (let n = e.startNote; n <= e.endNote; n++) {
      const f = (n % 12 + 12) % 12;
      if (this.WHITE_KEY_NOTES.includes(f)) {
        const c = this.xOffset + r * this.WHITE_KEY_WIDTH, d = i && i.note === n;
        this.ctx.fillStyle = d ? this.WHITE_KEY_HIGHLIGHT : this.WHITE_KEY_COLOR, this.ctx.fillRect(c, 0, this.WHITE_KEY_WIDTH, this.WHITE_KEY_HEIGHT), this.ctx.strokeStyle = this.KEY_BORDER, this.ctx.lineWidth = 1, this.ctx.strokeRect(c, 0, this.WHITE_KEY_WIDTH, this.WHITE_KEY_HEIGHT), r++;
      }
    }
    r = 0;
    for (let n = e.startNote; n <= e.endNote; n++) {
      const f = (n % 12 + 12) % 12;
      if (this.WHITE_KEY_NOTES.includes(f) && r++, this.BLACK_KEY_NOTES.includes(f)) {
        const c = this.xOffset + r * this.WHITE_KEY_WIDTH - this.BLACK_KEY_WIDTH / 2, d = i && i.note === n;
        this.ctx.fillStyle = d ? this.BLACK_KEY_HIGHLIGHT : this.BLACK_KEY_COLOR, this.ctx.fillRect(c, 0, this.BLACK_KEY_WIDTH, this.BLACK_KEY_HEIGHT), this.ctx.strokeStyle = this.KEY_BORDER, this.ctx.lineWidth = 1, this.ctx.strokeRect(c, 0, this.BLACK_KEY_WIDTH, this.BLACK_KEY_HEIGHT);
      }
    }
    this.ctx.fillStyle = "#888888", this.ctx.font = "10px monospace", this.ctx.fillText(`${this.MIN_FREQ}Hz`, this.xOffset + 5, this.WHITE_KEY_HEIGHT - 5);
    const o = `${this.MAX_FREQ}Hz`, h = this.ctx.measureText(o).width, a = this.xOffset + this.whiteKeyCount * this.WHITE_KEY_WIDTH;
    this.ctx.fillText(o, a - h - 5, this.WHITE_KEY_HEIGHT - 5);
  }
  /**
   * キャンバスをクリア
   */
  clear() {
    this.ctx.fillStyle = "#1a1a1a", this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
class k {
  /**
   * Create a BufferSource from Float32Array
   * @param buffer - Audio data as Float32Array (values typically in range -1.0 to 1.0)
   * @param sampleRate - Sample rate in Hz (e.g., 44100, 48000)
   * @param options - Optional configuration
   */
  constructor(t, e, i) {
    s(this, "buffer");
    s(this, "sampleRate");
    s(this, "position", 0);
    s(this, "chunkSize", 4096);
    // Default FFT size
    s(this, "isLooping", !1);
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
    return new k(r, t.sampleRate, {
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
  Y as AudioManager,
  k as BufferSource,
  st as ComparisonPanelRenderer,
  rt as CycleSimilarityRenderer,
  Z as DEFAULT_OVERLAYS_LAYOUT,
  K as FrequencyEstimator,
  $ as GainController,
  ht as Oscilloscope,
  lt as PianoKeyboardRenderer,
  at as WaveformDataProcessor,
  tt as WaveformRenderer,
  it as WaveformSearcher,
  et as ZeroCrossDetector,
  N as amplitudeToDb,
  G as dbToAmplitude,
  F as resolveValue,
  B as trimSilence
};
//# sourceMappingURL=cat-oscilloscope.mjs.map
