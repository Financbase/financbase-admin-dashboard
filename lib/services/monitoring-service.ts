/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from '@/lib/db';
import { monitoringMetrics, monitoringAlerts, monitoringEvents, monitoringDashboards } from '@/lib/db/schema/monitoring';
import { eq, and, desc, gte, sql } from 'drizzle-orm';
import { NotificationService } from '@/lib/services/notification-service';

export interface MonitoringMetric {
	name: string;
	value: number;
	type: 'counter' | 'gauge' | 'histogram' | 'summary';
	labels?: Record<string, string>;
	timestamp: Date;
}

export interface MonitoringAlert {
	name: string;
	severity: 'low' | 'medium' | 'high' | 'critical';
	metricName: string;
	condition: 'greater_than' | 'less_than' | 'equals';
	threshold: number;
	duration: number; // minutes
	channels: string[];
}

export interface PerformanceMetrics {
	apiResponseTime: number;
	databaseQueryTime: number;
	errorRate: number;
	throughput: number;
	memoryUsage: number;
	cpuUsage: number;
	activeUsers: number;
}

export class MonitoringService {
	/**
	 * Record a monitoring metric
	 */
	static async recordMetric(
		userId: string,
		metric: MonitoringMetric
	): Promise<void> {
		try {
			// Insert metric
			await db.insert(monitoringMetrics).values({
				userId,
				metricName: metric.name,
				metricType: metric.type,
				value: metric.value,
				labels: metric.labels || {},
				createdAt: metric.timestamp,
				updatedAt: sql`NOW()`,
			});

			// Check for alerts
			await this.checkMetricAlerts(userId, metric);

		} catch (error) {
			console.error('Error recording metric:', error);
		}
	}

	/**
	 * Record performance metrics
	 */
	static async recordPerformanceMetrics(
		userId: string,
		metrics: PerformanceMetrics
	): Promise<void> {
		const timestamp = new Date();

		// Record multiple metrics
		const metricPromises = [
			this.recordMetric(userId, {
				name: 'api_response_time',
				value: metrics.apiResponseTime,
				type: 'gauge',
				labels: { unit: 'ms' },
				timestamp,
			}),
			this.recordMetric(userId, {
				name: 'database_query_time',
				value: metrics.databaseQueryTime,
				type: 'gauge',
				labels: { unit: 'ms' },
				timestamp,
			}),
			this.recordMetric(userId, {
				name: 'error_rate',
				value: metrics.errorRate,
				type: 'gauge',
				labels: { unit: 'percentage' },
				timestamp,
			}),
			this.recordMetric(userId, {
				name: 'throughput',
				value: metrics.throughput,
				type: 'counter',
				labels: { unit: 'requests_per_minute' },
				timestamp,
			}),
			this.recordMetric(userId, {
				name: 'memory_usage',
				value: metrics.memoryUsage,
				type: 'gauge',
				labels: { unit: 'mb' },
				timestamp,
			}),
			this.recordMetric(userId, {
				name: 'cpu_usage',
				value: metrics.cpuUsage,
				type: 'gauge',
				labels: { unit: 'percentage' },
				timestamp,
			}),
			this.recordMetric(userId, {
				name: 'active_users',
				value: metrics.activeUsers,
				type: 'gauge',
				timestamp,
			}),
		];

		await Promise.all(metricPromises);
	}

	/**
	 * Record system event
	 */
	static async recordEvent(
		userId: string,
		event: {
			type: string;
			title: string;
			message: string;
			severity: 'info' | 'warning' | 'error' | 'critical';
			source: string;
			component?: string;
			details?: Record<string, any>;
			responseTime?: number;
			memoryUsage?: number;
		}
	): Promise<void> {
		try {
			await db.insert(monitoringEvents).values({
				userId,
				eventType: event.type,
				title: event.title,
				message: event.message,
				severity: event.severity,
				source: event.source,
				component: event.component,
				details: event.details || {},
				responseTime: event.responseTime,
				memoryUsage: event.memoryUsage,
				createdAt: new Date(),
				updatedAt: sql`NOW()`,
			});

			// Check if event should trigger alerts
			await this.checkEventAlerts(userId, event);

		} catch (error) {
			console.error('Error recording event:', error);
		}
	}

	/**
	 * Check metric-based alerts
	 */
	private static async checkMetricAlerts(userId: string, metric: MonitoringMetric): Promise<void> {
		try {
			// Get active alerts for this metric
			const alerts = await db
				.select()
				.from(monitoringAlerts)
				.where(and(
					eq(monitoringAlerts.metricName, metric.name),
					eq(monitoringAlerts.status, 'active'),
					eq(monitoringAlerts.userId, userId)
				));

			for (const alert of alerts) {
				if (this.evaluateAlertCondition(metric.value, alert.condition, alert.threshold)) {
					await this.triggerAlert(userId, alert, metric);
				}
			}

		} catch (error) {
			console.error('Error checking metric alerts:', error);
		}
	}

