/**
 * Subscription RBAC Service
 * Maps subscription plans to roles and permissions
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
	subscriptionPlanRbacMappings,
	subscriptionPlans,
	userSubscriptions,
	type SubscriptionPlanRbacMapping,
	type UserSubscription,
	type SubscriptionPlan,
} from "@/lib/db/schemas";
import { eq, and } from "drizzle-orm";
import type { FinancialPermission } from "@/types/auth";
import { FINANCIAL_PERMISSIONS } from "@/types/auth";

export interface PlanRoleMapping {
	role: "admin" | "manager" | "user" | "viewer";
	permissions: FinancialPermission[];
	gracePeriodDays: number;
}

export interface EffectiveRoleAndPermissions {
	role: "admin" | "manager" | "user" | "viewer";
	permissions: FinancialPermission[];
	financialAccess: {
		viewRevenue: boolean;
		editInvoices: boolean;
		approveExpenses: boolean;
		manageReports: boolean;
		accessAuditLogs: boolean;
	};
	isTrial: boolean;
	isInGracePeriod: boolean;
}

/**
 * Get role and permissions mapping for a subscription plan
 */
export async function getPlanRoleMapping(
	planId: string,
	isTrial: boolean = false,
): Promise<PlanRoleMapping | null> {
	try {
		const mapping = await db
			.select()
			.from(subscriptionPlanRbacMappings)
			.where(
				and(
					eq(subscriptionPlanRbacMappings.planId, planId),
					eq(subscriptionPlanRbacMappings.isTrialMapping, isTrial),
				),
			)
			.limit(1);

		if (mapping.length === 0) {
			return null;
		}

		const m = mapping[0];
		return {
			role: m.role,
			permissions: (m.permissions as string[]) as FinancialPermission[],
			gracePeriodDays: m.gracePeriodDays,
		};
	} catch (error) {
		console.error("Error getting plan role mapping:", error);
		return null;
	}
}

/**
 * Calculate user permissions based on plan, status, and trial status
 */
export async function calculateUserPermissions(
	planId: string,
	status: string,
	isTrial: boolean = false,
): Promise<PlanRoleMapping | null> {
	// If subscription is cancelled, expired, or suspended, return free plan mapping
	if (["cancelled", "expired", "suspended"].includes(status)) {
		// Get free plan mapping
		const freePlan = await db
			.select()
			.from(subscriptionPlans)
			.where(eq(subscriptionPlans.name, "Free"))
			.limit(1);

		if (freePlan.length > 0) {
			return getPlanRoleMapping(freePlan[0].id, false);
		}
		return null;
	}

	// Get mapping for current plan and trial status
	return getPlanRoleMapping(planId, isTrial);
}

/**
 * Check if subscription should revert to free plan (grace period expired)
 */
export async function shouldRevertToFreePlan(
	subscription: UserSubscription,
): Promise<boolean> {
	if (!["cancelled", "expired", "suspended"].includes(subscription.status)) {
		return false;
	}

	// Get grace period from mapping
	const mapping = await getPlanRoleMapping(subscription.planId, false);
	if (!mapping) {
		return true; // No mapping found, revert to free
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

	// Check if grace period has expired
	return new Date() > gracePeriodEnd;
}

/**
 * Get effective role and permissions for a user considering subscription status
 */
export async function getEffectiveRoleAndPermissions(
	userId: string,
): Promise<EffectiveRoleAndPermissions | null> {
	try {
		// Get user's subscription
		const subscription = await db
			.select()
			.from(userSubscriptions)
			.where(eq(userSubscriptions.userId, userId))
			.orderBy(userSubscriptions.createdAt)
			.limit(1);

		if (subscription.length === 0) {
			// No subscription, return free plan mapping
			const freePlan = await db
				.select()
				.from(subscriptionPlans)
				.where(eq(subscriptionPlans.name, "Free"))
				.limit(1);

			if (freePlan.length > 0) {
				const mapping = await getPlanRoleMapping(freePlan[0].id, false);
				if (mapping) {
					return {
						role: mapping.role,
						permissions: mapping.permissions,
						financialAccess: calculateFinancialAccess(mapping.permissions),
						isTrial: false,
						isInGracePeriod: false,
					};
				}
			}
			return null;
		}

		const sub = subscription[0];
		const isTrial = sub.status === "trial";
		const shouldRevert = await shouldRevertToFreePlan(sub);

		if (shouldRevert) {
			// Revert to free plan
			const freePlan = await db
				.select()
				.from(subscriptionPlans)
				.where(eq(subscriptionPlans.name, "Free"))
				.limit(1);

			if (freePlan.length > 0) {
				const mapping = await getPlanRoleMapping(freePlan[0].id, false);
				if (mapping) {
					return {
						role: mapping.role,
						permissions: mapping.permissions,
						financialAccess: calculateFinancialAccess(mapping.permissions),
						isTrial: false,
						isInGracePeriod: false,
					};
				}
			}
			return null;
		}

		// Check if in grace period
		const isInGracePeriod = ["cancelled", "expired", "suspended"].includes(
			sub.status,
		);

		// Get mapping for current plan
		const mapping = await calculateUserPermissions(
			sub.planId,
			sub.status,
			isTrial,
		);

		if (!mapping) {
			return null;
		}

		return {
			role: mapping.role,
			permissions: mapping.permissions,
			financialAccess: calculateFinancialAccess(mapping.permissions),
			isTrial,
			isInGracePeriod,
		};
	} catch (error) {
		console.error("Error getting effective role and permissions:", error);
		return null;
	}
}

/**
 * Get trial permissions (limited subset of plan permissions)
 */
export async function getTrialPermissions(
	planId: string,
): Promise<FinancialPermission[]> {
	const mapping = await getPlanRoleMapping(planId, true);
	if (mapping) {
		return mapping.permissions;
	}

	// If no trial mapping exists, get regular mapping and filter to view-only permissions
	const regularMapping = await getPlanRoleMapping(planId, false);
	if (regularMapping) {
		// Return only view permissions for trial (approximately 50% of permissions)
		return regularMapping.permissions.filter((perm) =>
			perm.includes(":view"),
		);
	}

	return [];
}

/**
 * Calculate financial access object from permissions
 */
function calculateFinancialAccess(
	permissions: FinancialPermission[],
): EffectiveRoleAndPermissions["financialAccess"] {
	return {
		viewRevenue: permissions.includes(FINANCIAL_PERMISSIONS.REVENUE_VIEW),
		editInvoices:
			permissions.includes(FINANCIAL_PERMISSIONS.INVOICES_EDIT) ||
			permissions.includes(FINANCIAL_PERMISSIONS.INVOICES_CREATE),
		approveExpenses: permissions.includes(
			FINANCIAL_PERMISSIONS.EXPENSES_APPROVE,
		),
		manageReports:
			permissions.includes(FINANCIAL_PERMISSIONS.REPORTS_CREATE) ||
			permissions.includes(FINANCIAL_PERMISSIONS.REPORTS_EXPORT),
		accessAuditLogs: permissions.includes(FINANCIAL_PERMISSIONS.AUDIT_LOGS_VIEW),
	};
}

/**
 * Get plan name by ID
 */
export async function getPlanName(planId: string): Promise<string | null> {
	try {
		const plan = await db
			.select()
			.from(subscriptionPlans)
			.where(eq(subscriptionPlans.id, planId))
			.limit(1);

		return plan.length > 0 ? plan[0].name : null;
	} catch (error) {
		console.error("Error getting plan name:", error);
		return null;
	}
}

