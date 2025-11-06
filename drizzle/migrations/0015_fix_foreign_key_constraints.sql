-- Migration: Fix Foreign Key Constraint Policies
-- Description: Update all foreign key constraints to use appropriate cascade rules
-- CASCADE for dependent records, SET NULL for optional references, RESTRICT for critical relationships

-- Drop existing constraints that need to be updated
ALTER TABLE "organization_members" DROP CONSTRAINT IF EXISTS "organization_members_organization_id_organizations_id_fk";
ALTER TABLE "organization_members" DROP CONSTRAINT IF EXISTS "organization_members_user_id_users_id_fk";
ALTER TABLE "organizations" DROP CONSTRAINT IF EXISTS "organizations_owner_id_users_id_fk";
ALTER TABLE "clients" DROP CONSTRAINT IF EXISTS "clients_user_id_users_id_fk";
ALTER TABLE "invoice_items" DROP CONSTRAINT IF EXISTS "invoice_items_invoice_id_invoices_id_fk";
ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "invoices_client_id_clients_id_fk";
ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "invoices_user_id_users_id_fk";
ALTER TABLE "expense_categories" DROP CONSTRAINT IF EXISTS "expense_categories_created_by_users_id_fk";
ALTER TABLE "expenses" DROP CONSTRAINT IF EXISTS "expenses_category_id_expense_categories_id_fk";
ALTER TABLE "expenses" DROP CONSTRAINT IF EXISTS "expenses_user_id_users_id_fk";
ALTER TABLE "activities" DROP CONSTRAINT IF EXISTS "activities_user_id_users_id_fk";
ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_user_id_users_id_fk";
ALTER TABLE "accounts" DROP CONSTRAINT IF EXISTS "accounts_user_id_users_id_fk";
ALTER TABLE "payment_methods" DROP CONSTRAINT IF EXISTS "payment_methods_user_id_users_id_fk";
ALTER TABLE "payment_methods" DROP CONSTRAINT IF EXISTS "payment_methods_account_id_accounts_id_fk";
ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "payments_user_id_users_id_fk";
ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "payments_payment_method_id_payment_methods_id_fk";
ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "payments_invoice_id_invoices_id_fk";
ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "projects_user_id_users_id_fk";
ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "projects_client_id_clients_id_fk";
ALTER TABLE "time_entries" DROP CONSTRAINT IF EXISTS "time_entries_user_id_users_id_fk";
ALTER TABLE "time_entries" DROP CONSTRAINT IF EXISTS "time_entries_project_id_projects_id_fk";
ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "tasks_user_id_users_id_fk";
ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "tasks_project_id_projects_id_fk";
ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "tasks_parent_task_id_tasks_id_fk";
ALTER TABLE "campaigns" DROP CONSTRAINT IF EXISTS "campaigns_user_id_users_id_fk";
ALTER TABLE "ad_groups" DROP CONSTRAINT IF EXISTS "ad_groups_user_id_users_id_fk";
ALTER TABLE "ad_groups" DROP CONSTRAINT IF EXISTS "ad_groups_campaign_id_campaigns_id_fk";
ALTER TABLE "ads" DROP CONSTRAINT IF EXISTS "ads_user_id_users_id_fk";
ALTER TABLE "ads" DROP CONSTRAINT IF EXISTS "ads_campaign_id_campaigns_id_fk";
ALTER TABLE "ads" DROP CONSTRAINT IF EXISTS "ads_ad_group_id_ad_groups_id_fk";
ALTER TABLE "leads" DROP CONSTRAINT IF EXISTS "leads_user_id_users_id_fk";
ALTER TABLE "lead_activities" DROP CONSTRAINT IF EXISTS "lead_activities_user_id_users_id_fk";
ALTER TABLE "lead_activities" DROP CONSTRAINT IF EXISTS "lead_activities_lead_id_leads_id_fk";
ALTER TABLE "lead_tasks" DROP CONSTRAINT IF EXISTS "lead_tasks_user_id_users_id_fk";
ALTER TABLE "lead_tasks" DROP CONSTRAINT IF EXISTS "lead_tasks_lead_id_leads_id_fk";

-- Recreate constraints with appropriate policies

