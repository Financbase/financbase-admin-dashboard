/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from "@/lib/db";
import { clients } from "@/lib/db/schemas";
import { eq, and, desc, ilike, or, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export interface CreateCustomerInput {
	name: string;
	email: string;
	phone?: string;
	company?: string;
	address?: string;
	city?: string;
	state?: string;
	zipCode?: string;
	country?: string;
	taxId?: string;
	currency?: string;
	paymentTerms?: string;
	status?: "active" | "inactive" | "suspended";
	notes?: string;
	tags?: string[];
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {
	id: number;
}

export interface CustomerFilters {
	search?: string;
	status?: string;
	company?: string;
	tags?: string[];
}

export interface CustomerSegment {
	id: string;
	name: string;
	description?: string;
	criteria: Record<string, any>;
	count: number;
}

export interface CustomerAnalytics {
	totalCustomers: number;
	activeCustomers: number;
	inactiveCustomers: number;
	suspendedCustomers: number;
	totalInvoiced: number;
	totalPaid: number;
	outstandingBalance: number;
	averageOrderValue: number;
	customerLifetimeValue: number;
	segmentBreakdown: Array<{
		segment: string;
		count: number;
		totalValue: number;
	}>;
	growthTrend: Array<{
		month: string;
		newCustomers: number;
		churnedCustomers: number;
	}>;
}

/**
 * Customers Service - Handles all customer-related operations
 * Uses the clients schema for customer management
 */
export class CustomersService {
	/**
	 * Get all customers for the authenticated user
	 */
	async getAll(filters?: CustomerFilters) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		let query = db.select().from(clients).where(eq(clients.userId, userId));

		if (filters) {
			if (filters.search) {
				query = query.where(
					and(
						eq(clients.userId, userId),
						or(
							ilike(clients.name, `%${filters.search}%`),
							ilike(clients.email, `%${filters.search}%`),
							ilike(clients.company || sql`''`, `%${filters.search}%`)
						)
					)
				);
			}

			if (filters.status) {
				query = query.where(
					and(eq(clients.userId, userId), eq(clients.status, filters.status as any))
				);
			}
		}

		const results = await query.orderBy(desc(clients.createdAt));
		return results;
	}

	/**
	 * Get customer by ID
	 */
	async getById(id: number) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const result = await db
			.select()
			.from(clients)
			.where(and(eq(clients.id, id), eq(clients.userId, userId)))
			.limit(1);

		if (result.length === 0) {
			throw new Error("Customer not found");
		}

		return result[0];
	}

	/**
	 * Create a new customer
	 */
	async create(input: CreateCustomerInput) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const newCustomer = {
			userId,
			name: input.name,
			email: input.email,
			phone: input.phone,
			company: input.company,
			address: input.address,
			city: input.city,
			state: input.state,
			zipCode: input.zipCode,
			country: input.country || "US",
			taxId: input.taxId,
			currency: input.currency || "USD",
			paymentTerms: input.paymentTerms,
			status: input.status || "active",
			notes: input.notes,
			tags: input.tags ? JSON.stringify(input.tags) : null,
		};

		const result = await db.insert(clients).values(newCustomer).returning();
		return result[0];
	}

	/**
	 * Update a customer
	 */
	async update(input: UpdateCustomerInput) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Verify ownership
		const existing = await this.getById(input.id);

		const updateData: any = {
			updatedAt: new Date(),
		};

		if (input.name !== undefined) updateData.name = input.name;
		if (input.email !== undefined) updateData.email = input.email;
		if (input.phone !== undefined) updateData.phone = input.phone;
		if (input.company !== undefined) updateData.company = input.company;
		if (input.address !== undefined) updateData.address = input.address;
		if (input.city !== undefined) updateData.city = input.city;
		if (input.state !== undefined) updateData.state = input.state;
		if (input.zipCode !== undefined) updateData.zipCode = input.zipCode;
		if (input.country !== undefined) updateData.country = input.country;
		if (input.taxId !== undefined) updateData.taxId = input.taxId;
		if (input.currency !== undefined) updateData.currency = input.currency;
		if (input.paymentTerms !== undefined) updateData.paymentTerms = input.paymentTerms;
		if (input.status !== undefined) updateData.status = input.status;
		if (input.notes !== undefined) updateData.notes = input.notes;
		if (input.tags !== undefined) updateData.tags = JSON.stringify(input.tags);

		const result = await db
			.update(clients)
			.set(updateData)
			.where(and(eq(clients.id, input.id), eq(clients.userId, userId)))
			.returning();

		return result[0];
	}

	/**
	 * Delete a customer
	 */
	async delete(id: number) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Verify ownership
		await this.getById(id);

		await db
			.delete(clients)
			.where(and(eq(clients.id, id), eq(clients.userId, userId)));

		return { success: true };
	}

	/**
	 * Search customers
	 */
	async search(query: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const results = await db
			.select()
			.from(clients)
			.where(
				and(
					eq(clients.userId, userId),
					or(
						ilike(clients.name, `%${query}%`),
						ilike(clients.email, `%${query}%`),
						ilike(clients.company || sql`''`, `%${query}%`)
					)
				)
			)
			.orderBy(desc(clients.createdAt))
			.limit(20);

		return results;
	}

	/**
	 * Get customer segments
	 */
	async getSegments(): Promise<CustomerSegment[]> {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const allCustomers = await this.getAll();

		// Define default segments
		const segments: CustomerSegment[] = [
			{
				id: "active",
				name: "Active Customers",
				description: "Customers with active status",
				criteria: { status: "active" },
				count: allCustomers.filter((c) => c.status === "active").length,
			},
			{
				id: "high-value",
				name: "High Value",
				description: "Customers with outstanding balance > $1000",
				criteria: { outstandingBalance: { gt: 1000 } },
				count: allCustomers.filter(
					(c) => Number(c.outstandingBalance || 0) > 1000
				).length,
			},
			{
				id: "new",
				name: "New Customers",
				description: "Customers created in the last 30 days",
				criteria: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
				count: allCustomers.filter((c) => {
					const created = new Date(c.createdAt);
					const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
					return created >= thirtyDaysAgo;
				}).length,
			},
		];

		return segments;
	}

	/**
	 * Get customer analytics
	 */
	async getAnalytics(): Promise<CustomerAnalytics> {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const allCustomers = await this.getAll();

		const totalInvoiced = allCustomers.reduce(
			(sum, c) => sum + Number(c.totalInvoiced || 0),
			0
		);
		const totalPaid = allCustomers.reduce(
			(sum, c) => sum + Number(c.totalPaid || 0),
			0
		);
		const outstandingBalance = allCustomers.reduce(
			(sum, c) => sum + Number(c.outstandingBalance || 0),
			0
		);

		return {
			totalCustomers: allCustomers.length,
			activeCustomers: allCustomers.filter((c) => c.status === "active").length,
			inactiveCustomers: allCustomers.filter((c) => c.status === "inactive").length,
			suspendedCustomers: allCustomers.filter((c) => c.status === "suspended").length,
			totalInvoiced,
			totalPaid,
			outstandingBalance,
			averageOrderValue: totalInvoiced / Math.max(allCustomers.length, 1),
			customerLifetimeValue: totalInvoiced / Math.max(allCustomers.length, 1),
			segmentBreakdown: [],
			growthTrend: [],
		};
	}
}

