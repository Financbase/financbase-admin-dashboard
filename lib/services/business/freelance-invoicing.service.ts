/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { and, desc, eq, gte, lte, sql, sum } from "drizzle-orm";
import { Briefcase, Clock, Key, Save, TrendingDown } from "lucide-react";
import { db } from "../db/connection";
import { clients, invoiceLineItems, invoices } from "../db/schema-actual";
import {
	type Project,
	type ProjectExpense,
	type ProjectTimeEntry,
	projectExpenses,
	projectMilestones,
	projectTimeEntries,
	projects,
	retainers,
} from "../db/schema-freelance";

export interface InvoiceGenerationOptions {
	projectId?: string;
	clientId: string;
	invoiceType:
		| "time_based"
		| "milestone_based"
		| "retainer"
		| "expense_reimbursement";
	startDate: Date;
	endDate: Date;
	includeExpenses?: boolean;
	customLineItems?: Array<{
		description: string;
		quantity: number;
		unitPrice: number;
	}>;
}

export interface GeneratedInvoiceData {
	invoiceNumber: string;
	lineItems: Array<{
		description: string;
		quantity: string;
		unitPrice: string;
		amount: string;
	}>;
	subtotal: string;
	taxRate: string;
	taxAmount: string;
	total: string;
	notes?: string;
}

export class FreelanceInvoicingService {
	/**
	 * Generate invoice from time entries
	 */
	async generateTimeBasedInvoice(
		options: InvoiceGenerationOptions,
	): Promise<GeneratedInvoiceData> {
		const {
			projectId,
			clientId,
			startDate,
			endDate,
			includeExpenses = true,
		} = options;

		// Get unbilled time entries
		const timeEntries = await db
			.select()
			.from(projectTimeEntries)
			.where(
				and(
					eq(projectTimeEntries.userId, options.clientId), // This should be userId, not clientId
					projectId ? eq(projectTimeEntries.projectId, projectId) : sql`1=1`,
					eq(projectTimeEntries.isBillable, true),
					eq(projectTimeEntries.isBilled, false),
					gte(projectTimeEntries.startTime, startDate),
					lte(projectTimeEntries.startTime, endDate),
				),
			);

		// Get unbilled expenses if requested
		let expenses: ProjectExpense[] = [];
		if (includeExpenses) {
			expenses = await db
				.select()
				.from(projectExpenses)
				.where(
					and(
						eq(projectExpenses.userId, options.clientId), // This should be userId
						projectId ? eq(projectExpenses.projectId, projectId) : sql`1=1`,
						eq(projectExpenses.isBillable, true),
						gte(projectExpenses.date, startDate),
						lte(projectExpenses.date, endDate),
					),
				);
		}

		// Group time entries by category/description
		const timeGroups = this.groupTimeEntries(timeEntries);

		// Create line items
		const lineItems = [];

		// Add time-based line items
		for (const [description, entries] of timeGroups.entries()) {
			const totalHours =
				entries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 3600;
			const averageRate =
				entries.reduce(
					(sum, entry) => sum + Number.parseFloat(entry.hourlyRate || "0"),
					0,
				) / entries.length;
			const amount = totalHours * averageRate;

			lineItems.push({
				description: `${description} (${totalHours.toFixed(2)} hours)`,
				quantity: totalHours.toFixed(2),
				unitPrice: averageRate.toFixed(2),
				amount: amount.toFixed(2),
			});
		}

		// Add expense line items
		for (const expense of expenses) {
			lineItems.push({
				description: `Reimbursable: ${expense.description}`,
				quantity: "1",
				unitPrice: expense.amount,
				amount: expense.amount,
			});
		}

		// Add custom line items
		if (options.customLineItems) {
			for (const item of options.customLineItems) {
				const amount = item.quantity * item.unitPrice;
				lineItems.push({
					description: item.description,
					quantity: item.quantity.toString(),
					unitPrice: item.unitPrice.toFixed(2),
					amount: amount.toFixed(2),
				});
			}
		}

		// Calculate totals
		const subtotal = lineItems.reduce(
			(sum, item) => sum + Number.parseFloat(item.amount),
			0,
		);
		const taxRate = 0.1; // 10% tax rate - should be configurable
		const taxAmount = subtotal * taxRate;
		const total = subtotal + taxAmount;

		// Generate invoice number
		const invoiceNumber = await this.generateInvoiceNumber();

		return {
			invoiceNumber,
			lineItems,
			subtotal: subtotal.toFixed(2),
			taxRate: (taxRate * 100).toFixed(2),
			taxAmount: taxAmount.toFixed(2),
			total: total.toFixed(2),
			notes: this.generateInvoiceNotes(options),
		};
	}

