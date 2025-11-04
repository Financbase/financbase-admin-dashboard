/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { pgTable, text, integer, decimal, timestamp, boolean, uuid, jsonb } from "drizzle-orm/pg-core";
import { z } from "zod";

// Properties table
// Note: Database uses VARCHAR for properties.id, not UUID
export const properties = pgTable("properties", {
	id: text("id").primaryKey(), // Database uses VARCHAR, not UUID
	userId: text("user_id").notNull(),
	name: text("name"),
	address: text("address"),
	city: text("city"),
	state: text("state"),
	zipCode: text("zip_code"),
	country: text("country").default("US"),
	propertyType: text("property_type"), // 'residential', 'commercial', 'mixed'
	purchasePrice: decimal("purchase_price", { precision: 15, scale: 2 }),
	currentValue: decimal("current_value", { precision: 15, scale: 2 }),
	squareFootage: integer("square_footage"),
	yearBuilt: integer("year_built"),
	bedrooms: integer("bedrooms"),
	bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }),
	parkingSpaces: integer("parking_spaces").default(0),
	description: text("description"),
	status: text("status").default("active"), // 'active', 'inactive', 'sold', 'maintenance'
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at"),
});

// Property expenses table
export const propertyExpenses = pgTable("property_expenses", {
	id: uuid("id").primaryKey().defaultRandom(),
	propertyId: text("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(), // VARCHAR reference
	userId: text("user_id").notNull(),
	category: text("category").notNull(), // 'maintenance', 'utilities', 'insurance', 'taxes', 'management', 'other'
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	description: text("description"),
	date: timestamp("date").notNull(),
	expenseDate: timestamp("expense_date").notNull(), // Alias for date
	isRecurring: boolean("is_recurring").default(false),
	recurringFrequency: text("recurring_frequency"), // 'monthly', 'quarterly', 'yearly'
	vendor: text("vendor"),
	receiptUrl: text("receipt_url"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Property income table
export const propertyIncome = pgTable("property_income", {
	id: uuid("id").primaryKey().defaultRandom(),
	propertyId: text("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(), // VARCHAR reference
	userId: text("user_id").notNull(),
	source: text("source").notNull(), // 'rent', 'parking', 'laundry', 'other'
	incomeType: text("income_type").notNull(), // 'rent', 'late_fee', 'pet_fee', 'parking', 'laundry', 'other'
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	description: text("description"),
	date: timestamp("date").notNull(),
	incomeDate: timestamp("income_date").notNull(), // Alias for date
	paymentStatus: text("payment_status").default("pending"), // 'pending', 'received', 'late', 'missed'
	isRecurring: boolean("is_recurring").default(true),
	recurringFrequency: text("recurring_frequency"), // 'monthly', 'weekly', etc.
	tenantId: uuid("tenant_id").references(() => tenants.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Property valuations table
export const propertyValuations = pgTable("property_valuations", {
	id: uuid("id").primaryKey().defaultRandom(),
	propertyId: text("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(), // VARCHAR reference
	userId: text("user_id").notNull(),
	valuationDate: timestamp("valuation_date").notNull(),
	estimatedValue: decimal("estimated_value", { precision: 15, scale: 2 }).notNull(),
	appraisalValue: decimal("appraisal_value", { precision: 15, scale: 2 }),
	source: text("source").notNull(), // 'appraisal', 'zestimate', 'manual', 'mls'
	notes: text("notes"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tenants table
export const tenants = pgTable("tenants", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull(),
	propertyId: text("property_id").references(() => properties.id, { onDelete: "cascade" }), // VARCHAR reference
	unitId: uuid("unit_id").references(() => propertyUnits.id),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	email: text("email"),
	phone: text("phone"),
	dateOfBirth: timestamp("date_of_birth"),
	ssn: text("ssn"), // encrypted
	emergencyContact: jsonb("emergency_contact"), // { name: string, phone: string, relationship: string }
	currentAddress: text("current_address"),
	employmentInfo: jsonb("employment_info"), // { employer: string, position: string, income: number }
	creditScore: integer("credit_score"),
	backgroundCheckStatus: text("background_check_status").default("pending"), // 'pending', 'approved', 'rejected'
	backgroundCheckDate: timestamp("background_check_date"),
	status: text("status").default("active"), // 'active', 'inactive', 'evicted', 'notice'
	notes: text("notes"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Property units table
export const propertyUnits = pgTable("property_units", {
	id: uuid("id").primaryKey().defaultRandom(),
	propertyId: text("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(), // VARCHAR reference
	userId: text("user_id").notNull(),
	unitNumber: text("unit_number").notNull(),
	bedrooms: integer("bedrooms").notNull(),
	bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }).notNull(),
	squareFootage: integer("square_footage"),
	monthlyRent: decimal("monthly_rent", { precision: 8, scale: 2 }),
	isOccupied: boolean("is_occupied").default(false),
	tenantId: uuid("tenant_id").references(() => tenants.id),
	leaseStartDate: timestamp("lease_start_date"),
	leaseEndDate: timestamp("lease_end_date"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Leases table
export const leases = pgTable("leases", {
	id: uuid("id").primaryKey().defaultRandom(),
	propertyId: text("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(), // VARCHAR reference
	unitId: uuid("unit_id").references(() => propertyUnits.id),
	tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
	userId: text("user_id").notNull(),
	leaseStartDate: timestamp("lease_start_date").notNull(),
	leaseEndDate: timestamp("lease_end_date").notNull(),
	startDate: timestamp("start_date").notNull(), // Alias for leaseStartDate
	endDate: timestamp("end_date").notNull(), // Alias for leaseEndDate
	monthlyRent: decimal("monthly_rent", { precision: 8, scale: 2 }).notNull(),
	securityDeposit: decimal("security_deposit", { precision: 8, scale: 2 }).notNull(),
	depositPaid: boolean("deposit_paid").default(false),
	depositReturned: boolean("deposit_returned").default(false),
	depositReturnDate: timestamp("deposit_return_date"),
	leaseTerms: jsonb("lease_terms"), // additional terms and conditions
	specialClauses: text("special_clauses"),
	status: text("status").default("active"), // 'active', 'expired', 'terminated', 'pending'
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Property ROI table
export const propertyROI = pgTable("property_roi", {
	id: uuid("id").primaryKey().defaultRandom(),
	propertyId: text("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(), // VARCHAR reference
	userId: text("user_id").notNull(),
	calculationDate: timestamp("calculation_date").defaultNow().notNull(),
	totalInvestment: decimal("total_investment", { precision: 15, scale: 2 }).notNull(),
	currentValue: decimal("current_value", { precision: 15, scale: 2 }).notNull(),
	totalIncome: decimal("total_income", { precision: 15, scale: 2 }).notNull(),
	totalExpenses: decimal("total_expenses", { precision: 15, scale: 2 }).notNull(),
	netIncome: decimal("net_income", { precision: 15, scale: 2 }).notNull(),
	roi: decimal("roi", { precision: 8, scale: 4 }).notNull(),
	cashFlow: decimal("cash_flow", { precision: 10, scale: 2 }).notNull(),
	capRate: decimal("cap_rate", { precision: 6, scale: 4 }).notNull(),
	cashOnCashReturn: decimal("cash_on_cash_return", { precision: 6, scale: 4 }).notNull(),
	appreciation: decimal("appreciation", { precision: 10, scale: 2 }).notNull(),
	// Missing properties that services are trying to access
	occupancyRate: decimal("occupancy_rate", { precision: 5, scale: 2 }),
	totalReturn: decimal("total_return", { precision: 15, scale: 2 }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Maintenance requests table
export const maintenanceRequests = pgTable("maintenance_requests", {
	id: uuid("id").primaryKey().defaultRandom(),
	propertyId: text("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(), // VARCHAR reference
	unitId: uuid("unit_id").references(() => propertyUnits.id),
	tenantId: uuid("tenant_id").references(() => tenants.id),
	userId: text("user_id").notNull(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	category: text("category").notNull(), // 'plumbing', 'electrical', 'hvac', 'structural', 'cosmetic', 'other'
	priority: text("priority").notNull(), // 'low', 'medium', 'high', 'emergency'
	status: text("status").default("pending"), // 'pending', 'in_progress', 'completed', 'cancelled'
	reportedDate: timestamp("reported_date").defaultNow().notNull(),
	scheduledDate: timestamp("scheduled_date"),
	completedDate: timestamp("completed_date"),
	assignedTo: text("assigned_to"), // contractor/vendor name
	estimatedCost: decimal("estimated_cost", { precision: 8, scale: 2 }),
	actualCost: decimal("actual_cost", { precision: 8, scale: 2 }),
	notes: text("notes"),
	photos: jsonb("photos"), // array of photo URLs
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type definitions
export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;

export type PropertyExpense = typeof propertyExpenses.$inferSelect;
export type NewPropertyExpense = typeof propertyExpenses.$inferInsert;

export type PropertyIncome = typeof propertyIncome.$inferSelect;
export type NewPropertyIncome = typeof propertyIncome.$inferInsert;

export type PropertyValuation = typeof propertyValuations.$inferSelect;
export type NewPropertyValuation = typeof propertyValuations.$inferInsert;

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;

export type PropertyUnit = typeof propertyUnits.$inferSelect;
export type NewPropertyUnit = typeof propertyUnits.$inferInsert;

export type Lease = typeof leases.$inferSelect;
export type NewLease = typeof leases.$inferInsert;

export type PropertyROI = typeof propertyROI.$inferSelect;
export type NewPropertyROI = typeof propertyROI.$inferInsert;

export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type NewMaintenanceRequest = typeof maintenanceRequests.$inferInsert;

// Zod schemas for validation using manual definitions
export const propertySchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	name: z.string(),
	address: z.string(),
	city: z.string(),
	state: z.string(),
	zipCode: z.string(),
	country: z.string().default("US"),
	propertyType: z.string(),
	purchasePrice: z.number(),
	currentValue: z.number().optional(),
	squareFootage: z.number().optional(),
	yearBuilt: z.number().optional(),
	bedrooms: z.number().optional(),
	bathrooms: z.number().optional(),
	parkingSpaces: z.number().default(0),
	description: z.string().optional(),
	status: z.string().default("active"),
	isActive: z.boolean().default(true),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const newPropertySchema = propertySchema.omit({ id: true, createdAt: true, updatedAt: true });

export const propertyExpenseSchema = z.object({
	id: z.string().uuid(),
	propertyId: z.string().uuid(),
	userId: z.string(),
	category: z.string(),
	amount: z.number(),
	description: z.string().optional(),
	date: z.date(),
	expenseDate: z.date(),
	isRecurring: z.boolean().default(false),
	recurringFrequency: z.string().optional(),
	vendor: z.string().optional(),
	receiptUrl: z.string().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const newPropertyExpenseSchema = propertyExpenseSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const propertyIncomeSchema = z.object({
	id: z.string().uuid(),
	propertyId: z.string().uuid(),
	userId: z.string(),
	source: z.string(),
	incomeType: z.string(),
	amount: z.number(),
	description: z.string().optional(),
	date: z.date(),
	incomeDate: z.date(),
	paymentStatus: z.string().default("pending"),
	isRecurring: z.boolean().default(true),
	recurringFrequency: z.string().optional(),
	tenantId: z.string().uuid().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const newPropertyIncomeSchema = propertyIncomeSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const propertyValuationSchema = z.object({
	id: z.string().uuid(),
	propertyId: z.string().uuid(),
	userId: z.string(),
	valuationDate: z.date(),
	estimatedValue: z.number(),
	appraisalValue: z.number().optional(),
	source: z.string(),
	notes: z.string().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const newPropertyValuationSchema = propertyValuationSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const tenantSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	propertyId: z.string().uuid().optional(),
	unitId: z.string().uuid().optional(),
	firstName: z.string(),
	lastName: z.string(),
	email: z.string().optional(),
	phone: z.string().optional(),
	dateOfBirth: z.date().optional(),
	ssn: z.string().optional(),
	emergencyContact: z.any().optional(),
	currentAddress: z.string().optional(),
	employmentInfo: z.any().optional(),
	creditScore: z.number().optional(),
	backgroundCheckStatus: z.string().default("pending"),
	backgroundCheckDate: z.date().optional(),
	status: z.string().default("active"),
	notes: z.string().optional(),
	isActive: z.boolean().default(true),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const newTenantSchema = tenantSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const propertyUnitSchema = z.object({
	id: z.string().uuid(),
	propertyId: z.string().uuid(),
	userId: z.string(),
	unitNumber: z.string(),
	bedrooms: z.number(),
	bathrooms: z.number(),
	squareFootage: z.number().optional(),
	monthlyRent: z.number().optional(),
	isOccupied: z.boolean().default(false),
	tenantId: z.string().uuid().optional(),
	leaseStartDate: z.date().optional(),
	leaseEndDate: z.date().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const newPropertyUnitSchema = propertyUnitSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const leaseSchema = z.object({
	id: z.string().uuid(),
	propertyId: z.string().uuid(),
	unitId: z.string().uuid().optional(),
	tenantId: z.string().uuid(),
	userId: z.string(),
	leaseStartDate: z.date(),
	leaseEndDate: z.date(),
	startDate: z.date(),
	endDate: z.date(),
	monthlyRent: z.number(),
	securityDeposit: z.number(),
	depositPaid: z.boolean().default(false),
	depositReturned: z.boolean().default(false),
	depositReturnDate: z.date().optional(),
	leaseTerms: z.any().optional(),
	specialClauses: z.string().optional(),
	status: z.string().default("active"),
	isActive: z.boolean().default(true),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const newLeaseSchema = leaseSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const propertyROISchema = z.object({
	id: z.string().uuid(),
	propertyId: z.string().uuid(),
	userId: z.string(),
	calculationDate: z.date().default(new Date()),
	totalInvestment: z.number(),
	currentValue: z.number(),
	totalIncome: z.number(),
	totalExpenses: z.number(),
	netIncome: z.number(),
	roi: z.number(),
	cashFlow: z.number(),
	capRate: z.number(),
	cashOnCashReturn: z.number(),
	appreciation: z.number(),
	occupancyRate: z.number().optional(),
	totalReturn: z.number().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const newPropertyROISchema = propertyROISchema.omit({ id: true, createdAt: true, updatedAt: true });

export const maintenanceRequestSchema = z.object({
	id: z.string().uuid(),
	propertyId: z.string().uuid(),
	unitId: z.string().uuid().optional(),
	tenantId: z.string().uuid().optional(),
	userId: z.string(),
	title: z.string(),
	description: z.string(),
	category: z.string(),
	priority: z.string(),
	status: z.string().default("pending"),
	reportedDate: z.date().default(new Date()),
	scheduledDate: z.date().optional(),
	completedDate: z.date().optional(),
	assignedTo: z.string().optional(),
	estimatedCost: z.number().optional(),
	actualCost: z.number().optional(),
	notes: z.string().optional(),
	photos: z.any().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const newMaintenanceRequestSchema = maintenanceRequestSchema.omit({ id: true, createdAt: true, updatedAt: true });