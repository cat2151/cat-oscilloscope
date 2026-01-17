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

### ✅ Completed Major Implementations

-   **Rust/WASM Integration**: All data processing algorithms are implemented in Rust/WASM, achieving fast and type-safe processing.
-   **Library Support**: Available as an npm library for use in other projects (supports both ESM/CJS, with full type definition support).
-   **Five Frequency Estimation Methods**: Supports Zero-Crossing, Autocorrelation, FFT, STFT, and CQT.
-   **Buffer Size Multiplier**: Extended buffer feature to improve low-frequency detection accuracy (1x/4x/16x).
-   **Waveform Comparison Panel**: Displays the similarity between the current and previous waveforms in real-time.
-   **Piano Keyboard Display**: Visually displays the detected frequencies.

### Current Stability

-   ✅ Major bugs resolved.
-   ✅ Highly practical when playing audio from WAV files.
-   ⚠️ Microphone input is susceptible to ambient noise, so use in a quiet environment is recommended.

## 📚 Usage as a Library

cat-oscilloscope can be used as an npm library in your own projects. For detailed instructions, please refer to [LIBRARY_USAGE.md](./LIBRARY_USAGE.md).

⚠️ **Important**: When installing from npm or GitHub, manual WASM file setup is required. See the "WASM File Setup" section in [LIBRARY_USAGE.md](./LIBRARY_USAGE.md) for details.

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

**BufferSource Feature**: Provides a static buffer visualization feature, ideal for integration with audio processing libraries like wavlpf.

## Features

### Frequency Estimation

cat-oscilloscope supports five frequency estimation algorithms:

1.  **Zero-Crossing**: Simple and fast. Suitable for simple waveforms.
2.  **Autocorrelation**: Offers balanced accuracy for complex waveforms.
3.  **FFT (Fast Fourier Transform)**: Default. Frequency spectrum analysis. Strong for high frequencies.
4.  **STFT (Short-Time Fourier Transform)**: Variable window length improves low-frequency detection accuracy.
5.  **CQT (Constant-Q Transform)**: High frequency resolution in the low-frequency range. Suitable for music analysis.

### Buffer Size Multiplier

To improve low-frequency detection accuracy, extended buffers utilizing past frame buffers are supported:

-   **1x (Standard)**: Standard buffer size (approx. 1/60 second)
-   **4x (Better Low Freq)**: 4x extended buffer for improved low-frequency detection accuracy
-   **16x (Best Low Freq)**: 16x extended buffer for best low-frequency detection accuracy

**Usage Example**: For detecting low frequencies between 20-50Hz, selecting STFT or CQT and setting the Buffer Size to 16x is optimal.

**Important Notes:**
-   When changing the buffer size, the new buffer size will not become effective until the history has accumulated (up to 16 frames).
-   With larger buffer sizes (16x), initial frequency detection may take approximately 0.3 seconds.

### Detectable Frequency Range

The minimum detectable frequency varies depending on the buffer size:

-   **1x (4096 samples @ 48kHz)**: Approx. 80Hz or higher (standard use)
-   **4x (16384 samples)**: Approx. 30Hz or higher (improved low frequency)
-   **16x (65536 samples)**: Approx. 20Hz or higher (best low frequency detection)

## Notes

-   Frequency Estimation
    -   There are cases where FFT is accurate and cases where other methods are more accurate.
    -   STFT and CQT are particularly good at detecting low frequencies (20-100Hz).
    -   Increasing the buffer size multiplier improves low-frequency accuracy but slightly delays responsiveness.
    -   **Performance**: At 16x buffer size, STFT/CQT calculations may take longer (due to implementation for educational purposes).

## About Data Processing Implementation

All data processing (waveform searching, frequency estimation, zero-crossing detection, etc.) is **implemented in Rust/WASM**.

-   **Fast Processing Performance**: Efficient execution achieved through Rust's optimizations.
-   **Type-Safe and Reliable Implementation**: Safety ensured by Rust's strict type system.
-   **Single Implementation**: Algorithms are implemented solely in WASM, eliminating duplicate management with TypeScript.
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

**Note**: For normal use, the pre-built WASM files are included in `public/wasm/`, so the Rust toolchain is not required.

## Key Features

-   🎤 **Microphone Input** - Capture audio from the microphone in real-time.
-   📂 **Audio File** - Supports loop playback of WAV files.
-   📊 **Frequency Estimation** - Five methods: Zero-Crossing, Autocorrelation, FFT, STFT, CQT.
-   🎹 **Piano Keyboard Display** - Displays detected frequencies on a piano keyboard.
-   🎚️ **Auto Gain** - Automatically adjusts waveform amplitude.
-   🔇 **Noise Gate** - Cuts signals below a certain threshold.
-   📈 **FFT Spectrum** - Overlays the frequency spectrum display.
-   🔍 **Waveform Comparison Panel** - Displays the similarity between the current and previous waveforms.
-   ⏸️ **Pause Drawing** - Allows freezing the waveform for observation.

## Getting Started

### Requirements

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

For details, refer to [TESTING.md](TESTING.md).

## How It Works

### Zero-Crossing Detection Algorithm

This oscilloscope implements a zero-crossing detection algorithm as follows:

1.  Scan the audio buffer to detect points where the waveform crosses from negative (or zero) to positive.
2.  Identify the first zero-crossing point.
3.  Find the next zero-crossing point to determine one complete waveform cycle.
4.  Display the waveform with a slight padding before and after the zero-crossing points.

This achieves a stable, non-scrolling display.

### Technical Details

-   **FFT Size**: 4096 samples for high resolution.
-   **Smoothing**: Disabled (0) for accurate waveform representation.
-   **Display Padding**: 20 samples before and after zero-crossing points.
-   **Auto Gain**:
    -   Automatically adjusted to target 80% of canvas height.
    -   Smooth transitions via peak tracking (decay rate: 0.95).
    -   Gain range: 0.5x to 99x.
    -   Interpolation factor: 0.1 (gradual adjustment).
    -   Toggleable via UI checkbox (default: enabled).
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
-   A modern browser supporting the Web Audio API (Chrome, Firefox, Safari, Edge).
-   User permission for microphone access.
-   HTTPS or localhost (required for microphone access).

## Constraints on Microphone Input

When using microphone input, the following constraints apply:

### Impact of Ambient Noise

The microphone picks up all surrounding sounds, so ambient noise can affect the waveform as follows:

-   **Mouse Click Sounds**: Mechanical sounds from mouse clicks will appear in the waveform. Specifically, clicking the pause button with the mouse can cause the waveform to appear distorted at that moment.
-   **Keyboard Typing Sounds**: Keyboard typing sounds also affect the waveform. However, if using a silent keyboard, the impact will be less.
-   **Other Ambient Noises**: Voices, indoor air conditioning sounds, and external noise will also appear in the waveform.

### Practical Tips

-   **How to Pause**: Instead of a mouse click, using the spacebar on a quiet keyboard can minimize the impact on the waveform when pausing.
-   **Choosing an Audio Source**: Since microphone input is susceptible to ambient noise, it is recommended to use audio files such as WAV files if you want to observe a noise-free waveform.
-   **Measurement Environment**: Using the application in as quiet an environment as possible will allow for more accurate waveform observation.

These are not limitations of the application but rather characteristics of the microphone device itself.

## License

MIT License - See the [LICENSE](LICENSE) file for details.

*Big Brother is listening to you. Now it’s the cat.* 🐱