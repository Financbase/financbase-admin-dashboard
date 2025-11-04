/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from "@/lib/db/connection";
import {
	clientCommunications,
	clientInteractions,
	leadScores,
} from "@/lib/db/schemas/crm.schema";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import {} from "lucide-react";

export interface ScoringFactors {
	engagement: number; // 0-30 points
	recency: number; // 0-20 points
	frequency: number; // 0-20 points
	monetary: number; // 0-15 points
	behavior: number; // 0-15 points
}

export interface LeadScoreData {
	clientId: string;
	score: number;
	factors: ScoringFactors;
	metadata?: Record<string, unknown>;
}

export interface ScoringRule {
	factor: keyof ScoringFactors;
	condition: string;
	points: number;
	description: string;
}

export class LeadScoringService {
	private scoringRules: ScoringRule[] = [
		// Engagement rules
		{
			factor: "engagement",
			condition: "email_open",
			points: 2,
			description: "Email opened",
		},
		{
			factor: "engagement",
			condition: "email_click",
			points: 5,
			description: "Email link clicked",
		},
		{
			factor: "engagement",
			condition: "website_visit",
			points: 3,
			description: "Website visited",
		},
		{
			factor: "engagement",
			condition: "demo_request",
			points: 15,
			description: "Demo requested",
		},
		{
			factor: "engagement",
			condition: "download",
			points: 8,
			description: "Resource downloaded",
		},

		// Recency rules
		{
			factor: "recency",
			condition: "last_7_days",
			points: 20,
			description: "Active in last 7 days",
		},
		{
			factor: "recency",
			condition: "last_30_days",
			points: 15,
			description: "Active in last 30 days",
		},
		{
			factor: "recency",
			condition: "last_90_days",
			points: 10,
			description: "Active in last 90 days",
		},

		// Frequency rules
		{
			factor: "frequency",
			condition: "high_frequency",
			points: 20,
			description: "High interaction frequency",
		},
		{
			factor: "frequency",
			condition: "medium_frequency",
			points: 15,
			description: "Medium interaction frequency",
		},
		{
			factor: "frequency",
			condition: "low_frequency",
			points: 10,
			description: "Low interaction frequency",
		},

		// Monetary rules
		{
			factor: "monetary",
			condition: "high_value",
			points: 15,
			description: "High monetary value",
		},
		{
			factor: "monetary",
			condition: "medium_value",
			points: 10,
			description: "Medium monetary value",
		},
		{
			factor: "monetary",
			condition: "low_value",
			points: 5,
			description: "Low monetary value",
		},

		// Behavior rules
		{
			factor: "behavior",
			condition: "support_ticket",
			points: 5,
			description: "Created support ticket",
		},
		{
			factor: "behavior",
			condition: "payment",
			points: 10,
			description: "Made payment",
		},
		{
			factor: "behavior",
			condition: "referral",
			points: 15,
			description: "Referred others",
		},
	];

	/**
	 * Calculate lead score for a client
	 */
	async calculateLeadScore(
		clientId: string,
		days = 90,
	): Promise<LeadScoreData> {
		try {
			const dateFrom = new Date();
			dateFrom.setDate(dateFrom.getDate() - days);

			// Get interactions
			const interactions = await db
				.select()
				.from(clientInteractions)
				.where(
					and(
						eq(clientInteractions.clientId, clientId),
						gte(clientInteractions.createdAt, dateFrom),
					),
				);

			// Get communications
			const communications = await db
				.select()
				.from(clientCommunications)
				.where(
					and(
						eq(clientCommunications.clientId, clientId),
						gte(clientCommunications.createdAt, dateFrom),
					),
				);

			// Calculate factors
			const factors = await this.calculateScoringFactors(
				clientId,
				interactions,
				communications,
				dateFrom,
			);

			// Calculate total score
			const totalScore = Object.values(factors).reduce(
				(sum, value) => sum + value,
				0,
			);

			// Cap score at 100
			const cappedScore = Math.min(totalScore, 100);

			const scoreData: LeadScoreData = {
				clientId,
				score: cappedScore,
				factors,
				metadata: {
					interactionsCount: interactions.length,
					communicationsCount: communications.length,
					calculatedAt: new Date(),
					period: days,
				},
			};

			return scoreData;
		} catch (error) {
			console.error("Error calculating lead score:", error);
			throw new Error("Failed to calculate lead score");
		}
	}

