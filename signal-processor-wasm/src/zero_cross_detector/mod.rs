/// ZeroCrossDetector module - Handles zero-crossing detection and phase 0 positioning
///
/// Default (Standard) mode: Hysteresis, core implementation lives in this module
///   - main logic in `find_stable_zero_cross` and the Standard branch of `find_phase_zero_in_segment`
/// Non-default modes: implemented in non_default_modes.rs (these modes may be deprecated in the future)

mod types;
mod utils;
mod default_mode;
mod non_default_modes;

pub use types::{DisplayRange, ZeroCrossMode};

use utils::*;
use default_mode::*;
use non_default_modes::*;

/// ZeroCrossDetector handles zero-crossing detection and display range calculation
pub struct ZeroCrossDetector {
    previous_zero_cross_index: Option<usize>,
    previous_peak_index: Option<usize>,
    use_peak_mode: bool,
    zero_cross_mode: ZeroCrossMode,
    // COORDINATE SPACE: segment-relative (0..segment.len())
    // History for segment-relative position tracking (for PeakBacktrackWithHistory and other modes)
    // Stores the offset within the 4-cycle segment, NOT frame buffer absolute position
    // This ensures the 1% constraint works correctly even when segment position changes each frame
    segment_phase_offset: Option<usize>,
    // COORDINATE SPACE: absolute (frame buffer position)
    // History for absolute position tracking (used by find_phase_zero_in_segment)
    // Stores the absolute position in the full buffer to track across segment position changes
    absolute_phase_offset: Option<usize>,
}

impl ZeroCrossDetector {
    const ZERO_CROSS_SEARCH_TOLERANCE_CYCLES: f32 = 0.5;
    /// Tolerance for history-based search (1/100 of one cycle = 1%)
    const HISTORY_SEARCH_TOLERANCE_RATIO: f32 = 0.01;
    /// Hysteresis threshold ratio (distance threshold for mode switching)
    const HYSTERESIS_THRESHOLD_RATIO: f32 = 2.0;
    /// Maximum search range multiplier for finding zero-crosses
    const MAX_SEARCH_RANGE_MULTIPLIER: f32 = 5.0;
    /// Number of cycles to display (must match CYCLES_TO_STORE in waveform_searcher)
    const CYCLES_TO_DISPLAY: usize = 4;
    /// Peak search range multiplier for initial detection
    const PEAK_SEARCH_MULTIPLIER: f32 = 1.5;
    /// Extended tolerance ratio for Standard mode (3% of cycle length)
    const STANDARD_MODE_EXTENDED_TOLERANCE_RATIO: f32 = 0.03;
    /// Extended tolerance multiplier for other modes (3x normal tolerance)
    const EXTENDED_TOLERANCE_MULTIPLIER: usize = 3;
    
    pub fn new() -> Self {
        ZeroCrossDetector {
            previous_zero_cross_index: None,
            previous_peak_index: None,
            use_peak_mode: false,
            zero_cross_mode: ZeroCrossMode::Hysteresis,
            segment_phase_offset: None,
            absolute_phase_offset: None,
        }
    }
    
    /// Set whether to use peak mode instead of zero-crossing mode
    pub fn set_use_peak_mode(&mut self, enabled: bool) {
        self.use_peak_mode = enabled;
    }
    
    /// Set zero-cross detection mode
    pub fn set_zero_cross_mode(&mut self, mode: ZeroCrossMode) {
        self.zero_cross_mode = mode;
        // Clear history when mode changes
        self.segment_phase_offset = None;
        self.absolute_phase_offset = None;
    }
    
    /// Get current zero-cross detection mode
    pub fn get_zero_cross_mode(&self) -> ZeroCrossMode {
        self.zero_cross_mode
    }
    
    /// Get current zero-cross detection mode as string (for debugging)
    pub fn get_zero_cross_mode_name(&self) -> String {
        match self.zero_cross_mode {
            ZeroCrossMode::Standard => "Standard".to_string(),
            ZeroCrossMode::PeakBacktrackWithHistory => "Peak+History (1% stable)".to_string(),
            ZeroCrossMode::BidirectionalNearest => "Bidirectional Nearest".to_string(),
            ZeroCrossMode::GradientBased => "Gradient Based".to_string(),
            ZeroCrossMode::AdaptiveStep => "Adaptive Step".to_string(),
            ZeroCrossMode::Hysteresis => "Hysteresis".to_string(),
            ZeroCrossMode::ClosestToZero => "Closest to Zero".to_string(),
        }
    }
    
