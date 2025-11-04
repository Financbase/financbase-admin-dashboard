/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { pgTable, serial, text, timestamp, boolean, jsonb, integer, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { organizations } from './organizations.schema';

// Audit Logs Table - Comprehensive activity logging
export const auditLogs = pgTable('financbase_audit_logs', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  
  // Event details
  eventType: text('event_type').notNull(), // 'login', 'logout', 'create', 'update', 'delete', 'view', 'export', 'import'
  eventCategory: text('event_category').notNull(), // 'authentication', 'data_access', 'system', 'security'
  eventAction: text('event_action').notNull(), // 'user_login', 'invoice_created', 'data_exported'
  eventDescription: text('event_description'),
  
  // Resource information
  resourceType: text('resource_type'), // 'invoice', 'expense', 'client', 'user'
  resourceId: text('resource_id'), // ID of the affected resource
  resourceName: text('resource_name'), // Human-readable name of the resource
  
  // Event metadata
  eventData: jsonb('event_data').default({}).notNull(), // Additional event details
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  sessionId: text('session_id'),
  
  // Security context
  riskLevel: text('risk_level').default('low').notNull(), // 'low', 'medium', 'high', 'critical'
  isSuspicious: boolean('is_suspicious').default(false).notNull(),
  securityFlags: jsonb('security_flags').default([]).notNull(), // Array of security flags
  
  // Location and device
  country: text('country'),
  city: text('city'),
  deviceType: text('device_type'), // 'desktop', 'mobile', 'tablet'
  browser: text('browser'),
  os: text('os'),
  
  // Compliance
  gdprRelevant: boolean('gdpr_relevant').default(false).notNull(),
  dataRetention: text('data_retention'), // Retention policy for this log
  
  // Timestamps
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
  organization: one(organizations, { fields: [auditLogs.organizationId], references: [organizations.id] }),
}));

