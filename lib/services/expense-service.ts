/**
 * Expense Service
 * Business logic for expense tracking and management
 */

import { db } from '@/lib/db';
import { 
	expenses, 
	expenseCategories,
	expenseApprovalLog,
	type NewExpense, 
	type Expense 
} from '@/lib/db/schema/expenses';
import { eq, and, desc, gte, lte, sql, or } from 'drizzle-orm';
import { NotificationHelpers } from './notification-service';

interface CreateExpenseInput {
	userId: string;
	description: string;
	amount: number;
	date: Date;
	category: string;
	vendor?: string;
	paymentMethod?: string;
	receiptUrl?: string;
	notes?: string;
	taxDeductible?: boolean;
	billable?: boolean;
	projectId?: number;
	clientId?: number;
	currency?: string;
}

interface UpdateExpenseInput extends Partial<CreateExpenseInput> {
	id: number;
}

/**
 * Create a new expense
 */
export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
	const [expense] = await db.insert(expenses).values({
		userId: input.userId,
		description: input.description,
		amount: input.amount.toFixed(2),
		date: input.date,
		category: input.category,
		vendor: input.vendor,
		paymentMethod: input.paymentMethod,
		receiptUrl: input.receiptUrl,
		notes: input.notes,
		taxDeductible: input.taxDeductible ?? true,
		billable: input.billable ?? false,
		projectId: input.projectId,
		clientId: input.clientId,
		currency: input.currency || 'USD',
		status: 'pending',
	}).returning();

	// Send notification
	await NotificationHelpers.expense.created(
		input.userId,
		expense.id.toString(),
		input.amount
	);

	// Log action
	await logExpenseAction(expense.id, input.userId, 'submitted');

	return expense;
}

/**
 * Get expense by ID
 */
export async function getExpenseById(id: number, userId: string): Promise<Expense | null> {
	const expense = await db.query.expenses.findFirst({
		where: and(
			eq(expenses.id, id),
			eq(expenses.userId, userId)
		),
	});

	return expense || null;
}

/**
 * Get all expenses for a user
 */
export async function getExpenses(
	userId: string,
	options?: {
		status?: string;
		category?: string;
		startDate?: Date;
		endDate?: Date;
		billable?: boolean;
		limit?: number;
		offset?: number;
	}
) {
	const conditions = [eq(expenses.userId, userId)];

	if (options?.status) {
		conditions.push(eq(expenses.status, options.status));
	}

	if (options?.category) {
		conditions.push(eq(expenses.category, options.category));
	}

	if (options?.startDate) {
		conditions.push(gte(expenses.date, options.startDate));
	}

	if (options?.endDate) {
		conditions.push(lte(expenses.date, options.endDate));
	}

	if (options?.billable !== undefined) {
		conditions.push(eq(expenses.billable, options.billable));
	}

	const results = await db.query.expenses.findMany({
		where: and(...conditions),
		orderBy: [desc(expenses.date)],
		limit: options?.limit || 50,
		offset: options?.offset || 0,
	});

	return results;
}

/**
 * Update expense
 */
export async function updateExpense(input: UpdateExpenseInput): Promise<Expense> {
	const { id, userId, ...updateData } = input;

	const [updated] = await db.update(expenses)
		.set({
			...updateData,
			...(updateData.amount && { amount: updateData.amount.toFixed(2) }),
			updatedAt: new Date(),
		})
		.where(and(
			eq(expenses.id, id),
			eq(expenses.userId, userId || '')
		))
		.returning();

	// Log action
	if (userId) {
		await logExpenseAction(id, userId, 'updated');
	}

	return updated;
}

/**
 * Approve expense
 */
export async function approveExpense(
	id: number,
	approvedBy: string,
	userId: string
): Promise<Expense> {
	const [updated] = await db.update(expenses)
		.set({
			status: 'approved',
			approvedBy,
			approvedAt: new Date(),
			updatedAt: new Date(),
		})
		.where(and(
			eq(expenses.id, id),
			eq(expenses.userId, userId)
		))
		.returning();

	// Send notification
	await NotificationHelpers.expense.approved(
		userId,
		id.toString(),
		parseFloat(updated.amount)
	);

	// Log action
	await logExpenseAction(id, approvedBy, 'approved', undefined, 'pending', 'approved');

	return updated;
}

