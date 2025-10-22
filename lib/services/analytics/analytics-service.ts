/**
 * Analytics Service
 * Business logic for analytics and reporting
 */

import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schemas/invoices.schema';
import { expenses } from '@/lib/db/schemas/expenses.schema';
import { clients } from '@/lib/db/schemas/clients.schema';
import { transactions } from '@/lib/db/schemas/transactions.schema';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';

interface RevenueAnalytics {
	totalRevenue: number;
	monthlyRevenue: Array<{
		month: string;
		revenue: number;
		growth: number;
	}>;
	revenueByClient: Array<{
		clientName: string;
		revenue: number;
		invoiceCount: number;
	}>;
	revenueGrowth: {
		monthOverMonth: number;
		yearOverYear: number;
	};
}

interface ExpenseAnalytics {
	totalExpenses: number;
	monthlyExpenses: Array<{
		month: string;
		expenses: number;
		growth: number;
	}>;
	expensesByCategory: Array<{
		category: string;
		amount: number;
		percentage: number;
	}>;
	expenseGrowth: {
		monthOverMonth: number;
		yearOverYear: number;
	};
}

interface ClientAnalytics {
	totalClients: number;
	activeClients: number;
	newClients: Array<{
		month: string;
		count: number;
	}>;
	clientRetention: number;
	topClients: Array<{
		clientName: string;
		revenue: number;
		invoiceCount: number;
		lastInvoice: string;
	}>;
}

interface PerformanceMetrics {
	profitMargin: number;
	cashFlow: number;
	averageInvoiceValue: number;
	paymentSuccessRate: number;
	clientAcquisitionCost: number;
	lifetimeValue: number;
}

/**
 * Get revenue analytics
 */
export async function getRevenueAnalytics(userId: string): Promise<RevenueAnalytics> {
	// Get total revenue
	const [totalRevenueData] = await db
		.select({
			totalRevenue: sql<number>`sum(case when ${invoices.status} = 'paid' then ${invoices.total}::numeric else 0 end)`,
		})
		.from(invoices)
		.where(eq(invoices.userId, userId));

	// Get monthly revenue for last 12 months
	const twelveMonthsAgo = new Date();
	twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

	const monthlyRevenue = await db
		.select({
			month: sql<string>`to_char(${invoices.paidDate}, 'YYYY-MM')`,
			revenue: sql<number>`sum(case when ${invoices.status} = 'paid' then ${invoices.total}::numeric else 0 end)`,
		})
		.from(invoices)
		.where(and(
			eq(invoices.userId, userId),
			gte(invoices.paidDate, twelveMonthsAgo)
		))
		.groupBy(sql`to_char(${invoices.paidDate}, 'YYYY-MM')`)
		.orderBy(sql`to_char(${invoices.paidDate}, 'YYYY-MM')`);

	// Get revenue by client
	const revenueByClient = await db
		.select({
			clientName: invoices.clientName,
			revenue: sql<number>`sum(case when ${invoices.status} = 'paid' then ${invoices.total}::numeric else 0 end)`,
			invoiceCount: sql<number>`count(*)`,
		})
		.from(invoices)
		.where(and(
			eq(invoices.userId, userId),
			eq(invoices.status, 'paid')
		))
		.groupBy(invoices.clientName)
		.orderBy(sql`sum(case when ${invoices.status} = 'paid' then ${invoices.total}::numeric else 0 end) desc`)
		.limit(10);

	// Calculate growth rates
	const currentMonth = monthlyRevenue[monthlyRevenue.length - 1];
	const previousMonth = monthlyRevenue[monthlyRevenue.length - 2];
	const monthOverMonth = previousMonth && currentMonth 
		? ((Number(currentMonth.revenue) - Number(previousMonth.revenue)) / Number(previousMonth.revenue)) * 100 
		: 0;

	return {
		totalRevenue: Number(totalRevenueData?.totalRevenue || 0),
		monthlyRevenue: monthlyRevenue.map((row, index) => ({
			month: row.month,
			revenue: Number(row.revenue),
			growth: index > 0 ? 
				((Number(row.revenue) - Number(monthlyRevenue[index - 1].revenue)) / Number(monthlyRevenue[index - 1].revenue)) * 100 
				: 0,
		})),
		revenueByClient: revenueByClient.map(row => ({
			clientName: row.clientName || 'Unknown',
			revenue: Number(row.revenue),
			invoiceCount: Number(row.invoiceCount),
		})),
		revenueGrowth: {
			monthOverMonth,
			yearOverYear: 0, // Would need year-over-year data
		},
	};
}

