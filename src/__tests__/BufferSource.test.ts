import { describe, it, expect, beforeEach } from 'vitest';
import { BufferSource } from '../BufferSource';

describe('BufferSource', () => {
  describe('constructor and basic operations', () => {
    it('should create BufferSource with Float32Array', () => {
      const buffer = new Float32Array([0.1, 0.2, 0.3, 0.4]);
      const source = new BufferSource(buffer, 44100);
      
      expect(source.getSampleRate()).toBe(44100);
      expect(source.getLength()).toBe(4);
      expect(source.getPosition()).toBe(0);
      expect(source.isLoop()).toBe(false);
    });

    it('should create BufferSource with custom options', () => {
      const buffer = new Float32Array([0.1, 0.2, 0.3, 0.4]);
      const source = new BufferSource(buffer, 48000, {
        chunkSize: 2048,
        loop: true
      });
      
      expect(source.getSampleRate()).toBe(48000);
      expect(source.getChunkSize()).toBe(2048);
      expect(source.isLoop()).toBe(true);
    });

    it('should throw error for invalid sample rate (negative)', () => {
      const buffer = new Float32Array([0.1, 0.2, 0.3, 0.4]);
      expect(() => {
        new BufferSource(buffer, -44100);
      }).toThrow('Sample rate must be a positive finite number');
    });

    it('should throw error for invalid sample rate (zero)', () => {
      const buffer = new Float32Array([0.1, 0.2, 0.3, 0.4]);
      expect(() => {
        new BufferSource(buffer, 0);
      }).toThrow('Sample rate must be a positive finite number');
    });

    it('should throw error for invalid sample rate (NaN)', () => {
      const buffer = new Float32Array([0.1, 0.2, 0.3, 0.4]);
      expect(() => {
        new BufferSource(buffer, NaN);
      }).toThrow('Sample rate must be a positive finite number');
    });

    it('should throw error for invalid sample rate (Infinity)', () => {
      const buffer = new Float32Array([0.1, 0.2, 0.3, 0.4]);
      expect(() => {
        new BufferSource(buffer, Infinity);
      }).toThrow('Sample rate must be a positive finite number');
    });

    it('should throw error for invalid chunk size (negative)', () => {
      const buffer = new Float32Array([0.1, 0.2, 0.3, 0.4]);
      expect(() => {
        new BufferSource(buffer, 44100, { chunkSize: -1024 });
      }).toThrow('Chunk size must be a positive integer');
    });

    it('should throw error for invalid chunk size (zero)', () => {
      const buffer = new Float32Array([0.1, 0.2, 0.3, 0.4]);
      expect(() => {
        new BufferSource(buffer, 44100, { chunkSize: 0 });
      }).toThrow('Chunk size must be a positive integer');
    });

    it('should throw error for invalid chunk size (non-integer)', () => {
      const buffer = new Float32Array([0.1, 0.2, 0.3, 0.4]);
      expect(() => {
        new BufferSource(buffer, 44100, { chunkSize: 1024.5 });
      }).toThrow('Chunk size must be a positive integer');
    });
  });

  describe('fromAudioBuffer', () => {
    it('should create BufferSource from AudioBuffer', () => {
      // Create a mock AudioBuffer
      const mockAudioBuffer = {
        sampleRate: 44100,
        length: 4,
        numberOfChannels: 1,
        getChannelData: (channel: number) => new Float32Array([0.1, 0.2, 0.3, 0.4])
      } as AudioBuffer;

      const source = BufferSource.fromAudioBuffer(mockAudioBuffer);
      
      expect(source.getSampleRate()).toBe(44100);
      expect(source.getLength()).toBe(4);
    });

    it('should support custom channel selection', () => {
      // Create a mock AudioBuffer with multiple channels
      const channel0 = new Float32Array([0.1, 0.2, 0.3, 0.4]);
      const channel1 = new Float32Array([0.5, 0.6, 0.7, 0.8]);
      const mockAudioBuffer = {
        sampleRate: 44100,
        length: 4,
        numberOfChannels: 2,
        getChannelData: (channel: number) => channel === 0 ? channel0 : channel1
      } as AudioBuffer;

      const source = BufferSource.fromAudioBuffer(mockAudioBuffer, { channel: 1 });
      const chunk = source.getNextChunk();
      
      expect(chunk).not.toBeNull();
      expect(chunk![0]).toBe(0.5);
    });

    it('should throw error for invalid channel index', () => {
      const mockAudioBuffer = {
        sampleRate: 44100,
        length: 4,
        numberOfChannels: 2,
        getChannelData: (channel: number) => new Float32Array([0.1, 0.2, 0.3, 0.4])
      } as AudioBuffer;

      expect(() => {
        BufferSource.fromAudioBuffer(mockAudioBuffer, { channel: 5 });
      }).toThrow('Invalid channel index 5. AudioBuffer has 2 channel(s).');
      
      expect(() => {
        BufferSource.fromAudioBuffer(mockAudioBuffer, { channel: -1 });
      }).toThrow('Invalid channel index -1. AudioBuffer has 2 channel(s).');
    });
  });

  describe('getNextChunk', () => {
    it('should return chunks of specified size', () => {
      const buffer = new Float32Array(10);
      for (let i = 0; i < 10; i++) {
        buffer[i] = i * 0.1;
      }
      const source = new BufferSource(buffer, 44100, { chunkSize: 4 });
      
      const chunk1 = source.getNextChunk();
      expect(chunk1).not.toBeNull();
      expect(chunk1!.length).toBe(4);
      expect(chunk1![0]).toBeCloseTo(0, 5);
      expect(chunk1![3]).toBeCloseTo(0.3, 5);
      expect(source.getPosition()).toBe(4);
      
      const chunk2 = source.getNextChunk();
      expect(chunk2).not.toBeNull();
      expect(chunk2!.length).toBe(4);
      expect(chunk2![0]).toBeCloseTo(0.4, 5);
      expect(chunk2![3]).toBeCloseTo(0.7, 5);
      expect(source.getPosition()).toBe(8);
    });

    it('should pad last chunk with zeros if not looping', () => {
      const buffer = new Float32Array([0.1, 0.2, 0.3]);
      const source = new BufferSource(buffer, 44100, { chunkSize: 4, loop: false });
      
      const chunk = source.getNextChunk();
      expect(chunk).not.toBeNull();
      expect(chunk!.length).toBe(4);
      expect(chunk![0]).toBeCloseTo(0.1, 5);
      expect(chunk![2]).toBeCloseTo(0.3, 5);
      expect(chunk![3]).toBe(0); // Padded with zero
    });

    it('should return null when end is reached and not looping', () => {
      const buffer = new Float32Array([0.1, 0.2]);
      const source = new BufferSource(buffer, 44100, { chunkSize: 4, loop: false });
      
      const chunk1 = source.getNextChunk();
      expect(chunk1).not.toBeNull();
      
      const chunk2 = source.getNextChunk();
      expect(chunk2).toBeNull();
      expect(source.isAtEnd()).toBe(true);
    });

    it('should wrap around when looping', () => {
      const buffer = new Float32Array([0.1, 0.2, 0.3, 0.4]);
      const source = new BufferSource(buffer, 44100, { chunkSize: 3, loop: true });
      
      const chunk1 = source.getNextChunk();
      expect(chunk1).not.toBeNull();
      expect(chunk1![0]).toBeCloseTo(0.1, 5);
      expect(chunk1![2]).toBeCloseTo(0.3, 5);
      
      const chunk2 = source.getNextChunk();
      expect(chunk2).not.toBeNull();
      expect(chunk2![0]).toBeCloseTo(0.4, 5);
      expect(chunk2![1]).toBeCloseTo(0.1, 5); // Wrapped around
      expect(chunk2![2]).toBeCloseTo(0.2, 5);
      expect(source.getPosition()).toBe(2);
    });
  });

  describe('position control', () => {
    it('should reset position to beginning', () => {
      const buffer = new Float32Array([0.1, 0.2, 0.3, 0.4]);
      const source = new BufferSource(buffer, 44100, { chunkSize: 2 });
      
      source.getNextChunk();
      expect(source.getPosition()).toBe(2);
      
      source.reset();
      expect(source.getPosition()).toBe(0);
      
      const chunk = source.getNextChunk();
      expect(chunk![0]).toBeCloseTo(0.1, 5);
    });

    it('should seek to specific position', () => {
      const buffer = new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5]);
      const source = new BufferSource(buffer, 44100, { chunkSize: 2 });
      
      source.seek(3);
      expect(source.getPosition()).toBe(3);
      
      const chunk = source.getNextChunk();
      expect(chunk![0]).toBeCloseTo(0.4, 5);
      expect(chunk![1]).toBeCloseTo(0.5, 5);
    });

    it('should clamp seek position to valid range', () => {
      const buffer = new Float32Array([0.1, 0.2, 0.3]);
      const source = new BufferSource(buffer, 44100);
      
      source.seek(-10);
      expect(source.getPosition()).toBe(0);
      
      source.seek(100);
      expect(source.getPosition()).toBe(3);
    });
  });

  describe('configuration', () => {
    it('should allow changing chunk size', () => {
      const buffer = new Float32Array([0.1, 0.2, 0.3, 0.4]);
      const source = new BufferSource(buffer, 44100, { chunkSize: 2 });
      
      expect(source.getChunkSize()).toBe(2);
      
      source.setChunkSize(3);
      expect(source.getChunkSize()).toBe(3);
      
      const chunk = source.getNextChunk();
      expect(chunk!.length).toBe(3);
    });

    it('should throw error when setting invalid chunk size (negative)', () => {
      const buffer = new Float32Array([0.1, 0.2, 0.3, 0.4]);
      const source = new BufferSource(buffer, 44100);
      
      expect(() => {
        source.setChunkSize(-1024);
      }).toThrow('Chunk size must be a positive integer');
    });

    it('should throw error when setting invalid chunk size (zero)', () => {
      const buffer = new Float32Array([0.1, 0.2, 0.3, 0.4]);
      const source = new BufferSource(buffer, 44100);
      
      expect(() => {
        source.setChunkSize(0);
      }).toThrow('Chunk size must be a positive integer');
    });

    it('should throw error when setting invalid chunk size (non-integer)', () => {
      const buffer = new Float32Array([0.1, 0.2, 0.3, 0.4]);
      const source = new BufferSource(buffer, 44100);
      
      expect(() => {
        source.setChunkSize(1024.5);
      }).toThrow('Chunk size must be a positive integer');
    });

    it('should allow changing loop mode', () => {
      const buffer = new Float32Array([0.1, 0.2]);
      const source = new BufferSource(buffer, 44100, { chunkSize: 4, loop: false });
      
      expect(source.isLoop()).toBe(false);
      
      source.setLooping(true);
      expect(source.isLoop()).toBe(true);
      
      const chunk1 = source.getNextChunk();
      expect(chunk1).not.toBeNull();
      
      const chunk2 = source.getNextChunk();
      expect(chunk2).not.toBeNull(); // Should not be null because looping is now enabled
    });
  });

  describe('edge cases', () => {
    it('should handle empty buffer', () => {
      const buffer = new Float32Array(0);
      const source = new BufferSource(buffer, 44100);
      
      expect(source.getLength()).toBe(0);
      const chunk = source.getNextChunk();
      expect(chunk).toBeNull();
    });

    it('should handle empty buffer with loop mode (prevents infinite loop)', () => {
      const buffer = new Float32Array(0);
      const source = new BufferSource(buffer, 44100, { loop: true });
      
      expect(source.getLength()).toBe(0);
      // Should return null even in loop mode to prevent infinite loop
      const chunk = source.getNextChunk();
      expect(chunk).toBeNull();
    });

    it('should handle single sample buffer', () => {
      const buffer = new Float32Array([0.5]);
      const source = new BufferSource(buffer, 44100, { chunkSize: 4 });
      
      const chunk = source.getNextChunk();
      expect(chunk).not.toBeNull();
      expect(chunk!.length).toBe(4);
      expect(chunk![0]).toBe(0.5);
      expect(chunk![1]).toBe(0);
    });

    it('should handle exact chunk size match', () => {
      const buffer = new Float32Array([0.1, 0.2, 0.3, 0.4]);
      const source = new BufferSource(buffer, 44100, { chunkSize: 4 });
      
      const chunk = source.getNextChunk();
      expect(chunk).not.toBeNull();
      expect(chunk!.length).toBe(4);
      expect(source.getPosition()).toBe(4);
      
      const chunk2 = source.getNextChunk();
      expect(chunk2).toBeNull();
    });

    it('should not overflow when copying looping chunks into fixed-size target (regression: #277)', () => {
      // Simulates AudioManager.startFromBuffer copy pattern:
      // loop:true + length % chunkSize != 0 (e.g., 44100 % 4096 = 3140)
      const dataLength = 44100;
      const chunkSize = 4096;
      const buffer = new Float32Array(dataLength);
      for (let i = 0; i < dataLength; i++) {
        buffer[i] = Math.sin(2 * Math.PI * 440 * i / 44100);
      }
      const source = new BufferSource(buffer, 44100, { loop: true, chunkSize });

      // Replicate the copy loop from AudioManager.startFromBuffer
      const target = new Float32Array(dataLength);
      let position = 0;
      while (position < dataLength) {
        const chunk = source.getNextChunk();
        if (!chunk) break;
        const remaining = dataLength - position;
        if (chunk.length <= remaining) {
          target.set(chunk, position);
          position += chunk.length;
        } else {
          target.set(chunk.subarray(0, remaining), position);
          position += remaining;
        }
      }

      // All samples should be copied without RangeError
      expect(position).toBe(dataLength);
      // First sample should match
      expect(target[0]).toBeCloseTo(buffer[0], 5);
      // Last sample should match
      expect(target[dataLength - 1]).toBeCloseTo(buffer[dataLength - 1], 5);
    });
  });
});
