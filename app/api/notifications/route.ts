/**
 * Notifications API Routes
 * GET - Fetch user notifications
 * POST - Create a new notification (admin only)
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/services/notification-service';
import { isAdmin } from '@/lib/auth/financbase-rbac';

export async function GET(req: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		// Parse query parameters
		const searchParams = req.nextUrl.searchParams;
		const limit = parseInt(searchParams.get('limit') || '50');
		const offset = parseInt(searchParams.get('offset') || '0');
		const unreadOnly = searchParams.get('unreadOnly') === 'true';
		const type = searchParams.get('type') || undefined;

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
		console.error('Error fetching notifications:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		// Only admins can create notifications via API
		const userIsAdmin = await isAdmin();
		if (!userIsAdmin) {
			return NextResponse.json(
				{ error: 'Forbidden: Admin access required' },
				{ status: 403 }
			);
		}

		const body = await req.json();

		// Validate required fields
		if (!body.userId || !body.type || !body.title || !body.message) {
			return NextResponse.json(
				{ error: 'Missing required fields: userId, type, title, message' },
				{ status: 400 }
			);
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
		console.error('Error creating notification:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

