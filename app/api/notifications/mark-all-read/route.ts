/**
 * Mark All Notifications as Read API Route
 * POST - Mark all notifications as read for the current user
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { NotificationService } from '@/lib/services/notification-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function POST() {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();

		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Mark all as read
		const success = await NotificationService.markAllAsRead(userId);

		if (!success) {
			// This is not necessarily an error - user might not have any unread notifications
			return NextResponse.json({ success: true, message: 'No unread notifications to mark' });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('[API] Error in POST /api/notifications/mark-all-read:', {
			requestId,
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
		return ApiErrorHandler.handle(error, requestId);
	}
}

