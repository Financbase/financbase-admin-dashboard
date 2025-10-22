import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { FreelanceHubService } from '@/lib/services/freelance-hub-service';

export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const stats = await FreelanceHubService.getTimeTrackingStats(userId);

		return NextResponse.json({ stats });
	} catch (error) {
		console.error('Error fetching time tracking stats:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch time tracking stats' },
			{ status: 500 }
		);
	}
}
