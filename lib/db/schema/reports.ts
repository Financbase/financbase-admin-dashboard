/**
 * Database schema for reports and analytics
 */

import { pgTable, serial, text, timestamp, jsonb, integer, boolean } from 'drizzle-orm/pg-core';

/**
 * Reports Table
 * Stores report definitions and metadata
 */
export const reports = pgTable('financbase_reports', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),
	
	// Report identification
	name: text('name').notNull(),
	description: text('description'),
	type: text('type').notNull(), // 'profit_loss', 'cash_flow', 'balance_sheet', 'custom'
	
	// Report configuration
	config: jsonb('config').$type<{
		dateRange?: {
			start: string;
			end: string;
			preset?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
		};
		filters?: Record<string, unknown>;
		groupBy?: string[];
		metrics?: string[];
		comparePeriod?: boolean;
	}>().notNull(),
	
	// Display settings
	visualizationType: text('visualization_type'), // 'table', 'chart', 'combined'
	chartConfig: jsonb('chart_config').$type<{
		type?: 'line' | 'bar' | 'pie' | 'area';
		colors?: string[];
		showLegend?: boolean;
	}>(),
	
	// Sharing and permissions
	isPublic: boolean('is_public').default(false),
	sharedWith: jsonb('shared_with').$type<string[]>(),
	
	// Status
	isTemplate: boolean('is_template').default(false),
	isFavorite: boolean('is_favorite').default(false),
	
	// Metadata
	tags: jsonb('tags').$type<string[]>(),
	lastRunAt: timestamp('last_run_at'),
	
	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Report Schedules Table
 * Automated report generation and delivery
 */
export const reportSchedules = pgTable('financbase_report_schedules', {
	id: serial('id').primaryKey(),
	reportId: integer('report_id').references(() => reports.id).notNull(),
	userId: text('user_id').notNull(),
	
	// Schedule configuration
	frequency: text('frequency').notNull(), // 'daily', 'weekly', 'monthly', 'quarterly'
	dayOfWeek: integer('day_of_week'), // 0-6 for weekly
	dayOfMonth: integer('day_of_month'), // 1-31 for monthly
	time: text('time').notNull(), // HH:MM format
	timezone: text('timezone').default('UTC'),
	
	// Delivery settings
	deliveryMethod: text('delivery_method').notNull(), // 'email', 'slack', 'webhook'
	recipients: jsonb('recipients').$type<Array<{
		type: 'email' | 'slack' | 'webhook';
		address: string;
		format?: 'pdf' | 'excel' | 'json';
	}>>().notNull(),
	
	// Status
	isActive: boolean('is_active').default(true),
	lastRunAt: timestamp('last_run_at'),
	nextRunAt: timestamp('next_run_at'),
	
	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Report History Table
 * Stores generated report snapshots
 */
export const reportHistory = pgTable('financbase_report_history', {
	id: serial('id').primaryKey(),
	reportId: integer('report_id').references(() => reports.id).notNull(),
	userId: text('user_id').notNull(),
	
	// Report data
	data: jsonb('data').notNull(), // Snapshot of report results
	
	// Generation details
	generatedBy: text('generated_by'), // 'user' or 'schedule'
	scheduleId: integer('schedule_id').references(() => reportSchedules.id),
	
	// Period covered
	periodStart: timestamp('period_start').notNull(),
	periodEnd: timestamp('period_end').notNull(),
	
	// Export files
	pdfUrl: text('pdf_url'),
	excelUrl: text('excel_url'),
	
	// Metadata
	executionTime: integer('execution_time'), // milliseconds
	dataPoints: integer('data_points'),
	
	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Report Templates Table
 * Pre-built report templates
 */
export const reportTemplates = pgTable('financbase_report_templates', {
	id: serial('id').primaryKey(),
	
	// Template details
	name: text('name').notNull(),
	description: text('description'),
	category: text('category').notNull(), // 'financial', 'operational', 'compliance'
	type: text('type').notNull(),
	
	// Template configuration
	config: jsonb('config').notNull(),
	
	// Display
	thumbnail: text('thumbnail'),
	icon: text('icon'),
	
	// Metadata
	isDefault: boolean('is_default').default(false),
	isPopular: boolean('is_popular').default(false),
	usageCount: integer('usage_count').default(0),
	
	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Type exports
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;

export type ReportSchedule = typeof reportSchedules.$inferSelect;
export type NewReportSchedule = typeof reportSchedules.$inferInsert;

export type ReportHistory = typeof reportHistory.$inferSelect;
export type NewReportHistory = typeof reportHistory.$inferInsert;

export type ReportTemplate = typeof reportTemplates.$inferSelect;
export type NewReportTemplate = typeof reportTemplates.$inferInsert;

