import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { BYOKService } from '@/lib/services/byok-service';

/**
 * GET /api/byok/preferences
 * Get user's AI preferences
 */
export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const byokService = new BYOKService();
		const preferences = await byokService.getUserAiPreferences(userId);

		return NextResponse.json({ preferences });

	} catch (error) {
		console.error('Error fetching AI preferences:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch AI preferences' },
			{ status: 500 }
		);
	}
}

/**
 * PUT /api/byok/preferences
 * Update user's AI preferences
 */
export async function PUT(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { preferences } = body;

		if (!preferences) {
			return NextResponse.json(
				{ error: 'Preferences object is required' },
				{ status: 400 }
			);
		}

		const byokService = new BYOKService();
		await byokService.updateUserAiPreferences(userId, preferences);

		return NextResponse.json({
			success: true,
			message: 'AI preferences updated successfully'
		});

	} catch (error) {
		console.error('Error updating AI preferences:', error);
		return NextResponse.json(
			{ error: 'Failed to update AI preferences' },
			{ status: 500 }
		);
	}
}
