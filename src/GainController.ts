import { dbToAmplitude } from './utils';

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
export class GainController {
  private autoGainEnabled = true;
  private currentGain = 1.0;
  
  private noiseGateEnabled = true;
  private noiseGateThreshold = dbToAmplitude(-60); // Default threshold (-60dB)

  setAutoGain(enabled: boolean): void {
    this.autoGainEnabled = enabled;
  }

  getAutoGainEnabled(): boolean {
    return this.autoGainEnabled;
  }

  setNoiseGate(enabled: boolean): void {
    this.noiseGateEnabled = enabled;
  }

  getNoiseGateEnabled(): boolean {
    return this.noiseGateEnabled;
  }

  setNoiseGateThreshold(threshold: number): void {
    // Clamp threshold between 0 and 1
    this.noiseGateThreshold = Math.min(Math.max(threshold, 0), 1);
  }

  getNoiseGateThreshold(): number {
    return this.noiseGateThreshold;
  }

  getCurrentGain(): number {
    return this.currentGain;
  }
}
