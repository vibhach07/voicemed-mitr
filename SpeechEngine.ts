// Speech Processing Engine Interface

import { TTSOptions } from '../types';

export interface SpeechEngine {
  speechToText(audio: AudioBuffer): Promise<string>;
  textToSpeech(text: string, options: TTSOptions): Promise<AudioBuffer>;
  setLanguage(language: string): void;
  setSpeechRate(rate: number): void; // 0.5 to 2.0
}