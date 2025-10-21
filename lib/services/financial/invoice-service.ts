import { getDbOrThrow } from "@/lib/db";
import {
	type Invoice,
	type InvoiceLineItem,
	type NewInvoiceLineItem,
	invoiceLineItems,
	invoices,
} from "@/lib/db/schema";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { Filter, Trash2 } from "lucide-react";

export interface CreateInvoiceInput {
	userId: string;
	clientId: string;
	issueDate?: Date;
	dueDate: Date;
	lineItems: Array<{
		description: string;
		quantity: number;
		unitPrice: number;
		taxable?: boolean;
	}>;
	taxRate?: number;
	discountAmount?: number;
	currency?: string;
	notes?: string;
	terms?: string;
}

export interface InvoiceWithLineItems extends Invoice {
	lineItems: InvoiceLineItem[];
}

async function generateInvoiceNumber(userId: string): Promise<string> {
	const year = new Date().getFullYear();
	const prefix = `INV-${year}`;

	const _db = getDbOrThrow();
	const lastInvoice = await _db
		.select({ invoiceNumber: invoices.invoiceNumber })
		.from(invoices)
		.where(
			and(
				eq(invoices.userId, userId),
				sql`${invoices.invoiceNumber} LIKE ${prefix}%`,
			),
		)
		.orderBy(desc(invoices.invoiceNumber))
		.limit(1);

	if (lastInvoice.length === 0) return `${prefix}-0001`;

	const lastInv = lastInvoice[0];
	const lastNumber = lastInv?.invoiceNumber?.split("-").pop() || "0000";
	const nextNumber = (Number.parseInt(lastNumber) + 1)
		.toString()
		.padStart(4, "0");
	return `${prefix}-${nextNumber}`;
}

function calculateInvoiceTotals(
	lineItems: Array<{ quantity: number; unitPrice: number; taxable?: boolean }>,
	taxRate: number,
	discountAmount: number,
) {
	const subtotal = lineItems.reduce(
		(sum, item) => sum + item.quantity * item.unitPrice,
		0,
	);
	const taxableAmount = lineItems
		.filter((item) => item.taxable !== false)
		.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
	const taxAmount = (taxableAmount * taxRate) / 100;
	const total = subtotal + taxAmount - discountAmount;
	return {
		subtotal: subtotal.toFixed(2),
		taxAmount: taxAmount.toFixed(2),
		total: total.toFixed(2),
	};
}

export async function createInvoice(
	input: CreateInvoiceInput,
): Promise<InvoiceWithLineItems> {
	const invoiceNumber = await generateInvoiceNumber(input.userId);
	const taxRate = input.taxRate || 0;
	const discountAmount = input.discountAmount || 0;
	const { subtotal, taxAmount, total } = calculateInvoiceTotals(
		input.lineItems,
		taxRate,
		discountAmount,
	);

	const _db = getDbOrThrow();
	const [invoice] = await _db
		.insert(invoices)
		.values({
			invoiceNumber,
			userId: input.userId,
			clientId: input.clientId,
			status: "draft",
			issueDate: input.issueDate || new Date(),
			dueDate: input.dueDate,
			subtotal,
			taxRate: taxRate.toString(),
			taxAmount,
			discountAmount: discountAmount.toString(),
			total,
			currency: input.currency || "USD",
			notes: input.notes,
			terms: input.terms,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.returning();

	if (!invoice) throw new Error("Failed to create invoice");

	const invoiceIdVal = (invoice as Invoice).id;

	const lineItemsData: NewInvoiceLineItem[] = input.lineItems.map((item) => ({
		invoiceId: invoiceIdVal,
		description: item.description,
		quantity: item.quantity.toString(),
		unitPrice: item.unitPrice.toString(),
		amount: (item.quantity * item.unitPrice).toString(),
		taxable: item.taxable !== false,
		createdAt: new Date(),
	}));

	const createdLineItems = await _db
		.insert(invoiceLineItems)
		.values(lineItemsData)
		.returning();

	return {
		...(invoice as Invoice),
		lineItems: createdLineItems,
	};
}

export async function getInvoiceById(
	invoiceId: string,
	userId: string,
): Promise<InvoiceWithLineItems | null> {
	const _db = getDbOrThrow();
	const [invoice] = await _db
		.select()
		.from(invoices)
		.where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)))
		.limit(1);

	if (!invoice) return null;

	const lineItems = await _db
		.select()
		.from(invoiceLineItems)
		.where(eq(invoiceLineItems.invoiceId, invoiceId));

	return {
		...(invoice as Invoice),
		lineItems,
	};
}

