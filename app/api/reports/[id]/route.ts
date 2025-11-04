/**
 * Report Detail API Route
 * Handles single report operations
 */

import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ReportService } from '@/lib/services/report-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

/**
 * GET /api/reports/[id]
 * Fetch a single report
 */
export async function GET(
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

		const report = await ReportService.getById(id, userId);

		if (!report) {
			return ApiErrorHandler.notFound('Report not found');
		}

		return NextResponse.json(report);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * PUT /api/reports/[id]
 * Update a report
 */
export async function PUT(
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

		let body;
		try {
			body = await _req.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}

		const report = await ReportService.update(id, userId, body);

		return NextResponse.json(report);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * DELETE /api/reports/[id]
 * Delete a report
 */
export async function DELETE(
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

		await ReportService.delete(id, userId);

		return NextResponse.json({ success: true });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

