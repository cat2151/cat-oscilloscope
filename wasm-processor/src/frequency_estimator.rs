/// FrequencyEstimator handles frequency detection using various algorithms
pub struct FrequencyEstimator {
    frequency_estimation_method: String,
    estimated_frequency: f32,
    frequency_history: Vec<f32>,
    frequency_plot_history: Vec<f32>,
    buffer_size_multiplier: u32,
}

impl FrequencyEstimator {
    const MIN_FREQUENCY_HZ: f32 = 20.0;
    const MAX_FREQUENCY_HZ: f32 = 5000.0;
    const FFT_MAGNITUDE_THRESHOLD: u8 = 10;
    const FREQUENCY_HISTORY_SIZE: usize = 10; // Increased from 7 for better stability
    const FREQUENCY_GROUPING_TOLERANCE: f32 = 0.08; // Increased from 0.05 to group similar frequencies
    const FREQUENCY_PLOT_HISTORY_SIZE: usize = 100;
    
    // Harmonic detection constants
    const HARMONIC_RELATIVE_THRESHOLD: f32 = 0.4; // Increased from 0.3: Harmonics must be at least 40% of fundamental magnitude
    const MAX_HARMONICS_TO_CHECK: usize = 8; // Check up to 8x harmonic
    const MIN_HARMONICS_REQUIRED: usize = 2; // Require at least 2 harmonics to consider it a harmonic series
    const HARMONIC_FREQUENCY_TOLERANCE: f32 = 0.05; // 5% tolerance for harmonic matching
    
    // Frequency stability constants for history-based smoothing
    const FREQ_HISTORY_CLOSE_THRESHOLD: f32 = 0.15; // 15% difference considered close to history
    const FREQ_HISTORY_STRONGLY_PREFER_THRESHOLD: f32 = 0.3; // 30% - strongly prefer if within this range
    const FREQ_HISTORY_PREFERENCE_RATIO: f32 = 2.0; // Only switch if new candidate is 2x closer than current
    
    pub fn new() -> Self {
        FrequencyEstimator {
            frequency_estimation_method: "autocorrelation".to_string(),
            estimated_frequency: 0.0,
            frequency_history: Vec::new(),
            frequency_plot_history: Vec::new(),
            buffer_size_multiplier: 16,
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
            "zero-crossing" => self.estimate_frequency_zero_crossing(data, sample_rate),
            "fft" => {
                if let Some(freq_data) = frequency_data {
                    self.estimate_frequency_fft(freq_data, sample_rate, fft_size, is_signal_above_noise_gate)
                } else {
                    0.0
                }
            }
            "stft" => self.estimate_frequency_stft(data, sample_rate, is_signal_above_noise_gate),
            "cqt" => self.estimate_frequency_cqt(data, sample_rate, is_signal_above_noise_gate),
            _ => self.estimate_frequency_autocorrelation(data, sample_rate), // default: autocorrelation
        };
        
        // Apply frequency smoothing
        self.estimated_frequency = self.smooth_frequency(raw_frequency);
        
        // Add to plot history
        self.frequency_plot_history.push(self.estimated_frequency);
        if self.frequency_plot_history.len() > Self::FREQUENCY_PLOT_HISTORY_SIZE {
            self.frequency_plot_history.remove(0);
        }
        
        self.estimated_frequency
    }
    
    /// Estimate frequency using zero-crossing method
    fn estimate_frequency_zero_crossing(&self, data: &[f32], sample_rate: f32) -> f32 {
        let mut zero_cross_count = 0;
        
        for i in 0..data.len() - 1 {
            if data[i] < 0.0 && data[i + 1] > 0.0 {
                zero_cross_count += 1;
            }
        }
        
        let duration = data.len() as f32 / sample_rate;
        let frequency = zero_cross_count as f32 / duration;
        
        if frequency >= Self::MIN_FREQUENCY_HZ && frequency <= Self::MAX_FREQUENCY_HZ {
            frequency
        } else {
            0.0
        }
    }
    