	/**
	 * Check event-based alerts
	 */
	private static async checkEventAlerts(userId: string, event: any): Promise<void> {
		try {
			// Get alerts for this event type
			const alerts = await db
				.select()
				.from(monitoringAlerts)
				.where(and(
					eq(monitoringAlerts.metricName, event.type),
					eq(monitoringAlerts.status, 'active'),
					eq(monitoringAlerts.userId, userId)
				));

			for (const alert of alerts) {
				if (this.evaluateAlertCondition(1, alert.condition, alert.threshold)) {
					await this.triggerAlert(userId, alert, event);
				}
			}

		} catch (error) {
			console.error('Error checking event alerts:', error);
		}
	}

	/**
	 * Evaluate alert condition
	 */
	private static evaluateAlertCondition(value: number, condition: string, threshold: number): boolean {
		switch (condition) {
			case 'greater_than':
				return value > threshold;
			case 'less_than':
				return value < threshold;
			case 'equals':
				return value === threshold;
			case 'not_equals':
				return value !== threshold;
			default:
				return false;
		}
	}

	/**
	 * Trigger alert notification
	 */
	private static async triggerAlert(
		userId: string,
		alert: any,
		triggerData: MonitoringMetric | any
	): Promise<void> {
		try {
			// Check cooldown period
			if (alert.lastTriggeredAt) {
				const cooldownEnd = new Date(alert.lastTriggeredAt);
				cooldownEnd.setMinutes(cooldownEnd.getMinutes() + alert.cooldownMinutes);

				if (new Date() < cooldownEnd) {
					return; // Still in cooldown period
				}
			}

			// Update alert trigger count and timestamp
			await db
				.update(monitoringAlerts)
				.set({
					lastTriggeredAt: sql`NOW()`,
					triggerCount: sql`${monitoringAlerts.triggerCount} + 1`,
					updatedAt: sql`NOW()`,
				})
				.where(eq(monitoringAlerts.id, alert.id));

			// Send notification
			const alertTitle = `🚨 ${alert.alertName} Alert`;
			const alertMessage = this.generateAlertMessage(alert, triggerData);

			await NotificationService.createSystemAlert(
				userId,
				alertTitle,
				alertMessage,
				alert.severity === 'critical' ? 'urgent' : 'high',
				'/admin/monitoring'
			);

			// Send to configured channels
			await this.sendToAlertChannels(userId, alert, triggerData);

		} catch (error) {
			console.error('Error triggering alert:', error);
		}
	}

	/**
	 * Generate alert message
	 */
	private static generateAlertMessage(alert: any, triggerData: any): string {
		let message = `${alert.alertName} has been triggered.\n\n`;

		if (triggerData.name && triggerData.value) {
			message += `Metric: ${triggerData.name}\n`;
			message += `Current Value: ${triggerData.value}${triggerData.labels?.unit || ''}\n`;
			message += `Threshold: ${alert.condition} ${alert.threshold}${triggerData.labels?.unit || ''}\n`;
		}

		message += `Severity: ${alert.severity}\n`;
		message += `Time: ${new Date().toISOString()}\n`;

		if (alert.runbookUrl) {
			message += `Runbook: ${alert.runbookUrl}`;
		}

		return message;
	}

	/**
	 * Send alert to configured channels
	 */
	private static async sendToAlertChannels(
		userId: string,
		alert: any,
		triggerData: any
	): Promise<void> {
		try {
			const channels = alert.notificationChannels || ['email'];

			for (const channel of channels) {
				switch (channel) {
					case 'email':
						await this.sendEmailAlert(userId, alert, triggerData);
						break;

					case 'slack':
						await this.sendSlackAlert(userId, alert, triggerData);
						break;

					case 'webhook':
						await this.sendWebhookAlert(userId, alert, triggerData);
						break;
				}
			}

		} catch (error) {
			console.error('Error sending alert to channels:', error);
		}
	}

	/**
	 * Send email alert
	 */
	private static async sendEmailAlert(
		userId: string,
		alert: any,
		triggerData: any
	): Promise<void> {
		// This would integrate with your email service
		console.log('Sending email alert:', {
			userId,
			alertName: alert.alertName,
			severity: alert.severity,
			triggerData,
		});
	}

	/**
	 * Send Slack alert
	 */
	private static async sendSlackAlert(
		userId: string,
		alert: any,
		triggerData: any
	): Promise<void> {
		// This would integrate with Slack webhook
		console.log('Sending Slack alert:', {
			userId,
			alertName: alert.alertName,
			severity: alert.severity,
		});
	}

