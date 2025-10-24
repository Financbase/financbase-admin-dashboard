/**
 * Subscription Plans API Routes
 * Handles subscription plan management and retrieval
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscriptionPlans } from '@/lib/db/schemas';
import { eq, asc } from 'drizzle-orm';

// GET /api/settings/billing/plans
// Get all available subscription plans
export async function GET() {
	try {
		// const { userId } = auth(); // Not needed for public plan viewing

		// No auth required for viewing plans (public information)
		const plans = await db
			.select({
				id: subscriptionPlans.id,
				name: subscriptionPlans.name,
				description: subscriptionPlans.description,
				priceMonthly: subscriptionPlans.priceMonthly,
				priceYearly: subscriptionPlans.priceYearly,
				interval: subscriptionPlans.interval,
				features: subscriptionPlans.features,
				limits: subscriptionPlans.limits,
				isPopular: subscriptionPlans.isPopular,
				isEnterprise: subscriptionPlans.isEnterprise,
				sortOrder: subscriptionPlans.sortOrder,
				isActive: subscriptionPlans.isActive,
				createdAt: subscriptionPlans.createdAt,
			})
			.from(subscriptionPlans)
			.where(eq(subscriptionPlans.isActive, true))
			.orderBy(asc(subscriptionPlans.sortOrder));

		return NextResponse.json({ plans });
	} catch (error) {
		console.error('Error fetching subscription plans:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
