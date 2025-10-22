import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UnifiedDashboardService } from '@/lib/services/unified-dashboard-service';

export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const metrics = await UnifiedDashboardService.getUnifiedMetrics(userId);

		return NextResponse.json({ metrics });
	} catch (error) {
		console.error('Error fetching unified metrics:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch unified metrics' },
			{ status: 500 }
		);
	}
}