	/**
	 * Send webhook alert
	 */
	private static async sendWebhookAlert(
		userId: string,
		alert: any,
		triggerData: any
	): Promise<void> {
		// This would send to configured webhook
		console.log('Sending webhook alert:', {
			userId,
			alertName: alert.alertName,
			severity: alert.severity,
		});
	}

	/**
	 * Get system performance metrics
	 */
	static async getPerformanceMetrics(userId: string, timeRange: string = '1h'): Promise<PerformanceMetrics> {
		try {
			// Calculate time range
			const now = new Date();
			const pastTime = this.getPastTime(timeRange, now);

			// Get metrics from database
			const metrics = await db
				.select()
				.from(monitoringMetrics)
				.where(and(
					eq(monitoringMetrics.userId, userId),
					gte(monitoringMetrics.createdAt, pastTime)
				))
				.orderBy(desc(monitoringMetrics.createdAt))
				.limit(100);

			// Calculate averages
			const apiResponseTimes = metrics.filter(m => m.metricName === 'api_response_time').map(m => Number(m.value));
			const databaseQueryTimes = metrics.filter(m => m.metricName === 'database_query_time').map(m => Number(m.value));
			const errorRates = metrics.filter(m => m.metricName === 'error_rate').map(m => Number(m.value));
			const throughputs = metrics.filter(m => m.metricName === 'throughput').map(m => Number(m.value));
			const memoryUsages = metrics.filter(m => m.metricName === 'memory_usage').map(m => Number(m.value));
			const cpuUsages = metrics.filter(m => m.metricName === 'cpu_usage').map(m => Number(m.value));
			const activeUsers = metrics.filter(m => m.metricName === 'active_users').map(m => Number(m.value));

			return {
				apiResponseTime: this.calculateAverage(apiResponseTimes),
				databaseQueryTime: this.calculateAverage(databaseQueryTimes),
				errorRate: this.calculateAverage(errorRates),
				throughput: this.calculateAverage(throughputs),
				memoryUsage: this.calculateAverage(memoryUsages),
				cpuUsage: this.calculateAverage(cpuUsages),
				activeUsers: Math.max(...activeUsers, 0),
			};

		} catch (error) {
			console.error('Error getting performance metrics:', error);
			return {
				apiResponseTime: 0,
				databaseQueryTime: 0,
				errorRate: 0,
				throughput: 0,
				memoryUsage: 0,
				cpuUsage: 0,
				activeUsers: 0,
			};
		}
	}

	/**
	 * Get system health status
	 */
	static async getSystemHealth(userId: string): Promise<{
		status: 'healthy' | 'degraded' | 'unhealthy';
		metrics: PerformanceMetrics;
		alerts: any[];
		uptime: number;
	}> {
		try {
			const metrics = await this.getPerformanceMetrics(userId);
			const alerts = await this.getActiveAlerts(userId);

			// Determine health status
			let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

			if (metrics.errorRate > 5 || metrics.apiResponseTime > 2000) {
				status = 'unhealthy';
			} else if (metrics.errorRate > 1 || metrics.apiResponseTime > 1000) {
				status = 'degraded';
			}

			// Calculate uptime (mock data)
			const uptime = 99.9; // Would calculate from actual uptime data

			return {
				status,
				metrics,
				alerts,
				uptime,
			};

		} catch (error) {
			console.error('Error getting system health:', error);
			return {
				status: 'unhealthy',
				metrics: {
					apiResponseTime: 0,
					databaseQueryTime: 0,
					errorRate: 0,
					throughput: 0,
					memoryUsage: 0,
					cpuUsage: 0,
					activeUsers: 0,
				},
				alerts: [],
				uptime: 0,
			};
		}
	}

	/**
	 * Get active alerts
	 */
	static async getActiveAlerts(userId: string) {
		return await db
			.select()
			.from(monitoringAlerts)
			.where(and(
				eq(monitoringAlerts.userId, userId),
				eq(monitoringAlerts.status, 'active')
			))
			.orderBy(desc(monitoringAlerts.createdAt));
	}

