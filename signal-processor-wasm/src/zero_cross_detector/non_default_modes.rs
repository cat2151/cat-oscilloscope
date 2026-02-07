/// Non-default detection mode implementations for zero-cross detection
/// These modes are activated when the user changes the Phase 0 Detection dropdown
/// from the default (Hysteresis). They may be deprecated in the future.
///
/// Default mode: Hysteresis (see default_mode.rs)
/// Non-default modes (this file):
///   - PeakBacktrackWithHistory: Find peak, backtrack to zero-cross, use history
///   - BidirectionalNearest: Search forward/backward for nearest zero-cross
///   - GradientBased: Use signal value to determine direction
///   - AdaptiveStep: Adjust step size based on distance
///   - ClosestToZero: Select sample closest to zero
use super::utils::*;

/// Find zero-cross using peak backtrack with history mode
/// Initial call: find peak, backtrack to zero-cross, store as history
/// Subsequent calls: if current position is not a zero-cross, search forward/backward
/// within 1/100 of one cycle from the history position
pub fn find_zero_cross_peak_backtrack_with_history(
    data: &[f32],
    estimated_cycle_length: f32,
    segment_phase_offset: &mut Option<usize>,
    history_search_tolerance_ratio: f32,
) -> Option<usize> {
    // COORDINATE SPACE: segment-relative (all indices in this method are relative to segment start)
    // If we don't have history or invalid cycle length, perform initial detection
    if segment_phase_offset.is_none() || estimated_cycle_length <= 0.0 {
        // Find peak in the first part of the waveform
        let search_end = if estimated_cycle_length > 0.0 {
            (estimated_cycle_length * 1.5) as usize
        } else {
            data.len() / 2
        };
        
        if let Some(peak_idx) = find_peak(data, 0, Some(search_end.min(data.len()))) {
            // Backtrack from peak to find zero-cross
            if let Some(zero_cross_idx) = find_zero_crossing_backward(data, peak_idx) {
                // Store as history (segment-relative offset)
                *segment_phase_offset = Some(zero_cross_idx);
                return Some(zero_cross_idx);
            }
        }
        
        // Fallback: find first zero-cross
        if let Some(zero_cross) = find_zero_cross(data, 0) {
            *segment_phase_offset = Some(zero_cross);
            return Some(zero_cross);
        }
        
        return None;
    }
    
    // We have history - use it to search with tight tolerance (1/100 of cycle)
    let history_idx = segment_phase_offset.unwrap();
    let tolerance = ((estimated_cycle_length * history_search_tolerance_ratio) as usize).max(1);
    
    // Check if the history position itself is still a zero-cross
    if history_idx < data.len() - 1 && data[history_idx] <= 0.0 && data[history_idx + 1] > 0.0 {
        // History position is still valid
        return Some(history_idx);
    }
    
    // Search backward and forward from history position
    let search_start = history_idx.saturating_sub(tolerance);
    let search_end = (history_idx + tolerance).min(data.len());
    
    // Try to find zero-cross in the search range
    for i in search_start..search_end.saturating_sub(1) {
        if data[i] <= 0.0 && data[i + 1] > 0.0 {
            // Found a zero-cross within tolerance - update history
            *segment_phase_offset = Some(i);
            return Some(i);
        }
    }
    
    // No zero-cross found in tolerance range - keep using history position
    // but try to find the nearest zero-cross for next frame
    if let Some(zero_cross) = find_zero_cross(data, search_start) {
        let distance = if zero_cross >= history_idx {
            zero_cross - history_idx
        } else {
            history_idx - zero_cross
        };
        
        // Only update history if the new zero-cross is reasonably close
        if distance <= tolerance * 3 {
            *segment_phase_offset = Some(zero_cross);
            return Some(zero_cross);
        }
    }
    
    // Return history position as last resort
    Some(history_idx)
}

