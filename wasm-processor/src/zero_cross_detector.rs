/// DisplayRange contains the calculated display range and alignment points
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
}

impl ZeroCrossDetector {
    const ZERO_CROSS_SEARCH_TOLERANCE_CYCLES: f32 = 0.5;
    
    pub fn new() -> Self {
        ZeroCrossDetector {
            previous_zero_cross_index: None,
            previous_peak_index: None,
            use_peak_mode: false,
        }
    }
    
    /// Set whether to use peak mode instead of zero-crossing mode
    pub fn set_use_peak_mode(&mut self, enabled: bool) {
        self.use_peak_mode = enabled;
    }
    
    /// Reset detector state
    pub fn reset(&mut self) {
        self.previous_zero_cross_index = None;
        self.previous_peak_index = None;
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
            
            let end_index = if let Some(second) = second_peak {
                second
            } else if estimated_cycle_length > 0.0 {
                (first_peak + estimated_cycle_length as usize).min(data.len())
            } else {
                data.len()
            };
            
            Some(DisplayRange {
                start_index: first_peak,
                end_index,
                first_zero_cross: first_peak,
                second_zero_cross: second_peak,
            })
        } else {
            // Zero-crossing mode
            let first_zero = self.find_stable_zero_cross(data, estimated_cycle_length)?;
            let second_zero = self.find_next_zero_cross(data, first_zero);
            
            let end_index = if let Some(second) = second_zero {
                second
            } else if estimated_cycle_length > 0.0 {
                (first_zero + estimated_cycle_length as usize).min(data.len())
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
