/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from '@/lib/db';
import { workflows, workflowExecutions, workflowTemplates } from '@/lib/db/schemas';
import { eq, and, desc, sql, or, ilike } from 'drizzle-orm';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type Workflow = InferSelectModel<typeof workflows>;
export type WorkflowExecution = InferSelectModel<typeof workflowExecutions>;
export type WorkflowTemplate = InferSelectModel<typeof workflowTemplates>;

export type NewWorkflow = InferInsertModel<typeof workflows>;
export type NewWorkflowExecution = InferInsertModel<typeof workflowExecutions>;
export type NewWorkflowTemplate = InferInsertModel<typeof workflowTemplates>;

export interface WorkflowTriggerConfig {
	type: 'event' | 'schedule' | 'webhook' | 'manual';
	config: {
		eventType?: string; // e.g., 'invoice.created', 'expense.submitted'
		schedule?: string; // Cron expression or interval
		webhookUrl?: string;
		conditions?: Record<string, any>;
	};
}

export interface WorkflowAction {
	id: string;
	type: 'send_email' | 'create_invoice' | 'update_expense' | 'send_notification' | 'webhook' | 'delay' | 'conditional';
	config: Record<string, any>;
	parameters?: Record<string, any>;
}

export interface WorkflowCondition {
	field: string;
	operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
	value: any;
	logic?: 'and' | 'or';
}

export class WorkflowService {
	/**
	 * Get all workflows for a user
	 */
	static async getWorkflows(
		userId: string,
		options?: {
			organizationId?: string;
			status?: 'active' | 'inactive' | 'draft' | 'archived';
			search?: string;
			limit?: number;
			offset?: number;
		}
	): Promise<Workflow[]> {
		const conditions = [eq(workflows.userId, userId)];

		if (options?.organizationId) {
			conditions.push(eq(workflows.organizationId, options.organizationId));
		}

		if (options?.status) {
			conditions.push(eq(workflows.status, options.status));
		}

		if (options?.search) {
			conditions.push(
				or(
					ilike(workflows.name, `%${options.search}%`),
					ilike(workflows.description, `%${options.search}%`)
				)!
			);
		}

		let query = db
			.select()
			.from(workflows)
			.where(and(...conditions))
			.orderBy(desc(workflows.createdAt));

		if (options?.limit) {
			query = query.limit(options.limit) as any;
		}

		if (options?.offset) {
			query = query.offset(options.offset) as any;
		}

		return await query;
	}

	/**
	 * Get a single workflow by ID
	 */
	static async getWorkflow(workflowId: number, userId: string): Promise<Workflow | null> {
		const result = await db
			.select()
			.from(workflows)
			.where(and(eq(workflows.id, workflowId), eq(workflows.userId, userId)))
			.limit(1);

		return result[0] || null;
	}

	/**
	 * Create a new workflow
	 */
	static async createWorkflow(
		userId: string,
		data: {
			name: string;
			description?: string;
			organizationId?: string;
			triggerConfig: WorkflowTriggerConfig;
			actions: WorkflowAction[];
			conditions?: WorkflowCondition[];
			status?: 'active' | 'inactive' | 'draft' | 'archived';
			metadata?: Record<string, any>;
		}
	): Promise<Workflow> {
		const [workflow] = await db
			.insert(workflows)
			.values({
				userId,
				organizationId: data.organizationId || null,
				name: data.name,
				description: data.description || null,
				triggerConfig: data.triggerConfig as any,
				actions: data.actions as any,
				conditions: data.conditions as any,
				status: data.status || 'draft',
				metadata: data.metadata as any,
			})
			.returning();

		return workflow;
	}

	/**
	 * Update a workflow
	 */
	static async updateWorkflow(
		workflowId: number,
		userId: string,
		data: Partial<{
			name: string;
			description: string;
			triggerConfig: WorkflowTriggerConfig;
			actions: WorkflowAction[];
			conditions: WorkflowCondition[];
			status: 'active' | 'inactive' | 'draft' | 'archived';
			metadata: Record<string, any>;
		}>
	): Promise<Workflow | null> {
		const [workflow] = await db
			.update(workflows)
			.set({
				...data,
				updatedAt: new Date(),
			} as any)
			.where(and(eq(workflows.id, workflowId), eq(workflows.userId, userId)))
			.returning();

		return workflow || null;
	}

	/**
	 * Delete a workflow
	 */
	static async deleteWorkflow(workflowId: number, userId: string): Promise<boolean> {
		const result = await db
			.delete(workflows)
			.where(and(eq(workflows.id, workflowId), eq(workflows.userId, userId)))
			.returning();

		return result.length > 0;
	}

	/**
	 * Get workflow executions
	 */
	static async getWorkflowExecutions(
		workflowId: number,
		userId: string,
		options?: {
			status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
			limit?: number;
			offset?: number;
		}
	): Promise<WorkflowExecution[]> {
		const conditions = [
			eq(workflowExecutions.workflowId, workflowId),
			eq(workflowExecutions.userId, userId),
		];

		if (options?.status) {
			conditions.push(eq(workflowExecutions.status, options.status));
		}

		let query = db
			.select()
			.from(workflowExecutions)
			.where(and(...conditions))
			.orderBy(desc(workflowExecutions.startedAt));

		if (options?.limit) {
			query = query.limit(options.limit) as any;
		}

		if (options?.offset) {
			query = query.offset(options.offset) as any;
		}

		return await query;
	}