/// Bidirectional nearest search algorithm
/// Searches both forward and backward for the nearest zero-cross and moves gradually toward it
pub fn find_zero_cross_bidirectional_nearest(
    data: &[f32],
    estimated_cycle_length: f32,
    segment_phase_offset: &mut Option<usize>,
    history_search_tolerance_ratio: f32,
    max_search_range_multiplier: f32,
) -> Option<usize> {
    // COORDINATE SPACE: segment-relative
    // Initialize history if needed
    if segment_phase_offset.is_none() || estimated_cycle_length <= 0.0 {
        let result = initialize_history(data, estimated_cycle_length);
        *segment_phase_offset = result;
        return result;
    }
    
    let history_idx = segment_phase_offset.unwrap();
    let tolerance = ((estimated_cycle_length * history_search_tolerance_ratio) as usize).max(1);
    
    // Check if history is still a zero-cross
    if history_idx < data.len() - 1 && data[history_idx] <= 0.0 && data[history_idx + 1] > 0.0 {
        return Some(history_idx);
    }
    
    // Search in tolerance range first
    let search_start = history_idx.saturating_sub(tolerance);
    let search_end = (history_idx + tolerance).min(data.len());
    
    for i in search_start..search_end.saturating_sub(1) {
        if data[i] <= 0.0 && data[i + 1] > 0.0 {
            *segment_phase_offset = Some(i);
            return Some(i);
        }
    }
    
    // Search broader range for nearest zero-cross
    let max_search = (estimated_cycle_length * max_search_range_multiplier) as usize;
    let forward_zc = find_zero_cross(data, history_idx + 1)
        .filter(|&idx| idx <= history_idx + max_search);
    let backward_zc = find_zero_crossing_backward(data, history_idx.saturating_sub(1))
        .filter(|&idx| history_idx.saturating_sub(idx) <= max_search);
    
    // Find nearest and move tolerance amount toward it
    match (forward_zc, backward_zc) {
        (Some(fwd), Some(bwd)) => {
            let fwd_dist = fwd - history_idx;
            let bwd_dist = history_idx - bwd;
            let new_pos = if fwd_dist < bwd_dist {
                history_idx + tolerance.min(fwd_dist)
            } else {
                history_idx.saturating_sub(tolerance.min(bwd_dist))
            };
            *segment_phase_offset = Some(new_pos);
            Some(new_pos)
        }
        (Some(fwd), None) => {
            let new_pos = history_idx + tolerance.min(fwd - history_idx);
            *segment_phase_offset = Some(new_pos);
            Some(new_pos)
        }
        (None, Some(bwd)) => {
            let new_pos = history_idx.saturating_sub(tolerance.min(history_idx - bwd));
            *segment_phase_offset = Some(new_pos);
            Some(new_pos)
        }
        (None, None) => Some(history_idx),
    }
}

/// Gradient-based movement algorithm
/// Uses the signal value to determine direction toward zero-cross
pub fn find_zero_cross_gradient_based(
    data: &[f32],
    estimated_cycle_length: f32,
    segment_phase_offset: &mut Option<usize>,
    history_search_tolerance_ratio: f32,
) -> Option<usize> {
    // COORDINATE SPACE: segment-relative
    if segment_phase_offset.is_none() || estimated_cycle_length <= 0.0 {
        let result = initialize_history(data, estimated_cycle_length);
        *segment_phase_offset = result;
        return result;
    }
    
    let history_idx = segment_phase_offset.unwrap();
    let tolerance = ((estimated_cycle_length * history_search_tolerance_ratio) as usize).max(1);
    
    if history_idx >= data.len() {
        return Some(history_idx);
    }
    
    // Check if history is a zero-cross
    if history_idx < data.len() - 1 && data[history_idx] <= 0.0 && data[history_idx + 1] > 0.0 {
        return Some(history_idx);
    }
    
    // Check in tolerance range first
    let search_start = history_idx.saturating_sub(tolerance);
    let search_end = (history_idx + tolerance).min(data.len());
    
    for i in search_start..search_end.saturating_sub(1) {
        if data[i] <= 0.0 && data[i + 1] > 0.0 {
            *segment_phase_offset = Some(i);
            return Some(i);
        }
    }
    
    // Use gradient: move based on current signal value
    // If positive, we need to move backward (toward negative); if negative, move forward (toward positive)
    let step_size = tolerance / 2;
    let new_pos = if data[history_idx] > 0.0 {
        // Positive value: move backward toward negative/zero
        history_idx.saturating_sub(step_size.max(1))
    } else {
        // Negative value: move forward toward positive/zero
        (history_idx + step_size.max(1)).min(data.len() - 1)
    };
    
    *segment_phase_offset = Some(new_pos);
    Some(new_pos)
}

