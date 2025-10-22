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

		// Mock integrations data
		const integrations = [
			{
				id: 1,
				provider: 'zoom',
				name: 'Zoom Business Account',
				isActive: ZoomService.hasIntegration(),
				isDefault: true,
				providerAccountId: 'zoom_user_123',
			},
			{
				id: 2,
				provider: 'google_meet',
				name: 'Google Workspace',
				isActive: GoogleMeetService.hasIntegration(),
				isDefault: false,
				providerAccountId: 'google_user_456',
			},
		];

		return NextResponse.json(integrations);
	} catch (error) {
		console.error('Error fetching integrations:', error);
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
		const { provider, code, clientId, clientSecret, redirectUri } = body;

		if (!provider || !code || !clientId || !redirectUri) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		let result: any = {};

		switch (provider) {
			case 'zoom':
				try {
					result = await ZoomService.authenticate(code, clientId, clientSecret, redirectUri);
				} catch (error) {
					console.error('Zoom authentication error:', error);
					return NextResponse.json({ error: 'Zoom authentication failed' }, { status: 400 });
				}
				break;

			case 'google_meet':
				try {
					result = await GoogleMeetService.authenticate(code, clientId, clientSecret, redirectUri);
				} catch (error) {
					console.error('Google authentication error:', error);
					return NextResponse.json({ error: 'Google authentication failed' }, { status: 400 });
				}
				break;

			default:
				return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
		}

		// Mock integration creation
		const newIntegration = {
			id: Date.now(),
			provider,
			name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Integration`,
			isActive: true,
			isDefault: false,
			providerAccountId: `provider_user_${Date.now()}`,
			createdAt: new Date().toISOString(),
		};

		return NextResponse.json(newIntegration, { status: 201 });
	} catch (error) {
		console.error('Error creating integration:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
