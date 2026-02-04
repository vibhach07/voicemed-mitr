// Voice Input Layer Interface

export interface VoiceInputLayer {
  startListening(): void;
  stopListening(): void;
  onWakeWordDetected(callback: () => void): void;
  onSpeechDetected(callback: (audio: AudioBuffer) => void): void;
  setWakeWord(phrase: string): void;
}