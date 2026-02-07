var N = Object.defineProperty;
var z = (y, e, t) => e in y ? N(y, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : y[e] = t;
var s = (y, e, t) => z(y, typeof e != "symbol" ? e + "" : e, t);
function q(y) {
  return Math.pow(10, y / 20);
}
function B(y) {
  return y <= 0 ? -1 / 0 : 20 * Math.log10(y);
}
function O(y) {
  if (y <= 0 || !isFinite(y))
    return null;
  const t = 440 * Math.pow(2, -4.75), i = 12 * Math.log2(y / t), r = Math.round(i), a = Math.round((i - r) * 100), o = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"], n = Math.floor(r / 12);
  return {
    noteName: `${o[(r % 12 + 12) % 12]}${n}`,
    cents: a
  };
}
const Y = -48;
function $(y) {
  const e = y.numberOfChannels, t = y.sampleRate, i = y.length, r = [];
  let a = 0;
  for (let u = 0; u < e; u++) {
    const g = y.getChannelData(u);
    r.push(g);
    for (let c = 0; c < i; c++) {
      const m = Math.abs(g[c]);
      m > a && (a = m);
    }
  }
  if (a === 0)
    return y;
  const o = a * Math.pow(10, Y / 20);
  let n = i;
  for (let u = 0; u < i; u++) {
    let g = !0;
    for (let c = 0; c < e; c++)
      if (Math.abs(r[c][u]) > o) {
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
      if (Math.abs(r[c][u]) > o) {
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
  const f = h - n + 1, d = new AudioBuffer({
    numberOfChannels: e,
    length: f,
    sampleRate: t
  });
  for (let u = 0; u < e; u++) {
    const g = r[u], c = d.getChannelData(u);
    for (let m = 0; m < f; m++)
      c[m] = g[n + m];
  }
  return d;
}
class K {
  constructor() {
    s(this, "frameBufferHistory", []);
    s(this, "MAX_FRAME_HISTORY", 16);
    // Support up to 16x buffer size
    s(this, "extendedBufferCache", /* @__PURE__ */ new Map());
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
    const i = this.frameBufferHistory.slice(-e), r = i.reduce((n, h) => n + h.length, 0);
    let a = this.extendedBufferCache.get(e);
    (!a || a.length !== r) && (a = new Float32Array(r), this.extendedBufferCache.set(e, a));
    let o = 0;
    for (const n of i)
      a.set(n, o), o += n.length;
    return a;
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
    s(this, "audioContext", null);
    s(this, "analyser", null);
    s(this, "mediaStream", null);
    s(this, "audioBufferSource", null);
    s(this, "bufferSource", null);
    s(this, "dataArray", null);
    s(this, "frequencyData", null);
    s(this, "frameBufferHistory", new K());
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
      const i = e.getSampleRate(), r = e.getLength(), a = this.audioContext.createBuffer(1, r, i), o = a.getChannelData(0);
      let n = 0;
      for (; n < r; ) {
        const h = e.getNextChunk();
        if (!h) break;
        const f = Math.min(h.length, r - n);
        o.set(h.subarray(0, f), n), n += f;
      }
      this.initializeAnalyser(), this.audioBufferSource = this.audioContext.createBufferSource(), this.audioBufferSource.buffer = a, this.audioBufferSource.loop = !0, this.audioBufferSource.connect(this.analyser), this.audioBufferSource.start(0);
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
    s(this, "autoGainEnabled", !0);
    s(this, "currentGain", 1);
    s(this, "noiseGateEnabled", !0);
    s(this, "noiseGateThreshold", q(-60));
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
    s(this, "ctx");
    s(this, "canvasWidth");
    s(this, "canvasHeight");
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
  calculateOverlayDimensions(e, t, i, r, a) {
    if (!e)
      return { x: t, y: i, width: r, height: a };
    let o = t, n = i, h = r, f = a;
    if (e.position.x !== void 0)
      if (typeof e.position.x == "string" && e.position.x.startsWith("right-")) {
        const d = parseInt(e.position.x.substring(6), 10), u = e.size.width !== void 0 && e.size.width !== "auto" ? I(e.size.width, this.canvasWidth) : r;
        o = this.canvasWidth - u - d;
      } else
        o = I(e.position.x, this.canvasWidth);
    return e.position.y !== void 0 && (n = I(e.position.y, this.canvasHeight)), e.size.width !== void 0 && e.size.width !== "auto" && (h = I(e.size.width, this.canvasWidth)), e.size.height !== void 0 && e.size.height !== "auto" && (f = I(e.size.height, this.canvasHeight)), { x: o, y: n, width: h, height: f };
  }
}
class V {
  constructor(e, t, i) {
    s(this, "ctx");
    s(this, "canvasWidth");
    s(this, "canvasHeight");
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
    const r = 5;
    for (let o = 0; o <= r; o++) {
      const n = this.canvasHeight / r * o;
      this.ctx.moveTo(0, n), this.ctx.lineTo(this.canvasWidth, n);
    }
    const a = 10;
    for (let o = 0; o <= a; o++) {
      const n = this.canvasWidth / a * o;
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
    const r = t / e * 1e3, a = 10, o = r / a;
    for (let d = 0; d <= a; d++) {
      const u = this.canvasWidth / a * d, g = o * d;
      let c;
      g >= 1e3 ? c = `${(g / 1e3).toFixed(2)}s` : g >= 1 ? c = `${g.toFixed(1)}ms` : c = `${(g * 1e3).toFixed(0)}μs`;
      const m = this.ctx.measureText(c).width, p = Math.max(2, Math.min(u - m / 2, this.canvasWidth - m - 2));
      this.ctx.fillText(c, p, this.canvasHeight - 3);
    }
    const n = 5, f = 1 / (n / 2 * i);
    for (let d = 0; d <= n; d++) {
      const u = this.canvasHeight / n * d, c = (n / 2 - d) * f;
      let m;
      if (c === 0)
        m = "0dB*";
      else {
        const p = B(Math.abs(c)), l = c > 0 ? "+" : "-", x = Math.abs(p);
        x >= 100 ? m = `${l}${x.toFixed(0)}dB` : m = `${l}${x.toFixed(1)}dB`;
      }
      this.ctx.fillText(m, 3, u + 10);
    }
    this.ctx.restore();
  }
}
class j {
  constructor(e, t, i) {
    s(this, "ctx");
    s(this, "canvasWidth");
    s(this, "canvasHeight");
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
  drawWaveform(e, t, i, r) {
    const a = i - t;
    if (a <= 0) return;
    this.ctx.strokeStyle = "#00ff00", this.ctx.lineWidth = 2, this.ctx.beginPath();
    const o = this.canvasWidth / a, n = this.canvasHeight / 2, f = this.canvasHeight / 2 * r;
    for (let d = 0; d < a; d++) {
      const u = t + d, g = e[u], c = n - g * f, m = Math.min(this.canvasHeight, Math.max(0, c)), p = d * o;
      d === 0 ? this.ctx.moveTo(p, m) : this.ctx.lineTo(p, m);
    }
    this.ctx.stroke();
  }
}
class J extends k {
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
  drawFFTOverlay(t, i, r, a, o, n) {
    const h = r / a, f = Math.floor(this.canvasWidth * 0.35), d = Math.floor(this.canvasHeight * 0.35), u = 10, g = this.canvasHeight - d - 10, { x: c, y: m, width: p, height: l } = this.calculateOverlayDimensions(
      n,
      u,
      g,
      f,
      d
    );
    this.ctx.save(), this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)", this.ctx.fillRect(c, m, p, l), this.ctx.strokeStyle = "#00aaff", this.ctx.lineWidth = 2, this.ctx.strokeRect(c, m, p, l);
    const x = Math.min(
      t.length,
      Math.ceil(o / h)
    ), T = p / x;
    this.ctx.fillStyle = "#00aaff";
    for (let v = 0; v < x; v++) {
      const P = t[v] / 255 * l * this.FFT_OVERLAY_HEIGHT_RATIO, R = c + v * T, M = m + l - P;
      this.ctx.fillRect(R, M, Math.max(T - 1, this.FFT_MIN_BAR_WIDTH), P);
    }
    if (i > 0 && i <= o) {
      const v = i / h, S = c + v * T;
      this.ctx.strokeStyle = "#ff00ff", this.ctx.lineWidth = 2, this.ctx.beginPath(), this.ctx.moveTo(S, m), this.ctx.lineTo(S, m + l), this.ctx.stroke(), this.ctx.fillStyle = "#ff00ff", this.ctx.font = "bold 12px Arial";
      const P = `${i.toFixed(1)} Hz`, R = this.ctx.measureText(P).width;
      let M = S + 3;
      M + R > c + p - 5 && (M = S - R - 3), this.ctx.fillText(P, M, m + 15);
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
  drawHarmonicAnalysis(e, t, i, r, a, o, n, h) {
    if (e === void 0 && !t && !i && !o)
      return;
    const f = 16, u = (1 + // Title
    (e !== void 0 ? 1 : 0) + (t ? 1 : 0) + (i ? 1 : 0) + (o ? 2 : 0)) * f + 10, { x: g, y: c, width: m, height: p } = this.calculateOverlayDimensions(
      h,
      10,
      10,
      500,
      u
    );
    let l = c;
    if (this.ctx.save(), this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)", this.ctx.fillRect(g, c, m, p), this.ctx.strokeStyle = "#ffaa00", this.ctx.lineWidth = 2, this.ctx.strokeRect(g, c, m, p), this.ctx.fillStyle = "#ffaa00", this.ctx.font = "bold 12px monospace", l += 15, this.ctx.fillText("倍音分析 (Harmonic Analysis)", g + 5, l), e !== void 0 && n) {
      l += f, this.ctx.fillStyle = "#00ff00", this.ctx.font = "11px monospace";
      const x = n / 2;
      this.ctx.fillText(
        `1/2周波数 (${x.toFixed(1)}Hz) のpeak強度: ${e.toFixed(1)}%`,
        g + 5,
        l
      );
    }
    if (t && n) {
      l += f, this.ctx.fillStyle = "#ff00ff", this.ctx.font = "11px monospace";
      const x = t.map((v, S) => `${S + 1}x:${v.toFixed(2)}`).join(" "), T = r !== void 0 ? ` (重み付け: ${r.toFixed(1)})` : "";
      this.ctx.fillText(
        `候補1 (${n.toFixed(1)}Hz) 倍音: ${x}${T}`,
        g + 5,
        l
      );
    }
    if (i && n) {
      l += f, this.ctx.fillStyle = "#00aaff", this.ctx.font = "11px monospace";
      const x = n / 2, T = i.map((S, P) => `${P + 1}x:${S.toFixed(2)}`).join(" "), v = a !== void 0 ? ` (重み付け: ${a.toFixed(1)})` : "";
      this.ctx.fillText(
        `候補2 (${x.toFixed(1)}Hz) 倍音: ${T}${v}`,
        g + 5,
        l
      );
    }
    if (o) {
      l += f, this.ctx.fillStyle = "#aaaaaa", this.ctx.font = "10px monospace";
      const x = m - 10, T = o.split(" ");
      let v = "";
      for (const S of T) {
        const P = v + (v ? " " : "") + S;
        this.ctx.measureText(P).width > x && v ? (this.ctx.fillText(v, g + 5, l), l += f, v = S) : v = P;
      }
      v && this.ctx.fillText(v, g + 5, l);
    }
    this.ctx.restore();
  }
}
class te extends k {
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
  drawFrequencyPlot(t, i, r, a) {
    if (!t || t.length === 0)
      return;
    const { x: o, y: n, width: h, height: f } = this.calculateOverlayDimensions(
      a,
      this.canvasWidth - 280 - 10,
      10,
      280,
      120
    );
    this.ctx.save(), this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)", this.ctx.fillRect(o, n, h, f), this.ctx.strokeStyle = "#ffaa00", this.ctx.lineWidth = 2, this.ctx.strokeRect(o, n, h, f), this.ctx.fillStyle = "#ffaa00", this.ctx.font = "bold 12px Arial", this.ctx.fillText(`周波数推移 (${t.length}frame)`, o + 5, n + 15);
    const d = o + 35, u = n + 25, g = h - 45, c = f - 45, m = t.filter((w) => w > 0);
    if (m.length === 0) {
      this.ctx.restore();
      return;
    }
    const p = Math.min(...m), l = Math.max(...m), x = (l - p) * this.FREQ_PLOT_RANGE_PADDING_RATIO || this.FREQ_PLOT_MIN_RANGE_PADDING_HZ, T = Math.max(i, p - x), v = Math.min(r, l + x);
    this.ctx.strokeStyle = "#333333", this.ctx.lineWidth = 1, this.ctx.beginPath();
    for (let w = 0; w <= 4; w++) {
      const E = u + c / 4 * w;
      this.ctx.moveTo(d, E), this.ctx.lineTo(d + g, E);
    }
    for (let w = 0; w <= 4; w++) {
      const E = d + g / 4 * w;
      this.ctx.moveTo(E, u), this.ctx.lineTo(E, u + c);
    }
    this.ctx.stroke(), this.ctx.fillStyle = "#aaaaaa", this.ctx.font = "10px monospace", this.ctx.textAlign = "right", this.ctx.textBaseline = "middle";
    for (let w = 0; w <= 4; w++) {
      const E = v - (v - T) * (w / 4), b = u + c / 4 * w, F = E >= 1e3 ? `${(E / 1e3).toFixed(1)}k` : `${E.toFixed(0)}`;
      this.ctx.fillText(F, d - 5, b);
    }
    this.ctx.fillStyle = "#88ccff", this.ctx.font = "9px monospace", this.ctx.textAlign = "right", this.ctx.textBaseline = "middle";
    for (let w = 0; w <= 4; w++) {
      const E = v - (v - T) * (w / 4), b = u + c / 4 * w, F = O(E);
      if (F) {
        const D = F.cents >= 0 ? "+" : "";
        this.ctx.fillText(`${D}${F.cents}¢`, d + g - 5, b);
      }
    }
    this.ctx.strokeStyle = "#00ff00", this.ctx.lineWidth = 2, this.ctx.beginPath();
    const S = g / Math.max(t.length - 1, 1), P = Math.max(1, Math.floor(t.length / 4)), R = (w) => {
      const b = (Math.max(T, Math.min(v, w)) - T) / (v - T);
      return u + c - b * c;
    };
    let M = !1;
    for (let w = 0; w < t.length; w++) {
      const E = t[w], b = d + w * S;
      if (E === 0) {
        M = !1;
        continue;
      }
      const F = R(E);
      M ? this.ctx.lineTo(b, F) : (this.ctx.moveTo(b, F), M = !0);
    }
    this.ctx.stroke(), this.ctx.font = "9px monospace", this.ctx.textAlign = "center", this.ctx.textBaseline = "top";
    for (let w = 0; w < t.length; w++) {
      const E = t[w], b = d + w * S;
      if (E !== 0) {
        const H = R(E);
        this.ctx.fillStyle = "#00ff00", this.ctx.beginPath(), this.ctx.arc(b, H, 2, 0, Math.PI * 2), this.ctx.fill();
      }
      const F = w === t.length - 1;
      if (w % P === 0 || F) {
        this.ctx.fillStyle = "#aaaaaa";
        const H = w - t.length + 1;
        this.ctx.fillText(`${H}`, b, u + c + 2);
      }
    }
    const C = t[t.length - 1];
    if (C > 0) {
      const w = O(C);
      this.ctx.fillStyle = "#00ff00", this.ctx.font = "bold 11px Arial", this.ctx.textAlign = "left", this.ctx.textBaseline = "bottom";
      let E = `${C.toFixed(1)} Hz`;
      if (w) {
        const b = w.cents >= 0 ? "+" : "";
        E += ` (${w.noteName} ${b}${w.cents}¢)`;
      }
      this.ctx.fillText(E, d + 2, u + c - 2);
    }
    this.ctx.restore();
  }
}
class ie {
  constructor(e, t, i, r = !0) {
    s(this, "ctx");
    s(this, "canvasWidth");
    s(this, "canvasHeight");
    s(this, "debugOverlaysEnabled");
    this.ctx = e, this.canvasWidth = t, this.canvasHeight = i, this.debugOverlaysEnabled = r;
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
  drawPhaseMarkers(e, t, i, r, a, o, n) {
    if (a === void 0 || o === void 0)
      return;
    const h = o - a;
    if (h <= 0)
      return;
    this.ctx.save();
    const f = (d, u, g) => {
      const c = d - a;
      if (c < 0 || c >= h)
        return;
      const m = c / h * this.canvasWidth;
      this.ctx.strokeStyle = u, this.ctx.lineWidth = g, this.ctx.beginPath(), this.ctx.moveTo(m, 0), this.ctx.lineTo(m, this.canvasHeight), this.ctx.stroke();
    };
    if (i !== void 0 && f(i, "#ff8800", 2), r !== void 0 && f(r, "#ff8800", 2), e !== void 0 && (f(e, "#ff0000", 2), this.debugOverlaysEnabled && (n == null ? void 0 : n.phaseZeroSegmentRelative) !== void 0)) {
      const u = (e - a) / h * this.canvasWidth, g = 20;
      this.ctx.save(), this.ctx.fillStyle = "#ff0000", this.ctx.font = "12px monospace", this.ctx.textAlign = "left";
      const c = n.phaseZeroSegmentRelative, m = n.phaseZeroHistory ?? "?", p = n.phaseZeroTolerance ?? "?";
      [
        `Mode: ${n.zeroCrossModeName ?? "Unknown"}`,
        `Seg Rel: ${c}`,
        `History: ${m}`,
        `Tolerance: ±${p}`,
        `Range: ${typeof m == "number" && typeof p == "number" ? `${m - p}~${m + p}` : "?"}`
      ].forEach((T, v) => {
        this.ctx.fillText(T, u + 5, g + v * 14);
      }), this.ctx.restore();
    }
    t !== void 0 && f(t, "#ff0000", 2), this.ctx.restore();
  }
}
class se {
  constructor(e, t) {
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
  drawWaveform(e, t, i, r) {
    this.updateRendererDimensions(), this.waveformLineRenderer.drawWaveform(e, t, i, r);
  }
  /**
   * Draw FFT spectrum overlay (position and size configurable via overlaysLayout)
   */
  drawFFTOverlay(e, t, i, r, a) {
    this.fftDisplayEnabled && (this.updateRendererDimensions(), this.fftOverlayRenderer.drawFFTOverlay(
      e,
      t,
      i,
      r,
      a,
      this.overlaysLayout.fftOverlay
    ));
  }
  /**
   * Draw harmonic analysis information overlay
   * Displays debugging information about frequency estimation when FFT method is used
   * Position and size configurable via overlaysLayout
   */
  drawHarmonicAnalysis(e, t, i, r, a, o, n) {
    this.harmonicAnalysisEnabled && this.debugOverlaysEnabled && this.fftDisplayEnabled && (this.updateRendererDimensions(), this.harmonicAnalysisRenderer.drawHarmonicAnalysis(
      e,
      t,
      i,
      r,
      a,
      o,
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
  drawPhaseMarkers(e, t, i, r, a, o, n) {
    this.updateRendererDimensions(), this.phaseMarkerRenderer.drawPhaseMarkers(
      e,
      t,
      i,
      r,
      a,
      o,
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
    s(this, "usePeakMode", !1);
    s(this, "zeroCrossMode", "hysteresis");
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
class ae {
  constructor() {
    // Auto-scaling constants
    s(this, "TARGET_FILL_RATIO", 0.9);
    // Target 90% of distance from center to edge (canvas half-height) for auto-scaled waveforms
    s(this, "MIN_PEAK_THRESHOLD", 1e-3);
    // Minimum peak to trigger auto-scaling (below this uses default)
    s(this, "DEFAULT_AMPLITUDE_RATIO", 0.4);
  }
  // Default scaling factor when peak is too small
  /**
   * Calculate peak amplitude in a given range of data
   * Used for auto-scaling waveforms to fill the vertical space
   */
  findPeakAmplitude(e, t, i) {
    let r = 0;
    const a = Math.max(0, t), o = Math.min(e.length, i);
    for (let n = a; n < o; n++) {
      const h = Math.abs(e[n]);
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
  drawWaveform(e, t, i, r, a, o, n) {
    const h = o - a;
    if (h <= 0) return;
    const f = this.findPeakAmplitude(r, a, o);
    e.strokeStyle = n, e.lineWidth = 1.5, e.beginPath();
    const d = t / h, u = i / 2;
    let g;
    if (f > this.MIN_PEAK_THRESHOLD) {
      const c = this.TARGET_FILL_RATIO / f;
      g = i / 2 * c;
    } else
      g = i * this.DEFAULT_AMPLITUDE_RATIO;
    for (let c = 0; c < h; c++) {
      const m = a + c;
      if (m >= r.length) break;
      const p = r[m], l = u - p * g, x = Math.min(i, Math.max(0, l)), T = c * d;
      c === 0 ? e.moveTo(T, x) : e.lineTo(T, x);
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
  drawSimilarityPlot(e, t, i, r) {
    if (!r || r.length === 0)
      return;
    e.save(), e.fillStyle = "#000000", e.fillRect(0, 0, t, i), e.strokeStyle = "#00aaff", e.lineWidth = 2, e.strokeRect(0, 0, t, i), e.fillStyle = "#00aaff", e.font = "bold 12px Arial", e.fillText("類似度推移 (Similarity)", 5, 15);
    const a = 40, o = 25, n = t - 50, h = i - 35, f = -1, d = 1;
    e.strokeStyle = "#333333", e.lineWidth = 1, e.beginPath();
    for (let c = 0; c <= 4; c++) {
      const m = o + h / 4 * c;
      e.moveTo(a, m), e.lineTo(a + n, m);
    }
    for (let c = 0; c <= 4; c++) {
      const m = a + n / 4 * c;
      e.moveTo(m, o), e.lineTo(m, o + h);
    }
    e.stroke(), e.fillStyle = "#aaaaaa", e.font = "10px monospace", e.textAlign = "right", e.textBaseline = "middle";
    for (let c = 0; c <= 4; c++) {
      const m = d - (d - f) * (c / 4), p = o + h / 4 * c, l = m.toFixed(2);
      e.fillText(l, a - 5, p);
    }
    e.strokeStyle = "#00aaff", e.lineWidth = 2, e.beginPath();
    const u = n / Math.max(r.length - 1, 1);
    for (let c = 0; c < r.length; c++) {
      const m = r[c], p = a + c * u, x = (Math.max(f, Math.min(d, m)) - f) / (d - f), T = o + h - x * h;
      c === 0 ? e.moveTo(p, T) : e.lineTo(p, T);
    }
    e.stroke();
    const g = r[r.length - 1];
    e.fillStyle = "#00aaff", e.font = "bold 11px Arial", e.textAlign = "left", e.textBaseline = "bottom", e.fillText(`${g.toFixed(3)}`, a + 2, o + h - 2), e.restore();
  }
  /**
   * Draw similarity score text on a canvas
   */
  drawSimilarityText(e, t, i) {
    e.fillStyle = "#00aaff", e.font = "bold 14px Arial";
    const r = `Similarity: ${i.toFixed(3)}`, a = e.measureText(r).width, o = (t - a) / 2;
    e.fillText(r, o, 20);
  }
}
class he {
  /**
   * Draw vertical position markers
   */
  drawPositionMarkers(e, t, i, r, a, o) {
    if (o <= 0) return;
    const n = r / o * t, h = a / o * t;
    e.strokeStyle = "#ff0000", e.lineWidth = 2, e.beginPath(), e.moveTo(n, 0), e.lineTo(n, i), e.stroke(), e.beginPath(), e.moveTo(h, 0), e.lineTo(h, i), e.stroke(), e.fillStyle = "#ff0000", e.font = "10px Arial", e.fillText("S", n + 2, 12), e.fillText("E", h + 2, 12);
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
  drawOffsetOverlayGraphs(e, t, i, r = [], a = []) {
    if (r.length === 0 && a.length === 0)
      return;
    e.save();
    const o = Math.min(120, t * 0.4), n = Math.min(60, i * 0.4), h = t - o - 5, f = 5;
    e.fillStyle = "rgba(0, 0, 0, 0.7)", e.fillRect(h, f, o, n), e.strokeStyle = "#00aaff", e.lineWidth = 1, e.strokeRect(h, f, o, n), e.fillStyle = "#00aaff", e.font = "9px Arial", e.fillText("Offset %", h + 2, f + 9);
    const d = 2, u = h + d, g = f + 12, c = o - d * 2, m = n - 12 - d, p = 0, l = 100, x = (T, v) => {
      if (T.length < 2) return;
      e.strokeStyle = v, e.lineWidth = 1.5, e.beginPath();
      const S = c / Math.max(T.length - 1, 1);
      for (let P = 0; P < T.length; P++) {
        const R = T[P], M = u + P * S, w = (Math.max(p, Math.min(l, R)) - p) / (l - p), E = g + m - w * m;
        P === 0 ? e.moveTo(M, E) : e.lineTo(M, E);
      }
      e.stroke();
    };
    if (x(r, "#ff0000"), x(a, "#ff8800"), e.font = "8px monospace", e.textAlign = "left", r.length > 0) {
      const T = r[r.length - 1];
      e.fillStyle = "#ff0000", e.fillText(`S:${T.toFixed(1)}%`, h + 2, f + n - 11);
    }
    if (a.length > 0) {
      const T = a[a.length - 1];
      e.fillStyle = "#ff8800", e.fillText(`E:${T.toFixed(1)}%`, h + 2, f + n - 2);
    }
    e.restore();
  }
}
class ce {
  constructor(e, t, i, r) {
    s(this, "previousCanvas");
    s(this, "currentCanvas");
    s(this, "similarityCanvas");
    s(this, "bufferCanvas");
    s(this, "previousCtx");
    s(this, "currentCtx");
    s(this, "similarityCtx");
    s(this, "bufferCtx");
    // Specialized renderers
    s(this, "waveformRenderer");
    s(this, "similarityPlotRenderer");
    s(this, "positionMarkerRenderer");
    s(this, "offsetOverlayRenderer");
    this.previousCanvas = e, this.currentCanvas = t, this.similarityCanvas = i, this.bufferCanvas = r;
    const a = e.getContext("2d"), o = t.getContext("2d"), n = i.getContext("2d"), h = r.getContext("2d");
    if (!a || !o || !n || !h)
      throw new Error("Could not get 2D context for comparison canvases");
    this.previousCtx = a, this.currentCtx = o, this.similarityCtx = n, this.bufferCtx = h, this.waveformRenderer = new ae(), this.similarityPlotRenderer = new oe(), this.positionMarkerRenderer = new he(), this.offsetOverlayRenderer = new le(), this.clearAllCanvases();
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
  updatePanels(e, t, i, r, a, o, n = [], h = [], f = []) {
    this.clearAllCanvases(), e && (this.waveformRenderer.drawCenterLine(this.previousCtx, this.previousCanvas.width, this.previousCanvas.height), this.waveformRenderer.drawWaveform(
      this.previousCtx,
      this.previousCanvas.width,
      this.previousCanvas.height,
      e,
      0,
      e.length,
      "#ffaa00"
    )), this.waveformRenderer.drawCenterLine(this.currentCtx, this.currentCanvas.width, this.currentCanvas.height), r - i > 0 && this.waveformRenderer.drawWaveform(
      this.currentCtx,
      this.currentCanvas.width,
      this.currentCanvas.height,
      t,
      i,
      r,
      "#00ff00"
    ), e && this.similarityPlotRenderer.drawSimilarityText(this.currentCtx, this.currentCanvas.width, o), this.offsetOverlayRenderer.drawOffsetOverlayGraphs(
      this.currentCtx,
      this.currentCanvas.width,
      this.currentCanvas.height,
      h,
      f
    ), n.length > 0 && this.similarityPlotRenderer.drawSimilarityPlot(
      this.similarityCtx,
      this.similarityCanvas.width,
      this.similarityCanvas.height,
      n
    ), this.waveformRenderer.drawCenterLine(this.bufferCtx, this.bufferCanvas.width, this.bufferCanvas.height), this.waveformRenderer.drawWaveform(
      this.bufferCtx,
      this.bufferCanvas.width,
      this.bufferCanvas.height,
      a,
      0,
      a.length,
      "#888888"
    ), this.positionMarkerRenderer.drawPositionMarkers(
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
const A = class A {
  constructor(e, t, i) {
    s(this, "canvas8div");
    s(this, "canvas4div");
    s(this, "canvas2div");
    s(this, "ctx8div");
    s(this, "ctx4div");
    s(this, "ctx2div");
    // History buffers for 100 frames
    s(this, "history8div", []);
    s(this, "history4div", []);
    s(this, "history2div", []);
    this.canvas8div = e, this.canvas4div = t, this.canvas2div = i;
    const r = e.getContext("2d"), a = t.getContext("2d"), o = i.getContext("2d");
    if (!r || !a || !o)
      throw new Error("Could not get 2D context for cycle similarity canvases");
    this.ctx8div = r, this.ctx4div = a, this.ctx2div = o, this.clearAllCanvases();
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
  drawSimilarityGraph(e, t, i, r, a, o) {
    if (e.save(), e.fillStyle = "#000000", e.fillRect(0, 0, t, i), e.strokeStyle = "#ff8800", e.lineWidth = 2, e.strokeRect(0, 0, t, i), e.fillStyle = "#ff8800", e.font = "bold 12px Arial", e.fillText(a, 5, 15), !r || r.length === 0 || !r[0] || r[0].length === 0) {
      e.fillStyle = "#666666", e.font = "11px Arial", e.fillText("データなし (No data)", t / 2 - 50, i / 2), e.restore();
      return;
    }
    const n = 35, h = 25, f = t - 45, d = i - 35, u = -1, g = 1;
    e.strokeStyle = "#333333", e.lineWidth = 1, e.beginPath();
    for (let l = 0; l <= 4; l++) {
      const x = h + d / 4 * l;
      e.moveTo(n, x), e.lineTo(n + f, x);
    }
    for (let l = 0; l <= 4; l++) {
      const x = n + f / 4 * l;
      e.moveTo(x, h), e.lineTo(x, h + d);
    }
    e.stroke(), e.fillStyle = "#aaaaaa", e.font = "10px monospace", e.textAlign = "right", e.textBaseline = "middle";
    for (let l = 0; l <= 4; l++) {
      const x = g - (g - u) * (l / 4), T = h + d / 4 * l, v = x.toFixed(1);
      e.fillText(v, n - 5, T);
    }
    const c = h + d - (0 - u) / (g - u) * d;
    e.strokeStyle = "#666666", e.lineWidth = 1, e.beginPath(), e.moveTo(n, c), e.lineTo(n + f, c), e.stroke();
    const m = r[0].length;
    for (let l = 0; l < m; l++) {
      const x = A.SEGMENT_COLORS[l % A.SEGMENT_COLORS.length];
      e.strokeStyle = x, e.lineWidth = 2, e.beginPath();
      const T = r.length > 1 ? f / (r.length - 1) : 0;
      let v = !1;
      for (let S = 0; S < r.length; S++) {
        const P = r[S];
        if (P && P.length > l) {
          const R = P[l], M = n + S * T, w = (Math.max(u, Math.min(g, R)) - u) / (g - u), E = h + d - w * d;
          v ? e.lineTo(M, E) : (e.moveTo(M, E), v = !0);
        }
      }
      e.stroke();
    }
    const p = r[r.length - 1];
    if (p && p.length > 0) {
      const x = p.length * 11 + 4, T = 65, v = n + f - T - 2, S = h + 2;
      e.fillStyle = "rgba(0, 0, 0, 0.7)", e.fillRect(v, S, T, x), e.strokeStyle = "#555555", e.lineWidth = 1, e.strokeRect(v, S, T, x), e.font = "9px Arial", e.textAlign = "left", e.textBaseline = "top";
      for (let P = 0; P < p.length; P++) {
        const R = A.SEGMENT_COLORS[P % A.SEGMENT_COLORS.length], M = p[P], C = S + 2 + P * 11;
        e.fillStyle = R, e.fillRect(v + 2, C, 8, 8), e.fillStyle = "#ffffff", e.fillText(`${P + 1}-${P + 2}: ${M.toFixed(2)}`, v + 12, C);
      }
    }
    e.fillStyle = "#aaaaaa", e.font = "10px Arial", e.textAlign = "center", e.fillText(o, n + f / 2, i - 3), e.restore();
  }
  /**
   * Update all cycle similarity graphs
   * @param similarities8div 8 divisions (1/2 cycle each): 7 similarity values
   * @param similarities4div 4 divisions (1 cycle each): 3 similarity values
   * @param similarities2div 2 divisions (2 cycles each): 1 similarity value
   */
  updateGraphs(e, t, i) {
    e && e.length > 0 && (this.history8div.push(e), this.history8div.length > A.HISTORY_SIZE && this.history8div.shift()), t && t.length > 0 && (this.history4div.push(t), this.history4div.length > A.HISTORY_SIZE && this.history4div.shift()), i && i.length > 0 && (this.history2div.push(i), this.history2div.length > A.HISTORY_SIZE && this.history2div.shift()), this.drawSimilarityGraph(
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
s(A, "HISTORY_SIZE", 100), s(A, "SEGMENT_COLORS", ["#00ff00", "#88ff00", "#ffaa00", "#ff6600", "#ff0000", "#ff00ff", "#00ffff"]);
let L = A;
const _ = class _ {
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
      const r = window.location.pathname.split("/").filter((a) => a.length > 0);
      r.length > 0 && (e = `/${r[0]}/`);
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
          const a = new URL(i, window.location.href).pathname;
          for (const o of _.ASSET_PATTERNS) {
            const n = a.indexOf(o);
            if (n >= 0)
              return n === 0 ? "/" : a.substring(0, n) + "/";
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
s(_, "ASSET_PATTERNS", ["/assets/", "/js/", "/dist/"]);
let W = _;
class de {
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
  async loadWasmModule(e) {
    if (!(this.isInitialized && this.wasmProcessor)) {
      if (typeof window > "u" || window.location.protocol === "file:")
        throw new Error("WASM module not available in test/non-browser environment");
      return new Promise((t, i) => {
        if (window.wasmProcessor && window.wasmProcessor.WasmDataProcessor) {
          this.wasmProcessor = new window.wasmProcessor.WasmDataProcessor(), this.isInitialized = !0, t();
          return;
        }
        const r = setTimeout(() => {
          n(), i(new Error(`WASM module loading timed out after ${this.LOAD_TIMEOUT_MS / 1e3} seconds`));
        }, this.LOAD_TIMEOUT_MS), a = `${e}wasm/signal_processor_wasm.js`, o = document.createElement("script");
        o.type = "module", o.textContent = `
        import init, { WasmDataProcessor } from '${a}';
        await init();
        window.wasmProcessor = { WasmDataProcessor };
        window.dispatchEvent(new Event('wasmLoaded'));
      `;
        const n = () => {
          clearTimeout(r), window.removeEventListener("wasmLoaded", h);
        }, h = () => {
          n(), window.wasmProcessor && window.wasmProcessor.WasmDataProcessor ? (this.wasmProcessor = new window.wasmProcessor.WasmDataProcessor(), this.isInitialized = !0, t()) : i(new Error("WASM module loaded but WasmDataProcessor not found"));
        };
        window.addEventListener("wasmLoaded", h), o.onerror = () => {
          n(), i(new Error("Failed to load WASM module script"));
        }, document.head.appendChild(o);
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
  constructor(e, t, i, r, a) {
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
    // Keep last 100 frames of offset data
    // Diagnostic tracking for issue #254 analysis
    s(this, "previousPhaseZeroIndex");
    s(this, "previousPhaseTwoPiIndex");
    // Previous frame percent positions for 1% clamping enforcement (issue #275)
    s(this, "prevPhaseZeroPercent");
    s(this, "prevPhaseTwoPiPercent");
    s(this, "prevPhaseMinusQuarterPiPercent");
    s(this, "prevPhaseTwoPiPlusQuarterPiPercent");
    // Performance diagnostics for issue #269
    s(this, "enableDetailedTimingLogs", !1);
    // Default: disabled to avoid performance impact
    s(this, "TIMING_LOG_THRESHOLD_MS", 16.67);
    this.audioManager = e, this.gainController = t, this.frequencyEstimator = i, this.waveformSearcher = r, this.zeroCrossDetector = a, this.basePathResolver = new W(), this.wasmLoader = new de();
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
    const i = performance.now(), r = this.wasmLoader.getProcessor();
    if (!this.wasmLoader.isReady() || !r)
      return console.warn("WASM processor not initialized"), null;
    if (!this.audioManager.isReady())
      return null;
    const a = performance.now(), o = this.audioManager.getTimeDomainData();
    if (!o)
      return null;
    const n = performance.now(), h = this.audioManager.getSampleRate(), f = this.audioManager.getFFTSize(), d = performance.now(), u = this.frequencyEstimator.getFrequencyEstimationMethod() === "fft" || e;
    let g = u ? this.audioManager.getFrequencyData() : null;
    const c = performance.now();
    if (u && !g && o) {
      const C = r.computeFrequencyData(o, f);
      C && (g = new Uint8Array(C));
    }
    const m = performance.now();
    this.syncConfigToWasm();
    const p = performance.now(), l = r.processFrame(
      o,
      g,
      h,
      f,
      e
    ), x = performance.now();
    if (!l)
      return null;
    const T = performance.now(), v = {
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
      halfFreqPeakStrengthPercent: l.halfFreqPeakStrengthPercent,
      candidate1Harmonics: l.candidate1Harmonics ? Array.from(l.candidate1Harmonics) : void 0,
      candidate2Harmonics: l.candidate2Harmonics ? Array.from(l.candidate2Harmonics) : void 0,
      selectionReason: l.selectionReason,
      cycleSimilarities8div: l.cycleSimilarities8div ? Array.from(l.cycleSimilarities8div) : void 0,
      cycleSimilarities4div: l.cycleSimilarities4div ? Array.from(l.cycleSimilarities4div) : void 0,
      cycleSimilarities2div: l.cycleSimilarities2div ? Array.from(l.cycleSimilarities2div) : void 0
    }, S = performance.now();
    this.clampPhaseMarkers(v), this.updatePhaseOffsetHistory(v), v.phaseZeroOffsetHistory = [...this.phaseZeroOffsetHistory], v.phaseTwoPiOffsetHistory = [...this.phaseTwoPiOffsetHistory], this.syncResultsFromWasm(v);
    const P = performance.now(), R = t !== void 0 ? t : this.enableDetailedTimingLogs, M = P - i;
    if (R || M > this.TIMING_LOG_THRESHOLD_MS) {
      const C = {
        init: (a - i).toFixed(2),
        getTimeDomain: (n - a).toFixed(2),
        getMetadata: (d - n).toFixed(2),
        getFreqData: (c - d).toFixed(2),
        computeFFT: (m - c).toFixed(2),
        syncConfig: (p - m).toFixed(2),
        wasmProcess: (x - p).toFixed(2),
        convertResult: (S - T).toFixed(2),
        postProcess: (P - S).toFixed(2),
        total: M.toFixed(2)
      };
      console.log(`[WaveformDataProcessor] init:${C.init}ms | getTimeDomain:${C.getTimeDomain}ms | getMeta:${C.getMetadata}ms | getFreq:${C.getFreqData}ms | computeFFT:${C.computeFFT}ms | syncCfg:${C.syncConfig}ms | WASM:${C.wasmProcess}ms | convert:${C.convertResult}ms | post:${C.postProcess}ms | total:${C.total}ms`);
    }
    return v;
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
    const r = 100 / 4 * 0.01, a = (d, u) => {
      if (d === void 0)
        return { index: void 0, percent: void 0 };
      const g = (d - e.displayStartIndex) / t * 100;
      if (u === void 0)
        return { index: d, percent: g };
      const c = g - u;
      if (Math.abs(c) <= r)
        return { index: d, percent: g };
      const m = u + Math.sign(c) * r, p = e.displayStartIndex + m / 100 * t;
      let l;
      c > 0 ? l = Math.floor(p) : c < 0 ? l = Math.ceil(p) : l = Math.round(p);
      const x = (l - e.displayStartIndex) / t * 100;
      return { index: l, percent: x };
    }, o = a(e.phaseZeroIndex, this.prevPhaseZeroPercent);
    e.phaseZeroIndex = o.index, this.prevPhaseZeroPercent = o.percent;
    const n = a(e.phaseTwoPiIndex, this.prevPhaseTwoPiPercent);
    e.phaseTwoPiIndex = n.index, this.prevPhaseTwoPiPercent = n.percent;
    const h = a(e.phaseMinusQuarterPiIndex, this.prevPhaseMinusQuarterPiPercent);
    e.phaseMinusQuarterPiIndex = h.index, this.prevPhaseMinusQuarterPiPercent = h.percent;
    const f = a(e.phaseTwoPiPlusQuarterPiIndex, this.prevPhaseTwoPiPlusQuarterPiPercent);
    e.phaseTwoPiPlusQuarterPiIndex = f.index, this.prevPhaseTwoPiPlusQuarterPiPercent = f.percent;
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
    const r = 100 / 4 * 0.01;
    let a = !1;
    const o = {
      frame: Date.now(),
      fourCycleWindow: {
        lengthSamples: t
        // Length of 4-cycle display window
      }
    };
    if (e.phaseZeroIndex !== void 0) {
      const h = (e.phaseZeroIndex - e.displayStartIndex) / t * 100;
      if (o.phaseZero = {
        startOffsetPercent: h
        // Position within 4-cycle window (0-100%)
      }, this.previousPhaseZeroIndex !== void 0) {
        const f = this.phaseZeroOffsetHistory[this.phaseZeroOffsetHistory.length - 1];
        if (f !== void 0) {
          const d = Math.abs(h - f);
          o.phaseZero.offsetChange = d, o.phaseZero.previousOffsetPercent = f, d > r && (a = !0, o.phaseZero.SPEC_VIOLATION = !0);
        }
      }
      this.phaseZeroOffsetHistory.push(h), this.phaseZeroOffsetHistory.length > this.MAX_OFFSET_HISTORY && this.phaseZeroOffsetHistory.shift(), this.previousPhaseZeroIndex = e.phaseZeroIndex;
    }
    if (e.phaseTwoPiIndex !== void 0) {
      const h = (e.phaseTwoPiIndex - e.displayStartIndex) / t * 100;
      if (o.phaseTwoPi = {
        endOffsetPercent: h
        // Position within 4-cycle window (0-100%)
      }, this.previousPhaseTwoPiIndex !== void 0) {
        const f = this.phaseTwoPiOffsetHistory[this.phaseTwoPiOffsetHistory.length - 1];
        if (f !== void 0) {
          const d = Math.abs(h - f);
          o.phaseTwoPi.offsetChange = d, o.phaseTwoPi.previousOffsetPercent = f, d > r && (a = !0, o.phaseTwoPi.SPEC_VIOLATION = !0);
        }
      }
      this.phaseTwoPiOffsetHistory.push(h), this.phaseTwoPiOffsetHistory.length > this.MAX_OFFSET_HISTORY && this.phaseTwoPiOffsetHistory.shift(), this.previousPhaseTwoPiIndex = e.phaseTwoPiIndex;
    }
    a && (console.warn("[1% Spec Violation Detected - Issue #254]", o), console.warn("→ Phase marker moved by more than 1% of one cycle in one frame"));
  }
  /**
   * Reset the WASM processor state
   */
  reset() {
    const e = this.wasmLoader.getProcessor();
    e && e.reset(), this.phaseZeroOffsetHistory = [], this.phaseTwoPiOffsetHistory = [], this.previousPhaseZeroIndex = void 0, this.previousPhaseTwoPiIndex = void 0, this.prevPhaseZeroPercent = void 0, this.prevPhaseTwoPiPercent = void 0, this.prevPhaseMinusQuarterPiPercent = void 0, this.prevPhaseTwoPiPlusQuarterPiPercent = void 0;
  }
}
class me {
  // Default: disabled to avoid performance impact
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
  constructor(e, t, i, r, a, o, n, h, f) {
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
    // Log FPS every 60 frames (approx. 1 second at 60fps)
    s(this, "enableDetailedTimingLogs", !1);
    this.audioManager = new Z(), this.gainController = new Q(), this.frequencyEstimator = new U(), this.renderer = new se(e, f), this.zeroCrossDetector = new re(), this.waveformSearcher = new ne(), this.comparisonRenderer = new ce(
      t,
      i,
      r,
      a
    ), o && n && h && (this.cycleSimilarityRenderer = new L(
      o,
      n,
      h
    )), this.dataProcessor = new fe(
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
      const r = performance.now(), a = this.dataProcessor.processFrame(this.renderer.getFFTDisplayEnabled(), this.enableDetailedTimingLogs), o = performance.now();
      if (a) {
        this.renderFrame(a);
        const n = performance.now(), h = o - r, f = n - o, d = n - r;
        (this.enableDetailedTimingLogs || d > this.TARGET_FRAME_TIME) && console.log(`[Frame Timing] Total: ${d.toFixed(2)}ms | Data Processing: ${h.toFixed(2)}ms | Rendering: ${f.toFixed(2)}ms`);
      }
    }
    const i = performance.now() - e;
    if (this.frameProcessingTimes.push(i), this.frameProcessingTimes.length > this.MAX_FRAME_TIMES && this.frameProcessingTimes.shift(), i > this.TARGET_FRAME_TIME && console.warn(`Frame processing time: ${i.toFixed(2)}ms (target: <${this.TARGET_FRAME_TIME}ms)`), this.lastFrameTime > 0) {
      const a = 1e3 / (e - this.lastFrameTime);
      if (this.frameProcessingTimes.length === this.FPS_LOG_INTERVAL_FRAMES) {
        const o = this.frameProcessingTimes.reduce((n, h) => n + h, 0) / this.frameProcessingTimes.length;
        console.log(`FPS: ${a.toFixed(1)}, Avg frame time: ${o.toFixed(2)}ms`);
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
    const r = i - t;
    this.renderer.clearAndDrawGrid(
      e.sampleRate,
      r,
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
  /**
   * Enable or disable detailed timing logs for performance diagnostics
   * When enabled, logs detailed breakdown of frame processing time
   * When disabled (default), only logs when performance exceeds target threshold
   * @param enabled - true to enable detailed timing logs, false to use threshold-based logging
   */
  setDetailedTimingLogs(e) {
    this.enableDetailedTimingLogs = e, this.dataProcessor.setDetailedTimingLogs(e);
  }
  /**
   * Get whether detailed timing logs are enabled
   * @returns true if detailed timing logs are enabled
   */
  getDetailedTimingLogsEnabled() {
    return this.enableDetailedTimingLogs;
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
class ge {
  constructor(e) {
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
    const r = i[1], a = parseInt(i[2], 10), n = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].indexOf(r);
    return { note: a * 12 + n, octave: a, noteInOctave: n };
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
      const r = (i % 12 + 12) % 12;
      this.WHITE_KEY_NOTES.includes(r) && t++;
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
    let r = 0;
    for (let h = t.startNote; h <= t.endNote; h++) {
      const f = (h % 12 + 12) % 12;
      if (this.WHITE_KEY_NOTES.includes(f)) {
        const d = this.xOffset + r * this.WHITE_KEY_WIDTH, u = i && i.note === h;
        this.ctx.fillStyle = u ? this.WHITE_KEY_HIGHLIGHT : this.WHITE_KEY_COLOR, this.ctx.fillRect(d, 0, this.WHITE_KEY_WIDTH, this.WHITE_KEY_HEIGHT), this.ctx.strokeStyle = this.KEY_BORDER, this.ctx.lineWidth = 1, this.ctx.strokeRect(d, 0, this.WHITE_KEY_WIDTH, this.WHITE_KEY_HEIGHT), r++;
      }
    }
    r = 0;
    for (let h = t.startNote; h <= t.endNote; h++) {
      const f = (h % 12 + 12) % 12;
      if (this.WHITE_KEY_NOTES.includes(f) && r++, this.BLACK_KEY_NOTES.includes(f)) {
        const d = this.xOffset + r * this.WHITE_KEY_WIDTH - this.BLACK_KEY_WIDTH / 2, u = i && i.note === h;
        this.ctx.fillStyle = u ? this.BLACK_KEY_HIGHLIGHT : this.BLACK_KEY_COLOR, this.ctx.fillRect(d, 0, this.BLACK_KEY_WIDTH, this.BLACK_KEY_HEIGHT), this.ctx.strokeStyle = this.KEY_BORDER, this.ctx.lineWidth = 1, this.ctx.strokeRect(d, 0, this.BLACK_KEY_WIDTH, this.BLACK_KEY_HEIGHT);
      }
    }
    this.ctx.fillStyle = "#888888", this.ctx.font = "10px monospace", this.ctx.fillText(`${this.MIN_FREQ}Hz`, this.xOffset + 5, this.WHITE_KEY_HEIGHT - 5);
    const a = `${this.MAX_FREQ}Hz`, o = this.ctx.measureText(a).width, n = this.xOffset + this.whiteKeyCount * this.WHITE_KEY_WIDTH;
    this.ctx.fillText(a, n - o - 5, this.WHITE_KEY_HEIGHT - 5);
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
    s(this, "buffer");
    s(this, "sampleRate");
    s(this, "position", 0);
    s(this, "chunkSize", 4096);
    // Default FFT size
    s(this, "isLooping", !1);
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
    const r = e.getChannelData(i);
    return new G(r, e.sampleRate, {
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
      const i = this.chunkSize - t.length, r = Math.min(i, this.buffer.length), a = new Float32Array(this.chunkSize);
      return a.set(t, 0), a.set(this.buffer.slice(0, r), t.length), this.position = r, a;
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
  U as FrequencyEstimator,
  Q as GainController,
  le as OffsetOverlayRenderer,
  me as Oscilloscope,
  ge as PianoKeyboardRenderer,
  he as PositionMarkerRenderer,
  oe as SimilarityPlotRenderer,
  fe as WaveformDataProcessor,
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
