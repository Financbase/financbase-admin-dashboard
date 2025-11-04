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
	clientLifecycleStages,
	crmAutomationExecutions,
	crmAutomationRules,
	leadScores,
} from "@/lib/db/schemas/crm.schema";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import {
	ArrowUp,
	ArrowUpDown,
	BarChart3,
	CheckCircle,
	Clock,
	CreditCard,
	Filter,
	Headphones,
	Key,
	MessageCircle,
	User,
	Workflow,
	XCircle,
} from "lucide-react";

export type LifecycleStage =
	| "lead"
	| "prospect"
	| "qualified"
	| "customer"
	| "at_risk"
	| "churned"
	| "inactive";

export interface StageTransition {
	clientId: string;
	newStage: LifecycleStage;
	previousStage?: LifecycleStage;
	reason?: string;
	changedBy: string;
	metadata?: Record<string, unknown>;
}

export interface AutomationRule {
	name: string;
	description?: string;
	triggerType:
		| "stage_change"
		| "score_change"
		| "interaction"
		| "time_based"
		| "custom";
	triggerConditions: Record<string, unknown>;
	actions: Record<string, unknown>;
	isActive: boolean;
	createdBy: string;
}

export interface AtRiskClient {
	clientId: string;
	currentStage: LifecycleStage;
	riskFactors: string[];
	riskScore: number;
	lastActivity: Date;
	recommendedActions: string[];
}

export class LifecycleManagementService {
	/**
	 * Transition a client to a new lifecycle stage
	 */
	async transitionStage(transition: StageTransition) {
		try {
			// Deactivate current stage
			await db
				.update(clientLifecycleStages)
				.set({ isActive: false })
				.where(
					and(
						eq(clientLifecycleStages.clientId, transition.clientId),
						eq(clientLifecycleStages.isActive, true),
					),
				);

			// Create new stage record
			const [newStage] = await db
				.insert(clientLifecycleStages)
				.values({
					clientId: transition.clientId,
					stage: transition.newStage,
					previousStage: transition.previousStage,
					reason: transition.reason,
					changedBy: transition.changedBy,
					metadata: transition.metadata,
				})
				.returning();

			// Trigger automation rules
			await this.triggerAutomationRules(transition.clientId, "stage_change", {
				newStage: transition.newStage,
				previousStage: transition.previousStage,
				reason: transition.reason,
			});

			return newStage;
		} catch (error) {
			console.error("Error transitioning stage:", error);
			throw new Error("Failed to transition client stage");
		}
	}

	/**
	 * Get current stage for a client
	 */
	async getCurrentStage(clientId: string) {
		try {
			const [stage] = await db
				.select()
				.from(clientLifecycleStages)
				.where(
					and(
						eq(clientLifecycleStages.clientId, clientId),
						eq(clientLifecycleStages.isActive, true),
					),
				)
				.orderBy(desc(clientLifecycleStages.changedAt))
				.limit(1);

			return stage;
		} catch (error) {
			console.error("Error getting current stage:", error);
			throw new Error("Failed to retrieve current stage");
		}
	}

	/**
	 * Get stage history for a client
	 */
	async getStageHistory(clientId: string, limit = 20) {
		try {
			const stages = await db
				.select()
				.from(clientLifecycleStages)
				.where(eq(clientLifecycleStages.clientId, clientId))
				.orderBy(desc(clientLifecycleStages.changedAt))
				.limit(limit);

			return stages;
		} catch (error) {
			console.error("Error getting stage history:", error);
			throw new Error("Failed to retrieve stage history");
		}
	}

