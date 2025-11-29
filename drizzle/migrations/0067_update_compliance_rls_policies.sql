-- Migration: Update Compliance RLS Policies to Use app.current_org_id
-- Created: 2025-01-XX
-- Description: Updates all compliance table RLS policies to use active organization from session
--              instead of looking up from users table

-- This migration updates policies from migration 0061_rls_policies_compliance.sql

-- Helper function (already created in 0066, but ensure it exists)
CREATE OR REPLACE FUNCTION get_active_organization_id()
RETURNS UUID AS $$
  SELECT current_setting('app.current_org_id', true)::uuid;
$$ LANGUAGE SQL STABLE;

-- Update pattern: Replace
--   organization_id IN (SELECT organization_id FROM financbase.users WHERE id = current_setting('app.current_user_id', true)::uuid)
-- With:
--   organization_id = get_active_organization_id()

-- ============================================================================
-- DIRECT organization_id POLICIES (Simple replacement)
-- ============================================================================

-- financbase_security_incidents
DROP POLICY IF EXISTS "ir_incidents_org_select" ON "public"."financbase_security_incidents";
CREATE POLICY "ir_incidents_org_select" ON "public"."financbase_security_incidents"
  FOR SELECT USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "ir_incidents_org_insert" ON "public"."financbase_security_incidents";
