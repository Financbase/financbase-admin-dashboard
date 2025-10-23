import { pgTable, text, integer, decimal, timestamp, boolean, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Properties table
export const properties = pgTable("properties", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull(),
	name: text("name").notNull(),
	address: text("address").notNull(),
	city: text("city").notNull(),
	state: text("state").notNull(),
	zipCode: text("zip_code").notNull(),
	country: text("country").default("US"),
	propertyType: text("property_type").notNull(), // 'residential', 'commercial', 'mixed'
	purchasePrice: decimal("purchase_price", { precision: 15, scale: 2 }).notNull(),
	currentValue: decimal("current_value", { precision: 15, scale: 2 }),
	squareFootage: integer("square_footage"),
	yearBuilt: integer("year_built"),
	bedrooms: integer("bedrooms"),
	bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }),
	parkingSpaces: integer("parking_spaces").default(0),
	description: text("description"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Property expenses table
export const propertyExpenses = pgTable("property_expenses", {
	id: uuid("id").primaryKey().defaultRandom(),
	propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
	userId: text("user_id").notNull(),
	category: text("category").notNull(), // 'maintenance', 'utilities', 'insurance', 'taxes', 'management', 'other'
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	description: text("description"),
	date: timestamp("date").notNull(),
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
	propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
	userId: text("user_id").notNull(),
	source: text("source").notNull(), // 'rent', 'parking', 'laundry', 'other'
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	description: text("description"),
	date: timestamp("date").notNull(),
	isRecurring: boolean("is_recurring").default(true),
	recurringFrequency: text("recurring_frequency"), // 'monthly', 'weekly', etc.
	tenantId: uuid("tenant_id").references(() => tenants.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Property valuations table
export const propertyValuations = pgTable("property_valuations", {
	id: uuid("id").primaryKey().defaultRandom(),
	propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
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
	notes: text("notes"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Property units table
export const propertyUnits = pgTable("property_units", {
	id: uuid("id").primaryKey().defaultRandom(),
	propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
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
	propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
	unitId: uuid("unit_id").references(() => propertyUnits.id),
	tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
	userId: text("user_id").notNull(),
	leaseStartDate: timestamp("lease_start_date").notNull(),
	leaseEndDate: timestamp("lease_end_date").notNull(),
	monthlyRent: decimal("monthly_rent", { precision: 8, scale: 2 }).notNull(),
	securityDeposit: decimal("security_deposit", { precision: 8, scale: 2 }).notNull(),
	depositPaid: boolean("deposit_paid").default(false),
	depositReturned: boolean("deposit_returned").default(false),
	depositReturnDate: timestamp("deposit_return_date"),
	leaseTerms: jsonb("lease_terms"), // additional terms and conditions
	specialClauses: text("special_clauses"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Property ROI table
export const propertyROI = pgTable("property_roi", {
	id: uuid("id").primaryKey().defaultRandom(),
	propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
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
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Maintenance requests table
export const maintenanceRequests = pgTable("maintenance_requests", {
	id: uuid("id").primaryKey().defaultRandom(),
	propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
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

// Zod schemas for validation
export const propertySchema = createSelectSchema(properties);
export const newPropertySchema = createInsertSchema(properties);

export const propertyExpenseSchema = createSelectSchema(propertyExpenses);
export const newPropertyExpenseSchema = createInsertSchema(propertyExpenses);

export const propertyIncomeSchema = createSelectSchema(propertyIncome);
export const newPropertyIncomeSchema = createInsertSchema(propertyIncome);

export const propertyValuationSchema = createSelectSchema(propertyValuations);
export const newPropertyValuationSchema = createInsertSchema(propertyValuations);

export const tenantSchema = createSelectSchema(tenants);
export const newTenantSchema = createInsertSchema(tenants);

export const propertyUnitSchema = createSelectSchema(propertyUnits);
export const newPropertyUnitSchema = createInsertSchema(propertyUnits);

export const leaseSchema = createSelectSchema(leases);
export const newLeaseSchema = createInsertSchema(leases);

export const propertyROISchema = createSelectSchema(propertyROI);
export const newPropertyROISchema = createInsertSchema(propertyROI);

export const maintenanceRequestSchema = createSelectSchema(maintenanceRequests);
export const newMaintenanceRequestSchema = createInsertSchema(maintenanceRequests);