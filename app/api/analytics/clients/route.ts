import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AnalyticsService } from '@/lib/services/analytics/analytics-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function GET() {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const clientAnalytics = await AnalyticsService.getClientAnalytics(userId);

		// Return in format expected by the hook
		// Get the latest month's new clients count, or 0 if no data
		const latestMonth = clientAnalytics.newClients.length > 0 
			? clientAnalytics.newClients[clientAnalytics.newClients.length - 1]?.count || 0
			: 0;

		return NextResponse.json({
			totalClients: clientAnalytics.totalClients,
			activeClients: clientAnalytics.activeClients,
			newClientsThisMonth: latestMonth,
			clientRetention: clientAnalytics.clientRetention,
			satisfactionScore: clientAnalytics.satisfactionScore,
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
