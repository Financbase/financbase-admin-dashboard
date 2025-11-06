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
import { eq, and } from 'drizzle-orm';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

// GET /api/careers/[id] - Get a specific published job posting (public endpoint)
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const requestId = generateRequestId();
	try {
		const jobId = parseInt(params.id, 10);
		if (isNaN(jobId)) {
			return ApiErrorHandler.badRequest('Invalid job ID');
		}

		const jobs = await db
			.select()
			.from(jobPostings)
			.where(and(
				eq(jobPostings.id, jobId),
				eq(jobPostings.status, 'published')
			))
			.limit(1);

		if (jobs.length === 0) {
			return ApiErrorHandler.notFound('Job posting not found');
		}

		return NextResponse.json({ job: jobs[0] });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

