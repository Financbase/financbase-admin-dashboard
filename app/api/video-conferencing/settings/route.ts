import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { ZoomService } from '@/lib/services/integrations/zoom-service';
import { GoogleMeetService } from '@/lib/services/integrations/google-meet-service';

export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Mock settings data
		const settings = {
			defaultProvider: 'zoom',
			defaultDuration: 60,
			autoRecording: false,
			waitingRoom: true,
			muteOnEntry: true,
			timezone: 'UTC',
			emailReminders: true,
			reminderMinutes: [15, 5],
		};

		return NextResponse.json(settings);
	} catch (error) {
		console.error('Error fetching video settings:', error);
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
		const updates = body;

		// In a real implementation, you'd update the database
		// For now, return success with updated settings
		const updatedSettings = {
			defaultProvider: 'zoom',
			defaultDuration: 60,
			autoRecording: false,
			waitingRoom: true,
			muteOnEntry: true,
			timezone: 'UTC',
			emailReminders: true,
			reminderMinutes: [15, 5],
			...updates,
		};

		return NextResponse.json(updatedSettings);
	} catch (error) {
		console.error('Error updating video settings:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
