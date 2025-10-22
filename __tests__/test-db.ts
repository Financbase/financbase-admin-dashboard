/**
 * Test Database Configuration
 * Real database testing setup for Vitest
 * Supports both local PostgreSQL and Neon serverless
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { sql as dsql } from 'drizzle-orm';
import { Pool } from 'pg';
import * as schema from '../lib/db/schemas/index';

// Determine which database to use for testing
const useLocalPostgres = process.env.TEST_DB_TYPE === 'local-postgres' || process.env.TEST_DB_TYPE === 'local';

// Test database connection
let sql: ReturnType<typeof neon> | Pool;
let testDb: ReturnType<typeof drizzle> | ReturnType<typeof drizzleNeon>;

if (useLocalPostgres) {
  // Local PostgreSQL connection
  const testConnectionString = process.env.TEST_DATABASE_URL || 'postgresql://financbase_test_user:financbase_test_password@localhost:5433/financbase_test';
  const pool = new Pool({
    connectionString: testConnectionString,
  });
  sql = pool;
  testDb = drizzle(pool, { schema });
} else {
  // Neon serverless connection
  const testConnectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_MD6PAjcl0TWR@ep-curly-wave-adu3fywi-pooler.c-2.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';
  sql = neon(testConnectionString);
  testDb = drizzleNeon(sql, { schema });
}

export { testDb };

// Test database utilities
export class TestDatabase {
  private static instance: TestDatabase;
  private isInitialized = false;

  static getInstance(): TestDatabase {
    if (!TestDatabase.instance) {
      TestDatabase.instance = new TestDatabase();
    }
    return TestDatabase.instance;
  }

  async setup(): Promise<void> {
    if (this.isInitialized) return;

    // Ensure we're in a test environment
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('TestDatabase should only be used in test environment');
    }

    // Run any test-specific setup (migrations, etc.)
    this.isInitialized = true;
  }

  async cleanup(): Promise<void> {
    if (!this.isInitialized) return;

    // Clean up test data - delete in reverse dependency order
    // Only delete from tables that exist in the current database schema
    const tablesToClean = [
      'lead_tasks',
      'lead_activities',
      'leads',
      'transactions',
      'invoices',
      'expenses',
      'time_entries',
      'tasks',
      'projects',
      'clients',
      'campaigns',
      'ads',
      'ad_groups',
      'activities',
      'accounts',
      'payment_methods',
      'organizations',
      'organization_members',
      'users',
    ];

    for (const tableName of tablesToClean) {
      try {
        if (useLocalPostgres) {
          // For local PostgreSQL, use the Pool directly
          await (sql as Pool).query(`DELETE FROM "${tableName}" WHERE id LIKE 'test-%' OR id LIKE 'user-%' OR id LIKE 'client-%' OR id LIKE 'lead-%' OR id LIKE 'project-%' OR id LIKE 'campaign-%'`);
        } else {
          // For Neon, use Drizzle's sql helper
          await testDb.execute(dsql.raw(`DELETE FROM "${tableName}" WHERE id LIKE 'test-%' OR id LIKE 'user-%' OR id LIKE 'client-%' OR id LIKE 'lead-%' OR id LIKE 'project-%' OR id LIKE 'campaign-%'`));
        }
      } catch (error) {
        // Ignore errors for tables that don't exist or other issues
        console.warn(`Could not clean table ${tableName}:`, error);
      }
    }
  }

  async teardown(): Promise<void> {
    await this.cleanup();
    this.isInitialized = false;
  }
}

// Export the test database instance
export const testDatabase = TestDatabase.getInstance();