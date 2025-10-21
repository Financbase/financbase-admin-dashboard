import { db } from "@/lib/db";
import { getAdboardCampaignStats } from "@/lib/services/adboard-campaign-service";
import { getFreelanceProjectStats } from "@/lib/services/freelance-project-service";
import { getPropertyStats } from "@/lib/services/property-service";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import {} from "lucide-react";

export interface UnifiedAnalytics {
	// Financial Overview
	totalRevenue: number;
	totalExpenses: number;
	netIncome: number;
	profitMargin: number;

	// Module Breakdown
	freelance: {
		totalProjects: number;
		activeProjects: number;
		completedProjects: number;
		totalBudget: number;
		totalSpent: number;
		totalRevenue: number;
		averageROI: number;
	};

	realEstate: {
		totalProperties: number;
		activeProperties: number;
		totalValue: number;
		monthlyRentalIncome: number;
		totalExpenses: number;
		netRentalIncome: number;
		averageCapRate: number;
	};

	adboard: {
		totalCampaigns: number;
		activeCampaigns: number;
		totalBudget: number;
		totalSpent: number;
		totalRevenue: number;
		averageRoas: number;
		topPerformingPlatform: string;
	};

	// Cross-Module Insights
	topPerformingModule: string;
	revenueDistribution: {
		freelance: number;
		realEstate: number;
		adboard: number;
	};

	// Growth Metrics
	revenueGrowth: number;
	expenseGrowth: number;
	profitGrowth: number;

	// Performance Trends
	monthlyTrends: {
		month: string;
		revenue: number;
		expenses: number;
		profit: number;
	}[];
}

/**
 * Get unified analytics across all modules
 */
export async function getUnifiedAnalytics(
	userId: string,
	startDate?: Date,
	endDate?: Date,
): Promise<UnifiedAnalytics> {
	try {
		// Get stats from each module
		const [freelanceStats, realEstateStats, adboardStats] = await Promise.all([
			getFreelanceProjectStats(userId, startDate, endDate),
			getPropertyStats(userId, startDate, endDate),
			getAdboardCampaignStats(userId, startDate, endDate),
		]);

		// Calculate totals
		const totalRevenue =
			freelanceStats.totalRevenue +
			realEstateStats.totalRentalIncome +
			adboardStats.totalRevenue;
		const totalExpenses =
			freelanceStats.totalSpent +
			realEstateStats.totalExpenses +
			adboardStats.totalSpent;
		const netIncome = totalRevenue - totalExpenses;
		const profitMargin =
			totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

		// Determine top performing module
		const moduleRevenues = [
			{ name: "freelance", revenue: freelanceStats.totalRevenue },
			{ name: "realEstate", revenue: realEstateStats.totalRentalIncome },
			{ name: "adboard", revenue: adboardStats.totalRevenue },
		];
		const topPerformingModule = moduleRevenues.reduce((prev, current) =>
			prev.revenue > current.revenue ? prev : current,
		).name;

		// Calculate revenue distribution
		const revenueDistribution = {
			freelance:
				totalRevenue > 0
					? (freelanceStats.totalRevenue / totalRevenue) * 100
					: 0,
			realEstate:
				totalRevenue > 0
					? (realEstateStats.totalRentalIncome / totalRevenue) * 100
					: 0,
			adboard:
				totalRevenue > 0 ? (adboardStats.totalRevenue / totalRevenue) * 100 : 0,
		};

		// Calculate growth metrics (simplified - would need historical data for accurate calculation)
		const revenueGrowth = 0; // Placeholder - would calculate from historical data
		const expenseGrowth = 0; // Placeholder - would calculate from historical data
		const profitGrowth = 0; // Placeholder - would calculate from historical data

		// Generate monthly trends (simplified - would query actual data)
		const monthlyTrends = generateMonthlyTrends(startDate, endDate);

		return {
			totalRevenue,
			totalExpenses,
			netIncome,
			profitMargin,
			freelance: {
				totalProjects: freelanceStats.totalProjects,
				activeProjects: freelanceStats.activeProjects,
				completedProjects: freelanceStats.completedProjects,
				totalBudget: freelanceStats.totalBudget,
				totalSpent: freelanceStats.totalSpent,
				totalRevenue: freelanceStats.totalRevenue,
				averageROI: freelanceStats.averageROI,
			},
			realEstate: {
				totalProperties: realEstateStats.totalProperties,
				activeProperties: realEstateStats.activeProperties,
				totalValue: realEstateStats.totalValue,
				monthlyRentalIncome: realEstateStats.totalRentalIncome,
				totalExpenses: realEstateStats.totalExpenses,
				netRentalIncome:
					realEstateStats.totalRentalIncome - realEstateStats.totalExpenses,
				averageCapRate: realEstateStats.averageCapRate,
			},
			adboard: {
				totalCampaigns: adboardStats.totalCampaigns,
				activeCampaigns: adboardStats.activeCampaigns,
				totalBudget: adboardStats.totalBudget,
				totalSpent: adboardStats.totalSpent,
				totalRevenue: adboardStats.totalRevenue,
				averageRoas: adboardStats.averageRoas,
				topPerformingPlatform: adboardStats.topPerformingPlatform,
			},
			topPerformingModule,
			revenueDistribution,
			revenueGrowth,
			expenseGrowth,
			profitGrowth,
			monthlyTrends,
		};
	} catch (error) {
		console.error("Error fetching unified analytics:", error);
		throw new Error("Failed to fetch unified analytics");
	}
}

