import { NextRequest, NextResponse } from 'next/server';
import { ZoomService } from '@/lib/services/integrations/zoom-service';
import { GoogleMeetService } from '@/lib/services/integrations/google-meet-service';

export async function POST(request: NextRequest) {
	try {
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

		return NextResponse.json({
			success: true,
			message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} integration connected successfully`,
			result,
		});

	} catch (error) {
		console.error('OAuth callback error:', error);
		return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
	}
}
