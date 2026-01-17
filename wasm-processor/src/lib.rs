use wasm_bindgen::prelude::*;

mod frequency_estimator;
mod zero_cross_detector;
mod waveform_searcher;
mod gain_controller;

use frequency_estimator::FrequencyEstimator;
use zero_cross_detector::ZeroCrossDetector;
use waveform_searcher::{WaveformSearcher, CYCLES_TO_STORE};
use gain_controller::GainController;

/// WaveformRenderData - Complete data structure for waveform rendering
/// This mirrors the TypeScript interface WaveformRenderData
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct WaveformRenderData {
    // Waveform data
    waveform_data: Vec<f32>,
    
    display_start_index: usize,
    display_end_index: usize,
    gain: f32,
    
    // Frequency information
    estimated_frequency: f32,
    frequency_plot_history: Vec<f32>,
    sample_rate: f32,
    fft_size: usize,
    
    // FFT spectrum data (optional)
    frequency_data: Option<Vec<u8>>,
    
    is_signal_above_noise_gate: bool,
    max_frequency: f32,
    
    // Waveform search information
    previous_waveform: Option<Vec<f32>>,
    similarity: f32,
    similarity_plot_history: Vec<f32>,
    used_similarity_search: bool,
    
    // Phase marker positions (in sample indices within the waveform_data buffer)
    phase_zero_index: Option<usize>,
    phase_two_pi_index: Option<usize>,
    phase_minus_quarter_pi_index: Option<usize>,
    phase_two_pi_plus_quarter_pi_index: Option<usize>,
}

#[wasm_bindgen]
impl WaveformRenderData {
    // Getters for JavaScript
    #[wasm_bindgen(getter)]
    pub fn waveform_data(&self) -> Vec<f32> {
        self.waveform_data.clone()
    }
    
    #[wasm_bindgen(getter, js_name = displayStartIndex)]
    pub fn display_start_index(&self) -> usize {
        self.display_start_index
    }
    
    #[wasm_bindgen(getter, js_name = displayEndIndex)]
    pub fn display_end_index(&self) -> usize {
        self.display_end_index
    }
    
    #[wasm_bindgen(getter)]
    pub fn gain(&self) -> f32 {
        self.gain
    }
    
    #[wasm_bindgen(getter, js_name = estimatedFrequency)]
    pub fn estimated_frequency(&self) -> f32 {
        self.estimated_frequency
    }
    
    #[wasm_bindgen(getter, js_name = frequencyPlotHistory)]
    pub fn frequency_plot_history(&self) -> Vec<f32> {
        self.frequency_plot_history.clone()
    }
    
    #[wasm_bindgen(getter, js_name = sampleRate)]
    pub fn sample_rate(&self) -> f32 {
        self.sample_rate
    }
    
    #[wasm_bindgen(getter, js_name = fftSize)]
    pub fn fft_size(&self) -> usize {
        self.fft_size
    }
    
    #[wasm_bindgen(getter, js_name = frequencyData)]
    pub fn frequency_data(&self) -> Option<Vec<u8>> {
        self.frequency_data.clone()
    }
    
    #[wasm_bindgen(getter, js_name = isSignalAboveNoiseGate)]
    pub fn is_signal_above_noise_gate(&self) -> bool {
        self.is_signal_above_noise_gate
    }
    
    #[wasm_bindgen(getter, js_name = maxFrequency)]
    pub fn max_frequency(&self) -> f32 {
        self.max_frequency
    }
    
    #[wasm_bindgen(getter, js_name = previousWaveform)]
    pub fn previous_waveform(&self) -> Option<Vec<f32>> {
        self.previous_waveform.clone()
    }
    
    #[wasm_bindgen(getter)]
    pub fn similarity(&self) -> f32 {
        self.similarity
    }
    
    #[wasm_bindgen(getter, js_name = similarityPlotHistory)]
    pub fn similarity_plot_history(&self) -> Vec<f32> {
        self.similarity_plot_history.clone()
    }
    
    #[wasm_bindgen(getter, js_name = usedSimilaritySearch)]
    pub fn used_similarity_search(&self) -> bool {
        self.used_similarity_search
    }
    
    #[wasm_bindgen(getter, js_name = phaseZeroIndex)]
    pub fn phase_zero_index(&self) -> Option<usize> {
        self.phase_zero_index
    }
    
    #[wasm_bindgen(getter, js_name = phaseTwoPiIndex)]
    pub fn phase_two_pi_index(&self) -> Option<usize> {
        self.phase_two_pi_index
    }
    
    #[wasm_bindgen(getter, js_name = phaseMinusQuarterPiIndex)]
    pub fn phase_minus_quarter_pi_index(&self) -> Option<usize> {
        self.phase_minus_quarter_pi_index
    }
    
    #[wasm_bindgen(getter, js_name = phaseTwoPiPlusQuarterPiIndex)]
    pub fn phase_two_pi_plus_quarter_pi_index(&self) -> Option<usize> {
        self.phase_two_pi_plus_quarter_pi_index
    }
}

