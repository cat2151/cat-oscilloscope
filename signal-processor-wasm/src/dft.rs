/// Compute frequency-domain (FFT-equivalent) data from time-domain data for BufferSource mode using DFT (O(n^2))
/// Returns frequency magnitude data as Vec<u8> (0-255 range) compatible with Web Audio API's AnalyserNode
pub fn compute_frequency_data(
    time_domain_data: &[f32],
    fft_size: usize,
) -> Option<Vec<u8>> {
    // Validate input (fft_size >= 2 required for Hann window and DFT bin computation)
    if time_domain_data.is_empty() || fft_size < 2 || fft_size > time_domain_data.len() {
        return None;
    }
    
    // Recommend power-of-two sizes for Web Audio AnalyserNode compatibility
    if !fft_size.is_power_of_two() {
        web_sys::console::warn_1(&format!(
            "FFT size {} is not a power of 2; Web Audio AnalyserNode.fftSize uses power-of-two values",
            fft_size
        ).into());
    }
    
    // Use the first fft_size samples
    let data = &time_domain_data[0..fft_size];
    
    // Apply Hann window to reduce spectral leakage (reuse existing helper)
    let window = crate::frequency_estimation::dsp_utils::create_hann_window(fft_size);
    let windowed_data: Vec<f32> = data.iter().zip(window.iter()).map(|(&d, &w)| d * w).collect();
    
    // Compute DFT (we only need the first half for real input)
    let num_bins = fft_size / 2;
    let mut magnitudes = vec![0.0f32; num_bins];
    
    for k in 0..num_bins {
        let mut real = 0.0f32;
        let mut imag = 0.0f32;
        let omega = 2.0 * std::f32::consts::PI * k as f32 / fft_size as f32;
        
        // Compute DFT bin
        for n in 0..fft_size {
            let angle = omega * n as f32;
            real += windowed_data[n] * angle.cos();
            imag -= windowed_data[n] * angle.sin();
        }
        
        magnitudes[k] = (real * real + imag * imag).sqrt();
    }
    
    // Normalize and convert to 0-255 range (matching Web Audio API's AnalyserNode behavior)
    // Find max magnitude for normalization
    let max_magnitude = magnitudes.iter().fold(0.0f32, |max, &val| max.max(val));
    
    let mut frequency_data = vec![0u8; num_bins];
    if max_magnitude > 0.0 {
        for i in 0..num_bins {
            // Normalize to 0-1 range, then scale to 0-255
            let normalized = magnitudes[i] / max_magnitude;
            frequency_data[i] = (normalized * 255.0).min(255.0) as u8;
        }
    }
    
    Some(frequency_data)
}
