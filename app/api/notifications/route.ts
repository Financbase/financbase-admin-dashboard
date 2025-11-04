/**
 * Notifications API Routes
 * GET - Fetch user notifications
 * POST - Create a new notification (admin only)
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/services/notification-service';
import { isAdmin } from '@/lib/auth/financbase-rbac';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { checkDatabaseHealth } from '@/lib/db';

export async function GET(req: NextRequest) {
	const requestId = generateRequestId();
	try {
		// Check database connection health
		const dbHealthy = await checkDatabaseHealth();
		if (!dbHealthy) {
			console.error('[API] Database health check failed for GET /api/notifications');
			return ApiErrorHandler.databaseError(
				new Error('Database connection unavailable'),
				requestId
			);
		}

		const { userId } = await auth();

		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Parse query parameters
		const searchParams = req.nextUrl.searchParams;
		const limit = parseInt(searchParams.get('limit') || '50', 10);
		const offset = parseInt(searchParams.get('offset') || '0', 10);
		const unreadOnly = searchParams.get('unreadOnly') === 'true';
		const type = searchParams.get('type') || undefined;

		// Validate query parameters
		if (isNaN(limit) || limit < 1 || limit > 100) {
			return ApiErrorHandler.badRequest('Invalid limit parameter (must be between 1 and 100)');
		}
		if (isNaN(offset) || offset < 0) {
			return ApiErrorHandler.badRequest('Invalid offset parameter (must be >= 0)');
		}

		// Fetch notifications
		const notifications = await NotificationService.getForUser(userId, {
			limit,
			offset,
			unreadOnly,
			type,
		});

		// Get unread count
		const unreadCount = await NotificationService.getUnreadCount(userId);

		return NextResponse.json({
			notifications,
			unreadCount,
			pagination: {
				limit,
				offset,
				total: notifications.length,
			},
		});
	} catch (error) {
		console.error('[API] Error in GET /api/notifications:', {
			requestId,
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
		return ApiErrorHandler.handle(error, requestId);
	}
}

export async function POST(req: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();

		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Only admins can create notifications via API
		const userIsAdmin = await isAdmin();
		if (!userIsAdmin) {
			return ApiErrorHandler.forbidden('Admin access required');
		}

		let body;
		try {
			body = await req.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}

		// Validate required fields
		if (!body.userId || !body.type || !body.title || !body.message) {
			return ApiErrorHandler.badRequest('Missing required fields: userId, type, title, message');
		}

		// Create notification
		const notification = await NotificationService.create({
			userId: body.userId,
			type: body.type,
			category: body.category,
			priority: body.priority,
			title: body.title,
			message: body.message,
			data: body.data,
			actionUrl: body.actionUrl,
			actionLabel: body.actionLabel,
			expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
			metadata: body.metadata,
		});

		return NextResponse.json(notification, { status: 201 });
	} catch (error) {
		console.error('[API] Error in POST /api/notifications:', {
			requestId,
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
		return ApiErrorHandler.handle(error, requestId);
	}
}