export async function listInvoices(params: {
	userId: string;
	page?: number;
	limit?: number;
	status?: Invoice["status"];
	clientId?: string;
	startDate?: Date;
	endDate?: Date;
}): Promise<{ invoices: Invoice[]; total: number }> {
	const page = params.page || 1;
	const limit = params.limit || 20;
	const offset = (page - 1) * limit;
	const conditions = [eq(invoices.userId, params.userId)];

	if (params.status) conditions.push(eq(invoices.status, params.status));
	if (params.clientId) conditions.push(eq(invoices.clientId, params.clientId));
	if (params.startDate)
		conditions.push(gte(invoices.issueDate, params.startDate));
	if (params.endDate) conditions.push(lte(invoices.issueDate, params.endDate));

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
	const _db = getDbOrThrow();

	let qData: any = _db.select().from(invoices);
	if (whereClause) qData = qData.where(whereClause);
	qData = qData.orderBy(desc(invoices.issueDate)).limit(limit).offset(offset);

	let qCount: any = _db.select({ count: sql<number>`count(*)` }).from(invoices);
	if (whereClause) qCount = qCount.where(whereClause);

	const [data, countResult] = await Promise.all([qData, qCount]);

	return {
		invoices: data,
		total: Number(countResult[0]?.count || 0),
	};
}

export async function updateInvoiceStatus(
	invoiceId: string,
	userId: string,
	status: Invoice["status"],
	paidDate?: Date,
): Promise<Invoice | null> {
	const _db = getDbOrThrow();
	const [updated] = await _db
		.update(invoices)
		.set({
			status,
			paidDate: status === "paid" ? paidDate || new Date() : undefined,
			updatedAt: new Date(),
		})
		.where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)))
		.returning();

	return (updated as Invoice) || null;
}

export async function sendInvoice(
	invoiceId: string,
	userId: string,
): Promise<Invoice | null> {
	const _db = getDbOrThrow();
	const [updated] = await _db
		.update(invoices)
		.set({
			status: "sent",
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(invoices.id, invoiceId),
				eq(invoices.userId, userId),
				eq(invoices.status, "draft"),
			),
		)
		.returning();

	return (updated as Invoice) || null;
}

export async function deleteInvoice(
	invoiceId: string,
	userId: string,
): Promise<boolean> {
	const _db = getDbOrThrow();
	const result = await _db
		.delete(invoices)
		.where(
			and(
				eq(invoices.id, invoiceId),
				eq(invoices.userId, userId),
				eq(invoices.status, "draft"),
			),
		)
		.returning();

	return result.length > 0;
}

export async function getInvoiceStats(
	userId: string,
	period?: "month" | "year",
) {
	const now = new Date();
	const startDate = new Date();

	if (period === "month") startDate.setMonth(now.getMonth() - 1);
	else if (period === "year") startDate.setFullYear(now.getFullYear() - 1);

	const conditions = [eq(invoices.userId, userId)];
	if (period) conditions.push(gte(invoices.issueDate, startDate));

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
	const _db = getDbOrThrow();

	let qStats: any = _db
		.select({
			status: invoices.status,
			count: sql<number>`count(*)`,
			total: sql<number>`sum(CAST(${invoices.total} AS DECIMAL))`,
		})
		.from(invoices);
	if (whereClause) qStats = qStats.where(whereClause);
	const stats = await qStats.groupBy(invoices.status);

	return stats;
}
