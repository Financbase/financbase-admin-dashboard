import { pgTable, text, integer, decimal, timestamp, boolean, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
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
export const projects = pgTable("projects", {
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
	projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
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
	listingType: text("listing_type").notNull(), // 'sale', 'rent', 'lease'
	listingPrice: decimal("listing_price", { precision: 15, scale: 2 }).notNull(),
	listingDate: timestamp("listing_date").defaultNow().notNull(),
	expirationDate: timestamp("expiration_date"),
	status: text("status").default("active"), // 'active', 'pending', 'sold', 'rented', 'expired', 'withdrawn'
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

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

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

// Zod schemas for validation
export const contractorSchema = createSelectSchema(contractors);
export const newContractorSchema = createInsertSchema(contractors);

export const projectSchema = createSelectSchema(projects);
export const newProjectSchema = createInsertSchema(projects);

export const projectTaskSchema = createSelectSchema(projectTasks);
export const newProjectTaskSchema = createInsertSchema(projectTasks);

export const serviceRequestSchema = createSelectSchema(serviceRequests);
export const newServiceRequestSchema = createInsertSchema(serviceRequests);

export const tenantApplicationSchema = createSelectSchema(tenantApplications);
export const newTenantApplicationSchema = createInsertSchema(tenantApplications);

export const lenderSchema = createSelectSchema(lenders);
export const newLenderSchema = createInsertSchema(lenders);

export const loanApplicationSchema = createSelectSchema(loanApplications);
export const newLoanApplicationSchema = createInsertSchema(loanApplications);

export const realEstateProfessionalSchema = createSelectSchema(realEstateProfessionals);
export const newRealEstateProfessionalSchema = createInsertSchema(realEstateProfessionals);

export const propertyListingSchema = createSelectSchema(propertyListings);
export const newPropertyListingSchema = createInsertSchema(propertyListings);