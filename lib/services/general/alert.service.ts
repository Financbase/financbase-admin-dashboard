/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { getDbOrThrow } from "@/lib/db";
import { alerts } from "@/lib/db/schemas/alerts.schema";
import type { Alert, NewAlert } from "@/lib/db/schemas/alerts.schema";
import { and, desc, eq, isNull, or } from "drizzle-orm";
import {
	AlertTriangle,
	ArrowUp,
	CheckCircle,
	Trash2,
	XCircle,
} from "lucide-react";

export interface AlertFilters {
	userId?: string;
	isRead?: boolean;
	isDismissed?: boolean;
	variant?: "information" | "success" | "warning" | "error";
	limit?: number;
	offset?: number;
}

export interface AlertStats {
	total: number;
	unread: number;
	byVariant: Record<string, number>;
}

export class AlertService {
	private db = getDbOrThrow();

	/**
	 * Create a new alert
	 */
	async createAlert(alertData: NewAlert): Promise<Alert> {
		try {
			const [alert] = await this.db
				.insert(alerts)
				.values({
					...alertData,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			return alert;
		} catch (error) {
			console.error("Failed to create alert:", error);
			throw new Error("Failed to create alert");
		}
	}

	/**
	 * Get alerts with optional filtering
	 */
	async getAlerts(filters: AlertFilters = {}): Promise<Alert[]> {
		try {
			const {
				userId,
				isRead,
				isDismissed = false,
				variant,
				limit = 50,
				offset = 0,
			} = filters;

			const query = this.db
				.select()
				.from(alerts)
				.where(
					and(
						// If userId is provided, filter by it; otherwise get global alerts
						userId ? eq(alerts.userId, userId) : isNull(alerts.userId),
						// Filter by read status if specified
						isRead !== undefined ? eq(alerts.isRead, isRead) : undefined,
						// Only show non-dismissed alerts by default
						eq(alerts.isDismissed, isDismissed),
						// Filter by variant if specified
						variant ? eq(alerts.variant, variant) : undefined,
						// Exclude expired alerts
						or(
							isNull(alerts.expiresAt),
							this.db.select({ now: sql`NOW()` }).limit(1),
						),
					),
				)
				.orderBy(desc(alerts.createdAt))
				.limit(limit)
				.offset(offset);

			const result = await query;
			return result || [];
		} catch (error) {
			console.error("Failed to get alerts:", error);
			throw new Error("Failed to get alerts");
		}
	}

	/**
	 * Get a single alert by ID
	 */
	async getAlertById(id: string): Promise<Alert | null> {
		try {
			const [alert] = await this.db
				.select()
				.from(alerts)
				.where(and(eq(alerts.id, id), eq(alerts.isDismissed, false)))
				.limit(1);

			return alert || null;
		} catch (error) {
			console.error("Failed to get alert by ID:", error);
			throw new Error("Failed to get alert");
		}
	}

	/**
	 * Mark an alert as read
	 */
	async markAsRead(id: string, userId?: string): Promise<Alert> {
		try {
			const updateData: Partial<Alert> = {
				isRead: true,
				updatedAt: new Date(),
			};

			const [alert] = await this.db
				.update(alerts)
				.set(updateData)
				.where(
					and(
						eq(alerts.id, id),
						userId ? eq(alerts.userId, userId) : isNull(alerts.userId),
						eq(alerts.isDismissed, false),
					),
				)
				.returning();

			if (!alert) {
				throw new Error("Alert not found or already dismissed");
			}

			return alert;
		} catch (error) {
			console.error("Failed to mark alert as read:", error);
			throw new Error("Failed to mark alert as read");
		}
	}

	/**
	 * Mark multiple alerts as read
	 */
	async markMultipleAsRead(ids: string[], userId?: string): Promise<number> {
		try {
			const result = await this.db
				.update(alerts)
				.set({
					isRead: true,
					updatedAt: new Date(),
				})
				.where(
					and(
						or(...ids.map((id) => eq(alerts.id, id))),
						userId ? eq(alerts.userId, userId) : isNull(alerts.userId),
						eq(alerts.isDismissed, false),
					),
				);

			return result.rowCount || 0;
		} catch (error) {
			console.error("Failed to mark multiple alerts as read:", error);
			throw new Error("Failed to mark alerts as read");
		}
	}

	/**
	 * Dismiss an alert
	 */
	async dismissAlert(id: string, userId?: string): Promise<Alert> {
		try {
			const [alert] = await this.db
				.update(alerts)
				.set({
					isDismissed: true,
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(alerts.id, id),
						userId ? eq(alerts.userId, userId) : isNull(alerts.userId),
					),
				)
				.returning();

			if (!alert) {
				throw new Error("Alert not found");
			}

			return alert;
		} catch (error) {
			console.error("Failed to dismiss alert:", error);
			throw new Error("Failed to dismiss alert");
		}
	}

	/**
	 * Get alert statistics
	 */
	async getAlertStats(userId?: string): Promise<AlertStats> {
		try {
			const baseCondition = userId
				? eq(alerts.userId, userId)
				: isNull(alerts.userId);

			// Get total count
			const [{ count: total }] = await this.db
				.select({ count: sql<number>`count(*)` })
				.from(alerts)
				.where(and(baseCondition, eq(alerts.isDismissed, false)));

			// Get unread count
			const [{ count: unread }] = await this.db
				.select({ count: sql<number>`count(*)` })
				.from(alerts)
				.where(
					and(
						baseCondition,
						eq(alerts.isDismissed, false),
						eq(alerts.isRead, false),
					),
				);

			// Get count by variant
			const variantCounts = await this.db
				.select({
					variant: alerts.variant,
					count: sql<number>`count(*)`,
				})
				.from(alerts)
				.where(and(baseCondition, eq(alerts.isDismissed, false)))
				.groupBy(alerts.variant);

			const byVariant: Record<string, number> = {};
			variantCounts.forEach(({ variant, count }) => {
				byVariant[variant] = count;
			});

			return {
				total,
				unread,
				byVariant,
			};
		} catch (error) {
			console.error("Failed to get alert stats:", error);
			throw new Error("Failed to get alert statistics");
		}
	}

	/**
	 * Clean up expired alerts
	 */
	async cleanupExpiredAlerts(): Promise<number> {
		try {
			const result = await this.db
				.delete(alerts)
				.where(
					and(sql`${alerts.expiresAt} < NOW()`, eq(alerts.isDismissed, false)),
				);

			return result.rowCount || 0;
		} catch (error) {
			console.error("Failed to cleanup expired alerts:", error);
			throw new Error("Failed to cleanup expired alerts");
		}
	}

	/**
	 * Create multiple alerts at once (bulk operation)
	 */
	async createBulkAlerts(alertDataArray: NewAlert[]): Promise<Alert[]> {
		try {
			const alertsToInsert = alertDataArray.map((alertData) => ({
				...alertData,
				createdAt: new Date(),
				updatedAt: new Date(),
			}));

			const insertedAlerts = await this.db
				.insert(alerts)
				.values(alertsToInsert)
				.returning();

			return insertedAlerts;
		} catch (error) {
			console.error("Failed to create bulk alerts:", error);
			throw new Error("Failed to create bulk alerts");
		}
	}
}
