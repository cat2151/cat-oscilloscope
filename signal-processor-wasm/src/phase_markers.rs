use super::{WasmDataProcessor, CYCLES_TO_STORE};

impl WasmDataProcessor {
    /// Calculate phase marker positions for the waveform
    /// Returns (phase_0, phase_2pi, phase_-pi/4, phase_2pi+pi/4) as sample indices
    ///
    /// Uses zero_cross_detector to find phase 0 position within the displayed 4-cycle segment,
    /// respecting the dropdown selection (Hysteresis, Peak+History with 1% constraint, etc.)
    pub(crate) fn calculate_phase_markers(
        &mut self,
        data: &[f32],
        segment_buffer_position: usize,
        cycle_length: f32,
        _estimated_frequency: f32,
        _sample_rate: f32,
    ) -> (Option<usize>, Option<usize>, Option<usize>, Option<usize>) {
        let (phase_zero, phase_2pi, phase_minus_quarter_pi, phase_2pi_plus_quarter_pi, _, _, _) =
            self.calculate_phase_markers_with_debug(
                data,
                segment_buffer_position,
                cycle_length,
                estimated_frequency,
                sample_rate,
            );
        (
            phase_zero,
            phase_2pi,
            phase_minus_quarter_pi,
            phase_2pi_plus_quarter_pi,
        )
    }

    /// Calculate phase marker positions with debug information
    /// Returns (phase_0, phase_2pi, phase_-pi/4, phase_2pi+pi/4, segment_relative, history, tolerance)
    pub(crate) fn calculate_phase_markers_with_debug(
        &mut self,
        data: &[f32],
        segment_buffer_position: usize,
        cycle_length: f32,
        estimated_frequency: f32,
        sample_rate: f32,
    ) -> (
        Option<usize>,
        Option<usize>,
        Option<usize>,
        Option<usize>,
        Option<usize>,
        Option<usize>,
        Option<usize>,
    ) {
        // If we don't have a valid cycle length, can't calculate phase
        if cycle_length <= 0.0 || !cycle_length.is_finite() {
            return (None, None, None, None, None, None, None);
        }

        // Extract the 4-cycle segment for zero-cross detection
        let segment_length = (cycle_length * CYCLES_TO_STORE as f32).floor() as usize;
        let segment_end = (segment_buffer_position + segment_length).min(data.len());

        if segment_buffer_position >= segment_end {
            return (None, None, None, None, None, None, None);
        }

        let segment = &data[segment_buffer_position..segment_end];

        // Capture history before calling find_phase_zero_in_segment
        let history_before = self.zero_cross_detector.get_absolute_phase_offset();

        // Calculate 1% tolerance for debugging
        let tolerance = ((cycle_length * 0.01) as usize).max(1);

        // Use zero_cross_detector to find phase 0 within the segment
        // This respects the dropdown selection (Hysteresis, Peak+History 1%, etc.)
        // The new method maintains history in absolute coordinates to handle segment position changes
        let phase_zero_segment_relative = match self.zero_cross_detector.find_phase_zero_in_segment(
            segment,
            segment_buffer_position,
            cycle_length,
        ) {
            Some(idx) => idx,
            None => return (None, None, None, None, None, history_before, Some(tolerance)),
        };

        // Convert to frame buffer position (absolute index in full data buffer)
        let phase_zero = segment_buffer_position + phase_zero_segment_relative;

        // Phase 2π is one cycle after phase 0
        let phase_2pi_idx = phase_zero + cycle_length as usize;

        // Phase -π/4 is 1/8 cycle before phase 0 (π/4 = 1/8 of 2π)
        let eighth_cycle = (cycle_length / 8.0) as usize;

        // Check if phase_zero is large enough to subtract eighth_cycle
        let phase_minus_quarter_pi = if phase_zero >= eighth_cycle {
            Some(phase_zero - eighth_cycle)
        } else {
            None
        };

        // Phase 2π+π/4 is 1/8 cycle after phase 2π (π/4 = 1/8 of 2π)
        let phase_2pi_plus_quarter_pi_idx = phase_2pi_idx + eighth_cycle;

        // Ensure indices are within the data bounds
        let phase_2pi = if phase_2pi_idx < data.len() {
            Some(phase_2pi_idx)
        } else {
            None
        };

        let phase_2pi_plus_quarter_pi = if phase_2pi_plus_quarter_pi_idx < data.len() {
            Some(phase_2pi_plus_quarter_pi_idx)
        } else {
            None
        };

        (
            Some(phase_zero),
            phase_2pi,
            phase_minus_quarter_pi,
            phase_2pi_plus_quarter_pi,
            Some(phase_zero_segment_relative),
            history_before,
            Some(tolerance),
        )
    }
}
