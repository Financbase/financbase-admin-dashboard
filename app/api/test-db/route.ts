/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schemas/users.schema';
import { logger } from '@/lib/logger';

export async function GET() {
	try {
		// Try a simple select query
		const result = await db.select().from(users).limit(1);
		return NextResponse.json({ success: true, result });
	} catch (error) {
		logger.error('Database test error:', error);
		return NextResponse.json({ error: 'Database connection failed', details: (error as Error).message }, { status: 500 });
	}
}