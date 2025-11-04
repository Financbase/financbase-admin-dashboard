/**
 * Account Service
 * Business logic for financial account management
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
import { accounts, type Account } from '@/lib/db/schemas/accounts.schema';
import { transactions } from '@/lib/db/schemas/transactions.schema';
import { eq, and, desc, ilike, or, sql, gte, lte } from 'drizzle-orm';
import { NotificationHelpers } from './notification-service';

interface CreateAccountInput {
	userId: string;
	accountName: string;
	accountType: 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan' | 'other';
	bankName?: string;
	accountNumber?: string;
	lastFourDigits?: string;
	routingNumber?: string;
	swiftCode?: string;
	iban?: string;
	currency?: string;
	openingBalance?: number;
	creditLimit?: number;
	interestRate?: number;
	notes?: string;
	metadata?: Record<string, unknown>;
}

interface UpdateAccountInput extends Partial<CreateAccountInput> {
	id: string;
}

interface AccountStats {
	totalAccounts: number;
	activeAccounts: number;
	totalBalance: number;
	totalCreditLimit: number;
	availableCredit: number;
	accountsByType: Array<{
		type: string;
		count: number;
		totalBalance: number;
	}>;
	recentActivity: Array<{
		accountId: string;
		accountName: string;
		transactionCount: number;
		totalAmount: number;
		lastActivity: string;
	}>;
}

interface ReconciliationResult {
	accountId: string;
	accountName: string;
	bookBalance: number;
	bankBalance: number;
	difference: number;
	lastReconciled: string | null;
	needsReconciliation: boolean;
	unreconciledTransactions: number;
}

/**
 * Create a new account
 */
export async function createAccount(input: CreateAccountInput): Promise<Account> {
	try {
		const [account] = await db.insert(accounts).values({
			userId: input.userId,
			accountName: input.accountName,
			accountType: input.accountType,
			bankName: input.bankName,
			accountNumber: input.accountNumber,
			lastFourDigits: input.lastFourDigits,
			routingNumber: input.routingNumber,
			swiftCode: input.swiftCode,
			iban: input.iban,
			currency: input.currency || 'USD',
			openingBalance: input.openingBalance?.toString() || '0',
			currentBalance: input.openingBalance?.toString() || '0',
			availableBalance: input.openingBalance?.toString() || '0',
			creditLimit: input.creditLimit?.toString(),
			interestRate: input.interestRate?.toString(),
			notes: input.notes,
			metadata: input.metadata ? JSON.stringify(input.metadata) : null,
		}).returning();

		// Send notification
		await NotificationHelpers.sendAccountCreated(account.id, input.userId);

		return account;
	} catch (error) {
		console.error('Error creating account:', error);
		throw new Error('Failed to create account');
	}
}

/**
 * Get account by ID
 */
export async function getAccountById(accountId: string, userId: string): Promise<Account | null> {
	const account = await db.query.accounts.findFirst({
		where: and(
			eq(accounts.id, accountId),
			eq(accounts.userId, userId)
		),
	});

	return account || null;
}

/**
 * Get all accounts for a user with pagination and filtering
 */
