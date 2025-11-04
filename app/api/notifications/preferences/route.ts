import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/services/notification-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const preferences = await NotificationService.getUserPreferences(userId);

		return NextResponse.json(preferences || {
			userId,
			emailInvoices: true,
			emailExpenses: true,
			emailReports: true,
			emailAlerts: true,
			emailMarketing: false,
			pushRealtime: false,
			pushDaily: true,
			pushWeekly: false,
			inAppEnabled: true,
			inAppSound: true,
			inAppDesktop: false,
			slackEnabled: false,
			quietHoursEnabled: false,
			doNotDisturb: false,
			autoArchive: true,
			autoArchiveDays: 30,
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

export async function PUT(request: NextRequest) {
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
		const preferences = await NotificationService.updateUserPreferences(userId, body);

		return NextResponse.json(preferences);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
