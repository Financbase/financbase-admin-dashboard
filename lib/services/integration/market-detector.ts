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
	adBudgets,
	budgets,
	campaigns,
	clients,
	financialAccounts,
	projects,
	properties,
	timeEntries,
} from "@/lib/db/schemas";
import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import {
	ArrowUp,
	BarChart3,
	Briefcase,
	Clock,
	CreditCard,
	Database,
	DollarSign,
	Filter,
	PiggyBank,
	TrendingDown,
	TrendingUp,
	Workflow,
	XCircle,
} from "lucide-react";

export interface MarketDetectionResult {
	primaryMarket: "startup" | "agency" | "ecommerce" | "real-estate" | "mixed";
	confidence: number;
	indicators: {
		startup: number;
		agency: number;
		ecommerce: number;
		realEstate: number;
	};
	recommendations: string[];
	autoConfigured: boolean;
	detectedAt: Date;
}

export interface UserPatterns {
	// Financial patterns
	totalRevenue: number;
	monthlyRecurringRevenue: number;
	averageTransactionValue: number;
	revenueGrowthRate: number;

	// Business model indicators
	hasRecurringRevenue: boolean;
	hasProjectBasedWork: boolean;
	hasInventory: boolean;
	hasRealEstate: boolean;
	hasAdSpend: boolean;

	// Client/User patterns
	totalClients: number;
	averageClientValue: number;
	clientRetentionRate: number;

	// Operational patterns
	teamSize: number;
	utilizationRate: number;
	geographicSpread: number;

	// Technology patterns
	usesEcommercePlatform: boolean;
	usesProjectManagement: boolean;
	usesAdPlatforms: boolean;
	usesRealEstateTools: boolean;
}

export class MarketDetector {
	private static instance: MarketDetector;

	private constructor() {}

	public static getInstance(): MarketDetector {
		if (!MarketDetector.instance) {
			MarketDetector.instance = new MarketDetector();
		}
		return MarketDetector.instance;
	}

	/**
	 * Analyze user patterns and detect primary market
	 */
	public async detectMarket(userId: string): Promise<MarketDetectionResult> {
		try {
			// Gather user data patterns
			const patterns = await this.analyzeUserPatterns(userId);

			// Calculate market indicators
			const indicators = this.calculateMarketIndicators(patterns);

			// Determine primary market
			const primaryMarket = this.determinePrimaryMarket(indicators);
			const confidence = Math.max(...Object.values(indicators));

			// Generate recommendations
			const recommendations = this.generateRecommendations(
				primaryMarket,
				patterns,
			);

			// Check if auto-configuration is possible
			const autoConfigured = confidence > 0.7;

			const result: MarketDetectionResult = {
				primaryMarket,
				confidence,
				indicators,
				recommendations,
				autoConfigured,
				detectedAt: new Date(),
			};

			// Store detection result
			await this.storeDetectionResult(userId, result);

			return result;
		} catch (error) {
			console.error("Error detecting market:", error);
			throw new Error("Failed to detect market");
		}
	}

