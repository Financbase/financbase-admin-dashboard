import {
	pgTable,
	text,
	timestamp,
	uuid,
	numeric,
	jsonb,
	pgEnum,
	boolean,
	integer,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";

// Enums for bill pay system
export const vendorStatusEnum = pgEnum("vendor_status", [
	"active",
	"inactive",
	"suspended",
	"blacklisted"
]);

export const vendorTypeEnum = pgEnum("vendor_type", [
	"supplier",
	"contractor",
	"service_provider",
	"utility",
	"landlord",
	"other"
]);

export const billStatusEnum = pgEnum("bill_status", [
	"draft",
	"received",
	"processing",
	"pending_approval",
	"approved",
	"rejected",
	"paid",
	"overdue",
	"cancelled",
	"disputed"
]);

export const billPriorityEnum = pgEnum("bill_priority", [
	"low",
	"medium",
	"high",
	"urgent"
]);

export const paymentMethodEnum = pgEnum("payment_method", [
	"check",
	"ach",
	"wire",
	"credit_card",
	"paypal",
	"venmo",
	"cash",
	"other"
]);

export const billPaymentStatusEnum = pgEnum("bill_payment_status", [
	"pending",
	"scheduled",
	"processing",
	"completed",
	"failed",
	"cancelled"
]);

export const documentTypeEnum = pgEnum("document_type", [
	"invoice",
	"receipt",
	"bill",
	"statement",
	"contract",
	"other"
]);

export const processingStatusEnum = pgEnum("processing_status", [
	"pending",
	"processing",
	"completed",
	"failed",
	"manual_review"
]);

export const approvalStatusEnum = pgEnum("approval_status", [
	"pending",
	"approved",
	"rejected",
	"escalated"
]);

// Vendors table
export const vendors = pgTable("vendors", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id),

	// Basic vendor information
	name: text("name").notNull(),
	displayName: text("display_name"), // What user calls them
	type: vendorTypeEnum("type").default("supplier"),
	status: vendorStatusEnum("status").default("active"),

	// Contact information
	email: text("email"),
	phone: text("phone"),
	website: text("website"),

	// Address information
	address: text("address"),
	city: text("city"),
	state: text("state"),
	zipCode: text("zip_code"),
	country: text("country").default("US"),

	// Business details
	taxId: text("tax_id"), // EIN or similar
	licenseNumber: text("license_number"),
	industry: text("industry"),

	// Payment preferences
	preferredPaymentMethod: paymentMethodEnum("preferred_payment_method"),
	paymentTerms: text("payment_terms"), // "Net 30", "Due on Receipt", etc.
	earlyPaymentDiscount: text("early_payment_discount"), // "2% 10 Net 30"

	// Financial tracking
	totalSpent: numeric("total_spent", { precision: 12, scale: 2 }).default("0"),
	totalBills: integer("total_bills").default(0),
	avgPaymentTime: integer("avg_payment_time"), // days
	lastPaymentDate: timestamp("last_payment_date"),

	// Risk and compliance
	creditRating: text("credit_rating"),
	paymentHistory: jsonb("payment_history"), // Array of past payments
	notes: text("notes"),

	// Integration data
	externalId: text("external_id"), // For integrations (QuickBooks, etc.)
	metadata: jsonb("metadata"),

	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Bills/Invoices table
export const bills = pgTable("bills", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id),
	vendorId: uuid("vendor_id").references(() => vendors.id),

	// Bill identification
	billNumber: text("bill_number").notNull(),
	vendorBillNumber: text("vendor_bill_number"), // Vendor's reference number

	// Bill details
	status: billStatusEnum("status").default("received"),
	priority: billPriorityEnum("priority").default("medium"),

	// Financial information
	amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
	currency: text("currency").default("USD"),
	taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).default("0"),
	discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).default("0"),
	totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),

	// Dates
	billDate: timestamp("bill_date", { withTimezone: true }).notNull(),
	dueDate: timestamp("due_date", { withTimezone: true }),
	earlyPaymentDate: timestamp("early_payment_date"),

	// Payment information
	paymentMethod: paymentMethodEnum("payment_method"),
	paymentReference: text("payment_reference"),

	// Description and categorization
	description: text("description"),
	category: text("category"),
	department: text("department"),
	project: text("project"),

	// Approval workflow
	approvalRequired: boolean("approval_required").default(false),
	approvedBy: uuid("approved_by").references(() => users.id),
	approvedAt: timestamp("approved_at", { withTimezone: true }),
	approvalNotes: text("approval_notes"),

	// Processing information
	ocrProcessed: boolean("ocr_processed").default(false),
	ocrData: jsonb("ocr_data"), // Extracted data from OCR
	ocrConfidence: numeric("ocr_confidence", { precision: 5, scale: 2 }),

	// Document information
	documentUrl: text("document_url"), // URL to original document
	documentType: documentTypeEnum("document_type").default("invoice"),
	fileName: text("file_name"),
	fileSize: integer("file_size"),
	mimeType: text("mime_type"),

	// Integration and external data
	externalId: text("external_id"),
	metadata: jsonb("metadata"),

	// Audit trail
	createdBy: uuid("created_by").references(() => users.id),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Bill payments table
