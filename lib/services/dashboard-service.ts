/**
 * Dashboard Service
 * Business logic for dashboard metrics and analytics
 */

import { db } from '@/lib/db';
import { clients } from '@/lib/db/schemas/clients.schema';
import { invoices } from '@/lib/db/schemas/invoices.schema';
import { expenses } from '@/lib/db/schemas/expenses.schema';
import { eq, desc, sql, and, gte, lte } from 'drizzle-orm';
import { getChartColor, getSemanticColor } from '@/lib/utils/theme-colors';

interface DashboardOverview {
	revenue: {
		total: number;
		thisMonth: number;
		lastMonth: number;
		growth: number;
	};
	clients: {
		total: number;
		active: number;
		newThisMonth: number;
	};
	invoices: {
		total: number;
		pending: number;
		overdue: number;
		totalAmount: number;
	};
	expenses: {
		total: number;
		thisMonth: number;
		lastMonth: number;
		growth: number;
	};
	netIncome: {
		thisMonth: number;
		lastMonth: number;
		growth: number;
	};
}

interface RecentActivity {
	id: string;
	type: 'invoice' | 'expense' | 'payment' | 'client';
	description: string;
	amount?: number;
	status?: string;
	createdAt: string;
}

interface AIInsight {
	type: 'success' | 'warning' | 'info';
	title: string;
	description: string;
	action?: string;
}

interface ChartDataset {
	label: string;
	data: number[];
	borderColor: string;
	backgroundColor: string;
	fill?: boolean;
}

interface ChartData {
	labels: string[];
	datasets: ChartDataset[];
}

interface ChartDataParams {
	type: 'sales' | 'revenue' | 'expenses';
	dateRange: {
		start: Date;
		end: Date;
	};
	timeRange: 'day' | 'week' | 'month';
}

/**
 * Get dashboard overview metrics
 */
export async function getDashboardOverview(userId: string): Promise<DashboardOverview> {
	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
	const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

	// Get revenue data
	const [revenueData] = await db
		.select({
			total: sql<number>`sum(case when ${invoices.status} = 'paid' then ${invoices.total}::numeric else 0 end)`,
			thisMonth: sql<number>`sum(case when ${invoices.status} = 'paid' and ${invoices.createdAt} >= ${startOfMonth} then ${invoices.total}::numeric else 0 end)`,
			lastMonth: sql<number>`sum(case when ${invoices.status} = 'paid' and ${invoices.createdAt} >= ${startOfLastMonth} and ${invoices.createdAt} <= ${endOfLastMonth} then ${invoices.total}::numeric else 0 end)`,
		})
		.from(invoices)
		.where(eq(invoices.userId, userId));

	// Get client data
	const [clientData] = await db
		.select({
			total: sql<number>`count(*)`,
			active: sql<number>`count(case when ${clients.status} = 'active' then 1 end)`,
			newThisMonth: sql<number>`count(case when ${clients.createdAt} >= ${startOfMonth} then 1 end)`,
		})
		.from(clients)
		.where(eq(clients.userId, userId));

	// Get invoice data (current month)
	const [invoiceData] = await db
		.select({
			total: sql<number>`count(*)`,
			pending: sql<number>`count(case when ${invoices.status} in ('draft', 'sent') then 1 end)`,
			overdue: sql<number>`count(case when ${invoices.status} = 'sent' then 1 end)`,
			totalAmount: sql<number>`sum(case when ${invoices.status} in ('draft', 'sent') then ${invoices.total}::numeric else 0 end)`,
			thisMonth: sql<number>`count(case when ${invoices.createdAt} >= ${startOfMonth} then 1 end)`,
			lastMonth: sql<number>`count(case when ${invoices.createdAt} >= ${startOfLastMonth} and ${invoices.createdAt} <= ${endOfLastMonth} then 1 end)`,
		})
		.from(invoices)
		.where(eq(invoices.userId, userId));

	// Get expense data
	const [expenseData] = await db
		.select({
			total: sql<number>`sum(${expenses.amount}::numeric)`,
			thisMonth: sql<number>`sum(case when ${expenses.createdAt} >= ${startOfMonth} then ${expenses.amount}::numeric else 0 end)`,
			lastMonth: sql<number>`sum(case when ${expenses.createdAt} >= ${startOfLastMonth} and ${expenses.createdAt} <= ${endOfLastMonth} then ${expenses.amount}::numeric else 0 end)`,
		})
		.from(expenses)
		.where(eq(expenses.userId, userId));

	const totalRevenue = Number(revenueData?.total || 0);
	const thisMonthRevenue = Number(revenueData?.thisMonth || 0);
	const lastMonthRevenue = Number(revenueData?.lastMonth || 0);
	const revenueGrowth = lastMonthRevenue > 0 
		? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
		: 0;

	const totalExpenses = Number(expenseData?.total || 0);
	const thisMonthExpenses = Number(expenseData?.thisMonth || 0);
	const lastMonthExpenses = Number(expenseData?.lastMonth || 0);
	const expenseGrowth = lastMonthExpenses > 0 
		? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
		: 0;

	const thisMonthNetIncome = thisMonthRevenue - thisMonthExpenses;
	const lastMonthNetIncome = lastMonthRevenue - lastMonthExpenses;
	const netIncomeGrowth = lastMonthNetIncome > 0 
		? ((thisMonthNetIncome - lastMonthNetIncome) / lastMonthNetIncome) * 100 
		: 0;

	return {
		revenue: {
			total: totalRevenue,
			thisMonth: thisMonthRevenue,
			lastMonth: lastMonthRevenue,
			growth: revenueGrowth,
		},
		clients: {
			total: Number(clientData?.total || 0),
			active: Number(clientData?.active || 0),
			newThisMonth: Number(clientData?.newThisMonth || 0),
		},
		invoices: {
			total: Number(invoiceData?.total || 0),
			pending: Number(invoiceData?.pending || 0),
			overdue: Number(invoiceData?.overdue || 0),
			totalAmount: Number(invoiceData?.totalAmount || 0),
			thisMonth: Number(invoiceData?.thisMonth || 0),
			lastMonth: Number(invoiceData?.lastMonth || 0),
		},
		expenses: {
			total: totalExpenses,
			thisMonth: thisMonthExpenses,
			lastMonth: lastMonthExpenses,
			growth: expenseGrowth,
		},
		netIncome: {
			thisMonth: thisMonthNetIncome,
			lastMonth: lastMonthNetIncome,
			growth: netIncomeGrowth,
		},
	};
}

