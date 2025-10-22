/**
 * Unified Dashboard Service
 * Aggregates data from all modules for comprehensive business overview
 */

import { db } from '@/lib/db';
import { 
	campaigns, 
	projects, 
	timeEntries, 
	accounts, 
	payments, 
	transactions, 
	clients, 
	invoices, 
	expenses 
} from '@/lib/db/schemas';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';

interface UnifiedMetrics {
	// Financial Overview
	totalRevenue: number;
	totalExpenses: number;
	netIncome: number;
	cashFlow: number;
	
	// Business Metrics
	totalClients: number;
	activeProjects: number;
	activeCampaigns: number;
	
	// Performance Indicators
	averageInvoiceValue: number;
	paymentSuccessRate: number;
	clientRetentionRate: number;
	projectCompletionRate: number;
	campaignROAS: number;
	
	// Growth Metrics
	revenueGrowth: number;
	clientGrowth: number;
	projectGrowth: number;
	
	// Recent Activity
	recentInvoices: Array<{
		id: string;
		clientName: string;
		amount: number;
		status: string;
		createdAt: string;
	}>;
	recentTransactions: Array<{
		id: string;
		description: string;
		amount: number;
		type: string;
		createdAt: string;
	}>;
	recentProjects: Array<{
		id: string;
		name: string;
		status: string;
		progress: number;
		updatedAt: string;
	}>;
	recentCampaigns: Array<{
		id: string;
		name: string;
		platform: string;
		spend: number;
		roas: number;
		status: string;
	}>;
}

interface WidgetData {
	id: string;
	type: 'metric' | 'chart' | 'table' | 'list';
	title: string;
	data: any;
	position: { x: number; y: number; w: number; h: number };
	config?: Record<string, any>;
}

interface DashboardLayout {
	userId: string;
	widgets: WidgetData[];
	layout: string; // JSON string of grid layout
	createdAt: string;
	updatedAt: string;
}

/**
 * Get unified metrics for the dashboard
 */
export async function getUnifiedMetrics(userId: string): Promise<UnifiedMetrics> {
	// Get financial overview
	const [financialData] = await db
		.select({
			totalRevenue: sql<number>`sum(${invoices.totalAmount}::numeric)`,
			totalExpenses: sql<number>`sum(${expenses.amount}::numeric)`,
		})
		.from(invoices)
		.leftJoin(expenses, eq(invoices.userId, expenses.userId))
		.where(eq(invoices.userId, userId));

	// Get business metrics
	const [businessData] = await db
		.select({
			totalClients: sql<number>`count(distinct ${clients.id})`,
			activeProjects: sql<number>`count(case when ${projects.status} = 'active' then 1 end)`,
			activeCampaigns: sql<number>`count(case when ${campaigns.status} = 'active' then 1 end)`,
		})
		.from(clients)
		.leftJoin(projects, eq(clients.userId, projects.userId))
		.leftJoin(campaigns, eq(clients.userId, campaigns.userId))
		.where(eq(clients.userId, userId));

	// Get performance indicators
	const [performanceData] = await db
		.select({
			averageInvoiceValue: sql<number>`avg(${invoices.totalAmount}::numeric)`,
			paymentSuccessRate: sql<number>`count(case when ${payments.status} = 'completed' then 1 end) * 100.0 / count(*)`,
			campaignROAS: sql<number>`avg(${campaigns.roas}::numeric)`,
		})
		.from(invoices)
		.leftJoin(payments, eq(invoices.userId, payments.userId))
		.leftJoin(campaigns, eq(invoices.userId, campaigns.userId))
		.where(eq(invoices.userId, userId));

	// Get recent activity
	const recentInvoices = await db
		.select({
			id: invoices.id,
			clientName: clients.companyName,
			amount: invoices.totalAmount,
			status: invoices.status,
			createdAt: invoices.createdAt,
		})
		.from(invoices)
		.leftJoin(clients, eq(invoices.clientId, clients.id))
		.where(eq(invoices.userId, userId))
		.orderBy(desc(invoices.createdAt))
		.limit(5);

	const recentTransactions = await db
		.select({
			id: transactions.id,
			description: transactions.description,
			amount: transactions.amount,
			type: transactions.type,
			createdAt: transactions.createdAt,
		})
		.from(transactions)
		.where(eq(transactions.userId, userId))
		.orderBy(desc(transactions.createdAt))
		.limit(5);

	const recentProjects = await db
		.select({
			id: projects.id,
			name: projects.name,
			status: projects.status,
			progress: projects.progress,
			updatedAt: projects.updatedAt,
		})
		.from(projects)
		.where(eq(projects.userId, userId))
		.orderBy(desc(projects.updatedAt))
		.limit(5);

	const recentCampaigns = await db
		.select({
			id: campaigns.id,
			name: campaigns.name,
			platform: campaigns.platform,
			spend: campaigns.spend,
			roas: campaigns.roas,
			status: campaigns.status,
		})
		.from(campaigns)
		.where(eq(campaigns.userId, userId))
		.orderBy(desc(campaigns.createdAt))
		.limit(5);

	const totalRevenue = Number(financialData?.totalRevenue || 0);
	const totalExpenses = Number(financialData?.totalExpenses || 0);
	const netIncome = totalRevenue - totalExpenses;

	return {
		totalRevenue,
		totalExpenses,
		netIncome,
		cashFlow: netIncome, // Simplified for now
		totalClients: businessData?.totalClients || 0,
		activeProjects: businessData?.activeProjects || 0,
		activeCampaigns: businessData?.activeCampaigns || 0,
		averageInvoiceValue: Number(performanceData?.averageInvoiceValue || 0),
		paymentSuccessRate: Number(performanceData?.paymentSuccessRate || 0),
		clientRetentionRate: 85, // Placeholder - would need historical data
		projectCompletionRate: 78, // Placeholder - would need historical data
		campaignROAS: Number(performanceData?.campaignROAS || 0),
		revenueGrowth: 12.5, // Placeholder - would need historical comparison
		clientGrowth: 8.3, // Placeholder - would need historical comparison
		projectGrowth: 15.2, // Placeholder - would need historical comparison
		recentInvoices: recentInvoices.map(invoice => ({
			id: invoice.id,
			clientName: invoice.clientName || 'Unknown Client',
			amount: Number(invoice.amount),
			status: invoice.status,
			createdAt: invoice.createdAt.toISOString(),
		})),
		recentTransactions: recentTransactions.map(transaction => ({
			id: transaction.id,
			description: transaction.description || 'No description',
			amount: Number(transaction.amount),
			type: transaction.type,
			createdAt: transaction.createdAt.toISOString(),
		})),
		recentProjects: recentProjects.map(project => ({
			id: project.id,
			name: project.name,
			status: project.status,
			progress: Number(project.progress),
			updatedAt: project.updatedAt.toISOString(),
		})),
		recentCampaigns: recentCampaigns.map(campaign => ({
			id: campaign.id,
			name: campaign.name,
			platform: campaign.platform,
			spend: Number(campaign.spend),
			roas: Number(campaign.roas),
			status: campaign.status,
		})),
	};
}

