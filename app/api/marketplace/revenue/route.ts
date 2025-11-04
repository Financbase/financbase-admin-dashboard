/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth/financbase-rbac';
import { RevenueSharingService } from '@/lib/services/integration/revenue-sharing.service';

/**
 * GET /api/marketplace/revenue
 * Get revenue analytics for marketplace
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const { searchParams } = new URL(request.url);
		const type = searchParams.get('type'); // 'overview', 'developer', 'plugin'

		switch (type) {
			case 'developer': {
				const developerEarnings = await RevenueSharingService.getDeveloperEarnings(userId);
				return NextResponse.json(developerEarnings);
			}

			case 'plugin': {
				const pluginId = searchParams.get('pluginId');
				if (!pluginId) {
					return ApiErrorHandler.badRequest('Plugin ID required');
				}
				const pluginAnalytics = await RevenueSharingService.getPluginAnalytics(pluginId);
				return NextResponse.json(pluginAnalytics);
			}

			case 'overview': {
				const stats = await RevenueSharingService.getMarketplaceStats();
				const topPlugins = await RevenueSharingService.getTopPlugins(5, 'month');
				return NextResponse.json({ stats, topPlugins });
			}

			default: {
				const stats = await RevenueSharingService.getMarketplaceStats();
				const topPlugins = await RevenueSharingService.getTopPlugins(5, 'month');
				return NextResponse.json({ stats, topPlugins });
			}
		}
	} catch (error: unknown) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * POST /api/marketplace/revenue/process-payouts
 * Process developer payouts (admin only)
 */
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Check admin role
		const adminStatus = await isAdmin();
		if (!adminStatus) {
			return ApiErrorHandler.forbidden('Admin access required');
		}

		let body;
		try {
			body = await request.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}

		const { developerId, period } = body;

		if (!developerId || !period) {
			return ApiErrorHandler.badRequest('Developer ID and period required');
		}

		const payout = await RevenueSharingService.processPayouts(developerId, period);

		return NextResponse.json(payout, { status: 201 });

	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * PATCH /api/marketplace/revenue/process-billing
 * Process subscription billing (admin only)
 */
export async function PATCH(_request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Check admin role
		const adminStatus = await isAdmin();
		if (!adminStatus) {
			return ApiErrorHandler.forbidden('Admin access required');
		}

		const processedCount = await RevenueSharingService.processSubscriptionBilling();

		return NextResponse.json({
			message: `Processed ${processedCount} subscriptions successfully`,
			processedCount
		});

	} catch (error: unknown) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
