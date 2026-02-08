import { describe, it, expect } from 'vitest';

/**
 * Test for Issue #296: Phase markers should stay within central 2 cycles
 *
 * This test documents the expected behavior:
 * - The 4-cycle display segment has cycles 0, 1, 2, 3 (0-based)
 * - Phase markers should be constrained to cycles 1 and 2 (the "central 2 cycles")
 * - This uses cycle 0 and cycles 3+ as safety margins to prevent disappearing at edges
 * - Range is [cycleLength, cycleLength*3) - inclusive start, exclusive end
 *
 * Note: The actual constraint logic is implemented in Rust (signal-processor-wasm/src/zero_cross_detector/mod.rs)
 * This test validates the constraint mathematically.
 */
describe('Phase marker constraint (Issue #296)', () => {
  it('should constrain phase marker to central 2 cycles (cycles 1-2 of 4-cycle segment)', () => {
    const CYCLES_TO_DISPLAY = 4;
    const cycleLength = 100; // samples per cycle

    // Calculate allowed range: cycles 1-2 (half-open range [100, 300))
    // Inclusive lower bound: start of cycle 1
    // Exclusive upper bound: start of cycle 3
    const minAllowed = cycleLength; // Start of cycle 1 = 100
    const maxAllowedExclusive = cycleLength * 3; // Start of cycle 3 = 300 (exclusive)

    expect(minAllowed).toBe(100);
    expect(maxAllowedExclusive).toBe(300);

    // Test: positions outside the allowed range should be constrained
    // Note: max is exclusive, so 300 and above should be clamped to 299 (last valid position in cycle 2)
    const testCases = [
      { input: 50, expected: 100, reason: 'Position in cycle 0 should be clamped to start of cycle 1' },
      { input: 0, expected: 100, reason: 'Position at start should be clamped to start of cycle 1' },
      { input: 150, expected: 150, reason: 'Position in cycle 1 should remain unchanged' },
      { input: 200, expected: 200, reason: 'Position in cycle 2 should remain unchanged' },
      { input: 299, expected: 299, reason: 'Position at last sample of cycle 2 should remain unchanged' },
      { input: 300, expected: 299, reason: 'Position at start of cycle 3 should be clamped to last valid position' },
      { input: 350, expected: 299, reason: 'Position in cycle 3 should be clamped to last valid position' },
      { input: 399, expected: 299, reason: 'Position at end should be clamped to last valid position' },
    ];

    for (const { input, expected, reason } of testCases) {
      let constrained = input;
      if (constrained < minAllowed) {
        constrained = minAllowed;
      } else if (constrained >= maxAllowedExclusive) {
        constrained = maxAllowedExclusive - 1;
      }

      expect(constrained, reason).toBe(expected);
    }
  });

  it('should calculate correct cycle boundaries for different cycle lengths', () => {
    const testCyclesLengths = [50, 100, 200, 441]; // Different cycle lengths

    for (const cycleLength of testCyclesLengths) {
      const minAllowed = cycleLength; // Start of cycle 1
      const maxAllowedExclusive = cycleLength * 3; // Start of cycle 3 (exclusive)

      // Verify that the range covers exactly 2 cycles
      const rangeLength = maxAllowedExclusive - minAllowed;
      expect(rangeLength).toBe(cycleLength * 2);

      // Verify boundaries
      expect(minAllowed).toBeGreaterThan(0); // Not at the very start
      expect(maxAllowedExclusive).toBeLessThanOrEqual(cycleLength * 4); // Not beyond the segment
    }
  });

  it('should demonstrate the safety margin concept', () => {
    const cycleLength = 100;
    const CYCLES_TO_DISPLAY = 4;

    // Safety margins are cycle 0 (left) and cycles 3+ (right)
    const leftSafetyMargin = cycleLength; // 0-100: cycle 0
    const rightSafetyMarginStart = cycleLength * 3; // 300+: cycles 3+

    // The usable range is cycles 1-2 (the central 2 cycles)
    const usableRangeStart = leftSafetyMargin;
    const usableRangeEndExclusive = rightSafetyMarginStart;

    expect(usableRangeStart).toBe(100);
    expect(usableRangeEndExclusive).toBe(300);

    // The usable range is exactly 2 cycles
    expect(usableRangeEndExclusive - usableRangeStart).toBe(cycleLength * 2);

    // This represents 50% of the total 4-cycle segment
    const usablePercent = ((usableRangeEndExclusive - usableRangeStart) / (cycleLength * CYCLES_TO_DISPLAY)) * 100;
    expect(usablePercent).toBe(50);
  });
});
