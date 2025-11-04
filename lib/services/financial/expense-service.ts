/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { getDbOrThrow } from "@/lib/db";
import { type Expense, type NewExpense, expenses } from "@/lib/db/schema";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { Trash2, TrendingDown } from "lucide-react";

export interface CreateExpenseInput {
	userId: string;
	category: Expense["category"];
	description: string;
	amount: number;
	currency?: string;
	date?: Date;
	merchant?: string;
	paymentMethod?: Expense["paymentMethod"];
	receiptUrl?: string;
	isBillable?: boolean;
	clientId?: string;
	isReimbursable?: boolean;
	taxDeductible?: boolean;
	notes?: string;
}

export interface UpdateExpenseInput {
	category?: Expense["category"];
	description?: string;
	amount?: number;
	currency?: string;
	date?: Date;
	merchant?: string;
	paymentMethod?: Expense["paymentMethod"];
	receiptUrl?: string;
	isBillable?: boolean;
	clientId?: string;
	isReimbursable?: boolean;
	reimbursed?: boolean;
	taxDeductible?: boolean;
	notes?: string;
}

/**
 * Create a new expense
 */
export async function createExpense(
	input: CreateExpenseInput,
): Promise<Expense> {
	const _db = getDbOrThrow();

	const [expense] = await _db
		.insert(expenses)
		.values({
			userId: input.userId,
			category: input.category,
			description: input.description,
			amount: input.amount.toString(),
			currency: input.currency || "USD",
			date: input.date || new Date(),
			merchant: input.merchant,
			paymentMethod: input.paymentMethod || null,
			receiptUrl: input.receiptUrl,
			isBillable: input.isBillable || false,
			clientId: input.clientId,
			isReimbursable: input.isReimbursable || false,
			reimbursed: false,
			taxDeductible: input.taxDeductible !== false,
			notes: input.notes,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.returning();

	if (!expense) {
		// Defensive: ensure caller always gets an Expense instance
		throw new Error("Failed to create expense");
	}

	return expense as Expense;
}

/**
 * Get expense by ID
 */
export async function getExpenseById(
	expenseId: string,
	userId: string,
): Promise<Expense | null> {
	const _db = getDbOrThrow();
	const [expense] = await _db
		.select()
		.from(expenses)
		.where(and(eq(expenses.id, expenseId), eq(expenses.userId, userId)))
		.limit(1);

	return expense || null;
}

/**
 * List expenses for a user
 */
export async function listExpenses(params: {
	userId: string;
	page?: number;
	limit?: number;
	category?: Expense["category"];
	startDate?: Date;
	endDate?: Date;
	isBillable?: boolean;
	taxDeductible?: boolean;
}): Promise<{ expenses: Expense[]; total: number }> {
	const page = params.page || 1;
	const limit = params.limit || 20;
	const offset = (page - 1) * limit;

	const conditions = [eq(expenses.userId, params.userId)];

	if (params.category) {
		conditions.push(eq(expenses.category, params.category));
	}

	if (params.startDate) {
		conditions.push(gte(expenses.date, params.startDate));
	}

	if (params.endDate) {
		conditions.push(lte(expenses.date, params.endDate));
	}

	if (params.isBillable !== undefined) {
		conditions.push(eq(expenses.isBillable, params.isBillable));
	}

	if (params.taxDeductible !== undefined) {
		conditions.push(eq(expenses.taxDeductible, params.taxDeductible));
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	const _db = getDbOrThrow();

	let qData: any = _db.select().from(expenses);
	if (whereClause) qData = qData.where(whereClause);
	qData = qData.orderBy(desc(expenses.date)).limit(limit).offset(offset);

	let qCount: any = _db.select({ count: sql<number>`count(*)` }).from(expenses);
	if (whereClause) qCount = qCount.where(whereClause);

	const [data, countResult] = await Promise.all([qData, qCount]);

	return {
		expenses: data,
		total: Number(countResult[0]?.count || 0),
	};
}

/**
 * Update expense
 */
export async function updateExpense(
	expenseId: string,
	userId: string,
	input: UpdateExpenseInput,
): Promise<Expense | null> {
	const updateData: Partial<NewExpense> = {
		updatedAt: new Date(),
	};

	if (input.category) updateData.category = input.category;
	if (input.description) updateData.description = input.description;
	if (input.amount !== undefined) updateData.amount = input.amount.toString();
	if (input.currency) updateData.currency = input.currency;
	if (input.date) updateData.date = input.date;
	if (input.merchant !== undefined) updateData.merchant = input.merchant;
	if (input.paymentMethod !== undefined)
		updateData.paymentMethod = input.paymentMethod as Expense["paymentMethod"];
	if (input.receiptUrl !== undefined) updateData.receiptUrl = input.receiptUrl;
	if (input.isBillable !== undefined) updateData.isBillable = input.isBillable;
	if (input.clientId !== undefined) updateData.clientId = input.clientId;
	if (input.isReimbursable !== undefined)
		updateData.isReimbursable = input.isReimbursable;
	if (input.reimbursed !== undefined) updateData.reimbursed = input.reimbursed;
	if (input.taxDeductible !== undefined)
		updateData.taxDeductible = input.taxDeductible;
	if (input.notes !== undefined) updateData.notes = input.notes;

	const _db = getDbOrThrow();
	const [updated] = await _db
		.update(expenses)
		.set(updateData)
		.where(and(eq(expenses.id, expenseId), eq(expenses.userId, userId)))
		.returning();

	return updated || null;
}

/**
 * Delete expense
 */
export async function deleteExpense(
	expenseId: string,
	userId: string,
): Promise<boolean> {
	const _db = getDbOrThrow();
	const result = await _db
		.delete(expenses)
		.where(and(eq(expenses.id, expenseId), eq(expenses.userId, userId)))
		.returning();

	return result.length > 0;
}

/**
 * Get expense statistics by category
 */
export async function getExpenseStatsByCategory(
	userId: string,
	period?: "month" | "year",
) {
	const now = new Date();
	const startDate = new Date();

	if (period === "month") {
		startDate.setMonth(now.getMonth() - 1);
	} else if (period === "year") {
		startDate.setFullYear(now.getFullYear() - 1);
	}

	const conditions = [eq(expenses.userId, userId)];

	if (period) {
		conditions.push(gte(expenses.date, startDate));
	}

	const whereClause = and(...conditions);
	const _db = getDbOrThrow();

	let qStats: any = _db
		.select({
			category: expenses.category,
			count: sql<number>`count(*)`,
			total: sql<number>`sum(CAST(${expenses.amount} AS DECIMAL))`,
		})
		.from(expenses);
	if (whereClause) qStats = qStats.where(whereClause);
	const stats = await qStats.groupBy(expenses.category);

	return stats;
}

/**
 * Get total expenses for a period
 */
export async function getTotalExpenses(
	userId: string,
	startDate?: Date,
	endDate?: Date,
): Promise<number> {
	const conditions = [eq(expenses.userId, userId)];

	if (startDate) {
		conditions.push(gte(expenses.date, startDate));
	}

	if (endDate) {
		conditions.push(lte(expenses.date, endDate));
	}

	const whereClause = and(...conditions);
	const _db = getDbOrThrow();

	let qTotal: any = _db
		.select({
			total: sql<number>`COALESCE(sum(CAST(${expenses.amount} AS DECIMAL)), 0)`,
		})
		.from(expenses);
	if (whereClause) qTotal = qTotal.where(whereClause);

	const [result] = await qTotal;

	return Number(result?.total || 0);
}
