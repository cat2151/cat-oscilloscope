# cat-oscilloscope

<p align="left">
  <a href="README.ja.md"><img src="https://img.shields.io/badge/🇯🇵-Japanese-red.svg" alt="Japanese"></a>
  <a href="README.md"><img src="https://img.shields.io/badge/🇺🇸-English-blue.svg" alt="English"></a>
  <a href="https://deepwiki.com/cat2151/cat-oscilloscope"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki"></a>
  <a href="https://cat2151.github.io/cat-oscilloscope/"><img src="https://img.shields.io/badge/🌐-Live_Demo-green.svg" alt="Live Demo"></a>
</p>

A browser-based, oscilloscope-style waveform visualizer.

## Status
- This document still contains AI-generated text, which can be difficult to read. We plan to improve the readability of the text manually in the future.

## 🌐 Live Demo

**Full Version**: [https://cat2151.github.io/cat-oscilloscope/](https://cat2151.github.io/cat-oscilloscope/)  
**Simple Demo (Library Usage Example)**: [https://cat2151.github.io/cat-oscilloscope/demo-simple.html](https://cat2151.github.io/cat-oscilloscope/demo-simple.html)

You can try the application at the URLs above. The full version requires microphone access permission. The simple demo is a minimal implementation example using BufferSource, demonstrating how to use the library via CDN.

## Implementation Status

### ✅ Key Implementations Completed

- **Rust/WASM Integration**: All data processing algorithms are implemented in Rust/WASM, achieving high-speed and type-safe processing.
- **Library Support**: Available as an npm library for use in other projects (supports both ESM/CJS, full type definition support).
- **5 Frequency Estimation Methods**: Supports Zero-Crossing, Autocorrelation, FFT, STFT, and CQT.
- **Buffer Size Multiplier**: Extended buffer feature (1x/4x/16x) to improve low-frequency detection accuracy.
- **Waveform Comparison Panel**: Displays real-time similarity between current and previous waveforms.
- **Piano Keyboard Display**: Visually represents detected frequencies.

### Current Stability

- ✅ Major bugs resolved.
- ✅ Highly practical when playing audio from WAV files.
- ⚠️ Microphone input is susceptible to ambient noise; usage in a quiet environment is recommended.

## 📚 Usage as a Library

cat-oscilloscope can be used as an npm library in your own projects. See [LIBRARY_USAGE.md](./LIBRARY_USAGE.md) for detailed instructions.

⚠️ **Important**: When installing from npm or GitHub, manual setup of WASM files is required. Refer to the "WASM File Setup" section in [LIBRARY_USAGE.md](./LIBRARY_USAGE.md) for details.

```typescript
import { Oscilloscope, BufferSource } from 'cat-oscilloscope';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const oscilloscope = new Oscilloscope(canvas);

// Visualize from microphone input
await oscilloscope.start();

// Visualize from static buffer (no audio playback)
const audioData = new Float32Array(44100); // 1 second of data
const bufferSource = new BufferSource(audioData, 44100, { loop: true });
await oscilloscope.startFromBuffer(bufferSource);
```

**BufferSource Feature**: Provides visualization from static buffers, ideal for integration with audio processing libraries like wavlpf.

**Display Control**: Display/hide overlays (FFT spectrum, harmonic analysis, frequency trend plot) can be controlled with `setDebugOverlaysEnabled()`. Additionally, you can customize the layout with `setOverlaysLayout()`. See "Controlling Debug Overlay Display" and "Customizing Overlay Layout" in [LIBRARY_USAGE.md](./LIBRARY_USAGE.md) for details.

## Features

### Frequency Estimation

cat-oscilloscope supports five frequency estimation algorithms:

1.  **Zero-Crossing**: Simple and fast. Suitable for simple waveforms.
2.  **Autocorrelation**: Provides balanced accuracy for complex waveforms.
3.  **FFT (Fast Fourier Transform)**: Default. For frequency spectrum analysis. Strong for high frequencies.
4.  **STFT (Short-Time Fourier Transform)**: Improved low-frequency detection accuracy with variable window lengths.
5.  **CQT (Constant-Q Transform)**: High-frequency resolution in the low-frequency range. Suitable for music analysis.

### Buffer Size Multiplier

Supports an extended buffer using past frame buffers to improve low-frequency detection accuracy:

-   **1x (Standard)**: Standard buffer size (approx. 1/60th of a second).
-   **4x (Better Low Freq)**: 4x extended buffer for improved low-frequency detection.
-   **16x (Best Low Freq)**: 16x extended buffer for best low-frequency detection accuracy.

**Usage Example**: For detecting low frequencies between 20-50Hz, selecting STFT or CQT and setting the Buffer Size to 16x is optimal.

**Important Notes:**
- When changing the buffer size, the new buffer size will not take effect until the history accumulates (up to 16 frames).
- With a large buffer size (16x), initial frequency detection may take approximately 0.3 seconds.

### Detectable Frequency Range

The minimum detectable frequency varies with buffer size:

-   **1x (4096 samples @ 48kHz)**: Approx. 80Hz or higher (standard usage).
-   **4x (16384 samples)**: Approx. 30Hz or higher (improved low-frequency).
-   **16x (65536 samples)**: Approx. 20Hz or higher (best low-frequency detection).

## Notes

- Frequency Estimation
  - There are times when FFT is accurate, and times when other methods are more accurate.
  - STFT and CQT are particularly good at detecting low frequencies (20-100Hz).
  - Increasing the buffer size multiplier improves low-frequency accuracy but slightly delays responsiveness.
  - **Performance**: With 16x buffer size, STFT/CQT calculations may take longer (due to an educational implementation).

- Offset % Overlay (Investigating Issue #254)
  - A graph displayed in the upper right of the "Current Waveform" panel, showing the position of the phase marker within the 4-period coordinate system.
  - **Important: Understanding the Coordinate System**
    - **4-Period Coordinate System**: Relative position (0-100%) within the displayed 4 periods of the waveform ← This is important.
    - **Full Frame Coordinate System**: Absolute position within the entire sample buffer ← Not subject to this investigation.
  - **Terminology**:
    - **start offset**: Where the phase 0 marker (start position) is located within the 4-period coordinate system (0-100%).
    - **end offset**: Where the phase 2π marker (end position) is located within the 4-period coordinate system (0-100%).
    - **offsetChange**: The amount of offset change from the previous frame (specification: within 1%).
  - **Display Content**:
    - Red line (S): start offset (position of phase 0 in 4-period coordinate system, 0-100%)
    - Orange line (E): end offset (position of phase 2π in 4-period coordinate system, 0-100%)
  - **Specification Violation Detection**:
    - A warning is output if a change exceeding 1% between frames is detected in the 4-period coordinate system.
    - Diagnostic information includes:
      - Current and previous frame values of start/end offset (position % within 4-period coordinate system).
      - offsetChange (amount of change, spec is within 1%).
      - SPEC_VIOLATION flag.
  - **Purpose**: To verify that the offset adheres to the specification (within 1%) in the 4-period coordinate system.

## About Data Processing Implementation

All data processing (waveform searching, frequency estimation, zero-crossing detection, etc.) is **implemented in Rust/WASM**.

-   **High-speed processing performance**: Efficient execution through Rust's optimizations.
-   **Type-safe and reliable implementation**: Safety through Rust's strict type system.
-   **Single Implementation**: Algorithms are implemented solely in WASM, eliminating dual management with TypeScript.
-   **Role of TypeScript**: Responsible only for configuration management and rendering.

### Building the WASM Implementation

The WASM implementation is located in the `signal-processor-wasm` directory.

```bash
# Build WASM implementation (wasm-pack is required)
npm run build:wasm

# Build the entire application (including WASM)
npm run build
```

**Required Tools**:
- Rust toolchain (rustc, cargo)
- wasm-pack (`cargo install wasm-pack`)

**Note**: For normal usage, pre-built WASM files are included in `public/wasm/`, so the Rust toolchain is not required.

## Key Features

-   🎤 **Microphone Input** - Real-time capture of audio from the microphone.
-   📂 **Audio Files** - Supports looped playback of WAV files.
-   📊 **Frequency Estimation** - 5 methods: Zero-Crossing, Autocorrelation, FFT, STFT, CQT.
-   🎹 **Piano Keyboard Display** - Displays detected frequencies on a piano keyboard.
-   🎚️ **Auto Gain** - Automatically adjusts waveform amplitude.
-   🔇 **Noise Gate** - Cuts off signals below a threshold.
-   📈 **FFT Spectrum** - Overlays the frequency spectrum.
-   🔍 **Waveform Comparison Panel** - Displays similarity between current and previous waveforms.
-   ⏸️ **Pause Drawing** - Freeze the waveform for observation.

## Getting Started

### Prerequisites

-   Node.js (v16 or later recommended)
-   npm or yarn

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000/` in your browser.

### Build

Build for production:

```bash
npm run build
```

The built files will be output to the `dist` directory.

### Previewing Production Build

```bash
npm run preview
```

### Testing

Run tests:

```bash
npm test
```

Generate coverage report:

```bash
npm run test:coverage
```

Launch test UI:

```bash
npm run test:ui
```

## How It Works

### Zero-Crossing Detection Algorithm

This oscilloscope implements a zero-crossing detection algorithm as follows:

1.  Scans the audio buffer to detect points where the waveform crosses from negative (or zero) to positive.
2.  Identifies the first zero-crossing point.
3.  Finds the next zero-crossing point to determine one complete waveform cycle.
4.  Displays the waveform with a slight padding before and after the zero-crossing points.

This achieves a stable, non-scrolling display.

### Technical Details

-   **FFT Size**: 4096 samples for high resolution.
-   **Smoothing**: Disabled (0) for accurate waveform representation.
-   **Display Padding**: 20 samples before and after zero-crossing points.
-   **Auto Gain**:
    -   Automatically adjusts to target 80% of canvas height.
    -   Smooth transition through peak tracking (decay rate: 0.95).
    -   Gain range: 0.5x to 99x.
    -   Interpolation factor: 0.1 (gradual adjustment).
    -   Toggle enabled/disabled via UI checkbox (default: enabled).
-   **Canvas Resolution**: 800x400 pixels.
-   **Refresh Rate**: Synchronized with browser's requestAnimationFrame (approx. 60 FPS).

## Technology Stack

-   **Rust/WebAssembly** - For fast and type-safe data processing algorithms.
-   **TypeScript** - Type-safe JavaScript (for configuration management and rendering).
-   **Vite** - Fast build tool and development server.
-   **Web Audio API** - For audio capture and analysis.
-   **HTML Canvas** - For 2D waveform rendering.

## Browser Requirements

This application requires:
-   A modern browser that supports the Web Audio API (Chrome, Firefox, Safari, Edge).
-   User permission for microphone access.
-   HTTPS or localhost (required for microphone access).

## Limitations with Microphone Input

When using input from a microphone, there are the following limitations:

### Environmental Noise Impact

The microphone picks up all ambient sounds, so environmental noise can affect the waveform:

-   **Mouse Click Sounds**: Mechanical sounds from clicking the mouse will appear in the waveform. Specifically, the waveform may appear distorted at the moment the pause button is clicked with the mouse.
-   **Keyboard Typing Sounds**: Keyboard typing sounds also affect the waveform. However, if a quiet keyboard is used, the impact will be minimal.
-   **Other Environmental Sounds**: Speech, indoor air conditioning sounds, and external noise can also appear in the waveform.

### Practical Tips

-   **How to Pause**: Instead of mouse clicks, using the spacebar on a quiet keyboard can minimize the impact on the waveform when pausing.
-   **Sound Source Selection**: Since microphone input is susceptible to ambient noise, if you want to observe a waveform without noise, it is recommended to use an audio file such as a WAV file.
-   **Measurement Environment**: Using the application in as quiet an environment as possible will allow for more accurate waveform observation.

These are not limitations of the application itself, but rather characteristics of the microphone device.

## Development & Maintenance

### Automated Code Quality Checks

This project performs the following automated checks to maintain code quality:

-   **Large File Detection**: Checks source file line counts daily in a batch and automatically creates an issue if any file exceeds 500 lines.
    -   Configuration file: `.github/check-large-files.toml`
    -   Execution script: `.github/scripts/check_large_files.py`
    -   Workflow: `.github/workflows/check-large-files.yml`
    -   Automatically executed daily at 09:00 JST (manual execution also possible).

This mechanism allows for early detection before files become too large, enabling consideration for refactoring at appropriate times.

## License

MIT License - See the [LICENSE](LICENSE) file for details.

*Big Brother is listening to you. Now it’s the cat.* 🐱