/**
 * Get cross-module performance comparison
 */
export async function getCrossModulePerformance(
	userId: string,
	startDate?: Date,
	endDate?: Date,
): Promise<{
	modules: {
		name: string;
		revenue: number;
		expenses: number;
		profit: number;
		roi: number;
		growth: number;
	}[];
	bestPerforming: string;
	worstPerforming: string;
}> {
	try {
		const [freelanceStats, realEstateStats, adboardStats] = await Promise.all([
			getFreelanceProjectStats(userId, startDate, endDate),
			getPropertyStats(userId, startDate, endDate),
			getAdboardCampaignStats(userId, startDate, endDate),
		]);

		const modules = [
			{
				name: "Freelance",
				revenue: freelanceStats.totalRevenue,
				expenses: freelanceStats.totalSpent,
				profit: freelanceStats.totalRevenue - freelanceStats.totalSpent,
				roi: freelanceStats.averageROI,
				growth: 0, // Placeholder
			},
			{
				name: "Real Estate",
				revenue: realEstateStats.totalRentalIncome,
				expenses: realEstateStats.totalExpenses,
				profit:
					realEstateStats.totalRentalIncome - realEstateStats.totalExpenses,
				roi: realEstateStats.averageCapRate,
				growth: 0, // Placeholder
			},
			{
				name: "Adboard",
				revenue: adboardStats.totalRevenue,
				expenses: adboardStats.totalSpent,
				profit: adboardStats.totalRevenue - adboardStats.totalSpent,
				roi: adboardStats.averageRoas,
				growth: 0, // Placeholder
			},
		];

		const bestPerforming = modules.reduce((prev, current) =>
			prev.roi > current.roi ? prev : current,
		).name;

		const worstPerforming = modules.reduce((prev, current) =>
			prev.roi < current.roi ? prev : current,
		).name;

		return {
			modules,
			bestPerforming,
			worstPerforming,
		};
	} catch (error) {
		console.error("Error fetching cross-module performance:", error);
		throw new Error("Failed to fetch cross-module performance");
	}
}

/**
 * Get financial health score
 */
export async function getFinancialHealthScore(
	userId: string,
	startDate?: Date,
	endDate?: Date,
): Promise<{
	score: number;
	grade: string;
	recommendations: string[];
	metrics: {
		revenueStability: number;
		expenseControl: number;
		profitability: number;
		growth: number;
	};
}> {
	try {
		const analytics = await getUnifiedAnalytics(userId, startDate, endDate);

		// Calculate individual metrics (0-100 scale)
		const revenueStability = Math.min(
			100,
			Math.max(0, analytics.totalRevenue > 0 ? 80 : 0),
		);
		const expenseControl = Math.min(
			100,
			Math.max(0, analytics.profitMargin > 0 ? 90 : 50),
		);
		const profitability = Math.min(100, Math.max(0, analytics.profitMargin));
		const growth = Math.min(100, Math.max(0, analytics.revenueGrowth + 50)); // Placeholder calculation

		// Calculate overall score
		const score = Math.round(
			(revenueStability + expenseControl + profitability + growth) / 4,
		);

		// Determine grade
		let grade: string;
		if (score >= 90) grade = "A+";
		else if (score >= 80) grade = "A";
		else if (score >= 70) grade = "B";
		else if (score >= 60) grade = "C";
		else if (score >= 50) grade = "D";
		else grade = "F";

		// Generate recommendations
		const recommendations: string[] = [];
		if (analytics.profitMargin < 10) {
			recommendations.push(
				"Consider optimizing expenses to improve profit margins",
			);
		}
		if (analytics.revenueDistribution.freelance < 30) {
			recommendations.push(
				"Explore expanding freelance projects for revenue diversification",
			);
		}
		if (analytics.revenueDistribution.realEstate < 20) {
			recommendations.push(
				"Consider real estate investments for passive income",
			);
		}
		if (analytics.revenueDistribution.adboard < 10) {
			recommendations.push("Invest in advertising campaigns to drive growth");
		}

		return {
			score,
			grade,
			recommendations,
			metrics: {
				revenueStability,
				expenseControl,
				profitability,
				growth,
			},
		};
	} catch (error) {
		console.error("Error calculating financial health score:", error);
		throw new Error("Failed to calculate financial health score");
	}
}

/**
 * Generate monthly trends data (simplified)
 */
function generateMonthlyTrends(startDate?: Date, endDate?: Date) {
	const trends = [];
	const months = 6; // Last 6 months

	for (let i = months - 1; i >= 0; i--) {
		const date = new Date();
		date.setMonth(date.getMonth() - i);

		trends.push({
			month: date.toLocaleDateString("en-US", {
				month: "short",
				year: "numeric",
			}),
			revenue: Math.random() * 10000 + 5000, // Mock data
			expenses: Math.random() * 8000 + 3000, // Mock data
			profit: Math.random() * 5000 + 1000, // Mock data
		});
	}

	return trends;
}
