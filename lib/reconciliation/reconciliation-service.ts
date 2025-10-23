import { db } from "@/lib/db";
import {
	reconciliationSessions,
	reconciliationMatches,
	reconciliationRules,
	reconciliationDiscrepancies,
	transactionCategorizationHistory,
	transactionReconciliation,
} from "@/lib/db/schemas/reconciliation.schema";
import { transactions, accounts } from "@/lib/db/schemas";
import { users } from "@/lib/db/schemas/users.schema";
import { desc, eq, and, gte, lte, inArray, sql } from "drizzle-orm";

export class ReconciliationService {
	/**
	 * Create a new reconciliation session
	 */
	static async createReconciliationSession(data: {
		userId: string;
		accountId: string;
		name: string;
		description?: string;
		type: "bank_statement" | "credit_card" | "investment_account" | "manual";
		startDate: Date;
		endDate: Date;
		statementBalance?: number;
	}) {
		return db.insert(reconciliationSessions).values({
			userId: data.userId,
			accountId: data.accountId,
			name: data.name,
			description: data.description,
			type: data.type,
			startDate: data.startDate,
			endDate: data.endDate,
			statementBalance: data.statementBalance?.toString(),
			status: "pending",
		}).returning();
	}

	/**
	 * Get reconciliation session with all related data
	 */
	static async getReconciliationSession(sessionId: string) {
		return db
			.select({
				session: reconciliationSessions,
				matches: reconciliationMatches,
				discrepancies: reconciliationDiscrepancies,
				account: accounts,
				user: users,
			})
			.from(reconciliationSessions)
			.leftJoin(reconciliationMatches, eq(reconciliationMatches.sessionId, reconciliationSessions.id))
			.leftJoin(reconciliationDiscrepancies, eq(reconciliationDiscrepancies.sessionId, reconciliationSessions.id))
			.leftJoin(accounts, eq(accounts.id, reconciliationSessions.accountId))
			.leftJoin(users, eq(users.id, reconciliationSessions.userId))
			.where(eq(reconciliationSessions.id, sessionId));
	}

	/**
	 * Find potential transaction matches using AI-powered scoring
	 */
	static async findPotentialMatches(data: {
		sessionId: string;
		statementTransactions: Array<{
			id: string;
			amount: number;
			description: string;
			date: Date;
			reference?: string;
		}>;
	}) {
		// Get session details
		const session = await db
			.select()
			.from(reconciliationSessions)
			.where(eq(reconciliationSessions.id, data.sessionId))
			.limit(1);

		if (!session[0]) {
			throw new Error("Reconciliation session not found");
		}

		// Get book transactions in the date range
		const bookTransactions = await db
			.select({
				id: transactions.id,
				amount: transactions.amount,
				description: transactions.description,
				transactionDate: transactions.transactionDate,
				referenceId: transactions.referenceId,
				category: transactions.category,
				isReconciled: transactionReconciliation.isReconciled,
			})
			.from(transactions)
			.leftJoin(transactionReconciliation, eq(transactionReconciliation.transactionId, transactions.id))
			.where(
				and(
					eq(transactions.userId, session[0].userId),
					eq(transactions.accountId, session[0].accountId),
					gte(transactions.transactionDate, session[0].startDate),
					lte(transactions.transactionDate, session[0].endDate),
					sql`COALESCE(${transactionReconciliation.isReconciled}, false) = false`
				)
			);

		// AI-powered matching logic
		const matches = [];

		for (const statementTx of data.statementTransactions) {
			let bestMatch = null;
			let bestScore = 0;

			for (const bookTx of bookTransactions) {
				const score = this.calculateMatchScore(statementTx, bookTx);

				if (score > bestScore && score > 0.3) { // Minimum confidence threshold
					bestMatch = bookTx;
					bestScore = score;
				}
			}

			if (bestMatch) {
				matches.push({
					sessionId: data.sessionId,
					statementTransactionId: statementTx.id,
					statementAmount: statementTx.amount.toString(),
					statementDescription: statementTx.description,
					statementDate: statementTx.date,
					statementReference: statementTx.reference,
					bookTransactionId: bestMatch.id,
					bookAmount: bestMatch.amount.toString(),
					bookDescription: bestMatch.description,
					bookDate: bestMatch.transactionDate,
					bookReference: bestMatch.referenceId,
					confidenceScore: bestScore * 100,
					confidence: this.getConfidenceLevel(bestScore),
					matchCriteria: this.getMatchCriteria(statementTx, bestMatch, bestScore),
					matchReason: this.generateMatchReason(statementTx, bestMatch, bestScore),
				});
			}
		}

		return matches;
	}

