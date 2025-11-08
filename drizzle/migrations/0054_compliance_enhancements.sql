-- Migration: Compliance Enhancements 2025
-- Created: 2025-11-XX
-- Description: Database schema for DORA, AI governance, data classification, and state privacy compliance

-- Create ENUM types for DORA
DO $$ BEGIN
 CREATE TYPE "dora_incident_severity" AS ENUM('low', 'medium', 'high', 'critical');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "dora_incident_status" AS ENUM('detected', 'investigating', 'contained', 'resolved', 'closed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "dora_test_type" AS ENUM('vulnerability_assessment', 'penetration_test', 'load_test', 'disaster_recovery', 'business_continuity', 'threat_led_penetration_test');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "dora_test_status" AS ENUM('scheduled', 'in_progress', 'completed', 'failed', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "third_party_risk_level" AS ENUM('low', 'medium', 'high', 'critical');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create ENUM types for AI Governance
DO $$ BEGIN
 CREATE TYPE "ai_decision_type" AS ENUM('financial_analysis', 'risk_assessment', 'fraud_detection', 'recommendation', 'classification', 'prediction', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create ENUM types for Data Classification
DO $$ BEGIN
 CREATE TYPE "data_classification_level" AS ENUM('public', 'internal', 'confidential', 'restricted', 'highly_restricted');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create ENUM types for State Privacy
DO $$ BEGIN
 CREATE TYPE "state_privacy_law" AS ENUM('cpra', 'ccpa', 'vcdpa', 'ctdpa', 'cdpa', 'ucpa', 'tdpa', 'mcdpa', 'idpa', 'tdpa_tennessee', 'odpa');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- DORA Incident Reports Table
CREATE TABLE IF NOT EXISTS "financbase_dora_incident_reports" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "reported_by" TEXT,
  "incident_title" TEXT NOT NULL,
  "incident_description" TEXT NOT NULL,
  "incident_type" TEXT NOT NULL,
  "severity" "dora_incident_severity" NOT NULL,
  "status" "dora_incident_status" NOT NULL DEFAULT 'detected',
  "affected_systems" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "affected_services" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "impact_scope" TEXT,
  "detected_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "contained_at" TIMESTAMP WITH TIME ZONE,
  "resolved_at" TIMESTAMP WITH TIME ZONE,
  "closed_at" TIMESTAMP WITH TIME ZONE,
  "impact_description" TEXT,
  "affected_users" INTEGER,
  "data_affected" BOOLEAN DEFAULT false NOT NULL,
  "financial_impact" JSONB,
  "response_actions" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "remediation_steps" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "reported_to_authorities" BOOLEAN DEFAULT false NOT NULL,
  "authority_report_details" JSONB,
  "internal_report_url" TEXT,
  "tags" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "metadata" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- DORA Resilience Tests Table
CREATE TABLE IF NOT EXISTS "financbase_dora_resilience_tests" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "scheduled_by" TEXT,
  "executed_by" TEXT,
  "test_name" TEXT NOT NULL,
  "test_description" TEXT,
  "test_type" "dora_test_type" NOT NULL,
  "status" "dora_test_status" NOT NULL DEFAULT 'scheduled',
  "test_scope" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "critical_functions" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "scheduled_date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "start_date" TIMESTAMP WITH TIME ZONE,
  "end_date" TIMESTAMP WITH TIME ZONE,
  "completed_date" TIMESTAMP WITH TIME ZONE,
  "test_results" JSONB,
  "vulnerabilities_found" INTEGER DEFAULT 0 NOT NULL,
  "vulnerabilities_critical" INTEGER DEFAULT 0 NOT NULL,
  "vulnerabilities_high" INTEGER DEFAULT 0 NOT NULL,
  "vulnerabilities_medium" INTEGER DEFAULT 0 NOT NULL,
  "vulnerabilities_low" INTEGER DEFAULT 0 NOT NULL,
  "findings" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "recommendations" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "remediation_plan" JSONB,
  "report_url" TEXT,
  "report_generated_at" TIMESTAMP WITH TIME ZONE,
  "tags" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "metadata" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- DORA Third Party Risks Table
CREATE TABLE IF NOT EXISTS "financbase_dora_third_party_risks" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "assessed_by" TEXT,
  "provider_name" TEXT NOT NULL,
  "provider_type" TEXT NOT NULL,
  "provider_contact" JSONB,
  "contract_id" TEXT,
  "contract_start_date" TIMESTAMP WITH TIME ZONE,
  "contract_end_date" TIMESTAMP WITH TIME ZONE,
  "services_provided" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "critical_services" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "risk_level" "third_party_risk_level" NOT NULL,
  "risk_score" INTEGER,
  "risk_factors" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "risk_description" TEXT,
  "compliance_certifications" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "data_processing_agreement" BOOLEAN DEFAULT false NOT NULL,
  "security_assessment_completed" BOOLEAN DEFAULT false NOT NULL,
  "last_security_assessment" TIMESTAMP WITH TIME ZONE,
  "business_continuity_plan" BOOLEAN DEFAULT false NOT NULL,
  "disaster_recovery_plan" BOOLEAN DEFAULT false NOT NULL,
  "incident_response_plan" BOOLEAN DEFAULT false NOT NULL,
  "monitoring_enabled" BOOLEAN DEFAULT false NOT NULL,
  "monitoring_frequency" TEXT,
  "last_review_date" TIMESTAMP WITH TIME ZONE,
  "next_review_date" TIMESTAMP WITH TIME ZONE,
  "is_active" BOOLEAN DEFAULT true NOT NULL,
  "status" TEXT DEFAULT 'active' NOT NULL,
  "notes" TEXT,
  "tags" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "metadata" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- AI Model Decisions Table
CREATE TABLE IF NOT EXISTS "financbase_ai_model_decisions" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "user_id" TEXT,
  "model_name" TEXT NOT NULL,
  "model_version" TEXT,
  "model_provider" TEXT,
  "decision_type" "ai_decision_type" NOT NULL,
  "decision_id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "decision_description" TEXT NOT NULL,
  "input_data" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "output_data" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "decision_confidence" INTEGER,
  "use_case" TEXT,
  "context" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "session_id" TEXT,
  "request_id" TEXT,
  "explanation" TEXT,
  "explanation_data" JSONB,
  "feature_importance" JSONB,
  "bias_check_performed" BOOLEAN DEFAULT false NOT NULL,
  "bias_check_results" JSONB,
  "fairness_score" INTEGER,
  "processing_time" INTEGER,
  "tokens_used" INTEGER,
  "cost" JSONB,
  "gdpr_relevant" BOOLEAN DEFAULT false NOT NULL,
  "contains_personal_data" BOOLEAN DEFAULT false NOT NULL,
  "data_retention_policy" TEXT,
  "tags" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "metadata" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- AI Model Bias Checks Table
CREATE TABLE IF NOT EXISTS "financbase_ai_model_bias_checks" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "model_decision_id" INTEGER REFERENCES "financbase_ai_model_decisions"("id") ON DELETE CASCADE,
  "performed_by" TEXT,
  "check_type" TEXT NOT NULL,
  "check_description" TEXT,
  "test_dataset" JSONB,
  "protected_attributes" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "bias_detected" BOOLEAN DEFAULT false NOT NULL,
  "bias_score" INTEGER,
  "bias_metrics" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "fairness_score" INTEGER,
  "group_comparisons" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "statistical_significance" JSONB,
  "recommendations" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "status" TEXT DEFAULT 'completed' NOT NULL,
  "notes" TEXT,
  "tags" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "metadata" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "completed_at" TIMESTAMP WITH TIME ZONE
);

-- Data Classifications Table
CREATE TABLE IF NOT EXISTS "financbase_data_classifications" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "classified_by" TEXT,
  "data_type" TEXT NOT NULL,
  "data_category" TEXT NOT NULL,
  "classification_level" "data_classification_level" NOT NULL,
  "data_location" TEXT,
  "data_source" TEXT,
  "data_format" TEXT,
  "contains_pii" BOOLEAN DEFAULT false NOT NULL,
  "pii_types" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "pii_fields" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "sensitivity_score" INTEGER,
  "sensitivity_factors" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "retention_policy" TEXT,
  "retention_period" INTEGER,
  "retention_unit" TEXT,
  "auto_delete" BOOLEAN DEFAULT false NOT NULL,
  "delete_after" TIMESTAMP WITH TIME ZONE,
  "compliance_frameworks" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "legal_basis" TEXT,
  "requires_encryption" BOOLEAN DEFAULT false NOT NULL,
  "requires_access_control" BOOLEAN DEFAULT true NOT NULL,
  "classification_method" TEXT NOT NULL,
  "classification_confidence" INTEGER,
  "is_active" BOOLEAN DEFAULT true NOT NULL,
  "last_reviewed" TIMESTAMP WITH TIME ZONE,
  "next_review" TIMESTAMP WITH TIME ZONE,
  "description" TEXT,
  "tags" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "metadata" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- State Privacy Compliance Table
CREATE TABLE IF NOT EXISTS "financbase_state_privacy_compliance" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "managed_by" TEXT,
  "state_law" "state_privacy_law" NOT NULL,
  "state_code" TEXT NOT NULL,
  "is_compliant" BOOLEAN DEFAULT false NOT NULL,
  "compliance_score" INTEGER,
  "last_assessment" TIMESTAMP WITH TIME ZONE,
  "next_assessment" TIMESTAMP WITH TIME ZONE,
  "requirements" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "requirements_met" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "requirements_pending" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "supports_data_subject_rights" BOOLEAN DEFAULT false NOT NULL,
  "data_subject_rights" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "consent_management_enabled" BOOLEAN DEFAULT false NOT NULL,
  "consent_tracking_enabled" BOOLEAN DEFAULT false NOT NULL,
  "data_processing_agreements" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "data_sharing_agreements" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "privacy_policy_url" TEXT,
  "privacy_policy_last_updated" TIMESTAMP WITH TIME ZONE,
  "privacy_policy_compliant" BOOLEAN DEFAULT false NOT NULL,
  "breach_notification_process" BOOLEAN DEFAULT false NOT NULL,
  "breach_notification_timeline" INTEGER,
  "audit_logging_enabled" BOOLEAN DEFAULT true NOT NULL,
  "reporting_enabled" BOOLEAN DEFAULT true NOT NULL,
  "last_report_generated" TIMESTAMP WITH TIME ZONE,
  "findings" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "action_items" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "remediation_plan" JSONB,
  "status" TEXT DEFAULT 'active' NOT NULL,
  "notes" TEXT,
  "tags" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "metadata" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "dora_incidents_org_id_idx" ON "financbase_dora_incident_reports"("organization_id");
CREATE INDEX IF NOT EXISTS "dora_incidents_status_idx" ON "financbase_dora_incident_reports"("status");
CREATE INDEX IF NOT EXISTS "dora_incidents_severity_idx" ON "financbase_dora_incident_reports"("severity");
CREATE INDEX IF NOT EXISTS "dora_incidents_detected_at_idx" ON "financbase_dora_incident_reports"("detected_at");

CREATE INDEX IF NOT EXISTS "dora_tests_org_id_idx" ON "financbase_dora_resilience_tests"("organization_id");
CREATE INDEX IF NOT EXISTS "dora_tests_status_idx" ON "financbase_dora_resilience_tests"("status");
CREATE INDEX IF NOT EXISTS "dora_tests_type_idx" ON "financbase_dora_resilience_tests"("test_type");
CREATE INDEX IF NOT EXISTS "dora_tests_scheduled_date_idx" ON "financbase_dora_resilience_tests"("scheduled_date");

CREATE INDEX IF NOT EXISTS "dora_risks_org_id_idx" ON "financbase_dora_third_party_risks"("organization_id");
CREATE INDEX IF NOT EXISTS "dora_risks_risk_level_idx" ON "financbase_dora_third_party_risks"("risk_level");
CREATE INDEX IF NOT EXISTS "dora_risks_is_active_idx" ON "financbase_dora_third_party_risks"("is_active");

CREATE INDEX IF NOT EXISTS "ai_decisions_org_id_idx" ON "financbase_ai_model_decisions"("organization_id");
CREATE INDEX IF NOT EXISTS "ai_decisions_user_id_idx" ON "financbase_ai_model_decisions"("user_id");
CREATE INDEX IF NOT EXISTS "ai_decisions_model_name_idx" ON "financbase_ai_model_decisions"("model_name");
CREATE INDEX IF NOT EXISTS "ai_decisions_decision_type_idx" ON "financbase_ai_model_decisions"("decision_type");
CREATE INDEX IF NOT EXISTS "ai_decisions_created_at_idx" ON "financbase_ai_model_decisions"("created_at");

CREATE INDEX IF NOT EXISTS "ai_bias_checks_org_id_idx" ON "financbase_ai_model_bias_checks"("organization_id");
CREATE INDEX IF NOT EXISTS "ai_bias_checks_decision_id_idx" ON "financbase_ai_model_bias_checks"("model_decision_id");
CREATE INDEX IF NOT EXISTS "ai_bias_checks_bias_detected_idx" ON "financbase_ai_model_bias_checks"("bias_detected");

CREATE INDEX IF NOT EXISTS "data_classifications_org_id_idx" ON "financbase_data_classifications"("organization_id");
CREATE INDEX IF NOT EXISTS "data_classifications_level_idx" ON "financbase_data_classifications"("classification_level");
CREATE INDEX IF NOT EXISTS "data_classifications_contains_pii_idx" ON "financbase_data_classifications"("contains_pii");
CREATE INDEX IF NOT EXISTS "data_classifications_is_active_idx" ON "financbase_data_classifications"("is_active");

CREATE INDEX IF NOT EXISTS "state_privacy_org_id_idx" ON "financbase_state_privacy_compliance"("organization_id");
CREATE INDEX IF NOT EXISTS "state_privacy_state_law_idx" ON "financbase_state_privacy_compliance"("state_law");
CREATE INDEX IF NOT EXISTS "state_privacy_is_compliant_idx" ON "financbase_state_privacy_compliance"("is_compliant");

-- Add comments for documentation
COMMENT ON TABLE "financbase_dora_incident_reports" IS 'DORA ICT incident tracking and reporting';
COMMENT ON TABLE "financbase_dora_resilience_tests" IS 'DORA resilience testing records';
COMMENT ON TABLE "financbase_dora_third_party_risks" IS 'DORA third-party ICT service provider risk assessments';
COMMENT ON TABLE "financbase_ai_model_decisions" IS 'AI/ML model decision logging for governance';
COMMENT ON TABLE "financbase_ai_model_bias_checks" IS 'AI model bias detection and fairness monitoring';
COMMENT ON TABLE "financbase_data_classifications" IS 'Automated data classification with PII detection';
COMMENT ON TABLE "financbase_state_privacy_compliance" IS 'State privacy law compliance tracking (CPRA, CCPA, etc.)';

