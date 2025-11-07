/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import {
	decimal,
	pgTable,
	text,
	timestamp,
	uuid,
	jsonb,
	boolean,
	integer,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";

// Enhanced analytics table with more comprehensive metrics
export const analytics = pgTable("analytics", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").references(() => users.id).notNull(),
	metric: text("metric").notNull(), // e.g., "revenue", "expenses", "profit", "forecast_accuracy"
	value: decimal("value", { precision: 15, scale: 2 }).notNull(),
	currency: text("currency").default("USD"),
	period: text("period").notNull(), // e.g., "2024-01", "2024-Q1", "2024"
	periodType: text("period_type", { enum: ["daily", "weekly", "monthly", "quarterly", "yearly"] }).notNull(),
	entityType: text("entity_type"), // e.g., "invoice", "expense", "client", "forecast"
	entityId: uuid("entity_id"), // Reference to specific entity if applicable
	metadata: jsonb("metadata"), // JSON for additional data like confidence intervals, model parameters
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// Custom reports and dashboards
export const customReports = pgTable("custom_reports", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").references(() => users.id).notNull(),
	name: text("name").notNull(),
	description: text("description"),
	type: text("type", { enum: ["dashboard", "report", "kpi"] }).notNull(),
	config: jsonb("config").notNull(), // Chart configurations, filters, layout
	widgets: jsonb("widgets"), // Array of widget configurations
	filters: jsonb("filters"), // Global filters applied to the report
	isPublic: boolean("is_public").default(false),
	isTemplate: boolean("is_template").default(false),
	tags: text("tags").array(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// Report executions and results
export const reportExecutions = pgTable("report_executions", {
	id: uuid("id").primaryKey().defaultRandom(),
	reportId: uuid("report_id").references(() => customReports.id).notNull(),
	userId: uuid("user_id").references(() => users.id).notNull(),
	parameters: jsonb("parameters"), // Parameters used for execution
	results: jsonb("results"), // Cached results
	status: text("status", { enum: ["pending", "running", "completed", "failed"] }).default("pending"),
	error: text("error"),
	executedAt: timestamp("executed_at").defaultNow(),
	createdAt: timestamp("created_at").defaultNow(),
});

// Benchmarking data
export const benchmarks = pgTable("benchmarks", {
	id: uuid("id").primaryKey().defaultRandom(),
	industry: text("industry").notNull(), // e.g., "SaaS", "Consulting", "E-commerce"
	metric: text("metric").notNull(), // e.g., "revenue_growth", "profit_margin", "cac_ltv_ratio"
	period: text("period").notNull(), // e.g., "2024-Q1", "annual"
	percentile25: decimal("percentile_25", { precision: 10, scale: 2 }),
	percentile50: decimal("percentile_50", { precision: 10, scale: 2 }),
	percentile75: decimal("percentile_75", { precision: 10, scale: 2 }),
	percentile90: decimal("percentile_90", { precision: 10, scale: 2 }),
	sampleSize: integer("sample_size"),
	source: text("source"), // e.g., "industry_report", "survey"
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// User benchmarking comparisons
export const userBenchmarks = pgTable("user_benchmarks", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").references(() => users.id).notNull(),
	benchmarkId: uuid("benchmark_id").references(() => benchmarks.id).notNull(),
	userValue: decimal("user_value", { precision: 15, scale: 2 }),
	percentile: integer("percentile"), // User's percentile ranking
	industryAverage: decimal("industry_average", { precision: 10, scale: 2 }),
	comparison: text("comparison", { enum: ["above_average", "average", "below_average"] }),
	calculatedAt: timestamp("calculated_at").defaultNow(),
	createdAt: timestamp("created_at").defaultNow(),
});

// Predictive model results
export const predictiveModels = pgTable("predictive_models", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").references(() => users.id).notNull(),
	modelType: text("model_type", { enum: ["revenue_forecast", "expense_forecast", "cash_flow", "seasonality"] }).notNull(),
	horizon: integer("horizon").notNull(), // Forecast horizon in months
	parameters: jsonb("parameters"), // Model parameters and configuration
	accuracy: decimal("accuracy", { precision: 5, scale: 2 }), // Model accuracy percentage
	results: jsonb("results").notNull(), // Forecast data and confidence intervals
	trainingData: jsonb("training_data"), // Summary of training data used
	lastUpdated: timestamp("last_updated").defaultNow(),
	createdAt: timestamp("created_at").defaultNow(),
});

// Investor portal configurations
export const investorPortals = pgTable("investor_portals", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").references(() => users.id).notNull(),
	name: text("name").notNull(),
	description: text("description"),
	logo: text("logo"), // URL to logo image
	primaryColor: text("primary_color").default("#3b82f6"),
	allowedMetrics: text("allowed_metrics").array(), // Metrics investors can view
	allowedReports: uuid("allowed_reports").references(() => customReports.id).array(),
	accessToken: text("access_token").notNull().unique(),
	expiresAt: timestamp("expires_at"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// Investor portal access logs
export const investorAccessLogs = pgTable("investor_access_logs", {
	id: uuid("id").primaryKey().defaultRandom(),
	portalId: uuid("portal_id").references(() => investorPortals.id).notNull(),
	accessToken: text("access_token").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	accessedAt: timestamp("accessed_at").defaultNow(),
	sessionDuration: integer("session_duration"), // in seconds
	metricsViewed: text("metrics_viewed").array(),
	reportsAccessed: uuid("reports_accessed").references(() => customReports.id).array(),
});

// Landing page analytics
export const landingPageAnalytics = pgTable("landing_page_analytics", {
	id: uuid("id").primaryKey().defaultRandom(),
	landingPageId: integer("landing_page_id").notNull(),
	eventType: text("event_type").notNull(), // 'page_view', 'cta_click', 'form_submit', 'link_click'
	timestamp: timestamp("timestamp").defaultNow().notNull(),
	sessionId: text("session_id").notNull(),
	userId: text("user_id"),
	referrer: text("referrer"),
	deviceType: text("device_type"), // 'desktop', 'mobile', 'tablet'
	userAgent: text("user_agent"),
	ipAddress: text("ip_address"),
	metadata: jsonb("metadata"),
	createdAt: timestamp("created_at").defaultNow(),
});