    /// Estimate frequency using autocorrelation method
    fn estimate_frequency_autocorrelation(&self, data: &[f32], sample_rate: f32) -> f32 {
        let min_period = (sample_rate / Self::MAX_FREQUENCY_HZ).floor() as usize;
        let max_period = (sample_rate / Self::MIN_FREQUENCY_HZ).floor() as usize;
        
        // Precompute total energy
        let total_energy: f32 = data.iter().map(|&v| v * v).sum();
        if total_energy == 0.0 {
            return 0.0;
        }
        
        let mut best_correlation = 0.0f32;
        let mut best_period = 0;
        
        // Calculate autocorrelation for different lags
        for lag in min_period..max_period.min(data.len() / 2) {
            let mut correlation = 0.0f32;
            
            for i in 0..data.len() - lag {
                correlation += data[i] * data[i + lag];
            }
            
            let normalized_correlation = correlation / total_energy;
            
            if normalized_correlation > best_correlation {
                best_correlation = normalized_correlation;
                best_period = lag;
            }
        }
        
        if best_period == 0 {
            0.0
        } else {
            sample_rate / best_period as f32
        }
    }
    
    /// Estimate frequency using FFT method with harmonic detection
    fn estimate_frequency_fft(
        &self,
        frequency_data: &[u8],
        sample_rate: f32,
        fft_size: usize,
        is_signal_above_noise_gate: bool,
    ) -> f32 {
        if !is_signal_above_noise_gate {
            return 0.0;
        }
        
        let bin_frequency = sample_rate / fft_size as f32;
        let min_bin = ((Self::MIN_FREQUENCY_HZ / bin_frequency).floor() as usize).max(1);
        let max_bin = ((Self::MAX_FREQUENCY_HZ / bin_frequency).ceil() as usize).min(frequency_data.len());
        
        // Find all significant peaks
        let mut peaks = self.find_peaks(frequency_data, min_bin, max_bin, bin_frequency);
        
        if peaks.is_empty() {
            return 0.0;
        }
        
        // Sort peaks by magnitude (descending)
        peaks.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
        
        // Get the strongest peak
        let strongest_peak_freq = peaks[0].0;
        let strongest_peak_magnitude = peaks[0].1;
        
        // Try to find if this is part of a harmonic series
        let fundamental_candidate = self.find_fundamental_frequency(&peaks, strongest_peak_magnitude);
        
        // Use frequency history for stability if available
        if let Some(candidate) = fundamental_candidate {
            // If we have history, use it to provide stability
            if !self.frequency_history.is_empty() {
                let last_freq = self.frequency_history.last().unwrap();
                if *last_freq > 0.0 {
                    // Calculate relative difference from history
                    let candidate_diff = (candidate - last_freq).abs() / last_freq;
                    let strongest_diff = (strongest_peak_freq - last_freq).abs() / last_freq;
                    
                    // Strategy: Prefer stability over switching between harmonics
                    // Case 1: If strongest peak is very close to history, keep it
                    if strongest_diff < Self::FREQ_HISTORY_CLOSE_THRESHOLD {
                        return strongest_peak_freq;
                    }
                    
                    // Case 2: If candidate is very close to history, keep it
                    if candidate_diff < Self::FREQ_HISTORY_CLOSE_THRESHOLD {
                        return candidate;
                    }
                    
                    // Case 3: If both are far from history, only switch if candidate is significantly closer
                    // This prevents rapid oscillation between 1x and 2x harmonics.
                    // Note: `FREQ_HISTORY_PREFERENCE_RATIO` (e.g. 2.0) means the candidate must be at least
                    // that factor closer to history than the strongest peak before we switch.
                    // For example, with ratio 2.0, if strongest_diff is 0.4, candidate_diff must be < 0.2.
                    if strongest_diff > Self::FREQ_HISTORY_STRONGLY_PREFER_THRESHOLD &&
                       candidate_diff * Self::FREQ_HISTORY_PREFERENCE_RATIO < strongest_diff {
                        return candidate;
                    }
                    
                    // Case 4: Default to strongest peak (maintains current frequency)
                    return strongest_peak_freq;
                }
            }
            
            // No history or not conclusive (no usable last_freq), return the fundamental candidate
            return candidate;
        }
        
        // No harmonic series detected, return strongest peak
        strongest_peak_freq
    }
    
