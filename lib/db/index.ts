// Database connection utilities
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import * as schema from './schemas/index';

// Create database connection
const sql = neon(process.env.DATABASE_URL || '');
export const db = drizzle(sql, { schema });

// Export common database utilities
export { sql };
