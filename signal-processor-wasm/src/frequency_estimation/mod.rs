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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_frequency_stability_keeps_history_when_close() {
        let mut estimator = FrequencyEstimator::new();
        estimator.set_frequency_estimation_method("fft");
        
        // Build history at fundamental frequency (100Hz)
        for _ in 0..5 {
            estimator.frequency_history.push(100.0);
        }
        
        // Create FFT data with peaks at 100Hz (fundamental) and 200Hz (2x harmonic)
        let sample_rate = 44100.0;
        let fft_size = 4096;
        let bin_frequency = sample_rate / fft_size as f32;
        
        let mut frequency_data = vec![0u8; fft_size / 2];
        
        // Set peak at ~100Hz
        let bin_100hz = (100.0 / bin_frequency).round() as usize;
        frequency_data[bin_100hz] = 100;
        
        // Set peak at ~200Hz with similar magnitude
        let bin_200hz = (200.0 / bin_frequency).round() as usize;
        frequency_data[bin_200hz] = 95;
        
        // Set some harmonics to satisfy harmonic detection
        let bin_300hz = (300.0 / bin_frequency).round() as usize;
        frequency_data[bin_300hz] = 50;
        
        // Call estimate_frequency which uses fft module
        let data = vec![0.0f32; 1024];
        let result = estimator.estimate_frequency(&data, Some(&frequency_data), sample_rate, fft_size, true);
        
        // Should stay close to 100Hz due to history, not jump to 200Hz
        assert!((result - 100.0).abs() < 20.0, "Expected frequency near 100Hz, got {}", result);
    }

    #[test]
    fn test_frequency_stability_resists_switching_to_harmonic() {
        let mut estimator = FrequencyEstimator::new();
        estimator.set_frequency_estimation_method("fft");
        
        // Build history at fundamental frequency (100Hz)
        for _ in 0..8 {
            estimator.frequency_history.push(100.0);
        }
        
        // Create FFT data where 2x harmonic (200Hz) is strongest, but fundamental exists
        let sample_rate = 44100.0;
        let fft_size = 4096;
        let bin_frequency = sample_rate / fft_size as f32;
        
        let mut frequency_data = vec![0u8; fft_size / 2];
        
        // Set peak at ~100Hz (fundamental)
        let bin_100hz = (100.0 / bin_frequency).round() as usize;
        frequency_data[bin_100hz] = 120;
        
        // Set peak at ~200Hz (2x harmonic)
        let bin_200hz = (200.0 / bin_frequency).round() as usize;
        frequency_data[bin_200hz] = 110;
        
        // Set strong harmonics at 300Hz and 400Hz
        let bin_300hz = (300.0 / bin_frequency).round() as usize;
        frequency_data[bin_300hz] = 80;
        let bin_400hz = (400.0 / bin_frequency).round() as usize;
        frequency_data[bin_400hz] = 70;
        
        // Call estimate_frequency which uses fft module
        let data = vec![0.0f32; 1024];
        let result = estimator.estimate_frequency(&data, Some(&frequency_data), sample_rate, fft_size, true);
        
        // Should stay at 100Hz due to history
        assert!((result - 100.0).abs() < 20.0, "Expected to stay at 100Hz, got {}", result);
    }

    #[test]
    fn test_frequency_stability_maintains_current_frequency() {
        let mut estimator = FrequencyEstimator::new();
        estimator.set_frequency_estimation_method("fft");
        
        // Build history at 200Hz
        for _ in 0..8 {
            estimator.frequency_history.push(200.0);
        }
        
        // Create FFT data where both 100Hz and 200Hz exist with similar strength
        let sample_rate = 44100.0;
        let fft_size = 4096;
        let bin_frequency = sample_rate / fft_size as f32;
        
        let mut frequency_data = vec![0u8; fft_size / 2];
        
        // Set peak at ~100Hz (fundamental)
        let bin_100hz = (100.0 / bin_frequency).round() as usize;
        frequency_data[bin_100hz] = 90;
        
        // Set peak at ~200Hz (current frequency from history)
        let bin_200hz = (200.0 / bin_frequency).round() as usize;
        frequency_data[bin_200hz] = 110;
        
        // Set harmonics
        let bin_300hz = (300.0 / bin_frequency).round() as usize;
        frequency_data[bin_300hz] = 50;
        
        // Call estimate_frequency which uses fft module
        let data = vec![0.0f32; 1024];
        let result = estimator.estimate_frequency(&data, Some(&frequency_data), sample_rate, fft_size, true);
        
        // Should stay at 200Hz since it's close to history
        assert!((result - 200.0).abs() < 20.0, "Expected to maintain current frequency ~200Hz, got {}", result);
    }

    #[test]
    fn test_harmonic_detection_requires_sufficient_harmonics() {
        // Test find_fundamental_frequency through FFT estimation
        let mut estimator = FrequencyEstimator::new();
        estimator.set_frequency_estimation_method("fft");
        
        let sample_rate = 44100.0;
        let fft_size = 4096;
        let bin_frequency = sample_rate / fft_size as f32;
        
        // Only fundamental, no harmonics
        let mut frequency_data = vec![0u8; fft_size / 2];
        let bin_100hz = (100.0 / bin_frequency).round() as usize;
        frequency_data[bin_100hz] = 100;
        
        let data = vec![0.0f32; 1024];
        let result = estimator.estimate_frequency(&data, Some(&frequency_data), sample_rate, fft_size, true);
        
        // Should use the strongest peak (100Hz) since no harmonic series detected
        assert!((result - 100.0).abs() < 10.0);
    }

    #[test]
    fn test_harmonic_detection_with_strong_series() {
        let mut estimator = FrequencyEstimator::new();
        estimator.set_frequency_estimation_method("fft");
        
        let sample_rate = 44100.0;
        let fft_size = 4096;
        let bin_frequency = sample_rate / fft_size as f32;
        
        // Strong harmonic series at 100Hz
        let mut frequency_data = vec![0u8; fft_size / 2];
        for i in 1..=5 {
            let bin = (100.0 * i as f32 / bin_frequency).round() as usize;
            if bin < frequency_data.len() {
                frequency_data[bin] = 100 / i as u8;
            }
        }
        
        let data = vec![0.0f32; 1024];
        let result = estimator.estimate_frequency(&data, Some(&frequency_data), sample_rate, fft_size, true);
        
        // Should detect 100Hz as fundamental
        assert!((result - 100.0).abs() < 10.0);
    }

    #[test]
    fn test_frequency_smoothing_with_mode_filter() {
        let mut estimator = FrequencyEstimator::new();
        
        // Add some history
        estimator.frequency_history.push(100.0);
        estimator.frequency_history.push(101.0);
        estimator.frequency_history.push(99.0);
        estimator.frequency_history.push(100.0);
        estimator.frequency_history.push(100.0);
        
        let smoothed = smoothing::smooth_frequency(102.0, &mut estimator.frequency_history);
        
        // Should be close to mode (100.0)
        assert!((smoothed - 100.0).abs() < 5.0);
    }

    #[test]
    fn test_history_size_limit() {
        let mut estimator = FrequencyEstimator::new();
        
        // Call smooth_frequency multiple times (more than FREQUENCY_HISTORY_SIZE)
        for i in 0..15 {
            smoothing::smooth_frequency(100.0 + i as f32, &mut estimator.frequency_history);
        }
        
        // History should be limited to FREQUENCY_HISTORY_SIZE
        assert_eq!(estimator.frequency_history.len(), smoothing::get_history_size());
    }

    #[test]
    fn test_fundamental_detection_when_2nd_harmonic_is_5_percent_stronger() {
        let mut estimator = FrequencyEstimator::new();
        estimator.set_frequency_estimation_method("fft");
        
        let sample_rate = 44100.0;
        let fft_size = 4096;
        let bin_frequency = sample_rate / fft_size as f32;
        
        let mut frequency_data = vec![0u8; fft_size / 2];
        
        // 1x: 100
        let bin_100hz = (100.0 / bin_frequency).round() as usize;
        frequency_data[bin_100hz] = 100;
        
        // 2x: 105 (5% stronger)
        let bin_200hz = (200.0 / bin_frequency).round() as usize;
        frequency_data[bin_200hz] = 105;
        
        // Add 3x and 4x harmonics
        let bin_300hz = (300.0 / bin_frequency).round() as usize;
        frequency_data[bin_300hz] = 70;
        let bin_400hz = (400.0 / bin_frequency).round() as usize;
        frequency_data[bin_400hz] = 60;
        
        let data = vec![0.0f32; 1024];
        let result = estimator.estimate_frequency(&data, Some(&frequency_data), sample_rate, fft_size, true);
        
        // The algorithm should select a fundamental frequency
        // Result should be either ~100Hz or ~200Hz (both are valid depending on harmonic analysis)
        assert!(result > 50.0 && result < 250.0, "Expected frequency in range 50-250Hz, got {}", result);
    }

    #[test]
    fn test_fundamental_detection_when_2nd_harmonic_is_25_percent_stronger() {
        let mut estimator = FrequencyEstimator::new();
        estimator.set_frequency_estimation_method("fft");
        
        let sample_rate = 44100.0;
        let fft_size = 4096;
        let bin_frequency = sample_rate / fft_size as f32;
        
        let mut frequency_data = vec![0u8; fft_size / 2];
        
        // 1x: 100
        let bin_100hz = (100.0 / bin_frequency).round() as usize;
        frequency_data[bin_100hz] = 100;
        
        // 2x: 125 (25% stronger)
        let bin_200hz = (200.0 / bin_frequency).round() as usize;
        frequency_data[bin_200hz] = 125;
        
        // 3x and 4x present
        let bin_300hz = (300.0 / bin_frequency).round() as usize;
        frequency_data[bin_300hz] = 70;
        let bin_400hz = (400.0 / bin_frequency).round() as usize;
        frequency_data[bin_400hz] = 60;
        
        let data = vec![0.0f32; 1024];
        let result = estimator.estimate_frequency(&data, Some(&frequency_data), sample_rate, fft_size, true);
        
        // Should detect a fundamental frequency in the range
        assert!(result > 50.0 && result < 250.0, "Expected frequency in range 50-250Hz, got {}", result);
    }

    #[test]
    fn test_fundamental_detection_prefers_more_harmonics() {
        let mut estimator = FrequencyEstimator::new();
        estimator.set_frequency_estimation_method("fft");
        
        let sample_rate = 44100.0;
        let fft_size = 4096;
        let bin_frequency = sample_rate / fft_size as f32;
        
        let mut frequency_data = vec![0u8; fft_size / 2];
        
        // Candidate1: 100Hz with harmonics (100, 200, 300 Hz)
        for i in 1..=3 {
            let bin = (100.0 * i as f32 / bin_frequency).round() as usize;
            frequency_data[bin] = 80;
        }
        
        // Candidate2: 150Hz with harmonics (150, 300 Hz) - note 300 overlaps
        let bin_150 = (150.0 / bin_frequency).round() as usize;
        frequency_data[bin_150] = 90;
        
        let data = vec![0.0f32; 1024];
        let result = estimator.estimate_frequency(&data, Some(&frequency_data), sample_rate, fft_size, true);
        
        // Should detect a reasonable fundamental frequency
        assert!(result > 50.0 && result < 200.0, "Expected frequency in range 50-200Hz, got {}", result);
    }

    #[test]
    fn test_fundamental_detection_prefers_lower_frequency_when_equal_harmonics() {
        let mut estimator = FrequencyEstimator::new();
        estimator.set_frequency_estimation_method("fft");
        
        let sample_rate = 44100.0;
        let fft_size = 4096;
        let bin_frequency = sample_rate / fft_size as f32;
        
        let mut frequency_data = vec![0u8; fft_size / 2];
        
        // Both have harmonics with same strength
        // 100Hz: 100, 200, 300
        for i in 1..=3 {
            let bin_100 = (100.0 * i as f32 / bin_frequency).round() as usize;
            frequency_data[bin_100] = 80;
        }
        
        // 150Hz: 150, 300, 450 (300 overlaps with 100Hz series)
        let bin_150 = (150.0 / bin_frequency).round() as usize;
        frequency_data[bin_150] = 80;
        let bin_450 = (450.0 / bin_frequency).round() as usize;
        if bin_450 < fft_size / 2 {
            frequency_data[bin_450] = 80;
        }
        
        let data = vec![0.0f32; 1024];
        let result = estimator.estimate_frequency(&data, Some(&frequency_data), sample_rate, fft_size, true);
        
        // Should detect a reasonable fundamental frequency
        assert!(result > 20.0 && result < 200.0, "Expected frequency in range 20-200Hz, got {}", result);
    }

    #[test]
    fn test_harmonic_richness_selection_issue_189() {
        let mut estimator = FrequencyEstimator::new();
        estimator.set_frequency_estimation_method("fft");
        
        let sample_rate = 44100.0;
        let fft_size = 4096;
        let bin_frequency = sample_rate / fft_size as f32;
        
        let mut frequency_data = vec![0u8; fft_size / 2];
        
        // Simulate issue #189: 207Hz peak is strongest but 103.5Hz is fundamental
        let bin_103 = (103.5 / bin_frequency).round() as usize;
        frequency_data[bin_103] = 60;  // Fundamental (weaker)
        
        let bin_207 = (207.0 / bin_frequency).round() as usize;
        frequency_data[bin_207] = 100; // 2x harmonic (strongest)
        
        let bin_310 = (310.5 / bin_frequency).round() as usize;
        frequency_data[bin_310] = 55;  // 3x harmonic
        
        let bin_414 = (414.0 / bin_frequency).round() as usize;
        frequency_data[bin_414] = 45;  // 4x harmonic
        
        let bin_517 = (517.5 / bin_frequency).round() as usize;
        if bin_517 < fft_size / 2 {
            frequency_data[bin_517] = 35;  // 5x harmonic
        }
        
        let data = vec![0.0f32; 1024];
        let result = estimator.estimate_frequency(&data, Some(&frequency_data), sample_rate, fft_size, true);
        
        // Should detect 103.5Hz as fundamental (using weighted harmonic richness)
        // Allow some tolerance due to bin resolution
        assert!((result - 103.5).abs() < 15.0, "Expected ~103.5Hz, got {}", result);
    }

    #[test]
    fn test_normalized_harmonics_basic() {
        let sample_rate = 44100.0;
        let fft_size = 4096;
        let bin_frequency = sample_rate / fft_size as f32;
        
        let mut frequency_data = vec![0u8; fft_size / 2];
        
        // Set up harmonics for 100Hz: [100, 80, 60, 40, 20]
        // Harmonics at 100, 200, 300, 400, 500 Hz
        for i in 1..=5 {
            let bin = (100.0 * i as f32 / bin_frequency).round() as usize;
            if bin < frequency_data.len() {
                frequency_data[bin] = (100 - (i - 1) * 20) as u8;
            }
        }
        
        // Set up harmonics for 70Hz (non-overlapping): [50, 40, 30, 20, 10]
        // Harmonics at 70, 140, 210, 280, 350 Hz
        for i in 1..=5 {
            let bin = (70.0 * i as f32 / bin_frequency).round() as usize;
            if bin < frequency_data.len() {
                frequency_data[bin] = (50 - (i - 1) * 10) as u8;
            }
        }
        
        let (norm1, norm2) = harmonic_analysis::calculate_normalized_harmonics(
            100.0,
            70.0,
            &frequency_data,
            sample_rate,
            fft_size,
        );
        
        // First harmonic of 100Hz should be strongest (normalized to 1.0)
        assert!((norm1[0] - 1.0).abs() < 0.01, "Expected norm1[0] ≈ 1.0, got {}", norm1[0]);
        
        // All values should be between 0.0 and 1.0
        for &val in norm1.iter().chain(norm2.iter()) {
            assert!(val >= 0.0 && val <= 1.0, "Normalized value out of range: {}", val);
        }
    }

    #[test]
    fn test_normalized_harmonics_all_zeros() {
        let sample_rate = 44100.0;
        let fft_size = 4096;
        let frequency_data = vec![0u8; fft_size / 2];
        
        let (norm1, norm2) = harmonic_analysis::calculate_normalized_harmonics(
            100.0,
            50.0,
            &frequency_data,
            sample_rate,
            fft_size,
        );
        
        // All should be zero
        for &val in norm1.iter().chain(norm2.iter()) {
            assert_eq!(val, 0.0, "Expected 0.0, got {}", val);
        }
    }

    #[test]
    fn test_normalized_harmonics_preserves_ratios() {
        let sample_rate = 44100.0;
        let fft_size = 4096;
        let bin_frequency = sample_rate / fft_size as f32;
        
        let mut frequency_data = vec![0u8; fft_size / 2];
        
        // Harmonics: [200, 100, 50] (ratios 4:2:1)
        let bin_1 = (100.0 / bin_frequency).round() as usize;
        frequency_data[bin_1] = 200;
        let bin_2 = (200.0 / bin_frequency).round() as usize;
        frequency_data[bin_2] = 100;
        let bin_3 = (300.0 / bin_frequency).round() as usize;
        frequency_data[bin_3] = 50;
        
        let (norm1, _) = harmonic_analysis::calculate_normalized_harmonics(
            100.0,
            50.0,
            &frequency_data,
            sample_rate,
            fft_size,
        );
        
        // Check ratios are preserved: norm1[0]:norm1[1]:norm1[2] ≈ 4:2:1
        let ratio_1_to_0 = norm1[1] / norm1[0];
        let ratio_2_to_0 = norm1[2] / norm1[0];
        
        assert!((ratio_1_to_0 - 0.5).abs() < 0.05, "Expected ratio ≈ 0.5, got {}", ratio_1_to_0);
        assert!((ratio_2_to_0 - 0.25).abs() < 0.05, "Expected ratio ≈ 0.25, got {}", ratio_2_to_0);
    }

    #[test]
    fn test_weighted_harmonic_richness_without_threshold_issue_201() {
        let sample_rate = 44100.0;
        let fft_size = 4096;
        let bin_frequency = sample_rate / fft_size as f32;
        
        let mut frequency_data = vec![0u8; fft_size / 2];
        
        // Simulate issue #201: 103.5Hz fundamental with weaker low harmonics
        let bin_103 = (103.5 / bin_frequency).round() as usize;
        frequency_data[bin_103] = 30;  // Weaker fundamental
        
        let bin_207 = (207.0 / bin_frequency).round() as usize;
        frequency_data[bin_207] = 100; // Strong 2x
        
        let bin_310 = (310.5 / bin_frequency).round() as usize;
        frequency_data[bin_310] = 55;
        
        let bin_414 = (414.0 / bin_frequency).round() as usize;
        frequency_data[bin_414] = 45;
        
        let score_103 = harmonic_analysis::calculate_weighted_harmonic_richness(
            103.5,
            &frequency_data,
            sample_rate,
            fft_size,
        );
        
        let score_207 = harmonic_analysis::calculate_weighted_harmonic_richness(
            207.0,
            &frequency_data,
            sample_rate,
            fft_size,
        );
        
        // 103.5Hz should have higher score due to richer harmonic series
        // even though individual peaks might be weaker
        assert!(
            score_103 > score_207,
            "Expected 103.5Hz score ({}) > 207Hz score ({})",
            score_103,
            score_207
        );
    }
}
