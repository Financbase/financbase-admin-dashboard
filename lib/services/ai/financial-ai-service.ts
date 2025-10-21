import { db } from "@/lib/db";
import {
	adboardCampaigns,
	expenses,
	freelanceProjects,
	income,
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
			const analysis = await this.performAIAnalysis(financialData, request);

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

		// Fetch income data
		const incomeData = await db
			.select()
			.from(income)
			.where(
				and(
					eq(income.userId, userId),
					gte(income.date, startDate),
					lte(income.date, endDate),
				),
			)
			.orderBy(desc(income.date));

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
			.from(freelanceProjects)
			.where(
				and(
					eq(freelanceProjects.userId, userId),
					gte(freelanceProjects.createdAt, startDate),
					lte(freelanceProjects.createdAt, endDate),
				),
			)
			.orderBy(desc(freelanceProjects.createdAt));

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
			inflows: incomeData.map((i) => i.amount),
			outflows: expenseData.map((e) => e.amount),
			currentBalance: this.calculateCurrentBalance(incomeData, expenseData),
			paymentTerms: this.extractPaymentTerms(incomeData),
			revenue: incomeData.map((i) => i.amount),
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
			userId: financialData.userId || "unknown",
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
		const totalIncome = income.reduce((sum, i) => sum + (i.amount || 0), 0);
		const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
		return totalIncome - totalExpenses;
	}

	private extractPaymentTerms(income: unknown[]): unknown[] {
		return income.map((i) => ({
			source: i.source,
			terms: i.paymentTerms || "30 days",
			frequency: i.frequency || "monthly",
		}));
	}

	private extractRevenueSources(income: unknown[]): unknown[] {
		const sources = income.reduce((acc, i) => {
			const source = i.source || "Unknown";
			acc[source] = (acc[source] || 0) + (i.amount || 0);
			return acc;
		}, {});

		return Object.entries(sources).map(([source, amount]) => ({
			source,
			amount,
			percentage:
				((amount as number) /
					income.reduce((sum, i) => sum + (i.amount || 0), 0)) *
				100,
		}));
	}

	private calculateGrowthRate(income: unknown[]): number {
		if (income.length < 2) return 0;

		const sorted = income.sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
		);
		const first = sorted[0].amount || 0;
		const last = sorted[sorted.length - 1].amount || 0;

		return first > 0 ? ((last - first) / first) * 100 : 0;
	}

	private calculateSeasonality(income: unknown[]): unknown[] {
		const monthly = income.reduce((acc, i) => {
			const month = new Date(i.date).getMonth();
			acc[month] = (acc[month] || 0) + (i.amount || 0);
			return acc;
		}, {});

		const avg =
			Object.values(monthly).reduce(
				(sum, amount) => sum + (amount as number),
				0,
			) / 12;

		return Object.entries(monthly).map(([month, amount]) => ({
			month: [
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
			][Number.parseInt(month)],
			factor: avg > 0 ? (amount as number) / avg : 1,
		}));
	}

	private categorizeExpenses(expenses: unknown[]): unknown[] {
		const categories = expenses.reduce((acc, e) => {
			const category = e.category || "Other";
			acc[category] = (acc[category] || 0) + (e.amount || 0);
			return acc;
		}, {});

		return Object.entries(categories).map(([category, amount]) => ({
			category,
			amount,
			percentage:
				((amount as number) /
					expenses.reduce((sum, e) => sum + (e.amount || 0), 0)) *
				100,
		}));
	}

	private categorizeFixedVariable(expenses: unknown[]): unknown {
		const fixed = expenses
			.filter((e) => e.isFixed)
			.reduce((sum, e) => sum + (e.amount || 0), 0);
		const variable = expenses
			.filter((e) => !e.isFixed)
			.reduce((sum, e) => sum + (e.amount || 0), 0);
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
		const monthly = expenses.reduce((acc, e) => {
			const month = new Date(e.date).toISOString().substring(0, 7);
			acc[month] = (acc[month] || 0) + (e.amount || 0);
			return acc;
		}, {});

		return Object.entries(monthly)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([month, amount]) => ({ month, amount }));
	}

	private calculateMargins(income: unknown[], expenses: unknown[]): unknown {
		const totalIncome = income.reduce((sum, i) => sum + (i.amount || 0), 0);
		const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
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
		const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
		const categories = this.categorizeExpenses(expenses);

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
		return income.reduce((sum, i) => sum + (i.amount || 0), 0);
	}

	private calculateSpending(expenses: unknown[]): number {
		return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
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
		return [...new Set(expenses.map((e) => e.category || "Other"))];
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
