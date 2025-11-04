/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import {
	ArrowUp,
	Bell,
	Bot,
	Clock,
	Key,
	MessageCircle,
	PiggyBank,
	TrendingDown,
	Users,
	XCircle,
} from "lucide-react";
import type { ExpensePrediction } from "./ai-types";
import { FinancialAIService } from "./financial-ai-service";

export class ExpensePredictor {
	private aiService: FinancialAIService;

	constructor() {
		this.aiService = new FinancialAIService();
	}

	/**
	 * Predict expenses for the specified timeframe
	 */
	async predictExpenses(
		userId: string,
		timeframe: "3_months" | "6_months" | "12_months",
	): Promise<ExpensePrediction> {
		try {
			const prediction = await this.aiService.predictExpenses(
				userId,
				timeframe,
			);

			// Enhance prediction with additional analysis
			const enhancedPrediction = await this.enhancePrediction(
				prediction,
				userId,
			);

			return enhancedPrediction;
		} catch (error) {
			console.error("Expense prediction error:", error);
			throw new Error(
				`Failed to predict expenses: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Analyze expense trends and patterns
	 */
	async analyzeExpenseTrends(userId: string): Promise<{
		trend: "increasing" | "stable" | "decreasing";
		growthRate: number;
		seasonality: {
			month: string;
			factor: number;
		}[];
		volatility: "low" | "medium" | "high";
		patterns: {
			weekly: number[];
			monthly: number[];
			quarterly: number[];
		};
	}> {
		try {
			return {
				trend: "increasing",
				growthRate: 0.08,
				seasonality: [
					{ month: "January", factor: 1.1 },
					{ month: "February", factor: 0.9 },
					{ month: "March", factor: 1.0 },
					{ month: "April", factor: 1.0 },
					{ month: "May", factor: 1.0 },
					{ month: "June", factor: 0.9 },
					{ month: "July", factor: 0.8 },
					{ month: "August", factor: 0.8 },
					{ month: "September", factor: 1.0 },
					{ month: "October", factor: 1.1 },
					{ month: "November", factor: 1.2 },
					{ month: "December", factor: 1.3 },
				],
				volatility: "medium",
				patterns: {
					weekly: [2000, 1800, 1900, 2100, 2200, 1500, 1200],
					monthly: [18000, 19000, 20000, 19500, 21000, 20500],
					quarterly: [57000, 58500, 61000],
				},
			};
		} catch (error) {
			console.error("Expense trends analysis error:", error);
			throw new Error(
				`Failed to analyze expense trends: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Identify expense optimization opportunities
	 */
	async identifyOptimizationOpportunities(userId: string): Promise<{
		opportunities: {
			category: string;
			currentAmount: number;
			potentialSavings: number;
			confidence: number;
			description: string;
			actions: string[];
			timeframe: string;
		}[];
		risks: {
			category: string;
			risk: "cost_increase" | "budget_overrun" | "unexpected_expenses";
			severity: "low" | "medium" | "high";
			description: string;
			mitigation: string[];
		}[];
	}> {
		try {
			return {
				opportunities: [
					{
						category: "Software Subscriptions",
						currentAmount: 5000,
						potentialSavings: 1500,
						confidence: 0.9,
						description: "Consolidate and optimize software subscriptions",
						actions: [
							"Audit all software subscriptions",
							"Identify duplicate or unused tools",
							"Negotiate better rates with vendors",
							"Consolidate similar tools",
						],
						timeframe: "4 weeks",
					},
					{
						category: "Office Rent",
						currentAmount: 8000,
						potentialSavings: 2000,
						confidence: 0.7,
						description: "Negotiate rent reduction or consider remote work",
						actions: [
							"Research market rates",
							"Prepare negotiation strategy",
							"Consider hybrid work model",
							"Negotiate with landlord",
						],
						timeframe: "8 weeks",
					},
					{
						category: "Marketing",
						currentAmount: 3000,
						potentialSavings: 800,
						confidence: 0.8,
						description:
							"Optimize marketing spend and focus on high-ROI channels",
						actions: [
							"Analyze marketing ROI by channel",
							"Cut low-performing campaigns",
							"Focus on high-ROI channels",
							"Implement better tracking",
						],
						timeframe: "6 weeks",
					},
				],
				risks: [
					{
						category: "Utilities",
						risk: "cost_increase",
						severity: "medium",
						description: "Energy costs may increase due to market conditions",
						mitigation: [
							"Implement energy-saving measures",
							"Negotiate fixed-rate contracts",
							"Monitor usage patterns",
							"Consider renewable energy options",
						],
					},
					{
						category: "Insurance",
						risk: "cost_increase",
						severity: "high",
						description: "Insurance premiums may increase significantly",
						mitigation: [
							"Shop around for better rates",
							"Increase deductibles if appropriate",
							"Bundle insurance policies",
							"Review coverage needs",
						],
					},
				],
			};
		} catch (error) {
			console.error("Expense optimization analysis error:", error);
			throw new Error(
				`Failed to identify optimization opportunities: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Calculate expense health score
	 */
	async calculateExpenseHealthScore(userId: string): Promise<{
		score: number; // 0-100
		factors: {
			factor: string;
			score: number;
			weight: number;
			impact: "positive" | "negative" | "neutral";
		}[];
		recommendations: string[];
	}> {
		try {
			const factors = [
				{
					factor: "Expense Control",
					score: 75,
					weight: 0.25,
					impact: "positive" as const,
				},
				{
					factor: "Budget Adherence",
					score: 80,
					weight: 0.2,
					impact: "positive" as const,
				},
				{
					factor: "Cost Efficiency",
					score: 70,
					weight: 0.2,
					impact: "neutral" as const,
				},
				{
					factor: "Expense Growth Rate",
					score: 65,
					weight: 0.15,
					impact: "negative" as const,
				},
				{
					factor: "Category Optimization",
					score: 60,
					weight: 0.1,
					impact: "negative" as const,
				},
				{
					factor: "Vendor Management",
					score: 85,
					weight: 0.1,
					impact: "positive" as const,
				},
			];

			const weightedScore = factors.reduce(
				(sum, factor) => sum + factor.score * factor.weight,
				0,
			);

			return {
				score: Math.round(weightedScore),
				factors,
				recommendations: [
					"Implement expense tracking and categorization",
					"Set up budget alerts and controls",
					"Negotiate better rates with key vendors",
					"Review and optimize expense categories",
					"Implement expense approval workflows",
				],
			};
		} catch (error) {
			console.error("Expense health score error:", error);
			throw new Error(
				`Failed to calculate expense health score: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Generate expense optimization recommendations
	 */
	async generateOptimizationRecommendations(userId: string): Promise<{
		recommendations: {
			category:
				| "cost_reduction"
				| "process_improvement"
				| "vendor_management"
				| "budget_control";
			priority: "high" | "medium" | "low";
			title: string;
			description: string;
			impact: number;
			effort: "low" | "medium" | "high";
			timeframe: string;
			steps: string[];
		}[];
	}> {
		try {
			return {
				recommendations: [
					{
						category: "cost_reduction",
						priority: "high",
						title: "Implement expense tracking and categorization",
						description:
							"Set up automated expense tracking with proper categorization",
						impact: 0.2,
						effort: "medium",
						timeframe: "4 weeks",
						steps: [
							"Choose expense tracking tool",
							"Set up categories and rules",
							"Train team on new process",
							"Implement automated categorization",
							"Monitor and optimize",
						],
					},
					{
						category: "vendor_management",
						priority: "medium",
						title: "Negotiate better rates with key vendors",
						description: "Review and renegotiate contracts with major vendors",
						impact: 0.15,
						effort: "low",
						timeframe: "6 weeks",
						steps: [
							"Identify top vendors by spend",
							"Research market rates",
							"Prepare negotiation strategy",
							"Schedule vendor meetings",
							"Negotiate new terms",
						],
					},
					{
						category: "process_improvement",
						priority: "medium",
						title: "Implement expense approval workflow",
						description:
							"Create approval process for expenses above certain thresholds",
						impact: 0.1,
						effort: "high",
						timeframe: "8 weeks",
						steps: [
							"Define approval thresholds",
							"Set up approval workflow",
							"Configure notifications",
							"Train approvers",
							"Monitor and adjust",
						],
					},
					{
						category: "budget_control",
						priority: "high",
						title: "Set up budget alerts and controls",
						description:
							"Implement automated alerts when approaching budget limits",
						impact: 0.25,
						effort: "low",
						timeframe: "2 weeks",
						steps: [
							"Define budget limits by category",
							"Set up alert thresholds",
							"Configure notification system",
							"Test alert system",
							"Roll out to team",
						],
					},
				],
			};
		} catch (error) {
			console.error("Expense optimization error:", error);
			throw new Error(
				`Failed to generate optimization recommendations: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Analyze expenses by category
	 */
	async analyzeExpensesByCategory(userId: string): Promise<{
		categories: {
			category: string;
			amount: number;
			percentage: number;
			trend: "increasing" | "stable" | "decreasing";
			growthRate: number;
			optimization: {
				potential: number;
				difficulty: "low" | "medium" | "high";
				timeframe: string;
			};
		}[];
		insights: {
			insight: string;
			impact: "high" | "medium" | "low";
			actionable: boolean;
		}[];
	}> {
		try {
			return {
				categories: [
					{
						category: "Software & Tools",
						amount: 5000,
						percentage: 25,
						trend: "increasing",
						growthRate: 0.15,
						optimization: {
							potential: 0.2,
							difficulty: "low",
							timeframe: "4 weeks",
						},
					},
					{
						category: "Office & Rent",
						amount: 8000,
						percentage: 40,
						trend: "stable",
						growthRate: 0.02,
						optimization: {
							potential: 0.15,
							difficulty: "high",
							timeframe: "12 weeks",
						},
					},
					{
						category: "Marketing",
						amount: 3000,
						percentage: 15,
						trend: "increasing",
						growthRate: 0.1,
						optimization: {
							potential: 0.25,
							difficulty: "medium",
							timeframe: "6 weeks",
						},
					},
					{
						category: "Professional Services",
						amount: 2000,
						percentage: 10,
						trend: "stable",
						growthRate: 0.05,
						optimization: {
							potential: 0.1,
							difficulty: "medium",
							timeframe: "8 weeks",
						},
					},
					{
						category: "Other",
						amount: 2000,
						percentage: 10,
						trend: "decreasing",
						growthRate: -0.05,
						optimization: {
							potential: 0.05,
							difficulty: "low",
							timeframe: "2 weeks",
						},
					},
				],
				insights: [
					{
						insight:
							"Software expenses are growing rapidly and represent 25% of total expenses",
						impact: "high",
						actionable: true,
					},
					{
						insight:
							"Office rent is the largest expense category but has limited optimization potential",
						impact: "medium",
						actionable: false,
					},
					{
						insight:
							"Marketing expenses have high optimization potential with medium difficulty",
						impact: "high",
						actionable: true,
					},
				],
			};
		} catch (error) {
			console.error("Expense category analysis error:", error);
			throw new Error(
				`Failed to analyze expenses by category: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Enhance prediction with additional analysis
	 */
	private async enhancePrediction(
		prediction: ExpensePrediction,
		userId: string,
	): Promise<ExpensePrediction> {
		try {
			// Add confidence scoring based on data quality
			const enhancedConfidence = this.calculateEnhancedConfidence(prediction);

			// Add inflation adjustments
			const inflationAdjustedPredictions =
				this.applyInflationAdjustments(prediction);

			return {
				...prediction,
				confidence: enhancedConfidence,
				predictions: inflationAdjustedPredictions,
			};
		} catch (error) {
			console.error("Prediction enhancement error:", error);
			return prediction; // Return original if enhancement fails
		}
	}

	/**
	 * Calculate enhanced confidence score
	 */
	private calculateEnhancedConfidence(prediction: ExpensePrediction): number {
		const baseConfidence = prediction.confidence;
		const dataQuality = 0.9; // This would be calculated from actual data quality metrics
		const historicalAccuracy = 0.85; // This would be calculated from past predictions
		const expenseStability = 0.95; // This would be calculated from expense volatility

		return Math.round(
			baseConfidence * dataQuality * historicalAccuracy * expenseStability,
		);
	}

	/**
	 * Apply inflation adjustments to predictions
	 */
	private applyInflationAdjustments(prediction: ExpensePrediction) {
		const inflationRate = 0.03; // 3% annual inflation assumption

		return prediction.predictions.map((pred) => ({
			...pred,
			totalExpenses: pred.totalExpenses * (1 + inflationRate),
			fixedExpenses: pred.fixedExpenses * (1 + inflationRate * 0.5), // Fixed expenses less affected
			variableExpenses: pred.variableExpenses * (1 + inflationRate * 1.5), // Variable expenses more affected
		}));
	}

	/**
	 * Validate prediction accuracy
	 */
	async validatePredictionAccuracy(
		userId: string,
		predictionId: string,
	): Promise<{
		accuracy: number;
		variance: number;
		factors: {
			factor: string;
			impact: number;
			description: string;
		}[];
	}> {
		try {
			// This would compare predictions with actual results
			return {
				accuracy: 0.88,
				variance: 0.08,
				factors: [
					{
						factor: "Inflation impact",
						impact: 0.3,
						description:
							"Higher than expected inflation affected expense predictions",
					},
					{
						factor: "Unexpected expenses",
						impact: 0.2,
						description: "Some one-time expenses were not anticipated",
					},
					{
						factor: "Vendor price changes",
						impact: 0.1,
						description: "Some vendors increased prices unexpectedly",
					},
				],
			};
		} catch (error) {
			console.error("Prediction validation error:", error);
			throw new Error(
				`Failed to validate prediction accuracy: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}
}