    /// Find peaks in the frequency spectrum
    fn find_peaks(&self, frequency_data: &[u8], min_bin: usize, max_bin: usize, bin_frequency: f32) -> Vec<(f32, f32)> {
        let mut peaks = Vec::new();
        
        for bin in min_bin..max_bin {
            let magnitude = frequency_data[bin];
            
            if magnitude < Self::FFT_MAGNITUDE_THRESHOLD {
                continue;
            }
            
            // Simple peak detection: local maximum
            // Check left neighbor (if not at start) and right neighbor (if not at end)
            let is_peak = (bin == min_bin || frequency_data[bin - 1] <= magnitude) &&
                          (bin + 1 >= max_bin || frequency_data[bin + 1] <= magnitude);
            
            if is_peak {
                // Apply parabolic interpolation for better frequency resolution
                let freq = if bin > 0 && bin < frequency_data.len() - 1 {
                    let y_minus = frequency_data[bin - 1] as f32;
                    let y_peak = magnitude as f32;
                    let y_plus = frequency_data[bin + 1] as f32;
                    
                    let denominator = 2.0 * y_peak - y_minus - y_plus;
                    let threshold = (f32::EPSILON * denominator.abs().max(1.0)).max(0.01);
                    if denominator.abs() > threshold {
                        let delta = 0.5 * (y_plus - y_minus) / denominator;
                        (bin as f32 + delta) * bin_frequency
                    } else {
                        bin as f32 * bin_frequency
                    }
                } else {
                    bin as f32 * bin_frequency
                };
                
                peaks.push((freq, magnitude as f32));
            }
        }
        
        peaks
    }
    
    /// Find the fundamental frequency from a list of peaks by detecting harmonic series
    /// Returns the fundamental if a harmonic series is detected, otherwise None
    fn find_fundamental_frequency(&self, peaks: &[(f32, f32)], reference_magnitude: f32) -> Option<f32> {
        // Need at least: 1 fundamental + MIN_HARMONICS_REQUIRED harmonics
        // If MIN_HARMONICS_REQUIRED = 2, we need at least 3 peaks total:
        // one for the fundamental, and at least 2 more that are harmonics (e.g., 2*f0, 3*f0)
        if peaks.len() < Self::MIN_HARMONICS_REQUIRED + 1 {
            return None;
        }
        
        // Try each peak as a potential fundamental and track the best candidate
        let mut best_candidate: Option<(f32, usize)> = None; // (frequency, harmonic_count)
        
        for &(candidate_fundamental, magnitude) in peaks.iter() {
            // Skip if magnitude is too weak
            if magnitude < reference_magnitude * Self::HARMONIC_RELATIVE_THRESHOLD {
                continue;
            }
            
            // Count how many harmonics of this candidate are present
            let mut harmonic_count = 0;
            
            for harmonic_num in 2..=Self::MAX_HARMONICS_TO_CHECK {
                let expected_harmonic_freq = candidate_fundamental * harmonic_num as f32;
                
                // Check if this harmonic frequency exists in our peaks
                let found_harmonic = peaks.iter().any(|&(peak_freq, peak_mag)| {
                    let freq_diff = (peak_freq - expected_harmonic_freq).abs();
                    let tolerance = candidate_fundamental * Self::HARMONIC_FREQUENCY_TOLERANCE;
                    
                    // Harmonic must be within tolerance and have sufficient magnitude
                    freq_diff <= tolerance && peak_mag >= reference_magnitude * Self::HARMONIC_RELATIVE_THRESHOLD
                });
                
                if found_harmonic {
                    harmonic_count += 1;
                }
            }
            
            // If this candidate has enough harmonics, consider it
            if harmonic_count >= Self::MIN_HARMONICS_REQUIRED {
                // Update best candidate if:
                // 1. We don't have a candidate yet, OR
                // 2. This candidate has more harmonics, OR
                // 3. Same number of harmonics but lower frequency (more likely to be fundamental)
                match best_candidate {
                    None => {
                        best_candidate = Some((candidate_fundamental, harmonic_count));
                    }
                    Some((_, best_count)) => {
                        if harmonic_count > best_count || 
                           (harmonic_count == best_count && candidate_fundamental < best_candidate.unwrap().0) {
                            best_candidate = Some((candidate_fundamental, harmonic_count));
                        }
                    }
                }
            }
        }
        
        // Return the best candidate found
        best_candidate.map(|(freq, _)| freq)
    }
    
