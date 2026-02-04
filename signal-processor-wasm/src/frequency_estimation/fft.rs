/// FFT method for frequency estimation with harmonic detection

use crate::frequency_estimation::harmonic_analysis;

// Constants for FFT-based frequency estimation
pub const MIN_FREQUENCY_HZ: f32 = 20.0;
pub const MAX_FREQUENCY_HZ: f32 = 5000.0;
pub const FFT_MAGNITUDE_THRESHOLD: u8 = 10;
pub const HARMONIC_RELATIVE_THRESHOLD: f32 = 0.4;
pub const MAX_HARMONICS_TO_CHECK: usize = 8;
pub const MIN_HARMONICS_REQUIRED: usize = 2;
pub const HARMONIC_FREQUENCY_TOLERANCE: f32 = 0.05;

/// Result of FFT estimation including debug information
pub struct FftEstimationResult {
    pub frequency: f32,
    pub half_freq_peak_strength_percent: Option<f32>,
    pub candidate1_harmonics: Option<Vec<f32>>,
    pub candidate2_harmonics: Option<Vec<f32>>,
    pub candidate1_weighted_score: Option<f32>,
    pub candidate2_weighted_score: Option<f32>,
    pub selection_reason: Option<String>,
}

/// Estimate frequency using FFT method with harmonic detection
pub fn estimate_frequency_fft(
    frequency_data: &[u8],
    sample_rate: f32,
    fft_size: usize,
    is_signal_above_noise_gate: bool,
    frequency_history: &[f32],
) -> FftEstimationResult {
    let mut result = FftEstimationResult {
        frequency: 0.0,
        half_freq_peak_strength_percent: None,
        candidate1_harmonics: None,
        candidate2_harmonics: None,
        candidate1_weighted_score: None,
        candidate2_weighted_score: None,
        selection_reason: None,
    };
    
    if !is_signal_above_noise_gate {
        return result;
    }
    
    let bin_frequency = sample_rate / fft_size as f32;
    let min_bin = ((MIN_FREQUENCY_HZ / bin_frequency).floor() as usize).max(1);
    let max_bin = ((MAX_FREQUENCY_HZ / bin_frequency).ceil() as usize).min(frequency_data.len());
    
    // Find all significant peaks
    let mut peaks = find_peaks(frequency_data, min_bin, max_bin, bin_frequency);
    
    if peaks.is_empty() {
        return result;
    }
    
    // Sort peaks by magnitude (descending)
    peaks.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
    
    // Get the strongest peak
    let strongest_peak_freq = peaks[0].0;
    let strongest_peak_magnitude = peaks[0].1;
    
    // Try to find if this is part of a harmonic series
    let fundamental_candidate = find_fundamental_frequency(&peaks, strongest_peak_magnitude);
    
    // Always compare weighted harmonic richness between strongest peak and its half frequency
    // to avoid getting stuck on harmonics
    let strongest_richness = harmonic_analysis::calculate_weighted_harmonic_richness(
        strongest_peak_freq,
        frequency_data,
        sample_rate,
        fft_size,
    );
    let half_freq = strongest_peak_freq / 2.0;
    let half_richness = harmonic_analysis::calculate_weighted_harmonic_richness(
        half_freq,
        frequency_data,
        sample_rate,
        fft_size,
    );
    
    // Determine the final selected frequency based on weighted harmonic richness
    let selected_freq = if half_richness > strongest_richness {
        // Half frequency has richer harmonics, likely it's the true fundamental
        result.selection_reason = Some(format!(
            "Half frequency ({:.1}Hz) has richer harmonics (weighted: {:.1} vs {:.1}) than strongest peak ({:.1}Hz)",
            half_freq, half_richness, strongest_richness, strongest_peak_freq
        ));
        half_freq
    } else if let Some(candidate) = fundamental_candidate {
        // We have a fundamental candidate from harmonic series detection
        let candidate_richness = harmonic_analysis::calculate_weighted_harmonic_richness(
            candidate,
            frequency_data,
            sample_rate,
            fft_size,
        );
        
        // Choose based on weighted harmonic richness
        if candidate_richness > strongest_richness {
            result.selection_reason = Some(format!(
                "Candidate ({:.1}Hz) has richer harmonics (weighted: {:.1} vs {:.1}) than strongest peak ({:.1}Hz)",
                candidate, candidate_richness, strongest_richness, strongest_peak_freq
            ));
            candidate
        } else if strongest_richness > candidate_richness {
            result.selection_reason = Some(format!(
                "Strongest peak ({:.1}Hz) has richer harmonics (weighted: {:.1} vs {:.1}) than candidate ({:.1}Hz)",
                strongest_peak_freq, strongest_richness, candidate_richness, candidate
            ));
            strongest_peak_freq
        } else {
            // If weighted harmonic richness is equal, use history for stability
            if !frequency_history.is_empty() {
                let last_freq = frequency_history.last().unwrap();
                if *last_freq > 0.0 {
                    let candidate_diff = (candidate - last_freq).abs() / last_freq;
                    let strongest_diff = (strongest_peak_freq - last_freq).abs() / last_freq;
                    
                    // Choose the one closer to history
                    if candidate_diff < strongest_diff {
                        result.selection_reason = Some(format!(
                            "Equal weighted harmonics ({:.1}), candidate ({:.1}Hz) closer to history ({:.1}Hz): {:.1}% vs {:.1}%",
                            candidate_richness, candidate, last_freq, candidate_diff * 100.0, strongest_diff * 100.0
                        ));
                        candidate
                    } else {
                        result.selection_reason = Some(format!(
                            "Equal weighted harmonics ({:.1}), strongest peak ({:.1}Hz) closer to history ({:.1}Hz): {:.1}% vs {:.1}%",
                            strongest_richness, strongest_peak_freq, last_freq, strongest_diff * 100.0, candidate_diff * 100.0
                        ));
                        strongest_peak_freq
                    }
                } else {
                    result.selection_reason = Some(format!(
                        "Equal weighted harmonics ({:.1}), no valid history, using fundamental candidate ({:.1}Hz)",
                        candidate_richness, candidate
                    ));
                    candidate
                }
            } else {
                result.selection_reason = Some(format!(
                    "Equal weighted harmonics ({:.1}), no history, using fundamental candidate ({:.1}Hz)",
                    candidate_richness, candidate
                ));
                candidate
            }
        }
    } else {
        // No fundamental candidate found, use strongest peak
        result.selection_reason = Some(format!(
            "No harmonic series detected, using strongest peak ({:.1}Hz, weighted: {:.1} vs half freq {:.1}Hz with weighted: {:.1})",
            strongest_peak_freq, strongest_richness, half_freq, half_richness
        ));
        strongest_peak_freq
    };
    
    // Compute harmonic analysis for debugging
    let half_freq = selected_freq / 2.0;
    let (normalized_candidate1, normalized_candidate2) = harmonic_analysis::calculate_normalized_harmonics(
        selected_freq,
        half_freq,
        frequency_data,
        sample_rate,
        fft_size,
    );
    
    result.candidate1_harmonics = Some(normalized_candidate1);
    result.candidate2_harmonics = Some(normalized_candidate2);
    
    result.candidate1_weighted_score = Some(harmonic_analysis::calculate_weighted_harmonic_richness(
        selected_freq,
        frequency_data,
        sample_rate,
        fft_size,
    ));
    
    result.candidate2_weighted_score = Some(harmonic_analysis::calculate_weighted_harmonic_richness(
        half_freq,
        frequency_data,
        sample_rate,
        fft_size,
    ));
    
    // Calculate the strength of the peak at half frequency as a percentage
    let half_freq_magnitude = harmonic_analysis::get_magnitude_at_frequency(
        half_freq,
        frequency_data,
        sample_rate,
        fft_size,
    );
    let selected_freq_magnitude = harmonic_analysis::get_magnitude_at_frequency(
        selected_freq,
        frequency_data,
        sample_rate,
        fft_size,
    );
    
    if selected_freq_magnitude > 0.0 {
        result.half_freq_peak_strength_percent = Some(
            (half_freq_magnitude / selected_freq_magnitude) * 100.0
        );
    } else {
        result.half_freq_peak_strength_percent = Some(0.0);
    }
    
    result.frequency = selected_freq;
    result
}

