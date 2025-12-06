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
import { organizations } from './organizations.schema';
import { users } from './users.schema';

// Policy Status Enum
export const policyStatusEnum = pgEnum('policy_status', [
  'draft',
  'review',
  'approval',
  'published',
  'archived',
  'superseded'
]);

// Policy Type Enum (ISO 27001 required policies)
export const policyTypeEnum = pgEnum('policy_type', [
  'information_security',
  'access_control',
  'data_classification',
  'incident_management',
  'business_continuity',
  'change_management',
  'vendor_management',
  'acceptable_use',
  'backup_recovery',
  'network_security',
  'encryption',
  'password',
  'remote_access',
  'pci_dss_information_security',
  'pci_dss_cardholder_data_protection',
  'pci_dss_network_security',
  'pci_dss_access_control',
  'other'
]);

// Policy Documents Table - using explicit type to break circular reference
const policyDocumentsTable = pgTable('financbase_policy_documents', {
  id: serial('id').primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  approvedBy: uuid('approved_by').references(() => users.id, { onDelete: 'set null' }),
  
  // Policy identification
  policyNumber: text('policy_number').notNull().unique(), // e.g., POL-2025-001
  title: text('title').notNull(),
  policyType: policyTypeEnum('policy_type').notNull(),
  description: text('description'),
  
  // Content
  content: text('content').notNull(), // Full policy document content
  summary: text('summary'), // Executive summary
  version: integer('version').default(1).notNull(),
  status: policyStatusEnum('status').default('draft').notNull(),
  
  // Approval workflow
  currentApprover: uuid('current_approver').references(() => users.id, { onDelete: 'set null' }),
  approvalHistory: jsonb('approval_history').default([]).notNull(), // Array of approval steps
  reviewHistory: jsonb('review_history').default([]).notNull(), // Array of review records
  
  // Assignment and acknowledgment
  requiresAcknowledgment: boolean('requires_acknowledgment').default(false).notNull(),
  acknowledgmentDeadline: timestamp('acknowledgment_deadline', { withTimezone: true }),
  
  // Review schedule
  lastReviewedAt: timestamp('last_reviewed_at', { withTimezone: true }),
  nextReviewDate: timestamp('next_review_date', { withTimezone: true }),
  reviewFrequency: integer('review_frequency').default(365).notNull(), // Days (annual default)
  reviewRequired: boolean('review_required').default(true).notNull(),
  
	// Related policies
	supersedesPolicyId: integer('supersedes_policy_id').references(() => policyDocumentsTable, { onDelete: 'set null' }),
  relatedPolicies: jsonb('related_policies').default([]).notNull(), // Array of related policy IDs
  
  // Compliance
  complianceFrameworks: jsonb('compliance_frameworks').default([]).notNull(), // ['ISO27001', 'SOC2', 'HIPAA', 'PCI']
  requirements: jsonb('requirements').default([]).notNull(), // Array of compliance requirements addressed
  
  // Metadata
  tags: jsonb('tags').default([]).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
});

// Policy Versions Table (version history)
export const policyVersions = pgTable('financbase_policy_versions', {
  id: serial('id').primaryKey(),
  policyId: integer('policy_id').references(() => policyDocuments.id, { onDelete: 'cascade' }).notNull(),
  version: integer('version').notNull(),
  
  // Version content
  content: text('content').notNull(),
  summary: text('summary'),
  changelog: text('changelog'), // What changed in this version
  
  // Version metadata
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  isCurrent: boolean('is_current').default(false).notNull(),
  
  // Metadata
  metadata: jsonb('metadata').default({}).notNull(),
});

// Policy Assignments Table (who must read/acknowledge)
export const policyAssignments = pgTable('financbase_policy_assignments', {
  id: serial('id').primaryKey(),
  policyId: integer('policy_id').references(() => policyDocuments.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  roleId: text('role_id'), // If assigned to a role instead of user
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  
  // Assignment details
  assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
  assignedBy: uuid('assigned_by').references(() => users.id, { onDelete: 'set null' }),
  requiresAcknowledgment: boolean('requires_acknowledgment').default(false).notNull(),
  deadline: timestamp('deadline', { withTimezone: true }),
  
  // Acknowledgment
  acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true }),
  acknowledgmentIp: text('acknowledgment_ip'),
  acknowledgmentUserAgent: text('acknowledgment_user_agent'),
  
  // Status
  status: text('status').default('assigned').notNull(), // 'assigned', 'acknowledged', 'overdue', 'exempted'
  
  // Metadata
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Policy Approval Workflow Table
export const policyApprovalWorkflows = pgTable('financbase_policy_approval_workflows', {
  id: serial('id').primaryKey(),
  policyId: integer('policy_id').references(() => policyDocuments.id, { onDelete: 'cascade' }).notNull(),
  
  // Workflow definition
  workflowName: text('workflow_name').notNull(),
  steps: jsonb('steps').notNull(), // Array of approval steps
  currentStep: integer('current_step').default(0).notNull(),
  
  // Status
  status: text('status').default('pending').notNull(), // 'pending', 'in_progress', 'approved', 'rejected', 'cancelled'
  
  // Approvers
  approvers: jsonb('approvers').default([]).notNull(), // Array of approver user IDs
  approvals: jsonb('approvals').default([]).notNull(), // Array of approval records
  
  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

// Relations
// Export the table
export const policyDocuments = policyDocumentsTable;

export const policyDocumentsRelations = relations(policyDocuments, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [policyDocuments.organizationId],
    references: [organizations.id],
  }),
  creator: one(users, {
    fields: [policyDocuments.createdBy],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [policyDocuments.approvedBy],
    references: [users.id],
  }),
  supersedes: one(policyDocuments, {
    fields: [policyDocuments.supersedesPolicyId],
    references: [policyDocuments.id],
  }),
  versions: many(policyVersions),
  assignments: many(policyAssignments),
  approvalWorkflows: many(policyApprovalWorkflows),
}));

export const policyVersionsRelations = relations(policyVersions, ({ one }) => ({
  policy: one(policyDocuments, {
    fields: [policyVersions.policyId],
    references: [policyDocuments.id],
  }),
}));

export const policyAssignmentsRelations = relations(policyAssignments, ({ one }) => ({
  policy: one(policyDocuments, {
    fields: [policyAssignments.policyId],
    references: [policyDocuments.id],
  }),
  user: one(users, {
    fields: [policyAssignments.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [policyAssignments.organizationId],
    references: [organizations.id],
  }),
}));

export const policyApprovalWorkflowsRelations = relations(policyApprovalWorkflows, ({ one }) => ({
  policy: one(policyDocuments, {
    fields: [policyApprovalWorkflows.policyId],
    references: [policyDocuments.id],
  }),
}));

