/// CQT (Constant-Q Transform) method for frequency estimation

use crate::frequency_estimation::dsp_utils;

/// Estimate frequency using CQT method
/// Provides better frequency resolution at low frequencies
pub fn estimate_frequency_cqt(
    data: &[f32],
    sample_rate: f32,
    is_signal_above_noise_gate: bool,
    min_frequency_hz: f32,
    max_frequency_hz: f32,
    fft_magnitude_threshold: u8,
) -> f32 {
    if !is_signal_above_noise_gate {
        return 0.0;
    }
    
    // CQT parameters: logarithmically spaced frequency bins
    const BINS_PER_OCTAVE: usize = 12; // 12 bins per octave (one per semitone)
    let min_freq = min_frequency_hz;
    let max_freq = max_frequency_hz;
    
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
        let magnitude = dsp_utils::goertzel_magnitude(data, center_freq, sample_rate, window_length);
        
        if magnitude > max_magnitude {
            max_magnitude = magnitude;
            peak_frequency = center_freq;
        }
    }
    
    // Apply threshold
    let threshold = fft_magnitude_threshold as f32 / 255.0;
    if max_magnitude < threshold {
        return 0.0;
    }
    
    peak_frequency
}
