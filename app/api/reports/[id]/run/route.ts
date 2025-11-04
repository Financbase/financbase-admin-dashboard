/**
 * Report Run API Route
 * Executes a report and returns results
 */

import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
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

