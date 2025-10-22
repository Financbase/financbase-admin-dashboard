import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { LeadManagementService } from '@/lib/services/lead-management-service';

export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const stats = await LeadManagementService.getLeadStats(userId);

		return NextResponse.json({ stats });
	} catch (error) {
		console.error('Error fetching lead stats:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch lead stats' },
			{ status: 500 }
		);
	}
}
