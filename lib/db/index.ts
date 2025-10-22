// Database connection utilities with dual driver support
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schemas/index';

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
		return drizzle(sql, { schema });
	} else {
		// Use pg.Pool for local development and traditional PostgreSQL
		const pool = new Pool({
			connectionString: databaseUrl,
			min: parseInt(process.env.DATABASE_POOL_MIN || '2'),
			max: parseInt(process.env.DATABASE_POOL_MAX || '10'),
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 2000,
		});

		// Handle pool errors
		pool.on('error', (err) => {
			console.error('Unexpected error on idle client', err);
		});

		return drizzleNode(pool, { schema });
	}
};

// Export the unified database instance
export const db = createDatabaseConnection();

// Export connection info for health checks
export const getConnectionInfo = () => ({
	driver: getDatabaseDriver(),
	url: process.env.DATABASE_URL?.replace(/\/\/.*@/, '//***:***@'), // Mask credentials
});

// Export common database utilities
export { sql } from 'drizzle-orm';
