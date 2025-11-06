/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from "@/lib/db";
import { hrContractors, type HRContractor, type NewHRContractor } from "@/lib/db/schemas";
import { eq, and, desc, ilike, or, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export interface CreateContractorInput {
	userId: string;
	organizationId: string;
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	contractorType?: "1099" | "w2" | "c2c" | "other";
	companyName?: string;
	hourlyRate?: string;
	monthlyRate?: string;
	annualRate?: string;
	currency?: string;
	paymentTerms?: "net_15" | "net_30" | "net_45" | "net_60" | "due_on_receipt" | "custom";
	customPaymentTerms?: string;
	contractStartDate: Date;
	contractEndDate?: Date;
	status?: "active" | "inactive" | "terminated" | "pending";
	location?: string;
	timezone?: string;
	notes?: string;
	tags?: string[];
}

export interface UpdateContractorInput extends Partial<CreateContractorInput> {
	id: string;
}

export interface ContractorFilters {
	search?: string;
	contractorType?: string;
	status?: string;
	organizationId?: string;
}

/**
 * HR Contractors Service - Handles all contractor-related operations
 */
export class ContractorsService {
	/**
	 * Get all contractors
	 */
	async getAll(filters?: ContractorFilters) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		let query = db.select().from(hrContractors);

		if (filters) {
			const conditions = [];
			
			if (filters.organizationId) {
				conditions.push(eq(hrContractors.organizationId, filters.organizationId));
			} else {
				conditions.push(eq(hrContractors.userId, userId));
			}

			if (filters.search) {
				conditions.push(
					or(
						ilike(hrContractors.firstName, `%${filters.search}%`),
						ilike(hrContractors.lastName, `%${filters.search}%`),
						ilike(hrContractors.email, `%${filters.search}%`),
						ilike(hrContractors.companyName || sql`''`, `%${filters.search}%`)
					)
				);
			}

			if (filters.contractorType) {
				conditions.push(eq(hrContractors.contractorType, filters.contractorType as any));
			}

			if (filters.status) {
				conditions.push(eq(hrContractors.status, filters.status as any));
			}

			if (conditions.length > 0) {
				query = query.where(and(...conditions));
			}
		} else {
			query = query.where(eq(hrContractors.userId, userId));
		}

		const results = await query.orderBy(desc(hrContractors.createdAt));
		return results;
	}

	/**
	 * Get contractor by ID
	 */
	async getById(id: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const result = await db
			.select()
			.from(hrContractors)
			.where(and(eq(hrContractors.id, id), eq(hrContractors.userId, userId)))
			.limit(1);

		if (result.length === 0) {
			throw new Error("Contractor not found");
		}

		return result[0];
	}

	/**
	 * Create a new contractor
	 */
	async create(input: CreateContractorInput) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const newContractor: NewHRContractor = {
			userId,
			organizationId: input.organizationId,
			firstName: input.firstName,
			lastName: input.lastName,
			email: input.email,
			phone: input.phone,
			contractorType: input.contractorType || "1099",
			companyName: input.companyName,
			hourlyRate: input.hourlyRate,
			monthlyRate: input.monthlyRate,
			annualRate: input.annualRate,
			currency: input.currency || "USD",
			paymentTerms: input.paymentTerms || "net_30",
			customPaymentTerms: input.customPaymentTerms,
			contractStartDate: input.contractStartDate,
			contractEndDate: input.contractEndDate,
			status: input.status || "active",
			location: input.location,
			timezone: input.timezone || "UTC",
			notes: input.notes,
			tags: input.tags ? JSON.stringify(input.tags) : null,
		};

		const result = await db.insert(hrContractors).values(newContractor).returning();
		return result[0];
	}

	/**
	 * Update a contractor
	 */
	async update(input: UpdateContractorInput) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Verify ownership
		await this.getById(input.id);

		const updateData: any = {
			updatedAt: new Date(),
		};

		if (input.firstName !== undefined) updateData.firstName = input.firstName;
		if (input.lastName !== undefined) updateData.lastName = input.lastName;
		if (input.email !== undefined) updateData.email = input.email;
		if (input.phone !== undefined) updateData.phone = input.phone;
		if (input.contractorType !== undefined) updateData.contractorType = input.contractorType;
		if (input.companyName !== undefined) updateData.companyName = input.companyName;
		if (input.hourlyRate !== undefined) updateData.hourlyRate = input.hourlyRate;
		if (input.monthlyRate !== undefined) updateData.monthlyRate = input.monthlyRate;
		if (input.annualRate !== undefined) updateData.annualRate = input.annualRate;
		if (input.currency !== undefined) updateData.currency = input.currency;
		if (input.paymentTerms !== undefined) updateData.paymentTerms = input.paymentTerms;
		if (input.customPaymentTerms !== undefined) updateData.customPaymentTerms = input.customPaymentTerms;
		if (input.contractStartDate !== undefined) updateData.contractStartDate = input.contractStartDate;
		if (input.contractEndDate !== undefined) updateData.contractEndDate = input.contractEndDate;
		if (input.status !== undefined) updateData.status = input.status;
		if (input.location !== undefined) updateData.location = input.location;
		if (input.timezone !== undefined) updateData.timezone = input.timezone;
		if (input.notes !== undefined) updateData.notes = input.notes;
		if (input.tags !== undefined) updateData.tags = JSON.stringify(input.tags);

		const result = await db
			.update(hrContractors)
			.set(updateData)
			.where(and(eq(hrContractors.id, input.id), eq(hrContractors.userId, userId)))
			.returning();

		return result[0];
	}

	/**
	 * Delete a contractor
	 */
	async delete(id: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Verify ownership
		await this.getById(id);

		await db
			.delete(hrContractors)
			.where(and(eq(hrContractors.id, id), eq(hrContractors.userId, userId)));

		return { success: true };
	}

	/**
	 * Get contractor performance metrics
	 */
	async getPerformance(id: string) {
		const contractor = await this.getById(id);

		// Get time tracking stats
		const timeStats = await db
			.select({
				totalHours: sql<number>`COALESCE(SUM(${sql.raw('duration')}), 0)`,
				billableHours: sql<number>`COALESCE(SUM(CASE WHEN is_billable THEN ${sql.raw('duration')} ELSE 0 END), 0)`,
				totalAmount: sql<number>`COALESCE(SUM(${sql.raw('total_amount')}), 0)`,
			})
			.from(sql`time_entries`)
			.where(sql`contractor_id = ${id} AND status = 'completed'`);

		return {
			contractor,
			performance: {
				totalHours: Number(timeStats[0]?.totalHours || 0),
				billableHours: Number(timeStats[0]?.billableHours || 0),
				totalAmount: Number(timeStats[0]?.totalAmount || 0),
			},
		};
	}

	/**
	 * Get analytics
	 */
	async getAnalytics(organizationId?: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const filters: ContractorFilters = {};
		if (organizationId) {
			filters.organizationId = organizationId;
		}

		const allContractors = await this.getAll(filters);

		const typeStats = await db
			.select({
				contractorType: hrContractors.contractorType,
				count: sql<number>`count(*)`.as("count"),
			})
			.from(hrContractors)
			.where(organizationId ? eq(hrContractors.organizationId, organizationId) : eq(hrContractors.userId, userId))
			.groupBy(hrContractors.contractorType);

		return {
			total: allContractors.length,
			active: allContractors.filter((c) => c.status === "active").length,
			inactive: allContractors.filter((c) => c.status === "inactive").length,
			terminated: allContractors.filter((c) => c.status === "terminated").length,
			typeBreakdown: typeStats,
		};
	}
}

