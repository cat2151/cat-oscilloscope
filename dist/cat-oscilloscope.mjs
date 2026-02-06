var D = Object.defineProperty;
var N = (m, e, t) => e in m ? D(m, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : m[e] = t;
var r = (m, e, t) => N(m, typeof e != "symbol" ? e + "" : e, t);
function q(m) {
  return Math.pow(10, m / 20);
}
function B(m) {
  return m <= 0 ? -1 / 0 : 20 * Math.log10(m);
}
function _(m) {
  if (m <= 0 || !isFinite(m))
    return null;
  const t = 440 * Math.pow(2, -4.75), i = 12 * Math.log2(m / t), s = Math.round(i), o = Math.round((i - s) * 100), h = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"], a = Math.floor(s / 12);
  return {
    noteName: `${h[(s % 12 + 12) % 12]}${a}`,
    cents: o
  };
}
const Y = -48;
function $(m) {
  const e = m.numberOfChannels, t = m.sampleRate, i = m.length, s = [];
  let o = 0;
  for (let d = 0; d < e; d++) {
    const y = m.getChannelData(d);
    s.push(y);
    for (let l = 0; l < i; l++) {
      const u = Math.abs(y[l]);
      u > o && (o = u);
    }
  }
  if (o === 0)
    return m;
  const h = o * Math.pow(10, Y / 20);
  let a = i;
  for (let d = 0; d < i; d++) {
    let y = !0;
    for (let l = 0; l < e; l++)
      if (Math.abs(s[l][d]) > h) {
        y = !1;
        break;
      }
    if (!y) {
      a = d;
      break;
    }
  }
  if (a >= i)
    return m;
  let n = i - 1;
  for (let d = i - 1; d >= a; d--) {
    let y = !0;
    for (let l = 0; l < e; l++)
      if (Math.abs(s[l][d]) > h) {
        y = !1;
        break;
      }
    if (!y) {
      n = d;
      break;
    }
  }
  if (a === 0 && n === i - 1)
    return m;
  const f = n - a + 1, c = new AudioBuffer({
    numberOfChannels: e,
    length: f,
    sampleRate: t
  });
  for (let d = 0; d < e; d++) {
    const y = s[d], l = c.getChannelData(d);
    for (let u = 0; u < f; u++)
      l[u] = y[a + u];
  }
  return c;
}
class K {
  constructor() {
    r(this, "frameBufferHistory", []);
    r(this, "MAX_FRAME_HISTORY", 16);
    // Support up to 16x buffer size
    r(this, "extendedBufferCache", /* @__PURE__ */ new Map());
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
    const i = this.frameBufferHistory.slice(-e), s = i.reduce((a, n) => a + n.length, 0);
    let o = this.extendedBufferCache.get(e);
    (!o || o.length !== s) && (o = new Float32Array(s), this.extendedBufferCache.set(e, o));
    let h = 0;
    for (const a of i)
      o.set(a, h), h += a.length;
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
    r(this, "audioContext", null);
    r(this, "analyser", null);
    r(this, "mediaStream", null);
    r(this, "audioBufferSource", null);
    r(this, "bufferSource", null);
    r(this, "dataArray", null);
    r(this, "frequencyData", null);
    r(this, "frameBufferHistory", new K());
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
      const i = e.getSampleRate(), s = e.getLength(), o = this.audioContext.createBuffer(1, s, i), h = o.getChannelData(0);
      e.reset();
      let a = 0;
      for (; a < s; ) {
        const n = e.getNextChunk();
        if (!n) break;
        h.set(n, a), a += n.length;
      }
      e.reset(), this.initializeAnalyser(), this.audioBufferSource = this.audioContext.createBufferSource(), this.audioBufferSource.buffer = o, this.audioBufferSource.loop = !0, this.audioBufferSource.connect(this.analyser), this.audioBufferSource.start(0), this.bufferSource = null;
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
class U {
  constructor() {
    r(this, "autoGainEnabled", !0);
    r(this, "currentGain", 1);
    r(this, "noiseGateEnabled", !0);
    r(this, "noiseGateThreshold", q(-60));
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
    r(this, "frequencyEstimationMethod", "fft");
    r(this, "estimatedFrequency", 0);
    r(this, "MIN_FREQUENCY_HZ", 20);
    // Minimum detectable frequency (Hz)
    r(this, "MAX_FREQUENCY_HZ", 5e3);
    // Maximum detectable frequency (Hz)
    r(this, "bufferSizeMultiplier", 16);
    // Buffer size multiplier for extended FFT
    r(this, "frequencyPlotHistory", []);
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
function I(m, e) {
  if (typeof m == "string" && m.endsWith("%")) {
    const t = parseFloat(m);
    return isNaN(t) ? (console.warn(`Invalid percentage value: ${m}, using 0`), 0) : t < 0 ? (console.warn(`Negative percentage value: ${m}, clamping to 0`), 0) : Math.floor(e * (t / 100));
  }
  if (typeof m == "string") {
    const t = parseInt(m, 10);
    return isNaN(t) ? (console.warn(`Invalid numeric string: ${m}, using 0`), 0) : Math.max(0, t);
  }
  return typeof m == "number" ? isNaN(m) ? (console.warn(`Invalid number value: ${m}, using 0`), 0) : Math.max(0, Math.floor(m)) : 0;
}
const Q = {
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
    r(this, "ctx");
    r(this, "canvasWidth");
    r(this, "canvasHeight");
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
    let h = t, a = i, n = s, f = o;
    if (e.position.x !== void 0)
      if (typeof e.position.x == "string" && e.position.x.startsWith("right-")) {
        const c = parseInt(e.position.x.substring(6), 10), d = e.size.width !== void 0 && e.size.width !== "auto" ? I(e.size.width, this.canvasWidth) : s;
        h = this.canvasWidth - d - c;
      } else
        h = I(e.position.x, this.canvasWidth);
    return e.position.y !== void 0 && (a = I(e.position.y, this.canvasHeight)), e.size.width !== void 0 && e.size.width !== "auto" && (n = I(e.size.width, this.canvasWidth)), e.size.height !== void 0 && e.size.height !== "auto" && (f = I(e.size.height, this.canvasHeight)), { x: h, y: a, width: n, height: f };
  }
}
class V {
  constructor(e, t, i) {
    r(this, "ctx");
    r(this, "canvasWidth");
    r(this, "canvasHeight");
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
    for (let h = 0; h <= s; h++) {
      const a = this.canvasHeight / s * h;
      this.ctx.moveTo(0, a), this.ctx.lineTo(this.canvasWidth, a);
    }
    const o = 10;
    for (let h = 0; h <= o; h++) {
      const a = this.canvasWidth / o * h;
      this.ctx.moveTo(a, 0), this.ctx.lineTo(a, this.canvasHeight);
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
    const s = t / e * 1e3, o = 10, h = s / o;
    for (let c = 0; c <= o; c++) {
      const d = this.canvasWidth / o * c, y = h * c;
      let l;
      y >= 1e3 ? l = `${(y / 1e3).toFixed(2)}s` : y >= 1 ? l = `${y.toFixed(1)}ms` : l = `${(y * 1e3).toFixed(0)}μs`;
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
        const w = B(Math.abs(l)), g = l > 0 ? "+" : "-", T = Math.abs(w);
        T >= 100 ? u = `${g}${T.toFixed(0)}dB` : u = `${g}${T.toFixed(1)}dB`;
      }
      this.ctx.fillText(u, 3, d + 10);
    }
    this.ctx.restore();
  }
}
class j {
  constructor(e, t, i) {
    r(this, "ctx");
    r(this, "canvasWidth");
    r(this, "canvasHeight");
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
    const h = this.canvasWidth / o, a = this.canvasHeight / 2, f = this.canvasHeight / 2 * s;
    for (let c = 0; c < o; c++) {
      const d = t + c, y = e[d], l = a - y * f, u = Math.min(this.canvasHeight, Math.max(0, l)), w = c * h;
      c === 0 ? this.ctx.moveTo(w, u) : this.ctx.lineTo(w, u);
    }
    this.ctx.stroke();
  }
}
class J extends k {
  constructor() {
    super(...arguments);
    r(this, "FFT_OVERLAY_HEIGHT_RATIO", 0.9);
    // Spectrum bar height ratio within overlay (90%)
    r(this, "FFT_MIN_BAR_WIDTH", 1);
  }
  // Minimum bar width in pixels
  /**
   * Draw FFT spectrum overlay (position and size configurable via layout)
   */
  drawFFTOverlay(t, i, s, o, h, a) {
    const n = s / o, f = Math.floor(this.canvasWidth * 0.35), c = Math.floor(this.canvasHeight * 0.35), d = 10, y = this.canvasHeight - c - 10, { x: l, y: u, width: w, height: g } = this.calculateOverlayDimensions(
      a,
      d,
      y,
      f,
      c
    );
    this.ctx.save(), this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)", this.ctx.fillRect(l, u, w, g), this.ctx.strokeStyle = "#00aaff", this.ctx.lineWidth = 2, this.ctx.strokeRect(l, u, w, g);
    const T = Math.min(
      t.length,
      Math.ceil(h / n)
    ), p = w / T;
    this.ctx.fillStyle = "#00aaff";
    for (let x = 0; x < T; x++) {
      const E = t[x] / 255 * g * this.FFT_OVERLAY_HEIGHT_RATIO, R = l + x * p, P = u + g - E;
      this.ctx.fillRect(R, P, Math.max(p - 1, this.FFT_MIN_BAR_WIDTH), E);
    }
    if (i > 0 && i <= h) {
      const x = i / n, C = l + x * p;
      this.ctx.strokeStyle = "#ff00ff", this.ctx.lineWidth = 2, this.ctx.beginPath(), this.ctx.moveTo(C, u), this.ctx.lineTo(C, u + g), this.ctx.stroke(), this.ctx.fillStyle = "#ff00ff", this.ctx.font = "bold 12px Arial";
      const E = `${i.toFixed(1)} Hz`, R = this.ctx.measureText(E).width;
      let P = C + 3;
      P + R > l + w - 5 && (P = C - R - 3), this.ctx.fillText(E, P, u + 15);
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
  drawHarmonicAnalysis(e, t, i, s, o, h, a, n) {
    if (e === void 0 && !t && !i && !h)
      return;
    const f = 16, d = (1 + // Title
    (e !== void 0 ? 1 : 0) + (t ? 1 : 0) + (i ? 1 : 0) + (h ? 2 : 0)) * f + 10, { x: y, y: l, width: u, height: w } = this.calculateOverlayDimensions(
      n,
      10,
      10,
      500,
      d
    );
    let g = l;
    if (this.ctx.save(), this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)", this.ctx.fillRect(y, l, u, w), this.ctx.strokeStyle = "#ffaa00", this.ctx.lineWidth = 2, this.ctx.strokeRect(y, l, u, w), this.ctx.fillStyle = "#ffaa00", this.ctx.font = "bold 12px monospace", g += 15, this.ctx.fillText("倍音分析 (Harmonic Analysis)", y + 5, g), e !== void 0 && a) {
      g += f, this.ctx.fillStyle = "#00ff00", this.ctx.font = "11px monospace";
      const T = a / 2;
      this.ctx.fillText(
        `1/2周波数 (${T.toFixed(1)}Hz) のpeak強度: ${e.toFixed(1)}%`,
        y + 5,
        g
      );
    }
    if (t && a) {
      g += f, this.ctx.fillStyle = "#ff00ff", this.ctx.font = "11px monospace";
      const T = t.map((x, C) => `${C + 1}x:${x.toFixed(2)}`).join(" "), p = s !== void 0 ? ` (重み付け: ${s.toFixed(1)})` : "";
      this.ctx.fillText(
        `候補1 (${a.toFixed(1)}Hz) 倍音: ${T}${p}`,
        y + 5,
        g
      );
    }
    if (i && a) {
      g += f, this.ctx.fillStyle = "#00aaff", this.ctx.font = "11px monospace";
      const T = a / 2, p = i.map((C, E) => `${E + 1}x:${C.toFixed(2)}`).join(" "), x = o !== void 0 ? ` (重み付け: ${o.toFixed(1)})` : "";
      this.ctx.fillText(
        `候補2 (${T.toFixed(1)}Hz) 倍音: ${p}${x}`,
        y + 5,
        g
      );
    }
    if (h) {
      g += f, this.ctx.fillStyle = "#aaaaaa", this.ctx.font = "10px monospace";
      const T = u - 10, p = h.split(" ");
      let x = "";
      for (const C of p) {
        const E = x + (x ? " " : "") + C;
        this.ctx.measureText(E).width > T && x ? (this.ctx.fillText(x, y + 5, g), g += f, x = C) : x = E;
      }
      x && this.ctx.fillText(x, y + 5, g);
    }
    this.ctx.restore();
  }
}
class te extends k {
  constructor() {
    super(...arguments);
    r(this, "FREQ_PLOT_MIN_RANGE_PADDING_HZ", 50);
    // 周波数範囲の最小パディング (Hz)
    r(this, "FREQ_PLOT_RANGE_PADDING_RATIO", 0.1);
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
    const { x: h, y: a, width: n, height: f } = this.calculateOverlayDimensions(
      o,
      this.canvasWidth - 280 - 10,
      10,
      280,
      120
    );
    this.ctx.save(), this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)", this.ctx.fillRect(h, a, n, f), this.ctx.strokeStyle = "#ffaa00", this.ctx.lineWidth = 2, this.ctx.strokeRect(h, a, n, f), this.ctx.fillStyle = "#ffaa00", this.ctx.font = "bold 12px Arial", this.ctx.fillText(`周波数推移 (${t.length}frame)`, h + 5, a + 15);
    const c = h + 35, d = a + 25, y = n - 45, l = f - 45, u = t.filter((v) => v > 0);
    if (u.length === 0) {
      this.ctx.restore();
      return;
    }
    const w = Math.min(...u), g = Math.max(...u), T = (g - w) * this.FREQ_PLOT_RANGE_PADDING_RATIO || this.FREQ_PLOT_MIN_RANGE_PADDING_HZ, p = Math.max(i, w - T), x = Math.min(s, g + T);
    this.ctx.strokeStyle = "#333333", this.ctx.lineWidth = 1, this.ctx.beginPath();
    for (let v = 0; v <= 4; v++) {
      const S = d + l / 4 * v;
      this.ctx.moveTo(c, S), this.ctx.lineTo(c + y, S);
    }
    for (let v = 0; v <= 4; v++) {
      const S = c + y / 4 * v;
      this.ctx.moveTo(S, d), this.ctx.lineTo(S, d + l);
    }
    this.ctx.stroke(), this.ctx.fillStyle = "#aaaaaa", this.ctx.font = "10px monospace", this.ctx.textAlign = "right", this.ctx.textBaseline = "middle";
    for (let v = 0; v <= 4; v++) {
      const S = x - (x - p) * (v / 4), M = d + l / 4 * v, A = S >= 1e3 ? `${(S / 1e3).toFixed(1)}k` : `${S.toFixed(0)}`;
      this.ctx.fillText(A, c - 5, M);
    }
    this.ctx.fillStyle = "#88ccff", this.ctx.font = "9px monospace", this.ctx.textAlign = "right", this.ctx.textBaseline = "middle";
    for (let v = 0; v <= 4; v++) {
      const S = x - (x - p) * (v / 4), M = d + l / 4 * v, A = _(S);
      if (A) {
        const G = A.cents >= 0 ? "+" : "";
        this.ctx.fillText(`${G}${A.cents}¢`, c + y - 5, M);
      }
    }
    this.ctx.strokeStyle = "#00ff00", this.ctx.lineWidth = 2, this.ctx.beginPath();
    const C = y / Math.max(t.length - 1, 1), E = Math.max(1, Math.floor(t.length / 4)), R = (v) => {
      const M = (Math.max(p, Math.min(x, v)) - p) / (x - p);
      return d + l - M * l;
    };
    let P = !1;
    for (let v = 0; v < t.length; v++) {
      const S = t[v], M = c + v * C;
      if (S === 0) {
        P = !1;
        continue;
      }
      const A = R(S);
      P ? this.ctx.lineTo(M, A) : (this.ctx.moveTo(M, A), P = !0);
    }
    this.ctx.stroke(), this.ctx.font = "9px monospace", this.ctx.textAlign = "center", this.ctx.textBaseline = "top";
    for (let v = 0; v < t.length; v++) {
      const S = t[v], M = c + v * C;
      if (S !== 0) {
        const O = R(S);
        this.ctx.fillStyle = "#00ff00", this.ctx.beginPath(), this.ctx.arc(M, O, 2, 0, Math.PI * 2), this.ctx.fill();
      }
      const A = v === t.length - 1;
      if (v % E === 0 || A) {
        this.ctx.fillStyle = "#aaaaaa";
        const O = v - t.length + 1;
        this.ctx.fillText(`${O}`, M, d + l + 2);
      }
    }
    const F = t[t.length - 1];
    if (F > 0) {
      const v = _(F);
      this.ctx.fillStyle = "#00ff00", this.ctx.font = "bold 11px Arial", this.ctx.textAlign = "left", this.ctx.textBaseline = "bottom";
      let S = `${F.toFixed(1)} Hz`;
      if (v) {
        const M = v.cents >= 0 ? "+" : "";
        S += ` (${v.noteName} ${M}${v.cents}¢)`;
      }
      this.ctx.fillText(S, c + 2, d + l - 2);
    }
    this.ctx.restore();
  }
}
class ie {
  constructor(e, t, i, s = !0) {
    r(this, "ctx");
    r(this, "canvasWidth");
    r(this, "canvasHeight");
    r(this, "debugOverlaysEnabled");
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
  drawPhaseMarkers(e, t, i, s, o, h, a) {
    if (o === void 0 || h === void 0)
      return;
    const n = h - o;
    if (n <= 0)
      return;
    this.ctx.save();
    const f = (c, d, y) => {
      const l = c - o;
      if (l < 0 || l >= n)
        return;
      const u = l / n * this.canvasWidth;
      this.ctx.strokeStyle = d, this.ctx.lineWidth = y, this.ctx.beginPath(), this.ctx.moveTo(u, 0), this.ctx.lineTo(u, this.canvasHeight), this.ctx.stroke();
    };
    if (i !== void 0 && f(i, "#ff8800", 2), s !== void 0 && f(s, "#ff8800", 2), e !== void 0 && (f(e, "#ff0000", 2), this.debugOverlaysEnabled && (a == null ? void 0 : a.phaseZeroSegmentRelative) !== void 0)) {
      const d = (e - o) / n * this.canvasWidth, y = 20;
      this.ctx.save(), this.ctx.fillStyle = "#ff0000", this.ctx.font = "12px monospace", this.ctx.textAlign = "left";
      const l = a.phaseZeroSegmentRelative, u = a.phaseZeroHistory ?? "?", w = a.phaseZeroTolerance ?? "?";
      [
        `Mode: ${a.zeroCrossModeName ?? "Unknown"}`,
        `Seg Rel: ${l}`,
        `History: ${u}`,
        `Tolerance: ±${w}`,
        `Range: ${typeof u == "number" && typeof w == "number" ? `${u - w}~${u + w}` : "?"}`
      ].forEach((p, x) => {
        this.ctx.fillText(p, d + 5, y + x * 14);
      }), this.ctx.restore();
    }
    t !== void 0 && f(t, "#ff0000", 2), this.ctx.restore();
  }
}
class se {
  constructor(e, t) {
    r(this, "canvas");
    r(this, "ctx");
    r(this, "fftDisplayEnabled", !0);
    r(this, "harmonicAnalysisEnabled", !1);
    // Control harmonic analysis overlay independently
    r(this, "debugOverlaysEnabled", !0);
    // Control debug overlays (harmonic analysis, frequency plot)
    r(this, "overlaysLayout");
    // Layout configuration for overlays
    // Specialized renderers
    r(this, "gridRenderer");
    r(this, "waveformLineRenderer");
    r(this, "fftOverlayRenderer");
    r(this, "harmonicAnalysisRenderer");
    r(this, "frequencyPlotRenderer");
    r(this, "phaseMarkerRenderer");
    this.canvas = e;
    const i = e.getContext("2d");
    if (!i)
      throw new Error("Could not get 2D context");
    this.ctx = i, this.overlaysLayout = t || Q, this.gridRenderer = new V(this.ctx, e.width, e.height), this.waveformLineRenderer = new j(this.ctx, e.width, e.height), this.fftOverlayRenderer = new J(this.ctx, e.width, e.height), this.harmonicAnalysisRenderer = new ee(this.ctx, e.width, e.height), this.frequencyPlotRenderer = new te(this.ctx, e.width, e.height), this.phaseMarkerRenderer = new ie(this.ctx, e.width, e.height, this.debugOverlaysEnabled), e.width === 300 && e.height === 150 && console.warn(
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
  drawHarmonicAnalysis(e, t, i, s, o, h, a) {
    this.harmonicAnalysisEnabled && this.debugOverlaysEnabled && this.fftDisplayEnabled && (this.updateRendererDimensions(), this.harmonicAnalysisRenderer.drawHarmonicAnalysis(
      e,
      t,
      i,
      s,
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
  drawPhaseMarkers(e, t, i, s, o, h, a) {
    this.updateRendererDimensions(), this.phaseMarkerRenderer.drawPhaseMarkers(
      e,
      t,
      i,
      s,
      o,
      h,
      a
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
class re {
  constructor() {
    r(this, "usePeakMode", !1);
    r(this, "zeroCrossMode", "hysteresis");
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
class ne {
  constructor() {
    r(this, "previousWaveform", null);
    r(this, "lastSimilarity", 0);
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
class ae {
  constructor() {
    // Auto-scaling constants
    r(this, "TARGET_FILL_RATIO", 0.9);
    // Target 90% of distance from center to edge (canvas half-height) for auto-scaled waveforms
    r(this, "MIN_PEAK_THRESHOLD", 1e-3);
    // Minimum peak to trigger auto-scaling (below this uses default)
    r(this, "DEFAULT_AMPLITUDE_RATIO", 0.4);
  }
  // Default scaling factor when peak is too small
  /**
   * Calculate peak amplitude in a given range of data
   * Used for auto-scaling waveforms to fill the vertical space
   */
  findPeakAmplitude(e, t, i) {
    let s = 0;
    const o = Math.max(0, t), h = Math.min(e.length, i);
    for (let a = o; a < h; a++) {
      const n = Math.abs(e[a]);
      n > s && (s = n);
    }
    return s;
  }
  /**
   * Draw a waveform on a canvas with auto-scaling
   * Waveforms are automatically scaled so that peaks reach 90% of the distance
   * from the vertical center line to the top/bottom edge (i.e. 90% of half the height).
   * For example, if peak amplitude is 0.01, it will be scaled 90x relative to that center-to-edge range.
   */
  drawWaveform(e, t, i, s, o, h, a) {
    const n = h - o;
    if (n <= 0) return;
    const f = this.findPeakAmplitude(s, o, h);
    e.strokeStyle = a, e.lineWidth = 1.5, e.beginPath();
    const c = t / n, d = i / 2;
    let y;
    if (f > this.MIN_PEAK_THRESHOLD) {
      const l = this.TARGET_FILL_RATIO / f;
      y = i / 2 * l;
    } else
      y = i * this.DEFAULT_AMPLITUDE_RATIO;
    for (let l = 0; l < n; l++) {
      const u = o + l;
      if (u >= s.length) break;
      const w = s[u], g = d - w * y, T = Math.min(i, Math.max(0, g)), p = l * c;
      l === 0 ? e.moveTo(p, T) : e.lineTo(p, T);
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
   * Clear a canvas
   */
  clearCanvas(e, t, i) {
    e.fillStyle = "#000000", e.fillRect(0, 0, t, i);
  }
}
class oe {
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
    const o = 40, h = 25, a = t - 50, n = i - 35, f = -1, c = 1;
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
      const u = c - (c - f) * (l / 4), w = h + n / 4 * l, g = u.toFixed(2);
      e.fillText(g, o - 5, w);
    }
    e.strokeStyle = "#00aaff", e.lineWidth = 2, e.beginPath();
    const d = a / Math.max(s.length - 1, 1);
    for (let l = 0; l < s.length; l++) {
      const u = s[l], w = o + l * d, T = (Math.max(f, Math.min(c, u)) - f) / (c - f), p = h + n - T * n;
      l === 0 ? e.moveTo(w, p) : e.lineTo(w, p);
    }
    e.stroke();
    const y = s[s.length - 1];
    e.fillStyle = "#00aaff", e.font = "bold 11px Arial", e.textAlign = "left", e.textBaseline = "bottom", e.fillText(`${y.toFixed(3)}`, o + 2, h + n - 2), e.restore();
  }
  /**
   * Draw similarity score text on a canvas
   */
  drawSimilarityText(e, t, i) {
    e.fillStyle = "#00aaff", e.font = "bold 14px Arial";
    const s = `Similarity: ${i.toFixed(3)}`, o = e.measureText(s).width, h = (t - o) / 2;
    e.fillText(s, h, 20);
  }
}
class he {
  /**
   * Draw vertical position markers
   */
  drawPositionMarkers(e, t, i, s, o, h) {
    if (h <= 0) return;
    const a = s / h * t, n = o / h * t;
    e.strokeStyle = "#ff0000", e.lineWidth = 2, e.beginPath(), e.moveTo(a, 0), e.lineTo(a, i), e.stroke(), e.beginPath(), e.moveTo(n, 0), e.lineTo(n, i), e.stroke(), e.fillStyle = "#ff0000", e.font = "10px Arial", e.fillText("S", a + 2, 12), e.fillText("E", n + 2, 12);
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
    const h = Math.min(120, t * 0.4), a = Math.min(60, i * 0.4), n = t - h - 5, f = 5;
    e.fillStyle = "rgba(0, 0, 0, 0.7)", e.fillRect(n, f, h, a), e.strokeStyle = "#00aaff", e.lineWidth = 1, e.strokeRect(n, f, h, a), e.fillStyle = "#00aaff", e.font = "9px Arial", e.fillText("Offset %", n + 2, f + 9);
    const c = 2, d = n + c, y = f + 12, l = h - c * 2, u = a - 12 - c, w = 0, g = 100, T = (p, x) => {
      if (p.length < 2) return;
      e.strokeStyle = x, e.lineWidth = 1.5, e.beginPath();
      const C = l / Math.max(p.length - 1, 1);
      for (let E = 0; E < p.length; E++) {
        const R = p[E], P = d + E * C, v = (Math.max(w, Math.min(g, R)) - w) / (g - w), S = y + u - v * u;
        E === 0 ? e.moveTo(P, S) : e.lineTo(P, S);
      }
      e.stroke();
    };
    if (T(s, "#ff0000"), T(o, "#ff8800"), e.font = "8px monospace", e.textAlign = "left", s.length > 0) {
      const p = s[s.length - 1];
      e.fillStyle = "#ff0000", e.fillText(`S:${p.toFixed(1)}%`, n + 2, f + a - 11);
    }
    if (o.length > 0) {
      const p = o[o.length - 1];
      e.fillStyle = "#ff8800", e.fillText(`E:${p.toFixed(1)}%`, n + 2, f + a - 2);
    }
    e.restore();
  }
}
class ce {
  constructor(e, t, i, s) {
    r(this, "previousCanvas");
    r(this, "currentCanvas");
    r(this, "similarityCanvas");
    r(this, "bufferCanvas");
    r(this, "previousCtx");
    r(this, "currentCtx");
    r(this, "similarityCtx");
    r(this, "bufferCtx");
    // Specialized renderers
    r(this, "waveformRenderer");
    r(this, "similarityPlotRenderer");
    r(this, "positionMarkerRenderer");
    r(this, "offsetOverlayRenderer");
    this.previousCanvas = e, this.currentCanvas = t, this.similarityCanvas = i, this.bufferCanvas = s;
    const o = e.getContext("2d"), h = t.getContext("2d"), a = i.getContext("2d"), n = s.getContext("2d");
    if (!o || !h || !a || !n)
      throw new Error("Could not get 2D context for comparison canvases");
    this.previousCtx = o, this.currentCtx = h, this.similarityCtx = a, this.bufferCtx = n, this.waveformRenderer = new ae(), this.similarityPlotRenderer = new oe(), this.positionMarkerRenderer = new he(), this.offsetOverlayRenderer = new le(), this.clearAllCanvases();
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
   */
  updatePanels(e, t, i, s, o, h, a = [], n = [], f = []) {
    this.clearAllCanvases(), e && (this.waveformRenderer.drawCenterLine(this.previousCtx, this.previousCanvas.width, this.previousCanvas.height), this.waveformRenderer.drawWaveform(
      this.previousCtx,
      this.previousCanvas.width,
      this.previousCanvas.height,
      e,
      0,
      e.length,
      "#ffaa00"
    )), this.waveformRenderer.drawCenterLine(this.currentCtx, this.currentCanvas.width, this.currentCanvas.height), s - i > 0 && this.waveformRenderer.drawWaveform(
      this.currentCtx,
      this.currentCanvas.width,
      this.currentCanvas.height,
      t,
      i,
      s,
      "#00ff00"
    ), e && this.similarityPlotRenderer.drawSimilarityText(this.currentCtx, this.currentCanvas.width, h), this.offsetOverlayRenderer.drawOffsetOverlayGraphs(
      this.currentCtx,
      this.currentCanvas.width,
      this.currentCanvas.height,
      n,
      f
    ), a.length > 0 && this.similarityPlotRenderer.drawSimilarityPlot(
      this.similarityCtx,
      this.similarityCanvas.width,
      this.similarityCanvas.height,
      a
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
    );
  }
  /**
   * Clear all panels (e.g., when stopped)
   */
  clear() {
    this.clearAllCanvases();
  }
}
const b = class b {
  constructor(e, t, i) {
    r(this, "canvas8div");
    r(this, "canvas4div");
    r(this, "canvas2div");
    r(this, "ctx8div");
    r(this, "ctx4div");
    r(this, "ctx2div");
    // History buffers for 100 frames
    r(this, "history8div", []);
    r(this, "history4div", []);
    r(this, "history2div", []);
    this.canvas8div = e, this.canvas4div = t, this.canvas2div = i;
    const s = e.getContext("2d"), o = t.getContext("2d"), h = i.getContext("2d");
    if (!s || !o || !h)
      throw new Error("Could not get 2D context for cycle similarity canvases");
    this.ctx8div = s, this.ctx4div = o, this.ctx2div = h, this.clearAllCanvases();
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
  drawSimilarityGraph(e, t, i, s, o, h) {
    if (e.save(), e.fillStyle = "#000000", e.fillRect(0, 0, t, i), e.strokeStyle = "#ff8800", e.lineWidth = 2, e.strokeRect(0, 0, t, i), e.fillStyle = "#ff8800", e.font = "bold 12px Arial", e.fillText(o, 5, 15), !s || s.length === 0 || !s[0] || s[0].length === 0) {
      e.fillStyle = "#666666", e.font = "11px Arial", e.fillText("データなし (No data)", t / 2 - 50, i / 2), e.restore();
      return;
    }
    const a = 35, n = 25, f = t - 45, c = i - 35, d = -1, y = 1;
    e.strokeStyle = "#333333", e.lineWidth = 1, e.beginPath();
    for (let g = 0; g <= 4; g++) {
      const T = n + c / 4 * g;
      e.moveTo(a, T), e.lineTo(a + f, T);
    }
    for (let g = 0; g <= 4; g++) {
      const T = a + f / 4 * g;
      e.moveTo(T, n), e.lineTo(T, n + c);
    }
    e.stroke(), e.fillStyle = "#aaaaaa", e.font = "10px monospace", e.textAlign = "right", e.textBaseline = "middle";
    for (let g = 0; g <= 4; g++) {
      const T = y - (y - d) * (g / 4), p = n + c / 4 * g, x = T.toFixed(1);
      e.fillText(x, a - 5, p);
    }
    const l = n + c - (0 - d) / (y - d) * c;
    e.strokeStyle = "#666666", e.lineWidth = 1, e.beginPath(), e.moveTo(a, l), e.lineTo(a + f, l), e.stroke();
    const u = s[0].length;
    for (let g = 0; g < u; g++) {
      const T = b.SEGMENT_COLORS[g % b.SEGMENT_COLORS.length];
      e.strokeStyle = T, e.lineWidth = 2, e.beginPath();
      const p = s.length > 1 ? f / (s.length - 1) : 0;
      let x = !1;
      for (let C = 0; C < s.length; C++) {
        const E = s[C];
        if (E && E.length > g) {
          const R = E[g], P = a + C * p, v = (Math.max(d, Math.min(y, R)) - d) / (y - d), S = n + c - v * c;
          x ? e.lineTo(P, S) : (e.moveTo(P, S), x = !0);
        }
      }
      e.stroke();
    }
    const w = s[s.length - 1];
    if (w && w.length > 0) {
      const T = w.length * 11 + 4, p = 65, x = a + f - p - 2, C = n + 2;
      e.fillStyle = "rgba(0, 0, 0, 0.7)", e.fillRect(x, C, p, T), e.strokeStyle = "#555555", e.lineWidth = 1, e.strokeRect(x, C, p, T), e.font = "9px Arial", e.textAlign = "left", e.textBaseline = "top";
      for (let E = 0; E < w.length; E++) {
        const R = b.SEGMENT_COLORS[E % b.SEGMENT_COLORS.length], P = w[E], F = C + 2 + E * 11;
        e.fillStyle = R, e.fillRect(x + 2, F, 8, 8), e.fillStyle = "#ffffff", e.fillText(`${E + 1}-${E + 2}: ${P.toFixed(2)}`, x + 12, F);
      }
    }
    e.fillStyle = "#aaaaaa", e.font = "10px Arial", e.textAlign = "center", e.fillText(h, a + f / 2, i - 3), e.restore();
  }
  /**
   * Update all cycle similarity graphs
   * @param similarities8div 8 divisions (1/2 cycle each): 7 similarity values
   * @param similarities4div 4 divisions (1 cycle each): 3 similarity values
   * @param similarities2div 2 divisions (2 cycles each): 1 similarity value
   */
  updateGraphs(e, t, i) {
    e && e.length > 0 && (this.history8div.push(e), this.history8div.length > b.HISTORY_SIZE && this.history8div.shift()), t && t.length > 0 && (this.history4div.push(t), this.history4div.length > b.HISTORY_SIZE && this.history4div.shift()), i && i.length > 0 && (this.history2div.push(i), this.history2div.length > b.HISTORY_SIZE && this.history2div.shift()), this.drawSimilarityGraph(
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
r(b, "HISTORY_SIZE", 100), r(b, "SEGMENT_COLORS", ["#00ff00", "#88ff00", "#ffaa00", "#ff6600", "#ff0000", "#ff00ff", "#00ffff"]);
let W = b;
const H = class H {
  constructor() {
    r(this, "cachedBasePath", null);
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
          for (const h of H.ASSET_PATTERNS) {
            const a = o.indexOf(h);
            if (a >= 0)
              return a === 0 ? "/" : o.substring(0, a) + "/";
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
r(H, "ASSET_PATTERNS", ["/assets/", "/js/", "/dist/"]);
let L = H;
class fe {
  constructor() {
    r(this, "wasmProcessor", null);
    r(this, "isInitialized", !1);
    r(this, "LOAD_TIMEOUT_MS", 1e4);
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
          a(), i(new Error(`WASM module loading timed out after ${this.LOAD_TIMEOUT_MS / 1e3} seconds`));
        }, this.LOAD_TIMEOUT_MS), o = `${e}wasm/signal_processor_wasm.js`, h = document.createElement("script");
        h.type = "module", h.textContent = `
        import init, { WasmDataProcessor } from '${o}';
        await init();
        window.wasmProcessor = { WasmDataProcessor };
        window.dispatchEvent(new Event('wasmLoaded'));
      `;
        const a = () => {
          clearTimeout(s), window.removeEventListener("wasmLoaded", n);
        }, n = () => {
          a(), window.wasmProcessor && window.wasmProcessor.WasmDataProcessor ? (this.wasmProcessor = new window.wasmProcessor.WasmDataProcessor(), this.isInitialized = !0, t()) : i(new Error("WASM module loaded but WasmDataProcessor not found"));
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
class de {
  constructor(e, t, i, s, o) {
    r(this, "audioManager");
    r(this, "gainController");
    r(this, "frequencyEstimator");
    r(this, "waveformSearcher");
    r(this, "zeroCrossDetector");
    r(this, "basePathResolver");
    r(this, "wasmLoader");
    // Phase marker offset history for overlay graphs (issue #236)
    r(this, "phaseZeroOffsetHistory", []);
    r(this, "phaseTwoPiOffsetHistory", []);
    r(this, "MAX_OFFSET_HISTORY", 100);
    // Keep last 100 frames of offset data
    // Diagnostic tracking for issue #254 analysis
    r(this, "previousPhaseZeroIndex");
    r(this, "previousPhaseTwoPiIndex");
    this.audioManager = e, this.gainController = t, this.frequencyEstimator = i, this.waveformSearcher = s, this.zeroCrossDetector = o, this.basePathResolver = new L(), this.wasmLoader = new fe();
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
   */
  processFrame(e) {
    const t = this.wasmLoader.getProcessor();
    if (!this.wasmLoader.isReady() || !t)
      return console.warn("WASM processor not initialized"), null;
    if (!this.audioManager.isReady())
      return null;
    const i = this.audioManager.getTimeDomainData();
    if (!i)
      return null;
    const s = this.audioManager.getSampleRate(), o = this.audioManager.getFFTSize(), h = this.frequencyEstimator.getFrequencyEstimationMethod() === "fft" || e;
    let a = h ? this.audioManager.getFrequencyData() : null;
    if (h && !a && i) {
      const c = t.computeFrequencyData(i, o);
      c && (a = new Uint8Array(c));
    }
    this.syncConfigToWasm();
    const n = t.processFrame(
      i,
      a,
      s,
      o,
      e
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
   * Issue #254: Added diagnostic logging to identify source of offset spikes
   * @param renderData - Render data containing phase indices
   */
  updatePhaseOffsetHistory(e) {
    if (e.displayStartIndex === void 0 || e.displayEndIndex === void 0)
      return;
    const t = e.displayEndIndex - e.displayStartIndex;
    if (t <= 0)
      return;
    let i = !1;
    const s = {
      frame: Date.now(),
      fourCycleWindow: {
        lengthSamples: t
        // Length of 4-cycle display window
      }
    };
    if (e.phaseZeroIndex !== void 0) {
      const h = (e.phaseZeroIndex - e.displayStartIndex) / t * 100;
      if (s.phaseZero = {
        startOffsetPercent: h
        // Position within 4-cycle window (0-100%)
      }, this.previousPhaseZeroIndex !== void 0) {
        const a = this.phaseZeroOffsetHistory[this.phaseZeroOffsetHistory.length - 1];
        if (a !== void 0) {
          const n = Math.abs(h - a);
          s.phaseZero.offsetChange = n, s.phaseZero.previousOffsetPercent = a, n > 1 && (i = !0, s.phaseZero.SPEC_VIOLATION = !0);
        }
      }
      this.phaseZeroOffsetHistory.push(h), this.phaseZeroOffsetHistory.length > this.MAX_OFFSET_HISTORY && this.phaseZeroOffsetHistory.shift(), this.previousPhaseZeroIndex = e.phaseZeroIndex;
    }
    if (e.phaseTwoPiIndex !== void 0) {
      const h = (e.phaseTwoPiIndex - e.displayStartIndex) / t * 100;
      if (s.phaseTwoPi = {
        endOffsetPercent: h
        // Position within 4-cycle window (0-100%)
      }, this.previousPhaseTwoPiIndex !== void 0) {
        const a = this.phaseTwoPiOffsetHistory[this.phaseTwoPiOffsetHistory.length - 1];
        if (a !== void 0) {
          const n = Math.abs(h - a);
          s.phaseTwoPi.offsetChange = n, s.phaseTwoPi.previousOffsetPercent = a, n > 1 && (i = !0, s.phaseTwoPi.SPEC_VIOLATION = !0);
        }
      }
      this.phaseTwoPiOffsetHistory.push(h), this.phaseTwoPiOffsetHistory.length > this.MAX_OFFSET_HISTORY && this.phaseTwoPiOffsetHistory.shift(), this.previousPhaseTwoPiIndex = e.phaseTwoPiIndex;
    }
    i && (console.warn("[1% Spec Violation Detected - Issue #254]", s), console.warn("→ Offset within 4-cycle window moved by more than 1% in one frame"));
  }
  /**
   * Reset the WASM processor state
   */
  reset() {
    const e = this.wasmLoader.getProcessor();
    e && e.reset(), this.phaseZeroOffsetHistory = [], this.phaseTwoPiOffsetHistory = [], this.previousPhaseZeroIndex = void 0, this.previousPhaseTwoPiIndex = void 0;
  }
}
class me {
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
  constructor(e, t, i, s, o, h, a, n, f) {
    r(this, "audioManager");
    r(this, "gainController");
    r(this, "frequencyEstimator");
    r(this, "renderer");
    r(this, "zeroCrossDetector");
    r(this, "waveformSearcher");
    r(this, "comparisonRenderer");
    r(this, "cycleSimilarityRenderer", null);
    r(this, "dataProcessor");
    r(this, "animationId", null);
    r(this, "isRunning", !1);
    r(this, "isPaused", !1);
    r(this, "phaseMarkerRangeEnabled", !0);
    // Default: on
    // Frame processing diagnostics
    r(this, "lastFrameTime", 0);
    r(this, "frameProcessingTimes", []);
    r(this, "MAX_FRAME_TIMES", 100);
    r(this, "TARGET_FRAME_TIME", 16.67);
    // 60fps target
    r(this, "FPS_LOG_INTERVAL_FRAMES", 60);
    this.audioManager = new Z(), this.gainController = new U(), this.frequencyEstimator = new X(), this.renderer = new se(e, f), this.zeroCrossDetector = new re(), this.waveformSearcher = new ne(), this.comparisonRenderer = new ce(
      t,
      i,
      s,
      o
    ), h && a && n && (this.cycleSimilarityRenderer = new W(
      h,
      a,
      n
    )), this.dataProcessor = new de(
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
    this.isRunning = !1, this.animationId !== null && (cancelAnimationFrame(this.animationId), this.animationId = null), await this.audioManager.stop(), this.frequencyEstimator.clearHistory(), this.zeroCrossDetector.reset(), this.waveformSearcher.reset(), this.comparisonRenderer.clear(), this.cycleSimilarityRenderer && this.cycleSimilarityRenderer.clear(), this.dataProcessor.reset();
  }
  render() {
    if (!this.isRunning)
      return;
    const e = performance.now();
    if (!this.isPaused) {
      const s = this.dataProcessor.processFrame(this.renderer.getFFTDisplayEnabled());
      s && this.renderFrame(s);
    }
    const i = performance.now() - e;
    if (this.frameProcessingTimes.push(i), this.frameProcessingTimes.length > this.MAX_FRAME_TIMES && this.frameProcessingTimes.shift(), i > this.TARGET_FRAME_TIME && console.warn(`Frame processing time: ${i.toFixed(2)}ms (target: <${this.TARGET_FRAME_TIME}ms)`), this.lastFrameTime > 0) {
      const o = 1e3 / (e - this.lastFrameTime);
      if (this.frameProcessingTimes.length === this.FPS_LOG_INTERVAL_FRAMES) {
        const h = this.frameProcessingTimes.reduce((a, n) => a + n, 0) / this.frameProcessingTimes.length;
        console.log(`FPS: ${o.toFixed(1)}, Avg frame time: ${h.toFixed(2)}ms`);
      }
    }
    this.lastFrameTime = e, this.animationId = requestAnimationFrame(() => this.render());
  }
  /**
   * Render a single frame using pre-processed data
   * This method contains only rendering logic - no data processing
   */
  renderFrame(e) {
    let t = e.displayStartIndex, i = e.displayEndIndex;
    this.phaseMarkerRangeEnabled && e.phaseMinusQuarterPiIndex !== void 0 && e.phaseTwoPiPlusQuarterPiIndex !== void 0 && e.phaseMinusQuarterPiIndex <= e.phaseTwoPiPlusQuarterPiIndex && (t = e.phaseMinusQuarterPiIndex, i = e.phaseTwoPiPlusQuarterPiIndex);
    const s = i - t;
    this.renderer.clearAndDrawGrid(
      e.sampleRate,
      s,
      e.gain
    ), this.renderer.drawWaveform(
      e.waveformData,
      t,
      i,
      e.gain
    ), this.renderer.drawPhaseMarkers(
      e.phaseZeroIndex,
      e.phaseTwoPiIndex,
      e.phaseMinusQuarterPiIndex,
      e.phaseTwoPiPlusQuarterPiIndex,
      t,
      i,
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
      e.phaseTwoPiOffsetHistory
    ), this.cycleSimilarityRenderer && this.cycleSimilarityRenderer.updateGraphs(
      e.cycleSimilarities8div,
      e.cycleSimilarities4div,
      e.cycleSimilarities2div
    );
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
class ye {
  constructor(e) {
    r(this, "canvas");
    r(this, "ctx");
    // 周波数範囲 (50Hz～2000Hz)
    r(this, "MIN_FREQ", 50);
    r(this, "MAX_FREQ", 2e3);
    // ピアノ鍵盤の定数
    r(this, "WHITE_KEY_WIDTH", 20);
    r(this, "WHITE_KEY_HEIGHT", 60);
    r(this, "BLACK_KEY_WIDTH", 12);
    r(this, "BLACK_KEY_HEIGHT", 38);
    // 色定義
    r(this, "WHITE_KEY_COLOR", "#ffffff");
    r(this, "BLACK_KEY_COLOR", "#000000");
    r(this, "WHITE_KEY_HIGHLIGHT", "#00ff00");
    r(this, "BLACK_KEY_HIGHLIGHT", "#00cc00");
    r(this, "KEY_BORDER", "#333333");
    // 音名パターン定数（配列アロケーションを避けるため）
    // 白鍵: C(0), D(2), E(4), F(5), G(7), A(9), B(11)
    r(this, "WHITE_KEY_NOTES", [0, 2, 4, 5, 7, 9, 11]);
    // 黒鍵: C#(1), D#(3), F#(6), G#(8), A#(10)
    r(this, "BLACK_KEY_NOTES", [1, 3, 6, 8, 10]);
    // キャッシュされた鍵盤範囲（コンストラクタで一度だけ計算）
    r(this, "keyboardRange");
    // センタリング用のオフセット（コンストラクタで一度だけ計算）
    r(this, "xOffset");
    // 白鍵の総数（コンストラクタで一度だけ計算）
    r(this, "whiteKeyCount");
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
    const t = _(e);
    if (!t)
      return { note: -1, octave: -1, noteInOctave: -1 };
    const i = t.noteName.match(/^([A-G]#?)(\d+)$/);
    if (!i)
      return { note: -1, octave: -1, noteInOctave: -1 };
    const s = i[1], o = parseInt(i[2], 10), a = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].indexOf(s);
    return { note: o * 12 + a, octave: o, noteInOctave: a };
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
    for (let n = t.startNote; n <= t.endNote; n++) {
      const f = (n % 12 + 12) % 12;
      if (this.WHITE_KEY_NOTES.includes(f)) {
        const c = this.xOffset + s * this.WHITE_KEY_WIDTH, d = i && i.note === n;
        this.ctx.fillStyle = d ? this.WHITE_KEY_HIGHLIGHT : this.WHITE_KEY_COLOR, this.ctx.fillRect(c, 0, this.WHITE_KEY_WIDTH, this.WHITE_KEY_HEIGHT), this.ctx.strokeStyle = this.KEY_BORDER, this.ctx.lineWidth = 1, this.ctx.strokeRect(c, 0, this.WHITE_KEY_WIDTH, this.WHITE_KEY_HEIGHT), s++;
      }
    }
    s = 0;
    for (let n = t.startNote; n <= t.endNote; n++) {
      const f = (n % 12 + 12) % 12;
      if (this.WHITE_KEY_NOTES.includes(f) && s++, this.BLACK_KEY_NOTES.includes(f)) {
        const c = this.xOffset + s * this.WHITE_KEY_WIDTH - this.BLACK_KEY_WIDTH / 2, d = i && i.note === n;
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
class z {
  /**
   * Create a BufferSource from Float32Array
   * @param buffer - Audio data as Float32Array (values typically in range -1.0 to 1.0)
   * @param sampleRate - Sample rate in Hz (e.g., 44100, 48000)
   * @param options - Optional configuration
   */
  constructor(e, t, i) {
    r(this, "buffer");
    r(this, "sampleRate");
    r(this, "position", 0);
    r(this, "chunkSize", 4096);
    // Default FFT size
    r(this, "isLooping", !1);
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
    return new z(s, e.sampleRate, {
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
  z as BufferSource,
  ce as ComparisonPanelRenderer,
  W as CycleSimilarityRenderer,
  Q as DEFAULT_OVERLAYS_LAYOUT,
  K as FrameBufferHistory,
  X as FrequencyEstimator,
  U as GainController,
  le as OffsetOverlayRenderer,
  me as Oscilloscope,
  ye as PianoKeyboardRenderer,
  he as PositionMarkerRenderer,
  oe as SimilarityPlotRenderer,
  de as WaveformDataProcessor,
  ae as WaveformPanelRenderer,
  se as WaveformRenderer,
  ne as WaveformSearcher,
  re as ZeroCrossDetector,
  B as amplitudeToDb,
  q as dbToAmplitude,
  I as resolveValue,
  $ as trimSilence
};
//# sourceMappingURL=cat-oscilloscope.mjs.map