/// Adaptive step movement algorithm
/// Adjusts step size based on distance to nearest zero-cross
pub fn find_zero_cross_adaptive_step(
    data: &[f32],
    estimated_cycle_length: f32,
    segment_phase_offset: &mut Option<usize>,
    history_search_tolerance_ratio: f32,
) -> Option<usize> {
    // COORDINATE SPACE: segment-relative
    if segment_phase_offset.is_none() || estimated_cycle_length <= 0.0 {
        let result = initialize_history(data, estimated_cycle_length);
        *segment_phase_offset = result;
        return result;
    }
    
    let history_idx = segment_phase_offset.unwrap();
    let tolerance = ((estimated_cycle_length * history_search_tolerance_ratio) as usize).max(1);
    
    // Check if history is a zero-cross
    if history_idx < data.len() - 1 && data[history_idx] <= 0.0 && data[history_idx + 1] > 0.0 {
        return Some(history_idx);
    }
    
    // Search in tolerance range
    let search_start = history_idx.saturating_sub(tolerance);
    let search_end = (history_idx + tolerance).min(data.len());
    
    for i in search_start..search_end.saturating_sub(1) {
        if data[i] <= 0.0 && data[i + 1] > 0.0 {
            *segment_phase_offset = Some(i);
            return Some(i);
        }
    }
    
    // Find nearest zero-cross in broader range
    let max_search = estimated_cycle_length as usize;
    let forward_zc = find_zero_cross(data, history_idx + 1)
        .filter(|&idx| idx <= history_idx + max_search);
    let backward_zc = find_zero_crossing_backward(data, history_idx.saturating_sub(1))
        .filter(|&idx| history_idx.saturating_sub(idx) <= max_search);
    
    // Calculate distance and adaptive step
    match (forward_zc, backward_zc) {
        (Some(fwd), Some(bwd)) => {
            let fwd_dist = fwd - history_idx;
            let bwd_dist = history_idx - bwd;
            let (target, distance) = if fwd_dist < bwd_dist {
                (fwd, fwd_dist)
            } else {
                (bwd, bwd_dist)
            };
            
            // Move by min(distance, tolerance)
            let step = distance.min(tolerance);
            let new_pos = if target > history_idx {
                history_idx + step
            } else {
                history_idx.saturating_sub(step)
            };
            
            *segment_phase_offset = Some(new_pos);
            Some(new_pos)
        }
        (Some(fwd), None) => {
            let step = (fwd - history_idx).min(tolerance);
            let new_pos = history_idx + step;
            *segment_phase_offset = Some(new_pos);
            Some(new_pos)
        }
        (None, Some(bwd)) => {
            let step = (history_idx - bwd).min(tolerance);
            let new_pos = history_idx.saturating_sub(step);
            *segment_phase_offset = Some(new_pos);
            Some(new_pos)
        }
        (None, None) => Some(history_idx),
    }
}

/// Closest to zero algorithm
/// Selects the sample with value closest to zero within tolerance range
pub fn find_zero_cross_closest_to_zero(
    data: &[f32],
    estimated_cycle_length: f32,
    segment_phase_offset: &mut Option<usize>,
    history_search_tolerance_ratio: f32,
) -> Option<usize> {
    // COORDINATE SPACE: segment-relative
    if segment_phase_offset.is_none() || estimated_cycle_length <= 0.0 {
        let result = initialize_history(data, estimated_cycle_length);
        *segment_phase_offset = result;
        return result;
    }
    
    let history_idx = segment_phase_offset.unwrap();
    let tolerance = ((estimated_cycle_length * history_search_tolerance_ratio) as usize).max(1);
    
    // Check if history is a zero-cross
    if history_idx < data.len() - 1 && data[history_idx] <= 0.0 && data[history_idx + 1] > 0.0 {
        return Some(history_idx);
    }
    
    // Search in tolerance range for actual zero-cross
    let search_start = history_idx.saturating_sub(tolerance);
    let search_end = (history_idx + tolerance).min(data.len());
    
    for i in search_start..search_end.saturating_sub(1) {
        if data[i] <= 0.0 && data[i + 1] > 0.0 {
            *segment_phase_offset = Some(i);
            return Some(i);
        }
    }
    
    // No zero-cross found, find sample closest to zero
    let mut closest_idx = history_idx;
    let mut closest_value = if history_idx < data.len() {
        data[history_idx].abs()
    } else {
        f32::MAX
    };
    
    for i in search_start..search_end.min(data.len()) {
        let abs_value = data[i].abs();
        if abs_value < closest_value {
            closest_value = abs_value;
            closest_idx = i;
        }
    }
    
    *segment_phase_offset = Some(closest_idx);
    Some(closest_idx)
}