	/**
	 * Identify at-risk clients
	 */
	async identifyAtRiskClients(days = 30): Promise<AtRiskClient[]> {
		try {
			const dateThreshold = new Date();
			dateThreshold.setDate(dateThreshold.getDate() - days);

			// Get clients with recent activity
			const recentClients = await db
				.select()
				.from(clientLifecycleStages)
				.where(
					and(
						eq(clientLifecycleStages.isActive, true),
						gte(clientLifecycleStages.changedAt, dateThreshold),
					),
				);

			const atRiskClients: AtRiskClient[] = [];

			for (const client of recentClients) {
				const riskFactors: string[] = [];
				let riskScore = 0;

				// Check for inactivity
				const lastCommunication = await this.getLastCommunication(
					client.clientId,
				);
				if (lastCommunication) {
					const daysSinceCommunication = Math.floor(
						(Date.now() - new Date(lastCommunication.createdAt).getTime()) /
							(1000 * 60 * 60 * 24),
					);

					if (daysSinceCommunication > 14) {
						riskFactors.push("No communication in 14+ days");
						riskScore += 30;
					}
				}

				// Check for declining engagement
				const leadScore = await this.getLatestLeadScore(client.clientId);
				if (leadScore?.scoreChange && leadScore.scoreChange < -10) {
					riskFactors.push("Declining lead score");
					riskScore += 25;
				}

				// Check for support tickets
				const supportTickets = await this.getRecentSupportTickets(
					client.clientId,
					30,
				);
				if (supportTickets.length > 3) {
					riskFactors.push("Multiple support tickets");
					riskScore += 20;
				}

				// Check for payment issues
				const paymentIssues = await this.getPaymentIssues(client.clientId);
				if (paymentIssues.length > 0) {
					riskFactors.push("Payment issues detected");
					riskScore += 35;
				}

				if (riskScore > 50 || riskFactors.length > 0) {
					atRiskClients.push({
						clientId: client.clientId,
						currentStage: client.stage as LifecycleStage,
						riskFactors,
						riskScore,
						lastActivity: client.changedAt,
						recommendedActions: this.generateRiskMitigationActions(riskFactors),
					});
				}
			}

			return atRiskClients.sort((a, b) => b.riskScore - a.riskScore);
		} catch (error) {
			console.error("Error identifying at-risk clients:", error);
			throw new Error("Failed to identify at-risk clients");
		}
	}

	/**
	 * Create automation rule
	 */
	async createAutomationRule(rule: AutomationRule) {
		try {
			const [newRule] = await db
				.insert(crmAutomationRules)
				.values({
					name: rule.name,
					description: rule.description,
					triggerType: rule.triggerType,
					triggerConditions: rule.triggerConditions,
					actions: rule.actions,
					isActive: rule.isActive,
					createdBy: rule.createdBy,
				})
				.returning();

			return newRule;
		} catch (error) {
			console.error("Error creating automation rule:", error);
			throw new Error("Failed to create automation rule");
		}
	}

	/**
	 * Trigger automation rules for a client
	 */
	async triggerAutomationRules(
		clientId: string,
		triggerType: string,
		triggerData: Record<string, unknown>,
	) {
		try {
			const rules = await db
				.select()
				.from(crmAutomationRules)
				.where(
					and(
						eq(crmAutomationRules.triggerType, triggerType),
						eq(crmAutomationRules.isActive, true),
					),
				);

			const executions = [];

			for (const rule of rules) {
				// Check if rule conditions are met
				if (
					await this.evaluateRuleConditions(rule.triggerConditions, triggerData)
				) {
					const execution = await this.executeAutomationRule(
						rule,
						clientId,
						triggerData,
					);
					executions.push(execution);
				}
			}

			return executions;
		} catch (error) {
			console.error("Error triggering automation rules:", error);
			throw new Error("Failed to trigger automation rules");
		}
	}

	/**
	 * Execute an automation rule
	 */
	private async executeAutomationRule(
		rule: any,
		clientId: string,
		triggerData: Record<string, unknown>,
	) {
		try {
			// Create execution record
			const [execution] = await db
				.insert(crmAutomationExecutions)
				.values({
					ruleId: rule.id,
					clientId,
					status: "executing",
				})
				.returning();

			try {
				// Execute actions based on rule configuration
				const result = await this.performActions(
					rule.actions,
					clientId,
					triggerData,
				);

				// Update execution as completed
				await db
					.update(crmAutomationExecutions)
					.set({
						status: "completed",
						result,
						completedAt: new Date(),
					})
					.where(eq(crmAutomationExecutions.id, execution.id));

				return { ...execution, status: "completed", result };
			} catch (actionError) {
				// Update execution as failed
				await db
					.update(crmAutomationExecutions)
					.set({
						status: "failed",
						errorMessage:
							actionError instanceof Error
								? actionError.message
								: "Unknown error",
					})
					.where(eq(crmAutomationExecutions.id, execution.id));

				throw actionError;
			}
		} catch (error) {
			console.error("Error executing automation rule:", error);
			throw new Error("Failed to execute automation rule");
		}
	}

