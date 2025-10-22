import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ClientService } from '@/lib/services/client-service';

export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const stats = await ClientService.getStats(userId);

		return NextResponse.json({ stats });
	} catch (error) {
		console.error('Error fetching client stats:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch client statistics' },
			{ status: 500 }
		);
	}
}
