/**
 * Report Run API Route
 * Executes a report and returns results
 */

import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ReportService } from '@/lib/services/report-service';

/**
 * POST /api/reports/[id]/run
 * Run a report and get results
 */
export async function POST(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id: idParam } = await params;
		const id = parseInt(idParam, 10);
		const history = await ReportService.run(id, userId);

		return NextResponse.json(history);
	} catch (error) {
		 
    // eslint-disable-next-line no-console
    console.error('Error running report:', error);
		return NextResponse.json(
			{ error: 'Failed to run report' },
			{ status: 500 }
		);
	}
}

