use wasm_bindgen::prelude::*;

/// WaveformRenderData - Complete data structure for waveform rendering
/// This mirrors the TypeScript interface WaveformRenderData
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct WaveformRenderData {
    // Waveform data
    pub(crate) waveform_data: Vec<f32>,
    
    // COORDINATE SPACE: frame buffer positions (absolute indices in waveform_data)
    // Start position of the selected segment within the frame buffer
    pub(crate) selected_segment_buffer_position: usize,
    // End position of the selected segment within the frame buffer (exclusive)
    pub(crate) selected_segment_buffer_end: usize,
    pub(crate) gain: f32,
    
    // Frequency information
    pub(crate) estimated_frequency: f32,
    pub(crate) frequency_plot_history: Vec<f32>,
    pub(crate) sample_rate: f32,
    pub(crate) fft_size: usize,
    
    // FFT spectrum data (optional)
    pub(crate) frequency_data: Option<Vec<u8>>,
    
    pub(crate) is_signal_above_noise_gate: bool,
    pub(crate) max_frequency: f32,
    
    // Waveform search information
    pub(crate) previous_waveform: Option<Vec<f32>>,
    pub(crate) similarity: f32,
    pub(crate) similarity_plot_history: Vec<f32>,
    pub(crate) used_similarity_search: bool,
    
    // Phase marker positions (in sample indices within the waveform_data buffer)
    pub(crate) phase_zero_index: Option<usize>,
    pub(crate) phase_two_pi_index: Option<usize>,
    pub(crate) phase_minus_quarter_pi_index: Option<usize>,
    pub(crate) phase_two_pi_plus_quarter_pi_index: Option<usize>,
    
    // Harmonic analysis for debugging (only populated when FFT method is used)
    pub(crate) half_freq_peak_strength_percent: Option<f32>,  // Strength of peak at 1/2 estimated frequency (%)
    pub(crate) candidate1_harmonics: Option<Vec<f32>>,        // Harmonics strength for candidate1 (estimated freq)
    pub(crate) candidate2_harmonics: Option<Vec<f32>>,        // Harmonics strength for candidate2 (1/2 freq)
    pub(crate) candidate1_weighted_score: Option<f32>,        // Weighted harmonic score for candidate1
    pub(crate) candidate2_weighted_score: Option<f32>,        // Weighted harmonic score for candidate2
    pub(crate) selection_reason: Option<String>,              // Why candidate1 was chosen over candidate2
    
    // Cycle similarity analysis for frequency estimation tuning
    pub(crate) cycle_similarities_8div: Vec<f32>,             // 8 divisions (1/2 cycle each): 7 similarity values
    pub(crate) cycle_similarities_4div: Vec<f32>,             // 4 divisions (1 cycle each): 3 similarity values
    pub(crate) cycle_similarities_2div: Vec<f32>,             // 2 divisions (2 cycles each): 1 similarity value
    
    // Debug information for phase marker tracking (issue #220)
    pub(crate) phase_zero_segment_relative: Option<usize>,    // Phase 0 position relative to segment start
    pub(crate) phase_zero_history: Option<usize>,             // History value used for tracking
    pub(crate) phase_zero_tolerance: Option<usize>,           // 1% tolerance in samples
    pub(crate) zero_cross_mode_name: Option<String>,          // Current zero-cross detection mode name
}

#[wasm_bindgen]
impl WaveformRenderData {
    // Getters for JavaScript
    #[wasm_bindgen(getter)]
    pub fn waveform_data(&self) -> Vec<f32> {
        self.waveform_data.clone()
    }
    
    #[wasm_bindgen(getter, js_name = displayStartIndex)]
    pub fn display_start_index(&self) -> usize {
        self.selected_segment_buffer_position
    }
    
    #[wasm_bindgen(getter, js_name = displayEndIndex)]
    pub fn display_end_index(&self) -> usize {
        self.selected_segment_buffer_end
    }
    
    #[wasm_bindgen(getter)]
    pub fn gain(&self) -> f32 {
        self.gain
    }
    
    #[wasm_bindgen(getter, js_name = estimatedFrequency)]
    pub fn estimated_frequency(&self) -> f32 {
        self.estimated_frequency
    }
    
    #[wasm_bindgen(getter, js_name = frequencyPlotHistory)]
    pub fn frequency_plot_history(&self) -> Vec<f32> {
        self.frequency_plot_history.clone()
    }
    
    #[wasm_bindgen(getter, js_name = sampleRate)]
    pub fn sample_rate(&self) -> f32 {
        self.sample_rate
    }
    
    #[wasm_bindgen(getter, js_name = fftSize)]
    pub fn fft_size(&self) -> usize {
        self.fft_size
    }
    
