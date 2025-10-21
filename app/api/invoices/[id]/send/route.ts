/**
 * Invoice Send API Route
 * Marks invoice as sent and triggers email
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { InvoiceService } from '@/lib/services/invoice-service';

/**
 * POST /api/invoices/[id]/send
 * Mark invoice as sent
 */
export async function POST(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const id = parseInt(params.id);
		const invoice = await InvoiceService.markAsSent(id, userId);

		return NextResponse.json(invoice);
	} catch (error) {
		console.error('Error sending invoice:', error);
		return NextResponse.json(
			{ error: 'Failed to send invoice' },
			{ status: 500 }
		);
	}
}

