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
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
					return NextResponse.json({ error: 'Plugin ID required' }, { status: 400 });
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
		console.error('Error fetching revenue data:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

/**
 * POST /api/marketplace/revenue/process-payouts
 * Process developer payouts (admin only)
 */
export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Check admin role
		const adminStatus = await isAdmin();
		if (!adminStatus) {
			return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
		}

		const body = await request.json();
		const { developerId, period } = body;

		if (!developerId || !period) {
			return NextResponse.json({ error: 'Developer ID and period required' }, { status: 400 });
		}

		const payout = await RevenueSharingService.processPayouts(developerId, period);

		return NextResponse.json(payout, { status: 201 });

	} catch (error) {
		console.error('Error processing payouts:', error);
		return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
	}
}

/**
 * PATCH /api/marketplace/revenue/process-billing
 * Process subscription billing (admin only)
 */
export async function PATCH(_request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Check admin role
		const adminStatus = await isAdmin();
		if (!adminStatus) {
			return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
		}

		const processedCount = await RevenueSharingService.processSubscriptionBilling();

		return NextResponse.json({
			message: `Processed ${processedCount} subscriptions successfully`,
			processedCount
		});

	} catch (error: unknown) {
		console.error('Error processing billing:', error);
		return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
	}
}
