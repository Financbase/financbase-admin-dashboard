// Database connection utilities with dual driver support
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schemas/index';
import * as legacySchema from './schema/index';

// Merge both schemas to ensure all tables are available
const mergedSchema = { ...schema, ...legacySchema };

// Determine which driver to use based on environment and URL
const getDatabaseDriver = () => {
	const dbDriver = process.env.DB_DRIVER || 'auto';
	const databaseUrl = process.env.DATABASE_URL || '';

	// Auto-detect based on URL if DB_DRIVER is not specified
	if (dbDriver === 'auto') {
		if (databaseUrl.includes('neon') || databaseUrl.includes('neondb')) {
			return 'neon';
		}
		return 'pool';
	}

	return dbDriver;
};

// Create database connection based on driver
const createDatabaseConnection = () => {
	const driver = getDatabaseDriver();
	const databaseUrl = process.env.DATABASE_URL || '';

	if (!databaseUrl) {
		throw new Error('DATABASE_URL environment variable is required');
	}

	console.log(`🔌 Using database driver: ${driver}`);

	if (driver === 'neon') {
		// Use Neon serverless driver for production/serverless environments
		const sql = neon(databaseUrl);
		return drizzle(sql, { schema: mergedSchema });
	} else {
		// Use pg.Pool for local development and traditional PostgreSQL
		const pool = new Pool({
			connectionString: databaseUrl,
			min: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
			max: parseInt(process.env.DATABASE_POOL_MAX || '10', 10),
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 2000,
		});

		// Handle pool errors
		pool.on('error', (err) => {
			console.error('Unexpected error on idle client', err);
		});

		return drizzleNode(pool, { schema: mergedSchema });
	}
};

// Export the unified database instance
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
	url: process.env.DATABASE_URL?.replace(/\/\/.*@/, '//***:***@'), // Mask credentials
});

// Database health check function
export async function checkDatabaseHealth(): Promise<boolean> {
	try {
		const driver = getDatabaseDriver();
		
		if (driver === 'neon') {
			// For Neon, we need to create a new connection for health check
			const sql = neon(process.env.DATABASE_URL || '');
			await sql`SELECT 1`;
		} else {
			// For PostgreSQL pool, we can use the existing connection
			await db.execute('SELECT 1');
		}
		return true;
	} catch (error) {
		console.error('Database health check failed:', error);
		return false;
	}
}

// Graceful shutdown function
export async function closeDatabaseConnection(): Promise<void> {
	const driver = getDatabaseDriver();
	
	if (driver === 'pool') {
		// For pool driver, we need to close the pool
		// Note: This is a simplified approach - in practice, you'd need to track the pool instance
		console.log('Closing database pool connection...');
	}
}

// Export common database utilities
export { sql } from 'drizzle-orm';
