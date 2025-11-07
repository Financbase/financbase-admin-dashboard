/**
 * Subscription Grace Period Service
 * Manages grace periods for cancelled/expired subscriptions
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from "@/lib/db";
import {
	subscriptionStatusHistory,
	userSubscriptions,
	type UserSubscription,
} from "@/lib/db/schemas";
import { eq, and, lte } from "drizzle-orm";
import { getPlanRoleMapping } from "./subscription-rbac.service";
import { revertToFreePlan } from "./clerk-metadata-sync.service";

/**
 * Check if subscription is in grace period
 */
export async function checkGracePeriodStatus(
	subscription: UserSubscription,
): Promise<{
	isInGracePeriod: boolean;
	gracePeriodEnd: Date | null;
	daysRemaining: number | null;
}> {
	if (!["cancelled", "expired", "suspended"].includes(subscription.status)) {
		return {
			isInGracePeriod: false,
			gracePeriodEnd: null,
			daysRemaining: null,
		};
	}

	// Get grace period from mapping
	const mapping = await getPlanRoleMapping(subscription.planId, false);
	if (!mapping) {
		return {
			isInGracePeriod: false,
			gracePeriodEnd: null,
			daysRemaining: null,
		};
	}

	const gracePeriodDays = mapping.gracePeriodDays;
	const cancelledAt = subscription.cancelledAt
		? new Date(subscription.cancelledAt)
		: null;
	const periodEnd = new Date(subscription.currentPeriodEnd);

	// Use cancelled_at if available, otherwise use period_end
	const gracePeriodStart = cancelledAt || periodEnd;
	const gracePeriodEnd = new Date(gracePeriodStart);
	gracePeriodEnd.setDate(gracePeriodEnd.getDate() + gracePeriodDays);

	const now = new Date();
	const isInGracePeriod = now <= gracePeriodEnd;
	const daysRemaining = isInGracePeriod
		? Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
		: null;

	return {
		isInGracePeriod,
		gracePeriodEnd,
		daysRemaining,
	};
}

/**
 * Start grace period for a subscription
 */
export async function startGracePeriod(
	userId: string,
	subscriptionId: string,
): Promise<{ success: boolean; error?: string }> {
	try {
		// Get subscription
		const subscription = await db
			.select()
			.from(userSubscriptions)
			.where(eq(userSubscriptions.id, subscriptionId))
			.limit(1);

		if (subscription.length === 0) {
			return {
				success: false,
				error: "Subscription not found",
			};
		}

		const sub = subscription[0];

		// Get grace period days from mapping
		const mapping = await getPlanRoleMapping(sub.planId, false);
		if (!mapping) {
			return {
				success: false,
				error: "Plan mapping not found",
			};
		}

		const gracePeriodDays = mapping.gracePeriodDays;
		const cancelledAt = sub.cancelledAt ? new Date(sub.cancelledAt) : new Date();
		const gracePeriodStart = cancelledAt;
		const gracePeriodEnd = new Date(gracePeriodStart);
		gracePeriodEnd.setDate(gracePeriodEnd.getDate() + gracePeriodDays);

		// Record status change in history
		await db.insert(subscriptionStatusHistory).values({
			subscriptionId: sub.id,
			userId: sub.userId,
			previousStatus: sub.status as any,
			newStatus: sub.status as any,
			gracePeriodStart,
			gracePeriodEnd,
			reason: "Grace period started",
			metadata: {
				gracePeriodDays,
			},
		});

		return { success: true };
	} catch (error) {
		console.error("Error starting grace period:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * End grace period and revert to free plan
 */
export async function endGracePeriod(
	userId: string,
): Promise<{ success: boolean; error?: string }> {
	try {
		// Revert to free plan
		const result = await revertToFreePlan(userId);

		if (!result.success) {
			return result;
		}

		// Update subscription status history
		const subscription = await db
			.select()
			.from(userSubscriptions)
			.where(eq(userSubscriptions.userId, userId))
			.orderBy(userSubscriptions.createdAt)
			.limit(1);

		if (subscription.length > 0) {
			await db.insert(subscriptionStatusHistory).values({
				subscriptionId: subscription[0].id,
				userId,
				previousStatus: subscription[0].status as any,
				newStatus: "expired" as any,
				reason: "Grace period ended - reverted to free plan",
			});
		}

		return { success: true };
	} catch (error) {
		console.error("Error ending grace period:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Get all subscriptions with expired grace periods
 */
export async function getExpiredGracePeriods(): Promise<
	Array<{ userId: string; subscriptionId: string }>
> {
	try {
		const now = new Date();

		// Get subscriptions with expired grace periods
		const expired = await db
			.select({
				userId: userSubscriptions.userId,
				subscriptionId: userSubscriptions.id,
			})
			.from(userSubscriptions)
			.innerJoin(
				subscriptionStatusHistory,
				eq(subscriptionStatusHistory.subscriptionId, userSubscriptions.id),
			)
			.where(
				and(
					eq(userSubscriptions.status, "cancelled"),
					lte(subscriptionStatusHistory.gracePeriodEnd, now),
				),
			);

		return expired.map((e) => ({
			userId: e.userId,
			subscriptionId: e.subscriptionId,
		}));
	} catch (error) {
		console.error("Error getting expired grace periods:", error);
		return [];
	}
}

/**
 * Process all expired grace periods
 */
export async function processExpiredGracePeriods(): Promise<{
	processed: number;
	errors: number;
}> {
	let processed = 0;
	let errors = 0;

	try {
		const expired = await getExpiredGracePeriods();

		for (const { userId } of expired) {
			const result = await endGracePeriod(userId);
			if (result.success) {
				processed++;
			} else {
				errors++;
				console.error(
					`Failed to process grace period for user ${userId}:`,
					result.error,
				);
			}
		}

		return { processed, errors };
	} catch (error) {
		console.error("Error processing expired grace periods:", error);
		return { processed, errors: errors + 1 };
	}
}

