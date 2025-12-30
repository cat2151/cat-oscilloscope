# cat-oscilloscope

A browser-based oscilloscope-like waveform visualizer built with TypeScript, Vite, Web Audio API, and HTML Canvas.

## Features

- 🎤 **Microphone Input** - Captures audio from your microphone in real-time
- 🎯 **Zero-Cross Detection** - Automatically detects when audio crosses from negative to positive
- 📊 **Stable Display** - Aligns waveform display based on zero-cross points for a stable view
- ⚡ **Real-time Rendering** - Continuously updates the waveform visualization
- 🎨 **Classic Design** - Green waveform on black background with grid overlay
- 🛡️ **Error Handling** - Gracefully handles microphone permission issues

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Then open your browser to `http://localhost:3000/`

### Build

Build for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## How It Works

### Zero-Cross Detection Algorithm

The oscilloscope implements a zero-cross detection algorithm that:

1. Scans the audio buffer to find where the waveform crosses from negative (or zero) to positive
2. Identifies the first zero-cross point
3. Finds the next zero-cross point to determine one complete waveform cycle
4. Displays the waveform with slight padding before and after the zero-cross points

This ensures a stable, non-rolling display similar to traditional hardware oscilloscopes.

### Technical Details

- **FFT Size**: 4096 samples for high resolution
- **Smoothing**: Disabled (0) for accurate waveform representation
- **Display Padding**: 20 samples before and after zero-cross points
- **Canvas Resolution**: 800x400 pixels
- **Refresh Rate**: Synced with browser's requestAnimationFrame (~60 FPS)

## Technology Stack

- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Web Audio API** - Audio capture and analysis
- **HTML Canvas** - 2D waveform rendering

## Browser Requirements

This application requires:
- A modern browser with Web Audio API support (Chrome, Firefox, Safari, Edge)
- Microphone permissions granted by the user
- HTTPS or localhost (required for microphone access)

## License

MIT License - see [LICENSE](LICENSE) file for details
