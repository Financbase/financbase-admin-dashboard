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

// BAA Status Enum
export const baaStatusEnum = pgEnum('baa_status', [
  'pending',
  'sent',
  'signed',
  'expired',
  'renewal_due',
  'terminated'
]);

// Vendor Type Enum
export const vendorTypeEnum = pgEnum('vendor_type', [
  'cloud_provider',
  'payment_processor',
  'email_service',
  'backup_service',
  'analytics',
  'support',
  'other'
]);

// Business Associates (Vendors) Table
export const businessAssociates = pgTable('financbase_business_associates', {
  id: serial('id').primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  
  // Vendor details
  vendorName: text('vendor_name').notNull(),
  vendorType: vendorTypeEnum('vendor_type').notNull(),
  contactName: text('contact_name'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  vendorAddress: text('vendor_address'),
  
  // Services
  servicesProvided: jsonb('services_provided').default([]).notNull(), // Array of services
  description: text('description'),
  
  // BAA details
  baaStatus: baaStatusEnum('baa_status').default('pending').notNull(),
  baaDocumentUrl: text('baa_document_url'), // Link to signed BAA document
  baaSignedDate: timestamp('baa_signed_date', { withTimezone: true }),
  baaExpiryDate: timestamp('baa_expiry_date', { withTimezone: true }),
  baaRenewalDate: timestamp('baa_renewal_date', { withTimezone: true }), // When to start renewal process
  
  // Compliance
  hipaaCompliant: boolean('hipaa_compliant').default(false).notNull(),
  complianceCertifications: jsonb('compliance_certifications').default([]).notNull(), // ['SOC2', 'HIPAA', etc.]
  
  // Status
  isActive: boolean('is_active').default(true).notNull(),
  
  // Metadata
  tags: jsonb('tags').default([]).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// BAA Compliance Checklist Table
export const baaComplianceChecklist = pgTable('financbase_baa_compliance_checklist', {
  id: serial('id').primaryKey(),
  businessAssociateId: integer('business_associate_id').references(() => businessAssociates.id, { onDelete: 'cascade' }).notNull(),
  
  // Checklist items
  checklistItems: jsonb('checklist_items').notNull(), // Array of checklist items
  completedItems: jsonb('completed_items').default([]).notNull(), // Array of completed item IDs
  completionPercentage: integer('completion_percentage').default(0).notNull(),
  
  // Review
  lastReviewedAt: timestamp('last_reviewed_at', { withTimezone: true }),
  reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  
  // Metadata
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const businessAssociatesRelations = relations(businessAssociates, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [businessAssociates.organizationId],
    references: [organizations.id],
  }),
  complianceChecklist: one(baaComplianceChecklist),
}));

export const baaComplianceChecklistRelations = relations(baaComplianceChecklist, ({ one }) => ({
  businessAssociate: one(businessAssociates, {
    fields: [baaComplianceChecklist.businessAssociateId],
    references: [businessAssociates.id],
  }),
}));

