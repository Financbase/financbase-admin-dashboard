-- Migration: Add Missing Indexes on Foreign Keys and Composite Indexes
-- Description: Add indexes for all foreign key columns and composite indexes for common query patterns

-- Foreign Key Indexes

-- Organization members
CREATE INDEX IF NOT EXISTS "idx_organization_members_org_user" ON "organization_members"("organization_id", "user_id");
CREATE INDEX IF NOT EXISTS "idx_organization_members_user" ON "organization_members"("user_id");

-- Invoices and invoice items
CREATE INDEX IF NOT EXISTS "idx_invoices_user_client" ON "invoices"("user_id", "client_id");
CREATE INDEX IF NOT EXISTS "idx_invoices_user_status_due_date" ON "invoices"("user_id", "status", "due_date");
CREATE INDEX IF NOT EXISTS "idx_invoices_client" ON "invoices"("client_id");
CREATE INDEX IF NOT EXISTS "idx_invoice_items_invoice" ON "invoice_items"("invoice_id");

-- Expenses
CREATE INDEX IF NOT EXISTS "idx_expenses_user_category" ON "expenses"("user_id", "category_id");
CREATE INDEX IF NOT EXISTS "idx_expenses_user_date" ON "expenses"("user_id", "expense_date" DESC);
CREATE INDEX IF NOT EXISTS "idx_expenses_category" ON "expenses"("category_id");

-- Transactions
CREATE INDEX IF NOT EXISTS "idx_transactions_user_date_status" ON "transactions"("user_id", "transaction_date" DESC, "status");
CREATE INDEX IF NOT EXISTS "idx_transactions_user_date" ON "transactions"("user_id", "transaction_date" DESC);
CREATE INDEX IF NOT EXISTS "idx_transactions_date" ON "transactions"("transaction_date" DESC);

-- Accounts
CREATE INDEX IF NOT EXISTS "idx_accounts_user" ON "accounts"("user_id");

-- Payment methods
CREATE INDEX IF NOT EXISTS "idx_payment_methods_user_account" ON "payment_methods"("user_id", "account_id");
CREATE INDEX IF NOT EXISTS "idx_payment_methods_user" ON "payment_methods"("user_id");
CREATE INDEX IF NOT EXISTS "idx_payment_methods_account" ON "payment_methods"("account_id");

-- Payments
CREATE INDEX IF NOT EXISTS "idx_payments_user_invoice" ON "payments"("user_id", "invoice_id");
CREATE INDEX IF NOT EXISTS "idx_payments_user" ON "payments"("user_id");
CREATE INDEX IF NOT EXISTS "idx_payments_invoice" ON "payments"("invoice_id");
CREATE INDEX IF NOT EXISTS "idx_payments_payment_method" ON "payments"("payment_method_id");

-- Projects
CREATE INDEX IF NOT EXISTS "idx_projects_user_client" ON "projects"("user_id", "client_id");
CREATE INDEX IF NOT EXISTS "idx_projects_user" ON "projects"("user_id");
CREATE INDEX IF NOT EXISTS "idx_projects_client" ON "projects"("client_id");

-- Time entries
CREATE INDEX IF NOT EXISTS "idx_time_entries_user_project" ON "time_entries"("user_id", "project_id");
CREATE INDEX IF NOT EXISTS "idx_time_entries_user" ON "time_entries"("user_id");
CREATE INDEX IF NOT EXISTS "idx_time_entries_project" ON "time_entries"("project_id");
CREATE INDEX IF NOT EXISTS "idx_time_entries_start_time" ON "time_entries"("start_time" DESC);

-- Tasks
CREATE INDEX IF NOT EXISTS "idx_tasks_user_project" ON "tasks"("user_id", "project_id");
CREATE INDEX IF NOT EXISTS "idx_tasks_user" ON "tasks"("user_id");
CREATE INDEX IF NOT EXISTS "idx_tasks_project" ON "tasks"("project_id");
CREATE INDEX IF NOT EXISTS "idx_tasks_parent" ON "tasks"("parent_task_id");
CREATE INDEX IF NOT EXISTS "idx_tasks_due_date" ON "tasks"("due_date");

