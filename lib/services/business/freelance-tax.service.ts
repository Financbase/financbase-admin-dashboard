/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { and, desc, eq, gte, lte, sql, sum } from "drizzle-orm";
import {
	ArrowUp,
	Briefcase,
	Calendar,
	Clock,
	CreditCard,
	DollarSign,
	FileText,
	Filter,
	TrendingDown,
} from "lucide-react";
import { db } from "@/lib/db";
import { propertyIncome, invoices, projects, expenses, timeEntries } from "@/lib/db/schemas";
import type { Project } from "@/lib/db/schemas";

export interface TaxCalculation {
	grossIncome: number;
	businessExpenses: number;
	netIncome: number;
	estimatedTax: number;
	quarterlyPayment: number;
	taxSavings: number;
}

export interface DeductionCategory {
	category: string;
	amount: number;
	description: string;
	isMaximized: boolean;
}

export interface QuarterlyEstimate {
	quarter: number;
	year: number;
	estimatedIncome: number;
	estimatedTax: number;
	dueDate: Date;
	isPaid: boolean;
	paymentAmount?: number;
	paymentDate?: Date;
}

export interface TaxOptimization {
	totalDeductions: number;
	potentialSavings: number;
	recommendations: string[];
	quarterlyEstimates: QuarterlyEstimate[];
	taxDeadlines: Array<{
		description: string;
		dueDate: Date;
		amount: number;
		isOverdue: boolean;
	}>;
}

export class FreelanceTaxService {
	/**
	 * Calculate tax liability for a given period
	 */
	async calculateTaxLiability(
		userId: string,
		startDate: Date,
		endDate: Date,
		taxRate = 0.25, // Default 25% for freelancers
	): Promise<TaxCalculation> {
		// Get gross income for the period
		const incomeResult = await db
			.select({ total: sum(income.amount) })
			.from(income)
			.where(
				and(
					eq(income.userId, userId),
					gte(income.date, startDate),
					lte(income.date, endDate),
				),
			);

		// Get business expenses for the period
		const expensesResult = await db
			.select({ total: sum(projectExpenses.amount) })
			.from(projectExpenses)
			.where(
				and(
					eq(projectExpenses.userId, userId),
					gte(projectExpenses.date, startDate),
					lte(projectExpenses.date, endDate),
				),
			);

		const grossIncome = Number.parseFloat(incomeResult[0]?.total || "0");
		const businessExpenses = Number.parseFloat(expensesResult[0]?.total || "0");
		const netIncome = grossIncome - businessExpenses;
		const estimatedTax = netIncome * taxRate;
		const quarterlyPayment = estimatedTax / 4;
		const taxSavings = businessExpenses * taxRate;

		return {
			grossIncome,
			businessExpenses,
			netIncome,
			estimatedTax,
			quarterlyPayment,
			taxSavings,
		};
	}

	/**
	 * Get deduction categories and amounts
	 */
	async getDeductionCategories(
		userId: string,
		startDate: Date,
		endDate: Date,
	): Promise<DeductionCategory[]> {
		// Get expenses grouped by category
		const expenseCategories = await db
			.select({
				category: projectExpenses.category,
				amount: sum(projectExpenses.amount),
			})
			.from(projectExpenses)
			.where(
				and(
					eq(projectExpenses.userId, userId),
					gte(projectExpenses.date, startDate),
					lte(projectExpenses.date, endDate),
				),
			)
			.groupBy(projectExpenses.category);

		const deductions: DeductionCategory[] = [];

		for (const category of expenseCategories) {
			const amount = Number.parseFloat(category.amount || "0");
			const isMaximized = this.isDeductionMaximized(category.category, amount);

			deductions.push({
				category: category.category,
				amount,
				description: this.getDeductionDescription(category.category),
				isMaximized,
			});
		}

		return deductions;
	}

	/**
	 * Generate quarterly tax estimates
	 */
	async generateQuarterlyEstimates(
		userId: string,
		year: number,
	): Promise<QuarterlyEstimate[]> {
		const quarters = [
			{
				quarter: 1,
				startDate: new Date(year, 0, 1),
				endDate: new Date(year, 2, 31),
			},
			{
				quarter: 2,
				startDate: new Date(year, 3, 1),
				endDate: new Date(year, 5, 30),
			},
			{
				quarter: 3,
				startDate: new Date(year, 6, 1),
				endDate: new Date(year, 8, 30),
			},
			{
				quarter: 4,
				startDate: new Date(year, 9, 1),
				endDate: new Date(year, 11, 31),
			},
		];

		const estimates: QuarterlyEstimate[] = [];

		for (const q of quarters) {
			const taxCalc = await this.calculateTaxLiability(
				userId,
				q.startDate,
				q.endDate,
			);

			estimates.push({
				quarter: q.quarter,
				year,
				estimatedIncome: taxCalc.netIncome,
				estimatedTax: taxCalc.estimatedTax,
				dueDate: this.getQuarterlyDueDate(q.quarter, year),
				isPaid: false, // This would need to be tracked in a separate table
			});
		}

		return estimates;
	}

