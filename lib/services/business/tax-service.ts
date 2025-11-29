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
import { AuditService } from "@/lib/services/audit-service";
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
	isNull,
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
		const conditions = [
			eq(taxObligations.userId, userId),
			isNull(taxObligations.deletedAt), // Filter soft-deleted records
		];

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
			.where(
				and(
					eq(taxObligations.id, id),
					eq(taxObligations.userId, userId),
					isNull(taxObligations.deletedAt) // Filter soft-deleted records
				)
			)
			.limit(1);

		if (results.length === 0) {
			throw new Error("Tax obligation not found");
		}

		return results[0];
	}

	/**
	 * Create new tax obligation
	 * Invalidates cache on creation
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

		// Audit log
		await AuditService.logEvent(
			input.userId,
			'tax_obligation_created',
			'create',
			{ obligationId: result[0].id, obligationName: input.name },
			{
				resourceType: 'tax_obligation',
				resourceId: result[0].id,
				resourceName: input.name,
				riskLevel: 'low',
			}
		);

		// Invalidate cache
		await this.invalidateTaxCache(input.userId, input.year);

		return result[0];
	}

	/**
	 * Invalidate cache for a user's tax data
	 */
	private async invalidateTaxCache(userId: string, year?: number): Promise<void> {
		const tags = [
			`tax:summary:${userId}:${year || 'all'}`,
			`tax:obligations:${userId}`,
			`tax:deductions:${userId}`,
			`tax:documents:${userId}`,
			`tax:alerts:${userId}`,
			'tax'
		];
		await cache.invalidateByTags(tags);
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

		// Audit log
		await AuditService.logEvent(
			userId,
			'tax_obligation_updated',
			'update',
			{ obligationId: id, changes: updateData },
			{
				resourceType: 'tax_obligation',
				resourceId: id,
				riskLevel: 'low',
			}
		);

		// Invalidate cache
		const obligation = result[0];
		await this.invalidateTaxCache(userId, obligation.year);

		return result[0];
	}

	/**
	 * Soft delete tax obligation
	 */
	async deleteObligation(id: string, userId: string): Promise<void> {
		// Verify ownership
		const obligation = await this.getObligationById(id, userId);
		
		await db
			.update(taxObligations)
			.set({ deletedAt: new Date() })
			.where(and(eq(taxObligations.id, id), eq(taxObligations.userId, userId)));

		// Audit log
		await AuditService.logEvent(
			userId,
			'tax_obligation_deleted',
			'delete',
			{ obligationId: id, obligationName: obligation.name },
			{
				resourceType: 'tax_obligation',
				resourceId: id,
				resourceName: obligation.name,
				riskLevel: 'low',
			}
		);

		// Invalidate cache
		await this.invalidateTaxCache(userId, obligation.year);
	}

	/**
	 * Restore soft-deleted tax obligation
	 */
	async restoreObligation(id: string, userId: string): Promise<TaxObligation> {
		const result = await db
			.update(taxObligations)
			.set({ deletedAt: null })
			.where(and(eq(taxObligations.id, id), eq(taxObligations.userId, userId)))
			.returning();

		if (result.length === 0) {
			throw new Error("Tax obligation not found");
		}

		// Audit log
		await AuditService.logEvent(
			userId,
			'tax_obligation_restored',
			'restore',
			{ obligationId: id },
			{
				resourceType: 'tax_obligation',
				resourceId: id,
				riskLevel: 'low',
			}
		);

		// Invalidate cache
		await this.invalidateTaxCache(userId, result[0].year);

		return result[0];
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
			// First, get obligation details to extract year and quarter
			const obligationResult = await tx.execute(sql`
				SELECT id, year, quarter, amount, paid
				FROM tax_obligations
				WHERE id = ${input.obligationId}::UUID
					AND user_id = ${userId}::TEXT
				FOR UPDATE
			`);

			if (!obligationResult.rows || obligationResult.rows.length === 0) {
				throw new Error("Tax obligation not found");
			}

			const obligationData = obligationResult.rows[0] as {
				id: string;
				year: number;
				quarter: string | null;
				amount: string;
				paid: string;
			};

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

			const updatedObligation = result.rows[0] as TaxObligation;

			// Create payment record
			const quarter = obligationData.quarter 
				? Number.parseInt(obligationData.quarter.replace('Q', '')) 
				: null;

			await tx.insert(taxPayments).values({
				userId,
				obligationId: input.obligationId,
				amount: input.amount.toString(),
				paymentDate: new Date(input.paymentDate),
				paymentMethod: input.paymentMethod || null,
				reference: input.reference || null,
				quarter,
				year: obligationData.year,
				notes: input.notes || null,
				metadata: input.metadata || null,
			});

			// Audit log
			await AuditService.logEvent(
				userId,
				'tax_payment_recorded',
				'create',
				{
					obligationId: input.obligationId,
					amount: input.amount,
					paymentMethod: input.paymentMethod,
				},
				{
					resourceType: 'tax_payment',
					resourceId: input.obligationId,
					riskLevel: 'low',
				}
			);

			// Invalidate cache after transaction commits
			await this.invalidateTaxCache(userId, obligationData.year);

			return updatedObligation;
		});
	}

	/**
	 * Get payment history for a user
	 */
	async getPaymentHistory(
		userId: string,
		year?: number,
		obligationId?: string
	): Promise<TaxPayment[]> {
		const conditions = [eq(taxPayments.userId, userId)];

		if (year) {
			conditions.push(eq(taxPayments.year, year));
		}

		if (obligationId) {
			conditions.push(eq(taxPayments.obligationId, obligationId));
		}

		const results = await db
			.select()
			.from(taxPayments)
			.where(and(...conditions))
			.orderBy(desc(taxPayments.paymentDate));

		return results;
	}

	/**
	 * Get payments for a specific obligation
	 */
	async getPaymentsByObligation(
		obligationId: string,
		userId: string
	): Promise<TaxPayment[]> {
		const results = await db
			.select()
			.from(taxPayments)
			.where(
				and(
					eq(taxPayments.obligationId, obligationId),
					eq(taxPayments.userId, userId)
				)
			)
			.orderBy(desc(taxPayments.paymentDate));

		return results;
	}

	/**
	 * Get tax deductions grouped by category with optional pagination
	 * Cached for 5 minutes (non-paginated requests only)
	 */
	async getDeductions(
		userId: string,
		year?: number,
		filters?: TaxDeductionFilters
	): Promise<TaxDeduction[] | PaginatedResult<TaxDeduction>> {
		// Cache only non-paginated requests
		if (!filters?.limit) {
			const cacheKey = `tax:deductions:${userId}:${year || 'all'}:${filters?.category || 'all'}`;
			return await cache.getOrSet(
				cacheKey,
				async () => {
					return await this._getDeductionsInternal(userId, year, filters);
				},
				{ ttl: 300, namespace: 'tax' }
			);
		}

		return await this._getDeductionsInternal(userId, year, filters);
	}

	/**
	 * Internal method to get deductions (without cache)
	 */
	private async _getDeductionsInternal(
		userId: string,
		year?: number,
		filters?: TaxDeductionFilters
	): Promise<TaxDeduction[] | PaginatedResult<TaxDeduction>> {
		const conditions = [
			eq(taxDeductions.userId, userId),
			isNull(taxDeductions.deletedAt), // Filter soft-deleted records
		];

		if (year) {
			conditions.push(eq(taxDeductions.year, year));
		} else if (filters?.year) {
			conditions.push(eq(taxDeductions.year, filters.year));
		}

		if (filters?.category) {
			conditions.push(eq(taxDeductions.category, filters.category));
		}

		// Get total count if pagination is requested
		if (filters?.limit !== undefined) {
			const totalResult = await db
				.select({ count: sql<number>`count(*)::int` })
				.from(taxDeductions)
				.where(and(...conditions));

			const total = totalResult[0]?.count || 0;
			const limit = Math.min(filters.limit || 50, 100); // Max 100 per page
			const offset = filters.offset || 0;
			const page = Math.floor(offset / limit) + 1;
			const totalPages = Math.ceil(total / limit);

			const results = await db
				.select()
				.from(taxDeductions)
				.where(and(...conditions))
				.orderBy(desc(taxDeductions.amount))
				.limit(limit)
				.offset(offset);

			// Calculate percentages if not set (only for returned results)
			await this.calculateMissingPercentages(results);

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
			.from(taxDeductions)
			.where(and(...conditions))
			.orderBy(desc(taxDeductions.amount));

		// Calculate percentages if not set
		await this.calculateMissingPercentages(results);

		return results;
	}

	/**
	 * Helper method to calculate missing percentages for deductions
	 */
	private async calculateMissingPercentages(deductions: TaxDeduction[]): Promise<void> {
		if (deductions.length === 0) return;

		const total = deductions.reduce(
			(sum, d) => sum + parseFloat(d.amount?.toString() || "0"),
			0
		);

		if (total > 0) {
			for (const deduction of deductions) {
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

		// Audit log
		await AuditService.logEvent(
			input.userId,
			'tax_deduction_created',
			'create',
			{ deductionId: result[0].id, category: input.category },
			{
				resourceType: 'tax_deduction',
				resourceId: result[0].id,
				riskLevel: 'low',
			}
		);

		// Invalidate cache
		await this.invalidateTaxCache(input.userId, input.year);

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

		// Audit log
		await AuditService.logEvent(
			userId,
			'tax_deduction_updated',
			'update',
			{ deductionId: id, changes: updateData },
			{
				resourceType: 'tax_deduction',
				resourceId: id,
				riskLevel: 'low',
			}
		);

		// Invalidate cache
		await this.invalidateTaxCache(userId, input.year || deduction.year);

		return result[0];
	}

	/**
	 * Soft delete tax deduction
	 */
	async deleteDeduction(id: string, userId: string): Promise<void> {
		// Verify ownership
		const deduction = await this.getDeductionById(id, userId);
		const year = deduction.year;

		await db
			.update(taxDeductions)
			.set({ deletedAt: new Date() })
			.where(and(eq(taxDeductions.id, id), eq(taxDeductions.userId, userId)));

		// Recalculate percentages for the year
		await this.recalculateDeductionPercentages(userId, year);

		// Audit log
		await AuditService.logEvent(
			userId,
			'tax_deduction_deleted',
			'delete',
			{ deductionId: id, category: deduction.category },
			{
				resourceType: 'tax_deduction',
				resourceId: id,
				riskLevel: 'low',
			}
		);

		// Invalidate cache
		await this.invalidateTaxCache(userId, year);
	}

	/**
	 * Restore soft-deleted tax deduction
	 */
	async restoreDeduction(id: string, userId: string): Promise<TaxDeduction> {
		const result = await db
			.update(taxDeductions)
			.set({ deletedAt: null })
			.where(and(eq(taxDeductions.id, id), eq(taxDeductions.userId, userId)))
			.returning();

		if (result.length === 0) {
			throw new Error("Tax deduction not found");
		}

		// Recalculate percentages
		await this.recalculateDeductionPercentages(userId, result[0].year);

		// Audit log
		await AuditService.logEvent(
			userId,
			'tax_deduction_restored',
			'restore',
			{ deductionId: id },
			{
				resourceType: 'tax_deduction',
				resourceId: id,
				riskLevel: 'low',
			}
		);

		// Invalidate cache
		await this.invalidateTaxCache(userId, result[0].year);

		return result[0];
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
			.where(
				and(
					eq(taxDeductions.id, id),
					eq(taxDeductions.userId, userId),
					isNull(taxDeductions.deletedAt) // Filter soft-deleted records
				)
			)
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
			// Get deductions within transaction (excluding soft-deleted)
			const conditions = [
				eq(taxDeductions.userId, userId),
				eq(taxDeductions.year, year),
				isNull(taxDeductions.deletedAt), // Filter soft-deleted records
			];
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
	 * Get tax documents with optional pagination
	 * Cached for 5 minutes (non-paginated requests only)
	 */
	async getDocuments(
		userId: string,
		year?: number,
		filters?: TaxDocumentFilters
	): Promise<TaxDocument[] | PaginatedResult<TaxDocument>> {
		// Cache only non-paginated requests
		if (!filters?.limit) {
			const cacheKey = `tax:documents:${userId}:${year || 'all'}:${filters?.type || 'all'}`;
			return await cache.getOrSet(
				cacheKey,
				async () => {
					return await this._getDocumentsInternal(userId, year, filters);
				},
				{ ttl: 300, namespace: 'tax' }
			);
		}

		return await this._getDocumentsInternal(userId, year, filters);
	}

	/**
	 * Internal method to get documents (without cache)
	 */
	private async _getDocumentsInternal(
		userId: string,
		year?: number,
		filters?: TaxDocumentFilters
	): Promise<TaxDocument[] | PaginatedResult<TaxDocument>> {
		const conditions = [
			eq(taxDocuments.userId, userId),
			isNull(taxDocuments.deletedAt), // Filter soft-deleted records
		];

		if (year) {
			conditions.push(eq(taxDocuments.year, year));
		} else if (filters?.year) {
			conditions.push(eq(taxDocuments.year, filters.year));
		}

		if (filters?.type) {
			conditions.push(eq(taxDocuments.type, filters.type as any));
		}

		// Get total count if pagination is requested
		if (filters?.limit !== undefined) {
			const totalResult = await db
				.select({ count: sql<number>`count(*)::int` })
				.from(taxDocuments)
				.where(and(...conditions));

			const total = totalResult[0]?.count || 0;
			const limit = Math.min(filters.limit || 50, 100); // Max 100 per page
			const offset = filters.offset || 0;
			const page = Math.floor(offset / limit) + 1;
			const totalPages = Math.ceil(total / limit);

			const results = await db
				.select()
				.from(taxDocuments)
				.where(and(...conditions))
				.orderBy(desc(taxDocuments.uploadedAt))
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

		// Audit log
		await AuditService.logEvent(
			input.userId,
			'tax_document_created',
			'create',
			{ documentId: result[0].id, documentName: input.name },
			{
				resourceType: 'tax_document',
				resourceId: result[0].id,
				resourceName: input.name,
				riskLevel: 'low',
			}
		);

		// Invalidate cache
		await this.invalidateTaxCache(input.userId, input.year);

		return result[0];
	}

	/**
	 * Soft delete document
	 */
	async deleteDocument(id: string, userId: string): Promise<void> {
		const results = await db
			.select()
			.from(taxDocuments)
			.where(
				and(
					eq(taxDocuments.id, id),
					eq(taxDocuments.userId, userId),
					isNull(taxDocuments.deletedAt)
				)
			)
			.limit(1);

		if (results.length === 0) {
			throw new Error("Tax document not found");
		}

		const document = results[0];
		
		await db
			.update(taxDocuments)
			.set({ deletedAt: new Date() })
			.where(and(eq(taxDocuments.id, id), eq(taxDocuments.userId, userId)));

		// Audit log
		await AuditService.logEvent(
			userId,
			'tax_document_deleted',
			'delete',
			{ documentId: id, documentName: document.name },
			{
				resourceType: 'tax_document',
				resourceId: id,
				resourceName: document.name,
				riskLevel: 'low',
			}
		);

		// Invalidate cache
		await this.invalidateTaxCache(userId, document.year);
	}

	/**
	 * Restore soft-deleted tax document
	 */
	async restoreDocument(id: string, userId: string): Promise<TaxDocument> {
		const result = await db
			.update(taxDocuments)
			.set({ deletedAt: null })
			.where(and(eq(taxDocuments.id, id), eq(taxDocuments.userId, userId)))
			.returning();

		if (result.length === 0) {
			throw new Error("Tax document not found");
		}

		// Audit log
		await AuditService.logEvent(
			userId,
			'tax_document_restored',
			'restore',
			{ documentId: id },
			{
				resourceType: 'tax_document',
				resourceId: id,
				riskLevel: 'low',
			}
		);

		// Invalidate cache
		await this.invalidateTaxCache(userId, result[0].year);

		return result[0];
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
				.where(
					and(
						eq(taxObligations.userId, userId),
						eq(taxObligations.year, currentYear),
						isNull(taxObligations.deletedAt)
					)
				),
			// Get deductions summary in one query (excluding soft-deleted)
			db
				.select({
					totalDeductions: sql<number>`COALESCE(SUM(amount::numeric), 0)::numeric`,
				})
				.from(taxDeductions)
				.where(
					and(
						eq(taxDeductions.userId, userId),
						eq(taxDeductions.year, currentYear),
						isNull(taxDeductions.deletedAt)
					)
				),
			// Get obligations by type breakdown
			db
				.select({
					type: taxObligations.type,
					count: sql<number>`COUNT(*)::int`,
				})
				.from(taxObligations)
				.where(
					and(
						eq(taxObligations.userId, userId),
						eq(taxObligations.year, currentYear),
						isNull(taxObligations.deletedAt)
					)
				)
				.groupBy(taxObligations.type),
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

		// Build obligationsByType from type breakdown
		const obligationsByType: Record<string, number> = {};
		for (const item of typeBreakdown) {
			obligationsByType[item.type] = item.count;
		}

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
	 * Optimized with single query and caching (2 minute TTL)
	 */
	async getTaxAlerts(userId: string, filters?: TaxAlertFilters): Promise<TaxAlert[] | PaginatedResult<TaxAlert>> {
		const cacheKey = `tax:alerts:${userId}`;
		
		// Try cache first (2 minute TTL - alerts change frequently)
		const alerts = await cache.getOrSet(
			cacheKey,
			async () => {
				return await this._getTaxAlertsInternal(userId);
			},
			{ ttl: 120, namespace: 'tax' }
		);

		// Apply pagination if requested
		if (filters?.limit !== undefined) {
			const limit = Math.min(filters.limit || 50, 100);
			const offset = filters.offset || 0;
			const page = Math.floor(offset / limit) + 1;
			const totalPages = Math.ceil(alerts.length / limit);

			return {
				data: alerts.slice(offset, offset + limit),
				total: alerts.length,
				page,
				limit,
				totalPages,
			};
		}

		return alerts;
	}

	/**
	 * Internal method to get tax alerts (without cache)
	 * Optimized to use single query instead of N+1
	 */
	private async _getTaxAlertsInternal(userId: string): Promise<TaxAlert[]> {
		const alerts: TaxAlert[] = [];
		const now = new Date();

		// Get all obligations in single query (optimized)
		const obligationsResult = await this.getObligations(userId);
		const obligations = Array.isArray(obligationsResult) 
			? obligationsResult 
			: obligationsResult.data;

		// Process obligations
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

		// Info alert for tax documents (optimized - single query)
		const currentYear = new Date().getFullYear();
		const documentsResult = await this.getDocuments(userId, currentYear);
		const documents = Array.isArray(documentsResult)
			? documentsResult
			: documentsResult.data;
		
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

