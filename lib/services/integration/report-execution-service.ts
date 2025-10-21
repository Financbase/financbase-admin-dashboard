import { getDbOrThrow } from "@/lib/db";
import {
	analyticsEvents,
	landingPageAnalytics,
} from "@/lib/db/schemas/analytics.schema";
import { purchaseOrders } from "@/lib/db/schemas/orders.schema";
import { endOfDay, format, startOfDay, subDays } from "date-fns";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import {} from "lucide-react";

/**
 * Report types and configurations
 */
export interface ReportConfig {
	id: string;
	name: string;
	description: string;
	type:
		| "analytics"
		| "users"
		| "sales"
		| "performance"
		| "custom"
		| "landing-pages";
	schedule?: "daily" | "weekly" | "monthly" | "on-demand";
	parameters: Record<string, unknown>;
	createdBy: string;
	createdAt: Date;
}

export interface ReportExecutionResult {
	reportId: string;
	executedAt: Date;
	executionTime: number; // milliseconds
	rowCount: number;
	data: Record<string, unknown>[];
	metadata: {
		dateRange?: { from: Date; to: Date };
		filters?: Record<string, unknown>;
		groupBy?: string;
	};
}

export interface ExportOptions {
	format: "csv" | "json" | "excel" | "pdf";
	filename?: string;
	includeHeaders?: boolean;
	dateRange?: { from: Date; to: Date };
	filters?: Record<string, unknown>;
}

/**
 * Service for executing and managing reports
 */
export class ReportExecutionService {
	/**
	 * Execute a report and return results
	 */
	async executeReport(
		reportId: string,
		parameters: Record<string, unknown> = {},
	): Promise<ReportExecutionResult> {
		const startTime = Date.now();

		try {
			// Get report configuration
			const report = await this.getReportConfig(reportId);
			if (!report) {
				throw new Error(`Report not found: ${reportId}`);
			}

			// Execute based on report type
			let data: Record<string, unknown>[];

			switch (report.type) {
				case "landing-pages":
					data = await this.executeLandingPageReport(parameters);
					break;
				case "users":
					data = await this.executeUsersReport(parameters);
					break;
				case "sales":
					data = await this.executeSalesReport(parameters);
					break;
				case "performance":
					data = await this.executePerformanceReport(parameters);
					break;
				case "custom":
					data = await this.executeCustomReport(report, parameters);
					break;
				default:
					throw new Error(`Unknown report type: ${report.type}`);
			}

			const executionTime = Date.now() - startTime;

			return {
				reportId,
				executedAt: new Date(),
				executionTime,
				rowCount: data.length,
				data,
				metadata: {
					dateRange: parameters.dateRange as
						| { from: Date; to: Date }
						| undefined,
					filters: parameters.filters as Record<string, unknown> | undefined,
					groupBy: parameters.groupBy as string | undefined,
				},
			};
		} catch (error) {
			console.error("Report execution error:", error);
			throw error;
		}
	}

	/**
	 * Execute analytics report
	 */
	private async executeAnalyticsReport(
		parameters: Record<string, unknown>,
	): Promise<Record<string, unknown>[]> {
		const days = (parameters.days as number) || 30;
		const startDate = subDays(new Date(), days);

		// Get daily event counts
		const results = await getDbOrThrow()
			.select({
				date: sql<string>`DATE(${analyticsEvents.timestamp})`,
				eventCount: sql<number>`COUNT(*)`,
				uniqueUsers: sql<number>`COUNT(DISTINCT ${analyticsEvents.userId})`,
				uniqueSessions: sql<number>`COUNT(DISTINCT ${analyticsEvents.sessionId})`,
			})
			.from(analyticsEvents)
			.where(gte(analyticsEvents.timestamp, startDate))
			.groupBy(sql`DATE(${analyticsEvents.timestamp})`)
			.orderBy(sql`DATE(${analyticsEvents.timestamp})`);

		return results;
	}

	/**
	 * Execute landing page analytics report
	 */
	private async executeLandingPageReport(
		parameters: Record<string, unknown>,
	): Promise<Record<string, unknown>[]> {
		const days = (parameters.days as number) || 30;
		const startDate = subDays(new Date(), days);

		// Get landing page performance metrics from landing_page_analytics table
		const results = await getDbOrThrow()
			.select({
				landingPageId: landingPageAnalytics.landingPageId,
				eventType: landingPageAnalytics.eventType,
				eventCount: sql<number>`COUNT(*)`,
				uniqueUsers: sql<number>`COUNT(DISTINCT ${landingPageAnalytics.userId})`,
				uniqueSessions: sql<number>`COUNT(DISTINCT ${landingPageAnalytics.sessionId})`,
				conversionRate: sql<number>`COUNT(CASE WHEN ${landingPageAnalytics.eventType} IN ('form_submit', 'cta_click') THEN 1 END) / COUNT(*)::FLOAT * 100`,
			})
			.from(landingPageAnalytics)
			.where(gte(landingPageAnalytics.timestamp, startDate))
			.groupBy(
				landingPageAnalytics.landingPageId,
				landingPageAnalytics.eventType,
			)
			.orderBy(desc(sql`COUNT(*)`));

		return results.map((row) => ({
			landingPageId: row.landingPageId,
			eventType: row.eventType,
			totalEvents: Number(row.eventCount),
			uniqueUsers: Number(row.uniqueUsers),
			uniqueSessions: Number(row.uniqueSessions),
			conversionRate: Number(row.conversionRate) || 0,
		}));
	}

