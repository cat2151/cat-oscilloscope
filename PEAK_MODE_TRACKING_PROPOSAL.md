# Peak Mode Tracking Logic Improvement Proposal

## Current Problem

The `previousPeakIndex` tracking assumes:
- Frame N: Peak found at buffer index X
- Frame N+1: Peak will be at buffer index X

**This assumption is WRONG** because:
- Each frame gets a new snapshot from the continuous audio stream
- The audio advances between frames
- The same buffer index points to different audio positions

## User's Key Insight (@cat2151)

Frame buffers are contiguous (no gaps). If we know:
1. Previous frame's peak position (sample index)
2. Estimated frequency (Hz)
3. Time between frames or buffer advance

We can calculate where to search in the current frame.

## Analysis: Do Buffers Shift?

### Web Audio API Behavior

The AnalyserNode:
- Maintains a fixed-size buffer (4096 samples)
- Continuously updates with new audio data
- `getFloatTimeDomainData` returns the **most recent** 4096 samples

### Frame-to-Frame Relationship

At 60 FPS (16.67ms between frames) with 48kHz sample rate:
- ~800 new samples arrive per frame
- The buffer effectively "shifts" by ~800 samples
- Old data scrolls out, new data comes in

**Key Finding**: The buffer doesn't literally shift - it gets **continuously updated** with the latest audio. There IS a relationship between consecutive frames.

## Proposed Solution

### Approach 1: Track Expected Phase Shift (Recommended)

Instead of tracking buffer index, track **how much we expect the waveform to shift**:

```typescript
class ZeroCrossDetector {
  private previousPeakIndex: number | null = null;
  private lastFrameTimestamp: number | null = null; // NEW
  private sampleRate: number = 48000; // NEW: track sample rate
  
  findStablePeak(data: Float32Array, estimatedCycleLength: number, currentTime: number): number {
    if (this.previousPeakIndex !== null && this.lastFrameTimestamp !== null && estimatedCycleLength > 0) {
      // Calculate time elapsed
      const elapsedTime = currentTime - this.lastFrameTimestamp;
      
      // Calculate how many samples have "passed" (buffer advance)
      const samplesAdvanced = Math.floor(elapsedTime * this.sampleRate / 1000);
      
      // Expected new peak position (accounting for buffer shift)
      // If buffer advanced by N samples, peak appears N samples earlier
      const expectedNewIndex = this.previousPeakIndex - samplesAdvanced;
      
      // Adjust to valid range (peak may have wrapped around)
      let searchCenter = expectedNewIndex;
      if (searchCenter < 0) {
        // Peak has scrolled out, estimate based on frequency
        const cyclesScrolled = Math.abs(searchCenter) / estimatedCycleLength;
        searchCenter = Math.floor((cyclesScrolled % 1) * estimatedCycleLength);
      }
      
      // Search within ±0.5 cycles of expected position
      const searchTolerance = estimatedCycleLength * 0.5;
      const searchStart = Math.max(0, Math.floor(searchCenter - searchTolerance));
      const searchEnd = Math.min(data.length, Math.ceil(searchCenter + searchTolerance));
      
      // Find peak and continue with pattern matching...
    }
    
    // Store timestamp for next frame
    this.lastFrameTimestamp = currentTime;
  }
}
```

### Approach 2: Simpler - Use First Peak (No Tracking)

Since tracking is complex and error-prone, **always find the first peak** in each frame:

```typescript
findStablePeak(data: Float32Array, estimatedCycleLength: number): number {
  // Always search from the beginning
  const searchLength = Math.floor(estimatedCycleLength);
  const peak = this.findPeak(data, 0, searchLength);
  
  // Still use pattern matching for quality
  if (peak !== -1 && estimatedCycleLength > 0) {
    const candidates = this.findPeakCandidates(data, peak, estimatedCycleLength, 4);
    candidates.unshift(peak);
    return this.selectBestCandidate(data, candidates, estimatedCycleLength, null);
  }
  
  return peak;
}
```

**This is what zero-cross mode does**, and it works well!

## Recommendation

**Approach 2 (Simpler)** is recommended because:
1. ✅ Eliminates tracking complexity
2. ✅ Always starts from a consistent position
3. ✅ Matches zero-cross mode behavior
4. ✅ Pattern matching still provides quality selection
5. ✅ No timestamp/timing dependencies

The pattern matching (`selectBestCandidate`) already provides stability across frames by choosing the waveform pattern that best matches expectations.

## Implementation Impact

Changing to Approach 2:
- **Minimal code change**: Simplify `findStablePeak` 
- **Remove `previousPeakIndex` field** (no longer needed)
- **Tests**: Update continuous frame tests to verify stability
- **Risk**: Low - simplifies logic

## Test Strategy

1. Verify single frame behavior (existing tests pass)
2. Verify continuous frame stability with phase shifts
3. Verify pattern matching still works
4. Compare with zero-cross mode stability
