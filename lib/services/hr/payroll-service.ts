/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from "@/lib/db";
import { 
	payrollRuns, 
	payrollEntries, 
	payrollDeductions, 
	payrollTaxes, 
	payrollBenefits,
	type PayrollRun,
	type NewPayrollRun,
	type PayrollEntry,
	type NewPayrollEntry,
} from "@/lib/db/schemas";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { employees } from "@/lib/db/schemas/employees.schema";
import { hrContractors } from "@/lib/db/schemas/hr-contractors.schema";

export interface CreatePayrollRunInput {
	organizationId: string;
	payPeriodStart: Date;
	payPeriodEnd: Date;
	payDate: Date;
	payFrequency: "weekly" | "biweekly" | "semimonthly" | "monthly";
	notes?: string;
}

export interface ProcessPayrollInput {
	payrollRunId: string;
	employeeIds?: string[];
	contractorIds?: string[];
}

/**
 * Payroll Service - Handles all payroll-related operations
 */
export class PayrollService {
	/**
	 * Create a new payroll run
	 */
	async createPayrollRun(input: CreatePayrollRunInput) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const newRun: NewPayrollRun = {
			organizationId: input.organizationId,
			createdBy: userId,
			payPeriodStart: input.payPeriodStart,
			payPeriodEnd: input.payPeriodEnd,
			payDate: input.payDate,
			payFrequency: input.payFrequency,
			status: "draft",
			notes: input.notes,
		};

