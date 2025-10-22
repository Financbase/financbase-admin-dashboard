/**
 * Financial Intelligence Service
 * AI-powered financial analysis, predictions, and recommendations
 */

import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schemas/invoices.schema';
import { expenses } from '@/lib/db/schemas/expenses.schema';
import { clients } from '@/lib/db/schemas/clients.schema';
import { transactions } from '@/lib/db/schemas/transactions.schema';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';

interface FinancialInsight {
	id: string;
	type: 'success' | 'warning' | 'info' | 'critical';
	title: string;
	description: string;
	impact: 'high' | 'medium' | 'low';
	category: 'revenue' | 'expenses' | 'cashflow' | 'profitability' | 'growth';
	action?: string;
	confidence: number; // 0-100
	createdAt: string;
}

interface FinancialPrediction {
	id: string;
	type: 'revenue' | 'expenses' | 'cashflow' | 'profitability';
	period: 'monthly' | 'quarterly' | 'yearly';
	value: number;
	confidence: number;
	trend: 'increasing' | 'decreasing' | 'stable';
	reasoning: string;
	createdAt: string;
}

interface FinancialRecommendation {
	id: string;
	priority: 'high' | 'medium' | 'low';
	category: 'cost_optimization' | 'revenue_growth' | 'cash_flow' | 'risk_management';
	title: string;
	description: string;
	expectedImpact: string;
	implementation: string;
	timeframe: string;
	createdAt: string;
}

interface FinancialHealthScore {
	overall: number;
	revenue: number;
	expenses: number;
	cashflow: number;
	profitability: number;
	growth: number;
	recommendations: string[];
}

/**
 * Analyze financial health and generate insights
 */
export async function analyzeFinancialHealth(userId: string): Promise<FinancialHealthScore> {
	// Get financial data for analysis
	const [revenueData] = await db
		.select({
			totalRevenue: sql<number>`sum(case when ${invoices.status} = 'paid' then ${invoices.total}::numeric else 0 end)`,
			monthlyRevenue: sql<number>`sum(case when ${invoices.status} = 'paid' and ${invoices.paidDate} >= ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)} then ${invoices.total}::numeric else 0 end)`,
		})
		.from(invoices)
		.where(eq(invoices.userId, userId));

	const [expenseData] = await db
		.select({
			totalExpenses: sql<number>`sum(${expenses.amount}::numeric)`,
			monthlyExpenses: sql<number>`sum(case when ${expenses.date} >= ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)} then ${expenses.amount}::numeric else 0 end)`,
		})
		.from(expenses)
		.where(eq(expenses.userId, userId));

	const [transactionData] = await db
		.select({
			inflow: sql<number>`sum(case when ${transactions.type} = 'income' and ${transactions.status} = 'completed' then ${transactions.amount}::numeric else 0 end)`,
			outflow: sql<number>`sum(case when ${transactions.type} = 'expense' and ${transactions.status} = 'completed' then ${transactions.amount}::numeric else 0 end)`,
		})
		.from(transactions)
		.where(eq(transactions.userId, userId));

	const totalRevenue = Number(revenueData?.totalRevenue || 0);
	const monthlyRevenue = Number(revenueData?.monthlyRevenue || 0);
	const totalExpenses = Number(expenseData?.totalExpenses || 0);
	const monthlyExpenses = Number(expenseData?.monthlyExpenses || 0);
	const inflow = Number(transactionData?.inflow || 0);
	const outflow = Number(transactionData?.outflow || 0);

	// Calculate scores (0-100)
	const revenueScore = Math.min(100, (monthlyRevenue / 10000) * 100); // Target: $10k/month
	const expenseScore = Math.max(0, 100 - (monthlyExpenses / 5000) * 100); // Target: <$5k/month
	const cashflowScore = inflow > outflow ? Math.min(100, ((inflow - outflow) / inflow) * 100) : 0;
	const profitabilityScore = totalRevenue > 0 ? Math.min(100, ((totalRevenue - totalExpenses) / totalRevenue) * 100) : 0;
	
	// Growth score based on recent performance
	const growthScore = monthlyRevenue > 0 ? Math.min(100, (monthlyRevenue / 1000) * 10) : 0;
	
	const overall = Math.round((revenueScore + expenseScore + cashflowScore + profitabilityScore + growthScore) / 5);

	// Generate recommendations based on scores
	const recommendations: string[] = [];
	
	if (revenueScore < 50) {
		recommendations.push("Focus on increasing revenue through new client acquisition and upselling");
	}
	if (expenseScore < 50) {
		recommendations.push("Review and optimize expense categories to improve profitability");
	}
	if (cashflowScore < 50) {
		recommendations.push("Improve cash flow by reducing payment terms and following up on overdue invoices");
	}
	if (profitabilityScore < 50) {
		recommendations.push("Increase profit margins by optimizing pricing and reducing costs");
	}
	if (growthScore < 50) {
		recommendations.push("Implement growth strategies to increase monthly revenue");
	}

	return {
		overall,
		revenue: Math.round(revenueScore),
		expenses: Math.round(expenseScore),
		cashflow: Math.round(cashflowScore),
		profitability: Math.round(profitabilityScore),
		growth: Math.round(growthScore),
		recommendations,
	};
}

