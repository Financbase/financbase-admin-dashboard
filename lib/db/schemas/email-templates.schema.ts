/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { pgTable, serial, text, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { organizations } from './organizations.schema';

// Email Templates Table
export const emailTemplates = pgTable('financbase_email_templates', {
  id: serial('id').primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  templateId: text('template_id').notNull().unique(), // Unique identifier for the template (e.g., 'welcome', 'password_reset')
  subject: text('subject').notNull(),
  html: text('html').notNull(),
  text: text('text').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  isBuiltIn: boolean('is_built_in').default(false).notNull(), // Whether this is a built-in template that can be overridden
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const emailTemplatesRelations = relations(emailTemplates, ({ one }) => ({
  organization: one(organizations, { fields: [emailTemplates.organizationId], references: [organizations.id] }),
  creator: one(users, { fields: [emailTemplates.createdBy], references: [users.id] }),
}));