	/**
	 * Analyze user patterns from all modules
	 */
	private async analyzeUserPatterns(userId: string): Promise<UserPatterns> {
		const now = new Date();
		const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

		// Get data from all modules
		const [
			accounts,
			budgetData,
			projectsData,
			timeData,
			clientsData,
			propertiesData,
			campaignsData,
			adData,
		] = await Promise.all([
			// Financial accounts
			db
				.select()
				.from(financialAccounts)
				.where(eq(financialAccounts.userId, userId)),

			// Budget data
			db
				.select()
				.from(budgets)
				.where(eq(budgets.userId, userId)),

			// Projects data
			db
				.select()
				.from(projects)
				.where(eq(projects.userId, userId)),

			// Time entries
			db
				.select()
				.from(timeEntries)
				.where(
					and(
						eq(timeEntries.userId, userId),
						gte(timeEntries.date, sixMonthsAgo),
					),
				),

			// Clients
			db
				.select()
				.from(clients)
				.where(eq(clients.userId, userId)),

			// Properties
			db
				.select()
				.from(properties)
				.where(eq(properties.userId, userId)),

			// Campaigns
			db
				.select()
				.from(campaigns)
				.where(eq(campaigns.userId, userId)),

			// Ad budgets
			db
				.select()
				.from(adBudgets)
				.where(
					and(
						eq(adBudgets.userId, userId),
						gte(adBudgets.startDate, sixMonthsAgo),
					),
				),
		]);

		// Calculate financial patterns
		const totalRevenue = projectsData.reduce(
			(sum, project) => sum + Number(project.budget || 0),
			0,
		);
		const monthlyRecurringRevenue = this.calculateMRR(
			projectsData,
			clientsData,
		);
		const averageTransactionValue =
			totalRevenue / Math.max(projectsData.length, 1);
		const revenueGrowthRate = this.calculateGrowthRate(
			projectsData,
			sixMonthsAgo,
		);

		// Calculate business model indicators
		const hasRecurringRevenue = monthlyRecurringRevenue > totalRevenue * 0.3;
		const hasProjectBasedWork = projectsData.length > 0;
		const hasInventory = false; // Would need product/inventory data
		const hasRealEstate = propertiesData.length > 0;
		const hasAdSpend = adData.length > 0;

		// Calculate client patterns
		const totalClients = clientsData.length;
		const averageClientValue =
			totalClients > 0 ? totalRevenue / totalClients : 0;
		const clientRetentionRate = this.calculateRetentionRate(
			clientsData,
			projectsData,
		);

		// Calculate operational patterns
		const teamSize = this.estimateTeamSize(timeData);
		const utilizationRate = this.calculateUtilizationRate(timeData);
		const geographicSpread = this.calculateGeographicSpread(
			propertiesData,
			clientsData,
		);

		// Calculate technology patterns
		const usesEcommercePlatform = hasInventory;
		const usesProjectManagement = projectsData.length > 0;
		const usesAdPlatforms = campaignsData.length > 0;
		const usesRealEstateTools = propertiesData.length > 0;

		return {
			totalRevenue,
			monthlyRecurringRevenue,
			averageTransactionValue,
			revenueGrowthRate,
			hasRecurringRevenue,
			hasProjectBasedWork,
			hasInventory,
			hasRealEstate,
			hasAdSpend,
			totalClients,
			averageClientValue,
			clientRetentionRate,
			teamSize,
			utilizationRate,
			geographicSpread,
			usesEcommercePlatform,
			usesProjectManagement,
			usesAdPlatforms,
			usesRealEstateTools,
		};
	}

	/**
	 * Calculate market indicators based on patterns
	 */
	private calculateMarketIndicators(
		patterns: UserPatterns,
	): Record<string, number> {
		const indicators = {
			startup: 0,
			agency: 0,
			ecommerce: 0,
			realEstate: 0,
		};

		// Startup indicators
		if (patterns.hasRecurringRevenue && patterns.revenueGrowthRate > 20)
			indicators.startup += 0.3;
		if (patterns.averageTransactionValue < 1000) indicators.startup += 0.2;
		if (patterns.teamSize < 10) indicators.startup += 0.2;
		if (patterns.hasAdSpend && patterns.totalRevenue < 100000)
			indicators.startup += 0.3;

		// Agency indicators
		if (patterns.hasProjectBasedWork && patterns.totalClients > 3)
			indicators.agency += 0.3;
		if (patterns.averageClientValue > 5000) indicators.agency += 0.2;
		if (patterns.utilizationRate > 60) indicators.agency += 0.2;
		if (patterns.clientRetentionRate > 70) indicators.agency += 0.3;

		// E-commerce indicators
		if (patterns.hasInventory) indicators.ecommerce += 0.4;
		if (patterns.averageTransactionValue < 200) indicators.ecommerce += 0.3;
		if (patterns.geographicSpread > 3) indicators.ecommerce += 0.2;
		if (patterns.usesEcommercePlatform) indicators.ecommerce += 0.1;

		// Real Estate indicators
		if (patterns.hasRealEstate) indicators.realEstate += 0.4;
		if (patterns.averageTransactionValue > 10000) indicators.realEstate += 0.3;
		if (patterns.geographicSpread > 1) indicators.realEstate += 0.2;
		if (patterns.usesRealEstateTools) indicators.realEstate += 0.1;

		return indicators;
	}

	/**
	 * Determine primary market from indicators
	 */
	private determinePrimaryMarket(
		indicators: Record<string, number>,
	): "startup" | "agency" | "ecommerce" | "real-estate" | "mixed" {
		const maxScore = Math.max(...Object.values(indicators));
		const maxMarkets = Object.entries(indicators)
			.filter(([_, score]) => score === maxScore)
			.map(([market, _]) => market);

		if (maxMarkets.length > 1 || maxScore < 0.5) {
			return "mixed";
		}

		return maxMarkets[0] as "startup" | "agency" | "ecommerce" | "real-estate";
	}

