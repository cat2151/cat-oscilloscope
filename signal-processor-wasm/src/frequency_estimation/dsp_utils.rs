/// DSP utility functions for frequency estimation
/// Includes window functions, DFT computation, and Goertzel algorithm

use std::f32::consts::PI;

/// Create a Hann window of the specified size
pub fn create_hann_window(size: usize) -> Vec<f32> {
    let mut window = vec![0.0f32; size];
    for i in 0..size {
        window[i] = 0.5 * (1.0 - (2.0 * PI * i as f32 / (size - 1) as f32).cos());
    }
    window
}

/// Compute peak frequency from DFT of a windowed segment
pub fn compute_peak_frequency_from_dft(
    data: &[f32],
    sample_rate: f32,
    fft_size: usize,
    min_frequency_hz: f32,
    max_frequency_hz: f32,
    fft_magnitude_threshold: u8,
) -> f32 {
    let bin_frequency = sample_rate / fft_size as f32;
    let min_bin = 1.max((min_frequency_hz / bin_frequency).floor() as usize);
    let max_bin = (fft_size / 2).min((max_frequency_hz / bin_frequency).ceil() as usize);
    
    let mut max_magnitude = 0.0f32;
    let mut peak_bin = 0;
    
    // Compute magnitude spectrum for frequency range of interest
    for k in min_bin..max_bin {
        let mut real = 0.0f32;
        let mut imag = 0.0f32;
        let omega = 2.0 * PI * k as f32 / fft_size as f32;
        
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
    let normalized_threshold = fft_magnitude_threshold as f32 * data.len() as f32 / 255.0;
    if max_magnitude < normalized_threshold {
        return 0.0;
    }
    
    peak_bin as f32 * bin_frequency
}

/// Goertzel algorithm for efficient single-frequency DFT
pub fn goertzel_magnitude(
    data: &[f32],
    target_freq: f32,
    sample_rate: f32,
    window_length: usize,
) -> f32 {
    let k = (0.5 + (window_length as f32 * target_freq) / sample_rate).floor() as usize;
    let omega = (2.0 * PI * k as f32) / window_length as f32;
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
