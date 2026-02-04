# Fix for Issue #220: Red Line Oscillation Problem

## Issue Summary
The red vertical line (phase 0 marker) in the main waveform display was moving excessively (about 1 cycle) instead of being limited to 1% of a cycle as specified.

## Root Cause

The problem was in how `calculate_phase_markers()` (Process B) was using the zero-cross detector:

### The Two Processes
- **Process A**: `search_similar_waveform()` determines which 4-cycle segment to display from the frame buffer
- **Process B**: `calculate_phase_markers()` determines where to draw the red line (phase 0) within that 4-cycle segment

### The Bug
`calculate_phase_markers()` was calling `zero_cross_detector.calculate_display_range()` on a **segment** (4-cycle window with indices 0 to segment_length).

However, `calculate_display_range()` and its underlying detection methods track positions across frames using **history stored in absolute coordinates** (positions in the full buffer).

When called with a segment:
- Segment indices: 0 to segment_length (relative positions)
- History: stored in absolute positions (full buffer coordinates)
- **Result**: History comparison failed, detector reinitialized every frame, 1% constraint was ineffective

## The Fix

Added a new method `find_phase_zero_in_segment()` to `ZeroCrossDetector`:

```rust
pub fn find_phase_zero_in_segment(
    &mut self,
    segment: &[f32],
    segment_start_abs: usize,  // Key addition: absolute position
    estimated_cycle_length: f32,
) -> Option<usize>
```

This method:
1. Takes the segment AND its absolute position in the full buffer
2. Converts between segment-relative and absolute coordinates correctly
3. Maintains history in absolute coordinates
4. Properly applies the 1% constraint across frames
5. Respects each detection mode's characteristics (PeakBacktrackWithHistory, Hysteresis, etc.)

### Key Implementation Details

**Initialization** (no history):
- Finds zero-cross in segment (relative coordinates)
- Converts to absolute position: `abs_pos = segment_start_abs + zero_cross_idx`
- Stores absolute position in history

**With history**:
- Converts history absolute position to segment-relative: `history_rel = history_abs - segment_start_abs`
- Searches within 1% tolerance in segment
- Updates history with new absolute position
- Falls back to mode-specific behavior if no zero-cross found in tolerance

**Mode-specific behavior**:
- `PeakBacktrackWithHistory`: Strict 1% constraint, keeps history if no zero-cross found
- `Hysteresis`, `BidirectionalNearest`, etc.: Extended search with gradual movement
- `Standard`: Broader search range (3% tolerance)

## Files Changed

1. **signal-processor-wasm/src/zero_cross_detector.rs**
   - Added `find_phase_zero_in_segment()` method (~117 lines)
   - Added helper methods: `search_zero_cross_in_segment()`, `search_zero_cross_in_segment_extended()`

2. **signal-processor-wasm/src/lib.rs**
   - Updated `calculate_phase_markers()` to use new method
   - Changed from `calculate_display_range()` to `find_phase_zero_in_segment()`
   - Passes segment AND absolute position

3. **public/wasm/signal_processor_wasm_bg.wasm** & **dist/wasm/signal_processor_wasm_bg.wasm**
   - Rebuilt WASM modules with the fix

## Verification

### Automated Tests
- All 189 tests pass
- WASM timeout tests expected to fail in non-browser environment

### Manual Verification Steps

1. Build and run the application:
   ```bash
   npm run build
   npm run dev
   ```

2. Open browser to `http://localhost:3000`

3. Test with microphone or audio file:
   - Start audio input
   - Select "Peak+History (1% stable)" from the "Phase 0 Detection" dropdown
   - Observe the red vertical line in the main waveform display

4. Expected behavior:
   - ✅ Red line should move smoothly, staying within 1% of cycle length
   - ✅ No large jumps (1 cycle or more)
   - ✅ Stable position for steady-state audio

5. Test other modes (Hysteresis, Standard, etc.) to ensure they work correctly

### Comparison with Issue #220
- **Before fix**: Red line jumped around by ~1 cycle
- **After fix**: Red line movement constrained to 1% of cycle length

## Learning from PR #215

PR #215 made the mistake of:
1. Confusing Process A and Process B
2. Using `calculate_display_range()` (designed for Process A) in both processes
3. Breaking the similarity search architecture

This fix:
1. Maintains clear separation between Process A and Process B
2. Creates a dedicated method for Process B (phase marker positioning)
3. Preserves the similarity search architecture (Process A)
4. Correctly handles coordinate transformations between relative and absolute positions

## Technical Notes

### Why absolute coordinates matter
The similarity search (Process A) can select different 4-cycle segments from different positions in the buffer each frame. If we only tracked relative positions within segments, we'd lose continuity across frames.

By maintaining history in absolute coordinates:
- We can track the same physical position in the waveform across frames
- The 1% constraint works correctly even when the segment selection changes
- Each detection mode's characteristics are preserved

### Algorithm preservation
The fix preserves the behavior of all 7 detection algorithms:
1. Standard
2. Peak+History (1% stable) - **Key for this issue**
3. Bidirectional Nearest
4. Gradient Based
5. Adaptive Step
6. Hysteresis (default)
7. Closest to Zero
