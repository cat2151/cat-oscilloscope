/// Zero-cross detection mode
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ZeroCrossMode {
    /// Standard mode: find zero-cross with temporal continuity (0.5 cycle tolerance)
    Standard,
    /// Peak backtrack mode with history: find peak, backtrack to zero-cross, then use history-based search
    /// This mode significantly reduces phase 0 position oscillation to within 1% of cycle length
    PeakBacktrackWithHistory,
    /// Bidirectional nearest search: searches forward/backward for nearest zero-cross, moves gradually
    BidirectionalNearest,
    /// Gradient-based movement: uses signal value to determine direction toward zero-cross
    GradientBased,
    /// Adaptive step movement: adjusts step size based on distance to nearest zero-cross
    AdaptiveStep,
    /// Hysteresis-based movement: far=gradual, near=direct jump with hysteresis to prevent oscillation (default)
    Hysteresis,
    /// Closest to zero: selects the sample with value closest to zero within tolerance range
    ClosestToZero,
}

/// DisplayRangeは計算された表示範囲とアライメント点（ゼロクロスまたはピーク）を含みます
pub struct DisplayRange {
    pub start_index: usize,
    pub end_index: usize,
    pub first_zero_cross: usize,
    pub second_zero_cross: Option<usize>,
}

/// ZeroCrossDetector handles zero-crossing detection and display range calculation
pub struct ZeroCrossDetector {
    previous_zero_cross_index: Option<usize>,
    previous_peak_index: Option<usize>,
    use_peak_mode: bool,
    zero_cross_mode: ZeroCrossMode,
    // History for segment-relative position tracking (for PeakBacktrackWithHistory and other modes)
    // This stores the position within the 4-cycle segment (0..segment_len), not absolute buffer position
    // This ensures the 1% constraint works correctly when called on different segments each frame
    history_zero_cross_index: Option<usize>,
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
    
