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

- **Rust/WASM Integration**: All data processing algorithms are implemented in Rust/WASM, achieving high-speed and type-safe processing.
- **Library Support**: Available as an npm library for use in other projects (supports both ESM/CJS, with full type definition support).
- **Phase Alignment Mode**: A new alignment mode that resolves phase shifts in waveforms, including subharmonics (e.g., 1/4 harmonic).
- **5 Frequency Estimation Methods**: Supports Zero-Crossing, Autocorrelation, FFT, STFT, and CQT.
- **Buffer Size Multiplier**: An extended buffer feature (1x/4x/16x) to improve low-frequency detection accuracy.
- **Waveform Comparison Panel**: Displays the similarity between previous and current waveforms in real-time.
- **Piano Keyboard Display**: Visually shows detected frequencies.

### Current Stability

- ✅ Major bugs resolved
- ✅ Highly practical when playing audio from WAV files
- ✅ Phase stability significantly improved with Phase Alignment mode during microphone input
- ⚠️ Microphone input is affected by ambient noise, so use in a quiet environment is recommended.

## 📚 Usage as a Library

cat-oscilloscope can be used as an npm library in your own projects. For detailed instructions, please refer to [LIBRARY_USAGE.md](./LIBRARY_USAGE.md).

```typescript
import { Oscilloscope, BufferSource } from 'cat-oscilloscope';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const oscilloscope = new Oscilloscope(canvas);

// Visualize from microphone input
await oscilloscope.start();

// Visualize from a static buffer (no audio playback)
const audioData = new Float32Array(44100); // 1 second of data
const bufferSource = new BufferSource(audioData, 44100, { loop: true });
await oscilloscope.startFromBuffer(bufferSource);
```

The **BufferSource feature** provides visualization from static buffers, ideal for integration with audio processing libraries like wavlpf.

## Features

### Frequency Estimation

cat-oscilloscope supports 5 frequency estimation algorithms:

1.  **Zero-Crossing**: Simple and fast. Suitable for basic waveforms.
2.  **Autocorrelation**: Provides a good balance of accuracy for complex waveforms.
3.  **FFT (Fast Fourier Transform)**: Default. Frequency spectrum analysis. Strong for high frequencies.
4.  **STFT (Short-Time Fourier Transform)**: Improves low-frequency detection accuracy with variable window length.
5.  **CQT (Constant Q Transform)**: Offers high frequency resolution in the low-frequency range. Suitable for musical analysis.

### Buffer Size Multiplier

To improve low-frequency detection accuracy, an extended buffer using past frame buffers is supported:

-   **1x (Standard)**: Standard buffer size (approx. 1/60 second)
-   **4x (Better Low Freq)**: 4x extended buffer for improved low-frequency detection
-   **16x (Best Low Freq)**: 16x extended buffer for best low-frequency detection accuracy

**Usage Example**: For detecting low frequencies between 20-50Hz, selecting STFT or CQT and setting Buffer Size to 16x is optimal.

**Important Notes:**
-   Changing the buffer size will not activate the new buffer size until the history accumulates (up to 16 frames).
-   With larger buffer sizes (16x), initial frequency detection may take approximately 0.3 seconds.

### Detectable Frequency Range

The minimum detectable frequency varies depending on the buffer size:

-   **1x (4096 samples @ 48kHz)**: Approx. 80Hz or higher (standard usage)
-   **4x (16384 samples)**: Approx. 30Hz or higher (improved low frequency)
-   **16x (65536 samples)**: Approx. 20Hz or higher (best low-frequency detection)

## Notes

-   **Frequency Estimation**:
    -   Sometimes FFT is accurate, and sometimes other methods are more accurate.
    -   STFT and CQT are particularly excellent at detecting low frequencies (20-100Hz).
    -   Increasing the buffer size multiplier improves low-frequency accuracy, but response time will be slightly slower.
    -   **Performance**: With 16x buffer size, STFT/CQT calculations may take longer (due to its educational implementation).

## About Data Processing Implementation

All data processing (waveform searching, frequency estimation, zero-crossing detection, etc.) is **implemented in Rust/WASM**.

-   **High-speed processing performance**: Efficient execution due to Rust's optimizations
-   **Type-safe and reliable implementation**: Safety through Rust's strict type system
-   **Single implementation**: Algorithms are implemented solely in WASM, eliminating dual management with TypeScript
-   **TypeScript's role**: Only responsible for configuration management and rendering

### Building the WASM Implementation

The WASM implementation is located in the `wasm-processor` directory.

```bash
# Build the WASM implementation (requires wasm-pack)
npm run build:wasm

# Build the entire application (including WASM)
npm run build
```

**Required Tools**:
-   Rust toolchain (rustc, cargo)
-   wasm-pack (`cargo install wasm-pack`)