/**
 * Get customizable widget data
 */
export async function getWidgetData(userId: string, widgetType: string): Promise<any> {
	switch (widgetType) {
		case 'revenue-chart':
			return await getRevenueChartData(userId);
		case 'expense-breakdown':
			return await getExpenseBreakdownData(userId);
		case 'client-acquisition':
			return await getClientAcquisitionData(userId);
		case 'project-status':
			return await getProjectStatusData(userId);
		case 'campaign-performance':
			return await getCampaignPerformanceData(userId);
		case 'cash-flow':
			return await getCashFlowData(userId);
		case 'top-clients':
			return await getTopClientsData(userId);
		case 'recent-activity':
			return await getRecentActivityData(userId);
		default:
			return null;
	}
}

/**
 * Get revenue chart data
 */
async function getRevenueChartData(userId: string) {
	const revenueData = await db
		.select({
			month: sql<string>`to_char(${invoices.createdAt}, 'YYYY-MM')`,
			revenue: sql<number>`sum(${invoices.totalAmount}::numeric)`,
		})
		.from(invoices)
		.where(and(
			eq(invoices.userId, userId),
			gte(invoices.createdAt, new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000))
		))
		.groupBy(sql`to_char(${invoices.createdAt}, 'YYYY-MM')`)
		.orderBy(sql`to_char(${invoices.createdAt}, 'YYYY-MM')`);

	return {
		labels: revenueData.map(item => item.month),
		datasets: [{
			label: 'Revenue',
			data: revenueData.map(item => Number(item.revenue)),
			borderColor: 'rgb(34, 197, 94)',
			backgroundColor: 'rgba(34, 197, 94, 0.1)',
		}]
	};
}

/**
 * Get expense breakdown data
 */
async function getExpenseBreakdownData(userId: string) {
	const expenseData = await db
		.select({
			category: expenses.category,
			amount: sql<number>`sum(${expenses.amount}::numeric)`,
		})
		.from(expenses)
		.where(eq(expenses.userId, userId))
		.groupBy(expenses.category);

	return expenseData.map(item => ({
		category: item.category,
		amount: Number(item.amount),
	}));
}

/**
 * Get client acquisition data
 */
