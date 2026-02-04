#!/usr/bin/env node
// Simple test runner for Voice-Med-Mitr
// Runs all tests using our custom test framework

import { main } from './comprehensive-test-runner';

console.log('🧪 Starting Voice-Med-Mitr Test Suite...\n');

main()
  .then(() => {
    console.log('\n✅ Test execution completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  });