export const billPayments = pgTable("bill_payments", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id),
	billId: uuid("bill_id").references(() => bills.id),

	// Payment details
	paymentMethod: paymentMethodEnum("payment_method").notNull(),
	amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
	currency: text("currency").default("USD"),

	// Payment status and tracking
	status: billPaymentStatusEnum("status").default("pending"),
	paymentDate: timestamp("payment_date", { withTimezone: true }),
	processedAt: timestamp("processed_at", { withTimezone: true }),

	// External payment tracking
	externalPaymentId: text("external_payment_id"), // Bank, Stripe, etc.
	referenceNumber: text("reference_number"),
	confirmationNumber: text("confirmation_number"),

	// Fees and adjustments
	processingFee: numeric("processing_fee", { precision: 8, scale: 2 }).default("0"),
	exchangeRate: numeric("exchange_rate", { precision: 10, scale: 6 }),
	adjustedAmount: numeric("adjusted_amount", { precision: 12, scale: 2 }),

	// Payment notes and reconciliation
	notes: text("notes"),
	reconciled: boolean("reconciled").default(false),
	reconciledAt: timestamp("reconciled_at", { withTimezone: true }),

	// Integration data
	externalId: text("external_id"),
	metadata: jsonb("metadata"),

	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Document processing table for OCR and AI analysis
export const documentProcessing = pgTable("document_processing", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id),
	billId: uuid("bill_id").references(() => bills.id),

	// Processing details
	status: processingStatusEnum("status").default("pending"),
	documentType: documentTypeEnum("document_type").default("invoice"),

	// File information
	originalFileName: text("original_file_name").notNull(),
	fileSize: integer("file_size"),
	mimeType: text("mime_type"),
	storageUrl: text("storage_url"), // URL to processed file

	// OCR results
	ocrText: text("ocr_text"), // Raw OCR text
	ocrConfidence: numeric("ocr_confidence", { precision: 5, scale: 2 }),

	// AI extraction results
	extractedData: jsonb("extracted_data"), // Structured data extracted by AI
	extractionConfidence: numeric("extraction_confidence", { precision: 5, scale: 2 }),

	// Validation results
	validationErrors: jsonb("validation_errors"), // Issues found during validation
	validationWarnings: jsonb("validation_warnings"),

	// Processing metadata
	processingEngine: text("processing_engine"), // "tesseract", "google_vision", "azure_form", etc.
	processingTime: integer("processing_time_ms"),
	aiModelVersion: text("ai_model_version"),

	// Review and approval
	requiresReview: boolean("requires_review").default(false),
	reviewedBy: uuid("reviewed_by").references(() => users.id),
	reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
	reviewNotes: text("review_notes"),

	// Error handling
	errorMessage: text("error_message"),
	retryCount: integer("retry_count").default(0),

	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Approval workflows table
export const approvalWorkflows = pgTable("approval_workflows", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id),

	name: text("name").notNull(),
	description: text("description"),
	isActive: boolean("is_active").default(true),

	// Workflow configuration
	conditions: jsonb("conditions").notNull(), // When to trigger this workflow
	steps: jsonb("steps").notNull(), // Approval steps and rules

	// Escalation rules
	escalationRules: jsonb("escalation_rules"), // When and how to escalate
	autoApprovalRules: jsonb("auto_approval_rules"), // When to auto-approve

	// Performance tracking
	totalProcessed: integer("total_processed").default(0),
	avgProcessingTime: integer("avg_processing_time"), // hours
	approvalRate: numeric("approval_rate", { precision: 5, scale: 2 }), // percentage

	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Bill approval requests table