/**
 * Generate financial insights based on data analysis
 */
export async function generateFinancialInsights(userId: string): Promise<FinancialInsight[]> {
	const insights: FinancialInsight[] = [];
	
	// Get recent financial data
	const [recentRevenue] = await db
		.select({
			revenue: sql<number>`sum(case when ${invoices.status} = 'paid' and ${invoices.paidDate} >= ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)} then ${invoices.total}::numeric else 0 end)`,
		})
		.from(invoices)
		.where(eq(invoices.userId, userId));

	const [recentExpenses] = await db
		.select({
			expenses: sql<number>`sum(case when ${expenses.date} >= ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)} then ${expenses.amount}::numeric else 0 end)`,
		})
		.from(expenses)
		.where(eq(expenses.userId, userId));

	const [overdueInvoices] = await db
		.select({
			count: sql<number>`count(*)`,
			amount: sql<number>`sum(${invoices.total}::numeric)`,
		})
		.from(invoices)
		.where(and(
			eq(invoices.userId, userId),
			eq(invoices.status, 'sent'),
			lte(invoices.dueDate, new Date())
		));

	const revenue = Number(recentRevenue?.revenue || 0);
	const expenses = Number(recentExpenses?.expenses || 0);
	const overdueCount = Number(overdueInvoices?.count || 0);
	const overdueAmount = Number(overdueInvoices?.amount || 0);

	// Revenue insights
	if (revenue > 0) {
		insights.push({
			id: `revenue-${Date.now()}`,
			type: 'success',
			title: 'Strong Revenue Performance',
			description: `You've generated $${revenue.toLocaleString()} in revenue this month.`,
			impact: 'high',
			category: 'revenue',
			confidence: 95,
			createdAt: new Date().toISOString(),
		});
	}

	// Expense insights
	if (expenses > revenue * 0.8) {
		insights.push({
			id: `expense-${Date.now()}`,
			type: 'warning',
			title: 'High Expense Ratio',
			description: `Your expenses ($${expenses.toLocaleString()}) are ${Math.round((expenses / revenue) * 100)}% of your revenue. Consider cost optimization.`,
			impact: 'medium',
			category: 'expenses',
			confidence: 90,
			createdAt: new Date().toISOString(),
		});
	}

	// Overdue invoices insights
	if (overdueCount > 0) {
		insights.push({
			id: `overdue-${Date.now()}`,
			type: 'critical',
			title: 'Overdue Invoices Detected',
			description: `You have ${overdueCount} overdue invoices totaling $${overdueAmount.toLocaleString()}. Follow up immediately.`,
			impact: 'high',
			category: 'cashflow',
			action: 'View Overdue Invoices',
			confidence: 100,
			createdAt: new Date().toISOString(),
		});
	}

	// Profitability insights
	const profit = revenue - expenses;
	if (profit > 0) {
		const margin = (profit / revenue) * 100;
		insights.push({
			id: `profit-${Date.now()}`,
			type: margin > 20 ? 'success' : 'info',
			title: `Profit Margin: ${margin.toFixed(1)}%`,
			description: `Your profit margin is ${margin.toFixed(1)}%. ${margin > 20 ? 'Excellent!' : 'Consider optimizing for better margins.'}`,
			impact: 'medium',
			category: 'profitability',
			confidence: 85,
			createdAt: new Date().toISOString(),
		});
	}

	return insights;
}

/**
 * Generate financial predictions based on historical data
 */
