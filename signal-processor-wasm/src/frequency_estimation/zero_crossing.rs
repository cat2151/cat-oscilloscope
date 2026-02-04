/// Zero-crossing method for frequency estimation

/// Estimate frequency using zero-crossing method
pub fn estimate_frequency_zero_crossing(
    data: &[f32],
    sample_rate: f32,
    min_frequency_hz: f32,
    max_frequency_hz: f32,
) -> f32 {
    let mut zero_cross_count = 0;
    
    for i in 0..data.len() - 1 {
        if data[i] < 0.0 && data[i + 1] > 0.0 {
            zero_cross_count += 1;
        }
    }
    
    let duration = data.len() as f32 / sample_rate;
    let frequency = zero_cross_count as f32 / duration;
    
    if frequency >= min_frequency_hz && frequency <= max_frequency_hz {
        frequency
    } else {
        0.0
    }
}
