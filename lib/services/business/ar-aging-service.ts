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
import {} from "lucide-react";

export interface ARAgingBucket {
	current: number; // 0-30 days
	days31to60: number; // 31-60 days
	days61to90: number; // 61-90 days
	over90: number; // 90+ days
	total: number;
}

export interface ARAgingReport {
	totalOutstanding: number;
	agingBuckets: ARAgingBucket;
	byClient: {
		clientId: string;
		clientName: string;
		totalOutstanding: number;
		agingBuckets: ARAgingBucket;
		riskLevel: "low" | "medium" | "high" | "critical";
		lastPaymentDate?: Date;
		averagePaymentTime: number;
	}[];
	byProject: {
		projectId: string;
		projectName: string;
		clientName: string;
		totalOutstanding: number;
		agingBuckets: ARAgingBucket;
		status: "active" | "completed" | "on_hold" | "cancelled";
	}[];
	trends: {
		totalOutstandingTrend: "growing" | "stable" | "shrinking";
		agingTrend: "improving" | "stable" | "worsening";
		riskTrend: "improving" | "stable" | "worsening";
	};
	recommendations: {
		priority: "high" | "medium" | "low";
		action: string;
		impact: string;
		effort: "low" | "medium" | "high";
	}[];
}

export interface ARAgingAlert {
	id: string;
	type: "overdue" | "high_risk" | "concentration" | "trend";
	severity: "low" | "medium" | "high" | "critical";
	title: string;
	description: string;
	affectedClients: string[];
	recommendedActions: string[];
	createdAt: Date;
}

export interface ARAgingForecast {
	next30Days: {
		expectedPayments: number;
		confidence: number;
		riskFactors: string[];
	};
	next60Days: {
		expectedPayments: number;
		confidence: number;
		riskFactors: string[];
	};
	next90Days: {
		expectedPayments: number;
		confidence: number;
		riskFactors: string[];
	};
	cashFlowImpact: {
		bestCase: number;
		mostLikely: number;
		worstCase: number;
	};
}

