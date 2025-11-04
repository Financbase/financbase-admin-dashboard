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

		const expenseAnalytics = await AnalyticsService.getExpenseAnalytics(userId);

		return NextResponse.json({ analytics: expenseAnalytics });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
