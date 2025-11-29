/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from '@/lib/db';
import { systemMetrics, alertRules, alertHistory } from '@/lib/db/schemas';
import { eq, and, desc, gte, lte, or, ilike } from 'drizzle-orm';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export type SystemMetric = InferSelectModel<typeof systemMetrics>;
export type AlertRule = InferSelectModel<typeof alertRules>;
export type AlertHistory = InferSelectModel<typeof alertHistory>;

export type NewSystemMetric = InferInsertModel<typeof systemMetrics>;
export type NewAlertRule = InferInsertModel<typeof alertRules>;
export type NewAlertHistory = InferInsertModel<typeof alertHistory>;

export interface MonitoringEvent {
	type: string;
	severity: 'info' | 'warning' | 'error' | 'critical';
	message: string;
	metadata?: Record<string, any>;
	userId?: string;
	organizationId?: string;
}

export interface SystemHealth {
	status: 'healthy' | 'degraded' | 'down';
	uptime: number;
	version: string;
	database: {
		status: 'connected' | 'disconnected';
		latency?: number;
	};
	services: Record<string, {
		status: 'healthy' | 'degraded' | 'down';
		latency?: number;
	}>;
	timestamp: Date;
}

export class MonitoringService {
	/**
	 * Record a monitoring event
	 */
	static async recordEvent(
		event: MonitoringEvent
	): Promise<void> {
		await db.insert(systemMetrics).values({
			userId: event.userId || null,
			organizationId: event.organizationId || null,
			metricName: `event.${event.type}`,
			metricType: 'counter',
			category: 'system',
			value: JSON.stringify({
				severity: event.severity,
				message: event.message,
				metadata: event.metadata || {},
			}),
			labels: {
				type: event.type,
				severity: event.severity,
			} as any,
			tags: event.metadata as any,
		});
	}

	/**
	 * Get monitoring events
	 */
	static async getEvents(
		userId: string,
		options?: {
			organizationId?: string;
			severity?: 'info' | 'warning' | 'error' | 'critical';
			type?: string;
			startDate?: Date;
			endDate?: Date;
			limit?: number;
			offset?: number;
		}
	): Promise<SystemMetric[]> {
		const conditions = [];

		if (options?.organizationId) {
			conditions.push(eq(systemMetrics.organizationId, options.organizationId));
		} else {
			conditions.push(
				or(
					eq(systemMetrics.userId, userId),
					eq(systemMetrics.userId, null as any) // System-wide events
				)!
			);
		}

		if (options?.severity) {
			conditions.push(sql`${systemMetrics.labels}->>'severity' = ${options.severity}`);
		}

		if (options?.type) {
			conditions.push(sql`${systemMetrics.labels}->>'type' = ${options.type}`);
		}

		if (options?.startDate) {
			conditions.push(gte(systemMetrics.timestamp, options.startDate));
		}

		if (options?.endDate) {
			conditions.push(lte(systemMetrics.timestamp, options.endDate));
		}

		let query = db
			.select()
			.from(systemMetrics)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(systemMetrics.timestamp));

		if (options?.limit) {
			query = query.limit(options.limit) as any;
		}

		if (options?.offset) {
			query = query.offset(options.offset) as any;
		}

