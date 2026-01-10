/* tslint:disable */
/* eslint-disable */

export class WasmDataProcessor {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Process a frame and return WaveformRenderData
   */
  processFrame(waveform_data: Float32Array, frequency_data: Uint8Array | null | undefined, sample_rate: number, fft_size: number, fft_display_enabled: boolean): WaveformRenderData | undefined;
  setAutoGain(enabled: boolean): void;
  setNoiseGate(enabled: boolean): void;
  setUsePeakMode(enabled: boolean): void;
  setNoiseGateThreshold(threshold: number): void;
  setBufferSizeMultiplier(multiplier: number): void;
  setFrequencyEstimationMethod(method: string): void;
  constructor();
  reset(): void;
}

export class WaveformRenderData {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  readonly similarity: number;
  readonly sampleRate: number;
  readonly maxFrequency: number;
  readonly waveform_data: Float32Array;
  readonly frequencyData: Uint8Array | undefined;
  readonly displayEndIndex: number;
  readonly previousWaveform: Float32Array | undefined;
  readonly displayStartIndex: number;
  readonly estimatedFrequency: number;
  readonly firstAlignmentPoint: number | undefined;
  readonly frequencyPlotHistory: Float32Array;
  readonly secondAlignmentPoint: number | undefined;
  readonly usedSimilaritySearch: boolean;
  readonly similarityPlotHistory: Float32Array;
  readonly isSignalAboveNoiseGate: boolean;
  readonly gain: number;
  readonly fftSize: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_wasmdataprocessor_free: (a: number, b: number) => void;
  readonly __wbg_waveformrenderdata_free: (a: number, b: number) => void;
  readonly wasmdataprocessor_new: () => number;
  readonly wasmdataprocessor_processFrame: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => number;
  readonly wasmdataprocessor_reset: (a: number) => void;
  readonly wasmdataprocessor_setAutoGain: (a: number, b: number) => void;
  readonly wasmdataprocessor_setBufferSizeMultiplier: (a: number, b: number) => void;
  readonly wasmdataprocessor_setFrequencyEstimationMethod: (a: number, b: number, c: number) => void;
  readonly wasmdataprocessor_setNoiseGate: (a: number, b: number) => void;
  readonly wasmdataprocessor_setNoiseGateThreshold: (a: number, b: number) => void;
  readonly wasmdataprocessor_setUsePeakMode: (a: number, b: number) => void;
  readonly waveformrenderdata_displayEndIndex: (a: number) => number;
  readonly waveformrenderdata_displayStartIndex: (a: number) => number;
  readonly waveformrenderdata_estimatedFrequency: (a: number) => number;
  readonly waveformrenderdata_fftSize: (a: number) => number;
  readonly waveformrenderdata_firstAlignmentPoint: (a: number) => number;
  readonly waveformrenderdata_frequencyData: (a: number) => [number, number];
  readonly waveformrenderdata_frequencyPlotHistory: (a: number) => [number, number];
  readonly waveformrenderdata_gain: (a: number) => number;
  readonly waveformrenderdata_isSignalAboveNoiseGate: (a: number) => number;
  readonly waveformrenderdata_maxFrequency: (a: number) => number;
  readonly waveformrenderdata_previousWaveform: (a: number) => [number, number];
  readonly waveformrenderdata_sampleRate: (a: number) => number;
  readonly waveformrenderdata_secondAlignmentPoint: (a: number) => number;
  readonly waveformrenderdata_similarity: (a: number) => number;
  readonly waveformrenderdata_similarityPlotHistory: (a: number) => [number, number];
  readonly waveformrenderdata_usedSimilaritySearch: (a: number) => number;
  readonly waveformrenderdata_waveform_data: (a: number) => [number, number];
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