/**
 * Get expense analytics
 */
export async function getExpenseAnalytics(userId: string): Promise<ExpenseAnalytics> {
	// Get total expenses
	const [totalExpensesData] = await db
		.select({
			totalExpenses: sql<number>`sum(${expenses.amount}::numeric)`,
		})
		.from(expenses)
		.where(eq(expenses.userId, userId));

	// Get monthly expenses for last 12 months
	const twelveMonthsAgo = new Date();
	twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

	const monthlyExpenses = await db
		.select({
			month: sql<string>`to_char(${expenses.date}, 'YYYY-MM')`,
			expenses: sql<number>`sum(${expenses.amount}::numeric)`,
		})
		.from(expenses)
		.where(and(
			eq(expenses.userId, userId),
			gte(expenses.date, twelveMonthsAgo)
		))
		.groupBy(sql`to_char(${expenses.date}, 'YYYY-MM')`)
		.orderBy(sql`to_char(${expenses.date}, 'YYYY-MM')`);

	// Get expenses by category
	const expensesByCategory = await db
		.select({
			category: expenses.category,
			amount: sql<number>`sum(${expenses.amount}::numeric)`,
		})
		.from(expenses)
		.where(eq(expenses.userId, userId))
		.groupBy(expenses.category)
		.orderBy(sql`sum(${expenses.amount}::numeric) desc`);

	const totalExpenses = Number(totalExpensesData?.totalExpenses || 0);

	// Calculate growth rates
	const currentMonth = monthlyExpenses[monthlyExpenses.length - 1];
	const previousMonth = monthlyExpenses[monthlyExpenses.length - 2];
	const monthOverMonth = previousMonth && currentMonth 
		? ((Number(currentMonth.expenses) - Number(previousMonth.expenses)) / Number(previousMonth.expenses)) * 100 
		: 0;

	return {
		totalExpenses,
		monthlyExpenses: monthlyExpenses.map((row, index) => ({
			month: row.month,
			expenses: Number(row.expenses),
			growth: index > 0 ? 
				((Number(row.expenses) - Number(monthlyExpenses[index - 1].expenses)) / Number(monthlyExpenses[index - 1].expenses)) * 100 
				: 0,
		})),
		expensesByCategory: expensesByCategory.map(row => ({
			category: row.category,
			amount: Number(row.amount),
			percentage: totalExpenses > 0 ? (Number(row.amount) / totalExpenses) * 100 : 0,
		})),
		expenseGrowth: {
			monthOverMonth,
			yearOverYear: 0, // Would need year-over-year data
		},
	};
}

/**
 * Get client analytics
 */
