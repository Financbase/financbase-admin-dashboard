/**
 * Clerk Metadata Sync Service
 * Syncs subscription changes to Clerk user metadata
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { clerkClient } from "@clerk/nextjs/server";
import type {
	UserSubscription,
	SubscriptionPlan,
} from "@/lib/db/schemas";
import {
	getEffectiveRoleAndPermissions,
	getPlanRoleMapping,
} from "./subscription-rbac.service";
import type { FinancbaseUserMetadata } from "@/types/auth";
import { db } from "@/lib/db";
import { subscriptionPlans, userSubscriptions } from "@/lib/db/schemas";
import { eq } from "drizzle-orm";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Sync subscription to Clerk metadata
 */
export async function syncSubscriptionToClerk(
	userId: string,
	subscription: UserSubscription,
	plan: SubscriptionPlan,
): Promise<{ success: boolean; error?: string }> {
	try {
		// Get effective role and permissions based on subscription
		const effective = await getEffectiveRoleAndPermissions(userId);

		if (!effective) {
			return {
				success: false,
				error: "Could not determine effective role and permissions",
			};
		}

		// Update Clerk metadata
		return await updateClerkMetadata(
			userId,
			effective.role,
			effective.permissions,
			effective.financialAccess,
		);
	} catch (error) {
		console.error("Error syncing subscription to Clerk:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Update Clerk user metadata with role and permissions
 */
export async function updateClerkMetadata(
	userId: string,
	role: "admin" | "manager" | "user" | "viewer",
	permissions: string[],
	financialAccess: {
		viewRevenue: boolean;
		editInvoices: boolean;
		approveExpenses: boolean;
		manageReports: boolean;
		accessAuditLogs: boolean;
	},
): Promise<{ success: boolean; error?: string }> {
	let lastError: Error | null = null;

	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
		try {
			const clerk = await clerkClient();

			// Get current user metadata to preserve other fields
			const clerkUser = await clerk.users.getUser(userId);
			const currentMetadata =
				(clerkUser.publicMetadata as unknown as FinancbaseUserMetadata) || {};

			// Build updated metadata (preserving existing fields)
			const updatedMetadata: FinancbaseUserMetadata = {
				...currentMetadata,
				role,
				permissions,
				financialAccess,
				// Preserve organizationId and preferences if they exist
				organizationId: currentMetadata.organizationId,
				preferences: currentMetadata.preferences,
			};

			// Update user metadata in Clerk using latest API
			// Note: updateUserMetadata is the recommended method per Clerk docs
			await clerk.users.updateUserMetadata(userId, {
				publicMetadata: updatedMetadata as unknown as Record<string, unknown>,
			});

			return { success: true };
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));
			console.error(
				`Error updating Clerk metadata (attempt ${attempt}/${MAX_RETRIES}):`,
				error,
			);

			// Wait before retry (exponential backoff)
			if (attempt < MAX_RETRIES) {
				await new Promise((resolve) =>
					setTimeout(resolve, RETRY_DELAY_MS * attempt),
				);
			}
		}
	}

	return {
		success: false,
		error: lastError?.message || "Failed to update Clerk metadata after retries",
	};
}

/**
 * Revert user to free plan role and permissions
 */
export async function revertToFreePlan(
	userId: string,
): Promise<{ success: boolean; error?: string }> {
	try {
		// Get free plan
		const freePlan = await db
			.select()
			.from(subscriptionPlans)
			.where(eq(subscriptionPlans.name, "Free"))
			.limit(1);

		if (freePlan.length === 0) {
			return {
				success: false,
				error: "Free plan not found",
			};
		}

		// Get free plan mapping
		const mapping = await getPlanRoleMapping(freePlan[0].id, false);

		if (!mapping) {
			return {
				success: false,
				error: "Free plan RBAC mapping not found",
			};
		}

		// Calculate financial access
		const financialAccess = {
			viewRevenue: mapping.permissions.includes("revenue:view"),
			editInvoices:
				mapping.permissions.includes("invoices:edit") ||
				mapping.permissions.includes("invoices:create"),
			approveExpenses: mapping.permissions.includes("expenses:approve"),
			manageReports:
				mapping.permissions.includes("reports:create") ||
				mapping.permissions.includes("reports:export"),
			accessAuditLogs: mapping.permissions.includes("audit:view"),
		};

		// Update Clerk metadata
		return await updateClerkMetadata(
			userId,
			mapping.role,
			mapping.permissions,
			financialAccess,
		);
	} catch (error) {
		console.error("Error reverting to free plan:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Sync user's current subscription to Clerk (useful for manual syncs)
 */
export async function syncCurrentSubscriptionToClerk(
	userId: string,
): Promise<{ success: boolean; error?: string }> {
	try {
		// Get user's current subscription
		const subscription = await db
			.select()
			.from(userSubscriptions)
			.where(eq(userSubscriptions.userId, userId))
			.orderBy(userSubscriptions.createdAt)
			.limit(1);

		if (subscription.length === 0) {
			// No subscription, revert to free plan
			return await revertToFreePlan(userId);
		}

		const sub = subscription[0];

		// Get plan details
		const plan = await db
			.select()
			.from(subscriptionPlans)
			.where(eq(subscriptionPlans.id, sub.planId))
			.limit(1);

		if (plan.length === 0) {
			return {
				success: false,
				error: "Subscription plan not found",
			};
		}

		return await syncSubscriptionToClerk(userId, sub, plan[0]);
	} catch (error) {
		console.error("Error syncing current subscription to Clerk:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

