/// GainController handles automatic gain control and noise gate
pub struct GainController {
    auto_gain_enabled: bool,
    current_gain: f32,
    target_gain: f32,
    peak_decay: f32,
    previous_peak: f32,
    
    noise_gate_enabled: bool,
    noise_gate_threshold: f32,
}

impl GainController {
    const MIN_PEAK_THRESHOLD: f32 = 0.01;
    const TARGET_AMPLITUDE_RATIO: f32 = 0.8;
    const MIN_GAIN: f32 = 0.5;
    const MAX_GAIN: f32 = 99.0;
    const GAIN_SMOOTHING_FACTOR: f32 = 0.1;
    const MAX_SAMPLES_TO_CHECK: usize = 512;
    const CLIPPING_SAFETY_FACTOR: f32 = 0.95;
    
    pub fn new() -> Self {
        // Default threshold: -48dB = 10^(-48/20) ≈ 0.003981
        let default_threshold = 10f32.powf(-48.0 / 20.0);
        
        GainController {
            auto_gain_enabled: true,
            current_gain: 1.0,
            target_gain: 1.0,
            peak_decay: 0.95,
            previous_peak: 0.0,
            noise_gate_enabled: true,
            noise_gate_threshold: default_threshold,
        }
    }
    
    /// Calculate optimal gain based on waveform peak
    pub fn calculate_auto_gain(&mut self, data: &[f32], start_index: usize, end_index: usize) {
        if !self.auto_gain_enabled {
            self.target_gain = 1.0;
            return;
        }
        
        // Find the peak amplitude in the displayed range
        let mut peak = 0.0f32;
        let clamped_start = start_index.min(data.len());
        let clamped_end = end_index.min(data.len());
        let range_length = clamped_end.saturating_sub(clamped_start);
        
        if range_length > 0 {
            let stride = (range_length / Self::MAX_SAMPLES_TO_CHECK).max(1);
            
            for i in (clamped_start..clamped_end).step_by(stride) {
                let value = data[i].abs();
                if value > peak {
                    peak = value;
                }
            }
        }
        
        // Update peak tracking with decay
        if peak >= self.previous_peak {
            self.previous_peak = peak;
        } else {
            self.previous_peak = peak.max(self.previous_peak * self.peak_decay);
            peak = self.previous_peak;
        }
        
        // Calculate target gain
        if peak > Self::MIN_PEAK_THRESHOLD {
            self.target_gain = Self::TARGET_AMPLITUDE_RATIO / peak;
            self.target_gain = self.target_gain.clamp(Self::MIN_GAIN, Self::MAX_GAIN);
        }
        
        // Check if current gain would cause clipping
        let would_clip = peak > Self::MIN_PEAK_THRESHOLD && (peak * self.current_gain) > 1.0;
        
        if would_clip {
            let ideal_gain = Self::CLIPPING_SAFETY_FACTOR / peak;
            self.current_gain = ideal_gain.clamp(Self::MIN_GAIN, Self::MAX_GAIN);
            self.target_gain = self.current_gain;
        } else {
            self.current_gain += (self.target_gain - self.current_gain) * Self::GAIN_SMOOTHING_FACTOR;
        }
    }
    
    /// Check if signal passes the noise gate threshold
    pub fn is_signal_above_noise_gate(&self, data: &[f32]) -> bool {
        if !self.noise_gate_enabled {
            return true;
        }
        
        // Calculate RMS
        let sample_count = Self::MAX_SAMPLES_TO_CHECK.min(data.len());
        let stride = (data.len() / sample_count).max(1);
        
        let mut sum_squares = 0.0f32;
        let mut samples_processed = 0;
        
        for i in (0..data.len()).step_by(stride).take(sample_count) {
            sum_squares += data[i] * data[i];
            samples_processed += 1;
        }
        
        if samples_processed == 0 {
            return false;
        }
        
        let rms = (sum_squares / samples_processed as f32).sqrt();
        rms >= self.noise_gate_threshold
    }
    
    /// Apply noise gate to the signal data (modifies in place)
    pub fn apply_noise_gate(&mut self, data: &mut [f32]) {
        if !self.is_signal_above_noise_gate(data) {
            data.fill(0.0);
        }
    }
    
    // Getters and setters
    pub fn get_current_gain(&self) -> f32 {
        self.current_gain
    }
    
    pub fn set_auto_gain(&mut self, enabled: bool) {
        self.auto_gain_enabled = enabled;
        if !enabled {
            self.current_gain = 1.0;
            self.target_gain = 1.0;
            self.previous_peak = 0.0;
        }
    }
    
    pub fn set_noise_gate(&mut self, enabled: bool) {
        self.noise_gate_enabled = enabled;
    }
    
    pub fn set_noise_gate_threshold(&mut self, threshold: f32) {
        self.noise_gate_threshold = threshold.clamp(0.0, 1.0);
    }
}