/**
 * Get recent activity
 */
export async function getRecentActivity(userId: string, limit: number = 10): Promise<RecentActivity[]> {
	const activities: RecentActivity[] = [];

	// Get recent invoices
	const recentInvoices = await db.query.invoices.findMany({
		where: eq(invoices.userId, userId),
		orderBy: [desc(invoices.createdAt)],
		limit: Math.ceil(limit / 2),
	});

	// Get recent expenses
	const recentExpenses = await db.query.expenses.findMany({
		where: eq(expenses.userId, userId),
		orderBy: [desc(expenses.createdAt)],
		limit: Math.ceil(limit / 2),
	});

	// Convert to activity format
	recentInvoices.forEach(invoice => {
		activities.push({
			id: invoice.id,
			type: 'invoice',
			description: `Invoice ${invoice.invoiceNumber} created`,
			amount: Number(invoice.total),
			status: invoice.status,
			createdAt: invoice.createdAt.toISOString(),
		});
	});

	recentExpenses.forEach(expense => {
		activities.push({
			id: expense.id,
			type: 'expense',
			description: `Expense: ${expense.description}`,
			amount: Number(expense.amount),
			status: 'completed', // expenses don't have status field
			createdAt: expense.createdAt.toISOString(),
		});
	});

	// Sort by date and limit
	return activities
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
		.slice(0, limit);
}

/**
 * Get AI insights for dashboard
 */
export async function getAIInsights(userId: string): Promise<AIInsight[]> {
	const insights: AIInsight[] = [];
	
	// Get overview data for insights
	const overview = await getDashboardOverview(userId);

	// Revenue growth insight
	if (overview.revenue.growth > 10) {
		insights.push({
			type: 'success',
			title: 'Revenue Growth',
			description: `Your revenue has grown by ${overview.revenue.growth.toFixed(1)}% this month. Great job!`,
		});
	} else if (overview.revenue.growth < -10) {
		insights.push({
			type: 'warning',
			title: 'Revenue Decline',
			description: `Your revenue has decreased by ${Math.abs(overview.revenue.growth).toFixed(1)}% this month. Consider reviewing your pricing or marketing strategy.`,
		});
	}

	// Expense growth insight
	if (overview.expenses.growth > 20) {
		insights.push({
			type: 'warning',
			title: 'Expense Increase',
			description: `Your expenses have increased by ${overview.expenses.growth.toFixed(1)}% this month. Review your spending patterns.`,
		});
	}

	// Net income insight
	if (overview.netIncome.thisMonth > 0) {
		insights.push({
			type: 'success',
			title: 'Positive Cash Flow',
			description: `You have a positive cash flow of $${overview.netIncome.thisMonth.toLocaleString()} this month.`,
		});
	} else {
		insights.push({
			type: 'warning',
			title: 'Negative Cash Flow',
			description: `You have a negative cash flow of $${Math.abs(overview.netIncome.thisMonth).toLocaleString()} this month. Consider reducing expenses or increasing revenue.`,
		});
	}

	// Overdue invoices insight
	if (overview.invoices.overdue > 0) {
		insights.push({
			type: 'warning',
			title: 'Overdue Invoices',
			description: `You have ${overview.invoices.overdue} overdue invoices. Follow up with clients to ensure timely payments.`,
			action: 'View Overdue Invoices',
		});
	}

	// Client acquisition insight
	if (overview.clients.newThisMonth > 0) {
		insights.push({
			type: 'info',
			title: 'New Clients',
			description: `You've added ${overview.clients.newThisMonth} new clients this month. Keep up the great work!`,
		});
	}

	return insights;
}