    /// Get current history value for debugging
    /// Returns segment-relative offset (0..segment.len())
    pub fn get_segment_phase_offset(&self) -> Option<usize> {
        self.segment_phase_offset
    }
    
    /// Get current absolute phase offset for debugging
    /// Returns absolute position in the full buffer
    pub fn get_absolute_phase_offset(&self) -> Option<usize> {
        self.absolute_phase_offset
    }
    
    /// Reset detector state
    pub fn reset(&mut self) {
        self.previous_zero_cross_index = None;
        self.previous_peak_index = None;
        self.segment_phase_offset = None;
        self.absolute_phase_offset = None;
    }
    
    /// Find a stable peak position with temporal continuity
    fn find_stable_peak(&mut self, data: &[f32], estimated_cycle_length: f32) -> Option<usize> {
        if let Some(prev_peak) = self.previous_peak_index {
            if estimated_cycle_length > 0.0 {
                let tolerance = (estimated_cycle_length * Self::ZERO_CROSS_SEARCH_TOLERANCE_CYCLES) as usize;
                let search_start = prev_peak.saturating_sub(tolerance);
                let search_end = (prev_peak + tolerance).min(data.len());
                
                if search_start < data.len() && search_start < search_end {
                    if let Some(peak) = find_peak(data, search_start, Some(search_end)) {
                        self.previous_peak_index = Some(peak);
                        return Some(peak);
                    }
                }
            }
        }
        
        // Fallback: find first peak
        if let Some(peak) = find_peak(data, 0, None) {
            self.previous_peak_index = Some(peak);
            Some(peak)
        } else {
            None
        }
    }
    
    /// Find a stable zero-cross position with temporal continuity
    fn find_stable_zero_cross(&mut self, data: &[f32], estimated_cycle_length: f32) -> Option<usize> {
        if let Some(prev_zero) = self.previous_zero_cross_index {
            if estimated_cycle_length > 0.0 {
                let tolerance = (estimated_cycle_length * Self::ZERO_CROSS_SEARCH_TOLERANCE_CYCLES) as usize;
                let search_start = prev_zero.saturating_sub(tolerance);
                
                if search_start < data.len() {
                    if let Some(zero_cross) = find_zero_cross(data, search_start) {
                        let distance = if zero_cross >= prev_zero {
                            zero_cross - prev_zero
                        } else {
                            prev_zero - zero_cross
                        };
                        
                        if distance <= tolerance {
                            self.previous_zero_cross_index = Some(zero_cross);
                            return Some(zero_cross);
                        }
                    }
                }
            }
        }
        
        // Fallback: find first zero-cross
        if let Some(zero_cross) = find_zero_cross(data, 0) {
            self.previous_zero_cross_index = Some(zero_cross);
            Some(zero_cross)
        } else {
            None
        }
    }
    