async function getClientAcquisitionData(userId: string) {
	const clientData = await db
		.select({
			month: sql<string>`to_char(${clients.createdAt}, 'YYYY-MM')`,
			count: sql<number>`count(*)`,
		})
		.from(clients)
		.where(and(
			eq(clients.userId, userId),
			gte(clients.createdAt, new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000))
		))
		.groupBy(sql`to_char(${clients.createdAt}, 'YYYY-MM')`)
		.orderBy(sql`to_char(${clients.createdAt}, 'YYYY-MM')`);

	return {
		labels: clientData.map(item => item.month),
		datasets: [{
			label: 'New Clients',
			data: clientData.map(item => item.count),
			borderColor: 'rgb(59, 130, 246)',
			backgroundColor: 'rgba(59, 130, 246, 0.1)',
		}]
	};
}

/**
 * Get project status data
 */
async function getProjectStatusData(userId: string) {
	const projectData = await db
		.select({
			status: projects.status,
			count: sql<number>`count(*)`,
		})
		.from(projects)
		.where(eq(projects.userId, userId))
		.groupBy(projects.status);

	return projectData.map(item => ({
		status: item.status,
		count: item.count,
	}));
}

/**
 * Get campaign performance data
 */
async function getCampaignPerformanceData(userId: string) {
	const campaignData = await db
		.select({
			platform: campaigns.platform,
			spend: sql<number>`sum(${campaigns.spend}::numeric)`,
			revenue: sql<number>`sum(${campaigns.revenue}::numeric)`,
			roas: sql<number>`avg(${campaigns.roas}::numeric)`,
		})
		.from(campaigns)
		.where(eq(campaigns.userId, userId))
		.groupBy(campaigns.platform);

	return campaignData.map(item => ({
		platform: item.platform,
		spend: Number(item.spend),
		revenue: Number(item.revenue),
		roas: Number(item.roas),
	}));
}

/**
 * Get cash flow data
 */
async function getCashFlowData(userId: string) {
	const cashFlowData = await db
		.select({
			month: sql<string>`to_char(${transactions.transactionDate}, 'YYYY-MM')`,
			inflow: sql<number>`sum(case when ${transactions.type} = 'credit' then ${transactions.amount}::numeric else 0 end)`,
			outflow: sql<number>`sum(case when ${transactions.type} = 'debit' then ${transactions.amount}::numeric else 0 end)`,
		})
		.from(transactions)
		.where(and(
			eq(transactions.userId, userId),
			gte(transactions.transactionDate, new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000))
		))
		.groupBy(sql`to_char(${transactions.transactionDate}, 'YYYY-MM')`)
		.orderBy(sql`to_char(${transactions.transactionDate}, 'YYYY-MM')`);

	return {
		labels: cashFlowData.map(item => item.month),
		datasets: [
			{
				label: 'Inflow',
				data: cashFlowData.map(item => Number(item.inflow)),
				borderColor: 'rgb(34, 197, 94)',
				backgroundColor: 'rgba(34, 197, 94, 0.1)',
			},
			{
				label: 'Outflow',
				data: cashFlowData.map(item => Number(item.outflow)),
				borderColor: 'rgb(239, 68, 68)',
				backgroundColor: 'rgba(239, 68, 68, 0.1)',
			}
		]
	};
}

/**
 * Get top clients data
 */
async function getTopClientsData(userId: string) {
	const topClients = await db
		.select({
			clientId: clients.id,
			clientName: clients.companyName,
			totalRevenue: sql<number>`sum(${invoices.totalAmount}::numeric)`,
			invoiceCount: sql<number>`count(${invoices.id})`,
		})
		.from(clients)
		.leftJoin(invoices, eq(clients.id, invoices.clientId))
		.where(eq(clients.userId, userId))
		.groupBy(clients.id, clients.companyName)
		.orderBy(desc(sql`sum(${invoices.totalAmount}::numeric)`))
		.limit(5);

	return topClients.map(client => ({
		name: client.clientName,
		revenue: Number(client.totalRevenue || 0),
		invoices: client.invoiceCount,
	}));
}

/**
 * Get recent activity data
 */
async function getRecentActivityData(userId: string) {
	// This would combine recent activities from all modules
	// For now, return a simplified version
	return {
		activities: [
			{
				type: 'invoice',
				description: 'New invoice created',
				timestamp: new Date().toISOString(),
			},
			{
				type: 'client',
				description: 'New client added',
				timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
			},
			{
				type: 'project',
				description: 'Project status updated',
				timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
			},
		]
	};
}

// Export all unified dashboard service functions
export const UnifiedDashboardService = {
	getUnifiedMetrics,
	getWidgetData,
};
