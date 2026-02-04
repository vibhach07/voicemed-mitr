// Test runner to execute all tests without external dependencies

import { runAllTests } from './test-framework';
import { runVoiceActivityDetectionTests } from './voice-activity-detection.test';
import { runRiskClassificationCompletenessTests } from './properties/risk-classification-completeness-simple.test';

// Import test files to register them
import './basic.test';

async function runCompleteTestSuite(): Promise<void> {
  console.log('🚀 Voice-Med-Mitr Test Suite');
  console.log('=============================\n');

  try {
    // Run basic structure tests
    console.log('📋 Running basic structure tests...');
    await runAllTests();

    // Run voice activity detection tests
    console.log('\n🎤 Running voice activity detection tests...');
    await runVoiceActivityDetectionTests();

    // Run risk classification tests
    console.log('\n⚕️ Running risk classification tests...');
    runRiskClassificationCompletenessTests();

    console.log('\n🎉 All test suites completed!');
    console.log('✅ Voice-Med-Mitr system is ready for use.');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    console.log('⚠️  Please review and fix the issues before proceeding.');
  }
}

// Export for use in other modules
export { runCompleteTestSuite };

// Auto-run if this file is executed directly
// (Removed Node.js specific code for compatibility)