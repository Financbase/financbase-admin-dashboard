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

// Import base real estate tables
export * from "./real-estate.schema";
import { properties, propertyUnits, tenants } from "./real-estate.schema";

// Contractors table
export const contractors = pgTable("contractors", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	companyName: text("company_name"),
	email: text("email").notNull(),
	phone: text("phone").notNull(),
	licenseNumber: text("license_number"),
	specialties: jsonb("specialties"), // array of specialties
	serviceAreas: jsonb("service_areas"), // array of zip codes/cities
	rating: decimal("rating", { precision: 3, scale: 2 }),
	reviewCount: integer("review_count").default(0),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Projects table (for contractor projects)
export const contractorProjects = pgTable("contractor_projects", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull(),
	propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }),
	contractorId: uuid("contractor_id").references(() => contractors.id, { onDelete: "set null" }),
	title: text("title").notNull(),
	description: text("description"),
	category: text("category").notNull(), // 'maintenance', 'renovation', 'repair', 'construction'
	status: text("status").default("pending"), // 'pending', 'in_progress', 'completed', 'cancelled'
	priority: text("priority").default("medium"), // 'low', 'medium', 'high', 'emergency'
	estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
	actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
	startDate: timestamp("start_date"),
	endDate: timestamp("end_date"),
	completionDate: timestamp("completion_date"),
	notes: text("notes"),
	photos: jsonb("photos"), // array of photo URLs
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Project tasks table
export const projectTasks = pgTable("project_tasks", {
	id: uuid("id").primaryKey().defaultRandom(),
	projectId: uuid("project_id").references(() => contractorProjects.id, { onDelete: "cascade" }).notNull(),
	userId: text("user_id").notNull(),
	title: text("title").notNull(),
	description: text("description"),
	status: text("status").default("pending"), // 'pending', 'in_progress', 'completed'
	assignedTo: text("assigned_to"),
	estimatedHours: decimal("estimated_hours", { precision: 6, scale: 2 }),
	actualHours: decimal("actual_hours", { precision: 6, scale: 2 }),
	dueDate: timestamp("due_date"),
	completedDate: timestamp("completed_date"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Service requests table
export const serviceRequests = pgTable("service_requests", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull(),
	propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }),
	tenantId: uuid("tenant_id").references(() => tenants.id),
	contractorId: uuid("contractor_id").references(() => contractors.id),
	title: text("title").notNull(),
	description: text("description").notNull(),
	category: text("category").notNull(), // 'plumbing', 'electrical', 'hvac', 'appliance', 'other'
	priority: text("priority").default("medium"), // 'low', 'medium', 'high', 'emergency'
	status: text("status").default("pending"), // 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'
	requestedDate: timestamp("requested_date").defaultNow().notNull(),
	requestDate: timestamp("request_date").defaultNow().notNull(), // Alias for requestedDate
	scheduledDate: timestamp("scheduled_date"),
	completedDate: timestamp("completed_date"),
	estimatedCost: decimal("estimated_cost", { precision: 8, scale: 2 }),
	actualCost: decimal("actual_cost", { precision: 8, scale: 2 }),
	notes: text("notes"),
	photos: jsonb("photos"), // array of photo URLs
	rating: integer("rating"), // 1-5 stars
	review: text("review"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tenant applications table
export const tenantApplications = pgTable("tenant_applications", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull(),
	propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
	unitId: uuid("unit_id").references(() => propertyUnits.id),
	tenantId: uuid("tenant_id").references(() => tenants.id),
	applicantId: uuid("applicant_id").references(() => tenants.id), // References the applicant (tenant)
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	email: text("email").notNull(),
	phone: text("phone").notNull(),
	dateOfBirth: timestamp("date_of_birth"),
	ssn: text("ssn"), // encrypted
	currentAddress: text("current_address"),
	employmentInfo: jsonb("employment_info"), // { employer, position, income, supervisor_contact }
	incomeVerification: jsonb("income_verification"), // documents and status
	creditReport: jsonb("credit_report"), // credit score and report data
	backgroundCheck: jsonb("background_check"), // background check results
	references: jsonb("references"), // landlord and personal references
	desiredMoveInDate: timestamp("desired_move_in_date"),
	leaseTerm: integer("lease_term"), // months
	monthlyIncome: decimal("monthly_income", { precision: 10, scale: 2 }),
	rentalAmount: decimal("rental_amount", { precision: 8, scale: 2 }), // Expected monthly rent
	applicationFee: decimal("application_fee", { precision: 6, scale: 2 }),
	status: text("status").default("pending"), // 'pending', 'under_review', 'approved', 'rejected', 'withdrawn'
	decisionDate: timestamp("decision_date"),
	notes: text("notes"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Lenders table
export const lenders = pgTable("lenders", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull(),
	name: text("name").notNull(),
	companyName: text("company_name"),
	email: text("email").notNull(),
	phone: text("phone"),
	website: text("website"),
	specialties: jsonb("specialties"), // array of loan types
	serviceAreas: jsonb("service_areas"), // array of zip codes/states
	rating: decimal("rating", { precision: 3, scale: 2 }),
	reviewCount: integer("review_count").default(0),
	licenseNumber: text("license_number"),
	nmlsId: text("nmls_id"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Loan applications table
export const loanApplications = pgTable("loan_applications", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull(),
	propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }),
	lenderId: uuid("lender_id").references(() => lenders.id, { onDelete: "set null" }),
	loanType: text("loan_type").notNull(), // 'conventional', 'fha', 'va', 'portfolio', 'hard_money'
	loanAmount: decimal("loan_amount", { precision: 15, scale: 2 }).notNull(),
	downPayment: decimal("down_payment", { precision: 15, scale: 2 }),
	interestRate: decimal("interest_rate", { precision: 5, scale: 3 }),
	loanTerm: integer("loan_term").notNull(), // months
	propertyValue: decimal("property_value", { precision: 15, scale: 2 }),
	lTV: decimal("ltv", { precision: 6, scale: 4 }), // loan-to-value ratio
	dti: decimal("dti", { precision: 6, scale: 4 }), // debt-to-income ratio
	creditScore: integer("credit_score"),
	applicationDate: timestamp("application_date").defaultNow().notNull(),
	status: text("status").default("pending"), // 'pending', 'under_review', 'approved', 'rejected', 'funded'
	approvalDate: timestamp("approval_date"),
	fundingDate: timestamp("funding_date"),
	closingDate: timestamp("closing_date"),
	notes: text("notes"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Real estate professionals table
export const realEstateProfessionals = pgTable("real_estate_professionals", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	companyName: text("company_name"),
	email: text("email").notNull(),
	phone: text("phone").notNull(),
	licenseNumber: text("license_number").notNull(),
	licenseType: text("license_type").notNull(), // 'realtor', 'broker', 'agent'
	specialties: jsonb("specialties"), // array of specialties
	serviceAreas: jsonb("service_areas"), // array of zip codes/cities
	yearsExperience: integer("years_experience"),
	rating: decimal("rating", { precision: 3, scale: 2 }),
	reviewCount: integer("review_count").default(0),
	website: text("website"),
	bio: text("bio"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Property listings table
export const propertyListings = pgTable("property_listings", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id").notNull(),
	propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }),
	professionalId: uuid("professional_id").references(() => realEstateProfessionals.id, { onDelete: "set null" }),
	realtorId: uuid("realtor_id").references(() => realEstateProfessionals.id, { onDelete: "set null" }), // Alias for professionalId
	listingType: text("listing_type").notNull(), // 'sale', 'rent', 'lease'
	listingPrice: decimal("listing_price", { precision: 15, scale: 2 }).notNull(),
	listingDate: timestamp("listing_date").defaultNow().notNull(),
	expirationDate: timestamp("expiration_date"),
	status: text("status").default("active"), // 'active', 'pending', 'sold', 'rented', 'expired', 'withdrawn'
	daysOnMarket: integer("days_on_market").default(0),
	mlsNumber: text("mls_number"),
	virtualTourUrl: text("virtual_tour_url"),
	listingPhotos: jsonb("listing_photos"), // array of photo URLs
	listingDescription: text("listing_description"),
	commission: decimal("commission", { precision: 8, scale: 2 }),
	commissionType: text("commission_type"), // 'percentage', 'flat_fee'
	showingInstructions: text("showing_instructions"),
	notes: text("notes"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type definitions
export type Contractor = typeof contractors.$inferSelect;
export type NewContractor = typeof contractors.$inferInsert;

export type ContractorProject = typeof contractorProjects.$inferSelect;
export type NewContractorProject = typeof contractorProjects.$inferInsert;

export type ProjectTask = typeof projectTasks.$inferSelect;
export type NewProjectTask = typeof projectTasks.$inferInsert;

export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type NewServiceRequest = typeof serviceRequests.$inferInsert;

export type TenantApplication = typeof tenantApplications.$inferSelect;
export type NewTenantApplication = typeof tenantApplications.$inferInsert;

export type Lender = typeof lenders.$inferSelect;
export type NewLender = typeof lenders.$inferInsert;

export type LoanApplication = typeof loanApplications.$inferSelect;
export type NewLoanApplication = typeof loanApplications.$inferInsert;

export type RealEstateProfessional = typeof realEstateProfessionals.$inferSelect;
export type NewRealEstateProfessional = typeof realEstateProfessionals.$inferInsert;

export type PropertyListing = typeof propertyListings.$inferSelect;
export type NewPropertyListing = typeof propertyListings.$inferInsert;

// Zod schemas for validation using manual definitions
export const contractorSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	companyName: z.string().optional(),
	email: z.string(),
	phone: z.string(),
	licenseNumber: z.string().optional(),
	specialties: z.any().optional(),
	serviceAreas: z.any().optional(),
	rating: z.number().optional(),
	reviewCount: z.number().default(0),
	isActive: z.boolean().default(true),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const newContractorSchema = contractorSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const projectSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	propertyId: z.string().uuid().optional(),
	contractorId: z.string().uuid().optional(),
	title: z.string(),
	description: z.string().optional(),
	category: z.string(),
	status: z.string().default("pending"),
	priority: z.string().default("medium"),
	estimatedCost: z.number().optional(),
	actualCost: z.number().optional(),
	startDate: z.date().optional(),
	endDate: z.date().optional(),
	completionDate: z.date().optional(),
	notes: z.string().optional(),
	photos: z.any().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const newProjectSchema = projectSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const projectTaskSchema = z.object({
	id: z.string().uuid(),
	projectId: z.string().uuid(),
	userId: z.string(),
	title: z.string(),
	description: z.string().optional(),
	status: z.string().default("pending"),
	assignedTo: z.string().optional(),
	estimatedHours: z.number().optional(),
	actualHours: z.number().optional(),
	dueDate: z.date().optional(),
	completedDate: z.date().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const newProjectTaskSchema = projectTaskSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const serviceRequestSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	propertyId: z.string().uuid().optional(),
	tenantId: z.string().uuid().optional(),
	contractorId: z.string().uuid().optional(),
	title: z.string(),
	description: z.string(),
	category: z.string(),
	priority: z.string().default("medium"),
	status: z.string().default("pending"),
	requestedDate: z.date().default(new Date()),
	requestDate: z.date().default(new Date()),
	scheduledDate: z.date().optional(),
	completedDate: z.date().optional(),
	estimatedCost: z.number().optional(),
	actualCost: z.number().optional(),
	notes: z.string().optional(),
	photos: z.any().optional(),
	rating: z.number().optional(),
	review: z.string().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const newServiceRequestSchema = serviceRequestSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const tenantApplicationSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	propertyId: z.string().uuid(),
	unitId: z.string().uuid().optional(),
	tenantId: z.string().uuid().optional(),
	applicantId: z.string().uuid().optional(),
	firstName: z.string(),
	lastName: z.string(),
	email: z.string(),
	phone: z.string(),
	dateOfBirth: z.date().optional(),
	ssn: z.string().optional(),
	currentAddress: z.string().optional(),
	employmentInfo: z.any().optional(),
	incomeVerification: z.any().optional(),
	creditReport: z.any().optional(),
	backgroundCheck: z.any().optional(),
	references: z.any().optional(),
	desiredMoveInDate: z.date().optional(),
	leaseTerm: z.number().optional(),
	monthlyIncome: z.number().optional(),
	rentalAmount: z.number().optional(),
	applicationFee: z.number().optional(),
	status: z.string().default("pending"),
	decisionDate: z.date().optional(),
	notes: z.string().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const newTenantApplicationSchema = tenantApplicationSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const lenderSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	name: z.string(),
	companyName: z.string().optional(),
	email: z.string(),
	phone: z.string().optional(),
	website: z.string().optional(),
	specialties: z.any().optional(),
	serviceAreas: z.any().optional(),
	rating: z.number().optional(),
	reviewCount: z.number().default(0),
	licenseNumber: z.string().optional(),
	nmlsId: z.string().optional(),
	isActive: z.boolean().default(true),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const newLenderSchema = lenderSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const loanApplicationSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	propertyId: z.string().uuid().optional(),
	lenderId: z.string().uuid().optional(),
	loanType: z.string(),
	loanAmount: z.number(),
	downPayment: z.number().optional(),
	interestRate: z.number().optional(),
	loanTerm: z.number(),
	propertyValue: z.number().optional(),
	lTV: z.number().optional(),
	dti: z.number().optional(),
	creditScore: z.number().optional(),
	applicationDate: z.date().default(new Date()),
	status: z.string().default("pending"),
	approvalDate: z.date().optional(),
	fundingDate: z.date().optional(),
	closingDate: z.date().optional(),
	notes: z.string().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const newLoanApplicationSchema = loanApplicationSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const realEstateProfessionalSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	companyName: z.string().optional(),
	email: z.string(),
	phone: z.string(),
	licenseNumber: z.string(),
	licenseType: z.string(),
	specialties: z.any().optional(),
	serviceAreas: z.any().optional(),
	yearsExperience: z.number().optional(),
	rating: z.number().optional(),
	reviewCount: z.number().default(0),
	website: z.string().optional(),
	bio: z.string().optional(),
	isActive: z.boolean().default(true),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const newRealEstateProfessionalSchema = realEstateProfessionalSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const propertyListingSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	propertyId: z.string().uuid().optional(),
	professionalId: z.string().uuid().optional(),
	realtorId: z.string().uuid().optional(),
	listingType: z.string(),
	listingPrice: z.number(),
	listingDate: z.date().default(new Date()),
	expirationDate: z.date().optional(),
	status: z.string().default("active"),
	daysOnMarket: z.number().default(0),
	mlsNumber: z.string().optional(),
	virtualTourUrl: z.string().optional(),
	listingPhotos: z.any().optional(),
	listingDescription: z.string().optional(),
	commission: z.number().optional(),
	commissionType: z.string().optional(),
	showingInstructions: z.string().optional(),
	notes: z.string().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const newPropertyListingSchema = propertyListingSchema.omit({ id: true, createdAt: true, updatedAt: true });