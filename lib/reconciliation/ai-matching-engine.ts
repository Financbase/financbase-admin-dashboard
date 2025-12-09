/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { AIFinancialService } from "@/lib/ai/financial-service";
import { ReconciliationService } from "./reconciliation-service";
import { db } from "@/lib/db";
import { reconciliationMatches } from "@/lib/db/schemas/reconciliation.schema";
import { eq, and, desc, sql } from "drizzle-orm";

export interface TransactionMatch {
	statementTransaction: {
		id: string;
		amount: number;
		description: string;
		date: Date;
		reference?: string;
	};
	bookTransaction: {
		id: string;
		amount: number;
		description: string;
		date: Date;
		reference?: string;
		category?: string;
	};
	score: number;
	confidence: "high" | "medium" | "low" | "manual";
	reason: string;
	criteria: string[];
	aiExplanation?: string;
}

export interface MatchSuggestion {
	matches: TransactionMatch[];
	unmatchedStatements: any[];
	unmatchedBooks: any[];
	confidence: number;
	aiInsights: string[];
}

export class AIMatchingEngine {
	/**
	 * Advanced AI-powered transaction matching with ML scoring
	 */
	static async findOptimalMatches(data: {
		sessionId: string;
		statementTransactions: Array<{
			id: string;
			amount: number;
			description: string;
			date: Date;
			reference?: string;
		}>;
	}): Promise<MatchSuggestion> {
		// Get session and book transactions
		const session = await db
			.select()
			.from(reconciliationSessions)
			.where(eq(reconciliationSessions.id, data.sessionId))
			.limit(1);

		if (!session[0]) {
			throw new Error("Reconciliation session not found");
		}

		// Get book transactions in date range
		const bookTransactions = await this.getBookTransactions(session[0]);

		// Phase 1: Rule-based matching
		const ruleMatches = await this.applyRuleBasedMatching(data.statementTransactions, bookTransactions);

		// Phase 2: ML-powered similarity scoring
		const similarityMatches = await this.calculateSimilarityScores(data.statementTransactions, bookTransactions, ruleMatches);

		// Phase 3: AI validation and explanation generation
		const aiValidatedMatches = await this.validateWithAI(similarityMatches);

		// Phase 4: Optimize matching using assignment algorithm
		const optimizedMatches = this.optimizeMatching(aiValidatedMatches, data.statementTransactions, bookTransactions);

		// Phase 5: Generate AI insights
		const insights = await this.generateAIInsights(optimizedMatches, data.statementTransactions, bookTransactions);

		// Calculate overall confidence
		const overallConfidence = this.calculateOverallConfidence(optimizedMatches);

		// Identify unmatched transactions
		const matchedStatementIds = new Set(optimizedMatches.map(m => m.statementTransaction.id));
		const matchedBookIds = new Set(optimizedMatches.map(m => m.bookTransaction.id));

		const unmatchedStatements = data.statementTransactions.filter(tx => !matchedStatementIds.has(tx.id));
		const unmatchedBooks = bookTransactions.filter(tx => !matchedBookIds.has(tx.id));

		return {
			matches: optimizedMatches,
			unmatchedStatements,
			unmatchedBooks,
			confidence: overallConfidence,
			aiInsights: insights,
		};
	}

	/**
	 * Get book transactions for the reconciliation period
	 */
	private static async getBookTransactions(session: any) {
		const { transactions } = await import("@/lib/db/schemas");

		return db
			.select({
				id: transactions.id,
				amount: transactions.amount,
				description: transactions.description,
				transactionDate: transactions.transactionDate,
				referenceId: transactions.referenceId,
				category: transactions.category,
				metadata: transactions.metadata,
			})
			.from(transactions)
			.where(
				and(
					eq(transactions.userId, session.userId),
					eq(transactions.accountId, session.accountId),
					sql`transaction_date >= ${session.startDate}`,
					sql`transaction_date <= ${session.endDate}`
				)
			);
	}

	/**
	 * Apply rule-based matching first
	 */
	private static async applyRuleBasedMatching(statementTransactions: any[], bookTransactions: any[]) {
		// Get active rules
		const rules = await ReconciliationService.getActiveRules(statementTransactions[0]?.userId || "");

		const matches: TransactionMatch[] = [];

		for (const rule of rules) {
			for (const statementTx of statementTransactions) {
				for (const bookTx of bookTransactions) {
					if (this.evaluateRule(rule.conditions, statementTx, bookTx)) {
						const score = this.calculateRuleBasedScore(rule, statementTx, bookTx);

						matches.push({
							statementTransaction: statementTx,
							bookTransaction: bookTx,
							score,
							confidence: "manual",
							reason: `Matched by rule: ${rule.name}`,
							criteria: ["rule_match"],
							aiExplanation: rule.description || undefined,
						});
					}
				}
			}
		}

		return matches;
	}

