use std::collections::VecDeque;

/// SearchResult contains the best match information
#[allow(dead_code)]
pub struct SearchResult {
    pub start_index: usize,
    pub similarity: f32,
}

/// Constants for waveform storage and search
/// Store 4 cycles worth of waveform data
pub const CYCLES_TO_STORE: usize = 4;

/// Search within 4 cycles range
pub const CYCLES_TO_SEARCH: usize = 4;

/// WaveformSearcher handles waveform similarity search
pub struct WaveformSearcher {
    previous_waveform: Option<Vec<f32>>,
    last_similarity: f32,
    similarity_history: VecDeque<f32>,
}

/// Maximum number of similarity values to store in history
const SIMILARITY_HISTORY_SIZE: usize = 100;

impl WaveformSearcher {
    pub fn new() -> Self {
        WaveformSearcher {
            previous_waveform: None,
            last_similarity: 0.0,
            similarity_history: VecDeque::new(),
        }
    }
    
    /// Calculate similarity (correlation coefficient) between two waveforms
    /// Handles waveforms of different lengths by comparing the overlapping portion
    fn calculate_similarity(&self, waveform1: &[f32], waveform2: &[f32]) -> f32 {
        if waveform1.is_empty() || waveform2.is_empty() {
            return 0.0;
        }
        
        // Use the shorter length for comparison (handle non-deterministic buffer size changes)
        let compare_len = waveform1.len().min(waveform2.len());
        let w1 = &waveform1[..compare_len];
        let w2 = &waveform2[..compare_len];
        
        let n = compare_len as f32;
        
        // Calculate means
        let mean1: f32 = w1.iter().sum::<f32>() / n;
        let mean2: f32 = w2.iter().sum::<f32>() / n;
        
        // Calculate correlation coefficient
        let mut numerator = 0.0f32;
        let mut sum_sq1 = 0.0f32;
        let mut sum_sq2 = 0.0f32;
        
        for i in 0..compare_len {
            let diff1 = w1[i] - mean1;
            let diff2 = w2[i] - mean2;
            numerator += diff1 * diff2;
            sum_sq1 += diff1 * diff1;
            sum_sq2 += diff2 * diff2;
        }
        
        let denominator = (sum_sq1 * sum_sq2).sqrt();
        
        if denominator == 0.0 {
            0.0
        } else {
            numerator / denominator
        }
    }
    
    /// Update similarity history with a new value
    fn update_similarity_history(&mut self, similarity: f32) {
        self.last_similarity = similarity;
        self.similarity_history.push_back(similarity);
        if self.similarity_history.len() > SIMILARITY_HISTORY_SIZE {
            self.similarity_history.pop_front();
        }
    }
    
    /// Search for the most similar waveform in current frame by sliding search
    pub fn search_similar_waveform(
        &mut self,
        current_frame: &[f32],
        cycle_length: f32,
    ) -> Option<SearchResult> {
        let prev_waveform = self.previous_waveform.as_ref()?;
        
        if cycle_length <= 0.0 {
            web_sys::console::log_1(
                &format!("Similarity=0: Invalid cycle_length ({})", cycle_length).into()
            );
            self.update_similarity_history(0.0);
            return None;
        }
        
        // Compare against 4 cycles worth of waveform data
        let waveform_length = (cycle_length * CYCLES_TO_STORE as f32).floor() as usize;
        
        if current_frame.len() < waveform_length {
            web_sys::console::log_1(
                &format!("Similarity=0: Buffer too short (current={}, required={})", 
                         current_frame.len(), waveform_length).into()
            );
            self.update_similarity_history(0.0);
            return None;
        }
        
        // Allow some tolerance for non-deterministic buffer size changes
        // If the difference is more than 10%, log a warning but continue
        let length_diff = prev_waveform.len().abs_diff(waveform_length);
        let length_diff_percent = (length_diff as f32 / waveform_length as f32) * 100.0;
        if length_diff_percent > 10.0 {
            web_sys::console::log_1(
                &format!("Similarity warning: Large waveform length difference (prev={}, current={}, diff={}%)", 
                         prev_waveform.len(), waveform_length, length_diff_percent.round()).into()
            );
        }
        
        let mut best_similarity = -2.0f32; // Lower than minimum possible value (-1)
        let mut best_start_index = 0;
        
        // Determine the comparison length - use the minimum of prev_waveform length and waveform_length
        // This allows comparison even when buffer sizes differ slightly
        let comparison_length = prev_waveform.len().min(waveform_length);
        
        // Search range: from 0 to (4 * cycle_length - 1) samples (total 4 cycles worth of positions)
        let search_range = (cycle_length * CYCLES_TO_SEARCH as f32).floor() as usize;
        let max_start_index = current_frame.len().saturating_sub(comparison_length);
        let search_end_index = if search_range < 2 {
            max_start_index
        } else {
            max_start_index.min(search_range - 1)
        };
        
        for start_index in 0..=search_end_index {
            let end_index = start_index + comparison_length;
            if end_index > current_frame.len() {
                break;
            }
            let candidate = &current_frame[start_index..end_index];
            let similarity = self.calculate_similarity(prev_waveform, candidate);
            
            if similarity > best_similarity {
                best_similarity = similarity;
                best_start_index = start_index;
            }
        }
        
        // Update similarity history with the best match found
        self.update_similarity_history(best_similarity);
        
        // Return result only if we found a good match
        if best_similarity > -1.0 {
            Some(SearchResult {
                start_index: best_start_index,
                similarity: best_similarity,
            })
        } else {
            None
        }
    }
    
