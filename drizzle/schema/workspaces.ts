/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { pgTable, serial, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { users } from './cms-user-management';

export const workspaces = pgTable('workspaces', {
	id: serial('id').primaryKey(),
	workspaceId: text('workspace_id').unique().notNull(),
	name: text('name').notNull(),
	slug: text('slug').unique(),
	description: text('description'),
	logo: text('logo'),
	plan: text('plan', { enum: ['free', 'pro', 'team', 'enterprise'] }).default('free').notNull(),
	domain: text('domain'),
	settings: text('settings'), // JSON string for workspace settings
	ownerId: text('owner_id').notNull(),
	status: text('status', { enum: ['active', 'inactive', 'suspended'] }).default('active').notNull(),
	isDefault: boolean('is_default').default(false).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const workspaceMembers = pgTable('workspace_members', {
	id: serial('id').primaryKey(),
	workspaceId: integer('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
	userId: text('user_id').notNull(),
	role: text('role', { enum: ['owner', 'admin', 'member', 'viewer'] }).default('member').notNull(),
	permissions: text('permissions'), // JSON array of permissions
	isActive: boolean('is_active').default(true).notNull(),
	joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

export const workspaceInvitations = pgTable('workspace_invitations', {
	id: serial('id').primaryKey(),
	workspaceId: integer('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
	email: text('email').notNull(),
	role: text('role', { enum: ['owner', 'admin', 'member', 'viewer'] }).default('member').notNull(),
	status: text('status', { enum: ['pending', 'accepted', 'rejected', 'expired'] }).default('pending').notNull(),
	invitedBy: text('invited_by').notNull(),
	expiresAt: timestamp('expires_at'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

