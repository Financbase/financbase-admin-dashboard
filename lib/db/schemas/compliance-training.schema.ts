/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { pgTable, serial, text, timestamp, boolean, jsonb, integer, pgEnum, numeric, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from './organizations.schema';
import { users } from './users.schema';

// Training Type Enum
export const trainingTypeEnum = pgEnum('training_type', [
  'security_awareness',
  'iso27001_isms',
  'policy_training',
  'role_specific',
  'phishing_simulation',
  'annual_refresher',
  'hipaa',
  'pci_dss',
  'other'
]);

// Training Status Enum
export const trainingStatusEnum = pgEnum('training_status', [
  'not_started',
  'in_progress',
  'completed',
  'failed',
  'expired'
]);

// Training Assignment Type Enum
export const assignmentTypeEnum = pgEnum('assignment_type', [
  'mandatory',
  'optional',
  'role_based',
  'onboarding'
]);

// Security Training Programs Table
export const securityTrainingPrograms = pgTable('financbase_security_training_programs', {
  id: serial('id').primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  
  // Program details
  title: text('title').notNull(),
  description: text('description'),
  trainingType: trainingTypeEnum('training_type').notNull(),
  duration: integer('duration'), // Duration in minutes
  content: text('content'), // Training content/URL
  contentUrl: text('content_url'), // Link to training content
  
  // Requirements
  isMandatory: boolean('is_mandatory').default(false).notNull(),
  passingScore: integer('passing_score').default(80).notNull(), // Percentage
  maxAttempts: integer('max_attempts'), // Maximum attempts allowed
  
  // Schedule
  validFor: integer('valid_for').default(365).notNull(), // Days until expiration
  requiresRefresher: boolean('requires_refresher').default(true).notNull(),
  refresherFrequency: integer('refresher_frequency').default(365).notNull(), // Days
  
  // Status
  isActive: boolean('is_active').default(true).notNull(),
  
  // Metadata
  tags: jsonb('tags').default([]).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Training Assignments Table
export const trainingAssignments = pgTable('financbase_training_assignments', {
  id: serial('id').primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  programId: integer('program_id').references(() => securityTrainingPrograms.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  roleId: text('role_id'), // If assigned to role
  
  // Assignment details
  assignmentType: assignmentTypeEnum('assignment_type').default('mandatory').notNull(),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
  assignedBy: uuid('assigned_by').references(() => users.id, { onDelete: 'set null' }),
  deadline: timestamp('deadline', { withTimezone: true }),
  
  // Progress
  status: trainingStatusEnum('status').default('not_started').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  progress: numeric('progress', { precision: 5, scale: 2 }).default('0'), // 0-100%
  
  // Assessment
  score: numeric('score', { precision: 5, scale: 2 }), // Final score
  attempts: integer('attempts').default(0).notNull(),
  passed: boolean('passed'),
  
  // Metadata
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Training Assessments Table
export const trainingAssessments = pgTable('financbase_training_assessments', {
  id: serial('id').primaryKey(),
  assignmentId: integer('assignment_id').references(() => trainingAssignments.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Assessment details
  questions: jsonb('questions').notNull(), // Array of questions
  answers: jsonb('answers').notNull(), // User's answers
  score: numeric('score', { precision: 5, scale: 2 }).notNull(),
  maxScore: numeric('max_score', { precision: 5, scale: 2 }).notNull(),
  passed: boolean('passed').notNull(),
  
  // Timing
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  duration: integer('duration'), // Duration in seconds
  
  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Training Certificates Table
export const trainingCertificates = pgTable('financbase_training_certificates', {
  id: serial('id').primaryKey(),
  assignmentId: integer('assignment_id').references(() => trainingAssignments.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  programId: integer('program_id').references(() => securityTrainingPrograms.id, { onDelete: 'cascade' }).notNull(),
  
  // Certificate details
  certificateNumber: text('certificate_number').notNull().unique(),
  issuedAt: timestamp('issued_at', { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  score: numeric('score', { precision: 5, scale: 2 }),
  
  // Certificate data
  certificateUrl: text('certificate_url'), // Link to certificate PDF
  certificateData: jsonb('certificate_data').default({}).notNull(), // Certificate metadata
  
  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Phishing Simulation Results Table
export const phishingSimulationResults = pgTable('financbase_phishing_simulation_results', {
  id: serial('id').primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Simulation details
  simulationId: text('simulation_id').notNull(),
  emailSubject: text('email_subject').notNull(),
  clicked: boolean('clicked').default(false).notNull(),
  reported: boolean('reported').default(false).notNull(),
  clickedAt: timestamp('clicked_at', { withTimezone: true }),
  reportedAt: timestamp('reported_at', { withTimezone: true }),
  
  // Results
  result: text('result').notNull(), // 'safe', 'clicked', 'reported', 'clicked_and_reported'
  
  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const securityTrainingProgramsRelations = relations(securityTrainingPrograms, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [securityTrainingPrograms.organizationId],
    references: [organizations.id],
  }),
  assignments: many(trainingAssignments),
  certificates: many(trainingCertificates),
}));

export const trainingAssignmentsRelations = relations(trainingAssignments, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [trainingAssignments.organizationId],
    references: [organizations.id],
  }),
  program: one(securityTrainingPrograms, {
    fields: [trainingAssignments.programId],
    references: [securityTrainingPrograms.id],
  }),
  user: one(users, {
    fields: [trainingAssignments.userId],
    references: [users.id],
  }),
  assessments: many(trainingAssessments),
  certificate: one(trainingCertificates),
}));

export const trainingAssessmentsRelations = relations(trainingAssessments, ({ one }) => ({
  assignment: one(trainingAssignments, {
    fields: [trainingAssessments.assignmentId],
    references: [trainingAssignments.id],
  }),
  user: one(users, {
    fields: [trainingAssessments.userId],
    references: [users.id],
  }),
}));

export const trainingCertificatesRelations = relations(trainingCertificates, ({ one }) => ({
  assignment: one(trainingAssignments, {
    fields: [trainingCertificates.assignmentId],
    references: [trainingAssignments.id],
  }),
  user: one(users, {
    fields: [trainingCertificates.userId],
    references: [users.id],
  }),
  program: one(securityTrainingPrograms, {
    fields: [trainingCertificates.programId],
    references: [securityTrainingPrograms.id],
  }),
}));

export const phishingSimulationResultsRelations = relations(phishingSimulationResults, ({ one }) => ({
  organization: one(organizations, {
    fields: [phishingSimulationResults.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [phishingSimulationResults.userId],
    references: [users.id],
  }),
}));

