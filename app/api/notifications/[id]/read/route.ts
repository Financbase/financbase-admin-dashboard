/**
 * Mark Notification as Read API Route
 * POST - Mark a notification as read
 */

import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { NotificationService } from '@/lib/services/notification-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function POST(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	const { id: idParam } = await params;
	try {
		const { userId } = await auth();

		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Convert string ID to integer (notification ID is serial type)
		const notificationId = parseInt(idParam, 10);
		if (Number.isNaN(notificationId)) {
			return ApiErrorHandler.badRequest('Invalid notification ID format');
		}

		// Mark as read
		const success = await NotificationService.markAsRead(notificationId, userId);

		if (!success) {
			return ApiErrorHandler.notFound('Notification not found or access denied');
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('[API] Error in POST /api/notifications/[id]/read:', {
			notificationId: idParam,
			requestId,
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
		return ApiErrorHandler.handle(error, requestId);
	}
}

