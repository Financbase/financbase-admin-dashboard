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

// Incident Severity Enum
export const incidentSeverityEnum = pgEnum('incident_severity', [
  'low',
  'medium',
  'high',
  'critical'
]);

// Incident Status Enum
export const incidentStatusEnum = pgEnum('incident_status', [
  'detected',
  'analyzing',
  'contained',
  'eradicated',
  'recovered',
  'post_incident_review',
  'closed'
]);

// Incident Type Enum
export const incidentTypeEnum = pgEnum('incident_type', [
  'security_breach',
  'data_breach',
  'malware',
  'phishing',
  'ddos',
  'unauthorized_access',
  'system_outage',
  'data_loss',
  'service_degradation',
  'compliance_violation',
  'other'
]);

// IR Team Role Enum
export const irTeamRoleEnum = pgEnum('ir_team_role', [
  'incident_commander',
  'technical_lead',
  'communications_lead',
  'legal_lead',
  'executive_sponsor',
  'team_member',
  'observer'
]);

// Drill Type Enum
export const drillTypeEnum = pgEnum('drill_type', [
  'tabletop',
  'walkthrough',
  'simulation',
  'full_scale',
  'red_team',
  'blue_team'
]);

// Drill Status Enum
export const drillStatusEnum = pgEnum('drill_status', [
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
  'post_review'
]);

