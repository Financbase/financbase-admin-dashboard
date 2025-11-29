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

// Risk Level Enum
export const riskLevelEnum = pgEnum('risk_level', [
  'very_low',
  'low',
  'medium',
  'high',
  'very_high',
  'critical'
]);

// Risk Status Enum
export const riskStatusEnum = pgEnum('risk_status', [
  'identified',
  'assessed',
  'treated',
  'accepted',
  'monitored',
  'closed'
]);

// Risk Treatment Option Enum
export const riskTreatmentEnum = pgEnum('risk_treatment', [
  'avoid',
  'mitigate',
  'transfer',
  'accept'
]);

// Asset Type Enum
export const assetTypeEnum = pgEnum('asset_type', [
  'information',
  'software',
  'hardware',
  'service',
  'personnel',
  'facility',
  'other'
]);

// Assets Table (Asset Inventory)
export const assets = pgTable('financbase_assets', {
  id: serial('id').primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  
  // Asset identification
  assetName: text('asset_name').notNull(),
  assetType: assetTypeEnum('asset_type').notNull(),
  description: text('description'),
  identifier: text('identifier'), // Unique identifier (serial number, etc.)
  
  // Asset details
  owner: uuid('owner').references(() => users.id, { onDelete: 'set null' }), // Asset owner/user
  location: text('location'),
  criticality: text('criticality').default('medium').notNull(), // 'low', 'medium', 'high', 'critical'
  
  // Classification
  dataClassification: text('data_classification'), // 'public', 'internal', 'confidential', 'restricted'
  confidentiality: text('confidentiality').default('medium').notNull(),
  integrity: text('integrity').default('medium').notNull(),
  availability: text('availability').default('medium').notNull(),
  
  // Status
  isActive: boolean('is_active').default(true).notNull(),
  
  // Metadata
  tags: jsonb('tags').default([]).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Risks Table (Risk Register)
export const risks = pgTable('financbase_risks', {
  id: serial('id').primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  identifiedBy: uuid('identified_by').references(() => users.id, { onDelete: 'set null' }),
  owner: uuid('owner').references(() => users.id, { onDelete: 'set null' }),
  
  // Risk identification
  riskNumber: text('risk_number').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  
  // Asset and threat
  assetId: integer('asset_id').references(() => assets.id, { onDelete: 'set null' }),
  threat: text('threat').notNull(),
  vulnerability: text('vulnerability').notNull(),
  
  // Risk assessment
  likelihood: integer('likelihood').notNull(), // 1-5 scale
  impact: integer('impact').notNull(), // 1-5 scale
  riskScore: numeric('risk_score', { precision: 5, scale: 2 }).notNull(), // Calculated: likelihood * impact
  riskLevel: riskLevelEnum('risk_level').notNull(),
  
  // Business impact
  businessImpact: text('business_impact'),
  financialImpact: jsonb('financial_impact'), // { amount, currency, description }
  operationalImpact: text('operational_impact'),
  reputationImpact: text('reputation_impact'),
  
  // Risk treatment
  status: riskStatusEnum('status').default('identified').notNull(),
  treatmentOption: riskTreatmentEnum('treatment_option'),
  treatmentPlan: jsonb('treatment_plan'), // Structured treatment plan
  controls: jsonb('controls').default([]).notNull(), // Array of security controls
  residualRisk: numeric('residual_risk', { precision: 5, scale: 2 }), // Risk after treatment
  residualRiskLevel: riskLevelEnum('residual_risk_level'),
  
  // Acceptance
  acceptedBy: uuid('accepted_by').references(() => users.id, { onDelete: 'set null' }),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  acceptanceJustification: text('acceptance_justification'),
  
  // Monitoring
  lastReviewedAt: timestamp('last_reviewed_at', { withTimezone: true }),
  nextReviewDate: timestamp('next_review_date', { withTimezone: true }),
  reviewFrequency: integer('review_frequency').default(90).notNull(), // Days
  
  // Metadata
  tags: jsonb('tags').default([]).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Risk Treatment Plans Table
export const riskTreatmentPlans = pgTable('financbase_risk_treatment_plans', {
  id: serial('id').primaryKey(),
  riskId: integer('risk_id').references(() => risks.id, { onDelete: 'cascade' }).notNull(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  
  // Treatment plan details
  treatmentOption: riskTreatmentEnum('treatment_option').notNull(),
  description: text('description').notNull(),
  actions: jsonb('actions').notNull(), // Array of action items
  controls: jsonb('controls').default([]).notNull(), // Security controls to implement
  
  // Timeline
  startDate: timestamp('start_date', { withTimezone: true }),
  targetCompletionDate: timestamp('target_completion_date', { withTimezone: true }),
  actualCompletionDate: timestamp('actual_completion_date', { withTimezone: true }),
  
  // Status
  status: text('status').default('planned').notNull(), // 'planned', 'in_progress', 'completed', 'cancelled'
  progress: integer('progress').default(0).notNull(), // 0-100%
  
  // Resources
  responsible: uuid('responsible').references(() => users.id, { onDelete: 'set null' }),
  budget: jsonb('budget'), // { amount, currency, description }
  
  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const assetsRelations = relations(assets, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [assets.organizationId],
    references: [organizations.id],
  }),
  risks: many(risks),
}));

export const risksRelations = relations(risks, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [risks.organizationId],
    references: [organizations.id],
  }),
  asset: one(assets, {
    fields: [risks.assetId],
    references: [assets.id],
  }),
  treatmentPlans: many(riskTreatmentPlans),
}));

export const riskTreatmentPlansRelations = relations(riskTreatmentPlans, ({ one }) => ({
  risk: one(risks, {
    fields: [riskTreatmentPlans.riskId],
    references: [risks.id],
  }),
}));

