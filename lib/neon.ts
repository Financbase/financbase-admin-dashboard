/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql as drizzleSql } from 'drizzle-orm';
import * as schema from './db/schemas';

// Lazy-loaded Neon connection
let sqlInstance: ReturnType<typeof neon> | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

const getSql = (): ReturnType<typeof neon> => {
	if (!sqlInstance) {
		if (!process.env.DATABASE_URL) {
			throw new Error(
				'DATABASE_URL is required but not set. Please ensure your .env.local file contains DATABASE_URL.'
			);
		}
		sqlInstance = neon(process.env.DATABASE_URL);
	}
	return sqlInstance;
};

const getDb = (): ReturnType<typeof drizzle> => {
	if (!dbInstance) {
		dbInstance = drizzle(getSql(), { schema });
	}
	return dbInstance;
};

// Export lazy-initialized Neon SQL connection
// Create a Proxy that only accesses getSql() when properties are accessed
export const sql = new Proxy({} as ReturnType<typeof neon>, {
	get(_target, prop, _receiver) {
		const sqlConnection = getSql();
		const value = sqlConnection[prop as keyof ReturnType<typeof neon>];
		if (typeof value === 'function') {
			return value.bind(sqlConnection);
		}
		return value;
	},
});

// Export lazy-initialized Drizzle database instance
// Use a function to keep it truly lazy
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
	get(_target, prop, _receiver) {
		const dbConnection = getDb();
		const value = dbConnection[prop as keyof ReturnType<typeof drizzle>];
		if (typeof value === 'function') {
			return value.bind(dbConnection);
		}
		return value;
	},
});

// Export Drizzle SQL template tag for queries
export { drizzleSql as sqlTemplate };
export type Database = typeof db;

// Database health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const sqlConnection = getSql();
    await sqlConnection`SELECT 1`;
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