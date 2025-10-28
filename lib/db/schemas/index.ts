// Core database schemas for Financbase Admin Dashboard

// User management
export * from "./users.schema";

// User Preferences System
export * from "./preferences.schema";

// Organization management
export * from "./organizations.schema";

// Financial entities
export * from "./invoices.schema";
export * from "./expenses.schema";
export * from "./clients.schema";
export * from "./transactions.schema";
export * from "./accounts.schema";
export * from "./payment-methods.schema";
export * from "./payments.schema";

// Freelance Hub
export * from "./projects.schema";
export * from "./time-entries.schema";
export * from "./tasks.schema";
export * from "./freelancers.schema";

// Adboard
export * from "./campaigns.schema";
export * from "./ad-groups.schema";
export * from "./ads.schema";

// Lead Management
export * from "./leads.schema";
export * from "./lead-activities.schema";
export * from "./lead-tasks.schema";

// Analytics and reporting
export * from "./analytics.schema";
export * from "./reports.schema";

// Real Estate
export * from "./real-estate.schema";
// Note: real-estate-expanded.schema has conflicting exports with projects.schema
// Only import specific types that don't conflict
export type {
	Contractor,
	NewContractor,
	ProjectTask,
	NewProjectTask,
	ServiceRequest,
	NewServiceRequest,
	TenantApplication,
	NewTenantApplication,
	Lender,
	NewLender,
	LoanApplication,
	NewLoanApplication,
	RealEstateProfessional,
	NewRealEstateProfessional,
	PropertyListing,
	NewPropertyListing,
} from "./real-estate-expanded.schema";

// Activity tracking
export * from "./activities.schema";

// Security & API Management
export * from "./api-keys.schema";

// Subscription & Billing System
export * from "./billing.schema";

// Notifications System
export * from "./notifications.schema";

// Workflows and automation
export * from "./workflows.schema";

// AI Bookkeeping and Reconciliation
export * from "./reconciliation.schema";

// Bill Pay Automation and Document Processing
export * from "./bill-pay.schema";

// Webhooks System
export * from "./webhooks.schema";

// Monitoring & Metrics System
export * from "./metrics.schema";

// Marketplace & Plugins System
export * from "./plugins.schema";

// Help & Documentation System
export * from "./documentation.schema";

// Advanced Features System
export * from "./dashboard.schema";

// Security & Compliance System
export * from "./security.schema";

// Onboarding System
export * from "./onboarding.schema";

// Integrations System
export * from "./integrations.schema";

// AI Assistant System
export * from "./ai-conversations.schema";

// Platform Services System
export * from "./platform-services.schema";
