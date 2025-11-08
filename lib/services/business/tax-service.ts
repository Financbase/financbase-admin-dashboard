/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from "@/lib/db";
import { withTransaction } from "@/lib/utils/db-transaction";
import { cache } from "@/lib/cache/cache-manager";
import {
	taxObligations,
	taxDeductions,
	taxDocuments,
	taxPayments,
	type TaxObligation,
	type TaxDeduction,
	type TaxDocument,
	type TaxPayment,
} from "@/lib/db/schemas";
import {
	eq,
	and,
	desc,
	or,
	gte,
	lte,
	sql,
	sum,
} from "drizzle-orm";
import type {
	CreateTaxObligationInput,
	UpdateTaxObligationInput,
	CreateTaxDeductionInput,
	UpdateTaxDeductionInput,
	CreateTaxDocumentInput,
	RecordTaxPaymentInput,
} from "@/lib/validation-schemas";

export interface TaxObligationFilters {
	status?: "pending" | "paid" | "overdue" | "cancelled";
	year?: number;
	quarter?: string;
	type?: string;
	limit?: number;
	offset?: number;
}

export interface TaxDeductionFilters {
	year?: number;
	category?: string;
	limit?: number;
	offset?: number;
}

export interface TaxDocumentFilters {
	year?: number;
	type?: string;
	limit?: number;
	offset?: number;
}

export interface TaxAlertFilters {
	limit?: number;
	offset?: number;
}

export interface PaginatedResult<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface TaxSummary {
	totalObligations: number;
	totalPaid: number;
	totalPending: number;
	totalDeductions: number;
	obligationsByStatus: {
		pending: number;
		paid: number;
		overdue: number;
	};
	obligationsByType: Record<string, number>;
}

export interface TaxAlert {
	type: "danger" | "warning" | "info";
	message: string;
	action?: string;
	amount?: string | null;
	obligationId?: string;
}

/**
 * Tax Service - Handles all tax-related operations
 */
export class TaxService {
	/**
	 * Get all tax obligations with optional filtering and pagination
	 */
	async getObligations(
		userId: string,
		filters?: TaxObligationFilters
	): Promise<TaxObligation[] | PaginatedResult<TaxObligation>> {
		const conditions = [eq(taxObligations.userId, userId)];

		if (filters?.status) {
			conditions.push(eq(taxObligations.status, filters.status));
		}
		if (filters?.year) {
			conditions.push(eq(taxObligations.year, filters.year));
		}
		if (filters?.quarter) {
			conditions.push(eq(taxObligations.quarter, filters.quarter));
		}
		if (filters?.type) {
			conditions.push(eq(taxObligations.type, filters.type as any));
		}

		// Get total count if pagination is requested
		if (filters?.limit !== undefined) {
			const totalResult = await db
				.select({ count: sql<number>`count(*)::int` })
				.from(taxObligations)
				.where(and(...conditions));

			const total = totalResult[0]?.count || 0;
			const limit = Math.min(filters.limit || 50, 100); // Max 100 per page
			const offset = filters.offset || 0;
			const page = Math.floor(offset / limit) + 1;
			const totalPages = Math.ceil(total / limit);

			const results = await db
				.select()
				.from(taxObligations)
				.where(and(...conditions))
				.orderBy(desc(taxObligations.dueDate))
				.limit(limit)
				.offset(offset);

			return {
				data: results,
				total,
				page,
				limit,
				totalPages,
			};
		}

		const results = await db
			.select()
			.from(taxObligations)
			.where(and(...conditions))
			.orderBy(desc(taxObligations.dueDate));

		return results;
	}

	/**
	 * Get single tax obligation by ID
	 */
	async getObligationById(
		id: string,
		userId: string
	): Promise<TaxObligation> {
		const results = await db
			.select()
			.from(taxObligations)
			.where(and(eq(taxObligations.id, id), eq(taxObligations.userId, userId)))
			.limit(1);

		if (results.length === 0) {
			throw new Error("Tax obligation not found");
		}

		return results[0];
	}

	/**
	 * Create new tax obligation
	 */
	async createObligation(
		input: CreateTaxObligationInput
	): Promise<TaxObligation> {
		const newObligation = {
			userId: input.userId,
			name: input.name,
			type: input.type as any,
			amount: input.amount.toString(),
			dueDate: new Date(input.dueDate),
			status: input.status as any,
			quarter: input.quarter || null,
			year: input.year,
			paid: "0",
			notes: input.notes || null,
			metadata: input.metadata || null,
		};

		const result = await db
			.insert(taxObligations)
			.values(newObligation)
			.returning();

		return result[0];
	}