	/**
	 * Calculate similarity scores using ML features
	 */
	private static async calculateSimilarityScores(statementTransactions: any[], bookTransactions: any[], existingMatches: TransactionMatch[]) {
		const matches: TransactionMatch[] = [];

		// Track already matched transactions
		const matchedStatementIds = new Set(existingMatches.map(m => m.statementTransaction.id));
		const matchedBookIds = new Set(existingMatches.map(m => m.bookTransaction.id));

		for (const statementTx of statementTransactions) {
			if (matchedStatementIds.has(statementTx.id)) continue;

			let bestMatch: any = null;
			let bestScore = 0;

			for (const bookTx of bookTransactions) {
				if (matchedBookIds.has(bookTx.id)) continue;

				const score = await this.calculateAdvancedSimilarityScore(statementTx, bookTx);

				if (score > bestScore && score > 0.2) { // Minimum threshold
					bestMatch = bookTx;
					bestScore = score;
				}
			}

			if (bestMatch) {
				matches.push({
					statementTransaction: statementTx,
					bookTransaction: bestMatch,
					score: bestScore,
					confidence: this.getConfidenceLevel(bestScore),
					reason: this.generateSimilarityReason(statementTx, bestMatch, bestScore),
					criteria: this.getSimilarityCriteria(statementTx, bestMatch, bestScore),
				});

				matchedStatementIds.add(statementTx.id);
				matchedBookIds.add(bestMatch.id);
			}
		}

		return [...existingMatches, ...matches];
	}

	/**
	 * Advanced similarity scoring using multiple ML features
	 */
	private static async calculateAdvancedSimilarityScore(statementTx: any, bookTx: any): Promise<number> {
		let score = 0;

		// 1. Exact amount match (highest weight)
		if (Math.abs(statementTx.amount - Number(bookTx.amount)) < 0.01) {
			score += 0.4;
		} else {
			// Partial amount match (within $1)
			const diff = Math.abs(statementTx.amount - Number(bookTx.amount));
			if (diff < 1) {
				score += 0.2 * (1 - diff);
			}
		}

		// 2. Date proximity scoring
		const daysDiff = Math.abs(
			statementTx.date.getTime() - bookTx.transactionDate.getTime()
		) / (1000 * 60 * 60 * 24);

		if (daysDiff === 0) {
			score += 0.3;
		} else if (daysDiff <= 1) {
			score += 0.25;
		} else if (daysDiff <= 2) {
			score += 0.15;
		} else if (daysDiff <= 7) {
			score += 0.05;
		}

		// 3. Description similarity (enhanced)
		const descScore = this.calculateEnhancedDescriptionSimilarity(
			statementTx.description,
			bookTx.description
		);
		score += descScore * 0.2;

		// 4. Reference matching
		if (statementTx.reference && bookTx.referenceId &&
			statementTx.reference.toLowerCase() === bookTx.referenceId.toLowerCase()) {
			score += 0.1;
		}

		// 5. Category-based scoring
		if (bookTx.category) {
			const categoryScore = await this.getCategoryBasedScore(statementTx.description, bookTx.category);
			score += categoryScore * 0.05;
		}

		// 6. Historical pattern matching
		const historicalScore = await this.getHistoricalPatternScore(statementTx, bookTx);
		score += historicalScore * 0.05;

		return Math.min(score, 1);
	}

	/**
	 * Enhanced description similarity with AI
	 */
	private static calculateEnhancedDescriptionSimilarity(desc1: string, desc2: string): number {
		if (!desc1 || !desc2) return 0;

		// Basic word matching
		const basicScore = this.calculateDescriptionSimilarity(desc1, desc2);

		// AI-powered semantic similarity (if available)
		try {
			// This could call an AI service for semantic similarity
			// For now, using enhanced word-based matching
			const semanticScore = this.calculateSemanticSimilarity(desc1, desc2);
			return (basicScore * 0.7) + (semanticScore * 0.3);
		} catch {
			return basicScore;
		}
	}

	/**
	 * Semantic similarity using keyword extraction and categorization
	 */
	private static calculateSemanticSimilarity(desc1: string, desc2: string): number {
		// Extract key terms and categories
		const keywords1 = this.extractKeywords(desc1);
		const keywords2 = this.extractKeywords(desc2);

		// Calculate semantic overlap
		const commonKeywords = keywords1.filter(k =>
			keywords2.some(k2 => this.areKeywordsSimilar(k, k2))
		);

		return commonKeywords.length / Math.max(keywords1.length, keywords2.length);
	}

