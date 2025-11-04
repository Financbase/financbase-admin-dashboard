/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import {
	pgTable,
	text,
	timestamp,
	serial,
	boolean as pgBoolean,
	jsonb,
} from "drizzle-orm/pg-core";

export const notifications = pgTable("notifications", {
	id: serial("id").primaryKey(),
	userId: text("user_id").notNull(),
	
	// Notification details
	type: text("type").notNull(),
	category: text("category"),
	priority: text("priority").default("normal"),
	
	// Content
	title: text("title").notNull(),
	message: text("message").notNull(),
	
	// Action and data
	actionUrl: text("action_url"),
	actionLabel: text("action_label"),
	data: jsonb("data"), // Additional data for the notification
	metadata: jsonb("metadata"), // Additional metadata
	
	// Status and timing
	isRead: pgBoolean("read").default(false),
	isArchived: pgBoolean("archived").default(false),
	expiresAt: timestamp("expires_at"),
	
	// Tracking
	readAt: timestamp("read_at"),
	archivedAt: timestamp("archived_at"),
	
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
