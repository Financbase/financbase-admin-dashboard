/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from '@/lib/db';
import type { ExtractTablesWithRelations } from 'drizzle-orm';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import type { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import type { NeonHttpQueryResultHKT } from 'drizzle-orm/neon-http';
import type { NeonQueryResultHKT } from 'drizzle-orm/neon-serverless';
import type * as schema from '@/lib/db/schemas';

type Database = typeof db;
type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];

/**
 * Wrapper utility for database transactions
 * Ensures all operations within a transaction are atomic
 * 
 * @param operation - Function that receives transaction context and returns a promise
 * @returns Promise that resolves with the operation result or rejects on error
 * 
 * @example
 * ```typescript
 * const result = await withTransaction(async (tx) => {
 *   const user = await tx.insert(users).values({ name: 'John' }).returning();
 *   await tx.insert(profiles).values({ userId: user[0].id });
 *   return user[0];
 * });
 * ```
 */
export async function withTransaction<T>(
	operation: (tx: Transaction) => Promise<T>
): Promise<T> {
	return await db.transaction(async (tx) => {
		try {
			return await operation(tx);
		} catch (error) {
			// Log error for debugging
			console.error('Transaction failed:', error);
			// Re-throw to trigger rollback
			throw error;
		}
	});
}