/**
 * Get chart data for dashboard charts
 */
export async function getChartData(userId: string, params: ChartDataParams): Promise<ChartData> {
	const { type, dateRange, timeRange } = params;
	const { start, end } = dateRange;

	// Generate date labels based on time range
	const labels: string[] = [];
	const dataPoints: number[] = [];
	
	// Create date intervals
	const intervals: Date[] = [];
	const current = new Date(start);
	
	while (current <= end) {
		intervals.push(new Date(current));
		
		switch (timeRange) {
			case 'day':
				current.setDate(current.getDate() + 1);
				break;
			case 'week':
				current.setDate(current.getDate() + 7);
				break;
			case 'month':
				current.setMonth(current.getMonth() + 1);
				break;
		}
	}

	// Generate labels
	for (let i = 0; i < intervals.length - 1; i++) {
		const intervalStart = intervals[i];
		
		switch (timeRange) {
			case 'day':
				labels.push(intervalStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
				break;
			case 'week':
				labels.push(`Week of ${intervalStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);
				break;
			case 'month':
				labels.push(intervalStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
				break;
		}
	}

	// Query data based on type
	if (type === 'sales' || type === 'revenue') {
		// Get invoice data grouped by time intervals
		for (let i = 0; i < intervals.length - 1; i++) {
			const intervalStart = intervals[i];
			const intervalEnd = intervals[i + 1];
			
			const [result] = await db
				.select({
					total: sql<number>`sum(case when ${invoices.status} = 'paid' then ${invoices.total}::numeric else 0 end)`,
					count: sql<number>`count(case when ${invoices.status} = 'paid' then 1 end)`,
				})
				.from(invoices)
				.where(
					and(
						eq(invoices.userId, userId),
						gte(invoices.paidDate, intervalStart),
						lte(invoices.paidDate, intervalEnd)
					)
				);

			if (type === 'sales') {
				dataPoints.push(Number(result?.count || 0));
			} else {
				dataPoints.push(Number(result?.total || 0));
			}
		}
	} else if (type === 'expenses') {
		// Get expense data grouped by time intervals
		for (let i = 0; i < intervals.length - 1; i++) {
			const intervalStart = intervals[i];
			const intervalEnd = intervals[i + 1];
			
			const [result] = await db
				.select({
					total: sql<number>`sum(${expenses.amount}::numeric)`,
				})
				.from(expenses)
				.where(
					and(
						eq(expenses.userId, userId),
						gte(expenses.expenseDate, intervalStart),
						lte(expenses.expenseDate, intervalEnd)
					)
				);

			dataPoints.push(Number(result?.total || 0));
		}
	}

	// Map chart types to theme colors
	const getColorForType = (chartType: string) => {
		if (chartType === 'sales') return getChartColor(1); // chart-1 (primary blue) for sales
		if (chartType === 'revenue') return getChartColor(2); // chart-2 (green) for revenue
		return getSemanticColor('destructive'); // destructive (red) for expenses
	};
	
	// Create chart dataset
	const dataset: ChartDataset = {
		label: type === 'sales' ? 'Sales Count' : type === 'revenue' ? 'Revenue' : 'Expenses',
		data: dataPoints,
		borderColor: getColorForType(type),
		backgroundColor: type === 'sales' 
			? getChartColor(1, 0.1) 
			: type === 'revenue' 
				? getChartColor(2, 0.1) 
				: getSemanticColor('destructive', 0.1),
		fill: true,
	};

	return {
		labels,
		datasets: [dataset],
	};
}

// Export all dashboard service functions
export const DashboardService = {
	getOverview: getDashboardOverview,
	getRecentActivity: getRecentActivity,
	getAIInsights: getAIInsights,
	getChartData: getChartData,
};
