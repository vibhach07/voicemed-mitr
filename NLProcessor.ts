// Natural Language Processor Interface

import { SymptomEntity, Duration, SeverityLevel, UserIntent } from '../types';

export interface NLProcessor {
  extractSymptoms(text: string): SymptomEntity[];
  extractDuration(text: string): Duration | null;
  extractSeverity(text: string): SeverityLevel;
  detectIntent(text: string): UserIntent;
}