	/**
	 * Generate invoice from project milestones
	 */
	async generateMilestoneInvoice(
		options: InvoiceGenerationOptions,
	): Promise<GeneratedInvoiceData> {
		const { projectId, clientId, startDate, endDate } = options;

		// Get completed milestones in the period
		const milestones = await db
			.select()
			.from(projectMilestones)
			.innerJoin(projects, eq(projectMilestones.projectId, projects.id))
			.where(
				and(
					eq(projects.userId, options.clientId), // This should be userId
					eq(projects.clientId, clientId),
					projectId ? eq(projectMilestones.projectId, projectId) : sql`1=1`,
					eq(projectMilestones.status, "completed"),
					gte(projectMilestones.completedDate, startDate),
					lte(projectMilestones.completedDate, endDate),
				),
			);

		const lineItems = milestones.map((milestone) => ({
			description: milestone.projectMilestones.name,
			quantity: "1",
			unitPrice: milestone.projectMilestones.milestoneValue || "0",
			amount: milestone.projectMilestones.milestoneValue || "0",
		}));

		const subtotal = lineItems.reduce(
			(sum, item) => sum + Number.parseFloat(item.amount),
			0,
		);
		const taxRate = 0.1;
		const taxAmount = subtotal * taxRate;
		const total = subtotal + taxAmount;

		return {
			invoiceNumber: await this.generateInvoiceNumber(),
			lineItems,
			subtotal: subtotal.toFixed(2),
			taxRate: (taxRate * 100).toFixed(2),
			taxAmount: taxAmount.toFixed(2),
			total: total.toFixed(2),
			notes: "Milestone-based invoice for completed deliverables.",
		};
	}

	/**
	 * Generate retainer invoice
	 */
	async generateRetainerInvoice(
		options: InvoiceGenerationOptions,
	): Promise<GeneratedInvoiceData> {
		const { clientId, startDate, endDate } = options;

		// Get active retainer for client
		const retainer = await db
			.select()
			.from(retainers)
			.where(
				and(
					eq(retainers.userId, options.clientId), // This should be userId
					eq(retainers.clientId, clientId),
					eq(retainers.status, "active"),
					lte(retainers.nextBillingDate, endDate),
				),
			)
			.limit(1);

		if (!retainer.length) {
			throw new Error("No active retainer found for client");
		}

		const retainerData = retainer[0];
		const lineItems = [
			{
				description: `Retainer: ${retainerData.name} (${retainerData.billingCycle})`,
				quantity: "1",
				unitPrice: retainerData.amount,
				amount: retainerData.amount,
			},
		];

		// Add overage if applicable
		if (retainerData.hoursUsed > (retainerData.hoursIncluded || 0)) {
			const overageHours =
				retainerData.hoursUsed - (retainerData.hoursIncluded || 0);
			const overageAmount =
				overageHours * Number.parseFloat(retainerData.overageRate || "0");

			if (overageAmount > 0) {
				lineItems.push({
					description: `Overage: ${overageHours} hours @ $${retainerData.overageRate}/hour`,
					quantity: overageHours.toString(),
					unitPrice: retainerData.overageRate,
					amount: overageAmount.toFixed(2),
				});
			}
		}

		const subtotal = lineItems.reduce(
			(sum, item) => sum + Number.parseFloat(item.amount),
			0,
		);
		const taxRate = 0.1;
		const taxAmount = subtotal * taxRate;
		const total = subtotal + taxAmount;

		return {
			invoiceNumber: await this.generateInvoiceNumber(),
			lineItems,
			subtotal: subtotal.toFixed(2),
			taxRate: (taxRate * 100).toFixed(2),
			taxAmount: taxAmount.toFixed(2),
			total: total.toFixed(2),
			notes: `Retainer billing for ${retainerData.billingCycle} period.`,
		};
	}

