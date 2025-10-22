/**
 * Report Templates API Route
 * Manages report templates
 */

import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ReportService } from '@/lib/services/report-service';

/**
 * GET /api/reports/templates
 * Get all report templates
 */
export async function GET(req: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const searchParams = req.nextUrl.searchParams;
		const category = searchParams.get('category') || undefined;

		const templates = await ReportService.getTemplates(category);

		return NextResponse.json(templates);
	} catch (error) {
		console.error('Error fetching templates:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch templates' },
			{ status: 500 }
		);
	}
}

/**
 * POST /api/reports/templates/[id]/create
 * Create report from template
 */
export async function POST(req: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await req.json();

		if (!body.templateId) {
			return NextResponse.json(
				{ error: 'Template ID is required' },
				{ status: 400 }
			);
		}

		const report = await ReportService.createFromTemplate(
			body.templateId,
			userId,
			body.customizations
		);

		return NextResponse.json(report, { status: 201 });
	} catch (error) {
		console.error('Error creating report from template:', error);
		return NextResponse.json(
			{ error: 'Failed to create report from template' },
			{ status: 500 }
		);
	}
}

