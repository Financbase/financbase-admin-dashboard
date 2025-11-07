/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from "@/lib/db";
import {
	adboardCampaigns,
	expenses,
	projects,
	propertyIncome,
	properties,
} from "@/lib/db/schemas";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import {} from "lucide-react";
import OpenAI from "openai";
import {
	FINANCIAL_ANALYSIS_PROMPTS,
	HEALTH_SCORE_PROMPTS,
	RECOMMENDATION_PROMPTS,
} from "./ai-prompts";
import type {
	AIAnalysisRequest,
	AIAnalysisResponse,
	AIError,
	AIRecommendation,
	AIUsageStats,
	CashFlowPrediction,
	ExpensePrediction,
	FinancialAnalysis,
	FinancialHealthScore,
	FinancialInsight,
	PredictiveModel,
	ProfitabilityPrediction,
	RevenuePrediction,
} from "./ai-types";

export class FinancialAIService {
	private openai: OpenAI;
	private usageStats: AIUsageStats;

	constructor() {
		this.openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		});
		this.usageStats = {
			totalRequests: 0,
			successfulRequests: 0,
			failedRequests: 0,
			averageResponseTime: 0,
			tokensUsed: 0,
			cost: 0,
			lastUpdated: new Date(),
		};
	}

	/**
	 * Generate comprehensive financial analysis
	 */
	async generateFinancialAnalysis(
		userId: string,
		request: AIAnalysisRequest,
	): Promise<AIAnalysisResponse> {
		const startTime = Date.now();

		try {
			this.usageStats.totalRequests++;

			// Gather financial data
			const financialData = await this.gatherFinancialData(
				userId,
				request.timeframe,
			);

			// Generate AI analysis
			const analysis = await this.performAIAnalysis(userId, financialData, request);

			// Calculate processing time
			const processingTime = Date.now() - startTime;
			this.usageStats.successfulRequests++;
			this.usageStats.averageResponseTime =
				(this.usageStats.averageResponseTime + processingTime) / 2;

			return {
				success: true,
				data: analysis,
				processingTime,
			};
		} catch (error) {
			this.usageStats.failedRequests++;
			console.error("AI Analysis Error:", error);

			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Generate cash flow predictions
	 */
	async predictCashFlow(
		userId: string,
		timeframe: "3_months" | "6_months" | "12_months",
	): Promise<CashFlowPrediction> {
		const financialData = await this.gatherFinancialData(userId);

		const prompt = FINANCIAL_ANALYSIS_PROMPTS.cashFlow
			.replace("{inflows}", JSON.stringify(financialData.inflows))
			.replace("{outflows}", JSON.stringify(financialData.outflows))
			.replace("{balance}", financialData.currentBalance.toString())
			.replace("{paymentTerms}", JSON.stringify(financialData.paymentTerms));

		const response = await this.openai.chat.completions.create({
			model: "gpt-4",
			messages: [
				{
					role: "system",
					content:
						"You are a financial AI analyst specializing in cash flow prediction. Provide accurate, data-driven predictions in JSON format.",
				},
				{
					role: "user",
					content: prompt,
				},
			],
			temperature: 0.3,
			max_tokens: 2000,
		});

		const content = response.choices[0]?.message?.content;
		if (!content) {
			throw new Error("No response from AI service");
		}

		return JSON.parse(content);
	}

	/**
	 * Generate revenue predictions
	 */
	async predictRevenue(
		userId: string,
		timeframe: "3_months" | "6_months" | "12_months",
	): Promise<RevenuePrediction> {
		const financialData = await this.gatherFinancialData(userId);

		const prompt = FINANCIAL_ANALYSIS_PROMPTS.revenue
			.replace("{revenue}", JSON.stringify(financialData.revenue))
			.replace("{sources}", JSON.stringify(financialData.revenueSources))
			.replace("{growthRate}", financialData.growthRate.toString())
			.replace("{seasonality}", JSON.stringify(financialData.seasonality));

		const response = await this.openai.chat.completions.create({
			model: "gpt-4",
			messages: [
				{
					role: "system",
					content:
						"You are a financial AI analyst specializing in revenue prediction. Provide accurate, data-driven predictions in JSON format.",
				},
				{
					role: "user",
					content: prompt,
				},
			],
			temperature: 0.3,
			max_tokens: 2000,
		});

		const content = response.choices[0]?.message?.content;
		if (!content) {
			throw new Error("No response from AI service");
		}

		return JSON.parse(content);
	}

	/**
	 * Generate expense predictions
	 */
	async predictExpenses(
		userId: string,
		timeframe: "3_months" | "6_months" | "12_months",
	): Promise<ExpensePrediction> {
		const financialData = await this.gatherFinancialData(userId);

		const prompt = FINANCIAL_ANALYSIS_PROMPTS.expense
			.replace("{expenses}", JSON.stringify(financialData.expenses))
			.replace("{categories}", JSON.stringify(financialData.expenseCategories))
			.replace("{fixedVariable}", JSON.stringify(financialData.fixedVariable))
			.replace("{trends}", JSON.stringify(financialData.expenseTrends));

		const response = await this.openai.chat.completions.create({
			model: "gpt-4",
			messages: [
				{
					role: "system",
					content:
						"You are a financial AI analyst specializing in expense prediction. Provide accurate, data-driven predictions in JSON format.",
				},
				{
					role: "user",
					content: prompt,
				},
			],
			temperature: 0.3,
			max_tokens: 2000,
		});

		const content = response.choices[0]?.message?.content;
		if (!content) {
			throw new Error("No response from AI service");
		}

		return JSON.parse(content);
	}

	/**
	 * Generate profitability predictions
	 */
	async predictProfitability(
		userId: string,
		timeframe: "3_months" | "6_months" | "12_months",
	): Promise<ProfitabilityPrediction> {
		const financialData = await this.gatherFinancialData(userId);

		const prompt = FINANCIAL_ANALYSIS_PROMPTS.profitability
			.replace("{revenue}", JSON.stringify(financialData.revenue))
			.replace("{expenses}", JSON.stringify(financialData.expenses))
			.replace("{margins}", JSON.stringify(financialData.margins))
			.replace("{costStructure}", JSON.stringify(financialData.costStructure));

		const response = await this.openai.chat.completions.create({
			model: "gpt-4",
			messages: [
				{
					role: "system",
					content:
						"You are a financial AI analyst specializing in profitability prediction. Provide accurate, data-driven predictions in JSON format.",
				},
				{
					role: "user",
					content: prompt,
				},
			],
			temperature: 0.3,
			max_tokens: 2000,
		});

		const content = response.choices[0]?.message?.content;
		if (!content) {
			throw new Error("No response from AI service");
		}

		return JSON.parse(content);
	}

	/**
	 * Calculate financial health score
	 */
	async calculateFinancialHealthScore(
		userId: string,
	): Promise<FinancialHealthScore> {
		const financialData = await this.gatherFinancialData(userId);

		const prompt = HEALTH_SCORE_PROMPTS.overall
			.replace("{income}", JSON.stringify(financialData.income))
			.replace("{expenses}", JSON.stringify(financialData.expenses))
			.replace("{projects}", JSON.stringify(financialData.projects))
			.replace("{properties}", JSON.stringify(financialData.properties))
			.replace("{campaigns}", JSON.stringify(financialData.campaigns));

		const response = await this.openai.chat.completions.create({
			model: "gpt-4",
			messages: [
				{
					role: "system",
					content:
						"You are a financial AI analyst specializing in health score calculation. Provide accurate, data-driven health scores in JSON format.",
				},
				{
					role: "user",
					content: prompt,
				},
			],
			temperature: 0.2,
			max_tokens: 1500,
		});

		const content = response.choices[0]?.message?.content;
		if (!content) {
			throw new Error("No response from AI service");
		}

		return JSON.parse(content);
	}

	/**
	 * Generate AI recommendations
	 */
	async generateRecommendations(userId: string): Promise<AIRecommendation[]> {
		const financialData = await this.gatherFinancialData(userId);

		const prompt = RECOMMENDATION_PROMPTS.budgetOptimization
			.replace("{budget}", JSON.stringify(financialData.budget))
			.replace("{spending}", JSON.stringify(financialData.spending))
			.replace("{variance}", JSON.stringify(financialData.variance))
			.replace("{categories}", JSON.stringify(financialData.categories));

		const response = await this.openai.chat.completions.create({
			model: "gpt-4",
			messages: [
				{
					role: "system",
					content:
						"You are a financial AI advisor. Provide actionable, specific recommendations in JSON format.",
				},
				{
					role: "user",
					content: prompt,
				},
			],
			temperature: 0.4,
			max_tokens: 2000,
		});

		const content = response.choices[0]?.message?.content;
		if (!content) {
			throw new Error("No response from AI service");
		}

		return JSON.parse(content);
	}

	/**
	 * Gather financial data from database
	 */
	private async gatherFinancialData(
		userId: string,
		timeframe?: { start: Date; end: Date },
	): Promise<{
		income: unknown[];
		expenses: unknown[];
		projects: unknown[];
		properties: unknown[];
		campaigns: unknown[];
		inflows: number[];
		outflows: number[];
		currentBalance: number;
		paymentTerms: unknown[];
		revenue: number[];
		revenueSources: unknown[];
		growthRate: number;
		seasonality: unknown[];
		expenseCategories: unknown[];
		fixedVariable: unknown;
		expenseTrends: unknown[];
		margins: unknown;
		costStructure: unknown;
		budget: number;
		spending: number;
		variance: unknown;
		categories: string[];
	}> {
		const startDate =
			timeframe?.start || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
		const endDate = timeframe?.end || new Date();

		// Fetch income data from property income
		const incomeData = await db
			.select()
			.from(propertyIncome)
			.where(
				and(
					eq(propertyIncome.userId, userId),
					gte(propertyIncome.date, startDate),
					lte(propertyIncome.date, endDate),
				),
			)
			.orderBy(desc(propertyIncome.date));

		// Fetch expense data
		const expenseData = await db
			.select()
			.from(expenses)
			.where(
				and(
					eq(expenses.userId, userId),
					gte(expenses.date, startDate),
					lte(expenses.date, endDate),
				),
			)
			.orderBy(desc(expenses.date));

		// Fetch project data
		const projectData = await db
			.select()
			.from(projects)
			.where(
				and(
					eq(projects.userId, userId),
					gte(projects.createdAt, startDate),
					lte(projects.createdAt, endDate),
				),
			)
			.orderBy(desc(projects.createdAt));

		// Fetch property data
		const propertyData = await db
			.select()
			.from(properties)
			.where(
				and(
					eq(properties.userId, userId),
					gte(properties.createdAt, startDate),
					lte(properties.createdAt, endDate),
				),
			)
			.orderBy(desc(properties.createdAt));

		// Fetch campaign data
		const campaignData = await db
			.select()
			.from(adboardCampaigns)
			.where(
				and(
					eq(adboardCampaigns.userId, userId),
					gte(adboardCampaigns.createdAt, startDate),
					lte(adboardCampaigns.createdAt, endDate),
				),
			)
			.orderBy(desc(adboardCampaigns.createdAt));

		return {
			income: incomeData,
			expenses: expenseData,
			projects: projectData,
			properties: propertyData,
			campaigns: campaignData,
			inflows: incomeData.map((i: any) => Number(i.amount || 0)),
			outflows: expenseData.map((e: any) => Number(e.amount || 0)),
			currentBalance: this.calculateCurrentBalance(incomeData, expenseData),
			paymentTerms: this.extractPaymentTerms(incomeData),
			revenue: incomeData.map((i: any) => Number(i.amount || 0)),
			revenueSources: this.extractRevenueSources(incomeData),
			growthRate: this.calculateGrowthRate(incomeData),
			seasonality: this.calculateSeasonality(incomeData),
			expenseCategories: this.categorizeExpenses(expenseData),
			fixedVariable: this.categorizeFixedVariable(expenseData),
			expenseTrends: this.calculateExpenseTrends(expenseData),
			margins: this.calculateMargins(incomeData, expenseData),
			costStructure: this.analyzeCostStructure(expenseData),
			budget: this.calculateBudget(incomeData),
			spending: this.calculateSpending(expenseData),
			variance: this.calculateVariance(incomeData, expenseData),
			categories: this.getExpenseCategories(expenseData),
		};
	}

	/**
	 * Perform AI analysis using OpenAI
	 */
	private async performAIAnalysis(
		userId: string,
		financialData: Record<string, unknown>,
		request: AIAnalysisRequest,
	): Promise<FinancialAnalysis> {
		const prompt = FINANCIAL_ANALYSIS_PROMPTS.comprehensive
			.replace("{income}", JSON.stringify(financialData.income))
			.replace("{expenses}", JSON.stringify(financialData.expenses))
			.replace("{projects}", JSON.stringify(financialData.projects))
			.replace("{properties}", JSON.stringify(financialData.properties))
			.replace("{campaigns}", JSON.stringify(financialData.campaigns));

		const response = await this.openai.chat.completions.create({
			model: "gpt-4",
			messages: [
				{
					role: "system",
					content:
						"You are a financial AI analyst. Provide comprehensive, accurate financial analysis in JSON format.",
				},
				{
					role: "user",
					content: prompt,
				},
			],
			temperature: 0.3,
			max_tokens: 3000,
		});

		const content = response.choices[0]?.message?.content;
		if (!content) {
			throw new Error("No response from AI service");
		}

		const analysis = JSON.parse(content);

		return {
			id: crypto.randomUUID(),
			userId: userId,
			analysisType: request.type,
			timeframe: request.timeframe || {
				start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
				end: new Date(),
			},
			insights: analysis.insights || [],
			predictions: analysis.predictions || [],
			healthScore: analysis.healthScore || {
				overall: 0,
				cashFlow: 0,
				revenue: 0,
				expenses: 0,
				profitability: 0,
				debt: 0,
				budget: 0,
				trend: "stable",
				riskLevel: "medium",
				lastCalculated: new Date(),
				breakdown: [],
			},
			recommendations: analysis.recommendations || [],
			summary: analysis.summary || {
				keyFindings: [],
				criticalIssues: [],
				opportunities: [],
				nextSteps: [],
			},
			generatedAt: new Date(),
		};
	}

	/**
	 * Helper methods for data processing
	 */
	private calculateCurrentBalance(
		income: unknown[],
		expenses: unknown[],
	): number {
		const totalIncome = income.reduce((sum: number, i: any) => sum + Number(i?.amount || 0), 0);
		const totalExpenses = expenses.reduce((sum: number, e: any) => sum + Number(e?.amount || 0), 0);
		return totalIncome - totalExpenses;
	}

	private extractPaymentTerms(income: unknown[]): unknown[] {
		return income.map((i: any) => ({
			source: i?.source || "unknown",
			terms: i?.paymentTerms || "30 days",
			frequency: i?.frequency || "monthly",
		}));
	}

	private extractRevenueSources(income: unknown[]): unknown[] {
		const sources = income.reduce((acc: Record<string, number>, i: any) => {
			const source = i?.source || "Unknown";
			acc[source] = (acc[source] || 0) + Number(i?.amount || 0);
			return acc;
		}, {});

		const total = income.reduce((sum: number, i: any) => sum + Number(i?.amount || 0), 0);

		return Object.entries(sources).map(([source, amount]) => ({
			source,
			amount,
			percentage: total > 0 ? ((amount as number) / total) * 100 : 0,
		}));
	}

	private calculateGrowthRate(income: unknown[]): number {
		if (income.length < 2) return 0;

		const sorted = [...income].sort(
			(a: any, b: any) => new Date(a?.date || 0).getTime() - new Date(b?.date || 0).getTime(),
		);
		const first = sorted.length > 0 ? Number((sorted[0] as any)?.amount || 0) : 0;
		const last = sorted.length > 0 ? Number((sorted[sorted.length - 1] as any)?.amount || 0) : 0;

		return first > 0 ? ((last - first) / first) * 100 : 0;
	}

	private calculateSeasonality(income: unknown[]): unknown[] {
		const monthly = income.reduce((acc: Record<number, number>, i: any) => {
			const month = new Date(i?.date || 0).getMonth();
			acc[month] = (acc[month] || 0) + Number(i?.amount || 0);
			return acc;
		}, {});

		const avg =
			Object.values(monthly).reduce(
				(sum: number, amount: number) => sum + amount,
				0,
			) / 12;

		const monthNames = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		];

		return Object.entries(monthly).map(([month, amount]) => ({
			month: monthNames[Number.parseInt(month)] || "Unknown",
			factor: avg > 0 ? (amount as number) / avg : 1,
		}));
	}

	private categorizeExpenses(expenses: unknown[]): unknown[] {
		const categories = expenses.reduce((acc: Record<string, number>, e: any) => {
			const category = e?.category || "Other";
			acc[category] = (acc[category] || 0) + Number(e?.amount || 0);
			return acc;
		}, {});

		const total = expenses.reduce((sum: number, e: any) => sum + Number(e?.amount || 0), 0);

		return Object.entries(categories).map(([category, amount]) => ({
			category,
			amount,
			percentage: total > 0 ? ((amount as number) / total) * 100 : 0,
		}));
	}

	private categorizeFixedVariable(expenses: unknown[]): unknown {
		const fixed = expenses
			.filter((e: any) => e?.isFixed)
			.reduce((sum: number, e: any) => sum + Number(e?.amount || 0), 0);
		const variable = expenses
			.filter((e: any) => !e?.isFixed)
			.reduce((sum: number, e: any) => sum + Number(e?.amount || 0), 0);
		const total = fixed + variable;

		return {
			fixed: {
				amount: fixed,
				percentage: total > 0 ? (fixed / total) * 100 : 0,
			},
			variable: {
				amount: variable,
				percentage: total > 0 ? (variable / total) * 100 : 0,
			},
		};
	}

	private calculateExpenseTrends(expenses: unknown[]): unknown[] {
		const monthly = expenses.reduce((acc: Record<string, number>, e: any) => {
			const month = new Date(e?.date || 0).toISOString().substring(0, 7);
			acc[month] = (acc[month] || 0) + Number(e?.amount || 0);
			return acc;
		}, {});

		return Object.entries(monthly)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([month, amount]) => ({ month, amount }));
	}

	private calculateMargins(income: unknown[], expenses: unknown[]): unknown {
		const totalIncome = income.reduce((sum: number, i: any) => sum + Number(i?.amount || 0), 0);
		const totalExpenses = expenses.reduce((sum: number, e: any) => sum + Number(e?.amount || 0), 0);
		const profit = totalIncome - totalExpenses;
		const margin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;

		return {
			gross: margin,
			net: margin,
			profit,
			revenue: totalIncome,
			expenses: totalExpenses,
		};
	}

	private analyzeCostStructure(expenses: unknown[]): unknown {
		const total = expenses.reduce((sum: number, e: any) => sum + Number(e?.amount || 0), 0);
		const categories = this.categorizeExpenses(expenses) as Array<{ category: string; amount: number; percentage: number }>;

		return {
			total,
			categories: categories.map((c) => ({
				...c,
				efficiency:
					c.percentage > 20 ? "high" : c.percentage > 10 ? "medium" : "low",
			})),
			distribution: categories.map((c) => ({
				category: c.category,
				percentage: c.percentage,
			})),
		};
	}

	private calculateBudget(income: unknown[]): number {
		return income.reduce((sum: number, i: any) => sum + Number(i?.amount || 0), 0);
	}

	private calculateSpending(expenses: unknown[]): number {
		return expenses.reduce((sum: number, e: any) => sum + Number(e?.amount || 0), 0);
	}

	private calculateVariance(income: unknown[], expenses: unknown[]): unknown {
		const budget = this.calculateBudget(income);
		const actual = this.calculateSpending(expenses);
		const variance = budget - actual;
		const variancePercent = budget > 0 ? (variance / budget) * 100 : 0;

		return {
			budget,
			actual,
			variance,
			variancePercent,
			status: variance > 0 ? "under" : "over",
		};
	}

	private getExpenseCategories(expenses: unknown[]): string[] {
		return [...new Set(expenses.map((e: any) => e?.category || "Other"))];
	}

	/**
	 * Get usage statistics
	 */
	getUsageStats(): AIUsageStats {
		return this.usageStats;
	}

	/**
	 * Reset usage statistics
	 */
	resetUsageStats(): void {
		this.usageStats = {
			totalRequests: 0,
			successfulRequests: 0,
			failedRequests: 0,
			averageResponseTime: 0,
			tokensUsed: 0,
			cost: 0,
			lastUpdated: new Date(),
		};
	}
}