    /// Store waveform for next frame's comparison
    pub fn store_waveform(&mut self, data: &[f32], start_index: usize, end_index: usize) {
        if start_index < data.len() && end_index <= data.len() && start_index < end_index {
            self.previous_waveform = Some(data[start_index..end_index].to_vec());
        }
    }
    
    /// Check if we have a previous waveform
    pub fn has_previous_waveform(&self) -> bool {
        self.previous_waveform.is_some()
    }
    
    /// Get previous waveform
    pub fn get_previous_waveform(&self) -> Option<Vec<f32>> {
        self.previous_waveform.clone()
    }
    
    /// Get last similarity score
    pub fn get_last_similarity(&self) -> f32 {
        self.last_similarity
    }
    
    /// Get similarity history for plotting
    pub fn get_similarity_history(&self) -> Vec<f32> {
        self.similarity_history.iter().copied().collect()
    }
    
    /// Record that similarity search was not performed for this frame
    /// Updates history with 0.0 to indicate no similarity data is available
    pub fn record_no_search(&mut self) {
        web_sys::console::log_1(&"Similarity=0: Search not performed".into());
        self.update_similarity_history(0.0);
    }
    
    /// Reset searcher state
    pub fn reset(&mut self) {
        self.previous_waveform = None;
        self.last_similarity = 0.0;
        self.similarity_history.clear();
    }
    