	/**
	 * Get tax optimization recommendations
	 */
	async getTaxOptimization(
		userId: string,
		startDate: Date,
		endDate: Date,
	): Promise<TaxOptimization> {
		const deductions = await this.getDeductionCategories(
			userId,
			startDate,
			endDate,
		);
		const quarterlyEstimates = await this.generateQuarterlyEstimates(
			userId,
			startDate.getFullYear(),
		);

		const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
		const potentialSavings = totalDeductions * 0.25; // 25% tax rate

		const recommendations = this.generateTaxRecommendations(deductions);
		const taxDeadlines = this.getTaxDeadlines(startDate.getFullYear());

		return {
			totalDeductions,
			potentialSavings,
			recommendations,
			quarterlyEstimates,
			taxDeadlines,
		};
	}

	/**
	 * Track quarterly tax payments
	 * Creates or updates a tax obligation for the quarterly payment
	 */
	async recordQuarterlyPayment(
		userId: string,
		quarter: number,
		year: number,
		amount: number,
		paymentDate: Date,
		paymentMethod?: string,
		reference?: string,
	): Promise<void> {
		// Validate quarter
		if (quarter < 1 || quarter > 4) {
			throw new Error('Quarter must be between 1 and 4');
		}

		// Validate date
		if (paymentDate > new Date()) {
			throw new Error('Payment date cannot be in the future');
		}

		const { TaxService } = await import("./tax-service");
		const { db } = await import("../db/connection");
		const { taxPayments } = await import("../db/schemas");
		const { withTransaction } = await import("../../utils/db-transaction");
		const { eq, and } = await import("drizzle-orm");
		const taxService = new TaxService();

		const quarterLabel = `Q${quarter} ${year}`;
		const dueDate = this.getQuarterlyDueDate(quarter, year);

		return await withTransaction(async (tx) => {
			// Check if obligation already exists for this quarter
			const existingObligations = await taxService.getObligations(userId, {
				quarter: quarterLabel,
				year,
				type: "self_employment",
			});

			// Handle array or paginated result
			const obligations = Array.isArray(existingObligations)
				? existingObligations
				: existingObligations.data || [];

			let obligationId: string;

			if (obligations.length > 0) {
				obligationId = obligations[0].id;
			} else {
				// Create new obligation for quarterly payment
				const newObligation = await taxService.createObligation({
					userId,
					name: `Q${quarter} ${year} Estimated Tax Payment`,
					type: "self_employment",
					amount,
					dueDate: dueDate.toISOString(),
					status: "pending",
				quarter: quarterLabel,
				year,
				notes: `Quarterly estimated tax payment for ${quarterLabel}`,
			});

			// Record the payment
			const newObligations = await taxService.getObligations(userId, {
				quarter: quarterLabel,
				year,
				type: "self_employment",
			});
			const newObligationsList = Array.isArray(newObligations)
				? newObligations
				: newObligations.data;

			if (newObligationsList.length > 0) {
				await taxService.recordPayment(
					{
						obligationId: newObligationsList[0].id,
						amount,
						paymentDate: paymentDate.toISOString(),
						paymentMethod: "quarterly_estimate",
						notes: `Quarterly estimated tax payment for ${quarterLabel}`,
					},
					userId
				);
			}
		}
	}

	/**
	 * Get tax document requirements
	 */
	async getTaxDocumentRequirements(
		userId: string,
		year: number,
	): Promise<{
		requiredDocuments: string[];
		completedDocuments: string[];
		missingDocuments: string[];
	}> {
		const requiredDocuments = [
			"1099 forms from clients",
			"Business expense receipts",
			"Mileage logs",
			"Home office deduction documentation",
			"Equipment depreciation records",
			"Professional development expenses",
			"Health insurance premiums",
			"Retirement contributions",
		];

		// This would check against actual data to see what's completed
		const completedDocuments = [
			"Business expense receipts",
			"Equipment depreciation records",
		];

		const missingDocuments = requiredDocuments.filter(
			(doc) => !completedDocuments.includes(doc),
		);

		return {
			requiredDocuments,
			completedDocuments,
			missingDocuments,
		};
	}

	/**
	 * Calculate home office deduction
	 */
	async calculateHomeOfficeDeduction(
		userId: string,
		homeOfficeSquareFeet: number,
		totalHomeSquareFeet: number,
		totalHomeExpenses: number,
	): Promise<{
		percentage: number;
		deduction: number;
		method: "simplified" | "actual";
	}> {
		const percentage = (homeOfficeSquareFeet / totalHomeSquareFeet) * 100;

		// Simplified method: $5 per square foot up to 300 sq ft
		const simplifiedDeduction = Math.min(homeOfficeSquareFeet, 300) * 5;

		// Actual method: percentage of home expenses
		const actualDeduction = (percentage / 100) * totalHomeExpenses;

		const method =
			simplifiedDeduction > actualDeduction ? "simplified" : "actual";
		const deduction =
			method === "simplified" ? simplifiedDeduction : actualDeduction;

		return {
			percentage,
			deduction,
			method,
		};
	}

	/**
	 * Get mileage deduction
	 */
	async calculateMileageDeduction(
		userId: string,
		startDate: Date,
		endDate: Date,
		businessMiles: number,
		mileageRate = 0.655, // 2023 rate
	): Promise<{
		totalMiles: number;
		deduction: number;
		rate: number;
	}> {
		// Get actual business miles from time entries or expense records
		const mileageExpenses = await db
			.select({ amount: sum(projectExpenses.amount) })
			.from(projectExpenses)
			.where(
				and(
					eq(projectExpenses.userId, userId),
					eq(projectExpenses.category, "travel"),
					gte(projectExpenses.date, startDate),
					lte(projectExpenses.date, endDate),
				),
			);

		const deduction = businessMiles * mileageRate;

		return {
			totalMiles: businessMiles,
			deduction,
			rate: mileageRate,
		};
	}

	// Helper methods
	private isDeductionMaximized(category: string, amount: number): boolean {
		const limits: Record<string, number> = {
			meals: 50, // 50% of meal expenses
			entertainment: 0, // No longer deductible
			home_office: 1500, // Simplified method limit
			vehicle: 10000, // Depends on business use percentage
		};

		const limit = limits[category];
		return limit ? amount >= limit : false;
	}

	private getDeductionDescription(category: string): string {
		const descriptions: Record<string, string> = {
			office_supplies: "Office supplies and equipment",
			travel: "Business travel expenses",
			meals: "Business meals (50% deductible)",
			software: "Business software and subscriptions",
			marketing: "Marketing and advertising expenses",
			utilities: "Business utilities",
			rent: "Office rent and lease payments",
			equipment: "Business equipment and depreciation",
			professional_services: "Professional services and consulting",
			home_office: "Home office expenses",
			vehicle: "Vehicle expenses and mileage",
			education: "Professional development and education",
			insurance: "Business insurance premiums",
			other: "Other business expenses",
		};

		return descriptions[category] || "Business expense";
	}

	private generateTaxRecommendations(
		deductions: DeductionCategory[],
	): string[] {
		const recommendations: string[] = [];

		// Check for missing common deductions
		const commonDeductions = [
			"home_office",
			"vehicle",
			"education",
			"insurance",
		];
		const currentCategories = deductions.map((d) => d.category);

		for (const deduction of commonDeductions) {
			if (!currentCategories.includes(deduction)) {
				recommendations.push(
					`Consider tracking ${deduction.replace("_", " ")} expenses for additional deductions`,
				);
			}
		}

		// Check for under-utilized deductions
		for (const deduction of deductions) {
			if (!deduction.isMaximized && deduction.amount > 0) {
				recommendations.push(
					`Maximize ${deduction.category.replace("_", " ")} deductions - currently at $${deduction.amount.toFixed(2)}`,
				);
			}
		}

		// General recommendations
		recommendations.push("Keep detailed receipts for all business expenses");
		recommendations.push("Consider quarterly tax payments to avoid penalties");
		recommendations.push("Track business mileage for vehicle deductions");

		return recommendations;
	}

	private getQuarterlyDueDate(quarter: number, year: number): Date {
		const dueDates = [
			new Date(year, 3, 15), // Q1: April 15
			new Date(year, 5, 15), // Q2: June 15
			new Date(year, 8, 15), // Q3: September 15
			new Date(year, 0, 15), // Q4: January 15 (next year)
		];

		return dueDates[quarter - 1];
	}

	private getTaxDeadlines(year: number): Array<{
		description: string;
		dueDate: Date;
		amount: number;
		isOverdue: boolean;
	}> {
		const now = new Date();
		const deadlines = [
			{
				description: "Q1 Estimated Tax Payment",
				dueDate: new Date(year, 3, 15),
				amount: 0, // Would be calculated
				isOverdue: false,
			},
			{
				description: "Q2 Estimated Tax Payment",
				dueDate: new Date(year, 5, 15),
				amount: 0,
				isOverdue: false,
			},
			{
				description: "Q3 Estimated Tax Payment",
				dueDate: new Date(year, 8, 15),
				amount: 0,
				isOverdue: false,
			},
			{
				description: "Q4 Estimated Tax Payment",
				dueDate: new Date(year + 1, 0, 15),
				amount: 0,
				isOverdue: false,
			},
		];

		return deadlines.map((deadline) => ({
			...deadline,
			isOverdue: deadline.dueDate < now,
		}));
	}
}
