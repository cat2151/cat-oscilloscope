/// STFT (Short-Time Fourier Transform) method for frequency estimation

use crate::frequency_estimation::dsp_utils;

/// Estimate frequency using STFT method
/// Uses overlapping windows to improve frequency resolution for low frequencies
pub fn estimate_frequency_stft(
    data: &[f32],
    sample_rate: f32,
    is_signal_above_noise_gate: bool,
    buffer_size_multiplier: u32,
    min_frequency_hz: f32,
    max_frequency_hz: f32,
    fft_magnitude_threshold: u8,
) -> f32 {
    if !is_signal_above_noise_gate {
        return 0.0;
    }
    
    // Window size depends on buffer multiplier for better low-frequency resolution
    const MIN_WINDOW_SIZE: usize = 512;
    let desired_window_size = 2048 * buffer_size_multiplier as usize;
    let window_size = MIN_WINDOW_SIZE.max(desired_window_size.min(data.len()));
    
    // If data is too short, skip STFT analysis
    if data.len() < MIN_WINDOW_SIZE {
        return 0.0;
    }
    
    let hop_size = window_size / 2; // 50% overlap
    
    // Apply Hann window to reduce spectral leakage
    let hann_window = dsp_utils::create_hann_window(window_size);
    
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
        let frequency = dsp_utils::compute_peak_frequency_from_dft(
            &segment,
            sample_rate,
            window_size,
            min_frequency_hz,
            max_frequency_hz,
            fft_magnitude_threshold,
        );
        
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
