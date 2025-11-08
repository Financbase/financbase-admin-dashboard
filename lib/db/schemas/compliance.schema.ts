/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { pgTable, serial, text, timestamp, boolean, jsonb, integer, pgEnum, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { organizations } from './organizations.schema';

// DORA Incident Severity Enum
export const doraIncidentSeverityEnum = pgEnum('dora_incident_severity', [
  'low',
  'medium',
  'high',
  'critical'
]);

// DORA Incident Status Enum
export const doraIncidentStatusEnum = pgEnum('dora_incident_status', [
  'detected',
  'investigating',
  'contained',
  'resolved',
  'closed'
]);

// DORA Resilience Test Type Enum
export const doraTestTypeEnum = pgEnum('dora_test_type', [
  'vulnerability_assessment',
  'penetration_test',
  'load_test',
  'disaster_recovery',
  'business_continuity',
  'threat_led_penetration_test'
]);

// DORA Resilience Test Status Enum
export const doraTestStatusEnum = pgEnum('dora_test_status', [
  'scheduled',
  'in_progress',
  'completed',
  'failed',
  'cancelled'
]);

// Third Party Risk Level Enum
export const thirdPartyRiskLevelEnum = pgEnum('third_party_risk_level', [
  'low',
  'medium',
  'high',
  'critical'
]);

// AI Model Decision Type Enum
export const aiDecisionTypeEnum = pgEnum('ai_decision_type', [
  'financial_analysis',
  'risk_assessment',
  'fraud_detection',
  'recommendation',
  'classification',
  'prediction',
  'other'
]);

// Data Classification Level Enum
export const dataClassificationLevelEnum = pgEnum('data_classification_level', [
  'public',
  'internal',
  'confidential',
  'restricted',
  'highly_restricted'
]);

// State Privacy Law Enum
export const statePrivacyLawEnum = pgEnum('state_privacy_law', [
  'cpra', // California Privacy Rights Act
  'ccpa', // California Consumer Privacy Act
  'vcdpa', // Virginia Consumer Data Protection Act
  'ctdpa', // Connecticut Data Privacy Act
  'cdpa', // Colorado Privacy Act
  'ucpa', // Utah Consumer Privacy Act
  'tdpa', // Texas Data Privacy Act
  'mcdpa', // Montana Consumer Data Privacy Act
  'idpa', // Iowa Data Privacy Act
  'tdpa_tennessee', // Tennessee Data Privacy Act
  'odpa' // Oregon Data Privacy Act
]);

// DORA Incident Reports Table
export const doraIncidentReports = pgTable('financbase_dora_incident_reports', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  reportedBy: text('reported_by').references(() => users.id, { onDelete: 'set null' }),
  
  // Incident details
  incidentTitle: text('incident_title').notNull(),
  incidentDescription: text('incident_description').notNull(),
  incidentType: text('incident_type').notNull(), // 'data_breach', 'system_outage', 'cyber_attack', 'service_degradation', 'other'
  severity: doraIncidentSeverityEnum('severity').notNull(),
  status: doraIncidentStatusEnum('status').default('detected').notNull(),
  
  // ICT system information
  affectedSystems: jsonb('affected_systems').default([]).notNull(), // Array of system identifiers
  affectedServices: jsonb('affected_services').default([]).notNull(), // Array of service names
  impactScope: text('impact_scope'), // 'internal', 'external', 'both'
  
  // Timeline
  detectedAt: timestamp('detected_at').notNull(),
  containedAt: timestamp('contained_at'),
  resolvedAt: timestamp('resolved_at'),
  closedAt: timestamp('closed_at'),
  
  // Impact assessment
  impactDescription: text('impact_description'),
  affectedUsers: integer('affected_users'),
  dataAffected: boolean('data_affected').default(false).notNull(),
  financialImpact: jsonb('financial_impact'), // { amount, currency, description }
  
  // Response actions
  responseActions: jsonb('response_actions').default([]).notNull(), // Array of actions taken
  remediationSteps: jsonb('remediation_steps').default([]).notNull(),
  
  // Reporting
  reportedToAuthorities: boolean('reported_to_authorities').default(false).notNull(),
  authorityReportDetails: jsonb('authority_report_details'),
  internalReportUrl: text('internal_report_url'),
  
  // Metadata
  tags: jsonb('tags').default([]).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// DORA Resilience Tests Table
export const doraResilienceTests = pgTable('financbase_dora_resilience_tests', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  scheduledBy: text('scheduled_by').references(() => users.id, { onDelete: 'set null' }),
  executedBy: text('executed_by').references(() => users.id, { onDelete: 'set null' }),
  
  // Test details
  testName: text('test_name').notNull(),
  testDescription: text('test_description'),
  testType: doraTestTypeEnum('test_type').notNull(),
  status: doraTestStatusEnum('status').default('scheduled').notNull(),
  
  // Scope
  testScope: jsonb('test_scope').default({}).notNull(), // { systems: [], services: [], components: [] }
  criticalFunctions: jsonb('critical_functions').default([]).notNull(), // Array of critical functions tested
  
  // Schedule
  scheduledDate: timestamp('scheduled_date').notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  completedDate: timestamp('completed_date'),
  
  // Results
  testResults: jsonb('test_results'), // Detailed test results
  vulnerabilitiesFound: integer('vulnerabilities_found').default(0).notNull(),
  vulnerabilitiesCritical: integer('vulnerabilities_critical').default(0).notNull(),
  vulnerabilitiesHigh: integer('vulnerabilities_high').default(0).notNull(),
  vulnerabilitiesMedium: integer('vulnerabilities_medium').default(0).notNull(),
  vulnerabilitiesLow: integer('vulnerabilities_low').default(0).notNull(),
  
  // Findings
  findings: jsonb('findings').default([]).notNull(), // Array of findings
  recommendations: jsonb('recommendations').default([]).notNull(), // Array of recommendations
  remediationPlan: jsonb('remediation_plan'),
  
  // Reporting
  reportUrl: text('report_url'),
  reportGeneratedAt: timestamp('report_generated_at'),
  
  // Metadata
  tags: jsonb('tags').default([]).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// DORA Third Party Risks Table
export const doraThirdPartyRisks = pgTable('financbase_dora_third_party_risks', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  assessedBy: text('assessed_by').references(() => users.id, { onDelete: 'set null' }),
  
  // Third party information
  providerName: text('provider_name').notNull(),
  providerType: text('provider_type').notNull(), // 'cloud_service', 'saas', 'infrastructure', 'payment_processor', 'other'
  providerContact: jsonb('provider_contact'), // { email, phone, address }
  contractId: text('contract_id'),
  contractStartDate: timestamp('contract_start_date'),
  contractEndDate: timestamp('contract_end_date'),
  
  // Services provided
  servicesProvided: jsonb('services_provided').default([]).notNull(), // Array of services
  criticalServices: jsonb('critical_services').default([]).notNull(), // Array of critical services
  
  // Risk assessment
  riskLevel: thirdPartyRiskLevelEnum('risk_level').notNull(),
  riskScore: integer('risk_score'), // 0-100
  riskFactors: jsonb('risk_factors').default([]).notNull(), // Array of risk factors
  riskDescription: text('risk_description'),
  
  // Compliance
  complianceCertifications: jsonb('compliance_certifications').default([]).notNull(), // ['SOC2', 'ISO27001', etc.]
  dataProcessingAgreement: boolean('data_processing_agreement').default(false).notNull(),
  securityAssessmentCompleted: boolean('security_assessment_completed').default(false).notNull(),
  lastSecurityAssessment: timestamp('last_security_assessment'),
  
  // Operational resilience
  businessContinuityPlan: boolean('business_continuity_plan').default(false).notNull(),
  disasterRecoveryPlan: boolean('disaster_recovery_plan').default(false).notNull(),
  incidentResponsePlan: boolean('incident_response_plan').default(false).notNull(),
  
  // Monitoring
  monitoringEnabled: boolean('monitoring_enabled').default(false).notNull(),
  monitoringFrequency: text('monitoring_frequency'), // 'daily', 'weekly', 'monthly', 'quarterly'
  lastReviewDate: timestamp('last_review_date'),
  nextReviewDate: timestamp('next_review_date'),
  
  // Status
  isActive: boolean('is_active').default(true).notNull(),
  status: text('status').default('active').notNull(), // 'active', 'under_review', 'suspended', 'terminated'
  
  // Metadata
  notes: text('notes'),
  tags: jsonb('tags').default([]).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// AI Model Decisions Table
export const aiModelDecisions = pgTable('financbase_ai_model_decisions', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  
  // Model information
  modelName: text('model_name').notNull(),
  modelVersion: text('model_version'),
  modelProvider: text('model_provider'), // 'openai', 'anthropic', 'google', 'custom', etc.
  decisionType: aiDecisionTypeEnum('decision_type').notNull(),
  
  // Decision details
  decisionId: uuid('decision_id').defaultRandom().notNull(), // Unique identifier for this decision
  decisionDescription: text('decision_description').notNull(),
  inputData: jsonb('input_data').default({}).notNull(), // Sanitized input data
  outputData: jsonb('output_data').default({}).notNull(), // Model output
  decisionConfidence: integer('decision_confidence'), // 0-100
  
  // Context
  useCase: text('use_case'), // 'financial_analysis', 'fraud_detection', etc.
  context: jsonb('context').default({}).notNull(), // Additional context
  sessionId: text('session_id'),
  requestId: text('request_id'),
  
  // Explainability
  explanation: text('explanation'), // Human-readable explanation
  explanationData: jsonb('explanation_data'), // Structured explanation data
  featureImportance: jsonb('feature_importance'), // Feature importance scores
  
  // Bias and fairness
  biasCheckPerformed: boolean('bias_check_performed').default(false).notNull(),
  biasCheckResults: jsonb('bias_check_results'),
  fairnessScore: integer('fairness_score'), // 0-100
  
  // Performance
  processingTime: integer('processing_time'), // milliseconds
  tokensUsed: integer('tokens_used'),
  cost: jsonb('cost'), // { amount, currency }
  
  // Compliance
  gdprRelevant: boolean('gdpr_relevant').default(false).notNull(),
  containsPersonalData: boolean('contains_personal_data').default(false).notNull(),
  dataRetentionPolicy: text('data_retention_policy'),
  
  // Metadata
  tags: jsonb('tags').default([]).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// AI Model Bias Checks Table
export const aiModelBiasChecks = pgTable('financbase_ai_model_bias_checks', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  modelDecisionId: integer('model_decision_id').references(() => aiModelDecisions.id, { onDelete: 'cascade' }),
  performedBy: text('performed_by').references(() => users.id, { onDelete: 'set null' }),
  
  // Check details
  checkType: text('check_type').notNull(), // 'statistical_parity', 'equalized_odds', 'demographic_parity', 'custom'
  checkDescription: text('check_description'),
  
  // Test data
  testDataset: jsonb('test_dataset'), // Reference to test dataset used
  protectedAttributes: jsonb('protected_attributes').default([]).notNull(), // ['gender', 'race', 'age', etc.]
  
  // Results
  biasDetected: boolean('bias_detected').default(false).notNull(),
  biasScore: integer('bias_score'), // 0-100, higher = more bias
  biasMetrics: jsonb('bias_metrics').default({}).notNull(), // Detailed bias metrics
  fairnessScore: integer('fairness_score'), // 0-100, higher = more fair
  
  // Detailed analysis
  groupComparisons: jsonb('group_comparisons').default([]).notNull(), // Comparison across protected groups
  statisticalSignificance: jsonb('statistical_significance'),
  
  // Recommendations
  recommendations: jsonb('recommendations').default([]).notNull(), // Recommendations to mitigate bias
  
  // Status
  status: text('status').default('completed').notNull(), // 'pending', 'in_progress', 'completed', 'failed'
  
  // Metadata
  notes: text('notes'),
  tags: jsonb('tags').default([]).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// Data Classifications Table
export const dataClassifications = pgTable('financbase_data_classifications', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  classifiedBy: text('classified_by').references(() => users.id, { onDelete: 'set null' }),
  
  // Data information
  dataType: text('data_type').notNull(), // 'customer_data', 'financial_data', 'employee_data', etc.
  dataCategory: text('data_category').notNull(), // 'pii', 'phi', 'financial', 'business', 'public'
  classificationLevel: dataClassificationLevelEnum('classification_level').notNull(),
  
  // Data location
  dataLocation: text('data_location'), // Database table, file path, API endpoint, etc.
  dataSource: text('data_source'), // System or service where data resides
  dataFormat: text('data_format'), // 'structured', 'unstructured', 'semi_structured'
  
  // PII detection
  containsPII: boolean('contains_pii').default(false).notNull(),
  piiTypes: jsonb('pii_types').default([]).notNull(), // ['email', 'ssn', 'credit_card', 'address', etc.]
  piiFields: jsonb('pii_fields').default([]).notNull(), // Array of field names containing PII
  
  // Sensitivity
  sensitivityScore: integer('sensitivity_score'), // 0-100
  sensitivityFactors: jsonb('sensitivity_factors').default([]).notNull(), // Factors affecting sensitivity
  
  // Retention
  retentionPolicy: text('retention_policy'),
  retentionPeriod: integer('retention_period'), // Days
  retentionUnit: text('retention_unit'), // 'days', 'months', 'years'
  autoDelete: boolean('auto_delete').default(false).notNull(),
  deleteAfter: timestamp('delete_after'),
  
  // Compliance
  complianceFrameworks: jsonb('compliance_frameworks').default([]).notNull(), // ['GDPR', 'CCPA', 'HIPAA', etc.]
  legalBasis: text('legal_basis'),
  requiresEncryption: boolean('requires_encryption').default(false).notNull(),
  requiresAccessControl: boolean('requires_access_control').default(true).notNull(),
  
  // Classification method
  classificationMethod: text('classification_method').notNull(), // 'automated', 'manual', 'hybrid'
  classificationConfidence: integer('classification_confidence'), // 0-100
  
  // Status
  isActive: boolean('is_active').default(true).notNull(),
  lastReviewed: timestamp('last_reviewed'),
  nextReview: timestamp('next_review'),
  
  // Metadata
  description: text('description'),
  tags: jsonb('tags').default([]).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// State Privacy Compliance Table
export const statePrivacyCompliance = pgTable('financbase_state_privacy_compliance', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  managedBy: text('managed_by').references(() => users.id, { onDelete: 'set null' }),
  
  // State law information
  stateLaw: statePrivacyLawEnum('state_law').notNull(),
  stateCode: text('state_code').notNull(), // 'CA', 'VA', 'CT', etc.
  
  // Compliance status
  isCompliant: boolean('is_compliant').default(false).notNull(),
  complianceScore: integer('compliance_score'), // 0-100
  lastAssessment: timestamp('last_assessment'),
  nextAssessment: timestamp('next_assessment'),
  
  // Requirements
  requirements: jsonb('requirements').default([]).notNull(), // Array of requirements
  requirementsMet: jsonb('requirements_met').default([]).notNull(), // Array of met requirements
  requirementsPending: jsonb('requirements_pending').default([]).notNull(), // Array of pending requirements
  
  // Data subject rights
  supportsDataSubjectRights: boolean('supports_data_subject_rights').default(false).notNull(),
  dataSubjectRights: jsonb('data_subject_rights').default([]).notNull(), // ['access', 'deletion', 'portability', etc.]
  
  // Consent management
  consentManagementEnabled: boolean('consent_management_enabled').default(false).notNull(),
  consentTrackingEnabled: boolean('consent_tracking_enabled').default(false).notNull(),
  
  // Data processing
  dataProcessingAgreements: jsonb('data_processing_agreements').default([]).notNull(),
  dataSharingAgreements: jsonb('data_sharing_agreements').default([]).notNull(),
  
  // Privacy policy
  privacyPolicyUrl: text('privacy_policy_url'),
  privacyPolicyLastUpdated: timestamp('privacy_policy_last_updated'),
  privacyPolicyCompliant: boolean('privacy_policy_compliant').default(false).notNull(),
  
  // Breach notification
  breachNotificationProcess: boolean('breach_notification_process').default(false).notNull(),
  breachNotificationTimeline: integer('breach_notification_timeline'), // Hours
  
  // Audit and reporting
  auditLoggingEnabled: boolean('audit_logging_enabled').default(true).notNull(),
  reportingEnabled: boolean('reporting_enabled').default(true).notNull(),
  lastReportGenerated: timestamp('last_report_generated'),
  
  // Findings and actions
  findings: jsonb('findings').default([]).notNull(), // Compliance findings
  actionItems: jsonb('action_items').default([]).notNull(), // Action items for compliance
  remediationPlan: jsonb('remediation_plan'),
  
  // Status
  status: text('status').default('active').notNull(), // 'active', 'under_review', 'non_compliant', 'compliant'
  
  // Metadata
  notes: text('notes'),
  tags: jsonb('tags').default([]).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const doraIncidentReportsRelations = relations(doraIncidentReports, ({ one }) => ({
  organization: one(organizations, {
    fields: [doraIncidentReports.organizationId],
    references: [organizations.id],
  }),
  reporter: one(users, {
    fields: [doraIncidentReports.reportedBy],
    references: [users.id],
  }),
}));

export const doraResilienceTestsRelations = relations(doraResilienceTests, ({ one }) => ({
  organization: one(organizations, {
    fields: [doraResilienceTests.organizationId],
    references: [organizations.id],
  }),
  scheduler: one(users, {
    fields: [doraResilienceTests.scheduledBy],
    references: [users.id],
  }),
  executor: one(users, {
    fields: [doraResilienceTests.executedBy],
    references: [users.id],
  }),
}));

export const doraThirdPartyRisksRelations = relations(doraThirdPartyRisks, ({ one }) => ({
  organization: one(organizations, {
    fields: [doraThirdPartyRisks.organizationId],
    references: [organizations.id],
  }),
  assessor: one(users, {
    fields: [doraThirdPartyRisks.assessedBy],
    references: [users.id],
  }),
}));

export const aiModelDecisionsRelations = relations(aiModelDecisions, ({ one }) => ({
  organization: one(organizations, {
    fields: [aiModelDecisions.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [aiModelDecisions.userId],
    references: [users.id],
  }),
}));

export const aiModelBiasChecksRelations = relations(aiModelBiasChecks, ({ one }) => ({
  organization: one(organizations, {
    fields: [aiModelBiasChecks.organizationId],
    references: [organizations.id],
  }),
  modelDecision: one(aiModelDecisions, {
    fields: [aiModelBiasChecks.modelDecisionId],
    references: [aiModelDecisions.id],
  }),
  performer: one(users, {
    fields: [aiModelBiasChecks.performedBy],
    references: [users.id],
  }),
}));

export const dataClassificationsRelations = relations(dataClassifications, ({ one }) => ({
  organization: one(organizations, {
    fields: [dataClassifications.organizationId],
    references: [organizations.id],
  }),
  classifier: one(users, {
    fields: [dataClassifications.classifiedBy],
    references: [users.id],
  }),
}));

export const statePrivacyComplianceRelations = relations(statePrivacyCompliance, ({ one }) => ({
  organization: one(organizations, {
    fields: [statePrivacyCompliance.organizationId],
    references: [organizations.id],
  }),
  manager: one(users, {
    fields: [statePrivacyCompliance.managedBy],
    references: [users.id],
  }),
}));

