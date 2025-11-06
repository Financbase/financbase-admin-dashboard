/**
 * Report Service
 * Business logic for report generation and management
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { db } from '@/lib/db';
import { reports, reportHistory, reportTemplates, type NewReport, type Report } from '@/lib/db/schema/reports';
import { eq, and, desc } from 'drizzle-orm';

interface GenerateReportInput {
	userId: string;
	type: 'profit_loss' | 'cash_flow' | 'balance_sheet' | 'revenue_by_customer' | 'expense_by_category' | 'custom';
	dateRange: {
		start: Date;
		end: Date;
	};
	filters?: Record<string, unknown>;
	groupBy?: string[];
	metrics?: string[];
	comparePeriod?: boolean;
}

interface ReportData {
	summary: {
		totalRevenue?: number;
		totalExpenses?: number;
		netProfit?: number;
		cashInflow?: number;
		cashOutflow?: number;
		assets?: number;
		liabilities?: number;
		equity?: number;
	};
	details: Array<{
		period: string;
		[key: string]: unknown;
	}>;
	comparison?: {
		previousPeriod: unknown;
		change: number;
		changePercent: number;
	};
}

/**
 * Generate Profit & Loss Report
 */
async function generateProfitLossReport(
	_userId: string,
	_startDate: Date,
	_endDate: Date
): Promise<ReportData> {
	// This is a simplified version - in production, you'd query actual financial data
	// For now, returning placeholder structure
	
	return {
		summary: {
			totalRevenue: 0,
			totalExpenses: 0,
			netProfit: 0,
		},
		details: [],
	};
}

/**
 * Generate Cash Flow Report
 */
async function generateCashFlowReport(
	_userId: string,
	_startDate: Date,
	_endDate: Date
): Promise<ReportData> {
	return {
		summary: {
			cashInflow: 0,
			cashOutflow: 0,
			netProfit: 0,
		},
		details: [],
	};
}

/**
 * Generate Balance Sheet Report
 */
async function generateBalanceSheetReport(
	_userId: string,
	_date: Date
): Promise<ReportData> {
	return {
		summary: {
			assets: 0,
			liabilities: 0,
			equity: 0,
		},
		details: [],
	};
}

/**
 * Generate custom report based on configuration
 */
export async function generateReport(input: GenerateReportInput): Promise<ReportData> {
	const { userId, type, dateRange } = input;

	let reportData: ReportData;

	switch (type) {
		case 'profit_loss':
			reportData = await generateProfitLossReport(userId, dateRange.start, dateRange.end);
			break;
		case 'cash_flow':
			reportData = await generateCashFlowReport(userId, dateRange.start, dateRange.end);
			break;
		case 'balance_sheet':
			reportData = await generateBalanceSheetReport(userId, dateRange.end);
			break;
		case 'revenue_by_customer':
			reportData = { summary: {}, details: [] }; // Implement
			break;
		case 'expense_by_category':
			reportData = { summary: {}, details: [] }; // Implement
			break;
		default:
			reportData = { summary: {}, details: [] };
	}

	return reportData;
}

/**
 * Create a new report definition
 */
