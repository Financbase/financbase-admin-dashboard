/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import {
	type BankTransaction,
	type InternalTransaction,
	type ReconciliationMatch,
	type ReconciliationSession,
	bankTransactions,
	internalTransactions,
	reconciliationMatches,
	reconciliationRules,
	reconciliationSessions,
} from "@/drizzle/schema/financial-reconciliation";
import { db } from "@/lib/db";
import { EncryptionService } from "@/lib/services/encryption.service";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

export interface ReconciliationCriteria {
	amountTolerance?: number; // Default 0.01
	dateTolerance?: number; // Days, default 3
	minAmount?: number;
	maxAmount?: number;
	descriptionKeywords?: string[];
	categoryFilter?: string[];
}

export interface MatchResult {
	bankTransaction: BankTransaction;
	internalTransaction: InternalTransaction;
	confidence: "high" | "medium" | "low";
	matchType: "exact" | "fuzzy" | "manual";
	amountDifference: number;
	dateDifference: number;
	descriptionSimilarity: number;
}

/**
 * Financial Reconciliation Service
 *
 * Handles matching bank transactions to internal book transactions
 * for accurate financial reporting and fraud detection.
 */
export class FinancialReconciliationService {
	private encryptionKey: string;

	constructor() {
		this.encryptionKey = process.env.RECONCILIATION_ENCRYPTION_KEY || "";
		if (!this.encryptionKey) {
			throw new Error(
				"RECONCILIATION_ENCRYPTION_KEY environment variable is required",
			);
		}
	}

	/**
	 * Create a new reconciliation session
	 */
	async createSession(
		userId: string,
		organizationId: number | undefined,
		sessionData: {
			name: string;
			description?: string;
			type?:
				| "bank_to_book"
				| "inter_company"
				| "account_reconciliation"
				| "vendor_reconciliation";
			periodStart: Date;
			periodEnd: Date;
			toleranceAmount?: number;
			toleranceDays?: number;
		},
	): Promise<ReconciliationSession> {
		const session = await db
			.insert(reconciliationSessions)
			.values({
				userId,
				organizationId,
				name: sessionData.name,
				description: sessionData.description,
				type: sessionData.type || "bank_to_book",
				periodStart: sessionData.periodStart,
				periodEnd: sessionData.periodEnd,
				toleranceAmount: sessionData.toleranceAmount?.toString() || "0.01",
				toleranceDays: sessionData.toleranceDays || 3,
			})
			.returning();

		return session[0];
	}

	/**
	 * Import bank transactions from external sources (Plaid, etc.)
	 */
	async importBankTransactions(
		sessionId: string,
		transactions: Array<{
			bankAccountId: string;
			transactionId: string;
			date: Date;
			amount: number;
			description: string;
			reference?: string;
			memo?: string;
			category?: string;
			merchant?: string;
			isPending?: boolean;
		}>,
	): Promise<void> {
		// Check for existing transactions to avoid duplicates
		const existingIds = transactions.map((t) => t.transactionId);
		const existing = await db
			.select({ transactionId: bankTransactions.transactionId })
			.from(bankTransactions)
			.where(sql`transaction_id IN ${existingIds}`);

		const existingSet = new Set(existing.map((e) => e.transactionId));

		// Filter out existing transactions
		const newTransactions = transactions.filter(
			(t) => !existingSet.has(t.transactionId),
		);

		if (newTransactions.length === 0) {
			return;
		}

		await db.insert(bankTransactions).values(
			newTransactions.map((t) => ({
				sessionId,
				bankAccountId: t.bankAccountId,
				transactionId: t.transactionId,
				date: t.date,
				amount: t.amount.toString(),
				description: t.description,
				reference: t.reference,
				memo: t.memo,
				category: t.category,
				merchant: t.merchant,
				isPending: t.isPending || false,
			})),
		);

		// Update session transaction count
		await this.updateSessionCounts(sessionId);
	}

	/**
	 * Import internal transactions from our books
	 */
	async importInternalTransactions(
		sessionId: string,
		transactions: Array<{
			entityType: string;
			entityId: string;
			date: Date;
			amount: number;
			description: string;
			account: string;
		}>,
	): Promise<void> {
		await db.insert(internalTransactions).values(
			transactions.map((t) => ({
				sessionId,
				entityType: t.entityType,
				entityId: t.entityId,
				date: t.date,
				amount: t.amount.toString(),
				description: t.description,
				account: t.account,
			})),
		);

		// Update session transaction count
		await this.updateSessionCounts(sessionId);
	}

