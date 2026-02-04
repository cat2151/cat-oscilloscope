/// Frequency smoothing utilities

const FREQUENCY_HISTORY_SIZE: usize = 10;
const FREQUENCY_GROUPING_TOLERANCE: f32 = 0.08;

/// Apply frequency smoothing using mode filter
/// Returns the smoothed frequency and updated history
pub fn smooth_frequency(
    raw_frequency: f32,
    frequency_history: &mut Vec<f32>,
) -> f32 {
    // Add to history
    frequency_history.push(raw_frequency);
    if frequency_history.len() > FREQUENCY_HISTORY_SIZE {
        frequency_history.remove(0);
    }
    
    // Not enough history yet
    if frequency_history.len() < 3 {
        return raw_frequency;
    }
    
    // Find mode (most common value within tolerance)
    let mut best_count = 0;
    let mut best_freq = raw_frequency;
    
    for &freq in frequency_history.iter() {
        if freq == 0.0 {
            continue;
        }
        
        let mut count = 0;
        let mut sum = 0.0f32;
        
        for &other_freq in frequency_history.iter() {
            if other_freq == 0.0 {
                continue;
            }
            
            let tolerance = freq * FREQUENCY_GROUPING_TOLERANCE;
            if (other_freq - freq).abs() <= tolerance {
                count += 1;
                sum += other_freq;
            }
        }
        
        if count > best_count {
            best_count = count;
            best_freq = sum / count as f32;
        }
    }
    
    best_freq
}

pub fn get_history_size() -> usize {
    FREQUENCY_HISTORY_SIZE
}
