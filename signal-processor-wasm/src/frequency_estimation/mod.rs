/// FrequencyEstimator module - Coordinates various frequency estimation methods
/// Follows the Single Responsibility Principle by delegating to specialized modules

mod autocorrelation;
mod cqt;
mod dsp_utils;
mod fft;
mod harmonic_analysis;
mod smoothing;
mod stft;
mod zero_crossing;

#[cfg(test)]
mod tests;

/// FrequencyEstimator handles frequency detection using various algorithms
pub struct FrequencyEstimator {
    frequency_estimation_method: String,
    estimated_frequency: f32,
    frequency_history: Vec<f32>,
    frequency_plot_history: Vec<f32>,
    buffer_size_multiplier: u32,
    
    // Harmonic analysis data for debugging (populated during FFT estimation)
    half_freq_peak_strength_percent: Option<f32>,
    candidate1_harmonics: Option<Vec<f32>>,
    candidate2_harmonics: Option<Vec<f32>>,
    candidate1_weighted_score: Option<f32>,
    candidate2_weighted_score: Option<f32>,
    selection_reason: Option<String>,
}

impl FrequencyEstimator {
    const MIN_FREQUENCY_HZ: f32 = 20.0;
    const MAX_FREQUENCY_HZ: f32 = 5000.0;
    const FFT_MAGNITUDE_THRESHOLD: u8 = 10;
    const FREQUENCY_PLOT_HISTORY_SIZE: usize = 100;
    
    pub fn new() -> Self {
        FrequencyEstimator {
            frequency_estimation_method: "autocorrelation".to_string(),
            estimated_frequency: 0.0,
            frequency_history: Vec::new(),
            frequency_plot_history: Vec::new(),
            buffer_size_multiplier: 16,
            half_freq_peak_strength_percent: None,
            candidate1_harmonics: None,
            candidate2_harmonics: None,
            candidate1_weighted_score: None,
            candidate2_weighted_score: None,
            selection_reason: None,
        }
    }
    
    /// Estimate frequency using the configured method
    pub fn estimate_frequency(
        &mut self,
        data: &[f32],
        frequency_data: Option<&[u8]>,
        sample_rate: f32,
        fft_size: usize,
        is_signal_above_noise_gate: bool,
    ) -> f32 {
        let raw_frequency = match self.frequency_estimation_method.as_str() {
            "zero-crossing" => zero_crossing::estimate_frequency_zero_crossing(
                data,
                sample_rate,
                Self::MIN_FREQUENCY_HZ,
                Self::MAX_FREQUENCY_HZ,
            ),
            "fft" => {
                if let Some(freq_data) = frequency_data {
                    let result = fft::estimate_frequency_fft(
                        freq_data,
                        sample_rate,
                        fft_size,
                        is_signal_above_noise_gate,
                        &self.frequency_history,
                    );
                    
                    // Store FFT debug information
                    self.half_freq_peak_strength_percent = result.half_freq_peak_strength_percent;
                    self.candidate1_harmonics = result.candidate1_harmonics;
                    self.candidate2_harmonics = result.candidate2_harmonics;
                    self.candidate1_weighted_score = result.candidate1_weighted_score;
                    self.candidate2_weighted_score = result.candidate2_weighted_score;
                    self.selection_reason = result.selection_reason;
                    
                    result.frequency
                } else {
                    0.0
                }
            }
            "stft" => stft::estimate_frequency_stft(
                data,
                sample_rate,
                is_signal_above_noise_gate,
                self.buffer_size_multiplier,
                Self::MIN_FREQUENCY_HZ,
                Self::MAX_FREQUENCY_HZ,
                Self::FFT_MAGNITUDE_THRESHOLD,
            ),
            "cqt" => cqt::estimate_frequency_cqt(
                data,
                sample_rate,
                is_signal_above_noise_gate,
                Self::MIN_FREQUENCY_HZ,
                Self::MAX_FREQUENCY_HZ,
                Self::FFT_MAGNITUDE_THRESHOLD,
            ),
            _ => autocorrelation::estimate_frequency_autocorrelation(
                data,
                sample_rate,
                Self::MIN_FREQUENCY_HZ,
                Self::MAX_FREQUENCY_HZ,
            ), // default: autocorrelation
        };
        
        // Apply frequency smoothing
        self.estimated_frequency = smoothing::smooth_frequency(raw_frequency, &mut self.frequency_history);
        
        // Add to plot history
        self.frequency_plot_history.push(self.estimated_frequency);
        if self.frequency_plot_history.len() > Self::FREQUENCY_PLOT_HISTORY_SIZE {
            self.frequency_plot_history.remove(0);
        }
        
        self.estimated_frequency
    }
    
