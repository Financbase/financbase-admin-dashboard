/**
 * Mark Notification as Read API Route
 * POST - Mark a notification as read
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/services/notification-service';

export async function POST(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const notificationId = parseInt(params.id);

		if (isNaN(notificationId)) {
			return NextResponse.json(
				{ error: 'Invalid notification ID' },
				{ status: 400 }
			);
		}

		// Mark as read
		const notification = await NotificationService.markAsRead(notificationId, userId);

		if (!notification) {
			return NextResponse.json(
				{ error: 'Notification not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json(notification);
	} catch (error) {
		console.error('Error marking notification as read:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