// Data Access Logs Table - Sensitive data access tracking
export const dataAccessLogs = pgTable('financbase_data_access_logs', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  
  // Data access details
  dataType: text('data_type').notNull(), // 'personal_data', 'financial_data', 'sensitive_data'
  dataCategory: text('data_category').notNull(), // 'invoices', 'expenses', 'clients', 'users'
  dataSubject: text('data_subject'), // ID of the data subject (person whose data was accessed)
  
  // Access details
  accessType: text('access_type').notNull(), // 'view', 'export', 'download', 'modify'
  accessMethod: text('access_method').notNull(), // 'api', 'ui', 'export', 'report'
  dataFields: jsonb('data_fields').default([]).notNull(), // Array of accessed data fields
  
  // Context
  purpose: text('purpose'), // Business purpose for access
  legalBasis: text('legal_basis'), // Legal basis for processing (GDPR)
  retentionPeriod: text('retention_period'), // How long this access should be retained
  
  // Security
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  sessionId: text('session_id'),
  
  // Compliance
  gdprConsent: boolean('gdpr_consent').default(false).notNull(),
  dataMinimization: boolean('data_minimization').default(true).notNull(),
  
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const dataAccessLogsRelations = relations(dataAccessLogs, ({ one }) => ({
  user: one(users, { fields: [dataAccessLogs.userId], references: [users.id] }),
  organization: one(organizations, { fields: [dataAccessLogs.organizationId], references: [organizations.id] }),
}));

// Security Events Table - Security-related events
export const securityEvents = pgTable('financbase_security_events', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  
  // Event details
  eventType: text('event_type').notNull(), // 'failed_login', 'suspicious_activity', 'data_breach', 'unauthorized_access'
  severity: text('severity').notNull(), // 'low', 'medium', 'high', 'critical'
  description: text('description').notNull(),
  
  // Event data
  eventData: jsonb('event_data').default({}).notNull(),
  affectedResources: jsonb('affected_resources').default([]).notNull(),
  
  // Security context
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  location: text('location'),
  deviceFingerprint: text('device_fingerprint'),
  
  // Response
  isResolved: boolean('is_resolved').default(false).notNull(),
  resolutionNotes: text('resolution_notes'),
  resolvedBy: text('resolved_by').references(() => users.id, { onDelete: 'set null' }),
  resolvedAt: timestamp('resolved_at'),
  
  // Notifications
  notificationsSent: jsonb('notifications_sent').default([]).notNull(), // Array of notification channels
  
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const securityEventsRelations = relations(securityEvents, ({ one }) => ({
  user: one(users, { fields: [securityEvents.userId], references: [users.id] }),
  organization: one(organizations, { fields: [securityEvents.organizationId], references: [organizations.id] }),
  resolver: one(users, { fields: [securityEvents.resolvedBy], references: [users.id] }),
}));

// MFA Settings Table - Multi-factor authentication settings
export const mfaSettings = pgTable('financbase_mfa_settings', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // MFA configuration
  isEnabled: boolean('is_enabled').default(false).notNull(),
  mfaType: text('mfa_type').notNull(), // 'totp', 'sms', 'email', 'backup_codes'
  secretKey: text('secret_key'), // Encrypted secret for TOTP
  backupCodes: jsonb('backup_codes').default([]).notNull(), // Array of backup codes
  phoneNumber: text('phone_number'), // For SMS MFA
  
  // Settings
  isRequired: boolean('is_required').default(false).notNull(),
  gracePeriod: integer('grace_period').default(0).notNull(), // Grace period in days
  lastUsed: timestamp('last_used'),
  
  // Security
  failedAttempts: integer('failed_attempts').default(0).notNull(),
  isLocked: boolean('is_locked').default(false).notNull(),
  lockedUntil: timestamp('locked_until'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const mfaSettingsRelations = relations(mfaSettings, ({ one }) => ({
  user: one(users, { fields: [mfaSettings.userId], references: [users.id] }),
}));

// Compliance Reports Table - Compliance reporting
export const complianceReports = pgTable('financbase_compliance_reports', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  
  // Report details
  reportType: text('report_type').notNull(), // 'gdpr', 'soc2', 'iso27001', 'pci_dss'
  reportName: text('report_name').notNull(),
  reportDescription: text('report_description'),
  
  // Report data
  reportData: jsonb('report_data').notNull(),
  reportFilters: jsonb('report_filters').default({}).notNull(),
  
  // Status
  status: text('status').default('draft').notNull(), // 'draft', 'generating', 'completed', 'failed'
  generatedBy: text('generated_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  generatedAt: timestamp('generated_at'),
  
  // File information
  fileUrl: text('file_url'),
  fileSize: integer('file_size'),
  fileFormat: text('file_format'), // 'pdf', 'csv', 'json'
  
  // Retention
  retentionPeriod: text('retention_period'),
  expiresAt: timestamp('expires_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const complianceReportsRelations = relations(complianceReports, ({ one }) => ({
  organization: one(organizations, { fields: [complianceReports.organizationId], references: [organizations.id] }),
  generator: one(users, { fields: [complianceReports.generatedBy], references: [users.id] }),
}));

// Data Retention Policies Table - Data retention rules
export const dataRetentionPolicies = pgTable('financbase_data_retention_policies', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  
  // Policy details
  policyName: text('policy_name').notNull(),
  policyDescription: text('policy_description'),
  
  // Data types
  dataTypes: jsonb('data_types').notNull(), // Array of data types this policy applies to
  dataCategories: jsonb('data_categories').notNull(), // Array of data categories
  
  // Retention rules
  retentionPeriod: integer('retention_period').notNull(), // Retention period in days
  retentionUnit: text('retention_unit').default('days').notNull(), // 'days', 'months', 'years'
  
  // Legal basis
  legalBasis: text('legal_basis').notNull(), // GDPR legal basis
  complianceFramework: text('compliance_framework'), // 'gdpr', 'ccpa', 'sox'
  
  // Actions
  actionOnExpiry: text('action_on_expiry').notNull(), // 'delete', 'anonymize', 'archive'
  notificationPeriod: integer('notification_period').default(30).notNull(), // Days before expiry to notify
  
  // Status
  isActive: boolean('is_active').default(true).notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const dataRetentionPoliciesRelations = relations(dataRetentionPolicies, ({ one }) => ({
  organization: one(organizations, { fields: [dataRetentionPolicies.organizationId], references: [organizations.id] }),
}));

// GDPR Data Requests Table - GDPR data subject requests
export const gdprDataRequests = pgTable('financbase_gdpr_data_requests', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  
  // Request details
  requestType: text('request_type').notNull(), // 'access', 'portability', 'rectification', 'erasure', 'restriction'
  dataSubjectEmail: text('data_subject_email').notNull(),
  dataSubjectName: text('data_subject_name'),
  
  // Request information
  requestDescription: text('request_description'),
  requestedDataTypes: jsonb('requested_data_types').default([]).notNull(),
  
  // Status
  status: text('status').default('pending').notNull(), // 'pending', 'in_progress', 'completed', 'rejected'
  assignedTo: text('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  
  // Processing
  processingNotes: text('processing_notes'),
  responseData: jsonb('response_data').default({}).notNull(),
  responseFileUrl: text('response_file_url'),
  
  // Timestamps
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
  completedAt: timestamp('completed_at'),
  expiresAt: timestamp('expires_at'), // GDPR requires response within 30 days
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const gdprDataRequestsRelations = relations(gdprDataRequests, ({ one }) => ({
  organization: one(organizations, { fields: [gdprDataRequests.organizationId], references: [organizations.id] }),
  assignee: one(users, { fields: [gdprDataRequests.assignedTo], references: [users.id] }),
}));

// Security Policies Table - Security policy configurations
export const securityPolicies = pgTable('financbase_security_policies', {
  id: serial('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  
  // Policy details
  policyName: text('policy_name').notNull(),
  policyType: text('policy_type').notNull(), // 'password', 'session', 'access_control', 'data_protection'
  policyDescription: text('policy_description'),
  
  // Policy configuration
  policyConfig: jsonb('policy_config').notNull(),
  
  // Enforcement
  isEnforced: boolean('is_enforced').default(true).notNull(),
  enforcementLevel: text('enforcement_level').default('strict').notNull(), // 'strict', 'moderate', 'lenient'
  
  // Status
  isActive: boolean('is_active').default(true).notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const securityPoliciesRelations = relations(securityPolicies, ({ one }) => ({
  organization: one(organizations, { fields: [securityPolicies.organizationId], references: [organizations.id] }),
}));
