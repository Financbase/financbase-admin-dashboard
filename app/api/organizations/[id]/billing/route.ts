/**
 * Organization Billing API Routes
 * GET - Get organization subscription/billing
 * POST - Create/update subscription
 * 
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRLS } from '@/lib/api/with-rls';
import { getCurrentUserId } from '@/lib/api/with-rls';
import { hasPermission } from '@/lib/services/organization.service';
import { db } from '@/lib/db';
import { organizationSubscriptions, subscriptionPlans } from '@/lib/db/schemas';
import { eq, and } from 'drizzle-orm';
import { logger } from '@/lib/logger';

/**
 * GET /api/organizations/[id]/billing
 * Get organization subscription/billing
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	return withRLS<{ success: boolean; data: any } | { error: string }>(async (clerkId, clerkUser, req) => {
		try {
			const userId = await getCurrentUserId();
			if (!userId) {
				return NextResponse.json(
					{ error: 'User not found in database' },
					{ status: 404 }
				);
			}

			// Verify user has permission
			const hasAccess = await hasPermission(userId, params.id, 'viewer');
			if (!hasAccess) {
				return NextResponse.json(
					{ error: 'Insufficient permissions' },
					{ status: 403 }
				);
			}

			const subscription = await db
				.select({
					subscription: organizationSubscriptions,
					plan: subscriptionPlans,
				})
				.from(organizationSubscriptions)
				.innerJoin(subscriptionPlans, eq(organizationSubscriptions.planId, subscriptionPlans.id))
				.where(
					and(
						eq(organizationSubscriptions.organizationId, params.id),
						eq(organizationSubscriptions.status, 'active')
					)
				)
				.limit(1);

			return NextResponse.json({
				success: true,
				data: subscription.length > 0 ? {
					...subscription[0].subscription,
					plan: subscription[0].plan,
				} : null,
			});
		} catch (error) {
			logger.error('[Organizations API] Error getting billing', { error, organizationId: params.id });
			return NextResponse.json(
				{ error: 'Failed to fetch billing information' },
				{ status: 500 }
			);
		}
	}, { request });
}

/**
 * POST /api/organizations/[id]/billing
 * Create/update subscription
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	return withRLS<{ success: boolean; data: any } | { error: string }>(async (clerkId, clerkUser, req) => {
		try {
			const userId = await getCurrentUserId();
			if (!userId) {
				return NextResponse.json(
					{ error: 'User not found in database' },
					{ status: 404 }
				);
			}

			// Verify user has permission (admin or owner)
			const hasAccess = await hasPermission(userId, params.id, 'admin');
			if (!hasAccess) {
				return NextResponse.json(
					{ error: 'Insufficient permissions to manage billing' },
					{ status: 403 }
				);
			}

			const body = await request.json();
			const { planId, stripeSubscriptionId, stripeCustomerId } = body;

			if (!planId) {
				return NextResponse.json(
					{ error: 'Plan ID is required' },
					{ status: 400 }
				);
			}

			// Check if subscription exists
			const existing = await db
				.select()
				.from(organizationSubscriptions)
				.where(eq(organizationSubscriptions.organizationId, params.id))
				.limit(1);

			const now = new Date();
			const periodEnd = new Date();
			periodEnd.setMonth(periodEnd.getMonth() + 1); // Default to monthly

			if (existing.length > 0) {
				// Update existing subscription
				const [updated] = await db
					.update(organizationSubscriptions)
					.set({
						planId,
						stripeSubscriptionId,
						stripeCustomerId,
						status: 'active',
						currentPeriodStart: now,
						currentPeriodEnd: periodEnd,
						updatedAt: now,
					})
					.where(eq(organizationSubscriptions.id, existing[0].id))
					.returning();

				return NextResponse.json({
					success: true,
					data: updated,
				});
			} else {
				// Create new subscription
				const [created] = await db
					.insert(organizationSubscriptions)
					.values({
						organizationId: params.id,
						planId,
						status: 'active',
						currentPeriodStart: now,
						currentPeriodEnd: periodEnd,
						stripeSubscriptionId,
						stripeCustomerId,
					})
					.returning();

				return NextResponse.json({
					success: true,
					data: created,
				}, { status: 201 });
			}
		} catch (error) {
			logger.error('[Organizations API] Error updating billing', { error, organizationId: params.id });
			return NextResponse.json(
				{ error: error instanceof Error ? error.message : 'Failed to update billing' },
				{ status: 500 }
			);
		}
	}, { request });
}

