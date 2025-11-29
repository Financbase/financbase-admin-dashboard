-- Migration: RLS Policies for Compliance Tables
-- Created: 2025-01-XX
-- Description: Enable Row Level Security and create organization-scoped policies for all compliance tables

-- Enable RLS on all compliance tables
ALTER TABLE IF EXISTS "financbase_security_incidents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "financbase_ir_team_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "financbase_incident_team_assignments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "financbase_ir_runbooks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "financbase_runbook_executions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "financbase_ir_communication_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "financbase_ir_drills" ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS "financbase_siem_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "financbase_siem_integrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "financbase_alert_rules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "financbase_real_time_alerts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "financbase_immutable_audit_trail" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "financbase_log_aggregation_config" ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS "financbase_policy_documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "financbase_policy_versions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "financbase_policy_assignments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "financbase_policy_approval_workflows" ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS "financbase_security_training_programs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "financbase_training_assignments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "financbase_training_assessments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "financbase_training_certificates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "financbase_phishing_simulation_results" ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS "financbase_business_associates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "financbase_baa_compliance_checklist" ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS "financbase_assets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "financbase_risks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "financbase_risk_treatment_plans" ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's organization ID
-- This assumes users have an organization_id column or we can get it from a join
-- For now, we'll use a function that gets the organization from the current user context
CREATE OR REPLACE FUNCTION get_user_organization_id(user_id UUID)
RETURNS UUID AS $$
  SELECT organization_id FROM financbase.users WHERE id = user_id;
$$ LANGUAGE SQL STABLE;

-- Incident Response Policies
CREATE POLICY "ir_incidents_org_select" ON "financbase_security_incidents"
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "ir_incidents_org_insert" ON "financbase_security_incidents"
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "ir_incidents_org_update" ON "financbase_security_incidents"
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "ir_incidents_org_delete" ON "financbase_security_incidents"
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

-- IR Team Members Policies
CREATE POLICY "ir_team_members_org_select" ON "financbase_ir_team_members"
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "ir_team_members_org_insert" ON "financbase_ir_team_members"
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "ir_team_members_org_update" ON "financbase_ir_team_members"
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "ir_team_members_org_delete" ON "financbase_ir_team_members"
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

