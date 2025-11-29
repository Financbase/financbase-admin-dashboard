/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from '@/lib/db';
import { webhooks, webhookDeliveries } from '@/lib/db/schemas';
import { eq, and, desc, or, ilike } from 'drizzle-orm';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import crypto from 'crypto';

export type Webhook = InferSelectModel<typeof webhooks>;
export type WebhookDelivery = InferSelectModel<typeof webhookDeliveries>;

export type NewWebhook = InferInsertModel<typeof webhooks>;
export type NewWebhookDelivery = InferInsertModel<typeof webhookDeliveries>;

export interface WebhookRetryPolicy {
	maxRetries: number;
	retryDelay: number; // milliseconds
	backoffMultiplier: number;
}

export class WebhookService {
	/**
	 * Generate a secure webhook secret
	 */
	static generateWebhookSecret(): string {
		return crypto.randomBytes(32).toString('hex');
	}

	/**
	 * Get all webhooks for a user
	 */
	static async getWebhooks(
		userId: string,
		options?: {
			organizationId?: string;
			isActive?: boolean;
			search?: string;
			limit?: number;
			offset?: number;
		}
	): Promise<Webhook[]> {
		const conditions = [eq(webhooks.userId, userId)];

		if (options?.organizationId) {
			conditions.push(eq(webhooks.organizationId, options.organizationId));
		}

		if (options?.isActive !== undefined) {
			conditions.push(eq(webhooks.isActive, options.isActive));
		}

		if (options?.search) {
			conditions.push(
				or(
					ilike(webhooks.name, `%${options.search}%`),
					ilike(webhooks.url, `%${options.search}%`)
				)!
			);
		}

		let query = db
			.select()
			.from(webhooks)
			.where(and(...conditions))
			.orderBy(desc(webhooks.createdAt));

		if (options?.limit) {
			query = query.limit(options.limit) as any;
		}

		if (options?.offset) {
			query = query.offset(options.offset) as any;
		}

		return await query;
	}

	/**
	 * Get a single webhook by ID
	 */
	static async getWebhook(webhookId: number, userId: string): Promise<Webhook | null> {
		const result = await db
			.select()
			.from(webhooks)
			.where(and(eq(webhooks.id, webhookId), eq(webhooks.userId, userId)))
			.limit(1);

		return result[0] || null;
	}

	/**
	 * Create a new webhook
	 */
	static async createWebhook(
		userId: string,
		data: {
			name: string;
			description?: string;
			url: string;
			events: string[];
			organizationId?: string;
			secret?: string;
			retryPolicy?: WebhookRetryPolicy;
			headers?: Record<string, string>;
			filters?: Record<string, any>;
			timeout?: number;
		}
	): Promise<Webhook> {
		const [webhook] = await db
			.insert(webhooks)
			.values({
				userId,
				organizationId: data.organizationId || null,
				name: data.name,
				description: data.description || null,
				url: data.url,
				secret: data.secret || this.generateWebhookSecret(),
				events: data.events as any,
				retryPolicy: (data.retryPolicy || {
					maxRetries: 3,
					retryDelay: 1000,
					backoffMultiplier: 2,
				}) as any,
				headers: (data.headers || {}) as any,
				filters: (data.filters || {}) as any,
				timeout: data.timeout || 30000,
				isActive: true,
			})
			.returning();

		return webhook;
	}

	/**
	 * Update a webhook
	 */
	static async updateWebhook(
		webhookId: number,
		userId: string,
		data: Partial<{
			name: string;
			description: string;
			url: string;
			events: string[];
			isActive: boolean;
			retryPolicy: WebhookRetryPolicy;
			headers: Record<string, string>;
			filters: Record<string, any>;
			timeout: number;
		}>
	): Promise<Webhook | null> {
		const [webhook] = await db
			.update(webhooks)
			.set({
				...data,
				updatedAt: new Date(),
			} as any)
			.where(and(eq(webhooks.id, webhookId), eq(webhooks.userId, userId)))
			.returning();

		return webhook || null;
	}

	/**
	 * Delete a webhook
	 */
	static async deleteWebhook(webhookId: number, userId: string): Promise<boolean> {
		const result = await db
			.delete(webhooks)
			.where(and(eq(webhooks.id, webhookId), eq(webhooks.userId, userId)))
			.returning();

		return result.length > 0;
	}

	/**
	 * Get webhook deliveries
	 */
	static async getWebhookDeliveries(
		webhookId: number,
		userId: string,
		options?: {
			status?: 'pending' | 'delivered' | 'failed' | 'retrying';
			limit?: number;
			offset?: number;
		}
	): Promise<WebhookDelivery[]> {
		// Verify webhook ownership
		const webhook = await this.getWebhook(webhookId, userId);
		if (!webhook) {
			throw new Error('Webhook not found');
		}

		const conditions = [eq(webhookDeliveries.webhookId, webhookId)];

		if (options?.status) {
			conditions.push(eq(webhookDeliveries.status, options.status));
		}

		let query = db
			.select()
			.from(webhookDeliveries)
			.where(and(...conditions))
			.orderBy(desc(webhookDeliveries.createdAt));

		if (options?.limit) {
			query = query.limit(options.limit) as any;
		}

		if (options?.offset) {
			query = query.offset(options.offset) as any;
		}

		return await query;
	}

