/// SearchResult contains the best match information
pub struct SearchResult {
    pub start_index: usize,
    pub similarity: f32,
}

/// WaveformSearcher handles waveform similarity search
pub struct WaveformSearcher {
    previous_waveform: Option<Vec<f32>>,
    last_similarity: f32,
}

impl WaveformSearcher {
    pub fn new() -> Self {
        WaveformSearcher {
            previous_waveform: None,
            last_similarity: 0.0,
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
        
        let waveform_length = cycle_length.floor() as usize;
        
        if current_frame.len() < waveform_length {
            return None;
        }
        
        if prev_waveform.len() != waveform_length {
            return None;
        }
        
        let mut best_similarity = -2.0f32; // Lower than minimum possible value (-1)
        let mut best_start_index = 0;
        
        // Slide search: compare each position in current frame
        let search_end_index = (current_frame.len() - waveform_length).min(waveform_length - 1);
        
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
    
    /// Reset searcher state
    pub fn reset(&mut self) {
        self.previous_waveform = None;
        self.last_similarity = 0.0;
    }
}
