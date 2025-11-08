/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { pgTable, serial, text, timestamp, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';

export const newsletterStatusEnum = pgEnum('newsletter_status', [
	'subscribed',
	'unsubscribed',
	'bounced',
	'pending',
]);

export const newsletterSubscriptions = pgTable('newsletter_subscriptions', {
	id: serial('id').primaryKey(),
	email: text('email').notNull().unique(),
	status: newsletterStatusEnum('status').notNull().default('subscribed'),
	source: text('source'), // e.g., 'blog', 'homepage', 'api', 'import'
	subscribedAt: timestamp('subscribed_at', { withTimezone: true }).notNull().defaultNow(),
	unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true }),
	unsubscribeToken: text('unsubscribe_token').unique(), // Unique token for unsubscribe links
	metadata: jsonb('metadata').default({}).notNull(), // Additional data like IP, user agent, etc.
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;
export type NewNewsletterSubscription = typeof newsletterSubscriptions.$inferInsert;

