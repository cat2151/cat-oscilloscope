/// FrequencyEstimator handles frequency detection using various algorithms
pub struct FrequencyEstimator {
    frequency_estimation_method: String,
    estimated_frequency: f32,
    frequency_history: Vec<f32>,
}

impl FrequencyEstimator {
    const MIN_FREQUENCY_HZ: f32 = 50.0;
    const MAX_FREQUENCY_HZ: f32 = 5000.0;
    const FFT_MAGNITUDE_THRESHOLD: u8 = 10;
    const FREQUENCY_HISTORY_SIZE: usize = 7;
    const FREQUENCY_GROUPING_TOLERANCE: f32 = 0.05;
    
    pub fn new() -> Self {
        FrequencyEstimator {
            frequency_estimation_method: "autocorrelation".to_string(),
            estimated_frequency: 0.0,
            frequency_history: Vec::new(),
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
            _ => self.estimate_frequency_autocorrelation(data, sample_rate), // default: autocorrelation
        };
        
        // Apply frequency smoothing
        self.estimated_frequency = self.smooth_frequency(raw_frequency);
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
    
    /// Estimate frequency using FFT method
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
        
        let mut max_magnitude: u8 = 0;
        let mut peak_bin = 0;
        
        for bin in min_bin..max_bin {
            if frequency_data[bin] > max_magnitude {
                max_magnitude = frequency_data[bin];
                peak_bin = bin;
            }
        }
        
        if max_magnitude < Self::FFT_MAGNITUDE_THRESHOLD {
            return 0.0;
        }
        
        // Parabolic interpolation for better frequency resolution
        if peak_bin > 0 && peak_bin < frequency_data.len() - 1 {
            let y_minus = frequency_data[peak_bin - 1] as f32;
            let y_peak = frequency_data[peak_bin] as f32;
            let y_plus = frequency_data[peak_bin + 1] as f32;
            
            let delta = 0.5 * (y_plus - y_minus) / (2.0 * y_peak - y_minus - y_plus);
            let interpolated_bin = peak_bin as f32 + delta;
            
            interpolated_bin * bin_frequency
        } else {
            peak_bin as f32 * bin_frequency
        }
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
        self.frequency_estimation_method = method.to_string();
    }
    
    pub fn get_max_frequency(&self) -> f32 {
        Self::MAX_FREQUENCY_HZ
    }
    
    pub fn clear_history(&mut self) {
        self.frequency_history.clear();
        self.estimated_frequency = 0.0;
    }
}
