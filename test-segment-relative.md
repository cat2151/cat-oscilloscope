# Test: Segment-Relative Position Tracking

## Expected Behavior

When `calculate_display_range()` is called on 4-cycle segments across multiple frames:

Frame 1:
- Segment: indices 0..400 (4 cycles, ~100 samples per cycle)
- History initialized to: 50 (segment-relative)
- Returns: DisplayRange { start_index: 50, ... }

Frame 2:
- Segment: indices 0..400 (different absolute position in buffer, but same relative structure)
- History: 50 (from previous frame)
- Should check if index 50 is still a zero-cross
- With 1% tolerance (~1 sample for 100-sample cycles), should only move to 49-51
- Returns: DisplayRange { start_index: 49..51, ... }

## Current Code Analysis

The code stores `history_zero_cross_index` which is relative to the `data` parameter passed in.
When called on segments, this is automatically segment-relative.

The 1% constraint is calculated as:
```rust
let tolerance = ((estimated_cycle_length * Self::HISTORY_SEARCH_TOLERANCE_RATIO) as usize).max(1);
// = (100 * 0.01).max(1) = 1 sample
```

So the algorithm should search in range [49, 51] for a zero-cross, which is correct!

## Hypothesis

The code should already be working correctly for segment-relative positions.
Perhaps the reported issue is:
1. A different problem (e.g., Process A is changing too much)
2. The tolerance calculation has an issue
3. The history is being reset unexpectedly
4. There's a bug in one of the specific zero-cross detection modes

Need to investigate further or test with actual audio data.