		return await query;
	}

	/**
	 * Get metrics
	 */
	static async getMetrics(
		userId: string,
		options?: {
			organizationId?: string;
			metricName?: string;
			category?: string;
			startDate?: Date;
			endDate?: Date;
			aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'count';
		}
	): Promise<{
		metrics: SystemMetric[];
		aggregations?: Record<string, number>;
	}> {
		const conditions = [];

		if (options?.organizationId) {
			conditions.push(eq(systemMetrics.organizationId, options.organizationId));
		} else {
			conditions.push(
				or(
					eq(systemMetrics.userId, userId),
					eq(systemMetrics.userId, null as any)
				)!
			);
		}

		if (options?.metricName) {
			conditions.push(eq(systemMetrics.metricName, options.metricName));
		}

		if (options?.category) {
			conditions.push(eq(systemMetrics.category, options.category));
		}

		if (options?.startDate) {
			conditions.push(gte(systemMetrics.timestamp, options.startDate));
		}

		if (options?.endDate) {
			conditions.push(lte(systemMetrics.timestamp, options.endDate));
		}

		const metrics = await db
			.select()
			.from(systemMetrics)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(systemMetrics.timestamp))
			.limit(1000);

		let aggregations: Record<string, number> | undefined;
		if (options?.aggregation && metrics.length > 0) {
			// Simple aggregation - in production, this would use SQL aggregation functions
			const values = metrics.map(m => {
				try {
					const parsed = JSON.parse(m.value);
					return typeof parsed === 'number' ? parsed : parsed.value || 0;
				} catch {
					return 0;
				}
			});

			switch (options.aggregation) {
				case 'avg':
					aggregations = { average: values.reduce((a, b) => a + b, 0) / values.length };
					break;
				case 'sum':
					aggregations = { sum: values.reduce((a, b) => a + b, 0) };
					break;
				case 'min':
					aggregations = { min: Math.min(...values) };
					break;
				case 'max':
					aggregations = { max: Math.max(...values) };
					break;
				case 'count':
					aggregations = { count: metrics.length };
					break;
			}
		}

		return { metrics, aggregations };
	}

	/**
	 * Get system health
	 */
	static async getSystemHealth(): Promise<SystemHealth> {
		// Check database connection
		let dbStatus: 'connected' | 'disconnected' = 'disconnected';
		let dbLatency: number | undefined;
		const dbStart = Date.now();
		try {
			await db.execute(sql`SELECT 1`);
			dbStatus = 'connected';
			dbLatency = Date.now() - dbStart;
		} catch {
			dbStatus = 'disconnected';
		}

		// Determine overall status
		let status: 'healthy' | 'degraded' | 'down' = 'healthy';
		if (dbStatus === 'disconnected') {
			status = 'down';
		} else if (dbLatency && dbLatency > 1000) {
			status = 'degraded';
		}

		return {
			status,
			uptime: process.uptime(),
			version: process.env.npm_package_version || '2.0.0',
			database: {
				status: dbStatus,
				latency: dbLatency,
			},
			services: {
				database: {
					status: dbStatus === 'connected' ? 'healthy' : 'down',
					latency: dbLatency,
				},
			},
			timestamp: new Date(),
		};
	}

	/**
	 * Get alert rules
	 */
	static async getAlertRules(
		userId: string,
		options?: {
			organizationId?: string;
			isActive?: boolean;
			limit?: number;
			offset?: number;
		}
	): Promise<AlertRule[]> {
		const conditions = [eq(alertRules.userId, userId)];

		if (options?.organizationId) {
			conditions.push(eq(alertRules.organizationId, options.organizationId));
		}

		if (options?.isActive !== undefined) {
			conditions.push(eq(alertRules.isActive, options.isActive));
		}

		let query = db
			.select()
			.from(alertRules)
			.where(and(...conditions))
			.orderBy(desc(alertRules.createdAt));

		if (options?.limit) {
			query = query.limit(options.limit) as any;
		}

		if (options?.offset) {
			query = query.offset(options.offset) as any;
		}

		return await query;
	}

	/**
	 * Get a single alert rule
	 */
	static async getAlertRule(ruleId: number, userId: string): Promise<AlertRule | null> {
		const result = await db
			.select()
			.from(alertRules)
			.where(and(eq(alertRules.id, ruleId), eq(alertRules.userId, userId)))
			.limit(1);

		return result[0] || null;
	}

	/**
	 * Create an alert rule
	 */
	static async createAlertRule(
		userId: string,
		data: {
			name: string;
			description?: string;
			organizationId?: string;
			metricName: string;
			condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
			threshold: string;
			timeWindow?: number;
			severity: 'low' | 'medium' | 'high' | 'critical';
			channels?: string[];
			cooldownPeriod?: number;
			maxAlertsPerHour?: number;
			labels?: Record<string, any>;
			filters?: Record<string, any>;
		}
	): Promise<AlertRule> {
		const [rule] = await db
			.insert(alertRules)
			.values({
				userId,
				organizationId: data.organizationId || null,
				name: data.name,
				description: data.description || null,
				isActive: true,
				metricName: data.metricName,
				condition: data.condition,
				threshold: data.threshold,
				timeWindow: data.timeWindow || 300,
				severity: data.severity,
				channels: (data.channels || ['email']) as any,
				cooldownPeriod: data.cooldownPeriod || 3600,
				maxAlertsPerHour: data.maxAlertsPerHour || 10,
				labels: (data.labels || {}) as any,
				filters: (data.filters || {}) as any,
			})
			.returning();

		return rule;
	}

	/**
	 * Update an alert rule
	 */
	static async updateAlertRule(
		ruleId: number,
		userId: string,
		data: Partial<{
			name: string;
			description: string;
			isActive: boolean;
			metricName: string;
			condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
			threshold: string;
			timeWindow: number;
			severity: 'low' | 'medium' | 'high' | 'critical';
			channels: string[];
			cooldownPeriod: number;
			maxAlertsPerHour: number;
			labels: Record<string, any>;
			filters: Record<string, any>;
		}>
	): Promise<AlertRule | null> {
		const [rule] = await db
			.update(alertRules)
			.set({
				...data,
				updatedAt: new Date(),
			} as any)
			.where(and(eq(alertRules.id, ruleId), eq(alertRules.userId, userId)))
			.returning();

		return rule || null;
	}

	/**
	 * Get alert history
	 */
	static async getAlertHistory(
		ruleId: number,
		userId: string,
		options?: {
			status?: 'triggered' | 'resolved' | 'acknowledged';
			limit?: number;
			offset?: number;
		}
	): Promise<AlertHistory[]> {
		// Verify rule ownership
		const rule = await this.getAlertRule(ruleId, userId);
		if (!rule) {
			throw new Error('Alert rule not found');
		}

		const conditions = [eq(alertHistory.ruleId, ruleId)];

		if (options?.status) {
			conditions.push(eq(alertHistory.status, options.status));
		}

		let query = db
			.select()
			.from(alertHistory)
			.where(and(...conditions))
			.orderBy(desc(alertHistory.triggeredAt));

		if (options?.limit) {
			query = query.limit(options.limit) as any;
		}

		if (options?.offset) {
			query = query.offset(options.offset) as any;
		}

		return await query;
	}
}