/// Find peaks in the frequency spectrum
fn find_peaks(
    frequency_data: &[u8],
    min_bin: usize,
    max_bin: usize,
    bin_frequency: f32,
) -> Vec<(f32, f32)> {
    let mut peaks = Vec::new();
    
    for bin in min_bin..max_bin {
        let magnitude = frequency_data[bin];
        
        if magnitude < FFT_MAGNITUDE_THRESHOLD {
            continue;
        }
        
        // Simple peak detection: local maximum
        let is_peak = (bin == min_bin || frequency_data[bin - 1] <= magnitude) &&
                      (bin + 1 >= max_bin || frequency_data[bin + 1] <= magnitude);
        
        if is_peak {
            // Apply parabolic interpolation for better frequency resolution
            let freq = if bin > 0 && bin < frequency_data.len() - 1 {
                let y_minus = frequency_data[bin - 1] as f32;
                let y_peak = magnitude as f32;
                let y_plus = frequency_data[bin + 1] as f32;
                
                let denominator = 2.0 * y_peak - y_minus - y_plus;
                let threshold = (f32::EPSILON * denominator.abs().max(1.0)).max(0.01);
                if denominator.abs() > threshold {
                    let delta = 0.5 * (y_plus - y_minus) / denominator;
                    (bin as f32 + delta) * bin_frequency
                } else {
                    bin as f32 * bin_frequency
                }
            } else {
                bin as f32 * bin_frequency
            };
            
            peaks.push((freq, magnitude as f32));
        }
    }
    
    peaks
}

