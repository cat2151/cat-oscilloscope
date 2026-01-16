/* @ts-self-types="./wasm_processor.d.ts" */

/**
 * WasmDataProcessor - WASM implementation of WaveformDataProcessor
 */
export class WasmDataProcessor {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmDataProcessorFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmdataprocessor_free(ptr, 0);
    }
    constructor() {
        const ret = wasm.wasmdataprocessor_new();
        this.__wbg_ptr = ret >>> 0;
        WasmDataProcessorFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Process a frame and return WaveformRenderData
     * @param {Float32Array} waveform_data
     * @param {Uint8Array | null | undefined} frequency_data
     * @param {number} sample_rate
     * @param {number} fft_size
     * @param {boolean} fft_display_enabled
     * @returns {WaveformRenderData | undefined}
     */
    processFrame(waveform_data, frequency_data, sample_rate, fft_size, fft_display_enabled) {
        const ptr0 = passArrayF32ToWasm0(waveform_data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(frequency_data) ? 0 : passArray8ToWasm0(frequency_data, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmdataprocessor_processFrame(this.__wbg_ptr, ptr0, len0, ptr1, len1, sample_rate, fft_size, fft_display_enabled);
        return ret === 0 ? undefined : WaveformRenderData.__wrap(ret);
    }
    reset() {
        wasm.wasmdataprocessor_reset(this.__wbg_ptr);
    }
    /**
     * @param {boolean} enabled
     */
    setAutoGain(enabled) {
        wasm.wasmdataprocessor_setAutoGain(this.__wbg_ptr, enabled);
    }
    /**
     * @param {number} multiplier
     */
    setBufferSizeMultiplier(multiplier) {
        wasm.wasmdataprocessor_setBufferSizeMultiplier(this.__wbg_ptr, multiplier);
    }
    /**
     * @param {string} method
     */
    setFrequencyEstimationMethod(method) {
        const ptr0 = passStringToWasm0(method, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.wasmdataprocessor_setFrequencyEstimationMethod(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {boolean} enabled
     */
    setNoiseGate(enabled) {
        wasm.wasmdataprocessor_setNoiseGate(this.__wbg_ptr, enabled);
    }
    /**
     * @param {number} threshold
     */
    setNoiseGateThreshold(threshold) {
        wasm.wasmdataprocessor_setNoiseGateThreshold(this.__wbg_ptr, threshold);
    }
    /**
     * @param {boolean} enabled
     */
    setUsePeakMode(enabled) {
        wasm.wasmdataprocessor_setUsePeakMode(this.__wbg_ptr, enabled);
    }
}
if (Symbol.dispose) WasmDataProcessor.prototype[Symbol.dispose] = WasmDataProcessor.prototype.free;

/**
 * WaveformRenderData - Complete data structure for waveform rendering
 * This mirrors the TypeScript interface WaveformRenderData
 */
export class WaveformRenderData {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WaveformRenderData.prototype);
        obj.__wbg_ptr = ptr;
        WaveformRenderDataFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WaveformRenderDataFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_waveformrenderdata_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get displayEndIndex() {
        const ret = wasm.waveformrenderdata_displayEndIndex(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get displayStartIndex() {
        const ret = wasm.waveformrenderdata_displayStartIndex(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get estimatedFrequency() {
        const ret = wasm.waveformrenderdata_estimatedFrequency(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get fftSize() {
        const ret = wasm.waveformrenderdata_fftSize(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {Uint8Array | undefined}
     */
    get frequencyData() {
        const ret = wasm.waveformrenderdata_frequencyData(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {Float32Array}
     */
    get frequencyPlotHistory() {
        const ret = wasm.waveformrenderdata_frequencyPlotHistory(this.__wbg_ptr);
        var v1 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {number}
     */
    get gain() {
        const ret = wasm.waveformrenderdata_gain(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {boolean}
     */
    get isSignalAboveNoiseGate() {
        const ret = wasm.waveformrenderdata_isSignalAboveNoiseGate(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get maxFrequency() {
        const ret = wasm.waveformrenderdata_maxFrequency(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {Float32Array | undefined}
     */
    get previousWaveform() {
        const ret = wasm.waveformrenderdata_previousWaveform(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        }
        return v1;
    }
    /**
     * @returns {number}
     */
    get sampleRate() {
        const ret = wasm.waveformrenderdata_sampleRate(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get similarity() {
        const ret = wasm.waveformrenderdata_similarity(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {Float32Array}
     */
    get similarityPlotHistory() {
        const ret = wasm.waveformrenderdata_similarityPlotHistory(this.__wbg_ptr);
        var v1 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {boolean}
     */
    get usedSimilaritySearch() {
        const ret = wasm.waveformrenderdata_usedSimilaritySearch(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {Float32Array}
     */
    get waveform_data() {
        const ret = wasm.waveformrenderdata_waveform_data(this.__wbg_ptr);
        var v1 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
}
if (Symbol.dispose) WaveformRenderData.prototype[Symbol.dispose] = WaveformRenderData.prototype.free;

function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg___wbindgen_throw_be289d5034ed271b: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_error_1529ada434ef54b4: function(arg0, arg1) {
            console.error(getStringFromWasm0(arg0, arg1));
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./wasm_processor_bg.js": import0,
    };
}

const WasmDataProcessorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmdataprocessor_free(ptr >>> 0, 1));
const WaveformRenderDataFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_waveformrenderdata_free(ptr >>> 0, 1));

function getArrayF32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedFloat32ArrayMemory0 = null;
function getFloat32ArrayMemory0() {
    if (cachedFloat32ArrayMemory0 === null || cachedFloat32ArrayMemory0.byteLength === 0) {
        cachedFloat32ArrayMemory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayF32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getFloat32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasm;
function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    wasmModule = module;
    cachedFloat32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('wasm_processor_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