export const billApprovals = pgTable("bill_approvals", {
	id: uuid("id").primaryKey().defaultRandom(),
	billId: uuid("bill_id").notNull().references(() => bills.id),
	workflowId: uuid("workflow_id").references(() => approvalWorkflows.id),

	// Request details
	requestedBy: uuid("requested_by").notNull().references(() => users.id),
	requestedAt: timestamp("requested_at", { withTimezone: true }).defaultNow(),

	// Current step in workflow
	currentStep: integer("current_step").default(1),
	totalSteps: integer("total_steps").notNull(),

	// Approval details
	status: approvalStatusEnum("status").default("pending"),
	approvedBy: uuid("approved_by").references(() => users.id),
	approvedAt: timestamp("approved_at", { withTimezone: true }),
	rejectedBy: uuid("rejected_by").references(() => users.id),
	rejectedAt: timestamp("rejected_at", { withTimezone: true }),

	// Approval notes and reasoning
	approvalNotes: text("approval_notes"),
	rejectionReason: text("rejection_reason"),

	// Escalation tracking
	escalatedAt: timestamp("escalated_at", { withTimezone: true }),
	escalatedTo: uuid("escalated_to").references(() => users.id),

	// Timeline and SLA
	dueDate: timestamp("due_date", { withTimezone: true }),
	completedAt: timestamp("completed_at", { withTimezone: true }),

	// Audit trail
	approvalHistory: jsonb("approval_history"), // Array of all approval actions

	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Recurring bill templates
export const recurringBillTemplates = pgTable("recurring_bill_templates", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id),
	vendorId: uuid("vendor_id").references(() => vendors.id),

	// Template details
	name: text("name").notNull(),
	description: text("description"),
	isActive: boolean("is_active").default(true),

	// Recurrence pattern
	frequency: text("frequency").notNull(), // "monthly", "quarterly", "annually", "weekly"
	interval: integer("interval").default(1), // Every N periods
	dayOfMonth: integer("day_of_month"), // For monthly bills
	dayOfWeek: text("day_of_week"), // For weekly bills

	// Amount and details
	baseAmount: numeric("base_amount", { precision: 12, scale: 2 }).notNull(),
	currency: text("currency").default("USD"),
	descriptionTemplate: text("description_template"),
	category: text("category"),

	// Next occurrence
	nextDueDate: timestamp("next_due_date", { withTimezone: true }),
	endDate: timestamp("end_date", { withTimezone: true }), // When to stop recurring

	// Auto-processing
	autoCreate: boolean("auto_create").default(false),
	autoApprove: boolean("auto_approve").default(false),
	approvalWorkflowId: uuid("approval_workflow_id").references(() => approvalWorkflows.id),

	// Statistics
	totalGenerated: integer("total_generated").default(0),
	lastGeneratedAt: timestamp("last_generated_at", { withTimezone: true }),

	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Bill pay settings and preferences
export const billPaySettings = pgTable("bill_pay_settings", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id).unique(),

	// General preferences
	defaultPaymentMethod: paymentMethodEnum("default_payment_method"),
	autoPayEnabled: boolean("auto_pay_enabled").default(false),
	earlyPaymentDiscount: boolean("early_payment_discount").default(true),

	// Approval settings
	requireApproval: boolean("require_approval").default(true),
	approvalThreshold: numeric("approval_threshold", { precision: 12, scale: 2 }), // Amount requiring approval
	defaultApprovalWorkflowId: uuid("default_approval_workflow_id").references(() => approvalWorkflows.id),

	// Notification preferences
	emailNotifications: boolean("email_notifications").default(true),
	reminderDays: integer("reminder_days").default(7), // Days before due date

	// Integration settings
	quickbooksEnabled: boolean("quickbooks_enabled").default(false),
	xeroEnabled: boolean("xero_enabled").default(false),
	freshbooksEnabled: boolean("freshbooks_enabled").default(false),

	// Processing preferences
	ocrEnabled: boolean("ocr_enabled").default(true),
	aiCategorizationEnabled: boolean("ai_categorization_enabled").default(true),

	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Export types
export type Vendor = typeof vendors.$inferSelect;
export type NewVendor = typeof vendors.$inferInsert;

export type Bill = typeof bills.$inferSelect;
export type NewBill = typeof bills.$inferInsert;

export type BillPayment = typeof billPayments.$inferSelect;
export type NewBillPayment = typeof billPayments.$inferInsert;

export type DocumentProcessing = typeof documentProcessing.$inferSelect;
export type NewDocumentProcessing = typeof documentProcessing.$inferInsert;

export type ApprovalWorkflow = typeof approvalWorkflows.$inferSelect;
export type NewApprovalWorkflow = typeof approvalWorkflows.$inferInsert;

export type BillApproval = typeof billApprovals.$inferSelect;
export type NewBillApproval = typeof billApprovals.$inferInsert;

export type RecurringBillTemplate = typeof recurringBillTemplates.$inferSelect;
export type NewRecurringBillTemplate = typeof recurringBillTemplates.$inferInsert;

export type BillPaySettings = typeof billPaySettings.$inferSelect;
export type NewBillPaySettings = typeof billPaySettings.$inferInsert;
