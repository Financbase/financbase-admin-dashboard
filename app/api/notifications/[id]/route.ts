import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/services/notification-service';

export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const notificationId = parseInt(params.id);
		if (isNaN(notificationId)) {
			return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 });
		}

		// Mark notification as read
		const success = await NotificationService.markAsRead(notificationId, userId);

		if (!success) {
			return NextResponse.json({ error: 'Notification not found or access denied' }, { status: 404 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error marking notification as read:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const notificationId = parseInt(params.id);
		if (isNaN(notificationId)) {
			return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 });
		}

		// Delete notification (or mark as archived)
		const success = await NotificationService.delete(notificationId, userId);

		if (!success) {
			return NextResponse.json({ error: 'Notification not found or access denied' }, { status: 404 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting notification:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