	/**
	 * Update tax obligation
	 */
	async updateObligation(
		id: string,
		input: UpdateTaxObligationInput,
		userId: string
	): Promise<TaxObligation> {
		// Verify ownership
		await this.getObligationById(id, userId);

		const updateData: any = {
			updatedAt: new Date(),
		};

		if (input.name !== undefined) updateData.name = input.name;
		if (input.type !== undefined) updateData.type = input.type;
		if (input.amount !== undefined) updateData.amount = input.amount.toString();
		if (input.dueDate !== undefined)
			updateData.dueDate = new Date(input.dueDate);
		if (input.status !== undefined) updateData.status = input.status;
		if (input.quarter !== undefined) updateData.quarter = input.quarter;
		if (input.year !== undefined) updateData.year = input.year;
		if (input.notes !== undefined) updateData.notes = input.notes;
		if (input.metadata !== undefined) updateData.metadata = input.metadata;

		// Auto-update status based on due date
		if (input.dueDate !== undefined || input.status === undefined) {
			const obligation = await this.getObligationById(id, userId);
			const dueDate = input.dueDate
				? new Date(input.dueDate)
				: new Date(obligation.dueDate);
			const now = new Date();
			const paid = parseFloat(obligation.paid?.toString() || "0");
			const amount = parseFloat(obligation.amount?.toString() || "0");

			if (paid >= amount) {
				updateData.status = "paid";
			} else if (dueDate < now && input.status !== "paid") {
				updateData.status = "overdue";
			} else if (input.status === undefined) {
				updateData.status = "pending";
			}
		}

		const result = await db
			.update(taxObligations)
			.set(updateData)
			.where(and(eq(taxObligations.id, id), eq(taxObligations.userId, userId)))
			.returning();

		return result[0];
	}

	/**
	 * Delete tax obligation
	 */
	async deleteObligation(id: string, userId: string): Promise<void> {
		// Verify ownership
		await this.getObligationById(id, userId);

		await db
			.delete(taxObligations)
			.where(and(eq(taxObligations.id, id), eq(taxObligations.userId, userId)));
	}

	/**
	 * Record tax payment
	 * Uses atomic database update to prevent race conditions
	 */
	async recordPayment(
		input: RecordTaxPaymentInput,
		userId: string
	): Promise<TaxObligation> {
		return await withTransaction(async (tx) => {
			// Use atomic SQL update to prevent race conditions
			const result = await tx.execute(sql`
				UPDATE tax_obligations
				SET 
					paid = paid + ${input.amount}::NUMERIC,
					payment_date = ${new Date(input.paymentDate)}::TIMESTAMP WITH TIME ZONE,
					payment_method = COALESCE(${input.paymentMethod || null}::TEXT, payment_method),
					status = CASE 
						WHEN paid + ${input.amount}::NUMERIC >= amount THEN 'paid'::tax_obligation_status
						ELSE 'pending'::tax_obligation_status
					END,
					updated_at = NOW()
				WHERE id = ${input.obligationId}::UUID
					AND user_id = ${userId}::TEXT
				RETURNING *
			`);

			if (!result.rows || result.rows.length === 0) {
				throw new Error("Tax obligation not found");
			}

			return result.rows[0] as TaxObligation;
		});
	}

	/**
	 * Get tax deductions grouped by category
	 */
	async getDeductions(
		userId: string,
		year?: number
	): Promise<TaxDeduction[]> {
		const conditions = [eq(taxDeductions.userId, userId)];

		if (year) {
			conditions.push(eq(taxDeductions.year, year));
		}

		const results = await db
			.select()
			.from(taxDeductions)
			.where(and(...conditions))
			.orderBy(desc(taxDeductions.amount));

		// Calculate percentages if not set
		if (results.length > 0) {
			const total = results.reduce(
				(sum, d) => sum + parseFloat(d.amount?.toString() || "0"),
				0
			);

			if (total > 0) {
				for (const deduction of results) {
					if (!deduction.percentage) {
						const percentage =
							(parseFloat(deduction.amount?.toString() || "0") / total) * 100;
						// Update percentage in database
						await db
							.update(taxDeductions)
							.set({ percentage: percentage.toString() })
							.where(eq(taxDeductions.id, deduction.id));
					}
				}
			}
		}

		return results;
	}

	/**
	 * Create manual tax deduction
	 */
	async createDeduction(
		input: CreateTaxDeductionInput
	): Promise<TaxDeduction> {
		const newDeduction = {
			userId: input.userId,
			category: input.category,
			amount: input.amount.toString(),
			percentage: input.percentage?.toString() || null,
			transactionCount: input.transactionCount || 0,
			year: input.year,
			description: input.description || null,
			metadata: input.metadata || null,
		};

		const result = await db
			.insert(taxDeductions)
			.values(newDeduction)
			.returning();

		// Recalculate percentages for the year
		await this.recalculateDeductionPercentages(input.userId, input.year);

		return result[0];
	}