	/**
	 * Evaluate rule conditions
	 */
	private async evaluateRuleConditions(
		conditions: Record<string, unknown>,
		triggerData: Record<string, unknown>,
	): Promise<boolean> {
		// Simple condition evaluation - would be more sophisticated in production
		for (const [key, value] of Object.entries(conditions)) {
			if (triggerData[key] !== value) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Perform automation actions
	 */
	private async performActions(
		actions: Record<string, unknown>,
		clientId: string,
		triggerData: Record<string, unknown>,
	): Promise<Record<string, unknown>> {
		const results: Record<string, unknown> = {};

		// Example actions - would be more comprehensive in production
		if (actions.sendEmail) {
			results.emailSent = await this.sendAutomatedEmail(
				clientId,
				actions.sendEmail as any,
			);
		}

		if (actions.createTask) {
			results.taskCreated = await this.createAutomatedTask(
				clientId,
				actions.createTask as any,
			);
		}

		if (actions.updateStage) {
			results.stageUpdated = await this.updateClientStage(
				clientId,
				actions.updateStage as any,
			);
		}

		return results;
	}

	/**
	 * Get lifecycle analytics
	 */
	async getLifecycleAnalytics(days = 30) {
		try {
			const dateFrom = new Date();
			dateFrom.setDate(dateFrom.getDate() - days);

			const stages = await db
				.select()
				.from(clientLifecycleStages)
				.where(gte(clientLifecycleStages.changedAt, dateFrom));

			const analytics = {
				stageDistribution: stages.reduce(
					(acc, stage) => {
						acc[stage.stage] = (acc[stage.stage] || 0) + 1;
						return acc;
					},
					{} as Record<string, number>,
				),

				stageTransitions: stages
					.filter((stage) => stage.previousStage)
					.reduce(
						(acc, stage) => {
							const transition = `${stage.previousStage} → ${stage.stage}`;
							acc[transition] = (acc[transition] || 0) + 1;
							return acc;
						},
						{} as Record<string, number>,
					),

				averageTimeInStage: await this.calculateAverageTimeInStage(days),

				conversionRates: await this.calculateConversionRates(days),
			};

			return analytics;
		} catch (error) {
			console.error("Error getting lifecycle analytics:", error);
			throw new Error("Failed to retrieve lifecycle analytics");
		}
	}

	/**
	 * Helper methods for at-risk client identification
	 */
	private async getLastCommunication(clientId: string) {
		const [communication] = await db
			.select()
			.from(clientCommunications)
			.where(eq(clientCommunications.clientId, clientId))
			.orderBy(desc(clientCommunications.createdAt))
			.limit(1);

		return communication;
	}

	private async getLatestLeadScore(clientId: string) {
		const [score] = await db
			.select()
			.from(leadScores)
			.where(eq(leadScores.clientId, clientId))
			.orderBy(desc(leadScores.lastUpdated))
			.limit(1);

		return score;
	}

	private async getRecentSupportTickets(clientId: string, days: number) {
		// This would query the support ticket system
		// For now, return empty array as placeholder
		return [];
	}

	private async getPaymentIssues(clientId: string) {
		// This would query payment/finance system for issues
		// For now, return empty array as placeholder
		return [];
	}

	private generateRiskMitigationActions(riskFactors: string[]): string[] {
		const actions: string[] = [];

		if (riskFactors.includes("No communication in 14+ days")) {
			actions.push("Send re-engagement email");
			actions.push("Schedule follow-up call");
		}

		if (riskFactors.includes("Declining lead score")) {
			actions.push("Review engagement strategy");
			actions.push("Send valuable content");
		}

		if (riskFactors.includes("Multiple support tickets")) {
			actions.push("Proactive support outreach");
			actions.push("Schedule success review");
		}

		if (riskFactors.includes("Payment issues detected")) {
			actions.push("Payment assistance outreach");
			actions.push("Review payment terms");
		}

		return actions;
	}

	private async calculateAverageTimeInStage(
		days: number,
	): Promise<Record<string, number>> {
		// Implementation would calculate average time spent in each stage
		return {};
	}

	private async calculateConversionRates(
		days: number,
	): Promise<Record<string, number>> {
		// Implementation would calculate conversion rates between stages
		return {};
	}

	private async sendAutomatedEmail(
		clientId: string,
		emailConfig: any,
	): Promise<boolean> {
		// Implementation would send automated email
		return true;
	}

	private async createAutomatedTask(
		clientId: string,
		taskConfig: any,
	): Promise<boolean> {
		// Implementation would create automated task
		return true;
	}

	private async updateClientStage(
		clientId: string,
		stageConfig: any,
	): Promise<boolean> {
		// Implementation would update client stage
		return true;
	}
}
