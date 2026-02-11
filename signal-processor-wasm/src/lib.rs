use wasm_bindgen::prelude::*;

mod frequency_estimation;
mod zero_cross_detector;
mod waveform_searcher;
mod gain_controller;
mod bpf;
mod waveform_render_data;
mod dft;
mod candidate_selection;
mod phase_markers;

use frequency_estimation::FrequencyEstimator;
use zero_cross_detector::ZeroCrossDetector;
use waveform_searcher::{WaveformSearcher, CYCLES_TO_STORE};
use gain_controller::GainController;

pub use waveform_render_data::WaveformRenderData;

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
        // COORDINATE SPACE: frame buffer positions
        let mut selected_segment_buffer_position = 0;
        let mut selected_segment_buffer_end = data.len();
        let mut used_similarity_search = false;
        
        if self.waveform_searcher.has_previous_waveform() && cycle_length > 0.0 {
            if let Some(search_result) = self.waveform_searcher.search_similar_waveform(&data, cycle_length) {
                // Display N cycles worth (where N is CYCLES_TO_STORE)
                let waveform_length = (cycle_length * CYCLES_TO_STORE as f32).floor() as usize;
                selected_segment_buffer_position = search_result.start_index;
                selected_segment_buffer_end = (selected_segment_buffer_position + waveform_length).min(data.len());
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
                selected_segment_buffer_position = display_range.start_index;
                selected_segment_buffer_end = display_range.end_index;
            } else {
                // Zero-cross detection failed, calculate 4 cycles from start based on frequency estimation
                selected_segment_buffer_position = 0;
                if cycle_length > 0.0 {
                    let waveform_length = (cycle_length * CYCLES_TO_STORE as f32).floor() as usize;
                    selected_segment_buffer_end = waveform_length.min(data.len());
                } else {
                    // No frequency estimation available, use entire buffer as last resort
                    selected_segment_buffer_end = data.len();
                }
            }
        }
        
        // Calculate auto gain
        self.gain_controller.calculate_auto_gain(&data, selected_segment_buffer_position, selected_segment_buffer_end);
        let gain = self.gain_controller.get_current_gain();
        
        // Store waveform for next frame (N cycles worth, where N is CYCLES_TO_STORE)
        if cycle_length > 0.0 {
            let waveform_length = (cycle_length * CYCLES_TO_STORE as f32).floor() as usize;
            let end_index = (selected_segment_buffer_position + waveform_length).min(data.len());
            self.waveform_searcher.store_waveform(&data, selected_segment_buffer_position, end_index);
        }
        
        // Get waveform search data
        let previous_waveform = self.waveform_searcher.get_previous_waveform();
        let similarity = self.waveform_searcher.get_last_similarity();
        let similarity_plot_history = self.waveform_searcher.get_similarity_history();
        
        // Calculate phase marker positions and collect debug information
        // The display shows 4 cycles, we skip the first cycle and find phase markers in the middle region
        let (phase_zero_index, phase_two_pi_index, phase_minus_quarter_pi_index, phase_two_pi_plus_quarter_pi_index,
             phase_zero_segment_relative, phase_zero_history, phase_zero_tolerance) = 
            if cycle_length > 0.0 && selected_segment_buffer_position < selected_segment_buffer_end {
                self.calculate_phase_markers_with_debug(&data, selected_segment_buffer_position, cycle_length, estimated_frequency, sample_rate)
            } else {
                (None, None, None, None, None, None, None)
            };
        
        // Get zero-cross mode name for debugging
        let zero_cross_mode_name = Some(self.zero_cross_detector.get_zero_cross_mode_name());
        
        // Calculate cycle similarities for the current waveform
        let (cycle_similarities_8div, cycle_similarities_4div, cycle_similarities_2div) = 
            if cycle_length > 0.0 && selected_segment_buffer_position < selected_segment_buffer_end {
                self.waveform_searcher.calculate_cycle_similarities(
                    &data[selected_segment_buffer_position..selected_segment_buffer_end],
                    cycle_length
                )
            } else {
                (Vec::new(), Vec::new(), Vec::new())
            };

        // Collect zero-cross candidates within the displayed segment and determine highlighted candidate
        let zero_cross_candidates = self.collect_zero_cross_candidates(
            &data,
            selected_segment_buffer_position,
            selected_segment_buffer_end,
        );
        let highlighted_zero_cross_candidate = self.select_candidate_with_max_positive_peak(
            &data,
            selected_segment_buffer_position,
            selected_segment_buffer_end,
            &zero_cross_candidates,
        );
        
        Some(WaveformRenderData {
            waveform_data: data,
            selected_segment_buffer_position,
            selected_segment_buffer_end,
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
            zero_cross_candidates,
            highlighted_zero_cross_candidate,
            half_freq_peak_strength_percent: self.frequency_estimator.get_half_freq_peak_strength_percent(),
            candidate1_harmonics: self.frequency_estimator.get_candidate1_harmonics(),
            candidate2_harmonics: self.frequency_estimator.get_candidate2_harmonics(),
            candidate1_weighted_score: self.frequency_estimator.get_candidate1_weighted_score(),
            candidate2_weighted_score: self.frequency_estimator.get_candidate2_weighted_score(),
            selection_reason: self.frequency_estimator.get_selection_reason(),
            cycle_similarities_8div,
            cycle_similarities_4div,
            cycle_similarities_2div,
            phase_zero_segment_relative,
            phase_zero_history,
            phase_zero_tolerance,
            zero_cross_mode_name,
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
    
    #[wasm_bindgen(js_name = setZeroCrossMode)]
    pub fn set_zero_cross_mode(&mut self, mode: &str) {
        use zero_cross_detector::ZeroCrossMode;
        
        let zero_cross_mode = match mode {
            "standard" => ZeroCrossMode::Standard,
            "peak-backtrack-history" => ZeroCrossMode::PeakBacktrackWithHistory,
            "bidirectional-nearest" => ZeroCrossMode::BidirectionalNearest,
            "gradient-based" => ZeroCrossMode::GradientBased,
            "adaptive-step" => ZeroCrossMode::AdaptiveStep,
            "hysteresis" => ZeroCrossMode::Hysteresis,
            "closest-to-zero" => ZeroCrossMode::ClosestToZero,
            _ => {
                web_sys::console::warn_1(&format!("Unknown zero-cross mode: {}, using default (hysteresis)", mode).into());
                ZeroCrossMode::Hysteresis
            }
        };
        
        self.zero_cross_detector.set_zero_cross_mode(zero_cross_mode);
    }
    
    #[wasm_bindgen(js_name = reset)]
    pub fn reset(&mut self) {
        self.frequency_estimator.clear_history();
        self.zero_cross_detector.reset();
        self.waveform_searcher.reset();
    }
    
    /// Compute frequency-domain data from time-domain data for BufferSource mode using DFT
    /// Returns frequency magnitude data as Uint8Array (0-255 range) compatible with Web Audio API's AnalyserNode
    #[wasm_bindgen(js_name = computeFrequencyData)]
    pub fn compute_frequency_data(
        &self,
        time_domain_data: &[f32],
        fft_size: usize,
    ) -> Option<Vec<u8>> {
        dft::compute_frequency_data(time_domain_data, fft_size)
    }
}