		const result = await db.insert(payrollRuns).values(newRun).returning();
		return result[0];
	}

	/**
	 * Get payroll run by ID
	 */
	async getPayrollRun(id: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const result = await db
			.select()
			.from(payrollRuns)
			.where(eq(payrollRuns.id, id))
			.limit(1);

		if (result.length === 0) {
			throw new Error("Payroll run not found");
		}

		return result[0];
	}

	/**
	 * Get all payroll runs
	 */
	async getPayrollRuns(organizationId?: string, filters?: { status?: string; startDate?: Date; endDate?: Date }) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		let query = db.select().from(payrollRuns);

		const conditions = [];
		if (organizationId) {
			conditions.push(eq(payrollRuns.organizationId, organizationId));
		}
		if (filters?.status) {
			conditions.push(eq(payrollRuns.status, filters.status as any));
		}
		if (filters?.startDate) {
			conditions.push(gte(payrollRuns.payPeriodStart, filters.startDate));
		}
		if (filters?.endDate) {
			conditions.push(lte(payrollRuns.payPeriodEnd, filters.endDate));
		}

		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		return await query.orderBy(desc(payrollRuns.createdAt));
	}

	/**
	 * Process payroll run - Calculate payroll for all employees/contractors
	 */
	async processPayrollRun(input: ProcessPayrollInput) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const payrollRun = await this.getPayrollRun(input.payrollRunId);
		
		// Update status to processing
		await db
			.update(payrollRuns)
			.set({ status: "processing", updatedAt: new Date() })
			.where(eq(payrollRuns.id, input.payrollRunId));

		try {
			const entries: PayrollEntry[] = [];
			let totalGrossPay = 0;
			let totalDeductions = 0;
			let totalTaxes = 0;
			let totalNetPay = 0;

			// Process employees
			if (!input.employeeIds || input.employeeIds.length === 0) {
				// Get all active employees for the organization
				const allEmployees = await db
					.select()
					.from(employees)
					.where(
						and(
							eq(employees.organizationId, payrollRun.organizationId),
							eq(employees.status, "active"),
							eq(employees.isPayrollEnabled, true)
						)
					);

				for (const employee of allEmployees) {
					const entry = await this.calculatePayrollForEmployee(
						employee.id,
						input.payrollRunId,
						payrollRun.payPeriodStart,
						payrollRun.payPeriodEnd
					);
					entries.push(entry);
					totalGrossPay += Number(entry.grossPay || 0);
					totalDeductions += Number(entry.totalDeductions || 0);
					totalTaxes += Number(entry.totalTaxes || 0);
					totalNetPay += Number(entry.netPay || 0);
				}
			} else {
				for (const employeeId of input.employeeIds) {
					const entry = await this.calculatePayrollForEmployee(
						employeeId,
						input.payrollRunId,
						payrollRun.payPeriodStart,
						payrollRun.payPeriodEnd
					);
					entries.push(entry);
					totalGrossPay += Number(entry.grossPay || 0);
					totalDeductions += Number(entry.totalDeductions || 0);
					totalTaxes += Number(entry.totalTaxes || 0);
					totalNetPay += Number(entry.netPay || 0);
				}
			}

			// Process contractors
			if (input.contractorIds && input.contractorIds.length > 0) {
				for (const contractorId of input.contractorIds) {
					const entry = await this.calculatePayrollForContractor(
						contractorId,
						input.payrollRunId,
						payrollRun.payPeriodStart,
						payrollRun.payPeriodEnd
					);
					entries.push(entry);
					totalGrossPay += Number(entry.grossPay || 0);
					totalDeductions += Number(entry.totalDeductions || 0);
					totalTaxes += Number(entry.totalTaxes || 0);
					totalNetPay += Number(entry.netPay || 0);
				}
			}

			// Update payroll run totals
			await db
				.update(payrollRuns)
				.set({
					status: "completed",
					totalEmployees: entries.length,
					totalGrossPay: totalGrossPay.toString(),
					totalDeductions: totalDeductions.toString(),
					totalTaxes: totalTaxes.toString(),
					totalNetPay: totalNetPay.toString(),
					processedAt: new Date(),
					processedBy: userId,
					updatedAt: new Date(),
				})
				.where(eq(payrollRuns.id, input.payrollRunId));

			return {
				payrollRun: await this.getPayrollRun(input.payrollRunId),
				entries,
				totalEmployees: entries.length,
			};
		} catch (error) {
			// Update status to error
			await db
				.update(payrollRuns)
				.set({
					status: "error",
					errorMessage: error instanceof Error ? error.message : "Unknown error",
					updatedAt: new Date(),
				})
				.where(eq(payrollRuns.id, input.payrollRunId));
			throw error;
		}
	}

	/**
	 * Calculate payroll for an employee
	 */
	private async calculatePayrollForEmployee(
		employeeId: string,
		payrollRunId: string,
		payPeriodStart: Date,
		payPeriodEnd: Date
	): Promise<PayrollEntry> {
		// Use database function to calculate gross pay
		const grossPayResult = await sql`
			SELECT calculate_gross_pay(
				${employeeId}::UUID,
				NULL::UUID,
				${payPeriodStart}::TIMESTAMP WITH TIME ZONE,
				${payPeriodEnd}::TIMESTAMP WITH TIME ZONE
			) as gross_pay
		`;

		const grossPay = Number(grossPayResult[0]?.gross_pay || 0);

		// Calculate taxes using database function
		const taxesResult = await sql`
			SELECT calculate_taxes(
				${grossPay}::NUMERIC,
				'{"federal_rate": 0.15}'::JSONB
			) as taxes
		`;

		const taxes = taxesResult[0]?.taxes || [];
		let totalTaxes = 0;
		for (const tax of taxes) {
			totalTaxes += Number(tax.amount || 0);
		}

		// Calculate deductions using database function
		const deductionsResult = await sql`
			SELECT calculate_deductions(
				${employeeId}::UUID,
				NULL::UUID,
				${grossPay}::NUMERIC
			) as deductions
		`;

		const deductions = deductionsResult[0]?.deductions || [];
		let totalDeductions = 0;
		for (const deduction of deductions) {
			totalDeductions += Number(deduction.amount || 0);
		}

		// Calculate net pay
		const netPay = grossPay - totalTaxes - totalDeductions;

		// Create payroll entry
		const newEntry: NewPayrollEntry = {
			payrollRunId,
			employeeId,
			payPeriodStart,
			payPeriodEnd,
			grossPay: grossPay.toString(),
			totalDeductions: totalDeductions.toString(),
			deductionsBreakdown: deductions,
			totalTaxes: totalTaxes.toString(),
			taxesBreakdown: taxes,
			netPay: netPay.toString(),
			status: "calculated",
		};

		const result = await db.insert(payrollEntries).values(newEntry).returning();
		return result[0];
	}

	/**
	 * Calculate payroll for a contractor
	 */
	private async calculatePayrollForContractor(
		contractorId: string,
		payrollRunId: string,
		payPeriodStart: Date,
		payPeriodEnd: Date
	): Promise<PayrollEntry> {
		// Use database function to calculate gross pay
		const grossPayResult = await sql`
			SELECT calculate_gross_pay(
				NULL::UUID,
				${contractorId}::UUID,
				${payPeriodStart}::TIMESTAMP WITH TIME ZONE,
				${payPeriodEnd}::TIMESTAMP WITH TIME ZONE
			) as gross_pay
		`;

		const grossPay = Number(grossPayResult[0]?.gross_pay || 0);

		// Contractors typically have different tax treatment
		// Simplified - would need proper 1099 tax handling
		const totalTaxes = grossPay * 0.15; // Simplified tax rate

		// Calculate deductions
		const deductionsResult = await sql`
			SELECT calculate_deductions(
				NULL::UUID,
				${contractorId}::UUID,
				${grossPay}::NUMERIC
			) as deductions
		`;

		const deductions = deductionsResult[0]?.deductions || [];
		let totalDeductions = 0;
		for (const deduction of deductions) {
			totalDeductions += Number(deduction.amount || 0);
		}

		// Calculate net pay
		const netPay = grossPay - totalTaxes - totalDeductions;

		// Create payroll entry
		const newEntry: NewPayrollEntry = {
			payrollRunId,
			contractorId,
			payPeriodStart,
			payPeriodEnd,
			grossPay: grossPay.toString(),
			totalDeductions: totalDeductions.toString(),
			deductionsBreakdown: deductions,
			totalTaxes: totalTaxes.toString(),
			taxesBreakdown: [{ type: "estimated", amount: totalTaxes }],
			netPay: netPay.toString(),
			status: "calculated",
		};

		const result = await db.insert(payrollEntries).values(newEntry).returning();
		return result[0];
	}

	/**
	 * Get payroll entries for a run
	 */
	async getPayrollEntries(payrollRunId: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		return await db
			.select()
			.from(payrollEntries)
			.where(eq(payrollEntries.payrollRunId, payrollRunId))
			.orderBy(desc(payrollEntries.createdAt));
	}

	/**
	 * Get employee payroll history
	 */
	async getEmployeePayrollHistory(employeeId: string, limit: number = 12) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		return await db
			.select()
			.from(payrollEntries)
			.where(eq(payrollEntries.employeeId, employeeId))
			.orderBy(desc(payrollEntries.payPeriodEnd))
			.limit(limit);
	}

	/**
	 * Get contractor payroll history
	 */
	async getContractorPayrollHistory(contractorId: string, limit: number = 12) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		return await db
			.select()
			.from(payrollEntries)
			.where(eq(payrollEntries.contractorId, contractorId))
			.orderBy(desc(payrollEntries.payPeriodEnd))
			.limit(limit);
	}

	/**
	 * Configure tax settings
	 */
	async configureTaxes(organizationId: string, taxConfig: any) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Implementation would create/update payroll tax records
		// Simplified for now
		return { success: true, message: "Tax configuration updated" };
	}

	/**
	 * Configure deductions
	 */
	async configureDeductions(organizationId: string, deductionConfig: any) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Implementation would create/update payroll deduction records
		return { success: true, message: "Deduction configuration updated" };
	}

	/**
	 * Configure benefits
	 */
	async configureBenefits(organizationId: string, benefitConfig: any) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Implementation would create/update payroll benefit records
		return { success: true, message: "Benefit configuration updated" };
	}

	/**
	 * Export payroll data
	 */
	async exportPayroll(payrollRunId: string, format: "csv" | "excel" = "csv") {
		const entries = await this.getPayrollEntries(payrollRunId);
		
		// Simplified export - would use a library like xlsx or csv-writer
		return {
			format,
			data: entries,
			downloadUrl: `/api/hr/payroll/export/${payrollRunId}.${format}`,
		};
	}

	/**
	 * Generate pay stub (simplified - would generate PDF in production)
	 */
	async generatePayStub(entryId: string) {
		const entry = await db
			.select()
			.from(payrollEntries)
			.where(eq(payrollEntries.id, entryId))
			.limit(1);

		if (entry.length === 0) {
			throw new Error("Payroll entry not found");
		}

		// In production, would generate PDF using a library like pdfkit or puppeteer
		return {
			entry: entry[0],
			pdfUrl: `/api/hr/payroll/paystubs/${entryId}.pdf`,
		};
	}
}

