import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
// import { headers } from 'next/headers'; // Temporarily disabled
import { DashboardService } from '@/lib/services/dashboard-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		// TEMPORARILY DISABLED FOR TESTING
		// const headersList = await headers();
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get('limit') || '10');

		const activities = await DashboardService.getRecentActivity(userId, limit);

		return NextResponse.json({ activities });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