    /// Estimate frequency using STFT (Short-Time Fourier Transform) method
    /// Uses overlapping windows to improve frequency resolution for low frequencies
    fn estimate_frequency_stft(&self, data: &[f32], sample_rate: f32, is_signal_above_noise_gate: bool) -> f32 {
        if !is_signal_above_noise_gate {
            return 0.0;
        }
        
        // Window size depends on buffer multiplier for better low-frequency resolution
        const MIN_WINDOW_SIZE: usize = 512;
        let desired_window_size = 2048 * self.buffer_size_multiplier as usize;
        let window_size = MIN_WINDOW_SIZE.max(desired_window_size.min(data.len()));
        
        // If data is too short, skip STFT analysis
        if data.len() < MIN_WINDOW_SIZE {
            return 0.0;
        }
        
        let hop_size = window_size / 2; // 50% overlap
        
        // Apply Hann window to reduce spectral leakage
        let hann_window = self.create_hann_window(window_size);
        
        // Process multiple windows and collect frequency candidates
        let num_windows = ((data.len() - window_size) / hop_size) + 1;
        let mut frequency_candidates = Vec::new();
        
        for w in 0..num_windows.min(4) { // Limit to 4 windows for performance
            let start_index = w * hop_size;
            let end_index = start_index + window_size;
            
            if end_index > data.len() {
                break;
            }
            
            // Extract windowed segment
            let mut segment = vec![0.0f32; window_size];
            for i in 0..window_size {
                segment[i] = data[start_index + i] * hann_window[i];
            }
            
            // Compute peak frequency using DFT
            let frequency = self.compute_peak_frequency_from_dft(&segment, sample_rate, window_size);
            
            if frequency > 0.0 {
                frequency_candidates.push(frequency);
            }
        }
        
        // Return median frequency to reduce outliers
        if frequency_candidates.is_empty() {
            return 0.0;
        }
        
        frequency_candidates.sort_by(|a, b| a.partial_cmp(b).unwrap());
        let median_index = frequency_candidates.len() / 2;
        frequency_candidates[median_index]
    }
    
    /// Estimate frequency using CQT (Constant-Q Transform) method
    /// Provides better frequency resolution at low frequencies
    fn estimate_frequency_cqt(&self, data: &[f32], sample_rate: f32, is_signal_above_noise_gate: bool) -> f32 {
        if !is_signal_above_noise_gate {
            return 0.0;
        }
        
        // CQT parameters: logarithmically spaced frequency bins
        const BINS_PER_OCTAVE: usize = 12; // 12 bins per octave (one per semitone)
        let min_freq = Self::MIN_FREQUENCY_HZ;
        let max_freq = Self::MAX_FREQUENCY_HZ;
        
        // Calculate number of bins
        let num_octaves = (max_freq / min_freq).log2();
        let num_bins = (num_octaves * BINS_PER_OCTAVE as f32).floor() as usize;
        
        // Quality factor Q - determines filter bandwidth
        let q = 1.0 / (2.0f32.powf(1.0 / BINS_PER_OCTAVE as f32) - 1.0);
        
        // Compute CQT bins
        let mut max_magnitude = 0.0f32;
        let mut peak_frequency = 0.0f32;
        
        for k in 0..num_bins {
            // Calculate center frequency for this bin
            let center_freq = min_freq * 2.0f32.powf(k as f32 / BINS_PER_OCTAVE as f32);
            
            // Window length for this frequency
            let ideal_window_length = (q * sample_rate / center_freq).floor() as usize;
            
            // Adjust window length to available data, but skip if too short
            let min_window_length = (2.0 * sample_rate / center_freq).floor() as usize;
            if data.len() < min_window_length {
                continue;
            }
            
            let window_length = ideal_window_length.min(data.len());
            
            // Compute magnitude at this frequency using Goertzel algorithm
            let magnitude = self.goertzel_magnitude(data, center_freq, sample_rate, window_length);
            
            if magnitude > max_magnitude {
                max_magnitude = magnitude;
                peak_frequency = center_freq;
            }
        }
        
        // Apply threshold
        let threshold = Self::FFT_MAGNITUDE_THRESHOLD as f32 / 255.0;
        if max_magnitude < threshold {
            return 0.0;
        }
        
        peak_frequency
    }
    
    /// Create Hann window for STFT
    fn create_hann_window(&self, size: usize) -> Vec<f32> {
        let mut window = vec![0.0f32; size];
        for i in 0..size {
            window[i] = 0.5 * (1.0 - (2.0 * std::f32::consts::PI * i as f32 / (size - 1) as f32).cos());
        }
        window
    }
    
