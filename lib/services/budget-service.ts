/**
 * Budget Service
 * Business logic for budget tracking and management with expense integration
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from '@/lib/db';
import { 
	budgets, 
	budgetCategories,
	budgetAlerts,
	type NewBudget, 
	type Budget,
	type BudgetAlert
} from '@/lib/db/schemas/budgets.schema';
import { expenses } from '@/lib/db/schemas/expenses.schema';
import { eq, and, desc, gte, lte, sql, or, like, sum } from 'drizzle-orm';

interface CreateBudgetInput {
	userId: string;
	name: string;
	category: string;
	description?: string;
	budgetedAmount: number;
	currency?: string;
	periodType: 'monthly' | 'yearly';
	startDate: Date;
	endDate: Date;
	alertThresholds?: number[];
	status?: 'active' | 'archived' | 'paused';
	notes?: string;
	tags?: string[];
	metadata?: Record<string, unknown>;
}

interface UpdateBudgetInput extends Partial<CreateBudgetInput> {
	id: number;
}

interface BudgetWithSpending extends Budget {
	spentAmount: number;
	remainingAmount: number;
	spendingPercentage: number;
	status: 'good' | 'warning' | 'critical' | 'over-budget';
	transactionCount: number;
}

interface BudgetSummary {
	totalBudgeted: number;
	totalSpent: number;
	totalRemaining: number;
	overallPercentage: number;
	activeBudgets: number;
	overBudgetCount: number;
	warningCount: number;
}

/**
 * Calculate actual spending for a budget from expenses
 */
async function calculateBudgetSpending(
	budgetId: number,
	budgetCategory: string,
	startDate: Date,
	endDate: Date,
	userId: string
): Promise<{
	spentAmount: number;
	transactionCount: number;
}> {
	// Query expenses table for approved expenses in this category and period
	const expensesResult = await db
		.select({
			totalSpent: sum(expenses.amount),
			count: sql<number>`count(*)::int`,
		})
		.from(expenses)
		.where(
			and(
				eq(expenses.userId, userId),
				eq(expenses.category, budgetCategory),
				eq(expenses.status, 'approved'),
				gte(expenses.date, startDate),
				lte(expenses.date, endDate)
			)
		);

	const spentAmount = Number(expensesResult[0]?.totalSpent || 0);
	const transactionCount = Number(expensesResult[0]?.count || 0);

	return { spentAmount, transactionCount };
}

/**
 * Determine budget status based on spending percentage
 */
function calculateBudgetStatus(
	spendingPercentage: number,
	alertThresholds: number[]
): 'good' | 'warning' | 'critical' | 'over-budget' {
	if (spendingPercentage >= 100) {
		return 'over-budget';
	}
	if (spendingPercentage >= (alertThresholds[2] || 90)) {
		return 'critical';
	}
	if (spendingPercentage >= (alertThresholds[0] || 80)) {
		return 'warning';
	}
	return 'good';
}

/**
 * Create a new budget
 */
export async function createBudget(input: CreateBudgetInput): Promise<Budget> {
	const [budget] = await db.insert(budgets).values({
		userId: input.userId,
		name: input.name,
		category: input.category,
		description: input.description,
		budgetedAmount: input.budgetedAmount.toFixed(2),
		currency: input.currency || 'USD',
		periodType: input.periodType,
		startDate: input.startDate,
		endDate: input.endDate,
		alertThresholds: input.alertThresholds || [80, 90, 100],
		status: input.status || 'active',
		notes: input.notes,
		tags: input.tags,
		metadata: input.metadata,
	}).returning();

	return budget;
}

/**
 * Get budget by ID with spending calculations
 */
