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

const updateCampaignSchema = z.object({
	name: z.string().min(1).optional(),
	description: z.string().optional(),
	type: z.enum(['search', 'display', 'social', 'video', 'email', 'retargeting', 'affiliate']).optional(),
	platform: z.string().optional(),
	audience: z.string().optional(),
	keywords: z.array(z.string()).optional(),
	demographics: z.record(z.unknown()).optional(),
	budget: z.number().min(0).optional(),
	dailyBudget: z.number().min(0).optional(),
	bidStrategy: z.string().optional(),
	maxBid: z.number().min(0).optional(),
	startDate: z.string().datetime().optional(),
	endDate: z.string().datetime().optional(),
	tags: z.array(z.string()).optional(),
	metadata: z.record(z.unknown()).optional(),
	notes: z.string().optional(),
});

const updateMetricsSchema = z.object({
	impressions: z.number().min(0).optional(),
	clicks: z.number().min(0).optional(),
	conversions: z.number().min(0).optional(),
	spend: z.number().min(0).optional(),
	revenue: z.number().min(0).optional(),
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

		const campaign = await AdboardService.getCampaignById(id, userId);

		if (!campaign) {
			return ApiErrorHandler.notFound('Campaign not found');
		}

		return NextResponse.json({ campaign });
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
		const action = body.action;

		if (action === 'update_metrics') {
			// Update campaign metrics
			const validatedData = updateMetricsSchema.parse(body);
			const campaign = await AdboardService.updateCampaignMetrics(id, userId, validatedData);
			return NextResponse.json({ campaign });
		} else {
			// Update campaign details
			const validatedData = updateCampaignSchema.parse(body);
			
			// Convert date strings to Date objects
			const processedData = {
				...validatedData,
				startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
				endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
			};

			const campaign = await AdboardService.updateCampaign(id, userId, processedData);
			return NextResponse.json({ campaign });
		}
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

export async function DELETE(
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

		const campaign = await AdboardService.getCampaignById(id, userId);

		if (!campaign) {
			return ApiErrorHandler.notFound('Campaign not found');
		}

		// Update campaign status to cancelled (soft delete)
		// In production, you might want to implement soft delete with a deleted_at field
		await AdboardService.updateCampaign(id, userId, {
			status: 'cancelled',
		});

		return NextResponse.json({
			message: 'Campaign deleted successfully',
			campaignId: id,
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
