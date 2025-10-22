/**
 * Dashboard Service
 * Business logic for dashboard metrics and analytics
 */

import { db } from '@/lib/db';
import { clients } from '@/lib/db/schemas/clients.schema';
import { invoices } from '@/lib/db/schemas/invoices.schema';
import { expenses } from '@/lib/db/schemas/expenses.schema';
import { payments } from '@/lib/db/schemas/payments.schema';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';

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
			thisMonth: sql<number>`sum(case when ${invoices.status} = 'paid' and ${invoices.paidDate} >= ${startOfMonth} then ${invoices.total}::numeric else 0 end)`,
			lastMonth: sql<number>`sum(case when ${invoices.status} = 'paid' and ${invoices.paidDate} >= ${startOfLastMonth} and ${invoices.paidDate} <= ${endOfLastMonth} then ${invoices.total}::numeric else 0 end)`,
		})
		.from(invoices)
		.where(eq(invoices.userId, userId));

	// Get client data
	const [clientData] = await db
		.select({
			total: sql<number>`count(*)`,
			active: sql<number>`count(case when ${clients.isActive} = true then 1 end)`,
			newThisMonth: sql<number>`count(case when ${clients.createdAt} >= ${startOfMonth} then 1 end)`,
		})
		.from(clients)
		.where(eq(clients.userId, userId));

	// Get invoice data
	const [invoiceData] = await db
		.select({
			total: sql<number>`count(*)`,
			pending: sql<number>`count(case when ${invoices.status} in ('draft', 'sent', 'viewed') then 1 end)`,
			overdue: sql<number>`count(case when ${invoices.status} in ('sent', 'viewed') and ${invoices.dueDate} < ${now} then 1 end)`,
			totalAmount: sql<number>`sum(case when ${invoices.status} in ('draft', 'sent', 'viewed', 'partial') then ${invoices.total}::numeric else 0 end)`,
		})
		.from(invoices)
		.where(eq(invoices.userId, userId));

	// Get expense data
	const [expenseData] = await db
		.select({
			total: sql<number>`sum(${expenses.amount}::numeric)`,
			thisMonth: sql<number>`sum(case when ${expenses.date} >= ${startOfMonth} then ${expenses.amount}::numeric else 0 end)`,
			lastMonth: sql<number>`sum(case when ${expenses.date} >= ${startOfLastMonth} and ${expenses.date} <= ${endOfLastMonth} then ${expenses.amount}::numeric else 0 end)`,
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
			description: `Invoice ${invoice.invoiceNumber} created for ${invoice.clientName}`,
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
			status: expense.status,
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

// Export all dashboard service functions
export const DashboardService = {
	getOverview: getDashboardOverview,
	getRecentActivity: getRecentActivity,
	getAIInsights: getAIInsights,
};
