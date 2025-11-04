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
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

const createLeadSchema = z.object({
	firstName: z.string().min(1, 'First name is required'),
	lastName: z.string().min(1, 'Last name is required'),
	email: z.string().email('Valid email is required'),
	phone: z.string().optional(),
	company: z.string().optional(),
	jobTitle: z.string().optional(),
	website: z.string().url().optional().or(z.literal('')),
	source: z.enum(['website', 'referral', 'social_media', 'email_campaign', 'cold_call', 'trade_show', 'advertisement', 'partner', 'other']),
	priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
	estimatedValue: z.number().min(0).optional(),
	probability: z.number().min(0).max(100).optional(),
	expectedCloseDate: z.string().datetime().optional(),
	assignedTo: z.string().optional(),
	tags: z.array(z.string()).optional(),
	notes: z.string().optional(),
	metadata: z.record(z.unknown()).optional(),
});

export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		// Authenticate user
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '20');
		const search = searchParams.get('search') || undefined;
		const status = searchParams.get('status') || undefined;
		const source = searchParams.get('source') || undefined;
		const priority = searchParams.get('priority') || undefined;
		const assignedTo = searchParams.get('assignedTo') || undefined;

		const result = await LeadManagementService.getPaginatedLeads(userId, {
			page,
			limit,
			search,
			status,
			source,
			priority,
			assignedTo,
		});

		return NextResponse.json(result);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

export async function POST(request: NextRequest) {
	try {
		// Authenticate user
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const requestId = generateRequestId();

		let body;
		try {
			body = await request.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}

		const validatedData = createLeadSchema.parse(body);

		// Convert date strings to Date objects
		const processedData = {
			...validatedData,
			expectedCloseDate: validatedData.expectedCloseDate ? new Date(validatedData.expectedCloseDate) : undefined,
		};

		const lead = await LeadManagementService.createLead({
			...processedData,
			userId,
		});

		return NextResponse.json({ lead }, { status: 201 });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
