// Simple test framework for environments without vitest/jest
// This provides basic testing functionality without external dependencies

export interface TestSuite {
  name: string;
  tests: TestCase[];
  beforeEach?: () => void | Promise<void>;
  afterEach?: () => void | Promise<void>;
}

export interface TestCase {
  name: string;
  fn: () => void | Promise<void>;
}

export class SimpleTestRunner {
  private suites: TestSuite[] = [];
  private currentSuite: TestSuite | null = null;

  describe(name: string, fn: () => void): void {
    const suite: TestSuite = { name, tests: [] };
    this.suites.push(suite);
    this.currentSuite = suite;
    
    fn();
    
    this.currentSuite = null;
  }

  it(name: string, fn: () => void | Promise<void>): void {
    if (!this.currentSuite) {
      throw new Error('it() must be called within describe()');
    }
    this.currentSuite.tests.push({ name, fn });
  }

  beforeEach(fn: () => void | Promise<void>): void {
    if (!this.currentSuite) {
      throw new Error('beforeEach() must be called within describe()');
    }
    this.currentSuite.beforeEach = fn;
  }

  afterEach(fn: () => void | Promise<void>): void {
    if (!this.currentSuite) {
      throw new Error('afterEach() must be called within describe()');
    }
    this.currentSuite.afterEach = fn;
  }

  async runAll(): Promise<{ passed: number; failed: number; total: number }> {
    let passed = 0;
    let failed = 0;
    let total = 0;

    for (const suite of this.suites) {
      console.log(`\n🧪 ${suite.name}`);
      
      for (const test of suite.tests) {
        total++;
        try {
          if (suite.beforeEach) {
            await suite.beforeEach();
          }
          
          await test.fn();
          
          if (suite.afterEach) {
            await suite.afterEach();
          }
          
          console.log(`  ✅ ${test.name}`);
          passed++;
        } catch (error) {
          console.log(`  ❌ ${test.name}: ${error}`);
          failed++;
        }
      }
    }

    console.log(`\n📊 Test Results: ${passed}/${total} passed, ${failed} failed`);
    return { passed, failed, total };
  }
}

