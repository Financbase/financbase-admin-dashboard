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
import { AdboardService } from '@/lib/services/adboard-service';
import { z } from 'zod';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { getCurrentUserId } from '@/lib/api/with-rls';

const createCampaignSchema = z.object({
	name: z.string().min(1, 'Campaign name is required'),
	description: z.string().optional(),
	type: z.enum(['search', 'display', 'social', 'video', 'email', 'retargeting', 'affiliate']),
	platform: z.string().min(1, 'Platform is required'),
	audience: z.string().optional(),
	keywords: z.array(z.string()).optional(),
	demographics: z.record(z.string(), z.unknown()).optional(),
	budget: z.number().min(0, 'Budget must be positive'),
	dailyBudget: z.number().min(0).optional(),
	bidStrategy: z.string().optional(),
	maxBid: z.number().min(0).optional(),
	startDate: z.string().datetime(),
	endDate: z.string().datetime().optional(),
	tags: z.array(z.string()).optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
	notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId: clerkId } = await auth();
		if (!clerkId) {
			return ApiErrorHandler.unauthorized();
		}

		// Convert Clerk ID to database user ID (UUID)
		const dbUserId = await getCurrentUserId();
		if (!dbUserId) {
			return ApiErrorHandler.badRequest('User not found in database');
		}

		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '20');
		const search = searchParams.get('search') || undefined;
		const status = searchParams.get('status') || undefined;
		const type = searchParams.get('type') || undefined;
		const platform = searchParams.get('platform') || undefined;

		const result = await AdboardService.getPaginatedCampaigns(dbUserId, {
			page,
			limit,
			search,
			status,
			type,
			platform,
		});

		return NextResponse.json(result);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId: clerkId } = await auth();
		if (!clerkId) {
			return ApiErrorHandler.unauthorized();
		}

		// Convert Clerk ID to database user ID (UUID)
		const dbUserId = await getCurrentUserId();
		if (!dbUserId) {
			return ApiErrorHandler.badRequest('User not found in database');
		}

		let body;
		try {
			body = await request.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}

		const validatedData = createCampaignSchema.parse(body);

		// Convert date strings to Date objects
		const processedData = {
			...validatedData,
			startDate: new Date(validatedData.startDate),
			endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
		};

		const campaign = await AdboardService.createCampaign({
			...processedData,
			userId: dbUserId,
		});

		return NextResponse.json({ campaign }, { status: 201 });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
