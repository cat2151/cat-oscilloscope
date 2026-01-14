# cat-oscilloscope

<p align="left">
  <a href="README.ja.md"><img src="https://img.shields.io/badge/🇯🇵-Japanese-red.svg" alt="Japanese"></a>
  <a href="README.md"><img src="https://img.shields.io/badge/🇺🇸-English-blue.svg" alt="English"></a>
  <a href="https://deepwiki.com/cat2151/cat-oscilloscope"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki"></a>
  <a href="https://cat2151.github.io/cat-oscilloscope/"><img src="https://img.shields.io/badge/🌐-Live_Demo-green.svg" alt="Live Demo"></a>
</p>

An oscilloscope-style waveform visualizer that runs in the browser.

## 🌐 Live Demo

**[https://cat2151.github.io/cat-oscilloscope/](https://cat2151.github.io/cat-oscilloscope/)**

You can try the application at the URL above. Microphone access permission is required.

## Implementation Status

### ✅ Key Implementations Completed

-   **Rust/WASM Integration**: All data processing algorithms are implemented in Rust/WASM, achieving high-speed and type-safe processing.
-   **Library Support**: Available as an npm library for use in other projects (supports both ESM/CJS, full type definition support).
-   **Phase Alignment Mode**: A new alignment mode that resolves phase shifts in waveforms, including subharmonics (e.g., 1/4 overtones).
-   **5 Frequency Estimation Methods**: Supports Zero-Crossing, Autocorrelation, FFT, STFT, and CQT.
-   **Buffer Size Multiplier**: Extended buffer functionality to improve low-frequency detection accuracy (1x/4x/16x).
-   **Waveform Comparison Panel**: Real-time display of similarity between current and previous waveforms.
-   **Piano Keyboard Display**: Visually displays detected frequencies.

### Current Stability

-   ✅ Major bugs resolved
-   ✅ Highly practical when playing audio from WAV files
-   ✅ Significant improvement in phase stability with Phase Alignment mode during microphone input
-   ⚠️ Microphone input is susceptible to ambient noise, so use in a quiet environment is recommended.

## 📚 Usage as a Library

cat-oscilloscope can be used as an npm library in your own projects. See [LIBRARY_USAGE.md](./LIBRARY_USAGE.md) for detailed instructions.

```typescript
import { Oscilloscope } from 'cat-oscilloscope';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const oscilloscope = new Oscilloscope(canvas);
await oscilloscope.start();
```

## Features

### Frequency Estimation

cat-oscilloscope supports 5 frequency estimation algorithms:

1.  **Zero-Crossing Method**: Simple and fast. Suitable for simple waveforms.
2.  **Autocorrelation Method**: Good balance of accuracy for complex waveforms.
3.  **FFT (Fast Fourier Transform)**: Default. Frequency spectrum analysis. Strong for high frequencies.
4.  **STFT (Short-Time Fourier Transform)**: Variable window length improves low-frequency detection accuracy.
5.  **CQT (Constant Q Transform)**: High frequency resolution in the low-frequency range. Suitable for music analysis.

### Buffer Size Multiplier

To improve low-frequency detection accuracy, extended buffers utilizing past frame buffers are supported:

-   **1x (Standard)**: Standard buffer size (approx. 1/60th of a second)
-   **4x (Better Low Freq)**: 4x extended buffer for improved low-frequency detection accuracy
-   **16x (Best Low Freq)**: 16x extended buffer for best low-frequency detection accuracy

**Usage Example**: For detecting low frequencies between 20-50Hz, selecting STFT or CQT and setting the Buffer Size to 16x is optimal.

**Important Notes:**
-   When changing the buffer size, the new buffer size will not become effective until history accumulates (up to 16 frames).
-   With a large buffer size (16x), initial frequency detection takes approximately 0.3 seconds.

### Detectable Frequency Range

The minimum detectable frequency varies depending on the buffer size:

-   **1x (4096 samples @ 48kHz)**: Approx. 80Hz or higher (standard usage)
-   **4x (16384 samples)**: Approx. 30Hz or higher (improved low frequency)
-   **16x (65536 samples)**: Approx. 20Hz or higher (best low frequency detection)

## Notes

-   **Frequency Estimation**
    -   There are cases where FFT is accurate, and cases where other methods are more accurate.
    -   STFT and CQT are particularly excellent for detecting low frequencies (20-100Hz).
    -   Increasing the buffer size multiplier improves low-frequency accuracy, but slightly delays responsiveness.
    -   **Performance**: With a 16x buffer size, STFT/CQT calculations may take longer (due to implementation for educational purposes).

## About Data Processing Implementation

All data processing (waveform searching, frequency estimation, zero-crossing detection, etc.) is **implemented in Rust/WASM**.

-   **High-speed processing performance**: Efficient execution due to Rust's optimizations
-   **Type-safe and reliable implementation**: Safety ensured by Rust's strict type system
-   **Single implementation**: Algorithms are implemented solely in WASM, eliminating dual management with TypeScript
-   **TypeScript's role**: Responsible only for configuration management and rendering

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

**Note**: For normal usage, Rust toolchain is not required as pre-built WASM files are included in `public/wasm/`.

## Main Features

-   🎤 **Microphone Input** - Captures audio from the microphone in real-time
-   📂 **Audio File** - Supports loop playback of WAV files
-   📊 **Frequency Estimation** - 5 methods: Zero-Crossing, Autocorrelation, FFT, STFT, CQT
-   🎹 **Piano Keyboard Display** - Displays detected frequencies on a keyboard
-   🎚️ **Auto Gain** - Automatically adjusts waveform amplitude
-   🔇 **Noise Gate** - Cuts off signals below a threshold
-   🎯 **3 Alignment Modes**
    -   **Phase**: Phase synchronization (default) - Stable display even for waveforms containing subharmonics via DFT-based phase detection
    -   **Zero-Cross**: Synchronizes at zero-crossing points - Lightweight mode suitable for simple waveforms
    -   **Peak**: Synchronizes at peak points - Stable in high-frequency or noisy environments
-   📈 **FFT Spectrum** - Overlays frequency spectrum
-   🔍 **Waveform Comparison Panel** - Displays similarity between current and previous waveforms
-   ⏸️ **Pause Drawing** - Allows observation of a static waveform

### About Alignment Modes

**Phase Alignment Mode** was added to resolve phase shifts in waveforms containing subharmonics, such as 1/4 overtones, and is now the default mode.

-   **Phase (Phase Synchronization)**: Default. DFT-based phase detection enables stable display even for complex waveforms including subharmonics.
-   **Zero-Cross (Zero-Crossing)**: Lightest. Suitable for simple waveforms.
-   **Peak (Peak Synchronization)**: Stable in high-frequency or noisy environments.

See [docs/PHASE_ALIGNMENT.md](./docs/PHASE_ALIGNMENT.md) for details.

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

Built files are output to the `dist` directory.

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

Launch test UI:

```bash
npm run test:ui
```

See [TESTING.md](TESTING.md) for details.

## How it Works

### Zero-Crossing Detection Algorithm

This oscilloscope implements a zero-crossing detection algorithm as follows:

1.  Scans the audio buffer and detects points where the waveform crosses from negative (or zero) to positive.
2.  Identifies the first zero-crossing point.
3.  Finds the next zero-crossing point to determine one complete waveform cycle.
4.  Displays the waveform with a slight padding before and after the zero-crossing points.

This achieves a stable, non-scrolling display.

### Technical Details

-   **FFT size**: 4096 samples for high resolution
-   **Smoothing**: Disabled (0) for accurate waveform representation
-   **Display padding**: 20 samples before and after the zero-crossing point
-   **Auto Gain**:
    -   Automatically adjusts to target 80% of canvas height
    -   Smooth transitions via peak tracking (decay rate: 0.95)
    -   Gain range: 0.5x to 99x
    -   Interpolation factor: 0.1 (gradual adjustment)
    -   Toggleable via UI checkbox (default: enabled)
-   **Canvas resolution**: 800x400 pixels
-   **Refresh rate**: Synchronized with browser's requestAnimationFrame (approx. 60 FPS)

## Technology Stack

-   **TypeScript** - Type-safe JavaScript
-   **Vite** - Fast build tool and development server
-   **Web Audio API** - Audio capture and analysis
-   **HTML Canvas** - 2D waveform rendering

## Browser Requirements

This application requires:
-   A modern browser supporting Web Audio API (Chrome, Firefox, Safari, Edge)
-   User permission for microphone access
-   HTTPS or localhost (required for microphone access)

## Limitations with Microphone Input

When using input from a microphone, there are the following limitations:

### Impact of Ambient Noise

The microphone picks up all surrounding sounds, so ambient noise can affect the waveform as follows:

-   **Mouse click sound**: The mechanical sound of clicking the mouse will appear in the waveform. Especially when clicking the pause button with the mouse, the waveform may appear disturbed.
-   **Keyboard typing sound**: Keyboard typing sounds also affect the waveform. However, if a quiet keyboard is used, the impact will be less.
-   **Other ambient sounds**: Voices, indoor air conditioning sounds, and external noise can also appear in the waveform.

### Practical Tips

-   **How to pause**: Instead of mouse clicks, using the spacebar on a quiet keyboard can minimize the impact on the waveform when pausing.
-   **Sound source selection**: Since microphone input is susceptible to ambient noise, if you want to observe a noise-free waveform, it is recommended to use an audio file such as a WAV file.
-   **Measurement environment**: Using it in as quiet an environment as possible allows for more accurate waveform observation.

These are not limitations of the application itself, but rather characteristics of the microphone device.

## License

MIT License - See the [LICENSE](LICENSE) file for details

*Big Brother is listening to you. Now it’s the cat.* 🐱