-- Incident Team Assignments Policies (organization-scoped via incident)
CREATE POLICY "ir_team_assignments_org_select" ON "financbase_incident_team_assignments"
  FOR SELECT USING (
    incident_id IN (
      SELECT id FROM financbase_security_incidents WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "ir_team_assignments_org_insert" ON "financbase_incident_team_assignments"
  FOR INSERT WITH CHECK (
    incident_id IN (
      SELECT id FROM financbase_security_incidents WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "ir_team_assignments_org_update" ON "financbase_incident_team_assignments"
  FOR UPDATE USING (
    incident_id IN (
      SELECT id FROM financbase_security_incidents WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "ir_team_assignments_org_delete" ON "financbase_incident_team_assignments"
  FOR DELETE USING (
    incident_id IN (
      SELECT id FROM financbase_security_incidents WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

-- IR Runbooks Policies
CREATE POLICY "ir_runbooks_org_select" ON "financbase_ir_runbooks"
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "ir_runbooks_org_insert" ON "financbase_ir_runbooks"
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "ir_runbooks_org_update" ON "financbase_ir_runbooks"
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "ir_runbooks_org_delete" ON "financbase_ir_runbooks"
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

-- Runbook Executions Policies (organization-scoped via incident)
CREATE POLICY "ir_runbook_executions_org_select" ON "financbase_runbook_executions"
  FOR SELECT USING (
    incident_id IN (
      SELECT id FROM financbase_security_incidents WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "ir_runbook_executions_org_insert" ON "financbase_runbook_executions"
  FOR INSERT WITH CHECK (
    incident_id IN (
      SELECT id FROM financbase_security_incidents WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "ir_runbook_executions_org_update" ON "financbase_runbook_executions"
  FOR UPDATE USING (
    incident_id IN (
      SELECT id FROM financbase_security_incidents WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "ir_runbook_executions_org_delete" ON "financbase_runbook_executions"
  FOR DELETE USING (
    incident_id IN (
      SELECT id FROM financbase_security_incidents WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

-- IR Communication Templates Policies
CREATE POLICY "ir_communication_templates_org_select" ON "financbase_ir_communication_templates"
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "ir_communication_templates_org_insert" ON "financbase_ir_communication_templates"
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "ir_communication_templates_org_update" ON "financbase_ir_communication_templates"
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "ir_communication_templates_org_delete" ON "financbase_ir_communication_templates"
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

-- IR Drills Policies
CREATE POLICY "ir_drills_org_select" ON "financbase_ir_drills"
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "ir_drills_org_insert" ON "financbase_ir_drills"
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "ir_drills_org_update" ON "financbase_ir_drills"
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "ir_drills_org_delete" ON "financbase_ir_drills"
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

-- SIEM Events Policies
CREATE POLICY "siem_events_org_select" ON "financbase_siem_events"
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "siem_events_org_insert" ON "financbase_siem_events"
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "siem_events_org_update" ON "financbase_siem_events"
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "siem_events_org_delete" ON "financbase_siem_events"
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

-- SIEM Integrations Policies
CREATE POLICY "siem_integrations_org_select" ON "financbase_siem_integrations"
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "siem_integrations_org_insert" ON "financbase_siem_integrations"
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "siem_integrations_org_update" ON "financbase_siem_integrations"
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "siem_integrations_org_delete" ON "financbase_siem_integrations"
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

-- Alert Rules Policies
CREATE POLICY "alert_rules_org_select" ON "financbase_alert_rules"
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "alert_rules_org_insert" ON "financbase_alert_rules"
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "alert_rules_org_update" ON "financbase_alert_rules"
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "alert_rules_org_delete" ON "financbase_alert_rules"
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

-- Real-time Alerts Policies
CREATE POLICY "real_time_alerts_org_select" ON "financbase_real_time_alerts"
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "real_time_alerts_org_insert" ON "financbase_real_time_alerts"
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "real_time_alerts_org_update" ON "financbase_real_time_alerts"
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "real_time_alerts_org_delete" ON "financbase_real_time_alerts"
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

-- Immutable Audit Trail Policies (read-only for compliance)
CREATE POLICY "immutable_audit_trail_org_select" ON "financbase_immutable_audit_trail"
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "immutable_audit_trail_org_insert" ON "financbase_immutable_audit_trail"
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

-- Log Aggregation Config Policies
CREATE POLICY "log_aggregation_config_org_select" ON "financbase_log_aggregation_config"
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "log_aggregation_config_org_insert" ON "financbase_log_aggregation_config"
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "log_aggregation_config_org_update" ON "financbase_log_aggregation_config"
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "log_aggregation_config_org_delete" ON "financbase_log_aggregation_config"
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

-- Policy Documents Policies
CREATE POLICY "policy_documents_org_select" ON "financbase_policy_documents"
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "policy_documents_org_insert" ON "financbase_policy_documents"
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "policy_documents_org_update" ON "financbase_policy_documents"
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "policy_documents_org_delete" ON "financbase_policy_documents"
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

-- Policy Versions Policies (organization-scoped via policy)
CREATE POLICY "policy_versions_org_select" ON "financbase_policy_versions"
  FOR SELECT USING (
    policy_id IN (
      SELECT id FROM financbase_policy_documents WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "policy_versions_org_insert" ON "financbase_policy_versions"
  FOR INSERT WITH CHECK (
    policy_id IN (
      SELECT id FROM financbase_policy_documents WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "policy_versions_org_update" ON "financbase_policy_versions"
  FOR UPDATE USING (
    policy_id IN (
      SELECT id FROM financbase_policy_documents WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "policy_versions_org_delete" ON "financbase_policy_versions"
  FOR DELETE USING (
    policy_id IN (
      SELECT id FROM financbase_policy_documents WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

-- Policy Assignments Policies (organization-scoped via policy)
CREATE POLICY "policy_assignments_org_select" ON "financbase_policy_assignments"
  FOR SELECT USING (
    policy_id IN (
      SELECT id FROM financbase_policy_documents WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "policy_assignments_org_insert" ON "financbase_policy_assignments"
  FOR INSERT WITH CHECK (
    policy_id IN (
      SELECT id FROM financbase_policy_documents WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "policy_assignments_org_update" ON "financbase_policy_assignments"
  FOR UPDATE USING (
    policy_id IN (
      SELECT id FROM financbase_policy_documents WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "policy_assignments_org_delete" ON "financbase_policy_assignments"
  FOR DELETE USING (
    policy_id IN (
      SELECT id FROM financbase_policy_documents WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

-- Policy Approval Workflows Policies (organization-scoped via policy)
CREATE POLICY "policy_approval_workflows_org_select" ON "financbase_policy_approval_workflows"
  FOR SELECT USING (
    policy_id IN (
      SELECT id FROM financbase_policy_documents WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "policy_approval_workflows_org_insert" ON "financbase_policy_approval_workflows"
  FOR INSERT WITH CHECK (
    policy_id IN (
      SELECT id FROM financbase_policy_documents WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "policy_approval_workflows_org_update" ON "financbase_policy_approval_workflows"
  FOR UPDATE USING (
    policy_id IN (
      SELECT id FROM financbase_policy_documents WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "policy_approval_workflows_org_delete" ON "financbase_policy_approval_workflows"
  FOR DELETE USING (
    policy_id IN (
      SELECT id FROM financbase_policy_documents WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

-- Security Training Programs Policies
CREATE POLICY "security_training_programs_org_select" ON "financbase_security_training_programs"
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "security_training_programs_org_insert" ON "financbase_security_training_programs"
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "security_training_programs_org_update" ON "financbase_security_training_programs"
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "security_training_programs_org_delete" ON "financbase_security_training_programs"
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

-- Training Assignments Policies
CREATE POLICY "training_assignments_org_select" ON "financbase_training_assignments"
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "training_assignments_org_insert" ON "financbase_training_assignments"
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "training_assignments_org_update" ON "financbase_training_assignments"
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "training_assignments_org_delete" ON "financbase_training_assignments"
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

-- Training Assessments Policies (organization-scoped via assignment)
CREATE POLICY "training_assessments_org_select" ON "financbase_training_assessments"
  FOR SELECT USING (
    assignment_id IN (
      SELECT id FROM financbase_training_assignments WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "training_assessments_org_insert" ON "financbase_training_assessments"
  FOR INSERT WITH CHECK (
    assignment_id IN (
      SELECT id FROM financbase_training_assignments WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "training_assessments_org_update" ON "financbase_training_assessments"
  FOR UPDATE USING (
    assignment_id IN (
      SELECT id FROM financbase_training_assignments WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "training_assessments_org_delete" ON "financbase_training_assessments"
  FOR DELETE USING (
    assignment_id IN (
      SELECT id FROM financbase_training_assignments WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

-- Training Certificates Policies (organization-scoped via assignment)
CREATE POLICY "training_certificates_org_select" ON "financbase_training_certificates"
  FOR SELECT USING (
    assignment_id IN (
      SELECT id FROM financbase_training_assignments WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "training_certificates_org_insert" ON "financbase_training_certificates"
  FOR INSERT WITH CHECK (
    assignment_id IN (
      SELECT id FROM financbase_training_assignments WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "training_certificates_org_update" ON "financbase_training_certificates"
  FOR UPDATE USING (
    assignment_id IN (
      SELECT id FROM financbase_training_assignments WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "training_certificates_org_delete" ON "financbase_training_certificates"
  FOR DELETE USING (
    assignment_id IN (
      SELECT id FROM financbase_training_assignments WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

-- Phishing Simulation Results Policies
CREATE POLICY "phishing_simulation_results_org_select" ON "financbase_phishing_simulation_results"
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "phishing_simulation_results_org_insert" ON "financbase_phishing_simulation_results"
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "phishing_simulation_results_org_update" ON "financbase_phishing_simulation_results"
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "phishing_simulation_results_org_delete" ON "financbase_phishing_simulation_results"
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

-- Business Associates Policies
CREATE POLICY "business_associates_org_select" ON "financbase_business_associates"
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "business_associates_org_insert" ON "financbase_business_associates"
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "business_associates_org_update" ON "financbase_business_associates"
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "business_associates_org_delete" ON "financbase_business_associates"
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

-- BAA Compliance Checklist Policies (organization-scoped via business associate)
CREATE POLICY "baa_compliance_checklist_org_select" ON "financbase_baa_compliance_checklist"
  FOR SELECT USING (
    business_associate_id IN (
      SELECT id FROM financbase_business_associates WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "baa_compliance_checklist_org_insert" ON "financbase_baa_compliance_checklist"
  FOR INSERT WITH CHECK (
    business_associate_id IN (
      SELECT id FROM financbase_business_associates WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "baa_compliance_checklist_org_update" ON "financbase_baa_compliance_checklist"
  FOR UPDATE USING (
    business_associate_id IN (
      SELECT id FROM financbase_business_associates WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "baa_compliance_checklist_org_delete" ON "financbase_baa_compliance_checklist"
  FOR DELETE USING (
    business_associate_id IN (
      SELECT id FROM financbase_business_associates WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

-- Assets Policies
CREATE POLICY "assets_org_select" ON "financbase_assets"
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "assets_org_insert" ON "financbase_assets"
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "assets_org_update" ON "financbase_assets"
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "assets_org_delete" ON "financbase_assets"
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

-- Risks Policies
CREATE POLICY "risks_org_select" ON "financbase_risks"
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "risks_org_insert" ON "financbase_risks"
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "risks_org_update" ON "financbase_risks"
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

CREATE POLICY "risks_org_delete" ON "financbase_risks"
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  );

-- Risk Treatment Plans Policies (organization-scoped via risk)
CREATE POLICY "risk_treatment_plans_org_select" ON "financbase_risk_treatment_plans"
  FOR SELECT USING (
    risk_id IN (
      SELECT id FROM financbase_risks WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "risk_treatment_plans_org_insert" ON "financbase_risk_treatment_plans"
  FOR INSERT WITH CHECK (
    risk_id IN (
      SELECT id FROM financbase_risks WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "risk_treatment_plans_org_update" ON "financbase_risk_treatment_plans"
  FOR UPDATE USING (
    risk_id IN (
      SELECT id FROM financbase_risks WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

CREATE POLICY "risk_treatment_plans_org_delete" ON "financbase_risk_treatment_plans"
  FOR DELETE USING (
    risk_id IN (
      SELECT id FROM financbase_risks WHERE organization_id IN (
        SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid
      )
    )
  );

