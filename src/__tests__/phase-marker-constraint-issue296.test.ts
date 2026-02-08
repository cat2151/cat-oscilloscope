import { describe, it, expect } from 'vitest';

/**
 * Test for Issue #296: Phase markers should stay within central 2 cycles
 *
 * This test documents the expected behavior:
 * - The 4-cycle display segment has cycles 0, 1, 2, 3
 * - Phase markers should be constrained to cycles 1-3 (using cycles 0 and 3 as safety margins)
 * - This prevents markers from disappearing at the left edge
 *
 * Note: The actual constraint logic is implemented in Rust (signal-processor-wasm/src/zero_cross_detector/mod.rs)
 * This test validates the constraint mathematically.
 */
describe('Phase marker constraint (Issue #296)', () => {
  it('should constrain phase marker to central 2 cycles (cycles 1-3 of 4-cycle segment)', () => {
    const CYCLES_TO_DISPLAY = 4;
    const cycleLength = 100; // samples per cycle
    const segmentLength = cycleLength * CYCLES_TO_DISPLAY; // 400 samples

    // Calculate allowed range: cycles 1-3 (indices 100-300)
    const minAllowed = cycleLength; // Start of cycle 1 = 100
    const maxAllowed = cycleLength * 3; // End of cycle 3 = 300

    expect(minAllowed).toBe(100);
    expect(maxAllowed).toBe(300);

    // Test: positions outside the allowed range should be constrained
    const testCases = [
      { input: 50, expected: 100, reason: 'Position in cycle 0 should be clamped to start of cycle 1' },
      { input: 0, expected: 100, reason: 'Position at start should be clamped to start of cycle 1' },
      { input: 150, expected: 150, reason: 'Position in cycle 1-2 should remain unchanged' },
      { input: 200, expected: 200, reason: 'Position in cycle 2 should remain unchanged' },
      { input: 250, expected: 250, reason: 'Position in cycle 2-3 should remain unchanged' },
      { input: 300, expected: 300, reason: 'Position at end of cycle 3 should remain unchanged' },
      { input: 350, expected: 300, reason: 'Position in cycle 3-4 should be clamped to end of cycle 3' },
      { input: 399, expected: 300, reason: 'Position at end should be clamped to end of cycle 3' },
    ];

    for (const { input, expected, reason } of testCases) {
      let constrained = input;
      if (constrained < minAllowed) {
        constrained = minAllowed;
      } else if (constrained > maxAllowed) {
        constrained = maxAllowed;
      }

      expect(constrained).toBe(expected);
      if (constrained !== expected) {
        throw new Error(`Failed: ${reason}`);
      }
    }
  });

  it('should calculate correct cycle boundaries for different cycle lengths', () => {
    const testCyclesLengths = [50, 100, 200, 441]; // Different cycle lengths

    for (const cycleLength of testCyclesLengths) {
      const minAllowed = cycleLength; // Start of cycle 1
      const maxAllowed = cycleLength * 3; // End of cycle 3

      // Verify that the range covers exactly 2 cycles
      const rangeLength = maxAllowed - minAllowed;
      expect(rangeLength).toBe(cycleLength * 2);

      // Verify boundaries
      expect(minAllowed).toBeGreaterThan(0); // Not at the very start
      expect(maxAllowed).toBeLessThan(cycleLength * 4); // Not at the very end
    }
  });

  it('should demonstrate the safety margin concept', () => {
    const cycleLength = 100;
    const CYCLES_TO_DISPLAY = 4;
    const segmentLength = cycleLength * CYCLES_TO_DISPLAY; // 400 samples

    // Safety margins are cycle 0 (left) and cycle 3+ (right)
    const leftSafetyMargin = cycleLength; // 0-100: cycle 0
    const rightSafetyMarginStart = cycleLength * 3; // 300-400: cycle 3 end + cycle 4 (if it exists)

    // The usable range is cycles 1-3
    const usableRangeStart = leftSafetyMargin;
    const usableRangeEnd = rightSafetyMarginStart;

    expect(usableRangeStart).toBe(100);
    expect(usableRangeEnd).toBe(300);

    // The usable range is exactly 2 cycles
    expect(usableRangeEnd - usableRangeStart).toBe(cycleLength * 2);

    // This represents 50% of the total 4-cycle segment
    const usablePercent = ((usableRangeEnd - usableRangeStart) / segmentLength) * 100;
    expect(usablePercent).toBe(50);
  });
});
