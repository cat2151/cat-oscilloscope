/// Autocorrelation method for frequency estimation

/// Estimate frequency using autocorrelation method
pub fn estimate_frequency_autocorrelation(
    data: &[f32],
    sample_rate: f32,
    min_frequency_hz: f32,
    max_frequency_hz: f32,
) -> f32 {
    let min_period = (sample_rate / max_frequency_hz).floor() as usize;
    let max_period = (sample_rate / min_frequency_hz).floor() as usize;
    
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
