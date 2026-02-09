use super::utils::*;
use super::ZeroCrossMode;

pub(crate) fn find_phase_zero_in_segment(
    segment: &[f32],
    segment_start_abs: usize,
    estimated_cycle_length: f32,
    zero_cross_mode: ZeroCrossMode,
    absolute_phase_offset: &mut Option<usize>,
    peak_search_multiplier: f32,
    history_search_tolerance_ratio: f32,
) -> Option<usize> {
    // If cycle length is invalid, keep existing history (if still within this segment) and wait for a valid estimate
    if estimated_cycle_length < f32::EPSILON {
        if let Some(history_abs) = *absolute_phase_offset {
            if history_abs >= segment_start_abs && history_abs < segment_start_abs + segment.len() {
                return Some(history_abs - segment_start_abs);
            }
        }
        return None;
    }

    // If we don't have history, perform initial detection
    if absolute_phase_offset.is_none() {
        // Initial detection based on current mode
        let zero_cross_rel = match zero_cross_mode {
            ZeroCrossMode::Standard => {
                find_zero_cross(segment, 0)
            }
            ZeroCrossMode::PeakBacktrackWithHistory => {
                // Find peak and backtrack
                let search_end = if estimated_cycle_length > 0.0 {
                    (estimated_cycle_length * peak_search_multiplier) as usize
                } else {
                    segment.len() / 2
                };

                if let Some(peak_idx) = find_peak(segment, 0, Some(search_end.min(segment.len()))) {
                    find_zero_crossing_backward(segment, peak_idx)
                } else {
                    find_zero_cross(segment, 0)
                }
            }
            _ => {
                // For other modes, use standard zero-cross detection
                find_zero_cross(segment, 0)
            }
        }?;

        // Issue #296: Constrain initial position to the central 2 cycles of the 4-cycle segment.
        // The segment contains 4 cycles [0, 1, 2, 3] (0-based), each of length `cycle_length_usize`.
        // The "central 2 cycles" are cycles 1 and 2, corresponding to the half-open index range [L, 3L).
        // We use an inclusive lower bound and an exclusive upper bound: [min_allowed, max_allowed_exclusive).
        let mut constrained_rel = zero_cross_rel;
        if estimated_cycle_length > f32::EPSILON {
            let cycle_length_usize = estimated_cycle_length as usize;
            let min_allowed = cycle_length_usize; // Inclusive start of cycle 1
            let max_allowed_exclusive = cycle_length_usize * 3; // Exclusive end (start of cycle 3)

            // Clamp to segment bounds to handle short segments at buffer end
            let min_allowed = min_allowed.min(segment.len().saturating_sub(1));
            let max_allowed_exclusive = max_allowed_exclusive.min(segment.len());

            // Ensure min <= max
            if min_allowed < max_allowed_exclusive {
                // If initial detection is outside the allowed range, search within the central 2 cycles
                if constrained_rel < min_allowed || constrained_rel >= max_allowed_exclusive {
                    // Search for zero-cross starting from cycle 1
                    if let Some(zero_in_center) = find_zero_cross(segment, min_allowed) {
                        if zero_in_center < max_allowed_exclusive {
                            constrained_rel = zero_in_center;
                        }
                    }
                }
            }
        }

        // Convert to absolute and store
        let zero_cross_abs = segment_start_abs + constrained_rel;
        *absolute_phase_offset = Some(zero_cross_abs);
        return Some(constrained_rel);
    }
    
    // We have history - use new algorithm (Issue #289)
    // Extract all zero-cross candidates from 4-cycle buffer, then move toward nearest candidate
    let history_abs = absolute_phase_offset.unwrap();

    // Convert absolute history to segment-relative
    // Check if history is within the current segment
    if history_abs < segment_start_abs || history_abs >= segment_start_abs + segment.len() {
        // History is outside current segment - perform fresh detection
        let zero_cross_rel = find_zero_cross(segment, 0)?;

        // Issue #296: Constrain fresh detection to the central 2 cycles of the 4-cycle segment.
        // Range: [cycle_length, cycle_length*3) - cycles 1 and 2 only
        let mut constrained_rel = zero_cross_rel;
        if estimated_cycle_length > f32::EPSILON {
            let cycle_length_usize = estimated_cycle_length as usize;
            let min_allowed = cycle_length_usize; // Inclusive start of cycle 1
            let max_allowed_exclusive = cycle_length_usize * 3; // Exclusive end (start of cycle 3)

            // Clamp to segment bounds to handle short segments at buffer end
            let min_allowed = min_allowed.min(segment.len().saturating_sub(1));
            let max_allowed_exclusive = max_allowed_exclusive.min(segment.len());

            // Ensure min <= max
            if min_allowed < max_allowed_exclusive {
                // If detection is outside the allowed range, search within the central 2 cycles
                if constrained_rel < min_allowed || constrained_rel >= max_allowed_exclusive {
                    // Search for zero-cross starting from cycle 1
                    if let Some(zero_in_center) = find_zero_cross(segment, min_allowed) {
                        if zero_in_center < max_allowed_exclusive {
                            constrained_rel = zero_in_center;
                        }
                    }
                }
            }
        }

        let zero_cross_abs = segment_start_abs + constrained_rel;
        *absolute_phase_offset = Some(zero_cross_abs);
        return Some(constrained_rel);
    }

    let history_rel = history_abs - segment_start_abs;

    // Calculate 1% tolerance for movement constraint
    let tolerance = ((estimated_cycle_length * history_search_tolerance_ratio) as usize).max(1);

    // Issue #296: Calculate allowed range for the central 2 cycles of the 4-cycle segment.
    // The segment contains 4 cycles [0, 1, 2, 3] (0-based), each of length `cycle_length_usize`.
    // The "central 2 cycles" are cycles 1 and 2, corresponding to the half-open index range [L, 3L).
    let cycle_length_usize = estimated_cycle_length as usize;
    let min_allowed = cycle_length_usize; // Inclusive start of cycle 1
    let max_allowed_exclusive = cycle_length_usize * 3; // Exclusive end (start of cycle 3)

    // Clamp to segment bounds to handle short segments at buffer end
    let min_allowed = min_allowed.min(segment.len().saturating_sub(1));
    let max_allowed_exclusive = max_allowed_exclusive.min(segment.len());

    // If segment is too short for the constraint, just return history as-is
    if min_allowed >= max_allowed_exclusive {
        return Some(history_rel.min(segment.len().saturating_sub(1)));
    }

    // Find the nearest zero-cross candidate in a single pass (avoiding Vec allocation)
    // Only search within the central 2 cycles to prevent markers from disappearing at edges
    let mut nearest_candidate: Option<usize> = None;
    let mut min_distance = usize::MAX;

    // Search range includes positions that can be valid: [min_allowed, max_allowed_exclusive)
    // Need to check segment[i] and segment[i+1], so stop before last element
    let search_start = min_allowed;
    let search_end = (max_allowed_exclusive.saturating_sub(1)).min(segment.len().saturating_sub(1));

    for i in search_start..=search_end {
        if i + 1 < segment.len() && segment[i] <= 0.0 && segment[i + 1] > 0.0 {
            let distance = if i >= history_rel {
                i - history_rel
            } else {
                history_rel - i
            };

            if distance < min_distance {
                min_distance = distance;
                nearest_candidate = Some(i);
            }
        }
    }

    // If no candidates exist, don't move (keep history, but clamp to allowed range)
    let nearest = match nearest_candidate {
        Some(n) => n,
        None => {
            // Issue #296: Clamp history_rel to allowed range before returning
            // Ensure result is within [0, segment.len()) and [min_allowed, max_allowed_exclusive)
            let mut clamped = history_rel;
            if clamped < min_allowed {
                clamped = min_allowed;
            } else if clamped >= max_allowed_exclusive {
                clamped = max_allowed_exclusive.saturating_sub(1);
            }
            // Final bounds check
            clamped = clamped.min(segment.len().saturating_sub(1));
            let new_abs = segment_start_abs + clamped;
            *absolute_phase_offset = Some(new_abs);
            return Some(clamped);
        }
    };

    // Determine direction to move toward the nearest candidate
    if nearest == history_rel {
        // Already at a zero-cross, no movement needed
        // Issue #296: But still clamp to allowed range
        let mut clamped = history_rel;
        if clamped < min_allowed {
            clamped = min_allowed;
        } else if clamped >= max_allowed_exclusive {
            clamped = max_allowed_exclusive.saturating_sub(1);
        }
        // Final bounds check
        clamped = clamped.min(segment.len().saturating_sub(1));
        let new_abs = segment_start_abs + clamped;
        *absolute_phase_offset = Some(new_abs);
        return Some(clamped);
    }

    // Calculate the new position, constrained to move at most 1% per frame
    let mut new_rel = if nearest > history_rel {
        // Move right (toward future)
        let distance = nearest - history_rel;
        let step = distance.min(tolerance);
        history_rel + step
    } else {
        // Move left (toward past)
        let distance = history_rel - nearest;
        let step = distance.min(tolerance);
        history_rel.saturating_sub(step)
    };

    // Issue #296: Clamp new_rel to the allowed range (central 2 cycles)
    if new_rel < min_allowed {
        new_rel = min_allowed;
    } else if new_rel >= max_allowed_exclusive {
        new_rel = max_allowed_exclusive.saturating_sub(1);
    }
    // Final bounds check
    new_rel = new_rel.min(segment.len().saturating_sub(1));

    // Update history with new absolute position (continuous)
    let new_abs = segment_start_abs + new_rel;
    *absolute_phase_offset = Some(new_abs);

    // Return the gradually moved position directly (NOT snapped to zero-cross)
    //
    // DESIGN DECISION: Prioritize smooth 1% movement over exact zero-cross position
    //
    // Rationale:
    // - Zero-cross candidates can jump wildly between frames (due to noise, etc.)
    // - If we snap to the nearest zero-cross, the red line will jump visually
    // - Jumpy movement provides poor visual experience for users
    // - Therefore, we accept that the marker may not be at an exact zero-cross
    // - The 1% gradual movement constraint is prioritized for smooth visual experience
    //
    // This means the red line position represents "moving toward the nearest zero-cross"
    // rather than "exactly at a zero-cross", which is acceptable for visual stability.
    Some(new_rel)
}
