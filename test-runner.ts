// Simple test runner to verify Voice-Med-Mitr functionality
// This runs basic integration tests without requiring external test frameworks

import { VoiceAssistant } from './core/VoiceAssistant';
import { VoiceMedMitr } from './index';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

class SimpleTestRunner {
  private results: TestResult[] = [];

  async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(`🧪 Running: ${name}`);
      await testFn();
      const duration = Date.now() - startTime;
      
      this.results.push({ name, passed: true, duration });
      console.log(`✅ Passed: ${name} (${duration}ms)`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      this.results.push({ name, passed: false, error: errorMessage, duration });
      console.log(`❌ Failed: ${name} (${duration}ms)`);
      console.log(`   Error: ${errorMessage}`);
    }
  }

  printSummary(): void {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;
    
    console.log('\n📊 Test Summary');
    console.log('================');
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(`  - ${result.name}: ${result.error}`);
      });
    }
    
    console.log('');
  }

  getResults(): TestResult[] {
    return [...this.results];
  }
}

async function runIntegrationTests(): Promise<void> {
  console.log('🚀 Voice-Med-Mitr Integration Tests');
  console.log('====================================\n');
  
  const runner = new SimpleTestRunner();

  // Test 1: VoiceAssistant Initialization
  await runner.runTest('VoiceAssistant Initialization', async () => {
    const assistant = new VoiceAssistant();
    await assistant.initialize();
    
    if (assistant.getCurrentState() !== 'standby') {
      throw new Error('Assistant not in standby state after initialization');
    }
    
    await assistant.shutdown();
  });

  // Test 2: Main Application Class
  await runner.runTest('VoiceMedMitr Main Class', async () => {
    const app = new VoiceMedMitr();
    await app.start();
    
    const assistant = app.getAssistant();
    if (!assistant) {
      throw new Error('Assistant not available from main app');
    }
    
    await app.stop();
  });

  // Test 3: Wake Word Simulation
  await runner.runTest('Wake Word Simulation', async () => {
    const assistant = new VoiceAssistant();
    await assistant.initialize();
    
    await assistant.simulateWakeWord();
    
    if (!assistant.isActive()) {
      throw new Error('Session not active after wake word');
    }
    
    await assistant.shutdown();
  });

  // Test 4: User Input Processing
  await runner.runTest('User Input Processing', async () => {
    const assistant = new VoiceAssistant();
    await assistant.initialize();
    
    // Start session
    await assistant.simulateWakeWord();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate user input
    await assistant.simulateUserInput('I have a headache');
    
    // Should still have active session
    if (!assistant.isActive()) {
      throw new Error('Session ended unexpectedly');
    }
    
    await assistant.shutdown();
  });

  // Test 5: Component Status Check
  await runner.runTest('Component Status Check', async () => {
    const assistant = new VoiceAssistant();
    await assistant.initialize();
    
    const status = assistant.getComponentStatus();
    
    if (typeof status.voiceInput !== 'boolean') {
      throw new Error('Voice input status not available');
    }
    
    if (typeof status.speechEngine !== 'boolean') {
      throw new Error('Speech engine status not available');
    }
    
    await assistant.shutdown();
  });

  // Test 6: Session Lifecycle
  await runner.runTest('Session Lifecycle', async () => {
    const assistant = new VoiceAssistant();
    await assistant.initialize();
    
    // No session initially
    if (assistant.getCurrentSessionId() !== null) {
      throw new Error('Session should be null initially');
    }
    
    // Start session
    await assistant.simulateWakeWord();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Should have session
    if (assistant.getCurrentSessionId() === null) {
      throw new Error('Session should exist after wake word');
    }
    
    await assistant.shutdown();
  });

  // Test 7: Error Handling
  await runner.runTest('Error Handling', async () => {
    const assistant = new VoiceAssistant();
    await assistant.initialize();
    
    // Try to send input without session
    await assistant.simulateUserInput('test input');
    
    // Should not crash
    if (assistant.getCurrentState() === 'error') {
      throw new Error('Assistant in error state');
    }
    
    await assistant.shutdown();
  });

  runner.printSummary();
  
  const results = runner.getResults();
  const failedTests = results.filter(r => !r.passed);
  
  if (failedTests.length > 0) {
    console.log('⚠️  Some tests failed. Please review the implementation.');
  } else {
    console.log('🎉 All tests passed! Voice-Med-Mitr is ready.');
  }
}

// Export for use in other modules
export { runIntegrationTests, SimpleTestRunner };
export default runIntegrationTests;