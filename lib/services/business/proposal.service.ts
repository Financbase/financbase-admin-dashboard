/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import {} from "lucide-react";
import { db } from "../db/connection";
import {
	type NewProposal,
	type NewProposalActivity,
	type NewProposalStep,
	type Proposal,
	type ProposalActivity,
	type ProposalStep,
	proposalActivities,
	proposalSteps,
	proposals,
} from "../db/schema-proposals";
import { ProposalCacheService } from "./proposal-cache.service";
import { ProposalNotificationService } from "./proposal-notification.service";

export class ProposalService {
	/**
	 * Create a new proposal
	 */
	async createProposal(
		proposalData: NewProposal,
		userId: string,
	): Promise<Proposal> {
		const [newProposal] = await db
			.insert(proposals)
			.values({
				...proposalData,
				userId,
			})
			.returning();

		// Create initial steps based on proposal type
		await this.createDefaultSteps(newProposal.id, proposalData.projectType);

		// Log activity
		await this.logActivity(
			newProposal.id,
			userId,
			"created",
			"Proposal created",
		);

		// Send email notification for new proposal
		try {
			const recipients =
				await ProposalNotificationService.getNotificationRecipients(
					newProposal.id,
					userId,
				);
			const proposalUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010"}/proposals/${newProposal.id}`;

			await ProposalNotificationService.sendProposalCreatedNotification({
				proposalTitle: newProposal.title,
				proposalUrl,
				recipientEmails: recipients,
				createdBy: `User ${userId}`,
			});
		} catch (error) {
			console.error("Failed to send proposal created notification:", error);
			// Don't fail the proposal creation if notification fails
		}

		return newProposal;
	}

	/**
	 * Get all proposals for a user
	 */
	async getProposals(
		userId: string,
		filters?: {
			status?: string;
			clientId?: string;
			priority?: string;
			search?: string;
		},
	): Promise<Proposal[]> {
		let query = db.select().from(proposals).where(eq(proposals.userId, userId));

		if (filters?.status) {
			query = query.where(eq(proposals.status, filters.status as any));
		}
		if (filters?.clientId) {
			query = query.where(eq(proposals.clientId, filters.clientId));
		}
		if (filters?.priority) {
			query = query.where(eq(proposals.priority, filters.priority));
		}
		if (filters?.search) {
			query = query.where(
				sql`${proposals.title} ILIKE ${`%${filters.search}%`} OR ${proposals.description} ILIKE ${`%${filters.search}%`}`,
			);
		}

		return await query.orderBy(desc(proposals.createdAt));
	}

	/**
	 * Get a specific proposal by ID
	 */
	async getProposalById(
		proposalId: string,
		userId: string,
	): Promise<{
		proposal: Proposal;
		steps: ProposalStep[];
		activities: ProposalActivity[];
	} | null> {
		// Get proposal
		const [proposal] = await db
			.select()
			.from(proposals)
			.where(and(eq(proposals.id, proposalId), eq(proposals.userId, userId)))
			.limit(1);

		if (!proposal) return null;

		// Get steps
		const steps = await db
			.select()
			.from(proposalSteps)
			.where(eq(proposalSteps.proposalId, proposalId))
			.orderBy(asc(proposalSteps.order));

		// Get recent activities
		const activities = await db
			.select()
			.from(proposalActivities)
			.where(eq(proposalActivities.proposalId, proposalId))
			.orderBy(desc(proposalActivities.createdAt))
			.limit(10);

		return { proposal, steps, activities };
	}

	/**
	 * Update a proposal
	 */
	async updateProposal(
		proposalId: string,
		userId: string,
		updates: Partial<NewProposal>,
	): Promise<Proposal | null> {
		const [updatedProposal] = await db
			.update(proposals)
			.set({ ...updates, updatedAt: new Date() })
			.where(and(eq(proposals.id, proposalId), eq(proposals.userId, userId)))
			.returning();

		if (updatedProposal) {
			await this.logActivity(proposalId, userId, "updated", "Proposal updated");
		}

		return updatedProposal || null;
	}