	/**
	 * Update tax deduction
	 */
	async updateDeduction(
		id: string,
		input: UpdateTaxDeductionInput,
		userId: string
	): Promise<TaxDeduction> {
		// Verify ownership
		const deduction = await this.getDeductionById(id, userId);

		const updateData: any = {
			updatedAt: new Date(),
		};

		if (input.category !== undefined) updateData.category = input.category;
		if (input.amount !== undefined) updateData.amount = input.amount.toString();
		if (input.percentage !== undefined)
			updateData.percentage = input.percentage.toString();
		if (input.transactionCount !== undefined)
			updateData.transactionCount = input.transactionCount;
		if (input.year !== undefined) updateData.year = input.year;
		if (input.description !== undefined) updateData.description = input.description;
		if (input.metadata !== undefined) updateData.metadata = input.metadata;

		const result = await db
			.update(taxDeductions)
			.set(updateData)
			.where(and(eq(taxDeductions.id, id), eq(taxDeductions.userId, userId)))
			.returning();

		// Recalculate percentages for the year
		await this.recalculateDeductionPercentages(
			userId,
			input.year || deduction.year
		);

		return result[0];
	}

	/**
	 * Delete tax deduction
	 */
	async deleteDeduction(id: string, userId: string): Promise<void> {
		// Verify ownership
		const deduction = await this.getDeductionById(id, userId);
		const year = deduction.year;

		await db
			.delete(taxDeductions)
			.where(and(eq(taxDeductions.id, id), eq(taxDeductions.userId, userId)));

		// Recalculate percentages for the year
		await this.recalculateDeductionPercentages(userId, year);
	}

	/**
	 * Get tax deduction by ID
	 */
	private async getDeductionById(
		id: string,
		userId: string
	): Promise<TaxDeduction> {
		const results = await db
			.select()
			.from(taxDeductions)
			.where(and(eq(taxDeductions.id, id), eq(taxDeductions.userId, userId)))
			.limit(1);

		if (results.length === 0) {
			throw new Error("Tax deduction not found");
		}

		return results[0];
	}

	/**
	 * Recalculate deduction percentages for a year
	 * Uses transaction to ensure atomic updates
	 */
	private async recalculateDeductionPercentages(
		userId: string,
		year: number
	): Promise<void> {
		return await withTransaction(async (tx) => {
			// Get deductions within transaction
			const conditions = [eq(taxDeductions.userId, userId), eq(taxDeductions.year, year)];
			const deductions = await tx
				.select()
				.from(taxDeductions)
				.where(and(...conditions));

			const total = deductions.reduce(
				(sum, d) => sum + parseFloat(d.amount?.toString() || "0"),
				0
			);

			if (total > 0) {
				// Update all percentages atomically
				const updates = deductions.map((deduction) => {
					const percentage =
						(parseFloat(deduction.amount?.toString() || "0") / total) * 100;
					return tx
						.update(taxDeductions)
						.set({ 
							percentage: percentage.toString(),
							updatedAt: new Date()
						})
						.where(eq(taxDeductions.id, deduction.id));
				});
				await Promise.all(updates);
			}
		});
	}

	/**
	 * Get tax documents
	 */
	async getDocuments(
		userId: string,
		year?: number
	): Promise<TaxDocument[]> {
		const conditions = [eq(taxDocuments.userId, userId)];

		if (year) {
			conditions.push(eq(taxDocuments.year, year));
		}

		const results = await db
			.select()
			.from(taxDocuments)
			.where(and(...conditions))
			.orderBy(desc(taxDocuments.uploadedAt));

		return results;
	}

	/**
	 * Create document record
	 */
	async createDocument(input: CreateTaxDocumentInput): Promise<TaxDocument> {
		const newDocument = {
			userId: input.userId,
			name: input.name,
			type: input.type as any,
			year: input.year,
			fileUrl: input.fileUrl,
			fileSize: input.fileSize || null,
			fileName: input.fileName || null,
			mimeType: input.mimeType || null,
			description: input.description || null,
			metadata: input.metadata || null,
		};

		const result = await db
			.insert(taxDocuments)
			.values(newDocument)
			.returning();

		return result[0];
	}

	/**
	 * Delete document
	 */
	async deleteDocument(id: string, userId: string): Promise<void> {
		const results = await db
			.select()
			.from(taxDocuments)
			.where(and(eq(taxDocuments.id, id), eq(taxDocuments.userId, userId)))
			.limit(1);

		if (results.length === 0) {
			throw new Error("Tax document not found");
		}

		await db
			.delete(taxDocuments)
			.where(and(eq(taxDocuments.id, id), eq(taxDocuments.userId, userId)));
	}

