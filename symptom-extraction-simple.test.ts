// Property Test: Symptom Extraction (Simplified)
// **Property 5: Symptom Extraction**
// **Validates: Requirements 2.1**

import { NLProcessorImpl } from '../../core/NLProcessorImpl';
import { SeverityLevel } from '../../types';

// Simple test framework
const expect = (actual: any) => ({
  toBeGreaterThan: (expected: number) => {
    if (actual <= expected) {
      throw new Error(`Expected ${actual} to be greater than ${expected}`);
    }
  },
  toBe: (expected: any) => {
    if (actual !== expected) {
      throw new Error(`Expected ${actual} to be ${expected}`);
    }
  },
  toContain: (expected: any) => {
    if (Array.isArray(actual)) {
      const found = actual.some(item => 
        typeof item === 'object' && item.symptom && item.symptom.includes(expected)
      );
      if (!found) {
        throw new Error(`Expected symptoms to contain ${expected}`);
      }
    }
  }
});

class PropertyTester {
  static assert(property: () => boolean | void, numRuns: number = 25): void {
    for (let i = 0; i < numRuns; i++) {
      try {
        const result = property();
        if (result === false) {
          throw new Error(`Property failed on run ${i + 1}`);
        }
      } catch (error) {
        throw new Error(`Property failed on run ${i + 1}: ${error}`);
      }
    }
  }

  static generateSymptomText(): string {
    const templates = [
      'I have a {symptom}',
      'My {bodyPart} {symptom}',
      'I feel {symptom} in my {bodyPart}',
      'I have been experiencing {symptom} for {duration}',
      'I have a {severity} {symptom}'
    ];
    
    const symptoms = ['headache', 'pain', 'ache', 'discomfort', 'soreness'];
    const bodyParts = ['head', 'stomach', 'chest', 'back', 'throat'];
    const severities = ['mild', 'severe', 'terrible', 'slight', 'bad'];
    const durations = ['2 hours', 'all day', 'since morning', 'a few days'];
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return template
      .replace('{symptom}', symptoms[Math.floor(Math.random() * symptoms.length)])
      .replace('{bodyPart}', bodyParts[Math.floor(Math.random() * bodyParts.length)])
      .replace('{severity}', severities[Math.floor(Math.random() * severities.length)])
      .replace('{duration}', durations[Math.floor(Math.random() * durations.length)]);
  }
}

export function runSymptomExtractionTests(): void {
  console.log('🧪 Property 5: Symptom Extraction Tests');
  
  const nlProcessor = new NLProcessorImpl();

  // Test 1: Extract symptoms from natural language
  console.log('  Testing symptom extraction from text...');
  PropertyTester.assert(() => {
    const symptomText = PropertyTester.generateSymptomText();
    const symptoms = nlProcessor.extractSymptoms(symptomText);
    
    // Property: Should extract at least one symptom from symptom text
    expect(symptoms.length).toBeGreaterThan(0);
    
    // Property: Each symptom should have required fields
    symptoms.forEach(symptom => {
      expect(typeof symptom.symptom).toBe('string');
      expect(Object.values(SeverityLevel)).toContain(symptom.severity);
      expect(typeof symptom.confidence).toBe('number');
    });
    
    return true;
  }, 20);

  // Test 2: Extract specific known symptoms
  console.log('  Testing specific symptom recognition...');
  PropertyTester.assert(() => {
    const knownSymptoms = ['headache', 'fever', 'cough', 'nausea'];
    const selectedSymptom = knownSymptoms[Math.floor(Math.random() * knownSymptoms.length)];
    const text = `I have a ${selectedSymptom}`;
    
    const symptoms = nlProcessor.extractSymptoms(text);
    
    // Property: Should recognize the specific symptom mentioned
    expect(symptoms.length).toBeGreaterThan(0);
    expect(symptoms).toContain(selectedSymptom);
    
    return true;
  }, 15);

  // Test 3: Handle empty or invalid input
  console.log('  Testing edge case handling...');
  PropertyTester.assert(() => {
    const edgeCases = ['', 'hello world', 'I am fine', 'no symptoms here'];
    const text = edgeCases[Math.floor(Math.random() * edgeCases.length)];
    
    const symptoms = nlProcessor.extractSymptoms(text);
    
    // Property: Should handle edge cases gracefully (may return empty array)
    expect(Array.isArray(symptoms)).toBe(true);
    
    return true;
  }, 10);

  console.log('✅ All Symptom Extraction tests passed!');
}

// Auto-run removed for compatibility