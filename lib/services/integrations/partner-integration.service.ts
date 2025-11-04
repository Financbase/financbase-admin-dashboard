/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { sql } from "@/lib/neon";

/**
 * Partner Integration Types
 */
export interface PartnerIntegration {
	id: string;
	userId: string;
	partner: 'stripe' | 'gusto' | 'quickbooks' | 'xero' | 'paypal';
	status: 'active' | 'inactive' | 'error' | 'pending';
	credentials: Record<string, any>;
	webhookUrl?: string;
	webhookSecret?: string;
	settings: Record<string, any>;
	createdAt: Date;
	updatedAt: Date;
}

export interface IntegrationWebhook {
	id: string;
	integrationId: string;
	eventType: string;
	payload: Record<string, any>;
	processed: boolean;
	processedAt?: Date;
	error?: string;
	createdAt: Date;
}

export interface IntegrationAnalytics {
	integrationId: string;
	totalRequests: number;
	successfulRequests: number;
	failedRequests: number;
	lastActivity: Date;
	averageResponseTime: number;
}

/**
 * Base Partner Integration Service
 * Provides common functionality for all partner integrations
 */
export abstract class BasePartnerIntegration {
	protected integrationId: string;
	protected userId: string;
	protected credentials: Record<string, any>;

	constructor(integrationId: string, userId: string, credentials: Record<string, any>) {
		this.integrationId = integrationId;
		this.userId = userId;
		this.credentials = credentials;
	}

	/**
	 * Test the connection to the partner service
	 */
	abstract testConnection(): Promise<{ success: boolean; message: string }>;

	/**
	 * Get available webhook events for this integration
	 */
	abstract getWebhookEvents(): string[];

	/**
	 * Process incoming webhook from partner
	 */
	abstract processWebhook(payload: Record<string, any>, signature?: string): Promise<void>;

	/**
	 * Sync data from partner service
	 */
	abstract syncData(): Promise<{ success: boolean; recordsProcessed: number }>;

	/**
	 * Store webhook event (to be implemented by subclasses)
	 */
	protected async storeWebhookEvent(eventType: string, payload: any): Promise<void> {
		await sql.query(`
			INSERT INTO integrations.webhook_events
			(integration_id, event_type, payload, created_at)
			VALUES ($1, $2, $3, NOW())
		`, [this.integrationId, eventType, JSON.stringify(payload)]);
	}

	/**
	 * Store webhook error (to be implemented by subclasses)
	 */
	protected async storeWebhookError(payload: any, error: string): Promise<void> {
		await sql.query(`
			INSERT INTO integrations.webhook_events
			(integration_id, event_type, payload, error, created_at)
			VALUES ($1, $2, $3, $4, NOW())
		`, [this.integrationId, 'error', JSON.stringify(payload), error]);
	}

	/**
	 * Get integration-specific settings schema
	 */
	abstract getSettingsSchema(): Record<string, any>;
}

/**
 * Partner Integration Manager
 * Manages all partner integrations for a user
 */
export class PartnerIntegrationManager {
	/**
	 * Get all integrations for a user
	 */
	static async getUserIntegrations(userId: string): Promise<PartnerIntegration[]> {
		const result = await sql.query(`
			SELECT * FROM integrations.partner_integrations
			WHERE user_id = $1 AND status != 'deleted'
			ORDER BY created_at DESC
		`, [userId]);

		return result.rows;
	}

	/**
	 * Get a specific integration
	 */
	static async getIntegration(integrationId: string): Promise<PartnerIntegration | null> {
		const result = await sql.query(`
			SELECT * FROM integrations.partner_integrations
			WHERE id = $1 AND status != 'deleted'
		`, [integrationId]);

		return result.rows.length > 0 ? result.rows[0] : null;
	}

	/**
	 * Create a new integration
	 */
	static async createIntegration(
		userId: string,
		partner: PartnerIntegration['partner'],
		credentials: Record<string, any>,
		settings: Record<string, any> = {}
	): Promise<PartnerIntegration> {
		const result = await sql.query(`
			INSERT INTO integrations.partner_integrations
			(user_id, partner, credentials, settings, status, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
			RETURNING *
		`, [userId, partner, JSON.stringify(credentials), JSON.stringify(settings), 'pending']);

		return result.rows[0];
	}

	/**
	 * Update integration credentials
	 */
	static async updateIntegrationCredentials(
		integrationId: string,
		credentials: Record<string, any>
	): Promise<PartnerIntegration> {
		const result = await sql.query(`
			UPDATE integrations.partner_integrations
			SET credentials = $2, updated_at = NOW()
			WHERE id = $1
			RETURNING *
		`, [integrationId, JSON.stringify(credentials)]);

		if (result.rows.length === 0) {
			throw new Error('Integration not found');
		}

		return result.rows[0];
	}

	/**
	 * Update integration settings
	 */
	static async updateIntegrationSettings(
		integrationId: string,
		settings: Record<string, any>
	): Promise<PartnerIntegration> {
		const result = await sql.query(`
			UPDATE integrations.partner_integrations
			SET settings = $2, updated_at = NOW()
			WHERE id = $1
			RETURNING *
		`, [integrationId, JSON.stringify(settings)]);

		if (result.rows.length === 0) {
			throw new Error('Integration not found');
		}

		return result.rows[0];
	}

	/**
	 * Test integration connection
	 */
	static async testIntegration(integrationId: string): Promise<{ success: boolean; message: string }> {
		const integration = await this.getIntegration(integrationId);
		if (!integration) {
			return { success: false, message: 'Integration not found' };
		}

		let integrationService: BasePartnerIntegration;

		switch (integration.partner) {
			case 'stripe':
				integrationService = new StripeIntegration(
					integrationId,
					integration.userId,
					integration.credentials
				);
				break;
			default:
				return { success: false, message: 'Unsupported integration type' };
		}

		return await integrationService.testConnection();
	}

	/**
	 * Delete integration
	 */
	static async deleteIntegration(integrationId: string): Promise<void> {
		await sql.query(`
			UPDATE integrations.partner_integrations
			SET status = 'deleted', updated_at = NOW()
			WHERE id = $1
		`, [integrationId]);
	}

	/**
	 * Get integration analytics
	 */
	static async getIntegrationAnalytics(integrationId: string): Promise<IntegrationAnalytics | null> {
		const result = await sql.query(`
			SELECT
				COUNT(*) as total_requests,
				COUNT(*) FILTER (WHERE error IS NULL) as successful_requests,
				COUNT(*) FILTER (WHERE error IS NOT NULL) as failed_requests,
				MAX(created_at) as last_activity,
				AVG(EXTRACT(EPOCH FROM (processed_at - created_at))) as average_response_time
			FROM integrations.webhook_events
			WHERE integration_id = $1
		`, [integrationId]);

		if (result.rows.length === 0) {
			return null;
		}

		const row = result.rows[0];
		return {
			integrationId,
			totalRequests: parseInt(row.total_requests),
			successfulRequests: parseInt(row.successful_requests),
			failedRequests: parseInt(row.failed_requests),
			lastActivity: new Date(row.last_activity),
			averageResponseTime: parseFloat(row.average_response_time) || 0,
		};
	}
}
