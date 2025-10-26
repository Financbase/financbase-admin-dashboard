import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './db/schemas';

// Create Neon connection
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// Export common database utilities
export { sql } from 'drizzle-orm';
export type Database = typeof db;

// Database health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Connection info for debugging
export function getConnectionInfo() {
  return {
    url: process.env.DATABASE_URL ? 'configured' : 'missing',
    driver: 'neon-http'
  };
}