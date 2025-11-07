/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from "@/lib/db";
import { adboardCampaigns } from "@/lib/db/schemas/adboard.schema";
import {
	financialAlerts,
	financialIntelligenceMetrics,
	modulePerformanceSnapshots,
} from "@/lib/db/schemas/financial-intelligence.schema";
import { projects } from "@/lib/db/schemas/freelance.schema";
import { properties } from "@/lib/db/schemas/real-estate.schema";
import { and, eq, gte, lte } from "drizzle-orm";
import {} from "lucide-react";

export interface FinancialImpact {
	userId: string;
	module: string;
	entityId: string;
	entityType: string;
	impactType: "revenue" | "expense" | "profit" | "roi";
	amount: number;
	currency: string;
	timestamp: Date;
	metadata?: Record<string, any>;
}

export interface ModuleSnapshot {
	module: string;
	revenue: number;
	expenses: number;
	profit: number;
	roi: number;
	activeEntities: number;
	efficiency: number;
	growth: number;
}

export class FinancialImpactTracker {
	private static instance: FinancialImpactTracker;
	private metricsCache: Map<string, any> = new Map();
	private alertThresholds: Map<string, number> = new Map();

	constructor() {
		this.initializeAlertThresholds();
	}

	static getInstance(): FinancialImpactTracker {
		if (!FinancialImpactTracker.instance) {
			FinancialImpactTracker.instance = new FinancialImpactTracker();
		}
		return FinancialImpactTracker.instance;
	}

	private initializeAlertThresholds() {
		// Set default alert thresholds
		this.alertThresholds.set("budget_exceeded", 0.9); // 90% of budget
		this.alertThresholds.set("roi_low", 20); // Below 20% ROI
		this.alertThresholds.set("expense_spike", 1.5); // 50% increase in expenses
		this.alertThresholds.set("revenue_drop", 0.8); // 20% drop in revenue
	}

	/**
	 * Track financial impact of business actions
	 */
	async trackImpact(impact: FinancialImpact): Promise<void> {
		try {
			// Store the impact metric
			await db.insert(financialIntelligenceMetrics).values({
				userId: impact.userId,
				metricName: `${impact.module}_${impact.impactType}`,
				metricType: impact.impactType,
				module: impact.module,
				value: impact.amount.toString(),
				currency: impact.currency,
				period: "realtime",
				periodStart: impact.timestamp,
				periodEnd: impact.timestamp,
				metadata: impact.metadata,
			});

			// Update module performance snapshot
			await this.updateModuleSnapshot(impact);

			// Check for alerts
			await this.checkAlerts(impact);

			// Update cache
			this.updateMetricsCache(impact);
		} catch (error) {
			console.error("Error tracking financial impact:", error);
			throw error;
		}
	}

	/**
	 * Update module performance snapshot
	 */
	private async updateModuleSnapshot(impact: FinancialImpact): Promise<void> {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// Get existing snapshot for today
		const existingSnapshot = await db
			.select()
			.from(modulePerformanceSnapshots)
			.where(
				and(
					eq(modulePerformanceSnapshots.userId, impact.userId),
					eq(modulePerformanceSnapshots.module, impact.module),
					eq(modulePerformanceSnapshots.snapshotType, "daily"),
					gte(modulePerformanceSnapshots.snapshotDate, today),
				),
			)
			.limit(1);

		if (existingSnapshot.length > 0) {
			// Update existing snapshot
			const snapshot = existingSnapshot[0];
			const newRevenue =
				impact.impactType === "revenue"
					? Number.parseFloat(snapshot.revenue) + impact.amount
					: Number.parseFloat(snapshot.revenue);
			const newExpenses =
				impact.impactType === "expense"
					? Number.parseFloat(snapshot.expenses) + impact.amount
					: Number.parseFloat(snapshot.expenses);
			const newProfit = newRevenue - newExpenses;
			const newROI = newExpenses > 0 ? (newProfit / newExpenses) * 100 : 0;

			await db
				.update(modulePerformanceSnapshots)
				.set({
					revenue: newRevenue.toString(),
					expenses: newExpenses.toString(),
					profit: newProfit.toString(),
					roi: newROI.toString(),
					updatedAt: new Date(),
				})
				.where(eq(modulePerformanceSnapshots.id, snapshot.id));
		} else {
			// Create new snapshot
			await db.insert(modulePerformanceSnapshots).values({
				userId: impact.userId,
				module: impact.module,
				snapshotType: "daily",
				snapshotDate: today,
				revenue:
					impact.impactType === "revenue" ? impact.amount.toString() : "0",
				expenses:
					impact.impactType === "expense" ? impact.amount.toString() : "0",
				profit: impact.impactType === "profit" ? impact.amount.toString() : "0",
				roi: impact.impactType === "roi" ? impact.amount.toString() : "0",
			});
		}
	}

