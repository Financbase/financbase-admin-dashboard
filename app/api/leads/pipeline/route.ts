import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { LeadManagementService } from '@/lib/services/lead-management-service';

export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const pipeline = await LeadManagementService.getPipelineMetrics(userId);

		return NextResponse.json({ pipeline });
	} catch (error) {
		console.error('Error fetching pipeline metrics:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch pipeline metrics' },
			{ status: 500 }
		);
	}
}