export async function generateFinancialPredictions(userId: string): Promise<FinancialPrediction[]> {
	const predictions: FinancialPrediction[] = [];
	
	// Get historical revenue data for trend analysis
	const revenueHistory = await db
		.select({
			month: sql<string>`to_char(${invoices.paidDate}, 'YYYY-MM')`,
			revenue: sql<number>`sum(case when ${invoices.status} = 'paid' then ${invoices.total}::numeric else 0 end)`,
		})
		.from(invoices)
		.where(and(
			eq(invoices.userId, userId),
			gte(invoices.paidDate, new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000))
		))
		.groupBy(sql`to_char(${invoices.paidDate}, 'YYYY-MM')`)
		.orderBy(sql`to_char(${invoices.paidDate}, 'YYYY-MM')`);

	// Get historical expense data
	const expenseHistory = await db
		.select({
			month: sql<string>`to_char(${expenses.date}, 'YYYY-MM')`,
			expenses: sql<number>`sum(${expenses.amount}::numeric)`,
		})
		.from(expenses)
		.where(and(
			eq(expenses.userId, userId),
			gte(expenses.date, new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000))
		))
		.groupBy(sql`to_char(${expenses.date}, 'YYYY-MM')`)
		.orderBy(sql`to_char(${expenses.date}, 'YYYY-MM')`);

	// Calculate revenue trend
	if (revenueHistory.length >= 2) {
		const recentRevenue = Number(revenueHistory[revenueHistory.length - 1]?.revenue || 0);
		const previousRevenue = Number(revenueHistory[revenueHistory.length - 2]?.revenue || 0);
		const growthRate = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
		
		const predictedRevenue = recentRevenue * (1 + growthRate / 100);
		
		predictions.push({
			id: `revenue-pred-${Date.now()}`,
			type: 'revenue',
			period: 'monthly',
			value: predictedRevenue,
			confidence: Math.min(95, Math.max(60, 100 - Math.abs(growthRate))),
			trend: growthRate > 5 ? 'increasing' : growthRate < -5 ? 'decreasing' : 'stable',
			reasoning: `Based on ${growthRate.toFixed(1)}% growth rate from previous month`,
			createdAt: new Date().toISOString(),
		});
	}

	// Calculate expense trend
	if (expenseHistory.length >= 2) {
		const recentExpenses = Number(expenseHistory[expenseHistory.length - 1]?.expenses || 0);
		const previousExpenses = Number(expenseHistory[expenseHistory.length - 2]?.expenses || 0);
		const growthRate = previousExpenses > 0 ? ((recentExpenses - previousExpenses) / previousExpenses) * 100 : 0;
		
		const predictedExpenses = recentExpenses * (1 + growthRate / 100);
		
		predictions.push({
			id: `expense-pred-${Date.now()}`,
			type: 'expenses',
			period: 'monthly',
			value: predictedExpenses,
			confidence: Math.min(95, Math.max(60, 100 - Math.abs(growthRate))),
			trend: growthRate > 5 ? 'increasing' : growthRate < -5 ? 'decreasing' : 'stable',
			reasoning: `Based on ${growthRate.toFixed(1)}% change rate from previous month`,
			createdAt: new Date().toISOString(),
		});
	}

	return predictions;
}

/**
 * Generate actionable financial recommendations
 */
export async function generateFinancialRecommendations(userId: string): Promise<FinancialRecommendation[]> {
	const recommendations: FinancialRecommendation[] = [];
	
	// Analyze current financial state
	const healthScore = await analyzeFinancialHealth(userId);
	
	// Revenue growth recommendations
	if (healthScore.revenue < 70) {
		recommendations.push({
			id: `revenue-rec-${Date.now()}`,
			priority: 'high',
			category: 'revenue_growth',
			title: 'Increase Revenue Through Client Acquisition',
			description: 'Your revenue score is below optimal. Focus on acquiring new clients and upselling existing ones.',
			expectedImpact: 'Increase monthly revenue by 20-30%',
			implementation: 'Implement referral program, improve sales process, and expand service offerings',
			timeframe: '2-3 months',
			createdAt: new Date().toISOString(),
		});
	}

	// Cost optimization recommendations
	if (healthScore.expenses < 70) {
		recommendations.push({
			id: `cost-rec-${Date.now()}`,
			priority: 'medium',
			category: 'cost_optimization',
			title: 'Optimize Operating Expenses',
			description: 'Review and reduce unnecessary expenses to improve profitability.',
			expectedImpact: 'Reduce monthly expenses by 10-15%',
			implementation: 'Audit expense categories, negotiate better rates, eliminate non-essential costs',
			timeframe: '1-2 months',
			createdAt: new Date().toISOString(),
		});
	}

	// Cash flow recommendations
	if (healthScore.cashflow < 70) {
		recommendations.push({
			id: `cashflow-rec-${Date.now()}`,
			priority: 'high',
			category: 'cash_flow',
			title: 'Improve Cash Flow Management',
			description: 'Implement strategies to accelerate cash collection and manage payment timing.',
			expectedImpact: 'Improve cash flow by 25-40%',
			implementation: 'Shorten payment terms, offer early payment discounts, implement automated invoicing',
			timeframe: '1 month',
			createdAt: new Date().toISOString(),
		});
	}

	// Profitability recommendations
	if (healthScore.profitability < 70) {
		recommendations.push({
			id: `profit-rec-${Date.now()}`,
			priority: 'medium',
			category: 'revenue_growth',
			title: 'Increase Profit Margins',
			description: 'Focus on higher-margin services and optimize pricing strategies.',
			expectedImpact: 'Increase profit margins by 5-10%',
			implementation: 'Review pricing strategy, focus on premium services, improve operational efficiency',
			timeframe: '2-4 months',
			createdAt: new Date().toISOString(),
		});
	}

	return recommendations;
}

// Export all financial intelligence service functions
export const FinancialIntelligenceService = {
	analyzeFinancialHealth,
	generateFinancialInsights,
	generateFinancialPredictions,
	generateFinancialRecommendations,
};
