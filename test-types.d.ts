// Type declarations for testing libraries

declare module 'vitest' {
  export interface TestContext {}
  export interface Suite {}
  export interface Test {}
  export interface TaskResult {}
  export interface MockedFunction<T extends (...args: any[]) => any> {
    (...args: Parameters<T>): ReturnType<T>;
    mockReturnValue(value: ReturnType<T>): this;
    mockResolvedValue(value: Awaited<ReturnType<T>>): this;
    mockRejectedValue(value: any): this;
    mockImplementation(fn: T): this;
    mockClear(): this;
    mockReset(): this;
    mockRestore(): this;
  }

  export function describe(name: string, fn: () => void): void;
  export function it(name: string, fn: () => void | Promise<void>): void;
  export function test(name: string, fn: () => void | Promise<void>): void;
  export function beforeEach(fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;
  export function beforeAll(fn: () => void | Promise<void>): void;
  export function afterAll(fn: () => void | Promise<void>): void;
  
  export const expect: {
    (actual: any): {
      toBe(expected: any): void;
      toEqual(expected: any): void;
      toBeDefined(): void;
      toBeUndefined(): void;
      toBeNull(): void;
      toBeTruthy(): void;
      toBeFalsy(): void;
      toBeGreaterThan(expected: number): void;
      toBeGreaterThanOrEqual(expected: number): void;
      toBeLessThan(expected: number): void;
      toBeLessThanOrEqual(expected: number): void;
      toContain(expected: any): void;
      toHaveLength(expected: number): void;
      toHaveBeenCalled(): void;
      toHaveBeenCalledWith(...args: any[]): void;
      toHaveBeenCalledTimes(times: number): void;
      toThrow(expected?: string | RegExp | Error): void;
      toThrowError(expected?: string | RegExp | Error): void;
      resolves: any;
      rejects: any;
    };
  };

  export const vi: {
    fn<T extends (...args: any[]) => any>(implementation?: T): MockedFunction<T>;
    spyOn<T, K extends keyof T>(object: T, method: K): MockedFunction<T[K] extends (...args: any[]) => any ? T[K] : never>;
    clearAllTimers(): void;
    clearAllMocks(): void;
    resetAllMocks(): void;
    restoreAllMocks(): void;
    useFakeTimers(): void;
    useRealTimers(): void;
    advanceTimersByTime(ms: number): void;
    runAllTimers(): void;
  };
}

declare module 'fast-check' {
  export interface Arbitrary<T> {
    generate(mrng: any, biasFactor?: number): any;
  }

  export interface Property<Ts> {
    run(): void;
  }

  export interface Parameters {
    numRuns?: number;
    seed?: number;
    path?: string;
    logger?: (v: string) => void;
    verbose?: boolean;
    examples?: any[];
  }

  export function assert<Ts>(property: Property<Ts>, params?: Parameters): void;
  export function property<T1>(arb1: Arbitrary<T1>, predicate: (t1: T1) => boolean | void): Property<[T1]>;
  export function property<T1, T2>(arb1: Arbitrary<T1>, arb2: Arbitrary<T2>, predicate: (t1: T1, t2: T2) => boolean | void): Property<[T1, T2]>;

  // Arbitraries
  export function integer(constraints?: { min?: number; max?: number }): Arbitrary<number>;
  export function float(constraints?: { min?: number; max?: number }): Arbitrary<number>;
  export function string(constraints?: { minLength?: number; maxLength?: number }): Arbitrary<string>;
  export function boolean(): Arbitrary<boolean>;
  export function constant<T>(value: T): Arbitrary<T>;
  export function constantFrom<T>(...values: T[]): Arbitrary<T>;
  export function array<T>(arb: Arbitrary<T>, constraints?: { minLength?: number; maxLength?: number }): Arbitrary<T[]>;
  export function record<T>(recordModel: { [K in keyof T]: Arbitrary<T[K]> }): Arbitrary<T>;
  export function option<T>(arb: Arbitrary<T>, constraints?: { freq?: number; nil?: any }): Arbitrary<T | null>;
  export function oneof<T>(...arbs: Arbitrary<T>[]): Arbitrary<T>;

  const fc: {
    assert: typeof assert;
    property: typeof property;
    integer: typeof integer;
    float: typeof float;
    string: typeof string;
    boolean: typeof boolean;
    constant: typeof constant;
    constantFrom: typeof constantFrom;
    array: typeof array;
    record: typeof record;
    option: typeof option;
    oneof: typeof oneof;
  };

  export default fc;
}