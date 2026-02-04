// Voice Activity Detection Implementation

import { SESSION_TIMEOUT_MS, AUTO_END_SESSION_MS } from '../config/constants';

export interface VoiceActivityDetector {
  startDetection(): void;
  stopDetection(): void;
  onSilenceDetected(callback: (duration: number) => void): void;
  onSpeechDetected(callback: () => void): void;
  resetSilenceTimer(): void;
}

export class VoiceActivityDetectorImpl implements VoiceActivityDetector {
  private isDetecting: boolean = false;
  private silenceStartTime: number | null = null;
  private silenceCallback: ((duration: number) => void) | null = null;
  private speechCallback: (() => void) | null = null;
  private silenceCheckInterval: NodeJS.Timeout | null = null;
  private lastSpeechTime: number = Date.now();

  startDetection(): void {
    if (this.isDetecting) {
      return;
    }

    this.isDetecting = true;
    this.lastSpeechTime = Date.now();
    this.startSilenceMonitoring();
  }

  stopDetection(): void {
    if (!this.isDetecting) {
      return;
    }

    this.isDetecting = false;
    this.cleanupTimers();
  }

  onSilenceDetected(callback: (duration: number) => void): void {
    this.silenceCallback = callback;
  }

  onSpeechDetected(callback: () => void): void {
    this.speechCallback = callback;
  }

  resetSilenceTimer(): void {
    this.lastSpeechTime = Date.now();
    this.silenceStartTime = null;
  }

  private startSilenceMonitoring(): void {
    this.silenceCheckInterval = setInterval(() => {
      this.checkSilenceDuration();
    }, 1000); // Check every second
  }

  private checkSilenceDuration(): void {
    const now = Date.now();
    const silenceDuration = now - this.lastSpeechTime;

    // First silence threshold (30 seconds) - ask if user is still there
    if (silenceDuration >= SESSION_TIMEOUT_MS && silenceDuration < AUTO_END_SESSION_MS) {
      if (!this.silenceStartTime) {
        this.silenceStartTime = now;
        if (this.silenceCallback) {
          this.silenceCallback(silenceDuration);
        }
      }
    }

    // Second silence threshold (60 seconds total) - auto-end session
    if (silenceDuration >= AUTO_END_SESSION_MS) {
      if (this.silenceCallback) {
        this.silenceCallback(silenceDuration);
      }
      this.stopDetection();
    }
  }

  public simulateSpeechDetected(): void {
    // For testing: simulate speech detection
    this.resetSilenceTimer();
    if (this.speechCallback) {
      this.speechCallback();
    }
  }

  public simulateSilence(duration: number): void {
    // For testing: simulate silence for specified duration
    this.lastSpeechTime = Date.now() - duration;
    this.checkSilenceDuration();
  }

  private cleanupTimers(): void {
    if (this.silenceCheckInterval) {
      clearInterval(this.silenceCheckInterval);
      this.silenceCheckInterval = null;
    }
    this.silenceStartTime = null;
  }

  // Analyze audio buffer for voice activity (simplified implementation)
  analyzeAudioBuffer(audioBuffer: AudioBuffer): boolean {
    if (!audioBuffer || audioBuffer.length === 0) {
      return false;
    }

    const channelData = audioBuffer.getChannelData(0);
    let totalEnergy = 0;
    let maxAmplitude = 0;

    // Calculate energy and peak amplitude
    for (let i = 0; i < channelData.length; i++) {
      const sample = Math.abs(channelData[i]);
      totalEnergy += sample * sample;
      maxAmplitude = Math.max(maxAmplitude, sample);
    }

    const averageEnergy = totalEnergy / channelData.length;
    
    // Simple voice activity detection thresholds
    const ENERGY_THRESHOLD = 0.001;
    const AMPLITUDE_THRESHOLD = 0.01;

    const hasVoiceActivity = averageEnergy > ENERGY_THRESHOLD && maxAmplitude > AMPLITUDE_THRESHOLD;

    if (hasVoiceActivity) {
      this.resetSilenceTimer();
      if (this.speechCallback) {
        this.speechCallback();
      }
    }

    return hasVoiceActivity;
  }

  getCurrentSilenceDuration(): number {
    return Date.now() - this.lastSpeechTime;
  }

  isCurrentlyDetecting(): boolean {
    return this.isDetecting;
  }

  // Additional test methods
  isDetecting(): boolean {
    return this.isDetecting;
  }

  getSilenceDuration(): number {
    return this.getCurrentSilenceDuration();
  }
}