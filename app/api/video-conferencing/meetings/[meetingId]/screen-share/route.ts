import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { AdvancedVideoFeaturesService } from '@/lib/services/video-conferencing/advanced-features';

export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const meetingId = searchParams.get('meetingId');

		if (!meetingId) {
			return NextResponse.json({ error: 'Meeting ID required' }, { status: 400 });
		}

		// Mock screen share sessions
		const screenShareSessions = [
			{
				id: 'screen_1',
				meetingId,
				userId: 'user_123',
				userName: 'John Doe',
				isActive: true,
				screenType: 'screen',
				title: 'Presentation Slides',
				startedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
			},
		];

		return NextResponse.json(screenShareSessions);
	} catch (error) {
		console.error('Error fetching screen share sessions:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { meetingId, screenType, title } = body;

		if (!meetingId) {
			return NextResponse.json({ error: 'Meeting ID required' }, { status: 400 });
		}

		// Check permissions
		const hasPermission = await AdvancedVideoFeaturesService.checkFeaturePermission(
			meetingId,
			userId,
			'screen_share'
		);

		if (!hasPermission) {
			return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
		}

		// Start screen share
		const session = await AdvancedVideoFeaturesService.startScreenShare(meetingId, userId, {
			screenType: screenType || 'screen',
			title,
		});

		return NextResponse.json(session, { status: 201 });
	} catch (error) {
		console.error('Error starting screen share:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const sessionId = searchParams.get('sessionId');
		const meetingId = searchParams.get('meetingId');

		if (!sessionId || !meetingId) {
			return NextResponse.json({ error: 'Session ID and meeting ID required' }, { status: 400 });
		}

		// Stop screen share
		await AdvancedVideoFeaturesService.stopScreenShare(sessionId, meetingId);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error stopping screen share:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
