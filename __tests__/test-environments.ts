/**
 * Test Environment Configuration
 * Manages test database environments and isolation
 */

import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import * as schema from '../lib/db/schemas/index';

// Test environment types
export type TestEnvironment = 'unit' | 'integration' | 'performance' | 'migration';

// Environment-specific configurations
const TEST_ENVIRONMENTS = {
  unit: {
    schema: 'test_unit',
    description: 'Fast unit tests with minimal data',
  },
  integration: {
    schema: 'test_integration',
    description: 'Full integration tests with realistic data',
  },
  performance: {
    schema: 'test_performance',
    description: 'Performance tests with large datasets',
  },
  migration: {
    schema: 'test_migration',
    description: 'Migration testing environment',
  },
} as const;

// Test database manager
export class TestEnvironmentManager {
  private static instance: TestEnvironmentManager;
  private activeEnvironments = new Set<TestEnvironment>();
  private connections = new Map<TestEnvironment, ReturnType<typeof drizzle>>();

  static getInstance(): TestEnvironmentManager {
    if (!TestEnvironmentManager.instance) {
      TestEnvironmentManager.instance = new TestEnvironmentManager();
    }
    return TestEnvironmentManager.instance;
  }

  async createEnvironment(env: TestEnvironment): Promise<ReturnType<typeof drizzle>> {
    if (this.connections.has(env)) {
      return this.connections.get(env)!;
    }

    const config = TEST_ENVIRONMENTS[env];
    const connectionString = process.env.DATABASE_URL!;

    // Create connection with schema override
    const sql = neon(connectionString);
    const db = drizzle(sql, { schema });

    // Initialize test schema
    await this.initializeTestSchema(db, config.schema);

    this.connections.set(env, db);
    this.activeEnvironments.add(env);

    return db;
  }

  private async initializeTestSchema(db: ReturnType<typeof drizzle>, schemaName: string) {
    // Create test schema if it doesn't exist
    await db.execute(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

    // Set search path to test schema
    await db.execute(`SET search_path TO "${schemaName}", public`);

    // Create test tables (simplified version for now)
    // In a full implementation, you'd create all tables in the test schema
  }

  async cleanupEnvironment(env: TestEnvironment): Promise<void> {
    if (!this.connections.has(env)) return;

    const db = this.connections.get(env)!;
    const config = TEST_ENVIRONMENTS[env];

    try {
      // Drop test schema and all its contents
      await db.execute(`DROP SCHEMA IF EXISTS "${config.schema}" CASCADE`);
    } catch (error) {
      console.warn(`Could not cleanup test environment ${env}:`, error);
    }

    this.connections.delete(env);
    this.activeEnvironments.delete(env);
  }

  async cleanupAll(): Promise<void> {
    const environments = Array.from(this.activeEnvironments);
    await Promise.all(environments.map(env => this.cleanupEnvironment(env)));
  }

  getEnvironment(env: TestEnvironment): ReturnType<typeof drizzle> | null {
    return this.connections.get(env) || null;
  }

  getActiveEnvironments(): TestEnvironment[] {
    return Array.from(this.activeEnvironments);
  }
}

// Export singleton instance
export const testEnvironmentManager = TestEnvironmentManager.getInstance();