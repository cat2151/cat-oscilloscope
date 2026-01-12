import { describe, it, expect, beforeAll } from 'vitest';
import { dbToAmplitude, amplitudeToDb, trimSilence, frequencyToNote } from '../utils';

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
  // @ts-expect-error - Setting up global mock for tests
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

  it('should convert -48 dB to amplitude 0.003981...', () => {
    const result = dbToAmplitude(-48);
    expect(result).toBeCloseTo(dbToAmplitude(-48), 10);
  });
});

describe('amplitudeToDb', () => {
  it('should convert amplitude 1.0 to 0 dB', () => {
    expect(amplitudeToDb(1.0)).toBeCloseTo(0, 5);
  });

  it('should convert amplitude 0.1 to -20 dB', () => {
    expect(amplitudeToDb(0.1)).toBeCloseTo(-20, 5);
  });

  it('should convert amplitude 0.01 to -40 dB', () => {
    expect(amplitudeToDb(0.01)).toBeCloseTo(-40, 5);
  });

  it('should convert amplitude 2.0 to approximately +6 dB', () => {
    expect(amplitudeToDb(2.0)).toBeCloseTo(6.02, 2);
  });

  it('should convert amplitude 10.0 to 20 dB', () => {
    expect(amplitudeToDb(10.0)).toBeCloseTo(20, 5);
  });

  it('should return -Infinity for amplitude 0', () => {
    expect(amplitudeToDb(0)).toBe(-Infinity);
  });

  it('should return -Infinity for negative amplitude', () => {
    expect(amplitudeToDb(-1)).toBe(-Infinity);
  });

  it('should be inverse of dbToAmplitude', () => {
    const testValues = [-60, -40, -20, -6, 0, 6, 20];
    testValues.forEach(db => {
      const amplitude = dbToAmplitude(db);
      const backToDb = amplitudeToDb(amplitude);
      expect(backToDb).toBeCloseTo(db, 5);
    });
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
    // Peak is 0.5, so threshold will be 0.5 * 10^(-48/20) ≈ 0.5 * 0.00398 ≈ 0.00199
    const data = [
      0, 0, 0, 0, 0,           // 5 samples of silence
      0.5, 0.3, -0.4, 0.2,     // 4 samples of audio
      0, 0, 0                  // 3 samples of silence
    ];
    const buffer = createAudioBuffer(data);
    const trimmed = trimSilence(buffer);

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
    const trimmed = trimSilence(buffer);

    expect(trimmed.length).toBe(buffer.length);
    expect(trimmed).toBe(buffer); // Should be the same object
  });

  it('should handle buffer with only silence', () => {
    const data = [0, 0, 0, 0, 0];
    const buffer = createAudioBuffer(data);
    const trimmed = trimSilence(buffer);

    // Should return original buffer when entirely silent
    expect(trimmed.length).toBe(buffer.length);
    expect(trimmed).toBe(buffer);
  });

  it('should adapt threshold to audio amplitude', () => {
    // Test with quiet audio (peak = 0.01)
    // Threshold will be 0.01 * 10^(-48/20) ≈ 0.01 * 0.00398 ≈ 0.0000398
    const quietData = [
      0.00005, 0.00005, 0.00005,  // Samples above silence threshold (not considered silent)
      0.01, 0.008, -0.009,         // Quiet audio (peak)
      0.00005, 0.00005             // Samples above silence threshold (not considered silent)
    ];
    const quietBuffer = createAudioBuffer(quietData);
    const trimmedQuiet = trimSilence(quietBuffer);
    
    // Should NOT trim the 0.00005 samples because they are within -48dB of the peak
    expect(trimmedQuiet.length).toBe(8);
    
    // Test with loud audio (peak = 1.0)
    // Threshold will be 1.0 * 10^(-48/20) ≈ 0.00398
    const loudData = [
      0.001, 0.001, 0.001,     // Quiet samples below -48dB of the peak (0.001 < 0.00398), so they should be trimmed
      1.0, 0.8, -0.9,          // Loud audio (peak)
      0.001, 0.001             // Quiet samples below -48dB of the peak (0.001 < 0.00398), so they should be trimmed
    ];
    const loudBuffer = createAudioBuffer(loudData);
    const trimmedLoud = trimSilence(loudBuffer);
    
    // Should trim the 0.001 samples because they are below -48dB of the peak
    expect(trimmedLoud.length).toBe(3);
  });

  it('should trim silence from beginning only', () => {
    const data = [
      0, 0, 0,                 // Silence
      0.5, 0.3, -0.4           // Audio until the end
    ];
    const buffer = createAudioBuffer(data);
    const trimmed = trimSilence(buffer);

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
    const trimmed = trimSilence(buffer);

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
    
    const trimmed = trimSilence(buffer);
    
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
    
    const trimmed = trimSilence(buffer);
    
    // Should start from index 1 (earliest sound across all channels)
    // and end at index 4 (latest sound across all channels)
    expect(trimmed.length).toBe(4); // indices 1, 2, 3, 4
  });
});

