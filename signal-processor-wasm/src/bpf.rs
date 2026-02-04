/// Simple IIR Band-Pass Filter implementation using biquad filter
/// 
/// This module provides a second-order IIR (Infinite Impulse Response) band-pass filter
/// using the biquad filter structure and bilinear transform.
/// 
/// The filter is designed to pass frequencies near a center frequency while
/// attenuating frequencies outside the pass band.

/// BPF filter state and coefficients
pub struct BandPassFilter {
    // Biquad coefficients
    b0: f32,
    b1: f32,
    b2: f32,
    a1: f32,
    a2: f32,
    
    // State variables (for filtering)
    x1: f32, // previous input sample
    x2: f32, // input sample before x1
    y1: f32, // previous output sample
    y2: f32, // output sample before y1
}

impl BandPassFilter {
    /// Create a new band-pass filter
    /// 
    /// # Arguments
    /// * `center_freq` - Center frequency in Hz
    /// * `sample_rate` - Sample rate in Hz
    /// * `q` - Quality factor (bandwidth = center_freq / Q). Higher Q = narrower bandwidth
    pub fn new(center_freq: f32, sample_rate: f32, q: f32) -> Self {
        // Calculate normalized frequency
        let omega = 2.0 * std::f32::consts::PI * center_freq / sample_rate;
        let sin_omega = omega.sin();
        let cos_omega = omega.cos();
        let alpha = sin_omega / (2.0 * q);
        
        // Calculate biquad coefficients for band-pass filter
        let b0 = alpha;
        let b1 = 0.0;
        let b2 = -alpha;
        let a0 = 1.0 + alpha;
        let a1 = -2.0 * cos_omega;
        let a2 = 1.0 - alpha;
        
        // Normalize by a0
        Self {
            b0: b0 / a0,
            b1: b1 / a0,
            b2: b2 / a0,
            a1: a1 / a0,
            a2: a2 / a0,
            x1: 0.0,
            x2: 0.0,
            y1: 0.0,
            y2: 0.0,
        }
    }
    
    /// Process a single sample
    fn process_sample(&mut self, input: f32) -> f32 {
        // Biquad direct form II transposed
        let output = self.b0 * input + self.b1 * self.x1 + self.b2 * self.x2
                   - self.a1 * self.y1 - self.a2 * self.y2;
        
        // Update state
        self.x2 = self.x1;
        self.x1 = input;
        self.y2 = self.y1;
        self.y1 = output;
        
        output
    }
    
    /// Filter a buffer of samples
    /// 
    /// # Arguments
    /// * `input` - Input buffer
    /// 
    /// # Returns
    /// Filtered output buffer
    pub fn filter(&mut self, input: &[f32]) -> Vec<f32> {
        input.iter().map(|&sample| self.process_sample(sample)).collect()
    }
    
    /// Reset filter state (clear history)
    pub fn reset(&mut self) {
        self.x1 = 0.0;
        self.x2 = 0.0;
        self.y1 = 0.0;
        self.y2 = 0.0;
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_bpf_creation() {
        let filter = BandPassFilter::new(440.0, 44100.0, 1.0);
        assert!(filter.b0.is_finite());
        assert!(filter.a1.is_finite());
    }
    
    #[test]
    fn test_bpf_processing() {
        let mut filter = BandPassFilter::new(440.0, 44100.0, 1.0);
        let input = vec![0.0, 1.0, 0.0, -1.0, 0.0];
        let output = filter.filter(&input);
        
        assert_eq!(output.len(), input.len());
        // Output should be finite
        for &val in &output {
            assert!(val.is_finite());
        }
    }
    
    #[test]
    fn test_bpf_reset() {
        let mut filter = BandPassFilter::new(440.0, 44100.0, 1.0);
        let input = vec![1.0, 1.0, 1.0];
        
        // Process some samples
        filter.filter(&input);
        
        // Reset
        filter.reset();
        
        // State should be cleared
        assert_eq!(filter.x1, 0.0);
        assert_eq!(filter.y1, 0.0);
    }
}
