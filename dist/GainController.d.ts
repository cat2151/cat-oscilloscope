/**
 * GainController - Configuration holder for gain control
 *
 * This class only holds configuration state. All actual gain control
 * and noise gate algorithms are implemented in Rust WASM (signal-processor-wasm module).
 *
 * Responsible for:
 * - Storing auto-gain enabled/disabled state
 * - Storing noise gate enabled/disabled state
 * - Storing noise gate threshold
 * - Holding current gain value (updated by WASM processor)
 */
export declare class GainController {
    private autoGainEnabled;
    private currentGain;
    private noiseGateEnabled;
    private noiseGateThreshold;
    setAutoGain(enabled: boolean): void;
    getAutoGainEnabled(): boolean;
    setNoiseGate(enabled: boolean): void;
    getNoiseGateEnabled(): boolean;
    setNoiseGateThreshold(threshold: number): void;
    getNoiseGateThreshold(): number;
    getCurrentGain(): number;
}