	/**
	 * Execute users report
	 */
	private async executeUsersReport(
		parameters: Record<string, unknown>,
	): Promise<Record<string, unknown>[]> {
		const days = (parameters.days as number) || 30;
		const startDate = subDays(new Date(), days);

		// Get user activity summary
		const results = await getDbOrThrow()
			.select({
				userId: analyticsEvents.userId,
				eventCount: sql<number>`COUNT(*)`,
				lastActive: sql<Date>`MAX(${analyticsEvents.timestamp})`,
				sessionCount: sql<number>`COUNT(DISTINCT ${analyticsEvents.sessionId})`,
			})
			.from(analyticsEvents)
			.where(
				and(
					gte(analyticsEvents.timestamp, startDate),
					sql`${analyticsEvents.userId} IS NOT NULL`,
				),
			)
			.groupBy(analyticsEvents.userId)
			.orderBy(desc(sql`COUNT(*)`))
			.limit(1000);

		return results.map((row) => ({
			userId: row.userId,
			totalEvents: Number(row.eventCount),
			lastActive: row.lastActive,
			sessions: Number(row.sessionCount),
		}));
	}

	/**
	 * Execute sales report
	 */
	private async executeSalesReport(
		parameters: Record<string, unknown>,
	): Promise<Record<string, unknown>[]> {
		const db = getDbOrThrow();
		const days = (parameters.days as number) || 30;
		const startDate = startOfDay(subDays(new Date(), days));
		const endDate = endOfDay(new Date());

		// Query purchase orders for sales data
		const salesData = await db
			.select({
				date: sql<string>`DATE(${purchaseOrders.createdAt})`,
				revenue: sql<number>`COALESCE(SUM(${purchaseOrders.totalAmount}), 0)`,
				orders: sql<number>`COUNT(*)`,
			})
			.from(purchaseOrders)
			.where(
				and(
					gte(purchaseOrders.createdAt, startDate),
					lte(purchaseOrders.createdAt, endDate),
					eq(purchaseOrders.status, "approved"), // Only count approved orders
				),
			)
			.groupBy(sql`DATE(${purchaseOrders.createdAt})`)
			.orderBy(sql`DATE(${purchaseOrders.createdAt}) DESC`);

		// Calculate average order value for each day
		return salesData.map((row) => ({
			date: row.date,
			revenue: Number(row.revenue) || 0,
			orders: Number(row.orders) || 0,
			averageOrderValue:
				row.orders > 0 ? Number(row.revenue) / Number(row.orders) : 0,
		}));
	}

	private async executePerformanceReport(
		parameters: Record<string, unknown>,
	): Promise<Record<string, unknown>[]> {
		const days = (parameters.days as number) || 7;
		const startDate = subDays(new Date(), days);

		// Get component performance metrics
		const results = await getDbOrThrow()
			.select({
				component: analyticsEvents.component,
				eventCount: sql<number>`COUNT(*)`,
				avgProperties: sql<string>`AVG(LENGTH(${analyticsEvents.properties}))`,
			})
			.from(analyticsEvents)
			.where(
				and(
					gte(analyticsEvents.timestamp, startDate),
					sql`${analyticsEvents.component} IS NOT NULL`,
				),
			)
			.groupBy(analyticsEvents.component)
			.orderBy(desc(sql`COUNT(*)`));

		return results.map((row) => ({
			component: row.component,
			events: Number(row.eventCount),
			avgDataSize: Number(row.avgProperties) || 0,
		}));
	}

	/**
	 * Execute custom report with SQL query
	 */
	private async executeCustomReport(
		report: ReportConfig,
		parameters: Record<string, unknown>,
	): Promise<Record<string, unknown>[]> {
		// For custom reports, would execute custom SQL or aggregation logic
		// This is a placeholder implementation
		return [];
	}