	/**
	 * Calculate match score between statement and book transactions
	 */
	private static calculateMatchScore(statementTx: any, bookTx: any): number {
		let score = 0;

		// Amount matching (highest weight)
		if (Math.abs(statementTx.amount - Number(bookTx.amount)) < 0.01) {
			score += 0.5;
		} else if (Math.abs(statementTx.amount - Number(bookTx.amount)) < 1) {
			score += 0.3;
		}

		// Date proximity (within 3 days)
		const daysDiff = Math.abs(
			statementTx.date.getTime() - bookTx.transactionDate.getTime()
		) / (1000 * 60 * 60 * 24);

		if (daysDiff === 0) {
			score += 0.3;
		} else if (daysDiff <= 1) {
			score += 0.2;
		} else if (daysDiff <= 3) {
			score += 0.1;
		}

		// Description similarity
		const descriptionScore = this.calculateDescriptionSimilarity(
			statementTx.description,
			bookTx.description
		);
		score += descriptionScore * 0.2;

		return Math.min(score, 1);
	}

	/**
	 * Calculate description similarity using simple text matching
	 */
	private static calculateDescriptionSimilarity(desc1: string, desc2: string): number {
		if (!desc1 || !desc2) return 0;

		const words1 = desc1.toLowerCase().split(/\s+/);
		const words2 = desc2.toLowerCase().split(/\s+/);

		const commonWords = words1.filter(word =>
			words2.some(w2 => w2.includes(word) || word.includes(w2))
		);

		return commonWords.length / Math.max(words1.length, words2.length);
	}

	/**
	 * Get confidence level based on score
	 */
	private static getConfidenceLevel(score: number): "high" | "medium" | "low" | "manual" {
		if (score >= 0.8) return "high";
		if (score >= 0.5) return "medium";
		if (score >= 0.3) return "low";
		return "manual";
	}

	/**
	 * Generate match criteria explanation
	 */
	private static getMatchCriteria(statementTx: any, bookTx: any, score: number): any {
		const criteria = [];

		if (Math.abs(statementTx.amount - Number(bookTx.amount)) < 0.01) {
			criteria.push("exact_amount_match");
		}

		const daysDiff = Math.abs(
			statementTx.date.getTime() - bookTx.transactionDate.getTime()
		) / (1000 * 60 * 60 * 24);

		if (daysDiff === 0) {
			criteria.push("same_date");
		} else if (daysDiff <= 1) {
			criteria.push("date_within_1_day");
		}

		const descSimilarity = this.calculateDescriptionSimilarity(
			statementTx.description,
			bookTx.description
		);

		if (descSimilarity > 0.7) {
			criteria.push("high_description_similarity");
		} else if (descSimilarity > 0.4) {
			criteria.push("medium_description_similarity");
		}

		return criteria;
	}

	/**
	 * Generate AI explanation for the match
	 */
	private static generateMatchReason(statementTx: any, bookTx: any, score: number): string {
		let reason = `AI matched transactions with ${Math.round(score * 100)}% confidence. `;

		if (Math.abs(statementTx.amount - Number(bookTx.amount)) < 0.01) {
			reason += "Amounts match exactly. ";
		}

		const daysDiff = Math.abs(
			statementTx.date.getTime() - bookTx.transactionDate.getTime()
		) / (1000 * 60 * 60 * 24);

		if (daysDiff === 0) {
			reason += "Transaction dates are identical. ";
		} else if (daysDiff <= 1) {
			reason += `Transactions occurred within ${Math.round(daysDiff * 24)} hour(s). `;
		}

		const descSimilarity = this.calculateDescriptionSimilarity(
			statementTx.description,
			bookTx.description
		);

		if (descSimilarity > 0.7) {
			reason += "Descriptions are very similar.";
		} else if (descSimilarity > 0.4) {
			reason += "Descriptions show moderate similarity.";
		}

		return reason;
	}

	/**
	 * Save matches to database
	 */
	static async saveMatches(matches: any[]) {
		if (matches.length === 0) return [];

		return db.insert(reconciliationMatches).values(matches).returning();
	}

	/**
	 * Get active reconciliation rules for a user
	 */
	static async getActiveRules(userId: string, accountId?: string) {
		const conditions = [eq(reconciliationRules.userId, userId), eq(reconciliationRules.isActive, true)];

		if (accountId) {
			conditions.push(eq(reconciliationRules.accountId, accountId));
		}

		return db
			.select()
			.from(reconciliationRules)
			.where(and(...conditions))
			.orderBy(desc(reconciliationRules.priority));
	}