    // Getters and setters
    pub fn get_frequency_estimation_method(&self) -> &str {
        &self.frequency_estimation_method
    }
    
    pub fn set_frequency_estimation_method(&mut self, method: &str) {
        if self.frequency_estimation_method != method {
            self.frequency_estimation_method = method.to_string();
            // Clear only frequency histories when method changes
            // (preserving harmonic analysis data which may still be useful)
            self.frequency_history.clear();
            self.frequency_plot_history.clear();
        }
    }
    
    pub fn get_max_frequency(&self) -> f32 {
        Self::MAX_FREQUENCY_HZ
    }
    
    pub fn get_min_frequency(&self) -> f32 {
        Self::MIN_FREQUENCY_HZ
    }
    
    pub fn get_frequency_plot_history(&self) -> Vec<f32> {
        self.frequency_plot_history.clone()
    }
    
    pub fn set_buffer_size_multiplier(&mut self, multiplier: u32) {
        // Validate multiplier is one of the allowed values (1, 4, or 16)
        // If invalid, keep the current value and log an error
        if multiplier == 1 || multiplier == 4 || multiplier == 16 {
            self.buffer_size_multiplier = multiplier;
        } else {
            #[cfg(target_arch = "wasm32")]
            {
                use wasm_bindgen::prelude::*;
                #[wasm_bindgen]
                extern "C" {
                    #[wasm_bindgen(js_namespace = console)]
                    fn error(s: &str);
                }
                error(&format!(
                    "Invalid buffer size multiplier {} received; keeping current value {}. Valid values are 1, 4, or 16.",
                    multiplier,
                    self.buffer_size_multiplier
                ));
            }
            #[cfg(not(target_arch = "wasm32"))]
            {
                eprintln!(
                    "Invalid buffer size multiplier {} received; keeping current value {}. Valid values are 1, 4, or 16.",
                    multiplier,
                    self.buffer_size_multiplier
                );
            }
        }
    }
    
    pub fn get_buffer_size_multiplier(&self) -> u32 {
        self.buffer_size_multiplier
    }
    
    pub fn get_half_freq_peak_strength_percent(&self) -> Option<f32> {
        self.half_freq_peak_strength_percent
    }
    
    pub fn get_candidate1_harmonics(&self) -> Option<Vec<f32>> {
        self.candidate1_harmonics.clone()
    }
    
    pub fn get_candidate2_harmonics(&self) -> Option<Vec<f32>> {
        self.candidate2_harmonics.clone()
    }
    
    pub fn get_candidate1_weighted_score(&self) -> Option<f32> {
        self.candidate1_weighted_score
    }
    
    pub fn get_candidate2_weighted_score(&self) -> Option<f32> {
        self.candidate2_weighted_score
    }
    
    pub fn get_selection_reason(&self) -> Option<String> {
        self.selection_reason.clone()
    }
    
    pub fn clear_history(&mut self) {
        self.frequency_history.clear();
        self.frequency_plot_history.clear();
        self.estimated_frequency = 0.0;
        // Clear harmonic analysis data as well
        self.half_freq_peak_strength_percent = None;
        self.candidate1_harmonics = None;
        self.candidate2_harmonics = None;
        self.candidate1_weighted_score = None;
        self.candidate2_weighted_score = None;
        self.selection_reason = None;
    }
}
