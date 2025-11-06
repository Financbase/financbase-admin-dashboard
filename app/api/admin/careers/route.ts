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
import { eq, desc, and } from 'drizzle-orm';
import { checkPermission, isManagerOrAbove } from '@/lib/auth/financbase-rbac';
import { FINANCIAL_PERMISSIONS } from '@/types/auth';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { z } from 'zod';

const createJobPostingSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	department: z.string().min(1, 'Department is required'),
	location: z.string().min(1, 'Location is required'),
	type: z.string().min(1, 'Type is required'),
	experience: z.string().min(1, 'Experience is required'),
	description: z.string().min(1, 'Description is required'),
	fullDescription: z.string().optional(),
	requirements: z.array(z.string()).default([]),
	responsibilities: z.array(z.string()).default([]),
	qualifications: z.array(z.string()).default([]),
	salary: z.string().optional(),
	benefits: z.array(z.string()).default([]),
	status: z.enum(['draft', 'published', 'closed', 'archived']).default('draft'),
	isFeatured: z.boolean().default(false),
});

const updateJobPostingSchema = createJobPostingSchema.partial();

// GET /api/admin/careers - Get all job postings
export async function GET(request: NextRequest) {
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

		const { searchParams } = new URL(request.url);
		const status = searchParams.get('status');
		const department = searchParams.get('department');

		// Build query conditions
		const conditions = [];
		if (status) {
			conditions.push(eq(jobPostings.status, status as any));
		}
		if (department) {
			conditions.push(eq(jobPostings.department, department));
		}

		const jobs = await db
			.select()
			.from(jobPostings)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(jobPostings.createdAt));

		return NextResponse.json({ jobs });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

// POST /api/admin/careers - Create a new job posting
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Check if user has permission to create careers
		const hasPermission = await checkPermission(FINANCIAL_PERMISSIONS.CAREERS_CREATE);
		const isManager = await isManagerOrAbove();
		if (!hasPermission && !isManager) {
			return ApiErrorHandler.forbidden('You do not have permission to create job postings');
		}

		let body;
		try {
			body = await request.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}

		const validatedData = createJobPostingSchema.parse(body);

		// If status is published, set postedAt
		const postedAt = validatedData.status === 'published' ? new Date() : null;

		const job = await db
			.insert(jobPostings)
			.values({
				userId,
				title: validatedData.title,
				department: validatedData.department,
				location: validatedData.location,
				type: validatedData.type,
				experience: validatedData.experience,
				description: validatedData.description,
				fullDescription: validatedData.fullDescription,
				requirements: validatedData.requirements,
				responsibilities: validatedData.responsibilities,
				qualifications: validatedData.qualifications,
				salary: validatedData.salary,
				benefits: validatedData.benefits,
				status: validatedData.status,
				isFeatured: validatedData.isFeatured,
				postedAt,
			})
			.returning();

		return NextResponse.json({ job: job[0] }, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return ApiErrorHandler.badRequest(error.errors.map(e => e.message).join(', '));
		}
		return ApiErrorHandler.handle(error, requestId);
	}
}

