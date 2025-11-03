-- Migration: Marketplace and Integrations System
-- Created: 2025-11-02
-- Description: Database schema for Marketplace Plugins, Installed Plugins, Integrations, and Integration Connections

-- Ensure financbase schema exists
CREATE SCHEMA IF NOT EXISTS "financbase";

-- Marketplace Plugins Table
CREATE TABLE IF NOT EXISTS "financbase"."financbase_marketplace_plugins" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "description" text NOT NULL,
  "short_description" text,
  "version" text NOT NULL DEFAULT '1.0.0',
  "author" text NOT NULL,
  "author_email" text,
  "author_website" text,
  
  -- Plugin metadata
  "category" text NOT NULL,
  "tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "icon" text,
  "screenshots" jsonb DEFAULT '[]'::jsonb NOT NULL,
  
  -- Plugin details
  "features" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "requirements" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "compatibility" jsonb DEFAULT '{}'::jsonb NOT NULL,
  
  -- Pricing and licensing
  "is_free" boolean DEFAULT true NOT NULL,
  "price" integer,
  "currency" text DEFAULT 'USD',
  "license" text DEFAULT 'Proprietary',
  
  -- Plugin files and configuration
  "plugin_file" text,
  "manifest" jsonb NOT NULL,
  "permissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
  
  -- Status and approval
  "is_approved" boolean DEFAULT false NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "is_official" boolean DEFAULT false NOT NULL,
  
  -- Statistics
  "download_count" integer DEFAULT 0 NOT NULL,
  "install_count" integer DEFAULT 0 NOT NULL,
  "rating" integer DEFAULT 0 NOT NULL,
  "review_count" integer DEFAULT 0 NOT NULL,
  
  -- Timestamps
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "published_at" timestamp
);

-- Installed Plugins Table
CREATE TABLE IF NOT EXISTS "financbase"."financbase_installed_plugins" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "financbase"."users"("id") ON DELETE cascade,
  "organization_id" text REFERENCES "financbase"."organizations"("id") ON DELETE cascade,
  "plugin_id" integer NOT NULL REFERENCES "financbase"."financbase_marketplace_plugins"("id") ON DELETE cascade,
  
  -- Installation details
  "version" text NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "is_enabled" boolean DEFAULT true NOT NULL,
  
  -- Plugin settings and configuration
  "settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "permissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
  
  -- Installation tracking
  "installed_at" timestamp DEFAULT now() NOT NULL,
  "last_updated_at" timestamp,
  "last_used_at" timestamp,
  
  -- Usage statistics
  "usage_count" integer DEFAULT 0 NOT NULL,
  "last_error" text,
  "last_error_at" timestamp,
  
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Integrations Table
CREATE TABLE IF NOT EXISTS "financbase"."financbase_integrations" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "description" text,
  "category" text NOT NULL,
  "icon" text,
  "color" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "is_official" boolean DEFAULT true NOT NULL,
  "version" text DEFAULT '1.0.0' NOT NULL,
  "configuration" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "features" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "requirements" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "documentation" text,
  "support_url" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Integration Connections Table
CREATE TABLE IF NOT EXISTS "financbase"."financbase_integration_connections" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "financbase"."users"("id") ON DELETE cascade,
  "organization_id" text REFERENCES "financbase"."organizations"("id") ON DELETE cascade,
  "integration_id" integer NOT NULL REFERENCES "financbase"."financbase_integrations"("id") ON DELETE cascade,
  "name" text NOT NULL,
  "status" text NOT NULL DEFAULT 'active',
  "is_active" boolean DEFAULT true NOT NULL,
  
  -- OAuth tokens and credentials
  "access_token" text NOT NULL,
  "refresh_token" text,
  "token_expires_at" timestamp,
  "scope" text,
  
  -- Connection metadata
  "external_id" text,
  "external_name" text,
  "external_data" jsonb DEFAULT '{}'::jsonb,
  
  -- Configuration
  "settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "mappings" jsonb DEFAULT '{}'::jsonb NOT NULL,
  
  -- Sync information
  "last_sync_at" timestamp,
  "next_sync_at" timestamp,
  "sync_status" text DEFAULT 'pending',
  "sync_error" text,
  
  -- Statistics
  "sync_count" integer DEFAULT 0 NOT NULL,
  "success_count" integer DEFAULT 0 NOT NULL,
  "failure_count" integer DEFAULT 0 NOT NULL,
  
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "marketplace_plugins_category_idx" ON "financbase"."financbase_marketplace_plugins" ("category");
CREATE INDEX IF NOT EXISTS "marketplace_plugins_is_active_idx" ON "financbase"."financbase_marketplace_plugins" ("is_active");
CREATE INDEX IF NOT EXISTS "marketplace_plugins_is_approved_idx" ON "financbase"."financbase_marketplace_plugins" ("is_approved");
CREATE INDEX IF NOT EXISTS "marketplace_plugins_install_count_idx" ON "financbase"."financbase_marketplace_plugins" ("install_count");

CREATE INDEX IF NOT EXISTS "installed_plugins_user_id_idx" ON "financbase"."financbase_installed_plugins" ("user_id");
CREATE INDEX IF NOT EXISTS "installed_plugins_plugin_id_idx" ON "financbase"."financbase_installed_plugins" ("plugin_id");
CREATE INDEX IF NOT EXISTS "installed_plugins_is_active_idx" ON "financbase"."financbase_installed_plugins" ("is_active");

CREATE INDEX IF NOT EXISTS "integrations_category_idx" ON "financbase"."financbase_integrations" ("category");
CREATE INDEX IF NOT EXISTS "integrations_is_active_idx" ON "financbase"."financbase_integrations" ("is_active");
CREATE INDEX IF NOT EXISTS "integrations_slug_idx" ON "financbase"."financbase_integrations" ("slug");

CREATE INDEX IF NOT EXISTS "integration_connections_user_id_idx" ON "financbase"."financbase_integration_connections" ("user_id");
CREATE INDEX IF NOT EXISTS "integration_connections_integration_id_idx" ON "financbase"."financbase_integration_connections" ("integration_id");
CREATE INDEX IF NOT EXISTS "integration_connections_status_idx" ON "financbase"."financbase_integration_connections" ("status");
CREATE INDEX IF NOT EXISTS "integration_connections_is_active_idx" ON "financbase"."financbase_integration_connections" ("is_active");

