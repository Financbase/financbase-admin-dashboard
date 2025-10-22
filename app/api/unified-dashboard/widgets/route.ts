import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UnifiedDashboardService } from '@/lib/services/unified-dashboard-service';

export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const widgetType = searchParams.get('type');

		if (!widgetType) {
			return NextResponse.json(
				{ error: 'Widget type is required' },
				{ status: 400 }
			);
		}

		const widgetData = await UnifiedDashboardService.getWidgetData(userId, widgetType);

		return NextResponse.json({ data: widgetData });
	} catch (error) {
		console.error('Error fetching widget data:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch widget data' },
			{ status: 500 }
		);
	}
}