	/**
	 * Create a reconciliation rule
	 */
	static async createRule(data: {
		userId: string;
		accountId?: string;
		name: string;
		description?: string;
		conditions: any;
		actions: any;
		priority?: number;
		tags?: string;
	}) {
		return db.insert(reconciliationRules).values({
			userId: data.userId,
			accountId: data.accountId,
			name: data.name,
			description: data.description,
			conditions: data.conditions,
			actions: data.actions,
			priority: data.priority || 1,
			tags: data.tags,
		}).returning();
	}

	/**
	 * Apply rules to transactions and create matches
	 */
	static async applyRules(sessionId: string) {
		const session = await db
			.select()
			.from(reconciliationSessions)
			.where(eq(reconciliationSessions.id, sessionId))
			.limit(1);

		if (!session[0]) {
			throw new Error("Reconciliation session not found");
		}

		// Get active rules
		const rules = await this.getActiveRules(session[0].userId, session[0].accountId);

		// Get unmatched transactions for this session
		const unmatchedTransactions = await db
			.select({
				id: reconciliationMatches.id,
				statementAmount: reconciliationMatches.statementAmount,
				statementDescription: reconciliationMatches.statementDescription,
				statementDate: reconciliationMatches.statementDate,
				bookTransactionId: reconciliationMatches.bookTransactionId,
			})
			.from(reconciliationMatches)
			.where(
				and(
					eq(reconciliationMatches.sessionId, sessionId),
					eq(reconciliationMatches.status, "unmatched")
				)
			);

		const appliedMatches = [];

		for (const rule of rules) {
			for (const match of unmatchedTransactions) {
				if (this.evaluateRule(rule.conditions, match)) {
					// Apply rule actions
					const updatedMatch = await this.applyRuleActions(rule.actions, match);

					if (updatedMatch) {
						appliedMatches.push({
							...match,
							...updatedMatch,
							status: "matched",
							confidence: "manual",
							matchReason: `Applied rule: ${rule.name}`,
						});

						// Update rule usage statistics
						await db
							.update(reconciliationRules)
							.set({
								timesUsed: sql`${reconciliationRules.timesUsed} + 1`,
								lastUsedAt: new Date(),
							})
							.where(eq(reconciliationRules.id, rule.id));
					}
				}
			}
		}

		if (appliedMatches.length > 0) {
			await db.insert(reconciliationMatches).values(appliedMatches).returning();
		}

		return appliedMatches.length;
	}

	/**
	 * Evaluate if a rule condition matches a transaction
	 */
	private static evaluateRule(conditions: any, transaction: any): boolean {
		// Simple rule evaluation logic
		// In a real implementation, this would use a more sophisticated rule engine

		for (const condition of conditions) {
			const field = condition.field;
			const operator = condition.operator;
			const value = condition.value;

			const txValue = transaction[field];

			switch (operator) {
				case "equals":
					if (txValue !== value) return false;
					break;
				case "contains":
					if (!txValue || !txValue.toLowerCase().includes(value.toLowerCase())) return false;
					break;
				case "greater_than":
					if (Number(txValue) <= Number(value)) return false;
					break;
				case "less_than":
					if (Number(txValue) >= Number(value)) return false;
					break;
			}
		}

		return true;
	}

	/**
	 * Apply rule actions to a transaction
	 */
	private static async applyRuleActions(actions: any, match: any) {
		// Simple action application
		// In a real implementation, this would support more complex actions

		const updates: any = {};

		for (const action of actions) {
			switch (action.type) {
				case "set_category":
					updates.category = action.value;
					break;
				case "add_note":
					updates.notes = action.value;
					break;
				case "set_amount":
					updates.adjustedAmount = action.value;
					updates.adjustmentReason = `Rule applied: ${action.reason}`;
					break;
			}
		}

		if (Object.keys(updates).length > 0) {
			await db
				.update(reconciliationMatches)
				.set(updates)
				.where(eq(reconciliationMatches.id, match.id));

			return updates;
		}

		return null;
	}