	/**
	 * Get tax summary and statistics
	 * Optimized with single query and caching (5 minute TTL)
	 */
	async getTaxSummary(userId: string, year?: number): Promise<TaxSummary> {
		const currentYear = year || new Date().getFullYear();
		const cacheKey = `tax:summary:${userId}:${currentYear}`;

		// Try cache first (5 minute TTL)
		return await cache.getOrSet(
			cacheKey,
			async () => {
				return await this._getTaxSummaryInternal(userId, currentYear);
			},
			{ ttl: 300, namespace: 'tax' }
		);
	}

	/**
	 * Internal method to get tax summary (without cache)
	 */
	private async _getTaxSummaryInternal(userId: string, currentYear: number): Promise<TaxSummary> {

		// Use optimized single query with aggregations
		const [obligationsSummary, deductionsSummary, typeBreakdown] = await Promise.all([
			// Get obligations summary in one query
			db
				.select({
					totalObligations: sql<number>`COALESCE(SUM(amount::numeric), 0)::numeric`,
					totalPaid: sql<number>`COALESCE(SUM(paid::numeric), 0)::numeric`,
					pendingCount: sql<number>`COUNT(*) FILTER (WHERE status = 'pending')::int`,
					paidCount: sql<number>`COUNT(*) FILTER (WHERE status = 'paid')::int`,
					overdueCount: sql<number>`COUNT(*) FILTER (WHERE status = 'overdue')::int`,
				})
				.from(taxObligations)
				.where(and(eq(taxObligations.userId, userId), eq(taxObligations.year, currentYear))),
			// Get deductions summary
			// Get deductions summary in one query
			db
				.select({
					totalDeductions: sql<number>`COALESCE(SUM(amount::numeric), 0)::numeric`,
				})
				.from(taxDeductions)
				.where(and(eq(taxDeductions.userId, userId), eq(taxDeductions.year, currentYear))),
		]);

		const obligationsData = obligationsSummary[0];
		const deductionsData = deductionsSummary[0];

		const totalObligations = Number(obligationsData?.totalObligations || 0);
		const totalPaid = Number(obligationsData?.totalPaid || 0);
		const totalPending = totalObligations - totalPaid;
		const totalDeductions = Number(deductionsData?.totalDeductions || 0);

		const obligationsByStatus = {
			pending: obligationsData?.pendingCount || 0,
			paid: obligationsData?.paidCount || 0,
			overdue: obligationsData?.overdueCount || 0,
		};

		// Parse obligationsByType from JSONB or use empty object
		const obligationsByType: Record<string, number> =
			(obligationsData?.statusBreakdown as Record<string, number>) || {};

		return {
			totalObligations,
			totalPaid,
			totalPending,
			totalDeductions,
			obligationsByStatus,
			obligationsByType,
		};
	}

	/**
	 * Generate tax alerts for overdue/pending taxes
	 */
	async getTaxAlerts(userId: string): Promise<TaxAlert[]> {
		const alerts: TaxAlert[] = [];
		const now = new Date();

		// Get all obligations
		const obligations = await this.getObligations(userId);

		for (const obligation of obligations) {
			const dueDate = new Date(obligation.dueDate);
			const amount = parseFloat(obligation.amount?.toString() || "0");
			const paid = parseFloat(obligation.paid?.toString() || "0");
			const remaining = amount - paid;
			const daysOverdue = Math.floor(
				(now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
			);

			// Overdue alert
			if (obligation.status === "overdue" || (dueDate < now && remaining > 0)) {
				alerts.push({
					type: "danger",
					message: `${obligation.name} is overdue${daysOverdue > 0 ? ` by ${daysOverdue} days` : ""}`,
					action: "Pay Now",
					amount: `$${remaining.toLocaleString()}`,
					obligationId: obligation.id,
				});
			}

			// Upcoming due date alert (within 45 days)
			if (
				obligation.status === "pending" &&
				dueDate > now &&
				dueDate <= new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000) &&
				remaining > 0
			) {
				const daysUntilDue = Math.floor(
					(dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
				);
				alerts.push({
					type: "warning",
					message: `${obligation.name} due in ${daysUntilDue} days`,
					action: "Prepare Payment",
					amount: `$${remaining.toLocaleString()}`,
					obligationId: obligation.id,
				});
			}
		}

		// Info alert for tax documents
		const currentYear = new Date().getFullYear();
		const documents = await this.getDocuments(userId, currentYear);
		if (documents.length > 0) {
			alerts.push({
				type: "info",
				message: "Tax documents ready for download",
				action: "Download",
				amount: null,
			});
		}

		return alerts;
	}
}

