/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { getDbOrThrow } from "@/lib/db";
import { analyticsEvents } from "@/lib/db/schemas/analytics.schema";
import {
	type Cohort,
	type CohortAnalytics,
	type NewCohort,
	type NewCohortAnalytics,
	type NewCohortMembership,
	type NewSegmentMembership,
	type NewUserSegment,
	type SegmentMembership,
	type UserSegment,
	cohortAnalytics,
	cohortMemberships,
	cohorts,
	segmentMemberships,
	userSegments,
} from "@/lib/db/schemas/segmentation.schema";
import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { BarChart3, Clock, Filter, Trash2, TrendingUp } from "lucide-react";

/**
 * Segmentation criteria types
 */
export interface SegmentCriteria {
	type: "event" | "property" | "cohort" | "composite";
	rules: SegmentRule[];
	operator?: "AND" | "OR";
}

export interface SegmentRule {
	field: string;
	operator:
		| "equals"
		| "not_equals"
		| "contains"
		| "greater_than"
		| "less_than"
		| "in"
		| "not_in";
	value: string | number | boolean | string[] | number[];
}

/**
 * Cohort criteria types
 */
export interface CohortCriteria {
	eventName?: string;
	propertyName?: string;
	propertyValue?: string | number;
	minOccurrences?: number;
}

/**
 * Service for managing user segmentation and cohort analysis
 */
export class SegmentationService {
	// Runtime DB getter to avoid build-time DB access
	private get _db() {
		return getDbOrThrow();
	}
	/**
	 * Create a new user segment
	 */
	async createSegment(data: NewUserSegment): Promise<UserSegment> {
		const [segment] = await this._db
			.insert(userSegments)
			.values(data)
			.returning();

		if (!segment) {
			throw new Error("Failed to create segment");
		}

		// Calculate initial segment membership
		await this.calculateSegmentMembership(segment.id);

		return segment;
	}

	/**
	 * Get all segments
	 */
	async getSegments(): Promise<UserSegment[]> {
		return this._db
			.select()
			.from(userSegments)
			.orderBy(desc(userSegments.createdAt));
	}

	/**
	 * Get segment by ID
	 */
	async getSegment(id: number): Promise<UserSegment | undefined> {
		const [segment] = await this._db
			.select()
			.from(userSegments)
			.where(eq(userSegments.id, id));
		return segment;
	}

	/**
	 * Update segment
	 */
	async updateSegment(
		id: number,
		data: Partial<NewUserSegment>,
	): Promise<UserSegment> {
		const [segment] = await this._db
			.update(userSegments)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(userSegments.id, id))
			.returning();

		// Recalculate membership if criteria changed
		if (data.criteria) {
			await this.calculateSegmentMembership(id);
		}

		if (!segment) {
			throw new Error("Failed to update segment");
		}