export async function getBudgetById(
	id: number, 
	userId: string
): Promise<BudgetWithSpending | null> {
	const [budget] = await db
		.select()
		.from(budgets)
		.where(and(
			eq(budgets.id, id),
			eq(budgets.userId, userId)
		))
		.limit(1);

	if (!budget) {
		return null;
	}

	// Calculate spending
	const { spentAmount, transactionCount } = await calculateBudgetSpending(
		budget.id,
		budget.category,
		budget.startDate,
		budget.endDate,
		userId
	);

	const budgetedAmount = Number(budget.budgetedAmount);
	const remainingAmount = budgetedAmount - spentAmount;
	const spendingPercentage = budgetedAmount > 0 
		? (spentAmount / budgetedAmount) * 100 
		: 0;

	const status = calculateBudgetStatus(
		spendingPercentage,
		budget.alertThresholds || [80, 90, 100]
	);

	return {
		...budget,
		spentAmount,
		remainingAmount,
		spendingPercentage,
		status,
		transactionCount,
	};
}

/**
 * Get all budgets for a user with spending calculations
 */
export async function getBudgets(
	userId: string,
	options?: {
		category?: string;
		status?: string;
		periodType?: 'monthly' | 'yearly';
		limit?: number;
		offset?: number;
	}
): Promise<BudgetWithSpending[]> {
	const conditions = [eq(budgets.userId, userId)];

	if (options?.category) {
		conditions.push(eq(budgets.category, options.category));
	}

	if (options?.status) {
		conditions.push(eq(budgets.status, options.status));
	}

	if (options?.periodType) {
		conditions.push(eq(budgets.periodType, options.periodType));
	}

	const userBudgets = await db
		.select()
		.from(budgets)
		.where(and(...conditions))
		.orderBy(desc(budgets.createdAt))
		.limit(options?.limit || 50)
		.offset(options?.offset || 0);

	// Calculate spending for each budget
	const budgetsWithSpending = await Promise.all(
		userBudgets.map(async (budget) => {
			const { spentAmount, transactionCount } = await calculateBudgetSpending(
				budget.id,
				budget.category,
				budget.startDate,
				budget.endDate,
				userId
			);

			const budgetedAmount = Number(budget.budgetedAmount);
			const remainingAmount = budgetedAmount - spentAmount;
			const spendingPercentage = budgetedAmount > 0 
				? (spentAmount / budgetedAmount) * 100 
				: 0;

			const status = calculateBudgetStatus(
				spendingPercentage,
				budget.alertThresholds || [80, 90, 100]
			);

			return {
				...budget,
				spentAmount,
				remainingAmount,
				spendingPercentage,
				status,
				transactionCount,
			};
		})
	);

	return budgetsWithSpending;
}

/**
 * Update budget
 */
export async function updateBudget(input: UpdateBudgetInput): Promise<Budget> {
	const { id, userId, budgetedAmount, ...updateData } = input;

	const updateValues: Partial<NewBudget> = { ...updateData };
	
	if (budgetedAmount !== undefined) {
		updateValues.budgetedAmount = budgetedAmount.toFixed(2);
	}

	updateValues.updatedAt = new Date();

	const [updated] = await db.update(budgets)
		.set(updateValues)
		.where(and(
			eq(budgets.id, id),
			eq(budgets.userId, userId)
		))
		.returning();

	if (!updated) {
		throw new Error('Budget not found or unauthorized');
	}

	return updated;
}

/**
 * Delete (archive) budget
 */
export async function deleteBudget(id: number, userId: string): Promise<void> {
	await db.update(budgets)
		.set({ 
			status: 'archived',
			updatedAt: new Date()
		})
		.where(and(
			eq(budgets.id, id),
			eq(budgets.userId, userId)
		));
}

/**
 * Get budget summary with overall statistics
 */
