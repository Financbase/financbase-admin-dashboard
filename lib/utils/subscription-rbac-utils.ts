/**
 * Subscription RBAC Utility Functions
 * Helper functions for subscription-based permission checks
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
	userSubscriptions,
	subscriptionPlans,
} from "@/lib/db/schemas";
import { eq } from "drizzle-orm";
import {
	getEffectiveRoleAndPermissions,
	getPlanRoleMapping,
} from "@/lib/services/subscription-rbac.service";
import type { FinancialPermission } from "@/types/auth";

/**
 * Get subscription status for a user
 */
export async function getSubscriptionStatus(userId: string): Promise<{
	subscription: any;
	plan: any;
	effectiveRole: string | null;
	effectivePermissions: FinancialPermission[];
	isTrial: boolean;
	isInGracePeriod: boolean;
} | null> {
	try {
		// Get user's subscription
		const subscription = await db
			.select()
			.from(userSubscriptions)
			.where(eq(userSubscriptions.userId, userId))
			.orderBy(userSubscriptions.createdAt)
			.limit(1);

		if (subscription.length === 0) {
			// No subscription, return free plan status
			const freePlan = await db
				.select()
				.from(subscriptionPlans)
				.where(eq(subscriptionPlans.name, "Free"))
				.limit(1);

			if (freePlan.length > 0) {
				const mapping = await getPlanRoleMapping(freePlan[0].id, false);
				return {
					subscription: null,
					plan: freePlan[0],
					effectiveRole: mapping?.role || null,
					effectivePermissions: mapping?.permissions || [],
					isTrial: false,
					isInGracePeriod: false,
				};
			}
			return null;
		}

		const sub = subscription[0];

		// Get plan details
		const plan = await db
			.select()
			.from(subscriptionPlans)
			.where(eq(subscriptionPlans.id, sub.planId))
			.limit(1);

		if (plan.length === 0) {
			return null;
		}

		// Get effective role and permissions
		const effective = await getEffectiveRoleAndPermissions(userId);

		return {
			subscription: sub,
			plan: plan[0],
			effectiveRole: effective?.role || null,
			effectivePermissions: effective?.permissions || [],
			isTrial: effective?.isTrial || false,
			isInGracePeriod: effective?.isInGracePeriod || false,
		};
	} catch (error) {
		console.error("Error getting subscription status:", error);
		return null;
	}
}

/**
 * Check if user's plan has a specific feature
 */
export async function hasSubscriptionFeature(
	userId: string,
	feature: string,
): Promise<boolean> {
	try {
		const status = await getSubscriptionStatus(userId);
		if (!status || !status.plan) {
			return false;
		}

		const features = status.plan.features as Record<string, any>;
		return features[feature] === true;
	} catch (error) {
		console.error("Error checking subscription feature:", error);
		return false;
	}
}

/**
 * Combined check for subscription and permission
 */
export async function canAccessWithSubscription(
	userId: string,
	requiredPermission: FinancialPermission,
): Promise<boolean> {
	try {
		const status = await getSubscriptionStatus(userId);
		if (!status) {
			return false;
		}

		// Check if user has the required permission
		return status.effectivePermissions.includes(requiredPermission);
	} catch (error) {
		console.error("Error checking subscription access:", error);
		return false;
	}
}

/**
 * Check if user's subscription is active (not cancelled, expired, or in grace period)
 */
export async function isSubscriptionActive(userId: string): Promise<boolean> {
	try {
		const status = await getSubscriptionStatus(userId);
		if (!status || !status.subscription) {
			return false; // No subscription means free plan, which is "active" but limited
		}

		const sub = status.subscription;
		return (
			sub.status === "active" ||
			sub.status === "trial"
		) && !status.isInGracePeriod;
	} catch (error) {
		console.error("Error checking subscription active status:", error);
		return false;
	}
}