	/**
	 * Complete a reconciliation session
	 */
	static async completeReconciliationSession(sessionId: string, data: {
		bookBalance?: number;
		notes?: string;
		aiRecommendations?: any;
	}) {
		const session = await db
			.select()
			.from(reconciliationSessions)
			.where(eq(reconciliationSessions.id, sessionId))
			.limit(1);

		if (!session[0]) {
			throw new Error("Reconciliation session not found");
		}

		// Calculate final statistics
		const matches = await db
			.select()
			.from(reconciliationMatches)
			.where(eq(reconciliationMatches.sessionId, sessionId));

		const matchedCount = matches.filter(m => m.status === "matched").length;
		const unmatchedCount = matches.filter(m => m.status === "unmatched").length;

		// Find discrepancies
		const discrepancies = await db
			.select()
			.from(reconciliationDiscrepancies)
			.where(eq(reconciliationDiscrepancies.sessionId, sessionId));

		const difference = Number(session[0].statementBalance || 0) - (data.bookBalance || 0);

		return db
			.update(reconciliationSessions)
			.set({
				status: "completed",
				matchedTransactions: matchedCount,
				unmatchedTransactions: unmatchedCount,
				discrepanciesFound: discrepancies.length,
				bookBalance: data.bookBalance?.toString(),
				difference: difference.toString(),
				aiRecommendations: data.aiRecommendations,
				aiConfidence: this.calculateSessionConfidence(matches, discrepancies),
				notes: data.notes,
				completedAt: new Date(),
			})
			.where(eq(reconciliationSessions.id, sessionId))
			.returning();
	}

	/**
	 * Calculate overall confidence for the reconciliation session
	 */
	private static calculateSessionConfidence(matches: any[], discrepancies: any[]): number {
		if (matches.length === 0) return 0;

		const matchedCount = matches.filter(m => m.status === "matched").length;
		const highConfidenceMatches = matches.filter(m =>
			m.status === "matched" && m.confidence === "high"
		).length;

		const matchRate = matchedCount / matches.length;
		const highConfidenceRate = highConfidenceMatches / matchedCount;

		// Reduce confidence based on discrepancies
		const discrepancyPenalty = discrepancies.length * 0.1;

		let confidence = (matchRate * 0.7) + (highConfidenceRate * 0.3) - discrepancyPenalty;
		return Math.max(0, Math.min(100, confidence * 100));
	}

	/**
	 * Get reconciliation dashboard data
	 */
	static async getDashboardData(userId: string) {
		// Get recent sessions
		const recentSessions = await db
			.select({
				id: reconciliationSessions.id,
				name: reconciliationSessions.name,
				status: reconciliationSessions.status,
				completedAt: reconciliationSessions.completedAt,
				matchedTransactions: reconciliationSessions.matchedTransactions,
				unmatchedTransactions: reconciliationSessions.unmatchedTransactions,
				aiConfidence: reconciliationSessions.aiConfidence,
				difference: reconciliationSessions.difference,
			})
			.from(reconciliationSessions)
			.where(eq(reconciliationSessions.userId, userId))
			.orderBy(desc(reconciliationSessions.createdAt))
			.limit(10);

		// Get account reconciliation status
		const accountStatus = await db
			.select({
				accountId: accounts.id,
				accountName: accounts.accountName,
				lastReconciled: accounts.lastReconciledAt,
				isReconciled: accounts.isReconciled,
				totalTransactions: sql`COUNT(${transactions.id})`,
				reconciledTransactions: sql`COUNT(CASE WHEN ${transactionReconciliation.isReconciled} = true THEN 1 END)`,
			})
			.from(accounts)
			.leftJoin(transactions, eq(transactions.accountId, accounts.id))
			.leftJoin(transactionReconciliation, eq(transactionReconciliation.transactionId, transactions.id))
			.where(eq(accounts.userId, userId))
			.groupBy(accounts.id, accounts.accountName, accounts.lastReconciledAt, accounts.isReconciled);

		// Get pending discrepancies
		const pendingDiscrepancies = await db
			.select({
				id: reconciliationDiscrepancies.id,
				type: reconciliationDiscrepancies.type,
				severity: reconciliationDiscrepancies.severity,
				description: reconciliationDiscrepancies.description,
				sessionName: reconciliationSessions.name,
			})
			.from(reconciliationDiscrepancies)
			.leftJoin(reconciliationSessions, eq(reconciliationSessions.id, reconciliationDiscrepancies.sessionId))
			.where(
				and(
					eq(reconciliationDiscrepancies.status, "open"),
					eq(reconciliationSessions.userId, userId)
				)
			)
			.orderBy(desc(reconciliationDiscrepancies.createdAt))
			.limit(20);

		return {
			recentSessions,
			accountStatus,
			pendingDiscrepancies,
		};
	}
}
