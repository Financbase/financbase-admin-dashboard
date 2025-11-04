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
	financialAlerts,
	financialHealthScores,
	financialIntelligenceMetrics,
	modulePerformanceSnapshots,
} from "@/lib/db/schemas/financial-intelligence.schema";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import {} from "lucide-react";

export interface AggregatedMetrics {
	totalRevenue: number;
	totalExpenses: number;
	netIncome: number;
	profitMargin: number;
	cashFlow: number;
	monthlyGrowth: number;
	expenseRatio: number;
	healthScore: number;
	moduleBreakdown: ModuleBreakdown[];
}

export interface ModuleBreakdown {
	module: string;
	revenue: number;
	expenses: number;
	profit: number;
	roi: number;
	growth: number;
	efficiency: number;
	marketShare: number;
}

export interface TimeSeriesData {
	date: string;
	revenue: number;
	expenses: number;
	profit: number;
	roi: number;
}

export class FinancialAggregator {
	private static instance: FinancialAggregator;
	private cache: Map<string, AggregatedMetrics> = new Map();
	private cacheExpiry: Map<string, number> = new Map();
	private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

	static getInstance(): FinancialAggregator {
		if (!FinancialAggregator.instance) {
			FinancialAggregator.instance = new FinancialAggregator();
		}
		return FinancialAggregator.instance;
	}

