/**
 * Transaction Service
 * Business logic for transaction management
 */

import { db } from '@/lib/db';
import { transactions, type Transaction, type NewTransaction } from '@/lib/db/schemas/transactions.schema';
import { eq, and, desc, gte, lte, or, sql, ilike } from 'drizzle-orm';

interface CreateTransactionInput {
	userId: string;
	type: 'income' | 'expense' | 'transfer' | 'payment';
	amount: number;
	currency?: string;
	description?: string;
	category?: string;
	paymentMethod?: string;
	referenceId?: string;
	referenceType?: string;
	accountId?: string;
	transactionDate: Date;
	notes?: string;
	metadata?: Record<string, unknown>;
}

interface UpdateTransactionInput extends Partial<CreateTransactionInput> {
	id: string;
}

interface TransactionStats {
	totalTransactions: number;
	totalInflow: number;
	totalOutflow: number;
	netFlow: number;
	pendingTransactions: number;
	completedTransactions: number;
	categoryBreakdown: Array<{
		category: string;
		amount: number;
		count: number;
	}>;
	monthlyTrend: Array<{
		month: string;
		inflow: number;
		outflow: number;
		net: number;
	}>;
}

/**
 * Generate unique transaction number
 */
async function generateTransactionNumber(userId: string): Promise<string> {
	const year = new Date().getFullYear();
	const month = String(new Date().getMonth() + 1).padStart(2, '0');
	
	// Get last transaction number for this user
	const lastTransaction = await db.query.transactions.findFirst({
		where: eq(transactions.userId, userId),
		orderBy: [desc(transactions.createdAt)],
	});

	let sequence = 1;
	if (lastTransaction?.transactionNumber) {
		const parts = lastTransaction.transactionNumber.split('-');
		const lastPart = parts[parts.length - 1];
		const lastSequence = parseInt(lastPart || '0');
		sequence = lastSequence + 1;
	}

	return `TXN-${year}${month}-${String(sequence).padStart(4, '0')}`;
}

/**
 * Create a new transaction
 */
export async function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
	const transactionNumber = await generateTransactionNumber(input.userId);

	const [transaction] = await db.insert(transactions).values({
		userId: input.userId,
		transactionNumber,
		type: input.type,
		amount: input.amount.toFixed(2),
		currency: input.currency || 'USD',
		description: input.description,
		category: input.category,
		status: 'pending',
		paymentMethod: input.paymentMethod,
		referenceId: input.referenceId,
		referenceType: input.referenceType,
		accountId: input.accountId,
		transactionDate: input.transactionDate,
		notes: input.notes,
		metadata: input.metadata,
		updatedAt: new Date(),
	}).returning();

	return transaction;
}

/**
 * Get transaction by ID
 */
export async function getTransactionById(id: string, userId: string): Promise<Transaction | null> {
	const transaction = await db.query.transactions.findFirst({
		where: and(
			eq(transactions.id, id),
			eq(transactions.userId, userId)
		),
	});

	return transaction || null;
}

/**
 * Get all transactions for a user
 */
export async function getTransactions(
	userId: string,
	options?: {
		type?: 'income' | 'expense' | 'transfer' | 'payment';
		status?: string;
		category?: string;
		startDate?: Date;
		endDate?: Date;
		search?: string;
		limit?: number;
		offset?: number;
	}
) {
	const conditions = [eq(transactions.userId, userId)];

	if (options?.type) {
		conditions.push(eq(transactions.type, options.type));
	}

	if (options?.status) {
		conditions.push(eq(transactions.status, options.status as any));
	}

	if (options?.category) {
		conditions.push(eq(transactions.category, options.category as any));
	}

	if (options?.startDate) {
		conditions.push(gte(transactions.transactionDate, options.startDate));
	}

	if (options?.endDate) {
		conditions.push(lte(transactions.transactionDate, options.endDate));
	}

	if (options?.search) {
		conditions.push(
			or(
				ilike(transactions.description, `%${options.search}%`),
				ilike(transactions.transactionNumber, `%${options.search}%`)
			)
		);
	}

	const results = await db.query.transactions.findMany({
		where: and(...conditions),
		orderBy: [desc(transactions.transactionDate)],
		limit: options?.limit || 50,
		offset: options?.offset || 0,
	});

	return results;
}

/**
 * Update transaction
 */
export async function updateTransaction(input: UpdateTransactionInput): Promise<Transaction> {
	const { id, userId, ...updateData } = input;

	const [updated] = await db.update(transactions)
		.set({
			...updateData,
			updatedAt: new Date(),
		})
		.where(and(
			eq(transactions.id, id),
			eq(transactions.userId, userId || '')
		))
		.returning();

	return updated;
}

/**
 * Delete transaction
 */
