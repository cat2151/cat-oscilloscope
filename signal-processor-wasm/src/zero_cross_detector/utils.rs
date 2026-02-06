/// Utility functions for zero-cross detection

/// Find peak point (maximum absolute amplitude) in the waveform
pub fn find_peak(data: &[f32], start_index: usize, end_index: Option<usize>) -> Option<usize> {
    let end = end_index.unwrap_or(data.len());
    if start_index >= end || start_index >= data.len() {
        return None;
    }
    
    let mut peak_index = start_index;
    let mut peak_value = data[start_index].abs();
    
    for i in start_index + 1..end {
        let abs_value = data[i].abs();
        if abs_value > peak_value {
            peak_value = abs_value;
            peak_index = i;
        }
    }
    
    Some(peak_index)
}

/// Find the next peak after the given index
pub fn find_next_peak(data: &[f32], start_index: usize, cycle_length: f32) -> Option<usize> {
    let search_start = start_index + 1;
    let search_end = (search_start + (cycle_length * 1.5) as usize).min(data.len());
    
    if search_start >= data.len() {
        return None;
    }
    
    find_peak(data, search_start, Some(search_end))
}

/// Find zero-cross point where signal crosses from negative to positive
pub fn find_zero_cross(data: &[f32], start_index: usize) -> Option<usize> {
    for i in start_index..data.len() - 1 {
        if data[i] <= 0.0 && data[i + 1] > 0.0 {
            return Some(i);
        }
    }
    None
}

/// Find the next zero-cross point after the given index
pub fn find_next_zero_cross(data: &[f32], start_index: usize) -> Option<usize> {
    let search_start = start_index + 1;
    if search_start >= data.len() {
        return None;
    }
    find_zero_cross(data, search_start)
}

/// Find zero-crossing by looking backward from a given position
/// Returns the index where the zero-crossing occurs (data[i] <= 0.0 && data[i+1] > 0.0)
pub fn find_zero_crossing_backward(data: &[f32], start_index: usize) -> Option<usize> {
    if start_index == 0 || start_index >= data.len() {
        return None;
    }
    
    // Look backward from start_index
    // Since we validated start_index < data.len() above, and we iterate from 1 to start_index,
    // all indices are guaranteed to be within bounds
    for i in (1..=start_index).rev() {
        if data[i - 1] <= 0.0 && data[i] > 0.0 {
            return Some(i - 1);
        }
    }
    
    None
}

/// Helper function to initialize history (used by all new algorithms)
pub fn initialize_history(data: &[f32], estimated_cycle_length: f32) -> Option<usize> {
    // COORDINATE SPACE: segment-relative
    let search_end = if estimated_cycle_length > 0.0 {
        (estimated_cycle_length * 1.5) as usize
    } else {
        data.len() / 2
    };
    
    if let Some(peak_idx) = find_peak(data, 0, Some(search_end.min(data.len()))) {
        if let Some(zero_cross_idx) = find_zero_crossing_backward(data, peak_idx) {
            return Some(zero_cross_idx);
        }
    }
    
    // Fallback: find first zero-cross
    find_zero_cross(data, 0)
}