	/**
	 * Get aggregated financial metrics for user
	 */
	async getAggregatedMetrics(
		userId: string,
		startDate?: Date,
		endDate?: Date,
	): Promise<AggregatedMetrics> {
		const cacheKey = `metrics_${userId}_${startDate?.toISOString()}_${endDate?.toISOString()}`;

		// Check cache first
		if (this.isCacheValid(cacheKey)) {
			const cached = this.cache.get(cacheKey);
			if (cached) {
				return cached;
			}
		}

		try {
			const dateFilter = this.buildDateFilter(startDate, endDate);

			// Get module performance data
			const moduleData = await db
				.select()
				.from(modulePerformanceSnapshots)
				.where(
					and(eq(modulePerformanceSnapshots.userId, userId), ...dateFilter),
				);

			// Calculate totals
			const totalRevenue = moduleData.reduce(
				(sum, module) => sum + Number.parseFloat(module.revenue || "0"),
				0,
			);
			const totalExpenses = moduleData.reduce(
				(sum, module) => sum + Number.parseFloat(module.expenses || "0"),
				0,
			);
			const netIncome = totalRevenue - totalExpenses;
			const profitMargin =
				totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;
			const expenseRatio =
				totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;

			// Calculate growth (simplified - would need historical data for accurate calculation)
			const monthlyGrowth = await this.calculateGrowth(
				userId,
				startDate,
				endDate,
			);

			// Get health score
			const healthScore = await this.getHealthScore(userId);

			// Build module breakdown
			const moduleBreakdown = this.buildModuleBreakdown(
				moduleData,
				totalRevenue,
			);

			const metrics: AggregatedMetrics = {
				totalRevenue,
				totalExpenses,
				netIncome,
				profitMargin,
				cashFlow: netIncome, // Simplified - would need actual cash flow calculation
				monthlyGrowth,
				expenseRatio,
				healthScore,
				moduleBreakdown,
			};

			// Cache the result
			this.cache.set(cacheKey, metrics);
			this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);

			return metrics;
		} catch (error) {
			console.error("Error getting aggregated metrics:", error);
			throw error;
		}
	}

	/**
	 * Get time series data for charts
	 */
	async getTimeSeriesData(
		userId: string,
		module?: string,
		startDate?: Date,
		endDate?: Date,
	): Promise<TimeSeriesData[]> {
		try {
			const dateFilter = this.buildDateFilter(startDate, endDate);
			let query = db
				.select()
				.from(modulePerformanceSnapshots)
				.where(
					and(
						eq(modulePerformanceSnapshots.userId, userId),
						eq(modulePerformanceSnapshots.snapshotType, "daily"),
						...dateFilter,
					),
				)
				.orderBy(modulePerformanceSnapshots.snapshotDate);

			if (module) {
				query = query.where(eq(modulePerformanceSnapshots.module, module));
			}

			const snapshots = await query;

			// Group by date and aggregate
			const groupedData = new Map<
				string,
				{
					revenue: number;
					expenses: number;
					profit: number;
					roi: number;
				}
			>();

			snapshots.forEach((snapshot) => {
				const date = snapshot.snapshotDate.toISOString().split("T")[0];
				const existing = groupedData.get(date) || {
					revenue: 0,
					expenses: 0,
					profit: 0,
					roi: 0,
				};

				existing.revenue += Number.parseFloat(snapshot.revenue || "0");
				existing.expenses += Number.parseFloat(snapshot.expenses || "0");
				existing.profit += Number.parseFloat(snapshot.profit || "0");
				existing.roi =
					existing.expenses > 0
						? (existing.profit / existing.expenses) * 100
						: 0;

				groupedData.set(date, existing);
			});

			return Array.from(groupedData.entries()).map(([date, data]) => ({
				date,
				revenue: data.revenue,
				expenses: data.expenses,
				profit: data.profit,
				roi: data.roi,
			}));
		} catch (error) {
			console.error("Error getting time series data:", error);
			throw error;
		}
	}

	/**
	 * Get module performance comparison
	 */
	async getModuleComparison(
		userId: string,
		startDate?: Date,
		endDate?: Date,
	): Promise<ModuleBreakdown[]> {
		try {
			const dateFilter = this.buildDateFilter(startDate, endDate);

			const moduleData = await db
				.select()
				.from(modulePerformanceSnapshots)
				.where(
					and(eq(modulePerformanceSnapshots.userId, userId), ...dateFilter),
				);

			return this.buildModuleBreakdown(moduleData, 0);
		} catch (error) {
			console.error("Error getting module comparison:", error);
			throw error;
		}
	}

	/**
	 * Get financial health score
	 */
	async getHealthScore(userId: string): Promise<number> {
		try {
			const latestHealthScore = await db
				.select()
				.from(financialHealthScores)
				.where(eq(financialHealthScores.userId, userId))
				.orderBy(desc(financialHealthScores.analysisDate))
				.limit(1);

			if (latestHealthScore.length > 0) {
				return Number.parseFloat(latestHealthScore[0].overallScore || "0");
			}

			// Calculate basic health score if no stored score
			return await this.calculateBasicHealthScore(userId);
		} catch (error) {
			console.error("Error getting health score:", error);
			return 50; // Default neutral score
		}
	}

	/**
	 * Calculate growth percentage
	 */
	private async calculateGrowth(
		userId: string,
		startDate?: Date,
		endDate?: Date,
	): Promise<number> {
		try {
			// This is a simplified calculation
			// In a real implementation, you'd compare current period with previous period
			const currentPeriod = await this.getAggregatedMetrics(
				userId,
				startDate,
				endDate,
			);

			// For demo purposes, return a mock growth value
			// In reality, you'd compare with previous period data
			return 12.5; // Mock 12.5% growth
		} catch (error) {
			console.error("Error calculating growth:", error);
			return 0;
		}
	}

	/**
	 * Calculate basic health score
	 */
	private async calculateBasicHealthScore(userId: string): Promise<number> {
		try {
			const metrics = await this.getAggregatedMetrics(userId);

			let score = 50; // Base score

			// Adjust based on profit margin
			if (metrics.profitMargin > 20) score += 20;
			else if (metrics.profitMargin > 10) score += 10;
			else if (metrics.profitMargin < 0) score -= 30;

			// Adjust based on growth
			if (metrics.monthlyGrowth > 10) score += 15;
			else if (metrics.monthlyGrowth > 5) score += 10;
			else if (metrics.monthlyGrowth < 0) score -= 20;

			// Adjust based on expense ratio
			if (metrics.expenseRatio < 60) score += 15;
			else if (metrics.expenseRatio > 80) score -= 20;

			return Math.max(0, Math.min(100, score));
		} catch (error) {
			console.error("Error calculating basic health score:", error);
			return 50;
		}
	}

	/**
	 * Build module breakdown from raw data
	 */
	private buildModuleBreakdown(
		moduleData: Array<{
			module: string;
			revenue: string | null;
			expenses: string | null;
			profit: string | null;
			efficiencyRate?: string | null;
			growthRate?: string | null;
		}>,
		totalRevenue?: number,
	): ModuleBreakdown[] {
		const moduleMap = new Map<
			string,
			{
				revenue: number;
				expenses: number;
				profit: number;
				roi: number;
				efficiency: number;
				growth: number;
			}
		>();

		moduleData.forEach((data) => {
			const existing = moduleMap.get(data.module) || {
				revenue: 0,
				expenses: 0,
				profit: 0,
				roi: 0,
				efficiency: 0,
				growth: 0,
			};

			existing.revenue += Number.parseFloat(data.revenue || "0");
			existing.expenses += Number.parseFloat(data.expenses || "0");
			existing.profit += Number.parseFloat(data.profit || "0");
			existing.roi =
				existing.expenses > 0 ? (existing.profit / existing.expenses) * 100 : 0;
			existing.efficiency = Number.parseFloat(data.efficiencyRate || "0");
			existing.growth = Number.parseFloat(data.growthRate || "0");

			moduleMap.set(data.module, existing);
		});

		const totalRev =
			totalRevenue ||
			Array.from(moduleMap.values()).reduce((sum, m) => sum + m.revenue, 0);

		return Array.from(moduleMap.entries()).map(([module, data]) => ({
			module,
			revenue: data.revenue,
			expenses: data.expenses,
			profit: data.profit,
			roi: data.roi,
			growth: data.growth,
			efficiency: data.efficiency,
			marketShare: totalRev > 0 ? (data.revenue / totalRev) * 100 : 0,
		}));
	}

	/**
	 * Build date filter for queries
	 */
	private buildDateFilter(startDate?: Date, endDate?: Date): any[] {
		const filters: unknown[] = [];

		if (startDate) {
			filters.push(gte(modulePerformanceSnapshots.snapshotDate, startDate));
		}

		if (endDate) {
			filters.push(lte(modulePerformanceSnapshots.snapshotDate, endDate));
		}

		return filters;
	}

	/**
	 * Check if cache is valid
	 */
	private isCacheValid(key: string): boolean {
		const expiry = this.cacheExpiry.get(key);
		return expiry ? Date.now() < expiry : false;
	}

	/**
	 * Clear cache
	 */
	clearCache(): void {
		this.cache.clear();
		this.cacheExpiry.clear();
	}

	/**
	 * Get real-time metrics for dashboard
	 */
	async getRealTimeMetrics(userId: string): Promise<{
		totalRevenue: number;
		totalExpenses: number;
		netIncome: number;
		activeAlerts: number;
		healthScore: number;
	}> {
		try {
			const metrics = await this.getAggregatedMetrics(userId);

			// Get active alerts count
			const alertsResult = await db
				.select({ count: sql<number>`count(*)` })
				.from(financialAlerts)
				.where(
					and(
						eq(financialAlerts.userId, userId),
						eq(financialAlerts.status, "active"),
					),
				);

			const activeAlerts = alertsResult[0]?.count || 0;

			return {
				totalRevenue: metrics.totalRevenue,
				totalExpenses: metrics.totalExpenses,
				netIncome: metrics.netIncome,
				activeAlerts,
				healthScore: metrics.healthScore,
			};
		} catch (error) {
			console.error("Error getting real-time metrics:", error);
			throw error;
		}
	}
}