    #[wasm_bindgen(getter, js_name = frequencyData)]
    pub fn frequency_data(&self) -> Option<Vec<u8>> {
        self.frequency_data.clone()
    }
    
    #[wasm_bindgen(getter, js_name = isSignalAboveNoiseGate)]
    pub fn is_signal_above_noise_gate(&self) -> bool {
        self.is_signal_above_noise_gate
    }
    
    #[wasm_bindgen(getter, js_name = maxFrequency)]
    pub fn max_frequency(&self) -> f32 {
        self.max_frequency
    }
    
    #[wasm_bindgen(getter, js_name = previousWaveform)]
    pub fn previous_waveform(&self) -> Option<Vec<f32>> {
        self.previous_waveform.clone()
    }
    
    #[wasm_bindgen(getter)]
    pub fn similarity(&self) -> f32 {
        self.similarity
    }
    
    #[wasm_bindgen(getter, js_name = similarityPlotHistory)]
    pub fn similarity_plot_history(&self) -> Vec<f32> {
        self.similarity_plot_history.clone()
    }
    
    #[wasm_bindgen(getter, js_name = usedSimilaritySearch)]
    pub fn used_similarity_search(&self) -> bool {
        self.used_similarity_search
    }
    
    #[wasm_bindgen(getter, js_name = phaseZeroIndex)]
    pub fn phase_zero_index(&self) -> Option<usize> {
        self.phase_zero_index
    }
    
    #[wasm_bindgen(getter, js_name = phaseTwoPiIndex)]
    pub fn phase_two_pi_index(&self) -> Option<usize> {
        self.phase_two_pi_index
    }
    
    #[wasm_bindgen(getter, js_name = phaseMinusQuarterPiIndex)]
    pub fn phase_minus_quarter_pi_index(&self) -> Option<usize> {
        self.phase_minus_quarter_pi_index
    }
    
    #[wasm_bindgen(getter, js_name = phaseTwoPiPlusQuarterPiIndex)]
    pub fn phase_two_pi_plus_quarter_pi_index(&self) -> Option<usize> {
        self.phase_two_pi_plus_quarter_pi_index
    }
    
    #[wasm_bindgen(getter, js_name = halfFreqPeakStrengthPercent)]
    pub fn half_freq_peak_strength_percent(&self) -> Option<f32> {
        self.half_freq_peak_strength_percent
    }
    
    #[wasm_bindgen(getter, js_name = candidate1Harmonics)]
    pub fn candidate1_harmonics(&self) -> Option<Vec<f32>> {
        self.candidate1_harmonics.clone()
    }
    
    #[wasm_bindgen(getter, js_name = candidate2Harmonics)]
    pub fn candidate2_harmonics(&self) -> Option<Vec<f32>> {
        self.candidate2_harmonics.clone()
    }
    
    #[wasm_bindgen(getter, js_name = candidate1WeightedScore)]
    pub fn candidate1_weighted_score(&self) -> Option<f32> {
        self.candidate1_weighted_score
    }
    
    #[wasm_bindgen(getter, js_name = candidate2WeightedScore)]
    pub fn candidate2_weighted_score(&self) -> Option<f32> {
        self.candidate2_weighted_score
    }
    
    #[wasm_bindgen(getter, js_name = selectionReason)]
    pub fn selection_reason(&self) -> Option<String> {
        self.selection_reason.clone()
    }
    
    #[wasm_bindgen(getter, js_name = cycleSimilarities8div)]
    pub fn cycle_similarities_8div(&self) -> Vec<f32> {
        self.cycle_similarities_8div.clone()
    }
    
    #[wasm_bindgen(getter, js_name = cycleSimilarities4div)]
    pub fn cycle_similarities_4div(&self) -> Vec<f32> {
        self.cycle_similarities_4div.clone()
    }
    
    #[wasm_bindgen(getter, js_name = cycleSimilarities2div)]
    pub fn cycle_similarities_2div(&self) -> Vec<f32> {
        self.cycle_similarities_2div.clone()
    }
    
    // Debug information getters for phase marker tracking
    #[wasm_bindgen(getter, js_name = phaseZeroSegmentRelative)]
    pub fn phase_zero_segment_relative(&self) -> Option<usize> {
        self.phase_zero_segment_relative
    }
    
    #[wasm_bindgen(getter, js_name = phaseZeroHistory)]
    pub fn phase_zero_history(&self) -> Option<usize> {
        self.phase_zero_history
    }
    
    #[wasm_bindgen(getter, js_name = phaseZeroTolerance)]
    pub fn phase_zero_tolerance(&self) -> Option<usize> {
        self.phase_zero_tolerance
    }
    
    #[wasm_bindgen(getter, js_name = zeroCrossModeName)]
    pub fn zero_cross_mode_name(&self) -> Option<String> {
        self.zero_cross_mode_name.clone()
    }
}
