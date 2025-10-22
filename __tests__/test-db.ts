/**
 * Test Database Configuration
 * Real database testing setup for Vitest
 */

import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import * as schema from '../lib/db/schemas/index';

// Test database connection - uses the same Neon database but with test isolation
const testConnectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_MD6PAjcl0TWR@ep-curly-wave-adu3fywi-pooler.c-2.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';

const sql = neon(testConnectionString);
export const testDb = drizzle(sql, { schema });

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
        // Use raw SQL to safely delete test data
        await testDb.execute(sql.raw(`DELETE FROM "${tableName}" WHERE id LIKE 'test-%' OR id LIKE 'user-%' OR id LIKE 'client-%' OR id LIKE 'lead-%' OR id LIKE 'project-%' OR id LIKE 'campaign-%'`));
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