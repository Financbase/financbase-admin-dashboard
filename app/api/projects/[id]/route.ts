/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { FreelanceHubService } from '@/lib/services/freelance-hub-service';
import { z } from 'zod';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

const updateProjectSchema = z.object({
	name: z.string().min(1).optional(),
	description: z.string().optional(),
	status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).optional(),
	priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
	startDate: z.string().datetime().optional(),
	dueDate: z.string().datetime().optional(),
	budget: z.number().min(0).optional(),
	hourlyRate: z.number().min(0).optional(),
	currency: z.string().optional(),
	isBillable: z.boolean().optional(),
	allowOvertime: z.boolean().optional(),
	requireApproval: z.boolean().optional(),
	estimatedHours: z.number().min(0).optional(),
	tags: z.array(z.string()).optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
	notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	const { id } = await params;
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const project = await FreelanceHubService.getProjectById(id, userId);

		if (!project) {
			return ApiErrorHandler.notFound('Project not found');
		}

		return NextResponse.json({ project });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	const { id } = await params;
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		let body;
		try {
			body = await request.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}

		const validatedData = updateProjectSchema.parse(body);

		// Convert date strings to Date objects
		const processedData = {
			...validatedData,
			startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
			dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
		};

		const project = await FreelanceHubService.updateProject(id, userId, processedData);

		return NextResponse.json({ project });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
