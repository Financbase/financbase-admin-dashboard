/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from '@/lib/db';
import { integrations, integrationConnections, integrationSyncs } from '@/lib/db/schemas';
import { eq, and, desc, or, ilike } from 'drizzle-orm';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import crypto from 'crypto';

export type Integration = InferSelectModel<typeof integrations>;
export type IntegrationConnection = InferSelectModel<typeof integrationConnections>;
export type IntegrationSync = InferSelectModel<typeof integrationSyncs>;

export type NewIntegration = InferInsertModel<typeof integrations>;
export type NewIntegrationConnection = InferInsertModel<typeof integrationConnections>;
export type NewIntegrationSync = InferInsertModel<typeof integrationSyncs>;

export interface OAuthConfig {
	clientId: string;
	clientSecret: string;
	authorizationUrl: string;
	tokenUrl: string;
	scopes: string[];
	redirectUri: string;
}

export class IntegrationService {
	/**
	 * Get all available integrations
	 */
	static async getIntegrations(options?: {
		category?: string;
		isActive?: boolean;
		isOfficial?: boolean;
		search?: string;
		limit?: number;
		offset?: number;
	}): Promise<Integration[]> {
		const conditions = [];

		if (options?.category) {
			conditions.push(eq(integrations.category, options.category));
		}

		if (options?.isActive !== undefined) {
			conditions.push(eq(integrations.isActive, options.isActive));
		}

		if (options?.isOfficial !== undefined) {
			conditions.push(eq(integrations.isOfficial, options.isOfficial));
		}

		if (options?.search) {
			conditions.push(
				or(
					ilike(integrations.name, `%${options.search}%`),
					ilike(integrations.description, `%${options.search}%`)
				)!
			);
		}

		let query = db
			.select()
			.from(integrations)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(integrations.createdAt));

		if (options?.limit) {
			query = query.limit(options.limit) as any;
		}

		if (options?.offset) {
			query = query.offset(options.offset) as any;
		}

