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

		// Mock polls data
		const polls = [
			{
				id: 'poll_1',
				question: 'What is your preferred meeting time for next week?',
				options: [
					{ id: 'option_1', text: '9:00 AM', votes: 3 },
					{ id: 'option_2', text: '2:00 PM', votes: 5 },
					{ id: 'option_3', text: '5:00 PM', votes: 2 },
				],
				isAnonymous: false,
				allowMultiple: false,
				isActive: true,
				createdBy: userId,
				createdAt: new Date().toISOString(),
				results: [],
			},
			{
				id: 'poll_2',
				question: 'Which features should we prioritize?',
				options: [
					{ id: 'option_1', text: 'Mobile App', votes: 7 },
					{ id: 'option_2', text: 'Advanced Reports', votes: 4 },
					{ id: 'option_3', text: 'API Integration', votes: 6 },
					{ id: 'option_4', text: 'Custom Workflows', votes: 8 },
				],
				isAnonymous: true,
				allowMultiple: true,
				isActive: true,
				createdBy: userId,
				createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
				results: [],
			},
		];

		return NextResponse.json(polls);
	} catch (error) {
		// eslint-disable-next-line no-console
    console.error('Error fetching polls:', error);
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
		const { meetingId, question, options, isAnonymous, allowMultiple } = body;

		if (!meetingId || !question || !options || options.length < 2) {
			return NextResponse.json({ error: 'Meeting ID, question, and at least 2 options required' }, { status: 400 });
		}

		// Check permissions
		const hasPermission = await AdvancedVideoFeaturesService.checkFeaturePermission(
			meetingId,
			userId,
			'polls'
		);

		if (!hasPermission) {
			return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
		}

		// Create poll
		const poll = await AdvancedVideoFeaturesService.createPoll(meetingId, {
			question,
			options,
			isAnonymous: isAnonymous || false,
			allowMultiple: allowMultiple || false,
		});

		return NextResponse.json(poll, { status: 201 });
	} catch (error) {
		// eslint-disable-next-line no-console
    console.error('Error creating poll:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