	/**
	 * Generate market-specific recommendations
	 */
	private generateRecommendations(
		primaryMarket: string,
		patterns: UserPatterns,
	): string[] {
		const recommendations: string[] = [];

		switch (primaryMarket) {
			case "startup":
				recommendations.push(
					"Enable burn rate monitoring and runway calculations",
				);
				recommendations.push("Set up unit economics tracking (LTV/CAC)");
				recommendations.push("Configure investor reporting automation");
				if (patterns.hasRecurringRevenue) {
					recommendations.push("Track MRR growth and churn metrics");
				}
				break;

			case "agency":
				recommendations.push("Enable client profitability dashboards");
				recommendations.push("Set up resource utilization tracking");
				recommendations.push("Configure billing efficiency monitoring");
				if (patterns.totalClients > 5) {
					recommendations.push("Implement capacity planning tools");
				}
				break;

			case "ecommerce":
				recommendations.push("Enable inventory finance tracking");
				recommendations.push("Set up product profitability analysis");
				recommendations.push("Configure payment optimization");
				if (patterns.geographicSpread > 1) {
					recommendations.push("Enable multi-state tax automation");
				}
				break;

			case "real-estate":
				recommendations.push("Enable property portfolio analytics");
				recommendations.push("Set up rental income tracking");
				recommendations.push("Configure property expense management");
				if (patterns.geographicSpread > 1) {
					recommendations.push("Enable multi-market analysis");
				}
				break;

			case "mixed":
				recommendations.push("Enable cross-module financial intelligence");
				recommendations.push("Set up unified revenue attribution");
				recommendations.push("Configure comprehensive expense tracking");
				recommendations.push("Enable market-specific feature toggles");
				break;
		}

		return recommendations;
	}

	/**
	 * Store detection result in database
	 */
	private async storeDetectionResult(
		userId: string,
		result: MarketDetectionResult,
	): Promise<void> {
		// This would store in the market_detection_results table
		// For now, just log the result
		console.log("Market detection result stored:", {
			userId,
			primaryMarket: result.primaryMarket,
			confidence: result.confidence,
			autoConfigured: result.autoConfigured,
		});
	}

	// Helper methods
	private calculateMRR(projects: any[], clients: any[]): number {
		// Simplified MRR calculation
		const recurringProjects = projects.filter(
			(p) => p.status === "active" && p.billingType === "recurring",
		);
		return recurringProjects.reduce(
			(sum, project) => sum + Number(project.budget || 0),
			0,
		);
	}

	private calculateGrowthRate(projects: any[], startDate: Date): number {
		// Simplified growth calculation
		const recentProjects = projects.filter(
			(p) => new Date(p.createdAt) >= startDate,
		);
		const olderProjects = projects.filter(
			(p) => new Date(p.createdAt) < startDate,
		);

		const recentRevenue = recentProjects.reduce(
			(sum, p) => sum + Number(p.budget || 0),
			0,
		);
		const olderRevenue = olderProjects.reduce(
			(sum, p) => sum + Number(p.budget || 0),
			0,
		);

		if (olderRevenue === 0) return 0;
		return ((recentRevenue - olderRevenue) / olderRevenue) * 100;
	}

	private calculateRetentionRate(clients: any[], projects: any[]): number {
		// Simplified retention calculation
		const activeClients = clients.filter((c) => c.status === "active").length;
		const totalClients = clients.length;
		return totalClients > 0 ? (activeClients / totalClients) * 100 : 0;
	}

	private estimateTeamSize(timeEntries: any[]): number {
		// Estimate team size from unique users in time entries
		const uniqueUsers = new Set(timeEntries.map((entry) => entry.userId)).size;
		return Math.max(uniqueUsers, 1);
	}

	private calculateUtilizationRate(timeEntries: any[]): number {
		// Simplified utilization calculation
		const totalHours = timeEntries.reduce(
			(sum, entry) => sum + Number(entry.hours || 0),
			0,
		);
		const billableHours = timeEntries
			.filter((entry) => entry.billable)
			.reduce((sum, entry) => sum + Number(entry.hours || 0), 0);

		return totalHours > 0 ? (billableHours / totalHours) * 100 : 0;
	}

	private calculateGeographicSpread(properties: any[], clients: any[]): number {
		// Count unique locations
		const locations = new Set([
			...properties.map((p) => p.location).filter(Boolean),
			...clients.map((c) => c.location).filter(Boolean),
		]);
		return locations.size;
	}
}

// Export singleton instance
export const marketDetector = MarketDetector.getInstance();