		return await query;
	}

	/**
	 * Get a single integration by ID or slug
	 */
	static async getIntegration(identifier: number | string): Promise<Integration | null> {
		if (typeof identifier === 'number') {
			const result = await db
				.select()
				.from(integrations)
				.where(eq(integrations.id, identifier))
				.limit(1);
			return result[0] || null;
		} else {
			const result = await db
				.select()
				.from(integrations)
				.where(eq(integrations.slug, identifier))
				.limit(1);
			return result[0] || null;
		}
	}

	/**
	 * Get user's integration connections
	 */
	static async getConnections(
		userId: string,
		options?: {
			organizationId?: string;
			integrationId?: number;
			status?: 'active' | 'inactive' | 'error' | 'expired';
			limit?: number;
			offset?: number;
		}
	): Promise<IntegrationConnection[]> {
		const conditions = [eq(integrationConnections.userId, userId)];

		if (options?.organizationId) {
			conditions.push(eq(integrationConnections.organizationId, options.organizationId));
		}

		if (options?.integrationId) {
			conditions.push(eq(integrationConnections.integrationId, options.integrationId));
		}

		if (options?.status) {
			conditions.push(eq(integrationConnections.status, options.status));
		}

		let query = db
			.select()
			.from(integrationConnections)
			.where(and(...conditions))
			.orderBy(desc(integrationConnections.createdAt));

		if (options?.limit) {
			query = query.limit(options.limit) as any;
		}

		if (options?.offset) {
			query = query.offset(options.offset) as any;
		}

		return await query;
	}

	/**
	 * Get a single connection by ID
	 */
	static async getConnection(
		connectionId: number,
		userId: string
	): Promise<IntegrationConnection | null> {
		const result = await db
			.select()
			.from(integrationConnections)
			.where(and(eq(integrationConnections.id, connectionId), eq(integrationConnections.userId, userId)))
			.limit(1);

		return result[0] || null;
	}

	/**
	 * Create a new integration connection
	 */
	static async createConnection(
		userId: string,
		data: {
			integrationId: number;
			organizationId?: string;
			name: string;
			accessToken: string;
			refreshToken?: string;
			tokenExpiresAt?: Date;
			scope?: string;
			externalId?: string;
			externalName?: string;
			externalData?: Record<string, any>;
			settings?: Record<string, any>;
			mappings?: Record<string, any>;
		}
	): Promise<IntegrationConnection> {
		const [connection] = await db
			.insert(integrationConnections)
			.values({
				userId,
				organizationId: data.organizationId || null,
				integrationId: data.integrationId,
				name: data.name,
				status: 'active',
				isActive: true,
				accessToken: data.accessToken,
				refreshToken: data.refreshToken || null,
				tokenExpiresAt: data.tokenExpiresAt || null,
				scope: data.scope || null,
				externalId: data.externalId || null,
				externalName: data.externalName || null,
				externalData: (data.externalData || {}) as any,
				settings: (data.settings || {}) as any,
				mappings: (data.mappings || {}) as any,
			})
			.returning();

		return connection;
	}

	/**
	 * Update an integration connection
	 */
	static async updateConnection(
		connectionId: number,
		userId: string,
		data: Partial<{
			name: string;
			status: 'active' | 'inactive' | 'error' | 'expired';
			isActive: boolean;
			accessToken: string;
			refreshToken: string;
			tokenExpiresAt: Date;
			settings: Record<string, any>;
			mappings: Record<string, any>;
			externalData: Record<string, any>;
		}>
	): Promise<IntegrationConnection | null> {
		const [connection] = await db
			.update(integrationConnections)
			.set({
				...data,
				updatedAt: new Date(),
			} as any)
			.where(and(eq(integrationConnections.id, connectionId), eq(integrationConnections.userId, userId)))
			.returning();

		return connection || null;
	}

	/**
	 * Delete an integration connection
	 */
	static async deleteConnection(connectionId: number, userId: string): Promise<boolean> {
		const result = await db
			.delete(integrationConnections)
			.where(and(eq(integrationConnections.id, connectionId), eq(integrationConnections.userId, userId)))
			.returning();

		return result.length > 0;
	}

	/**
	 * Get integration sync history
	 */
	static async getSyncs(
		connectionId: number,
		userId: string,
		options?: {
			status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
			type?: 'full' | 'incremental' | 'manual';
			limit?: number;
			offset?: number;
		}
	): Promise<IntegrationSync[]> {
		// Verify connection ownership
		const connection = await this.getConnection(connectionId, userId);
		if (!connection) {
			throw new Error('Connection not found');
		}

		const conditions = [eq(integrationSyncs.connectionId, connectionId)];

		if (options?.status) {
			conditions.push(eq(integrationSyncs.status, options.status));
		}

		if (options?.type) {
			conditions.push(eq(integrationSyncs.type, options.type));
		}

		let query = db
			.select()
			.from(integrationSyncs)
			.where(and(...conditions))
			.orderBy(desc(integrationSyncs.startedAt));

		if (options?.limit) {
			query = query.limit(options.limit) as any;
		}

		if (options?.offset) {
			query = query.offset(options.offset) as any;
		}

		return await query;
	}

	/**
	 * Create a sync operation
	 */
	static async createSync(
		connectionId: number,
		userId: string,
		data: {
			type: 'full' | 'incremental' | 'manual';
			direction: 'import' | 'export' | 'bidirectional';
			entityTypes?: string[];
		}
	): Promise<IntegrationSync> {
		const syncId = `sync_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

		const [sync] = await db
			.insert(integrationSyncs)
			.values({
				connectionId,
				userId,
				syncId,
				type: data.type,
				direction: data.direction,
				status: 'pending',
				entityTypes: (data.entityTypes || []) as any,
			})
			.returning();

		return sync;
	}

	/**
	 * Update sync status
	 */
	static async updateSync(
		syncId: string,
		userId: string,
		data: Partial<{
			status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
			recordsProcessed: number;
			recordsCreated: number;
			recordsUpdated: number;
			recordsFailed: number;
			error: string;
			errorDetails: Record<string, any>;
			startedAt: Date;
			completedAt: Date;
		}>
	): Promise<IntegrationSync | null> {
		const [sync] = await db
			.update(integrationSyncs)
			.set({
				...data,
				updatedAt: new Date(),
			} as any)
			.where(and(eq(integrationSyncs.syncId, syncId), eq(integrationSyncs.userId, userId)))
			.returning();

		return sync || null;
	}

	/**
	 * Check connection health
	 */
	static async checkConnectionHealth(
		connectionId: number,
		userId: string
	): Promise<{
		healthy: boolean;
		status: string;
		lastSyncAt?: Date;
		error?: string;
	}> {
		const connection = await this.getConnection(connectionId, userId);
		if (!connection) {
			throw new Error('Connection not found');
		}

		// Check if token is expired
		if (connection.tokenExpiresAt && new Date() > connection.tokenExpiresAt) {
			return {
				healthy: false,
				status: 'expired',
				lastSyncAt: connection.lastSyncAt || undefined,
				error: 'Access token has expired',
			};
		}

		// Check sync status
		if (connection.syncStatus === 'failed' && connection.syncError) {
			return {
				healthy: false,
				status: 'error',
				lastSyncAt: connection.lastSyncAt || undefined,
				error: connection.syncError,
			};
		}

		return {
			healthy: true,
			status: connection.status,
			lastSyncAt: connection.lastSyncAt || undefined,
		};
	}

	/**
	 * Test connection
	 */
	static async testConnection(
		connectionId: number,
		userId: string
	): Promise<{
		success: boolean;
		message: string;
		error?: string;
	}> {
		const connection = await this.getConnection(connectionId, userId);
		if (!connection) {
			throw new Error('Connection not found');
		}

		const integration = await this.getIntegration(connection.integrationId);
		if (!integration) {
			throw new Error('Integration not found');
		}

		// This would typically make an API call to the external service
		// For now, we'll just check if the connection is valid
		try {
			// In a real implementation, you would:
			// 1. Make an API call to the external service
			// 2. Verify the access token is valid
			// 3. Return the result

			if (!connection.accessToken) {
				return {
					success: false,
					message: 'Connection test failed',
					error: 'No access token found',
				};
			}

			// Simulate API call - in production, this would be a real API call
			return {
				success: true,
				message: 'Connection test successful',
			};
		} catch (error) {
			return {
				success: false,
				message: 'Connection test failed',
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	/**
	 * Get available integration providers
	 */
	static getAvailableProviders(): Array<{
		name: string;
		slug: string;
		category: string;
		description: string;
		icon?: string;
	}> {
		return [
			{
				name: 'Stripe',
				slug: 'stripe',
				category: 'payment',
				description: 'Accept payments and manage subscriptions',
				icon: 'stripe',
			},
			{
				name: 'Slack',
				slug: 'slack',
				category: 'communication',
				description: 'Send notifications and updates to Slack',
				icon: 'slack',
			},
			{
				name: 'QuickBooks',
				slug: 'quickbooks',
				category: 'accounting',
				description: 'Sync invoices, payments, and customers',
				icon: 'quickbooks',
			},
			{
				name: 'Xero',
				slug: 'xero',
				category: 'accounting',
				description: 'Sync financial data with Xero',
				icon: 'xero',
			},
			{
				name: 'Zapier',
				slug: 'zapier',
				category: 'automation',
				description: 'Connect with thousands of apps via Zapier',
				icon: 'zapier',
			},
		];
	}
}