	/**
	 * Get monitoring events
	 */
	static async getEvents(
		userId: string,
		filters: {
			type?: string;
			severity?: string;
			source?: string;
			limit?: number;
			startDate?: Date;
			endDate?: Date;
		} = {}
	) {
		try {
			let query = db
				.select()
				.from(monitoringEvents)
				.where(eq(monitoringEvents.userId, userId))
				.orderBy(desc(monitoringEvents.createdAt))
				.limit(filters.limit || 100);

			if (filters.type) {
				query = query.where(eq(monitoringEvents.eventType, filters.type));
			}

			if (filters.severity) {
				query = query.where(eq(monitoringEvents.severity, filters.severity));
			}

			if (filters.source) {
				query = query.where(eq(monitoringEvents.source, filters.source));
			}

			if (filters.startDate) {
				query = query.where(gte(monitoringEvents.createdAt, filters.startDate));
			}

			if (filters.endDate) {
				query = query.where(gte(monitoringEvents.createdAt, filters.startDate));
			}

			return await query;

		} catch (error) {
			console.error('Error getting events:', error);
			return [];
		}
	}

	/**
	 * Create monitoring alert
	 */
	static async createAlert(
		userId: string,
		alert: Omit<typeof monitoringAlerts.$inferInsert, 'userId' | 'createdAt' | 'updatedAt'>
	): Promise<any> {
		try {
			const result = await db
				.insert(monitoringAlerts)
				.values({
					userId,
					...alert,
				})
				.returning();

			return result[0];

		} catch (error) {
			console.error('Error creating alert:', error);
			throw new Error('Failed to create alert');
		}
	}

	/**
	 * Resolve alert
	 */
	static async resolveAlert(userId: string, alertId: number): Promise<void> {
		try {
			await db
				.update(monitoringAlerts)
				.set({
					status: 'resolved',
					lastResolvedAt: sql`NOW()`,
					resolutionCount: sql`${monitoringAlerts.resolutionCount} + 1`,
					updatedAt: sql`NOW()`,
				})
				.where(and(
					eq(monitoringAlerts.id, alertId),
					eq(monitoringAlerts.userId, userId)
				));

		} catch (error) {
			console.error('Error resolving alert:', error);
		}
	}

	/**
	 * Get past time based on range
	 */
	private static getPastTime(range: string, from: Date): Date {
		const past = new Date(from);

		switch (range) {
			case '1h':
				past.setHours(past.getHours() - 1);
				break;
			case '24h':
				past.setDate(past.getDate() - 1);
				break;
			case '7d':
				past.setDate(past.getDate() - 7);
				break;
			case '30d':
				past.setDate(past.getDate() - 30);
				break;
			default:
				past.setHours(past.getHours() - 1);
		}

		return past;
	}

	/**
	 * Calculate average of array
	 */
	private static calculateAverage(values: number[]): number {
		if (values.length === 0) return 0;
		return values.reduce((sum, value) => sum + value, 0) / values.length;
	}

	/**
	 * Auto-discover performance issues
	 */
	static async autoDiscoverIssues(userId: string): Promise<{
		issues: Array<{
			type: string;
			severity: 'low' | 'medium' | 'high';
			message: string;
			recommendation: string;
		}>;
		suggestions: string[];
	}> {
		try {
			const metrics = await this.getPerformanceMetrics(userId);
			const events = await this.getEvents(userId, { limit: 50 });

			const issues = [];
			const suggestions = [];

			// Check response time
			if (metrics.apiResponseTime > 2000) {
				issues.push({
					type: 'performance',
					severity: 'high',
					message: `API response time is ${metrics.apiResponseTime}ms, which is above the recommended 2 seconds.`,
					recommendation: 'Consider optimizing database queries and implementing caching.',
				});
			}

			// Check error rate
			if (metrics.errorRate > 5) {
				issues.push({
					type: 'reliability',
					severity: 'high',
					message: `Error rate is ${metrics.errorRate}%, which exceeds the 5% threshold.`,
					recommendation: 'Investigate recent errors and implement better error handling.',
				});
			}

			// Check memory usage
			if (metrics.memoryUsage > 500) {
				issues.push({
					type: 'resource',
					severity: 'medium',
					message: `Memory usage is ${metrics.memoryUsage}MB, consider optimization.`,
					recommendation: 'Review memory-intensive operations and implement cleanup routines.',
				});
			}

			// Check for recent errors
			const recentErrors = events.filter(e =>
				e.severity === 'error' &&
				new Date(e.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
			);

			if (recentErrors.length > 10) {
				issues.push({
					type: 'reliability',
					severity: 'medium',
					message: `${recentErrors.length} errors occurred in the last 24 hours.`,
					recommendation: 'Review error logs and implement monitoring alerts.',
				});
			}

			// Generate suggestions
			if (metrics.throughput < 100) {
				suggestions.push('Consider implementing caching to improve performance.');
			}

			if (metrics.activeUsers < 10) {
				suggestions.push('Monitor user engagement and consider user onboarding improvements.');
			}

			return { issues, suggestions };

		} catch (error) {
			console.error('Error auto-discovering issues:', error);
			return { issues: [], suggestions: [] };
		}
	}
}
