// Property Test: Emergency Response Protocol (Simplified)
// **Property 22: Emergency Response Protocol**
// **Validates: Requirements 7.5**

import { RiskClassifierImpl } from '../../core/RiskClassifierImpl';
import { SafetyGuardianImpl } from '../../core/SafetyGuardian';
import { SymptomEntity, SeverityLevel, RiskLevel } from '../../types';

// Simple test framework
const expect = (actual: any) => ({
  toBe: (expected: any) => {
    if (actual !== expected) {
      throw new Error(`Expected ${actual} to be ${expected}`);
    }
  },
  toContain: (expected: any) => {
    if (typeof actual === 'string') {
      if (!actual.includes(expected)) {
        throw new Error(`Expected string to contain ${expected}`);
      }
    } else if (Array.isArray(actual)) {
      if (!actual.includes(expected)) {
        throw new Error(`Expected array to contain ${expected}`);
      }
    }
  },
  toBeGreaterThan: (expected: number) => {
    if (actual <= expected) {
      throw new Error(`Expected ${actual} to be greater than ${expected}`);
    }
  }
});

class PropertyTester {
  static assert(property: () => boolean | void, numRuns: number = 20): void {
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

  static generateEmergencySymptom(): SymptomEntity {
    const emergencySymptoms = [
      'chest pain',
      'difficulty breathing',
      'severe bleeding',
      'loss of consciousness',
      'severe allergic reaction'
    ];
    
    return {
      symptom: emergencySymptoms[Math.floor(Math.random() * emergencySymptoms.length)],
      severity: SeverityLevel.SEVERE,
      bodyPart: 'chest',
      duration: null,
      confidence: 0.9
    };
  }
}

export function runEmergencyResponseProtocolTests(): void {
  console.log('🧪 Property 22: Emergency Response Protocol Tests');
  
  const riskClassifier = new RiskClassifierImpl();
  const safetyGuardian = new SafetyGuardianImpl();

  // Test 1: Emergency symptoms trigger emergency classification
  console.log('  Testing emergency symptom classification...');
  PropertyTester.assert(() => {
    const emergencySymptom = PropertyTester.generateEmergencySymptom();
    const assessment = riskClassifier.classifyRisk([emergencySymptom]);
    
    // Property: Emergency symptoms should be classified as emergency
    expect(assessment.level).toBe(RiskLevel.EMERGENCY);
    expect(assessment.confidence).toBeGreaterThan(0.7);
    
    return true;
  }, 15);

  // Test 2: Emergency responses contain appropriate urgency language
  console.log('  Testing emergency response content...');
  PropertyTester.assert(() => {
    const emergencySymptom = PropertyTester.generateEmergencySymptom();
    const assessment = riskClassifier.classifyRisk([emergencySymptom]);
    const safeAssessment = safetyGuardian.enforceEmergencyProtocol(assessment);
    
    // Property: Emergency responses should contain urgent language
    const recommendationText = safeAssessment.recommendations.join(' ').toLowerCase();
    const hasUrgentLanguage = 
      recommendationText.includes('emergency') ||
      recommendationText.includes('immediate') ||
      recommendationText.includes('call') ||
      recommendationText.includes('911');
    
    expect(hasUrgentLanguage).toBe(true);
    
    return true;
  }, 15);

  // Test 3: Safety guardian enforces emergency protocols
  console.log('  Testing safety guardian enforcement...');
  PropertyTester.assert(() => {
    const emergencySymptom = PropertyTester.generateEmergencySymptom();
    const assessment = riskClassifier.classifyRisk([emergencySymptom]);
    const safeAssessment = safetyGuardian.enforceEmergencyProtocol(assessment);
    
    // Property: Safety guardian should maintain or escalate emergency level
    expect(safeAssessment.level).toBe(RiskLevel.EMERGENCY);
    
    return true;
  }, 10);

  console.log('✅ All Emergency Response Protocol tests passed!');
}

// Auto-run removed for compatibility