-- Organization members - RESTRICT (prevent deletion if members exist)
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" 
  FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE RESTRICT ON UPDATE no action;
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE no action;

-- Organizations owner - SET NULL (optional reference)
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_owner_id_users_id_fk" 
  FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE no action;

-- Clients - RESTRICT (prevent user deletion if clients exist)
ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE no action;

-- Invoice items - CASCADE (delete items when invoice is deleted)
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" 
  FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE ON UPDATE no action;

-- Invoices - RESTRICT (prevent client/user deletion if invoices exist)
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_clients_id_fk" 
  FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE RESTRICT ON UPDATE no action;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE no action;

-- Expense categories - SET NULL (optional reference)
ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_created_by_users_id_fk" 
  FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE no action;

-- Expenses - RESTRICT for user, SET NULL for category (optional)
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_id_expense_categories_id_fk" 
  FOREIGN KEY ("category_id") REFERENCES "public"."expense_categories"("id") ON DELETE SET NULL ON UPDATE no action;
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE no action;

-- Activities - SET NULL (optional reference)
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE no action;

-- Transactions - RESTRICT (prevent user deletion if transactions exist)
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE no action;

-- Accounts - RESTRICT (prevent user deletion if accounts exist)
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE no action;

-- Payment methods - RESTRICT for user, SET NULL for account (optional)
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE no action;
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_account_id_accounts_id_fk" 
  FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE SET NULL ON UPDATE no action;

-- Payments - RESTRICT for user, SET NULL for payment method (optional), SET NULL for invoice (optional)
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE no action;
ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_method_id_payment_methods_id_fk" 
  FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE SET NULL ON UPDATE no action;
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" 
  FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE SET NULL ON UPDATE no action;

-- Projects - RESTRICT for user, SET NULL for client (optional)
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE no action;
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_clients_id_fk" 
  FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL ON UPDATE no action;

-- Time entries - RESTRICT for user, CASCADE for project (delete entries when project is deleted)
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE no action;
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_project_id_projects_id_fk" 
  FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE no action;

-- Tasks - RESTRICT for user, CASCADE for project, SET NULL for parent task (optional)
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE no action;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" 
  FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE no action;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parent_task_id_tasks_id_fk" 
  FOREIGN KEY ("parent_task_id") REFERENCES "public"."tasks"("id") ON DELETE SET NULL ON UPDATE no action;

-- Campaigns - RESTRICT (prevent user deletion if campaigns exist)
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE no action;

-- Ad groups - RESTRICT for user, CASCADE for campaign (delete groups when campaign is deleted)
ALTER TABLE "ad_groups" ADD CONSTRAINT "ad_groups_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE no action;
ALTER TABLE "ad_groups" ADD CONSTRAINT "ad_groups_campaign_id_campaigns_id_fk" 
  FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE no action;

-- Ads - RESTRICT for user, CASCADE for campaign/ad_group (delete ads when campaign/group is deleted)
ALTER TABLE "ads" ADD CONSTRAINT "ads_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE no action;
ALTER TABLE "ads" ADD CONSTRAINT "ads_campaign_id_campaigns_id_fk" 
  FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE no action;
ALTER TABLE "ads" ADD CONSTRAINT "ads_ad_group_id_ad_groups_id_fk" 
  FOREIGN KEY ("ad_group_id") REFERENCES "public"."ad_groups"("id") ON DELETE CASCADE ON UPDATE no action;

-- Leads - RESTRICT (prevent user deletion if leads exist)
ALTER TABLE "leads" ADD CONSTRAINT "leads_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE no action;

-- Lead activities - RESTRICT for user, CASCADE for lead (delete activities when lead is deleted)
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE no action;
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_lead_id_leads_id_fk" 
  FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE CASCADE ON UPDATE no action;

-- Lead tasks - RESTRICT for user, CASCADE for lead (delete tasks when lead is deleted)
ALTER TABLE "lead_tasks" ADD CONSTRAINT "lead_tasks_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE no action;
ALTER TABLE "lead_tasks" ADD CONSTRAINT "lead_tasks_lead_id_leads_id_fk" 
  FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE CASCADE ON UPDATE no action;

