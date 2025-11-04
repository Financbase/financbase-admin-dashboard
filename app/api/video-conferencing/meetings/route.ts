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
import { ZoomService } from '@/lib/services/integrations/zoom-service';
import { GoogleMeetService } from '@/lib/services/integrations/google-meet-service';

export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Mock meetings data
		const meetings = [
			{
				id: '1',
				title: 'Team Standup',
				description: 'Daily team sync meeting',
				scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
				duration: 30,
				provider: 'zoom',
				joinUrl: 'https://zoom.us/j/123456789',
				meetingId: '123-456-789',
				participants: [
					{ id: '1', name: 'John Doe', email: 'john@company.com', status: 'accepted' },
					{ id: '2', name: 'Jane Smith', email: 'jane@company.com', status: 'accepted' },
					{ id: '3', name: 'Mike Johnson', email: 'mike@company.com', status: 'tentative' },
				],
				status: 'scheduled',
				createdBy: userId,
			},
			{
				id: '2',
				title: 'Client Review - Q4 Planning',
				description: 'Quarterly business review with key client',
				scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
				duration: 60,
				provider: 'google_meet',
				joinUrl: 'https://meet.google.com/abc-defg-hij',
				meetingId: 'abc-defg-hij',
				participants: [
					{ id: '1', name: 'Sarah Wilson', email: 'sarah@client.com', status: 'accepted' },
					{ id: '2', name: 'Client Team', email: 'team@client.com', status: 'invited' },
				],
				status: 'scheduled',
				createdBy: userId,
			},
		];

		return NextResponse.json(meetings);
	} catch (error) {
		console.error('Error fetching meetings:', error);
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
		const {
			title,
			description,
			scheduledFor,
			duration,
			provider,
			attendees,
			timezone,
		} = body;

		if (!title || !scheduledFor || !provider) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		let meetingData: any = {};

		// Create meeting with selected provider
		switch (provider) {
			case 'zoom':
				if (!ZoomService.hasIntegration()) {
					return NextResponse.json({ error: 'Zoom integration not configured' }, { status: 400 });
				}

				try {
					const zoomMeeting = await ZoomService.createMeeting({
						topic: title,
						start_time: scheduledFor,
						duration,
						timezone: timezone || 'UTC',
						agenda: description,
						settings: {
							waiting_room: true,
							mute_upon_entry: true,
							auto_recording: 'none',
						},
					});

					meetingData = {
						providerMeetingId: zoomMeeting.id,
						joinUrl: zoomMeeting.join_url,
						meetingPassword: zoomMeeting.password,
						meetingId: zoomMeeting.id.toString(),
						providerData: zoomMeeting,
					};
				} catch (error) {
					console.error('Error creating Zoom meeting:', error);
					return NextResponse.json({ error: 'Failed to create Zoom meeting' }, { status: 500 });
				}
				break;

			case 'google_meet':
				if (!GoogleMeetService.hasIntegration()) {
					return NextResponse.json({ error: 'Google Meet integration not configured' }, { status: 400 });
				}

				try {
					const startTime = new Date(scheduledFor);
					const endTime = new Date(startTime.getTime() + duration * 60000);

					const googleMeeting = await GoogleMeetService.createMeeting({
						summary: title,
						description,
						startTime: startTime.toISOString(),
						endTime: endTime.toISOString(),
						timezone: timezone || 'UTC',
						attendees: attendees || [],
					});

					meetingData = {
						providerMeetingId: googleMeeting.id,
						joinUrl: googleMeeting.conferenceData?.entryPoints?.[0]?.uri || googleMeeting.hangoutLink,
						meetingId: googleMeeting.conferenceData?.conferenceId || googleMeeting.id,
						providerData: googleMeeting,
					};
				} catch (error) {
					console.error('Error creating Google Meet:', error);
					return NextResponse.json({ error: 'Failed to create Google Meet' }, { status: 500 });
				}
				break;

			default:
				return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
		}

		// Mock meeting creation response
		const newMeeting = {
			id: Date.now().toString(),
			...body,
			...meetingData,
			participants: attendees?.map((email: string, index: number) => ({
				id: (index + 1).toString(),
				name: email.split('@')[0],
				email,
				status: 'invited',
			})) || [],
			status: 'scheduled',
			createdBy: userId,
			createdAt: new Date().toISOString(),
		};

		return NextResponse.json(newMeeting, { status: 201 });
	} catch (error) {
		console.error('Error creating meeting:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
