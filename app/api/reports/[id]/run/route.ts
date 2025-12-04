/**
 * Report Run API Route
 * Executes a report and returns results
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
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { ReportService } from '@/lib/services/report-service';

/**
 * POST /api/reports/[id]/run
 * Run a report and get results
 */
export async function POST(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	const { id: idParam } = await params;
	try {
		const { userId } = await auth();

		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const id = parseInt(idParam, 10);
		if (Number.isNaN(id)) {
			return ApiErrorHandler.badRequest('Invalid report ID');
		}

		const history = await ReportService.run(id, userId);

		return NextResponse.json(history);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

