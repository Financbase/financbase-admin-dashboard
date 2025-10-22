/**
 * Invoices API Route
 * Handles invoice CRUD operations
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { InvoiceService } from '@/lib/services/invoice-service';
import { db } from '@/lib/db';
import { clients } from '@/lib/db/schema/clients';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/invoices
 * Fetch all invoices for the authenticated user
 */
export async function GET(req: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Parse query parameters
		const searchParams = req.nextUrl.searchParams;
		const status = searchParams.get('status') || undefined;
		const clientId = searchParams.get('clientId') ? parseInt(searchParams.get('clientId')!) : undefined;
		const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
		const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

		const invoices = await InvoiceService.getAll(userId, {
			status,
			clientId,
			limit,
			offset,
		});

		return NextResponse.json(invoices);
	} catch (error) {
		console.error('Error fetching invoices:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch invoices' },
			{ status: 500 }
		);
	}
}

/**
 * POST /api/invoices
 * Create a new invoice
 */
export async function POST(req: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await req.json();

		// Validate required fields
		if (!body.clientName || !body.clientEmail || !body.items || !body.issueDate || !body.dueDate) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		// Calculate totals from items
		const subtotal = body.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
		const taxAmount = (subtotal - (body.discountAmount || 0)) * ((body.taxRate || 0) / 100);
		const total = subtotal - (body.discountAmount || 0) + taxAmount;

		// Create or find client
		const clientId = await createOrFindClient(userId, {
			companyName: body.clientName,
			email: body.clientEmail,
			phone: body.clientPhone,
			address: body.clientAddress,
		});

		const invoice = await InvoiceService.create({
			userId,
			clientId,
			amount: total,
			subtotal,
			total,
			currency: body.currency || 'USD',
			taxRate: body.taxRate || 0,
			taxAmount,
			discountAmount: body.discountAmount || 0,
			issueDate: new Date(body.issueDate),
			dueDate: new Date(body.dueDate),
			notes: body.notes,
			terms: body.terms,
		});

		return NextResponse.json(invoice, { status: 201 });
	} catch (error) {
		console.error('Error creating invoice:', error);
		return NextResponse.json(
			{ error: 'Failed to create invoice' },
			{ status: 500 }
		);
	}
}

/**
 * Create or find a client by email
 */
async function createOrFindClient(userId: string, clientData: {
	companyName: string;
	email: string;
	phone?: string;
	address?: string;
}): Promise<string> {
	// Try to find existing client by email
	const existingClient = await db.query.clients.findFirst({
		where: and(
			eq(clients.userId, userId),
			eq(clients.email, clientData.email)
		),
	});

	if (existingClient) {
		return existingClient.id;
	}

	// Create new client
	const [newClient] = await db.insert(clients).values({
		userId,
		companyName: clientData.companyName,
		email: clientData.email,
		phone: clientData.phone,
		address: clientData.address,
	}).returning();

	return newClient.id;
}

