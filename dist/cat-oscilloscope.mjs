var G = Object.defineProperty;
var z = (y, e, t) => e in y ? G(y, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : y[e] = t;
var n = (y, e, t) => z(y, typeof e != "symbol" ? e + "" : e, t);
function q(y) {
  return Math.pow(10, y / 20);
}
function B(y) {
  return y <= 0 ? -1 / 0 : 20 * Math.log10(y);
}
function O(y) {
  if (y <= 0 || !isFinite(y))
    return null;
  const t = 440 * Math.pow(2, -4.75), i = 12 * Math.log2(y / t), s = Math.round(i), o = Math.round((i - s) * 100), a = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"], r = Math.floor(s / 12);
  return {
    noteName: `${a[(s % 12 + 12) % 12]}${r}`,
    cents: o
  };
}
const Y = -48;
function $(y) {
  const e = y.numberOfChannels, t = y.sampleRate, i = y.length, s = [];
  let o = 0;
  for (let u = 0; u < e; u++) {
    const m = y.getChannelData(u);
    s.push(m);
    for (let d = 0; d < i; d++) {
      const g = Math.abs(m[d]);
      g > o && (o = g);
    }
  }
  if (o === 0)
    return y;
  const a = o * Math.pow(10, Y / 20);
  let r = i;
  for (let u = 0; u < i; u++) {
    let m = !0;
    for (let d = 0; d < e; d++)
      if (Math.abs(s[d][u]) > a) {
        m = !1;
        break;
      }
    if (!m) {
      r = u;
      break;
    }
  }
  if (r >= i)
    return y;
  let h = i - 1;
  for (let u = i - 1; u >= r; u--) {
    let m = !0;
    for (let d = 0; d < e; d++)
      if (Math.abs(s[d][u]) > a) {
        m = !1;
        break;
      }
    if (!m) {
      h = u;
      break;
    }
  }
  if (r === 0 && h === i - 1)
    return y;
  const f = h - r + 1, c = new AudioBuffer({
    numberOfChannels: e,
    length: f,
    sampleRate: t
  });
  for (let u = 0; u < e; u++) {
    const m = s[u], d = c.getChannelData(u);
    for (let g = 0; g < f; g++)
      d[g] = m[r + g];
  }
  return c;
}
class K {
  constructor() {
    n(this, "frameBufferHistory", []);
    n(this, "MAX_FRAME_HISTORY", 16);
    // Support up to 16x buffer size
    n(this, "extendedBufferCache", /* @__PURE__ */ new Map());
  }
  // Cache for reused extended buffers
  /**
   * Update frame buffer history with the current frame
   * Reuses existing buffers to avoid allocating a new Float32Array every frame
   */
  updateHistory(e) {
    let t;
    this.frameBufferHistory.length < this.MAX_FRAME_HISTORY ? t = new Float32Array(e.length) : (t = this.frameBufferHistory.shift(), t.length !== e.length && (t = new Float32Array(e.length))), t.set(e), this.frameBufferHistory.push(t);
  }
  /**
   * Get extended time-domain data by concatenating past frame buffers
   * Reuses cached buffers to avoid allocation on every call
   * @param multiplier - Buffer size multiplier (1, 4, or 16)
   * @param currentBuffer - Current frame buffer for 1x multiplier
   * @returns Combined buffer or null if insufficient history
   */
  getExtendedBuffer(e, t) {
    if (e === 1)
      return t;
    if (!t || this.frameBufferHistory.length < e)
      return null;
    const i = this.frameBufferHistory.slice(-e), s = i.reduce((r, h) => r + h.length, 0);
    let o = this.extendedBufferCache.get(e);
    (!o || o.length !== s) && (o = new Float32Array(s), this.extendedBufferCache.set(e, o));
    let a = 0;
    for (const r of i)
      o.set(r, a), a += r.length;
    return o;
  }
  /**
   * Clear frame buffer history
   */
  clear() {
    this.frameBufferHistory = [], this.extendedBufferCache.clear();
  }
}
class Z {
  constructor() {
    n(this, "audioContext", null);
    n(this, "analyser", null);
    n(this, "mediaStream", null);
    n(this, "audioBufferSource", null);
    n(this, "bufferSource", null);
    n(this, "dataArray", null);
    n(this, "frequencyData", null);
    n(this, "frameBufferHistory", new K());
  }
  /**
   * Initialize analyser node and data arrays
   */
  initializeAnalyser() {
    if (!this.audioContext)
      throw new Error("AudioContext must be initialized before creating analyser");
    this.analyser = this.audioContext.createAnalyser(), this.analyser.fftSize = 4096, this.analyser.smoothingTimeConstant = 0;
    const e = this.analyser.fftSize;
    this.dataArray = new Float32Array(e), this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
  }
  /**
   * Start audio capture and analysis
   */
  async start() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: !0 }), this.audioContext = new AudioContext();
      const e = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.initializeAnalyser(), e.connect(this.analyser);
    } catch (e) {
      throw console.error("Error accessing microphone:", e), e;
    }
  }
  /**
   * Start audio playback from file
   */
  async startFromFile(e) {
    try {
      const t = await e.arrayBuffer();
      this.audioContext && this.audioContext.state !== "closed" && await this.audioContext.close(), this.audioContext = new AudioContext();
      let i = await this.audioContext.decodeAudioData(t);
      i = $(i), this.initializeAnalyser(), this.audioBufferSource = this.audioContext.createBufferSource(), this.audioBufferSource.buffer = i, this.audioBufferSource.loop = !0, this.audioBufferSource.connect(this.analyser), this.analyser.connect(this.audioContext.destination), this.audioBufferSource.start(0);
    } catch (t) {
      throw console.error("Error loading audio file:", t), t;
    }
  }
  /**
   * Start visualization from a static buffer without audio playback
   * Uses the same Web Audio API architecture as startFromFile for consistent performance
   * @param bufferSource - BufferSource instance containing audio data
   */
  async startFromBuffer(e) {
    try {
      this.audioContext && this.audioContext.state !== "closed" && await this.audioContext.close(), this.audioContext = new AudioContext(), e.reset(), e.setChunkSize(4096);
      const i = e.getSampleRate(), s = e.getLength(), o = this.audioContext.createBuffer(1, s, i), a = o.getChannelData(0);
      let r = 0;
      for (; r < s; ) {
        const h = e.getNextChunk();
        if (!h) break;
        const f = s - r;
        h.length <= f ? (a.set(h, r), r += h.length) : (a.set(h.subarray(0, f), r), r += f);
      }
      this.initializeAnalyser(), this.audioBufferSource = this.audioContext.createBufferSource(), this.audioBufferSource.buffer = o, this.audioBufferSource.loop = !0, this.audioBufferSource.connect(this.analyser), this.audioBufferSource.start(0);
    } catch (t) {
      throw console.error("Error starting from buffer:", t), t;
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
    if (this.mediaStream && (this.mediaStream.getTracks().forEach((e) => e.stop()), this.mediaStream = null), this.audioContext) {
      try {
        await this.audioContext.close();
      } catch (e) {
        console.error("Error closing AudioContext:", e);
      }
      this.audioContext = null;
    }
    this.analyser = null, this.dataArray = null, this.frequencyData = null, this.frameBufferHistory.clear();
  }
  /**
   * Get time-domain data (waveform)
   * Also updates the frame buffer history for extended FFT
   */
  getTimeDomainData() {
    return !this.analyser || !this.dataArray ? null : (this.analyser.getFloatTimeDomainData(this.dataArray), this.frameBufferHistory.updateHistory(this.dataArray), this.dataArray);
  }
  /**
   * Get extended time-domain data by concatenating past frame buffers
   * @param multiplier - Buffer size multiplier (1, 4, or 16)
   * @returns Combined buffer or null if insufficient history
   */
  getExtendedTimeDomainData(e) {
    return this.frameBufferHistory.getExtendedBuffer(e, this.dataArray);
  }
  /**
   * Get frequency-domain data (FFT)
   * Both file and buffer modes now use AnalyserNode
   */
  getFrequencyData() {
    return !this.analyser || !this.frequencyData ? null : (this.analyser.getByteFrequencyData(this.frequencyData), this.frequencyData);
  }
  /**
   * Get sample rate
   */
  getSampleRate() {
    var e;
    return ((e = this.audioContext) == null ? void 0 : e.sampleRate) || 0;
  }
  /**
   * Get FFT size
   */
  getFFTSize() {
    var e;
    return this.bufferSource ? 4096 : ((e = this.analyser) == null ? void 0 : e.fftSize) || 0;
  }
  /**
   * Get frequency bin count
   */
  getFrequencyBinCount() {
    var e;
    return this.bufferSource ? 2048 : ((e = this.analyser) == null ? void 0 : e.frequencyBinCount) || 0;
  }
  /**
   * Check if audio system is ready
   */
  isReady() {
    return this.bufferSource ? this.dataArray !== null : this.audioContext !== null && this.analyser !== null;
  }
}
class Q {
  constructor() {
    n(this, "autoGainEnabled", !0);
    n(this, "currentGain", 1);
    n(this, "noiseGateEnabled", !0);
    n(this, "noiseGateThreshold", q(-60));
  }
  // Default threshold (-60dB)
  setAutoGain(e) {
    this.autoGainEnabled = e;
  }
  getAutoGainEnabled() {
    return this.autoGainEnabled;
  }
  setNoiseGate(e) {
    this.noiseGateEnabled = e;
  }
  getNoiseGateEnabled() {
    return this.noiseGateEnabled;
  }
  setNoiseGateThreshold(e) {
    this.noiseGateThreshold = Math.min(Math.max(e, 0), 1);
  }
  getNoiseGateThreshold() {
    return this.noiseGateThreshold;
  }
  getCurrentGain() {
    return this.currentGain;
  }
}
class X {
  constructor() {
    // Default to FFT as both file and buffer modes now use AnalyserNode
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
  setFrequencyEstimationMethod(e) {
    this.frequencyEstimationMethod !== e && (this.frequencyEstimationMethod = e, this.frequencyPlotHistory = []);
  }
  getFrequencyEstimationMethod() {
    return this.frequencyEstimationMethod;
  }
  setBufferSizeMultiplier(e) {
    this.bufferSizeMultiplier = e;
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
function I(y, e) {
  if (typeof y == "string" && y.endsWith("%")) {
    const t = parseFloat(y);
    return isNaN(t) ? (console.warn(`Invalid percentage value: ${y}, using 0`), 0) : t < 0 ? (console.warn(`Negative percentage value: ${y}, clamping to 0`), 0) : Math.floor(e * (t / 100));
  }
  if (typeof y == "string") {
    const t = parseInt(y, 10);
    return isNaN(t) ? (console.warn(`Invalid numeric string: ${y}, using 0`), 0) : Math.max(0, t);
  }
  return typeof y == "number" ? isNaN(y) ? (console.warn(`Invalid number value: ${y}, using 0`), 0) : Math.max(0, Math.floor(y)) : 0;
}
const U = {
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
class k {
  constructor(e, t, i) {
    n(this, "ctx");
    n(this, "canvasWidth");
    n(this, "canvasHeight");
    this.ctx = e, this.canvasWidth = t, this.canvasHeight = i;
  }
  /**
   * Update canvas dimensions (call when canvas size changes)
   */
  updateDimensions(e, t) {
    this.canvasWidth = e, this.canvasHeight = t;
  }
  /**
   * Helper method to calculate overlay dimensions based on layout config
   */
  calculateOverlayDimensions(e, t, i, s, o) {
    if (!e)
      return { x: t, y: i, width: s, height: o };
    let a = t, r = i, h = s, f = o;
    if (e.position.x !== void 0)
      if (typeof e.position.x == "string" && e.position.x.startsWith("right-")) {
        const c = parseInt(e.position.x.substring(6), 10), u = e.size.width !== void 0 && e.size.width !== "auto" ? I(e.size.width, this.canvasWidth) : s;
        a = this.canvasWidth - u - c;
      } else
        a = I(e.position.x, this.canvasWidth);
    return e.position.y !== void 0 && (r = I(e.position.y, this.canvasHeight)), e.size.width !== void 0 && e.size.width !== "auto" && (h = I(e.size.width, this.canvasWidth)), e.size.height !== void 0 && e.size.height !== "auto" && (f = I(e.size.height, this.canvasHeight)), { x: a, y: r, width: h, height: f };
  }
}
class V {
  constructor(e, t, i) {
    n(this, "ctx");
    n(this, "canvasWidth");
    n(this, "canvasHeight");
    this.ctx = e, this.canvasWidth = t, this.canvasHeight = i;
  }
  /**
   * Update canvas dimensions (call when canvas size changes)
   */
  updateDimensions(e, t) {
    this.canvasWidth = e, this.canvasHeight = t;
  }
  /**
   * Draw grid lines with measurement labels
   * @param sampleRate - Audio sample rate in Hz (optional)
   * @param displaySamples - Number of samples displayed on screen (optional)
   * @param gain - Current gain multiplier (optional)
   */
  drawGrid(e, t, i) {
    this.ctx.strokeStyle = "#222222", this.ctx.lineWidth = 1, this.ctx.beginPath();
    const s = 5;
    for (let a = 0; a <= s; a++) {
      const r = this.canvasHeight / s * a;
      this.ctx.moveTo(0, r), this.ctx.lineTo(this.canvasWidth, r);
    }
    const o = 10;
    for (let a = 0; a <= o; a++) {
      const r = this.canvasWidth / o * a;
      this.ctx.moveTo(r, 0), this.ctx.lineTo(r, this.canvasHeight);
    }
    this.ctx.stroke(), this.ctx.strokeStyle = "#444444", this.ctx.lineWidth = 1, this.ctx.beginPath(), this.ctx.moveTo(0, this.canvasHeight / 2), this.ctx.lineTo(this.canvasWidth, this.canvasHeight / 2), this.ctx.stroke(), e && e > 0 && t && t > 0 && i !== void 0 && i > 0 && this.drawGridLabels(e, t, i);
  }
  /**
   * Draw grid measurement labels
   * @param sampleRate - Audio sample rate in Hz
   * @param displaySamples - Number of samples displayed on screen
   * @param gain - Current gain multiplier
   */
  drawGridLabels(e, t, i) {
    this.ctx.save(), this.ctx.font = "11px monospace", this.ctx.fillStyle = "#666666";
    const s = t / e * 1e3, o = 10, a = s / o;
    for (let c = 0; c <= o; c++) {
      const u = this.canvasWidth / o * c, m = a * c;
      let d;
      m >= 1e3 ? d = `${(m / 1e3).toFixed(2)}s` : m >= 1 ? d = `${m.toFixed(1)}ms` : d = `${(m * 1e3).toFixed(0)}μs`;
      const g = this.ctx.measureText(d).width, v = Math.max(2, Math.min(u - g / 2, this.canvasWidth - g - 2));
      this.ctx.fillText(d, v, this.canvasHeight - 3);
    }
    const r = 5, f = 1 / (r / 2 * i);
    for (let c = 0; c <= r; c++) {
      const u = this.canvasHeight / r * c, d = (r / 2 - c) * f;
      let g;
      if (d === 0)
        g = "0dB*";
      else {
        const v = B(Math.abs(d)), l = d > 0 ? "+" : "-", w = Math.abs(v);
        w >= 100 ? g = `${l}${w.toFixed(0)}dB` : g = `${l}${w.toFixed(1)}dB`;
      }
      this.ctx.fillText(g, 3, u + 10);
    }
    this.ctx.restore();
  }
}
class j {
  constructor(e, t, i) {
    n(this, "ctx");
    n(this, "canvasWidth");
    n(this, "canvasHeight");
    this.ctx = e, this.canvasWidth = t, this.canvasHeight = i;
  }
  /**
   * Update canvas dimensions (call when canvas size changes)
   */
  updateDimensions(e, t) {
    this.canvasWidth = e, this.canvasHeight = t;
  }
  /**
   * Draw waveform
   */
  drawWaveform(e, t, i, s) {
    const o = i - t;
    if (o <= 0) return;
    this.ctx.strokeStyle = "#00ff00", this.ctx.lineWidth = 2, this.ctx.beginPath();
    const a = this.canvasWidth / o, r = this.canvasHeight / 2, f = this.canvasHeight / 2 * s;
    for (let c = 0; c < o; c++) {
      const u = t + c, m = e[u], d = r - m * f, g = Math.min(this.canvasHeight, Math.max(0, d)), v = c * a;
      c === 0 ? this.ctx.moveTo(v, g) : this.ctx.lineTo(v, g);
    }
    this.ctx.stroke();
  }
}
class J extends k {
  constructor() {
    super(...arguments);
    n(this, "FFT_OVERLAY_HEIGHT_RATIO", 0.9);
    // Spectrum bar height ratio within overlay (90%)
    n(this, "FFT_MIN_BAR_WIDTH", 1);
  }
  // Minimum bar width in pixels
  /**
   * Draw FFT spectrum overlay (position and size configurable via layout)
   */
  drawFFTOverlay(t, i, s, o, a, r) {
    const h = s / o, f = Math.floor(this.canvasWidth * 0.35), c = Math.floor(this.canvasHeight * 0.35), u = 10, m = this.canvasHeight - c - 10, { x: d, y: g, width: v, height: l } = this.calculateOverlayDimensions(
      r,
      u,
      m,
      f,
      c
    );
    this.ctx.save(), this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)", this.ctx.fillRect(d, g, v, l), this.ctx.strokeStyle = "#00aaff", this.ctx.lineWidth = 2, this.ctx.strokeRect(d, g, v, l);
    const w = Math.min(
      t.length,
      Math.ceil(a / h)
    ), x = v / w;
    this.ctx.fillStyle = "#00aaff";
    for (let p = 0; p < w; p++) {
      const E = t[p] / 255 * l * this.FFT_OVERLAY_HEIGHT_RATIO, M = d + p * x, R = g + l - E;
      this.ctx.fillRect(M, R, Math.max(x - 1, this.FFT_MIN_BAR_WIDTH), E);
    }
    if (i > 0 && i <= a) {
      const p = i / h, S = d + p * x;
      this.ctx.strokeStyle = "#ff00ff", this.ctx.lineWidth = 2, this.ctx.beginPath(), this.ctx.moveTo(S, g), this.ctx.lineTo(S, g + l), this.ctx.stroke(), this.ctx.fillStyle = "#ff00ff", this.ctx.font = "bold 12px Arial";
      const E = `${i.toFixed(1)} Hz`, M = this.ctx.measureText(E).width;
      let R = S + 3;
      R + M > d + v - 5 && (R = S - M - 3), this.ctx.fillText(E, R, g + 15);
    }
    this.ctx.restore();
  }
}
class ee extends k {
  /**
   * Draw harmonic analysis information overlay
   * Displays debugging information about frequency estimation when FFT method is used
   * Position and size configurable via layout
   */
  drawHarmonicAnalysis(e, t, i, s, o, a, r, h) {
    if (e === void 0 && !t && !i && !a)
      return;
    const f = 16, u = (1 + // Title
    (e !== void 0 ? 1 : 0) + (t ? 1 : 0) + (i ? 1 : 0) + (a ? 2 : 0)) * f + 10, { x: m, y: d, width: g, height: v } = this.calculateOverlayDimensions(
      h,
      10,
      10,
      500,
      u
    );
    let l = d;
    if (this.ctx.save(), this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)", this.ctx.fillRect(m, d, g, v), this.ctx.strokeStyle = "#ffaa00", this.ctx.lineWidth = 2, this.ctx.strokeRect(m, d, g, v), this.ctx.fillStyle = "#ffaa00", this.ctx.font = "bold 12px monospace", l += 15, this.ctx.fillText("倍音分析 (Harmonic Analysis)", m + 5, l), e !== void 0 && r) {
      l += f, this.ctx.fillStyle = "#00ff00", this.ctx.font = "11px monospace";
      const w = r / 2;
      this.ctx.fillText(
        `1/2周波数 (${w.toFixed(1)}Hz) のpeak強度: ${e.toFixed(1)}%`,
        m + 5,
        l
      );
    }
    if (t && r) {
      l += f, this.ctx.fillStyle = "#ff00ff", this.ctx.font = "11px monospace";
      const w = t.map((p, S) => `${S + 1}x:${p.toFixed(2)}`).join(" "), x = s !== void 0 ? ` (重み付け: ${s.toFixed(1)})` : "";
      this.ctx.fillText(
        `候補1 (${r.toFixed(1)}Hz) 倍音: ${w}${x}`,
        m + 5,
        l
      );
    }
    if (i && r) {
      l += f, this.ctx.fillStyle = "#00aaff", this.ctx.font = "11px monospace";
      const w = r / 2, x = i.map((S, E) => `${E + 1}x:${S.toFixed(2)}`).join(" "), p = o !== void 0 ? ` (重み付け: ${o.toFixed(1)})` : "";
      this.ctx.fillText(
        `候補2 (${w.toFixed(1)}Hz) 倍音: ${x}${p}`,
        m + 5,
        l
      );
    }
    if (a) {
      l += f, this.ctx.fillStyle = "#aaaaaa", this.ctx.font = "10px monospace";
      const w = g - 10, x = a.split(" ");
      let p = "";
      for (const S of x) {
        const E = p + (p ? " " : "") + S;
        this.ctx.measureText(E).width > w && p ? (this.ctx.fillText(p, m + 5, l), l += f, p = S) : p = E;
      }
      p && this.ctx.fillText(p, m + 5, l);
    }
    this.ctx.restore();
  }
}
class te extends k {
  constructor() {
    super(...arguments);
    n(this, "FREQ_PLOT_MIN_RANGE_PADDING_HZ", 50);
    // 周波数範囲の最小パディング (Hz)
    n(this, "FREQ_PLOT_RANGE_PADDING_RATIO", 0.1);
  }
  // 周波数範囲のパディング比率 (10%)
  /**
   * Draw frequency plot overlay
   * Position and size configurable via layout
   * Displays frequency history to detect frequency spikes
   * One data point is added per frame
   */
  drawFrequencyPlot(t, i, s, o) {
    if (!t || t.length === 0)
      return;
    const { x: a, y: r, width: h, height: f } = this.calculateOverlayDimensions(
      o,
      this.canvasWidth - 280 - 10,
      10,
      280,
      120
    );
    this.ctx.save(), this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)", this.ctx.fillRect(a, r, h, f), this.ctx.strokeStyle = "#ffaa00", this.ctx.lineWidth = 2, this.ctx.strokeRect(a, r, h, f), this.ctx.fillStyle = "#ffaa00", this.ctx.font = "bold 12px Arial", this.ctx.fillText(`周波数推移 (${t.length}frame)`, a + 5, r + 15);
    const c = a + 35, u = r + 25, m = h - 45, d = f - 45, g = t.filter((T) => T > 0);
    if (g.length === 0) {
      this.ctx.restore();
      return;
    }
    const v = Math.min(...g), l = Math.max(...g), w = (l - v) * this.FREQ_PLOT_RANGE_PADDING_RATIO || this.FREQ_PLOT_MIN_RANGE_PADDING_HZ, x = Math.max(i, v - w), p = Math.min(s, l + w);
    this.ctx.strokeStyle = "#333333", this.ctx.lineWidth = 1, this.ctx.beginPath();
    for (let T = 0; T <= 4; T++) {
      const C = u + d / 4 * T;
      this.ctx.moveTo(c, C), this.ctx.lineTo(c + m, C);
    }
    for (let T = 0; T <= 4; T++) {
      const C = c + m / 4 * T;
      this.ctx.moveTo(C, u), this.ctx.lineTo(C, u + d);
    }
    this.ctx.stroke(), this.ctx.fillStyle = "#aaaaaa", this.ctx.font = "10px monospace", this.ctx.textAlign = "right", this.ctx.textBaseline = "middle";
    for (let T = 0; T <= 4; T++) {
      const C = p - (p - x) * (T / 4), b = u + d / 4 * T, A = C >= 1e3 ? `${(C / 1e3).toFixed(1)}k` : `${C.toFixed(0)}`;
      this.ctx.fillText(A, c - 5, b);
    }
    this.ctx.fillStyle = "#88ccff", this.ctx.font = "9px monospace", this.ctx.textAlign = "right", this.ctx.textBaseline = "middle";
    for (let T = 0; T <= 4; T++) {
      const C = p - (p - x) * (T / 4), b = u + d / 4 * T, A = O(C);
      if (A) {
        const D = A.cents >= 0 ? "+" : "";
        this.ctx.fillText(`${D}${A.cents}¢`, c + m - 5, b);
      }
    }
    this.ctx.strokeStyle = "#00ff00", this.ctx.lineWidth = 2, this.ctx.beginPath();
    const S = m / Math.max(t.length - 1, 1), E = Math.max(1, Math.floor(t.length / 4)), M = (T) => {
      const b = (Math.max(x, Math.min(p, T)) - x) / (p - x);
      return u + d - b * d;
    };
    let R = !1;
    for (let T = 0; T < t.length; T++) {
      const C = t[T], b = c + T * S;
      if (C === 0) {
        R = !1;
        continue;
      }
      const A = M(C);
      R ? this.ctx.lineTo(b, A) : (this.ctx.moveTo(b, A), R = !0);
    }
    this.ctx.stroke(), this.ctx.font = "9px monospace", this.ctx.textAlign = "center", this.ctx.textBaseline = "top";
    for (let T = 0; T < t.length; T++) {
      const C = t[T], b = c + T * S;
      if (C !== 0) {
        const H = M(C);
        this.ctx.fillStyle = "#00ff00", this.ctx.beginPath(), this.ctx.arc(b, H, 2, 0, Math.PI * 2), this.ctx.fill();
      }
      const A = T === t.length - 1;
      if (T % E === 0 || A) {
        this.ctx.fillStyle = "#aaaaaa";
        const H = T - t.length + 1;
        this.ctx.fillText(`${H}`, b, u + d + 2);
      }
    }
    const P = t[t.length - 1];
    if (P > 0) {
      const T = O(P);
      this.ctx.fillStyle = "#00ff00", this.ctx.font = "bold 11px Arial", this.ctx.textAlign = "left", this.ctx.textBaseline = "bottom";
      let C = `${P.toFixed(1)} Hz`;
      if (T) {
        const b = T.cents >= 0 ? "+" : "";
        C += ` (${T.noteName} ${b}${T.cents}¢)`;
      }
      this.ctx.fillText(C, c + 2, u + d - 2);
    }
    this.ctx.restore();
  }
}
class ie {
  constructor(e, t, i, s = !0) {
    n(this, "ctx");
    n(this, "canvasWidth");
    n(this, "canvasHeight");
    n(this, "debugOverlaysEnabled");
    this.ctx = e, this.canvasWidth = t, this.canvasHeight = i, this.debugOverlaysEnabled = s;
  }
  /**
   * Update canvas dimensions (call when canvas size changes)
   */
  updateDimensions(e, t) {
    this.canvasWidth = e, this.canvasHeight = t;
  }
  /**
   * Set debug overlays enabled state
   */
  setDebugOverlaysEnabled(e) {
    this.debugOverlaysEnabled = e;
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
  drawPhaseMarkers(e, t, i, s, o, a, r) {
    if (o === void 0 || a === void 0)
      return;
    const h = a - o;
    if (h <= 0)
      return;
    this.ctx.save();
    const f = (c, u, m) => {
      const d = c - o;
      if (d < 0 || d >= h)
        return;
      const g = d / h * this.canvasWidth;
      this.ctx.strokeStyle = u, this.ctx.lineWidth = m, this.ctx.beginPath(), this.ctx.moveTo(g, 0), this.ctx.lineTo(g, this.canvasHeight), this.ctx.stroke();
    };
    if (i !== void 0 && f(i, "#ff8800", 2), s !== void 0 && f(s, "#ff8800", 2), e !== void 0 && (f(e, "#ff0000", 2), this.debugOverlaysEnabled && (r == null ? void 0 : r.phaseZeroSegmentRelative) !== void 0)) {
      const u = (e - o) / h * this.canvasWidth, m = 20;
      this.ctx.save(), this.ctx.fillStyle = "#ff0000", this.ctx.font = "12px monospace", this.ctx.textAlign = "left";
      const d = r.phaseZeroSegmentRelative, g = r.phaseZeroHistory ?? "?", v = r.phaseZeroTolerance ?? "?";
      [
        `Mode: ${r.zeroCrossModeName ?? "Unknown"}`,
        `Seg Rel: ${d}`,
        `History: ${g}`,
        `Tolerance: ±${v}`,
        `Range: ${typeof g == "number" && typeof v == "number" ? `${g - v}~${g + v}` : "?"}`
      ].forEach((x, p) => {
        this.ctx.fillText(x, u + 5, m + p * 14);
      }), this.ctx.restore();
    }
    t !== void 0 && f(t, "#ff0000", 2), this.ctx.restore();
  }
}
class se {
  constructor(e, t) {
    n(this, "canvas");
    n(this, "ctx");
    n(this, "fftDisplayEnabled", !0);
    n(this, "harmonicAnalysisEnabled", !1);
    // Control harmonic analysis overlay independently
    n(this, "debugOverlaysEnabled", !0);
    // Control debug overlays (harmonic analysis, frequency plot)
    n(this, "overlaysLayout");
    // Layout configuration for overlays
    // Specialized renderers
    n(this, "gridRenderer");
    n(this, "waveformLineRenderer");
    n(this, "fftOverlayRenderer");
    n(this, "harmonicAnalysisRenderer");
    n(this, "frequencyPlotRenderer");
    n(this, "phaseMarkerRenderer");
    this.canvas = e;
    const i = e.getContext("2d");
    if (!i)
      throw new Error("Could not get 2D context");
    this.ctx = i, this.overlaysLayout = t || U, this.gridRenderer = new V(this.ctx, e.width, e.height), this.waveformLineRenderer = new j(this.ctx, e.width, e.height), this.fftOverlayRenderer = new J(this.ctx, e.width, e.height), this.harmonicAnalysisRenderer = new ee(this.ctx, e.width, e.height), this.frequencyPlotRenderer = new te(this.ctx, e.width, e.height), this.phaseMarkerRenderer = new ie(this.ctx, e.width, e.height, this.debugOverlaysEnabled), e.width === 300 && e.height === 150 && console.warn(
      'Canvas element is using default dimensions (300x150). Set explicit width and height attributes on the canvas element to match desired resolution. Example: <canvas id="oscilloscope" width="1800" height="1000"></canvas>'
    );
  }
  /**
   * Clear canvas and draw grid with measurement labels
   * @param sampleRate - Audio sample rate in Hz (optional)
   * @param displaySamples - Number of samples displayed on screen (optional)
   * @param gain - Current gain multiplier (optional)
   */
  clearAndDrawGrid(e, t, i) {
    this.updateRendererDimensions(), this.ctx.fillStyle = "#000000", this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height), this.gridRenderer.drawGrid(e, t, i);
  }
  /**
   * Update all renderer dimensions (call when canvas size changes)
   */
  updateRendererDimensions() {
    const e = this.canvas.width, t = this.canvas.height;
    this.gridRenderer.updateDimensions(e, t), this.waveformLineRenderer.updateDimensions(e, t), this.fftOverlayRenderer.updateDimensions(e, t), this.harmonicAnalysisRenderer.updateDimensions(e, t), this.frequencyPlotRenderer.updateDimensions(e, t), this.phaseMarkerRenderer.updateDimensions(e, t);
  }
  /**
   * Draw waveform
   */
  drawWaveform(e, t, i, s) {
    this.updateRendererDimensions(), this.waveformLineRenderer.drawWaveform(e, t, i, s);
  }
  /**
   * Draw FFT spectrum overlay (position and size configurable via overlaysLayout)
   */
  drawFFTOverlay(e, t, i, s, o) {
    this.fftDisplayEnabled && (this.updateRendererDimensions(), this.fftOverlayRenderer.drawFFTOverlay(
      e,
      t,
      i,
      s,
      o,
      this.overlaysLayout.fftOverlay
    ));
  }
  /**
   * Draw harmonic analysis information overlay
   * Displays debugging information about frequency estimation when FFT method is used
   * Position and size configurable via overlaysLayout
   */
  drawHarmonicAnalysis(e, t, i, s, o, a, r) {
    this.harmonicAnalysisEnabled && this.debugOverlaysEnabled && this.fftDisplayEnabled && (this.updateRendererDimensions(), this.harmonicAnalysisRenderer.drawHarmonicAnalysis(
      e,
      t,
      i,
      s,
      o,
      a,
      r,
      this.overlaysLayout.harmonicAnalysis
    ));
  }
  /**
   * Draw frequency plot overlay
   * Position and size configurable via overlaysLayout
   * Displays frequency history to detect frequency spikes
   * One data point is added per frame
   */
  drawFrequencyPlot(e, t, i) {
    this.debugOverlaysEnabled && (this.updateRendererDimensions(), this.frequencyPlotRenderer.drawFrequencyPlot(
      e,
      t,
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
  drawPhaseMarkers(e, t, i, s, o, a, r) {
    this.updateRendererDimensions(), this.phaseMarkerRenderer.drawPhaseMarkers(
      e,
      t,
      i,
      s,
      o,
      a,
      r
    );
  }
  // Getters and setters
  setFFTDisplay(e) {
    this.fftDisplayEnabled = e;
  }
  getFFTDisplayEnabled() {
    return this.fftDisplayEnabled;
  }
  /**
   * Enable or disable harmonic analysis overlay
   * When disabled, the yellow-bordered harmonic analysis panel is hidden
   * @param enabled - true to show harmonic analysis overlay, false to hide it
   */
  setHarmonicAnalysisEnabled(e) {
    this.harmonicAnalysisEnabled = e;
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
  setDebugOverlaysEnabled(e) {
    this.debugOverlaysEnabled = e, this.phaseMarkerRenderer.setDebugOverlaysEnabled(e);
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
  setOverlaysLayout(e) {
    this.overlaysLayout = { ...this.overlaysLayout, ...e };
  }
  /**
   * Get the current overlays layout configuration
   * @returns Current overlays layout configuration
   */
  getOverlaysLayout() {
    return this.overlaysLayout;
  }
}
class ne {
  constructor() {
    n(this, "usePeakMode", !1);
    n(this, "zeroCrossMode", "hysteresis");
  }
  /**
   * Set whether to use peak mode instead of zero-crossing mode
   */
  setUsePeakMode(e) {
    this.usePeakMode = e;
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
  setZeroCrossMode(e) {
    this.zeroCrossMode = e;
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
class re {
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
class oe {
  constructor() {
    // Auto-scaling constants
    n(this, "TARGET_FILL_RATIO", 0.9);
    // Target 90% of distance from center to edge (canvas half-height) for auto-scaled waveforms
    n(this, "MIN_PEAK_THRESHOLD", 1e-3);
    // Minimum peak to trigger auto-scaling (below this uses default)
    n(this, "DEFAULT_AMPLITUDE_RATIO", 0.4);
  }
  // Default scaling factor when peak is too small
  /**
   * Calculate peak amplitude in a given range of data
   * Used for auto-scaling waveforms to fill the vertical space
   */
  findPeakAmplitude(e, t, i) {
    let s = 0;
    const o = Math.max(0, t), a = Math.min(e.length, i);
    for (let r = o; r < a; r++) {
      const h = Math.abs(e[r]);
      h > s && (s = h);
    }
    return s;
  }
  /**
   * Draw a waveform on a canvas with auto-scaling
   * Waveforms are automatically scaled so that peaks reach 90% of the distance
   * from the vertical center line to the top/bottom edge (i.e. 90% of half the height).
   * For example, if peak amplitude is 0.01, it will be scaled 90x relative to that center-to-edge range.
   */
  drawWaveform(e, t, i, s, o, a, r) {
    const h = a - o;
    if (h <= 0) return;
    const f = this.findPeakAmplitude(s, o, a);
    e.strokeStyle = r, e.lineWidth = 1.5, e.beginPath();
    const c = t / h, u = i / 2;
    let m;
    if (f > this.MIN_PEAK_THRESHOLD) {
      const d = this.TARGET_FILL_RATIO / f;
      m = i / 2 * d;
    } else
      m = i * this.DEFAULT_AMPLITUDE_RATIO;
    for (let d = 0; d < h; d++) {
      const g = o + d;
      if (g >= s.length) break;
      const v = s[g], l = u - v * m, w = Math.min(i, Math.max(0, l)), x = d * c;
      d === 0 ? e.moveTo(x, w) : e.lineTo(x, w);
    }
    e.stroke();
  }
  /**
   * Draw center line on canvas
   */
  drawCenterLine(e, t, i) {
    e.strokeStyle = "#444444", e.lineWidth = 1, e.beginPath(), e.moveTo(0, i / 2), e.lineTo(t, i / 2), e.stroke();
  }
  /**
   * Draw zero-cross candidates as circles on the center line
   */
  drawZeroCrossCandidates(e, t, i, s, o, a, r, h, f, c) {
    const u = a - o;
    if (s.length === 0 || u <= 0)
      return;
    const m = i / 2, d = 5, g = 7, v = 9, l = performance.now();
    let w, x = Number.POSITIVE_INFINITY;
    e.save();
    for (const p of s) {
      const S = p - o;
      if (S < 0 || S >= u || f !== void 0 && c !== void 0 && (p < f || p >= c))
        continue;
      const E = S / u * t, M = r !== void 0 && p === r, R = M && Math.floor(l / 400) % 2 === 0, P = M ? R ? "#ffff00" : "#0066ff" : "#ffff00", T = M ? g : d;
      if (e.beginPath(), e.strokeStyle = P, e.lineWidth = 2, e.arc(E, m, T, 0, Math.PI * 2), e.stroke(), h !== void 0) {
        const C = Math.abs(p - h);
        C < x && (x = C, w = E);
      }
    }
    w !== void 0 && (e.beginPath(), e.strokeStyle = "#ff0000", e.lineWidth = 2, e.arc(w, m, v, 0, Math.PI * 2), e.stroke()), e.restore();
  }
  /**
   * Clear a canvas
   */
  clearCanvas(e, t, i) {
    e.fillStyle = "#000000", e.fillRect(0, 0, t, i);
  }
  /**
   * Draw phase marker vertical lines
   * Red lines for phaseZero and phaseTwoPi, orange lines for phaseMinusQuarterPi and phaseTwoPiPlusQuarterPi
   * @param ctx - Canvas context
   * @param width - Canvas width
   * @param height - Canvas height
   * @param displayStartIndex - Start index of the displayed region in the full buffer
   * @param displayEndIndex - End index (exclusive) of the displayed region in the full buffer
   * @param phaseZeroIndex - Sample index for phase 0 in the full buffer (red line)
   * @param phaseTwoPiIndex - Sample index for phase 2π in the full buffer (red line)
   * @param phaseMinusQuarterPiIndex - Sample index for phase -π/4 in the full buffer (orange line)
   * @param phaseTwoPiPlusQuarterPiIndex - Sample index for phase 2π+π/4 in the full buffer (orange line)
   */
  drawPhaseMarkers(e, t, i, s, o, a, r, h, f) {
    const c = o - s;
    if (c <= 0) return;
    const u = (m, d, g) => {
      const v = m - s;
      if (v < 0 || v >= c)
        return;
      const l = v / c * t;
      e.strokeStyle = d, e.lineWidth = g, e.beginPath(), e.moveTo(l, 0), e.lineTo(l, i), e.stroke();
    };
    h !== void 0 && u(h, "#ff8800", 2), f !== void 0 && u(f, "#ff8800", 2), a !== void 0 && u(a, "#ff0000", 2), r !== void 0 && u(r, "#ff0000", 2);
  }
}
class ae {
  /**
   * Draw similarity history plot on similarity canvas
   * 類似度の時系列変化を表示し、瞬間的な類似度低下を検出しやすくする
   * 
   * @param ctx - Canvas 2D rendering context
   * @param width - Canvas width
   * @param height - Canvas height
   * @param similarityHistory - Array of correlation coefficients (-1.0 to 1.0).
   *                            Values are ordered chronologically from oldest to newest.
   */
  drawSimilarityPlot(e, t, i, s) {
    if (!s || s.length === 0)
      return;
    e.save(), e.fillStyle = "#000000", e.fillRect(0, 0, t, i), e.strokeStyle = "#00aaff", e.lineWidth = 2, e.strokeRect(0, 0, t, i), e.fillStyle = "#00aaff", e.font = "bold 12px Arial", e.fillText("類似度推移 (Similarity)", 5, 15);
    const o = 40, a = 25, r = t - 50, h = i - 35, f = -1, c = 1;
    e.strokeStyle = "#333333", e.lineWidth = 1, e.beginPath();
    for (let d = 0; d <= 4; d++) {
      const g = a + h / 4 * d;
      e.moveTo(o, g), e.lineTo(o + r, g);
    }
    for (let d = 0; d <= 4; d++) {
      const g = o + r / 4 * d;
      e.moveTo(g, a), e.lineTo(g, a + h);
    }
    e.stroke(), e.fillStyle = "#aaaaaa", e.font = "10px monospace", e.textAlign = "right", e.textBaseline = "middle";
    for (let d = 0; d <= 4; d++) {
      const g = c - (c - f) * (d / 4), v = a + h / 4 * d, l = g.toFixed(2);
      e.fillText(l, o - 5, v);
    }
    e.strokeStyle = "#00aaff", e.lineWidth = 2, e.beginPath();
    const u = r / Math.max(s.length - 1, 1);
    for (let d = 0; d < s.length; d++) {
      const g = s[d], v = o + d * u, w = (Math.max(f, Math.min(c, g)) - f) / (c - f), x = a + h - w * h;
      d === 0 ? e.moveTo(v, x) : e.lineTo(v, x);
    }
    e.stroke();
    const m = s[s.length - 1];
    e.fillStyle = "#00aaff", e.font = "bold 11px Arial", e.textAlign = "left", e.textBaseline = "bottom", e.fillText(`${m.toFixed(3)}`, o + 2, a + h - 2), e.restore();
  }
  /**
   * Draw similarity score text on a canvas
   */
  drawSimilarityText(e, t, i) {
    e.fillStyle = "#00aaff", e.font = "bold 14px Arial";
    const s = `Similarity: ${i.toFixed(3)}`, o = e.measureText(s).width, a = (t - o) / 2;
    e.fillText(s, a, 20);
  }
}
class he {
  /**
   * Draw vertical position markers
   */
  drawPositionMarkers(e, t, i, s, o, a) {
    if (a <= 0) return;
    const r = s / a * t, h = o / a * t;
    e.strokeStyle = "#ff0000", e.lineWidth = 2, e.beginPath(), e.moveTo(r, 0), e.lineTo(r, i), e.stroke(), e.beginPath(), e.moveTo(h, 0), e.lineTo(h, i), e.stroke(), e.fillStyle = "#ff0000", e.font = "10px Arial", e.fillText("S", r + 2, 12), e.fillText("E", h + 2, 12);
  }
  /**
   * Draw phase marker vertical lines on the buffer canvas
   * Red lines for phaseZero and phaseTwoPi, orange lines for phaseMinusQuarterPi and phaseTwoPiPlusQuarterPi
   */
  drawPhaseMarkers(e, t, i, s, o, a, r, h) {
    if (s <= 0) return;
    const f = (c, u) => {
      const m = c / s * t;
      e.strokeStyle = u, e.lineWidth = 1, e.beginPath(), e.moveTo(m, 0), e.lineTo(m, i), e.stroke();
    };
    r !== void 0 && f(r, "#ff8800"), h !== void 0 && f(h, "#ff8800"), o !== void 0 && f(o, "#ff0000"), a !== void 0 && f(a, "#ff0000");
  }
}
class le {
  /**
   * Draw phase marker offset overlay graphs on current waveform canvas
   * Displays two line graphs showing the relative offset progression of phase markers
   * @param ctx - Canvas 2D rendering context
   * @param width - Canvas width
   * @param height - Canvas height
   * @param phaseZeroOffsetHistory - Array of relative offset percentages for phase zero (start red line)
   * @param phaseTwoPiOffsetHistory - Array of relative offset percentages for phase 2π (end red line)
   */
  drawOffsetOverlayGraphs(e, t, i, s = [], o = []) {
    if (s.length === 0 && o.length === 0)
      return;
    e.save();
    const a = Math.min(120, t * 0.4), r = Math.min(60, i * 0.4), h = t - a - 5, f = 5;
    e.fillStyle = "rgba(0, 0, 0, 0.7)", e.fillRect(h, f, a, r), e.strokeStyle = "#00aaff", e.lineWidth = 1, e.strokeRect(h, f, a, r), e.fillStyle = "#00aaff", e.font = "9px Arial", e.fillText("Offset %", h + 2, f + 9);
    const c = 2, u = h + c, m = f + 12, d = a - c * 2, g = r - 12 - c, v = 0, l = 100, w = (x, p) => {
      if (x.length < 2) return;
      e.strokeStyle = p, e.lineWidth = 1.5, e.beginPath();
      const S = d / Math.max(x.length - 1, 1);
      for (let E = 0; E < x.length; E++) {
        const M = x[E], R = u + E * S, T = (Math.max(v, Math.min(l, M)) - v) / (l - v), C = m + g - T * g;
        E === 0 ? e.moveTo(R, C) : e.lineTo(R, C);
      }
      e.stroke();
    };
    if (w(s, "#ff0000"), w(o, "#ff8800"), e.font = "8px monospace", e.textAlign = "left", s.length > 0) {
      const x = s[s.length - 1];
      e.fillStyle = "#ff0000", e.fillText(`S:${x.toFixed(1)}%`, h + 2, f + r - 11);
    }
    if (o.length > 0) {
      const x = o[o.length - 1];
      e.fillStyle = "#ff8800", e.fillText(`E:${x.toFixed(1)}%`, h + 2, f + r - 2);
    }
    e.restore();
  }
}
class ce {
  constructor(e, t, i, s) {
    n(this, "previousCanvas");
    n(this, "currentCanvas");
    n(this, "similarityCanvas");
    n(this, "bufferCanvas");
    n(this, "previousCtx");
    n(this, "currentCtx");
    n(this, "similarityCtx");
    n(this, "bufferCtx");
    // Specialized renderers
    n(this, "waveformRenderer");
    n(this, "similarityPlotRenderer");
    n(this, "positionMarkerRenderer");
    n(this, "offsetOverlayRenderer");
    this.previousCanvas = e, this.currentCanvas = t, this.similarityCanvas = i, this.bufferCanvas = s;
    const o = e.getContext("2d"), a = t.getContext("2d"), r = i.getContext("2d"), h = s.getContext("2d");
    if (!o || !a || !r || !h)
      throw new Error("Could not get 2D context for comparison canvases");
    this.previousCtx = o, this.currentCtx = a, this.similarityCtx = r, this.bufferCtx = h, this.waveformRenderer = new oe(), this.similarityPlotRenderer = new ae(), this.positionMarkerRenderer = new he(), this.offsetOverlayRenderer = new le(), this.clearAllCanvases();
  }
  /**
   * Clear all comparison canvases
   */
  clearAllCanvases() {
    this.waveformRenderer.clearCanvas(this.previousCtx, this.previousCanvas.width, this.previousCanvas.height), this.waveformRenderer.clearCanvas(this.currentCtx, this.currentCanvas.width, this.currentCanvas.height), this.waveformRenderer.clearCanvas(this.similarityCtx, this.similarityCanvas.width, this.similarityCanvas.height), this.waveformRenderer.clearCanvas(this.bufferCtx, this.bufferCanvas.width, this.bufferCanvas.height);
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
   * @param phaseZeroIndex - Sample index for phase 0 (red line) in the full buffer (issue #279)
   * @param phaseTwoPiIndex - Sample index for phase 2π (red line) in the full buffer (issue #279)
   * @param phaseMinusQuarterPiIndex - Sample index for phase -π/4 (orange line) in the full buffer (issue #279)
   * @param phaseTwoPiPlusQuarterPiIndex - Sample index for phase 2π+π/4 (orange line) in the full buffer (issue #279)
   * @param zeroCrossCandidates - Zero-cross candidates within the displayed current waveform
   * @param highlightedZeroCrossCandidate - Candidate preceding the interval with the max positive peak (blinks)
   */
  updatePanels(e, t, i, s, o, a, r = [], h = [], f = [], c, u, m, d, g = [], v) {
    this.clearAllCanvases(), e && (this.waveformRenderer.drawCenterLine(this.previousCtx, this.previousCanvas.width, this.previousCanvas.height), this.waveformRenderer.drawWaveform(
      this.previousCtx,
      this.previousCanvas.width,
      this.previousCanvas.height,
      e,
      0,
      e.length,
      "#ffaa00"
    )), this.waveformRenderer.drawCenterLine(this.currentCtx, this.currentCanvas.width, this.currentCanvas.height), e && this.waveformRenderer.drawWaveform(
      this.currentCtx,
      this.currentCanvas.width,
      this.currentCanvas.height,
      e,
      0,
      e.length,
      "#666600"
      // Dimmer yellow-green color for previous waveform
    ), s - i > 0 && this.waveformRenderer.drawWaveform(
      this.currentCtx,
      this.currentCanvas.width,
      this.currentCanvas.height,
      t,
      i,
      s,
      "#00ff00"
    ), e && this.similarityPlotRenderer.drawSimilarityText(this.currentCtx, this.currentCanvas.width, a), this.offsetOverlayRenderer.drawOffsetOverlayGraphs(
      this.currentCtx,
      this.currentCanvas.width,
      this.currentCanvas.height,
      h,
      f
    );
    const w = s - i, x = c !== void 0 && u !== void 0 ? Math.abs(u - c) : w / 4, S = Number.isFinite(x) && x > 0 ? x / 2 : void 0, E = S !== void 0 && c !== void 0 ? Math.max(i, Math.floor(c - S)) : void 0, M = S !== void 0 && c !== void 0 ? Math.min(s, Math.ceil(c + S)) : void 0;
    this.waveformRenderer.drawZeroCrossCandidates(
      this.currentCtx,
      this.currentCanvas.width,
      this.currentCanvas.height,
      g,
      i,
      s,
      v,
      c,
      E,
      M
    ), this.waveformRenderer.drawPhaseMarkers(
      this.currentCtx,
      this.currentCanvas.width,
      this.currentCanvas.height,
      i,
      s,
      c,
      u,
      m,
      d
    ), r.length > 0 && this.similarityPlotRenderer.drawSimilarityPlot(
      this.similarityCtx,
      this.similarityCanvas.width,
      this.similarityCanvas.height,
      r
    ), this.waveformRenderer.drawCenterLine(this.bufferCtx, this.bufferCanvas.width, this.bufferCanvas.height), this.waveformRenderer.drawWaveform(
      this.bufferCtx,
      this.bufferCanvas.width,
      this.bufferCanvas.height,
      o,
      0,
      o.length,
      "#888888"
    ), this.positionMarkerRenderer.drawPositionMarkers(
      this.bufferCtx,
      this.bufferCanvas.width,
      this.bufferCanvas.height,
      i,
      s,
      o.length
    ), this.positionMarkerRenderer.drawPhaseMarkers(
      this.bufferCtx,
      this.bufferCanvas.width,
      this.bufferCanvas.height,
      o.length,
      c,
      u,
      m,
      d
    );
  }
  /**
   * Clear all panels (e.g., when stopped)
   */
  clear() {
    this.clearAllCanvases();
  }
}
const F = class F {
  constructor(e, t, i) {
    n(this, "canvas8div");
    n(this, "canvas4div");
    n(this, "canvas2div");
    n(this, "ctx8div");
    n(this, "ctx4div");
    n(this, "ctx2div");
    // History buffers for 100 frames
    n(this, "history8div", []);
    n(this, "history4div", []);
    n(this, "history2div", []);
    this.canvas8div = e, this.canvas4div = t, this.canvas2div = i;
    const s = e.getContext("2d"), o = t.getContext("2d"), a = i.getContext("2d");
    if (!s || !o || !a)
      throw new Error("Could not get 2D context for cycle similarity canvases");
    this.ctx8div = s, this.ctx4div = o, this.ctx2div = a, this.clearAllCanvases();
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
  clearCanvas(e, t, i) {
    e.fillStyle = "#000000", e.fillRect(0, 0, t, i);
  }
  /**
   * Draw a similarity line graph on a canvas showing history for each segment
   * @param ctx Canvas context
   * @param width Canvas width
   * @param height Canvas height
   * @param history History of similarity arrays (each array contains similarities for all segments)
   * @param title Title text for the graph
   * @param segmentLabel Label for what each segment represents (e.g., "1/2 cycle")
   */
  drawSimilarityGraph(e, t, i, s, o, a) {
    if (e.save(), e.fillStyle = "#000000", e.fillRect(0, 0, t, i), e.strokeStyle = "#ff8800", e.lineWidth = 2, e.strokeRect(0, 0, t, i), e.fillStyle = "#ff8800", e.font = "bold 12px Arial", e.fillText(o, 5, 15), !s || s.length === 0 || !s[0] || s[0].length === 0) {
      e.fillStyle = "#666666", e.font = "11px Arial", e.fillText("データなし (No data)", t / 2 - 50, i / 2), e.restore();
      return;
    }
    const r = 35, h = 25, f = t - 45, c = i - 35, u = -1, m = 1;
    e.strokeStyle = "#333333", e.lineWidth = 1, e.beginPath();
    for (let l = 0; l <= 4; l++) {
      const w = h + c / 4 * l;
      e.moveTo(r, w), e.lineTo(r + f, w);
    }
    for (let l = 0; l <= 4; l++) {
      const w = r + f / 4 * l;
      e.moveTo(w, h), e.lineTo(w, h + c);
    }
    e.stroke(), e.fillStyle = "#aaaaaa", e.font = "10px monospace", e.textAlign = "right", e.textBaseline = "middle";
    for (let l = 0; l <= 4; l++) {
      const w = m - (m - u) * (l / 4), x = h + c / 4 * l, p = w.toFixed(1);
      e.fillText(p, r - 5, x);
    }
    const d = h + c - (0 - u) / (m - u) * c;
    e.strokeStyle = "#666666", e.lineWidth = 1, e.beginPath(), e.moveTo(r, d), e.lineTo(r + f, d), e.stroke();
    const g = s[0].length;
    for (let l = 0; l < g; l++) {
      const w = F.SEGMENT_COLORS[l % F.SEGMENT_COLORS.length];
      e.strokeStyle = w, e.lineWidth = 2, e.beginPath();
      const x = s.length > 1 ? f / (s.length - 1) : 0;
      let p = !1;
      for (let S = 0; S < s.length; S++) {
        const E = s[S];
        if (E && E.length > l) {
          const M = E[l], R = r + S * x, T = (Math.max(u, Math.min(m, M)) - u) / (m - u), C = h + c - T * c;
          p ? e.lineTo(R, C) : (e.moveTo(R, C), p = !0);
        }
      }
      e.stroke();
    }
    const v = s[s.length - 1];
    if (v && v.length > 0) {
      const w = v.length * 11 + 4, x = 65, p = r + f - x - 2, S = h + 2;
      e.fillStyle = "rgba(0, 0, 0, 0.7)", e.fillRect(p, S, x, w), e.strokeStyle = "#555555", e.lineWidth = 1, e.strokeRect(p, S, x, w), e.font = "9px Arial", e.textAlign = "left", e.textBaseline = "top";
      for (let E = 0; E < v.length; E++) {
        const M = F.SEGMENT_COLORS[E % F.SEGMENT_COLORS.length], R = v[E], P = S + 2 + E * 11;
        e.fillStyle = M, e.fillRect(p + 2, P, 8, 8), e.fillStyle = "#ffffff", e.fillText(`${E + 1}-${E + 2}: ${R.toFixed(2)}`, p + 12, P);
      }
    }
    e.fillStyle = "#aaaaaa", e.font = "10px Arial", e.textAlign = "center", e.fillText(a, r + f / 2, i - 3), e.restore();
  }
  /**
   * Update all cycle similarity graphs
   * @param similarities8div 8 divisions (1/2 cycle each): 7 similarity values
   * @param similarities4div 4 divisions (1 cycle each): 3 similarity values
   * @param similarities2div 2 divisions (2 cycles each): 1 similarity value
   */
  updateGraphs(e, t, i) {
    e && e.length > 0 && (this.history8div.push(e), this.history8div.length > F.HISTORY_SIZE && this.history8div.shift()), t && t.length > 0 && (this.history4div.push(t), this.history4div.length > F.HISTORY_SIZE && this.history4div.shift()), i && i.length > 0 && (this.history2div.push(i), this.history2div.length > F.HISTORY_SIZE && this.history2div.shift()), this.drawSimilarityGraph(
      this.ctx8div,
      this.canvas8div.width,
      this.canvas8div.height,
      this.history8div,
      "8分割 (1/2周期)",
      "連続する1/2周期間の類似度"
    ), this.drawSimilarityGraph(
      this.ctx4div,
      this.canvas4div.width,
      this.canvas4div.height,
      this.history4div,
      "4分割 (1周期)",
      "連続する1周期間の類似度"
    ), this.drawSimilarityGraph(
      this.ctx2div,
      this.canvas2div.width,
      this.canvas2div.height,
      this.history2div,
      "2分割 (2周期)",
      "連続する2周期間の類似度"
    );
  }
  /**
   * Clear all graphs
   */
  clear() {
    this.history8div = [], this.history4div = [], this.history2div = [], this.clearAllCanvases();
  }
};
n(F, "HISTORY_SIZE", 100), n(F, "SEGMENT_COLORS", ["#00ff00", "#88ff00", "#ffaa00", "#ff6600", "#ff0000", "#ff00ff", "#00ffff"]);
let L = F;
const _ = class _ {
  constructor() {
    n(this, "cachedBasePath", null);
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
    var t;
    if (this.cachedBasePath !== null)
      return this.cachedBasePath;
    let e = (t = document.querySelector("base")) == null ? void 0 : t.getAttribute("href");
    if (e)
      try {
        e = new URL(e, window.location.href).pathname;
      } catch {
      }
    if (e || (e = this.getBasePathFromScripts()), !e && window.location.pathname && window.location.pathname !== "/") {
      const s = window.location.pathname.split("/").filter((o) => o.length > 0);
      s.length > 0 && (e = `/${s[0]}/`);
    }
    return e || (e = "/"), e.endsWith("/") || (e += "/"), this.cachedBasePath = e, e;
  }
  /**
   * Extract base path from existing script tags
   * This method attempts to infer the base path by looking for script tags with src attributes
   * that might indicate the deployment path. Falls back to empty string if no clear pattern is found.
   */
  getBasePathFromScripts() {
    const e = document.querySelectorAll("script[src]");
    for (const t of e) {
      const i = t.getAttribute("src");
      if (i)
        try {
          const o = new URL(i, window.location.href).pathname;
          for (const a of _.ASSET_PATTERNS) {
            const r = o.indexOf(a);
            if (r >= 0)
              return r === 0 ? "/" : o.substring(0, r) + "/";
          }
        } catch (s) {
          (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && console.debug("Failed to parse script URL:", i, s);
          continue;
        }
    }
    return "";
  }
};
// Asset directory patterns used for base path detection
n(_, "ASSET_PATTERNS", ["/assets/", "/js/", "/dist/"]);
let W = _;
class de {
  constructor() {
    n(this, "wasmProcessor", null);
    n(this, "isInitialized", !1);
    n(this, "LOAD_TIMEOUT_MS", 1e4);
  }
  /**
   * Load WASM module dynamically
   * @param basePath - Base path for loading WASM files
   * @returns Promise that resolves when WASM is loaded and initialized
   */
  async loadWasmModule(e) {
    if (!(this.isInitialized && this.wasmProcessor)) {
      if (typeof window > "u" || window.location.protocol === "file:")
        throw new Error("WASM module not available in test/non-browser environment");
      return new Promise((t, i) => {
        if (window.wasmProcessor && window.wasmProcessor.WasmDataProcessor) {
          this.wasmProcessor = new window.wasmProcessor.WasmDataProcessor(), this.isInitialized = !0, t();
          return;
        }
        const s = setTimeout(() => {
          r(), i(new Error(`WASM module loading timed out after ${this.LOAD_TIMEOUT_MS / 1e3} seconds`));
        }, this.LOAD_TIMEOUT_MS), o = `${e}wasm/signal_processor_wasm.js`, a = document.createElement("script");
        a.type = "module", a.textContent = `
        import init, { WasmDataProcessor } from '${o}';
        await init();
        window.wasmProcessor = { WasmDataProcessor };
        window.dispatchEvent(new Event('wasmLoaded'));
      `;
        const r = () => {
          clearTimeout(s), window.removeEventListener("wasmLoaded", h);
        }, h = () => {
          r(), window.wasmProcessor && window.wasmProcessor.WasmDataProcessor ? (this.wasmProcessor = new window.wasmProcessor.WasmDataProcessor(), this.isInitialized = !0, t()) : i(new Error("WASM module loaded but WasmDataProcessor not found"));
        };
        window.addEventListener("wasmLoaded", h), a.onerror = () => {
          r(), i(new Error("Failed to load WASM module script"));
        }, document.head.appendChild(a);
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
class fe {
  // Log when processing exceeds 60fps target
  constructor(e, t, i, s, o) {
    n(this, "audioManager");
    n(this, "gainController");
    n(this, "frequencyEstimator");
    n(this, "waveformSearcher");
    n(this, "zeroCrossDetector");
    n(this, "basePathResolver");
    n(this, "wasmLoader");
    // Phase marker offset history for overlay graphs (issue #236)
    n(this, "phaseZeroOffsetHistory", []);
    n(this, "phaseTwoPiOffsetHistory", []);
    n(this, "MAX_OFFSET_HISTORY", 100);
    // Keep last 100 frames of offset data
    // Diagnostic tracking for issue #254 analysis
    n(this, "previousPhaseZeroIndex");
    n(this, "previousPhaseTwoPiIndex");
    // Previous frame percent positions for 1% clamping enforcement (issue #275)
    n(this, "prevPhaseZeroPercent");
    n(this, "prevPhaseMinusQuarterPiPercent");
    // Performance diagnostics for issue #269
    n(this, "enableDetailedTimingLogs", !1);
    // Default: disabled to avoid performance impact
    n(this, "TIMING_LOG_THRESHOLD_MS", 16.67);
    this.audioManager = e, this.gainController = t, this.frequencyEstimator = i, this.waveformSearcher = s, this.zeroCrossDetector = o, this.basePathResolver = new W(), this.wasmLoader = new de();
  }
  /**
   * Initialize the WASM module
   * Must be called before processFrame
   */
  async initialize() {
    if (!this.wasmLoader.isReady())
      try {
        const e = this.basePathResolver.getBasePath();
        await this.wasmLoader.loadWasmModule(e), this.syncConfigToWasm();
      } catch (e) {
        throw console.error("Failed to initialize WASM module:", e), e;
      }
  }
  /**
   * Sync TypeScript configuration to WASM processor
   */
  syncConfigToWasm() {
    const e = this.wasmLoader.getProcessor();
    e && (e.setAutoGain(this.gainController.getAutoGainEnabled()), e.setNoiseGate(this.gainController.getNoiseGateEnabled()), e.setNoiseGateThreshold(this.gainController.getNoiseGateThreshold()), e.setFrequencyEstimationMethod(this.frequencyEstimator.getFrequencyEstimationMethod()), e.setBufferSizeMultiplier(this.frequencyEstimator.getBufferSizeMultiplier()), e.setZeroCrossMode(this.zeroCrossDetector.getZeroCrossMode()));
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
  syncResultsFromWasm(e) {
    this.frequencyEstimator.estimatedFrequency = e.estimatedFrequency, this.gainController.currentGain = e.gain, e.previousWaveform && (this.waveformSearcher.previousWaveform = e.previousWaveform), this.waveformSearcher.lastSimilarity = e.similarity;
  }
  /**
   * Process current frame and generate complete render data using WASM
   * @param fftDisplayEnabled - Whether FFT display is enabled
   * @param enableDetailedLogs - Whether to enable detailed timing logs (optional, defaults to instance setting)
   */
  processFrame(e, t) {
    const i = performance.now(), s = this.wasmLoader.getProcessor();
    if (!this.wasmLoader.isReady() || !s)
      return console.warn("WASM processor not initialized"), null;
    if (!this.audioManager.isReady())
      return null;
    const o = performance.now(), a = this.audioManager.getTimeDomainData();
    if (!a)
      return null;
    const r = performance.now(), h = this.audioManager.getSampleRate(), f = this.audioManager.getFFTSize(), c = performance.now(), u = this.frequencyEstimator.getFrequencyEstimationMethod() === "fft" || e;
    let m = u ? this.audioManager.getFrequencyData() : null;
    const d = performance.now();
    if (u && !m && a) {
      const P = s.computeFrequencyData(a, f);
      P && (m = new Uint8Array(P));
    }
    const g = performance.now();
    this.syncConfigToWasm();
    const v = performance.now(), l = s.processFrame(
      a,
      m,
      h,
      f,
      e
    ), w = performance.now();
    if (!l)
      return null;
    const x = performance.now(), p = {
      waveformData: new Float32Array(l.waveform_data),
      displayStartIndex: l.displayStartIndex,
      displayEndIndex: l.displayEndIndex,
      gain: l.gain,
      estimatedFrequency: l.estimatedFrequency,
      frequencyPlotHistory: l.frequencyPlotHistory ? Array.from(l.frequencyPlotHistory) : [],
      sampleRate: l.sampleRate,
      fftSize: l.fftSize,
      frequencyData: l.frequencyData ? new Uint8Array(l.frequencyData) : void 0,
      isSignalAboveNoiseGate: l.isSignalAboveNoiseGate,
      maxFrequency: l.maxFrequency,
      previousWaveform: l.previousWaveform ? new Float32Array(l.previousWaveform) : null,
      similarity: l.similarity,
      similarityPlotHistory: l.similarityPlotHistory ? Array.from(l.similarityPlotHistory) : [],
      usedSimilaritySearch: l.usedSimilaritySearch,
      phaseZeroIndex: l.phaseZeroIndex,
      phaseTwoPiIndex: l.phaseTwoPiIndex,
      phaseMinusQuarterPiIndex: l.phaseMinusQuarterPiIndex,
      phaseTwoPiPlusQuarterPiIndex: l.phaseTwoPiPlusQuarterPiIndex,
      zeroCrossCandidates: l.zeroCrossCandidates ? Array.from(l.zeroCrossCandidates) : [],
      highlightedZeroCrossCandidate: l.highlightedZeroCrossCandidate,
      halfFreqPeakStrengthPercent: l.halfFreqPeakStrengthPercent,
      candidate1Harmonics: l.candidate1Harmonics ? Array.from(l.candidate1Harmonics) : void 0,
      candidate2Harmonics: l.candidate2Harmonics ? Array.from(l.candidate2Harmonics) : void 0,
      selectionReason: l.selectionReason,
      cycleSimilarities8div: l.cycleSimilarities8div ? Array.from(l.cycleSimilarities8div) : void 0,
      cycleSimilarities4div: l.cycleSimilarities4div ? Array.from(l.cycleSimilarities4div) : void 0,
      cycleSimilarities2div: l.cycleSimilarities2div ? Array.from(l.cycleSimilarities2div) : void 0
    }, S = performance.now();
    this.clampPhaseMarkers(p), this.updatePhaseOffsetHistory(p), p.phaseZeroOffsetHistory = [...this.phaseZeroOffsetHistory], p.phaseTwoPiOffsetHistory = [...this.phaseTwoPiOffsetHistory], this.syncResultsFromWasm(p);
    const E = performance.now(), M = t !== void 0 ? t : this.enableDetailedTimingLogs, R = E - i;
    if (M || R > this.TIMING_LOG_THRESHOLD_MS) {
      const P = {
        init: (o - i).toFixed(2),
        getTimeDomain: (r - o).toFixed(2),
        getMetadata: (c - r).toFixed(2),
        getFreqData: (d - c).toFixed(2),
        computeFFT: (g - d).toFixed(2),
        syncConfig: (v - g).toFixed(2),
        wasmProcess: (w - v).toFixed(2),
        convertResult: (S - x).toFixed(2),
        postProcess: (E - S).toFixed(2),
        total: R.toFixed(2)
      };
      console.log(`[WaveformDataProcessor] init:${P.init}ms | getTimeDomain:${P.getTimeDomain}ms | getMeta:${P.getMetadata}ms | getFreq:${P.getFreqData}ms | computeFFT:${P.computeFFT}ms | syncCfg:${P.syncConfig}ms | WASM:${P.wasmProcess}ms | convert:${P.convertResult}ms | post:${P.postProcess}ms | total:${P.total}ms`);
    }
    return p;
  }
  /**
   * Enable or disable detailed timing logs for performance diagnostics
   * @param enabled - true to enable detailed timing logs, false to use threshold-based logging
   */
  setDetailedTimingLogs(e) {
    this.enableDetailedTimingLogs = e;
  }
  /**
   * Clamp phase marker positions to enforce 1% per frame movement spec (issue #275)
   * Each marker can move at most 1% of ONE CYCLE per frame (not 1% of the 4-cycle window).
   * Positions are tracked as percentages of the display window for consistency.
   * @param renderData - Render data containing phase indices (mutated in place)
   */
  clampPhaseMarkers(e) {
    if (e.displayStartIndex === void 0 || e.displayEndIndex === void 0)
      return;
    const t = e.displayEndIndex - e.displayStartIndex;
    if (t <= 0)
      return;
    const i = 4, s = 100 / i * 0.01, o = Math.floor(t / i), a = Math.floor(o / 4), r = (c, u) => {
      if (c === void 0)
        return { index: void 0, percent: void 0 };
      const m = (c - e.displayStartIndex) / t * 100;
      if (u === void 0)
        return { index: c, percent: m };
      const d = m - u;
      if (Math.abs(d) <= s)
        return { index: c, percent: m };
      const g = u + Math.sign(d) * s, v = e.displayStartIndex + g / 100 * t;
      let l;
      d > 0 ? l = Math.floor(v) : d < 0 ? l = Math.ceil(v) : l = Math.round(v);
      const w = (l - e.displayStartIndex) / t * 100;
      return { index: l, percent: w };
    }, h = r(e.phaseZeroIndex, this.prevPhaseZeroPercent);
    if (e.phaseZeroIndex = h.index, this.prevPhaseZeroPercent = h.percent, h.index !== void 0 && o > 0) {
      const c = h.index + o;
      e.phaseTwoPiIndex = c;
    } else
      e.phaseTwoPiIndex = void 0;
    const f = r(e.phaseMinusQuarterPiIndex, this.prevPhaseMinusQuarterPiPercent);
    if (e.phaseMinusQuarterPiIndex = f.index, this.prevPhaseMinusQuarterPiPercent = f.percent, f.index !== void 0 && o > 0) {
      const c = f.index + o + a;
      e.phaseTwoPiPlusQuarterPiIndex = c;
    } else
      e.phaseTwoPiPlusQuarterPiIndex = void 0;
  }
  /**
   * Calculate relative offset percentages for phase markers and update history
   * Issue #254: Added diagnostic logging to identify source of offset spikes
   * @param renderData - Render data containing phase indices
   */
  updatePhaseOffsetHistory(e) {
    if (e.displayStartIndex === void 0 || e.displayEndIndex === void 0)
      return;
    const t = e.displayEndIndex - e.displayStartIndex;
    if (t <= 0)
      return;
    const s = 100 / 4 * 0.01;
    let o = !1;
    const a = {
      frame: Date.now(),
      fourCycleWindow: {
        lengthSamples: t
        // Length of 4-cycle display window
      }
    };
    if (e.phaseZeroIndex !== void 0) {
      const h = (e.phaseZeroIndex - e.displayStartIndex) / t * 100;
      if (a.phaseZero = {
        startOffsetPercent: h
        // Position within 4-cycle window (0-100%)
      }, this.previousPhaseZeroIndex !== void 0) {
        const f = this.phaseZeroOffsetHistory[this.phaseZeroOffsetHistory.length - 1];
        if (f !== void 0) {
          const c = Math.abs(h - f);
          a.phaseZero.offsetChange = c, a.phaseZero.previousOffsetPercent = f, c > s && (o = !0, a.phaseZero.SPEC_VIOLATION = !0);
        }
      }
      this.phaseZeroOffsetHistory.push(h), this.phaseZeroOffsetHistory.length > this.MAX_OFFSET_HISTORY && this.phaseZeroOffsetHistory.shift(), this.previousPhaseZeroIndex = e.phaseZeroIndex;
    }
    if (e.phaseTwoPiIndex !== void 0) {
      const h = (e.phaseTwoPiIndex - e.displayStartIndex) / t * 100;
      if (a.phaseTwoPi = {
        endOffsetPercent: h
        // Position within 4-cycle window (0-100%)
      }, this.previousPhaseTwoPiIndex !== void 0) {
        const f = this.phaseTwoPiOffsetHistory[this.phaseTwoPiOffsetHistory.length - 1];
        if (f !== void 0) {
          const c = Math.abs(h - f);
          a.phaseTwoPi.offsetChange = c, a.phaseTwoPi.previousOffsetPercent = f, c > s && (o = !0, a.phaseTwoPi.SPEC_VIOLATION = !0);
        }
      }
      this.phaseTwoPiOffsetHistory.push(h), this.phaseTwoPiOffsetHistory.length > this.MAX_OFFSET_HISTORY && this.phaseTwoPiOffsetHistory.shift(), this.previousPhaseTwoPiIndex = e.phaseTwoPiIndex;
    }
    o && (console.warn("[1% Spec Violation Detected - Issue #254]", a), console.warn("→ Phase marker moved by more than 1% of one cycle in one frame"));
  }
  /**
   * Reset the WASM processor state
   */
  reset() {
    const e = this.wasmLoader.getProcessor();
    e && e.reset(), this.phaseZeroOffsetHistory = [], this.phaseTwoPiOffsetHistory = [], this.previousPhaseZeroIndex = void 0, this.previousPhaseTwoPiIndex = void 0, this.prevPhaseZeroPercent = void 0, this.prevPhaseMinusQuarterPiPercent = void 0;
  }
}
class ue {
  constructor() {
    n(this, "lastFrameTime", 0);
    n(this, "frameProcessingTimes", []);
    n(this, "frameCount", 0);
    n(this, "MAX_FRAME_TIMES", 100);
    n(this, "TARGET_FRAME_TIME", 16.67);
    // 60fps target
    n(this, "FPS_LOG_INTERVAL_FRAMES", 60);
    // Log FPS every 60 frames (approx. 1 second at 60fps)
    n(this, "enableDetailedTimingLogs", !1);
  }
  // Default: disabled to avoid performance impact
  /**
   * Set whether detailed timing logs are enabled
   * @param enabled - true to enable detailed timing logs, false to use threshold-based logging
   */
  setDetailedTimingLogs(e) {
    this.enableDetailedTimingLogs = e;
  }
  /**
   * Get whether detailed timing logs are enabled
   * @returns true if detailed timing logs are enabled
   */
  getDetailedTimingLogsEnabled() {
    return this.enableDetailedTimingLogs;
  }
  /**
   * Record frame processing time and log diagnostics if needed
   * @param startTime - Frame start timestamp
   * @param endTime - Frame end timestamp
   */
  recordFrameTime(e, t) {
    const i = t - e;
    if (this.frameProcessingTimes.push(i), this.frameProcessingTimes.length > this.MAX_FRAME_TIMES && this.frameProcessingTimes.shift(), i > this.TARGET_FRAME_TIME && console.warn(`Frame processing time: ${i.toFixed(2)}ms (target: <${this.TARGET_FRAME_TIME}ms)`), this.lastFrameTime > 0) {
      const o = 1e3 / (e - this.lastFrameTime);
      if (this.frameCount++, this.frameCount >= this.FPS_LOG_INTERVAL_FRAMES) {
        const a = this.frameProcessingTimes.reduce((r, h) => r + h, 0) / this.frameProcessingTimes.length;
        console.log(`FPS: ${o.toFixed(1)}, Avg frame time: ${a.toFixed(2)}ms`), this.frameCount = 0;
      }
    }
    this.lastFrameTime = e;
  }
  /**
   * Log detailed timing breakdown if enabled or if performance is poor
   * @param dataProcessingTime - Time spent in data processing phase
   * @param renderingTime - Time spent in rendering phase
   */
  logDetailedTiming(e, t) {
    const i = e + t;
    (this.enableDetailedTimingLogs || i > this.TARGET_FRAME_TIME) && console.log(`[Frame Timing] Total: ${i.toFixed(2)}ms | Data Processing: ${e.toFixed(2)}ms | Rendering: ${t.toFixed(2)}ms`);
  }
  /**
   * Reset timing diagnostics
   */
  reset() {
    this.lastFrameTime = 0, this.frameProcessingTimes = [], this.frameCount = 0;
  }
}
class me {
  constructor(e, t, i, s) {
    this.renderer = e, this.comparisonRenderer = t, this.cycleSimilarityRenderer = i, this.frequencyEstimator = s;
  }
  /**
   * Render a single frame using pre-processed data
   * This method contains only rendering logic - no data processing
   * @param renderData - Pre-processed waveform render data
   * @param phaseMarkerRangeEnabled - Whether to display only phase marker range
   */
  renderFrame(e, t) {
    let i = e.displayStartIndex, s = e.displayEndIndex;
    t && e.phaseMinusQuarterPiIndex !== void 0 && e.phaseTwoPiPlusQuarterPiIndex !== void 0 && e.phaseMinusQuarterPiIndex <= e.phaseTwoPiPlusQuarterPiIndex && (i = e.phaseMinusQuarterPiIndex, s = e.phaseTwoPiPlusQuarterPiIndex);
    const o = s - i;
    this.renderer.clearAndDrawGrid(
      e.sampleRate,
      o,
      e.gain
    ), this.renderer.drawWaveform(
      e.waveformData,
      i,
      s,
      e.gain
    ), this.renderer.drawPhaseMarkers(
      e.phaseZeroIndex,
      e.phaseTwoPiIndex,
      e.phaseMinusQuarterPiIndex,
      e.phaseTwoPiPlusQuarterPiIndex,
      i,
      s,
      {
        phaseZeroSegmentRelative: e.phaseZeroSegmentRelative,
        phaseZeroHistory: e.phaseZeroHistory,
        phaseZeroTolerance: e.phaseZeroTolerance,
        zeroCrossModeName: e.zeroCrossModeName
      }
    ), e.frequencyData && this.renderer.getFFTDisplayEnabled() && e.isSignalAboveNoiseGate && (this.renderer.drawFFTOverlay(
      e.frequencyData,
      e.estimatedFrequency,
      e.sampleRate,
      e.fftSize,
      e.maxFrequency
    ), this.renderer.drawHarmonicAnalysis(
      e.halfFreqPeakStrengthPercent,
      e.candidate1Harmonics,
      e.candidate2Harmonics,
      e.candidate1WeightedScore,
      e.candidate2WeightedScore,
      e.selectionReason,
      e.estimatedFrequency
    )), this.renderer.drawFrequencyPlot(
      e.frequencyPlotHistory,
      this.frequencyEstimator.getMinFrequency(),
      this.frequencyEstimator.getMaxFrequency()
    ), this.comparisonRenderer.updatePanels(
      e.previousWaveform,
      e.waveformData,
      e.displayStartIndex,
      e.displayEndIndex,
      e.waveformData,
      e.similarity,
      e.similarityPlotHistory,
      e.phaseZeroOffsetHistory,
      e.phaseTwoPiOffsetHistory,
      e.phaseZeroIndex,
      e.phaseTwoPiIndex,
      e.phaseMinusQuarterPiIndex,
      e.phaseTwoPiPlusQuarterPiIndex,
      e.zeroCrossCandidates ?? [],
      e.highlightedZeroCrossCandidate
    ), this.cycleSimilarityRenderer && this.cycleSimilarityRenderer.updateGraphs(
      e.cycleSimilarities8div,
      e.cycleSimilarities4div,
      e.cycleSimilarities2div
    );
  }
}
class ye {
  // Default: on
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
  constructor(e, t, i, s, o, a, r, h, f) {
    n(this, "audioManager");
    n(this, "gainController");
    n(this, "frequencyEstimator");
    n(this, "renderer");
    n(this, "zeroCrossDetector");
    n(this, "waveformSearcher");
    n(this, "comparisonRenderer");
    n(this, "cycleSimilarityRenderer", null);
    n(this, "dataProcessor");
    n(this, "timingDiagnostics");
    n(this, "renderCoordinator");
    n(this, "animationId", null);
    n(this, "isRunning", !1);
    n(this, "isPaused", !1);
    n(this, "phaseMarkerRangeEnabled", !0);
    this.audioManager = new Z(), this.gainController = new Q(), this.frequencyEstimator = new X(), this.renderer = new se(e, f), this.zeroCrossDetector = new ne(), this.waveformSearcher = new re(), this.comparisonRenderer = new ce(
      t,
      i,
      s,
      o
    ), a && r && h && (this.cycleSimilarityRenderer = new L(
      a,
      r,
      h
    )), this.dataProcessor = new fe(
      this.audioManager,
      this.gainController,
      this.frequencyEstimator,
      this.waveformSearcher,
      this.zeroCrossDetector
    ), this.timingDiagnostics = new ue(), this.renderCoordinator = new me(
      this.renderer,
      this.comparisonRenderer,
      this.cycleSimilarityRenderer,
      this.frequencyEstimator
    );
  }
  async start() {
    try {
      await this.dataProcessor.initialize(), await this.audioManager.start(), this.isRunning = !0, this.render();
    } catch (e) {
      throw console.error("Error starting oscilloscope:", e), e;
    }
  }
  async startFromFile(e) {
    try {
      await this.dataProcessor.initialize(), await this.audioManager.startFromFile(e), this.isRunning = !0, this.render();
    } catch (t) {
      throw console.error("Error loading audio file:", t), t;
    }
  }
  /**
   * Start visualization from a static buffer without audio playback
   * Useful for visualizing pre-recorded audio data or processing results
   * @param bufferSource - BufferSource instance containing audio data
   */
  async startFromBuffer(e) {
    try {
      await this.dataProcessor.initialize(), await this.audioManager.startFromBuffer(e), this.isRunning = !0, this.render();
    } catch (t) {
      throw console.error("Error starting from buffer:", t), t;
    }
  }
  async stop() {
    this.isRunning = !1, this.animationId !== null && (cancelAnimationFrame(this.animationId), this.animationId = null), await this.audioManager.stop(), this.frequencyEstimator.clearHistory(), this.zeroCrossDetector.reset(), this.waveformSearcher.reset(), this.comparisonRenderer.clear(), this.cycleSimilarityRenderer && this.cycleSimilarityRenderer.clear(), this.dataProcessor.reset(), this.timingDiagnostics.reset();
  }
  render() {
    if (!this.isRunning)
      return;
    const e = performance.now();
    if (!this.isPaused) {
      const i = performance.now(), s = this.dataProcessor.processFrame(this.renderer.getFFTDisplayEnabled(), this.timingDiagnostics.getDetailedTimingLogsEnabled()), o = performance.now();
      if (s) {
        this.renderCoordinator.renderFrame(s, this.phaseMarkerRangeEnabled);
        const a = performance.now(), r = o - i, h = a - o;
        this.timingDiagnostics.logDetailedTiming(r, h);
      }
    }
    const t = performance.now();
    this.timingDiagnostics.recordFrameTime(e, t), this.animationId = requestAnimationFrame(() => this.render());
  }
  // Getters and setters - delegate to appropriate modules
  getIsRunning() {
    return this.isRunning;
  }
  setAutoGain(e) {
    this.gainController.setAutoGain(e);
  }
  getAutoGainEnabled() {
    return this.gainController.getAutoGainEnabled();
  }
  setNoiseGate(e) {
    this.gainController.setNoiseGate(e);
  }
  getNoiseGateEnabled() {
    return this.gainController.getNoiseGateEnabled();
  }
  setNoiseGateThreshold(e) {
    this.gainController.setNoiseGateThreshold(e);
  }
  getNoiseGateThreshold() {
    return this.gainController.getNoiseGateThreshold();
  }
  setFrequencyEstimationMethod(e) {
    this.frequencyEstimator.setFrequencyEstimationMethod(e);
  }
  getFrequencyEstimationMethod() {
    return this.frequencyEstimator.getFrequencyEstimationMethod();
  }
  setBufferSizeMultiplier(e) {
    this.frequencyEstimator.setBufferSizeMultiplier(e);
  }
  getBufferSizeMultiplier() {
    return this.frequencyEstimator.getBufferSizeMultiplier();
  }
  getEstimatedFrequency() {
    return this.frequencyEstimator.getEstimatedFrequency();
  }
  setFFTDisplay(e) {
    this.renderer.setFFTDisplay(e);
  }
  getFFTDisplayEnabled() {
    return this.renderer.getFFTDisplayEnabled();
  }
  /**
   * Enable or disable harmonic analysis overlay
   * When disabled, the yellow-bordered harmonic analysis panel in the top-left corner is hidden
   * @param enabled - true to show harmonic analysis overlay, false to hide it
   */
  setHarmonicAnalysisEnabled(e) {
    this.renderer.setHarmonicAnalysisEnabled(e);
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
  setDebugOverlaysEnabled(e) {
    this.renderer.setDebugOverlaysEnabled(e);
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
  setOverlaysLayout(e) {
    this.renderer.setOverlaysLayout(e);
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
  setUsePeakMode(e) {
    this.zeroCrossDetector.setUsePeakMode(e);
  }
  getUsePeakMode() {
    return this.zeroCrossDetector.getUsePeakMode();
  }
  setZeroCrossMode(e) {
    this.zeroCrossDetector.setZeroCrossMode(e);
  }
  getZeroCrossMode() {
    return this.zeroCrossDetector.getZeroCrossMode();
  }
  setPauseDrawing(e) {
    this.isPaused = e;
  }
  /**
   * Enable or disable detailed timing logs for performance diagnostics
   * When enabled, logs detailed breakdown of frame processing time
   * When disabled (default), only logs when performance exceeds target threshold
   * @param enabled - true to enable detailed timing logs, false to use threshold-based logging
   */
  setDetailedTimingLogs(e) {
    this.timingDiagnostics.setDetailedTimingLogs(e), this.dataProcessor.setDetailedTimingLogs(e);
  }
  /**
   * Get whether detailed timing logs are enabled
   * @returns true if detailed timing logs are enabled
   */
  getDetailedTimingLogsEnabled() {
    return this.timingDiagnostics.getDetailedTimingLogsEnabled();
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
  setPhaseMarkerRangeEnabled(e) {
    this.phaseMarkerRangeEnabled = e;
  }
  /**
   * Get the current state of phase marker range display mode
   * @returns true if phase marker range display is enabled, false otherwise
   */
  getPhaseMarkerRangeEnabled() {
    return this.phaseMarkerRangeEnabled;
  }
}
class ve {
  constructor(e) {
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
    this.canvas = e;
    const t = e.getContext("2d");
    if (!t)
      throw new Error("Could not get 2D context for piano keyboard");
    this.ctx = t, this.keyboardRange = this.calculateKeyboardRange(), this.whiteKeyCount = this.countWhiteKeys(), this.xOffset = this.calculateCenteringOffset();
  }
  /**
   * 周波数から音名情報を取得
   * utils.tsのfrequencyToNote関数を使用し、内部形式に変換
   */
  frequencyToNoteInfo(e) {
    const t = O(e);
    if (!t)
      return { note: -1, octave: -1, noteInOctave: -1 };
    const i = t.noteName.match(/^([A-G]#?)(\d+)$/);
    if (!i)
      return { note: -1, octave: -1, noteInOctave: -1 };
    const s = i[1], o = parseInt(i[2], 10), r = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].indexOf(s);
    return { note: o * 12 + r, octave: o, noteInOctave: r };
  }
  /**
   * 表示する鍵盤の範囲を計算
   * MIN_FREQからMAX_FREQまでの範囲をカバーする
   */
  calculateKeyboardRange() {
    const e = this.frequencyToNoteInfo(this.MIN_FREQ), t = this.frequencyToNoteInfo(this.MAX_FREQ);
    return {
      startNote: e.note,
      endNote: t.note
    };
  }
  /**
   * 白鍵の数をカウント
   */
  countWhiteKeys() {
    const e = this.keyboardRange;
    let t = 0;
    for (let i = e.startNote; i <= e.endNote; i++) {
      const s = (i % 12 + 12) % 12;
      this.WHITE_KEY_NOTES.includes(s) && t++;
    }
    return t;
  }
  /**
   * 鍵盤をセンタリングするためのX座標オフセットを計算
   */
  calculateCenteringOffset() {
    const e = this.whiteKeyCount * this.WHITE_KEY_WIDTH;
    return (this.canvas.width - e) / 2;
  }
  /**
   * ピアノ鍵盤を描画
   * @param highlightFrequency - ハイライトする周波数 (0の場合はハイライトなし)
   */
  render(e) {
    this.ctx.fillStyle = "#1a1a1a", this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    const t = this.keyboardRange, i = e > 0 ? this.frequencyToNoteInfo(e) : null;
    let s = 0;
    for (let h = t.startNote; h <= t.endNote; h++) {
      const f = (h % 12 + 12) % 12;
      if (this.WHITE_KEY_NOTES.includes(f)) {
        const c = this.xOffset + s * this.WHITE_KEY_WIDTH, u = i && i.note === h;
        this.ctx.fillStyle = u ? this.WHITE_KEY_HIGHLIGHT : this.WHITE_KEY_COLOR, this.ctx.fillRect(c, 0, this.WHITE_KEY_WIDTH, this.WHITE_KEY_HEIGHT), this.ctx.strokeStyle = this.KEY_BORDER, this.ctx.lineWidth = 1, this.ctx.strokeRect(c, 0, this.WHITE_KEY_WIDTH, this.WHITE_KEY_HEIGHT), s++;
      }
    }
    s = 0;
    for (let h = t.startNote; h <= t.endNote; h++) {
      const f = (h % 12 + 12) % 12;
      if (this.WHITE_KEY_NOTES.includes(f) && s++, this.BLACK_KEY_NOTES.includes(f)) {
        const c = this.xOffset + s * this.WHITE_KEY_WIDTH - this.BLACK_KEY_WIDTH / 2, u = i && i.note === h;
        this.ctx.fillStyle = u ? this.BLACK_KEY_HIGHLIGHT : this.BLACK_KEY_COLOR, this.ctx.fillRect(c, 0, this.BLACK_KEY_WIDTH, this.BLACK_KEY_HEIGHT), this.ctx.strokeStyle = this.KEY_BORDER, this.ctx.lineWidth = 1, this.ctx.strokeRect(c, 0, this.BLACK_KEY_WIDTH, this.BLACK_KEY_HEIGHT);
      }
    }
    this.ctx.fillStyle = "#888888", this.ctx.font = "10px monospace", this.ctx.fillText(`${this.MIN_FREQ}Hz`, this.xOffset + 5, this.WHITE_KEY_HEIGHT - 5);
    const o = `${this.MAX_FREQ}Hz`, a = this.ctx.measureText(o).width, r = this.xOffset + this.whiteKeyCount * this.WHITE_KEY_WIDTH;
    this.ctx.fillText(o, r - a - 5, this.WHITE_KEY_HEIGHT - 5);
  }
  /**
   * キャンバスをクリア
   */
  clear() {
    this.ctx.fillStyle = "#1a1a1a", this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
class N {
  /**
   * Create a BufferSource from Float32Array
   * @param buffer - Audio data as Float32Array (values typically in range -1.0 to 1.0)
   * @param sampleRate - Sample rate in Hz (e.g., 44100, 48000)
   * @param options - Optional configuration
   */
  constructor(e, t, i) {
    n(this, "buffer");
    n(this, "sampleRate");
    n(this, "position", 0);
    n(this, "chunkSize", 4096);
    // Default FFT size
    n(this, "isLooping", !1);
    if (t <= 0 || !isFinite(t))
      throw new Error("Sample rate must be a positive finite number");
    if (this.buffer = e, this.sampleRate = t, (i == null ? void 0 : i.chunkSize) !== void 0) {
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
  static fromAudioBuffer(e, t) {
    const i = (t == null ? void 0 : t.channel) ?? 0;
    if (i < 0 || i >= e.numberOfChannels)
      throw new Error(
        `Invalid channel index ${i}. AudioBuffer has ${e.numberOfChannels} channel(s).`
      );
    const s = e.getChannelData(i);
    return new N(s, e.sampleRate, {
      chunkSize: t == null ? void 0 : t.chunkSize,
      loop: t == null ? void 0 : t.loop
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
    const e = Math.min(this.position + this.chunkSize, this.buffer.length), t = this.buffer.slice(this.position, e);
    if (t.length < this.chunkSize && this.isLooping) {
      const i = this.chunkSize - t.length, s = Math.min(i, this.buffer.length), o = new Float32Array(this.chunkSize);
      return o.set(t, 0), o.set(this.buffer.slice(0, s), t.length), this.position = s, o;
    }
    if (this.position = e, t.length < this.chunkSize) {
      const i = new Float32Array(this.chunkSize);
      return i.set(t, 0), i;
    }
    return t;
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
  seek(e) {
    this.position = Math.max(0, Math.min(e, this.buffer.length));
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
  setChunkSize(e) {
    if (e <= 0 || !isFinite(e) || !Number.isInteger(e))
      throw new Error("Chunk size must be a positive integer");
    this.chunkSize = e;
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
  setLooping(e) {
    this.isLooping = e;
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
  Z as AudioManager,
  N as BufferSource,
  ce as ComparisonPanelRenderer,
  L as CycleSimilarityRenderer,
  U as DEFAULT_OVERLAYS_LAYOUT,
  K as FrameBufferHistory,
  ue as FrameTimingDiagnostics,
  X as FrequencyEstimator,
  Q as GainController,
  le as OffsetOverlayRenderer,
  ye as Oscilloscope,
  ve as PianoKeyboardRenderer,
  he as PositionMarkerRenderer,
  me as RenderCoordinator,
  ae as SimilarityPlotRenderer,
  fe as WaveformDataProcessor,
  oe as WaveformPanelRenderer,
  se as WaveformRenderer,
  re as WaveformSearcher,
  ne as ZeroCrossDetector,
  B as amplitudeToDb,
  q as dbToAmplitude,
  I as resolveValue,
  $ as trimSilence
};
//# sourceMappingURL=cat-oscilloscope.mjs.map
