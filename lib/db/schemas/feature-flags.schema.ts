/**
 * Database schema for feature flags
 * System-wide feature flags with rollout and targeting support
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { pgTable, serial, varchar, text, boolean, integer, jsonb, timestamp, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const featureFlags = pgTable('feature_flags', {
	id: serial('id').primaryKey(),
	key: varchar('key', { length: 255 }).unique().notNull(),
	name: text('name').notNull(),
	description: text('description'),
	enabled: boolean('enabled').default(false).notNull(),
	rolloutPercentage: integer('rollout_percentage').default(0).notNull(),
	targetOrganizations: jsonb('target_organizations').$type<string[]>(),
	targetUsers: jsonb('target_users').$type<string[]>(),
	conditions: jsonb('conditions').$type<Record<string, unknown>>(),
	metadata: jsonb('metadata').$type<Record<string, unknown>>(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
	rolloutPercentageCheck: check('rollout_percentage_check', sql`rollout_percentage >= 0 AND rollout_percentage <= 100`),
}));

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type NewFeatureFlag = typeof featureFlags.$inferInsert;

// Types for feature flag conditions
export interface FeatureFlagConditions {
	plan?: string; // e.g., 'enterprise', 'pro', 'starter'
	region?: string; // e.g., 'US', 'EU', 'APAC'
	accountAge?: number; // days
	customAttributes?: Record<string, unknown>;
}
