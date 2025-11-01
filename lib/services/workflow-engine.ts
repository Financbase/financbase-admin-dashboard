import { db } from '@/lib/db';
import {
	workflows,
	workflowExecutions,
	workflowTriggers,
	workflowLogs
} from '@/lib/db/schemas';
import { eq, and, desc, sql } from 'drizzle-orm';
import { FinancbaseGPTService } from '@/lib/services/business/financbase-gpt-service';
import { NotificationService } from '@/lib/services/notification-service';
import type { InferSelectModel } from 'drizzle-orm';

type WorkflowFromDB = InferSelectModel<typeof workflows>;

export interface WorkflowStep {
	id: string;
	name: string;
	type: 'action' | 'condition' | 'delay' | 'webhook' | 'email' | 'notification' | 'gpt';
	configuration: Record<string, any>;
	parameters: Record<string, any>;
	conditions?: Record<string, any>;
	timeout: number;
	retryCount: number;
	retryDelay: number;
}

export interface WorkflowExecutionContext {
	workflowId: number;
	executionId: string;
	userId: string;
	triggerData: Record<string, any>;
	variables: Record<string, any>;
	stepResults: Record<string, any>;
	currentStep: string;
	startTime: Date;
}

export interface WorkflowResult {
	success: boolean;
	executionId: string;
	output: Record<string, any>;
	duration: number;
	error?: string;
}

