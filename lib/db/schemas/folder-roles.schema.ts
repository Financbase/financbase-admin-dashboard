/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { pgTable, uuid, text, timestamp, unique } from 'drizzle-orm/pg-core';

/**
 * Folder Roles Table
 * Stores RBAC role assignments for folders
 */
export const folderRoles = pgTable('folder_roles', {
	id: uuid('id').primaryKey().defaultRandom(),
	folderId: text('folder_id').notNull(),
	role: text('role').notNull(), // RBAC role name (e.g., owner, editor, viewer, commenter)
	assignedBy: text('assigned_by'), // User ID who assigned the role
	assignedAt: timestamp('assigned_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
	// Unique constraint: one role per folder
	folderRoleUnique: unique('folder_roles_folder_role_unique').on(table.folderId, table.role),
}));

export type FolderRole = typeof folderRoles.$inferSelect;
export type NewFolderRole = typeof folderRoles.$inferInsert;