    /// Compute peak frequency from DFT of a windowed segment
    fn compute_peak_frequency_from_dft(&self, data: &[f32], sample_rate: f32, fft_size: usize) -> f32 {
        let bin_frequency = sample_rate / fft_size as f32;
        let min_bin = 1.max((Self::MIN_FREQUENCY_HZ / bin_frequency).floor() as usize);
        let max_bin = (fft_size / 2).min((Self::MAX_FREQUENCY_HZ / bin_frequency).ceil() as usize);
        
        let mut max_magnitude = 0.0f32;
        let mut peak_bin = 0;
        
        // Compute magnitude spectrum for frequency range of interest
        for k in min_bin..max_bin {
            let mut real = 0.0f32;
            let mut imag = 0.0f32;
            let omega = 2.0 * std::f32::consts::PI * k as f32 / fft_size as f32;
            
            // Compute DFT bin
            for n in 0..data.len() {
                let angle = omega * n as f32;
                real += data[n] * angle.cos();
                imag -= data[n] * angle.sin();
            }
            
            let magnitude = (real * real + imag * imag).sqrt();
            
            if magnitude > max_magnitude {
                max_magnitude = magnitude;
                peak_bin = k;
            }
        }
        
        // Threshold scales with buffer length
        let normalized_threshold = Self::FFT_MAGNITUDE_THRESHOLD as f32 * data.len() as f32 / 255.0;
        if max_magnitude < normalized_threshold {
            return 0.0;
        }
        
        peak_bin as f32 * bin_frequency
    }
    
    /// Goertzel algorithm for efficient single-frequency DFT
    fn goertzel_magnitude(&self, data: &[f32], target_freq: f32, sample_rate: f32, window_length: usize) -> f32 {
        let k = (0.5 + (window_length as f32 * target_freq) / sample_rate).floor() as usize;
        let omega = (2.0 * std::f32::consts::PI * k as f32) / window_length as f32;
        let coeff = 2.0 * omega.cos();
        
        let mut s_prev = 0.0f32;
        let mut s_prev2 = 0.0f32;
        
        let actual_length = window_length.min(data.len());
        
        for i in 0..actual_length {
            let s = data[i] + coeff * s_prev - s_prev2;
            s_prev2 = s_prev;
            s_prev = s;
        }
        
        // Compute magnitude
        let real = s_prev - s_prev2 * omega.cos();
        let imag = s_prev2 * omega.sin();
        
        ((real * real + imag * imag).sqrt()) / actual_length as f32
    }
    
    /// Apply frequency smoothing using mode filter
    fn smooth_frequency(&mut self, raw_frequency: f32) -> f32 {
        // Add to history
        self.frequency_history.push(raw_frequency);
        if self.frequency_history.len() > Self::FREQUENCY_HISTORY_SIZE {
            self.frequency_history.remove(0);
        }
        
        // Not enough history yet
        if self.frequency_history.len() < 3 {
            return raw_frequency;
        }
        
        // Find mode (most common value within tolerance)
        let mut best_count = 0;
        let mut best_freq = raw_frequency;
        
        for &freq in &self.frequency_history {
            if freq == 0.0 {
                continue;
            }
            
            let mut count = 0;
            let mut sum = 0.0f32;
            
            for &other_freq in &self.frequency_history {
                if other_freq == 0.0 {
                    continue;
                }
                
                let tolerance = freq * Self::FREQUENCY_GROUPING_TOLERANCE;
                if (other_freq - freq).abs() <= tolerance {
                    count += 1;
                    sum += other_freq;
                }
            }
            
            if count > best_count {
                best_count = count;
                best_freq = sum / count as f32;
            }
        }
        
        best_freq
    }
    
    // Getters and setters
    pub fn get_frequency_estimation_method(&self) -> &str {
        &self.frequency_estimation_method
    }
    
