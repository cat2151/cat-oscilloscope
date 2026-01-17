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
- **Library Support**: Available as an npm library for use in other projects (supports both ESM/CJS, full type definition support).
- **5 Frequency Estimation Methods**: Supports Zero-Crossing, Autocorrelation, FFT, STFT, and CQT.
- **Buffer Size Multiplier**: Extended buffer feature (1x/4x/16x) to improve low-frequency detection accuracy.
- **Waveform Comparison Panel**: Real-time display of similarity between current and previous waveforms.
- **Piano Keyboard Display**: Visual display of detected frequencies.

### Current Stability

- ✅ Major bugs resolved.
- ✅ Highly practical when playing audio from WAV files.
- ⚠️ Microphone input is susceptible to ambient noise; recommended for use in quiet environments.

## 📚 Usage as a Library

cat-oscilloscope can be used as an npm library in your own projects. For detailed instructions, please refer to [LIBRARY_USAGE.md](./LIBRARY_USAGE.md).

⚠️ **Important**: When installing from npm or GitHub, manual setup of the WASM file is required. Please refer to the "WASM File Setup" section in [LIBRARY_USAGE.md](./LIBRARY_USAGE.md) for details.

```typescript
import { Oscilloscope, BufferSource } from 'cat-oscilloscope';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const oscilloscope = new Oscilloscope(canvas);

// Visualize from microphone input
await oscilloscope.start();

// Visualize from a static buffer (without audio playback)
const audioData = new Float32Array(44100); // 1 second of data
const bufferSource = new BufferSource(audioData, 44100, { loop: true });
await oscilloscope.startFromBuffer(bufferSource);
```

**BufferSource Feature**: Provides a visualization function from static buffers, ideal for integration with audio processing libraries like wavlpf.

## Features

### Frequency Estimation

cat-oscilloscope supports 5 frequency estimation algorithms:

1.  **Zero-Crossing**: Simple and fast. Suitable for simple waveforms.
2.  **Autocorrelation**: Good balance of accuracy for complex waveforms.
3.  **FFT (Fast Fourier Transform)**: Default. Frequency spectrum analysis. Strong for high frequencies.
4.  **STFT (Short-Time Fourier Transform)**: Improved low-frequency detection accuracy with variable window length.
5.  **CQT (Constant-Q Transform)**: High frequency resolution in the low-frequency range. Suitable for musical analysis.

### Buffer Size Multiplier

Supports extended buffers using historical frame buffers to improve low-frequency detection accuracy:

-   **1x (Standard)**: Standard buffer size (approx. 1/60 second)
-   **4x (Better Low Freq)**: 4x extended buffer for improved low-frequency detection
-   **16x (Best Low Freq)**: 16x extended buffer for best low-frequency detection accuracy

**Usage Example**: To detect low frequencies (20-50Hz), select STFT or CQT and set Buffer Size to 16x for optimal results.

**Important Notes:**
-   When changing the buffer size, the new buffer size will not take effect until history is accumulated (up to 16 frames).
-   With a large buffer size (16x), initial frequency detection may take approximately 0.3 seconds.

### Detectable Frequency Range

The minimum detectable frequency varies depending on the buffer size:

-   **1x (4096 samples @ 48kHz)**: Approximately 80Hz or higher (standard use)
-   **4x (16384 samples)**: Approximately 30Hz or higher (improved low frequency)
-   **16x (65536 samples)**: Approximately 20Hz or higher (best low frequency detection)

## Notes

-   Frequency Estimation
    -   There are cases where FFT is accurate, and cases where other methods are more accurate.
    -   STFT and CQT are particularly good at detecting low frequencies (20-100Hz).
    -   Increasing the buffer size multiplier improves low-frequency accuracy but slightly increases response time.
    -   **Performance**: With 16x buffer size, STFT/CQT calculations may take longer (due to implementation for educational purposes).

## About Data Processing Implementation

All data processing (waveform search, frequency estimation, zero-crossing detection, etc.) is **implemented in Rust/WASM**.