    pub fn new() -> Self {
        ZeroCrossDetector {
            previous_zero_cross_index: None,
            previous_peak_index: None,
            use_peak_mode: false,
            zero_cross_mode: ZeroCrossMode::Hysteresis,
            history_zero_cross_index: None,
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
        self.history_zero_cross_index = None;
    }
    
    /// Get current zero-cross detection mode
    pub fn get_zero_cross_mode(&self) -> ZeroCrossMode {
        self.zero_cross_mode
    }
    
    /// Reset detector state
    pub fn reset(&mut self) {
        self.previous_zero_cross_index = None;
        self.previous_peak_index = None;
        self.history_zero_cross_index = None;
    }
    
    /// Find peak point (maximum absolute amplitude) in the waveform
    fn find_peak(&self, data: &[f32], start_index: usize, end_index: Option<usize>) -> Option<usize> {
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
    fn find_next_peak(&self, data: &[f32], start_index: usize, cycle_length: f32) -> Option<usize> {
        let search_start = start_index + 1;
        let search_end = (search_start + (cycle_length * 1.5) as usize).min(data.len());
        
        if search_start >= data.len() {
            return None;
        }
        
        self.find_peak(data, search_start, Some(search_end))
    }
    
    /// Find zero-cross point where signal crosses from negative to positive
    fn find_zero_cross(&self, data: &[f32], start_index: usize) -> Option<usize> {
        for i in start_index..data.len() - 1 {
            if data[i] <= 0.0 && data[i + 1] > 0.0 {
                return Some(i);
            }
        }
        None
    }
    
    /// Find the next zero-cross point after the given index
    fn find_next_zero_cross(&self, data: &[f32], start_index: usize) -> Option<usize> {
        let search_start = start_index + 1;
        if search_start >= data.len() {
            return None;
        }
        self.find_zero_cross(data, search_start)
    }
    
    /// Find a stable peak position with temporal continuity
    fn find_stable_peak(&mut self, data: &[f32], estimated_cycle_length: f32) -> Option<usize> {
        if let Some(prev_peak) = self.previous_peak_index {
            if estimated_cycle_length > 0.0 {
                let tolerance = (estimated_cycle_length * Self::ZERO_CROSS_SEARCH_TOLERANCE_CYCLES) as usize;
                let search_start = prev_peak.saturating_sub(tolerance);
                let search_end = (prev_peak + tolerance).min(data.len());
                
                if search_start < data.len() && search_start < search_end {
                    if let Some(peak) = self.find_peak(data, search_start, Some(search_end)) {
                        self.previous_peak_index = Some(peak);
                        return Some(peak);
                    }
                }
            }
        }
        
        // Fallback: find first peak
        if let Some(peak) = self.find_peak(data, 0, None) {
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
                    if let Some(zero_cross) = self.find_zero_cross(data, search_start) {
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
        if let Some(zero_cross) = self.find_zero_cross(data, 0) {
            self.previous_zero_cross_index = Some(zero_cross);
            Some(zero_cross)
        } else {
            None
        }
    }
    
    /// Find zero-cross using peak backtrack with history mode
    /// Initial call: find peak, backtrack to zero-cross, store as history
    /// Subsequent calls: if current position is not a zero-cross, search forward/backward
    /// within 1/100 of one cycle from the history position
    fn find_zero_cross_peak_backtrack_with_history(
        &mut self,
        data: &[f32],
        estimated_cycle_length: f32,
    ) -> Option<usize> {
        // If we don't have history or invalid cycle length, perform initial detection
        if self.history_zero_cross_index.is_none() || estimated_cycle_length <= 0.0 {
            // Find peak in the first part of the waveform
            let search_end = if estimated_cycle_length > 0.0 {
                (estimated_cycle_length * 1.5) as usize
            } else {
                data.len() / 2
            };
            
            if let Some(peak_idx) = self.find_peak(data, 0, Some(search_end.min(data.len()))) {
                // Backtrack from peak to find zero-cross
                if let Some(zero_cross_idx) = self.find_zero_crossing_backward(data, peak_idx) {
                    // Store as history
                    self.history_zero_cross_index = Some(zero_cross_idx);
                    return Some(zero_cross_idx);
                }
            }
            
            // Fallback: find first zero-cross
            if let Some(zero_cross) = self.find_zero_cross(data, 0) {
                self.history_zero_cross_index = Some(zero_cross);
                return Some(zero_cross);
            }
            
            return None;
        }
        
        // We have history - use it to search with tight tolerance (1/100 of cycle)
        let history_idx = self.history_zero_cross_index.unwrap();
        let tolerance = ((estimated_cycle_length * Self::HISTORY_SEARCH_TOLERANCE_RATIO) as usize).max(1);
        
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
                self.history_zero_cross_index = Some(i);
                return Some(i);
            }
        }
        
        // No zero-cross found in tolerance range - keep using history position
        // but try to find the nearest zero-cross for next frame
        if let Some(zero_cross) = self.find_zero_cross(data, search_start) {
            let distance = if zero_cross >= history_idx {
                zero_cross - history_idx
            } else {
                history_idx - zero_cross
            };
            
            // Only update history if the new zero-cross is reasonably close
            if distance <= tolerance * 3 {
                self.history_zero_cross_index = Some(zero_cross);
                return Some(zero_cross);
            }
        }
        
        // Return history position as last resort
        Some(history_idx)
    }
    
    /// Bidirectional nearest search algorithm
    /// Searches both forward and backward for the nearest zero-cross and moves gradually toward it
    fn find_zero_cross_bidirectional_nearest(
        &mut self,
        data: &[f32],
        estimated_cycle_length: f32,
    ) -> Option<usize> {
        // Initialize history if needed
        if self.history_zero_cross_index.is_none() || estimated_cycle_length <= 0.0 {
            return self.initialize_history(data, estimated_cycle_length);
        }
        
        let history_idx = self.history_zero_cross_index.unwrap();
        let tolerance = ((estimated_cycle_length * Self::HISTORY_SEARCH_TOLERANCE_RATIO) as usize).max(1);
        
        // Check if history is still a zero-cross
        if history_idx < data.len() - 1 && data[history_idx] <= 0.0 && data[history_idx + 1] > 0.0 {
            return Some(history_idx);
        }
        
        // Search in tolerance range first
        let search_start = history_idx.saturating_sub(tolerance);
        let search_end = (history_idx + tolerance).min(data.len());
        
        for i in search_start..search_end.saturating_sub(1) {
            if data[i] <= 0.0 && data[i + 1] > 0.0 {
                self.history_zero_cross_index = Some(i);
                return Some(i);
            }
        }
        
        // Search broader range for nearest zero-cross
        let max_search = (estimated_cycle_length * Self::MAX_SEARCH_RANGE_MULTIPLIER) as usize;
        let forward_zc = self.find_zero_cross(data, history_idx + 1)
            .filter(|&idx| idx <= history_idx + max_search);
        let backward_zc = self.find_zero_crossing_backward(data, history_idx.saturating_sub(1))
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
                self.history_zero_cross_index = Some(new_pos);
                Some(new_pos)
            }
            (Some(fwd), None) => {
                let new_pos = history_idx + tolerance.min(fwd - history_idx);
                self.history_zero_cross_index = Some(new_pos);
                Some(new_pos)
            }
            (None, Some(bwd)) => {
                let new_pos = history_idx.saturating_sub(tolerance.min(history_idx - bwd));
                self.history_zero_cross_index = Some(new_pos);
                Some(new_pos)
            }
            (None, None) => Some(history_idx),
        }
    }
    