export async function deleteTransaction(id: string, userId: string): Promise<void> {
	await db.delete(transactions)
		.where(and(
			eq(transactions.id, id),
			eq(transactions.userId, userId)
		));
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(
	id: string,
	userId: string,
	status: 'pending' | 'completed' | 'failed' | 'cancelled'
): Promise<Transaction> {
	const [updated] = await db.update(transactions)
		.set({
			status: status as any,
			processedAt: status === 'completed' ? new Date() : null,
			updatedAt: new Date(),
		})
		.where(and(
			eq(transactions.id, id),
			eq(transactions.userId, userId)
		))
		.returning();

	return updated;
}

/**
 * Get transaction statistics
 */
export async function getTransactionStats(userId: string): Promise<TransactionStats> {
	// Get basic stats
	const [basicStats] = await db
		.select({
			totalTransactions: sql<number>`count(*)`,
			totalInflow: sql<number>`sum(case when ${transactions.type} = 'income' and ${transactions.status} = 'completed' then ${transactions.amount}::numeric else 0 end)`,
			totalOutflow: sql<number>`sum(case when ${transactions.type} = 'expense' and ${transactions.status} = 'completed' then ${transactions.amount}::numeric else 0 end)`,
			pendingTransactions: sql<number>`count(case when ${transactions.status} = 'pending' then 1 end)`,
			completedTransactions: sql<number>`count(case when ${transactions.status} = 'completed' then 1 end)`,
		})
		.from(transactions)
		.where(eq(transactions.userId, userId));

	// Get category breakdown
	const categoryBreakdown = await db
		.select({
			category: transactions.category,
			amount: sql<number>`sum(${transactions.amount}::numeric)`,
			count: sql<number>`count(*)`,
		})
		.from(transactions)
		.where(and(
			eq(transactions.userId, userId),
			eq(transactions.status, 'completed')
		))
		.groupBy(transactions.category);

	// Get monthly trend (last 6 months)
	const sixMonthsAgo = new Date();
	sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

	const monthlyTrend = await db
		.select({
			month: sql<string>`to_char(${transactions.transactionDate}, 'YYYY-MM')`,
			inflow: sql<number>`sum(case when ${transactions.type} = 'credit' and ${transactions.status} = 'completed' then ${transactions.amount}::numeric else 0 end)`,
			outflow: sql<number>`sum(case when ${transactions.type} = 'debit' and ${transactions.status} = 'completed' then ${transactions.amount}::numeric else 0 end)`,
		})
		.from(transactions)
		.where(and(
			eq(transactions.userId, userId),
			gte(transactions.transactionDate, sixMonthsAgo)
		))
		.groupBy(sql`to_char(${transactions.transactionDate}, 'YYYY-MM')`)
		.orderBy(sql`to_char(${transactions.transactionDate}, 'YYYY-MM')`);

	const totalInflow = Number(basicStats?.totalInflow || 0);
	const totalOutflow = Number(basicStats?.totalOutflow || 0);
	const netFlow = totalInflow - totalOutflow;

	return {
		totalTransactions: Number(basicStats?.totalTransactions || 0),
		totalInflow,
		totalOutflow,
		netFlow,
		pendingTransactions: Number(basicStats?.pendingTransactions || 0),
		completedTransactions: Number(basicStats?.completedTransactions || 0),
		categoryBreakdown: categoryBreakdown.map(row => ({
			category: row.category,
			amount: Number(row.amount),
			count: Number(row.count),
		})),
		monthlyTrend: monthlyTrend.map(row => ({
			month: row.month,
			inflow: Number(row.inflow),
			outflow: Number(row.outflow),
			net: Number(row.inflow) - Number(row.outflow),
		})),
	};
}

/**
 * Reconcile transactions
 */
export async function reconcileTransactions(userId: string): Promise<{
	matched: number;
	unmatched: number;
	duplicates: number;
}> {
	// This is a placeholder for transaction reconciliation logic
	// In a real implementation, this would match transactions with bank statements
	// and identify duplicates or missing transactions
	
	const allTransactions = await getTransactions(userId, { limit: 1000 });
	
	// Simple duplicate detection based on amount and date
	const duplicates = new Map<string, Transaction[]>();
	allTransactions.forEach(transaction => {
		const key = `${transaction.amount}-${transaction.transactionDate.toISOString().split('T')[0]}`;
		if (!duplicates.has(key)) {
			duplicates.set(key, []);
		}
		duplicates.get(key)!.push(transaction);
	});

	const duplicateCount = Array.from(duplicates.values())
		.filter(group => group.length > 1)
		.reduce((sum, group) => sum + group.length - 1, 0);

	return {
		matched: allTransactions.length - duplicateCount,
		unmatched: 0, // Would be calculated from bank statement comparison
		duplicates: duplicateCount,
	};
}

// Export all transaction service functions
export const TransactionService = {
	create: createTransaction,
	getById: getTransactionById,
	getAll: getTransactions,
	update: updateTransaction,
	delete: deleteTransaction,
	updateStatus: updateTransactionStatus,
	getStats: getTransactionStats,
	reconcile: reconcileTransactions,
};
