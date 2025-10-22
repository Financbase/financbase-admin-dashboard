/**
 * Integration Test Setup
 * Setup for tests that use the real database
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { testDatabase } from './test-db';

// Global test setup for integration tests
beforeAll(async () => {
  await testDatabase.setup();
});

afterAll(async () => {
  await testDatabase.teardown();
});

// Clean up before each test
beforeEach(async () => {
  await testDatabase.cleanup();
});

// Additional cleanup after each test if needed
afterEach(async () => {
  // Any additional cleanup can go here
});