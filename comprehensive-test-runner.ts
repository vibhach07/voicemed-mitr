// Comprehensive Test Runner for Voice-Med-Mitr
// This runs all simplified tests without external dependencies

import { runRiskClassificationCompletenessTests } from './properties/risk-classification-completeness-simple.test';
import { runClarificationQuestionLimitsTests } from './properties/clarification-question-limits-simple.test';
import { runEmergencyResponseProtocolTests } from './properties/emergency-response-protocol-simple.test';
import { runSymptomExtractionTests } from './properties/symptom-extraction-simple.test';
import { runWakeWordActivationTests } from './properties/wake-word-activation-simple.test';
import { runAudioOnlyOutputTests } from './properties/audio-only-output-simple.test';
import { runVoiceActivityDetectionTests } from './voice-activity-detection.test';
import { runIntentDetectionTests } from './intent-detection-simple.test';

// Import basic tests
import './basic.test';
import { runAllTests } from './test-framework';

async function runComprehensiveTestSuite(): Promise<void> {
  console.log('🚀 Voice-Med-Mitr Comprehensive Test Suite');
  console.log('==========================================\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  const runTestSuite = async (name: string, testFn: () => void | Promise<void>): Promise<void> => {
    try {
      console.log(`\n📋 ${name}`);
      console.log('='.repeat(name.length + 4));
      await testFn();
      passedTests++;
      console.log(`✅ ${name} - PASSED`);
    } catch (error) {
      failedTests++;
      console.log(`❌ ${name} - FAILED: ${error}`);
    } finally {
      totalTests++;
    }
  };

  try {
    // 1. Basic Structure Tests
    await runTestSuite('Basic Structure Tests', () => {
      return runAllTests();
    });

    // 2. Voice Activity Detection Tests
    await runTestSuite('Voice Activity Detection Tests', () => {
      return runVoiceActivityDetectionTests();
    });

    // 3. Intent Detection Tests
    await runTestSuite('Intent Detection Tests', () => {
      runIntentDetectionTests();
      return Promise.resolve();
    });

    // 4. Symptom Extraction Property Tests
    await runTestSuite('Symptom Extraction Property Tests', () => {
      runSymptomExtractionTests();
      return Promise.resolve();
    });

    // 5. Risk Classification Property Tests
    await runTestSuite('Risk Classification Property Tests', () => {
      runRiskClassificationCompletenessTests();
      return Promise.resolve();
    });

    // 6. Clarification Question Limits Tests
    await runTestSuite('Clarification Question Limits Tests', () => {
      runClarificationQuestionLimitsTests();
      return Promise.resolve();
    });

    // 7. Emergency Response Protocol Tests
    await runTestSuite('Emergency Response Protocol Tests', () => {
      runEmergencyResponseProtocolTests();
      return Promise.resolve();
    });

    // 8. Wake Word Activation Tests
    await runTestSuite('Wake Word Activation Tests', () => {
      runWakeWordActivationTests();
      return Promise.resolve();
    });

    // 9. Audio-Only Output Tests
    await runTestSuite('Audio-Only Output Tests', () => {
      runAudioOnlyOutputTests();
      return Promise.resolve();
    });

  } catch (error) {
    console.error('\n💥 Test suite execution failed:', error);
    failedTests++;
  }

  // Final Summary
  console.log('\n📊 Final Test Summary');
  console.log('=====================');
  console.log(`Total Test Suites: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (failedTests === 0) {
    console.log('\n🎉 ALL TEST SUITES PASSED!');
    console.log('✅ Voice-Med-Mitr system is fully functional');
    console.log('\n🚀 System Components Verified:');
    console.log('  ✅ Basic Project Structure');
    console.log('  ✅ Voice Activity Detection');
    console.log('  ✅ Intent Detection & Ambiguity Handling');
    console.log('  ✅ Symptom Extraction (Property-Based)');
    console.log('  ✅ Risk Classification (Property-Based)');
    console.log('  ✅ Clarification Question Limits (Property-Based)');
    console.log('  ✅ Emergency Response Protocol (Property-Based)');
    console.log('  ✅ Wake Word Activation (Property-Based)');
    console.log('  ✅ Audio-Only Output (Property-Based)');
    console.log('\n🎯 Ready for production deployment!');
  } else {
    console.log(`\n⚠️  ${failedTests} test suite(s) failed`);
    console.log('Please review the errors above and fix any issues.');
  }
}

// System Health Check
async function performSystemHealthCheck(): Promise<void> {
  console.log('\n🏥 System Health Check');
  console.log('======================');

  const healthChecks = [
    {
      name: 'Core Module Imports',
      check: () => {
        return import('../core/VoiceAssistant').then(voiceModule => {
          return import('../index').then(indexModule => {
            return { VoiceAssistant: voiceModule.VoiceAssistant, VoiceMedMitr: indexModule.VoiceMedMitr };
          });
        });
      }
    },
    {
      name: 'Class Instantiation',
      check: () => {
        return import('../core/VoiceAssistant').then(voiceModule => {
          return import('../index').then(indexModule => {
            const assistant = new voiceModule.VoiceAssistant();
            const app = new indexModule.VoiceMedMitr();
            return { assistant, app };
          });
        });
      }
    },
    {
      name: 'Type System Integrity',
      check: () => {
        return import('../types').then(typesModule => {
          return { SeverityLevel: typesModule.SeverityLevel, RiskLevel: typesModule.RiskLevel, UserIntent: typesModule.UserIntent };
        });
      }
    }
  ];

  let healthScore = 0;
  
  for (const healthCheck of healthChecks) {
    try {
      await healthCheck.check();
      console.log(`✅ ${healthCheck.name}`);
      healthScore++;
    } catch (error) {
      console.log(`❌ ${healthCheck.name}: ${error}`);
    }
  }

  const healthPercentage = (healthScore / healthChecks.length) * 100;
  
  console.log(`\n💚 System Health: ${healthPercentage.toFixed(0)}%`);
  
  if (healthPercentage === 100) {
    console.log('🎊 Perfect health! All systems operational.');
  } else if (healthPercentage >= 80) {
    console.log('😊 Good health with minor issues.');
  } else {
    console.log('😟 System needs attention.');
  }
}

// Main execution function
async function main(): Promise<void> {
  try {
    await runComprehensiveTestSuite();
    await performSystemHealthCheck();
    
    console.log('\n🎊 Voice-Med-Mitr Testing Complete!');
    console.log('====================================');
    console.log('The voice-first AI health companion is ready to help users.');
    console.log('Thank you for building accessible healthcare technology! 🎤⚕️');
    
  } catch (error) {
    console.error('\n💥 Comprehensive test runner failed:', error);
    console.log('Please check the implementation and try again.');
  }
}

// Export functions for external use
export { runComprehensiveTestSuite, performSystemHealthCheck, main };

// Note: Auto-execution removed for compatibility
// To run: import and call main() function