-- Campaigns
CREATE INDEX IF NOT EXISTS "idx_campaigns_user" ON "campaigns"("user_id");
CREATE INDEX IF NOT EXISTS "idx_campaigns_status" ON "campaigns"("status");

-- Ad groups
CREATE INDEX IF NOT EXISTS "idx_ad_groups_user_campaign" ON "ad_groups"("user_id", "campaign_id");
CREATE INDEX IF NOT EXISTS "idx_ad_groups_user" ON "ad_groups"("user_id");
CREATE INDEX IF NOT EXISTS "idx_ad_groups_campaign" ON "ad_groups"("campaign_id");

-- Ads
CREATE INDEX IF NOT EXISTS "idx_ads_user_campaign" ON "ads"("user_id", "campaign_id");
CREATE INDEX IF NOT EXISTS "idx_ads_user" ON "ads"("user_id");
CREATE INDEX IF NOT EXISTS "idx_ads_campaign" ON "ads"("campaign_id");
CREATE INDEX IF NOT EXISTS "idx_ads_ad_group" ON "ads"("ad_group_id");

-- Leads
CREATE INDEX IF NOT EXISTS "idx_leads_user" ON "leads"("user_id");
CREATE INDEX IF NOT EXISTS "idx_leads_status" ON "leads"("status");
CREATE INDEX IF NOT EXISTS "idx_leads_client" ON "leads"("client_id");

-- Lead activities
CREATE INDEX IF NOT EXISTS "idx_lead_activities_user_lead" ON "lead_activities"("user_id", "lead_id");
CREATE INDEX IF NOT EXISTS "idx_lead_activities_user" ON "lead_activities"("user_id");
CREATE INDEX IF NOT EXISTS "idx_lead_activities_lead" ON "lead_activities"("lead_id");
CREATE INDEX IF NOT EXISTS "idx_lead_activities_scheduled_date" ON "lead_activities"("scheduled_date");

-- Lead tasks
CREATE INDEX IF NOT EXISTS "idx_lead_tasks_user_lead" ON "lead_tasks"("user_id", "lead_id");
CREATE INDEX IF NOT EXISTS "idx_lead_tasks_user" ON "lead_tasks"("user_id");
CREATE INDEX IF NOT EXISTS "idx_lead_tasks_lead" ON "lead_tasks"("lead_id");
CREATE INDEX IF NOT EXISTS "idx_lead_tasks_due_date" ON "lead_tasks"("due_date");

-- Clients
CREATE INDEX IF NOT EXISTS "idx_clients_user_active" ON "clients"("user_id", "is_active");
CREATE INDEX IF NOT EXISTS "idx_clients_user" ON "clients"("user_id");

-- Activities
CREATE INDEX IF NOT EXISTS "idx_activities_user_created" ON "activities"("user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_activities_user" ON "activities"("user_id");
CREATE INDEX IF NOT EXISTS "idx_activities_entity" ON "activities"("entity_type", "entity_id");
CREATE INDEX IF NOT EXISTS "idx_activities_created_at" ON "activities"("created_at" DESC);

-- Expense categories
CREATE INDEX IF NOT EXISTS "idx_expense_categories_created_by" ON "expense_categories"("created_by");

-- Organizations
CREATE INDEX IF NOT EXISTS "idx_organizations_owner" ON "organizations"("owner_id");

-- Date indexes for common filtering
CREATE INDEX IF NOT EXISTS "idx_invoices_due_date" ON "invoices"("due_date");
CREATE INDEX IF NOT EXISTS "idx_invoices_issue_date" ON "invoices"("issue_date");
CREATE INDEX IF NOT EXISTS "idx_projects_start_date" ON "projects"("start_date");
CREATE INDEX IF NOT EXISTS "idx_projects_due_date" ON "projects"("due_date");
CREATE INDEX IF NOT EXISTS "idx_campaigns_start_date" ON "campaigns"("start_date");
CREATE INDEX IF NOT EXISTS "idx_campaigns_end_date" ON "campaigns"("end_date");

