/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import 'server-only';

// Database connection utilities with dual driver support
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { drizzle as drizzleNode } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import * as schema from './schemas/index';

// Raw SQL connection for session variables and raw queries
let rawSql: ReturnType<typeof neon> | null = null;

/**
 * Get raw Neon SQL connection for executing session variables and raw SQL
 * This is needed for operations like set_config() that require session-level access
 */
export function getRawSqlConnection(): ReturnType<typeof neon> {
	if (!rawSql) {
		if (!process.env.DATABASE_URL) {
			throw new Error('DATABASE_URL is required for raw SQL connection');
		}
		rawSql = neon(process.env.DATABASE_URL);
	}
	return rawSql;
}

// Environment-based driver selection
const getDatabaseDriver = () => {
	if (process.env.NODE_ENV === 'production') {
		return process.env.DATABASE_DRIVER || 'neon-http';
	}
	return process.env.DATABASE_DRIVER || 'neon-serverless';
};

// Create database connection based on environment
const createDatabaseConnection = () => {
	const driver = getDatabaseDriver();
	
	if (!process.env.DATABASE_URL) {
		throw new Error(
			'DATABASE_URL is required but not set. Please ensure your .env.local file contains DATABASE_URL.'
		);
	}
	
	switch (driver) {
		case 'neon-http': {
			const sql = neon(process.env.DATABASE_URL);
			return drizzle(sql, { schema });
		}
		
		case 'neon-serverless': {
			const neonSql = neon(process.env.DATABASE_URL);
			return drizzleNode(neonSql, { schema });
		}
		
		case 'postgres': {
			// Fallback to neon-http for postgres driver to avoid pg module issues
			console.warn('Postgres driver not available in browser, falling back to neon-http');
			const sql = neon(process.env.DATABASE_URL);
			return drizzle(sql, { schema });
		}
		
		default:
			throw new Error(`Unsupported database driver: ${driver}`);
	}
};

// Lazy-loaded database connection to ensure env vars are loaded
type DatabaseInstance = ReturnType<typeof createDatabaseConnection>;
let dbInstance: DatabaseInstance | null = null;

// Lazy getter for database instance
const getDb = (): DatabaseInstance => {
	if (!dbInstance) {
		dbInstance = createDatabaseConnection();
	}
	return dbInstance;
};

// Export database instance with lazy initialization
export const db = new Proxy({} as DatabaseInstance, {
	get(_target, prop) {
		return getDb()[prop as keyof DatabaseInstance];
	}
});

// Helper function to get database instance or throw error
export function getDbOrThrow() {
	return getDb();
}

// Export connection info for health checks
export const getConnectionInfo = () => ({
	driver: getDatabaseDriver(),
	url: process.env.DATABASE_URL ? 'configured' : 'missing',
});

// Database health check function
export async function checkDatabaseHealth(): Promise<boolean> {
	try {
		const database = getDb();
		// Simple health check query using raw SQL
		const result = await database.execute(sql`SELECT 1 as health_check`);
		return result.rows.length > 0;
	} catch (error) {
		console.error('Database health check failed:', error);
		return false;
	}
}

// Graceful shutdown function
export async function closeDatabaseConnection(): Promise<void> {
	try {
		if (dbInstance && 'end' in dbInstance) {
			await (dbInstance as { end: () => Promise<void> }).end();
		}
		dbInstance = null;
		console.log('Database connection closed');
	} catch (error) {
		console.error('Error closing database connection:', error);
	}
}

// Export common database utilities
export { sql } from 'drizzle-orm';
export type Database = typeof db;
