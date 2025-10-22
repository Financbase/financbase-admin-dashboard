/**
 * Invoice Service
 * Business logic for invoice management
 */

import { db } from '@/lib/db';
import { invoices, invoicePayments, type Invoice } from '@/lib/db/schema/invoices';
import { eq, and, desc, gte, lte, or } from 'drizzle-orm';
import { NotificationHelpers } from './notification-service';

interface CreateInvoiceInput {
	userId: string;
	clientId: string;
	amount: number;
	subtotal: number;
	total: number;
	currency?: string;
	taxRate?: number;
	taxAmount?: number;
	discountAmount?: number;
	issueDate: Date;
	dueDate: Date;
	notes?: string;
	terms?: string;
}

interface UpdateInvoiceInput extends Partial<CreateInvoiceInput> {
	id: string;
	status?: string;
}

/**
 * Generate unique invoice number
 */
async function generateInvoiceNumber(userId: string): Promise<string> {
	const year = new Date().getFullYear();
	const month = String(new Date().getMonth() + 1).padStart(2, '0');
	
	// Get last invoice number for this user
	const lastInvoice = await db.query.invoices.findFirst({
		where: eq(invoices.userId, userId),
		orderBy: [desc(invoices.createdAt)],
	});

	let sequence = 1;
	if (lastInvoice?.invoiceNumber) {
		const parts = lastInvoice.invoiceNumber.split('-');
		const lastPart = parts[parts.length - 1];
		const lastSequence = parseInt(lastPart || '0');
		sequence = lastSequence + 1;
	}

	return `INV-${year}${month}-${String(sequence).padStart(4, '0')}`;
}

/**
 * Calculate invoice totals
 */
function calculateTotals(
	items: CreateInvoiceInput['items'],
	taxRate: number = 0,
	discountAmount: number = 0
) {
	const subtotal = items.reduce((sum, item) => sum + item.total, 0);
	const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
	const total = subtotal - discountAmount + taxAmount;

	return {
		subtotal,
		taxAmount,
		total,
	};
}

/**
 * Create a new invoice
 */
export async function createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
	const invoiceNumber = await generateInvoiceNumber(input.userId);

	const [invoice] = await db.insert(invoices).values({
		userId: input.userId,
		invoiceNumber,
		clientId: input.clientId,
		amount: input.amount.toFixed(2),
		subtotal: input.subtotal.toFixed(2),
		total: input.total.toFixed(2),
		currency: input.currency || 'USD',
		taxRate: (input.taxRate || 0).toFixed(2),
		taxAmount: (input.taxAmount || 0).toFixed(2),
		discountAmount: (input.discountAmount || 0).toFixed(2),
		issueDate: input.issueDate,
		dueDate: input.dueDate,
		status: 'draft',
		notes: input.notes,
		terms: input.terms,
	}).returning();

	// Send notification
	await NotificationHelpers.invoice.created(
		input.userId,
		invoiceNumber,
		totals.total
	);

	return invoice;
}

/**
 * Get invoice by ID
 */
export async function getInvoiceById(id: string, userId: string): Promise<Invoice | null> {
	const invoice = await db.query.invoices.findFirst({
		where: and(
			eq(invoices.id, id),
			eq(invoices.userId, userId)
		),
	});

	return invoice || null;
}

/**
 * Get all invoices for a user
 */
export async function getInvoices(
	userId: string,
	options?: {
		status?: string;
		clientId?: number;
		startDate?: Date;
		endDate?: Date;
		limit?: number;
		offset?: number;
	}
) {
	const conditions = [eq(invoices.userId, userId)];

	if (options?.status) {
		conditions.push(eq(invoices.status, options.status));
	}

	if (options?.clientId) {
		conditions.push(eq(invoices.clientId, options.clientId));
	}

	if (options?.startDate) {
		conditions.push(gte(invoices.issueDate, options.startDate));
	}

	if (options?.endDate) {
		conditions.push(lte(invoices.issueDate, options.endDate));
	}

	const results = await db.query.invoices.findMany({
		where: and(...conditions),
		orderBy: [desc(invoices.createdAt)],
		limit: options?.limit || 50,
		offset: options?.offset || 0,
	});

	return results;
}

/**
 * Update invoice
 */
export async function updateInvoice(input: UpdateInvoiceInput): Promise<Invoice> {
	const { id, userId, ...updateData } = input;

	// Recalculate totals if items changed
	let totals: { subtotal: number; taxAmount: number; total: number } | undefined;
	if (updateData.items) {
		totals = calculateTotals(
			updateData.items,
			updateData.taxRate,
			updateData.discountAmount
		);
	}

	const [updated] = await db.update(invoices)
		.set({
			...updateData,
			...(totals && {
				subtotal: totals.subtotal.toFixed(2),
				taxAmount: totals.taxAmount.toFixed(2),
				total: totals.total.toFixed(2),
			}),
			updatedAt: new Date(),
		})
		.where(and(
			eq(invoices.id, id),
			eq(invoices.userId, userId || '')
		))
		.returning();

	return updated;
}

