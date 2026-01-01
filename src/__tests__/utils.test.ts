import { describe, it, expect, beforeAll } from 'vitest';
import { dbToAmplitude, trimSilence } from '../utils';

// Mock AudioBuffer for the test environment
class MockAudioBuffer {
  numberOfChannels: number;
  length: number;
  sampleRate: number;
  private channelData: Float32Array[];

  constructor(options: { numberOfChannels: number; length: number; sampleRate: number }) {
    this.numberOfChannels = options.numberOfChannels;
    this.length = options.length;
    this.sampleRate = options.sampleRate;
    this.channelData = [];
    for (let i = 0; i < this.numberOfChannels; i++) {
      this.channelData.push(new Float32Array(this.length));
    }
  }

  getChannelData(channel: number): Float32Array {
    if (channel < 0 || channel >= this.numberOfChannels) {
      throw new Error(`Channel ${channel} out of range`);
    }
    return this.channelData[channel];
  }
}

beforeAll(() => {
  // @ts-ignore - Setting up global mock for tests
  global.AudioBuffer = MockAudioBuffer;
});

describe('dbToAmplitude', () => {
  it('should convert 0 dB to amplitude 1.0', () => {
    expect(dbToAmplitude(0)).toBeCloseTo(1.0, 5);
  });

  it('should convert -20 dB to amplitude 0.1', () => {
    expect(dbToAmplitude(-20)).toBeCloseTo(0.1, 5);
  });

  it('should convert -40 dB to amplitude 0.01', () => {
    expect(dbToAmplitude(-40)).toBeCloseTo(0.01, 5);
  });
});