	/**
	 * Update proposal status
	 */
	async updateProposalStatus(
		proposalId: string,
		userId: string,
		status:
			| "draft"
			| "sent"
			| "viewed"
			| "accepted"
			| "rejected"
			| "expired"
			| "withdrawn",
	): Promise<Proposal | null> {
		// Get current proposal to check old status
		const currentProposal = await this.getProposalById(proposalId, userId);
		if (!currentProposal) return null;

		const oldStatus = currentProposal.proposal.status;

		const statusData: Partial<NewProposal> = {
			status,
			updatedAt: new Date(),
		};

		// Set timestamp based on status
		switch (status) {
			case "sent":
				statusData.sentAt = new Date();
				break;
			case "viewed":
				statusData.viewedAt = new Date();
				break;
			case "accepted":
				statusData.acceptedAt = new Date();
				break;
			case "rejected":
				statusData.rejectedAt = new Date();
				break;
			case "expired":
				statusData.expiredAt = new Date();
				break;
		}

		const [updatedProposal] = await db
			.update(proposals)
			.set(statusData)
			.where(and(eq(proposals.id, proposalId), eq(proposals.userId, userId)))
			.returning();

		if (updatedProposal && oldStatus !== status) {
			await this.logActivity(
				proposalId,
				userId,
				status,
				`Proposal status changed from ${oldStatus} to ${status}`,
			);

			// Send email notification for status change
			try {
				const recipients =
					await ProposalNotificationService.getNotificationRecipients(
						proposalId,
						userId,
					);
				const proposalUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010"}/proposals/${proposalId}`;

				await ProposalNotificationService.sendStatusChangeNotification({
					proposalId,
					proposalTitle: updatedProposal.title,
					oldStatus,
					newStatus: status,
					updatedBy: `User ${userId}`,
					recipientEmails: recipients,
					proposalUrl,
				});
			} catch (error) {
				console.error("Failed to send status change notification:", error);
				// Don't fail the status update if notification fails
			}
		}

		return updatedProposal || null;
	}

	/**
	 * Delete a proposal
	 */
	async deleteProposal(proposalId: string, userId: string): Promise<boolean> {
		const result = await db
			.delete(proposals)
			.where(and(eq(proposals.id, proposalId), eq(proposals.userId, userId)));

		return result.rowCount > 0;
	}

	/**
	 * Create default steps for a proposal
	 */
	private async createDefaultSteps(
		proposalId: string,
		projectType: string,
	): Promise<void> {
		const defaultSteps: NewProposalStep[] = [
			{
				proposalId,
				title: "Credit Assessment Approved",
				description: "Credit check completed and approved",
				status: "completed",
				order: "1",
				dueDate: new Date(),
			},
			{
				proposalId,
				title: "Proposal Sent",
				description: "Proposal document sent to client",
				status: "completed",
				order: "2",
				dueDate: new Date(),
			},
			{
				proposalId,
				title: "Manage Documents",
				description: "Review and organize required documents",
				status: "active",
				order: "3",
				dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
			},
			{
				proposalId,
				title: "Contracts",
				description: "Prepare and send contract template",
				status: "pending",
				order: "4",
				dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
			},
		];

		if (projectType === "hourly") {
			defaultSteps.splice(2, 0, {
				proposalId,
				title: "Rate Agreement",
				description: "Agree on hourly rate and payment terms",
				status: "pending",
				order: "3",
				dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
			});
		}

		await db.insert(proposalSteps).values(defaultSteps);
	}

	/**
	 * Update step status
	 */
	async updateStepStatus(
		stepId: string,
		userId: string,
		status: "completed" | "active" | "pending" | "error",
	): Promise<ProposalStep | null> {
		const statusData: Partial<NewProposalStep> = {
			status,
			updatedAt: new Date(),
		};

		if (status === "completed") {
			statusData.completedAt = new Date();
		}

		const [updatedStep] = await db
			.update(proposalSteps)
			.set(statusData)
			.where(eq(proposalSteps.id, stepId))
			.returning();

		if (updatedStep) {
			// Update proposal status based on step completion
			await this.updateProposalStatusBasedOnSteps(
				updatedStep.proposalId,
				userId,
			);
		}

		return updatedStep || null;
	}

	/**
	 * Update proposal status based on step completion
	 */
	private async updateProposalStatusBasedOnSteps(
		proposalId: string,
		userId: string,
	): Promise<void> {
		const steps = await db
			.select()
			.from(proposalSteps)
			.where(eq(proposalSteps.proposalId, proposalId))
			.orderBy(asc(proposalSteps.order));

		const completedSteps = steps.filter((step) => step.status === "completed");
		const activeSteps = steps.filter((step) => step.status === "active");

		let newStatus:
			| "draft"
			| "sent"
			| "viewed"
			| "accepted"
			| "rejected"
			| "expired"
			| "withdrawn" = "draft";

		if (completedSteps.length === steps.length) {
			newStatus = "accepted";
		} else if (activeSteps.length > 0) {
			newStatus = "sent";
		} else if (completedSteps.length > 0) {
			newStatus = "viewed";
		}

		await this.updateProposalStatus(proposalId, userId, newStatus);
	}

	/**
	 * Log activity for a proposal
	 */
	async logActivity(
		proposalId: string,
		userId: string,
		action: string,
		description: string,
		metadata?: any,
	): Promise<ProposalActivity> {
		const activityData: NewProposalActivity = {
			proposalId,
			userId,
			action,
			description,
			metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
		};

		const [activity] = await db
			.insert(proposalActivities)
			.values(activityData)
			.returning();
		return activity;
	}

