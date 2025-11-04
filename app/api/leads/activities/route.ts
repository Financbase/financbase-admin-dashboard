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
import { LeadManagementService } from '@/lib/services/lead-management-service';
import { z } from 'zod';

const createActivitySchema = z.object({
	leadId: z.string().min(1, 'Lead ID is required'),
	type: z.enum(['call', 'email', 'meeting', 'proposal', 'follow_up', 'note', 'task', 'conversion', 'status_change']),
	subject: z.string().min(1, 'Subject is required'),
	description: z.string().optional(),
	scheduledDate: z.string().datetime().optional(),
	duration: z.number().min(0).optional(),
	outcome: z.string().optional(),
	nextSteps: z.string().optional(),
	notes: z.string().optional(),
	requiresFollowUp: z.boolean().optional(),
	followUpDate: z.string().datetime().optional(),
	metadata: z.record(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
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

		const validatedData = createActivitySchema.parse(body);

		// Convert date strings to Date objects
		const processedData = {
			...validatedData,
			scheduledDate: validatedData.scheduledDate ? new Date(validatedData.scheduledDate) : undefined,
			followUpDate: validatedData.followUpDate ? new Date(validatedData.followUpDate) : undefined,
		};

		const activity = await LeadManagementService.createLeadActivity({
			...processedData,
			userId,
		});

		return NextResponse.json({ activity }, { status: 201 });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
