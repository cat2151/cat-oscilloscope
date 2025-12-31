# Testing Documentation

## Overview

This document describes the test suite for the Cat Oscilloscope project. The tests are designed to ensure refactoring safety before splitting the monolithic `Oscilloscope` class into smaller, more maintainable modules.

## Test Infrastructure

### Technology Stack
- **Vitest**: Modern, fast testing framework compatible with Vite
- **Happy-DOM**: Lightweight DOM implementation for Node.js testing
- **TypeScript**: Type-safe test code

### Configuration
Tests are configured in `vite.config.ts`:
```typescript
{
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
}
```

## Test Structure

### Test Files

| File | Purpose | Test Count |
|------|---------|-----------|
| `oscilloscope.test.ts` | Core Oscilloscope class functionality | 20 tests |
| `dom-integration.test.ts` | DOM elements and UI integration | 16 tests |
| `algorithms.test.ts` | Signal processing algorithms | 20 tests |
| **Total** | **Complete test coverage** | **56 tests** |

## Test Categories

### 1. Core Oscilloscope Tests (`oscilloscope.test.ts`)

#### Constructor Tests
- ✓ Creates instance with valid canvas
- ✓ Throws error when canvas context unavailable

#### Lifecycle Tests
- ✓ Starts oscilloscope successfully
- ✓ Stops oscilloscope successfully
- ✓ Cleans up resources on stop

#### Auto Gain Tests
- ✓ Auto gain enabled by default
- ✓ Can disable auto gain
- ✓ Resets gain to 1.0 when disabled

#### Noise Gate Tests
- ✓ Noise gate enabled by default
- ✓ Can enable/disable noise gate
- ✓ Default threshold is 0.01
- ✓ Can set threshold
- ✓ Clamps threshold between 0 and 1

#### Frequency Estimation Tests
- ✓ Autocorrelation is default method
- ✓ Can switch to zero-crossing method
- ✓ Can switch to FFT method
- ✓ Initializes estimated frequency to 0

#### FFT Display Tests
- ✓ FFT display enabled by default
- ✓ Can enable/disable FFT display

#### Gain Tests
- ✓ Initializes current gain to 1.0

### 2. DOM Integration Tests (`dom-integration.test.ts`)

#### Element Validation
- ✓ Finds all required DOM elements
- ✓ Validates initial checkbox states
- ✓ Validates initial threshold value
- ✓ Validates default frequency method selection

#### Slider Conversion
- ✓ Converts slider value 0 → 0.00
- ✓ Converts slider value 1 → 0.01
- ✓ Converts slider value 50 → 0.50
- ✓ Converts slider value 100 → 1.00
- ✓ Handles invalid slider values

#### Canvas Properties
- ✓ Verifies canvas dimensions (800x400)
- ✓ Can get 2D context

#### Button States
- ✓ Start button has correct initial text
- ✓ Status text is correct

#### Display Elements
- ✓ Has all frequency method options
- ✓ Has placeholder frequency value
- ✓ Has placeholder gain value

### 3. Algorithm Tests (`algorithms.test.ts`)

#### Zero-Crossing Detection
- ✓ Detects zero-crossings in sine wave (±5% tolerance)
- ✓ Detects zero-crossings in square wave (±2 samples)
- ✓ Finds no zero-crossings in DC signal
- ✓ Finds no zero-crossings in silence

#### Noise Gate RMS Calculation
- ✓ Calculates correct RMS for sine wave (RMS = A/√2)
- ✓ Calculates RMS close to zero for low noise
- ✓ Calculates RMS of zero for silence

#### Auto Gain Edge Cases
- ✓ Handles very low amplitude signals
- ✓ Handles very high amplitude signals
- ✓ Resets gain to 1.0 when disabled
- ✓ Maintains gain within MIN/MAX bounds (0.5-99.0)

#### Signal Characteristics
- ✓ Sine wave has correct peak amplitude
- ✓ Square wave has correct peak amplitude
- ✓ Noise has bounded amplitude

#### Frequency Estimation
- ✓ Can switch between all methods
- ✓ Has autocorrelation as default
- ✓ Defines valid frequency range (50-1000 Hz)

#### Noise Gate Behavior
- ✓ Applies noise gate when enabled
- ✓ Doesn't apply when disabled
- ✓ Clamps threshold at boundaries

## Test Helpers

### Mock Classes
The tests include comprehensive mocks for Web Audio API:

```typescript
class MockAudioContext {
  sampleRate = 48000;
  createMediaStreamSource() { ... }
  createAnalyser() { ... }
  async close() { ... }
}

class MockMediaStream {
  getTracks() { ... }
}
```

### Signal Generators
Utility functions for generating test signals:

```typescript
// Generate sine wave at specific frequency
generateSineWave(frequency, sampleRate, length, amplitude)

// Generate square wave
generateSquareWave(frequency, sampleRate, length, amplitude)

// Generate white noise
generateNoise(length, amplitude)

// Count zero-crossings in signal
countZeroCrossings(data)
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with UI
```bash
npm run test:ui
```

### Generate Coverage Report
```bash
npm run test:coverage
```

## Test Coverage Goals

Current test coverage ensures:
- ✅ All public methods are tested
- ✅ Edge cases are covered
- ✅ DOM integration is verified
- ✅ Algorithms are mathematically validated
- ✅ Error conditions are tested

## Benefits for Refactoring

These tests provide:

1. **Regression Detection**: Any breaking changes will fail tests immediately
2. **Behavior Documentation**: Tests document expected behavior
3. **Refactoring Confidence**: Can split code safely knowing tests will catch issues
4. **Fast Feedback**: Vitest runs in milliseconds
5. **Type Safety**: TypeScript catches type errors before runtime

## Future Test Additions

When refactoring the Oscilloscope class, add tests for:
- [ ] Individual module integration
- [ ] Performance benchmarks
- [ ] Visual regression tests (if splitting rendering logic)
- [ ] End-to-end browser tests

## Notes

### Web Audio API Limitations
The test environment uses mocks because:
- Happy-DOM doesn't implement Web Audio API
- Real audio testing requires browser environment
- Mocks allow unit testing of logic without browser

### Floating Point Precision
Some tests use `toBeCloseTo()` instead of `toBe()` to handle JavaScript floating point precision issues.

### Test Isolation
Each test:
- Creates fresh instances
- Clears mocks after execution
- Doesn't depend on other tests
- Can run in any order

## Maintenance

### Adding New Tests
1. Create test file in `src/__tests__/`
2. Follow existing patterns for mocks
3. Use descriptive test names
4. Group related tests with `describe()`
5. Run tests to verify they pass

### Updating Tests
When modifying code:
1. Update tests to match new behavior
2. Don't remove tests unless feature is removed
3. Maintain test coverage percentage
4. Document any new test helpers

## Success Criteria

✅ **All 56 tests passing**
✅ **Build succeeds without warnings**
✅ **Tests run in < 1 second**
✅ **No test dependencies or flakiness**
✅ **Code ready for safe refactoring**
