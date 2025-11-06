/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jobPostings } from '@/lib/db/schemas/careers.schema';
import { eq, desc, and } from 'drizzle-orm';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

// GET /api/careers - Get published job postings (public endpoint)
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { searchParams } = new URL(request.url);
		const department = searchParams.get('department');
		const featured = searchParams.get('featured') === 'true';

		// Build query conditions - only published jobs
		const conditions = [eq(jobPostings.status, 'published')];
		
		if (department && department !== 'All') {
			conditions.push(eq(jobPostings.department, department));
		}
		
		if (featured) {
			conditions.push(eq(jobPostings.isFeatured, true));
		}

		const jobs = await db
			.select()
			.from(jobPostings)
			.where(and(...conditions))
			.orderBy(desc(jobPostings.isFeatured), desc(jobPostings.postedAt), desc(jobPostings.createdAt));

		return NextResponse.json({ jobs });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