	/**
	 * Create a webhook delivery record
	 */
	static async createWebhookDelivery(
		webhookId: number,
		userId: string,
		data: {
			eventType: string;
			eventId: string;
			payload: Record<string, any>;
		}
	): Promise<WebhookDelivery> {
		const deliveryId = `del_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

		const [delivery] = await db
			.insert(webhookDeliveries)
			.values({
				webhookId,
				userId,
				deliveryId,
				eventType: data.eventType,
				eventId: data.eventId,
				payload: data.payload as any,
				status: 'pending',
				attemptCount: 1,
			})
			.returning();

		return delivery;
	}

	/**
	 * Update webhook delivery status
	 */
	static async updateWebhookDelivery(
		deliveryId: string,
		userId: string,
		data: Partial<{
			status: 'pending' | 'delivered' | 'failed' | 'retrying';
			httpStatus: number;
			responseBody: string;
			responseHeaders: Record<string, string>;
			attemptCount: number;
			nextRetryAt: Date;
			deliveredAt: Date;
			failedAt: Date;
			duration: number;
			errorMessage: string;
		}>
	): Promise<WebhookDelivery | null> {
		const [delivery] = await db
			.update(webhookDeliveries)
			.set({
				...data,
				updatedAt: new Date(),
			} as any)
			.where(and(eq(webhookDeliveries.deliveryId, deliveryId), eq(webhookDeliveries.userId, userId)))
			.returning();

		return delivery || null;
	}

	/**
	 * Retry a failed webhook delivery
	 */
	static async retryWebhookDelivery(
		deliveryId: string,
		userId: string
	): Promise<WebhookDelivery | null> {
		// Get the delivery
		const delivery = await db
			.select()
			.from(webhookDeliveries)
			.where(and(eq(webhookDeliveries.deliveryId, deliveryId), eq(webhookDeliveries.userId, userId)))
			.limit(1);

		if (!delivery[0]) {
			return null;
		}

		// Get webhook to check retry policy
		const webhook = await this.getWebhook(delivery[0].webhookId, userId);
		if (!webhook) {
			return null;
		}

		const retryPolicy = (webhook.retryPolicy as any) || {
			maxRetries: 3,
			retryDelay: 1000,
			backoffMultiplier: 2,
		};

		if (delivery[0].attemptCount >= retryPolicy.maxRetries) {
			// Max retries reached, mark as failed
			return await this.updateWebhookDelivery(deliveryId, userId, {
				status: 'failed',
				failedAt: new Date(),
				errorMessage: 'Max retries exceeded',
			});
		}

		// Calculate next retry time with exponential backoff
		const delay = retryPolicy.retryDelay * Math.pow(retryPolicy.backoffMultiplier, delivery[0].attemptCount - 1);
		const nextRetryAt = new Date(Date.now() + delay);

		// Update delivery for retry
		return await this.updateWebhookDelivery(deliveryId, userId, {
			status: 'retrying',
			attemptCount: delivery[0].attemptCount + 1,
			nextRetryAt,
		});
	}

	/**
	 * Test a webhook by sending a test payload
	 */
	static async testWebhook(
		webhookId: number,
		userId: string,
		testPayload?: Record<string, any>
	): Promise<{
		success: boolean;
		httpStatus?: number;
		responseBody?: string;
		error?: string;
		duration?: number;
	}> {
		const webhook = await this.getWebhook(webhookId, userId);
		if (!webhook) {
			throw new Error('Webhook not found');
		}

		if (!webhook.isActive) {
			throw new Error('Webhook is not active');
		}

		const payload = testPayload || {
			event: 'webhook.test',
			timestamp: new Date().toISOString(),
			data: {
				message: 'This is a test webhook payload',
			},
		};

		const startTime = Date.now();

		try {
			const response = await fetch(webhook.url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Webhook-Event': 'webhook.test',
					'X-Webhook-Id': webhook.id.toString(),
					...(webhook.headers as Record<string, string> || {}),
				},
				body: JSON.stringify(payload),
				signal: AbortSignal.timeout(webhook.timeout || 30000),
			});

			const responseBody = await response.text();
			const duration = Date.now() - startTime;

			return {
				success: response.ok,
				httpStatus: response.status,
				responseBody,
				duration,
			};
		} catch (error) {
			const duration = Date.now() - startTime;
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
				duration,
			};
		}
	}
}
