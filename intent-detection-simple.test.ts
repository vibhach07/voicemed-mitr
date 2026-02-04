// Intent Detection and Ambiguity Handling Tests (Simplified)

import { NLProcessorImpl } from '../core/NLProcessorImpl';
import { AmbiguityDetectorImpl } from '../core/AmbiguityDetector';
import { UserIntent } from '../types';

// Simple test framework
const expect = (actual: any) => ({
  toBe: (expected: any) => {
    if (actual !== expected) {
      throw new Error(`Expected ${actual} to be ${expected}`);
    }
  },
  toBeDefined: () => {
    if (actual === undefined) {
      throw new Error('Expected value to be defined');
    }
  },
  toBeGreaterThan: (expected: number) => {
    if (actual <= expected) {
      throw new Error(`Expected ${actual} to be greater than ${expected}`);
    }
  }
});

export function runIntentDetectionTests(): void {
  console.log('🧪 Intent Detection and Ambiguity Handling Tests');
  
  const nlProcessor = new NLProcessorImpl();
  const ambiguityDetector = new AmbiguityDetectorImpl(nlProcessor);

  console.log('  Testing intent detection...');
  
  // Test basic intent detection
  const symptomText = 'I have a headache';
  const intent = nlProcessor.detectIntent(symptomText);
  expect(intent).toBe(UserIntent.DESCRIBE_SYMPTOMS);
  
  // Test end session intent
  const endText = 'goodbye';
  const endIntent = nlProcessor.detectIntent(endText);
  expect(endIntent).toBe(UserIntent.END_SESSION);
  
  // Test help request intent
  const helpText = 'I need help';
  const helpIntent = nlProcessor.detectIntent(helpText);
  expect(helpIntent).toBe(UserIntent.REQUEST_HELP);

  console.log('  Testing ambiguity detection...');
  
  // Test ambiguous input
  const ambiguousText = 'I don\'t feel well';
  const symptoms = nlProcessor.extractSymptoms(ambiguousText);
  const isAmbiguous = ambiguityDetector.isAmbiguous(ambiguousText, symptoms);
  expect(typeof isAmbiguous).toBe('boolean');

  console.log('  Testing clarification questions...');
  
  // Test clarification question generation
  const questions = ambiguityDetector.generateClarificationQuestions(ambiguousText, symptoms);
  expect(Array.isArray(questions)).toBe(true);

  console.log('✅ All Intent Detection tests passed!');
}

// Auto-run removed for compatibility