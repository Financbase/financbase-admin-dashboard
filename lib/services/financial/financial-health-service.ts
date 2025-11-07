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
import {
	Banknote,
	Bot,
	Clock,
	DollarSign,
	Filter,
	MessageCircle,
	PiggyBank,
	TrendingDown,
	TrendingUp,
	XCircle,
} from "lucide-react";
import type { FinancialHealthScore } from "./ai/ai-types";

export class FinancialHealthService {
	/**
	 * Calculate overall financial health score for a user
	 */
	async calculateFinancialHealthScore(
		userId: string,
	): Promise<FinancialHealthScore> {
		try {
			// Get financial data for the last 12 months
			const endDate = new Date();
			const startDate = new Date();
			startDate.setMonth(startDate.getMonth() - 12);

			const [incomeData, expenseData, projectData, propertyData, campaignData] =
				await Promise.all([
					this.getIncomeData(userId, startDate, endDate),
					this.getExpenseData(userId, startDate, endDate),
					this.getProjectData(userId, startDate, endDate),
					this.getPropertyData(userId, startDate, endDate),
					this.getCampaignData(userId, startDate, endDate),
				]);

			// Calculate individual health scores
			const cashFlowScore = this.calculateCashFlowScore(
				incomeData,
				expenseData,
			);
			const revenueScore = this.calculateRevenueScore(incomeData);
			const expenseScore = this.calculateExpenseScore(expenseData);
			const profitabilityScore = this.calculateProfitabilityScore(
				incomeData,
				expenseData,
			);
			const debtScore = this.calculateDebtScore(expenseData);
			const budgetScore = this.calculateBudgetScore(incomeData, expenseData);

			// Calculate overall score
			const overallScore = this.calculateOverallScore({
				cashFlow: cashFlowScore,
				revenue: revenueScore,
				expenses: expenseScore,
				profitability: profitabilityScore,
				debt: debtScore,
				budget: budgetScore,
			});

			// Determine trend
			const trend = this.calculateTrend(incomeData, expenseData);

			// Determine risk level
			const riskLevel = this.calculateRiskLevel(overallScore, trend);

			// Create breakdown
			const breakdown = [
				{
					factor: "Cash Flow Stability",
					score: cashFlowScore,
					weight: 0.25,
					impact:
						cashFlowScore >= 70 ? ("positive" as const) : ("negative" as const),
				},
				{
					factor: "Revenue Growth",
					score: revenueScore,
					weight: 0.2,
					impact:
						revenueScore >= 70 ? ("positive" as const) : ("negative" as const),
				},
				{
					factor: "Expense Management",
					score: expenseScore,
					weight: 0.2,
					impact:
						expenseScore >= 70 ? ("positive" as const) : ("negative" as const),
				},
				{
					factor: "Profitability",
					score: profitabilityScore,
					weight: 0.15,
					impact:
						profitabilityScore >= 70
							? ("positive" as const)
							: ("negative" as const),
				},
				{
					factor: "Debt Management",
					score: debtScore,
					weight: 0.1,
					impact:
						debtScore >= 70 ? ("positive" as const) : ("negative" as const),
				},
				{
					factor: "Budget Adherence",
					score: budgetScore,
					weight: 0.1,
					impact:
						budgetScore >= 70 ? ("positive" as const) : ("negative" as const),
				},
			];

			return {
				overall: overallScore,
				cashFlow: cashFlowScore,
				revenue: revenueScore,
				expenses: expenseScore,
				profitability: profitabilityScore,
				debt: debtScore,
				budget: budgetScore,
				trend,
				riskLevel,
				lastCalculated: new Date(),
				breakdown,
			};
		} catch (error) {
			console.error("Financial health score calculation error:", error);
			throw new Error(
				`Failed to calculate financial health score: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get module-specific health scores
	 */
	async getModuleHealthScores(userId: string): Promise<{
		freelance: number;
		realEstate: number;
		adboard: number;
	}> {
		try {
			const endDate = new Date();
			const startDate = new Date();
			startDate.setMonth(startDate.getMonth() - 6);

			const [projectData, propertyData, campaignData] = await Promise.all([
				this.getProjectData(userId, startDate, endDate),
				this.getPropertyData(userId, startDate, endDate),
				this.getCampaignData(userId, startDate, endDate),
			]);

			return {
				freelance: this.calculateFreelanceHealthScore(projectData),
				realEstate: this.calculateRealEstateHealthScore(propertyData),
				adboard: this.calculateAdboardHealthScore(campaignData),
			};
		} catch (error) {
			console.error("Module health scores calculation error:", error);
			throw new Error(
				`Failed to calculate module health scores: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get financial health trends over time
	 */
	async getHealthTrends(
		userId: string,
		months = 12,
	): Promise<{
		monthly: {
			month: string;
			score: number;
			factors: {
				cashFlow: number;
				revenue: number;
				expenses: number;
				profitability: number;
			};
		}[];
		trend: "improving" | "stable" | "declining";
		volatility: "low" | "medium" | "high";
	}> {
		try {
			const monthlyScores = [];
			const endDate = new Date();

			for (let i = months - 1; i >= 0; i--) {
				const monthStart = new Date();
				monthStart.setMonth(monthStart.getMonth() - i);
				monthStart.setDate(1);

				const monthEnd = new Date(monthStart);
				monthEnd.setMonth(monthEnd.getMonth() + 1);
				monthEnd.setDate(0);

				const [incomeData, expenseData] = await Promise.all([
					this.getIncomeData(userId, monthStart, monthEnd),
					this.getExpenseData(userId, monthStart, monthEnd),
				]);

				const cashFlow = this.calculateCashFlowScore(incomeData, expenseData);
				const revenue = this.calculateRevenueScore(incomeData);
				const expenses = this.calculateExpenseScore(expenseData);
				const profitability = this.calculateProfitabilityScore(
					incomeData,
					expenseData,
				);

				const overallScore =
					(cashFlow + revenue + expenses + profitability) / 4;

				monthlyScores.push({
					month: monthStart.toISOString().substring(0, 7),
					score: overallScore,
					factors: {
						cashFlow,
						revenue,
						expenses,
						profitability,
					},
				});
			}

			const trend = this.calculateTrendFromScores(
				monthlyScores.map((m) => m.score),
			);
			const volatility = this.calculateVolatility(
				monthlyScores.map((m) => m.score),
			);

			return {
				monthly: monthlyScores,
				trend,
				volatility,
			};
		} catch (error) {
			console.error("Health trends calculation error:", error);
			throw new Error(
				`Failed to calculate health trends: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get financial health recommendations
	 */
	async getHealthRecommendations(userId: string): Promise<{
		critical: string[];
		important: string[];
		optional: string[];
	}> {
		try {
			const healthScore = await this.calculateFinancialHealthScore(userId);
			const recommendations = [];

			// Critical recommendations (score < 50)
			if (healthScore.overall < 50) {
				recommendations.push({
					priority: "critical",
					message: "Financial health is critical. Immediate action required.",
					actions: [
						"Review and reduce unnecessary expenses",
						"Focus on increasing revenue",
						"Build emergency cash reserve",
						"Consider professional financial advice",
					],
				});
			}

			// Important recommendations (score 50-70)
			if (healthScore.overall >= 50 && healthScore.overall < 70) {
				recommendations.push({
					priority: "important",
					message: "Financial health needs improvement.",
					actions: [
						"Optimize expense management",
						"Improve cash flow forecasting",
						"Diversify revenue sources",
						"Implement budget controls",
					],
				});
			}

			// Optional recommendations (score 70+)
			if (healthScore.overall >= 70) {
				recommendations.push({
					priority: "optional",
					message:
						"Financial health is good. Consider optimization opportunities.",
					actions: [
						"Explore growth opportunities",
						"Optimize tax strategy",
						"Consider investment options",
						"Plan for long-term financial goals",
					],
				});
			}

			return {
				critical: recommendations
					.filter((r) => r.priority === "critical")
					.map((r) => r.message),
				important: recommendations
					.filter((r) => r.priority === "important")
					.map((r) => r.message),
				optional: recommendations
					.filter((r) => r.priority === "optional")
					.map((r) => r.message),
			};
		} catch (error) {
			console.error("Health recommendations error:", error);
			throw new Error(
				`Failed to get health recommendations: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	// Private helper methods

	private async getIncomeData(userId: string, startDate: Date, endDate: Date) {
		return await db
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
	}

	private async getExpenseData(userId: string, startDate: Date, endDate: Date) {
		return await db
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
	}

	private async getProjectData(userId: string, startDate: Date, endDate: Date) {
		return await db
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
	}

	private async getPropertyData(
		userId: string,
		startDate: Date,
		endDate: Date,
	) {
		return await db
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
	}

	private async getCampaignData(
		userId: string,
		startDate: Date,
		endDate: Date,
	) {
		return await db
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
	}

	private calculateCashFlowScore(
		incomeData: any[],
		expenseData: any[],
	): number {
		const totalIncome = incomeData.reduce((sum, i) => sum + (i.amount || 0), 0);
		const totalExpenses = expenseData.reduce(
			(sum, e) => sum + (e.amount || 0),
			0,
		);
		const netCashFlow = totalIncome - totalExpenses;

		if (netCashFlow <= 0) return 0;
		if (netCashFlow < totalExpenses * 0.1) return 25;
		if (netCashFlow < totalExpenses * 0.2) return 50;
		if (netCashFlow < totalExpenses * 0.3) return 75;
		return 100;
	}

	private calculateRevenueScore(incomeData: any[]): number {
		if (incomeData.length === 0) return 0;

		const amounts = incomeData.map((i) => i.amount || 0);
		const avgRevenue =
			amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
		const growthRate = this.calculateGrowthRate(amounts);

		let score = 50; // Base score

		// Growth rate bonus
		if (growthRate > 0.2) score += 30;
		else if (growthRate > 0.1) score += 20;
		else if (growthRate > 0) score += 10;
		else if (growthRate < -0.1) score -= 20;

		// Consistency bonus
		const variance = this.calculateVariance(amounts);
		if (variance < 0.1) score += 20;
		else if (variance < 0.2) score += 10;

		return Math.max(0, Math.min(100, score));
	}

	private calculateExpenseScore(expenseData: any[]): number {
		if (expenseData.length === 0) return 100;

		const amounts = expenseData.map((e) => e.amount || 0);
		const avgExpense =
			amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
		const growthRate = this.calculateGrowthRate(amounts);

		let score = 50; // Base score

		// Growth rate penalty
		if (growthRate > 0.2) score -= 30;
		else if (growthRate > 0.1) score -= 20;
		else if (growthRate > 0) score -= 10;
		else if (growthRate < -0.1) score += 20;

		// Consistency bonus
		const variance = this.calculateVariance(amounts);
		if (variance < 0.1) score += 20;
		else if (variance < 0.2) score += 10;

		return Math.max(0, Math.min(100, score));
	}

	private calculateProfitabilityScore(
		incomeData: any[],
		expenseData: any[],
	): number {
		const totalIncome = incomeData.reduce((sum, i) => sum + (i.amount || 0), 0);
		const totalExpenses = expenseData.reduce(
			(sum, e) => sum + (e.amount || 0),
			0,
		);

		if (totalIncome === 0) return 0;

		const profitMargin = (totalIncome - totalExpenses) / totalIncome;

		if (profitMargin >= 0.3) return 100;
		if (profitMargin >= 0.2) return 80;
		if (profitMargin >= 0.1) return 60;
		if (profitMargin >= 0) return 40;
		return 0;
	}

	private calculateDebtScore(expenseData: any[]): number {
		// This is a simplified calculation
		// In a real implementation, you'd have debt data
		const debtExpenses = expenseData.filter(
			(e) =>
				e.category?.toLowerCase().includes("debt") ||
				e.category?.toLowerCase().includes("loan") ||
				e.category?.toLowerCase().includes("interest"),
		);

		const totalDebtExpenses = debtExpenses.reduce(
			(sum, e) => sum + (e.amount || 0),
			0,
		);
		const totalExpenses = expenseData.reduce(
			(sum, e) => sum + (e.amount || 0),
			0,
		);

		if (totalExpenses === 0) return 100;

		const debtRatio = totalDebtExpenses / totalExpenses;

		if (debtRatio <= 0.1) return 100;
		if (debtRatio <= 0.2) return 80;
		if (debtRatio <= 0.3) return 60;
		if (debtRatio <= 0.4) return 40;
		return 20;
	}

	private calculateBudgetScore(incomeData: any[], expenseData: any[]): number {
		const totalIncome = incomeData.reduce((sum, i) => sum + (i.amount || 0), 0);
		const totalExpenses = expenseData.reduce(
			(sum, e) => sum + (e.amount || 0),
			0,
		);

		if (totalIncome === 0) return 0;

		const expenseRatio = totalExpenses / totalIncome;

		if (expenseRatio <= 0.7) return 100;
		if (expenseRatio <= 0.8) return 80;
		if (expenseRatio <= 0.9) return 60;
		if (expenseRatio <= 1.0) return 40;
		return 20;
	}

	private calculateOverallScore(scores: {
		cashFlow: number;
		revenue: number;
		expenses: number;
		profitability: number;
		debt: number;
		budget: number;
	}): number {
		const weights = {
			cashFlow: 0.25,
			revenue: 0.2,
			expenses: 0.2,
			profitability: 0.15,
			debt: 0.1,
			budget: 0.1,
		};

		return Math.round(
			scores.cashFlow * weights.cashFlow +
				scores.revenue * weights.revenue +
				scores.expenses * weights.expenses +
				scores.profitability * weights.profitability +
				scores.debt * weights.debt +
				scores.budget * weights.budget,
		);
	}

	private calculateTrend(
		incomeData: any[],
		expenseData: any[],
	): "improving" | "stable" | "declining" {
		if (incomeData.length < 2) return "stable";

		const recentIncome = incomeData
			.slice(0, 3)
			.reduce((sum, i) => sum + (i.amount || 0), 0);
		const olderIncome = incomeData
			.slice(-3)
			.reduce((sum, i) => sum + (i.amount || 0), 0);

		const growthRate = (recentIncome - olderIncome) / olderIncome;

		if (growthRate > 0.1) return "improving";
		if (growthRate < -0.1) return "declining";
		return "stable";
	}

	private calculateRiskLevel(
		score: number,
		trend: string,
	): "low" | "medium" | "high" {
		if (score >= 80 && trend === "improving") return "low";
		if (score >= 60 && trend !== "declining") return "medium";
		return "high";
	}

	private calculateFreelanceHealthScore(projectData: any[]): number {
		if (projectData.length === 0) return 0;

		const completedProjects = projectData.filter(
			(p) => p.status === "completed",
		).length;
		const totalProjects = projectData.length;
		const completionRate = completedProjects / totalProjects;

		return Math.round(completionRate * 100);
	}

	private calculateRealEstateHealthScore(propertyData: any[]): number {
		if (propertyData.length === 0) return 0;

		// Simplified calculation based on property count and status
		const activeProperties = propertyData.filter(
			(p) => p.status === "active",
		).length;
		const totalProperties = propertyData.length;
		const occupancyRate = activeProperties / totalProperties;

		return Math.round(occupancyRate * 100);
	}

	private calculateAdboardHealthScore(campaignData: any[]): number {
		if (campaignData.length === 0) return 0;

		const activeCampaigns = campaignData.filter(
			(c) => c.status === "active",
		).length;
		const totalCampaigns = campaignData.length;
		const activeRate = activeCampaigns / totalCampaigns;

		return Math.round(activeRate * 100);
	}

	private calculateTrendFromScores(
		scores: number[],
	): "improving" | "stable" | "declining" {
		if (scores.length < 2) return "stable";

		const recent =
			scores.slice(0, 3).reduce((sum, score) => sum + score, 0) / 3;
		const older = scores.slice(-3).reduce((sum, score) => sum + score, 0) / 3;

		const change = (recent - older) / older;

		if (change > 0.05) return "improving";
		if (change < -0.05) return "declining";
		return "stable";
	}

	private calculateVolatility(scores: number[]): "low" | "medium" | "high" {
		if (scores.length < 2) return "low";

		const variance = this.calculateVariance(scores);

		if (variance < 0.1) return "low";
		if (variance < 0.2) return "medium";
		return "high";
	}

	private calculateGrowthRate(values: number[]): number {
		if (values.length < 2) return 0;

		const first = values[values.length - 1];
		const last = values[0];

		if (first === 0) return 0;
		return (last - first) / first;
	}

	private calculateVariance(values: number[]): number {
		if (values.length < 2) return 0;

		const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
		const variance =
			values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
			values.length;

		return Math.sqrt(variance) / mean;
	}
}
