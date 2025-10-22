import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { FreelanceHubService } from '@/lib/services/freelance-hub-service';

export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const timeEntry = await FreelanceHubService.stopTimeTracking(params.id, userId);

		return NextResponse.json({ timeEntry });
	} catch (error) {
		console.error('Error stopping time tracking:', error);
		return NextResponse.json(
			{ error: 'Failed to stop time tracking' },
			{ status: 500 }
		);
	}
}