export async function getPaginatedAccounts(
	userId: string,
	options: {
		page?: number;
		limit?: number;
		search?: string;
		accountType?: string;
		status?: string;
	} = {}
): Promise<{
	accounts: Account[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}> {
	const {
		page = 1,
		limit = 20,
		search,
		accountType,
		status
	} = options;

	const offset = (page - 1) * limit;

	// Build where conditions
	const whereConditions = [eq(accounts.userId, userId)];
	
	if (search) {
		whereConditions.push(
			or(
				ilike(accounts.accountName, `%${search}%`),
				ilike(accounts.bankName, `%${search}%`),
				ilike(accounts.lastFourDigits, `%${search}%`)
			)!
		);
	}
	
	if (accountType) {
		whereConditions.push(eq(accounts.accountType, accountType as any));
	}
	
	if (status) {
		whereConditions.push(eq(accounts.status, status as any));
	}

	// Get accounts
	const accountsList = await db
		.select()
		.from(accounts)
		.where(and(...whereConditions))
		.orderBy(desc(accounts.createdAt))
		.limit(limit)
		.offset(offset);

	// Get total count
	const [totalResult] = await db
		.select({ count: sql<number>`count(*)` })
		.from(accounts)
		.where(and(...whereConditions));

	const total = totalResult?.count || 0;
	const totalPages = Math.ceil(total / limit);

	return {
		accounts: accountsList,
		total,
		page,
		limit,
		totalPages,
	};
}

/**
 * Update account
 */
export async function updateAccount(
	accountId: string,
	userId: string,
	updateData: Partial<CreateAccountInput>
): Promise<Account> {
	try {
		const [updatedAccount] = await db
			.update(accounts)
			.set({
				accountName: updateData.accountName,
				accountType: updateData.accountType,
				bankName: updateData.bankName,
				accountNumber: updateData.accountNumber,
				lastFourDigits: updateData.lastFourDigits,
				routingNumber: updateData.routingNumber,
				swiftCode: updateData.swiftCode,
				iban: updateData.iban,
				currency: updateData.currency,
				creditLimit: updateData.creditLimit?.toString(),
				interestRate: updateData.interestRate?.toString(),
				notes: updateData.notes,
				metadata: updateData.metadata ? JSON.stringify(updateData.metadata) : undefined,
				updatedAt: new Date(),
			})
			.where(and(
				eq(accounts.id, accountId),
				eq(accounts.userId, userId)
			))
			.returning();

		if (!updatedAccount) {
			throw new Error('Account not found');
		}

		// Send notification
		await NotificationHelpers.sendAccountUpdated(accountId, userId);

		return updatedAccount;
	} catch (error) {
		console.error('Error updating account:', error);
		throw new Error('Failed to update account');
	}
}

/**
 * Delete account
 */
export async function deleteAccount(accountId: string, userId: string): Promise<void> {
	try {
		// Check if account has transactions
		const [transactionCount] = await db
			.select({ count: sql<number>`count(*)` })
			.from(transactions)
			.where(eq(transactions.accountId, accountId));

		if (transactionCount?.count > 0) {
			throw new Error('Cannot delete account with existing transactions');
		}

		await db
			.delete(accounts)
			.where(and(
				eq(accounts.id, accountId),
				eq(accounts.userId, userId)
			));

		// Send notification
		await NotificationHelpers.sendAccountDeleted(accountId, userId);
	} catch (error) {
		console.error('Error deleting account:', error);
		throw new Error('Failed to delete account');
	}
}

/**
 * Update account balance
 */
export async function updateAccountBalance(
	accountId: string,
	userId: string,
	balance: number,
	availableBalance?: number
): Promise<Account> {
	try {
		const [updatedAccount] = await db
			.update(accounts)
			.set({
				currentBalance: balance.toString(),
				availableBalance: availableBalance?.toString() || balance.toString(),
				lastSyncAt: new Date(),
				updatedAt: new Date(),
			})
			.where(and(
				eq(accounts.id, accountId),
				eq(accounts.userId, userId)
			))
			.returning();

		if (!updatedAccount) {
			throw new Error('Account not found');
		}

		return updatedAccount;
	} catch (error) {
		console.error('Error updating account balance:', error);
		throw new Error('Failed to update account balance');
	}
}

/**
 * Reconcile account
 */
export async function reconcileAccount(
	accountId: string,
	userId: string,
	bankBalance: number
): Promise<Account> {
	try {
		const account = await getAccountById(accountId, userId);
		if (!account) {
			throw new Error('Account not found');
		}

		const [reconciledAccount] = await db
			.update(accounts)
			.set({
				currentBalance: bankBalance.toString(),
				availableBalance: bankBalance.toString(),
				isReconciled: true,
				lastReconciledAt: new Date(),
				updatedAt: new Date(),
			})
			.where(and(
				eq(accounts.id, accountId),
				eq(accounts.userId, userId)
			))
			.returning();

		// Send notification
		await NotificationHelpers.sendAccountReconciled(accountId, userId);

		return reconciledAccount;
	} catch (error) {
		console.error('Error reconciling account:', error);
		throw new Error('Failed to reconcile account');
	}
}

/**
 * Get account statistics
 */
export async function getAccountStats(userId: string): Promise<AccountStats> {
	// Get basic stats
	const [basicStats] = await db
		.select({
			totalAccounts: sql<number>`count(*)`,
			activeAccounts: sql<number>`count(case when ${accounts.status} = 'active' then 1 end)`,
			totalBalance: sql<number>`sum(${accounts.currentBalance}::numeric)`,
			totalCreditLimit: sql<number>`sum(case when ${accounts.creditLimit} is not null then ${accounts.creditLimit}::numeric else 0 end)`,
		})
		.from(accounts)
		.where(eq(accounts.userId, userId));

	// Get accounts by type
	const accountsByType = await db
		.select({
			type: accounts.accountType,
			count: sql<number>`count(*)`,
			totalBalance: sql<number>`sum(${accounts.currentBalance}::numeric)`,
		})
		.from(accounts)
		.where(and(
			eq(accounts.userId, userId),
			eq(accounts.status, 'active')
		))
		.groupBy(accounts.accountType);

	// Get recent activity
	const recentActivity = await db
		.select({
			accountId: transactions.accountId,
			transactionCount: sql<number>`count(*)`,
			totalAmount: sql<number>`sum(${transactions.amount}::numeric)`,
			lastActivity: sql<string>`max(${transactions.createdAt})`,
		})
		.from(transactions)
		.innerJoin(accounts, eq(transactions.accountId, accounts.id))
		.where(and(
			eq(accounts.userId, userId),
			gte(transactions.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
		))
		.groupBy(transactions.accountId);

	// Get account names for recent activity
	const accountNames = await db
		.select({
			id: accounts.id,
			accountName: accounts.accountName,
		})
		.from(accounts)
		.where(and(
			eq(accounts.userId, userId),
			eq(accounts.status, 'active')
		));

	const accountNameMap = new Map(accountNames.map(acc => [acc.id, acc.accountName]));

	return {
		totalAccounts: basicStats?.totalAccounts || 0,
		activeAccounts: basicStats?.activeAccounts || 0,
		totalBalance: Number(basicStats?.totalBalance || 0),
		totalCreditLimit: Number(basicStats?.totalCreditLimit || 0),
		availableCredit: Number(basicStats?.totalCreditLimit || 0) - Number(basicStats?.totalBalance || 0),
		accountsByType: accountsByType.map(type => ({
			type: type.type,
			count: type.count,
			totalBalance: Number(type.totalBalance),
		})),
		recentActivity: recentActivity.map(activity => ({
			accountId: activity.accountId || '',
			accountName: accountNameMap.get(activity.accountId || '') || 'Unknown Account',
			transactionCount: activity.transactionCount,
			totalAmount: Number(activity.totalAmount),
			lastActivity: activity.lastActivity,
		})),
	};
}

/**
 * Get reconciliation status for all accounts
 */
export async function getReconciliationStatus(userId: string): Promise<ReconciliationResult[]> {
	const accountsList = await db
		.select()
		.from(accounts)
		.where(and(
			eq(accounts.userId, userId),
			eq(accounts.status, 'active')
		));

	const results: ReconciliationResult[] = [];

	for (const account of accountsList) {
		// Get unreconciled transactions count
		const [unreconciledCount] = await db
			.select({ count: sql<number>`count(*)` })
			.from(transactions)
			.where(and(
				eq(transactions.accountId, account.id),
				eq(transactions.status, 'pending')
			));

		const bookBalance = Number(account.currentBalance);
		const bankBalance = Number(account.availableBalance);
		const difference = Math.abs(bookBalance - bankBalance);
		const needsReconciliation = difference > 0.01 || (unreconciledCount?.count || 0) > 0;

		results.push({
			accountId: account.id,
			accountName: account.accountName,
			bookBalance,
			bankBalance,
			difference,
			lastReconciled: account.lastReconciledAt?.toISOString() || null,
			needsReconciliation,
			unreconciledTransactions: unreconciledCount?.count || 0,
		});
	}

	return results;
}

/**
 * Set primary account
 */
export async function setPrimaryAccount(accountId: string, userId: string): Promise<Account> {
	try {
		// First, unset all other primary accounts
		await db
			.update(accounts)
			.set({ isPrimary: false })
			.where(eq(accounts.userId, userId));

		// Set the new primary account
		const [primaryAccount] = await db
			.update(accounts)
			.set({
				isPrimary: true,
				updatedAt: new Date(),
			})
			.where(and(
				eq(accounts.id, accountId),
				eq(accounts.userId, userId)
			))
			.returning();

		if (!primaryAccount) {
			throw new Error('Account not found');
		}

		return primaryAccount;
	} catch (error) {
		console.error('Error setting primary account:', error);
		throw new Error('Failed to set primary account');
	}
}

// Export all account service functions
export const AccountService = {
	createAccount,
	getAccountById,
	getPaginatedAccounts,
	updateAccount,
	deleteAccount,
	updateAccountBalance,
	reconcileAccount,
	getAccountStats,
	getReconciliationStatus,
	setPrimaryAccount,
};