export async function getClientAnalytics(userId: string): Promise<ClientAnalytics> {
	// Get basic client stats
	const [clientStats] = await db
		.select({
			totalClients: sql<number>`count(*)`,
			activeClients: sql<number>`count(case when ${clients.isActive} = true then 1 end)`,
		})
		.from(clients)
		.where(eq(clients.userId, userId));

	// Get new clients by month for last 12 months
	const twelveMonthsAgo = new Date();
	twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

	const newClients = await db
		.select({
			month: sql<string>`to_char(${clients.createdAt}, 'YYYY-MM')`,
			count: sql<number>`count(*)`,
		})
		.from(clients)
		.where(and(
			eq(clients.userId, userId),
			gte(clients.createdAt, twelveMonthsAgo)
		))
		.groupBy(sql`to_char(${clients.createdAt}, 'YYYY-MM')`)
		.orderBy(sql`to_char(${clients.createdAt}, 'YYYY-MM')`);

	// Get top clients by revenue
	const topClients = await db
		.select({
			clientName: invoices.clientName,
			revenue: sql<number>`sum(case when ${invoices.status} = 'paid' then ${invoices.total}::numeric else 0 end)`,
			invoiceCount: sql<number>`count(*)`,
			lastInvoice: sql<string>`max(${invoices.createdAt})`,
		})
		.from(invoices)
		.where(and(
			eq(invoices.userId, userId),
			eq(invoices.status, 'paid')
		))
		.groupBy(invoices.clientName)
		.orderBy(sql`sum(case when ${invoices.status} = 'paid' then ${invoices.total}::numeric else 0 end) desc`)
		.limit(10);

	// Calculate retention rate (simplified)
	const totalClients = Number(clientStats?.totalClients || 0);
	const activeClients = Number(clientStats?.activeClients || 0);
	const retention = totalClients > 0 ? (activeClients / totalClients) * 100 : 0;

	return {
		totalClients,
		activeClients,
		newClients: newClients.map(row => ({
			month: row.month,
			count: Number(row.count),
		})),
		clientRetention: retention,
		topClients: topClients.map(row => ({
			clientName: row.clientName || 'Unknown',
			revenue: Number(row.revenue),
			invoiceCount: Number(row.invoiceCount),
			lastInvoice: row.lastInvoice,
		})),
	};
}

/**
 * Get performance metrics
 */
export async function getPerformanceMetrics(userId: string): Promise<PerformanceMetrics> {
	// Get revenue and expenses for profit margin calculation
	const [revenueData] = await db
		.select({
			revenue: sql<number>`sum(case when ${invoices.status} = 'paid' then ${invoices.total}::numeric else 0 end)`,
		})
		.from(invoices)
		.where(eq(invoices.userId, userId));

	const [expenseData] = await db
		.select({
			expenses: sql<number>`sum(${expenses.amount}::numeric)`,
		})
		.from(expenses)
		.where(eq(expenses.userId, userId));

	const revenue = Number(revenueData?.revenue || 0);
	const expenses = Number(expenseData?.expenses || 0);
	const profitMargin = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0;

	// Get cash flow (simplified)
	const [cashFlowData] = await db
		.select({
			inflow: sql<number>`sum(case when ${transactions.type} = 'income' and ${transactions.status} = 'completed' then ${transactions.amount}::numeric else 0 end)`,
			outflow: sql<number>`sum(case when ${transactions.type} = 'expense' and ${transactions.status} = 'completed' then ${transactions.amount}::numeric else 0 end)`,
		})
		.from(transactions)
		.where(eq(transactions.userId, userId));

	const cashFlow = Number(cashFlowData?.inflow || 0) - Number(cashFlowData?.outflow || 0);

	// Get average invoice value
	const [avgInvoiceData] = await db
		.select({
			averageValue: sql<number>`avg(case when ${invoices.status} = 'paid' then ${invoices.total}::numeric else null end)`,
		})
		.from(invoices)
		.where(eq(invoices.userId, userId));

	// Get payment success rate
	const [paymentData] = await db
		.select({
			totalInvoices: sql<number>`count(*)`,
			paidInvoices: sql<number>`count(case when ${invoices.status} = 'paid' then 1 end)`,
		})
		.from(invoices)
		.where(eq(invoices.userId, userId));

	const totalInvoices = Number(paymentData?.totalInvoices || 0);
	const paidInvoices = Number(paymentData?.paidInvoices || 0);
	const paymentSuccessRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;

	return {
		profitMargin,
		cashFlow,
		averageInvoiceValue: Number(avgInvoiceData?.averageValue || 0),
		paymentSuccessRate,
		clientAcquisitionCost: 0, // Would need marketing spend data
		lifetimeValue: 0, // Would need historical client data
	};
}

// Export all analytics service functions
export const AnalyticsService = {
	getRevenueAnalytics,
	getExpenseAnalytics,
	getClientAnalytics,
	getPerformanceMetrics,
};
