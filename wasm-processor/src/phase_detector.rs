use std::f32::consts::PI;

/// PhaseDetector handles phase-based waveform alignment
/// This is particularly useful for waveforms with subharmonics (e.g., 1/4 harmonic)
/// where zero-crossing detection may be unstable
pub struct PhaseDetector {
    previous_phase: Option<f32>,
    previous_alignment_index: Option<usize>,
}

impl PhaseDetector {
    const PHASE_SEARCH_TOLERANCE_CYCLES: f32 = 0.5;
    /// Number of cycles to display (must match CYCLES_TO_STORE in waveform_searcher)
    const CYCLES_TO_DISPLAY: usize = 4;
    
    pub fn new() -> Self {
        PhaseDetector {
            previous_phase: None,
            previous_alignment_index: None,
        }
    }
    
    /// Reset detector state
    pub fn reset(&mut self) {
        self.previous_phase = None;
        self.previous_alignment_index = None;
    }
    
    /// Detect the phase at a given position using DFT
    /// Returns phase in radians [-π, π]
    fn detect_phase_at_position(
        &self,
        data: &[f32],
        start_index: usize,
        frequency: f32,
        sample_rate: f32,
        window_size: usize,
    ) -> Option<f32> {
        let end_index = (start_index + window_size).min(data.len());
        if end_index <= start_index {
            return None;
        }
        
        let actual_window_size = end_index - start_index;
        if actual_window_size < 4 {
            return None;
        }
        
        // Calculate angular frequency
        let omega = 2.0 * PI * frequency / sample_rate;
        
        let mut real = 0.0f32;
        let mut imag = 0.0f32;
        
        // Apply Hann window and compute DFT for the fundamental frequency
        for i in 0..actual_window_size {
            let n = i + start_index;
            if n >= data.len() {
                break;
            }
            
            // Hann window
            let window_value = 0.5 * (1.0 - (2.0 * PI * i as f32 / (actual_window_size - 1) as f32).cos());
            let sample = data[n] * window_value;
            
            // DFT at fundamental frequency
            let angle = omega * i as f32;
            real += sample * angle.cos();
            imag -= sample * angle.sin();
        }
        
        // Calculate phase
        let phase = imag.atan2(real);
        Some(phase)
    }
    
    /// Find the point where phase is closest to 0 (or 2π)
    /// This provides stable alignment even for waveforms with subharmonics
    fn find_zero_phase_crossing(
        &self,
        data: &[f32],
        start_index: usize,
        frequency: f32,
        sample_rate: f32,
        cycle_length: f32,
    ) -> Option<usize> {
        // Window size for phase detection (1 cycle)
        let window_size = cycle_length.max(16.0) as usize;
        
        // Search range
        let search_end = (start_index + (cycle_length * 2.0) as usize).min(data.len());
        
        if start_index + window_size >= search_end {
            return None;
        }
        
        let mut best_index = start_index;
        let mut best_distance = std::f32::MAX;
        
        // Search for position with phase closest to 0
        let step = (cycle_length / 8.0).max(1.0) as usize; // Check 8 points per cycle
        
        for i in (start_index..search_end - window_size).step_by(step) {
            if let Some(phase) = self.detect_phase_at_position(data, i, frequency, sample_rate, window_size) {
                // Calculate distance to phase = 0 (considering wrapping at ±π)
                let distance = phase.abs().min((phase - 2.0 * PI).abs()).min((phase + 2.0 * PI).abs());
                
                if distance < best_distance {
                    best_distance = distance;
                    best_index = i;
                }
            }
        }
        
        // Refine to sample-level precision around best_index
        if best_distance < PI {
            let refine_start = best_index.saturating_sub(step);
            let refine_end = (best_index + step).min(search_end - window_size);
            
            for i in refine_start..refine_end {
                if let Some(phase) = self.detect_phase_at_position(data, i, frequency, sample_rate, window_size) {
                    let distance = phase.abs().min((phase - 2.0 * PI).abs()).min((phase + 2.0 * PI).abs());
                    
                    if distance < best_distance {
                        best_distance = distance;
                        best_index = i;
                    }
                }
            }
        }
        
        Some(best_index)
    }
    
    /// Find stable phase alignment point with temporal continuity
    fn find_stable_phase_alignment(
        &mut self,
        data: &[f32],
        frequency: f32,
        sample_rate: f32,
        cycle_length: f32,
    ) -> Option<usize> {
        if cycle_length <= 0.0 || frequency <= 0.0 {
            return None;
        }
        
        // If we have a previous alignment point, search near it
        let search_start = if let Some(prev_index) = self.previous_alignment_index {
            let tolerance = (cycle_length * Self::PHASE_SEARCH_TOLERANCE_CYCLES) as usize;
            prev_index.saturating_sub(tolerance)
        } else {
            0
        };
        
        // Find zero-phase crossing
        let alignment_index = self.find_zero_phase_crossing(
            data,
            search_start,
            frequency,
            sample_rate,
            cycle_length,
        )?;
        
        // Verify temporal continuity if we have previous alignment
        if let Some(prev_index) = self.previous_alignment_index {
            let distance = if alignment_index >= prev_index {
                alignment_index - prev_index
            } else {
                prev_index - alignment_index
            };
            
            let tolerance = (cycle_length * Self::PHASE_SEARCH_TOLERANCE_CYCLES) as usize;
            
            // If too far from previous position, it might be unstable
            if distance > tolerance {
                // Try to detect phase and see if it's consistent
                let window_size = cycle_length.max(16.0) as usize;
                if let Some(phase) = self.detect_phase_at_position(
                    data,
                    alignment_index,
                    frequency,
                    sample_rate,
                    window_size,
                ) {
                    self.previous_phase = Some(phase);
                }
            }
        }
        
        // Update state
        self.previous_alignment_index = Some(alignment_index);
        
        Some(alignment_index)
    }
    
    /// Calculate display range based on phase detection
    /// Returns (start_index, end_index, first_alignment_point, second_alignment_point)
    pub fn calculate_display_range(
        &mut self,
        data: &[f32],
        estimated_frequency: f32,
        sample_rate: f32,
    ) -> Option<(usize, usize, usize, Option<usize>)> {
        if estimated_frequency <= 0.0 || sample_rate <= 0.0 {
            return None;
        }
        
        let cycle_length = sample_rate / estimated_frequency;
        
        // Find stable phase alignment point
        let first_alignment = self.find_stable_phase_alignment(
            data,
            estimated_frequency,
            sample_rate,
            cycle_length,
        )?;
        
        // Display CYCLES_TO_DISPLAY (4) cycles worth of waveform
        let waveform_length = (cycle_length * Self::CYCLES_TO_DISPLAY as f32).floor() as usize;
        let end_index = (first_alignment + waveform_length).min(data.len());
        
        // Find second alignment point (one cycle later)
        let second_alignment = if first_alignment + (cycle_length as usize) < data.len() {
            Some(first_alignment + (cycle_length as usize))
        } else {
            None
        };
        
        Some((first_alignment, end_index, first_alignment, second_alignment))
    }
}
