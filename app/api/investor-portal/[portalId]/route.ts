import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import {
	investorPortals,
	investorAccessLogs,
	customReports,
	analytics,
	invoices,
	expenses,
	clients,
} from '@/lib/db/schemas';
import { eq, and, sql } from 'drizzle-orm';

// GET /api/investor-portal/[portalId] - Public access to investor portal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ portalId: string }> }
) {
	try {
		const { portalId } = params;
		const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');

		if (!accessToken) {
			return NextResponse.json({ error: 'Access token required' }, { status: 401 });
		}

		// Verify portal access
		const portal = await db
			.select()
			.from(investorPortals)
			.where(and(
				eq(investorPortals.id, portalId),
				eq(investorPortals.accessToken, accessToken),
				eq(investorPortals.isActive, true)
			))
			.limit(1);

		if (portal.length === 0) {
			return NextResponse.json({ error: 'Invalid or expired access token' }, { status: 401 });
		}

		const portalData = portal[0];

		// Check if token is expired
		if (portalData.expiresAt && new Date() > portalData.expiresAt) {
			return NextResponse.json({ error: 'Access token expired' }, { status: 401 });
		}

		// Log access
		await db.insert(investorAccessLogs).values({
			portalId: portalData.id,
			accessToken: accessToken,
			ipAddress: request.ip || 'unknown',
			userAgent: request.headers.get('user-agent') || 'unknown',
			accessedAt: new Date(),
		});

		// Fetch company data
		const companyData = {
			name: 'Sample Company', // This would come from user profile or company settings
			logo: portalData.logo,
			description: 'A growing fintech company providing innovative financial solutions.',
			industry: 'Financial Technology',
			founded: '2020',
		};

		// Fetch metrics based on allowed metrics
		const allowedMetrics = portalData.allowedMetrics || [];
		const metrics: unknown = {};

		if (allowedMetrics.includes('revenue') || allowedMetrics.length === 0) {
			const [revenueData] = await db
				.select({
					total: sql<number>`sum(case when ${invoices.status} = 'paid' then ${invoices.total}::numeric else 0 end)`,
				})
				.from(invoices)
				.where(eq(invoices.userId, portalData.userId));

			const [currentMonth] = await db
				.select({
					revenue: sql<number>`sum(case when ${invoices.status} = 'paid' then ${invoices.total}::numeric else 0 end)`,
				})
				.from(invoices)
				.where(and(
					eq(invoices.userId, portalData.userId),
					sql`extract(month from ${invoices.paidDate}) = extract(month from current_date)`,
					sql`extract(year from ${invoices.paidDate}) = extract(year from current_date)`
				));

			const [previousMonth] = await db
				.select({
					revenue: sql<number>`sum(case when ${invoices.status} = 'paid' then ${invoices.total}::numeric else 0 end)`,
				})
				.from(invoices)
				.where(and(
					eq(invoices.userId, portalData.userId),
					sql`extract(month from ${invoices.paidDate}) = extract(month from current_date - interval '1 month')`,
					sql`extract(year from ${invoices.paidDate}) = extract(year from current_date - interval '1 month')`
				));

			const current = Number(currentMonth?.revenue || 0);
			const previous = Number(previousMonth?.revenue || 0);
			const growth = previous > 0 ? ((current - previous) / previous) * 100 : 0;

			metrics.totalRevenue = Number(revenueData?.total || 0);
			metrics.revenueGrowth = growth;
		}

		if (allowedMetrics.includes('profit') || allowedMetrics.length === 0) {
			const [revenueData] = await db
				.select({
					revenue: sql<number>`sum(case when ${invoices.status} = 'paid' then ${invoices.total}::numeric else 0 end)`,
				})
				.from(invoices)
				.where(eq(invoices.userId, portalData.userId));

			const [expenseData] = await db
				.select({
					expenses: sql<number>`sum(${expenses.amount}::numeric)`,
				})
				.from(expenses)
				.where(eq(expenses.userId, portalData.userId));

			const revenue = Number(revenueData?.revenue || 0);
			const expenses = Number(expenseData?.expenses || 0);
			metrics.profitMargin = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0;
		}

		if (allowedMetrics.includes('customers') || allowedMetrics.length === 0) {
			const [clientData] = await db
				.select({
					count: sql<number>`count(*)`,
				})
				.from(clients)
				.where(eq(clients.userId, portalData.userId));

			metrics.customerCount = Number(clientData?.count || 0);
		}

		// Set default metrics if none specified
		if (allowedMetrics.length === 0) {
			metrics.valuation = 10000000; // Placeholder
		}

		// Fetch charts data
		const charts = [];
		if (portalData.allowedReports && portalData.allowedReports.length > 0) {
			for (const reportId of portalData.allowedReports) {
				const report = await db
					.select()
					.from(customReports)
					.where(eq(customReports.id, reportId))
					.limit(1);

				if (report.length > 0) {
					// Generate sample chart data based on report type
					charts.push({
						id: report[0].id,
						title: report[0].name,
						type: 'line',
						data: [
							{ month: 'Jan', value: 4000 },
							{ month: 'Feb', value: 3000 },
							{ month: 'Mar', value: 5000 },
							{ month: 'Apr', value: 4500 },
							{ month: 'May', value: 6000 },
							{ month: 'Jun', value: 5500 },
						],
						config: {
							xAxisKey: 'month',
							yAxisKeys: ['value'],
							showLegend: true,
						},
					});
				}
			}
		}

		// Documents (placeholder)
		const documents = [
			{
				id: '1',
				name: 'Q4 2024 Financial Report.pdf',
				type: 'pdf',
				size: '2.4 MB',
				uploadedAt: '2024-01-15',
			},
			{
				id: '2',
				name: 'Investor Presentation.pptx',
				type: 'presentation',
				size: '5.1 MB',
				uploadedAt: '2024-01-10',
			},
		];

		const portalResponse = {
			company: companyData,
			metrics,
			charts,
			documents,
			lastUpdated: new Date().toISOString().split('T')[0],
		};

		return NextResponse.json(portalResponse);
	} catch (error) {
		 
    // eslint-disable-next-line no-console
    console.error('Error fetching investor portal:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
