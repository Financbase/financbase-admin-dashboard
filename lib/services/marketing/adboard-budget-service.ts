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
	type AdboardBudget,
	type NewAdboardBudget,
	adboardBudgets,
	adboardCampaigns,
	adboardPerformance,
} from "@/lib/db/schemas/adboard.schema";
import { and, desc, eq, gte, lte, like, or, sql } from "drizzle-orm";
import {
	BarChart3,
	PiggyBank,
	Search,
	Trash2,
	TrendingUp,
	XCircle,
} from "lucide-react";

/**
 * Create a new adboard budget
 */
export async function createAdboardBudget(
	userId: string,
	budgetData: Omit<
		NewAdboardBudget,
		"userId" | "createdAt" | "updatedAt" | "remaining"
	>,
): Promise<AdboardBudget> {
	try {
		// Calculate remaining budget
		const remaining =
			Number(budgetData.totalBudget) - Number(budgetData.spent || 0);

		const [budget] = await db
			.insert(adboardBudgets)
			.values({
				...budgetData,
				userId,
				remaining,
			})
			.returning();

		return budget;
	} catch (error) {
		console.error("Error creating adboard budget:", error);
		throw new Error("Failed to create budget");
	}
}

/**
 * Get all adboard budgets for a user
 */
export async function getAdboardBudgets(
	userId: string,
	options?: {
		isActive?: boolean;
		search?: string;
		limit?: number;
		offset?: number;
	},
): Promise<AdboardBudget[]> {
	try {
		const conditions = [eq(adboardBudgets.userId, userId)];

		if (options?.isActive !== undefined) {
			conditions.push(eq(adboardBudgets.isActive, options.isActive));
		}

		if (options?.search) {
			conditions.push(
				or(
					like(adboardBudgets.name, `%${options.search}%`),
					like(adboardBudgets.description, `%${options.search}%`),
				),
			);
		}

		const whereClause = and(...conditions);

		const result = await db
			.select()
			.from(adboardBudgets)
			.where(whereClause)
			.orderBy(desc(adboardBudgets.createdAt))
			.limit(options?.limit || 50)
			.offset(options?.offset || 0);

		return result;
	} catch (error) {
		console.error("Error fetching adboard budgets:", error);
		throw new Error("Failed to fetch budgets");
	}
}

/**
 * Get a single adboard budget by ID
 */
export async function getAdboardBudgetById(
	budgetId: string,
	userId: string,
): Promise<AdboardBudget | null> {
	try {
		const [budget] = await db
			.select()
			.from(adboardBudgets)
			.where(
				and(eq(adboardBudgets.id, budgetId), eq(adboardBudgets.userId, userId)),
			)
			.limit(1);

		return budget || null;
	} catch (error) {
		console.error("Error fetching adboard budget:", error);
		throw new Error("Failed to fetch budget");
	}
}

/**
 * Update an adboard budget
 */
export async function updateAdboardBudget(
	budgetId: string,
	userId: string,
	updateData: Partial<
		Omit<AdboardBudget, "id" | "userId" | "createdAt" | "updatedAt">
	>,
): Promise<AdboardBudget | null> {
	try {
		// Recalculate remaining if total budget or spent changed
		const finalUpdateData = { ...updateData };
		if (
			updateData.totalBudget !== undefined ||
			updateData.spent !== undefined
		) {
			const currentBudget = await getAdboardBudgetById(budgetId, userId);
			if (currentBudget) {
				const newTotal =
					updateData.totalBudget !== undefined
						? Number(updateData.totalBudget)
						: Number(currentBudget.totalBudget);
				const newSpent =
					updateData.spent !== undefined
						? Number(updateData.spent)
						: Number(currentBudget.spent);
				finalUpdateData.remaining = newTotal - newSpent;
			}
		}

		const [budget] = await db
			.update(adboardBudgets)
			.set({
				...finalUpdateData,
				updatedAt: new Date(),
			})
			.where(
				and(eq(adboardBudgets.id, budgetId), eq(adboardBudgets.userId, userId)),
			)
			.returning();

		return budget || null;
	} catch (error) {
		console.error("Error updating adboard budget:", error);
		throw new Error("Failed to update budget");
	}
}

/**
 * Delete an adboard budget
 */
export async function deleteAdboardBudget(
	budgetId: string,
	userId: string,
): Promise<boolean> {
	try {
		const result = await db
			.delete(adboardBudgets)
			.where(
				and(eq(adboardBudgets.id, budgetId), eq(adboardBudgets.userId, userId)),
			);

		return result.rowCount > 0;
	} catch (error) {
		console.error("Error deleting adboard budget:", error);
		throw new Error("Failed to delete budget");
	}
}

/**
 * Toggle budget active status
 */
export async function toggleBudgetStatus(
	budgetId: string,
	userId: string,
	isActive: boolean,
): Promise<AdboardBudget | null> {
	try {
		const [budget] = await db
			.update(adboardBudgets)
			.set({
				isActive,
				updatedAt: new Date(),
			})
			.where(
				and(eq(adboardBudgets.id, budgetId), eq(adboardBudgets.userId, userId)),
			)
			.returning();

		return budget || null;
	} catch (error) {
		console.error("Error toggling budget status:", error);
		throw new Error("Failed to toggle budget status");
	}
}

/**
 * Update budget spent amount
 */
