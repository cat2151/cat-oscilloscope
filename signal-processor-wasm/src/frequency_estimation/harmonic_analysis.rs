/// Harmonic analysis utilities for frequency estimation
/// Includes functions for calculating harmonic strengths, richness, and weighted scores

/// Calculate harmonic strengths for a fundamental frequency
/// Returns a vector of magnitudes for harmonics 1x through 5x
pub fn calculate_harmonic_strengths(
    fundamental_freq: f32,
    frequency_data: &[u8],
    sample_rate: f32,
    fft_size: usize,
) -> Vec<f32> {
    let bin_frequency = sample_rate / fft_size as f32;
    let mut harmonics = Vec::new();
    
    for harmonic_num in 1..=5 {
        let target_freq = fundamental_freq * harmonic_num as f32;
        let target_bin = (target_freq / bin_frequency).round() as usize;
        
        if target_bin < frequency_data.len() {
            harmonics.push(frequency_data[target_bin] as f32);
        } else {
            harmonics.push(0.0);
        }
    }
    
    harmonics
}

/// Calculate normalized harmonic strengths for two candidates
/// Returns (normalized_candidate1, normalized_candidate2) where values are 0.0-1.0
/// 1.0 represents the strongest peak among all harmonics (1x-5x) of both candidates
pub fn calculate_normalized_harmonics(
    candidate1_freq: f32,
    candidate2_freq: f32,
    frequency_data: &[u8],
    sample_rate: f32,
    fft_size: usize,
) -> (Vec<f32>, Vec<f32>) {
    // Get raw harmonic strengths for both candidates
    let candidate1_raw = calculate_harmonic_strengths(
        candidate1_freq,
        frequency_data,
        sample_rate,
        fft_size,
    );
    let candidate2_raw = calculate_harmonic_strengths(
        candidate2_freq,
        frequency_data,
        sample_rate,
        fft_size,
    );
    
    // Find maximum magnitude across all harmonics of both candidates
    let max_magnitude = candidate1_raw.iter()
        .chain(candidate2_raw.iter())
        .fold(0.0f32, |max, &val| max.max(val));
    
    // Normalize: if max is 0, return zeros; otherwise divide by max
    let normalize = |harmonics: &[f32]| -> Vec<f32> {
        if max_magnitude > 0.0 {
            harmonics.iter().map(|&v| v / max_magnitude).collect()
        } else {
            vec![0.0; harmonics.len()]
        }
    };
    
    (normalize(&candidate1_raw), normalize(&candidate2_raw))
}

/// Calculate harmonic richness score for a given frequency
/// Returns the number of strong harmonics (magnitude > threshold)
/// 
/// This function counts how many harmonics have significant energy,
/// which helps identify the true fundamental frequency.
/// A frequency with more strong harmonics is more likely to be the fundamental.
pub fn calculate_harmonic_richness(
    fundamental_freq: f32,
    frequency_data: &[u8],
    sample_rate: f32,
    fft_size: usize,
) -> usize {
    // Threshold of 5.0 (out of 255 max FFT magnitude) represents approximately 2% of max
    // This is lenient enough to catch weak but real harmonics while filtering out noise
    const HARMONIC_STRENGTH_THRESHOLD: f32 = 5.0;
    let harmonics = calculate_harmonic_strengths(
        fundamental_freq,
        frequency_data,
        sample_rate,
        fft_size,
    );
    
    harmonics.iter().filter(|&&h| h > HARMONIC_STRENGTH_THRESHOLD).count()
}

/// Calculate weighted harmonic richness score for a given frequency
/// Returns a weighted score that prioritizes lower harmonics (1x, 2x, 3x)
/// 
/// Weights:
/// - 1x (fundamental): 3.0
/// - 2x (second harmonic): 3.0
/// - 3x (third harmonic): 2.0
/// - 4x (fourth harmonic): 1.0
/// - 5x (fifth harmonic): 1.0
/// 
/// This weighting scheme ensures that candidates with strong low-order harmonics
/// are preferred, as these are more indicative of a true fundamental frequency.
/// 
/// The score is calculated by multiplying each harmonic's peak magnitude by its weight,
/// without any threshold filtering. This ensures that actual peak strengths are considered.
/// Previously, threshold filtering could exclude important fundamental frequencies with
/// moderate peak values, causing the algorithm to incorrectly select harmonics instead.
pub fn calculate_weighted_harmonic_richness(
    fundamental_freq: f32,
    frequency_data: &[u8],
    sample_rate: f32,
    fft_size: usize,
) -> f32 {
    // Weights for each harmonic (1x through 5x)
    // Higher weights for lower harmonics (more important for fundamental detection)
    const HARMONIC_WEIGHTS: [f32; 5] = [3.0, 3.0, 2.0, 1.0, 1.0];
    
    let harmonics = calculate_harmonic_strengths(
        fundamental_freq,
        frequency_data,
        sample_rate,
        fft_size,
    );
    
    // Calculate weighted score: sum of (weight * peak_magnitude) for all harmonics
    // No threshold filtering - all peak values are considered
    harmonics.iter()
        .enumerate()
        .map(|(idx, &strength)| HARMONIC_WEIGHTS[idx] * strength)
        .sum()
}

/// Get the magnitude at a specific frequency
pub fn get_magnitude_at_frequency(
    freq: f32,
    frequency_data: &[u8],
    sample_rate: f32,
    fft_size: usize,
) -> f32 {
    let bin_frequency = sample_rate / fft_size as f32;
    let target_bin = (freq / bin_frequency).round() as usize;
    
    if target_bin < frequency_data.len() {
        frequency_data[target_bin] as f32
    } else {
        0.0
    }
}