	/**
	 * Calculate individual scoring factors
	 */
	private async calculateScoringFactors(
		clientId: string,
		interactions: any[],
		communications: any[],
		dateFrom: Date,
	): Promise<ScoringFactors> {
		const factors: ScoringFactors = {
			engagement: 0,
			recency: 0,
			frequency: 0,
			monetary: 0,
			behavior: 0,
		};

		// Engagement scoring
		for (const interaction of interactions) {
			const rule = this.scoringRules.find(
				(r) => r.condition === interaction.interactionType,
			);
			if (rule && rule.factor === "engagement") {
				factors.engagement += rule.points;
			}
		}

		// Recency scoring
		const now = new Date();
		const lastActivity =
			interactions.length > 0
				? new Date(
						Math.max(
							...interactions.map((i) => new Date(i.createdAt).getTime()),
						),
					)
				: null;

		if (lastActivity) {
			const daysSinceActivity = Math.floor(
				(now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
			);

			if (daysSinceActivity <= 7) {
				factors.recency = 20;
			} else if (daysSinceActivity <= 30) {
				factors.recency = 15;
			} else if (daysSinceActivity <= 90) {
				factors.recency = 10;
			}
		}

		// Frequency scoring
		const totalInteractions = interactions.length;
		if (totalInteractions >= 20) {
			factors.frequency = 20;
		} else if (totalInteractions >= 10) {
			factors.frequency = 15;
		} else if (totalInteractions >= 5) {
			factors.frequency = 10;
		}

		// Monetary scoring (placeholder - would need actual revenue data)
		// This would typically come from invoice/payment data
		factors.monetary = 0; // Placeholder

		// Behavior scoring
		for (const interaction of interactions) {
			const rule = this.scoringRules.find(
				(r) => r.condition === interaction.interactionType,
			);
			if (rule && rule.factor === "behavior") {
				factors.behavior += rule.points;
			}
		}

		return factors;
	}

	/**
	 * Save lead score to database
	 */
	async saveLeadScore(scoreData: LeadScoreData) {
		try {
			// Get previous score for comparison
			const [previousScore] = await db
				.select()
				.from(leadScores)
				.where(eq(leadScores.clientId, scoreData.clientId))
				.orderBy(desc(leadScores.lastUpdated))
				.limit(1);

			const scoreChange = previousScore
				? scoreData.score - previousScore.score
				: scoreData.score;

			const [newScore] = await db
				.insert(leadScores)
				.values({
					clientId: scoreData.clientId,
					score: scoreData.score,
					factors: scoreData.factors,
					previousScore: previousScore?.score,
					scoreChange,
					metadata: scoreData.metadata,
				})
				.returning();

			return newScore;
		} catch (error) {
			console.error("Error saving lead score:", error);
			throw new Error("Failed to save lead score");
		}
	}

	/**
	 * Get lead score for a client
	 */
	async getLeadScore(clientId: string) {
		try {
			const [score] = await db
				.select()
				.from(leadScores)
				.where(eq(leadScores.clientId, clientId))
				.orderBy(desc(leadScores.lastUpdated))
				.limit(1);

			return score;
		} catch (error) {
			console.error("Error getting lead score:", error);
			throw new Error("Failed to retrieve lead score");
		}
	}

	/**
	 * Get all lead scores with filtering
	 */
	async getAllLeadScores(
		filters?: {
			minScore?: number;
			maxScore?: number;
			dateFrom?: Date;
			dateTo?: Date;
		},
		limit = 100,
		offset = 0,
	) {
		try {
			let query = db
				.select()
				.from(leadScores)
				.orderBy(desc(leadScores.lastUpdated))
				.limit(limit)
				.offset(offset);

			if (filters?.minScore !== undefined) {
				query = query.where(gte(leadScores.score, filters.minScore));
			}

			if (filters?.maxScore !== undefined) {
				query = query.where(lte(leadScores.score, filters.maxScore));
			}

			if (filters?.dateFrom) {
				query = query.where(gte(leadScores.lastUpdated, filters.dateFrom));
			}

			if (filters?.dateTo) {
				query = query.where(lte(leadScores.lastUpdated, filters.dateTo));
			}

			const scores = await query;
			return scores;
		} catch (error) {
			console.error("Error getting all lead scores:", error);
			throw new Error("Failed to retrieve lead scores");
		}
	}

	/**
	 * Get lead score distribution
	 */
	async getLeadScoreDistribution() {
		try {
			const scores = await db
				.select()
				.from(leadScores)
				.orderBy(desc(leadScores.lastUpdated));

			const distribution = {
				hot: scores.filter((s) => s.score >= 80).length,
				warm: scores.filter((s) => s.score >= 50 && s.score < 80).length,
				cold: scores.filter((s) => s.score < 50).length,
				total: scores.length,
			};

			return distribution;
		} catch (error) {
			console.error("Error getting lead score distribution:", error);
			throw new Error("Failed to retrieve lead score distribution");
		}
	}

	/**
	 * Record a client interaction
	 */
	async recordInteraction(
		clientId: string,
		interactionType: string,
		source?: string,
		value?: number,
		metadata?: Record<string, unknown>,
	) {
		try {
			const [interaction] = await db
				.insert(clientInteractions)
				.values({
					clientId,
					interactionType,
					source,
					value: value || 0,
					metadata,
				})
				.returning();

			// Recalculate score after new interaction
			await this.recalculateScore(clientId);

			return interaction;
		} catch (error) {
			console.error("Error recording interaction:", error);
			throw new Error("Failed to record interaction");
		}
	}

	/**
	 * Recalculate score for a client
	 */
	async recalculateScore(clientId: string) {
		try {
			const scoreData = await this.calculateLeadScore(clientId);
			await this.saveLeadScore(scoreData);
			return scoreData;
		} catch (error) {
			console.error("Error recalculating score:", error);
			throw new Error("Failed to recalculate score");
		}
	}

	/**
	 * Get scoring insights and recommendations
	 */
	async getScoringInsights(clientId: string) {
		try {
			const score = await this.getLeadScore(clientId);
			if (!score) {
				return null;
			}

			const insights = {
				currentScore: score.score,
				scoreChange: score.scoreChange,
				factors: score.factors,
				recommendations: this.generateRecommendations(score.factors),
				nextActions: this.generateNextActions(score.score, score.factors),
			};

			return insights;
		} catch (error) {
			console.error("Error getting scoring insights:", error);
			throw new Error("Failed to retrieve scoring insights");
		}
	}

	/**
	 * Generate recommendations based on scoring factors
	 */
	private generateRecommendations(factors: ScoringFactors): string[] {
		const recommendations: string[] = [];

		if (factors.engagement < 10) {
			recommendations.push(
				"Increase engagement through targeted email campaigns",
			);
		}

		if (factors.recency < 10) {
			recommendations.push("Re-engage with recent content or offers");
		}

		if (factors.frequency < 10) {
			recommendations.push(
				"Increase interaction frequency with regular touchpoints",
			);
		}

		if (factors.behavior < 5) {
			recommendations.push(
				"Encourage specific actions like demo requests or downloads",
			);
		}

		return recommendations;
	}

	/**
	 * Generate next actions based on score
	 */
	private generateNextActions(
		score: number,
		factors: ScoringFactors,
	): string[] {
		const actions: string[] = [];

		if (score >= 80) {
			actions.push("Prioritize for sales outreach");
			actions.push("Schedule demo or meeting");
			actions.push("Prepare proposal");
		} else if (score >= 50) {
			actions.push("Continue nurturing campaign");
			actions.push("Send relevant content");
			actions.push("Monitor for engagement signals");
		} else {
			actions.push("Re-engage with valuable content");
			actions.push("Segment for targeted campaigns");
			actions.push("Consider lead qualification");
		}

		return actions;
	}
}