export async function updateBudgetSpent(
	budgetId: string,
	userId: string,
	additionalSpent: number,
): Promise<AdboardBudget | null> {
	try {
		const currentBudget = await getAdboardBudgetById(budgetId, userId);
		if (!currentBudget) {
			throw new Error("Budget not found");
		}

		const newSpent = Number(currentBudget.spent) + additionalSpent;
		const newRemaining = Number(currentBudget.totalBudget) - newSpent;

		const [budget] = await db
			.update(adboardBudgets)
			.set({
				spent: newSpent,
				remaining: newRemaining,
				updatedAt: new Date(),
			})
			.where(
				and(eq(adboardBudgets.id, budgetId), eq(adboardBudgets.userId, userId)),
			)
			.returning();

		return budget || null;
	} catch (error) {
		console.error("Error updating budget spent:", error);
		throw new Error("Failed to update budget spent");
	}
}

/**
 * Get budget performance analytics
 */
export async function getBudgetPerformance(
	budgetId: string,
	userId: string,
	startDate?: Date,
	endDate?: Date,
): Promise<{
	budget: AdboardBudget;
	totalSpent: number;
	totalRevenue: number;
	roi: number;
	remainingBudget: number;
	utilizationRate: number;
	projectedSpend: number;
	daysRemaining: number;
} | null> {
	try {
		const budget = await getAdboardBudgetById(budgetId, userId);
		if (!budget) return null;

		// Build performance query conditions
		const conditions = [eq(adboardCampaigns.userId, userId)];

		if (startDate) {
			conditions.push(gte(adboardPerformance.date, startDate));
		}

		if (endDate) {
			conditions.push(lte(adboardPerformance.date, endDate));
		}

		const whereClause = and(...conditions);

		// Get performance data for campaigns associated with this budget
		const [performanceStats] = await db
			.select({
				totalSpent: sql<number>`COALESCE(sum(${adboardPerformance.spend}), 0)`,
				totalRevenue: sql<number>`COALESCE(sum(${adboardPerformance.revenue}), 0)`,
			})
			.from(adboardPerformance)
			.innerJoin(
				adboardCampaigns,
				eq(adboardPerformance.campaignId, adboardCampaigns.id),
			)
			.where(whereClause);

		const totalSpent = Number(performanceStats?.totalSpent || 0);
		const totalRevenue = Number(performanceStats?.totalRevenue || 0);
		const roi =
			totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0;
		const remainingBudget = Number(budget.remaining || 0);
		const utilizationRate =
			Number(budget.totalBudget) > 0
				? (Number(budget.spent) / Number(budget.totalBudget)) * 100
				: 0;

		// Calculate projected spend based on current rate
		const daysElapsed = budget.startDate
			? Math.ceil(
					(Date.now() - budget.startDate.getTime()) / (1000 * 60 * 60 * 24),
				)
			: 1;
		const dailySpendRate = Number(budget.spent) / daysElapsed;
		const totalDays = budget.endDate
			? Math.ceil(
					(budget.endDate.getTime() - budget.startDate.getTime()) /
						(1000 * 60 * 60 * 24),
				)
			: 30;
		const projectedSpend = dailySpendRate * totalDays;
		const daysRemaining = budget.endDate
			? Math.ceil(
					(budget.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
				)
			: 0;

		return {
			budget,
			totalSpent,
			totalRevenue,
			roi,
			remainingBudget,
			utilizationRate,
			projectedSpend,
			daysRemaining,
		};
	} catch (error) {
		console.error("Error calculating budget performance:", error);
		throw new Error("Failed to calculate budget performance");
	}
}

/**
 * Get budget statistics
 */
export async function getBudgetStats(userId: string): Promise<{
	totalBudgets: number;
	activeBudgets: number;
	inactiveBudgets: number;
	totalAllocated: number;
	totalSpent: number;
	totalRemaining: number;
	averageUtilization: number;
	overBudgetCount: number;
}> {
	try {
		// Get basic budget stats
		const [basicStats] = await db
			.select({
				totalBudgets: sql<number>`count(*)`,
				activeBudgets: sql<number>`count(CASE WHEN ${adboardBudgets.isActive} = true THEN 1 END)`,
				inactiveBudgets: sql<number>`count(CASE WHEN ${adboardBudgets.isActive} = false THEN 1 END)`,
				totalAllocated: sql<number>`COALESCE(sum(${adboardBudgets.totalBudget}), 0)`,
				totalSpent: sql<number>`COALESCE(sum(${adboardBudgets.spent}), 0)`,
				totalRemaining: sql<number>`COALESCE(sum(${adboardBudgets.remaining}), 0)`,
				averageUtilization: sql<number>`COALESCE(avg((${adboardBudgets.spent} / ${adboardBudgets.totalBudget}) * 100), 0)`,
				overBudgetCount: sql<number>`count(CASE WHEN ${adboardBudgets.spent} > ${adboardBudgets.totalBudget} THEN 1 END)`,
			})
			.from(adboardBudgets)
			.where(eq(adboardBudgets.userId, userId));

		return {
			totalBudgets: Number(basicStats?.totalBudgets || 0),
			activeBudgets: Number(basicStats?.activeBudgets || 0),
			inactiveBudgets: Number(basicStats?.inactiveBudgets || 0),
			totalAllocated: Number(basicStats?.totalAllocated || 0),
			totalSpent: Number(basicStats?.totalSpent || 0),
			totalRemaining: Number(basicStats?.totalRemaining || 0),
			averageUtilization: Number(basicStats?.averageUtilization || 0),
			overBudgetCount: Number(basicStats?.overBudgetCount || 0),
		};
	} catch (error) {
		console.error("Error fetching budget stats:", error);
		throw new Error("Failed to fetch budget statistics");
	}
}