CREATE POLICY "ir_incidents_org_insert" ON "public"."financbase_security_incidents"
  FOR INSERT WITH CHECK (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "ir_incidents_org_update" ON "public"."financbase_security_incidents";
CREATE POLICY "ir_incidents_org_update" ON "public"."financbase_security_incidents"
  FOR UPDATE USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "ir_incidents_org_delete" ON "public"."financbase_security_incidents";
CREATE POLICY "ir_incidents_org_delete" ON "public"."financbase_security_incidents"
  FOR DELETE USING (organization_id = get_active_organization_id());

-- financbase_ir_team_members
DROP POLICY IF EXISTS "ir_team_members_org_select" ON "public"."financbase_ir_team_members";
CREATE POLICY "ir_team_members_org_select" ON "public"."financbase_ir_team_members"
  FOR SELECT USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "ir_team_members_org_insert" ON "public"."financbase_ir_team_members";
CREATE POLICY "ir_team_members_org_insert" ON "public"."financbase_ir_team_members"
  FOR INSERT WITH CHECK (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "ir_team_members_org_update" ON "public"."financbase_ir_team_members";
CREATE POLICY "ir_team_members_org_update" ON "public"."financbase_ir_team_members"
  FOR UPDATE USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "ir_team_members_org_delete" ON "public"."financbase_ir_team_members";
CREATE POLICY "ir_team_members_org_delete" ON "public"."financbase_ir_team_members"
  FOR DELETE USING (organization_id = get_active_organization_id());

-- financbase_ir_runbooks
DROP POLICY IF EXISTS "ir_runbooks_org_select" ON "public"."financbase_ir_runbooks";
CREATE POLICY "ir_runbooks_org_select" ON "public"."financbase_ir_runbooks"
  FOR SELECT USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "ir_runbooks_org_insert" ON "public"."financbase_ir_runbooks";
CREATE POLICY "ir_runbooks_org_insert" ON "public"."financbase_ir_runbooks"
  FOR INSERT WITH CHECK (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "ir_runbooks_org_update" ON "public"."financbase_ir_runbooks";
CREATE POLICY "ir_runbooks_org_update" ON "public"."financbase_ir_runbooks"
  FOR UPDATE USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "ir_runbooks_org_delete" ON "public"."financbase_ir_runbooks";
CREATE POLICY "ir_runbooks_org_delete" ON "public"."financbase_ir_runbooks"
  FOR DELETE USING (organization_id = get_active_organization_id());

-- financbase_ir_communication_templates
DROP POLICY IF EXISTS "ir_communication_templates_org_select" ON "public"."financbase_ir_communication_templates";
CREATE POLICY "ir_communication_templates_org_select" ON "public"."financbase_ir_communication_templates"
  FOR SELECT USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "ir_communication_templates_org_insert" ON "public"."financbase_ir_communication_templates";
CREATE POLICY "ir_communication_templates_org_insert" ON "public"."financbase_ir_communication_templates"
  FOR INSERT WITH CHECK (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "ir_communication_templates_org_update" ON "public"."financbase_ir_communication_templates";
CREATE POLICY "ir_communication_templates_org_update" ON "public"."financbase_ir_communication_templates"
  FOR UPDATE USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "ir_communication_templates_org_delete" ON "public"."financbase_ir_communication_templates";
CREATE POLICY "ir_communication_templates_org_delete" ON "public"."financbase_ir_communication_templates"
  FOR DELETE USING (organization_id = get_active_organization_id());

-- financbase_ir_drills
DROP POLICY IF EXISTS "ir_drills_org_select" ON "public"."financbase_ir_drills";
CREATE POLICY "ir_drills_org_select" ON "public"."financbase_ir_drills"
  FOR SELECT USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "ir_drills_org_insert" ON "public"."financbase_ir_drills";
CREATE POLICY "ir_drills_org_insert" ON "public"."financbase_ir_drills"
  FOR INSERT WITH CHECK (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "ir_drills_org_update" ON "public"."financbase_ir_drills";
CREATE POLICY "ir_drills_org_update" ON "public"."financbase_ir_drills"
  FOR UPDATE USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "ir_drills_org_delete" ON "public"."financbase_ir_drills";
CREATE POLICY "ir_drills_org_delete" ON "public"."financbase_ir_drills"
  FOR DELETE USING (organization_id = get_active_organization_id());

-- financbase_siem_events
DROP POLICY IF EXISTS "siem_events_org_select" ON "public"."financbase_siem_events";
CREATE POLICY "siem_events_org_select" ON "public"."financbase_siem_events"
  FOR SELECT USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "siem_events_org_insert" ON "public"."financbase_siem_events";
CREATE POLICY "siem_events_org_insert" ON "public"."financbase_siem_events"
  FOR INSERT WITH CHECK (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "siem_events_org_update" ON "public"."financbase_siem_events";
CREATE POLICY "siem_events_org_update" ON "public"."financbase_siem_events"
  FOR UPDATE USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "siem_events_org_delete" ON "public"."financbase_siem_events";
CREATE POLICY "siem_events_org_delete" ON "public"."financbase_siem_events"
  FOR DELETE USING (organization_id = get_active_organization_id());

-- financbase_siem_integrations
DROP POLICY IF EXISTS "siem_integrations_org_select" ON "public"."financbase_siem_integrations";
CREATE POLICY "siem_integrations_org_select" ON "public"."financbase_siem_integrations"
  FOR SELECT USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "siem_integrations_org_insert" ON "public"."financbase_siem_integrations";
CREATE POLICY "siem_integrations_org_insert" ON "public"."financbase_siem_integrations"
  FOR INSERT WITH CHECK (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "siem_integrations_org_update" ON "public"."financbase_siem_integrations";
CREATE POLICY "siem_integrations_org_update" ON "public"."financbase_siem_integrations"
  FOR UPDATE USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "siem_integrations_org_delete" ON "public"."financbase_siem_integrations";
CREATE POLICY "siem_integrations_org_delete" ON "public"."financbase_siem_integrations"
  FOR DELETE USING (organization_id = get_active_organization_id());

-- financbase_alert_rules
DROP POLICY IF EXISTS "alert_rules_org_select" ON "public"."financbase_alert_rules";
CREATE POLICY "alert_rules_org_select" ON "public"."financbase_alert_rules"
  FOR SELECT USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "alert_rules_org_insert" ON "public"."financbase_alert_rules";
CREATE POLICY "alert_rules_org_insert" ON "public"."financbase_alert_rules"
  FOR INSERT WITH CHECK (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "alert_rules_org_update" ON "public"."financbase_alert_rules";
CREATE POLICY "alert_rules_org_update" ON "public"."financbase_alert_rules"
  FOR UPDATE USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "alert_rules_org_delete" ON "public"."financbase_alert_rules";
CREATE POLICY "alert_rules_org_delete" ON "public"."financbase_alert_rules"
  FOR DELETE USING (organization_id = get_active_organization_id());

-- financbase_real_time_alerts
DROP POLICY IF EXISTS "real_time_alerts_org_select" ON "public"."financbase_real_time_alerts";
CREATE POLICY "real_time_alerts_org_select" ON "public"."financbase_real_time_alerts"
  FOR SELECT USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "real_time_alerts_org_insert" ON "public"."financbase_real_time_alerts";
CREATE POLICY "real_time_alerts_org_insert" ON "public"."financbase_real_time_alerts"
  FOR INSERT WITH CHECK (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "real_time_alerts_org_update" ON "public"."financbase_real_time_alerts";
CREATE POLICY "real_time_alerts_org_update" ON "public"."financbase_real_time_alerts"
  FOR UPDATE USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "real_time_alerts_org_delete" ON "public"."financbase_real_time_alerts";
CREATE POLICY "real_time_alerts_org_delete" ON "public"."financbase_real_time_alerts"
  FOR DELETE USING (organization_id = get_active_organization_id());

-- financbase_immutable_audit_trail
DROP POLICY IF EXISTS "immutable_audit_trail_org_select" ON "public"."financbase_immutable_audit_trail";
CREATE POLICY "immutable_audit_trail_org_select" ON "public"."financbase_immutable_audit_trail"
  FOR SELECT USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "immutable_audit_trail_org_insert" ON "public"."financbase_immutable_audit_trail";
CREATE POLICY "immutable_audit_trail_org_insert" ON "public"."financbase_immutable_audit_trail"
  FOR INSERT WITH CHECK (organization_id = get_active_organization_id());

-- financbase_log_aggregation_config
DROP POLICY IF EXISTS "log_aggregation_config_org_select" ON "public"."financbase_log_aggregation_config";
CREATE POLICY "log_aggregation_config_org_select" ON "public"."financbase_log_aggregation_config"
  FOR SELECT USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "log_aggregation_config_org_insert" ON "public"."financbase_log_aggregation_config";
CREATE POLICY "log_aggregation_config_org_insert" ON "public"."financbase_log_aggregation_config"
  FOR INSERT WITH CHECK (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "log_aggregation_config_org_update" ON "public"."financbase_log_aggregation_config";
CREATE POLICY "log_aggregation_config_org_update" ON "public"."financbase_log_aggregation_config"
  FOR UPDATE USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "log_aggregation_config_org_delete" ON "public"."financbase_log_aggregation_config";
CREATE POLICY "log_aggregation_config_org_delete" ON "public"."financbase_log_aggregation_config"
  FOR DELETE USING (organization_id = get_active_organization_id());

-- financbase_policy_documents
DROP POLICY IF EXISTS "policy_documents_org_select" ON "public"."financbase_policy_documents";
CREATE POLICY "policy_documents_org_select" ON "public"."financbase_policy_documents"
  FOR SELECT USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "policy_documents_org_insert" ON "public"."financbase_policy_documents";
CREATE POLICY "policy_documents_org_insert" ON "public"."financbase_policy_documents"
  FOR INSERT WITH CHECK (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "policy_documents_org_update" ON "public"."financbase_policy_documents";
CREATE POLICY "policy_documents_org_update" ON "public"."financbase_policy_documents"
  FOR UPDATE USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "policy_documents_org_delete" ON "public"."financbase_policy_documents";
CREATE POLICY "policy_documents_org_delete" ON "public"."financbase_policy_documents"
  FOR DELETE USING (organization_id = get_active_organization_id());

-- financbase_policy_versions
DROP POLICY IF EXISTS "policy_versions_org_select" ON "public"."financbase_policy_versions";
CREATE POLICY "policy_versions_org_select" ON "public"."financbase_policy_versions"
  FOR SELECT USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "policy_versions_org_insert" ON "public"."financbase_policy_versions";
CREATE POLICY "policy_versions_org_insert" ON "public"."financbase_policy_versions"
  FOR INSERT WITH CHECK (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "policy_versions_org_update" ON "public"."financbase_policy_versions";
CREATE POLICY "policy_versions_org_update" ON "public"."financbase_policy_versions"
  FOR UPDATE USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "policy_versions_org_delete" ON "public"."financbase_policy_versions";
CREATE POLICY "policy_versions_org_delete" ON "public"."financbase_policy_versions"
  FOR DELETE USING (organization_id = get_active_organization_id());

-- financbase_policy_assignments
DROP POLICY IF EXISTS "policy_assignments_org_select" ON "public"."financbase_policy_assignments";
CREATE POLICY "policy_assignments_org_select" ON "public"."financbase_policy_assignments"
  FOR SELECT USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "policy_assignments_org_insert" ON "public"."financbase_policy_assignments";
CREATE POLICY "policy_assignments_org_insert" ON "public"."financbase_policy_assignments"
  FOR INSERT WITH CHECK (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "policy_assignments_org_update" ON "public"."financbase_policy_assignments";
CREATE POLICY "policy_assignments_org_update" ON "public"."financbase_policy_assignments"
  FOR UPDATE USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "policy_assignments_org_delete" ON "public"."financbase_policy_assignments";
CREATE POLICY "policy_assignments_org_delete" ON "public"."financbase_policy_assignments"
  FOR DELETE USING (organization_id = get_active_organization_id());

-- financbase_policy_approval_workflows
DROP POLICY IF EXISTS "policy_approval_workflows_org_select" ON "public"."financbase_policy_approval_workflows";
CREATE POLICY "policy_approval_workflows_org_select" ON "public"."financbase_policy_approval_workflows"
  FOR SELECT USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "policy_approval_workflows_org_insert" ON "public"."financbase_policy_approval_workflows";
CREATE POLICY "policy_approval_workflows_org_insert" ON "public"."financbase_policy_approval_workflows"
  FOR INSERT WITH CHECK (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "policy_approval_workflows_org_update" ON "public"."financbase_policy_approval_workflows";
CREATE POLICY "policy_approval_workflows_org_update" ON "public"."financbase_policy_approval_workflows"
  FOR UPDATE USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "policy_approval_workflows_org_delete" ON "public"."financbase_policy_approval_workflows";
CREATE POLICY "policy_approval_workflows_org_delete" ON "public"."financbase_policy_approval_workflows"
  FOR DELETE USING (organization_id = get_active_organization_id());

-- financbase_security_training_programs
DROP POLICY IF EXISTS "security_training_programs_org_select" ON "public"."financbase_security_training_programs";
CREATE POLICY "security_training_programs_org_select" ON "public"."financbase_security_training_programs"
  FOR SELECT USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "security_training_programs_org_insert" ON "public"."financbase_security_training_programs";
CREATE POLICY "security_training_programs_org_insert" ON "public"."financbase_security_training_programs"
  FOR INSERT WITH CHECK (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "security_training_programs_org_update" ON "public"."financbase_security_training_programs";
CREATE POLICY "security_training_programs_org_update" ON "public"."financbase_security_training_programs"
  FOR UPDATE USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "security_training_programs_org_delete" ON "public"."financbase_security_training_programs";
CREATE POLICY "security_training_programs_org_delete" ON "public"."financbase_security_training_programs"
  FOR DELETE USING (organization_id = get_active_organization_id());

-- financbase_training_assignments
DROP POLICY IF EXISTS "training_assignments_org_select" ON "public"."financbase_training_assignments";
CREATE POLICY "training_assignments_org_select" ON "public"."financbase_training_assignments"
  FOR SELECT USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "training_assignments_org_insert" ON "public"."financbase_training_assignments";
CREATE POLICY "training_assignments_org_insert" ON "public"."financbase_training_assignments"
  FOR INSERT WITH CHECK (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "training_assignments_org_update" ON "public"."financbase_training_assignments";
CREATE POLICY "training_assignments_org_update" ON "public"."financbase_training_assignments"
  FOR UPDATE USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "training_assignments_org_delete" ON "public"."financbase_training_assignments";
CREATE POLICY "training_assignments_org_delete" ON "public"."financbase_training_assignments"
  FOR DELETE USING (organization_id = get_active_organization_id());

-- financbase_business_associates
DROP POLICY IF EXISTS "business_associates_org_select" ON "public"."financbase_business_associates";
CREATE POLICY "business_associates_org_select" ON "public"."financbase_business_associates"
  FOR SELECT USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "business_associates_org_insert" ON "public"."financbase_business_associates";
CREATE POLICY "business_associates_org_insert" ON "public"."financbase_business_associates"
  FOR INSERT WITH CHECK (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "business_associates_org_update" ON "public"."financbase_business_associates";
CREATE POLICY "business_associates_org_update" ON "public"."financbase_business_associates"
  FOR UPDATE USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "business_associates_org_delete" ON "public"."financbase_business_associates";
CREATE POLICY "business_associates_org_delete" ON "public"."financbase_business_associates"
  FOR DELETE USING (organization_id = get_active_organization_id());

-- financbase_assets
DROP POLICY IF EXISTS "assets_org_select" ON "public"."financbase_assets";
CREATE POLICY "assets_org_select" ON "public"."financbase_assets"
  FOR SELECT USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "assets_org_insert" ON "public"."financbase_assets";
CREATE POLICY "assets_org_insert" ON "public"."financbase_assets"
  FOR INSERT WITH CHECK (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "assets_org_update" ON "public"."financbase_assets";
CREATE POLICY "assets_org_update" ON "public"."financbase_assets"
  FOR UPDATE USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "assets_org_delete" ON "public"."financbase_assets";
CREATE POLICY "assets_org_delete" ON "public"."financbase_assets"
  FOR DELETE USING (organization_id = get_active_organization_id());

-- financbase_risks
DROP POLICY IF EXISTS "risks_org_select" ON "public"."financbase_risks";
CREATE POLICY "risks_org_select" ON "public"."financbase_risks"
  FOR SELECT USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "risks_org_insert" ON "public"."financbase_risks";
CREATE POLICY "risks_org_insert" ON "public"."financbase_risks"
  FOR INSERT WITH CHECK (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "risks_org_update" ON "public"."financbase_risks";
CREATE POLICY "risks_org_update" ON "public"."financbase_risks"
  FOR UPDATE USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "risks_org_delete" ON "public"."financbase_risks";
CREATE POLICY "risks_org_delete" ON "public"."financbase_risks"
  FOR DELETE USING (organization_id = get_active_organization_id());

-- financbase_risk_treatment_plans
DROP POLICY IF EXISTS "risk_treatment_plans_org_select" ON "public"."financbase_risk_treatment_plans";
CREATE POLICY "risk_treatment_plans_org_select" ON "public"."financbase_risk_treatment_plans"
  FOR SELECT USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "risk_treatment_plans_org_insert" ON "public"."financbase_risk_treatment_plans";
CREATE POLICY "risk_treatment_plans_org_insert" ON "public"."financbase_risk_treatment_plans"
  FOR INSERT WITH CHECK (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "risk_treatment_plans_org_update" ON "public"."financbase_risk_treatment_plans";
CREATE POLICY "risk_treatment_plans_org_update" ON "public"."financbase_risk_treatment_plans"
  FOR UPDATE USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "risk_treatment_plans_org_delete" ON "public"."financbase_risk_treatment_plans";
CREATE POLICY "risk_treatment_plans_org_delete" ON "public"."financbase_risk_treatment_plans"
  FOR DELETE USING (organization_id = get_active_organization_id());

-- financbase_phishing_simulation_results
DROP POLICY IF EXISTS "phishing_simulation_results_org_select" ON "public"."financbase_phishing_simulation_results";
CREATE POLICY "phishing_simulation_results_org_select" ON "public"."financbase_phishing_simulation_results"
  FOR SELECT USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "phishing_simulation_results_org_insert" ON "public"."financbase_phishing_simulation_results";
CREATE POLICY "phishing_simulation_results_org_insert" ON "public"."financbase_phishing_simulation_results"
  FOR INSERT WITH CHECK (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "phishing_simulation_results_org_update" ON "public"."financbase_phishing_simulation_results";
CREATE POLICY "phishing_simulation_results_org_update" ON "public"."financbase_phishing_simulation_results"
  FOR UPDATE USING (organization_id = get_active_organization_id());

DROP POLICY IF EXISTS "phishing_simulation_results_org_delete" ON "public"."financbase_phishing_simulation_results";
CREATE POLICY "phishing_simulation_results_org_delete" ON "public"."financbase_phishing_simulation_results"
  FOR DELETE USING (organization_id = get_active_organization_id());

-- ============================================================================
-- INDIRECT organization_id POLICIES (Via foreign key relationships)
-- ============================================================================

-- financbase_incident_team_assignments (via incident_id -> financbase_security_incidents.organization_id)
DROP POLICY IF EXISTS "ir_team_assignments_org_select" ON "public"."financbase_incident_team_assignments";
CREATE POLICY "ir_team_assignments_org_select" ON "public"."financbase_incident_team_assignments"
  FOR SELECT USING (
    incident_id IN (
      SELECT id FROM "public"."financbase_security_incidents" 
      WHERE organization_id = get_active_organization_id()
    )
  );

DROP POLICY IF EXISTS "ir_team_assignments_org_insert" ON "public"."financbase_incident_team_assignments";
CREATE POLICY "ir_team_assignments_org_insert" ON "public"."financbase_incident_team_assignments"
  FOR INSERT WITH CHECK (
    incident_id IN (
      SELECT id FROM "public"."financbase_security_incidents" 
      WHERE organization_id = get_active_organization_id()
    )
  );

DROP POLICY IF EXISTS "ir_team_assignments_org_update" ON "public"."financbase_incident_team_assignments";
CREATE POLICY "ir_team_assignments_org_update" ON "public"."financbase_incident_team_assignments"
  FOR UPDATE USING (
    incident_id IN (
      SELECT id FROM "public"."financbase_security_incidents" 
      WHERE organization_id = get_active_organization_id()
    )
  );

DROP POLICY IF EXISTS "ir_team_assignments_org_delete" ON "public"."financbase_incident_team_assignments";
CREATE POLICY "ir_team_assignments_org_delete" ON "public"."financbase_incident_team_assignments"
  FOR DELETE USING (
    incident_id IN (
      SELECT id FROM "public"."financbase_security_incidents" 
      WHERE organization_id = get_active_organization_id()
    )
  );

-- financbase_runbook_executions (via incident_id -> financbase_security_incidents.organization_id)
DROP POLICY IF EXISTS "ir_runbook_executions_org_select" ON "public"."financbase_runbook_executions";
CREATE POLICY "ir_runbook_executions_org_select" ON "public"."financbase_runbook_executions"
  FOR SELECT USING (
    incident_id IN (
      SELECT id FROM "public"."financbase_security_incidents" 
      WHERE organization_id = get_active_organization_id()
    )
  );

DROP POLICY IF EXISTS "ir_runbook_executions_org_insert" ON "public"."financbase_runbook_executions";
CREATE POLICY "ir_runbook_executions_org_insert" ON "public"."financbase_runbook_executions"
  FOR INSERT WITH CHECK (
    incident_id IN (
      SELECT id FROM "public"."financbase_security_incidents" 
      WHERE organization_id = get_active_organization_id()
    )
  );

DROP POLICY IF EXISTS "ir_runbook_executions_org_update" ON "public"."financbase_runbook_executions";
CREATE POLICY "ir_runbook_executions_org_update" ON "public"."financbase_runbook_executions"
  FOR UPDATE USING (
    incident_id IN (
      SELECT id FROM "public"."financbase_security_incidents" 
      WHERE organization_id = get_active_organization_id()
    )
  );

DROP POLICY IF EXISTS "ir_runbook_executions_org_delete" ON "public"."financbase_runbook_executions";
CREATE POLICY "ir_runbook_executions_org_delete" ON "public"."financbase_runbook_executions"
  FOR DELETE USING (
    incident_id IN (
      SELECT id FROM "public"."financbase_security_incidents" 
      WHERE organization_id = get_active_organization_id()
    )
  );

-- financbase_training_assessments (via assignment_id -> financbase_training_assignments.organization_id)
DROP POLICY IF EXISTS "training_assessments_org_select" ON "public"."financbase_training_assessments";
CREATE POLICY "training_assessments_org_select" ON "public"."financbase_training_assessments"
  FOR SELECT USING (
    assignment_id IN (
      SELECT id FROM "public"."financbase_training_assignments" 
      WHERE organization_id = get_active_organization_id()
    )
  );

DROP POLICY IF EXISTS "training_assessments_org_insert" ON "public"."financbase_training_assessments";
CREATE POLICY "training_assessments_org_insert" ON "public"."financbase_training_assessments"
  FOR INSERT WITH CHECK (
    assignment_id IN (
      SELECT id FROM "public"."financbase_training_assignments" 
      WHERE organization_id = get_active_organization_id()
    )
  );

DROP POLICY IF EXISTS "training_assessments_org_update" ON "public"."financbase_training_assessments";
CREATE POLICY "training_assessments_org_update" ON "public"."financbase_training_assessments"
  FOR UPDATE USING (
    assignment_id IN (
      SELECT id FROM "public"."financbase_training_assignments" 
      WHERE organization_id = get_active_organization_id()
    )
  );

DROP POLICY IF EXISTS "training_assessments_org_delete" ON "public"."financbase_training_assessments";
CREATE POLICY "training_assessments_org_delete" ON "public"."financbase_training_assessments"
  FOR DELETE USING (
    assignment_id IN (
      SELECT id FROM "public"."financbase_training_assignments" 
      WHERE organization_id = get_active_organization_id()
    )
  );

-- financbase_training_certificates (via assignment_id -> financbase_training_assignments.organization_id)
DROP POLICY IF EXISTS "training_certificates_org_select" ON "public"."financbase_training_certificates";
CREATE POLICY "training_certificates_org_select" ON "public"."financbase_training_certificates"
  FOR SELECT USING (
    assignment_id IN (
      SELECT id FROM "public"."financbase_training_assignments" 
      WHERE organization_id = get_active_organization_id()
    )
  );

DROP POLICY IF EXISTS "training_certificates_org_insert" ON "public"."financbase_training_certificates";
CREATE POLICY "training_certificates_org_insert" ON "public"."financbase_training_certificates"
  FOR INSERT WITH CHECK (
    assignment_id IN (
      SELECT id FROM "public"."financbase_training_assignments" 
      WHERE organization_id = get_active_organization_id()
    )
  );

DROP POLICY IF EXISTS "training_certificates_org_update" ON "public"."financbase_training_certificates";
CREATE POLICY "training_certificates_org_update" ON "public"."financbase_training_certificates"
  FOR UPDATE USING (
    assignment_id IN (
      SELECT id FROM "public"."financbase_training_assignments" 
      WHERE organization_id = get_active_organization_id()
    )
  );

DROP POLICY IF EXISTS "training_certificates_org_delete" ON "public"."financbase_training_certificates";
CREATE POLICY "training_certificates_org_delete" ON "public"."financbase_training_certificates"
  FOR DELETE USING (
    assignment_id IN (
      SELECT id FROM "public"."financbase_training_assignments" 
      WHERE organization_id = get_active_organization_id()
    )
  );

-- financbase_baa_compliance_checklist (via business_associate_id -> financbase_business_associates.organization_id)
DROP POLICY IF EXISTS "baa_compliance_checklist_org_select" ON "public"."financbase_baa_compliance_checklist";
CREATE POLICY "baa_compliance_checklist_org_select" ON "public"."financbase_baa_compliance_checklist"
  FOR SELECT USING (
    business_associate_id IN (
      SELECT id FROM "public"."financbase_business_associates" 
      WHERE organization_id = get_active_organization_id()
    )
  );

DROP POLICY IF EXISTS "baa_compliance_checklist_org_insert" ON "public"."financbase_baa_compliance_checklist";
CREATE POLICY "baa_compliance_checklist_org_insert" ON "public"."financbase_baa_compliance_checklist"
  FOR INSERT WITH CHECK (
    business_associate_id IN (
      SELECT id FROM "public"."financbase_business_associates" 
      WHERE organization_id = get_active_organization_id()
    )
  );

DROP POLICY IF EXISTS "baa_compliance_checklist_org_update" ON "public"."financbase_baa_compliance_checklist";
CREATE POLICY "baa_compliance_checklist_org_update" ON "public"."financbase_baa_compliance_checklist"
  FOR UPDATE USING (
    business_associate_id IN (
      SELECT id FROM "public"."financbase_business_associates" 
      WHERE organization_id = get_active_organization_id()
    )
  );

DROP POLICY IF EXISTS "baa_compliance_checklist_org_delete" ON "public"."financbase_baa_compliance_checklist";
CREATE POLICY "baa_compliance_checklist_org_delete" ON "public"."financbase_baa_compliance_checklist"
  FOR DELETE USING (
    business_associate_id IN (
      SELECT id FROM "public"."financbase_business_associates" 
      WHERE organization_id = get_active_organization_id()
    )
  );

-- Migration complete
COMMENT ON FUNCTION get_active_organization_id() IS 'Returns the active organization ID from session variable app.current_org_id';

