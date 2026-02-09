var N = Object.defineProperty;
var z = (y, e, t) => e in y ? N(y, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : y[e] = t;
var r = (y, e, t) => z(y, typeof e != "symbol" ? e + "" : e, t);
function q(y) {
  return Math.pow(10, y / 20);
}
function B(y) {
  return y <= 0 ? -1 / 0 : 20 * Math.log10(y);
}
function O(y) {
  if (y <= 0 || !isFinite(y))
    return null;
  const t = 440 * Math.pow(2, -4.75), i = 12 * Math.log2(y / t), s = Math.round(i), o = Math.round((i - s) * 100), a = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"], n = Math.floor(s / 12);
  return {
    noteName: `${a[(s % 12 + 12) % 12]}${n}`,
    cents: o
  };
}
const Y = -48;
function $(y) {
  const e = y.numberOfChannels, t = y.sampleRate, i = y.length, s = [];
  let o = 0;
  for (let u = 0; u < e; u++) {
    const g = y.getChannelData(u);
    s.push(g);
    for (let c = 0; c < i; c++) {
      const m = Math.abs(g[c]);
      m > o && (o = m);
    }
  }
  if (o === 0)
    return y;
  const a = o * Math.pow(10, Y / 20);
  let n = i;
  for (let u = 0; u < i; u++) {
    let g = !0;
    for (let c = 0; c < e; c++)
      if (Math.abs(s[c][u]) > a) {
        g = !1;
        break;
      }
    if (!g) {
      n = u;
      break;
    }
  }
  if (n >= i)
    return y;
  let h = i - 1;
  for (let u = i - 1; u >= n; u--) {
    let g = !0;
    for (let c = 0; c < e; c++)
      if (Math.abs(s[c][u]) > a) {
        g = !1;
        break;
      }
    if (!g) {
      h = u;
      break;
    }
  }
  if (n === 0 && h === i - 1)
    return y;
  const d = h - n + 1, f = new AudioBuffer({
    numberOfChannels: e,
    length: d,
    sampleRate: t
  });
  for (let u = 0; u < e; u++) {
    const g = s[u], c = f.getChannelData(u);
    for (let m = 0; m < d; m++)
      c[m] = g[n + m];
  }
  return f;
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
    const i = this.frameBufferHistory.slice(-e), s = i.reduce((n, h) => n + h.length, 0);
    let o = this.extendedBufferCache.get(e);
    (!o || o.length !== s) && (o = new Float32Array(s), this.extendedBufferCache.set(e, o));
    let a = 0;
    for (const n of i)
      o.set(n, a), a += n.length;
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
      const i = e.getSampleRate(), s = e.getLength(), o = this.audioContext.createBuffer(1, s, i), a = o.getChannelData(0);
      let n = 0;
      for (; n < s; ) {
        const h = e.getNextChunk();
        if (!h) break;
        const d = s - n;
        h.length <= d ? (a.set(h, n), n += h.length) : (a.set(h.subarray(0, d), n), n += d);
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
class U {
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
const X = {
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
    let a = t, n = i, h = s, d = o;
    if (e.position.x !== void 0)
      if (typeof e.position.x == "string" && e.position.x.startsWith("right-")) {
        const f = parseInt(e.position.x.substring(6), 10), u = e.size.width !== void 0 && e.size.width !== "auto" ? I(e.size.width, this.canvasWidth) : s;
        a = this.canvasWidth - u - f;
      } else
        a = I(e.position.x, this.canvasWidth);
    return e.position.y !== void 0 && (n = I(e.position.y, this.canvasHeight)), e.size.width !== void 0 && e.size.width !== "auto" && (h = I(e.size.width, this.canvasWidth)), e.size.height !== void 0 && e.size.height !== "auto" && (d = I(e.size.height, this.canvasHeight)), { x: a, y: n, width: h, height: d };
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
    for (let a = 0; a <= s; a++) {
      const n = this.canvasHeight / s * a;
      this.ctx.moveTo(0, n), this.ctx.lineTo(this.canvasWidth, n);
    }
    const o = 10;
    for (let a = 0; a <= o; a++) {
      const n = this.canvasWidth / o * a;
      this.ctx.moveTo(n, 0), this.ctx.lineTo(n, this.canvasHeight);
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
    for (let f = 0; f <= o; f++) {
      const u = this.canvasWidth / o * f, g = a * f;
      let c;
      g >= 1e3 ? c = `${(g / 1e3).toFixed(2)}s` : g >= 1 ? c = `${g.toFixed(1)}ms` : c = `${(g * 1e3).toFixed(0)}μs`;
      const m = this.ctx.measureText(c).width, v = Math.max(2, Math.min(u - m / 2, this.canvasWidth - m - 2));
      this.ctx.fillText(c, v, this.canvasHeight - 3);
    }
    const n = 5, d = 1 / (n / 2 * i);
    for (let f = 0; f <= n; f++) {
      const u = this.canvasHeight / n * f, c = (n / 2 - f) * d;
      let m;
      if (c === 0)
        m = "0dB*";
      else {
        const v = B(Math.abs(c)), l = c > 0 ? "+" : "-", x = Math.abs(v);
        x >= 100 ? m = `${l}${x.toFixed(0)}dB` : m = `${l}${x.toFixed(1)}dB`;
      }
      this.ctx.fillText(m, 3, u + 10);
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
    const a = this.canvasWidth / o, n = this.canvasHeight / 2, d = this.canvasHeight / 2 * s;
    for (let f = 0; f < o; f++) {
      const u = t + f, g = e[u], c = n - g * d, m = Math.min(this.canvasHeight, Math.max(0, c)), v = f * a;
      f === 0 ? this.ctx.moveTo(v, m) : this.ctx.lineTo(v, m);
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
  drawFFTOverlay(t, i, s, o, a, n) {
    const h = s / o, d = Math.floor(this.canvasWidth * 0.35), f = Math.floor(this.canvasHeight * 0.35), u = 10, g = this.canvasHeight - f - 10, { x: c, y: m, width: v, height: l } = this.calculateOverlayDimensions(
      n,
      u,
      g,
      d,
      f
    );
    this.ctx.save(), this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)", this.ctx.fillRect(c, m, v, l), this.ctx.strokeStyle = "#00aaff", this.ctx.lineWidth = 2, this.ctx.strokeRect(c, m, v, l);
    const x = Math.min(
      t.length,
      Math.ceil(a / h)
    ), w = v / x;
    this.ctx.fillStyle = "#00aaff";
    for (let p = 0; p < x; p++) {
      const S = t[p] / 255 * l * this.FFT_OVERLAY_HEIGHT_RATIO, R = c + p * w, M = m + l - S;
      this.ctx.fillRect(R, M, Math.max(w - 1, this.FFT_MIN_BAR_WIDTH), S);
    }
    if (i > 0 && i <= a) {
      const p = i / h, E = c + p * w;
      this.ctx.strokeStyle = "#ff00ff", this.ctx.lineWidth = 2, this.ctx.beginPath(), this.ctx.moveTo(E, m), this.ctx.lineTo(E, m + l), this.ctx.stroke(), this.ctx.fillStyle = "#ff00ff", this.ctx.font = "bold 12px Arial";
      const S = `${i.toFixed(1)} Hz`, R = this.ctx.measureText(S).width;
      let M = E + 3;
      M + R > c + v - 5 && (M = E - R - 3), this.ctx.fillText(S, M, m + 15);
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
  drawHarmonicAnalysis(e, t, i, s, o, a, n, h) {
    if (e === void 0 && !t && !i && !a)
      return;
    const d = 16, u = (1 + // Title
    (e !== void 0 ? 1 : 0) + (t ? 1 : 0) + (i ? 1 : 0) + (a ? 2 : 0)) * d + 10, { x: g, y: c, width: m, height: v } = this.calculateOverlayDimensions(
      h,
      10,
      10,
      500,
      u
    );
    let l = c;
    if (this.ctx.save(), this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)", this.ctx.fillRect(g, c, m, v), this.ctx.strokeStyle = "#ffaa00", this.ctx.lineWidth = 2, this.ctx.strokeRect(g, c, m, v), this.ctx.fillStyle = "#ffaa00", this.ctx.font = "bold 12px monospace", l += 15, this.ctx.fillText("倍音分析 (Harmonic Analysis)", g + 5, l), e !== void 0 && n) {
      l += d, this.ctx.fillStyle = "#00ff00", this.ctx.font = "11px monospace";
      const x = n / 2;
      this.ctx.fillText(
        `1/2周波数 (${x.toFixed(1)}Hz) のpeak強度: ${e.toFixed(1)}%`,
        g + 5,
        l
      );
    }
    if (t && n) {
      l += d, this.ctx.fillStyle = "#ff00ff", this.ctx.font = "11px monospace";
      const x = t.map((p, E) => `${E + 1}x:${p.toFixed(2)}`).join(" "), w = s !== void 0 ? ` (重み付け: ${s.toFixed(1)})` : "";
      this.ctx.fillText(
        `候補1 (${n.toFixed(1)}Hz) 倍音: ${x}${w}`,
        g + 5,
        l
      );
    }
    if (i && n) {
      l += d, this.ctx.fillStyle = "#00aaff", this.ctx.font = "11px monospace";
      const x = n / 2, w = i.map((E, S) => `${S + 1}x:${E.toFixed(2)}`).join(" "), p = o !== void 0 ? ` (重み付け: ${o.toFixed(1)})` : "";
      this.ctx.fillText(
        `候補2 (${x.toFixed(1)}Hz) 倍音: ${w}${p}`,
        g + 5,
        l
      );
    }
    if (a) {
      l += d, this.ctx.fillStyle = "#aaaaaa", this.ctx.font = "10px monospace";
      const x = m - 10, w = a.split(" ");
      let p = "";
      for (const E of w) {
        const S = p + (p ? " " : "") + E;
        this.ctx.measureText(S).width > x && p ? (this.ctx.fillText(p, g + 5, l), l += d, p = E) : p = S;
      }
      p && this.ctx.fillText(p, g + 5, l);
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
    const { x: a, y: n, width: h, height: d } = this.calculateOverlayDimensions(
      o,
      this.canvasWidth - 280 - 10,
      10,
      280,
      120
    );
    this.ctx.save(), this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)", this.ctx.fillRect(a, n, h, d), this.ctx.strokeStyle = "#ffaa00", this.ctx.lineWidth = 2, this.ctx.strokeRect(a, n, h, d), this.ctx.fillStyle = "#ffaa00", this.ctx.font = "bold 12px Arial", this.ctx.fillText(`周波数推移 (${t.length}frame)`, a + 5, n + 15);
    const f = a + 35, u = n + 25, g = h - 45, c = d - 45, m = t.filter((T) => T > 0);
    if (m.length === 0) {
      this.ctx.restore();
      return;
    }
    const v = Math.min(...m), l = Math.max(...m), x = (l - v) * this.FREQ_PLOT_RANGE_PADDING_RATIO || this.FREQ_PLOT_MIN_RANGE_PADDING_HZ, w = Math.max(i, v - x), p = Math.min(s, l + x);
    this.ctx.strokeStyle = "#333333", this.ctx.lineWidth = 1, this.ctx.beginPath();
    for (let T = 0; T <= 4; T++) {
      const P = u + c / 4 * T;
      this.ctx.moveTo(f, P), this.ctx.lineTo(f + g, P);
    }
    for (let T = 0; T <= 4; T++) {
      const P = f + g / 4 * T;
      this.ctx.moveTo(P, u), this.ctx.lineTo(P, u + c);
    }
    this.ctx.stroke(), this.ctx.fillStyle = "#aaaaaa", this.ctx.font = "10px monospace", this.ctx.textAlign = "right", this.ctx.textBaseline = "middle";
    for (let T = 0; T <= 4; T++) {
      const P = p - (p - w) * (T / 4), b = u + c / 4 * T, A = P >= 1e3 ? `${(P / 1e3).toFixed(1)}k` : `${P.toFixed(0)}`;
      this.ctx.fillText(A, f - 5, b);
    }
    this.ctx.fillStyle = "#88ccff", this.ctx.font = "9px monospace", this.ctx.textAlign = "right", this.ctx.textBaseline = "middle";
    for (let T = 0; T <= 4; T++) {
      const P = p - (p - w) * (T / 4), b = u + c / 4 * T, A = O(P);
      if (A) {
        const D = A.cents >= 0 ? "+" : "";
        this.ctx.fillText(`${D}${A.cents}¢`, f + g - 5, b);
      }
    }
    this.ctx.strokeStyle = "#00ff00", this.ctx.lineWidth = 2, this.ctx.beginPath();
    const E = g / Math.max(t.length - 1, 1), S = Math.max(1, Math.floor(t.length / 4)), R = (T) => {
      const b = (Math.max(w, Math.min(p, T)) - w) / (p - w);
      return u + c - b * c;
    };
    let M = !1;
    for (let T = 0; T < t.length; T++) {
      const P = t[T], b = f + T * E;
      if (P === 0) {
        M = !1;
        continue;
      }
      const A = R(P);
      M ? this.ctx.lineTo(b, A) : (this.ctx.moveTo(b, A), M = !0);
    }
    this.ctx.stroke(), this.ctx.font = "9px monospace", this.ctx.textAlign = "center", this.ctx.textBaseline = "top";
    for (let T = 0; T < t.length; T++) {
      const P = t[T], b = f + T * E;
      if (P !== 0) {
        const H = R(P);
        this.ctx.fillStyle = "#00ff00", this.ctx.beginPath(), this.ctx.arc(b, H, 2, 0, Math.PI * 2), this.ctx.fill();
      }
      const A = T === t.length - 1;
      if (T % S === 0 || A) {
        this.ctx.fillStyle = "#aaaaaa";
        const H = T - t.length + 1;
        this.ctx.fillText(`${H}`, b, u + c + 2);
      }
    }
    const C = t[t.length - 1];
    if (C > 0) {
      const T = O(C);
      this.ctx.fillStyle = "#00ff00", this.ctx.font = "bold 11px Arial", this.ctx.textAlign = "left", this.ctx.textBaseline = "bottom";
      let P = `${C.toFixed(1)} Hz`;
      if (T) {
        const b = T.cents >= 0 ? "+" : "";
        P += ` (${T.noteName} ${b}${T.cents}¢)`;
      }
      this.ctx.fillText(P, f + 2, u + c - 2);
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
  drawPhaseMarkers(e, t, i, s, o, a, n) {
    if (o === void 0 || a === void 0)
      return;
    const h = a - o;
    if (h <= 0)
      return;
    this.ctx.save();
    const d = (f, u, g) => {
      const c = f - o;
      if (c < 0 || c >= h)
        return;
      const m = c / h * this.canvasWidth;
      this.ctx.strokeStyle = u, this.ctx.lineWidth = g, this.ctx.beginPath(), this.ctx.moveTo(m, 0), this.ctx.lineTo(m, this.canvasHeight), this.ctx.stroke();
    };
    if (i !== void 0 && d(i, "#ff8800", 2), s !== void 0 && d(s, "#ff8800", 2), e !== void 0 && (d(e, "#ff0000", 2), this.debugOverlaysEnabled && (n == null ? void 0 : n.phaseZeroSegmentRelative) !== void 0)) {
      const u = (e - o) / h * this.canvasWidth, g = 20;
      this.ctx.save(), this.ctx.fillStyle = "#ff0000", this.ctx.font = "12px monospace", this.ctx.textAlign = "left";
      const c = n.phaseZeroSegmentRelative, m = n.phaseZeroHistory ?? "?", v = n.phaseZeroTolerance ?? "?";
      [
        `Mode: ${n.zeroCrossModeName ?? "Unknown"}`,
        `Seg Rel: ${c}`,
        `History: ${m}`,
        `Tolerance: ±${v}`,
        `Range: ${typeof m == "number" && typeof v == "number" ? `${m - v}~${m + v}` : "?"}`
      ].forEach((w, p) => {
        this.ctx.fillText(w, u + 5, g + p * 14);
      }), this.ctx.restore();
    }
    t !== void 0 && d(t, "#ff0000", 2), this.ctx.restore();
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
    this.ctx = i, this.overlaysLayout = t || X, this.gridRenderer = new V(this.ctx, e.width, e.height), this.waveformLineRenderer = new j(this.ctx, e.width, e.height), this.fftOverlayRenderer = new J(this.ctx, e.width, e.height), this.harmonicAnalysisRenderer = new ee(this.ctx, e.width, e.height), this.frequencyPlotRenderer = new te(this.ctx, e.width, e.height), this.phaseMarkerRenderer = new ie(this.ctx, e.width, e.height, this.debugOverlaysEnabled), e.width === 300 && e.height === 150 && console.warn(
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
  drawHarmonicAnalysis(e, t, i, s, o, a, n) {
    this.harmonicAnalysisEnabled && this.debugOverlaysEnabled && this.fftDisplayEnabled && (this.updateRendererDimensions(), this.harmonicAnalysisRenderer.drawHarmonicAnalysis(
      e,
      t,
      i,
      s,
      o,
      a,
      n,
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
  drawPhaseMarkers(e, t, i, s, o, a, n) {
    this.updateRendererDimensions(), this.phaseMarkerRenderer.drawPhaseMarkers(
      e,
      t,
      i,
      s,
      o,
      a,
      n
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
class oe {
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
    const o = Math.max(0, t), a = Math.min(e.length, i);
    for (let n = o; n < a; n++) {
      const h = Math.abs(e[n]);
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
  drawWaveform(e, t, i, s, o, a, n) {
    const h = a - o;
    if (h <= 0) return;
    const d = this.findPeakAmplitude(s, o, a);
    e.strokeStyle = n, e.lineWidth = 1.5, e.beginPath();
    const f = t / h, u = i / 2;
    let g;
    if (d > this.MIN_PEAK_THRESHOLD) {
      const c = this.TARGET_FILL_RATIO / d;
      g = i / 2 * c;
    } else
      g = i * this.DEFAULT_AMPLITUDE_RATIO;
    for (let c = 0; c < h; c++) {
      const m = o + c;
      if (m >= s.length) break;
      const v = s[m], l = u - v * g, x = Math.min(i, Math.max(0, l)), w = c * f;
      c === 0 ? e.moveTo(w, x) : e.lineTo(w, x);
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
  drawZeroCrossCandidates(e, t, i, s, o, a, n, h) {
    const d = a - o;
    if (s.length === 0 || d <= 0)
      return;
    const f = i / 2, u = 4, g = performance.now();
    e.save();
    for (const c of s) {
      const m = c - o;
      if (m < 0 || m >= d)
        continue;
      const v = m / d * t, l = n !== void 0 && c === n, x = l && Math.floor(g / 400) % 2 === 0, w = l ? x ? "#ffff00" : "#0066ff" : "#ffff00";
      e.beginPath(), e.fillStyle = w, e.strokeStyle = w, e.lineWidth = 2, e.arc(v, f, u, 0, Math.PI * 2), e.fill(), e.stroke();
    }
    if (h !== void 0) {
      const c = h - o;
      if (c >= 0 && c < d) {
        const m = c / d * t;
        e.beginPath(), e.fillStyle = "#ff0000", e.strokeStyle = "#ff0000", e.lineWidth = 2, e.arc(m, f, u, 0, Math.PI * 2), e.fill(), e.stroke();
      }
    }
    e.restore();
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
  drawPhaseMarkers(e, t, i, s, o, a, n, h, d) {
    const f = o - s;
    if (f <= 0) return;
    const u = (g, c, m) => {
      const v = g - s;
      if (v < 0 || v >= f)
        return;
      const l = v / f * t;
      e.strokeStyle = c, e.lineWidth = m, e.beginPath(), e.moveTo(l, 0), e.lineTo(l, i), e.stroke();
    };
    h !== void 0 && u(h, "#ff8800", 2), d !== void 0 && u(d, "#ff8800", 2), a !== void 0 && u(a, "#ff0000", 2), n !== void 0 && u(n, "#ff0000", 2);
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
    const o = 40, a = 25, n = t - 50, h = i - 35, d = -1, f = 1;
    e.strokeStyle = "#333333", e.lineWidth = 1, e.beginPath();
    for (let c = 0; c <= 4; c++) {
      const m = a + h / 4 * c;
      e.moveTo(o, m), e.lineTo(o + n, m);
    }
    for (let c = 0; c <= 4; c++) {
      const m = o + n / 4 * c;
      e.moveTo(m, a), e.lineTo(m, a + h);
    }
    e.stroke(), e.fillStyle = "#aaaaaa", e.font = "10px monospace", e.textAlign = "right", e.textBaseline = "middle";
    for (let c = 0; c <= 4; c++) {
      const m = f - (f - d) * (c / 4), v = a + h / 4 * c, l = m.toFixed(2);
      e.fillText(l, o - 5, v);
    }
    e.strokeStyle = "#00aaff", e.lineWidth = 2, e.beginPath();
    const u = n / Math.max(s.length - 1, 1);
    for (let c = 0; c < s.length; c++) {
      const m = s[c], v = o + c * u, x = (Math.max(d, Math.min(f, m)) - d) / (f - d), w = a + h - x * h;
      c === 0 ? e.moveTo(v, w) : e.lineTo(v, w);
    }
    e.stroke();
    const g = s[s.length - 1];
    e.fillStyle = "#00aaff", e.font = "bold 11px Arial", e.textAlign = "left", e.textBaseline = "bottom", e.fillText(`${g.toFixed(3)}`, o + 2, a + h - 2), e.restore();
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
    const n = s / a * t, h = o / a * t;
    e.strokeStyle = "#ff0000", e.lineWidth = 2, e.beginPath(), e.moveTo(n, 0), e.lineTo(n, i), e.stroke(), e.beginPath(), e.moveTo(h, 0), e.lineTo(h, i), e.stroke(), e.fillStyle = "#ff0000", e.font = "10px Arial", e.fillText("S", n + 2, 12), e.fillText("E", h + 2, 12);
  }
  /**
   * Draw phase marker vertical lines on the buffer canvas
   * Red lines for phaseZero and phaseTwoPi, orange lines for phaseMinusQuarterPi and phaseTwoPiPlusQuarterPi
   */
  drawPhaseMarkers(e, t, i, s, o, a, n, h) {
    if (s <= 0) return;
    const d = (f, u) => {
      const g = f / s * t;
      e.strokeStyle = u, e.lineWidth = 1, e.beginPath(), e.moveTo(g, 0), e.lineTo(g, i), e.stroke();
    };
    n !== void 0 && d(n, "#ff8800"), h !== void 0 && d(h, "#ff8800"), o !== void 0 && d(o, "#ff0000"), a !== void 0 && d(a, "#ff0000");
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
    const a = Math.min(120, t * 0.4), n = Math.min(60, i * 0.4), h = t - a - 5, d = 5;
    e.fillStyle = "rgba(0, 0, 0, 0.7)", e.fillRect(h, d, a, n), e.strokeStyle = "#00aaff", e.lineWidth = 1, e.strokeRect(h, d, a, n), e.fillStyle = "#00aaff", e.font = "9px Arial", e.fillText("Offset %", h + 2, d + 9);
    const f = 2, u = h + f, g = d + 12, c = a - f * 2, m = n - 12 - f, v = 0, l = 100, x = (w, p) => {
      if (w.length < 2) return;
      e.strokeStyle = p, e.lineWidth = 1.5, e.beginPath();
      const E = c / Math.max(w.length - 1, 1);
      for (let S = 0; S < w.length; S++) {
        const R = w[S], M = u + S * E, T = (Math.max(v, Math.min(l, R)) - v) / (l - v), P = g + m - T * m;
        S === 0 ? e.moveTo(M, P) : e.lineTo(M, P);
      }
      e.stroke();
    };
    if (x(s, "#ff0000"), x(o, "#ff8800"), e.font = "8px monospace", e.textAlign = "left", s.length > 0) {
      const w = s[s.length - 1];
      e.fillStyle = "#ff0000", e.fillText(`S:${w.toFixed(1)}%`, h + 2, d + n - 11);
    }
    if (o.length > 0) {
      const w = o[o.length - 1];
      e.fillStyle = "#ff8800", e.fillText(`E:${w.toFixed(1)}%`, h + 2, d + n - 2);
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
    const o = e.getContext("2d"), a = t.getContext("2d"), n = i.getContext("2d"), h = s.getContext("2d");
    if (!o || !a || !n || !h)
      throw new Error("Could not get 2D context for comparison canvases");
    this.previousCtx = o, this.currentCtx = a, this.similarityCtx = n, this.bufferCtx = h, this.waveformRenderer = new oe(), this.similarityPlotRenderer = new ae(), this.positionMarkerRenderer = new he(), this.offsetOverlayRenderer = new le(), this.clearAllCanvases();
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
  updatePanels(e, t, i, s, o, a, n = [], h = [], d = [], f, u, g, c, m = [], v) {
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
      d
    );
    const x = (() => {
      if (f === void 0 || f < i || f >= s || m.length === 0)
        return;
      let w, p = Number.POSITIVE_INFINITY;
      for (const E of m) {
        if (E < i || E >= s)
          continue;
        const S = Math.abs(E - f);
        S < p && (p = S, w = E);
      }
      return w;
    })();
    this.waveformRenderer.drawZeroCrossCandidates(
      this.currentCtx,
      this.currentCanvas.width,
      this.currentCanvas.height,
      m,
      i,
      s,
      v,
      x
    ), this.waveformRenderer.drawPhaseMarkers(
      this.currentCtx,
      this.currentCanvas.width,
      this.currentCanvas.height,
      i,
      s,
      f,
      u,
      g,
      c
    ), n.length > 0 && this.similarityPlotRenderer.drawSimilarityPlot(
      this.similarityCtx,
      this.similarityCanvas.width,
      this.similarityCanvas.height,
      n
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
      f,
      u,
      g,
      c
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
    const n = 35, h = 25, d = t - 45, f = i - 35, u = -1, g = 1;
    e.strokeStyle = "#333333", e.lineWidth = 1, e.beginPath();
    for (let l = 0; l <= 4; l++) {
      const x = h + f / 4 * l;
      e.moveTo(n, x), e.lineTo(n + d, x);
    }
    for (let l = 0; l <= 4; l++) {
      const x = n + d / 4 * l;
      e.moveTo(x, h), e.lineTo(x, h + f);
    }
    e.stroke(), e.fillStyle = "#aaaaaa", e.font = "10px monospace", e.textAlign = "right", e.textBaseline = "middle";
    for (let l = 0; l <= 4; l++) {
      const x = g - (g - u) * (l / 4), w = h + f / 4 * l, p = x.toFixed(1);
      e.fillText(p, n - 5, w);
    }
    const c = h + f - (0 - u) / (g - u) * f;
    e.strokeStyle = "#666666", e.lineWidth = 1, e.beginPath(), e.moveTo(n, c), e.lineTo(n + d, c), e.stroke();
    const m = s[0].length;
    for (let l = 0; l < m; l++) {
      const x = F.SEGMENT_COLORS[l % F.SEGMENT_COLORS.length];
      e.strokeStyle = x, e.lineWidth = 2, e.beginPath();
      const w = s.length > 1 ? d / (s.length - 1) : 0;
      let p = !1;
      for (let E = 0; E < s.length; E++) {
        const S = s[E];
        if (S && S.length > l) {
          const R = S[l], M = n + E * w, T = (Math.max(u, Math.min(g, R)) - u) / (g - u), P = h + f - T * f;
          p ? e.lineTo(M, P) : (e.moveTo(M, P), p = !0);
        }
      }
      e.stroke();
    }
    const v = s[s.length - 1];
    if (v && v.length > 0) {
      const x = v.length * 11 + 4, w = 65, p = n + d - w - 2, E = h + 2;
      e.fillStyle = "rgba(0, 0, 0, 0.7)", e.fillRect(p, E, w, x), e.strokeStyle = "#555555", e.lineWidth = 1, e.strokeRect(p, E, w, x), e.font = "9px Arial", e.textAlign = "left", e.textBaseline = "top";
      for (let S = 0; S < v.length; S++) {
        const R = F.SEGMENT_COLORS[S % F.SEGMENT_COLORS.length], M = v[S], C = E + 2 + S * 11;
        e.fillStyle = R, e.fillRect(p + 2, C, 8, 8), e.fillStyle = "#ffffff", e.fillText(`${S + 1}-${S + 2}: ${M.toFixed(2)}`, p + 12, C);
      }
    }
    e.fillStyle = "#aaaaaa", e.font = "10px Arial", e.textAlign = "center", e.fillText(a, n + d / 2, i - 3), e.restore();
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
r(F, "HISTORY_SIZE", 100), r(F, "SEGMENT_COLORS", ["#00ff00", "#88ff00", "#ffaa00", "#ff6600", "#ff0000", "#ff00ff", "#00ffff"]);
let L = F;
const _ = class _ {
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
          for (const a of _.ASSET_PATTERNS) {
            const n = o.indexOf(a);
            if (n >= 0)
              return n === 0 ? "/" : o.substring(0, n) + "/";
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
r(_, "ASSET_PATTERNS", ["/assets/", "/js/", "/dist/"]);
let W = _;
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
          n(), i(new Error(`WASM module loading timed out after ${this.LOAD_TIMEOUT_MS / 1e3} seconds`));
        }, this.LOAD_TIMEOUT_MS), o = `${e}wasm/signal_processor_wasm.js`, a = document.createElement("script");
        a.type = "module", a.textContent = `
        import init, { WasmDataProcessor } from '${o}';
        await init();
        window.wasmProcessor = { WasmDataProcessor };
        window.dispatchEvent(new Event('wasmLoaded'));
      `;
        const n = () => {
          clearTimeout(s), window.removeEventListener("wasmLoaded", h);
        }, h = () => {
          n(), window.wasmProcessor && window.wasmProcessor.WasmDataProcessor ? (this.wasmProcessor = new window.wasmProcessor.WasmDataProcessor(), this.isInitialized = !0, t()) : i(new Error("WASM module loaded but WasmDataProcessor not found"));
        };
        window.addEventListener("wasmLoaded", h), a.onerror = () => {
          n(), i(new Error("Failed to load WASM module script"));
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
class de {
  // Log when processing exceeds 60fps target
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
    // Previous frame percent positions for 1% clamping enforcement (issue #275)
    r(this, "prevPhaseZeroPercent");
    r(this, "prevPhaseMinusQuarterPiPercent");
    r(this, "prevPhaseTwoPiPlusQuarterPiPercent");
    // Performance diagnostics for issue #269
    r(this, "enableDetailedTimingLogs", !1);
    // Default: disabled to avoid performance impact
    r(this, "TIMING_LOG_THRESHOLD_MS", 16.67);
    this.audioManager = e, this.gainController = t, this.frequencyEstimator = i, this.waveformSearcher = s, this.zeroCrossDetector = o, this.basePathResolver = new W(), this.wasmLoader = new fe();
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
    const n = performance.now(), h = this.audioManager.getSampleRate(), d = this.audioManager.getFFTSize(), f = performance.now(), u = this.frequencyEstimator.getFrequencyEstimationMethod() === "fft" || e;
    let g = u ? this.audioManager.getFrequencyData() : null;
    const c = performance.now();
    if (u && !g && a) {
      const C = s.computeFrequencyData(a, d);
      C && (g = new Uint8Array(C));
    }
    const m = performance.now();
    this.syncConfigToWasm();
    const v = performance.now(), l = s.processFrame(
      a,
      g,
      h,
      d,
      e
    ), x = performance.now();
    if (!l)
      return null;
    const w = performance.now(), p = {
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
    }, E = performance.now();
    this.clampPhaseMarkers(p), this.updatePhaseOffsetHistory(p), p.phaseZeroOffsetHistory = [...this.phaseZeroOffsetHistory], p.phaseTwoPiOffsetHistory = [...this.phaseTwoPiOffsetHistory], this.syncResultsFromWasm(p);
    const S = performance.now(), R = t !== void 0 ? t : this.enableDetailedTimingLogs, M = S - i;
    if (R || M > this.TIMING_LOG_THRESHOLD_MS) {
      const C = {
        init: (o - i).toFixed(2),
        getTimeDomain: (n - o).toFixed(2),
        getMetadata: (f - n).toFixed(2),
        getFreqData: (c - f).toFixed(2),
        computeFFT: (m - c).toFixed(2),
        syncConfig: (v - m).toFixed(2),
        wasmProcess: (x - v).toFixed(2),
        convertResult: (E - w).toFixed(2),
        postProcess: (S - E).toFixed(2),
        total: M.toFixed(2)
      };
      console.log(`[WaveformDataProcessor] init:${C.init}ms | getTimeDomain:${C.getTimeDomain}ms | getMeta:${C.getMetadata}ms | getFreq:${C.getFreqData}ms | computeFFT:${C.computeFFT}ms | syncCfg:${C.syncConfig}ms | WASM:${C.wasmProcess}ms | convert:${C.convertResult}ms | post:${C.postProcess}ms | total:${C.total}ms`);
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
    const i = 4, s = 100 / i * 0.01, o = Math.floor(t / i), a = (f, u) => {
      if (f === void 0)
        return { index: void 0, percent: void 0 };
      const g = (f - e.displayStartIndex) / t * 100;
      if (u === void 0)
        return { index: f, percent: g };
      const c = g - u;
      if (Math.abs(c) <= s)
        return { index: f, percent: g };
      const m = u + Math.sign(c) * s, v = e.displayStartIndex + m / 100 * t;
      let l;
      c > 0 ? l = Math.floor(v) : c < 0 ? l = Math.ceil(v) : l = Math.round(v);
      const x = (l - e.displayStartIndex) / t * 100;
      return { index: l, percent: x };
    }, n = a(e.phaseZeroIndex, this.prevPhaseZeroPercent);
    if (e.phaseZeroIndex = n.index, this.prevPhaseZeroPercent = n.percent, n.index !== void 0 && o > 0) {
      const f = n.index + o;
      e.phaseTwoPiIndex = f;
    } else
      e.phaseTwoPiIndex = void 0;
    const h = a(e.phaseMinusQuarterPiIndex, this.prevPhaseMinusQuarterPiPercent);
    e.phaseMinusQuarterPiIndex = h.index, this.prevPhaseMinusQuarterPiPercent = h.percent;
    const d = a(e.phaseTwoPiPlusQuarterPiIndex, this.prevPhaseTwoPiPlusQuarterPiPercent);
    e.phaseTwoPiPlusQuarterPiIndex = d.index, this.prevPhaseTwoPiPlusQuarterPiPercent = d.percent;
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
        const d = this.phaseZeroOffsetHistory[this.phaseZeroOffsetHistory.length - 1];
        if (d !== void 0) {
          const f = Math.abs(h - d);
          a.phaseZero.offsetChange = f, a.phaseZero.previousOffsetPercent = d, f > s && (o = !0, a.phaseZero.SPEC_VIOLATION = !0);
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
        const d = this.phaseTwoPiOffsetHistory[this.phaseTwoPiOffsetHistory.length - 1];
        if (d !== void 0) {
          const f = Math.abs(h - d);
          a.phaseTwoPi.offsetChange = f, a.phaseTwoPi.previousOffsetPercent = d, f > s && (o = !0, a.phaseTwoPi.SPEC_VIOLATION = !0);
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
    e && e.reset(), this.phaseZeroOffsetHistory = [], this.phaseTwoPiOffsetHistory = [], this.previousPhaseZeroIndex = void 0, this.previousPhaseTwoPiIndex = void 0, this.prevPhaseZeroPercent = void 0, this.prevPhaseMinusQuarterPiPercent = void 0, this.prevPhaseTwoPiPlusQuarterPiPercent = void 0;
  }
}
class ue {
  constructor() {
    r(this, "lastFrameTime", 0);
    r(this, "frameProcessingTimes", []);
    r(this, "frameCount", 0);
    r(this, "MAX_FRAME_TIMES", 100);
    r(this, "TARGET_FRAME_TIME", 16.67);
    // 60fps target
    r(this, "FPS_LOG_INTERVAL_FRAMES", 60);
    // Log FPS every 60 frames (approx. 1 second at 60fps)
    r(this, "enableDetailedTimingLogs", !1);
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
        const a = this.frameProcessingTimes.reduce((n, h) => n + h, 0) / this.frameProcessingTimes.length;
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
  constructor(e, t, i, s, o, a, n, h, d) {
    r(this, "audioManager");
    r(this, "gainController");
    r(this, "frequencyEstimator");
    r(this, "renderer");
    r(this, "zeroCrossDetector");
    r(this, "waveformSearcher");
    r(this, "comparisonRenderer");
    r(this, "cycleSimilarityRenderer", null);
    r(this, "dataProcessor");
    r(this, "timingDiagnostics");
    r(this, "renderCoordinator");
    r(this, "animationId", null);
    r(this, "isRunning", !1);
    r(this, "isPaused", !1);
    r(this, "phaseMarkerRangeEnabled", !0);
    this.audioManager = new Z(), this.gainController = new Q(), this.frequencyEstimator = new U(), this.renderer = new se(e, d), this.zeroCrossDetector = new re(), this.waveformSearcher = new ne(), this.comparisonRenderer = new ce(
      t,
      i,
      s,
      o
    ), a && n && h && (this.cycleSimilarityRenderer = new L(
      a,
      n,
      h
    )), this.dataProcessor = new de(
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
        const a = performance.now(), n = o - i, h = a - o;
        this.timingDiagnostics.logDetailedTiming(n, h);
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
    const t = O(e);
    if (!t)
      return { note: -1, octave: -1, noteInOctave: -1 };
    const i = t.noteName.match(/^([A-G]#?)(\d+)$/);
    if (!i)
      return { note: -1, octave: -1, noteInOctave: -1 };
    const s = i[1], o = parseInt(i[2], 10), n = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].indexOf(s);
    return { note: o * 12 + n, octave: o, noteInOctave: n };
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
      const d = (h % 12 + 12) % 12;
      if (this.WHITE_KEY_NOTES.includes(d)) {
        const f = this.xOffset + s * this.WHITE_KEY_WIDTH, u = i && i.note === h;
        this.ctx.fillStyle = u ? this.WHITE_KEY_HIGHLIGHT : this.WHITE_KEY_COLOR, this.ctx.fillRect(f, 0, this.WHITE_KEY_WIDTH, this.WHITE_KEY_HEIGHT), this.ctx.strokeStyle = this.KEY_BORDER, this.ctx.lineWidth = 1, this.ctx.strokeRect(f, 0, this.WHITE_KEY_WIDTH, this.WHITE_KEY_HEIGHT), s++;
      }
    }
    s = 0;
    for (let h = t.startNote; h <= t.endNote; h++) {
      const d = (h % 12 + 12) % 12;
      if (this.WHITE_KEY_NOTES.includes(d) && s++, this.BLACK_KEY_NOTES.includes(d)) {
        const f = this.xOffset + s * this.WHITE_KEY_WIDTH - this.BLACK_KEY_WIDTH / 2, u = i && i.note === h;
        this.ctx.fillStyle = u ? this.BLACK_KEY_HIGHLIGHT : this.BLACK_KEY_COLOR, this.ctx.fillRect(f, 0, this.BLACK_KEY_WIDTH, this.BLACK_KEY_HEIGHT), this.ctx.strokeStyle = this.KEY_BORDER, this.ctx.lineWidth = 1, this.ctx.strokeRect(f, 0, this.BLACK_KEY_WIDTH, this.BLACK_KEY_HEIGHT);
      }
    }
    this.ctx.fillStyle = "#888888", this.ctx.font = "10px monospace", this.ctx.fillText(`${this.MIN_FREQ}Hz`, this.xOffset + 5, this.WHITE_KEY_HEIGHT - 5);
    const o = `${this.MAX_FREQ}Hz`, a = this.ctx.measureText(o).width, n = this.xOffset + this.whiteKeyCount * this.WHITE_KEY_WIDTH;
    this.ctx.fillText(o, n - a - 5, this.WHITE_KEY_HEIGHT - 5);
  }
  /**
   * キャンバスをクリア
   */
  clear() {
    this.ctx.fillStyle = "#1a1a1a", this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
class G {
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
    return new G(s, e.sampleRate, {
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
  G as BufferSource,
  ce as ComparisonPanelRenderer,
  L as CycleSimilarityRenderer,
  X as DEFAULT_OVERLAYS_LAYOUT,
  K as FrameBufferHistory,
  ue as FrameTimingDiagnostics,
  U as FrequencyEstimator,
  Q as GainController,
  le as OffsetOverlayRenderer,
  ye as Oscilloscope,
  ve as PianoKeyboardRenderer,
  he as PositionMarkerRenderer,
  me as RenderCoordinator,
  ae as SimilarityPlotRenderer,
  de as WaveformDataProcessor,
  oe as WaveformPanelRenderer,
  se as WaveformRenderer,
  ne as WaveformSearcher,
  re as ZeroCrossDetector,
  B as amplitudeToDb,
  q as dbToAmplitude,
  I as resolveValue,
  $ as trimSilence
};
//# sourceMappingURL=cat-oscilloscope.mjs.map