	/**
	 * Create a workflow execution record
	 */
	static async createWorkflowExecution(
		workflowId: number,
		userId: string,
		data: {
			triggeredBy: 'user' | 'event' | 'schedule' | 'webhook';
			triggerData?: Record<string, any>;
			status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
		}
	): Promise<WorkflowExecution> {
		const [execution] = await db
			.insert(workflowExecutions)
			.values({
				workflowId,
				userId,
				triggeredBy: data.triggeredBy,
				triggerData: data.triggerData as any,
				status: data.status || 'pending',
			})
			.returning();

		return execution;
	}

	/**
	 * Update workflow execution status
	 */
	static async updateWorkflowExecution(
		executionId: number,
		userId: string,
		data: Partial<{
			status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
			error: string;
			errorDetails: Record<string, any>;
			executionLog: Record<string, any>[];
			results: Record<string, any>;
		}>
	): Promise<WorkflowExecution | null> {
		const updateData: any = {
			...data,
		};

		if (data.status === 'completed' || data.status === 'failed' || data.status === 'cancelled') {
			updateData.completedAt = new Date();
		}

		const [execution] = await db
			.update(workflowExecutions)
			.set(updateData)
			.where(and(eq(workflowExecutions.id, executionId), eq(workflowExecutions.userId, userId)))
			.returning();

		return execution || null;
	}

	/**
	 * Get workflow templates
	 */
	static async getWorkflowTemplates(options?: {
		category?: string;
		isPublic?: boolean;
		isOfficial?: boolean;
		limit?: number;
		offset?: number;
	}): Promise<WorkflowTemplate[]> {
		const conditions = [];

		if (options?.category) {
			conditions.push(eq(workflowTemplates.category, options.category));
		}

		if (options?.isPublic !== undefined) {
			conditions.push(eq(workflowTemplates.isPublic, options.isPublic));
		}

		if (options?.isOfficial !== undefined) {
			conditions.push(eq(workflowTemplates.isOfficial, options.isOfficial));
		}

		let query = db
			.select()
			.from(workflowTemplates)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(workflowTemplates.usageCount));

		if (options?.limit) {
			query = query.limit(options.limit) as any;
		}

		if (options?.offset) {
			query = query.offset(options.offset) as any;
		}

		return await query;
	}

	/**
	 * Create workflow from template
	 */
	static async createWorkflowFromTemplate(
		templateId: number,
		userId: string,
		data: {
			name: string;
			description?: string;
			organizationId?: string;
		}
	): Promise<Workflow> {
		const template = await db
			.select()
			.from(workflowTemplates)
			.where(eq(workflowTemplates.id, templateId))
			.limit(1);

		if (!template[0]) {
			throw new Error('Template not found');
		}

		// Increment usage count
		await db
			.update(workflowTemplates)
			.set({
				usageCount: sql`${workflowTemplates.usageCount} + 1`,
			})
			.where(eq(workflowTemplates.id, templateId));

		// Create workflow from template
		const workflow = await this.createWorkflow(userId, {
			name: data.name,
			description: data.description || template[0].description,
			organizationId: data.organizationId,
			triggerConfig: template[0].triggerConfig as WorkflowTriggerConfig,
			actions: template[0].actions as WorkflowAction[],
			conditions: template[0].conditions as WorkflowCondition[],
			status: 'draft',
			metadata: {
				createdFromTemplate: templateId,
				...template[0].metadata,
			},
		});

		return workflow;
	}

	/**
	 * Get available triggers
	 */
	static getAvailableTriggers(): Array<{ type: string; name: string; description: string; config: Record<string, any> }> {
		return [
			{
				type: 'event',
				name: 'Event Trigger',
				description: 'Trigger workflow when a specific event occurs',
				config: {
					eventTypes: [
						'invoice.created',
						'invoice.paid',
						'invoice.overdue',
						'expense.submitted',
						'expense.approved',
						'expense.rejected',
						'client.created',
						'payment.received',
					],
				},
			},
			{
				type: 'schedule',
				name: 'Schedule Trigger',
				description: 'Trigger workflow on a schedule (cron or interval)',
				config: {
					scheduleTypes: ['cron', 'interval', 'daily', 'weekly', 'monthly'],
				},
			},
			{
				type: 'webhook',
				name: 'Webhook Trigger',
				description: 'Trigger workflow via webhook',
				config: {},
			},
			{
				type: 'manual',
				name: 'Manual Trigger',
				description: 'Trigger workflow manually',
				config: {},
			},
		];
	}

	/**
	 * Get available actions
	 */
	static getAvailableActions(): Array<{ type: string; name: string; description: string; config: Record<string, any> }> {
		return [
			{
				type: 'send_email',
				name: 'Send Email',
				description: 'Send an email notification',
				config: {
					fields: ['to', 'subject', 'body', 'template'],
				},
			},
			{
				type: 'create_invoice',
				name: 'Create Invoice',
				description: 'Create a new invoice',
				config: {
					fields: ['clientId', 'items', 'dueDate'],
				},
			},
			{
				type: 'update_expense',
				name: 'Update Expense',
				description: 'Update an expense status',
				config: {
					fields: ['expenseId', 'status'],
				},
			},
			{
				type: 'send_notification',
				name: 'Send Notification',
				description: 'Send an in-app notification',
				config: {
					fields: ['userId', 'title', 'message', 'type'],
				},
			},
			{
				type: 'webhook',
				name: 'Webhook Action',
				description: 'Call an external webhook',
				config: {
					fields: ['url', 'method', 'headers', 'body'],
				},
			},
			{
				type: 'delay',
				name: 'Delay',
				description: 'Wait for a specified duration',
				config: {
					fields: ['duration'],
				},
			},
			{
				type: 'conditional',
				name: 'Conditional Logic',
				description: 'Execute actions based on conditions',
				config: {
					fields: ['conditions', 'thenActions', 'elseActions'],
				},
			},
		];
	}
}

