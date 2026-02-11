use super::WasmDataProcessor;

impl WasmDataProcessor {
    /// Collect zero-cross candidates (negative-to-positive crossings) within the displayed segment
    pub(crate) fn collect_zero_cross_candidates(
        &self,
        data: &[f32],
        segment_start: usize,
        segment_end: usize,
    ) -> Vec<usize> {
        if segment_start >= segment_end || segment_start >= data.len() {
            return Vec::new();
        }

        let clamped_end = segment_end.min(data.len());
        let segment = &data[segment_start..clamped_end];
        if segment.len() < 2 {
            return Vec::new();
        }

        let mut candidates = Vec::new();
        let mut search_pos = 0usize;

        while search_pos + 1 < segment.len() {
            let mut found: Option<usize> = None;
            for i in search_pos..segment.len() - 1 {
                if segment[i] <= 0.0 && segment[i + 1] > 0.0 {
                    found = Some(i);
                    break;
                }
            }

            if let Some(rel_idx) = found {
                candidates.push(segment_start + rel_idx);
                let next_search = rel_idx + 1;
                if next_search + 1 >= segment.len() {
                    break;
                }
                search_pos = next_search;
            } else {
                break;
            }
        }

        candidates
    }

    /// Select the zero-cross candidate whose interval to the next candidate contains the maximum positive peak
    pub(crate) fn select_candidate_with_max_positive_peak(
        &self,
        data: &[f32],
        segment_start: usize,
        segment_end: usize,
        candidates: &[usize],
    ) -> Option<usize> {
        if candidates.is_empty() || segment_start >= segment_end || segment_start >= data.len() {
            return None;
        }

        let clamped_end = segment_end.min(data.len());
        let segment = &data[segment_start..clamped_end];
        if segment.is_empty() {
            return None;
        }

        let mut best_candidate: Option<usize> = None;
        let mut best_peak = f32::MIN;

        for (i, &candidate_abs) in candidates.iter().enumerate() {
            if candidate_abs < segment_start || candidate_abs >= clamped_end {
                continue;
            }

            let next_abs = match candidates.get(i + 1).copied() {
                Some(next) if next > candidate_abs && next <= clamped_end => next,
                _ => continue,
            };

            let rel_start = candidate_abs - segment_start;
            let rel_end = next_abs - segment_start;

            if rel_start >= rel_end {
                continue;
            }

            let mut local_peak: Option<f32> = None;
            for &value in &segment[rel_start..rel_end] {
                if value > 0.0 {
                    local_peak = Some(local_peak.map_or(value, |p| p.max(value)));
                }
            }

            if let Some(peak) = local_peak {
                if peak > best_peak {
                    best_peak = peak;
                    best_candidate = Some(candidate_abs);
                }
            }
        }

        best_candidate
    }

    /// Find the peak (maximum positive amplitude) in the specified range
    /// Returns None if no peak with positive amplitude (> 0.0) is found in the range
    pub(crate) fn find_peak_in_range(
        &self,
        data: &[f32],
        start_index: usize,
        end_index: usize,
    ) -> Option<usize> {
        // Validate indices
        if start_index >= data.len() || end_index <= start_index {
            return None;
        }

        let end = end_index.min(data.len());

        let mut peak_index = start_index;
        let mut peak_value = data[start_index];

        for i in start_index + 1..end {
            if data[i] > peak_value {
                peak_value = data[i];
                peak_index = i;
            }
        }

        // Ensure the peak is positive
        if peak_value > 0.0 {
            Some(peak_index)
        } else {
            None
        }
    }

    /// Find zero crossing by looking backward from peak
    /// Zero crossing is defined as: before going back >= 0, after going back < 0
    /// Returns the "before going back" position
    pub(crate) fn find_zero_crossing_backward_from_peak(
        &self,
        data: &[f32],
        peak_index: usize,
    ) -> Option<usize> {
        // Need at least one sample before peak to look backward
        if peak_index == 0 {
            return None;
        }

        // Look backward from peak
        // We start from peak_index - 1 and go backward to index 1
        // (index 0 cannot be a zero crossing because there's no sample before it)
        for i in (1..peak_index).rev() {
            // Check if this is a zero crossing point
            // data[i] >= 0.0 (before going back)
            // data[i-1] < 0.0 (after going back one step)
            if data[i] >= 0.0 && data[i - 1] < 0.0 {
                return Some(i); // Return the "before going back" position
            }
        }

        None
    }
}