export class WorkflowEngine {
	/**
	 * Execute a workflow by ID
	 */
	static async executeWorkflow(
		workflowId: number,
		triggerData: Record<string, any>,
		userId: string
	): Promise<WorkflowResult> {
		const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const startTime = new Date();

		try {
			// Get workflow definition
			const workflow = await this.getWorkflow(workflowId, userId);
			if (!workflow || !workflow.isActive) {
				throw new Error('Workflow not found or inactive');
			}

			// Create execution record
			await this.createExecutionRecord(workflowId, userId, executionId, triggerData);

			// Initialize execution context
			const context: WorkflowExecutionContext = {
				workflowId,
				executionId,
				userId,
				triggerData,
				variables: workflow.variables || {},
				stepResults: {},
							currentStep: (workflow.steps as WorkflowStep[])[0]?.id || '',
				startTime,
			};

			// Log workflow start
			await this.logWorkflowEvent(workflowId, executionId, userId, 'info',
				'Workflow execution started', { triggerData });

			// Execute workflow steps
			const result = await this.executeSteps(workflow.steps as WorkflowStep[], context, workflow as any);

			// Update execution record
			await this.updateExecutionRecord(executionId, result, startTime);

			// Log completion
			await this.logWorkflowEvent(workflowId, executionId, userId, 'info',
				'Workflow execution completed', {
					success: result.success,
					duration: result.duration,
					output: result.output
				});

			return result;

		} catch (error) {
			console.error('Workflow execution error:', error);

			// Log error
			await this.logWorkflowEvent(workflowId, executionId, userId, 'error',
				'Workflow execution failed', {
					error: error instanceof Error ? error.message : 'Unknown error',
					stack: error instanceof Error ? error.stack : undefined
				});

			// Update execution with error
			await this.updateExecutionRecord(executionId, {
				success: false,
				executionId,
				output: {},
				duration: Date.now() - startTime.getTime(),
				error: error instanceof Error ? error.message : 'Unknown error'
			}, startTime);

			return {
				success: false,
				executionId,
				output: {},
				duration: Date.now() - startTime.getTime(),
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}

	/**
	 * Execute workflow steps sequentially
	 */
	private static async executeSteps(
		steps: WorkflowStep[],
		context: WorkflowExecutionContext,
		workflow: any
	): Promise<WorkflowResult> {
		const results: Record<string, any> = {};
		let currentIndex = 0;

		while (currentIndex < steps.length) {
			const step = steps[currentIndex];
			context.currentStep = step.id;

			try {
				// Check if step conditions are met
				if (step.conditions && !this.evaluateConditions(step.conditions, context)) {
					currentIndex++;
					continue;
				}

				// Execute step with retry logic
				const stepResult = await this.executeStepWithRetry(step, context, workflow);

				// Store result
				results[step.id] = stepResult;
				context.stepResults[step.id] = stepResult;

				// Update variables with step output
				if (stepResult.variables) {
					context.variables = { ...context.variables, ...stepResult.variables };
				}

				// Determine next step(s)
				if (step.type === 'condition') {
					const nextStepId = this.determineConditionalNextStep(step, stepResult, steps);
					if (nextStepId) {
						const nextIndex = steps.findIndex(s => s.id === nextStepId);
						if (nextIndex !== -1) {
							currentIndex = nextIndex;
						} else {
							currentIndex++;
						}
					} else {
						currentIndex++;
					}
				} else {
					currentIndex++;
				}

			} catch (error) {
				// Handle step failure
				await this.logWorkflowEvent(context.workflowId, context.executionId, context.userId, 'error',
					`Step ${step.name} failed`, {
						stepId: step.id,
						error: error instanceof Error ? error.message : 'Unknown error'
					});

				// Check if we should retry or fail the workflow
				if (context.stepResults[step.id]?.retryCount < step.retryCount) {
					// Retry the step
					context.stepResults[step.id] = {
						...context.stepResults[step.id],
						retryCount: (context.stepResults[step.id]?.retryCount || 0) + 1
					};

					// Wait before retry
					await new Promise(resolve => setTimeout(resolve, (step.retryDelay || 30) * 1000));
				} else {
					// Fail the workflow
					throw error;
				}
			}
		}

		return {
			success: true,
			executionId: context.executionId,
			output: results,
			duration: Date.now() - context.startTime.getTime()
		};
	}

	/**
	 * Execute a single step with retry logic
	 */
	private static async executeStepWithRetry(
		step: WorkflowStep,
		context: WorkflowExecutionContext,
		workflow: any
	): Promise<any> {
		let lastError: Error | null = null;

		for (let attempt = 0; attempt <= step.retryCount; attempt++) {
			try {
				return await this.executeStep(step, context, workflow);
			} catch (error) {
				lastError = error as Error;

				if (attempt < step.retryCount) {
					await this.logWorkflowEvent(context.workflowId, context.executionId, context.userId, 'warning',
						`Step ${step.name} failed (attempt ${attempt + 1})`, {
							stepId: step.id,
							attempt: attempt + 1,
							error: error instanceof Error ? error.message : 'Unknown error'
						});

					// Wait before retry
					await new Promise(resolve => setTimeout(resolve, (step.retryDelay || 30) * 1000));
				}
			}
		}

		throw lastError;
	}

	/**
	 * Execute a specific step based on its type
	 */
	private static async executeStep(
		step: WorkflowStep,
		context: WorkflowExecutionContext,
		workflow: any
	): Promise<any> {
		const startTime = Date.now();

		await this.logWorkflowEvent(context.workflowId, context.executionId, context.userId, 'info',
			`Executing step: ${step.name}`, { stepId: step.id });

		let result: any = {};

		switch (step.type) {
			case 'email':
				result = await this.executeEmailStep(step, context);
				break;

			case 'notification':
				result = await this.executeNotificationStep(step, context);
				break;

			case 'webhook':
				result = await this.executeWebhookStep(step, context);
				break;

			case 'gpt':
				result = await this.executeGPTStep(step, context);
				break;

			case 'delay':
				result = await this.executeDelayStep(step, context);
				break;

			case 'condition':
				result = await this.executeConditionStep(step, context);
				break;

			case 'action':
				result = await this.executeActionStep(step, context);
				break;

			default:
				throw new Error(`Unknown step type: ${step.type}`);
		}

		const duration = Date.now() - startTime;

		await this.logWorkflowEvent(context.workflowId, context.executionId, context.userId, 'info',
			`Step ${step.name} completed`, {
				stepId: step.id,
				duration,
				result: result
			});

		return {
			...result,
			executionTime: duration,
			success: true
		};
	}

	/**
	 * Execute email step
	 */
	private static async executeEmailStep(step: WorkflowStep, context: WorkflowExecutionContext): Promise<any> {
		const config = step.configuration;
		const template = config.template || 'default';

		// This would integrate with your email service (Resend)
		// For now, return success with email details
		return {
			type: 'email',
			to: this.interpolateString(config.to, context),
			subject: this.interpolateString(config.subject, context),
			template,
			sent: true,
			messageId: `email_${Date.now()}`,
		};
	}

	/**
	 * Execute notification step
	 */
	private static async executeNotificationStep(step: WorkflowStep, context: WorkflowExecutionContext): Promise<any> {
		const config = step.configuration;

		// Send notification via existing notification service
		const notification = await NotificationService.create({
			userId: context.userId,
			type: config.type || 'system',
			title: this.interpolateString(config.title, context),
			message: this.interpolateString(config.message, context),
			priority: config.priority || 'normal',
			data: config.data || {},
			actionUrl: config.actionUrl ? this.interpolateString(config.actionUrl, context) : undefined,
		});

		return {
			type: 'notification',
			notificationId: notification.id,
			sent: true,
		};
	}

	/**
	 * Execute webhook step
	 */
	private static async executeWebhookStep(step: WorkflowStep, context: WorkflowExecutionContext): Promise<any> {
		const config = step.configuration;

		const payload = {
			executionId: context.executionId,
			workflowId: context.workflowId,
			userId: context.userId,
			triggerData: context.triggerData,
			stepResults: context.stepResults,
			...this.interpolateObject(config.payload || {}, context),
		};

		const response = await fetch(config.url, {
			method: config.method || 'POST',
			headers: {
				'Content-Type': 'application/json',
				...config.headers,
			},
			body: JSON.stringify(payload),
		});

		const responseData = await response.json();

		return {
			type: 'webhook',
			url: config.url,
			status: response.status,
			response: responseData,
			success: response.ok,
		};
	}

	/**
	 * Execute GPT step
	 */
	private static async executeGPTStep(step: WorkflowStep, context: WorkflowExecutionContext): Promise<any> {
		const config = step.configuration;

		const gptResponse = await new FinancbaseGPTService().query({
			query: this.interpolateString(config.query, context),
			userId: context.userId,
			analysisType: config.analysisType || 'general',
		});

		return {
			type: 'gpt',
			query: config.query,
			response: gptResponse.response,
			analysis: gptResponse.analysis,
			confidence: gptResponse.confidence,
		};
	}

	/**
	 * Execute delay step
	 */
	private static async executeDelayStep(step: WorkflowStep, context: WorkflowExecutionContext): Promise<any> {
		const config = step.configuration;
		const delayMs = this.parseDelayDuration(config.duration);

		await new Promise(resolve => setTimeout(resolve, delayMs));

		return {
			type: 'delay',
			duration: config.duration,
			delayedMs: delayMs,
		};
	}

	/**
	 * Execute condition step
	 */
	private static async executeConditionStep(step: WorkflowStep, context: WorkflowExecutionContext): Promise<any> {
		const conditions = step.conditions || {};
		const result = this.evaluateConditions(conditions, context);

		return {
			type: 'condition',
			conditions,
			result,
			passed: result,
		};
	}

	/**
	 * Execute custom action step
	 */
	private static async executeActionStep(step: WorkflowStep, context: WorkflowExecutionContext): Promise<any> {
		const config = step.configuration;

		// This would execute custom business logic
		// For now, return placeholder
		return {
			type: 'action',
			action: config.actionType,
			parameters: config.parameters,
			result: 'Action executed successfully',
		};
	}

	/**
	 * Evaluate workflow conditions
	 */
	private static evaluateConditions(conditions: Record<string, any>, context: WorkflowExecutionContext): boolean {
		// Simple condition evaluation
		// In a real implementation, this would be more sophisticated

		for (const [key, condition] of Object.entries(conditions)) {
			const value = this.getNestedValue(context, key);

			if (condition.operator === 'equals' && value !== condition.value) {
				return false;
			}

			if (condition.operator === 'greater_than' && Number(value) <= Number(condition.value)) {
				return false;
			}

			if (condition.operator === 'less_than' && Number(value) >= Number(condition.value)) {
				return false;
			}

			if (condition.operator === 'contains' && !String(value).includes(String(condition.value))) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Interpolate variables in strings
	 */
	private static interpolateString(template: string, context: WorkflowExecutionContext): string {
		return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
			return String(this.getNestedValue(context, key) || match);
		});
	}

	/**
	 * Interpolate variables in objects
	 */
	private static interpolateObject(obj: Record<string, any>, context: WorkflowExecutionContext): Record<string, any> {
		const result: Record<string, any> = {};

		for (const [key, value] of Object.entries(obj)) {
			if (typeof value === 'string') {
				result[key] = this.interpolateString(value, context);
			} else if (typeof value === 'object' && value !== null) {
				result[key] = this.interpolateObject(value, context);
			} else {
				result[key] = value;
			}
		}

		return result;
	}

	/**
	 * Get nested value from context
	 */
	private static getNestedValue(obj: any, path: string): any {
		return path.split('.').reduce((current, key) => current?.[key], obj);
	}

	/**
	 * Parse delay duration string to milliseconds
	 */
	private static parseDelayDuration(duration: string): number {
		// Parse duration like "5 minutes", "1 hour", "30 seconds"
		const match = duration.match(/^(\d+)\s*(second|minute|hour|day)s?$/i);

		if (!match) return 0;

		const [, amount, unit] = match;
		const numAmount = parseInt(amount);

		switch (unit.toLowerCase()) {
			case 'second': return numAmount * 1000;
			case 'minute': return numAmount * 60 * 1000;
			case 'hour': return numAmount * 60 * 60 * 1000;
			case 'day': return numAmount * 24 * 60 * 60 * 1000;
			default: return 0;
		}
	}

	/**
	 * Determine next step for conditional workflows
	 */
	private static determineConditionalNextStep(
		step: WorkflowStep,
		stepResult: any,
		allSteps: WorkflowStep[]
	): string | null {
		// This would implement conditional logic based on step results
		// For now, return the first next step
		return step.configuration.nextStepId || null;
	}

	/**
	 * Get workflow by ID
	 */
	private static async getWorkflow(workflowId: number, userId: string): Promise<WorkflowFromDB | null> {
		const result = await db
			.select()
			.from(workflows)
			.where(and(eq(workflows.id, workflowId), eq(workflows.userId, userId)))
			.limit(1);

		return result[0] || null;
	}

	/**
	 * Create execution record
	 */
	private static async createExecutionRecord(
		workflowId: number,
		userId: string,
		executionId: string,
		triggerData: Record<string, any>
	) {
		await db.insert(workflowExecutions).values({
			workflowId,
			userId,
			executionId,
			triggerData,
			status: 'running',
		});
	}

	/**
	 * Update execution record
	 */
	private static async updateExecutionRecord(
		executionId: string,
		result: WorkflowResult,
		startTime: Date
	) {
		await db
			.update(workflowExecutions)
			.set({
				status: result.success ? 'completed' : 'failed',
				completedAt: new Date(),
				duration: String(result.duration / 1000),
				outputData: result.output,
				errorData: result.error ? { message: result.error } : null,
				updatedAt: sql`NOW()`,
			})
			.where(eq(workflowExecutions.executionId, executionId));
	}

	/**
	 * Log workflow event
	 */
	private static async logWorkflowEvent(
		workflowId: number,
		executionId: string,
		userId: string,
		level: 'debug' | 'info' | 'warning' | 'error' | 'critical',
		message: string,
		details: Record<string, any>
	) {
		await db.insert(workflowLogs).values({
			workflowId,
			executionId,
			userId,
			level,
			message,
			details,
		});
	}

	/**
	 * Check if workflow should be triggered
	 */
	static async checkWorkflowTriggers(eventType: string, entityData: Record<string, any>): Promise<void> {
		try {
			// Get all active triggers for this event type
			const triggers = await db
				.select()
				.from(workflowTriggers)
				.where(and(
					eq(workflowTriggers.eventType, eventType as any),
					eq(workflowTriggers.isActive, true)
				));

			for (const trigger of triggers) {
				// Check if trigger conditions are met
				if (this.evaluateTriggerConditions(trigger.conditions as Record<string, any>, entityData)) {
					// Execute the associated workflow
					const workflow = await this.getWorkflow(trigger.workflowId, trigger.userId);
					if (workflow && workflow.isActive) {
						await this.executeWorkflow(workflow.id, entityData, trigger.userId);
					}
				}
			}
		} catch (error) {
			console.error('Error checking workflow triggers:', error);
		}
	}

	/**
	 * Evaluate trigger conditions
	 */
	private static evaluateTriggerConditions(conditions: Record<string, any>, entityData: Record<string, any>): boolean {
		// Similar to step condition evaluation but for triggers
		for (const [key, condition] of Object.entries(conditions)) {
			const entityValue = this.getNestedValue(entityData, key);

			if (condition.operator === 'equals' && entityValue !== condition.value) {
				return false;
			}

			if (condition.operator === 'greater_than' && Number(entityValue) <= Number(condition.value)) {
				return false;
			}

			if (condition.operator === 'contains' && !String(entityValue).includes(String(condition.value))) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Create webhook event
	 */
	static async createWebhookEvent(
		userId: string,
		eventType: string,
		entityId: string,
		entityType: string,
		payload: Record<string, any>
	): Promise<void> {
		try {
			// Import webhook service dynamically to avoid circular dependencies
			const { WebhookService } = await import('@/lib/services/webhook-service');
			
			// Generate unique event ID
			const eventId = `${entityType}_${entityId}_${Date.now()}`;

			// Process webhook event through webhook service
			await WebhookService.processWebhookEvent(
				eventType,
				eventId,
				entityId,
				entityType,
				payload,
				userId
			);

			// Trigger workflows
			await this.checkWorkflowTriggers(eventType, { ...payload, entityId, entityType });

		} catch (error) {
			console.error('Error creating webhook event:', error);
			// Continue execution even if webhook processing fails
			// Workflow triggers should still work
			try {
				await this.checkWorkflowTriggers(eventType, { ...payload, entityId, entityType });
			} catch (workflowError) {
				console.error('Error triggering workflows:', workflowError);
			}
		}
	}

	/**
	 * Get workflow execution history
	 */
	static async getWorkflowExecutions(
		workflowId: number,
		userId: string,
		limit: number = 50
	) {
		return await db
			.select()
			.from(workflowExecutions)
			.where(and(
				eq(workflowExecutions.workflowId, workflowId),
				eq(workflowExecutions.userId, userId)
			))
			.orderBy(desc(workflowExecutions.createdAt))
			.limit(limit);
	}

	/**
	 * Test workflow without creating execution record
	 */
	static async testWorkflow(
		workflowId: number,
		testData: Record<string, any>,
		userId: string
	): Promise<WorkflowResult> {
		const executionId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const startTime = new Date();

		try {
			// Get workflow definition
			const workflow = await this.getWorkflow(workflowId, userId);
			if (!workflow) {
				throw new Error('Workflow not found');
			}

			// Initialize execution context for testing
			const context: WorkflowExecutionContext = {
				workflowId,
				executionId,
				userId,
				triggerData: testData,
				variables: workflow.variables || {},
				stepResults: {},
				currentStep: (workflow.steps as WorkflowStep[])[0]?.id || '',
				startTime,
			};

			// Test workflow steps (dry run)
			const result = await this.executeSteps(workflow.steps as WorkflowStep[], context, workflow as any);

			return result;

		} catch (error) {
			console.error('Workflow test error:', error);
			return {
				success: false,
				executionId,
				output: {},
				duration: Date.now() - startTime.getTime(),
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}

	/**
	 * Execute workflow steps in parallel (for parallel workflows)
	 */
	private static async executeStepsParallel(
		steps: WorkflowStep[],
		context: WorkflowExecutionContext,
		workflow: any
	): Promise<WorkflowResult> {
		const startTime = Date.now();
		const results: Record<string, any> = {};

		try {
			// Execute all steps in parallel
			const stepPromises = steps.map(async (step) => {
				if (step.conditions && !this.evaluateConditions(step.conditions, context)) {
					return { stepId: step.id, skipped: true };
				}

				try {
					const stepResult = await this.executeStep(step, context, workflow);
					return { stepId: step.id, result: stepResult };
				} catch (error) {
					return { stepId: step.id, error: error instanceof Error ? error.message : 'Unknown error' };
				}
			});

			const stepResults = await Promise.all(stepPromises);

			// Process results
			for (const stepResult of stepResults) {
				if (stepResult.skipped) {
					results[stepResult.stepId] = { skipped: true };
				} else if (stepResult.error) {
					results[stepResult.stepId] = { error: stepResult.error };
				} else {
					results[stepResult.stepId] = stepResult.result;
				}
			}

			return {
				success: true,
				executionId: context.executionId,
				output: results,
				duration: Date.now() - startTime
			};

		} catch (error) {
			return {
				success: false,
				executionId: context.executionId,
				output: results,
				duration: Date.now() - startTime,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}

	/**
	 * Get workflows for user with filtering and pagination
	 */
	static async getWorkflows(
		userId: string,
		filters: {
			status?: string;
			category?: string;
			limit?: number;
			offset?: number;
		} = {}
	): Promise<{ data: any[]; total: number }> {
		try {
			const { status, category, limit = 50, offset = 0 } = filters;

			// Build query conditions
			const conditions = [eq(workflows.userId, userId)];

			if (status) {
				conditions.push(eq(workflows.status, status as any));
			}

			if (category) {
				conditions.push(eq(workflows.category, category));
			}

			// Get total count
			const totalResult = await db
				.select({ count: sql<number>`count(*)` })
				.from(workflows)
				.where(and(...conditions));

			// Get paginated results
			const workflowsData = await db
				.select()
				.from(workflows)
				.where(and(...conditions))
				.orderBy(desc(workflows.createdAt))
				.limit(limit)
				.offset(offset);

			return {
				data: workflowsData,
				total: totalResult[0]?.count || 0
			};
		} catch (error) {
			console.error('Error fetching workflows:', error);
			throw new Error(`Failed to fetch workflows: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}
}
