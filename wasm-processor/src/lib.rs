use wasm_bindgen::prelude::*;

mod frequency_estimator;
mod zero_cross_detector;
mod waveform_searcher;
mod gain_controller;
mod bpf;

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
    
    // Harmonic analysis for debugging (only populated when FFT method is used)
    half_freq_peak_strength_percent: Option<f32>,  // Strength of peak at 1/2 estimated frequency (%)
    candidate1_harmonics: Option<Vec<f32>>,        // Harmonics strength for candidate1 (estimated freq)
    candidate2_harmonics: Option<Vec<f32>>,        // Harmonics strength for candidate2 (1/2 freq)
    candidate1_weighted_score: Option<f32>,        // Weighted harmonic score for candidate1
    candidate2_weighted_score: Option<f32>,        // Weighted harmonic score for candidate2
    selection_reason: Option<String>,              // Why candidate1 was chosen over candidate2
    
    // Cycle similarity analysis for frequency estimation tuning
    cycle_similarities_8div: Vec<f32>,             // 8 divisions (1/2 cycle each): 7 similarity values
    cycle_similarities_4div: Vec<f32>,             // 4 divisions (1 cycle each): 3 similarity values
    cycle_similarities_2div: Vec<f32>,             // 2 divisions (2 cycles each): 1 similarity value
    
    // Debug information for phase marker tracking (issue #220)
    phase_zero_segment_relative: Option<usize>,    // Phase 0 position relative to segment start
    phase_zero_history: Option<usize>,             // History value used for tracking
    phase_zero_tolerance: Option<usize>,           // 1% tolerance in samples
    zero_cross_mode_name: Option<String>,          // Current zero-cross detection mode name
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
    
    #[wasm_bindgen(getter, js_name = halfFreqPeakStrengthPercent)]
    pub fn half_freq_peak_strength_percent(&self) -> Option<f32> {
        self.half_freq_peak_strength_percent
    }
    
    #[wasm_bindgen(getter, js_name = candidate1Harmonics)]
    pub fn candidate1_harmonics(&self) -> Option<Vec<f32>> {
        self.candidate1_harmonics.clone()
    }
    
    #[wasm_bindgen(getter, js_name = candidate2Harmonics)]
    pub fn candidate2_harmonics(&self) -> Option<Vec<f32>> {
        self.candidate2_harmonics.clone()
    }
    
    #[wasm_bindgen(getter, js_name = candidate1WeightedScore)]
    pub fn candidate1_weighted_score(&self) -> Option<f32> {
        self.candidate1_weighted_score
    }
    
    #[wasm_bindgen(getter, js_name = candidate2WeightedScore)]
    pub fn candidate2_weighted_score(&self) -> Option<f32> {
        self.candidate2_weighted_score
    }
    
    #[wasm_bindgen(getter, js_name = selectionReason)]
    pub fn selection_reason(&self) -> Option<String> {
        self.selection_reason.clone()
    }
    
    #[wasm_bindgen(getter, js_name = cycleSimilarities8div)]
    pub fn cycle_similarities_8div(&self) -> Vec<f32> {
        self.cycle_similarities_8div.clone()
    }
    
    #[wasm_bindgen(getter, js_name = cycleSimilarities4div)]
    pub fn cycle_similarities_4div(&self) -> Vec<f32> {
        self.cycle_similarities_4div.clone()
    }
    
    #[wasm_bindgen(getter, js_name = cycleSimilarities2div)]
    pub fn cycle_similarities_2div(&self) -> Vec<f32> {
        self.cycle_similarities_2div.clone()
    }
    
    // Debug information getters for phase marker tracking
    #[wasm_bindgen(getter, js_name = phaseZeroSegmentRelative)]
    pub fn phase_zero_segment_relative(&self) -> Option<usize> {
        self.phase_zero_segment_relative
    }
    
    #[wasm_bindgen(getter, js_name = phaseZeroHistory)]
    pub fn phase_zero_history(&self) -> Option<usize> {
        self.phase_zero_history
    }
    
    #[wasm_bindgen(getter, js_name = phaseZeroTolerance)]
    pub fn phase_zero_tolerance(&self) -> Option<usize> {
        self.phase_zero_tolerance
    }
    
    #[wasm_bindgen(getter, js_name = zeroCrossModeName)]
    pub fn zero_cross_mode_name(&self) -> Option<String> {
        self.zero_cross_mode_name.clone()
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
        
        // Calculate phase marker positions and collect debug information
        // The display shows 4 cycles, we skip the first cycle and find phase markers in the middle region
        let (phase_zero_index, phase_two_pi_index, phase_minus_quarter_pi_index, phase_two_pi_plus_quarter_pi_index,
             phase_zero_segment_relative, phase_zero_history, phase_zero_tolerance) = 
            if cycle_length > 0.0 && display_start_index < display_end_index {
                self.calculate_phase_markers_with_debug(&data, display_start_index, cycle_length, estimated_frequency, sample_rate)
            } else {
                (None, None, None, None, None, None, None)
            };
        
        // Get zero-cross mode name for debugging
        let zero_cross_mode_name = Some(self.zero_cross_detector.get_zero_cross_mode_name());
        
        // Calculate cycle similarities for the current waveform
        let (cycle_similarities_8div, cycle_similarities_4div, cycle_similarities_2div) = 
            if cycle_length > 0.0 && display_start_index < display_end_index {
                self.waveform_searcher.calculate_cycle_similarities(
                    &data[display_start_index..display_end_index],
                    cycle_length
                )
            } else {
                (Vec::new(), Vec::new(), Vec::new())
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
    
    /// Calculate phase marker positions for the waveform
    /// Returns (phase_0, phase_2pi, phase_-pi/4, phase_2pi+pi/4) as sample indices
    /// 
    /// Uses zero_cross_detector to find phase 0 position within the displayed 4-cycle segment,
    /// respecting the dropdown selection (Hysteresis, Peak+History with 1% constraint, etc.)
    fn calculate_phase_markers(
        &mut self,
        data: &[f32],
        display_start_index: usize,
        cycle_length: f32,
        estimated_frequency: f32,
        sample_rate: f32,
    ) -> (Option<usize>, Option<usize>, Option<usize>, Option<usize>) {
        let (phase_zero, phase_2pi, phase_minus_quarter_pi, phase_2pi_plus_quarter_pi, _, _, _) = 
            self.calculate_phase_markers_with_debug(data, display_start_index, cycle_length, estimated_frequency, sample_rate);
        (phase_zero, phase_2pi, phase_minus_quarter_pi, phase_2pi_plus_quarter_pi)
    }
    
    /// Calculate phase marker positions with debug information
    /// Returns (phase_0, phase_2pi, phase_-pi/4, phase_2pi+pi/4, segment_relative, history, tolerance)
    fn calculate_phase_markers_with_debug(
        &mut self,
        data: &[f32],
        display_start_index: usize,
        cycle_length: f32,
        estimated_frequency: f32,
        sample_rate: f32,
    ) -> (Option<usize>, Option<usize>, Option<usize>, Option<usize>, Option<usize>, Option<usize>, Option<usize>) {
        // If we don't have a valid cycle length, can't calculate phase
        if cycle_length <= 0.0 || !cycle_length.is_finite() {
            return (None, None, None, None, None, None, None);
        }
        
        // Extract the 4-cycle segment for zero-cross detection
        let segment_length = (cycle_length * CYCLES_TO_STORE as f32).floor() as usize;
        let segment_end = (display_start_index + segment_length).min(data.len());
        
        if display_start_index >= segment_end {
            return (None, None, None, None, None, None, None);
        }
        
        let segment = &data[display_start_index..segment_end];
        
        // Capture history before calling find_phase_zero_in_segment
        let history_before = self.zero_cross_detector.get_history_zero_cross_index();
        
        // Calculate 1% tolerance for debugging
        let tolerance = ((cycle_length * 0.01) as usize).max(1);
        
        // Use the new find_phase_zero_in_segment method which properly handles coordinate conversion
        // This respects the dropdown selection (Hysteresis, Peak+History 1%, etc.)
        let phase_zero_segment_relative = match self.zero_cross_detector.find_phase_zero_in_segment(
            segment,
            display_start_index,  // Pass absolute position of segment start
            cycle_length,
        ) {
            Some(idx) => idx,
            None => return (None, None, None, None, history_before, history_before, Some(tolerance)),
        };
        
        // Convert it to absolute index in the full data buffer
        let phase_zero = display_start_index + phase_zero_segment_relative;
        
        // Log debug information
        web_sys::console::log_1(&format!(
            "Phase Debug: segment_rel={}, history={:?}, tolerance={}, abs={}, display_start={}",
            phase_zero_segment_relative, history_before, tolerance, phase_zero, display_start_index
        ).into());
        
        // Phase 2π is one cycle after phase 0
        let phase_2pi_idx = phase_zero + cycle_length as usize;
        
        // Phase -π/4 is 1/8 cycle before phase 0 (π/4 = 1/8 of 2π)
        let eighth_cycle = (cycle_length / 8.0) as usize;
        
        // Check if phase_zero is large enough to subtract eighth_cycle
        let phase_minus_quarter_pi = if phase_zero >= eighth_cycle {
            Some(phase_zero - eighth_cycle)
        } else {
            None
        };
        
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
            Some(phase_zero),
            phase_2pi,
            phase_minus_quarter_pi,
            phase_2pi_plus_quarter_pi,
            Some(phase_zero_segment_relative),
            history_before,
            Some(tolerance),
        )
    }
    
    /// Find the peak (maximum positive amplitude) in the specified range
    /// Returns None if no peak with positive amplitude (> 0.0) is found in the range
    fn find_peak_in_range(
        &self,
        data: &[f32],
        start_index: usize,
        end_index: usize,
    ) -> Option<usize> {
        // Validate indices
        if start_index >= data.len() || end_index <= start_index {
            return None;
        }
        
        let end = end_index.min(data.len());
        
        let mut peak_index = start_index;
        let mut peak_value = data[start_index];
        
        for i in start_index + 1..end {
            if data[i] > peak_value {
                peak_value = data[i];
                peak_index = i;
            }
        }
        
        // Ensure the peak is positive
        if peak_value > 0.0 {
            Some(peak_index)
        } else {
            None
        }
    }
    
    /// Find zero crossing by looking backward from peak
    /// Zero crossing is defined as: before going back >= 0, after going back < 0
    /// Returns the "before going back" position
    fn find_zero_crossing_backward_from_peak(
        &self,
        data: &[f32],
        peak_index: usize,
    ) -> Option<usize> {
        // Need at least one sample before peak to look backward
        if peak_index == 0 {
            return None;
        }
        
        // Look backward from peak
        // We start from peak_index - 1 and go backward to index 1
        // (index 0 cannot be a zero crossing because there's no sample before it)
        for i in (1..peak_index).rev() {
            // Check if this is a zero crossing point
            // data[i] >= 0.0 (before going back)
            // data[i-1] < 0.0 (after going back one step)
            if data[i] >= 0.0 && data[i - 1] < 0.0 {
                return Some(i);  // Return the "before going back" position
            }
        }
        
        None
    }
}