	/**
	 * Get report configuration
	 */
	private async getReportConfig(
		reportId: string,
	): Promise<ReportConfig | null> {
		// In a real implementation, this would fetch from a reports table
		// For now, return mock configurations
		const mockReports: Record<string, ReportConfig> = {
			"analytics-summary": {
				id: "analytics-summary",
				name: "Analytics Summary",
				description: "Overview of analytics events and user activity",
				type: "analytics",
				schedule: "daily",
				parameters: { days: 30 },
				createdBy: "system",
				createdAt: new Date(),
			},
			"user-activity": {
				id: "user-activity",
				name: "User Activity Report",
				description: "Detailed user activity and engagement metrics",
				type: "users",
				schedule: "weekly",
				parameters: { days: 30 },
				createdBy: "system",
				createdAt: new Date(),
			},
			"performance-metrics": {
				id: "performance-metrics",
				name: "Performance Metrics",
				description: "Component performance and usage statistics",
				type: "performance",
				schedule: "daily",
				parameters: { days: 7 },
				createdBy: "system",
				createdAt: new Date(),
			},
		};

		return mockReports[reportId] || null;
	}

	/**
	 * Export report data to various formats
	 */
	async exportReport(
		result: ReportExecutionResult,
		options: ExportOptions,
	): Promise<Blob> {
		switch (options.format) {
			case "csv":
				return this.exportToCSV(result.data, options);
			case "json":
				return this.exportToJSON(result.data, options);
			case "excel":
				return this.exportToExcel(result.data, options);
			case "pdf":
				return this.exportToPDF(result.data, options);
			default:
				throw new Error(`Unsupported export format: ${options.format}`);
		}
	}

	/**
	 * Export to CSV format
	 */
	private exportToCSV(
		data: Record<string, unknown>[],
		options: ExportOptions,
	): Blob {
		if (data.length === 0) {
			return new Blob(["No data available"], { type: "text/csv" });
		}

		const headers = Object.keys(data[0]);
		const csvRows: string[] = [];

		// Add headers
		if (options.includeHeaders !== false) {
			csvRows.push(headers.join(","));
		}

		// Add data rows
		for (const row of data) {
			const values = headers.map((header) => {
				const value = row[header];
				// Escape values that contain commas or quotes
				const stringValue = String(value ?? "");
				if (stringValue.includes(",") || stringValue.includes('"')) {
					return `"${stringValue.replace(/"/g, '""')}"`;
				}
				return stringValue;
			});
			csvRows.push(values.join(","));
		}

		return new Blob([csvRows.join("\n")], { type: "text/csv" });
	}

	/**
	 * Export to JSON format
	 */
	private exportToJSON(
		data: Record<string, unknown>[],
		options: ExportOptions,
	): Blob {
		const json = JSON.stringify(
			{
				data,
				metadata: {
					exportedAt: new Date().toISOString(),
					format: "json",
					rowCount: data.length,
					...(options.dateRange && { dateRange: options.dateRange }),
				},
			},
			null,
			2,
		);

		return new Blob([json], { type: "application/json" });
	}

	/**
	 * Export to Excel format
	 */
	private exportToExcel(
		data: Record<string, unknown>[],
		options: ExportOptions,
	): Blob {
		// This would use a library like xlsx or exceljs
		// For now, return CSV as a placeholder
		return this.exportToCSV(data, options);
	}

	/**
	 * Export to PDF format
	 */
	private exportToPDF(
		data: Record<string, unknown>[],
		options: ExportOptions,
	): Blob {
		// This would use a library like jsPDF or pdfmake
		// For now, return a simple text representation
		const text = JSON.stringify(data, null, 2);
		return new Blob([text], { type: "application/pdf" });
	}

	/**
	 * Schedule a report for recurring execution
	 */
	async scheduleReport(
		reportId: string,
		schedule: "daily" | "weekly" | "monthly",
		recipients: string[],
		exportFormat: "csv" | "json" | "excel" | "pdf",
	): Promise<void> {
		// In a real implementation, this would:
		// 1. Store the schedule in a database
		// 2. Set up a cron job or scheduled task
		// 3. Configure email delivery
		console.log("Report scheduled:", {
			reportId,
			schedule,
			recipients,
			exportFormat,
		});
	}

	/**
	 * Get list of available reports
	 */
	async getAvailableReports(): Promise<ReportConfig[]> {
		return [
			{
				id: "landing-page-analytics",
				name: "Landing Page Analytics",
				description:
					"Detailed analytics for landing pages including conversion rates and user engagement",
				type: "landing-pages",
				schedule: "weekly",
				parameters: { days: 30 },
				createdBy: "system",
				createdAt: new Date(),
			},
			{
				id: "user-activity",
				name: "User Activity Report",
				description: "Detailed user activity and engagement metrics",
				type: "users",
				schedule: "weekly",
				parameters: { days: 30 },
				createdBy: "system",
				createdAt: new Date(),
			},
			{
				id: "performance-metrics",
				name: "Performance Metrics",
				description: "Component performance and usage statistics",
				type: "performance",
				schedule: "daily",
				parameters: { days: 7 },
				createdBy: "system",
				createdAt: new Date(),
			},
		];
	}
}

// Export singleton instance
export const reportExecutionService = new ReportExecutionService();
