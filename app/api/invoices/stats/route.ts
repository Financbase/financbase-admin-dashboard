/**
 * Invoice Statistics API Route
 * Returns invoice statistics for the user
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { InvoiceService } from '@/lib/services/invoice-service';

/**
 * GET /api/invoices/stats
 * Get invoice statistics
 */
export async function GET() {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const stats = await InvoiceService.getStats(userId);

		return NextResponse.json(stats);
	} catch (error) {
		console.error('Error fetching invoice stats:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch invoice statistics' },
			{ status: 500 }
		);
	}
}

