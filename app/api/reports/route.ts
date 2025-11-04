/**
 * Reports API Route
 * Handles report CRUD operations
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ReportService } from '@/lib/services/report-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

/**
 * GET /api/reports
 * Fetch all reports for the authenticated user
 */
export async function GET(req: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();

		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const searchParams = req.nextUrl.searchParams;
		const type = searchParams.get('type') || undefined;
		const isFavorite = searchParams.get('isFavorite') === 'true' ? true : undefined;
		const limitStr = searchParams.get('limit');
		const limit = limitStr ? parseInt(limitStr) : 50;
		const offsetStr = searchParams.get('offset');
		const offset = offsetStr ? parseInt(offsetStr) : 0;

		const reports = await ReportService.getAll(userId, {
			type,
			isFavorite,
			limit,
			offset,
		});

		return NextResponse.json(reports);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * POST /api/reports
 * Create a new report
 */
export async function POST(req: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();

		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		let body;
		try {
			body = await req.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}

		// Validate required fields
		if (!body.name || !body.type || !body.config) {
			return ApiErrorHandler.badRequest('Missing required fields: name, type, and config are required');
		}

		const report = await ReportService.create({
			userId,
			name: body.name,
			description: body.description,
			type: body.type,
			config: body.config,
			visualizationType: body.visualizationType,
			chartConfig: body.chartConfig,
			isPublic: body.isPublic || false,
			isFavorite: body.isFavorite || false,
			tags: body.tags,
		});

		return NextResponse.json(report, { status: 201 });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

