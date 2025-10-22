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

		// Mock breakout rooms data
		const breakoutRooms = [
			{
				id: 'room_1',
				name: 'Discussion Group 1',
				participants: [
					{ id: '1', name: 'John Doe', email: 'john@company.com', role: 'participant' },
					{ id: '2', name: 'Jane Smith', email: 'jane@company.com', role: 'participant' },
				],
				maxParticipants: 5,
				isActive: true,
				createdAt: new Date().toISOString(),
			},
			{
				id: 'room_2',
				name: 'Discussion Group 2',
				participants: [
					{ id: '3', name: 'Mike Johnson', email: 'mike@company.com', role: 'participant' },
					{ id: '4', name: 'Sarah Wilson', email: 'sarah@company.com', role: 'participant' },
				],
				maxParticipants: 5,
				isActive: false,
				createdAt: new Date().toISOString(),
			},
		];

		return NextResponse.json(breakoutRooms);
	} catch (error) {
		console.error('Error fetching breakout rooms:', error);
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
		const { meetingId, name, participants, maxParticipants, duration } = body;

		if (!meetingId || !name) {
			return NextResponse.json({ error: 'Meeting ID and room name required' }, { status: 400 });
		}

		// Check permissions
		const hasPermission = await AdvancedVideoFeaturesService.checkFeaturePermission(
			meetingId,
			userId,
			'breakout_rooms'
		);

		if (!hasPermission) {
			return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
		}

		// Create breakout room
		const room = await AdvancedVideoFeaturesService.createBreakoutRoom(meetingId, {
			name,
			participants: participants || [],
			maxParticipants,
			duration,
		});

		return NextResponse.json(room, { status: 201 });
	} catch (error) {
		console.error('Error creating breakout room:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
