/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/services/notification-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	const { id } = await params;
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const notificationId = parseInt(id, 10);
		if (Number.isNaN(notificationId)) {
			return ApiErrorHandler.badRequest('Invalid notification ID format');
		}

		// Mark notification as read
		const success = await NotificationService.markAsRead(notificationId, userId);

		if (!success) {
			return ApiErrorHandler.notFound('Notification not found or access denied');
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		logger.error('[API] Error in POST /api/notifications/[id]:', {
			notificationId: id,
			requestId,
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
		return ApiErrorHandler.handle(error, requestId);
	}
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	const { id } = await params;
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const notificationId = parseInt(id, 10);
		if (Number.isNaN(notificationId)) {
			return ApiErrorHandler.badRequest('Invalid notification ID format');
		}

		// Delete notification (or mark as archived)
		const success = await NotificationService.delete(notificationId, userId);

		if (!success) {
			return ApiErrorHandler.notFound('Notification not found or access denied');
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		logger.error('[API] Error in DELETE /api/notifications/[id]:', {
			notificationId: id,
			requestId,
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
		return ApiErrorHandler.handle(error, requestId);
	}
}
