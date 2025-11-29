/**
 * Notifications API Routes
 * GET - Fetch user notifications
 * POST - Create a new notification (admin only)
 */

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
import { isAdmin } from '@/lib/auth/financbase-rbac';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { checkDatabaseHealth } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     description: Retrieves a paginated list of notifications for the authenticated user with optional filtering
 *     tags:
 *       - Analytics
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of notifications to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *           minimum: 0
 *         description: Number of notifications to skip
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Return only unread notifications
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter notifications by type
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: notif_123
 *                       title:
 *                         type: string
 *                         example: Invoice Paid
 *                       message:
 *                         type: string
 *                         example: Invoice #123 has been paid
 *                       type:
 *                         type: string
 *                       read:
 *                         type: boolean
 *                         example: false
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 unreadCount:
 *                   type: integer
 *                   example: 5
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
	const requestId = generateRequestId();
	
	logger.debug('[API] GET /api/notifications - Request started', { requestId });
	
	try {
		// Check database connection health
		logger.debug('[API] Checking database health...', { requestId });
		const dbHealthy = await checkDatabaseHealth();
		if (!dbHealthy) {
			logger.error('[API] Database health check failed for GET /api/notifications', { requestId });
			return ApiErrorHandler.databaseError(
				new Error('Database connection unavailable'),
				requestId
			);
		}
		logger.debug('[API] Database health check passed', { requestId });

		const { userId } = await auth();

		if (!userId) {
			logger.warn('[API] Unauthorized request - no userId', { requestId });
			return ApiErrorHandler.unauthorized();
		}

		logger.debug('[API] Authenticated user', { requestId, userId });

		// Parse query parameters
		const searchParams = req.nextUrl.searchParams;
		const limit = parseInt(searchParams.get('limit') || '50', 10);
		const offset = parseInt(searchParams.get('offset') || '0', 10);
		const unreadOnly = searchParams.get('unreadOnly') === 'true';
		const type = searchParams.get('type') || undefined;

		logger.debug('[API] Query parameters parsed', { requestId, limit, offset, unreadOnly, type });

		// Validate query parameters
		if (isNaN(limit) || limit < 1 || limit > 100) {
			return ApiErrorHandler.badRequest('Invalid limit parameter (must be between 1 and 100)');
		}
		if (isNaN(offset) || offset < 0) {
			return ApiErrorHandler.badRequest('Invalid offset parameter (must be >= 0)');
		}

		// Fetch notifications with individual error handling
		let notifications: any[] = [];
		try {
			logger.debug('[API] Fetching notifications for user', { requestId, userId, filters: { limit, offset, unreadOnly, type } });
			const fetchedNotifications = await NotificationService.getForUser(userId, {
				limit,
				offset,
				unreadOnly,
				type,
			});
			notifications = Array.isArray(fetchedNotifications) ? fetchedNotifications : [];
			logger.debug('[API] Notifications fetched successfully', { requestId, count: notifications.length });
		} catch (error) {
			logger.error('[API] Error fetching notifications', {
				requestId,
				userId,
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			});
			throw error;
		}

		// Get unread count with individual error handling
		let unreadCount = 0;
		try {
			logger.debug('[API] Fetching unread count for user', { requestId, userId });
			unreadCount = await NotificationService.getUnreadCount(userId);
			logger.debug('[API] Unread count fetched successfully', { requestId, unreadCount });
		} catch (error) {
			logger.error('[API] Error fetching unread count', {
				requestId,
				userId,
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			});
			// Set default value if unread count fails, but don't fail the entire request
			unreadCount = 0;
		}

		const response = {
			notifications,
			unreadCount,
			pagination: {
				limit,
				offset,
				total: notifications.length,
			},
		};

		logger.info('[API] GET /api/notifications - Request completed successfully', { requestId, notificationCount: notifications.length, unreadCount });
		
		return NextResponse.json(response);
	} catch (error) {
		logger.error('[API] Error in GET /api/notifications', {
			requestId,
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
			errorType: error?.constructor?.name,
		});
		
		// Ensure error response is properly formatted
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
		logger.error('[API] Error in POST /api/notifications', {
			requestId,
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
		return ApiErrorHandler.handle(error, requestId);
	}
}