	/**
	 * Create and save invoice
	 */
	async createInvoice(
		userId: string,
		invoiceData: GeneratedInvoiceData,
		clientId: string,
		projectId?: string,
	): Promise<string> {
		// Create invoice
		const [newInvoice] = await db
			.insert(invoices)
			.values({
				userId,
				clientId,
				projectId,
				invoiceNumber: invoiceData.invoiceNumber,
				status: "draft",
				issueDate: new Date(),
				dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
				subtotal: invoiceData.subtotal,
				taxRate: invoiceData.taxRate,
				taxAmount: invoiceData.taxAmount,
				total: invoiceData.total,
				notes: invoiceData.notes,
				currency: "USD",
			})
			.returning();

		// Create line items
		const lineItemsData = invoiceData.lineItems.map((item) => ({
			invoiceId: newInvoice.id,
			description: item.description,
			quantity: item.quantity,
			unitPrice: item.unitPrice,
			amount: item.amount,
		}));

		await db.insert(invoiceLineItems).values(lineItemsData);

		return newInvoice.id;
	}

	/**
	 * Mark time entries as billed
	 */
	async markTimeEntriesAsBilled(
		userId: string,
		timeEntryIds: string[],
		invoiceId: string,
	): Promise<void> {
		await db
			.update(projectTimeEntries)
			.set({
				isBilled: true,
				invoiceId,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(projectTimeEntries.userId, userId),
					sql`${projectTimeEntries.id} = ANY(${timeEntryIds})`,
				),
			);
	}

	/**
	 * Generate recurring invoices for retainers
	 */
	async generateRecurringInvoices(userId: string): Promise<string[]> {
		const activeRetainers = await db
			.select()
			.from(retainers)
			.where(
				and(
					eq(retainers.userId, userId),
					eq(retainers.status, "active"),
					lte(retainers.nextBillingDate, new Date()),
				),
			);

		const createdInvoices: string[] = [];

		for (const retainer of activeRetainers) {
			const invoiceData = await this.generateRetainerInvoice({
				clientId: retainer.clientId,
				invoiceType: "retainer",
				startDate: retainer.lastBilledDate || retainer.startDate,
				endDate: new Date(),
			});

			const invoiceId = await this.createInvoice(
				userId,
				invoiceData,
				retainer.clientId,
			);

			// Update retainer next billing date
			const nextBillingDate = this.calculateNextBillingDate(
				retainer.billingCycle,
				retainer.nextBillingDate || new Date(),
			);

			await db
				.update(retainers)
				.set({
					lastBilledDate: new Date(),
					nextBillingDate,
					updatedAt: new Date(),
				})
				.where(eq(retainers.id, retainer.id));

			createdInvoices.push(invoiceId);
		}

		return createdInvoices;
	}