-   **High Processing Performance**: Efficient execution due to Rust's optimizations.
-   **Type-Safe and Reliable Implementation**: Safety through Rust's strict type system.
-   **Single Implementation**: Algorithms are implemented solely in WASM, eliminating dual management with TypeScript.
-   **TypeScript's Role**: Responsible only for configuration management and rendering.

### Building the WASM Implementation

The WASM implementation is located in the `wasm-processor` directory.

```bash
# Build WASM implementation (wasm-pack required)
npm run build:wasm

# Build the entire application (including WASM)
npm run build
```

**Required Tools**:
-   Rust toolchain (rustc, cargo)
-   wasm-pack (`cargo install wasm-pack`)

**Note**: For normal use, pre-built WASM files are included in `public/wasm/`, so the Rust toolchain is not necessary.

## Key Features

-   🎤 **Microphone Input** - Real-time capture of audio from the microphone
-   📂 **Audio File** - Supports loop playback of WAV files
-   📊 **Frequency Estimation** - 5 methods: Zero-Crossing, Autocorrelation, FFT, STFT, CQT
-   🎹 **Piano Keyboard Display** - Displays detected frequencies on a keyboard
-   🎚️ **Auto Gain** - Automatically adjusts waveform amplitude
-   🔇 **Noise Gate** - Cuts off signals below a threshold
-   📈 **FFT Spectrum** - Overlays frequency spectrum display
-   🔍 **Waveform Comparison Panel** - Displays similarity between current and previous waveforms
-   ⏸️ **Pause Drawing** - Allows static observation of waveforms

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
4.  Displays the waveform with a small amount of padding before and after the zero-crossing points.

This achieves a stable, non-scrolling display.

### Technical Details

-   **FFT Size**: 4096 samples for high resolution
-   **Smoothing**: Disabled (0) for accurate waveform representation
-   **Display Padding**: 20 samples before and after zero-crossing points
-   **Auto Gain**:
    -   Automatically adjusts to target 80% of canvas height.
    -   Smooth transitions via peak tracking (decay rate: 0.95).
    -   Gain range: 0.5x to 99x.
    -   Interpolation factor: 0.1 (gradual adjustment).
    -   Enabled/disabled via UI checkbox (default: enabled).
-   **Canvas Resolution**: 800x400 pixels
-   **Refresh Rate**: Synchronized with browser's requestAnimationFrame (approx. 60 FPS)

## Tech Stack

-   **Rust/WebAssembly** - Fast, type-safe data processing algorithms
-   **TypeScript** - Type-safe JavaScript (configuration management and rendering)
-   **Vite** - Fast build tool and development server
-   **Web Audio API** - Audio capture and analysis
-   **HTML Canvas** - 2D waveform rendering

## Browser Requirements

This application requires:
-   A modern browser supporting the Web Audio API (Chrome, Firefox, Safari, Edge)
-   User permission for microphone access
-   HTTPS or localhost (required for microphone access)

## Microphone Input Limitations

When using input from a microphone, there are the following limitations:

### Impact of Ambient Noise

The microphone picks up all surrounding sounds, so ambient noise can affect the waveform in ways such as:

-   **Mouse Click Sounds**: Mechanical sounds from mouse clicks will appear in the waveform. Specifically, at the moment the pause button is clicked with a mouse, the waveform may appear distorted.
-   **Keyboard Typing Sounds**: Keyboard typing sounds also affect the waveform. However, if a quiet keyboard is used, the impact will be less.
-   **Other Ambient Sounds**: Voices, indoor air conditioning sounds, and external noise can also appear in the waveform.

### Practical Tips

-   **Pausing Method**: Instead of mouse clicks, using the spacebar on a quiet keyboard can minimize the impact on the waveform when pausing.
-   **Sound Source Selection**: Since microphone input is susceptible to ambient noise, it is recommended to use audio files such as WAV files if you want to observe a noise-free waveform.
-   **Measurement Environment**: Using the application in as quiet an environment as possible will allow for more accurate waveform observation.

These are characteristics of the microphone device, not limitations of the application.

## License

MIT License - see the [LICENSE](LICENSE) file for details

*Big Brother is listening to you. Now it’s the cat.* 🐱