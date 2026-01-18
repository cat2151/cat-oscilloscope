/// Zero-cross detection mode
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ZeroCrossMode {
    /// Standard mode: find zero-cross with temporal continuity (0.5 cycle tolerance)
    Standard,
    /// Peak backtrack mode with history: find peak, backtrack to zero-cross, then use history-based search
    /// This mode significantly reduces phase 0 position oscillation to within 1% of cycle length
    PeakBacktrackWithHistory,
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
    // History for PeakBacktrackWithHistory mode
    history_zero_cross_index: Option<usize>,
}

impl ZeroCrossDetector {
    const ZERO_CROSS_SEARCH_TOLERANCE_CYCLES: f32 = 0.5;
    /// Tolerance for history-based search (1/100 of one cycle = 1%)
    const HISTORY_SEARCH_TOLERANCE_RATIO: f32 = 0.01;
    /// Number of cycles to display (must match CYCLES_TO_STORE in waveform_searcher)
    const CYCLES_TO_DISPLAY: usize = 4;
    
    pub fn new() -> Self {
        ZeroCrossDetector {
            previous_zero_cross_index: None,
            previous_peak_index: None,
            use_peak_mode: false,
            zero_cross_mode: ZeroCrossMode::PeakBacktrackWithHistory,
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
        let tolerance = (estimated_cycle_length * Self::HISTORY_SEARCH_TOLERANCE_RATIO) as usize;
        let tolerance = tolerance.max(1); // Ensure at least 1 sample tolerance
        
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
    
    /// Find zero-crossing by looking backward from a given position
    /// Returns the index where the zero-crossing occurs (data[i] <= 0.0 && data[i+1] > 0.0)
    fn find_zero_crossing_backward(&self, data: &[f32], start_index: usize) -> Option<usize> {
        if start_index == 0 || start_index >= data.len() {
            return None;
        }
        
        // Look backward from start_index
        for i in (1..=start_index).rev() {
            if i < data.len() && data[i - 1] <= 0.0 && data[i] > 0.0 {
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