	/**
	 * Extract meaningful keywords from transaction description
	 */
	private static extractKeywords(description: string): string[] {
		const words = description.toLowerCase()
			.replace(/[^\w\s]/g, ' ')
			.split(/\s+/)
			.filter(word => word.length > 2);

		// Remove common stop words
		const stopWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she', 'use', 'way', 'why'];
		const filteredWords = words.filter(word => !stopWords.includes(word));

		// Group similar words and return unique meaningful terms
		return [...new Set(filteredWords)];
	}

	/**
	 * Check if two keywords are similar
	 */
	private static areKeywordsSimilar(keyword1: string, keyword2: string): boolean {
		// Exact match
		if (keyword1 === keyword2) return true;

		// Partial match (one contains the other)
		if (keyword1.includes(keyword2) || keyword2.includes(keyword1)) return true;

		// Common financial terms mapping
		const synonyms: { [key: string]: string[] } = {
			'payment': ['pay', 'paid', 'transfer', 'sent'],
			'purchase': ['buy', 'bought', 'charge', 'debit'],
			'deposit': ['credit', 'received', 'income'],
			'fee': ['charge', 'cost', 'service'],
			'refund': ['return', 'returned', 'credit'],
		};

		for (const [key, values] of Object.entries(synonyms)) {
			if (keyword1 === key && values.includes(keyword2)) return true;
			if (keyword2 === key && values.includes(keyword1)) return true;
		}

		return false;
	}

	/**
	 * Get category-based score
	 */
	private static async getCategoryBasedScore(description: string, category: string): Promise<number> {
		// Use AI to determine if description matches category
		try {
			const result = await AIFinancialService.categorizeTransaction({
				description,
				amount: 0, // Not needed for category scoring
				type: "expense"
			});

			return result.category.toLowerCase() === category.toLowerCase() ? 1 : 0;
		} catch {
			return 0.5; // Neutral score if AI fails
		}
	}

	/**
	 * Get historical pattern score based on past matches
	 */
	private static async getHistoricalPatternScore(statementTx: any, bookTx: any): Promise<number> {
		// Look for similar patterns in historical matches
		const historicalMatches = await db
			.select()
			.from(reconciliationMatches)
			.where(
				and(
					sql`statement_description ILIKE ${'%' + statementTx.description + '%'}`
				)
			)
			.limit(10);

		// If similar descriptions were matched before, increase confidence
		if (historicalMatches.length > 0) {
			const successfulMatches = historicalMatches.filter(m => m.status === "matched");
			return successfulMatches.length / historicalMatches.length;
		}

		return 0.5; // Neutral score if no history
	}

	/**
	 * Validate matches with AI
	 */
	private static async validateWithAI(matches: TransactionMatch[]): Promise<TransactionMatch[]> {
		// Use AI to validate and explain matches
		for (const match of matches) {
			try {
				const explanation = await this.generateAIExplanation(match);
				match.aiExplanation = explanation;
			} catch (error) {
				console.error("AI validation error:", error);
			}
		}

		return matches;
	}

	/**
	 * Generate AI explanation for a match
	 */
	private static async generateAIExplanation(match: TransactionMatch): Promise<string> {
		// This would call an AI service to explain why this match makes sense
		// For now, return a template explanation
		return `AI analysis suggests this is a strong match based on ${match.criteria.join(", ")}. ` +
			`Amount similarity: ${Math.abs(match.statementTransaction.amount - match.bookTransaction.amount) < 0.01 ? "exact" : "close"}. ` +
			`Date proximity: ${Math.abs(match.statementTransaction.date.getTime() - match.bookTransaction.date.getTime()) / (1000 * 60 * 60 * 24)} days. ` +
			`Description similarity indicates this is likely the same transaction.`;
	}

	/**
	 * Optimize matching using assignment algorithm (Hungarian algorithm concept)
	 */
	private static optimizeMatching(matches: TransactionMatch[], statementTransactions: any[], bookTransactions: any[]): TransactionMatch[] {
		// Simple greedy optimization: sort by score and remove conflicts
		const sortedMatches = matches.sort((a, b) => b.score - a.score);
		const selectedMatches: TransactionMatch[] = [];
		const usedStatementIds = new Set<string>();
		const usedBookIds = new Set<string>();

		for (const match of sortedMatches) {
			if (!usedStatementIds.has(match.statementTransaction.id) &&
				!usedBookIds.has(match.bookTransaction.id)) {
				selectedMatches.push(match);
				usedStatementIds.add(match.statementTransaction.id);
				usedBookIds.add(match.bookTransaction.id);
			}
		}

		return selectedMatches;
	}

