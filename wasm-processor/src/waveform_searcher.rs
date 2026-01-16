use std::collections::VecDeque;

/// SearchResult contains the best match information
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
    fn calculate_similarity(&self, waveform1: &[f32], waveform2: &[f32]) -> f32 {
        if waveform1.len() != waveform2.len() || waveform1.is_empty() {
            return 0.0;
        }
        
        let n = waveform1.len() as f32;
        
        // Calculate means
        let mean1: f32 = waveform1.iter().sum::<f32>() / n;
        let mean2: f32 = waveform2.iter().sum::<f32>() / n;
        
        // Calculate correlation coefficient
        let mut numerator = 0.0f32;
        let mut sum_sq1 = 0.0f32;
        let mut sum_sq2 = 0.0f32;
        
        for i in 0..waveform1.len() {
            let diff1 = waveform1[i] - mean1;
            let diff2 = waveform2[i] - mean2;
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
    
    /// Search for the most similar waveform in current frame by sliding search
    pub fn search_similar_waveform(
        &mut self,
        current_frame: &[f32],
        cycle_length: f32,
    ) -> Option<SearchResult> {
        let prev_waveform = self.previous_waveform.as_ref()?;
        
        if cycle_length <= 0.0 {
            return None;
        }
        
        // Compare against 4 cycles worth of waveform data
        let waveform_length = (cycle_length * CYCLES_TO_STORE as f32).floor() as usize;
        
        if current_frame.len() < waveform_length {
            return None;
        }
        
        if prev_waveform.len() != waveform_length {
            return None;
        }
        
        let mut best_similarity = -2.0f32; // Lower than minimum possible value (-1)
        let mut best_start_index = 0;
        
        // Search range: from 0 to (4 * cycle_length - 1) samples (total 4 cycles worth of positions)
        let search_range = (cycle_length * CYCLES_TO_SEARCH as f32).floor() as usize;
        let max_start_index = current_frame.len().saturating_sub(waveform_length);
        let search_end_index = if search_range < 2 {
            max_start_index
        } else {
            max_start_index.min(search_range - 1)
        };
        
        for start_index in 0..=search_end_index {
            let candidate = &current_frame[start_index..start_index + waveform_length];
            let similarity = self.calculate_similarity(prev_waveform, candidate);
            
            if similarity > best_similarity {
                best_similarity = similarity;
                best_start_index = start_index;
            }
        }
        
        // Update last similarity
        self.last_similarity = best_similarity;
        
        // Add to similarity history (using VecDeque for O(1) operations)
        self.similarity_history.push_back(best_similarity);
        if self.similarity_history.len() > SIMILARITY_HISTORY_SIZE {
            self.similarity_history.pop_front();
        }
        
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
        self.last_similarity = 0.0;
        self.similarity_history.push_back(0.0);
        if self.similarity_history.len() > SIMILARITY_HISTORY_SIZE {
            self.similarity_history.pop_front();
        }
    }
    
    /// Reset searcher state
    pub fn reset(&mut self) {
        self.previous_waveform = None;
        self.last_similarity = 0.0;
        self.similarity_history.clear();
    }
}
