/**
 * Report Templates API Route
 * Manages report templates
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
import { logger } from '@/lib/logger';

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

		// If no templates found, return default templates
		if (!templates || templates.length === 0) {
			return NextResponse.json(getDefaultTemplates());
		}

		return NextResponse.json(templates);
	} catch (error) {
		logger.error('Error fetching templates:', error);
		
		// Return default templates on error instead of failing
		return NextResponse.json(getDefaultTemplates());
	}
}

/**
 * Default report templates when database table doesn't exist
 */
function getDefaultTemplates() {
	return [
		{
			id: 1,
			name: 'Profit & Loss',
			description: 'Comprehensive income statement showing revenue, expenses, and net profit',
			category: 'financial',
			type: 'profit_loss',
			icon: 'TrendingUp',
			isPopular: true,
		},
		{
			id: 2,
			name: 'Cash Flow Statement',
			description: 'Track cash inflows and outflows over a period',
			category: 'financial',
			type: 'cash_flow',
			icon: 'DollarSign',
			isPopular: true,
		},
		{
			id: 3,
			name: 'Balance Sheet',
			description: 'Assets, liabilities, and equity snapshot',
			category: 'financial',
			type: 'balance_sheet',
			icon: 'BarChart3',
			isPopular: false,
		},
		{
			id: 4,
			name: 'Revenue by Customer',
			description: 'Breakdown of revenue by customer',
			category: 'financial',
			type: 'revenue_by_customer',
			icon: 'Users',
			isPopular: false,
		},
		{
			id: 5,
			name: 'Expenses by Category',
			description: 'Categorized expense breakdown',
			category: 'financial',
			type: 'expense_by_category',
			icon: 'Receipt',
			isPopular: false,
		},
	];
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
		logger.error('Error creating report from template:', error);
		return NextResponse.json(
			{ error: 'Failed to create report from template' },
			{ status: 500 }
		);
	}
}

