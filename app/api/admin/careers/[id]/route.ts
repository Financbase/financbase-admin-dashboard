/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { jobPostings } from '@/lib/db/schemas/careers.schema';
import { eq } from 'drizzle-orm';
import { checkPermission, isManagerOrAbove } from '@/lib/auth/financbase-rbac';
import { FINANCIAL_PERMISSIONS } from '@/types/auth';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { z } from 'zod';

const updateJobPostingSchema = z.object({
	title: z.string().min(1).optional(),
	department: z.string().min(1).optional(),
	location: z.string().min(1).optional(),
	type: z.string().min(1).optional(),
	experience: z.string().min(1).optional(),
	description: z.string().min(1).optional(),
	fullDescription: z.string().optional(),
	requirements: z.array(z.string()).optional(),
	responsibilities: z.array(z.string()).optional(),
	qualifications: z.array(z.string()).optional(),
	salary: z.string().optional(),
	benefits: z.array(z.string()).optional(),
	status: z.enum(['draft', 'published', 'closed', 'archived']).optional(),
	isFeatured: z.boolean().optional(),
});

// GET /api/admin/careers/[id] - Get a specific job posting
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Check if user has permission to view careers
		const hasPermission = await checkPermission(FINANCIAL_PERMISSIONS.CAREERS_VIEW);
		const isManager = await isManagerOrAbove();
		if (!hasPermission && !isManager) {
			return ApiErrorHandler.forbidden('You do not have permission to view job postings');
		}

		const jobId = parseInt(params.id, 10);
		if (isNaN(jobId)) {
			return ApiErrorHandler.badRequest('Invalid job ID');
		}

		const jobs = await db
			.select()
			.from(jobPostings)
			.where(eq(jobPostings.id, jobId))
			.limit(1);

		if (jobs.length === 0) {
			return ApiErrorHandler.notFound('Job posting not found');
		}

		return NextResponse.json({ job: jobs[0] });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

// PUT /api/admin/careers/[id] - Update a job posting
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Check if user has permission to edit careers
		const hasPermission = await checkPermission(FINANCIAL_PERMISSIONS.CAREERS_EDIT);
		const isManager = await isManagerOrAbove();
		if (!hasPermission && !isManager) {
			return ApiErrorHandler.forbidden('You do not have permission to edit job postings');
		}

		const jobId = parseInt(params.id, 10);
		if (isNaN(jobId)) {
			return ApiErrorHandler.badRequest('Invalid job ID');
		}

		// Check if job exists
		const existingJobs = await db
			.select()
			.from(jobPostings)
			.where(eq(jobPostings.id, jobId))
			.limit(1);

		if (existingJobs.length === 0) {
			return ApiErrorHandler.notFound('Job posting not found');
		}

		let body;
		try {
			body = await request.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}

		const validatedData = updateJobPostingSchema.parse(body);

		// If status is being changed to published and wasn't published before, set postedAt
		const updateData: any = { ...validatedData };
		if (validatedData.status === 'published' && existingJobs[0].status !== 'published' && !existingJobs[0].postedAt) {
			updateData.postedAt = new Date();
		}
		// If status is being changed to closed, set closedAt
		if (validatedData.status === 'closed' && existingJobs[0].status !== 'closed') {
			updateData.closedAt = new Date();
		}

		updateData.updatedAt = new Date();

		const updated = await db
			.update(jobPostings)
			.set(updateData)
			.where(eq(jobPostings.id, jobId))
			.returning();

		return NextResponse.json({ job: updated[0] });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return ApiErrorHandler.badRequest(error.errors.map(e => e.message).join(', '));
		}
		return ApiErrorHandler.handle(error, requestId);
	}
}

// DELETE /api/admin/careers/[id] - Delete a job posting
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Check if user has permission to delete careers
		const hasPermission = await checkPermission(FINANCIAL_PERMISSIONS.CAREERS_DELETE);
		const isManager = await isManagerOrAbove();
		if (!hasPermission && !isManager) {
			return ApiErrorHandler.forbidden('You do not have permission to delete job postings');
		}

		const jobId = parseInt(params.id, 10);
		if (isNaN(jobId)) {
			return ApiErrorHandler.badRequest('Invalid job ID');
		}

		// Check if job exists
		const existingJobs = await db
			.select()
			.from(jobPostings)
			.where(eq(jobPostings.id, jobId))
			.limit(1);

		if (existingJobs.length === 0) {
			return ApiErrorHandler.notFound('Job posting not found');
		}

		// Soft delete by archiving instead of hard delete
		await db
			.update(jobPostings)
			.set({
				status: 'archived',
				closedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(jobPostings.id, jobId));

		return NextResponse.json({ message: 'Job posting archived successfully' });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