/// Find the fundamental frequency from a list of peaks by detecting harmonic series
fn find_fundamental_frequency(peaks: &[(f32, f32)], reference_magnitude: f32) -> Option<f32> {
    if peaks.len() < MIN_HARMONICS_REQUIRED + 1 {
        return None;
    }
    
    let mut best_candidate: Option<(f32, usize)> = None;
    
    for &(candidate_fundamental, magnitude) in peaks.iter() {
        if magnitude < reference_magnitude * HARMONIC_RELATIVE_THRESHOLD {
            continue;
        }
        
        let mut harmonic_count = 0;
        
        for harmonic_num in 2..=MAX_HARMONICS_TO_CHECK {
            let expected_harmonic_freq = candidate_fundamental * harmonic_num as f32;
            
            let found_harmonic = peaks.iter().any(|&(peak_freq, peak_mag)| {
                let freq_diff = (peak_freq - expected_harmonic_freq).abs();
                let tolerance = candidate_fundamental * HARMONIC_FREQUENCY_TOLERANCE;
                
                freq_diff <= tolerance && peak_mag >= reference_magnitude * HARMONIC_RELATIVE_THRESHOLD
            });
            
            if found_harmonic {
                harmonic_count += 1;
            }
        }
        
        if harmonic_count >= MIN_HARMONICS_REQUIRED {
            match best_candidate {
                None => {
                    best_candidate = Some((candidate_fundamental, harmonic_count));
                }
                Some((best_freq, best_count)) => {
                    if harmonic_count > best_count || 
                       (harmonic_count == best_count && candidate_fundamental < best_freq) {
                        best_candidate = Some((candidate_fundamental, harmonic_count));
                    }
                }
            }
        }
    }
    
    best_candidate.map(|(freq, _)| freq)
}
