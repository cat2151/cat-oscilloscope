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