    /// Calculate cycle similarities for different divisions of a 4-cycle waveform
    /// Returns three arrays representing:
    /// - 8 divisions (1/2 cycle each): 7 similarity values (comparing consecutive segments)
    /// - 4 divisions (1 cycle each): 3 similarity values
    /// - 2 divisions (2 cycles each): 1 similarity value
    pub fn calculate_cycle_similarities(
        &self,
        waveform: &[f32],
        cycle_length: f32,
    ) -> (Vec<f32>, Vec<f32>, Vec<f32>) {
        if cycle_length <= 0.0 || waveform.is_empty() {
            return (Vec::new(), Vec::new(), Vec::new());
        }
        
        let total_length = (cycle_length * CYCLES_TO_STORE as f32).floor() as usize;
        
        // Check if we have enough data
        if waveform.len() < total_length {
            return (Vec::new(), Vec::new(), Vec::new());
        }
        
        // Extract the 4-cycle waveform
        let four_cycles = &waveform[..total_length];
        
        // 8 divisions (1/2 cycle each)
        let half_cycle = (cycle_length / 2.0).floor() as usize;
        let mut similarities_8div = Vec::new();
        for i in 0..7 {
            let start1 = i * half_cycle;
            let end1 = (i + 1) * half_cycle;
            let start2 = (i + 1) * half_cycle;
            let end2 = (i + 2) * half_cycle;
            
            if end2 <= four_cycles.len() {
                let seg1 = &four_cycles[start1..end1];
                let seg2 = &four_cycles[start2..end2];
                let sim = self.calculate_similarity(seg1, seg2);
                similarities_8div.push(sim);
            }
        }
        
        // 4 divisions (1 cycle each)
        let one_cycle = cycle_length.floor() as usize;
        let mut similarities_4div = Vec::new();
        for i in 0..3 {
            let start1 = i * one_cycle;
            let end1 = (i + 1) * one_cycle;
            let start2 = (i + 1) * one_cycle;
            let end2 = (i + 2) * one_cycle;
            
            if end2 <= four_cycles.len() {
                let seg1 = &four_cycles[start1..end1];
                let seg2 = &four_cycles[start2..end2];
                let sim = self.calculate_similarity(seg1, seg2);
                similarities_4div.push(sim);
            }
        }
        
        // 2 divisions (2 cycles each)
        let two_cycles = (cycle_length * 2.0).floor() as usize;
        let mut similarities_2div = Vec::new();
        if two_cycles * 2 <= four_cycles.len() {
            let seg1 = &four_cycles[0..two_cycles];
            let seg2 = &four_cycles[two_cycles..two_cycles * 2];
            let sim = self.calculate_similarity(seg1, seg2);
            similarities_2div.push(sim);
        }
        
        (similarities_8div, similarities_4div, similarities_2div)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_similarity_identical_waveforms() {
        let searcher = WaveformSearcher::new();
        let waveform = vec![0.0, 0.5, 1.0, 0.5, 0.0, -0.5, -1.0, -0.5];
        let similarity = searcher.calculate_similarity(&waveform, &waveform);
        // Identical waveforms should have similarity of 1.0
        assert!((similarity - 1.0).abs() < 0.001, "Expected ~1.0, got {}", similarity);
    }

    #[test]
    fn test_calculate_similarity_different_lengths() {
        let searcher = WaveformSearcher::new();
        let waveform1 = vec![0.0, 0.5, 1.0, 0.5, 0.0, -0.5, -1.0, -0.5];
        let waveform2 = vec![0.0, 0.5, 1.0, 0.5, 0.0]; // Shorter by 3 samples
        
        // Should compare only the overlapping portion (5 samples)
        let similarity = searcher.calculate_similarity(&waveform1, &waveform2);
        
        // Since the overlapping portion is identical, similarity should be high
        assert!(similarity > 0.99, "Expected high similarity for overlapping portion, got {}", similarity);
    }

    #[test]
    fn test_calculate_similarity_one_sample_difference() {
        let searcher = WaveformSearcher::new();
        let waveform1 = vec![0.0, 0.5, 1.0, 0.5, 0.0, -0.5, -1.0, -0.5];
        let waveform2 = vec![0.0, 0.5, 1.0, 0.5, 0.0, -0.5, -1.0]; // 1 sample shorter
        
        // Should compare only the overlapping portion (7 samples)
        let similarity = searcher.calculate_similarity(&waveform1, &waveform2);
        
        // Since the overlapping portion is identical, similarity should be very high
        assert!(similarity > 0.99, "Expected high similarity despite 1 sample difference, got {}", similarity);
    }

    #[test]
    fn test_calculate_similarity_empty_waveforms() {
        let searcher = WaveformSearcher::new();
        let empty: Vec<f32> = vec![];
        let waveform = vec![0.0, 0.5, 1.0];
        
        assert_eq!(searcher.calculate_similarity(&empty, &waveform), 0.0);
        assert_eq!(searcher.calculate_similarity(&waveform, &empty), 0.0);
        assert_eq!(searcher.calculate_similarity(&empty, &empty), 0.0);
    }

    #[test]
    fn test_calculate_similarity_opposite_waveforms() {
        let searcher = WaveformSearcher::new();
        let waveform1 = vec![1.0, 2.0, 3.0, 4.0];
        let waveform2 = vec![-1.0, -2.0, -3.0, -4.0];
        
        let similarity = searcher.calculate_similarity(&waveform1, &waveform2);
        // Opposite waveforms should have negative correlation close to -1.0
        assert!(similarity < -0.99, "Expected ~-1.0 for opposite waveforms, got {}", similarity);
    }

    #[test]
    fn test_search_with_length_mismatch() {
        let mut searcher = WaveformSearcher::new();
        
        // Store a waveform of length 100
        let prev_data = vec![0.0; 100];
        searcher.store_waveform(&prev_data, 0, 100);
        
        // Create current frame where the calculated waveform_length would be 101
        // Using cycle_length = 25.25 would give waveform_length = floor(25.25 * 4) = 101
        let current_frame = vec![0.0; 200];
        let cycle_length = 25.25;
        
        // This should not return None due to length mismatch
        // It should use comparison_length = min(100, 101) = 100
        let result = searcher.search_similar_waveform(&current_frame, cycle_length);
        
        // Should find a match (even if similarity is 0 for flat waveforms)
        assert!(result.is_some(), "Expected search to succeed despite 1 sample length difference");
    }
}