/// WasmDataProcessor - WASM implementation of WaveformDataProcessor
#[wasm_bindgen]
pub struct WasmDataProcessor {
    gain_controller: GainController,
    frequency_estimator: FrequencyEstimator,
    zero_cross_detector: ZeroCrossDetector,
    waveform_searcher: WaveformSearcher,
}

#[wasm_bindgen]
impl WasmDataProcessor {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        WasmDataProcessor {
            gain_controller: GainController::new(),
            frequency_estimator: FrequencyEstimator::new(),
            zero_cross_detector: ZeroCrossDetector::new(),
            waveform_searcher: WaveformSearcher::new(),
        }
    }
    
    /// Process a frame and return WaveformRenderData
    #[wasm_bindgen(js_name = processFrame)]
    pub fn process_frame(
        &mut self,
        waveform_data: &[f32],
        frequency_data: Option<Vec<u8>>,
        sample_rate: f32,
        fft_size: usize,
        fft_display_enabled: bool,
    ) -> Option<WaveformRenderData> {
        if waveform_data.is_empty() {
            web_sys::console::log_1(&"No data: Waveform data is empty".into());
            return None;
        }
        
        // Convert to mutable Vec for noise gate processing
        let mut data = waveform_data.to_vec();
        
        // Apply noise gate
        self.gain_controller.apply_noise_gate(&mut data);
        
        // Check if signal passed noise gate
        let is_signal_above_noise_gate = self.gain_controller.is_signal_above_noise_gate(&data);
        
        // Determine if we need frequency data
        let needs_frequency_data = 
            self.frequency_estimator.get_frequency_estimation_method() == "fft" || fft_display_enabled;
        let freq_data = if needs_frequency_data {
            frequency_data
        } else {
            None
        };
        
        // Estimate frequency
        let estimated_frequency = self.frequency_estimator.estimate_frequency(
            &data,
            freq_data.as_deref(),
            sample_rate,
            fft_size,
            is_signal_above_noise_gate,
        );
        
        // Calculate cycle length
        let cycle_length = if estimated_frequency > 0.0 && sample_rate > 0.0 {
            sample_rate / estimated_frequency
        } else {
            0.0
        };
        
        // Try to find similar waveform
        let mut display_start_index = 0;
        let mut display_end_index = data.len();
        let mut used_similarity_search = false;
        
        if self.waveform_searcher.has_previous_waveform() && cycle_length > 0.0 {
            if let Some(search_result) = self.waveform_searcher.search_similar_waveform(&data, cycle_length) {
                // Display N cycles worth (where N is CYCLES_TO_STORE)
                let waveform_length = (cycle_length * CYCLES_TO_STORE as f32).floor() as usize;
                display_start_index = search_result.start_index;
                display_end_index = (display_start_index + waveform_length).min(data.len());
                used_similarity_search = true;
            }
            // Note: Similarity history is always updated inside search_similar_waveform(),
            // even when it returns None (validation failures or low similarity)
        } else {
            // Cannot perform similarity search (no previous waveform or invalid cycle length)
            // Record this in history to keep the graph updating
            if self.waveform_searcher.has_previous_waveform() {
                self.waveform_searcher.record_no_search();
            }
        }
        
        // Fallback to zero-cross alignment if similarity search not used
        if !used_similarity_search {
            // Use zero-cross alignment
            if let Some(display_range) = self.zero_cross_detector.calculate_display_range(
                &data,
                estimated_frequency,
                sample_rate,
            ) {
                display_start_index = display_range.start_index;
                display_end_index = display_range.end_index;
            } else {
                // Zero-cross detection failed, calculate 4 cycles from start based on frequency estimation
                display_start_index = 0;
                if cycle_length > 0.0 {
                    let waveform_length = (cycle_length * CYCLES_TO_STORE as f32).floor() as usize;
                    display_end_index = waveform_length.min(data.len());
                } else {
                    // No frequency estimation available, use entire buffer as last resort
                    display_end_index = data.len();
                }
            }
        }
        
        // Calculate auto gain
        self.gain_controller.calculate_auto_gain(&data, display_start_index, display_end_index);
        let gain = self.gain_controller.get_current_gain();
        
        // Store waveform for next frame (N cycles worth, where N is CYCLES_TO_STORE)
        if cycle_length > 0.0 {
            let waveform_length = (cycle_length * CYCLES_TO_STORE as f32).floor() as usize;
            let end_index = (display_start_index + waveform_length).min(data.len());
            self.waveform_searcher.store_waveform(&data, display_start_index, end_index);
        }
        
        // Get waveform search data
        let previous_waveform = self.waveform_searcher.get_previous_waveform();
        let similarity = self.waveform_searcher.get_last_similarity();
        let similarity_plot_history = self.waveform_searcher.get_similarity_history();
        
        // Calculate phase marker positions
        // The display shows 4 cycles, we skip the first cycle and find phase markers in the middle region
        let (phase_zero_index, phase_two_pi_index, phase_minus_quarter_pi_index, phase_two_pi_plus_quarter_pi_index) = 
            if cycle_length > 0.0 && display_start_index < display_end_index {
                self.calculate_phase_markers(&data, display_start_index, cycle_length)
            } else {
                (None, None, None, None)
            };
        
        Some(WaveformRenderData {
            waveform_data: data,
            display_start_index,
            display_end_index,
            gain,
            estimated_frequency,
            frequency_plot_history: self.frequency_estimator.get_frequency_plot_history(),
            sample_rate,
            fft_size,
            frequency_data: freq_data,
            is_signal_above_noise_gate,
            max_frequency: self.frequency_estimator.get_max_frequency(),
            previous_waveform,
            similarity,
            similarity_plot_history,
            used_similarity_search,
            phase_zero_index,
            phase_two_pi_index,
            phase_minus_quarter_pi_index,
            phase_two_pi_plus_quarter_pi_index,
        })
    }
    
    // Configuration methods
    #[wasm_bindgen(js_name = setAutoGain)]
    pub fn set_auto_gain(&mut self, enabled: bool) {
        self.gain_controller.set_auto_gain(enabled);
    }
    
    #[wasm_bindgen(js_name = setNoiseGate)]
    pub fn set_noise_gate(&mut self, enabled: bool) {
        self.gain_controller.set_noise_gate(enabled);
    }
    
    #[wasm_bindgen(js_name = setNoiseGateThreshold)]
    pub fn set_noise_gate_threshold(&mut self, threshold: f32) {
        self.gain_controller.set_noise_gate_threshold(threshold);
    }
    
    #[wasm_bindgen(js_name = setFrequencyEstimationMethod)]
    pub fn set_frequency_estimation_method(&mut self, method: &str) {
        self.frequency_estimator.set_frequency_estimation_method(method);
    }
    
    #[wasm_bindgen(js_name = setBufferSizeMultiplier)]
    pub fn set_buffer_size_multiplier(&mut self, multiplier: u32) {
        self.frequency_estimator.set_buffer_size_multiplier(multiplier);
    }
    
    #[wasm_bindgen(js_name = setUsePeakMode)]
    pub fn set_use_peak_mode(&mut self, enabled: bool) {
        self.zero_cross_detector.set_use_peak_mode(enabled);
    }
    
    #[wasm_bindgen(js_name = reset)]
    pub fn reset(&mut self) {
        self.frequency_estimator.clear_history();
        self.zero_cross_detector.reset();
        self.waveform_searcher.reset();
    }
    
    /// Calculate phase marker positions for the waveform
    /// Returns (phase_0, phase_2pi, phase_-pi/4, phase_2pi+pi/4) as sample indices
    fn calculate_phase_markers(
        &self,
        data: &[f32],
        display_start_index: usize,
        cycle_length: f32,
    ) -> (Option<usize>, Option<usize>, Option<usize>, Option<usize>) {
        // Skip the first cycle to leave left margin
        let search_start = display_start_index + cycle_length as usize;
        
        // Search for phase 0: where the signal crosses from negative to positive
        let phase_zero = self.find_zero_crossing_in_region(data, search_start, cycle_length);
        
        if let Some(phase_0_idx) = phase_zero {
            // Phase 2π is one cycle after phase 0
            let phase_2pi_idx = phase_0_idx + cycle_length as usize;
            
            // Phase -π/4 is 1/8 cycle before phase 0 (π/4 = 1/8 of 2π)
            let eighth_cycle = (cycle_length / 8.0) as usize;
            let phase_minus_quarter_pi_idx = phase_0_idx.saturating_sub(eighth_cycle);
            
            // Phase 2π+π/4 is 1/8 cycle after phase 2π (π/4 = 1/8 of 2π)
            let phase_2pi_plus_quarter_pi_idx = phase_2pi_idx + eighth_cycle;
            
            // Ensure indices are within the data bounds
            let phase_2pi = if phase_2pi_idx < data.len() {
                Some(phase_2pi_idx)
            } else {
                None
            };
            
            let phase_2pi_plus_quarter_pi = if phase_2pi_plus_quarter_pi_idx < data.len() {
                Some(phase_2pi_plus_quarter_pi_idx)
            } else {
                None
            };
            
            (
                Some(phase_0_idx),
                phase_2pi,
                Some(phase_minus_quarter_pi_idx),
                phase_2pi_plus_quarter_pi,
            )
        } else {
            (None, None, None, None)
        }
    }
    
    /// Find a zero crossing (negative to positive) in a region
    fn find_zero_crossing_in_region(
        &self,
        data: &[f32],
        start_index: usize,
        search_range: f32,
    ) -> Option<usize> {
        let end_index = (start_index + search_range as usize).min(data.len() - 1);
        
        if start_index >= end_index {
            return None;
        }
        
        for i in start_index..end_index {
            if data[i] <= 0.0 && data[i + 1] > 0.0 {
                return Some(i);
            }
        }
        
        None
    }
}