export class ARAgingService {
	/**
	 * Generate comprehensive AR aging report
	 */
	async generateAgingReport(
		userId: string,
		startDate?: Date,
		endDate?: Date,
	): Promise<ARAgingReport> {
		try {
			const start =
				startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
			const end = endDate || new Date();

			// Get outstanding invoices with aging
			const outstandingInvoices = await this.getOutstandingInvoices(
				userId,
				start,
				end,
			);

			// Calculate aging buckets
			const agingBuckets = this.calculateAgingBuckets(outstandingInvoices);

			// Get client breakdown
			const byClient = await this.getClientAgingBreakdown(
				userId,
				outstandingInvoices,
			);

			// Get project breakdown
			const byProject = await this.getProjectAgingBreakdown(
				userId,
				outstandingInvoices,
			);

			// Calculate trends
			const trends = await this.calculateAgingTrends(userId, start, end);

			// Generate recommendations
			const recommendations = this.generateRecommendations(
				agingBuckets,
				byClient,
			);

			return {
				totalOutstanding: agingBuckets.total,
				agingBuckets,
				byClient,
				byProject,
				trends,
				recommendations,
			};
		} catch (error) {
			console.error("Error generating AR aging report:", error);
			throw new Error(
				`Failed to generate AR aging report: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get AR aging alerts
	 */
	async getAgingAlerts(userId: string): Promise<ARAgingAlert[]> {
		try {
			const alerts = [];

			// Get current aging data
			const agingReport = await this.generateAgingReport(userId);

			// Check for overdue invoices
			if (
				agingReport.agingBuckets.days31to60 > 0 ||
				agingReport.agingBuckets.days61to90 > 0 ||
				agingReport.agingBuckets.over90 > 0
			) {
				alerts.push({
					id: crypto.randomUUID(),
					type: "overdue",
					severity: agingReport.agingBuckets.over90 > 0 ? "high" : "medium",
					title: "Overdue Invoices Detected",
					description: `You have ${agingReport.agingBuckets.days31to60 + agingReport.agingBuckets.days61to90 + agingReport.agingBuckets.over90} overdue invoices totaling $${(agingReport.agingBuckets.days31to60 + agingReport.agingBuckets.days61to90 + agingReport.agingBuckets.over90).toLocaleString()}`,
					affectedClients: agingReport.byClient
						.filter((c) => c.riskLevel === "high" || c.riskLevel === "critical")
						.map((c) => c.clientId),
					recommendedActions: [
						"Send payment reminders to overdue clients",
						"Review payment terms for high-risk clients",
						"Consider offering payment plans for large outstanding amounts",
					],
					createdAt: new Date(),
				});
			}

			// Check for high-risk clients
			const highRiskClients = agingReport.byClient.filter(
				(c) => c.riskLevel === "high" || c.riskLevel === "critical",
			);
			if (highRiskClients.length > 0) {
				alerts.push({
					id: crypto.randomUUID(),
					type: "high_risk",
					severity: "high",
					title: "High-Risk Clients Identified",
					description: `${highRiskClients.length} clients have high-risk payment patterns`,
					affectedClients: highRiskClients.map((c) => c.clientId),
					recommendedActions: [
						"Review credit terms for high-risk clients",
						"Implement stricter payment terms",
						"Consider requiring advance payments",
					],
					createdAt: new Date(),
				});
			}

			// Check for client concentration
			const totalOutstanding = agingReport.totalOutstanding;
			const topClient = agingReport.byClient[0];
			if (topClient && topClient.totalOutstanding > totalOutstanding * 0.3) {
				alerts.push({
					id: crypto.randomUUID(),
					type: "concentration",
					severity: "medium",
					title: "Client Concentration Risk",
					description: `${topClient.clientName} represents ${((topClient.totalOutstanding / totalOutstanding) * 100).toFixed(1)}% of outstanding receivables`,
					affectedClients: [topClient.clientId],
					recommendedActions: [
						"Diversify client base",
						"Implement client risk limits",
						"Consider credit insurance",
					],
					createdAt: new Date(),
				});
			}

			return alerts;
		} catch (error) {
			console.error("Error fetching AR aging alerts:", error);
			throw new Error(
				`Failed to fetch AR aging alerts: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Generate AR aging forecast
	 */
	async generateAgingForecast(
		userId: string,
		days = 90,
	): Promise<ARAgingForecast> {
		try {
			// Get current aging data
			const agingReport = await this.generateAgingReport(userId);

			// Calculate expected payments based on historical data
			const historicalData = await this.getHistoricalPaymentData(userId, 365);

			// Forecast next 30 days
			const next30Days = this.forecastPayments(agingReport, historicalData, 30);

			// Forecast next 60 days
			const next60Days = this.forecastPayments(agingReport, historicalData, 60);

			// Forecast next 90 days
			const next90Days = this.forecastPayments(agingReport, historicalData, 90);

			// Calculate cash flow impact
			const cashFlowImpact = this.calculateCashFlowImpact(
				next30Days,
				next60Days,
				next90Days,
			);

			return {
				next30Days,
				next60Days,
				next90Days,
				cashFlowImpact,
			};
		} catch (error) {
			console.error("Error generating AR aging forecast:", error);
			throw new Error(
				`Failed to generate AR aging forecast: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get aging trends over time
	 */
	async getAgingTrends(
		userId: string,
		months = 12,
	): Promise<
		{
			month: string;
			totalOutstanding: number;
			agingBuckets: ARAgingBucket;
			riskLevel: "low" | "medium" | "high" | "critical";
		}[]
	> {
		try {
			const trends = [];
			const endDate = new Date();

			for (let i = months - 1; i >= 0; i--) {
				const monthStart = new Date();
				monthStart.setMonth(monthStart.getMonth() - i);
				monthStart.setDate(1);

				const monthEnd = new Date(monthStart);
				monthEnd.setMonth(monthEnd.getMonth() + 1);
				monthEnd.setDate(0);

				// In a real implementation, you'd calculate from actual data
				const totalOutstanding = 50000 + Math.random() * 20000;
				const agingBuckets: ARAgingBucket = {
					current: totalOutstanding * 0.6,
					days31to60: totalOutstanding * 0.2,
					days61to90: totalOutstanding * 0.15,
					over90: totalOutstanding * 0.05,
					total: totalOutstanding,
				};

				const riskLevel = this.calculateRiskLevel(agingBuckets);

				trends.push({
					month: monthStart.toISOString().substring(0, 7),
					totalOutstanding,
					agingBuckets,
					riskLevel,
				});
			}

			return trends;
		} catch (error) {
			console.error("Error fetching AR aging trends:", error);
			throw new Error(
				`Failed to fetch AR aging trends: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	// Private helper methods

	private async getOutstandingInvoices(
		userId: string,
		startDate: Date,
		endDate: Date,
	): Promise<
		{
			invoiceId: string;
			clientId: string;
			amount: number;
			dueDate: Date;
			daysOverdue: number;
		}[]
	> {
		// In a real implementation, you'd query the database
		return [
			{
				invoiceId: "INV-001",
				clientId: "client-1",
				amount: 10000,
				dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
				daysOverdue: 15,
			},
			{
				invoiceId: "INV-002",
				clientId: "client-2",
				amount: 5000,
				dueDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
				daysOverdue: 45,
			},
		];
	}

	private calculateAgingBuckets(
		invoices: {
			invoiceId: string;
			clientId: string;
			amount: number;
			dueDate: Date;
			daysOverdue: number;
		}[],
	): ARAgingBucket {
		const buckets: ARAgingBucket = {
			current: 0,
			days31to60: 0,
			days61to90: 0,
			over90: 0,
			total: 0,
		};

		for (const invoice of invoices) {
			if (invoice.daysOverdue <= 30) {
				buckets.current += invoice.amount;
			} else if (invoice.daysOverdue <= 60) {
				buckets.days31to60 += invoice.amount;
			} else if (invoice.daysOverdue <= 90) {
				buckets.days61to90 += invoice.amount;
			} else {
				buckets.over90 += invoice.amount;
			}
			buckets.total += invoice.amount;
		}

		return buckets;
	}

	private async getClientAgingBreakdown(
		userId: string,
		invoices: {
			invoiceId: string;
			clientId: string;
			amount: number;
			dueDate: Date;
			daysOverdue: number;
		}[],
	): Promise<
		{
			clientId: string;
			clientName: string;
			totalOutstanding: number;
			agingBuckets: ARAgingBucket;
			riskLevel: "low" | "medium" | "high" | "critical";
			lastPaymentDate?: Date;
			averagePaymentTime: number;
		}[]
	> {
		// Group invoices by client
		const clientMap = new Map<
			string,
			{
				clientId: string;
				clientName: string;
				invoices: typeof invoices;
			}
		>();

		for (const invoice of invoices) {
			if (!clientMap.has(invoice.clientId)) {
				clientMap.set(invoice.clientId, {
					clientId: invoice.clientId,
					clientName: `Client ${invoice.clientId}`,
					invoices: [],
				});
			}
			const clientData = clientMap.get(invoice.clientId);
			if (clientData) {
				clientData.invoices.push(invoice);
			}
		}

		// Calculate breakdown for each client
		const breakdown = [];
		for (const [clientId, clientData] of clientMap) {
			const agingBuckets = this.calculateAgingBuckets(clientData.invoices);
			const totalOutstanding = agingBuckets.total;
			const riskLevel = this.calculateRiskLevel(agingBuckets);

			breakdown.push({
				clientId,
				clientName: clientData.clientName,
				totalOutstanding,
				agingBuckets,
				riskLevel,
				lastPaymentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
				averagePaymentTime: 28,
			});
		}

		return breakdown.sort((a, b) => b.totalOutstanding - a.totalOutstanding);
	}

	private async getProjectAgingBreakdown(
		userId: string,
		invoices: {
			invoiceId: string;
			clientId: string;
			amount: number;
			dueDate: Date;
			daysOverdue: number;
		}[],
	): Promise<
		{
			projectId: string;
			projectName: string;
			clientName: string;
			totalOutstanding: number;
			agingBuckets: ARAgingBucket;
			status: "active" | "completed" | "on_hold" | "cancelled";
		}[]
	> {
		// In a real implementation, you'd group by project
		return [
			{
				projectId: "project-1",
				projectName: "Website Redesign",
				clientName: "Client A",
				totalOutstanding: 15000,
				agingBuckets: {
					current: 10000,
					days31to60: 5000,
					days61to90: 0,
					over90: 0,
					total: 15000,
				},
				status: "active",
			},
		];
	}

	private async calculateAgingTrends(
		userId: string,
		startDate: Date,
		endDate: Date,
	): Promise<{
		totalOutstandingTrend: "growing" | "stable" | "shrinking";
		agingTrend: "improving" | "stable" | "worsening";
		riskTrend: "improving" | "stable" | "worsening";
	}> {
		// In a real implementation, you'd compare current vs historical data
		return {
			totalOutstandingTrend: "stable",
			agingTrend: "stable",
			riskTrend: "stable",
		};
	}

	private generateRecommendations(
		agingBuckets: ARAgingBucket,
		byClient: {
			clientId: string;
			clientName: string;
			totalOutstanding: number;
			agingBuckets: ARAgingBucket;
			riskLevel: "low" | "medium" | "high" | "critical";
			lastPaymentDate?: Date;
			averagePaymentTime: number;
		}[],
	): {
		priority: "high" | "medium" | "low";
		action: string;
		impact: string;
		effort: "low" | "medium" | "high";
	}[] {
		const recommendations = [];

		// High priority recommendations
		if (agingBuckets.over90 > 0) {
			recommendations.push({
				priority: "high" as const,
				action: "Follow up on 90+ day overdue invoices",
				impact: `Recover $${agingBuckets.over90.toLocaleString()} in overdue payments`,
				effort: "medium" as const,
			});
		}

		if (agingBuckets.days61to90 > 0) {
			recommendations.push({
				priority: "high" as const,
				action: "Send final payment demands for 60-90 day overdue invoices",
				impact: `Prevent $${agingBuckets.days61to90.toLocaleString()} from becoming 90+ day overdue`,
				effort: "low" as const,
			});
		}

		// Medium priority recommendations
		const highRiskClients = byClient.filter(
			(c) => c.riskLevel === "high" || c.riskLevel === "critical",
		);
		if (highRiskClients.length > 0) {
			recommendations.push({
				priority: "medium" as const,
				action: "Review payment terms for high-risk clients",
				impact: `Reduce risk exposure for ${highRiskClients.length} clients`,
				effort: "medium" as const,
			});
		}

		// Low priority recommendations
		if (agingBuckets.current < agingBuckets.total * 0.7) {
			recommendations.push({
				priority: "low" as const,
				action: "Implement automated payment reminders",
				impact: "Improve overall collection efficiency",
				effort: "high" as const,
			});
		}

		return recommendations;
	}

	private calculateRiskLevel(
		agingBuckets: ARAgingBucket,
	): "low" | "medium" | "high" | "critical" {
		const over90Percentage = (agingBuckets.over90 / agingBuckets.total) * 100;
		const over60Percentage =
			((agingBuckets.days61to90 + agingBuckets.over90) / agingBuckets.total) *
			100;

		if (over90Percentage > 20 || over60Percentage > 40) {
			return "critical";
		}
		if (over90Percentage > 10 || over60Percentage > 25) {
			return "high";
		}
		if (over90Percentage > 5 || over60Percentage > 15) {
			return "medium";
		}
		return "low";
	}

	private async getHistoricalPaymentData(
		userId: string,
		days: number,
	): Promise<{
		averagePaymentTime: number;
		paymentRate: number;
		collectionRate: number;
	}> {
		// In a real implementation, you'd calculate from historical data
		return {
			averagePaymentTime: 28,
			paymentRate: 0.85,
			collectionRate: 0.9,
		};
	}

	private forecastPayments(
		agingReport: ARAgingReport,
		historicalData: {
			averagePaymentTime: number;
			paymentRate: number;
			collectionRate: number;
		},
		days: number,
	): {
		expectedPayments: number;
		confidence: number;
		riskFactors: string[];
	} {
		const riskFactors = [];
		let confidence = 0.8;

		// Calculate expected payments based on aging buckets
		let expectedPayments = 0;

		if (days >= 30) {
			expectedPayments += agingReport.agingBuckets.current * 0.9;
		}

		if (days >= 60) {
			expectedPayments += agingReport.agingBuckets.days31to60 * 0.7;
		}

		if (days >= 90) {
			expectedPayments += agingReport.agingBuckets.days61to90 * 0.5;
			expectedPayments += agingReport.agingBuckets.over90 * 0.3;
		}

		// Adjust confidence based on risk factors
		if (agingReport.agingBuckets.over90 > agingReport.totalOutstanding * 0.1) {
			riskFactors.push("High percentage of 90+ day overdue invoices");
			confidence -= 0.2;
		}

		if (agingReport.byClient.some((c) => c.riskLevel === "critical")) {
			riskFactors.push("Critical risk clients identified");
			confidence -= 0.1;
		}

		return {
			expectedPayments,
			confidence: Math.max(0.1, confidence),
			riskFactors,
		};
	}

	private calculateCashFlowImpact(
		next30Days: {
			expectedPayments: number;
			confidence: number;
			riskFactors: string[];
		},
		next60Days: {
			expectedPayments: number;
			confidence: number;
			riskFactors: string[];
		},
		next90Days: {
			expectedPayments: number;
			confidence: number;
			riskFactors: string[];
		},
	): {
		bestCase: number;
		mostLikely: number;
		worstCase: number;
	} {
		const bestCase =
			next30Days.expectedPayments +
			next60Days.expectedPayments +
			next90Days.expectedPayments;
		const mostLikely = bestCase * 0.8;
		const worstCase = bestCase * 0.6;

		return {
			bestCase,
			mostLikely,
			worstCase,
		};
	}
}