	/**
	 * Find potential matches between bank and internal transactions
	 */
	async findMatches(
		sessionId: string,
		criteria?: ReconciliationCriteria,
	): Promise<MatchResult[]> {
		const session = await this.getSession(sessionId);
		if (!session) {
			throw new Error("Session not found");
		}

		const bankTxns = await db
			.select()
			.from(bankTransactions)
			.where(
				and(
					eq(bankTransactions.sessionId, sessionId),
					eq(bankTransactions.isReconciled, false),
				),
			);

		const internalTxns = await db
			.select()
			.from(internalTransactions)
			.where(
				and(
					eq(internalTransactions.sessionId, sessionId),
					eq(internalTransactions.isReconciled, false),
				),
			);

		const matches: MatchResult[] = [];
		const toleranceAmount = criteria?.amountTolerance || 0.01;
		const toleranceDays = criteria?.toleranceDays || 3;

		// Compare each bank transaction with each internal transaction
		for (const bankTxn of bankTxns) {
			for (const internalTxn of internalTxns) {
				const match = this.calculateMatch(
					bankTxn,
					internalTxn,
					toleranceAmount,
					toleranceDays,
				);

				if (match) {
					matches.push({
						bankTransaction: bankTxn,
						internalTransaction: internalTxn,
						confidence: match.confidence,
						matchType: match.matchType,
						amountDifference: match.amountDifference,
						dateDifference: match.dateDifference,
						descriptionSimilarity: match.descriptionSimilarity,
					});
				}
			}
		}

		// Sort by confidence (high first)
		return matches.sort((a, b) => {
			const confidenceOrder = { high: 3, medium: 2, low: 1 };
			return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
		});
	}

	/**
	 * Calculate match score between two transactions
	 */
	private calculateMatch(
		bankTxn: BankTransaction,
		internalTxn: InternalTransaction,
		amountTolerance: number,
		dateTolerance: number,
	): {
		confidence: "high" | "medium" | "low";
		matchType: "exact" | "fuzzy";
		amountDifference: number;
		dateDifference: number;
		descriptionSimilarity: number;
	} | null {
		const bankAmount = Number.parseFloat(bankTxn.amount);
		const internalAmount = Number.parseFloat(internalTxn.amount);
		const amountDifference = Math.abs(bankAmount - internalAmount);

		// Amount must be within tolerance
		if (amountDifference > amountTolerance) {
			return null;
		}

		const dateDifference = Math.abs(
			(new Date(bankTxn.date).getTime() -
				new Date(internalTxn.date).getTime()) /
				(1000 * 60 * 60 * 24),
		);

		// Date must be within tolerance
		if (dateDifference > dateTolerance) {
			return null;
		}

		// Calculate description similarity
		const descriptionSimilarity = this.calculateDescriptionSimilarity(
			bankTxn.description,
			internalTxn.description,
		);

		// Determine confidence based on multiple factors
		let confidence: "high" | "medium" | "low" = "low";
		let matchType: "exact" | "fuzzy" = "fuzzy";

		if (
			amountDifference === 0 &&
			dateDifference === 0 &&
			descriptionSimilarity > 0.8
		) {
			confidence = "high";
			matchType = "exact";
		} else if (
			amountDifference <= amountTolerance / 2 &&
			dateDifference <= 1 &&
			descriptionSimilarity > 0.5
		) {
			confidence = "medium";
		}

		return {
			confidence,
			matchType,
			amountDifference,
			dateDifference,
			descriptionSimilarity,
		};
	}

	/**
	 * Calculate similarity between two descriptions using string matching
	 */
	private calculateDescriptionSimilarity(desc1: string, desc2: string): number {
		if (!desc1 || !desc2) return 0;

		// Normalize descriptions
		const normalize = (str: string) =>
			str
				.toLowerCase()
				.replace(/[^\w\s]/g, "")
				.split(/\s+/);

		const words1 = new Set(normalize(desc1));
		const words2 = new Set(normalize(desc2));

		// Calculate Jaccard similarity
		const intersection = new Set([...words1].filter((x) => words2.has(x)));
		const union = new Set([...words1, ...words2]);

		return intersection.size / union.size;
	}

	/**
	 * Create a manual match between transactions
	 */
	async createMatch(
		sessionId: string,
		bankTransactionId: string,
		internalTransactionId: string,
		matchedBy: string,
		notes?: string,
	): Promise<void> {
		await db.insert(reconciliationMatches).values({
			sessionId,
			bankTransactionId,
			internalTransactionId,
			status: "matched",
			confidence: "manual",
			matchType: "manual",
			matchedBy,
			matchedAt: new Date(),
			notes,
		});

		// Mark transactions as reconciled
		await db
			.update(bankTransactions)
			.set({ isReconciled: true, updatedAt: new Date() })
			.where(eq(bankTransactions.id, bankTransactionId));

		await db
			.update(internalTransactions)
			.set({ isReconciled: true, updatedAt: new Date() })
			.where(eq(internalTransactions.id, internalTransactionId));

		// Update session counts
		await this.updateSessionCounts(sessionId);
	}

	/**
	 * Get reconciliation session with statistics
	 */
	async getSession(sessionId: string): Promise<ReconciliationSession | null> {
		return await db
			.select()
			.from(reconciliationSessions)
			.where(eq(reconciliationSessions.id, sessionId))
			.then((result) => result[0] || null);
	}