export async function createReport(input: Omit<NewReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<Report> {
	const [report] = await db.insert(reports).values(input).returning();
	return report;
}

/**
 * Get report by ID
 */
export async function getReportById(id: number, userId: string): Promise<Report | null> {
	const report = await db.query.reports.findFirst({
		where: and(
			eq(reports.id, id),
			eq(reports.userId, userId)
		),
	});

	return report || null;
}

/**
 * Get all reports for a user
 */
export async function getReports(userId: string, options?: {
	type?: string;
	isFavorite?: boolean;
	limit?: number;
	offset?: number;
}) {
	const conditions = [eq(reports.userId, userId)];

	if (options?.type) {
		conditions.push(eq(reports.type, options.type));
	}

	if (options?.isFavorite !== undefined) {
		conditions.push(eq(reports.isFavorite, options.isFavorite));
	}

	const results = await db.query.reports.findMany({
		where: and(...conditions),
		orderBy: [desc(reports.updatedAt)],
		limit: options?.limit || 50,
		offset: options?.offset || 0,
	});

	return results;
}

/**
 * Update report
 */
export async function updateReport(
	id: number,
	userId: string,
	updates: Partial<NewReport>
): Promise<Report> {
	const [updated] = await db.update(reports)
		.set({
			...updates,
			updatedAt: new Date(),
		})
		.where(and(
			eq(reports.id, id),
			eq(reports.userId, userId)
		))
		.returning();

	return updated;
}

/**
 * Delete report
 */
export async function deleteReport(id: number, userId: string): Promise<void> {
	await db.delete(reports)
		.where(and(
			eq(reports.id, id),
			eq(reports.userId, userId)
		));
}

/**
 * Run report and save to history
 */
export async function runReport(reportId: number, userId: string): Promise<ReportHistory> {
	const report = await getReportById(reportId, userId);
	if (!report) {
		throw new Error('Report not found');
	}

	const startTime = Date.now();

	// Generate report data
	const data = await generateReport({
		userId,
		type: report.type as GenerateReportInput['type'],
		dateRange: report.config.dateRange 
			? {
				start: new Date(report.config.dateRange.start),
				end: new Date(report.config.dateRange.end),
			}
			: {
				start: new Date(new Date().setDate(1)), // First of month
				end: new Date(), // Today
			},
		filters: report.config.filters,
		groupBy: report.config.groupBy,
		metrics: report.config.metrics,
		comparePeriod: report.config.comparePeriod,
	});

	const executionTime = Date.now() - startTime;

	// Save to history
	const [history] = await db.insert(reportHistory).values({
		reportId,
		userId,
		data,
		generatedBy: 'user',
		periodStart: report.config.dateRange?.start 
			? new Date(report.config.dateRange.start) 
			: new Date(new Date().setDate(1)),
		periodEnd: report.config.dateRange?.end 
			? new Date(report.config.dateRange.end) 
			: new Date(),
		executionTime,
		dataPoints: data.details.length,
	}).returning();

	// Update report last run time
	await db.update(reports)
		.set({ lastRunAt: new Date() })
		.where(eq(reports.id, reportId));

	return history;
}

/**
 * Get report history
 */
export async function getReportHistory(
	reportId: number,
	userId: string,
	limit: number = 10
) {
	return await db.query.reportHistory.findMany({
		where: and(
			eq(reportHistory.reportId, reportId),
			eq(reportHistory.userId, userId)
		),
		orderBy: [desc(reportHistory.createdAt)],
		limit,
	});
}

/**
 * Get report templates
 */
export async function getReportTemplates(category?: string) {
	try {
		const conditions = [];
		if (category) {
			conditions.push(eq(reportTemplates.category, category));
		}

		return await db.query.reportTemplates.findMany({
			where: conditions.length > 0 ? and(...conditions) : undefined,
			orderBy: [desc(reportTemplates.isPopular), reportTemplates.name],
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		if (errorMessage.includes('column "user_id" does not exist') || 
		    errorMessage.includes('does not exist')) {
			console.warn('[Report Templates] Table or column not found, returning empty array:', errorMessage);
			return [];
		}
		throw error;
	}
}

/**
 * Create report from template
 */
export async function createReportFromTemplate(
	templateId: number,
	userId: string,
	customizations?: Partial<NewReport>
): Promise<Report> {
	const template = await db.query.reportTemplates.findFirst({
		where: eq(reportTemplates.id, templateId),
	});

	if (!template) {
		throw new Error('Template not found');
	}

	const report = await createReport({
		userId,
		name: customizations?.name || template.name,
		description: customizations?.description || template.description,
		type: template.type,
		config: customizations?.config || template.config,
		...customizations,
	});

	// Increment template usage count
	await db.update(reportTemplates)
		.set({ usageCount: (template.usageCount || 0) + 1 })
		.where(eq(reportTemplates.id, templateId));

	return report;
}

// Export all report service functions
export const ReportService = {
	generate: generateReport,
	create: createReport,
	getById: getReportById,
	getAll: getReports,
	update: updateReport,
	delete: deleteReport,
	run: runReport,
	getHistory: getReportHistory,
	getTemplates: getReportTemplates,
	createFromTemplate: createReportFromTemplate,
};