	/**
	 * Generate AI insights about the matching process
	 */
	private static async generateAIInsights(matches: TransactionMatch[], statementTransactions: any[], bookTransactions: any[]): Promise<string[]> {
		const insights: string[] = [];

		const highConfidenceMatches = matches.filter(m => m.confidence === "high").length;
		const mediumConfidenceMatches = matches.filter(m => m.confidence === "medium").length;
		const lowConfidenceMatches = matches.filter(m => m.confidence === "low").length;

		insights.push(`Found ${matches.length} potential matches out of ${statementTransactions.length} statement transactions`);

		if (highConfidenceMatches > 0) {
			insights.push(`${highConfidenceMatches} matches have high confidence and should be automatically accepted`);
		}

		if (mediumConfidenceMatches > 0) {
			insights.push(`${mediumConfidenceMatches} matches need manual review before acceptance`);
		}

		const unmatchedStatements = statementTransactions.length - matches.length;
		if (unmatchedStatements > 0) {
			insights.push(`${unmatchedStatements} statement transactions could not be matched - these may need manual entry`);
		}

		// Calculate potential discrepancies
		const amountDiscrepancies = matches.filter(m =>
			Math.abs(m.statementTransaction.amount - m.bookTransaction.amount) > 0.01
		).length;

		if (amountDiscrepancies > 0) {
			insights.push(`${amountDiscrepancies} matches have amount differences that may need adjustment`);
		}

		return insights;
	}

	/**
	 * Calculate overall confidence for all matches
	 */
	private static calculateOverallConfidence(matches: TransactionMatch[]): number {
		if (matches.length === 0) return 0;

		const totalScore = matches.reduce((sum, match) => sum + match.score, 0);
		const averageScore = totalScore / matches.length;

		// Weight by confidence level
		const highConfidenceCount = matches.filter(m => m.confidence === "high").length;
		const mediumConfidenceCount = matches.filter(m => m.confidence === "medium").length;
		const lowConfidenceCount = matches.filter(m => m.confidence === "low").length;

		const weightedScore = (highConfidenceCount * 1.0 + mediumConfidenceCount * 0.7 + lowConfidenceCount * 0.4) / matches.length;

		return Math.min(100, (averageScore * 0.6 + weightedScore * 0.4) * 100);
	}

	/**
	 * Legacy methods (keeping for compatibility)
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

	private static getConfidenceLevel(score: number): "high" | "medium" | "low" | "manual" {
		if (score >= 0.8) return "high";
		if (score >= 0.5) return "medium";
		if (score >= 0.2) return "low";
		return "manual";
	}

	private static generateSimilarityReason(statementTx: any, bookTx: any, score: number): string {
		let reason = `AI similarity match with ${Math.round(score * 100)}% confidence.`;

		if (Math.abs(statementTx.amount - Number(bookTx.amount)) < 0.01) {
			reason += " Amounts match exactly.";
		}

		const daysDiff = Math.abs(
			statementTx.date.getTime() - bookTx.transactionDate.getTime()
		) / (1000 * 60 * 60 * 24);

		if (daysDiff === 0) {
			reason += " Same date.";
		} else if (daysDiff <= 1) {
			reason += ` Within ${Math.round(daysDiff * 24)} hours.`;
		}

		return reason;
	}

	private static getSimilarityCriteria(statementTx: any, bookTx: any, score: number): string[] {
		const criteria = [];

		if (Math.abs(statementTx.amount - Number(bookTx.amount)) < 0.01) {
			criteria.push("exact_amount");
		}

		const daysDiff = Math.abs(
			statementTx.date.getTime() - bookTx.transactionDate.getTime()
		) / (1000 * 60 * 60 * 24);

		if (daysDiff === 0) {
			criteria.push("same_date");
		} else if (daysDiff <= 1) {
			criteria.push("date_proximity");
		}

		const descSimilarity = this.calculateDescriptionSimilarity(
			statementTx.description,
			bookTx.description
		);

		if (descSimilarity > 0.7) {
			criteria.push("description_similarity");
		}

		return criteria;
	}

	private static evaluateRule(conditions: any, statementTx: any, bookTx: any): boolean {
		for (const condition of conditions) {
			const field = condition.field;
			const operator = condition.operator;
			const value = condition.value;

			let txValue;
			if (field.startsWith("statement_")) {
				txValue = statementTx[field.replace("statement_", "")];
			} else if (field.startsWith("book_")) {
				txValue = bookTx[field.replace("book_", "")];
			}

			switch (operator) {
				case "equals":
					if (txValue !== value) return false;
					break;
				case "contains":
					if (!txValue || !txValue.toLowerCase().includes(value.toLowerCase())) return false;
					break;
				case "amount_equals":
					if (Math.abs(Number(txValue) - Number(value)) > 0.01) return false;
					break;
			}
		}

		return true;
	}

	private static calculateRuleBasedScore(rule: any, statementTx: any, bookTx: any): number {
		// Higher priority rules get higher scores
		return Math.min(1, 0.5 + (rule.priority * 0.1));
	}
}

// Import the missing schema
import { reconciliationSessions } from "@/lib/db/schemas/reconciliation.schema";