	/**
	 * Update session transaction counts and status
	 */
	private async updateSessionCounts(sessionId: string): Promise<void> {
		const stats = await db
			.select({
				totalBank: sql<number>`COUNT(${bankTransactions.id})`,
				matchedBank: sql<number>`COUNT(CASE WHEN ${bankTransactions.isReconciled} = true THEN 1 END)`,
				totalInternal: sql<number>`COUNT(${internalTransactions.id})`,
				matchedInternal: sql<number>`COUNT(CASE WHEN ${internalTransactions.isReconciled} = true THEN 1 END)`,
			})
			.from(reconciliationSessions)
			.leftJoin(
				bankTransactions,
				eq(bankTransactions.sessionId, reconciliationSessions.id),
			)
			.leftJoin(
				internalTransactions,
				eq(internalTransactions.sessionId, reconciliationSessions.id),
			)
			.where(eq(reconciliationSessions.id, sessionId))
			.groupBy(reconciliationSessions.id);

		if (stats.length > 0) {
			const stat = stats[0];
			const totalTransactions = stat.totalBank + stat.totalInternal;
			const matchedTransactions = stat.matchedBank + stat.matchedInternal;
			const unmatchedTransactions = totalTransactions - matchedTransactions;

			await db
				.update(reconciliationSessions)
				.set({
					totalTransactions,
					matchedTransactions,
					unmatchedTransactions,
					status:
						totalTransactions > 0 && matchedTransactions === totalTransactions
							? "completed"
							: "active",
					completedAt:
						totalTransactions > 0 && matchedTransactions === totalTransactions
							? new Date()
							: null,
					updatedAt: new Date(),
				})
				.where(eq(reconciliationSessions.id, sessionId));
		}
	}

	/**
	 * Get unmatched transactions for a session
	 */
	async getUnmatchedTransactions(
		sessionId: string,
		type: "bank" | "internal",
	): Promise<BankTransaction[] | InternalTransaction[]> {
		if (type === "bank") {
			return await db
				.select()
				.from(bankTransactions)
				.where(
					and(
						eq(bankTransactions.sessionId, sessionId),
						eq(bankTransactions.isReconciled, false),
					),
				);
		}
		return await db
			.select()
			.from(internalTransactions)
			.where(
				and(
					eq(internalTransactions.sessionId, sessionId),
					eq(internalTransactions.isReconciled, false),
				),
			);
	}

	/**
	 * Generate reconciliation report
	 */
	async generateReport(sessionId: string): Promise<{
		session: ReconciliationSession;
		summary: {
			totalBankTransactions: number;
			totalInternalTransactions: number;
			matchedTransactions: number;
			unmatchedTransactions: number;
			totalBankAmount: number;
			totalInternalAmount: number;
			difference: number;
		};
		matches: ReconciliationMatch[];
		unmatchedBank: BankTransaction[];
		unmatchedInternal: InternalTransaction[];
	}> {
		const session = await this.getSession(sessionId);
		if (!session) {
			throw new Error("Session not found");
		}

		const [
			bankTotals,
			internalTotals,
			matches,
			unmatchedBank,
			unmatchedInternal,
		] = await Promise.all([
			// Bank totals
			db
				.select({
					count: sql<number>`COUNT(*)`,
					total: sql<number>`SUM(CAST(${bankTransactions.amount} AS DECIMAL))`,
				})
				.from(bankTransactions)
				.where(eq(bankTransactions.sessionId, sessionId)),

			// Internal totals
			db
				.select({
					count: sql<number>`COUNT(*)`,
					total: sql<number>`SUM(CAST(${internalTransactions.amount} AS DECIMAL))`,
				})
				.from(internalTransactions)
				.where(eq(internalTransactions.sessionId, sessionId)),

			// All matches
			db
				.select()
				.from(reconciliationMatches)
				.where(eq(reconciliationMatches.sessionId, sessionId)),

			// Unmatched bank transactions
			this.getUnmatchedTransactions(sessionId, "bank"),

			// Unmatched internal transactions
			this.getUnmatchedTransactions(sessionId, "internal"),
		]);

		const bankTotal = bankTotals[0];
		const internalTotal = internalTotals[0];

		return {
			session,
			summary: {
				totalBankTransactions: bankTotal?.count || 0,
				totalInternalTransactions: internalTotal?.count || 0,
				matchedTransactions: matches.length,
				unmatchedTransactions:
					(bankTotal?.count || 0) +
					(internalTotal?.count || 0) -
					matches.length,
				totalBankAmount: Number.parseFloat(bankTotal?.total || "0"),
				totalInternalAmount: Number.parseFloat(internalTotal?.total || "0"),
				difference: Math.abs(
					Number.parseFloat(bankTotal?.total || "0") -
						Number.parseFloat(internalTotal?.total || "0"),
				),
			},
			matches,
			unmatchedBank: unmatchedBank as BankTransaction[],
			unmatchedInternal: unmatchedInternal as InternalTransaction[],
		};
	}
}
