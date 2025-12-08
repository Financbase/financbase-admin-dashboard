/**
 * Client Service
 * Business logic for client management
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { db } from '@/lib/db';
import { clients, type Client } from '@/lib/db/schemas/clients.schema';
import { invoices } from '@/lib/db/schemas/invoices.schema';
import { eq, and, desc, ilike, or, sql } from 'drizzle-orm';
import { NotificationHelpers } from './notification-service';

interface CreateClientInput {
	userId: string;
	companyName: string;
	contactName?: string;
	email: string;
	phone?: string;
	address?: string;
	city?: string;
	state?: string;
	zipCode?: string;
	country?: string;
	taxId?: string;
	currency?: string;
	paymentTerms?: string;
	notes?: string;
	metadata?: Record<string, unknown>;
}

interface UpdateClientInput extends Partial<CreateClientInput> {
	id: number;
	isActive?: boolean;
}

interface ClientStats {
	totalClients: number;
	activeClients: number;
	totalRevenue: number;
	averageInvoiceValue: number;
	topClients: Array<{
		id: string;
		companyName: string;
		totalInvoices: number;
		totalAmount: number;
	}>;
}

/**
 * Create a new client
 */
export async function createClient(input: CreateClientInput): Promise<Client> {
	const [client] = await db.insert(clients).values({
		userId: input.userId,
		name: input.contactName || input.companyName || '',
		company: input.companyName,
		email: input.email,
		phone: input.phone,
		address: input.address,
		city: input.city,
		state: input.state,
		zipCode: input.zipCode,
		country: input.country || 'US',
		taxId: input.taxId,
		currency: input.currency || 'USD',
		paymentTerms: input.paymentTerms || 'net30',
		notes: input.notes,
	}).returning();

	// Send notification
	await NotificationHelpers.client.created(
		input.userId,
		client.id.toString()
	);

	return client;
}

/**
 * Get client by ID
 */
export async function getClientById(id: string, userId: string): Promise<Client | null> {
	const client = await db.query.clients.findFirst({
		where: and(
			eq(clients.id, parseInt(id, 10)),
			eq(clients.userId, userId)
		),
	});

	return client || null;
}

/**
 * Get all clients for a user
 */
export async function getClients(
	userId: string,
	options?: {
		search?: string;
		isActive?: boolean;
		limit?: number;
		offset?: number;
	}
) {
	const conditions = [eq(clients.userId, userId)];

	if (options?.search) {
		const searchCondition = or(
			sql`COALESCE(${clients.company}, '') ILIKE ${`%${options.search}%`}`,
			sql`COALESCE(${clients.name}, '') ILIKE ${`%${options.search}%`}`,
			ilike(clients.email, `%${options.search}%`)
		);
		if (searchCondition) {
			conditions.push(searchCondition);
		}
	}

	if (options?.isActive !== undefined) {
		conditions.push(eq(clients.status, options.isActive ? 'active' : 'inactive'));
	}

	const results = await db.query.clients.findMany({
		where: and(...conditions),
		orderBy: [desc(clients.createdAt)],
		limit: options?.limit || 50,
		offset: options?.offset || 0,
	});

	return results;
}

/**
 * Update client
 */
export async function updateClient(input: UpdateClientInput): Promise<Client> {
	const { id, userId, companyName, contactName, isActive, ...updateData } = input;

	const updateFields: any = {
		...updateData,
		updatedAt: new Date(),
	};

	// Map companyName to company field
	if (companyName !== undefined) {
		updateFields.company = companyName;
	}

	// Map contactName to name field
	if (contactName !== undefined) {
		updateFields.name = contactName;
	}

	// Map isActive to status field
	if (isActive !== undefined) {
		updateFields.status = isActive ? 'active' : 'inactive';
	}

	const [updated] = await db.update(clients)
		.set(updateFields)
		.where(and(
			eq(clients.id, typeof id === 'string' ? parseInt(id, 10) : id),
			eq(clients.userId, userId || '')
		))
		.returning();

	return updated;
}