/**
 * Reject expense
 */
export async function rejectExpense(
	id: number,
	rejectedBy: string,
	userId: string,
	reason?: string
): Promise<Expense> {
	const [updated] = await db.update(expenses)
		.set({
			status: 'rejected',
			rejectedReason: reason,
			updatedAt: new Date(),
		})
		.where(and(
			eq(expenses.id, id),
			eq(expenses.userId, userId)
		))
		.returning();

	// Send notification
	await NotificationHelpers.expense.rejected(
		userId,
		id.toString(),
		parseFloat(updated.amount),
		reason
	);

	// Log action
	await logExpenseAction(id, rejectedBy, 'rejected', reason, 'pending', 'rejected');

	return updated;
}

/**
 * Delete expense
 */
export async function deleteExpense(id: number, userId: string): Promise<void> {
	await db.delete(expenses)
		.where(and(
			eq(expenses.id, id),
			eq(expenses.userId, userId)
		));
}

/**
 * Get expense statistics
 */
export async function getExpenseStats(userId: string, timeframe?: 'month' | 'year') {
	const now = new Date();
	let startDate: Date;

	if (timeframe === 'month') {
		startDate = new Date(now.getFullYear(), now.getMonth(), 1);
	} else if (timeframe === 'year') {
		startDate = new Date(now.getFullYear(), 0, 1);
	} else {
		startDate = new Date(0); // All time
	}

	const allExpenses = await getExpenses(userId, { startDate });

	const stats = {
		total: allExpenses.length,
		pending: 0,
		approved: 0,
		rejected: 0,
		totalAmount: 0,
		approvedAmount: 0,
		pendingAmount: 0,
		byCategory: {} as Record<string, { count: number; amount: number }>,
	};

	allExpenses.forEach((expense) => {
		const amount = parseFloat(expense.amount);
		stats.totalAmount += amount;

		switch (expense.status) {
			case 'pending':
				stats.pending++;
				stats.pendingAmount += amount;
				break;
			case 'approved':
				stats.approved++;
				stats.approvedAmount += amount;
				break;
			case 'rejected':
				stats.rejected++;
				break;
		}

		// By category
		if (!stats.byCategory[expense.category]) {
			stats.byCategory[expense.category] = { count: 0, amount: 0 };
		}
		stats.byCategory[expense.category].count++;
		stats.byCategory[expense.category].amount += amount;
	});

	return stats;
}

/**
 * Get expense categories
 */
export async function getCategories(userId: string) {
	return await db.query.expenseCategories.findMany({
		where: and(
			eq(expenseCategories.userId, userId),
			eq(expenseCategories.isActive, true)
		),
		orderBy: [expenseCategories.name],
	});
}

/**
 * Create expense category
 */
export async function createCategory(
	userId: string,
	name: string,
	options?: {
		description?: string;
		color?: string;
		monthlyBudget?: number;
		taxDeductible?: boolean;
		requiresApproval?: boolean;
	}
) {
	const [category] = await db.insert(expenseCategories).values({
		userId,
		name,
		description: options?.description,
		color: options?.color,
		monthlyBudget: options?.monthlyBudget?.toFixed(2),
		taxDeductible: options?.taxDeductible ?? true,
		requiresApproval: options?.requiresApproval ?? false,
	}).returning();

	return category;
}

/**
 * Log expense action
 */
async function logExpenseAction(
	expenseId: number,
	performedBy: string,
	action: string,
	reason?: string,
	previousStatus?: string,
	newStatus?: string
) {
	await db.insert(expenseApprovalLog).values({
		expenseId,
		performedBy,
		action,
		reason,
		previousStatus,
		newStatus,
	});
}

// Export all expense service functions
export const ExpenseService = {
	create: createExpense,
	getById: getExpenseById,
	getAll: getExpenses,
	update: updateExpense,
	approve: approveExpense,
	reject: rejectExpense,
	delete: deleteExpense,
	getStats: getExpenseStats,
	getCategories,
	createCategory,
};