/**
 * Mark invoice as sent
 */
export async function markInvoiceAsSent(id: string, userId: string): Promise<Invoice> {
	const [updated] = await db.update(invoices)
		.set({
			status: 'sent',
			sentDate: new Date(),
			updatedAt: new Date(),
		})
		.where(and(
			eq(invoices.id, id),
			eq(invoices.userId, userId)
		))
		.returning();

	// TODO: Send invoice email to client

	return updated;
}

/**
 * Record payment for invoice
 */
export async function recordInvoicePayment(
	invoiceId: number,
	userId: string,
	amount: number,
	paymentMethod: string,
	paymentDate: Date,
	reference?: string
) {
	// Get current invoice
	const invoice = await getInvoiceById(invoiceId, userId);
	if (!invoice) {
		throw new Error('Invoice not found');
	}

	const currentPaid = parseFloat(invoice.amountPaid);
	const newPaid = currentPaid + amount;
	const total = parseFloat(invoice.total);

	// Record payment
	await db.insert(invoicePayments).values({
		invoiceId,
		userId,
		amount: amount.toFixed(2),
		currency: invoice.currency,
		paymentMethod,
		paymentDate,
		reference,
	});

	// Update invoice
	const newStatus = newPaid >= total ? 'paid' : 'partial';
	const [updated] = await db.update(invoices)
		.set({
			amountPaid: newPaid.toFixed(2),
			status: newStatus,
			paidDate: newPaid >= total ? paymentDate : null,
			updatedAt: new Date(),
		})
		.where(eq(invoices.id, invoiceId))
		.returning();

	// Send notification if fully paid
	if (newStatus === 'paid') {
		await NotificationHelpers.invoice.paid(userId, invoice.invoiceNumber, total);
	}

	return updated;
}

/**
 * Delete invoice
 */
export async function deleteInvoice(id: string, userId: string): Promise<void> {
	await db.delete(invoices)
		.where(and(
			eq(invoices.id, id),
			eq(invoices.userId, userId)
		));
}

/**
 * Get invoice statistics
 */
export async function getInvoiceStats(userId: string) {
	const allInvoices = await getInvoices(userId);

	const stats = {
		total: allInvoices.length,
		draft: 0,
		sent: 0,
		paid: 0,
		overdue: 0,
		totalAmount: 0,
		paidAmount: 0,
		outstandingAmount: 0,
	};

	const now = new Date();

	allInvoices.forEach((invoice) => {
		const total = parseFloat(invoice.total);
		const paid = parseFloat(invoice.amountPaid);

		stats.totalAmount += total;
		stats.paidAmount += paid;

		switch (invoice.status) {
			case 'draft':
				stats.draft++;
				break;
			case 'sent':
			case 'viewed':
				stats.sent++;
				stats.outstandingAmount += (total - paid);
				if (invoice.dueDate < now) {
					stats.overdue++;
				}
				break;
			case 'partial':
				stats.sent++;
				stats.outstandingAmount += (total - paid);
				if (invoice.dueDate < now) {
					stats.overdue++;
				}
				break;
			case 'paid':
				stats.paid++;
				break;
		}
	});

	return stats;
}

/**
 * Check for overdue invoices and send notifications
 */
export async function checkOverdueInvoices(userId: string): Promise<void> {
	const now = new Date();
	
	const overdueInvoices = await db.query.invoices.findMany({
		where: and(
			eq(invoices.userId, userId),
			or(
				eq(invoices.status, 'sent'),
				eq(invoices.status, 'partial')
			),
			lte(invoices.dueDate, now)
		),
	});

	for (const invoice of overdueInvoices) {
		// Update status
		await db.update(invoices)
			.set({ status: 'overdue', updatedAt: new Date() })
			.where(eq(invoices.id, invoice.id));

		// Send notification
		await NotificationHelpers.invoice.overdue(
			userId,
			invoice.invoiceNumber,
			parseFloat(invoice.total)
		);
	}
}

// Export all invoice service functions
export const InvoiceService = {
	create: createInvoice,
	getById: getInvoiceById,
	getAll: getInvoices,
	update: updateInvoice,
	markAsSent: markInvoiceAsSent,
	recordPayment: recordInvoicePayment,
	delete: deleteInvoice,
	getStats: getInvoiceStats,
	checkOverdue: checkOverdueInvoices,
};