/**
 * Delete client
 */
export async function deleteClient(id: string, userId: string): Promise<void> {
	await db.delete(clients)
		.where(and(
			eq(clients.id, parseInt(id, 10)),
			eq(clients.userId, userId)
		));
}

/**
 * Get client statistics
 */
export async function getClientStats(userId: string): Promise<ClientStats> {
	// Get total clients
	const totalClients = await db
		.select({ count: sql<number>`count(*)` })
		.from(clients)
		.where(eq(clients.userId, userId));

	// Get active clients
	const activeClients = await db
		.select({ count: sql<number>`count(*)` })
		.from(clients)
		.where(and(
			eq(clients.userId, userId),
			eq(clients.status, 'active')
		));

	// Get revenue data from invoices
	const revenueData = await db
		.select({
			clientId: invoices.clientId,
			clientName: invoices.clientName,
			totalAmount: sql<number>`sum(${invoices.total}::numeric)`,
			invoiceCount: sql<number>`count(*)`,
		})
		.from(invoices)
		.where(and(
			eq(invoices.userId, userId),
			eq(invoices.status, 'paid')
		))
		.groupBy(invoices.clientId, invoices.clientName);

	const totalRevenue = revenueData.reduce((sum, row) => sum + Number(row.totalAmount), 0);
	const averageInvoiceValue = revenueData.length > 0 
		? totalRevenue / revenueData.reduce((sum, row) => sum + Number(row.invoiceCount), 0)
		: 0;

	// Get top clients
	const topClients = revenueData
		.sort((a, b) => Number(b.totalAmount) - Number(a.totalAmount))
		.slice(0, 5)
		.map(row => ({
			id: String(row.clientId || ''),
			companyName: row.clientName || '',
			totalInvoices: Number(row.invoiceCount),
			totalAmount: Number(row.totalAmount),
		}));

	return {
		totalClients: totalClients[0]?.count || 0,
		activeClients: activeClients[0]?.count || 0,
		totalRevenue,
		averageInvoiceValue,
		topClients,
	};
}

/**
 * Search clients
 */
export async function searchClients(
	userId: string,
	query: string,
	limit: number = 10
): Promise<Client[]> {
	const results = await db.query.clients.findMany({
		where: and(
			eq(clients.userId, userId),
			or(
				ilike(clients.company, `%${query}%`),
				ilike(clients.name, `%${query}%`),
				ilike(clients.email, `%${query}%`)
			)
		),
		orderBy: [desc(clients.createdAt)],
		limit,
	});

	return results;
}

/**
 * Get client invoice history
 */
export async function getClientInvoiceHistory(
	clientId: string,
	userId: string,
	limit: number = 10
) {
	const clientInvoices = await db.query.invoices.findMany({
		where: and(
			eq(invoices.clientId, typeof clientId === 'string' ? parseInt(clientId, 10) : clientId),
			eq(invoices.userId, userId)
		),
		orderBy: [desc(invoices.createdAt)],
		limit,
	});

	return clientInvoices;
}

/**
 * Toggle client active status
 */
export async function toggleClientStatus(
	id: string,
	userId: string,
	isActive: boolean
): Promise<Client> {
	const [updated] = await db.update(clients)
		.set({
			status: isActive ? 'active' : 'inactive',
			updatedAt: new Date(),
		})
		.where(and(
			eq(clients.id, typeof id === 'string' ? parseInt(id, 10) : id),
			eq(clients.userId, userId)
		))
		.returning();

	return updated;
}

// Export all client service functions
export const ClientService = {
	create: createClient,
	getById: getClientById,
	getAll: getClients,
	update: updateClient,
	delete: deleteClient,
	getStats: getClientStats,
	search: searchClients,
	getInvoiceHistory: getClientInvoiceHistory,
	toggleStatus: toggleClientStatus,
};
