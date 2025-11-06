/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from "@/lib/db";
import { getAdboardCampaignStats } from "@/lib/services/adboard-campaign-service";
import { getFreelanceProjectStats } from "@/lib/services/freelance-project-service";
import { getPropertyStats } from "@/lib/services/property-service";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { invoices } from "@/lib/db/schemas/invoices.schema";
import { expenses } from "@/lib/db/schemas/expenses.schema";
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

		// Calculate growth metrics by comparing current period with previous period
		const periodDays = endDate && startDate
			? Math.floor((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
			: 30; // Default to 30 days
		
		const prevStartDate = startDate
			? new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000)
			: new Date(Date.now() - periodDays * 2 * 24 * 60 * 60 * 1000);
		const prevEndDate = startDate || new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

		// Get previous period revenue
		const prevRevenueResult = await db.execute(sql`
			SELECT COALESCE(SUM(total::numeric), 0) as total_revenue
			FROM financbase_invoices
			WHERE user_id = ${userId} 
				AND status = 'paid' 
				AND paid_date >= ${prevStartDate}
				AND paid_date < ${prevEndDate}
		`);
		const prevRevenue = Number(prevRevenueResult.rows[0]?.total_revenue || 0);

		// Get previous period expenses
		const prevExpenseResult = await db.execute(sql`
			SELECT COALESCE(SUM(amount::numeric), 0) as total_expenses
			FROM financbase_expenses
			WHERE user_id = ${userId}
				AND date >= ${prevStartDate}
				AND date < ${prevEndDate}
		`);
		const prevExpenses = Number(prevExpenseResult.rows[0]?.total_expenses || 0);

		// Calculate growth percentages
		const revenueGrowth = prevRevenue > 0 
			? ((totalRevenue - prevRevenue) / prevRevenue) * 100 
			: totalRevenue > 0 ? 100 : 0;
		
		const expenseGrowth = prevExpenses > 0
			? ((totalExpenses - prevExpenses) / prevExpenses) * 100
			: totalExpenses > 0 ? 100 : 0;
		
		const prevProfit = prevRevenue - prevExpenses;
		const profitGrowth = prevProfit !== 0
			? ((netIncome - prevProfit) / Math.abs(prevProfit)) * 100
			: netIncome > 0 ? 100 : 0;

		// Generate monthly trends from real database queries
		const monthlyTrends = await generateMonthlyTrends(userId, startDate, endDate);

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

		// Helper function to calculate module growth by comparing with previous period
		const calculateModuleGrowth = async (
			currentRevenue: number,
			moduleType: 'freelance' | 'realEstate' | 'adboard'
		): Promise<number> => {
			if (!startDate || !endDate) return 0;

			const periodDays = Math.floor((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
			const prevStartDate = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000);
			const prevEndDate = startDate;

			try {
				let prevRevenue = 0;
				
				// Query previous period revenue based on module type
				// Note: This is a simplified approach - in production, you'd query specific tables
				// For now, we'll estimate based on invoice data or use module-specific queries
				if (moduleType === 'freelance') {
					// Would query freelance projects table
					prevRevenue = 0; // Placeholder - would need freelance_projects table
				} else if (moduleType === 'realEstate') {
					// Would query property rentals table
					prevRevenue = 0; // Placeholder - would need property_rentals table
				} else if (moduleType === 'adboard') {
					// Would query ad campaigns table
					prevRevenue = 0; // Placeholder - would need ad_campaigns table
				}

				return prevRevenue > 0 
					? ((currentRevenue - prevRevenue) / prevRevenue) * 100
					: currentRevenue > 0 ? 100 : 0;
			} catch (error) {
				console.error(`Error calculating ${moduleType} growth:`, error);
				return 0;
			}
		};

		// Calculate growth for each module
		const [freelanceGrowth, realEstateGrowth, adboardGrowth] = await Promise.all([
			calculateModuleGrowth(freelanceStats.totalRevenue, 'freelance'),
			calculateModuleGrowth(realEstateStats.totalRentalIncome, 'realEstate'),
			calculateModuleGrowth(adboardStats.totalRevenue, 'adboard'),
		]);

		const modules = [
			{
				name: "Freelance",
				revenue: freelanceStats.totalRevenue,
				expenses: freelanceStats.totalSpent,
				profit: freelanceStats.totalRevenue - freelanceStats.totalSpent,
				roi: freelanceStats.averageROI,
				growth: freelanceGrowth,
			},
			{
				name: "Real Estate",
				revenue: realEstateStats.totalRentalIncome,
				expenses: realEstateStats.totalExpenses,
				profit:
					realEstateStats.totalRentalIncome - realEstateStats.totalExpenses,
				roi: realEstateStats.averageCapRate,
				growth: realEstateGrowth,
			},
			{
				name: "Adboard",
				revenue: adboardStats.totalRevenue,
				expenses: adboardStats.totalSpent,
				profit: adboardStats.totalRevenue - adboardStats.totalSpent,
				roi: adboardStats.averageRoas,
				growth: adboardGrowth,
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
		// Calculate growth metric based on actual revenue growth
		const growth = Math.min(100, Math.max(-100, analytics.revenueGrowth));

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
 * Generate monthly trends data from real database queries
 */
async function generateMonthlyTrends(
	userId: string,
	startDate?: Date,
	endDate?: Date
): Promise<{
	month: string;
	revenue: number;
	expenses: number;
	profit: number;
}[]> {
	try {
		// Default to last 6 months if no dates provided
		const end = endDate || new Date();
		const start = startDate || new Date();
		start.setMonth(start.getMonth() - 6);

		// Query monthly revenue from invoices
		const revenueResult = await db.execute(sql`
			SELECT 
				TO_CHAR(paid_date, 'YYYY-MM') as month,
				COALESCE(SUM(total::numeric), 0) as revenue
			FROM financbase_invoices
			WHERE user_id = ${userId}
				AND status = 'paid'
				AND paid_date >= ${start}
				AND paid_date <= ${end}
			GROUP BY TO_CHAR(paid_date, 'YYYY-MM')
			ORDER BY month ASC
		`);

		// Query monthly expenses
		const expenseResult = await db.execute(sql`
			SELECT 
				TO_CHAR(date, 'YYYY-MM') as month,
				COALESCE(SUM(amount::numeric), 0) as expenses
			FROM financbase_expenses
			WHERE user_id = ${userId}
				AND date >= ${start}
				AND date <= ${end}
			GROUP BY TO_CHAR(date, 'YYYY-MM')
			ORDER BY month ASC
		`);

		// Create a map of months to combine revenue and expenses
		const trendsMap = new Map<string, { revenue: number; expenses: number }>();

		// Add revenue data
		for (const row of revenueResult.rows as any[]) {
			const month = row.month;
			trendsMap.set(month, {
				revenue: Number(row.revenue || 0),
				expenses: trendsMap.get(month)?.expenses || 0,
			});
		}

		// Add expense data
		for (const row of expenseResult.rows as any[]) {
			const month = row.month;
			trendsMap.set(month, {
				revenue: trendsMap.get(month)?.revenue || 0,
				expenses: Number(row.expenses || 0),
			});
		}

		// Convert map to array and format
		const trends = Array.from(trendsMap.entries()).map(([monthStr, data]) => {
			const [year, month] = monthStr.split('-');
			const date = new Date(parseInt(year), parseInt(month) - 1);
			
			return {
				month: date.toLocaleDateString("en-US", {
					month: "short",
					year: "numeric",
				}),
				revenue: Math.round(data.revenue),
				expenses: Math.round(data.expenses),
				profit: Math.round(data.revenue - data.expenses),
			};
		});

		return trends;
	} catch (error) {
		console.error('Error generating monthly trends:', error);
		// Return empty array on error
		return [];
	}
}