	/**
	 * Get unbilled time and expenses for a client
	 */
	async getUnbilledItems(
		userId: string,
		clientId: string,
		projectId?: string,
	): Promise<{
		timeEntries: ProjectTimeEntry[];
		expenses: ProjectExpense[];
		totalUnbilledAmount: number;
	}> {
		// Get unbilled time entries
		const timeEntries = await db
			.select()
			.from(projectTimeEntries)
			.innerJoin(projects, eq(projectTimeEntries.projectId, projects.id))
			.where(
				and(
					eq(projects.userId, userId),
					eq(projects.clientId, clientId),
					projectId ? eq(projectTimeEntries.projectId, projectId) : sql`1=1`,
					eq(projectTimeEntries.isBillable, true),
					eq(projectTimeEntries.isBilled, false),
				),
			);

		// Get unbilled expenses
		const expenses = await db
			.select()
			.from(projectExpenses)
			.innerJoin(projects, eq(projectExpenses.projectId, projects.id))
			.where(
				and(
					eq(projects.userId, userId),
					eq(projects.clientId, clientId),
					projectId ? eq(projectExpenses.projectId, projectId) : sql`1=1`,
					eq(projectExpenses.isBillable, true),
				),
			);

		// Calculate total unbilled amount
		const timeAmount = timeEntries.reduce((sum, entry) => {
			const hours = (entry.projectTimeEntries.duration || 0) / 3600;
			const rate = Number.parseFloat(
				entry.projectTimeEntries.hourlyRate || "0",
			);
			return sum + hours * rate;
		}, 0);

		const expenseAmount = expenses.reduce((sum, expense) => {
			return sum + Number.parseFloat(expense.projectExpenses.amount);
		}, 0);

		return {
			timeEntries: timeEntries.map((t) => t.projectTimeEntries),
			expenses: expenses.map((e) => e.projectExpenses),
			totalUnbilledAmount: timeAmount + expenseAmount,
		};
	}

	// Helper methods
	private groupTimeEntries(
		timeEntries: ProjectTimeEntry[],
	): Map<string, ProjectTimeEntry[]> {
		const groups = new Map<string, ProjectTimeEntry[]>();

		for (const entry of timeEntries) {
			const key = entry.category || entry.description;
			if (!groups.has(key)) {
				groups.set(key, []);
			}
			groups.get(key)?.push(entry);
		}

		return groups;
	}

	private async generateInvoiceNumber(): Promise<string> {
		const year = new Date().getFullYear();
		const month = String(new Date().getMonth() + 1).padStart(2, "0");

		// Get the last invoice number for this month
		const lastInvoice = await db
			.select({ invoiceNumber: invoices.invoiceNumber })
			.from(invoices)
			.where(sql`${invoices.invoiceNumber} LIKE 'INV-${year}${month}-%'`)
			.orderBy(desc(invoices.createdAt))
			.limit(1);

		let sequence = 1;
		if (lastInvoice.length > 0) {
			const lastNumber = lastInvoice[0].invoiceNumber;
			const lastSequence = Number.parseInt(lastNumber.split("-")[2]);
			sequence = lastSequence + 1;
		}

		return `INV-${year}${month}-${String(sequence).padStart(3, "0")}`;
	}

	private generateInvoiceNotes(options: InvoiceGenerationOptions): string {
		const { invoiceType, startDate, endDate } = options;

		switch (invoiceType) {
			case "time_based":
				return `Time-based billing for period ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
			case "milestone_based":
				return "Milestone-based billing for completed deliverables";
			case "retainer":
				return "Retainer billing for ongoing services";
			case "expense_reimbursement":
				return "Expense reimbursement for business expenses";
			default:
				return "Invoice for services rendered";
		}
	}

	private calculateNextBillingDate(cycle: string, currentDate: Date): Date {
		const nextDate = new Date(currentDate);

		switch (cycle) {
			case "monthly":
				nextDate.setMonth(nextDate.getMonth() + 1);
				break;
			case "quarterly":
				nextDate.setMonth(nextDate.getMonth() + 3);
				break;
			case "yearly":
				nextDate.setFullYear(nextDate.getFullYear() + 1);
				break;
			default:
				nextDate.setMonth(nextDate.getMonth() + 1);
		}

		return nextDate;
	}
}