	/**
	 * Check for financial alerts
	 */
	private async checkAlerts(impact: FinancialImpact): Promise<void> {
		const alerts: Array<{
			type: string;
			severity: string;
			title: string;
			message: string;
			thresholdValue?: number;
			actualValue?: number;
		}> = [];

		// Check budget exceeded
		if (impact.impactType === "expense") {
			const budgetThreshold = this.alertThresholds.get("budget_exceeded");
			if (budgetThreshold && impact.amount > 0) {
				// This would need to check against actual budget data
				// For now, we'll use a simplified check
				alerts.push({
					type: "budget_exceeded",
					severity: "high",
					title: "Budget Exceeded",
					message: `${impact.module} expenses have exceeded budget threshold`,
					actualValue: impact.amount,
				});
			}
		}

		// Check ROI threshold
		if (impact.impactType === "roi") {
			const roiThreshold = this.alertThresholds.get("roi_low");
			if (roiThreshold && impact.amount < roiThreshold) {
				alerts.push({
					type: "roi_low",
					severity: "medium",
					title: "Low ROI Alert",
					message: `${impact.module} ROI is below recommended threshold`,
					actualValue: impact.amount,
					thresholdValue: roiThreshold,
				});
			}
		}

		// Create alerts in database
		for (const alert of alerts) {
			await db.insert(financialAlerts).values({
				userId: impact.userId,
				alertType: alert.type,
				severity: alert.severity,
				title: alert.title,
				message: alert.message,
				thresholdValue: alert.thresholdValue?.toString(),
				actualValue: alert.actualValue?.toString(),
				module: impact.module,
				relatedEntityId: impact.entityId,
				relatedEntityType: impact.entityType,
				status: "active",
			});
		}
	}

	/**
	 * Update metrics cache
	 */
	private updateMetricsCache(impact: FinancialImpact): void {
		const cacheKey = `${impact.userId}_${impact.module}_${impact.impactType}`;
		const currentValue = this.metricsCache.get(cacheKey) || 0;
		this.metricsCache.set(cacheKey, currentValue + impact.amount);
	}

	/**
	 * Get real-time financial metrics
	 */
	async getRealTimeMetrics(
		userId: string,
		module?: string,
	): Promise<ModuleSnapshot[]> {
		try {
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			let query = db
				.select()
				.from(modulePerformanceSnapshots)
				.where(
					and(
						eq(modulePerformanceSnapshots.userId, userId),
						eq(modulePerformanceSnapshots.snapshotType, "daily"),
						gte(modulePerformanceSnapshots.snapshotDate, today),
					),
				);

			if (module) {
				query = query.where(eq(modulePerformanceSnapshots.module, module));
			}

			const snapshots = await query;

			return snapshots.map((snapshot) => ({
				module: snapshot.module,
				revenue: Number.parseFloat(snapshot.revenue),
				expenses: Number.parseFloat(snapshot.expenses),
				profit: Number.parseFloat(snapshot.profit),
				roi: Number.parseFloat(snapshot.roi || "0"),
				activeEntities: snapshot.activeProjects || 0,
				efficiency: Number.parseFloat(snapshot.efficiencyRate || "0"),
				growth: Number.parseFloat(snapshot.growthRate || "0"),
			}));
		} catch (error) {
			console.error("Error getting real-time metrics:", error);
			throw error;
		}
	}

	/**
	 * Get financial alerts for user
	 */
	async getActiveAlerts(userId: string): Promise<any[]> {
		try {
			return await db
				.select()
				.from(financialAlerts)
				.where(
					and(
						eq(financialAlerts.userId, userId),
						eq(financialAlerts.status, "active"),
					),
				)
				.orderBy(financialAlerts.createdAt);
		} catch (error) {
			console.error("Error getting alerts:", error);
			throw error;
		}
	}

	/**
	 * Acknowledge alert
	 */
	async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
		try {
			await db
				.update(financialAlerts)
				.set({
					status: "acknowledged",
					acknowledgedAt: new Date(),
					acknowledgedBy: userId,
				})
				.where(eq(financialAlerts.id, alertId));
		} catch (error) {
			console.error("Error acknowledging alert:", error);
			throw error;
		}
	}

	/**
	 * Resolve alert
	 */
	async resolveAlert(alertId: string, userId: string): Promise<void> {
		try {
			await db
				.update(financialAlerts)
				.set({
					status: "resolved",
					resolvedAt: new Date(),
					resolvedBy: userId,
				})
				.where(eq(financialAlerts.id, alertId));
		} catch (error) {
			console.error("Error resolving alert:", error);
			throw error;
		}
	}

	/**
	 * Track project financial impact
	 */
	async trackProjectImpact(
		userId: string,
		projectId: string,
		impactType: "revenue" | "expense",
		amount: number,
		metadata?: Record<string, any>,
	): Promise<void> {
		await this.trackImpact({
			userId,
			module: "freelance",
			entityId: projectId,
			entityType: "project",
			impactType,
			amount,
			currency: "USD",
			timestamp: new Date(),
			metadata,
		});
	}

	/**
	 * Track property financial impact
	 */
	async trackPropertyImpact(
		userId: string,
		propertyId: string,
		impactType: "revenue" | "expense",
		amount: number,
		metadata?: Record<string, any>,
	): Promise<void> {
		await this.trackImpact({
			userId,
			module: "real_estate",
			entityId: propertyId,
			entityType: "property",
			impactType,
			amount,
			currency: "USD",
			timestamp: new Date(),
			metadata,
		});
	}

	/**
	 * Track campaign financial impact
	 */
	async trackCampaignImpact(
		userId: string,
		campaignId: string,
		impactType: "revenue" | "expense",
		amount: number,
		metadata?: Record<string, any>,
	): Promise<void> {
		await this.trackImpact({
			userId,
			module: "adboard",
			entityId: campaignId,
			entityType: "campaign",
			impactType,
			amount,
			currency: "USD",
			timestamp: new Date(),
			metadata,
		});
	}
}
