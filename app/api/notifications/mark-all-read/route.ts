/**
 * Mark All Notifications as Read API Route
 * POST - Mark all notifications as read for the current user
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { NotificationService } from '@/lib/services/notification-service';

export async function POST() {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		// Mark all as read
		await NotificationService.markAllAsRead(userId);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error marking all notifications as read:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