export async function getBudgetSummary(userId: string): Promise<BudgetSummary> {
	const activeBudgets = await db
		.select()
		.from(budgets)
		.where(and(
			eq(budgets.userId, userId),
			eq(budgets.status, 'active')
		));

	let totalBudgeted = 0;
	let totalSpent = 0;
	let overBudgetCount = 0;
	let warningCount = 0;

	// Calculate spending for each budget
	for (const budget of activeBudgets) {
		const budgetedAmount = Number(budget.budgetedAmount);
		totalBudgeted += budgetedAmount;

		const { spentAmount } = await calculateBudgetSpending(
			budget.id,
			budget.category,
			budget.startDate,
			budget.endDate,
			userId
		);

		totalSpent += spentAmount;

		const spendingPercentage = budgetedAmount > 0 
			? (spentAmount / budgetedAmount) * 100 
			: 0;

		if (spendingPercentage >= 100) {
			overBudgetCount++;
		} else if (spendingPercentage >= (budget.alertThresholds?.[0] || 80)) {
			warningCount++;
		}
	}

	const totalRemaining = totalBudgeted - totalSpent;
	const overallPercentage = totalBudgeted > 0 
		? (totalSpent / totalBudgeted) * 100 
		: 0;

	return {
		totalBudgeted,
		totalSpent,
		totalRemaining,
		overallPercentage,
		activeBudgets: activeBudgets.length,
		overBudgetCount,
		warningCount,
	};
}

/**
 * Get budget alerts based on spending thresholds
 */
export async function getBudgetAlerts(userId: string): Promise<BudgetAlert[]> {
	const activeBudgets = await db
		.select()
		.from(budgets)
		.where(and(
			eq(budgets.userId, userId),
			eq(budgets.status, 'active')
		));

	const alerts: BudgetAlert[] = [];

	for (const budget of activeBudgets) {
		const { spentAmount } = await calculateBudgetSpending(
			budget.id,
			budget.category,
			budget.startDate,
			budget.endDate,
			userId
		);

		const budgetedAmount = Number(budget.budgetedAmount);
		const remainingAmount = budgetedAmount - spentAmount;
		const spendingPercentage = budgetedAmount > 0 
			? (spentAmount / budgetedAmount) * 100 
			: 0;

		const thresholds = budget.alertThresholds || [80, 90, 100];

		// Check each threshold and create alerts
		for (const threshold of thresholds) {
			if (spendingPercentage >= threshold) {
				let alertType: 'warning' | 'critical' | 'over-budget';
				let message: string;

				if (spendingPercentage >= 100) {
					alertType = 'over-budget';
					message = `${budget.category} budget exceeded by $${Math.abs(remainingAmount).toLocaleString()}. Review spending patterns.`;
				} else if (spendingPercentage >= 90) {
					alertType = 'critical';
					message = `${budget.category} budget is ${spendingPercentage.toFixed(1)}% utilized. Budget approaching limit.`;
				} else {
					alertType = 'warning';
					message = `${budget.category} budget is ${spendingPercentage.toFixed(1)}% utilized. Consider reducing spend or increasing budget.`;
				}

				// Check if alert already exists (compare threshold as number)
				const existingAlerts = await db
					.select()
					.from(budgetAlerts)
					.where(and(
						eq(budgetAlerts.budgetId, budget.id),
						eq(budgetAlerts.alertType, alertType),
						eq(budgetAlerts.isActive, true)
					));
				
				const existingAlert = existingAlerts.find(
					alert => Number(alert.threshold) === threshold
				);

				if (!existingAlert) {
					// Create new alert
					const [alert] = await db.insert(budgetAlerts).values({
						budgetId: budget.id,
						userId: userId,
						alertType: alertType,
						threshold: threshold.toFixed(2),
						message: message,
						spendingPercentage: spendingPercentage.toFixed(2),
						budgetedAmount: budgetedAmount.toFixed(2),
						spentAmount: spentAmount.toFixed(2),
						remainingAmount: remainingAmount.toFixed(2),
						isActive: true,
						isRead: false,
					}).returning();

					alerts.push(alert);
				}
			}
		}
	}

	// Get all active alerts
	const activeAlerts = await db
		.select()
		.from(budgetAlerts)
		.where(and(
			eq(budgetAlerts.userId, userId),
			eq(budgetAlerts.isActive, true)
		))
		.orderBy(desc(budgetAlerts.triggeredAt))
		.limit(50);

	return activeAlerts;
}

