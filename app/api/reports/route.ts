/**
 * Reports API Route
 * Handles report CRUD operations
 */

import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ReportService } from '@/lib/services/report-service';

/**
 * GET /api/reports
 * Fetch all reports for the authenticated user
 */
export async function GET(req: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
		console.error('Error fetching reports:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch reports' },
			{ status: 500 }
		);
	}
}

/**
 * POST /api/reports
 * Create a new report
 */
export async function POST(req: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await req.json();

		// Validate required fields
		if (!body.name || !body.type || !body.config) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
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
		console.error('Error creating report:', error);
		return NextResponse.json(
			{ error: 'Failed to create report' },
			{ status: 500 }
		);
	}
}

