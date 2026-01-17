# cat-oscilloscope

<p align="left">
  <a href="README.ja.md"><img src="https://img.shields.io/badge/🇯🇵-Japanese-red.svg" alt="Japanese"></a>
  <a href="README.md"><img src="https://img.shields.io/badge/🇺🇸-English-blue.svg" alt="English"></a>
  <a href="https://deepwiki.com/cat2151/cat-oscilloscope"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki"></a>
  <a href="https://cat2151.github.io/cat-oscilloscope/"><img src="https://img.shields.io/badge/🌐-Live_Demo-green.svg" alt="Live Demo"></a>
</p>

A browser-based, oscilloscope-style waveform visualizer.

## 🌐 Live Demo

**[https://cat2151.github.io/cat-oscilloscope/](https://cat2151.github.io/cat-oscilloscope/)**

You can try the application at the URL above. Microphone access permission is required.

## Implementation Status

### ✅ Key Implementations Completed

-   **Rust/WASM Integration**: All data processing algorithms are implemented in Rust/WASM, achieving high-speed and type-safe processing.
-   **Library Support**: Available as an npm library for use in other projects (supports both ESM/CJS, with full type definition support).
-   **5 Frequency Estimation Methods**: Supports Zero-Crossing, Autocorrelation, FFT, STFT, and CQT.
-   **Buffer Size Multiplier**: Extended buffer feature (1x/4x/16x) to improve low-frequency detection accuracy.
-   **Waveform Comparison Panel**: Displays the similarity between the previous and current waveforms in real-time.
-   **Piano Keyboard Display**: Visually displays detected frequencies.

### Current Stability

-   ✅ Major bugs resolved.
-   ✅ Highly practical when playing audio from WAV files.
-   ⚠️ Microphone input is susceptible to ambient noise, so use in a quiet environment is recommended.

## 📚 Usage as a Library

cat-oscilloscope can be used as an npm library in your own projects. For detailed instructions, please refer to [LIBRARY_USAGE.md](./LIBRARY_USAGE.md).

⚠️ **Important**: If installing from npm or GitHub, manual WASM file setup is required. See the "WASM File Setup" section in [LIBRARY_USAGE.md](./LIBRARY_USAGE.md) for details.

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

**BufferSource Feature**: Provides a visualization function from static buffers, ideal for integration with audio processing libraries like wavlpf.

**Display Control**: The visibility of overlays (FFT spectrum, harmonic analysis, frequency trend plot) can be controlled with `setDebugOverlaysEnabled()`. The layout can also be customized with `setOverlaysLayout()`. For details, refer to the "Controlling Debug Overlay Display" and "Customizing Overlay Layout" sections in [LIBRARY_USAGE.md](./LIBRARY_USAGE.md).

## Features

### Frequency Estimation

cat-oscilloscope supports 5 frequency estimation algorithms:

1.  **Zero-Crossing**: Simple and fast. Suitable for simple waveforms.
2.  **Autocorrelation**: Good balance of accuracy for complex waveforms.
3.  **FFT (Fast Fourier Transform)**: Default. For frequency spectrum analysis. Strong for high frequencies.
4.  **STFT (Short-Time Fourier Transform)**: Improves low-frequency detection accuracy with variable window lengths.
5.  **CQT (Constant-Q Transform)**: Provides high frequency resolution in the low-frequency range. Suitable for music analysis.

### Buffer Size Multiplier

To improve low-frequency detection accuracy, an extended buffer utilizing past frame buffers is supported:

-   **1x (Standard)**: Standard buffer size (approx. 1/60 seconds)
-   **4x (Better Low Freq)**: 4x extended buffer for improved low-frequency detection accuracy
-   **16x (Best Low Freq)**: 16x extended buffer for best low-frequency detection accuracy

**Example Usage**: For detecting low frequencies (20-50Hz), selecting STFT or CQT and setting the Buffer Size to 16x is optimal.

**Important Notes:**
-   When changing the buffer size, the new buffer size will not take effect until the history accumulates (up to 16 frames).
-   With a large buffer size (16x), initial frequency detection takes approximately 0.3 seconds.

### Detectable Frequency Range

The minimum detectable frequency varies depending on the buffer size:

-   **1x (4096 samples @ 48kHz)**: Approx. 80Hz or higher (standard usage)
-   **4x (16384 samples)**: Approx. 30Hz or higher (improved low-frequency)
-   **16x (65536 samples)**: Approx. 20Hz or higher (best low-frequency detection)

## Notes

-   Frequency Estimation
    -   There are cases where FFT is accurate, and cases where other methods are more accurate.
    -   STFT and CQT are particularly good at detecting low frequencies (20-100Hz).
    -   Increasing the buffer size multiplier improves low-frequency accuracy but slightly increases latency.
    -   **Performance**: With 16x buffer size, STFT/CQT calculations might take longer (due to implementation for educational purposes).

## About Data Processing Implementation

All data processing (waveform searching, frequency estimation, zero-crossing detection, etc.) is **implemented in Rust/WASM**.

-   **High Processing Performance**: Efficient execution due to Rust's optimizations.
-   **Type-Safe and Reliable Implementation**: Safety ensured by Rust's strict type system.
-   **Single Implementation**: Algorithms are implemented solely in WASM, eliminating dual management with TypeScript.
-   **TypeScript's Role**: Responsible only for configuration management and rendering.

### Building the WASM Implementation

The WASM implementation is located in the `wasm-processor` directory.

```bash
# Build WASM implementation (requires wasm-pack)
npm run build:wasm

# Build the entire application (including WASM)
npm run build
```

**Required Tools**:
-   Rust toolchain (rustc, cargo)
-   wasm-pack (`cargo install wasm-pack`)

**Note**: For normal usage, pre-built WASM files are included in `public/wasm/`, so the Rust toolchain is not required.

## Key Features

-   🎤 **Microphone Input** - Captures audio from the microphone in real-time.
-   📂 **Audio File** - Supports looped playback of WAV files.
-   📊 **Frequency Estimation** - 5 methods: Zero-Crossing, Autocorrelation, FFT, STFT, CQT.
-   🎹 **Piano Keyboard Display** - Displays detected frequencies on a keyboard.
-   🎚️ **Auto Gain** - Automatically adjusts waveform amplitude.
-   🔇 **Noise Gate** - Cuts off signals below a threshold.
-   📈 **FFT Spectrum** - Overlays frequency spectrum display.
-   🔍 **Waveform Comparison Panel** - Displays the similarity between the previous and current waveforms.
-   ⏸️ **Pause Drawing** - Allows freezing the waveform for observation.

## Getting Started

### Prerequisites

-   Node.js (v16 or higher recommended)
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

### Preview Production Build

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

Start test UI:

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
    -   Smooth transitions via peak tracking (decay rate: 0.95).
    -   Gain range: 0.5x to 99x.
    -   Interpolation factor: 0.1 (gradual adjustment).
    -   Can be enabled/disabled via UI checkbox (Default: Enabled).
-   **Canvas Resolution**: 800x400 pixels.
-   **Refresh Rate**: Synchronized with browser's requestAnimationFrame (approx. 60 FPS).

## Tech Stack

-   **Rust/WebAssembly** - Fast and type-safe data processing algorithms.
-   **TypeScript** - Type-safe JavaScript (configuration management and rendering).
-   **Vite** - Fast build tool and development server.
-   **Web Audio API** - Audio capture and analysis.
-   **HTML Canvas** - 2D waveform rendering.

## Browser Requirements

This application requires:
-   A modern browser supporting Web Audio API (Chrome, Firefox, Safari, Edge).
-   User permission for microphone access.
-   HTTPS or localhost (required for microphone access).

## Constraints with Microphone Input

When using input from a microphone, there are the following constraints:

### Impact of Ambient Noise

Since the microphone picks up all surrounding sounds, ambient noise can affect the waveform as follows:

-   **Mouse Click Sounds**: The mechanical sound of clicking a mouse will appear in the waveform. Especially when clicking the pause button with a mouse, the waveform may appear distorted.
-   **Keyboard Typing Sounds**: Keyboard typing sounds also affect the waveform. However, if using a quiet keyboard, the impact will be less.
-   **Other Ambient Sounds**: Speaking voices, indoor air conditioning sounds, and external noise will also appear in the waveform.

### Practical Tips

-   **How to Pause**: Instead of mouse clicks, using the spacebar on a quiet keyboard can minimize the impact on the waveform when pausing.
-   **Sound Source Selection**: Since microphone input is susceptible to ambient noise, it is recommended to use audio files such as WAV files if you want to observe waveforms without noise.
-   **Measurement Environment**: Using the application in as quiet an environment as possible will allow for more accurate waveform observation.

These are not limitations of the application itself, but rather characteristics of the microphone as a device.

## License

MIT License - See the [LICENSE](LICENSE) file for details.

*Big Brother is listening to you. Now it’s the cat.* 🐱