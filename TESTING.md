# Testing Documentation

## Overview

This document describes the test suite for the Cat Oscilloscope project. The tests ensure code quality and provide confidence for refactoring.

## Important Note: WASM Implementation

**All data processing algorithms (frequency estimation, gain control, zero-cross detection, waveform search) are implemented in Rust WASM.** TypeScript classes only hold configuration state.

### Test Environment Limitations

- **WASM cannot be loaded in the test environment** (requires browser with script loading)
- Tests that require WASM initialization (integration tests with `oscilloscope.start()`) will timeout
- Algorithm implementation tests are removed from TypeScript tests
- Algorithm correctness is tested in Rust using `wasm-bindgen-test`

### Test Focus

TypeScript tests focus on:
- Configuration management (getters/setters)
- API surface verification
- Library exports
- DOM integration
- Non-WASM components (rendering, UI)

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

| File | Purpose | Status |
|------|---------|--------|
| `oscilloscope.test.ts` | Core Oscilloscope class configuration | ⚠️ Integration tests skip (need WASM) |
| `dom-integration.test.ts` | DOM elements and UI integration | ✅ Passing |
| `algorithms.test.ts` | Configuration API tests | ✅ Passing (impl in Rust) |
| `waveform-searcher.test.ts` | WaveformSearcher configuration | ✅ Passing |
| `waveform-data-processor.test.ts` | WaveformDataProcessor | ⚠️ Limited (needs WASM) |
| `library-exports.test.ts` | Library API surface | ✅ Passing |
| **Rust WASM Tests** | Algorithm implementations | ✅ Tested with wasm-bindgen-test |

## Test Categories

### 1. Configuration API Tests (`algorithms.test.ts`)

Tests configuration management for data processing modules:

#### FrequencyEstimator Configuration
- ✓ Defines valid frequency range (20-5000 Hz)
- ✓ Can switch between all estimation methods
- ✓ Has FFT as default
- ✓ Supports buffer size multipliers (1x, 4x, 16x)
- ✓ Clears history correctly

#### GainController Configuration
- ✓ Toggles auto gain on/off
- ✓ Auto gain enabled by default
- ✓ Toggles noise gate on/off
- ✓ Sets noise gate threshold
- ✓ Clamps threshold at boundaries

#### ZeroCrossDetector Configuration
- ✓ Toggles peak mode on/off
- ✓ Peak mode disabled by default
- ✓ Has reset method for API compatibility

#### WaveformSearcher Configuration
- ✓ No previous waveform initially
- ✓ Zero similarity initially
- ✓ Resets state correctly

### 2. Core Oscilloscope Tests (`oscilloscope.test.ts`)

⚠️ **Note**: Tests requiring `oscilloscope.start()` will timeout because WASM cannot initialize in test environment.

Passing tests (configuration only):
- ✓ Constructor validates canvas
- ✓ Configuration getters/setters work
- ✓ Auto gain configuration
- ✓ Noise gate configuration
- ✓ Frequency method configuration
- ✓ FFT display configuration

Skipped tests (require WASM):
- ⏭️ Start/stop lifecycle (needs WASM init)
- ⏭️ Integration with audio processing (needs WASM)

### 3. DOM Integration Tests (`dom-integration.test.ts`)

#### Element Validation
- ✓ Finds all required DOM elements
- ✓ Validates initial checkbox states
- ✓ Validates initial threshold value
- ✓ Validates default frequency method selection

- ✓ Validates initial threshold value
- ✓ Validates default frequency method selection

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

### 4. Library Exports Tests (`library-exports.test.ts`)

- ✓ Exports all public classes
- ✓ Exports utility functions
- ✓ Can instantiate all classes
- ✓ WaveformDataProcessor exports correctly

## Rust WASM Tests

Algorithm implementations are tested in Rust:

```bash
cd wasm-processor
wasm-pack test --headless --chrome  # or --firefox
```

Tests include:
- Frequency estimation algorithms (zero-crossing, autocorrelation, FFT, STFT, CQT)
- Gain control and noise gate
- Zero-cross and peak detection
- Waveform similarity search
- Edge cases and error handling

### 3. Algorithm Tests (`algorithms.test.ts`)

⚠️ **Deprecated**: Algorithm implementation tests removed. Algorithms are now tested in Rust.

Kept tests focus on configuration API only.

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

## Running Tests

### Run TypeScript Tests
```bash
npm test
```

### Run Rust WASM Tests
```bash
cd wasm-processor
wasm-pack test --headless --chrome
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
- ✅ Configuration API is tested
- ✅ Library exports are verified
- ✅ DOM integration is tested
- ✅ Algorithm implementations tested in Rust
- ⚠️ Integration tests limited (WASM load restriction)

## Integration Testing Strategy

Since WASM cannot load in unit test environment:

1. **Unit Tests (TypeScript)**: Configuration and API surface
2. **Unit Tests (Rust)**: Algorithm implementations with `wasm-bindgen-test`
3. **E2E Tests (Browser)**: Full integration testing with real WASM loading
   - Manual testing in browser
   - Future: Playwright/Cypress E2E tests

## Benefits for Maintenance

These tests provide:

1. **API Stability**: Configuration interface is verified
2. **Behavior Documentation**: Tests document expected behavior
3. **Refactoring Confidence**: Can modify code safely
4. **Fast Feedback**: Unit tests run in milliseconds
5. **Type Safety**: TypeScript catches type errors

## Future Test Additions

Potential improvements:
- [ ] E2E tests with Playwright/Cypress (for WASM integration)
- [ ] Performance benchmarks
- [ ] Visual regression tests
- [ ] More Rust WASM test coverage

## Notes

### WASM Loading Limitation
**Key Limitation**: WASM modules cannot be loaded in the test environment because:
- Test environment (happy-dom) doesn't support dynamic script loading
- WASM initialization requires browser APIs
- This is expected and by design

**Solution**: Algorithm correctness is tested in Rust. Integration is tested manually or with E2E tools.

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

✅ **Configuration tests passing**
✅ **Library exports verified**
✅ **Rust WASM tests passing**
✅ **Build succeeds without warnings**
⚠️ **Integration tests skip in unit test environment (expected)**
✅ **Code ready for safe maintenance**