    /// Gradient-based movement algorithm
    /// Uses the signal value to determine direction toward zero-cross
    fn find_zero_cross_gradient_based(
        &mut self,
        data: &[f32],
        estimated_cycle_length: f32,
    ) -> Option<usize> {
        if self.history_zero_cross_index.is_none() || estimated_cycle_length <= 0.0 {
            return self.initialize_history(data, estimated_cycle_length);
        }
        
        let history_idx = self.history_zero_cross_index.unwrap();
        let tolerance = ((estimated_cycle_length * Self::HISTORY_SEARCH_TOLERANCE_RATIO) as usize).max(1);
        
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
                self.history_zero_cross_index = Some(i);
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
        
        self.history_zero_cross_index = Some(new_pos);
        Some(new_pos)
    }
    
    /// Adaptive step movement algorithm
    /// Adjusts step size based on distance to nearest zero-cross
    fn find_zero_cross_adaptive_step(
        &mut self,
        data: &[f32],
        estimated_cycle_length: f32,
    ) -> Option<usize> {
        if self.history_zero_cross_index.is_none() || estimated_cycle_length <= 0.0 {
            return self.initialize_history(data, estimated_cycle_length);
        }
        
        let history_idx = self.history_zero_cross_index.unwrap();
        let tolerance = ((estimated_cycle_length * Self::HISTORY_SEARCH_TOLERANCE_RATIO) as usize).max(1);
        
        // Check if history is a zero-cross
        if history_idx < data.len() - 1 && data[history_idx] <= 0.0 && data[history_idx + 1] > 0.0 {
            return Some(history_idx);
        }
        
        // Search in tolerance range
        let search_start = history_idx.saturating_sub(tolerance);
        let search_end = (history_idx + tolerance).min(data.len());
        
        for i in search_start..search_end.saturating_sub(1) {
            if data[i] <= 0.0 && data[i + 1] > 0.0 {
                self.history_zero_cross_index = Some(i);
                return Some(i);
            }
        }
        
        // Find nearest zero-cross in broader range
        let max_search = estimated_cycle_length as usize;
        let forward_zc = self.find_zero_cross(data, history_idx + 1)
            .filter(|&idx| idx <= history_idx + max_search);
        let backward_zc = self.find_zero_crossing_backward(data, history_idx.saturating_sub(1))
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
                
                self.history_zero_cross_index = Some(new_pos);
                Some(new_pos)
            }
            (Some(fwd), None) => {
                let step = (fwd - history_idx).min(tolerance);
                let new_pos = history_idx + step;
                self.history_zero_cross_index = Some(new_pos);
                Some(new_pos)
            }
            (None, Some(bwd)) => {
                let step = (history_idx - bwd).min(tolerance);
                let new_pos = history_idx.saturating_sub(step);
                self.history_zero_cross_index = Some(new_pos);
                Some(new_pos)
            }
            (None, None) => Some(history_idx),
        }
    }
    
    /// Hysteresis-based movement algorithm (recommended)
    /// Far from zero-cross: moves gradually; Near: jumps directly with hysteresis to prevent oscillation
    fn find_zero_cross_hysteresis(
        &mut self,
        data: &[f32],
        estimated_cycle_length: f32,
    ) -> Option<usize> {
        if self.history_zero_cross_index.is_none() || estimated_cycle_length <= 0.0 {
            return self.initialize_history(data, estimated_cycle_length);
        }
        
        let history_idx = self.history_zero_cross_index.unwrap();
        let tolerance = ((estimated_cycle_length * Self::HISTORY_SEARCH_TOLERANCE_RATIO) as usize).max(1);
        
        // Check if history is a zero-cross
        if history_idx < data.len() - 1 && data[history_idx] <= 0.0 && data[history_idx + 1] > 0.0 {
            return Some(history_idx);
        }
        
        // Search in tolerance range
        let search_start = history_idx.saturating_sub(tolerance);
        let search_end = (history_idx + tolerance).min(data.len());
        
        for i in search_start..search_end.saturating_sub(1) {
            if data[i] <= 0.0 && data[i + 1] > 0.0 {
                self.history_zero_cross_index = Some(i);
                return Some(i);
            }
        }
        
        // Find nearest zero-cross in extended range
        let max_search = (tolerance as f32 * Self::MAX_SEARCH_RANGE_MULTIPLIER) as usize;
        let forward_zc = self.find_zero_cross(data, history_idx + 1)
            .filter(|&idx| idx <= history_idx + max_search);
        let backward_zc = self.find_zero_crossing_backward(data, history_idx.saturating_sub(1))
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
                let hysteresis_threshold = (tolerance as f32 * Self::HYSTERESIS_THRESHOLD_RATIO) as usize;
                
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
                
                self.history_zero_cross_index = Some(new_pos);
                Some(new_pos)
            }
            (Some(fwd), None) => {
                let distance = fwd - history_idx;
                let hysteresis_threshold = (tolerance as f32 * Self::HYSTERESIS_THRESHOLD_RATIO) as usize;
                let new_pos = if distance > hysteresis_threshold {
                    history_idx + tolerance
                } else {
                    fwd
                };
                self.history_zero_cross_index = Some(new_pos);
                Some(new_pos)
            }
            (None, Some(bwd)) => {
                let distance = history_idx - bwd;
                let hysteresis_threshold = (tolerance as f32 * Self::HYSTERESIS_THRESHOLD_RATIO) as usize;
                let new_pos = if distance > hysteresis_threshold {
                    history_idx.saturating_sub(tolerance)
                } else {
                    bwd
                };
                self.history_zero_cross_index = Some(new_pos);
                Some(new_pos)
            }
            (None, None) => Some(history_idx),
        }
    }
    
    /// Closest to zero algorithm
    /// Selects the sample with value closest to zero within tolerance range
    fn find_zero_cross_closest_to_zero(
        &mut self,
        data: &[f32],
        estimated_cycle_length: f32,
    ) -> Option<usize> {
        if self.history_zero_cross_index.is_none() || estimated_cycle_length <= 0.0 {
            return self.initialize_history(data, estimated_cycle_length);
        }
        
        let history_idx = self.history_zero_cross_index.unwrap();
        let tolerance = ((estimated_cycle_length * Self::HISTORY_SEARCH_TOLERANCE_RATIO) as usize).max(1);
        
        // Check if history is a zero-cross
        if history_idx < data.len() - 1 && data[history_idx] <= 0.0 && data[history_idx + 1] > 0.0 {
            return Some(history_idx);
        }
        
        // Search in tolerance range for actual zero-cross
        let search_start = history_idx.saturating_sub(tolerance);
        let search_end = (history_idx + tolerance).min(data.len());
        
        for i in search_start..search_end.saturating_sub(1) {
            if data[i] <= 0.0 && data[i + 1] > 0.0 {
                self.history_zero_cross_index = Some(i);
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
        
        self.history_zero_cross_index = Some(closest_idx);
        Some(closest_idx)
    }
    
    /// Helper function to initialize history (used by all new algorithms)
    fn initialize_history(&mut self, data: &[f32], estimated_cycle_length: f32) -> Option<usize> {
        let search_end = if estimated_cycle_length > 0.0 {
            (estimated_cycle_length * 1.5) as usize
        } else {
            data.len() / 2
        };
        
        if let Some(peak_idx) = self.find_peak(data, 0, Some(search_end.min(data.len()))) {
            if let Some(zero_cross_idx) = self.find_zero_crossing_backward(data, peak_idx) {
                self.history_zero_cross_index = Some(zero_cross_idx);
                return Some(zero_cross_idx);
            }
        }
        
        // Fallback: find first zero-cross
        if let Some(zero_cross) = self.find_zero_cross(data, 0) {
            self.history_zero_cross_index = Some(zero_cross);
            return Some(zero_cross);
        }
        
        None
    }
    
    /// Find zero-crossing by looking backward from a given position
    /// Returns the index where the zero-crossing occurs (data[i] <= 0.0 && data[i+1] > 0.0)
    fn find_zero_crossing_backward(&self, data: &[f32], start_index: usize) -> Option<usize> {
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
                self.find_next_peak(data, first_peak, estimated_cycle_length)
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
                    self.find_zero_cross_peak_backtrack_with_history(data, estimated_cycle_length)?
                }
                ZeroCrossMode::BidirectionalNearest => {
                    self.find_zero_cross_bidirectional_nearest(data, estimated_cycle_length)?
                }
                ZeroCrossMode::GradientBased => {
                    self.find_zero_cross_gradient_based(data, estimated_cycle_length)?
                }
                ZeroCrossMode::AdaptiveStep => {
                    self.find_zero_cross_adaptive_step(data, estimated_cycle_length)?
                }
                ZeroCrossMode::Hysteresis => {
                    self.find_zero_cross_hysteresis(data, estimated_cycle_length)?
                }
                ZeroCrossMode::ClosestToZero => {
                    self.find_zero_cross_closest_to_zero(data, estimated_cycle_length)?
                }
            };
            
            let second_zero = self.find_next_zero_cross(data, first_zero);
            
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
