import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/services/notification-service';

export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
		console.error('Error fetching notification preferences:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function PUT(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const preferences = await NotificationService.updateUserPreferences(userId, body);

		return NextResponse.json(preferences);
	} catch (error) {
		console.error('Error updating notification preferences:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
