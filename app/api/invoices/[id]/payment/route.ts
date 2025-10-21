/**
 * Invoice Payment API Route
 * Records payment for an invoice
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { InvoiceService } from '@/lib/services/invoice-service';

/**
 * POST /api/invoices/[id]/payment
 * Record a payment for an invoice
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
		const body = await req.json();

		// Validate required fields
		if (!body.amount || !body.paymentMethod || !body.paymentDate) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		const invoice = await InvoiceService.recordPayment(
			id,
			userId,
			parseFloat(body.amount),
			body.paymentMethod,
			new Date(body.paymentDate),
			body.reference
		);

		return NextResponse.json(invoice);
	} catch (error) {
		console.error('Error recording payment:', error);
		return NextResponse.json(
			{ error: 'Failed to record payment' },
			{ status: 500 }
		);
	}
}