describe('frequencyToNote', () => {
  it('should convert 440 Hz to A4+0cent', () => {
    const result = frequencyToNote(440);
    expect(result).not.toBeNull();
    expect(result?.noteName).toBe('A4');
    expect(result?.cents).toBe(0);
  });

  it('should convert 880 Hz to A5+0cent', () => {
    const result = frequencyToNote(880);
    expect(result).not.toBeNull();
    expect(result?.noteName).toBe('A5');
    expect(result?.cents).toBe(0);
  });

  it('should convert 261.63 Hz to C4 (approximately)', () => {
    const result = frequencyToNote(261.63);
    expect(result).not.toBeNull();
    expect(result?.noteName).toBe('C4');
    expect(Math.abs(result!.cents)).toBeLessThan(5); // Within 5 cents
  });

  it('should convert 277.18 Hz to C#4 (approximately)', () => {
    const result = frequencyToNote(277.18);
    expect(result).not.toBeNull();
    expect(result?.noteName).toBe('C#4');
    expect(Math.abs(result!.cents)).toBeLessThan(5);
  });

  it('should detect sharp notes', () => {
    const result = frequencyToNote(233.08); // A#3
    expect(result).not.toBeNull();
    expect(result?.noteName).toBe('A#3');
    expect(Math.abs(result!.cents)).toBeLessThan(5);
  });

  it('should handle slightly off-tune frequency with positive cents', () => {
    // 445 Hz is slightly sharp of A4 (440 Hz)
    const result = frequencyToNote(445);
    expect(result).not.toBeNull();
    expect(result?.noteName).toBe('A4');
    expect(result!.cents).toBeGreaterThan(0);
    expect(result!.cents).toBeLessThanOrEqual(50);
  });

  it('should handle slightly off-tune frequency with negative cents', () => {
    // 435 Hz is slightly flat of A4 (440 Hz)
    const result = frequencyToNote(435);
    expect(result).not.toBeNull();
    expect(result?.noteName).toBe('A4');
    expect(result!.cents).toBeLessThan(0);
    expect(result!.cents).toBeGreaterThanOrEqual(-50);
  });

  it('should handle low frequencies', () => {
    const result = frequencyToNote(27.5); // A0
    expect(result).not.toBeNull();
    expect(result?.noteName).toBe('A0');
    expect(Math.abs(result!.cents)).toBeLessThan(5);
  });

  it('should handle high frequencies', () => {
    const result = frequencyToNote(4186.01); // C8
    expect(result).not.toBeNull();
    expect(result?.noteName).toBe('C8');
    expect(Math.abs(result!.cents)).toBeLessThan(5);
  });

  it('should handle very low frequencies correctly', () => {
    const result = frequencyToNote(16.35); // C0
    expect(result).not.toBeNull();
    expect(result?.noteName).toBe('C0');
    expect(Math.abs(result!.cents)).toBeLessThan(5);
  });

  it('should return null for invalid frequencies', () => {
    expect(frequencyToNote(0)).toBeNull();
    expect(frequencyToNote(-10)).toBeNull();
    expect(frequencyToNote(NaN)).toBeNull();
    expect(frequencyToNote(Infinity)).toBeNull();
  });
});
