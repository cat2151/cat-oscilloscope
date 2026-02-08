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

/// Clamp a position to the allowed range [min_allowed, max_allowed_exclusive) and segment bounds
///
/// This helper function ensures that a position is within both:
/// 1. The allowed constraint range [min_allowed, max_allowed_exclusive) - half-open interval
/// 2. The segment bounds [0, segment_len)
///
/// # Arguments
/// * `position` - The position to clamp
/// * `min_allowed` - Inclusive lower bound of the allowed range
/// * `max_allowed_exclusive` - Exclusive upper bound of the allowed range
/// * `segment_len` - Length of the segment for final bounds checking
///
/// # Returns
/// The clamped position guaranteed to be in [min_allowed, max_allowed_exclusive) ∩ [0, segment_len)
pub fn clamp_to_allowed_range(
    position: usize,
    min_allowed: usize,
    max_allowed_exclusive: usize,
    segment_len: usize,
) -> usize {
    let mut clamped = position;

    // Clamp to allowed range
    if clamped < min_allowed {
        clamped = min_allowed;
    } else if clamped >= max_allowed_exclusive {
        clamped = max_allowed_exclusive.saturating_sub(1);
    }

    // Final bounds check against segment length
    clamped.min(segment_len.saturating_sub(1))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_clamp_to_allowed_range_within_bounds() {
        // Position within allowed range should remain unchanged
        assert_eq!(clamp_to_allowed_range(150, 100, 300, 400), 150);
        assert_eq!(clamp_to_allowed_range(100, 100, 300, 400), 100); // At min
        assert_eq!(clamp_to_allowed_range(299, 100, 300, 400), 299); // Just before max
    }

    #[test]
    fn test_clamp_to_allowed_range_below_min() {
        // Position below min_allowed should be clamped to min_allowed
        assert_eq!(clamp_to_allowed_range(50, 100, 300, 400), 100);
        assert_eq!(clamp_to_allowed_range(0, 100, 300, 400), 100);
    }

    #[test]
    fn test_clamp_to_allowed_range_above_max() {
        // Position at or above max_allowed_exclusive should be clamped to max - 1
        assert_eq!(clamp_to_allowed_range(300, 100, 300, 400), 299);
        assert_eq!(clamp_to_allowed_range(350, 100, 300, 400), 299);
        assert_eq!(clamp_to_allowed_range(400, 100, 300, 400), 299);
    }

    #[test]
    fn test_clamp_to_allowed_range_segment_bounds() {
        // When position is within allowed range but segment is shorter,
        // it should be clamped by segment bounds
        assert_eq!(clamp_to_allowed_range(150, 100, 300, 200), 150); // Position 150 is valid within segment[0..200)

        // When position and constraint both exceed segment bounds
        assert_eq!(clamp_to_allowed_range(350, 100, 300, 200), 199); // Both clamps applied
    }
}