**Note**: For typical usage, the Rust toolchain is not required, as pre-built WASM files are included in `public/wasm/`.

## Core Features

-   🎤 **Microphone Input** - Captures audio from the microphone in real-time
-   📂 **Audio File** - Supports looped playback of WAV files
-   📊 **Frequency Estimation** - 5 methods: Zero-Crossing, Autocorrelation, FFT, STFT, CQT
-   🎹 **Piano Keyboard Display** - Displays detected frequencies on a piano keyboard
-   🎚️ **Auto Gain** - Automatically adjusts waveform amplitude
-   🔇 **Noise Gate** - Cuts off signals below a threshold
-   🎯 **3 Alignment Modes**
    -   **Phase**: Phase synchronization (default) - Stable display even for waveforms containing subharmonics
    -   **Zero-Cross**: Synchronizes at zero-crossing points - Lightweight mode suitable for simple waveforms
    -   **Peak**: Synchronizes at peak points - Stable in high-frequency or noisy environments
-   📈 **FFT Spectrum** - Overlays frequency spectrum display
-   🔍 **Waveform Comparison Panel** - Displays the similarity between previous and current waveforms
-   ⏸️ **Pause Drawing** - Allows freezing the waveform for observation

### About Alignment Modes

The **Phase Alignment Mode** was added to resolve phase shifts in waveforms, including subharmonics (e.g., 1/4 harmonic), and is now the default mode.

-   **Phase**: Default. DFT-based phase detection enables stable display even for complex waveforms containing subharmonics.
-   **Zero-Cross**: Most lightweight. Suitable for simple waveforms.
-   **Peak**: Stable in high-frequency or noisy environments.

For more details, refer to [docs/PHASE_ALIGNMENT.md](./docs/PHASE_ALIGNMENT.md).

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

Built files will be output to the `dist` directory.

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

For more details, refer to [TESTING.md](TESTING.md).

## How It Works

### Zero-Crossing Detection Algorithm

This oscilloscope implements a zero-crossing detection algorithm as follows:

1.  Scans the audio buffer to detect points where the waveform crosses from negative (or zero) to positive.
2.  Identifies the first zero-crossing point.
3.  Finds the next zero-crossing point to determine one complete waveform cycle.
4.  Displays the waveform with a slight padding before and after the zero-crossing points.

This results in a stable, non-scrolling display.

### Technical Details

-   **FFT Size**: 4096 samples for high resolution
-   **Smoothing**: Disabled (0) for accurate waveform representation
-   **Display Padding**: 20 samples before and after zero-crossing points
-   **Auto Gain**:
    -   Automatically adjusts to target 80% of canvas height.
    -   Smooth transitions via peak tracking (decay rate: 0.95).
    -   Gain range: 0.5x to 99x.
    -   Interpolation factor: 0.1 (gradual adjustment).
    -   Toggleable via UI checkbox (default: enabled).
-   **Canvas Resolution**: 800x400 pixels
-   **Refresh Rate**: Synchronized with browser's `requestAnimationFrame` (approx. 60 FPS)

## Technology Stack

-   **TypeScript** - Type-safe JavaScript
-   **Vite** - Fast build tool and development server
-   **Web Audio API** - Audio capture and analysis
-   **HTML Canvas** - 2D waveform rendering

## Browser Requirements

This application requires the following:
-   A modern browser that supports the Web Audio API (Chrome, Firefox, Safari, Edge)
-   User permission for microphone access
-   HTTPS or localhost (required for microphone access)

## Microphone Input Constraints

When using input from a microphone, the following constraints apply:

### Impact of Ambient Noise

Since the microphone picks up all ambient sounds, environmental noise can affect the waveform as follows:

-   **Mouse clicks**: Mechanical sounds from mouse clicks will appear in the waveform. Especially when clicking the pause button with the mouse, the waveform may appear distorted.
-   **Keyboard keystrokes**: Keyboard typing sounds also affect the waveform. However, if using a quiet keyboard, the impact will be less.
-   **Other ambient sounds**: Speaking voices, indoor air conditioning noise, and external noise will also appear in the waveform.

### Practical Tips

-   **How to pause**: Instead of mouse clicks, using the spacebar on a quiet keyboard can minimize the impact on the waveform when pausing.
-   **Selecting audio sources**: Since microphone input is susceptible to ambient noise, it is recommended to use audio files like WAV files if you want to observe a noise-free waveform.
-   **Measurement environment**: Using it in as quiet an environment as possible allows for more accurate waveform observation.

These are not limitations of the application but characteristics of the microphone device itself.

## License

MIT License - See the [LICENSE](LICENSE) file for details.

*Big Brother is listening to you. Now it’s the cat.* 🐱