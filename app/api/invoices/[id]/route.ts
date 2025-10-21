/**
 * Invoice Detail API Route
 * Handles single invoice operations
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { InvoiceService } from '@/lib/services/invoice-service';

/**
 * GET /api/invoices/[id]
 * Fetch a single invoice
 */
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const id = parseInt(params.id);
		const invoice = await InvoiceService.getById(id, userId);

		if (!invoice) {
			return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
		}

		return NextResponse.json(invoice);
	} catch (error) {
		console.error('Error fetching invoice:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch invoice' },
			{ status: 500 }
		);
	}
}

/**
 * PUT /api/invoices/[id]
 * Update an invoice
 */
export async function PUT(
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

		const invoice = await InvoiceService.update({
			id,
			userId,
			...body,
			...(body.issueDate && { issueDate: new Date(body.issueDate) }),
			...(body.dueDate && { dueDate: new Date(body.dueDate) }),
		});

		return NextResponse.json(invoice);
	} catch (error) {
		console.error('Error updating invoice:', error);
		return NextResponse.json(
			{ error: 'Failed to update invoice' },
			{ status: 500 }
		);
	}
}

/**
 * DELETE /api/invoices/[id]
 * Delete an invoice
 */
export async function DELETE(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const id = parseInt(params.id);
		await InvoiceService.delete(id, userId);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting invoice:', error);
		return NextResponse.json(
			{ error: 'Failed to delete invoice' },
			{ status: 500 }
		);
	}
}