    pub fn set_frequency_estimation_method(&mut self, method: &str) {
        // Only clear histories if the method actually changes
        if self.frequency_estimation_method != method {
            self.frequency_estimation_method = method.to_string();
            // Clear histories when changing methods
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
    
    pub fn clear_history(&mut self) {
        self.frequency_history.clear();
        self.frequency_plot_history.clear();
        self.estimated_frequency = 0.0;
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
        // Both with similar magnitudes to simulate the problematic case
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
        
        // Call estimate_frequency_fft which should use history to maintain 100Hz
        let result = estimator.estimate_frequency_fft(&frequency_data, sample_rate, fft_size, true);
        
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
        // Need to set strong harmonics so harmonic detection recognizes 100Hz as fundamental
        let sample_rate = 44100.0;
        let fft_size = 4096;
        let bin_frequency = sample_rate / fft_size as f32;
        
        let mut frequency_data = vec![0u8; fft_size / 2];
        
        // Set peak at ~100Hz (fundamental) - make it strongest so it's the reference
        let bin_100hz = (100.0 / bin_frequency).round() as usize;
        frequency_data[bin_100hz] = 120;
        
        // Set peak at ~200Hz (2x harmonic)
        let bin_200hz = (200.0 / bin_frequency).round() as usize;
        frequency_data[bin_200hz] = 110;
        
        // Set strong harmonics at 300Hz and 400Hz (>= 40% of 120 = 48)
        let bin_300hz = (300.0 / bin_frequency).round() as usize;
        frequency_data[bin_300hz] = 80;
        let bin_400hz = (400.0 / bin_frequency).round() as usize;
        frequency_data[bin_400hz] = 70;
        
        // Call estimate_frequency_fft - should prefer 100Hz due to history (Case 2)
        let result = estimator.estimate_frequency_fft(&frequency_data, sample_rate, fft_size, true);
        
        // Should stay at 100Hz due to history
        assert!((result - 100.0).abs() < 20.0, "Expected to stay at 100Hz, got {}", result);
    }

    #[test]
    fn test_frequency_stability_maintains_current_frequency() {
        let mut estimator = FrequencyEstimator::new();
        estimator.set_frequency_estimation_method("fft");
        
        // Build history at 200Hz (we were on the 2x harmonic)
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
        
        // Call estimate_frequency_fft - should maintain 200Hz (Case 1)
        let result = estimator.estimate_frequency_fft(&frequency_data, sample_rate, fft_size, true);
        
        // Should stay at 200Hz since it's close to history
        assert!((result - 200.0).abs() < 20.0, "Expected to maintain current frequency ~200Hz, got {}", result);
    }

    #[test]
    fn test_harmonic_detection_requires_sufficient_harmonics() {
        let estimator = FrequencyEstimator::new();
        
        // Only fundamental, no harmonics - should not detect harmonic series
        let peaks = vec![(100.0, 100.0)];
        let result = estimator.find_fundamental_frequency(&peaks, 100.0);
        assert!(result.is_none());
        
        // Fundamental + one weak harmonic - should not detect (need MIN_HARMONICS_REQUIRED)
        let peaks = vec![
            (100.0, 100.0),
            (200.0, 30.0), // Too weak (< 40% threshold)
        ];
        let result = estimator.find_fundamental_frequency(&peaks, 100.0);
        assert!(result.is_none());
    }

    #[test]
    fn test_harmonic_detection_with_strong_series() {
        let estimator = FrequencyEstimator::new();
        
        // Fundamental + 2 strong harmonics - should detect fundamental
        let peaks = vec![
            (100.0, 100.0),
            (200.0, 80.0), // 80% of fundamental (> 40% threshold)
            (300.0, 70.0), // 70% of fundamental (> 40% threshold)
        ];
        let result = estimator.find_fundamental_frequency(&peaks, 100.0);
        assert!(result.is_some());
        assert!((result.unwrap() - 100.0).abs() < 1.0);
    }

    #[test]
    fn test_frequency_smoothing_with_mode_filter() {
        let mut estimator = FrequencyEstimator::new();
        
        // Add a series of frequencies with one outlier
        let frequencies = vec![100.0, 102.0, 101.0, 200.0, 99.0, 101.0, 100.5];
        
        for &freq in &frequencies {
            let smoothed = estimator.smooth_frequency(freq);
            // Last smoothed value should be close to mode (around 100Hz), not the outlier (200Hz)
            if freq == 100.5 {
                // After processing all frequencies, the mode should be around 100Hz
                assert!((smoothed - 100.0).abs() < 5.0, "Smoothed frequency {} should be close to 100Hz", smoothed);
            }
        }
    }

    #[test]
    fn test_history_size_limit() {
        let mut estimator = FrequencyEstimator::new();
        
        // Add more than FREQUENCY_HISTORY_SIZE entries
        for i in 0..15 {
            estimator.smooth_frequency(100.0 + i as f32);
        }
        
        // History should be limited to FREQUENCY_HISTORY_SIZE
        assert_eq!(estimator.frequency_history.len(), FrequencyEstimator::FREQUENCY_HISTORY_SIZE);
    }

    #[test]
    fn test_fundamental_detection_when_2nd_harmonic_is_5_percent_stronger() {
        let estimator = FrequencyEstimator::new();
        
        // Simulate human voice where 2nd harmonic (200Hz) is 5% stronger than fundamental (100Hz)
        // This is a common pattern in human voice
        let peaks = vec![
            (100.0, 100.0),  // Fundamental
            (200.0, 105.0),  // 2nd harmonic - 5% stronger
            (300.0, 80.0),   // 3rd harmonic
            (400.0, 60.0),   // 4th harmonic
        ];
        
        // Should detect 100Hz as fundamental, not 200Hz
        let result = estimator.find_fundamental_frequency(&peaks, 105.0);
        assert!(result.is_some(), "Should detect fundamental frequency");
        assert!((result.unwrap() - 100.0).abs() < 1.0, 
                "Expected 100Hz fundamental, got {}", result.unwrap());
    }

    #[test]
    fn test_fundamental_detection_when_2nd_harmonic_is_25_percent_stronger() {
        let estimator = FrequencyEstimator::new();
        
        // Simulate human voice where 2nd harmonic (200Hz) is 25% stronger than fundamental (100Hz)
        // This is an extreme but possible case
        let peaks = vec![
            (100.0, 100.0),  // Fundamental
            (200.0, 125.0),  // 2nd harmonic - 25% stronger
            (300.0, 90.0),   // 3rd harmonic
            (400.0, 70.0),   // 4th harmonic
        ];
        
        // Should detect 100Hz as fundamental, not 200Hz
        // Because 100Hz has more matching harmonics (200, 300, 400)
        // while 200Hz only has 400Hz as a matching harmonic (2x of 200)
        let result = estimator.find_fundamental_frequency(&peaks, 125.0);
        assert!(result.is_some(), "Should detect fundamental frequency");
        assert!((result.unwrap() - 100.0).abs() < 1.0, 
                "Expected 100Hz fundamental, got {}", result.unwrap());
    }

    #[test]
    fn test_fundamental_detection_prefers_more_harmonics() {
        let estimator = FrequencyEstimator::new();
        
        // Test that algorithm prefers candidate with more harmonics
        // 100Hz has harmonics at 200, 300, 400, 500 (4 harmonics)
        // 200Hz only has harmonic at 400 (1 harmonic)
        let peaks = vec![
            (100.0, 80.0),   // Fundamental - weaker
            (200.0, 120.0),  // 2nd harmonic of 100Hz - strongest peak
            (300.0, 70.0),   // 3rd harmonic of 100Hz
            (400.0, 60.0),   // 4th harmonic of 100Hz (also 2nd of 200Hz)
            (500.0, 50.0),   // 5th harmonic of 100Hz
        ];
        
        // Should prefer 100Hz because it has 4 harmonics, vs 200Hz with only 1 harmonic
        let result = estimator.find_fundamental_frequency(&peaks, 120.0);
        assert!(result.is_some(), "Should detect fundamental frequency");
        assert!((result.unwrap() - 100.0).abs() < 1.0, 
                "Expected 100Hz with 4 harmonics over 200Hz with 1 harmonic, got {}", result.unwrap());
    }

    #[test]
    fn test_fundamental_detection_prefers_lower_frequency_when_equal_harmonics() {
        let estimator = FrequencyEstimator::new();
        
        // Edge case: both candidates have same number of harmonics
        // Should prefer the lower frequency (more likely to be fundamental)
        let peaks = vec![
            (100.0, 80.0),   // Has harmonics at 200, 300
            (150.0, 100.0),  // Has harmonics at 300, 450
            (200.0, 70.0),   // Harmonic of 100Hz
            (300.0, 75.0),   // Harmonic of both 100Hz and 150Hz
            (450.0, 60.0),   // Harmonic of 150Hz
        ];
        
        // Both 100Hz and 150Hz have 2 harmonics, should prefer 100Hz (lower)
        let result = estimator.find_fundamental_frequency(&peaks, 100.0);
        assert!(result.is_some(), "Should detect fundamental frequency");
        assert!((result.unwrap() - 100.0).abs() < 1.0, 
                "Expected 100Hz (lower frequency with equal harmonics), got {}", result.unwrap());
    }
}
