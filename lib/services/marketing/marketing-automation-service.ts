/**
 * Marketing Automation Service
 * Service for managing marketing automation workflows using the workflows table
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { db } from "@/lib/db";
import { workflows, workflowExecutions } from "@/lib/db/schemas/workflows.schema";
import { eq, and, sql, desc } from "drizzle-orm";

export interface CreateAutomationInput {
	userId: string;
	name: string;
	description?: string;
	type?: string;
	trigger: string;
	triggerConditions?: Record<string, unknown>;
	actions: Array<{
		id: string;
		type: string;
		delay?: number;
		template?: string;
		subject?: string;
		crmField?: string;
		value?: string;
		taskType?: string;
		assignedTo?: string;
		[key: string]: unknown;
	}>;
	settings?: Record<string, unknown>;
}

export interface Automation {
	id: number;
	name: string;
	description: string | null;
	type: string;
	status: string;
	trigger: string;
	triggerConditions: Record<string, unknown>;
	actions: Array<Record<string, unknown>>;
	metrics: {
		totalRuns: number;
		successRate: number;
		averageEngagement: number;
		conversionRate: number;
	};
	createdAt: Date;
	updatedAt: Date;
	createdBy: string | null;
}

export interface AutomationStats {
	totalAutomations: number;
	activeAutomations: number;
	pausedAutomations: number;
	draftAutomations: number;
	totalRuns: number;
	averageSuccessRate: number;
	averageConversionRate: number;
}

export class MarketingAutomationService {
	/**
	 * Create a new marketing automation workflow
	 */
	async createAutomation(input: CreateAutomationInput): Promise<Automation> {
		try {
			// Build workflow steps from actions
			const steps = input.actions.map((action, index) => ({
				stepId: action.id || `action-${index + 1}`,
				type: action.type,
				configuration: {
					delay: action.delay || 0,
					template: action.template,
					subject: action.subject,
					crmField: action.crmField,
					value: action.value,
					taskType: action.taskType,
					assignedTo: action.assignedTo,
					...action,
				},
				order: index,
			}));

			// Build triggers
			const triggers = [
				{
					eventType: input.trigger,
					conditions: input.triggerConditions || {},
				},
			];

			const [workflow] = await db
				.insert(workflows)
				.values({
					userId: input.userId,
					name: input.name,
					description: input.description,
					category: "marketing",
					type: input.type || "sequential",
					status: "draft",
					isActive: false,
					steps: JSON.stringify(steps),
					triggers: JSON.stringify(triggers),
					variables: JSON.stringify({}),
					settings: JSON.stringify(input.settings || {}),
					createdBy: input.userId,
				})
				.returning();

			return this.mapWorkflowToAutomation(workflow);
		} catch (error) {
			console.error("Error creating automation:", error);
			throw new Error("Failed to create automation");
		}
	}

	/**
	 * Get automations with filtering
	 */
	async getAutomations(
		userId: string,
		options: {
			status?: string;
			type?: string;
			limit?: number;
			offset?: number;
		} = {}
	): Promise<Automation[]> {
		const { status, type, limit = 100, offset = 0 } = options;

		const whereConditions = [
			eq(workflows.userId, userId),
			eq(workflows.category, "marketing"),
		];

		if (status) {
			whereConditions.push(
				eq(workflows.status, status as 'draft' | 'active' | 'paused' | 'archived')
			);
		}

		if (type) {
			whereConditions.push(eq(workflows.type, type));
		}

		const workflowList = await db
			.select()
			.from(workflows)
			.where(and(...whereConditions))
			.orderBy(desc(workflows.createdAt))
			.limit(limit)
			.offset(offset);

		return workflowList.map((workflow) => this.mapWorkflowToAutomation(workflow));
	}

	/**
	 * Get automation by ID
	 */
	async getAutomationById(automationId: number, userId: string): Promise<Automation | null> {
		const workflow = await db.query.workflows.findFirst({
			where: and(
				eq(workflows.id, automationId),
				eq(workflows.userId, userId),
				eq(workflows.category, "marketing")
			),
		});

		if (!workflow) {
			return null;
		}

		return this.mapWorkflowToAutomation(workflow);
	}

	/**
	 * Update automation
	 */
	async updateAutomation(
		automationId: number,
		userId: string,
		updateData: Partial<CreateAutomationInput>
	): Promise<Automation> {
		try {
			const updateFields: Record<string, unknown> = {
				updatedAt: new Date(),
			};

			if (updateData.name) updateFields.name = updateData.name;
			if (updateData.description !== undefined)
				updateFields.description = updateData.description;
			if (updateData.type) updateFields.type = updateData.type;

			if (updateData.actions) {
				const steps = updateData.actions.map((action, index) => ({
					stepId: action.id || `action-${index + 1}`,
					type: action.type,
					configuration: action,
					order: index,
				}));
				updateFields.steps = JSON.stringify(steps);
			}

			if (updateData.trigger) {
				const triggers = [
					{
						eventType: updateData.trigger,
						conditions: updateData.triggerConditions || {},
					},
				];
				updateFields.triggers = JSON.stringify(triggers);
			}

			if (updateData.settings) {
				updateFields.settings = JSON.stringify(updateData.settings);
			}

			const [updatedWorkflow] = await db
				.update(workflows)
				.set(updateFields)
				.where(
					and(
						eq(workflows.id, automationId),
						eq(workflows.userId, userId),
						eq(workflows.category, "marketing")
					)
				)
				.returning();

			if (!updatedWorkflow) {
				throw new Error("Automation not found");
			}

			return this.mapWorkflowToAutomation(updatedWorkflow);
		} catch (error) {
			console.error("Error updating automation:", error);
			throw new Error("Failed to update automation");
		}
	}

	/**
	 * Delete automation
	 */
	async deleteAutomation(automationId: number, userId: string): Promise<void> {
		try {
			const result = await db
				.delete(workflows)
				.where(
					and(
						eq(workflows.id, automationId),
						eq(workflows.userId, userId),
						eq(workflows.category, "marketing")
					)
				)
				.returning();

			if (result.length === 0) {
				throw new Error("Automation not found");
			}
		} catch (error) {
			console.error("Error deleting automation:", error);
			throw new Error("Failed to delete automation");
		}
	}

	/**
	 * Activate automation
	 */
	async activateAutomation(automationId: number, userId: string): Promise<Automation> {
		try {
			const [updatedWorkflow] = await db
				.update(workflows)
				.set({
					status: "active",
					isActive: true,
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(workflows.id, automationId),
						eq(workflows.userId, userId),
						eq(workflows.category, "marketing")
					)
				)
				.returning();

			if (!updatedWorkflow) {
				throw new Error("Automation not found");
			}

			return this.mapWorkflowToAutomation(updatedWorkflow);
		} catch (error) {
			console.error("Error activating automation:", error);
			throw new Error("Failed to activate automation");
		}
	}

	/**
	 * Pause automation
	 */
	async pauseAutomation(automationId: number, userId: string): Promise<Automation> {
		try {
			const [updatedWorkflow] = await db
				.update(workflows)
				.set({
					status: "paused",
					isActive: false,
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(workflows.id, automationId),
						eq(workflows.userId, userId),
						eq(workflows.category, "marketing")
					)
				)
				.returning();

			if (!updatedWorkflow) {
				throw new Error("Automation not found");
			}

			return this.mapWorkflowToAutomation(updatedWorkflow);
		} catch (error) {
			console.error("Error pausing automation:", error);
			throw new Error("Failed to pause automation");
		}
	}

	/**
	 * Get automation statistics
	 */
	async getAutomationStats(userId: string): Promise<AutomationStats> {
		const [stats] = await db
			.select({
				totalAutomations: sql<number>`COUNT(*)`,
				activeAutomations: sql<number>`COUNT(CASE WHEN ${workflows.status} = 'active' THEN 1 END)`,
				pausedAutomations: sql<number>`COUNT(CASE WHEN ${workflows.status} = 'paused' THEN 1 END)`,
				draftAutomations: sql<number>`COUNT(CASE WHEN ${workflows.status} = 'draft' THEN 1 END)`,
				totalRuns: sql<number>`COALESCE(SUM(${workflows.executionCount}), 0)`,
				avgSuccessRate: sql<number>`COALESCE(AVG(CASE WHEN ${workflows.executionCount} > 0 THEN (${workflows.successCount}::numeric / ${workflows.executionCount}::numeric) * 100 ELSE 0 END), 0)`,
			})
			.from(workflows)
			.where(and(eq(workflows.userId, userId), eq(workflows.category, "marketing")));

		// Calculate average conversion rate from executions
		const executionsStats = await db
			.select({
				totalExecutions: sql<number>`COUNT(*)`,
				successfulExecutions: sql<number>`COUNT(CASE WHEN ${workflowExecutions.status} = 'completed' THEN 1 END)`,
			})
			.from(workflowExecutions)
			.innerJoin(workflows, eq(workflowExecutions.workflowId, workflows.id))
			.where(and(eq(workflows.userId, userId), eq(workflows.category, "marketing")));

		const totalExecutions = Number(executionsStats[0]?.totalExecutions || 0);
		const successfulExecutions = Number(executionsStats[0]?.successfulExecutions || 0);
		const averageConversionRate =
			totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;

		return {
			totalAutomations: Number(stats?.totalAutomations || 0),
			activeAutomations: Number(stats?.activeAutomations || 0),
			pausedAutomations: Number(stats?.pausedAutomations || 0),
			draftAutomations: Number(stats?.draftAutomations || 0),
			totalRuns: Number(stats?.totalRuns || 0),
			averageSuccessRate: Number(stats?.avgSuccessRate || 0),
			averageConversionRate,
		};
	}

	/**
	 * Get available trigger types
	 */
	getTriggers(): Array<{ id: string; name: string; description: string }> {
		return [
			{
				id: "user_signup",
				name: "User Signup",
				description: "Triggered when a new user signs up",
			},
			{
				id: "cart_abandoned",
				name: "Cart Abandoned",
				description: "Triggered when a cart is abandoned",
			},
			{
				id: "lead_created",
				name: "Lead Created",
				description: "Triggered when a new lead is created",
			},
			{
				id: "customer_signup",
				name: "Customer Signup",
				description: "Triggered when a customer signs up",
			},
			{
				id: "email_opened",
				name: "Email Opened",
				description: "Triggered when an email is opened",
			},
			{
				id: "link_clicked",
				name: "Link Clicked",
				description: "Triggered when a link is clicked",
			},
			{
				id: "form_submitted",
				name: "Form Submitted",
				description: "Triggered when a form is submitted",
			},
			{
				id: "page_visited",
				name: "Page Visited",
				description: "Triggered when a page is visited",
			},
		];
	}

	/**
	 * Get available action types
	 */
	getActionTypes(): Array<{ id: string; name: string; description: string }> {
		return [
			{
				id: "send_email",
				name: "Send Email",
				description: "Send an email to the contact",
			},
			{
				id: "add_to_crm",
				name: "Add to CRM",
				description: "Add or update contact in CRM",
			},
			{
				id: "schedule_follow_up",
				name: "Schedule Follow-up",
				description: "Schedule a follow-up task",
			},
			{
				id: "create_task",
				name: "Create Task",
				description: "Create a new task",
			},
			{
				id: "add_tag",
				name: "Add Tag",
				description: "Add a tag to the contact",
			},
			{
				id: "remove_tag",
				name: "Remove Tag",
				description: "Remove a tag from the contact",
			},
			{
				id: "update_field",
				name: "Update Field",
				description: "Update a contact field",
			},
			{
				id: "wait",
				name: "Wait",
				description: "Wait for a specified time",
			},
		];
	}

	/**
	 * Map workflow to automation format
	 */
	private mapWorkflowToAutomation(workflow: typeof workflows.$inferSelect): Automation {
		const steps = (workflow.steps as unknown[]) || [];
		const triggers = (workflow.triggers as unknown[]) || [];
		const triggerData = triggers[0] as { eventType?: string; conditions?: unknown } | undefined;

		// Extract actions from steps
		const actions = steps.map((step: any) => ({
			id: step.stepId || step.id,
			type: step.type || step.configuration?.type,
			delay: step.configuration?.delay || 0,
			template: step.configuration?.template,
			subject: step.configuration?.subject,
			crmField: step.configuration?.crmField,
			value: step.configuration?.value,
			taskType: step.configuration?.taskType,
			assignedTo: step.configuration?.assignedTo,
			...step.configuration,
		}));

		// Calculate metrics from executions
		const totalRuns = workflow.executionCount || 0;
		const successCount = workflow.successCount || 0;
		const successRate = totalRuns > 0 ? (successCount / totalRuns) * 100 : 0;

		return {
			id: workflow.id,
			name: workflow.name,
			description: workflow.description,
			type: workflow.type || "sequential",
			status: workflow.status || "draft",
			trigger: triggerData?.eventType || "manual",
			triggerConditions: (triggerData?.conditions as Record<string, unknown>) || {},
			actions,
			metrics: {
				totalRuns,
				successRate,
				averageEngagement: 0, // Would need to calculate from execution data
				conversionRate: 0, // Would need to calculate from conversion tracking
			},
			createdAt: workflow.createdAt,
			updatedAt: workflow.updatedAt,
			createdBy: workflow.createdBy || null,
		};
	}
}

export const marketingAutomationService = new MarketingAutomationService();