		return segment;
	}

	/**
	 * Delete segment
	 */
	async deleteSegment(id: number): Promise<void> {
		await this._db.delete(userSegments).where(eq(userSegments.id, id));
	}

	/**
	 * Calculate segment membership based on criteria
	 */
	async calculateSegmentMembership(segmentId: number): Promise<void> {
		const segment = await this.getSegment(segmentId);
		if (!segment) return;

		const criteria = segment.criteria as SegmentCriteria;

		// Clear existing memberships
		await this._db
			.delete(segmentMemberships)
			.where(eq(segmentMemberships.segmentId, segmentId));

		// Get users matching criteria
		const matchingUsers = await this.getUsersMatchingCriteria(criteria);

		// Add new memberships
		if (matchingUsers.length > 0) {
			const memberships: NewSegmentMembership[] = matchingUsers.map(
				(userId) => ({
					segmentId,
					userId,
					metadata: {},
				}),
			);

			await this._db.insert(segmentMemberships).values(memberships);
		}

		// Update user count and last calculated time
		await this._db
			.update(userSegments)
			.set({
				userCount: matchingUsers.length,
				lastCalculated: new Date(),
			})
			.where(eq(userSegments.id, segmentId));
	}

	/**
	 * Get users matching segment criteria
	 */
	private async getUsersMatchingCriteria(
		criteria: SegmentCriteria,
	): Promise<string[]> {
		// This is a simplified implementation
		// In production, you'd want more sophisticated query building

		if (criteria.type === "event") {
			// Find users who performed specific events
			const eventRule = criteria.rules[0];
			if (!eventRule) return [];

			const results = await this._db
				.select({ userId: analyticsEvents.userId })
				.from(analyticsEvents)
				.where(
					and(
						eq(analyticsEvents.eventName, eventRule.value as string),
						sql`${analyticsEvents.userId} IS NOT NULL`,
					),
				)
				.groupBy(analyticsEvents.userId);

			return results
				.map((r) => r.userId)
				.filter((id): id is string => id !== null);
		}

		// Add more criteria types as needed
		return [];
	}

	/**
	 * Get segment memberships for a user
	 */
	async getUserSegments(userId: string): Promise<UserSegment[]> {
		const memberships = await this._db
			.select({
				segment: userSegments,
			})
			.from(segmentMemberships)
			.innerJoin(
				userSegments,
				eq(segmentMemberships.segmentId, userSegments.id),
			)
			.where(eq(segmentMemberships.userId, userId));

		return memberships.map((m) => m.segment);
	}

	/**
	 * Get users in a segment
	 */
	async getSegmentUsers(
		segmentId: number,
		limit = 100,
		offset = 0,
	): Promise<SegmentMembership[]> {
		return this._db
			.select()
			.from(segmentMemberships)
			.where(eq(segmentMemberships.segmentId, segmentId))
			.limit(limit)
			.offset(offset);
	}

	// ==================== COHORT METHODS ====================

	/**
	 * Create a new cohort
	 */
	async createCohort(data: NewCohort): Promise<Cohort> {
		const [cohort] = await this._db.insert(cohorts).values(data).returning();

		if (!cohort) {
			throw new Error("Failed to create cohort");
		}

		// Calculate initial cohort membership
		await this.calculateCohortMembership(cohort.id);

		return cohort;
	}

	/**
	 * Get all cohorts
	 */
	async getCohorts(): Promise<Cohort[]> {
		return this._db.select().from(cohorts).orderBy(desc(cohorts.createdAt));
	}

	/**
	 * Get cohort by ID
	 */
	async getCohort(id: number): Promise<Cohort | undefined> {
		const [cohort] = await this._db
			.select()
			.from(cohorts)
			.where(eq(cohorts.id, id));
		return cohort;
	}

	/**
	 * Update cohort
	 */
	async updateCohort(id: number, data: Partial<NewCohort>): Promise<Cohort> {
		const [cohort] = await this._db
			.update(cohorts)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(cohorts.id, id))
			.returning();

		if (!cohort) {
			throw new Error("Failed to update cohort");
		}

		// Recalculate membership if criteria changed
		if (data.criteria) {
			await this.calculateCohortMembership(id);
		}

		return cohort;
	}

	/**
	 * Delete cohort
	 */
	async deleteCohort(id: number): Promise<void> {
		await this._db.delete(cohorts).where(eq(cohorts.id, id));
	}

	/**
	 * Calculate cohort membership
	 */
	async calculateCohortMembership(cohortId: number): Promise<void> {
		const cohort = await this.getCohort(cohortId);
		if (!cohort) return;

		const criteria = cohort.criteria as CohortCriteria;

		// Clear existing memberships
		await this._db
			.delete(cohortMemberships)
			.where(eq(cohortMemberships.cohortId, cohortId));

		// Get users who joined during cohort period
		const matchingUsers = await this.getUsersForCohort(cohort, criteria);

		// Add new memberships
		if (matchingUsers.length > 0) {
			const memberships: NewCohortMembership[] = matchingUsers.map(
				({ userId, joinedAt }) => ({
					cohortId,
					userId,
					joinedAt,
					metadata: {},
				}),
			);

			await this._db.insert(cohortMemberships).values(memberships);
		}

		// Update user count
		await this._db
			.update(cohorts)
			.set({ userCount: matchingUsers.length })
			.where(eq(cohorts.id, cohortId));
	}

	/**
	 * Get users for cohort based on criteria
	 */
	private async getUsersForCohort(
		cohort: Cohort,
		criteria: CohortCriteria,
	): Promise<Array<{ userId: string; joinedAt: Date }>> {
		// Find users who performed the cohort-defining event during the cohort period
		if (criteria.eventName) {
			const results = await this._db
				.select({
					userId: analyticsEvents.userId,
					joinedAt: sql<Date>`MIN(${analyticsEvents.timestamp})`.as(
						"joined_at",
					),
				})
				.from(analyticsEvents)
				.where(
					and(
						eq(analyticsEvents.eventName, criteria.eventName),
						gte(analyticsEvents.timestamp, cohort.startDate),
						lte(analyticsEvents.timestamp, cohort.endDate),
						sql`${analyticsEvents.userId} IS NOT NULL`,
					),
				)
				.groupBy(analyticsEvents.userId);

			return results.filter(
				(r): r is { userId: string; joinedAt: Date } =>
					r.userId !== null && r.joinedAt !== null,
			);
		}

		return [];
	}

	/**
	 * Get cohort users
	 */
	async getCohortUsers(cohortId: number, limit = 100, offset = 0) {
		return this._db
			.select()
			.from(cohortMemberships)
			.where(eq(cohortMemberships.cohortId, cohortId))
			.limit(limit)
			.offset(offset);
	}

	/**
	 * Calculate cohort analytics for a specific period
	 */
	async calculateCohortAnalytics(
		cohortId: number,
		periodStart: Date,
		periodEnd: Date,
	): Promise<CohortAnalytics> {
		const cohort = await this.getCohort(cohortId);
		if (!cohort) {
			throw new Error("Cohort not found");
		}

		// Get all cohort members
		const members = await this._db
			.select()
			.from(cohortMemberships)
			.where(eq(cohortMemberships.cohortId, cohortId));

		const memberIds = members.map((m) => m.userId);

		// Calculate active users (users who had any event in the period)
		const activeUsersResult = await this._db
			.select({ count: count() })
			.from(analyticsEvents)
			.where(
				and(
					sql`${analyticsEvents.userId} = ANY(${memberIds})`,
					gte(analyticsEvents.timestamp, periodStart),
					lte(analyticsEvents.timestamp, periodEnd),
				),
			);

		const activeUsers = activeUsersResult[0]?.count || 0;
		const totalUsers = members.length;
		const churnedUsers = totalUsers - activeUsers;
		const retentionRate =
			totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

		// Calculate additional metrics
		const metrics = {
			totalUsers,
			activeUsers,
			churnedUsers,
			retentionRate,
			periodStart: periodStart.toISOString(),
			periodEnd: periodEnd.toISOString(),
		};

		// Store analytics
		const [analytics] = await this._db
			.insert(cohortAnalytics)
			.values({
				cohortId,
				periodStart,
				periodEnd,
				metrics,
				retentionRate,
				activeUsers,
				churnedUsers,
				revenueGenerated: 0, // Would need revenue data
			})
			.returning();

		return analytics;
	}

	/**
	 * Get cohort analytics history
	 */
	async getCohortAnalyticsHistory(
		cohortId: number,
	): Promise<CohortAnalytics[]> {
		return this._db
			.select()
			.from(cohortAnalytics)
			.where(eq(cohortAnalytics.cohortId, cohortId))
			.orderBy(desc(cohortAnalytics.periodStart));
	}

	/**
	 * Get retention curve for a cohort
	 */
	async getCohortRetentionCurve(
		cohortId: number,
		periods = 12,
	): Promise<
		Array<{ period: number; retentionRate: number; activeUsers: number }>
	> {
		const cohort = await this.getCohort(cohortId);
		if (!cohort) {
			throw new Error("Cohort not found");
		}

		const retentionData = [];
		const periodLength = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds

		for (let i = 0; i < periods; i++) {
			const periodStart = new Date(
				cohort.startDate.getTime() + i * periodLength,
			);
			const periodEnd = new Date(periodStart.getTime() + periodLength);

			// Check if we have cached analytics
			const [cached] = await this._db
				.select()
				.from(cohortAnalytics)
				.where(
					and(
						eq(cohortAnalytics.cohortId, cohortId),
						eq(cohortAnalytics.periodStart, periodStart),
					),
				);

			if (cached) {
				retentionData.push({
					period: i,
					retentionRate: cached.retentionRate || 0,
					activeUsers: cached.activeUsers || 0,
				});
			} else {
				// Calculate on the fly
				const analytics = await this.calculateCohortAnalytics(
					cohortId,
					periodStart,
					periodEnd,
				);
				retentionData.push({
					period: i,
					retentionRate: analytics.retentionRate || 0,
					activeUsers: analytics.activeUsers || 0,
				});
			}
		}

		return retentionData;
	}
}

// Export singleton instance
export const segmentationService = new SegmentationService();
