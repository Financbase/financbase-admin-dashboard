import {} from "lucide-react";
import { FinancialHealthService } from "../financial-health-service";
import type { AIRecommendation } from "./ai-types";
import { CashFlowPredictor } from "./cash-flow-predictor";
import { ExpensePredictor } from "./expense-predictor";
import { ProfitabilityPredictor } from "./profitability-predictor";
import { RevenuePredictor } from "./revenue-predictor";

export class RecommendationEngine {
	private healthService: FinancialHealthService;
	private cashFlowPredictor: CashFlowPredictor;
	private revenuePredictor: RevenuePredictor;
	private expensePredictor: ExpensePredictor;
	private profitabilityPredictor: ProfitabilityPredictor;

	constructor() {
		this.healthService = new FinancialHealthService();
		this.cashFlowPredictor = new CashFlowPredictor();
		this.revenuePredictor = new RevenuePredictor();
		this.expensePredictor = new ExpensePredictor();
		this.profitabilityPredictor = new ProfitabilityPredictor();
	}

	/**
	 * Generate comprehensive AI recommendations for a user
	 */
	async generateRecommendations(userId: string): Promise<AIRecommendation[]> {
		try {
			const [
				healthScore,
				cashFlowRisks,
				revenueOpportunities,
				expenseOptimizations,
				profitabilityImprovements,
			] = await Promise.all([
				this.healthService.calculateFinancialHealthScore(userId),
				this.cashFlowPredictor.identifyCashFlowRisks(userId),
				this.revenuePredictor.identifyGrowthOpportunities(userId),
				this.expensePredictor.identifyOptimizationOpportunities(userId),
				this.profitabilityPredictor.identifyImprovementOpportunities(userId),
			]);

			const recommendations: AIRecommendation[] = [];

			// Critical recommendations based on health score
			if (healthScore.overall < 50) {
				recommendations.push(
					...this.generateCriticalRecommendations(healthScore),
				);
			}

			// Cash flow recommendations
			recommendations.push(
				...this.generateCashFlowRecommendations(cashFlowRisks),
			);

			// Revenue recommendations
			recommendations.push(
				...this.generateRevenueRecommendations(revenueOpportunities),
			);

			// Expense recommendations
			recommendations.push(
				...this.generateExpenseRecommendations(expenseOptimizations),
			);

			// Profitability recommendations
			recommendations.push(
				...this.generateProfitabilityRecommendations(profitabilityImprovements),
			);

			// Sort by priority and impact
			return this.prioritizeRecommendations(recommendations);
		} catch (error) {
			console.error("Recommendation generation error:", error);
			throw new Error(
				`Failed to generate recommendations: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Generate recommendations for a specific category
	 */
	async generateCategoryRecommendations(
		userId: string,
		category:
			| "cash_flow"
			| "revenue"
			| "expenses"
			| "profitability"
			| "budget"
			| "investment",
	): Promise<AIRecommendation[]> {
		try {
			switch (category) {
				case "cash_flow": {
					const cashFlowRisks =
						await this.cashFlowPredictor.identifyCashFlowRisks(userId);
					return this.generateCashFlowRecommendations(cashFlowRisks);
				}

				case "revenue": {
					const revenueOpportunities =
						await this.revenuePredictor.identifyGrowthOpportunities(userId);
					return this.generateRevenueRecommendations(revenueOpportunities);
				}

				case "expenses": {
					const expenseOptimizations =
						await this.expensePredictor.identifyOptimizationOpportunities(
							userId,
						);
					return this.generateExpenseRecommendations(expenseOptimizations);
				}

				case "profitability": {
					const profitabilityImprovements =
						await this.profitabilityPredictor.identifyImprovementOpportunities(
							userId,
						);
					return this.generateProfitabilityRecommendations(
						profitabilityImprovements,
					);
				}

				case "budget":
					return this.generateBudgetRecommendations(userId);

				case "investment":
					return this.generateInvestmentRecommendations(userId);

				default:
					return [];
			}
		} catch (error) {
			console.error("Category recommendation generation error:", error);
			throw new Error(
				`Failed to generate category recommendations: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Generate urgent recommendations that require immediate attention
	 */
	async generateUrgentRecommendations(
		userId: string,
	): Promise<AIRecommendation[]> {
		try {
			const healthScore =
				await this.healthService.calculateFinancialHealthScore(userId);
			const recommendations: AIRecommendation[] = [];

			// Check for critical financial health issues
			if (healthScore.overall < 30) {
				recommendations.push({
					id: crypto.randomUUID(),
					type: "critical",
					title: "Critical Financial Health Alert",
					description:
						"Your financial health score is critically low. Immediate action is required to prevent financial distress.",
					impact: "high",
					effort: "high",
					timeframe: "1 week",
					potentialSavings: 0,
					potentialRevenue: 0,
					confidence: 95,
					actionable: true,
					steps: [
						{
							step: 1,
							action: "Emergency expense review",
							description:
								"Identify and eliminate all non-essential expenses immediately",
							estimatedTime: "2 hours",
						},
						{
							step: 2,
							action: "Revenue acceleration",
							description: "Focus on immediate revenue-generating activities",
							estimatedTime: "1 day",
						},
						{
							step: 3,
							action: "Professional consultation",
							description: "Seek professional financial advice",
							estimatedTime: "2 hours",
						},
					],
					relatedMetrics: [
						"financial_health_score",
						"cash_flow",
						"profitability",
					],
					createdAt: new Date(),
				});
			}

			// Check for cash flow issues
			if (healthScore.cashFlow < 40) {
				recommendations.push({
					id: crypto.randomUUID(),
					type: "critical",
					title: "Cash Flow Crisis",
					description:
						"Your cash flow is critically low. Immediate action needed to improve liquidity.",
					impact: "high",
					effort: "medium",
					timeframe: "3 days",
					potentialSavings: 5000,
					potentialRevenue: 10000,
					confidence: 90,
					actionable: true,
					steps: [
						{
							step: 1,
							action: "Accelerate receivables",
							description: "Follow up on outstanding invoices immediately",
							estimatedTime: "4 hours",
						},
						{
							step: 2,
							action: "Defer non-essential payments",
							description: "Negotiate payment extensions with vendors",
							estimatedTime: "2 hours",
						},
						{
							step: 3,
							action: "Emergency revenue generation",
							description: "Identify quick revenue opportunities",
							estimatedTime: "1 day",
						},
					],
					relatedMetrics: ["cash_flow", "accounts_receivable", "liquidity"],
					createdAt: new Date(),
				});
			}

			return recommendations;
		} catch (error) {
			console.error("Urgent recommendation generation error:", error);
			throw new Error(
				`Failed to generate urgent recommendations: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	// Private helper methods

	private generateCriticalRecommendations(
		healthScore: any,
	): AIRecommendation[] {
		const recommendations: AIRecommendation[] = [];

		if (healthScore.cashFlow < 50) {
			recommendations.push({
				id: crypto.randomUUID(),
				type: "critical",
				title: "Improve Cash Flow Management",
				description:
					"Your cash flow score is low. Implement immediate cash flow improvements.",
				impact: "high",
				effort: "medium",
				timeframe: "2 weeks",
				potentialSavings: 10000,
				potentialRevenue: 0,
				confidence: 85,
				actionable: true,
				steps: [
					{
						step: 1,
						action: "Implement cash flow forecasting",
						description: "Set up 90-day cash flow projections",
						estimatedTime: "4 hours",
					},
					{
						step: 2,
						action: "Optimize payment terms",
						description:
							"Negotiate better payment terms with clients and vendors",
						estimatedTime: "8 hours",
					},
					{
						step: 3,
						action: "Build cash reserves",
						description: "Set aside 3 months of expenses as emergency fund",
						estimatedTime: "Ongoing",
					},
				],
				relatedMetrics: ["cash_flow", "liquidity", "financial_stability"],
				createdAt: new Date(),
			});
		}

		return recommendations;
	}

	private generateCashFlowRecommendations(
		cashFlowRisks: Record<string, unknown>,
	): AIRecommendation[] {
		const recommendations: AIRecommendation[] = [];

		(cashFlowRisks.risks as unknown[]).forEach(
			(risk: Record<string, unknown>) => {
				if (risk.severity === "high") {
					recommendations.push({
						id: crypto.randomUUID(),
						type: "risk_mitigation",
						title: `Mitigate ${risk.type.replace("_", " ")} Risk`,
						description: risk.description,
						impact: "high",
						effort: "medium",
						timeframe: "4 weeks",
						potentialSavings: 0,
						potentialRevenue: 0,
						confidence: 80,
						actionable: true,
						steps: (risk.mitigation as string[]).map(
							(action: string, index: number) => ({
								step: index + 1,
								action,
								description: `Implement ${action.toLowerCase()}`,
								estimatedTime: "2 hours",
							}),
						),
						relatedMetrics: ["cash_flow", "risk_management"],
						createdAt: new Date(),
					});
				}
			},
		);

		(cashFlowRisks.opportunities as unknown[]).forEach(
			(opportunity: Record<string, unknown>) => {
				recommendations.push({
					id: crypto.randomUUID(),
					type: "optimization",
					title: `Optimize ${opportunity.type.replace("_", " ")}`,
					description: opportunity.description,
					impact: "medium",
					effort: "low",
					timeframe: opportunity.timeframe,
					potentialSavings: opportunity.potential,
					potentialRevenue: 0,
					confidence: 75,
					actionable: true,
					steps: (opportunity.actions as string[]).map(
						(action: string, index: number) => ({
							step: index + 1,
							action,
							description: `Execute ${action.toLowerCase()}`,
							estimatedTime: "1 hour",
						}),
					),
					relatedMetrics: ["cash_flow", "revenue_optimization"],
					createdAt: new Date(),
				});
			},
		);

		return recommendations;
	}

	private generateRevenueRecommendations(
		revenueOpportunities: Record<string, unknown>,
	): AIRecommendation[] {
		const recommendations: AIRecommendation[] = [];

		(revenueOpportunities.opportunities as unknown[]).forEach(
			(opportunity: Record<string, unknown>) => {
				recommendations.push({
					id: crypto.randomUUID(),
					type: "growth",
					title: opportunity.description,
					description: `Potential revenue increase: $${opportunity.potential.toLocaleString()}`,
					impact: "high",
					effort: opportunity.confidence > 0.8 ? "medium" : "high",
					timeframe: opportunity.timeframe,
					potentialSavings: 0,
					potentialRevenue: opportunity.potential,
					confidence: Math.round(opportunity.confidence * 100),
					actionable: true,
					steps: (opportunity.actions as string[]).map(
						(action: string, index: number) => ({
							step: index + 1,
							action,
							description: `Implement ${action.toLowerCase()}`,
							estimatedTime: "4 hours",
						}),
					),
					relatedMetrics: ["revenue", "growth", "client_acquisition"],
					createdAt: new Date(),
				});
			},
		);

		return recommendations;
	}

	private generateExpenseRecommendations(
		expenseOptimizations: Record<string, unknown>,
	): AIRecommendation[] {
		const recommendations: AIRecommendation[] = [];

		(expenseOptimizations.opportunities as unknown[]).forEach(
			(opportunity: Record<string, unknown>) => {
				recommendations.push({
					id: crypto.randomUUID(),
					type: "optimization",
					title: `Optimize ${opportunity.category} Expenses`,
					description: opportunity.description,
					impact: "medium",
					effort: opportunity.confidence > 0.8 ? "low" : "medium",
					timeframe: opportunity.timeframe,
					potentialSavings: opportunity.potentialSavings,
					potentialRevenue: 0,
					confidence: Math.round(opportunity.confidence * 100),
					actionable: true,
					steps: (opportunity.actions as string[]).map(
						(action: string, index: number) => ({
							step: index + 1,
							action,
							description: `Execute ${action.toLowerCase()}`,
							estimatedTime: "2 hours",
						}),
					),
					relatedMetrics: ["expenses", "cost_optimization", "budget"],
					createdAt: new Date(),
				});
			},
		);

		return recommendations;
	}

	private generateProfitabilityRecommendations(
		profitabilityImprovements: Record<string, unknown>,
	): AIRecommendation[] {
		const recommendations: AIRecommendation[] = [];

		(profitabilityImprovements.opportunities as unknown[]).forEach(
			(opportunity: Record<string, unknown>) => {
				recommendations.push({
					id: crypto.randomUUID(),
					type: "growth",
					title: opportunity.description,
					description: `Potential profit increase: $${opportunity.potential.toLocaleString()}`,
					impact: "high",
					effort: opportunity.confidence > 0.8 ? "medium" : "high",
					timeframe: opportunity.timeframe,
					potentialSavings: 0,
					potentialRevenue: opportunity.potential,
					confidence: Math.round(opportunity.confidence * 100),
					actionable: true,
					steps: (opportunity.actions as string[]).map(
						(action: string, index: number) => ({
							step: index + 1,
							action,
							description: `Implement ${action.toLowerCase()}`,
							estimatedTime: "6 hours",
						}),
					),
					relatedMetrics: ["profitability", "margins", "revenue_optimization"],
					createdAt: new Date(),
				});
			},
		);

		return recommendations;
	}

	private generateBudgetRecommendations(userId: string): AIRecommendation[] {
		return [
			{
				id: crypto.randomUUID(),
				type: "optimization",
				title: "Implement Budget Tracking",
				description:
					"Set up comprehensive budget tracking and monitoring system",
				impact: "medium",
				effort: "low",
				timeframe: "2 weeks",
				potentialSavings: 5000,
				potentialRevenue: 0,
				confidence: 85,
				actionable: true,
				steps: [
					{
						step: 1,
						action: "Define budget categories",
						description: "Create detailed budget categories and limits",
						estimatedTime: "2 hours",
					},
					{
						step: 2,
						action: "Set up tracking system",
						description: "Implement budget tracking and alert system",
						estimatedTime: "4 hours",
					},
					{
						step: 3,
						action: "Monitor and adjust",
						description: "Regular budget review and adjustment process",
						estimatedTime: "1 hour weekly",
					},
				],
				relatedMetrics: ["budget", "expense_control", "financial_planning"],
				createdAt: new Date(),
			},
		];
	}

	private generateInvestmentRecommendations(
		userId: string,
	): AIRecommendation[] {
		return [
			{
				id: crypto.randomUUID(),
				type: "growth",
				title: "Diversify Revenue Streams",
				description:
					"Develop additional revenue streams to reduce dependency on single sources",
				impact: "high",
				effort: "high",
				timeframe: "6 months",
				potentialSavings: 0,
				potentialRevenue: 25000,
				confidence: 70,
				actionable: true,
				steps: [
					{
						step: 1,
						action: "Market research",
						description: "Research new market opportunities",
						estimatedTime: "20 hours",
					},
					{
						step: 2,
						action: "Develop new services",
						description: "Create new service offerings",
						estimatedTime: "40 hours",
					},
					{
						step: 3,
						action: "Launch and market",
						description: "Launch new services and market to existing clients",
						estimatedTime: "60 hours",
					},
				],
				relatedMetrics: [
					"revenue_diversification",
					"growth",
					"risk_management",
				],
				createdAt: new Date(),
			},
		];
	}

	private prioritizeRecommendations(
		recommendations: AIRecommendation[],
	): AIRecommendation[] {
		return recommendations.sort((a, b) => {
			// Priority order: critical > high impact > medium impact > low impact
			const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
			const aPriority =
				priorityOrder[a.type as keyof typeof priorityOrder] || 0;
			const bPriority =
				priorityOrder[b.type as keyof typeof priorityOrder] || 0;

			if (aPriority !== bPriority) {
				return bPriority - aPriority;
			}

			// Then by impact
			const impactOrder = { high: 3, medium: 2, low: 1 };
			const aImpact = impactOrder[a.impact];
			const bImpact = impactOrder[b.impact];

			if (aImpact !== bImpact) {
				return bImpact - aImpact;
			}

			// Finally by confidence
			return b.confidence - a.confidence;
		});
	}
}
