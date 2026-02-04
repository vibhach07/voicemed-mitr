// Voice Activity Detection Tests

import { VoiceActivityDetectorImpl } from '../core/VoiceActivityDetector';
import { SESSION_TIMEOUT_MS, AUTO_END_SESSION_MS } from '../config/constants';
import { createMockAudioBuffer } from './setup';

// Simple test framework for environments without vitest
interface TestSuite {
  name: string;
  tests: TestCase[];
}

interface TestCase {
  name: string;
  fn: () => void | Promise<void>;
}

class SimpleTestRunner {
  private suites: TestSuite[] = [];

  describe(name: string, fn: () => void): void {
    const suite: TestSuite = { name, tests: [] };
    this.suites.push(suite);
    
    // Mock it function for the test suite
    const testIt = (testName: string, testFn: () => void | Promise<void>) => {
      suite.tests.push({ name: testName, fn: testFn });
    };
    
    // Temporarily set it function
    const originalIt = (globalThis as any).it;
    (globalThis as any).it = testIt;
    
    fn();
    
    // Restore original it function
    (globalThis as any).it = originalIt;
  }

  async runAll(): Promise<void> {
    for (const suite of this.suites) {
      console.log(`\n🧪 ${suite.name}`);
      for (const test of suite.tests) {
        try {
          await test.fn();
          console.log(`  ✅ ${test.name}`);
        } catch (error) {
          console.log(`  ❌ ${test.name}: ${error}`);
        }
      }
    }
  }
}

// Simple assertion library
const expect = (actual: any) => ({
  toBe: (expected: any) => {
    if (actual !== expected) {
      throw new Error(`Expected ${actual} to be ${expected}`);
    }
  },
  toHaveBeenCalledWith: (expected: any) => {
    // Mock implementation for testing
    if (!actual.calls || !actual.calls.some((call: any[]) => call[0] === expected)) {
      throw new Error(`Expected function to have been called with ${expected}`);
    }
  },
  toHaveBeenCalled: () => {
    if (!actual.calls || actual.calls.length === 0) {
      throw new Error('Expected function to have been called');
    }
  },
  toBeLessThan: (expected: number) => {
    if (actual >= expected) {
      throw new Error(`Expected ${actual} to be less than ${expected}`);
    }
  }
});

// Mock function creator
const createMockFn = (): any => {
  const fn = (...args: any[]) => {
    fn.calls.push(args);
  };
  fn.calls = [] as any[];
  return fn;
};

const runner = new SimpleTestRunner();

runner.describe('Voice Activity Detection', () => {
  let detector: VoiceActivityDetectorImpl;
  let silenceCallback: any;
  let speechCallback: any;

  const beforeEach = () => {
    detector = new VoiceActivityDetectorImpl();
    silenceCallback = createMockFn();
    speechCallback = createMockFn();
    
    detector.onSilenceDetected(silenceCallback);
    detector.onSpeechDetected(speechCallback);
  };

  const afterEach = () => {
    detector.stopDetection();
  };

  (globalThis as any).it('should detect silence after 30 seconds', async () => {
    beforeEach();
    
    detector.startDetection();
    
    // Simulate 30 seconds of silence
    detector.simulateSilence(SESSION_TIMEOUT_MS);
    
    expect(silenceCallback).toHaveBeenCalledWith(SESSION_TIMEOUT_MS);
    
    afterEach();
  });

  (globalThis as any).it('should auto-end session after 60 seconds of silence', async () => {
    beforeEach();
    
    detector.startDetection();
    
    // Simulate 60 seconds of silence
    detector.simulateSilence(AUTO_END_SESSION_MS);
    
    expect(silenceCallback).toHaveBeenCalledWith(AUTO_END_SESSION_MS);
    expect(detector.isCurrentlyDetecting()).toBe(false);
    
    afterEach();
  });

  (globalThis as any).it('should reset silence timer when speech is detected', () => {
    beforeEach();
    
    detector.startDetection();
    
    // Simulate some silence
    detector.simulateSilence(15000); // 15 seconds
    
    // Simulate speech detection
    detector.simulateSpeechDetected();
    
    // Check that silence duration is reset
    expect(detector.getCurrentSilenceDuration()).toBeLessThan(1000);
    expect(speechCallback).toHaveBeenCalled();
    
    afterEach();
  });

  (globalThis as any).it('should analyze audio buffer for voice activity', () => {
    beforeEach();
    
    const mockBuffer = createMockAudioBuffer(1000);
    
    // Mock channel data with some audio activity
    const channelData = new Float32Array(1000);
    for (let i = 0; i < 100; i++) {
      channelData[i] = 0.1; // Some amplitude
    }
    
    // Override getChannelData method
    mockBuffer.getChannelData = () => channelData;
    
    const hasActivity = detector.analyzeAudioBuffer(mockBuffer);
    expect(hasActivity).toBe(true);
    
    afterEach();
  });

  (globalThis as any).it('should not detect voice activity in silent audio', () => {
    beforeEach();
    
    const mockBuffer = createMockAudioBuffer(1000);
    
    // Mock channel data with silence (all zeros)
    const channelData = new Float32Array(1000);
    mockBuffer.getChannelData = () => channelData;
    
    const hasActivity = detector.analyzeAudioBuffer(mockBuffer);
    expect(hasActivity).toBe(false);
    
    afterEach();
  });

  (globalThis as any).it('should handle start/stop detection correctly', () => {
    beforeEach();
    
    expect(detector.isCurrentlyDetecting()).toBe(false);
    
    detector.startDetection();
    expect(detector.isCurrentlyDetecting()).toBe(true);
    
    detector.stopDetection();
    expect(detector.isCurrentlyDetecting()).toBe(false);
    
    afterEach();
  });

  (globalThis as any).it('should not start detection if already detecting', () => {
    beforeEach();
    
    detector.startDetection();
    const firstState = detector.isCurrentlyDetecting();
    
    detector.startDetection(); // Should not change state
    const secondState = detector.isCurrentlyDetecting();
    
    expect(firstState).toBe(true);
    expect(secondState).toBe(true);
    
    afterEach();
  });
});

// Export for manual testing
export async function runVoiceActivityDetectionTests(): Promise<void> {
  await runner.runAll();
}

// Auto-run if this file is executed directly
// (Removed Node.js specific code for compatibility)