// Simple assertion library
export const expect = (actual: any) => ({
  toBe: (expected: any) => {
    if (actual !== expected) {
      throw new Error(`Expected ${actual} to be ${expected}`);
    }
  },
  toEqual: (expected: any) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
    }
  },
  toBeDefined: () => {
    if (actual === undefined) {
      throw new Error('Expected value to be defined');
    }
  },
  toBeUndefined: () => {
    if (actual !== undefined) {
      throw new Error('Expected value to be undefined');
    }
  },
  toBeNull: () => {
    if (actual !== null) {
      throw new Error('Expected value to be null');
    }
  },
  toBeTruthy: () => {
    if (!actual) {
      throw new Error('Expected value to be truthy');
    }
  },
  toBeFalsy: () => {
    if (actual) {
      throw new Error('Expected value to be falsy');
    }
  },
  toBeGreaterThan: (expected: number) => {
    if (actual <= expected) {
      throw new Error(`Expected ${actual} to be greater than ${expected}`);
    }
  },
  toBeGreaterThanOrEqual: (expected: number) => {
    if (actual < expected) {
      throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`);
    }
  },
  toBeLessThan: (expected: number) => {
    if (actual >= expected) {
      throw new Error(`Expected ${actual} to be less than ${expected}`);
    }
  },
  toBeLessThanOrEqual: (expected: number) => {
    if (actual > expected) {
      throw new Error(`Expected ${actual} to be less than or equal to ${expected}`);
    }
  },
  toContain: (expected: any) => {
    if (Array.isArray(actual)) {
      if (!actual.includes(expected)) {
        throw new Error(`Expected array to contain ${expected}`);
      }
    } else if (typeof actual === 'string') {
      if (!actual.includes(expected)) {
        throw new Error(`Expected string to contain ${expected}`);
      }
    } else {
      throw new Error('Expected value to be an array or string');
    }
  },
  toHaveLength: (expected: number) => {
    if (!actual || typeof actual.length !== 'number') {
      throw new Error('Expected value to have a length property');
    }
    if (actual.length !== expected) {
      throw new Error(`Expected length to be ${expected}, got ${actual.length}`);
    }
  },
  toThrow: (expected?: string | RegExp | Error) => {
    if (typeof actual !== 'function') {
      throw new Error('Expected value to be a function');
    }
    
    let threw = false;
    let error: any = null;
    
    try {
      actual();
    } catch (e) {
      threw = true;
      error = e;
    }
    
    if (!threw) {
      throw new Error('Expected function to throw');
    }
    
    if (expected) {
      if (typeof expected === 'string') {
        if (!error.message.includes(expected)) {
          throw new Error(`Expected error message to contain "${expected}", got "${error.message}"`);
        }
      } else if (expected instanceof RegExp) {
        if (!expected.test(error.message)) {
          throw new Error(`Expected error message to match ${expected}, got "${error.message}"`);
        }
      } else if (expected instanceof Error) {
        if (error.constructor !== expected.constructor) {
          throw new Error(`Expected error type ${expected.constructor.name}, got ${error.constructor.name}`);
        }
      }
    }
  }
});

// Mock function creator
export const createMockFn = <T extends (...args: any[]) => any>() => {
  const fn = (...args: Parameters<T>) => {
    fn.calls.push(args);
    if (fn.implementation) {
      return fn.implementation(...args);
    }
  };
  
  fn.calls = [] as Parameters<T>[];
  fn.implementation = null as T | null;
  
  fn.mockReturnValue = (value: ReturnType<T>) => {
    fn.implementation = (() => value) as T;
    return fn;
  };
  
  fn.mockImplementation = (impl: T) => {
    fn.implementation = impl;
    return fn;
  };
  
  fn.mockClear = () => {
    fn.calls = [];
    return fn;
  };

  fn.mockRestore = () => {
    // No-op for compatibility
    return fn;
  };

  return fn;
};

// Mock object for vi
export const vi = {
  fn: createMockFn,
  spyOn: <T, K extends keyof T>(object: T, method: K) => {
    const original = object[method];
    const mock = createMockFn();
    
    mock.mockRestore = () => {
      object[method] = original;
      return mock;
    };
    
    object[method] = mock as any;
    return mock;
  },
  clearAllTimers: () => {
    // No-op for compatibility
  },
  clearAllMocks: () => {
    // No-op for compatibility
  }
};

// Property-based testing utilities
export class PropertyTester {
  static assert(property: () => boolean | void, numRuns: number = 50): void {
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

  static property<T>(generator: () => T, predicate: (value: T) => boolean | void) {
    return () => {
      const value = generator();
      return predicate(value);
    };
  }
}

// Simple generators for property-based testing
export const generators = {
  integer: (min: number = 0, max: number = 100) => () => 
    Math.floor(Math.random() * (max - min + 1)) + min,
    
  float: (min: number = 0, max: number = 1) => () => 
    Math.random() * (max - min) + min,
    
  string: (minLength: number = 0, maxLength: number = 10) => () => {
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    let result = '';
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  
  boolean: () => () => Math.random() < 0.5,
  
  constantFrom: <T>(...values: T[]) => () => 
    values[Math.floor(Math.random() * values.length)],
    
  array: <T>(generator: () => T, minLength: number = 0, maxLength: number = 5) => () => {
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    const result: T[] = [];
    for (let i = 0; i < length; i++) {
      result.push(generator());
    }
    return result;
  }
};

// Global test runner instance
export const testRunner = new SimpleTestRunner();

// Export functions for global use
export const describe = testRunner.describe.bind(testRunner);
export const it = testRunner.it.bind(testRunner);
export const beforeEach = testRunner.beforeEach.bind(testRunner);
export const afterEach = testRunner.afterEach.bind(testRunner);

// Run all tests function
export async function runAllTests(): Promise<void> {
  const results = await testRunner.runAll();
  
  if (results.failed > 0) {
    console.log(`\n⚠️  ${results.failed} test(s) failed`);
  } else {
    console.log('\n🎉 All tests passed!');
  }
}