    /// Find phase zero position within a segment, maintaining history in absolute coordinates
    /// This method is designed for Process B (phase marker positioning) where the segment
    /// position can change between frames due to similarity search.
    /// 
    /// # Arguments
    /// * `segment` - The 4-cycle segment slice
    /// * `segment_start_abs` - Absolute position of the segment start in the full buffer
    /// * `estimated_cycle_length` - Length of one cycle in samples
    /// 
    /// # Returns
    /// The segment-relative index of phase 0, or None if not found
    /// 
    /// # Coordinate Spaces
    /// - Input `segment`: relative (0..segment.len())
    /// - Input `segment_start_abs`: absolute (full buffer position)
    /// - Internal history: absolute (full buffer position)
    /// - Return value: relative (0..segment.len())
    pub fn find_phase_zero_in_segment(
        &mut self,
        segment: &[f32],
        segment_start_abs: usize,
        estimated_cycle_length: f32,
    ) -> Option<usize> {
        // If we don't have history or invalid cycle length, perform initial detection
        if self.absolute_phase_offset.is_none() || estimated_cycle_length < f32::EPSILON {
            // Initial detection based on current mode
            let zero_cross_rel = match self.zero_cross_mode {
                ZeroCrossMode::Standard => {
                    find_zero_cross(segment, 0)
                }
                ZeroCrossMode::PeakBacktrackWithHistory => {
                    // Find peak and backtrack
                    let search_end = if estimated_cycle_length > 0.0 {
                        (estimated_cycle_length * Self::PEAK_SEARCH_MULTIPLIER) as usize
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

            // Issue #296: Constrain initial position to central 2 cycles (cycles 1-3 of 4-cycle segment)
            let mut constrained_rel = zero_cross_rel;
            if estimated_cycle_length > f32::EPSILON {
                let cycle_length_usize = estimated_cycle_length as usize;
                let min_allowed = cycle_length_usize; // Start of cycle 1
                let max_allowed = cycle_length_usize * 3; // End of cycle 3

                // If initial detection is outside the allowed range, search within the central 2 cycles
                if constrained_rel < min_allowed || constrained_rel > max_allowed {
                    // Search for zero-cross starting from cycle 1
                    if let Some(zero_in_center) = find_zero_cross(segment, min_allowed) {
                        if zero_in_center <= max_allowed {
                            constrained_rel = zero_in_center;
                        }
                    }
                }
            }

            // Convert to absolute and store
            let zero_cross_abs = segment_start_abs + constrained_rel;
            self.absolute_phase_offset = Some(zero_cross_abs);
            return Some(constrained_rel);
        }
        
        // We have history - use new algorithm (Issue #289)
        // Extract all zero-cross candidates from 4-cycle buffer, then move toward nearest candidate
        let history_abs = self.absolute_phase_offset.unwrap();

        // Convert absolute history to segment-relative
        // Check if history is within the current segment
        if history_abs < segment_start_abs || history_abs >= segment_start_abs + segment.len() {
            // History is outside current segment - perform fresh detection
            let zero_cross_rel = find_zero_cross(segment, 0)?;

            // Issue #296: Constrain fresh detection to central 2 cycles (cycles 1-3 of 4-cycle segment)
            let mut constrained_rel = zero_cross_rel;
            if estimated_cycle_length > f32::EPSILON {
                let cycle_length_usize = estimated_cycle_length as usize;
                let min_allowed = cycle_length_usize; // Start of cycle 1
                let max_allowed = cycle_length_usize * 3; // End of cycle 3

                // If detection is outside the allowed range, search within the central 2 cycles
                if constrained_rel < min_allowed || constrained_rel > max_allowed {
                    // Search for zero-cross starting from cycle 1
                    if let Some(zero_in_center) = find_zero_cross(segment, min_allowed) {
                        if zero_in_center <= max_allowed {
                            constrained_rel = zero_in_center;
                        }
                    }
                }
            }

            let zero_cross_abs = segment_start_abs + constrained_rel;
            self.absolute_phase_offset = Some(zero_cross_abs);
            return Some(constrained_rel);
        }

        let history_rel = history_abs - segment_start_abs;

        // Calculate 1% tolerance for movement constraint
        let tolerance = ((estimated_cycle_length * Self::HISTORY_SEARCH_TOLERANCE_RATIO) as usize).max(1);

        // Issue #296: Calculate allowed range for central 2 cycles (cycles 1-3 of 4-cycle segment)
        let cycle_length_usize = estimated_cycle_length as usize;
        let min_allowed = cycle_length_usize; // Start of cycle 1
        let max_allowed = cycle_length_usize * 3; // End of cycle 3

        // Find the nearest zero-cross candidate in a single pass (avoiding Vec allocation)
        // Only search within the central 2 cycles to prevent markers from disappearing at edges
        let mut nearest_candidate: Option<usize> = None;
        let mut min_distance = usize::MAX;

        let search_start = min_allowed.min(segment.len().saturating_sub(1));
        let search_end = max_allowed.min(segment.len().saturating_sub(1));

        for i in search_start..search_end {
            if segment[i] <= 0.0 && segment[i + 1] > 0.0 {
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

        // If no candidates exist, don't move (keep history)
        let nearest = match nearest_candidate {
            Some(n) => n,
            None => return Some(history_rel),
        };

        // Determine direction to move toward the nearest candidate
        if nearest == history_rel {
            // Already at a zero-cross, no movement needed
            return Some(history_rel);
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

        // Issue #296: Constrain phase marker to central 2 cycles (cycles 1-3 of 4-cycle segment)
        // This prevents markers from disappearing at the left edge by using first and last cycles as safety margins
        let cycle_length_usize = estimated_cycle_length as usize;
        let min_allowed = cycle_length_usize; // Start of cycle 1
        let max_allowed = cycle_length_usize * 3; // End of cycle 3

        // Clamp new_rel to the allowed range
        if new_rel < min_allowed {
            new_rel = min_allowed;
        } else if new_rel > max_allowed && max_allowed < segment.len() {
            new_rel = max_allowed;
        }

        // Update history with new absolute position (continuous)
        let new_abs = segment_start_abs + new_rel;
        self.absolute_phase_offset = Some(new_abs);

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
    
    /// Calculate display range based on zero-crossing or peak detection
    pub fn calculate_display_range(
        &mut self,
        data: &[f32],
        estimated_frequency: f32,
        sample_rate: f32,
    ) -> Option<DisplayRange> {
        let estimated_cycle_length = if estimated_frequency > 0.0 && sample_rate > 0.0 {
            sample_rate / estimated_frequency
        } else {
            0.0
        };
        
        if self.use_peak_mode {
            // Peak mode
            let first_peak = self.find_stable_peak(data, estimated_cycle_length)?;
            let second_peak = if estimated_cycle_length > 0.0 {
                find_next_peak(data, first_peak, estimated_cycle_length)
            } else {
                None
            };
            
            // Display CYCLES_TO_DISPLAY (4) cycles worth of waveform
            let end_index = if estimated_cycle_length > 0.0 {
                let waveform_length = (estimated_cycle_length * Self::CYCLES_TO_DISPLAY as f32).floor() as usize;
                (first_peak + waveform_length).min(data.len())
            } else {
                data.len()
            };
            
            Some(DisplayRange {
                start_index: first_peak,
                end_index,
                first_zero_cross: first_peak, // Alignment point (peak in peak mode)
                second_zero_cross: second_peak, // Second alignment point (peak in peak mode)
            })
        } else {
            // Zero-crossing mode - choose method based on zero_cross_mode
            let first_zero = match self.zero_cross_mode {
                ZeroCrossMode::Standard => {
                    self.find_stable_zero_cross(data, estimated_cycle_length)?
                }
                ZeroCrossMode::PeakBacktrackWithHistory => {
                    find_zero_cross_peak_backtrack_with_history(
                        data,
                        estimated_cycle_length,
                        &mut self.segment_phase_offset,
                        Self::HISTORY_SEARCH_TOLERANCE_RATIO,
                    )?
                }
                ZeroCrossMode::BidirectionalNearest => {
                    find_zero_cross_bidirectional_nearest(
                        data,
                        estimated_cycle_length,
                        &mut self.segment_phase_offset,
                        Self::HISTORY_SEARCH_TOLERANCE_RATIO,
                        Self::MAX_SEARCH_RANGE_MULTIPLIER,
                    )?
                }
                ZeroCrossMode::GradientBased => {
                    find_zero_cross_gradient_based(
                        data,
                        estimated_cycle_length,
                        &mut self.segment_phase_offset,
                        Self::HISTORY_SEARCH_TOLERANCE_RATIO,
                    )?
                }
                ZeroCrossMode::AdaptiveStep => {
                    find_zero_cross_adaptive_step(
                        data,
                        estimated_cycle_length,
                        &mut self.segment_phase_offset,
                        Self::HISTORY_SEARCH_TOLERANCE_RATIO,
                    )?
                }
                ZeroCrossMode::Hysteresis => {
                    find_zero_cross_hysteresis(
                        data,
                        estimated_cycle_length,
                        &mut self.segment_phase_offset,
                        Self::HISTORY_SEARCH_TOLERANCE_RATIO,
                        Self::HYSTERESIS_THRESHOLD_RATIO,
                        Self::MAX_SEARCH_RANGE_MULTIPLIER,
                    )?
                }
                ZeroCrossMode::ClosestToZero => {
                    find_zero_cross_closest_to_zero(
                        data,
                        estimated_cycle_length,
                        &mut self.segment_phase_offset,
                        Self::HISTORY_SEARCH_TOLERANCE_RATIO,
                    )?
                }
            };
            
            let second_zero = find_next_zero_cross(data, first_zero);
            
            // Display CYCLES_TO_DISPLAY (4) cycles worth of waveform
            let end_index = if estimated_cycle_length > 0.0 {
                let waveform_length = (estimated_cycle_length * Self::CYCLES_TO_DISPLAY as f32).floor() as usize;
                (first_zero + waveform_length).min(data.len())
            } else {
                data.len()
            };
            
            Some(DisplayRange {
                start_index: first_zero,
                end_index,
                first_zero_cross: first_zero,
                second_zero_cross: second_zero,
            })
        }
    }
}
