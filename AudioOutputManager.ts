// Audio Output Management for Text-to-Speech

import { TTSOptions } from '../types';

export interface AudioOutputManager {
  playAudio(audioBuffer: AudioBuffer): Promise<void>;
  queueAudio(audioBuffer: AudioBuffer): void;
  clearQueue(): void;
  setVolume(volume: number): void;
  isPlaying(): boolean;
}

export class AudioOutputManagerImpl implements AudioOutputManager {
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private audioQueue: AudioBuffer[] = [];
  private isCurrentlyPlaying: boolean = false;
  private volume: number = 1.0;
  private gainNode: GainNode | null = null;

  constructor() {
    this.initializeAudioContext();
  }

  async playAudio(audioBuffer: AudioBuffer): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.audioContext || !this.gainNode) {
          // Fallback for environments without Web Audio API
          this.simulateAudioPlayback(audioBuffer).then(resolve).catch(reject);
          return;
        }

        // Stop any currently playing audio
        this.stopCurrentAudio();

        // Create audio source
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        
        // Connect to gain node for volume control
        source.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);

        // Set up event handlers
        source.onended = () => {
          this.isCurrentlyPlaying = false;
          this.currentSource = null;
          this.processQueue();
          resolve();
        };

        // Start playback
        this.currentSource = source;
        this.isCurrentlyPlaying = true;
        source.start(0);

      } catch (error) {
        this.isCurrentlyPlaying = false;
        reject(error);
      }
    });
  }

  queueAudio(audioBuffer: AudioBuffer): void {
    this.audioQueue.push(audioBuffer);
    
    // If not currently playing, start processing the queue
    if (!this.isCurrentlyPlaying) {
      this.processQueue();
    }
  }

  clearQueue(): void {
    this.audioQueue = [];
    this.stopCurrentAudio();
  }

  setVolume(volume: number): void {
    // Clamp volume between 0 and 1
    this.volume = Math.max(0, Math.min(1, volume));
    
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
  }

  isPlaying(): boolean {
    return this.isCurrentlyPlaying;
  }

  private initializeAudioContext(): void {
    try {
      if (typeof window !== 'undefined' && window.AudioContext) {
        this.audioContext = new AudioContext();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = this.volume;
      }
    } catch (error) {
      console.warn('Web Audio API not available, using fallback audio playback');
    }
  }

  private stopCurrentAudio(): void {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (error) {
        // Ignore errors from stopping already stopped sources
      }
      this.currentSource = null;
    }
    this.isCurrentlyPlaying = false;
  }

  private async processQueue(): Promise<void> {
    if (this.audioQueue.length === 0 || this.isCurrentlyPlaying) {
      return;
    }

    const nextAudio = this.audioQueue.shift();
    if (nextAudio) {
      try {
        await this.playAudio(nextAudio);
      } catch (error) {
        console.error('Error playing queued audio:', error);
        // Continue processing queue even if one item fails
        this.processQueue();
      }
    }
  }

  private async simulateAudioPlayback(audioBuffer: AudioBuffer): Promise<void> {
    // Simulate audio playback duration for testing environments
    const duration = audioBuffer.duration * 1000; // Convert to milliseconds
    this.isCurrentlyPlaying = true;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isCurrentlyPlaying = false;
        resolve();
      }, duration);
    });
  }

  // Public methods for testing and debugging
  getQueueLength(): number {
    return this.audioQueue.length;
  }

  getCurrentVolume(): number {
    return this.volume;
  }

  isAudioContextAvailable(): boolean {
    return this.audioContext !== null;
  }

  // Additional methods for test compatibility
  getVolume(): number {
    return this.getCurrentVolume();
  }
}