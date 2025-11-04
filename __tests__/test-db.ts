/**
 * Test Database Configuration
 * Real database testing setup for Vitest
 * Supports both local PostgreSQL and Neon serverless
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { drizzle as drizzleServerless } from 'drizzle-orm/neon-serverless';
import { sql as dsql } from 'drizzle-orm';
import { neon } from '@neondatabase/serverless';
import * as schema from '../lib/db/schemas/index';

// Determine which database to use for testing
const useLocalPostgres = process.env.TEST_DB_TYPE === 'local-postgres' || process.env.TEST_DB_TYPE === 'local';

// Determine which driver to use (match lib/db pattern)
const getTestDatabaseDriver = () => {
  if (useLocalPostgres) {
    return 'postgres';
  }
  // Use neon-http by default (matches production pattern from lib/db)
  return process.env.DATABASE_DRIVER || 'neon-http';
};

// Test database connection
let sql: ReturnType<typeof neon> | any;
let testDb: any;

const driver = getTestDatabaseDriver();
const testConnectionString = useLocalPostgres
  ? (process.env.TEST_DATABASE_URL || 'postgresql://financbase_test_user:financbase_test_password@localhost:5433/financbase_test')
  : (process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_MD6PAjcl0TWR@ep-curly-wave-adu3fywi-pooler.c-2.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require');

if (driver === 'postgres' || useLocalPostgres) {
  // Local PostgreSQL connection (requires 'pg' package)
  try {
    const { Pool } = require('pg');
    const { drizzle: drizzlePg } = require('drizzle-orm/node-postgres');
  const pool = new Pool({
    connectionString: testConnectionString,
  });
  sql = pool;
    testDb = drizzlePg(pool, { schema });
  } catch (error) {
    throw new Error('Local PostgreSQL requires "pg" package. Install it with: npm install pg');
  }
} else if (driver === 'neon-http') {
  // Neon HTTP connection (default, matches production)
  sql = neon(testConnectionString);
  testDb = drizzle(sql, { schema });
} else {
  // Neon serverless connection (fallback)
  sql = neon(testConnectionString);
  testDb = drizzleServerless(sql, { schema });
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
        // Try to delete test data - use a safer approach that doesn't rely on LIKE with UUID
        // Only delete if we can identify test data safely
        if (useLocalPostgres && sql && typeof sql.query === 'function') {
          // For local PostgreSQL, use the Pool directly
          // Skip cleanup for tables with UUID columns - they need explicit test data tracking
          if (!['lead_tasks', 'lead_activities', 'leads', 'transactions', 'invoices', 'expenses', 
                'time_entries', 'tasks', 'projects', 'clients', 'campaigns', 'ads', 'ad_groups',
                'accounts', 'payment_methods', 'organizations', 'organization_members', 'users'].includes(tableName)) {
            await sql.query(`DELETE FROM "${tableName}" WHERE id::text LIKE 'test-%' OR id::text LIKE 'user-%' OR id::text LIKE 'client-%'`);
          }
        } else {
          // For Neon, skip cleanup for tables that might have UUID columns
          // These tables should be cleaned up by test-specific cleanup code
          if (!['lead_tasks', 'lead_activities', 'leads', 'transactions', 'invoices', 'expenses', 
                'time_entries', 'tasks', 'projects', 'clients', 'campaigns', 'ads', 'ad_groups',
                'accounts', 'payment_methods', 'organizations', 'organization_members', 'users'].includes(tableName)) {
            try {
              await testDb.execute(dsql.raw(`DELETE FROM "${tableName}" WHERE id::text LIKE 'test-%' OR id::text LIKE 'user-%' OR id::text LIKE 'client-%'`));
            } catch (e) {
              // If type casting fails, just skip this table
            }
          }
        }
      } catch (error) {
        // Ignore errors for tables that don't exist or other issues
        // Don't log warnings for expected UUID LIKE errors
        if (error && typeof error === 'object' && 'code' in error && error.code !== '42883') {
        console.warn(`Could not clean table ${tableName}:`, error);
        }
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