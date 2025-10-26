// Database connection utilities with dual driver support
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { drizzle as drizzleNode } from 'drizzle-orm/neon-serverless';
import * as schema from './schemas/index';

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
	
	switch (driver) {
		case 'neon-http': {
			if (!process.env.DATABASE_URL) {
				throw new Error('DATABASE_URL is required for neon-http driver');
			}
			const sql = neon(process.env.DATABASE_URL);
			return drizzle(sql, { schema });
		}
			
		case 'neon-serverless': {
			if (!process.env.DATABASE_URL) {
				throw new Error('DATABASE_URL is required for neon-serverless driver');
			}
			const neonSql = neon(process.env.DATABASE_URL);
			return drizzleNode(neonSql, { schema });
		}
			
		case 'postgres': {
			// Fallback to neon-http for postgres driver to avoid pg module issues
			console.warn('Postgres driver not available in browser, falling back to neon-http');
			if (!process.env.DATABASE_URL) {
				throw new Error('DATABASE_URL is required for neon-http driver');
			}
			const sql = neon(process.env.DATABASE_URL);
			return drizzle(sql, { schema });
		}
			
		default:
			throw new Error(`Unsupported database driver: ${driver}`);
	}
};

// Create the database instance
export const db = createDatabaseConnection();

// Helper function to get database instance or throw error
export function getDbOrThrow() {
	if (!db) {
		throw new Error('Database connection not initialized');
	}
	return db;
}

// Export connection info for health checks
export const getConnectionInfo = () => ({
	driver: getDatabaseDriver(),
	url: process.env.DATABASE_URL ? 'configured' : 'missing',
});

// Database health check function
export async function checkDatabaseHealth(): Promise<boolean> {
	try {
		if (!db) return false;
		
		// Simple health check query
		await db.execute('SELECT 1');
		return true;
	} catch (error) {
		console.error('Database health check failed:', error);
		return false;
	}
}

// Graceful shutdown function
export async function closeDatabaseConnection(): Promise<void> {
	try {
		if (db && 'end' in db) {
			await (db as { end: () => Promise<void> }).end();
		}
		console.log('Database connection closed');
	} catch (error) {
		console.error('Error closing database connection:', error);
	}
}

// Export common database utilities
export { sql } from 'drizzle-orm';
export type Database = typeof db;
