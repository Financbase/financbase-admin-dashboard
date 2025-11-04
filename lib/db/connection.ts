/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schemas/index';

// Create the connection
const sql = neon(process.env.DATABASE_URL!);

// Create the database instance
export const db = drizzle(sql, { schema });

// Export types
export type Database = typeof db;