describe('trimSilence', () => {
  // Helper function to create a simple AudioBuffer
  function createAudioBuffer(data: number[], sampleRate: number = 48000): AudioBuffer {
    const buffer = new AudioBuffer({
      numberOfChannels: 1,
      length: data.length,
      sampleRate: sampleRate
    });
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      channelData[i] = data[i];
    }
    return buffer;
  }

  it('should trim silence from beginning and end', () => {
    // Create buffer with silence at beginning and end
    const data = [
      0, 0, 0, 0, 0,           // 5 samples of silence
      0.5, 0.3, -0.4, 0.2,     // 4 samples of audio
      0, 0, 0                  // 3 samples of silence
    ];
    const buffer = createAudioBuffer(data);
    const trimmed = trimSilence(buffer, 0.01);

    expect(trimmed.length).toBe(4);
    const trimmedData = trimmed.getChannelData(0);
    expect(trimmedData[0]).toBeCloseTo(0.5, 5);
    expect(trimmedData[1]).toBeCloseTo(0.3, 5);
    expect(trimmedData[2]).toBeCloseTo(-0.4, 5);
    expect(trimmedData[3]).toBeCloseTo(0.2, 5);
  });

  it('should return original buffer if no silence to trim', () => {
    const data = [0.5, 0.3, -0.4, 0.2];
    const buffer = createAudioBuffer(data);
    const trimmed = trimSilence(buffer, 0.01);

    expect(trimmed.length).toBe(buffer.length);
    expect(trimmed).toBe(buffer); // Should be the same object
  });

  it('should handle buffer with only silence', () => {
    const data = [0, 0, 0, 0, 0];
    const buffer = createAudioBuffer(data);
    const trimmed = trimSilence(buffer, 0.01);

    // Should return original buffer when entirely silent
    expect(trimmed.length).toBe(buffer.length);
    expect(trimmed).toBe(buffer);
  });

  it('should respect custom threshold', () => {
    const data = [
      0.005, 0.005, 0.005,     // Below default threshold (0.01) but above custom (0.001)
      0.5, 0.3, -0.4,          // Audio
      0.005, 0.005             // Below default threshold
    ];
    const buffer = createAudioBuffer(data);
    
    // With default threshold (0.01), should trim the 0.005 samples
    const trimmedDefault = trimSilence(buffer, 0.01);
    expect(trimmedDefault.length).toBe(3);
    
    // With lower threshold (0.001), should keep the 0.005 samples
    const trimmedLower = trimSilence(buffer, 0.001);
    expect(trimmedLower.length).toBe(8);
  });

  it('should trim silence from beginning only', () => {
    const data = [
      0, 0, 0,                 // Silence
      0.5, 0.3, -0.4           // Audio until the end
    ];
    const buffer = createAudioBuffer(data);
    const trimmed = trimSilence(buffer, 0.01);

    expect(trimmed.length).toBe(3);
    const trimmedData = trimmed.getChannelData(0);
    expect(trimmedData[0]).toBeCloseTo(0.5, 5);
    expect(trimmedData[1]).toBeCloseTo(0.3, 5);
    expect(trimmedData[2]).toBeCloseTo(-0.4, 5);
  });

  it('should trim silence from end only', () => {
    const data = [
      0.5, 0.3, -0.4,          // Audio from the start
      0, 0, 0                  // Silence
    ];
    const buffer = createAudioBuffer(data);
    const trimmed = trimSilence(buffer, 0.01);

    expect(trimmed.length).toBe(3);
    const trimmedData = trimmed.getChannelData(0);
    expect(trimmedData[0]).toBeCloseTo(0.5, 5);
    expect(trimmedData[1]).toBeCloseTo(0.3, 5);
    expect(trimmedData[2]).toBeCloseTo(-0.4, 5);
  });

  it('should work with multi-channel audio', () => {
    // Create a stereo buffer
    const buffer = new AudioBuffer({
      numberOfChannels: 2,
      length: 10,
      sampleRate: 48000
    });
    
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);
    
    // Left channel: silence, audio, silence
    leftChannel[0] = 0;
    leftChannel[1] = 0;
    leftChannel[2] = 0.5;
    leftChannel[3] = 0.3;
    leftChannel[4] = -0.4;
    leftChannel[5] = 0;
    leftChannel[6] = 0;
    leftChannel[7] = 0;
    leftChannel[8] = 0;
    leftChannel[9] = 0;
    
    // Right channel: silence, audio, silence
    rightChannel[0] = 0;
    rightChannel[1] = 0;
    rightChannel[2] = 0.4;
    rightChannel[3] = -0.3;
    rightChannel[4] = 0.5;
    rightChannel[5] = 0;
    rightChannel[6] = 0;
    rightChannel[7] = 0;
    rightChannel[8] = 0;
    rightChannel[9] = 0;
    
    const trimmed = trimSilence(buffer, 0.01);
    
    expect(trimmed.length).toBe(3);
    expect(trimmed.numberOfChannels).toBe(2);
    
    const trimmedLeft = trimmed.getChannelData(0);
    const trimmedRight = trimmed.getChannelData(1);
    
    expect(trimmedLeft[0]).toBeCloseTo(0.5, 5);
    expect(trimmedLeft[1]).toBeCloseTo(0.3, 5);
    expect(trimmedLeft[2]).toBeCloseTo(-0.4, 5);
    
    expect(trimmedRight[0]).toBeCloseTo(0.4, 5);
    expect(trimmedRight[1]).toBeCloseTo(-0.3, 5);
    expect(trimmedRight[2]).toBeCloseTo(0.5, 5);
  });

  it('should trim based on any channel exceeding threshold', () => {
    // Create a stereo buffer where one channel has sound earlier/later than the other
    const buffer = new AudioBuffer({
      numberOfChannels: 2,
      length: 10,
      sampleRate: 48000
    });
    
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);
    
    // Left channel has sound starting at index 2
    leftChannel.fill(0);
    leftChannel[2] = 0.5;
    leftChannel[3] = 0.3;
    
    // Right channel has sound starting at index 1 (earlier)
    rightChannel.fill(0);
    rightChannel[1] = 0.4;
    rightChannel[2] = 0.3;
    rightChannel[4] = 0.2; // Sound extends further
    
    const trimmed = trimSilence(buffer, 0.01);
    
    // Should start from index 1 (earliest sound across all channels)
    // and end at index 4 (latest sound across all channels)
    expect(trimmed.length).toBe(4); // indices 1, 2, 3, 4
  });
});