// Incident Response Incidents Table
export const incidentResponseIncidents = pgTable('financbase_security_incidents', {
  id: serial('id').primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  incidentNumber: text('incident_number').notNull().unique(), // IR-YYYY-MMDD-XXX format
  reportedBy: uuid('reported_by').references(() => users.id, { onDelete: 'set null' }),
  assignedTo: uuid('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  
  // Incident classification
  incidentType: incidentTypeEnum('incident_type').notNull(),
  severity: incidentSeverityEnum('severity').notNull(),
  status: incidentStatusEnum('status').default('detected').notNull(),
  
  // Incident details
  title: text('title').notNull(),
  description: text('description').notNull(),
  
  // Timeline
  detectedAt: timestamp('detected_at').notNull(),
  analyzedAt: timestamp('analyzed_at'),
  containedAt: timestamp('contained_at'),
  eradicatedAt: timestamp('eradicated_at'),
  recoveredAt: timestamp('recovered_at'),
  closedAt: timestamp('closed_at'),
  
  // Impact assessment
  affectedSystems: jsonb('affected_systems').default([]).notNull(),
  affectedServices: jsonb('affected_services').default([]).notNull(),
  affectedUsers: integer('affected_users'),
  dataAffected: boolean('data_affected').default(false).notNull(),
  dataTypesAffected: jsonb('data_types_affected').default([]).notNull(),
  financialImpact: jsonb('financial_impact'), // { amount, currency, description }
  businessImpact: text('business_impact'),
  
  // Response actions
  containmentActions: jsonb('containment_actions').default([]).notNull(),
  eradicationActions: jsonb('eradication_actions').default([]).notNull(),
  recoveryActions: jsonb('recovery_actions').default([]).notNull(),
  lessonsLearned: text('lessons_learned'),
  
  // Communication
  internalNotifications: jsonb('internal_notifications').default([]).notNull(),
  externalNotifications: jsonb('external_notifications').default([]).notNull(),
  communicationLog: jsonb('communication_log').default([]).notNull(),
  
  // Evidence and forensics
  rootCause: text('root_cause'),
  contributingFactors: jsonb('contributing_factors').default([]).notNull(),
  remediationPlan: jsonb('remediation_plan'),
  followUpActions: jsonb('follow_up_actions').default([]).notNull(),
  
  // Metadata
  tags: jsonb('tags').default([]).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// IR Team Members Table
export const irTeamMembers = pgTable('financbase_ir_team_members', {
  id: serial('id').primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: irTeamRoleEnum('role').notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
  contactInfo: jsonb('contact_info').default({}).notNull(), // { phone, email, slack, etc }
  availability: jsonb('availability').default({}).notNull(), // { days: [], hours: {}, timezone }
  certifications: jsonb('certifications').default([]).notNull(), // Array of certs
  experience: text('experience'),
  isActive: boolean('is_active').default(true).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// IR Runbooks Table
export const irRunbooks = pgTable('financbase_ir_runbooks', {
  id: serial('id').primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  
  // Runbook details
  approvedBy: uuid('approved_by').references(() => users.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  incidentType: incidentTypeEnum('incident_type').notNull(),
  severity: incidentSeverityEnum('severity').notNull(),
  status: text('status').default('draft').notNull(), // 'draft', 'review', 'approved', 'active', 'archived'
  version: integer('version').default(1).notNull(),
  procedures: jsonb('procedures').notNull(),
  checklists: jsonb('checklists').default([]).notNull(),
  escalationPaths: jsonb('escalation_paths').default([]).notNull(),
  communicationTemplates: jsonb('communication_templates').default([]).notNull(),
  toolsAndResources: jsonb('tools_and_resources').default([]).notNull(),
  lastExecutedAt: timestamp('last_executed_at'),
  executionCount: integer('execution_count').default(0).notNull(),
  successRate: integer('success_rate'),
  lastReviewedAt: timestamp('last_reviewed_at'),
  nextReviewDate: timestamp('next_review_date'),
  reviewFrequency: integer('review_frequency').default(90).notNull(),
  tags: jsonb('tags').default([]).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// IR Drills/Exercises Table
export const irDrills = pgTable('financbase_ir_drills', {
  id: serial('id').primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  scheduledBy: uuid('scheduled_by').references(() => users.id, { onDelete: 'set null' }),
  conductedBy: uuid('conducted_by').references(() => users.id, { onDelete: 'set null' }),
  
  // Drill details
  drillName: text('drill_name').notNull(),
  drillType: drillTypeEnum('drill_type').notNull(),
  status: drillStatusEnum('status').default('scheduled').notNull(),
  scenario: text('scenario').notNull(),
  objectives: jsonb('objectives').default([]).notNull(),
  
  // Schedule
  scheduledDate: timestamp('scheduled_date').notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  completedDate: timestamp('completed_date'),
  
  // Participants
  participants: jsonb('participants').default([]).notNull(), // Array of user IDs
  observers: jsonb('observers').default([]).notNull(),
  
  // Results
  results: jsonb('results'),
  findings: jsonb('findings').default([]).notNull(),
  strengths: jsonb('strengths').default([]).notNull(),
  weaknesses: jsonb('weaknesses').default([]).notNull(),
  recommendations: jsonb('recommendations').default([]).notNull(),
  actionItems: jsonb('action_items').default([]).notNull(),
  
  // Metrics
  responseTime: integer('response_time'), // in minutes
  containmentTime: integer('containment_time'), // in minutes
  recoveryTime: integer('recovery_time'), // in minutes
  score: integer('score'), // Overall drill score (0-100)
  
  // Documentation
  reportUrl: text('report_url'),
  lessonsLearned: text('lessons_learned'),
  
  // Metadata
  tags: jsonb('tags').default([]).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// IR Procedures Table (General IR procedures and policies)
export const irProcedures = pgTable('financbase_ir_procedures', {
  id: serial('id').primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  approvedBy: uuid('approved_by').references(() => users.id, { onDelete: 'set null' }),
  
  // Procedure details
  title: text('title').notNull(),
  procedureType: text('procedure_type').notNull(), // 'policy', 'procedure', 'guideline', 'template'
  category: text('category').notNull(), // 'detection', 'response', 'recovery', 'communication', 'reporting'
  content: text('content').notNull(), // Full procedure content
  
  // Approval
  version: text('version').default('1.0').notNull(),
  approvalStatus: text('approval_status').default('draft').notNull(), // 'draft', 'review', 'approved', 'archived'
  approvedAt: timestamp('approved_at'),
  
  // Review cycle
  lastReviewed: timestamp('last_reviewed'),
  nextReview: timestamp('next_review'),
  reviewFrequency: text('review_frequency'), // 'monthly', 'quarterly', 'annually'
  
  // Applicability
  appliesTo: jsonb('applies_to').default([]).notNull(), // Roles, departments, etc.
  relatedRunbooks: jsonb('related_runbooks').default([]).notNull(),
  
  // Metadata
  tags: jsonb('tags').default([]).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const incidentResponseIncidentsRelations = relations(incidentResponseIncidents, ({ one }) => ({
  organization: one(organizations, { fields: [incidentResponseIncidents.organizationId], references: [organizations.id] }),
  reporter: one(users, { fields: [incidentResponseIncidents.reportedBy], references: [users.id] }),
  assignee: one(users, { fields: [incidentResponseIncidents.assignedTo], references: [users.id] }),
}));

export const irTeamMembersRelations = relations(irTeamMembers, ({ one }) => ({
  organization: one(organizations, { fields: [irTeamMembers.organizationId], references: [organizations.id] }),
  user: one(users, { fields: [irTeamMembers.userId], references: [users.id] }),
}));

export const irRunbooksRelations = relations(irRunbooks, ({ one }) => ({
  organization: one(organizations, { fields: [irRunbooks.organizationId], references: [organizations.id] }),
  creator: one(users, { fields: [irRunbooks.createdBy], references: [users.id] }),
}));

export const irDrillsRelations = relations(irDrills, ({ one }) => ({
  organization: one(organizations, { fields: [irDrills.organizationId], references: [organizations.id] }),
  scheduler: one(users, { fields: [irDrills.scheduledBy], references: [users.id] }),
  conductor: one(users, { fields: [irDrills.conductedBy], references: [users.id] }),
}));

export const irProceduresRelations = relations(irProcedures, ({ one }) => ({
  organization: one(organizations, { fields: [irProcedures.organizationId], references: [organizations.id] }),
  creator: one(users, { fields: [irProcedures.createdBy], references: [users.id] }),
  approver: one(users, { fields: [irProcedures.approvedBy], references: [users.id] }),
}));

// IR Communication Templates Table
export const irCommunicationTemplates = pgTable('financbase_ir_communication_templates', {
  id: serial('id').primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  templateType: text('template_type').notNull(),
  subject: text('subject'),
  body: text('body').notNull(),
  placeholders: jsonb('placeholders').default([]).notNull(),
  incidentType: incidentTypeEnum('incident_type'),
  severity: incidentSeverityEnum('severity'),
  audience: text('audience').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  usageCount: integer('usage_count').default(0).notNull(),
  tags: jsonb('tags').default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const irCommunicationTemplatesRelations = relations(irCommunicationTemplates, ({ one }) => ({
  organization: one(organizations, { fields: [irCommunicationTemplates.organizationId], references: [organizations.id] }),
  creator: one(users, { fields: [irCommunicationTemplates.createdBy], references: [users.id] }),
}));
