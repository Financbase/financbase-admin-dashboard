/**
 * Report Detail API Route
 * Handles single report operations
 */

import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ReportService } from '@/lib/services/report-service';

/**
 * GET /api/reports/[id]
 * Fetch a single report
 */
export async function GET(
	_req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const id = parseInt(params.id);
		const report = await ReportService.getById(id, userId);

		if (!report) {
			return NextResponse.json({ error: 'Report not found' }, { status: 404 });
		}

		return NextResponse.json(report);
	} catch (error) {
		console.error('Error fetching report:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch report' },
			{ status: 500 }
		);
	}
}

/**
 * PUT /api/reports/[id]
 * Update a report
 */
export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const id = parseInt(params.id);
		const body = await req.json();

		const report = await ReportService.update(id, userId, body);

		return NextResponse.json(report);
	} catch (error) {
		console.error('Error updating report:', error);
		return NextResponse.json(
			{ error: 'Failed to update report' },
			{ status: 500 }
		);
	}
}

/**
 * DELETE /api/reports/[id]
 * Delete a report
 */
export async function DELETE(
	_req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const id = parseInt(params.id);
		await ReportService.delete(id, userId);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting report:', error);
		return NextResponse.json(
			{ error: 'Failed to delete report' },
			{ status: 500 }
		);
	}
}

