/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from "@/lib/db";
import { agencyClients, agencyProjects } from "@/lib/db/schemas/agency.schema";
import { and, count, desc, eq, gte, lte, sum } from "drizzle-orm";
import {
	Banknote,
	BarChart3,
	CheckCircle,
	Clock,
	CreditCard,
	Database,
	MessageCircle,
	Save,
	XCircle,
} from "lucide-react";

export interface PaymentRecord {
	id: string;
	invoiceId: string;
	clientId: string;
	projectId?: string;
	amount: number;
	paymentDate: Date;
	paymentMethod: "bank_transfer" | "credit_card" | "check" | "cash" | "other";
	reference: string;
	status: "pending" | "completed" | "failed" | "refunded";
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface PaymentTrackingSummary {
	totalInvoiced: number;
	totalPaid: number;
	totalOutstanding: number;
	overdueAmount: number;
	averagePaymentTime: number; // days
	paymentRate: number; // percentage
	recentPayments: PaymentRecord[];
	overdueInvoices: {
		invoiceId: string;
		clientName: string;
		amount: number;
		dueDate: Date;
		daysOverdue: number;
	}[];
}

export interface PaymentAnalytics {
	monthly: {
		month: string;
		invoiced: number;
		paid: number;
		outstanding: number;
		paymentRate: number;
	}[];
	byClient: {
		clientId: string;
		clientName: string;
		totalInvoiced: number;
		totalPaid: number;
		outstanding: number;
		averagePaymentTime: number;
		paymentRate: number;
	}[];
	byPaymentMethod: {
		method: string;
		count: number;
		amount: number;
		percentage: number;
	}[];
	trends: {
		paymentTrend: "improving" | "stable" | "declining";
		collectionTrend: "improving" | "stable" | "declining";
		outstandingTrend: "growing" | "stable" | "shrinking";
	};
}

export interface PaymentReminder {
	id: string;
	invoiceId: string;
	clientId: string;
	clientName: string;
	amount: number;
	dueDate: Date;
	daysOverdue: number;
	reminderType: "gentle" | "firm" | "final";
	sentDate?: Date;
	responseDate?: Date;
	status: "pending" | "sent" | "responded" | "ignored";
}

export class PaymentTrackingService {
	/**
	 * Record a payment
	 */
	async recordPayment(
		userId: string,
		paymentData: Omit<PaymentRecord, "id" | "createdAt" | "updatedAt">,
	): Promise<PaymentRecord> {
		try {
			const payment: PaymentRecord = {
				id: crypto.randomUUID(),
				...paymentData,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			// In a real implementation, you'd save to database
			// For now, we'll just return the payment record
			return payment;
		} catch (error) {
			console.error("Error recording payment:", error);
			throw new Error(
				`Failed to record payment: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get payment tracking summary
	 */
	async getPaymentSummary(
		userId: string,
		startDate?: Date,
		endDate?: Date,
	): Promise<PaymentTrackingSummary> {
		try {
			const start =
				startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
			const end = endDate || new Date();

			// In a real implementation, you'd calculate these from actual data
			const totalInvoiced = 150000;
			const totalPaid = 120000;
			const totalOutstanding = totalInvoiced - totalPaid;
			const overdueAmount = 25000;
			const averagePaymentTime = 28; // days
			const paymentRate = (totalPaid / totalInvoiced) * 100;

			// Get recent payments (mock data)
			const recentPayments: PaymentRecord[] = [
				{
					id: "1",
					invoiceId: "INV-001",
					clientId: "client-1",
					amount: 5000,
					paymentDate: new Date(),
					paymentMethod: "bank_transfer",
					reference: "TXN-123456",
					status: "completed",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			// Get overdue invoices (mock data)
			const overdueInvoices = [
				{
					invoiceId: "INV-002",
					clientName: "Client A",
					amount: 10000,
					dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
					daysOverdue: 15,
				},
			];

			return {
				totalInvoiced,
				totalPaid,
				totalOutstanding,
				overdueAmount,
				averagePaymentTime,
				paymentRate,
				recentPayments,
				overdueInvoices,
			};
		} catch (error) {
			console.error("Error fetching payment summary:", error);
			throw new Error(
				`Failed to fetch payment summary: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get payment analytics
	 */
	async getPaymentAnalytics(
		userId: string,
		months = 12,
	): Promise<PaymentAnalytics> {
		try {
			const monthlyData = [];
			const endDate = new Date();

			for (let i = months - 1; i >= 0; i--) {
				const monthStart = new Date();
				monthStart.setMonth(monthStart.getMonth() - i);
				monthStart.setDate(1);

				const monthEnd = new Date(monthStart);
				monthEnd.setMonth(monthEnd.getMonth() + 1);
				monthEnd.setDate(0);

				// Mock data - in real implementation, calculate from actual data
				const invoiced = 15000 + Math.random() * 5000;
				const paid = invoiced * (0.8 + Math.random() * 0.2);
				const outstanding = invoiced - paid;
				const paymentRate = (paid / invoiced) * 100;

				monthlyData.push({
					month: monthStart.toISOString().substring(0, 7),
					invoiced,
					paid,
					outstanding,
					paymentRate,
				});
			}

			// Get client analytics (mock data)
			const byClient = [
				{
					clientId: "client-1",
					clientName: "Client A",
					totalInvoiced: 50000,
					totalPaid: 45000,
					outstanding: 5000,
					averagePaymentTime: 25,
					paymentRate: 90,
				},
				{
					clientId: "client-2",
					clientName: "Client B",
					totalInvoiced: 30000,
					totalPaid: 25000,
					outstanding: 5000,
					averagePaymentTime: 35,
					paymentRate: 83,
				},
			];

			// Get payment method analytics (mock data)
			const byPaymentMethod = [
				{
					method: "Bank Transfer",
					count: 15,
					amount: 80000,
					percentage: 60,
				},
				{
					method: "Credit Card",
					count: 8,
					amount: 30000,
					percentage: 25,
				},
				{
					method: "Check",
					count: 5,
					amount: 20000,
					percentage: 15,
				},
			];

			// Calculate trends
			const firstMonth = monthlyData[0];
			const lastMonth = monthlyData[monthlyData.length - 1];

			const paymentTrend =
				lastMonth.paymentRate > firstMonth.paymentRate + 5
					? "improving"
					: lastMonth.paymentRate < firstMonth.paymentRate - 5
						? "declining"
						: "stable";

			const collectionTrend =
				lastMonth.outstanding < firstMonth.outstanding * 0.9
					? "improving"
					: lastMonth.outstanding > firstMonth.outstanding * 1.1
						? "declining"
						: "stable";

			const outstandingTrend =
				lastMonth.outstanding > firstMonth.outstanding * 1.1
					? "growing"
					: lastMonth.outstanding < firstMonth.outstanding * 0.9
						? "shrinking"
						: "stable";

			return {
				monthly: monthlyData,
				byClient,
				byPaymentMethod,
				trends: {
					paymentTrend,
					collectionTrend,
					outstandingTrend,
				},
			};
		} catch (error) {
			console.error("Error fetching payment analytics:", error);
			throw new Error(
				`Failed to fetch payment analytics: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Generate payment reminders
	 */
	async generatePaymentReminders(userId: string): Promise<PaymentReminder[]> {
		try {
			// Get overdue invoices
			const overdueInvoices = await this.getOverdueInvoices(userId);

			const reminders = [];

			for (const invoice of overdueInvoices) {
				const daysOverdue = Math.floor(
					(Date.now() - invoice.dueDate.getTime()) / (24 * 60 * 60 * 1000),
				);

				let reminderType: "gentle" | "firm" | "final" = "gentle";
				if (daysOverdue > 30) reminderType = "final";
				else if (daysOverdue > 15) reminderType = "firm";

				reminders.push({
					id: crypto.randomUUID(),
					invoiceId: invoice.invoiceId,
					clientId: invoice.clientId,
					clientName: invoice.clientName,
					amount: invoice.amount,
					dueDate: invoice.dueDate,
					daysOverdue,
					reminderType,
					status: "pending",
				});
			}

			return reminders;
		} catch (error) {
			console.error("Error generating payment reminders:", error);
			throw new Error(
				`Failed to generate payment reminders: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Send payment reminder
	 */
	async sendPaymentReminder(
		userId: string,
		reminderId: string,
		method: "email" | "sms" | "call",
	): Promise<{
		success: boolean;
		messageId?: string;
		error?: string;
	}> {
		try {
			// In a real implementation, you'd:
			// 1. Get reminder details
			// 2. Generate reminder message
			// 3. Send via email/SMS/call
			// 4. Update reminder status
			// 5. Log the action

			return {
				success: true,
				messageId: crypto.randomUUID(),
			};
		} catch (error) {
			console.error("Error sending payment reminder:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Get payment history for a client
	 */
	async getClientPaymentHistory(
		userId: string,
		clientId: string,
		limit = 50,
	): Promise<PaymentRecord[]> {
		try {
			// In a real implementation, you'd fetch from database
			const payments: PaymentRecord[] = [
				{
					id: "1",
					invoiceId: "INV-001",
					clientId,
					amount: 5000,
					paymentDate: new Date(),
					paymentMethod: "bank_transfer",
					reference: "TXN-123456",
					status: "completed",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			return payments.slice(0, limit);
		} catch (error) {
			console.error("Error fetching client payment history:", error);
			throw new Error(
				`Failed to fetch client payment history: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get payment trends for a client
	 */
	async getClientPaymentTrends(
		userId: string,
		clientId: string,
	): Promise<{
		averagePaymentTime: number;
		paymentRate: number;
		trend: "improving" | "stable" | "declining";
		recentPayments: PaymentRecord[];
	}> {
		try {
			// In a real implementation, you'd calculate from actual data
			return {
				averagePaymentTime: 28,
				paymentRate: 85,
				trend: "stable",
				recentPayments: [],
			};
		} catch (error) {
			console.error("Error fetching client payment trends:", error);
			throw new Error(
				`Failed to fetch client payment trends: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	// Private helper methods

	private async getOverdueInvoices(userId: string): Promise<
		{
			invoiceId: string;
			clientId: string;
			clientName: string;
			amount: number;
			dueDate: Date;
		}[]
	> {
		// In a real implementation, you'd query the database for overdue invoices
		return [
			{
				invoiceId: "INV-002",
				clientId: "client-1",
				clientName: "Client A",
				amount: 10000,
				dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
			},
		];
	}
}
