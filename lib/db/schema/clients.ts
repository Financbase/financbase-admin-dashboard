/**
 * Database schema for client management
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { pgTable, uuid, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

/**
 * Clients Table
 * Stores client information for invoices and projects
 */
export const clients = pgTable('clients', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id').notNull(),
	
	// Client information
	companyName: text('company_name').notNull(),
	contactName: text('contact_name'),
	email: text('email').notNull(),
	phone: text('phone'),
	address: text('address'),
	city: text('city'),
	state: text('state'),
	zipCode: text('zip_code'),
	country: text('country').default('US'),
	
	// Business details
	taxId: text('tax_id'),
	currency: text('currency').default('USD'),
	paymentTerms: text('payment_terms').default('net30'),
	
	// Status and metadata
	isActive: boolean('is_active').default(true),
	notes: text('notes'),
	metadata: jsonb('metadata'),
	
	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
	
	// Additional fields
	contractorId: uuid('contractor_id'),
});

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
