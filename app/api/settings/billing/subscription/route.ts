/**
 * Subscription Management API Routes
 * Handles subscription plans, current subscription, and billing operations
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { subscriptionPlans, userSubscriptions } from '@/lib/db/schemas';
import { eq } from 'drizzle-orm';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { syncSubscriptionToClerk } from '@/lib/services/clerk-metadata-sync.service';
import { logger } from '@/lib/logger';

// GET /api/settings/billing/subscription
// Get user's current subscription
export async function GET() {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();

		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Get current subscription
		const subscription = await db
			.select({
				id: userSubscriptions.id,
				planId: userSubscriptions.planId,
				status: userSubscriptions.status,
				currentPeriodStart: userSubscriptions.currentPeriodStart,
				currentPeriodEnd: userSubscriptions.currentPeriodEnd,
				trialStart: userSubscriptions.trialStart,
				trialEnd: userSubscriptions.trialEnd,
				cancelledAt: userSubscriptions.cancelledAt,
				cancelReason: userSubscriptions.cancelReason,
				nextBillingDate: userSubscriptions.nextBillingDate,
				autoRenew: userSubscriptions.autoRenew,
				stripeSubscriptionId: userSubscriptions.stripeSubscriptionId,
				stripeCustomerId: userSubscriptions.stripeCustomerId,
				createdAt: userSubscriptions.createdAt,
				updatedAt: userSubscriptions.updatedAt,
			})
			.from(userSubscriptions)
			.where(eq(userSubscriptions.userId, userId))
			.limit(1);

		if (!subscription.length) {
			// Return default free plan if no subscription exists
			const freePlan = await db
				.select()
				.from(subscriptionPlans)
				.where(eq(subscriptionPlans.name, 'Free'))
				.limit(1);

			return NextResponse.json({
				subscription: null,
				plan: freePlan[0] || null,
			});
		}

		// Get the subscription plan details
		const plan = await db
			.select()
			.from(subscriptionPlans)
			.where(eq(subscriptionPlans.id, subscription[0].planId))
			.limit(1);

		return NextResponse.json({
			subscription: subscription[0],
			plan: plan[0] || null,
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

// POST /api/settings/billing/subscription
// Create or update subscription
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();

		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		let body;
		try {
			body = await request.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}

		const { planId } = body;

		if (!planId) {
			return ApiErrorHandler.badRequest('Plan ID is required');
		}

		// Verify plan exists
		const plan = await db
			.select()
			.from(subscriptionPlans)
			.where(eq(subscriptionPlans.id, planId))
			.limit(1);

		if (!plan.length) {
			return ApiErrorHandler.notFound('Plan not found');
		}

		// Check if user already has a subscription
		const existingSubscription = await db
			.select()
			.from(userSubscriptions)
			.where(eq(userSubscriptions.userId, userId))
			.limit(1);

		const now = new Date();
		const periodEnd = new Date(now);
		periodEnd.setMonth(periodEnd.getMonth() + (plan[0].interval === 'yearly' ? 12 : 1));

		if (existingSubscription.length) {
			// Update existing subscription
			const updatedSubscription = await db
				.update(userSubscriptions)
				.set({
					planId,
					status: 'active',
					currentPeriodStart: now,
					currentPeriodEnd: periodEnd,
					nextBillingDate: periodEnd,
					autoRenew: true,
					updatedAt: now,
				})
				.where(eq(userSubscriptions.userId, userId))
				.returning();

			// Sync to Clerk metadata (async, don't fail subscription update if this fails)
			syncSubscriptionToClerk(userId, updatedSubscription[0], plan[0]).catch(
				(error) => {
					logger.error('Failed to sync subscription to Clerk:', error);
					// Log but don't throw - subscription update succeeded
				},
			);

			return NextResponse.json({ subscription: updatedSubscription[0] });
		} else {
			// Create new subscription
			const newSubscription = await db
				.insert(userSubscriptions)
				.values({
					userId,
					planId,
					status: 'trial', // Start with trial for new subscriptions
					currentPeriodStart: now,
					currentPeriodEnd: periodEnd,
					nextBillingDate: periodEnd,
					autoRenew: true,
				})
				.returning();

			// Sync to Clerk metadata (async, don't fail subscription creation if this fails)
			syncSubscriptionToClerk(userId, newSubscription[0], plan[0]).catch(
				(error) => {
					logger.error('Failed to sync subscription to Clerk:', error);
					// Log but don't throw - subscription creation succeeded
				},
			);

			return NextResponse.json({ subscription: newSubscription[0] });
		}
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
