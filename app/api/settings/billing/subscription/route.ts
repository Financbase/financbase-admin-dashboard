/**
 * Subscription Management API Routes
 * Handles subscription plans, current subscription, and billing operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { subscriptionPlans, userSubscriptions } from '@/lib/db/schemas';
import { eq } from 'drizzle-orm';

// GET /api/settings/billing/subscription
// Get user's current subscription
export async function GET() {
	try {
		const { userId } = auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
		console.error('Error fetching subscription:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

// POST /api/settings/billing/subscription
// Create or update subscription
export async function POST(request: NextRequest) {
	try {
		const { userId } = auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { planId } = body;

		if (!planId) {
			return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
		}

		// Verify plan exists
		const plan = await db
			.select()
			.from(subscriptionPlans)
			.where(eq(subscriptionPlans.id, planId))
			.limit(1);

		if (!plan.length) {
			return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
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

			return NextResponse.json({ subscription: newSubscription[0] });
		}
	} catch (error) {
		console.error('Error managing subscription:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
