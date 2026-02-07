/// Default detection mode: Hysteresis-based movement algorithm (recommended)
/// This is the default Phase 0 Detection mode selected in the UI.
///
/// Far from zero-cross: moves gradually; Near: jumps directly with hysteresis to prevent oscillation
use super::utils::*;

/// Hysteresis-based movement algorithm (recommended)
/// Far from zero-cross: moves gradually; Near: jumps directly with hysteresis to prevent oscillation
pub fn find_zero_cross_hysteresis(
    data: &[f32],
    estimated_cycle_length: f32,
    segment_phase_offset: &mut Option<usize>,
    history_search_tolerance_ratio: f32,
    hysteresis_threshold_ratio: f32,
    max_search_range_multiplier: f32,
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
    
    // Find nearest zero-cross in extended range
    let max_search = (tolerance as f32 * max_search_range_multiplier) as usize;
    let forward_zc = find_zero_cross(data, history_idx + 1)
        .filter(|&idx| idx <= history_idx + max_search);
    let backward_zc = find_zero_crossing_backward(data, history_idx.saturating_sub(1))
        .filter(|&idx| history_idx.saturating_sub(idx) <= max_search);
    
    // Find nearest and apply hysteresis
    match (forward_zc, backward_zc) {
        (Some(fwd), Some(bwd)) => {
            let fwd_dist = fwd - history_idx;
            let bwd_dist = history_idx - bwd;
            let (target, distance) = if fwd_dist < bwd_dist {
                (fwd, fwd_dist)
            } else {
                (bwd, bwd_dist)
            };
            
            // Hysteresis threshold
            let hysteresis_threshold = (tolerance as f32 * hysteresis_threshold_ratio) as usize;
            
            let new_pos = if distance > hysteresis_threshold {
                // Far away: move tolerance amount
                if target > history_idx {
                    history_idx + tolerance
                } else {
                    history_idx.saturating_sub(tolerance)
                }
            } else {
                // Close: jump directly to target
                target
            };
            
            *segment_phase_offset = Some(new_pos);
            Some(new_pos)
        }
        (Some(fwd), None) => {
            let distance = fwd - history_idx;
            let hysteresis_threshold = (tolerance as f32 * hysteresis_threshold_ratio) as usize;
            let new_pos = if distance > hysteresis_threshold {
                history_idx + tolerance
            } else {
                fwd
            };
            *segment_phase_offset = Some(new_pos);
            Some(new_pos)
        }
        (None, Some(bwd)) => {
            let distance = history_idx - bwd;
            let hysteresis_threshold = (tolerance as f32 * hysteresis_threshold_ratio) as usize;
            let new_pos = if distance > hysteresis_threshold {
                history_idx.saturating_sub(tolerance)
            } else {
                bwd
            };
            *segment_phase_offset = Some(new_pos);
            Some(new_pos)
        }
        (None, None) => Some(history_idx),
    }
}