	/**
	 * Get proposal statistics for dashboard
	 */
	async getProposalStats(userId: string): Promise<{
		totalProposals: number;
		activeProposals: number;
		completedProposals: number;
		averageValue: number;
		conversionRate: number;
	}> {
		const allProposals = await this.getProposals(userId);

		const totalProposals = allProposals.length;
		const activeProposals = allProposals.filter(
			(p) => p.status === "sent" || p.status === "viewed",
		).length;
		const completedProposals = allProposals.filter(
			(p) => p.status === "accepted",
		).length;

		const totalValue = allProposals.reduce((sum, p) => {
			return sum + (Number.parseFloat(p.budget?.toString() || "0") || 0);
		}, 0);

		const averageValue = totalProposals > 0 ? totalValue / totalProposals : 0;
		const conversionRate =
			totalProposals > 0 ? (completedProposals / totalProposals) * 100 : 0;

		return {
			totalProposals,
			activeProposals,
			completedProposals,
			averageValue,
			conversionRate,
		};
	}

	/**
	 * Get proposals by client
	 */
	async getProposalsByClient(
		clientId: string,
		userId: string,
	): Promise<Proposal[]> {
		return await db
			.select()
			.from(proposals)
			.where(
				and(eq(proposals.userId, userId), eq(proposals.clientId, clientId)),
			)
			.orderBy(desc(proposals.createdAt));
	}

	/**
	 * Get overdue proposals
	 */
	async getOverdueProposals(userId: string): Promise<Proposal[]> {
		return await db
			.select()
			.from(proposals)
			.where(
				and(
					eq(proposals.userId, userId),
					eq(proposals.status, "sent"),
					lte(proposals.deadline, new Date()),
				),
			)
			.orderBy(asc(proposals.deadline));
	}

	/**
	 * Bulk update proposal statuses
	 */
	async bulkUpdateStatus(
		proposalIds: string[],
		userId: string,
		status:
			| "draft"
			| "sent"
			| "viewed"
			| "accepted"
			| "rejected"
			| "expired"
			| "withdrawn",
	): Promise<number> {
		const result = await db
			.update(proposals)
			.set({
				status,
				updatedAt: new Date(),
				...(status === "sent" && { sentAt: new Date() }),
				...(status === "accepted" && { acceptedAt: new Date() }),
				...(status === "rejected" && { rejectedAt: new Date() }),
			})
			.where(
				and(
					eq(proposals.userId, userId),
					sql`${proposals.id} = ANY(${proposalIds})`,
				),
			);

		// Log activities for each proposal
		for (const proposalId of proposalIds) {
			await this.logActivity(
				proposalId,
				userId,
				status,
				`Bulk status update to ${status}`,
			);
		}

		return result.rowCount || 0;
	}

	/**
	 * Archive old proposals
	 */
	async archiveOldProposals(
		userId: string,
		olderThanDays = 90,
	): Promise<number> {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

		const result = await db
			.update(proposals)
			.set({
				status: "expired",
				expiredAt: new Date(),
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(proposals.userId, userId),
					lte(proposals.createdAt, cutoffDate),
					sql`${proposals.status} NOT IN ('accepted', 'rejected')`,
				),
			);

		return result.rowCount || 0;
	}

	/**
	 * Get proposal performance metrics
	 */
	async getProposalPerformance(
		userId: string,
		startDate?: Date,
		endDate?: Date,
	): Promise<{
		totalSent: number;
		totalViewed: number;
		totalAccepted: number;
		averageResponseTime: number;
		conversionRate: number;
	}> {
		const whereConditions = [eq(proposals.userId, userId)];

		if (startDate) {
			whereConditions.push(gte(proposals.createdAt, startDate));
		}
		if (endDate) {
			whereConditions.push(lte(proposals.createdAt, endDate));
		}

		const allProposals = await db
			.select()
			.from(proposals)
			.where(and(...whereConditions));

		const totalSent = allProposals.filter((p) => p.sentAt).length;
		const totalViewed = allProposals.filter((p) => p.viewedAt).length;
		const totalAccepted = allProposals.filter((p) => p.acceptedAt).length;

		// Calculate average response time (time from sent to viewed/accepted)
		const responseTimes = allProposals
			.filter((p) => p.sentAt && (p.viewedAt || p.acceptedAt))
			.map((p) => {
				const responseDate = p.viewedAt || p.acceptedAt;
				return responseDate?.getTime() - p.sentAt?.getTime();
			});

		const averageResponseTime =
			responseTimes.length > 0
				? responseTimes.reduce((sum, time) => sum + time, 0) /
					responseTimes.length /
					(1000 * 60 * 60 * 24) // Convert to days
				: 0;

		const conversionRate =
			totalSent > 0 ? (totalAccepted / totalSent) * 100 : 0;

		return {
			totalSent,
			totalViewed,
			totalAccepted,
			averageResponseTime,
			conversionRate,
		};
	}
}
